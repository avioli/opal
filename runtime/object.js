function rb_obj_dummy() {
  return null;
}

function rb_class_s_new(cls, _, sup) {
  sup = sup || rb_cObject;
  var block = rb_class_s_new.proc;

  var klass = rb_define_class_id('AnonClass', sup);

  if (sup.$m.inherited) {
    sup.$m.inherited(sup, 'inherited', klass);
  }

  if (block) {
    block(klass, null);
  }

  return klass;
}

/**
 * :call-seq:
 *  class.allocate()    -> obj
 */
function rb_obj_alloc(cls) {
  return new RObject(cls);
}

/**
 * :call-seq:
 *    class.new()      -> obj
 */
function rb_class_new_instance(cls, mid, args) {
  args = ArraySlice.call(arguments, 2);

  var block;

  var obj = cls.$m.allocate(cls, "allocate");
  var init = obj.$m.initialize;

  if (block = rb_class_new_instance.proc) {
    rb_class_new_instance.proc = null;
    init.proc = block;
  }

  init.apply(null, [obj, "initialize"].concat(args));

  return obj;
}

/**
 * :call-seq:
 *    class.superclass  -> a_super_class or nil
 */
function rb_class_superclass(klass) {
  var sup = klass.$super;

  if (!sup) {
    if (klass === rb_cBasicObject) {
      return null;
    }

    rb_raise(rb_eRuntimeError, "uninitialized class");
  }

  return sup;
}

/**
 * :call-seq:
 *    class.from_native(object)     -> object
 *
 * Returns the given +object+, adding the neccessary properties to make
 * it a true instance of the receiver class.
 *
 *    a = Object.from_native(`console`)     # => #<Object:0x00000>
 *    a.class     # => Object
 */
function rb_class_from_native(klass, mid, object) {
  return rb_from_native(klass, object);
}

function rb_mod_constants(mod) {
  rb_raise(rb_eNotImplementedError, "Module.constants");
}

function rb_mod_nesting(mod) {
  rb_raise(rb_eNotImplementedError, "Module.nesting");
}

function rb_mod_new() {
  var block;

  var mod = rb_define_module_id();

  if (block = rb_mod_new.proc) {
    rb_mod_new.proc = null;

    block(mod, null);
  }

  return mod;
}

/**
 * :call-seq:
 *    mod === obj     -> true or false
 */
function rb_mod_eqq(mod, mid, obj) {
  // FIXME: remove this line
  return false;
  return rb_obj_is_kind_of(obj, mod);
}

/**
 * :call-seq:
 *    alias_method(new_name, old_name)    -> nil
 */
function rb_mod_alias_method(mod, mid, name, old) {
  rb_alias_method(mod, name, old);
  return mod;
}

/**
 * :call-seq:
 *    mod.ancestors         -> array
 */
function rb_mod_ancestors(mod) {
  var result = [];

  while (mod) {
    if (mod.$flags & FL_SINGLETON) {
      // nothing?
    }
    else {
      result.push(mod);
    }

    mod = mod.$super;
  }

  return result;
}

function rb_attr(mod, attr, reader, writer) {
  if (reader) {
    rb_define_method(mod, attr, function(obj) {
      return obj[attr];
    });
  }

  if (writer) {
    rb_define_method(mod, attr + '=', function(obj, mid, val) {
      return obj[attr] = val;
    });
  }
}

/**
 * :call-seq:
 *    attr_accessor(symbol, ...)    -> nil
 */
function rb_mod_attr_accessor(mod) {
  var argv = ArraySlice.call(arguments, 2), argc = argv.length;

  for (var i = 0; i < argc; i++) {
    rb_attr(mod, argv[i], true, true);
  }

  return null;
}

/**
 * :call-seq:
 *    attr_reader(symbol, ...)    -> nil
 */
function rb_mod_attr_reader(mod) {
  var argv = ArraySlice.call(arguments, 2), argc = argv.length;

  for (var i = 0; i < argc; i++) {
    rb_attr(mod, argv[i], true, false);
  }

  return null;
}

/**
 * :call-seq:
 *    attr_writer(symbol, ...)    -> nil
 */
function rb_mod_attr_writer(mod) {

  var argv = ArraySlice.call(arguments, 2), argc = argv.length;

  for (var i = 0; i < argc; i++) {
    rb_attr(mod, argv[i], false, true);
  }

  return null;
}

/**
 * :call-seq:
 *    mod.append_features(klass)      -> mod
 */
function rb_mod_append_features(mod, mid, klass) {
  rb_include_module(klass, mod);
  return mod;
}

/**
 * :call-seq:
 *    mod.const_set(sym, obj)     -> obj
 */
function rb_mod_const_set(mod, name, value) {
  return rb_const_set(mod, name, value);
}

/**
 * :call-seq:
 *    mod.define_method(sym, &block)    -> nil
 */
function rb_mod_define_method(mod, mid, name) {
  var block;

  if (block = rb_mod_define_method.proc) {
    rb_mod_define_method.proc = null;
  } else {
    rb_raise(rb_eLocalJumpError, "no block given");
  }

  rb_define_method(mod, name, block);
  return null;
}

/**
 * :call-seq:
 *    class.extend(mod, ...)    -> class
 */
function rb_mod_extend(klass) {
  var mods = ArraySlice.call(arguments, 2);

  for (var i = 0; i < mods.length; i++) {
    rb_extend_module(klass, mods[i]);
  }

  return klass;
}

/**
 * :call-seq:
 *    class.include(mod, ...)     -> class
 */
function rb_mod_include(klass) {
  var mods = ArraySlice.call(arguments, 2), i = mods.length - 1, mod;

  while (i >= 0) {
    mod = mods[i];
    mod.$m.append_features(mod, "append_features", klass);
    mod.$m.included(mod, "included", klass);
    i--;
  }

  return klass;
}

/**
 * :call-seq:
 *    class.instance_methods          -> ary
 *    class.public_instance_methods   -> ary
 */
function rb_class_instance_methods(klass) {
  return klass.$methods;
}

/**
 * :call-seq:
 *    class.module_eval {}      -> class
 *    class.class_eval {}       -> class
 */
function rb_mod_module_eval(klass) {
  var block = rb_mod_module_eval.proc;

  if (block) {
    rb_mod_module_eval.proc = null;
    block(klass, null);
  }
  else {
    rb_raise(rb_eArgError, "No block given");
  }

  return klass;
}

/**
 * :call-seq:
 *    mod.name        -> str
 *    mod.to_s        -> str
 */
function rb_mod_name(mod) {
  return mod.__classid__;
}

/**
 * call-seq:
 *    obj == obj2       -> true or false
 *    obj.eql? obj2     -> true or false
 *    obj.equal?(obj2)  -> true or false
 */
function rb_obj_equal(obj, mid, obj2) {
  return obj === obj2;
}

/**
 * call-seq:
 *    obj.__send__(sym, *args)    -> an_obj
 */
function rb_obj_send(obj, mid, sym) {
  var args = ArraySlice.call(arguments, 3);
  return obj.$m[sym].apply(null, [obj, sym].concat(args));
}

/**
 * call-seq:
 *    obj.instance_eval {}    -> some_obj
 */
function rb_obj_instance_eval(obj) {
  var block = rb_obj_instance_eval.proc;

  if (!block) {
    rb_raise(rb_eArgError, "block not supplied");
  }

  rb_obj_instance_eval.proc = null;

  return block(obj, null);
}

/**
 * call-seq:
 *    obj.instance_exec(*args) {}     -> some_obj
 */
function rb_obj_instance_exec(obj) {
  var block = rb_obj_instance_exec.proc;

  if (!block) {
    rb_raise(rb_eArgError, "block not supplied");
  }

  rb_obj_instance_exec.proc = null;

  return block.apply(null, [obj, null].concat(ArraySlice.cal(arguments, 2)));
}

/**
 * call-seq:
 *    obj.method_missing(sym, *args)
 */
function rb_obj_method_missing(obj, mid, sym) {
  rb_raise(rb_eNoMethodError, "undefined method `" + sym + "` for "
           + (obj == null ? NilObj : obj).$m.inspect(obj, "inspect"));
}

/**
 * call-seq:
 *    obj.methds                  -> ary
 *    obj.private_methods         -> ary
 *    obj.protected_methods       -> ary
 *    obj.public_methods          -> ary
 */
function rb_obj_methods(obj) {
  return obj.$klass.methods;
}

/**
 * call-seq:
 *    Array(obj)    -> array
 */
function rb_f_array(obj) {
  if (obj == undefined) {
    return [];
  }

  if (obj.$flags & T_ARRAY) {
    return obj;
  }

  return obj.$m.to_a(obj, "to_a");
}

/**
 * call-seq:
 *    String(obj)     -> string
 */
function rb_f_string(obj) {
  return (obj == null ? NilObj : obj).$m.to_s(obj, "to_s");
}

/**
 * call-seq:
 *    obj.__callee__    -> object
 */
function rb_obj_callee(obj) {
  rb_raise(rb_eNotImplementedError, "Kernel#__callee__");
}

/**
 * call-seq:
 *    obj.__flags__     -> number
 */
function rb_obj_flags(obj) {
  return obj.$flags;
}

/**
 * call-seq:
 *    obj.__id__    -> number
 */
function rb_obj_id(obj) {
  return obj.$id;
}

/**
 * call-seq:
 *    `some code`     -> nil
 */
function rb_obj_xstring() {
  rb_raise(rb_eNotImplementedError, "Kernel#`");
}

/**
 * call-seq:
 *    obj =~ other    -> nil
 */
function rb_obj_match(obj, other) {
  return null;
}

/**
 * call-seq:
 *    obj.class     -> class
 */
function rb_obj_class(obj) {
  return rb_class_real(obj.$klass);
}

/**
 * call-seq:
 *    obj.singleton_class     -> class
 */
function rb_obj_singleton_class(obj) {
  return rb_singleton_class(obj);
}

/**
 * call-seq:
 *    obj.clone     -> an_object
 */
function rb_obj_clone(obj) {
  var clone = rb_obj_alloc(rb_obj_class(obj));

  for (var ivar in obj) {
    clone[ivar] = obj[ivar];
  }

  return clone;
}

/**
 * call-seq:
 *    obj.define_singleton_method(name, &block)     -> nil
 */
function rb_obj_define_singleton_method(obj, mid, name) {
  var block = rb_obj_define_singleton_method.proc;

  if (!block) {
    rb_raise(rb_eLocalJumpError, "no block given");
  }

  rb_obj_define_singleton_method.proc = null;

  rb_define_singleton_method(obj, name, block);

  return null;
}

/**
 * call-seq:
 *    obj.extend(*mods)   -> obj
 */
function rb_obj_extend(obj) {
  var mods = ArraySlice.call(arguments, 2);

  for (var i = 0, ii = mods.length; i < ii; i++) {
    rb_extend_module(rb_singleton_class(obj), mods[i]);
  }

  return obj;
}

/**
 * call-seq:
 *    obj.instance_variable_defined?(sym)     -> true or false
 */
function rb_obj_ivar_defined(obj, mid, name) {
  return obj.hasOwnProperty(name.substr(1));
}

/**
 * call-seq:
 *    obj.instance_variable_get(name)       -> an_object
 */
function rb_obj_ivar_get(obj, mid, name) {
  return obj[name.substr(1)];
}

/**
 * call-seq:
 *    obj.instance_variable_set(name, value)    -> value
 */
function rb_obj_ivar_set(obj, mid, name, value) {
  return obj[name.substr(1)] = value;
}

/**
 * call-seq:
 *    obj.instance_variables    -> ary
 */
function rb_obj_instance_variables(obj) {
  var result = [];

  for (var ivar in obj) {
    result.push(ivar);
  }

  return result;
}

/**
 * call-seq:
 *    obj.instance_of?(class)     -> true or false
 */
function rb_obj_is_instance_of(obj, mid, klass) {
  return obj.$klass === klass;
}

/**
 * call-seq:
 *    obj.kind_of?(class)       -> true or false
 *    obj.is_a?(class)          -> true or false
 */
function rb_obj_is_kind_of(obj, mid, klass) {
  var test = obj.$klass;

  while (test) {
    if (test === klass) {
      return true;
    }

    test = test.$super;
  }

  return false;
}

/**
 * call-seq:
 *    obj.method(sym)     -> method
 */
function rb_obj_method(obj, mid, method) {
  return obj.$m[method];
}

/**
 * call-seq:
 *    any_method      -> false
 */
function rb_false() {
  return false;
}

/**
 * call-seq:
 *    any_method      -> true
 */
function rb_true() {
  return true;
}

/**
 * call-seq:
 *    puts(str)     -> nil
 */
function rb_obj_puts(obj) {
  var args = ArraySlice.call(arguments, 2);
  return rb_stdout.$m.puts.apply(null, [rb_stdout, "null"].concat(args));
}

/**
 * call-seq:
 *    print(str)    -> nil
 */
function rb_obj_print(obj) {
  var args = ArraySlice.call(arguments, 2);
  return rb_stdout.$m.print.apply(null, [rb_stdout, "null"].concat(args));
}

/**
 * call-seq:
 *    obj.respond_to?(sym)    -> true or false
 */
function rb_obj_respond_to(obj, mid, name) {
  var method = (obj == null ? NilObj : obj).$m[name];

  if (method && !method.$mm) {
    return true;
  }

  return false;
}

/**
 * call-seq:
 *    obj === other     -> true or false
 */
function rb_equal(obj, mid, obj2) {
  return obj === obj2;
}

/**
 * call-seq:
 *    rand      -> num
 */
function rb_obj_rand(obj, mid, max) {
  if (max === undefined) {
    return Math.random();
  }
  else {
    return Math.floor(Math.random() * max);
  }
}

/**
 * call-seq:
 *    obj.to_s      -> string
 */
function rb_obj_to_s(obj) {
  return "#<" + rb_class_real(obj.$klass) + ":0x" + (obj.$id * 400487).toString(16) + ">";
}

/**
 * call-seq:
 *    obj.inspect     -> string
 */
function rb_obj_inspect(obj) {
  return obj.$m.to_s(obj, "to_s");
}

/**
 * call-seq:
 *    obj.const_set(sym, obj)     -> obj
 */
function rb_obj_const_set(obj, mid, name, value) {
  return rb_const_set(rb_class_real(obj.$klass), name, value);
}

/**
 * call-seq:
 *    obj.const_defined?(name)    -> true or false
 */
function rb_obj_const_defined(obj, mid, name) {
  return false;
}

/**
 * call-seq:
 *    raise(err)
 *    fail(err)
 */
function rb_obj_raise(obj, mid, exception, string) {
  var msg, exc;

  if (typeof(exception) === 'string') {
    msg = exception;
    exc = rb_obj_alloc(rb_eRuntimeError);
    exc.message = msg;
  }
  else if (rb_obj_is_kind_of(exception, null, rb_eException)) {
    exc = exception;
  }
  else {
    if (string !== undefined) {
      msg = string;
    }

    exc = rb_obj_alloc(exception);
    exc.message = msg;
  }

  rb_raise_exc(exc);
}

/**
 * call-seq:
 *    require(path)     -> true or false
 */
function rb_obj_require(obj, mid, path) {
  return rb_require(path);
}

/**
 * call-seq:
 *    loop do; end    -> obj
 */
function rb_obj_loop(obj) {
  var block = rb_obj_loop.proc;

  if (!block) {
    return obj;
  }

  rb_obj_loop.proc = null;
  var yself = block.self;

  while (true) {
    block(yself, null);
  }

  return obj;
}

/**
 * call-seq:
 *    at_exit {}    -> proc
 */
function rb_obj_at_exit() {
  var block = rb_obj_at_exit.proc;

  if (!block) {
    rb_raise(rb_eArgError, "called without a block");
  }

  rb_obj_at_exit.proc = null;
  rb_end_procs.push(block);

  return block;
}

/**
 * call-seq:
 *    proc {}     -> proc
 */
function rb_obj_proc() {
  var block = rb_obj_proc.proc;

  if (!block) {
    rb_raise(rb_eArgError, "tried to create Proc object without a block");
  }

  rb_obj_proc.proc = null;

  return block;
}

/**
 * call-seq:
 *    lambda {}     -> proc
 */
function rb_obj_lambda() {
  var block = rb_obj_lambda.proc;

  if (!block) {
    rb_raise(rb_eArgError, "tried to create Proc object without a block");
  }

  rb_obj_lambda.proc = null;

  return rb_make_lambda(block);
}

/**
 * call-seq:
 *    tap {}    -> obj
 */
function rb_obj_tap(obj) {
  var block = rb_obj_tap.proc;

  if (!block) {
    rb_raise(rb_eArgError, "no block given");
  }

  rb_obj_tap.proc = null;

  block(block.self, null, obj);

  return obj;
}

/**
 * call-seq:
 *    nil == other    -> true or false
 */
function rb_nil_equal(nil, mid, other) {
  return other == null;
}

/**
 * call-seq:
 *    nil.to_i      -> 0
 */
function rb_nil_to_i() {
  return 0;
}

/**
 * call-seq:
 *    nil.to_f    -> 0.0
 */
function rb_nil_to_f() {
  return 0.0;
}

/**
 * call-seq:
 *    nil.to_s    -> ""
 */
function rb_nil_to_s() {
  return "";
}

/**
 * call-seq:
 *    nil.to_a    -> []
 */
function rb_nil_to_a() {
  return [];
}

/**
 * call-seq:
 *    nil.inspect     -> "nil"
 */
function rb_nil_inspect() {
  return "nil";
}

/**
 * call-seq:
 *    nil.class     -> NilClass
 *
 * Special override for nilclass as the normal lookup assumes we have a real
 * object, which null isnt.
 */
function rb_nil_class() {
  return rb_cNilClass;
}

/**
 * call-seq:
 *    false & obj     -> false
 *    nil & obj       -> false
 */
function rb_false_and() {
  return false;
}

/**
 * call-seq:
 *    false | obj     -> true or false
 *    nil | obj       -> true or false
 */
function rb_false_or(obj, mid, obj2) {
  return obj2 === false || obj2 == null ? false : true;
}

/**
 * call-seq:
 *    false ^ obj     -> true or false
 *    nil ^ obj       -> true or false
 */
function rb_false_xor(obj, mid, obj2) {
  return obj2 === false || obj2 == null ? false : true;
}

/**
 * call-seq
 *    true.to_s     -> "true"
 *    false.to_s    -> "false"
 *
 * Special override for Boolean class that actually represents both
 * true and false.
 */
function rb_bool_to_s(bool) {
  return bool ? "true" : "false";
}

/**
 * call-seq:
 *    true == obj     -> true or false
 *    false == obj    -> true or false
 *
 * Special overide for Boolean.
 */
function rb_bool_equal(bool, mid, other) {
  return bool === other;
}

/**
 * call-seq:
 *    true.class    -> TrueClass
 *    false.class   -> FalseClass
 */
function rb_bool_class(bool) {
  return bool ? rb_cTrueClass : rb_cFalseClass;
}

/**
 * call-seq:
 *    TrueClass === obj     -> true or false
 */
function rb_true_eqq(cls, mid, obj) {
  return obj === true;
}

/**
 * call-seq:
 *    FalseClass === obj    -> true or false
 */
function rb_false_eqq(cls, mid, obj) {
  return obj === false;
}

function Init_Object() {
  var metaclass;

  rb_cBasicObject = boot_defrootclass('BasicObject');
  rb_cObject      = boot_defclass('Object', rb_cBasicObject);
  rb_cModule      = boot_defclass('Module', rb_cObject);
  rb_cClass       = boot_defclass('Class',  rb_cModule);

  rb_const_set(rb_cObject, 'BasicObject', rb_cBasicObject);

  metaclass = rb_make_metaclass(rb_cBasicObject, rb_cClass);
  metaclass = rb_make_metaclass(rb_cObject, metaclass);
  metaclass = rb_make_metaclass(rb_cModule, metaclass);
  metaclass = rb_make_metaclass(rb_cClass, metaclass);

  rb_boot_defmetametaclass(rb_cModule, metaclass);
  rb_boot_defmetametaclass(rb_cObject, metaclass);
  rb_boot_defmetametaclass(rb_cBasicObject, metaclass);

  rb_mKernel      = rb_define_module('Kernel');

  rb_include_module(rb_cObject, rb_mKernel);

  rb_define_method(rb_cBasicObject, "initialize", rb_obj_dummy);
  rb_define_method(rb_cBasicObject, "==", rb_obj_equal);
  rb_define_method(rb_cBasicObject, "eql?", rb_obj_equal);
  rb_define_method(rb_cBasicObject, "equal?", rb_obj_equal);

  rb_define_method(rb_cBasicObject, "__send__", rb_obj_send);
  rb_define_method(rb_cBasicObject, "instance_eval", rb_obj_instance_eval);
  rb_define_method(rb_cBasicObject, "instance_exec", rb_obj_instance_exec);
  rb_define_method(rb_cBasicObject, "method_missing", rb_obj_method_missing);

  rb_define_method(rb_cBasicObject, "singleton_method_added", rb_obj_dummy);
  rb_define_method(rb_cBasicObject, "singleton_method_removed", rb_obj_dummy);
  rb_define_method(rb_cBasicObject, "singleton_method_undefined", rb_obj_dummy);

  rb_define_method(rb_cObject, "methods", rb_obj_methods);
  rb_define_method(rb_cObject, "private_methods", rb_obj_methods);
  rb_define_method(rb_cObject, "protected_methods", rb_obj_methods);
  rb_define_method(rb_cObject, "public_methods", rb_obj_methods);

  rb_define_method(rb_mKernel, "Array", rb_f_array);
  rb_define_method(rb_mKernel, "String", rb_f_string);

  rb_define_method(rb_mKernel, "to_s", rb_obj_to_s);
  rb_define_method(rb_mKernel, "inspect", rb_obj_inspect);

  rb_define_method(rb_mKernel, "__callee__", rb_obj_callee);
  rb_define_method(rb_mKernel, "__method__", rb_obj_callee);
  rb_define_method(rb_mKernel, "__flags__", rb_obj_flags);
  rb_define_method(rb_mKernel, "__id__", rb_obj_id);
  rb_define_method(rb_mKernel, "object_id", rb_obj_id);
  rb_define_method(rb_mKernel, "hash", rb_obj_id);

  rb_define_method(rb_mKernel, "`", rb_obj_xstring);
  rb_define_method(rb_mKernel, "=~", rb_obj_match);
  rb_define_method(rb_mKernel, "nil?", rb_false);

  rb_define_method(rb_mKernel, "class", rb_obj_class);
  rb_define_method(rb_mKernel, "singleton_class", rb_obj_singleton_class);
  rb_define_method(rb_mKernel, "clone", rb_obj_clone);
  rb_define_method(rb_mKernel, "dup", rb_obj_clone);

  rb_define_method(rb_mKernel, "define_singleton_method", rb_obj_define_singleton_method);
  rb_define_method(rb_mKernel, "extend", rb_obj_extend);

  rb_define_method(rb_mKernel, "instance_variable_defined?", rb_obj_ivar_defined);
  rb_define_method(rb_mKernel, "instance_variable_get", rb_obj_ivar_get);
  rb_define_method(rb_mKernel, "instance_variable_set", rb_obj_ivar_set);
  rb_define_method(rb_mKernel, "instance_variables", rb_obj_instance_variables);

  rb_define_method(rb_mKernel, "instance_of?", rb_obj_is_instance_of);
  rb_define_method(rb_mKernel, "kind_of?", rb_obj_is_kind_of);
  rb_define_method(rb_mKernel, "is_a?", rb_obj_is_kind_of);

  rb_define_method(rb_mKernel, "method", rb_obj_method);
  rb_define_method(rb_mKernel, "public_method", rb_obj_method);

  rb_define_method(rb_mKernel, "puts", rb_obj_puts);
  rb_define_method(rb_mKernel, "print", rb_obj_print);

  rb_define_method(rb_mKernel, "raise", rb_obj_raise);
  rb_define_method(rb_mKernel, "fail", rb_obj_raise);

  rb_define_method(rb_mKernel, "require", rb_obj_require);
  rb_define_method(rb_mKernel, "loop", rb_obj_loop);

  rb_define_method(rb_mKernel, "at_exit", rb_obj_at_exit);
  rb_define_method(rb_mKernel, "proc", rb_obj_proc);
  rb_define_method(rb_mKernel, "lambda", rb_obj_lambda);
  rb_define_method(rb_mKernel, "tap", rb_obj_tap);

  rb_define_method(rb_mKernel, "respond_to?", rb_obj_respond_to);
  rb_define_method(rb_mKernel, "===", rb_equal);
  rb_define_method(rb_mKernel, "send", rb_obj_send);
  rb_define_method(rb_mKernel, "rand", rb_obj_rand);

  rb_define_method(rb_mKernel, "const_set", rb_obj_const_set);
  rb_define_method(rb_mKernel, "const_defined?", rb_obj_const_defined);

  rb_define_singleton_method(rb_cModule, "constants", rb_mod_constants);
  rb_define_singleton_method(rb_cModule, "nesting", rb_mod_nesting);
  rb_define_singleton_method(rb_cModule, "new", rb_mod_new);

  rb_define_method(rb_cModule, "===", rb_mod_eqq);
  rb_define_method(rb_cModule, "alias_method", rb_mod_alias_method);
  rb_define_method(rb_cModule, "ancestors", rb_mod_ancestors);

  rb_define_method(rb_cModule, "attr_accessor", rb_mod_attr_accessor);
  rb_define_method(rb_cModule, "attr_reader", rb_mod_attr_reader);
  rb_define_method(rb_cModule, "attr_writer", rb_mod_attr_writer);

  rb_define_method(rb_cModule, "append_features", rb_mod_append_features);
  rb_define_method(rb_cModule, "const_set", rb_mod_const_set);
  rb_define_method(rb_cModule, "define_method", rb_mod_define_method);
  rb_define_method(rb_cModule, "extend", rb_mod_extend);
  rb_define_method(rb_cModule, "include", rb_mod_include);
  rb_define_method(rb_cModule, "included", rb_obj_dummy);

  rb_define_method(rb_cModule, "instance_methods", rb_class_instance_methods);
  rb_define_method(rb_cModule, "public_instance_methods", rb_class_instance_methods);

  rb_define_method(rb_cModule, "module_eval", rb_mod_module_eval);
  rb_define_method(rb_cModule, "class_eval", rb_mod_module_eval);

  rb_define_method(rb_cModule, "name", rb_mod_name);
  rb_define_method(rb_cModule, "to_s", rb_mod_name);

  rb_define_singleton_method(rb_cClass, "new", rb_class_s_new);
  rb_define_method(rb_cClass, "allocate", rb_obj_alloc);
  rb_define_method(rb_cClass, "new", rb_class_new_instance);
  rb_define_method(rb_cClass, "inherited", rb_obj_dummy);
  rb_define_method(rb_cClass, "superclass", rb_class_superclass);
  rb_define_method(rb_cClass, "from_native", rb_class_from_native);

  rb_cNilClass = rb_define_class("NilClass", rb_cObject);
  Rt.NC = NilObj = rb_obj_alloc(rb_cNilClass);
  Qnil = null;

  rb_define_method(rb_cNilClass, "nil?", rb_true);
  rb_define_method(rb_cNilClass, "==", rb_nil_equal);
  rb_define_method(rb_cNilClass, "to_i", rb_nil_to_i);
  rb_define_method(rb_cNilClass, "to_f", rb_nil_to_f);
  rb_define_method(rb_cNilClass, "to_a", rb_nil_to_a);
  rb_define_method(rb_cNilClass, "to_s", rb_nil_to_s);
  rb_define_method(rb_cNilClass, "inspect", rb_nil_inspect);
  rb_define_method(rb_cNilClass, "&", rb_false_and);
  rb_define_method(rb_cNilClass, "|", rb_false_or);
  rb_define_method(rb_cNilClass, "^", rb_false_xor);
  rb_define_method(rb_cNilClass, "class", rb_nil_class);

  rb_cBoolean = rb_bridge_class(Boolean.prototype,
                                T_OBJECT | T_BOOLEAN, "Boolean", rb_cObject);

  rb_define_method(rb_cBoolean, "to_s", rb_bool_to_s);
  rb_define_method(rb_cBoolean, "==", rb_bool_equal);
  rb_define_method(rb_cBoolean, "class", rb_bool_class);

  rb_cTrueClass = rb_define_class("TrueClass", rb_cObject);
  rb_define_singleton_method(rb_cTrueClass, "===", rb_true_eqq);

  rb_cFalseClass = rb_define_class("FalseClass", rb_cObject);
  rb_define_singleton_method(rb_cFalseClass, "===", rb_false_eqq);
}
