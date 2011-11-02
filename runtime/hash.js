/**
 * call-seq:
 *    Hash[keys_and_values]     -> hash
 */
function hash_s_create(hash, mid) {
  var args = ArraySlice.call(arguments, 2);

  return Rt.H.apply(null, args);
}

/**
 * call-seq:
 *    Hash.alloc    -> hash
 */
function hash_alloc(hash) {
  return Rt.H();
}

/**
 * call-seq:
 *    hash == other_hash    -> true or false
 */
function hash_equal(hash1, mid, hash2) {
  if (hash1 === hash2) {
    return true;
  }
  else if (!hash2 || !(hash2.$flags & T_HASH)) {
    return false;
  }
  else if (hash1.k.length !== hash2.k.length) {
    return false;
  }

  var keys = hash1.k, values = hash1.a, values2 = hash2.a;

  for (var i = 0, ii = keys.length; i < ii; i++) {
    var key = keys[i], assoc = rb_hash(key), val = values[assoc];

    if (!values2[assoc]) {
      return false;
    }

    if (!val.$m['=='](val, '==', values2[assoc])) {
      return false;
    }
  }

  return true;
}

/**
 * call-seq:
 *    hash[key]     -> object or nil
 */
function hash_aref(hash, mid, key) {
  var assoc = rb_hash(key);

  if (hash.a[assoc]) {
    return hash.a[assoc];
  }

  return hash.d;
}

/**
 * call-seq:
 *    hash[key] = value   -> value
 */
function hash_aset(hash, mid, key, value) {
  var assoc = rb_hash(key);

  if (!hash.a[assoc]) {
    hash.k.push(key);
  }

  return hash.a[assoc] = value;
}

function Init_Hash() {
  rb_cHash = rb_define_class("Hash", rb_cObject);

  rb_define_singleton_method(rb_cHash, "[]", hash_s_create);
  rb_define_singleton_method(rb_cHash, "alloc", hash_alloc);

  rb_define_method(rb_cHash, "==", hash_equal);
  rb_define_method(rb_cHash, "[]", hash_aref);
  rb_define_method(rb_cHash, "[]=", hash_aset);
}
