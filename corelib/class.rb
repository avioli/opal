class Class < Module
  def self.new(sup = Object, &block)
    `
      var klass = rb_define_class_id('AnonClass', sup);

      if (sup.m$inherited) {
        sup.m$inherited(sup, 'inherited', klass);
      }

      if (block) {
        block(klass, null);
      }

      return klass;
    `
  end

  def self.typeof (value)
    `typeof(value)`
  end

  def allocate
    `new self.$a()`
  end

  def new(*args, &block)
    obj = allocate
    obj.initialize *args, &block

    obj
  end

  def inherited(klass)
    nil
  end

  def superclass
    `
      var sup = self.$s;

      if (!sup) {
        if (self == rb_cBasicObject) {
          return null;
        }

        #{raise RuntimeError, 'uninitialized class'};
      }

      return sup;
    `
  end

  # This will wrap the given `obj` by an instance of this class. A new
  # instance is created and a `@native` instance variable set with the
  # given obj. No additional properties are added to obj as this may
  # cause problems with garbage collection etc.
  #
  # The returned object will not have `#initialize` called, or indeed
  # `.allocate` called as all the work is done internally.
  #
  # @param [NativeObject] obj object to wrap
  # @return [Object] new instance of this class
  def from_native (object)
    %x{
      var inst    = new self.$a();
      inst.native = object;

      return inst;
    }
  end
end
