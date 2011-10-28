function rb_obj_dummy() {
  return null;
}

function rb_class_s_new(cls, _, sup) {
  sup = sup || rb_cObject;
  var block = rb_class_s_new.$B;

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

  if (block = rb_class_new_instance.$B) {
    rb_class_new_instance.$B = null;
    init.$B = block;
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

  if (block = rb_mod_new.$B) {
    rb_mod_new.$B = null;

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

  if (block = rb_mod_define_method.$B) {
    rb_mod_define_method.$B = null;
  } else {
    rb_raise(rb_eLocalJumpError, "no block given");
  }

  rb_define_method(mod, name, block);
  return null;
}

function Init_Object() {
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

  rb_define_singleton_method(rb_cClass, "new", rb_class_s_new);
  rb_define_method(rb_cClass, "allocate", rb_obj_alloc);
  rb_define_method(rb_cClass, "new", rb_class_new_instance);
  rb_define_method(rb_cClass, "inherited", rb_obj_dummy);
  rb_define_method(rb_cClass, "superclass", rb_class_superclass);
  rb_define_method(rb_cClass, "from_native", rb_class_from_native);
}
