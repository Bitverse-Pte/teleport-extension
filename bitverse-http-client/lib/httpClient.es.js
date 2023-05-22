/* bitverse-http-client v1.0.1 */
var Be = Object.defineProperty;
var Ce = (b, D, s) => D in b ? Be(b, D, { enumerable: !0, configurable: !0, writable: !0, value: s }) : b[D] = s;
var C0 = (b, D, s) => (Ce(b, typeof D != "symbol" ? D + "" : D, s), s);
const ke = typeof btoa == "function", nr = typeof Buffer == "function";
typeof TextDecoder == "function" && new TextDecoder();
const yr = typeof TextEncoder == "function" ? new TextEncoder() : void 0, me = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", l0 = Array.prototype.slice.call(me);
((b) => {
  let D = {};
  return b.forEach((s, t) => D[s] = t), D;
})(l0);
const J = String.fromCharCode.bind(String);
typeof Uint8Array.from == "function" && Uint8Array.from.bind(Uint8Array);
const we = (b) => b.replace(/=/g, "").replace(/[+\/]/g, (D) => D == "+" ? "-" : "_"), He = (b) => {
  let D, s, t, p, _ = "";
  const H = b.length % 3;
  for (let d = 0; d < b.length; ) {
    if ((s = b.charCodeAt(d++)) > 255 || (t = b.charCodeAt(d++)) > 255 || (p = b.charCodeAt(d++)) > 255)
      throw new TypeError("invalid character found");
    D = s << 16 | t << 8 | p, _ += l0[D >> 18 & 63] + l0[D >> 12 & 63] + l0[D >> 6 & 63] + l0[D & 63];
  }
  return H ? _.slice(0, H - 3) + "===".substring(H) : _;
}, ne = ke ? (b) => btoa(b) : nr ? (b) => Buffer.from(b, "binary").toString("base64") : He, Se = nr ? (b) => Buffer.from(b).toString("base64") : (b) => {
  let s = [];
  for (let t = 0, p = b.length; t < p; t += 4096)
    s.push(J.apply(null, b.subarray(t, t + 4096)));
  return ne(s.join(""));
}, Ae = (b) => {
  if (b.length < 2) {
    var D = b.charCodeAt(0);
    return D < 128 ? b : D < 2048 ? J(192 | D >>> 6) + J(128 | D & 63) : J(224 | D >>> 12 & 15) + J(128 | D >>> 6 & 63) + J(128 | D & 63);
  } else {
    var D = 65536 + (b.charCodeAt(0) - 55296) * 1024 + (b.charCodeAt(1) - 56320);
    return J(240 | D >>> 18 & 7) + J(128 | D >>> 12 & 63) + J(128 | D >>> 6 & 63) + J(128 | D & 63);
  }
}, Re = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g, ze = (b) => b.replace(Re, Ae), gr = nr ? (b) => Buffer.from(b, "utf8").toString("base64") : yr ? (b) => Se(yr.encode(b)) : (b) => ne(ze(b)), k0 = (b, D = !1) => D ? we(gr(b)) : gr(b), Ee = "https://api.bitverse.zone", Br = {
  testnet: {
    access_key: "5FdeE4CnNztmXLC9HE",
    secret: "IAMbTXzdhPfKf4LIV0TLadtBgNT9zQu1YEsh/QWUvX0xCb2hoLlhnMWVP"
  },
  mainnet: {
    access_key: "rjx8Har1KLXAVvw5aan5",
    secret: "eyJhY3Rpdml0eUlkIjoiMTIzNDU2In0"
  }
};
class De {
  constructor() {
    C0(this, "_systime");
    C0(this, "_difftime");
    this._systime = 0, this._difftime = 0;
  }
  async init() {
    try {
      const D = await fetch(`${Ee}/v3/public/time`), { retCode: s, result: t } = await D.json();
      if (s === 0) {
        const { timeSecond: p } = t;
        this._systime = p * 1e3, this._difftime = Date.now() - this._systime;
      }
    } catch (D) {
      console.error("get server time error: ", D);
    }
  }
  getServerTime() {
    if (this._systime === null)
      throw new Error("Server time not initialized");
    return this._systime;
  }
  getClientTime() {
    return Date.now();
  }
  getTimestamp() {
    if (this._difftime === null)
      throw new Error("Server time not initialized");
    return this.getClientTime() + this._difftime;
  }
}
var T = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function qe(b) {
  return b && b.__esModule && Object.prototype.hasOwnProperty.call(b, "default") ? b.default : b;
}
function Pe(b) {
  if (b.__esModule)
    return b;
  var D = b.default;
  if (typeof D == "function") {
    var s = function t() {
      if (this instanceof t) {
        var p = [null];
        p.push.apply(p, arguments);
        var _ = Function.bind.apply(D, p);
        return new _();
      }
      return D.apply(this, arguments);
    };
    s.prototype = D.prototype;
  } else
    s = {};
  return Object.defineProperty(s, "__esModule", { value: !0 }), Object.keys(b).forEach(function(t) {
    var p = Object.getOwnPropertyDescriptor(b, t);
    Object.defineProperty(s, t, p.get ? p : {
      enumerable: !0,
      get: function() {
        return b[t];
      }
    });
  }), s;
}
var xe = { exports: {} };
function Fe(b) {
  throw new Error('Could not dynamically require "' + b + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var m0 = { exports: {} };
const We = {}, Te = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: We
}, Symbol.toStringTag, { value: "Module" })), Le = /* @__PURE__ */ Pe(Te);
var Cr;
function U() {
  return Cr || (Cr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t();
    })(T, function() {
      var s = s || function(t, p) {
        var _;
        if (typeof window < "u" && window.crypto && (_ = window.crypto), typeof self < "u" && self.crypto && (_ = self.crypto), typeof globalThis < "u" && globalThis.crypto && (_ = globalThis.crypto), !_ && typeof window < "u" && window.msCrypto && (_ = window.msCrypto), !_ && typeof T < "u" && T.crypto && (_ = T.crypto), !_ && typeof Fe == "function")
          try {
            _ = Le;
          } catch {
          }
        var H = function() {
          if (_) {
            if (typeof _.getRandomValues == "function")
              try {
                return _.getRandomValues(new Uint32Array(1))[0];
              } catch {
              }
            if (typeof _.randomBytes == "function")
              try {
                return _.randomBytes(4).readInt32LE();
              } catch {
              }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        }, d = Object.create || function() {
          function n() {
          }
          return function(i) {
            var c;
            return n.prototype = i, c = new n(), n.prototype = null, c;
          };
        }(), l = {}, r = l.lib = {}, a = r.Base = function() {
          return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function(n) {
              var i = d(this);
              return n && i.mixIn(n), (!i.hasOwnProperty("init") || this.init === i.init) && (i.init = function() {
                i.$super.init.apply(this, arguments);
              }), i.init.prototype = i, i.$super = this, i;
            },
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function() {
              var n = this.extend();
              return n.init.apply(n, arguments), n;
            },
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function() {
            },
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function(n) {
              for (var i in n)
                n.hasOwnProperty(i) && (this[i] = n[i]);
              n.hasOwnProperty("toString") && (this.toString = n.toString);
            },
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function() {
              return this.init.prototype.extend(this);
            }
          };
        }(), h = r.WordArray = a.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of 32-bit words.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.create();
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
           */
          init: function(n, i) {
            n = this.words = n || [], i != p ? this.sigBytes = i : this.sigBytes = n.length * 4;
          },
          /**
           * Converts this word array to a string.
           *
           * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
           *
           * @return {string} The stringified word array.
           *
           * @example
           *
           *     var string = wordArray + '';
           *     var string = wordArray.toString();
           *     var string = wordArray.toString(CryptoJS.enc.Utf8);
           */
          toString: function(n) {
            return (n || o).stringify(this);
          },
          /**
           * Concatenates a word array to this word array.
           *
           * @param {WordArray} wordArray The word array to append.
           *
           * @return {WordArray} This word array.
           *
           * @example
           *
           *     wordArray1.concat(wordArray2);
           */
          concat: function(n) {
            var i = this.words, c = n.words, B = this.sigBytes, C = n.sigBytes;
            if (this.clamp(), B % 4)
              for (var k = 0; k < C; k++) {
                var m = c[k >>> 2] >>> 24 - k % 4 * 8 & 255;
                i[B + k >>> 2] |= m << 24 - (B + k) % 4 * 8;
              }
            else
              for (var q = 0; q < C; q += 4)
                i[B + q >>> 2] = c[q >>> 2];
            return this.sigBytes += C, this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var n = this.words, i = this.sigBytes;
            n[i >>> 2] &= 4294967295 << 32 - i % 4 * 8, n.length = t.ceil(i / 4);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {WordArray} The clone.
           *
           * @example
           *
           *     var clone = wordArray.clone();
           */
          clone: function() {
            var n = a.clone.call(this);
            return n.words = this.words.slice(0), n;
          },
          /**
           * Creates a word array filled with random bytes.
           *
           * @param {number} nBytes The number of random bytes to generate.
           *
           * @return {WordArray} The random word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.random(16);
           */
          random: function(n) {
            for (var i = [], c = 0; c < n; c += 4)
              i.push(H());
            return new h.init(i, n);
          }
        }), e = l.enc = {}, o = e.Hex = {
          /**
           * Converts a word array to a hex string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The hex string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
           */
          stringify: function(n) {
            for (var i = n.words, c = n.sigBytes, B = [], C = 0; C < c; C++) {
              var k = i[C >>> 2] >>> 24 - C % 4 * 8 & 255;
              B.push((k >>> 4).toString(16)), B.push((k & 15).toString(16));
            }
            return B.join("");
          },
          /**
           * Converts a hex string to a word array.
           *
           * @param {string} hexStr The hex string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
           */
          parse: function(n) {
            for (var i = n.length, c = [], B = 0; B < i; B += 2)
              c[B >>> 3] |= parseInt(n.substr(B, 2), 16) << 24 - B % 8 * 4;
            return new h.init(c, i / 2);
          }
        }, x = e.Latin1 = {
          /**
           * Converts a word array to a Latin1 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Latin1 string.
           *
           * @static
           *
           * @example
           *
           *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
           */
          stringify: function(n) {
            for (var i = n.words, c = n.sigBytes, B = [], C = 0; C < c; C++) {
              var k = i[C >>> 2] >>> 24 - C % 4 * 8 & 255;
              B.push(String.fromCharCode(k));
            }
            return B.join("");
          },
          /**
           * Converts a Latin1 string to a word array.
           *
           * @param {string} latin1Str The Latin1 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
           */
          parse: function(n) {
            for (var i = n.length, c = [], B = 0; B < i; B++)
              c[B >>> 2] |= (n.charCodeAt(B) & 255) << 24 - B % 4 * 8;
            return new h.init(c, i);
          }
        }, f = e.Utf8 = {
          /**
           * Converts a word array to a UTF-8 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-8 string.
           *
           * @static
           *
           * @example
           *
           *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
           */
          stringify: function(n) {
            try {
              return decodeURIComponent(escape(x.stringify(n)));
            } catch {
              throw new Error("Malformed UTF-8 data");
            }
          },
          /**
           * Converts a UTF-8 string to a word array.
           *
           * @param {string} utf8Str The UTF-8 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
           */
          parse: function(n) {
            return x.parse(unescape(encodeURIComponent(n)));
          }
        }, v = r.BufferedBlockAlgorithm = a.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new h.init(), this._nDataBytes = 0;
          },
          /**
           * Adds new data to this block algorithm's buffer.
           *
           * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
           *
           * @example
           *
           *     bufferedBlockAlgorithm._append('data');
           *     bufferedBlockAlgorithm._append(wordArray);
           */
          _append: function(n) {
            typeof n == "string" && (n = f.parse(n)), this._data.concat(n), this._nDataBytes += n.sigBytes;
          },
          /**
           * Processes available data blocks.
           *
           * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
           *
           * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
           *
           * @return {WordArray} The processed data.
           *
           * @example
           *
           *     var processedData = bufferedBlockAlgorithm._process();
           *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
           */
          _process: function(n) {
            var i, c = this._data, B = c.words, C = c.sigBytes, k = this.blockSize, m = k * 4, q = C / m;
            n ? q = t.ceil(q) : q = t.max((q | 0) - this._minBufferSize, 0);
            var u = q * k, y = t.min(u * 4, C);
            if (u) {
              for (var S = 0; S < u; S += k)
                this._doProcessBlock(B, S);
              i = B.splice(0, u), c.sigBytes -= y;
            }
            return new h.init(i, y);
          },
          /**
           * Creates a copy of this object.
           *
           * @return {Object} The clone.
           *
           * @example
           *
           *     var clone = bufferedBlockAlgorithm.clone();
           */
          clone: function() {
            var n = a.clone.call(this);
            return n._data = this._data.clone(), n;
          },
          _minBufferSize: 0
        });
        r.Hasher = v.extend({
          /**
           * Configuration options.
           */
          cfg: a.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(n) {
            this.cfg = this.cfg.extend(n), this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            v.reset.call(this), this._doReset();
          },
          /**
           * Updates this hasher with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {Hasher} This hasher.
           *
           * @example
           *
           *     hasher.update('message');
           *     hasher.update(wordArray);
           */
          update: function(n) {
            return this._append(n), this._process(), this;
          },
          /**
           * Finalizes the hash computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The hash.
           *
           * @example
           *
           *     var hash = hasher.finalize();
           *     var hash = hasher.finalize('message');
           *     var hash = hasher.finalize(wordArray);
           */
          finalize: function(n) {
            n && this._append(n);
            var i = this._doFinalize();
            return i;
          },
          blockSize: 16,
          /**
           * Creates a shortcut function to a hasher's object interface.
           *
           * @param {Hasher} hasher The hasher to create a helper for.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
           */
          _createHelper: function(n) {
            return function(i, c) {
              return new n.init(c).finalize(i);
            };
          },
          /**
           * Creates a shortcut function to the HMAC's object interface.
           *
           * @param {Hasher} hasher The hasher to use in this HMAC helper.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
           */
          _createHmacHelper: function(n) {
            return function(i, c) {
              return new g.HMAC.init(n, c).finalize(i);
            };
          }
        });
        var g = l.algo = {};
        return l;
      }(Math);
      return s;
    });
  }(m0)), m0.exports;
}
var w0 = { exports: {} }, kr;
function y0() {
  return kr || (kr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function(t) {
        var p = s, _ = p.lib, H = _.Base, d = _.WordArray, l = p.x64 = {};
        l.Word = H.extend({
          /**
           * Initializes a newly created 64-bit word.
           *
           * @param {number} high The high 32 bits.
           * @param {number} low The low 32 bits.
           *
           * @example
           *
           *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
           */
          init: function(r, a) {
            this.high = r, this.low = a;
          }
          /**
           * Bitwise NOTs this word.
           *
           * @return {X64Word} A new x64-Word object after negating.
           *
           * @example
           *
           *     var negated = x64Word.not();
           */
          // not: function () {
          // var high = ~this.high;
          // var low = ~this.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ANDs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to AND with this word.
           *
           * @return {X64Word} A new x64-Word object after ANDing.
           *
           * @example
           *
           *     var anded = x64Word.and(anotherX64Word);
           */
          // and: function (word) {
          // var high = this.high & word.high;
          // var low = this.low & word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to OR with this word.
           *
           * @return {X64Word} A new x64-Word object after ORing.
           *
           * @example
           *
           *     var ored = x64Word.or(anotherX64Word);
           */
          // or: function (word) {
          // var high = this.high | word.high;
          // var low = this.low | word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise XORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to XOR with this word.
           *
           * @return {X64Word} A new x64-Word object after XORing.
           *
           * @example
           *
           *     var xored = x64Word.xor(anotherX64Word);
           */
          // xor: function (word) {
          // var high = this.high ^ word.high;
          // var low = this.low ^ word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the left.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftL(25);
           */
          // shiftL: function (n) {
          // if (n < 32) {
          // var high = (this.high << n) | (this.low >>> (32 - n));
          // var low = this.low << n;
          // } else {
          // var high = this.low << (n - 32);
          // var low = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the right.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftR(7);
           */
          // shiftR: function (n) {
          // if (n < 32) {
          // var low = (this.low >>> n) | (this.high << (32 - n));
          // var high = this.high >>> n;
          // } else {
          // var low = this.high >>> (n - 32);
          // var high = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Rotates this word n bits to the left.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotL(25);
           */
          // rotL: function (n) {
          // return this.shiftL(n).or(this.shiftR(64 - n));
          // },
          /**
           * Rotates this word n bits to the right.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotR(7);
           */
          // rotR: function (n) {
          // return this.shiftR(n).or(this.shiftL(64 - n));
          // },
          /**
           * Adds this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to add with this word.
           *
           * @return {X64Word} A new x64-Word object after adding.
           *
           * @example
           *
           *     var added = x64Word.add(anotherX64Word);
           */
          // add: function (word) {
          // var low = (this.low + word.low) | 0;
          // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
          // var high = (this.high + word.high + carry) | 0;
          // return X64Word.create(high, low);
          // }
        }), l.WordArray = H.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.x64.WordArray.create();
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ]);
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ], 10);
           */
          init: function(r, a) {
            r = this.words = r || [], a != t ? this.sigBytes = a : this.sigBytes = r.length * 8;
          },
          /**
           * Converts this 64-bit word array to a 32-bit word array.
           *
           * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
           *
           * @example
           *
           *     var x32WordArray = x64WordArray.toX32();
           */
          toX32: function() {
            for (var r = this.words, a = r.length, h = [], e = 0; e < a; e++) {
              var o = r[e];
              h.push(o.high), h.push(o.low);
            }
            return d.create(h, this.sigBytes);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {X64WordArray} The clone.
           *
           * @example
           *
           *     var clone = x64WordArray.clone();
           */
          clone: function() {
            for (var r = H.clone.call(this), a = r.words = this.words.slice(0), h = a.length, e = 0; e < h; e++)
              a[e] = a[e].clone();
            return r;
          }
        });
      }(), s;
    });
  }(w0)), w0.exports;
}
var H0 = { exports: {} }, mr;
function Ue() {
  return mr || (mr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function() {
        if (typeof ArrayBuffer == "function") {
          var t = s, p = t.lib, _ = p.WordArray, H = _.init, d = _.init = function(l) {
            if (l instanceof ArrayBuffer && (l = new Uint8Array(l)), (l instanceof Int8Array || typeof Uint8ClampedArray < "u" && l instanceof Uint8ClampedArray || l instanceof Int16Array || l instanceof Uint16Array || l instanceof Int32Array || l instanceof Uint32Array || l instanceof Float32Array || l instanceof Float64Array) && (l = new Uint8Array(l.buffer, l.byteOffset, l.byteLength)), l instanceof Uint8Array) {
              for (var r = l.byteLength, a = [], h = 0; h < r; h++)
                a[h >>> 2] |= l[h] << 24 - h % 4 * 8;
              H.call(this, a, r);
            } else
              H.apply(this, arguments);
          };
          d.prototype = _;
        }
      }(), s.lib.WordArray;
    });
  }(H0)), H0.exports;
}
var S0 = { exports: {} }, wr;
function Oe() {
  return wr || (wr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.WordArray, H = t.enc;
        H.Utf16 = H.Utf16BE = {
          /**
           * Converts a word array to a UTF-16 BE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 BE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
           */
          stringify: function(l) {
            for (var r = l.words, a = l.sigBytes, h = [], e = 0; e < a; e += 2) {
              var o = r[e >>> 2] >>> 16 - e % 4 * 8 & 65535;
              h.push(String.fromCharCode(o));
            }
            return h.join("");
          },
          /**
           * Converts a UTF-16 BE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 BE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
           */
          parse: function(l) {
            for (var r = l.length, a = [], h = 0; h < r; h++)
              a[h >>> 1] |= l.charCodeAt(h) << 16 - h % 2 * 16;
            return _.create(a, r * 2);
          }
        }, H.Utf16LE = {
          /**
           * Converts a word array to a UTF-16 LE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 LE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
           */
          stringify: function(l) {
            for (var r = l.words, a = l.sigBytes, h = [], e = 0; e < a; e += 2) {
              var o = d(r[e >>> 2] >>> 16 - e % 4 * 8 & 65535);
              h.push(String.fromCharCode(o));
            }
            return h.join("");
          },
          /**
           * Converts a UTF-16 LE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 LE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
           */
          parse: function(l) {
            for (var r = l.length, a = [], h = 0; h < r; h++)
              a[h >>> 1] |= d(l.charCodeAt(h) << 16 - h % 2 * 16);
            return _.create(a, r * 2);
          }
        };
        function d(l) {
          return l << 8 & 4278255360 | l >>> 8 & 16711935;
        }
      }(), s.enc.Utf16;
    });
  }(S0)), S0.exports;
}
var A0 = { exports: {} }, Hr;
function o0() {
  return Hr || (Hr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.WordArray, H = t.enc;
        H.Base64 = {
          /**
           * Converts a word array to a Base64 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Base64 string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
           */
          stringify: function(l) {
            var r = l.words, a = l.sigBytes, h = this._map;
            l.clamp();
            for (var e = [], o = 0; o < a; o += 3)
              for (var x = r[o >>> 2] >>> 24 - o % 4 * 8 & 255, f = r[o + 1 >>> 2] >>> 24 - (o + 1) % 4 * 8 & 255, v = r[o + 2 >>> 2] >>> 24 - (o + 2) % 4 * 8 & 255, g = x << 16 | f << 8 | v, n = 0; n < 4 && o + n * 0.75 < a; n++)
                e.push(h.charAt(g >>> 6 * (3 - n) & 63));
            var i = h.charAt(64);
            if (i)
              for (; e.length % 4; )
                e.push(i);
            return e.join("");
          },
          /**
           * Converts a Base64 string to a word array.
           *
           * @param {string} base64Str The Base64 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
           */
          parse: function(l) {
            var r = l.length, a = this._map, h = this._reverseMap;
            if (!h) {
              h = this._reverseMap = [];
              for (var e = 0; e < a.length; e++)
                h[a.charCodeAt(e)] = e;
            }
            var o = a.charAt(64);
            if (o) {
              var x = l.indexOf(o);
              x !== -1 && (r = x);
            }
            return d(l, r, h);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function d(l, r, a) {
          for (var h = [], e = 0, o = 0; o < r; o++)
            if (o % 4) {
              var x = a[l.charCodeAt(o - 1)] << o % 4 * 2, f = a[l.charCodeAt(o)] >>> 6 - o % 4 * 2, v = x | f;
              h[e >>> 2] |= v << 24 - e % 4 * 8, e++;
            }
          return _.create(h, e);
        }
      }(), s.enc.Base64;
    });
  }(A0)), A0.exports;
}
var R0 = { exports: {} }, Sr;
function Ne() {
  return Sr || (Sr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.WordArray, H = t.enc;
        H.Base64url = {
          /**
           * Converts a word array to a Base64url string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {string} The Base64url string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
           */
          stringify: function(l, r = !0) {
            var a = l.words, h = l.sigBytes, e = r ? this._safe_map : this._map;
            l.clamp();
            for (var o = [], x = 0; x < h; x += 3)
              for (var f = a[x >>> 2] >>> 24 - x % 4 * 8 & 255, v = a[x + 1 >>> 2] >>> 24 - (x + 1) % 4 * 8 & 255, g = a[x + 2 >>> 2] >>> 24 - (x + 2) % 4 * 8 & 255, n = f << 16 | v << 8 | g, i = 0; i < 4 && x + i * 0.75 < h; i++)
                o.push(e.charAt(n >>> 6 * (3 - i) & 63));
            var c = e.charAt(64);
            if (c)
              for (; o.length % 4; )
                o.push(c);
            return o.join("");
          },
          /**
           * Converts a Base64url string to a word array.
           *
           * @param {string} base64Str The Base64url string.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
           */
          parse: function(l, r = !0) {
            var a = l.length, h = r ? this._safe_map : this._map, e = this._reverseMap;
            if (!e) {
              e = this._reverseMap = [];
              for (var o = 0; o < h.length; o++)
                e[h.charCodeAt(o)] = o;
            }
            var x = h.charAt(64);
            if (x) {
              var f = l.indexOf(x);
              f !== -1 && (a = f);
            }
            return d(l, a, e);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function d(l, r, a) {
          for (var h = [], e = 0, o = 0; o < r; o++)
            if (o % 4) {
              var x = a[l.charCodeAt(o - 1)] << o % 4 * 2, f = a[l.charCodeAt(o)] >>> 6 - o % 4 * 2, v = x | f;
              h[e >>> 2] |= v << 24 - e % 4 * 8, e++;
            }
          return _.create(h, e);
        }
      }(), s.enc.Base64url;
    });
  }(R0)), R0.exports;
}
var z0 = { exports: {} }, Ar;
function i0() {
  return Ar || (Ar = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function(t) {
        var p = s, _ = p.lib, H = _.WordArray, d = _.Hasher, l = p.algo, r = [];
        (function() {
          for (var f = 0; f < 64; f++)
            r[f] = t.abs(t.sin(f + 1)) * 4294967296 | 0;
        })();
        var a = l.MD5 = d.extend({
          _doReset: function() {
            this._hash = new H.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          },
          _doProcessBlock: function(f, v) {
            for (var g = 0; g < 16; g++) {
              var n = v + g, i = f[n];
              f[n] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360;
            }
            var c = this._hash.words, B = f[v + 0], C = f[v + 1], k = f[v + 2], m = f[v + 3], q = f[v + 4], u = f[v + 5], y = f[v + 6], S = f[v + 7], R = f[v + 8], P = f[v + 9], F = f[v + 10], L = f[v + 11], K = f[v + 12], O = f[v + 13], I = f[v + 14], N = f[v + 15], w = c[0], z = c[1], E = c[2], A = c[3];
            w = h(w, z, E, A, B, 7, r[0]), A = h(A, w, z, E, C, 12, r[1]), E = h(E, A, w, z, k, 17, r[2]), z = h(z, E, A, w, m, 22, r[3]), w = h(w, z, E, A, q, 7, r[4]), A = h(A, w, z, E, u, 12, r[5]), E = h(E, A, w, z, y, 17, r[6]), z = h(z, E, A, w, S, 22, r[7]), w = h(w, z, E, A, R, 7, r[8]), A = h(A, w, z, E, P, 12, r[9]), E = h(E, A, w, z, F, 17, r[10]), z = h(z, E, A, w, L, 22, r[11]), w = h(w, z, E, A, K, 7, r[12]), A = h(A, w, z, E, O, 12, r[13]), E = h(E, A, w, z, I, 17, r[14]), z = h(z, E, A, w, N, 22, r[15]), w = e(w, z, E, A, C, 5, r[16]), A = e(A, w, z, E, y, 9, r[17]), E = e(E, A, w, z, L, 14, r[18]), z = e(z, E, A, w, B, 20, r[19]), w = e(w, z, E, A, u, 5, r[20]), A = e(A, w, z, E, F, 9, r[21]), E = e(E, A, w, z, N, 14, r[22]), z = e(z, E, A, w, q, 20, r[23]), w = e(w, z, E, A, P, 5, r[24]), A = e(A, w, z, E, I, 9, r[25]), E = e(E, A, w, z, m, 14, r[26]), z = e(z, E, A, w, R, 20, r[27]), w = e(w, z, E, A, O, 5, r[28]), A = e(A, w, z, E, k, 9, r[29]), E = e(E, A, w, z, S, 14, r[30]), z = e(z, E, A, w, K, 20, r[31]), w = o(w, z, E, A, u, 4, r[32]), A = o(A, w, z, E, R, 11, r[33]), E = o(E, A, w, z, L, 16, r[34]), z = o(z, E, A, w, I, 23, r[35]), w = o(w, z, E, A, C, 4, r[36]), A = o(A, w, z, E, q, 11, r[37]), E = o(E, A, w, z, S, 16, r[38]), z = o(z, E, A, w, F, 23, r[39]), w = o(w, z, E, A, O, 4, r[40]), A = o(A, w, z, E, B, 11, r[41]), E = o(E, A, w, z, m, 16, r[42]), z = o(z, E, A, w, y, 23, r[43]), w = o(w, z, E, A, P, 4, r[44]), A = o(A, w, z, E, K, 11, r[45]), E = o(E, A, w, z, N, 16, r[46]), z = o(z, E, A, w, k, 23, r[47]), w = x(w, z, E, A, B, 6, r[48]), A = x(A, w, z, E, S, 10, r[49]), E = x(E, A, w, z, I, 15, r[50]), z = x(z, E, A, w, u, 21, r[51]), w = x(w, z, E, A, K, 6, r[52]), A = x(A, w, z, E, m, 10, r[53]), E = x(E, A, w, z, F, 15, r[54]), z = x(z, E, A, w, C, 21, r[55]), w = x(w, z, E, A, R, 6, r[56]), A = x(A, w, z, E, N, 10, r[57]), E = x(E, A, w, z, y, 15, r[58]), z = x(z, E, A, w, O, 21, r[59]), w = x(w, z, E, A, q, 6, r[60]), A = x(A, w, z, E, L, 10, r[61]), E = x(E, A, w, z, k, 15, r[62]), z = x(z, E, A, w, P, 21, r[63]), c[0] = c[0] + w | 0, c[1] = c[1] + z | 0, c[2] = c[2] + E | 0, c[3] = c[3] + A | 0;
          },
          _doFinalize: function() {
            var f = this._data, v = f.words, g = this._nDataBytes * 8, n = f.sigBytes * 8;
            v[n >>> 5] |= 128 << 24 - n % 32;
            var i = t.floor(g / 4294967296), c = g;
            v[(n + 64 >>> 9 << 4) + 15] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, v[(n + 64 >>> 9 << 4) + 14] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360, f.sigBytes = (v.length + 1) * 4, this._process();
            for (var B = this._hash, C = B.words, k = 0; k < 4; k++) {
              var m = C[k];
              C[k] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360;
            }
            return B;
          },
          clone: function() {
            var f = d.clone.call(this);
            return f._hash = this._hash.clone(), f;
          }
        });
        function h(f, v, g, n, i, c, B) {
          var C = f + (v & g | ~v & n) + i + B;
          return (C << c | C >>> 32 - c) + v;
        }
        function e(f, v, g, n, i, c, B) {
          var C = f + (v & n | g & ~n) + i + B;
          return (C << c | C >>> 32 - c) + v;
        }
        function o(f, v, g, n, i, c, B) {
          var C = f + (v ^ g ^ n) + i + B;
          return (C << c | C >>> 32 - c) + v;
        }
        function x(f, v, g, n, i, c, B) {
          var C = f + (g ^ (v | ~n)) + i + B;
          return (C << c | C >>> 32 - c) + v;
        }
        p.MD5 = d._createHelper(a), p.HmacMD5 = d._createHmacHelper(a);
      }(Math), s.MD5;
    });
  }(z0)), z0.exports;
}
var E0 = { exports: {} }, Rr;
function xr() {
  return Rr || (Rr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.WordArray, H = p.Hasher, d = t.algo, l = [], r = d.SHA1 = H.extend({
          _doReset: function() {
            this._hash = new _.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(a, h) {
            for (var e = this._hash.words, o = e[0], x = e[1], f = e[2], v = e[3], g = e[4], n = 0; n < 80; n++) {
              if (n < 16)
                l[n] = a[h + n] | 0;
              else {
                var i = l[n - 3] ^ l[n - 8] ^ l[n - 14] ^ l[n - 16];
                l[n] = i << 1 | i >>> 31;
              }
              var c = (o << 5 | o >>> 27) + g + l[n];
              n < 20 ? c += (x & f | ~x & v) + 1518500249 : n < 40 ? c += (x ^ f ^ v) + 1859775393 : n < 60 ? c += (x & f | x & v | f & v) - 1894007588 : c += (x ^ f ^ v) - 899497514, g = v, v = f, f = x << 30 | x >>> 2, x = o, o = c;
            }
            e[0] = e[0] + o | 0, e[1] = e[1] + x | 0, e[2] = e[2] + f | 0, e[3] = e[3] + v | 0, e[4] = e[4] + g | 0;
          },
          _doFinalize: function() {
            var a = this._data, h = a.words, e = this._nDataBytes * 8, o = a.sigBytes * 8;
            return h[o >>> 5] |= 128 << 24 - o % 32, h[(o + 64 >>> 9 << 4) + 14] = Math.floor(e / 4294967296), h[(o + 64 >>> 9 << 4) + 15] = e, a.sigBytes = h.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var a = H.clone.call(this);
            return a._hash = this._hash.clone(), a;
          }
        });
        t.SHA1 = H._createHelper(r), t.HmacSHA1 = H._createHmacHelper(r);
      }(), s.SHA1;
    });
  }(E0)), E0.exports;
}
var D0 = { exports: {} }, zr;
function oe() {
  return zr || (zr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      return function(t) {
        var p = s, _ = p.lib, H = _.WordArray, d = _.Hasher, l = p.algo, r = [], a = [];
        (function() {
          function o(g) {
            for (var n = t.sqrt(g), i = 2; i <= n; i++)
              if (!(g % i))
                return !1;
            return !0;
          }
          function x(g) {
            return (g - (g | 0)) * 4294967296 | 0;
          }
          for (var f = 2, v = 0; v < 64; )
            o(f) && (v < 8 && (r[v] = x(t.pow(f, 1 / 2))), a[v] = x(t.pow(f, 1 / 3)), v++), f++;
        })();
        var h = [], e = l.SHA256 = d.extend({
          _doReset: function() {
            this._hash = new H.init(r.slice(0));
          },
          _doProcessBlock: function(o, x) {
            for (var f = this._hash.words, v = f[0], g = f[1], n = f[2], i = f[3], c = f[4], B = f[5], C = f[6], k = f[7], m = 0; m < 64; m++) {
              if (m < 16)
                h[m] = o[x + m] | 0;
              else {
                var q = h[m - 15], u = (q << 25 | q >>> 7) ^ (q << 14 | q >>> 18) ^ q >>> 3, y = h[m - 2], S = (y << 15 | y >>> 17) ^ (y << 13 | y >>> 19) ^ y >>> 10;
                h[m] = u + h[m - 7] + S + h[m - 16];
              }
              var R = c & B ^ ~c & C, P = v & g ^ v & n ^ g & n, F = (v << 30 | v >>> 2) ^ (v << 19 | v >>> 13) ^ (v << 10 | v >>> 22), L = (c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25), K = k + L + R + a[m] + h[m], O = F + P;
              k = C, C = B, B = c, c = i + K | 0, i = n, n = g, g = v, v = K + O | 0;
            }
            f[0] = f[0] + v | 0, f[1] = f[1] + g | 0, f[2] = f[2] + n | 0, f[3] = f[3] + i | 0, f[4] = f[4] + c | 0, f[5] = f[5] + B | 0, f[6] = f[6] + C | 0, f[7] = f[7] + k | 0;
          },
          _doFinalize: function() {
            var o = this._data, x = o.words, f = this._nDataBytes * 8, v = o.sigBytes * 8;
            return x[v >>> 5] |= 128 << 24 - v % 32, x[(v + 64 >>> 9 << 4) + 14] = t.floor(f / 4294967296), x[(v + 64 >>> 9 << 4) + 15] = f, o.sigBytes = x.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var o = d.clone.call(this);
            return o._hash = this._hash.clone(), o;
          }
        });
        p.SHA256 = d._createHelper(e), p.HmacSHA256 = d._createHmacHelper(e);
      }(Math), s.SHA256;
    });
  }(D0)), D0.exports;
}
var q0 = { exports: {} }, Er;
function Ie() {
  return Er || (Er = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), oe());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.WordArray, H = t.algo, d = H.SHA256, l = H.SHA224 = d.extend({
          _doReset: function() {
            this._hash = new _.init([
              3238371032,
              914150663,
              812702999,
              4144912697,
              4290775857,
              1750603025,
              1694076839,
              3204075428
            ]);
          },
          _doFinalize: function() {
            var r = d._doFinalize.call(this);
            return r.sigBytes -= 4, r;
          }
        });
        t.SHA224 = d._createHelper(l), t.HmacSHA224 = d._createHmacHelper(l);
      }(), s.SHA224;
    });
  }(q0)), q0.exports;
}
var P0 = { exports: {} }, Dr;
function ie() {
  return Dr || (Dr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), y0());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.Hasher, H = t.x64, d = H.Word, l = H.WordArray, r = t.algo;
        function a() {
          return d.create.apply(d, arguments);
        }
        var h = [
          a(1116352408, 3609767458),
          a(1899447441, 602891725),
          a(3049323471, 3964484399),
          a(3921009573, 2173295548),
          a(961987163, 4081628472),
          a(1508970993, 3053834265),
          a(2453635748, 2937671579),
          a(2870763221, 3664609560),
          a(3624381080, 2734883394),
          a(310598401, 1164996542),
          a(607225278, 1323610764),
          a(1426881987, 3590304994),
          a(1925078388, 4068182383),
          a(2162078206, 991336113),
          a(2614888103, 633803317),
          a(3248222580, 3479774868),
          a(3835390401, 2666613458),
          a(4022224774, 944711139),
          a(264347078, 2341262773),
          a(604807628, 2007800933),
          a(770255983, 1495990901),
          a(1249150122, 1856431235),
          a(1555081692, 3175218132),
          a(1996064986, 2198950837),
          a(2554220882, 3999719339),
          a(2821834349, 766784016),
          a(2952996808, 2566594879),
          a(3210313671, 3203337956),
          a(3336571891, 1034457026),
          a(3584528711, 2466948901),
          a(113926993, 3758326383),
          a(338241895, 168717936),
          a(666307205, 1188179964),
          a(773529912, 1546045734),
          a(1294757372, 1522805485),
          a(1396182291, 2643833823),
          a(1695183700, 2343527390),
          a(1986661051, 1014477480),
          a(2177026350, 1206759142),
          a(2456956037, 344077627),
          a(2730485921, 1290863460),
          a(2820302411, 3158454273),
          a(3259730800, 3505952657),
          a(3345764771, 106217008),
          a(3516065817, 3606008344),
          a(3600352804, 1432725776),
          a(4094571909, 1467031594),
          a(275423344, 851169720),
          a(430227734, 3100823752),
          a(506948616, 1363258195),
          a(659060556, 3750685593),
          a(883997877, 3785050280),
          a(958139571, 3318307427),
          a(1322822218, 3812723403),
          a(1537002063, 2003034995),
          a(1747873779, 3602036899),
          a(1955562222, 1575990012),
          a(2024104815, 1125592928),
          a(2227730452, 2716904306),
          a(2361852424, 442776044),
          a(2428436474, 593698344),
          a(2756734187, 3733110249),
          a(3204031479, 2999351573),
          a(3329325298, 3815920427),
          a(3391569614, 3928383900),
          a(3515267271, 566280711),
          a(3940187606, 3454069534),
          a(4118630271, 4000239992),
          a(116418474, 1914138554),
          a(174292421, 2731055270),
          a(289380356, 3203993006),
          a(460393269, 320620315),
          a(685471733, 587496836),
          a(852142971, 1086792851),
          a(1017036298, 365543100),
          a(1126000580, 2618297676),
          a(1288033470, 3409855158),
          a(1501505948, 4234509866),
          a(1607167915, 987167468),
          a(1816402316, 1246189591)
        ], e = [];
        (function() {
          for (var x = 0; x < 80; x++)
            e[x] = a();
        })();
        var o = r.SHA512 = _.extend({
          _doReset: function() {
            this._hash = new l.init([
              new d.init(1779033703, 4089235720),
              new d.init(3144134277, 2227873595),
              new d.init(1013904242, 4271175723),
              new d.init(2773480762, 1595750129),
              new d.init(1359893119, 2917565137),
              new d.init(2600822924, 725511199),
              new d.init(528734635, 4215389547),
              new d.init(1541459225, 327033209)
            ]);
          },
          _doProcessBlock: function(x, f) {
            for (var v = this._hash.words, g = v[0], n = v[1], i = v[2], c = v[3], B = v[4], C = v[5], k = v[6], m = v[7], q = g.high, u = g.low, y = n.high, S = n.low, R = i.high, P = i.low, F = c.high, L = c.low, K = B.high, O = B.low, I = C.high, N = C.low, w = k.high, z = k.low, E = m.high, A = m.low, G = q, X = u, $ = y, W = S, f0 = R, a0 = P, g0 = F, s0 = L, Y = K, M = O, p0 = I, c0 = N, _0 = w, v0 = z, B0 = E, u0 = A, V = 0; V < 80; V++) {
              var Q, r0, b0 = e[V];
              if (V < 16)
                r0 = b0.high = x[f + V * 2] | 0, Q = b0.low = x[f + V * 2 + 1] | 0;
              else {
                var ir = e[V - 15], n0 = ir.high, d0 = ir.low, fe = (n0 >>> 1 | d0 << 31) ^ (n0 >>> 8 | d0 << 24) ^ n0 >>> 7, fr = (d0 >>> 1 | n0 << 31) ^ (d0 >>> 8 | n0 << 24) ^ (d0 >>> 7 | n0 << 25), sr = e[V - 2], x0 = sr.high, h0 = sr.low, se = (x0 >>> 19 | h0 << 13) ^ (x0 << 3 | h0 >>> 29) ^ x0 >>> 6, cr = (h0 >>> 19 | x0 << 13) ^ (h0 << 3 | x0 >>> 29) ^ (h0 >>> 6 | x0 << 26), vr = e[V - 7], ce = vr.high, ve = vr.low, ur = e[V - 16], ue = ur.high, dr = ur.low;
                Q = fr + ve, r0 = fe + ce + (Q >>> 0 < fr >>> 0 ? 1 : 0), Q = Q + cr, r0 = r0 + se + (Q >>> 0 < cr >>> 0 ? 1 : 0), Q = Q + dr, r0 = r0 + ue + (Q >>> 0 < dr >>> 0 ? 1 : 0), b0.high = r0, b0.low = Q;
              }
              var de = Y & p0 ^ ~Y & _0, hr = M & c0 ^ ~M & v0, he = G & $ ^ G & f0 ^ $ & f0, le = X & W ^ X & a0 ^ W & a0, pe = (G >>> 28 | X << 4) ^ (G << 30 | X >>> 2) ^ (G << 25 | X >>> 7), lr = (X >>> 28 | G << 4) ^ (X << 30 | G >>> 2) ^ (X << 25 | G >>> 7), _e = (Y >>> 14 | M << 18) ^ (Y >>> 18 | M << 14) ^ (Y << 23 | M >>> 9), be = (M >>> 14 | Y << 18) ^ (M >>> 18 | Y << 14) ^ (M << 23 | Y >>> 9), pr = h[V], ye = pr.high, _r = pr.low, Z = u0 + be, e0 = B0 + _e + (Z >>> 0 < u0 >>> 0 ? 1 : 0), Z = Z + hr, e0 = e0 + de + (Z >>> 0 < hr >>> 0 ? 1 : 0), Z = Z + _r, e0 = e0 + ye + (Z >>> 0 < _r >>> 0 ? 1 : 0), Z = Z + Q, e0 = e0 + r0 + (Z >>> 0 < Q >>> 0 ? 1 : 0), br = lr + le, ge = pe + he + (br >>> 0 < lr >>> 0 ? 1 : 0);
              B0 = _0, u0 = v0, _0 = p0, v0 = c0, p0 = Y, c0 = M, M = s0 + Z | 0, Y = g0 + e0 + (M >>> 0 < s0 >>> 0 ? 1 : 0) | 0, g0 = f0, s0 = a0, f0 = $, a0 = W, $ = G, W = X, X = Z + br | 0, G = e0 + ge + (X >>> 0 < Z >>> 0 ? 1 : 0) | 0;
            }
            u = g.low = u + X, g.high = q + G + (u >>> 0 < X >>> 0 ? 1 : 0), S = n.low = S + W, n.high = y + $ + (S >>> 0 < W >>> 0 ? 1 : 0), P = i.low = P + a0, i.high = R + f0 + (P >>> 0 < a0 >>> 0 ? 1 : 0), L = c.low = L + s0, c.high = F + g0 + (L >>> 0 < s0 >>> 0 ? 1 : 0), O = B.low = O + M, B.high = K + Y + (O >>> 0 < M >>> 0 ? 1 : 0), N = C.low = N + c0, C.high = I + p0 + (N >>> 0 < c0 >>> 0 ? 1 : 0), z = k.low = z + v0, k.high = w + _0 + (z >>> 0 < v0 >>> 0 ? 1 : 0), A = m.low = A + u0, m.high = E + B0 + (A >>> 0 < u0 >>> 0 ? 1 : 0);
          },
          _doFinalize: function() {
            var x = this._data, f = x.words, v = this._nDataBytes * 8, g = x.sigBytes * 8;
            f[g >>> 5] |= 128 << 24 - g % 32, f[(g + 128 >>> 10 << 5) + 30] = Math.floor(v / 4294967296), f[(g + 128 >>> 10 << 5) + 31] = v, x.sigBytes = f.length * 4, this._process();
            var n = this._hash.toX32();
            return n;
          },
          clone: function() {
            var x = _.clone.call(this);
            return x._hash = this._hash.clone(), x;
          },
          blockSize: 1024 / 32
        });
        t.SHA512 = _._createHelper(o), t.HmacSHA512 = _._createHmacHelper(o);
      }(), s.SHA512;
    });
  }(P0)), P0.exports;
}
var F0 = { exports: {} }, qr;
function Xe() {
  return qr || (qr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), y0(), ie());
    })(T, function(s) {
      return function() {
        var t = s, p = t.x64, _ = p.Word, H = p.WordArray, d = t.algo, l = d.SHA512, r = d.SHA384 = l.extend({
          _doReset: function() {
            this._hash = new H.init([
              new _.init(3418070365, 3238371032),
              new _.init(1654270250, 914150663),
              new _.init(2438529370, 812702999),
              new _.init(355462360, 4144912697),
              new _.init(1731405415, 4290775857),
              new _.init(2394180231, 1750603025),
              new _.init(3675008525, 1694076839),
              new _.init(1203062813, 3204075428)
            ]);
          },
          _doFinalize: function() {
            var a = l._doFinalize.call(this);
            return a.sigBytes -= 16, a;
          }
        });
        t.SHA384 = l._createHelper(r), t.HmacSHA384 = l._createHmacHelper(r);
      }(), s.SHA384;
    });
  }(F0)), F0.exports;
}
var W0 = { exports: {} }, Pr;
function Ke() {
  return Pr || (Pr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), y0());
    })(T, function(s) {
      return function(t) {
        var p = s, _ = p.lib, H = _.WordArray, d = _.Hasher, l = p.x64, r = l.Word, a = p.algo, h = [], e = [], o = [];
        (function() {
          for (var v = 1, g = 0, n = 0; n < 24; n++) {
            h[v + 5 * g] = (n + 1) * (n + 2) / 2 % 64;
            var i = g % 5, c = (2 * v + 3 * g) % 5;
            v = i, g = c;
          }
          for (var v = 0; v < 5; v++)
            for (var g = 0; g < 5; g++)
              e[v + 5 * g] = g + (2 * v + 3 * g) % 5 * 5;
          for (var B = 1, C = 0; C < 24; C++) {
            for (var k = 0, m = 0, q = 0; q < 7; q++) {
              if (B & 1) {
                var u = (1 << q) - 1;
                u < 32 ? m ^= 1 << u : k ^= 1 << u - 32;
              }
              B & 128 ? B = B << 1 ^ 113 : B <<= 1;
            }
            o[C] = r.create(k, m);
          }
        })();
        var x = [];
        (function() {
          for (var v = 0; v < 25; v++)
            x[v] = r.create();
        })();
        var f = a.SHA3 = d.extend({
          /**
           * Configuration options.
           *
           * @property {number} outputLength
           *   The desired number of bits in the output hash.
           *   Only values permitted are: 224, 256, 384, 512.
           *   Default: 512
           */
          cfg: d.cfg.extend({
            outputLength: 512
          }),
          _doReset: function() {
            for (var v = this._state = [], g = 0; g < 25; g++)
              v[g] = new r.init();
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          },
          _doProcessBlock: function(v, g) {
            for (var n = this._state, i = this.blockSize / 2, c = 0; c < i; c++) {
              var B = v[g + 2 * c], C = v[g + 2 * c + 1];
              B = (B << 8 | B >>> 24) & 16711935 | (B << 24 | B >>> 8) & 4278255360, C = (C << 8 | C >>> 24) & 16711935 | (C << 24 | C >>> 8) & 4278255360;
              var k = n[c];
              k.high ^= C, k.low ^= B;
            }
            for (var m = 0; m < 24; m++) {
              for (var q = 0; q < 5; q++) {
                for (var u = 0, y = 0, S = 0; S < 5; S++) {
                  var k = n[q + 5 * S];
                  u ^= k.high, y ^= k.low;
                }
                var R = x[q];
                R.high = u, R.low = y;
              }
              for (var q = 0; q < 5; q++)
                for (var P = x[(q + 4) % 5], F = x[(q + 1) % 5], L = F.high, K = F.low, u = P.high ^ (L << 1 | K >>> 31), y = P.low ^ (K << 1 | L >>> 31), S = 0; S < 5; S++) {
                  var k = n[q + 5 * S];
                  k.high ^= u, k.low ^= y;
                }
              for (var O = 1; O < 25; O++) {
                var u, y, k = n[O], I = k.high, N = k.low, w = h[O];
                w < 32 ? (u = I << w | N >>> 32 - w, y = N << w | I >>> 32 - w) : (u = N << w - 32 | I >>> 64 - w, y = I << w - 32 | N >>> 64 - w);
                var z = x[e[O]];
                z.high = u, z.low = y;
              }
              var E = x[0], A = n[0];
              E.high = A.high, E.low = A.low;
              for (var q = 0; q < 5; q++)
                for (var S = 0; S < 5; S++) {
                  var O = q + 5 * S, k = n[O], G = x[O], X = x[(q + 1) % 5 + 5 * S], $ = x[(q + 2) % 5 + 5 * S];
                  k.high = G.high ^ ~X.high & $.high, k.low = G.low ^ ~X.low & $.low;
                }
              var k = n[0], W = o[m];
              k.high ^= W.high, k.low ^= W.low;
            }
          },
          _doFinalize: function() {
            var v = this._data, g = v.words;
            this._nDataBytes * 8;
            var n = v.sigBytes * 8, i = this.blockSize * 32;
            g[n >>> 5] |= 1 << 24 - n % 32, g[(t.ceil((n + 1) / i) * i >>> 5) - 1] |= 128, v.sigBytes = g.length * 4, this._process();
            for (var c = this._state, B = this.cfg.outputLength / 8, C = B / 8, k = [], m = 0; m < C; m++) {
              var q = c[m], u = q.high, y = q.low;
              u = (u << 8 | u >>> 24) & 16711935 | (u << 24 | u >>> 8) & 4278255360, y = (y << 8 | y >>> 24) & 16711935 | (y << 24 | y >>> 8) & 4278255360, k.push(y), k.push(u);
            }
            return new H.init(k, B);
          },
          clone: function() {
            for (var v = d.clone.call(this), g = v._state = this._state.slice(0), n = 0; n < 25; n++)
              g[n] = g[n].clone();
            return v;
          }
        });
        p.SHA3 = d._createHelper(f), p.HmacSHA3 = d._createHmacHelper(f);
      }(Math), s.SHA3;
    });
  }(W0)), W0.exports;
}
var T0 = { exports: {} }, Fr;
function Ge() {
  return Fr || (Fr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      /** @preserve
      			(c) 2012 by Cédric Mesnil. All rights reserved.
      
      			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
      
      			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
      			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
      
      			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
      			*/
      return function(t) {
        var p = s, _ = p.lib, H = _.WordArray, d = _.Hasher, l = p.algo, r = H.create([
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          7,
          4,
          13,
          1,
          10,
          6,
          15,
          3,
          12,
          0,
          9,
          5,
          2,
          14,
          11,
          8,
          3,
          10,
          14,
          4,
          9,
          15,
          8,
          1,
          2,
          7,
          0,
          6,
          13,
          11,
          5,
          12,
          1,
          9,
          11,
          10,
          0,
          8,
          12,
          4,
          13,
          3,
          7,
          15,
          14,
          5,
          6,
          2,
          4,
          0,
          5,
          9,
          7,
          12,
          2,
          10,
          14,
          1,
          3,
          8,
          11,
          6,
          15,
          13
        ]), a = H.create([
          5,
          14,
          7,
          0,
          9,
          2,
          11,
          4,
          13,
          6,
          15,
          8,
          1,
          10,
          3,
          12,
          6,
          11,
          3,
          7,
          0,
          13,
          5,
          10,
          14,
          15,
          8,
          12,
          4,
          9,
          1,
          2,
          15,
          5,
          1,
          3,
          7,
          14,
          6,
          9,
          11,
          8,
          12,
          2,
          10,
          0,
          4,
          13,
          8,
          6,
          4,
          1,
          3,
          11,
          15,
          0,
          5,
          12,
          2,
          13,
          9,
          7,
          10,
          14,
          12,
          15,
          10,
          4,
          1,
          5,
          8,
          7,
          6,
          2,
          13,
          14,
          0,
          3,
          9,
          11
        ]), h = H.create([
          11,
          14,
          15,
          12,
          5,
          8,
          7,
          9,
          11,
          13,
          14,
          15,
          6,
          7,
          9,
          8,
          7,
          6,
          8,
          13,
          11,
          9,
          7,
          15,
          7,
          12,
          15,
          9,
          11,
          7,
          13,
          12,
          11,
          13,
          6,
          7,
          14,
          9,
          13,
          15,
          14,
          8,
          13,
          6,
          5,
          12,
          7,
          5,
          11,
          12,
          14,
          15,
          14,
          15,
          9,
          8,
          9,
          14,
          5,
          6,
          8,
          6,
          5,
          12,
          9,
          15,
          5,
          11,
          6,
          8,
          13,
          12,
          5,
          12,
          13,
          14,
          11,
          8,
          5,
          6
        ]), e = H.create([
          8,
          9,
          9,
          11,
          13,
          15,
          15,
          5,
          7,
          7,
          8,
          11,
          14,
          14,
          12,
          6,
          9,
          13,
          15,
          7,
          12,
          8,
          9,
          11,
          7,
          7,
          12,
          7,
          6,
          15,
          13,
          11,
          9,
          7,
          15,
          11,
          8,
          6,
          6,
          14,
          12,
          13,
          5,
          14,
          13,
          13,
          7,
          5,
          15,
          5,
          8,
          11,
          14,
          14,
          6,
          14,
          6,
          9,
          12,
          9,
          12,
          5,
          15,
          8,
          8,
          5,
          12,
          9,
          12,
          5,
          14,
          6,
          8,
          13,
          6,
          5,
          15,
          13,
          11,
          11
        ]), o = H.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), x = H.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), f = l.RIPEMD160 = d.extend({
          _doReset: function() {
            this._hash = H.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          },
          _doProcessBlock: function(C, k) {
            for (var m = 0; m < 16; m++) {
              var q = k + m, u = C[q];
              C[q] = (u << 8 | u >>> 24) & 16711935 | (u << 24 | u >>> 8) & 4278255360;
            }
            var y = this._hash.words, S = o.words, R = x.words, P = r.words, F = a.words, L = h.words, K = e.words, O, I, N, w, z, E, A, G, X, $;
            E = O = y[0], A = I = y[1], G = N = y[2], X = w = y[3], $ = z = y[4];
            for (var W, m = 0; m < 80; m += 1)
              W = O + C[k + P[m]] | 0, m < 16 ? W += v(I, N, w) + S[0] : m < 32 ? W += g(I, N, w) + S[1] : m < 48 ? W += n(I, N, w) + S[2] : m < 64 ? W += i(I, N, w) + S[3] : W += c(I, N, w) + S[4], W = W | 0, W = B(W, L[m]), W = W + z | 0, O = z, z = w, w = B(N, 10), N = I, I = W, W = E + C[k + F[m]] | 0, m < 16 ? W += c(A, G, X) + R[0] : m < 32 ? W += i(A, G, X) + R[1] : m < 48 ? W += n(A, G, X) + R[2] : m < 64 ? W += g(A, G, X) + R[3] : W += v(A, G, X) + R[4], W = W | 0, W = B(W, K[m]), W = W + $ | 0, E = $, $ = X, X = B(G, 10), G = A, A = W;
            W = y[1] + N + X | 0, y[1] = y[2] + w + $ | 0, y[2] = y[3] + z + E | 0, y[3] = y[4] + O + A | 0, y[4] = y[0] + I + G | 0, y[0] = W;
          },
          _doFinalize: function() {
            var C = this._data, k = C.words, m = this._nDataBytes * 8, q = C.sigBytes * 8;
            k[q >>> 5] |= 128 << 24 - q % 32, k[(q + 64 >>> 9 << 4) + 14] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360, C.sigBytes = (k.length + 1) * 4, this._process();
            for (var u = this._hash, y = u.words, S = 0; S < 5; S++) {
              var R = y[S];
              y[S] = (R << 8 | R >>> 24) & 16711935 | (R << 24 | R >>> 8) & 4278255360;
            }
            return u;
          },
          clone: function() {
            var C = d.clone.call(this);
            return C._hash = this._hash.clone(), C;
          }
        });
        function v(C, k, m) {
          return C ^ k ^ m;
        }
        function g(C, k, m) {
          return C & k | ~C & m;
        }
        function n(C, k, m) {
          return (C | ~k) ^ m;
        }
        function i(C, k, m) {
          return C & m | k & ~m;
        }
        function c(C, k, m) {
          return C ^ (k | ~m);
        }
        function B(C, k) {
          return C << k | C >>> 32 - k;
        }
        p.RIPEMD160 = d._createHelper(f), p.HmacRIPEMD160 = d._createHmacHelper(f);
      }(), s.RIPEMD160;
    });
  }(T0)), T0.exports;
}
var L0 = { exports: {} }, Wr;
function or() {
  return Wr || (Wr = 1, function(b, D) {
    (function(s, t) {
      b.exports = t(U());
    })(T, function(s) {
      (function() {
        var t = s, p = t.lib, _ = p.Base, H = t.enc, d = H.Utf8, l = t.algo;
        l.HMAC = _.extend({
          /**
           * Initializes a newly created HMAC.
           *
           * @param {Hasher} hasher The hash algorithm to use.
           * @param {WordArray|string} key The secret key.
           *
           * @example
           *
           *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
           */
          init: function(r, a) {
            r = this._hasher = new r.init(), typeof a == "string" && (a = d.parse(a));
            var h = r.blockSize, e = h * 4;
            a.sigBytes > e && (a = r.finalize(a)), a.clamp();
            for (var o = this._oKey = a.clone(), x = this._iKey = a.clone(), f = o.words, v = x.words, g = 0; g < h; g++)
              f[g] ^= 1549556828, v[g] ^= 909522486;
            o.sigBytes = x.sigBytes = e, this.reset();
          },
          /**
           * Resets this HMAC to its initial state.
           *
           * @example
           *
           *     hmacHasher.reset();
           */
          reset: function() {
            var r = this._hasher;
            r.reset(), r.update(this._iKey);
          },
          /**
           * Updates this HMAC with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {HMAC} This HMAC instance.
           *
           * @example
           *
           *     hmacHasher.update('message');
           *     hmacHasher.update(wordArray);
           */
          update: function(r) {
            return this._hasher.update(r), this;
          },
          /**
           * Finalizes the HMAC computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The HMAC.
           *
           * @example
           *
           *     var hmac = hmacHasher.finalize();
           *     var hmac = hmacHasher.finalize('message');
           *     var hmac = hmacHasher.finalize(wordArray);
           */
          finalize: function(r) {
            var a = this._hasher, h = a.finalize(r);
            a.reset();
            var e = a.finalize(this._oKey.clone().concat(h));
            return e;
          }
        });
      })();
    });
  }(L0)), L0.exports;
}
var U0 = { exports: {} }, Tr;
function je() {
  return Tr || (Tr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), xr(), or());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.Base, H = p.WordArray, d = t.algo, l = d.SHA1, r = d.HMAC, a = d.PBKDF2 = _.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA1
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: _.extend({
            keySize: 128 / 32,
            hasher: l,
            iterations: 1
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.PBKDF2.create();
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
           */
          init: function(h) {
            this.cfg = this.cfg.extend(h);
          },
          /**
           * Computes the Password-Based Key Derivation Function 2.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(h, e) {
            for (var o = this.cfg, x = r.create(o.hasher, h), f = H.create(), v = H.create([1]), g = f.words, n = v.words, i = o.keySize, c = o.iterations; g.length < i; ) {
              var B = x.update(e).finalize(v);
              x.reset();
              for (var C = B.words, k = C.length, m = B, q = 1; q < c; q++) {
                m = x.finalize(m), x.reset();
                for (var u = m.words, y = 0; y < k; y++)
                  C[y] ^= u[y];
              }
              f.concat(B), n[0]++;
            }
            return f.sigBytes = i * 4, f;
          }
        });
        t.PBKDF2 = function(h, e, o) {
          return a.create(o).compute(h, e);
        };
      }(), s.PBKDF2;
    });
  }(U0)), U0.exports;
}
var O0 = { exports: {} }, Lr;
function t0() {
  return Lr || (Lr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), xr(), or());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.Base, H = p.WordArray, d = t.algo, l = d.MD5, r = d.EvpKDF = _.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: _.extend({
            keySize: 128 / 32,
            hasher: l,
            iterations: 1
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.EvpKDF.create();
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
           */
          init: function(a) {
            this.cfg = this.cfg.extend(a);
          },
          /**
           * Derives a key from a password.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(a, h) {
            for (var e, o = this.cfg, x = o.hasher.create(), f = H.create(), v = f.words, g = o.keySize, n = o.iterations; v.length < g; ) {
              e && x.update(e), e = x.update(a).finalize(h), x.reset();
              for (var i = 1; i < n; i++)
                e = x.finalize(e), x.reset();
              f.concat(e);
            }
            return f.sigBytes = g * 4, f;
          }
        });
        t.EvpKDF = function(a, h, e) {
          return r.create(e).compute(a, h);
        };
      }(), s.EvpKDF;
    });
  }(O0)), O0.exports;
}
var N0 = { exports: {} }, Ur;
function j() {
  return Ur || (Ur = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), t0());
    })(T, function(s) {
      s.lib.Cipher || function(t) {
        var p = s, _ = p.lib, H = _.Base, d = _.WordArray, l = _.BufferedBlockAlgorithm, r = p.enc;
        r.Utf8;
        var a = r.Base64, h = p.algo, e = h.EvpKDF, o = _.Cipher = l.extend({
          /**
           * Configuration options.
           *
           * @property {WordArray} iv The IV to use for this operation.
           */
          cfg: H.extend(),
          /**
           * Creates this cipher in encryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
           */
          createEncryptor: function(u, y) {
            return this.create(this._ENC_XFORM_MODE, u, y);
          },
          /**
           * Creates this cipher in decryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
           */
          createDecryptor: function(u, y) {
            return this.create(this._DEC_XFORM_MODE, u, y);
          },
          /**
           * Initializes a newly created cipher.
           *
           * @param {number} xformMode Either the encryption or decryption transormation mode constant.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
           */
          init: function(u, y, S) {
            this.cfg = this.cfg.extend(S), this._xformMode = u, this._key = y, this.reset();
          },
          /**
           * Resets this cipher to its initial state.
           *
           * @example
           *
           *     cipher.reset();
           */
          reset: function() {
            l.reset.call(this), this._doReset();
          },
          /**
           * Adds data to be encrypted or decrypted.
           *
           * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
           *
           * @return {WordArray} The data after processing.
           *
           * @example
           *
           *     var encrypted = cipher.process('data');
           *     var encrypted = cipher.process(wordArray);
           */
          process: function(u) {
            return this._append(u), this._process();
          },
          /**
           * Finalizes the encryption or decryption process.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
           *
           * @return {WordArray} The data after final processing.
           *
           * @example
           *
           *     var encrypted = cipher.finalize();
           *     var encrypted = cipher.finalize('data');
           *     var encrypted = cipher.finalize(wordArray);
           */
          finalize: function(u) {
            u && this._append(u);
            var y = this._doFinalize();
            return y;
          },
          keySize: 128 / 32,
          ivSize: 128 / 32,
          _ENC_XFORM_MODE: 1,
          _DEC_XFORM_MODE: 2,
          /**
           * Creates shortcut functions to a cipher's object interface.
           *
           * @param {Cipher} cipher The cipher to create a helper for.
           *
           * @return {Object} An object with encrypt and decrypt shortcut functions.
           *
           * @static
           *
           * @example
           *
           *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
           */
          _createHelper: function() {
            function u(y) {
              return typeof y == "string" ? q : C;
            }
            return function(y) {
              return {
                encrypt: function(S, R, P) {
                  return u(R).encrypt(y, S, R, P);
                },
                decrypt: function(S, R, P) {
                  return u(R).decrypt(y, S, R, P);
                }
              };
            };
          }()
        });
        _.StreamCipher = o.extend({
          _doFinalize: function() {
            var u = this._process(!0);
            return u;
          },
          blockSize: 1
        });
        var x = p.mode = {}, f = _.BlockCipherMode = H.extend({
          /**
           * Creates this mode for encryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
           */
          createEncryptor: function(u, y) {
            return this.Encryptor.create(u, y);
          },
          /**
           * Creates this mode for decryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
           */
          createDecryptor: function(u, y) {
            return this.Decryptor.create(u, y);
          },
          /**
           * Initializes a newly created mode.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
           */
          init: function(u, y) {
            this._cipher = u, this._iv = y;
          }
        }), v = x.CBC = function() {
          var u = f.extend();
          u.Encryptor = u.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(S, R) {
              var P = this._cipher, F = P.blockSize;
              y.call(this, S, R, F), P.encryptBlock(S, R), this._prevBlock = S.slice(R, R + F);
            }
          }), u.Decryptor = u.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(S, R) {
              var P = this._cipher, F = P.blockSize, L = S.slice(R, R + F);
              P.decryptBlock(S, R), y.call(this, S, R, F), this._prevBlock = L;
            }
          });
          function y(S, R, P) {
            var F, L = this._iv;
            L ? (F = L, this._iv = t) : F = this._prevBlock;
            for (var K = 0; K < P; K++)
              S[R + K] ^= F[K];
          }
          return u;
        }(), g = p.pad = {}, n = g.Pkcs7 = {
          /**
           * Pads data using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to pad.
           * @param {number} blockSize The multiple that the data should be padded to.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
           */
          pad: function(u, y) {
            for (var S = y * 4, R = S - u.sigBytes % S, P = R << 24 | R << 16 | R << 8 | R, F = [], L = 0; L < R; L += 4)
              F.push(P);
            var K = d.create(F, R);
            u.concat(K);
          },
          /**
           * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to unpad.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.unpad(wordArray);
           */
          unpad: function(u) {
            var y = u.words[u.sigBytes - 1 >>> 2] & 255;
            u.sigBytes -= y;
          }
        };
        _.BlockCipher = o.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: o.cfg.extend({
            mode: v,
            padding: n
          }),
          reset: function() {
            var u;
            o.reset.call(this);
            var y = this.cfg, S = y.iv, R = y.mode;
            this._xformMode == this._ENC_XFORM_MODE ? u = R.createEncryptor : (u = R.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == u ? this._mode.init(this, S && S.words) : (this._mode = u.call(R, this, S && S.words), this._mode.__creator = u);
          },
          _doProcessBlock: function(u, y) {
            this._mode.processBlock(u, y);
          },
          _doFinalize: function() {
            var u, y = this.cfg.padding;
            return this._xformMode == this._ENC_XFORM_MODE ? (y.pad(this._data, this.blockSize), u = this._process(!0)) : (u = this._process(!0), y.unpad(u)), u;
          },
          blockSize: 128 / 32
        });
        var i = _.CipherParams = H.extend({
          /**
           * Initializes a newly created cipher params object.
           *
           * @param {Object} cipherParams An object with any of the possible cipher parameters.
           *
           * @example
           *
           *     var cipherParams = CryptoJS.lib.CipherParams.create({
           *         ciphertext: ciphertextWordArray,
           *         key: keyWordArray,
           *         iv: ivWordArray,
           *         salt: saltWordArray,
           *         algorithm: CryptoJS.algo.AES,
           *         mode: CryptoJS.mode.CBC,
           *         padding: CryptoJS.pad.PKCS7,
           *         blockSize: 4,
           *         formatter: CryptoJS.format.OpenSSL
           *     });
           */
          init: function(u) {
            this.mixIn(u);
          },
          /**
           * Converts this cipher params object to a string.
           *
           * @param {Format} formatter (Optional) The formatting strategy to use.
           *
           * @return {string} The stringified cipher params.
           *
           * @throws Error If neither the formatter nor the default formatter is set.
           *
           * @example
           *
           *     var string = cipherParams + '';
           *     var string = cipherParams.toString();
           *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
           */
          toString: function(u) {
            return (u || this.formatter).stringify(this);
          }
        }), c = p.format = {}, B = c.OpenSSL = {
          /**
           * Converts a cipher params object to an OpenSSL-compatible string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The OpenSSL-compatible string.
           *
           * @static
           *
           * @example
           *
           *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
           */
          stringify: function(u) {
            var y, S = u.ciphertext, R = u.salt;
            return R ? y = d.create([1398893684, 1701076831]).concat(R).concat(S) : y = S, y.toString(a);
          },
          /**
           * Converts an OpenSSL-compatible string to a cipher params object.
           *
           * @param {string} openSSLStr The OpenSSL-compatible string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
           */
          parse: function(u) {
            var y, S = a.parse(u), R = S.words;
            return R[0] == 1398893684 && R[1] == 1701076831 && (y = d.create(R.slice(2, 4)), R.splice(0, 4), S.sigBytes -= 16), i.create({ ciphertext: S, salt: y });
          }
        }, C = _.SerializableCipher = H.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: H.extend({
            format: B
          }),
          /**
           * Encrypts a message.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(u, y, S, R) {
            R = this.cfg.extend(R);
            var P = u.createEncryptor(S, R), F = P.finalize(y), L = P.cfg;
            return i.create({
              ciphertext: F,
              key: S,
              iv: L.iv,
              algorithm: u,
              mode: L.mode,
              padding: L.padding,
              blockSize: u.blockSize,
              formatter: R.format
            });
          },
          /**
           * Decrypts serialized ciphertext.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(u, y, S, R) {
            R = this.cfg.extend(R), y = this._parse(y, R.format);
            var P = u.createDecryptor(S, R).finalize(y.ciphertext);
            return P;
          },
          /**
           * Converts serialized ciphertext to CipherParams,
           * else assumed CipherParams already and returns ciphertext unchanged.
           *
           * @param {CipherParams|string} ciphertext The ciphertext.
           * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
           *
           * @return {CipherParams} The unserialized ciphertext.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
           */
          _parse: function(u, y) {
            return typeof u == "string" ? y.parse(u, this) : u;
          }
        }), k = p.kdf = {}, m = k.OpenSSL = {
          /**
           * Derives a key and IV from a password.
           *
           * @param {string} password The password to derive from.
           * @param {number} keySize The size in words of the key to generate.
           * @param {number} ivSize The size in words of the IV to generate.
           * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
           *
           * @return {CipherParams} A cipher params object with the key, IV, and salt.
           *
           * @static
           *
           * @example
           *
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
           */
          execute: function(u, y, S, R) {
            R || (R = d.random(64 / 8));
            var P = e.create({ keySize: y + S }).compute(u, R), F = d.create(P.words.slice(y), S * 4);
            return P.sigBytes = y * 4, i.create({ key: P, iv: F, salt: R });
          }
        }, q = _.PasswordBasedCipher = C.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: C.cfg.extend({
            kdf: m
          }),
          /**
           * Encrypts a message using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(u, y, S, R) {
            R = this.cfg.extend(R);
            var P = R.kdf.execute(S, u.keySize, u.ivSize);
            R.iv = P.iv;
            var F = C.encrypt.call(this, u, y, P.key, R);
            return F.mixIn(P), F;
          },
          /**
           * Decrypts serialized ciphertext using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(u, y, S, R) {
            R = this.cfg.extend(R), y = this._parse(y, R.format);
            var P = R.kdf.execute(S, u.keySize, u.ivSize, y.salt);
            R.iv = P.iv;
            var F = C.decrypt.call(this, u, y, P.key, R);
            return F;
          }
        });
      }();
    });
  }(N0)), N0.exports;
}
var I0 = { exports: {} }, Or;
function $e() {
  return Or || (Or = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.mode.CFB = function() {
        var t = s.lib.BlockCipherMode.extend();
        t.Encryptor = t.extend({
          processBlock: function(_, H) {
            var d = this._cipher, l = d.blockSize;
            p.call(this, _, H, l, d), this._prevBlock = _.slice(H, H + l);
          }
        }), t.Decryptor = t.extend({
          processBlock: function(_, H) {
            var d = this._cipher, l = d.blockSize, r = _.slice(H, H + l);
            p.call(this, _, H, l, d), this._prevBlock = r;
          }
        });
        function p(_, H, d, l) {
          var r, a = this._iv;
          a ? (r = a.slice(0), this._iv = void 0) : r = this._prevBlock, l.encryptBlock(r, 0);
          for (var h = 0; h < d; h++)
            _[H + h] ^= r[h];
        }
        return t;
      }(), s.mode.CFB;
    });
  }(I0)), I0.exports;
}
var X0 = { exports: {} }, Nr;
function Me() {
  return Nr || (Nr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.mode.CTR = function() {
        var t = s.lib.BlockCipherMode.extend(), p = t.Encryptor = t.extend({
          processBlock: function(_, H) {
            var d = this._cipher, l = d.blockSize, r = this._iv, a = this._counter;
            r && (a = this._counter = r.slice(0), this._iv = void 0);
            var h = a.slice(0);
            d.encryptBlock(h, 0), a[l - 1] = a[l - 1] + 1 | 0;
            for (var e = 0; e < l; e++)
              _[H + e] ^= h[e];
          }
        });
        return t.Decryptor = p, t;
      }(), s.mode.CTR;
    });
  }(X0)), X0.exports;
}
var K0 = { exports: {} }, Ir;
function Ze() {
  return Ir || (Ir = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      /** @preserve
       * Counter block mode compatible with  Dr Brian Gladman fileenc.c
       * derived from CryptoJS.mode.CTR
       * Jan Hruby jhruby.web@gmail.com
       */
      return s.mode.CTRGladman = function() {
        var t = s.lib.BlockCipherMode.extend();
        function p(d) {
          if ((d >> 24 & 255) === 255) {
            var l = d >> 16 & 255, r = d >> 8 & 255, a = d & 255;
            l === 255 ? (l = 0, r === 255 ? (r = 0, a === 255 ? a = 0 : ++a) : ++r) : ++l, d = 0, d += l << 16, d += r << 8, d += a;
          } else
            d += 1 << 24;
          return d;
        }
        function _(d) {
          return (d[0] = p(d[0])) === 0 && (d[1] = p(d[1])), d;
        }
        var H = t.Encryptor = t.extend({
          processBlock: function(d, l) {
            var r = this._cipher, a = r.blockSize, h = this._iv, e = this._counter;
            h && (e = this._counter = h.slice(0), this._iv = void 0), _(e);
            var o = e.slice(0);
            r.encryptBlock(o, 0);
            for (var x = 0; x < a; x++)
              d[l + x] ^= o[x];
          }
        });
        return t.Decryptor = H, t;
      }(), s.mode.CTRGladman;
    });
  }(K0)), K0.exports;
}
var G0 = { exports: {} }, Xr;
function Qe() {
  return Xr || (Xr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.mode.OFB = function() {
        var t = s.lib.BlockCipherMode.extend(), p = t.Encryptor = t.extend({
          processBlock: function(_, H) {
            var d = this._cipher, l = d.blockSize, r = this._iv, a = this._keystream;
            r && (a = this._keystream = r.slice(0), this._iv = void 0), d.encryptBlock(a, 0);
            for (var h = 0; h < l; h++)
              _[H + h] ^= a[h];
          }
        });
        return t.Decryptor = p, t;
      }(), s.mode.OFB;
    });
  }(G0)), G0.exports;
}
var j0 = { exports: {} }, Kr;
function Ye() {
  return Kr || (Kr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.mode.ECB = function() {
        var t = s.lib.BlockCipherMode.extend();
        return t.Encryptor = t.extend({
          processBlock: function(p, _) {
            this._cipher.encryptBlock(p, _);
          }
        }), t.Decryptor = t.extend({
          processBlock: function(p, _) {
            this._cipher.decryptBlock(p, _);
          }
        }), t;
      }(), s.mode.ECB;
    });
  }(j0)), j0.exports;
}
var $0 = { exports: {} }, Gr;
function Ve() {
  return Gr || (Gr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.pad.AnsiX923 = {
        pad: function(t, p) {
          var _ = t.sigBytes, H = p * 4, d = H - _ % H, l = _ + d - 1;
          t.clamp(), t.words[l >>> 2] |= d << 24 - l % 4 * 8, t.sigBytes += d;
        },
        unpad: function(t) {
          var p = t.words[t.sigBytes - 1 >>> 2] & 255;
          t.sigBytes -= p;
        }
      }, s.pad.Ansix923;
    });
  }($0)), $0.exports;
}
var M0 = { exports: {} }, jr;
function Je() {
  return jr || (jr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.pad.Iso10126 = {
        pad: function(t, p) {
          var _ = p * 4, H = _ - t.sigBytes % _;
          t.concat(s.lib.WordArray.random(H - 1)).concat(s.lib.WordArray.create([H << 24], 1));
        },
        unpad: function(t) {
          var p = t.words[t.sigBytes - 1 >>> 2] & 255;
          t.sigBytes -= p;
        }
      }, s.pad.Iso10126;
    });
  }(M0)), M0.exports;
}
var Z0 = { exports: {} }, $r;
function rt() {
  return $r || ($r = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.pad.Iso97971 = {
        pad: function(t, p) {
          t.concat(s.lib.WordArray.create([2147483648], 1)), s.pad.ZeroPadding.pad(t, p);
        },
        unpad: function(t) {
          s.pad.ZeroPadding.unpad(t), t.sigBytes--;
        }
      }, s.pad.Iso97971;
    });
  }(Z0)), Z0.exports;
}
var Q0 = { exports: {} }, Mr;
function et() {
  return Mr || (Mr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.pad.ZeroPadding = {
        pad: function(t, p) {
          var _ = p * 4;
          t.clamp(), t.sigBytes += _ - (t.sigBytes % _ || _);
        },
        unpad: function(t) {
          for (var p = t.words, _ = t.sigBytes - 1, _ = t.sigBytes - 1; _ >= 0; _--)
            if (p[_ >>> 2] >>> 24 - _ % 4 * 8 & 255) {
              t.sigBytes = _ + 1;
              break;
            }
        }
      }, s.pad.ZeroPadding;
    });
  }(Q0)), Q0.exports;
}
var Y0 = { exports: {} }, Zr;
function tt() {
  return Zr || (Zr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return s.pad.NoPadding = {
        pad: function() {
        },
        unpad: function() {
        }
      }, s.pad.NoPadding;
    });
  }(Y0)), Y0.exports;
}
var V0 = { exports: {} }, Qr;
function at() {
  return Qr || (Qr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), j());
    })(T, function(s) {
      return function(t) {
        var p = s, _ = p.lib, H = _.CipherParams, d = p.enc, l = d.Hex, r = p.format;
        r.Hex = {
          /**
           * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The hexadecimally encoded string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
           */
          stringify: function(a) {
            return a.ciphertext.toString(l);
          },
          /**
           * Converts a hexadecimally encoded ciphertext string to a cipher params object.
           *
           * @param {string} input The hexadecimally encoded string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
           */
          parse: function(a) {
            var h = l.parse(a);
            return H.create({ ciphertext: h });
          }
        };
      }(), s.format.Hex;
    });
  }(V0)), V0.exports;
}
var J0 = { exports: {} }, Yr;
function nt() {
  return Yr || (Yr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), o0(), i0(), t0(), j());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.BlockCipher, H = t.algo, d = [], l = [], r = [], a = [], h = [], e = [], o = [], x = [], f = [], v = [];
        (function() {
          for (var i = [], c = 0; c < 256; c++)
            c < 128 ? i[c] = c << 1 : i[c] = c << 1 ^ 283;
          for (var B = 0, C = 0, c = 0; c < 256; c++) {
            var k = C ^ C << 1 ^ C << 2 ^ C << 3 ^ C << 4;
            k = k >>> 8 ^ k & 255 ^ 99, d[B] = k, l[k] = B;
            var m = i[B], q = i[m], u = i[q], y = i[k] * 257 ^ k * 16843008;
            r[B] = y << 24 | y >>> 8, a[B] = y << 16 | y >>> 16, h[B] = y << 8 | y >>> 24, e[B] = y;
            var y = u * 16843009 ^ q * 65537 ^ m * 257 ^ B * 16843008;
            o[k] = y << 24 | y >>> 8, x[k] = y << 16 | y >>> 16, f[k] = y << 8 | y >>> 24, v[k] = y, B ? (B = m ^ i[i[i[u ^ m]]], C ^= i[i[C]]) : B = C = 1;
          }
        })();
        var g = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], n = H.AES = _.extend({
          _doReset: function() {
            var i;
            if (!(this._nRounds && this._keyPriorReset === this._key)) {
              for (var c = this._keyPriorReset = this._key, B = c.words, C = c.sigBytes / 4, k = this._nRounds = C + 6, m = (k + 1) * 4, q = this._keySchedule = [], u = 0; u < m; u++)
                u < C ? q[u] = B[u] : (i = q[u - 1], u % C ? C > 6 && u % C == 4 && (i = d[i >>> 24] << 24 | d[i >>> 16 & 255] << 16 | d[i >>> 8 & 255] << 8 | d[i & 255]) : (i = i << 8 | i >>> 24, i = d[i >>> 24] << 24 | d[i >>> 16 & 255] << 16 | d[i >>> 8 & 255] << 8 | d[i & 255], i ^= g[u / C | 0] << 24), q[u] = q[u - C] ^ i);
              for (var y = this._invKeySchedule = [], S = 0; S < m; S++) {
                var u = m - S;
                if (S % 4)
                  var i = q[u];
                else
                  var i = q[u - 4];
                S < 4 || u <= 4 ? y[S] = i : y[S] = o[d[i >>> 24]] ^ x[d[i >>> 16 & 255]] ^ f[d[i >>> 8 & 255]] ^ v[d[i & 255]];
              }
            }
          },
          encryptBlock: function(i, c) {
            this._doCryptBlock(i, c, this._keySchedule, r, a, h, e, d);
          },
          decryptBlock: function(i, c) {
            var B = i[c + 1];
            i[c + 1] = i[c + 3], i[c + 3] = B, this._doCryptBlock(i, c, this._invKeySchedule, o, x, f, v, l);
            var B = i[c + 1];
            i[c + 1] = i[c + 3], i[c + 3] = B;
          },
          _doCryptBlock: function(i, c, B, C, k, m, q, u) {
            for (var y = this._nRounds, S = i[c] ^ B[0], R = i[c + 1] ^ B[1], P = i[c + 2] ^ B[2], F = i[c + 3] ^ B[3], L = 4, K = 1; K < y; K++) {
              var O = C[S >>> 24] ^ k[R >>> 16 & 255] ^ m[P >>> 8 & 255] ^ q[F & 255] ^ B[L++], I = C[R >>> 24] ^ k[P >>> 16 & 255] ^ m[F >>> 8 & 255] ^ q[S & 255] ^ B[L++], N = C[P >>> 24] ^ k[F >>> 16 & 255] ^ m[S >>> 8 & 255] ^ q[R & 255] ^ B[L++], w = C[F >>> 24] ^ k[S >>> 16 & 255] ^ m[R >>> 8 & 255] ^ q[P & 255] ^ B[L++];
              S = O, R = I, P = N, F = w;
            }
            var O = (u[S >>> 24] << 24 | u[R >>> 16 & 255] << 16 | u[P >>> 8 & 255] << 8 | u[F & 255]) ^ B[L++], I = (u[R >>> 24] << 24 | u[P >>> 16 & 255] << 16 | u[F >>> 8 & 255] << 8 | u[S & 255]) ^ B[L++], N = (u[P >>> 24] << 24 | u[F >>> 16 & 255] << 16 | u[S >>> 8 & 255] << 8 | u[R & 255]) ^ B[L++], w = (u[F >>> 24] << 24 | u[S >>> 16 & 255] << 16 | u[R >>> 8 & 255] << 8 | u[P & 255]) ^ B[L++];
            i[c] = O, i[c + 1] = I, i[c + 2] = N, i[c + 3] = w;
          },
          keySize: 256 / 32
        });
        t.AES = _._createHelper(n);
      }(), s.AES;
    });
  }(J0)), J0.exports;
}
var rr = { exports: {} }, Vr;
function xt() {
  return Vr || (Vr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), o0(), i0(), t0(), j());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.WordArray, H = p.BlockCipher, d = t.algo, l = [
          57,
          49,
          41,
          33,
          25,
          17,
          9,
          1,
          58,
          50,
          42,
          34,
          26,
          18,
          10,
          2,
          59,
          51,
          43,
          35,
          27,
          19,
          11,
          3,
          60,
          52,
          44,
          36,
          63,
          55,
          47,
          39,
          31,
          23,
          15,
          7,
          62,
          54,
          46,
          38,
          30,
          22,
          14,
          6,
          61,
          53,
          45,
          37,
          29,
          21,
          13,
          5,
          28,
          20,
          12,
          4
        ], r = [
          14,
          17,
          11,
          24,
          1,
          5,
          3,
          28,
          15,
          6,
          21,
          10,
          23,
          19,
          12,
          4,
          26,
          8,
          16,
          7,
          27,
          20,
          13,
          2,
          41,
          52,
          31,
          37,
          47,
          55,
          30,
          40,
          51,
          45,
          33,
          48,
          44,
          49,
          39,
          56,
          34,
          53,
          46,
          42,
          50,
          36,
          29,
          32
        ], a = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], h = [
          {
            0: 8421888,
            268435456: 32768,
            536870912: 8421378,
            805306368: 2,
            1073741824: 512,
            1342177280: 8421890,
            1610612736: 8389122,
            1879048192: 8388608,
            2147483648: 514,
            2415919104: 8389120,
            2684354560: 33280,
            2952790016: 8421376,
            3221225472: 32770,
            3489660928: 8388610,
            3758096384: 0,
            4026531840: 33282,
            134217728: 0,
            402653184: 8421890,
            671088640: 33282,
            939524096: 32768,
            1207959552: 8421888,
            1476395008: 512,
            1744830464: 8421378,
            2013265920: 2,
            2281701376: 8389120,
            2550136832: 33280,
            2818572288: 8421376,
            3087007744: 8389122,
            3355443200: 8388610,
            3623878656: 32770,
            3892314112: 514,
            4160749568: 8388608,
            1: 32768,
            268435457: 2,
            536870913: 8421888,
            805306369: 8388608,
            1073741825: 8421378,
            1342177281: 33280,
            1610612737: 512,
            1879048193: 8389122,
            2147483649: 8421890,
            2415919105: 8421376,
            2684354561: 8388610,
            2952790017: 33282,
            3221225473: 514,
            3489660929: 8389120,
            3758096385: 32770,
            4026531841: 0,
            134217729: 8421890,
            402653185: 8421376,
            671088641: 8388608,
            939524097: 512,
            1207959553: 32768,
            1476395009: 8388610,
            1744830465: 2,
            2013265921: 33282,
            2281701377: 32770,
            2550136833: 8389122,
            2818572289: 514,
            3087007745: 8421888,
            3355443201: 8389120,
            3623878657: 0,
            3892314113: 33280,
            4160749569: 8421378
          },
          {
            0: 1074282512,
            16777216: 16384,
            33554432: 524288,
            50331648: 1074266128,
            67108864: 1073741840,
            83886080: 1074282496,
            100663296: 1073758208,
            117440512: 16,
            134217728: 540672,
            150994944: 1073758224,
            167772160: 1073741824,
            184549376: 540688,
            201326592: 524304,
            218103808: 0,
            234881024: 16400,
            251658240: 1074266112,
            8388608: 1073758208,
            25165824: 540688,
            41943040: 16,
            58720256: 1073758224,
            75497472: 1074282512,
            92274688: 1073741824,
            109051904: 524288,
            125829120: 1074266128,
            142606336: 524304,
            159383552: 0,
            176160768: 16384,
            192937984: 1074266112,
            209715200: 1073741840,
            226492416: 540672,
            243269632: 1074282496,
            260046848: 16400,
            268435456: 0,
            285212672: 1074266128,
            301989888: 1073758224,
            318767104: 1074282496,
            335544320: 1074266112,
            352321536: 16,
            369098752: 540688,
            385875968: 16384,
            402653184: 16400,
            419430400: 524288,
            436207616: 524304,
            452984832: 1073741840,
            469762048: 540672,
            486539264: 1073758208,
            503316480: 1073741824,
            520093696: 1074282512,
            276824064: 540688,
            293601280: 524288,
            310378496: 1074266112,
            327155712: 16384,
            343932928: 1073758208,
            360710144: 1074282512,
            377487360: 16,
            394264576: 1073741824,
            411041792: 1074282496,
            427819008: 1073741840,
            444596224: 1073758224,
            461373440: 524304,
            478150656: 0,
            494927872: 16400,
            511705088: 1074266128,
            528482304: 540672
          },
          {
            0: 260,
            1048576: 0,
            2097152: 67109120,
            3145728: 65796,
            4194304: 65540,
            5242880: 67108868,
            6291456: 67174660,
            7340032: 67174400,
            8388608: 67108864,
            9437184: 67174656,
            10485760: 65792,
            11534336: 67174404,
            12582912: 67109124,
            13631488: 65536,
            14680064: 4,
            15728640: 256,
            524288: 67174656,
            1572864: 67174404,
            2621440: 0,
            3670016: 67109120,
            4718592: 67108868,
            5767168: 65536,
            6815744: 65540,
            7864320: 260,
            8912896: 4,
            9961472: 256,
            11010048: 67174400,
            12058624: 65796,
            13107200: 65792,
            14155776: 67109124,
            15204352: 67174660,
            16252928: 67108864,
            16777216: 67174656,
            17825792: 65540,
            18874368: 65536,
            19922944: 67109120,
            20971520: 256,
            22020096: 67174660,
            23068672: 67108868,
            24117248: 0,
            25165824: 67109124,
            26214400: 67108864,
            27262976: 4,
            28311552: 65792,
            29360128: 67174400,
            30408704: 260,
            31457280: 65796,
            32505856: 67174404,
            17301504: 67108864,
            18350080: 260,
            19398656: 67174656,
            20447232: 0,
            21495808: 65540,
            22544384: 67109120,
            23592960: 256,
            24641536: 67174404,
            25690112: 65536,
            26738688: 67174660,
            27787264: 65796,
            28835840: 67108868,
            29884416: 67109124,
            30932992: 67174400,
            31981568: 4,
            33030144: 65792
          },
          {
            0: 2151682048,
            65536: 2147487808,
            131072: 4198464,
            196608: 2151677952,
            262144: 0,
            327680: 4198400,
            393216: 2147483712,
            458752: 4194368,
            524288: 2147483648,
            589824: 4194304,
            655360: 64,
            720896: 2147487744,
            786432: 2151678016,
            851968: 4160,
            917504: 4096,
            983040: 2151682112,
            32768: 2147487808,
            98304: 64,
            163840: 2151678016,
            229376: 2147487744,
            294912: 4198400,
            360448: 2151682112,
            425984: 0,
            491520: 2151677952,
            557056: 4096,
            622592: 2151682048,
            688128: 4194304,
            753664: 4160,
            819200: 2147483648,
            884736: 4194368,
            950272: 4198464,
            1015808: 2147483712,
            1048576: 4194368,
            1114112: 4198400,
            1179648: 2147483712,
            1245184: 0,
            1310720: 4160,
            1376256: 2151678016,
            1441792: 2151682048,
            1507328: 2147487808,
            1572864: 2151682112,
            1638400: 2147483648,
            1703936: 2151677952,
            1769472: 4198464,
            1835008: 2147487744,
            1900544: 4194304,
            1966080: 64,
            2031616: 4096,
            1081344: 2151677952,
            1146880: 2151682112,
            1212416: 0,
            1277952: 4198400,
            1343488: 4194368,
            1409024: 2147483648,
            1474560: 2147487808,
            1540096: 64,
            1605632: 2147483712,
            1671168: 4096,
            1736704: 2147487744,
            1802240: 2151678016,
            1867776: 4160,
            1933312: 2151682048,
            1998848: 4194304,
            2064384: 4198464
          },
          {
            0: 128,
            4096: 17039360,
            8192: 262144,
            12288: 536870912,
            16384: 537133184,
            20480: 16777344,
            24576: 553648256,
            28672: 262272,
            32768: 16777216,
            36864: 537133056,
            40960: 536871040,
            45056: 553910400,
            49152: 553910272,
            53248: 0,
            57344: 17039488,
            61440: 553648128,
            2048: 17039488,
            6144: 553648256,
            10240: 128,
            14336: 17039360,
            18432: 262144,
            22528: 537133184,
            26624: 553910272,
            30720: 536870912,
            34816: 537133056,
            38912: 0,
            43008: 553910400,
            47104: 16777344,
            51200: 536871040,
            55296: 553648128,
            59392: 16777216,
            63488: 262272,
            65536: 262144,
            69632: 128,
            73728: 536870912,
            77824: 553648256,
            81920: 16777344,
            86016: 553910272,
            90112: 537133184,
            94208: 16777216,
            98304: 553910400,
            102400: 553648128,
            106496: 17039360,
            110592: 537133056,
            114688: 262272,
            118784: 536871040,
            122880: 0,
            126976: 17039488,
            67584: 553648256,
            71680: 16777216,
            75776: 17039360,
            79872: 537133184,
            83968: 536870912,
            88064: 17039488,
            92160: 128,
            96256: 553910272,
            100352: 262272,
            104448: 553910400,
            108544: 0,
            112640: 553648128,
            116736: 16777344,
            120832: 262144,
            124928: 537133056,
            129024: 536871040
          },
          {
            0: 268435464,
            256: 8192,
            512: 270532608,
            768: 270540808,
            1024: 268443648,
            1280: 2097152,
            1536: 2097160,
            1792: 268435456,
            2048: 0,
            2304: 268443656,
            2560: 2105344,
            2816: 8,
            3072: 270532616,
            3328: 2105352,
            3584: 8200,
            3840: 270540800,
            128: 270532608,
            384: 270540808,
            640: 8,
            896: 2097152,
            1152: 2105352,
            1408: 268435464,
            1664: 268443648,
            1920: 8200,
            2176: 2097160,
            2432: 8192,
            2688: 268443656,
            2944: 270532616,
            3200: 0,
            3456: 270540800,
            3712: 2105344,
            3968: 268435456,
            4096: 268443648,
            4352: 270532616,
            4608: 270540808,
            4864: 8200,
            5120: 2097152,
            5376: 268435456,
            5632: 268435464,
            5888: 2105344,
            6144: 2105352,
            6400: 0,
            6656: 8,
            6912: 270532608,
            7168: 8192,
            7424: 268443656,
            7680: 270540800,
            7936: 2097160,
            4224: 8,
            4480: 2105344,
            4736: 2097152,
            4992: 268435464,
            5248: 268443648,
            5504: 8200,
            5760: 270540808,
            6016: 270532608,
            6272: 270540800,
            6528: 270532616,
            6784: 8192,
            7040: 2105352,
            7296: 2097160,
            7552: 0,
            7808: 268435456,
            8064: 268443656
          },
          {
            0: 1048576,
            16: 33555457,
            32: 1024,
            48: 1049601,
            64: 34604033,
            80: 0,
            96: 1,
            112: 34603009,
            128: 33555456,
            144: 1048577,
            160: 33554433,
            176: 34604032,
            192: 34603008,
            208: 1025,
            224: 1049600,
            240: 33554432,
            8: 34603009,
            24: 0,
            40: 33555457,
            56: 34604032,
            72: 1048576,
            88: 33554433,
            104: 33554432,
            120: 1025,
            136: 1049601,
            152: 33555456,
            168: 34603008,
            184: 1048577,
            200: 1024,
            216: 34604033,
            232: 1,
            248: 1049600,
            256: 33554432,
            272: 1048576,
            288: 33555457,
            304: 34603009,
            320: 1048577,
            336: 33555456,
            352: 34604032,
            368: 1049601,
            384: 1025,
            400: 34604033,
            416: 1049600,
            432: 1,
            448: 0,
            464: 34603008,
            480: 33554433,
            496: 1024,
            264: 1049600,
            280: 33555457,
            296: 34603009,
            312: 1,
            328: 33554432,
            344: 1048576,
            360: 1025,
            376: 34604032,
            392: 33554433,
            408: 34603008,
            424: 0,
            440: 34604033,
            456: 1049601,
            472: 1024,
            488: 33555456,
            504: 1048577
          },
          {
            0: 134219808,
            1: 131072,
            2: 134217728,
            3: 32,
            4: 131104,
            5: 134350880,
            6: 134350848,
            7: 2048,
            8: 134348800,
            9: 134219776,
            10: 133120,
            11: 134348832,
            12: 2080,
            13: 0,
            14: 134217760,
            15: 133152,
            2147483648: 2048,
            2147483649: 134350880,
            2147483650: 134219808,
            2147483651: 134217728,
            2147483652: 134348800,
            2147483653: 133120,
            2147483654: 133152,
            2147483655: 32,
            2147483656: 134217760,
            2147483657: 2080,
            2147483658: 131104,
            2147483659: 134350848,
            2147483660: 0,
            2147483661: 134348832,
            2147483662: 134219776,
            2147483663: 131072,
            16: 133152,
            17: 134350848,
            18: 32,
            19: 2048,
            20: 134219776,
            21: 134217760,
            22: 134348832,
            23: 131072,
            24: 0,
            25: 131104,
            26: 134348800,
            27: 134219808,
            28: 134350880,
            29: 133120,
            30: 2080,
            31: 134217728,
            2147483664: 131072,
            2147483665: 2048,
            2147483666: 134348832,
            2147483667: 133152,
            2147483668: 32,
            2147483669: 134348800,
            2147483670: 134217728,
            2147483671: 134219808,
            2147483672: 134350880,
            2147483673: 134217760,
            2147483674: 134219776,
            2147483675: 0,
            2147483676: 133120,
            2147483677: 2080,
            2147483678: 131104,
            2147483679: 134350848
          }
        ], e = [
          4160749569,
          528482304,
          33030144,
          2064384,
          129024,
          8064,
          504,
          2147483679
        ], o = d.DES = H.extend({
          _doReset: function() {
            for (var g = this._key, n = g.words, i = [], c = 0; c < 56; c++) {
              var B = l[c] - 1;
              i[c] = n[B >>> 5] >>> 31 - B % 32 & 1;
            }
            for (var C = this._subKeys = [], k = 0; k < 16; k++) {
              for (var m = C[k] = [], q = a[k], c = 0; c < 24; c++)
                m[c / 6 | 0] |= i[(r[c] - 1 + q) % 28] << 31 - c % 6, m[4 + (c / 6 | 0)] |= i[28 + (r[c + 24] - 1 + q) % 28] << 31 - c % 6;
              m[0] = m[0] << 1 | m[0] >>> 31;
              for (var c = 1; c < 7; c++)
                m[c] = m[c] >>> (c - 1) * 4 + 3;
              m[7] = m[7] << 5 | m[7] >>> 27;
            }
            for (var u = this._invSubKeys = [], c = 0; c < 16; c++)
              u[c] = C[15 - c];
          },
          encryptBlock: function(g, n) {
            this._doCryptBlock(g, n, this._subKeys);
          },
          decryptBlock: function(g, n) {
            this._doCryptBlock(g, n, this._invSubKeys);
          },
          _doCryptBlock: function(g, n, i) {
            this._lBlock = g[n], this._rBlock = g[n + 1], x.call(this, 4, 252645135), x.call(this, 16, 65535), f.call(this, 2, 858993459), f.call(this, 8, 16711935), x.call(this, 1, 1431655765);
            for (var c = 0; c < 16; c++) {
              for (var B = i[c], C = this._lBlock, k = this._rBlock, m = 0, q = 0; q < 8; q++)
                m |= h[q][((k ^ B[q]) & e[q]) >>> 0];
              this._lBlock = k, this._rBlock = C ^ m;
            }
            var u = this._lBlock;
            this._lBlock = this._rBlock, this._rBlock = u, x.call(this, 1, 1431655765), f.call(this, 8, 16711935), f.call(this, 2, 858993459), x.call(this, 16, 65535), x.call(this, 4, 252645135), g[n] = this._lBlock, g[n + 1] = this._rBlock;
          },
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function x(g, n) {
          var i = (this._lBlock >>> g ^ this._rBlock) & n;
          this._rBlock ^= i, this._lBlock ^= i << g;
        }
        function f(g, n) {
          var i = (this._rBlock >>> g ^ this._lBlock) & n;
          this._lBlock ^= i, this._rBlock ^= i << g;
        }
        t.DES = H._createHelper(o);
        var v = d.TripleDES = H.extend({
          _doReset: function() {
            var g = this._key, n = g.words;
            if (n.length !== 2 && n.length !== 4 && n.length < 6)
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            var i = n.slice(0, 2), c = n.length < 4 ? n.slice(0, 2) : n.slice(2, 4), B = n.length < 6 ? n.slice(0, 2) : n.slice(4, 6);
            this._des1 = o.createEncryptor(_.create(i)), this._des2 = o.createEncryptor(_.create(c)), this._des3 = o.createEncryptor(_.create(B));
          },
          encryptBlock: function(g, n) {
            this._des1.encryptBlock(g, n), this._des2.decryptBlock(g, n), this._des3.encryptBlock(g, n);
          },
          decryptBlock: function(g, n) {
            this._des3.decryptBlock(g, n), this._des2.encryptBlock(g, n), this._des1.decryptBlock(g, n);
          },
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        t.TripleDES = H._createHelper(v);
      }(), s.TripleDES;
    });
  }(rr)), rr.exports;
}
var er = { exports: {} }, Jr;
function ot() {
  return Jr || (Jr = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), o0(), i0(), t0(), j());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.StreamCipher, H = t.algo, d = H.RC4 = _.extend({
          _doReset: function() {
            for (var a = this._key, h = a.words, e = a.sigBytes, o = this._S = [], x = 0; x < 256; x++)
              o[x] = x;
            for (var x = 0, f = 0; x < 256; x++) {
              var v = x % e, g = h[v >>> 2] >>> 24 - v % 4 * 8 & 255;
              f = (f + o[x] + g) % 256;
              var n = o[x];
              o[x] = o[f], o[f] = n;
            }
            this._i = this._j = 0;
          },
          _doProcessBlock: function(a, h) {
            a[h] ^= l.call(this);
          },
          keySize: 256 / 32,
          ivSize: 0
        });
        function l() {
          for (var a = this._S, h = this._i, e = this._j, o = 0, x = 0; x < 4; x++) {
            h = (h + 1) % 256, e = (e + a[h]) % 256;
            var f = a[h];
            a[h] = a[e], a[e] = f, o |= a[(a[h] + a[e]) % 256] << 24 - x * 8;
          }
          return this._i = h, this._j = e, o;
        }
        t.RC4 = _._createHelper(d);
        var r = H.RC4Drop = d.extend({
          /**
           * Configuration options.
           *
           * @property {number} drop The number of keystream words to drop. Default 192
           */
          cfg: d.cfg.extend({
            drop: 192
          }),
          _doReset: function() {
            d._doReset.call(this);
            for (var a = this.cfg.drop; a > 0; a--)
              l.call(this);
          }
        });
        t.RC4Drop = _._createHelper(r);
      }(), s.RC4;
    });
  }(er)), er.exports;
}
var tr = { exports: {} }, re;
function it() {
  return re || (re = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), o0(), i0(), t0(), j());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.StreamCipher, H = t.algo, d = [], l = [], r = [], a = H.Rabbit = _.extend({
          _doReset: function() {
            for (var e = this._key.words, o = this.cfg.iv, x = 0; x < 4; x++)
              e[x] = (e[x] << 8 | e[x] >>> 24) & 16711935 | (e[x] << 24 | e[x] >>> 8) & 4278255360;
            var f = this._X = [
              e[0],
              e[3] << 16 | e[2] >>> 16,
              e[1],
              e[0] << 16 | e[3] >>> 16,
              e[2],
              e[1] << 16 | e[0] >>> 16,
              e[3],
              e[2] << 16 | e[1] >>> 16
            ], v = this._C = [
              e[2] << 16 | e[2] >>> 16,
              e[0] & 4294901760 | e[1] & 65535,
              e[3] << 16 | e[3] >>> 16,
              e[1] & 4294901760 | e[2] & 65535,
              e[0] << 16 | e[0] >>> 16,
              e[2] & 4294901760 | e[3] & 65535,
              e[1] << 16 | e[1] >>> 16,
              e[3] & 4294901760 | e[0] & 65535
            ];
            this._b = 0;
            for (var x = 0; x < 4; x++)
              h.call(this);
            for (var x = 0; x < 8; x++)
              v[x] ^= f[x + 4 & 7];
            if (o) {
              var g = o.words, n = g[0], i = g[1], c = (n << 8 | n >>> 24) & 16711935 | (n << 24 | n >>> 8) & 4278255360, B = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, C = c >>> 16 | B & 4294901760, k = B << 16 | c & 65535;
              v[0] ^= c, v[1] ^= C, v[2] ^= B, v[3] ^= k, v[4] ^= c, v[5] ^= C, v[6] ^= B, v[7] ^= k;
              for (var x = 0; x < 4; x++)
                h.call(this);
            }
          },
          _doProcessBlock: function(e, o) {
            var x = this._X;
            h.call(this), d[0] = x[0] ^ x[5] >>> 16 ^ x[3] << 16, d[1] = x[2] ^ x[7] >>> 16 ^ x[5] << 16, d[2] = x[4] ^ x[1] >>> 16 ^ x[7] << 16, d[3] = x[6] ^ x[3] >>> 16 ^ x[1] << 16;
            for (var f = 0; f < 4; f++)
              d[f] = (d[f] << 8 | d[f] >>> 24) & 16711935 | (d[f] << 24 | d[f] >>> 8) & 4278255360, e[o + f] ^= d[f];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function h() {
          for (var e = this._X, o = this._C, x = 0; x < 8; x++)
            l[x] = o[x];
          o[0] = o[0] + 1295307597 + this._b | 0, o[1] = o[1] + 3545052371 + (o[0] >>> 0 < l[0] >>> 0 ? 1 : 0) | 0, o[2] = o[2] + 886263092 + (o[1] >>> 0 < l[1] >>> 0 ? 1 : 0) | 0, o[3] = o[3] + 1295307597 + (o[2] >>> 0 < l[2] >>> 0 ? 1 : 0) | 0, o[4] = o[4] + 3545052371 + (o[3] >>> 0 < l[3] >>> 0 ? 1 : 0) | 0, o[5] = o[5] + 886263092 + (o[4] >>> 0 < l[4] >>> 0 ? 1 : 0) | 0, o[6] = o[6] + 1295307597 + (o[5] >>> 0 < l[5] >>> 0 ? 1 : 0) | 0, o[7] = o[7] + 3545052371 + (o[6] >>> 0 < l[6] >>> 0 ? 1 : 0) | 0, this._b = o[7] >>> 0 < l[7] >>> 0 ? 1 : 0;
          for (var x = 0; x < 8; x++) {
            var f = e[x] + o[x], v = f & 65535, g = f >>> 16, n = ((v * v >>> 17) + v * g >>> 15) + g * g, i = ((f & 4294901760) * f | 0) + ((f & 65535) * f | 0);
            r[x] = n ^ i;
          }
          e[0] = r[0] + (r[7] << 16 | r[7] >>> 16) + (r[6] << 16 | r[6] >>> 16) | 0, e[1] = r[1] + (r[0] << 8 | r[0] >>> 24) + r[7] | 0, e[2] = r[2] + (r[1] << 16 | r[1] >>> 16) + (r[0] << 16 | r[0] >>> 16) | 0, e[3] = r[3] + (r[2] << 8 | r[2] >>> 24) + r[1] | 0, e[4] = r[4] + (r[3] << 16 | r[3] >>> 16) + (r[2] << 16 | r[2] >>> 16) | 0, e[5] = r[5] + (r[4] << 8 | r[4] >>> 24) + r[3] | 0, e[6] = r[6] + (r[5] << 16 | r[5] >>> 16) + (r[4] << 16 | r[4] >>> 16) | 0, e[7] = r[7] + (r[6] << 8 | r[6] >>> 24) + r[5] | 0;
        }
        t.Rabbit = _._createHelper(a);
      }(), s.Rabbit;
    });
  }(tr)), tr.exports;
}
var ar = { exports: {} }, ee;
function ft() {
  return ee || (ee = 1, function(b, D) {
    (function(s, t, p) {
      b.exports = t(U(), o0(), i0(), t0(), j());
    })(T, function(s) {
      return function() {
        var t = s, p = t.lib, _ = p.StreamCipher, H = t.algo, d = [], l = [], r = [], a = H.RabbitLegacy = _.extend({
          _doReset: function() {
            var e = this._key.words, o = this.cfg.iv, x = this._X = [
              e[0],
              e[3] << 16 | e[2] >>> 16,
              e[1],
              e[0] << 16 | e[3] >>> 16,
              e[2],
              e[1] << 16 | e[0] >>> 16,
              e[3],
              e[2] << 16 | e[1] >>> 16
            ], f = this._C = [
              e[2] << 16 | e[2] >>> 16,
              e[0] & 4294901760 | e[1] & 65535,
              e[3] << 16 | e[3] >>> 16,
              e[1] & 4294901760 | e[2] & 65535,
              e[0] << 16 | e[0] >>> 16,
              e[2] & 4294901760 | e[3] & 65535,
              e[1] << 16 | e[1] >>> 16,
              e[3] & 4294901760 | e[0] & 65535
            ];
            this._b = 0;
            for (var v = 0; v < 4; v++)
              h.call(this);
            for (var v = 0; v < 8; v++)
              f[v] ^= x[v + 4 & 7];
            if (o) {
              var g = o.words, n = g[0], i = g[1], c = (n << 8 | n >>> 24) & 16711935 | (n << 24 | n >>> 8) & 4278255360, B = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, C = c >>> 16 | B & 4294901760, k = B << 16 | c & 65535;
              f[0] ^= c, f[1] ^= C, f[2] ^= B, f[3] ^= k, f[4] ^= c, f[5] ^= C, f[6] ^= B, f[7] ^= k;
              for (var v = 0; v < 4; v++)
                h.call(this);
            }
          },
          _doProcessBlock: function(e, o) {
            var x = this._X;
            h.call(this), d[0] = x[0] ^ x[5] >>> 16 ^ x[3] << 16, d[1] = x[2] ^ x[7] >>> 16 ^ x[5] << 16, d[2] = x[4] ^ x[1] >>> 16 ^ x[7] << 16, d[3] = x[6] ^ x[3] >>> 16 ^ x[1] << 16;
            for (var f = 0; f < 4; f++)
              d[f] = (d[f] << 8 | d[f] >>> 24) & 16711935 | (d[f] << 24 | d[f] >>> 8) & 4278255360, e[o + f] ^= d[f];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function h() {
          for (var e = this._X, o = this._C, x = 0; x < 8; x++)
            l[x] = o[x];
          o[0] = o[0] + 1295307597 + this._b | 0, o[1] = o[1] + 3545052371 + (o[0] >>> 0 < l[0] >>> 0 ? 1 : 0) | 0, o[2] = o[2] + 886263092 + (o[1] >>> 0 < l[1] >>> 0 ? 1 : 0) | 0, o[3] = o[3] + 1295307597 + (o[2] >>> 0 < l[2] >>> 0 ? 1 : 0) | 0, o[4] = o[4] + 3545052371 + (o[3] >>> 0 < l[3] >>> 0 ? 1 : 0) | 0, o[5] = o[5] + 886263092 + (o[4] >>> 0 < l[4] >>> 0 ? 1 : 0) | 0, o[6] = o[6] + 1295307597 + (o[5] >>> 0 < l[5] >>> 0 ? 1 : 0) | 0, o[7] = o[7] + 3545052371 + (o[6] >>> 0 < l[6] >>> 0 ? 1 : 0) | 0, this._b = o[7] >>> 0 < l[7] >>> 0 ? 1 : 0;
          for (var x = 0; x < 8; x++) {
            var f = e[x] + o[x], v = f & 65535, g = f >>> 16, n = ((v * v >>> 17) + v * g >>> 15) + g * g, i = ((f & 4294901760) * f | 0) + ((f & 65535) * f | 0);
            r[x] = n ^ i;
          }
          e[0] = r[0] + (r[7] << 16 | r[7] >>> 16) + (r[6] << 16 | r[6] >>> 16) | 0, e[1] = r[1] + (r[0] << 8 | r[0] >>> 24) + r[7] | 0, e[2] = r[2] + (r[1] << 16 | r[1] >>> 16) + (r[0] << 16 | r[0] >>> 16) | 0, e[3] = r[3] + (r[2] << 8 | r[2] >>> 24) + r[1] | 0, e[4] = r[4] + (r[3] << 16 | r[3] >>> 16) + (r[2] << 16 | r[2] >>> 16) | 0, e[5] = r[5] + (r[4] << 8 | r[4] >>> 24) + r[3] | 0, e[6] = r[6] + (r[5] << 16 | r[5] >>> 16) + (r[4] << 16 | r[4] >>> 16) | 0, e[7] = r[7] + (r[6] << 8 | r[6] >>> 24) + r[5] | 0;
        }
        t.RabbitLegacy = _._createHelper(a);
      }(), s.RabbitLegacy;
    });
  }(ar)), ar.exports;
}
(function(b, D) {
  (function(s, t, p) {
    b.exports = t(U(), y0(), Ue(), Oe(), o0(), Ne(), i0(), xr(), oe(), Ie(), ie(), Xe(), Ke(), Ge(), or(), je(), t0(), j(), $e(), Me(), Ze(), Qe(), Ye(), Ve(), Je(), rt(), et(), tt(), at(), nt(), xt(), ot(), it(), ft());
  })(T, function(s) {
    return s;
  });
})(xe);
var st = xe.exports;
const te = /* @__PURE__ */ qe(st);
function ct(b, D, s, t) {
  if (D === "" || b === "")
    return "";
  const p = te.algo.HMAC.create(
    te.algo.SHA256,
    D
  ), _ = `${b}${s}${t}`;
  return p.update(_).finalize().toString();
}
async function ae(b, D, s, t) {
  const p = new De();
  await p.init();
  const _ = p.getTimestamp(), H = "mainnet", d = Br[H].access_key, l = Br[H].secret;
  let r = "";
  if (b.toUpperCase() === "GET") {
    const e = new URL(D), o = Object.keys(e.search.substring(1)).sort();
    r = k0(o.map((x) => `${x}=${o[x]}`).join("&"));
  } else
    try {
      r = k0(s ? JSON.stringify(s) : "");
    } catch {
      r = k0((s == null ? void 0 : s.toString()) ?? "");
    }
  const a = ct(
    d,
    l,
    r,
    _
  ), h = {
    method: b,
    headers: {
      "Content-Type": "application/json",
      // 添加网关所需请求头
      "X-B-Timestamp": _,
      "X-B-Signature": a,
      "X-B-AccessKeyId": d,
      platform: "android",
      // TODO: 后面修改网关，增加 plugin @rookie
      // platform: 'plugin',
      // TODO: 增加设备Id
      "device-id": "device-id",
      // 固定写这个
      app_name: "bitverse_app",
      version: "1.0.0",
      ...t
    },
    body: JSON.stringify(s)
  };
  return fetch(D, h).then((e) => {
    if (e.ok)
      return e.json();
    throw new Error("Network response was not ok.");
  }).catch((e) => {
    console.error("There was a problem with the network request.", e);
  });
}
const ut = {
  get: (b) => ae("GET", b),
  post: (b, D, s) => ae("POST", b, D, s)
  // put: (url, data) => request('PUT', url, data),
  // delete: (url, data) => request('DELETE', url, data)
};
export {
  ut as default
};
