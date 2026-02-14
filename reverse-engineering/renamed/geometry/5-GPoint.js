/**
 * Variable Renames Applied:
 * i -> Class
 */

/**
 * Module 5 - GPoint
 * Extracted from chunk.vendor.js
 * 
 * Original: Gravit Designer by Corel
 * Reverse engineered for educational purposes
 */

function (e, t) {
      function Class(e, t) {
        (this._x = e), (this._y = t);
      }
      (Class.equals = function (e, t, Class) {
        return (
          (Class = Class || 1e-14),
          !(!e || e != t) ||
            (!(!e || !t) &&
              Math.abs(e._x - t._x) < Class &&
              Math.abs(e._y - t._y) < Class)
        );
      }),
        (Class.min = function () {
          for (var e = new Class(null, null), t = 0; t < arguments.length; ++t)
            (null == e._x || arguments[t]._x < e._x) &&
              (e._x = arguments[t]._x),
              (null == e._y || arguments[t]._y < e._y) &&
                (e._y = arguments[t]._y);
          return e;
        }),
        (Class.max = function () {
          for (var e = new Class(null, null), t = 0; t < arguments.length; ++t)
            (null == e._x || arguments[t]._x > e._x) &&
              (e._x = arguments[t]._x),
              (null == e._y || arguments[t]._y > e._y) &&
                (e._y = arguments[t]._y);
          return e;
        }),
        (Class.prototype._x = 0),
        (Class.prototype._y = 0),
        (Class.prototype.getX = function () {
          return this._x;
        }),
        (Class.prototype.getY = function () {
          return this._y;
        }),
        (Class.prototype.scale = function (e) {
          return new Class(this._x * e, this._y * e);
        }),
        (Class.prototype.multiply = function (e) {
          return new Class(this._x * e._x, this._y * e._y);
        }),
        (Class.prototype.subtract = function (e) {
          return new Class(this._x - e._x, this._y - e._y);
        }),
        (Class.prototype.cross = function (e) {
          return this._x * e._y - this._y * e._x;
        }),
        (Class.prototype.dot = function (e) {
          return this._x * e._x + this._y * e._y;
        }),
        (Class.prototype.add = function (e) {
          return new Class(this._x + e._x, this._y + e._y);
        }),
        (Class.prototype.translated = function (e, t) {
          return new Class(this._x + e, this._y + t);
        }),
        (Class.prototype.rotated = function (e) {
          var t = Math.cos(e),
            n = Math.sin(e);
          return new Class(t * this._x - n * this._y, n * this._x + t * this._y);
        }),
        (Class.prototype.rotatedAt = function (e, t) {
          if (!t) return this.rotated(e);
          var n = Math.cos(e),
            r = Math.sin(e);
          return new Class(
            n * (this._x - t._x) - r * (this._y - t._y) + t._x,
            r * (this._x - t._x) + n * (this._y - t._y) + t._y
          );
        }),
        (Class.prototype.lerp = function (e, t) {
          return new Class(
            this._x + (e._x - this._x) * t,
            this._y + (e._y - this._y) * t
          );
        }),
        (Class.prototype.isFinite = function () {
          return (
            "number" == typeof this._x &&
            isFinite(this._x) &&
            "number" == typeof this._y &&
            isFinite(this._y)
          );
        }),
        (Class.prototype.toString = function () {
          return "[Object GPoint(x=" + this._x + ", y=" + this._y + "]";
        }),
        (e.exports = Class);
    }