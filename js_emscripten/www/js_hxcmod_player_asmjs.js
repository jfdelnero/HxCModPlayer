function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != 'undefined' ? Module : {};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object';
var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = (typeof process === "undefined" ? "undefined" : _typeof(process)) == 'object' && _typeof(process.versions) == 'object' && typeof process.versions.node == 'string' && process.type != 'renderer';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {}

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = _objectSpread({}, Module);
var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function quit_(status, toThrow) {
  throw toThrow;
};

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;
if (ENVIRONMENT_IS_NODE) {
  if (typeof process == 'undefined' || !process.release || process.release.name !== 'node') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');
  var nodeVersion = process.versions.node;
  var numericVersion = nodeVersion.split('.').slice(0, 3);
  numericVersion = numericVersion[0] * 10000 + numericVersion[1] * 100 + numericVersion[2].split('-')[0] * 1;
  var minVersion = 0;
  if (numericVersion < 0) {
    throw new Error('This emscripten-generated code requires node v0.0.0 (detected v' + nodeVersion + ')');
  }

  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require('fs');
  var nodePath = require('path');
  scriptDirectory = __dirname + '/';

  // include: node_shell_read.js
  readBinary = function readBinary(filename) {
    // We need to re-wrap `file://` strings to URLs.
    filename = isFileURI(filename) ? new URL(filename) : filename;
    var ret = fs.readFileSync(filename);
    assert(Buffer.isBuffer(ret));
    return ret;
  };
  readAsync = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(filename) {
      var binary,
        ret,
        _args = arguments;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            binary = _args.length > 1 && _args[1] !== undefined ? _args[1] : true;
            // See the comment in the `readBinary` function.
            filename = isFileURI(filename) ? new URL(filename) : filename;
            ret = fs.readFileSync(filename, binary ? undefined : 'utf8');
            assert(binary ? Buffer.isBuffer(ret) : typeof ret == 'string');
            return _context.abrupt("return", ret);
          case 5:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function readAsync(_x) {
      return _ref.apply(this, arguments);
    };
  }();
  // end include: node_shell_read.js
  if (!Module['thisProgram'] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, '/');
  }
  arguments_ = process.argv.slice(2);
  if (typeof module != 'undefined') {
    module['exports'] = Module;
  }

  // Without this older versions of node (< v15) will log unhandled rejections
  // but return 0, which is not normally the desired behaviour.  This is
  // not be needed with node v15 and about because it is now the default
  // behaviour:
  // See https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
  var nodeMajor = process.versions.node.split(".")[0];
  if (nodeMajor < 15) {
    process.on('unhandledRejection', function (reason) {
      throw reason;
    });
  }
  quit_ = function quit_(status, toThrow) {
    process.exitCode = status;
    throw toThrow;
  };
} else if (ENVIRONMENT_IS_SHELL) {
  if ((typeof process === "undefined" ? "undefined" : _typeof(process)) == 'object' && typeof require === 'function' || (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' || typeof WorkerGlobalScope != 'undefined') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');
} else
  // Note that this includes Node.js workers when relevant (pthreads is enabled).
  // Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
  // ENVIRONMENT_IS_NODE.
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
      // Check worker, not web, since window could be polyfilled
      scriptDirectory = self.location.href;
    } else if (typeof document != 'undefined' && document.currentScript) {
      // web
      scriptDirectory = document.currentScript.src;
    }
    // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
    // otherwise, slice off the final part of the url to find the script directory.
    // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
    // and scriptDirectory will correctly be replaced with an empty string.
    // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
    // they are removed because they could contain a slash.
    if (scriptDirectory.startsWith('blob:')) {
      scriptDirectory = '';
    } else {
      scriptDirectory = scriptDirectory.slice(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1);
    }
    if (!((typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' || typeof WorkerGlobalScope != 'undefined')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');
    {
      // include: web_or_worker_shell_read.js
      if (ENVIRONMENT_IS_WORKER) {
        readBinary = function readBinary(url) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.responseType = 'arraybuffer';
          xhr.send(null);
          return new Uint8Array(/** @type{!ArrayBuffer} */xhr.response);
        };
      }
      readAsync = /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(url) {
          var response;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (!isFileURI(url)) {
                  _context2.next = 2;
                  break;
                }
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  var xhr = new XMLHttpRequest();
                  xhr.open('GET', url, true);
                  xhr.responseType = 'arraybuffer';
                  xhr.onload = function () {
                    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                      // file URLs can return 0
                      resolve(xhr.response);
                      return;
                    }
                    reject(xhr.status);
                  };
                  xhr.onerror = reject;
                  xhr.send(null);
                }));
              case 2:
                _context2.next = 4;
                return fetch(url, {
                  credentials: 'same-origin'
                });
              case 4:
                response = _context2.sent;
                if (!response.ok) {
                  _context2.next = 7;
                  break;
                }
                return _context2.abrupt("return", response.arrayBuffer());
              case 7:
                throw new Error(response.status + ' : ' + response.url);
              case 8:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        return function readAsync(_x2) {
          return _ref2.apply(this, arguments);
        };
      }();
      // end include: web_or_worker_shell_read.js
    }
  } else {
    throw new Error('environment detection error');
  }
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];
legacyModuleProp('arguments', 'arguments_');
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
legacyModuleProp('thisProgram', 'thisProgram');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('asm', 'wasmExports');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';
var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';
var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';
var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';
assert(!ENVIRONMENT_IS_SHELL, 'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.');

// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary = Module['wasmBinary'];
legacyModuleProp('wasmBinary', 'wasmBinary');

// include: wasm2js.js
// wasm2js.js - enough of a polyfill for the WebAssembly object so that we can load
// wasm2js code that way.

// Emit "var WebAssembly" if definitely using wasm2js. Otherwise, in MAYBE_WASM2JS
// mode, we can't use a "var" since it would prevent normal wasm from working.
/** @suppress{duplicate, const} */
var WebAssembly = {
  // Note that we do not use closure quoting (this['buffer'], etc.) on these
  // functions, as they are just meant for internal use. In other words, this is
  // not a fully general polyfill.
  /** @constructor */
  Memory: function Memory(opts) {
    this.buffer = new ArrayBuffer(opts['initial'] * 65536);
  },
  Module: function Module(binary) {
    // TODO: use the binary and info somehow - right now the wasm2js output is embedded in
    // the main JS
  },
  /** @constructor */
  Instance: function Instance(module, info) {
    // TODO: use the module somehow - right now the wasm2js output is embedded in
    // the main JS
    // This will be replaced by the actual wasm2js code.
    this.exports = (
function instantiate(info) {
function Table(ret) {
  // grow method not included; table is not growable
  ret.set = function(i, func) {
    this[i] = func;
  };
  ret.get = function(i) {
    return this[i];
  };
  return ret;
}

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
    return uint8Array;
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 8388608, "TSFLIQAAAAAEAAAATS5LLgAAAAAEAAAATSZLIQAAAAAEAAAAUEFUVAAAAAAEAAAATlNNUwAAAAAEAAAATEFSRAAAAAAEAAAARkVTVAAAAAAEAAAARklTVAAAAAAEAAAATi5ULgAAAAAEAAAAT0tUQQAAAAAIAAAAT0NUQQAAAAAIAAAAJENITgAAAAD/////JCRDSAAAAAD/////JCRDTgAAAAD/////JCQkQwAAAAD/////RkxUJAAAAAD/////RVhPJAAAAAD/////Q0QkMQAAAAD/////VERaJAAAAAD/////RkEwJAAAAAD/////AAAAAAAAAAAAAAAAAAAAAEABgABgAoAAgAOAAKAEgADABYAA4AaAAAAIgAAgCYAAQAqAAGALgACADIAAoA2AAMAOgADgD4AAABGAACASgAAAawBlQF8AWsBUAFCAS0BHQEOAPwA8oDiANYAyoC8ALWAqACjAJaAjniHAHwAeUBzAGkAZ0BeAFjAVABTgEtAR0BDgDwAPKA5gDaAM6AtAC5gKAApwCegIaAjwB4AHFAewBlAG9AWgBUwFAAW4BHQENAT4A8ADigNYAygD+gLQAqYCgAJcAjoCGgL8AeABxQGsAZQBfQFoAVMBQAEuAR0BDQH+APAA4gDWAMoAvgC0AKoAoACXAI8AhwB/AHgAcQBrAGUAXwBaAFUAUABLAEcAQwA/ADwAOAA1ADIALwAtACoAKAAlACMAIQAfAB4AHAAbABkAGAAWABUAFAATABIAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwA7akZkkV5aWSRUbU/1Sr1GxEILP5E7ODgdNSMySC+tLBIqtid6JV4jYCGGH8kdHByPGhEZpBdXFgkV2xO9Eq8RsRDDD+QODg5HDYkM0gsrC4QK7glfCdgIWQjhB3IHBwekBkQG6QWWBUIF9wSvBGwELATxA7kDgwNSAyID9QLLAqECewJYAjYCFgL4Ad0BwgGpAZEBegFlAVEBPgEsARsBCwH8AO4A4ADUAMkAvQCzAKkAnwCWAI4AhgB+AHcAcABqAGQAXgBZAFQATwBKAEYAQwA/ADwAOAA1ADIALwAtACoAKAAlACMAIQAfAB4AHAAbABkAGAAWABUAFAATABIAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwB3aY1j4l22WIlT2k5rSjpGSUKXPiQ70De8NMcx8S5bLMQpbSc1JR0jIyFLH5Id6BteGuMYeRctFuIUtxObEo8RkhCmD8kO9A0vDXIMvAsXC3EK2wlNCccISQjTB2QH+gaXBjkG3gWLBTkF7gSnBGQEJQTpA7IDfQNMAxwD7wLGApwCdwJTAjICEgL1AdkBvwGmAY4BeAFjAU4BOwEqARkBCQH6AO0A3wDTAMcAuwCxAKgAngCVAI0AhQB9AHYAbwBpAGQAXgBZAFQATwBKAEYAQgA+ADsANwA0ADEALgAsACkAJwAkACIAIQAfAB4AHAAbABkAGAAWABUAFAATABIAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwC1aNZiNl0SWO9SSU7iSblFz0EkPrc6aTdbNGsxmy4JLHgpJSfxJN0i5iASH1sdtRstGrUYTRcFFrwUkhN4Em4RdBCJD64O2g0XDVsMpwsCC14KyQk8CbcIOgjEB1cH7QaLBi0G0wWBBS8F5QSeBFwEHQTiA6sDdwNGAxcD6gLBApcCcgJPAi4CDgLxAdYBuwGjAYsBdQFgAUwBOQEoARcBBwH5AOsA3QDRAMYAugCwAKYAnQCUAIwAhAB8AHUAbwBpAGMAXQBYAFMATgBJAEUAQgA+ADsANwA0ADEALgAsACkAJwAkACIAIAAeAB0AGwAaABgAFwAWABUAFAATABIAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwD0ZyBiilxwV1ZSuU1aSTlFVkGxPUs6Azf6MxAxRS64Kysp3CatJJwiqSDZHiUdghv9GYgYIhfcFZYUbhNWEk4RVRBsD5MOwQ3/DEQMkQvuCksKtwkrCacIKwi2B0kH4AZ/BiIGyQV3BSUF3ASWBFQEFQTbA6UDcANAAxED5AK8ApMCbgJLAioCCwLuAdIBuAGgAYgBcgFeAUkBNwElARUBBQH3AOkA3ADQAMQAuQCvAKUAmwCTAIsAgwB7AHUAbgBoAGIAXABXAFMATgBJAEUAQQA9ADoANgAzADEALgAsACkAJwAkACIAIAAeAB0AGwAaABgAFwAVABQAEwASABEAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwA1Z2th31vPVr9RKk3TSLlE3kBAPd85njaaM7Yw8C1oK98olSZpJF0ibSCgHvAcTxvNGVsY+Ba0FXAUShM1Ei4RNxBQD3gOqA3nDC0MfAvaCjgKpQkaCZcIHAioBzwH1AZzBhcGvgVtBRwF0wSNBEwEDgTUA54DagM6AwsD3wK2Ao4CaQJHAiYCBwLqAc8BtQGdAYYBbwFbAUcBNQEjARMBAwH1AOcA2gDOAMMAtwCuAKQAmgCSAIoAggB6AHQAbQBnAGEAXABXAFIATQBIAEQAQQA9ADoANgAzADAALQArACkAJwAkACIAIAAeAB0AGwAaABgAFwAVABQAEwASABEAEAAPAA4ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwB3ZrhgNlsvVihRnExNSDtEZkDPPHU5OTY7M1wwmy0YK5QoTiYmJB0iMSBnHrocHRueGS4YzhaMFUoUJxMTEg8RGhA0D10Ojg3PDBcMZwvGCiUKkwkKCYcIDQiaBy8HxwZnBgsGswVjBRMFygSFBEQEBgTNA5cDZAM0AwYD2gKxAokCZQJCAiICAwLmAcwBsgGaAYMBbQFZAUUBMgEhAREBAgHzAOYA2ADNAMEAtgCsAKMAmQCRAIkAgQB6AHMAbABmAGEAWwBWAFEATQBIAEQAQAA8ADkANgAzADAALQArACgAJgAjACIAIAAeAB0AGwAaABgAFwAVABQAEwASABEAEAAPAA4ADQAMAAwACwALAAsACgAJAAkACAAIAAcABwC6ZQZgjlqQVZNQD0zHR71D7z9fPAs51jXdMgMwRy3IKkkoBybkI98h9h8vHoUc6xpuGQEYpBZkFSUUBBPyEe8Q/A8YD0MOdQ23DAEMUguyChIKggn5CHgI/geMByEHuwZcBgAGqQVZBQkFwQR8BDwE/wPGA5EDXQMuAwAD1AKtAoUCYAI+Ah4C/wHjAcgBrwGXAYABagFWAUIBMAEfAQ8BAAHxAOQA1wDLAMAAtQCrAKIAmACQAIgAgAB5AHIAawBmAGAAWgBWAFEATABHAEQAQAA8ADkANQAyADAALQArACgAJgAjACEAHwAdAB0AGwAaABgAFwAVABQAEwASABEAEAAPAA4ADQAMAAwACwAKAAoACgAJAAkACAAIAAcABwBdcQFr6mRaX8pZwlT9T31LQEdHQ5E//juuOIE1dTKtL+UsYSr/J74lniOjIckf/x1XHMAaOhnXF3MWMBX/E98S0BHSEOQP/w4sDmANnQzrCzkLmAoACnAJ6AhpCPIHgAcWB7AGTwb2BZ0FTAUABbgEdAQ0BPkDwAOLA1gDJwP7As4CpgKAAlwCOgIaAv0B4AHFAawBlAF9AWcBUwFAAS4BHQENAf4A7wDjANYAyQC/ALQAqgCgAJgAjwCHAH8AeABxAGsAZQBfAFoAVQBPAEsARwBDAEAAOwA4ADUAMgAwACwAKgAnACUAIwAhACAAHgAdABoAGQAXABYAFQAUABMAEgARABAADwAOAA4ADQAMAAwACwAKAAoACAAIAAcABwCMcDxqMGSqXiVZJlRqT/JKvEbLQhw/jztGOB41GDJVL5IsEyq1J3klXCNlIY4fyB0jHI8aDBmrF0kWCRXaE7wSrxGzEMcP5A4SDkgNhgzVCyULhQrtCV4J2AhZCOQHcgcJB6QGQwbrBZIFQgX3BK8EbAQtBPIDuQOEA1IDIgP1AskCoQJ7AlgCNgIWAvkB3AHCAakBkQF7AWUBUQE+ASwBGwELAfwA7gDhANQAyAC9ALMAqACfAJYAjgCGAH4AdwBxAGoAZABfAFkAVABPAEsARgBCAD8AOwA4ADUAMQAvACwAKgAnACUAIwAhACAAHQAcABoAGQAXABYAFQAUABMAEgARABAADwAOAA4ADQAMAAwACwAJAAkACAAIAAcABwC9b3lpeGP8XYFYi1PYTmhKOkZQQqg+IjveN7w0vDH+LkAsxSlsJzQlGyMoIVQfkR3vG14a3hh/FyAW4xS2E5oSjxGUEKoPyA74DS8NbwzACxALcQrbCU0JxwhKCNUHZAf8BpgGNwbgBYgFOQXtBKYEZAQlBOsDsgN+A0wDHAPwAsQCnAJ3AlMCMgISAvUB2QG/AaYBjgF4AWIBTgE7ASoBGQEJAfsA7ADfANMAxgC8ALIApwCeAJUAjQCFAH0AdgBwAGkAYwBeAFkAVABOAEoARgBCAD8AOgA3ADQAMQAvACwAKgAnACUAIgAgAB8AHQAcABoAGQAXABYAFQAUABMAEgARABAADwAOAA4ADQALAAsACgAJAAkACAAIAAcABwDvbrZowGJPXd5X8VJHTt9JuUXWQTU+tTp3N1s0YDGnLu8reCkjJ+8k2iLrIBofWh28Gy4asBhUF/cVvBSSE3gSbhF1EI0PrQ7eDRcNWAyqC/wKXgrJCTwJtwg7CMcHVwfvBosGLAbVBX4FLwXkBJ4EXAQdBOMDqwN3A0YDFgPqAr8CmAJyAk8CLgIPAvIB1gG8AaMBiwF1AV8BTAE5AScBFwEHAfkA6gDeANEAxQC7ALAApgCdAJQAjACEAHwAdQBvAGkAYgBdAFgAUwBOAEoARQBBAD4AOgA3ADQAMQAvACwAKQAmACQAIgAgAB8AHQAcABoAGQAXABYAFQAUABMAEgARABAADwANAA0ADAALAAsACgAJAAkACAAIAAcABwAjbvZnC2KjXDxXWFK2TVZJOEVcQcI9SToRN/szBTFSLp4rLCnbJqskmiKuIOEeJB2JG/0ZgxgpF88VlhRuE1YSThFXEHEPkg7EDf8MQQyUC+cKSwq3CSsJpwgsCLgHSQfiBn8GIQbKBXQFJgXbBJUEVAQWBNwDpQNxA0ADEAPlAroCkwJuAksCKgILAu4B0gG5AaABiAFzAV0BSQE3ASUBFQEFAfcA6QDcANAAxAC5AK8ApQCbAJMAiwCDAHwAdABuAGgAYgBdAFcAUgBNAEkARQBBAD4AOgA3ADMAMAAuACsAKQAmACQAIgAgAB8AHQAcABoAGQAXABYAFQAUABMAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwBYbTZnVmH5W5tWwFEnTc9IuUTkQFA93TmsNpszqzD8LU4r4CiUJmgkWiJyIKge7xxWG84ZVRj+FqcVcBRKEzQSLhE5EFQPdw6rDecMKwx/C9MKOAqlCRoJlwgcCKoHPAfVBnMGFQbABWoFHAXSBI0ETAQOBNUDngNrAzoDCwPgArUCjgJpAkYCJgIHAusBzwG1AZ0BhQFwAVoBRwE1ASMBEwEEAfUA5wDbAM4AwgC4AK4ApACaAJIAigCCAHsAcwBtAGcAYQBcAFcAUgBNAEkARABAAD0AOQA2ADMAMAAuACsAKQAmACQAIgAgAB8AHQAcABoAGQAWABUAFAATABIAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwCObHhmo2BPW/xVKlGZTElIOkRsQN88czlHNjwzUTCoLf4qlShNJiUkGyI2IHAeuRwkG54ZKRjUFn8VShQmExISDxEbEDgPXQ6SDc8MFAxqC78KJQqTCQkJhwgOCJwHLgfJBmgGCga1BWAFEwXKBIUERAQHBM4DlwNkAzQDBQPaArACiQJlAkICIgIDAucBzAGyAZoBgwFtAVgBRQEyASEBEQECAfMA5QDZAM0AwQC3AKwAogCZAJEAiQCBAHoAcwBtAGYAYABbAFYAUQBMAEgARABAAD0AOQA2ADMAMAAuACsAKQAmACQAIQAfAB4AHAAbABkAGAAWABUAFAATABIAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwDGa7tl8V+nWl1VlFAMTMRHvUP2P288CTnjNd4y+C9TLa8qSigGJuIj3CH7HzgehRzyGm8Z/BeqFlcVJRQDE/ER7xD9DxwPQg55DbcM/gtVC6wKEwqCCfkIeAj/B44HIQe8BlwG/wWqBVYFCQXBBHwEPAT/A8cDkQNeAy4DAAPVAqsChQJgAj4CHgIAAuMByAGvAZcBgAFrAVUBQgEwAR8BDwEAAfIA5ADYAMsAvwC1AKsAoQCYAJAAiACAAHkAcgBsAGYAYABbAFYAUQBMAEgAQwA/ADwAOAA1ADIALwAtACoAKAAlACMAIQAfAB4AHAAbABkAGAAWABUAFAATABIAEQAQAA8ADgANAA0ADAALAAsACgAJAAkACAAIAAcABwAABQYHCAoLDRATFhogK0CAAAAYADEASgBhAHgAjQChALQAxQDUAOAA6wD0APoA/QD/AP0A+gD0AOsA4ADUAMUAtAChAI0AeABhAEoAMQAYAE5vIGVycm9yIGluZm9ybWF0aW9uAElsbGVnYWwgYnl0ZSBzZXF1ZW5jZQBEb21haW4gZXJyb3IAUmVzdWx0IG5vdCByZXByZXNlbnRhYmxlAE5vdCBhIHR0eQBQZXJtaXNzaW9uIGRlbmllZABPcGVyYXRpb24gbm90IHBlcm1pdHRlZABObyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5AE5vIHN1Y2ggcHJvY2VzcwBGaWxlIGV4aXN0cwBWYWx1ZSB0b28gbGFyZ2UgZm9yIGRhdGEgdHlwZQBObyBzcGFjZSBsZWZ0IG9uIGRldmljZQBPdXQgb2YgbWVtb3J5AFJlc291cmNlIGJ1c3kASW50ZXJydXB0ZWQgc3lzdGVtIGNhbGwAUmVzb3VyY2UgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUASW52YWxpZCBzZWVrAENyb3NzLWRldmljZSBsaW5rAFJlYWQtb25seSBmaWxlIHN5c3RlbQBEaXJlY3Rvcnkgbm90IGVtcHR5AENvbm5lY3Rpb24gcmVzZXQgYnkgcGVlcgBPcGVyYXRpb24gdGltZWQgb3V0AENvbm5lY3Rpb24gcmVmdXNlZABIb3N0IGlzIGRvd24ASG9zdCBpcyB1bnJlYWNoYWJsZQBBZGRyZXNzIGluIHVzZQBCcm9rZW4gcGlwZQBJL08gZXJyb3IATm8gc3VjaCBkZXZpY2Ugb3IgYWRkcmVzcwBCbG9jayBkZXZpY2UgcmVxdWlyZWQATm8gc3VjaCBkZXZpY2UATm90IGEgZGlyZWN0b3J5AElzIGEgZGlyZWN0b3J5AFRleHQgZmlsZSBidXN5AEV4ZWMgZm9ybWF0IGVycm9yAEludmFsaWQgYXJndW1lbnQAQXJndW1lbnQgbGlzdCB0b28gbG9uZwBTeW1ib2xpYyBsaW5rIGxvb3AARmlsZW5hbWUgdG9vIGxvbmcAVG9vIG1hbnkgb3BlbiBmaWxlcyBpbiBzeXN0ZW0ATm8gZmlsZSBkZXNjcmlwdG9ycyBhdmFpbGFibGUAQmFkIGZpbGUgZGVzY3JpcHRvcgBObyBjaGlsZCBwcm9jZXNzAEJhZCBhZGRyZXNzAEZpbGUgdG9vIGxhcmdlAFRvbyBtYW55IGxpbmtzAE5vIGxvY2tzIGF2YWlsYWJsZQBSZXNvdXJjZSBkZWFkbG9jayB3b3VsZCBvY2N1cgBTdGF0ZSBub3QgcmVjb3ZlcmFibGUAUHJldmlvdXMgb3duZXIgZGllZABPcGVyYXRpb24gY2FuY2VsZWQARnVuY3Rpb24gbm90IGltcGxlbWVudGVkAE5vIG1lc3NhZ2Ugb2YgZGVzaXJlZCB0eXBlAElkZW50aWZpZXIgcmVtb3ZlZABEZXZpY2Ugbm90IGEgc3RyZWFtAE5vIGRhdGEgYXZhaWxhYmxlAERldmljZSB0aW1lb3V0AE91dCBvZiBzdHJlYW1zIHJlc291cmNlcwBMaW5rIGhhcyBiZWVuIHNldmVyZWQAUHJvdG9jb2wgZXJyb3IAQmFkIG1lc3NhZ2UARmlsZSBkZXNjcmlwdG9yIGluIGJhZCBzdGF0ZQBOb3QgYSBzb2NrZXQARGVzdGluYXRpb24gYWRkcmVzcyByZXF1aXJlZABNZXNzYWdlIHRvbyBsYXJnZQBQcm90b2NvbCB3cm9uZyB0eXBlIGZvciBzb2NrZXQAUHJvdG9jb2wgbm90IGF2YWlsYWJsZQBQcm90b2NvbCBub3Qgc3VwcG9ydGVkAFNvY2tldCB0eXBlIG5vdCBzdXBwb3J0ZWQATm90IHN1cHBvcnRlZABQcm90b2NvbCBmYW1pbHkgbm90IHN1cHBvcnRlZABBZGRyZXNzIGZhbWlseSBub3Qgc3VwcG9ydGVkIGJ5IHByb3RvY29sAEFkZHJlc3Mgbm90IGF2YWlsYWJsZQBOZXR3b3JrIGlzIGRvd24ATmV0d29yayB1bnJlYWNoYWJsZQBDb25uZWN0aW9uIHJlc2V0IGJ5IG5ldHdvcmsAQ29ubmVjdGlvbiBhYm9ydGVkAE5vIGJ1ZmZlciBzcGFjZSBhdmFpbGFibGUAU29ja2V0IGlzIGNvbm5lY3RlZABTb2NrZXQgbm90IGNvbm5lY3RlZABDYW5ub3Qgc2VuZCBhZnRlciBzb2NrZXQgc2h1dGRvd24AT3BlcmF0aW9uIGFscmVhZHkgaW4gcHJvZ3Jlc3MAT3BlcmF0aW9uIGluIHByb2dyZXNzAFN0YWxlIGZpbGUgaGFuZGxlAFJlbW90ZSBJL08gZXJyb3IAUXVvdGEgZXhjZWVkZWQATm8gbWVkaXVtIGZvdW5kAFdyb25nIG1lZGl1bSB0eXBlAE11bHRpaG9wIGF0dGVtcHRlZABSZXF1aXJlZCBrZXkgbm90IGF2YWlsYWJsZQBLZXkgaGFzIGV4cGlyZWQAS2V5IGhhcyBiZWVuIHJldm9rZWQAS2V5IHdhcyByZWplY3RlZCBieSBzZXJ2aWNlAAAAAAAAAAAApQJbAPABtQWMBSUBgwYdA5QE/wDHAzEDCwa8AY8BfwPKBCsA2gavAEIDTgPcAQ4EFQChBg0BlAILAjgGZAK8Av8CXQPnBAsHzwLLBe8F2wXhAh4GRQKFAIICbANvBPEA8wMYBdkA2gNMBlQCewGdA70EAABRABUCuwCzA20A/wGFBC8F+QQ4AGUBRgGfALcGqAFzAlMBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIQQAAAAAAAAAAC8CAAAAAAAAAAAAAAAAAAAAAAAAAAA1BEcEVgQAAAAAAAAAAAAAAAAAAAAAoAQAAAAAAAAAAAAAAAAAAAAAAABGBWAFbgVhBgAAzwEAAAAAAAAAAMkG6Qb5Bh4HOQdJB14H");
  base64DecodeToExistingUint8Array(bufferView, 8395848, "BQAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAMAAADsHIAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAP//////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASByAAPAegAA=");
}
function wasm2js_trap() { throw new Error('abort'); }

function asmFunc(imports) {
 var buffer = new ArrayBuffer(25231360);
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var env = imports.env;
 var fimport$0 = env._abort_js;
 var wasi_snapshot_preview1 = imports.wasi_snapshot_preview1;
 var fimport$1 = wasi_snapshot_preview1.fd_close;
 var fimport$2 = wasi_snapshot_preview1.fd_write;
 var fimport$3 = env.emscripten_resize_heap;
 var fimport$4 = wasi_snapshot_preview1.fd_seek;
 var global$0 = 8388608;
 var global$1 = 0;
 var global$2 = 0;
 var global$3 = 0;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0() {
  $34();
 }
 
 function $1($0_1) {
  $0_1 = $0_1 | 0;
  block : {
   if ($0_1) {
    break block
   }
   return 0 | 0;
  }
  block1 : {
   if (!101668) {
    break block1
   }
   $46($0_1 | 0, 0 | 0, 101668 | 0);
  }
  HEAP32[($0_1 + 101668 | 0) >> 2] = 65537;
  HEAP32[($0_1 + 101672 | 0) >> 2] = 65552;
  HEAP32[($0_1 + 1724 | 0) >> 2] = 44100;
  return 1 | 0;
 }
 
 function $2($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  block : {
   if ($0_1) {
    break block
   }
   return 0 | 0;
  }
  HEAP32[($0_1 + 1724 | 0) >> 2] = $1_1;
  block1 : {
   if (($2_1 | 0) > (3 | 0)) {
    break block1
   }
   HEAP16[($0_1 + 101670 | 0) >> 1] = $2_1;
  }
  HEAP16[($0_1 + 101674 | 0) >> 1] = ($3_1 | 0) != (0 | 0);
  return 1 | 0;
 }
 
 function $3($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $12_1 = 0, $13_1 = 0, $9_1 = 0, $10_1 = 0, $17_1 = 0, $11_1 = 0, $5_1 = 0, $4_1 = 0, $18_1 = 0, $6_1 = 0, $7_1 = 0, $14_1 = 0, $15_1 = 0, $16_1 = 0, $19_1 = 0, $8_1 = 0;
  $3_1 = 0;
  block : {
   if (!$0_1) {
    break block
   }
   if (!$1_1) {
    break block
   }
   $4_1 = $1_1 + $2_1 | 0;
   label : while (1) {
    HEAP8[($0_1 + $3_1 | 0) >> 0] = HEAPU8[($1_1 + $3_1 | 0) >> 0] | 0;
    $2_1 = $3_1 | 1 | 0;
    HEAP8[($0_1 + $2_1 | 0) >> 0] = HEAPU8[($1_1 + $2_1 | 0) >> 0] | 0;
    $2_1 = $3_1 | 2 | 0;
    HEAP8[($0_1 + $2_1 | 0) >> 0] = HEAPU8[($1_1 + $2_1 | 0) >> 0] | 0;
    $2_1 = $3_1 | 3 | 0;
    HEAP8[($0_1 + $2_1 | 0) >> 0] = HEAPU8[($1_1 + $2_1 | 0) >> 0] | 0;
    $3_1 = $3_1 + 4 | 0;
    if (($3_1 | 0) != (1084 | 0)) {
     continue label
    }
    break label;
   };
   $2_1 = 0;
   HEAP16[($0_1 + 101660 | 0) >> 1] = 0;
   $5_1 = 4;
   $6_1 = HEAPU8[($0_1 + 1080 | 0) >> 0] | 0;
   $7_1 = $6_1 + -48 | 0;
   $8_1 = ($7_1 & 255 | 0) >>> 0 > 9 >>> 0;
   $3_1 = 8388608;
   block17 : {
    block15 : {
     block14 : {
      label1 : while (1) {
       $9_1 = HEAPU8[($3_1 + 1 | 0) >> 0] | 0;
       $10_1 = HEAPU8[($3_1 + 2 | 0) >> 0] | 0;
       $11_1 = HEAPU8[($3_1 + 3 | 0) >> 0] | 0;
       block2 : {
        block1 : {
         $3_1 = HEAPU8[$3_1 >> 0] | 0;
         $12_1 = ($3_1 | 0) == (36 | 0);
         if ($12_1) {
          break block1
         }
         $13_1 = 0;
         if (($3_1 | 0) != ($6_1 | 0)) {
          break block2
         }
        }
        $14_1 = ($9_1 | 0) == (36 | 0);
        $13_1 = $14_1 ? ($12_1 ? 10 : 1) : $12_1;
        $15_1 = ($10_1 | 0) == (36 | 0);
        $13_1 = $15_1 ? ($13_1 ? Math_imul($13_1, 10) : 1) : $13_1;
        $16_1 = ($11_1 | 0) == (36 | 0);
        $12_1 = $16_1 ? ($13_1 ? Math_imul($13_1, 10) : 1) : $13_1;
        $13_1 = 0;
        block4 : {
         block3 : {
          if (($3_1 | 0) == (36 | 0)) {
           break block3
          }
          $17_1 = 0;
          break block4;
         }
         if ($8_1) {
          break block2
         }
         $17_1 = Math_imul($7_1, $12_1);
         $12_1 = (($12_1 & 65535 | 0) >>> 0) / (10 >>> 0) | 0;
        }
        $3_1 = HEAPU8[($0_1 + 1081 | 0) >> 0] | 0;
        block5 : {
         if ($14_1) {
          break block5
         }
         if (($9_1 | 0) != ($3_1 & 255 | 0 | 0)) {
          break block2
         }
        }
        block7 : {
         block6 : {
          if (($9_1 | 0) == (36 | 0)) {
           break block6
          }
          $9_1 = $12_1;
          break block7;
         }
         if ((($3_1 + -48 | 0) & 255 | 0) >>> 0 > 9 >>> 0) {
          break block2
         }
         $9_1 = (($12_1 & 65535 | 0) >>> 0) / (10 >>> 0) | 0;
         $17_1 = $17_1 + Math_imul(($3_1 & 255 | 0) + -48 | 0, $12_1) | 0;
        }
        $3_1 = HEAPU8[($0_1 + 1082 | 0) >> 0] | 0;
        block8 : {
         if ($15_1) {
          break block8
         }
         if (($10_1 | 0) != ($3_1 & 255 | 0 | 0)) {
          break block2
         }
        }
        block10 : {
         block9 : {
          if (($10_1 | 0) == (36 | 0)) {
           break block9
          }
          $12_1 = $9_1;
          break block10;
         }
         if ((($3_1 + -48 | 0) & 255 | 0) >>> 0 > 9 >>> 0) {
          break block2
         }
         $12_1 = (($9_1 & 65535 | 0) >>> 0) / (10 >>> 0) | 0;
         $17_1 = $17_1 + Math_imul(($3_1 & 255 | 0) + -48 | 0, $9_1) | 0;
        }
        $3_1 = HEAPU8[($0_1 + 1083 | 0) >> 0] | 0;
        block11 : {
         if ($16_1) {
          break block11
         }
         if (($11_1 | 0) != ($3_1 & 255 | 0 | 0)) {
          break block2
         }
        }
        block12 : {
         if (($11_1 | 0) != (36 | 0)) {
          break block12
         }
         if ((($3_1 + -48 | 0) & 255 | 0) >>> 0 > 9 >>> 0) {
          break block2
         }
         $17_1 = $17_1 + Math_imul(($3_1 & 255 | 0) + -48 | 0, $12_1) | 0;
        }
        $13_1 = $17_1 & 65535 | 0 ? $17_1 : $5_1;
       }
       block13 : {
        $2_1 = $2_1 + 1 | 0;
        if (($2_1 | 0) == (20 | 0)) {
         break block13
        }
        $12_1 = Math_imul($2_1, 12);
        $3_1 = $12_1 + 8388608 | 0;
        $5_1 = HEAP32[($12_1 + 8388616 | 0) >> 2] | 0;
        if ($13_1 & 65535 | 0) {
         break block14
        }
        continue label1;
       }
       break label1;
      };
      HEAP16[($0_1 + 101660 | 0) >> 1] = $13_1;
      if ($13_1 & 65535 | 0) {
       break block15
      }
      $18_1 = 776678989;
      HEAP8[($0_1 + 1080 | 0) >> 0] = $18_1;
      HEAP8[($0_1 + 1081 | 0) >> 0] = $18_1 >>> 8 | 0;
      HEAP8[($0_1 + 1082 | 0) >> 0] = $18_1 >>> 16 | 0;
      HEAP8[($0_1 + 1083 | 0) >> 0] = $18_1 >>> 24 | 0;
      $2_1 = $0_1 + 470 | 0;
      $13_1 = $0_1 + 950 | 0;
      $3_1 = 0;
      label2 : while (1) {
       HEAP8[($13_1 + $3_1 | 0) >> 0] = HEAPU8[($2_1 + $3_1 | 0) >> 0] | 0;
       $12_1 = $3_1 + 1 | 0;
       HEAP8[($13_1 + $12_1 | 0) >> 0] = HEAPU8[($2_1 + $12_1 | 0) >> 0] | 0;
       $12_1 = $3_1 + 2 | 0;
       HEAP8[($13_1 + $12_1 | 0) >> 0] = HEAPU8[($2_1 + $12_1 | 0) >> 0] | 0;
       $12_1 = $3_1 + 3 | 0;
       HEAP8[($13_1 + $12_1 | 0) >> 0] = HEAPU8[($2_1 + $12_1 | 0) >> 0] | 0;
       $12_1 = $3_1 + 4 | 0;
       HEAP8[($13_1 + $12_1 | 0) >> 0] = HEAPU8[($2_1 + $12_1 | 0) >> 0] | 0;
       $3_1 = $3_1 + 5 | 0;
       if (($3_1 | 0) != (130 | 0)) {
        continue label2
       }
       break label2;
      };
      block16 : {
       if (!480) {
        break block16
       }
       $46($2_1 | 0, 0 | 0, 480 | 0);
      }
      $13_1 = 4;
      HEAP16[($0_1 + 101660 | 0) >> 1] = 4;
      $1_1 = $1_1 + 600 | 0;
      break block17;
     }
     HEAP16[($0_1 + 101660 | 0) >> 1] = $13_1;
    }
    $1_1 = $1_1 + 1084 | 0;
   }
   $3_1 = 0;
   if (($13_1 & 65535 | 0) >>> 0 > 999 >>> 0) {
    break block
   }
   if ($1_1 >>> 0 >= $4_1 >>> 0) {
    break block
   }
   $2_1 = $0_1 + 1212 | 0;
   $11_1 = $0_1 + 952 | 0;
   $5_1 = $13_1 & 65535 | 0;
   $12_1 = $5_1 << 8 | 0;
   $10_1 = 0;
   $3_1 = 0;
   label5 : while (1) {
    $3_1 = $3_1 & 65535 | 0;
    $9_1 = $11_1 + $10_1 | 0;
    block18 : {
     label3 : while (1) {
      if ($3_1 >>> 0 > (HEAPU8[$9_1 >> 0] | 0) >>> 0) {
       break block18
      }
      HEAP32[($2_1 + ($3_1 << 2 | 0) | 0) >> 2] = $1_1;
      $3_1 = $3_1 + 1 | 0;
      $1_1 = $1_1 + $12_1 | 0;
      if ($1_1 >>> 0 < $4_1 >>> 0) {
       continue label3
      }
      break label3;
     };
     return 0 | 0;
    }
    $3_1 = $3_1 & 65535 | 0;
    $9_1 = $9_1 + 1 | 0;
    block19 : {
     label4 : while (1) {
      if ($3_1 >>> 0 > (HEAPU8[$9_1 >> 0] | 0) >>> 0) {
       break block19
      }
      HEAP32[($2_1 + ($3_1 << 2 | 0) | 0) >> 2] = $1_1;
      $3_1 = $3_1 + 1 | 0;
      $1_1 = $1_1 + $12_1 | 0;
      if ($1_1 >>> 0 < $4_1 >>> 0) {
       continue label4
      }
      break label4;
     };
     return 0 | 0;
    }
    $10_1 = $10_1 + 2 | 0;
    if (($10_1 | 0) != (128 | 0)) {
     continue label5
    }
    break label5;
   };
   $11_1 = $0_1 + 1088 | 0;
   $2_1 = 0;
   block20 : {
    if (!124) {
     break block20
    }
    $46($11_1 | 0, 0 | 0, 124 | 0);
   }
   $3_1 = $0_1 + 20 | 0;
   label6 : while (1) {
    block21 : {
     $12_1 = HEAPU8[($3_1 + 22 | 0) >> 0] | 0 | ((HEAPU8[($3_1 + 23 | 0) >> 0] | 0) << 8 | 0) | 0;
     if (!$12_1) {
      break block21
     }
     HEAP32[($11_1 + ($2_1 << 2 | 0) | 0) >> 2] = $1_1;
     $12_1 = ($12_1 << 8 | 0 | ($12_1 >>> 8 | 0) | 0) & 65535 | 0;
     $1_1 = $1_1 + ($12_1 << 1 | 0) | 0;
     block22 : {
      $9_1 = HEAPU8[($3_1 + 26 | 0) >> 0] | 0 | ((HEAPU8[($3_1 + 27 | 0) >> 0] | 0) << 8 | 0) | 0;
      $10_1 = ($9_1 << 8 | 0 | ($9_1 >>> 8 | 0) | 0) & 65535 | 0;
      $9_1 = HEAPU8[($3_1 + 28 | 0) >> 0] | 0 | ((HEAPU8[($3_1 + 29 | 0) >> 0] | 0) << 8 | 0) | 0;
      if (($10_1 + (($9_1 << 8 | 0 | ($9_1 >>> 8 | 0) | 0) & 65535 | 0) | 0) >>> 0 <= $12_1 >>> 0) {
       break block22
      }
      $12_1 = $12_1 - $10_1 | 0;
      $19_1 = $12_1 >>> 8 | 0 | ($12_1 << 8 | 0) | 0;
      HEAP8[($3_1 + 28 | 0) >> 0] = $19_1;
      HEAP8[($3_1 + 29 | 0) >> 0] = $19_1 >>> 8 | 0;
     }
     if ($1_1 >>> 0 <= $4_1 >>> 0) {
      break block21
     }
     return 0 | 0;
    }
    $3_1 = $3_1 + 30 | 0;
    $2_1 = $2_1 + 1 | 0;
    if (($2_1 | 0) != (31 | 0)) {
     continue label6
    }
    break label6;
   };
   HEAP8[($0_1 + 1735 | 0) >> 0] = 125;
   HEAP8[($0_1 + 1084 | 0) >> 0] = 6;
   $2_1 = 0;
   HEAP32[($0_1 + 1728 | 0) >> 2] = 0;
   $3_1 = HEAP32[($0_1 + 1724 | 0) >> 2] | 0;
   $1_1 = (Math_imul($3_1, 5) >>> 0) / (250 >>> 0) | 0;
   HEAP32[($0_1 + 1748 | 0) >> 2] = $1_1;
   HEAP32[($0_1 + 1756 | 0) >> 2] = ((56750304 >>> 0) / ($3_1 >>> 0) | 0) << 6 | 0;
   $3_1 = Math_imul($1_1, 6);
   HEAP32[($0_1 + 1744 | 0) >> 2] = $3_1;
   HEAP32[($0_1 + 1736 | 0) >> 2] = $3_1 | 1 | 0;
   $9_1 = $5_1 & 3 | 0;
   $1_1 = $0_1 + 1760 | 0;
   $3_1 = 0;
   block23 : {
    if ((($13_1 + -1 | 0) & 65535 | 0) >>> 0 < 3 >>> 0) {
     break block23
    }
    $10_1 = $5_1 & 1020 | 0;
    $3_1 = 0;
    $13_1 = 0;
    label7 : while (1) {
     $12_1 = $1_1 + Math_imul($3_1, 100) | 0;
     HEAP16[($12_1 + 64 | 0) >> 1] = 0;
     HEAP8[($12_1 + 66 | 0) >> 0] = 0;
     $12_1 = $1_1 + Math_imul($3_1 | 1 | 0, 100) | 0;
     HEAP16[($12_1 + 64 | 0) >> 1] = 0;
     HEAP8[($12_1 + 66 | 0) >> 0] = 0;
     $12_1 = $1_1 + Math_imul($3_1 | 2 | 0, 100) | 0;
     HEAP16[($12_1 + 64 | 0) >> 1] = 0;
     HEAP8[($12_1 + 66 | 0) >> 0] = 0;
     $12_1 = $1_1 + Math_imul($3_1 | 3 | 0, 100) | 0;
     HEAP16[($12_1 + 64 | 0) >> 1] = 0;
     HEAP8[($12_1 + 66 | 0) >> 0] = 0;
     $3_1 = $3_1 + 4 | 0;
     $13_1 = $13_1 + 4 | 0;
     if (($13_1 | 0) != ($10_1 | 0)) {
      continue label7
     }
     break label7;
    };
   }
   block24 : {
    if (!$9_1) {
     break block24
    }
    label8 : while (1) {
     $13_1 = $1_1 + Math_imul($3_1, 100) | 0;
     HEAP16[($13_1 + 64 | 0) >> 1] = 0;
     HEAP8[($13_1 + 66 | 0) >> 0] = 0;
     $3_1 = $3_1 + 1 | 0;
     $2_1 = $2_1 + 1 | 0;
     if (($2_1 | 0) != ($9_1 | 0)) {
      continue label8
     }
     break label8;
    };
   }
   $3_1 = 1;
   HEAP16[($0_1 + 101662 | 0) >> 1] = 1;
  }
  return $3_1 | 0;
 }
 
 function $4($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0, $8_1 = 0, $7_1 = 0, $6_1 = 0, $5_1 = 0, $10_1 = 0, $28_1 = 0, $9_1 = 0, $29_1 = 0, $25_1 = 0, $30_1 = 0, $26_1 = 0, $23_1 = 0, $22_1 = 0, i64toi32_i32$0 = 0, $31_1 = 0, $32 = 0, $18_1 = 0, $19_1 = 0, $24_1 = 0, $13_1 = 0, $14_1 = 0, $15_1 = 0, $16_1 = 0, $34_1 = 0, $35_1 = 0, $36_1 = 0, $37_1 = 0, $11_1 = 0, $12_1 = 0, $17_1 = 0, $20_1 = 0, $21_1 = 0, $27_1 = 0;
  block : {
   if (!$0_1) {
    break block
   }
   if (!$1_1) {
    break block
   }
   block1 : {
    if (HEAPU16[($0_1 + 101662 | 0) >> 1] | 0) {
     break block1
    }
    block2 : {
     if (!$2_1) {
      break block2
     }
     $4_1 = $2_1 << 2 | 0;
     if (!$4_1) {
      break block2
     }
     $46($1_1 | 0, 0 | 0, $4_1 | 0);
    }
    if (!$3_1) {
     break block
    }
    HEAP8[($3_1 + 16 | 0) >> 0] = 0;
    i64toi32_i32$0 = 0;
    HEAP32[($3_1 + 4 | 0) >> 2] = 0;
    HEAP32[($3_1 + 8 | 0) >> 2] = i64toi32_i32$0;
    block3 : {
     $4_1 = Math_imul(HEAP32[$3_1 >> 2] | 0, 10020);
     if (!$4_1) {
      break block3
     }
     if (!$4_1) {
      break block3
     }
     $46(HEAP32[($3_1 + 948 | 0) >> 2] | 0 | 0, 0 | 0, $4_1 | 0);
    }
    if (!868) {
     break block
    }
    $46($3_1 + 80 | 0 | 0, 0 | 0, 868 | 0);
    return;
   }
   block4 : {
    if (!$3_1) {
     break block4
    }
    $5_1 = 0;
    HEAP32[($3_1 + 8 | 0) >> 2] = 0;
    HEAP8[($3_1 + 16 | 0) >> 0] = HEAPU8[$0_1 >> 0] | 0;
    HEAP8[($3_1 + 17 | 0) >> 0] = HEAPU8[($0_1 + 1 | 0) >> 0] | 0;
    HEAP8[($3_1 + 18 | 0) >> 0] = HEAPU8[($0_1 + 2 | 0) >> 0] | 0;
    HEAP8[($3_1 + 19 | 0) >> 0] = HEAPU8[($0_1 + 3 | 0) >> 0] | 0;
    HEAP8[($3_1 + 20 | 0) >> 0] = HEAPU8[($0_1 + 4 | 0) >> 0] | 0;
    HEAP8[($3_1 + 21 | 0) >> 0] = HEAPU8[($0_1 + 5 | 0) >> 0] | 0;
    HEAP8[($3_1 + 22 | 0) >> 0] = HEAPU8[($0_1 + 6 | 0) >> 0] | 0;
    HEAP8[($3_1 + 23 | 0) >> 0] = HEAPU8[($0_1 + 7 | 0) >> 0] | 0;
    HEAP8[($3_1 + 24 | 0) >> 0] = HEAPU8[($0_1 + 8 | 0) >> 0] | 0;
    HEAP8[($3_1 + 25 | 0) >> 0] = HEAPU8[($0_1 + 9 | 0) >> 0] | 0;
    HEAP8[($3_1 + 26 | 0) >> 0] = HEAPU8[($0_1 + 10 | 0) >> 0] | 0;
    HEAP8[($3_1 + 27 | 0) >> 0] = HEAPU8[($0_1 + 11 | 0) >> 0] | 0;
    HEAP8[($3_1 + 28 | 0) >> 0] = HEAPU8[($0_1 + 12 | 0) >> 0] | 0;
    HEAP8[($3_1 + 29 | 0) >> 0] = HEAPU8[($0_1 + 13 | 0) >> 0] | 0;
    HEAP8[($3_1 + 30 | 0) >> 0] = HEAPU8[($0_1 + 14 | 0) >> 0] | 0;
    HEAP8[($3_1 + 31 | 0) >> 0] = HEAPU8[($0_1 + 15 | 0) >> 0] | 0;
    HEAP8[($3_1 + 32 | 0) >> 0] = HEAPU8[($0_1 + 16 | 0) >> 0] | 0;
    HEAP8[($3_1 + 33 | 0) >> 0] = HEAPU8[($0_1 + 17 | 0) >> 0] | 0;
    HEAP8[($3_1 + 34 | 0) >> 0] = HEAPU8[($0_1 + 18 | 0) >> 0] | 0;
    HEAP8[($3_1 + 35 | 0) >> 0] = HEAPU8[($0_1 + 19 | 0) >> 0] | 0;
    $6_1 = $0_1 + 20 | 0;
    $7_1 = $3_1 + 80 | 0;
    label : while (1) {
     $4_1 = $7_1 + Math_imul($5_1, 28) | 0;
     $8_1 = $6_1 + Math_imul($5_1, 30) | 0;
     HEAP8[$4_1 >> 0] = HEAPU8[$8_1 >> 0] | 0;
     HEAP8[($4_1 + 1 | 0) >> 0] = HEAPU8[($8_1 + 1 | 0) >> 0] | 0;
     HEAP8[($4_1 + 2 | 0) >> 0] = HEAPU8[($8_1 + 2 | 0) >> 0] | 0;
     HEAP8[($4_1 + 3 | 0) >> 0] = HEAPU8[($8_1 + 3 | 0) >> 0] | 0;
     HEAP8[($4_1 + 4 | 0) >> 0] = HEAPU8[($8_1 + 4 | 0) >> 0] | 0;
     HEAP8[($4_1 + 5 | 0) >> 0] = HEAPU8[($8_1 + 5 | 0) >> 0] | 0;
     HEAP8[($4_1 + 6 | 0) >> 0] = HEAPU8[($8_1 + 6 | 0) >> 0] | 0;
     HEAP8[($4_1 + 7 | 0) >> 0] = HEAPU8[($8_1 + 7 | 0) >> 0] | 0;
     HEAP8[($4_1 + 8 | 0) >> 0] = HEAPU8[($8_1 + 8 | 0) >> 0] | 0;
     HEAP8[($4_1 + 9 | 0) >> 0] = HEAPU8[($8_1 + 9 | 0) >> 0] | 0;
     HEAP8[($4_1 + 10 | 0) >> 0] = HEAPU8[($8_1 + 10 | 0) >> 0] | 0;
     HEAP8[($4_1 + 11 | 0) >> 0] = HEAPU8[($8_1 + 11 | 0) >> 0] | 0;
     HEAP8[($4_1 + 12 | 0) >> 0] = HEAPU8[($8_1 + 12 | 0) >> 0] | 0;
     HEAP8[($4_1 + 13 | 0) >> 0] = HEAPU8[($8_1 + 13 | 0) >> 0] | 0;
     HEAP8[($4_1 + 14 | 0) >> 0] = HEAPU8[($8_1 + 14 | 0) >> 0] | 0;
     HEAP8[($4_1 + 15 | 0) >> 0] = HEAPU8[($8_1 + 15 | 0) >> 0] | 0;
     HEAP8[($4_1 + 16 | 0) >> 0] = HEAPU8[($8_1 + 16 | 0) >> 0] | 0;
     HEAP8[($4_1 + 17 | 0) >> 0] = HEAPU8[($8_1 + 17 | 0) >> 0] | 0;
     HEAP8[($4_1 + 18 | 0) >> 0] = HEAPU8[($8_1 + 18 | 0) >> 0] | 0;
     HEAP8[($4_1 + 19 | 0) >> 0] = HEAPU8[($8_1 + 19 | 0) >> 0] | 0;
     HEAP8[($4_1 + 20 | 0) >> 0] = HEAPU8[($8_1 + 20 | 0) >> 0] | 0;
     HEAP8[($4_1 + 21 | 0) >> 0] = HEAPU8[($8_1 + 21 | 0) >> 0] | 0;
     $5_1 = $5_1 + 1 | 0;
     if (($5_1 | 0) != (31 | 0)) {
      continue label
     }
     break label;
    };
   }
   $9_1 = HEAPU16[($0_1 + 101664 | 0) >> 1] | 0;
   $10_1 = HEAPU16[($0_1 + 101666 | 0) >> 1] | 0;
   block5 : {
    if (!$2_1) {
     break block5
    }
    $11_1 = $0_1 + 45 | 0;
    $12_1 = $0_1 + 44 | 0;
    $13_1 = $0_1 + 20 | 0;
    $14_1 = $0_1 + 1088 | 0;
    $15_1 = $0_1 + 1760 | 0;
    $16_1 = $0_1 + 952 | 0;
    $17_1 = $0_1 + 1212 | 0;
    $18_1 = 0;
    $19_1 = 0;
    label7 : while (1) {
     $20_1 = $9_1;
     $21_1 = $10_1;
     $4_1 = HEAP32[($0_1 + 1736 | 0) >> 2] | 0;
     HEAP32[($0_1 + 1736 | 0) >> 2] = $4_1 + 1 | 0;
     block6 : {
      if ($4_1 >>> 0 <= (HEAP32[($0_1 + 1744 | 0) >> 2] | 0) >>> 0) {
       break block6
      }
      block7 : {
       $4_1 = HEAPU16[($0_1 + 1732 | 0) >> 1] | 0;
       if ($4_1) {
        break block7
       }
       $4_1 = HEAP32[($17_1 + ((HEAPU8[($16_1 + (HEAPU16[($0_1 + 1728 | 0) >> 1] | 0) | 0) >> 0] | 0) << 2 | 0) | 0) >> 2] | 0;
       $22_1 = 0;
       HEAP32[($0_1 + 1752 | 0) >> 2] = 0;
       i64toi32_i32$0 = 0;
       HEAP32[($0_1 + 1736 | 0) >> 2] = 0;
       HEAP32[($0_1 + 1740 | 0) >> 2] = i64toi32_i32$0;
       block8 : {
        $8_1 = HEAPU16[($0_1 + 101660 | 0) >> 1] | 0;
        if (!$8_1) {
         break block8
        }
        $5_1 = $4_1 + ((HEAPU16[($0_1 + 1730 | 0) >> 1] | 0) << 2 | 0) | 0;
        $23_1 = 0;
        $22_1 = $8_1;
        $4_1 = $15_1;
        label4 : while (1) {
         $10_1 = HEAPU8[($5_1 + 3 | 0) >> 0] | 0;
         $24_1 = $10_1 >>> 4 | 0;
         $25_1 = $10_1 & 15 | 0;
         $6_1 = HEAPU8[($5_1 + 2 | 0) >> 0] | 0;
         $26_1 = $6_1 & 15 | 0;
         $27_1 = $26_1 << 8 | 0 | $10_1 | 0;
         $28_1 = HEAPU16[($4_1 + 64 | 0) >> 1] | 0;
         $8_1 = $28_1;
         $9_1 = 0;
         block9 : {
          $7_1 = HEAPU8[$5_1 >> 0] | 0;
          $29_1 = ($7_1 << 8 | 0) & 3840 | 0 | (HEAPU8[($5_1 + 1 | 0) >> 0] | 0) | 0;
          $30_1 = $6_1 >>> 4 | 0 | ($7_1 & 240 | 0) | 0;
          if (!($29_1 | $30_1 | 0)) {
           break block9
          }
          block10 : {
           if ($7_1 >>> 0 > 31 >>> 0) {
            break block10
           }
           if (!$30_1) {
            break block10
           }
           HEAP8[($4_1 + 10 | 0) >> 0] = $30_1 + -1 | 0;
          }
          block14 : {
           block16 : {
            block15 : {
             block13 : {
              block12 : {
               block11 : {
                if (!$29_1) {
                 break block11
                }
                if (($26_1 | 0) != (3 | 0)) {
                 break block12
                }
                if (!(HEAP32[$4_1 >> 2] | 0)) {
                 break block13
                }
               }
               $8_1 = HEAPU8[($4_1 + 10 | 0) >> 0] | 0;
               HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[($14_1 + ($8_1 << 2 | 0) | 0) >> 2] | 0;
               $8_1 = Math_imul($8_1, 30);
               $7_1 = $13_1 + $8_1 | 0;
               $9_1 = HEAPU16[($7_1 + 22 | 0) >> 1] | 0;
               HEAP16[($4_1 + 16 | 0) >> 1] = $9_1 << 8 | 0 | ($9_1 >>> 8 | 0) | 0;
               $9_1 = HEAPU16[($7_1 + 26 | 0) >> 1] | 0;
               HEAP16[($4_1 + 18 | 0) >> 1] = $9_1 << 8 | 0 | ($9_1 >>> 8 | 0) | 0;
               $7_1 = HEAPU16[($7_1 + 28 | 0) >> 1] | 0;
               $9_1 = $7_1 << 8 | 0 | ($7_1 >>> 8 | 0) | 0;
               HEAP16[($4_1 + 20 | 0) >> 1] = $9_1;
               $7_1 = 1;
               if (($9_1 & 65535 | 0) >>> 0 > 1 >>> 0) {
                break block14
               }
               HEAP32[($4_1 + 12 | 0) >> 2] = 0;
               break block14;
              }
              if (($26_1 | 0) != (14 | 0)) {
               break block13
              }
              if (($24_1 | 0) != (13 | 0)) {
               break block13
              }
              if ($25_1) {
               break block15
              }
             }
             $8_1 = HEAPU8[($4_1 + 10 | 0) >> 0] | 0;
             $9_1 = HEAP32[($14_1 + ($8_1 << 2 | 0) | 0) >> 2] | 0;
             HEAP32[$4_1 >> 2] = $9_1;
             $8_1 = Math_imul($8_1, 30);
             $7_1 = $13_1 + $8_1 | 0;
             $31_1 = HEAPU16[($7_1 + 22 | 0) >> 1] | 0;
             $31_1 = $31_1 << 8 | 0 | ($31_1 >>> 8 | 0) | 0;
             HEAP16[($4_1 + 4 | 0) >> 1] = $31_1;
             $32 = HEAPU16[($7_1 + 26 | 0) >> 1] | 0;
             $32 = $32 << 8 | 0 | ($32 >>> 8 | 0) | 0;
             HEAP16[($4_1 + 6 | 0) >> 1] = $32;
             $7_1 = HEAPU16[($7_1 + 28 | 0) >> 1] | 0;
             HEAP32[($4_1 + 36 | 0) >> 2] = $9_1;
             HEAP16[($4_1 + 40 | 0) >> 1] = $31_1;
             HEAP16[($4_1 + 42 | 0) >> 1] = $32;
             $7_1 = $7_1 << 8 | 0 | ($7_1 >>> 8 | 0) | 0;
             HEAP16[($4_1 + 8 | 0) >> 1] = $7_1;
             HEAP16[($4_1 + 44 | 0) >> 1] = $7_1;
             break block16;
            }
            $8_1 = HEAPU8[($4_1 + 10 | 0) >> 0] | 0;
            HEAP32[($4_1 + 24 | 0) >> 2] = HEAP32[($14_1 + ($8_1 << 2 | 0) | 0) >> 2] | 0;
            $8_1 = Math_imul($8_1, 30);
            $7_1 = $13_1 + $8_1 | 0;
            $9_1 = HEAPU16[($7_1 + 22 | 0) >> 1] | 0;
            HEAP16[($4_1 + 28 | 0) >> 1] = $9_1 << 8 | 0 | ($9_1 >>> 8 | 0) | 0;
            $9_1 = HEAPU16[($7_1 + 26 | 0) >> 1] | 0;
            HEAP16[($4_1 + 30 | 0) >> 1] = $9_1 << 8 | 0 | ($9_1 >>> 8 | 0) | 0;
            $7_1 = HEAPU16[($7_1 + 28 | 0) >> 1] | 0;
            HEAP8[($4_1 + 34 | 0) >> 0] = $25_1;
            HEAP16[($4_1 + 32 | 0) >> 1] = $7_1 << 8 | 0 | ($7_1 >>> 8 | 0) | 0;
           }
           $7_1 = 0;
          }
          HEAP8[($4_1 + 22 | 0) >> 0] = $7_1;
          $7_1 = (HEAPU8[($12_1 + $8_1 | 0) >> 0] | 0) & 15 | 0;
          HEAP8[($4_1 + 94 | 0) >> 0] = $7_1;
          block17 : {
           if (($6_1 & 13 | 0 | 0) == (4 | 0)) {
            break block17
           }
           HEAP8[($4_1 + 93 | 0) >> 0] = 0;
           HEAP16[($4_1 + 82 | 0) >> 1] = 0;
          }
          block18 : {
           if (!$30_1) {
            break block18
           }
           if (($26_1 | 0) == (5 | 0)) {
            break block18
           }
           $8_1 = HEAPU8[($11_1 + $8_1 | 0) >> 0] | 0;
           HEAP8[($4_1 + 91 | 0) >> 0] = 0;
           HEAP8[($4_1 + 66 | 0) >> 0] = $8_1;
          }
          $8_1 = $28_1;
          $9_1 = 0;
          if (!$29_1) {
           break block9
          }
          block19 : {
           switch ($26_1 + -3 | 0 | 0) {
           default:
            HEAP32[($4_1 + 56 | 0) >> 2] = 0;
            break;
           case 0:
           case 2:
            break block19;
           };
          }
          block22 : {
           block21 : {
            if ($7_1) {
             break block21
            }
            $8_1 = $29_1;
            break block22;
           }
           $6_1 = $29_1 & 65535 | 0;
           $29_1 = HEAP32[(($7_1 << 2 | 0) + 8388864 | 0) >> 2] | 0;
           $8_1 = 0;
           block24 : {
            label1 : while (1) {
             block23 : {
              if (($6_1 | 0) < (HEAP16[(($8_1 << 1 | 0) + 8388928 | 0) >> 1] | 0 | 0)) {
               break block23
              }
              $7_1 = $8_1;
              break block24;
             }
             $7_1 = $8_1 | 1 | 0;
             if (($6_1 | 0) >= (HEAP16[(($7_1 << 1 | 0) + 8388928 | 0) >> 1] | 0 | 0)) {
              break block24
             }
             $7_1 = $8_1 | 2 | 0;
             if (($6_1 | 0) >= (HEAP16[(($7_1 << 1 | 0) + 8388928 | 0) >> 1] | 0 | 0)) {
              break block24
             }
             $7_1 = $8_1 | 3 | 0;
             if (($6_1 | 0) >= (HEAP16[(($7_1 << 1 | 0) + 8388928 | 0) >> 1] | 0 | 0)) {
              break block24
             }
             $7_1 = 144;
             $8_1 = $8_1 + 4 | 0;
             if (($8_1 | 0) != (144 | 0)) {
              continue label1
             }
             break label1;
            };
           }
           $8_1 = HEAPU16[($29_1 + ($7_1 << 1 | 0) | 0) >> 1] | 0;
          }
          HEAP16[($4_1 + 64 | 0) >> 1] = $8_1;
          $9_1 = $8_1;
         }
         HEAP16[($4_1 + 70 | 0) >> 1] = $27_1;
         $34_1 = 0;
         HEAP8[($4_1 + 67 | 0) >> 0] = $34_1;
         HEAP8[($4_1 + 68 | 0) >> 0] = $34_1 >>> 8 | 0;
         HEAP16[($4_1 + 76 | 0) >> 1] = 0;
         block71 : {
          block60 : {
           block43 : {
            block32 : {
             block39 : {
              switch ($26_1 | 0) {
              case 0:
               if (!$10_1) {
                break block32
               }
               $6_1 = 0;
               HEAP8[($4_1 + 90 | 0) >> 0] = 0;
               HEAP8[($4_1 + 68 | 0) >> 0] = $10_1;
               $10_1 = $8_1 & 65535 | 0;
               $7_1 = HEAP32[((((HEAPU8[($4_1 + 94 | 0) >> 0] | 0) & 15 | 0) << 2 | 0) + 8388864 | 0) >> 2] | 0;
               block41 : {
                label2 : while (1) {
                 block40 : {
                  if (($10_1 | 0) < (HEAP16[($7_1 + ($6_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                   break block40
                  }
                  $28_1 = $6_1;
                  break block41;
                 }
                 $28_1 = $6_1 | 1 | 0;
                 if (($10_1 | 0) >= (HEAP16[($7_1 + ($28_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                  break block41
                 }
                 $28_1 = $6_1 | 2 | 0;
                 if (($10_1 | 0) >= (HEAP16[($7_1 + ($28_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                  break block41
                 }
                 $28_1 = $6_1 | 3 | 0;
                 if (($10_1 | 0) >= (HEAP16[($7_1 + ($28_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                  break block41
                 }
                 $28_1 = 144;
                 $6_1 = $6_1 + 4 | 0;
                 if (($6_1 | 0) != (144 | 0)) {
                  continue label2
                 }
                 break label2;
                };
               }
               HEAP16[($4_1 + 84 | 0) >> 1] = $8_1;
               $8_1 = $28_1 + $24_1 | 0;
               HEAP16[($4_1 + 86 | 0) >> 1] = HEAPU16[($7_1 + ((($8_1 & 65520 | 0) >>> 0 > 143 >>> 0 ? 143 : $8_1 & 65535 | 0) << 1 | 0) | 0) >> 1] | 0;
               $8_1 = $28_1 + $25_1 | 0;
               HEAP16[($4_1 + 88 | 0) >> 1] = HEAPU16[($7_1 + ((($8_1 & 65520 | 0) >>> 0 > 143 >>> 0 ? 143 : $8_1 & 65535 | 0) << 1 | 0) | 0) >> 1] | 0;
               break block32;
              case 1:
               HEAP8[($4_1 + 68 | 0) >> 0] = $10_1;
               HEAP8[($4_1 + 67 | 0) >> 0] = 1;
               break block32;
              case 2:
               HEAP8[($4_1 + 68 | 0) >> 0] = $10_1;
               HEAP8[($4_1 + 67 | 0) >> 0] = 2;
               break block32;
              case 3:
               HEAP8[($4_1 + 67 | 0) >> 0] = 3;
               block42 : {
                if (!$10_1) {
                 break block42
                }
                HEAP16[($4_1 + 78 | 0) >> 1] = $10_1;
               }
               if (!($9_1 & 65535 | 0)) {
                break block32
               }
               HEAP16[($4_1 + 64 | 0) >> 1] = $28_1;
               HEAP16[($4_1 + 80 | 0) >> 1] = $9_1;
               break block43;
              case 4:
               HEAP8[($4_1 + 67 | 0) >> 0] = 4;
               block44 : {
                if (!$25_1) {
                 break block44
                }
                HEAP8[($4_1 + 92 | 0) >> 0] = (HEAPU8[($4_1 + 92 | 0) >> 0] | 0) & 240 | 0 | $25_1 | 0;
               }
               if ($10_1 >>> 0 < 16 >>> 0) {
                break block32
               }
               HEAP8[($4_1 + 92 | 0) >> 0] = (HEAPU8[($4_1 + 92 | 0) >> 0] | 0) & 15 | 0 | ($10_1 & 240 | 0) | 0;
               break block32;
              case 5:
               block45 : {
                if (!($9_1 & 65535 | 0)) {
                 break block45
                }
                HEAP16[($4_1 + 64 | 0) >> 1] = $28_1;
                HEAP16[($4_1 + 80 | 0) >> 1] = $9_1;
               }
               HEAP8[($4_1 + 67 | 0) >> 0] = 5;
               if (!$10_1) {
                break block32
               }
               HEAP8[($4_1 + 91 | 0) >> 0] = $10_1;
               break block32;
              case 6:
               HEAP8[($4_1 + 67 | 0) >> 0] = 6;
               if (!$10_1) {
                break block32
               }
               HEAP8[($4_1 + 91 | 0) >> 0] = $10_1;
               break block32;
              case 9:
               $8_1 = $10_1 << 18 | 0;
               HEAP32[($4_1 + 56 | 0) >> 2] = $8_1;
               block46 : {
                if ($10_1) {
                 break block46
                }
                $8_1 = HEAP32[($4_1 + 72 | 0) >> 2] | 0;
                HEAP32[($4_1 + 56 | 0) >> 2] = $8_1;
               }
               HEAP32[($4_1 + 72 | 0) >> 2] = $8_1;
               break block32;
              case 10:
               HEAP8[($4_1 + 91 | 0) >> 0] = $10_1;
               HEAP8[($4_1 + 67 | 0) >> 0] = 10;
               break block32;
              case 11:
               HEAP8[($0_1 + 1734 | 0) >> 0] = 1;
               HEAP16[($0_1 + 1730 | 0) >> 1] = 0;
               HEAP16[($0_1 + 1728 | 0) >> 1] = $10_1 >>> 0 < (HEAPU8[($0_1 + 950 | 0) >> 0] | 0) >>> 0 ? $10_1 : 0;
               break block32;
              case 12:
               HEAP8[($4_1 + 66 | 0) >> 0] = $10_1 >>> 0 < 64 >>> 0 ? $10_1 : 64;
               break block32;
              case 13:
               $8_1 = Math_imul($24_1, 10) + $25_1 | 0;
               HEAP16[($0_1 + 1730 | 0) >> 1] = Math_imul($8_1 >>> 0 < 63 >>> 0 ? $8_1 : 63, $22_1);
               block47 : {
                if (HEAPU8[($0_1 + 1734 | 0) >> 0] | 0) {
                 break block47
                }
                $8_1 = (HEAPU16[($0_1 + 1728 | 0) >> 1] | 0) + 1 | 0;
                HEAP16[($0_1 + 1728 | 0) >> 1] = ($8_1 & 65535 | 0) >>> 0 < (HEAPU8[($0_1 + 950 | 0) >> 0] | 0) >>> 0 ? $8_1 : 0;
               }
               HEAP8[($0_1 + 1734 | 0) >> 0] = 1;
               break block32;
              case 14:
               block59 : {
                switch ($24_1 + -1 | 0 | 0) {
                case 0:
                 $8_1 = ($8_1 - $25_1 | 0) & 65535 | 0;
                 $28_1 = $8_1 >>> 0 > 113 >>> 0 ? $8_1 : 113;
                 HEAP16[($4_1 + 64 | 0) >> 1] = $28_1;
                 $8_1 = 0;
                 break block60;
                case 1:
                 $8_1 = ($8_1 + $25_1 | 0) & 65535 | 0;
                 $28_1 = $8_1 >>> 0 < 856 >>> 0 ? $8_1 : 856;
                 HEAP16[($4_1 + 64 | 0) >> 1] = $28_1;
                 break block43;
                case 2:
                 HEAP16[($4_1 + 52 | 0) >> 1] = $25_1;
                 break block32;
                case 9:
                 $8_1 = ((HEAPU8[($4_1 + 66 | 0) >> 0] | 0) + $25_1 | 0) & 255 | 0;
                 HEAP8[($4_1 + 66 | 0) >> 0] = $8_1 >>> 0 < 64 >>> 0 ? $8_1 : 64;
                 break block32;
                case 10:
                 $8_1 = (HEAPU8[($4_1 + 66 | 0) >> 0] | 0) - $25_1 | 0;
                 HEAP8[($4_1 + 66 | 0) >> 0] = ($8_1 & 255 | 0) >>> 0 > 200 >>> 0 ? 0 : $8_1;
                 break block32;
                case 4:
                 block61 : {
                  $6_1 = $9_1 & 65535 | 0;
                  if (!$6_1) {
                   break block61
                  }
                  $10_1 = HEAP32[(($25_1 << 2 | 0) + 8388864 | 0) >> 2] | 0;
                  $7_1 = HEAP32[((((HEAPU8[($4_1 + 94 | 0) >> 0] | 0) & 15 | 0) << 2 | 0) + 8388864 | 0) >> 2] | 0;
                  $8_1 = 0;
                  block63 : {
                   label3 : while (1) {
                    block62 : {
                     if (($6_1 | 0) < (HEAP16[($7_1 + ($8_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                      break block62
                     }
                     $28_1 = $8_1;
                     break block63;
                    }
                    $28_1 = $8_1 | 1 | 0;
                    if (($6_1 | 0) >= (HEAP16[($7_1 + ($28_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                     break block63
                    }
                    $28_1 = $8_1 | 2 | 0;
                    if (($6_1 | 0) >= (HEAP16[($7_1 + ($28_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                     break block63
                    }
                    $28_1 = $8_1 | 3 | 0;
                    if (($6_1 | 0) >= (HEAP16[($7_1 + ($28_1 << 1 | 0) | 0) >> 1] | 0 | 0)) {
                     break block63
                    }
                    $28_1 = 144;
                    $8_1 = $8_1 + 4 | 0;
                    if (($8_1 | 0) != (144 | 0)) {
                     continue label3
                    }
                    break label3;
                   };
                  }
                  HEAP16[($4_1 + 64 | 0) >> 1] = HEAPU16[($10_1 + ($28_1 << 1 | 0) | 0) >> 1] | 0;
                 }
                 HEAP8[($4_1 + 94 | 0) >> 0] = $25_1;
                 break block32;
                case 5:
                 block64 : {
                  if (!$25_1) {
                   break block64
                  }
                  block65 : {
                   $8_1 = HEAPU16[($4_1 + 96 | 0) >> 1] | 0;
                   if (!$8_1) {
                    break block65
                   }
                   $8_1 = $8_1 + -1 | 0;
                   HEAP16[($4_1 + 96 | 0) >> 1] = $8_1;
                   block66 : {
                    if (!($8_1 & 65535 | 0)) {
                     break block66
                    }
                    $8_1 = HEAPU16[($4_1 + 98 | 0) >> 1] | 0;
                    HEAP8[($0_1 + 1734 | 0) >> 0] = 1;
                    HEAP16[($0_1 + 1730 | 0) >> 1] = $8_1;
                    break block32;
                   }
                   HEAP16[($4_1 + 98 | 0) >> 1] = HEAPU16[($0_1 + 1730 | 0) >> 1] | 0;
                   break block32;
                  }
                  HEAP16[($4_1 + 96 | 0) >> 1] = $25_1;
                  $8_1 = HEAPU16[($4_1 + 98 | 0) >> 1] | 0;
                  HEAP8[($0_1 + 1734 | 0) >> 0] = 1;
                  HEAP16[($0_1 + 1730 | 0) >> 1] = $8_1;
                  break block32;
                 }
                 HEAP16[($4_1 + 98 | 0) >> 1] = HEAPU16[($0_1 + 1730 | 0) >> 1] | 0;
                 break block32;
                case 13:
                 HEAP16[($0_1 + 1732 | 0) >> 1] = $25_1;
                 break block32;
                case 8:
                 if (!$25_1) {
                  break block32
                 }
                 HEAP8[($4_1 + 47 | 0) >> 0] = $25_1;
                 $35_1 = 36878;
                 HEAP8[($4_1 + 67 | 0) >> 0] = $35_1;
                 HEAP8[($4_1 + 68 | 0) >> 0] = $35_1 >>> 8 | 0;
                 HEAP8[($4_1 + 46 | 0) >> 0] = 0;
                 break block32;
                case 11:
                 HEAP8[($4_1 + 95 | 0) >> 0] = $25_1;
                 HEAP8[($4_1 + 67 | 0) >> 0] = 12;
                 if ($25_1) {
                  break block32
                 }
                 HEAP8[($4_1 + 66 | 0) >> 0] = 0;
                 break block32;
                case 12:
                 $36_1 = 53262;
                 HEAP8[($4_1 + 67 | 0) >> 0] = $36_1;
                 HEAP8[($4_1 + 68 | 0) >> 0] = $36_1 >>> 8 | 0;
                 break block32;
                case 14:
                 break block59;
                default:
                 break block32;
                };
               }
               HEAP16[($4_1 + 50 | 0) >> 1] = $25_1;
               if (!$25_1) {
                break block32
               }
               $8_1 = (HEAPU16[($4_1 + 48 | 0) >> 1] | 0) + (HEAPU8[($25_1 + 8393536 | 0) >> 0] | 0) | 0;
               HEAP16[($4_1 + 48 | 0) >> 1] = $8_1;
               if (($8_1 & 65535 | 0) >>> 0 < 129 >>> 0) {
                break block32
               }
               HEAP16[($4_1 + 48 | 0) >> 1] = 0;
               $8_1 = HEAP32[$4_1 >> 2] | 0;
               if (!$8_1) {
                break block32
               }
               if (!(HEAPU16[($4_1 + 4 | 0) >> 1] | 0)) {
                break block32
               }
               $7_1 = HEAPU16[($4_1 + 8 | 0) >> 1] | 0;
               if ($7_1 >>> 0 < 2 >>> 0) {
                break block32
               }
               block67 : {
                $6_1 = HEAP32[($4_1 + 56 | 0) >> 2] | 0;
                $28_1 = HEAPU16[($4_1 + 6 | 0) >> 1] | 0;
                $7_1 = $28_1 + $7_1 | 0;
                if (($6_1 >>> 11 | 0) >>> 0 < $7_1 >>> 0) {
                 break block67
                }
                $6_1 = (($6_1 >>> 0) % (($7_1 << 11 | 0) >>> 0) | 0) + ($28_1 << 11 | 0) | 0;
                HEAP32[($4_1 + 56 | 0) >> 2] = $6_1;
               }
               $8_1 = $8_1 + ($6_1 >>> 10 | 0) | 0;
               HEAP8[$8_1 >> 0] = (HEAPU8[$8_1 >> 0] | 0) ^ -1 | 0;
               break block32;
              case 15:
               break block39;
              default:
               break block32;
              };
             }
             if (!$10_1) {
              break block32
             }
             block69 : {
              block68 : {
               if ($10_1 >>> 0 > 31 >>> 0) {
                break block68
               }
               HEAP8[($0_1 + 1084 | 0) >> 0] = $10_1;
               $8_1 = HEAPU8[($0_1 + 1735 | 0) >> 0] | 0;
               $6_1 = $10_1;
               break block69;
              }
              HEAP8[($0_1 + 1735 | 0) >> 0] = $10_1;
              $6_1 = HEAPU8[($0_1 + 1084 | 0) >> 0] | 0;
              $8_1 = $10_1;
             }
             $8_1 = (Math_imul(HEAP32[($0_1 + 1724 | 0) >> 2] | 0, 5) >>> 0) / (($8_1 << 1 | 0) >>> 0) | 0;
             HEAP32[($0_1 + 1748 | 0) >> 2] = $8_1;
             HEAP32[($0_1 + 1744 | 0) >> 2] = Math_imul($8_1, $6_1);
            }
            $28_1 = HEAPU16[($4_1 + 64 | 0) >> 1] | 0;
           }
           block70 : {
            if ($28_1 & 65535 | 0) {
             break block70
            }
            $8_1 = 0;
            break block71;
           }
           $8_1 = HEAPU16[($4_1 + 76 | 0) >> 1] | 0;
          }
          block72 : {
           $8_1 = (HEAPU16[($4_1 + 82 | 0) >> 1] | 0) + $8_1 | 0;
           if (($28_1 & 65535 | 0 | 0) != ($8_1 & 65535 | 0 | 0)) {
            break block72
           }
           $8_1 = 0;
           break block71;
          }
          $8_1 = ((HEAP32[($0_1 + 1756 | 0) >> 2] | 0) >>> 0) / (((($28_1 - $8_1 | 0) << 16 | 0) >> 16 | 0) >>> 0) | 0;
         }
         HEAP32[($4_1 + 60 | 0) >> 2] = $8_1;
         $4_1 = $4_1 + 100 | 0;
         $5_1 = $5_1 + 4 | 0;
         $23_1 = $23_1 + 1 | 0;
         $22_1 = HEAPU16[($0_1 + 101660 | 0) >> 1] | 0;
         if (($23_1 & 65535 | 0) >>> 0 < $22_1 >>> 0) {
          continue label4
         }
         break label4;
        };
       }
       block74 : {
        block73 : {
         if (HEAPU8[($0_1 + 1734 | 0) >> 0] | 0) {
          break block73
         }
         $4_1 = (HEAPU16[($0_1 + 1730 | 0) >> 1] | 0) + $22_1 | 0;
         HEAP16[($0_1 + 1730 | 0) >> 1] = $4_1;
         break block74;
        }
        HEAP8[($0_1 + 1734 | 0) >> 0] = 0;
        $4_1 = HEAPU16[($0_1 + 1730 | 0) >> 1] | 0;
       }
       if (($22_1 << 6 | 0 | 0) != ($4_1 & 65535 | 0 | 0)) {
        break block6
       }
       HEAP16[($0_1 + 1730 | 0) >> 1] = 0;
       $4_1 = (HEAPU16[($0_1 + 1728 | 0) >> 1] | 0) + 1 | 0;
       HEAP16[($0_1 + 1728 | 0) >> 1] = $4_1;
       if (($4_1 & 65535 | 0) >>> 0 < (HEAPU8[($0_1 + 950 | 0) >> 0] | 0) >>> 0) {
        break block6
       }
       HEAP16[($0_1 + 1728 | 0) >> 1] = 0;
       break block6;
      }
      HEAP32[($0_1 + 1752 | 0) >> 2] = 0;
      i64toi32_i32$0 = 0;
      HEAP32[($0_1 + 1736 | 0) >> 2] = 0;
      HEAP32[($0_1 + 1740 | 0) >> 2] = i64toi32_i32$0;
      HEAP16[($0_1 + 1732 | 0) >> 1] = $4_1 + -1 | 0;
     }
     $4_1 = HEAP32[($0_1 + 1740 | 0) >> 2] | 0;
     HEAP32[($0_1 + 1740 | 0) >> 2] = $4_1 + 1 | 0;
     block75 : {
      if ($4_1 >>> 0 <= (HEAP32[($0_1 + 1748 | 0) >> 2] | 0) >>> 0) {
       break block75
      }
      $5_1 = 0;
      $4_1 = $15_1;
      block76 : {
       if (!(HEAPU16[($0_1 + 101660 | 0) >> 1] | 0)) {
        break block76
       }
       label5 : while (1) {
        block77 : {
         $8_1 = HEAP16[($4_1 + 50 | 0) >> 1] | 0;
         if (!$8_1) {
          break block77
         }
         $8_1 = (HEAPU16[($4_1 + 48 | 0) >> 1] | 0) + (HEAPU8[($8_1 + 8393536 | 0) >> 0] | 0) | 0;
         HEAP16[($4_1 + 48 | 0) >> 1] = $8_1;
         if (($8_1 & 65535 | 0) >>> 0 < 129 >>> 0) {
          break block77
         }
         HEAP16[($4_1 + 48 | 0) >> 1] = 0;
         $8_1 = HEAP32[$4_1 >> 2] | 0;
         if (!$8_1) {
          break block77
         }
         if (!(HEAPU16[($4_1 + 4 | 0) >> 1] | 0)) {
          break block77
         }
         $6_1 = HEAPU16[($4_1 + 8 | 0) >> 1] | 0;
         if ($6_1 >>> 0 < 2 >>> 0) {
          break block77
         }
         block78 : {
          $7_1 = HEAP32[($4_1 + 56 | 0) >> 2] | 0;
          $28_1 = HEAPU16[($4_1 + 6 | 0) >> 1] | 0;
          $6_1 = $28_1 + $6_1 | 0;
          if (($7_1 >>> 11 | 0) >>> 0 < $6_1 >>> 0) {
           break block78
          }
          $7_1 = (($7_1 >>> 0) % (($6_1 << 11 | 0) >>> 0) | 0) + ($28_1 << 11 | 0) | 0;
          HEAP32[($4_1 + 56 | 0) >> 2] = $7_1;
         }
         $8_1 = $8_1 + ($7_1 >>> 10 | 0) | 0;
         HEAP8[$8_1 >> 0] = (HEAPU8[$8_1 >> 0] | 0) ^ -1 | 0;
        }
        block84 : {
         block86 : {
          block85 : {
           block83 : {
            block82 : {
             block81 : {
              block80 : {
               block79 : {
                $8_1 = HEAPU8[($4_1 + 67 | 0) >> 0] | 0;
                switch ($8_1 | 0) {
                case 0:
                 break block79;
                case 1:
                 break block80;
                case 2:
                 break block81;
                case 3:
                case 5:
                 break block82;
                case 4:
                case 6:
                 break block83;
                case 10:
                 break block85;
                case 14:
                 break block86;
                default:
                 break block84;
                };
               }
               if (!(HEAPU8[($4_1 + 68 | 0) >> 0] | 0)) {
                break block84
               }
               $8_1 = (HEAPU8[($4_1 + 90 | 0) >> 0] | 0) + 1 | 0;
               $8_1 = ($8_1 & 255 | 0) >>> 0 > 2 >>> 0 ? 0 : $8_1;
               HEAP8[($4_1 + 90 | 0) >> 0] = $8_1;
               HEAP16[($4_1 + 76 | 0) >> 1] = (HEAPU16[($4_1 + 64 | 0) >> 1] | 0) - (HEAPU16[(($4_1 + (($8_1 & 255 | 0) << 1 | 0) | 0) + 84 | 0) >> 1] | 0) | 0;
               break block84;
              }
              $8_1 = HEAPU16[($4_1 + 64 | 0) >> 1] | 0;
              if (!$8_1) {
               break block84
              }
              $8_1 = $8_1 - (HEAPU8[($4_1 + 68 | 0) >> 0] | 0) | 0;
              HEAP16[($4_1 + 64 | 0) >> 1] = (($8_1 + -20001 | 0) & 65535 | 0) >>> 0 < 45648 >>> 0 ? 113 : $8_1;
              break block84;
             }
             $8_1 = HEAPU16[($4_1 + 64 | 0) >> 1] | 0;
             if (!$8_1) {
              break block84
             }
             $8_1 = ($8_1 + (HEAPU8[($4_1 + 68 | 0) >> 0] | 0) | 0) & 65535 | 0;
             HEAP16[($4_1 + 64 | 0) >> 1] = $8_1 >>> 0 < 2e4 >>> 0 ? $8_1 : 2e4;
             break block84;
            }
            block87 : {
             $6_1 = HEAPU16[($4_1 + 64 | 0) >> 1] | 0;
             if (!$6_1) {
              break block87
             }
             $28_1 = HEAPU16[($4_1 + 80 | 0) >> 1] | 0;
             if (!$28_1) {
              break block87
             }
             $7_1 = ($28_1 << 16 | 0) >> 16 | 0;
             if (($6_1 | 0) == ($7_1 | 0)) {
              break block87
             }
             $10_1 = HEAP16[($4_1 + 78 | 0) >> 1] | 0;
             block89 : {
              block88 : {
               if (($6_1 | 0) <= ($7_1 | 0)) {
                break block88
               }
               $6_1 = ($6_1 - $7_1 | 0 | 0) < ($10_1 | 0) ? $28_1 : $6_1 - $10_1 | 0;
               break block89;
              }
              $6_1 = ($7_1 - $6_1 | 0 | 0) < ($10_1 | 0) ? $28_1 : $10_1 + $6_1 | 0;
             }
             HEAP16[($4_1 + 64 | 0) >> 1] = $6_1;
             if (($6_1 & 65535 | 0 | 0) != ($7_1 | 0)) {
              break block87
             }
             HEAP16[($4_1 + 80 | 0) >> 1] = 0;
            }
            if (($8_1 | 0) != (5 | 0)) {
             break block84
            }
            block90 : {
             $8_1 = HEAPU8[($4_1 + 91 | 0) >> 0] | 0;
             if ($8_1 >>> 0 < 16 >>> 0) {
              break block90
             }
             $8_1 = ((HEAPU8[($4_1 + 66 | 0) >> 0] | 0) + ($8_1 >>> 4 | 0) | 0) & 255 | 0;
             HEAP8[($4_1 + 66 | 0) >> 0] = $8_1 >>> 0 < 63 >>> 0 ? $8_1 : 63;
             break block84;
            }
            $8_1 = (HEAPU8[($4_1 + 66 | 0) >> 0] | 0) - $8_1 | 0;
            HEAP8[($4_1 + 66 | 0) >> 0] = ($8_1 & 255 | 0) >>> 0 > 63 >>> 0 ? 0 : $8_1;
            break block84;
           }
           $6_1 = HEAPU8[($4_1 + 93 | 0) >> 0] | 0;
           $7_1 = HEAPU8[($4_1 + 92 | 0) >> 0] | 0;
           HEAP8[($4_1 + 93 | 0) >> 0] = ($6_1 + ($7_1 >>> 4 | 0) | 0) & 63 | 0;
           $7_1 = Math_imul(HEAP16[((($6_1 & 31 | 0) << 1 | 0) + 8393552 | 0) >> 1] | 0, $7_1 & 15 | 0) >>> 7 | 0;
           HEAP16[($4_1 + 82 | 0) >> 1] = $6_1 >>> 0 > 31 >>> 0 ? 0 - $7_1 | 0 : $7_1;
           if (($8_1 | 0) != (6 | 0)) {
            break block84
           }
           block91 : {
            $8_1 = HEAPU8[($4_1 + 91 | 0) >> 0] | 0;
            if ($8_1 >>> 0 < 16 >>> 0) {
             break block91
            }
            $8_1 = ((HEAPU8[($4_1 + 66 | 0) >> 0] | 0) + ($8_1 >>> 4 | 0) | 0) & 255 | 0;
            HEAP8[($4_1 + 66 | 0) >> 0] = $8_1 >>> 0 < 64 >>> 0 ? $8_1 : 64;
            break block84;
           }
           $8_1 = (HEAPU8[($4_1 + 66 | 0) >> 0] | 0) - $8_1 | 0;
           HEAP8[($4_1 + 66 | 0) >> 0] = ($8_1 & 255 | 0) >>> 0 > 64 >>> 0 ? 0 : $8_1;
           break block84;
          }
          block92 : {
           $8_1 = HEAPU8[($4_1 + 91 | 0) >> 0] | 0;
           if ($8_1 >>> 0 < 16 >>> 0) {
            break block92
           }
           $8_1 = ((HEAPU8[($4_1 + 66 | 0) >> 0] | 0) + ($8_1 >>> 4 | 0) | 0) & 255 | 0;
           HEAP8[($4_1 + 66 | 0) >> 0] = $8_1 >>> 0 < 64 >>> 0 ? $8_1 : 64;
           break block84;
          }
          $8_1 = (HEAPU8[($4_1 + 66 | 0) >> 0] | 0) - $8_1 | 0;
          HEAP8[($4_1 + 66 | 0) >> 0] = ($8_1 & 255 | 0) >>> 0 > 64 >>> 0 ? 0 : $8_1;
          break block84;
         }
         block95 : {
          switch (((HEAPU8[($4_1 + 68 | 0) >> 0] | 0) >>> 4 | 0) + -9 | 0 | 0) {
          case 3:
           block96 : {
            $8_1 = HEAPU8[($4_1 + 95 | 0) >> 0] | 0;
            if (!$8_1) {
             break block96
            }
            $8_1 = $8_1 + -1 | 0;
            HEAP8[($4_1 + 95 | 0) >> 0] = $8_1;
            if ($8_1 & 255 | 0) {
             break block84
            }
           }
           HEAP8[($4_1 + 66 | 0) >> 0] = 0;
           break block84;
          case 0:
           $8_1 = (HEAPU8[($4_1 + 46 | 0) >> 0] | 0) + 1 | 0;
           HEAP8[($4_1 + 46 | 0) >> 0] = $8_1;
           if (($8_1 & 255 | 0) >>> 0 < (HEAPU8[($4_1 + 47 | 0) >> 0] | 0) >>> 0) {
            break block84
           }
           HEAP8[($4_1 + 46 | 0) >> 0] = 0;
           HEAP32[($4_1 + 56 | 0) >> 2] = 0;
           HEAP32[$4_1 >> 2] = HEAP32[($4_1 + 36 | 0) >> 2] | 0;
           HEAP16[($4_1 + 4 | 0) >> 1] = HEAPU16[($4_1 + 40 | 0) >> 1] | 0;
           $37_1 = HEAPU16[($4_1 + 42 | 0) >> 1] | 0 | ((HEAPU16[($4_1 + 44 | 0) >> 1] | 0) << 16 | 0) | 0;
           HEAP16[($4_1 + 6 | 0) >> 1] = $37_1;
           HEAP16[($4_1 + 8 | 0) >> 1] = $37_1 >>> 16 | 0;
           break block84;
          case 4:
           break block95;
          default:
           break block84;
          };
         }
         $8_1 = HEAPU8[($4_1 + 34 | 0) >> 0] | 0;
         if (!$8_1) {
          break block84
         }
         if ((HEAP32[($0_1 + 1752 | 0) >> 2] | 0 | 0) != (($8_1 + -1 | 0) & 255 | 0 | 0)) {
          break block84
         }
         HEAP8[($4_1 + 34 | 0) >> 0] = 0;
         $8_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
         HEAP32[$4_1 >> 2] = $8_1;
         $6_1 = HEAPU16[($4_1 + 28 | 0) >> 1] | 0;
         HEAP16[($4_1 + 4 | 0) >> 1] = $6_1;
         $7_1 = HEAPU16[($4_1 + 30 | 0) >> 1] | 0;
         HEAP16[($4_1 + 6 | 0) >> 1] = $7_1;
         $28_1 = HEAPU16[($4_1 + 32 | 0) >> 1] | 0;
         HEAP16[($4_1 + 44 | 0) >> 1] = $28_1;
         HEAP16[($4_1 + 42 | 0) >> 1] = $7_1;
         HEAP16[($4_1 + 40 | 0) >> 1] = $6_1;
         HEAP32[($4_1 + 36 | 0) >> 2] = $8_1;
         HEAP16[($4_1 + 8 | 0) >> 1] = $28_1;
        }
        $8_1 = 0;
        block97 : {
         $6_1 = HEAPU16[($4_1 + 64 | 0) >> 1] | 0;
         if (!$6_1) {
          break block97
         }
         $7_1 = (HEAPU16[($4_1 + 82 | 0) >> 1] | 0) + (HEAPU16[($4_1 + 76 | 0) >> 1] | 0) | 0;
         if (($6_1 | 0) == ($7_1 & 65535 | 0 | 0)) {
          break block97
         }
         $8_1 = ((HEAP32[($0_1 + 1756 | 0) >> 2] | 0) >>> 0) / (((($6_1 - $7_1 | 0) << 16 | 0) >> 16 | 0) >>> 0) | 0;
        }
        HEAP32[($4_1 + 60 | 0) >> 2] = $8_1;
        $4_1 = $4_1 + 100 | 0;
        $5_1 = $5_1 + 1 | 0;
        if (($5_1 & 65535 | 0) >>> 0 < (HEAPU16[($0_1 + 101660 | 0) >> 1] | 0) >>> 0) {
         continue label5
        }
        break label5;
       };
      }
      HEAP32[($0_1 + 1740 | 0) >> 2] = 0;
      HEAP32[($0_1 + 1752 | 0) >> 2] = (HEAP32[($0_1 + 1752 | 0) >> 2] | 0) + 1 | 0;
     }
     block98 : {
      $26_1 = !$3_1 | ($19_1 | 0) != (0 | 0) | 0;
      if ($26_1) {
       break block98
      }
      $4_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
      if (($4_1 | 0) >= (HEAP32[$3_1 >> 2] | 0 | 0)) {
       break block98
      }
      if (!10020) {
       break block98
      }
      $46((HEAP32[($3_1 + 948 | 0) >> 2] | 0) + Math_imul($4_1, 10020) | 0 | 0, 0 | 0, 10020 | 0);
     }
     block100 : {
      block99 : {
       $6_1 = HEAPU16[($0_1 + 101660 | 0) >> 1] | 0;
       if ($6_1) {
        break block99
       }
       $10_1 = 0;
       $9_1 = 0;
       break block100;
      }
      $8_1 = 0;
      $4_1 = $15_1;
      $9_1 = 0;
      $10_1 = 0;
      label6 : while (1) {
       block101 : {
        if (!(HEAPU16[($4_1 + 64 | 0) >> 1] | 0)) {
         break block101
        }
        $28_1 = HEAP32[($4_1 + 60 | 0) >> 2] | 0;
        $5_1 = (HEAP32[($4_1 + 56 | 0) >> 2] | 0) + $28_1 | 0;
        HEAP32[($4_1 + 56 | 0) >> 2] = $5_1;
        block109 : {
         block104 : {
          block105 : {
           block102 : {
            $7_1 = HEAPU16[($4_1 + 8 | 0) >> 1] | 0;
            if ($7_1 >>> 0 > 1 >>> 0) {
             break block102
            }
            block103 : {
             if (($5_1 >>> 11 | 0) >>> 0 >= (HEAPU16[($4_1 + 4 | 0) >> 1] | 0) >>> 0) {
              break block103
             }
             $7_1 = $5_1;
             break block104;
            }
            $7_1 = 0;
            HEAP32[($4_1 + 4 | 0) >> 2] = 0;
            if (!(HEAPU8[($4_1 + 22 | 0) >> 0] | 0)) {
             break block105
            }
            $7_1 = 0;
            HEAP8[($4_1 + 22 | 0) >> 0] = 0;
            $29_1 = HEAPU16[($4_1 + 20 | 0) >> 1] | 0;
            HEAP16[($4_1 + 8 | 0) >> 1] = $29_1;
            $30_1 = HEAPU16[($4_1 + 18 | 0) >> 1] | 0;
            HEAP16[($4_1 + 6 | 0) >> 1] = $30_1;
            $23_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
            HEAP32[$4_1 >> 2] = $23_1;
            HEAP16[($4_1 + 44 | 0) >> 1] = $29_1;
            HEAP16[($4_1 + 42 | 0) >> 1] = $30_1;
            $29_1 = HEAPU16[($4_1 + 16 | 0) >> 1] | 0;
            HEAP16[($4_1 + 40 | 0) >> 1] = $29_1;
            HEAP32[($4_1 + 36 | 0) >> 2] = $23_1;
            HEAP16[($4_1 + 4 | 0) >> 1] = $29_1;
            if (!$29_1) {
             break block105
            }
            $7_1 = ($5_1 >>> 0) % (($29_1 << 11 | 0) >>> 0) | 0;
            break block105;
           }
           block106 : {
            $29_1 = HEAPU16[($4_1 + 6 | 0) >> 1] | 0;
            if (($5_1 >>> 11 | 0) >>> 0 >= ($29_1 + $7_1 | 0) >>> 0) {
             break block106
            }
            $7_1 = $5_1;
            break block104;
           }
           block108 : {
            block107 : {
             if (HEAPU8[($4_1 + 22 | 0) >> 0] | 0) {
              break block107
             }
             $30_1 = HEAP32[$4_1 >> 2] | 0;
             break block108;
            }
            HEAP8[($4_1 + 22 | 0) >> 0] = 0;
            $7_1 = HEAPU16[($4_1 + 20 | 0) >> 1] | 0;
            HEAP16[($4_1 + 8 | 0) >> 1] = $7_1;
            $29_1 = HEAPU16[($4_1 + 18 | 0) >> 1] | 0;
            HEAP16[($4_1 + 6 | 0) >> 1] = $29_1;
            $30_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
            HEAP32[$4_1 >> 2] = $30_1;
            HEAP16[($4_1 + 44 | 0) >> 1] = $7_1;
            HEAP16[($4_1 + 42 | 0) >> 1] = $29_1;
            $23_1 = HEAPU16[($4_1 + 16 | 0) >> 1] | 0;
            HEAP16[($4_1 + 40 | 0) >> 1] = $23_1;
            HEAP32[($4_1 + 36 | 0) >> 2] = $30_1;
            HEAP16[($4_1 + 4 | 0) >> 1] = $23_1;
           }
           if (!$30_1) {
            break block109
           }
           $29_1 = $29_1 & 65535 | 0;
           $7_1 = ($29_1 << 11 | 0) + (($5_1 >>> 0) % (((($7_1 & 65535 | 0) + $29_1 | 0) << 11 | 0) >>> 0) | 0) | 0;
          }
          HEAP32[($4_1 + 56 | 0) >> 2] = $7_1;
         }
         $5_1 = HEAP32[$4_1 >> 2] | 0;
         if (!$5_1) {
          break block109
         }
         $7_1 = $7_1 >>> 10 | 0;
         block111 : {
          switch ($8_1 & 3 | 0 | 0) {
          case 0:
          case 3:
           $10_1 = Math_imul(HEAPU8[($4_1 + 66 | 0) >> 0] | 0, HEAP8[($5_1 + $7_1 | 0) >> 0] | 0) + $10_1 | 0;
           break block109;
          default:
           break block111;
          };
         }
         $9_1 = Math_imul(HEAPU8[($4_1 + 66 | 0) >> 0] | 0, HEAP8[($5_1 + $7_1 | 0) >> 0] | 0) + $9_1 | 0;
        }
        if ($26_1) {
         break block101
        }
        $5_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
        if (($5_1 | 0) >= (HEAP32[$3_1 >> 2] | 0 | 0)) {
         break block101
        }
        $5_1 = (HEAP32[($3_1 + 948 | 0) >> 2] | 0) + Math_imul($5_1, 10020) | 0;
        HEAP32[($5_1 + 24 | 0) >> 2] = $18_1;
        HEAP32[$5_1 >> 2] = $6_1;
        $7_1 = HEAPU16[($0_1 + 1728 | 0) >> 1] | 0;
        HEAP32[($5_1 + 12 | 0) >> 2] = HEAPU8[($16_1 + $7_1 | 0) >> 0] | 0;
        $29_1 = HEAPU16[($0_1 + 1730 | 0) >> 1] | 0;
        HEAP32[($5_1 + 20 | 0) >> 2] = $7_1;
        HEAP32[($5_1 + 16 | 0) >> 2] = ($29_1 >>> 0) / ($6_1 >>> 0) | 0;
        HEAP32[($5_1 + 4 | 0) >> 2] = HEAPU8[($0_1 + 1735 | 0) >> 0] | 0;
        HEAP32[($5_1 + 8 | 0) >> 2] = HEAPU8[($0_1 + 1084 | 0) >> 0] | 0;
        $5_1 = $5_1 + Math_imul($8_1, 10) | 0;
        HEAP16[($5_1 + 34 | 0) >> 1] = HEAPU16[($4_1 + 70 | 0) >> 1] | 0;
        HEAP16[($5_1 + 36 | 0) >> 1] = HEAPU8[($4_1 + 68 | 0) >> 0] | 0;
        block113 : {
         block112 : {
          if ($28_1) {
           break block112
          }
          $7_1 = 0;
          break block113;
         }
         $7_1 = ((HEAP32[($0_1 + 1756 | 0) >> 2] | 0) >>> 0) / ($28_1 >>> 0) | 0;
        }
        HEAP16[($5_1 + 30 | 0) >> 1] = $7_1;
        HEAP8[($5_1 + 32 | 0) >> 0] = HEAPU8[($4_1 + 66 | 0) >> 0] | 0;
        HEAP8[($5_1 + 28 | 0) >> 0] = HEAPU8[($4_1 + 10 | 0) >> 0] | 0;
       }
       $4_1 = $4_1 + 100 | 0;
       $8_1 = $8_1 + 1 | 0;
       if (($8_1 | 0) != ($6_1 | 0)) {
        continue label6
       }
       break label6;
      };
     }
     block115 : {
      block114 : {
       if ($26_1) {
        break block114
       }
       $19_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
       $4_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
       if (($4_1 | 0) >= (HEAP32[$3_1 >> 2] | 0 | 0)) {
        break block115
       }
       HEAP32[($3_1 + 4 | 0) >> 2] = $4_1 + 1 | 0;
       break block115;
      }
      $19_1 = $19_1 + -1 | 0;
     }
     $4_1 = HEAPU16[($0_1 + 101674 | 0) >> 1] | 0;
     $8_1 = $4_1 ? ($9_1 + (($20_1 << 16 | 0) >> 16 | 0) | 0) >> 1 | 0 : $9_1;
     $4_1 = $4_1 ? ($10_1 + (($21_1 << 16 | 0) >> 16 | 0) | 0) >> 1 | 0 : $10_1;
     $5_1 = ($8_1 >> 1 | 0) + $4_1 | 0;
     $6_1 = (HEAPU16[($0_1 + 101670 | 0) >> 1] | 0 | 0) == (1 | 0);
     $4_1 = $6_1 ? $5_1 : $4_1;
     $4_1 = ($4_1 | 0) < (32767 | 0) ? $4_1 : 32767;
     HEAP16[$1_1 >> 1] = ($4_1 | 0) > (-32768 | 0) ? $4_1 : -32768;
     $4_1 = ($6_1 ? $5_1 >> 1 | 0 : 0) + $8_1 | 0;
     $4_1 = ($4_1 | 0) < (32767 | 0) ? $4_1 : 32767;
     HEAP16[($1_1 + 2 | 0) >> 1] = ($4_1 | 0) > (-32768 | 0) ? $4_1 : -32768;
     $1_1 = $1_1 + 4 | 0;
     $18_1 = $18_1 + 1 | 0;
     if (($18_1 | 0) != ($2_1 | 0)) {
      continue label7
     }
     break label7;
    };
   }
   HEAP16[($0_1 + 101664 | 0) >> 1] = $9_1;
   HEAP16[($0_1 + 101666 | 0) >> 1] = $10_1;
  }
 }
 
 function $5($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = Math_fround($2_1);
  var $4_1 = 0, $3_1 = 0, $5_1 = Math_fround(0), $22_1 = 0, $15_1 = 0;
  $3_1 = 0;
  block : {
   if (!$0_1) {
    break block
   }
   if (!$1_1) {
    break block
   }
   $4_1 = $28(1 | 0, 101676 | 0) | 0;
   if (!$4_1) {
    break block
   }
   $1($4_1 | 0) | 0;
   $15_1 = $4_1;
   $5_1 = $2_1;
   if (Math_fround(Math_abs($5_1)) < Math_fround(2147483648.0)) {
    $22_1 = ~~$5_1
   } else {
    $22_1 = -2147483648
   }
   $2($15_1 | 0, $22_1 | 0, 1 | 0, 1 | 0) | 0;
   $3($4_1 | 0, $0_1 | 0, $1_1 | 0) | 0;
   $3_1 = $4_1;
  }
  return $3_1 | 0;
 }
 
 function $6($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $7_1 = 0, $5_1 = 0, $4_1 = 0, $8_1 = 0, $6_1 = 0, $9_1 = 0, $10_1 = 0;
  $4_1 = global$0 - 65536 | 0;
  global$0 = $4_1;
  block : {
   if (!$0_1) {
    break block
   }
   if (!$1_1) {
    break block
   }
   if (!$2_1) {
    break block
   }
   if (($3_1 | 0) < (1 | 0)) {
    break block
   }
   $5_1 = 0;
   $6_1 = 0;
   label1 : while (1) {
    block2 : {
     block1 : {
      $7_1 = $3_1 - $5_1 | 0;
      if (($7_1 | 0) < (16384 | 0)) {
       break block1
      }
      $8_1 = 16384;
      $4($0_1 | 0, $4_1 | 0, 16384 | 0, 0 | 0);
      $5_1 = $5_1 + 16384 | 0;
      break block2;
     }
     $8_1 = 16384 - $7_1 | 0;
     $4($0_1 | 0, $4_1 | 0, $8_1 | 0, 0 | 0);
     $5_1 = $8_1 + $5_1 | 0;
    }
    $7_1 = 0;
    label : while (1) {
     $9_1 = $6_1 << 2 | 0;
     $10_1 = $4_1 + ($7_1 << 2 | 0) | 0;
     HEAPF32[($1_1 + $9_1 | 0) >> 2] = Math_fround(Math_fround(HEAP16[$10_1 >> 1] | 0 | 0) * Math_fround(3.0518509447574615e-05));
     HEAPF32[($2_1 + $9_1 | 0) >> 2] = Math_fround(Math_fround(HEAP16[($10_1 + 2 | 0) >> 1] | 0 | 0) * Math_fround(3.0518509447574615e-05));
     $6_1 = $6_1 + 1 | 0;
     $7_1 = $7_1 + 1 | 0;
     if (($7_1 | 0) != ($8_1 | 0)) {
      continue label
     }
     break label;
    };
    if (($5_1 | 0) < ($3_1 | 0)) {
     continue label1
    }
    break label1;
   };
  }
  global$0 = $4_1 + 65536 | 0;
  return 0 | 0;
 }
 
 function $7($0_1) {
  $0_1 = $0_1 | 0;
  block : {
   if (!$0_1) {
    break block
   }
   $27($0_1 | 0);
  }
 }
 
 function $8() {
  return 0 | 0;
 }
 
 function $9($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $8() | 0 | 0;
 }
 
 function $10() {
  return 8396e3 | 0;
 }
 
 function $11() {
  fimport$0();
  wasm2js_trap();
 }
 
 function $12($0_1) {
  $0_1 = $0_1 | 0;
  block : {
   if ($0_1) {
    break block
   }
   return 0 | 0;
  }
  HEAP32[($10() | 0) >> 2] = $0_1;
  return -1 | 0;
 }
 
 function $13($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $14($0_1) {
  $0_1 = $0_1 | 0;
  return $12(fimport$1($13(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $15($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0, $8_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  $4_1 = HEAP32[($0_1 + 28 | 0) >> 2] | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = $4_1;
  $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
  HEAP32[($3_1 + 28 | 0) >> 2] = $2_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $1_1;
  $1_1 = $5_1 - $4_1 | 0;
  HEAP32[($3_1 + 20 | 0) >> 2] = $1_1;
  $6_1 = $1_1 + $2_1 | 0;
  $4_1 = $3_1 + 16 | 0;
  $7_1 = 2;
  block5 : {
   block4 : {
    block2 : {
     block1 : {
      block : {
       if (!($12(fimport$2(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $3_1 + 16 | 0 | 0, 2 | 0, $3_1 + 12 | 0 | 0) | 0 | 0) | 0)) {
        break block
       }
       $5_1 = $4_1;
       break block1;
      }
      label : while (1) {
       $1_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
       if (($6_1 | 0) == ($1_1 | 0)) {
        break block2
       }
       block3 : {
        if (($1_1 | 0) > (-1 | 0)) {
         break block3
        }
        $5_1 = $4_1;
        break block4;
       }
       $8_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
       $9_1 = $1_1 >>> 0 > $8_1 >>> 0;
       $5_1 = $4_1 + ($9_1 ? 8 : 0) | 0;
       $8_1 = $1_1 - ($9_1 ? $8_1 : 0) | 0;
       HEAP32[$5_1 >> 2] = (HEAP32[$5_1 >> 2] | 0) + $8_1 | 0;
       $4_1 = $4_1 + ($9_1 ? 12 : 4) | 0;
       HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) - $8_1 | 0;
       $6_1 = $6_1 - $1_1 | 0;
       $4_1 = $5_1;
       $7_1 = $7_1 - $9_1 | 0;
       if (!($12(fimport$2(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $4_1 | 0, $7_1 | 0, $3_1 + 12 | 0 | 0) | 0 | 0) | 0)) {
        continue label
       }
       break label;
      };
     }
     if (($6_1 | 0) != (-1 | 0)) {
      break block4
     }
    }
    $1_1 = HEAP32[($0_1 + 44 | 0) >> 2] | 0;
    HEAP32[($0_1 + 28 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 20 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 16 | 0) >> 2] = $1_1 + (HEAP32[($0_1 + 48 | 0) >> 2] | 0) | 0;
    $1_1 = $2_1;
    break block5;
   }
   $1_1 = 0;
   HEAP32[($0_1 + 28 | 0) >> 2] = 0;
   HEAP32[($0_1 + 16 | 0) >> 2] = 0;
   HEAP32[($0_1 + 20 | 0) >> 2] = 0;
   HEAP32[$0_1 >> 2] = HEAP32[$0_1 >> 2] | 0 | 32 | 0;
   if (($7_1 | 0) == (2 | 0)) {
    break block5
   }
   $1_1 = $2_1 - (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0;
  }
  global$0 = $3_1 + 32 | 0;
  return $1_1 | 0;
 }
 
 function $16($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, $3_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  i64toi32_i32$0 = $1$hi;
  $2_1 = $12($45($0_1 | 0, $1_1 | 0, i64toi32_i32$0 | 0, $2_1 & 255 | 0 | 0, $3_1 + 8 | 0 | 0) | 0 | 0) | 0;
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 8 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 12 | 0) >> 2] | 0;
  $1_1 = i64toi32_i32$0;
  $1$hi = i64toi32_i32$1;
  global$0 = i64toi32_i32$2 + 16 | 0;
  i64toi32_i32$1 = -1;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$3 = $2_1 ? -1 : $1_1;
  i64toi32_i32$2 = $2_1 ? i64toi32_i32$1 : i64toi32_i32$0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$2;
  return i64toi32_i32$3 | 0;
 }
 
 function $17($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$0 = $16(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $1_1 | 0, i64toi32_i32$0 | 0, $2_1 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $18($0_1) {
  $0_1 = $0_1 | 0;
  return 1 | 0;
 }
 
 function $19($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $20($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $21($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $22() {
  $20(8396012 | 0);
  return 8396016 | 0;
 }
 
 function $23() {
  $21(8396012 | 0);
 }
 
 function $24($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, i64toi32_i32$0 = 0, $4_1 = 0, i64toi32_i32$1 = 0, $6_1 = 0, $5_1 = 0, $6$hi = 0;
  block : {
   if (!$2_1) {
    break block
   }
   HEAP8[$0_1 >> 0] = $1_1;
   $3_1 = $0_1 + $2_1 | 0;
   HEAP8[($3_1 + -1 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 3 >>> 0) {
    break block
   }
   HEAP8[($0_1 + 2 | 0) >> 0] = $1_1;
   HEAP8[($0_1 + 1 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -3 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -2 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 7 >>> 0) {
    break block
   }
   HEAP8[($0_1 + 3 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -4 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 9 >>> 0) {
    break block
   }
   $4_1 = (0 - $0_1 | 0) & 3 | 0;
   $3_1 = $0_1 + $4_1 | 0;
   $1_1 = Math_imul($1_1 & 255 | 0, 16843009);
   HEAP32[$3_1 >> 2] = $1_1;
   $4_1 = ($2_1 - $4_1 | 0) & -4 | 0;
   $2_1 = $3_1 + $4_1 | 0;
   HEAP32[($2_1 + -4 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 9 >>> 0) {
    break block
   }
   HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 4 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -8 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -12 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 25 >>> 0) {
    break block
   }
   HEAP32[($3_1 + 24 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 20 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 16 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 12 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -16 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -20 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -24 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -28 | 0) >> 2] = $1_1;
   $5_1 = $3_1 & 4 | 0 | 24 | 0;
   $2_1 = $4_1 - $5_1 | 0;
   if ($2_1 >>> 0 < 32 >>> 0) {
    break block
   }
   i64toi32_i32$0 = 0;
   i64toi32_i32$1 = 1;
   i64toi32_i32$1 = __wasm_i64_mul($1_1 | 0, i64toi32_i32$0 | 0, 1 | 0, i64toi32_i32$1 | 0) | 0;
   i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
   $6_1 = i64toi32_i32$1;
   $6$hi = i64toi32_i32$0;
   $1_1 = $3_1 + $5_1 | 0;
   label : while (1) {
    i64toi32_i32$0 = $6$hi;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 24 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 28 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 16 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 20 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[$1_1 >> 2] = $6_1;
    HEAP32[($1_1 + 4 | 0) >> 2] = i64toi32_i32$0;
    $1_1 = $1_1 + 32 | 0;
    $2_1 = $2_1 + -32 | 0;
    if ($2_1 >>> 0 > 31 >>> 0) {
     continue label
    }
    break label;
   };
  }
  return $0_1 | 0;
 }
 
 function $25($0_1) {
  $0_1 = $0_1 | 0;
  var $5_1 = 0, $4_1 = 0, $7_1 = 0, $8_1 = 0, $3_1 = 0, $2_1 = 0, $6_1 = 0, $12_1 = 0, $11_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $10_1 = 0, i64toi32_i32$2 = 0, $1_1 = 0, $9_1 = 0, $87 = 0, $201 = 0, $1154 = 0, $1156 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  block5 : {
   block88 : {
    block4 : {
     block6 : {
      block : {
       if ($0_1 >>> 0 > 244 >>> 0) {
        break block
       }
       block1 : {
        $2_1 = HEAP32[(0 + 8396024 | 0) >> 2] | 0;
        $3_1 = $0_1 >>> 0 < 11 >>> 0 ? 16 : ($0_1 + 11 | 0) & 504 | 0;
        $4_1 = $3_1 >>> 3 | 0;
        $0_1 = $2_1 >>> $4_1 | 0;
        if (!($0_1 & 3 | 0)) {
         break block1
        }
        block3 : {
         block2 : {
          $3_1 = (($0_1 ^ -1 | 0) & 1 | 0) + $4_1 | 0;
          $0_1 = $3_1 << 3 | 0;
          $5_1 = $0_1 + 8396064 | 0;
          $4_1 = HEAP32[($0_1 + 8396072 | 0) >> 2] | 0;
          $0_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
          if (($5_1 | 0) != ($0_1 | 0)) {
           break block2
          }
          HEAP32[(0 + 8396024 | 0) >> 2] = $2_1 & (__wasm_rotl_i32(-2 | 0, $3_1 | 0) | 0) | 0;
          break block3;
         }
         if ($0_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
          break block4
         }
         if ((HEAP32[($0_1 + 12 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
          break block4
         }
         HEAP32[($0_1 + 12 | 0) >> 2] = $5_1;
         HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
        }
        $0_1 = $4_1 + 8 | 0;
        $3_1 = $3_1 << 3 | 0;
        HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
        $4_1 = $4_1 + $3_1 | 0;
        HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 1 | 0;
        break block5;
       }
       $6_1 = HEAP32[(0 + 8396032 | 0) >> 2] | 0;
       if ($3_1 >>> 0 <= $6_1 >>> 0) {
        break block6
       }
       block7 : {
        if (!$0_1) {
         break block7
        }
        block9 : {
         block8 : {
          $87 = $0_1 << $4_1 | 0;
          $0_1 = 2 << $4_1 | 0;
          $5_1 = __wasm_ctz_i32($87 & ($0_1 | (0 - $0_1 | 0) | 0) | 0 | 0) | 0;
          $0_1 = $5_1 << 3 | 0;
          $7_1 = $0_1 + 8396064 | 0;
          $0_1 = HEAP32[($0_1 + 8396072 | 0) >> 2] | 0;
          $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
          if (($7_1 | 0) != ($4_1 | 0)) {
           break block8
          }
          $2_1 = $2_1 & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
          HEAP32[(0 + 8396024 | 0) >> 2] = $2_1;
          break block9;
         }
         if ($4_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
          break block4
         }
         if ((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != ($0_1 | 0)) {
          break block4
         }
         HEAP32[($4_1 + 12 | 0) >> 2] = $7_1;
         HEAP32[($7_1 + 8 | 0) >> 2] = $4_1;
        }
        HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
        $7_1 = $0_1 + $3_1 | 0;
        $4_1 = $5_1 << 3 | 0;
        $3_1 = $4_1 - $3_1 | 0;
        HEAP32[($7_1 + 4 | 0) >> 2] = $3_1 | 1 | 0;
        HEAP32[($0_1 + $4_1 | 0) >> 2] = $3_1;
        block10 : {
         if (!$6_1) {
          break block10
         }
         $5_1 = ($6_1 & -8 | 0) + 8396064 | 0;
         $4_1 = HEAP32[(0 + 8396044 | 0) >> 2] | 0;
         block12 : {
          block11 : {
           $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
           if ($2_1 & $8_1 | 0) {
            break block11
           }
           HEAP32[(0 + 8396024 | 0) >> 2] = $2_1 | $8_1 | 0;
           $8_1 = $5_1;
           break block12;
          }
          $8_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
          if ($8_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
           break block4
          }
         }
         HEAP32[($5_1 + 8 | 0) >> 2] = $4_1;
         HEAP32[($8_1 + 12 | 0) >> 2] = $4_1;
         HEAP32[($4_1 + 12 | 0) >> 2] = $5_1;
         HEAP32[($4_1 + 8 | 0) >> 2] = $8_1;
        }
        $0_1 = $0_1 + 8 | 0;
        HEAP32[(0 + 8396044 | 0) >> 2] = $7_1;
        HEAP32[(0 + 8396032 | 0) >> 2] = $3_1;
        break block5;
       }
       $9_1 = HEAP32[(0 + 8396028 | 0) >> 2] | 0;
       if (!$9_1) {
        break block6
       }
       $7_1 = HEAP32[(((__wasm_ctz_i32($9_1 | 0) | 0) << 2 | 0) + 8396328 | 0) >> 2] | 0;
       $4_1 = ((HEAP32[($7_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
       $5_1 = $7_1;
       block14 : {
        label : while (1) {
         block13 : {
          $0_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
          if ($0_1) {
           break block13
          }
          $0_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
          if (!$0_1) {
           break block14
          }
         }
         $5_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
         $201 = $5_1;
         $5_1 = $5_1 >>> 0 < $4_1 >>> 0;
         $4_1 = $5_1 ? $201 : $4_1;
         $7_1 = $5_1 ? $0_1 : $7_1;
         $5_1 = $0_1;
         continue label;
        };
       }
       $10_1 = HEAP32[(0 + 8396040 | 0) >> 2] | 0;
       if ($7_1 >>> 0 < $10_1 >>> 0) {
        break block4
       }
       $11_1 = HEAP32[($7_1 + 24 | 0) >> 2] | 0;
       block16 : {
        block15 : {
         $0_1 = HEAP32[($7_1 + 12 | 0) >> 2] | 0;
         if (($0_1 | 0) == ($7_1 | 0)) {
          break block15
         }
         $5_1 = HEAP32[($7_1 + 8 | 0) >> 2] | 0;
         if ($5_1 >>> 0 < $10_1 >>> 0) {
          break block4
         }
         if ((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != ($7_1 | 0)) {
          break block4
         }
         if ((HEAP32[($0_1 + 8 | 0) >> 2] | 0 | 0) != ($7_1 | 0)) {
          break block4
         }
         HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
         HEAP32[($0_1 + 8 | 0) >> 2] = $5_1;
         break block16;
        }
        block19 : {
         block18 : {
          block17 : {
           $5_1 = HEAP32[($7_1 + 20 | 0) >> 2] | 0;
           if (!$5_1) {
            break block17
           }
           $8_1 = $7_1 + 20 | 0;
           break block18;
          }
          $5_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
          if (!$5_1) {
           break block19
          }
          $8_1 = $7_1 + 16 | 0;
         }
         label1 : while (1) {
          $12_1 = $8_1;
          $0_1 = $5_1;
          $8_1 = $0_1 + 20 | 0;
          $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
          if ($5_1) {
           continue label1
          }
          $8_1 = $0_1 + 16 | 0;
          $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
          if ($5_1) {
           continue label1
          }
          break label1;
         };
         if ($12_1 >>> 0 < $10_1 >>> 0) {
          break block4
         }
         HEAP32[$12_1 >> 2] = 0;
         break block16;
        }
        $0_1 = 0;
       }
       block20 : {
        if (!$11_1) {
         break block20
        }
        block22 : {
         block21 : {
          $8_1 = HEAP32[($7_1 + 28 | 0) >> 2] | 0;
          $5_1 = ($8_1 << 2 | 0) + 8396328 | 0;
          if (($7_1 | 0) != (HEAP32[$5_1 >> 2] | 0 | 0)) {
           break block21
          }
          HEAP32[$5_1 >> 2] = $0_1;
          if ($0_1) {
           break block22
          }
          HEAP32[(0 + 8396028 | 0) >> 2] = $9_1 & (__wasm_rotl_i32(-2 | 0, $8_1 | 0) | 0) | 0;
          break block20;
         }
         if ($11_1 >>> 0 < $10_1 >>> 0) {
          break block4
         }
         block24 : {
          block23 : {
           if ((HEAP32[($11_1 + 16 | 0) >> 2] | 0 | 0) != ($7_1 | 0)) {
            break block23
           }
           HEAP32[($11_1 + 16 | 0) >> 2] = $0_1;
           break block24;
          }
          HEAP32[($11_1 + 20 | 0) >> 2] = $0_1;
         }
         if (!$0_1) {
          break block20
         }
        }
        if ($0_1 >>> 0 < $10_1 >>> 0) {
         break block4
        }
        HEAP32[($0_1 + 24 | 0) >> 2] = $11_1;
        block25 : {
         $5_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
         if (!$5_1) {
          break block25
         }
         if ($5_1 >>> 0 < $10_1 >>> 0) {
          break block4
         }
         HEAP32[($0_1 + 16 | 0) >> 2] = $5_1;
         HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
        }
        $5_1 = HEAP32[($7_1 + 20 | 0) >> 2] | 0;
        if (!$5_1) {
         break block20
        }
        if ($5_1 >>> 0 < $10_1 >>> 0) {
         break block4
        }
        HEAP32[($0_1 + 20 | 0) >> 2] = $5_1;
        HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
       }
       block27 : {
        block26 : {
         if ($4_1 >>> 0 > 15 >>> 0) {
          break block26
         }
         $0_1 = $4_1 + $3_1 | 0;
         HEAP32[($7_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
         $0_1 = $7_1 + $0_1 | 0;
         HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
         break block27;
        }
        HEAP32[($7_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
        $3_1 = $7_1 + $3_1 | 0;
        HEAP32[($3_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
        HEAP32[($3_1 + $4_1 | 0) >> 2] = $4_1;
        block28 : {
         if (!$6_1) {
          break block28
         }
         $5_1 = ($6_1 & -8 | 0) + 8396064 | 0;
         $0_1 = HEAP32[(0 + 8396044 | 0) >> 2] | 0;
         block30 : {
          block29 : {
           $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
           if ($8_1 & $2_1 | 0) {
            break block29
           }
           HEAP32[(0 + 8396024 | 0) >> 2] = $8_1 | $2_1 | 0;
           $8_1 = $5_1;
           break block30;
          }
          $8_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
          if ($8_1 >>> 0 < $10_1 >>> 0) {
           break block4
          }
         }
         HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
         HEAP32[($8_1 + 12 | 0) >> 2] = $0_1;
         HEAP32[($0_1 + 12 | 0) >> 2] = $5_1;
         HEAP32[($0_1 + 8 | 0) >> 2] = $8_1;
        }
        HEAP32[(0 + 8396044 | 0) >> 2] = $3_1;
        HEAP32[(0 + 8396032 | 0) >> 2] = $4_1;
       }
       $0_1 = $7_1 + 8 | 0;
       break block5;
      }
      $3_1 = -1;
      if ($0_1 >>> 0 > -65 >>> 0) {
       break block6
      }
      $4_1 = $0_1 + 11 | 0;
      $3_1 = $4_1 & -8 | 0;
      $11_1 = HEAP32[(0 + 8396028 | 0) >> 2] | 0;
      if (!$11_1) {
       break block6
      }
      $6_1 = 31;
      block31 : {
       if ($0_1 >>> 0 > 16777204 >>> 0) {
        break block31
       }
       $0_1 = Math_clz32($4_1 >>> 8 | 0);
       $6_1 = ((($3_1 >>> (38 - $0_1 | 0) | 0) & 1 | 0) - ($0_1 << 1 | 0) | 0) + 62 | 0;
      }
      $4_1 = 0 - $3_1 | 0;
      block37 : {
       block35 : {
        block33 : {
         block32 : {
          $5_1 = HEAP32[(($6_1 << 2 | 0) + 8396328 | 0) >> 2] | 0;
          if ($5_1) {
           break block32
          }
          $0_1 = 0;
          $8_1 = 0;
          break block33;
         }
         $0_1 = 0;
         $7_1 = $3_1 << (($6_1 | 0) == (31 | 0) ? 0 : 25 - ($6_1 >>> 1 | 0) | 0) | 0;
         $8_1 = 0;
         label2 : while (1) {
          block34 : {
           $2_1 = ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
           if ($2_1 >>> 0 >= $4_1 >>> 0) {
            break block34
           }
           $4_1 = $2_1;
           $8_1 = $5_1;
           if ($4_1) {
            break block34
           }
           $4_1 = 0;
           $8_1 = $5_1;
           $0_1 = $5_1;
           break block35;
          }
          $2_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
          $12_1 = HEAP32[(($5_1 + (($7_1 >>> 29 | 0) & 4 | 0) | 0) + 16 | 0) >> 2] | 0;
          $0_1 = $2_1 ? (($2_1 | 0) == ($12_1 | 0) ? $0_1 : $2_1) : $0_1;
          $7_1 = $7_1 << 1 | 0;
          $5_1 = $12_1;
          if ($5_1) {
           continue label2
          }
          break label2;
         };
        }
        block36 : {
         if ($0_1 | $8_1 | 0) {
          break block36
         }
         $8_1 = 0;
         $0_1 = 2 << $6_1 | 0;
         $0_1 = ($0_1 | (0 - $0_1 | 0) | 0) & $11_1 | 0;
         if (!$0_1) {
          break block6
         }
         $0_1 = HEAP32[(((__wasm_ctz_i32($0_1 | 0) | 0) << 2 | 0) + 8396328 | 0) >> 2] | 0;
        }
        if (!$0_1) {
         break block37
        }
       }
       label3 : while (1) {
        $2_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
        $7_1 = $2_1 >>> 0 < $4_1 >>> 0;
        block38 : {
         $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
         if ($5_1) {
          break block38
         }
         $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
        }
        $4_1 = $7_1 ? $2_1 : $4_1;
        $8_1 = $7_1 ? $0_1 : $8_1;
        $0_1 = $5_1;
        if ($0_1) {
         continue label3
        }
        break label3;
       };
      }
      if (!$8_1) {
       break block6
      }
      if ($4_1 >>> 0 >= ((HEAP32[(0 + 8396032 | 0) >> 2] | 0) - $3_1 | 0) >>> 0) {
       break block6
      }
      $12_1 = HEAP32[(0 + 8396040 | 0) >> 2] | 0;
      if ($8_1 >>> 0 < $12_1 >>> 0) {
       break block4
      }
      $6_1 = HEAP32[($8_1 + 24 | 0) >> 2] | 0;
      block40 : {
       block39 : {
        $0_1 = HEAP32[($8_1 + 12 | 0) >> 2] | 0;
        if (($0_1 | 0) == ($8_1 | 0)) {
         break block39
        }
        $5_1 = HEAP32[($8_1 + 8 | 0) >> 2] | 0;
        if ($5_1 >>> 0 < $12_1 >>> 0) {
         break block4
        }
        if ((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != ($8_1 | 0)) {
         break block4
        }
        if ((HEAP32[($0_1 + 8 | 0) >> 2] | 0 | 0) != ($8_1 | 0)) {
         break block4
        }
        HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
        HEAP32[($0_1 + 8 | 0) >> 2] = $5_1;
        break block40;
       }
       block43 : {
        block42 : {
         block41 : {
          $5_1 = HEAP32[($8_1 + 20 | 0) >> 2] | 0;
          if (!$5_1) {
           break block41
          }
          $7_1 = $8_1 + 20 | 0;
          break block42;
         }
         $5_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
         if (!$5_1) {
          break block43
         }
         $7_1 = $8_1 + 16 | 0;
        }
        label4 : while (1) {
         $2_1 = $7_1;
         $0_1 = $5_1;
         $7_1 = $0_1 + 20 | 0;
         $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
         if ($5_1) {
          continue label4
         }
         $7_1 = $0_1 + 16 | 0;
         $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
         if ($5_1) {
          continue label4
         }
         break label4;
        };
        if ($2_1 >>> 0 < $12_1 >>> 0) {
         break block4
        }
        HEAP32[$2_1 >> 2] = 0;
        break block40;
       }
       $0_1 = 0;
      }
      block44 : {
       if (!$6_1) {
        break block44
       }
       block46 : {
        block45 : {
         $7_1 = HEAP32[($8_1 + 28 | 0) >> 2] | 0;
         $5_1 = ($7_1 << 2 | 0) + 8396328 | 0;
         if (($8_1 | 0) != (HEAP32[$5_1 >> 2] | 0 | 0)) {
          break block45
         }
         HEAP32[$5_1 >> 2] = $0_1;
         if ($0_1) {
          break block46
         }
         $11_1 = $11_1 & (__wasm_rotl_i32(-2 | 0, $7_1 | 0) | 0) | 0;
         HEAP32[(0 + 8396028 | 0) >> 2] = $11_1;
         break block44;
        }
        if ($6_1 >>> 0 < $12_1 >>> 0) {
         break block4
        }
        block48 : {
         block47 : {
          if ((HEAP32[($6_1 + 16 | 0) >> 2] | 0 | 0) != ($8_1 | 0)) {
           break block47
          }
          HEAP32[($6_1 + 16 | 0) >> 2] = $0_1;
          break block48;
         }
         HEAP32[($6_1 + 20 | 0) >> 2] = $0_1;
        }
        if (!$0_1) {
         break block44
        }
       }
       if ($0_1 >>> 0 < $12_1 >>> 0) {
        break block4
       }
       HEAP32[($0_1 + 24 | 0) >> 2] = $6_1;
       block49 : {
        $5_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
        if (!$5_1) {
         break block49
        }
        if ($5_1 >>> 0 < $12_1 >>> 0) {
         break block4
        }
        HEAP32[($0_1 + 16 | 0) >> 2] = $5_1;
        HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
       }
       $5_1 = HEAP32[($8_1 + 20 | 0) >> 2] | 0;
       if (!$5_1) {
        break block44
       }
       if ($5_1 >>> 0 < $12_1 >>> 0) {
        break block4
       }
       HEAP32[($0_1 + 20 | 0) >> 2] = $5_1;
       HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
      }
      block51 : {
       block50 : {
        if ($4_1 >>> 0 > 15 >>> 0) {
         break block50
        }
        $0_1 = $4_1 + $3_1 | 0;
        HEAP32[($8_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
        $0_1 = $8_1 + $0_1 | 0;
        HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
        break block51;
       }
       HEAP32[($8_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
       $7_1 = $8_1 + $3_1 | 0;
       HEAP32[($7_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
       HEAP32[($7_1 + $4_1 | 0) >> 2] = $4_1;
       block52 : {
        if ($4_1 >>> 0 > 255 >>> 0) {
         break block52
        }
        $0_1 = ($4_1 & -8 | 0) + 8396064 | 0;
        block54 : {
         block53 : {
          $3_1 = HEAP32[(0 + 8396024 | 0) >> 2] | 0;
          $4_1 = 1 << ($4_1 >>> 3 | 0) | 0;
          if ($3_1 & $4_1 | 0) {
           break block53
          }
          HEAP32[(0 + 8396024 | 0) >> 2] = $3_1 | $4_1 | 0;
          $4_1 = $0_1;
          break block54;
         }
         $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
         if ($4_1 >>> 0 < $12_1 >>> 0) {
          break block4
         }
        }
        HEAP32[($0_1 + 8 | 0) >> 2] = $7_1;
        HEAP32[($4_1 + 12 | 0) >> 2] = $7_1;
        HEAP32[($7_1 + 12 | 0) >> 2] = $0_1;
        HEAP32[($7_1 + 8 | 0) >> 2] = $4_1;
        break block51;
       }
       $0_1 = 31;
       block55 : {
        if ($4_1 >>> 0 > 16777215 >>> 0) {
         break block55
        }
        $0_1 = Math_clz32($4_1 >>> 8 | 0);
        $0_1 = ((($4_1 >>> (38 - $0_1 | 0) | 0) & 1 | 0) - ($0_1 << 1 | 0) | 0) + 62 | 0;
       }
       HEAP32[($7_1 + 28 | 0) >> 2] = $0_1;
       i64toi32_i32$1 = $7_1;
       i64toi32_i32$0 = 0;
       HEAP32[($7_1 + 16 | 0) >> 2] = 0;
       HEAP32[($7_1 + 20 | 0) >> 2] = i64toi32_i32$0;
       $3_1 = ($0_1 << 2 | 0) + 8396328 | 0;
       block58 : {
        block57 : {
         block56 : {
          $5_1 = 1 << $0_1 | 0;
          if ($11_1 & $5_1 | 0) {
           break block56
          }
          HEAP32[(0 + 8396028 | 0) >> 2] = $11_1 | $5_1 | 0;
          HEAP32[$3_1 >> 2] = $7_1;
          HEAP32[($7_1 + 24 | 0) >> 2] = $3_1;
          break block57;
         }
         $0_1 = $4_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
         $5_1 = HEAP32[$3_1 >> 2] | 0;
         label5 : while (1) {
          $3_1 = $5_1;
          if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($4_1 | 0)) {
           break block58
          }
          $5_1 = $0_1 >>> 29 | 0;
          $0_1 = $0_1 << 1 | 0;
          $2_1 = $3_1 + ($5_1 & 4 | 0) | 0;
          $5_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
          if ($5_1) {
           continue label5
          }
          break label5;
         };
         $0_1 = $2_1 + 16 | 0;
         if ($0_1 >>> 0 < $12_1 >>> 0) {
          break block4
         }
         HEAP32[$0_1 >> 2] = $7_1;
         HEAP32[($7_1 + 24 | 0) >> 2] = $3_1;
        }
        HEAP32[($7_1 + 12 | 0) >> 2] = $7_1;
        HEAP32[($7_1 + 8 | 0) >> 2] = $7_1;
        break block51;
       }
       if ($3_1 >>> 0 < $12_1 >>> 0) {
        break block4
       }
       $0_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
       if ($0_1 >>> 0 < $12_1 >>> 0) {
        break block4
       }
       HEAP32[($0_1 + 12 | 0) >> 2] = $7_1;
       HEAP32[($3_1 + 8 | 0) >> 2] = $7_1;
       HEAP32[($7_1 + 24 | 0) >> 2] = 0;
       HEAP32[($7_1 + 12 | 0) >> 2] = $3_1;
       HEAP32[($7_1 + 8 | 0) >> 2] = $0_1;
      }
      $0_1 = $8_1 + 8 | 0;
      break block5;
     }
     block59 : {
      $0_1 = HEAP32[(0 + 8396032 | 0) >> 2] | 0;
      if ($0_1 >>> 0 < $3_1 >>> 0) {
       break block59
      }
      $4_1 = HEAP32[(0 + 8396044 | 0) >> 2] | 0;
      block61 : {
       block60 : {
        $5_1 = $0_1 - $3_1 | 0;
        if ($5_1 >>> 0 < 16 >>> 0) {
         break block60
        }
        $7_1 = $4_1 + $3_1 | 0;
        HEAP32[($7_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
        HEAP32[($4_1 + $0_1 | 0) >> 2] = $5_1;
        HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
        break block61;
       }
       HEAP32[($4_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
       $0_1 = $4_1 + $0_1 | 0;
       HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
       $7_1 = 0;
       $5_1 = 0;
      }
      HEAP32[(0 + 8396032 | 0) >> 2] = $5_1;
      HEAP32[(0 + 8396044 | 0) >> 2] = $7_1;
      $0_1 = $4_1 + 8 | 0;
      break block5;
     }
     block62 : {
      $7_1 = HEAP32[(0 + 8396036 | 0) >> 2] | 0;
      if ($7_1 >>> 0 <= $3_1 >>> 0) {
       break block62
      }
      $4_1 = $7_1 - $3_1 | 0;
      HEAP32[(0 + 8396036 | 0) >> 2] = $4_1;
      $0_1 = HEAP32[(0 + 8396048 | 0) >> 2] | 0;
      $5_1 = $0_1 + $3_1 | 0;
      HEAP32[(0 + 8396048 | 0) >> 2] = $5_1;
      HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
      $0_1 = $0_1 + 8 | 0;
      break block5;
     }
     block64 : {
      block63 : {
       if (!(HEAP32[(0 + 8396496 | 0) >> 2] | 0)) {
        break block63
       }
       $4_1 = HEAP32[(0 + 8396504 | 0) >> 2] | 0;
       break block64;
      }
      i64toi32_i32$1 = 0;
      i64toi32_i32$0 = -1;
      HEAP32[(i64toi32_i32$1 + 8396508 | 0) >> 2] = -1;
      HEAP32[(i64toi32_i32$1 + 8396512 | 0) >> 2] = i64toi32_i32$0;
      i64toi32_i32$1 = 0;
      i64toi32_i32$0 = 4096;
      HEAP32[(i64toi32_i32$1 + 8396500 | 0) >> 2] = 4096;
      HEAP32[(i64toi32_i32$1 + 8396504 | 0) >> 2] = i64toi32_i32$0;
      HEAP32[(0 + 8396496 | 0) >> 2] = (($1_1 + 12 | 0) & -16 | 0) ^ 1431655768 | 0;
      HEAP32[(0 + 8396516 | 0) >> 2] = 0;
      HEAP32[(0 + 8396468 | 0) >> 2] = 0;
      $4_1 = 4096;
     }
     $0_1 = 0;
     $6_1 = $3_1 + 47 | 0;
     $2_1 = $4_1 + $6_1 | 0;
     $12_1 = 0 - $4_1 | 0;
     $8_1 = $2_1 & $12_1 | 0;
     if ($8_1 >>> 0 <= $3_1 >>> 0) {
      break block5
     }
     $0_1 = 0;
     block65 : {
      $4_1 = HEAP32[(0 + 8396464 | 0) >> 2] | 0;
      if (!$4_1) {
       break block65
      }
      $5_1 = HEAP32[(0 + 8396456 | 0) >> 2] | 0;
      $11_1 = $5_1 + $8_1 | 0;
      if ($11_1 >>> 0 <= $5_1 >>> 0) {
       break block5
      }
      if ($11_1 >>> 0 > $4_1 >>> 0) {
       break block5
      }
     }
     block77 : {
      block74 : {
       block66 : {
        if ((HEAPU8[(0 + 8396468 | 0) >> 0] | 0) & 4 | 0) {
         break block66
        }
        block70 : {
         block75 : {
          block73 : {
           block69 : {
            block67 : {
             $4_1 = HEAP32[(0 + 8396048 | 0) >> 2] | 0;
             if (!$4_1) {
              break block67
             }
             $0_1 = 8396472;
             label6 : while (1) {
              block68 : {
               $5_1 = HEAP32[$0_1 >> 2] | 0;
               if ($4_1 >>> 0 < $5_1 >>> 0) {
                break block68
               }
               if ($4_1 >>> 0 < ($5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0) >>> 0) {
                break block69
               }
              }
              $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
              if ($0_1) {
               continue label6
              }
              break label6;
             };
            }
            $7_1 = $30(0 | 0) | 0;
            if (($7_1 | 0) == (-1 | 0)) {
             break block70
            }
            $2_1 = $8_1;
            block71 : {
             $0_1 = HEAP32[(0 + 8396500 | 0) >> 2] | 0;
             $4_1 = $0_1 + -1 | 0;
             if (!($4_1 & $7_1 | 0)) {
              break block71
             }
             $2_1 = ($8_1 - $7_1 | 0) + (($4_1 + $7_1 | 0) & (0 - $0_1 | 0) | 0) | 0;
            }
            if ($2_1 >>> 0 <= $3_1 >>> 0) {
             break block70
            }
            block72 : {
             $0_1 = HEAP32[(0 + 8396464 | 0) >> 2] | 0;
             if (!$0_1) {
              break block72
             }
             $4_1 = HEAP32[(0 + 8396456 | 0) >> 2] | 0;
             $5_1 = $4_1 + $2_1 | 0;
             if ($5_1 >>> 0 <= $4_1 >>> 0) {
              break block70
             }
             if ($5_1 >>> 0 > $0_1 >>> 0) {
              break block70
             }
            }
            $0_1 = $30($2_1 | 0) | 0;
            if (($0_1 | 0) != ($7_1 | 0)) {
             break block73
            }
            break block74;
           }
           $2_1 = ($2_1 - $7_1 | 0) & $12_1 | 0;
           $7_1 = $30($2_1 | 0) | 0;
           if (($7_1 | 0) == ((HEAP32[$0_1 >> 2] | 0) + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0 | 0)) {
            break block75
           }
           $0_1 = $7_1;
          }
          if (($0_1 | 0) == (-1 | 0)) {
           break block70
          }
          block76 : {
           if ($2_1 >>> 0 < ($3_1 + 48 | 0) >>> 0) {
            break block76
           }
           $7_1 = $0_1;
           break block74;
          }
          $4_1 = HEAP32[(0 + 8396504 | 0) >> 2] | 0;
          $4_1 = (($6_1 - $2_1 | 0) + $4_1 | 0) & (0 - $4_1 | 0) | 0;
          if (($30($4_1 | 0) | 0 | 0) == (-1 | 0)) {
           break block70
          }
          $2_1 = $4_1 + $2_1 | 0;
          $7_1 = $0_1;
          break block74;
         }
         if (($7_1 | 0) != (-1 | 0)) {
          break block74
         }
        }
        HEAP32[(0 + 8396468 | 0) >> 2] = HEAP32[(0 + 8396468 | 0) >> 2] | 0 | 4 | 0;
       }
       $7_1 = $30($8_1 | 0) | 0;
       $0_1 = $30(0 | 0) | 0;
       if (($7_1 | 0) == (-1 | 0)) {
        break block77
       }
       if (($0_1 | 0) == (-1 | 0)) {
        break block77
       }
       if ($7_1 >>> 0 >= $0_1 >>> 0) {
        break block77
       }
       $2_1 = $0_1 - $7_1 | 0;
       if ($2_1 >>> 0 <= ($3_1 + 40 | 0) >>> 0) {
        break block77
       }
      }
      $0_1 = (HEAP32[(0 + 8396456 | 0) >> 2] | 0) + $2_1 | 0;
      HEAP32[(0 + 8396456 | 0) >> 2] = $0_1;
      block78 : {
       if ($0_1 >>> 0 <= (HEAP32[(0 + 8396460 | 0) >> 2] | 0) >>> 0) {
        break block78
       }
       HEAP32[(0 + 8396460 | 0) >> 2] = $0_1;
      }
      block84 : {
       block81 : {
        block80 : {
         block79 : {
          $4_1 = HEAP32[(0 + 8396048 | 0) >> 2] | 0;
          if (!$4_1) {
           break block79
          }
          $0_1 = 8396472;
          label7 : while (1) {
           $5_1 = HEAP32[$0_1 >> 2] | 0;
           $8_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
           if (($7_1 | 0) == ($5_1 + $8_1 | 0 | 0)) {
            break block80
           }
           $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           if ($0_1) {
            continue label7
           }
           break block81;
          };
         }
         block83 : {
          block82 : {
           $0_1 = HEAP32[(0 + 8396040 | 0) >> 2] | 0;
           if (!$0_1) {
            break block82
           }
           if ($7_1 >>> 0 >= $0_1 >>> 0) {
            break block83
           }
          }
          HEAP32[(0 + 8396040 | 0) >> 2] = $7_1;
         }
         $0_1 = 0;
         HEAP32[(0 + 8396476 | 0) >> 2] = $2_1;
         HEAP32[(0 + 8396472 | 0) >> 2] = $7_1;
         HEAP32[(0 + 8396056 | 0) >> 2] = -1;
         HEAP32[(0 + 8396060 | 0) >> 2] = HEAP32[(0 + 8396496 | 0) >> 2] | 0;
         HEAP32[(0 + 8396484 | 0) >> 2] = 0;
         label8 : while (1) {
          $4_1 = $0_1 << 3 | 0;
          $5_1 = $4_1 + 8396064 | 0;
          HEAP32[($4_1 + 8396072 | 0) >> 2] = $5_1;
          HEAP32[($4_1 + 8396076 | 0) >> 2] = $5_1;
          $0_1 = $0_1 + 1 | 0;
          if (($0_1 | 0) != (32 | 0)) {
           continue label8
          }
          break label8;
         };
         $0_1 = $2_1 + -40 | 0;
         $4_1 = (-8 - $7_1 | 0) & 7 | 0;
         $5_1 = $0_1 - $4_1 | 0;
         HEAP32[(0 + 8396036 | 0) >> 2] = $5_1;
         $4_1 = $7_1 + $4_1 | 0;
         HEAP32[(0 + 8396048 | 0) >> 2] = $4_1;
         HEAP32[($4_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
         HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
         HEAP32[(0 + 8396052 | 0) >> 2] = HEAP32[(0 + 8396512 | 0) >> 2] | 0;
         break block84;
        }
        if ($4_1 >>> 0 >= $7_1 >>> 0) {
         break block81
        }
        if ($4_1 >>> 0 < $5_1 >>> 0) {
         break block81
        }
        if ((HEAP32[($0_1 + 12 | 0) >> 2] | 0) & 8 | 0) {
         break block81
        }
        HEAP32[($0_1 + 4 | 0) >> 2] = $8_1 + $2_1 | 0;
        $0_1 = (-8 - $4_1 | 0) & 7 | 0;
        $5_1 = $4_1 + $0_1 | 0;
        HEAP32[(0 + 8396048 | 0) >> 2] = $5_1;
        $7_1 = (HEAP32[(0 + 8396036 | 0) >> 2] | 0) + $2_1 | 0;
        $0_1 = $7_1 - $0_1 | 0;
        HEAP32[(0 + 8396036 | 0) >> 2] = $0_1;
        HEAP32[($5_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
        HEAP32[(($4_1 + $7_1 | 0) + 4 | 0) >> 2] = 40;
        HEAP32[(0 + 8396052 | 0) >> 2] = HEAP32[(0 + 8396512 | 0) >> 2] | 0;
        break block84;
       }
       block85 : {
        if ($7_1 >>> 0 >= (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
         break block85
        }
        HEAP32[(0 + 8396040 | 0) >> 2] = $7_1;
       }
       $5_1 = $7_1 + $2_1 | 0;
       $0_1 = 8396472;
       block87 : {
        block86 : {
         label9 : while (1) {
          $8_1 = HEAP32[$0_1 >> 2] | 0;
          if (($8_1 | 0) == ($5_1 | 0)) {
           break block86
          }
          $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
          if ($0_1) {
           continue label9
          }
          break block87;
         };
        }
        if (!((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0)) {
         break block88
        }
       }
       $0_1 = 8396472;
       block90 : {
        label10 : while (1) {
         block89 : {
          $5_1 = HEAP32[$0_1 >> 2] | 0;
          if ($4_1 >>> 0 < $5_1 >>> 0) {
           break block89
          }
          $5_1 = $5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0;
          if ($4_1 >>> 0 < $5_1 >>> 0) {
           break block90
          }
         }
         $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
         continue label10;
        };
       }
       $0_1 = $2_1 + -40 | 0;
       $8_1 = (-8 - $7_1 | 0) & 7 | 0;
       $12_1 = $0_1 - $8_1 | 0;
       HEAP32[(0 + 8396036 | 0) >> 2] = $12_1;
       $8_1 = $7_1 + $8_1 | 0;
       HEAP32[(0 + 8396048 | 0) >> 2] = $8_1;
       HEAP32[($8_1 + 4 | 0) >> 2] = $12_1 | 1 | 0;
       HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
       HEAP32[(0 + 8396052 | 0) >> 2] = HEAP32[(0 + 8396512 | 0) >> 2] | 0;
       $0_1 = ($5_1 + ((39 - $5_1 | 0) & 7 | 0) | 0) + -47 | 0;
       $8_1 = $0_1 >>> 0 < ($4_1 + 16 | 0) >>> 0 ? $4_1 : $0_1;
       HEAP32[($8_1 + 4 | 0) >> 2] = 27;
       i64toi32_i32$2 = 0;
       i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 8396480 | 0) >> 2] | 0;
       i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 8396484 | 0) >> 2] | 0;
       $1154 = i64toi32_i32$0;
       i64toi32_i32$0 = $8_1 + 16 | 0;
       HEAP32[i64toi32_i32$0 >> 2] = $1154;
       HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
       i64toi32_i32$2 = 0;
       i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 8396472 | 0) >> 2] | 0;
       i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 8396476 | 0) >> 2] | 0;
       $1156 = i64toi32_i32$1;
       i64toi32_i32$1 = $8_1;
       HEAP32[($8_1 + 8 | 0) >> 2] = $1156;
       HEAP32[($8_1 + 12 | 0) >> 2] = i64toi32_i32$0;
       HEAP32[(0 + 8396480 | 0) >> 2] = $8_1 + 8 | 0;
       HEAP32[(0 + 8396476 | 0) >> 2] = $2_1;
       HEAP32[(0 + 8396472 | 0) >> 2] = $7_1;
       HEAP32[(0 + 8396484 | 0) >> 2] = 0;
       $0_1 = $8_1 + 24 | 0;
       label11 : while (1) {
        HEAP32[($0_1 + 4 | 0) >> 2] = 7;
        $7_1 = $0_1 + 8 | 0;
        $0_1 = $0_1 + 4 | 0;
        if ($7_1 >>> 0 < $5_1 >>> 0) {
         continue label11
        }
        break label11;
       };
       if (($8_1 | 0) == ($4_1 | 0)) {
        break block84
       }
       HEAP32[($8_1 + 4 | 0) >> 2] = (HEAP32[($8_1 + 4 | 0) >> 2] | 0) & -2 | 0;
       $7_1 = $8_1 - $4_1 | 0;
       HEAP32[($4_1 + 4 | 0) >> 2] = $7_1 | 1 | 0;
       HEAP32[$8_1 >> 2] = $7_1;
       block94 : {
        block91 : {
         if ($7_1 >>> 0 > 255 >>> 0) {
          break block91
         }
         $0_1 = ($7_1 & -8 | 0) + 8396064 | 0;
         block93 : {
          block92 : {
           $5_1 = HEAP32[(0 + 8396024 | 0) >> 2] | 0;
           $7_1 = 1 << ($7_1 >>> 3 | 0) | 0;
           if ($5_1 & $7_1 | 0) {
            break block92
           }
           HEAP32[(0 + 8396024 | 0) >> 2] = $5_1 | $7_1 | 0;
           $5_1 = $0_1;
           break block93;
          }
          $5_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
          if ($5_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
           break block4
          }
         }
         HEAP32[($0_1 + 8 | 0) >> 2] = $4_1;
         HEAP32[($5_1 + 12 | 0) >> 2] = $4_1;
         $7_1 = 12;
         $8_1 = 8;
         break block94;
        }
        $0_1 = 31;
        block95 : {
         if ($7_1 >>> 0 > 16777215 >>> 0) {
          break block95
         }
         $0_1 = Math_clz32($7_1 >>> 8 | 0);
         $0_1 = ((($7_1 >>> (38 - $0_1 | 0) | 0) & 1 | 0) - ($0_1 << 1 | 0) | 0) + 62 | 0;
        }
        HEAP32[($4_1 + 28 | 0) >> 2] = $0_1;
        i64toi32_i32$1 = $4_1;
        i64toi32_i32$0 = 0;
        HEAP32[($4_1 + 16 | 0) >> 2] = 0;
        HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$0;
        $5_1 = ($0_1 << 2 | 0) + 8396328 | 0;
        block98 : {
         block97 : {
          block96 : {
           $8_1 = HEAP32[(0 + 8396028 | 0) >> 2] | 0;
           $2_1 = 1 << $0_1 | 0;
           if ($8_1 & $2_1 | 0) {
            break block96
           }
           HEAP32[(0 + 8396028 | 0) >> 2] = $8_1 | $2_1 | 0;
           HEAP32[$5_1 >> 2] = $4_1;
           HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
           break block97;
          }
          $0_1 = $7_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
          $8_1 = HEAP32[$5_1 >> 2] | 0;
          label12 : while (1) {
           $5_1 = $8_1;
           if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($7_1 | 0)) {
            break block98
           }
           $8_1 = $0_1 >>> 29 | 0;
           $0_1 = $0_1 << 1 | 0;
           $2_1 = $5_1 + ($8_1 & 4 | 0) | 0;
           $8_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
           if ($8_1) {
            continue label12
           }
           break label12;
          };
          $0_1 = $2_1 + 16 | 0;
          if ($0_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
           break block4
          }
          HEAP32[$0_1 >> 2] = $4_1;
          HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
         }
         $7_1 = 8;
         $8_1 = 12;
         $5_1 = $4_1;
         $0_1 = $5_1;
         break block94;
        }
        $7_1 = HEAP32[(0 + 8396040 | 0) >> 2] | 0;
        if ($5_1 >>> 0 < $7_1 >>> 0) {
         break block4
        }
        $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
        if ($0_1 >>> 0 < $7_1 >>> 0) {
         break block4
        }
        HEAP32[($0_1 + 12 | 0) >> 2] = $4_1;
        HEAP32[($5_1 + 8 | 0) >> 2] = $4_1;
        HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
        $0_1 = 0;
        $7_1 = 24;
        $8_1 = 12;
       }
       HEAP32[($4_1 + $8_1 | 0) >> 2] = $5_1;
       HEAP32[($4_1 + $7_1 | 0) >> 2] = $0_1;
      }
      $0_1 = HEAP32[(0 + 8396036 | 0) >> 2] | 0;
      if ($0_1 >>> 0 <= $3_1 >>> 0) {
       break block77
      }
      $4_1 = $0_1 - $3_1 | 0;
      HEAP32[(0 + 8396036 | 0) >> 2] = $4_1;
      $0_1 = HEAP32[(0 + 8396048 | 0) >> 2] | 0;
      $5_1 = $0_1 + $3_1 | 0;
      HEAP32[(0 + 8396048 | 0) >> 2] = $5_1;
      HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
      $0_1 = $0_1 + 8 | 0;
      break block5;
     }
     HEAP32[($10() | 0) >> 2] = 48;
     $0_1 = 0;
     break block5;
    }
    $11();
    wasm2js_trap();
   }
   HEAP32[$0_1 >> 2] = $7_1;
   HEAP32[($0_1 + 4 | 0) >> 2] = (HEAP32[($0_1 + 4 | 0) >> 2] | 0) + $2_1 | 0;
   $0_1 = $26($7_1 | 0, $8_1 | 0, $3_1 | 0) | 0;
  }
  global$0 = $1_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $26($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $5_1 = 0, $8_1 = 0, $6_1 = 0, $9_1 = 0, $7_1 = 0, $3_1 = 0, $353 = 0;
  $3_1 = $0_1 + ((-8 - $0_1 | 0) & 7 | 0) | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 | 3 | 0;
  $4_1 = $1_1 + ((-8 - $1_1 | 0) & 7 | 0) | 0;
  $5_1 = $3_1 + $2_1 | 0;
  $0_1 = $4_1 - $5_1 | 0;
  block6 : {
   block1 : {
    block : {
     if (($4_1 | 0) != (HEAP32[(0 + 8396048 | 0) >> 2] | 0 | 0)) {
      break block
     }
     HEAP32[(0 + 8396048 | 0) >> 2] = $5_1;
     $2_1 = (HEAP32[(0 + 8396036 | 0) >> 2] | 0) + $0_1 | 0;
     HEAP32[(0 + 8396036 | 0) >> 2] = $2_1;
     HEAP32[($5_1 + 4 | 0) >> 2] = $2_1 | 1 | 0;
     break block1;
    }
    block2 : {
     if (($4_1 | 0) != (HEAP32[(0 + 8396044 | 0) >> 2] | 0 | 0)) {
      break block2
     }
     HEAP32[(0 + 8396044 | 0) >> 2] = $5_1;
     $2_1 = (HEAP32[(0 + 8396032 | 0) >> 2] | 0) + $0_1 | 0;
     HEAP32[(0 + 8396032 | 0) >> 2] = $2_1;
     HEAP32[($5_1 + 4 | 0) >> 2] = $2_1 | 1 | 0;
     HEAP32[($5_1 + $2_1 | 0) >> 2] = $2_1;
     break block1;
    }
    block3 : {
     $6_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
     if (($6_1 & 3 | 0 | 0) != (1 | 0)) {
      break block3
     }
     $2_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
     block8 : {
      block4 : {
       if ($6_1 >>> 0 > 255 >>> 0) {
        break block4
       }
       block5 : {
        $1_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
        $7_1 = $6_1 >>> 3 | 0;
        $8_1 = ($7_1 << 3 | 0) + 8396064 | 0;
        if (($1_1 | 0) == ($8_1 | 0)) {
         break block5
        }
        if ($1_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
         break block6
        }
        if ((HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
         break block6
        }
       }
       block7 : {
        if (($2_1 | 0) != ($1_1 | 0)) {
         break block7
        }
        HEAP32[(0 + 8396024 | 0) >> 2] = (HEAP32[(0 + 8396024 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $7_1 | 0) | 0) | 0;
        break block8;
       }
       block9 : {
        if (($2_1 | 0) == ($8_1 | 0)) {
         break block9
        }
        if ($2_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
         break block6
        }
        if ((HEAP32[($2_1 + 8 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
         break block6
        }
       }
       HEAP32[($1_1 + 12 | 0) >> 2] = $2_1;
       HEAP32[($2_1 + 8 | 0) >> 2] = $1_1;
       break block8;
      }
      $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
      block11 : {
       block10 : {
        if (($2_1 | 0) == ($4_1 | 0)) {
         break block10
        }
        $1_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
        if ($1_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
         break block6
        }
        if ((HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
         break block6
        }
        if ((HEAP32[($2_1 + 8 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
         break block6
        }
        HEAP32[($1_1 + 12 | 0) >> 2] = $2_1;
        HEAP32[($2_1 + 8 | 0) >> 2] = $1_1;
        break block11;
       }
       block14 : {
        block13 : {
         block12 : {
          $1_1 = HEAP32[($4_1 + 20 | 0) >> 2] | 0;
          if (!$1_1) {
           break block12
          }
          $8_1 = $4_1 + 20 | 0;
          break block13;
         }
         $1_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
         if (!$1_1) {
          break block14
         }
         $8_1 = $4_1 + 16 | 0;
        }
        label : while (1) {
         $7_1 = $8_1;
         $2_1 = $1_1;
         $8_1 = $2_1 + 20 | 0;
         $1_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
         if ($1_1) {
          continue label
         }
         $8_1 = $2_1 + 16 | 0;
         $1_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
         if ($1_1) {
          continue label
         }
         break label;
        };
        if ($7_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
         break block6
        }
        HEAP32[$7_1 >> 2] = 0;
        break block11;
       }
       $2_1 = 0;
      }
      if (!$9_1) {
       break block8
      }
      block16 : {
       block15 : {
        $8_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
        $1_1 = ($8_1 << 2 | 0) + 8396328 | 0;
        if (($4_1 | 0) != (HEAP32[$1_1 >> 2] | 0 | 0)) {
         break block15
        }
        HEAP32[$1_1 >> 2] = $2_1;
        if ($2_1) {
         break block16
        }
        HEAP32[(0 + 8396028 | 0) >> 2] = (HEAP32[(0 + 8396028 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $8_1 | 0) | 0) | 0;
        break block8;
       }
       if ($9_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
        break block6
       }
       block18 : {
        block17 : {
         if ((HEAP32[($9_1 + 16 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
          break block17
         }
         HEAP32[($9_1 + 16 | 0) >> 2] = $2_1;
         break block18;
        }
        HEAP32[($9_1 + 20 | 0) >> 2] = $2_1;
       }
       if (!$2_1) {
        break block8
       }
      }
      $8_1 = HEAP32[(0 + 8396040 | 0) >> 2] | 0;
      if ($2_1 >>> 0 < $8_1 >>> 0) {
       break block6
      }
      HEAP32[($2_1 + 24 | 0) >> 2] = $9_1;
      block19 : {
       $1_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
       if (!$1_1) {
        break block19
       }
       if ($1_1 >>> 0 < $8_1 >>> 0) {
        break block6
       }
       HEAP32[($2_1 + 16 | 0) >> 2] = $1_1;
       HEAP32[($1_1 + 24 | 0) >> 2] = $2_1;
      }
      $1_1 = HEAP32[($4_1 + 20 | 0) >> 2] | 0;
      if (!$1_1) {
       break block8
      }
      if ($1_1 >>> 0 < $8_1 >>> 0) {
       break block6
      }
      HEAP32[($2_1 + 20 | 0) >> 2] = $1_1;
      HEAP32[($1_1 + 24 | 0) >> 2] = $2_1;
     }
     $2_1 = $6_1 & -8 | 0;
     $0_1 = $2_1 + $0_1 | 0;
     $4_1 = $4_1 + $2_1 | 0;
     $6_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
    }
    HEAP32[($4_1 + 4 | 0) >> 2] = $6_1 & -2 | 0;
    HEAP32[($5_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($5_1 + $0_1 | 0) >> 2] = $0_1;
    block20 : {
     if ($0_1 >>> 0 > 255 >>> 0) {
      break block20
     }
     $2_1 = ($0_1 & -8 | 0) + 8396064 | 0;
     block22 : {
      block21 : {
       $1_1 = HEAP32[(0 + 8396024 | 0) >> 2] | 0;
       $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
       if ($1_1 & $0_1 | 0) {
        break block21
       }
       HEAP32[(0 + 8396024 | 0) >> 2] = $1_1 | $0_1 | 0;
       $0_1 = $2_1;
       break block22;
      }
      $0_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
      if ($0_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
       break block6
      }
     }
     HEAP32[($2_1 + 8 | 0) >> 2] = $5_1;
     HEAP32[($0_1 + 12 | 0) >> 2] = $5_1;
     HEAP32[($5_1 + 12 | 0) >> 2] = $2_1;
     HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
     break block1;
    }
    $2_1 = 31;
    block23 : {
     if ($0_1 >>> 0 > 16777215 >>> 0) {
      break block23
     }
     $2_1 = Math_clz32($0_1 >>> 8 | 0);
     $2_1 = ((($0_1 >>> (38 - $2_1 | 0) | 0) & 1 | 0) - ($2_1 << 1 | 0) | 0) + 62 | 0;
    }
    HEAP32[($5_1 + 28 | 0) >> 2] = $2_1;
    HEAP32[($5_1 + 16 | 0) >> 2] = 0;
    HEAP32[($5_1 + 20 | 0) >> 2] = 0;
    $1_1 = ($2_1 << 2 | 0) + 8396328 | 0;
    block26 : {
     block25 : {
      block24 : {
       $8_1 = HEAP32[(0 + 8396028 | 0) >> 2] | 0;
       $4_1 = 1 << $2_1 | 0;
       if ($8_1 & $4_1 | 0) {
        break block24
       }
       HEAP32[(0 + 8396028 | 0) >> 2] = $8_1 | $4_1 | 0;
       HEAP32[$1_1 >> 2] = $5_1;
       HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
       break block25;
      }
      $2_1 = $0_1 << (($2_1 | 0) == (31 | 0) ? 0 : 25 - ($2_1 >>> 1 | 0) | 0) | 0;
      $8_1 = HEAP32[$1_1 >> 2] | 0;
      label1 : while (1) {
       $1_1 = $8_1;
       if (((HEAP32[($1_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
        break block26
       }
       $8_1 = $2_1 >>> 29 | 0;
       $2_1 = $2_1 << 1 | 0;
       $4_1 = $1_1 + ($8_1 & 4 | 0) | 0;
       $8_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
       if ($8_1) {
        continue label1
       }
       break label1;
      };
      $2_1 = $4_1 + 16 | 0;
      if ($2_1 >>> 0 < (HEAP32[(0 + 8396040 | 0) >> 2] | 0) >>> 0) {
       break block6
      }
      HEAP32[$2_1 >> 2] = $5_1;
      HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
     }
     HEAP32[($5_1 + 12 | 0) >> 2] = $5_1;
     HEAP32[($5_1 + 8 | 0) >> 2] = $5_1;
     break block1;
    }
    $0_1 = HEAP32[(0 + 8396040 | 0) >> 2] | 0;
    if ($1_1 >>> 0 < $0_1 >>> 0) {
     break block6
    }
    $2_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
    if ($2_1 >>> 0 < $0_1 >>> 0) {
     break block6
    }
    HEAP32[($2_1 + 12 | 0) >> 2] = $5_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $5_1;
    HEAP32[($5_1 + 24 | 0) >> 2] = 0;
    HEAP32[($5_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($5_1 + 8 | 0) >> 2] = $2_1;
   }
   return $3_1 + 8 | 0 | 0;
  }
  $11();
  wasm2js_trap();
 }
 
 function $27($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $1_1 = 0, $6_1 = 0, $4_1 = 0, $2_1 = 0, $7_1 = 0, $8_1 = 0, $10_1 = 0, $9_1 = 0;
  block1 : {
   block : {
    if (!$0_1) {
     break block
    }
    $1_1 = $0_1 + -8 | 0;
    $2_1 = HEAP32[(0 + 8396040 | 0) >> 2] | 0;
    if ($1_1 >>> 0 < $2_1 >>> 0) {
     break block1
    }
    $3_1 = HEAP32[($0_1 + -4 | 0) >> 2] | 0;
    if (($3_1 & 3 | 0 | 0) == (1 | 0)) {
     break block1
    }
    $0_1 = $3_1 & -8 | 0;
    $4_1 = $1_1 + $0_1 | 0;
    block2 : {
     if ($3_1 & 1 | 0) {
      break block2
     }
     if (!($3_1 & 2 | 0)) {
      break block
     }
     $5_1 = HEAP32[$1_1 >> 2] | 0;
     $1_1 = $1_1 - $5_1 | 0;
     if ($1_1 >>> 0 < $2_1 >>> 0) {
      break block1
     }
     $0_1 = $5_1 + $0_1 | 0;
     block3 : {
      if (($1_1 | 0) == (HEAP32[(0 + 8396044 | 0) >> 2] | 0 | 0)) {
       break block3
      }
      $3_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
      block4 : {
       if ($5_1 >>> 0 > 255 >>> 0) {
        break block4
       }
       block5 : {
        $6_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
        $7_1 = $5_1 >>> 3 | 0;
        $5_1 = ($7_1 << 3 | 0) + 8396064 | 0;
        if (($6_1 | 0) == ($5_1 | 0)) {
         break block5
        }
        if ($6_1 >>> 0 < $2_1 >>> 0) {
         break block1
        }
        if ((HEAP32[($6_1 + 12 | 0) >> 2] | 0 | 0) != ($1_1 | 0)) {
         break block1
        }
       }
       block6 : {
        if (($3_1 | 0) != ($6_1 | 0)) {
         break block6
        }
        HEAP32[(0 + 8396024 | 0) >> 2] = (HEAP32[(0 + 8396024 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $7_1 | 0) | 0) | 0;
        break block2;
       }
       block7 : {
        if (($3_1 | 0) == ($5_1 | 0)) {
         break block7
        }
        if ($3_1 >>> 0 < $2_1 >>> 0) {
         break block1
        }
        if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != ($1_1 | 0)) {
         break block1
        }
       }
       HEAP32[($6_1 + 12 | 0) >> 2] = $3_1;
       HEAP32[($3_1 + 8 | 0) >> 2] = $6_1;
       break block2;
      }
      $8_1 = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
      block9 : {
       block8 : {
        if (($3_1 | 0) == ($1_1 | 0)) {
         break block8
        }
        $5_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
        if ($5_1 >>> 0 < $2_1 >>> 0) {
         break block1
        }
        if ((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != ($1_1 | 0)) {
         break block1
        }
        if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != ($1_1 | 0)) {
         break block1
        }
        HEAP32[($5_1 + 12 | 0) >> 2] = $3_1;
        HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
        break block9;
       }
       block12 : {
        block11 : {
         block10 : {
          $5_1 = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
          if (!$5_1) {
           break block10
          }
          $6_1 = $1_1 + 20 | 0;
          break block11;
         }
         $5_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
         if (!$5_1) {
          break block12
         }
         $6_1 = $1_1 + 16 | 0;
        }
        label : while (1) {
         $7_1 = $6_1;
         $3_1 = $5_1;
         $6_1 = $3_1 + 20 | 0;
         $5_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
         if ($5_1) {
          continue label
         }
         $6_1 = $3_1 + 16 | 0;
         $5_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
         if ($5_1) {
          continue label
         }
         break label;
        };
        if ($7_1 >>> 0 < $2_1 >>> 0) {
         break block1
        }
        HEAP32[$7_1 >> 2] = 0;
        break block9;
       }
       $3_1 = 0;
      }
      if (!$8_1) {
       break block2
      }
      block14 : {
       block13 : {
        $6_1 = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
        $5_1 = ($6_1 << 2 | 0) + 8396328 | 0;
        if (($1_1 | 0) != (HEAP32[$5_1 >> 2] | 0 | 0)) {
         break block13
        }
        HEAP32[$5_1 >> 2] = $3_1;
        if ($3_1) {
         break block14
        }
        HEAP32[(0 + 8396028 | 0) >> 2] = (HEAP32[(0 + 8396028 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $6_1 | 0) | 0) | 0;
        break block2;
       }
       if ($8_1 >>> 0 < $2_1 >>> 0) {
        break block1
       }
       block16 : {
        block15 : {
         if ((HEAP32[($8_1 + 16 | 0) >> 2] | 0 | 0) != ($1_1 | 0)) {
          break block15
         }
         HEAP32[($8_1 + 16 | 0) >> 2] = $3_1;
         break block16;
        }
        HEAP32[($8_1 + 20 | 0) >> 2] = $3_1;
       }
       if (!$3_1) {
        break block2
       }
      }
      if ($3_1 >>> 0 < $2_1 >>> 0) {
       break block1
      }
      HEAP32[($3_1 + 24 | 0) >> 2] = $8_1;
      block17 : {
       $5_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
       if (!$5_1) {
        break block17
       }
       if ($5_1 >>> 0 < $2_1 >>> 0) {
        break block1
       }
       HEAP32[($3_1 + 16 | 0) >> 2] = $5_1;
       HEAP32[($5_1 + 24 | 0) >> 2] = $3_1;
      }
      $5_1 = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
      if (!$5_1) {
       break block2
      }
      if ($5_1 >>> 0 < $2_1 >>> 0) {
       break block1
      }
      HEAP32[($3_1 + 20 | 0) >> 2] = $5_1;
      HEAP32[($5_1 + 24 | 0) >> 2] = $3_1;
      break block2;
     }
     $3_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
     if (($3_1 & 3 | 0 | 0) != (3 | 0)) {
      break block2
     }
     HEAP32[(0 + 8396032 | 0) >> 2] = $0_1;
     HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 & -2 | 0;
     HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
     HEAP32[$4_1 >> 2] = $0_1;
     return;
    }
    if ($1_1 >>> 0 >= $4_1 >>> 0) {
     break block1
    }
    $7_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
    if (!($7_1 & 1 | 0)) {
     break block1
    }
    block36 : {
     block18 : {
      if ($7_1 & 2 | 0) {
       break block18
      }
      block19 : {
       if (($4_1 | 0) != (HEAP32[(0 + 8396048 | 0) >> 2] | 0 | 0)) {
        break block19
       }
       HEAP32[(0 + 8396048 | 0) >> 2] = $1_1;
       $0_1 = (HEAP32[(0 + 8396036 | 0) >> 2] | 0) + $0_1 | 0;
       HEAP32[(0 + 8396036 | 0) >> 2] = $0_1;
       HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
       if (($1_1 | 0) != (HEAP32[(0 + 8396044 | 0) >> 2] | 0 | 0)) {
        break block
       }
       HEAP32[(0 + 8396032 | 0) >> 2] = 0;
       HEAP32[(0 + 8396044 | 0) >> 2] = 0;
       return;
      }
      block20 : {
       $9_1 = HEAP32[(0 + 8396044 | 0) >> 2] | 0;
       if (($4_1 | 0) != ($9_1 | 0)) {
        break block20
       }
       HEAP32[(0 + 8396044 | 0) >> 2] = $1_1;
       $0_1 = (HEAP32[(0 + 8396032 | 0) >> 2] | 0) + $0_1 | 0;
       HEAP32[(0 + 8396032 | 0) >> 2] = $0_1;
       HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
       HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
       return;
      }
      $3_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
      block24 : {
       block21 : {
        if ($7_1 >>> 0 > 255 >>> 0) {
         break block21
        }
        block22 : {
         $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
         $8_1 = $7_1 >>> 3 | 0;
         $6_1 = ($8_1 << 3 | 0) + 8396064 | 0;
         if (($5_1 | 0) == ($6_1 | 0)) {
          break block22
         }
         if ($5_1 >>> 0 < $2_1 >>> 0) {
          break block1
         }
         if ((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
          break block1
         }
        }
        block23 : {
         if (($3_1 | 0) != ($5_1 | 0)) {
          break block23
         }
         HEAP32[(0 + 8396024 | 0) >> 2] = (HEAP32[(0 + 8396024 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $8_1 | 0) | 0) | 0;
         break block24;
        }
        block25 : {
         if (($3_1 | 0) == ($6_1 | 0)) {
          break block25
         }
         if ($3_1 >>> 0 < $2_1 >>> 0) {
          break block1
         }
         if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
          break block1
         }
        }
        HEAP32[($5_1 + 12 | 0) >> 2] = $3_1;
        HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
        break block24;
       }
       $10_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
       block27 : {
        block26 : {
         if (($3_1 | 0) == ($4_1 | 0)) {
          break block26
         }
         $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
         if ($5_1 >>> 0 < $2_1 >>> 0) {
          break block1
         }
         if ((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
          break block1
         }
         if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
          break block1
         }
         HEAP32[($5_1 + 12 | 0) >> 2] = $3_1;
         HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
         break block27;
        }
        block30 : {
         block29 : {
          block28 : {
           $5_1 = HEAP32[($4_1 + 20 | 0) >> 2] | 0;
           if (!$5_1) {
            break block28
           }
           $6_1 = $4_1 + 20 | 0;
           break block29;
          }
          $5_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
          if (!$5_1) {
           break block30
          }
          $6_1 = $4_1 + 16 | 0;
         }
         label1 : while (1) {
          $8_1 = $6_1;
          $3_1 = $5_1;
          $6_1 = $3_1 + 20 | 0;
          $5_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
          if ($5_1) {
           continue label1
          }
          $6_1 = $3_1 + 16 | 0;
          $5_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
          if ($5_1) {
           continue label1
          }
          break label1;
         };
         if ($8_1 >>> 0 < $2_1 >>> 0) {
          break block1
         }
         HEAP32[$8_1 >> 2] = 0;
         break block27;
        }
        $3_1 = 0;
       }
       if (!$10_1) {
        break block24
       }
       block32 : {
        block31 : {
         $6_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
         $5_1 = ($6_1 << 2 | 0) + 8396328 | 0;
         if (($4_1 | 0) != (HEAP32[$5_1 >> 2] | 0 | 0)) {
          break block31
         }
         HEAP32[$5_1 >> 2] = $3_1;
         if ($3_1) {
          break block32
         }
         HEAP32[(0 + 8396028 | 0) >> 2] = (HEAP32[(0 + 8396028 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $6_1 | 0) | 0) | 0;
         break block24;
        }
        if ($10_1 >>> 0 < $2_1 >>> 0) {
         break block1
        }
        block34 : {
         block33 : {
          if ((HEAP32[($10_1 + 16 | 0) >> 2] | 0 | 0) != ($4_1 | 0)) {
           break block33
          }
          HEAP32[($10_1 + 16 | 0) >> 2] = $3_1;
          break block34;
         }
         HEAP32[($10_1 + 20 | 0) >> 2] = $3_1;
        }
        if (!$3_1) {
         break block24
        }
       }
       if ($3_1 >>> 0 < $2_1 >>> 0) {
        break block1
       }
       HEAP32[($3_1 + 24 | 0) >> 2] = $10_1;
       block35 : {
        $5_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
        if (!$5_1) {
         break block35
        }
        if ($5_1 >>> 0 < $2_1 >>> 0) {
         break block1
        }
        HEAP32[($3_1 + 16 | 0) >> 2] = $5_1;
        HEAP32[($5_1 + 24 | 0) >> 2] = $3_1;
       }
       $5_1 = HEAP32[($4_1 + 20 | 0) >> 2] | 0;
       if (!$5_1) {
        break block24
       }
       if ($5_1 >>> 0 < $2_1 >>> 0) {
        break block1
       }
       HEAP32[($3_1 + 20 | 0) >> 2] = $5_1;
       HEAP32[($5_1 + 24 | 0) >> 2] = $3_1;
      }
      $0_1 = ($7_1 & -8 | 0) + $0_1 | 0;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
      if (($1_1 | 0) != ($9_1 | 0)) {
       break block36
      }
      HEAP32[(0 + 8396032 | 0) >> 2] = $0_1;
      return;
     }
     HEAP32[($4_1 + 4 | 0) >> 2] = $7_1 & -2 | 0;
     HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
     HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
    }
    block37 : {
     if ($0_1 >>> 0 > 255 >>> 0) {
      break block37
     }
     $3_1 = ($0_1 & -8 | 0) + 8396064 | 0;
     block39 : {
      block38 : {
       $5_1 = HEAP32[(0 + 8396024 | 0) >> 2] | 0;
       $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
       if ($5_1 & $0_1 | 0) {
        break block38
       }
       HEAP32[(0 + 8396024 | 0) >> 2] = $5_1 | $0_1 | 0;
       $0_1 = $3_1;
       break block39;
      }
      $0_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
      if ($0_1 >>> 0 < $2_1 >>> 0) {
       break block1
      }
     }
     HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
     HEAP32[($0_1 + 12 | 0) >> 2] = $1_1;
     HEAP32[($1_1 + 12 | 0) >> 2] = $3_1;
     HEAP32[($1_1 + 8 | 0) >> 2] = $0_1;
     return;
    }
    $3_1 = 31;
    block40 : {
     if ($0_1 >>> 0 > 16777215 >>> 0) {
      break block40
     }
     $3_1 = Math_clz32($0_1 >>> 8 | 0);
     $3_1 = ((($0_1 >>> (38 - $3_1 | 0) | 0) & 1 | 0) - ($3_1 << 1 | 0) | 0) + 62 | 0;
    }
    HEAP32[($1_1 + 28 | 0) >> 2] = $3_1;
    HEAP32[($1_1 + 16 | 0) >> 2] = 0;
    HEAP32[($1_1 + 20 | 0) >> 2] = 0;
    $6_1 = ($3_1 << 2 | 0) + 8396328 | 0;
    block44 : {
     block43 : {
      block42 : {
       block41 : {
        $5_1 = HEAP32[(0 + 8396028 | 0) >> 2] | 0;
        $4_1 = 1 << $3_1 | 0;
        if ($5_1 & $4_1 | 0) {
         break block41
        }
        HEAP32[(0 + 8396028 | 0) >> 2] = $5_1 | $4_1 | 0;
        HEAP32[$6_1 >> 2] = $1_1;
        $0_1 = 8;
        $3_1 = 24;
        break block42;
       }
       $3_1 = $0_1 << (($3_1 | 0) == (31 | 0) ? 0 : 25 - ($3_1 >>> 1 | 0) | 0) | 0;
       $6_1 = HEAP32[$6_1 >> 2] | 0;
       label2 : while (1) {
        $5_1 = $6_1;
        if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
         break block43
        }
        $6_1 = $3_1 >>> 29 | 0;
        $3_1 = $3_1 << 1 | 0;
        $4_1 = $5_1 + ($6_1 & 4 | 0) | 0;
        $6_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
        if ($6_1) {
         continue label2
        }
        break label2;
       };
       $0_1 = $4_1 + 16 | 0;
       if ($0_1 >>> 0 < $2_1 >>> 0) {
        break block1
       }
       HEAP32[$0_1 >> 2] = $1_1;
       $0_1 = 8;
       $3_1 = 24;
       $6_1 = $5_1;
      }
      $5_1 = $1_1;
      $4_1 = $5_1;
      break block44;
     }
     if ($5_1 >>> 0 < $2_1 >>> 0) {
      break block1
     }
     $6_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
     if ($6_1 >>> 0 < $2_1 >>> 0) {
      break block1
     }
     HEAP32[($6_1 + 12 | 0) >> 2] = $1_1;
     HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
     $4_1 = 0;
     $0_1 = 24;
     $3_1 = 8;
    }
    HEAP32[($1_1 + $3_1 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = $5_1;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $4_1;
    $1_1 = (HEAP32[(0 + 8396056 | 0) >> 2] | 0) + -1 | 0;
    HEAP32[(0 + 8396056 | 0) >> 2] = $1_1 ? $1_1 : -1;
   }
   return;
  }
  $11();
  wasm2js_trap();
 }
 
 function $28($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, $2_1 = 0, i64toi32_i32$3 = 0, $11_1 = 0, $6$hi = 0, $8$hi = 0, $16_1 = 0, i64toi32_i32$2 = 0;
  block1 : {
   block : {
    if ($0_1) {
     break block
    }
    $2_1 = 0;
    break block1;
   }
   i64toi32_i32$0 = 0;
   $6$hi = i64toi32_i32$0;
   i64toi32_i32$0 = 0;
   $8$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $6$hi;
   i64toi32_i32$1 = $8$hi;
   i64toi32_i32$1 = __wasm_i64_mul($0_1 | 0, i64toi32_i32$0 | 0, $1_1 | 0, i64toi32_i32$1 | 0) | 0;
   i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
   $2_1 = i64toi32_i32$1;
   if (($1_1 | $0_1 | 0) >>> 0 < 65536 >>> 0) {
    break block1
   }
   $16_1 = i64toi32_i32$1;
   i64toi32_i32$2 = i64toi32_i32$1;
   i64toi32_i32$1 = 0;
   i64toi32_i32$3 = 32;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$1 = 0;
    $11_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
    $11_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
   }
   $2_1 = ($11_1 | 0) != (0 | 0) ? -1 : $16_1;
  }
  block2 : {
   $0_1 = $25($2_1 | 0) | 0;
   if (!$0_1) {
    break block2
   }
   if (!((HEAPU8[($0_1 + -4 | 0) >> 0] | 0) & 3 | 0)) {
    break block2
   }
   $24($0_1 | 0, 0 | 0, $2_1 | 0) | 0;
  }
  return $0_1 | 0;
 }
 
 function $29() {
  return __wasm_memory_size() << 16 | 0 | 0;
 }
 
 function $30($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = HEAP32[(0 + 8395996 | 0) >> 2] | 0;
  $2_1 = ($0_1 + 7 | 0) & -8 | 0;
  $0_1 = $1_1 + $2_1 | 0;
  block2 : {
   block1 : {
    block : {
     if (!$2_1) {
      break block
     }
     if ($0_1 >>> 0 <= $1_1 >>> 0) {
      break block1
     }
    }
    if ($0_1 >>> 0 <= ($29() | 0) >>> 0) {
     break block2
    }
    if (fimport$3($0_1 | 0) | 0) {
     break block2
    }
   }
   HEAP32[($10() | 0) >> 2] = 48;
   return -1 | 0;
  }
  HEAP32[(0 + 8395996 | 0) >> 2] = $0_1;
  return $1_1 | 0;
 }
 
 function $31($0_1) {
  $0_1 = $0_1 | 0;
  global$1 = $0_1;
 }
 
 function $33($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, i64toi32_i32$1 = 0, $2_1 = 0, i64toi32_i32$0 = 0, $3_1 = 0;
  block : {
   if ($0_1) {
    break block
   }
   $1_1 = 0;
   block1 : {
    if (!(HEAP32[(0 + 8396020 | 0) >> 2] | 0)) {
     break block1
    }
    $1_1 = $33(HEAP32[(0 + 8396020 | 0) >> 2] | 0 | 0) | 0;
   }
   block2 : {
    if (!(HEAP32[(0 + 8395992 | 0) >> 2] | 0)) {
     break block2
    }
    $1_1 = $33(HEAP32[(0 + 8395992 | 0) >> 2] | 0 | 0) | 0 | $1_1 | 0;
   }
   block3 : {
    $0_1 = HEAP32[($22() | 0) >> 2] | 0;
    if (!$0_1) {
     break block3
    }
    label : while (1) {
     block5 : {
      block4 : {
       if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) >= (0 | 0)) {
        break block4
       }
       $2_1 = 1;
       break block5;
      }
      $2_1 = !($18($0_1 | 0) | 0);
     }
     block6 : {
      if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
       break block6
      }
      $1_1 = $33($0_1 | 0) | 0 | $1_1 | 0;
     }
     block7 : {
      if ($2_1) {
       break block7
      }
      $19($0_1 | 0);
     }
     $0_1 = HEAP32[($0_1 + 56 | 0) >> 2] | 0;
     if ($0_1) {
      continue label
     }
     break label;
    };
   }
   $23();
   return $1_1 | 0;
  }
  block9 : {
   block8 : {
    if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) >= (0 | 0)) {
     break block8
    }
    $2_1 = 1;
    break block9;
   }
   $2_1 = !($18($0_1 | 0) | 0);
  }
  block12 : {
   block11 : {
    block10 : {
     if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
      break block10
     }
     FUNCTION_TABLE[HEAP32[($0_1 + 36 | 0) >> 2] | 0 | 0]($0_1, 0, 0) | 0;
     if (HEAP32[($0_1 + 20 | 0) >> 2] | 0) {
      break block10
     }
     $1_1 = -1;
     if (!$2_1) {
      break block11
     }
     break block12;
    }
    block13 : {
     $1_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
     $3_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
     if (($1_1 | 0) == ($3_1 | 0)) {
      break block13
     }
     i64toi32_i32$1 = $1_1 - $3_1 | 0;
     i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
     i64toi32_i32$0 = FUNCTION_TABLE[HEAP32[($0_1 + 40 | 0) >> 2] | 0 | 0]($0_1, i64toi32_i32$1, i64toi32_i32$0, 1) | 0;
     i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    }
    $1_1 = 0;
    HEAP32[($0_1 + 28 | 0) >> 2] = 0;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 16 | 0) >> 2] = 0;
    HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$1;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 4 | 0) >> 2] = 0;
    HEAP32[($0_1 + 8 | 0) >> 2] = i64toi32_i32$1;
    if ($2_1) {
     break block12
    }
   }
   $19($0_1 | 0);
  }
  return $1_1 | 0;
 }
 
 function $34() {
  global$3 = 8388608;
  global$2 = (0 + 15 | 0) & -16 | 0;
 }
 
 function $35() {
  return global$0 - global$2 | 0 | 0;
 }
 
 function $36() {
  return global$3 | 0;
 }
 
 function $37() {
  return global$2 | 0;
 }
 
 function $38($0_1) {
  $0_1 = $0_1 | 0;
  global$0 = $0_1;
 }
 
 function $39($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = (global$0 - $0_1 | 0) & -16 | 0;
  global$0 = $1_1;
  return $1_1 | 0;
 }
 
 function $40() {
  return global$0 | 0;
 }
 
 function $41($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return (HEAPU16[((($0_1 >>> 0 > 153 >>> 0 ? 0 : $0_1) << 1 | 0) + 8395536 | 0) >> 1] | 0) + 8393616 | 0 | 0;
 }
 
 function $42($0_1) {
  $0_1 = $0_1 | 0;
  return $41($0_1 | 0, $0_1 | 0) | 0 | 0;
 }
 
 function $43($0_1, $1_1, $2_1, $2$hi, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = $2$hi;
  i64toi32_i32$0 = FUNCTION_TABLE[$0_1 | 0]($1_1, $2_1, i64toi32_i32$0, $3_1) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $44($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $17_1 = 0, $18_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0, $9$hi = 0, $12$hi = 0, $5_1 = 0, $5$hi = 0;
  $6_1 = $0_1;
  $7_1 = $1_1;
  i64toi32_i32$0 = 0;
  $9_1 = $2_1;
  $9$hi = i64toi32_i32$0;
  i64toi32_i32$0 = 0;
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
   $17_1 = 0;
  } else {
   i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$4 | 0) | 0;
   $17_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
  }
  $12$hi = i64toi32_i32$1;
  i64toi32_i32$1 = $9$hi;
  i64toi32_i32$0 = $9_1;
  i64toi32_i32$2 = $12$hi;
  i64toi32_i32$3 = $17_1;
  i64toi32_i32$2 = i64toi32_i32$1 | i64toi32_i32$2 | 0;
  i64toi32_i32$2 = $43($6_1 | 0, $7_1 | 0, i64toi32_i32$0 | i64toi32_i32$3 | 0 | 0, i64toi32_i32$2 | 0, $4_1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $5_1 = i64toi32_i32$2;
  $5$hi = i64toi32_i32$0;
  i64toi32_i32$1 = i64toi32_i32$2;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $18_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $18_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$1 >>> i64toi32_i32$4 | 0) | 0;
  }
  $31($18_1 | 0);
  i64toi32_i32$2 = $5$hi;
  return $5_1 | 0;
 }
 
 function $45($0_1, $1_1, $1$hi, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $12_1 = 0, $4_1 = 0, $6_1 = 0, i64toi32_i32$2 = 0;
  $4_1 = $0_1;
  i64toi32_i32$0 = $1$hi;
  $6_1 = $1_1;
  i64toi32_i32$2 = $1_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = 0;
   $12_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $12_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  return fimport$4($4_1 | 0, $6_1 | 0, $12_1 | 0, $2_1 | 0, $3_1 | 0) | 0 | 0;
 }
 
 function $46($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  if (($0_1 + $2_1 | 0) >>> 0 > Math_imul(__wasm_memory_size(), 65536) >>> 0) {
   wasm2js_trap()
  }
  block : {
   label : while (1) {
    if (!$2_1) {
     break block
    }
    $2_1 = $2_1 - 1 | 0;
    HEAP8[($0_1 + $2_1 | 0) >> 0] = $1_1;
    continue label;
   };
  }
 }
 
 function _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, var$2 = 0, i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, var$3 = 0, var$4 = 0, var$5 = 0, $21_1 = 0, $22_1 = 0, var$6 = 0, $24_1 = 0, $17_1 = 0, $18_1 = 0, $23_1 = 0, $29_1 = 0, $45_1 = 0, $56$hi = 0, $62$hi = 0;
  i64toi32_i32$0 = var$1$hi;
  var$2 = var$1;
  var$4 = var$2 >>> 16 | 0;
  i64toi32_i32$0 = var$0$hi;
  var$3 = var$0;
  var$5 = var$3 >>> 16 | 0;
  $17_1 = Math_imul(var$4, var$5);
  $18_1 = var$2;
  i64toi32_i32$2 = var$3;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = 0;
   $21_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $21_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  $23_1 = $17_1 + Math_imul($18_1, $21_1) | 0;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$0 = var$1;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $22_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   $22_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
  }
  $29_1 = $23_1 + Math_imul($22_1, var$3) | 0;
  var$2 = var$2 & 65535 | 0;
  var$3 = var$3 & 65535 | 0;
  var$6 = Math_imul(var$2, var$3);
  var$2 = (var$6 >>> 16 | 0) + Math_imul(var$2, var$5) | 0;
  $45_1 = $29_1 + (var$2 >>> 16 | 0) | 0;
  var$2 = (var$2 & 65535 | 0) + Math_imul(var$4, var$3) | 0;
  i64toi32_i32$2 = 0;
  i64toi32_i32$1 = $45_1 + (var$2 >>> 16 | 0) | 0;
  i64toi32_i32$0 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$0 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
   $24_1 = 0;
  } else {
   i64toi32_i32$0 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$1 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$2 << i64toi32_i32$4 | 0) | 0;
   $24_1 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
  }
  $56$hi = i64toi32_i32$0;
  i64toi32_i32$0 = 0;
  $62$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $56$hi;
  i64toi32_i32$2 = $24_1;
  i64toi32_i32$1 = $62$hi;
  i64toi32_i32$3 = var$2 << 16 | 0 | (var$6 & 65535 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
  i64toi32_i32$2 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$2 | 0;
 }
 
 function __wasm_ctz_i32(var$0) {
  var$0 = var$0 | 0;
  if (var$0) {
   return 31 - Math_clz32((var$0 + -1 | 0) ^ var$0 | 0) | 0 | 0
  }
  return 32 | 0;
 }
 
 function __wasm_i64_mul(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$0 = var$1$hi;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$1 = _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE(var$0 | 0, i64toi32_i32$0 | 0, var$1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function __wasm_rotl_i32(var$0, var$1) {
  var$0 = var$0 | 0;
  var$1 = var$1 | 0;
  var var$2 = 0;
  var$2 = var$1 & 31 | 0;
  var$1 = (0 - var$1 | 0) & 31 | 0;
  return ((-1 >>> var$2 | 0) & var$0 | 0) << var$2 | 0 | (((-1 << var$1 | 0) & var$0 | 0) >>> var$1 | 0) | 0 | 0;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(imports);
 var FUNCTION_TABLE = Table([null, $14, $15, $17]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
 }
 
 return {
  "memory": Object.create(Object.prototype, {
   "grow": {
    
   }, 
   "buffer": {
    "get": function () {
     return buffer;
    }
    
   }
  }), 
  "__wasm_call_ctors": $0, 
  "loadMod": $5, 
  "getNextSoundData": $6, 
  "unloadMod": $7, 
  "free": $27, 
  "main": $9, 
  "__indirect_function_table": FUNCTION_TABLE, 
  "fflush": $33, 
  "strerror": $42, 
  "malloc": $25, 
  "emscripten_stack_init": $34, 
  "emscripten_stack_get_free": $35, 
  "emscripten_stack_get_base": $36, 
  "emscripten_stack_get_end": $37, 
  "_emscripten_stack_restore": $38, 
  "_emscripten_stack_alloc": $39, 
  "emscripten_stack_get_current": $40, 
  "dynCall_jiji": $44
 };
}

  return asmFunc(info);
}

)(info);
  },
  instantiate: /** @suppress{checkTypes} */function instantiate(binary, info) {
    return {
      then: function then(ok) {
        var module = new WebAssembly.Module(binary);
        ok({
          'instance': new WebAssembly.Instance(module, info)
        });
        // Emulate a simple WebAssembly.instantiate(..).then(()=>{}).catch(()=>{}) syntax.
        return {
          "catch": function _catch() {}
        };
      }
    };
  },
  RuntimeError: Error,
  isWasm2js: true
};
// end include: wasm2js.js
if (WebAssembly.isWasm2js) {
  // We don't need to actually download a wasm binary, mark it as present but
  // empty.
  wasmBinary = [];
}
if (_typeof(WebAssembly) != 'object') {
  err('no native wasm support detected');
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

// Memory management

var HEAP, /** @type {!Int8Array} */
  HEAP8, /** @type {!Uint8Array} */
  HEAPU8, /** @type {!Int16Array} */
  HEAP16, /** @type {!Uint16Array} */
  HEAPU16, /** @type {!Int32Array} */
  HEAP32, /** @type {!Uint32Array} */
  HEAPU32, /** @type {!Float32Array} */
  HEAPF32, /** @type {!Float64Array} */
  HEAPF64;
var runtimeInitialized = false;

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = function isFileURI(filename) {
  return filename.startsWith('file://');
};

// include: runtime_shared.js
// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end2();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[max >> 2] = 0x02135467;
  HEAPU32[max + 4 >> 2] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[0 >> 2] = 1668509029;
}
function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end2();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[max >> 2];
  var cookie2 = HEAPU32[max + 4 >> 2];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort("Stack overflow! Stack cookie has been overwritten at ".concat(ptrToString(max), ", expected hex dwords 0x89BACDFE and 0x2135467, but received ").concat(ptrToString(cookie2), " ").concat(ptrToString(cookie1)));
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[0 >> 2] != 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}
// end include: runtime_stack_check.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
// include: runtime_debug.js
// Endianness check
(function () {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();
if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}
function legacyModuleProp(prop, newName) {
  var incoming = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get: function get() {
        var extra = incoming ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)' : '';
        abort("`Module.".concat(prop, "` has been replaced by `").concat(newName, "`") + extra);
      }
    });
  }
}
function consumedModuleProp(prop) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      set: function set() {
        abort("Attempt to set `Module.".concat(prop, "` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'"));
      }
    });
  }
}
function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort("`Module.".concat(prop, "` was supplied but `").concat(prop, "` not included in INCOMING_MODULE_JS_API"));
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' || name === 'FS_createDataFile' || name === 'FS_createPreloadedFile' || name === 'FS_unlink' || name === 'addRunDependency' ||
  // The old FS has some functionality that WasmFS lacks.
  name === 'FS_createLazyFile' || name === 'FS_createDevice' || name === 'removeRunDependency';
}

/**
 * Intercept access to a global symbol.  This enables us to give informative
 * warnings/errors when folks attempt to use symbols they did not include in
 * their build, or no symbols that no longer exist.
 */
function hookGlobalSymbolAccess(sym, func) {
  if (typeof globalThis != 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function get() {
        func();
        return undefined;
      }
    });
  }
}
function missingGlobal(sym, msg) {
  hookGlobalSymbolAccess(sym, function () {
    _warnOnce("`".concat(sym, "` is not longer defined by emscripten. ").concat(msg));
  });
}
missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
missingGlobal('asm', 'Please use wasmExports instead');
function missingLibrarySymbol(sym) {
  hookGlobalSymbolAccess(sym, function () {
    // Can't `abort()` here because it would break code that does runtime
    // checks.  e.g. `if (typeof SDL === 'undefined')`.
    var msg = "`".concat(sym, "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line");
    // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
    // library.js, which means $name for a JS name with no prefix, or name
    // for a JS name like _name.
    var librarySymbol = sym;
    if (!librarySymbol.startsWith('_')) {
      librarySymbol = '$' + sym;
    }
    msg += " (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='".concat(librarySymbol, "')");
    if (isExportedByForceFilesystem(sym)) {
      msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
    }
    _warnOnce(msg);
  });

  // Any symbol that is not included from the JS library is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}
function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get: function get() {
        var msg = "'".concat(sym, "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)");
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}
var runtimeDebug = true; // Switch to false at runtime to disable logging at the right times

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg() {
  var _console;
  if (!runtimeDebug && typeof runtimeDebug != 'undefined') return;
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  (_console = console).warn.apply(_console, arguments);
}
// end include: runtime_debug.js
// include: memoryprofiler.js
// end include: memoryprofiler.js

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}

// The performance global was added to node in v16.0.0:
// https://nodejs.org/api/globals.html#performance
if (ENVIRONMENT_IS_NODE) {
  var _global, _global$performance;
  // This is needed for emscripten_get_now and for pthreads support which
  // depends on it for accurate timing.
  // Use `global` rather than `globalThis` here since older versions of node
  // don't have `globalThis`.
  (_global$performance = (_global = global).performance) !== null && _global$performance !== void 0 ? _global$performance : _global.performance = require('perf_hooks').performance;
}
// end include: runtime_shared.js
assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time');
assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, 'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
assert(!Module['INITIAL_MEMORY'], 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');
function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  consumedModuleProp('preRun');
  callRuntimeCallbacks(onPreRuns);
}
function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;
  checkStackCookie();
  wasmExports['__wasm_call_ctors']();
}
function preMain() {
  checkStackCookie();
}
function postRun() {
  checkStackCookie();
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  consumedModuleProp('postRun');
  callRuntimeCallbacks(onPostRuns);
}

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};
var runDependencyWatcher = null;
function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}
function addRunDependency(id) {
  var _Module$monitorRunDep;
  runDependencies++;
  (_Module$monitorRunDep = Module['monitorRunDependencies']) === null || _Module$monitorRunDep === void 0 || _Module$monitorRunDep.call(Module, runDependencies);
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function () {
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
          err("dependency: ".concat(dep));
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
  var _Module$monitorRunDep2;
  runDependencies--;
  (_Module$monitorRunDep2 = Module['monitorRunDependencies']) === null || _Module$monitorRunDep2 === void 0 || _Module$monitorRunDep2.call(Module, runDependencies);
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

/** @param {string|number=} what */
function abort(what) {
  var _Module$onAbort;
  (_Module$onAbort = Module['onAbort']) === null || _Module$onAbort === void 0 || _Module$onAbort.call(Module, what);
  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);
  ABORT = true;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// show errors on likely calls to FS when it was not included
var FS = {
  error: function error() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
  },
  init: function init() {
    FS.error();
  },
  createDataFile: function createDataFile() {
    FS.error();
  },
  createPreloadedFile: function createPreloadedFile() {
    FS.error();
  },
  createLazyFile: function createLazyFile() {
    FS.error();
  },
  open: function open() {
    FS.error();
  },
  mkdev: function mkdev() {
    FS.error();
  },
  registerDevice: function registerDevice() {
    FS.error();
  },
  analyzePath: function analyzePath() {
    FS.error();
  },
  ErrnoError: function ErrnoError() {
    FS.error();
  }
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
function createExportWrapper(name, nargs) {
  return function () {
    assert(runtimeInitialized, "native function `".concat(name, "` called before runtime initialization"));
    var f = wasmExports[name];
    assert(f, "exported native function `".concat(name, "` not found"));
    // Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
    assert(arguments.length <= nargs, "native function `".concat(name, "` called with ").concat(arguments.length, " args but expects ").concat(nargs));
    return f.apply(void 0, arguments);
  };
}
var wasmBinaryFile;
function findWasmBinary() {
  return locateFile('js_hxcmod_player_asmjs.wasm');
}
function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw 'both async and sync fetching of the wasm failed';
}
function getWasmBinary(_x3) {
  return _getWasmBinary.apply(this, arguments);
}
function _getWasmBinary() {
  _getWasmBinary = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(binaryFile) {
    var response;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          if (wasmBinary) {
            _context3.next = 10;
            break;
          }
          _context3.prev = 1;
          _context3.next = 4;
          return readAsync(binaryFile);
        case 4:
          response = _context3.sent;
          return _context3.abrupt("return", new Uint8Array(response));
        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](1);
        case 10:
          return _context3.abrupt("return", getBinarySync(binaryFile));
        case 11:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[1, 8]]);
  }));
  return _getWasmBinary.apply(this, arguments);
}
function instantiateArrayBuffer(_x4, _x5) {
  return _instantiateArrayBuffer.apply(this, arguments);
}
function _instantiateArrayBuffer() {
  _instantiateArrayBuffer = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(binaryFile, imports) {
    var binary, instance;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return getWasmBinary(binaryFile);
        case 3:
          binary = _context4.sent;
          _context4.next = 6;
          return WebAssembly.instantiate(binary, imports);
        case 6:
          instance = _context4.sent;
          return _context4.abrupt("return", instance);
        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](0);
          err("failed to asynchronously prepare wasm: ".concat(_context4.t0));

          // Warn on some common problems.
          if (isFileURI(wasmBinaryFile)) {
            err("warning: Loading from a file URI (".concat(wasmBinaryFile, ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing"));
          }
          abort(_context4.t0);
        case 15:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 10]]);
  }));
  return _instantiateArrayBuffer.apply(this, arguments);
}
function instantiateAsync(_x6, _x7, _x8) {
  return _instantiateAsync.apply(this, arguments);
}
function _instantiateAsync() {
  _instantiateAsync = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(binary, binaryFile, imports) {
    var response, instantiationResult;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          if (!(!binary && typeof WebAssembly.instantiateStreaming == 'function'
          // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
          && !isFileURI(binaryFile)
          // Avoid instantiateStreaming() on Node.js environment for now, as while
          // Node.js v18.1.0 implements it, it does not have a full fetch()
          // implementation yet.
          //
          // Reference:
          //   https://github.com/emscripten-core/emscripten/pull/16917
          && !ENVIRONMENT_IS_NODE)) {
            _context5.next = 14;
            break;
          }
          _context5.prev = 1;
          response = fetch(binaryFile, {
            credentials: 'same-origin'
          });
          _context5.next = 5;
          return WebAssembly.instantiateStreaming(response, imports);
        case 5:
          instantiationResult = _context5.sent;
          return _context5.abrupt("return", instantiationResult);
        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](1);
          // We expect the most common failure cause to be a bad MIME type for the binary,
          // in which case falling back to ArrayBuffer instantiation should work.
          err("wasm streaming compile failed: ".concat(_context5.t0));
          err('falling back to ArrayBuffer instantiation');
          // fall back of instantiateArrayBuffer below
        case 13:
          ;
        case 14:
          return _context5.abrupt("return", instantiateArrayBuffer(binaryFile, imports));
        case 15:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[1, 9]]);
  }));
  return _instantiateAsync.apply(this, arguments);
}
function getWasmImports() {
  // prepare imports
  return {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports
  };
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  return _createWasm.apply(this, arguments);
} // Globals used by JS i64 conversions (see makeSetValue)
function _createWasm() {
  _createWasm = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
    var receiveInstance, trueModule, receiveInstantiationResult, info, result, exports;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          receiveInstantiationResult = function _receiveInstantiation(result) {
            // 'result' is a ResultObject object which has both the module and instance.
            // receiveInstance() will swap in the exports (to Module.asm) so they can be called
            assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
            trueModule = null;
            // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
            // When the regression is fixed, can restore the above PTHREADS-enabled path.
            return receiveInstance(result['instance']);
          };
          receiveInstance = function _receiveInstance(instance, module) {
            wasmExports = instance.exports;
            wasmMemory = wasmExports['memory'];
            assert(wasmMemory, 'memory not found in wasm exports');
            updateMemoryViews();
            removeRunDependency('wasm-instantiate');
            return wasmExports;
          }; // Load the wasm module and create an instance of using native support in the JS engine.
          // handle a generated wasm instance, receiving its exports and
          // performing other necessary setup
          /** @param {WebAssembly.Module=} module*/
          // wait for the pthread pool (if any)
          addRunDependency('wasm-instantiate');

          // Prefer streaming instantiation if available.
          // Async compilation can be confusing when an error on the page overwrites Module
          // (for example, if the order of elements is wrong, and the one defining Module is
          // later), so we save Module and check it later.
          trueModule = Module;
          info = getWasmImports(); // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
          // to manually instantiate the Wasm module themselves. This allows pages to
          // run the instantiation parallel to any other async startup actions they are
          // performing.
          // Also pthreads and wasm workers initialize the wasm instance through this
          // path.
          if (!Module['instantiateWasm']) {
            _context6.next = 7;
            break;
          }
          return _context6.abrupt("return", new Promise(function (resolve, reject) {
            try {
              Module['instantiateWasm'](info, function (mod, inst) {
                receiveInstance(mod, inst);
                resolve(mod.exports);
              });
            } catch (e) {
              err("Module.instantiateWasm callback failed with error: ".concat(e));
              reject(e);
            }
          }));
        case 7:
          wasmBinaryFile !== null && wasmBinaryFile !== void 0 ? wasmBinaryFile : wasmBinaryFile = findWasmBinary();
          _context6.next = 10;
          return instantiateAsync(wasmBinary, wasmBinaryFile, info);
        case 10:
          result = _context6.sent;
          exports = receiveInstantiationResult(result);
          return _context6.abrupt("return", exports);
        case 13:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _createWasm.apply(this, arguments);
}
var tempDouble;
var tempI64;

// end include: preamble.js

// Begin JS library code
var ExitStatus = /*#__PURE__*/_createClass(function ExitStatus(status) {
  "use strict";

  _classCallCheck(this, ExitStatus);
  _defineProperty(this, "name", 'ExitStatus');
  this.message = "Program terminated with exit(".concat(status, ")");
  this.status = status;
});
var callRuntimeCallbacks = function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    // Pass the module as the first argument.
    callbacks.shift()(Module);
  }
};
var onPostRuns = [];
var addOnPostRun = function addOnPostRun(cb) {
  return onPostRuns.unshift(cb);
};
var onPreRuns = [];
var addOnPreRun = function addOnPreRun(cb) {
  return onPreRuns.unshift(cb);
};

/**
 * @param {number} ptr
 * @param {string} type
 */
function getValue(ptr) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'i8';
  if (type.endsWith('*')) type = '*';
  switch (type) {
    case 'i1':
      return HEAP8[ptr];
    case 'i8':
      return HEAP8[ptr];
    case 'i16':
      return HEAP16[ptr >> 1];
    case 'i32':
      return HEAP32[ptr >> 2];
    case 'i64':
      abort('to do getValue(i64) use WASM_BIGINT');
    case 'float':
      return HEAPF32[ptr >> 2];
    case 'double':
      return HEAPF64[ptr >> 3];
    case '*':
      return HEAPU32[ptr >> 2];
    default:
      abort("invalid type for getValue: ".concat(type));
  }
}
var noExitRuntime = Module['noExitRuntime'] || true;
var ptrToString = function ptrToString(ptr) {
  assert(typeof ptr === 'number');
  // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
  ptr >>>= 0;
  return '0x' + ptr.toString(16).padStart(8, '0');
};

/**
 * @param {number} ptr
 * @param {number} value
 * @param {string} type
 */
function setValue(ptr, value) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'i8';
  if (type.endsWith('*')) type = '*';
  switch (type) {
    case 'i1':
      HEAP8[ptr] = value;
      break;
    case 'i8':
      HEAP8[ptr] = value;
      break;
    case 'i16':
      HEAP16[ptr >> 1] = value;
      break;
    case 'i32':
      HEAP32[ptr >> 2] = value;
      break;
    case 'i64':
      abort('to do setValue(i64) use WASM_BIGINT');
    case 'float':
      HEAPF32[ptr >> 2] = value;
      break;
    case 'double':
      HEAPF64[ptr >> 3] = value;
      break;
    case '*':
      HEAPU32[ptr >> 2] = value;
      break;
    default:
      abort("invalid type for setValue: ".concat(type));
  }
}
var stackRestore = function stackRestore(val) {
  return _emscripten_stack_restore(val);
};
var stackSave = function stackSave() {
  return _emscripten_stack_get_current2();
};
var _warnOnce = function warnOnce(text) {
  _warnOnce.shown || (_warnOnce.shown = {});
  if (!_warnOnce.shown[text]) {
    _warnOnce.shown[text] = 1;
    if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
    err(text);
  }
};
var __abort_js = function __abort_js() {
  return abort('native code called abort()');
};
var getHeapMax = function getHeapMax() {
  return HEAPU8.length;
};
var alignMemory = function alignMemory(size, alignment) {
  assert(alignment, "alignment argument is required");
  return Math.ceil(size / alignment) * alignment;
};
var abortOnCannotGrowMemory = function abortOnCannotGrowMemory(requestedSize) {
  abort("Cannot enlarge memory arrays to size ".concat(requestedSize, " bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ").concat(HEAP8.length, ", (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0"));
};
var _emscripten_resize_heap = function _emscripten_resize_heap(requestedSize) {
  var oldSize = HEAPU8.length;
  // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
  requestedSize >>>= 0;
  abortOnCannotGrowMemory(requestedSize);
};
var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined;

/**
 * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
 * array that contains uint8 values, returns a copy of that string as a
 * Javascript String object.
 * heapOrArray is either a regular array, or a JavaScript typed array view.
 * @param {number=} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
var UTF8ArrayToString = function UTF8ArrayToString(heapOrArray) {
  var idx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var maxBytesToRead = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : NaN;
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on
  // null terminator by itself.  Also, use the length info to avoid running tiny
  // strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation,
  // so that undefined/NaN means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = '';
  // If building with TextDecoder, we have already computed the string length
  // above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 0x80)) {
      str += String.fromCharCode(u0);
      continue;
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) {
      str += String.fromCharCode((u0 & 31) << 6 | u1);
      continue;
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = (u0 & 15) << 12 | u1 << 6 | u2;
    } else {
      if ((u0 & 0xF8) != 0xF0) _warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
      u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
    }
    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | ch >> 10, 0xDC00 | ch & 0x3FF);
    }
  }
  return str;
};

/**
 * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
 * emscripten HEAP, returns a copy of that string as a Javascript String object.
 *
 * @param {number} ptr
 * @param {number=} maxBytesToRead - An optional length that specifies the
 *   maximum number of bytes to read. You can omit this parameter to scan the
 *   string until the first 0 byte. If maxBytesToRead is passed, and the string
 *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
 *   string will cut short at that byte index (i.e. maxBytesToRead will not
 *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
 *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
 *   JS JIT optimizations off, so it is worth to consider consistently using one
 * @return {string}
 */
var UTF8ToString = function UTF8ToString(ptr, maxBytesToRead) {
  assert(typeof ptr == 'number', "UTF8ToString expects a number (got ".concat(_typeof(ptr), ")"));
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
};
var SYSCALLS = {
  varargs: undefined,
  getStr: function getStr(ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  }
};
var _fd_close = function _fd_close(fd) {
  abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
};
var convertI32PairToI53Checked = function convertI32PairToI53Checked(lo, hi) {
  assert(lo == lo >>> 0 || lo == (lo | 0)); // lo should either be a i32 or a u32
  assert(hi === (hi | 0)); // hi should be a i32
  return hi + 0x200000 >>> 0 < 0x400001 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
};
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  var offset = convertI32PairToI53Checked(offset_low, offset_high);
  return 70;
  ;
}
var printCharBuffers = [null, [], []];
var printChar = function printChar(stream, curr) {
  var buffer = printCharBuffers[stream];
  assert(buffer);
  if (curr === 0 || curr === 10) {
    (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
    buffer.length = 0;
  } else {
    buffer.push(curr);
  }
};
var flush_NO_FILESYSTEM = function flush_NO_FILESYSTEM() {
  // flush anything remaining in the buffers during shutdown
  _fflush(0);
  if (printCharBuffers[1].length) printChar(1, 10);
  if (printCharBuffers[2].length) printChar(2, 10);
};
var _fd_write = function _fd_write(fd, iov, iovcnt, pnum) {
  // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
  var num = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[iov + 4 >> 2];
    iov += 8;
    for (var j = 0; j < len; j++) {
      printChar(fd, HEAPU8[ptr + j]);
    }
    num += len;
  }
  HEAPU32[pnum >> 2] = num;
  return 0;
};
var runtimeKeepaliveCounter = 0;
var keepRuntimeAlive = function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0;
};
var _proc_exit = function _proc_exit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    var _Module$onExit;
    (_Module$onExit = Module['onExit']) === null || _Module$onExit === void 0 || _Module$onExit.call(Module, code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
};

/** @param {boolean|number=} implicit */
var exitJS = function exitJS(status, implicit) {
  EXITSTATUS = status;
  checkUnflushedContent();

  // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
  if (keepRuntimeAlive() && !implicit) {
    var msg = "program exited (with status: ".concat(status, "), but keepRuntimeAlive() is set (counter=").concat(runtimeKeepaliveCounter, ") due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)");
    err(msg);
  }
  _proc_exit(status);
};
var handleException = function handleException(e) {
  // Certain exception types we do not treat as errors since they are used for
  // internal control flow.
  // 1. ExitStatus, which is thrown by exit()
  // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
  //    that wish to return to JS event loop.
  if (e instanceof ExitStatus || e == 'unwind') {
    return EXITSTATUS;
  }
  checkStackCookie();
  if (e instanceof WebAssembly.RuntimeError) {
    if (_emscripten_stack_get_current2() <= 0) {
      err('Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 8388608)');
    }
  }
  quit_(1, e);
};
// End JS library code

function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var wasmImports = {
  /** @export */
  _abort_js: __abort_js,
  /** @export */
  emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */
  fd_close: _fd_close,
  /** @export */
  fd_seek: _fd_seek,
  /** @export */
  fd_write: _fd_write
};
var wasmExports;
createWasm();
var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors', 0);
var _loadMod = Module['_loadMod'] = createExportWrapper('loadMod', 3);
var _getNextSoundData = Module['_getNextSoundData'] = createExportWrapper('getNextSoundData', 4);
var _unloadMod = Module['_unloadMod'] = createExportWrapper('unloadMod', 1);
var _free = Module['_free'] = createExportWrapper('free', 1);
var _main = Module['_main'] = createExportWrapper('main', 2);
var _fflush = createExportWrapper('fflush', 1);
var _strerror = createExportWrapper('strerror', 1);
var _malloc = Module['_malloc'] = createExportWrapper('malloc', 1);
var _emscripten_stack_init2 = function _emscripten_stack_init() {
  return (_emscripten_stack_init2 = wasmExports['emscripten_stack_init'])();
};
var _emscripten_stack_get_free2 = function _emscripten_stack_get_free() {
  return (_emscripten_stack_get_free2 = wasmExports['emscripten_stack_get_free'])();
};
var _emscripten_stack_get_base2 = function _emscripten_stack_get_base() {
  return (_emscripten_stack_get_base2 = wasmExports['emscripten_stack_get_base'])();
};
var _emscripten_stack_get_end2 = function _emscripten_stack_get_end() {
  return (_emscripten_stack_get_end2 = wasmExports['emscripten_stack_get_end'])();
};
var _emscripten_stack_restore = function __emscripten_stack_restore(a0) {
  return (_emscripten_stack_restore = wasmExports['_emscripten_stack_restore'])(a0);
};
var _emscripten_stack_alloc = function __emscripten_stack_alloc(a0) {
  return (_emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'])(a0);
};
var _emscripten_stack_get_current2 = function _emscripten_stack_get_current() {
  return (_emscripten_stack_get_current2 = wasmExports['emscripten_stack_get_current'])();
};
var dynCall_jiji = Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji', 5);

// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

var missingLibrarySymbols = ['writeI53ToI64', 'writeI53ToI64Clamped', 'writeI53ToI64Signaling', 'writeI53ToU64Clamped', 'writeI53ToU64Signaling', 'readI53FromI64', 'readI53FromU64', 'convertI32PairToI53', 'convertU32PairToI53', 'stackAlloc', 'getTempRet0', 'setTempRet0', 'zeroMemory', 'growMemory', 'strError', 'inetPton4', 'inetNtop4', 'inetPton6', 'inetNtop6', 'readSockaddr', 'writeSockaddr', 'emscriptenLog', 'readEmAsmArgs', 'jstoi_q', 'getExecutableName', 'listenOnce', 'autoResumeAudioContext', 'dynCallLegacy', 'getDynCaller', 'dynCall', 'runtimeKeepalivePush', 'runtimeKeepalivePop', 'callUserCallback', 'maybeExit', 'asmjsMangle', 'asyncLoad', 'mmapAlloc', 'HandleAllocator', 'getNativeTypeSize', 'addOnInit', 'addOnPostCtor', 'addOnPreMain', 'addOnExit', 'STACK_SIZE', 'STACK_ALIGN', 'POINTER_SIZE', 'ASSERTIONS', 'getCFunc', 'ccall', 'cwrap', 'uleb128Encode', 'sigToWasmTypes', 'generateFuncType', 'convertJsFunctionToWasm', 'getEmptyTableSlot', 'updateTableMap', 'getFunctionAddress', 'addFunction', 'removeFunction', 'reallyNegative', 'unSign', 'strLen', 'reSign', 'formatString', 'stringToUTF8Array', 'stringToUTF8', 'lengthBytesUTF8', 'intArrayFromString', 'intArrayToString', 'AsciiToString', 'stringToAscii', 'UTF16ToString', 'stringToUTF16', 'lengthBytesUTF16', 'UTF32ToString', 'stringToUTF32', 'lengthBytesUTF32', 'stringToNewUTF8', 'stringToUTF8OnStack', 'writeArrayToMemory', 'registerKeyEventCallback', 'maybeCStringToJsString', 'findEventTarget', 'getBoundingClientRect', 'fillMouseEventData', 'registerMouseEventCallback', 'registerWheelEventCallback', 'registerUiEventCallback', 'registerFocusEventCallback', 'fillDeviceOrientationEventData', 'registerDeviceOrientationEventCallback', 'fillDeviceMotionEventData', 'registerDeviceMotionEventCallback', 'screenOrientation', 'fillOrientationChangeEventData', 'registerOrientationChangeEventCallback', 'fillFullscreenChangeEventData', 'registerFullscreenChangeEventCallback', 'JSEvents_requestFullscreen', 'JSEvents_resizeCanvasForFullscreen', 'registerRestoreOldStyle', 'hideEverythingExceptGivenElement', 'restoreHiddenElements', 'setLetterbox', 'softFullscreenResizeWebGLRenderTarget', 'doRequestFullscreen', 'fillPointerlockChangeEventData', 'registerPointerlockChangeEventCallback', 'registerPointerlockErrorEventCallback', 'requestPointerLock', 'fillVisibilityChangeEventData', 'registerVisibilityChangeEventCallback', 'registerTouchEventCallback', 'fillGamepadEventData', 'registerGamepadEventCallback', 'registerBeforeUnloadEventCallback', 'fillBatteryEventData', 'battery', 'registerBatteryEventCallback', 'setCanvasElementSize', 'getCanvasElementSize', 'jsStackTrace', 'getCallstack', 'convertPCtoSourceLocation', 'getEnvStrings', 'checkWasiClock', 'wasiRightsToMuslOFlags', 'wasiOFlagsToMuslOFlags', 'initRandomFill', 'randomFill', 'safeSetTimeout', 'setImmediateWrapped', 'safeRequestAnimationFrame', 'clearImmediateWrapped', 'registerPostMainLoop', 'registerPreMainLoop', 'getPromise', 'makePromise', 'idsToPromises', 'makePromiseCallback', 'ExceptionInfo', 'findMatchingCatch', 'Browser_asyncPrepareDataCounter', 'isLeapYear', 'ydayFromDate', 'arraySum', 'addDays', 'getSocketFromFD', 'getSocketAddress', 'FS_createPreloadedFile', 'FS_modeStringToFlags', 'FS_getMode', 'FS_stdin_getChar', 'FS_unlink', 'FS_createDataFile', 'FS_mkdirTree', '_setNetworkCallback', 'heapObjectForWebGLType', 'toTypedArrayIndex', 'webgl_enable_ANGLE_instanced_arrays', 'webgl_enable_OES_vertex_array_object', 'webgl_enable_WEBGL_draw_buffers', 'webgl_enable_WEBGL_multi_draw', 'webgl_enable_EXT_polygon_offset_clamp', 'webgl_enable_EXT_clip_control', 'webgl_enable_WEBGL_polygon_mode', 'emscriptenWebGLGet', 'computeUnpackAlignedImageSize', 'colorChannelsInGlTextureFormat', 'emscriptenWebGLGetTexPixelData', 'emscriptenWebGLGetUniform', 'webglGetUniformLocation', 'webglPrepareUniformLocationsBeforeFirstUse', 'webglGetLeftBracePos', 'emscriptenWebGLGetVertexAttrib', '__glGetActiveAttribOrUniform', 'writeGLArray', 'registerWebGlEventCallback', 'runAndAbortIfError', 'ALLOC_NORMAL', 'ALLOC_STACK', 'allocate', 'writeStringToMemory', 'writeAsciiToMemory', 'setErrNo', 'demangle', 'stackTrace'];
missingLibrarySymbols.forEach(missingLibrarySymbol);
var unexportedSymbols = ['run', 'addRunDependency', 'removeRunDependency', 'out', 'err', 'callMain', 'abort', 'wasmMemory', 'wasmExports', 'writeStackCookie', 'checkStackCookie', 'convertI32PairToI53Checked', 'stackSave', 'stackRestore', 'ptrToString', 'exitJS', 'getHeapMax', 'abortOnCannotGrowMemory', 'ENV', 'ERRNO_CODES', 'DNS', 'Protocols', 'Sockets', 'timers', 'warnOnce', 'readEmAsmArgsArray', 'jstoi_s', 'handleException', 'keepRuntimeAlive', 'alignMemory', 'wasmTable', 'noExitRuntime', 'addOnPreRun', 'addOnPostRun', 'freeTableIndexes', 'functionsInTableMap', 'setValue', 'getValue', 'PATH', 'PATH_FS', 'UTF8Decoder', 'UTF8ArrayToString', 'UTF8ToString', 'UTF16Decoder', 'JSEvents', 'specialHTMLTargets', 'findCanvasEventTarget', 'currentFullscreenStrategy', 'restoreOldWindowedStyle', 'UNWIND_CACHE', 'ExitStatus', 'flush_NO_FILESYSTEM', 'emSetImmediate', 'emClearImmediate_deps', 'emClearImmediate', 'promiseMap', 'uncaughtExceptionCount', 'exceptionLast', 'exceptionCaught', 'Browser', 'getPreloadedImageData__data', 'wget', 'MONTH_DAYS_REGULAR', 'MONTH_DAYS_LEAP', 'MONTH_DAYS_REGULAR_CUMULATIVE', 'MONTH_DAYS_LEAP_CUMULATIVE', 'SYSCALLS', 'preloadPlugins', 'FS_stdin_getChar_buffer', 'FS_createPath', 'FS_createDevice', 'FS_readFile', 'FS', 'FS_createLazyFile', 'MEMFS', 'TTY', 'PIPEFS', 'SOCKFS', 'tempFixedLengthArray', 'miniTempWebGLFloatBuffers', 'miniTempWebGLIntBuffers', 'GL', 'AL', 'GLUT', 'EGL', 'GLEW', 'IDBStore', 'SDL', 'SDL_gfx', 'allocateUTF8', 'allocateUTF8OnStack', 'print', 'printErr'];
unexportedSymbols.forEach(unexportedRuntimeSymbol);
var calledRun;
function callMain() {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(typeof onPreRuns === 'undefined' || onPreRuns.length == 0, 'cannot call main when preRun functions remain to be called');
  var entryFunction = _main;
  var argc = 0;
  var argv = 0;
  try {
    var ret = entryFunction(argc, argv);

    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */true);
    return ret;
  } catch (e) {
    return handleException(e);
  }
}
function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init2();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}
function run() {
  if (runDependencies > 0) {
    dependenciesFulfilled = run;
    return;
  }
  stackCheckInit();
  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    dependenciesFulfilled = run;
    return;
  }
  function doRun() {
    var _Module$onRuntimeInit;
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    assert(!calledRun);
    calledRun = true;
    Module['calledRun'] = true;
    if (ABORT) return;
    initRuntime();
    preMain();
    (_Module$onRuntimeInit = Module['onRuntimeInitialized']) === null || _Module$onRuntimeInit === void 0 || _Module$onRuntimeInit.call(Module);
    consumedModuleProp('onRuntimeInitialized');
    var noInitialRun = Module['noInitialRun'];
    legacyModuleProp('noInitialRun', 'noInitialRun');
    if (!noInitialRun) callMain();
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function () {
      setTimeout(function () {
        return Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}
function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = function err(x) {
    has = true;
  };
  try {
    // it doesn't matter if it fails
    flush_NO_FILESYSTEM();
  } catch (e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    _warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.');
    _warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
  }
}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
consumedModuleProp('preInit');
run();

// end include: postamble.js
