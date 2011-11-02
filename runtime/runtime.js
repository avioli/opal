var Rt = Op.runtime = {};

/**
  Opal platform - this is overriden in gem context and nodejs context. These
  are the default values used in the browser, `opal-browser'.
*/
var PLATFORM_PLATFORM = "opal";
var PLATFORM_ENGINE   = "opal-browser";
var PLATFORM_VERSION  = "1.9.2";
var PLATFORM_ARGV     = [];

// Minimize js types
var ArrayProto     = Array.prototype,
    ObjectProto    = Object.prototype,

    ArraySlice     = ArrayProto.slice,

    hasOwnProperty = ObjectProto.hasOwnProperty;

/**
  Core runtime classes, objects and literals.
*/
var rb_cBasicObject,  rb_cObject,       rb_cModule,       rb_cClass,
    rb_cNativeObject, rb_mKernel,       rb_cNilClass,     rb_cBoolean,
    rb_cArray,        rb_cNumeric,      rb_cString,       rb_cSymbol,
    rb_cRegexp,       rb_cMatch,        rb_top_self,      Qnil,
    rb_cDir;

/**
  Special objects' prototypes.. saves allocating them each time they
  are needed.
*/
var NilObj;

/**
  Core object type flags. Added as local variables, and onto runtime.
*/
var T_CLASS       = 0x0001,
    T_MODULE      = 0x0002,
    T_OBJECT      = 0x0004,
    T_BOOLEAN     = 0x0008,
    T_STRING      = 0x0010,
    T_ARRAY       = 0x0020,
    T_NUMBER      = 0x0040,
    T_PROC        = 0x0080,
    T_SYMBOL      = 0x0100,
    T_HASH        = 0x0200,
    T_RANGE       = 0x0400,
    T_ICLASS      = 0x0800,
    FL_SINGLETON  = 0x1000;

/**
 * Id for Qnil
 *
 * FIXME: should be dynamic (from NilObj)
 */
var NIL_ID = 13;

/**
 * Gets the hash of the receiver. This checks for bad items, such as nil
 * and immutable objects like strings.
 */
function rb_hash(obj) {
  var id;

  if (obj == null) {
    return NIL_ID;
  }
  else if (id = obj.$id) {
    return id;
  }
  else {
    obj.$id = rb_yield_hash();

    if (id = obj.$id) {
      return id;
    }

    return obj.$flags + obj;
  }
}

/**
  Actually calls method missiing.
*/
var rb_method_missing_caller = function(recv, mid) {
  var args = [recv, "method_missing", mid].concat(ArraySlice.call(arguments, 2));

  var tbl = (recv == null ? NilClassProto.$m : recv.$m);

  return tbl.method_missing.apply(null, args);
};

/**
  Helps +respond_to?+ etc know this is a fake method.
*/
rb_method_missing_caller.$mm = true;

/**
  Symbol table - all created symbols are stored here, symbol id =>
  symbol literal.
*/
var rb_symbol_tbl = {};

/**
  Symbol creation. Checks the symbol table and creates a new symbol
  if one doesnt exist for the given id, otherwise returns existing
  one.

  @param {String} id symbol id
  @return {Symbol}
*/
function rb_intern(id) {
  var sym = rb_symbol_tbl[id];

  if (!sym) {
    sym = new String(id);
    sym.$k = rb_cSymbol;
    sym.$m = rb_cSymbol.$m_tbl;
    rb_symbol_tbl[id] = sym;
  }

  return sym;
};

/**
  stdout
 */
var rb_stdout_buffer = [];

function rb_stdout_write(io, mid, str) {
  // console.log("need to write: " + str);
  rb_stdout_buffer.push(str);
}

function rb_stdout_flush(io, mid) {
  // console.log("stdout: need to flush");
  console.log(rb_stdout_buffer.join(''));
  rb_stdout_buffer = [];
}

function rb_boot_io_puts(io, mid, str) {
  console.log("IO#puts (booting): " + str);
}

/**
  Define methods. Public method for defining a method on the given base.

  @param {Object} klass The base to define method on
  @param {String} name Ruby mid
  @param {Function} body The method implementation
  @return {Qnil}
*/
function rb_define_method(klass, name, body) {
  if (klass.$flags & T_OBJECT) {
    klass = klass.$klass;
  }

  if (!body.$rbName) {
    body.$rbKlass = klass;
    body.$rbName = name;
  }

  rb_define_raw_method(klass, name, body);
  klass.$methods.push(name);

  return Qnil;
};

/**
  Define singleton method.

  @param {Object} base The base to define method on
  @param {String} method_id Method id
  @param {Function} body Method implementation
  @return {Qnil}
*/
function rb_define_singleton_method(base, method_id, body) {
  return rb_define_method(rb_singleton_class(base), method_id, body);
};

/**
  Actually find super impl to call.  Returns null if cannot find it.
*/
function rb_super_find(klass, callee, mid) {
  var cur_method;

  while (klass) {
    if (klass.$method_table[mid]) {
      if (klass.$method_table[mid] == callee) {
        cur_method = klass.$method_table[mid];
        break;
      }
    }
    klass = klass.$super;
  }

  if (!(klass && cur_method)) { return null; }

  klass = klass.$super;

  while (klass) {
    if (klass.$method_table[mid]) {
      return klass.$method_table[mid];
    }

    klass = klass.$super;
  }

  return null;
};

/**
  Exception classes. Some of these are used by runtime so they are here for
  convenience.
*/
var rb_eException,       rb_eStandardError,   rb_eLocalJumpError,  rb_eNameError,
    rb_eNoMethodError,   rb_eArgError,        rb_eScriptError,     rb_eLoadError,
    rb_eRuntimeError,    rb_eTypeError,       rb_eIndexError,      rb_eKeyError,
    rb_eRangeError,      rb_eNotImplementedError;

var rb_eExceptionInstance;

/**
  Standard jump exceptions to save re-creating them everytime they are needed
*/
var rb_eReturnInstance,
    rb_eBreakInstance,
    rb_eNextInstance;

/**
  Ruby return, with the given value. The func is the reference function which
  represents the method that this statement must return from.
*/
Rt.R = function(value, func) {
  rb_eReturnInstance.$value = value;
  rb_eReturnInstance.$func = func;
  throw rb_eReturnInstance;
};

/**
  Get the given constant name from the given base
*/
Rt.cg = function(base, id) {
  // make sure we dont fail if it turns out our base is null or a js obj
  if (base == null || !base.$flags) {
    base = rb_cObject;
  }

  if (base.$flags & T_OBJECT) {
    base = rb_class_real(base.$klass);
  }
  return rb_const_get(base, id);
};

/**
  Set constant from runtime
*/
Rt.cs = function(base, id, val) {
  if (base.$flags & T_OBJECT) {
    base = rb_class_real(base.$klass);
  }
  return rb_const_set(base, id, val);
};

/**
  Get global by id
*/
Rt.gg = function(id) {
  return rb_gvar_get(id);
};

/**
  Set global by id
*/
Rt.gs = function(id, value) {
  return rb_gvar_set(id, value);
};

/**
  Class variables table
*/
var rb_class_variables = {};

Rt.cvg = function(id) {
  var v = rb_class_variables[id];

  if (v) return v;

  return Qnil;
};

Rt.cvs = function(id, val) {
  return rb_class_variables[id] = val;
};

function rb_regexp_match_getter(id) {
  var matched = Rt.X;

  if (matched) {
    if (matched.$md) {
      return matched.$md;
    } else {
      var res = new cMatch.o$a();
      res.$data = matched;
      matched.$md = res;
      return res;
    }
  } else {
    return Qnil;
  }
}

/**
  An array of procs to call for at_exit()

  @param {Function} proc implementation
*/
var rb_end_procs = Rt.end_procs = [];

/**
  Called upon exit: we need to run all of our registered procs
  in reverse order: i.e. call last ones first.

  FIXME: do we need to try/catch this??
*/
Rt.do_at_exit = function() {
  Op.run(function() {
    var proc;

    while (proc = rb_end_procs.pop()) {
      proc(proc.$S, Qnil);
    }

    return null;
  });
};

/**
  Sets the constant value `val` on the given `klass` as `id`.

  @param {RClass} klass
  @param {String} id
  @param {Object} val
  @return {Object} returns the set value
*/
function rb_const_set(klass, id, val) {
  klass.$c[id] = val;
  return val;
}

/**
  Lookup a constant named `id` on the `klass`. This will throw an error if
  the constant cannot be found.

  @param {RClass} klass
  @param {String} id
*/
function rb_const_get(klass, id) {
  if (klass.$c[id]) {
    return (klass.$c[id]);
  }

  var parent = klass.$parent;

  while (parent) {
    if (parent.$c[id] !== undefined) {
      return parent.$c[id];
    }

    parent = parent.$parent;
  }

  rb_raise(rb_eNameError, 'uninitialized constant ' + id);
};

Rt.const_get = rb_const_get;

/**
  Returns true or false depending whether a constant named `id` is defined
  on the receiver `klass`.

  @param {RClass} klass
  @param {String} id
  @return {true, false}
*/
function rb_const_defined(klass, id) {
  if (klass.$c[id]) {
    return true;
  }

  return false;
};

/**
  This table holds all the global variables accessible from ruby.

  Entries are mapped by their global id => an object that contains the
  given keys:

    - name
    - value
    - getter
    - setter
*/
var rb_global_tbl = {};

/**
  Expose global getters to runtime. If no getter, then gvar isnt defined.
*/
var rb_gvar_getters = Rt.gv = {};

/**
  Defines a hooked/global variable.

  @param {String} name The global name (e.g. '$:')
  @param {Function} getter The getter function to return the variable
  @param {Function} setter The setter function used for setting the var
  @return {null}
*/
function rb_define_hooked_variable(name, getter, setter) {
  var entry = {
    "name": name,
    "value": Qnil,
    "getter": getter,
    "setter": setter
  };

  rb_global_tbl[name] = entry;
  rb_gvar_getters[name] = getter;
};

/**
  A default read only getter for a global variable. This will simply throw a
  name error with the given id. This can be used for variables that should
  not be altered.
*/
function rb_gvar_readonly_setter(id, value) {
  rb_raise(rb_eNameError, id + " is a read-only variable");
};

/**
  Retrieve a global variable. This will use the assigned getter.
*/
function rb_gvar_get(id) {
  var entry = rb_global_tbl[id];
  if (!entry) { return Qnil; }
  return entry.getter(id);
};

/**
  Set a global. If not already set, then we assign basic getters and setters.
*/
function rb_gvar_set(id, value) {
  var entry = rb_global_tbl[id];
  if (entry)  { return entry.setter(id, value); }

  rb_define_hooked_variable(id,

    function(id) {
      return rb_global_tbl[id].value;
    },

    function(id, value) {
      return (rb_global_tbl[id].value = value);
    }
  );

  return rb_gvar_set(id, value);
};

/**
  Every object has a unique id. This count is used as the next id for the
  next created object. Therefore, first ruby object has id 0, next has 1 etc.
*/
var rb_hash_yield = 0;

/**
  Yield the next object id, updating the count, and returning it.
*/
function rb_yield_hash() {
  return rb_hash_yield++;
};

var rb_cHash;

/**
  Returns a new hash with values passed from the runtime.
*/
Rt.H = function() {
  var hash = new RObject(rb_cHash), k, v, args = ArraySlice.call(arguments);
  var keys = hash.k = [];
  var assocs = hash.a = {};
  hash.d = Qnil;
  hash.df = Qnil;

  for (var i = 0, ii = args.length; i < ii; i++) {
    k = args[i];
    v = args[i + 1];
    i++;
    keys.push(k);
    assocs[(k == null ? NilClassProto : k).$m.hash(k, 'hash')] = v;
  }

  return hash;
};

var rb_alias_method = Rt.alias_method = function(klass, new_name, old_name) {
  var body = klass.$m_tbl[old_name];

  if (!body) {
    console.log("cannot alias " + new_name + " to " + old_name);
    rb_raise(rb_eNameError, "undefined method `" + old_name + "' for class `" + klass.__classid__ + "'");
  }

  rb_define_raw_method(klass, new_name, body);
  return Qnil;
};

/**
  This does the main work, but does not call runtime methods like
  singleton_method_added etc. define_method does that.

*/
function rb_define_raw_method(klass, name, body) {

  klass.$m_tbl[name] = body;
  klass.$method_table[name] = body;

  var included_in = klass.$included_in, includee;

  if (included_in) {
    for (var i = 0, ii = included_in.length; i < ii; i++) {
      includee = included_in[i];

      rb_define_raw_method(includee, name, body);
    }
  }
};

function rb_define_alias(base, new_name, old_name) {
  rb_define_method(base, new_name, base.$m_tbl[old_name]);
  return Qnil;
};



/**
  Get global by id
*/
Rt.gg = function(id) {
  return rb_gvar_get(id);
};

/**
  Set global by id
*/
Rt.gs = function(id, value) {
  return rb_gvar_set(id, value);
};

function rb_regexp_match_getter(id) {
  var matched = Rt.X;

  if (matched) {
    if (matched.$md) {
      return matched.$md;
    } else {
      var res = new rb_cMatch.o$a();
      res.$data = matched;
      matched.$md = res;
      return res;
    }
  } else {
    return Qnil;
  }
}

var rb_cIO, rb_stdin, rb_stdout, rb_stderr;

function rb_stdio_getter(id) {
  switch (id) {
    case "$stdout":
      return rb_stdout;
    case "$stdin":
      return rb_stdin;
    case "$stderr":
      return rb_stderr;
    default:
      rb_raise(rb_eRuntimeError, "stdout_setter being used for bad variable");
  }
};

function rb_stdio_setter(id, value) {
  rb_raise(rb_eException, "stdio_setter cannot currently set stdio variables");

  switch (id) {
    case "$stdout":
      return rb_stdout = value;
    case "$stdin":
      return rb_stdin = value;
    case "$stderr":
      return rb_stderr = value;
    default:
      rb_raise(rb_eRuntimeError, "stdout_setter being used for bad variable: " + id);
  }
};

var rb_cProc;

/**
  Block passing - holds current block for runtime

  f: function
  p: proc
  y: yield error
*/
var rb_block = Rt.P = function() {
  rb_raise(rb_eLocalJumpError, "no block given");
};

rb_block.$self = Qnil;

/**
  Turns the given proc/function into a lambda. This is useful for the
  Proc#lambda method, but also for blocks that are turned into
  methods, in Module#define_method, for example. Lambdas and methods
  from blocks are the same thing. Lambdas basically wrap the passed
  block function and perform stricter arg checking to make sure the
  right number of args are passed. Procs are liberal in their arg
  checking, and simply turned ommited args into nil. Lambdas and
  methods MUST check args and throw an error if the wrong number are
  given. Also, lambdas/methods must catch return statements as lambdas
  capture returns.

  FIXME: wrap must detect if we are the receiver of a block, and fix
  the block to send it to the proc.

  FIXME: need to be strict on checking proc arity

  FIXME: need to catch return statements which may be thrown.

  @param {Function} proc The proc/function to lambdafy.
  @return {Function} Wrapped lambda function.
*/
function rb_make_lambda(proc) {
  if (proc.$lambda) return proc;

  var wrap = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    return proc.apply(null, args);
  };

  wrap.$lambda = true;
  wrap.o$s = proc.o$s;

  return proc;
};

var rb_cRange;

/**
  Returns a new ruby range. G for ranGe.
*/
Rt.G = function(beg, end, exc) {
  var range = new RObject(rb_cRange);
  range.begin = beg;
  range.end = end;
  range.exclude = exc;
  return range;
};

/**
  Print to console - this is overriden upon init so that it will print to
  stdout
*/
var puts = function(str) {
  console.log(str);
};

