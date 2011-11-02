/**
 * call-seq:
 *    Numeric.allocate
 */
function num_alloc() {
  rb_raise(rb_eRuntimeError, "cannot instantiate instance of Numeric class");
}

/**
 * call-seq:
 *    num + other_num     -> num_result
 */
function num_plus(num, mid, other) {
  return num + other;
}

/**
 * call-seq:
 *    +num    -> num
 */
function num_uplus(num) {
  return num;
}

/**
 * call-seq:
 *    num - other_num     -> num_result
 */
function num_minus(num, mid, other) {
  return num - other;
}

/**
 * call-seq:
 *    -num    -> negative_num
 */
function num_uminus(num) {
  return -num;
}

/**
 * call-seq:
 *    num * other_num   -> num_result
 */
function num_mul(num, mid, other) {
  return num * other;
}

/**
 * call-seq:
 *    num / other_num     -> num_result
 */
function num_div(num, mid, other) {
  return num / other;
}

/**
 * call-seq:
 *    num ** other_num    -> num_result
 */
function num_pow(num, mid, other) {
  return Math.pow(num, other);
}

/**
 * call-seq:
 *    num == other_num    -> true or false
 *    num === other_num   -> true or false
 */
function num_equal(num, mid, other) {
  return num === other;
}

/**
 * call-seq:
 *    num < other_num     -> true or false
 */
function num_lt(num, mid, other) {
  return num < other;
}

/**
 * call-seq:
 *    num <= other_num    -> true or false
 */
function num_le(num, mid, other) {
  return num <= other;
}

/**
 * call-seq:
 *    num > other_num     -> true or false
 */
function num_gt(num, mid, other) {
  return num > other;
}

/**
 * call-seq:
 *    num >= other_num    -> true or false
 */
function num_ge(num, mid, other) {
  return num >= other;
}

/**
 * call-seq:
 *    num % other_num     -> numeric
 */
function num_mod(num, mid, other) {
  return num % other;
}

/**
 * call-seq:
 *    num & other_num     -> numeric
 */
function num_and(num, mid, other) {
  return num & other;
}

/**
 * call-seq:
 *    num | other_num     -> numeric
 */
function num_or(num, mid, other) {
  return num | other;
}

/**
 * call-seq:
 *    ~num    -> numeric
 */
function num_rev(num, mid, other) {
  return ~num;
}

/**
 * call-seq:
 *    num ^ other_num     -> numeric
 */
function num_xor(num, mid, other) {
  return num ^ other;
}

/**
 * call-seq:
 *    num << other_num    -> numeric
 */
function num_lshift(num, mid, other) {
  return num << other;
}

/**
 * call-seq:
 *    num >> other_num    -> numeric
 */
function num_rshift(num, mid, other) {
  return num >> other;
}

/**
 * call-seq:
 *    num <=> other     -> -1 or 1 or 0 or nil
 */
function num_cmp(num, mid, other) {
  if (typeof other !== 'number') {
    return null;
  }

  if (num < other) return -1;
  if (num > other) return 1;
  return 0;
}

/**
 * call-seq:
 *    num.abs         -> numeric
 *    num.magnitude   -> numeric
 */
function num_abs(num) {
  return Math.abs(num);
}

/**
 * call-seq:
 *    num.even?     -> true or false
 */
function num_even_p(num) {
  return num % 2 === 0;
}

/**
 * call-seq:
 *    num.odd?    -> true or false
 */
function num_odd_p(num) {
  return num % 2 !== 0;
}

/**
 * call-seq:
 *    num.succ    -> numeric
 */
function num_succ(num) {
  return num + 1;
}

/**
 * call-seq:
 *    num.pred    -> numeric
 */
function num_pred(num) {
  return num - 1;
}

/**
 * call-seq:
 *    num.upto {}     -> num
 */
function num_upto(num, mid, finish) {
  var block = num_upto.proc;

  if (!block) {
    return rb_enum_for(num, "upto");
  }

  var yself = block.self;
  num_upto.proc = null;

  for (var i = num; i <= finish; i++) {
    block(yself, null, i);
  }

  return num;
}

/**
 * call-seq:
 *    num.downto {}     -> num
 */
function num_downto(num, mid, finish) {
  var block = num_downto.proc;

  if (!block) {
    return rb_enum_for(num, "downto");
  }

  var yself = block.self;
  num_downto.proc = null;

  for (var i = num; i >= finish; i--) {
    block(yself, null, i);
  }

  return num;
}

/**
 * call-seq:
 *    num.times {}    -> num
 */
function num_times(num) {
  var block = num_times.proc;

  if (!block) {
    return rb_enum_for(num, "times");
  }

  var yself = block.self;
  num_times.proc = null;

  for (var i = 0; i < num; i++) {
    block(yself, null, i);
  }

  return num;
}

/**
 * call-seq:
 *    num.zero?     -> true or false
 */
function num_zero_p(num) {
  return num === 0;
}

/**
 * call-seq:
 *    num.nonzero?    -> true or false
 */
function num_nonzero_p(num) {
  return num === 0 ? null : num;
}

/**
 * call-seq:
 *    num.ceil    -> integer
 */
function num_ceil(num) {
  return Math.ceil(num);
}

/**
 * call-seq:
 *    num.floor     -> integer
 */
function num_floor(num) {
  return Math.floor(num);
}

/**
 * call-seq:
 *    num.integer?    -> true or false
 */
function num_int_p(num) {
  return num % 1 === 0;
}

/**
 * call-seq:
 *    num.to_s    -> string
 */
function num_to_s(num) {
  return num.toString();
}

/**
 * call-seq:
 *    num.to_i    -> integer
 */
function num_to_i(num) {
  return num;
}

/**
 * call-seq:
 *    num.to_f    -> float
 */
function num_to_f(num) {
  return num;
}

/**
 * call-seq:
 *    Integer === num     -> true or false
 */
function int_eqq(cls, mid, num) {
  return num % 1 === 0;
}

/**
 * call-seq:
 *    Float === num     -> true or false
 */
function flo_eqq(cls, mid, num) {
  return num % 1 !== 0;
}


function Init_Numeric() {
  rb_cNumeric = rb_bridge_class(Number.prototype,
                                T_OBJECT | T_NUMBER, "Numeric", rb_cObject);

  rb_define_singleton_method(rb_cNumeric, "allocate", num_alloc);

  rb_define_method(rb_cNumeric, "+", num_plus);
  rb_define_method(rb_cNumeric, "+@", num_uplus);
  rb_define_method(rb_cNumeric, "-", num_minus);
  rb_define_method(rb_cNumeric, "-@", num_uminus);
  rb_define_method(rb_cNumeric, "*", num_mul);
  rb_define_method(rb_cNumeric, "/", num_div);
  rb_define_method(rb_cNumeric, "**", num_pow);
  rb_define_method(rb_cNumeric, "==", num_equal);
  rb_define_method(rb_cNumeric, "===", num_equal);
  rb_define_method(rb_cNumeric, "<", num_lt);
  rb_define_method(rb_cNumeric, "<=", num_le);
  rb_define_method(rb_cNumeric, ">", num_gt);
  rb_define_method(rb_cNumeric, ">=", num_ge);
  rb_define_method(rb_cNumeric, "%", num_mod);
  rb_define_method(rb_cNumeric, "modulo", num_mod);
  rb_define_method(rb_cNumeric, "&", num_and);
  rb_define_method(rb_cNumeric, "|", num_or);
  rb_define_method(rb_cNumeric, "~", num_rev);
  rb_define_method(rb_cNumeric, "^", num_xor);
  rb_define_method(rb_cNumeric, "<<", num_lshift);
  rb_define_method(rb_cNumeric, ">>", num_rshift);
  rb_define_method(rb_cNumeric, "<=>", num_cmp);
  rb_define_method(rb_cNumeric, "abs", num_abs);
  rb_define_method(rb_cNumeric, "magnitude", num_abs);
  rb_define_method(rb_cNumeric, "even?", num_even_p);
  rb_define_method(rb_cNumeric, "odd?", num_odd_p);
  rb_define_method(rb_cNumeric, "succ", num_succ);
  rb_define_method(rb_cNumeric, "next", num_succ);
  rb_define_method(rb_cNumeric, "pred", num_pred);
  rb_define_method(rb_cNumeric, "upto", num_upto);
  rb_define_method(rb_cNumeric, "downto", num_downto);
  rb_define_method(rb_cNumeric, "times", num_times);
  rb_define_method(rb_cNumeric, "zero?", num_zero_p);
  rb_define_method(rb_cNumeric, "nonzero?", num_nonzero_p);
  rb_define_method(rb_cNumeric, "ceil", num_ceil);
  rb_define_method(rb_cNumeric, "floor", num_floor);
  rb_define_method(rb_cNumeric, "integer?", num_int_p);
  rb_define_method(rb_cNumeric, "to_s", num_to_s);
  rb_define_method(rb_cNumeric, "to_i", num_to_i);
  rb_define_method(rb_cNumeric, "to_f", num_to_f);

  rb_cInteger = rb_define_class("Integer", rb_cNumeric);
  rb_define_singleton_method(rb_cInteger, "===", int_eqq);

  rb_cFloat = rb_define_class("Float", rb_cNumeric);
  rb_define_singleton_method(rb_cFloat, "===", int_eqq);
}
