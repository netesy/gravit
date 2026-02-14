/**
 * Variable Renames Applied:
 * e -> module, r -> arr, i -> Class1
 */

/**
 * Module 0 - GObject
 * Extracted from chunk.vendor.js
 * 
 * Original: Gravit Designer by Corel
 * Reverse engineered for educational purposes
 */

function (module, t) {
      function Class1() {}
      (Class1.getTypeId = function (module) {
        return "number" == typeof module
          ? module
          : "function" == typeof module && module.prototype.hasOwnProperty("__gtype_id__")
          ? module.prototype.__gtype_id__
          : module && "number" == typeof module.__gtype_id__
          ? module.__gtype_id__
          : null;
      }),
        (Class1.getName = function (module) {
          if (module) {
            if (
              ("object" == typeof module && (module = module.constructor),
              module && "function" == typeof module)
            ) {
              var t = /function (.{1,})\(/.exec(module.toString());
              return t && t.length > 1 ? t[1].trim() : "anonymous";
            }
            return module.toString();
          }
          return "<null>";
        }),
        (Class1.inherit = function (module, t) {
          if (
            ((module.prototype = Object.create(t.prototype)),
            (module.prototype.__gtype_id__ = Class1._internalTypeIdCounter++),
            (module.prototype.constructor = module),
            delete module.prototype.__gmixins__,
            t.prototype.__gmixins__)
          )
            for (var n in ((module.prototype.__gmixins__ = {}),
            t.prototype.__gmixins__))
              module.prototype.__gmixins__[n] = !0;
          if (t != Class1)
            for (var arr in t)
              arr &&
                arr.length > 0 &&
                "constructor" !== arr &&
                "__gmixins__" != arr &&
                "toString" != arr &&
                "_" != arr.charAt(0) &&
                !module[arr] &&
                (module[arr] = t[arr]);
        }),
        (Class1.mix = function (module, t) {
          Class1.inheritAndMix(module, null, t);
        }),
        (Class1.inheritAndMix = function (module, t, n, arr) {
          if ((t && this.inherit(module, t), n)) {
            module.prototype.__gmixins__ || (module.prototype.__gmixins__ = {});
            for (var o = 0; o < n.length; ++o) {
              var a = n[o].prototype;
              for (var s in a)
                if (
                  s &&
                  "constructor" !== s &&
                  "toString" != s &&
                  "__gmixins__" != s &&
                  "__gtype_id__" != s &&
                  "hasMixin" != s
                )
                  if (s in module.prototype) {
                    if (!arr)
                      throw new Error(
                        "Mixin " +
                          a +
                          " may not override " +
                          s +
                          " in " +
                          module.prototype
                      );
                    module.prototype[s] = a[s];
                  } else module.prototype[s] = a[s];
              if (
                (a.__gtype_id__ ||
                  (a.__gtype_id__ = Class1._internalTypeIdCounter++),
                (module.prototype.__gmixins__[a.__gtype_id__] = !0),
                a.__gmixins__)
              )
                for (var l in a.__gmixins__) module.prototype.__gmixins__[l] = !0;
              for (
                var h = Object.getPrototypeOf(a);
                null != h && h !== Object.prototype;
                h = Object.getPrototypeOf(h)
              )
                h.__gtype_id__ || (h.__gtype_id__ = Class1._internalTypeIdCounter++),
                  (module.prototype.__gmixins__[h.__gtype_id__] = !0);
            }
          }
        }),
        (Class1._internalTypeIdCounter = 0),
        (Class1.prototype.__gtype_id__ = -1),
        (Class1.prototype.__gmixins__ = null),
        (Class1.prototype.hasMixin = function (module) {
          return !(
            !this.__gmixins__ || !this.__gmixins__[module.prototype.__gtype_id__]
          );
        }),
        (Class1.prototype.toString = function () {
          var module = this.constructor.toString().match(/^function ([^\(]*)/);
          return "[Object " + (module ? module[1] : "object") + "]";
        }),
        (module.exports = Class1);
    }