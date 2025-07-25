"use strict";
(self.webpackChunk_am5 = self.webpackChunk_am5 || []).push([
  [6842],
  {
    7533: function (t, e, n) {
      n.r(e),
        n.d(e, {
          ClusteredPointSeries: function () {
            return Bi;
          },
          DefaultTheme: function () {
            return ae;
          },
          GraticuleSeries: function () {
            return rt;
          },
          MapChart: function () {
            return ji;
          },
          MapLine: function () {
            return Q;
          },
          MapLineSeries: function () {
            return et;
          },
          MapPointSeries: function () {
            return Ni;
          },
          MapPolygon: function () {
            return Li;
          },
          MapPolygonSeries: function () {
            return Ti;
          },
          MapSeries: function () {
            return s;
          },
          ZoomControl: function () {
            return Xi;
          },
          geoAlbersUsa: function () {
            return Ji;
          },
          geoEqualEarth: function () {
            return eo;
          },
          geoEquirectangular: function () {
            return Wi;
          },
          geoMercator: function () {
            return re;
          },
          geoNaturalEarth1: function () {
            return io;
          },
          geoOrthographic: function () {
            return Ai;
          },
          getGeoArea: function () {
            return xi;
          },
          getGeoBounds: function () {
            return Di;
          },
          getGeoCentroid: function () {
            return wi;
          },
          getGeoCircle: function () {
            return Pi;
          },
          getGeoRectangle: function () {
            return Si;
          },
          normalizeGeoPoint: function () {
            return Ii;
          },
        });
      var i = n(3399),
        o = n(5071),
        r = n(256);
      class s extends i.F {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "_types", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            }),
            Object.defineProperty(this, "_geometries", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            }),
            Object.defineProperty(this, "_geoJSONparsed", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: !1,
            }),
            Object.defineProperty(this, "_excluded", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            }),
            Object.defineProperty(this, "_notIncluded", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            });
        }
        _afterNew() {
          this.fields.push("geometry", "geometryType"),
            this._setRawDefault("geometryField", "geometry"),
            this._setRawDefault("geometryTypeField", "geometryType"),
            this._setRawDefault("idField", "id"),
            this.on("geoJSON", (t) => {
              let e = this._prevSettings.geoJSON;
              e && e != t && this.data.clear();
            }),
            super._afterNew();
        }
        _handleDirties() {
          const t = this.get("geoJSON");
          let e = this._prevSettings.geoJSON;
          e &&
            e != t &&
            ((this._prevSettings.geoJSON = void 0), (this._geoJSONparsed = !1)),
            this._geoJSONparsed ||
              (this._parseGeoJSON(), (this._geoJSONparsed = !0));
        }
        _prepareChildren() {
          if (
            (super._prepareChildren(),
            this._valuesDirty && this._handleDirties(),
            this.get("geoJSON") &&
              (this.isDirty("geoJSON") ||
                this.isDirty("include") ||
                this.isDirty("exclude")))
          ) {
            this._handleDirties();
            const t = this.chart,
              e = this.get("exclude");
            e &&
              (t && (t._centerLocation = null),
              o.each(e, (t) => {
                const e = this.getDataItemById(t);
                e && this._excludeDataItem(e);
              }),
              o.each(this._excluded, (t) => {
                const n = t.get("id");
                n && -1 == e.indexOf(n) && this._unexcludeDataItem(t);
              })),
              (e && 0 != e.length) ||
                (o.each(this._excluded, (t) => {
                  this._unexcludeDataItem(t);
                }),
                (this._excluded = []));
            const n = this.get("include");
            n &&
              (t && (t._centerLocation = null),
              o.each(this.dataItems, (t) => {
                const e = t.get("id");
                e && -1 == n.indexOf(e)
                  ? this._notIncludeDataItem(t)
                  : this._unNotIncludeDataItem(t);
              })),
              n ||
                (o.each(this._notIncluded, (t) => {
                  this._unNotIncludeDataItem(t);
                }),
                (this._notIncluded = []));
          }
        }
        _excludeDataItem(t) {
          this._removeGeometry(t.get("geometry")), o.move(this._excluded, t);
        }
        _unexcludeDataItem(t) {
          this._addGeometry(t.get("geometry"), this);
        }
        _notIncludeDataItem(t) {
          this._removeGeometry(t.get("geometry")), o.move(this._notIncluded, t);
        }
        _unNotIncludeDataItem(t) {
          this._addGeometry(t.get("geometry"), this);
        }
        checkInclude(t, e, n) {
          if (e) {
            if (0 == e.length) return !1;
            if (-1 == e.indexOf(t)) return !1;
          }
          return !(n && n.length > 0 && -1 != n.indexOf(t));
        }
        _parseGeoJSON() {
          const t = this.get("geoJSON");
          if (t) {
            let e;
            "FeatureCollection" == t.type
              ? (e = t.features)
              : "Feature" == t.type
              ? (e = [t])
              : -1 !=
                [
                  "Point",
                  "LineString",
                  "Polygon",
                  "MultiPoint",
                  "MultiLineString",
                  "MultiPolygon",
                ].indexOf(t.type)
              ? (e = [{ geometry: t }])
              : console.log("nothing found in geoJSON");
            const n = this.get("geodataNames");
            if (e) {
              const t = this.get("idField", "id");
              for (let i = 0, s = e.length; i < s; i++) {
                let s = e[i],
                  a = s.geometry;
                if (a) {
                  let e = a.type,
                    i = s[t];
                  if (
                    (n && n[i] && (s.properties.name = n[i]),
                    -1 != this._types.indexOf(e))
                  ) {
                    let n, l;
                    null != i &&
                      (n = o.find(this.dataItems, (t) => t.get("id") == i)),
                      n && (l = n.dataContext),
                      n
                        ? l.geometry ||
                          ((l.geometry = a),
                          (l.geometryType = e),
                          n.set("geometry", a),
                          n.set("geometryType", e),
                          this.processDataItem(n))
                        : ((l = {
                            geometry: a,
                            geometryType: e,
                            madeFromGeoData: !0,
                          }),
                          (l[t] = i),
                          this.data.push(l)),
                      r.softCopyProperties(s.properties, l);
                  }
                }
              }
            }
            const i = "geodataprocessed";
            this.events.isEnabled(i) &&
              this.events.dispatch(i, { type: i, target: this });
          }
        }
        _placeBulletsContainer(t) {
          this.children.moveValue(this.bulletsContainer);
        }
        _removeBulletsContainer() {}
        projection() {
          const t = this.chart;
          if (t) return t.get("projection");
        }
        geoPath() {
          const t = this.chart;
          if (t) return t.getPrivate("geoPath");
        }
        _addGeometry(t, e) {
          if (t && e.get("affectsBounds", !0)) {
            this._geometries.push(t);
            const e = this.chart;
            e && e.markDirtyGeometries();
          }
        }
        _removeGeometry(t) {
          if (t) {
            o.remove(this._geometries, t);
            const e = this.chart;
            e && e.markDirtyGeometries();
          }
        }
        _dispose() {
          super._dispose();
          const t = this.chart;
          t && t.series.removeValue(this);
        }
        _onDataClear() {
          super._onDataClear(),
            (this._geoJSONparsed = !1),
            this._markDirtyKey("exclude");
        }
      }
      Object.defineProperty(s, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "MapSeries",
      }),
        Object.defineProperty(s, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: i.F.classNames.concat([s.className]),
        });
      var a = n(5040),
        l = n(6245),
        u = n(1479);
      class c {
        constructor() {
          (this._partials = new Float64Array(32)), (this._n = 0);
        }
        add(t) {
          const e = this._partials;
          let n = 0;
          for (let i = 0; i < this._n && i < 32; i++) {
            const o = e[i],
              r = t + o,
              s = Math.abs(t) < Math.abs(o) ? t - (r - o) : o - (r - t);
            s && (e[n++] = s), (t = r);
          }
          return (e[n] = t), (this._n = n + 1), this;
        }
        valueOf() {
          const t = this._partials;
          let e,
            n,
            i,
            o = this._n,
            r = 0;
          if (o > 0) {
            for (
              r = t[--o];
              o > 0 &&
              ((e = r), (n = t[--o]), (r = e + n), (i = n - (r - e)), !i);

            );
            o > 0 &&
              ((i < 0 && t[o - 1] < 0) || (i > 0 && t[o - 1] > 0)) &&
              ((n = 2 * i), (e = r + n), n == e - r && (r = e));
          }
          return r;
        }
      }
      var h = 1e-6,
        p = 1e-12,
        f = Math.PI,
        d = f / 2,
        g = f / 4,
        m = 2 * f,
        y = 180 / f,
        v = f / 180,
        _ = Math.abs,
        b = Math.atan,
        P = Math.atan2,
        w = Math.cos,
        x = Math.ceil,
        D = Math.exp,
        S = (Math.floor, Math.hypot),
        I = Math.log,
        M = (Math.pow, Math.sin),
        C =
          Math.sign ||
          function (t) {
            return t > 0 ? 1 : t < 0 ? -1 : 0;
          },
        j = Math.sqrt,
        N = Math.tan;
      function E(t) {
        return t > 1 ? d : t < -1 ? -d : Math.asin(t);
      }
      function O(t) {
        return (t = M(t / 2)) * t;
      }
      function L() {}
      function T(t, e) {
        t && Y.hasOwnProperty(t.type) && Y[t.type](t, e);
      }
      var k,
        R,
        z,
        G,
        B = {
          Feature: function (t, e) {
            T(t.geometry, e);
          },
          FeatureCollection: function (t, e) {
            for (var n = t.features, i = -1, o = n.length; ++i < o; )
              T(n[i].geometry, e);
          },
        },
        Y = {
          Sphere: function (t, e) {
            e.sphere();
          },
          Point: function (t, e) {
            (t = t.coordinates), e.point(t[0], t[1], t[2]);
          },
          MultiPoint: function (t, e) {
            for (var n = t.coordinates, i = -1, o = n.length; ++i < o; )
              (t = n[i]), e.point(t[0], t[1], t[2]);
          },
          LineString: function (t, e) {
            X(t.coordinates, e, 0);
          },
          MultiLineString: function (t, e) {
            for (var n = t.coordinates, i = -1, o = n.length; ++i < o; )
              X(n[i], e, 0);
          },
          Polygon: function (t, e) {
            Z(t.coordinates, e);
          },
          MultiPolygon: function (t, e) {
            for (var n = t.coordinates, i = -1, o = n.length; ++i < o; )
              Z(n[i], e);
          },
          GeometryCollection: function (t, e) {
            for (var n = t.geometries, i = -1, o = n.length; ++i < o; )
              T(n[i], e);
          },
        };
      function X(t, e, n) {
        var i,
          o = -1,
          r = t.length - n;
        for (e.lineStart(); ++o < r; ) (i = t[o]), e.point(i[0], i[1], i[2]);
        e.lineEnd();
      }
      function Z(t, e) {
        var n = -1,
          i = t.length;
        for (e.polygonStart(); ++n < i; ) X(t[n], e, 1);
        e.polygonEnd();
      }
      function A(t, e) {
        t && B.hasOwnProperty(t.type) ? B[t.type](t, e) : T(t, e);
      }
      var F = {
        sphere: L,
        point: L,
        lineStart: function () {
          (F.point = V), (F.lineEnd = W);
        },
        lineEnd: L,
        polygonStart: L,
        polygonEnd: L,
      };
      function W() {
        F.point = F.lineEnd = L;
      }
      function V(t, e) {
        (R = t *= v), (z = M((e *= v))), (G = w(e)), (F.point = H);
      }
      function H(t, e) {
        t *= v;
        var n = M((e *= v)),
          i = w(e),
          o = _(t - R),
          r = w(o),
          s = i * M(o),
          a = G * n - z * i * r,
          l = z * n + G * i * r;
        k.add(P(j(s * s + a * a), l)), (R = t), (z = n), (G = i);
      }
      function J(t) {
        return (k = new c()), A(t, F), +k;
      }
      var $ = [null, null],
        U = { type: "LineString", coordinates: $ };
      function q(t, e) {
        return ($[0] = t), ($[1] = e), J(U);
      }
      class Q extends u.T {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "_projectionDirty", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: !1,
            });
        }
        _beforeChanged() {
          if (
            (super._beforeChanged(),
            this._projectionDirty ||
              this.isDirty("geometry") ||
              this.isDirty("precision"))
          ) {
            const t = this.get("geometry");
            if (t) {
              const e = this.getPrivate("series");
              if (e) {
                const n = e.chart;
                if (n) {
                  const i = n.get("projection");
                  let o = null;
                  i &&
                    i.clipAngle &&
                    ((o = i.clipAngle()),
                    i.precision(this.get("precision", 0.5)));
                  const r = this.dataItem,
                    s = n.getPrivate("geoPath");
                  if (s && r)
                    if (
                      ((this._clear = !0),
                      "straight" == r.get("lineType", e.get("lineType")))
                    ) {
                      const t = this.get("geometry");
                      if (t) {
                        let e = t.coordinates;
                        if (e) {
                          let i;
                          "LineString" == t.type
                            ? (i = [e])
                            : "MultiLineString" == t.type && (i = e),
                            this.set("draw", (t) => {
                              for (let e = 0; e < i.length; e++) {
                                let o = i[e];
                                if (o.length > 0) {
                                  const e = o[0],
                                    i = n.convert({
                                      longitude: e[0],
                                      latitude: e[1],
                                    });
                                  t.lineTo(i.x, i.y);
                                  for (let e = 0; e < o.length; e++) {
                                    const i = o[e],
                                      r = n.convert({
                                        longitude: i[0],
                                        latitude: i[1],
                                      });
                                    t.lineTo(r.x, r.y);
                                  }
                                }
                              }
                            });
                        }
                      }
                    } else
                      this.set("draw", (n) => {
                        i && !1 === e.get("clipBack") && i.clipAngle(180),
                          s.context(this._display),
                          s(t),
                          s.context(null),
                          i && i.clipAngle && i.clipAngle(o);
                      });
                }
              }
            }
            const e = "linechanged";
            this.events.isEnabled(e) &&
              this.events.dispatch(e, { type: e, target: this });
          }
        }
        markDirtyProjection() {
          this.markDirty(), (this._projectionDirty = !0);
        }
        _clearDirty() {
          super._clearDirty(), (this._projectionDirty = !1);
        }
        _getTooltipPoint() {
          let t = this.get("tooltipX"),
            e = this.get("tooltipY"),
            n = 0,
            i = 0;
          if (
            (a.isNumber(t) && (n = t),
            a.isNumber(e) && (i = e),
            t instanceof l.gG)
          ) {
            const e = this.positionToGeoPoint(t.value),
              o = this.getPrivate("series");
            if (o) {
              const t = o.chart;
              if (t) {
                const o = t.convert(e);
                (n = o.x), (i = o.y);
              }
            }
          }
          return { x: n, y: i };
        }
        positionToGeoPoint(t) {
          const e = this.get("geometry"),
            n = this.getPrivate("series"),
            i = n.chart,
            o = this.dataItem;
          if (e && n && i && o) {
            const r = o.get("lineType", n.get("lineType"));
            let s,
              a,
              l,
              u = J(e),
              c = 0,
              h = 0,
              p = 0,
              f = e.coordinates;
            if (f) {
              let n;
              "LineString" == e.type
                ? (n = [f])
                : "MultiLineString" == e.type && (n = f);
              for (let e = 0; e < n.length; e++) {
                let i = n[e];
                if (i.length > 1) {
                  for (let o = 1; o < i.length; o++)
                    if (
                      ((a = i[o - 1]),
                      (l = i[o]),
                      (h = c / u),
                      (s = q(a, l)),
                      (c += s),
                      (p = c / u),
                      h <= t && p > t)
                    ) {
                      e = n.length;
                      break;
                    }
                } else
                  1 == i.length && ((a = i[0]), (l = i[0]), (h = 0), (p = 1));
              }
              if (a && l) {
                let e,
                  n = (t - h) / (p - h);
                if ("straight" == r) {
                  let t = i.convert({ longitude: a[0], latitude: a[1] }),
                    e = i.convert({ longitude: l[0], latitude: l[1] }),
                    o = t.x + (e.x - t.x) * n,
                    r = t.y + (e.y - t.y) * n;
                  return i.invert({ x: o, y: r });
                }
                return (
                  (e = (function (t, e) {
                    var n = t[0] * v,
                      i = t[1] * v,
                      o = e[0] * v,
                      r = e[1] * v,
                      s = w(i),
                      a = M(i),
                      l = w(r),
                      u = M(r),
                      c = s * w(n),
                      h = s * M(n),
                      p = l * w(o),
                      f = l * M(o),
                      d = 2 * E(j(O(r - i) + s * l * O(o - n))),
                      g = M(d),
                      m = d
                        ? function (t) {
                            var e = M((t *= d)) / g,
                              n = M(d - t) / g,
                              i = n * c + e * p,
                              o = n * h + e * f,
                              r = n * a + e * u;
                            return [P(o, i) * y, P(r, j(i * i + o * o)) * y];
                          }
                        : function () {
                            return [n * y, i * y];
                          };
                    return (m.distance = d), m;
                  })(
                    a,
                    l
                  )(n)),
                  { longitude: e[0], latitude: e[1] }
                );
              }
            }
          }
          return { longitude: 0, latitude: 0 };
        }
      }
      Object.defineProperty(Q, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "MapLine",
      }),
        Object.defineProperty(Q, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: u.T.classNames.concat([Q.className]),
        });
      var K = n(7144),
        tt = n(5769);
      class et extends s {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "mapLines", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: this.addDisposer(
                new K.o(tt.YS.new({}), () =>
                  Q._new(this._root, {}, [this.mapLines.template])
                )
              ),
            }),
            Object.defineProperty(this, "_types", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: ["LineString", "MultiLineString"],
            });
        }
        _afterNew() {
          this.fields.push("lineType"),
            this._setRawDefault("lineTypeField", "lineType"),
            super._afterNew();
        }
        makeMapLine(t) {
          const e = this.children.push(this.mapLines.make());
          return e._setDataItem(t), this.mapLines.push(e), e;
        }
        markDirtyProjection() {
          o.each(this.dataItems, (t) => {
            let e = t.get("mapLine");
            e && e.markDirtyProjection();
          });
        }
        _prepareChildren() {
          super._prepareChildren(),
            this.isDirty("stroke") &&
              this.mapLines.template.set("stroke", this.get("stroke"));
        }
        processDataItem(t) {
          super.processDataItem(t);
          let e = t.get("mapLine");
          e || (e = this.makeMapLine(t)),
            this._handlePointsToConnect(t),
            t.on("pointsToConnect", () => {
              this._handlePointsToConnect(t);
            }),
            t.set("mapLine", e),
            this._addGeometry(t.get("geometry"), this),
            e.setPrivate("series", this);
        }
        _handlePointsToConnect(t) {
          const e = t.get("pointsToConnect");
          e &&
            (o.each(e, (e) => {
              e.on("geometry", () => {
                this.markDirtyValues(t);
              }),
                e.on("longitude", () => {
                  this.markDirtyValues(t);
                }),
                e.on("latitude", () => {
                  this.markDirtyValues(t);
                });
            }),
            this.markDirtyValues(t));
        }
        markDirtyValues(t) {
          if ((super.markDirtyValues(), t)) {
            const e = t.get("mapLine");
            if (e) {
              const n = t.get("pointsToConnect");
              if (n) {
                let i = [];
                o.each(n, (t) => {
                  const e = t.get("longitude"),
                    n = t.get("latitude");
                  if (null != e && null != n) i.push([e, n]);
                  else {
                    const e = t.get("geometry");
                    if (e) {
                      const t = e.coordinates;
                      t && i.push([t[0], t[1]]);
                    }
                  }
                });
                let r = { type: "LineString", coordinates: i };
                t.setRaw("geometry", r), e.set("geometry", r);
              } else e.set("geometry", t.get("geometry"));
            }
          }
        }
        disposeDataItem(t) {
          super.disposeDataItem(t);
          const e = t.get("mapLine");
          e && (this.mapLines.removeValue(e), e.dispose());
        }
        _excludeDataItem(t) {
          super._excludeDataItem(t);
          const e = t.get("mapLine");
          e && e.setPrivate("visible", !1);
        }
        _unexcludeDataItem(t) {
          super._unexcludeDataItem(t);
          const e = t.get("mapLine");
          e && e.setPrivate("visible", !0);
        }
        _notIncludeDataItem(t) {
          super._notIncludeDataItem(t);
          const e = t.get("mapLine");
          e && e.setPrivate("visible", !1);
        }
        _unNotIncludeDataItem(t) {
          super._unNotIncludeDataItem(t);
          const e = t.get("mapLine");
          e && e.setPrivate("visible", !0);
        }
      }
      function nt(t, e, n) {
        (t = +t),
          (e = +e),
          (n =
            (o = arguments.length) < 2
              ? ((e = t), (t = 0), 1)
              : o < 3
              ? 1
              : +n);
        for (
          var i = -1,
            o = 0 | Math.max(0, Math.ceil((e - t) / n)),
            r = new Array(o);
          ++i < o;

        )
          r[i] = t + i * n;
        return r;
      }
      function it(t, e, n) {
        var i = nt(t, e - h, n).concat(e);
        return function (t) {
          return i.map(function (e) {
            return [t, e];
          });
        };
      }
      function ot(t, e, n) {
        var i = nt(t, e - h, n).concat(e);
        return function (t) {
          return i.map(function (e) {
            return [e, t];
          });
        };
      }
      Object.defineProperty(et, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "MapLineSeries",
      }),
        Object.defineProperty(et, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: s.classNames.concat([et.className]),
        });
      class rt extends et {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "_dataItem", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: this.makeDataItem({}),
            });
        }
        _afterNew() {
          super._afterNew(),
            this.dataItems.push(this._dataItem),
            this._generate();
        }
        _updateChildren() {
          if (
            (super._updateChildren(),
            this.isDirty("step") && this._generate(),
            this.isDirty("clipExtent") && this.get("clipExtent"))
          ) {
            const t = this.chart;
            t &&
              t.events.on("geoboundschanged", () => {
                this._generate();
              }),
              this._generate();
          }
        }
        _generate() {
          let t = (function () {
            var t,
              e,
              n,
              i,
              o,
              r,
              s,
              a,
              l,
              u,
              c,
              p,
              f = 10,
              d = f,
              g = 90,
              m = 360,
              y = 2.5;
            function v() {
              return { type: "MultiLineString", coordinates: b() };
            }
            function b() {
              return nt(x(i / g) * g, n, g)
                .map(c)
                .concat(nt(x(a / m) * m, s, m).map(p))
                .concat(
                  nt(x(e / f) * f, t, f)
                    .filter(function (t) {
                      return _(t % g) > h;
                    })
                    .map(l)
                )
                .concat(
                  nt(x(r / d) * d, o, d)
                    .filter(function (t) {
                      return _(t % m) > h;
                    })
                    .map(u)
                );
            }
            return (
              (v.lines = function () {
                return b().map(function (t) {
                  return { type: "LineString", coordinates: t };
                });
              }),
              (v.outline = function () {
                return {
                  type: "Polygon",
                  coordinates: [
                    c(i).concat(
                      p(s).slice(1),
                      c(n).reverse().slice(1),
                      p(a).reverse().slice(1)
                    ),
                  ],
                };
              }),
              (v.extent = function (t) {
                return arguments.length
                  ? v.extentMajor(t).extentMinor(t)
                  : v.extentMinor();
              }),
              (v.extentMajor = function (t) {
                return arguments.length
                  ? ((i = +t[0][0]),
                    (n = +t[1][0]),
                    (a = +t[0][1]),
                    (s = +t[1][1]),
                    i > n && ((t = i), (i = n), (n = t)),
                    a > s && ((t = a), (a = s), (s = t)),
                    v.precision(y))
                  : [
                      [i, a],
                      [n, s],
                    ];
              }),
              (v.extentMinor = function (n) {
                return arguments.length
                  ? ((e = +n[0][0]),
                    (t = +n[1][0]),
                    (r = +n[0][1]),
                    (o = +n[1][1]),
                    e > t && ((n = e), (e = t), (t = n)),
                    r > o && ((n = r), (r = o), (o = n)),
                    v.precision(y))
                  : [
                      [e, r],
                      [t, o],
                    ];
              }),
              (v.step = function (t) {
                return arguments.length
                  ? v.stepMajor(t).stepMinor(t)
                  : v.stepMinor();
              }),
              (v.stepMajor = function (t) {
                return arguments.length
                  ? ((g = +t[0]), (m = +t[1]), v)
                  : [g, m];
              }),
              (v.stepMinor = function (t) {
                return arguments.length
                  ? ((f = +t[0]), (d = +t[1]), v)
                  : [f, d];
              }),
              (v.precision = function (h) {
                return arguments.length
                  ? ((y = +h),
                    (l = it(r, o, 90)),
                    (u = ot(e, t, y)),
                    (c = it(a, s, 90)),
                    (p = ot(i, n, y)),
                    v)
                  : y;
              }),
              v
                .extentMajor([
                  [-180, -90 + h],
                  [180, 90 - h],
                ])
                .extentMinor([
                  [-180, -80 - h],
                  [180, 80 + h],
                ])
            );
          })();
          if (t) {
            if (this.get("clipExtent")) {
              const e = this.chart;
              if (e) {
                const n = e.geoBounds();
                n &&
                  t.extent([
                    [n.left, n.bottom],
                    [n.right, n.top],
                  ]);
              }
            }
            const e = this.get("step", 10);
            t.stepMinor([360, 360]),
              t.stepMajor([e, e]),
              this._dataItem.set("geometry", t());
          }
        }
      }
      Object.defineProperty(rt, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "GraticuleSeries",
      }),
        Object.defineProperty(rt, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: et.classNames.concat([rt.className]),
        });
      var st = n(3409),
        at = n(3783);
      function lt(t, e) {
        function n(n, i) {
          return (n = t(n, i)), e(n[0], n[1]);
        }
        return (
          t.invert &&
            e.invert &&
            (n.invert = function (n, i) {
              return (n = e.invert(n, i)) && t.invert(n[0], n[1]);
            }),
          n
        );
      }
      function ut(t, e) {
        return _(t) > f && (t -= Math.round(t / m) * m), [t, e];
      }
      function ct(t, e, n) {
        return (t %= m)
          ? e || n
            ? lt(pt(t), ft(e, n))
            : pt(t)
          : e || n
          ? ft(e, n)
          : ut;
      }
      function ht(t) {
        return function (e, n) {
          return _((e += t)) > f && (e -= Math.round(e / m) * m), [e, n];
        };
      }
      function pt(t) {
        var e = ht(t);
        return (e.invert = ht(-t)), e;
      }
      function ft(t, e) {
        var n = w(t),
          i = M(t),
          o = w(e),
          r = M(e);
        function s(t, e) {
          var s = w(e),
            a = w(t) * s,
            l = M(t) * s,
            u = M(e),
            c = u * n + a * i;
          return [P(l * o - c * r, a * n - u * i), E(c * o + l * r)];
        }
        return (
          (s.invert = function (t, e) {
            var s = w(e),
              a = w(t) * s,
              l = M(t) * s,
              u = M(e),
              c = u * o - l * r;
            return [P(l * o + u * r, a * n + c * i), E(c * n - a * i)];
          }),
          s
        );
      }
      function dt() {
        var t,
          e = [];
        return {
          point: function (e, n, i) {
            t.push([e, n, i]);
          },
          lineStart: function () {
            e.push((t = []));
          },
          lineEnd: L,
          rejoin: function () {
            e.length > 1 && e.push(e.pop().concat(e.shift()));
          },
          result: function () {
            var n = e;
            return (e = []), (t = null), n;
          },
        };
      }
      function gt(t, e) {
        return _(t[0] - e[0]) < h && _(t[1] - e[1]) < h;
      }
      function mt(t, e, n, i) {
        (this.x = t),
          (this.z = e),
          (this.o = n),
          (this.e = i),
          (this.v = !1),
          (this.n = this.p = null);
      }
      function yt(t, e, n, i, o) {
        var r,
          s,
          a = [],
          l = [];
        if (
          (t.forEach(function (t) {
            if (!((e = t.length - 1) <= 0)) {
              var e,
                n,
                i = t[0],
                s = t[e];
              if (gt(i, s)) {
                if (!i[2] && !s[2]) {
                  for (o.lineStart(), r = 0; r < e; ++r)
                    o.point((i = t[r])[0], i[1]);
                  return void o.lineEnd();
                }
                s[0] += 2 * h;
              }
              a.push((n = new mt(i, t, null, !0))),
                l.push((n.o = new mt(i, null, n, !1))),
                a.push((n = new mt(s, t, null, !1))),
                l.push((n.o = new mt(s, null, n, !0)));
            }
          }),
          a.length)
        ) {
          for (l.sort(e), vt(a), vt(l), r = 0, s = l.length; r < s; ++r)
            l[r].e = n = !n;
          for (var u, c, p = a[0]; ; ) {
            for (var f = p, d = !0; f.v; ) if ((f = f.n) === p) return;
            (u = f.z), o.lineStart();
            do {
              if (((f.v = f.o.v = !0), f.e)) {
                if (d)
                  for (r = 0, s = u.length; r < s; ++r)
                    o.point((c = u[r])[0], c[1]);
                else i(f.x, f.n.x, 1, o);
                f = f.n;
              } else {
                if (d)
                  for (u = f.p.z, r = u.length - 1; r >= 0; --r)
                    o.point((c = u[r])[0], c[1]);
                else i(f.x, f.p.x, -1, o);
                f = f.p;
              }
              (u = (f = f.o).z), (d = !d);
            } while (!f.v);
            o.lineEnd();
          }
        }
      }
      function vt(t) {
        if ((e = t.length)) {
          for (var e, n, i = 0, o = t[0]; ++i < e; )
            (o.n = n = t[i]), (n.p = o), (o = n);
          (o.n = n = t[0]), (n.p = o);
        }
      }
      function _t(t) {
        return [P(t[1], t[0]), E(t[2])];
      }
      function bt(t) {
        var e = t[0],
          n = t[1],
          i = w(n);
        return [i * w(e), i * M(e), M(n)];
      }
      function Pt(t, e) {
        return t[0] * e[0] + t[1] * e[1] + t[2] * e[2];
      }
      function wt(t, e) {
        return [
          t[1] * e[2] - t[2] * e[1],
          t[2] * e[0] - t[0] * e[2],
          t[0] * e[1] - t[1] * e[0],
        ];
      }
      function xt(t, e) {
        (t[0] += e[0]), (t[1] += e[1]), (t[2] += e[2]);
      }
      function Dt(t, e) {
        return [t[0] * e, t[1] * e, t[2] * e];
      }
      function St(t) {
        var e = j(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]);
        (t[0] /= e), (t[1] /= e), (t[2] /= e);
      }
      function It(t) {
        return _(t[0]) <= f ? t[0] : C(t[0]) * (((_(t[0]) + f) % m) - f);
      }
      function Mt(t) {
        return Array.from(
          (function* (t) {
            for (const e of t) yield* e;
          })(t)
        );
      }
      function Ct(t, e, n, i) {
        return function (o) {
          var r,
            s,
            a,
            l = e(o),
            u = dt(),
            y = e(u),
            v = !1,
            _ = {
              point: b,
              lineStart: D,
              lineEnd: S,
              polygonStart: function () {
                (_.point = I),
                  (_.lineStart = C),
                  (_.lineEnd = j),
                  (s = []),
                  (r = []);
              },
              polygonEnd: function () {
                (_.point = b), (_.lineStart = D), (_.lineEnd = S), (s = Mt(s));
                var t = (function (t, e) {
                  var n = It(e),
                    i = e[1],
                    o = M(i),
                    r = [M(n), -w(n), 0],
                    s = 0,
                    a = 0,
                    l = new c();
                  1 === o ? (i = d + h) : -1 === o && (i = -d - h);
                  for (var u = 0, y = t.length; u < y; ++u)
                    if ((_ = (v = t[u]).length))
                      for (
                        var v,
                          _,
                          b = v[_ - 1],
                          x = It(b),
                          D = b[1] / 2 + g,
                          S = M(D),
                          I = w(D),
                          C = 0;
                        C < _;
                        ++C, x = N, S = L, I = T, b = j
                      ) {
                        var j = v[C],
                          N = It(j),
                          O = j[1] / 2 + g,
                          L = M(O),
                          T = w(O),
                          k = N - x,
                          R = k >= 0 ? 1 : -1,
                          z = R * k,
                          G = z > f,
                          B = S * L;
                        if (
                          (l.add(P(B * R * M(z), I * T + B * w(z))),
                          (s += G ? k + R * m : k),
                          G ^ (x >= n) ^ (N >= n))
                        ) {
                          var Y = wt(bt(b), bt(j));
                          St(Y);
                          var X = wt(r, Y);
                          St(X);
                          var Z = (G ^ (k >= 0) ? -1 : 1) * E(X[2]);
                          (i > Z || (i === Z && (Y[0] || Y[1]))) &&
                            (a += G ^ (k >= 0) ? 1 : -1);
                        }
                      }
                  return (s < -h || (s < h && l < -p)) ^ (1 & a);
                })(r, i);
                s.length
                  ? (v || (o.polygonStart(), (v = !0)), yt(s, Nt, t, n, o))
                  : t &&
                    (v || (o.polygonStart(), (v = !0)),
                    o.lineStart(),
                    n(null, null, 1, o),
                    o.lineEnd()),
                  v && (o.polygonEnd(), (v = !1)),
                  (s = r = null);
              },
              sphere: function () {
                o.polygonStart(),
                  o.lineStart(),
                  n(null, null, 1, o),
                  o.lineEnd(),
                  o.polygonEnd();
              },
            };
          function b(e, n) {
            t(e, n) && o.point(e, n);
          }
          function x(t, e) {
            l.point(t, e);
          }
          function D() {
            (_.point = x), l.lineStart();
          }
          function S() {
            (_.point = b), l.lineEnd();
          }
          function I(t, e) {
            a.push([t, e]), y.point(t, e);
          }
          function C() {
            y.lineStart(), (a = []);
          }
          function j() {
            I(a[0][0], a[0][1]), y.lineEnd();
            var t,
              e,
              n,
              i,
              l = y.clean(),
              c = u.result(),
              h = c.length;
            if ((a.pop(), r.push(a), (a = null), h))
              if (1 & l) {
                if ((e = (n = c[0]).length - 1) > 0) {
                  for (
                    v || (o.polygonStart(), (v = !0)), o.lineStart(), t = 0;
                    t < e;
                    ++t
                  )
                    o.point((i = n[t])[0], i[1]);
                  o.lineEnd();
                }
              } else
                h > 1 && 2 & l && c.push(c.pop().concat(c.shift())),
                  s.push(c.filter(jt));
          }
          return _;
        };
      }
      function jt(t) {
        return t.length > 1;
      }
      function Nt(t, e) {
        return (
          ((t = t.x)[0] < 0 ? t[1] - d - h : d - t[1]) -
          ((e = e.x)[0] < 0 ? e[1] - d - h : d - e[1])
        );
      }
      ut.invert = ut;
      var Et = Ct(
        function () {
          return !0;
        },
        function (t) {
          var e,
            n = NaN,
            i = NaN,
            o = NaN;
          return {
            lineStart: function () {
              t.lineStart(), (e = 1);
            },
            point: function (r, s) {
              var a = r > 0 ? f : -f,
                l = _(r - n);
              _(l - f) < h
                ? (t.point(n, (i = (i + s) / 2 > 0 ? d : -d)),
                  t.point(o, i),
                  t.lineEnd(),
                  t.lineStart(),
                  t.point(a, i),
                  t.point(r, i),
                  (e = 0))
                : o !== a &&
                  l >= f &&
                  (_(n - o) < h && (n -= o * h),
                  _(r - a) < h && (r -= a * h),
                  (i = (function (t, e, n, i) {
                    var o,
                      r,
                      s = M(t - n);
                    return _(s) > h
                      ? b(
                          (M(e) * (r = w(i)) * M(n) -
                            M(i) * (o = w(e)) * M(t)) /
                            (o * r * s)
                        )
                      : (e + i) / 2;
                  })(n, i, r, s)),
                  t.point(o, i),
                  t.lineEnd(),
                  t.lineStart(),
                  t.point(a, i),
                  (e = 0)),
                t.point((n = r), (i = s)),
                (o = a);
            },
            lineEnd: function () {
              t.lineEnd(), (n = i = NaN);
            },
            clean: function () {
              return 2 - e;
            },
          };
        },
        function (t, e, n, i) {
          var o;
          if (null == t)
            (o = n * d),
              i.point(-f, o),
              i.point(0, o),
              i.point(f, o),
              i.point(f, 0),
              i.point(f, -o),
              i.point(0, -o),
              i.point(-f, -o),
              i.point(-f, 0),
              i.point(-f, o);
          else if (_(t[0] - e[0]) > h) {
            var r = t[0] < e[0] ? f : -f;
            (o = (n * r) / 2), i.point(-r, o), i.point(0, o), i.point(r, o);
          } else i.point(e[0], e[1]);
        },
        [-f, -d]
      );
      function Ot(t) {
        return function () {
          return t;
        };
      }
      function Lt(t, e, n, i, o, r) {
        if (n) {
          var s = w(e),
            a = M(e),
            l = i * n;
          null == o
            ? ((o = e + i * m), (r = e - l / 2))
            : ((o = Tt(s, o)),
              (r = Tt(s, r)),
              (i > 0 ? o < r : o > r) && (o += i * m));
          for (var u, c = o; i > 0 ? c > r : c < r; c -= l)
            (u = _t([s, -a * w(c), -a * M(c)])), t.point(u[0], u[1]);
        }
      }
      function Tt(t, e) {
        ((e = bt(e))[0] -= t), St(e);
        var n,
          i = (n = -e[1]) > 1 ? 0 : n < -1 ? f : Math.acos(n);
        return ((-e[2] < 0 ? -i : i) + m - h) % m;
      }
      var kt = 1e9,
        Rt = -kt;
      var zt = (t) => t;
      function Gt(t) {
        return function (e) {
          var n = new Bt();
          for (var i in t) n[i] = t[i];
          return (n.stream = e), n;
        };
      }
      function Bt() {}
      Bt.prototype = {
        constructor: Bt,
        point: function (t, e) {
          this.stream.point(t, e);
        },
        sphere: function () {
          this.stream.sphere();
        },
        lineStart: function () {
          this.stream.lineStart();
        },
        lineEnd: function () {
          this.stream.lineEnd();
        },
        polygonStart: function () {
          this.stream.polygonStart();
        },
        polygonEnd: function () {
          this.stream.polygonEnd();
        },
      };
      var Yt = 1 / 0,
        Xt = Yt,
        Zt = -Yt,
        At = Zt,
        Ft = {
          point: function (t, e) {
            t < Yt && (Yt = t),
              t > Zt && (Zt = t),
              e < Xt && (Xt = e),
              e > At && (At = e);
          },
          lineStart: L,
          lineEnd: L,
          polygonStart: L,
          polygonEnd: L,
          result: function () {
            var t = [
              [Yt, Xt],
              [Zt, At],
            ];
            return (Zt = At = -(Xt = Yt = 1 / 0)), t;
          },
        },
        Wt = Ft;
      function Vt(t, e, n) {
        var i = t.clipExtent && t.clipExtent();
        return (
          t.scale(150).translate([0, 0]),
          null != i && t.clipExtent(null),
          A(n, t.stream(Wt)),
          e(Wt.result()),
          null != i && t.clipExtent(i),
          t
        );
      }
      function Ht(t, e, n) {
        return Vt(
          t,
          function (n) {
            var i = e[1][0] - e[0][0],
              o = e[1][1] - e[0][1],
              r = Math.min(i / (n[1][0] - n[0][0]), o / (n[1][1] - n[0][1])),
              s = +e[0][0] + (i - r * (n[1][0] + n[0][0])) / 2,
              a = +e[0][1] + (o - r * (n[1][1] + n[0][1])) / 2;
            t.scale(150 * r).translate([s, a]);
          },
          n
        );
      }
      function Jt(t, e, n) {
        return Ht(t, [[0, 0], e], n);
      }
      function $t(t, e, n) {
        return Vt(
          t,
          function (n) {
            var i = +e,
              o = i / (n[1][0] - n[0][0]),
              r = (i - o * (n[1][0] + n[0][0])) / 2,
              s = -o * n[0][1];
            t.scale(150 * o).translate([r, s]);
          },
          n
        );
      }
      function Ut(t, e, n) {
        return Vt(
          t,
          function (n) {
            var i = +e,
              o = i / (n[1][1] - n[0][1]),
              r = -o * n[0][0],
              s = (i - o * (n[1][1] + n[0][1])) / 2;
            t.scale(150 * o).translate([r, s]);
          },
          n
        );
      }
      var qt = 16,
        Qt = w(30 * v);
      function Kt(t, e) {
        return +e
          ? (function (t, e) {
              function n(i, o, r, s, a, l, u, c, p, f, d, g, m, y) {
                var v = u - i,
                  b = c - o,
                  w = v * v + b * b;
                if (w > 4 * e && m--) {
                  var x = s + f,
                    D = a + d,
                    S = l + g,
                    I = j(x * x + D * D + S * S),
                    M = E((S /= I)),
                    C = _(_(S) - 1) < h || _(r - p) < h ? (r + p) / 2 : P(D, x),
                    N = t(C, M),
                    O = N[0],
                    L = N[1],
                    T = O - i,
                    k = L - o,
                    R = b * T - v * k;
                  ((R * R) / w > e ||
                    _((v * T + b * k) / w - 0.5) > 0.3 ||
                    s * f + a * d + l * g < Qt) &&
                    (n(i, o, r, s, a, l, O, L, C, (x /= I), (D /= I), S, m, y),
                    y.point(O, L),
                    n(O, L, C, x, D, S, u, c, p, f, d, g, m, y));
                }
              }
              return function (e) {
                var i,
                  o,
                  r,
                  s,
                  a,
                  l,
                  u,
                  c,
                  h,
                  p,
                  f,
                  d,
                  g = {
                    point: m,
                    lineStart: y,
                    lineEnd: _,
                    polygonStart: function () {
                      e.polygonStart(), (g.lineStart = b);
                    },
                    polygonEnd: function () {
                      e.polygonEnd(), (g.lineStart = y);
                    },
                  };
                function m(n, i) {
                  (n = t(n, i)), e.point(n[0], n[1]);
                }
                function y() {
                  (c = NaN), (g.point = v), e.lineStart();
                }
                function v(i, o) {
                  var r = bt([i, o]),
                    s = t(i, o);
                  n(
                    c,
                    h,
                    u,
                    p,
                    f,
                    d,
                    (c = s[0]),
                    (h = s[1]),
                    (u = i),
                    (p = r[0]),
                    (f = r[1]),
                    (d = r[2]),
                    qt,
                    e
                  ),
                    e.point(c, h);
                }
                function _() {
                  (g.point = m), e.lineEnd();
                }
                function b() {
                  y(), (g.point = P), (g.lineEnd = w);
                }
                function P(t, e) {
                  v((i = t), e),
                    (o = c),
                    (r = h),
                    (s = p),
                    (a = f),
                    (l = d),
                    (g.point = v);
                }
                function w() {
                  n(c, h, u, p, f, d, o, r, i, s, a, l, qt, e),
                    (g.lineEnd = _),
                    _();
                }
                return g;
              };
            })(t, e)
          : (function (t) {
              return Gt({
                point: function (e, n) {
                  (e = t(e, n)), this.stream.point(e[0], e[1]);
                },
              });
            })(t);
      }
      var te = Gt({
        point: function (t, e) {
          this.stream.point(t * v, e * v);
        },
      });
      function ee(t, e, n, i, o, r) {
        if (!r)
          return (function (t, e, n, i, o) {
            function r(r, s) {
              return [e + t * (r *= i), n - t * (s *= o)];
            }
            return (
              (r.invert = function (r, s) {
                return [((r - e) / t) * i, ((n - s) / t) * o];
              }),
              r
            );
          })(t, e, n, i, o);
        var s = w(r),
          a = M(r),
          l = s * t,
          u = a * t,
          c = s / t,
          h = a / t,
          p = (a * n - s * e) / t,
          f = (a * e + s * n) / t;
        function d(t, r) {
          return [l * (t *= i) - u * (r *= o) + e, n - u * t - l * r];
        }
        return (
          (d.invert = function (t, e) {
            return [i * (c * t - h * e + p), o * (f - h * t - c * e)];
          }),
          d
        );
      }
      function ne(t) {
        return ie(function () {
          return t;
        })();
      }
      function ie(t) {
        var e,
          n,
          i,
          o,
          r,
          s,
          a,
          l,
          u,
          c,
          p = 150,
          d = 480,
          g = 250,
          m = 0,
          b = 0,
          P = 0,
          x = 0,
          D = 0,
          S = 0,
          I = 1,
          M = 1,
          C = null,
          N = Et,
          E = null,
          O = zt,
          L = 0.5;
        function T(t) {
          return l(t[0] * v, t[1] * v);
        }
        function k(t) {
          return (t = l.invert(t[0], t[1])) && [t[0] * y, t[1] * y];
        }
        function R() {
          var t = ee(p, 0, 0, I, M, S).apply(null, e(m, b)),
            i = ee(p, d - t[0], g - t[1], I, M, S);
          return (
            (n = ct(P, x, D)),
            (a = lt(e, i)),
            (l = lt(n, a)),
            (s = Kt(a, L)),
            z()
          );
        }
        function z() {
          return (u = c = null), T;
        }
        return (
          (T.stream = function (t) {
            return u && c === t
              ? u
              : (u = te(
                  (function (t) {
                    return Gt({
                      point: function (e, n) {
                        var i = t(e, n);
                        return this.stream.point(i[0], i[1]);
                      },
                    });
                  })(n)(N(s(O((c = t)))))
                ));
          }),
          (T.preclip = function (t) {
            return arguments.length ? ((N = t), (C = void 0), z()) : N;
          }),
          (T.postclip = function (t) {
            return arguments.length
              ? ((O = t), (E = i = o = r = null), z())
              : O;
          }),
          (T.clipAngle = function (t) {
            return arguments.length
              ? ((N = +t
                  ? (function (t) {
                      var e = w(t),
                        n = 6 * v,
                        i = e > 0,
                        o = _(e) > h;
                      function r(t, n) {
                        return w(t) * w(n) > e;
                      }
                      function s(t, n, i) {
                        var o = [1, 0, 0],
                          r = wt(bt(t), bt(n)),
                          s = Pt(r, r),
                          a = r[0],
                          l = s - a * a;
                        if (!l) return !i && t;
                        var u = (e * s) / l,
                          c = (-e * a) / l,
                          p = wt(o, r),
                          d = Dt(o, u);
                        xt(d, Dt(r, c));
                        var g = p,
                          m = Pt(d, g),
                          y = Pt(g, g),
                          v = m * m - y * (Pt(d, d) - 1);
                        if (!(v < 0)) {
                          var b = j(v),
                            P = Dt(g, (-m - b) / y);
                          if ((xt(P, d), (P = _t(P)), !i)) return P;
                          var w,
                            x = t[0],
                            D = n[0],
                            S = t[1],
                            I = n[1];
                          D < x && ((w = x), (x = D), (D = w));
                          var M = D - x,
                            C = _(M - f) < h;
                          if (
                            (!C && I < S && ((w = S), (S = I), (I = w)),
                            C || M < h
                              ? C
                                ? (S + I > 0) ^
                                  (P[1] < (_(P[0] - x) < h ? S : I))
                                : S <= P[1] && P[1] <= I
                              : (M > f) ^ (x <= P[0] && P[0] <= D))
                          ) {
                            var N = Dt(g, (-m + b) / y);
                            return xt(N, d), [P, _t(N)];
                          }
                        }
                      }
                      function a(e, n) {
                        var o = i ? t : f - t,
                          r = 0;
                        return (
                          e < -o ? (r |= 1) : e > o && (r |= 2),
                          n < -o ? (r |= 4) : n > o && (r |= 8),
                          r
                        );
                      }
                      return Ct(
                        r,
                        function (t) {
                          var e, n, l, u, c;
                          return {
                            lineStart: function () {
                              (u = l = !1), (c = 1);
                            },
                            point: function (h, p) {
                              var d,
                                g = [h, p],
                                m = r(h, p),
                                y = i
                                  ? m
                                    ? 0
                                    : a(h, p)
                                  : m
                                  ? a(h + (h < 0 ? f : -f), p)
                                  : 0;
                              if (
                                (!e && (u = l = m) && t.lineStart(),
                                m !== l &&
                                  (!(d = s(e, g)) || gt(e, d) || gt(g, d)) &&
                                  (g[2] = 1),
                                m !== l)
                              )
                                (c = 0),
                                  m
                                    ? (t.lineStart(),
                                      (d = s(g, e)),
                                      t.point(d[0], d[1]))
                                    : ((d = s(e, g)),
                                      t.point(d[0], d[1], 2),
                                      t.lineEnd()),
                                  (e = d);
                              else if (o && e && i ^ m) {
                                var v;
                                y & n ||
                                  !(v = s(g, e, !0)) ||
                                  ((c = 0),
                                  i
                                    ? (t.lineStart(),
                                      t.point(v[0][0], v[0][1]),
                                      t.point(v[1][0], v[1][1]),
                                      t.lineEnd())
                                    : (t.point(v[1][0], v[1][1]),
                                      t.lineEnd(),
                                      t.lineStart(),
                                      t.point(v[0][0], v[0][1], 3)));
                              }
                              !m || (e && gt(e, g)) || t.point(g[0], g[1]),
                                (e = g),
                                (l = m),
                                (n = y);
                            },
                            lineEnd: function () {
                              l && t.lineEnd(), (e = null);
                            },
                            clean: function () {
                              return c | ((u && l) << 1);
                            },
                          };
                        },
                        function (e, i, o, r) {
                          Lt(r, t, n, o, e, i);
                        },
                        i ? [0, -t] : [-f, t - f]
                      );
                    })((C = t * v))
                  : ((C = null), Et)),
                z())
              : C * y;
          }),
          (T.clipExtent = function (t) {
            return arguments.length
              ? ((O =
                  null == t
                    ? ((E = i = o = r = null), zt)
                    : (function (t, e, n, i) {
                        function o(o, r) {
                          return t <= o && o <= n && e <= r && r <= i;
                        }
                        function r(o, r, a, u) {
                          var c = 0,
                            h = 0;
                          if (
                            null == o ||
                            (c = s(o, a)) !== (h = s(r, a)) ||
                            (l(o, r) < 0) ^ (a > 0)
                          )
                            do {
                              u.point(
                                0 === c || 3 === c ? t : n,
                                c > 1 ? i : e
                              );
                            } while ((c = (c + a + 4) % 4) !== h);
                          else u.point(r[0], r[1]);
                        }
                        function s(i, o) {
                          return _(i[0] - t) < h
                            ? o > 0
                              ? 0
                              : 3
                            : _(i[0] - n) < h
                            ? o > 0
                              ? 2
                              : 1
                            : _(i[1] - e) < h
                            ? o > 0
                              ? 1
                              : 0
                            : o > 0
                            ? 3
                            : 2;
                        }
                        function a(t, e) {
                          return l(t.x, e.x);
                        }
                        function l(t, e) {
                          var n = s(t, 1),
                            i = s(e, 1);
                          return n !== i
                            ? n - i
                            : 0 === n
                            ? e[1] - t[1]
                            : 1 === n
                            ? t[0] - e[0]
                            : 2 === n
                            ? t[1] - e[1]
                            : e[0] - t[0];
                        }
                        return function (s) {
                          var l,
                            u,
                            c,
                            h,
                            p,
                            f,
                            d,
                            g,
                            m,
                            y,
                            v,
                            _ = s,
                            b = dt(),
                            P = {
                              point: w,
                              lineStart: function () {
                                (P.point = x),
                                  u && u.push((c = [])),
                                  (y = !0),
                                  (m = !1),
                                  (d = g = NaN);
                              },
                              lineEnd: function () {
                                l &&
                                  (x(h, p),
                                  f && m && b.rejoin(),
                                  l.push(b.result())),
                                  (P.point = w),
                                  m && _.lineEnd();
                              },
                              polygonStart: function () {
                                (_ = b), (l = []), (u = []), (v = !0);
                              },
                              polygonEnd: function () {
                                var e = (function () {
                                    for (
                                      var e = 0, n = 0, o = u.length;
                                      n < o;
                                      ++n
                                    )
                                      for (
                                        var r,
                                          s,
                                          a = u[n],
                                          l = 1,
                                          c = a.length,
                                          h = a[0],
                                          p = h[0],
                                          f = h[1];
                                        l < c;
                                        ++l
                                      )
                                        (r = p),
                                          (s = f),
                                          (p = (h = a[l])[0]),
                                          (f = h[1]),
                                          s <= i
                                            ? f > i &&
                                              (p - r) * (i - s) >
                                                (f - s) * (t - r) &&
                                              ++e
                                            : f <= i &&
                                              (p - r) * (i - s) <
                                                (f - s) * (t - r) &&
                                              --e;
                                    return e;
                                  })(),
                                  n = v && e,
                                  o = (l = Mt(l)).length;
                                (n || o) &&
                                  (s.polygonStart(),
                                  n &&
                                    (s.lineStart(),
                                    r(null, null, 1, s),
                                    s.lineEnd()),
                                  o && yt(l, a, e, r, s),
                                  s.polygonEnd()),
                                  (_ = s),
                                  (l = u = c = null);
                              },
                            };
                          function w(t, e) {
                            o(t, e) && _.point(t, e);
                          }
                          function x(r, s) {
                            var a = o(r, s);
                            if ((u && c.push([r, s]), y))
                              (h = r),
                                (p = s),
                                (f = a),
                                (y = !1),
                                a && (_.lineStart(), _.point(r, s));
                            else if (a && m) _.point(r, s);
                            else {
                              var l = [
                                  (d = Math.max(Rt, Math.min(kt, d))),
                                  (g = Math.max(Rt, Math.min(kt, g))),
                                ],
                                b = [
                                  (r = Math.max(Rt, Math.min(kt, r))),
                                  (s = Math.max(Rt, Math.min(kt, s))),
                                ];
                              !(function (t, e, n, i, o, r) {
                                var s,
                                  a = t[0],
                                  l = t[1],
                                  u = 0,
                                  c = 1,
                                  h = e[0] - a,
                                  p = e[1] - l;
                                if (((s = n - a), h || !(s > 0))) {
                                  if (((s /= h), h < 0)) {
                                    if (s < u) return;
                                    s < c && (c = s);
                                  } else if (h > 0) {
                                    if (s > c) return;
                                    s > u && (u = s);
                                  }
                                  if (((s = o - a), h || !(s < 0))) {
                                    if (((s /= h), h < 0)) {
                                      if (s > c) return;
                                      s > u && (u = s);
                                    } else if (h > 0) {
                                      if (s < u) return;
                                      s < c && (c = s);
                                    }
                                    if (((s = i - l), p || !(s > 0))) {
                                      if (((s /= p), p < 0)) {
                                        if (s < u) return;
                                        s < c && (c = s);
                                      } else if (p > 0) {
                                        if (s > c) return;
                                        s > u && (u = s);
                                      }
                                      if (((s = r - l), p || !(s < 0))) {
                                        if (((s /= p), p < 0)) {
                                          if (s > c) return;
                                          s > u && (u = s);
                                        } else if (p > 0) {
                                          if (s < u) return;
                                          s < c && (c = s);
                                        }
                                        return (
                                          u > 0 &&
                                            ((t[0] = a + u * h),
                                            (t[1] = l + u * p)),
                                          c < 1 &&
                                            ((e[0] = a + c * h),
                                            (e[1] = l + c * p)),
                                          !0
                                        );
                                      }
                                    }
                                  }
                                }
                              })(l, b, t, e, n, i)
                                ? a && (_.lineStart(), _.point(r, s), (v = !1))
                                : (m || (_.lineStart(), _.point(l[0], l[1])),
                                  _.point(b[0], b[1]),
                                  a || _.lineEnd(),
                                  (v = !1));
                            }
                            (d = r), (g = s), (m = a);
                          }
                          return P;
                        };
                      })(
                        (E = +t[0][0]),
                        (i = +t[0][1]),
                        (o = +t[1][0]),
                        (r = +t[1][1])
                      )),
                z())
              : null == E
              ? null
              : [
                  [E, i],
                  [o, r],
                ];
          }),
          (T.scale = function (t) {
            return arguments.length ? ((p = +t), R()) : p;
          }),
          (T.translate = function (t) {
            return arguments.length ? ((d = +t[0]), (g = +t[1]), R()) : [d, g];
          }),
          (T.center = function (t) {
            return arguments.length
              ? ((m = (t[0] % 360) * v), (b = (t[1] % 360) * v), R())
              : [m * y, b * y];
          }),
          (T.rotate = function (t) {
            return arguments.length
              ? ((P = (t[0] % 360) * v),
                (x = (t[1] % 360) * v),
                (D = t.length > 2 ? (t[2] % 360) * v : 0),
                R())
              : [P * y, x * y, D * y];
          }),
          (T.angle = function (t) {
            return arguments.length ? ((S = (t % 360) * v), R()) : S * y;
          }),
          (T.reflectX = function (t) {
            return arguments.length ? ((I = t ? -1 : 1), R()) : I < 0;
          }),
          (T.reflectY = function (t) {
            return arguments.length ? ((M = t ? -1 : 1), R()) : M < 0;
          }),
          (T.precision = function (t) {
            return arguments.length ? ((s = Kt(a, (L = t * t))), z()) : j(L);
          }),
          (T.fitExtent = function (t, e) {
            return Ht(T, t, e);
          }),
          (T.fitSize = function (t, e) {
            return Jt(T, t, e);
          }),
          (T.fitWidth = function (t, e) {
            return $t(T, t, e);
          }),
          (T.fitHeight = function (t, e) {
            return Ut(T, t, e);
          }),
          function () {
            return (
              (e = t.apply(this, arguments)), (T.invert = e.invert && k), R()
            );
          }
        );
      }
      function oe(t, e) {
        return [t, I(N((d + e) / 2))];
      }
      function re() {
        return (function (t) {
          var e,
            n,
            i,
            o = ne(t),
            r = o.center,
            s = o.scale,
            a = o.translate,
            l = o.clipExtent,
            u = null;
          function c() {
            var r = f * s(),
              a = o(
                (function (t) {
                  function e(e) {
                    return (
                      ((e = t(e[0] * v, e[1] * v))[0] *= y), (e[1] *= y), e
                    );
                  }
                  return (
                    (t = ct(t[0] * v, t[1] * v, t.length > 2 ? t[2] * v : 0)),
                    (e.invert = function (e) {
                      return (
                        ((e = t.invert(e[0] * v, e[1] * v))[0] *= y),
                        (e[1] *= y),
                        e
                      );
                    }),
                    e
                  );
                })(o.rotate()).invert([0, 0])
              );
            return l(
              null == u
                ? [
                    [a[0] - r, a[1] - r],
                    [a[0] + r, a[1] + r],
                  ]
                : t === oe
                ? [
                    [Math.max(a[0] - r, u), e],
                    [Math.min(a[0] + r, n), i],
                  ]
                : [
                    [u, Math.max(a[1] - r, e)],
                    [n, Math.min(a[1] + r, i)],
                  ]
            );
          }
          return (
            (o.scale = function (t) {
              return arguments.length ? (s(t), c()) : s();
            }),
            (o.translate = function (t) {
              return arguments.length ? (a(t), c()) : a();
            }),
            (o.center = function (t) {
              return arguments.length ? (r(t), c()) : r();
            }),
            (o.clipExtent = function (t) {
              return arguments.length
                ? (null == t
                    ? (u = e = n = i = null)
                    : ((u = +t[0][0]),
                      (e = +t[0][1]),
                      (n = +t[1][0]),
                      (i = +t[1][1])),
                  c())
                : null == u
                ? null
                : [
                    [u, e],
                    [n, i],
                  ];
            }),
            c()
          );
        })(oe).scale(961 / m);
      }
      oe.invert = function (t, e) {
        return [t, 2 * b(D(e)) - d];
      };
      var se = n(9395);
      class ae extends st.Q {
        setupDefaultRules() {
          super.setupDefaultRules();
          const t = this._root.interfaceColors,
            e = this.rule.bind(this);
          e("MapChart").setAll({
            projection: re(),
            panX: "translateX",
            panY: "translateY",
            pinchZoom: !0,
            zoomStep: 2,
            zoomLevel: 1,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            maxZoomLevel: 32,
            minZoomLevel: 1,
            wheelY: "zoom",
            wheelX: "none",
            animationEasing: se.out(se.cubic),
            wheelEasing: se.out(se.cubic),
            wheelDuration: 0,
            wheelSensitivity: 1,
            maxPanOut: 0.4,
            centerMapOnZoomOut: !0,
          });
          {
            const n = e("MapLine");
            n.setAll({ precision: 0.5, role: "figure" }),
              (0, at.v)(n, "stroke", t, "grid");
          }
          e("MapPolygonSeries").setAll({ affectsBounds: !0 }),
            e("MapPointSeries").setAll({
              affectsBounds: !1,
              clipFront: !1,
              clipBack: !0,
              autoScale: !1,
            }),
            e("ClusteredPointSeries").setAll({
              minDistance: 20,
              scatterDistance: 3,
              scatterRadius: 8,
              stopClusterZoom: 0.95,
            }),
            e("MapLineSeries").setAll({ affectsBounds: !1 });
          {
            const n = e("MapPolygon");
            n.setAll({
              precision: 0.5,
              isMeasured: !1,
              role: "figure",
              fillOpacity: 1,
              position: "absolute",
              strokeWidth: 0.2,
              strokeOpacity: 1,
            }),
              (0, at.v)(n, "fill", t, "primaryButton"),
              (0, at.v)(n, "stroke", t, "background");
          }
          e("Button", ["zoomtools", "home"]).setAll({ visible: !1 }),
            e("GraticuleSeries").setAll({ step: 10 });
        }
      }
      var le,
        ue,
        ce,
        he,
        pe = n(5829),
        fe = n(7142),
        de = new c(),
        ge = new c(),
        me = {
          point: L,
          lineStart: L,
          lineEnd: L,
          polygonStart: function () {
            (me.lineStart = ye), (me.lineEnd = be);
          },
          polygonEnd: function () {
            (me.lineStart = me.lineEnd = me.point = L),
              de.add(_(ge)),
              (ge = new c());
          },
          result: function () {
            var t = de / 2;
            return (de = new c()), t;
          },
        };
      function ye() {
        me.point = ve;
      }
      function ve(t, e) {
        (me.point = _e), (le = ce = t), (ue = he = e);
      }
      function _e(t, e) {
        ge.add(he * t - ce * e), (ce = t), (he = e);
      }
      function be() {
        _e(le, ue);
      }
      var Pe,
        we,
        xe,
        De,
        Se = me,
        Ie = 0,
        Me = 0,
        Ce = 0,
        je = 0,
        Ne = 0,
        Ee = 0,
        Oe = 0,
        Le = 0,
        Te = 0,
        ke = {
          point: Re,
          lineStart: ze,
          lineEnd: Ye,
          polygonStart: function () {
            (ke.lineStart = Xe), (ke.lineEnd = Ze);
          },
          polygonEnd: function () {
            (ke.point = Re), (ke.lineStart = ze), (ke.lineEnd = Ye);
          },
          result: function () {
            var t = Te
              ? [Oe / Te, Le / Te]
              : Ee
              ? [je / Ee, Ne / Ee]
              : Ce
              ? [Ie / Ce, Me / Ce]
              : [NaN, NaN];
            return (Ie = Me = Ce = je = Ne = Ee = Oe = Le = Te = 0), t;
          },
        };
      function Re(t, e) {
        (Ie += t), (Me += e), ++Ce;
      }
      function ze() {
        ke.point = Ge;
      }
      function Ge(t, e) {
        (ke.point = Be), Re((xe = t), (De = e));
      }
      function Be(t, e) {
        var n = t - xe,
          i = e - De,
          o = j(n * n + i * i);
        (je += (o * (xe + t)) / 2),
          (Ne += (o * (De + e)) / 2),
          (Ee += o),
          Re((xe = t), (De = e));
      }
      function Ye() {
        ke.point = Re;
      }
      function Xe() {
        ke.point = Ae;
      }
      function Ze() {
        Fe(Pe, we);
      }
      function Ae(t, e) {
        (ke.point = Fe), Re((Pe = xe = t), (we = De = e));
      }
      function Fe(t, e) {
        var n = t - xe,
          i = e - De,
          o = j(n * n + i * i);
        (je += (o * (xe + t)) / 2),
          (Ne += (o * (De + e)) / 2),
          (Ee += o),
          (Oe += (o = De * t - xe * e) * (xe + t)),
          (Le += o * (De + e)),
          (Te += 3 * o),
          Re((xe = t), (De = e));
      }
      var We = ke;
      function Ve(t) {
        this._context = t;
      }
      Ve.prototype = {
        _radius: 4.5,
        pointRadius: function (t) {
          return (this._radius = t), this;
        },
        polygonStart: function () {
          this._line = 0;
        },
        polygonEnd: function () {
          this._line = NaN;
        },
        lineStart: function () {
          this._point = 0;
        },
        lineEnd: function () {
          0 === this._line && this._context.closePath(), (this._point = NaN);
        },
        point: function (t, e) {
          switch (this._point) {
            case 0:
              this._context.moveTo(t, e), (this._point = 1);
              break;
            case 1:
              this._context.lineTo(t, e);
              break;
            default:
              this._context.moveTo(t + this._radius, e),
                this._context.arc(t, e, this._radius, 0, m);
          }
        },
        result: L,
      };
      var He,
        Je,
        $e,
        Ue,
        qe,
        Qe = new c(),
        Ke = {
          point: L,
          lineStart: function () {
            Ke.point = tn;
          },
          lineEnd: function () {
            He && en(Je, $e), (Ke.point = L);
          },
          polygonStart: function () {
            He = !0;
          },
          polygonEnd: function () {
            He = null;
          },
          result: function () {
            var t = +Qe;
            return (Qe = new c()), t;
          },
        };
      function tn(t, e) {
        (Ke.point = en), (Je = Ue = t), ($e = qe = e);
      }
      function en(t, e) {
        (Ue -= t), (qe -= e), Qe.add(j(Ue * Ue + qe * qe)), (Ue = t), (qe = e);
      }
      var nn = Ke;
      let on, rn, sn, an;
      class ln {
        constructor(t) {
          (this._append =
            null == t
              ? un
              : (function (t) {
                  const e = Math.floor(t);
                  if (!(e >= 0)) throw new RangeError(`invalid digits: ${t}`);
                  if (e > 15) return un;
                  if (e !== on) {
                    const t = 10 ** e;
                    (on = e),
                      (rn = function (e) {
                        let n = 1;
                        this._ += e[0];
                        for (const i = e.length; n < i; ++n)
                          this._ += Math.round(arguments[n] * t) / t + e[n];
                      });
                  }
                  return rn;
                })(t)),
            (this._radius = 4.5),
            (this._ = "");
        }
        pointRadius(t) {
          return (this._radius = +t), this;
        }
        polygonStart() {
          this._line = 0;
        }
        polygonEnd() {
          this._line = NaN;
        }
        lineStart() {
          this._point = 0;
        }
        lineEnd() {
          0 === this._line && (this._ += "Z"), (this._point = NaN);
        }
        point(t, e) {
          switch (this._point) {
            case 0:
              this._append`M${t},${e}`, (this._point = 1);
              break;
            case 1:
              this._append`L${t},${e}`;
              break;
            default:
              if (
                (this._append`M${t},${e}`,
                this._radius !== sn || this._append !== rn)
              ) {
                const t = this._radius,
                  e = this._;
                (this._ = ""),
                  this._append`m0,${t}a${t},${t} 0 1,1 0,${
                    -2 * t
                  }a${t},${t} 0 1,1 0,${2 * t}z`,
                  (sn = t),
                  (rn = this._append),
                  (an = this._),
                  (this._ = e);
              }
              this._ += an;
          }
        }
        result() {
          const t = this._;
          return (this._ = ""), t.length ? t : null;
        }
      }
      function un(t) {
        let e = 1;
        this._ += t[0];
        for (const n = t.length; e < n; ++e) this._ += arguments[e] + t[e];
      }
      var cn,
        hn,
        pn,
        fn,
        dn,
        gn,
        mn,
        yn,
        vn,
        _n,
        bn,
        Pn,
        wn,
        xn,
        Dn,
        Sn,
        In = n(1112),
        Mn = n(3145),
        Cn = n(751),
        jn = {
          sphere: L,
          point: Nn,
          lineStart: On,
          lineEnd: kn,
          polygonStart: function () {
            (jn.lineStart = Rn), (jn.lineEnd = zn);
          },
          polygonEnd: function () {
            (jn.lineStart = On), (jn.lineEnd = kn);
          },
        };
      function Nn(t, e) {
        t *= v;
        var n = w((e *= v));
        En(n * w(t), n * M(t), M(e));
      }
      function En(t, e, n) {
        ++cn,
          (pn += (t - pn) / cn),
          (fn += (e - fn) / cn),
          (dn += (n - dn) / cn);
      }
      function On() {
        jn.point = Ln;
      }
      function Ln(t, e) {
        t *= v;
        var n = w((e *= v));
        (xn = n * w(t)),
          (Dn = n * M(t)),
          (Sn = M(e)),
          (jn.point = Tn),
          En(xn, Dn, Sn);
      }
      function Tn(t, e) {
        t *= v;
        var n = w((e *= v)),
          i = n * w(t),
          o = n * M(t),
          r = M(e),
          s = P(
            j(
              (s = Dn * r - Sn * o) * s +
                (s = Sn * i - xn * r) * s +
                (s = xn * o - Dn * i) * s
            ),
            xn * i + Dn * o + Sn * r
          );
        (hn += s),
          (gn += s * (xn + (xn = i))),
          (mn += s * (Dn + (Dn = o))),
          (yn += s * (Sn + (Sn = r))),
          En(xn, Dn, Sn);
      }
      function kn() {
        jn.point = Nn;
      }
      function Rn() {
        jn.point = Gn;
      }
      function zn() {
        Bn(Pn, wn), (jn.point = Nn);
      }
      function Gn(t, e) {
        (Pn = t), (wn = e), (t *= v), (e *= v), (jn.point = Bn);
        var n = w(e);
        (xn = n * w(t)), (Dn = n * M(t)), (Sn = M(e)), En(xn, Dn, Sn);
      }
      function Bn(t, e) {
        t *= v;
        var n = w((e *= v)),
          i = n * w(t),
          o = n * M(t),
          r = M(e),
          s = Dn * r - Sn * o,
          a = Sn * i - xn * r,
          l = xn * o - Dn * i,
          u = S(s, a, l),
          c = E(u),
          h = u && -c / u;
        vn.add(h * s),
          _n.add(h * a),
          bn.add(h * l),
          (hn += c),
          (gn += c * (xn + (xn = i))),
          (mn += c * (Dn + (Dn = o))),
          (yn += c * (Sn + (Sn = r))),
          En(xn, Dn, Sn);
      }
      var Yn,
        Xn,
        Zn,
        An,
        Fn,
        Wn,
        Vn,
        Hn,
        Jn,
        $n,
        Un,
        qn,
        Qn,
        Kn,
        ti,
        ei,
        ni = new c(),
        ii = new c(),
        oi = {
          point: L,
          lineStart: L,
          lineEnd: L,
          polygonStart: function () {
            (ni = new c()), (oi.lineStart = ri), (oi.lineEnd = si);
          },
          polygonEnd: function () {
            var t = +ni;
            ii.add(t < 0 ? m + t : t),
              (this.lineStart = this.lineEnd = this.point = L);
          },
          sphere: function () {
            ii.add(m);
          },
        };
      function ri() {
        oi.point = ai;
      }
      function si() {
        li(Yn, Xn);
      }
      function ai(t, e) {
        (oi.point = li),
          (Yn = t),
          (Xn = e),
          (Zn = t *= v),
          (An = w((e = (e *= v) / 2 + g))),
          (Fn = M(e));
      }
      function li(t, e) {
        var n = (t *= v) - Zn,
          i = n >= 0 ? 1 : -1,
          o = i * n,
          r = w((e = (e *= v) / 2 + g)),
          s = M(e),
          a = Fn * s,
          l = An * r + a * w(o),
          u = a * i * M(o);
        ni.add(P(u, l)), (Zn = t), (An = r), (Fn = s);
      }
      function ui(t) {
        return (ii = new c()), A(t, oi), 2 * ii;
      }
      var ci = {
        point: hi,
        lineStart: fi,
        lineEnd: di,
        polygonStart: function () {
          (ci.point = gi),
            (ci.lineStart = mi),
            (ci.lineEnd = yi),
            (Kn = new c()),
            oi.polygonStart();
        },
        polygonEnd: function () {
          oi.polygonEnd(),
            (ci.point = hi),
            (ci.lineStart = fi),
            (ci.lineEnd = di),
            ni < 0
              ? ((Wn = -(Hn = 180)), (Vn = -(Jn = 90)))
              : Kn > h
              ? (Jn = 90)
              : Kn < -h && (Vn = -90),
            (ei[0] = Wn),
            (ei[1] = Hn);
        },
        sphere: function () {
          (Wn = -(Hn = 180)), (Vn = -(Jn = 90));
        },
      };
      function hi(t, e) {
        ti.push((ei = [(Wn = t), (Hn = t)])),
          e < Vn && (Vn = e),
          e > Jn && (Jn = e);
      }
      function pi(t, e) {
        var n = bt([t * v, e * v]);
        if (Qn) {
          var i = wt(Qn, n),
            o = wt([i[1], -i[0], 0], i);
          St(o), (o = _t(o));
          var r,
            s = t - $n,
            a = s > 0 ? 1 : -1,
            l = o[0] * y * a,
            u = _(s) > 180;
          u ^ (a * $n < l && l < a * t)
            ? (r = o[1] * y) > Jn && (Jn = r)
            : u ^ (a * $n < (l = ((l + 360) % 360) - 180) && l < a * t)
            ? (r = -o[1] * y) < Vn && (Vn = r)
            : (e < Vn && (Vn = e), e > Jn && (Jn = e)),
            u
              ? t < $n
                ? vi(Wn, t) > vi(Wn, Hn) && (Hn = t)
                : vi(t, Hn) > vi(Wn, Hn) && (Wn = t)
              : Hn >= Wn
              ? (t < Wn && (Wn = t), t > Hn && (Hn = t))
              : t > $n
              ? vi(Wn, t) > vi(Wn, Hn) && (Hn = t)
              : vi(t, Hn) > vi(Wn, Hn) && (Wn = t);
        } else ti.push((ei = [(Wn = t), (Hn = t)]));
        e < Vn && (Vn = e), e > Jn && (Jn = e), (Qn = n), ($n = t);
      }
      function fi() {
        ci.point = pi;
      }
      function di() {
        (ei[0] = Wn), (ei[1] = Hn), (ci.point = hi), (Qn = null);
      }
      function gi(t, e) {
        if (Qn) {
          var n = t - $n;
          Kn.add(_(n) > 180 ? n + (n > 0 ? 360 : -360) : n);
        } else (Un = t), (qn = e);
        oi.point(t, e), pi(t, e);
      }
      function mi() {
        oi.lineStart();
      }
      function yi() {
        gi(Un, qn),
          oi.lineEnd(),
          _(Kn) > h && (Wn = -(Hn = 180)),
          (ei[0] = Wn),
          (ei[1] = Hn),
          (Qn = null);
      }
      function vi(t, e) {
        return (e -= t) < 0 ? e + 360 : e;
      }
      function _i(t, e) {
        return t[0] - e[0];
      }
      function bi(t, e) {
        return t[0] <= t[1] ? t[0] <= e && e <= t[1] : e < t[0] || t[1] < e;
      }
      function Pi(t, e) {
        return (function () {
          var t,
            e,
            n = Ot([0, 0]),
            i = Ot(90),
            o = Ot(6),
            r = {
              point: function (n, i) {
                t.push((n = e(n, i))), (n[0] *= y), (n[1] *= y);
              },
            };
          function s() {
            var s = n.apply(this, arguments),
              a = i.apply(this, arguments) * v,
              l = o.apply(this, arguments) * v;
            return (
              (t = []),
              (e = ct(-s[0] * v, -s[1] * v, 0).invert),
              Lt(r, a, l, 1),
              (s = { type: "Polygon", coordinates: [t] }),
              (t = e = null),
              s
            );
          }
          return (
            (s.center = function (t) {
              return arguments.length
                ? ((n = "function" == typeof t ? t : Ot([+t[0], +t[1]])), s)
                : n;
            }),
            (s.radius = function (t) {
              return arguments.length
                ? ((i = "function" == typeof t ? t : Ot(+t)), s)
                : i;
            }),
            (s.precision = function (t) {
              return arguments.length
                ? ((o = "function" == typeof t ? t : Ot(+t)), s)
                : o;
            }),
            s
          );
        })()
          .center([t.longitude, t.latitude])
          .radius(e)();
      }
      function wi(t) {
        const e = (function (t) {
          (cn = hn = pn = fn = dn = gn = mn = yn = 0),
            (vn = new c()),
            (_n = new c()),
            (bn = new c()),
            A(t, jn);
          var e = +vn,
            n = +_n,
            i = +bn,
            o = S(e, n, i);
          return o < p &&
            ((e = gn),
            (n = mn),
            (i = yn),
            hn < h && ((e = pn), (n = fn), (i = dn)),
            (o = S(e, n, i)) < p)
            ? [NaN, NaN]
            : [P(n, e) * y, E(i / o) * y];
        })(t);
        return { longitude: e[0], latitude: e[1] };
      }
      function xi(t) {
        return ui(t);
      }
      function Di(t) {
        const e = (function (t) {
          var e, n, i, o, r, s, a;
          if (
            ((Jn = Hn = -(Wn = Vn = 1 / 0)),
            (ti = []),
            A(t, ci),
            (n = ti.length))
          ) {
            for (ti.sort(_i), e = 1, r = [(i = ti[0])]; e < n; ++e)
              bi(i, (o = ti[e])[0]) || bi(i, o[1])
                ? (vi(i[0], o[1]) > vi(i[0], i[1]) && (i[1] = o[1]),
                  vi(o[0], i[1]) > vi(i[0], i[1]) && (i[0] = o[0]))
                : r.push((i = o));
            for (
              s = -1 / 0, e = 0, i = r[(n = r.length - 1)];
              e <= n;
              i = o, ++e
            )
              (o = r[e]),
                (a = vi(i[1], o[0])) > s && ((s = a), (Wn = o[0]), (Hn = i[1]));
          }
          return (
            (ti = ei = null),
            Wn === 1 / 0 || Vn === 1 / 0
              ? [
                  [NaN, NaN],
                  [NaN, NaN],
                ]
              : [
                  [Wn, Vn],
                  [Hn, Jn],
                ]
          );
        })(t);
        if (e) {
          const t = {
            left: e[0][0],
            right: e[1][0],
            top: e[1][1],
            bottom: e[0][1],
          };
          return t.right < t.left && ((t.right = 180), (t.left = -180)), t;
        }
        return { left: 0, right: 0, top: 0, bottom: 0 };
      }
      function Si(t, e, n, i) {
        let o = [];
        i <= -180 && (i = -179.9999),
          n <= -90 && (n = -89.9999),
          t >= 90 && (t = 89.9999),
          e >= 180 && (e = 179.9999);
        let r = Math.min(90, (e - i) / Math.ceil((e - i) / 90)),
          s = (t - n) / Math.ceil((t - n) / 90);
        for (let a = i; a < e; a += r) {
          let i = [];
          o.push([i]), a + r > e && (r = e - a);
          for (let e = a; e <= a + r; e += 5) i.push([e, t]);
          for (let e = t; e >= n; e -= s) i.push([a + r, e]);
          for (let t = a + r; t >= a; t -= 5) i.push([t, n]);
          for (let e = n; e <= t; e += s) i.push([a, e]);
        }
        return { type: "MultiPolygon", coordinates: o };
      }
      function Ii(t) {
        let e = Mi(t.longitude),
          n = Math.asin(Math.sin(t.latitude * Cn.RADIANS)) * Cn.DEGREES,
          i = Mi(t.latitude);
        return (
          Math.abs(i) > 90 && (e = Mi(e + 180)),
          (t.longitude = e),
          (t.latitude = n),
          t
        );
      }
      function Mi(t) {
        return (t %= 360) > 180 && (t -= 360), t < -180 && (t += 360), t;
      }
      var Ci = n(7652);
      class ji extends pe.j {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "_downTranslateX", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_downTranslateY", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_downRotationX", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_downRotationY", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_downRotationZ", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_pLat", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            }),
            Object.defineProperty(this, "_pLon", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            }),
            Object.defineProperty(this, "_movePoints", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: {},
            }),
            Object.defineProperty(this, "_downZoomLevel", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 1,
            }),
            Object.defineProperty(this, "_doubleDownDistance", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            }),
            Object.defineProperty(this, "_dirtyGeometries", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: !1,
            }),
            Object.defineProperty(this, "_geometryColection", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: { type: "GeometryCollection", geometries: [] },
            }),
            Object.defineProperty(this, "_centerLocation", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: null,
            }),
            Object.defineProperty(this, "_za", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_rxa", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_rya", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_txa", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_tya", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_mapBounds", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [
                [0, 0],
                [0, 0],
              ],
            }),
            Object.defineProperty(this, "_geoCentroid", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: { longitude: 0, latitude: 0 },
            }),
            Object.defineProperty(this, "_geoBounds", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: { left: 0, right: 0, top: 0, bottom: 0 },
            }),
            Object.defineProperty(this, "_prevGeoBounds", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: { left: 0, right: 0, top: 0, bottom: 0 },
            }),
            Object.defineProperty(this, "_dispatchBounds", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: !1,
            }),
            Object.defineProperty(this, "_wheelDp", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_pw", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_ph", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_mapFitted", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: !1,
            }),
            Object.defineProperty(this, "_centerX", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            }),
            Object.defineProperty(this, "_centerY", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            });
        }
        _makeGeoPath() {
          const t = this.get("projection"),
            e = (function (t, e) {
              let n,
                i,
                o = 3,
                r = 4.5;
              function s(t) {
                return (
                  t &&
                    ("function" == typeof r &&
                      i.pointRadius(+r.apply(this, arguments)),
                    A(t, n(i))),
                  i.result()
                );
              }
              return (
                (s.area = function (t) {
                  return A(t, n(Se)), Se.result();
                }),
                (s.measure = function (t) {
                  return A(t, n(nn)), nn.result();
                }),
                (s.bounds = function (t) {
                  return A(t, n(Wt)), Wt.result();
                }),
                (s.centroid = function (t) {
                  return A(t, n(We)), We.result();
                }),
                (s.projection = function (e) {
                  return arguments.length
                    ? ((n = null == e ? ((t = null), zt) : (t = e).stream), s)
                    : t;
                }),
                (s.context = function (t) {
                  return arguments.length
                    ? ((i =
                        null == t ? ((e = null), new ln(o)) : new Ve((e = t))),
                      "function" != typeof r && i.pointRadius(r),
                      s)
                    : e;
                }),
                (s.pointRadius = function (t) {
                  return arguments.length
                    ? ((r =
                        "function" == typeof t ? t : (i.pointRadius(+t), +t)),
                      s)
                    : r;
                }),
                (s.digits = function (t) {
                  if (!arguments.length) return o;
                  if (null == t) o = null;
                  else {
                    const e = Math.floor(t);
                    if (!(e >= 0)) throw new RangeError(`invalid digits: ${t}`);
                    o = e;
                  }
                  return null === e && (i = new ln(o)), s;
                }),
                s.projection(t).digits(o).context(e)
              );
            })();
          e.projection(t), this.setPrivateRaw("geoPath", e);
        }
        geoPoint() {
          return this.invert(
            this.seriesContainer.toGlobal({
              x: this.width() / 2,
              y: this.height() / 2,
            })
          );
        }
        geoCentroid() {
          return this._geoCentroid;
        }
        geoBounds() {
          return this._geoBounds;
        }
        _handleSetWheel() {
          const t = this.get("wheelX"),
            e = this.get("wheelY"),
            n = this.chartContainer;
          "none" != t || "none" != e
            ? (this._wheelDp && this._wheelDp.dispose(),
              (this._wheelDp = n.events.on("wheel", (i) => {
                const o = this.get("wheelEasing"),
                  r = this.get("wheelSensitivity", 1),
                  s = this.get("wheelDuration", 0),
                  a = i.originalEvent;
                let l = !1;
                if (!Ci.isLocalEvent(a, this)) return;
                l = !0;
                const u = n._display.toLocal(i.point);
                if ("zoom" == e) {
                  if (
                    this.get("zoomLevel") == this.get("minZoomLevel", 1) &&
                    a.deltaY > 0
                  )
                    return;
                  this._handleWheelZoom(a.deltaY, u);
                } else
                  "rotateY" == e
                    ? this._handleWheelRotateY((a.deltaY / 5) * r, s, o)
                    : "rotateX" == e &&
                      this._handleWheelRotateX((a.deltaY / 5) * r, s, o);
                "zoom" == t
                  ? this._handleWheelZoom(a.deltaX, u)
                  : "rotateY" == t
                  ? this._handleWheelRotateY((a.deltaX / 5) * r, s, o)
                  : "rotateX" == t &&
                    this._handleWheelRotateX((a.deltaX / 5) * r, s, o),
                  a.preventDefault();
              })),
              this._disposers.push(this._wheelDp))
            : this._wheelDp && this._wheelDp.dispose();
        }
        _prepareChildren() {
          super._prepareChildren();
          const t = this.get("projection"),
            e = this.innerWidth(),
            n = this.innerHeight(),
            i = this._geometryColection.geometries;
          if (this.isDirty("projection")) {
            this._makeGeoPath(),
              this.markDirtyProjection(),
              this._fitMap(),
              t.scale(this.getPrivate("mapScale") * this.get("zoomLevel", 1)),
              t.rotate &&
                t.rotate([
                  this.get("rotationX", 0),
                  this.get("rotationY", 0),
                  this.get("rotationZ", 0),
                ]);
            let i = this._prevSettings.projection;
            if (i && i != t) {
              let o = e / 2,
                r = n / 2;
              if (i.invert) {
                let e = i.invert([o, r]);
                if (e) {
                  let n = t(e);
                  if (n) {
                    let e = t.translate(),
                      i = o - (n[0] - e[0]),
                      s = r - (n[1] - e[1]);
                    t.translate([i, s]),
                      this.setRaw("translateX", i),
                      this.setRaw("translateY", s);
                  }
                }
              }
            }
          }
          if (
            ((this.isDirty("wheelX") || this.isDirty("wheelY")) &&
              this._handleSetWheel(),
            this._dirtyGeometries &&
              ((this._geometryColection.geometries = []),
              this.series.each((t) => {
                o.pushAll(this._geometryColection.geometries, t._geometries);
              }),
              this._fitMap()),
            0 != i.length &&
              (e != this._pw || n != this._ph || this._dirtyGeometries) &&
              e > 0 &&
              n > 0)
          ) {
            let i = e / 2,
              o = n / 2;
            t.fitSize([e, n], this._geometryColection);
            const r = t.scale();
            if (
              (this.setPrivateRaw("mapScale", r),
              t.scale(r * this.get("zoomLevel", 1)),
              this._centerLocation)
            ) {
              let e = t(this._centerLocation);
              if (e) {
                let n = t.translate(),
                  r = i - (e[0] - n[0]),
                  s = o - (e[1] - n[1]);
                t.translate([r, s]),
                  this.setRaw("translateX", r),
                  this.setRaw("translateY", s),
                  (this._centerX = n[0]),
                  (this._centerY = n[1]);
              }
            }
            this.markDirtyProjection();
            const s = this.getPrivate("geoPath");
            this._mapBounds = s.bounds(this._geometryColection);
          }
          if (((this._pw = e), (this._ph = n), this.isDirty("zoomControl"))) {
            const t = this._prevSettings.zoomControl,
              e = this.get("zoomControl");
            e !== t &&
              (this._disposeProperty("zoomControl"),
              t && t.dispose(),
              e && (e.setPrivate("chart", this), this.children.push(e)),
              this.setRaw("zoomControl", e));
          }
          if (this.isDirty("zoomLevel")) {
            t.scale(this.getPrivate("mapScale") * this.get("zoomLevel", 1)),
              this.markDirtyProjection(),
              this.series.each((t) => {
                t.isType("MapPointSeries") &&
                  t.get("autoScale") &&
                  o.each(t.dataItems, (t) => {
                    const e = t.bullets;
                    e &&
                      o.each(e, (t) => {
                        const e = t.get("sprite");
                        e && e.set("scale", this.get("zoomLevel"));
                      });
                  });
              });
            const e = this.get("zoomControl");
            if (e) {
              const t = this.get("zoomLevel", 1);
              t == this.get("minZoomLevel", 1)
                ? this.root.events.once("frameended", () => {
                    e.minusButton.set("disabled", !0);
                  })
                : e.minusButton.set("disabled", !1),
                t == this.get("maxZoomLevel", 32)
                  ? e.plusButton.set("disabled", !0)
                  : e.plusButton.set("disabled", !1);
            }
          }
          (this.isDirty("translateX") || this.isDirty("translateY")) &&
            (t.translate([
              this.get("translateX", this.width() / 2),
              this.get("translateY", this.height() / 2),
            ]),
            this.markDirtyProjection()),
            t.rotate &&
              (this.isDirty("rotationX") ||
                this.isDirty("rotationY") ||
                this.isDirty("rotationZ")) &&
              (t.rotate([
                this.get("rotationX", 0),
                this.get("rotationY", 0),
                this.get("rotationZ", 0),
              ]),
              this.markDirtyProjection()),
            (this.isDirty("pinchZoom") ||
              this.get("panX") ||
              this.get("panY")) &&
              this._setUpTouch();
        }
        _fitMap() {
          const t = this.get("projection");
          let e = this.innerWidth(),
            n = this.innerHeight();
          if (e > 0 && n > 0) {
            t.fitSize([e, n], this._geometryColection),
              this.setPrivateRaw("mapScale", t.scale());
            const i = t.translate();
            this.setRaw("translateX", i[0]),
              this.setRaw("translateY", i[1]),
              (this._centerX = i[0]),
              (this._centerY = i[1]);
            const o = this.getPrivate("geoPath");
            (this._mapBounds = o.bounds(this._geometryColection)),
              (this._geoCentroid = wi(this._geometryColection));
            const r = Di(this._geometryColection);
            if (
              ((this._geoBounds = r),
              this._geometryColection.geometries.length > 0)
            ) {
              (r.left = Cn.round(this._geoBounds.left, 3)),
                (r.right = Cn.round(this._geoBounds.right, 3)),
                (r.top = Cn.round(this._geoBounds.top, 3)),
                (r.bottom = Cn.round(this._geoBounds.bottom, 3));
              const t = this._prevGeoBounds;
              t &&
                !Ci.sameBounds(r, t) &&
                ((this._dispatchBounds = !0), (this._prevGeoBounds = r));
            }
            this._mapFitted = !0;
          }
        }
        homeGeoPoint() {
          let t = this.get("homeGeoPoint");
          if (!t) {
            const e = this.getPrivate("geoPath").bounds(
                this._geometryColection
              ),
              n = e[0][0],
              i = e[0][1],
              o = e[1][0],
              r = e[1][1];
            t = this.invert({ x: n + (o - n) / 2, y: i + (r - i) / 2 });
          }
          return t;
        }
        goHome(t) {
          this.zoomToGeoPoint(
            this.homeGeoPoint(),
            this.get("homeZoomLevel", 1),
            !0,
            t,
            this.get("homeRotationX"),
            this.get("homeRotationY")
          );
        }
        _updateChildren() {
          const t = this.get("projection");
          if (t.invert) {
            let e = this.innerWidth(),
              n = this.innerHeight();
            e > 0 &&
              n > 0 &&
              (this._centerLocation = t.invert([
                this.innerWidth() / 2,
                this.innerHeight() / 2,
              ]));
          }
          super._updateChildren();
        }
        _afterChanged() {
          if ((super._afterChanged(), this._dispatchBounds)) {
            this._dispatchBounds = !1;
            const t = "geoboundschanged";
            this.events.isEnabled(t) &&
              this.events.dispatch(t, { type: t, target: this });
          }
        }
        _setUpTouch() {
          this.chartContainer._display.cancelTouch ||
            (this.chartContainer._display.cancelTouch = !!(
              this.get("pinchZoom") ||
              this.get("panX") ||
              this.get("panY")
            ));
        }
        markDirtyGeometries() {
          (this._dirtyGeometries = !0), this.markDirty();
        }
        markDirtyProjection() {
          this.series.each((t) => {
            t.markDirtyProjection();
          });
        }
        _afterNew() {
          this._defaultThemes.push(ae.new(this._root)),
            (this._settings.themeTags = Ci.mergeTags(this._settings.themeTags, [
              "map",
            ])),
            this.children.push(this.bulletsContainer),
            super._afterNew(),
            this._makeGeoPath(),
            this.chartContainer.children.push(this.seriesContainer),
            null == this.get("translateX") &&
              this.set("translateX", this.width() / 2),
            null == this.get("translateY") &&
              this.set("translateY", this.height() / 2),
            this.chartContainer.set("interactive", !0),
            this.chartContainer.set("interactiveChildren", !1),
            this.chartContainer.set(
              "background",
              fe.A.new(this._root, {
                themeTags: ["map", "background"],
                fill: In.Il.fromHex(0),
                fillOpacity: 0,
              })
            ),
            this._disposers.push(
              this.chartContainer.events.on("pointerdown", (t) => {
                this._handleChartDown(t);
              })
            ),
            this._disposers.push(
              this.chartContainer.events.on("globalpointerup", (t) => {
                this._handleChartUp(t);
              })
            ),
            this._disposers.push(
              this.chartContainer.events.on("globalpointermove", (t) => {
                this._handleChartMove(t);
              })
            );
          let t = !1;
          for (let e = 0; e < Mn.i_.licenses.length; e++)
            Mn.i_.licenses[e].match(/^AM5M.{5,}/i) && (t = !0);
          t ? this._root._licenseApplied() : this._root._showBranding(),
            this._setUpTouch();
        }
        _handleChartDown(t) {
          this._downZoomLevel = this.get("zoomLevel", 1);
          const e = this.chartContainer._downPoints;
          let n = r.keys(e).length;
          if (1 == n) {
            let i = e[1];
            i || (i = e[0]),
              i && i.x == t.point.x && i.y == t.point.y && (n = 0);
          }
          if (n > 0) {
            (this._downTranslateX = this.get("translateX")),
              (this._downTranslateY = this.get("translateY")),
              (this._downRotationX = this.get("rotationX")),
              (this._downRotationY = this.get("rotationY")),
              (this._downRotationZ = this.get("rotationZ"));
            const t = this.chartContainer._getDownPointId();
            if (t) {
              let e = this._movePoints[t];
              e && (this.chartContainer._downPoints[t] = e);
            }
          } else if (0 == n) {
            let e = this.chartContainer.get("background");
            if (
              (e && e.events.enableType("click"),
              this.get("panX") || this.get("panY"))
            ) {
              this._za && this._za.stop(),
                this._txa && this._txa.stop(),
                this._tya && this._tya.stop(),
                this._rxa && this._rxa.stop(),
                this._rya && this._rya.stop();
              const e = this.chartContainer._display.toLocal(t.point);
              (this._downTranslateX = this.get("translateX")),
                (this._downTranslateY = this.get("translateY")),
                (this._downRotationX = this.get("rotationX")),
                (this._downRotationY = this.get("rotationY")),
                (this._downRotationZ = this.get("rotationZ"));
              let n = this.get("projection");
              if (n.invert) {
                let t = n.invert([e.x, e.y]),
                  i = n.invert([e.x + 1, e.y + 1]);
                t &&
                  i &&
                  ((this._pLon = Math.abs(i[0] - t[0])),
                  (this._pLat = Math.abs(i[1] - t[1])));
              }
            }
          }
        }
        invert(t) {
          let e = this.get("projection");
          if (e.invert) {
            const n = e.invert([t.x, t.y]);
            if (n) return { longitude: n[0], latitude: n[1] };
          }
          return { longitude: 0, latitude: 0 };
        }
        convert(t, e, n) {
          let i,
            o = this.get("projection");
          if (
            (o.rotate || ((e = void 0), (n = void 0)), null != e || null != n)
          ) {
            null == e && (e = 0), null == n && (n = 0);
            let r = o.rotate();
            o.rotate([e, n, 0]),
              (i = o([t.longitude, t.latitude])),
              o.rotate(r);
          } else i = o([t.longitude, t.latitude]);
          return i ? { x: i[0], y: i[1] } : { x: 0, y: 0 };
        }
        _handleChartUp(t) {
          this.chartContainer._downPoints = {};
        }
        _handlePinch() {
          const t = this.chartContainer;
          let e = 0,
            n = [],
            i = [];
          if (
            (r.each(t._downPoints, (t, o) => {
              n[e] = o;
              let r = this._movePoints[t];
              r && (i[e] = r), e++;
            }),
            n.length > 1 && i.length > 1)
          ) {
            const e = t._display;
            let o = n[0],
              r = n[1],
              s = i[0],
              a = i[1];
            if (o && r && s && a) {
              (o = e.toLocal(o)),
                (r = e.toLocal(r)),
                (s = e.toLocal(s)),
                (a = e.toLocal(a));
              let t = Math.hypot(r.x - o.x, r.y - o.y),
                n =
                  (Math.hypot(a.x - s.x, a.y - s.y) / t) * this._downZoomLevel;
              n = Cn.fitToRange(
                n,
                this.get("minZoomLevel", 1),
                this.get("maxZoomLevel", 32)
              );
              let i = { x: s.x + (a.x - s.x) / 2, y: s.y + (a.y - s.y) / 2 },
                l = { x: o.x + (r.x - o.x) / 2, y: o.y + (r.y - o.y) / 2 },
                u = this._downTranslateX || 0,
                c = this._downTranslateY || 0,
                h = this._downZoomLevel,
                p = i.x - ((-u + l.x) / h) * n,
                f = i.y - ((-c + l.y) / h) * n;
              this.set("zoomLevel", n),
                this.set("translateX", p),
                this.set("translateY", f);
            }
          }
        }
        _handleChartMove(t) {
          const e = this.chartContainer;
          let n = e._getDownPoint();
          const i = e._getDownPointId(),
            o = t.originalEvent.pointerId;
          if (
            this.get("pinchZoom") &&
            o &&
            ((this._movePoints[o] = t.point), r.keys(e._downPoints).length > 1)
          )
            this._handlePinch();
          else if ((!i || !o || o == i) && n) {
            const i = this.get("panX"),
              o = this.get("panY");
            if ("none" != i || "none" != o) {
              const r = e._display;
              let s = r.toLocal(t.point);
              n = r.toLocal(n);
              let l = this._downTranslateX,
                u = this._downTranslateY;
              if (Math.hypot(n.x - s.x, n.y - s.y) > 5) {
                let t = e.get("background");
                if (
                  (t && t.events.disableType("click"),
                  a.isNumber(l) && a.isNumber(u))
                ) {
                  let t = this.get("projection");
                  const e = this.get("zoomLevel", 1),
                    r = this.get("maxPanOut", 0.4),
                    a = this._mapBounds,
                    c = this.width(),
                    h = this.height(),
                    p = a[1][0] - a[0][0],
                    f = a[1][1] - a[0][1];
                  if ("translateX" == i) {
                    l += s.x - n.x;
                    const t = c / 2 - (c / 2 - this._centerX) * e;
                    (l = Math.min(l, t + p * r * e)),
                      (l = Math.max(l, t - p * r * e));
                  }
                  if ("translateY" == o) {
                    u += s.y - n.y;
                    const t = h / 2 - (h / 2 - this._centerY) * e;
                    (u = Math.min(u, t + f * r * e)),
                      (u = Math.max(u, t - f * r * e));
                  }
                  if (
                    (this.set("translateX", l),
                    this.set("translateY", u),
                    t.invert)
                  ) {
                    let e = t.invert([n.x, n.y]);
                    location &&
                      e &&
                      ("rotateX" == i &&
                        this.set(
                          "rotationX",
                          this._downRotationX - (n.x - s.x) * this._pLon
                        ),
                      "rotateY" == o &&
                        this.set(
                          "rotationY",
                          this._downRotationY + (n.y - s.y) * this._pLat
                        ));
                  }
                }
              }
            }
          }
        }
        _handleWheelRotateY(t, e, n) {
          this._rya = this.animate({
            key: "rotationY",
            to: this.get("rotationY", 0) - t,
            duration: e,
            easing: n,
          });
        }
        _handleWheelRotateX(t, e, n) {
          this._rxa = this.animate({
            key: "rotationX",
            to: this.get("rotationX", 0) - t,
            duration: e,
            easing: n,
          });
        }
        _handleWheelZoom(t, e) {
          let n = this.get("zoomStep", 2),
            i = this.get("zoomLevel", 1),
            o = i;
          t > 0 ? (o = i / n) : t < 0 && (o = i * n),
            o != i && this.zoomToPoint(e, o);
        }
        zoomToGeoBounds(t, e, n, i) {
          t.right < t.left && ((t.right = 180), (t.left = -180));
          const o = this.getPrivate("geoPath").bounds(this._geometryColection);
          let r = this.convert({ longitude: t.left, latitude: t.top }, n, i),
            s = this.convert({ longitude: t.right, latitude: t.bottom }, n, i);
          r.y < o[0][1] && (r.y = o[0][1]), s.y > o[1][1] && (s.y = o[1][1]);
          let a = this.get("zoomLevel", 1),
            l = r.x,
            u = s.x,
            c = r.y,
            h = s.y,
            p = this.seriesContainer,
            f =
              0.9 *
              Math.min(
                (p.innerWidth() / (u - l)) * a,
                (p.innerHeight() / (h - c)) * a
              ),
            d = l + (u - l) / 2,
            g = c + (h - c) / 2,
            m = this.invert({ x: d, y: g });
          return (
            (null == n && null == i) || this.rotate(n, i),
            this.zoomToGeoPoint(m, f, !0, e)
          );
        }
        zoomToPoint(t, e, n, i) {
          e &&
            (e = Cn.fitToRange(
              e,
              this.get("minZoomLevel", 1),
              this.get("maxZoomLevel", 32)
            )),
            a.isNumber(i) || (i = this.get("animationDuration", 0));
          const o = this.get("animationEasing"),
            r = this.get("zoomLevel", 1);
          this.get("centerMapOnZoomOut") &&
            e == this.get("homeZoomLevel", 1) &&
            ((t = this.convert(
              this.homeGeoPoint(),
              this.get("homeRotationX"),
              this.get("homeRotationY")
            )),
            (n = !0));
          let s = t.x,
            l = t.y,
            u = this.get("translateX", 0),
            c = this.get("translateY", 0),
            h = s,
            p = l;
          n && ((h = this.width() / 2), (p = this.height() / 2));
          let f = h - ((s - u) / r) * e,
            d = p - ((l - c) / r) * e;
          return (
            (this._txa = this.animate({
              key: "translateX",
              to: f,
              duration: i,
              easing: o,
            })),
            (this._tya = this.animate({
              key: "translateY",
              to: d,
              duration: i,
              easing: o,
            })),
            (this._za = this.animate({
              key: "zoomLevel",
              to: e,
              duration: i,
              easing: o,
            })),
            r != e &&
              this._root.readerAlert(
                this._t(
                  "Zoom level changed to %1",
                  this._root.locale,
                  a.numberToString(e)
                )
              ),
            this._za
          );
        }
        zoomToGeoPoint(t, e, n, i, o, r) {
          let s = this.convert(t, o, r);
          if (((null == o && null == r) || this.rotate(o, r, i), s))
            return this.zoomToPoint(s, e, n, i);
        }
        rotate(t, e, n) {
          if (this.get("projection").rotate) {
            a.isNumber(n) || (n = this.get("animationDuration", 0));
            const i = this.get("animationEasing");
            null != t &&
              this.animate({ key: "rotationX", to: t, duration: n, easing: i }),
              null != e &&
                this.animate({
                  key: "rotationY",
                  to: e,
                  duration: n,
                  easing: i,
                });
          }
        }
        zoomIn() {
          return this.zoomToPoint(
            { x: this.width() / 2, y: this.height() / 2 },
            this.get("zoomLevel", 1) * this.get("zoomStep", 2)
          );
        }
        zoomOut() {
          return this.zoomToPoint(
            { x: this.width() / 2, y: this.height() / 2 },
            this.get("zoomLevel", 1) / this.get("zoomStep", 2)
          );
        }
        _clearDirty() {
          super._clearDirty(),
            (this._dirtyGeometries = !1),
            (this._mapFitted = !1);
        }
        getArea(t) {
          const e = this.getPrivate("geoPath"),
            n = t.get("geometry");
          return n ? e.area(n) : 0;
        }
      }
      Object.defineProperty(ji, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "MapChart",
      }),
        Object.defineProperty(ji, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: pe.j.classNames.concat([ji.className]),
        });
      class Ni extends s {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "_types", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: ["Point", "MultiPoint"],
            }),
            Object.defineProperty(this, "_lineChangedDp", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            });
        }
        _afterNew() {
          this.fields.push(
            "polygonId",
            "lineId",
            "longitude",
            "latitude",
            "fixed"
          ),
            super._afterNew();
        }
        markDirtyProjection() {
          this.markDirty();
        }
        markDirtyValues(t) {
          super.markDirtyValues(), t && this._positionBullets(t);
        }
        processDataItem(t) {
          super.processDataItem(t);
          let e = t.get("geometry");
          if (e) {
            if ("Point" == e.type) {
              const n = e.coordinates;
              n && (t.set("longitude", n[0]), t.set("latitude", n[1]));
            } else if ("MultiPoint" == e.type) {
              const n = e.coordinates;
              n &&
                n[0] &&
                (t.set("longitude", n[0][0]), t.set("latitude", n[0][1]));
            }
          } else
            (e = {
              type: "Point",
              coordinates: [t.get("longitude", 0), t.get("latitude", 0)],
            }),
              t.set("geometry", e);
          this._addGeometry(e, this);
        }
        _makeBullets(t) {
          (t.bullets = []),
            this.bullets.each((e) => {
              const n = t.get("geometry");
              if (n)
                if ("Point" == n.type)
                  this._setBulletParent(this._makeBullet(t, e));
                else if ((n.type = "MultiPoint")) {
                  let i = 0;
                  o.each(n.coordinates, () => {
                    this._setBulletParent(this._makeBullet(t, e, i)), i++;
                  });
                }
            });
        }
        _setBulletParent(t) {
          if (t) {
            const e = t.get("sprite"),
              n = this.chart;
            if (e && n) {
              const t = e.dataItem;
              t &&
                (t.get("fixed")
                  ? e.parent != n.bulletsContainer &&
                    n.bulletsContainer.children.moveValue(e)
                  : e.parent != this.bulletsContainer &&
                    this.bulletsContainer.children.moveValue(e));
            }
          }
        }
        _positionBullet(t) {
          const e = t.get("sprite");
          if (e) {
            const n = e.dataItem;
            if (n && n.get("fixed")) return;
            const i = n.get("latitude"),
              o = n.get("longitude"),
              r = n.get("lineDataItem"),
              s = n.get("fixed"),
              l = this.chart;
            let u;
            if (r) u = r.get("mapLine");
            else {
              const t = n.get("lineId");
              t &&
                l &&
                l.series.each((e) => {
                  if (e.isType("MapLineSeries")) {
                    let i = e.getDataItemById(t);
                    i && (n.set("lineDataItem", i), (u = i.get("mapLine")));
                  }
                });
            }
            this._lineChangedDp && this._lineChangedDp.dispose(),
              u &&
                (this._lineChangedDp = u.events.on("linechanged", () => {
                  this._positionBullets(n);
                }));
            const c = n.get("polygonDataItem");
            let h;
            if (c) h = c.get("mapPolygon");
            else {
              const t = n.get("polygonId");
              t &&
                l &&
                l.series.each((e) => {
                  if (e.isType("MapPolygonSeries")) {
                    let i = e.getDataItemById(t);
                    i &&
                      (n.set("polygonDataItem", i), (h = i.get("mapPolygon")));
                  }
                });
            }
            const p = n.get("positionOnLine");
            let f, d;
            if (h) {
              let t = h.visualCentroid();
              (f = [t.longitude, t.latitude]),
                n.setRaw("longitude", t.longitude),
                n.setRaw("latitude", t.latitude);
            } else if (u && a.isNumber(p)) {
              let e = u.positionToGeoPoint(p);
              if (
                ((f = [e.longitude, e.latitude]),
                n.get("autoRotate", t.get("autoRotate")) && l)
              ) {
                const t = u.positionToGeoPoint(p - 0.002),
                  e = u.positionToGeoPoint(p + 0.002),
                  n = l.convert(t),
                  i = l.convert(e);
                d = Cn.getAngle(n, i);
              }
              n.setRaw("longitude", e.longitude),
                n.setRaw("latitude", e.latitude);
            } else if (a.isNumber(o) && a.isNumber(i)) f = [o, i];
            else {
              const e = n.get("geometry");
              if (e)
                if ("Point" == e.type)
                  this._positionBulletReal(t, e, e.coordinates, d);
                else if ("MultiPoint" == e.type) {
                  let n = t._index || 0;
                  f = e.coordinates[n];
                }
            }
            !s &&
              f &&
              this._positionBulletReal(
                t,
                { type: "Point", coordinates: f },
                f,
                d
              );
          }
        }
        _positionBulletReal(t, e, n, i) {
          const o = t.get("sprite"),
            r = this.chart;
          if (r) {
            const s = r.get("projection"),
              a = r.getPrivate("geoPath"),
              l = o.dataItem,
              u = s(n);
            if (u) {
              const t = { x: u[0], y: u[1] };
              o.setAll(t), l.setRaw("point", t);
            }
            let c = !0;
            a(e)
              ? this.get("clipFront") && (c = !1)
              : this.get("clipBack") && (c = !1),
              o.setPrivate("visible", c),
              l.set("clipped", !c),
              l &&
                null != i &&
                l.get("autoRotate", t.get("autoRotate")) &&
                o.set(
                  "rotation",
                  i + l.get("autoRotateAngle", t.get("autoRotateAngle", 0))
                );
          }
        }
        zoomToDataItem(t, e, n) {
          const i = this.chart;
          if (i) {
            const o = t.get("longitude", 0),
              r = t.get("latitude", 0);
            return n
              ? i.zoomToGeoPoint(
                  { longitude: o, latitude: r },
                  e,
                  !0,
                  void 0,
                  -o,
                  -r
                )
              : i.zoomToGeoPoint({ longitude: o, latitude: r }, e, !0);
          }
        }
        zoomToDataItems(t, e) {
          let n = null,
            i = null,
            r = null,
            s = null;
          if (
            (o.each(t, (t) => {
              const e = t.get("longitude", 0),
                o = t.get("latitude", 0);
              (null == n || n > e) && (n = e),
                (null == i || i < e) && (i = e),
                (null == r || r < o) && (r = o),
                (null == s || s > o) && (s = o);
            }),
            null != n && null != i && null != r && null != s)
          ) {
            const t = this.chart;
            if (t)
              return e
                ? t.zoomToGeoBounds(
                    { left: n, right: i, top: r, bottom: s },
                    void 0,
                    -(n + (i - n) / 2),
                    -(r + (r - s) / 2)
                  )
                : t.zoomToGeoBounds({ left: n, right: i, top: r, bottom: s });
          }
        }
        disposeDataItem(t) {
          const e = this.chart;
          e &&
            e.series.each((e) => {
              e.isType("MapLineSeries") &&
                o.each(e.dataItems, (n) => {
                  const i = n.get("pointsToConnect");
                  i &&
                    o.each(i, (r) => {
                      r == t && (o.remove(i, r), e.markDirtyValues(n));
                    });
                });
            }),
            super.disposeDataItem(t);
        }
        _excludeDataItem(t) {
          super._excludeDataItem(t);
          const e = t.bullets;
          e &&
            o.each(e, (t) => {
              const e = t.get("sprite");
              e && e.setPrivate("visible", !1);
            });
        }
        _unexcludeDataItem(t) {
          super._unexcludeDataItem(t);
          const e = t.bullets;
          e &&
            o.each(e, (t) => {
              const e = t.get("sprite");
              e && e.setPrivate("visible", !0);
            });
        }
        _notIncludeDataItem(t) {
          super._notIncludeDataItem(t);
          const e = t.bullets;
          e &&
            o.each(e, (t) => {
              const e = t.get("sprite");
              e && e.setPrivate("visible", !1);
            });
        }
        _unNotIncludeDataItem(t) {
          super._unNotIncludeDataItem(t);
          const e = t.bullets;
          e &&
            o.each(e, (t) => {
              const e = t.get("sprite");
              e && e.setPrivate("visible", !0);
            });
        }
      }
      Object.defineProperty(Ni, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "MapPointSeries",
      }),
        Object.defineProperty(Ni, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: s.classNames.concat([Ni.className]),
        });
      var Ei = n(5417),
        Oi = n.n(Ei);
      class Li extends u.T {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "_projectionDirty", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: !1,
            }),
            Object.defineProperty(this, "series", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            });
        }
        _afterNew() {
          super._afterNew(), this.setPrivate("trustBounds", !0);
        }
        _beforeChanged() {
          if (
            (super._beforeChanged(),
            this._projectionDirty ||
              this.isDirty("geometry") ||
              this.isDirty("precision"))
          ) {
            const t = this.get("geometry");
            if (t) {
              const e = this.series;
              if (e) {
                const n = e.projection();
                n && n.precision(this.get("precision", 0.5));
                const i = e.geoPath();
                i &&
                  ((this._clear = !0),
                  this.set("draw", (e) => {
                    i.context(this._display), i(t), i.context(null);
                  }),
                  this.isHover() && this.showTooltip());
              }
            }
          }
        }
        markDirtyProjection() {
          this.markDirty(), (this._projectionDirty = !0);
        }
        _clearDirty() {
          super._clearDirty(), (this._projectionDirty = !1);
        }
        geoCentroid() {
          const t = this.get("geometry");
          return t ? wi(t) : { latitude: 0, longitude: 0 };
        }
        visualCentroid() {
          let t = 0,
            e = [];
          const n = this.get("geometry");
          if (n) {
            if ("Polygon" == n.type) e = n.coordinates;
            else if ("MultiPolygon" == n.type)
              for (let i = 0; i < n.coordinates.length; i++) {
                let o = n.coordinates[i],
                  r = ui({ type: "Polygon", coordinates: o });
                r > t && ((e = o), (t = r));
              }
            if (e) {
              let t = Oi()(e);
              return { longitude: t[0], latitude: t[1] };
            }
          }
          return { longitude: 0, latitude: 0 };
        }
        _getTooltipPoint() {
          const t = this.series;
          if (t) {
            const e = t.projection();
            if (e) {
              const t = this.visualCentroid(),
                n = e([t.longitude, t.latitude]);
              if (n) return { x: n[0], y: n[1] };
            }
          }
          return { x: 0, y: 0 };
        }
      }
      Object.defineProperty(Li, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "MapPolygon",
      }),
        Object.defineProperty(Li, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: u.T.classNames.concat([Li.className]),
        });
      class Ti extends s {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "mapPolygons", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: this.addDisposer(
                new K.o(tt.YS.new({}), () =>
                  Li._new(this._root, {}, [this.mapPolygons.template])
                )
              ),
            }),
            Object.defineProperty(this, "_types", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: ["Polygon", "MultiPolygon"],
            });
        }
        makeMapPolygon(t) {
          const e = this.children.push(this.mapPolygons.make());
          return e._setDataItem(t), this.mapPolygons.push(e), e;
        }
        markDirtyProjection() {
          o.each(this.dataItems, (t) => {
            let e = t.get("mapPolygon");
            e && e.markDirtyProjection();
          });
        }
        _prepareChildren() {
          super._prepareChildren(),
            this.isDirty("fill") &&
              this.mapPolygons.template.set("fill", this.get("fill")),
            this.isDirty("stroke") &&
              this.mapPolygons.template.set("stroke", this.get("stroke"));
        }
        processDataItem(t) {
          super.processDataItem(t);
          let e = t.get("mapPolygon");
          e || (e = this.makeMapPolygon(t)), t.set("mapPolygon", e);
          let n = t.get("geometry");
          if (n) {
            if (this.get("reverseGeodata") && n.coordinates)
              for (let t = 0; t < n.coordinates.length; t++)
                if ("MultiPolygon" == n.type)
                  for (let e = 0; e < n.coordinates[t].length; e++)
                    n.coordinates[t][e].reverse();
                else n.coordinates[t].reverse();
            e.set("geometry", n);
          }
          (e.series = this), this._addGeometry(t.get("geometry"), this);
        }
        disposeDataItem(t) {
          super.disposeDataItem(t);
          const e = t.get("mapPolygon");
          e && (this.mapPolygons.removeValue(e), e.dispose()),
            this._removeGeometry(t.get("geometry"));
        }
        _excludeDataItem(t) {
          super._excludeDataItem(t);
          const e = t.get("mapPolygon");
          e && e.setPrivate("visible", !1);
        }
        _unexcludeDataItem(t) {
          super._unexcludeDataItem(t);
          const e = t.get("mapPolygon");
          e && e.setPrivate("visible", !0);
        }
        _notIncludeDataItem(t) {
          super._notIncludeDataItem(t);
          const e = t.get("mapPolygon");
          e && e.setPrivate("visible", !1);
        }
        _unNotIncludeDataItem(t) {
          super._unNotIncludeDataItem(t);
          const e = t.get("mapPolygon");
          e && e.setPrivate("visible", !0);
        }
        markDirtyValues(t) {
          if ((super.markDirtyValues(), t)) {
            const e = t.get("mapPolygon");
            e && e.set("geometry", t.get("geometry"));
          }
        }
        zoomToDataItem(t, e) {
          const n = t.get("mapPolygon");
          if (n) {
            const t = n.get("geometry"),
              i = this.chart;
            if (t && i) {
              if (e) {
                const e = wi(t);
                return (
                  i.rotate(-e.longitude, -e.latitude),
                  i.zoomToGeoBounds(Di(t), void 0, -e.longitude, -e.latitude)
                );
              }
              return i.zoomToGeoBounds(Di(t));
            }
          }
        }
        zoomToDataItems(t, e) {
          let n, i, r, s;
          if (
            (o.each(t, (t) => {
              const e = t.get("mapPolygon");
              if (e) {
                const t = e.get("geometry");
                if (t) {
                  let e = Di(t);
                  null == n && (n = e.left),
                    null == i && (i = e.right),
                    null == r && (r = e.top),
                    null == s && (s = e.bottom),
                    (n = Math.min(e.left, n)),
                    (i = Math.max(e.right, i)),
                    (r = Math.max(e.top, r)),
                    (s = Math.min(e.bottom, s));
                }
              }
            }),
            null != n && null != i && null != r && null != s)
          ) {
            const t = this.chart;
            if (t) {
              if (e) {
                const e = n + (i - n) / 2,
                  o = s + (r - s) / 2;
                return (
                  t.rotate(-e, -o),
                  t.zoomToGeoBounds(
                    { left: n, right: i, top: r, bottom: s },
                    void 0,
                    -e,
                    -o
                  )
                );
              }
              return t.zoomToGeoBounds({
                left: n,
                right: i,
                top: r,
                bottom: s,
              });
            }
          }
        }
        getPolygonByPoint(t) {
          let e;
          const n = this._display._renderer.getObjectAtPoint(t);
          if (n)
            return (
              this.mapPolygons.each(function (t) {
                t._display == n && (e = t);
              }),
              e
            );
        }
        getPolygonByGeoPoint(t) {
          return this.getPolygonByPoint(this.chart.convert(t));
        }
      }
      Object.defineProperty(Ti, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "MapPolygonSeries",
      }),
        Object.defineProperty(Ti, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: s.classNames.concat([Ti.className]),
        });
      var ki = n(9361),
        Ri = n(8777),
        zi = n(962),
        Gi = n(2156);
      class Bi extends Ni {
        constructor() {
          super(...arguments),
            Object.defineProperty(this, "_dataItem", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: this.makeDataItem({}),
            }),
            Object.defineProperty(this, "_clusterIndex", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            }),
            Object.defineProperty(this, "_clusters", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            }),
            Object.defineProperty(this, "clusteredDataItems", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            }),
            Object.defineProperty(this, "_scatterIndex", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            }),
            Object.defineProperty(this, "_scatters", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            }),
            Object.defineProperty(this, "_packLayout", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: Gi.Z(),
            }),
            Object.defineProperty(this, "_spiral", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: [],
            }),
            Object.defineProperty(this, "_clusterDP", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }),
            Object.defineProperty(this, "_previousZL", {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: 0,
            });
        }
        _afterNew() {
          this.fields.push("groupId"),
            this._setRawDefault("groupIdField", "groupId"),
            super._afterNew();
        }
        _updateChildren() {
          super._updateChildren(),
            this.isDirty("scatterRadius") &&
              (this._spiral = Cn.spiralPoints(0, 0, 300, 300, 0, 3, 3, 0, 0));
          const t = this.chart;
          if (t) {
            const e = t.get("zoomLevel", 1);
            if (e != this._previousZL) {
              const t = this.get("clusterDelay", 0);
              t
                ? this._clusterDP
                  ? (this._clusterDP.dispose(),
                    (this._clusterDP = this.setTimeout(() => {
                      this._doTheCluster();
                    }, t)))
                  : (this._doTheCluster(),
                    (this._clusterDP = this.setTimeout(() => {}, 0)))
                : this._doTheCluster(),
                (this._previousZL = e);
            }
            o.each(this.clusteredDataItems, (t) => {
              const e = t.get("bullet"),
                n = t.get("longitude", 0),
                i = t.get("latitude", 0);
              this._positionBulletReal(
                e,
                { type: "Point", coordinates: [n, i] },
                [n, i]
              );
            });
          }
        }
        _doTheCluster() {
          const t = {};
          o.each(this.dataItems, (e) => {
            const n = e.get("groupId", "_default");
            t[n] || (t[n] = []), t[n].push(e);
          }),
            (this._scatterIndex = -1),
            (this._scatters = []),
            (this._clusterIndex = -1),
            (this._clusters = []),
            o.each(this.clusteredDataItems, (t) => {
              t.setRaw("children", void 0);
            }),
            o.each(this.dataItems, (t) => {
              t.setRaw("cluster", void 0);
            }),
            r.each(t, (t, e) => {
              this._scatterGroup(e);
            }),
            r.each(t, (t, e) => {
              this._clusterGroup(e);
            }),
            o.each(this.dataItems, (t) => {
              if (!t.get("cluster")) {
                const e = t.bullets;
                e &&
                  o.each(e, (t) => {
                    const e = t.get("sprite");
                    e && e.set("forceHidden", !1);
                  });
              }
            });
        }
        zoomToCluster(t, e) {
          this.zoomToDataItems(t.get("children", []), e);
        }
        _clusterGroup(t) {
          const e = this.chart;
          if (
            e &&
            e.get("zoomLevel", 1) >=
              e.get("maxZoomLevel", 100) * this.get("stopClusterZoom", 0.95)
          );
          else
            for (
              t.sort((t, e) => {
                const n = t.get("point"),
                  i = e.get("point");
                return n && i ? Math.hypot(n.x - i.x, n.y - i.y) : 0;
              });
              t.length > 0;

            ) {
              this._clusterIndex++, (this._clusters[this._clusterIndex] = []);
              const e = this._clusters[this._clusterIndex],
                n = t[0];
              e.push(n), o.removeFirst(t, n), this._clusterDataItem(n, t);
            }
          let n = 0;
          const i = this.get("clusteredBullet");
          i &&
            o.each(this._clusters, (t) => {
              let e = 0,
                r = 0,
                s = t.length;
              if (s > 1) {
                let a,
                  l = this.clusteredDataItems[n];
                if (!l) {
                  l = new ki.z(this, void 0, {});
                  const t = l.set("bullet", i(this._root, this, l));
                  if (t) {
                    const e = t.get("sprite");
                    e &&
                      (this.bulletsContainer.children.push(e),
                      e._setDataItem(l),
                      this.root.events.once("frameended", () => {
                        e instanceof Ri.W &&
                          e.walkChildren((t) => {
                            t instanceof ki.w && t.markDirtyValues();
                          });
                      }));
                  }
                  this.clusteredDataItems.push(l);
                }
                o.each(t, (t) => {
                  t.setRaw("cluster", l);
                  const n = t.get("point");
                  n && ((e += n.x), (r += n.y));
                  const i = t.bullets;
                  i &&
                    o.each(i, (t) => {
                      const e = t.get("sprite");
                      e && e.set("forceHidden", !0);
                    }),
                    (a = t.get("groupId"));
                });
                let u = e / s,
                  c = r / s;
                l.setRaw("children", t), l.setRaw("groupId", a);
                const h = l.get("value");
                l.setRaw("value", s);
                const p = l.get("bullet");
                if (p) {
                  let t = this.chart.invert({ x: u, y: c });
                  t &&
                    l.setAll({ longitude: t.longitude, latitude: t.latitude }),
                    this._positionBullets(l);
                  const e = p.get("sprite");
                  e &&
                    (e.set("forceHidden", !1),
                    h != s &&
                      e instanceof Ri.W &&
                      e.walkChildren((t) => {
                        t instanceof zi._ && t.text.markDirtyText();
                      }));
                }
                n++;
              }
            }),
            o.each(this.clusteredDataItems, (t) => {
              let e = t.get("children");
              if (!e || 0 == e.length) {
                const e = t.get("bullet");
                if (e) {
                  const t = e.get("sprite");
                  t && t.set("forceHidden", !0);
                }
              }
            });
        }
        _onDataClear() {
          super._onDataClear(),
            o.each(this.clusteredDataItems, (t) => {
              const e = t.get("bullet");
              if (e) {
                const t = e.get("sprite");
                t && t.dispose();
              }
            }),
            (this.clusteredDataItems = []);
        }
        _clusterDataItem(t, e) {
          const n = t.get("point");
          if (n) {
            let t = this.get("minDistance", 20);
            const i = this._clusters[this._clusterIndex];
            for (let r = e.length - 1; r >= 0; r--) {
              const s = e[r];
              if (s && !s.get("clipped")) {
                const r = s.get("point");
                r &&
                  Math.hypot(r.x - n.x, r.y - n.y) < t &&
                  (i.push(s), o.removeFirst(e, s), this._clusterDataItem(s, e));
              }
            }
          }
        }
        _scatterGroup(t) {
          const e = this.chart;
          if (
            e &&
            e.get("zoomLevel", 1) >=
              e.get("maxZoomLevel", 100) * this.get("stopClusterZoom", 0.95)
          ) {
            for (; t.length > 0; ) {
              this._scatterIndex++, (this._scatters[this._scatterIndex] = []);
              const e = this._scatters[this._scatterIndex],
                n = t[0];
              e.push(n), o.remove(t, n), this._scatterDataItem(n, t);
            }
            o.each(this._scatters, (t) => {
              if (t.length > 1) {
                let e = [],
                  n = 0,
                  i = this.get("scatterRadius", 8);
                o.each(t, (t) => {
                  let r = this._spiral[n],
                    s = !0;
                  if (e.length > 0)
                    for (; s; )
                      o.each(e, (t) => {
                        for (
                          s = !1;
                          Cn.circlesOverlap({ x: r.x, y: r.y, radius: i }, t);

                        )
                          n++,
                            null == this._spiral[n]
                              ? (s = !1)
                              : ((s = !0), (r = this._spiral[n]));
                      });
                  const a = r.x,
                    l = r.y;
                  e.push({ x: a, y: l, radius: i }),
                    t.set("dx", a),
                    t.set("dy", l);
                  const u = t.bullets;
                  u &&
                    o.each(u, (t) => {
                      const e = t.get("sprite");
                      e && e.setAll({ dx: a, dy: l });
                    });
                });
              }
            });
          }
        }
        _scatterDataItem(t, e) {
          const n = t.get("point");
          if (n) {
            const t = this.get("scatterDistance", 5),
              i = this._scatters[this._scatterIndex];
            o.each(e, (r) => {
              if (r && !r.get("clipped")) {
                const s = r.get("point");
                s &&
                  Math.hypot(s.x - n.x, s.y - n.y) < t &&
                  (i.push(r), o.removeFirst(e, r), this._scatterDataItem(r, e));
              }
            });
          }
        }
      }
      Object.defineProperty(Bi, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "ClusteredPointSeries",
      }),
        Object.defineProperty(Bi, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: Ni.classNames.concat([Bi.className]),
        });
      var Yi = n(6044);
      class Xi extends Yi.H {
        _afterNew() {
          super._afterNew(), this.addTag("zoomtools");
        }
        _prepareChildren() {
          super._prepareChildren(),
            this.isPrivateDirty("chart") &&
              this.set("target", this.getPrivate("chart"));
        }
      }
      function Zi(t, e) {
        return [w(e) * M(t), M(e)];
      }
      function Ai() {
        return ne(Zi)
          .scale(249.5)
          .clipAngle(90 + h);
      }
      function Fi(t, e) {
        return [t, e];
      }
      function Wi() {
        return ne(Fi).scale(152.63);
      }
      function Vi(t, e) {
        var n = M(t),
          i = (n + M(e)) / 2;
        if (_(i) < h)
          return (function (t) {
            var e = w(t);
            function n(t, n) {
              return [t * e, M(n) / e];
            }
            return (
              (n.invert = function (t, n) {
                return [t / e, E(n * e)];
              }),
              n
            );
          })(t);
        var o = 1 + n * (2 * i - n),
          r = j(o) / i;
        function s(t, e) {
          var n = j(o - 2 * i * M(e)) / i;
          return [n * M((t *= i)), r - n * w(t)];
        }
        return (
          (s.invert = function (t, e) {
            var n = r - e,
              s = P(t, _(n)) * C(n);
            return (
              n * i < 0 && (s -= f * C(t) * C(n)),
              [s / i, E((o - (t * t + n * n) * i * i) / (2 * i))]
            );
          }),
          s
        );
      }
      function Hi() {
        return (function (t) {
          var e = 0,
            n = f / 3,
            i = ie(t),
            o = i(e, n);
          return (
            (o.parallels = function (t) {
              return arguments.length
                ? i((e = t[0] * v), (n = t[1] * v))
                : [e * y, n * y];
            }),
            o
          );
        })(Vi)
          .scale(155.424)
          .center([0, 33.6442]);
      }
      function Ji() {
        var t,
          e,
          n,
          i,
          o,
          r,
          s = Hi()
            .parallels([29.5, 45.5])
            .scale(1070)
            .translate([480, 250])
            .rotate([96, 0])
            .center([-0.6, 38.7]),
          a = Hi().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]),
          l = Hi().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]),
          u = {
            point: function (t, e) {
              r = [t, e];
            },
          };
        function c(t) {
          var e = t[0],
            s = t[1];
          return (
            (r = null),
            n.point(e, s),
            r || (i.point(e, s), r) || (o.point(e, s), r)
          );
        }
        function p() {
          return (t = e = null), c;
        }
        return (
          (c.invert = function (t) {
            var e = s.scale(),
              n = s.translate(),
              i = (t[0] - n[0]) / e,
              o = (t[1] - n[1]) / e;
            return (
              o >= 0.12 && o < 0.234 && i >= -0.425 && i < -0.214
                ? a
                : o >= 0.166 && o < 0.234 && i >= -0.214 && i < -0.115
                ? l
                : s
            ).invert(t);
          }),
          (c.stream = function (n) {
            return t && e === n
              ? t
              : ((i = [s.stream((e = n)), a.stream(n), l.stream(n)]),
                (o = i.length),
                (t = {
                  point: function (t, e) {
                    for (var n = -1; ++n < o; ) i[n].point(t, e);
                  },
                  sphere: function () {
                    for (var t = -1; ++t < o; ) i[t].sphere();
                  },
                  lineStart: function () {
                    for (var t = -1; ++t < o; ) i[t].lineStart();
                  },
                  lineEnd: function () {
                    for (var t = -1; ++t < o; ) i[t].lineEnd();
                  },
                  polygonStart: function () {
                    for (var t = -1; ++t < o; ) i[t].polygonStart();
                  },
                  polygonEnd: function () {
                    for (var t = -1; ++t < o; ) i[t].polygonEnd();
                  },
                }));
            var i, o;
          }),
          (c.precision = function (t) {
            return arguments.length
              ? (s.precision(t), a.precision(t), l.precision(t), p())
              : s.precision();
          }),
          (c.scale = function (t) {
            return arguments.length
              ? (s.scale(t),
                a.scale(0.35 * t),
                l.scale(t),
                c.translate(s.translate()))
              : s.scale();
          }),
          (c.translate = function (t) {
            if (!arguments.length) return s.translate();
            var e = s.scale(),
              r = +t[0],
              c = +t[1];
            return (
              (n = s
                .translate(t)
                .clipExtent([
                  [r - 0.455 * e, c - 0.238 * e],
                  [r + 0.455 * e, c + 0.238 * e],
                ])
                .stream(u)),
              (i = a
                .translate([r - 0.307 * e, c + 0.201 * e])
                .clipExtent([
                  [r - 0.425 * e + h, c + 0.12 * e + h],
                  [r - 0.214 * e - h, c + 0.234 * e - h],
                ])
                .stream(u)),
              (o = l
                .translate([r - 0.205 * e, c + 0.212 * e])
                .clipExtent([
                  [r - 0.214 * e + h, c + 0.166 * e + h],
                  [r - 0.115 * e - h, c + 0.234 * e - h],
                ])
                .stream(u)),
              p()
            );
          }),
          (c.fitExtent = function (t, e) {
            return Ht(c, t, e);
          }),
          (c.fitSize = function (t, e) {
            return Jt(c, t, e);
          }),
          (c.fitWidth = function (t, e) {
            return $t(c, t, e);
          }),
          (c.fitHeight = function (t, e) {
            return Ut(c, t, e);
          }),
          c.scale(1070)
        );
      }
      Object.defineProperty(Xi, "className", {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: "ZoomControl",
      }),
        Object.defineProperty(Xi, "classNames", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: Yi.H.classNames.concat([Xi.className]),
        }),
        (Zi.invert = (function (t) {
          return function (e, n) {
            var i = j(e * e + n * n),
              o = t(i),
              r = M(o),
              s = w(o);
            return [P(e * r, i * s), E(i && (n * r) / i)];
          };
        })(E)),
        (Fi.invert = Fi);
      var $i = 1.340264,
        Ui = -0.081106,
        qi = 893e-6,
        Qi = 0.003796,
        Ki = j(3) / 2;
      function to(t, e) {
        var n = E(Ki * M(e)),
          i = n * n,
          o = i * i * i;
        return [
          (t * w(n)) / (Ki * ($i + 3 * Ui * i + o * (7 * qi + 9 * Qi * i))),
          n * ($i + Ui * i + o * (qi + Qi * i)),
        ];
      }
      function eo() {
        return ne(to).scale(177.158);
      }
      function no(t, e) {
        var n = e * e,
          i = n * n;
        return [
          t *
            (0.8707 -
              0.131979 * n +
              i * (i * (0.003971 * n - 0.001529 * i) - 0.013791)),
          e *
            (1.007226 +
              n * (0.015085 + i * (0.028874 * n - 0.044475 - 0.005916 * i))),
        ];
      }
      function io() {
        return ne(no).scale(175.295);
      }
      (to.invert = function (t, e) {
        for (
          var n, i = e, o = i * i, r = o * o * o, s = 0;
          s < 12 &&
          ((r =
            (o =
              (i -= n =
                (i * ($i + Ui * o + r * (qi + Qi * o)) - e) /
                ($i + 3 * Ui * o + r * (7 * qi + 9 * Qi * o))) * i) *
            o *
            o),
          !(_(n) < p));
          ++s
        );
        return [
          (Ki * t * ($i + 3 * Ui * o + r * (7 * qi + 9 * Qi * o))) / w(i),
          E(M(i) / Ki),
        ];
      }),
        (no.invert = function (t, e) {
          var n,
            i = e,
            o = 25;
          do {
            var r = i * i,
              s = r * r;
            i -= n =
              (i *
                (1.007226 +
                  r *
                    (0.015085 + s * (0.028874 * r - 0.044475 - 0.005916 * s))) -
                e) /
              (1.007226 +
                r *
                  (0.045255 +
                    s * (0.259866 * r - 0.311325 - 0.005916 * 11 * s)));
          } while (_(n) > h && --o > 0);
          return [
            t /
              (0.8707 +
                (r = i * i) *
                  (r * (r * r * r * (0.003971 - 0.001529 * r) - 0.013791) -
                    0.131979)),
            i,
          ];
        });
    },
    5417: function (t, e, n) {
      var i = n(2640);
      function o(t, e, n) {
        var o, a, l, u;
        e = e || 1;
        for (var c = 0; c < t[0].length; c++) {
          var h = t[0][c];
          (!c || h[0] < o) && (o = h[0]),
            (!c || h[1] < a) && (a = h[1]),
            (!c || h[0] > l) && (l = h[0]),
            (!c || h[1] > u) && (u = h[1]);
        }
        var p = l - o,
          f = u - a,
          d = Math.min(p, f),
          g = d / 2;
        if (0 === d) {
          var m = [o, a];
          return (m.distance = 0), m;
        }
        for (var y = new i(void 0, r), v = o; v < l; v += d)
          for (var _ = a; _ < u; _ += d) y.push(new s(v + g, _ + g, g, t));
        var b = (function (t) {
            for (
              var e = 0, n = 0, i = 0, o = t[0], r = 0, a = o.length, l = a - 1;
              r < a;
              l = r++
            ) {
              var u = o[r],
                c = o[l],
                h = u[0] * c[1] - c[0] * u[1];
              (n += (u[0] + c[0]) * h), (i += (u[1] + c[1]) * h), (e += 3 * h);
            }
            return 0 === e
              ? new s(o[0][0], o[0][1], 0, t)
              : new s(n / e, i / e, 0, t);
          })(t),
          P = new s(o + p / 2, a + f / 2, 0, t);
        P.d > b.d && (b = P);
        for (var w = y.length; y.length; ) {
          var x = y.pop();
          x.d > b.d &&
            ((b = x),
            n &&
              console.log(
                "found best %d after %d probes",
                Math.round(1e4 * x.d) / 1e4,
                w
              )),
            x.max - b.d <= e ||
              ((g = x.h / 2),
              y.push(new s(x.x - g, x.y - g, g, t)),
              y.push(new s(x.x + g, x.y - g, g, t)),
              y.push(new s(x.x - g, x.y + g, g, t)),
              y.push(new s(x.x + g, x.y + g, g, t)),
              (w += 4));
        }
        n &&
          (console.log("num probes: " + w),
          console.log("best distance: " + b.d));
        var D = [b.x, b.y];
        return (D.distance = b.d), D;
      }
      function r(t, e) {
        return e.max - t.max;
      }
      function s(t, e, n, i) {
        (this.x = t),
          (this.y = e),
          (this.h = n),
          (this.d = (function (t, e, n) {
            for (var i = !1, o = 1 / 0, r = 0; r < n.length; r++)
              for (
                var s = n[r], l = 0, u = s.length, c = u - 1;
                l < u;
                c = l++
              ) {
                var h = s[l],
                  p = s[c];
                h[1] > e != p[1] > e &&
                  t < ((p[0] - h[0]) * (e - h[1])) / (p[1] - h[1]) + h[0] &&
                  (i = !i),
                  (o = Math.min(o, a(t, e, h, p)));
              }
            return 0 === o ? 0 : (i ? 1 : -1) * Math.sqrt(o);
          })(t, e, i)),
          (this.max = this.d + this.h * Math.SQRT2);
      }
      function a(t, e, n, i) {
        var o = n[0],
          r = n[1],
          s = i[0] - o,
          a = i[1] - r;
        if (0 !== s || 0 !== a) {
          var l = ((t - o) * s + (e - r) * a) / (s * s + a * a);
          l > 1
            ? ((o = i[0]), (r = i[1]))
            : l > 0 && ((o += s * l), (r += a * l));
        }
        return (s = t - o) * s + (a = e - r) * a;
      }
      i.default && (i = i.default), (t.exports = o), (t.exports.default = o);
    },
    2640: function (t, e, n) {
      n.r(e),
        n.d(e, {
          default: function () {
            return i;
          },
        });
      class i {
        constructor(t = [], e = o) {
          if (
            ((this.data = t),
            (this.length = this.data.length),
            (this.compare = e),
            this.length > 0)
          )
            for (let t = (this.length >> 1) - 1; t >= 0; t--) this._down(t);
        }
        push(t) {
          this.data.push(t), this.length++, this._up(this.length - 1);
        }
        pop() {
          if (0 === this.length) return;
          const t = this.data[0],
            e = this.data.pop();
          return (
            this.length--,
            this.length > 0 && ((this.data[0] = e), this._down(0)),
            t
          );
        }
        peek() {
          return this.data[0];
        }
        _up(t) {
          const { data: e, compare: n } = this,
            i = e[t];
          for (; t > 0; ) {
            const o = (t - 1) >> 1,
              r = e[o];
            if (n(i, r) >= 0) break;
            (e[t] = r), (t = o);
          }
          e[t] = i;
        }
        _down(t) {
          const { data: e, compare: n } = this,
            i = this.length >> 1,
            o = e[t];
          for (; t < i; ) {
            let i = 1 + (t << 1),
              r = e[i];
            const s = i + 1;
            if (
              (s < this.length && n(e[s], r) < 0 && ((i = s), (r = e[s])),
              n(r, o) >= 0)
            )
              break;
            (e[t] = r), (t = i);
          }
          e[t] = o;
        }
      }
      function o(t, e) {
        return t < e ? -1 : t > e ? 1 : 0;
      }
    },
    2872: function (t, e, n) {
      n.r(e),
        n.d(e, {
          am5map: function () {
            return i;
          },
        });
      const i = n(7533);
    },
  },
  function (t) {
    var e = (2872, t((t.s = 2872))),
      n = window;
    for (var i in e) n[i] = e[i];
    e.__esModule && Object.defineProperty(n, "__esModule", { value: !0 });
  },
]);
//# sourceMappingURL=map.js.map
