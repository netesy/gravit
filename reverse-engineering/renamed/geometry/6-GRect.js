/**
 * Variable Renames Applied:
 * o -> Class, l -> arr, h -> arr1, r -> point
 */

/**
 * Module 6 - GRect
 * Extracted from chunk.vendor.js
 * 
 * Original: Gravit Designer by Corel
 * Reverse engineered for educational purposes
 */

function (e, t, i) {
      var n = i(5),
        point = i(12);

      function Class(e, t, i, n) {
        (this._x = e || 0),
          (this._y = t || 0),
          (this._width = i || 0),
          (this._height = n || 0);
      }
      (Class.Side = {
        TOP_LEFT: "tl",
        TOP_CENTER: "tc",
        TOP_RIGHT: "tr",
        RIGHT_CENTER: "rc",
        BOTTOM_RIGHT: "br",
        BOTTOM_CENTER: "bc",
        BOTTOM_LEFT: "bl",
        LEFT_CENTER: "lc",
        CENTER: "cc",
      }),
        (Class.UNIT_RECT = new Class(0, 0, 1, 1)),
        (Class.fromPoints = function () {
          var e = n.min.apply(null, arguments),
            t = n.max.apply(null, arguments);
          return new Class(
            e.getX(),
            e.getY(),
            t.getX() - e.getX(),
            t.getY() - e.getY()
          );
        }),
        (Class.equals = function (e, t) {
          return (
            (!e && e === t) ||
            (!(!e || !t) &&
              point.isEqualEps(e._x, t._x) &&
              point.isEqualEps(e._y, t._y) &&
              point.isEqualEps(e._width, t._width) &&
              point.isEqualEps(e._height, t._height))
          );
        }),
        (Class.serialize = function (e) {
          return [e._x, e._y, e._width, e._height];
        }),
        (Class.deserialize = function (e) {
          return e && e.length >= 4 ? new Class(e[0], e[1], e[2], e[3]) : new Class();
        }),
        (Class.prototype._x = 0),
        (Class.prototype._y = 0),
        (Class.prototype._width = 0),
        (Class.prototype._height = 0),
        (Class.prototype.getX = function () {
          return this._x;
        }),
        (Class.prototype.getY = function () {
          return this._y;
        }),
        (Class.prototype.getWidth = function () {
          return this._width;
        }),
        (Class.prototype.getHeight = function () {
          return this._height;
        }),
        (Class.prototype.getX2 = function () {
          return this._x + this._width;
        }),
        (Class.prototype.getY2 = function () {
          return this._y + this._height;
        }),
        (Class.prototype.isEmpty = function () {
          return this._width <= 0 || this._height <= 0;
        }),
        (Class.prototype.containsPoint = function (e, t) {
          return this.containsPointXY(e.getX(), e.getY(), t);
        }),
        (Class.prototype.containsPointXY = function (e, t, i) {
          var n = this._x,
            point = this._x;
          if (
            (this._width < 0 ? (n += this._width) : (point += this._width),
            !i && n == point)
          )
            return !1;
          if (e < n || e > point) return !1;
          var Class = this._y,
            a = this._y;
          return (
            this._height < 0 ? (Class += this._height) : (a += this._height),
            !(!i && Class == a) && !(t < Class || t > a)
          );
        }),
        (Class.prototype.containsRect = function (e, t) {
          var i = this._x,
            n = this._x;
          if (
            (this._width < 0 ? (i += this._width) : (n += this._width),
            !t && i == n)
          )
            return !1;
          var point = e._x,
            Class = e._x;
          if ((e._width < 0 ? (point += e._width) : (Class += e._width), !t && point == Class))
            return !1;
          if (point < i || Class > n) return !1;
          var a = this._y,
            s = this._y;
          if (
            (this._height < 0 ? (a += this._height) : (s += this._height),
            !t && a == s)
          )
            return !1;
          var arr = e._y,
            arr1 = e._y;
          return (
            e._height < 0 ? (arr += e._height) : (arr1 += e._height),
            !(!t && arr == arr1) && !(arr < a || arr1 > s)
          );
        }),
        (Class.prototype.intersectsRect = function (e, t) {
          return this.intersectsRectXYWH(e._x, e._y, e._width, e._height, t);
        }),
        (Class.prototype.intersectsRectXYWH = function (e, t, i, n, point) {
          var Class = this._x,
            a = this._x;
          if (
            (this._width < 0 ? (Class += this._width) : (a += this._width),
            !point && Class == a)
          )
            return !1;
          var s = e,
            arr = e;
          if ((i < 0 ? (s += i) : (arr += i), !point && s == arr)) return !1;
          if (Class > arr || s > a || (!point && (Class == arr || s == a))) return !1;
          var arr1 = this._y,
            A = this._y;
          if (
            (this._height < 0 ? (arr1 += this._height) : (A += this._height),
            !point && arr1 == A)
          )
            return !1;
          var c = t,
            p = t;
          return (
            n < 0 ? (c += n) : (p += n),
            !(!point && c == p) && !(arr1 > p || c > A || !(point || (arr1 != p && c != A)))
          );
        }),
        (Class.prototype.expanded = function (e, t, i, n) {
          return new Class(
            this._x - e,
            this._y - t,
            this._width + e + i,
            this._height + t + n
          );
        }),
        (Class.prototype.translated = function (e, t) {
          return new Class(this._x + e, this._y + t, this._width, this._height);
        }),
        (Class.prototype.scaled = function (e, t) {
          return new Class(
            this._x * e,
            this._y * t,
            this._width * e,
            this._height * t
          );
        }),
        (Class.prototype.scaledAt = function (e, t, i) {
          return i
            ? new Class(
                (this._x - i.getX()) * e + i.getX(),
                (this._y - i.getY()) * t + i.getY(),
                this._width * e,
                this._height * t
              )
            : this.scaled(e, t);
        }),
        (Class.prototype.united = function (e, t) {
          var i = this._x,
            n = this._x;
          if (
            (this._width < 0 ? (i += this._width) : (n += this._width),
            t && i == n)
          )
            return e;
          var point = e._x,
            a = e._x;
          if ((e._width < 0 ? (point += e._width) : (a += e._width), t && point == a))
            return this;
          var s = this._y,
            arr = this._y;
          if (
            (this._height < 0 ? (s += this._height) : (arr += this._height),
            t && s == arr)
          )
            return e;
          var arr1 = e._y,
            A = e._y;
          if (
            (e._height < 0 ? (arr1 += e._height) : (A += e._height), t && arr1 == A)
          )
            return this;
          var c = new Class();
          return (
            (c._x = Math.min(i, point)),
            (c._y = Math.min(s, arr1)),
            (c._width = Math.max(n, a) - c._x),
            (c._height = Math.max(arr, A) - c._y),
            c
          );
        }),
        (Class.prototype.subtracted = function (e, t) {
          var i = this._x,
            n = this._x;
          if (
            (this._width < 0 ? (i += this._width) : (n += this._width), i == n)
          )
            return new Class(0, 0, 0, 0);
          var point = e._x,
            a = e._x;
          if ((e._width < 0 ? (point += e._width) : (a += e._width), point == a))
            return new Class(this._x, this._y, this._width, this._height);
          if (i >= a || point >= n)
            return new Class(this._x, this._y, this._width, this._height);
          var s = this._y,
            arr = this._y;
          if (
            (this._height < 0 ? (s += this._height) : (arr += this._height),
            s == arr)
          )
            return new Class(0, 0, 0, 0);
          var arr1 = e._y,
            A = e._y;
          return (
            e._height < 0 ? (arr1 += e._height) : (A += e._height),
            arr1 == A ||
            s >= A ||
            arr1 >= arr ||
            (s >= arr1 && arr <= A && i < point && n > a) ||
            (i >= point && n <= a && s < arr1 && arr > A)
              ? new Class(this._x, this._y, this._width, this._height)
              : s >= arr1
              ? arr <= A
                ? i >= point
                  ? n <= a
                    ? new Class(i, s, 0, 0)
                    : new Class(a, s, n - a, arr - s)
                  : n <= a
                  ? new Class(i, s, point - i, arr - s)
                  : t
                  ? [
                      new Class(i, s, point - i, this._height),
                      new Class(i, s, n - a, this._height),
                    ]
                  : new Class(i, s, this._width, this._height)
                : i >= point
                ? n <= a
                  ? new Class(i, A, this._width, arr - A)
                  : t
                  ? [
                      new Class(i, A, a - i, arr - A),
                      new Class(a, s, n - a, this._height),
                    ]
                  : new Class(i, s, this._width, this._height)
                : n <= a
                ? t
                  ? [
                      new Class(i, s, point - i, this._height),
                      new Class(point, A, n - point, arr - A),
                    ]
                  : new Class(i, s, this._width, this._height)
                : t
                ? [
                    new Class(i, s, point - i, this._height),
                    new Class(point, A, a - point, arr - A),
                    new Class(a, s, n - a, this._height),
                  ]
                : new Class(i, s, this._width, this._height)
              : arr <= A
              ? i >= point
                ? n <= a
                  ? new Class(i, s, n - i, arr1 - s)
                  : t
                  ? [
                      new Class(i, s, a - i, arr1 - s),
                      new Class(a, s, n - a, this._height),
                    ]
                  : new Class(i, s, this._width, this._height)
                : n <= a
                ? t
                  ? [
                      new Class(i, s, point - i, this._height),
                      new Class(point, s, n - point, arr1 - s),
                    ]
                  : new Class(i, s, this._width, this._height)
                : t
                ? [
                    new Class(i, s, point - i, this._height),
                    new Class(point, s, a - point, arr1 - s),
                    new Class(a, s, n - a, this._height),
                  ]
                : new Class(i, s, this._width, this._height)
              : t
              ? i >= point
                ? n <= a
                  ? [new Class(i, s, n - i, arr1 - s), new Class(i, A, n - i, arr - A)]
                  : [
                      new Class(i, s, this._width, arr1 - s),
                      new Class(a, arr1, n - a, A - arr1),
                      new Class(i, A, this._width, arr - A),
                    ]
                : n <= a
                ? [
                    new Class(i, s, this._width, arr1 - s),
                    new Class(i, arr1, point - i, A - arr1),
                    new Class(i, A, this._width, arr - A),
                  ]
                : [
                    new Class(i, s, this._width, arr1 - s),
                    new Class(i, arr1, point - i, A - arr1),
                    new Class(a, arr1, n - a, A - arr1),
                    new Class(i, A, this._width, arr - A),
                  ]
              : new Class(this._x, this._y, this._width, this._height)
          );
        }),
        (Class.prototype.intersected = function (e) {
          var t = this._x,
            i = this._x;
          if (
            (this._width < 0 ? (t += this._width) : (i += this._width), t == i)
          )
            return new Class(0, 0, 0, 0);
          var n = e._x,
            point = e._x;
          if ((e._width < 0 ? (n += e._width) : (point += e._width), n == point))
            return new Class(0, 0, 0, 0);
          if (t >= point || n >= i) return new Class(0, 0, 0, 0);
          var a = this._y,
            s = this._y;
          if (
            (this._height < 0 ? (a += this._height) : (s += this._height),
            a == s)
          )
            return new Class(0, 0, 0, 0);
          var arr = e._y,
            arr1 = e._y;
          if ((e._height < 0 ? (arr += e._height) : (arr1 += e._height), arr == arr1))
            return new Class(0, 0, 0, 0);
          if (a >= arr1 || arr >= s) return new Class(0, 0, 0, 0);
          var A = new Class();
          return (
            (A._x = Math.max(t, n)),
            (A._y = Math.max(a, arr)),
            (A._width = Math.min(i, point) - A._x),
            (A._height = Math.min(s, arr1) - A._y),
            A
          );
        }),
        (Class.prototype.toAlignedRect = function () {
          var e = Math.floor(this._x),
            t = Math.ceil(this._x + this._width),
            i = Math.floor(this._y);
          return new Class(e, i, t - e, Math.ceil(this._y + this._height) - i);
        }),
        (Class.prototype.toAlignedWithGrid = function (e) {
          var t = e * Math.floor(this._x / e),
            i = e * Math.floor(this._y / e);
          return new Class(
            t,
            i,
            e * Math.ceil((this._x + this._width) / e) - t,
            e * Math.ceil((this._y + this._height) / e) - i
          );
        }),
        (Class.prototype.toRoundedPrecision = function (e) {
          return (
            (e = e || 8),
            new Class(
              Number(this._x.toFixed(e)),
              Number(this._y.toFixed(e)),
              Number(this._width.toFixed(e)),
              Number(this._height.toFixed(e))
            )
          );
        }),
        (Class.prototype.getSide = function (e) {
          switch (e) {
            case Class.Side.TOP_LEFT:
              return new n(this._x, this._y);
            case Class.Side.TOP_CENTER:
              return new n(this._x + this._width / 2, this._y);
            case Class.Side.TOP_RIGHT:
              return new n(this._x + this._width, this._y);
            case Class.Side.RIGHT_CENTER:
              return new n(this._x + this._width, this._y + this._height / 2);
            case Class.Side.BOTTOM_RIGHT:
              return new n(this._x + this._width, this._y + this._height);
            case Class.Side.BOTTOM_CENTER:
              return new n(this._x + this._width / 2, this._y + this._height);
            case Class.Side.BOTTOM_LEFT:
              return new n(this._x, this._y + this._height);
            case Class.Side.LEFT_CENTER:
              return new n(this._x, this._y + this._height / 2);
            case Class.Side.CENTER:
              return new n(
                this._x + this._width / 2,
                this._y + this._height / 2
              );
            default:
              throw new Error("Illegal Argument: " + e);
          }
        }),
        (Class.prototype.getClosestSideName = function (e) {
          var t = [
              Class.Side.TOP_LEFT,
              Class.Side.TOP_CENTER,
              Class.Side.TOP_RIGHT,
              Class.Side.LEFT_CENTER,
              Class.Side.CENTER,
              Class.Side.RIGHT_CENTER,
              Class.Side.BOTTOM_LEFT,
              Class.Side.BOTTOM_CENTER,
              Class.Side.BOTTOM_RIGHT,
            ],
            i = 1,
            n = 1;
          return (
            e.getX() <= this._x + this._width / 3
              ? (i = 0)
              : e.getX() >= this._x + (2 * this._width) / 3 && (i = 2),
            e.getY() <= this._y + this._height / 3
              ? (n = 0)
              : e.getY() >= this._y + (2 * this._height) / 3 && (n = 2),
            t[3 * n + i]
          );
        }),
        (Class.prototype.getXYOffset = function (e, t, i, n) {
          var point = {
            x: null,
            y: null,
          };
          if (t) {
            for (
              var Class,
                a = null,
                s = null,
                arr = [this._x, this._x + this._width],
                arr1 = [e._x, e._x + e._width],
                A = 0;
              A < arr.length;
              ++A
            )
              for (var c = 0; c < arr1.length; ++c)
                (Class = arr1[c] - arr[A]),
                  (null === a || Class < a) && (a = Class),
                  (null === s || Class > s) && (s = Class);
            a >= 0 && s >= 0
              ? (point.x = Math.min(a, s))
              : a <= 0 && s <= 0 && (point.x = Math.max(a, s)),
              n &&
                !point.x &&
                ((point.leftDist = arr1[0] - arr[0]), (point.rightDist = arr1[1] - arr[1]));
          }
          if (i) {
            var p = null,
              u = null;
            for (
              arr = [this._y, this._y + this._height],
                arr1 = [e._y, e._y + e._height],
                A = 0;
              A < arr.length;
              ++A
            )
              for (c = 0; c < arr1.length; ++c)
                (Class = arr1[c] - arr[A]),
                  (null === p || Class < p) && (p = Class),
                  (null === u || Class > u) && (u = Class);
            p >= 0 && u >= 0
              ? (point.y = Math.min(p, u))
              : p <= 0 && u <= 0 && (point.y = Math.max(p, u)),
              n &&
                !point.y &&
                ((point.topDist = arr1[0] - arr[0]), (point.bottomDist = arr1[1] - arr[1]));
          }
          return point;
        }),
        (Class.prototype.toString = function () {
          return (
            "[Object GRect(x=" +
            this._x +
            ", y=" +
            this._y +
            ", width=" +
            this._width +
            ", height=" +
            this._height +
            ")]"
          );
        }),
        (e.exports = Class);
    }