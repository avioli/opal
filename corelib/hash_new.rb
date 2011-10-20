Opalite.begin

class Hash

  def ==(other)
    if self == other
      true

    elsif !other.k or !other.a
      false

    elsif @k.length != other.k.length
      false

    else
      keys    = @k
      values  = @a
      values2 = other.a

      for key in keys
        hash = Opalite.hash key

        unless values2.hasOwnProperty hash
          return false
        end

        unless Opalite.send(values[hash], :==, values2[hash])
          return false
        end
      end
    end
  end
end

Opalite.end

