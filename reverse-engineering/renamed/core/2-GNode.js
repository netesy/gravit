/**
 * Variable Renames Applied:
 * h -> Class, A -> arr, r -> arr1, a -> arr2, c -> arr3
 */

/**
 * Module 2 - GNode
 * Extracted from chunk.vendor.js
 * 
 * Original: Gravit Designer by Corel
 * Reverse engineered for educational purposes
 */

function (e, t, i) {
      var n = i(11),
        arr1 = i(75),
        o = i(72),
        arr2 = i(0),
        s = i(9),
        l = i(50);

      function Class() {}
      arr2.inherit(Class, arr2),
        (Class.MIME_TYPE = "application/gravit+node"),
        (Class.inherit = function (e, t, i) {
          arr2.inherit(t, i), Class._registerNodeClass(e, t);
        }),
        (Class.inheritAndMix = function (e, t, i, n, arr1) {
          arr2.inheritAndMix(t, i, n, arr1), Class._registerNodeClass(e, t);
        }),
        (Class.getName = function (e) {
          return Class._nodeClassToNameMap[arr2.getTypeId(e)];
        }),
        (Class.store = function (e, t) {
          if (
            ((t = t || {}),
            e.hasMixin(Class.Store) &&
              !(t.exceptions && t.exceptions.indexOf(e) >= 0))
          ) {
            var i = {
              "@": Class._nodeClassToNameMap[arr2.getTypeId(e)],
            };
            e.hasMixin(Class.Identity) && !t.copy && (i["@id"] = e.getId());
            var n = {
              blob: i,
              options: t,
            };
            if (
              (e._notifyChange(Class._Change.PrepareStore, n),
              e.hasMixin(Class.Container))
            )
              for (var arr1 = e.getFirstChild(); null !== arr1; arr1 = arr1.getNext())
                if (!t.passChildFilter || t.passChildFilter(arr1)) {
                  var o = Class.store(arr1, t);
                  o && (i.hasOwnProperty("$") ? i.$.push(o) : (i.$ = [o]));
                }
            if (e.hasMixin(Class.Properties))
              if (
                t.copy &&
                t.copyIgnoreProperties &&
                t.copyIgnoreProperties.length
              ) {
                var s = t.copyIgnoreProperties.slice();
                s.indexOf("@id") < 0 && s.push("@id"),
                  Object.keys(e).forEach(function (t) {
                    "@" === t.charAt(0) &&
                      t.length > 1 &&
                      s.indexOf(t) < 0 &&
                      e.hasOwnProperty(t) &&
                      (i[t] = e[t]);
                  });
              } else
                Object.keys(e).forEach(function (t) {
                  "@" === t.charAt(0) &&
                    t.length > 1 &&
                    "@id" !== t &&
                    e.hasOwnProperty(t) &&
                    (i[t] = e[t]);
                });
            return (
              e.hasMixin(Class.Reference) &&
                e._referenceId &&
                (i["#"] = e._referenceId),
              e.hasMixin(Class.Multireference) &&
                e._multiReferenceId &&
                (i["&"] = e._multiReferenceId),
              e._notifyChange(Class._Change.Store, n),
              i
            );
          }
          return null;
        }),
        (Class.restore = function (e, t, i, n, arr1) {
          var o = null;
          return (
            Class._restore(
              e,
              t,
              i,
              n,
              arr1,
              function (e, t, i, n, arr1, o) {
                o(Class.restoreInstance(e, t, i, n, arr1));
              },
              function (e) {
                o = e;
              }
            ),
            o
          );
        }),
        (Class._restore = function (e, t, i, n, arr1, o, arr2) {
          n &&
            arr1 &&
            arr1 > 0 &&
            (Class.prototype.restoreCount++,
            n((80 * Class.prototype.restoreCount) / arr1 + 20));
          if (!e || !e.hasOwnProperty("@")) return null;
          var s = Class._nameToNodeClassMap[e["@"]];
          if (!s) return null;
          var l = t ? new s(t) : new s();
          o(e, l, i, n, arr1, function () {
            i && i(l), arr2(l);
          });
        }),
        (Class.restoreInstance = function (e, t, i, n, arr1) {
          var o = null;
          return (
            Class._restoreInstance(
              e,
              t,
              i,
              n,
              arr1,
              function (e, t, i, n, arr1, o, arr2) {
                for (var s = 0; s < t.length; ++s) {
                  var l = Class.restore(t[s], i, n, arr1, o);
                  l && e.appendChild(l);
                }
                arr2();
              },
              function (e) {
                o = e;
              }
            ),
            o
          );
        }),
        (Class._restoreInstance = function (e, t, i, n, arr1, o, arr2) {
          var s = {
            blob: e,
          };
          t._notifyChange(Class._Change.PrepareRestore, s),
            t.hasMixin(Class.Identity) &&
              e.hasOwnProperty("@id") &&
              (t.__id = e["@id"]);
          var l = function () {
            if (t.hasMixin(Class.Properties))
              for (var i in e)
                "@" === i.charAt(0) &&
                  e.hasOwnProperty(i) &&
                  i.length > 1 &&
                  (t[i] = e[i]);
            t.hasMixin(Class.Reference) &&
              e.hasOwnProperty("#") &&
              (t._referenceId = e["#"]),
              t.hasMixin(Class.Multireference) &&
                e.hasOwnProperty("&") &&
                (t._multiReferenceId = e["&"]),
              t._notifyChange(Class._Change.Restore, s),
              arr2(t);
          };
          if (e.hasOwnProperty("$") && t.hasMixin(Class.Container)) {
            var arr = e.$;
            arr.length > 0
              ? (t._blockUpdateChanges(),
                o(t, arr, null, i, n, arr1, function () {
                  t._releaseUpdateChanges(), l();
                }))
              : l();
          } else l();
        }),
        (Class.serialize = function (e, t) {
          var i = (t && t.beautify) || !1,
            n = {
              save: (t && t.save) || !1,
              copy: (t && t.copy) || !1,
              copyIgnoreProperties: (t && t.copyIgnoreProperties) || null,
              singleton: (t && t.singleton) || !1,
              exceptions: (t && t.exceptions) || !1,
              lastModifiedDate: t ? t.lastModifiedDate : null,
            };
          if (e instanceof Array) {
            for (var arr1 = [], o = 0; o < e.length; ++o) {
              if (!(t && t.exceptions && t.exceptions.indexOf(e[o]) >= 0))
                (arr2 = Class.store(e[o], n)) && arr1.push(arr2);
            }
            if (arr1.length > 0) {
              try {
                s = JSON.stringify(arr1, null, i ? 4 : null);
              } catch (e) {
                s = "";
              }
              return s;
            }
          } else {
            var arr2, s;
            if (!(t && t.exceptions && t.exceptions.indexOf(e) >= 0))
              if ((arr2 = Class.store(e, n))) {
                try {
                  s = JSON.stringify(arr2, null, i ? 4 : null);
                } catch (e) {
                  s = "";
                }
                return s;
              }
          }
          return null;
        }),
        (Class.deserialize = function (e, t, i, n) {
          var arr1 = null;
          return (
            Class._deserialize(
              e,
              t,
              i,
              n,
              function (e, t, i, n, arr1, o) {
                if (e)
                  if (Array.isArray(e)) {
                    var arr2 = [];
                    e.forEach(function (e) {
                      var o = Class.restore(e, t, i, n, arr1);
                      o && arr2.push(o);
                    }),
                      o(arr2);
                  } else o(Class.restore(e, t, i, n, arr1));
              },
              function (e) {
                arr1 = e;
              }
            ),
            arr1
          );
        }),
        (Class._deserialize = function (e, t, i, n, arr1, o) {
          var arr2 = 0;
          if (e) {
            var s = null;
            try {
              s = JSON.parse(e);
            } catch (e) {
              console.warn("deserialize node: invalid JSON");
            }
            if (
              (i &&
                ((Class.prototype.restoreCount = 0),
                (arr2 = Class.countBlobChildren(s, arr2)),
                i(20)),
              s && s instanceof Array)
            )
              return void arr1(s, t, void 0, void 0, void 0, o);
            if (s) return void arr1(s, t, n, i, arr2, o);
          }
          o(null);
        }),
        (Class.countBlobChildren = function (e, t) {
          if ((t++, !e)) return console.warn("Null blob"), 0;
          if (e.hasOwnProperty("$")) {
            var i = e.$;
            if (i.length > 0)
              for (var n = 0; n < i.length; ++n)
                t = Class.countBlobChildren(i[n], t);
          }
          return t;
        }),
        (Class.order = function (e, t) {
          var i = e ? e.slice() : null;
          if (e && e.length > 1) {
            for (var n = null, arr1 = e[0]; null !== arr1; arr1 = arr1.getParent()) n = arr1;
            if (null !== n) {
              var o = [];
              return (
                n.accept(function (e) {
                  if (!i.length) return !1;
                  for (var t = 0, n = !1, arr1 = 0; arr1 < i.length && !n; ++arr1)
                    i[arr1] === e && (o.push(e), (t = arr1), (n = !0));
                  return n && i.splice(t, 1), !0;
                }, t),
                o
              );
            }
          }
          return i;
        }),
        (Class.getClassFromId = function (e) {
          var t = Class._nodeClassToNameMap[e];
          return (t && Class._nameToNodeClassMap[t]) || null;
        }),
        (Class._nodeClassToNameMap = {}),
        (Class._nameToNodeClassMap = {}),
        (Class._registerNodeClass = function (e, t) {
          (Class._nodeClassToNameMap[arr2.getTypeId(t)] = e),
            (Class._nameToNodeClassMap[e] = t);
        }),
        (Class.Flag = {
          Selected: 2,
          Highlighted: 4,
          Active: 8,
          Transient: 16,
          Expanded: 32,
        }),
        (Class._Change = {
          BeforeChildInsert: 1,
          AfterChildInsert: 2,
          BeforeChildRemove: 10,
          AfterChildRemove: 11,
          BeforePropertiesChange: 20,
          AfterPropertiesChange: 21,
          BeforeFlagChange: 30,
          AfterFlagChange: 31,
          ParentAttached: 40,
          ParentDetach: 41,
          PrepareStore: 50,
          Store: 51,
          PrepareRestore: 52,
          Restore: 53,
          WorkspaceAttached: 60,
          WorkspaceDetach: 61,
        }),
        (Class.BeforeInsertEvent = function (e) {
          this.node = e;
        }),
        arr2.inherit(Class.BeforeInsertEvent, o),
        (Class.BeforeInsertEvent.prototype.node = null),
        (Class.BeforeInsertEvent.prototype.toString = function () {
          return "[Event GNode.BeforeInsertEvent]";
        }),
        (Class.AfterInsertEvent = function (e) {
          (this.customObj = {}), (this.node = e);
        }),
        arr2.inherit(Class.AfterInsertEvent, o),
        (Class.AfterInsertEvent.prototype.node = null),
        (Class.AfterInsertEvent.prototype.customObj = null),
        (Class.AfterInsertEvent.prototype.toString = function () {
          return "[Event GNode.AfterInsertEvent]";
        }),
        (Class.BeforeRemoveEvent = function (e) {
          (this.node = e), (this.customObj = {});
        }),
        arr2.inherit(Class.BeforeRemoveEvent, o),
        (Class.BeforeRemoveEvent.prototype.node = null),
        (Class.BeforeRemoveEvent.prototype.customObj = null),
        (Class.BeforeRemoveEvent.prototype.toString = function () {
          return "[Event GNode.BeforeRemoveEvent]";
        }),
        (Class.AfterRemoveEvent = function (e) {
          this.node = e;
        }),
        arr2.inherit(Class.AfterRemoveEvent, o),
        (Class.AfterRemoveEvent.prototype.node = null),
        (Class.AfterRemoveEvent.prototype.toString = function () {
          return "[Event GNode.AfterRemoveEvent]";
        }),
        (Class.BeforePropertiesChangeEvent = function (e, t, i, n, arr1) {
          (this.node = e),
            (this.properties = t),
            (this.values = i),
            (this.custom = n),
            (this.temporary = !!arr1);
        }),
        arr2.inherit(Class.BeforePropertiesChangeEvent, o),
        (Class.BeforePropertiesChangeEvent.prototype.node = null),
        (Class.BeforePropertiesChangeEvent.prototype.properties = null),
        (Class.BeforePropertiesChangeEvent.prototype.values = null),
        (Class.BeforePropertiesChangeEvent.prototype.custom = null),
        (Class.BeforePropertiesChangeEvent.prototype.temporary = !1),
        (Class.BeforePropertiesChangeEvent.prototype.toString = function () {
          return "[Event GNode.BeforePropertiesChangeEvent]";
        }),
        (Class.AfterPropertiesChangeEvent = function (e, t, i, n, arr1) {
          (this.node = e),
            (this.properties = t),
            (this.values = i),
            (this.custom = n),
            (this.customObj = {}),
            (this.temporary = arr1);
        }),
        arr2.inherit(Class.AfterPropertiesChangeEvent, o),
        (Class.AfterPropertiesChangeEvent.prototype.node = null),
        (Class.AfterPropertiesChangeEvent.prototype.properties = null),
        (Class.AfterPropertiesChangeEvent.prototype.values = null),
        (Class.AfterPropertiesChangeEvent.prototype.custom = null),
        (Class.AfterPropertiesChangeEvent.prototype.temporary = !1),
        (Class.AfterPropertiesChangeEvent.prototype.customObj = null),
        (Class.AfterPropertiesChangeEvent.prototype.toString = function () {
          return "[Event GNode.AfterPropertiesChangeEvent]";
        }),
        (Class.BeforeFlagChangeEvent = function (e, t, i) {
          (this.node = e), (this.flag = t), (this.set = i);
        }),
        arr2.inherit(Class.BeforeFlagChangeEvent, o),
        (Class.BeforeFlagChangeEvent.prototype.node = null),
        (Class.BeforeFlagChangeEvent.prototype.flag = null),
        (Class.BeforeFlagChangeEvent.prototype.set = null),
        (Class.BeforeFlagChangeEvent.prototype.toString = function () {
          return "[Event GNode.BeforeFlagChangeEvent]";
        }),
        (Class.AfterFlagChangeEvent = function (e, t, i) {
          (this.node = e), (this.flag = t), (this.set = i);
        }),
        arr2.inherit(Class.AfterFlagChangeEvent, o),
        (Class.AfterFlagChangeEvent.prototype.node = null),
        (Class.AfterFlagChangeEvent.prototype.flag = null),
        (Class.AfterFlagChangeEvent.prototype.set = null),
        (Class.AfterFlagChangeEvent.prototype.toString = function () {
          return "[Event GNode.AfterFlagChangeEvent]";
        }),
        (Class.BeforeSpecialChangeEvent = function (e, t) {
          (this.node = e), (this.data = t || null);
        }),
        arr2.inherit(Class.BeforeSpecialChangeEvent, o),
        (Class.BeforeSpecialChangeEvent.prototype.node = null),
        (Class.BeforeSpecialChangeEvent.prototype.data = null),
        (Class.BeforeSpecialChangeEvent.prototype.toString = function () {
          return "[Event GNode.BeforeSpecialChangeEvent]";
        }),
        (Class.AfterSpecialChangeEvent = function (e, t) {
          (this.node = e), (this.data = t || null);
        }),
        arr2.inherit(Class.AfterSpecialChangeEvent, o),
        (Class.AfterSpecialChangeEvent.prototype.node = null),
        (Class.AfterSpecialChangeEvent.prototype.data = null),
        (Class.AfterSpecialChangeEvent.prototype.toString = function () {
          return "[Event GNode.AfterSpecialChangeEvent]";
        }),
        (Class.AfterRestoreEvent = function (e) {
          this.node = e;
        }),
        arr2.inherit(Class.AfterRestoreEvent, o),
        (Class.AfterRestoreEvent.prototype.node = null),
        (Class.AfterRestoreEvent.prototype.toString = function () {
          return "[Event GNode.AfterRestoreEvent]";
        }),
        (Class.Properties = function () {}),
        (Class.Properties.prototype.arePropertiesEqual = function (e, t, i) {
          for (var arr1 = 0; arr1 < t.length; ++arr1) {
            var o = t[arr1],
              arr2 = this.hasProperty(o, i),
              s = e.hasProperty(o, i);
            if (arr2) {
              if (!s) return !1;
              if (!n.equals(this.getProperty(o, i), e.getProperty(o, i), !0))
                return !1;
            } else if (s) return !1;
          }
          return !0;
        }),
        (Class.Properties.prototype.hasProperty = function (e, t) {
          var i = (t ? "@" : "$") + e;
          return this.hasOwnProperty(i);
        }),
        (Class.Properties.prototype.getProperty = function (e, t, i, n) {
          var arr1 = (t ? "@" : "$") + e,
            o = "#" + arr1;
          return !n && this.hasOwnProperty(o)
            ? this[o]
            : this.hasOwnProperty(arr1)
            ? this[arr1]
            : i;
        }),
        (Class.Properties.prototype.getProperties = function (e, t, i, n) {
          for (var arr1 = [], o = 0; o < e.length; ++o) {
            var arr2 = i && i.length > o ? i[o] : null;
            arr1.push(this.getProperty(e[o], t, arr2, n));
          }
          return arr1;
        }),
        (Class.Properties.prototype.resetTemporaryProperty = function (e, t) {
          return this.resetTemporaryProperties([e], t);
        }),
        (Class.Properties.prototype.resetTemporaryProperties = function (e, t) {
          for (var i = [], arr1 = [], o = 0; o < e.length; ++o) {
            var arr2 = "#" + (arr3 = (t ? "@" : "$") + e[o]);
            if (this.hasOwnProperty(arr2)) {
              var s = this[arr3],
                l = this[arr2];
              n.equals(s, l, !1) || (i.push(e[o]), arr1.push(l));
            }
          }
          if (0 === i.length) return !1;
          this._notifyChange(Class._Change.BeforePropertiesChange, {
            properties: i,
            values: arr1,
            custom: t,
            temporary: !0,
          });
          var arr = [];
          for (o = 0; o < i.length; ++o) {
            var arr3;
            arr2 = "#" + (arr3 = (t ? "@" : "$") + i[o]);
            arr.push(this[arr3]), (this[arr3] = arr1[o]), delete this[arr2];
          }
          return (
            this._notifyChange(Class._Change.AfterPropertiesChange, {
              properties: i,
              values: arr,
              custom: t,
              temporary: !0,
            }),
            !0
          );
        }),
        (Class.Properties.prototype.setProperty = function (e, t, i, n, arr1) {
          return this.setProperties([e], [t], i, n, arr1);
        }),
        (Class.Properties.prototype.setProperties = function (e, t, i, arr1, o) {
          if (e.length !== t.length)
            throw new Error("Properties length does not match values length");
          for (
            var arr2 = [],
              s = [],
              l = this.getTrackTempPropNames(),
              arr = !1,
              arr3 = [],
              p = i ? "@" : "$",
              u = 0;
            u < e.length;
            ++u
          ) {
            var d = t[u],
              g = e[u],
              f = "#" + (y = p + g);
            !arr && l && -1 !== l.indexOf(g) && (arr = !0),
              !o &&
                this.hasOwnProperty(f) &&
                ((this[y] = this[f]), delete this[f]);
            var m = this[y];
            (!arr1 && n.equals(d, m, !1)) ||
              (arr2.push(g),
              s.push(d),
              arr3.push(m),
              o && !this.hasOwnProperty(f) && (this[f] = m));
          }
          if (0 === arr2.length) return !1;
          if (
            (this._notifyChange(Class._Change.BeforePropertiesChange, {
              properties: arr2,
              values: s,
              custom: i,
              temporary: o,
              forceEvent: arr,
            }),
            arr2.length > arr3.length)
          )
            for (u = arr3.length; u < arr2.length; u++) {
              m = this[(y = p + arr2[u])];
              arr3[u] = m;
            }
          for (u = 0; u < arr2.length; ++u) {
            var y;
            this[(y = p + arr2[u])] = s[u];
          }
          var _ = this._workspace
            ? this._workspace.getTransactionRecorder()
            : null;
          return (
            _ && _.afterSetProperties(this, arr2, arr3, s, o, i),
            this._notifyChange(Class._Change.AfterPropertiesChange, {
              properties: arr2,
              values: arr3,
              custom: i,
              temporary: o,
              forceEvent: arr,
            }),
            !0
          );
        }),
        (Class.Properties.prototype.getTrackTempPropNames = function () {
          return null;
        }),
        (Class.Properties.prototype.storeProperties = function (e, t, i) {
          for (var arr1 in ((i =
            i ||
            function (e, t) {
              return t;
            }),
          t)) {
            var o = t[arr1],
              arr2 = i(arr1, this["$" + arr1]);
            n.equals(arr2, o, !0) || (e[arr1] = arr2);
          }
        }),
        (Class.Properties.prototype.restoreProperties = function (e, t, i) {
          i =
            i ||
            function (e, t) {
              return t;
            };
          var n = [],
            arr1 = [];
          for (var o in t)
            n.push(o), e.hasOwnProperty(o) ? arr1.push(i(o, e[o])) : arr1.push(t[o]);
          this.setProperties(n, arr1, !1);
        }),
        (Class.Properties.prototype.transferProperties = function (e, t, i) {
          for (var n = [], arr1 = [], o = 0; o < t.length; ++o)
            for (var arr2 in t[o])
              n.push(arr2),
                e.hasProperty(arr2)
                  ? arr1.push(e.getProperty(arr2, !1, null, i))
                  : arr1.push(t[o][arr2]);
          this.setProperties(n, arr1, !1);
        }),
        (Class.Properties.prototype._setDefaultProperties = function () {
          var e, t, i, arr1;
          for (e = 0; e < arguments.length; ++e)
            for (arr1 in (t = arguments[e]))
              !((i = t[arr1]) && i instanceof Object) ||
                i instanceof arr2 ||
                i instanceof l ||
                i instanceof Array ||
                (i = n.extend(!0, {}, i)),
                (this["$" + arr1] = i);
        }),
        (Class.Identity = function () {}),
        (Class.Identity.prototype.__id = null),
        (Class.Identity.prototype.getId = function () {
          return this.__id || (this.__id = n.uuid(6)), this.__id;
        }),
        (Class.Tag = function () {}),
        (Class.Tag.prototype.getTags = function () {
          throw new Error("Not Supported.");
        }),
        (Class.Reference = function () {}),
        (Class.Reference.prototype._referenceId = null),
        (Class.Reference.prototype._oldReferenceId = null),
        (Class.Reference.prototype.getOldReferenceId = function () {
          return this._oldReferenceId;
        }),
        (Class.Reference.prototype.getReferenceId = function () {
          return (
            this._referenceId || (this._referenceId = n.uuid()),
            this._referenceId
          );
        }),
        (Class.Multireference = function () {}),
        (Class.Multireference.prototype._multiReferenceId = null),
        (Class.Multireference.prototype.getMultireferenceId = function () {
          return (
            this._multiReferenceId || (this._multiReferenceId = n.uuid()),
            this._multiReferenceId
          );
        }),
        (Class.Multireference.prototype.resetMultireference = function () {
          this._multiReferenceId = null;
        }),
        (Class.Multireference.prototype.hasMultireference = function () {
          return null === this._multiReferenceId;
        }),
        (Class.Container = function () {}),
        (Class.Container.prototype._firstChild = null),
        (Class.Container.prototype._lastChild = null),
        (Class.Container.prototype.getChildren = function () {
          for (
            var e = [], t = this.getFirstChild();
            null !== t;
            t = t.getNext()
          )
            e.push(t);
          return e;
        }),
        (Class.Container.prototype.getFirstChild = function () {
          return this._firstChild;
        }),
        (Class.Container.prototype.getLastChild = function () {
          return this._lastChild;
        }),
        (Class.Container.prototype.appendChild = function (e) {
          this.insertChild(e, null);
        }),
        (Class.Container.prototype.insertChild = function (e, t) {
          if (null != e._parent)
            throw new Error("Child is already appended somewhere else");
          if (null != t && t.getParent() != this)
            throw new Error("Reference is not arr2 child of this node");
          if (!e.validateInsertion(this, t))
            throw new Error("Child insertion validation failed.");
          this._notifyChange(Class._Change.BeforeChildInsert, e),
            null != t
              ? (e._setNext(t),
                e._setPrevious(t._previous),
                t._setPrevious(e),
                null == e._previous
                  ? (this._firstChild = e)
                  : e._previous._setNext(e))
              : (null != this._lastChild &&
                  (e._setPrevious(this._lastChild),
                  this._lastChild._setNext(e),
                  (this._lastChild = e)),
                e._setNext(null)),
            null == this._firstChild &&
              ((this._firstChild = e), e._setPrevious(null), e._setNext(null)),
            null == e._next && (this._lastChild = e),
            e._setParent(this);
          var i = this._workspace
            ? this._workspace.getTransactionRecorder()
            : null;
          i && i.afterChildInsert(e, this, e._next),
            this._notifyChange(Class._Change.AfterChildInsert, e);
        }),
        (Class.Container.prototype.removeChild = function (e) {
          if (e._parent != this)
            throw new Error("Child is not arr2 child of this node");
          if (!e.validateRemoval())
            throw new Error("Child removal validation failed.");
          this._notifyChange(Class._Change.BeforeChildRemove, e);
          var t = this._workspace
            ? this._workspace.getTransactionRecorder()
            : null;
          t && t.beforeChildRemove(e, this, e._next),
            e._setParent(null),
            this._firstChild == e && (this._firstChild = e._next),
            this._lastChild == e && (this._lastChild = e._previous),
            null != e._previous && e._previous._setNext(e._next),
            null != e._next && e._next._setPrevious(e._previous),
            e._setPrevious(null),
            e._setNext(null),
            this._notifyChange(Class._Change.AfterChildRemove, e);
        }),
        (Class.Container.prototype.clearChildren = function () {
          for (; this.getFirstChild(); ) this.removeChild(this.getFirstChild());
        }),
        (Class.Container.prototype.getIndexOfChild = function (e) {
          if (e._parent === this)
            for (
              var t = 0, i = this.getFirstChild();
              null !== i;
              i = i.getNext()
            ) {
              if (i === e) return t;
              t++;
            }
          return -1;
        }),
        (Class.Container.prototype.getChildByIndex = function (e) {
          for (
            var t = 0, i = this.getFirstChild();
            null !== i;
            i = i.getNext()
          ) {
            if (t === e) return i;
            t++;
          }
          return null;
        }),
        (Class.Container.prototype.acceptChildren = function (e, t, i, n) {
          var arr1,
            o = !i;
          if (t)
            for (var arr2 = this.getLastChild(); null != arr2; arr2 = arr2.getPrevious()) {
              if (!1 === (arr1 = arr2.accept(e, t, i, n)) && !i) return !1;
              !0 === arr1 && i && (o = !0);
            }
          else
            for (arr2 = this.getFirstChild(); null != arr2; arr2 = arr2.getNext()) {
              if (!1 === (arr1 = arr2.accept(e, t, i, n)) && !i) return !1;
              !0 === arr1 && i && (o = !0);
            }
          return o;
        }),
        (Class.Container.prototype.getSubnodeIds = function (e) {
          for (var t = this.getLastChild(); null !== t; t = t.getPrevious())
            t.hasMixin(Class.Multireference) &&
              (e[t.getMultireferenceId()] && t.resetMultireference(),
              (e[t.getMultireferenceId()] = t)),
              t.hasMixin(Class.Container) && t.getSubnodeIds(e);
        }),
        (Class.Container.prototype.getInternalSelectedNodes = function () {
          var e = [];
          return (
            this.acceptChildren(
              function (t) {
                return t.hasFlag(Class.Flag.Selected) && e.push(t), !0;
              },
              !1,
              !0
            ),
            e.length ? e : null
          );
        }),
        (Class.Container.prototype.toString = function () {
          return "[Mixin GNode.Container]";
        }),
        (Class.Store = function () {}),
        (Class.Store.prototype.clone = function (e, t) {
          var i = Class.serialize(this, e);
          return i ? Class.deserialize(i, t) : null;
        }),
        (Class.MapContainer = function () {
          this._children = Object.create(null);
        }),
        Class.inheritAndMix("MapContainer", Class.MapContainer, Class, [
          Class.Store,
          Class.Container,
        ]),
        (Class.MapContainer.prototype._children = {}),
        (Class.MapContainer.prototype.insertChild = function (e, t) {
          if (null != e._parent)
            throw new Error("Child is already appended somewhere else");
          if (null != t && t.getParent() != this)
            throw new Error("Reference is not arr2 child of this node");
          if (!e.validateInsertion(this, t))
            throw new Error("Child insertion validation failed.");
          this.isLocked() ||
            (this._notifyChange(Class._Change.BeforeChildInsert, e),
            null != t
              ? (e._setNext(t),
                e._setPrevious(t._previous),
                t._setPrevious(e),
                null == e._previous
                  ? (this._firstChild = e)
                  : e._previous._setNext(e))
              : (null != this._lastChild &&
                  (e._setPrevious(this._lastChild),
                  this._lastChild._setNext(e),
                  (this._lastChild = e)),
                e._setNext(null)),
            null == this._firstChild &&
              ((this._firstChild = e), e._setPrevious(null), e._setNext(null)),
            null == e._next && (this._lastChild = e),
            e._setParent(this),
            (this._children[e.getId()] = e),
            this._notifyChange(Class._Change.AfterChildInsert, e));
        }),
        (Class.MapContainer.prototype.removeChild = function (e) {
          if (e._parent != this)
            throw new Error("Child is not arr2 child of this node");
          if (!e.validateRemoval())
            throw new Error("Child removal validation failed.");
          this._notifyChange(Class._Change.BeforeChildRemove, e),
            this._children[e.getId()] &&
              (delete this._children[e.getId()],
              this._children || (this._children = Object.create(null))),
            this._firstChild == e && (this._firstChild = e._next),
            this._lastChild == e && (this._lastChild = e._previous),
            null != e._previous && e._previous._setNext(e._next),
            null != e._next && e._next._setPrevious(e._previous),
            e._setParent(null),
            e._setPrevious(null),
            e._setNext(null),
            this._notifyChange(Class._Change.AfterChildRemove, e);
        }),
        (Class.MapContainer.prototype.getAsArray = function () {
          var e = Object.keys(this._children).length;
          if (!e) return null;
          for (
            var t = new Array(e), i = 0, n = this.getFirstChild();
            i < e && n;
            ++i, n = n.getNext()
          )
            t[i] = n;
          return t;
        }),
        (Class.MapContainer.prototype.getById = function (e) {
          return e && this._children[e] ? this._children[e] : null;
        }),
        (Class.MapContainer.prototype.toString = function () {
          return "[Mixin GNode.MapContainer]";
        }),
        (Class.prototype._workspace = null),
        (Class.prototype._parent = null),
        (Class.prototype._previous = null),
        (Class.prototype._next = null),
        (Class.prototype._flags = 0),
        (Class.prototype.restoreCount = 0),
        (Class.prototype._isRestoring = !1),
        (Class.prototype.recordedTransaction = !1),
        (Class.prototype.getNodeName = function () {
          return Class.getName(this);
        }),
        (Class.prototype.getNodeNameTranslated = function () {
          return s.getValue(this, "name", this.getNodeName());
        }),
        (Class.prototype.getWorkspace = function () {
          return this._workspace;
        }),
        (Class.prototype.getParent = function () {
          return this._parent;
        }),
        (Class.prototype.getPrevious = function () {
          return this._previous;
        }),
        (Class.prototype.getNext = function () {
          return this._next;
        }),
        (Class.prototype.getNodesByName = function (e, t) {
          var i = [];
          return (
            this.accept(
              function (t) {
                (e && "*" != e && e !== t.getNodeName()) ||
                  (t !== this && i.push(t));
              }.bind(this)
            ),
            i
          );
        }),
        (Class.prototype.accept = function (e, t, i, n) {
          var arr1 = !1;
          if (!n && ((arr1 = e.call(null, this)), !i && !1 === arr1)) return arr1;
          if (this.hasMixin(Class.Container)) {
            var o = this.acceptChildren(e, t, i, n);
            if (!i && !1 === o) return !1;
            arr1 = arr1 || o;
          }
          if (n) {
            var arr2 = e.call(null, this);
            if (!i && !1 === arr2) return !1;
            arr1 = arr1 || arr2;
          }
          return arr1;
        }),
        (Class.prototype.findParent = function (e) {
          return this._parent
            ? !0 === e.call(null, this._parent)
              ? this._parent
              : this._parent.findParent(e)
            : null;
        }),
        (Class.prototype.hasFlag = function (e) {
          return 0 != (this._flags & e);
        }),
        (Class.prototype.setFlag = function (e) {
          if (this._canModifyFlag(e, !0) && 0 == (this._flags & e)) {
            this._notifyChange(Class._Change.BeforeFlagChange, {
              flag: e,
              set: !0,
            }),
              (this._flags = this._flags | e);
            var t = this._workspace
              ? this._workspace.getTransactionRecorder()
              : null;
            t && t.afterFlagSet(this, e),
              this._notifyChange(Class._Change.AfterFlagChange, {
                flag: e,
                set: !0,
              });
          }
        }),
        (Class.prototype.removeFlag = function (e) {
          if (this._canModifyFlag(e, !1) && 0 != (this._flags & e)) {
            this._notifyChange(Class._Change.BeforeFlagChange, {
              flag: e,
              set: !1,
            }),
              (this._flags = this._flags & ~e);
            var t = this._workspace
              ? this._workspace.getTransactionRecorder()
              : null;
            t && t.afterFlagRemove(this, e),
              this._notifyChange(Class._Change.AfterFlagChange, {
                flag: e,
                set: !1,
              });
          }
        }),
        (Class.prototype.assignFrom = function (e) {
          this.hasMixin(Class.Multireference) &&
            e.hasMixin(Class.Multireference) &&
            (this._multiReferenceId = e._multiReferenceId);
        }),
        (Class.prototype.validateInsertion = function (e, t) {
          return !1;
        }),
        (Class.prototype.validateRemoval = function () {
          return !0;
        }),
        (Class.prototype.isLocked = function () {
          return !!this._parent && this._parent.isLocked();
        }),
        (Class.prototype.isRestoring = function () {
          return (
            !!this._isRestoring ||
            null !=
              this.findParent(function (e) {
                return e._isRestoring;
              })
          );
        }),
        (Class.prototype.beginUpdate = function () {}),
        (Class.prototype.endUpdate = function (e) {}),
        (Class.prototype._blockUpdateChanges = function () {}),
        (Class.prototype._releaseUpdateChanges = function () {}),
        (Class.prototype._canModifyFlag = function (e, t) {
          return !0;
        }),
        (Class.prototype._beginBlockChanges = function (e, t) {
          this._blockedChanges ||
            ((this._blockedChanges = {}), (this._blockedChanges._counter = 0));
          for (var i = 0; i < e.length; ++i) {
            var n = e[i];
            n in this._blockedChanges
              ? this._blockedChanges[n]++
              : (this._blockedChanges[n] = 1),
              this._blockedChanges._counter++;
          }
          var arr1 = this._workspace
            ? this._workspace.getTransactionRecorder()
            : null;
          arr1 && arr1.beginBlock(this, e, t);
        }),
        (Class.prototype._endBlockChanges = function (e, t) {
          if (this._blockedChanges)
            for (var i = 0; i < e.length; ++i) {
              var n = e[i];
              n in this._blockedChanges &&
                this._blockedChanges[n] > 0 &&
                0 == --this._blockedChanges[n] &&
                0 == --this._blockedChanges._counter &&
                delete this._blockedChanges;
            }
          var arr1 = this._workspace
            ? this._workspace.getTransactionRecorder()
            : null;
          arr1 && arr1.endBlock(this, e, t);
        }),
        (Class.prototype._beginBlockEvents = function (e) {
          this._blockedEvents ||
            ((this._blockedEvents = {}), (this._blockedEvents._counter = 0));
          for (var t = 0; t < e.length; ++t) {
            var i = arr2.getTypeId(e[t]);
            i in this._blockedEvents
              ? this._blockedEvents[i]++
              : (this._blockedEvents[i] = 1),
              this._blockedEvents._counter++;
          }
        }),
        (Class.prototype._endBlockEvents = function (e) {
          if (this._blockedEvents)
            for (var t = 0; t < e.length; ++t) {
              var i = arr2.getTypeId(e[t]);
              i in this._blockedEvents &&
                this._blockedEvents[i] > 0 &&
                0 == --this._blockedEvents[i] &&
                0 == --this._blockedEvents._counter &&
                delete this._blockedEvents;
            }
        }),
        (Class.prototype._getCompositeEvents = function (e, t, i) {
          var n = [];
          return (
            e &&
              (n = n.concat([
                Class.BeforeInsertEvent,
                Class.AfterInsertEvent,
                Class.BeforeRemoveEvent,
                Class.AfterRemoveEvent,
              ])),
            t && (n = n.concat([Class.AfterPropertiesChangeEvent])),
            i &&
              (n = n.concat([Class.BeforeFlagChangeEvent, Class.AfterFlagChangeEvent])),
            n
          );
        }),
        (Class.prototype._beginBlockCompositeEvents = function (e, t, i) {
          this._beginBlockEvents(this._getCompositeEvents(e, t, i));
        }),
        (Class.prototype._endBlockCompositeEvents = function (e, t, i) {
          this._endBlockEvents(this._getCompositeEvents(e, t, i));
        }),
        (Class.prototype._notifyChange = function (e, t) {
          return (
            (!this._blockedChanges || !this._blockedChanges[e]) &&
            (this._handleChange(e, t), !0)
          );
        }),
        (Class.prototype._canEventBeSent = function (e) {
          var t = arr2.getTypeId(e);
          return !this._blockedEvents || !this._blockedEvents[t];
        }),
        (Class.prototype._sendEvent = function (e) {
          var t = this;
          if (e.temporary)
            for (
              (t instanceof arr1 || t.hasMixin(arr1)) &&
                t.hasEventListeners(e.constructor) &&
                t.trigger(e),
                t = t.getParent();
              t;
              t = t.getParent()
            )
              t.temporaryReceiver &&
                (t.hasMixin(arr1) || t instanceof arr1) &&
                t.hasEventListeners(e.constructor) &&
                t.trigger(e);
          else
            for (
              (t instanceof arr1 || t.hasMixin(arr1)) &&
                t.hasEventListeners(e.constructor) &&
                t.trigger(e),
                t = t.getParent();
              t;
              t = t.getParent()
            )
              (t.hasMixin(arr1) || t instanceof arr1) &&
                t.hasEventListeners(e.constructor) &&
                t.trigger(e);
        }),
        (Class.prototype._setWorkspace = function (e) {
          e !== this._workspace &&
            (this._workspace &&
              (this._notifyChange(Class._Change.WorkspaceDetach),
              this.hasMixin(Class.Reference) &&
                this._workspace.removeReference(this),
              (this._workspace = null)),
            (this._workspace = e),
            this._workspace &&
              (this.hasMixin(Class.Reference) && this._workspace.addReference(this),
              this._notifyChange(Class._Change.WorkspaceAttached)));
        }),
        (Class.prototype._attachToParent = function (e) {
          e._workspace &&
            this.accept(function (t) {
              t._setWorkspace(e._workspace);
            });
        }),
        (Class.prototype._detachFromParent = function (e) {
          e._workspace &&
            this.accept(function (e) {
              e._setWorkspace(null);
            });
        }),
        (Class.prototype._setParent = function (e) {
          this._parent !== e &&
            (this._parent &&
              (this._notifyChange(Class._Change.ParentDetach),
              this._detachFromParent(this._parent)),
            (this._parent = e),
            this._parent &&
              (this._attachToParent(this._parent),
              this._notifyChange(Class._Change.ParentAttached)));
        }),
        (Class.prototype._setPrevious = function (e) {
          this._previous = e;
        }),
        (Class.prototype._setNext = function (e) {
          this._next = e;
        }),
        (Class.prototype.isRecordedTransaction = function () {
          return (
            !!this.recordedTransaction ||
            null !=
              this.findParent(function (e) {
                return e.recordedTransaction;
              })
          );
        }),
        (Class.prototype._handleChange = function (e, t) {
          if (e === Class._Change.PrepareRestore) this._isRestoring = !0;
          else if (e === Class._Change.Restore)
            (this._isRestoring = !1),
              this._canEventBeSent(Class.AfterRestoreEvent) &&
                this._sendEvent(new Class.AfterRestoreEvent(this));
          else if (e == Class._Change.BeforeChildInsert) {
            var i = t;
            this._canEventBeSent(Class.BeforeInsertEvent) &&
              this._sendEvent(new Class.BeforeInsertEvent(i));
          } else if (e == Class._Change.AfterChildInsert) {
            i = t;
            this._canEventBeSent(Class.AfterInsertEvent) &&
              this._sendEvent(new Class.AfterInsertEvent(i));
          } else if (e == Class._Change.BeforeChildRemove) {
            i = t;
            this._canEventBeSent(Class.BeforeRemoveEvent) &&
              this._sendEvent(new Class.BeforeRemoveEvent(i));
          } else if (e == Class._Change.AfterChildRemove) {
            i = t;
            this._canEventBeSent(Class.AfterRemoveEvent) &&
              this._sendEvent(new Class.AfterRemoveEvent(i));
          } else if (e == Class._Change.BeforePropertiesChange) {
            (n = t).forceEvent &&
            this._canEventBeSent(Class.BeforePropertiesChangeEvent)
              ? this._sendEvent(
                  new Class.BeforePropertiesChangeEvent(
                    this,
                    n.properties,
                    n.values,
                    n.custom,
                    n.temporary
                  )
                )
              : !n.temporary &&
                this._canEventBeSent(Class.BeforePropertiesChangeEvent) &&
                this._sendEvent(
                  new Class.BeforePropertiesChangeEvent(
                    this,
                    n.properties,
                    n.values,
                    n.custom
                  )
                );
          } else if (e == Class._Change.AfterPropertiesChange) {
            var n = t;
            this._canEventBeSent(Class.AfterPropertiesChangeEvent) &&
              (n.forceEvent,
              this._sendEvent(
                new Class.AfterPropertiesChangeEvent(
                  this,
                  n.properties,
                  n.values,
                  n.custom,
                  n.temporary
                )
              ));
          } else if (e == Class._Change.BeforeFlagChange) {
            var arr1 = t;
            this._canEventBeSent(Class.BeforeFlagChangeEvent) &&
              this._sendEvent(new Class.BeforeFlagChangeEvent(this, arr1.flag, arr1.set));
          } else if (e == Class._Change.AfterFlagChange) {
            arr1 = t;
            this._canEventBeSent(Class.AfterFlagChangeEvent) &&
              this._sendEvent(new Class.AfterFlagChangeEvent(this, arr1.flag, arr1.set));
          }
        }),
        i(894)(Class),
        (e.exports = Class);
    }