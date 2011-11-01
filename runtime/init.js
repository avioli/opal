
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
  Raise the exception class with the given string message.
*/
function rb_raise(exc, str) {
  if (str === undefined) {
    str = exc;
    exc = rb_eException;
  }

  var exception = exc.$m['new'](exc, "new", str);
  rb_raise_exc(exception);
};

Rt.raise = rb_raise;

/**
  Raise an exception instance (DO NOT pass strings to this)
*/
var rb_raise_exc = Rt.raise = function(exc) {
  throw exc;
};

function rb_prepare_backtrace(error, stack) {
  var code = [], f, b, k;

  for (var i = 0; i < stack.length; i++) {
    f = stack[i];
    b = f.getFunction();

    if (!(k = b.$rbKlass)) {
      continue;
    }

    code.push("from " + f.getFileName() + ":" + f.getLineNumber() + ":in `" + b.$rbName + "'");
  }

  return code;
};

Rt.backtrace = function(err) {
  var old = Error.prepareStackTrace;
  Error.prepareStackTrace = rb_prepare_backtrace;

  var backtrace = err.stack;
  Error.prepareStackTrace = old;

  return backtrace;
};

var rb_backtrace_extra = Rt.awesome_backtrace = function(err) {
  var old = Error.prepareStackTrace;
  Error.prepareStackTrace = rb_prepare_awesome_backtrace;

  var backtrace = err.stack;
  Error.prepareStackTrace = old;

  return backtrace;
};

function rb_prepare_awesome_backtrace(error, stack) {
  var code = [], f, b, k;

  for (var i = 0; i < stack.length; i++) {
    f = stack[i];
    b = f.getFunction();

    if (!(k = b.$rbKlass)) {
      continue;
    }

    if (k.$f & FL_SINGLETON && k .__classname__) {
      k = k.__classname__  + ".";
    } else {
      k = rb_class_real(b.$rbKlass) + "#";
    }

    code.push("from " + k + b.$rbName + " at " + f.getFileName() + ":" + f.getLineNumber());
  }

  return code;
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
  Ruby break statement with the given value. When no break value is needed, nil
  should be passed here. An undefined/null value is not valid and will cause an
  internal error.

  @param {RubyObject} value The break value.
*/
Rt.B = function(value) {
  rb_eBreakInstance.$value = value;
  rb_raise_exc(eBreakInstance);
};

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

/**
  Main init method. This is called once this file has fully loaded. It setups
  all the core objects and classes and required runtime features.
*/
function init() {
  Init_Object();
  Init_VM();

  Rt.Object = rb_cObject;

  rb_cNilClass = rb_define_class('NilClass', rb_cObject);
  Rt.NC = NilObj = new RObject(rb_cNilClass);
  Qnil = null;

  rb_cBoolean = rb_bridge_class(Boolean.prototype, T_OBJECT | T_BOOLEAN, 'Boolean', rb_cObject);

  Init_Array();

  rb_cHash = rb_define_class('Hash', rb_cObject);

  rb_cNumeric = rb_bridge_class(Number.prototype,
    T_OBJECT | T_NUMBER, 'Numeric', rb_cObject);

  Init_String();

  rb_cProc = rb_bridge_class(Function.prototype,
    T_OBJECT | T_PROC, 'Proc', rb_cObject);

  rb_cRange = rb_define_class('Range', rb_cObject);

  rb_cRegexp = rb_bridge_class(RegExp.prototype,
    T_OBJECT, 'Regexp', rb_cObject);

  rb_cMatch = rb_define_class('MatchData', rb_cObject);
  rb_define_hooked_variable('$~', rb_regexp_match_getter, rb_gvar_readonly_setter);

  rb_eException = rb_bridge_class(Error.prototype,
    T_OBJECT, 'Exception', rb_cObject);

  // rb_eException.$a.prototype.toString = function() {
    // return this.$k.__classid__ + ": " + this.message;
  // };

  rb_eStandardError = rb_define_class("StandardError", rb_eException);
  rb_eRuntimeError = rb_define_class("RuntimeError", rb_eException);
  rb_eLocalJumpError = rb_define_class("LocalJumpError", rb_eStandardError);
  rb_eTypeError = rb_define_class("TypeError", rb_eStandardError);

  rb_eNameError = rb_define_class("NameError", rb_eStandardError);
  rb_eNoMethodError = rb_define_class('NoMethodError', rb_eNameError);
  rb_eArgError = rb_define_class('ArgumentError', rb_eStandardError);

  rb_eScriptError = rb_define_class('ScriptError', rb_eException);
  rb_eLoadError = rb_define_class('LoadError', rb_eScriptError);

  rb_eIndexError = rb_define_class("IndexError", rb_eStandardError);
  rb_eKeyError = rb_define_class("KeyError", rb_eIndexError);
  rb_eRangeError = rb_define_class("RangeError", rb_eStandardError);

  rb_eNotImplementedError = rb_define_class("NotImplementedError", rb_eException);

  rb_eBreakInstance = new Error('unexpected break');
  rb_eBreakInstance.$k = rb_eLocalJumpError;
  rb_block.b = rb_eBreakInstance;

  rb_eReturnInstance = new Error('unexpected return');
  rb_eReturnInstance.$k = rb_eLocalJumpError;

  rb_eNextInstance = new Error('unexpected next');
  rb_eNextInstance.$k = rb_eLocalJumpError;

  rb_cIO = rb_define_class('IO', rb_cObject);
  rb_stdin = new RObject(rb_cIO);
  rb_stdout = new RObject(rb_cIO);
  rb_stderr = new RObject(rb_cIO);

  rb_define_singleton_method(rb_stdout, 'write', rb_stdout_write);
  rb_define_singleton_method(rb_stdout, 'flush', rb_stdout_flush);

  rb_define_method(rb_cIO, 'puts', rb_boot_io_puts);

  rb_const_set(rb_cObject, 'STDIN', rb_stdin);
  rb_const_set(rb_cObject, 'STDOUT', rb_stdout);
  rb_const_set(rb_cObject, 'STDERR', rb_stderr);

  rb_define_hooked_variable('$stdin', rb_stdio_getter, rb_stdio_setter);
  rb_define_hooked_variable('$stdout', rb_stdio_getter, rb_stdio_setter);
  rb_define_hooked_variable('$stderr', rb_stdio_getter, rb_stdio_setter);

  rb_define_hooked_variable('$:', rb_load_path_getter, rb_gvar_readonly_setter);
  rb_define_hooked_variable('$LOAD_PATH', rb_load_path_getter, rb_gvar_readonly_setter);

  Op.loader = new Loader(Op);
  Op.cache = {};

  rb_const_set(rb_cObject, 'RUBY_ENGINE', PLATFORM_ENGINE);
  rb_const_set(rb_cObject, 'RUBY_PLATFORM', PLATFORM_PLATFORM);
  rb_const_set(rb_cObject, 'RUBY_VERSION', PLATFORM_VERSION);
  rb_const_set(rb_cObject, 'ARGV', PLATFORM_ARGV);

  // only load corelib if defined (in browser). Corelib is loaded seperately
  // in gem session.
  if (typeof(core_lib) !== 'undefined') {
    core_lib(opal.runtime, opal.runtime.top, '(corelib)');
  }
};

