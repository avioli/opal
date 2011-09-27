/*!
 * opal v0.3.11
 * http://opalscript.org
 *
 * Copyright 2011, Adam Beynon
 * Released under the MIT license
 */
opal.lib('opal/nodes', function($rb, self, __FILE__) {function $$(){return $class(self, nil, 'Opal', function(self) { 
  return $class(self, $cg($cg(self, 'Racc'), 'Parser'), 'Parser', function(self) {


    $rb.cs(self, 'INDENT', '  ');

    $rb.cs(self, 'LEVEL_TOP', 0);
    $rb.cs(self, 'LEVEL_TOP_CLOSURE', 1);
    $rb.cs(self, 'LEVEL_LIST', 2);
    $rb.cs(self, 'LEVEL_EXPR', 3);
    $rb.cs(self, 'LEVEL_COMPARE', 4);


    $class(self, nil, 'BaseNode', function(self) {

      self.m$attr_reader('line');


      $defn(self, 'generate', function(opts, level) { var self = this;
        return '';
      });





      $defn(self, 'returns', function() { var self = this;
        return $cg(self, 'FuncReturnNode').m$new(self);
      });



      $defn(self, 'expression?', function() { var self = this;
        return true;
      });







      $defn(self, 'process', function(opts, level) { var self = this;
        if (level <= $cg(self, 'LEVEL_LIST')) {
          return self.m$fix_line_number(opts) + self.m$generate(opts, level);
        } else {
          return self.m$generate(opts, level);
        }
      });






      $defn(self, 'fix_line_number', function(opts, line) { var self = this;var code, target, __a, current, __b;if (line == undefined) {line = nil;}if (self.line == undefined) { self.line = nil; }
        code = '';

        target = (((__a = line), __a != false && __a != nil) ? __a : self.line);
        current = opts['m$[]']('top').m$line();

        if (current < target) {
          (__a = (target - current), $B.f = __a.m$times, ($B.p =function() { var self = this;
            opts['m$[]']('top')['m$line='](opts['m$[]']('top').m$line()['m$+'](1));
            return code = code['m$+']("\n");
          }).$self=self, $B.f).call(__a);

          code = code['m$+'](opts['m$[]']('indent'));
        }

        return code;
      });



      $defn(self, 'js_reserved_words', function() { var self = this;
        return ["break", "case", "catch", "continue", "debugger", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "class", "enum", "export", "extends", "import", "super", "true", "false"];
      });

      return $defn(self, 'generate_truthy_test', function(expr, opts) { var self = this;var __a, __b, tmp, code, res;
        if ((__a = (((__b = expr['m$is_a?']($cg(self, 'EqualNode'))), __b != false && __b != nil) ? __b : expr['m$is_a?']($cg(self, 'ComparisonNode'))), __a !== false && __a !== nil)) {
          return expr.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        } else {
          tmp = opts['m$[]']('scope').m$temp_local();
          code = expr.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
          res = ("(" + (tmp).m$to_s() + " = " + (code).m$to_s() + ", " + (tmp).m$to_s() + " !== false && " + (tmp).m$to_s() + " !== nil)");
          opts['m$[]']('scope').m$queue_temp(tmp);
          return res;
        }
      });

        }, 0);



    $class(self, $cg(self, 'BaseNode'), 'ScopeNode', function(self) {

      self.m$attr_reader('variables');

      self.m$attr_reader('parent');

      $defn(self, 'initialize', function(parent, statements) { var self = this;
        self.parent = parent;
        self.statements = statements;

        self.variables = [];

        self.scope_vars = [];

        self.temp_current = 'a';
        self.temp_queue = [];

        self.ivars = [];


        self.while_scope = 0;
        return self.while_scope_stack = [];
      });

      $defn(self, 'push_while_scope', function(while_scope) { var self = this;if (self.while_scope_stack == undefined) { self.while_scope_stack = nil; }if (self.while_scope == undefined) { self.while_scope = nil; }
        self.while_scope_stack['m$<<'](while_scope);
        return self.while_scope = self.while_scope['m$+'](1);
      });

      $defn(self, 'pop_while_scope', function() { var self = this;if (self.while_scope_stack == undefined) { self.while_scope_stack = nil; }if (self.while_scope == undefined) { self.while_scope = nil; }
        self.while_scope_stack.m$pop();
        return self.while_scope = self.while_scope['m$-'](1);
      });

      $defn(self, 'in_while_scope?', function() { var self = this;if (self.while_scope == undefined) { self.while_scope = nil; }
        return self.while_scope > 0;
      });

      $defn(self, 'while_scope', function() { var self = this;if (self.while_scope_stack == undefined) { self.while_scope_stack = nil; }
        return self.while_scope_stack.m$last();
      });

      $defn(self, 'ensure_ivar', function(name) { var self = this;var __a;if (self.ivars == undefined) { self.ivars = nil; }
        if(!((__a = self.ivars['m$include?'](name), __a !== false && __a !== nil))) {return self.ivars['m$<<'](name)} else { return nil; };
      });

      $defn(self, 'param_variable', function(name) { var self = this;if (self.variables == undefined) { self.variables = nil; }
        return self.variables['m$<<'](name);
      });

      $defn(self, 'ensure_variable', function(name) { var self = this;var variable, __a;if (self.scope_vars == undefined) { self.scope_vars = nil; }if (self.variables == undefined) { self.variables = nil; }
        variable = self.m$find_variable(name);
        if ((__a = variable, __a !== false && __a !== nil)) {          return variable;}


        self.scope_vars['m$<<'](name);
        return self.variables['m$<<'](name);
      });

      $defn(self, 'find_variable', function(name) { var self = this;var scope, __a, __b, __c;
        scope = self;

        __b = nil; __a = false; while (__a || ((__b = scope, __b !== false && __b !== nil))) {__a = false;
        if ((__b = scope.m$variables()['m$include?'](name), __b !== false && __b !== nil)) {          return name;}

        if ((__b = (((__c = scope['m$is_a?']($cg(self, 'BlockNode'))), __c != false && __c != nil) ? scope.m$parent() : __c), __b !== false && __b !== nil)) {
          scope = scope.m$parent();
        } else {
          __b = nil; break;
        }
        };

        return nil;
      });

      $defn(self, 'temp_local', function() { var self = this;var __a, name;if (self.temp_queue == undefined) { self.temp_queue = nil; }if (self.temp_current == undefined) { self.temp_current = nil; }if (self.scope_vars == undefined) { self.scope_vars = nil; }
        if ((__a = self.temp_queue.m$last(), __a !== false && __a !== nil)) {          return self.temp_queue.m$pop();}

        name = '__' + self.temp_current;
        self.scope_vars['m$<<'](name);
        self.temp_current = self.temp_current.m$succ();
        return name;
      });

      $defn(self, 'queue_temp', function(temp) { var self = this;if (self.temp_queue == undefined) { self.temp_queue = nil; }
        return self.temp_queue['m$<<'](temp);
      });

      $defn(self, 'set_uses_block', function() { var self = this;var __a;if (self.block_arg_name == undefined) { self.block_arg_name = nil; }
        if ((__a = self.block_arg_name, __a !== false && __a !== nil)) {          return self.block_arg_name;}

        return self.block_arg_name = '__block__';
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var stmts, vars;if (self.statements == undefined) { self.statements = nil; }
        stmts = self.statements.m$generate(opts, level);
        vars = '';

        return vars + stmts;
      });
        }, 0);




    $class(self, $cg(self, 'ScopeNode'), 'TopScopeNode', function(self) {


      self.m$attr_reader('file_helpers');


      self.m$attr_accessor('line');



      self.m$attr_reader('opts');

      $defn(self, 'initialize', function(statements) { var self = this;
        $super(arguments.callee, self, [nil, statements]);
        self.file_helpers = [];
        return self.line = 1;
      });


      $defn(self, 'options=', function(opts) { var self = this;var __a;
        self.overload_arithmetic = (((__a = opts['m$[]']('overload_arithmetic')), __a != false && __a != nil) ? __a : false);
        self.overload_comparison = (((__a = opts['m$[]']('overload_comparison')), __a != false && __a != nil) ? __a : false);
        self.overload_bitwise = (((__a = opts['m$[]']('overload_bitwise')), __a != false && __a != nil) ? __a : false);
        self.overload_shift = (((__a = opts['m$[]']('overload_shift')), __a != false && __a != nil) ? __a : true);
        self.overload_equal = (((__a = opts['m$[]']('overload_equal')), __a != false && __a != nil) ? __a : false);
        return self.method_missing = (((__a = opts['m$[]']('method_missing')), __a != false && __a != nil) ? __a : false);
      });

      $defn(self, 'overload_arithmetic?', function() { var self = this;if (self.overload_arithmetic == undefined) { self.overload_arithmetic = nil; }        return self.overload_arithmetic;});

      $defn(self, 'overload_comparison?', function() { var self = this;if (self.overload_comparison == undefined) { self.overload_comparison = nil; }        return self.overload_comparison;});

      $defn(self, 'overload_bitwise?', function() { var self = this;if (self.overload_bitwise == undefined) { self.overload_bitwise = nil; }        return self.overload_bitwise;});

      $defn(self, 'overload_shift?', function() { var self = this;if (self.overload_shift == undefined) { self.overload_shift = nil; }        return self.overload_shift;});

      $defn(self, 'overload_equal?', function() { var self = this;if (self.overload_equal == undefined) { self.overload_equal = nil; }        return self.overload_equal;});

      $defn(self, 'method_missing?', function() { var self = this;if (self.method_missing == undefined) { self.method_missing = nil; }        return self.method_missing;});

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, pre, post, __a, __b;if (self.statements == undefined) { self.statements = nil; }if (self.scope_vars == undefined) { self.scope_vars = nil; }if (self.ivars == undefined) { self.ivars = nil; }
        self.opts = opts;
        code = [];
        self.statements.m$returns();

        code['m$<<'](self.statements.m$generate(opts, level));

        pre = "function($rb, self, __FILE__) {";
        pre = pre['m$+']('function $$(){');
        post = "\n}\n";

        if (!(__a = self.scope_vars['m$empty?'](), __a !== false && __a !== nil)) {
          post = post['m$+'](("var " + (self.scope_vars.m$join(', ')).m$to_s() + ";"));
        }

        post = post['m$+']('var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, ');
        post = post['m$+']('$class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, ');
        post = post['m$+']('$range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm');

        post = post['m$+'](';');


        (__a = self.ivars, $B.f = __a.m$each, ($B.p =function(ivar) { var self = this; var __a, ivar_name;
          if ((__a = self.m$js_reserved_words()['m$include?'](ivar), __a !== false && __a !== nil)) {
            ivar_name = ("self['" + (ivar).m$to_s() + "']");
          } else {
            ivar_name = ("self." + (ivar).m$to_s());
          }

          return post = post['m$+'](((ivar_name).m$to_s() + "===undefined&&(" + (ivar_name).m$to_s() + "=nil);"));
        }).$self=self, $B.f).call(__a);

        post = post['m$+']("return $$();\n");
        post = post['m$+']("}");

        return pre + code.m$join('') + post;
      });
        }, 0);


    $class(self, $cg(self, 'BaseNode'), 'StatementsNode', function(self) {

      self.m$attr_reader('nodes');

      $defn(self, 'initialize', function(nodes) { var self = this;if (nodes == undefined) {nodes = [];}
        self.line = 0;
        return self.nodes = nodes;
      });

      $defn(self, 'returns', function() { var self = this;if (self.nodes == undefined) { self.nodes = nil; }
        if (self.nodes.m$length() > 0) {
          return self.nodes['m$[]='](-1, self.nodes['m$[]'](-1).m$returns());
        } else {
          return self.nodes['m$<<']($cg(self, 'FuncReturnNode').m$new($cg(self, 'NilNode').m$new()));
        }
      });

      $defn(self, 'generate', function(opts, level) { var self = this;var code, __a, __b;if (self.nodes == undefined) { self.nodes = nil; }
        code = [];

        if ((__a = self.nodes['m$empty?'](), __a !== false && __a !== nil)) {          return $cg(self, 'NilNode').m$new().m$generate(opts, level);}

        (__a = self.nodes, $B.f = __a.m$each, ($B.p =function(node) { var self = this; var node_code, __a;
          node_code = node.m$process(opts, level);

          if (level <= $cg(self, 'LEVEL_TOP_CLOSURE')) {



            if (node_code['m$[]'](0).valueOf() === "\n".valueOf()) {
              code['m$<<'](node_code);
            } else {
              code['m$<<']((opts['m$[]']('indent') + node_code));
            }






            if ((__a = node['m$expression?'](), __a !== false && __a !== nil)) {              return code['m$<<'](';');}

          } else {
            return code['m$<<'](node_code);
          }
        }).$self=self, $B.f).call(__a);

        return code.m$join('');
      });


      $defn(self, '<<', function(node) { var self = this;if (self.nodes == undefined) { self.nodes = nil; }
        self.nodes['m$<<'](node);
        return self;
      });


      return $defn(self, 'generate_top', function(parser_options) { var self = this;var scope, opts;if (parser_options == undefined) {parser_options = $hash();}
        scope = $cg(self, 'TopScopeNode').m$new(self);
        opts = $hash();

        scope['m$options='](parser_options);

        opts['m$[]=']('scope', scope);
        opts['m$[]=']('indent', '');
        opts['m$[]=']('top', scope);

        return scope.m$generate(opts, $cg(self, 'LEVEL_TOP'));
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'NumericNode', function(self) {

      self.m$attr_accessor('value');

      $defn(self, 'initialize', function(val) { var self = this;
        self.line = val['m$[]']('line');
        return self.value = val['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.value == undefined) { self.value = nil; }
        return self.value.m$to_s();
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'SymbolNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        self.line = val['m$[]']('line');
        return self.value = val['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.value == undefined) { self.value = nil; }
        return ("'" + (self.value).m$to_s() + "'");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'CallNode', function(self) {


      self.m$attr_writer('block');

      self.m$attr_reader('recv');

      self.m$attr_reader('mid');

      $defn(self, 'initialize', function(recv, mid, args) { var self = this;var __a;
        self.recv = recv;
        self.mid = mid['m$[]']('value');
        self.args = args;
        return self.line = ((__a = recv, __a !== false && __a !== nil) ? recv.m$line() : mid['m$[]']('line'));
      });

      $defn(self, 'mid_to_jsid', function(id) { var self = this;var __a;
        if ((__a = /[\!\=\?\+\-\*\/\^\&\%\@\|\[\]\<\>\~]/['m$=~'](id), __a !== false && __a !== nil)) {          return ("['" + (id).m$to_s() + "']");}


        return '.' + id;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var __a, __b, code, arg_res, recv, mid, dispatch, args, tmp_recv, block, splat, splat_args, result;if (self.recv == undefined) { self.recv = nil; }if (self.mid == undefined) { self.mid = nil; }if (self.args == undefined) { self.args = nil; }if (self.block == undefined) { self.block = nil; }

        if ((__a = (((__b = self.recv['m$is_a?']($cg(self, 'NumericNode'))), __b != false && __b != nil) ? self.mid.valueOf() === '-@'.valueOf() : __b), __a !== false && __a !== nil)) {
          self.recv['m$value='](("-" + (self.recv.m$value()).m$to_s()));
          return self.recv.m$generate(opts, level);

        } else if (self.mid.valueOf() === "block_given?".valueOf()) {

          return "($yy !== $y.y)";
        }

        code = '';
        arg_res = [];
        recv = nil;
        mid = 'm$' + self.mid;


        if ((__a = self.recv['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {
          recv = ("(" + (self.recv.m$process(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + ")");
        } else if ((__a = self.recv, __a !== false && __a !== nil)) {
          recv = self.recv.m$process(opts, $cg(self, 'LEVEL_EXPR'));
        } else {
          recv = "self";
        }



        dispatch = opts['m$[]']('top')['m$method_missing?']();

        if (!(__a = dispatch, __a !== false && __a !== nil)) {
          mid = self.m$mid_to_jsid(mid);
        }

        args = self.args;


        if ((__a = args['m$[]'](0), __a !== false && __a !== nil)) {
          (__a = args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this;
            return arg_res['m$<<'](arg.m$generate(opts, $cg(self, 'LEVEL_EXPR')));
          }).$self=self, $B.f).call(__a);
        }


        if ((__a = args['m$[]'](2), __a !== false && __a !== nil)) {
          arg_res['m$<<']($cg(self, 'HashNode').m$new(args['m$[]'](2), $hash('line', 0), $hash('line', 0)).m$generate(opts, $cg(self, 'LEVEL_EXPR')));
        }

        if ((__a = self.block, __a !== false && __a !== nil)) {
          tmp_recv = opts['m$[]']('scope').m$temp_local();
          block = self.block.m$generate(opts, $cg(self, 'LEVEL_TOP'));
          arg_res.m$unshift(tmp_recv);

          code = ("(" + (tmp_recv).m$to_s() + " = " + (recv).m$to_s() + ", $B.f = " + (tmp_recv).m$to_s() + (mid).m$to_s() + ", ($B.p =");
          code = code['m$+'](((block).m$to_s() + ").$self=self, $B.f).call(" + (arg_res.m$join(', ')).m$to_s() + ")"));

          opts['m$[]']('scope').m$queue_temp(tmp_recv);
          return code;





        } else if ((__a = args['m$[]'](3), __a !== false && __a !== nil)) {
          tmp_recv = opts['m$[]']('scope').m$temp_local();
          arg_res.m$unshift(tmp_recv);

          code = ("($B.p = " + (args['m$[]'](3).m$process(opts, $cg(self, 'LEVEL_LIST'))).m$to_s() + ", ");
          code = code['m$+'](("$B.f = (" + (tmp_recv).m$to_s() + " = " + (recv).m$to_s() + ")" + (mid).m$to_s() + ").call(" + (arg_res.m$join(', ')).m$to_s() + ")"));

          opts['m$[]']('scope').m$queue_temp(tmp_recv);

          return code;


        } else {

          if ((__a = args['m$[]'](1), __a !== false && __a !== nil)) {
            splat = args['m$[]'](1).m$generate(opts, $cg(self, 'LEVEL_EXPR'));

            if ((__a = dispatch, __a !== false && __a !== nil)) {
              arg_res.m$unshift(recv, ("'" + (mid).m$to_s() + "'"));
              splat_args = ("[" + (arg_res.m$join(', ')).m$to_s() + "].concat(" + (splat).m$to_s() + ")");

              return ("$rb_send.apply(null, " + (splat_args).m$to_s() + ")");
            }


            tmp_recv = opts['m$[]']('scope').m$temp_local();
            splat_args = ((__a = arg_res['m$empty?'](), __a !== false && __a !== nil) ? splat.m$to_s() : ("[" + (arg_res.m$join(', ')).m$to_s() + "].concat(" + (splat).m$to_s() + ")"));


            result = ("(" + (tmp_recv).m$to_s() + " = " + (recv).m$to_s() + ")") + mid + ".apply(";
            result = result['m$+'](((tmp_recv).m$to_s() + ", " + (splat_args).m$to_s() + ")"));
            opts['m$[]']('scope').m$queue_temp(tmp_recv);

            return result;


          } else {
            if ((__a = dispatch, __a !== false && __a !== nil)) {
              arg_res.m$unshift(recv, ("'" + (mid).m$to_s() + "'"));
              return ("$rb_send(" + (arg_res.m$join(', ')).m$to_s() + ")");
            } else {
              return ((recv).m$to_s() + (mid).m$to_s() + "(" + (arg_res.m$join(', ')).m$to_s() + ")");
            }
          }
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'SelfNode', function(self) {


      $defn(self, 'initialize', function(val) { var self = this;if (val == undefined) {val = $hash('line', 0);}
        return self.line = val['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;
        return 'self';
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'NilNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;if (val == undefined) {val = $hash('line', 0);}
        return self.line = val['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;
        return 'nil';
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'UndefinedNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        return self.line = val['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;
        return 'undefined';
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'NullNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        return self.line = val['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;
        return 'null';
      });
        }, 0);

    $class(self, $cg(self, 'ScopeNode'), 'ModuleNode', function(self) {

      $defn(self, 'initialize', function(mod, path, body, _end) { var self = this;
        $super(arguments.callee, self, [nil, body]);
        self.line = mod['m$[]']('line');
        self.base = path['m$[]'](0);
        self.class_name = path['m$[]'](1)['m$[]']('value');
        return self.end_line = _end['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, __a, scope, stmt;if (self.base == undefined) { self.base = nil; }if (self.class_name == undefined) { self.class_name = nil; }if (self.statements == undefined) { self.statements = nil; }if (self.scope_vars == undefined) { self.scope_vars = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        code = '$class(';


        if ((__a = self.base['m$nil?'](), __a !== false && __a !== nil)) {
          code = code['m$+']($cg(self, 'SelfNode').m$new().m$generate(opts, level));
        } else {
          code = code['m$+'](self.base.m$generate(opts, level));
        }

        code = code['m$+'](', ');


        code = code['m$+'](($cg(self, 'NilNode').m$new().m$generate(opts, level) + ', '));


        code = code['m$+'](("'" + (self.class_name).m$to_s() + "', "));


        scope = $hash('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'), 'top', opts['m$[]']('top'), 'scope', self);
        self.statements.m$returns();
        stmt = self.statements.m$generate(scope, $cg(self, 'LEVEL_TOP'));

        if ((__a = self.scope_vars['m$empty?'](), __a !== false && __a !== nil)) {
          code = code['m$+'](('function(self) { ' + stmt));
        } else {
          code = code['m$+'](("function(self) {var " + (self.scope_vars.m$join(', ')).m$to_s() + ";" + (stmt).m$to_s()));
        }


        code = code['m$+'](self.m$fix_line_number(opts, self.end_line));
        code = code['m$+']('}, 2)');

        return code;
      });
        }, 0);

    $class(self, $cg(self, 'ScopeNode'), 'ClassNode', function(self) {

      $defn(self, 'initialize', function(cls, path, sup, body, _end) { var self = this;
        $super(arguments.callee, self, [nil, body]);
        self.line = cls['m$[]']('line');
        self.base = path['m$[]'](0);
        self.cls_name = path['m$[]'](1);
        self['super'] = sup;
        return self.end_line = _end['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, __a, scope, stmt;if (self.base == undefined) { self.base = nil; }if (self['super'] == undefined) { self['super'] = nil; }if (self.cls_name == undefined) { self.cls_name = nil; }if (self.statements == undefined) { self.statements = nil; }if (self.scope_vars == undefined) { self.scope_vars = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        code = '$class(';


        code = code['m$+']((((__a = self.base['m$nil?'](), __a !== false && __a !== nil) ? $cg(self, 'SelfNode').m$new().m$generate(opts, level) : self.base.m$generate(opts, level))));
        code = code['m$+'](', ');


        code = code['m$+']((((__a = self['super'], __a !== false && __a !== nil) ? self['super'].m$generate(opts, level) : $cg(self, 'NilNode').m$new().m$generate(opts, level))));
        code = code['m$+'](', ');


        code = code['m$+'](("'" + (self.cls_name['m$[]']('value')).m$to_s() + "', "));


        scope = $hash('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'), 'top', opts['m$[]']('top'), 'scope', self);
        self.statements.m$returns();
        stmt = self.statements.m$generate(scope, level);

        if ((__a = self.scope_vars['m$empty?'](), __a !== false && __a !== nil)) {
          code = code['m$+'](("function(self) {" + (stmt).m$to_s()));
        } else {
          code = code['m$+'](("function(self) { var " + (self.scope_vars.m$join(', ')).m$to_s() + ";" + (stmt).m$to_s()));
        }


        code = code['m$+'](self.m$fix_line_number(opts, self.end_line));

        code = code['m$+'](opts['m$[]']('indent') + '}, 0)');
        return code;
      });
        }, 0);

    $class(self, $cg(self, 'ScopeNode'), 'ClassShiftNode', function(self) {

      $defn(self, 'initialize', function(cls, expr, body, endn) { var self = this;
        $super(arguments.callee, self, [nil, body]);
        self.line = cls['m$[]']('line');
        self.expr = expr;
        return self.end_line = endn['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, scope, stmt, __a;if (self.expr == undefined) { self.expr = nil; }if (self.statements == undefined) { self.statements = nil; }if (self.scope_vars == undefined) { self.scope_vars = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        code = '$class(';


        code = code['m$+'](self.expr.m$generate(opts, level));
        code = code['m$+'](', nil, nil, ');


        scope = $hash('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'), 'top', opts['m$[]']('top'), 'scope', self);
        self.statements.m$returns();
        stmt = self.statements.m$generate(scope, level);

        if ((__a = self.scope_vars['m$empty?'](), __a !== false && __a !== nil)) {
          code = code['m$+'](("function(self) {" + (stmt).m$to_s()));
        } else {
          code = code['m$+'](("function(self) { var " + (self.scope_vars.m$join(', ')).m$to_s() + ";" + (stmt).m$to_s()));
        }


        code = code['m$+'](self.m$fix_line_number(opts, self.end_line));

        code = code['m$+'](opts['m$[]']('indent') + '}, 1)');
        return code;
      });
        }, 0);

    $class(self, $cg(self, 'ScopeNode'), 'DefNode', function(self) {

      $defn(self, 'initialize', function(defn, singleton, fname, args, body, endn) { var self = this;
        $super(arguments.callee, self, [nil, body]);

        self.line = defn['m$[]']('line');
        self.singleton = singleton;
        self.fname = fname;
        self.args = args;
        self.body = body;
        return self.end_line = endn['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var __a, code, method_args, pre_code, scope, args, __b, arity, stmt, block_code;if (self.singleton == undefined) { self.singleton = nil; }if (self.fname == undefined) { self.fname = nil; }if (self.args == undefined) { self.args = nil; }if (self.body == undefined) { self.body = nil; }if (self.scope_vars == undefined) { self.scope_vars = nil; }if (self.ivars == undefined) { self.ivars = nil; }if (self.block_arg_name == undefined) { self.block_arg_name = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        if ((__a = self.singleton, __a !== false && __a !== nil)) {
          code = ("$defs(" + (self.singleton.m$generate(opts, level)).m$to_s() + ", ");
        } else {
          code = "$defn(self, ";
        }


        code = code['m$+'](("'" + (self.fname['m$[]']('value')).m$to_s() + "', "));


        method_args = [];

        pre_code = '';


        scope = $hash('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'), 'top', opts['m$[]']('top'), 'scope', self);

        args = self.args;


        if ((__a = args['m$[]'](0), __a !== false && __a !== nil)) {
          (__a = args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this;
            self.m$param_variable(arg['m$[]']('value'));
            return method_args['m$<<'](arg['m$[]']('value'));
          }).$self=self, $B.f).call(__a);
        }

        arity = method_args.m$length();


        if ((__a = args['m$[]'](1), __a !== false && __a !== nil)) {
          (__a = args['m$[]'](1), $B.f = __a.m$each, ($B.p =function(arg) { var self = this; var __a;
            self.m$param_variable(arg['m$[]'](0)['m$[]']('value'));
            method_args['m$<<'](arg['m$[]'](0)['m$[]']('value'));




            if (!(__a = arg['m$[]'](1)['m$is_a?']($cg(self, 'UndefinedNode')), __a !== false && __a !== nil)) {
              return pre_code = pre_code['m$+'](("if (" + (arg['m$[]'](0)['m$[]']('value')).m$to_s() + " == undefined) {" + (arg['m$[]'](0)['m$[]']('value')).m$to_s() + " = " + (arg['m$[]'](1).m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + ";}"));
            }
          }).$self=self, $B.f).call(__a);
        }


        if ((__a = args['m$[]'](2), __a !== false && __a !== nil)) {
          if (args['m$[]'](2)['m$[]']('value').valueOf() !== "*".valueOf()) {
            self.m$param_variable(args['m$[]'](2)['m$[]']('value'));
            method_args['m$<<'](args['m$[]'](2)['m$[]']('value'));
            pre_code = pre_code['m$+'](((args['m$[]'](2)['m$[]']('value')).m$to_s() + " = [].slice.call(arguments, " + (method_args.m$length() - 1).m$to_s() + ");"));
          }
        }


        if ((__a = (((__b = args['m$[]'](1)), __b != false && __b != nil) ? __b : args['m$[]'](2)), __a !== false && __a !== nil)) {          arity = (-arity) - 1;}


        if ((__a = args['m$[]'](3), __a !== false && __a !== nil)) {
          self.m$param_variable(args['m$[]'](3)['m$[]']('value'));
          self.block_arg_name = args['m$[]'](3)['m$[]']('value');
          pre_code = pre_code['m$+'](("var " + (args['m$[]'](3)['m$[]']('value')).m$to_s() + " = (($yy == $y.y) ? nil: $yy);"));
        }

        self.body.m$returns();
        stmt = self.body.m$generate(scope, $cg(self, 'LEVEL_TOP'));

        code = code['m$+'](("function(" + (method_args.m$join(', ')).m$to_s() + ") { var self = this;"));


        if (!(__a = self.scope_vars['m$empty?'](), __a !== false && __a !== nil)) {
          pre_code = ("var " + (self.scope_vars.m$join(', ')).m$to_s() + ";") + pre_code;
        }


        (__a = self.ivars, $B.f = __a.m$each, ($B.p =function(ivar) { var self = this; var __a, ivar_name;
          if ((__a = self.m$js_reserved_words()['m$include?'](ivar), __a !== false && __a !== nil)) {
            ivar_name = ("self['" + (ivar).m$to_s() + "']");
          } else {
            ivar_name = ("self." + (ivar).m$to_s());
          }

          return pre_code = pre_code['m$+'](("if (" + (ivar_name).m$to_s() + " == undefined) { " + (ivar_name).m$to_s() + " = nil; }"));
        }).$self=self, $B.f).call(__a);


        if ((__a = self.block_arg_name, __a !== false && __a !== nil)) {

          block_code = "var $y = $B, $yy, $ys, $yb = $y.b;";
          block_code = block_code['m$+']("if ($y.f == arguments.callee) { $yy = $y.p; }");
          block_code = block_code['m$+']("else { $yy = $y.y; }");
          block_code = block_code['m$+']("$y.f = nil ;$ys = $yy.$self;");
          pre_code = block_code + pre_code;
        }

        code = code['m$+']((pre_code + stmt));


        code = code['m$+']((self.m$fix_line_number(opts, self.end_line) + "})"));

        return code;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'BodyStatementsNode', function(self) {

      self.m$attr_reader('opt_rescue');
      self.m$attr_reader('opt_ensure');

      $defn(self, 'initialize', function(stmt, optrescue, optelse, optensure) { var self = this;
        self.statements = stmt;
        self.opt_rescue = optrescue;
        self.opt_else = optelse;
        self.opt_ensure = optensure;
        return self.line = stmt.m$line();
      });

      $defn(self, 'returns', function() { var self = this;if (self.statements == undefined) { self.statements = nil; }
        return self.statements.m$returns();
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.statements == undefined) { self.statements = nil; }
        return self.statements.m$generate(opts, level);
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'OrNode', function(self) {

      $defn(self, 'initialize', function(node, lhs, rhs) { var self = this;
        self.line = node['m$[]']('line');
        self.lhs = lhs;
        return self.rhs = rhs;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var res, tmp;if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }
        res = '((';
        tmp = opts['m$[]']('scope').m$temp_local();
        res = res['m$+'](("(" + (tmp).m$to_s() + " = " + (self.lhs.m$generate(opts, $cg(self, 'LEVEL_LIST'))).m$to_s() + "), " + (tmp).m$to_s() + " != false && " + (tmp).m$to_s() + " != nil) ? "));
        res = res['m$+'](((tmp).m$to_s() + " : " + (self.rhs.m$generate(opts, $cg(self, 'LEVEL_LIST'))).m$to_s() + ")"));
        opts['m$[]']('scope').m$queue_temp(tmp);
        return res;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'AndNode', function(self) {

      $defn(self, 'initialize', function(node, lhs, rhs) { var self = this;
        self.line = node['m$[]']('line');
        self.lhs = lhs;
        return self.rhs = rhs;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var res, tmp;if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }
        res = '((';
        tmp = opts['m$[]']('scope').m$temp_local();
        res = res['m$+'](("(" + (tmp).m$to_s() + " = " + (self.lhs.m$generate(opts, $cg(self, 'LEVEL_LIST'))).m$to_s() + "), " + (tmp).m$to_s() + " != false && " + (tmp).m$to_s() + " != nil) ? "));
        res = res['m$+'](((self.rhs.m$generate(opts, $cg(self, 'LEVEL_LIST'))).m$to_s() + " : " + (tmp).m$to_s() + ")"));
        opts['m$[]']('scope').m$queue_temp(tmp);
        return res;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ArrayNode', function(self) {

      $defn(self, 'initialize', function(parts, begn, endn) { var self = this;var __a;
        self.line = (((__a = begn['m$[]']('line')), __a != false && __a != nil) ? __a : 0);
        self.end_line = (((__a = endn['m$[]']('line')), __a != false && __a != nil) ? __a : 0);
        return self.args = parts;
      });



      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b, code, res;if (self.args == undefined) { self.args = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        parts = (__a = self.args['m$[]'](0), $B.f = __a.m$map, ($B.p =function(arg) { var self = this;          return arg.m$process(opts, $cg(self, 'LEVEL_LIST'));}).$self=self, $B.f).call(__a);
        code = ("[" + (parts.m$join(', ')).m$to_s() + (self.m$fix_line_number(opts, self.end_line)).m$to_s() + "]");

        if ((__a = self.args['m$[]'](1), __a !== false && __a !== nil)) {
          res = ((code).m$to_s() + ".concat(" + (self.args['m$[]'](1).m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + ")");
        } else {
          res = code;
        }

        return res.m$to_s();
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'HashNode', function(self) {

      $defn(self, 'initialize', function(parts, begn, endn) { var self = this;var __a;
        self.line = (((__a = begn['m$[]']('line')), __a != false && __a != nil) ? __a : 0);
        self.end_line = (((__a = endn['m$[]']('line')), __a != false && __a != nil) ? __a : 0);
        return self.parts = parts;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.parts == undefined) { self.parts = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        parts = (__a = self.parts.m$flatten(), $B.f = __a.m$map, ($B.p =function(part) { var self = this;          return part.m$process(opts, $cg(self, 'LEVEL_LIST'));}).$self=self, $B.f).call(__a);
        return ("$hash(" + (parts.m$join(', ')).m$to_s() + (self.m$fix_line_number(opts, self.end_line)).m$to_s() + ")");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'IfNode', function(self) {

      $defn(self, 'initialize', function(begn, expr, stmt, tail, endn) { var self = this;
        self.type = begn['m$[]']('value');
        self.line = begn['m$[]']('line');
        self.end_line = endn['m$[]']('line');
        self.expr = expr;
        self.stmt = stmt;
        return self.tail = tail;
      });

      $defn(self, 'returns', function() { var self = this;var __a, __b;if (self.stmt == undefined) { self.stmt = nil; }if (self.tail == undefined) { self.tail = nil; }
        self.stmt.m$returns();

        (__a = self.tail, $B.f = __a.m$each, ($B.p =function(tail) { var self = this;
          if (tail['m$[]'](0)['m$[]']('value').valueOf() === 'elsif'.valueOf()) {
            return tail['m$[]'](2).m$returns();
          } else {
            return tail['m$[]'](1).m$returns();
          }
        }).$self=self, $B.f).call(__a);
        return self;
      });

      $defn(self, 'expression?', function() { var self = this;if (self.expr_level == undefined) { self.expr_level = nil; }
        return self.expr_level;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, done_else, tail, old_indent, stmt_level, expr, __a, __b;if (self.expr == undefined) { self.expr = nil; }if (self.type == undefined) { self.type = nil; }if (self.stmt == undefined) { self.stmt = nil; }if (self.tail == undefined) { self.tail = nil; }if (self.force_else == undefined) { self.force_else = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        code = '';
        done_else = false;
        tail = nil;
        old_indent = opts['m$[]']('indent');

        opts['m$[]=']('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));


        stmt_level = ((level.valueOf() === $cg(self, 'LEVEL_EXPR').valueOf() ? $cg(self, 'LEVEL_TOP_CLOSURE') : $cg(self, 'LEVEL_TOP')));

        if (stmt_level.valueOf() === $cg(self, 'LEVEL_TOP_CLOSURE').valueOf()) {
          self.m$returns();
          self.level_expr = true;
        }

        expr = self.m$generate_truthy_test(self.expr, opts);

        code = code['m$+'](("if (" + ((self.type.valueOf() === 'if'.valueOf() ? '' : '!')).m$to_s() + (expr).m$to_s() + ") {" + (self.stmt.m$process(opts, stmt_level)).m$to_s()));

        (__a = self.tail, $B.f = __a.m$each, ($B.p =function(tail) { var self = this;
          opts['m$[]=']('indent', old_indent);
          code = code + self.m$fix_line_number(opts, tail['m$[]'](0)['m$[]']('line'));

          if (tail['m$[]'](0)['m$[]']('value').valueOf() === 'elsif'.valueOf()) {
            expr = self.m$generate_truthy_test(tail['m$[]'](1), opts);

            code = code['m$+'](("} else if (" + (expr).m$to_s() + ") {"));

            opts['m$[]=']('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));
            return code = code + tail['m$[]'](2).m$process(opts, stmt_level);
          } else {
            done_else = true;
            code = code['m$+']('} else {');
            opts['m$[]=']('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));
            return code = code['m$+'](tail['m$[]'](1).m$process(opts, stmt_level));
          }
        }).$self=self, $B.f).call(__a);

        if ((__a = self.force_else, __a !== false && __a !== nil)) {nil



        }

        opts['m$[]=']('indent', old_indent);
        code = code['m$+']((self.m$fix_line_number(opts, self.end_line) + '}'));


        if (level.valueOf() === $cg(self, 'LEVEL_EXPR').valueOf()) {          code = ("(function() {" + (code).m$to_s() + "})()");}
        return code;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'CaseNode', function(self) {

      $defn(self, 'initialize', function(begn, expr, body, endn) { var self = this;
        self.line = begn['m$[]']('line');
        self.expr = expr;
        self.body = body;
        return self.end_line = endn['m$[]']('line');
      });

      $defn(self, 'returns', function() { var self = this;var __a, __b;if (self.body == undefined) { self.body = nil; }
        (__a = self.body, $B.f = __a.m$each, ($B.p =function(part) { var self = this;
          if (part['m$[]'](0)['m$[]']('value').valueOf() === 'when'.valueOf()) {
            return part['m$[]'](2).m$returns();
          } else {
            return part['m$[]'](1).m$returns();
          }
        }).$self=self, $B.f).call(__a);
        return self;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, done_else, tail, old_indent, stmt_level, expr, case_ref, __a, __b;if (self.expr == undefined) { self.expr = nil; }if (self.body == undefined) { self.body = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        code = '';
        done_else = false;
        tail = nil;
        old_indent = opts['m$[]']('indent');

        opts['m$[]=']('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));

        stmt_level = ((level.valueOf() === $cg(self, 'LEVEL_EXPR').valueOf() ? $cg(self, 'LEVEL_TOP_CLOSURE') : $cg(self, 'LEVEL_TOP')));

        if (stmt_level.valueOf() === $cg(self, 'LEVEL_TOP_CLOSURE').valueOf()) {
          self.m$returns();
          self.level_expr = true;
        }

        expr = self.expr.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        case_ref = opts['m$[]']('scope').m$temp_local();

        code = code['m$+'](((case_ref).m$to_s() + " = " + (expr).m$to_s() + ";"));

        (__a = self.body, $B.f = __a.m$each_with_index, ($B.p =function(part, idx) { var self = this; var parts, __a, __b;
          opts['m$[]=']('indent', old_indent);
          code = code['m$+'](self.m$fix_line_number(opts, part['m$[]'](0)['m$[]']('line')));

          if (part['m$[]'](0)['m$[]']('value').valueOf() === 'when'.valueOf()) {
            code = code['m$+'](((idx.valueOf() === (0).valueOf() ? "if" : "} else if")));
            parts = (__a = part['m$[]'](1), $B.f = __a.m$map, ($B.p =function(expr) { var self = this;
              return self.m$generate_truthy_test($cg(self, 'CallNode').m$new(expr, $hash(
              'value', '==='), [
              [$cg(self, 'TempNode').m$new(case_ref)]]), opts);

            }).$self=self, $B.f).call(__a);
            opts['m$[]=']('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));
            return code = code['m$+']((" (" + (parts.m$join(' || ')).m$to_s() + ") {" + (part['m$[]'](2).m$process(opts, stmt_level)).m$to_s()));
          } else {
            return code = code['m$+'](("} else {" + (part['m$[]'](1).m$process(opts, stmt_level)).m$to_s()));
          }
        }).$self=self, $B.f).call(__a);

        opts['m$[]=']('indent', old_indent);

        opts['m$[]']('scope').m$queue_temp(case_ref);
        code = code['m$+']((self.m$fix_line_number(opts, self.end_line) + '}'));

        if (level.valueOf() === $cg(self, 'LEVEL_EXPR').valueOf()) {          code = ("(function() {" + (code).m$to_s() + "})()");}
        return code;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'TempNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        self.val = val;
        return self.line = 0;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.val == undefined) { self.val = nil; }
        return self.val;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ConstantNode', function(self) {

      $defn(self, 'initialize', function(name) { var self = this;
        self.line = name['m$[]']('line');
        return self.name = name['m$[]']('value');
      });

      $defn(self, 'value', function() { var self = this;if (self.name == undefined) { self.name = nil; }
        return self.name;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.name == undefined) { self.name = nil; }
        return ("$cg(" + ($cg(self, 'SelfNode').m$new().m$generate(opts, level)).m$to_s() + ", '" + (self.name).m$to_s() + "')");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'Colon2Node', function(self) {

      $defn(self, 'initialize', function(lhs, name) { var self = this;
        self.lhs = lhs;
        self.line = name['m$[]']('line');
        return self.name = name['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.lhs == undefined) { self.lhs = nil; }if (self.name == undefined) { self.name = nil; }

        return ("$cg(" + (self.lhs.m$generate(opts, level)).m$to_s() + ", '" + (self.name).m$to_s() + "')");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'Colon3Node', function(self) {

      $defn(self, 'initialize', function(name) { var self = this;
        self.line = name['m$[]']('line');
        return self.name = name['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.name == undefined) { self.name = nil; }
        return ("rm_vm_cg($opal.Object, '" + (self.name).m$to_s() + "')");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'AssignNode', function(self) {

      $defn(self, 'initialize', function(lhs, rhs, assign) { var self = this;if (assign == undefined) {assign = $hash();}
        self.line = lhs.m$line();
        self.lhs = lhs;
        return self.rhs = rhs;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var __a, ivar_name, ivar_rhs, __b;if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }if (self.line == undefined) { self.line = nil; }
        if ((__a = self.lhs['m$is_a?']($cg(self, 'IvarNode')), __a !== false && __a !== nil)) {
          ivar_name = self.lhs.m$value().m$slice(1, self.lhs.m$value().m$length());
          ivar_rhs = self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));

          if ((__a = self.m$js_reserved_words()['m$include?'](ivar_name), __a !== false && __a !== nil)) {            return ("self['" + (ivar_name).m$to_s() + "'] = " + (ivar_rhs).m$to_s());}
          return ("self." + (ivar_name).m$to_s() + " = " + (ivar_rhs).m$to_s());

        } else if ((__a = self.lhs['m$is_a?']($cg(self, 'CvarNode')), __a !== false && __a !== nil)) {
          return ("$rb.cvs('" + (self.lhs.m$value()).m$to_s() + "', " + (self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + ")");

        } else if ((__a = self.lhs['m$is_a?']($cg(self, 'GvarNode')), __a !== false && __a !== nil)) {
          return ("$rb.gs('" + (self.lhs.m$value()).m$to_s() + "', " + (self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + ")");

        } else if ((__a = self.lhs['m$is_a?']($cg(self, 'IdentifierNode')), __a !== false && __a !== nil)) {
          opts['m$[]']('scope').m$ensure_variable(self.lhs.m$value());


          if ((__a = (((__b = self.rhs['m$is_a?']($cg(self, 'YieldNode'))), __b != false && __b != nil) ? level.valueOf() === $cg(self, 'LEVEL_TOP').valueOf() : __b), __a !== false && __a !== nil)) {
            return self.rhs.m$generate_assign(opts, self.lhs);
          }
          return self.lhs.m$value() + " = " + self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));

        } else if ((__a = self.lhs['m$is_a?']($cg(self, 'ArefNode')), __a !== false && __a !== nil)) {
          return $cg(self, 'AsetNode').m$new(self.lhs.m$recv(), self.lhs.m$arefs(), self.rhs).m$process(opts, level);

        } else if ((__a = self.lhs['m$is_a?']($cg(self, 'ConstantNode')), __a !== false && __a !== nil)) {
          return ("$rb.cs(self, '" + (self.lhs.m$value()).m$to_s() + "', " + (self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + ")");

        } else if ((__a = self.lhs['m$is_a?']($cg(self, 'CallNode')), __a !== false && __a !== nil)) {
          return $cg(self, 'CallNode').m$new(self.lhs.m$recv(), $hash('value', self.lhs.m$mid() + '=', 'line', self.line), [[self.rhs]]).m$generate(opts, level);

        } else {
          return self.m$raise(("Bad lhs for assign on " + (self.line).m$to_s()));
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'MlhsAssignNode', function(self) {

      $defn(self, 'initialize', function(node, lhs, rhs) { var self = this;
        self.line = node['m$[]']('line');
        self.lhs = lhs;
        return self.rhs = rhs;
      });

      $defn(self, 'generate', function(opts, level) { var self = this;if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }
        self.lhs.m$inspect();
        self.generator_opts = opts;
        return '(' + self.m$generate_mlhs_context(self.lhs, self.rhs) + ')';
      });

      return $defn(self, 'generate_mlhs_context', function(arr, rhs) { var self = this;var parts, tmp_recv, tmp_len, rhs_code, __a, __b;if (self.generator_opts == undefined) { self.generator_opts = nil; }
        self.m$puts(("mlhs node at " + "#@line"));
        parts = [];

        tmp_recv = self.generator_opts['m$[]']('scope').m$temp_local();
        tmp_len = self.generator_opts['m$[]']('scope').m$temp_local();
        rhs_code = rhs.m$generate(self.generator_opts, $cg(self, 'LEVEL_EXPR'));

        parts['m$<<'](((tmp_recv).m$to_s() + " = " + (rhs_code).m$to_s()));
        parts['m$<<'](("(" + (tmp_recv).m$to_s() + ".$flags & $rb.T_ARRAY) || (" + (tmp_recv).m$to_s() + " = [" + (tmp_recv).m$to_s() + "])"));
        parts['m$<<'](((tmp_len).m$to_s() + " = " + (tmp_recv).m$to_s() + ".length"));

        if ((__a = arr['m$[]'](0), __a !== false && __a !== nil)) {
          (__a = arr['m$[]'](0), $B.f = __a.m$each_with_index, ($B.p =function(part, idx) { var self = this; var __a, assign, code;
            if ((__a = part['m$is_a?']($cg(self, 'Array')), __a !== false && __a !== nil)) {
              return parts.m$push(self.m$generate_mlhs_context(part, rhs));
            } else {
              assign = $cg(self, 'AssignNode').m$new(part, $cg(self, 'TempNode').m$new(((tmp_recv).m$to_s() + "[" + (idx).m$to_s() + "]")));
              code = assign.m$generate(self.generator_opts, $cg(self, 'LEVEL_EXPR'));
              return parts.m$push(((idx).m$to_s() + " < " + (tmp_len).m$to_s() + " ? " + (code).m$to_s() + " : nil"));

            }
          }).$self=self, $B.f).call(__a);
        }

        parts['m$<<'](tmp_recv);

        self.generator_opts['m$[]']('scope').m$queue_temp(tmp_recv);
        self.generator_opts['m$[]']('scope').m$queue_temp(tmp_len);

        return parts.m$join(', ');
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'OpAsgnNode', function(self) {

      $defn(self, 'initialize', function(asgn, lhs, rhs) { var self = this;
        self.line = asgn['m$[]']('line');
        self.lhs = lhs;
        self.rhs = rhs;
        return self.asgn = asgn['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var assign, __a;if (self.asgn == undefined) { self.asgn = nil; }if (self.line == undefined) { self.line = nil; }if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }
        assign = nil;

        if (self.asgn.valueOf() === '||'.valueOf()) {
          assign = $cg(self, 'OrNode').m$new($hash('value', '||', 'line', self.line), self.lhs, $cg(self, 'AssignNode').m$new(self.lhs, self.rhs));
        } else if ((__a = ["+", "-", "/", "*"]['m$include?'](self.asgn), __a !== false && __a !== nil)) {
          assign = $cg(self, 'AssignNode').m$new(self.lhs, $cg(self, 'CallNode').m$new(self.lhs, $hash('value', self.asgn, 'line', self.line), [[self.rhs]]));
        } else {
          self.m$raise(("Bas op asgn type: " + (self.asgn).m$to_s()));
        }
        return assign.m$generate(opts, level);
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'IvarNode', function(self) {

      self.m$attr_reader('value');

      $defn(self, 'initialize', function(val) { var self = this;
        self.line = val['m$[]']('line');
        return self.value = val['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var var_name, __a;if (self.value == undefined) { self.value = nil; }
        var_name = self.value.m$slice(1, self.value.m$length());
        opts['m$[]']('scope').m$ensure_ivar(var_name);

        if ((__a = self.m$js_reserved_words()['m$include?'](var_name), __a !== false && __a !== nil)) {          return ("self['" + (var_name).m$to_s() + "']");}
        return ("self." + (var_name).m$to_s());
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'CvarNode', function(self) {

      self.m$attr_reader('value');

      $defn(self, 'initialize', function(val) { var self = this;
        self.line = val['m$[]']('line');
        return self.value = val['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.value == undefined) { self.value = nil; }
        return ("$rb.cvg('" + (self.value).m$to_s() + "')");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'IdentifierNode', function(self) {
      self.m$attr_reader('value');

      $defn(self, 'initialize', function(val) { var self = this;
        self.line = val['m$[]']('line');
        return self.value = val['m$[]']('value');
      });

      $defn(self, 'local_variable?', function(opts) { var self = this;var __a;if (self.value == undefined) { self.value = nil; }
        return ((__a = opts['m$[]']('scope').m$find_variable(self.value), __a !== false && __a !== nil) ? true : false);
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var __a;if (self.value == undefined) { self.value = nil; }if (self.line == undefined) { self.line = nil; }
        if ((__a = opts['m$[]']('scope').m$find_variable(self.value), __a !== false && __a !== nil)) {
          return self.value;
        } else {
          return $cg(self, 'CallNode').m$new(nil, $hash('value', self.value, 'line', self.line), [[]]).m$generate(opts, level);
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'FuncReturnNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        self.value = val;
        return self.line = val.m$line();
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.value == undefined) { self.value = nil; }
        return ("return " + (self.value.m$generate(opts, level)).m$to_s());
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'StringNode', function(self) {

      $defn(self, 'initialize', function(parts, endn) { var self = this;
        self.line = endn['m$[]']('line');
        self.parts = parts;
        return self.join = endn['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.parts == undefined) { self.parts = nil; }if (self.join == undefined) { self.join = nil; }
        if (self.parts.m$length().valueOf() === (0).valueOf()) {
          return "''";
        } else if (self.parts.m$length().valueOf() === (1).valueOf()) {
          if (self.parts['m$[]'](0)['m$[]'](0).valueOf() === 'string_content'.valueOf()) {
            return self.join + self.parts['m$[]'](0)['m$[]'](1)['m$[]']('value') + self.join;
          } else if (self.parts['m$[]'](0)['m$[]'](0).valueOf() === 'string_dbegin'.valueOf()) {
            return $cg(self, 'CallNode').m$new(self.parts['m$[]'](0)['m$[]'](1), $hash('value', 'to_s', 'line', 0), [[]]).m$generate(opts, level);
          }

        } else {
          parts = (__a = self.parts, $B.f = __a.m$map, ($B.p =function(part) { var self = this;
            if (part['m$[]'](0).valueOf() === 'string_content'.valueOf()) {
              return self.join + part['m$[]'](1)['m$[]']('value') + self.join;
            } else if (part['m$[]'](0).valueOf() === 'string_dbegin'.valueOf()) {
              return "(" + part['m$[]'](1).m$generate(opts, $cg(self, 'LEVEL_EXPR')) + ").m$to_s()";

            }
          }).$self=self, $B.f).call(__a);

          return '(' + parts.m$join(' + ') + ')';
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ArithmeticNode', function(self) {
      $defn(self, 'initialize', function(lhs, op, rhs) { var self = this;
        self.lhs = lhs;
        self.op = op['m$[]']('value');
        self.line = op['m$[]']('line');
        return self.rhs = rhs;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var lhs, rhs, __a;if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }if (self.op == undefined) { self.op = nil; }
        lhs = self.lhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        rhs = self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));

        if ((__a = opts['m$[]']('top')['m$overload_arithmetic?'](), __a !== false && __a !== nil)) {
          if ((__a = opts['m$[]']('top')['m$method_missing?'](), __a !== false && __a !== nil)) {
            return ("$rb_send(" + (lhs).m$to_s() + ", 'm$" + (self.op).m$to_s() + "', " + (rhs).m$to_s() + ")");
          } else {
            if ((__a = self.lhs['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {              lhs = ("(" + (lhs).m$to_s() + ")");}
            return ((lhs).m$to_s() + "['m$" + (self.op).m$to_s() + "'](" + (rhs).m$to_s() + ")");
          }
        } else {
          return ((lhs).m$to_s() + " " + (self.op).m$to_s() + " " + (rhs).m$to_s());
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'EqualNode', function(self) {
      $defn(self, 'initialize', function(lhs, op, rhs) { var self = this;
        self.line = op['m$[]']('line');
        self.op = op['m$[]']('value');
        self.lhs = lhs;
        return self.rhs = rhs;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var lhs, rhs, __a, op;if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }if (self.op == undefined) { self.op = nil; }
        lhs = self.lhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        rhs = self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));

        if ((__a = opts['m$[]']('top')['m$overload_equal?'](), __a !== false && __a !== nil)) {
          if ((__a = opts['m$[]']('top')['m$method_missing?'](), __a !== false && __a !== nil)) {
            return ("$rb_send(" + (lhs).m$to_s() + ", 'm$" + (self.op).m$to_s() + "', " + (rhs).m$to_s() + ")");
          } else {
            if ((__a = self.lhs['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {              lhs = ("(" + (lhs).m$to_s() + ")");}
            return ((lhs).m$to_s() + "['m$" + (self.op).m$to_s() + "'](" + (rhs).m$to_s() + ")");
          }
        } else {
          op = ((self.op).m$to_s() + "=");
          if ((__a = self.lhs['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {            lhs = ("(" + (lhs).m$to_s() + ")");}
          if ((__a = self.rhs['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {            rhs = ("(" + (rhs).m$to_s() + ")");}
          return ((lhs).m$to_s() + ".valueOf() " + (op).m$to_s() + " " + (rhs).m$to_s() + ".valueOf()");
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ComparisonNode', function(self) {

      $defn(self, 'initialize', function(op, lhs, rhs) { var self = this;
        self.line = op['m$[]']('line');
        self.op = op['m$[]']('value');
        self.lhs = lhs;
        return self.rhs = rhs;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var lhs, __a, rhs;if (self.lhs == undefined) { self.lhs = nil; }if (self.rhs == undefined) { self.rhs = nil; }if (self.op == undefined) { self.op = nil; }
        lhs = self.lhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        if ((__a = self.lhs['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {          lhs = ("(" + (lhs).m$to_s() + ")");}
        rhs = self.rhs.m$generate(opts, $cg(self, 'LEVEL_EXPR'));

        if ((__a = opts['m$[]']('top')['m$overload_equal?'](), __a !== false && __a !== nil)) {
          if (self.op.valueOf() === '!='.valueOf()) {
            return ("!" + (lhs).m$to_s() + "['m$=='](" + (rhs).m$to_s() + ")");
          } else {
            return ((lhs).m$to_s() + "['m$" + (self.op).m$to_s() + "'](" + (rhs).m$to_s() + ")");
          }
        } else {
          if (self.op.valueOf() === '!='.valueOf()) {
            if ((__a = self.rhs['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {              rhs = ("(" + (rhs).m$to_s() + ")");}
            return ((lhs).m$to_s() + ".valueOf() !== " + (rhs).m$to_s() + ".valueOf()");
          } else if (self.op.valueOf() === '=='.valueOf()) {
            if ((__a = self.rhs['m$is_a?']($cg(self, 'NumericNode')), __a !== false && __a !== nil)) {              rhs = ("(" + (rhs).m$to_s() + ")");}
            return ((lhs).m$to_s() + ".valueOf() === " + (rhs).m$to_s() + ".valueOf()");
          } else {
            return ((lhs).m$to_s() + " " + (self.op).m$to_s() + " " + (rhs).m$to_s());
          }
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'UnaryNode', function(self) {

      $defn(self, 'initialize', function(op, val) { var self = this;
        self.line = op['m$[]']('line');
        self.op = op['m$[]']('value');
        return self.val = val;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var tmp, expr, res;if (self.op == undefined) { self.op = nil; }if (self.val == undefined) { self.val = nil; }
        if (self.op.valueOf() === '!'.valueOf()) {
          tmp = opts['m$[]']('scope').m$temp_local();
          expr = self.val.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
          res = ("(" + (tmp).m$to_s() + " = " + (expr).m$to_s() + ", " + (tmp).m$to_s() + " === false || " + (tmp).m$to_s() + " === nil)");
          opts['m$[]']('scope').m$queue_temp(tmp);
          return res;
        } else {
          return ((self.op).m$to_s() + (self.val.m$generate(opts, level)).m$to_s());
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'TrueNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        return self.line = val['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;
        return "true";
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'FalseNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        return self.line = val['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;
        return "false";
      });
        }, 0);

    $class(self, $cg(self, 'ScopeNode'), 'BlockNode', function(self) {

      $defn(self, 'initialize', function(start, vars, stmt, endn) { var self = this;
        $super(arguments.callee, self, [nil, stmt]);
        self.line = start['m$[]']('line');
        self.args = vars;
        self.stmt = stmt;
        return self.end_line = endn['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var pre_code, code, scope, args, method_args, __a, __b, rest_arg_name, stmt, block_var, block_code;if (self.args == undefined) { self.args = nil; }if (self.stmt == undefined) { self.stmt = nil; }if (self.scope_vars == undefined) { self.scope_vars = nil; }if (self.block_arg_name == undefined) { self.block_arg_name = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        self.parent = opts['m$[]']('scope');
        pre_code = '';
        code = '';

        scope = $hash('scope', self, 'top', opts['m$[]']('top'), 'indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));
        args = self.args['m$[]'](0);
        method_args = [];

        if ((__a = args, __a !== false && __a !== nil)) {

          if ((__a = args['m$[]'](0), __a !== false && __a !== nil)) {
            (__a = args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this; var __a;
              self.m$param_variable(arg['m$[]']('value'));
              method_args['m$<<'](arg['m$[]']('value'));









              if ((__a = false, __a !== false && __a !== nil)) {
                return pre_code = pre_code['m$+'](("if (" + (arg['m$[]']('value')).m$to_s() + " === undefined) { " + (arg['m$[]']('value')).m$to_s() + " = nil; }"));
              }
            }).$self=self, $B.f).call(__a);
          }


          if ((__a = args['m$[]'](1), __a !== false && __a !== nil)) {
            (__a = args['m$[]'](1), $B.f = __a.m$each, ($B.p =function(arg) { var self = this; var opt_arg_name;
              opt_arg_name = arg['m$[]'](0)['m$[]']('value');
              self.m$param_variable(opt_arg_name);
              method_args['m$<<'](arg['m$[]'](0)['m$[]']('value'));
              return pre_code = pre_code['m$+'](("if (" + (opt_arg_name).m$to_s() + " === undefined) { " + (opt_arg_name).m$to_s() + " = " + (arg['m$[]'](1).m$generate(opts, level)).m$to_s() + ";}"));
            }).$self=self, $B.f).call(__a);
          }


          if ((__a = args['m$[]'](2), __a !== false && __a !== nil)) {

            if (!args['m$[]'](2)['m$[]']('value').valueOf() === '*'.valueOf()) {
              rest_arg_name = args['m$[]'](2)['m$[]']('value');

              self.m$param_variable(rest_arg_name);
              method_args['m$<<'](rest_arg_name);
              pre_code = pre_code['m$+'](((rest_arg_name).m$to_s() + " = [].slice.call(arguments, " + (method_args.m$length() - 1).m$to_s() + ");"));
            }
          }


          if ((__a = args['m$[]'](3), __a !== false && __a !== nil)) {
            self.m$param_variable(args['m$[]'](3)['m$[]']('value'));
            self.block_arg_name = args['m$[]'](3)['m$[]']('value');
            pre_code = pre_code['m$+'](("var " + (args['m$[]'](3)['m$[]']('value')).m$to_s() + " = (($yy == $y.y) ? nil: $yy);"));
          }
        }

        self.stmt.m$returns();
        stmt = self.stmt.m$process(scope, $cg(self, 'LEVEL_TOP'));

        block_var = opts['m$[]']('scope').m$temp_local();


        code = code['m$+'](("function(" + (method_args.m$join(', ')).m$to_s() + ") { var self = this;"));

        if (!(__a = self.scope_vars['m$empty?'](), __a !== false && __a !== nil)) {
          code = code['m$+']((" var " + (self.scope_vars.m$join(', ')).m$to_s() + ";"));
        }


        if ((__a = self.block_arg_name, __a !== false && __a !== nil)) {
          block_code = "var $y = $B, $yy, $ys, $yb = $y.b;";
          block_code = block_code['m$+']("if ($y.f == arguments.callee) { $yy = $y.p; }");
          block_code = block_code['m$+']("else { $yy = $y.y; }");
          block_code = block_code['m$+']("$y.f = nil ;$ys = $yy.o$s;");
          pre_code = block_code + pre_code;
        }

        code = code['m$+']((pre_code + stmt + self.m$fix_line_number(opts, self.end_line) + "}"));



        opts['m$[]']('scope').m$queue_temp(block_var);
        return code;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'XStringNode', function(self) {

      $defn(self, 'initialize', function(begn, parts, endn) { var self = this;
        self.line = begn['m$[]']('line');
        self.parts = parts;
        return self.end_line = endn['m$[]']('line');
      });


      $defn(self, 'returns', function() { var self = this;
        return self;
      });



      $defn(self, 'expression?', function() { var self = this;
        return false;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.parts == undefined) { self.parts = nil; }
        parts = (__a = self.parts, $B.f = __a.m$map, ($B.p =function(part) { var self = this;
          if (part['m$[]'](0).valueOf() === 'string_content'.valueOf()) {
            return part['m$[]'](1)['m$[]']('value');
          } else if (part['m$[]'](0).valueOf() === 'string_dbegin'.valueOf()) {
            return part['m$[]'](1).m$generate(opts, $cg(self, 'LEVEL_EXPR'));
          }
        }).$self=self, $B.f).call(__a);

        return parts.m$join('');
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ParenNode', function(self) {

      $defn(self, 'initialize', function(opening, parts, closing) { var self = this;
        self.line = opening['m$[]']('line');
        self.parts = parts;
        return self.end_line = closing['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.parts == undefined) { self.parts = nil; }
        parts = (__a = self.parts.m$nodes(), $B.f = __a.m$map, ($B.p =function(part) { var self = this;
          return part.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        }).$self=self, $B.f).call(__a);


        if ((__a = parts['m$empty?'](), __a !== false && __a !== nil)) {          parts['m$<<']('nil');}

        return ("(" + (parts.m$join(', ')).m$to_s() + ")");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ArefNode', function(self) {

      self.m$attr_reader('recv');

      self.m$attr_reader('arefs');

      $defn(self, 'initialize', function(recv, arefs) { var self = this;
        self.line = recv.m$line();
        self.recv = recv;
        return self.arefs = arefs;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.recv == undefined) { self.recv = nil; }if (self.line == undefined) { self.line = nil; }if (self.arefs == undefined) { self.arefs = nil; }
        return $cg(self, 'CallNode').m$new(self.recv, $hash('line', self.line, 'value', '[]'), self.arefs).m$generate(opts, level);
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'AsetNode', function(self) {

      $defn(self, 'initialize', function(recv, arefs, val) { var self = this;
        self.line = recv.m$line();
        self.recv = recv;
        self.arefs = arefs;
        return self.val = val;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var __a;if (self.arefs == undefined) { self.arefs = nil; }if (self.val == undefined) { self.val = nil; }if (self.recv == undefined) { self.recv = nil; }if (self.line == undefined) { self.line = nil; }
        (((__a = self.arefs['m$[]'](0)), __a != false && __a != nil) ? __a : (self.arefs['m$[]='](0, [])));
        self.arefs['m$[]'](0)['m$<<'](self.val);
        return $cg(self, 'CallNode').m$new(self.recv, $hash('line', self.line, 'value', '[]='), self.arefs).m$generate(opts, level);
      });
        }, 0);


    $class(self, $cg(self, 'BaseNode'), 'IfModNode', function(self) {

      $defn(self, 'initialize', function(type, expr, stmt) { var self = this;
        self.line = type['m$[]']('line');
        self.type = type['m$[]']('value');
        self.expr = expr;
        return self.stmt = stmt;
      });




      $defn(self, 'returns', function() { var self = this;if (self.stmt == undefined) { self.stmt = nil; }
        self.returns = true;
        self.stmt = self.stmt.m$returns();
        return self;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var __a, expr, r;if (self.returns == undefined) { self.returns = nil; }if (self.stmt == undefined) { self.stmt = nil; }if (self.expr == undefined) { self.expr = nil; }if (self.type == undefined) { self.type = nil; }

        if ((__a = self.returns, __a !== false && __a !== nil)) {          self.stmt.m$returns();}

        expr = self.m$generate_truthy_test(self.expr, opts);

        r = ("if(" + ((self.type.valueOf() === 'if'.valueOf() ? '' : '!')).m$to_s() + "(" + (expr).m$to_s());
        r = r['m$+']((")) {" + (self.stmt.m$process(opts, $cg(self, 'LEVEL_TOP'))).m$to_s() + "}"));


        if ((__a = self.returns, __a !== false && __a !== nil)) {          r = r['m$+'](" else { return nil; }");}
        return r;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'YieldNode', function(self) {

      $defn(self, 'initialize', function(start, args) { var self = this;
        self.line = start['m$[]']('line');
        return self.args = args;
      });


      $defn(self, 'yield_code', function(opts) { var self = this;var block_code, parts, __a, __b, code;if (self.args == undefined) { self.args = nil; }
        block_code = "$yy";

        parts = [];

        if ((__a = self.args['m$[]'](0), __a !== false && __a !== nil)) {
          (__a = self.args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this;            return parts['m$<<'](arg.m$generate(opts, $cg(self, 'LEVEL_EXPR')));}).$self=self, $B.f).call(__a);
        }

        if ((__a = self.args['m$[]'](1), __a !== false && __a !== nil)) {
          parts.m$unshift('$ys');
          code = ((block_code).m$to_s() + ".apply($ys, [" + (parts.m$join(', ')).m$to_s() + "].concat(" + (self.args['m$[]'](1).m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + "))");
        } else {
          parts.m$unshift('$ys');
          code = ((block_code).m$to_s() + ".call(" + (parts.m$join(', ')).m$to_s() + ")");
        }

        return code;
      });

      $defn(self, 'generate', function(opts, level) { var self = this;var block, code, tmp;

        block = opts['m$[]']('scope').m$set_uses_block();
        code = self.m$yield_code(opts);

        if (level.valueOf() === $cg(self, 'LEVEL_TOP').valueOf()) {
          return ("if (" + (code).m$to_s() + " == $yb) { return $yb.$value; }");
        } else {






          tmp = opts['m$[]']('scope').m$temp_local();
          return ("((" + (tmp).m$to_s() + " = " + (code).m$to_s() + ") == $yb ? $break() : " + (tmp).m$to_s() + ")");
        }
      });



      return $defn(self, 'generate_assign', function(opts, lhs) { var self = this;
        return ("if ((" + (lhs.m$value()).m$to_s() + " = " + (self.m$yield_code(opts)).m$to_s() + ") == $yb) { return $yb.$value; }");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'BreakNode', function(self) {

      $defn(self, 'initialize', function(start, args) { var self = this;
        self.line = start['m$[]']('line');
        return self.args = args;
      });



      $defn(self, 'returns', function() { var self = this;
        return self;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, __a, __b, while_scope, tmp_break_val;if (self.args == undefined) { self.args = nil; }
        code = [];

        if ((__a = self.args['m$[]'](0), __a !== false && __a !== nil)) {
          (__a = self.args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this;            return code['m$<<'](arg.m$generate(opts, $cg(self, 'LEVEL_EXPR')));}).$self=self, $B.f).call(__a);
        }

        __a = code.m$length();
        if ((__b = (0)['m$==='](__a), __b !== false && __b !== nil)) {
          code = "nil";
        } else if ((__b = (1)['m$==='](__a), __b !== false && __b !== nil)) {
          code = code['m$[]'](0);
        } else {
        code = '[' + code.m$join(', ') + ']';
        };

        if ((__a = opts['m$[]']('scope')['m$in_while_scope?'](), __a !== false && __a !== nil)) {
          while_scope = opts['m$[]']('scope').m$while_scope();
          tmp_break_val = while_scope.m$set_captures_break();
          return ((tmp_break_val).m$to_s() + " = " + (code).m$to_s() + "; break");
        } else if ((__a = opts['m$[]']('scope')['m$is_a?']($cg(self, 'BlockNode')), __a !== false && __a !== nil)) {
          if (level.valueOf() === $cg(self, 'LEVEL_TOP').valueOf()) {
            return ("return ($B.b.$value = " + (code).m$to_s() + ", $B.b)");
          } else {





            return ("$break(" + (code).m$to_s() + ")");
          }
        } else {
          return ("$break(" + (code).m$to_s() + ")");
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'NextNode', function(self) {

      $defn(self, 'initialize', function(start, args) { var self = this;
        self.line = start['m$[]']('line');
        return self.args = args;
      });

      $defn(self, 'returns', function() { var self = this;
        return self;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, __a, __b;if (self.args == undefined) { self.args = nil; }
        code = [];

        if ((__a = self.args['m$[]'](0), __a !== false && __a !== nil)) {
          (__a = self.args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this;            return code['m$<<'](arg.m$generate(opts, $cg(self, 'LEVEL_EXPR')));}).$self=self, $B.f).call(__a);
        }

        __a = code.m$length();
        if ((__b = (0)['m$==='](__a), __b !== false && __b !== nil)) {
          code = "nil";
        } else if ((__b = (1)['m$==='](__a), __b !== false && __b !== nil)) {
          code = code['m$[]'](0);
        } else {
        code = '[' + code.m$join(', ') + ']';
        };

        if ((__a = opts['m$[]']('scope')['m$in_while_scope?'](), __a !== false && __a !== nil)) {
          return "continue";
        } else {

          return ("return " + (code).m$to_s());


        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'RedoNode', function(self) {

      $defn(self, 'initialize', function(start) { var self = this;
        return self.line = start['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var __a;
        if ((__a = opts['m$[]']('scope')['m$in_while_scope?'](), __a !== false && __a !== nil)) {
          return ((opts['m$[]']('scope').m$while_scope().m$redo_var()).m$to_s() + " = true");
        } else {
          return "REDO()";
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'WhileNode', function(self) {

      self.m$attr_reader('redo_var');

      $defn(self, 'initialize', function(begn, exp, stmt, endn) { var self = this;
        self.line = begn['m$[]']('line');
        self.type = begn['m$[]']('value');
        self.expr = exp;
        self.stmt = stmt;
        return self.end_line = endn['m$[]']('line');
      });

      $defn(self, 'returns', function() { var self = this;
        self.returns = true;
        return self;
      });

      $defn(self, 'set_captures_break', function() { var self = this;var tmp;if (self.current_scope == undefined) { self.current_scope = nil; }
        tmp = self.current_scope.m$temp_local();
        return self.captures_break = tmp;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var stmt_level, truthy, eval_expr, code, return_value, __a;if (self.type == undefined) { self.type = nil; }if (self.expr == undefined) { self.expr = nil; }if (self.stmt == undefined) { self.stmt = nil; }if (self.end_line == undefined) { self.end_line = nil; }if (self.captures_break == undefined) { self.captures_break = nil; }
        self.current_scope = opts['m$[]']('scope');
        stmt_level = ((level.valueOf() === $cg(self, 'LEVEL_EXPR').valueOf() ? $cg(self, 'LEVEL_TOP_CLOSURE') : $cg(self, 'LEVEL_TOP')));
        truthy = (self.type.valueOf() === 'while'.valueOf() ? '' : '!');

        if (stmt_level.valueOf() === $cg(self, 'LEVEL_TOP_CLOSURE').valueOf()) {
          self.m$returns();
          self.level_expr = true;
        }

        self.redo_var = eval_expr = opts['m$[]']('scope').m$temp_local();
        code = ((eval_expr).m$to_s() + " = false; while (" + (eval_expr).m$to_s() + " || " + (truthy).m$to_s() + "(");
        code = code['m$+'](self.m$generate_truthy_test(self.expr, opts));
        code = code['m$+']((")) {" + (eval_expr).m$to_s() + " = false;"));

        opts['m$[]']('scope').m$push_while_scope(self);

        code = code['m$+'](self.stmt.m$process(opts, $cg(self, 'LEVEL_TOP')));

        opts['m$[]']('scope').m$pop_while_scope();

        code = code['m$+'](self.m$fix_line_number(opts, self.end_line));
        code = code['m$+']("}");

        opts['m$[]']('scope').m$queue_temp(eval_expr);

        return_value = "nil";

        if ((__a = self.captures_break, __a !== false && __a !== nil)) {
          code = ("#@captures_break = nil; " + (code).m$to_s());
          opts['m$[]']('scope').m$queue_temp(self.captures_break);
          return_value = self.captures_break;
        }

        if (stmt_level.valueOf() === $cg(self, 'LEVEL_TOP_CLOSURE').valueOf()) {          code = ("(function() {" + (code).m$to_s() + " return " + (return_value).m$to_s() + ";})()");}
        return code;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ForNode', function(self) {

      $defn(self, 'initialize', function(begn, vars, expr, compstmt, endn) { var self = this;
        self.line = begn['m$[]']('line');
        self.vars = vars;
        self.expr = expr;
        self.stmt = compstmt;
        return self.end_line = endn['m$[]']('line');
      });

      $defn(self, 'returns', function() { var self = this;
        self.returns = true;
        return self;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var stmt_level, idx, ref, len, code;if (self.expr == undefined) { self.expr = nil; }if (self.stmt == undefined) { self.stmt = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        self.current_scope = opts['m$[]']('scope');
        stmt_level = ((level.valueOf() === $cg(self, 'LEVEL_EXPR').valueOf() ? $cg(self, 'LEVEL_TOP_CLOSURE') : $cg(self, 'LEVEL_TOP')));

        if (stmt_level.valueOf() === $cg(self, 'LEVEL_TOP_CLOSURE').valueOf()) {
          self.m$returns();
          self.level_expr = true;
        }

        idx = opts['m$[]']('scope').m$temp_local();
        ref = opts['m$[]']('scope').m$temp_local();
        len = opts['m$[]']('scope').m$temp_local();
        code = ("for (" + (idx).m$to_s() + " = 0, " + (ref).m$to_s() + " = " + (self.expr.m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s());
        code = code['m$+']((", " + (len).m$to_s() + " = " + (ref).m$to_s() + ".length; " + (idx).m$to_s() + " < " + (len).m$to_s() + "; " + (idx).m$to_s() + "++) {"));

        code = code['m$+'](self.stmt.m$process(opts, $cg(self, 'LEVEL_TOP')));

        code = code['m$+'](self.m$fix_line_number(opts, self.end_line));
        return code = code['m$+']("}");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'SuperNode', function(self) {

      $defn(self, 'initialize', function(start, args) { var self = this;
        self.line = start['m$[]']('line');
        return self.args = args;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.args == undefined) { self.args = nil; }
        parts = [];

        if ((__a = self.args['m$[]'](0), __a !== false && __a !== nil)) {
          (__a = self.args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this;            return parts['m$<<'](arg.m$generate(opts, $cg(self, 'LEVEL_EXPR')));}).$self=self, $B.f).call(__a);
        }

        return ("$super(arguments.callee, self, [" + (parts.m$join(', ')).m$to_s() + "])");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'ReturnNode', function(self) {

      $defn(self, 'initialize', function(ret, val) { var self = this;
        self.line = ret['m$[]']('line');
        return self.args = val;
      });

      $defn(self, 'returns', function() { var self = this;
        return self;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var args, __a, code, __b, return_func;if (self.args == undefined) { self.args = nil; }
        args = self.args;

        if ((__a = args['m$[]'](0)['m$nil?'](), __a !== false && __a !== nil)) {
          code = $cg(self, 'NilNode').m$new().m$generate(opts, level);
        } else if (args['m$[]'](0).m$length().valueOf() === (1).valueOf()) {
          code = args['m$[]'](0)['m$[]'](0).m$generate(opts, level);
        } else {

          code = $cg(self, 'NilNode').m$new().m$generate(opts, level);
          code = [];
          (__a = args['m$[]'](0), $B.f = __a.m$each, ($B.p =function(arg) { var self = this;            return code['m$<<'](arg.m$generate(opts, $cg(self, 'LEVEL_EXPR')));}).$self=self, $B.f).call(__a);
          code = code = '[' + code.m$join(', ') + ']';
        }


        if ((__a = (__b = opts['m$[]']('scope')['m$is_a?']($cg(self, 'DefNode')), __b === false || __b === nil), __a !== false && __a !== nil)) {
          return_func = '__return_func';
          return ("$return(" + (code).m$to_s() + ", " + (return_func).m$to_s() + ")");


        } else if (level.valueOf() === $cg(self, 'LEVEL_TOP').valueOf()) {
          return ("return " + (code).m$to_s());
        } else {
          return ("$return(" + (code).m$to_s() + ")");
        }
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'BeginNode', function(self) {

      $defn(self, 'initialize', function(beginn, body, endn) { var self = this;
        self.line = beginn['m$[]']('line');
        self.body = body;
        return self.end_line = endn['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var code, old_indent, __a, __b, opt_ensure;if (self.body == undefined) { self.body = nil; }if (self.end_line == undefined) { self.end_line = nil; }
        code = "try {";
        old_indent = opts['m$[]']('indent');
        opts['m$[]=']('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));

        code = code['m$+'](self.body.m$process(opts, $cg(self, 'LEVEL_TOP')));
        code = code['m$+']("} catch (__err__) {");

        (__a = self.body.m$opt_rescue(), $B.f = __a.m$each, ($B.p =function(res) { var self = this; var __a;
          code = code['m$+'](((self.m$fix_line_number(opts, res['m$[]'](0)['m$[]']('line'))).m$to_s() + "if (true){"));
          opts['m$[]=']('indent', opts['m$[]']('indent') + $cg(self, 'INDENT'));
          if ((__a = res['m$[]'](2), __a !== false && __a !== nil)) {            opts['m$[]']('scope').m$ensure_variable(res['m$[]'](2).m$value());}
          if ((__a = res['m$[]'](2), __a !== false && __a !== nil)) {            code = code['m$+']((res['m$[]'](2).m$value() + " = __err__;"));}
          code = code['m$+'](((res['m$[]'](3).m$process(opts, $cg(self, 'LEVEL_TOP'))).m$to_s() + "}"));
          return opts['m$[]=']('indent', old_indent + $cg(self, 'INDENT'));
        }).$self=self, $B.f).call(__a);

        if ((__a = opt_ensure = self.body.m$opt_ensure(), __a !== false && __a !== nil)) {

          code = code['m$+']("} finally {");
          code = code['m$+'](opt_ensure.m$process(opts, $cg(self, 'LEVEL_TOP')));
        }


        opts['m$[]=']('indent', old_indent);
        code = code['m$+']((self.m$fix_line_number(opts, self.end_line) + "}"));
        return code;
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'TernaryNode', function(self) {

      $defn(self, 'initialize', function(expr, truthy, falsy) { var self = this;
        self.line = expr.m$line();
        self.expr = expr;
        self['true'] = truthy;
        return self['false'] = falsy;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var test;if (self.expr == undefined) { self.expr = nil; }if (self['true'] == undefined) { self['true'] = nil; }if (self['false'] == undefined) { self['false'] = nil; }
        test = self.m$generate_truthy_test(self.expr, opts);
        return ("(" + (test).m$to_s() + " ? " + (self['true'].m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + " : " + (self['false'].m$generate(opts, $cg(self, 'LEVEL_EXPR'))).m$to_s() + ")");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'GvarNode', function(self) {

      self.m$attr_reader('value');

      $defn(self, 'initialize', function(val) { var self = this;
        self.line = val['m$[]']('line');
        return self.value = val['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.value == undefined) { self.value = nil; }
        return ("$rb.gg('" + (self.value).m$to_s() + "')");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'FileNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        return self.line = val['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;
        return "__FILE__";
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'LineNode', function(self) {

      $defn(self, 'initialize', function(val) { var self = this;
        self.line = val['m$[]']('line');
        return self.val = val['m$[]']('value');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;if (self.val == undefined) { self.val = nil; }
        return ("(" + (self.val).m$to_s() + ")");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'RegexpNode', function(self) {

      $defn(self, 'initialize', function(begn, parts) { var self = this;
        self.line = begn['m$[]']('line');
        return self.parts = parts;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.parts == undefined) { self.parts = nil; }
        parts = (__a = self.parts, $B.f = __a.m$map, ($B.p =function(part) { var self = this;
          if (part['m$[]'](0).valueOf() === 'string_content'.valueOf()) {
            return part['m$[]'](1)['m$[]']('value');
          } else if (part['m$[]'](0).valueOf() === 'string_dbegin'.valueOf()) {
            return part['m$[]'](1).m$generate(opts, $cg(self, 'LEVEL_EXPR'));
          }
        }).$self=self, $B.f).call(__a);

        return ("/" + (parts.m$join('')).m$to_s() + "/");
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'WordsNode', function(self) {

      $defn(self, 'initialize', function(begn, parts, endn) { var self = this;
        self.line = begn['m$[]']('line');
        self.parts = parts;
        return self.end_line = endn['m$[]']('line');
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.parts == undefined) { self.parts = nil; }
        parts = (__a = self.parts, $B.f = __a.m$map, ($B.p =function(part) { var self = this;
          if (part['m$[]'](0).valueOf() === 'string_content'.valueOf()) {
            return part['m$[]'](1)['m$[]']('value').m$inspect();
          } else {
            return $cg(self, 'CallNode').m$new(part['m$[]'](1), $hash('value', 'to_s', 'line', self.line), []).m$generate(opts, $cg(self, 'LEVEL_EXPR'));
          }
        }).$self=self, $B.f).call(__a);

        return '[' + parts.m$join(', ') + ']';
      });
        }, 0);

    $class(self, $cg(self, 'BaseNode'), 'RangeNode', function(self) {

      $defn(self, 'initialize', function(range, beg, last) { var self = this;
        self.line = beg.m$line();
        self.beg = beg;
        self.last = last;
        self.range = range['m$[]']('value');
        return self.end_line = last.m$line();
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var beg, last, excl;if (self.beg == undefined) { self.beg = nil; }if (self.last == undefined) { self.last = nil; }if (self.range == undefined) { self.range = nil; }
        beg = self.beg.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        last = self.last.m$generate(opts, $cg(self, 'LEVEL_EXPR'));
        excl = self.range.valueOf() === '...'.valueOf();
        return ("$range(" + (beg).m$to_s() + ", " + (last).m$to_s() + ", " + (excl).m$to_s() + ")");
      });
        }, 0);

    return $class(self, $cg(self, 'BaseNode'), 'UndefNode', function(self) {

      $defn(self, 'initialize', function(start, parts) { var self = this;
        self.line = start['m$[]']('line');
        return self.parts = parts;
      });

      return $defn(self, 'generate', function(opts, level) { var self = this;var parts, __a, __b;if (self.parts == undefined) { self.parts = nil; }
        parts = (__a = self.parts, $B.f = __a.m$map, ($B.p =function(a) { var self = this; var __a;
          if ((__a = a['m$is_a?']($cg(self, 'SymbolNode')), __a !== false && __a !== nil)) {
            return a.m$generate(opts, level);
          } else {
            return '"' + a['m$[]']('value') + '"';
          }
        }).$self=self, $B.f).call(__a);
        parts.m$unshift('self');
        return ("$rb.um(" + (parts.m$join(', ')).m$to_s() + ")");
      });
        }, 0);
    }, 0);
}, 2);
}
var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, $class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, $range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm;return $$();
});opal.lib('opal/lexer', function($rb, self, __FILE__) {function $$(){self.m$require('opal/parser');
self.m$require('opal/nodes');

self.m$require('strscan');

return $class(self, nil, 'Opal', function(self) { 









  return $class(self, $cg($cg(self, 'Racc'), 'Parser'), 'Parser', function(self) {


    $class(self, $cg(self, 'StandardError'), 'RubyLexingError', function(self) {      return nil;    }, 0);






































    $defn(self, 'parse', function(source, options) { var self = this;var nodes;if (options == undefined) {options = $hash();}
      self.lex_state = 'expr_beg';
      self.cond = 0;
      self.cmdarg = 0;
      self.line_number = 1;
      self.string_parse_stack = [];
      self.scanner = $cg(self, 'StringScanner').m$new(source);
      nodes = self.m$do_parse();

      return nodes.m$generate_top(options);
    });

    $defn(self, 'next_token', function() { var self = this;var t;if (self.line_number == undefined) { self.line_number = nil; }
      t = self.m$get_next_token();
      t['m$[]='](1, $hash('value', t['m$[]'](1), 'line', self.line_number));
      return t;
    });

    $defn(self, 'cond_push', function(n) { var self = this;if (self.cond == undefined) { self.cond = nil; }
      return self.cond = (self.cond['m$<<'](1))['m$|']((n['m$&'](1)));
    });

    $defn(self, 'cond_pop', function() { var self = this;if (self.cond == undefined) { self.cond = nil; }
      return self.cond = self.cond['m$>>'](1);
    });

    $defn(self, 'cond_lexpop', function() { var self = this;if (self.cond == undefined) { self.cond = nil; }
      return self.cond = (self.cond['m$>>'](1))['m$|']((self.cond['m$&'](1)));
    });

    $defn(self, 'cond?', function() { var self = this;if (self.cond == undefined) { self.cond = nil; }
      return (self.cond['m$&'](1)).valueOf() !== (0).valueOf();
    });

    $defn(self, 'cmdarg_push', function(n) { var self = this;if (self.cmdarg == undefined) { self.cmdarg = nil; }
      return self.cmdarg = (self.cmdarg['m$<<'](1))['m$|']((n['m$&'](1)));
    });

    $defn(self, 'cmdarg_pop', function() { var self = this;if (self.cmdarg == undefined) { self.cmdarg = nil; }
      return self.cmdarg = self.cmdarg['m$>>'](1);
    });

    $defn(self, 'cmdarg_lexpop', function() { var self = this;if (self.cmdarg == undefined) { self.cmdarg = nil; }
      return self.cmdarg = (self.cmdarg['m$>>'](1))['m$|']((self.cmdarg['m$&'](1)));
    });

    $defn(self, 'cmdarg?', function() { var self = this;if (self.cmdarg == undefined) { self.cmdarg = nil; }
      return (self.cmdarg['m$&'](1)).valueOf() !== (0).valueOf();
    });

    $defn(self, 'push_string_parse', function(hash) { var self = this;if (self.string_parse_stack == undefined) { self.string_parse_stack = nil; }
      return self.string_parse_stack['m$<<'](hash);
    });

    $defn(self, 'pop_string_parse', function() { var self = this;if (self.string_parse_stack == undefined) { self.string_parse_stack = nil; }
      return self.string_parse_stack.m$pop();
    });

    $defn(self, 'current_string_parse', function() { var self = this;if (self.string_parse_stack == undefined) { self.string_parse_stack = nil; }
      return self.string_parse_stack.m$last();
    });

    $defn(self, 'next_string_token', function() { var self = this;var str_parse, scanner, space, interpolate, __a, words, __b, __c, result, str_buffer, complete_str;if (self.scanner == undefined) { self.scanner = nil; }

      str_parse = self.m$current_string_parse();
      scanner = self.scanner;
      space = false;


      interpolate = ((((__a = str_parse['m$[]']('beg').valueOf() !== "'".valueOf()), __a != false && __a != nil) ? str_parse['m$[]']('beg').valueOf() !== 'w'.valueOf() : __a));

      words = ['w', 'W']['m$include?'](str_parse['m$[]']('beg'));

      if ((__a = (((__b = ['w', 'W']['m$include?'](str_parse['m$[]']('beg'))), __b != false && __b != nil) ? scanner.m$scan(/\s+/) : __b), __a !== false && __a !== nil)) {        space = true;}



      if ((__a = scanner.m$scan($cg(self, 'Regexp').m$new($cg(self, 'Regexp').m$escape(str_parse['m$[]']('end')))), __a !== false && __a !== nil)) {
        if ((__a = (((__b = words), __b != false && __b != nil) ? (__c = str_parse['m$[]']('done_last_space'), __c === false || __c === nil) : __b), __a !== false && __a !== nil)) {
          str_parse['m$[]=']('done_last_space', true);
          scanner['m$pos='](scanner.m$pos()['m$-'](1));
          return ['SPACE', ' '];
        }
        self.m$pop_string_parse();



        if ((__a = ['"', "'"]['m$include?'](str_parse['m$[]']('beg')), __a !== false && __a !== nil)) {
          self.lex_state = 'expr_end';
          return ['STRING_END', scanner.m$matched()];

        } else if (str_parse['m$[]']('beg').valueOf() === '`'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['STRING_END', scanner.m$matched()];

        } else if (str_parse['m$[]']('beg').valueOf() === '/'.valueOf()) {
          if ((__a = scanner.m$scan(/\w+/), __a !== false && __a !== nil)) {            result = scanner.m$matched();}
          self.lex_state = 'expr_end';
          return ['REGEXP_END', result];

        } else {
          self.lex_state = 'expr_end';
          return ['STRING_END', scanner.m$matched()];
        }
      }

      if ((__a = space, __a !== false && __a !== nil)) {        return ['SPACE', ' '];}


      str_buffer = [];

      if ((__a = scanner.m$scan(/#(\$\@)\w+/), __a !== false && __a !== nil)) {
        if ((__a = interpolate, __a !== false && __a !== nil)) {
          return ['STRING_DVAR', scanner.m$matched().m$slice(2)];
        } else {
          str_buffer['m$<<'](scanner.m$matched());
        }

      } else if ((__a = scanner.m$scan(/#\{/), __a !== false && __a !== nil)) {
        if ((__a = interpolate, __a !== false && __a !== nil)) {

          str_parse['m$[]=']('content', false);
          return ['STRING_DBEG', scanner.m$matched()];
        } else {
          str_buffer['m$<<'](scanner.m$matched());
        }


      } else if ((__a = scanner.m$scan(/\#/), __a !== false && __a !== nil)) {
        str_buffer['m$<<']('#');
      }

      self.m$add_string_content(str_buffer, str_parse);
      complete_str = str_buffer.m$join('');
      return ['STRING_CONTENT', complete_str];
    });

    $defn(self, 'add_string_content', function(str_buffer, str_parse) { var self = this;var scanner, end_str_re, interpolate, words, __a, __b, c, handled, __c, __d, __e, reg;if (self.scanner == undefined) { self.scanner = nil; }
      scanner = self.scanner;


      end_str_re = $cg(self, 'Regexp').m$new($cg(self, 'Regexp').m$escape(str_parse['m$[]']('end')));

      interpolate = ['"', 'W', '/', '`']['m$include?'](str_parse['m$[]']('beg'));

      words = ['W', 'w']['m$include?'](str_parse['m$[]']('beg'));

      __d = nil; __a = false; while (__a || !((__b = scanner['m$eos?'](), __b !== false && __b !== nil))) {__a = false;
      c = nil;
      handled = true;

      if ((__b = scanner.m$check(end_str_re), __b !== false && __b !== nil)) {

        __b = nil; break;

      } else if ((__c = (((__d = words), __d != false && __d != nil) ? scanner.m$scan(/\s/) : __d), __c !== false && __c !== nil)) {
        scanner['m$pos='](scanner.m$pos()['m$-'](1));
        __c = nil; break;

      } else if ((__d = (((__e = interpolate), __e != false && __e != nil) ? scanner.m$check(/#(?=[\@\{])/) : __e), __d !== false && __d !== nil)) {
        __d = nil; break;

      } else if ((__e = scanner.m$scan(/\\\\/), __e !== false && __e !== nil)) {
        c = scanner.m$matched();

      } else if ((__e = scanner.m$scan(/\\/), __e !== false && __e !== nil)) {
        c = scanner.m$matched();
        if ((__e = scanner.m$scan(end_str_re), __e !== false && __e !== nil)) {          c = c['m$+'](scanner.m$matched());}

      } else {
        handled = false;
      }

      if (!(__e = handled, __e !== false && __e !== nil)) {
        reg = ((__e = words, __e !== false && __e !== nil) ? $cg(self, 'Regexp').m$new(("[^" + ($cg(self, 'Regexp').m$escape(str_parse['m$[]']('end'))).m$to_s() + "\#\0\n\ \\\\]+|.")) : $cg(self, 'Regexp').m$new(("[^" + ($cg(self, 'Regexp').m$escape(str_parse['m$[]']('end'))).m$to_s() + "\#\0\\\\]+|.")));
        scanner.m$scan(reg);
        c = scanner.m$matched();
      }

      (((__e = c), __e != false && __e != nil) ? __e : c = scanner.m$matched());
      str_buffer['m$<<'](c);
      };

      if ((__d = scanner['m$eos?'](), __d !== false && __d !== nil)) {        return self.m$raise("reached EOF while in string");}
    });

    return $defn(self, 'get_next_token', function() { var self = this;var string_scanner, __a, __b, scanner, space_seen, cmd_start, c, start_word, end_word, result, __c, __d, __e, sign, matched;if (self.scanner == undefined) { self.scanner = nil; }if (self.line_number == undefined) { self.line_number = nil; }if (self.lex_state == undefined) { self.lex_state = nil; }
      string_scanner = self.m$current_string_parse();

      if ((__a = (((__b = string_scanner), __b != false && __b != nil) ? string_scanner['m$[]']('content') : __b), __a !== false && __a !== nil)) {
        return self.m$next_string_token();
      }


      scanner = self.scanner;
      space_seen = false;
      cmd_start = false;
      c = '';

      __a = false; while (__a || ((__b = true, __b !== false && __b !== nil))) {__a = false;
      if ((__b = scanner.m$scan(/\ |\t|\r/), __b !== false && __b !== nil)) {
        space_seen = true;
        continue;

      } else if ((__b = scanner.m$scan(/(\n|#)/), __b !== false && __b !== nil)) {
        c = scanner.m$matched();
        if (c.valueOf() === '#'.valueOf()) {          scanner.m$scan(/(.*)/);} else {          self.line_number = self.line_number['m$+'](1);}

        scanner.m$scan(/(\n+)/);
        if ((__b = scanner.m$matched(), __b !== false && __b !== nil)) {          self.line_number = self.line_number['m$+'](scanner.m$matched().m$length());}

        if ((__b = ['expr_beg', 'expr_dot']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {          continue;}

        cmd_start = true;
        self.lex_state = 'expr_beg';
        return ['\\n', '\\n'];

      } else if ((__b = scanner.m$scan(/\;/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return [';', ';'];

      } else if ((__b = scanner.m$scan(/\"/), __b !== false && __b !== nil)) {
        self.m$push_string_parse($hash('beg', '"', 'content', true, 'end', '"'));
        return ['STRING_BEG', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\'/), __b !== false && __b !== nil)) {
        self.m$push_string_parse($hash('beg', "'", 'content', true, 'end', "'"));
        return ['STRING_BEG', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\`/), __b !== false && __b !== nil)) {
        self.m$push_string_parse($hash('beg', "`", 'content', true, 'end', "`"));
        return ['XSTRING_BEG', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\%W/), __b !== false && __b !== nil)) {
        start_word = scanner.m$scan(/./);
        end_word = (((__b = $hash('(', ')', '[', ']', '{', '}')['m$[]'](start_word)), __b != false && __b != nil) ? __b : start_word);
        self.m$push_string_parse($hash('beg', 'W', 'content', true, 'end', end_word));
        return ['WORDS_BEG', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\%w/), __b !== false && __b !== nil)) {
        start_word = scanner.m$scan(/./);
        end_word = (((__b = $hash('(', ')', '[', ']', '{', '}')['m$[]'](start_word)), __b != false && __b != nil) ? __b : start_word);
        self.m$push_string_parse($hash('beg', 'w', 'content', true, 'end', end_word));
        return ['AWORDS_BEG', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\%[Qq]/), __b !== false && __b !== nil)) {
        start_word = scanner.m$scan(/./);
        end_word = (((__b = $hash('(', ')', '[', ']', '{', '}')['m$[]'](start_word)), __b != false && __b != nil) ? __b : start_word);
        self.m$push_string_parse($hash('beg', start_word, 'content', true, 'end', end_word));
        return ['STRING_BEG', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\//), __b !== false && __b !== nil)) {
        if ((__b = ['expr_beg', 'expr_mid']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
          self.m$push_string_parse($hash('beg', '/', 'content', true, 'end', '/'));
          return ['REGEXP_BEG', scanner.m$matched()];
        } else if ((__b = scanner.m$scan(/\=/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OP_ASGN', '/'];
        } else if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
        }

        return ['/', '/'];

      } else if ((__b = scanner.m$scan(/\%/), __b !== false && __b !== nil)) {
        self.lex_state = (self.lex_state.valueOf() === 'expr_fname'.valueOf() ? 'expr_end' : 'expr_beg');
        return ['%', '%'];

      } else if ((__b = scanner.m$scan(/\(/), __b !== false && __b !== nil)) {
        result = scanner.m$matched();
        if ((__b = ['expr_beg', 'expr_mid']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
          result = 'PAREN_BEG';
        } else if ((__b = space_seen, __b !== false && __b !== nil)) {
          result = '(';
        }

        self.lex_state = 'expr_beg';
        self.m$cond_push(0);
        self.m$cmdarg_push(0);

        return [result, scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\)/), __b !== false && __b !== nil)) {
        self.m$cond_lexpop();
        self.m$cmdarg_lexpop();
        self.lex_state = 'expr_end';
        return [')', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\[/), __b !== false && __b !== nil)) {
        result = scanner.m$matched();

        if ((__b = ['expr_fname', 'expr_dot']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_arg';
          if ((__b = scanner.m$scan(/\]=/), __b !== false && __b !== nil)) {
            return ['[]=', '[]='];
          } else if ((__b = scanner.m$scan(/\]/), __b !== false && __b !== nil)) {
            return ['[]', '[]'];
          } else {
            self.m$raise("Unexpected '[' token");
          }
        } else if ((__b = (((__c = ['expr_beg', 'expr_mid']['m$include?'](self.lex_state)), __c != false && __c != nil) ? __c : space_seen), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          self.m$cond_push(0);
          self.m$cmdarg_push(0);
          return ['[', scanner.m$matched()];
        } else {
          self.lex_state = 'expr_beg';
          self.m$cond_push(0);
          self.m$cmdarg_push(0);
          return ['[@', scanner.m$matched()];
        }

      } else if ((__b = scanner.m$scan(/\]/), __b !== false && __b !== nil)) {
        self.m$cond_lexpop();
        self.m$cmdarg_lexpop();
        self.lex_state = 'expr_end';
        return [']', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\}/), __b !== false && __b !== nil)) {
        self.m$cond_lexpop();
        self.m$cmdarg_lexpop();
        self.lex_state = 'expr_end';

        if ((__b = self.m$current_string_parse(), __b !== false && __b !== nil)) {          self.m$current_string_parse()['m$[]=']('content', true);}
        return ['}', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\.\.\./), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return ['...', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\.\./), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return ['..', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\./), __b !== false && __b !== nil)) {
        if(!(self.lex_state.valueOf() === 'expr_fname'.valueOf())) {self.lex_state = 'expr_dot'};
        return ['.', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\*\*\=/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return ['OP_ASGN', '**'];

      } else if ((__b = scanner.m$scan(/\*\*/), __b !== false && __b !== nil)) {
        return ['**', '**'];

      } else if ((__b = scanner.m$scan(/\*\=/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return ['OP_ASGN', '*'];

      } else if ((__b = scanner.m$scan(/\*/), __b !== false && __b !== nil)) {
        result = scanner.m$matched();
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['*', result];
        } else if ((__b = (((__c = space_seen), __c != false && __c != nil) ? scanner.m$check(/\S/) : __c), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['SPLAT', result];
        } else if ((__b = ['expr_beg', 'expr_mid']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['SPLAT', result];
        } else {
          self.lex_state = 'expr_beg';
          return ['*', result];
        }

      } else if ((__b = scanner.m$scan(/\:\:/), __b !== false && __b !== nil)) {
        if ((__b = ['expr_beg', 'expr_mid', 'expr_class']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['::@', scanner.m$matched()];
        }

        self.lex_state = 'expr_dot';
        return ['::', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\:/), __b !== false && __b !== nil)) {
        if ((__b = (((__c = ['expr_end', 'expr_endarg']['m$include?'](self.lex_state)), __c != false && __c != nil) ? __c : scanner.m$check(/\s/)), __b !== false && __b !== nil)) {
          if (!(__b = scanner.m$check(/\w/), __b !== false && __b !== nil)) {
            self.lex_state = 'expr_beg';
            return [':', ':'];
          }

          self.lex_state = 'expr_fname';
          return ['SYMBOL_BEG', ':'];
        }

        if ((__b = scanner.m$scan(/\'/), __b !== false && __b !== nil)) {
          self.m$push_string_parse($hash('beg', "'", 'content', true, 'end', "'"));
        } else if ((__b = scanner.m$scan(/\"/), __b !== false && __b !== nil)) {
          self.m$push_string_parse($hash('beg', '"', 'content', true, 'end', '"'));
        }

        self.lex_state = 'expr_fname';
        return ['SYMBOL_BEG', ':'];

      } else if ((__b = scanner.m$check(/\|/), __b !== false && __b !== nil)) {
        if ((__b = scanner.m$scan(/\|\|\=/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OP_ASGN', '||'];
        } else if ((__b = scanner.m$scan(/\|\|/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['||', '||'];
        } else if ((__b = scanner.m$scan(/\|\=/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OP_ASGN', '|'];
        } else if ((__b = scanner.m$scan(/\|/), __b !== false && __b !== nil)) {
          if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
            self.lex_state = 'expr_end';
            return ['|', scanner.m$matched()];
          } else {
            self.lex_state = 'expr_beg';
            return ['|', scanner.m$matched()];
          }
        }

      } else if ((__b = scanner.m$scan(/\^/), __b !== false && __b !== nil)) {
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['^', scanner.m$matched()];
        }

        self.lex_state = 'expr_beg';
        return ['^', scanner.m$matched()];

      } else if ((__b = scanner.m$check(/\&/), __b !== false && __b !== nil)) {
        if ((__b = scanner.m$scan(/\&\&\=/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OP_ASGN', '&&'];
        } else if ((__b = scanner.m$scan(/\&\&/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['&&', scanner.m$matched()];
        } else if ((__b = scanner.m$scan(/\&\=/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OP_ASGN', '&'];
        } else if ((__b = scanner.m$scan(/\&/), __b !== false && __b !== nil)) {
          if ((__b = (((__c = (((__d = space_seen), __d != false && __d != nil) ? (__e = scanner.m$check(/\s/), __e === false || __e === nil) : __d)), __c != false && __c != nil) ? self.lex_state.valueOf() === 'expr_cmdarg'.valueOf() : __c), __b !== false && __b !== nil)) {
            return ['&@', '&'];
          } else if ((__b = ['expr_beg', 'expr_mid']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
            return ['&@', '&'];
          } else {
            return ['&', '&'];
          }
        }

      } else if ((__b = scanner.m$check(/\</), __b !== false && __b !== nil)) {
        if ((__b = scanner.m$scan(/\<\<\=/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OP_ASGN', '<<'];
        } else if ((__b = scanner.m$scan(/\<\</), __b !== false && __b !== nil)) {
          if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
            self.lex_state = 'expr_end';
            return ['<<', '<<'];
          } else if ((__b = (((__c = (__d = ['expr_end', 'expr_dot', 'expr_endarg', 'expr_class']['m$include?'](self.lex_state), __d === false || __d === nil)), __c != false && __c != nil) ? space_seen : __c), __b !== false && __b !== nil)) {
            self.lex_state = 'expr_beg';
            return ['<<', '<<'];
          }
          self.lex_state = 'expr_beg';
          return ['<<', '<<'];
        } else if ((__b = scanner.m$scan(/\<\=\>/), __b !== false && __b !== nil)) {
          if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
            self.lex_state = 'expr_end';
          } else {
            self.lex_state = 'expr_beg';
          }
          return ['<=>', '<=>'];
        } else if ((__b = scanner.m$scan(/\<\=/), __b !== false && __b !== nil)) {
          if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
            self.lex_state = 'expr_end';
          } else {
            self.lex_state = 'expr_beg';
          }
          return ['<=', '<='];
        } else if ((__b = scanner.m$scan(/\</), __b !== false && __b !== nil)) {
          if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
            self.lex_state = 'expr_end';
          } else {
            self.lex_state = 'expr_beg';
          }
          return ['<', '<'];
        }

      } else if ((__b = scanner.m$check(/\>/), __b !== false && __b !== nil)) {
        if ((__b = scanner.m$scan(/\>\>\=/), __b !== false && __b !== nil)) {
          return ['OP_ASGN', '>>'];
        } else if ((__b = scanner.m$scan(/\>\>/), __b !== false && __b !== nil)) {
          return ['>>', '>>'];
        } else if ((__b = scanner.m$scan(/\>\=/), __b !== false && __b !== nil)) {
          if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
            self.lex_state = 'expr_end';
          } else {
            self.lex_state = 'expr_beg';
          }
          return ['>=', scanner.m$matched()];
        } else if ((__b = scanner.m$scan(/\>/), __b !== false && __b !== nil)) {
          if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
            self.lex_state = 'expr_end';
          } else {
            self.lex_state = 'expr_beg';
          }
          return ['>', '>'];
        }

      } else if ((__b = scanner.m$scan(/[+-]/), __b !== false && __b !== nil)) {
        result = scanner.m$matched();
        sign = result + '@';

        if ((__b = (((__c = self.lex_state.valueOf() === 'expr_beg'.valueOf()), __c != false && __c != nil) ? __c : self.lex_state.valueOf() === 'expr_mid'.valueOf()), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_end';
          return [sign, sign];
        } else if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          if ((__b = scanner.m$scan(/@/), __b !== false && __b !== nil)) {            return ['IDENTIFIER', result + scanner.m$matched()];}
          return [result, result];
        }

        if ((__b = scanner.m$scan(/\=/), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OP_ASGN', result];
        }

        self.lex_state = 'expr_beg';
        return [result, result];

      } else if ((__b = scanner.m$scan(/\?/), __b !== false && __b !== nil)) {
        if ((__b = ['expr_end', 'expr_endarg']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {          self.lex_state = 'expr_beg';}
        return ['?', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\=\=\=/), __b !== false && __b !== nil)) {
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['===', '==='];
        }
        self.lex_state = 'expr_beg';
        return ['===', '==='];

      } else if ((__b = scanner.m$scan(/\=\=/), __b !== false && __b !== nil)) {
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['==', '=='];
        }
        self.lex_state = 'expr_beg';
        return ['==', '=='];

      } else if ((__b = scanner.m$scan(/\=\~/), __b !== false && __b !== nil)) {
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['=~', '=~'];
        }
        self.lex_state = 'expr_beg';
        return ['=~', '=~'];

      } else if ((__b = scanner.m$scan(/\=\>/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return ['=>', '=>'];

      } else if ((__b = scanner.m$scan(/\=/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return ['=', '='];

      } else if ((__b = scanner.m$scan(/\!\=/), __b !== false && __b !== nil)) {
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state.valueOf() === 'expr_end'.valueOf();
          return ['!=', '!='];
        }
        self.lex_state = 'expr_beg';
        return ['!=', '!='];

      } else if ((__b = scanner.m$scan(/\!\~/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return ['!~', '!~'];

      } else if ((__b = scanner.m$scan(/\!/), __b !== false && __b !== nil)) {
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['!', '!'];
        }
        self.lex_state = 'expr_beg';
        return ['!', '!'];

      } else if ((__b = scanner.m$scan(/\~/), __b !== false && __b !== nil)) {
        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          self.lex_state = 'expr_end';
          return ['~', '~'];
        }
        self.lex_state = 'expr_beg';
        return ['~', '~'];

      } else if ((__b = scanner.m$scan(/\$[\+\'\`\&!@\"~*$?\/\\:;=.,<>_]/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_end';
        return ['GVAR', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\$\w+/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_end';
        return ['GVAR', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\@\@\w*/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_end';
        return ['CVAR', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\@\w*/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_end';
        return ['IVAR', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\,/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_beg';
        return [',', scanner.m$matched()];

      } else if ((__b = scanner.m$scan(/\{/), __b !== false && __b !== nil)) {
        if ((__b = ['expr_end', 'expr_cmdarg']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
          result = '{@';
        } else if (self.lex_state.valueOf() === 'expr_endarg'.valueOf()) {
          result = 'LBRACE_ARG';
        } else {
          result = '{';
        }

        self.lex_state = 'expr_beg';
        self.m$cond_push(0);
        self.m$cmdarg_push(0);
        return [result, scanner.m$matched()];

      } else if ((__b = scanner.m$check(/[0-9]/), __b !== false && __b !== nil)) {
        self.lex_state = 'expr_end';
        if ((__b = scanner.m$scan(/[\d_]+\.[\d_]+\b/), __b !== false && __b !== nil)) {
          return ['FLOAT', scanner.m$matched().m$gsub(/_/, '')];
        } else if ((__b = scanner.m$scan(/[\d_]+\b/), __b !== false && __b !== nil)) {
          return ['INTEGER', scanner.m$matched().m$gsub(/_/, '')];
        } else if ((__b = scanner.m$scan(/0(x|X)(\d|[a-f]|[A-F])+/), __b !== false && __b !== nil)) {
          return ['INTEGER', scanner.m$matched()];
        } else {
          self.m$raise(("Lexing error on numeric type: `" + (scanner.m$peek(5)).m$to_s() + "`"));
        }

      } else if ((__b = scanner.m$scan(/(\w)+[\?\!]?/), __b !== false && __b !== nil)) {
        __b = scanner.m$matched();
        if ((__c = 'class'['m$==='](__b), __c !== false && __c !== nil)) {
          if (self.lex_state.valueOf() === 'expr_dot'.valueOf()) {
            self.lex_state = 'expr_end';
            return ['IDENTIFIER', scanner.m$matched()];
          }
          self.lex_state = 'expr_class';
          return ['CLASS', scanner.m$matched()];

        } else if ((__c = 'module'['m$==='](__b), __c !== false && __c !== nil)) {
          if (self.lex_state.valueOf() === 'expr_dot'.valueOf()) {            return ['IDENTIFIER', scanner.m$matched()];}
          self.lex_state = 'expr_class';
          return ['MODULE', scanner.m$matched()];

        } else if ((__c = 'def'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_fname';
          return ['DEF', scanner.m$matched()];

        } else if ((__c = 'undef'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_fname';
          return ['UNDEF', scanner.m$matched()];

        } else if ((__c = 'end'['m$==='](__b), __c !== false && __c !== nil)) {
          if ((__c = ['expr_dot', 'expr_fname']['m$include?'](self.lex_state), __c !== false && __c !== nil)) {
            self.lex_state = 'expr_end';
            return ['IDENTIFIER', scanner.m$matched()];
          }

          self.lex_state = 'expr_end';
          return ['END', scanner.m$matched()];

        } else if ((__c = 'do'['m$==='](__b), __c !== false && __c !== nil)) {
          if ((__c = self['m$cond?'](), __c !== false && __c !== nil)) {
            self.lex_state = 'expr_beg';
            return ['DO_COND', scanner.m$matched()];
          } else if ((__c = (((__d = self['m$cmdarg?']()), __d != false && __d != nil) ? self.lex_state.valueOf() !== 'expr_cmdarg'.valueOf() : __d), __c !== false && __c !== nil)) {
            self.lex_state = 'expr_beg';
            return ['DO_BLOCK', scanner.m$matched()];
          } else if (self.lex_state.valueOf() === 'expr_endarg'.valueOf()) {
            return ['DO_BLOCK', scanner.m$matched()];
          } else {
            self.lex_state = 'expr_beg';
            return ['DO', scanner.m$matched()];
          }

        } else if ((__c = 'if'['m$==='](__b), __c !== false && __c !== nil)) {
          if (self.lex_state.valueOf() === 'expr_beg'.valueOf()) {            return ['IF', scanner.m$matched()];}
          self.lex_state = 'expr_beg';
          return ['IF_MOD', scanner.m$matched()];

        } else if ((__c = 'unless'['m$==='](__b), __c !== false && __c !== nil)) {
          if (self.lex_state.valueOf() === 'expr_beg'.valueOf()) {            return ['UNLESS', scanner.m$matched()];}
          return ['UNLESS_MOD', scanner.m$matched()];

        } else if ((__c = 'else'['m$==='](__b), __c !== false && __c !== nil)) {
          return ['ELSE', scanner.m$matched()];

        } else if ((__c = 'elsif'['m$==='](__b), __c !== false && __c !== nil)) {
          return ['ELSIF', scanner.m$matched()];

        } else if ((__c = 'self'['m$==='](__b), __c !== false && __c !== nil)) {
          if(!(self.lex_state.valueOf() === 'expr_fname'.valueOf())) {self.lex_state = 'expr_end'};
          return ['SELF', scanner.m$matched()];

        } else if ((__c = 'true'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_end';
          return ['TRUE', scanner.m$matched()];

        } else if ((__c = 'false'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_end';
          return ['FALSE', scanner.m$matched()];

        } else if ((__c = 'nil'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_end';
          return ['NIL', scanner.m$matched()];

        } else if ((__c = 'undefined'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_end';
          return ['UNDEFINED', scanner.m$matched()];

        } else if ((__c = 'null'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_end';
          return ['NULL', scanner.m$matched()];

        } else if ((__c = '__LINE__'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_end';
          return ['LINE', self.line_number.m$to_s()];

        } else if ((__c = '__FILE__'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_end';
          return ['FILE', scanner.m$matched()];

        } else if ((__c = 'begin'['m$==='](__b), __c !== false && __c !== nil)) {
          if ((__c = ['expr_dot', 'expr_fname']['m$include?'](self.lex_state), __c !== false && __c !== nil)) {
            self.lex_state = 'expr_end';
            return ['IDENTIFIER', scanner.m$matched()];
          }
          self.lex_state = 'expr_beg';
          return ['BEGIN', scanner.m$matched()];

        } else if ((__c = 'rescue'['m$==='](__b), __c !== false && __c !== nil)) {
          if ((__c = ['expr_dot', 'expr_fname']['m$include?'](self.lex_state), __c !== false && __c !== nil)) {            return ['IDENTIFIER', scanner.m$matched()];}
          if (self.lex_state.valueOf() === 'expr_beg'.valueOf()) {            return ['RESCUE', scanner.m$matched()];}
          self.lex_state = 'expr_beg';
          return ['RESCUE_MOD', scanner.m$matched()];

        } else if ((__c = 'ensure'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['ENSURE', scanner.m$matched()];

        } else if ((__c = 'case'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['CASE', scanner.m$matched()];

        } else if ((__c = 'when'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['WHEN', scanner.m$matched()];

        } else if ((__c = 'or'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['OR', scanner.m$matched()];

        } else if ((__c = 'and'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['AND', scanner.m$matched()];

        } else if ((__c = 'not'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['NOT', scanner.m$matched()];

        } else if ((__c = 'return'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_mid';
          return ['RETURN', scanner.m$matched()];

        } else if ((__c = 'next'['m$==='](__b), __c !== false && __c !== nil)) {
          if ((__c = (((__d = self.lex_state.valueOf() === 'expr_dot'.valueOf()), __d != false && __d != nil) ? __d : self.lex_state.valueOf() === 'expr_fname'.valueOf()), __c !== false && __c !== nil)) {
            self.lex_state = 'expr_end';
            return ['IDENTIFIER', scanner.m$matched()];
          }

          self.lex_state = 'expr_mid';
          return ['NEXT', scanner.m$matched()];

        } else if ((__c = 'redo'['m$==='](__b), __c !== false && __c !== nil)) {
          if ((__c = (((__d = self.lex_state.valueOf() === 'expr_dot'.valueOf()), __d != false && __d != nil) ? __d : self.lex_state.valueOf() === 'expr_fname'.valueOf()), __c !== false && __c !== nil)) {
            self.lex_state = 'expr_end';
            return ['IDENTIFIER', scanner.m$matched()];
          }

          self.lex_state = 'expr_mid';
          return ['REDO', scanner.m$matched()];

        } else if ((__c = 'break'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_mid';
          return ['BREAK', scanner.m$matched()];

        } else if ((__c = 'super'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_arg';
          return ['SUPER', scanner.m$matched()];

        } else if ((__c = 'then'['m$==='](__b), __c !== false && __c !== nil)) {
          return ['THEN', scanner.m$matched()];

        } else if ((__c = 'while'['m$==='](__b), __c !== false && __c !== nil)) {
          if (self.lex_state.valueOf() === 'expr_beg'.valueOf()) {            return ['WHILE', scanner.m$matched()];}
          self.lex_state = 'expr_beg';
          return ['WHILE_MOD', scanner.m$matched()];

        } else if ((__c = 'for'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['FOR', scanner.m$matched()];

        } else if ((__c = 'in'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_beg';
          return ['IN', scanner.m$matched()];

        } else if ((__c = 'until'['m$==='](__b), __c !== false && __c !== nil)) {
          if (self.lex_state.valueOf() === 'expr_beg'.valueOf()) {            return ['WHILE', scanner.m$matched()];}
          self.lex_state = 'expr_beg';
          return ['UNTIL_MOD', scanner.m$matched()];

        } else if ((__c = 'yield'['m$==='](__b), __c !== false && __c !== nil)) {
          self.lex_state = 'expr_arg';
          return ['YIELD', scanner.m$matched()];
        };

        matched = scanner.m$matched();
        if ((__b = (((__c = scanner.m$peek(2).valueOf() !== '::'.valueOf()), __c != false && __c != nil) ? scanner.m$scan(/\:/) : __c), __b !== false && __b !== nil)) {          return ['LABEL', matched];}

        if (self.lex_state.valueOf() === 'expr_fname'.valueOf()) {
          if ((__b = scanner.m$scan(/\=/), __b !== false && __b !== nil)) {
            self.lex_state = 'expr_end';
            return ['IDENTIFIER', matched + scanner.m$matched()];
          }
        }

        if ((__b = ['expr_beg', 'expr_dot', 'expr_mid', 'expr_arg', 'expr_cmdarg']['m$include?'](self.lex_state), __b !== false && __b !== nil)) {
          self.lex_state = 'expr_cmdarg';
        } else {
          self.lex_state = 'expr_end';
        }

        return [((__b = matched['m$=~'](/[A-Z]/), __b !== false && __b !== nil) ? 'CONSTANT' : 'IDENTIFIER'), matched];

      }
      if ((__b = scanner['m$eos?'](), __b !== false && __b !== nil)) {        return [false, false];}

      self.m$raise($cg(self, 'RubyLexingError'), ("Unexpected content in parsing stream `" + (scanner.m$peek(5)).m$to_s() + "`"));
      };
    });
    }, 0);
}, 2);
}
var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, $class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, $range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm;return $$();
});opal.lib('opal/parser', function($rb, self, __FILE__) {function $$(){





self.m$require('racc/parser.rb');


self.m$require('opal/lexer');
self.m$require('opal/nodes');

return $class(self, nil, 'Opal', function(self) { 
  return $class(self, $cg($cg(self, 'Racc'), 'Parser'), 'Parser', function(self) { var clist, racc_action_table, arr, idx, __a, __b, racc_action_check, racc_action_pointer, racc_action_default, racc_goto_table, racc_goto_check, racc_goto_pointer, racc_goto_default, racc_reduce_table, racc_reduce_n, racc_shift_n, racc_token_table, racc_nt_base, racc_use_result_var;




    clist = [
    '61,62,63,7,50,542,263,660,55,56,198,199,361,59,572,57,58,60,23,24,64', 
    '65,560,263,198,199,22,28,27,90,87,91,92,198,199,17,218,198,199,458,739', 
    '6,40,8,9,94,93,82,49,84,83,85,86,95,96,560,79,80,660,37,38,81,-58,504', 
    '660,566,509,215,-406,741,71,217,216,-81,516,-406,571,746,72,737,516', 
    '36,562,561,30,258,516,51,-270,262,742,704,32,263,516,-270,39,101,791', 
    '-66,516,-79,100,101,18,659,262,541,100,77,71,73,74,75,76,562,561,563', 
    '72,78,292,61,62,63,292,50,101,88,89,55,56,100,52,53,59,743,57,58,60', 
    '249,250,64,65,744,492,-78,-270,248,279,283,90,87,91,92,101,258,659,575', 
    '560,100,101,560,659,40,476,100,94,93,82,49,84,83,85,86,95,96,262,79', 
    '80,-417,37,38,81,-81,101,-81,515,745,-81,100,101,-83,515,576,721,100', 
    '101,475,515,732,-80,100,203,258,101,207,515,-269,51,100,101,-79,515', 
    '-79,-269,100,-79,39,562,561,558,562,561,573,504,210,-77,506,731,617', 
    '77,71,73,74,75,76,618,757,645,72,78,-81,61,62,63,560,50,101,88,89,55', 
    '56,100,52,53,59,578,57,58,60,249,250,64,65,560,-269,720,565,248,28,27', 
    '90,87,91,92,-465,292,-73,493,504,492,197,503,258,40,494,421,94,93,82', 
    '49,84,83,85,86,95,96,504,79,80,506,37,38,81,-268,562,561,567,198,199', 
    '-80,-268,-80,-79,-73,-80,-466,522,246,523,-73,-75,-76,203,562,561,207', 
    '-83,-84,51,-268,458,255,-84,300,748,419,-268,39,256,-263,-270,-466,-304', 
    '476,-251,210,-263,-270,-251,-304,77,71,73,74,75,76,373,374,617,72,78', 
    '-268,61,62,63,618,50,252,88,89,55,56,752,52,53,59,475,57,58,60,249,250', 
    '64,65,476,-463,458,-268,248,279,283,90,87,91,92,488,-71,-263,-270,-416', 
    '-304,218,489,581,40,292,-416,94,93,82,49,84,83,85,86,95,96,475,79,80', 
    '538,37,38,81,-416,384,476,771,728,386,385,-416,215,-71,-415,-406,217', 
    '216,555,-71,645,-415,-406,203,-71,556,207,-463,538,51,-79,332,331,487', 
    '877,536,246,-416,39,475,-408,761,-269,417,757,645,210,-408,-463,-269', 
    '418,77,71,73,74,75,76,762,537,-411,72,78,-416,61,62,63,-411,50,252,88', 
    '89,55,56,-406,52,53,59,763,57,58,60,23,24,64,65,645,537,523,582,22,28', 
    '27,90,87,91,92,-263,195,17,840,-269,419,-417,-263,196,40,841,580,94', 
    '93,82,49,84,83,85,86,95,96,258,79,80,-268,37,38,81,-269,723,-413,-268', 
    '-73,-412,-414,-269,-466,-413,-81,101,-412,-414,-403,101,100,767,-69', 
    '203,100,-403,207,101,-77,51,101,530,100,-263,194,100,839,530,39,531', 
    '322,464,326,324,323,325,18,198,199,772,534,77,71,73,74,75,76,-465,-268', 
    '773,72,78,-269,61,62,63,7,50,774,88,89,55,56,464,52,53,59,533,57,58', 
    '60,23,24,64,65,329,328,332,331,22,28,27,90,87,91,92,627,218,17,710,777', 
    '-465,-72,292,6,40,8,9,94,93,82,49,84,83,85,86,95,96,532,79,80,531,37', 
    '38,81,530,699,700,215,701,95,96,217,216,213,214,527,786,525,-72,-70', 
    '524,-252,377,36,-72,-78,30,218,218,51,218,706,511,218,32,508,695,530', 
    '39,692,552,792,326,324,323,325,18,607,292,607,796,77,71,73,74,75,76', 
    '258,258,690,72,78,237,61,62,63,7,50,499,88,89,55,56,498,52,53,59,607', 
    '57,58,60,23,24,64,65,329,328,332,331,22,28,27,90,87,91,92,218,218,17', 
    '103,104,105,106,107,6,40,8,9,94,93,82,49,84,83,85,86,95,96,675,79,80', 
    '686,37,38,81,258,292,215,267,812,490,217,216,213,214,103,104,105,106', 
    '107,814,484,483,482,36,-57,663,30,523,464,51,822,823,824,530,32,530', 
    '695,458,39,829,782,455,329,328,332,331,18,452,423,831,833,77,71,73,74', 
    '75,76,422,836,607,72,78,420,61,62,63,655,50,387,88,89,55,56,842,52,53', 
    '59,614,57,58,60,23,24,64,65,329,328,332,331,22,28,27,90,87,91,92,375', 
    '844,17,845,292,496,530,-466,364,40,675,853,94,93,82,49,84,83,85,86,95', 
    '96,570,79,80,619,37,38,81,607,292,607,498,286,650,285,237,237,645,530', 
    '631,871,193,873,192,191,190,189,203,632,875,207,607,625,51,329,328,332', 
    '331,623,-66,246,607,39,633,322,97,326,324,323,325,18,607,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,329,328,332,331,248,279,283,90,87,91,92,,,,,,,,,,40,782', 
    ',94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203', 
    ',,207,,,51,329,328,332,331,395,,,,39,,322,,326,324,323,325,210,,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58', 
    '60,249,250,64,65,329,328,332,331,248,279,283,90,87,91,92,,,,,,,,,,40', 
    ',,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,', 
    '203,,,207,,,51,,,,,651,,,,39,,552,,326,324,323,325,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,329,328,332,331,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93', 
    '82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,-487,-487,-487,-487,224', 
    '226,,,-487,-487,,,,,,232,233,,203,,,207,,,51,,,,,,215,,221,39,217,216', 
    '213,214,225,223,219,210,220,,,,77,71,73,74,75,76,,,,72,78,,61,62,63', 
    ',50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90', 
    '87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81', 
    '218,222,227,228,229,224,226,234,,230,231,,,,,,232,233,,203,,,207,,,51', 
    ',,,,,215,,221,39,217,216,213,214,225,223,219,210,220,,,,77,71,73,74', 
    '75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,218,222,227,228,229,224,226,234,235,230', 
    '231,,-487,-487,,,232,233,,203,,,207,,,51,,,,,,215,,221,39,217,216,213', 
    '214,225,223,219,210,220,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50', 
    ',88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92', 
    ',,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218', 
    ',,,,,,,,,,,,,,,232,233,,36,,,30,,,51,,,,,32,215,,221,39,217,216,213', 
    '214,,,219,18,220,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17', 
    ',,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,-487,-487', 
    '-487,-487,224,226,,,-487,-487,,,,,,232,233,,203,,,207,,,51,,,,,,215', 
    ',221,39,217,216,213,214,225,223,219,18,220,,,,77,71,73,74,75,76,,,,72', 
    '78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22', 
    '28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80', 
    ',37,38,81,218,222,227,228,229,224,226,234,235,230,231,,-487,-487,,,232', 
    '233,,203,,,207,,,51,,,,,,215,,221,39,217,216,213,214,225,223,219,210', 
    '220,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,', 
    ',94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,,,,,,,,,,,,,,,,232', 
    '233,,203,,,207,,,51,,,,,,215,,221,39,217,216,213,214,,,219,210,220,', 
    ',,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,', 
    '57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,-487,-487,-487,-487', 
    '224,226,,,-487,-487,,,,,,232,233,,36,,,30,,,51,,,,,32,215,,221,39,217', 
    '216,213,214,225,223,219,18,220,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,28,27', 
    '90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,218,-487,-487,-487,-487,224,226,,,-487,-487,,,,,,232,233,,203,,,207', 
    ',,51,,,,,244,215,246,221,39,217,216,213,214,225,223,219,210,220,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57', 
    '58,60,249,250,64,65,,,,,248,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82', 
    '49,84,83,85,86,95,96,,79,80,,37,38,81,218,-487,-487,-487,-487,224,226', 
    ',,-487,-487,,,,,,232,233,,203,,,207,,,51,,,,,244,215,246,221,39,217', 
    '216,213,214,225,223,219,210,220,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,252,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,28', 
    '27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37', 
    '38,81,218,-487,-487,-487,-487,224,226,,,-487,-487,,,,,,232,233,,203', 
    ',,207,,,51,,,,,244,215,246,221,39,217,216,213,214,225,223,219,210,220', 
    ',,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,252,88,89,55,56,,52,53', 
    '59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9', 
    '94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,,,,,,,,,,,,,,,,232', 
    '233,,36,,,30,,,51,,,,,32,215,,221,39,217,216,213,214,,,219,18,220,,', 
    ',77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57', 
    '58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,577,,40,,,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,222,227,228,229,224', 
    '226,234,235,230,231,,211,212,,,232,233,,203,,,207,,,51,,,,,,215,,221', 
    '39,217,216,213,214,225,223,219,210,220,,,,77,71,73,74,75,76,,,,72,78', 
    ',236,-342,-209,,,,88,89,-342,-342,-342,52,53,-342,-342,-342,552,-342', 
    '326,324,323,325,,,,,-342,-342,-342,,,,,,,,-342,-342,,-342,-342,-342', 
    '-342,-342,,,,,,,,,,,546,,,,,,,329,328,332,331,-342,-342,-342,-342,-342', 
    '-342,-342,-342,-342,-342,-342,-342,-342,-342,,,-342,-342,-342,,,-342', 
    ',258,-342,,,-342,,-342,,-342,,-342,,-342,-342,-342,-342,-342,-342,-342', 
    ',-342,-342,-342,,552,,326,324,323,325,,,,,,-342,-342,-342,-342,,-342', 
    '-276,,,,,-342,,-276,-276,-276,,,-276,-276,-276,,-276,218,,,,546,,,,', 
    '-276,-276,329,328,332,331,,232,233,-276,-276,,-276,-276,-276,-276,-276', 
    ',,,,,215,,221,,217,216,213,214,,,219,,220,,,,-276,-276,-276,-276,-276', 
    '-276,-276,-276,-276,-276,-276,-276,-276,-276,,,-276,-276,-276,,,-276', 
    ',267,-276,,,-276,,-276,,-276,,-276,,-276,-276,-276,-276,-276,-276,-276', 
    ',-276,,-276,,,,,,,,,,,,,-276,-276,-276,-276,,-276,61,62,63,7,50,-276', 
    ',,55,56,,,,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,', 
    ',,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,222,227', 
    '228,229,224,226,,,230,231,,,,,,232,233,,36,,,269,,,51,,,,,32,215,,221', 
    '39,217,216,213,214,225,223,219,18,220,,,,77,71,73,74,75,76,,,,72,78', 
    ',61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248', 
    '279,283,90,87,91,92,,,,,,,,,,280,,,94,93,82,49,84,83,85,86,95,96,,79', 
    '80,218,,,81,,,,,218,,,,,,,,232,233,,,,,,277,232,233,274,,,51,,215,,221', 
    '273,217,216,213,214,215,,,,217,216,213,214,,,,,77,71,73,74,75,76,,,', 
    '72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,', 
    ',,,248,279,283,90,87,91,92,,,,,,,,,,280,,,94,93,82,49,84,83,85,86,95', 
    '96,218,79,80,,,,81,,,,,,,,,,232,233,,,,,,,,,277,,,207,,215,51,221,,217', 
    '216,213,214,,,,,,,,,,,,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50', 
    ',88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92', 
    ',,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,', 
    ',,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74', 
    '75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250', 
    '64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85', 
    '86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,603', 
    ',246,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,252', 
    '88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,28,27,90,87,91', 
    '92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,', 
    ',,,,,,,,,,,,,,,203,,,207,,,51,,,,,300,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,', 
    '88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87', 
    '91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,', 
    ',,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,', 
    ',,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92', 
    ',,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,203,,,207,,,51,,,,,858,,246,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,577,,40,,,94,93,82', 
    '49,84,83,85,86,95,96,,79,80,,37,38,81,218,222,227,228,229,224,226,234', 
    '235,230,231,,211,212,,,232,233,,203,,,207,,,51,,,,,599,215,246,221,39', 
    '217,216,213,214,225,223,219,210,220,,,,77,71,73,74,75,76,,,,72,78,,236', 
    '-264,,,,252,88,89,-264,-264,-264,52,53,-264,-264,-264,,-264,,,,,,,,-264', 
    ',-264,-264,,,,,,,,-264,-264,,-264,-264,-264,-264,-264,,,,,,,,,,,,,,', 
    ',,,,,,,-264,-264,-264,-264,-264,-264,-264,-264,-264,-264,-264,-264,-264', 
    '-264,,,-264,-264,-264,,,-264,,,-264,,,-264,,-264,,-264,,-264,,-264,-264', 
    '-264,-264,-264,-264,-264,,-264,,-264,,,,,,,,,,,,,-264,-264,-264,-264', 
    ',-264,61,62,63,7,50,-264,,,55,56,,,,59,,57,58,60,23,24,64,65,,,,,22', 
    '28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,', 
    '79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,', 
    '18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,,40,,,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,', 
    ',207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,28,27', 
    '90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,300,,,,39,,,,,,,,210,,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57', 
    '58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93', 
    '82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207', 
    ',,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63', 
    '7,50,252,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90', 
    '87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37', 
    '38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58', 
    '60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88', 
    '89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,', 
    '17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76', 
    ',,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65', 
    ',,,,22,28,27,90,87,91,92,,,17,,,,,,,40,,,94,93,82,49,84,83,85,86,95', 
    '96,,79,80,,37,38,81,218,222,227,228,229,224,226,234,235,230,231,,211', 
    '212,,,232,233,,203,,,207,,,51,,,,,,215,,221,39,217,216,213,214,225,223', 
    '219,18,220,,,,77,71,73,74,75,76,,,,72,78,101,236,61,62,63,100,50,88', 
    '89,,55,56,52,53,,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91', 
    '92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,', 
    ',,,,,,,,,,,,,,,203,,,207,,,51,,,,,667,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,280,,,94,93,82,49,84', 
    '83,334,86,95,96,,79,80,,,,81,,,,,,,,,,,,,,,,,340,,,335,,,207,,,51,,', 
    ',,,,,,,,,,,,,,,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55', 
    '56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,', 
    ',,,,,,280,,,94,93,82,49,84,83,334,86,95,96,,79,80,,,,81,,,,,,,,,,,,', 
    ',,,,,,,335,,,207,,,51,,,,,,,,,,,,,,,,,,,,,,77,71,73,74,75,76,,,,72,78', 
    ',61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248', 
    '279,283,90,87,91,92,,,,,,,,,,280,,,94,93,82,49,84,83,85,86,95,96,,79', 
    '80,,,,81,,,,,,,,,,,,,,,,,,,,677,,,207,,,51,,,,,,,,,,,,,,,,,,,,,,77,71', 
    '73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,855,,246,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63', 
    ',50,252,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,28,27', 
    '90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,300,,,,39,,,,,,,,210,,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,7,50,252,88,89,55,56,,52,53,59,,57', 
    '58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93', 
    '82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30', 
    ',,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63', 
    ',50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87', 
    '91,92,,,17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81', 
    ',,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,218,222,227,228,229,224,226,234,235,230', 
    '231,,211,212,,,232,233,,203,,-209,207,,,51,,,,,,215,,221,39,217,216', 
    '213,214,225,223,219,210,220,,,,77,71,73,74,75,76,,,,72,78,,236,-403', 
    '-209,,,,88,89,-403,-403,-403,52,53,-403,-403,-403,,-403,,,,,,,,-403', 
    ',-403,-403,,,,,,,,-403,-403,,-403,-403,-403,-403,-403,,,,,,,,,,,,,,', 
    ',,,,,,,-403,-403,-403,-403,-403,-403,-403,-403,-403,-403,-403,-403,-403', 
    '-403,,,-403,-403,-403,,-403,-403,,,-403,,,-403,,-403,,-403,,-403,,-403', 
    '-403,-403,-403,-403,-403,-403,,-403,,-403,,,,,,,,,,,,,-403,-403,-403', 
    '-403,,-403,-406,,,-403,,-403,,-406,-406,-406,,,-406,-406,-406,,-406', 
    ',,,,,,,-406,,-406,-406,,,,,,,,-406,-406,,-406,-406,-406,-406,-406,,', 
    ',,,,,,,,,,,,,,,,,,,-406,-406,-406,-406,-406,-406,-406,-406,-406,-406', 
    '-406,-406,-406,-406,,,-406,-406,-406,,-406,-406,,,-406,,,-406,,-406', 
    ',-406,,-406,,-406,-406,-406,-406,-406,-406,-406,,-406,,-406,,,,,,,,', 
    ',,,,-406,-406,-406,-406,,-406,,,,-406,,-406,61,62,63,7,50,,,,55,56,', 
    ',,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8', 
    '9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,', 
    '36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,', 
    '61,62,63,7,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28', 
    '27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79', 
    '80,,37,38,81,218,222,227,228,229,224,226,234,235,230,231,,211,212,,', 
    '232,233,,36,,,30,,,51,,,,,32,215,,221,39,217,216,213,214,225,223,219', 
    '18,220,,,,77,71,73,74,75,76,,,,72,78,292,236,61,62,63,377,50,88,89,', 
    '55,56,52,53,,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17', 
    ',,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,', 
    ',,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,', 
    ',,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,', 
    ',,,22,28,27,90,87,91,92,,,17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,', 
    ',18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,,40,,,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,', 
    ',207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90', 
    '87,91,92,,,17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71', 
    '73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,,57,58,60', 
    '23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,', 
    ',,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,', 
    '88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87', 
    '91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,', 
    ',,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,709', 
    ',,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,,,', 
    ',,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,', 
    ',,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,', 
    ',72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,', 
    ',,22,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,', 
    '79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,', 
    '210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9', 
    '94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36', 
    ',,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61', 
    '62,63,7,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27', 
    '90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80', 
    ',37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,', 
    ',77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57', 
    '58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,395,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50', 
    ',88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92', 
    ',,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,203,,,207,,,51,,,,,395,,,,39,,,,,,,,210,,,,,77,71,73,74', 
    '75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24', 
    '64,65,,,,,22,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86', 
    '95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39', 
    ',,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56', 
    ',52,53,59,,57,58,60,249,250,64,65,,,,,248,28,27,90,87,91,92,,,,,,,,', 
    ',40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,', 
    ',,,,203,,,207,,,51,,,,,300,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,', 
    ',72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65', 
    ',,,,22,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,', 
    ',210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,', 
    ',94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203', 
    ',,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61', 
    '62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27', 
    '90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71', 
    '73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60', 
    '23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,,40,,,94,93,82,49,84', 
    '83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,', 
    ',,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88', 
    '89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,', 
    '17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,222', 
    '227,228,229,224,226,234,235,230,231,,211,212,,,232,233,,203,,,207,,', 
    '51,,,,,,215,,221,39,217,216,213,214,225,223,219,18,220,,,,77,71,73,74', 
    '75,76,,,,72,78,,236,-469,607,,,,88,89,-469,-469,-469,52,53,-469,-469', 
    '-469,,-469,,,,,,,,,-469,-469,-469,,,,,,,,-469,-469,,-469,-469,-469,-469', 
    '-469,,,,,,,,,,,,,,,,,,,,,,-469,-469,-469,-469,-469,-469,-469,-469,-469', 
    '-469,-469,-469,-469,-469,,,-469,-469,-469,,722,-469,,,-469,,,-469,,-469', 
    ',-469,,-469,,-469,-469,-469,-469,-469,-469,-469,,-469,-469,-469,,,,', 
    ',,,,,,,,-469,-469,-469,-469,,-469,61,62,63,-80,50,-469,,,55,56,,,,59', 
    ',57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,', 
    ',207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,7,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90', 
    '87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37', 
    '38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58', 
    '60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82', 
    '49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,', 
    ',51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,', 
    '50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90', 
    '87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81', 
    ',,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,', 
    ',,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17', 
    ',,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76', 
    ',,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65', 
    ',,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95', 
    '96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,', 
    ',,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52', 
    '53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40', 
    ',,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,', 
    '203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78', 
    ',61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248', 
    '279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79', 
    '80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210', 
    ',,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59', 
    ',57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,', 
    ',207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283', 
    '90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71', 
    '73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,', 
    '88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87', 
    '91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,', 
    ',,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,', 
    ',,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92', 
    ',,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75', 
    '76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64', 
    '65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86', 
    '95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39', 
    ',,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56', 
    ',52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,', 
    ',,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,', 
    ',,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,', 
    '72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,', 
    ',,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95', 
    '96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,', 
    ',,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52', 
    '53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40', 
    ',,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,', 
    '203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78', 
    ',61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248', 
    '279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79', 
    '80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210', 
    ',,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59', 
    ',57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,', 
    ',207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283', 
    '90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71', 
    '73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50', 
    ',88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92', 
    ',,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,', 
    ',,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74', 
    '75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250', 
    '64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85', 
    '86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,', 
    '39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55', 
    '56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,', 
    ',,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,', 
    ',,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76', 
    ',,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65', 
    ',,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95', 
    '96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,', 
    ',,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52', 
    '53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40', 
    ',,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,', 
    '203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78', 
    ',61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248', 
    '279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79', 
    '80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210', 
    ',,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59', 
    ',57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94', 
    '93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,', 
    ',207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283', 
    '90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71', 
    '73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,', 
    '88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87', 
    '91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,', 
    ',,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,', 
    ',,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92', 
    ',,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75', 
    '76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64', 
    '65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86', 
    '95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39', 
    ',,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56', 
    ',52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,', 
    ',,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,', 
    ',,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,', 
    '72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,', 
    ',,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95', 
    '96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,', 
    ',,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,', 
    '52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6', 
    '40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,', 
    ',,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72', 
    '78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,', 
    '248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,', 
    ',210,,,,-268,77,71,73,74,75,76,-268,-268,-268,72,78,-268,-268,-268,', 
    '-268,,,88,89,,,,52,53,-268,-268,,,,,,,,-268,-268,,-268,-268,-268,-268', 
    '-268,,,,,,,,,,,,,,,,,,,,,,-268,-268,-268,-268,-268,-268,-268,-268,-268', 
    '-268,-268,-268,-268,-268,,,-268,-268,-268,,590,-268,,,-268,,,-268,,-268', 
    ',-268,,-268,,-268,-268,-268,-268,-268,-268,-268,,-268,,-268,,,,,,,,', 
    ',,,,-268,-268,-268,-268,,-268,61,62,63,-82,50,-268,,,55,56,,,,59,,57', 
    '58,60,249,250,64,65,,,,,248,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82', 
    '49,84,83,85,86,95,96,,79,80,,37,38,81,218,222,227,228,229,224,226,234', 
    '235,230,231,,211,212,,,232,233,,203,,,207,,,51,,,,,300,215,,221,39,217', 
    '216,213,214,225,223,219,210,220,,,,77,71,73,74,75,76,,,,72,78,,236,-471', 
    ',,,252,88,89,-471,-471,-471,52,53,-471,-471,-471,,-471,,,,,,,,-471,-471', 
    '-471,-471,,,,,,,,-471,-471,,-471,-471,-471,-471,-471,,,,,,,,,,,,,,,', 
    ',,,,,,-471,-471,-471,-471,-471,-471,-471,-471,-471,-471,-471,-471,-471', 
    '-471,,,-471,-471,-471,,,-471,,,-471,,,-471,,-471,,-471,,-471,,-471,-471', 
    '-471,-471,-471,-471,-471,,-471,-471,-471,,,,,,,,,,,,,-471,-471,-471', 
    '-471,,-471,61,62,63,,50,-471,,,55,56,,,,59,,57,58,60,249,250,64,65,', 
    ',,,248,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,244,,246,,39', 
    ',,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55', 
    '56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,28,27,90,87,91,92,,,,,', 
    ',,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,222,227', 
    '228,229,224,226,234,235,230,231,,211,212,,,232,233,,203,,,207,,,473', 
    ',,,,244,215,246,221,39,217,216,213,214,225,223,219,210,220,,,,77,71', 
    '73,74,75,76,,,,72,78,,236,-470,,,,252,88,89,-470,-470,-470,52,53,-470', 
    '-470,-470,,-470,,,,,,,,-470,-470,-470,-470,,,,,,,,-470,-470,,-470,-470', 
    '-470,-470,-470,,,,,,,,,,,,,,,,,,,,,,-470,-470,-470,-470,-470,-470,-470', 
    '-470,-470,-470,-470,-470,-470,-470,,,-470,-470,-470,,,-470,,,-470,,', 
    '-470,,-470,,-470,,-470,,-470,-470,-470,-470,-470,-470,-470,,-470,-470', 
    '-470,,,,,,,,,,,,-268,-470,-470,-470,-470,,-470,-268,-268,-268,,,-470', 
    '-268,-268,,-268,,,,,,,,,,,,,,,,,,,-268,-268,,-268,-268,-268,-268,-268', 
    ',,,,,,,,,,,,,,,,,,,,,-268,-268,-268,-268,-268,-268,-268,-268,-268,-268', 
    '-268,-268,-268,-268,,,-268,-268,-268,,590,,,,-268,,,,,,,-268,,-268,', 
    '-268,-268,-268,-268,-268,-268,-268,,-268,,-268,,,,,,,,,,,,,-268,-268', 
    ',-74,,-268,61,62,63,-82,50,-268,,,55,56,,,,59,,57,58,60,249,250,64,65', 
    ',,,,248,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,480,51,,,,,244,,246,', 
    '39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,252,88,89', 
    '55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17', 
    ',,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76', 
    ',,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65', 
    ',,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86', 
    '95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,269,,,51,,,,,32,,,,39', 
    ',,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56', 
    ',52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,', 
    ',,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,', 
    ',,,,,,203,,,207,,,51,,,,,817,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76', 
    ',,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65', 
    ',,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86', 
    '95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39', 
    ',,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56', 
    ',52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6', 
    '40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,', 
    ',,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72', 
    '78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,', 
    '248,279,283,90,87,91,92,,,,,,,,,,280,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,,,81,,,,,,,,,,,,,,,,,,,,277,,,207,,,51,,,,,,,,,,,,,,,,,,,,,', 
    '77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,,57', 
    '58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93', 
    '82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,222,227,228,229,224,226', 
    '234,235,230,231,,211,212,,,232,233,,36,,,269,,,51,,,,,32,215,,221,39', 
    '217,216,213,214,225,223,219,18,220,,,,77,71,73,74,75,76,,,,72,78,,236', 
    '-469,,,,,88,89,-469,-469,-469,52,53,,-469,-469,,-469,,,,,,,,,-469,,', 
    ',,,,,,,-469,-469,,-469,-469,-469,-469,-469,,,,,,,,,,,,,,,,,,,,,,-469', 
    '-469,-469,-469,-469,-469,-469,-469,-469,-469,-469,-469,-469,-469,,,-469', 
    '-469,-469,,587,,,,-469,,,,,,,-469,,-469,,-469,-469,-469,-469,-469,-469', 
    '-469,,-469,-469,-469,,,,,,,,,,,,,-469,-469,,-72,,-469,-485,,,-80,,-469', 
    ',-485,-485,-485,,,-485,-485,-485,,-485,,,,,,,,,-485,-485,-485,,,,,,', 
    ',-485,-485,,-485,-485,-485,-485,-485,,,,,,,,,,,,,,,,,,,,,,-485,-485', 
    '-485,-485,-485,-485,-485,-485,-485,-485,-485,-485,-485,-485,,,-485,-485', 
    '-485,,,-485,,258,-485,,,-485,,-485,,-485,,-485,,-485,-485,-485,-485', 
    '-485,-485,-485,,-485,-485,-485,,,,,,,,,,,,,-485,-485,-485,-485,,-485', 
    '61,62,63,,50,-485,,,55,56,,,,59,,57,58,60,23,24,64,65,,,,,22,28,27,90', 
    '87,91,92,,,17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38', 
    '81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71', 
    '73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60', 
    '249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50', 
    ',88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92', 
    ',,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,', 
    ',,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74', 
    '75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250', 
    '64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,280,,,94,93,82,49,84,83,85', 
    '86,95,96,,79,80,,,,81,,,,,,,,,,,,,,,,,,,,808,,,207,,,51,,,,,,,,,,,,', 
    ',,,,,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,', 
    ',94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203', 
    ',,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61', 
    '62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279', 
    '283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,', 
    '37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,', 
    ',77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,,57', 
    '58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93', 
    '82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30', 
    ',,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63', 
    ',50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90', 
    '87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81', 
    ',,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,,57,58,60,23', 
    '24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84', 
    '83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,,,,', 
    '32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88', 
    '89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91', 
    '92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,', 
    ',,,,,,,,,,,,,,,203,,,207,496,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,802', 
    ',246,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,252', 
    '88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87', 
    '91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,', 
    ',,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,800,,246,,39,,,,,,,,210,,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53,59,,57', 
    '58,60,249,250,64,65,,,,,248,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82', 
    '49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,', 
    ',51,,,,,599,,246,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62', 
    '63,,50,252,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279', 
    '283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,', 
    '37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,794,,246,,39,,,,,,,,210', 
    ',,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,252,88,89,55,56,,52,53', 
    '59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,', 
    ',94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203', 
    ',,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61', 
    '62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279', 
    '283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,', 
    '37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,', 
    ',77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57', 
    '58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93', 
    '82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207', 
    ',,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63', 
    ',50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90', 
    '87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81', 
    ',,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,', 
    ',,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17', 
    ',,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,', 
    ',,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,', 
    ',,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65', 
    ',,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95', 
    '96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,', 
    ',,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,', 
    '52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6', 
    '40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,', 
    ',,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72', 
    '78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249,250,64,65,,,,', 
    '248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,', 
    ',210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,', 
    ',94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203', 
    ',,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61', 
    '62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27', 
    '90,87,91,92,,,17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37', 
    '38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77', 
    '71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58', 
    '60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,,40,,,94,93,82,49', 
    '84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51', 
    ',,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88', 
    '89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,', 
    '17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,', 
    ',,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76', 
    ',,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65', 
    ',,,,22,28,27,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96', 
    ',79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,', 
    ',210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53', 
    '59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,', 
    ',94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203', 
    ',,207,,,51,,,,,,,,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61', 
    '62,63,7,50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27', 
    '90,87,91,92,,,17,,,,,,6,40,8,9,94,93,82,49,84,83,85,86,95,96,,79,80', 
    ',37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30,,,51,,,,,32,,,,39,,,,,,,,18,,,', 
    ',77,71,73,74,75,76,,,,72,78,,61,62,63,7,50,,88,89,55,56,,52,53,59,,57', 
    '58,60,23,24,64,65,,,,,22,28,27,90,87,91,92,,,17,,,,,,6,40,8,9,94,93', 
    '82,49,84,83,85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,36,,,30', 
    ',,51,,,,,32,,,,39,,,,,,,,18,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63', 
    ',50,,88,89,55,56,,52,53,59,,57,58,60,23,24,64,65,,,,,22,28,27,90,87', 
    '91,92,,,17,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81', 
    ',,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,,,,,39,,,,,,,,18,,,,,77,71,73', 
    '74,75,76,,,,72,78,,61,62,63,,50,,88,89,55,56,,52,53,59,,57,58,60,249', 
    '250,64,65,,,,,248,279,283,90,87,91,92,,,,,,,,,,40,,,94,93,82,49,84,83', 
    '85,86,95,96,,79,80,,37,38,81,,,,,,,,,,,,,,,,,,,,203,,,207,,,51,,,,,', 
    ',,,39,,,,,,,,210,,,,,77,71,73,74,75,76,,,,72,78,,61,62,63,,50,,88,89', 
    '55,56,,52,53,59,,57,58,60,249,250,64,65,,,,,248,279,283,90,87,91,92', 
    ',,,,,,,,,40,,,94,93,82,49,84,83,85,86,95,96,,79,80,,37,38,81,218,222', 
    '227,228,229,224,226,234,235,230,231,,211,212,,,232,233,,203,,,207,,', 
    '51,,,,,,215,,221,39,217,216,213,214,225,223,219,210,220,,,,77,71,73', 
    '74,75,76,,,,72,78,,236,597,,,,,88,89,,,,52,53,154,165,155,178,151,171', 
    '161,160,,,176,159,158,153,179,,,163,152,166,170,172,164,157,,,173,180', 
    '175,349,348,350,347,150,169,168,181,182,183,184,185,149,156,147,148', 
    '345,346,343,112,84,83,344,86,,,,,,,138,139,,136,120,121,122,144,125', 
    '127,,,123,,,,,140,141,128,129,,,,,,354,,,,,,,133,132,,119,137,135,134', 
    '130,131,126,124,117,143,118,-485,,142,,,,,-485,-485,-485,,-485,-485', 
    '-485,-485,,-485,,-485,-485,-485,88,89,-485,-485,-485,-485,-485,,,,,', 
    ',,-485,-485,-485,-485,-485,-485,-485,-485,,,,-485,-485,,-485,-485,-485', 
    '-485,-485,,,,,,,,,,,,,,,,,,,,,,-485,,,,,,,-485,,,,-485,258,-485,,,,', 
    '-485,,,,,258,-485,,,,,,,,,,-485,,,,,,,,,,,-485,,-485,,-485,,,-485,,', 
    ',,,-485,,-485,,,-485,154,165,155,178,151,171,161,160,,,176,159,158,153', 
    '179,,,163,152,166,170,172,164,157,,,173,180,175,174,167,177,162,150', 
    '169,168,181,182,183,184,185,149,156,147,148,145,146,110,112,109,,111', 
    ',,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128,129', 
    ',,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124,117,143,118,,,142', 
    '186,154,165,155,178,151,171,161,160,,78,176,159,158,153,179,,,163,152', 
    '166,170,172,164,157,,,173,180,175,174,167,177,162,150,169,168,181,182', 
    '183,184,185,149,156,147,148,145,146,110,112,,,111,,,,,,,,138,139,,136', 
    '120,121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132', 
    ',119,137,135,134,130,131,126,124,117,143,118,,,142,186,154,165,155,178', 
    '151,171,161,160,,78,176,159,158,153,179,,,163,152,166,170,172,164,157', 
    ',,173,180,175,174,167,177,162,150,169,168,181,182,183,184,185,149,156', 
    '147,148,145,146,110,112,,,111,,,,,,,,138,139,,136,120,121,122,144,125', 
    '127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134,130', 
    '131,126,124,117,143,118,,,142,186,154,165,155,178,151,171,161,160,,78', 
    '176,159,158,153,179,,,163,152,166,170,172,164,157,,,173,180,175,174', 
    '167,177,162,150,169,168,181,182,183,184,185,149,156,147,148,145,146', 
    '110,112,,,111,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,', 
    '140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124', 
    '117,143,118,,,142,186,154,165,155,178,151,171,161,160,,78,176,159,158', 
    '153,179,,,163,152,166,170,172,164,157,,,173,180,175,174,167,177,162', 
    '150,169,168,181,182,183,184,185,149,156,147,148,145,146,110,112,371', 
    '370,111,372,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,,140', 
    '141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124,117', 
    '143,118,,,142,154,165,155,178,151,171,161,160,,,176,159,158,153,179', 
    ',,163,152,166,170,172,164,157,,,173,180,175,174,167,177,162,150,169', 
    '168,181,182,183,184,185,149,156,147,148,145,146,110,112,371,370,111', 
    '372,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128', 
    '129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124,117,143,118', 
    ',,142,154,165,155,178,151,171,161,160,,,176,159,158,153,179,,,163,152', 
    '166,170,172,164,157,,,173,180,175,174,167,177,162,150,169,168,181,182', 
    '183,184,185,149,156,147,148,145,146,110,112,,,111,,,,,,,,138,139,,136', 
    '120,121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132', 
    ',119,137,135,134,130,131,126,124,117,143,118,864,411,142,,865,,,,,,', 
    ',138,139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128,129,,,,', 
    ',,,,,,,,133,132,,119,137,135,134,130,131,126,124,117,143,118,680,411', 
    '142,,678,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,,140,141', 
    '128,129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124,117,143', 
    '118,461,405,142,,462,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123', 
    ',,,,140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126', 
    '124,117,143,118,461,405,142,,462,,,,,,,,138,139,,136,120,121,122,144', 
    '125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134', 
    '130,131,126,124,117,143,118,461,405,142,,462,,,,,,,,138,139,,136,120', 
    '121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132,,119', 
    '137,135,134,130,131,126,124,117,143,118,591,405,142,,592,,,,,,,,138', 
    '139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,', 
    ',,,133,132,,119,137,135,134,130,131,126,124,117,143,118,680,411,142', 
    ',821,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128', 
    '129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124,117,143,118', 
    '593,411,142,,594,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,', 
    ',,,140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126', 
    '124,117,143,118,591,405,142,,592,,,,,,,,138,139,,136,120,121,122,144', 
    '125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134', 
    '130,131,126,124,117,143,118,593,411,142,,594,,,,,,,,138,139,,136,120', 
    '121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132,,119', 
    '137,135,134,130,131,126,124,117,143,118,461,405,142,,462,,,,,,,,138', 
    '139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,', 
    ',,,133,132,,119,137,135,134,130,131,126,124,117,143,118,461,405,142', 
    ',462,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128', 
    '129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124,117,143,118', 
    '635,405,142,,636,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,', 
    ',,,140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126', 
    '124,117,143,118,862,405,142,,863,,,,,,,,138,139,,136,120,121,122,144', 
    '125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132,,119,137,135,134', 
    '130,131,126,124,117,143,118,638,411,142,,639,,,,,,,,138,139,,136,120', 
    '121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,,,,,133,132,,119', 
    '137,135,134,130,131,126,124,117,143,118,407,411,142,,409,,,,,,,,138', 
    '139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128,129,,,,,,,,,', 
    ',,,133,132,,119,137,135,134,130,131,126,124,117,143,118,402,405,142', 
    ',403,,,,,,,,138,139,,136,120,121,122,144,125,127,,,123,,,,,140,141,128', 
    '129,,,,,,,,,,,,,133,132,,119,137,135,134,130,131,126,124,117,143,118', 
    ',,142,218,222,227,228,229,224,226,234,235,230,231,,211,212,,,232,233', 
    ',,,,,,,,,,,,,215,,221,,217,216,213,214,225,223,219,,220,218,222,227', 
    '228,229,224,226,234,235,230,231,,211,212,,236,232,233,,,,,,,,,,,,,,215', 
    ',221,,217,216,213,214,225,223,219,,220,218,222,227,228,229,224,226,234', 
    '235,230,231,,211,212,,236,232,233,,,,,,,,,,,,,,215,,221,,217,216,213', 
    '214,225,223,219,,220,218,222,227,228,229,224,226,234,235,230,231,,211', 
    '212,,236,232,233,,,,,,,,,,,,,,215,,221,,217,216,213,214,225,223,219', 
    ',220,218,222,227,228,229,224,226,234,235,230,231,,211,212,,236,232,233', 
    ',,,,,,,,,,,,,215,,221,,217,216,213,214,225,223,219,,220,218,222,227', 
    '228,229,224,226,234,235,230,231,,211,212,,236,232,233,,,,,,,,,,,,,,215', 
    ',221,,217,216,213,214,225,223,219,,220,218,222,227,228,229,224,226,234', 
    '235,230,231,,211,212,292,236,232,233,,,,,,,,,,,,,,215,,221,,217,216', 
    '213,214,225,223,219,,220,218,222,227,228,229,224,226,234,235,230,231', 
    ',211,212,,236,232,233,,,,,,,,,,,,,,215,,221,,217,216,213,214,225,223', 
    '219,,220,218,222,227,228,229,224,226,234,235,230,231,,211,212,,236,232', 
    '233,,,,,,,,,,,,,,215,,221,,217,216,213,214,225,223,219,,220,218,222', 
    '227,228,229,224,226,234,235,230,231,,211,212,,236,232,233,,,,,,,,,,', 
    ',,,215,,221,,217,216,213,214,225,223,219,,220,,,,,,,,,,,,,,,,236'];
    racc_action_table = arr = $cg(self, 'Array').m$new(23133, nil);
    idx = 0;
    (__a = clist, $B.f = __a.m$each, ($B.p =function(str) { var self = this; var __a, __b;
      return (__a = str.m$split(',', -1), $B.f = __a.m$each, ($B.p =function(i) { var self = this; var __a;
        if(!((__a = i['m$empty?'](), __a !== false && __a !== nil))) {arr['m$[]='](idx, i.m$to_i())};
        return idx = idx['m$+'](1);
      }).$self=self, $B.f).call(__a);
    }).$self=self, $B.f).call(__a);

    clist = [
    '0,0,0,0,0,339,54,519,0,0,543,543,75,0,365,0,0,0,0,0,0,0,568,26,642,642', 
    '0,0,0,0,0,0,0,557,557,0,426,295,295,621,622,0,0,0,0,0,0,0,0,0,0,0,0', 
    '0,0,358,0,0,766,0,0,0,632,302,518,361,302,426,344,626,69,426,426,863', 
    '751,344,365,642,69,621,309,0,568,568,0,26,666,0,745,54,628,568,0,281', 
    '308,745,0,543,723,632,813,862,543,519,0,519,26,339,519,0,0,0,0,0,0,358', 
    '358,358,0,0,557,877,877,877,295,877,339,0,0,877,877,339,0,0,877,629', 
    '877,877,877,877,877,877,877,630,420,723,745,877,877,877,877,877,877', 
    '877,766,281,766,388,356,766,518,367,518,877,262,518,877,877,877,877', 
    '877,877,877,877,877,877,281,877,877,202,877,877,877,863,751,863,751', 
    '634,863,751,309,420,309,389,592,309,666,262,666,616,864,666,877,637', 
    '308,877,308,534,877,308,813,862,813,862,534,813,862,877,356,356,356', 
    '367,367,367,305,877,202,305,615,468,877,877,877,877,877,877,468,866', 
    '866,877,877,592,487,487,487,362,487,3,877,877,487,487,3,877,877,487', 
    '394,487,487,487,487,487,487,487,360,534,591,360,487,487,487,487,487', 
    '487,487,864,468,636,287,298,286,14,298,640,487,287,204,487,487,487,487', 
    '487,487,487,487,487,487,299,487,487,299,487,487,487,865,362,362,362', 
    '307,307,864,865,864,591,636,864,865,313,607,313,636,286,14,487,360,360', 
    '487,286,14,487,639,605,25,204,487,643,287,639,487,25,278,873,639,41', 
    '450,397,487,278,873,646,41,487,487,487,487,487,487,81,81,735,487,487', 
    '865,871,871,871,735,871,487,487,487,871,871,647,487,487,871,450,871', 
    '871,871,871,871,871,871,263,334,602,639,871,871,871,871,871,871,871', 
    '276,635,278,873,275,41,427,276,402,871,735,275,871,871,871,871,871,871', 
    '871,871,871,871,263,871,871,676,871,871,871,806,109,464,676,600,109', 
    '109,806,427,635,345,334,427,427,352,635,656,345,334,871,402,352,871', 
    '334,337,871,402,530,530,276,871,337,871,275,871,464,348,662,842,201', 
    '654,654,871,348,334,842,201,871,871,871,871,871,871,664,676,349,871', 
    '871,806,496,496,496,349,496,871,871,871,496,496,334,871,871,496,665', 
    '496,496,496,496,496,496,496,818,337,818,403,496,496,496,496,496,496', 
    '496,809,13,496,807,842,201,35,809,13,496,807,401,496,496,496,496,496', 
    '496,496,496,496,496,408,496,496,678,496,496,496,490,595,347,678,403', 
    '350,346,490,678,347,403,547,350,346,343,683,547,669,35,496,683,343,496', 
    '312,35,496,542,670,312,809,13,542,807,673,496,675,475,588,475,475,475', 
    '475,496,15,15,677,335,496,496,496,496,496,496,680,678,681,496,496,490', 
    '478,478,478,478,478,682,496,496,478,478,583,496,496,478,333,478,478', 
    '478,478,478,478,478,475,475,475,475,478,478,478,478,478,478,478,475', 
    '445,478,580,687,638,638,688,478,478,478,478,478,478,478,478,478,478', 
    '478,478,478,478,330,478,478,322,478,478,478,319,561,561,445,561,561', 
    '561,445,445,445,445,318,697,317,638,580,315,708,314,478,638,580,478', 
    '428,429,478,430,572,303,431,478,301,552,550,478,549,546,725,546,546', 
    '546,546,478,726,297,729,730,478,478,478,478,478,478,733,734,548,478', 
    '478,736,477,477,477,477,477,294,478,478,477,477,293,478,478,477,740', 
    '477,477,477,477,477,477,477,546,546,546,546,477,477,477,477,477,477', 
    '477,446,289,477,5,5,5,5,5,477,477,477,477,477,477,477,477,477,477,477', 
    '477,477,477,527,477,477,544,477,477,477,283,280,446,279,755,277,446', 
    '446,446,446,376,376,376,376,376,758,272,271,270,477,268,521,477,520', 
    '257,477,776,778,779,780,477,781,782,247,477,787,824,243,527,527,527', 
    '527,477,242,206,797,798,477,477,477,477,477,477,205,801,456,477,477', 
    '203,473,473,473,514,473,187,477,477,473,473,808,477,477,473,466,473', 
    '473,473,473,473,473,473,824,824,824,824,473,473,473,473,473,473,473', 
    '97,815,473,816,467,491,820,821,76,473,767,828,473,473,473,473,473,473', 
    '473,473,473,473,364,473,473,469,473,473,473,834,40,837,838,36,500,34', 
    '470,20,497,852,479,856,12,861,11,10,9,8,473,481,867,473,869,473,473', 
    '767,767,767,767,473,482,473,872,473,486,525,1,525,525,525,525,473,879', 
    ',,,473,473,473,473,473,473,,,,473,473,,498,498,498,,498,473,473,473', 
    '498,498,,473,473,498,,498,498,498,498,498,498,498,525,525,525,525,498', 
    '498,498,498,498,498,498,,,,,,,,,,498,692,,498,498,498,498,498,498,498', 
    '498,498,498,,498,498,,498,498,498,,,,,,,,,,,,,,,,,,,,498,,,498,,,498', 
    '692,692,692,692,498,,,,498,,60,,60,60,60,60,498,,,,,498,498,498,498', 
    '498,498,,,,498,498,,503,503,503,,503,,498,498,503,503,,498,498,503,', 
    '503,503,503,503,503,503,503,60,60,60,60,503,503,503,503,503,503,503', 
    ',,,,,,,,,503,,,503,503,503,503,503,503,503,503,503,503,,503,503,,503', 
    '503,503,,,,,,,,,,,,,,,,,,,,503,,,503,,,503,,,,,503,,,,503,,690,,690', 
    '690,690,690,503,,,,,503,503,503,503,503,503,,,,503,503,,858,858,858', 
    ',858,,503,503,858,858,,503,503,858,,858,858,858,858,858,858,858,690', 
    '690,690,690,858,858,858,858,858,858,858,,,,,,,,,,858,,,858,858,858,858', 
    '858,858,858,858,858,858,,858,858,,858,858,858,444,444,444,444,444,444', 
    '444,,,444,444,,,,,,444,444,,858,,,858,,,858,,,,,,444,,444,858,444,444', 
    '444,444,444,444,444,858,444,,,,858,858,858,858,858,858,,,,858,858,,506', 
    '506,506,,506,,858,858,506,506,,858,858,506,,506,506,506,506,506,506', 
    '506,,,,,506,506,506,506,506,506,506,,,,,,,,,,506,,,506,506,506,506,506', 
    '506,506,506,506,506,,506,506,,506,506,506,448,448,448,448,448,448,448', 
    '448,,448,448,,,,,,448,448,,506,,,506,,,506,,,,,,448,,448,506,448,448', 
    '448,448,448,448,448,506,448,,,,506,506,506,506,506,506,,,,506,506,,855', 
    '855,855,,855,506,506,506,855,855,,506,506,855,,855,855,855,855,855,855', 
    '855,,,,,855,855,855,855,855,855,855,,,,,,,,,,855,,,855,855,855,855,855', 
    '855,855,855,855,855,,855,855,,855,855,855,425,425,425,425,425,425,425', 
    '425,425,425,425,,425,425,,,425,425,,855,,,855,,,855,,,,,,425,,425,855', 
    '425,425,425,425,425,425,425,855,425,,,,855,855,855,855,855,855,,,,855', 
    '855,,850,850,850,850,850,,855,855,850,850,,855,855,850,,850,850,850', 
    '850,850,850,850,,,,,850,850,850,850,850,850,850,,,850,,,,,,850,850,850', 
    '850,850,850,850,850,850,850,850,850,850,850,,850,850,,850,850,850,437', 
    ',,,,,,,,,,,,,,,437,437,,850,,,850,,,850,,,,,850,437,,437,850,437,437', 
    '437,437,,,437,850,437,,,,850,850,850,850,850,850,,,,850,850,,17,17,17', 
    ',17,,850,850,17,17,,850,850,17,,17,17,17,17,17,17,17,,,,,17,17,17,17', 
    '17,17,17,,,17,,,,,,,17,,,17,17,17,17,17,17,17,17,17,17,,17,17,,17,17', 
    '17,435,435,435,435,435,435,435,,,435,435,,,,,,435,435,,17,,,17,,,17', 
    ',,,,,435,,435,17,435,435,435,435,435,435,435,17,435,,,,17,17,17,17,17', 
    '17,,,,17,17,,18,18,18,,18,,17,17,18,18,,17,17,18,,18,18,18,18,18,18', 
    '18,,,,,18,18,18,18,18,18,18,,,,,,,,,,18,,,18,18,18,18,18,18,18,18,18', 
    '18,,18,18,,18,18,18,424,424,424,424,424,424,424,424,424,424,424,,424', 
    '424,,,424,424,,18,,,18,,,18,,,,,,424,,424,18,424,424,424,424,424,424', 
    '424,18,424,,,,18,18,18,18,18,18,,,,18,18,,509,509,509,,509,,18,18,509', 
    '509,,18,18,509,,509,509,509,509,509,509,509,,,,,509,509,509,509,509', 
    '509,509,,,,,,,,,,509,,,509,509,509,509,509,509,509,509,509,509,,509', 
    '509,,509,509,509,436,,,,,,,,,,,,,,,,436,436,,509,,,509,,,509,,,,,,436', 
    ',436,509,436,436,436,436,,,436,509,436,,,,509,509,509,509,509,509,,', 
    ',509,509,,843,843,843,843,843,,509,509,843,843,,509,509,843,,843,843', 
    '843,843,843,843,843,,,,,843,843,843,843,843,843,843,,,843,,,,,,843,843', 
    '843,843,843,843,843,843,843,843,843,843,843,843,,843,843,,843,843,843', 
    '443,443,443,443,443,443,443,,,443,443,,,,,,443,443,,843,,,843,,,843', 
    ',,,,843,443,,443,843,443,443,443,443,443,443,443,843,443,,,,843,843', 
    '843,843,843,843,,,,843,843,,22,22,22,,22,,843,843,22,22,,843,843,22', 
    ',22,22,22,22,22,22,22,,,,,22,22,22,22,22,22,22,,,,,,,,,,22,,,22,22,22', 
    '22,22,22,22,22,22,22,,22,22,,22,22,22,442,442,442,442,442,442,442,,', 
    '442,442,,,,,,442,442,,22,,,22,,,22,,,,,22,442,22,442,22,442,442,442', 
    '442,442,442,442,22,442,,,,22,22,22,22,22,22,,,,22,22,,23,23,23,,23,22', 
    '22,22,23,23,,22,22,23,,23,23,23,23,23,23,23,,,,,23,23,23,23,23,23,23', 
    ',,,,,,,,,23,,,23,23,23,23,23,23,23,23,23,23,,23,23,,23,23,23,441,441', 
    '441,441,441,441,441,,,441,441,,,,,,441,441,,23,,,23,,,23,,,,,23,441', 
    '23,441,23,441,441,441,441,441,441,441,23,441,,,,23,23,23,23,23,23,,', 
    ',23,23,,24,24,24,,24,23,23,23,24,24,,23,23,24,,24,24,24,24,24,24,24', 
    ',,,,24,24,24,24,24,24,24,,,,,,,,,,24,,,24,24,24,24,24,24,24,24,24,24', 
    ',24,24,,24,24,24,440,440,440,440,440,440,440,,,440,440,,,,,,440,440', 
    ',24,,,24,,,24,,,,,24,440,24,440,24,440,440,440,440,440,440,440,24,440', 
    ',,,24,24,24,24,24,24,,,,24,24,,513,513,513,513,513,24,24,24,513,513', 
    ',24,24,513,,513,513,513,513,513,513,513,,,,,513,513,513,513,513,513', 
    '513,,,513,,,,,,513,513,513,513,513,513,513,513,513,513,513,513,513,513', 
    ',513,513,,513,513,513,439,,,,,,,,,,,,,,,,439,439,,513,,,513,,,513,,', 
    ',,513,439,,439,513,439,439,439,439,,,439,513,439,,,,513,513,513,513', 
    '513,513,,,,513,513,,458,458,458,,458,,513,513,458,458,,513,513,458,', 
    '458,458,458,458,458,458,458,,,,,458,458,458,458,458,458,458,,,,,,,,392', 
    ',458,,,458,458,458,458,458,458,458,458,458,458,,458,458,,458,458,458', 
    '392,392,392,392,392,392,392,392,392,392,392,,392,392,,,392,392,,458', 
    ',,458,,,458,,,,,,392,,392,458,392,392,392,392,392,392,392,458,392,,', 
    ',458,458,458,458,458,458,,,,458,458,,392,27,392,,,,458,458,27,27,27', 
    '458,458,27,27,27,696,27,696,696,696,696,,,,,27,27,27,,,,,,,,27,27,,27', 
    '27,27,27,27,,,,,,,,,,,696,,,,,,,696,696,696,696,27,27,27,27,27,27,27', 
    '27,27,27,27,27,27,27,,,27,27,27,,,27,,27,27,,,27,,27,,27,,27,,27,27', 
    '27,27,27,27,27,,27,27,27,,351,,351,351,351,351,,,,,,27,27,27,27,,27', 
    '28,,,,,27,,28,28,28,,,28,28,28,,28,438,,,,351,,,,,28,28,351,351,351', 
    '351,,438,438,28,28,,28,28,28,28,28,,,,,,438,,438,,438,438,438,438,,', 
    '438,,438,,,,28,28,28,28,28,28,28,28,28,28,28,28,28,28,,,28,28,28,,,28', 
    ',28,28,,,28,,28,,28,,28,,28,28,28,28,28,28,28,,28,,28,,,,,,,,,,,,,28', 
    '28,28,28,,28,30,30,30,30,30,28,,,30,30,,,,30,,30,30,30,30,30,30,30,', 
    ',,,30,30,30,30,30,30,30,,,30,,,,,,30,30,30,30,30,30,30,30,30,30,30,30', 
    '30,30,,30,30,,30,30,30,447,447,447,447,447,447,447,,,447,447,,,,,,447', 
    '447,,30,,,30,,,30,,,,,30,447,,447,30,447,447,447,447,447,447,447,30', 
    '447,,,,30,30,30,30,30,30,,,,30,30,,31,31,31,,31,,30,30,31,31,,30,30', 
    '31,,31,31,31,31,31,31,31,,,,,31,31,31,31,31,31,31,,,,,,,,,,31,,,31,31', 
    '31,31,31,31,31,31,31,31,,31,31,433,,,31,,,,,434,,,,,,,,433,433,,,,,', 
    '31,434,434,31,,,31,,433,,433,31,433,433,433,433,434,,,,434,434,434,434', 
    ',,,,31,31,31,31,31,31,,,,31,31,,32,32,32,,32,,31,31,32,32,,31,31,32', 
    ',32,32,32,32,32,32,32,,,,,32,32,32,32,32,32,32,,,,,,,,,,32,,,32,32,32', 
    '32,32,32,32,32,32,32,432,32,32,,,,32,,,,,,,,,,432,432,,,,,,,,,32,,,32', 
    ',432,32,432,,432,432,432,432,,,,,,,,,,,,,,,,32,32,32,32,32,32,,,,32', 
    '32,,517,517,517,517,517,,32,32,517,517,,32,32,517,,517,517,517,517,517', 
    '517,517,,,,,517,517,517,517,517,517,517,,,517,,,,,,517,517,517,517,517', 
    '517,517,517,517,517,517,517,517,517,,517,517,,517,517,517,,,,,,,,,,', 
    ',,,,,,,,,517,,,517,,,517,,,,,517,,,,517,,,,,,,,517,,,,,517,517,517,517', 
    '517,517,,,,517,517,,455,455,455,,455,,517,517,455,455,,517,517,455,', 
    '455,455,455,455,455,455,455,,,,,455,455,455,455,455,455,455,,,,,,,,', 
    ',455,,,455,455,455,455,455,455,455,455,455,455,,455,455,,455,455,455', 
    ',,,,,,,,,,,,,,,,,,,455,,,455,,,455,,,,,455,,455,,455,,,,,,,,455,,,,', 
    '455,455,455,455,455,455,,,,455,455,,839,839,839,,839,455,455,455,839', 
    '839,,455,455,839,,839,839,839,839,839,839,839,,,,,839,839,839,839,839', 
    '839,839,,,,,,,,,,839,,,839,839,839,839,839,839,839,839,839,839,,839', 
    '839,,839,839,839,,,,,,,,,,,,,,,,,,,,839,,,839,,,839,,,,,839,,,,839,', 
    ',,,,,,839,,,,,839,839,839,839,839,839,,,,839,839,,37,37,37,,37,839,839', 
    '839,37,37,,839,839,37,,37,37,37,37,37,37,37,,,,,37,37,37,37,37,37,37', 
    ',,,,,,,,,37,,,37,37,37,37,37,37,37,37,37,37,,37,37,,37,37,37,,,,,,,', 
    ',,,,,,,,,,,,37,,,37,,,37,,,,,,,,,37,,,,,,,,37,,,,,37,37,37,37,37,37', 
    ',,,37,37,,38,38,38,,38,,37,37,38,38,,37,37,38,,38,38,38,38,38,38,38', 
    ',,,,38,38,38,38,38,38,38,,,,,,,,,,38,,,38,38,38,38,38,38,38,38,38,38', 
    ',38,38,,38,38,38,,,,,,,,,,,,,,,,,,,,38,,,38,,,38,,,,,,,,,38,,,,,,,,38', 
    ',,,,38,38,38,38,38,38,,,,38,38,,39,39,39,,39,,38,38,39,39,,38,38,39', 
    ',39,39,39,39,39,39,39,,,,,39,39,39,39,39,39,39,,,,,,,,,,39,,,39,39,39', 
    '39,39,39,39,39,39,39,,39,39,,39,39,39,,,,,,,,,,,,,,,,,,,,39,,,39,,,39', 
    ',,,,,,,,39,,,,,,,,39,,,,,39,39,39,39,39,39,,,,39,39,,836,836,836,,836', 
    ',39,39,836,836,,39,39,836,,836,836,836,836,836,836,836,,,,,836,836,836', 
    '836,836,836,836,,,,,,,,,,836,,,836,836,836,836,836,836,836,836,836,836', 
    ',836,836,,836,836,836,,,,,,,,,,,,,,,,,,,,836,,,836,,,836,,,,,836,,836', 
    ',836,,,,,,,,836,,,,,836,836,836,836,836,836,,,,836,836,,452,452,452', 
    ',452,836,836,836,452,452,,836,836,452,,452,452,452,452,452,452,452,', 
    ',,,452,452,452,452,452,452,452,,,,,,,,596,,452,,,452,452,452,452,452', 
    '452,452,452,452,452,,452,452,,452,452,452,596,596,596,596,596,596,596', 
    '596,596,596,596,,596,596,,,596,596,,452,,,452,,,452,,,,,452,596,452', 
    '596,452,596,596,596,596,596,596,596,452,596,,,,452,452,452,452,452,452', 
    ',,,452,452,,596,49,,,,452,452,452,49,49,49,452,452,49,49,49,,49,,,,', 
    ',,,49,,49,49,,,,,,,,49,49,,49,49,49,49,49,,,,,,,,,,,,,,,,,,,,,,49,49', 
    '49,49,49,49,49,49,49,49,49,49,49,49,,,49,49,49,,,49,,,49,,,49,,49,,49', 
    ',49,,49,49,49,49,49,49,49,,49,,49,,,,,,,,,,,,,49,49,49,49,,49,50,50', 
    '50,50,50,49,,,50,50,,,,50,,50,50,50,50,50,50,50,,,,,50,50,50,50,50,50', 
    '50,,,50,,,,,,50,50,50,50,50,50,50,50,50,50,50,50,50,50,,50,50,,50,50', 
    '50,,,,,,,,,,,,,,,,,,,,50,,,50,,,50,,,,,50,,,,50,,,,,,,,50,,,,,50,50', 
    '50,50,50,50,,,,50,50,,51,51,51,,51,,50,50,51,51,,50,50,51,,51,51,51', 
    '51,51,51,51,,,,,51,51,51,51,51,51,51,,,51,,,,,,,51,,,51,51,51,51,51', 
    '51,51,51,51,51,,51,51,,51,51,51,,,,,,,,,,,,,,,,,,,,51,,,51,,,51,,,,', 
    ',,,,51,,,,,,,,51,,,,,51,51,51,51,51,51,,,,51,51,,52,52,52,,52,,51,51', 
    '52,52,,51,51,52,,52,52,52,52,52,52,52,,,,,52,52,52,52,52,52,52,,,,,', 
    ',,,,52,,,52,52,52,52,52,52,52,52,52,52,,52,52,,52,52,52,,,,,,,,,,,,', 
    ',,,,,,,52,,,52,,,52,,,,,52,,,,52,,,,,,,,52,,,,,52,52,52,52,52,52,,,', 
    '52,52,,53,53,53,,53,52,52,52,53,53,,52,52,53,,53,53,53,53,53,53,53,', 
    ',,,53,53,53,53,53,53,53,,,,,,,,,,53,,,53,53,53,53,53,53,53,53,53,53', 
    ',53,53,,53,53,53,,,,,,,,,,,,,,,,,,,,53,,,53,,,53,,,,,,,,,53,,,,,,,,53', 
    ',,,,53,53,53,53,53,53,,,,53,53,,522,522,522,522,522,53,53,53,522,522', 
    ',53,53,522,,522,522,522,522,522,522,522,,,,,522,522,522,522,522,522', 
    '522,,,522,,,,,,522,522,522,522,522,522,522,522,522,522,522,522,522,522', 
    ',522,522,,522,522,522,,,,,,,,,,,,,,,,,,,,522,,,522,,,522,,,,,522,,,', 
    '522,,,,,,,,522,,,,,522,522,522,522,522,522,,,,522,522,,55,55,55,,55', 
    ',522,522,55,55,,522,522,55,,55,55,55,55,55,55,55,,,,,55,55,55,55,55', 
    '55,55,,,55,,,,,,,55,,,55,55,55,55,55,55,55,55,55,55,,55,55,,55,55,55', 
    ',,,,,,,,,,,,,,,,,,,55,,,55,,,55,,,,,,,,,55,,,,,,,,55,,,,,55,55,55,55', 
    '55,55,,,,55,55,,56,56,56,,56,,55,55,56,56,,55,55,56,,56,56,56,56,56', 
    '56,56,,,,,56,56,56,56,56,56,56,,,56,,,,,,,56,,,56,56,56,56,56,56,56', 
    '56,56,56,,56,56,,56,56,56,,,,,,,,,,,,,,,,,,,,56,,,56,,,56,,,,,,,,,56', 
    ',,,,,,,56,,,,,56,56,56,56,56,56,,,,56,56,,59,59,59,,59,,56,56,59,59', 
    ',56,56,59,,59,59,59,59,59,59,59,,,,,59,59,59,59,59,59,59,,,59,,,,,,', 
    '59,,,59,59,59,59,59,59,59,59,59,59,,59,59,,59,59,59,19,19,19,19,19,19', 
    '19,19,19,19,19,,19,19,,,19,19,,59,,,59,,,59,,,,,,19,,19,59,19,19,19', 
    '19,19,19,19,59,19,,,,59,59,59,59,59,59,,,,59,59,59,19,523,523,523,59', 
    '523,59,59,,523,523,59,59,,523,,523,523,523,523,523,523,523,,,,,523,523', 
    '523,523,523,523,523,,,,,,,,,,523,,,523,523,523,523,523,523,523,523,523', 
    '523,,523,523,,523,523,523,,,,,,,,,,,,,,,,,,,,523,,,523,,,523,,,,,523', 
    ',,,523,,,,,,,,523,,,,,523,523,523,523,523,523,,,,523,523,,61,61,61,', 
    '61,,523,523,61,61,,523,523,61,,61,61,61,61,61,61,61,,,,,61,61,61,61', 
    '61,61,61,,,,,,,,,,61,,,61,61,61,61,61,61,61,61,61,61,,61,61,,,,61,,', 
    ',,,,,,,,,,,,,,61,,,61,,,61,,,61,,,,,,,,,,,,,,,,,,,,,,61,61,61,61,61', 
    '61,,,,61,61,,62,62,62,,62,,61,61,62,62,,61,61,62,,62,62,62,62,62,62', 
    '62,,,,,62,62,62,62,62,62,62,,,,,,,,,,62,,,62,62,62,62,62,62,62,62,62', 
    '62,,62,62,,,,62,,,,,,,,,,,,,,,,,,,,62,,,62,,,62,,,,,,,,,,,,,,,,,,,,', 
    ',62,62,62,62,62,62,,,,62,62,,531,531,531,,531,,62,62,531,531,,62,62', 
    '531,,531,531,531,531,531,531,531,,,,,531,531,531,531,531,531,531,,,', 
    ',,,,,,531,,,531,531,531,531,531,531,531,531,531,531,,531,531,,,,531', 
    ',,,,,,,,,,,,,,,,,,,531,,,531,,,531,,,,,,,,,,,,,,,,,,,,,,531,531,531', 
    '531,531,531,,,,531,531,,833,833,833,,833,,531,531,833,833,,531,531,833', 
    ',833,833,833,833,833,833,833,,,,,833,833,833,833,833,833,833,,,,,,,', 
    ',,833,,,833,833,833,833,833,833,833,833,833,833,,833,833,,833,833,833', 
    ',,,,,,,,,,,,,,,,,,,833,,,833,,,833,,,,,833,,833,,833,,,,,,,,833,,,,', 
    '833,833,833,833,833,833,,,,833,833,,537,537,537,,537,833,833,833,537', 
    '537,,833,833,537,,537,537,537,537,537,537,537,,,,,537,537,537,537,537', 
    '537,537,,,,,,,,,,537,,,537,537,537,537,537,537,537,537,537,537,,537', 
    '537,,537,537,537,,,,,,,,,,,,,,,,,,,,537,,,537,,,537,,,,,537,,,,537,', 
    ',,,,,,537,,,,,537,537,537,537,537,537,,,,537,537,,539,539,539,539,539', 
    '537,537,537,539,539,,537,537,539,,539,539,539,539,539,539,539,,,,,539', 
    '539,539,539,539,539,539,,,539,,,,,,539,539,539,539,539,539,539,539,539', 
    '539,539,539,539,539,,539,539,,539,539,539,,,,,,,,,,,,,,,,,,,,539,,,539', 
    ',,539,,,,,539,,,,539,,,,,,,,539,,,,,539,539,539,539,539,539,,,,539,539', 
    ',541,541,541,,541,,539,539,541,541,,539,539,541,,541,541,541,541,541', 
    '541,541,,,,,541,541,541,541,541,541,541,,,541,,,,,,,541,,,541,541,541', 
    '541,541,541,541,541,541,541,,541,541,,541,541,541,,,,,,,,,,,,,,,,,,', 
    ',541,,,541,,,541,,,,,,,,,541,,,,,,,,541,,,,,541,541,541,541,541,541', 
    ',,,541,541,,817,817,817,,817,,541,541,817,817,,541,541,817,,817,817', 
    '817,817,817,817,817,,,,,817,817,817,817,817,817,817,,,,,,,,,,817,,,817', 
    '817,817,817,817,817,817,817,817,817,,817,817,,817,817,817,620,620,620', 
    '620,620,620,620,620,620,620,620,,620,620,,,620,620,,817,,620,817,,,817', 
    ',,,,,620,,620,817,620,620,620,620,620,620,620,817,620,,,,817,817,817', 
    '817,817,817,,,,817,817,,620,82,620,,,,817,817,82,82,82,817,817,82,82', 
    '82,,82,,,,,,,,82,,82,82,,,,,,,,82,82,,82,82,82,82,82,,,,,,,,,,,,,,,', 
    ',,,,,,82,82,82,82,82,82,82,82,82,82,82,82,82,82,,,82,82,82,,82,82,,', 
    '82,,,82,,82,,82,,82,,82,82,82,82,82,82,82,,82,,82,,,,,,,,,,,,,82,82', 
    '82,82,,82,85,,,82,,82,,85,85,85,,,85,85,85,,85,,,,,,,,85,,85,85,,,,', 
    ',,,85,85,,85,85,85,85,85,,,,,,,,,,,,,,,,,,,,,,85,85,85,85,85,85,85,85', 
    '85,85,85,85,85,85,,,85,85,85,,85,85,,,85,,,85,,85,,85,,85,,85,85,85', 
    '85,85,85,85,,85,,85,,,,,,,,,,,,,85,85,85,85,,85,,,,85,,85,545,545,545', 
    '545,545,,,,545,545,,,,545,,545,545,545,545,545,545,545,,,,,545,545,545', 
    '545,545,545,545,,,545,,,,,,545,545,545,545,545,545,545,545,545,545,545', 
    '545,545,545,,545,545,,545,545,545,,,,,,,,,,,,,,,,,,,,545,,,545,,,545', 
    ',,,,545,,,,545,,,,,,,,545,,,,,545,545,545,545,545,545,,,,545,545,,99', 
    '99,99,99,99,,545,545,99,99,,545,545,99,,99,99,99,99,99,99,99,,,,,99', 
    '99,99,99,99,99,99,,,99,,,,,,99,99,99,99,99,99,99,99,99,99,99,99,99,99', 
    ',99,99,,99,99,99,507,507,507,507,507,507,507,507,507,507,507,,507,507', 
    ',,507,507,,99,,,99,,,99,,,,,99,507,,507,99,507,507,507,507,507,507,507', 
    '99,507,,,,99,99,99,99,99,99,,,,99,99,507,507,103,103,103,99,103,99,99', 
    ',103,103,99,99,,103,,103,103,103,103,103,103,103,,,,,103,103,103,103', 
    '103,103,103,,,103,,,,,,,103,,,103,103,103,103,103,103,103,103,103,103', 
    ',103,103,,103,103,103,,,,,,,,,,,,,,,,,,,,103,,,103,,,103,,,,,,,,,103', 
    ',,,,,,,103,,,,,103,103,103,103,103,103,,,,103,103,,104,104,104,,104', 
    ',103,103,104,104,,103,103,104,,104,104,104,104,104,104,104,,,,,104,104', 
    '104,104,104,104,104,,,104,,,,,,,104,,,104,104,104,104,104,104,104,104', 
    '104,104,,104,104,,104,104,104,,,,,,,,,,,,,,,,,,,,104,,,104,,,104,,,', 
    ',,,,,104,,,,,,,,104,,,,,104,104,104,104,104,104,,,,104,104,,105,105', 
    '105,,105,,104,104,105,105,,104,104,105,,105,105,105,105,105,105,105', 
    ',,,,105,105,105,105,105,105,105,,,105,,,,,,,105,,,105,105,105,105,105', 
    '105,105,105,105,105,,105,105,,105,105,105,,,,,,,,,,,,,,,,,,,,105,,,105', 
    ',,105,,,,,,,,,105,,,,,,,,105,,,,,105,105,105,105,105,105,,,,105,105', 
    ',106,106,106,,106,,105,105,106,106,,105,105,106,,106,106,106,106,106', 
    '106,106,,,,,106,106,106,106,106,106,106,,,106,,,,,,,106,,,106,106,106', 
    '106,106,106,106,106,106,106,,106,106,,106,106,106,,,,,,,,,,,,,,,,,,', 
    ',106,,,106,,,106,,,,,,,,,106,,,,,,,,106,,,,,106,106,106,106,106,106', 
    ',,,106,106,,107,107,107,107,107,,106,106,107,107,,106,106,107,,107,107', 
    '107,107,107,107,107,,,,,107,107,107,107,107,107,107,,,107,,,,,,107,107', 
    '107,107,107,107,107,107,107,107,107,107,107,107,,107,107,,107,107,107', 
    ',,,,,,,,,,,,,,,,,,,107,,,107,,,107,,,,,107,,,,107,,,,,,,,107,,,,,107', 
    '107,107,107,107,107,,,,107,107,,577,577,577,,577,,107,107,577,577,,107', 
    '107,577,,577,577,577,577,577,577,577,,,,,577,577,577,577,577,577,577', 
    ',,,,,,,,,577,,,577,577,577,577,577,577,577,577,577,577,,577,577,,577', 
    '577,577,,,,,,,,,,,,,,,,,,,,577,,,577,,,577,,,,,,,,,577,,,,,,,,577,,', 
    ',,577,577,577,577,577,577,,,,577,577,,578,578,578,,578,,577,577,578', 
    '578,,577,577,578,,578,578,578,578,578,578,578,,,,,578,578,578,578,578', 
    '578,578,,,,,,,,,,578,,,578,578,578,578,578,578,578,578,578,578,,578', 
    '578,,578,578,578,,,,,,,,,,,,,,,,,,,,578,,,578,,,578,,,,,578,,,,578,', 
    ',,,,,,578,,,,,578,578,578,578,578,578,,,,578,578,,581,581,581,,581,', 
    '578,578,581,581,,578,578,581,,581,581,581,581,581,581,581,,,,,581,581', 
    '581,581,581,581,581,,,,,,,,,,581,,,581,581,581,581,581,581,581,581,581', 
    '581,,581,581,,581,581,581,,,,,,,,,,,,,,,,,,,,581,,,581,,,581,,,,,,,', 
    ',581,,,,,,,,581,,,,,581,581,581,581,581,581,,,,581,581,,582,582,582', 
    ',582,,581,581,582,582,,581,581,582,,582,582,582,582,582,582,582,,,,', 
    '582,582,582,582,582,582,582,,,,,,,,,,582,,,582,582,582,582,582,582,582', 
    '582,582,582,,582,582,,582,582,582,,,,,,,,,,,,,,,,,,,,582,,,582,,,582', 
    ',,,,,,,,582,,,,,,,,582,,,,,582,582,582,582,582,582,,,,582,582,,189,189', 
    '189,189,189,,582,582,189,189,,582,582,189,,189,189,189,189,189,189,189', 
    ',,,,189,189,189,189,189,189,189,,,189,,,,,,189,189,189,189,189,189,189', 
    '189,189,189,189,189,189,189,,189,189,,189,189,189,,,,,,,,,,,,,,,,,,', 
    ',189,,,189,,,189,,,,,189,,,,189,,,,,,,,189,,,,,189,189,189,189,189,189', 
    ',,,189,189,,190,190,190,190,190,,189,189,190,190,,189,189,190,,190,190', 
    '190,190,190,190,190,,,,,190,190,190,190,190,190,190,,,190,,,,,,190,190', 
    '190,190,190,190,190,190,190,190,190,190,190,190,,190,190,,190,190,190', 
    ',,,,,,,,,,,,,,,,,,,190,,,190,,,190,,,,,190,,,,190,,,,,,,,190,,,,,190', 
    '190,190,190,190,190,,,,190,190,,191,191,191,,191,,190,190,191,191,,190', 
    '190,191,,191,191,191,191,191,191,191,,,,,191,191,191,191,191,191,191', 
    ',,,,,,,,,191,,,191,191,191,191,191,191,191,191,191,191,,191,191,,191', 
    '191,191,,,,,,,,,,,,,,,,,,,,191,,,191,,,191,,,,,191,,,,191,,,,,,,,191', 
    ',,,,191,191,191,191,191,191,,,,191,191,,192,192,192,,192,,191,191,192', 
    '192,,191,191,192,,192,192,192,192,192,192,192,,,,,192,192,192,192,192', 
    '192,192,,,,,,,,,,192,,,192,192,192,192,192,192,192,192,192,192,,192', 
    '192,,192,192,192,,,,,,,,,,,,,,,,,,,,192,,,192,,,192,,,,,192,,,,192,', 
    ',,,,,,192,,,,,192,192,192,192,192,192,,,,192,192,,193,193,193,,193,', 
    '192,192,193,193,,192,192,193,,193,193,193,193,193,193,193,,,,,193,193', 
    '193,193,193,193,193,,,,,,,,,,193,,,193,193,193,193,193,193,193,193,193', 
    '193,,193,193,,193,193,193,,,,,,,,,,,,,,,,,,,,193,,,193,,,193,,,,,,,', 
    ',193,,,,,,,,193,,,,,193,193,193,193,193,193,,,,193,193,,194,194,194', 
    ',194,,193,193,194,194,,193,193,194,,194,194,194,194,194,194,194,,,,', 
    '194,194,194,194,194,194,194,,,,,,,,,,194,,,194,194,194,194,194,194,194', 
    '194,194,194,,194,194,,194,194,194,,,,,,,,,,,,,,,,,,,,194,,,194,,,194', 
    ',,,,194,,,,194,,,,,,,,194,,,,,194,194,194,194,194,194,,,,194,194,,587', 
    '587,587,,587,194,194,194,587,587,,194,194,587,,587,587,587,587,587,587', 
    '587,,,,,587,587,587,587,587,587,587,,,,,,,,,,587,,,587,587,587,587,587', 
    '587,587,587,587,587,,587,587,,587,587,587,,,,,,,,,,,,,,,,,,,,587,,,587', 
    ',,587,,,,,,,,,587,,,,,,,,587,,,,,587,587,587,587,587,587,,,,587,587', 
    ',590,590,590,,590,,587,587,590,590,,587,587,590,,590,590,590,590,590', 
    '590,590,,,,,590,590,590,590,590,590,590,,,,,,,,,,590,,,590,590,590,590', 
    '590,590,590,590,590,590,,590,590,,590,590,590,,,,,,,,,,,,,,,,,,,,590', 
    ',,590,,,590,,,,,,,,,590,,,,,,,,590,,,,,590,590,590,590,590,590,,,,590', 
    '590,,197,197,197,,197,,590,590,197,197,,590,590,197,,197,197,197,197', 
    '197,197,197,,,,,197,197,197,197,197,197,197,,,,,,,,,,197,,,197,197,197', 
    '197,197,197,197,197,197,197,,197,197,,197,197,197,,,,,,,,,,,,,,,,,,', 
    ',197,,,197,,,197,,,,,,,,,197,,,,,,,,197,,,,,197,197,197,197,197,197', 
    ',,,197,197,,198,198,198,,198,,197,197,198,198,,197,197,198,,198,198', 
    '198,198,198,198,198,,,,,198,198,198,198,198,198,198,,,198,,,,,,,198', 
    ',,198,198,198,198,198,198,198,198,198,198,,198,198,,198,198,198,,,,', 
    ',,,,,,,,,,,,,,,198,,,198,,,198,,,,,,,,,198,,,,,,,,198,,,,,198,198,198', 
    '198,198,198,,,,198,198,,199,199,199,,199,,198,198,199,199,,198,198,199', 
    ',199,199,199,199,199,199,199,,,,,199,199,199,199,199,199,199,,,199,', 
    ',,,,,199,,,199,199,199,199,199,199,199,199,199,199,,199,199,,199,199', 
    '199,830,830,830,830,830,830,830,830,830,830,830,,830,830,,,830,830,', 
    '199,,,199,,,199,,,,,,830,,830,199,830,830,830,830,830,830,830,199,830', 
    ',,,199,199,199,199,199,199,,,,199,199,,830,593,830,,,,199,199,593,593', 
    '593,199,199,593,593,593,,593,,,,,,,,,593,593,593,,,,,,,,593,593,,593', 
    '593,593,593,593,,,,,,,,,,,,,,,,,,,,,,593,593,593,593,593,593,593,593', 
    '593,593,593,593,593,593,,,593,593,593,,593,593,,,593,,,593,,593,,593', 
    ',593,,593,593,593,593,593,593,593,,593,593,593,,,,,,,,,,,,,593,593,593', 
    '593,,593,423,423,423,593,423,593,,,423,423,,,,423,,423,423,423,423,423', 
    '423,423,,,,,423,423,423,423,423,423,423,,,,,,,,,,423,,,423,423,423,423', 
    '423,423,423,423,423,423,,423,423,,423,423,423,,,,,,,,,,,,,,,,,,,,423', 
    ',,423,,,423,,,,,,,,,423,,,,,,,,423,,,,,423,423,423,423,423,423,,,,423', 
    '423,,805,805,805,805,805,,423,423,805,805,,423,423,805,,805,805,805', 
    '805,805,805,805,,,,,805,805,805,805,805,805,805,,,805,,,,,,805,805,805', 
    '805,805,805,805,805,805,805,805,805,805,805,,805,805,,805,805,805,,', 
    ',,,,,,,,,,,,,,,,,805,,,805,,,805,,,,,805,,,,805,,,,,,,,805,,,,,805,805', 
    '805,805,805,805,,,,805,805,,802,802,802,,802,,805,805,802,802,,805,805', 
    '802,,802,802,802,802,802,802,802,,,,,802,802,802,802,802,802,802,,,', 
    ',,,,,,802,,,802,802,802,802,802,802,802,802,802,802,,802,802,,802,802', 
    '802,,,,,,,,,,,,,,,,,,,,802,,,802,,,802,,,,,,,,,802,,,,,,,,802,,,,,802', 
    '802,802,802,802,802,,,,802,802,,800,800,800,,800,,802,802,800,800,,802', 
    '802,800,,800,800,800,800,800,800,800,,,,,800,800,800,800,800,800,800', 
    ',,,,,,,,,800,,,800,800,800,800,800,800,800,800,800,800,,800,800,,800', 
    '800,800,,,,,,,,,,,,,,,,,,,,800,,,800,,,800,,,,,,,,,800,,,,,,,,800,,', 
    ',,800,800,800,800,800,800,,,,800,800,,794,794,794,,794,,800,800,794', 
    '794,,800,800,794,,794,794,794,794,794,794,794,,,,,794,794,794,794,794', 
    '794,794,,,,,,,,,,794,,,794,794,794,794,794,794,794,794,794,794,,794', 
    '794,,794,794,794,,,,,,,,,,,,,,,,,,,,794,,,794,,,794,,,,,,,,,794,,,,', 
    ',,,794,,,,,794,794,794,794,794,794,,,,794,794,,207,207,207,207,207,', 
    '794,794,207,207,,794,794,207,,207,207,207,207,207,207,207,,,,,207,207', 
    '207,207,207,207,207,,,207,,,,,,207,207,207,207,207,207,207,207,207,207', 
    '207,207,207,207,,207,207,,207,207,207,,,,,,,,,,,,,,,,,,,,207,,,207,', 
    ',207,,,,,207,,,,207,,,,,,,,207,,,,,207,207,207,207,207,207,,,,207,207', 
    ',210,210,210,,210,,207,207,210,210,,207,207,210,,210,210,210,210,210', 
    '210,210,,,,,210,210,210,210,210,210,210,,,,,,,,,,210,,,210,210,210,210', 
    '210,210,210,210,210,210,,210,210,,210,210,210,,,,,,,,,,,,,,,,,,,,210', 
    ',,210,,,210,,,,,,,,,210,,,,,,,,210,,,,,210,210,210,210,210,210,,,,210', 
    '210,,211,211,211,,211,,210,210,211,211,,210,210,211,,211,211,211,211', 
    '211,211,211,,,,,211,211,211,211,211,211,211,,,,,,,,,,211,,,211,211,211', 
    '211,211,211,211,211,211,211,,211,211,,211,211,211,,,,,,,,,,,,,,,,,,', 
    ',211,,,211,,,211,,,,,,,,,211,,,,,,,,211,,,,,211,211,211,211,211,211', 
    ',,,211,211,,212,212,212,,212,,211,211,212,212,,211,211,212,,212,212', 
    '212,212,212,212,212,,,,,212,212,212,212,212,212,212,,,,,,,,,,212,,,212', 
    '212,212,212,212,212,212,212,212,212,,212,212,,212,212,212,,,,,,,,,,', 
    ',,,,,,,,,212,,,212,,,212,,,,,,,,,212,,,,,,,,212,,,,,212,212,212,212', 
    '212,212,,,,212,212,,213,213,213,,213,,212,212,213,213,,212,212,213,', 
    '213,213,213,213,213,213,213,,,,,213,213,213,213,213,213,213,,,,,,,,', 
    ',213,,,213,213,213,213,213,213,213,213,213,213,,213,213,,213,213,213', 
    ',,,,,,,,,,,,,,,,,,,213,,,213,,,213,,,,,,,,,213,,,,,,,,213,,,,,213,213', 
    '213,213,213,213,,,,213,213,,214,214,214,,214,,213,213,214,214,,213,213', 
    '214,,214,214,214,214,214,214,214,,,,,214,214,214,214,214,214,214,,,', 
    ',,,,,,214,,,214,214,214,214,214,214,214,214,214,214,,214,214,,214,214', 
    '214,,,,,,,,,,,,,,,,,,,,214,,,214,,,214,,,,,,,,,214,,,,,,,,214,,,,,214', 
    '214,214,214,214,214,,,,214,214,,215,215,215,,215,,214,214,215,215,,214', 
    '214,215,,215,215,215,215,215,215,215,,,,,215,215,215,215,215,215,215', 
    ',,,,,,,,,215,,,215,215,215,215,215,215,215,215,215,215,,215,215,,215', 
    '215,215,,,,,,,,,,,,,,,,,,,,215,,,215,,,215,,,,,,,,,215,,,,,,,,215,,', 
    ',,215,215,215,215,215,215,,,,215,215,,216,216,216,,216,,215,215,216', 
    '216,,215,215,216,,216,216,216,216,216,216,216,,,,,216,216,216,216,216', 
    '216,216,,,,,,,,,,216,,,216,216,216,216,216,216,216,216,216,216,,216', 
    '216,,216,216,216,,,,,,,,,,,,,,,,,,,,216,,,216,,,216,,,,,,,,,216,,,,', 
    ',,,216,,,,,216,216,216,216,216,216,,,,216,216,,217,217,217,,217,,216', 
    '216,217,217,,216,216,217,,217,217,217,217,217,217,217,,,,,217,217,217', 
    '217,217,217,217,,,,,,,,,,217,,,217,217,217,217,217,217,217,217,217,217', 
    ',217,217,,217,217,217,,,,,,,,,,,,,,,,,,,,217,,,217,,,217,,,,,,,,,217', 
    ',,,,,,,217,,,,,217,217,217,217,217,217,,,,217,217,,218,218,218,,218', 
    ',217,217,218,218,,217,217,218,,218,218,218,218,218,218,218,,,,,218,218', 
    '218,218,218,218,218,,,,,,,,,,218,,,218,218,218,218,218,218,218,218,218', 
    '218,,218,218,,218,218,218,,,,,,,,,,,,,,,,,,,,218,,,218,,,218,,,,,,,', 
    ',218,,,,,,,,218,,,,,218,218,218,218,218,218,,,,218,218,,219,219,219', 
    ',219,,218,218,219,219,,218,218,219,,219,219,219,219,219,219,219,,,,', 
    '219,219,219,219,219,219,219,,,,,,,,,,219,,,219,219,219,219,219,219,219', 
    '219,219,219,,219,219,,219,219,219,,,,,,,,,,,,,,,,,,,,219,,,219,,,219', 
    ',,,,,,,,219,,,,,,,,219,,,,,219,219,219,219,219,219,,,,219,219,,220,220', 
    '220,,220,,219,219,220,220,,219,219,220,,220,220,220,220,220,220,220', 
    ',,,,220,220,220,220,220,220,220,,,,,,,,,,220,,,220,220,220,220,220,220', 
    '220,220,220,220,,220,220,,220,220,220,,,,,,,,,,,,,,,,,,,,220,,,220,', 
    ',220,,,,,,,,,220,,,,,,,,220,,,,,220,220,220,220,220,220,,,,220,220,', 
    '221,221,221,,221,,220,220,221,221,,220,220,221,,221,221,221,221,221', 
    '221,221,,,,,221,221,221,221,221,221,221,,,,,,,,,,221,,,221,221,221,221', 
    '221,221,221,221,221,221,,221,221,,221,221,221,,,,,,,,,,,,,,,,,,,,221', 
    ',,221,,,221,,,,,,,,,221,,,,,,,,221,,,,,221,221,221,221,221,221,,,,221', 
    '221,,222,222,222,,222,,221,221,222,222,,221,221,222,,222,222,222,222', 
    '222,222,222,,,,,222,222,222,222,222,222,222,,,,,,,,,,222,,,222,222,222', 
    '222,222,222,222,222,222,222,,222,222,,222,222,222,,,,,,,,,,,,,,,,,,', 
    ',222,,,222,,,222,,,,,,,,,222,,,,,,,,222,,,,,222,222,222,222,222,222', 
    ',,,222,222,,223,223,223,,223,,222,222,223,223,,222,222,223,,223,223', 
    '223,223,223,223,223,,,,,223,223,223,223,223,223,223,,,,,,,,,,223,,,223', 
    '223,223,223,223,223,223,223,223,223,,223,223,,223,223,223,,,,,,,,,,', 
    ',,,,,,,,,223,,,223,,,223,,,,,,,,,223,,,,,,,,223,,,,,223,223,223,223', 
    '223,223,,,,223,223,,224,224,224,,224,,223,223,224,224,,223,223,224,', 
    '224,224,224,224,224,224,224,,,,,224,224,224,224,224,224,224,,,,,,,,', 
    ',224,,,224,224,224,224,224,224,224,224,224,224,,224,224,,224,224,224', 
    ',,,,,,,,,,,,,,,,,,,224,,,224,,,224,,,,,,,,,224,,,,,,,,224,,,,,224,224', 
    '224,224,224,224,,,,224,224,,225,225,225,,225,,224,224,225,225,,224,224', 
    '225,,225,225,225,225,225,225,225,,,,,225,225,225,225,225,225,225,,,', 
    ',,,,,,225,,,225,225,225,225,225,225,225,225,225,225,,225,225,,225,225', 
    '225,,,,,,,,,,,,,,,,,,,,225,,,225,,,225,,,,,,,,,225,,,,,,,,225,,,,,225', 
    '225,225,225,225,225,,,,225,225,,226,226,226,,226,,225,225,226,226,,225', 
    '225,226,,226,226,226,226,226,226,226,,,,,226,226,226,226,226,226,226', 
    ',,,,,,,,,226,,,226,226,226,226,226,226,226,226,226,226,,226,226,,226', 
    '226,226,,,,,,,,,,,,,,,,,,,,226,,,226,,,226,,,,,,,,,226,,,,,,,,226,,', 
    ',,226,226,226,226,226,226,,,,226,226,,685,685,685,685,685,,226,226,685', 
    '685,,226,226,685,,685,685,685,685,685,685,685,,,,,685,685,685,685,685', 
    '685,685,,,685,,,,,,685,685,685,685,685,685,685,685,685,685,685,685,685', 
    '685,,685,685,,685,685,685,,,,,,,,,,,,,,,,,,,,685,,,685,,,685,,,,,685', 
    ',,,685,,,,,,,,685,,,,,685,685,685,685,685,685,,,,685,685,,228,228,228', 
    ',228,,685,685,228,228,,685,685,228,,228,228,228,228,228,228,228,,,,', 
    '228,228,228,228,228,228,228,,,,,,,,,,228,,,228,228,228,228,228,228,228', 
    '228,228,228,,228,228,,228,228,228,,,,,,,,,,,,,,,,,,,,228,,,228,,,228', 
    ',,,,,,,,228,,,,,,,,228,,,,,228,228,228,228,228,228,,,,228,228,,229,229', 
    '229,,229,,228,228,229,229,,228,228,229,,229,229,229,229,229,229,229', 
    ',,,,229,229,229,229,229,229,229,,,,,,,,,,229,,,229,229,229,229,229,229', 
    '229,229,229,229,,229,229,,229,229,229,,,,,,,,,,,,,,,,,,,,229,,,229,', 
    ',229,,,,,,,,,229,,,,,,,,229,,,,,229,229,229,229,229,229,,,,229,229,', 
    '230,230,230,,230,,229,229,230,230,,229,229,230,,230,230,230,230,230', 
    '230,230,,,,,230,230,230,230,230,230,230,,,,,,,,,,230,,,230,230,230,230', 
    '230,230,230,230,230,230,,230,230,,230,230,230,,,,,,,,,,,,,,,,,,,,230', 
    ',,230,,,230,,,,,,,,,230,,,,,,,,230,,,,,230,230,230,230,230,230,,,,230', 
    '230,,231,231,231,,231,,230,230,231,231,,230,230,231,,231,231,231,231', 
    '231,231,231,,,,,231,231,231,231,231,231,231,,,,,,,,,,231,,,231,231,231', 
    '231,231,231,231,231,231,231,,231,231,,231,231,231,,,,,,,,,,,,,,,,,,', 
    ',231,,,231,,,231,,,,,,,,,231,,,,,,,,231,,,,,231,231,231,231,231,231', 
    ',,,231,231,,232,232,232,,232,,231,231,232,232,,231,231,232,,232,232', 
    '232,232,232,232,232,,,,,232,232,232,232,232,232,232,,,,,,,,,,232,,,232', 
    '232,232,232,232,232,232,232,232,232,,232,232,,232,232,232,,,,,,,,,,', 
    ',,,,,,,,,232,,,232,,,232,,,,,,,,,232,,,,,,,,232,,,,,232,232,232,232', 
    '232,232,,,,232,232,,233,233,233,,233,,232,232,233,233,,232,232,233,', 
    '233,233,233,233,233,233,233,,,,,233,233,233,233,233,233,233,,,,,,,,', 
    ',233,,,233,233,233,233,233,233,233,233,233,233,,233,233,,233,233,233', 
    ',,,,,,,,,,,,,,,,,,,233,,,233,,,233,,,,,,,,,233,,,,,,,,233,,,,,233,233', 
    '233,233,233,233,,,,233,233,,234,234,234,,234,,233,233,234,234,,233,233', 
    '234,,234,234,234,234,234,234,234,,,,,234,234,234,234,234,234,234,,,', 
    ',,,,,,234,,,234,234,234,234,234,234,234,234,234,234,,234,234,,234,234', 
    '234,,,,,,,,,,,,,,,,,,,,234,,,234,,,234,,,,,,,,,234,,,,,,,,234,,,,,234', 
    '234,234,234,234,234,,,,234,234,,235,235,235,,235,,234,234,235,235,,234', 
    '234,235,,235,235,235,235,235,235,235,,,,,235,235,235,235,235,235,235', 
    ',,,,,,,,,235,,,235,235,235,235,235,235,235,235,235,235,,235,235,,235', 
    '235,235,,,,,,,,,,,,,,,,,,,,235,,,235,,,235,,,,,,,,,235,,,,,,,,235,,', 
    ',,235,235,235,235,235,235,,,,235,235,,236,236,236,,236,,235,235,236', 
    '236,,235,235,236,,236,236,236,236,236,236,236,,,,,236,236,236,236,236', 
    '236,236,,,,,,,,,,236,,,236,236,236,236,236,236,236,236,236,236,,236', 
    '236,,236,236,236,,,,,,,,,,,,,,,,,,,,236,,,236,,,236,,,,,,,,,236,,,,', 
    ',,,236,,,,,236,236,236,236,236,236,,,,236,236,,422,422,422,,422,,236', 
    '236,422,422,,236,236,422,,422,422,422,422,422,422,422,,,,,422,422,422', 
    '422,422,422,422,,,,,,,,,,422,,,422,422,422,422,422,422,422,422,422,422', 
    ',422,422,,422,422,422,,,,,,,,,,,,,,,,,,,,422,,,422,,,422,,,,,,,,,422', 
    ',,,,,,,422,,,,,422,422,422,422,422,422,,,,422,422,,791,791,791,,791', 
    ',422,422,791,791,,422,422,791,,791,791,791,791,791,791,791,,,,,791,791', 
    '791,791,791,791,791,,,,,,,,,,791,,,791,791,791,791,791,791,791,791,791', 
    '791,,791,791,,791,791,791,,,,,,,,,,,,,,,,,,,,791,,,791,,,791,,,,,,,', 
    ',791,,,,,,,,791,,,,,791,791,791,791,791,791,,,,791,791,,421,421,421', 
    ',421,,791,791,421,421,,791,791,421,,421,421,421,421,421,421,421,,,,', 
    '421,421,421,421,421,421,421,,,,,,,,,,421,,,421,421,421,421,421,421,421', 
    '421,421,421,,421,421,,421,421,421,,,,,,,,,,,,,,,,,,,,421,,,421,,,421', 
    ',,,,,,,,421,,,,,,,,421,,,,,421,421,421,421,421,421,,,,421,421,,244,244', 
    '244,,244,,421,421,244,244,,421,421,244,,244,244,244,244,244,244,244', 
    ',,,,244,244,244,244,244,244,244,,,,,,,,,,244,,,244,244,244,244,244,244', 
    '244,244,244,244,,244,244,,244,244,244,,,,,,,,,,,,,,,,,,,,244,,,244,', 
    ',244,,,,,,,,,244,,,,,,,,244,,,,,244,244,244,244,244,244,,,,244,244,', 
    '246,246,246,,246,,244,244,246,246,,244,244,246,,246,246,246,246,246', 
    '246,246,,,,,246,246,246,246,246,246,246,,,,,,,,,,246,,,246,246,246,246', 
    '246,246,246,246,246,246,,246,246,,246,246,246,,,,,,,,,,,,,,,,,,,,246', 
    ',,246,,,246,,,,,,,,,246,,,,,,,,246,,,,,246,246,246,246,246,246,,,,246', 
    '246,,785,785,785,785,785,,246,246,785,785,,246,246,785,,785,785,785', 
    '785,785,785,785,,,,,785,785,785,785,785,785,785,,,785,,,,,,785,785,785', 
    '785,785,785,785,785,785,785,785,785,785,785,,785,785,,785,785,785,,', 
    ',,,,,,,,,,,,,,,,,785,,,785,,,785,,,,,785,,,,785,,,,,,,,785,,,,,785,785', 
    '785,785,785,785,,,,785,785,,252,252,252,,252,,785,785,252,252,,785,785', 
    '252,,252,252,252,252,252,252,252,,,,,252,252,252,252,252,252,252,,,', 
    ',,,,,,252,,,252,252,252,252,252,252,252,252,252,252,,252,252,,252,252', 
    '252,,,,,,,,,,,,,,,,,,,,252,,,252,,,252,,,,,,,,,252,,,,,,,,252,,,,594', 
    '252,252,252,252,252,252,594,594,594,252,252,594,594,594,,594,,,252,252', 
    ',,,252,252,594,594,,,,,,,,594,594,,594,594,594,594,594,,,,,,,,,,,,,', 
    ',,,,,,,,594,594,594,594,594,594,594,594,594,594,594,594,594,594,,,594', 
    '594,594,,594,594,,,594,,,594,,594,,594,,594,,594,594,594,594,594,594', 
    '594,,594,,594,,,,,,,,,,,,,594,594,594,594,,594,419,419,419,594,419,594', 
    ',,419,419,,,,419,,419,419,419,419,419,419,419,,,,,419,419,419,419,419', 
    '419,419,,,,,,,,,,419,,,419,419,419,419,419,419,419,419,419,419,,419', 
    '419,,419,419,419,707,707,707,707,707,707,707,707,707,707,707,,707,707', 
    ',,707,707,,419,,,419,,,419,,,,,419,707,,707,419,707,707,707,707,707', 
    '707,707,419,707,,,,419,419,419,419,419,419,,,,419,419,,707,412,,,,419', 
    '419,419,412,412,412,419,419,412,412,412,,412,,,,,,,,412,412,412,412', 
    ',,,,,,,412,412,,412,412,412,412,412,,,,,,,,,,,,,,,,,,,,,,412,412,412', 
    '412,412,412,412,412,412,412,412,412,412,412,,,412,412,412,,,412,,,412', 
    ',,412,,412,,412,,412,,412,412,412,412,412,412,412,,412,412,412,,,,,', 
    ',,,,,,,412,412,412,412,,412,258,258,258,,258,412,,,258,258,,,,258,,258', 
    '258,258,258,258,258,258,,,,,258,258,258,258,258,258,258,,,,,,,,,,258', 
    ',,258,258,258,258,258,258,258,258,258,258,,258,258,,258,258,258,,,,', 
    ',,,,,,,,,,,,,,,258,,,258,,,258,,,,,258,,258,,258,,,,,,,,258,,,,,258', 
    '258,258,258,258,258,,,,258,258,,259,259,259,,259,258,258,258,259,259', 
    ',258,258,259,,259,259,259,259,259,259,259,,,,,259,259,259,259,259,259', 
    '259,,,,,,,,,,259,,,259,259,259,259,259,259,259,259,259,259,,259,259', 
    ',259,259,259,240,240,240,240,240,240,240,240,240,240,240,,240,240,,', 
    '240,240,,259,,,259,,,259,,,,,259,240,259,240,259,240,240,240,240,240', 
    '240,240,259,240,,,,259,259,259,259,259,259,,,,259,259,,240,411,,,,259', 
    '259,259,411,411,411,259,259,411,411,411,,411,,,,,,,,411,411,411,411', 
    ',,,,,,,411,411,,411,411,411,411,411,,,,,,,,,,,,,,,,,,,,,,411,411,411', 
    '411,411,411,411,411,411,411,411,411,411,411,,,411,411,411,,,411,,,411', 
    ',,411,,411,,411,,411,,411,411,411,411,411,411,411,,411,411,411,,,,,', 
    ',,,,,,409,411,411,411,411,,411,409,409,409,,,411,409,409,,409,,,,,,', 
    ',,,,,,,,,,,,409,409,,409,409,409,409,409,,,,,,,,,,,,,,,,,,,,,,409,409', 
    '409,409,409,409,409,409,409,409,409,409,409,409,,,409,409,409,,409,', 
    ',,409,,,,,,,409,,409,,409,409,409,409,409,409,409,,409,,409,,,,,,,,', 
    ',,,,409,409,,409,,409,267,267,267,409,267,409,,,267,267,,,,267,,267', 
    '267,267,267,267,267,267,,,,,267,267,267,267,267,267,267,,,,,,,,,,267', 
    ',,267,267,267,267,267,267,267,267,267,267,,267,267,,267,267,267,,,,', 
    ',,,,,,,,,,,,,,,267,,,267,,267,267,,,,,267,,267,,267,,,,,,,,267,,,,,267', 
    '267,267,267,267,267,,,,267,267,,764,764,764,764,764,267,267,267,764', 
    '764,,267,267,764,,764,764,764,764,764,764,764,,,,,764,764,764,764,764', 
    '764,764,,,764,,,,,,764,764,764,764,764,764,764,764,764,764,764,764,764', 
    '764,,764,764,,764,764,764,,,,,,,,,,,,,,,,,,,,764,,,764,,,764,,,,,764', 
    ',,,764,,,,,,,,764,,,,,764,764,764,764,764,764,,,,764,764,,269,269,269', 
    '269,269,,764,764,269,269,,764,764,269,,269,269,269,269,269,269,269,', 
    ',,,269,269,269,269,269,269,269,,,269,,,,,,269,269,269,269,269,269,269', 
    '269,269,269,269,269,269,269,,269,269,,269,269,269,,,,,,,,,,,,,,,,,,', 
    ',269,,,269,,,269,,,,,269,,,,269,,,,,,,,269,,,,,269,269,269,269,269,269', 
    ',,,269,269,,763,763,763,,763,,269,269,763,763,,269,269,763,,763,763', 
    '763,763,763,763,763,,,,,763,763,763,763,763,763,763,,,,,,,,,,763,,,763', 
    '763,763,763,763,763,763,763,763,763,,763,763,,763,763,763,,,,,,,,,,', 
    ',,,,,,,,,763,,,763,,,763,,,,,763,,,,763,,,,,,,,763,,,,,763,763,763,763', 
    '763,763,,,,763,763,,760,760,760,760,760,,763,763,760,760,,763,763,760', 
    ',760,760,760,760,760,760,760,,,,,760,760,760,760,760,760,760,,,760,', 
    ',,,,760,760,760,760,760,760,760,760,760,760,760,760,760,760,,760,760', 
    ',760,760,760,,,,,,,,,,,,,,,,,,,,760,,,760,,,760,,,,,760,,,,760,,,,,', 
    ',,760,,,,,760,760,760,760,760,760,,,,760,760,,759,759,759,759,759,,760', 
    '760,759,759,,760,760,759,,759,759,759,759,759,759,759,,,,,759,759,759', 
    '759,759,759,759,,,759,,,,,,759,759,759,759,759,759,759,759,759,759,759', 
    '759,759,759,,759,759,,759,759,759,,,,,,,,,,,,,,,,,,,,759,,,759,,,759', 
    ',,,,759,,,,759,,,,,,,,759,,,,,759,759,759,759,759,759,,,,759,759,,273', 
    '273,273,,273,,759,759,273,273,,759,759,273,,273,273,273,273,273,273', 
    '273,,,,,273,273,273,273,273,273,273,,,,,,,,,,273,,,273,273,273,273,273', 
    '273,273,273,273,273,,273,273,,,,273,,,,,,,,,,,,,,,,,,,,273,,,273,,,273', 
    ',,,,,,,,,,,,,,,,,,,,,273,273,273,273,273,273,,,,273,273,,274,274,274', 
    '274,274,,273,273,274,274,,273,273,274,,274,274,274,274,274,274,274,', 
    ',,,274,274,274,274,274,274,274,,,274,,,,,,274,274,274,274,274,274,274', 
    '274,274,274,274,274,274,274,,274,274,,274,274,274,790,790,790,790,790', 
    '790,790,790,790,790,790,,790,790,,,790,790,,274,,,274,,,274,,,,,274', 
    '790,,790,274,790,790,790,790,790,790,790,274,790,,,,274,274,274,274', 
    '274,274,,,,274,274,,790,407,,,,,274,274,407,407,407,274,274,,407,407', 
    ',407,,,,,,,,,407,,,,,,,,,,407,407,,407,407,407,407,407,,,,,,,,,,,,,', 
    ',,,,,,,,407,407,407,407,407,407,407,407,407,407,407,407,407,407,,,407', 
    '407,407,,407,,,,407,,,,,,,407,,407,,407,407,407,407,407,407,407,,407', 
    '407,407,,,,,,,,,,,,,407,407,,407,,407,404,,,407,,407,,404,404,404,,', 
    '404,404,404,,404,,,,,,,,,404,404,404,,,,,,,,404,404,,404,404,404,404', 
    '404,,,,,,,,,,,,,,,,,,,,,,404,404,404,404,404,404,404,404,404,404,404', 
    '404,404,404,,,404,404,404,,,404,,404,404,,,404,,404,,404,,404,,404,404', 
    '404,404,404,404,404,,404,404,404,,,,,,,,,,,,,404,404,404,404,,404,757', 
    '757,757,,757,404,,,757,757,,,,757,,757,757,757,757,757,757,757,,,,,757', 
    '757,757,757,757,757,757,,,757,,,,,,,757,,,757,757,757,757,757,757,757', 
    '757,757,757,,757,757,,757,757,757,,,,,,,,,,,,,,,,,,,,757,,,757,,,757', 
    ',,,,,,,,757,,,,,,,,757,,,,,757,757,757,757,757,757,,,,757,757,,597,597', 
    '597,,597,,757,757,597,597,,757,757,597,,597,597,597,597,597,597,597', 
    ',,,,597,597,597,597,597,597,597,,,,,,,,,,597,,,597,597,597,597,597,597', 
    '597,597,597,597,,597,597,,597,597,597,,,,,,,,,,,,,,,,,,,,597,,,597,', 
    ',597,,,,,,,,,597,,,,,,,,597,,,,,597,597,597,597,597,597,,,,597,597,', 
    '598,598,598,598,598,,597,597,598,598,,597,597,598,,598,598,598,598,598', 
    '598,598,,,,,598,598,598,598,598,598,598,,,598,,,,,,598,598,598,598,598', 
    '598,598,598,598,598,598,598,598,598,,598,598,,598,598,598,,,,,,,,,,', 
    ',,,,,,,,,598,,,598,,,598,,,,,598,,,,598,,,,,,,,598,,,,,598,598,598,598', 
    '598,598,,,,598,598,,752,752,752,,752,,598,598,752,752,,598,598,752,', 
    '752,752,752,752,752,752,752,,,,,752,752,752,752,752,752,752,,,,,,,,', 
    ',752,,,752,752,752,752,752,752,752,752,752,752,,752,752,,,,752,,,,,', 
    ',,,,,,,,,,,,,,752,,,752,,,752,,,,,,,,,,,,,,,,,,,,,,752,752,752,752,752', 
    '752,,,,752,752,,599,599,599,,599,,752,752,599,599,,752,752,599,,599', 
    '599,599,599,599,599,599,,,,,599,599,599,599,599,599,599,,,,,,,,,,599', 
    ',,599,599,599,599,599,599,599,599,599,599,,599,599,,599,599,599,,,,', 
    ',,,,,,,,,,,,,,,599,,,599,,,599,,,,,,,,,599,,,,,,,,599,,,,,599,599,599', 
    '599,599,599,,,,599,599,,603,603,603,,603,,599,599,603,603,,599,599,603', 
    ',603,603,603,603,603,603,603,,,,,603,603,603,603,603,603,603,,,,,,,', 
    ',,603,,,603,603,603,603,603,603,603,603,603,603,,603,603,,603,603,603', 
    ',,,,,,,,,,,,,,,,,,,603,,,603,,,603,,,,,,,,,603,,,,,,,,603,,,,,603,603', 
    '603,603,603,603,,,,603,603,,748,748,748,748,748,,603,603,748,748,,603', 
    '603,748,,748,748,748,748,748,748,748,,,,,748,748,748,748,748,748,748', 
    ',,748,,,,,,748,748,748,748,748,748,748,748,748,748,748,748,748,748,', 
    '748,748,,748,748,748,,,,,,,,,,,,,,,,,,,,748,,,748,,,748,,,,,748,,,,748', 
    ',,,,,,,748,,,,,748,748,748,748,748,748,,,,748,748,,395,395,395,,395', 
    ',748,748,395,395,,748,748,395,,395,395,395,395,395,395,395,,,,,395,395', 
    '395,395,395,395,395,,,,,,,,,,395,,,395,395,395,395,395,395,395,395,395', 
    '395,,395,395,,395,395,395,,,,,,,,,,,,,,,,,,,,395,,,395,,,395,,,,,,,', 
    ',395,,,,,,,,395,,,,,395,395,395,395,395,395,,,,395,395,,613,613,613', 
    '613,613,,395,395,613,613,,395,395,613,,613,613,613,613,613,613,613,', 
    ',,,613,613,613,613,613,613,613,,,613,,,,,,613,613,613,613,613,613,613', 
    '613,613,613,613,613,613,613,,613,613,,613,613,613,,,,,,,,,,,,,,,,,,', 
    ',613,,,613,,,613,,,,,613,,,,613,,,,,,,,613,,,,,613,613,613,613,613,613', 
    ',,,613,613,,291,291,291,,291,,613,613,291,291,,613,613,291,,291,291', 
    '291,291,291,291,291,,,,,291,291,291,291,291,291,291,,,,,,,,,,291,,,291', 
    '291,291,291,291,291,291,291,291,291,,291,291,,291,291,291,,,,,,,,,,', 
    ',,,,,,,,,291,,,291,291,,291,,,,,,,,,291,,,,,,,,291,,,,,291,291,291,291', 
    '291,291,,,,291,291,,739,739,739,,739,,291,291,739,739,,291,291,739,', 
    '739,739,739,739,739,739,739,,,,,739,739,739,739,739,739,739,,,,,,,,', 
    ',739,,,739,739,739,739,739,739,739,739,739,739,,739,739,,739,739,739', 
    ',,,,,,,,,,,,,,,,,,,739,,,739,,,739,,,,,739,,739,,739,,,,,,,,739,,,,', 
    '739,739,739,739,739,739,,,,739,739,,737,737,737,,737,739,739,739,737', 
    '737,,739,739,737,,737,737,737,737,737,737,737,,,,,737,737,737,737,737', 
    '737,737,,,,,,,,,,737,,,737,737,737,737,737,737,737,737,737,737,,737', 
    '737,,737,737,737,,,,,,,,,,,,,,,,,,,,737,,,737,,,737,,,,,737,,737,,737', 
    ',,,,,,,737,,,,,737,737,737,737,737,737,,,,737,737,,619,619,619,,619', 
    '737,737,737,619,619,,737,737,619,,619,619,619,619,619,619,619,,,,,619', 
    '619,619,619,619,619,619,,,,,,,,,,619,,,619,619,619,619,619,619,619,619', 
    '619,619,,619,619,,619,619,619,,,,,,,,,,,,,,,,,,,,619,,,619,,,619,,,', 
    ',619,,619,,619,,,,,,,,619,,,,,619,619,619,619,619,619,,,,619,619,,728', 
    '728,728,,728,619,619,619,728,728,,619,619,728,,728,728,728,728,728,728', 
    '728,,,,,728,728,728,728,728,728,728,,,,,,,,,,728,,,728,728,728,728,728', 
    '728,728,728,728,728,,728,728,,728,728,728,,,,,,,,,,,,,,,,,,,,728,,,728', 
    ',,728,,,,,728,,728,,728,,,,,,,,728,,,,,728,728,728,728,728,728,,,,728', 
    '728,,623,623,623,,623,728,728,728,623,623,,728,728,623,,623,623,623', 
    '623,623,623,623,,,,,623,623,623,623,623,623,623,,,,,,,,,,623,,,623,623', 
    '623,623,623,623,623,623,623,623,,623,623,,623,623,623,,,,,,,,,,,,,,', 
    ',,,,,623,,,623,,,623,,,,,,,,,623,,,,,,,,623,,,,,623,623,623,623,623', 
    '623,,,,623,623,,722,722,722,,722,,623,623,722,722,,623,623,722,,722', 
    '722,722,722,722,722,722,,,,,722,722,722,722,722,722,722,,,,,,,,,,722', 
    ',,722,722,722,722,722,722,722,722,722,722,,722,722,,722,722,722,,,,', 
    ',,,,,,,,,,,,,,,722,,,722,,,722,,,,,,,,,722,,,,,,,,722,,,,,722,722,722', 
    '722,722,722,,,,722,722,,300,300,300,,300,,722,722,300,300,,722,722,300', 
    ',300,300,300,300,300,300,300,,,,,300,300,300,300,300,300,300,,,,,,,', 
    ',,300,,,300,300,300,300,300,300,300,300,300,300,,300,300,,300,300,300', 
    ',,,,,,,,,,,,,,,,,,,300,,,300,,,300,,,,,,,,,300,,,,,,,,300,,,,,300,300', 
    '300,300,300,300,,,,300,300,,721,721,721,,721,,300,300,721,721,,300,300', 
    '721,,721,721,721,721,721,721,721,,,,,721,721,721,721,721,721,721,,,', 
    ',,,,,,721,,,721,721,721,721,721,721,721,721,721,721,,721,721,,721,721', 
    '721,,,,,,,,,,,,,,,,,,,,721,,,721,,,721,,,,,,,,,721,,,,,,,,721,,,,,721', 
    '721,721,721,721,721,,,,721,721,,720,720,720,,720,,721,721,720,720,,721', 
    '721,720,,720,720,720,720,720,720,720,,,,,720,720,720,720,720,720,720', 
    ',,,,,,,,,720,,,720,720,720,720,720,720,720,720,720,720,,720,720,,720', 
    '720,720,,,,,,,,,,,,,,,,,,,,720,,,720,,,720,,,,,,,,,720,,,,,,,,720,,', 
    ',,720,720,720,720,720,720,,,,720,720,,354,354,354,,354,,720,720,354', 
    '354,,720,720,354,,354,354,354,354,354,354,354,,,,,354,354,354,354,354', 
    '354,354,,,354,,,,,,,354,,,354,354,354,354,354,354,354,354,354,354,,354', 
    '354,,354,354,354,,,,,,,,,,,,,,,,,,,,354,,,354,,,354,,,,,,,,,354,,,,', 
    ',,,354,,,,,354,354,354,354,354,354,,,,354,354,,492,492,492,,492,,354', 
    '354,492,492,,354,354,492,,492,492,492,492,492,492,492,,,,,492,492,492', 
    '492,492,492,492,,,,,,,,,,492,,,492,492,492,492,492,492,492,492,492,492', 
    ',492,492,,492,492,492,,,,,,,,,,,,,,,,,,,,492,,,492,,,492,,,,,,,,,492', 
    ',,,,,,,492,,,,,492,492,492,492,492,492,,,,492,492,,645,645,645,645,645', 
    ',492,492,645,645,,492,492,645,,645,645,645,645,645,645,645,,,,,645,645', 
    '645,645,645,645,645,,,645,,,,,,645,645,645,645,645,645,645,645,645,645', 
    '645,645,645,645,,645,645,,645,645,645,,,,,,,,,,,,,,,,,,,,645,,,645,', 
    ',645,,,,,645,,,,645,,,,,,,,645,,,,,645,645,645,645,645,645,,,,645,645', 
    ',651,651,651,,651,,645,645,651,651,,645,645,651,,651,651,651,651,651', 
    '651,651,,,,,651,651,651,651,651,651,651,,,,,,,,,,651,,,651,651,651,651', 
    '651,651,651,651,651,651,,651,651,,651,651,651,,,,,,,,,,,,,,,,,,,,651', 
    ',,651,,,651,,,,,,,,,651,,,,,,,,651,,,,,651,651,651,651,651,651,,,,651', 
    '651,,667,667,667,,667,,651,651,667,667,,651,651,667,,667,667,667,667', 
    '667,667,667,,,,,667,667,667,667,667,667,667,,,,,,,,,,667,,,667,667,667', 
    '667,667,667,667,667,667,667,,667,667,,667,667,667,,,,,,,,,,,,,,,,,,', 
    ',667,,,667,,,667,,,,,,,,,667,,,,,,,,667,,,,,667,667,667,667,667,667', 
    ',,,667,667,,310,310,310,,310,,667,667,310,310,,667,667,310,,310,310', 
    '310,310,310,310,310,,,,,310,310,310,310,310,310,310,,,310,,,,,,,310', 
    ',,310,310,310,310,310,310,310,310,310,310,,310,310,,310,310,310,,,,', 
    ',,,,,,,,,,,,,,,310,,,310,,,310,,,,,,,,,310,,,,,,,,310,,,,,310,310,310', 
    '310,310,310,,,,310,310,,311,311,311,,311,,310,310,311,311,,310,310,311', 
    ',311,311,311,311,311,311,311,,,,,311,311,311,311,311,311,311,,,311,', 
    ',,,,,311,,,311,311,311,311,311,311,311,311,311,311,,311,311,,311,311', 
    '311,,,,,,,,,,,,,,,,,,,,311,,,311,,,311,,,,,,,,,311,,,,,,,,311,,,,,311', 
    '311,311,311,311,311,,,,311,311,,668,668,668,,668,,311,311,668,668,,311', 
    '311,668,,668,668,668,668,668,668,668,,,,,668,668,668,668,668,668,668', 
    ',,668,,,,,,,668,,,668,668,668,668,668,668,668,668,668,668,,668,668,', 
    '668,668,668,,,,,,,,,,,,,,,,,,,,668,,,668,,,668,,,,,,,,,668,,,,,,,,668', 
    ',,,,668,668,668,668,668,668,,,,668,668,,710,710,710,,710,,668,668,710', 
    '710,,668,668,710,,710,710,710,710,710,710,710,,,,,710,710,710,710,710', 
    '710,710,,,,,,,,,,710,,,710,710,710,710,710,710,710,710,710,710,,710', 
    '710,,710,710,710,,,,,,,,,,,,,,,,,,,,710,,,710,,,710,,,,,,,,,710,,,,', 
    ',,,710,,,,,710,710,710,710,710,710,,,,710,710,,709,709,709,,709,,710', 
    '710,709,709,,710,710,709,,709,709,709,709,709,709,709,,,,,709,709,709', 
    '709,709,709,709,,,,,,,,,,709,,,709,709,709,709,709,709,709,709,709,709', 
    ',709,709,,709,709,709,,,,,,,,,,,,,,,,,,,,709,,,709,,,709,,,,,,,,,709', 
    ',,,,,,,709,,,,,709,709,709,709,709,709,,,,709,709,,342,342,342,342,342', 
    ',709,709,342,342,,709,709,342,,342,342,342,342,342,342,342,,,,,342,342', 
    '342,342,342,342,342,,,342,,,,,,342,342,342,342,342,342,342,342,342,342', 
    '342,342,342,342,,342,342,,342,342,342,,,,,,,,,,,,,,,,,,,,342,,,342,', 
    ',342,,,,,342,,,,342,,,,,,,,342,,,,,342,342,342,342,342,342,,,,342,342', 
    ',703,703,703,703,703,,342,342,703,703,,342,342,703,,703,703,703,703', 
    '703,703,703,,,,,703,703,703,703,703,703,703,,,703,,,,,,703,703,703,703', 
    '703,703,703,703,703,703,703,703,703,703,,703,703,,703,703,703,,,,,,', 
    ',,,,,,,,,,,,,703,,,703,,,703,,,,,703,,,,703,,,,,,,,703,,,,,703,703,703', 
    '703,703,703,,,,703,703,,340,340,340,,340,,703,703,340,340,,703,703,340', 
    ',340,340,340,340,340,340,340,,,,,340,340,340,340,340,340,340,,,340,', 
    ',,,,,340,,,340,340,340,340,340,340,340,340,340,340,,340,340,,340,340', 
    '340,,,,,,,,,,,,,,,,,,,,340,,,340,,,340,,,,,,,,,340,,,,,,,,340,,,,,340', 
    '340,340,340,340,340,,,,340,340,,695,695,695,,695,,340,340,695,695,,340', 
    '340,695,,695,695,695,695,695,695,695,,,,,695,695,695,695,695,695,695', 
    ',,,,,,,,,695,,,695,695,695,695,695,695,695,695,695,695,,695,695,,695', 
    '695,695,,,,,,,,,,,,,,,,,,,,695,,,695,,,695,,,,,,,,,695,,,,,,,,695,,', 
    ',,695,695,695,695,695,695,,,,695,695,,227,227,227,,227,,695,695,227', 
    '227,,695,695,227,,227,227,227,227,227,227,227,,,,,227,227,227,227,227', 
    '227,227,,,,,,,,,,227,,,227,227,227,227,227,227,227,227,227,227,,227', 
    '227,,227,227,227,449,449,449,449,449,449,449,449,449,449,449,,449,449', 
    ',,449,449,,227,,,227,,,227,,,,,,449,,449,227,449,449,449,449,449,449', 
    '449,227,449,,,,227,227,227,227,227,227,,,,227,227,,449,449,,,,,227,227', 
    ',,,227,227,63,63,63,63,63,63,63,63,,,63,63,63,63,63,,,63,63,63,63,63', 
    '63,63,,,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63', 
    '63,63,63,63,63,63,63,,,,,,,63,63,,63,63,63,63,63,63,63,,,63,,,,,63,63', 
    '63,63,,,,,,63,,,,,,,63,63,,63,63,63,63,63,63,63,63,63,63,63,460,,63', 
    ',,,,460,460,460,,463,460,460,460,,460,,463,463,463,63,63,463,463,463', 
    '460,463,,,,,,,,460,460,463,460,460,460,460,460,,,,463,463,,463,463,463', 
    '463,463,,,,,,,,,,,,,,,,,,,,,,460,,,,,,,460,,,,463,460,460,,,,,463,,', 
    ',,463,463,,,,,,,,,,460,,,,,,,,,,,463,,460,,460,,,460,,,,,,463,,463,', 
    ',463,6,6,6,6,6,6,6,6,,,6,6,6,6,6,,,6,6,6,6,6,6,6,,,6,6,6,6,6,6,6,6,6', 
    '6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,,6,,,,,,,,6,6,,6,6,6,6,6,6,6,,,6,,,,,6', 
    '6,6,6,,,,,,,,,,,,,6,6,,6,6,6,6,6,6,6,6,6,6,6,,,6,6,108,108,108,108,108', 
    '108,108,108,,6,108,108,108,108,108,,,108,108,108,108,108,108,108,,,108', 
    '108,108,108,108,108,108,108,108,108,108,108,108,108,108,108,108,108', 
    '108,108,108,108,108,,,108,,,,,,,,108,108,,108,108,108,108,108,108,108', 
    ',,108,,,,,108,108,108,108,,,,,,,,,,,,,108,108,,108,108,108,108,108,108', 
    '108,108,108,108,108,,,108,108,7,7,7,7,7,7,7,7,,108,7,7,7,7,7,,,7,7,7', 
    '7,7,7,7,,,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,,,7,,,,,,,,7', 
    '7,,7,7,7,7,7,7,7,,,7,,,,,7,7,7,7,,,,,,,,,,,,,7,7,,7,7,7,7,7,7,7,7,7', 
    '7,7,,,7,7,387,387,387,387,387,387,387,387,,7,387,387,387,387,387,,,387', 
    '387,387,387,387,387,387,,,387,387,387,387,387,387,387,387,387,387,387', 
    '387,387,387,387,387,387,387,387,387,387,387,387,,,387,,,,,,,,387,387', 
    ',387,387,387,387,387,387,387,,,387,,,,,387,387,387,387,,,,,,,,,,,,,387', 
    '387,,387,387,387,387,387,387,387,387,387,387,387,,,387,387,186,186,186', 
    '186,186,186,186,186,,387,186,186,186,186,186,,,186,186,186,186,186,186', 
    '186,,,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186', 
    '186,186,186,186,186,186,186,186,186,186,186,,,,,,,186,186,,186,186,186', 
    '186,186,186,186,,,186,,,,,186,186,186,186,,,,,,,,,,,,,186,186,,186,186', 
    '186,186,186,186,186,186,186,186,186,,,186,77,77,77,77,77,77,77,77,,', 
    '77,77,77,77,77,,,77,77,77,77,77,77,77,,,77,77,77,77,77,77,77,77,77,77', 
    '77,77,77,77,77,77,77,77,77,77,77,77,77,77,77,77,77,,,,,,,77,77,,77,77', 
    '77,77,77,77,77,,,77,,,,,77,77,77,77,,,,,,,,,,,,,77,77,,77,77,77,77,77', 
    '77,77,77,77,77,77,,,77,554,554,554,554,554,554,554,554,,,554,554,554', 
    '554,554,,,554,554,554,554,554,554,554,,,554,554,554,554,554,554,554', 
    '554,554,554,554,554,554,554,554,554,554,554,554,554,554,554,554,,,554', 
    ',,,,,,,554,554,,554,554,554,554,554,554,554,,,554,,,,,554,554,554,554', 
    ',,,,,,,,,,,,554,554,,554,554,554,554,554,554,554,554,554,554,554,841', 
    '841,554,,841,,,,,,,,841,841,,841,841,841,841,841,841,841,,,841,,,,,841', 
    '841,841,841,,,,,,,,,,,,,841,841,,841,841,841,841,841,841,841,841,841', 
    '841,841,536,536,841,,536,,,,,,,,536,536,,536,536,536,536,536,536,536', 
    ',,536,,,,,536,536,536,536,,,,,,,,,,,,,536,536,,536,536,536,536,536,536', 
    '536,536,536,536,536,538,538,536,,538,,,,,,,,538,538,,538,538,538,538', 
    '538,538,538,,,538,,,,,538,538,538,538,,,,,,,,,,,,,538,538,,538,538,538', 
    '538,538,538,538,538,538,538,538,617,617,538,,617,,,,,,,,617,617,,617', 
    '617,617,617,617,617,617,,,617,,,,,617,617,617,617,,,,,,,,,,,,,617,617', 
    ',617,617,617,617,617,617,617,617,617,617,617,618,618,617,,618,,,,,,', 
    ',618,618,,618,618,618,618,618,618,618,,,618,,,,,618,618,618,618,,,,', 
    ',,,,,,,,618,618,,618,618,618,618,618,618,618,618,618,618,618,493,493', 
    '618,,493,,,,,,,,493,493,,493,493,493,493,493,493,493,,,493,,,,,493,493', 
    '493,493,,,,,,,,,,,,,493,493,,493,493,493,493,493,493,493,493,493,493', 
    '493,771,771,493,,771,,,,,,,,771,771,,771,771,771,771,771,771,771,,,771', 
    ',,,,771,771,771,771,,,,,,,,,,,,,771,771,,771,771,771,771,771,771,771', 
    '771,771,771,771,494,494,771,,494,,,,,,,,494,494,,494,494,494,494,494', 
    '494,494,,,494,,,,,494,494,494,494,,,,,,,,,,,,,494,494,,494,494,494,494', 
    '494,494,494,494,494,494,494,417,417,494,,417,,,,,,,,417,417,,417,417', 
    '417,417,417,417,417,,,417,,,,,417,417,417,417,,,,,,,,,,,,,417,417,,417', 
    '417,417,417,417,417,417,417,417,417,417,418,418,417,,418,,,,,,,,418', 
    '418,,418,418,418,418,418,418,418,,,418,,,,,418,418,418,418,,,,,,,,,', 
    ',,,418,418,,418,418,418,418,418,418,418,418,418,418,418,256,256,418', 
    ',256,,,,,,,,256,256,,256,256,256,256,256,256,256,,,256,,,,,256,256,256', 
    '256,,,,,,,,,,,,,256,256,,256,256,256,256,256,256,256,256,256,256,256', 
    '255,255,256,,255,,,,,,,,255,255,,255,255,255,255,255,255,255,,,255,', 
    ',,,255,255,255,255,,,,,,,,,,,,,255,255,,255,255,255,255,255,255,255', 
    '255,255,255,255,488,488,255,,488,,,,,,,,488,488,,488,488,488,488,488', 
    '488,488,,,488,,,,,488,488,488,488,,,,,,,,,,,,,488,488,,488,488,488,488', 
    '488,488,488,488,488,488,488,840,840,488,,840,,,,,,,,840,840,,840,840', 
    '840,840,840,840,840,,,840,,,,,840,840,840,840,,,,,,,,,,,,,840,840,,840', 
    '840,840,840,840,840,840,840,840,840,840,489,489,840,,489,,,,,,,,489', 
    '489,,489,489,489,489,489,489,489,,,489,,,,,489,489,489,489,,,,,,,,,', 
    ',,,489,489,,489,489,489,489,489,489,489,489,489,489,489,196,196,489', 
    ',196,,,,,,,,196,196,,196,196,196,196,196,196,196,,,196,,,,,196,196,196', 
    '196,,,,,,,,,,,,,196,196,,196,196,196,196,196,196,196,196,196,196,196', 
    '195,195,196,,195,,,,,,,,195,195,,195,195,195,195,195,195,195,,,195,', 
    ',,,195,195,195,195,,,,,,,,,,,,,195,195,,195,195,195,195,195,195,195', 
    '195,195,195,195,,,195,414,414,414,414,414,414,414,414,414,414,414,,414', 
    '414,,,414,414,,,,,,,,,,,,,,414,,414,,414,414,414,414,414,414,414,,414', 
    '712,712,712,712,712,712,712,712,712,712,712,,712,712,,414,712,712,,', 
    ',,,,,,,,,,,712,,712,,712,712,712,712,712,712,712,,712,714,714,714,714', 
    '714,714,714,714,714,714,714,,714,714,,712,714,714,,,,,,,,,,,,,,714,', 
    '714,,714,714,714,714,714,714,714,,714,641,641,641,641,641,641,641,641', 
    '641,641,641,,641,641,,714,641,641,,,,,,,,,,,,,,641,,641,,641,641,641', 
    '641,641,641,641,,641,495,495,495,495,495,495,495,495,495,495,495,,495', 
    '495,,641,495,495,,,,,,,,,,,,,,495,,495,,495,495,495,495,495,495,495', 
    ',495,754,754,754,754,754,754,754,754,754,754,754,,754,754,,495,754,754', 
    ',,,,,,,,,,,,,754,,754,,754,754,754,754,754,754,754,,754,400,400,400', 
    '400,400,400,400,400,400,400,400,,400,400,754,754,400,400,,,,,,,,,,,', 
    ',,400,,400,,400,400,400,400,400,400,400,,400,717,717,717,717,717,717', 
    '717,717,717,717,717,,717,717,,400,717,717,,,,,,,,,,,,,,717,,717,,717', 
    '717,717,717,717,717,717,,717,724,724,724,724,724,724,724,724,724,724', 
    '724,,724,724,,717,724,724,,,,,,,,,,,,,,724,,724,,724,724,724,724,724', 
    '724,724,,724,719,719,719,719,719,719,719,719,719,719,719,,719,719,,724', 
    '719,719,,,,,,,,,,,,,,719,,719,,719,719,719,719,719,719,719,,719,,,,', 
    ',,,,,,,,,,,719'];
    racc_action_check = arr = $cg(self, 'Array').m$new(23133, nil);
    idx = 0;
    (__a = clist, $B.f = __a.m$each, ($B.p =function(str) { var self = this; var __a, __b;
      return (__a = str.m$split(',', -1), $B.f = __a.m$each, ($B.p =function(i) { var self = this; var __a;
        if(!((__a = i['m$empty?'](), __a !== false && __a !== nil))) {arr['m$[]='](idx, i.m$to_i())};
        return idx = idx['m$+'](1);
      }).$self=self, $B.f).call(__a);
    }).$self=self, $B.f).call(__a);

    racc_action_pointer = [
    -2, 946, nil, 125, nil, 724, 20905, 21125, 819, 818, 
    794, 793, 838, 443, 197, 554, nil, 1692, 1813, 5345, 
    890, nil, 2176, 2297, 2418, 257, -2, 2784, 2912, nil, 
    3038, 3159, 3280, nil, 790, 439, 860, 3764, 3885, 4006, 
    788, 268, nil, nil, nil, nil, nil, nil, nil, 4372, 
    4498, 4619, 4740, 4861, -19, 5103, 5224, nil, nil, 5345, 
    1017, 5588, 5709, 20660, nil, nil, nil, nil, nil, -42, 
    nil, nil, nil, nil, nil, -114, 762, 21454, nil, nil, 
    nil, 299, 6559, nil, nil, 6687, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, 880, nil, 6940, 
    nil, nil, nil, 7062, 7183, 7304, 7425, 7546, 21015, 375, 
    nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, 21345, 727, nil, 8151, 
    8272, 8393, 8514, 8635, 8756, 22566, 22507, 9119, 9240, 9361, 
    nil, 389, 95, 793, 202, 710, 748, 10216, nil, nil, 
    10337, 10458, 10579, 10700, 10821, 10942, 11063, 11184, 11305, 11426, 
    11547, 11668, 11789, 11910, 12031, 12152, 12273, 20526, 12515, 12636, 
    12757, 12878, 12999, 13120, 13241, 13362, 13483, nil, nil, nil, 
    14937, nil, 706, 700, 13967, nil, 14088, 736, nil, nil, 
    nil, nil, 14330, nil, nil, 22271, 22212, 719, 14816, 14937, 
    nil, nil, 92, 313, nil, nil, nil, 15308, 720, 15550, 
    718, 717, 679, 16034, 16155, 325, 321, 740, 265, 704, 
    667, 68, nil, 701, nil, nil, 196, 203, nil, 696, 
    nil, 17622, nil, 729, 722, 2, nil, 589, 157, 175, 
    18469, 607, -59, 586, nil, 102, nil, 273, 82, 68, 
    19437, 19558, 447, 303, 558, 659, nil, 555, 553, 542, 
    nil, nil, 532, nil, nil, nil, nil, nil, nil, nil, 
    611, nil, nil, 570, 361, 539, nil, 374, nil, 4, 
    20284, nil, 20042, 485, -7, 360, 477, 473, 386, 405, 
    476, 2846, 364, nil, 18832, nil, 101, nil, -2, nil, 
    207, -54, 188, nil, 783, -43, nil, 104, nil, nil, 
    nil, nil, nil, nil, nil, nil, 760, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, nil, 21235, 48, 84, 
    nil, nil, 2660, nil, 131, 17380, nil, 220, nil, nil, 
    22877, 437, 320, 425, 16407, nil, nil, 16279, 452, 15182, 
    nil, 15061, 14690, nil, 22613, nil, nil, 22094, 22153, 14566, 
    60, 13846, 13604, 9611, 1813, 1450, -28, 338, 626, 627, 
    629, 632, 3273, 3155, 3163, 1692, 1934, 1571, 2865, 2539, 
    2418, 2297, 2176, 2055, 1208, 575, 695, 3038, 1329, 20526, 
    272, nil, 4248, nil, nil, 3522, 718, nil, 2660, nil, 
    20768, nil, nil, 20779, 355, nil, 773, 762, 154, 780, 
    889, nil, nil, 845, nil, 533, nil, 724, 603, 832, 
    nil, 841, 815, nil, nil, nil, 856, 240, 22330, 22448, 
    471, 798, 18953, 21917, 22035, 22789, 482, 904, 966, nil, 
    826, nil, nil, 1087, nil, nil, 1329, 6940, nil, 1934, 
    nil, nil, nil, 2539, 838, nil, nil, 3401, 38, -19, 
    795, 800, 4982, 5467, nil, 896, nil, 732, nil, nil, 
    356, 5830, nil, nil, 132, nil, 21681, 6072, 21740, 6193, 
    nil, 6314, 450, -25, 775, 6819, 654, 435, 597, 577, 
    575, nil, 568, nil, 21563, nil, nil, -2, nil, nil, 
    nil, 617, nil, nil, nil, nil, nil, nil, -35, nil, 
    nil, nil, 568, nil, nil, nil, nil, 7667, 7788, nil, 
    557, 7909, 8030, 522, nil, nil, nil, 8877, 490, nil, 
    8998, 182, 110, 9485, 14440, 456, 4248, 16654, 16775, 17017, 
    304, nil, 302, 17138, nil, 246, nil, 222, nil, nil, 
    nil, nil, nil, 17501, nil, 140, 111, 21799, 21858, 17985, 
    6435, -46, -85, 18227, nil, nil, -19, nil, -15, 26, 
    134, nil, -26, nil, 96, 309, 189, 116, 556, 255, 
    196, 22745, -11, 327, nil, 19074, 224, 288, nil, nil, 
    nil, 19195, nil, nil, 452, nil, 427, nil, nil, nil, 
    nil, nil, 453, nil, 469, 373, 74, 19316, 19679, 438, 
    448, nil, nil, 454, nil, 450, 346, 538, 467, nil, 
    512, 510, 601, 439, nil, 12394, nil, 633, 523, nil, 
    1138, nil, 962, nil, nil, 20405, 2750, 591, nil, nil, 
    nil, nil, nil, 20163, nil, nil, nil, 14566, 559, 19921, 
    19800, nil, 22657, nil, 22701, nil, nil, 22921, nil, 23009, 
    18711, 18590, 18348, 14, 22965, 695, 585, nil, 18106, 587, 
    604, nil, nil, 633, 634, 284, 698, 17864, nil, 17743, 
    615, nil, nil, nil, nil, 13, nil, nil, 17259, nil, 
    nil, 62, 16896, nil, 22833, 783, nil, 16533, 794, 15913, 
    15792, nil, nil, 15671, 15429, nil, 32, 841, nil, nil, 
    nil, 21976, nil, nil, nil, nil, 805, nil, 727, 691, 
    692, 694, 689, nil, nil, 14209, nil, 714, nil, nil, 
    16155, 13725, nil, nil, 10095, nil, nil, 745, 709, nil, 
    9974, 717, 9853, nil, nil, 9732, 350, 445, 804, 442, 
    nil, nil, nil, 88, nil, 872, 874, 6435, 492, nil, 
    761, 800, nil, nil, 775, nil, nil, nil, 882, nil, 
    9361, nil, nil, 5951, 784, nil, 4127, 786, 905, 3643, 
    22389, 21622, 388, 2055, nil, nil, nil, nil, nil, nil, 
    1571, nil, 794, nil, nil, 1450, 796, nil, 1208, nil, 
    nil, 832, 89, 61, 188, 229, 224, 921, nil, 807, 
    nil, 361, 817, 266, nil, nil, nil, 119, nil, 827, 
    nil];

    racc_action_default = [
    -485, -487, -1, -474, -4, -5, -487, -487, -487, -487, 
    -487, -487, -487, -487, -263, -30, -31, -487, -487, -36, 
    -38, -39, -273, -300, -301, -43, -243, -243, -243, -55, 
    -485, -59, -64, -65, -487, -416, -487, -487, -487, -487, 
    -476, -208, -256, -257, -258, -259, -260, -261, -262, -464, 
    -485, -487, -485, -485, -279, -487, -487, -283, -286, -474, 
    -487, -487, -487, -487, -302, -303, -360, -361, -362, -363, 
    -364, -485, -367, -485, -485, -485, -485, -485, -393, -399, 
    -400, -487, -462, -404, -405, -463, -407, -408, -409, -410, 
    -411, -412, -413, -414, -415, -418, -419, -487, -3, -475, 
    -481, -482, -483, -487, -487, -487, -487, -487, -487, -487, 
    -89, -90, -91, -92, -93, -94, -95, -98, -99, -100, 
    -101, -102, -103, -104, -105, -106, -107, -108, -109, -110, 
    -111, -112, -113, -114, -115, -116, -117, -118, -119, -120, 
    -121, -122, -123, -124, -125, -126, -127, -128, -129, -130, 
    -131, -132, -133, -134, -135, -136, -137, -138, -139, -140, 
    -141, -142, -143, -144, -145, -146, -147, -148, -149, -150, 
    -151, -152, -153, -154, -155, -156, -157, -158, -159, -160, 
    -161, -162, -163, -164, -165, -166, -487, -11, -96, -485, 
    -485, -487, -487, -487, -485, -487, -487, -487, -487, -487, 
    -34, -487, -416, -487, -263, -487, -487, -485, -35, -200, 
    -487, -487, -487, -487, -487, -487, -487, -487, -487, -487, 
    -487, -487, -487, -487, -487, -487, -487, -487, -487, -487, 
    -487, -487, -487, -487, -487, -487, -487, -332, -334, -40, 
    -209, -222, -486, -486, -487, -230, -487, -251, -273, -300, 
    -301, -458, -487, -41, -42, -487, -487, -47, -485, -487, 
    -278, -337, -485, -485, -53, -341, -54, -487, -55, -485, 
    -487, -487, -60, -62, -485, -69, -487, -487, -76, -276, 
    -476, -487, -304, -342, -63, -67, -269, -487, -185, -186, 
    -201, -487, -477, -352, -487, -476, -210, -476, -478, -478, 
    -487, -487, -478, -487, -455, -478, -280, -37, -487, -487, 
    -487, -487, -474, -487, -475, -487, -316, -452, -452, -452, 
    -324, -325, -438, -434, -435, -436, -437, -439, -444, -445, 
    -447, -448, -449, -487, -85, -487, -87, -487, -263, -487, 
    -487, -416, -485, -89, -90, -126, -127, -143, -148, -155, 
    -158, -433, -487, -453, -487, -365, -487, -380, -487, -382, 
    -487, -487, -487, -372, -487, -487, -378, -487, -392, -394, 
    -395, -396, -397, -401, -402, 881, -6, -484, -12, -13, 
    -14, -15, -16, -7, -8, -9, -10, -487, -487, -487, 
    -19, -27, -167, -251, -487, -487, -20, -28, -29, -21, 
    -169, -487, -465, -466, -243, -467, -468, -465, -243, -466, 
    -340, -467, -468, -26, -176, -32, -33, -487, -487, -485, 
    -269, -487, -487, -487, -177, -178, -179, -180, -181, -182, 
    -183, -184, -187, -188, -189, -190, -191, -192, -193, -194, 
    -195, -196, -197, -198, -199, -202, -203, -204, -205, -487, 
    -485, -223, -487, -250, -225, -487, -486, -248, -487, -461, 
    -243, -465, -466, -243, -485, -48, -487, -476, -476, -486, 
    -222, -244, -245, -487, -328, -487, -330, -485, -485, -487, 
    -275, -487, -56, -267, -68, -61, -487, -485, -487, -487, 
    -75, -487, -487, -487, -487, -206, -487, -485, -485, -265, 
    -487, -211, -212, -480, -479, -214, -480, -476, -271, -480, 
    -457, -272, -456, -485, -305, -306, -307, -485, -487, -487, 
    -487, -487, -485, -487, -292, -487, -320, -487, -322, -323, 
    -487, -487, -446, -450, -85, -86, -487, -485, -487, -485, 
    -420, -487, -487, -487, -487, -485, -433, -487, -452, -452, 
    -452, -432, -438, -442, -487, -472, -473, -476, -366, -381, 
    -384, -487, -386, -368, -383, -369, -370, -371, -487, -374, 
    -376, -377, -487, -398, -97, -17, -18, -487, -487, -255, 
    -270, -487, -487, -49, -220, -221, -338, -487, -51, -339, 
    -487, -465, -466, -465, -466, -487, -167, -487, -485, -487, 
    -486, -249, -252, -487, -459, -487, -229, -487, -460, -44, 
    -335, -45, -336, -485, -216, -487, -487, -487, -487, -487, 
    -36, -487, -486, -487, -242, -246, -487, -329, -487, -487, 
    -487, -274, -56, -66, -487, -465, -466, -485, -469, -74, 
    -487, -175, -487, -485, -314, -485, -353, -485, -354, -355, 
    -266, -487, -252, -215, -485, -308, -485, -284, -309, -310, 
    -311, -287, -487, -290, -487, -346, -487, -487, -487, -452, 
    -452, -440, -451, -452, -326, -487, -327, -487, -85, -88, 
    -469, -487, -487, -487, -422, -485, -297, -487, -476, -424, 
    -487, -428, -487, -430, -431, -487, -433, -487, -385, -388, 
    -389, -390, -391, -485, -373, -375, -379, -168, -253, -487, 
    -487, -23, -171, -24, -172, -50, -25, -173, -52, -174, 
    -487, -487, -487, -270, -207, -487, -486, -227, -487, -486, 
    -487, -217, -218, -485, -485, -476, -487, -487, -235, -487, 
    -486, -247, -331, -343, -344, -70, -277, -2, -485, -359, 
    -315, -487, -487, -357, -476, -487, -312, -487, -487, -485, 
    -485, -289, -291, -487, -485, -348, -487, -487, -318, -319, 
    -321, -487, -269, -270, -295, -421, -487, -298, -487, -452, 
    -452, -452, -487, -443, -441, -485, -454, -487, -254, -22, 
    -170, -487, -333, -224, -487, -226, -46, -487, -486, -232, 
    -487, -486, -487, -241, -358, -485, -77, -487, -487, -84, 
    -356, -213, -281, -487, -282, -487, -487, -487, -485, -293, 
    -452, -268, -296, -423, -487, -426, -427, -429, -487, -387, 
    -486, -219, -231, -487, -486, -237, -487, -486, -352, -485, 
    -487, -487, -83, -485, -285, -288, -347, -345, -349, -350, 
    -485, -317, -452, -299, -228, -487, -486, -233, -487, -236, 
    -351, -487, -465, -466, -469, -82, -485, -487, -425, -486, 
    -238, -487, -486, -78, -313, -294, -234, -487, -239, -486, 
    -240];

    clist = [
    '209,468,261,265,240,240,240,294,315,497,241,241,241,317,301,299,305', 
    '108,188,288,289,290,545,282,282,245,245,245,98,465,521,10,116,116,240', 
    '240,319,284,513,517,297,391,398,320,604,113,113,674,308,309,102,755', 
    '312,282,282,535,783,208,671,610,376,10,612,669,351,657,661,352,382,554', 
    '239,253,254,242,242,242,339,342,369,310,559,10,759,268,313,643,569,270', 
    '311,477,478,760,668,850,187,604,378,379,380,381,539,99,113,272,302,747', 
    '102,306,502,505,450,291,510,358,360,512,113,367,666,383,847,647,751', 
    '404,408,355,356,303,362,568,10,353,365,698,116,703,688,779,10,471,2', 
    '626,1,,,,,113,,,,,,,,,401,299,,,,,,,,,,,,,271,,,392,240,400,240,,,414', 
    ',,297,460,463,,,369,783,,,,209,424,425,426,427,428,429,430,431,432,433', 
    '434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,,10', 
    '10,,671,,113,240,,240,,390,396,399,,240,412,413,662,10,,240,240,394', 
    '394,758,,470,241,,240,,,,,,241,679,261,35,265,,245,245,874,,282,,,,', 
    '245,,,495,257,264,266,598,485,,,,507,,526,528,529,674,35,275,275,613', 
    '705,,,,,,,544,10,,200,518,519,10,467,472,35,469,242,,,819,,479,,604', 
    '242,341,341,341,268,,,,481,268,604,388,389,486,610,612,551,,295,520', 
    ',,307,307,,,307,404,408,271,648,,,491,,,,715,,35,,102,718,,735,,,35', 
    '500,785,501,,,,,10,,,,240,,,,595,299,,589,,540,,307,307,307,307,,,,', 
    '764,,574,,,240,,414,596,400,848,297,,271,,,,116,271,600,637,,,,,637', 
    ',628,,604,113,,317,,,,,,240,,622,240,,,240,,,,,,,35,35,634,299,319,', 
    ',,620,,412,320,,604,,,,,35,637,,,240,,,,,641,297,624,,,,240,805,,415', 
    '416,240,,,240,,,240,12,,,,682,,,681,299,670,687,673,,240,,,10,10,,,', 
    ',,691,693,694,,240,,,12,282,,297,,35,412,551,,275,35,412,683,849,,,615', 
    '616,,,12,843,10,733,734,,10,394,,,,10,860,696,,,,707,240,,,712,714,658', 
    '658,,,717,10,,719,,665,412,10,,653,724,,240,600,,,240,,,,684,685,12', 
    ',113,689,307,307,,,12,35,240,,,,240,,736,,,,,,,,,589,629,630,,711,713', 
    ',,,543,716,,697,10,,,,754,,,768,769,,557,770,,776,,10,,,,,240,,,583', 
    '654,,,588,656,,,,766,664,,,14,780,,781,,,,,,,,10,240,,551,,12,12,,,', 
    ',,,454,,240,790,,,14,278,278,,12,801,,712,714,717,,,,609,,240,611,,', 
    ',14,10,,,240,,240,,,,,338,338,,,775,,,,10,35,35,,725,,799,,828,820,282', 
    '240,825,826,827,789,813,,,730,,,,,295,778,,12,,,14,,12,,637,,,35,14', 
    '790,,35,830,,,10,35,642,240,810,240,750,,851,798,341,10,10,,,,10,856', 
    '35,,240,852,861,299,35,,,797,,,,412,,,658,,240,10,,240,868,,240,,,,811', 
    '307,297,,,,,,,12,,10,240,,,240,,,787,,,,,,,,,,240,14,14,35,,,240,26', 
    ',,,,,,,,,,35,14,,10,,,26,26,,412,10,26,26,26,,,,804,,26,,,,,,,,,815', 
    '816,,606,35,818,,,,,,26,26,26,,,26,26,,,26,,,,,,,,,,,,,,,14,,,,278,14', 
    ',,,35,,838,,,,,,,,307,,,,,,26,,35,,26,26,26,26,26,,12,12,,,,,,,,,,,', 
    ',866,,,,,,,867,,,,,,,,,,,,,,,12,35,14,,12,806,296,304,,12,,,35,35,,', 
    ',35,,,,,,,,357,12,359,359,363,366,359,12,,,,,307,35,,,727,,,26,26,26', 
    '26,26,26,,,26,26,26,,,,35,,,,26,738,,,,,,,,,,,,,,,,,,,,,,12,,,,,,,,', 
    ',,35,,,,12,,,35,,,,,,,,,,26,26,,,,,,,,26,,26,,,,,26,,,12,,,,,14,14,', 
    ',,,,,,,,296,,,,,,,,,,,,,,,,,26,26,793,,,795,,12,14,,,,14,,,,803,14,', 
    ',,,,,,12,338,,,,26,,26,,14,,,,,,14,,,,26,,,466,,,,474,474,,,,702,,,', 
    ',,,,,,,,,,12,,,,832,,,835,,,,12,12,,,,12,,,,,,,14,,,,,,,,,,,,,854,12', 
    '14,26,857,,,859,,,,,,,,,,,,,,12,,,,,870,,,,,,,,14,,,,,876,,,878,,,,', 
    ',,880,,,,,,,,26,,12,,26,26,,,,12,393,397,,,26,,,14,,,,,,26,,,,,,,584', 
    ',,,,14,,,,,26,,,,26,296,,,,26,,,,,,,,,,,,,,456,26,457,26,,26,,,459,26', 
    ',,,474,,,,14,,,,809,,584,,,584,474,14,14,,,,14,,,,,,,,,,,,26,26,,,,296', 
    '26,,,14,,,,,,644,649,26,,,,,,,,,,,,14,,,26,,,,,,26,13,,,,,,,,,,,,,,', 
    ',296,201,201,,,,201,201,201,26,,,14,,13,276,276,,,14,,,,,,,,,,,,,26', 
    ',13,201,201,,,201,201,,,201,,337,337,,,26,,579,,,,,,,,,,,,,,,,26,,,', 
    ',,,26,,,,,,,,,13,,,,201,201,201,201,13,,,,,,,,,584,,,,,,749,,602,,753', 
    '605,26,,608,,,644,,644,,26,,26,26,,,,26,621,,,,,,,,,,,,,,,,,,,,26,,', 
    ',,646,,,,,652,,,605,,,652,,,,26,,,,13,13,201,201,201,201,393,,201,201', 
    '201,,,,,,,,13,,,,,584,584,,,,,,26,,,,26,,,,,,,26,,,,,,,,,,,,,,,,,,,', 
    '708,,,,,,,,201,201,,,,,,,,201,,13,,726,,276,13,729,,,,,,,,,,,,,,,,602', 
    ',,,740,,644,,,,,,,,,,,,,201,201,,,,,,,296,,,,,,,,,,,,,,,,,,,,,765,201', 
    ',13,,,644,,,,,,,,,201,,,,,,,,,,,,,784,,,,,,,,,,,,,,788,,,,,,,,,,,,,', 
    ',,,,,605,,,,,,,,,,,605,,,,,,,,201,,,,,,,,,,,,,,,,652,,,,,,,,,,,,,,,', 
    ',,,,,,,,,,,,,,,,,,,,,834,201,837,,,13,13,,,,,,,,,201,,846,,,,,,,201', 
    ',,,,,,,,602,,,605,,,,,13,,,,13,,,,,13,,,,,869,,,872,676,,,,,,201,,13', 
    ',201,,605,,13,,,,879,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,201,201,,,,,201', 
    ',,,,,,,,,,13,,,,,,,,,,,,,,,13,,,,,,201,,,,,,,,,,,,,,,,,,,,,,,,,,13,', 
    ',,,,,,,,,,,,,,,,,,,,,201,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,13,,,,', 
    ',,201,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,13,,,,807,,,,,201,,13,13', 
    ',,,13,,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,', 
    ',,,,,,,,,,,,,,,,201,,,,13,,,,,,,13'];
    racc_goto_table = arr = $cg(self, 'Array').m$new(2331, nil);
    idx = 0;
    (__a = clist, $B.f = __a.m$each, ($B.p =function(str) { var self = this; var __a, __b;
      return (__a = str.m$split(',', -1), $B.f = __a.m$each, ($B.p =function(i) { var self = this; var __a;
        if(!((__a = i['m$empty?'](), __a !== false && __a !== nil))) {arr['m$[]='](idx, i.m$to_i())};
        return idx = idx['m$+'](1);
      }).$self=self, $B.f).call(__a);
    }).$self=self, $B.f).call(__a);

    clist = [
    '25,29,52,52,25,25,25,3,74,4,26,26,26,87,20,51,51,12,12,25,25,25,77,48', 
    '48,55,55,55,8,32,73,15,46,46,25,25,89,39,70,70,26,22,22,91,119,44,44', 
    '92,14,14,76,71,14,48,48,41,116,16,115,53,10,15,53,88,43,72,72,78,10', 
    '79,28,28,28,49,49,49,42,42,43,80,108,15,81,35,8,5,108,36,82,33,33,83', 
    '84,85,13,119,14,14,14,14,75,11,44,38,49,6,76,68,50,50,94,47,50,105,105', 
    '50,44,105,96,12,97,98,99,30,30,103,104,67,106,107,15,66,109,110,46,111', 
    '113,114,15,57,2,56,1,,,,,44,,,,,,,,,20,51,,,,,,,,,,,,,2,,,25,25,25,25', 
    ',,25,,,26,30,30,,,43,116,,,,25,25,25,25,25,25,25,25,25,25,25,25,25,25', 
    '25,25,25,25,25,25,25,25,25,25,25,25,25,,15,15,,115,,44,25,,25,,16,16', 
    '16,,25,44,16,73,15,,25,25,49,49,5,,26,26,,25,,,,,,26,41,52,40,52,,55', 
    '55,71,,48,,,,,55,,,25,31,31,31,33,39,,,,25,,90,90,90,92,40,40,40,33', 
    '108,,,,,,,3,15,,24,14,14,15,28,28,40,49,49,,,72,,28,,119,49,40,40,40', 
    '35,,,,36,35,119,2,2,36,53,53,91,,24,8,,,24,24,,,24,30,30,2,22,,,47,', 
    ',,32,,40,,76,32,,29,,,40,47,77,47,,,,,15,,,,25,,,,20,51,,52,,76,,24', 
    '24,24,24,,,,,70,,12,,,25,,25,25,25,5,26,,2,,,,46,2,51,30,,,,,30,,74', 
    ',119,44,,87,,,,,,25,,51,25,,,25,,,,,,,40,40,20,51,89,,,,25,,44,91,,119', 
    ',,,,40,30,,,25,,,,,25,26,55,,,,25,70,,24,24,25,,,25,,,25,18,,,,3,,,20', 
    '51,89,3,89,,25,,,15,15,,,,,,90,90,90,,25,,,18,48,,26,,40,44,91,,40,40', 
    '44,14,73,,,47,47,,,18,70,15,30,30,,15,49,,,,15,4,43,,,,25,25,,,25,25', 
    '76,76,,,25,15,,25,,49,44,15,,47,25,,25,51,,,25,,,,76,76,18,,44,76,24', 
    '24,,,18,40,25,,,,25,,26,,,,,,,,,52,2,2,,16,16,,,,24,16,,47,15,,,,25', 
    ',,90,90,,24,90,,3,,15,,,,,25,,,31,2,,,31,2,,,,14,2,,,21,89,,89,,,,,', 
    ',,15,25,,91,,18,18,,,,,,,54,,25,25,,,21,21,21,,18,51,,25,25,25,,,,31', 
    ',25,31,,,,21,15,,,25,,25,,,,,21,21,,,76,,,,15,40,40,,2,,55,,3,89,48', 
    '25,90,90,90,16,14,,,2,,,,,24,47,,18,,,21,,18,,30,,,40,21,25,,40,25,', 
    ',15,40,24,25,15,25,2,,90,49,40,15,15,,,,15,51,40,,25,89,20,51,40,,,47', 
    ',,,44,,,76,,25,15,,25,90,,25,,,,47,24,26,,,,,,,18,,15,25,,,25,,,2,,', 
    ',,,,,,,25,21,21,40,,,25,34,,,,,,,,,,,40,21,,15,,,34,34,,44,15,34,34', 
    '34,,,,2,,34,,,,,,,,,2,2,,54,40,2,,,,,,34,34,34,,,34,34,,,34,,,,,,,,', 
    ',,,,,,21,,,,21,21,,,,40,,2,,,,,,,,24,,,,,,34,,40,,34,34,34,34,34,,18', 
    '18,,,,,,,,,,,,,2,,,,,,,2,,,,,,,,,,,,,,,18,40,21,,18,40,9,9,,18,,,40', 
    '40,,,,40,,,,,,,,9,18,9,9,9,9,9,18,,,,,24,40,,,54,,,34,34,34,34,34,34', 
    ',,34,34,34,,,,40,,,,34,54,,,,,,,,,,,,,,,,,,,,,,18,,,,,,,,,,,40,,,,18', 
    ',,40,,,,,,,,,,34,34,,,,,,,,34,,34,,,,,34,,,18,,,,,21,21,,,,,,,,,,9,', 
    ',,,,,,,,,,,,,,,34,34,54,,,54,,18,21,,,,21,,,,54,21,,,,,,,,18,21,,,,34', 
    ',34,,21,,,,,,21,,,,34,,,9,,,,9,9,,,,21,,,,,,,,,,,,,,18,,,,54,,,54,,', 
    ',18,18,,,,18,,,,,,,21,,,,,,,,,,,,,54,18,21,34,54,,,54,,,,,,,,,,,,,,18', 
    ',,,,54,,,,,,,,21,,,,,54,,,54,,,,,,,54,,,,,,,,34,,18,,34,34,,,,18,23', 
    '23,,,34,,,21,,,,,,34,,,,,,,9,,,,,21,,,,,34,,,,34,9,,,,34,,,,,,,,,,,', 
    ',,23,34,23,34,,34,,,23,34,,,,9,,,,21,,,,21,,9,,,9,9,21,21,,,,21,,,,', 
    ',,,,,,,34,34,,,,9,34,,,21,,,,,,9,9,34,,,,,,,,,,,,21,,,34,,,,,,34,19', 
    ',,,,,,,,,,,,,,,9,19,19,,,,19,19,19,34,,,21,,19,19,19,,,21,,,,,,,,,,', 
    ',,34,,19,19,19,,,19,19,,,19,,19,19,,,34,,23,,,,,,,,,,,,,,,,34,,,,,,', 
    '34,,,,,,,,,19,,,,19,19,19,19,19,,,,,,,,,9,,,,,,9,,23,,9,23,34,,23,,', 
    '9,,9,,34,,34,34,,,,34,23,,,,,,,,,,,,,,,,,,,,34,,,,,23,,,,,23,,,23,,', 
    '23,,,,34,,,,19,19,19,19,19,19,23,,19,19,19,,,,,,,,19,,,,,9,9,,,,,,34', 
    ',,,34,,,,,,,34,,,,,,,,,,,,,,,,,,,,23,,,,,,,,19,19,,,,,,,,19,,19,,23', 
    ',19,19,23,,,,,,,,,,,,,,,,23,,,,23,,9,,,,,,,,,,,,,19,19,,,,,,,9,,,,,', 
    ',,,,,,,,,,,,,,,23,19,,19,,,9,,,,,,,,,19,,,,,,,,,,,,,23,,,,,,,,,,,,,', 
    '23,,,,,,,,,,,,,,,,,,,23,,,,,,,,,,,23,,,,,,,,19,,,,,,,,,,,,,,,,23,,,', 
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,23,19,23,,,19,19,,,,,,,,,19,,23,,,', 
    ',,,19,,,,,,,,,23,,,23,,,,,19,,,,19,,,,,19,,,,,23,,,23,19,,,,,,19,,19', 
    ',19,,23,,19,,,,23,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,19,19,,,,,19,,,,,,', 
    ',,,,19,,,,,,,,,,,,,,,19,,,,,,19,,,,,,,,,,,,,,,,,,,,,,,,,,19,,,,,,,,', 
    ',,,,,,,,,,,,,,19,,,,,,,,,,,,,,,,,19,,,,,,,,,,,,,,,,,,19,,,,,,,19,,,', 
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,19,,,,19,,,,,19,,19,19,,,,19,,,,,', 
    ',,,,,,,,,,,,,,,19,,,,,,,,,,,,,,,,,,,,19,,,,,,,,,,,,,,,,,,,,,,,,,,,,', 
    ',,,,,19,,,,19,,,,,,,19'];
    racc_goto_check = arr = $cg(self, 'Array').m$new(2331, nil);
    idx = 0;
    (__a = clist, $B.f = __a.m$each, ($B.p =function(str) { var self = this; var __a, __b;
      return (__a = str.m$split(',', -1), $B.f = __a.m$each, ($B.p =function(i) { var self = this; var __a;
        if(!((__a = i['m$empty?'](), __a !== false && __a !== nil))) {arr['m$[]='](idx, i.m$to_i())};
        return idx = idx['m$+'](1);
      }).$self=self, $B.f).call(__a);
    }).$self=self, $B.f).call(__a);

    racc_goto_pointer = [
    nil, 142, 140, -43, -284, -412, -538, nil, 25, 959, 
    -39, 98, 11, 87, -7, 31, 39, nil, 492, 1480, 
    -38, 665, -150, 1152, 285, -18, -12, nil, 48, -257, 
    -72, 248, -228, -173, 860, 53, 57, nil, 72, 5, 
    258, -280, 15, 1, 39, nil, 26, 71, -8, 51, 
    -190, -37, -24, -401, 446, 3, -332, -120, nil, nil, 
    nil, nil, nil, nil, nil, nil, 68, 74, 53, nil, 
    -270, -603, -453, -283, -52, -239, 47, -329, 4, -283, 
    22, -575, 30, -570, -432, -726, nil, -47, -462, -24, 
    -33, -17, -480, nil, -127, nil, -405, -698, -377, -525, 
    nil, nil, nil, 56, 55, 40, 53, -233, -276, 56, 
    -428, -427, nil, -410, -553, -467, -636, nil, nil, -411];

    racc_goto_default = [
    nil, nil, 293, nil, nil, 756, nil, 3, nil, 4, 
    5, 314, nil, nil, nil, 205, 16, 11, 206, 287, 
    nil, 204, nil, 247, 15, 19, 20, 21, nil, 25, 
    640, nil, nil, nil, 281, 29, nil, 31, 34, 33, 
    202, 336, nil, 115, 406, 114, 67, nil, 41, 298, 
    nil, 243, 585, 586, 451, 601, nil, nil, 259, 453, 
    42, 43, 44, 45, 46, 47, 48, nil, 260, 54, 
    nil, nil, nil, nil, nil, nil, 514, nil, nil, nil, 
    nil, nil, nil, nil, nil, nil, 316, 548, 318, 550, 
    nil, 672, 321, 238, nil, 410, nil, nil, nil, nil, 
    66, 68, 69, 70, nil, nil, nil, nil, 564, nil, 
    nil, nil, 368, 547, 549, 327, 553, 330, 333, 251];

    racc_reduce_table = [
    0, 0, 'racc_error', 
    1, 137, '_reduce_1', 
    4, 139, '_reduce_2', 
    2, 138, '_reduce_3', 
    1, 143, '_reduce_4', 
    1, 143, '_reduce_5', 
    3, 143, '_reduce_6', 
    3, 146, '_reduce_none', 
    3, 146, '_reduce_none', 
    3, 146, '_reduce_none', 
    3, 146, '_reduce_none', 
    2, 146, '_reduce_11', 
    3, 146, '_reduce_12', 
    3, 146, '_reduce_13', 
    3, 146, '_reduce_14', 
    3, 146, '_reduce_15', 
    3, 146, '_reduce_none', 
    4, 146, '_reduce_none', 
    4, 146, '_reduce_none', 
    3, 146, '_reduce_19', 
    3, 146, '_reduce_20', 
    3, 146, '_reduce_21', 
    6, 146, '_reduce_none', 
    5, 146, '_reduce_23', 
    5, 146, '_reduce_none', 
    5, 146, '_reduce_none', 
    3, 146, '_reduce_none', 
    3, 146, '_reduce_none', 
    3, 146, '_reduce_28', 
    3, 146, '_reduce_29', 
    1, 146, '_reduce_none', 
    1, 160, '_reduce_none', 
    3, 160, '_reduce_32', 
    3, 160, '_reduce_33', 
    2, 160, '_reduce_34', 
    2, 160, '_reduce_35', 
    1, 160, '_reduce_none', 
    1, 150, '_reduce_none', 
    1, 152, '_reduce_none', 
    1, 152, '_reduce_none', 
    2, 152, '_reduce_40', 
    2, 152, '_reduce_41', 
    2, 152, '_reduce_42', 
    1, 163, '_reduce_none', 
    4, 163, '_reduce_none', 
    4, 163, '_reduce_none', 
    4, 168, '_reduce_none', 
    2, 162, '_reduce_47', 
    3, 162, '_reduce_none', 
    4, 162, '_reduce_49', 
    5, 162, '_reduce_none', 
    4, 162, '_reduce_51', 
    5, 162, '_reduce_none', 
    2, 162, '_reduce_53', 
    2, 162, '_reduce_54', 
    1, 153, '_reduce_55', 
    3, 153, '_reduce_56', 
    1, 172, '_reduce_57', 
    3, 172, '_reduce_58', 
    1, 171, '_reduce_59', 
    2, 171, '_reduce_60', 
    3, 171, '_reduce_none', 
    2, 171, '_reduce_none', 
    2, 171, '_reduce_none', 
    1, 171, '_reduce_none', 
    1, 174, '_reduce_65', 
    3, 174, '_reduce_66', 
    2, 173, '_reduce_67', 
    3, 173, '_reduce_68', 
    1, 175, '_reduce_none', 
    4, 175, '_reduce_none', 
    3, 175, '_reduce_none', 
    3, 175, '_reduce_none', 
    3, 175, '_reduce_none', 
    3, 175, '_reduce_none', 
    2, 175, '_reduce_none', 
    1, 175, '_reduce_none', 
    1, 151, '_reduce_none', 
    4, 151, '_reduce_78', 
    3, 151, '_reduce_79', 
    3, 151, '_reduce_none', 
    3, 151, '_reduce_none', 
    3, 151, '_reduce_none', 
    2, 151, '_reduce_none', 
    1, 151, '_reduce_none', 
    1, 177, '_reduce_none', 
    2, 178, '_reduce_86', 
    1, 178, '_reduce_87', 
    3, 178, '_reduce_88', 
    1, 179, '_reduce_none', 
    1, 179, '_reduce_none', 
    1, 179, '_reduce_none', 
    1, 179, '_reduce_none', 
    1, 179, '_reduce_none', 
    1, 148, '_reduce_none', 
    1, 148, '_reduce_none', 
    1, 149, '_reduce_96', 
    3, 149, '_reduce_97', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 180, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    1, 181, '_reduce_none', 
    3, 161, '_reduce_167', 
    5, 161, '_reduce_none', 
    3, 161, '_reduce_169', 
    6, 161, '_reduce_170', 
    5, 161, '_reduce_171', 
    5, 161, '_reduce_none', 
    5, 161, '_reduce_none', 
    5, 161, '_reduce_none', 
    4, 161, '_reduce_none', 
    3, 161, '_reduce_none', 
    3, 161, '_reduce_177', 
    3, 161, '_reduce_178', 
    3, 161, '_reduce_179', 
    3, 161, '_reduce_180', 
    3, 161, '_reduce_181', 
    3, 161, '_reduce_182', 
    3, 161, '_reduce_183', 
    3, 161, '_reduce_184', 
    2, 161, '_reduce_185', 
    2, 161, '_reduce_186', 
    3, 161, '_reduce_187', 
    3, 161, '_reduce_188', 
    3, 161, '_reduce_189', 
    3, 161, '_reduce_190', 
    3, 161, '_reduce_191', 
    3, 161, '_reduce_192', 
    3, 161, '_reduce_193', 
    3, 161, '_reduce_194', 
    3, 161, '_reduce_195', 
    3, 161, '_reduce_196', 
    3, 161, '_reduce_197', 
    3, 161, '_reduce_198', 
    3, 161, '_reduce_199', 
    2, 161, '_reduce_200', 
    2, 161, '_reduce_201', 
    3, 161, '_reduce_202', 
    3, 161, '_reduce_203', 
    3, 161, '_reduce_204', 
    3, 161, '_reduce_205', 
    3, 161, '_reduce_none', 
    5, 161, '_reduce_207', 
    1, 161, '_reduce_none', 
    1, 159, '_reduce_none', 
    1, 156, '_reduce_210', 
    2, 156, '_reduce_none', 
    2, 156, '_reduce_212', 
    5, 156, '_reduce_213', 
    2, 156, '_reduce_214', 
    3, 156, '_reduce_215', 
    3, 188, '_reduce_216', 
    4, 188, '_reduce_217', 
    4, 188, '_reduce_none', 
    6, 188, '_reduce_none', 
    1, 189, '_reduce_220', 
    1, 189, '_reduce_none', 
    1, 164, '_reduce_222', 
    2, 164, '_reduce_223', 
    5, 164, '_reduce_224', 
    2, 164, '_reduce_225', 
    5, 164, '_reduce_226', 
    4, 164, '_reduce_227', 
    7, 164, '_reduce_228', 
    3, 164, '_reduce_229', 
    1, 164, '_reduce_230', 
    4, 192, '_reduce_none', 
    3, 192, '_reduce_none', 
    5, 192, '_reduce_none', 
    7, 192, '_reduce_none', 
    2, 192, '_reduce_none', 
    5, 192, '_reduce_none', 
    4, 192, '_reduce_none', 
    6, 192, '_reduce_none', 
    7, 192, '_reduce_none', 
    9, 192, '_reduce_none', 
    3, 192, '_reduce_none', 
    1, 192, '_reduce_none', 
    0, 194, '_reduce_243', 
    2, 167, '_reduce_244', 
    1, 193, '_reduce_none', 
    2, 193, '_reduce_246', 
    3, 193, '_reduce_247', 
    2, 191, '_reduce_248', 
    2, 190, '_reduce_249', 
    1, 190, '_reduce_250', 
    1, 185, '_reduce_251', 
    3, 185, '_reduce_252', 
    3, 158, '_reduce_none', 
    4, 158, '_reduce_none', 
    2, 158, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    1, 184, '_reduce_none', 
    3, 184, '_reduce_265', 
    4, 184, '_reduce_none', 
    3, 184, '_reduce_267', 
    3, 184, '_reduce_268', 
    2, 184, '_reduce_269', 
    4, 184, '_reduce_270', 
    3, 184, '_reduce_271', 
    3, 184, '_reduce_272', 
    1, 184, '_reduce_273', 
    4, 184, '_reduce_274', 
    3, 184, '_reduce_275', 
    1, 184, '_reduce_276', 
    5, 184, '_reduce_none', 
    2, 184, '_reduce_278', 
    1, 184, '_reduce_none', 
    2, 184, '_reduce_280', 
    6, 184, '_reduce_281', 
    6, 184, '_reduce_282', 
    0, 216, '_reduce_283', 
    0, 217, '_reduce_284', 
    7, 184, '_reduce_285', 
    0, 218, '_reduce_286', 
    0, 219, '_reduce_287', 
    7, 184, '_reduce_288', 
    5, 184, '_reduce_289', 
    4, 184, '_reduce_290', 
    5, 184, '_reduce_none', 
    0, 220, '_reduce_292', 
    0, 221, '_reduce_293', 
    9, 184, '_reduce_294', 
    5, 184, '_reduce_295', 
    6, 184, '_reduce_296', 
    4, 184, '_reduce_297', 
    5, 184, '_reduce_298', 
    7, 184, '_reduce_299', 
    1, 184, '_reduce_300', 
    1, 184, '_reduce_301', 
    1, 184, '_reduce_302', 
    1, 184, '_reduce_none', 
    1, 155, '_reduce_none', 
    1, 206, '_reduce_none', 
    1, 206, '_reduce_none', 
    1, 206, '_reduce_none', 
    2, 206, '_reduce_none', 
    1, 208, '_reduce_none', 
    1, 208, '_reduce_none', 
    1, 208, '_reduce_none', 
    1, 207, '_reduce_312', 
    5, 207, '_reduce_313', 
    1, 141, '_reduce_314', 
    2, 141, '_reduce_315', 
    1, 210, '_reduce_316', 
    6, 222, '_reduce_317', 
    4, 222, '_reduce_318', 
    4, 222, '_reduce_319', 
    2, 222, '_reduce_320', 
    4, 222, '_reduce_321', 
    2, 222, '_reduce_322', 
    2, 222, '_reduce_323', 
    1, 222, '_reduce_324', 
    1, 224, '_reduce_325', 
    3, 224, '_reduce_326', 
    3, 228, '_reduce_327', 
    1, 169, '_reduce_328', 
    2, 169, '_reduce_329', 
    1, 169, '_reduce_330', 
    3, 169, '_reduce_331', 
    0, 230, '_reduce_332', 
    5, 229, '_reduce_333', 
    2, 165, '_reduce_334', 
    4, 165, '_reduce_none', 
    4, 165, '_reduce_none', 
    2, 205, '_reduce_337', 
    4, 205, '_reduce_338', 
    4, 205, '_reduce_none', 
    3, 205, '_reduce_none', 
    2, 205, '_reduce_341', 
    1, 205, '_reduce_342', 
    4, 204, '_reduce_343', 
    4, 204, '_reduce_344', 
    5, 209, '_reduce_345', 
    1, 232, '_reduce_346', 
    4, 232, '_reduce_347', 
    2, 232, '_reduce_348', 
    1, 233, '_reduce_none', 
    1, 233, '_reduce_none', 
    6, 140, '_reduce_351', 
    0, 140, '_reduce_352', 
    1, 234, '_reduce_none', 
    1, 234, '_reduce_none', 
    1, 234, '_reduce_none', 
    2, 235, '_reduce_356', 
    1, 235, '_reduce_357', 
    2, 142, '_reduce_358', 
    1, 142, '_reduce_359', 
    1, 196, '_reduce_none', 
    1, 196, '_reduce_none', 
    1, 196, '_reduce_none', 
    1, 197, '_reduce_none', 
    1, 238, '_reduce_none', 
    2, 238, '_reduce_none', 
    3, 239, '_reduce_366', 
    1, 239, '_reduce_none', 
    3, 198, '_reduce_368', 
    3, 199, '_reduce_369', 
    3, 200, '_reduce_370', 
    3, 200, '_reduce_371', 
    1, 242, '_reduce_372', 
    3, 242, '_reduce_373', 
    1, 243, '_reduce_374', 
    2, 243, '_reduce_375', 
    3, 201, '_reduce_376', 
    3, 201, '_reduce_377', 
    1, 245, '_reduce_378', 
    3, 245, '_reduce_379', 
    1, 240, '_reduce_380', 
    2, 240, '_reduce_381', 
    1, 241, '_reduce_382', 
    2, 241, '_reduce_383', 
    1, 244, '_reduce_384', 
    2, 244, '_reduce_385', 
    0, 247, '_reduce_386', 
    4, 244, '_reduce_387', 
    1, 246, '_reduce_none', 
    1, 246, '_reduce_none', 
    1, 246, '_reduce_none', 
    1, 246, '_reduce_none', 
    2, 182, '_reduce_392', 
    1, 182, '_reduce_none', 
    1, 248, '_reduce_none', 
    1, 248, '_reduce_none', 
    1, 248, '_reduce_none', 
    1, 248, '_reduce_none', 
    3, 237, '_reduce_398', 
    1, 236, '_reduce_399', 
    1, 236, '_reduce_400', 
    2, 236, '_reduce_none', 
    2, 236, '_reduce_none', 
    1, 176, '_reduce_403', 
    1, 176, '_reduce_404', 
    1, 176, '_reduce_405', 
    1, 176, '_reduce_406', 
    1, 176, '_reduce_407', 
    1, 176, '_reduce_408', 
    1, 176, '_reduce_409', 
    1, 176, '_reduce_410', 
    1, 176, '_reduce_411', 
    1, 176, '_reduce_412', 
    1, 176, '_reduce_413', 
    1, 176, '_reduce_414', 
    1, 176, '_reduce_415', 
    1, 202, '_reduce_none', 
    1, 154, '_reduce_none', 
    1, 157, '_reduce_none', 
    1, 157, '_reduce_none', 
    1, 211, '_reduce_420', 
    3, 211, '_reduce_421', 
    2, 211, '_reduce_422', 
    4, 213, '_reduce_423', 
    2, 213, '_reduce_424', 
    6, 249, '_reduce_425', 
    4, 249, '_reduce_426', 
    4, 249, '_reduce_427', 
    2, 249, '_reduce_428', 
    4, 249, '_reduce_429', 
    2, 249, '_reduce_430', 
    2, 249, '_reduce_431', 
    1, 249, '_reduce_432', 
    0, 249, '_reduce_433', 
    1, 251, '_reduce_434', 
    1, 251, '_reduce_435', 
    1, 251, '_reduce_436', 
    1, 251, '_reduce_437', 
    1, 251, '_reduce_none', 
    1, 223, '_reduce_439', 
    3, 223, '_reduce_440', 
    3, 252, '_reduce_441', 
    1, 250, '_reduce_442', 
    3, 250, '_reduce_443', 
    1, 253, '_reduce_none', 
    1, 253, '_reduce_none', 
    2, 225, '_reduce_446', 
    1, 225, '_reduce_447', 
    1, 254, '_reduce_none', 
    1, 254, '_reduce_none', 
    2, 227, '_reduce_450', 
    2, 226, '_reduce_451', 
    0, 226, '_reduce_452', 
    1, 214, '_reduce_453', 
    4, 214, '_reduce_454', 
    1, 203, '_reduce_455', 
    2, 203, '_reduce_456', 
    2, 203, '_reduce_457', 
    1, 187, '_reduce_458', 
    3, 187, '_reduce_459', 
    3, 255, '_reduce_460', 
    2, 255, '_reduce_461', 
    1, 170, '_reduce_none', 
    1, 170, '_reduce_none', 
    1, 170, '_reduce_none', 
    1, 166, '_reduce_none', 
    1, 166, '_reduce_none', 
    1, 166, '_reduce_none', 
    1, 166, '_reduce_none', 
    1, 231, '_reduce_none', 
    1, 231, '_reduce_none', 
    1, 231, '_reduce_none', 
    1, 215, '_reduce_none', 
    1, 215, '_reduce_none', 
    0, 144, '_reduce_none', 
    1, 144, '_reduce_none', 
    0, 183, '_reduce_none', 
    1, 183, '_reduce_none', 
    0, 186, '_reduce_none', 
    1, 186, '_reduce_none', 
    1, 186, '_reduce_none', 
    1, 212, '_reduce_none', 
    1, 212, '_reduce_none', 
    1, 147, '_reduce_none', 
    2, 147, '_reduce_none', 
    0, 145, '_reduce_none', 
    0, 195, '_reduce_none'];

    racc_reduce_n = 487;

    racc_shift_n = 881;

    racc_token_table = $hash(
    false, 0, 
    'error', 1, 
    'CLASS', 2, 
    'MODULE', 3, 
    'DEF', 4, 
    'UNDEF', 5, 
    'BEGIN', 6, 
    'RESCUE', 7, 
    'ENSURE', 8, 
    'END', 9, 
    'IF', 10, 
    'UNLESS', 11, 
    'THEN', 12, 
    'ELSIF', 13, 
    'ELSE', 14, 
    'CASE', 15, 
    'WHEN', 16, 
    'WHILE', 17, 
    'UNTIL', 18, 
    'FOR', 19, 
    'BREAK', 20, 
    'NEXT', 21, 
    'REDO', 22, 
    'RETRY', 23, 
    'IN', 24, 
    'DO', 25, 
    'DO_COND', 26, 
    'DO_BLOCK', 27, 
    'RETURN', 28, 
    'YIELD', 29, 
    'SUPER', 30, 
    'SELF', 31, 
    'NIL', 32, 
    'TRUE', 33, 
    'FALSE', 34, 
    'AND', 35, 
    'OR', 36, 
    'NOT', 37, 
    'IF_MOD', 38, 
    'UNLESS_MOD', 39, 
    'WHILE_MOD', 40, 
    'UNTIL_MOD', 41, 
    'RESCUE_MOD', 42, 
    'ALIAS', 43, 
    'DEFINED', 44, 
    'klBEGIN', 45, 
    'klEND', 46, 
    'LINE', 47, 
    'FILE', 48, 
    'IDENTIFIER', 49, 
    'FID', 50, 
    'GVAR', 51, 
    'IVAR', 52, 
    'CONSTANT', 53, 
    'CVAR', 54, 
    'NTH_REF', 55, 
    'BACK_REF', 56, 
    'STRING_CONTENT', 57, 
    'INTEGER', 58, 
    'FLOAT', 59, 
    'REGEXP_END', 60, 
    "+@", 61, 
    "-@", 62, 
    "-@NUM", 63, 
    "**", 64, 
    "<=>", 65, 
    "==", 66, 
    "===", 67, 
    "!=", 68, 
    ">=", 69, 
    "<=", 70, 
    "&&", 71, 
    "||", 72, 
    "=~", 73, 
    "!~", 74, 
    ".", 75, 
    "..", 76, 
    "...", 77, 
    "[]", 78, 
    "[]=", 79, 
    "<<", 80, 
    ">>", 81, 
    "::", 82, 
    "::@", 83, 
    'OP_ASGN', 84, 
    "=>", 85, 
    'PAREN_BEG', 86, 
    "(", 87, 
    ")", 88, 
    'tLPAREN_ARG', 89, 
    'ARRAY_BEG', 90, 
    "]", 91, 
    'tLBRACE', 92, 
    'tLBRACE_ARG', 93, 
    'SPLAT', 94, 
    "*", 95, 
    "&@", 96, 
    "&", 97, 
    "~", 98, 
    "%", 99, 
    "/", 100, 
    "+", 101, 
    "-", 102, 
    "<", 103, 
    ">", 104, 
    "|", 105, 
    "!", 106, 
    "^", 107, 
    "{@", 108, 
    "}", 109, 
    'BACK_REF2', 110, 
    'SYMBOL_BEG', 111, 
    'STRING_BEG', 112, 
    'XSTRING_BEG', 113, 
    'REGEXP_BEG', 114, 
    'WORDS_BEG', 115, 
    'AWORDS_BEG', 116, 
    'STRING_DBEG', 117, 
    'STRING_DVAR', 118, 
    'STRING_END', 119, 
    'STRING', 120, 
    'SYMBOL', 121, 
    "\\n", 122, 
    "?", 123, 
    ":", 124, 
    ",", 125, 
    'SPACE', 126, 
    ";", 127, 
    'LABEL', 128, 
    'UNDEFINED', 129, 
    'NULL', 130, 
    "=", 131, 
    'LOWEST', 132, 
    "[@", 133, 
    "[", 134, 
    "{", 135);

    racc_nt_base = 136;

    racc_use_result_var = true;

    $rb.cs(self, 'Racc_arg', [
    racc_action_table, 
    racc_action_check, 
    racc_action_default, 
    racc_action_pointer, 
    racc_goto_table, 
    racc_goto_check, 
    racc_goto_default, 
    racc_goto_pointer, 
    racc_nt_base, 
    racc_reduce_table, 
    racc_token_table, 
    racc_shift_n, 
    racc_reduce_n, 
    racc_use_result_var]);

    $rb.cs(self, 'Racc_token_to_s_table', [
    "$end", 
    "error", 
    "CLASS", 
    "MODULE", 
    "DEF", 
    "UNDEF", 
    "BEGIN", 
    "RESCUE", 
    "ENSURE", 
    "END", 
    "IF", 
    "UNLESS", 
    "THEN", 
    "ELSIF", 
    "ELSE", 
    "CASE", 
    "WHEN", 
    "WHILE", 
    "UNTIL", 
    "FOR", 
    "BREAK", 
    "NEXT", 
    "REDO", 
    "RETRY", 
    "IN", 
    "DO", 
    "DO_COND", 
    "DO_BLOCK", 
    "RETURN", 
    "YIELD", 
    "SUPER", 
    "SELF", 
    "NIL", 
    "TRUE", 
    "FALSE", 
    "AND", 
    "OR", 
    "NOT", 
    "IF_MOD", 
    "UNLESS_MOD", 
    "WHILE_MOD", 
    "UNTIL_MOD", 
    "RESCUE_MOD", 
    "ALIAS", 
    "DEFINED", 
    "klBEGIN", 
    "klEND", 
    "LINE", 
    "FILE", 
    "IDENTIFIER", 
    "FID", 
    "GVAR", 
    "IVAR", 
    "CONSTANT", 
    "CVAR", 
    "NTH_REF", 
    "BACK_REF", 
    "STRING_CONTENT", 
    "INTEGER", 
    "FLOAT", 
    "REGEXP_END", 
    "\"+@\"", 
    "\"-@\"", 
    "\"-@NUM\"", 
    "\"**\"", 
    "\"<=>\"", 
    "\"==\"", 
    "\"===\"", 
    "\"!=\"", 
    "\">=\"", 
    "\"<=\"", 
    "\"&&\"", 
    "\"||\"", 
    "\"=~\"", 
    "\"!~\"", 
    "\".\"", 
    "\"..\"", 
    "\"...\"", 
    "\"[]\"", 
    "\"[]=\"", 
    "\"<<\"", 
    "\">>\"", 
    "\"::\"", 
    "\"::@\"", 
    "OP_ASGN", 
    "\"=>\"", 
    "PAREN_BEG", 
    "\"(\"", 
    "\")\"", 
    "tLPAREN_ARG", 
    "ARRAY_BEG", 
    "\"]\"", 
    "tLBRACE", 
    "tLBRACE_ARG", 
    "SPLAT", 
    "\"*\"", 
    "\"&@\"", 
    "\"&\"", 
    "\"~\"", 
    "\"%\"", 
    "\"/\"", 
    "\"+\"", 
    "\"-\"", 
    "\"<\"", 
    "\">\"", 
    "\"|\"", 
    "\"!\"", 
    "\"^\"", 
    "\"{@\"", 
    "\"}\"", 
    "BACK_REF2", 
    "SYMBOL_BEG", 
    "STRING_BEG", 
    "XSTRING_BEG", 
    "REGEXP_BEG", 
    "WORDS_BEG", 
    "AWORDS_BEG", 
    "STRING_DBEG", 
    "STRING_DVAR", 
    "STRING_END", 
    "STRING", 
    "SYMBOL", 
    "\"\\\\n\"", 
    "\"?\"", 
    "\":\"", 
    "\",\"", 
    "SPACE", 
    "\";\"", 
    "LABEL", 
    "UNDEFINED", 
    "NULL", 
    "\"=\"", 
    "LOWEST", 
    "\"[@\"", 
    "\"[\"", 
    "\"{\"", 
    "$start", 
    "target", 
    "compstmt", 
    "bodystmt", 
    "opt_rescue", 
    "opt_else", 
    "opt_ensure", 
    "stmts", 
    "opt_terms", 
    "none", 
    "stmt", 
    "terms", 
    "fitem", 
    "undef_list", 
    "expr_value", 
    "lhs", 
    "command_call", 
    "mlhs", 
    "var_lhs", 
    "primary_value", 
    "aref_args", 
    "backref", 
    "mrhs", 
    "arg_value", 
    "expr", 
    "arg", 
    "command", 
    "block_command", 
    "call_args", 
    "block_call", 
    "operation2", 
    "command_args", 
    "cmd_brace_block", 
    "opt_block_var", 
    "operation", 
    "mlhs_basic", 
    "mlhs_entry", 
    "mlhs_head", 
    "mlhs_item", 
    "mlhs_node", 
    "variable", 
    "cname", 
    "cpath", 
    "fname", 
    "op", 
    "reswords", 
    "symbol", 
    "opt_nl", 
    "primary", 
    "args", 
    "trailer", 
    "assocs", 
    "paren_args", 
    "opt_paren_args", 
    "opt_block_arg", 
    "block_arg", 
    "call_args2", 
    "open_args", 
    "@1", 
    "none_block_pass", 
    "literal", 
    "strings", 
    "xstring", 
    "regexp", 
    "words", 
    "awords", 
    "var_ref", 
    "assoc_list", 
    "brace_block", 
    "method_call", 
    "then", 
    "if_tail", 
    "do", 
    "case_body", 
    "block_var", 
    "superclass", 
    "term", 
    "f_arglist", 
    "singleton", 
    "dot_or_colon", 
    "@2", 
    "@3", 
    "@4", 
    "@5", 
    "@6", 
    "@7", 
    "block_var_args", 
    "f_arg", 
    "f_block_optarg", 
    "f_rest_arg", 
    "opt_f_block_arg", 
    "f_block_arg", 
    "f_block_opt", 
    "do_block", 
    "@8", 
    "operation3", 
    "when_args", 
    "cases", 
    "exc_list", 
    "exc_var", 
    "numeric", 
    "dsym", 
    "string", 
    "string1", 
    "string_contents", 
    "xstring_contents", 
    "word_list", 
    "word", 
    "string_content", 
    "qword_list", 
    "string_dvar", 
    "@9", 
    "sym", 
    "f_args", 
    "f_optarg", 
    "f_norm_arg", 
    "f_opt", 
    "restarg_mark", 
    "blkarg_mark", 
    "assoc"]);

    $rb.cs(self, 'Racc_debug_parser', false);





    $defn(self, '_reduce_1', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_2', function(val, _values, result) { var self = this;
      result = $cg(self, 'BodyStatementsNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2), val['m$[]'](3));

      return result;
    });

    $defn(self, '_reduce_3', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_4', function(val, _values, result) { var self = this;
      result = $cg(self, 'StatementsNode').m$new([]);

      return result;
    });

    $defn(self, '_reduce_5', function(val, _values, result) { var self = this;
      result = $cg(self, 'StatementsNode').m$new([val['m$[]'](0)]);

      return result;
    });

    $defn(self, '_reduce_6', function(val, _values, result) { var self = this;
      val['m$[]'](0)['m$<<'](val['m$[]'](2));
      result = val['m$[]'](0);

      return result;
    });









    $defn(self, '_reduce_11', function(val, _values, result) { var self = this;
      result = $cg(self, 'UndefNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_12', function(val, _values, result) { var self = this;
      result = $cg(self, 'IfNode').m$new(val['m$[]'](1), val['m$[]'](2), $cg(self, 'StatementsNode').m$new([val['m$[]'](0)]), [], val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_13', function(val, _values, result) { var self = this;
      result = $cg(self, 'IfModNode').m$new(val['m$[]'](1), val['m$[]'](2), val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_14', function(val, _values, result) { var self = this;
      result = $cg(self, 'WhileNode').m$new(val['m$[]'](1), val['m$[]'](2), $cg(self, 'StatementsNode').m$new([val['m$[]'](0)]), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_15', function(val, _values, result) { var self = this;
      result = $cg(self, 'WhileNode').m$new(val['m$[]'](1), val['m$[]'](2), $cg(self, 'StatementsNode').m$new([val['m$[]'](0)]), val['m$[]'](1));

      return result;
    });







    $defn(self, '_reduce_19', function(val, _values, result) { var self = this;
      result = $cg(self, 'AssignNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_20', function(val, _values, result) { var self = this;
      result = $cg(self, 'MlhsAssignNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_21', function(val, _values, result) { var self = this;
      result = $cg(self, 'OpAsgnNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });



    $defn(self, '_reduce_23', function(val, _values, result) { var self = this;
      result = $cg(self, 'OpAsgnNode').m$new(val['m$[]'](3), $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](2), []), val['m$[]'](4));

      return result;
    });









    $defn(self, '_reduce_28', function(val, _values, result) { var self = this;
      result = $cg(self, 'MlhsAssignNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_29', function(val, _values, result) { var self = this;
      result = $cg(self, 'MlhsAssignNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });





    $defn(self, '_reduce_32', function(val, _values, result) { var self = this;
      result = $cg(self, 'AndNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_33', function(val, _values, result) { var self = this;
      result = $cg(self, 'OrNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_34', function(val, _values, result) { var self = this;
      result = $cg(self, 'UnaryNode').m$new($hash('line', val['m$[]'](0)['m$[]']('line'), 'value', '!'), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_35', function(val, _values, result) { var self = this;
      result = $cg(self, 'UnaryNode').m$new($hash('line', val['m$[]'](0)['m$[]']('line'), 'value', '!'), val['m$[]'](1));

      return result;
    });









    $defn(self, '_reduce_40', function(val, _values, result) { var self = this;
      result = $cg(self, 'ReturnNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_41', function(val, _values, result) { var self = this;
      result = $cg(self, 'BreakNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_42', function(val, _values, result) { var self = this;
      result = $cg(self, 'NextNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });









    $defn(self, '_reduce_47', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(nil, val['m$[]'](0), val['m$[]'](1));

      return result;
    });



    $defn(self, '_reduce_49', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](3));

      return result;
    });



    $defn(self, '_reduce_51', function(val, _values, result) { var self = this;
      result = "result = ['call', val[0], val[2], val[3]];";

      return result;
    });



    $defn(self, '_reduce_53', function(val, _values, result) { var self = this;
      result = $cg(self, 'SuperNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_54', function(val, _values, result) { var self = this;
      result = $cg(self, 'YieldNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_55', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_56', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_57', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_58', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_59', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_60', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)['m$<<'](val['m$[]'](1))];

      return result;
    });









    $defn(self, '_reduce_65', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_66', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_67', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_68', function(val, _values, result) { var self = this;
      result = val['m$[]'](0)['m$<<'](val['m$[]'](1));

      return result;
    });



















    $defn(self, '_reduce_78', function(val, _values, result) { var self = this;
      result = $cg(self, 'ArefNode').m$new(val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_79', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](2), [[]]);

      return result;
    });













    $defn(self, '_reduce_86', function(val, _values, result) { var self = this;
      result = "result = ['::', val[1]];";

      return result;
    });

    $defn(self, '_reduce_87', function(val, _values, result) { var self = this;
      result = [nil, val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_88', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2)];

      return result;
    });















    $defn(self, '_reduce_96', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_97', function(val, _values, result) { var self = this;
      result = val['m$[]'](0)['m$<<'](val['m$[]'](2));

      return result;
    });











































































































































    $defn(self, '_reduce_167', function(val, _values, result) { var self = this;
      result = $cg(self, 'AssignNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](1));

      return result;
    });



    $defn(self, '_reduce_169', function(val, _values, result) { var self = this;
      result = $cg(self, 'OpAsgnNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_170', function(val, _values, result) { var self = this;
      result = $cg(self, 'OpAsgnNode').m$new(val['m$[]'](4), $cg(self, 'ArefNode').m$new(val['m$[]'](0), val['m$[]'](2)), val['m$[]'](5));

      return result;
    });

    $defn(self, '_reduce_171', function(val, _values, result) { var self = this;
      result = $cg(self, 'OpAsgnNode').m$new(val['m$[]'](3), $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](2), [[]]), val['m$[]'](4));

      return result;
    });











    $defn(self, '_reduce_177', function(val, _values, result) { var self = this;
      result = $cg(self, 'RangeNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_178', function(val, _values, result) { var self = this;
      result = $cg(self, 'RangeNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_179', function(val, _values, result) { var self = this;
      result = $cg(self, 'ArithmeticNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_180', function(val, _values, result) { var self = this;
      result = $cg(self, 'ArithmeticNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_181', function(val, _values, result) { var self = this;
      result = $cg(self, 'ArithmeticNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_182', function(val, _values, result) { var self = this;
      result = $cg(self, 'ArithmeticNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_183', function(val, _values, result) { var self = this;
      result = $cg(self, 'ArithmeticNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_184', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_185', function(val, _values, result) { var self = this;
      result = $cg(self, 'UnaryNode').m$new($hash('line', val['m$[]'](0)['m$[]']('line'), 'value', '+'), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_186', function(val, _values, result) { var self = this;
      result = $cg(self, 'UnaryNode').m$new($hash('line', val['m$[]'](0)['m$[]']('line'), 'value', '-'), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_187', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_188', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_189', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_190', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_191', function(val, _values, result) { var self = this;
      result = $cg(self, 'ComparisonNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_192', function(val, _values, result) { var self = this;
      result = $cg(self, 'ComparisonNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_193', function(val, _values, result) { var self = this;
      result = $cg(self, 'ComparisonNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_194', function(val, _values, result) { var self = this;
      result = $cg(self, 'ComparisonNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_195', function(val, _values, result) { var self = this;
      result = $cg(self, 'EqualNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_196', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_197', function(val, _values, result) { var self = this;
      result = $cg(self, 'EqualNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_198', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_199', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_200', function(val, _values, result) { var self = this;
      result = $cg(self, 'UnaryNode').m$new($hash('line', val['m$[]'](0)['m$[]']('line'), 'value', '!'), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_201', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](1), val['m$[]'](0), []);

      return result;
    });

    $defn(self, '_reduce_202', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_203', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](1), [[val['m$[]'](2)]]);

      return result;
    });

    $defn(self, '_reduce_204', function(val, _values, result) { var self = this;
      result = $cg(self, 'AndNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_205', function(val, _values, result) { var self = this;
      result = $cg(self, 'OrNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });



    $defn(self, '_reduce_207', function(val, _values, result) { var self = this;
      result = $cg(self, 'TernaryNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](4));

      return result;
    });





    $defn(self, '_reduce_210', function(val, _values, result) { var self = this;
      result = [[], nil];

      return result;
    });



    $defn(self, '_reduce_212', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil];

      return result;
    });

    $defn(self, '_reduce_213', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_214', function(val, _values, result) { var self = this;
      result = [[$cg(self, 'HashNode').m$new(val['m$[]'](0), $hash(), $hash())], nil];

      return result;
    });

    $defn(self, '_reduce_215', function(val, _values, result) { var self = this;
      result = [[], val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_216', function(val, _values, result) { var self = this;
      result = [[]];

      return result;
    });

    $defn(self, '_reduce_217', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });





    $defn(self, '_reduce_220', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });



    $defn(self, '_reduce_222', function(val, _values, result) { var self = this;
      result = [[val['m$[]'](0)], nil, nil, nil];

      return result;
    });

    $defn(self, '_reduce_223', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil, nil, val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_224', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](3), nil, val['m$[]'](4)];

      return result;
    });

    $defn(self, '_reduce_225', function(val, _values, result) { var self = this;
      result = [nil, nil, val['m$[]'](0), val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_226', function(val, _values, result) { var self = this;
      result = [nil, val['m$[]'](3), val['m$[]'](0), val['m$[]'](4)];

      return result;
    });

    $defn(self, '_reduce_227', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil, val['m$[]'](2), val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_228', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](5), val['m$[]'](2), val['m$[]'](6)];

      return result;
    });

    $defn(self, '_reduce_229', function(val, _values, result) { var self = this;
      result = [nil, val['m$[]'](1), nil, val['m$[]'](2)];

      return result;
    });

    $defn(self, '_reduce_230', function(val, _values, result) { var self = this;
      result = [nil, nil, nil, val['m$[]'](0)];

      return result;
    });

























    $defn(self, '_reduce_243', function(val, _values, result) { var self = this;
      self.m$cmdarg_push(1);

      return result;
    });

    $defn(self, '_reduce_244', function(val, _values, result) { var self = this;
      self.m$cmdarg_pop();
      result = val['m$[]'](1);

      return result;
    });



    $defn(self, '_reduce_246', function(val, _values, result) { var self = this;
      result = [[]];

      return result;
    });

    $defn(self, '_reduce_247', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_248', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_249', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_250', function(val, _values, result) { var self = this;
      result = nil;

      return result;
    });

    $defn(self, '_reduce_251', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_252', function(val, _values, result) { var self = this;
      result = val['m$[]'](0)['m$<<'](val['m$[]'](2));

      return result;
    });

























    $defn(self, '_reduce_265', function(val, _values, result) { var self = this;
      result = $cg(self, 'BeginNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });



    $defn(self, '_reduce_267', function(val, _values, result) { var self = this;
      result = $cg(self, 'ParenNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_268', function(val, _values, result) { var self = this;
      result = $cg(self, 'Colon2Node').m$new(val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_269', function(val, _values, result) { var self = this;
      result = $cg(self, 'Colon3Node').m$new(val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_270', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), $hash('line', val['m$[]'](0).m$line(), 'value', '[]'), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_271', function(val, _values, result) { var self = this;
      result = $cg(self, 'ArrayNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_272', function(val, _values, result) { var self = this;
      result = $cg(self, 'HashNode').m$new(val['m$[]'](1), val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_273', function(val, _values, result) { var self = this;
      result = $cg(self, 'ReturnNode').m$new(val['m$[]'](0), [nil]);

      return result;
    });

    $defn(self, '_reduce_274', function(val, _values, result) { var self = this;
      result = $cg(self, 'YieldNode').m$new(val['m$[]'](0), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_275', function(val, _values, result) { var self = this;
      result = $cg(self, 'YieldNode').m$new(val['m$[]'](0), []);

      return result;
    });

    $defn(self, '_reduce_276', function(val, _values, result) { var self = this;
      result = $cg(self, 'YieldNode').m$new(val['m$[]'](0), []);

      return result;
    });



    $defn(self, '_reduce_278', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(nil, val['m$[]'](0), [[]]);
      result['m$block='](val['m$[]'](1));

      return result;
    });



    $defn(self, '_reduce_280', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);
      result['m$block='](val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_281', function(val, _values, result) { var self = this;
      result = $cg(self, 'IfNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](3), val['m$[]'](4), val['m$[]'](5));

      return result;
    });

    $defn(self, '_reduce_282', function(val, _values, result) { var self = this;
      result = $cg(self, 'IfNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](3), val['m$[]'](4), val['m$[]'](5));

      return result;
    });

    $defn(self, '_reduce_283', function(val, _values, result) { var self = this;
      self.m$cond_push(1);

      return result;
    });

    $defn(self, '_reduce_284', function(val, _values, result) { var self = this;
      self.m$cond_pop();

      return result;
    });

    $defn(self, '_reduce_285', function(val, _values, result) { var self = this;
      result = $cg(self, 'WhileNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](5), val['m$[]'](6));

      return result;
    });

    $defn(self, '_reduce_286', function(val, _values, result) { var self = this;
      result = "this.cond_push(1);";

      return result;
    });

    $defn(self, '_reduce_287', function(val, _values, result) { var self = this;
      result = "this.cond_pop();";

      return result;
    });

    $defn(self, '_reduce_288', function(val, _values, result) { var self = this;
      result = "result = ['while', val[0], val[2], val[5]];";

      return result;
    });

    $defn(self, '_reduce_289', function(val, _values, result) { var self = this;
      result = $cg(self, 'CaseNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](3), val['m$[]'](4));

      return result;
    });

    $defn(self, '_reduce_290', function(val, _values, result) { var self = this;
      result = "result = ['case', null, val[2]];";

      return result;
    });



    $defn(self, '_reduce_292', function(val, _values, result) { var self = this;
      self.m$cond_push(1);

      return result;
    });

    $defn(self, '_reduce_293', function(val, _values, result) { var self = this;
      self.m$cond_pop();

      return result;
    });

    $defn(self, '_reduce_294', function(val, _values, result) { var self = this;
      result = $cg(self, 'ForNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](4), val['m$[]'](7), val['m$[]'](8));

      return result;
    });

    $defn(self, '_reduce_295', function(val, _values, result) { var self = this;
      result = $cg(self, 'ClassNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2), val['m$[]'](3), val['m$[]'](4));

      return result;
    });

    $defn(self, '_reduce_296', function(val, _values, result) { var self = this;
      result = $cg(self, 'ClassShiftNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](4), val['m$[]'](5));

      return result;
    });

    $defn(self, '_reduce_297', function(val, _values, result) { var self = this;
      result = $cg(self, 'ModuleNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2), val['m$[]'](3));

      return result;
    });

    $defn(self, '_reduce_298', function(val, _values, result) { var self = this;
      result = $cg(self, 'DefNode').m$new(val['m$[]'](0), nil, val['m$[]'](1), val['m$[]'](2), val['m$[]'](3), val['m$[]'](4));

      return result;
    });

    $defn(self, '_reduce_299', function(val, _values, result) { var self = this;
      result = $cg(self, 'DefNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](3), val['m$[]'](4), val['m$[]'](5), val['m$[]'](6));

      return result;
    });

    $defn(self, '_reduce_300', function(val, _values, result) { var self = this;
      result = $cg(self, 'BreakNode').m$new(val['m$[]'](0), []);

      return result;
    });

    $defn(self, '_reduce_301', function(val, _values, result) { var self = this;
      result = $cg(self, 'NextNode').m$new(val['m$[]'](0), []);

      return result;
    });

    $defn(self, '_reduce_302', function(val, _values, result) { var self = this;
      result = $cg(self, 'RedoNode').m$new(val['m$[]'](0));

      return result;
    });



















    $defn(self, '_reduce_312', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_313', function(val, _values, result) { var self = this;
      result = [[val['m$[]'](0), val['m$[]'](1), val['m$[]'](3)]].m$concat(val['m$[]'](4));

      return result;
    });

    $defn(self, '_reduce_314', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });

    $defn(self, '_reduce_315', function(val, _values, result) { var self = this;
      result = [[val['m$[]'](0), val['m$[]'](1)]];

      return result;
    });

    $defn(self, '_reduce_316', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil];

      return result;
    });

    $defn(self, '_reduce_317', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2), val['m$[]'](4), val['m$[]'](5)];

      return result;
    });

    $defn(self, '_reduce_318', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2), nil, val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_319', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil, val['m$[]'](2), val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_320', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil, nil, val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_321', function(val, _values, result) { var self = this;
      result = [nil, val['m$[]'](0), val['m$[]'](2), val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_322', function(val, _values, result) { var self = this;
      result = [nil, val['m$[]'](0), nil, val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_323', function(val, _values, result) { var self = this;
      result = [nil, nil, val['m$[]'](0), val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_324', function(val, _values, result) { var self = this;
      result = [nil, nil, nil, val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_325', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_326', function(val, _values, result) { var self = this;
      val['m$[]'](0)['m$<<'](val['m$[]'](2));
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_327', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2)];

      return result;
    });

    $defn(self, '_reduce_328', function(val, _values, result) { var self = this;
      result = [nil];

      return result;
    });

    $defn(self, '_reduce_329', function(val, _values, result) { var self = this;
      result = [nil];

      return result;
    });

    $defn(self, '_reduce_330', function(val, _values, result) { var self = this;
      result = [nil];

      return result;
    });

    $defn(self, '_reduce_331', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_332', function(val, _values, result) { var self = this;


      return result;
    });

    $defn(self, '_reduce_333', function(val, _values, result) { var self = this;
      result = $cg(self, 'BlockNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](3), val['m$[]'](4));

      return result;
    });

    $defn(self, '_reduce_334', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);
      val['m$[]'](0)['m$block='](val['m$[]'](1));

      return result;
    });





    $defn(self, '_reduce_337', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(nil, val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_338', function(val, _values, result) { var self = this;
      result = $cg(self, 'CallNode').m$new(val['m$[]'](0), val['m$[]'](2), val['m$[]'](3));

      return result;
    });





    $defn(self, '_reduce_341', function(val, _values, result) { var self = this;
      result = $cg(self, 'SuperNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_342', function(val, _values, result) { var self = this;
      result = $cg(self, 'SuperNode').m$new(val['m$[]'](0), []);

      return result;
    });

    $defn(self, '_reduce_343', function(val, _values, result) { var self = this;
      result = $cg(self, 'BlockNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2), val['m$[]'](3));

      return result;
    });

    $defn(self, '_reduce_344', function(val, _values, result) { var self = this;
      result = $cg(self, 'BlockNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2), val['m$[]'](3));

      return result;
    });

    $defn(self, '_reduce_345', function(val, _values, result) { var self = this;

      result = [[val['m$[]'](0), val['m$[]'](1), val['m$[]'](3)]] + val['m$[]'](4);

      return result;
    });

    $defn(self, '_reduce_346', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_347', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_348', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });





    $defn(self, '_reduce_351', function(val, _values, result) { var self = this;
      result = [[val['m$[]'](0), val['m$[]'](1), val['m$[]'](2), val['m$[]'](4)]];
      result.m$concat(val['m$[]'](5));

      return result;
    });

    $defn(self, '_reduce_352', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });







    $defn(self, '_reduce_356', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_357', function(val, _values, result) { var self = this;
      result = nil;

      return result;
    });

    $defn(self, '_reduce_358', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_359', function(val, _values, result) { var self = this;
      result = nil;

      return result;
    });













    $defn(self, '_reduce_366', function(val, _values, result) { var self = this;
      result = $cg(self, 'StringNode').m$new(val['m$[]'](1), val['m$[]'](2));

      return result;
    });



    $defn(self, '_reduce_368', function(val, _values, result) { var self = this;
      result = $cg(self, 'XStringNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_369', function(val, _values, result) { var self = this;
      result = $cg(self, 'RegexpNode').m$new(val['m$[]'](0), val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_370', function(val, _values, result) { var self = this;
      result = $cg(self, 'WordsNode').m$new(val['m$[]'](0), [], val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_371', function(val, _values, result) { var self = this;
      result = $cg(self, 'WordsNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_372', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });

    $defn(self, '_reduce_373', function(val, _values, result) { var self = this;
      result = val['m$[]'](0).m$concat([val['m$[]'](1)]);

      return result;
    });

    $defn(self, '_reduce_374', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_375', function(val, _values, result) { var self = this;
      result = val['m$[]'](0).m$concat([val['m$[]'](1)]);

      return result;
    });

    $defn(self, '_reduce_376', function(val, _values, result) { var self = this;
      result = $cg(self, 'WordsNode').m$new(val['m$[]'](0), [], val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_377', function(val, _values, result) { var self = this;
      result = $cg(self, 'WordsNode').m$new(val['m$[]'](0), val['m$[]'](1), val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_378', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });

    $defn(self, '_reduce_379', function(val, _values, result) { var self = this;
      result = val['m$[]'](0).m$concat([['string_content', val['m$[]'](1)]]);

      return result;
    });

    $defn(self, '_reduce_380', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });

    $defn(self, '_reduce_381', function(val, _values, result) { var self = this;
      result = val['m$[]'](0)['m$<<'](val['m$[]'](1));

      return result;
    });

    $defn(self, '_reduce_382', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });

    $defn(self, '_reduce_383', function(val, _values, result) { var self = this;
      result = val['m$[]'](0).m$concat([val['m$[]'](1)]);

      return result;
    });

    $defn(self, '_reduce_384', function(val, _values, result) { var self = this;
      result = ['string_content', val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_385', function(val, _values, result) { var self = this;
      result = ['string_dvar', val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_386', function(val, _values, result) { var self = this;
      self.m$cond_push(0);
      self.m$cmdarg_push(0);

      return result;
    });

    $defn(self, '_reduce_387', function(val, _values, result) { var self = this;
      self.m$cond_lexpop();
      self.m$cmdarg_lexpop();
      result = ['string_dbegin', val['m$[]'](2)];

      return result;
    });









    $defn(self, '_reduce_392', function(val, _values, result) { var self = this;
      result = $cg(self, 'SymbolNode').m$new(val['m$[]'](1));

      return result;
    });











    $defn(self, '_reduce_398', function(val, _values, result) { var self = this;
      result = "result = ['dsym', val[1]];";

      return result;
    });

    $defn(self, '_reduce_399', function(val, _values, result) { var self = this;
      result = $cg(self, 'NumericNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_400', function(val, _values, result) { var self = this;
      result = $cg(self, 'NumericNode').m$new(val['m$[]'](0));

      return result;
    });





    $defn(self, '_reduce_403', function(val, _values, result) { var self = this;
      result = $cg(self, 'IdentifierNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_404', function(val, _values, result) { var self = this;
      result = $cg(self, 'IvarNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_405', function(val, _values, result) { var self = this;
      result = $cg(self, 'GvarNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_406', function(val, _values, result) { var self = this;
      result = $cg(self, 'ConstantNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_407', function(val, _values, result) { var self = this;
      result = $cg(self, 'CvarNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_408', function(val, _values, result) { var self = this;
      result = $cg(self, 'NilNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_409', function(val, _values, result) { var self = this;
      result = $cg(self, 'UndefinedNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_410', function(val, _values, result) { var self = this;
      result = $cg(self, 'NullNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_411', function(val, _values, result) { var self = this;
      result = $cg(self, 'SelfNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_412', function(val, _values, result) { var self = this;
      result = $cg(self, 'TrueNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_413', function(val, _values, result) { var self = this;
      result = $cg(self, 'FalseNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_414', function(val, _values, result) { var self = this;
      result = $cg(self, 'FileNode').m$new(val['m$[]'](0));

      return result;
    });

    $defn(self, '_reduce_415', function(val, _values, result) { var self = this;
      result = $cg(self, 'LineNode').m$new(val['m$[]'](0));

      return result;
    });









    $defn(self, '_reduce_420', function(val, _values, result) { var self = this;
      result = nil;

      return result;
    });

    $defn(self, '_reduce_421', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_422', function(val, _values, result) { var self = this;
      result = nil;

      return result;
    });

    $defn(self, '_reduce_423', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_424', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_425', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2), val['m$[]'](4), val['m$[]'](5)];

      return result;
    });

    $defn(self, '_reduce_426', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2), nil, val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_427', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil, val['m$[]'](2), val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_428', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), nil, nil, val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_429', function(val, _values, result) { var self = this;var rsult;
      rsult = [nil, val['m$[]'](0), val['m$[]'](2), val['m$[]'](3)];

      return result;
    });

    $defn(self, '_reduce_430', function(val, _values, result) { var self = this;
      result = [nil, val['m$[]'](0), nil, val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_431', function(val, _values, result) { var self = this;
      result = [nil, nil, val['m$[]'](0), val['m$[]'](1)];

      return result;
    });

    $defn(self, '_reduce_432', function(val, _values, result) { var self = this;
      result = [nil, nil, nil, val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_433', function(val, _values, result) { var self = this;
      result = [nil, nil, nil, nil];

      return result;
    });

    $defn(self, '_reduce_434', function(val, _values, result) { var self = this;
      result = "this.yyerror('formal argument cannot be a constant');";

      return result;
    });

    $defn(self, '_reduce_435', function(val, _values, result) { var self = this;
      result = "this.yyerror('formal argument cannot be an instance variable');";

      return result;
    });

    $defn(self, '_reduce_436', function(val, _values, result) { var self = this;
      result = "this.yyerror('formal argument cannot be a class variable');";

      return result;
    });

    $defn(self, '_reduce_437', function(val, _values, result) { var self = this;
      result = "this.yyerror('formal argument cannot be a global variable');";

      return result;
    });



    $defn(self, '_reduce_439', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_440', function(val, _values, result) { var self = this;
      val['m$[]'](0)['m$<<'](val['m$[]'](2));
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_441', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2)];

      return result;
    });

    $defn(self, '_reduce_442', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_443', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);
      val['m$[]'](0)['m$<<'](val['m$[]'](2));

      return result;
    });





    $defn(self, '_reduce_446', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_447', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });





    $defn(self, '_reduce_450', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_451', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_452', function(val, _values, result) { var self = this;
      result = nil;

      return result;
    });

    $defn(self, '_reduce_453', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_454', function(val, _values, result) { var self = this;
      result = val['m$[]'](1);

      return result;
    });

    $defn(self, '_reduce_455', function(val, _values, result) { var self = this;
      result = [];

      return result;
    });

    $defn(self, '_reduce_456', function(val, _values, result) { var self = this;
      result = val['m$[]'](0);

      return result;
    });

    $defn(self, '_reduce_457', function(val, _values, result) { var self = this;
      self.m$raise(("unsupported assoc list type (" + "#@line_number)"));

      return result;
    });

    $defn(self, '_reduce_458', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0)];

      return result;
    });

    $defn(self, '_reduce_459', function(val, _values, result) { var self = this;
      result = val['m$[]'](0)['m$<<'](val['m$[]'](2));

      return result;
    });

    $defn(self, '_reduce_460', function(val, _values, result) { var self = this;
      result = [val['m$[]'](0), val['m$[]'](2)];

      return result;
    });

    $defn(self, '_reduce_461', function(val, _values, result) { var self = this;
      result = [$cg(self, 'SymbolNode').m$new(val['m$[]'](0)), val['m$[]'](1)];

      return result;
    });



















































    return $defn(self, '_reduce_none', function(val, _values, result) { var self = this;
      return val['m$[]'](0);
    });

    }, 0);
}, 2);
}
var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, $class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, $range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm;return $$();
});opal.lib('racc/parser', function($rb, self, __FILE__) {function $$(){













return $class(self, nil, 'Racc', function(self) { 

  return $class(self, nil, 'Parser', function(self) {

    $defn(self, '_racc_setup', function() { var self = this;
      return $cg(self, 'Racc_arg');
    });

    $defn(self, 'do_parse', function() { var self = this;
      return self.m$_racc_do_parse_rb(self.m$_racc_setup(), false);
    });

    return $defn(self, '_racc_do_parse_rb', function(arg, in_debug) { var self = this;var action_table, action_check, action_default, action_pointer, goto_table, goto_check, goto_default, goto_pointer, nt_base, reduce_table, token_table, shift_n, reduce_n, use_result, racc_state, racc_tstack, racc_vstack, racc_t, racc_tok, racc_val, racc_read_next, racc_user_yyerror, racc_error_status, token, act, i, nerr, custate, __a, __b, __c, __d, curstate, reduce_i, reduce_len, reduce_to, method_id, tmp_v, reduce_call_result, k1;
      action_table = arg['m$[]'](0);
      action_check = arg['m$[]'](1);
      action_default = arg['m$[]'](2);
      action_pointer = arg['m$[]'](3);

      goto_table = arg['m$[]'](4);
      goto_check = arg['m$[]'](5);
      goto_default = arg['m$[]'](6);
      goto_pointer = arg['m$[]'](7);

      nt_base = arg['m$[]'](8);
      reduce_table = arg['m$[]'](9);
      token_table = arg['m$[]'](10);
      shift_n = arg['m$[]'](11);
      reduce_n = arg['m$[]'](12);

      use_result = arg['m$[]'](13);


      racc_state = [0];
      racc_tstack = [];
      racc_vstack = [];

      racc_t = nil;
      racc_tok = nil;
      racc_val = nil;
      racc_read_next = true;

      racc_user_yyerror = false;
      racc_error_status = 0;

      token = nil;      act = nil;      i = nil;      nerr = nil;      custate = nil;

      __a = false; while (__a || ((__b = true, __b !== false && __b !== nil))) {__a = false;
      i = action_pointer['m$[]'](racc_state['m$[]'](-1));

      if ((__b = i, __b !== false && __b !== nil)) {
        if ((__b = racc_read_next, __b !== false && __b !== nil)) {
          if (racc_t.valueOf() !== (0).valueOf()) {
            token = self.m$next_token();

            racc_tok = token['m$[]'](0);
            racc_val = token['m$[]'](1);

            if (racc_tok.valueOf() === false.valueOf()) {
              racc_t = 0;
            } else {
              racc_t = token_table['m$[]'](racc_tok);
              if(!((__b = racc_t, __b !== false && __b !== nil))) {racc_t = 1};

            }

            racc_read_next = false;
          }
        }

        i = i['m$+'](racc_t);

        if ((__b = (((__c = (((__d = (i < 0)), __d != false && __d != nil) ? __d : (act = action_table['m$[]'](i))['m$nil?']())), __c != false && __c != nil) ? __c : (action_check['m$[]'](i).valueOf() !== racc_state['m$[]'](-1).valueOf())), __b !== false && __b !== nil)) {
          act = action_default['m$[]'](racc_state['m$[]'](-1));
        }

      } else {
        act = action_default['m$[]'](racc_state['m$[]'](-1));
      }

      if ((__b = (((__c = act > 0), __c != false && __c != nil) ? act < shift_n : __c), __b !== false && __b !== nil)) {
        if (racc_error_status > 0) {
          if (racc_t.valueOf() !== (1).valueOf()) {
            racc_error_status = racc_error_status['m$-'](1);
          }
        }

        racc_vstack.m$push(racc_val);
        curstate = act;
        racc_state['m$<<'](act);
        racc_read_next = true;

      } else if ((__b = (((__c = act < 0), __c != false && __c != nil) ? act > -reduce_n : __c), __b !== false && __b !== nil)) {
        reduce_i = act * -3;
        reduce_len = reduce_table['m$[]'](reduce_i);
        reduce_to = reduce_table['m$[]'](reduce_i + 1);
        method_id = reduce_table['m$[]'](reduce_i + 2);

        tmp_v = racc_vstack.m$last(reduce_len);

        racc_state.m$pop(reduce_len);
        racc_vstack.m$pop(reduce_len);
        racc_tstack.m$pop(reduce_len);

        if ((__b = use_result, __b !== false && __b !== nil)) {
          reduce_call_result = self.m$__send__(method_id, tmp_v, nil, tmp_v['m$[]'](0));
          racc_vstack.m$push(reduce_call_result);
        } else {
          self.m$raise("not using result??");
        }

        racc_tstack.m$push(reduce_to);

        k1 = reduce_to - nt_base;

        if ((reduce_i = goto_pointer['m$[]'](k1)).valueOf() !== nil.valueOf()) {
          reduce_i = reduce_i['m$+'](racc_state['m$[]'](-1));

          if ((__b = (((__c = (((__d = (reduce_i >= 0)), __d != false && __d != nil) ? ((curstate = goto_table['m$[]'](reduce_i)).valueOf() !== nil.valueOf()) : __d)), __c != false && __c != nil) ? (goto_check['m$[]'](reduce_i).valueOf() === k1.valueOf()) : __c), __b !== false && __b !== nil)) {
            racc_state.m$push(curstate);
          } else {
            racc_state.m$push(goto_default['m$[]'](k1));
          }

        } else {
          racc_state.m$push(goto_default['m$[]'](k1));
        }

      } else if (act.valueOf() === shift_n.valueOf()) {

        return racc_vstack['m$[]'](0);

      } else if (act.valueOf() === -reduce_n.valueOf()) {

        self.m$raise(("Opal Syntax Error: unexpected '" + (racc_tok.m$inspect()).m$to_s() + "'"));

      } else {
        self.m$raise(("Rac: unknown action: " + (act).m$to_s()));
      }


      };
    });
    }, 0);
}, 2);
}
var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, $class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, $range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm;return $$();
});
opal.lib('strscan', function($rb, self, __FILE__) {function $$(){return $class(self, nil, 'StringScanner', function(self) {

  $defn(self, 'initialize', function(str) { var self = this;
    self._str = str;
     self._at = 0;
     self._matched = "";
     self._working_string = str;
    return nil;
  });

  $defn(self, 'scan', function(reg) { var self = this;
    reg = new RegExp('^' + reg.toString().substr(1, reg.toString().length - 2));
    var res = reg.exec(self._working_string);

    if (res == null) {
      self.matched = "";
      return false;
    }
    else if (typeof res == 'object') {
      self._at += res[0].length;
      self._working_string = self._working_string.substr(res[0].length);
      self._matched = res[0];
      return res[0];
    }
    else if (typeof res == 'string') {
      self._at += res.length;
      self._working_string = self._working_string.substr(res.length);
      return res;
    }
    else {
      return false;
    }
  });

  $defn(self, 'check', function(reg) { var self = this;
    reg = new RegExp('^' + reg.toString().substr(1, reg.toString().length - 2));
    return reg.exec(self._working_string) ? true : false;
  });

  $defn(self, 'peek', function(len) { var self = this;
    return self._working_string.substr(0, len);
  });

  $defn(self, 'eos?', function() { var self = this;
    return self._working_string.length == 0;
  });

  return $defn(self, 'matched', function() { var self = this;
    return self._matched;
  });
}, 0);
}
var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, $class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, $range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm;return $$();
});
opal.lib('dev', function($rb, self, __FILE__) {function $$(){self.m$require('opal/lexer');

$class(self, nil, 'Opal', function(self) { 

  $defs(self, 'compile', function(source) { var self = this;var res;
    res = $cg(self, 'Parser').m$new().m$parse(source, $hash('method_missing', true));
    return res;
  });

  $defs(self, 'run_ruby_content', function(source, filename) { var self = this;var js;if (filename == undefined) {filename = "(opal)";}
    js = self.m$compile(source);
    opal.run(new Function("(" + js +
        ")(opal.runtime, opal.runtime.top, '')"));

    return nil;
  });






  $defs(self, 'run_remote_content', function(filename) { var self = this;
    var xhr;

    if (window.ActiveXObject)
      xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
    else
      xhr = new XMLHttpRequest();

    xhr.open('GET', filename, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        opal.run(function() {
        if (xhr.status == 0 || xhr.status == 200) {
          self.m$run_ruby_content(xhr.responseText, filename);
        } else {
          self.m$raise(("LoadError: Cannot load: " + (filename).m$to_s()));
        }
        });
      }
    };
    xhr.send(null);
    return nil;
  });

  return $defs(self, 'run_script_tags', function() { var self = this;
    var scripts = document.getElementsByTagName('script');

    for (var i = 0, ii = scripts.length; i < ii; i++) {
      var script = scripts[i];

      if (script.type == "text/ruby") {
        if (script.src) {
          self.m$run_remote_content(script.getAttribute('src', 2));
        } else {
          opal.run(function() {
          self.m$run_ruby_content(script.innerHTML, "(script-tag)");
          });
        }
      }
    }

    return nil;
  });
}, 2);

opal.compile = function(source, options) {
  console.log("need to compile some code");
  return $cg(self, 'Opal').m$compile(source);
};

if (typeof window !== 'undefined') {
  var runner = function() { $cg(self, 'Opal').m$run_script_tags(); };

  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', runner, false);
  } else {
    window.attachEvent('onload', runner);
  }
}

var repl_running = false;

opal.browser_repl = function() {
  if (repl_running) return;
  repl_running = true;

  var html = '<div id="opal-repl" style="position: fixed; width: 100%; height: '
           +     '230px; bottom: 0px; overflow: scroll; border-top: 4px solid'
           +     '#A5A5A5; left: 0px; padding: 4px; background-color: #E5E5E5;">'

           +   '<div id="opal-stdout" style="font-family: \'Bitstream Vera Sans'
           +       'Mono\', \'Courier\', monospace; font-size: 12px"></div>'

           +   '<span style="float: left; display: block; font-family: \'Bitst'
           +       'ream Vera Sans Mono\', \'Courier\', monospace; font-size: '
           +       '12px">&gt;&gt;&nbsp;</span>'

           +   '<input id="opal-stdin" type="text" style="position: relative;'
           +       'float: left; right: 0px; width: 500px; font-family: \'Bit'
           +       'stream Vera Sans Mono\', \'Courier\', monospace;'
           +       'font-size: 12px; outline-width: 0; outline: none; border:'
           +       '0px; padding: 0px; margin: 0px; background: none" />'

           + '</div>';

  var host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  var opal_repl = document.getElementById('opal-repl');

  var stdout = document.getElementById('opal-stdout');
  var stdin = document.getElementById('opal-stdin');
  var history = [], history_idx = 0;
  setTimeout(function() { stdin.focus(); }, 0);

  var puts_content = function(str) {
    var elem = document.createElement('pre');
    elem.textContent == null ? elem.innerText = str : elem.textContent = str;
    elem.style.margin = "0px";
    stdout.appendChild(elem);
  };

  var stdin_keydown = function(evt) {
    if (evt.keyCode == 13) {
      var ruby = stdin.value;

      history.push(stdin.value);
      history_idx = history.length;
      stdin.value = '';
      puts_content(">> " + ruby);

      opal.run(function() {
        puts_content("=> " + $cg(self, 'Opal').m$run_ruby_content(ruby, '(irb)').m$inspect().toString());
      });

      opal_repl.scrollTop = opal_repl.scrollHeight;
    }
    else if (evt.keyCode == 38) {
      if (history_idx > 0) {
        history_idx -= 1;
        stdin.value = history[history_idx];
      }
    }
    else if (evt.keyCode == 40) {
      if (history_idx < history.length - 1) {
        history_idx += 1;
        stdin.value = history[history_idx];
      }
    }
  };

  if (stdin.addEventListener) {
    stdin.addEventListener('keydown', stdin_keydown, false);
  } else {
    stdin.attachEvent('onkeydown', stdin_keydown);
  }

  $defs($rb.gg('$stdout'), 'puts', function(a) { var self = this;a = [].slice.call(arguments, 0);

  for (var i = 0, ii = a.length; i < ii; i ++) {
      puts_content(a[i].m$to_s().toString());
    }
  return nil;
});

  puts_content("opal REPL! Type command then <enter>.");
};
}
var nil = $rb.Qnil, $super = $rb.S, $break = $rb.B, $class = $rb.dc, $defn = $rb.dm, $defs = $rb.ds, $cg = $rb.cg, $range = $rb.G, $hash = $rb.H, $B = $rb.P, $rb_send = $rb.sm;return $$();
});
opal.require('dev');