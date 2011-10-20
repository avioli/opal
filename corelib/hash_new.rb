Opal.begin

class Hash

  def ==(other)
    if self == other
      true
    elsif !other.k or !other.a
      false
    elsif @k.length != other.k.length
      false
    else
      values  = @a
      values2 = other.a

      for key in @k
        hash = Opal.hash key

        unless values2.hasOwnProperty hash
          return false
        end

        unless Opal.send(values[hash], :==, values2[hash])
          return false
        end
      end

      return true
    end
  end

  def [](key)
    assoc = Opal.hash key

    return @a[assoc] if @a.hasOwnProperty assoc

    @default_proc ? Opal.send(@default_proc, :call, key) : @default
  end

  def []=(key, value)
    assoc = Opal.hash key

    @k.push key unless @a.hasOwnProperty assoc

    @a[assoc] = value
  end

  def assoc(object)
    for key in @a
      if Opal.send key, :==, object
        return [key, @a[Opal.hash key]]
      end
    end

    nil
  end

  def clear
    @k = []
    @a = Opal.native_object
    self
  end

  def compare_by_identity(*)
    Opal.not_implemented Hash, :compare_by_identity?
  end

  def compare_by_identity?(*)
    Opal.not_implemented Hash, :compare_by_identity?
  end

  def default
    @default
  end

  def default=(object)
    @default = object
  end

  def default_proc
    @default_proc
  end

  def default_proc=(default = nil, &block)
    @default_proc = default || block
  end

  def delete(key)
    assoc = Opal.hash key

    if @a.hasOwnProperty assoc
      ret = @a[assoc]
      Opal.delete @a[assoc]
      @k.splice @k.indexOf(key), 1

      return ret
    end

    if block_given?
      yield key
    else
      @default
    end
  end
end

Opal.end

