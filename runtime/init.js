/**
 * All intern (ids) used within runtime for sending methods.
 */
var id_eq,            // ==
    id_eql,           // eql?
    id_match,         // =~
    id_inspect;       // inspect

/**
 * Map of string real names to their id (e.g. "some_name" => "wD")
 */
var INTERN_TABLE = {};

/**
 * Symbol Table. ID => Symbol instances.
 */
var SYMBOL_TABLE = {};

/**
 * ID to Symbol
 */
function ID2SYM(id) {
}

/**
 * Symbol to ID
 */
function SYM2ID(sym) {

}

/**
 * String => ID
 */
function rb_intern(name) {
  var id = INTERN_TABLE[name];

  if (!id) {
    
  }
}

/**
 * Symbol from string - shortcut of ID2SYM(rb_intern('A_KEY'))
 */
function rb_symbol(str) {
  return ID2SYM(rb_intern(str));
}

/**
  Main init method. This is called once this file has fully loaded. It setups
  all the core objects and classes and required runtime features.
*/
function init() {
  Init_Object();
  Init_VM();

  Init_Array();

  Init_Hash();
  Init_Numeric();

  Init_String();

  Init_Proc();

  rb_cRange = rb_define_class('Range', rb_cObject);

  rb_cRegexp = rb_bridge_class(RegExp.prototype,
    T_OBJECT, 'Regexp', rb_cObject);

  rb_cMatch = rb_define_class('MatchData', rb_cObject);
  rb_define_hooked_variable('$~', rb_regexp_match_getter, rb_gvar_readonly_setter);

  Init_Exception();

  rb_cIO = rb_define_class('IO', rb_cObject);
  rb_stdin = new RObject(rb_cIO);
  rb_stdout = new RObject(rb_cIO);
  rb_stderr = new RObject(rb_cIO);

  rb_define_singleton_method(rb_stdout, 'write', rb_stdout_write);
  rb_define_singleton_method(rb_stdout, 'flush', rb_stdout_flush);

  rb_define_method(rb_cIO, 'puts', rb_boot_io_puts);

  rb_const_set(rb_cObject, 'STDIN', rb_stdin);
  rb_const_set(rb_cObject, 'STDOUT', rb_stdout);
  rb_const_set(rb_cObject, 'STDERR', rb_stderr);

  rb_define_hooked_variable('$stdin', rb_stdio_getter, rb_stdio_setter);
  rb_define_hooked_variable('$stdout', rb_stdio_getter, rb_stdio_setter);
  rb_define_hooked_variable('$stderr', rb_stdio_getter, rb_stdio_setter);

  rb_define_hooked_variable('$:', rb_load_path_getter, rb_gvar_readonly_setter);
  rb_define_hooked_variable('$LOAD_PATH', rb_load_path_getter, rb_gvar_readonly_setter);

  Op.loader = new Loader(Op);
  Op.cache = {};

  rb_const_set(rb_cObject, 'RUBY_ENGINE', PLATFORM_ENGINE);
  rb_const_set(rb_cObject, 'RUBY_PLATFORM', PLATFORM_PLATFORM);
  rb_const_set(rb_cObject, 'RUBY_VERSION', PLATFORM_VERSION);
  rb_const_set(rb_cObject, 'ARGV', PLATFORM_ARGV);

  // only load corelib if defined (in browser). Corelib is loaded seperately
  // in gem session.
  if (typeof(core_lib) !== 'undefined') {
    core_lib(opal.runtime, opal.runtime.top, '(corelib)');
  }
};

