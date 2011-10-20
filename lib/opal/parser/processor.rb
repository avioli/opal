module Opal; class Parser
  class Processor

    INDENT = ' '

    LEVEL = {
      statement:          0,
      statement_closure:  1,
      list:               2,
      expression:         3,
      receiver:           4
    }

    # Maths operators
    MATH = %w(+ - / * %)

    # Comparison operators
    COMPARE = %w(< <= > >= == !=)

    # All operators that can be optimized in method calls
    CALL_OPERATORS = MATH + COMPARE

    ##
    # Ruby operator calls to their native counterparts. These maps
    # are used in opalite mode for operators.

    OPERATOR_MAP = {
      :==     => '===',
      :"!="   => '!=='
    }

    # Reserved javascript keywords - we cannot create variables with the
    # same name
    RESERVED = %w(
      break case catch continue debugger default delete do else finally for
      function if in instanceof new return switch this throw try typeof var let
      void while with class enum export extends import super true false
    )

    STATEMENTS = [:xstr, :dxstr]

    RUNTIME_HELPERS = {
      "$nilcls" => "NC",    # nil method table (cant store it on null)
      "$super"  => "S",     # function to call super
      "$bjump"  => "B",     # break value literal
      "$noproc" => "P",     # proc to yield when no block (throws error)
      "$symbol" => "Y",     # create a symbol with id
      "$class"  => "dc",    # define a regular class
      "$defn"   => "dm",    # normal define method
      "$defs"   => "ds",    # singleton define method
      "$const"  => "cg",    # const_get
      "$range"  => "G",     # new range instance
      "$hash"   => "H",     # new hash instance
      "$module" => "md",    # creates module
      "$sclass" => "sc",    # class shift (<<)
      "$mm"     => "mm",    # method_missing dispatcher
      "$ms"     => "ms",    # method_missing dispatcher for setters (x.y=)
      "$mn"     => "mn",    # method_missing dispatcher for no arguments
      "$slice"  => "as",    # exposes Array.prototype.slice (for splats)
      "$hashed" => "ha"     # gets the hash code of the object.
    }

    def initialize(file = nil)
      @file = file

      @indent   = ''
      @unique   = 0
      @symbols  = {}
      @sym_id   = 0

      @opalite  = false
    end

    # guaranteed unique id per file..
    def unique_temp
      "$TMP_#{@unique += 1}"
    end

    def top(sexp, options = {})
      code, vars = nil, []

      in_scope(:top) do
        code = process s(:scope, sexp), :statement

        vars.concat @scope.locals.map { |t| "#{t}" }
        vars.concat @scope.temps.map { |t| t }

        code = "var #{vars.join ', '};" + code unless vars.empty?
      end

      pre = "function(VM, self, FILE) {\nfunction $$() {\n"

      post = "\n}\n"
      post += "var "
      post += RUNTIME_HELPERS.to_a.map { |a| a.join ' = VM.' }.join ', '
      post += ", nil = null" # incase people put nil inside js code

      @symbols.each { |s, v| post += ", #{v} = $symbol('#{s}')" }
      @unique.times { |i| post += ", $TMP_#{i+1}" }

      post += ";\nreturn $$();\n}"

      pre + code + post
    end

    def in_scope(type)
      return unless block_given?

      parent = @scope
      @scope = Scope.new(type).tap { |s| s.parent = parent }
      yield @scope

      @scope = parent
    end

    # Used when we enter a while statement. This pushes onto the current
    # scope's while stack so we know how to handle break, next etc.
    #
    # Usage:
    #
    #     in_while do
    #       # generate while body here.
    #     end
    def in_while
      return unless block_given?
      @scope.push_while
      result = yield
      @scope.pop_while

      result
    end

    def process(sexp, level)
      type = sexp.shift

      if @opalite
        processor = "opalite_#{type}"
        return __send__ processor, sexp, level if respond_to? processor
      end

      raise "Unsupported sexp: #{type}" unless respond_to? type

      __send__ type, sexp, level
    end

    def mid_to_jsid (id)
      return "['m$#{id}']" if /[!=?+\-*\/^&%@|\[\]<>~]/ =~ id.to_s
      # default we just do .method_name
      '.m$' + id.to_s
    end

    def returns(sexp)
      return returns s(:nil) unless sexp

      case sexp.first
      when :for
        sexp
      when :scope
        sexp
      when :block
        if sexp.length > 1
          sexp[-1] = returns sexp[-1]
        else
          sexp << returns(s(:nil))
        end
        sexp
      when :when
        sexp[2] = returns(sexp[2])
        sexp
      when :while
        sexp[2] = returns(sexp[2])
        sexp
      when :return
        sexp
      when :xstr
        sexp[1] = "return #{sexp[1]};" unless /return|;/ =~ sexp[1]
        sexp
      when :dxstr
        sexp
      when :if
        sexp[2] = returns sexp[2] if sexp[2]
        sexp[3] = returns sexp[3] if sexp[3]
        sexp
      else
        s(:js_return, sexp).tap { |s|
          s.line = sexp.line
        }
      end
    end

    def expression?(sexp)
      !STATEMENTS.include?(sexp.first)
    end

    def block(sexp, level)
      result = []
      sexp << s(:nil) if sexp.empty?

      until sexp.empty?
        stmt = sexp.shift
        expr = expression?(stmt) and LEVEL[level] < LEVEL[:list]
        result << process(stmt, level)
        result << ";" if expr
        result << "\n"
      end

      result.join
    end

    def scope(sexp, level)
      stmt = returns sexp.shift
      code = process stmt, :statement

      code
    end

    # s(:js_return, sexp)
    def js_return(sexp, level)
      "return #{process sexp.shift, :expression}"
    end

    # s(:js_tmp, str)
    def js_tmp(sexp, level)
      sexp.shift
    end

    # s(:js_block_given)
    def js_block_given(sexp, level)
      @scope.uses_block!
      "$yield !== $noproc"
    end

    def operator_call exp, level
      recv, meth, arglist = exp

      a = @scope.new_temp
      b = @scope.new_temp
      l  = process recv, :expression
      r  = process arglist[1], :expression

      op = OPERATOR_MAP[meth] || meth

      res = "(#{a} = #{l}, #{b} = #{r}, typeof(#{a}) === "
      res += "'number' ? #{a} #{op} #{b} : (#{a} == null ? $nilcls : #{a})"
      res += "['m$#{meth}']"
      res += "(#{a}, '#{meth}', #{b}))"

      @scope.queue_temp a
      @scope.queue_temp b

      res
    end

    # s(:lit, 1)
    # s(:lit, :foo)
    def lit(sexp, level)
      val = sexp.shift
      case val
      when Numeric
        val.inspect
      when Symbol
        @symbols[val.to_s] ||= "$symbol_#{@sym_id += 1}"
      when Regexp
        val == // ? /^/.inspect : val.inspect
      when Range
        "$range(#{val.begin}, #{val.end}, #{val.exclude_end?})"
      else
        raise "Bad lit: #{val.inspect}"
      end
    end

    # s(:str, "string")
    def str(sexp, level)
      str = sexp.shift
      str == @file ? "FILE" : str.inspect
    end

    # s(:not, sexp)
    def not(sexp, level)
      "!(#{process sexp.shift, :expression})"
    end

    def block_pass(exp, level)
      process exp.shift, level
    end

    def iter exp, level
      call, args, body = exp
      call << s(:iter_block, args, body)

      process call, level
    end

    # s(:iter, call, block_args [, body)
    def iter_block(sexp, level)
      args, body = sexp
      body ||= s(:nil)
      body = returns body
      code, vars, params = "", [], nil

      args ||= s(:masgn, s(:array))
      args = args.first == :lasgn ? s(:array, args) : args[1]
      args.insert 1, 'self', '$mid'

      if args.last[0] == :splat
        splat = args[-1][1][1]
        args[-1] = s(:lasgn, splat)
        len = args.length - 2
      end


      in_scope(:iter) do
        params = js_block_args(args[1..-1])
        code += "#{splat} = $slice.call(arguments, #{len});" if splat
        code += process body, :statement

        @scope.locals.each { |t| vars << "#{t}" }
        @scope.temps.each { |t| vars << t }

        code = "var #{vars.join ', '};" + code unless vars.empty?
      end

      "function(#{params}) {\n#{code}}"
    end

    # block args
    # s('self', '$mid', arg1, arg2..)
    def js_block_args(sexp)
      sexp.map do |arg|
        if String === arg
          # self, $mid values
          arg
        else
          # should all be :lasgn from #iter
          if arg.first == :lasgn
            a = arg[1]
            @scope.add_arg a
            a
          else
            raise "Bad js_block_arg type: #{arg.first}"
          end
        end
      end.join ', '
    end

    ##
    # recv.mid = rhs
    #
    # s(recv, :mid=, s(:arglist, rhs))

    def attrasgn(exp, level)
      recv, mid, arglist = exp

      return process(s(:call, recv, mid, arglist), level) if mid == :[]=

      tmprecv = @scope.new_temp
      setr = mid.to_s[0..-2]

      recv_code, recv_arg = if recv.nil?
                              ['self', 'self']
                            else
                              ["(#{tmprecv} = #{process recv, :expression})",
                                tmprecv]
                            end

      arg = process arglist.last, :expression
      dispatch = "(#{recv_code}, (#{recv_code} == nil ? $nilcls : #{recv_arg})"
      dispatch += "['#{'m$' + mid.to_s}'] || $ms)"

      @scope.queue_temp tmprecv

      "#{dispatch}(#{recv_arg}, #{setr.to_s.inspect}, #{arg})"
    end


    # s(:call, recv, :mid, s(:arglist))
    # s(:call, nil, :mid, s(:arglist))
    def call(sexp, level)
      recv, meth, arglist, iter = sexp

      return js_opalite(sexp, level) if recv and recv[1] == :Opal

      if CALL_OPERATORS.include? meth.to_s
        return process(s(:operator_call, recv, meth, arglist), level)
      end

      return js_block_given(sexp, level) if meth == :block_given?

      if Sexp === arglist.last and arglist.last.first == :block_pass
        block_pass = process arglist.pop, :expression
      end

      args = ""
      splat = arglist[1..-1].any? { |a| a.first == :splat }
      tmprecv = @scope.new_temp
      tmpproc = @scope.new_temp if iter or block_pass

      if recv.nil?
        recv_code = "self"
        recv_arg = "self"
      else
        recv_code = "(#{tmprecv} = #{process recv, :expression})"
        recv_arg = tmprecv
      end

      arglist.insert 1, s(:js_tmp, recv_arg), s(:js_tmp, meth.to_s.inspect)

      mm   = arglist.length == 3 ? '$mn' : '$mm'
      args = process arglist, :expression

      mid = mid_to_jsid meth
      dispatch = "(#{recv_code}, (#{recv_arg} == null ? $nilcls : #{recv_arg})"
      dispatch += "#{mid} || #{mm})"

      if iter
        iter = process iter, :expression
        dispatch = "(#{tmpproc} = #{dispatch}, (#{tmpproc}.$B = #{iter}).$S "
        dispatch += "= self, #{tmpproc})"
      elsif block_pass
        dispatch = "(#{tmpproc} = #{dispatch}, #{tmpproc}.$B = #{block_pass}, #{tmpproc})"
      end

      @scope.queue_temp tmprecv
      @scope.queue_temp tmpproc if tmpproc

      if splat
        "#{dispatch}.apply(null, #{args})"
      else
        "#{dispatch}(#{args})"
      end
    end

    # s(:arglist, [arg [, arg ..]])
    def arglist (sexp, level)
      code, work = '', []

      until sexp.empty?
        splat = sexp.first.first == :splat
        arg   = process sexp.shift, :expression

        if splat
          if work.empty?
            if code.empty?
              code += (arg[0] == "[" ? arg : "#{arg}#{mid_to_jsid :to_a}()")
            else
              code += ".concat(#{arg})"
            end
          else
            join  = "[#{work.join ', '}]"
            code += (code.empty? ? join : ".concat(#{join})")
            code += ".concat(#{arg})"
          end

          work = []
        else
          work.push arg
        end
      end

      unless work.empty?
        join  = work.join ', '
        code += (code.empty? ? join : ".concat([#{work}])")
      end

      code
    end

    # s(:splat, sexp)
    def splat(sexp, level)
      process sexp.first, :receiver
    end

    # s(:class, cid, super, body)
    def class(sexp, level)
      cid, sup, body = sexp
      code, vars = nil, []

      base, name = if Symbol === cid or String === cid
                     ['self', cid.to_s.inspect]
                    elsif cid[0] == :colon2
                      [process(cid[1], :expression), cid[2].to_s.inspect]
                    elsif cid[0] == :colon3
                      ['VM.Object', cid[1].to_s.inspect]
                    else
                      raise "Bad receiver in class"
                   end

      sup = sup ? process(sup, :expression) : 'null'

      in_scope(:class) do
        code = process body, :statement

        @scope.locals.each { |t| vars << "#{t} = nil" }
        @scope.temps.each { |t| vars << t }

        code = "var #{vars.join ', '};" + code unless vars.empty?
      end

      "$class(#{base}, #{sup}, #{name}, function(self) {\n#{code}})"
    end

    # s(:sclass, recv, body)
    def sclass(sexp, level)
      recv, body = sexp
      code, vars = nil, []
      base = process recv, :expression

      in_scope(:class) do
        code = process body, :statement

        @scope.locals.each { |t| vars << t }
        @scope.temps.each { |t| vars << t }

        code = "var #{vars.join ', '};" + code unless vars.empty?
      end

      "$sclass(#{base}, function(self) {\n#{code}})"
    end

    # s(:module, cid, body)
    def module(sexp, level)
      cid, body = sexp
      code, vars = nil, []

      base, name = if Symbol === cid or String === cid
                     ['self', cid.to_s.inspect]
                    elsif cid[0] == :colon2
                      [process(cid[1], :expression), cid[2].to_s.inspect]
                    elsif cid[0] == :colon3
                      ['VM.Object', cid[1].to_s.inspect]
                    else
                      raise "Bad receiver in class"
                   end

      in_scope(:class) do
        code = process body, :statement

        @scope.locals.each { |t| vars << t }
        @scope.temps.each { |t| vars << t }

        code = "var #{vars.join ', '};" + code unless vars.empty?
      end

      "$module(#{base}, #{name}, function(self) {\n#{code}})"
    end

    # s(:defn, mid, s(:args), s(:scope))
    def defn(sexp, level)
      mid, args, stmts = sexp
      js_def nil, mid, args, stmts
    end

    # s(:defs, recv, mid, s(:args), s(:scope))
    def defs(sexp, level)
      recv, mid, args, stmts = sexp
      js_def recv, mid, args, stmts
    end

    def js_def(recvr, mid, args, stmts)
      type, recv = if recvr
                     ["$defs", process(recvr, :expression)]
                   else
                     ["$defn", "self"]
                   end

      code, vars, params = "", [], nil
      scope_name = @scope.name

      # opt args if last arg is sexp
      opt = args.pop if Sexp === args.last

      # block name &block
      if args.last.to_s[0] == '&'
        block_name = args.pop[1..-1].intern
      end

      # splat args *splat
      if args.last.to_s[0] == '*'
        if args.last == :*
          args.pop
        else
          splat = args[-1].to_s[1..-1].intern
          args[-1] = splat
          len = args.length - 2
        end
      end

      args.insert 1, 'self', '$mid'

      in_scope(:def) do
        params = process args, :expression

        if block_name
          @scope.add_arg block_name
          @scope.uses_block!
        end

        code += "#{splat} = $slice.call(arguments, #{len + 2});" if splat
        code += process(stmts, :statement)

        @scope.locals.each { |t| vars << t }
        @scope.temps.each { |t| vars << t }

        code = "var #{vars.join ', '};" + code unless vars.empty?

        if @scope.uses_block?
          scope_name = (@scope.name ||= unique_temp)
          blk = "var $yield = #{scope_name}.$B || $noproc, $yself = $yield.$S, "
          blk += "#{block_name} = #{scope_name}.$B, " if block_name
          blk += "$break = $bjump; #{scope_name}.$B = 0;"

          code = blk + code
        end
      end

      ref = scope_name ? "#{scope_name} = " : ""
      "#{type}(#{recv}, '#{mid}', #{ref}function(#{params}) {\n#{code}})"
    end

    def args (exp, level)
      args = []
      until exp.empty?
        a = exp.shift.intern
        a = "#{a}$".intern if RESERVED.include? a.to_s
        @scope.add_arg a
        args << a
      end
      args.join ', '
    end

    # s(:self)  # => self
    # s(:true)  # => self
    # s(:false) # => self
    %w(self true false).each do |name|
      define_method name do |sexp, level|
        name
      end
    end

    # s(:nil)
    def nil(exp, level)
      "null"
    end

    # s(:array [, sexp [, sexp]])
    def array (sexp, level)
      return '[]' if sexp.empty?

      code, work = "", []

      until sexp.empty?
        splat = sexp.first.first == :splat
        part  = process sexp.shift, :expression

        if splat
          if work.empty?
            code += (code.empty? ? part : ".concat(#{part})")
          else
            join  = "[#{work.join ', '}]"
            code += (code.empty? ? join : ".concat(#{join})")
            code += ".concat(#{part})"
          end
          work = []
        else
          work << part
        end
      end

      unless work.empty?
        join  = "[#{work.join ', '}]"
        code += (code.empty? ? join : ".concat(#{join})")
      end

      code
    end

    # s(:hash, key1, val1, key2, val2...)
    def hash(sexp, level)
      "$hash(#{sexp.map { |p| process p, :expression }.join ', '})"
    end

    # s(:while, exp, block, true)
    def while(sexp, level)
      expr, stmt = sexp
      stmt_level = (level == :expression ? :statement_closure : :statement)

      code = "while (#{process expr, :expression}){"

      in_while { code += process(stmt, :statement) }
      code += "}"

      if stmt_level == :statement_closure
        code = "(function() {\n#{code}})()"
      end

      code
    end

    # s(:lasgn, :lvar, rhs)
    def lasgn(sexp, level)
      lvar, rhs = sexp
      lvar = "#{lvar}$".intern if RESERVED.include? lvar.to_s
      @scope.add_local lvar
      "#{lvar} = #{process rhs, :expression}"
    end

    # s(:lvar, :lvar)
    def lvar exp, level
      lvar = exp.shift.to_s
      lvar = "#{lvar}$" if RESERVED.include? lvar
      lvar
    end

    # s(:iasgn, :ivar, rhs)
    def iasgn(sexp, level)
      ivar, rhs = sexp
      name = ivar[1..-1]
      name = RESERVED.include?(name) ? "self['#{name}']" : "self.#{name}"

      "#{name} = #{process rhs, :expression}"
    end

    # s(:ivar, :ivar)
    def ivar(sexp, level)
      ivar = sexp.shift
      name = ivar[1..-1]

      RESERVED.include?(name) ? "self['#{name}']" : "self.#{name}"
    end

    # s(:gvar, gvar)
    def gvar(sexp, level)
      gvar = sexp.shift.to_s
      jsid = gvar[1..-1]

      if /[!=?+\-*\/^&%@|\[\]<>~]/ =~ gvar
        res = "VM.gg(#{gvar.inspect})"
      else
        tmp = @scope.new_temp
        res = "((#{tmp} = VM.gv[#{gvar.inspect}]) == null && typeof(#{jsid})"
        res += " !== 'undefined' ? #{jsid} : VM.gg(#{gvar.inspect}))"
        @scope.queue_temp tmp
      end

      res
    end

    # s(:gasgn, :gvar, rhs)
    def gasgn(sexp, level)
      gvar, rhs = sexp

      "VM.gs(#{gvar.to_s.inspect}, #{process rhs, :expression})"
    end

    # s(:const, :const)
    def const(sexp, level)
      "$const(self, #{sexp.shift.to_s.inspect})"
    end

    # s(:cdecl, :const, rhs)
    def cdecl(sexp, level)
      const, rhs = sexp
      "VM.cs(self, #{const.to_s.inspect}, #{process rhs, :expression})"
    end

    # s(:return [val])
    def return(sexp, level)
      val = process(sexp.shift || s(:nil), :expression)

      if level == :statement
        "return #{val}"
      else
        "$return(#{val})"
      end
    end

    # s(:xstr, content)
    def xstr(sexp, level)
      code = sexp.first.to_s
      code += ";" if level == :statement and !code.include?(';')

      code
    end

    # s(:dxstr, parts...)
    def dxstr(sexp, level)
      code = sexp.map do |p|
        if String === p
          p.to_s
        elsif p.first == :evstr
          process p.last, :expression
        elsif p.first == :str
          p.last.to_s
        else
          raise "Bad dxstr part"
        end
      end.join

      code += ";" if level == :statement and !code.include?(';')
      code
    end

    # s(:dstr, parts..)
    def dstr(sexp, level)
      parts = sexp.map do |p|
        if String === p
          p.inspect
        elsif p.first == :evstr
          process(s(:call, p.last, :to_s, s(:arglist)), :expression)
        elsif p.first == :str
          p.last.inspect
        else
          raise "Bad dstr part"
        end
      end

      "(#{parts.join ' + '})"
    end

    # s(:if, test, truthy, falsy)
    def if(sexp, level)
      test, truthy, falsy = sexp

      if level == :expression
        truthy = returns(truthy) if truthy
        falsy = returns(falsy) if falsy
      end

      code = "if (#{js_truthy test}) {"
      code += process(truthy, :statement) if truthy
      code += "} else {#{process falsy, :statement}" if falsy
      code += "}"

      code
      code = "(function() { #{code} })()" if level == :expression

      code
    end

    def js_truthy_optimize(sexp)
      if sexp.first == :call
        mid = sexp[2]
        if mid == :block_given?
          return process sexp, :expression
        elsif COMPARE.include? mid.to_s
          return process sexp, :expression
        end
      end
    end

    def js_truthy(sexp)
      if optimized = js_truthy_optimize(sexp)
        return optimized
      end

      tmp = @scope.new_temp
      code = "#{tmp} = #{process sexp, :expression}, #{tmp} !== false"
      code += " && #{tmp} != null"
      @scope.queue_temp tmp

      code
    end

    # s(:and, lhs, rhs)
    def and(sexp, level)
      lhs, rhs = sexp
      t, tmp = nil, @scope.new_temp

      if t = js_truthy_optimize(lhs)
        return "(#{tmp} = #{t} ? #{process rhs, :expression} : #{tmp})".tap {
          @scope.queue_temp tmp
        }
      end

      code = "(#{tmp} = #{process lhs, :expression}, #{tmp} !== false && "
      code += "#{tmp} != null ? #{process rhs, :expression} : #{tmp})"
      @scope.queue_temp tmp

      code
    end

    # s(:or, lhs, rhs)
    def or(sexp, level)
      lhs, rhs = sexp
      t, tmp = nil, @scope.new_temp

      if t = js_truthy_optimize(lhs)
        return "(#{tmp} = #{t} ? #{tmp} : #{process rhs, :expression})".tap {
          @scope.queue_temp tmp
        }
      end

      code = "(#{tmp} = #{process lhs, :expression}, #{tmp} !== false && "
      code += "#{tmp} != null ? #{tmp} : #{process rhs, :expression})"
      @scope.queue_temp tmp

      code
    end

    # s(:yield, arg1, arg2)
    def yield(sexp, level)
      @scope.uses_block!
      splat = sexp.any? { |s| s.first == :splat }
      sexp.unshift s(:js_tmp, '$yself'), s(:js_tmp, 'null')
      args = arglist(sexp, level)

      if splat
        "$yield.apply(null, #{args})"
      else
        "$yield(#{args})"
      end
    end


    def break(sexp, level)
      "BREAK"
    end

    # s(:case, expr, when1, when2, ..)
    def case(exp, level)
      code = []
      @scope.add_local "$case"
      expr = process exp.shift, :expression
      # are we inside a statement_closure
      returnable = level != :statement

      until exp.empty?
        wen = exp.shift
        if wen and wen.first == :when
          returns(wen) if returnable
          wen = process(wen, :expression)
          wen = "else #{wen}" unless code.empty?
          code << wen
        elsif wen # s(:else)
          wen = returns(wen) if returnable
          code << "else {#{process wen, :expression}}"
        end
      end

      code = "$case = #{expr};#{code.join "\n"}"
      code = "(function() { #{code} })()" if returnable
      code
    end

    # when foo
    #   bar
    #
    # s(:when, s(:array, foo), bar)
    def when(exp, level)
      arg = exp.shift[1..-1]
      body = exp.shift
      body = process body, level if body

      test = []
      until arg.empty?
        a = arg.shift

        if a.first == :when # when inside another when means a splat of values
          call = s(:call, s(:js_tmp, "$splt[i]"), :===, s(:arglist, s(:js_tmp, "$case")))
          splt = "(function($splt) {for(var i = 0; i < $splt.length; i++) {"
          splt += "if (#{process call, :expression}) { return true; }"
          splt += "} return false; })(#{process a[1], :expression})"
          test << splt
        else
          call = s(:call, a, :===, s(:arglist, s(:js_tmp, "$case")))
          call = process call, :expression
          # call = "else " unless test.empty?
          test << call
        end
      end

      "if (#{test.join " || "}) {\n#{body}\n}"
    end

    # lhs =~ rhs
    #
    # s(:match3, lhs, rhs)
    def match3(sexp, level)
      lhs, rhs = sexp
      call = s(:call, lhs, :=~, s(:arglist, rhs))
      process call, level
    end

    # @@class_variable
    #
    # s(:cvar, name)
    def cvar(sexp, level)
      "VM.cvg(#{sexp.shift.to_s.inspect})"
    end

    # @@name = rhs
    #
    # s(:cvasgn, :@@name, rhs)
    def cvasgn(sexp, level)
      "VM.cvs(#{sexp.shift.to_s.inspect}, #{process sexp.shift, :expression})"
    end

    def cvdecl(exp, level)
      "VM.cvs(#{exp.shift.to_s.inspect}, #{process exp.shift, :expression})"
    end

    # BASE::NAME
    #
    # s(:colon2, base, :NAME)
    def colon2(sexp, level)
      base, name = sexp
      "$const(#{process base, :expression}, #{name.to_s.inspect})"
    end

    def colon3(exp, level)
      "$const(VM.Object, #{exp.shift.to_s.inspect})"
    end

    # super a, b, c
    #
    # s(:super, arg1, arg2, ...)
    def super(sexp, level)
      args = []
      until sexp.empty?
        args << process(sexp.shift, :expression)
      end
      "$super(arguments.callee, self, [#{args.join ', '}])"
    end

    # super
    #
    # s(:zsuper)
    def zsuper(exp, level)
      "$super(arguments.callee, self, [])"
    end

    # a ||= rhs
    #
    # s(:op_asgn_or, s(:lvar, :a), s(:lasgn, :a, rhs))
    def op_asgn_or(exp, level)
      process s(:or, exp.shift, exp.shift), :expression
    end

    # lhs.b += rhs
    #
    # s(:op_asgn2, lhs, :b=, :+, rhs)
    def op_asgn2(exp, level)
      lhs = process exp.shift, :expression
      mid = exp.shift.to_s[0..-2]
      op  = exp.shift
      rhs = exp.shift

      if op.to_s == "||"
        raise "op_asgn2 for ||"
      else
        temp = @scope.new_temp
        getr = s(:call, s(:js_tmp, temp), mid, s(:arglist))
        oper = s(:call, getr, op, s(:arglist, rhs))
        asgn = s(:call, s(:js_tmp, temp), "#{mid}=", s(:arglist, oper))

        "(#{temp} = #{lhs}, #{process asgn, :expression})".tap {
          @scope.queue_temp temp
        }
      end
    end

    # s(:ensure, body, ensure)
    def ensure(exp, level)
      body = process exp.shift, level
      ensr = exp.shift || s(:nil)
      ensr = process ensr, level
      body = "try {\n#{body}}" unless body =~ /^try \{/

      "#{body}\n finally {\n#{ensr}}"
    end

    def rescue(exp, level)
      body = exp.first.first == :resbody ? s(:nil) : exp.shift
      body = process body, level

      parts = []
      until exp.empty?
        part = process exp.shift, level
        part = "else " + part unless parts.empty?
        parts << part
      end
      # if no rescue statement captures our error, we should rethrow
      parts << "else { throw $err; }"

      code = "try {\n#{body}\n} catch ($err) {\n#{parts.join "\n"}\n}"
      code = "(function() { #{code} })()" if level == :expression

      code
    end

    def resbody(exp, level)
      args, body = exp
      body = process(body || s(:nil), level)
      types = args[1..-2]

      err = types.map { |t|
        call = s(:call, t, :===, s(:arglist, s(:js_tmp, "$err")))
        a = process call, :expression
        puts a
        a
      }.join ', '
      err = "true" if err.empty?

      if Sexp === args.last and [:lasgn, :iasgn].include? args.last.first
        val = args.last
        val[2] = s(:js_tmp, "$err")
        val = process(val, :expression) + ";"
      end

      "if (#{err}) {\n#{val}#{body}}"
      # raise exp.inspect
    end

    def next(exp, level)
      "return ;"
    end

    # @group Opalite

    ##
    # Main opalite (VM) handler, this just disptaches to its helper
    # methods.
    #
    # Eg:
    #
    #     VM.command 1, 2, 3
    #
    # Will come to this method as:
    #
    #     s(:VM, :command, s(:arglist))

    def js_opalite exp, level
      _, cmd, args, iter = exp

      helper = "o_#{cmd}"
      raise "Unsupported opalite command #{cmd}" unless respond_to? helper

      __send__ helper, args, iter
    end

    ##
    # Used to signify the start of VM code. This will just make the receiver
    # go into opalite vm mode. If already in VM mode, causes an error.

    def o_begin arglist, iter
      raise 'Already in Opalite VM mode' if @opalite
      @opalite = true

      '' # keep code generation happy
    end

    ##
    # Used to exit VM code area. This will make the receiver go back into
    # normal mode. If already in normal mode, raises an error.

    def o_end arglist, iter
      raise 'Already in normal VM mode' unless @opalite
      @opalite = false

      '' # code generation
    end

    ##
    # Generates code to test if the argument is truthy, i.e. a truthy
    # value to ruby. Only +false+ and +nil+ are falsy values.
    #
    # Usage:
    #
    #     VM.truthy? true   # => true
    #     VM.truthy? false  # => false
    #     VM.truthy? ""     # => true

    def o_truthy? arglist, iter
      arg = arglist[1] or raise 'vm_truthy? expects an argument'

      tmp = @scope.new_temp
      obj = process arg, :expression

      "(#{tmp} = #{obj}, #{tmp} !== false && #{tmp} != null)".tap {
        @scope.queue_temp tmp
      }
    end

    ##
    # Generates code to test if the given argument is falsy. Only
    # +false+ and +nil+ are falsy values in ruby.
    #
    # Usage:
    #
    #     VM.falsy? false  # => true
    #     VM.falsy? nil    # => true
    #     VM.falsy? ""     # => false

    def o_falsy? arglist, iter
      arg = arglist[1] or raise 'vm_falsy? expects an argument'

      tmp = @scope.new_temp
      obj = process arg, :expression

      "(#{tmp} = #{obj}, #{tmp} === false || #{tmp} == null)".tap {
        @scope.queue_temp tmp
      }
    end

    ##
    # Send a ruby message to the receiver object. In VM mode this allows
    # a quick easy syntax to send a ruby message that does not rely on
    # the developer knowing underlying implementation details. Thus, the
    # compiler can be changed without breaking code.
    #
    # Example
    #
    #     O.send object, :some_method, arg1, arg2
    #     # => ruby method call supporing method_missing etc
    #
    # This method (will be) is used heavily in the corelib as under
    # Opalite mode, all method calls default to standard js method calls.
    # This send method therefore becomes the only way to send real ruby
    # method calls.

    def o_send arglist, iter
      arglist.shift # :arglist
      recv = arglist.shift or raise 'vm_send expects a receiver'
      mid  = arglist.shift or raise 'vm_send expects a method_id'
      arglist.unshift :arglist

      # use existing process_call to handle it.
      call s(recv, mid[1], arglist), :expression
    end

    def o_hash arglist, iter
      obj = arglist[1] or raise 'o_hash expects an object'

      "$hashed(#{process obj, :expression})"
    end

    def o_native_object arglist, iter
      "{}"
    end

    def o_delete arglist, iter
      obj = arglist[1] or raise 'o_delete expects an object'
      "delete #{process obj, :expression}"
    end

    def o_not_implemented arglist, iter
      arglist.shift
      cls = arglist.shift or raise 'expected a Class'
      mid = arglist.shift or raise 'expected a method id'
      lev = :expression

      "rb_not_implemented(#{process cls, lev}, #{process mid, lev})"
    end

    ##
    # Example:
    #
    #     for obj, idx in recv
    #       body
    #     end
    #
    # s(:for, recv, s(:masgn), body)

    def opalite_for exp, level
      recv, args, body = exp
      body ||= s(:nil)

      if args.first == :lasgn
        arg = args[1]
        @scope.add_local arg.intern
        idx = tmpidx = @scope.new_temp
      else
        arg = args[1][1][1]
        idx = args[1][2][1]
        @scope.add_local arg.intern
        @scope.add_local idx.intern
      end

      obj = process recv, :expression
      len = @scope.new_temp

      code = "for (#{idx} = 0, #{len} = #{obj}.length; #{idx} < #{len}; #{idx}++) {\n"
      code += "#{arg} = #{obj}[#{idx}];\n"
      code += process body, :statement
      code += "\n}"
    end

    ##
    # Opalite style call.
    #
    # When not given any args, will always compile to a property
    # access. Even if the js function doesnt take any args, pass
    # it nil to force an argument (current limitation of
    # ruby_parser where we can't distinguish x.y and x.y()

    def opalite_call exp, level
      recv, meth, arglist, iter = exp

      return js_opalite exp, level if recv and recv[1] == :Opal

      if CALL_OPERATORS.include? meth.to_s
        return process(s(:operator_call, recv, meth, arglist), level)
      end

      if meth == :[]
        return process(s(:aref_call, recv, meth, arglist), level)
      end

      return js_block_given(exp, level) if meth == :block_given?

      recv = "#{process recv, :expression}." if recv
      args = process arglist, :expression
      args = "(#{args})" unless args.empty?

      "#{recv}#{meth}#{args}"
    end

    ##
    # s(:operator_call, recv, op, s(:srglist))

    def opalite_operator_call exp, level
      recv = process exp[0], :expression
      op   = exp[1]
      rhs  = process exp[2][1], :expression

      op = OPERATOR_MAP[op] || op

      "#{recv} #{op} #{rhs}"
    end

    ##
    # s(:aref_call, recv, :[], s(:arglist))

    def opalite_aref_call exp, level
      recv = process exp[0], :expression
      arg  = exp[2][1]

      if arg[0] == :lit and Symbol === arg[1]
        arg = arg[1].to_s
        "#{recv}.#{arg}"
      else
        "#{recv}[#{process exp[2][1], :expression}]"
      end
    end

    ##
    # recv.mid = rhs
    #
    # s(recv, :mid=, s(:arglist, rhs))

    def opalite_attrasgn exp, level
      puts exp.inspect
      recv, mid, arglist = exp
      recv = process recv, :expression
      aref = arglist[1] or raise 'no aref arg'
      aset = arglist[2] or raise 'no aset arg'

      aref = process aref, :expression
      aset = process aset, :expression

      if mid == :[]=
        "#{recv}[#{aref}] = #{aset}"
      else
        "#{recv}.#{aref} = #{aset}"
      end
    end

    def opalite_if exp, level
      test, truthy, falsy = exp

      if level == :expression
        truthy = returns(truthy) if truthy
        falsy = returns(falsy) if falsy
      end

      code = "if (#{process test, :expression}) {"
      code += process(truthy, :statement) if truthy
      code += "} else {#{process falsy, :statement}" if falsy
      code += "}"

      code
      code = "(function() { #{code} })()" if level == :expression

      code
    end

    def opalite_or exp, level
      lhs, rhs = exp

      "#{process lhs, :expression} || #{process rhs, :expression}"
    end

    def opalite_and exp, level
      lhs, rhs = exp

      "#{process lhs, :expression} && #{process rhs, :expression}"
    end
    # @endgroup Opalite
  end
end; end

