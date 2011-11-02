/**
 * call-seq:
 *    Proc.new {}     -> proc
 */
function proc_s_new() {
  var block = proc_s_new.proc;

  if (!block) {
    rb_raise(rb_eArgError, "tried to create Proc object without a block");
  }

  proc_s_new.proc = null;

  return block;
}

/**
 * call-seq:
 *    proc.call     -> object
 *    proc[]        -> object
 *    proc === obj  -> object
 *    proc.yield    -> object
 */
function proc_call(proc) {
  var args = ArraySlice.call(arguments, 2);
  return proc.apply(null, [proc.self, null].concat(args));
}

/**
 * call-seq:
 *    proc.to_proc    -> proc
 */
function proc_to_proc(proc) {
  return proc;
}

/**
 * call-seq:
 *    proc.to_s     -> string
 */
function proc_to_s(proc) {
  var str = "#<Proc:0x" + rb_hash(proc);

  if (proc.lambda) {
    str += " '(lambda)'";
  }

  str += ">";

  return str;
}

/**
 * call-seq:
 *    proc.lambda?    -> true or false
 */
function proc_lambda_p(proc) {
  return !!proc.lambda;
}

/**
 * call-seq:
 *    proc.arity    -> integer
 */
function proc_arity(proc) {
  return 1;
}

function Init_Proc() {
  rb_cProc = rb_bridge_class(Function.prototype,
                             T_OBJECT | T_PROC, "Proc", rb_cObject);

  rb_define_singleton_method(rb_cProc, "new", proc_s_new);

  rb_define_method(rb_cProc, "call", proc_call);
  rb_define_method(rb_cProc, "[]", proc_call);
  rb_define_method(rb_cProc, "===", proc_call);
  rb_define_method(rb_cProc, "yield", proc_call);
  rb_define_method(rb_cProc, "to_proc", proc_to_proc);
  rb_define_method(rb_cProc, "to_s", proc_to_s);
  rb_define_method(rb_cProc, "lambda?", proc_lambda_p);
  rb_define_method(rb_cProc, "arity", proc_arity);
}
