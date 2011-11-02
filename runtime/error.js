/**
  Exception classes. Some of these are used by runtime so they are here for
  convenience.
*/
var rb_eException,       rb_eStandardError,   rb_eLocalJumpError,  rb_eNameError,
    rb_eNoMethodError,   rb_eArgError,        rb_eScriptError,     rb_eLoadError,
    rb_eRuntimeError,    rb_eTypeError,       rb_eIndexError,      rb_eKeyError,
    rb_eRangeError,      rb_eNotImplementedError;

/**
  Standard jump exceptions to save re-creating them everytime they are needed
*/
var rb_eReturnInstance,
    rb_eBreakInstance,
    rb_eNextInstance;

/**
  Ruby break statement with the given value. When no break value is needed, nil
  should be passed here. An undefined/null value is not valid and will cause an
  internal error.

  @param {RubyObject} value The break value.
*/
Rt.B = function(value) {
  rb_eBreakInstance.$value = value;
  rb_raise_exc(eBreakInstance);
};

/**
  Ruby return, with the given value. The func is the reference function which
  represents the method that this statement must return from.
*/
Rt.R = function(value, func) {
  rb_eReturnInstance.$value = value;
  rb_eReturnInstance.$func = func;
  throw rb_eReturnInstance;
};

/**
 * Raises the exception class with the given string message.
 */
function rb_raise(exc, str) {
  if (str === undefined) {
    str = exc;
    exc = rb_eException;
  }

  var exception = rb_exc_new(exc, str);
  rb_raise_exc(exception);
}

/**
 * Actually raises an exception. Should be given an exception instance,
 * not a string.
 */
function rb_raise_exc(exc) {
  throw exc;
}

/**
 * Creates a new exception instance with the given class and message.
 */
function rb_exc_new(type, message) {
  var exc = new RObject(type);
  exc.$m.initialize(exc, "initialize", message);
  Error.captureStackTrace(exc, obj_raise);

  return exc;
}

/**
 * call-seq
 *    exc.initialize(msg)     -> exc
 */
function exc_initialize(exc, mid, message) {
  exc.message = message || "";
  return exc;
}

/**
 * call-seq:
 *    exc.backtrace     -> array
 */
function exc_backtrace(exc) {
  var bt = exc.bt;

  if (!bt) {
    bt = exc.bt = rb_exc_build_backtrace(exc, rb_exc_prepare_backtrace);
  }

  return bt;
}

/**
 * Build the backtrace
 */
function rb_exc_build_backtrace(exc, preparer) {
  var old = Error.prepareStackTrace;
  Error.prepareStackTrace = preparer;

  var bt = exc.stack;
  Error.prepareStackTrace = old;

  return bt;
}

/**
 * Prepares a backtrace compatible with MRI format. Returns array.
 */
function rb_exc_prepare_backtrace(exc, stack) {
  var code = [], f, b, k;

  for (var i = 0, ii = stack.length; i < ii; i++) {
    f = stack[i];
    b = f.getFunction();

    // only include real ruby methods
    if (!(k = b.$rbKlass)) {
      continue;
    }

    code.push("from " + f.getFileName() + ":" + f.getLineNumber() + ":in `" + b.$rbName + "'");
  }

  return code;
}

/**
 * Prepares a backtrace in rubinius format. Returns array.
 */
function rb_exc_prepare_awesome_backtrace(error, stack) {
  var code = [], f, b, k;

  for (var i = 0; i < stack.length; i++) {
    f = stack[i];
    b = f.getFunction();

    if (!(k = b.$rbKlass)) {
      continue;
    }

    if (k.$f & FL_SINGLETON && k .__classname__) {
      k = k.__classname__  + ".";
    } else {
      k = rb_class_real(b.$rbKlass) + "#";
    }

    code.push("from " + k + b.$rbName + " at " + f.getFileName() + ":" + f.getLineNumber());
  }

  return code;
};

/**
 * call-seq:
 *    exc.awesome_backtrace     -> array
 */
function exc_awesome_backtrace(exc) {
  var bt = exc.bt;

  if (!bt) {
    bt = exc.bt = rb_exc_build_backtrace(exc, rb_exc_prepare_awesome_backtrace);
  }

  return bt;
}

/**
 * call-seq:
 *    exc.inspect     -> string
 */
function exc_inspect(exc) {
  return "#<" + exc.$klass.__classid__ + ": '" + exc.message + "'>";
}

/**
 * call-seq:
 *    exc.to_s      -> string
 *    exc.message   -> string
 */
function exc_to_s(exc) {
  return exc.message;
}

/**
 * call-seq:
 *    raise(err)
 *    fail(err)
 */
function obj_raise(obj, mid, exception, string) {
  var msg, exc;

  if (typeof(exception) === 'string') {
    msg = exception;
    exc = rb_exc_new(rb_eRuntimeError, msg);
  }
  else if (rb_obj_is_kind_of(exception, null, rb_eException)) {
    exc = exception;
  }
  else {
    if (string !== undefined) {
      msg = string;
    }

    exc = rb_exc_new(exception, msg);
  }

  rb_raise_exc(exc);
}

function Init_Exception() {
  rb_eException = rb_bridge_class(Error.prototype,
                                  T_OBJECT, "Exception", rb_cObject);

  rb_define_method(rb_eException, "initialize", exc_initialize);
  rb_define_method(rb_eException, "backtrace", exc_backtrace);
  rb_define_method(rb_eException, "awesome_backtrace", exc_awesome_backtrace);
  rb_define_method(rb_eException, "inspect", exc_inspect);
  rb_define_method(rb_eException, "to_s", exc_to_s);
  rb_define_method(rb_eException, "message", exc_to_s);

  rb_define_method(rb_mKernel, "raise", obj_raise);
  rb_define_method(rb_mKernel, "fail", obj_raise);

  rb_eStandardError = rb_define_class("StandardError", rb_eException);
  rb_eRuntimeError = rb_define_class("RuntimeError", rb_eException);
  rb_eLocalJumpError = rb_define_class("LocalJumpError", rb_eStandardError);
  rb_eTypeError = rb_define_class("TypeError", rb_eStandardError);

  rb_eNameError = rb_define_class("NameError", rb_eStandardError);
  rb_eNoMethodError = rb_define_class('NoMethodError', rb_eNameError);
  rb_eArgError = rb_define_class('ArgumentError', rb_eStandardError);

  rb_eScriptError = rb_define_class('ScriptError', rb_eException);
  rb_eLoadError = rb_define_class('LoadError', rb_eScriptError);

  rb_eIndexError = rb_define_class("IndexError", rb_eStandardError);
  rb_eKeyError = rb_define_class("KeyError", rb_eIndexError);
  rb_eRangeError = rb_define_class("RangeError", rb_eStandardError);

  rb_eNotImplementedError = rb_define_class("NotImplementedError", rb_eException);

  rb_eBreakInstance = new Error('unexpected break');
  rb_eBreakInstance.$k = rb_eLocalJumpError;
  rb_block.b = rb_eBreakInstance;

  rb_eReturnInstance = new Error('unexpected return');
  rb_eReturnInstance.$k = rb_eLocalJumpError;

  rb_eNextInstance = new Error('unexpected next');
  rb_eNextInstance.$k = rb_eLocalJumpError;
}
