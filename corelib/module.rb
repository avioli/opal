class Module
  def extend(*modules)
    modules.each {|mod|
      `rb_extend_module(self, mod);`
    }

    self
  end

  def include(*modules)
    `var i = modules.length - 1, mod;
    while (i >= 0) {
      mod = modules[i];
      #{`mod`.append_features self};
      #{`mod`.included self};
      i--;
    }
    return self;`
    self
  end

  def included(mod)
    nil
  end

  def instance_methods
    `self.$methods`
  end

  def class_eval(&block)
    `block(self, null)`
  end

  alias_method :module_eval, :class_eval

  def name
    `self.__classid__`
  end

  alias_method :public_instance_methods, :instance_methods

  alias_method :to_s, :name
end
