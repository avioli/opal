/**
 * call-seq:
 *    Array.allocate    -> ary
 */
function rb_ary_alloc(cls) {
  var ary = [];
  ary.$klass = cls;
  ary.$m = cls.$m_tbl;
  return ary;
}

/**
 * call-seq:
 *    Array[]       -> ary
 */
function rb_ary_s_create() {
  var ary = ArraySlice.call(arguments, 2);
  return ary;
}

/**
 * call-seq:
 *    Array.new(length, fill)     -> ary
 */
function rb_ary_initialize(ary, mid, length, fill) {
  if (length === undefined) {
    length = 0;
  }

  for (var i = 0; i < length; i++) {
    ary[i] = fill;
  }

  return ary;
}

/**
 * call-seq:
 *    ary + other_ary     -> new_ary
 */
function rb_ary_plus(ary, mid, ary2) {
  return ary.slice().concat(ary2.slice());
}

/**
 * call-seq:
 *    ary - other_ary     -> new_ary
 */
function rb_ary_diff(ary, mid, ary2) {
  rb_raise(rb_eNotImplementedError, "Array#-");
}

/**
 * call-seq:
 *    ary << obj        -> ary
 */
function rb_ary_push(ary, mid, obj) {
  ary.push(obj);
  return ary;
}

/**
 * call-seq:
 *    ary[idx]        -> obj
 *    ary[idx, len]   -> ary
 *
 * TODO: does not yet work with ranges
 */
function rb_ary_aref(ary, mid, index, length) {
  if (index < 0) {
    index += ary.length;
  }

  if (length !== undefined) {
    if (length <= 0) {
      return [];
    }

    return ary.slice(index, index + length);
  }
  else {
    return ary[index]
  }
}

/**
 * call-seq:
 *    ary[idx] = obj
 *
 * TODO: need to expand functionality
 */
function rb_ary_aset(ary, mid, index, value) {
  if (index < 0) {
    index += ary.length;
  }

  return ary[index] = value;
}

/**
 * call-seq:
 *    ary == other_ary    -> true or false
 */
function rb_ary_equal(ary, mid, ary2) {
  if (ary.length !== ary2.length) {
    return false;
  }

  for (var i = 0, ii = ary.length; i < ii; i++) {
    var arg = ary[i];

    if (!arg.$m['=='](arg, "==", ary2[i])) {
      return false;
    }
  }

  return true;
}

/**
 * call-seq:
 *    ary.assoc(obj)    -> new_ary or nil
 */
function rb_ary_assoc(ary, mid, obj) {
  for (var i = 0, ii = ary.length; i < ii; i++) {
    var arg = ary[i], item;

    if (arg.length !== undefined) {
      var item = arg[0];

      if ((item == null ? NilObj : item).$m['=='](item, "==", obj)) {
        return arg;
      }
    }
  }

  return null;
}

/**
 * call-seq:
 *    ary.at(idx)     -> obj or nil
 */
function rb_ary_at(ary, mid, idx) {
  if (idx < 0) {
    idx += ary.length;
  }

  return ary[idx];
}

/**
 * call-seq:
 *    ary.clear     -> ary
 */
function rb_ary_clear(ary) {
  ary.splice(0);
  return ary;
}

/**
 * call-seq:
 *    ary.clone     -> new_ary
 */
function rb_ary_clone(ary) {
  return ary.slice(0);
}

/**
 * call-seq:
 *    ary.collect {}    -> new_ary
 *    ary.map {}        -> new_ary
 */
function rb_ary_collect(ary) {
  var block = rb_ary_collect.proc;

  if (!block) {
    return rb_enum_for(self, "collect");
  }

  rb_ary_collect.proc = null;
  var result = [], yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    result.push(block(yself, null, ary[i]));
  }

  return result;
}

/**
 * call-seq:
 *    ary.collect! {}     -> ary
 *    ary.map! {}         -> ary
 */
function rb_ary_collect_bang(ary) {
  var block = rb_ary_collect_bang.proc;

  if (!block) {
    return rb_enum_for(self, "collect!");
  }

  rb_ary_collect_bang.proc = null;
  var yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    ary[i] = block(yself, null, ary[i]);
  }

  return ary;
}

/**
 * call-seq:
 *    ary.combination     -> obj
 */
function rb_ary_combination(ary) {
  rb_raise(rb_eNotImplementedError, "Array#combination");
}

/**
 * call-seq:
 *    ary.compact     -> new_ary
 */
function rb_ary_compact(ary) {
  var result = [];

  for (var i = 0, ii = ary.length; i < ii; i++) {
    var arg = ary[i];

    if (arg != null) {
      result.push(arg);
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.compact!    -> ary
 */
function rb_ary_compact_bang(ary) {
  var size = ary.length;

  for (var i = 0; i < ary.length; i++) {
    if (ary[i] == null) {
      ary.splice(i, 1);
      i--;
    }
  }

  return size === ary.length ? null : ary;
}

/**
 * call-seq:
 *    ary.concat(other_ary)     -> ary
 */
function rb_ary_concat(ary, mid, ary2) {
  for (var i = 0, ii = ary2.length; i < ii; i++) {
    ary.push(ary2[i]);
  }

  return ary;
}

/**
 * call-seq:
 *    ary.count       -> ary_length
 *    ary.count(obj)  -> count
 */
function rb_ary_count(ary, mid, obj) {
  if (obj === undefined) {
    return ary.length;
  }

  var result = 0, arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];

    if (arg.$m['=='](arg, "==", obj)) {
      result++;
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.cycle
 */
function rb_ary_cycle(ary) {
  rb_raise(rb_eNotImplementedError, "Array#cycle");
}

/**
 * call-seq:
 *    ary.delete(obj)   -> obj
 *    ary.delete(obj)   -> nil
 */
function rb_ary_delete(ary, mid, obj) {
  var size = ary.length, arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];

    if (arg.$m["=="](arg, "==", obj)) {
      ary.splice(i, 1);
      i--;
      ii--;
    }
  }

  return size === ary.length ? null : obj;
}

/**
 * call-seq:
 *    ary.delete_at(idx)    -> obj
 */
function rb_ary_delete_at(ary, mid, idx) {
  if (idx < 0) {
    idx += ary.length;
  }

  if (idx < 0 || idx >= 0) {
    return null;
  }

  var result = ary[idx];
  ary.splice(idx, 1);

  return result;
}

/**
 * call-seq:
 *    ary.delete_if {}  -> ary
 */
function rb_ary_delete_if(ary) {
  var block = rb_ary_delete_if.proc;

  if (!block) {
    return rb_enum_for(ary, "delete_if");
  }

  rb_ary_delete_if.proc = null;
  var yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    if (block(yself, null, ary[i])) {
      ary.splice(i, 1);
      i--;
      ii--;
    }
  }

  return ary;
}

/**
 * call-seq:
 *    ary.drop(num)     -> new_ary
 */
function rb_ary_drop(ary, mid, num) {
  if (num > ary.length) {
    return [];
  }

  return ary.slice(num);
}

/**
 * call-seq:
 *    ary.drop_while {}     -> new_ary
 */
function rb_ary_drop_while(ary, mid) {
  var block = rb_ary_drop_while.proc;

  if (!block) {
    return rb_enum_for(ary, "drop_while");
  }

  rb_ary_drop_while.proc = null;
  var yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    if (!block(yself, null, ary[i])) {
      return ary.slice(i);
    }
  }

  return [];
}

/**
 * call-seq:
 *    ary.each {}   -> ary
 */
function rb_ary_each(ary) {
  var block = rb_ary_each.proc;

  if (!block) {
    return rb_enum_for(ary, "each");
  }

  rb_ary_each.proc = null;
  var yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    block(yself, null, ary[i]);
  }

  return ary;
}

/**
 * call-seq:
 *    ary.each_index {}     -> ary
 */
function rb_ary_each_index(ary) {
  var block = rb_ary_each_index.proc;

  if (!block) {
    return rb_enum_for(ary, "each_index");
  }

  rb_ary_each_index.proc = null;
  var yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    block(yself, null, i);
  }

  return ary;
}

/**
 * call-seq:
 *    ary.empty?    -> true or false
 */
function rb_ary_empty_p(ary) {
  return ary.length === 0;
}

/**
 * call-seq:
 *    ary.fetch(idx)            -> obj
 *    ary.fetch(idx, default)   -> obj
 *    ary.fetch(idx) {}         -> obj
 */
function rb_ary_fetch(ary, mid, idx, defaults) {
  var index = idx, block = rb_ary_fetch.proc;
  rb_ary_fetch.proc = null;

  if (idx < 0) {
    idx += ary.length;
  }

  if (idx >= 0 && idx < ary.length) {
    return ary[idx];
  }

  if (defaults === undefined) {
    rb_raise(rb_eIndexError, "Array#fetch");
  }
  else if (block) {
    return block(block.self, null, index);
  }
  else {
    return defaults;
  }
}

/**
 * call-seq:
 *    ary.fill
 */
function rb_ary_fill(ary) {
  rb_raise(rb_eNotImplementedError, "Array#fill");
}

/**
 * call-seq:
 *    ary.first       -> obj
 *    ary.first(num)  -> new_ary
 */
function rb_ary_first(ary, mid, obj) {
  if (obj === undefined) {
    if (ary.length === 0) {
      return null;
    }

    return ary[0];
  }

  return ary.slice(0, obj);
}

/**
 * call-seq:
 *    ary.flatten         -> new_ary
 *    ary.flatten(level)  -> new_ary
 */
function rb_ary_flatten(ary, mid, level) {
  var result = [];

  for (var i = 0, ii = ary.length; i < ii; i++) {
    var arg = ary[i];

    if (arg != null && arg.length !== undefined) {
      if (level === undefined) {
        result = result.concat(arg.$m.flatten(arg, "flatten"));
      }
      else if (level === 0) {
        result.push(arg);
      }
      else {
        result = result.concat(arg.$m.flatten(arg, "flatten", level - 1));
      }
    }
    else {
      result.push(arg);
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.flatten!          -> new_ary
 *    ary.flatten!(level)   -> new_ary
 */
function rb_ary_flatten_bang(ary, mid, level) {
  return ary.splice(0, 0, rb_ary_flatten(ary, "flatten", level));
}

/**
 * call-seq:
 *    ary.includes?(obj)    -> true or false
 */
function rb_ary_includes(ary, mid, obj) {
  var arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = arg[i];

    if (arg.$m["=="](arg, null, obj)) {
      return true;
    }
  }

  return false;
}

/**
 * call-seq:
 *    ary.index(obj)    -> idx
 */
function rb_ary_index(ary, mid, obj) {
  for (var i = 0, ii = ary.length; i < ii; i++) {
    var arg = ary[i];

    if (arg.$m["=="](arg, "==", obj)) {
      return i;
    }
  }

  return null;
}

/**
 * call-seq:
 *    ary.inset(idx, obj, ...)    -> ary
 */
function rb_ary_insert(ary, mid, idx) {
  var objs = ArraySlice.call(arguments, 3);

  if (idx < 0) {
    idx += ary.length;
  }

  if (idx < 0 || idx >= ary.length) {
    rb_raise(rb_eIndexError, "out of range");
  }

  ary.splice.apply(ary, [idx, 0].concat(objs));

  return ary;
}

/**
 * call-seq:
 *    ary.inspect     -> str
 */
function rb_ary_inspect(ary) {
  var result = [], arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    var arg = ary[i];

    result.push((arg == null ? NilObj : arg).$m.inspect(arg, "inspect"));
  }

  return "[" + result.join(", ") + "]";
}

/**
 * call-seq:
 *    ary.join        -> str
 *    ary.join(sep)   -> str
 */
function rb_ary_join(ary, mid, sep) {
  if (sep === undefined) {
    sep = '';
  }

  return ary.join(sep);
}

/**
 * call-seq:
 *    ary.keep_if {}    -> ary
 */
function rb_ary_keep_if(ary) {
  var block = rb_ary_keep_if.proc;

  if (!block) {
    return rb_enum_for(ary, "keep_if");
  }

  rb_ary_keep_if.proc = null;
  var yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    if (!block(yself, null, ary[i])) {
      ary.splice(i, 1);
      i--;
      ii--;
    }
  }

  return ary;
}

/**
 * call-seq:
 *    ary.last        ->> obj
 *    ary.last(num)   -> new_ary
 */
function rb_ary_last(ary, mid, num) {
  var size = ary.length;

  if (num === undefined) {
    return ary[size - 1];
  }
  else {
    if (num > size) {
      num = size;
    }

    return ary.slice(size - num, size);
  }
}

/**
 * call-seq:
 *    ary.length    -> num
 *    ary.size      -> num
 */
function rb_ary_length(ary) {
  return ary.length;
}

/**
 * call-seq:
 *    ary.pack
 */
function rb_ary_pack(ary) {
  rb_raise(rb_eNotImplementedError, "Array#pack");
}

/**
 * call-seq:
 *    ary.permutation
 */
function rb_ary_permutation(ary) {
  rb_raise(rb_eNotImplementedError, "Array#permutation");
}

/**
 * call-seq:
 *    ary.pop       -> obj
 *    ary.pop(num)  -> new_ary
 */
function rb_ary_pop_m(ary, mid, num) {
  var size = ary.length;

  if (num === undefined) {
    return ary.pop();
  }
  else {
    return ary.splice(size - num, size);
  }
}

/**
 * call-seq:
 *    ary.product
 */
function rb_ary_product(ary) {
  rb_raise(rb_eNotImplementedError, "Array#product");
}

/**
 * call-seq:
 *    ary.push(*objs)     -> ary
 */
function rb_ary_push_m(ary) {
  for (var i = 2, ii = arguments.length; i < ii; i++) {
    ary.push(arguments[i]);
  }

  return ary;
}

/**
 * call-seq:
 *    ary.rassoc(obj)     -> an_obj
 */
function rb_ary_rassoc(ary, mid, obj) {
  var arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];

    if (arg != null && arg.length !== undefined) {
      if (arg.$m['=='](arg, "==", obj)) {
        return arg;
      }
    }
  }

  return null;
}

/**
 * call-seq:
 *    ary.reject {}     -> new_ary
 */
function rb_ary_reject(ary) {
  var block = rb_ary_reject.proc;

  if (!block) {
    return rb_enum_for(ary, "reject");
  }

  rb_ary_reject.proc = null;
  var yself = block.self, result;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    if (!block(yself, null, ary[i])) {
      result.push(ary[i]);
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.reject! {}    -> ary
 */
function rb_ary_reject_bang(ary) {
  var block = rb_ary_reject_bang.proc;

  if (!block) {
    return rb_enum_for(ary, "reject!");
  }

  var size = ary.length, yself = block.self;
  rb_ary_reject_bang.proc = null;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    if (block(yself, null, ary[i])) {
      ary.splice(i, 1);
      i--;
      ii--;
    }
  }

  return size === ary.length ? null : ary;
}

function rb_ary_repeated_combination() {
  rb_raise(rb_eNotImplementedError, "Array#repeated_combination");
}

function rb_ary_repeated_permutation() {
  rb_raise(rb_eNotImplementedError, "Array#repeated_permutation");
}

/**
 * call-seq:
 *    ary.replace(other_ary)    -> ary
 */
function rb_ary_replace(ary, mid, ary2) {
  ary.splice(0);

  for (var i = 0; i < ary2.length; i++) {
    ary[i] = ary2[i];
  }

  return ary;
}

/**
 * call-seq:
 *    ary.reverse   -> new_ary
 */
function rb_ary_reverse(ary, mid) {
  return ary.reverse();
}

/**
 * call-seq:
 *    ary.reverse!    -> ary
 */
function rb_ary_reverse_bang(ary) {
  return rb_ary_replace(ary, null, ary.reverse());
}

/**
 * call-seq:
 *    ary.reverse_each {}     -> ary
 */
function rb_ary_reverse_each(ary) {
  var block = rb_ary_reverse_each.proc;

  if (!block) {
    return rb_enum_for(ary, "reverse_each");
  }

  rb_ary_reverse_each.proc = null;
  var yself = block.self;

  for (var i = ary.length - 1; i >= 0; i--) {
    block(yself, null, ary[i]);
  }

  return ary;
}

function rb_ary_rindex() {
  rb_raise(rb_eNotImplementedError, "Array#rindex");
}

function rb_ary_rotate() {
  rb_raise(rb_eNotImplementedError, "Array#rotate");
}

function rb_ary_rotate_bang() {
  rb_raise(rb_eNotImplementedError, "Array#rotate!");
}

function rb_ary_sample() {
  rb_raise(rb_eNotImplementedError, "Array#sample");
}

/**
 * call-seq:
 *    ary.select {}     -> new_ary
 */
function rb_ary_select(ary) {
  var block = rb_ary_select.proc;

  if (!block) {
    return rb_enum_for(ary, "select");
  }

  rb_ary_select.proc = null;
  var yself = block.self, result = [], arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];

    if (block(yself, null, arg)) {
      result.push(arg);
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.select! {}    -> ary or nil
 */
function rb_ary_select_bang(ary) {
  var block = rb_ary_select_bang.proc;

  if (!block) {
    return rb_enum_for(ary, "select!");
  }

  rb_ary_select_bang.proc = null;
  var size = ary.length, yself = block.self, arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    if (!block(yself, null, ary[i])) {
      ary.splice(i, 1);
      i--;
      ii--;
    }
  }

  return ary.length === size ? null : ary;
}

/**
 * call-seq:
 *    ary.shift       -> obj
 *    ary.shift(num)  -> new_ary
 */
function rb_ary_shift(ary, mid, count) {
  if (count === undefined) {
    return ary.shift();
  }
  else {
    return ary.splice(0, count);
  }
}

function rb_ary_shuffle() {
  rb_raise(rb_eNotImplementedError, "Array#shuffle");
}

function rb_ary_shuffle_bang() {
  rb_raise(rb_eNotImplementedError, "Array#shuffle!");
}

/**
 * call-seq:
 *    ary.slice!(index)           -> obj or nil
 *    ary.slice!(index, length)   -> ary
 *
 * TODO: does not work with ranges
 */
function rb_ary_slice_bang(ary, mid, index, length) {
  if (index < 0) {
    index += ary.length;
  }

  if (index >= ary.length || index < 0) {
    return null;
  }

  if (length !== undefined) {
    return ary.splice(index, index + length);
  }
  else {
    return ary.splice(index, 1)[0];
  }
}

function rb_ary_sort() {
  rb_raise(rb_eNotImplementedError, "Array#sort");
}

function rb_ary_sort_bang() {
  rb_raise(rb_eNotImplementedError, "Array#sort!");
}

function rb_ary_sort_by_bang() {
  rb_raise(rb_eNotImplementedError, "Array#sort_by!");
}

/**
 * call-seq:
 *    ary.take(count)   -> new_ary
 */
function rb_ary_take(ary, mid, count) {
  return ary.slice(0, count);
}

/**
 * call-seq:
 *    ary.take_while {}     -> new_ary
 */
function rb_ary_take_while(ary) {
  var block = rb_ary_take_while.proc;

  if (!block) {
    return rb_enum_for(ary, "take_while");
  }

  rb_ary_take_while.proc = null;
  var result = [], yself = block.self, arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];

    if (block(yself, null, arg)) {
      result.push(arg);
    }
    else {
      return result;
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.to_a    -> ary
 *    ary.to_ary  -> ary
 */
function rb_ary_to_a(ary) {
  return ary;
}

function rb_ary_transpose() {
  rb_raise(rb_eNotImplementedError, "Array#transpose")
}

/**
 * call-seq:
 *    ary.uniq    -> new_ary
 */
function rb_ary_uniq(ary) {
  var result = [], seen = {}, arg, hash;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];
    hash = rb_hash(arg);

    if (!seen[hash]) {
      seen[hash] = true;
      result.push(arg);
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.uniq!     -> ary or nil
 */
function rb_ary_uniq_bang(ary) {
  var seen = {}, size = ary.length, arg, hash;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];
    hash = rb_hash(arg);

    if (!seen[hash]) {
      seen[hash] = true;
    }
    else {
      ary.splice(i, 1);
      i--;
      ii--;
    }
  }

  return ary.length === size ? null : ary;
}

/**
 * call-seq:
 *    ary.unshift(*objs)    -> ary
 */
function rb_ary_unshift(ary, mid) {
  var objs = ArraySlice.call(arguments, 2);

  for (var i = objs.length - 1; i >= 0; i--) {
    ary.unshift(objs[i]);
  }

  return ary;
}

function rb_ary_values_at() {
  rb_raise(rb_eNotImplementedError, "Array#values_at");
}

function rb_ary_zip() {
  rb_raise(rb_eNotImplementedError, "Array#zip");
}

function rb_ary_or() {
  rb_raise(rb_eNotImplementedError, "Array#or");
}

/**
 * call-seq:
 *    ary.each_with_index {}    -> ary
 */
function rb_ary_each_with_index(ary) {
  var block = rb_ary_each_with_index.proc;

  if (!block) {
    return rb_enum_for(ary, "each_with_index");
  }

  rb_ary_each_with_index.proc = null;
  var yself = block.self;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    block(yself, null, ary[i], i);
  }

  return ary;
}

/**
 * call-seq:
 *    ary.grep(pattern)   -> new_ary
 */
function rb_ary_grep(ary, mid, pattern) {
  var result = [], arg;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    arg = ary[i];

    if (pattern.test(arg)) {
      result.push(arg);
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary.inject {}            -> obj
 *    ary.inject(initial) {}   -> obj
 */
function rb_ary_inject(ary, mid, initial) {
  var block = rb_ary_inject.proc;

  if (!block) {
    return rb_enum_for(ary, "inject");
  }

  rb_ary_inject.proc = null;
  var yself = block.self;

  if (initial === undefined) {
    var i = 1, result = ary[0];
  }
  else {
    var i = 0, result = initial;
  }

  for (var len = ary.length; i < len; i++) {
    result = block(yself, null, result, ary[i]);
  }

  return result;
}

/**
 * call-seq:
 *    ary & other_ary     -> new_ary
 */
function rb_ary_and(ary, mid, other) {
  var result = [], seen = {};

  for (var i = 0, ii = ary.length; i < ii; i++) {
    var arg = ary[i], hash = rb_hash(arg);

    if (!seen[hash]) {
      for (var j = 0, jj = other.length; j < jj; j++) {
        var arg2 = other[j], hash2 = rb_hash(arg2);

        if ((hash === hash2) && !seen[hash]) {
          seen[hash] = true;
          result.push(arg);
        }
      }
    }
  }

  return result;
}

/**
 * call-seq:
 *    ary * str   -> string
 *    ary * num   -> new_ary
 */
function rb_ary_times(ary, mid, other) {
  if (typeof other === 'string') {
    return rb_ary_join(ary, "join", other);
  }

  var result = [];

  for (var i = 0; i < other; i++) {
    result = result.concat(ary);
  }

  return result;
}

/**
 * call-seq:
 *    ary <=> other     -> -1 or 0 or 1 or nil
 */
function rb_ary_cmp(ary, mid, other) {
  if (rb_hash(ary) === rb_hash(other)) {
    return 0;
  }

  var tmp;

  for (var i = 0, ii = ary.length; i < ii; i++) {
    tmp = ary[i].$m['<=>'](ary[i], "<=>", other[i]);

    if (tmp !== 0) {
      return tmp;
    }
  }

  if (ary.length === other.length) {
    return 0;
  }
  else if (ary.length > other.length) {
    return 1;
  }
  else {
    return -1;
  }
}

function Init_Array() {
  rb_cArray = rb_bridge_class(Array.prototype,
                               T_OBJECT | T_ARRAY, "Array", rb_cObject);

  //rb_include_module(rb_cArray, rb_mEnumerable);

  rb_define_singleton_method(rb_cArray, "[]", rb_ary_s_create);
  rb_define_singleton_method(rb_cArray, "allocate", rb_ary_alloc);
  rb_define_singleton_method(rb_cArray, "initialize", rb_ary_initialize);

  rb_define_method(rb_cArray, "+", rb_ary_plus);
  rb_define_method(rb_cArray, "-", rb_ary_diff);
  rb_define_method(rb_cArray, "<<", rb_ary_push);

  rb_define_method(rb_cArray, "[]", rb_ary_aref);
  rb_define_method(rb_cArray, "[]=", rb_ary_aset);
  rb_define_method(rb_cArray, "==", rb_ary_equal);
  rb_define_method(rb_cArray, "eql?", rb_ary_equal);

  rb_define_method(rb_cArray, "assoc", rb_ary_assoc);
  rb_define_method(rb_cArray, "at", rb_ary_at);
  rb_define_method(rb_cArray, "clear", rb_ary_clear);
  rb_define_method(rb_cArray, "clone", rb_ary_clone);
  rb_define_method(rb_cArray, "dup", rb_ary_clone);
  rb_define_method(rb_cArray, "collect", rb_ary_collect);
  rb_define_method(rb_cArray, "map", rb_ary_collect);
  rb_define_method(rb_cArray, "collect!", rb_ary_collect_bang);
  rb_define_method(rb_cArray, "combination", rb_ary_combination);
  rb_define_method(rb_cArray, "compact", rb_ary_compact);
  rb_define_method(rb_cArray, "compact!", rb_ary_compact_bang);
  rb_define_method(rb_cArray, "concat", rb_ary_concat);
  rb_define_method(rb_cArray, "count", rb_ary_count);
  rb_define_method(rb_cArray, "cycle", rb_ary_cycle);
  rb_define_method(rb_cArray, "delete", rb_ary_delete);
  rb_define_method(rb_cArray, "delete_at", rb_ary_delete_at);
  rb_define_method(rb_cArray, "delete_if", rb_ary_delete_if);
  rb_define_method(rb_cArray, "drop", rb_ary_drop);
  rb_define_method(rb_cArray, "drop_while", rb_ary_drop_while);
  rb_define_method(rb_cArray, "each", rb_ary_each);
  rb_define_method(rb_cArray, "each_index", rb_ary_each_index);
  rb_define_method(rb_cArray, "empty?", rb_ary_empty_p);
  rb_define_method(rb_cArray, "fetch", rb_ary_fetch);
  rb_define_method(rb_cArray, "fill", rb_ary_fill);
  rb_define_method(rb_cArray, "first", rb_ary_first);
  rb_define_method(rb_cArray, "flatten", rb_ary_flatten);
  rb_define_method(rb_cArray, "flatten!", rb_ary_flatten_bang);
  rb_define_method(rb_cArray, "include?", rb_ary_includes);
  rb_define_method(rb_cArray, "index", rb_ary_index);
  rb_define_method(rb_cArray, "find_index", rb_ary_index);
  rb_define_method(rb_cArray, "insert", rb_ary_insert);
  rb_define_method(rb_cArray, "inspect", rb_ary_inspect);
  rb_define_method(rb_cArray, "join", rb_ary_join);
  rb_define_method(rb_cArray, "keep_if", rb_ary_keep_if);
  rb_define_method(rb_cArray, "last", rb_ary_last);
  rb_define_method(rb_cArray, "length", rb_ary_length);
  rb_define_method(rb_cArray, "size", rb_ary_length);
  rb_define_method(rb_cArray, "pack", rb_ary_pack);
  rb_define_method(rb_cArray, "permutation", rb_ary_permutation);
  rb_define_method(rb_cArray, "pop", rb_ary_pop_m);
  rb_define_method(rb_cArray, "product", rb_ary_product);
  rb_define_method(rb_cArray, "push", rb_ary_push_m);
  rb_define_method(rb_cArray, "rassoc", rb_ary_rassoc);
  rb_define_method(rb_cArray, "reject", rb_ary_reject);
  rb_define_method(rb_cArray, "reject!", rb_ary_reject_bang);
  rb_define_method(rb_cArray, "repeated_combination", rb_ary_repeated_combination);
  rb_define_method(rb_cArray, "repeated_permutation", rb_ary_repeated_permutation);
  rb_define_method(rb_cArray, "replace", rb_ary_replace);
  rb_define_method(rb_cArray, "reverse", rb_ary_reverse);
  rb_define_method(rb_cArray, "reverse!", rb_ary_reverse_bang);
  rb_define_method(rb_cArray, "reverse_each", rb_ary_reverse_each);
  rb_define_method(rb_cArray, "rindex", rb_ary_rindex);
  rb_define_method(rb_cArray, "rotate", rb_ary_rotate);
  rb_define_method(rb_cArray, "rotate!", rb_ary_rotate_bang);
  rb_define_method(rb_cArray, "sample", rb_ary_sample);
  rb_define_method(rb_cArray, "select", rb_ary_select);
  rb_define_method(rb_cArray, "select!", rb_ary_select_bang);
  rb_define_method(rb_cArray, "shift", rb_ary_shift);
  rb_define_method(rb_cArray, "shuffle", rb_ary_shuffle);
  rb_define_method(rb_cArray, "shuffle!", rb_ary_shuffle_bang);
  rb_define_method(rb_cArray, "slice", rb_ary_aref);
  rb_define_method(rb_cArray, "slice!", rb_ary_slice_bang);
  rb_define_method(rb_cArray, "sort", rb_ary_sort);
  rb_define_method(rb_cArray, "sort!", rb_ary_sort_bang);
  rb_define_method(rb_cArray, "sort_by!", rb_ary_sort_by_bang);
  rb_define_method(rb_cArray, "take", rb_ary_take);
  rb_define_method(rb_cArray, "take_while", rb_ary_take_while);
  rb_define_method(rb_cArray, "to_a", rb_ary_to_a);
  rb_define_method(rb_cArray, "to_ary", rb_ary_to_a);
  rb_define_method(rb_cArray, "to_s", rb_ary_inspect);
  rb_define_method(rb_cArray, "transpose", rb_ary_transpose);
  rb_define_method(rb_cArray, "uniq", rb_ary_uniq);
  rb_define_method(rb_cArray, "uniq!", rb_ary_uniq_bang);
  rb_define_method(rb_cArray, "unshift", rb_ary_unshift);
  rb_define_method(rb_cArray, "values_at", rb_ary_values_at);
  rb_define_method(rb_cArray, "zip", rb_ary_zip);
  rb_define_method(rb_cArray, "|", rb_ary_or);
  rb_define_method(rb_cArray, "each_with_index", rb_ary_each_with_index);
  rb_define_method(rb_cArray, "grep", rb_ary_grep);
  rb_define_method(rb_cArray, "inject", rb_ary_inject);
  rb_define_method(rb_cArray, "&", rb_ary_and);
  rb_define_method(rb_cArray, "*", rb_ary_times);
  rb_define_method(rb_cArray, "<=>", rb_ary_cmp);
}
