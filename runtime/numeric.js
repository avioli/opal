/**
 * call-seq:
 *    Numeric.allocate
 */
function rb_num_alloc() {
  rb_raise(rb_eRuntimeError, "cannot instantiate instance of Numeric class");
}

/**
 * call-seq:
 *    num + other_num     -> num_result
 */
function rb_num_plus(num, mid, other) {
  return num + other;
}

/**
 * call-seq:
 *    +num    -> num
 */
function rb_num_uplus(num) {
  return num;
}

/**
 * call-seq:
 *    num - other_num     -> num_result
 */
function rb_num_minus(num, mid, other) {
  return num - other;
}

/**
 * call-seq:
 *    -num    -> negative_num
 */
function rb_num_uminus(num) {
  return -num;
}

/**
 * call-seq:
 *    num * other_num   -> num_result
 */
function rb_num_mul(num, mid, other) {
  return num * other;
}

/**
 * call-seq:
 *    num / other_num     -> num_result
 */
function rb_num_div(num, mid, other) {
  return num / other;
}

/**
 * call-seq:
 *    num ** other_num    -> num_result
 */
function rb_num_pow(num, mid, other) {
  return Math.pow(num, other);
}

function Init_Numeric() {
  rb_cNumeric = rb_bridge_class(Number.prototype,
                                T_OBJECT | T_NUMBER, "Numeric", rb_cObject);

  rb_define_singleton_method(rb_cNumeric, "allocate", rb_num_alloc);
}
