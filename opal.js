/*!
 * opal v0.3.11
 * http://opalscript.org
 *
 * Copyright 2011, Adam Beynon
 * Released under the MIT license
 */
opal = {};

(function(undefined) {

// So we can minimize
var Op = opal;

/**
  All methods and properties available to ruby/js sources at runtime. These
  are kept in their own namespace to keep the opal namespace clean.
*/
var Rt = Op.runtime = {};

Rt.opal = Op;

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
var rb_cBasirb_cObject,     rb_cObject,          rb_cModule,          rb_cClass,
    rb_mKernel,          rb_cNilClass,        rb_cBoolean,
    rb_cArray,           rb_cNumeric,
    rb_cRegexp,          rb_cMatch,           rb_top_self,            Qnil,

    rb_cDir;

/**
  Core object type flags. Added as local variables, and onto runtime.
*/
var T_CLASS       = 1,
    T_MODULE      = 2,
    T_OBJECT      = 4,
    T_BOOLEAN     = 8,
    T_STRING      = 16,
    T_ARRAY       = 32,
    T_NUMBER      = 64,
    T_PROC        = 128,
    T_SYMBOL      = 256,
    T_HASH        = 512,
    T_RANGE       = 1024,
    T_ICLASS      = 2056,
    FL_SINGLETON  = 4112;

/**
  Define classes. This is the public API for defining classes, shift classes
  and modules.

  @param {RubyObject} base
  @param {RClass} super_class
  @param {String} id
  @param {Function} body
  @param {Number} flag
*/
Rt.dc = function(base, super_class, id, body, flag) {
  var klass;

  switch (flag) {
    case 0:
      if (base.$f & T_OBJECT) {
        base = rb_class_real(base.$k);
      }

      if (super_class == Qnil) {
        super_class = rb_cObject;
      }

      klass = rb_define_class_under(base, id, super_class);
      break;

    case 1:
      klass = rb_singleton_class(base);
      break;

    case 2:
      if (base.$f & T_OBJECT) {
        base = rb_class_real(base.$k);
      }
      klass = rb_define_module_under(base, id);
      break;

    default:
      rb_raise(rb_eException, "define_class got a unknown flag " + flag);
  }

  var res = body(klass);

  return res;
};

/**
  Dynamic method invocation. This is used for calling dynamic methods,
  usually in debug mode. It will call method_missing if the given method
  is not present on the receiver.

  Note: mid includes 'm$' as a prefix, so it is not needed to add to the
  method name. It needs to be removed before calling method missing.

  The rest of the args are addition parameters for the method.

  @param [Object] recv the receiver to call
  @param [String] mid the method id to call (with 'm$')
  @return [Object] method result.
*/
Rt.sm = function(recv, mid) {
  var method = recv[mid];

  if (method) {
    return method.apply(recv, ArraySlice.call(arguments, 2));
  }

  var missing = recv['m$method_missing'];

  if (missing) {
    return missing.apply(recv, [mid.substr(2)].concat(ArraySlice.call(arguments, 2)));
  }

  throw new Error("Cannot call method missing: " + mid);
};

/**
  Regexp object. This holds the results of last regexp match.
  X for regeXp.
*/
Rt.X = null;

/**
  Undefine methods
*/
Rt.um = function(kls) {
  var args = [].slice.call(arguments, 1);

  for (var i = 0, ii = args.length; i < ii; i++) {
    (function(mid) {
      var func = function() {
        rb_raise(rb_eNoMethodError, "undefined method `" + mid + "' for " + this.m$inspect());
      };

      kls.o$a.prototype['m$' + mid] = func;

    })(args[i].m$to_s());
  }

  return Qnil;
};

/**
  Define methods. Public method for defining a method on the given base.

  @param {Object} klass The base to define method on
  @param {String} name Ruby mid
  @param {Function} body The method implementation
  @param {Number} arity Method arity
  @return {Qnil}
*/
Rt.dm = function(klass, name, body, arity) {
  if (klass.$f & T_OBJECT) {
    klass = klass.$k;
  }

  if (!body.$rbName) {
    body.$rbName = name;
    body.$arity = arity;
  }

  rb_define_raw_method(klass, 'm$' + name, body);
  klass.$methods.push(name);

  return Qnil;
};

/**
  Define singleton method.

  @param {Object} base The base to define method on
  @param {String} method_id Method id
  @param {Function} body Method implementation
  @param {Number} arity Method arity
  @return {Qnil}
*/
Rt.ds = function(base, method_id, body, arity) {
  return Rt.dm(rb_singleton_class(base), method_id, body);
};

/**
  Call a super method.

  callee is the function that actually called super(). We use this to find
  the right place in the tree to find the method that actually called super.
  This is actually done in super_find.
*/
Rt.S = function(callee, self, args) {
  var mid = 'm$' + callee.$rbName;
  var func = rb_super_find(self.$k, callee, mid);

  if (!func) {
    rb_raise(rb_eNoMethodError, "super: no super class method `" + mid + "`" +
      " for " + self.m$inspect());
  }

  // var args_to_send = [self].concat(args);
  var args_to_send = [].concat(args);
  return func.apply(self, args_to_send);
};

/**
  Actually find super impl to call.  Returns null if cannot find it.
*/
function rb_super_find(klass, callee, mid) {
  var cur_method;

  while (klass) {
    if (klass.$m[mid]) {
      if (klass.$m[mid] == callee) {
        cur_method = klass.$m[mid];
        break;
      }
    }
    klass = klass.$s;
  }

  if (!(klass && cur_method)) { return null; }

  klass = klass.$s;

  while (klass) {
    if (klass.$m[mid]) {
      return klass.$m[mid];
    }

    klass = klass.$s;
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
    rb_eRangeError;

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
  rb_raise_exc(rb_eBreakInstance);
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
  Get the given constant name from the given base
*/
Rt.cg = function(base, id) {
  if (base.$f & T_OBJECT) {
    base = rb_class_real(base.$k);
  }
  return rb_const_get(base, id);
};

/**
  Set constant from runtime
*/
Rt.cs = function(base, id, val) {
  if (base.$f & T_OBJECT) {
    base = rb_class_real(base.$k);
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
var rb_end_procs = [];

/**
  Called upon exit: we need to run all of our registered procs
  in reverse order: i.e. call last ones first.

  FIXME: do we need to try/catch this??
*/
Rt.do_at_exit = function() {
  var proc;

  while (proc = rb_end_procs.pop()) {
    proc.call(proc.$self);
  }

  return null;
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
  var hash = new rb_cHash.$a(), k, v, args = Array.prototype.slice.call(arguments);
  var keys = hash.k = [];
  var assocs = hash.a = {};
  hash.d = Qnil;

  for (var i = 0, ii = args.length; i < ii; i++) {
    k = args[i];
    v = args[i + 1];
    i++;
    keys.push(k);
    assocs[k.$h()] = v;
  }

  return hash;
};

var rb_alias_method = Rt.alias_method = function(klass, new_name, old_name) {
  var body = klass.$a.prototype['m$' + old_name];

  if (!body) {
    rb_raise(rb_eNameError, "undefined method `" + old_name + "' for class `" + klass.__classid__ + "'");
  }

  rb_define_raw_method(klass, 'm$' + new_name, body);
  return Qnil;
};

/**
  This does the main work, but does not call runtime methods like
  singleton_method_added etc. define_method does that.

*/
function rb_define_raw_method(klass, name, body) {

  klass.$a.prototype[name] = body;
  klass.$m[name] = body;

  var included_in = klass.$included_in, includee;

  if (included_in) {
    for (var i = 0, ii = included_in.length; i < ii; i++) {
      includee = included_in[i];

      rb_define_raw_method(includee, name, body);
    }
  }

  // This class is toll free bridged, so add method to native
  // prototype as well
  if (klass.$bridge_prototype) {
    klass.$bridge_prototype[name] = body;
  }

  // If we are dealing with Object, then we need to donate to
  // all of our bridged prototypes as well.
  if (klass === rb_cObject) {
    var bridged = rb_bridged_classes;

    for (var i = 0, ii = bridged.length; i < ii; i++) {
      // do not overwrite bridged methods' implementation
      if (!bridged[i][name]) {
        bridged[i][name] = body;
      }
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

  var exception = exc.m$new(str);
  rb_raise_exc(exception);
};

Rt.raise = rb_raise;

/**
  Raise an exception instance (DO NOT pass strings to this)
*/
function rb_raise_exc(exc) {
  throw exc;
};

var rb_cString;


/**
  Exception classes. Some of these are used by runtime so they are here for
  convenience.
*/
var rb_eException,       rb_eStandardError,   rb_eLocalJumpError,  rb_eNameError,
    rb_eNoMethodError,   rb_eArgError,        rb_eScriptError,     rb_eLoadError,
    rb_eRuntimeError,    rb_eTypeError,       rb_eIndexError,      rb_eKeyError,
    rb_eRangeError;

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
var rb_block = Rt.P = {
  f: null,
  p: null,
  y: function() {
    rb_raise(rb_eLocalJumpError, "no block given");
  }
};

rb_block.y.$self = rb_block.y;

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
  var range = rb_obj_alloc(cRange);
  range.beg = beg;
  range.end = end;
  range.exc = exc;
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
  var metaclass;

  // The *instances* of core objects..
  rb_boot_Object = rb_boot_defclass('Object');
  rb_boot_Module = rb_boot_defclass('Module', rb_boot_Object);
  rb_boot_Class  = rb_boot_defclass('Class', rb_boot_Module);

  // The *classes* of core objects..
  rb_cObject = rb_boot_makemeta('Object', rb_boot_Object, rb_boot_Class);
  rb_cModule = rb_boot_makemeta('Module', rb_boot_Module, rb_cObject.constructor);
  rb_cClass  = rb_boot_makemeta('Class', rb_boot_Class, rb_cModule.constructor);

  rb_boot_defmetameta(rb_cObject, rb_cClass);
  rb_boot_defmetameta(rb_cModule, rb_cClass);
  rb_boot_defmetameta(rb_cClass, rb_cClass);

  // fix superclasses..
  rb_cObject.$s = null;
  rb_cModule.$s = rb_cObject;
  rb_cClass.$s  = rb_cModule;

  rb_const_set(rb_cObject, 'Object', rb_cObject);
  rb_const_set(rb_cObject, 'Module', rb_cModule);
  rb_const_set(rb_cObject, 'Class', rb_cClass);

  rb_mKernel      = rb_define_module('Kernel');

  rb_top_self     = new rb_cObject.$a();
  Rt.top          = rb_top_self;

  rb_cNilClass = rb_define_class('NilClass', rb_cObject);
  Rt.Qnil = Qnil = new rb_cNilClass.$a();
  Qnil.toString = function() {
    return "nil";
  };

  rb_cBoolean = rb_bridge_class(Boolean.prototype, T_OBJECT, 'Boolean', rb_cObject);

  rb_cArray = rb_bridge_class(Array.prototype, T_OBJECT | T_ARRAY, 'Array', rb_cObject);
  // array instances all get standard properties for subclasses to work
  var ary_proto = Array.prototype, ary_inst = rb_cArray.$a.prototype;
  ary_inst.$f      = T_ARRAY | T_OBJECT;
  ary_inst.push    = ary_proto.push;
  ary_inst.pop     = ary_proto.pop;
  ary_inst.slice   = ary_proto.slice;
  ary_inst.splice  = ary_proto.splice;
  ary_inst.concat  = ary_proto.concat;
  ary_inst.shift   = ary_proto.shift;
  ary_inst.unshift = ary_proto.unshift;
  ary_inst.length  = 0;

  rb_cHash = rb_define_class('Hash', rb_cObject);

  rb_cNumeric = rb_bridge_class(Number.prototype,
    T_OBJECT | T_NUMBER, 'Numeric', rb_cObject);

  rb_cString = rb_bridge_class(String.prototype,
    T_OBJECT | T_STRING, 'String', rb_cObject);

  rb_cProc = rb_bridge_class(Function.prototype,
    T_OBJECT | T_PROC, 'Proc', rb_cObject);

  rb_cRange = rb_define_class('Range', rb_cObject);

  rb_cRegexp = rb_bridge_class(RegExp.prototype,
    T_OBJECT, 'Regexp', rb_cObject);

  rb_cMatch = rb_define_class('MatchData', rb_cObject);
  rb_define_hooked_variable('$~', rb_regexp_match_getter, rb_gvar_readonly_setter);

  rb_eException = rb_bridge_class(Error.prototype,
    T_OBJECT, 'Exception', rb_cObject);

  rb_eException.$a.prototype.toString = function() {
    return this.$k.__classid__ + ": " + this.message;
  };

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

  rb_eBreakInstance = new Error('unexpected break');
  rb_eBreakInstance.$k = rb_eLocalJumpError;
  rb_block.b = rb_eBreakInstance;

  rb_eReturnInstance = new Error('unexpected return');
  rb_eReturnInstance.$k = rb_eLocalJumpError;

  rb_eNextInstance = new Error('unexpected next');
  rb_eNextInstance.$k = rb_eLocalJumpError;

  rb_cIO = rb_define_class('IO', rb_cObject);
  rb_stdin = new rb_cIO.$a();
  rb_stdout = new rb_cIO.$a();
  rb_stderr = new rb_cIO.$a();

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

  Op.run(core_lib);

  puts = function(str) {
    rb_stdout.m$puts(str);
  };
};

/**
  Root of all objects and classes inside opalscript, except for
  native toll free bridges.
*/
var rb_boot_root = function() {};

/**
  Returns the hash value for the receiver. By default on regular
  objects this is just the objects' id
*/
rb_boot_root.$h = function() {
  return this.$id;
};

/**
  To benefit javascript debug consoles, the toString of any ruby
  object is its' #inspect method.
*/
rb_boot_root.toString = function() {
  return this.m$inspect();
};

/**
  Boot a base class. This is only used for the very core ruby
  objects and classes (Object, Module, Class). This returns
  what will be the actual instances of our root classes.

  @param {String} id The class id
  @param {RubyClass} superklass The super
*/
function rb_boot_defclass(id, superklass) {
  var cls = function() {
    this.$id = rb_yield_hash();
    return this;
  };

  if (superklass) {
    var ctor = function() {};
    ctor.prototype = superklass.prototype;
    cls.prototype = new ctor();
  }
  else {
    cls.prototype = new rb_boot_root();
  }

  cls.prototype.constructor = cls;
  cls.prototype.$f = T_OBJECT;

  cls.prototype.$h = function() {
    return this.$id;
  };

  return cls;
};

/**
  Make the actual (meta) classes: Object, Class, Module.

  @param {String} id The class id
  @param {RubyClass} klass The class of the result
  @param {RubyClass} superklass The superklass
*/
function rb_boot_makemeta(id, klass, superklass) {
  var meta = function() {
    this.$id = rb_yield_hash();
    return this;
  };

  var ctor = function() {};
  ctor.prototype = superklass.prototype;
  meta.prototype = new ctor();

  var proto = meta.prototype;
  proto.$included_in = [];
  proto.$m           = {};
  proto.$methods     = [];

  proto.$a           = klass;
  proto.$f           = T_CLASS;
  proto.__classid__  = id;
  proto.$s           = superklass;
  proto.constructor  = meta;

  // constants
  if (superklass.prototype.$constants_alloc) {
    proto.$c = new superklass.prototype.$constants_alloc();
    proto.$constants_alloc = function() {};
    proto.$constants_alloc.prototype = proto.$c;
  }
  else {
    proto.$constants_alloc = function() {};
    proto.$c = proto.$constants_alloc.prototype;
  }

  var result = new meta();
  klass.prototype.$k = result;
  return result;
};

/**
  Fixes the class of boot classes to their meta.
*/
function rb_boot_defmetameta(klass, meta) {
  klass.$k = meta;
};

/**
  Boot class

  @param {RubyClass} superklass Class to inherit from
*/
function rb_class_boot(superklass) {
  // instances
  var cls = function() {
    this.$id = rb_yield_hash();
    return this;
  };

  var ctor = function() {};
  ctor.prototype = superklass.$a.prototype;
  cls.prototype = new ctor();

  var proto = cls.prototype;
  proto.constructor = cls;
  proto.$f = T_OBJECT;

  // class itself
  var meta = function() {
    this.$id = rb_yield_hash();
    return this;
  };

  var mtor = function() {};
  mtor.prototype = superklass.constructor.prototype;
  meta.prototype = new mtor();

  proto = meta.prototype;
  proto.$a = cls;
  proto.$f = T_CLASS;
  proto.$m = {};
  proto.$methods = [];
  proto.constructor = meta;
  proto.$s = superklass;

  // constants
  proto.$c = new superklass.$constants_alloc();
  proto.$constants_alloc = function() {};
  proto.$constants_alloc.prototype = proto.$c;

  var result = new meta();
  cls.prototype.$k = result;
  return result;
};

/**
  Get actual class ignoring singleton classes and iclasses.
*/
function rb_class_real(klass) {
  while (klass.$f & FL_SINGLETON) { klass = klass.$s; }
  return klass;
};

/**
  Name the class with the given id.
*/
function rb_name_class(klass, id) {
  klass.__classid__ = id;
};

/**
  Make metaclass for the given class
*/
function rb_make_metaclass(klass, super_class) {
  if (klass.$f & T_CLASS) {
    if ((klass.$f & T_CLASS) && (klass.$f & FL_SINGLETON)) {
      return rb_make_metametaclass(klass);
    }
    else {
      // FIXME this needs fixinfg to remove hacked stuff now in make_singleton_class
      var meta = rb_class_boot(super_class);
      // remove this??!
      meta.$a.prototype = klass.constructor.prototype;
      meta.$c = meta.$k.$c_prototype;
      meta.$f |= FL_SINGLETON;
      meta.__classid__ = "#<Class:" + klass.__classid__ + ">";
      klass.$k = meta;
      meta.$c = klass.$c;
      rb_singleton_class_attached(meta, klass);
      // console.log("meta id: " + klass.__classid__);
      return meta;
    }
  } else {
    // if we want metaclass of an object, do this
    return rb_make_singleton_class(klass);
  }
};

function rb_make_singleton_class(obj) {
  var orig_class = obj.$k;
  var klass = rb_class_boot(orig_class);

  klass.$f |= FL_SINGLETON;

  obj.$k = klass;

  // make methods we define here actually point to instance
  // FIXME: we could just take advantage of $bridge_prototype like we
  // use for bridged classes?? means we can make more instances...
  klass.$bridge_prototype = obj;

  rb_singleton_class_attached(klass, obj);

  klass.$k = rb_class_real(orig_class).$k;
  klass.__classid__ = "#<Class:#<" + orig_class.__classid__ + ":" + klass.$id + ">>";

  return klass;
};

function rb_singleton_class_attached(klass, obj) {
  if (klass.$f & FL_SINGLETON) {
    klass.__attached__ = obj;
  }
};

function rb_make_metametaclass(metaclass) {
  var metametaclass, super_of_metaclass;

  if (metaclass.$k == metaclass) {
    metametaclass = rb_class_boot(null);
    metametaclass.$k = metametaclass;
  }
  else {
    metametaclass = rb_class_boot(null);
    metametaclass.$k = metaclass.$k.$k == metaclass.$k
      ? rb_make_metametaclass(metaclass.$k)
      : metaclass.$k.$k;
  }

  metametaclass.$f |= FL_SINGLETON;

  rb_singleton_class_attached(metametaclass, metaclass);
  rb_metaclass.$k = metametaclass;
  metaclass.$m = metametaclass.$m_tbl;
  super_of_metaclass = metaclass.$s;

  metametaclass.$s = super_of_metaclass.$k.__attached__
    == super_of_metaclass
    ? super_of_metaclass.$k
    : rb_make_metametaclass(super_of_metaclass);

  return metametaclass;
};

function rb_boot_defmetametaclass(klass, metametaclass) {
  klass.$k.$k = metametaclass;
};

// Holds an array of all prototypes that are bridged. Any method defined on
// Object in ruby will also be added to the bridge classes.
var rb_bridged_classes = [];

/**
  Define toll free bridged class
*/
function rb_bridge_class(prototype, flags, id, super_class) {
  var klass = rb_define_class(id, super_class);

  klass.$bridge_prototype = prototype;
  rb_bridged_classes.push(prototype);

  prototype.$k = klass;
  prototype.$m = klass.$m_tbl;
  prototype.$f = flags;
  prototype.$r = true;

  prototype.$h = function() { return flags + '_' + this; };

  return klass;
};

// make native prototype from class
function rb_native_prototype(cls, proto) {
  var sup = cls.$s;

  if (sup != rb_cObject) {
    rb_raise(rb_eRuntimeError, "native_error must be used on subclass of Object only");
  }

  proto.$k = cls;
  proto.$f = T_OBJECT;

  proto.$h = function() { return this.$id || (this.$id = rb_yield_hash()); };

  return cls;
}

/**
  Define a new class (normal way), with the given id and superclass. Will be
  top level.
*/
function rb_define_class(id, super_klass) {
  return rb_define_class_under(rb_cObject, id, super_klass);
};

function rb_define_class_under(base, id, super_klass) {
  var klass;

  if (rb_const_defined(base, id)) {
    klass = rb_const_get(base, id);

    if (!(klass.$f & T_CLASS)) {
      rb_raise(rb_eException, id + " is not a class");
    }

    if (klass.$s != super_klass && super_klass != rb_cObject) {
      rb_raise(rb_eException, "Wrong superclass given for " + id);
    }

    return klass;
  }

  klass = rb_define_class_id(id, super_klass);

  if (base == rb_cObject) {
    rb_name_class(klass, id);
  } else {
    rb_name_class(klass, base.__classid__ + '::' + id);
  }

  rb_const_set(base, id, klass);
  klass.$parent = base;

  // Class#inherited hook - here is a good place to call. We check method
  // is actually defined first (incase we are calling it during boot). We
  // can't do this earlier as an error will cause constant names not to be
  // set etc (this is the last place before returning back to scope).
  if (super_klass.m$inherited) {
    super_klass.m$inherited(klass);
  }

  return klass;
};

/**
  Actually create class
*/
function rb_define_class_id(id, super_klass) {
  var klass;

  if (!super_klass) {
    super_klass = rb_cObject;
  }
  klass = rb_class_create(super_klass);
  rb_name_class(klass, id);
  rb_make_metaclass(klass, super_klass.$k);

  return klass;
};

function rb_class_create(super_klass) {
  return rb_class_boot(super_klass);
};

/**
  Get singleton class of obj
*/
function rb_singleton_class(obj) {
  var klass;

  if (obj.$f & T_OBJECT) {
    if ((obj.$f & T_NUMBER) || (obj.$f & T_SYMBOL)) {
      rb_raise(rb_eTypeError, "can't define singleton");
    }
  }

  if ((obj.$k.$f & FL_SINGLETON) && obj.$k.__attached__ == obj) {
    klass = obj.$k;
  }
  else {
    var class_id = obj.$k.__classid__;
    klass = rb_make_metaclass(obj, obj.$k);
  }

  return klass;
};


/**
  Define a top level module with the given id
*/
function rb_define_module(id) {
  return rb_define_module_under(rb_cObject, id);
};

function rb_define_module_under(base, id) {
  var module;

  if (rb_const_defined(base, id)) {
    module = rb_const_get(base, id);
    if (module.$f & T_MODULE) {
      return module;
    }

    rb_raise(rb_eException, id + " is not a module");
  }

  module = rb_define_module_id(id);

  if (base == rb_cObject) {
    rb_name_class(module, id);
  } else {
    rb_name_class(module, base.__classid__ + '::' + id);
  }

  rb_const_set(base, id, module);
  module.$parent = base;
  return module;
};

function rb_define_module_id(id) {
  var module = rb_class_create(rb_cModule);
  rb_make_metaclass(module, rb_cModule);

  module.$f = T_MODULE;
  module.$included_in = [];
  return module;
};

function rb_mod_create() {
  return rb_class_boot(rb_cModule);
};

function rb_include_module(klass, module) {

  if (!klass.$included_modules) {
    klass.$included_modules = [];
  }

  if (klass.$included_modules.indexOf(module) != -1) {
    return;
  }
  klass.$included_modules.push(module);

  if (!module.$included_in) {
    module.$included_in = [];
  }

  module.$included_in.push(klass);

  for (var method in module.$m) {
    if (hasOwnProperty.call(module.$m, method)) {
      rb_define_raw_method(klass, method,
                        module.$a.prototype[method]);
    }
  }

  // for (var constant in module.$c) {
    // if (hasOwnProperty.call(module.$c, constant)) {
      // const_set(klass, constant, module.$c[constant]);
    // }
  // }
};

function rb_extend_module(klass, module) {
  if (!klass.$extended_modules) {
    klass.$extended_modules = [];
  }

  if (klass.$extended_modules.indexOf(module) != -1) {
    return;
  }
  klass.$extended_modules.push(module);

  if (!module.$extended_in) {
    module.$extended_in = [];
  }

  module.$extended_in.push(klass);

  var meta = klass.$k;

  for (var method in module.o$m) {
    if (hasOwnProperty.call(module.o$m, method)) {
      rb_define_raw_method(meta, method,
                        module.o$a.prototype[method]);
    }
  }
};

// ..........................................................
// FILE SYSTEM
//

/**
  FileSystem namespace. Overiden in gem and node.js contexts
*/
var Fs = Op.fs = {};

/**
 RegExp for splitting filenames into their dirname, basename and ext.
 This currently only supports unix style filenames as this is what is
 used internally when running in the browser.
*/
var PATH_RE = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

/**
  Holds the current cwd for the application.

  @type {String}
*/
Fs.cwd = '/';

/**
  Join the given args using the default separator. The returned path
  is not expanded.

  @param {String} parts
  @return {String}
*/
function fs_join(parts) {
  parts = [].slice.call(arguments, 0);
  return parts.join('/');
}

/**
  Normalize the given path by removing '..' and '.' parts etc.

  @param {String} path Path to normalize
  @param {String} base Optional base to normalize with
  @return {String}
*/
function fs_expand_path(path, base) {
  if (!base) {
    if (path.charAt(0) !== '/') {
      base = Fs.cwd;
    }
    else {
      base = '';
    }
  }

  path = fs_join(base, path);

  var parts = path.split('/'), result = [], part;

  // initial /
  if (parts[0] === '') result.push('');

  for (var i = 0, ii = parts.length; i < ii; i++) {
    part = parts[i];

    if (part == '..') {
      result.pop();
    }
    else if (part == '.' || part == '') {

    }
    else {
      result.push(part);
    }
  }

  return result.join('/');
}

/**
  Return all of the path components except the last one.

  @param {String} path
  @return {String}
*/
var fs_dirname = Fs.dirname = function(path) {
  var dirname = PATH_RE.exec(path)[1];

  if (!dirname) return '.';
  else if (dirname === '/') return dirname;
  else return dirname.substring(0, dirname.length - 1);
};

/**
  Returns the file extension of the given `file_name`.

  @param {String} file_name
  @return {String}
*/
Fs.extname = function(file_name) {
  var extname = PATH_RE.exec(file_name)[3];

  if (!extname || extname === '.') return '';
  else return extname;
};

Fs.exist_p = function(path) {
  return Op.loader.factories[fs_expand_path(path)] ? true : false;
};

/**
  Glob
*/
Fs.glob = function() {
  var globs = [].slice.call(arguments);

  var result = [], files = opal.loader.factories;

  for (var i = 0, ii = globs.length; i < ii; i++) {
    var glob = globs[i];

    var re = fs_glob_to_regexp(glob);
    // console.log("glob: " + glob);
    // console.log("re  : " + re);

    for (var file in files) {
      if (re.exec(file)) {
        result.push(file);
      }
    }
  }

  return result;
};

/**
  Turns a glob string into a regexp
*/
function fs_glob_to_regexp(glob) {
  if (typeof glob !== 'string') {
    raise(eException, "file_glob_to_regexp: glob must be a string");
  }

  // make sure absolute
  glob = fs_expand_path(glob);
  // console.log("full glob is: " + glob);
  
  var parts = glob.split(''), length = parts.length, result = '';

  var opt_group_stack = 0;

  for (var i = 0; i < length; i++) {
    var cur = parts[i];

    switch (cur) {
      case '*':
        if (parts[i + 1] == '*') {
          result += '.*';
          i++;
        }
        else {
          result += '[^/]*';
        }
        break;

      case '.':
        result += '\\';
        result += cur;
        break;

      case ',':
        if (opt_group_stack) {
          result += '|';
        }
        else {
          result += ',';
        }
        break;

      case '{':
        result += '(';
        opt_group_stack++;
        break;

      case '}':
        if (opt_group_stack) {
          result += ')';
          opt_group_stack--;
        }
        else {
          result += '}'
        }
        break;

      default:
        result += cur;
    }
  }

  return new RegExp('^' + result + '$');
};


/**
  Valid file extensions opal can load/run
*/
var load_extensions = {};

load_extensions['.js'] = function(loader, path) {
  var source = loader.file_contents(path);
  return load_execute_file(loader, source, path);
};

load_extensions['.rb'] = function(loader, path) {
  var source = loader.ruby_file_contents(path);
  return load_execute_file(loader, source, path);
};

/**
  Require a file by its given lib path/id, or a full path.

  @param {String} id lib path/name
  @return {Boolean}
*/
var rb_require = Op.require = function(lib) {
  var resolved = Op.loader.resolve_lib(lib);
  var cached = Op.cache[resolved];

  // If we have a cache for this require then it has already been
  // required. We return false to indicate this.
  if (cached) return false;

  Op.cache[resolved] = true;

  // try/catch wrap entire file load?
  load_file(Op.loader, resolved);

  return true;
};

/**
  Sets the primary 'gem', by name, so we know which cwd to use etc.
  This can be changed at anytime, but it is only really recomended
  before the application is run.

  Also, if a gem with the given name cannot be found, then an error
  will/should be thrown.

  @param {String} name The root gem name to use
*/
Op.primary = function(name) {
  Fs.cwd = '/' + name;
};

/**
  Just go ahead and run the given block of code. The passed function
  should rake the usual runtime, self and file variables which it will
  be passed.

  @param {Function} body
*/
Op.run = function(body) {
  var res = Qnil;

  if (typeof body != 'function') {
    rb_raise(rb_eException, "Expected body to be a function");
  }

  try {
    res = body(Rt, rb_top_self, "(opal)");
  }
  catch (err) {
    console.log(err.$k.__classid__ + ": " + err.message);
    console.log("\t(no stack trace available)");
  }
  return res;
};

/**
  Register a simple lib file. This file is simply just put into the lib
  "directory" so it is ready to load"

  @param {String} name The lib/gem name
  @param {String, Function} info
*/
Op.lib = function(name, info) {
  // make sure name if useful
  if (typeof name !== 'string') {
    rb_raise(rb_eException, "Cannot register a lib without a proper name");
  }

  // make sure info is useful
  if (typeof info === 'string' || typeof info === 'function') {
    return load_register_lib(name, info);
  }

  // something went wrong..
  rb_raise(rb_eException, "Invalid lib data for: " + name);
};

/**
  External api for defining a gem. This takes an object that defines all
  the gem info and files.

  @param {Object} info gem info
*/
Op.gem = function(info) {
  if (typeof info === 'object') {
    load_register_gem(info);
  }
  else {
    rb_raise(rb_eException, "Invalid gem data");
  }
};

/**
  Actually register a predefined gem. This is for the browser context
  where gem can be serialized into JSON and defined before hand.

  @param {Object} info Serialized gemspec
*/
function load_register_gem(info) {
  var factories = Op.loader.factories,
      paths     = Op.loader.paths,
      name      = info.name;

  // register all lib files
  var libs = info.libs || {};

  // root dir for gem is '/gem_name'
  var root_dir = '/' + name;

  var lib_dir = root_dir;

  // add lib dir to paths
  paths.unshift(fs_expand_path(fs_join(root_dir, lib_dir)));

  for (var lib in libs) {
    if (hasOwnProperty.call(libs, lib)) {
      var file_path = lib_dir + '/lib/' + lib + '.rb';
      Op.loader.factories[file_path] = libs[lib];
      Op.loader.libs[lib] = file_path;
    }
  }

  // register other info? (version etc??)
}

/**
  Register a single lib/file in browser before its needed. These libs
  are added to top level dir '/lib_name.rb'

  @param {String} name Lib name
  @param {Function, String} factory
*/
function load_register_lib(name, factory) {
  var path = '/lib/' + name + '.rb';
  Op.loader.factories[path] = factory;
  Op.loader.libs[name] = path;
}

/**
  The loader is the core machinery used for loading and executing libs
  within opal. An instance of opal will have a `.loader` property which
  is an instance of this Loader class. A Loader is responsible for
  finding, opening and reading contents of libs on disk. Within the
  browser a loader may use XHR requests or cached libs defined by JSON
  to load required libs/gems.

  @constructor
  @param {opal} opal Opal instance to use
*/
function Loader(opal) {
  this.opal = opal;
  this.paths = ['', '/lib'];
  this.factories = {};
  this.libs = {};
  return this;
}

// For minimizing
var Lp = Loader.prototype;

/**
  The paths property is an array of disk paths in which to search for
  required modules. In the browser this functionality isn't really used.

  This array is created within the constructor method for uniqueness
  between instances for correct sandboxing.
*/
Lp.paths = null;

/**
  factories of registered gems, paths => function/string. This is
  generic, but in reality only the browser uses this, and it is treated
  as the mini filesystem. Not just factories can go here, anything can!
  Images, text, json, whatever.
*/
Lp.factories = {};

/**
  Resolves the path to the lib, which can then be used to load. This
  will throw an error if the module cannot be found. If this method
  returns a successful path, then subsequent methods can assume that
  the path exists.

  @param {String} lib The lib name/path to look for
  @return {String}
*/
Lp.resolve_lib = function(lib) {
  var resolved = this.find_lib(lib, this.paths);

  if (!resolved) {
    rb_raise(rb_eLoadError, "no such file to load -- " + lib);
  }

  return resolved;
};

Lp.find_lib = function(id) {
  var libs = this.libs;

  // try to load a lib path first - i.e. something in our load path
  if (libs[id]) {
    return libs[id];
  }

  // go through full paths..

  // next, incase our require() has a ruby extension..
  if (id.lastIndexOf('.rb') === id.length - 3) {
    var no_ext = id.substr(0, id.length - 3);
    if (libs[no_ext]) {
      return libs[no_ext];
    }
    // if not..
    // return null;
  }

  return null;
};

/**
  Valid factory format for use in require();
*/
Lp.valid_extensions = ['.js', '.rb'];

/**
  Get lib contents for js files
*/
Lp.file_contents = function(path) {
  return this.factories[path];
};

Lp.ruby_file_contents = function(path) {
  return this.factories[path];
};

/**
  Actually run file with resolved name.

  @param {Loader} loader
  @param {String} path
*/
function load_file(loader, path) {
  var ext = load_extensions[PATH_RE.exec(path)[3] || '.js'];

  if (!ext) {
    rb_raise(rb_eException, "load_run_file - Bad extension for resolved path");
  }

  ext(loader, path);
}

/**
  Run content which must now be javascript. Arguments we pass to func
  are:

    $rb
    top_self
    filename

  @param {String, Function} content
  @param {String} path
*/
function load_execute_file(loader, content, path) {
  var args = [Rt, rb_top_self, path];

  if (typeof content === 'function') {
    return content.apply(Op, args);

  } else if (typeof content === 'string') {
    var func = loader.wrap(content, path);
    return func.apply(Op, args);

  } else {
    rb_raise(rb_eException, "Loader.execute - bad content for: " + path);
  }
}

/**
  Getter method for getting the load path for opal.

  @param {String} id The globals id being retrieved.
  @return {Array} Load paths
*/
function rb_load_path_getter(id) {
  return Op.loader.paths;
}

/**
  Getter method to get all loaded features.

  @param {String} id Feature global id
  @return {Array} Loaded features
*/
function rb_loaded_feature_getter(id) {
  return loaded_features;
}

var core_lib = function($rb, self, __FILE__) {function $$(){$class(self, nil, 'Module', function(self) {

  $defn(self, 'include', function(mods) { var self = this;mods = [].slice.call(arguments, 0);
    var i = mods.length - 1, mod;
    while (i >= 0) {
      mod = mods[i];
      mod.m$append_features(self);
      mod.m$included(self);
      i--;
    }
    return self;
  });

  $defn(self, 'append_features', function(mod) { var self = this;
    rb_include_module(mod, self);
    return self;
  });

  return $defn(self, 'included', function(mod) { var self = this;
    return nil;
  });
}, 0);

$class(self, nil, 'Kernel', function(self) { 






  $defn(self, 'require', function(path) { var self = this;
    return rb_require(path);
  });





  return $defn(self, 'puts', function(a) { var self = this;var __a;a = [].slice.call(arguments, 0);
    (__a = $rb.gg('$stdout')).m$puts.apply(__a, a);
    return nil;
  });
}, 2);

$class($rb.gg('$stdout'), nil, nil, function(self) {



  return $defn(self, 'puts', function(a) { var self = this;a = [].slice.call(arguments, 0);
    for (var i = 0, ii = a.length; i < ii; i++) {
      console.log(a[i].m$to_s().toString());
    }
    return nil;
  });
}, 1);

$class(self, nil, 'Object', function(self) {
  return self.m$include($cg(self, 'Kernel'));
}, 0);

$class(self, nil, 'String', function(self) {
  return $defn(self, 'to_s', function() { var self = this;
    return self.toString();
  });
}, 0);



$class(self, nil, 'Object', function(self) {

  $defn(self, 'initialize', function(a) { var self = this;a = [].slice.call(arguments, 0);    return nil;

  });

  $defn(self, '==', function(other) { var self = this;
    return self === other;
  });

  $defn(self, 'equal?', function(other) { var self = this;
    return self.valueOf() === other.valueOf();
  });

  $defn(self, '__send__', function(method_id, args) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;args = [].slice.call(arguments, 1);var block = (($yy == $y.y) ? nil: $yy);
    var method = self['m$' + method_id];

    if ($B.f == arguments.callee) {
      $B.f = method;
    }

    return method.apply(self, args);
  });

  $defn(self, 'instance_eval', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;var block = (($yy == $y.y) ? nil: $yy);
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise($cg(self, 'ArgumentError'), "block not supplied")};
    block.call(self);
    return self;
  });

  return $defn(self, 'method_missing', function(sym, args) { var self = this;args = [].slice.call(arguments, 1);
    return self.m$raise($cg(self, 'NoMethodError'), ("undefined method `" + (sym).m$to_s() + "` for " + (self.m$inspect()).m$to_s()));
  });
}, 0);




$class(self, nil, 'Module', function(self) {

  $defn(self, 'name', function() { var self = this;
    return self.__classid__;
  });

  $defn(self, '===', function(obj) { var self = this;
    return obj['m$kind_of?'](self);
  });

  $defn(self, 'define_method', function(method_id) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;var block = (($yy == $y.y) ? nil: $yy);
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise($cg(self, 'LocalJumpError'), "no block given")};
    $rb.dm(self, method_id.m$to_s().toString(), block)
    return nil;
  });

  $defn(self, 'attr_accessor', function(attrs) { var self = this;var __a;attrs = [].slice.call(arguments, 0);
    (__a = self).m$attr_reader.apply(__a, attrs);
    return (__a = self).m$attr_writer.apply(__a, attrs);
  });

  $defn(self, 'attr_reader', function(attrs) { var self = this;var __a, __b;attrs = [].slice.call(arguments, 0);
    (__a = attrs, $B.f = __a.m$each, ($B.p =function(a) { var self = this; var method_id;
      method_id = a.m$to_s();
      $rb.dm(self, method_id, function() {
        var iv = this[method_id];
        return iv == undefined ? nil : iv;
      });
    }).$self=self, $B.f).call(__a);
    return nil;
  });

  $defn(self, 'attr_writer', function(attrs) { var self = this;var __a, __b;attrs = [].slice.call(arguments, 0);
    (__a = attrs, $B.f = __a.m$each, ($B.p =function(a) { var self = this; var method_id;
      method_id = a.m$to_s();
      $rb.dm(self, method_id + '=', function(val) {
        return this[method_id] = val;
      });
    }).$self=self, $B.f).call(__a);
    return nil;
  });

  $defn(self, 'alias_method', function(new_name, old_name) { var self = this;
    $rb.alias_method(self, new_name.m$to_s(), old_name.m$to_s());
    return self;
  });

  $defn(self, 'public_instance_methods', function(include_super) { var self = this;if (include_super == undefined) {include_super = true;}
    return self.$methods;
  });

  $defn(self, 'instance_methods', function() { var self = this;
    return self.$methods;
  });

  $defn(self, 'ancestors', function() { var self = this;
    var ary = [], parent = self;

    while (parent) {
      if (parent.$f & FL_SINGLETON) {
        // nothing?
      }
      else {
        ary.push(parent);
      }

      parent = parent.$super;
    }

    return ary;
  });

  $defn(self, 'to_s', function() { var self = this;
    return self.__classid__;
  });

  $defn(self, 'const_set', function(id, value) { var self = this;
    return rb_const_set(self, id.m$to_s(), value);
  });

  $defn(self, 'class_eval', function(str) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;if (str == undefined) {str = nil;}var block = (($yy == $y.y) ? nil: $yy);
    if ((__a = ($yy !== $y.y), __a !== false && __a !== nil)) {
      block.call(self)
    } else {
      return self.m$raise("need to compile str");
    }
  });

  $defn(self, 'module_eval', function(str) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;if (str == undefined) {str = nil;}var block = (($yy == $y.y) ? nil: $yy);
    return ($B.p = block, $B.f = (__a = self).m$class_eval).call(__a, str);
  });

  return $defn(self, 'extend', function(mod) { var self = this;
    rb_extend_module(self, mod)
    return nil;
  });
}, 0);

$class(self, $cg(self, 'Module'), 'Class', function(self) {

  $defs(self, 'new', function(sup) { var self = this;if (sup == undefined) {sup = $cg(self, 'Object');}
    var res = rb_define_class_id('AnonClass', sup);

    if (sup.m$inherited) {
      sup.m$inherited(res);
    }

    return res;
  });

  $defn(self, 'allocate', function() { var self = this;
    return new self.$a();
  });

  $defn(self, 'new', function(args) { var self = this;var obj, __a;args = [].slice.call(arguments, 0);
    obj = self.m$allocate();

    if ($B.f == arguments.callee) {
      $B.f = obj.$m.initialize;
    }

    (__a = obj).m$initialize.apply(__a, args);
    return obj;
  });

  $defn(self, 'inherited', function(cls) { var self = this;
    return nil;
  });

  $defn(self, 'superclass', function() { var self = this;
    var sup = self.$s;

    if (!sup) {
      if (self == rb_cObject) return nil;
      throw new Error('RuntimeError: uninitialized class');
    }

    return sup;
  });











  return $defn(self, 'from_native', function(obj) { var self = this;
    var inst = new self.$a();
    inst.native = obj;
    return inst;
  });
}, 0);




$class(self, nil, 'Kernel', function(self) { 

  $defn(self, 'instance_variable_defined?', function(name) { var self = this;
    name = name.m$to_s();
    return self[name.substr(1)] != undefined;
  });

  $defn(self, 'instance_variable_get', function(name) { var self = this;
    name = name.m$to_s();
    return self[name.substr(1)] == undefined ? nil : self[name.substr(1)];
  });

  $defn(self, 'instance_variable_set', function(name, value) { var self = this;
    name = name.m$to_s();
    return self[name.substr(1)] = value;
  });


  $defn(self, '__flags__', function() { var self = this;
    return self.$f;
  });

  $defn(self, 'hash', function() { var self = this;
    return self.$h();
  });

  $defn(self, 'to_a', function() { var self = this;
    return [self];
  });

  $defn(self, 'tap', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise($cg(self, 'LocalJumpError'), "no block given")};
    if ($yy.call($ys, self) == $yb) { return $yb.$value; };
    return self;
  });

  $defn(self, 'kind_of?', function(klass) { var self = this;
    var search = self.$k;

    while (search) {
      if (search == klass) {
        return true;
      }

      search = search.$super;
    }

    return false;
  });

  self.m$alias_method('is_a?', 'kind_of?');

  $defn(self, 'nil?', function() { var self = this;
    return false;
  });















  $defn(self, 'respond_to?', function(method_id) { var self = this;
    var method = self['m$' + method_id];


    if (method ) {
      return true;
    }

    return false;
  });

  $defn(self, '===', function(other) { var self = this;
    return self.valueOf() === other.valueOf();
  });

  $defn(self, 'send', function(method_id, args) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;args = [].slice.call(arguments, 1);var block = (($yy == $y.y) ? nil: $yy);
    var method = self['m$' + method_id];

    if ($B.f == arguments.callee) {
      $B.f = method;
    }

    return method.apply(self, args);
  });

  $defn(self, 'class', function() { var self = this;
    return rb_class_real(self.$k);
  });

  $defn(self, 'singleton_class', function() { var self = this;
    return rb_singleton_class(self);
  });

  $defn(self, 'methods', function() { var self = this;
    return self.$k.$methods;
  });













  $defn(self, 'rand', function(max) { var self = this;if (max == undefined) {max = undefined;}
    if (max != undefined)
        return Math.floor(Math.random() * max);
    else
      return Math.random();
  });

  $defn(self, '__id__', function() { var self = this;
    return self.$h();
  });

  $defn(self, 'object_id', function() { var self = this;
    return self.$h();
  });






  $defn(self, 'to_s', function() { var self = this;
    return ("#<" + (rb_class_real(self.$k)).m$to_s() + ":0x" + ((self.$h() * 400487).toString(16)).m$to_s() + ">");
  });

  $defn(self, 'inspect', function() { var self = this;
    return self.m$to_s();
  });

  $defn(self, 'const_set', function(name, value) { var self = this;
    return rb_const_set(rb_class_real(self.$k), name, value);
  });

  $defn(self, 'const_defined?', function(name) { var self = this;
    return false;
  });

  $defn(self, '=~', function(obj) { var self = this;
    return nil;
  });

  $defn(self, 'extend', function(mod) { var self = this;
    rb_extend_module(rb_singleton_class(self), mod);
    return nil;
  });




















  $defn(self, 'raise', function(exception, string) { var self = this;if (string == undefined) {string = nil;}
    var msg = nil, exc;

    if (exception.$f & T_STRING) {
      msg = exception;
      exc = $cg(self, 'RuntimeError').m$new(msg);
    } else if (exception['m$kind_of?']($cg(self, 'Exception'))) {
      exc = exception;
    } else {
      if (string != nil) msg = string;
      exc = exception.m$new(msg);
    }
    rb_raise_exc(exc);
  });

  self.m$alias_method('fail', 'raise');










  $defn(self, 'loop', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    while (true) {
      ((__a = $yy.call($ys)) == $yb ? $break() : __a);
    }

    return self;
  });


  $defn(self, 'at_exit', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;var proc = (($yy == $y.y) ? nil: $yy);
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise($cg(self, 'ArgumentError'), "called without a block")};
    rb_end_procs.push(proc);

    return proc;
  });









  $defn(self, 'proc', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;var block = (($yy == $y.y) ? nil: $yy);

    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise($cg(self, 'ArgumentError'), "tried to create Proc object without a block")};
    return block;
  });

  return $defn(self, 'lambda', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;var block = (($yy == $y.y) ? nil: $yy);

    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise($cg(self, 'ArgumentError'), "tried to create Proc object without a block")};
    return rb_make_lambda(block);
  });


}, 2);

$defs(self, 'to_s', function() { var self = this;
  return "main";
});

$defs(self, 'include', function(mod) { var self = this;
  return $cg(self, 'Object').m$include(mod);
});














$class(self, nil, 'NilClass', function(self) {

  $defn(self, 'to_i', function() { var self = this;
    return 0;
  });

  $defn(self, 'to_f', function() { var self = this;
    return 0.0;
  });

  $defn(self, 'to_s', function() { var self = this;
    return '';
  });

  $defn(self, 'to_a', function() { var self = this;
    return [];
  });

  $defn(self, 'inspect', function() { var self = this;
    return "nil";
  });

  $defn(self, 'nil?', function() { var self = this;
    return true;
  });

  $defn(self, '&', function(other) { var self = this;
    return false;
  });

  $defn(self, '|', function(other) { var self = this;
    return other != false && other != nil;
  });

  return $defn(self, '^', function(other) { var self = this;
    return other != false && other != nil;
  });
}, 0);

$rb.cs(self, 'NIL', nil);

$class(self, nil, 'Boolean', function(self) {

  $defn(self, 'to_s', function() { var self = this;






    return self == true ? "true" : "false";
  });

  return $defn(self, '==', function(other) { var self = this;
    return self.valueOf() === other.valueOf();
  });
}, 0);

$rb.cs(self, 'TRUE', true);
$rb.cs(self, 'FALSE', false);


$class(self, nil, 'Enumerable', function(self) { 









  $defn(self, 'to_a', function() { var self = this;var ary, __a, __b;
    ary = [];
    (__a = self, $B.f = __a.m$each, ($B.p =function(arg) { var self = this;      ary.push(arg);}).$self=self, $B.f).call(__a);
    return ary;
  });

  self.m$alias_method('entries', 'to_a');

  $defn(self, 'collect', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a, __b;var block = (($yy == $y.y) ? nil: $yy);
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise("Enumerable#collect no block given")};
    var result = [];

    (__a = self, $B.f = __a.m$each, ($B.p =function(args) { var self = this; var __a;args = [].slice.call(arguments, 0);
      result.push((__a = block).m$call.apply(__a, args));
    }).$self=self, $B.f).call(__a);

    return result;
  });

  return self.m$alias_method('map', 'collect');
}, 2);

$class(self, nil, 'Array', function(self) {










  $defs(self, '[]', function(objs) { var self = this;objs = [].slice.call(arguments, 0);
    var ary = self.m$allocate();
    ary.splice.apply(ary, [0, 0].concat(objs));
    return ary;
  });

  $defs(self, 'allocate', function() { var self = this;
    var ary = new self.$a();
    return ary;
  });

  $defn(self, 'initialize', function(len, fill) { var self = this;if (len == undefined) {len = 0;}if (fill == undefined) {fill = nil;}
    for (var i = 0; i < len; i++) {
      self[i] = fill;
    }

    self.length = len;

    return self;
  });





  $defn(self, 'inspect', function() { var self = this;
    var description = [];

    for (var i = 0, length = self.length; i < length; i++) {
      description.push(self[i].m$inspect());
    }

    return '[' + description.join(', ') + ']';
  });



  $defn(self, 'to_s', function() { var self = this;
    var description = [];

    for (var i = 0, length = self.length; i < length; i++) {
      description.push(self[i].m$to_s());
    }

    return description.join('');
  });












  $defn(self, '<<', function(obj) { var self = this;
    self.push(obj);
    return self;
  });









  $defn(self, 'length', function() { var self = this;
    return self.length;
  });

  self.m$alias_method('size', 'length');

















  $defn(self, 'each', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise("Array#each no block given")};

    for (var i = 0, len = self.length; i < len; i++) {
    if ($yy.call($ys, self[i]) == $yb) { return $yb.$value; };
    }
    return self;
  });



  $defn(self, 'each_with_index', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise("Array#each_with_index no block given")};

    for (var i = 0, len = self.length; i < len; i++) {
    if ($yy.call($ys, self[i], i) == $yb) { return $yb.$value; };
    }
    return self;
  });

















  $defn(self, 'each_index', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise("Array#each_index no block given")};

    for (var i = 0, len = self.length; i < len; i++) {
    if ($yy.call($ys, i) == $yb) { return $yb.$value; };
    }
    return self;
  });













  $defn(self, 'push', function(objs) { var self = this;objs = [].slice.call(arguments, 0);
    for (var i = 0, ii = objs.length; i < ii; i++) {
      self.push(objs[i]);
    }
    return self;
  });















  $defn(self, 'index', function(obj) { var self = this;
    for (var i = 0, len = self.length; i < len; i++) {
      if (self[i].valueOf() === obj.valueOf().$r) {
        return i;
      }
    }

    return nil;
  });











  $defn(self, '+', function(other) { var self = this;
    return self.slice(0).concat(other.slice());
  });











  $defn(self, '-', function(other) { var self = this;
    return self.m$raise("Array#- not yet implemented");
  });













  $defn(self, '==', function(other) { var self = this;
    if (self.$h() == other.$h()) return true;
    if (self.length != other.length) return false;

    for (var i = 0; i < self.length; i++) {
      if (!self[i].valueOf() === other[i].valueOf()) {
        return false;
      }
    }

    return true;
  });















  $defn(self, 'assoc', function(obj) { var self = this;
    var arg;

    for (var i = 0; i < self.length; i++) {
      arg = self[i];

      if (arg.length && arg[0].valueOf() === obj.valueOf().$r) {
        return arg;
      }
    }

    return nil;
  });













  $defn(self, 'at', function(idx) { var self = this;
    var size = self.length;

    if (idx < 0) idx += size;

    if (idx < 0 || idx >= size) return nil;
    return self[idx];
  });









  $defn(self, 'clear', function() { var self = this;
    self.splice(0);
    return self;
  });












  $defn(self, 'select', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var result = [], arg;

    for (var i = 0, ii = self.length; i < ii; i++) {
      arg = self[i];

      if (((__a = $yy.call($ys, arg)) == $yb ? $break() : __a).$r) {
        result.push(arg);
      }
    }

    return result;
  });











  $defn(self, 'collect', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise("Array#collect no block given")};

    var result = [];

    for (var i = 0, ii = self.length; i < ii; i++) {
      result.push(((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a));
    }

    return result;
  });

  self.m$alias_method('map', 'collect');













  $defn(self, 'collect!', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    for (var i = 0, ii = self.length; i < ii; i++) {
      self[i] = ((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a);
    }

    return self;
  });


  $defn(self, 'dup', function() { var self = this;
    return self.slice(0);
  });









  $defn(self, 'compact', function() { var self = this;
    var result = [], length = self.length;

    for (var i = 0; i < length; i++) {
      if (self[i] != nil) {
        result.push(self[i]);
      }
    }

    return result;
  });













  $defn(self, 'compact!', function() { var self = this;
    var length = self.length;

    for (var i = 0; i < length; i++) {
      if (self[i] == nil) {
        self.splice(i, 1);
        i--;
      }
    }

    return length == self.length ? nil : self;
  });










  $defn(self, 'concat', function(other) { var self = this;
    var length = other.length;

    for (var i = 0; i < length; i++) {
      self.push(other[i]);
    }

    return self;
  });













  $defn(self, 'count', function(obj) { var self = this;
    if (obj != undefined) {
      var total = 0;

      for (var i = 0; i < self.length; i++) {
        if (self[i].valueOf() === obj.valueOf().$r) {
          total++;
        }
      }

      return total;
    } else {
      return self.length;
    }
  });



















  $defn(self, 'delete', function(obj) { var self = this;
    var length = self.length;

    for (var i = 0; i < self.length; i++) {
      if (self[i].valueOf() === obj.valueOf().$r) {
        self.splice(i, 1);
        i--;
      }
    }

    return length == self.length ? nil : obj;
  });
















  $defn(self, 'delete_at', function(idx) { var self = this;
    if (idx < 0) idx += self.length;
    if (idx < 0 || idx >= self.length) return nil;
    var res = self[idx];
    self.splice(idx, 1);
    return self;
  });










  $defn(self, 'delete_if', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    for (var i = 0, ii = self.length; i < ii; i++) {
      if (((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a).$r) {
        self.splice(i, 1);
        i--;
        ii = self.length;
      }
    }
    return self;
  });













  $defn(self, 'drop', function(n) { var self = this;
    if (n > self.length) return [];
    return self.slice(n);
  });












  $defn(self, 'drop_while', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    for (var i = 0; i < self.length; i++) {
      if (!((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a).$r) {
        return self.slice(i);
      }
    }

    return [];
  });









  $defn(self, 'empty?', function() { var self = this;
    return self.length == 0;
  });




























  $defn(self, 'fetch', function(idx, defaults) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var original = idx;

    if (idx < 0) idx += self.length;
    if (idx < 0 || idx >= self.length) {
      if (defaults == undefined)
        raise(eIndexError, "Array#fetch");
      else if (__block__)
        return ((__a = $yy.call($ys, original)) == $yb ? $break() : __a);
      else
        return defaults;
    }

    return self[idx];
  });















  $defn(self, 'first', function(count) { var self = this;
    if (count == undefined) {
      if (self.length == 0) return nil;
      return self[0];
    }
    return self.slice(0, count);
  });






















  $defn(self, 'flatten', function(level) { var self = this;
    var result = [], item;

    for (var i = 0; i < self.length; i++) {
      item = self[i];

      if (item.o$f & T_ARRAY) {
        if (level == undefined)
          result = result.concat(item.m$flatten());
        else if (level == 0)
          result.push(item);
        else
          result = result.concat(item.m$flatten(level - 1));
      } else {
        result.push(item);
      }
    }

    return result;
  });
















  $defn(self, 'flatten!', function(level) { var self = this;
    var length = self.length;
    var result = self.m$flatten(level);
    self.splice(0);

    for (var i = 0; i < result.length; i++) {
      self.push(result[i]);
    }

    if (self.length == length)
      return nil;

    return self;
  });

  $defn(self, 'grep', function(pattern) { var self = this;
    var result = [], arg;

    for (var i = 0, ii = self.length; i < ii; i++) {
      arg = self[i];

      if (pattern.exec(arg)) {
        result.push(arg);
      }
    }

    return result;
  });










  $defn(self, 'include?', function(member) { var self = this;
    for (var i = 0; i < self.length; i++) {
      if (self[i].valueOf() === member.valueOf()) {
        return true;
      }
    }

    return false;
  });

  $defn(self, 'inject', function(initial) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    if (initial === undefined) initial = self[0];
    var result;

    for (var i = 0, ii = self.length; i < ii; i++) {
      initial = ((__a = $yy.call($ys, initial, self[i])) == $yb ? $break() : __a);
    }

    return initial;
  });














  $defn(self, 'replace', function(other) { var self = this;
    self.splice(0);

    for (var i = 0; i < other.length; i++) {
      self.push(other[i]);
    }

    return self;
  });















  $defn(self, 'insert', function(idx, objs) { var self = this;objs = [].slice.call(arguments, 1);
    var size = self.length;

    if (idx < 0) idx += size;

    if (idx < 0 || idx >= size)
      raise(eIndexError, "out of range");

    self.splice.apply(self, [idx, 0].concat(objs));
    return self;
  });













  $defn(self, 'join', function(sep) { var self = this;if (sep == undefined) {sep = '';}
    var result = [];

    for (var i = 0; i < self.length; i++) {
      result.push(self[i].m$to_s());
    }

    return result.join(sep);
  });










  $defn(self, 'keep_if', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    for (var i = 0; i < self.length; i++) {
      if (!((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a).$r) {
        self.splice(i, 1);
        i--;
      }
    }

    return self;
  });














  $defn(self, 'last', function(count) { var self = this;
    var size = self.length;

    if (count == undefined) {
      if (size == 0) return nil;
      return self[size - 1];
    } else {
      if (count > size) count = size;
      return self.slice(size - count, size);
    }
  });

















  $defn(self, 'pop', function(count) { var self = this;
    var size = self.length;

    if (count == undefined) {
      if (size) return self.pop();
      return nil;
    } else {
      return self.splice(size - count, size);
    }
  });















  $defn(self, 'rassoc', function(obj) { var self = this;
    var test;

    for (var i = 0; i < self.length; i++) {
      test = self[i];
      if (test.o$f & T_ARRAY && test[1] != undefined) {
        if (test[1].valueOf() === obj.valueOf().$r) return test;
      }
    }

    return nil;
  });













  $defn(self, 'reject', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var result = [];

    for (var i = 0; i < self.length; i++) {
      if (!((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a).$r) {
        result.push(self[i]);
      }
    }

    return result;
  });















  $defn(self, 'reject!', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var length = self.length;

    for (var i = 0; i < self.length; i++) {
      if (((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a).$r) {
        self.splice(i, 1);
        i--;
      }
    }

    return self.length == length ? nil : self;
  });











  $defn(self, 'reverse', function() { var self = this;
    var result = [];

    for (var i = self.length - 1; i >= 0; i--) {
      result.push(self[i]);
    }

    return result;
  });












  $defn(self, 'reverse!', function() { var self = this;
    var length = self.length / 2, tmp;

    for (var i = 0; i < length; i++) {
      tmp = self[i];
      self[i] = self[self.length - (i + 1)];
      self[self.length - (i + 1)] = tmp;
    }

    return self;
  });












  $defn(self, 'reverse_each', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var ary = self, len = ary.length;

    for (var i = len - 1; i >= 0; i--) {
      ((__a = $yy.call($ys, ary[i])) == $yb ? $break() : __a);
    }

    return self;
  });

















  $defn(self, 'rindex', function(obj) { var self = this;
    if (obj != undefined) {
      for (var i = self.length - 1; i >=0; i--) {
        if (self[i].valueOf() === obj.valueOf().$r) {
          return i;
        }
      }
    } else if (true || __block__) {
      raise(eException, "Array#rindex needs to do block action");
    }

    return nil;
  });
















  $defn(self, 'select!', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var length = self.length;

    for (var i = 0; i < self.length; i++) {
      if (!((__a = $yy.call($ys, self[i])) == $yb ? $break() : __a).$r) {
        self.splice(i, 1);
        i--;
      }
    }

    return self.length == length ? nil : self;
  });






















  $defn(self, 'shift', function(count) { var self = this;
    if (count != undefined)
      return self.splice(0, count);

    if (self.length)
      return self.shift();

    return nil;
  });
























  $defn(self, 'slice!', function(index, length) { var self = this;if (length == undefined) {length = nil;}
    var size = self.length;

    if (index < 0) index += size;

    if (index >= size || index < 0) return nil;

    if (length != nil) {
      if (length <= 0 || length > self.length) return nil;
      return self.splice(index, index + length);
    } else {
      return self.splice(index, 1)[0];
    }
  });










  $defn(self, 'take', function(count) { var self = this;
    return self.slice(0, count);
  });












  $defn(self, 'take_while', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var result = [], arg;

    for (var i = 0, ii = self.length; i < ii; i++) {
      arg = self[i];
      if (((__a = $yy.call($ys, arg)) == $yb ? $break() : __a).$r) {
        result.push(self[i]);
      } else {
        break;
      }
    }

    return result;
  });










  $defn(self, 'to_a', function() { var self = this;
    return self;
  });












  $defn(self, 'uniq', function() { var self = this;
    var result = [], seen = [];

    for (var i = 0; i < self.length; i++) {
      var test = self[i], hash = test.$h();
      if (seen.indexOf(hash) == -1) {
        seen.push(hash);
        result.push(test);
      }
    }

    return result;
  });













  $defn(self, 'uniq!', function() { var self = this;
    var seen = [], length = self.length;

    for (var i = 0; i < self.length; i++) {
      var test = self[i], hash = test.$h();
      if (seen.indexOf(hash) == -1) {
        seen.push(hash);
      } else {
        self.splice(i, 1);
        i--;
      }
    }

    return self.length == length ? nil : self;
  });













  $defn(self, 'unshift', function(objs) { var self = this;objs = [].slice.call(arguments, 0);
    for (var i = objs.length - 1; i >= 0; i--) {
      self.unshift(objs[i]);
    }

    return self;
  });











  $defn(self, '&', function(other) { var self = this;
    var result = [], seen = [];

    for (var i = 0; i < self.length; i++) {
      var test = self[i], hash = test.$h();

      if (seen.indexOf(hash) == -1) {
        for (var j = 0; j < other.length; j++) {
          var test_b = other[j], hash_b = test_b.$h();

          if ((hash == hash_b) && seen.indexOf(hash) == -1) {
            seen.push(hash);
            result.push(test);
          }
        }
      }
    }

    return result;
  });

















  $defn(self, '*', function(arg) { var self = this;
    if (arg.o$f & T_STRING) {
      return self.m$join(arg);
    } else {
      var result = [];
      for (var i = 0; i < parseInt(arg); i++) {
        result = result.concat(self);
      }

      return result;
    }
  });


























  $defn(self, '[]', function(index, length) { var self = this;
    var ary = self, size = ary.length;

    if (index < 0) index += size;

    if (index >= size || index < 0) return nil;

    if (length != undefined) {
      if (length <= 0) return [];
      return ary.slice(index, index + length);
    } else {
      return ary[index];
    }
  });




  return $defn(self, '[]=', function(index, value) { var self = this;
    if (index < 0) index += self.length;
    return self[index] = value;
  });
}, 0);









































$class(self, nil, 'Numeric', function(self) {

  $defn(self, '+', function(other) { var self = this;
    return self + other;
  });

  $defn(self, '-', function(other) { var self = this;
    return self - other;
  });

  $defn(self, '*', function(other) { var self = this;
    return self * other;
  });

  $defn(self, '/', function(other) { var self = this;
    return self / other;
  });

  $defn(self, '==', function(other) { var self = this;
    return self.valueOf() === other.valueOf();
  });

  $defn(self, '<', function(other) { var self = this;
    return self < other;
  });

  $defn(self, '<=', function(other) { var self = this;
    return self <= other;
  });

  $defn(self, '>', function(other) { var self = this;
    return self > other;
  });

  $defn(self, '>=', function(other) { var self = this;
    return self >= other;
  });





  $defn(self, '%', function(other) { var self = this;
    return self % other;
  });

  $defn(self, 'modulo', function(other) { var self = this;
    return self % other;
  });





  $defn(self, '&', function(num2) { var self = this;
    return self & num2;
  });





  $defn(self, '**', function(other) { var self = this;
    return Math.pow(self, other);
  });





  $defn(self, '<<', function(count) { var self = this;
    return self << count;
  });





  $defn(self, '>>', function(count) { var self = this;
    return self >> count;
  });






  $defn(self, '<=>', function(other) { var self = this;
    if (typeof other != 'number') return nil;
    else if (self < other) return -1;
    else if (self > other) return 1;
    return 0;
  });





  $defn(self, '^', function(other) { var self = this;
    return self ^ other;
  });











  $defn(self, 'abs', function() { var self = this;
    return Math.abs(self);
  });

  $defn(self, 'magnitude', function() { var self = this;
    return Math.abs(self);
  });




  $defn(self, 'even?', function() { var self = this;
    return (self % 2 == 0);
  });




  $defn(self, 'odd?', function() { var self = this;
    return (self % 2 == 0) ? false : true;
  });











  $defn(self, 'succ', function() { var self = this;
    return self + 1;
  });

  $defn(self, 'next', function() { var self = this;
    return self + 1;
  });











  $defn(self, 'pred', function() { var self = this;
    return self - 1;
  });
















  $defn(self, 'upto', function(finish) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    for (var i = self; i <= finish; i++) {
      ((__a = $yy.call($ys, i)) == $yb ? $break() : __a);
    }

    return self;
  });















  $defn(self, 'downto', function(finish) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    for (var i = self; i >= finish; i--) {
      ((__a = $yy.call($ys, i)) == $yb ? $break() : __a);
    }

    return self;
  });














  $defn(self, 'times', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise("no block given")};
    for (var i = 0; i < self; i++) {
      ((__a = $yy.call($ys, i)) == $yb ? $break() : __a);
    }

    return self;
  });





  $defn(self, '|', function(other) { var self = this;
    return self | other;
  });




  $defn(self, 'zero?', function() { var self = this;
    return self == 0;
  });




  $defn(self, 'nonzero?', function() { var self = this;
    return self == 0 ? nil : self;
  });




  $defn(self, '~', function() { var self = this;
    return ~self;
  });











  $defn(self, 'ceil', function() { var self = this;
    return Math.ceil(self);
  });









  $defn(self, 'floor', function() { var self = this;
    return Math.floor(self);
  });




  $defn(self, 'integer?', function() { var self = this;
    return self % 1 == 0;
  });

  $defn(self, 'inspect', function() { var self = this;
    return self.toString();
  });

  $defn(self, 'to_s', function() { var self = this;
    return self.toString();
  });

  $defn(self, 'to_i', function() { var self = this;
    return parseInt(self);
  });

  return $defs(self, 'allocate', function() { var self = this;
    return self.m$raise($cg(self, 'RuntimeError'), "cannot instantiate instance of Numeric class");
  });
}, 0);








































$class(self, nil, 'Hash', function(self) {




  $defs(self, '[]', function(args) { var self = this;args = [].slice.call(arguments, 0);
    return $rb.H.apply(null, args);
  });

  $defs(self, 'allocate', function() { var self = this;
    return $rb.H();
  });









  $defn(self, 'values', function() { var self = this;
    var result = [], length = self.k.length;

    for (var i = 0; i < length; i++) {
      result.push(self.a[self.k[i].$h()]);
    }

    return result;
  });









  $defn(self, 'inspect', function() { var self = this;
    var description = [], key, value;

    for (var i = 0, ii = self.k.length; i < ii; i++) {
      key = self.k[i];
      value = self.a[key.$h()];
      description.push(key.m$inspect() + '=>' + value.m$inspect());
    }

    return '{' + description.join(', ') + '}';
  });




  $defn(self, 'to_s', function() { var self = this;
    var description = [], key, value;

    for (var i = 0, ii = self.k.length; i < ii; i++) {
      key = self.k[i];
      value = self.a[key.$h()];
      description.push(key.m$inspect() + value.m$inspect());
    }

    return description.join('');
  });











  $defn(self, 'each', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var keys = self.k, values = self.a, length = keys.length, key;

    for (var i = 0; i < length; i++) {
      key = keys[i];
      ((__a = $yy.call($ys, key, values[key.$h()])) == $yb ? $break() : __a);
    }

    return self;
  });














  $defn(self, 'assoc', function(obj) { var self = this;
    var key, keys = self.k, length = keys.length;

    for (var i = 0; i < length; i++) {
      key = keys[i];
      if (key.valueOf() === obj.valueOf().$r) {
        return [key, self.a[key.$h()]];
      }
    }

    return nil;
  });


















  $defn(self, '==', function(other) { var self = this;
    if (self === other) return true;
    if (!other.k || !other.a) return false;
    if (self.k.length != other.k.length) return false;

    for (var i = 0; i < self.k.length; i++) {
      var key1 = self.k[i], assoc1 = key1.$h();

      if (!hasOwnProperty.call(other.a, assoc1))
        return false;

      var assoc2 = other.a[assoc1];

      if (!self.a[assoc1].valueOf() === assoc2.valueOf().$r)
        return false;
    }

    return true;
  });














  $defn(self, '[]', function(key) { var self = this;
    var assoc = key.$h();

    if (hasOwnProperty.call(self.a, assoc))
      return self.a[assoc];

    return self.d;
  });
















  $defn(self, '[]=', function(key, value) { var self = this;
    var assoc = key.$h();

    if (!hasOwnProperty.call(self.a, assoc))
      self.k.push(key);

    return self.a[assoc] = value;
  });










  $defn(self, 'clear', function() { var self = this;
    self.k = [];
    self.a = {};

    return self;
  });


  $defn(self, 'default', function() { var self = this;
    return self.d;
  });





  $defn(self, 'default=', function(obj) { var self = this;
    return self.d = obj;
  });
















  $defn(self, 'delete', function(key) { var self = this;
    var assoc = key.$h();

    if (hasOwnProperty.call(self.a, assoc)) {
      var ret = self.a[assoc];
      delete self.a[assoc];
      self.k.splice(self.$keys.indexOf(key), 1);
      return ret;
    }

    return self.d;
  });











  $defn(self, 'delete_if', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var key, value;

    for (var i = 0; i < self.k.length; i++) {
      key = self.k[i];
      value = self.a[key.$h()];

      if (((__a = $yy.call($ys, key, value)) == $yb ? $break() : __a).$r) {
        delete self.a[key.$h()];
        self.k.splice(i, 1);
        i--;
      }
    }

    return self;
  });












  $defn(self, 'each_key', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    for (var i = 0, ii = self.k.length; i < ii; i++) {
      ((__a = $yy.call($ys, self.k[i])) == $yb ? $break() : __a);
    }

    return self;
  });












  $defn(self, 'each_value', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    var val;

    for (var i = 0, ii = self.k.length; i < ii; i++) {
      ((__a = $yy.call($ys, self.a[self.k[i].$h()])) == $yb ? $break() : __a);
    }

    return self;
  });









  $defn(self, 'empty?', function() { var self = this;
    return self.k.length == 0;
  });

















  $defn(self, 'fetch', function(key, defaults) { var self = this;if (defaults == undefined) {defaults = undefined;}
    var value = self.a[key.$h()];

    if (value != undefined)
      return value;
    else if (defaults == undefined)
      rb_raise('KeyError: key not found');
    else
      return defaults;
  });

















  $defn(self, 'flatten', function(level) { var self = this;if (level == undefined) {level = 1;}
    var result = [], key, value;

    for (var i = 0; i < self.k.length; i++) {
      key = self.k[i];
      value = self.a[key.$h()];
      result.push(key);

      if (value instanceof Array) {
        if (level == 1) {
          result.push(value);
        } else {
          var tmp = value.m$flatten(level - 1);
          result = result.concat(tmp);
        }
      } else {
        result.push(value);
      }
    }

    return result;
  });













  $defn(self, 'has_key?', function(key) { var self = this;
    if (hasOwnProperty.call(self.a, key.$h()))
      return true;

    return false;
  });













  $defn(self, 'has_value?', function(value) { var self = this;
    var key, value;

    for (var i = 0; i < self.k.length; i++) {
      key = self.k[i];
      val = self.a[key.$h()];

      if (value.valueOf() === val.valueOf().$r)
        return true;
    }

    return false;
  });











  $defn(self, 'replace', function(other) { var self = this;
    self.k = []; self.a = {};

    for (var i = 0; i < other.k.length; i++) {
      var key = other.k[i];
      var val = other.a[key.$h()];
      self.k.push(key);
      self.a[key.$h()] = val;
    }

    return self;
  });











  $defn(self, 'invert', function() { var self = this;    return nil;

  });













  $defn(self, 'key', function(value) { var self = this;
    var key, val;

    for (var i = 0; i < self.k.length; i++) {
      key = self.k[i];
      val = self.a[key.$h()];

      if (value.valueOf() === val.valueOf().$r) {
        return key;
      }
    }

    return nil;
  });











  $defn(self, 'keys', function() { var self = this;
    return self.k.slice(0);
  });










  $defn(self, 'length', function() { var self = this;
    return self.k.length;
  });


















  $defn(self, 'merge', function(other) { var self = this;
    var result = $opal.H() , key, val;

    for (var i = 0; i < self.k.length; i++) {
      key = self.k[i], val = self.a[key.$h()];

      result.k.push(key);
      result.a[key.$h()] = val;
    }

    for (var i = 0; i < other.k.length; i++) {
      key = other.k[i], val = other.a[key.$h()];

      if (!hasOwnProperty.call(result.a, key.$h())) {
        result.k.push(key);
      }

      result.a[key.$h()] = val;
    }

    return result;
  });















  $defn(self, 'merge!', function(other) { var self = this;
    var key, val;

    for (var i = 0; i < other.k.length; i++) {
      key = other.k[i];
      val = other.a[key.$h()];

      if (!hasOwnProperty.call(self.a, key.$h())) {
        self.k.push(key);
      }

      self.a[key.$h()] = val;
    }

    return self;
  });














  $defn(self, 'rassoc', function(obj) { var self = this;
    var key, val;

    for (var i = 0; i < self.k.length; i++) {
      key = self.k[i];
      val = self.a[key.$h()];

      if (val.valueOf() === obj.valueOf().$r)
        return [key, val];
    }

    return nil;
  });















  $defn(self, 'shift', function() { var self = this;
    var key, val;

    if (self.k.length > 0) {
      key = self.k[0];
      val = self.a[key.$h()];

      self.k.shift();
      delete self.a[key.$h()];
      return [key, val];
    }

    return self.d;
  });










  $defn(self, 'to_a', function() { var self = this;
    var result = [], key, value;

    for (var i = 0; i < self.k.length; i++) {
      key = self.k[i];
      value = self.a[key.$h()];
      result.push([key, value]);
    }

    return result;
  });




  return $defn(self, 'to_hash', function() { var self = this;
    return self;
  });
}, 0);

$class(self, nil, 'Exception', function(self) {

  $defn(self, 'initialize', function(message) { var self = this;if (message == undefined) {message = '';}
    return self.message = message;
  });

  $defn(self, 'message', function() { var self = this;if (self.message == undefined) { self.message = nil; }
    return self.message;
  });

  $defn(self, 'inspect', function() { var self = this;
    return "#<" + self.$k.__classid__ + ": '" + self.m$message() + "'>";
  });

  return $defn(self, 'to_s', function() { var self = this;
    return self.m$message();
  });
}, 0);



$class(self, nil, 'String', function(self) {

  $defs(self, 'new', function(str) { var self = this;if (str == undefined) {str = '';}
    return str;
  });

  $defn(self, '==', function(other) { var self = this;
    return self.valueOf() === other.valueOf();
  });














  $defn(self, 'capitalize', function() { var self = this;
    return self.charAt(0).toUpperCase() + self.substr(1).toLowerCase();
  });










  $defn(self, 'downcase', function() { var self = this;
    return self.toLowerCase();
  });

  $defn(self, 'upcase', function() { var self = this;
    return self.toUpperCase();
  });











  $defn(self, 'inspect', function() { var self = this;
    /* borrowed from json2.js, see file for license */
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

    meta = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    };

    escapable.lastIndex = 0;

    return escapable.test(self) ? '"' + self.replace(escapable, function (a) {
      var c = meta[a];
      return typeof c === 'string' ? c :
        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + self + '"';
  });




  $defn(self, 'length', function() { var self = this;
    return self.length;
  });

  $defn(self, 'to_i', function() { var self = this;
    return parseInt(self);
  });













  $defn(self, 'to_sym', function() { var self = this;
    return $rb.Y(self);
  });

  $defn(self, 'intern', function() { var self = this;
    return $rb.Y(self);
  });









  $defn(self, 'reverse', function() { var self = this;
    return self.split('').reverse().join('');
  });

  $defn(self, 'succ', function() { var self = this;
    return String.fromCharCode(self.charCodeAt(0));
  });

  $defn(self, '[]', function(idx) { var self = this;
    return self.substr(idx, idx + 1);
  });

  $defn(self, 'sub', function(pattern) { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;
    return self.replace(pattern, function(str) {
      return ((__a = $yy.call($ys, str)) == $yb ? $break() : __a);
    });
  });

  $defn(self, 'gsub', function(pattern, replace) { var self = this;
    var r = pattern.toString();
    r = r.substr(1, r.lastIndexOf('/') - 1);
    r = new RegExp(r, 'g');
    return self.replace(r, function(str) {
      return replace;
    });
  });

  $defn(self, 'slice', function(start, finish) { var self = this;if (finish == undefined) {finish = nil;}
    return self.substr(start, finish);
  });

  $defn(self, 'split', function(split, limit) { var self = this;if (limit == undefined) {limit = nil;}
    return self.split(split);
  });













  $defn(self, '<=>', function(other) { var self = this;
    if (!(other.o$f & T_STRING)) return nil;
    else if (self > other) return 1;
    else if (self < other) return -1;
    return 0;
  });










  $defn(self, '=~', function(obj) { var self = this;
    if (obj.o$f & T_STRING) {
      raise(eTypeError, "type mismatch: String given");
    }

    return obj['m$=~'](self);
  });











  $defn(self, 'casecmp', function(other) { var self = this;
    if (typeof other != 'string') return nil;
    var a = self.toLowerCase(), b = other.toLowerCase();
    if (a > b) return 1;
    else if (a < b) return -1;
    return 0;
  });











  $defn(self, 'empty?', function() { var self = this;
    return self.length == 0;
  });










  $defn(self, 'end_with?', function(suffix) { var self = this;
    if (self.lastIndexOf(suffix) == self.length - suffix.length) {
      return true;
    }

    return false;
  });





  $defn(self, 'eql?', function(other) { var self = this;
    return self == other;
  });

  $defn(self, '+', function(other) { var self = this;
    return self + other;
  });










  $defn(self, 'include?', function(other) { var self = this;
    return self.indexOf(other) == -1 ? false : true;
  });















  $defn(self, 'index', function(substr) { var self = this;
    var res = self.indexOf(substr);

    return res == -1 ? nil : res;
  });











  return $defn(self, 'lstrip', function() { var self = this;
    return self.replace(/^\s*/, '');
  });
}, 0);






























$class(self, nil, 'Proc', function(self) {

  $defs(self, 'new', function() { var self = this;var $y = $B, $yy, $ys, $yb = $y.b;if ($y.f == arguments.callee) { $yy = $y.p; }else { $yy = $y.y; }$y.f = nil ;$ys = $yy.$self;var __a;var block = (($yy == $y.y) ? nil: $yy);

    if(!((__a = ($yy !== $y.y), __a !== false && __a !== nil))) {self.m$raise($cg(self, 'ArgumentError'), "tried to create Proc object without a block")};

    return block;
  });

  $defn(self, 'to_proc', function() { var self = this;
    return self;
  });

  $defn(self, 'call', function(args) { var self = this;args = [].slice.call(arguments, 0);
    return self.apply(self.o$s,args);
  });

  $defn(self, 'to_s', function() { var self = this;
    return "#<Proc:0x" + (self.$h() * 400487).toString(16) + (self.$lambda ? ' (lambda)' : '') + ">";
  });

  return $defn(self, 'lambda?', function() { var self = this;
    return self.$lambda;
  });
}, 0);

$class(self, nil, 'Range', function(self) {

  $defn(self, 'begin', function() { var self = this;
    return self.beg;
  });

  self.m$alias_method('first', 'begin');

  $defn(self, 'end', function() { var self = this;
    return self.end;
  });

  $defn(self, 'to_s', function() { var self = this;
    var str = self.beg.m$to_s();
    var str2 = self.end.m$to_s();
    var join = self.exc ? '...' : '..';
    return str + join + str2;
  });

  return $defn(self, 'inspect', function() { var self = this;
    var str = self.beg.m$inspect();
    var str2 = self.end.m$inspect();
    var join = self.exc ? '...' : '..';
    return str + join + str2;
  });
}, 0);




















$class(self, nil, 'Regexp', function(self) {

  $defs(self, 'escape', function(s) { var self = this;
    return s;
  });

  $defs(self, 'new', function(s) { var self = this;
    return new RegExp(s);
  });

  $defn(self, 'inspect', function() { var self = this;
    return self.toString();
  });

  $defn(self, 'to_s', function() { var self = this;
    return self.source;
  });

  $defn(self, '==', function(other) { var self = this;
    return self.toString() === other.toString();
  });

  $defn(self, 'eql?', function(other) { var self = this;
    return self.valueOf() === other.valueOf();
  });







  $defn(self, '=~', function(str) { var self = this;
    var result = self.exec(str);
    $rb.X = result;

    if (result) {
      return result.index;
    }
    else {
      return nil;
    }
  });

  return $defn(self, 'match', function(pattern) { var self = this;
    self['m$=~'](pattern);
    return $rb.gg('$~');
  });
}, 0);

$class(self, nil, 'MatchData', function(self) {

  $defn(self, 'inspect', function() { var self = this;
    return ("#<MatchData " + (self.$data[0].m$inspect()).m$to_s() + ">");
  });

  $defn(self, 'to_s', function() { var self = this;
    return self.$data[0];
  });

  $defn(self, 'length', function() { var self = this;
    return self.$data.length;
  });

  $defn(self, 'size', function() { var self = this;
    return self.$data.length;
  });

  $defn(self, 'to_a', function() { var self = this;
    return [].slice.call(self.$data, 0);
  });

  return $defn(self, '[]', function(index) { var self = this;
    var length = self.$data.length;

    if (index < 0) index += length;

    if (index >= length || index < 0) return nil;

    return self.$data[index];
  });
}, 0);


$class(self, nil, 'File', function(self) {








  $defs(self, 'expand_path', function(file_name, dir_string) { var self = this;var __a;if (dir_string == undefined) {dir_string = nil;}
    if ((__a = dir_string, __a !== false && __a !== nil)) {
      return Op.fs.expand_path(file_name, dir_string);
    } else {
      return Op.fs.expand_path(file_name);
    }
  });






  $defs(self, 'join', function(str) { var self = this;str = [].slice.call(arguments, 0);
    return Op.fs.join.apply(Op.fs, str);
  });






  $defs(self, 'dirname', function(file_name) { var self = this;
    return Op.fs.dirname(file_name);
  });





  $defs(self, 'extname', function(file_name) { var self = this;
    return Op.fs.extname(file_name);
  });








  $defs(self, 'basename', function(file_name, suffix) { var self = this;
    return Op.fs.basename(file_name, suffix);
  });

  return $defs(self, 'exist?', function(path) { var self = this;
    return Op.fs.exist_p(path);
  });
}, 0);


return $class(self, nil, 'Dir', function(self) {




  $defs(self, 'getwd', function() { var self = this;
    return Op.fs.cwd;
  });




  $defs(self, 'pwd', function() { var self = this;
    return Op.fs.cwd;
  });

  return $defs(self, '[]', function(a) { var self = this;a = [].slice.call(arguments, 0);
    return Op.fs.glob.apply(Op.fs, a);
  });
}, 0);
}
var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, $class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, $range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm;return $$();
};
init();

})(undefined);

// if in a commonjs system already (node etc), exports become our opal
// object. Otherwise, in the browser, we just get a top level opal var
if ((typeof require !== 'undefined') && (typeof module !== 'undefined')) {
  module.exports = opalscript;
}
