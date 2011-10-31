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

function Init_Object() {
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
}
