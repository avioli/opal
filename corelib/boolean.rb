class Boolean
  def to_s
    `self ? 'true' : 'false'`
  end

  def ==(other)
    `self === other`
  end

  def class
    `return self ? #{TrueClass} : #{FalseClass};`
  end
end

class TrueClass
  def self.===(obj)
    `obj === true`
  end
end

class FalseClass
  def self.===(obj)
    `obj === false`
  end
end

TRUE  = true
FALSE = false
