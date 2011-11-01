/**
 * call-seq:
 *    String.new(str)     -> str
 */
function rb_str_new(cls, mid, str) {
  return new String(str);
}

/**
 * call-seq:
 *    str == other_string     -> true or false
 *    str === other_string    -> true of false
 */
function rb_str_equal(str, mid, other) {
  return str === other;
}

/**
 * call-seq:
 *    str.to_s     -> str
 */
function rb_str_to_s(str) {
  return str.toString();
}

/**
 * call-seq:
 *    str + other_str     -> new_str
 */
function rb_str_plus(str, mid, other) {
  return str + other;
}

/**
 * call-seq:
 *    str.captialize    -> new_str
 */
function rb_str_capitalize(str) {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

/**
 * call-seq:
 *    str.downcase    -> new_str
 */
function rb_str_downcase(str) {
  return str.toLowerCase();
}

/**
 * call-seq:
 *    str.upcase    -> new_str
 */
function rb_str_upcase(str) {
  return str.toUpperCase();
}

/**
 * call-seq:
 *    str.inspect     -> new_str
 */
function rb_str_inspect(str) {
  /* borrowed from json2.js, see file for license */
  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

  escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

  meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  };

  escapable.lastIndex = 0;

  return escapable.test(str) ? '"' + str.replace(escapable, function (a) {
    var c = meta[a];
    return typeof c === 'string' ? c :
      '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) + '"' : '"' + str + '"';
}

/**
 * call-seq:
 *    str.length    -> integer
 *    str.size      -> integer
 */
function rb_str_length(str) {
  return str.length;
}

/**
 * call-seq:
 *    str.intern    -> symbol
 *    str.to_sym    -> symbol
 */
function rb_str_intern(str) {
  return rb_intern(str);
}

/**
 * call-seq:
 *    str.reverse     -> new_string
 */
function rb_str_reverse(str) {
  return str.split('').reverse().join('');
}

/**
 * call-seq:
 *    str.succ    -> new_string
 *    str.next    -> new_string
 */
function rb_str_succ(str) {
  return String.fromCharCode(str.charCodeAt(0));
}

/**
 * call-seq:
 *    str[index]        -> new_str
 *    str.slice(index)  -> new_str
 */
function rb_str_aref_m(str, mid, index, length) {
  if (typeof(index) === 'number') {
    if (typeof(length) === 'number') {
      return str.substr(index, length < 0 ? str.length + length : length);
    }
    else {
      return str.charAt(index);
    }
  }
  else if (index.$flags & T_RANGE) {
    return str.substr(index.begin, index.end < 0 ? str.length + index.end : index.end);
  }
  else {
    return str.match(index)[0];
  }
}

/**
 * call-seq:
 *    str.sub(pattern)            -> new_string
 *    str.sub(pattern, replace)   -> new_string
 */
function rb_str_sub(str, mid, pattern, replace) {
  var block = rb_str_sub.proc;

  if (!block && replace === undefined) {
    rb_raise(rb_eArgError, "wrong number of arguments (1 for 1..2)");
  }

  rb_str_sub.proc = null;
  replace = replace || function(r) { return block(block.yself, null, r); }

  return str.replace(pattern, replace);
}

/**
 * call-seq:
 *    str.gsub(pattern)           -> new_string
 *    str.gsub(pattern, replace)  -> new_string
 */
function rb_str_gsub(str, mid, pattern, replace) {
  pattern = pattern.toString();
  pattern = pattern.substr(1, pattern.lastIndexOf('/') - 1);
  pattern = new RegExp(pattern, 'g');

  if (rb_str_gsub.proc) {
    rb_str_sub.proc = rb_str_gsub.proc;
    rb_str_gsub.proc = null;
  }

  return rb_str_sub(str, "sub", pattern, replace);
}

/**
 * call-seq:
 *    str.split(str2)     -> array
 */
function rb_str_split(str, mid, split) {
  return str.split(split);
}

/**
 * call-seq:
 *    str <=> other_str     -> -1 or 0 or 1 or nil
 */
function rb_str_cmp_m(str, mid, other) {
  if (typeof other !== 'string') {
    return null;
  }
  else if (str > other) {
    return 1;
  }
  else if (str < other) {
    return -1;
  }
  else {
    return 0;
  }
}

/**
 * call-seq:
 *    str =~ obj    -> object
 */
function rb_str_match(str, mid, obj) {
  if (typeof obj === 'string') {
    rb_raise(rb_eTypeError, "type mismatch: String given");
  }

  return obj.$m['=~'](obj, '=~', str);
}

/**
 * call-seq:
 *    str.casecmp(other_str)    -> -1 or 1 or 0 or nil
 */
function rb_str_casecmp(str, mid, other) {
  if (typeof other !== 'string') {
    return null;
  }

  var a = str.toLowerCase(), b = str.toLowerCase();

  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

/**
 * call-seq:
 *    str.empty?    -> true or false
 */
function rb_str_empty(str) {
  return str.length === 0;
}

/**
 * call-seq:
 *    str.end_with?(string)     -> true or false
 */
function rb_str_end_with(str, mid, suffix) {
  return str.lastIndexOf(suffix) === str.length - suffix.length;
}

/**
 * call-seq:
 *    str.include?(string)    -> true or false
 */
function rb_str_include(str, mid, other) {
  return str.indexOf(other) !== -1;
}

/**
 * call-seq:
 *    str.index(substr)     -> integer or null
 */
function rb_str_index(str, mid, substr) {
  var result = str.indexOf(substr);
  return result === -1 ? null : result;
}

/**
 * call-seq:
 *    str.lstrip    -> new_string
 */
function rb_str_lstrip(str) {
  return str.replace(/^\s*/, '');
}

/**
 * call-seq:
 *    str.to_i    -> integer
 */
function rb_str_to_i(str, mid, base) {
  return parseInt(str, base);
}

/**
 * call-seq:
 *    str.to_f    -> float
 */
function rb_str_to_f(str) {
  return parseFloat(str);
}

function rb_sym_to_s(sym) {
  return sym.toString();
}

function rb_sym_inspect(sym) {
  return ":" + sym.toString();
}

function Init_String() {
  rb_cString = rb_bridge_class(String.prototype,
                               T_OBJECT | T_STRING, "String", rb_cObject);

  rb_define_singleton_method(rb_cString, "new", rb_str_new);

  rb_define_method(rb_cString, "to_s", rb_str_to_s);
  rb_define_method(rb_cString, "==", rb_str_equal);
  rb_define_method(rb_cString, "===", rb_str_equal);
  rb_define_method(rb_cString, "eql?", rb_str_equal);
  rb_define_method(rb_cString, "+", rb_str_plus);
  rb_define_method(rb_cString, "capitalize", rb_str_capitalize);
  rb_define_method(rb_cString, "downcase", rb_str_downcase);
  rb_define_method(rb_cString, "upcase", rb_str_upcase);
  rb_define_method(rb_cString, "inspect", rb_str_inspect);
  rb_define_method(rb_cString, "length", rb_str_length);
  rb_define_method(rb_cString, "size", rb_str_length);
  rb_define_method(rb_cString, "to_sym", rb_str_intern);
  rb_define_method(rb_cString, "intern", rb_str_intern);
  rb_define_method(rb_cString, "reverse", rb_str_reverse);
  rb_define_method(rb_cString, "next", rb_str_succ);
  rb_define_method(rb_cString, "succ", rb_str_succ);
  rb_define_method(rb_cString, "[]", rb_str_aref_m);
  rb_define_method(rb_cString, "slice", rb_str_aref_m);
  rb_define_method(rb_cString, "sub", rb_str_sub);
  rb_define_method(rb_cString, "gsub", rb_str_gsub);
  rb_define_method(rb_cString, "split", rb_str_split);
  rb_define_method(rb_cString, "<=>", rb_str_cmp_m);
  rb_define_method(rb_cString, "=~", rb_str_match);
  rb_define_method(rb_cString, "casecmp", rb_str_casecmp);
  rb_define_method(rb_cString, "emtpy?", rb_str_empty);
  rb_define_method(rb_cString, "include?", rb_str_include);
  rb_define_method(rb_cString, "index", rb_str_index);
  rb_define_method(rb_cString, "lstrip", rb_str_lstrip);
  rb_define_method(rb_cString, "to_i", rb_str_to_i);
  rb_define_method(rb_cString, "to_f", rb_str_to_f);


  rb_cSymbol = rb_define_class("Symbol", rb_cObject);

  rb_define_method(rb_cSymbol, "to_s", rb_sym_to_s);
  rb_define_method(rb_cSymbol, "inspect", rb_sym_inspect);
}
