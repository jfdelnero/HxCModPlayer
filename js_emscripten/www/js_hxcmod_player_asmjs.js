// Copyright 2010 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

Module['arguments'] = [];
Module['thisProgram'] = './this.program';
Module['quit'] = function(status, toThrow) {
  throw toThrow;
};
Module['preRun'] = [];
Module['postRun'] = [];

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)');
}

// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

assert(typeof Module['memoryInitializerPrefixURL'] === 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] === 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] === 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] === 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  } else {
    return scriptDirectory + path;
  }
}

if (ENVIRONMENT_IS_NODE) {
  scriptDirectory = __dirname + '/';

  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  var nodeFS;
  var nodePath;

  Module['read'] = function shell_read(filename, binary) {
    var ret;
    ret = tryParseAsDataURI(filename);
    if (!ret) {
      if (!nodeFS) nodeFS = require('fs');
      if (!nodePath) nodePath = require('path');
      filename = nodePath['normalize'](filename);
      ret = nodeFS['readFileSync'](filename);
    }
    return binary ? ret : ret.toString();
  };

  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  if (process['argv'].length > 1) {
    Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  }

  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
  // Currently node will swallow unhandled rejections, but this behavior is
  // deprecated, and in the future it will exit with error status.
  process['on']('unhandledRejection', abort);

  Module['quit'] = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
} else
if (ENVIRONMENT_IS_SHELL) {


  if (typeof read != 'undefined') {
    Module['read'] = function shell_read(f) {
      var data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  Module['readBinary'] = function readBinary(f) {
    var data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof quit === 'function') {
    Module['quit'] = function(status) {
      quit(status);
    }
  }
} else
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }


  Module['read'] = function shell_read(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    Module['readBinary'] = function readBinary(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  Module['readAsync'] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

  Module['setWindowTitle'] = function(title) { document.title = title };
} else
{
  throw new Error('environment detection error');
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// If the user provided Module.print or printErr, use that. Otherwise,
// console.log is checked first, as 'print' on the web will open a print dialogue
// printErr is preferable to console.warn (works better in shells)
// bind(console) is necessary to fix IE/Edge closed dev tools panel behavior.
var out = Module['print'] || (typeof console !== 'undefined' ? console.log.bind(console) : (typeof print !== 'undefined' ? print : null));
var err = Module['printErr'] || (typeof printErr !== 'undefined' ? printErr : ((typeof console !== 'undefined' && console.warn.bind(console)) || out));

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = undefined;



// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// {{PREAMBLE_ADDITIONS}}

var STACK_ALIGN = 16;

// stack management, and other functionality that is provided by the compiled code,
// should not be used before it is ready
stackSave = stackRestore = stackAlloc = setTempRet0 = getTempRet0 = function() {
  abort('cannot use the stack before compiled code is ready to run, and has provided stack access');
};

function staticAlloc(size) {
  assert(!staticSealed);
  var ret = STATICTOP;
  STATICTOP = (STATICTOP + size + 15) & -16;
  assert(STATICTOP < TOTAL_MEMORY, 'not enough memory for static allocation - increase TOTAL_MEMORY');
  return ret;
}

function dynamicAlloc(size) {
  assert(DYNAMICTOP_PTR);
  var ret = HEAP32[DYNAMICTOP_PTR>>2];
  var end = (ret + size + 15) & -16;
  HEAP32[DYNAMICTOP_PTR>>2] = end;
  if (end >= TOTAL_MEMORY) {
    var success = enlargeMemory();
    if (!success) {
      HEAP32[DYNAMICTOP_PTR>>2] = ret;
      return 0;
    }
  }
  return ret;
}

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  var ret = size = Math.ceil(size / factor) * factor;
  return ret;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 === 0);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

var asm2wasmImports = { // special asm2wasm imports
    "f64-rem": function(x, y) {
        return x % y;
    },
    "debugger": function() {
        debugger;
    }
};



var jsCallStartIndex = 1;
var functionPointers = new Array(0);

// 'sig' parameter is only used on LLVM wasm backend
function addFunction(func, sig) {
  if (typeof sig === 'undefined') {
    err('warning: addFunction(): You should provide a wasm function signature string as a second argument. This is not necessary for asm.js and asm2wasm, but is required for the LLVM wasm backend, so it is recommended for full portability.');
  }
  var base = 0;
  for (var i = base; i < base + 0; i++) {
    if (!functionPointers[i]) {
      functionPointers[i] = func;
      return jsCallStartIndex + i;
    }
  }
  throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
}

function removeFunction(index) {
  functionPointers[index-jsCallStartIndex] = null;
}

var funcWrappers = {};

function getFuncWrapper(func, sig) {
  if (!func) return; // on null pointer, return undefined
  assert(sig);
  if (!funcWrappers[sig]) {
    funcWrappers[sig] = {};
  }
  var sigCache = funcWrappers[sig];
  if (!sigCache[func]) {
    // optimize away arguments usage in common cases
    if (sig.length === 1) {
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func);
      };
    } else if (sig.length === 2) {
      sigCache[func] = function dynCall_wrapper(arg) {
        return dynCall(sig, func, [arg]);
      };
    } else {
      // general case
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func, Array.prototype.slice.call(arguments));
      };
    }
  }
  return sigCache[func];
}


function makeBigInt(low, high, unsigned) {
  return unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0));
}

function dynCall(sig, ptr, args) {
  if (args && args.length) {
    assert(args.length == sig.length-1);
    assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
    return Module['dynCall_' + sig].apply(null, [ptr].concat(args));
  } else {
    assert(sig.length == 1);
    assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
    return Module['dynCall_' + sig].call(null, ptr);
  }
}


function getCompilerSetting(name) {
  throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for getCompilerSetting or emscripten_get_compiler_setting to work';
}

var Runtime = {
  // FIXME backwards compatibility layer for ports. Support some Runtime.*
  //       for now, fix it there, then remove it from here. That way we
  //       can minimize any period of breakage.
  dynCall: dynCall, // for SDL2 port
  // helpful errors
  getTempRet0: function() { abort('getTempRet0() is now a top-level function, after removing the Runtime object. Remove "Runtime."') },
  staticAlloc: function() { abort('staticAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."') },
  stackAlloc: function() { abort('stackAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."') },
};

// The address globals begin at. Very low in memory, for code size and optimization opportunities.
// Above 0 is static memory, starting with globals.
// Then the stack.
// Then 'dynamic' memory for sbrk.
var GLOBAL_BASE = 8;


// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html



//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS = 0;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

var JSfuncs = {
  // Helpers for cwrap -- it can't refer to Runtime directly because it might
  // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
  // out what the minified function name is.
  'stackSave': function() {
    stackSave()
  },
  'stackRestore': function() {
    stackRestore()
  },
  // type conversion from js to c
  'arrayToC' : function(arr) {
    var ret = stackAlloc(arr.length);
    writeArrayToMemory(arr, ret);
    return ret;
  },
  'stringToC' : function(str) {
    var ret = 0;
    if (str !== null && str !== undefined && str !== 0) { // null string
      // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
      var len = (str.length << 2) + 1;
      ret = stackAlloc(len);
      stringToUTF8(str, ret, len);
    }
    return ret;
  }
};

// For fast lookup of conversion functions
var toC = {
  'string': JSfuncs['stringToC'], 'array': JSfuncs['arrayToC']
};


// C calling interface.
function ccall(ident, returnType, argTypes, args, opts) {
  function convertReturnValue(ret) {
    if (returnType === 'string') return Pointer_stringify(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== 'array', 'Return type should not be "array".');
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

function cwrap(ident, returnType, argTypes, opts) {
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

/** @type {function(number, number, string, boolean=)} */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @type {function(number, string, boolean=)} */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((TypedArray|Array<number>|number), string, number, number=)} */
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [typeof _malloc === 'function' ? _malloc : staticAlloc, stackAlloc, staticAlloc, dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var stop;
    ptr = ret;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(/** @type {!Uint8Array} */ (slab), ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!staticSealed) return staticAlloc(size);
  if (!runtimeInitialized) return dynamicAlloc(size);
  return _malloc(size);
}

/** @type {function(number, number=)} */
function Pointer_stringify(ptr, length) {
  if (length === 0 || !ptr) return '';
  // Find the length, and check for UTF while doing so
  var hasUtf = 0;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    hasUtf |= t;
    if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (hasUtf < 128) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return UTF8ToString(ptr);
}

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAP8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(u8Array, idx) {
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  while (u8Array[endPtr]) ++endPtr;

  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var u0, u1, u2, u3, u4, u5;

    var str = '';
    while (1) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      u0 = u8Array[idx++];
      if (!u0) return str;
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      u1 = u8Array[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      u2 = u8Array[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u3 = u8Array[idx++] & 63;
        if ((u0 & 0xF8) == 0xF0) {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
        } else {
          u4 = u8Array[idx++] & 63;
          if ((u0 & 0xFC) == 0xF8) {
            u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
          } else {
            u5 = u8Array[idx++] & 63;
            u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
          }
        }
      }
      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8,ptr);
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x1FFFFF) {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x3FFFFFF) {
      if (outIdx + 4 >= endIdx) break;
      outU8Array[outIdx++] = 0xF8 | (u >> 24);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 5 >= endIdx) break;
      outU8Array[outIdx++] = 0xFC | (u >> 30);
      outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      ++len;
    } else if (u <= 0x7FF) {
      len += 2;
    } else if (u <= 0xFFFF) {
      len += 3;
    } else if (u <= 0x1FFFFF) {
      len += 4;
    } else if (u <= 0x3FFFFFF) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;
function UTF16ToString(ptr) {
  assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  while (HEAP16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var i = 0;

    var str = '';
    while (1) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) return str;
      ++i;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr) {
  assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

function demangle(func) {
  warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  return func;
}

function demangleAll(text) {
  var regex =
    /__Z[\w\d_]+/g;
  return text.replace(regex,
    function(x) {
      var y = demangle(x);
      return x === y ? x : (y + ' [' + x + ']');
    });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  var js = jsStackTrace();
  if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
  return demangleAll(js);
}

// Memory management

var PAGE_SIZE = 16384;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;
var MIN_TOTAL_MEMORY = 16777216;

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBuffer(buf) {
  Module['buffer'] = buffer = buf;
}

function updateGlobalBufferViews() {
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
}

var STATIC_BASE, STATICTOP, staticSealed; // static area
var STACK_BASE, STACKTOP, STACK_MAX; // stack area
var DYNAMIC_BASE, DYNAMICTOP_PTR; // dynamic area handled by sbrk

  STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
  staticSealed = false;


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  assert((STACK_MAX & 3) == 0);
  HEAPU32[(STACK_MAX >> 2)-1] = 0x02135467;
  HEAPU32[(STACK_MAX >> 2)-2] = 0x89BACDFE;
}

function checkStackCookie() {
  if (HEAPU32[(STACK_MAX >> 2)-1] != 0x02135467 || HEAPU32[(STACK_MAX >> 2)-2] != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x' + HEAPU32[(STACK_MAX >> 2)-2].toString(16) + ' ' + HEAPU32[(STACK_MAX >> 2)-1].toString(16));
  }
  // Also test the global address 0 for integrity. This check is not compatible with SAFE_SPLIT_MEMORY though, since that mode already tests all address 0 accesses on its own.
  if (HEAP32[0] !== 0x63736d65 /* 'emsc' */) throw 'Runtime error: The application has corrupted its heap memory area (address zero)!';
}

function abortStackOverflow(allocSize) {
  abort('Stack overflow! Attempted to allocate ' + allocSize + ' bytes on the stack, but stack has only ' + (STACK_MAX - stackSave() + allocSize) + ' bytes available!');
}


function abortOnCannotGrowMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
}


function enlargeMemory() {
  abortOnCannotGrowMemory();
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) err('TOTAL_MEMORY should be larger than TOTAL_STACK, was ' + TOTAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined,
       'JS engine does not provide full typed array support');



// Use a provided buffer, if there is one, or else allocate a new one
if (Module['buffer']) {
  buffer = Module['buffer'];
  assert(buffer.byteLength === TOTAL_MEMORY, 'provided buffer should be ' + TOTAL_MEMORY + ' bytes, but it is ' + buffer.byteLength);
} else {
  // Use a WebAssembly memory where available
  {
    buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
  assert(buffer.byteLength === TOTAL_MEMORY);
  Module['buffer'] = buffer;
}
updateGlobalBufferViews();


function getTotalMemory() {
  return TOTAL_MEMORY;
}

// Endianness check (note: assumes compiler arch was little-endian)
  HEAP32[0] = 0x63736d65; /* 'emsc' */
HEAP16[1] = 0x6373;
if (HEAPU8[2] !== 0x73 || HEAPU8[3] !== 0x63) throw 'Runtime error: expected the system to be little-endian!';

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Module['dynCall_v'](func);
      } else {
        Module['dynCall_vi'](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  checkStackCookie();
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  checkStackCookie();
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  checkStackCookie();
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
  HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


if (!Math['clz32']) Math['clz32'] = function(x) {
  var n = 32;
  var y = x >> 16; if (y) { n -= 16; x = y; }
  y = x >> 8; if (y) { n -= 8; x = y; }
  y = x >> 4; if (y) { n -= 4; x = y; }
  y = x >> 2; if (y) { n -= 2; x = y; }
  y = x >> 1; if (y) return n - 2;
  return n - x;
};
Math.clz32 = Math['clz32']

if (!Math['trunc']) Math['trunc'] = function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};
Math.trunc = Math['trunc'];

var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_max = Math.max;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data



var memoryInitializer = null;



var /* show errors on likely calls to FS when it was not included */ FS = {
  error: function() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1');
  },
  init: function() { FS.error() },
  createDataFile: function() { FS.error() },
  createPreloadedFile: function() { FS.error() },
  createLazyFile: function() { FS.error() },
  open: function() { FS.error() },
  mkdev: function() { FS.error() },
  registerDevice: function() { FS.error() },
  analyzePath: function() { FS.error() },
  loadFilesFromDB: function() { FS.error() },

  ErrnoError: function ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;



// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return String.prototype.startsWith ?
      filename.startsWith(dataURIPrefix) :
      filename.indexOf(dataURIPrefix) === 0;
}





// === Body ===

var ASM_CONSTS = [];





STATIC_BASE = GLOBAL_BASE;

STATICTOP = STATIC_BASE + 2320;
/* global initializers */  __ATINIT__.push();


memoryInitializer = "data:application/octet-stream;base64,AAAAAAAAAABNIUshAAAAAAQAAABNLksuAAAAAAQAAABNJkshAAAAAAQAAABQQVRUAAAAAAQAAABOU01TAAAAAAQAAABMQVJEAAAAAAQAAABGRVNUAAAAAAQAAABGSVNUAAAAAAQAAABOLlQuAAAAAAQAAABPS1RBAAAAAAgAAABPQ1RBAAAAAAgAAAAkQ0hOAAAAAP////8kJENIAAAAAP////8kJENOAAAAAP////8kJCRDAAAAAP////9GTFQkAAAAAP////9FWE8kAAAAAP////9DRCQxAAAAAP////9URFokAAAAAP////9GQTAkAAAAAP////8AAAAAAAAAAAAAAAAAAAAAAGsAZUBfAFrAVABQgEtAR0BDgD8APKA4gDWAMqAvAC1gKgAowCWgI54hwB8AHlAcwBpAGdAXgBYwFQAU4BLQEdAQ4A8ADygOYA2gDOgLQAuYCgAKcAnoCGgI8AeABxQHsAZQBvQFoAVMBQAFuAR0BDQE+APAA4oDWAMoA/oC0AKmAoACXAI6AhoC/AHgAcUBrAGUAX0BaAFTAUABLgEdAQ0B/gDwAOIA1gDKAL4AtACqAKAAlwCPAIcAfwB4AHEAawBlAF8AWgBVAFAASwBHAEMAPwA8ADgANQAyAC8ALQAqACgAJQAjACEAHwAeABwAGwAZABgAFgAVABQAEwASABEAEAAPAA4ADQANAAwACwALAAoACQAJAAgACAAHAAcAAAUGBwgKCw0QExYaICtAgAAAGAAxAEoAYQB4AI0AoQC0AMUA1ADgAOsA9AD6AP0A/wD9APoA9ADrAOAA1ADFALQAoQCNAHgAYQBKADEAGAAFAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAwAAAAgDAAAABAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAK/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAI=";





/* no memory initializer */
var tempDoublePtr = STATICTOP; STATICTOP += 16;

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}

// {{PRE_LIBRARY}}


  function ___lock() {}

  
  var SYSCALLS={varargs:0,get:function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function () {
        var ret = Pointer_stringify(SYSCALLS.get());
        return ret;
      },get64:function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },getZero:function () {
        assert(SYSCALLS.get() === 0);
      }};function ___syscall140(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // llseek
      var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
      // NOTE: offset_high is unused - Emscripten's off_t is 32-bit
      var offset = offset_low;
      FS.llseek(stream, offset, whence);
      HEAP32[((result)>>2)]=stream.position;
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  
  function flush_NO_FILESYSTEM() {
      // flush anything remaining in the buffers during shutdown
      var fflush = Module["_fflush"];
      if (fflush) fflush(0);
      var printChar = ___syscall146.printChar;
      if (!printChar) return;
      var buffers = ___syscall146.buffers;
      if (buffers[1].length) printChar(1, 10);
      if (buffers[2].length) printChar(2, 10);
    }function ___syscall146(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // writev
      // hack to support printf in FILESYSTEM=0
      var stream = SYSCALLS.get(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      var ret = 0;
      if (!___syscall146.buffers) {
        ___syscall146.buffers = [null, [], []]; // 1 => stdout, 2 => stderr
        ___syscall146.printChar = function(stream, curr) {
          var buffer = ___syscall146.buffers[stream];
          assert(buffer);
          if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        };
      }
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[(((iov)+(i*8))>>2)];
        var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
        for (var j = 0; j < len; j++) {
          ___syscall146.printChar(stream, HEAPU8[ptr+j]);
        }
        ret += len;
      }
      return ret;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall54(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // ioctl
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall6(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // close
      var stream = SYSCALLS.getStreamFromFD();
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___unlock() {}

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 

   

  
  function ___setErrNo(value) {
      if (Module['___errno_location']) HEAP32[((Module['___errno_location']())>>2)]=value;
      else err('failed to set errno from JS');
      return value;
    } 
DYNAMICTOP_PTR = staticAlloc(4);

STACK_BASE = STACKTOP = alignMemory(STATICTOP);

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = alignMemory(STACK_MAX);

HEAP32[DYNAMICTOP_PTR>>2] = DYNAMIC_BASE;

staticSealed = true; // seal the static portion of memory

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

var ASSERTIONS = true;

// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {String} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf;
    try {
      buf = Buffer.from(s, 'base64');
    } catch (_) {
      buf = new Buffer(s, 'base64');
    }
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}



function nullFunc_ii(x) { err("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiii(x) { err("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function invoke_ii(index,a1) {
  var sp = stackSave();
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    stackRestore(sp);
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module["setThrew"](1, 0);
  }
}

Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity };

Module.asmLibraryArg = { "abort": abort, "assert": assert, "enlargeMemory": enlargeMemory, "getTotalMemory": getTotalMemory, "abortOnCannotGrowMemory": abortOnCannotGrowMemory, "abortStackOverflow": abortStackOverflow, "nullFunc_ii": nullFunc_ii, "nullFunc_iiii": nullFunc_iiii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "___lock": ___lock, "___setErrNo": ___setErrNo, "___syscall140": ___syscall140, "___syscall146": ___syscall146, "___syscall54": ___syscall54, "___syscall6": ___syscall6, "___unlock": ___unlock, "_emscripten_memcpy_big": _emscripten_memcpy_big, "flush_NO_FILESYSTEM": flush_NO_FILESYSTEM, "DYNAMICTOP_PTR": DYNAMICTOP_PTR, "tempDoublePtr": tempDoublePtr, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX };
// EMSCRIPTEN_START_ASM
var asm = (/** @suppress {uselessCode} */ function(global, env, buffer) {
'almost asm';


  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var DYNAMICTOP_PTR=env.DYNAMICTOP_PTR|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntS = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;

  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_max=global.Math.max;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var enlargeMemory=env.enlargeMemory;
  var getTotalMemory=env.getTotalMemory;
  var abortOnCannotGrowMemory=env.abortOnCannotGrowMemory;
  var abortStackOverflow=env.abortStackOverflow;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_iiii=env.nullFunc_iiii;
  var invoke_ii=env.invoke_ii;
  var invoke_iiii=env.invoke_iiii;
  var ___lock=env.___lock;
  var ___setErrNo=env.___setErrNo;
  var ___syscall140=env.___syscall140;
  var ___syscall146=env.___syscall146;
  var ___syscall54=env.___syscall54;
  var ___syscall6=env.___syscall6;
  var ___unlock=env.___unlock;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var flush_NO_FILESYSTEM=env.flush_NO_FILESYSTEM;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS

function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 15)&-16;
  if ((STACKTOP|0) >= (STACK_MAX|0)) abortStackOverflow(size|0);

  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function establishStackSpace(stackBase, stackMax) {
  stackBase = stackBase|0;
  stackMax = stackMax|0;
  STACKTOP = stackBase;
  STACK_MAX = stackMax;
}

function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}
function getTempRet0() {
  return tempRet0|0;
}

function _hxcmod_init($0) {
 $0 = $0|0;
 var $$021 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $indvars$iv = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($0|0)==(0|0);
 if ($1) {
  $$021 = 0;
  return ($$021|0);
 }
 _memset(($0|0),0,7276)|0;
 $2 = ((($0)) + 1724|0);
 HEAP32[$2>>2] = 44100;
 $3 = ((($0)) + 7276|0);
 HEAP16[$3>>1] = 1;
 $4 = ((($0)) + 7278|0);
 HEAP16[$4>>1] = 1;
 $5 = ((($0)) + 7280|0);
 HEAP16[$5>>1] = 16;
 $6 = ((($0)) + 7282|0);
 HEAP16[$6>>1] = 1;
 $8 = 27392;$indvars$iv = 0;
 while(1) {
  $7 = $8 << 16 >> 16;
  $9 = (($indvars$iv) + 1)|0;
  $10 = (272 + ($9<<1)|0);
  $11 = HEAP16[$10>>1]|0;
  $12 = $11 << 16 >> 16;
  $13 = (($7) - ($12))|0;
  $14 = (($13|0) / 8)&-1;
  $15 = $indvars$iv << 3;
  $16 = (((($0)) + 4966|0) + ($15<<1)|0);
  HEAP16[$16>>1] = $8;
  $17 = (($7) - ($14))|0;
  $18 = $17&65535;
  $19 = $15 | 1;
  $20 = (((($0)) + 4966|0) + ($19<<1)|0);
  HEAP16[$20>>1] = $18;
  $21 = $14 << 1;
  $22 = (($7) - ($21))|0;
  $23 = $22&65535;
  $24 = $15 | 2;
  $25 = (((($0)) + 4966|0) + ($24<<1)|0);
  HEAP16[$25>>1] = $23;
  $26 = Math_imul($14, -3)|0;
  $27 = (($26) + ($7))|0;
  $28 = $27&65535;
  $29 = $15 | 3;
  $30 = (((($0)) + 4966|0) + ($29<<1)|0);
  HEAP16[$30>>1] = $28;
  $31 = $14 << 2;
  $32 = (($7) - ($31))|0;
  $33 = $32&65535;
  $34 = $15 | 4;
  $35 = (((($0)) + 4966|0) + ($34<<1)|0);
  HEAP16[$35>>1] = $33;
  $36 = Math_imul($14, -5)|0;
  $37 = (($36) + ($7))|0;
  $38 = $37&65535;
  $39 = $15 | 5;
  $40 = (((($0)) + 4966|0) + ($39<<1)|0);
  HEAP16[$40>>1] = $38;
  $41 = Math_imul($14, -6)|0;
  $42 = (($41) + ($7))|0;
  $43 = $42&65535;
  $44 = $15 | 6;
  $45 = (((($0)) + 4966|0) + ($44<<1)|0);
  HEAP16[$45>>1] = $43;
  $46 = Math_imul($14, -7)|0;
  $47 = (($46) + ($7))|0;
  $48 = $47&65535;
  $49 = $15 | 7;
  $50 = (((($0)) + 4966|0) + ($49<<1)|0);
  HEAP16[$50>>1] = $48;
  $exitcond = ($9|0)==(143);
  if ($exitcond) {
   $$021 = 1;
   break;
  } else {
   $8 = $11;$indvars$iv = $9;
  }
 }
 return ($$021|0);
}
function _hxcmod_setcfg($0,$1,$2,$3) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 var $$ = 0, $$0 = 0, $10 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $4 = ($0|0)==(0|0);
 if ($4) {
  $$0 = 0;
  return ($$0|0);
 }
 $5 = ((($0)) + 1724|0);
 HEAP32[$5>>2] = $1;
 $6 = ($2|0)<(4);
 if ($6) {
  $7 = $2&65535;
  $8 = ((($0)) + 7278|0);
  HEAP16[$8>>1] = $7;
 }
 $9 = ($3|0)!=(0);
 $10 = ((($0)) + 7282|0);
 $$ = $9&1;
 HEAP16[$10>>1] = $$;
 $$0 = 1;
 return ($$0|0);
}
function _hxcmod_load($0,$1,$2) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 var $$0 = 0, $$013$i = 0, $$013$i159 = 0, $$0139 = 0, $$0140174 = 0, $$0141191 = 0, $$0150183 = 0, $$1147$1 = 0, $$1147$2 = 0, $$1147$3 = 0, $$1151$lcssa = 0, $$1151177 = 0, $$1185 = 0, $$2$lcssa = 0, $$2178 = 0, $$3149 = 0, $$3149$1 = 0, $$3149$2 = 0, $$3175 = 0, $$4 = 0;
 var $$off = 0, $$off$1 = 0, $$off$2 = 0, $$off$3 = 0, $$pr = 0, $$sink = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0;
 var $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0;
 var $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0;
 var $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0;
 var $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0;
 var $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $exitcond = 0, $exitcond$i = 0, $exitcond$i160 = 0, $indvars$iv = 0, $indvars$iv$next = 0, $indvars$iv$next201 = 0, $indvars$iv$next207 = 0;
 var $indvars$iv200 = 0, $indvars$iv206 = 0, $mulconv = 0, $or$cond = 0, $or$cond156 = 0, $or$cond156$1 = 0, $or$cond156$2 = 0, $or$cond156$3 = 0, $or$cond158 = 0, $scevgep = 0, $spec$select = 0, $spec$select221 = 0, $spec$select227 = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 $3 = (($1) + ($2)|0);
 $4 = ($1|0)!=(0|0);
 $5 = ($0|0)!=(0|0);
 $or$cond = $5 & $4;
 if (!($or$cond)) {
  $$0 = 0;
  return ($$0|0);
 }
 $$013$i = 0;
 while(1) {
  $6 = (($1) + ($$013$i)|0);
  $7 = HEAP8[$6>>0]|0;
  $8 = (($0) + ($$013$i)|0);
  HEAP8[$8>>0] = $7;
  $9 = (($$013$i) + 1)|0;
  $exitcond$i = ($9|0)==(1084);
  if ($exitcond$i) {
   break;
  } else {
   $$013$i = $9;
  }
 }
 $10 = ((($0)) + 4964|0);
 HEAP16[$10>>1] = 0;
 $11 = (4)==(0);
 do {
  if ($11) {
   label = 17;
  } else {
   $12 = ((($0)) + 1080|0);
   $13 = ((($0)) + 1081|0);
   $14 = ((($0)) + 1082|0);
   $15 = ((($0)) + 1083|0);
   $$0141191 = 0;$17 = 0;$187 = 0;$188 = 1;$42 = 4;
   while(1) {
    if (!($188)) {
     $189 = $187;
     break;
    }
    $16 = (16 + (($17*12)|0)|0);
    $18 = HEAP8[$16>>0]|0;
    $19 = ($18<<24>>24)==(36);
    $spec$select = $19&1;
    $20 = (((16 + (($17*12)|0)|0)) + 1|0);
    $21 = HEAP8[$20>>0]|0;
    $22 = ($21<<24>>24)==(36);
    $spec$select221 = $19 ? 10 : 1;
    $$1147$1 = $22 ? $spec$select221 : $spec$select;
    $23 = (((16 + (($17*12)|0)|0)) + 2|0);
    $24 = HEAP8[$23>>0]|0;
    $25 = ($24<<24>>24)==(36);
    if ($25) {
     $137 = ($$1147$1<<16>>16)==(0);
     $mulconv = ($$1147$1*10)|0;
     $spec$select227 = $137 ? 1 : $mulconv;
     $$1147$2 = $spec$select227;
    } else {
     $$1147$2 = $$1147$1;
    }
    $138 = (((16 + (($17*12)|0)|0)) + 3|0);
    $139 = HEAP8[$138>>0]|0;
    $140 = ($139<<24>>24)==(36);
    if ($140) {
     $141 = ($$1147$2<<16>>16)==(0);
     if ($141) {
      $$1147$3 = 1;
     } else {
      $142 = $$1147$2&65535;
      $143 = ($142*10)|0;
      $144 = $143&65535;
      $$1147$3 = $144;
     }
    } else {
     $$1147$3 = $$1147$2;
    }
    HEAP16[$10>>1] = 0;
    $145 = HEAP8[$16>>0]|0;
    $26 = HEAP8[$12>>0]|0;
    $146 = ($145<<24>>24)==($26<<24>>24);
    $147 = ($145<<24>>24)==(36);
    $or$cond156 = $147 | $146;
    do {
     if ($or$cond156) {
      if ($147) {
       $$off = (($26) + -48)<<24>>24;
       $27 = ($$off&255)<(10);
       if (!($27)) {
        $$sink = 0;
        label = 14;
        break;
       }
       $28 = $26&255;
       $29 = (($28) + -48)|0;
       $30 = $$1147$3&65535;
       $31 = Math_imul($29, $30)|0;
       $32 = $31&65535;
       HEAP16[$10>>1] = $32;
       $33 = (($30>>>0) / 10)&-1;
       $34 = $33&65535;
       $$3149 = $34;$154 = $32;
      } else {
       $$3149 = $$1147$3;$154 = 0;
      }
      $35 = HEAP8[$20>>0]|0;
      $36 = HEAP8[$13>>0]|0;
      $37 = ($35<<24>>24)==($36<<24>>24);
      $38 = ($35<<24>>24)==(36);
      $or$cond156$1 = $38 | $37;
      if ($or$cond156$1) {
       if ($38) {
        $$off$1 = (($36) + -48)<<24>>24;
        $148 = ($$off$1&255)<(10);
        if (!($148)) {
         $$sink = 0;
         label = 14;
         break;
        }
        $149 = $36&255;
        $150 = (($149) + -48)|0;
        $151 = $$3149&65535;
        $152 = Math_imul($150, $151)|0;
        $153 = $154&65535;
        $155 = (($152) + ($153))|0;
        $156 = $155&65535;
        HEAP16[$10>>1] = $156;
        $157 = (($151>>>0) / 10)&-1;
        $158 = $157&65535;
        $$3149$1 = $158;$169 = $156;
       } else {
        $$3149$1 = $$3149;$169 = $154;
       }
       $159 = HEAP8[$23>>0]|0;
       $160 = HEAP8[$14>>0]|0;
       $161 = ($159<<24>>24)==($160<<24>>24);
       $162 = ($159<<24>>24)==(36);
       $or$cond156$2 = $162 | $161;
       if ($or$cond156$2) {
        if ($162) {
         $$off$2 = (($160) + -48)<<24>>24;
         $163 = ($$off$2&255)<(10);
         if (!($163)) {
          $$sink = 0;
          label = 14;
          break;
         }
         $164 = $160&255;
         $165 = (($164) + -48)|0;
         $166 = $$3149$1&65535;
         $167 = Math_imul($165, $166)|0;
         $168 = $169&65535;
         $170 = (($167) + ($168))|0;
         $171 = $170&65535;
         HEAP16[$10>>1] = $171;
         $172 = (($166>>>0) / 10)&-1;
         $173 = $172&65535;
         $$3149$2 = $173;$184 = $171;
        } else {
         $$3149$2 = $$3149$1;$184 = $169;
        }
        $174 = HEAP8[$138>>0]|0;
        $175 = HEAP8[$15>>0]|0;
        $176 = ($174<<24>>24)==($175<<24>>24);
        $177 = ($174<<24>>24)==(36);
        $or$cond156$3 = $177 | $176;
        if ($or$cond156$3) {
         if ($177) {
          $$off$3 = (($175) + -48)<<24>>24;
          $178 = ($$off$3&255)<(10);
          if (!($178)) {
           $$sink = 0;
           label = 14;
           break;
          }
          $179 = $175&255;
          $180 = (($179) + -48)|0;
          $181 = $$3149$2&65535;
          $182 = Math_imul($180, $181)|0;
          $183 = $184&65535;
          $185 = (($182) + ($183))|0;
          $186 = $185&65535;
          HEAP16[$10>>1] = $186;
          $39 = $186;
         } else {
          $39 = $184;
         }
         $40 = ($39<<16>>16)==(0);
         if ($40) {
          $41 = $42&65535;
          $$sink = $41;
          label = 14;
         } else {
          $$pr = $39;
         }
        } else {
         $$sink = 0;
         label = 14;
        }
       } else {
        $$sink = 0;
        label = 14;
       }
      } else {
       $$sink = 0;
       label = 14;
      }
     } else {
      $$sink = 0;
      label = 14;
     }
    } while(0);
    if ((label|0) == 14) {
     label = 0;
     HEAP16[$10>>1] = $$sink;
     $$pr = $$sink;
    }
    $43 = (($$0141191) + 1)<<16>>16;
    $44 = $43&65535;
    $45 = (((16 + (($44*12)|0)|0)) + 8|0);
    $46 = HEAP32[$45>>2]|0;
    $47 = ($46|0)==(0);
    $48 = ($$pr<<16>>16)==(0);
    if ($47) {
     label = 16;
     break;
    } else {
     $$0141191 = $43;$17 = $44;$187 = $$pr;$188 = $48;$42 = $46;
    }
   }
   if ((label|0) == 16) {
    if ($48) {
     label = 17;
     break;
    } else {
     $189 = $$pr;
    }
   }
   $60 = ((($1)) + 1084|0);
   $$0139 = $60;$61 = $189;
  }
 } while(0);
 if ((label|0) == 17) {
  $49 = ((($0)) + 1080|0);
  HEAP8[$49>>0] = 77;
  $50 = ((($0)) + 1081|0);
  HEAP8[$50>>0] = 46;
  $51 = ((($0)) + 1082|0);
  HEAP8[$51>>0] = 75;
  $52 = ((($0)) + 1083|0);
  HEAP8[$52>>0] = 46;
  $53 = ((($0)) + 950|0);
  $$013$i159 = 0;
  while(1) {
   $54 = (((($0)) + 470|0) + ($$013$i159)|0);
   $55 = HEAP8[$54>>0]|0;
   $56 = (($53) + ($$013$i159)|0);
   HEAP8[$56>>0] = $55;
   $57 = (($$013$i159) + 1)|0;
   $exitcond$i160 = ($57|0)==(130);
   if ($exitcond$i160) {
    break;
   } else {
    $$013$i159 = $57;
   }
  }
  $58 = ((($0)) + 470|0);
  _memset(($58|0),0,480)|0;
  $59 = ((($1)) + 600|0);
  HEAP16[$10>>1] = 4;
  $$0139 = $59;$61 = 4;
 }
 $62 = ($61&65535)<(33);
 $63 = ($$0139>>>0)<($3>>>0);
 $or$cond158 = $63 & $62;
 if (!($or$cond158)) {
  $$0 = 0;
  return ($$0|0);
 }
 $64 = $61&65535;
 $65 = $64 << 8;
 $$0150183 = 0;$$1185 = $$0139;$indvars$iv206 = 0;
 L56: while(1) {
  $66 = $$0150183&65535;
  $67 = (((($0)) + 952|0) + ($indvars$iv206)|0);
  $68 = HEAP8[$67>>0]|0;
  $69 = $68&255;
  $70 = ($66>>>0)>($69>>>0);
  if ($70) {
   $$1151$lcssa = $$0150183;$$2$lcssa = $$1185;
  } else {
   $$1151177 = $$0150183;$$2178 = $$1185;$72 = $66;
   while(1) {
    $71 = (((($0)) + 1212|0) + ($72<<2)|0);
    HEAP32[$71>>2] = $$2178;
    $73 = (($$2178) + ($65)|0);
    $74 = ($73>>>0)<($3>>>0);
    if (!($74)) {
     $$0 = 0;
     label = 38;
     break L56;
    }
    $75 = (($$1151177) + 1)<<16>>16;
    $76 = $75&65535;
    $77 = HEAP8[$67>>0]|0;
    $78 = $77&255;
    $79 = ($76>>>0)>($78>>>0);
    if ($79) {
     $$1151$lcssa = $75;$$2$lcssa = $73;
     break;
    } else {
     $$1151177 = $75;$$2178 = $73;$72 = $76;
    }
   }
  }
  $indvars$iv$next207 = (($indvars$iv206) + 1)|0;
  $80 = ($indvars$iv$next207>>>0)<(128);
  if ($80) {
   $$0150183 = $$1151$lcssa;$$1185 = $$2$lcssa;$indvars$iv206 = $indvars$iv$next207;
  } else {
   break;
  }
 }
 if ((label|0) == 38) {
  return ($$0|0);
 }
 $scevgep = ((($0)) + 1088|0);
 dest=$scevgep; stop=dest+124|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
 $81 = ((($0)) + 20|0);
 $$0140174 = $81;$$3175 = $$2$lcssa;$indvars$iv200 = 0;
 while(1) {
  $82 = ((($$0140174)) + 22|0);
  $83 = HEAPU8[$82>>0]|(HEAPU8[$82+1>>0]<<8);
  $84 = $83&65535;
  $85 = $84 >>> 8;
  $86 = $84 << 8;
  $87 = $85 | $86;
  $88 = $87 << 1;
  $89 = $88&65535;
  HEAP8[$82>>0]=$89&255;HEAP8[$82+1>>0]=$89>>8;
  $90 = ((($$0140174)) + 26|0);
  $91 = HEAPU8[$90>>0]|(HEAPU8[$90+1>>0]<<8);
  $92 = $91&65535;
  $93 = $92 >>> 8;
  $94 = $92 << 8;
  $95 = $93 | $94;
  $96 = $95 << 1;
  $97 = $96&65535;
  HEAP8[$90>>0]=$97&255;HEAP8[$90+1>>0]=$97>>8;
  $98 = ((($$0140174)) + 28|0);
  $99 = HEAPU8[$98>>0]|(HEAPU8[$98+1>>0]<<8);
  $100 = $99&65535;
  $101 = $100 >>> 8;
  $102 = $100 << 8;
  $103 = $101 | $102;
  $104 = $103 << 1;
  $105 = $104&65535;
  HEAP8[$98>>0]=$105&255;HEAP8[$98+1>>0]=$105>>8;
  $106 = ($89<<16>>16)==(0);
  if ($106) {
   $$4 = $$3175;
  } else {
   $107 = (((($0)) + 1088|0) + ($indvars$iv200<<2)|0);
   HEAP32[$107>>2] = $$3175;
   $108 = $88 & 65534;
   $109 = (($$3175) + ($108)|0);
   $110 = $104 & 65534;
   $111 = $96 & 65534;
   $112 = (($110) + ($111))|0;
   $113 = ($112>>>0)>($108>>>0);
   if ($113) {
    $114 = (($88) - ($96))|0;
    $115 = $114&65535;
    HEAP8[$98>>0]=$115&255;HEAP8[$98+1>>0]=$115>>8;
   }
   $116 = ($109>>>0)>($3>>>0);
   if ($116) {
    $$0 = 0;
    label = 38;
    break;
   } else {
    $$4 = $109;
   }
  }
  $indvars$iv$next201 = (($indvars$iv200) + 1)|0;
  $117 = ((($$0140174)) + 30|0);
  $118 = ($indvars$iv$next201>>>0)<(31);
  if ($118) {
   $$0140174 = $117;$$3175 = $$4;$indvars$iv200 = $indvars$iv$next201;
  } else {
   break;
  }
 }
 if ((label|0) == 38) {
  return ($$0|0);
 }
 $119 = ((($0)) + 1728|0);
 HEAP16[$119>>1] = 0;
 $120 = ((($0)) + 1730|0);
 HEAP16[$120>>1] = 0;
 $121 = ((($0)) + 1084|0);
 HEAP8[$121>>0] = 6;
 $122 = ((($0)) + 1736|0);
 HEAP8[$122>>0] = 125;
 $123 = ((($0)) + 1760|0);
 HEAP32[$123>>2] = 0;
 $124 = ((($0)) + 1724|0);
 $125 = HEAP32[$124>>2]|0;
 $126 = ($125*30)|0;
 $127 = (($126>>>0) / 250)&-1;
 $128 = (($127) + 1)|0;
 $129 = ((($0)) + 1740|0);
 HEAP32[$129>>2] = $128;
 $130 = ((($0)) + 1748|0);
 HEAP32[$130>>2] = $127;
 $131 = (3546894 / ($125>>>0))&-1;
 $132 = ((($0)) + 1756|0);
 HEAP32[$132>>2] = $131;
 $133 = ($61<<16>>16)==(0);
 if (!($133)) {
  $indvars$iv = 0;
  while(1) {
   $134 = (((((($0)) + 1764|0) + (($indvars$iv*100)|0)|0)) + 62|0);
   HEAP8[$134>>0] = 0;
   $135 = (((((($0)) + 1764|0) + (($indvars$iv*100)|0)|0)) + 60|0);
   HEAP16[$135>>1] = 0;
   $indvars$iv$next = (($indvars$iv) + 1)|0;
   $exitcond = ($indvars$iv$next|0)==($64|0);
   if ($exitcond) {
    break;
   } else {
    $indvars$iv = $indvars$iv$next;
   }
  }
 }
 $136 = ((($0)) + 7270|0);
 HEAP16[$136>>1] = 1;
 $$0 = 1;
 return ($$0|0);
}
function _hxcmod_fillbuffer($0,$1,$2,$3) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 var $$01$i$i = 0, $$01$i14$i = 0, $$01$i17$i = 0, $$0289363 = 0, $$0290$i = 0, $$0290344 = 0, $$0291$lcssa = 0, $$0291356 = 0, $$0292$lcssa = 0, $$0292343 = 0, $$0295328 = 0, $$0297$lcssa = 0, $$0297355 = 0, $$0298$lcssa = 0, $$0298342 = 0, $$0305354 = 0, $$0347 = 0, $$06$i$i = 0, $$06$i15$i = 0, $$06$i18$i = 0;
 var $$1$i = 0, $$1293$ph = 0, $$1293324 = 0, $$1296337 = 0, $$1299 = 0, $$1306 = 0, $$1357 = 0, $$2$i = 0, $$2294 = 0, $$2300 = 0, $$4 = 0, $$4302 = 0, $$6 = 0, $$6304 = 0, $$lcssa = 0, $$not$i = 0, $$off = 0, $$off$i = 0, $$off$i316 = 0, $$off23$i = 0;
 var $$old$i = 0, $$phi$trans$insert = 0, $$pre = 0, $$pre$i$i = 0, $$pre$i$i314 = 0, $$pre$phi$i$i315Z2D = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi28$iZ2D = 0, $$pre$phiZ2D = 0, $$pre27$pre$phi$iZZ2D = 0, $$pre31$i = 0, $$pre374 = 0, $$sink = 0, $$sink384 = 0, $$sink387 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0;
 var $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0;
 var $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0;
 var $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0;
 var $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0;
 var $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0;
 var $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0;
 var $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0;
 var $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0;
 var $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0;
 var $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0;
 var $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0;
 var $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0;
 var $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0;
 var $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0;
 var $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0;
 var $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0;
 var $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0;
 var $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0;
 var $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0;
 var $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0;
 var $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0;
 var $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0;
 var $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0;
 var $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0;
 var $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0;
 var $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0;
 var $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0;
 var $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0;
 var $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0;
 var $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0;
 var $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0;
 var $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0;
 var $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0;
 var $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0;
 var $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0;
 var $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0;
 var $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0;
 var $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0;
 var $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0;
 var $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0;
 var $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0;
 var $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0;
 var $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0;
 var $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0;
 var $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0;
 var $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0;
 var $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0;
 var $99 = 0, $exitcond = 0, $exitcond369 = 0, $mulconv$i = 0, $or$cond = 0, $or$cond$i = 0, $or$cond2$i = 0, $or$cond22$i = 0, $or$cond3 = 0, $or$cond8$i = 0, $sext = 0, $sext307 = 0, $sext308 = 0, $spec$select = 0, $spec$select$i = 0, $spec$select309 = 0, $spec$select325 = 0, $spec$select326 = 0, $spec$store$select$i = 0, $spec$store$select$i312 = 0;
 var $spec$store$select1$i = 0, $spec$store$select10$i = 0, $spec$store$select11$i = 0, $spec$store$select12$i = 0, $spec$store$select13$i = 0, $spec$store$select3$i = 0, $spec$store$select4$i = 0, $spec$store$select5$i = 0, $spec$store$select6$i = 0, $spec$store$select7$i = 0, $spec$store$select8$i = 0, $spec$store$select9$i = 0, $spec$store$select9$i313 = 0, $storemerge$i = 0, $switch = 0, $trunc = 0, $trunc$clear = 0, $trunc$i = 0, $trunc$i$clear = 0, $trunc$pre$phi$i$clearZ2D = 0;
 var $trunc$pre$phi$iZ2D = 0, $trunc1$i = 0, $trunc1$i$clear = 0, $trunc24$i = 0, $trunc24$i$clear = 0, $trunc25$i$clear = 0, $trunc26$pre$phi$i$clearZ2D = 0, $trunc26$pre$phi$iZ2D = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $4 = ($0|0)!=(0|0);
 $5 = ($1|0)!=(0|0);
 $or$cond = $4 & $5;
 if (!($or$cond)) {
  return;
 }
 $6 = ((($0)) + 7270|0);
 $7 = HEAP16[$6>>1]|0;
 $8 = ($7<<16>>16)==(0);
 if ($8) {
  $978 = ($2|0)==(0);
  if (!($978)) {
   $979 = $2 << 2;
   _memset(($1|0),0,($979|0))|0;
  }
  $980 = ($3|0)==(0|0);
  if ($980) {
   return;
  }
  $981 = ((($3)) + 4|0);
  HEAP32[$981>>2] = 0;
  $982 = ((($3)) + 8|0);
  HEAP32[$982>>2] = 0;
  $983 = ((($3)) + 16|0);
  HEAP8[$983>>0] = 0;
  $984 = HEAP32[$3>>2]|0;
  $985 = ($984*348)|0;
  $986 = ($985|0)==(0);
  if (!($986)) {
   $987 = ((($3)) + 948|0);
   $988 = HEAP32[$987>>2]|0;
   _memset(($988|0),0,($985|0))|0;
  }
  $989 = ((($3)) + 80|0);
  _memset(($989|0),0,868)|0;
  return;
 }
 $9 = ($3|0)==(0|0);
 if (!($9)) {
  $10 = ((($3)) + 8|0);
  HEAP32[$10>>2] = 0;
  $11 = HEAP8[$0>>0]|0;
  $12 = ((($3)) + 16|0);
  HEAP8[$12>>0] = $11;
  $13 = ((($0)) + 1|0);
  $14 = HEAP8[$13>>0]|0;
  $15 = ((($3)) + 17|0);
  HEAP8[$15>>0] = $14;
  $16 = ((($0)) + 2|0);
  $17 = HEAP8[$16>>0]|0;
  $18 = ((($3)) + 18|0);
  HEAP8[$18>>0] = $17;
  $19 = ((($0)) + 3|0);
  $20 = HEAP8[$19>>0]|0;
  $21 = ((($3)) + 19|0);
  HEAP8[$21>>0] = $20;
  $22 = ((($0)) + 4|0);
  $23 = HEAP8[$22>>0]|0;
  $24 = ((($3)) + 20|0);
  HEAP8[$24>>0] = $23;
  $25 = ((($0)) + 5|0);
  $26 = HEAP8[$25>>0]|0;
  $27 = ((($3)) + 21|0);
  HEAP8[$27>>0] = $26;
  $28 = ((($0)) + 6|0);
  $29 = HEAP8[$28>>0]|0;
  $30 = ((($3)) + 22|0);
  HEAP8[$30>>0] = $29;
  $31 = ((($0)) + 7|0);
  $32 = HEAP8[$31>>0]|0;
  $33 = ((($3)) + 23|0);
  HEAP8[$33>>0] = $32;
  $34 = ((($0)) + 8|0);
  $35 = HEAP8[$34>>0]|0;
  $36 = ((($3)) + 24|0);
  HEAP8[$36>>0] = $35;
  $37 = ((($0)) + 9|0);
  $38 = HEAP8[$37>>0]|0;
  $39 = ((($3)) + 25|0);
  HEAP8[$39>>0] = $38;
  $40 = ((($0)) + 10|0);
  $41 = HEAP8[$40>>0]|0;
  $42 = ((($3)) + 26|0);
  HEAP8[$42>>0] = $41;
  $43 = ((($0)) + 11|0);
  $44 = HEAP8[$43>>0]|0;
  $45 = ((($3)) + 27|0);
  HEAP8[$45>>0] = $44;
  $46 = ((($0)) + 12|0);
  $47 = HEAP8[$46>>0]|0;
  $48 = ((($3)) + 28|0);
  HEAP8[$48>>0] = $47;
  $49 = ((($0)) + 13|0);
  $50 = HEAP8[$49>>0]|0;
  $51 = ((($3)) + 29|0);
  HEAP8[$51>>0] = $50;
  $52 = ((($0)) + 14|0);
  $53 = HEAP8[$52>>0]|0;
  $54 = ((($3)) + 30|0);
  HEAP8[$54>>0] = $53;
  $55 = ((($0)) + 15|0);
  $56 = HEAP8[$55>>0]|0;
  $57 = ((($3)) + 31|0);
  HEAP8[$57>>0] = $56;
  $58 = ((($0)) + 16|0);
  $59 = HEAP8[$58>>0]|0;
  $60 = ((($3)) + 32|0);
  HEAP8[$60>>0] = $59;
  $61 = ((($0)) + 17|0);
  $62 = HEAP8[$61>>0]|0;
  $63 = ((($3)) + 33|0);
  HEAP8[$63>>0] = $62;
  $64 = ((($0)) + 18|0);
  $65 = HEAP8[$64>>0]|0;
  $66 = ((($3)) + 34|0);
  HEAP8[$66>>0] = $65;
  $67 = ((($0)) + 19|0);
  $68 = HEAP8[$67>>0]|0;
  $69 = ((($3)) + 35|0);
  HEAP8[$69>>0] = $68;
  $$0289363 = 0;
  while(1) {
   $70 = (((($0)) + 20|0) + (($$0289363*30)|0)|0);
   $71 = HEAP8[$70>>0]|0;
   $72 = (((($3)) + 80|0) + (($$0289363*28)|0)|0);
   HEAP8[$72>>0] = $71;
   $73 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 1|0);
   $74 = HEAP8[$73>>0]|0;
   $75 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 1|0);
   HEAP8[$75>>0] = $74;
   $76 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 2|0);
   $77 = HEAP8[$76>>0]|0;
   $78 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 2|0);
   HEAP8[$78>>0] = $77;
   $79 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 3|0);
   $80 = HEAP8[$79>>0]|0;
   $81 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 3|0);
   HEAP8[$81>>0] = $80;
   $82 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 4|0);
   $83 = HEAP8[$82>>0]|0;
   $84 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 4|0);
   HEAP8[$84>>0] = $83;
   $85 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 5|0);
   $86 = HEAP8[$85>>0]|0;
   $87 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 5|0);
   HEAP8[$87>>0] = $86;
   $88 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 6|0);
   $89 = HEAP8[$88>>0]|0;
   $90 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 6|0);
   HEAP8[$90>>0] = $89;
   $91 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 7|0);
   $92 = HEAP8[$91>>0]|0;
   $93 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 7|0);
   HEAP8[$93>>0] = $92;
   $94 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 8|0);
   $95 = HEAP8[$94>>0]|0;
   $96 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 8|0);
   HEAP8[$96>>0] = $95;
   $97 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 9|0);
   $98 = HEAP8[$97>>0]|0;
   $99 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 9|0);
   HEAP8[$99>>0] = $98;
   $100 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 10|0);
   $101 = HEAP8[$100>>0]|0;
   $102 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 10|0);
   HEAP8[$102>>0] = $101;
   $103 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 11|0);
   $104 = HEAP8[$103>>0]|0;
   $105 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 11|0);
   HEAP8[$105>>0] = $104;
   $106 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 12|0);
   $107 = HEAP8[$106>>0]|0;
   $108 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 12|0);
   HEAP8[$108>>0] = $107;
   $109 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 13|0);
   $110 = HEAP8[$109>>0]|0;
   $111 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 13|0);
   HEAP8[$111>>0] = $110;
   $112 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 14|0);
   $113 = HEAP8[$112>>0]|0;
   $114 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 14|0);
   HEAP8[$114>>0] = $113;
   $115 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 15|0);
   $116 = HEAP8[$115>>0]|0;
   $117 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 15|0);
   HEAP8[$117>>0] = $116;
   $118 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 16|0);
   $119 = HEAP8[$118>>0]|0;
   $120 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 16|0);
   HEAP8[$120>>0] = $119;
   $121 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 17|0);
   $122 = HEAP8[$121>>0]|0;
   $123 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 17|0);
   HEAP8[$123>>0] = $122;
   $124 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 18|0);
   $125 = HEAP8[$124>>0]|0;
   $126 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 18|0);
   HEAP8[$126>>0] = $125;
   $127 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 19|0);
   $128 = HEAP8[$127>>0]|0;
   $129 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 19|0);
   HEAP8[$129>>0] = $128;
   $130 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 20|0);
   $131 = HEAP8[$130>>0]|0;
   $132 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 20|0);
   HEAP8[$132>>0] = $131;
   $133 = (((((($0)) + 20|0) + (($$0289363*30)|0)|0)) + 21|0);
   $134 = HEAP8[$133>>0]|0;
   $135 = (((((($3)) + 80|0) + (($$0289363*28)|0)|0)) + 21|0);
   HEAP8[$135>>0] = $134;
   $136 = (($$0289363) + 1)|0;
   $exitcond369 = ($136|0)==(31);
   if ($exitcond369) {
    break;
   } else {
    $$0289363 = $136;
   }
  }
 }
 $137 = ((($0)) + 7274|0);
 $138 = HEAP16[$137>>1]|0;
 $139 = $138 << 16 >> 16;
 $140 = ((($0)) + 7272|0);
 $141 = HEAP16[$140>>1]|0;
 $142 = $141 << 16 >> 16;
 $143 = ($2|0)==(0);
 if ($143) {
  $$0291$lcssa = $142;$$0297$lcssa = $139;
 } else {
  $144 = ((($0)) + 1740|0);
  $145 = ((($0)) + 1748|0);
  $146 = ((($0)) + 1732|0);
  $147 = ((($0)) + 1744|0);
  $148 = ((($0)) + 1084|0);
  $149 = ((($0)) + 1728|0);
  $150 = ((($0)) + 1730|0);
  $151 = ((($0)) + 1752|0);
  $152 = ((($0)) + 4964|0);
  $153 = ((($0)) + 1734|0);
  $154 = ((($0)) + 950|0);
  $155 = ((($0)) + 1724|0);
  $156 = ((($0)) + 1736|0);
  $157 = ((($0)) + 1764|0);
  $158 = ((($3)) + 4|0);
  $159 = ((($0)) + 1756|0);
  $160 = ((($3)) + 948|0);
  $161 = ((($0)) + 7282|0);
  $162 = ((($0)) + 7278|0);
  $163 = ((($3)) + 12|0);
  $$0291356 = $142;$$0297355 = $139;$$0305354 = 0;$$1357 = 0;
  while(1) {
   $164 = HEAP32[$144>>2]|0;
   $165 = (($164) + 1)|0;
   HEAP32[$144>>2] = $165;
   $166 = HEAP32[$145>>2]|0;
   $167 = ($164>>>0)>($166>>>0);
   do {
    if ($167) {
     $168 = HEAP16[$146>>1]|0;
     $169 = ($168<<16>>16)==(0);
     if (!($169)) {
      $528 = (($168) + -1)<<16>>16;
      HEAP16[$146>>1] = $528;
      HEAP32[$144>>2] = 0;
      HEAP32[$147>>2] = 0;
      HEAP16[$151>>1] = 0;
      break;
     }
     $170 = HEAP16[$149>>1]|0;
     $171 = $170&65535;
     $172 = (((($0)) + 952|0) + ($171)|0);
     $173 = HEAP8[$172>>0]|0;
     $174 = $173&255;
     $175 = (((($0)) + 1212|0) + ($174<<2)|0);
     $176 = HEAP32[$175>>2]|0;
     $177 = HEAP16[$150>>1]|0;
     $178 = $177&65535;
     $179 = (($176) + ($178<<2)|0);
     HEAP16[$151>>1] = 0;
     HEAP32[$144>>2] = 0;
     HEAP32[$147>>2] = 0;
     $180 = HEAP16[$152>>1]|0;
     $181 = ($180<<16>>16)==(0);
     if ($181) {
      $$lcssa = 0;
     } else {
      $182 = $180&65535;
      $$0295328 = 0;$379 = $182;
      while(1) {
       $183 = (($179) + ($$0295328<<2)|0);
       $184 = (((($0)) + 1764|0) + (($$0295328*100)|0)|0);
       $185 = (($$0295328) + 1)|0;
       $186 = HEAP8[$183>>0]|0;
       $187 = $186&255;
       $188 = $187 & 240;
       $189 = ((($183)) + 2|0);
       $trunc24$i = HEAP8[$189>>0]|0;
       $190 = $trunc24$i&255;
       $191 = $190 >>> 4;
       $192 = $191 | $188;
       $193 = $187 << 8;
       $194 = $193 & 3840;
       $195 = ((($183)) + 1|0);
       $196 = HEAP8[$195>>0]|0;
       $197 = $196&255;
       $198 = $194 | $197;
       $199 = $198&65535;
       $200 = $190 & 15;
       $201 = $200 << 8;
       $202 = ((($183)) + 3|0);
       $203 = HEAP8[$202>>0]|0;
       $204 = $203&255;
       $205 = $201 | $204;
       $206 = $205&65535;
       $207 = $204 & 15;
       $208 = $207&255;
       $trunc1$i = ($203&255) >>> 4;
       $209 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 60|0);
       $210 = HEAP16[$209>>1]|0;
       $211 = ($198|0)!=(0);
       $$not$i = $211 ^ 1;
       $212 = ($192|0)==(0);
       $or$cond$i = $212 & $$not$i;
       L35: do {
        if ($or$cond$i) {
         $$1$i = $199;$317 = $210;$trunc$pre$phi$iZ2D = $trunc24$i;
        } else {
         $$off23$i = (($192) + -1)|0;
         $213 = ($$off23$i>>>0)<(31);
         if ($213) {
          $214 = (($192) + 65535)|0;
          $215 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 10|0);
          $216 = $214&65535;
          HEAP16[$215>>1] = $216;
         }
         $217 = $198 | $192;
         $218 = ($217|0)==(0);
         L41: do {
          if (!($218)) {
           $219 = ($199<<16>>16)==(0);
           L43: do {
            if ($219) {
             label = 24;
            } else {
             $trunc25$i$clear = $trunc24$i & 15;
             L45: do {
              switch ($trunc25$i$clear<<24>>24) {
              case 3:  {
               $220 = HEAP32[$184>>2]|0;
               $221 = ($220|0)==(0|0);
               if ($221) {
                label = 21;
               } else {
                label = 24;
                break L43;
               }
               break;
              }
              case 14:  {
               $$old$i = ($trunc1$i<<24>>24)!=(13);
               $222 = ($208<<24>>24)==(0);
               $or$cond22$i = $$old$i | $222;
               if ($or$cond22$i) {
                label = 21;
                break L45;
               }
               $241 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 10|0);
               $242 = HEAP16[$241>>1]|0;
               $243 = $242&65535;
               $244 = (((($0)) + 1088|0) + ($243<<2)|0);
               $245 = HEAP32[$244>>2]|0;
               $246 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 24|0);
               HEAP32[$246>>2] = $245;
               $247 = (((((($0)) + 20|0) + (($243*30)|0)|0)) + 22|0);
               $248 = HEAP16[$247>>1]|0;
               $249 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 28|0);
               HEAP16[$249>>1] = $248;
               $250 = (((((($0)) + 20|0) + (($243*30)|0)|0)) + 26|0);
               $251 = HEAP16[$250>>1]|0;
               $252 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 30|0);
               HEAP16[$252>>1] = $251;
               $253 = (((((($0)) + 20|0) + (($243*30)|0)|0)) + 28|0);
               $254 = HEAP16[$253>>1]|0;
               $255 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 32|0);
               HEAP16[$255>>1] = $254;
               $256 = $203 & 15;
               $257 = $256&255;
               $258 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 34|0);
               HEAP16[$258>>1] = $257;
               $$pre27$pre$phi$iZZ2D = $243;
               break;
              }
              default: {
               label = 21;
              }
              }
             } while(0);
             if ((label|0) == 21) {
              label = 0;
              $223 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 10|0);
              $224 = HEAP16[$223>>1]|0;
              $225 = $224&65535;
              $226 = (((($0)) + 1088|0) + ($225<<2)|0);
              $227 = HEAP32[$226>>2]|0;
              HEAP32[$184>>2] = $227;
              $228 = (((((($0)) + 20|0) + (($225*30)|0)|0)) + 22|0);
              $229 = HEAP16[$228>>1]|0;
              $230 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 4|0);
              HEAP16[$230>>1] = $229;
              $231 = (((((($0)) + 20|0) + (($225*30)|0)|0)) + 26|0);
              $232 = HEAP16[$231>>1]|0;
              $233 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 6|0);
              HEAP16[$233>>1] = $232;
              $234 = (((((($0)) + 20|0) + (($225*30)|0)|0)) + 28|0);
              $235 = HEAP16[$234>>1]|0;
              $236 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 8|0);
              HEAP16[$236>>1] = $235;
              $237 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 36|0);
              HEAP32[$237>>2] = $227;
              $238 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 40|0);
              HEAP16[$238>>1] = $229;
              $239 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 42|0);
              HEAP16[$239>>1] = $232;
              $240 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 44|0);
              HEAP16[$240>>1] = $235;
              $$pre27$pre$phi$iZZ2D = $225;
             }
             $259 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 22|0);
             HEAP16[$259>>1] = 0;
             $$pre$phi28$iZ2D = $$pre27$pre$phi$iZZ2D;$trunc26$pre$phi$iZ2D = $trunc24$i;
            }
           } while(0);
           if ((label|0) == 24) {
            label = 0;
            $260 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 10|0);
            $261 = HEAP16[$260>>1]|0;
            $262 = $261&65535;
            $263 = (((($0)) + 1088|0) + ($262<<2)|0);
            $264 = HEAP32[$263>>2]|0;
            $265 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 12|0);
            HEAP32[$265>>2] = $264;
            $266 = (((((($0)) + 20|0) + (($262*30)|0)|0)) + 22|0);
            $267 = HEAP16[$266>>1]|0;
            $268 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 16|0);
            HEAP16[$268>>1] = $267;
            $269 = (((((($0)) + 20|0) + (($262*30)|0)|0)) + 26|0);
            $270 = HEAP16[$269>>1]|0;
            $271 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 18|0);
            HEAP16[$271>>1] = $270;
            $272 = (((((($0)) + 20|0) + (($262*30)|0)|0)) + 28|0);
            $273 = HEAP16[$272>>1]|0;
            $274 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 20|0);
            HEAP16[$274>>1] = $273;
            $275 = ($273&65535)<(3);
            if ($275) {
             HEAP32[$265>>2] = 0;
            }
            $276 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 22|0);
            HEAP16[$276>>1] = 1;
            $$pre$phi28$iZ2D = $262;$trunc26$pre$phi$iZ2D = $trunc24$i;
           }
           $277 = (((((($0)) + 20|0) + (($$pre$phi28$iZ2D*30)|0)|0)) + 24|0);
           $278 = HEAP8[$277>>0]|0;
           $279 = $278 & 15;
           $280 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 93|0);
           HEAP8[$280>>0] = $279;
           $trunc26$pre$phi$i$clearZ2D = $trunc26$pre$phi$iZ2D & 15;
           switch ($trunc26$pre$phi$i$clearZ2D<<24>>24) {
           case 6: case 4:  {
            break L41;
            break;
           }
           default: {
           }
           }
           $281 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 78|0);
           HEAP16[$281>>1] = 0;
           $282 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 92|0);
           HEAP8[$282>>0] = 0;
          }
         } while(0);
         $283 = ($200|0)==(5);
         $or$cond8$i = $283 | $212;
         if (!($or$cond8$i)) {
          $284 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 10|0);
          $285 = HEAP16[$284>>1]|0;
          $286 = $285&65535;
          $287 = (((((($0)) + 20|0) + (($286*30)|0)|0)) + 25|0);
          $288 = HEAP8[$287>>0]|0;
          $289 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 62|0);
          HEAP8[$289>>0] = $288;
          $290 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 90|0);
          HEAP8[$290>>0] = 0;
         }
         $trunc24$i$clear = $trunc24$i & 15;
         L63: do {
          switch ($trunc24$i$clear<<24>>24) {
          case 5: case 3:  {
           break;
          }
          default: {
           if ($211) {
            $292 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 56|0);
            HEAP32[$292>>2] = 0;
            break L63;
           } else {
            $291 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 72|0);
            HEAP16[$291>>1] = 0;
            $$1$i = 0;$317 = $210;$trunc$pre$phi$iZ2D = $trunc24$i;
            break L35;
           }
          }
          }
         } while(0);
         $293 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 72|0);
         HEAP16[$293>>1] = 0;
         $294 = ($199<<16>>16)==(0);
         if ($294) {
          $$1$i = 0;$317 = $210;$trunc$pre$phi$iZ2D = $trunc24$i;
         } else {
          $295 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 93|0);
          $296 = HEAP8[$295>>0]|0;
          $297 = ($296<<24>>24)==(0);
          if ($297) {
           $$0290$i = $199;
          } else {
           $298 = ($296&255)<(8);
           $$01$i$i = 0;
           while(1) {
            $299 = (((($0)) + 4966|0) + ($$01$i$i<<1)|0);
            $300 = HEAP16[$299>>1]|0;
            $301 = ($300&65535)>($199&65535);
            if (!($301)) {
             $$06$i$i = $$01$i$i;
             break;
            }
            $302 = (($$01$i$i) + 1)|0;
            $303 = ($302>>>0)<(1152);
            if ($303) {
             $$01$i$i = $302;
            } else {
             $$06$i$i = 144;
             break;
            }
           }
           $304 = $296&255;
           $305 = (($$06$i$i) + ($304))|0;
           $306 = (($305) + -16)|0;
           $$sink384 = $298 ? $305 : $306;
           $307 = (((($0)) + 4966|0) + ($$sink384<<1)|0);
           $308 = HEAP16[$307>>1]|0;
           $$0290$i = $308;
          }
          HEAP16[$209>>1] = $$0290$i;
          $$1$i = $$0290$i;$317 = $$0290$i;$trunc$pre$phi$iZ2D = $trunc24$i;
         }
        }
       } while(0);
       $309 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 68|0);
       HEAP8[$309>>0] = 0;
       $310 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 69|0);
       HEAP8[$310>>0] = 0;
       $311 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 70|0);
       HEAP16[$311>>1] = $206;
       $trunc$pre$phi$i$clearZ2D = $trunc$pre$phi$iZ2D & 15;
       L78: do {
        switch ($trunc$pre$phi$i$clearZ2D<<24>>24) {
        case 0:  {
         $312 = ($203<<24>>24)==(0);
         if (!($312)) {
          HEAP8[$309>>0] = 0;
          HEAP8[$310>>0] = $203;
          $313 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 86|0);
          HEAP8[$313>>0] = 0;
          $$01$i17$i = 0;
          while(1) {
           $314 = (((($0)) + 4966|0) + ($$01$i17$i<<1)|0);
           $315 = HEAP16[$314>>1]|0;
           $316 = ($315&65535)>($317&65535);
           if (!($316)) {
            $$06$i18$i = $$01$i17$i;
            break;
           }
           $318 = (($$01$i17$i) + 1)|0;
           $319 = ($318>>>0)<(1152);
           if ($319) {
            $$01$i17$i = $318;
           } else {
            $$06$i18$i = 144;
            break;
           }
          }
          $320 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 80|0);
          HEAP16[$320>>1] = $317;
          $321 = $204 >>> 4;
          $322 = $321 << 3;
          $323 = (($$06$i18$i) + ($322))|0;
          $324 = $323 & 65408;
          $325 = ($324>>>0)>(1151);
          $326 = $323 & 65535;
          $327 = $325 ? 1151 : $326;
          $328 = (((($0)) + 4966|0) + ($327<<1)|0);
          $329 = HEAP16[$328>>1]|0;
          $330 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 82|0);
          HEAP16[$330>>1] = $329;
          $331 = ($203 << 3)&255;
          $332 = $331 & 120;
          $333 = $332&255;
          $334 = (($$06$i18$i) + ($333))|0;
          $335 = $334 & 65408;
          $336 = ($335>>>0)>(1151);
          $337 = $334 & 65535;
          $338 = $336 ? 1151 : $337;
          $339 = (((($0)) + 4966|0) + ($338<<1)|0);
          $340 = HEAP16[$339>>1]|0;
          $341 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 84|0);
          HEAP16[$341>>1] = $340;
         }
         break;
        }
        case 1:  {
         HEAP8[$309>>0] = 1;
         HEAP8[$310>>0] = $203;
         break;
        }
        case 2:  {
         HEAP8[$309>>0] = 2;
         HEAP8[$310>>0] = $203;
         break;
        }
        case 3:  {
         HEAP8[$309>>0] = 3;
         $342 = ($203<<24>>24)==(0);
         if (!($342)) {
          $343 = $203&255;
          $344 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 74|0);
          HEAP16[$344>>1] = $343;
         }
         $345 = ($$1$i<<16>>16)==(0);
         if (!($345)) {
          $346 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 76|0);
          HEAP16[$346>>1] = $$1$i;
          HEAP16[$209>>1] = $210;
         }
         break;
        }
        case 4:  {
         HEAP8[$309>>0] = 4;
         $347 = ($207|0)==(0);
         $$pre31$i = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 91|0);
         if (!($347)) {
          $348 = HEAP8[$$pre31$i>>0]|0;
          $349 = $348 & -16;
          $350 = $349&255;
          $351 = $207 | $350;
          $352 = $351&255;
          HEAP8[$$pre31$i>>0] = $352;
         }
         $353 = ($trunc1$i<<24>>24)==(0);
         if (!($353)) {
          $354 = $203 & -16;
          $355 = HEAP8[$$pre31$i>>0]|0;
          $356 = $355 & 15;
          $357 = $356 | $354;
          HEAP8[$$pre31$i>>0] = $357;
         }
         break;
        }
        case 5:  {
         $358 = ($$1$i<<16>>16)==(0);
         if (!($358)) {
          $359 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 76|0);
          HEAP16[$359>>1] = $$1$i;
          HEAP16[$209>>1] = $210;
         }
         HEAP8[$309>>0] = 5;
         $360 = ($203<<24>>24)==(0);
         if (!($360)) {
          $361 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 90|0);
          HEAP8[$361>>0] = $203;
         }
         break;
        }
        case 6:  {
         HEAP8[$309>>0] = 6;
         $362 = ($203<<24>>24)==(0);
         if (!($362)) {
          $363 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 90|0);
          HEAP8[$363>>0] = $203;
         }
         break;
        }
        case 9:  {
         $364 = $trunc1$i&255;
         $365 = $364 << 22;
         $366 = $203 & 15;
         $367 = $366&255;
         $368 = $367 << 18;
         $369 = $365 | $368;
         $370 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 56|0);
         HEAP32[$370>>2] = $369;
         break;
        }
        case 10:  {
         HEAP8[$309>>0] = 10;
         $371 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 90|0);
         HEAP8[$371>>0] = $203;
         break;
        }
        case 11:  {
         $372 = $203&255;
         $373 = HEAP8[$154>>0]|0;
         $374 = ($203&255)<($373&255);
         $spec$store$select$i312 = $374 ? $372 : 0;
         HEAP16[$149>>1] = $spec$store$select$i312;
         HEAP16[$150>>1] = 0;
         HEAP16[$153>>1] = 1;
         break;
        }
        case 12:  {
         $375 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 62|0);
         HEAP8[$375>>0] = $203;
         break;
        }
        case 13:  {
         $mulconv$i = ($trunc1$i*10)|0;
         $376 = $mulconv$i&255;
         $377 = (($207) + ($376))|0;
         $378 = Math_imul($377, $379)|0;
         $380 = $378&65535;
         HEAP16[$150>>1] = $380;
         HEAP16[$153>>1] = 1;
         $381 = HEAP16[$149>>1]|0;
         $382 = (($381) + 1)<<16>>16;
         $383 = $382&65535;
         $384 = HEAP8[$154>>0]|0;
         $385 = $384&255;
         $386 = ($383>>>0)<($385>>>0);
         $spec$store$select9$i313 = $386 ? $382 : 0;
         HEAP16[$149>>1] = $spec$store$select9$i313;
         break;
        }
        case 14:  {
         $trunc1$i$clear = $trunc1$i & 15;
         do {
          switch ($trunc1$i$clear<<24>>24) {
          case 1:  {
           $387 = $317&65535;
           $388 = (($387) - ($207))|0;
           $389 = $388&65535;
           $390 = $388 & 65535;
           $391 = ($390>>>0)<(113);
           $spec$store$select10$i = $391 ? 113 : $389;
           HEAP16[$209>>1] = $spec$store$select10$i;
           break L78;
           break;
          }
          case 2:  {
           $392 = $317&65535;
           $393 = (($207) + ($392))|0;
           $394 = $393&65535;
           $395 = $393 & 65535;
           $396 = ($395>>>0)>(856);
           $spec$store$select11$i = $396 ? 856 : $394;
           HEAP16[$209>>1] = $spec$store$select11$i;
           break L78;
           break;
          }
          case 3:  {
           $397 = $203 & 15;
           $398 = $397&255;
           $399 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 54|0);
           HEAP16[$399>>1] = $398;
           break L78;
           break;
          }
          case 10:  {
           $400 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 62|0);
           $401 = HEAP8[$400>>0]|0;
           $402 = $401&255;
           $403 = (($207) + ($402))|0;
           $404 = $403&255;
           $405 = $403 & 255;
           $406 = ($405>>>0)>(64);
           $spec$store$select12$i = $406 ? 64 : $404;
           HEAP8[$400>>0] = $spec$store$select12$i;
           break L78;
           break;
          }
          case 11:  {
           $407 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 62|0);
           $408 = HEAP8[$407>>0]|0;
           $409 = $408&255;
           $410 = (($409) - ($207))|0;
           $411 = $410&255;
           $412 = $410 & 255;
           $413 = ($412>>>0)>(200);
           $spec$store$select13$i = $413 ? 0 : $411;
           HEAP8[$407>>0] = $spec$store$select13$i;
           break L78;
           break;
          }
          case 5:  {
           $414 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 93|0);
           HEAP8[$414>>0] = $208;
           $415 = ($$1$i<<16>>16)==(0);
           if ($415) {
            break L78;
           }
           $416 = ($208<<24>>24)==(0);
           if ($416) {
            $$2$i = $$1$i;
           } else {
            $417 = ($207>>>0)<(8);
            $$01$i14$i = 0;
            while(1) {
             $418 = (((($0)) + 4966|0) + ($$01$i14$i<<1)|0);
             $419 = HEAP16[$418>>1]|0;
             $420 = ($419&65535)>($$1$i&65535);
             if (!($420)) {
              $$06$i15$i = $$01$i14$i;
              break;
             }
             $421 = (($$01$i14$i) + 1)|0;
             $422 = ($421>>>0)<(1152);
             if ($422) {
              $$01$i14$i = $421;
             } else {
              $$06$i15$i = 144;
              break;
             }
            }
            $423 = $204 | -16;
            $$sink = $417 ? $207 : $423;
            $424 = (($$06$i15$i) + ($$sink))|0;
            $425 = (((($0)) + 4966|0) + ($424<<1)|0);
            $426 = HEAP16[$425>>1]|0;
            $$2$i = $426;
           }
           HEAP16[$209>>1] = $$2$i;
           break L78;
           break;
          }
          case 6:  {
           $427 = ($208<<24>>24)==(0);
           if ($427) {
            $441 = HEAP16[$150>>1]|0;
            $442 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 98|0);
            HEAP16[$442>>1] = $441;
            break L78;
           }
           $428 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 96|0);
           $429 = HEAP16[$428>>1]|0;
           $430 = ($429<<16>>16)==(0);
           if ($430) {
            $437 = $203 & 15;
            $438 = $437&255;
            HEAP16[$428>>1] = $438;
            $439 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 98|0);
            $440 = HEAP16[$439>>1]|0;
            HEAP16[$150>>1] = $440;
            HEAP16[$153>>1] = 1;
            break L78;
           }
           $431 = (($429) + -1)<<16>>16;
           HEAP16[$428>>1] = $431;
           $432 = ($431<<16>>16)==(0);
           if ($432) {
            $435 = HEAP16[$150>>1]|0;
            $436 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 98|0);
            HEAP16[$436>>1] = $435;
            break L78;
           } else {
            $433 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 98|0);
            $434 = HEAP16[$433>>1]|0;
            HEAP16[$150>>1] = $434;
            HEAP16[$153>>1] = 1;
            break L78;
           }
           break;
          }
          case 14:  {
           $443 = $203 & 15;
           $444 = $443&255;
           HEAP16[$146>>1] = $444;
           break L78;
           break;
          }
          case 9:  {
           $445 = ($208<<24>>24)==(0);
           if ($445) {
            break L78;
           }
           $446 = $203 & 15;
           $447 = $446&255;
           $448 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 48|0);
           $449 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 46|0);
           HEAP8[$309>>0] = 14;
           HEAP8[$310>>0] = -112;
           HEAP16[$448>>1] = $447;
           HEAP16[$449>>1] = 0;
           break L78;
           break;
          }
          case 12:  {
           HEAP8[$309>>0] = 12;
           $450 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 94|0);
           HEAP8[$450>>0] = $208;
           $451 = ($208<<24>>24)==(0);
           if (!($451)) {
            break L78;
           }
           $452 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 62|0);
           HEAP8[$452>>0] = 0;
           break L78;
           break;
          }
          case 13:  {
           HEAP8[$309>>0] = 14;
           HEAP8[$310>>0] = -48;
           break L78;
           break;
          }
          case 15:  {
           $453 = $203 & 15;
           $454 = $453&255;
           $455 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 52|0);
           HEAP16[$455>>1] = $454;
           $456 = ($453<<24>>24)==(0);
           if ($456) {
            break L78;
           }
           $457 = $453&255;
           $458 = (560 + ($457)|0);
           $459 = HEAP8[$458>>0]|0;
           $460 = $459&255;
           $461 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 50|0);
           $462 = HEAP16[$461>>1]|0;
           $463 = $462&65535;
           $464 = (($463) + ($460))|0;
           $465 = $464&65535;
           HEAP16[$461>>1] = $465;
           $466 = $464 & 65535;
           $467 = ($466>>>0)>(128);
           if (!($467)) {
            break L78;
           }
           HEAP16[$461>>1] = 0;
           $468 = HEAP32[$184>>2]|0;
           $469 = ($468|0)==(0|0);
           if ($469) {
            break L78;
           }
           $470 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 4|0);
           $471 = HEAP16[$470>>1]|0;
           $472 = ($471<<16>>16)==(0);
           if ($472) {
            break L78;
           }
           $473 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 8|0);
           $474 = HEAP16[$473>>1]|0;
           $475 = ($474&65535)>(2);
           if (!($475)) {
            break L78;
           }
           $476 = $474&65535;
           $477 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 56|0);
           $478 = HEAP32[$477>>2]|0;
           $479 = $478 >>> 10;
           $480 = (((((($0)) + 1764|0) + (($$0295328*100)|0)|0)) + 6|0);
           $481 = HEAP16[$480>>1]|0;
           $482 = $481&65535;
           $483 = (($482) + ($476))|0;
           $484 = ($479>>>0)<($483>>>0);
           if ($484) {
            $$pre$phi$i$i315Z2D = $479;
           } else {
            $485 = $483 << 10;
            $486 = $482 << 10;
            $487 = (($478>>>0) % ($485>>>0))&-1;
            $488 = (($487) + ($486))|0;
            HEAP32[$477>>2] = $488;
            $$pre$i$i314 = $488 >>> 10;
            $$pre$phi$i$i315Z2D = $$pre$i$i314;
           }
           $489 = (($468) + ($$pre$phi$i$i315Z2D)|0);
           $490 = HEAP8[$489>>0]|0;
           $491 = $490 ^ -1;
           HEAP8[$489>>0] = $491;
           break L78;
           break;
          }
          default: {
           break L78;
          }
          }
         } while(0);
         break;
        }
        case 15:  {
         $$off$i316 = (($203) + -1)<<24>>24;
         $492 = ($$off$i316&255)<(31);
         if ($492) {
          HEAP8[$148>>0] = $203;
          $493 = HEAP32[$155>>2]|0;
          $494 = ($493*5)|0;
          $495 = HEAP8[$156>>0]|0;
          $496 = $495&255;
          $497 = $496 << 1;
          $498 = (($494>>>0) / ($497>>>0))&-1;
          $499 = Math_imul($498, $204)|0;
          HEAP32[$145>>2] = $499;
          break L78;
         }
         $500 = ($203&255)>(31);
         if ($500) {
          HEAP8[$156>>0] = $203;
          $501 = HEAP8[$148>>0]|0;
          $502 = $501&255;
          $503 = HEAP32[$155>>2]|0;
          $504 = ($503*5)|0;
          $505 = $204 << 1;
          $506 = (($504>>>0) / ($505>>>0))&-1;
          $507 = Math_imul($506, $502)|0;
          HEAP32[$145>>2] = $507;
         }
         break;
        }
        default: {
        }
        }
       } while(0);
       $508 = HEAP16[$152>>1]|0;
       $509 = $508&65535;
       $510 = ($185>>>0)<($509>>>0);
       if ($510) {
        $$0295328 = $185;$379 = $509;
       } else {
        break;
       }
      }
      $511 = $508&65535;
      $$lcssa = $511;
     }
     $512 = HEAP16[$153>>1]|0;
     $513 = ($512<<16>>16)==(0);
     if ($513) {
      $514 = HEAP16[$150>>1]|0;
      $515 = $514&65535;
      $516 = (($$lcssa) + ($515))|0;
      $517 = $516&65535;
      HEAP16[$150>>1] = $517;
     } else {
      HEAP16[$153>>1] = 0;
     }
     $518 = HEAP16[$150>>1]|0;
     $519 = $518&65535;
     $520 = $$lcssa << 6;
     $521 = ($520|0)==($519|0);
     if ($521) {
      $522 = HEAP16[$149>>1]|0;
      $523 = (($522) + 1)<<16>>16;
      HEAP16[$149>>1] = $523;
      HEAP16[$150>>1] = 0;
      $524 = $523&65535;
      $525 = HEAP8[$154>>0]|0;
      $526 = $525&255;
      $527 = ($524>>>0)<($526>>>0);
      if (!($527)) {
       HEAP16[$149>>1] = 0;
      }
     }
    }
   } while(0);
   $529 = HEAP32[$147>>2]|0;
   $530 = (($529) + 1)|0;
   HEAP32[$147>>2] = $530;
   $531 = HEAP32[$145>>2]|0;
   $532 = HEAP8[$148>>0]|0;
   $533 = $532&255;
   $534 = (($531>>>0) / ($533>>>0))&-1;
   $535 = ($529>>>0)>($534>>>0);
   if ($535) {
    $536 = HEAP16[$152>>1]|0;
    $537 = ($536<<16>>16)==(0);
    L167: do {
     if (!($537)) {
      $$1296337 = 0;
      while(1) {
       $538 = (((($0)) + 1764|0) + (($$1296337*100)|0)|0);
       $539 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 52|0);
       $540 = HEAP16[$539>>1]|0;
       $541 = ($540<<16>>16)==(0);
       if (!($541)) {
        $542 = $540 << 16 >> 16;
        $543 = (560 + ($542)|0);
        $544 = HEAP8[$543>>0]|0;
        $545 = $544&255;
        $546 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 50|0);
        $547 = HEAP16[$546>>1]|0;
        $548 = $547&65535;
        $549 = (($548) + ($545))|0;
        $550 = $549&65535;
        HEAP16[$546>>1] = $550;
        $551 = $549 & 65535;
        $552 = ($551>>>0)>(128);
        if ($552) {
         HEAP16[$546>>1] = 0;
         $553 = HEAP32[$538>>2]|0;
         $554 = ($553|0)==(0|0);
         if (!($554)) {
          $555 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 4|0);
          $556 = HEAP16[$555>>1]|0;
          $557 = ($556<<16>>16)==(0);
          if (!($557)) {
           $558 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 8|0);
           $559 = HEAP16[$558>>1]|0;
           $560 = ($559&65535)>(2);
           if ($560) {
            $561 = $559&65535;
            $562 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 56|0);
            $563 = HEAP32[$562>>2]|0;
            $564 = $563 >>> 10;
            $565 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 6|0);
            $566 = HEAP16[$565>>1]|0;
            $567 = $566&65535;
            $568 = (($567) + ($561))|0;
            $569 = ($564>>>0)<($568>>>0);
            if ($569) {
             $$pre$phi$i$iZ2D = $564;
            } else {
             $570 = $568 << 10;
             $571 = $567 << 10;
             $572 = (($563>>>0) % ($570>>>0))&-1;
             $573 = (($572) + ($571))|0;
             HEAP32[$562>>2] = $573;
             $$pre$i$i = $573 >>> 10;
             $$pre$phi$i$iZ2D = $$pre$i$i;
            }
            $574 = (($553) + ($$pre$phi$i$iZ2D)|0);
            $575 = HEAP8[$574>>0]|0;
            $576 = $575 ^ -1;
            HEAP8[$574>>0] = $576;
           }
          }
         }
        }
       }
       $577 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 68|0);
       $578 = HEAP8[$577>>0]|0;
       L181: do {
        switch ($578<<24>>24) {
        case 0:  {
         $579 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 69|0);
         $580 = HEAP8[$579>>0]|0;
         $581 = ($580<<24>>24)==(0);
         if (!($581)) {
          $582 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 60|0);
          $583 = HEAP16[$582>>1]|0;
          $584 = $583&65535;
          $585 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 86|0);
          $586 = HEAP8[$585>>0]|0;
          $587 = $586&255;
          $588 = ((((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 80|0) + ($587<<1)|0);
          $589 = HEAP16[$588>>1]|0;
          $590 = $589&65535;
          $591 = (($584) - ($590))|0;
          $592 = $591&65535;
          $593 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 72|0);
          HEAP16[$593>>1] = $592;
          $594 = (($586) + 1)<<24>>24;
          $595 = ($594&255)>(2);
          $spec$store$select$i = $595 ? 0 : $594;
          HEAP8[$585>>0] = $spec$store$select$i;
         }
         break;
        }
        case 1:  {
         $596 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 60|0);
         $597 = HEAP16[$596>>1]|0;
         $598 = ($597<<16>>16)==(0);
         if (!($598)) {
          $599 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 69|0);
          $600 = HEAP8[$599>>0]|0;
          $601 = $600&255;
          $602 = $597&65535;
          $603 = (($602) - ($601))|0;
          $604 = $603&65535;
          $605 = $603 & 65535;
          $$off$i = (($605) + -113)|0;
          $606 = ($$off$i>>>0)>(19887);
          $spec$store$select9$i = $606 ? 113 : $604;
          HEAP16[$596>>1] = $spec$store$select9$i;
         }
         break;
        }
        case 2:  {
         $607 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 60|0);
         $608 = HEAP16[$607>>1]|0;
         $609 = ($608<<16>>16)==(0);
         if (!($609)) {
          $610 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 69|0);
          $611 = HEAP8[$610>>0]|0;
          $612 = $611&255;
          $613 = $608&65535;
          $614 = (($612) + ($613))|0;
          $615 = $614&65535;
          $616 = $614 & 65535;
          $617 = ($616>>>0)>(20000);
          $spec$store$select1$i = $617 ? 20000 : $615;
          HEAP16[$607>>1] = $spec$store$select1$i;
         }
         break;
        }
        case 3: case 5:  {
         $618 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 60|0);
         $619 = HEAP16[$618>>1]|0;
         $620 = $619&65535;
         $621 = ($619<<16>>16)==(0);
         if (!($621)) {
          $622 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 76|0);
          $623 = HEAP16[$622>>1]|0;
          $624 = $623 << 16 >> 16;
          $625 = ($620|0)==($624|0);
          $626 = ($623<<16>>16)==(0);
          $or$cond2$i = $626 | $625;
          if (!($or$cond2$i)) {
           $627 = ($620|0)>($624|0);
           if ($627) {
            $628 = (($620) - ($624))|0;
            $629 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 74|0);
            $630 = HEAP16[$629>>1]|0;
            $631 = $630 << 16 >> 16;
            $632 = ($628|0)<($631|0);
            if ($632) {
             $$sink387 = $623;
            } else {
             $633 = (($620) - ($631))|0;
             $634 = $633&65535;
             $$sink387 = $634;
            }
           } else {
            $635 = (($624) - ($620))|0;
            $636 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 74|0);
            $637 = HEAP16[$636>>1]|0;
            $638 = $637 << 16 >> 16;
            $639 = ($635|0)<($638|0);
            if ($639) {
             $$sink387 = $623;
            } else {
             $640 = (($638) + ($620))|0;
             $641 = $640&65535;
             $$sink387 = $641;
            }
           }
           HEAP16[$618>>1] = $$sink387;
           $642 = $$sink387&65535;
           $643 = ($642|0)==($624|0);
           if ($643) {
            HEAP16[$622>>1] = 0;
           }
          }
         }
         $644 = ($578<<24>>24)==(5);
         if ($644) {
          $645 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 90|0);
          $646 = HEAP8[$645>>0]|0;
          $647 = $646&255;
          $648 = $647 & 240;
          $649 = ($648|0)==(0);
          if ($649) {
           $658 = $647 & 15;
           $659 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 62|0);
           $660 = HEAP8[$659>>0]|0;
           $661 = $660&255;
           $662 = (($661) - ($658))|0;
           $663 = $662&255;
           $664 = $662 & 192;
           $665 = ($664|0)==(0);
           $spec$store$select4$i = $665 ? $663 : 0;
           HEAP8[$659>>0] = $spec$store$select4$i;
           break L181;
          } else {
           $650 = $647 >>> 4;
           $651 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 62|0);
           $652 = HEAP8[$651>>0]|0;
           $653 = $652&255;
           $654 = (($650) + ($653))|0;
           $655 = $654&255;
           $656 = $654 & 192;
           $657 = ($656|0)==(0);
           $spec$store$select3$i = $657 ? $655 : 63;
           HEAP8[$651>>0] = $spec$store$select3$i;
           break L181;
          }
         }
         break;
        }
        case 4: case 6:  {
         $666 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 91|0);
         $667 = HEAP8[$666>>0]|0;
         $668 = $667 & 15;
         $669 = $668&255;
         $670 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 92|0);
         $671 = HEAP8[$670>>0]|0;
         $672 = $671 & 31;
         $673 = $672&255;
         $674 = (576 + ($673<<1)|0);
         $675 = HEAP16[$674>>1]|0;
         $676 = $675 << 16 >> 16;
         $677 = Math_imul($676, $669)|0;
         $678 = $677 >> 7;
         $679 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 78|0);
         $680 = ($671&255)>(31);
         $681 = (0 - ($678))|0;
         $spec$select$i = $680 ? $681 : $678;
         $storemerge$i = $spec$select$i&65535;
         HEAP16[$679>>1] = $storemerge$i;
         $682 = $671&255;
         $683 = $667&255;
         $684 = $683 >>> 4;
         $685 = (($684) + ($682))|0;
         $686 = $685 & 63;
         $687 = $686&255;
         HEAP8[$670>>0] = $687;
         $688 = ($578<<24>>24)==(6);
         if ($688) {
          $689 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 90|0);
          $690 = HEAP8[$689>>0]|0;
          $691 = $690&255;
          $692 = $691 & 240;
          $693 = ($692|0)==(0);
          if ($693) {
           $702 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 62|0);
           $703 = HEAP8[$702>>0]|0;
           $704 = $703&255;
           $705 = (($704) - ($691))|0;
           $706 = $705&255;
           $707 = $705 & 255;
           $708 = ($707>>>0)>(64);
           $spec$store$select6$i = $708 ? 0 : $706;
           HEAP8[$702>>0] = $spec$store$select6$i;
           break L181;
          } else {
           $694 = $691 >>> 4;
           $695 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 62|0);
           $696 = HEAP8[$695>>0]|0;
           $697 = $696&255;
           $698 = (($694) + ($697))|0;
           $699 = $698&255;
           $700 = $698 & 255;
           $701 = ($700>>>0)>(64);
           $spec$store$select5$i = $701 ? 64 : $699;
           HEAP8[$695>>0] = $spec$store$select5$i;
           break L181;
          }
         }
         break;
        }
        case 10:  {
         $709 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 90|0);
         $710 = HEAP8[$709>>0]|0;
         $711 = $710&255;
         $712 = $711 & 240;
         $713 = ($712|0)==(0);
         if ($713) {
          $722 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 62|0);
          $723 = HEAP8[$722>>0]|0;
          $724 = $723&255;
          $725 = (($724) - ($711))|0;
          $726 = $725&255;
          $727 = $725 & 255;
          $728 = ($727>>>0)>(64);
          $spec$store$select8$i = $728 ? 0 : $726;
          HEAP8[$722>>0] = $spec$store$select8$i;
          break L181;
         } else {
          $714 = $711 >>> 4;
          $715 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 62|0);
          $716 = HEAP8[$715>>0]|0;
          $717 = $716&255;
          $718 = (($714) + ($717))|0;
          $719 = $718&255;
          $720 = $718 & 255;
          $721 = ($720>>>0)>(64);
          $spec$store$select7$i = $721 ? 64 : $719;
          HEAP8[$715>>0] = $spec$store$select7$i;
          break L181;
         }
         break;
        }
        case 14:  {
         $729 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 69|0);
         $730 = HEAP8[$729>>0]|0;
         $trunc$i = ($730&255) >>> 4;
         $trunc$i$clear = $trunc$i & 15;
         switch ($trunc$i$clear<<24>>24) {
         case 12:  {
          $731 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 94|0);
          $732 = HEAP8[$731>>0]|0;
          $733 = ($732<<24>>24)==(0);
          $734 = (($732) + -1)<<24>>24;
          if (!($733)) {
           HEAP8[$731>>0] = $734;
           $735 = ($734<<24>>24)==(0);
           if (!($735)) {
            break L181;
           }
          }
          $736 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 62|0);
          HEAP8[$736>>0] = 0;
          break L181;
          break;
         }
         case 9:  {
          $737 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 46|0);
          $738 = HEAP16[$737>>1]|0;
          $739 = (($738) + 1)<<16>>16;
          HEAP16[$737>>1] = $739;
          $740 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 48|0);
          $741 = HEAP16[$740>>1]|0;
          $742 = ($739&65535)<($741&65535);
          if ($742) {
           break L181;
          }
          HEAP16[$737>>1] = 0;
          $743 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 36|0);
          $744 = HEAP32[$743>>2]|0;
          HEAP32[$538>>2] = $744;
          $745 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 40|0);
          $746 = HEAP16[$745>>1]|0;
          $747 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 4|0);
          HEAP16[$747>>1] = $746;
          $748 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 42|0);
          $749 = HEAP16[$748>>1]|0;
          $750 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 6|0);
          HEAP16[$750>>1] = $749;
          $751 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 44|0);
          $752 = HEAP16[$751>>1]|0;
          $753 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 8|0);
          HEAP16[$753>>1] = $752;
          $754 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 56|0);
          HEAP32[$754>>2] = 0;
          break L181;
          break;
         }
         case 13:  {
          $755 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 34|0);
          $756 = HEAP16[$755>>1]|0;
          $757 = ($756<<16>>16)==(0);
          if ($757) {
           break L181;
          }
          $758 = $756&65535;
          $759 = (($758) + -1)|0;
          $760 = HEAP16[$151>>1]|0;
          $761 = $760&65535;
          $762 = ($759|0)==($761|0);
          if (!($762)) {
           break L181;
          }
          $763 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 24|0);
          $764 = HEAP32[$763>>2]|0;
          HEAP32[$538>>2] = $764;
          $765 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 28|0);
          $766 = HEAP16[$765>>1]|0;
          $767 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 4|0);
          HEAP16[$767>>1] = $766;
          $768 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 30|0);
          $769 = HEAP16[$768>>1]|0;
          $770 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 6|0);
          HEAP16[$770>>1] = $769;
          $771 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 32|0);
          $772 = HEAP16[$771>>1]|0;
          $773 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 8|0);
          HEAP16[$773>>1] = $772;
          $774 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 36|0);
          HEAP32[$774>>2] = $764;
          $775 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 40|0);
          HEAP16[$775>>1] = $766;
          $776 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 42|0);
          HEAP16[$776>>1] = $769;
          $777 = (((((($0)) + 1764|0) + (($$1296337*100)|0)|0)) + 44|0);
          HEAP16[$777>>1] = $772;
          HEAP16[$755>>1] = 0;
          break L181;
          break;
         }
         default: {
          break L181;
         }
         }
         break;
        }
        default: {
        }
        }
       } while(0);
       $778 = (($$1296337) + 1)|0;
       $779 = HEAP16[$152>>1]|0;
       $780 = $779&65535;
       $781 = ($778>>>0)<($780>>>0);
       if ($781) {
        $$1296337 = $778;
       } else {
        break L167;
       }
      }
     }
    } while(0);
    $782 = HEAP16[$151>>1]|0;
    $783 = (($782) + 1)<<16>>16;
    HEAP16[$151>>1] = $783;
    HEAP32[$147>>2] = 0;
   }
   $784 = ($$0305354|0)!=(0);
   $or$cond3 = $9 | $784;
   if (!($or$cond3)) {
    $785 = HEAP32[$158>>2]|0;
    $786 = HEAP32[$3>>2]|0;
    $787 = ($785|0)<($786|0);
    if ($787) {
     $788 = HEAP32[$160>>2]|0;
     $789 = (($788) + (($785*348)|0)|0);
     _memset(($789|0),0,348)|0;
    }
   }
   $790 = HEAP16[$152>>1]|0;
   $791 = ($790<<16>>16)==(0);
   if ($791) {
    $$0292$lcssa = 0;$$0298$lcssa = 0;
   } else {
    $792 = $790&65535;
    $$0290344 = 0;$$0292343 = 0;$$0298342 = 0;$$0347 = $157;
    while(1) {
     $793 = ((($$0347)) + 60|0);
     $794 = HEAP16[$793>>1]|0;
     $795 = ($794<<16>>16)==(0);
     if ($795) {
      $$2294 = $$0292343;$$2300 = $$0298342;
     } else {
      $796 = $794&65535;
      $797 = ((($$0347)) + 72|0);
      $798 = HEAP16[$797>>1]|0;
      $799 = $798&65535;
      $800 = (($796) - ($799))|0;
      $801 = ((($$0347)) + 78|0);
      $802 = HEAP16[$801>>1]|0;
      $803 = $802&65535;
      $804 = (($800) - ($803))|0;
      $805 = $804&65535;
      $806 = ($805<<16>>16)==(0);
      if ($806) {
       $$phi$trans$insert = ((($$0347)) + 56|0);
       $$pre = HEAP32[$$phi$trans$insert>>2]|0;
       $$pre$phiZ2D = $$phi$trans$insert;$821 = $$pre;
      } else {
       $807 = HEAP32[$159>>2]|0;
       $808 = $807 << 10;
       $sext308 = $804 << 16;
       $809 = $sext308 >> 16;
       $810 = (($808>>>0) / ($809>>>0))&-1;
       $811 = ((($$0347)) + 56|0);
       $812 = HEAP32[$811>>2]|0;
       $813 = (($812) + ($810))|0;
       HEAP32[$811>>2] = $813;
       $$pre$phiZ2D = $811;$821 = $813;
      }
      $814 = ((($$0347)) + 64|0);
      $815 = HEAP32[$814>>2]|0;
      $816 = (($815) + 1)|0;
      HEAP32[$814>>2] = $816;
      $817 = ((($$0347)) + 8|0);
      $818 = HEAP16[$817>>1]|0;
      $819 = ($818&65535)<(3);
      $820 = $821 >>> 10;
      L241: do {
       if ($819) {
        $822 = ((($$0347)) + 4|0);
        $823 = HEAP16[$822>>1]|0;
        $824 = $823&65535;
        $825 = ($820>>>0)<($824>>>0);
        if ($825) {
         $881 = $821;
        } else {
         HEAP16[$822>>1] = 0;
         $826 = ((($$0347)) + 6|0);
         HEAP16[$826>>1] = 0;
         $827 = ((($$0347)) + 22|0);
         $828 = HEAP16[$827>>1]|0;
         $829 = ($828<<16>>16)==(0);
         do {
          if (!($829)) {
           $830 = ((($$0347)) + 20|0);
           $831 = HEAP16[$830>>1]|0;
           HEAP16[$817>>1] = $831;
           $832 = ((($$0347)) + 18|0);
           $833 = HEAP16[$832>>1]|0;
           HEAP16[$826>>1] = $833;
           $834 = ((($$0347)) + 12|0);
           $835 = HEAP32[$834>>2]|0;
           HEAP32[$$0347>>2] = $835;
           $836 = ((($$0347)) + 16|0);
           $837 = HEAP16[$836>>1]|0;
           HEAP16[$822>>1] = $837;
           $838 = ((($$0347)) + 36|0);
           HEAP32[$838>>2] = $835;
           $839 = ((($$0347)) + 40|0);
           HEAP16[$839>>1] = $837;
           $840 = ((($$0347)) + 42|0);
           HEAP16[$840>>1] = $833;
           $841 = ((($$0347)) + 44|0);
           HEAP16[$841>>1] = $831;
           HEAP16[$827>>1] = 0;
           $842 = ($837<<16>>16)==(0);
           if ($842) {
            break;
           }
           $843 = $837&65535;
           $844 = $843 << 10;
           $845 = (($821>>>0) % ($844>>>0))&-1;
           HEAP32[$$pre$phiZ2D>>2] = $845;
           $881 = $845;
           break L241;
          }
         } while(0);
         HEAP32[$$pre$phiZ2D>>2] = 0;
         $881 = 0;
        }
       } else {
        $846 = $818&65535;
        $847 = ((($$0347)) + 6|0);
        $848 = HEAP16[$847>>1]|0;
        $849 = $848&65535;
        $850 = (($849) + ($846))|0;
        $851 = ($820>>>0)<($850>>>0);
        if ($851) {
         $881 = $821;
        } else {
         $852 = ((($$0347)) + 22|0);
         $853 = HEAP16[$852>>1]|0;
         $854 = ($853<<16>>16)==(0);
         if ($854) {
          $$pre374 = HEAP32[$$0347>>2]|0;
          $869 = $$pre374;$872 = $848;$875 = $818;
         } else {
          $855 = ((($$0347)) + 20|0);
          $856 = HEAP16[$855>>1]|0;
          HEAP16[$817>>1] = $856;
          $857 = ((($$0347)) + 18|0);
          $858 = HEAP16[$857>>1]|0;
          HEAP16[$847>>1] = $858;
          $859 = ((($$0347)) + 12|0);
          $860 = HEAP32[$859>>2]|0;
          HEAP32[$$0347>>2] = $860;
          $861 = ((($$0347)) + 16|0);
          $862 = HEAP16[$861>>1]|0;
          $863 = ((($$0347)) + 4|0);
          HEAP16[$863>>1] = $862;
          $864 = ((($$0347)) + 36|0);
          HEAP32[$864>>2] = $860;
          $865 = ((($$0347)) + 40|0);
          HEAP16[$865>>1] = $862;
          $866 = ((($$0347)) + 42|0);
          HEAP16[$866>>1] = $858;
          $867 = ((($$0347)) + 44|0);
          HEAP16[$867>>1] = $856;
          HEAP16[$852>>1] = 0;
          $868 = $860;
          $869 = $868;$872 = $858;$875 = $856;
         }
         $870 = ($869|0)==(0|0);
         if ($870) {
          $881 = $821;
         } else {
          $871 = $872&65535;
          $873 = $871 << 10;
          $874 = $875&65535;
          $876 = (($874) + ($871))|0;
          $877 = $876 << 10;
          $878 = (($821>>>0) % ($877>>>0))&-1;
          $879 = (($873) + ($878))|0;
          HEAP32[$$pre$phiZ2D>>2] = $879;
          $881 = $879;
         }
        }
       }
      } while(0);
      $880 = $881 >>> 10;
      $882 = HEAP32[$$0347>>2]|0;
      $883 = ($882|0)==(0|0);
      L256: do {
       if ($883) {
        $$1293324 = $$0292343;$$1299 = $$0298342;
       } else {
        $884 = $$0290344 & 3;
        $$off = (($884) + -1)|0;
        $switch = ($$off>>>0)<(2);
        if ($switch) {
         $885 = (($882) + ($880)|0);
         $886 = HEAP8[$885>>0]|0;
         $887 = $886 << 24 >> 24;
         $888 = ((($$0347)) + 62|0);
         $889 = HEAP8[$888>>0]|0;
         $890 = $889&255;
         $891 = Math_imul($890, $887)|0;
         $892 = (($891) + ($$0292343))|0;
         $$1293$ph = $892;
        } else {
         $$1293$ph = $$0292343;
        }
        $trunc = $$0290344&255;
        $trunc$clear = $trunc & 3;
        switch ($trunc$clear<<24>>24) {
        case 3: case 0:  {
         break;
        }
        default: {
         $$1293324 = $$1293$ph;$$1299 = $$0298342;
         break L256;
        }
        }
        $893 = (($882) + ($880)|0);
        $894 = HEAP8[$893>>0]|0;
        $895 = $894 << 24 >> 24;
        $896 = ((($$0347)) + 62|0);
        $897 = HEAP8[$896>>0]|0;
        $898 = $897&255;
        $899 = Math_imul($898, $895)|0;
        $900 = (($899) + ($$0298342))|0;
        $$1293324 = $$1293$ph;$$1299 = $900;
       }
      } while(0);
      if ($or$cond3) {
       $$2294 = $$1293324;$$2300 = $$1299;
      } else {
       $901 = HEAP32[$158>>2]|0;
       $902 = HEAP32[$3>>2]|0;
       $903 = ($901|0)<($902|0);
       if ($903) {
        $904 = HEAP32[$160>>2]|0;
        $905 = (($904) + (($901*348)|0)|0);
        HEAP32[$905>>2] = $792;
        $906 = (((($904) + (($901*348)|0)|0)) + 24|0);
        HEAP32[$906>>2] = $$1357;
        $907 = HEAP16[$149>>1]|0;
        $908 = $907&65535;
        $909 = (((($0)) + 952|0) + ($908)|0);
        $910 = HEAP8[$909>>0]|0;
        $911 = $910&255;
        $912 = (((($904) + (($901*348)|0)|0)) + 12|0);
        HEAP32[$912>>2] = $911;
        $913 = HEAP16[$150>>1]|0;
        $914 = (($913&65535) / ($790&65535))&-1;
        $915 = $914&65535;
        $916 = (((($904) + (($901*348)|0)|0)) + 16|0);
        HEAP32[$916>>2] = $915;
        $917 = (((($904) + (($901*348)|0)|0)) + 20|0);
        HEAP32[$917>>2] = $908;
        $918 = HEAP8[$156>>0]|0;
        $919 = $918&255;
        $920 = (((($904) + (($901*348)|0)|0)) + 4|0);
        HEAP32[$920>>2] = $919;
        $921 = HEAP8[$148>>0]|0;
        $922 = $921&255;
        $923 = (((($904) + (($901*348)|0)|0)) + 8|0);
        HEAP32[$923>>2] = $922;
        $924 = ((($$0347)) + 70|0);
        $925 = HEAP16[$924>>1]|0;
        $926 = ((((((($904) + (($901*348)|0)|0)) + 28|0) + (($$0290344*10)|0)|0)) + 6|0);
        HEAP16[$926>>1] = $925;
        $927 = ((($$0347)) + 69|0);
        $928 = HEAP8[$927>>0]|0;
        $929 = $928&255;
        $930 = ((((((($904) + (($901*348)|0)|0)) + 28|0) + (($$0290344*10)|0)|0)) + 8|0);
        HEAP16[$930>>1] = $929;
        $931 = ((((((($904) + (($901*348)|0)|0)) + 28|0) + (($$0290344*10)|0)|0)) + 2|0);
        HEAP16[$931>>1] = $805;
        $932 = ((($$0347)) + 62|0);
        $933 = HEAP8[$932>>0]|0;
        $934 = ((((((($904) + (($901*348)|0)|0)) + 28|0) + (($$0290344*10)|0)|0)) + 4|0);
        HEAP8[$934>>0] = $933;
        $935 = ((($$0347)) + 10|0);
        $936 = HEAP16[$935>>1]|0;
        $937 = $936&255;
        $938 = ((((($904) + (($901*348)|0)|0)) + 28|0) + (($$0290344*10)|0)|0);
        HEAP8[$938>>0] = $937;
        $$2294 = $$1293324;$$2300 = $$1299;
       } else {
        $$2294 = $$1293324;$$2300 = $$1299;
       }
      }
     }
     $939 = (($$0290344) + 1)|0;
     $940 = ((($$0347)) + 100|0);
     $941 = ($939>>>0)<($792>>>0);
     if ($941) {
      $$0290344 = $939;$$0292343 = $$2294;$$0298342 = $$2300;$$0347 = $940;
     } else {
      $$0292$lcssa = $$2294;$$0298$lcssa = $$2300;
      break;
     }
    }
   }
   if ($or$cond3) {
    $947 = (($$0305354) + -1)|0;
    $$1306 = $947;
   } else {
    $942 = HEAP32[$163>>2]|0;
    $943 = HEAP32[$158>>2]|0;
    $944 = HEAP32[$3>>2]|0;
    $945 = ($943|0)<($944|0);
    if ($945) {
     $946 = (($943) + 1)|0;
     HEAP32[$158>>2] = $946;
     $$1306 = $942;
    } else {
     $$1306 = $942;
    }
   }
   $sext = $$0298$lcssa << 16;
   $948 = $sext >> 16;
   $sext307 = $$0292$lcssa << 16;
   $949 = $sext307 >> 16;
   $950 = HEAP16[$161>>1]|0;
   $951 = ($950<<16>>16)==(0);
   $952 = (($$0298$lcssa) + ($$0297355))|0;
   $953 = $952 >> 1;
   $954 = (($$0292$lcssa) + ($$0291356))|0;
   $955 = $954 >> 1;
   $spec$select325 = $951 ? $$0298$lcssa : $953;
   $spec$select326 = $951 ? $$0292$lcssa : $955;
   $956 = HEAP16[$162>>1]|0;
   $957 = ($956<<16>>16)==(1);
   $958 = $spec$select326 >> 1;
   $959 = (($958) + ($spec$select325))|0;
   $960 = $959 >> 1;
   $$4302 = $957 ? $959 : $spec$select325;
   $961 = $957 ? $960 : 0;
   $$4 = (($961) + ($spec$select326))|0;
   $962 = ($$4302|0)<(32767);
   $spec$select = $962 ? $$4302 : 32767;
   $963 = ($spec$select|0)>(-32768);
   $$6304 = $963 ? $spec$select : -32768;
   $964 = ($$4|0)<(32767);
   $spec$select309 = $964 ? $$4 : 32767;
   $965 = ($spec$select309|0)>(-32768);
   $$6 = $965 ? $spec$select309 : -32768;
   $966 = $$6304&65535;
   $967 = $$1357 << 1;
   $968 = (($1) + ($967<<1)|0);
   HEAP16[$968>>1] = $966;
   $969 = $$6&65535;
   $970 = $967 | 1;
   $971 = (($1) + ($970<<1)|0);
   HEAP16[$971>>1] = $969;
   $972 = (($$1357) + 1)|0;
   $exitcond = ($972|0)==($2|0);
   if ($exitcond) {
    $$0291$lcssa = $949;$$0297$lcssa = $948;
    break;
   } else {
    $$0291356 = $949;$$0297355 = $948;$$0305354 = $$1306;$$1357 = $972;
   }
  }
 }
 $973 = $$0297$lcssa&65535;
 HEAP16[$137>>1] = $973;
 $974 = $$0291$lcssa&65535;
 HEAP16[$140>>1] = $974;
 $975 = ((($0)) + 1760|0);
 $976 = HEAP32[$975>>2]|0;
 $977 = (($976) + ($2))|0;
 HEAP32[$975>>2] = $977;
 return;
}
function _getNextSoundData($0,$1,$2,$3) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 var $$0 = 0, $$04348 = 0, $$046 = 0, $$1$lcssa = 0, $$14552 = 0, $$14750 = 0, $$14751 = 0, $$149 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0.0, $19 = 0.0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0.0, $25 = 0.0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $or$cond = 0, $or$cond3 = 0, $or$cond5 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 65536|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abortStackOverflow(65536|0);
 $4 = sp;
 $5 = ($0|0)!=(0|0);
 $6 = ($1|0)!=(0|0);
 $or$cond = $5 & $6;
 $7 = ($2|0)!=(0|0);
 $or$cond3 = $or$cond & $7;
 $8 = ($3|0)>(0);
 $or$cond5 = $or$cond3 & $8;
 if (!($or$cond5)) {
  STACKTOP = sp;return 0;
 }
 $$0 = 0;$$046 = 0;
 while(1) {
  $9 = (($3) - ($$046))|0;
  $10 = ($9|0)>(16383);
  if ($10) {
   _hxcmod_fillbuffer($0,$4,16384,0);
   $11 = (($$046) + 16384)|0;
   $$14552 = 16384;$$14751 = $11;
   label = 7;
  } else {
   $12 = (16384 - ($9))|0;
   $13 = ($12|0)>(0);
   if ($13) {
    _hxcmod_fillbuffer($0,$4,$12,0);
    $14 = (($12) + ($$046))|0;
    $$14552 = $12;$$14751 = $14;
    label = 7;
   } else {
    $$1$lcssa = $$0;$$14750 = $$046;
   }
  }
  if ((label|0) == 7) {
   label = 0;
   $$04348 = 0;$$149 = $$0;
   while(1) {
    $15 = $$04348 << 1;
    $16 = (($4) + ($15<<1)|0);
    $17 = HEAP16[$16>>1]|0;
    $18 = (+($17<<16>>16));
    $19 = $18 * 3.0518509447574615E-5;
    $20 = (($1) + ($$149<<2)|0);
    HEAPF32[$20>>2] = $19;
    $21 = $15 | 1;
    $22 = (($4) + ($21<<1)|0);
    $23 = HEAP16[$22>>1]|0;
    $24 = (+($23<<16>>16));
    $25 = $24 * 3.0518509447574615E-5;
    $26 = (($2) + ($$149<<2)|0);
    HEAPF32[$26>>2] = $25;
    $27 = (($$149) + 1)|0;
    $28 = (($$04348) + 1)|0;
    $exitcond = ($28|0)==($$14552|0);
    if ($exitcond) {
     break;
    } else {
     $$04348 = $28;$$149 = $27;
    }
   }
   $29 = (($$14552) + ($$0))|0;
   $$1$lcssa = $29;$$14750 = $$14751;
  }
  $30 = ($$14750|0)<($3|0);
  if ($30) {
   $$0 = $$1$lcssa;$$046 = $$14750;
  } else {
   break;
  }
 }
 STACKTOP = sp;return 0;
}
function _loadMod($0,$1,$2) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = +$2;
 var $$0 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $or$cond = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $3 = ($0|0)!=(0|0);
 $4 = ($1|0)!=(0);
 $or$cond = $3 & $4;
 if (!($or$cond)) {
  $$0 = 0;
  return ($$0|0);
 }
 $5 = (_malloc(7284)|0);
 $6 = ($5|0)==(0|0);
 if ($6) {
  $$0 = $5;
  return ($$0|0);
 }
 $7 = (~~(($2)));
 _memset(($5|0),0,7284)|0;
 (_hxcmod_init($5)|0);
 (_hxcmod_setcfg($5,$7,1,1)|0);
 (_hxcmod_load($5,$0,$1)|0);
 $$0 = $5;
 return ($$0|0);
}
function _unloadMod($0) {
 $0 = $0|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($0|0)==(0|0);
 if (!($1)) {
  _free($0);
 }
 return;
}
function _main() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 0;
}
function _malloc($0) {
 $0 = $0|0;
 var $$0 = 0, $$0$i = 0, $$0$i$i = 0, $$0$i$i$i = 0, $$0$i20$i = 0, $$0169$i = 0, $$0170$i = 0, $$0171$i = 0, $$0192 = 0, $$0194 = 0, $$02014$i$i = 0, $$0202$lcssa$i$i = 0, $$02023$i$i = 0, $$0206$i$i = 0, $$0207$i$i = 0, $$024372$i = 0, $$0259$i$i = 0, $$02604$i$i = 0, $$0261$lcssa$i$i = 0, $$02613$i$i = 0;
 var $$0267$i$i = 0, $$0268$i$i = 0, $$0318$i = 0, $$032012$i = 0, $$0321$lcssa$i = 0, $$032111$i = 0, $$0323$i = 0, $$0329$i = 0, $$0335$i = 0, $$0336$i = 0, $$0338$i = 0, $$0339$i = 0, $$0344$i = 0, $$1174$i = 0, $$1174$i$be = 0, $$1174$i$ph = 0, $$1176$i = 0, $$1176$i$be = 0, $$1176$i$ph = 0, $$124471$i = 0;
 var $$1263$i$i = 0, $$1263$i$i$be = 0, $$1263$i$i$ph = 0, $$1265$i$i = 0, $$1265$i$i$be = 0, $$1265$i$i$ph = 0, $$1319$i = 0, $$1324$i = 0, $$1340$i = 0, $$1346$i = 0, $$1346$i$be = 0, $$1346$i$ph = 0, $$1350$i = 0, $$1350$i$be = 0, $$1350$i$ph = 0, $$2234243136$i = 0, $$2247$ph$i = 0, $$2253$ph$i = 0, $$2331$i = 0, $$3$i = 0;
 var $$3$i$i = 0, $$3$i198 = 0, $$3$i198211 = 0, $$3326$i = 0, $$3348$i = 0, $$4$lcssa$i = 0, $$415$i = 0, $$415$i$ph = 0, $$4236$i = 0, $$4327$lcssa$i = 0, $$432714$i = 0, $$432714$i$ph = 0, $$4333$i = 0, $$533413$i = 0, $$533413$i$ph = 0, $$723947$i = 0, $$748$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0;
 var $$pre$i16$i = 0, $$pre$i195 = 0, $$pre$i204 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i17$iZ2D = 0, $$pre$phi$i205Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phiZ2D = 0, $$sink = 0, $$sink320 = 0, $$sink321 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0;
 var $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0;
 var $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0;
 var $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0;
 var $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0;
 var $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0;
 var $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0;
 var $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0;
 var $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0;
 var $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0;
 var $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0;
 var $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0;
 var $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0;
 var $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0;
 var $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0;
 var $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0;
 var $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0;
 var $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0;
 var $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0;
 var $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0;
 var $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0;
 var $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0;
 var $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0;
 var $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0;
 var $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0;
 var $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0;
 var $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0;
 var $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0;
 var $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0;
 var $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0;
 var $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0;
 var $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0;
 var $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0;
 var $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0;
 var $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0;
 var $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0;
 var $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0;
 var $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0;
 var $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0;
 var $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0;
 var $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0;
 var $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0;
 var $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0;
 var $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0;
 var $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0;
 var $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0;
 var $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0;
 var $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0;
 var $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0;
 var $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $99 = 0, $cond$i = 0, $cond$i$i = 0, $cond$i203 = 0, $not$$i = 0, $or$cond$i = 0, $or$cond$i199 = 0, $or$cond1$i = 0, $or$cond1$i197 = 0, $or$cond11$i = 0, $or$cond2$i = 0;
 var $or$cond5$i = 0, $or$cond50$i = 0, $or$cond51$i = 0, $or$cond6$i = 0, $or$cond7$i = 0, $or$cond8$i = 0, $or$cond8$not$i = 0, $spec$select$i = 0, $spec$select$i201 = 0, $spec$select1$i = 0, $spec$select2$i = 0, $spec$select4$i = 0, $spec$select49$i = 0, $spec$select9$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abortStackOverflow(16|0);
 $1 = sp;
 $2 = ($0>>>0)<(245);
 do {
  if ($2) {
   $3 = ($0>>>0)<(11);
   $4 = (($0) + 11)|0;
   $5 = $4 & -8;
   $6 = $3 ? 16 : $5;
   $7 = $6 >>> 3;
   $8 = HEAP32[452]|0;
   $9 = $8 >>> $7;
   $10 = $9 & 3;
   $11 = ($10|0)==(0);
   if (!($11)) {
    $12 = $9 & 1;
    $13 = $12 ^ 1;
    $14 = (($13) + ($7))|0;
    $15 = $14 << 1;
    $16 = (1848 + ($15<<2)|0);
    $17 = ((($16)) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ((($18)) + 8|0);
    $20 = HEAP32[$19>>2]|0;
    $21 = ($20|0)==($16|0);
    if ($21) {
     $22 = 1 << $14;
     $23 = $22 ^ -1;
     $24 = $8 & $23;
     HEAP32[452] = $24;
    } else {
     $25 = ((($20)) + 12|0);
     HEAP32[$25>>2] = $16;
     HEAP32[$17>>2] = $20;
    }
    $26 = $14 << 3;
    $27 = $26 | 3;
    $28 = ((($18)) + 4|0);
    HEAP32[$28>>2] = $27;
    $29 = (($18) + ($26)|0);
    $30 = ((($29)) + 4|0);
    $31 = HEAP32[$30>>2]|0;
    $32 = $31 | 1;
    HEAP32[$30>>2] = $32;
    $$0 = $19;
    STACKTOP = sp;return ($$0|0);
   }
   $33 = HEAP32[(1816)>>2]|0;
   $34 = ($6>>>0)>($33>>>0);
   if ($34) {
    $35 = ($9|0)==(0);
    if (!($35)) {
     $36 = $9 << $7;
     $37 = 2 << $7;
     $38 = (0 - ($37))|0;
     $39 = $37 | $38;
     $40 = $36 & $39;
     $41 = (0 - ($40))|0;
     $42 = $40 & $41;
     $43 = (($42) + -1)|0;
     $44 = $43 >>> 12;
     $45 = $44 & 16;
     $46 = $43 >>> $45;
     $47 = $46 >>> 5;
     $48 = $47 & 8;
     $49 = $48 | $45;
     $50 = $46 >>> $48;
     $51 = $50 >>> 2;
     $52 = $51 & 4;
     $53 = $49 | $52;
     $54 = $50 >>> $52;
     $55 = $54 >>> 1;
     $56 = $55 & 2;
     $57 = $53 | $56;
     $58 = $54 >>> $56;
     $59 = $58 >>> 1;
     $60 = $59 & 1;
     $61 = $57 | $60;
     $62 = $58 >>> $60;
     $63 = (($61) + ($62))|0;
     $64 = $63 << 1;
     $65 = (1848 + ($64<<2)|0);
     $66 = ((($65)) + 8|0);
     $67 = HEAP32[$66>>2]|0;
     $68 = ((($67)) + 8|0);
     $69 = HEAP32[$68>>2]|0;
     $70 = ($69|0)==($65|0);
     if ($70) {
      $71 = 1 << $63;
      $72 = $71 ^ -1;
      $73 = $8 & $72;
      HEAP32[452] = $73;
      $90 = $73;
     } else {
      $74 = ((($69)) + 12|0);
      HEAP32[$74>>2] = $65;
      HEAP32[$66>>2] = $69;
      $90 = $8;
     }
     $75 = $63 << 3;
     $76 = (($75) - ($6))|0;
     $77 = $6 | 3;
     $78 = ((($67)) + 4|0);
     HEAP32[$78>>2] = $77;
     $79 = (($67) + ($6)|0);
     $80 = $76 | 1;
     $81 = ((($79)) + 4|0);
     HEAP32[$81>>2] = $80;
     $82 = (($67) + ($75)|0);
     HEAP32[$82>>2] = $76;
     $83 = ($33|0)==(0);
     if (!($83)) {
      $84 = HEAP32[(1828)>>2]|0;
      $85 = $33 >>> 3;
      $86 = $85 << 1;
      $87 = (1848 + ($86<<2)|0);
      $88 = 1 << $85;
      $89 = $90 & $88;
      $91 = ($89|0)==(0);
      if ($91) {
       $92 = $90 | $88;
       HEAP32[452] = $92;
       $$pre = ((($87)) + 8|0);
       $$0194 = $87;$$pre$phiZ2D = $$pre;
      } else {
       $93 = ((($87)) + 8|0);
       $94 = HEAP32[$93>>2]|0;
       $$0194 = $94;$$pre$phiZ2D = $93;
      }
      HEAP32[$$pre$phiZ2D>>2] = $84;
      $95 = ((($$0194)) + 12|0);
      HEAP32[$95>>2] = $84;
      $96 = ((($84)) + 8|0);
      HEAP32[$96>>2] = $$0194;
      $97 = ((($84)) + 12|0);
      HEAP32[$97>>2] = $87;
     }
     HEAP32[(1816)>>2] = $76;
     HEAP32[(1828)>>2] = $79;
     $$0 = $68;
     STACKTOP = sp;return ($$0|0);
    }
    $98 = HEAP32[(1812)>>2]|0;
    $99 = ($98|0)==(0);
    if ($99) {
     $$0192 = $6;
    } else {
     $100 = (0 - ($98))|0;
     $101 = $98 & $100;
     $102 = (($101) + -1)|0;
     $103 = $102 >>> 12;
     $104 = $103 & 16;
     $105 = $102 >>> $104;
     $106 = $105 >>> 5;
     $107 = $106 & 8;
     $108 = $107 | $104;
     $109 = $105 >>> $107;
     $110 = $109 >>> 2;
     $111 = $110 & 4;
     $112 = $108 | $111;
     $113 = $109 >>> $111;
     $114 = $113 >>> 1;
     $115 = $114 & 2;
     $116 = $112 | $115;
     $117 = $113 >>> $115;
     $118 = $117 >>> 1;
     $119 = $118 & 1;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = (($120) + ($121))|0;
     $123 = (2112 + ($122<<2)|0);
     $124 = HEAP32[$123>>2]|0;
     $125 = ((($124)) + 4|0);
     $126 = HEAP32[$125>>2]|0;
     $127 = $126 & -8;
     $128 = (($127) - ($6))|0;
     $$0169$i = $124;$$0170$i = $124;$$0171$i = $128;
     while(1) {
      $129 = ((($$0169$i)) + 16|0);
      $130 = HEAP32[$129>>2]|0;
      $131 = ($130|0)==(0|0);
      if ($131) {
       $132 = ((($$0169$i)) + 20|0);
       $133 = HEAP32[$132>>2]|0;
       $134 = ($133|0)==(0|0);
       if ($134) {
        break;
       } else {
        $136 = $133;
       }
      } else {
       $136 = $130;
      }
      $135 = ((($136)) + 4|0);
      $137 = HEAP32[$135>>2]|0;
      $138 = $137 & -8;
      $139 = (($138) - ($6))|0;
      $140 = ($139>>>0)<($$0171$i>>>0);
      $spec$select$i = $140 ? $139 : $$0171$i;
      $spec$select1$i = $140 ? $136 : $$0170$i;
      $$0169$i = $136;$$0170$i = $spec$select1$i;$$0171$i = $spec$select$i;
     }
     $141 = (($$0170$i) + ($6)|0);
     $142 = ($141>>>0)>($$0170$i>>>0);
     if ($142) {
      $143 = ((($$0170$i)) + 24|0);
      $144 = HEAP32[$143>>2]|0;
      $145 = ((($$0170$i)) + 12|0);
      $146 = HEAP32[$145>>2]|0;
      $147 = ($146|0)==($$0170$i|0);
      do {
       if ($147) {
        $152 = ((($$0170$i)) + 20|0);
        $153 = HEAP32[$152>>2]|0;
        $154 = ($153|0)==(0|0);
        if ($154) {
         $155 = ((($$0170$i)) + 16|0);
         $156 = HEAP32[$155>>2]|0;
         $157 = ($156|0)==(0|0);
         if ($157) {
          $$3$i = 0;
          break;
         } else {
          $$1174$i$ph = $156;$$1176$i$ph = $155;
         }
        } else {
         $$1174$i$ph = $153;$$1176$i$ph = $152;
        }
        $$1174$i = $$1174$i$ph;$$1176$i = $$1176$i$ph;
        while(1) {
         $158 = ((($$1174$i)) + 20|0);
         $159 = HEAP32[$158>>2]|0;
         $160 = ($159|0)==(0|0);
         if ($160) {
          $161 = ((($$1174$i)) + 16|0);
          $162 = HEAP32[$161>>2]|0;
          $163 = ($162|0)==(0|0);
          if ($163) {
           break;
          } else {
           $$1174$i$be = $162;$$1176$i$be = $161;
          }
         } else {
          $$1174$i$be = $159;$$1176$i$be = $158;
         }
         $$1174$i = $$1174$i$be;$$1176$i = $$1176$i$be;
        }
        HEAP32[$$1176$i>>2] = 0;
        $$3$i = $$1174$i;
       } else {
        $148 = ((($$0170$i)) + 8|0);
        $149 = HEAP32[$148>>2]|0;
        $150 = ((($149)) + 12|0);
        HEAP32[$150>>2] = $146;
        $151 = ((($146)) + 8|0);
        HEAP32[$151>>2] = $149;
        $$3$i = $146;
       }
      } while(0);
      $164 = ($144|0)==(0|0);
      do {
       if (!($164)) {
        $165 = ((($$0170$i)) + 28|0);
        $166 = HEAP32[$165>>2]|0;
        $167 = (2112 + ($166<<2)|0);
        $168 = HEAP32[$167>>2]|0;
        $169 = ($$0170$i|0)==($168|0);
        if ($169) {
         HEAP32[$167>>2] = $$3$i;
         $cond$i = ($$3$i|0)==(0|0);
         if ($cond$i) {
          $170 = 1 << $166;
          $171 = $170 ^ -1;
          $172 = $98 & $171;
          HEAP32[(1812)>>2] = $172;
          break;
         }
        } else {
         $173 = ((($144)) + 16|0);
         $174 = HEAP32[$173>>2]|0;
         $175 = ($174|0)==($$0170$i|0);
         $176 = ((($144)) + 20|0);
         $$sink = $175 ? $173 : $176;
         HEAP32[$$sink>>2] = $$3$i;
         $177 = ($$3$i|0)==(0|0);
         if ($177) {
          break;
         }
        }
        $178 = ((($$3$i)) + 24|0);
        HEAP32[$178>>2] = $144;
        $179 = ((($$0170$i)) + 16|0);
        $180 = HEAP32[$179>>2]|0;
        $181 = ($180|0)==(0|0);
        if (!($181)) {
         $182 = ((($$3$i)) + 16|0);
         HEAP32[$182>>2] = $180;
         $183 = ((($180)) + 24|0);
         HEAP32[$183>>2] = $$3$i;
        }
        $184 = ((($$0170$i)) + 20|0);
        $185 = HEAP32[$184>>2]|0;
        $186 = ($185|0)==(0|0);
        if (!($186)) {
         $187 = ((($$3$i)) + 20|0);
         HEAP32[$187>>2] = $185;
         $188 = ((($185)) + 24|0);
         HEAP32[$188>>2] = $$3$i;
        }
       }
      } while(0);
      $189 = ($$0171$i>>>0)<(16);
      if ($189) {
       $190 = (($$0171$i) + ($6))|0;
       $191 = $190 | 3;
       $192 = ((($$0170$i)) + 4|0);
       HEAP32[$192>>2] = $191;
       $193 = (($$0170$i) + ($190)|0);
       $194 = ((($193)) + 4|0);
       $195 = HEAP32[$194>>2]|0;
       $196 = $195 | 1;
       HEAP32[$194>>2] = $196;
      } else {
       $197 = $6 | 3;
       $198 = ((($$0170$i)) + 4|0);
       HEAP32[$198>>2] = $197;
       $199 = $$0171$i | 1;
       $200 = ((($141)) + 4|0);
       HEAP32[$200>>2] = $199;
       $201 = (($141) + ($$0171$i)|0);
       HEAP32[$201>>2] = $$0171$i;
       $202 = ($33|0)==(0);
       if (!($202)) {
        $203 = HEAP32[(1828)>>2]|0;
        $204 = $33 >>> 3;
        $205 = $204 << 1;
        $206 = (1848 + ($205<<2)|0);
        $207 = 1 << $204;
        $208 = $207 & $8;
        $209 = ($208|0)==(0);
        if ($209) {
         $210 = $207 | $8;
         HEAP32[452] = $210;
         $$pre$i = ((($206)) + 8|0);
         $$0$i = $206;$$pre$phi$iZ2D = $$pre$i;
        } else {
         $211 = ((($206)) + 8|0);
         $212 = HEAP32[$211>>2]|0;
         $$0$i = $212;$$pre$phi$iZ2D = $211;
        }
        HEAP32[$$pre$phi$iZ2D>>2] = $203;
        $213 = ((($$0$i)) + 12|0);
        HEAP32[$213>>2] = $203;
        $214 = ((($203)) + 8|0);
        HEAP32[$214>>2] = $$0$i;
        $215 = ((($203)) + 12|0);
        HEAP32[$215>>2] = $206;
       }
       HEAP32[(1816)>>2] = $$0171$i;
       HEAP32[(1828)>>2] = $141;
      }
      $216 = ((($$0170$i)) + 8|0);
      $$0 = $216;
      STACKTOP = sp;return ($$0|0);
     } else {
      $$0192 = $6;
     }
    }
   } else {
    $$0192 = $6;
   }
  } else {
   $217 = ($0>>>0)>(4294967231);
   if ($217) {
    $$0192 = -1;
   } else {
    $218 = (($0) + 11)|0;
    $219 = $218 & -8;
    $220 = HEAP32[(1812)>>2]|0;
    $221 = ($220|0)==(0);
    if ($221) {
     $$0192 = $219;
    } else {
     $222 = (0 - ($219))|0;
     $223 = $218 >>> 8;
     $224 = ($223|0)==(0);
     if ($224) {
      $$0335$i = 0;
     } else {
      $225 = ($219>>>0)>(16777215);
      if ($225) {
       $$0335$i = 31;
      } else {
       $226 = (($223) + 1048320)|0;
       $227 = $226 >>> 16;
       $228 = $227 & 8;
       $229 = $223 << $228;
       $230 = (($229) + 520192)|0;
       $231 = $230 >>> 16;
       $232 = $231 & 4;
       $233 = $232 | $228;
       $234 = $229 << $232;
       $235 = (($234) + 245760)|0;
       $236 = $235 >>> 16;
       $237 = $236 & 2;
       $238 = $233 | $237;
       $239 = (14 - ($238))|0;
       $240 = $234 << $237;
       $241 = $240 >>> 15;
       $242 = (($239) + ($241))|0;
       $243 = $242 << 1;
       $244 = (($242) + 7)|0;
       $245 = $219 >>> $244;
       $246 = $245 & 1;
       $247 = $246 | $243;
       $$0335$i = $247;
      }
     }
     $248 = (2112 + ($$0335$i<<2)|0);
     $249 = HEAP32[$248>>2]|0;
     $250 = ($249|0)==(0|0);
     L79: do {
      if ($250) {
       $$2331$i = 0;$$3$i198 = 0;$$3326$i = $222;
       label = 61;
      } else {
       $251 = ($$0335$i|0)==(31);
       $252 = $$0335$i >>> 1;
       $253 = (25 - ($252))|0;
       $254 = $251 ? 0 : $253;
       $255 = $219 << $254;
       $$0318$i = 0;$$0323$i = $222;$$0329$i = $249;$$0336$i = $255;$$0339$i = 0;
       while(1) {
        $256 = ((($$0329$i)) + 4|0);
        $257 = HEAP32[$256>>2]|0;
        $258 = $257 & -8;
        $259 = (($258) - ($219))|0;
        $260 = ($259>>>0)<($$0323$i>>>0);
        if ($260) {
         $261 = ($259|0)==(0);
         if ($261) {
          $$415$i$ph = $$0329$i;$$432714$i$ph = 0;$$533413$i$ph = $$0329$i;
          label = 65;
          break L79;
         } else {
          $$1319$i = $$0329$i;$$1324$i = $259;
         }
        } else {
         $$1319$i = $$0318$i;$$1324$i = $$0323$i;
        }
        $262 = ((($$0329$i)) + 20|0);
        $263 = HEAP32[$262>>2]|0;
        $264 = $$0336$i >>> 31;
        $265 = (((($$0329$i)) + 16|0) + ($264<<2)|0);
        $266 = HEAP32[$265>>2]|0;
        $267 = ($263|0)==(0|0);
        $268 = ($263|0)==($266|0);
        $or$cond1$i197 = $267 | $268;
        $$1340$i = $or$cond1$i197 ? $$0339$i : $263;
        $269 = ($266|0)==(0|0);
        $spec$select4$i = $$0336$i << 1;
        if ($269) {
         $$2331$i = $$1340$i;$$3$i198 = $$1319$i;$$3326$i = $$1324$i;
         label = 61;
         break;
        } else {
         $$0318$i = $$1319$i;$$0323$i = $$1324$i;$$0329$i = $266;$$0336$i = $spec$select4$i;$$0339$i = $$1340$i;
        }
       }
      }
     } while(0);
     if ((label|0) == 61) {
      $270 = ($$2331$i|0)==(0|0);
      $271 = ($$3$i198|0)==(0|0);
      $or$cond$i199 = $270 & $271;
      if ($or$cond$i199) {
       $272 = 2 << $$0335$i;
       $273 = (0 - ($272))|0;
       $274 = $272 | $273;
       $275 = $274 & $220;
       $276 = ($275|0)==(0);
       if ($276) {
        $$0192 = $219;
        break;
       }
       $277 = (0 - ($275))|0;
       $278 = $275 & $277;
       $279 = (($278) + -1)|0;
       $280 = $279 >>> 12;
       $281 = $280 & 16;
       $282 = $279 >>> $281;
       $283 = $282 >>> 5;
       $284 = $283 & 8;
       $285 = $284 | $281;
       $286 = $282 >>> $284;
       $287 = $286 >>> 2;
       $288 = $287 & 4;
       $289 = $285 | $288;
       $290 = $286 >>> $288;
       $291 = $290 >>> 1;
       $292 = $291 & 2;
       $293 = $289 | $292;
       $294 = $290 >>> $292;
       $295 = $294 >>> 1;
       $296 = $295 & 1;
       $297 = $293 | $296;
       $298 = $294 >>> $296;
       $299 = (($297) + ($298))|0;
       $300 = (2112 + ($299<<2)|0);
       $301 = HEAP32[$300>>2]|0;
       $$3$i198211 = 0;$$4333$i = $301;
      } else {
       $$3$i198211 = $$3$i198;$$4333$i = $$2331$i;
      }
      $302 = ($$4333$i|0)==(0|0);
      if ($302) {
       $$4$lcssa$i = $$3$i198211;$$4327$lcssa$i = $$3326$i;
      } else {
       $$415$i$ph = $$3$i198211;$$432714$i$ph = $$3326$i;$$533413$i$ph = $$4333$i;
       label = 65;
      }
     }
     if ((label|0) == 65) {
      $$415$i = $$415$i$ph;$$432714$i = $$432714$i$ph;$$533413$i = $$533413$i$ph;
      while(1) {
       $303 = ((($$533413$i)) + 4|0);
       $304 = HEAP32[$303>>2]|0;
       $305 = $304 & -8;
       $306 = (($305) - ($219))|0;
       $307 = ($306>>>0)<($$432714$i>>>0);
       $spec$select$i201 = $307 ? $306 : $$432714$i;
       $spec$select2$i = $307 ? $$533413$i : $$415$i;
       $308 = ((($$533413$i)) + 16|0);
       $309 = HEAP32[$308>>2]|0;
       $310 = ($309|0)==(0|0);
       if ($310) {
        $311 = ((($$533413$i)) + 20|0);
        $312 = HEAP32[$311>>2]|0;
        $313 = $312;
       } else {
        $313 = $309;
       }
       $314 = ($313|0)==(0|0);
       if ($314) {
        $$4$lcssa$i = $spec$select2$i;$$4327$lcssa$i = $spec$select$i201;
        break;
       } else {
        $$415$i = $spec$select2$i;$$432714$i = $spec$select$i201;$$533413$i = $313;
       }
      }
     }
     $315 = ($$4$lcssa$i|0)==(0|0);
     if ($315) {
      $$0192 = $219;
     } else {
      $316 = HEAP32[(1816)>>2]|0;
      $317 = (($316) - ($219))|0;
      $318 = ($$4327$lcssa$i>>>0)<($317>>>0);
      if ($318) {
       $319 = (($$4$lcssa$i) + ($219)|0);
       $320 = ($319>>>0)>($$4$lcssa$i>>>0);
       if ($320) {
        $321 = ((($$4$lcssa$i)) + 24|0);
        $322 = HEAP32[$321>>2]|0;
        $323 = ((($$4$lcssa$i)) + 12|0);
        $324 = HEAP32[$323>>2]|0;
        $325 = ($324|0)==($$4$lcssa$i|0);
        do {
         if ($325) {
          $330 = ((($$4$lcssa$i)) + 20|0);
          $331 = HEAP32[$330>>2]|0;
          $332 = ($331|0)==(0|0);
          if ($332) {
           $333 = ((($$4$lcssa$i)) + 16|0);
           $334 = HEAP32[$333>>2]|0;
           $335 = ($334|0)==(0|0);
           if ($335) {
            $$3348$i = 0;
            break;
           } else {
            $$1346$i$ph = $334;$$1350$i$ph = $333;
           }
          } else {
           $$1346$i$ph = $331;$$1350$i$ph = $330;
          }
          $$1346$i = $$1346$i$ph;$$1350$i = $$1350$i$ph;
          while(1) {
           $336 = ((($$1346$i)) + 20|0);
           $337 = HEAP32[$336>>2]|0;
           $338 = ($337|0)==(0|0);
           if ($338) {
            $339 = ((($$1346$i)) + 16|0);
            $340 = HEAP32[$339>>2]|0;
            $341 = ($340|0)==(0|0);
            if ($341) {
             break;
            } else {
             $$1346$i$be = $340;$$1350$i$be = $339;
            }
           } else {
            $$1346$i$be = $337;$$1350$i$be = $336;
           }
           $$1346$i = $$1346$i$be;$$1350$i = $$1350$i$be;
          }
          HEAP32[$$1350$i>>2] = 0;
          $$3348$i = $$1346$i;
         } else {
          $326 = ((($$4$lcssa$i)) + 8|0);
          $327 = HEAP32[$326>>2]|0;
          $328 = ((($327)) + 12|0);
          HEAP32[$328>>2] = $324;
          $329 = ((($324)) + 8|0);
          HEAP32[$329>>2] = $327;
          $$3348$i = $324;
         }
        } while(0);
        $342 = ($322|0)==(0|0);
        do {
         if ($342) {
          $425 = $220;
         } else {
          $343 = ((($$4$lcssa$i)) + 28|0);
          $344 = HEAP32[$343>>2]|0;
          $345 = (2112 + ($344<<2)|0);
          $346 = HEAP32[$345>>2]|0;
          $347 = ($$4$lcssa$i|0)==($346|0);
          if ($347) {
           HEAP32[$345>>2] = $$3348$i;
           $cond$i203 = ($$3348$i|0)==(0|0);
           if ($cond$i203) {
            $348 = 1 << $344;
            $349 = $348 ^ -1;
            $350 = $220 & $349;
            HEAP32[(1812)>>2] = $350;
            $425 = $350;
            break;
           }
          } else {
           $351 = ((($322)) + 16|0);
           $352 = HEAP32[$351>>2]|0;
           $353 = ($352|0)==($$4$lcssa$i|0);
           $354 = ((($322)) + 20|0);
           $$sink320 = $353 ? $351 : $354;
           HEAP32[$$sink320>>2] = $$3348$i;
           $355 = ($$3348$i|0)==(0|0);
           if ($355) {
            $425 = $220;
            break;
           }
          }
          $356 = ((($$3348$i)) + 24|0);
          HEAP32[$356>>2] = $322;
          $357 = ((($$4$lcssa$i)) + 16|0);
          $358 = HEAP32[$357>>2]|0;
          $359 = ($358|0)==(0|0);
          if (!($359)) {
           $360 = ((($$3348$i)) + 16|0);
           HEAP32[$360>>2] = $358;
           $361 = ((($358)) + 24|0);
           HEAP32[$361>>2] = $$3348$i;
          }
          $362 = ((($$4$lcssa$i)) + 20|0);
          $363 = HEAP32[$362>>2]|0;
          $364 = ($363|0)==(0|0);
          if ($364) {
           $425 = $220;
          } else {
           $365 = ((($$3348$i)) + 20|0);
           HEAP32[$365>>2] = $363;
           $366 = ((($363)) + 24|0);
           HEAP32[$366>>2] = $$3348$i;
           $425 = $220;
          }
         }
        } while(0);
        $367 = ($$4327$lcssa$i>>>0)<(16);
        L128: do {
         if ($367) {
          $368 = (($$4327$lcssa$i) + ($219))|0;
          $369 = $368 | 3;
          $370 = ((($$4$lcssa$i)) + 4|0);
          HEAP32[$370>>2] = $369;
          $371 = (($$4$lcssa$i) + ($368)|0);
          $372 = ((($371)) + 4|0);
          $373 = HEAP32[$372>>2]|0;
          $374 = $373 | 1;
          HEAP32[$372>>2] = $374;
         } else {
          $375 = $219 | 3;
          $376 = ((($$4$lcssa$i)) + 4|0);
          HEAP32[$376>>2] = $375;
          $377 = $$4327$lcssa$i | 1;
          $378 = ((($319)) + 4|0);
          HEAP32[$378>>2] = $377;
          $379 = (($319) + ($$4327$lcssa$i)|0);
          HEAP32[$379>>2] = $$4327$lcssa$i;
          $380 = $$4327$lcssa$i >>> 3;
          $381 = ($$4327$lcssa$i>>>0)<(256);
          if ($381) {
           $382 = $380 << 1;
           $383 = (1848 + ($382<<2)|0);
           $384 = HEAP32[452]|0;
           $385 = 1 << $380;
           $386 = $384 & $385;
           $387 = ($386|0)==(0);
           if ($387) {
            $388 = $384 | $385;
            HEAP32[452] = $388;
            $$pre$i204 = ((($383)) + 8|0);
            $$0344$i = $383;$$pre$phi$i205Z2D = $$pre$i204;
           } else {
            $389 = ((($383)) + 8|0);
            $390 = HEAP32[$389>>2]|0;
            $$0344$i = $390;$$pre$phi$i205Z2D = $389;
           }
           HEAP32[$$pre$phi$i205Z2D>>2] = $319;
           $391 = ((($$0344$i)) + 12|0);
           HEAP32[$391>>2] = $319;
           $392 = ((($319)) + 8|0);
           HEAP32[$392>>2] = $$0344$i;
           $393 = ((($319)) + 12|0);
           HEAP32[$393>>2] = $383;
           break;
          }
          $394 = $$4327$lcssa$i >>> 8;
          $395 = ($394|0)==(0);
          if ($395) {
           $$0338$i = 0;
          } else {
           $396 = ($$4327$lcssa$i>>>0)>(16777215);
           if ($396) {
            $$0338$i = 31;
           } else {
            $397 = (($394) + 1048320)|0;
            $398 = $397 >>> 16;
            $399 = $398 & 8;
            $400 = $394 << $399;
            $401 = (($400) + 520192)|0;
            $402 = $401 >>> 16;
            $403 = $402 & 4;
            $404 = $403 | $399;
            $405 = $400 << $403;
            $406 = (($405) + 245760)|0;
            $407 = $406 >>> 16;
            $408 = $407 & 2;
            $409 = $404 | $408;
            $410 = (14 - ($409))|0;
            $411 = $405 << $408;
            $412 = $411 >>> 15;
            $413 = (($410) + ($412))|0;
            $414 = $413 << 1;
            $415 = (($413) + 7)|0;
            $416 = $$4327$lcssa$i >>> $415;
            $417 = $416 & 1;
            $418 = $417 | $414;
            $$0338$i = $418;
           }
          }
          $419 = (2112 + ($$0338$i<<2)|0);
          $420 = ((($319)) + 28|0);
          HEAP32[$420>>2] = $$0338$i;
          $421 = ((($319)) + 16|0);
          $422 = ((($421)) + 4|0);
          HEAP32[$422>>2] = 0;
          HEAP32[$421>>2] = 0;
          $423 = 1 << $$0338$i;
          $424 = $425 & $423;
          $426 = ($424|0)==(0);
          if ($426) {
           $427 = $425 | $423;
           HEAP32[(1812)>>2] = $427;
           HEAP32[$419>>2] = $319;
           $428 = ((($319)) + 24|0);
           HEAP32[$428>>2] = $419;
           $429 = ((($319)) + 12|0);
           HEAP32[$429>>2] = $319;
           $430 = ((($319)) + 8|0);
           HEAP32[$430>>2] = $319;
           break;
          }
          $431 = HEAP32[$419>>2]|0;
          $432 = ((($431)) + 4|0);
          $433 = HEAP32[$432>>2]|0;
          $434 = $433 & -8;
          $435 = ($434|0)==($$4327$lcssa$i|0);
          L145: do {
           if ($435) {
            $$0321$lcssa$i = $431;
           } else {
            $436 = ($$0338$i|0)==(31);
            $437 = $$0338$i >>> 1;
            $438 = (25 - ($437))|0;
            $439 = $436 ? 0 : $438;
            $440 = $$4327$lcssa$i << $439;
            $$032012$i = $440;$$032111$i = $431;
            while(1) {
             $447 = $$032012$i >>> 31;
             $448 = (((($$032111$i)) + 16|0) + ($447<<2)|0);
             $443 = HEAP32[$448>>2]|0;
             $449 = ($443|0)==(0|0);
             if ($449) {
              break;
             }
             $441 = $$032012$i << 1;
             $442 = ((($443)) + 4|0);
             $444 = HEAP32[$442>>2]|0;
             $445 = $444 & -8;
             $446 = ($445|0)==($$4327$lcssa$i|0);
             if ($446) {
              $$0321$lcssa$i = $443;
              break L145;
             } else {
              $$032012$i = $441;$$032111$i = $443;
             }
            }
            HEAP32[$448>>2] = $319;
            $450 = ((($319)) + 24|0);
            HEAP32[$450>>2] = $$032111$i;
            $451 = ((($319)) + 12|0);
            HEAP32[$451>>2] = $319;
            $452 = ((($319)) + 8|0);
            HEAP32[$452>>2] = $319;
            break L128;
           }
          } while(0);
          $453 = ((($$0321$lcssa$i)) + 8|0);
          $454 = HEAP32[$453>>2]|0;
          $455 = ((($454)) + 12|0);
          HEAP32[$455>>2] = $319;
          HEAP32[$453>>2] = $319;
          $456 = ((($319)) + 8|0);
          HEAP32[$456>>2] = $454;
          $457 = ((($319)) + 12|0);
          HEAP32[$457>>2] = $$0321$lcssa$i;
          $458 = ((($319)) + 24|0);
          HEAP32[$458>>2] = 0;
         }
        } while(0);
        $459 = ((($$4$lcssa$i)) + 8|0);
        $$0 = $459;
        STACKTOP = sp;return ($$0|0);
       } else {
        $$0192 = $219;
       }
      } else {
       $$0192 = $219;
      }
     }
    }
   }
  }
 } while(0);
 $460 = HEAP32[(1816)>>2]|0;
 $461 = ($460>>>0)<($$0192>>>0);
 if (!($461)) {
  $462 = (($460) - ($$0192))|0;
  $463 = HEAP32[(1828)>>2]|0;
  $464 = ($462>>>0)>(15);
  if ($464) {
   $465 = (($463) + ($$0192)|0);
   HEAP32[(1828)>>2] = $465;
   HEAP32[(1816)>>2] = $462;
   $466 = $462 | 1;
   $467 = ((($465)) + 4|0);
   HEAP32[$467>>2] = $466;
   $468 = (($463) + ($460)|0);
   HEAP32[$468>>2] = $462;
   $469 = $$0192 | 3;
   $470 = ((($463)) + 4|0);
   HEAP32[$470>>2] = $469;
  } else {
   HEAP32[(1816)>>2] = 0;
   HEAP32[(1828)>>2] = 0;
   $471 = $460 | 3;
   $472 = ((($463)) + 4|0);
   HEAP32[$472>>2] = $471;
   $473 = (($463) + ($460)|0);
   $474 = ((($473)) + 4|0);
   $475 = HEAP32[$474>>2]|0;
   $476 = $475 | 1;
   HEAP32[$474>>2] = $476;
  }
  $477 = ((($463)) + 8|0);
  $$0 = $477;
  STACKTOP = sp;return ($$0|0);
 }
 $478 = HEAP32[(1820)>>2]|0;
 $479 = ($478>>>0)>($$0192>>>0);
 if ($479) {
  $480 = (($478) - ($$0192))|0;
  HEAP32[(1820)>>2] = $480;
  $481 = HEAP32[(1832)>>2]|0;
  $482 = (($481) + ($$0192)|0);
  HEAP32[(1832)>>2] = $482;
  $483 = $480 | 1;
  $484 = ((($482)) + 4|0);
  HEAP32[$484>>2] = $483;
  $485 = $$0192 | 3;
  $486 = ((($481)) + 4|0);
  HEAP32[$486>>2] = $485;
  $487 = ((($481)) + 8|0);
  $$0 = $487;
  STACKTOP = sp;return ($$0|0);
 }
 $488 = HEAP32[570]|0;
 $489 = ($488|0)==(0);
 if ($489) {
  HEAP32[(2288)>>2] = 4096;
  HEAP32[(2284)>>2] = 4096;
  HEAP32[(2292)>>2] = -1;
  HEAP32[(2296)>>2] = -1;
  HEAP32[(2300)>>2] = 0;
  HEAP32[(2252)>>2] = 0;
  $490 = $1;
  $491 = $490 & -16;
  $492 = $491 ^ 1431655768;
  HEAP32[570] = $492;
  $496 = 4096;
 } else {
  $$pre$i195 = HEAP32[(2288)>>2]|0;
  $496 = $$pre$i195;
 }
 $493 = (($$0192) + 48)|0;
 $494 = (($$0192) + 47)|0;
 $495 = (($496) + ($494))|0;
 $497 = (0 - ($496))|0;
 $498 = $495 & $497;
 $499 = ($498>>>0)>($$0192>>>0);
 if (!($499)) {
  $$0 = 0;
  STACKTOP = sp;return ($$0|0);
 }
 $500 = HEAP32[(2248)>>2]|0;
 $501 = ($500|0)==(0);
 if (!($501)) {
  $502 = HEAP32[(2240)>>2]|0;
  $503 = (($502) + ($498))|0;
  $504 = ($503>>>0)<=($502>>>0);
  $505 = ($503>>>0)>($500>>>0);
  $or$cond1$i = $504 | $505;
  if ($or$cond1$i) {
   $$0 = 0;
   STACKTOP = sp;return ($$0|0);
  }
 }
 $506 = HEAP32[(2252)>>2]|0;
 $507 = $506 & 4;
 $508 = ($507|0)==(0);
 L178: do {
  if ($508) {
   $509 = HEAP32[(1832)>>2]|0;
   $510 = ($509|0)==(0|0);
   L180: do {
    if ($510) {
     label = 128;
    } else {
     $$0$i20$i = (2256);
     while(1) {
      $511 = HEAP32[$$0$i20$i>>2]|0;
      $512 = ($511>>>0)>($509>>>0);
      if (!($512)) {
       $513 = ((($$0$i20$i)) + 4|0);
       $514 = HEAP32[$513>>2]|0;
       $515 = (($511) + ($514)|0);
       $516 = ($515>>>0)>($509>>>0);
       if ($516) {
        break;
       }
      }
      $517 = ((($$0$i20$i)) + 8|0);
      $518 = HEAP32[$517>>2]|0;
      $519 = ($518|0)==(0|0);
      if ($519) {
       label = 128;
       break L180;
      } else {
       $$0$i20$i = $518;
      }
     }
     $542 = (($495) - ($478))|0;
     $543 = $542 & $497;
     $544 = ($543>>>0)<(2147483647);
     if ($544) {
      $545 = ((($$0$i20$i)) + 4|0);
      $546 = (_sbrk(($543|0))|0);
      $547 = HEAP32[$$0$i20$i>>2]|0;
      $548 = HEAP32[$545>>2]|0;
      $549 = (($547) + ($548)|0);
      $550 = ($546|0)==($549|0);
      if ($550) {
       $551 = ($546|0)==((-1)|0);
       if ($551) {
        $$2234243136$i = $543;
       } else {
        $$723947$i = $543;$$748$i = $546;
        label = 145;
        break L178;
       }
      } else {
       $$2247$ph$i = $546;$$2253$ph$i = $543;
       label = 136;
      }
     } else {
      $$2234243136$i = 0;
     }
    }
   } while(0);
   do {
    if ((label|0) == 128) {
     $520 = (_sbrk(0)|0);
     $521 = ($520|0)==((-1)|0);
     if ($521) {
      $$2234243136$i = 0;
     } else {
      $522 = $520;
      $523 = HEAP32[(2284)>>2]|0;
      $524 = (($523) + -1)|0;
      $525 = $524 & $522;
      $526 = ($525|0)==(0);
      $527 = (($524) + ($522))|0;
      $528 = (0 - ($523))|0;
      $529 = $527 & $528;
      $530 = (($529) - ($522))|0;
      $531 = $526 ? 0 : $530;
      $spec$select49$i = (($531) + ($498))|0;
      $532 = HEAP32[(2240)>>2]|0;
      $533 = (($spec$select49$i) + ($532))|0;
      $534 = ($spec$select49$i>>>0)>($$0192>>>0);
      $535 = ($spec$select49$i>>>0)<(2147483647);
      $or$cond$i = $534 & $535;
      if ($or$cond$i) {
       $536 = HEAP32[(2248)>>2]|0;
       $537 = ($536|0)==(0);
       if (!($537)) {
        $538 = ($533>>>0)<=($532>>>0);
        $539 = ($533>>>0)>($536>>>0);
        $or$cond2$i = $538 | $539;
        if ($or$cond2$i) {
         $$2234243136$i = 0;
         break;
        }
       }
       $540 = (_sbrk(($spec$select49$i|0))|0);
       $541 = ($540|0)==($520|0);
       if ($541) {
        $$723947$i = $spec$select49$i;$$748$i = $520;
        label = 145;
        break L178;
       } else {
        $$2247$ph$i = $540;$$2253$ph$i = $spec$select49$i;
        label = 136;
       }
      } else {
       $$2234243136$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 136) {
     $552 = (0 - ($$2253$ph$i))|0;
     $553 = ($$2247$ph$i|0)!=((-1)|0);
     $554 = ($$2253$ph$i>>>0)<(2147483647);
     $or$cond7$i = $554 & $553;
     $555 = ($493>>>0)>($$2253$ph$i>>>0);
     $or$cond6$i = $555 & $or$cond7$i;
     if (!($or$cond6$i)) {
      $565 = ($$2247$ph$i|0)==((-1)|0);
      if ($565) {
       $$2234243136$i = 0;
       break;
      } else {
       $$723947$i = $$2253$ph$i;$$748$i = $$2247$ph$i;
       label = 145;
       break L178;
      }
     }
     $556 = HEAP32[(2288)>>2]|0;
     $557 = (($494) - ($$2253$ph$i))|0;
     $558 = (($557) + ($556))|0;
     $559 = (0 - ($556))|0;
     $560 = $558 & $559;
     $561 = ($560>>>0)<(2147483647);
     if (!($561)) {
      $$723947$i = $$2253$ph$i;$$748$i = $$2247$ph$i;
      label = 145;
      break L178;
     }
     $562 = (_sbrk(($560|0))|0);
     $563 = ($562|0)==((-1)|0);
     if ($563) {
      (_sbrk(($552|0))|0);
      $$2234243136$i = 0;
      break;
     } else {
      $564 = (($560) + ($$2253$ph$i))|0;
      $$723947$i = $564;$$748$i = $$2247$ph$i;
      label = 145;
      break L178;
     }
    }
   } while(0);
   $566 = HEAP32[(2252)>>2]|0;
   $567 = $566 | 4;
   HEAP32[(2252)>>2] = $567;
   $$4236$i = $$2234243136$i;
   label = 143;
  } else {
   $$4236$i = 0;
   label = 143;
  }
 } while(0);
 if ((label|0) == 143) {
  $568 = ($498>>>0)<(2147483647);
  if ($568) {
   $569 = (_sbrk(($498|0))|0);
   $570 = (_sbrk(0)|0);
   $571 = ($569|0)!=((-1)|0);
   $572 = ($570|0)!=((-1)|0);
   $or$cond5$i = $571 & $572;
   $573 = ($569>>>0)<($570>>>0);
   $or$cond8$i = $573 & $or$cond5$i;
   $574 = $570;
   $575 = $569;
   $576 = (($574) - ($575))|0;
   $577 = (($$0192) + 40)|0;
   $578 = ($576>>>0)>($577>>>0);
   $spec$select9$i = $578 ? $576 : $$4236$i;
   $or$cond8$not$i = $or$cond8$i ^ 1;
   $579 = ($569|0)==((-1)|0);
   $not$$i = $578 ^ 1;
   $580 = $579 | $not$$i;
   $or$cond50$i = $580 | $or$cond8$not$i;
   if (!($or$cond50$i)) {
    $$723947$i = $spec$select9$i;$$748$i = $569;
    label = 145;
   }
  }
 }
 if ((label|0) == 145) {
  $581 = HEAP32[(2240)>>2]|0;
  $582 = (($581) + ($$723947$i))|0;
  HEAP32[(2240)>>2] = $582;
  $583 = HEAP32[(2244)>>2]|0;
  $584 = ($582>>>0)>($583>>>0);
  if ($584) {
   HEAP32[(2244)>>2] = $582;
  }
  $585 = HEAP32[(1832)>>2]|0;
  $586 = ($585|0)==(0|0);
  L215: do {
   if ($586) {
    $587 = HEAP32[(1824)>>2]|0;
    $588 = ($587|0)==(0|0);
    $589 = ($$748$i>>>0)<($587>>>0);
    $or$cond11$i = $588 | $589;
    if ($or$cond11$i) {
     HEAP32[(1824)>>2] = $$748$i;
    }
    HEAP32[(2256)>>2] = $$748$i;
    HEAP32[(2260)>>2] = $$723947$i;
    HEAP32[(2268)>>2] = 0;
    $590 = HEAP32[570]|0;
    HEAP32[(1844)>>2] = $590;
    HEAP32[(1840)>>2] = -1;
    HEAP32[(1860)>>2] = (1848);
    HEAP32[(1856)>>2] = (1848);
    HEAP32[(1868)>>2] = (1856);
    HEAP32[(1864)>>2] = (1856);
    HEAP32[(1876)>>2] = (1864);
    HEAP32[(1872)>>2] = (1864);
    HEAP32[(1884)>>2] = (1872);
    HEAP32[(1880)>>2] = (1872);
    HEAP32[(1892)>>2] = (1880);
    HEAP32[(1888)>>2] = (1880);
    HEAP32[(1900)>>2] = (1888);
    HEAP32[(1896)>>2] = (1888);
    HEAP32[(1908)>>2] = (1896);
    HEAP32[(1904)>>2] = (1896);
    HEAP32[(1916)>>2] = (1904);
    HEAP32[(1912)>>2] = (1904);
    HEAP32[(1924)>>2] = (1912);
    HEAP32[(1920)>>2] = (1912);
    HEAP32[(1932)>>2] = (1920);
    HEAP32[(1928)>>2] = (1920);
    HEAP32[(1940)>>2] = (1928);
    HEAP32[(1936)>>2] = (1928);
    HEAP32[(1948)>>2] = (1936);
    HEAP32[(1944)>>2] = (1936);
    HEAP32[(1956)>>2] = (1944);
    HEAP32[(1952)>>2] = (1944);
    HEAP32[(1964)>>2] = (1952);
    HEAP32[(1960)>>2] = (1952);
    HEAP32[(1972)>>2] = (1960);
    HEAP32[(1968)>>2] = (1960);
    HEAP32[(1980)>>2] = (1968);
    HEAP32[(1976)>>2] = (1968);
    HEAP32[(1988)>>2] = (1976);
    HEAP32[(1984)>>2] = (1976);
    HEAP32[(1996)>>2] = (1984);
    HEAP32[(1992)>>2] = (1984);
    HEAP32[(2004)>>2] = (1992);
    HEAP32[(2000)>>2] = (1992);
    HEAP32[(2012)>>2] = (2000);
    HEAP32[(2008)>>2] = (2000);
    HEAP32[(2020)>>2] = (2008);
    HEAP32[(2016)>>2] = (2008);
    HEAP32[(2028)>>2] = (2016);
    HEAP32[(2024)>>2] = (2016);
    HEAP32[(2036)>>2] = (2024);
    HEAP32[(2032)>>2] = (2024);
    HEAP32[(2044)>>2] = (2032);
    HEAP32[(2040)>>2] = (2032);
    HEAP32[(2052)>>2] = (2040);
    HEAP32[(2048)>>2] = (2040);
    HEAP32[(2060)>>2] = (2048);
    HEAP32[(2056)>>2] = (2048);
    HEAP32[(2068)>>2] = (2056);
    HEAP32[(2064)>>2] = (2056);
    HEAP32[(2076)>>2] = (2064);
    HEAP32[(2072)>>2] = (2064);
    HEAP32[(2084)>>2] = (2072);
    HEAP32[(2080)>>2] = (2072);
    HEAP32[(2092)>>2] = (2080);
    HEAP32[(2088)>>2] = (2080);
    HEAP32[(2100)>>2] = (2088);
    HEAP32[(2096)>>2] = (2088);
    HEAP32[(2108)>>2] = (2096);
    HEAP32[(2104)>>2] = (2096);
    $591 = (($$723947$i) + -40)|0;
    $592 = ((($$748$i)) + 8|0);
    $593 = $592;
    $594 = $593 & 7;
    $595 = ($594|0)==(0);
    $596 = (0 - ($593))|0;
    $597 = $596 & 7;
    $598 = $595 ? 0 : $597;
    $599 = (($$748$i) + ($598)|0);
    $600 = (($591) - ($598))|0;
    HEAP32[(1832)>>2] = $599;
    HEAP32[(1820)>>2] = $600;
    $601 = $600 | 1;
    $602 = ((($599)) + 4|0);
    HEAP32[$602>>2] = $601;
    $603 = (($$748$i) + ($591)|0);
    $604 = ((($603)) + 4|0);
    HEAP32[$604>>2] = 40;
    $605 = HEAP32[(2296)>>2]|0;
    HEAP32[(1836)>>2] = $605;
   } else {
    $$024372$i = (2256);
    while(1) {
     $606 = HEAP32[$$024372$i>>2]|0;
     $607 = ((($$024372$i)) + 4|0);
     $608 = HEAP32[$607>>2]|0;
     $609 = (($606) + ($608)|0);
     $610 = ($$748$i|0)==($609|0);
     if ($610) {
      label = 154;
      break;
     }
     $611 = ((($$024372$i)) + 8|0);
     $612 = HEAP32[$611>>2]|0;
     $613 = ($612|0)==(0|0);
     if ($613) {
      break;
     } else {
      $$024372$i = $612;
     }
    }
    if ((label|0) == 154) {
     $614 = ((($$024372$i)) + 4|0);
     $615 = ((($$024372$i)) + 12|0);
     $616 = HEAP32[$615>>2]|0;
     $617 = $616 & 8;
     $618 = ($617|0)==(0);
     if ($618) {
      $619 = ($606>>>0)<=($585>>>0);
      $620 = ($$748$i>>>0)>($585>>>0);
      $or$cond51$i = $620 & $619;
      if ($or$cond51$i) {
       $621 = (($608) + ($$723947$i))|0;
       HEAP32[$614>>2] = $621;
       $622 = HEAP32[(1820)>>2]|0;
       $623 = (($622) + ($$723947$i))|0;
       $624 = ((($585)) + 8|0);
       $625 = $624;
       $626 = $625 & 7;
       $627 = ($626|0)==(0);
       $628 = (0 - ($625))|0;
       $629 = $628 & 7;
       $630 = $627 ? 0 : $629;
       $631 = (($585) + ($630)|0);
       $632 = (($623) - ($630))|0;
       HEAP32[(1832)>>2] = $631;
       HEAP32[(1820)>>2] = $632;
       $633 = $632 | 1;
       $634 = ((($631)) + 4|0);
       HEAP32[$634>>2] = $633;
       $635 = (($585) + ($623)|0);
       $636 = ((($635)) + 4|0);
       HEAP32[$636>>2] = 40;
       $637 = HEAP32[(2296)>>2]|0;
       HEAP32[(1836)>>2] = $637;
       break;
      }
     }
    }
    $638 = HEAP32[(1824)>>2]|0;
    $639 = ($$748$i>>>0)<($638>>>0);
    if ($639) {
     HEAP32[(1824)>>2] = $$748$i;
    }
    $640 = (($$748$i) + ($$723947$i)|0);
    $$124471$i = (2256);
    while(1) {
     $641 = HEAP32[$$124471$i>>2]|0;
     $642 = ($641|0)==($640|0);
     if ($642) {
      label = 162;
      break;
     }
     $643 = ((($$124471$i)) + 8|0);
     $644 = HEAP32[$643>>2]|0;
     $645 = ($644|0)==(0|0);
     if ($645) {
      break;
     } else {
      $$124471$i = $644;
     }
    }
    if ((label|0) == 162) {
     $646 = ((($$124471$i)) + 12|0);
     $647 = HEAP32[$646>>2]|0;
     $648 = $647 & 8;
     $649 = ($648|0)==(0);
     if ($649) {
      HEAP32[$$124471$i>>2] = $$748$i;
      $650 = ((($$124471$i)) + 4|0);
      $651 = HEAP32[$650>>2]|0;
      $652 = (($651) + ($$723947$i))|0;
      HEAP32[$650>>2] = $652;
      $653 = ((($$748$i)) + 8|0);
      $654 = $653;
      $655 = $654 & 7;
      $656 = ($655|0)==(0);
      $657 = (0 - ($654))|0;
      $658 = $657 & 7;
      $659 = $656 ? 0 : $658;
      $660 = (($$748$i) + ($659)|0);
      $661 = ((($640)) + 8|0);
      $662 = $661;
      $663 = $662 & 7;
      $664 = ($663|0)==(0);
      $665 = (0 - ($662))|0;
      $666 = $665 & 7;
      $667 = $664 ? 0 : $666;
      $668 = (($640) + ($667)|0);
      $669 = $668;
      $670 = $660;
      $671 = (($669) - ($670))|0;
      $672 = (($660) + ($$0192)|0);
      $673 = (($671) - ($$0192))|0;
      $674 = $$0192 | 3;
      $675 = ((($660)) + 4|0);
      HEAP32[$675>>2] = $674;
      $676 = ($585|0)==($668|0);
      L238: do {
       if ($676) {
        $677 = HEAP32[(1820)>>2]|0;
        $678 = (($677) + ($673))|0;
        HEAP32[(1820)>>2] = $678;
        HEAP32[(1832)>>2] = $672;
        $679 = $678 | 1;
        $680 = ((($672)) + 4|0);
        HEAP32[$680>>2] = $679;
       } else {
        $681 = HEAP32[(1828)>>2]|0;
        $682 = ($681|0)==($668|0);
        if ($682) {
         $683 = HEAP32[(1816)>>2]|0;
         $684 = (($683) + ($673))|0;
         HEAP32[(1816)>>2] = $684;
         HEAP32[(1828)>>2] = $672;
         $685 = $684 | 1;
         $686 = ((($672)) + 4|0);
         HEAP32[$686>>2] = $685;
         $687 = (($672) + ($684)|0);
         HEAP32[$687>>2] = $684;
         break;
        }
        $688 = ((($668)) + 4|0);
        $689 = HEAP32[$688>>2]|0;
        $690 = $689 & 3;
        $691 = ($690|0)==(1);
        if ($691) {
         $692 = $689 & -8;
         $693 = $689 >>> 3;
         $694 = ($689>>>0)<(256);
         L246: do {
          if ($694) {
           $695 = ((($668)) + 8|0);
           $696 = HEAP32[$695>>2]|0;
           $697 = ((($668)) + 12|0);
           $698 = HEAP32[$697>>2]|0;
           $699 = ($698|0)==($696|0);
           if ($699) {
            $700 = 1 << $693;
            $701 = $700 ^ -1;
            $702 = HEAP32[452]|0;
            $703 = $702 & $701;
            HEAP32[452] = $703;
            break;
           } else {
            $704 = ((($696)) + 12|0);
            HEAP32[$704>>2] = $698;
            $705 = ((($698)) + 8|0);
            HEAP32[$705>>2] = $696;
            break;
           }
          } else {
           $706 = ((($668)) + 24|0);
           $707 = HEAP32[$706>>2]|0;
           $708 = ((($668)) + 12|0);
           $709 = HEAP32[$708>>2]|0;
           $710 = ($709|0)==($668|0);
           do {
            if ($710) {
             $715 = ((($668)) + 16|0);
             $716 = ((($715)) + 4|0);
             $717 = HEAP32[$716>>2]|0;
             $718 = ($717|0)==(0|0);
             if ($718) {
              $719 = HEAP32[$715>>2]|0;
              $720 = ($719|0)==(0|0);
              if ($720) {
               $$3$i$i = 0;
               break;
              } else {
               $$1263$i$i$ph = $719;$$1265$i$i$ph = $715;
              }
             } else {
              $$1263$i$i$ph = $717;$$1265$i$i$ph = $716;
             }
             $$1263$i$i = $$1263$i$i$ph;$$1265$i$i = $$1265$i$i$ph;
             while(1) {
              $721 = ((($$1263$i$i)) + 20|0);
              $722 = HEAP32[$721>>2]|0;
              $723 = ($722|0)==(0|0);
              if ($723) {
               $724 = ((($$1263$i$i)) + 16|0);
               $725 = HEAP32[$724>>2]|0;
               $726 = ($725|0)==(0|0);
               if ($726) {
                break;
               } else {
                $$1263$i$i$be = $725;$$1265$i$i$be = $724;
               }
              } else {
               $$1263$i$i$be = $722;$$1265$i$i$be = $721;
              }
              $$1263$i$i = $$1263$i$i$be;$$1265$i$i = $$1265$i$i$be;
             }
             HEAP32[$$1265$i$i>>2] = 0;
             $$3$i$i = $$1263$i$i;
            } else {
             $711 = ((($668)) + 8|0);
             $712 = HEAP32[$711>>2]|0;
             $713 = ((($712)) + 12|0);
             HEAP32[$713>>2] = $709;
             $714 = ((($709)) + 8|0);
             HEAP32[$714>>2] = $712;
             $$3$i$i = $709;
            }
           } while(0);
           $727 = ($707|0)==(0|0);
           if ($727) {
            break;
           }
           $728 = ((($668)) + 28|0);
           $729 = HEAP32[$728>>2]|0;
           $730 = (2112 + ($729<<2)|0);
           $731 = HEAP32[$730>>2]|0;
           $732 = ($731|0)==($668|0);
           do {
            if ($732) {
             HEAP32[$730>>2] = $$3$i$i;
             $cond$i$i = ($$3$i$i|0)==(0|0);
             if (!($cond$i$i)) {
              break;
             }
             $733 = 1 << $729;
             $734 = $733 ^ -1;
             $735 = HEAP32[(1812)>>2]|0;
             $736 = $735 & $734;
             HEAP32[(1812)>>2] = $736;
             break L246;
            } else {
             $737 = ((($707)) + 16|0);
             $738 = HEAP32[$737>>2]|0;
             $739 = ($738|0)==($668|0);
             $740 = ((($707)) + 20|0);
             $$sink321 = $739 ? $737 : $740;
             HEAP32[$$sink321>>2] = $$3$i$i;
             $741 = ($$3$i$i|0)==(0|0);
             if ($741) {
              break L246;
             }
            }
           } while(0);
           $742 = ((($$3$i$i)) + 24|0);
           HEAP32[$742>>2] = $707;
           $743 = ((($668)) + 16|0);
           $744 = HEAP32[$743>>2]|0;
           $745 = ($744|0)==(0|0);
           if (!($745)) {
            $746 = ((($$3$i$i)) + 16|0);
            HEAP32[$746>>2] = $744;
            $747 = ((($744)) + 24|0);
            HEAP32[$747>>2] = $$3$i$i;
           }
           $748 = ((($743)) + 4|0);
           $749 = HEAP32[$748>>2]|0;
           $750 = ($749|0)==(0|0);
           if ($750) {
            break;
           }
           $751 = ((($$3$i$i)) + 20|0);
           HEAP32[$751>>2] = $749;
           $752 = ((($749)) + 24|0);
           HEAP32[$752>>2] = $$3$i$i;
          }
         } while(0);
         $753 = (($668) + ($692)|0);
         $754 = (($692) + ($673))|0;
         $$0$i$i = $753;$$0259$i$i = $754;
        } else {
         $$0$i$i = $668;$$0259$i$i = $673;
        }
        $755 = ((($$0$i$i)) + 4|0);
        $756 = HEAP32[$755>>2]|0;
        $757 = $756 & -2;
        HEAP32[$755>>2] = $757;
        $758 = $$0259$i$i | 1;
        $759 = ((($672)) + 4|0);
        HEAP32[$759>>2] = $758;
        $760 = (($672) + ($$0259$i$i)|0);
        HEAP32[$760>>2] = $$0259$i$i;
        $761 = $$0259$i$i >>> 3;
        $762 = ($$0259$i$i>>>0)<(256);
        if ($762) {
         $763 = $761 << 1;
         $764 = (1848 + ($763<<2)|0);
         $765 = HEAP32[452]|0;
         $766 = 1 << $761;
         $767 = $765 & $766;
         $768 = ($767|0)==(0);
         if ($768) {
          $769 = $765 | $766;
          HEAP32[452] = $769;
          $$pre$i16$i = ((($764)) + 8|0);
          $$0267$i$i = $764;$$pre$phi$i17$iZ2D = $$pre$i16$i;
         } else {
          $770 = ((($764)) + 8|0);
          $771 = HEAP32[$770>>2]|0;
          $$0267$i$i = $771;$$pre$phi$i17$iZ2D = $770;
         }
         HEAP32[$$pre$phi$i17$iZ2D>>2] = $672;
         $772 = ((($$0267$i$i)) + 12|0);
         HEAP32[$772>>2] = $672;
         $773 = ((($672)) + 8|0);
         HEAP32[$773>>2] = $$0267$i$i;
         $774 = ((($672)) + 12|0);
         HEAP32[$774>>2] = $764;
         break;
        }
        $775 = $$0259$i$i >>> 8;
        $776 = ($775|0)==(0);
        do {
         if ($776) {
          $$0268$i$i = 0;
         } else {
          $777 = ($$0259$i$i>>>0)>(16777215);
          if ($777) {
           $$0268$i$i = 31;
           break;
          }
          $778 = (($775) + 1048320)|0;
          $779 = $778 >>> 16;
          $780 = $779 & 8;
          $781 = $775 << $780;
          $782 = (($781) + 520192)|0;
          $783 = $782 >>> 16;
          $784 = $783 & 4;
          $785 = $784 | $780;
          $786 = $781 << $784;
          $787 = (($786) + 245760)|0;
          $788 = $787 >>> 16;
          $789 = $788 & 2;
          $790 = $785 | $789;
          $791 = (14 - ($790))|0;
          $792 = $786 << $789;
          $793 = $792 >>> 15;
          $794 = (($791) + ($793))|0;
          $795 = $794 << 1;
          $796 = (($794) + 7)|0;
          $797 = $$0259$i$i >>> $796;
          $798 = $797 & 1;
          $799 = $798 | $795;
          $$0268$i$i = $799;
         }
        } while(0);
        $800 = (2112 + ($$0268$i$i<<2)|0);
        $801 = ((($672)) + 28|0);
        HEAP32[$801>>2] = $$0268$i$i;
        $802 = ((($672)) + 16|0);
        $803 = ((($802)) + 4|0);
        HEAP32[$803>>2] = 0;
        HEAP32[$802>>2] = 0;
        $804 = HEAP32[(1812)>>2]|0;
        $805 = 1 << $$0268$i$i;
        $806 = $804 & $805;
        $807 = ($806|0)==(0);
        if ($807) {
         $808 = $804 | $805;
         HEAP32[(1812)>>2] = $808;
         HEAP32[$800>>2] = $672;
         $809 = ((($672)) + 24|0);
         HEAP32[$809>>2] = $800;
         $810 = ((($672)) + 12|0);
         HEAP32[$810>>2] = $672;
         $811 = ((($672)) + 8|0);
         HEAP32[$811>>2] = $672;
         break;
        }
        $812 = HEAP32[$800>>2]|0;
        $813 = ((($812)) + 4|0);
        $814 = HEAP32[$813>>2]|0;
        $815 = $814 & -8;
        $816 = ($815|0)==($$0259$i$i|0);
        L291: do {
         if ($816) {
          $$0261$lcssa$i$i = $812;
         } else {
          $817 = ($$0268$i$i|0)==(31);
          $818 = $$0268$i$i >>> 1;
          $819 = (25 - ($818))|0;
          $820 = $817 ? 0 : $819;
          $821 = $$0259$i$i << $820;
          $$02604$i$i = $821;$$02613$i$i = $812;
          while(1) {
           $828 = $$02604$i$i >>> 31;
           $829 = (((($$02613$i$i)) + 16|0) + ($828<<2)|0);
           $824 = HEAP32[$829>>2]|0;
           $830 = ($824|0)==(0|0);
           if ($830) {
            break;
           }
           $822 = $$02604$i$i << 1;
           $823 = ((($824)) + 4|0);
           $825 = HEAP32[$823>>2]|0;
           $826 = $825 & -8;
           $827 = ($826|0)==($$0259$i$i|0);
           if ($827) {
            $$0261$lcssa$i$i = $824;
            break L291;
           } else {
            $$02604$i$i = $822;$$02613$i$i = $824;
           }
          }
          HEAP32[$829>>2] = $672;
          $831 = ((($672)) + 24|0);
          HEAP32[$831>>2] = $$02613$i$i;
          $832 = ((($672)) + 12|0);
          HEAP32[$832>>2] = $672;
          $833 = ((($672)) + 8|0);
          HEAP32[$833>>2] = $672;
          break L238;
         }
        } while(0);
        $834 = ((($$0261$lcssa$i$i)) + 8|0);
        $835 = HEAP32[$834>>2]|0;
        $836 = ((($835)) + 12|0);
        HEAP32[$836>>2] = $672;
        HEAP32[$834>>2] = $672;
        $837 = ((($672)) + 8|0);
        HEAP32[$837>>2] = $835;
        $838 = ((($672)) + 12|0);
        HEAP32[$838>>2] = $$0261$lcssa$i$i;
        $839 = ((($672)) + 24|0);
        HEAP32[$839>>2] = 0;
       }
      } while(0);
      $968 = ((($660)) + 8|0);
      $$0 = $968;
      STACKTOP = sp;return ($$0|0);
     }
    }
    $$0$i$i$i = (2256);
    while(1) {
     $840 = HEAP32[$$0$i$i$i>>2]|0;
     $841 = ($840>>>0)>($585>>>0);
     if (!($841)) {
      $842 = ((($$0$i$i$i)) + 4|0);
      $843 = HEAP32[$842>>2]|0;
      $844 = (($840) + ($843)|0);
      $845 = ($844>>>0)>($585>>>0);
      if ($845) {
       break;
      }
     }
     $846 = ((($$0$i$i$i)) + 8|0);
     $847 = HEAP32[$846>>2]|0;
     $$0$i$i$i = $847;
    }
    $848 = ((($844)) + -47|0);
    $849 = ((($848)) + 8|0);
    $850 = $849;
    $851 = $850 & 7;
    $852 = ($851|0)==(0);
    $853 = (0 - ($850))|0;
    $854 = $853 & 7;
    $855 = $852 ? 0 : $854;
    $856 = (($848) + ($855)|0);
    $857 = ((($585)) + 16|0);
    $858 = ($856>>>0)<($857>>>0);
    $859 = $858 ? $585 : $856;
    $860 = ((($859)) + 8|0);
    $861 = ((($859)) + 24|0);
    $862 = (($$723947$i) + -40)|0;
    $863 = ((($$748$i)) + 8|0);
    $864 = $863;
    $865 = $864 & 7;
    $866 = ($865|0)==(0);
    $867 = (0 - ($864))|0;
    $868 = $867 & 7;
    $869 = $866 ? 0 : $868;
    $870 = (($$748$i) + ($869)|0);
    $871 = (($862) - ($869))|0;
    HEAP32[(1832)>>2] = $870;
    HEAP32[(1820)>>2] = $871;
    $872 = $871 | 1;
    $873 = ((($870)) + 4|0);
    HEAP32[$873>>2] = $872;
    $874 = (($$748$i) + ($862)|0);
    $875 = ((($874)) + 4|0);
    HEAP32[$875>>2] = 40;
    $876 = HEAP32[(2296)>>2]|0;
    HEAP32[(1836)>>2] = $876;
    $877 = ((($859)) + 4|0);
    HEAP32[$877>>2] = 27;
    ;HEAP32[$860>>2]=HEAP32[(2256)>>2]|0;HEAP32[$860+4>>2]=HEAP32[(2256)+4>>2]|0;HEAP32[$860+8>>2]=HEAP32[(2256)+8>>2]|0;HEAP32[$860+12>>2]=HEAP32[(2256)+12>>2]|0;
    HEAP32[(2256)>>2] = $$748$i;
    HEAP32[(2260)>>2] = $$723947$i;
    HEAP32[(2268)>>2] = 0;
    HEAP32[(2264)>>2] = $860;
    $879 = $861;
    while(1) {
     $878 = ((($879)) + 4|0);
     HEAP32[$878>>2] = 7;
     $880 = ((($879)) + 8|0);
     $881 = ($880>>>0)<($844>>>0);
     if ($881) {
      $879 = $878;
     } else {
      break;
     }
    }
    $882 = ($859|0)==($585|0);
    if (!($882)) {
     $883 = $859;
     $884 = $585;
     $885 = (($883) - ($884))|0;
     $886 = HEAP32[$877>>2]|0;
     $887 = $886 & -2;
     HEAP32[$877>>2] = $887;
     $888 = $885 | 1;
     $889 = ((($585)) + 4|0);
     HEAP32[$889>>2] = $888;
     HEAP32[$859>>2] = $885;
     $890 = $885 >>> 3;
     $891 = ($885>>>0)<(256);
     if ($891) {
      $892 = $890 << 1;
      $893 = (1848 + ($892<<2)|0);
      $894 = HEAP32[452]|0;
      $895 = 1 << $890;
      $896 = $894 & $895;
      $897 = ($896|0)==(0);
      if ($897) {
       $898 = $894 | $895;
       HEAP32[452] = $898;
       $$pre$i$i = ((($893)) + 8|0);
       $$0206$i$i = $893;$$pre$phi$i$iZ2D = $$pre$i$i;
      } else {
       $899 = ((($893)) + 8|0);
       $900 = HEAP32[$899>>2]|0;
       $$0206$i$i = $900;$$pre$phi$i$iZ2D = $899;
      }
      HEAP32[$$pre$phi$i$iZ2D>>2] = $585;
      $901 = ((($$0206$i$i)) + 12|0);
      HEAP32[$901>>2] = $585;
      $902 = ((($585)) + 8|0);
      HEAP32[$902>>2] = $$0206$i$i;
      $903 = ((($585)) + 12|0);
      HEAP32[$903>>2] = $893;
      break;
     }
     $904 = $885 >>> 8;
     $905 = ($904|0)==(0);
     if ($905) {
      $$0207$i$i = 0;
     } else {
      $906 = ($885>>>0)>(16777215);
      if ($906) {
       $$0207$i$i = 31;
      } else {
       $907 = (($904) + 1048320)|0;
       $908 = $907 >>> 16;
       $909 = $908 & 8;
       $910 = $904 << $909;
       $911 = (($910) + 520192)|0;
       $912 = $911 >>> 16;
       $913 = $912 & 4;
       $914 = $913 | $909;
       $915 = $910 << $913;
       $916 = (($915) + 245760)|0;
       $917 = $916 >>> 16;
       $918 = $917 & 2;
       $919 = $914 | $918;
       $920 = (14 - ($919))|0;
       $921 = $915 << $918;
       $922 = $921 >>> 15;
       $923 = (($920) + ($922))|0;
       $924 = $923 << 1;
       $925 = (($923) + 7)|0;
       $926 = $885 >>> $925;
       $927 = $926 & 1;
       $928 = $927 | $924;
       $$0207$i$i = $928;
      }
     }
     $929 = (2112 + ($$0207$i$i<<2)|0);
     $930 = ((($585)) + 28|0);
     HEAP32[$930>>2] = $$0207$i$i;
     $931 = ((($585)) + 20|0);
     HEAP32[$931>>2] = 0;
     HEAP32[$857>>2] = 0;
     $932 = HEAP32[(1812)>>2]|0;
     $933 = 1 << $$0207$i$i;
     $934 = $932 & $933;
     $935 = ($934|0)==(0);
     if ($935) {
      $936 = $932 | $933;
      HEAP32[(1812)>>2] = $936;
      HEAP32[$929>>2] = $585;
      $937 = ((($585)) + 24|0);
      HEAP32[$937>>2] = $929;
      $938 = ((($585)) + 12|0);
      HEAP32[$938>>2] = $585;
      $939 = ((($585)) + 8|0);
      HEAP32[$939>>2] = $585;
      break;
     }
     $940 = HEAP32[$929>>2]|0;
     $941 = ((($940)) + 4|0);
     $942 = HEAP32[$941>>2]|0;
     $943 = $942 & -8;
     $944 = ($943|0)==($885|0);
     L325: do {
      if ($944) {
       $$0202$lcssa$i$i = $940;
      } else {
       $945 = ($$0207$i$i|0)==(31);
       $946 = $$0207$i$i >>> 1;
       $947 = (25 - ($946))|0;
       $948 = $945 ? 0 : $947;
       $949 = $885 << $948;
       $$02014$i$i = $949;$$02023$i$i = $940;
       while(1) {
        $956 = $$02014$i$i >>> 31;
        $957 = (((($$02023$i$i)) + 16|0) + ($956<<2)|0);
        $952 = HEAP32[$957>>2]|0;
        $958 = ($952|0)==(0|0);
        if ($958) {
         break;
        }
        $950 = $$02014$i$i << 1;
        $951 = ((($952)) + 4|0);
        $953 = HEAP32[$951>>2]|0;
        $954 = $953 & -8;
        $955 = ($954|0)==($885|0);
        if ($955) {
         $$0202$lcssa$i$i = $952;
         break L325;
        } else {
         $$02014$i$i = $950;$$02023$i$i = $952;
        }
       }
       HEAP32[$957>>2] = $585;
       $959 = ((($585)) + 24|0);
       HEAP32[$959>>2] = $$02023$i$i;
       $960 = ((($585)) + 12|0);
       HEAP32[$960>>2] = $585;
       $961 = ((($585)) + 8|0);
       HEAP32[$961>>2] = $585;
       break L215;
      }
     } while(0);
     $962 = ((($$0202$lcssa$i$i)) + 8|0);
     $963 = HEAP32[$962>>2]|0;
     $964 = ((($963)) + 12|0);
     HEAP32[$964>>2] = $585;
     HEAP32[$962>>2] = $585;
     $965 = ((($585)) + 8|0);
     HEAP32[$965>>2] = $963;
     $966 = ((($585)) + 12|0);
     HEAP32[$966>>2] = $$0202$lcssa$i$i;
     $967 = ((($585)) + 24|0);
     HEAP32[$967>>2] = 0;
    }
   }
  } while(0);
  $969 = HEAP32[(1820)>>2]|0;
  $970 = ($969>>>0)>($$0192>>>0);
  if ($970) {
   $971 = (($969) - ($$0192))|0;
   HEAP32[(1820)>>2] = $971;
   $972 = HEAP32[(1832)>>2]|0;
   $973 = (($972) + ($$0192)|0);
   HEAP32[(1832)>>2] = $973;
   $974 = $971 | 1;
   $975 = ((($973)) + 4|0);
   HEAP32[$975>>2] = $974;
   $976 = $$0192 | 3;
   $977 = ((($972)) + 4|0);
   HEAP32[$977>>2] = $976;
   $978 = ((($972)) + 8|0);
   $$0 = $978;
   STACKTOP = sp;return ($$0|0);
  }
 }
 $979 = (___errno_location()|0);
 HEAP32[$979>>2] = 12;
 $$0 = 0;
 STACKTOP = sp;return ($$0|0);
}
function _free($0) {
 $0 = $0|0;
 var $$0194$i = 0, $$0194$in$i = 0, $$0346381 = 0, $$0347$lcssa = 0, $$0347380 = 0, $$0359 = 0, $$0366 = 0, $$1 = 0, $$1345 = 0, $$1350 = 0, $$1350$be = 0, $$1350$ph = 0, $$1353 = 0, $$1353$be = 0, $$1353$ph = 0, $$1361 = 0, $$1361$be = 0, $$1361$ph = 0, $$1365 = 0, $$1365$be = 0;
 var $$1365$ph = 0, $$2 = 0, $$3 = 0, $$3363 = 0, $$pre = 0, $$pre$phiZ2D = 0, $$sink = 0, $$sink395 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0;
 var $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0;
 var $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0;
 var $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0;
 var $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0;
 var $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0;
 var $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0;
 var $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0;
 var $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0;
 var $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0;
 var $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0;
 var $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0;
 var $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0;
 var $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $cond371 = 0, $cond372 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($0|0)==(0|0);
 if ($1) {
  return;
 }
 $2 = ((($0)) + -8|0);
 $3 = HEAP32[(1824)>>2]|0;
 $4 = ((($0)) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & -8;
 $7 = (($2) + ($6)|0);
 $8 = $5 & 1;
 $9 = ($8|0)==(0);
 do {
  if ($9) {
   $10 = HEAP32[$2>>2]|0;
   $11 = $5 & 3;
   $12 = ($11|0)==(0);
   if ($12) {
    return;
   }
   $13 = (0 - ($10))|0;
   $14 = (($2) + ($13)|0);
   $15 = (($10) + ($6))|0;
   $16 = ($14>>>0)<($3>>>0);
   if ($16) {
    return;
   }
   $17 = HEAP32[(1828)>>2]|0;
   $18 = ($17|0)==($14|0);
   if ($18) {
    $79 = ((($7)) + 4|0);
    $80 = HEAP32[$79>>2]|0;
    $81 = $80 & 3;
    $82 = ($81|0)==(3);
    if (!($82)) {
     $$1 = $14;$$1345 = $15;$87 = $14;
     break;
    }
    $83 = (($14) + ($15)|0);
    $84 = ((($14)) + 4|0);
    $85 = $15 | 1;
    $86 = $80 & -2;
    HEAP32[(1816)>>2] = $15;
    HEAP32[$79>>2] = $86;
    HEAP32[$84>>2] = $85;
    HEAP32[$83>>2] = $15;
    return;
   }
   $19 = $10 >>> 3;
   $20 = ($10>>>0)<(256);
   if ($20) {
    $21 = ((($14)) + 8|0);
    $22 = HEAP32[$21>>2]|0;
    $23 = ((($14)) + 12|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = ($24|0)==($22|0);
    if ($25) {
     $26 = 1 << $19;
     $27 = $26 ^ -1;
     $28 = HEAP32[452]|0;
     $29 = $28 & $27;
     HEAP32[452] = $29;
     $$1 = $14;$$1345 = $15;$87 = $14;
     break;
    } else {
     $30 = ((($22)) + 12|0);
     HEAP32[$30>>2] = $24;
     $31 = ((($24)) + 8|0);
     HEAP32[$31>>2] = $22;
     $$1 = $14;$$1345 = $15;$87 = $14;
     break;
    }
   }
   $32 = ((($14)) + 24|0);
   $33 = HEAP32[$32>>2]|0;
   $34 = ((($14)) + 12|0);
   $35 = HEAP32[$34>>2]|0;
   $36 = ($35|0)==($14|0);
   do {
    if ($36) {
     $41 = ((($14)) + 16|0);
     $42 = ((($41)) + 4|0);
     $43 = HEAP32[$42>>2]|0;
     $44 = ($43|0)==(0|0);
     if ($44) {
      $45 = HEAP32[$41>>2]|0;
      $46 = ($45|0)==(0|0);
      if ($46) {
       $$3 = 0;
       break;
      } else {
       $$1350$ph = $45;$$1353$ph = $41;
      }
     } else {
      $$1350$ph = $43;$$1353$ph = $42;
     }
     $$1350 = $$1350$ph;$$1353 = $$1353$ph;
     while(1) {
      $47 = ((($$1350)) + 20|0);
      $48 = HEAP32[$47>>2]|0;
      $49 = ($48|0)==(0|0);
      if ($49) {
       $50 = ((($$1350)) + 16|0);
       $51 = HEAP32[$50>>2]|0;
       $52 = ($51|0)==(0|0);
       if ($52) {
        break;
       } else {
        $$1350$be = $51;$$1353$be = $50;
       }
      } else {
       $$1350$be = $48;$$1353$be = $47;
      }
      $$1350 = $$1350$be;$$1353 = $$1353$be;
     }
     HEAP32[$$1353>>2] = 0;
     $$3 = $$1350;
    } else {
     $37 = ((($14)) + 8|0);
     $38 = HEAP32[$37>>2]|0;
     $39 = ((($38)) + 12|0);
     HEAP32[$39>>2] = $35;
     $40 = ((($35)) + 8|0);
     HEAP32[$40>>2] = $38;
     $$3 = $35;
    }
   } while(0);
   $53 = ($33|0)==(0|0);
   if ($53) {
    $$1 = $14;$$1345 = $15;$87 = $14;
   } else {
    $54 = ((($14)) + 28|0);
    $55 = HEAP32[$54>>2]|0;
    $56 = (2112 + ($55<<2)|0);
    $57 = HEAP32[$56>>2]|0;
    $58 = ($57|0)==($14|0);
    if ($58) {
     HEAP32[$56>>2] = $$3;
     $cond371 = ($$3|0)==(0|0);
     if ($cond371) {
      $59 = 1 << $55;
      $60 = $59 ^ -1;
      $61 = HEAP32[(1812)>>2]|0;
      $62 = $61 & $60;
      HEAP32[(1812)>>2] = $62;
      $$1 = $14;$$1345 = $15;$87 = $14;
      break;
     }
    } else {
     $63 = ((($33)) + 16|0);
     $64 = HEAP32[$63>>2]|0;
     $65 = ($64|0)==($14|0);
     $66 = ((($33)) + 20|0);
     $$sink = $65 ? $63 : $66;
     HEAP32[$$sink>>2] = $$3;
     $67 = ($$3|0)==(0|0);
     if ($67) {
      $$1 = $14;$$1345 = $15;$87 = $14;
      break;
     }
    }
    $68 = ((($$3)) + 24|0);
    HEAP32[$68>>2] = $33;
    $69 = ((($14)) + 16|0);
    $70 = HEAP32[$69>>2]|0;
    $71 = ($70|0)==(0|0);
    if (!($71)) {
     $72 = ((($$3)) + 16|0);
     HEAP32[$72>>2] = $70;
     $73 = ((($70)) + 24|0);
     HEAP32[$73>>2] = $$3;
    }
    $74 = ((($69)) + 4|0);
    $75 = HEAP32[$74>>2]|0;
    $76 = ($75|0)==(0|0);
    if ($76) {
     $$1 = $14;$$1345 = $15;$87 = $14;
    } else {
     $77 = ((($$3)) + 20|0);
     HEAP32[$77>>2] = $75;
     $78 = ((($75)) + 24|0);
     HEAP32[$78>>2] = $$3;
     $$1 = $14;$$1345 = $15;$87 = $14;
    }
   }
  } else {
   $$1 = $2;$$1345 = $6;$87 = $2;
  }
 } while(0);
 $88 = ($87>>>0)<($7>>>0);
 if (!($88)) {
  return;
 }
 $89 = ((($7)) + 4|0);
 $90 = HEAP32[$89>>2]|0;
 $91 = $90 & 1;
 $92 = ($91|0)==(0);
 if ($92) {
  return;
 }
 $93 = $90 & 2;
 $94 = ($93|0)==(0);
 if ($94) {
  $95 = HEAP32[(1832)>>2]|0;
  $96 = ($95|0)==($7|0);
  if ($96) {
   $97 = HEAP32[(1820)>>2]|0;
   $98 = (($97) + ($$1345))|0;
   HEAP32[(1820)>>2] = $98;
   HEAP32[(1832)>>2] = $$1;
   $99 = $98 | 1;
   $100 = ((($$1)) + 4|0);
   HEAP32[$100>>2] = $99;
   $101 = HEAP32[(1828)>>2]|0;
   $102 = ($$1|0)==($101|0);
   if (!($102)) {
    return;
   }
   HEAP32[(1828)>>2] = 0;
   HEAP32[(1816)>>2] = 0;
   return;
  }
  $103 = HEAP32[(1828)>>2]|0;
  $104 = ($103|0)==($7|0);
  if ($104) {
   $105 = HEAP32[(1816)>>2]|0;
   $106 = (($105) + ($$1345))|0;
   HEAP32[(1816)>>2] = $106;
   HEAP32[(1828)>>2] = $87;
   $107 = $106 | 1;
   $108 = ((($$1)) + 4|0);
   HEAP32[$108>>2] = $107;
   $109 = (($87) + ($106)|0);
   HEAP32[$109>>2] = $106;
   return;
  }
  $110 = $90 & -8;
  $111 = (($110) + ($$1345))|0;
  $112 = $90 >>> 3;
  $113 = ($90>>>0)<(256);
  do {
   if ($113) {
    $114 = ((($7)) + 8|0);
    $115 = HEAP32[$114>>2]|0;
    $116 = ((($7)) + 12|0);
    $117 = HEAP32[$116>>2]|0;
    $118 = ($117|0)==($115|0);
    if ($118) {
     $119 = 1 << $112;
     $120 = $119 ^ -1;
     $121 = HEAP32[452]|0;
     $122 = $121 & $120;
     HEAP32[452] = $122;
     break;
    } else {
     $123 = ((($115)) + 12|0);
     HEAP32[$123>>2] = $117;
     $124 = ((($117)) + 8|0);
     HEAP32[$124>>2] = $115;
     break;
    }
   } else {
    $125 = ((($7)) + 24|0);
    $126 = HEAP32[$125>>2]|0;
    $127 = ((($7)) + 12|0);
    $128 = HEAP32[$127>>2]|0;
    $129 = ($128|0)==($7|0);
    do {
     if ($129) {
      $134 = ((($7)) + 16|0);
      $135 = ((($134)) + 4|0);
      $136 = HEAP32[$135>>2]|0;
      $137 = ($136|0)==(0|0);
      if ($137) {
       $138 = HEAP32[$134>>2]|0;
       $139 = ($138|0)==(0|0);
       if ($139) {
        $$3363 = 0;
        break;
       } else {
        $$1361$ph = $138;$$1365$ph = $134;
       }
      } else {
       $$1361$ph = $136;$$1365$ph = $135;
      }
      $$1361 = $$1361$ph;$$1365 = $$1365$ph;
      while(1) {
       $140 = ((($$1361)) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        $143 = ((($$1361)) + 16|0);
        $144 = HEAP32[$143>>2]|0;
        $145 = ($144|0)==(0|0);
        if ($145) {
         break;
        } else {
         $$1361$be = $144;$$1365$be = $143;
        }
       } else {
        $$1361$be = $141;$$1365$be = $140;
       }
       $$1361 = $$1361$be;$$1365 = $$1365$be;
      }
      HEAP32[$$1365>>2] = 0;
      $$3363 = $$1361;
     } else {
      $130 = ((($7)) + 8|0);
      $131 = HEAP32[$130>>2]|0;
      $132 = ((($131)) + 12|0);
      HEAP32[$132>>2] = $128;
      $133 = ((($128)) + 8|0);
      HEAP32[$133>>2] = $131;
      $$3363 = $128;
     }
    } while(0);
    $146 = ($126|0)==(0|0);
    if (!($146)) {
     $147 = ((($7)) + 28|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = (2112 + ($148<<2)|0);
     $150 = HEAP32[$149>>2]|0;
     $151 = ($150|0)==($7|0);
     if ($151) {
      HEAP32[$149>>2] = $$3363;
      $cond372 = ($$3363|0)==(0|0);
      if ($cond372) {
       $152 = 1 << $148;
       $153 = $152 ^ -1;
       $154 = HEAP32[(1812)>>2]|0;
       $155 = $154 & $153;
       HEAP32[(1812)>>2] = $155;
       break;
      }
     } else {
      $156 = ((($126)) + 16|0);
      $157 = HEAP32[$156>>2]|0;
      $158 = ($157|0)==($7|0);
      $159 = ((($126)) + 20|0);
      $$sink395 = $158 ? $156 : $159;
      HEAP32[$$sink395>>2] = $$3363;
      $160 = ($$3363|0)==(0|0);
      if ($160) {
       break;
      }
     }
     $161 = ((($$3363)) + 24|0);
     HEAP32[$161>>2] = $126;
     $162 = ((($7)) + 16|0);
     $163 = HEAP32[$162>>2]|0;
     $164 = ($163|0)==(0|0);
     if (!($164)) {
      $165 = ((($$3363)) + 16|0);
      HEAP32[$165>>2] = $163;
      $166 = ((($163)) + 24|0);
      HEAP32[$166>>2] = $$3363;
     }
     $167 = ((($162)) + 4|0);
     $168 = HEAP32[$167>>2]|0;
     $169 = ($168|0)==(0|0);
     if (!($169)) {
      $170 = ((($$3363)) + 20|0);
      HEAP32[$170>>2] = $168;
      $171 = ((($168)) + 24|0);
      HEAP32[$171>>2] = $$3363;
     }
    }
   }
  } while(0);
  $172 = $111 | 1;
  $173 = ((($$1)) + 4|0);
  HEAP32[$173>>2] = $172;
  $174 = (($87) + ($111)|0);
  HEAP32[$174>>2] = $111;
  $175 = HEAP32[(1828)>>2]|0;
  $176 = ($$1|0)==($175|0);
  if ($176) {
   HEAP32[(1816)>>2] = $111;
   return;
  } else {
   $$2 = $111;
  }
 } else {
  $177 = $90 & -2;
  HEAP32[$89>>2] = $177;
  $178 = $$1345 | 1;
  $179 = ((($$1)) + 4|0);
  HEAP32[$179>>2] = $178;
  $180 = (($87) + ($$1345)|0);
  HEAP32[$180>>2] = $$1345;
  $$2 = $$1345;
 }
 $181 = $$2 >>> 3;
 $182 = ($$2>>>0)<(256);
 if ($182) {
  $183 = $181 << 1;
  $184 = (1848 + ($183<<2)|0);
  $185 = HEAP32[452]|0;
  $186 = 1 << $181;
  $187 = $185 & $186;
  $188 = ($187|0)==(0);
  if ($188) {
   $189 = $185 | $186;
   HEAP32[452] = $189;
   $$pre = ((($184)) + 8|0);
   $$0366 = $184;$$pre$phiZ2D = $$pre;
  } else {
   $190 = ((($184)) + 8|0);
   $191 = HEAP32[$190>>2]|0;
   $$0366 = $191;$$pre$phiZ2D = $190;
  }
  HEAP32[$$pre$phiZ2D>>2] = $$1;
  $192 = ((($$0366)) + 12|0);
  HEAP32[$192>>2] = $$1;
  $193 = ((($$1)) + 8|0);
  HEAP32[$193>>2] = $$0366;
  $194 = ((($$1)) + 12|0);
  HEAP32[$194>>2] = $184;
  return;
 }
 $195 = $$2 >>> 8;
 $196 = ($195|0)==(0);
 if ($196) {
  $$0359 = 0;
 } else {
  $197 = ($$2>>>0)>(16777215);
  if ($197) {
   $$0359 = 31;
  } else {
   $198 = (($195) + 1048320)|0;
   $199 = $198 >>> 16;
   $200 = $199 & 8;
   $201 = $195 << $200;
   $202 = (($201) + 520192)|0;
   $203 = $202 >>> 16;
   $204 = $203 & 4;
   $205 = $204 | $200;
   $206 = $201 << $204;
   $207 = (($206) + 245760)|0;
   $208 = $207 >>> 16;
   $209 = $208 & 2;
   $210 = $205 | $209;
   $211 = (14 - ($210))|0;
   $212 = $206 << $209;
   $213 = $212 >>> 15;
   $214 = (($211) + ($213))|0;
   $215 = $214 << 1;
   $216 = (($214) + 7)|0;
   $217 = $$2 >>> $216;
   $218 = $217 & 1;
   $219 = $218 | $215;
   $$0359 = $219;
  }
 }
 $220 = (2112 + ($$0359<<2)|0);
 $221 = ((($$1)) + 28|0);
 HEAP32[$221>>2] = $$0359;
 $222 = ((($$1)) + 16|0);
 $223 = ((($$1)) + 20|0);
 HEAP32[$223>>2] = 0;
 HEAP32[$222>>2] = 0;
 $224 = HEAP32[(1812)>>2]|0;
 $225 = 1 << $$0359;
 $226 = $224 & $225;
 $227 = ($226|0)==(0);
 L112: do {
  if ($227) {
   $228 = $224 | $225;
   HEAP32[(1812)>>2] = $228;
   HEAP32[$220>>2] = $$1;
   $229 = ((($$1)) + 24|0);
   HEAP32[$229>>2] = $220;
   $230 = ((($$1)) + 12|0);
   HEAP32[$230>>2] = $$1;
   $231 = ((($$1)) + 8|0);
   HEAP32[$231>>2] = $$1;
  } else {
   $232 = HEAP32[$220>>2]|0;
   $233 = ((($232)) + 4|0);
   $234 = HEAP32[$233>>2]|0;
   $235 = $234 & -8;
   $236 = ($235|0)==($$2|0);
   L115: do {
    if ($236) {
     $$0347$lcssa = $232;
    } else {
     $237 = ($$0359|0)==(31);
     $238 = $$0359 >>> 1;
     $239 = (25 - ($238))|0;
     $240 = $237 ? 0 : $239;
     $241 = $$2 << $240;
     $$0346381 = $241;$$0347380 = $232;
     while(1) {
      $248 = $$0346381 >>> 31;
      $249 = (((($$0347380)) + 16|0) + ($248<<2)|0);
      $244 = HEAP32[$249>>2]|0;
      $250 = ($244|0)==(0|0);
      if ($250) {
       break;
      }
      $242 = $$0346381 << 1;
      $243 = ((($244)) + 4|0);
      $245 = HEAP32[$243>>2]|0;
      $246 = $245 & -8;
      $247 = ($246|0)==($$2|0);
      if ($247) {
       $$0347$lcssa = $244;
       break L115;
      } else {
       $$0346381 = $242;$$0347380 = $244;
      }
     }
     HEAP32[$249>>2] = $$1;
     $251 = ((($$1)) + 24|0);
     HEAP32[$251>>2] = $$0347380;
     $252 = ((($$1)) + 12|0);
     HEAP32[$252>>2] = $$1;
     $253 = ((($$1)) + 8|0);
     HEAP32[$253>>2] = $$1;
     break L112;
    }
   } while(0);
   $254 = ((($$0347$lcssa)) + 8|0);
   $255 = HEAP32[$254>>2]|0;
   $256 = ((($255)) + 12|0);
   HEAP32[$256>>2] = $$1;
   HEAP32[$254>>2] = $$1;
   $257 = ((($$1)) + 8|0);
   HEAP32[$257>>2] = $255;
   $258 = ((($$1)) + 12|0);
   HEAP32[$258>>2] = $$0347$lcssa;
   $259 = ((($$1)) + 24|0);
   HEAP32[$259>>2] = 0;
  }
 } while(0);
 $260 = HEAP32[(1840)>>2]|0;
 $261 = (($260) + -1)|0;
 HEAP32[(1840)>>2] = $261;
 $262 = ($261|0)==(0);
 if (!($262)) {
  return;
 }
 $$0194$in$i = (2264);
 while(1) {
  $$0194$i = HEAP32[$$0194$in$i>>2]|0;
  $263 = ($$0194$i|0)==(0|0);
  $264 = ((($$0194$i)) + 8|0);
  if ($263) {
   break;
  } else {
   $$0194$in$i = $264;
  }
 }
 HEAP32[(1840)>>2] = -1;
 return;
}
function ___stdio_close($0) {
 $0 = $0|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abortStackOverflow(16|0);
 $vararg_buffer = sp;
 $1 = ((($0)) + 60|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = (_dummy_111($2)|0);
 HEAP32[$vararg_buffer>>2] = $3;
 $4 = (___syscall6(6,($vararg_buffer|0))|0);
 $5 = (___syscall_ret($4)|0);
 STACKTOP = sp;return ($5|0);
}
function ___stdio_seek($0,$1,$2) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 var $$pre = 0, $10 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abortStackOverflow(32|0);
 $vararg_buffer = sp;
 $3 = sp + 20|0;
 $4 = ((($0)) + 60|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $3;
 HEAP32[$vararg_buffer>>2] = $5;
 $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
 HEAP32[$vararg_ptr1>>2] = 0;
 $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $1;
 $vararg_ptr3 = ((($vararg_buffer)) + 12|0);
 HEAP32[$vararg_ptr3>>2] = $6;
 $vararg_ptr4 = ((($vararg_buffer)) + 16|0);
 HEAP32[$vararg_ptr4>>2] = $2;
 $7 = (___syscall140(140,($vararg_buffer|0))|0);
 $8 = (___syscall_ret($7)|0);
 $9 = ($8|0)<(0);
 if ($9) {
  HEAP32[$3>>2] = -1;
  $10 = -1;
 } else {
  $$pre = HEAP32[$3>>2]|0;
  $10 = $$pre;
 }
 STACKTOP = sp;return ($10|0);
}
function ___syscall_ret($0) {
 $0 = $0|0;
 var $$0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($0>>>0)>(4294963200);
 if ($1) {
  $2 = (0 - ($0))|0;
  $3 = (___errno_location()|0);
  HEAP32[$3>>2] = $2;
  $$0 = -1;
 } else {
  $$0 = $0;
 }
 return ($$0|0);
}
function ___errno_location() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return (2304|0);
}
function _dummy_111($0) {
 $0 = $0|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return ($0|0);
}
function ___stdout_write($0,$1,$2) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abortStackOverflow(32|0);
 $vararg_buffer = sp;
 $3 = sp + 16|0;
 $4 = ((($0)) + 36|0);
 HEAP32[$4>>2] = 4;
 $5 = HEAP32[$0>>2]|0;
 $6 = $5 & 64;
 $7 = ($6|0)==(0);
 if ($7) {
  $8 = ((($0)) + 60|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = $3;
  HEAP32[$vararg_buffer>>2] = $9;
  $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
  HEAP32[$vararg_ptr1>>2] = 21523;
  $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
  HEAP32[$vararg_ptr2>>2] = $10;
  $11 = (___syscall54(54,($vararg_buffer|0))|0);
  $12 = ($11|0)==(0);
  if (!($12)) {
   $13 = ((($0)) + 75|0);
   HEAP8[$13>>0] = -1;
  }
 }
 $14 = (___stdio_write($0,$1,$2)|0);
 STACKTOP = sp;return ($14|0);
}
function ___stdio_write($0,$1,$2) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 var $$0 = 0, $$04756 = 0, $$04855 = 0, $$04954 = 0, $$051 = 0, $$1 = 0, $$150 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer3 = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0;
 var $vararg_ptr6 = 0, $vararg_ptr7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abortStackOverflow(48|0);
 $vararg_buffer3 = sp + 32|0;
 $vararg_buffer = sp + 16|0;
 $3 = sp;
 $4 = ((($0)) + 28|0);
 $5 = HEAP32[$4>>2]|0;
 HEAP32[$3>>2] = $5;
 $6 = ((($3)) + 4|0);
 $7 = ((($0)) + 20|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = (($8) - ($5))|0;
 HEAP32[$6>>2] = $9;
 $10 = ((($3)) + 8|0);
 HEAP32[$10>>2] = $1;
 $11 = ((($3)) + 12|0);
 HEAP32[$11>>2] = $2;
 $12 = (($9) + ($2))|0;
 $13 = ((($0)) + 60|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = $3;
 HEAP32[$vararg_buffer>>2] = $14;
 $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $15;
 $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
 HEAP32[$vararg_ptr2>>2] = 2;
 $16 = (___syscall146(146,($vararg_buffer|0))|0);
 $17 = (___syscall_ret($16)|0);
 $18 = ($12|0)==($17|0);
 L1: do {
  if ($18) {
   label = 3;
  } else {
   $$04756 = 2;$$04855 = $12;$$04954 = $3;$26 = $17;
   while(1) {
    $27 = ($26|0)<(0);
    if ($27) {
     break;
    }
    $35 = (($$04855) - ($26))|0;
    $36 = ((($$04954)) + 4|0);
    $37 = HEAP32[$36>>2]|0;
    $38 = ($26>>>0)>($37>>>0);
    $39 = ((($$04954)) + 8|0);
    $$150 = $38 ? $39 : $$04954;
    $40 = $38 << 31 >> 31;
    $$1 = (($$04756) + ($40))|0;
    $41 = $38 ? $37 : 0;
    $$0 = (($26) - ($41))|0;
    $42 = HEAP32[$$150>>2]|0;
    $43 = (($42) + ($$0)|0);
    HEAP32[$$150>>2] = $43;
    $44 = ((($$150)) + 4|0);
    $45 = HEAP32[$44>>2]|0;
    $46 = (($45) - ($$0))|0;
    HEAP32[$44>>2] = $46;
    $47 = HEAP32[$13>>2]|0;
    $48 = $$150;
    HEAP32[$vararg_buffer3>>2] = $47;
    $vararg_ptr6 = ((($vararg_buffer3)) + 4|0);
    HEAP32[$vararg_ptr6>>2] = $48;
    $vararg_ptr7 = ((($vararg_buffer3)) + 8|0);
    HEAP32[$vararg_ptr7>>2] = $$1;
    $49 = (___syscall146(146,($vararg_buffer3|0))|0);
    $50 = (___syscall_ret($49)|0);
    $51 = ($35|0)==($50|0);
    if ($51) {
     label = 3;
     break L1;
    } else {
     $$04756 = $$1;$$04855 = $35;$$04954 = $$150;$26 = $50;
    }
   }
   $28 = ((($0)) + 16|0);
   HEAP32[$28>>2] = 0;
   HEAP32[$4>>2] = 0;
   HEAP32[$7>>2] = 0;
   $29 = HEAP32[$0>>2]|0;
   $30 = $29 | 32;
   HEAP32[$0>>2] = $30;
   $31 = ($$04756|0)==(2);
   if ($31) {
    $$051 = 0;
   } else {
    $32 = ((($$04954)) + 4|0);
    $33 = HEAP32[$32>>2]|0;
    $34 = (($2) - ($33))|0;
    $$051 = $34;
   }
  }
 } while(0);
 if ((label|0) == 3) {
  $19 = ((($0)) + 44|0);
  $20 = HEAP32[$19>>2]|0;
  $21 = ((($0)) + 48|0);
  $22 = HEAP32[$21>>2]|0;
  $23 = (($20) + ($22)|0);
  $24 = ((($0)) + 16|0);
  HEAP32[$24>>2] = $23;
  $25 = $20;
  HEAP32[$4>>2] = $25;
  HEAP32[$7>>2] = $25;
  $$051 = $2;
 }
 STACKTOP = sp;return ($$051|0);
}
function ___lockfile($0) {
 $0 = $0|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 0;
}
function ___unlockfile($0) {
 $0 = $0|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function ___ofl_lock() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 ___lock((2308|0));
 return (2316|0);
}
function ___ofl_unlock() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 ___unlock((2308|0));
 return;
}
function _fflush($0) {
 $0 = $0|0;
 var $$0 = 0, $$023 = 0, $$02325 = 0, $$02327 = 0, $$024$lcssa = 0, $$02426 = 0, $$1 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $phitmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($0|0)==(0|0);
 do {
  if ($1) {
   $8 = HEAP32[191]|0;
   $9 = ($8|0)==(0|0);
   if ($9) {
    $29 = 0;
   } else {
    $10 = HEAP32[191]|0;
    $11 = (_fflush($10)|0);
    $29 = $11;
   }
   $12 = (___ofl_lock()|0);
   $$02325 = HEAP32[$12>>2]|0;
   $13 = ($$02325|0)==(0|0);
   if ($13) {
    $$024$lcssa = $29;
   } else {
    $$02327 = $$02325;$$02426 = $29;
    while(1) {
     $14 = ((($$02327)) + 76|0);
     $15 = HEAP32[$14>>2]|0;
     $16 = ($15|0)>(-1);
     if ($16) {
      $17 = (___lockfile($$02327)|0);
      $25 = $17;
     } else {
      $25 = 0;
     }
     $18 = ((($$02327)) + 20|0);
     $19 = HEAP32[$18>>2]|0;
     $20 = ((($$02327)) + 28|0);
     $21 = HEAP32[$20>>2]|0;
     $22 = ($19>>>0)>($21>>>0);
     if ($22) {
      $23 = (___fflush_unlocked($$02327)|0);
      $24 = $23 | $$02426;
      $$1 = $24;
     } else {
      $$1 = $$02426;
     }
     $26 = ($25|0)==(0);
     if (!($26)) {
      ___unlockfile($$02327);
     }
     $27 = ((($$02327)) + 56|0);
     $$023 = HEAP32[$27>>2]|0;
     $28 = ($$023|0)==(0|0);
     if ($28) {
      $$024$lcssa = $$1;
      break;
     } else {
      $$02327 = $$023;$$02426 = $$1;
     }
    }
   }
   ___ofl_unlock();
   $$0 = $$024$lcssa;
  } else {
   $2 = ((($0)) + 76|0);
   $3 = HEAP32[$2>>2]|0;
   $4 = ($3|0)>(-1);
   if (!($4)) {
    $5 = (___fflush_unlocked($0)|0);
    $$0 = $5;
    break;
   }
   $6 = (___lockfile($0)|0);
   $phitmp = ($6|0)==(0);
   $7 = (___fflush_unlocked($0)|0);
   if ($phitmp) {
    $$0 = $7;
   } else {
    ___unlockfile($0);
    $$0 = $7;
   }
  }
 } while(0);
 return ($$0|0);
}
function ___fflush_unlocked($0) {
 $0 = $0|0;
 var $$0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ((($0)) + 20|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = ((($0)) + 28|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($2>>>0)>($4>>>0);
 if ($5) {
  $6 = ((($0)) + 36|0);
  $7 = HEAP32[$6>>2]|0;
  (FUNCTION_TABLE_iiii[$7 & 7]($0,0,0)|0);
  $8 = HEAP32[$1>>2]|0;
  $9 = ($8|0)==(0|0);
  if ($9) {
   $$0 = -1;
  } else {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label|0) == 3) {
  $10 = ((($0)) + 4|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = ((($0)) + 8|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ($11>>>0)<($13>>>0);
  if ($14) {
   $15 = $11;
   $16 = $13;
   $17 = (($15) - ($16))|0;
   $18 = ((($0)) + 40|0);
   $19 = HEAP32[$18>>2]|0;
   (FUNCTION_TABLE_iiii[$19 & 7]($0,$17,1)|0);
  }
  $20 = ((($0)) + 16|0);
  HEAP32[$20>>2] = 0;
  HEAP32[$3>>2] = 0;
  HEAP32[$1>>2] = 0;
  HEAP32[$12>>2] = 0;
  HEAP32[$10>>2] = 0;
  $$0 = 0;
 }
 return ($$0|0);
}
function runPostSets() {
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    var aligned_dest_end = 0;
    var block_aligned_dest_end = 0;
    var dest_end = 0;
    // Test against a benchmarked cutoff limit for when HEAPU8.set() becomes faster to use.
    if ((num|0) >=
      8192
    ) {
      return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    }

    ret = dest|0;
    dest_end = (dest + num)|0;
    if ((dest&3) == (src&3)) {
      // The initial unaligned < 4-byte front.
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      aligned_dest_end = (dest_end & -4)|0;
      block_aligned_dest_end = (aligned_dest_end - 64)|0;
      while ((dest|0) <= (block_aligned_dest_end|0) ) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        HEAP32[(((dest)+(4))>>2)]=((HEAP32[(((src)+(4))>>2)])|0);
        HEAP32[(((dest)+(8))>>2)]=((HEAP32[(((src)+(8))>>2)])|0);
        HEAP32[(((dest)+(12))>>2)]=((HEAP32[(((src)+(12))>>2)])|0);
        HEAP32[(((dest)+(16))>>2)]=((HEAP32[(((src)+(16))>>2)])|0);
        HEAP32[(((dest)+(20))>>2)]=((HEAP32[(((src)+(20))>>2)])|0);
        HEAP32[(((dest)+(24))>>2)]=((HEAP32[(((src)+(24))>>2)])|0);
        HEAP32[(((dest)+(28))>>2)]=((HEAP32[(((src)+(28))>>2)])|0);
        HEAP32[(((dest)+(32))>>2)]=((HEAP32[(((src)+(32))>>2)])|0);
        HEAP32[(((dest)+(36))>>2)]=((HEAP32[(((src)+(36))>>2)])|0);
        HEAP32[(((dest)+(40))>>2)]=((HEAP32[(((src)+(40))>>2)])|0);
        HEAP32[(((dest)+(44))>>2)]=((HEAP32[(((src)+(44))>>2)])|0);
        HEAP32[(((dest)+(48))>>2)]=((HEAP32[(((src)+(48))>>2)])|0);
        HEAP32[(((dest)+(52))>>2)]=((HEAP32[(((src)+(52))>>2)])|0);
        HEAP32[(((dest)+(56))>>2)]=((HEAP32[(((src)+(56))>>2)])|0);
        HEAP32[(((dest)+(60))>>2)]=((HEAP32[(((src)+(60))>>2)])|0);
        dest = (dest+64)|0;
        src = (src+64)|0;
      }
      while ((dest|0) < (aligned_dest_end|0) ) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
      }
    } else {
      // In the unaligned copy case, unroll a bit as well.
      aligned_dest_end = (dest_end - 4)|0;
      while ((dest|0) < (aligned_dest_end|0) ) {
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        HEAP8[(((dest)+(1))>>0)]=((HEAP8[(((src)+(1))>>0)])|0);
        HEAP8[(((dest)+(2))>>0)]=((HEAP8[(((src)+(2))>>0)])|0);
        HEAP8[(((dest)+(3))>>0)]=((HEAP8[(((src)+(3))>>0)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
      }
    }
    // The remaining unaligned < 4 byte tail.
    while ((dest|0) < (dest_end|0)) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
    }
    return ret|0;
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
    end = (ptr + num)|0;

    value = value & 0xff;
    if ((num|0) >= 67 /* 64 bytes for an unrolled loop + 3 bytes for unaligned head*/) {
      while ((ptr&3) != 0) {
        HEAP8[((ptr)>>0)]=value;
        ptr = (ptr+1)|0;
      }

      aligned_end = (end & -4)|0;
      block_aligned_end = (aligned_end - 64)|0;
      value4 = value | (value << 8) | (value << 16) | (value << 24);

      while((ptr|0) <= (block_aligned_end|0)) {
        HEAP32[((ptr)>>2)]=value4;
        HEAP32[(((ptr)+(4))>>2)]=value4;
        HEAP32[(((ptr)+(8))>>2)]=value4;
        HEAP32[(((ptr)+(12))>>2)]=value4;
        HEAP32[(((ptr)+(16))>>2)]=value4;
        HEAP32[(((ptr)+(20))>>2)]=value4;
        HEAP32[(((ptr)+(24))>>2)]=value4;
        HEAP32[(((ptr)+(28))>>2)]=value4;
        HEAP32[(((ptr)+(32))>>2)]=value4;
        HEAP32[(((ptr)+(36))>>2)]=value4;
        HEAP32[(((ptr)+(40))>>2)]=value4;
        HEAP32[(((ptr)+(44))>>2)]=value4;
        HEAP32[(((ptr)+(48))>>2)]=value4;
        HEAP32[(((ptr)+(52))>>2)]=value4;
        HEAP32[(((ptr)+(56))>>2)]=value4;
        HEAP32[(((ptr)+(60))>>2)]=value4;
        ptr = (ptr + 64)|0;
      }

      while ((ptr|0) < (aligned_end|0) ) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    // The remaining bytes.
    while ((ptr|0) < (end|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (end-num)|0;
}
function _sbrk(increment) {
    increment = increment|0;
    var oldDynamicTop = 0;
    var oldDynamicTopOnChange = 0;
    var newDynamicTop = 0;
    var totalMemory = 0;
    oldDynamicTop = HEAP32[DYNAMICTOP_PTR>>2]|0;
    newDynamicTop = oldDynamicTop + increment | 0;

    if (((increment|0) > 0 & (newDynamicTop|0) < (oldDynamicTop|0)) // Detect and fail if we would wrap around signed 32-bit int.
      | (newDynamicTop|0) < 0) { // Also underflow, sbrk() should be able to be used to subtract.
      abortOnCannotGrowMemory()|0;
      ___setErrNo(12);
      return -1;
    }

    HEAP32[DYNAMICTOP_PTR>>2] = newDynamicTop;
    totalMemory = getTotalMemory()|0;
    if ((newDynamicTop|0) > (totalMemory|0)) {
      if ((enlargeMemory()|0) == 0) {
        HEAP32[DYNAMICTOP_PTR>>2] = oldDynamicTop;
        ___setErrNo(12);
        return -1;
      }
    }
    return oldDynamicTop|0;
}

  
function dynCall_ii(index,a1) {
  index = index|0;
  a1=a1|0;
  return FUNCTION_TABLE_ii[index&1](a1|0)|0;
}


function dynCall_iiii(index,a1,a2,a3) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0;
  return FUNCTION_TABLE_iiii[index&7](a1|0,a2|0,a3|0)|0;
}

function b0(p0) {
 p0 = p0|0; nullFunc_ii(0);return 0;
}
function b1(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_iiii(1);return 0;
}

// EMSCRIPTEN_END_FUNCS
var FUNCTION_TABLE_ii = [b0,___stdio_close];
var FUNCTION_TABLE_iiii = [b1,b1,___stdout_write,___stdio_seek,___stdio_write,b1,b1,b1];

  return { ___errno_location: ___errno_location, _fflush: _fflush, _free: _free, _getNextSoundData: _getNextSoundData, _loadMod: _loadMod, _main: _main, _malloc: _malloc, _memcpy: _memcpy, _memset: _memset, _sbrk: _sbrk, _unloadMod: _unloadMod, dynCall_ii: dynCall_ii, dynCall_iiii: dynCall_iiii, establishStackSpace: establishStackSpace, getTempRet0: getTempRet0, runPostSets: runPostSets, setTempRet0: setTempRet0, setThrew: setThrew, stackAlloc: stackAlloc, stackRestore: stackRestore, stackSave: stackSave };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);

var real____errno_location = asm["___errno_location"]; asm["___errno_location"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real____errno_location.apply(null, arguments);
};

var real__fflush = asm["_fflush"]; asm["_fflush"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__fflush.apply(null, arguments);
};

var real__free = asm["_free"]; asm["_free"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__free.apply(null, arguments);
};

var real__getNextSoundData = asm["_getNextSoundData"]; asm["_getNextSoundData"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__getNextSoundData.apply(null, arguments);
};

var real__loadMod = asm["_loadMod"]; asm["_loadMod"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__loadMod.apply(null, arguments);
};

var real__main = asm["_main"]; asm["_main"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__main.apply(null, arguments);
};

var real__malloc = asm["_malloc"]; asm["_malloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__malloc.apply(null, arguments);
};

var real__sbrk = asm["_sbrk"]; asm["_sbrk"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__sbrk.apply(null, arguments);
};

var real__unloadMod = asm["_unloadMod"]; asm["_unloadMod"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__unloadMod.apply(null, arguments);
};

var real_establishStackSpace = asm["establishStackSpace"]; asm["establishStackSpace"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_establishStackSpace.apply(null, arguments);
};

var real_getTempRet0 = asm["getTempRet0"]; asm["getTempRet0"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_getTempRet0.apply(null, arguments);
};

var real_setTempRet0 = asm["setTempRet0"]; asm["setTempRet0"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_setTempRet0.apply(null, arguments);
};

var real_setThrew = asm["setThrew"]; asm["setThrew"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_setThrew.apply(null, arguments);
};

var real_stackAlloc = asm["stackAlloc"]; asm["stackAlloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackAlloc.apply(null, arguments);
};

var real_stackRestore = asm["stackRestore"]; asm["stackRestore"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackRestore.apply(null, arguments);
};

var real_stackSave = asm["stackSave"]; asm["stackSave"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackSave.apply(null, arguments);
};
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var _fflush = Module["_fflush"] = asm["_fflush"];
var _free = Module["_free"] = asm["_free"];
var _getNextSoundData = Module["_getNextSoundData"] = asm["_getNextSoundData"];
var _loadMod = Module["_loadMod"] = asm["_loadMod"];
var _main = Module["_main"] = asm["_main"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _memset = Module["_memset"] = asm["_memset"];
var _sbrk = Module["_sbrk"] = asm["_sbrk"];
var _unloadMod = Module["_unloadMod"] = asm["_unloadMod"];
var establishStackSpace = Module["establishStackSpace"] = asm["establishStackSpace"];
var getTempRet0 = Module["getTempRet0"] = asm["getTempRet0"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var setTempRet0 = Module["setTempRet0"] = asm["setTempRet0"];
var setThrew = Module["setThrew"] = asm["setThrew"];
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"];
var stackRestore = Module["stackRestore"] = asm["stackRestore"];
var stackSave = Module["stackSave"] = asm["stackSave"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
;



// === Auto-generated postamble setup entry stuff ===

Module['asm'] = asm;

if (!Module["intArrayFromString"]) Module["intArrayFromString"] = function() { abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["intArrayToString"]) Module["intArrayToString"] = function() { abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["ccall"]) Module["ccall"] = function() { abort("'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["cwrap"]) Module["cwrap"] = function() { abort("'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["setValue"]) Module["setValue"] = function() { abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getValue"]) Module["getValue"] = function() { abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["allocate"]) Module["allocate"] = function() { abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getMemory"]) Module["getMemory"] = function() { abort("'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["Pointer_stringify"]) Module["Pointer_stringify"] = function() { abort("'Pointer_stringify' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["AsciiToString"]) Module["AsciiToString"] = function() { abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToAscii"]) Module["stringToAscii"] = function() { abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF8ArrayToString"]) Module["UTF8ArrayToString"] = function() { abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF8ToString"]) Module["UTF8ToString"] = function() { abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF8Array"]) Module["stringToUTF8Array"] = function() { abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF8"]) Module["stringToUTF8"] = function() { abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["lengthBytesUTF8"]) Module["lengthBytesUTF8"] = function() { abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF16ToString"]) Module["UTF16ToString"] = function() { abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF16"]) Module["stringToUTF16"] = function() { abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["lengthBytesUTF16"]) Module["lengthBytesUTF16"] = function() { abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF32ToString"]) Module["UTF32ToString"] = function() { abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF32"]) Module["stringToUTF32"] = function() { abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["lengthBytesUTF32"]) Module["lengthBytesUTF32"] = function() { abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["allocateUTF8"]) Module["allocateUTF8"] = function() { abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackTrace"]) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnPreRun"]) Module["addOnPreRun"] = function() { abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnInit"]) Module["addOnInit"] = function() { abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnPreMain"]) Module["addOnPreMain"] = function() { abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnExit"]) Module["addOnExit"] = function() { abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnPostRun"]) Module["addOnPostRun"] = function() { abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["writeStringToMemory"]) Module["writeStringToMemory"] = function() { abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["writeArrayToMemory"]) Module["writeArrayToMemory"] = function() { abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["writeAsciiToMemory"]) Module["writeAsciiToMemory"] = function() { abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addRunDependency"]) Module["addRunDependency"] = function() { abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["removeRunDependency"]) Module["removeRunDependency"] = function() { abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["ENV"]) Module["ENV"] = function() { abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["FS"]) Module["FS"] = function() { abort("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["FS_createFolder"]) Module["FS_createFolder"] = function() { abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["FS_createPath"]) Module["FS_createPath"] = function() { abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["FS_createDataFile"]) Module["FS_createDataFile"] = function() { abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["FS_createPreloadedFile"]) Module["FS_createPreloadedFile"] = function() { abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["FS_createLazyFile"]) Module["FS_createLazyFile"] = function() { abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["FS_createLink"]) Module["FS_createLink"] = function() { abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["FS_createDevice"]) Module["FS_createDevice"] = function() { abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["FS_unlink"]) Module["FS_unlink"] = function() { abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Module["GL"]) Module["GL"] = function() { abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["staticAlloc"]) Module["staticAlloc"] = function() { abort("'staticAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["dynamicAlloc"]) Module["dynamicAlloc"] = function() { abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["warnOnce"]) Module["warnOnce"] = function() { abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["loadDynamicLibrary"]) Module["loadDynamicLibrary"] = function() { abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["loadWebAssemblyModule"]) Module["loadWebAssemblyModule"] = function() { abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getLEB"]) Module["getLEB"] = function() { abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getFunctionTables"]) Module["getFunctionTables"] = function() { abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["alignFunctionTables"]) Module["alignFunctionTables"] = function() { abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["registerFunctions"]) Module["registerFunctions"] = function() { abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addFunction"]) Module["addFunction"] = function() { abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["removeFunction"]) Module["removeFunction"] = function() { abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getFuncWrapper"]) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["prettyPrint"]) Module["prettyPrint"] = function() { abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["makeBigInt"]) Module["makeBigInt"] = function() { abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["dynCall"]) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getCompilerSetting"]) Module["getCompilerSetting"] = function() { abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackSave"]) Module["stackSave"] = function() { abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackRestore"]) Module["stackRestore"] = function() { abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackAlloc"]) Module["stackAlloc"] = function() { abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["establishStackSpace"]) Module["establishStackSpace"] = function() { abort("'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["print"]) Module["print"] = function() { abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["printErr"]) Module["printErr"] = function() { abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["intArrayFromBase64"]) Module["intArrayFromBase64"] = function() { abort("'intArrayFromBase64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["tryParseAsDataURI"]) Module["tryParseAsDataURI"] = function() { abort("'tryParseAsDataURI' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };if (!Module["ALLOC_NORMAL"]) Object.defineProperty(Module, "ALLOC_NORMAL", { get: function() { abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Module["ALLOC_STACK"]) Object.defineProperty(Module, "ALLOC_STACK", { get: function() { abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Module["ALLOC_STATIC"]) Object.defineProperty(Module, "ALLOC_STATIC", { get: function() { abort("'ALLOC_STATIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Module["ALLOC_DYNAMIC"]) Object.defineProperty(Module, "ALLOC_DYNAMIC", { get: function() { abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Module["ALLOC_NONE"]) Object.defineProperty(Module, "ALLOC_NONE", { get: function() { abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });

if (memoryInitializer) {
  if (!isDataURI(memoryInitializer)) {
    memoryInitializer = locateFile(memoryInitializer);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, GLOBAL_BASE);
  } else {
    addRunDependency('memory initializer');
    var applyMemoryInitializer = function(data) {
      if (data.byteLength) data = new Uint8Array(data);
      for (var i = 0; i < data.length; i++) {
        assert(HEAPU8[GLOBAL_BASE + i] === 0, "area for memory initializer should not have been touched before it's loaded");
      }
      HEAPU8.set(data, GLOBAL_BASE);
      // Delete the typed array that contains the large blob of the memory initializer request response so that
      // we won't keep unnecessary memory lying around. However, keep the XHR object itself alive so that e.g.
      // its .status field can still be accessed later.
      if (Module['memoryInitializerRequest']) delete Module['memoryInitializerRequest'].response;
      removeRunDependency('memory initializer');
    }
    function doBrowserLoad() {
      Module['readAsync'](memoryInitializer, applyMemoryInitializer, function() {
        throw 'could not load memory initializer ' + memoryInitializer;
      });
    }
    var memoryInitializerBytes = tryParseAsDataURI(memoryInitializer);
    if (memoryInitializerBytes) {
      applyMemoryInitializer(memoryInitializerBytes.buffer);
    } else
    if (Module['memoryInitializerRequest']) {
      // a network request has already been created, just use that
      function useRequest() {
        var request = Module['memoryInitializerRequest'];
        var response = request.response;
        if (request.status !== 200 && request.status !== 0) {
          var data = tryParseAsDataURI(Module['memoryInitializerRequestURL']);
          if (data) {
            response = data.buffer;
          } else {
            // If you see this warning, the issue may be that you are using locateFile and defining it in JS. That
            // means that the HTML file doesn't know about it, and when it tries to create the mem init request early, does it to the wrong place.
            // Look in your browser's devtools network console to see what's going on.
            console.warn('a problem seems to have happened with Module.memoryInitializerRequest, status: ' + request.status + ', retrying ' + memoryInitializer);
            doBrowserLoad();
            return;
          }
        }
        applyMemoryInitializer(response);
      }
      if (Module['memoryInitializerRequest'].response) {
        setTimeout(useRequest, 0); // it's already here; but, apply it asynchronously
      } else {
        Module['memoryInitializerRequest'].addEventListener('load', useRequest); // wait for it
      }
    } else {
      // fetch it from the network ourselves
      doBrowserLoad();
    }
  }
}



/**
 * @constructor
 * @extends {Error}
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun']) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  var argv = stackAlloc((argc + 1) * 4);
  HEAP32[argv >> 2] = allocateUTF8OnStack(Module['thisProgram']);
  for (var i = 1; i < argc; i++) {
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
  }
  HEAP32[(argv >> 2) + argc] = 0;


  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
      exit(ret, /* implicit = */ true);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      var toLog = e;
      if (e && typeof e === 'object' && e.stack) {
        toLog = [e, e.stack];
      }
      err('exception thrown: ' + toLog);
      Module['quit'](1, e);
    }
  } finally {
    calledMain = true;
  }
}




/** @type {function(Array=)} */
function run(args) {
  args = args || Module['arguments'];

  if (runDependencies > 0) {
    return;
  }

  writeStackCookie();

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return;

    ensureInitRuntime();

    preMain();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (Module['_main'] && shouldRunNow) Module['callMain'](args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}
Module['run'] = run;

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var print = out;
  var printErr = err;
  var has = false;
  out = err = function(x) {
    has = true;
  }
  try { // it doesn't matter if it fails
    var flush = flush_NO_FILESYSTEM;
    if (flush) flush(0);
  } catch(e) {}
  out = print;
  err = printErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
  }
}

function exit(status, implicit) {
  checkUnflushedContent();

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && Module['noExitRuntime'] && status === 0) {
    return;
  }

  if (Module['noExitRuntime']) {
    // if exit() was called, we may warn the user if the runtime isn't actually being shut down
    if (!implicit) {
      err('exit(' + status + ') called, but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)');
    }
  } else {

    ABORT = true;
    EXITSTATUS = status;
    STACKTOP = initialStackTop;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  Module['quit'](status, new ExitStatus(status));
}

var abortDecorators = [];

function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  if (what !== undefined) {
    out(what);
    err(what);
    what = JSON.stringify(what)
  } else {
    what = '';
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';
  var output = 'abort(' + what + ') at ' + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function(decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}
Module['abort'] = abort;

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

Module["noExitRuntime"] = true;

run();





// {{MODULE_ADDITIONS}}



