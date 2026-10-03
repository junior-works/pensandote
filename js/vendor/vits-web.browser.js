var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x2) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x2, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x2)(function(x2) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x2 + '" is not supported');
});
var __esm = (fn2, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// stub-node.js
var stub_node_exports = {};
__export(stub_node_exports, {
  default: () => stub_node_default,
  join: () => join,
  readFile: () => readFile
});
var stub_node_default, readFile, join;
var init_stub_node = __esm({
  "stub-node.js"() {
    stub_node_default = {};
    readFile = void 0;
    join = void 0;
  }
});

// node_modules/@diffusionstudio/vits-web/dist/piper-DeOu3H9E.js
var piper_DeOu3H9E_exports = {};
__export(piper_DeOu3H9E_exports, {
  createPiperPhonemize: () => ft
});
var ft;
var init_piper_DeOu3H9E = __esm({
  "node_modules/@diffusionstudio/vits-web/dist/piper-DeOu3H9E.js"() {
    ft = (() => {
      var Q2 = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
      return typeof __filename < "u" && (Q2 = Q2 || __filename), function(Fe = {}) {
        var o = Fe, Pe, ee;
        o.ready = new Promise((e, a) => {
          Pe = e, ee = a;
        }), o.expectedDataFileDownloads || (o.expectedDataFileDownloads = 0), o.expectedDataFileDownloads++, (function() {
          if (!(o.ENVIRONMENT_IS_PTHREAD || o.$ww)) {
            var e = function(a) {
              typeof window == "object" ? window.encodeURIComponent(
                window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/"
              ) : typeof process > "u" && typeof location < "u" && encodeURIComponent(
                location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/"
              );
              var t = "piper_phonemize.data", r = "piper_phonemize.data";
              typeof o.locateFilePackage == "function" && !o.locateFile && (o.locateFile = o.locateFilePackage, C(
                "warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)"
              ));
              var s = o.locateFile ? o.locateFile(r, "") : r, i = a.remote_package_size;
              function d(h2, g, p2, _3) {
                if (typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string") {
                  (init_stub_node(), __toCommonJS(stub_node_exports)).readFile(h2, function(b2, S2) {
                    b2 ? _3(b2) : p2(S2.buffer);
                  });
                  return;
                }
                var E = new XMLHttpRequest();
                E.open("GET", h2, true), E.responseType = "arraybuffer", E.onprogress = function(b2) {
                  var S2 = h2, f2 = g;
                  if (b2.total && (f2 = b2.total), b2.loaded) {
                    E.addedTotal ? o.dataFileDownloads[S2].loaded = b2.loaded : (E.addedTotal = true, o.dataFileDownloads || (o.dataFileDownloads = {}), o.dataFileDownloads[S2] = { loaded: b2.loaded, total: f2 });
                    var c2 = 0, z = 0, D2 = 0;
                    for (var x2 in o.dataFileDownloads) {
                      var R3 = o.dataFileDownloads[x2];
                      c2 += R3.total, z += R3.loaded, D2++;
                    }
                    c2 = Math.ceil(c2 * o.expectedDataFileDownloads / D2), o.setStatus && o.setStatus(`Downloading data... (${z}/${c2})`);
                  } else o.dataFileDownloads || o.setStatus && o.setStatus("Downloading data...");
                }, E.onerror = function(b2) {
                  throw new Error("NetworkError for: " + h2);
                }, E.onload = function(b2) {
                  if (E.status == 200 || E.status == 304 || E.status == 206 || E.status == 0 && E.response) {
                    var S2 = E.response;
                    p2(S2);
                  } else
                    throw new Error(E.statusText + " : " + E.responseURL);
                }, E.send(null);
              }
              function l(h2) {
                console.error("package error:", h2);
              }
              var m = null, v = o.getPreloadedPackage ? o.getPreloadedPackage(s, i) : null;
              v || d(
                s,
                i,
                function(h2) {
                  m ? (m(h2), m = null) : v = h2;
                },
                l
              );
              function y() {
                function h2(b2, S2) {
                  if (!b2) throw S2 + new Error().stack;
                }
                o.FS_createPath("/", "espeak-ng-data", true, true), o.FS_createPath("/espeak-ng-data", "lang", true, true), o.FS_createPath("/espeak-ng-data/lang", "aav", true, true), o.FS_createPath("/espeak-ng-data/lang", "art", true, true), o.FS_createPath("/espeak-ng-data/lang", "azc", true, true), o.FS_createPath("/espeak-ng-data/lang", "bat", true, true), o.FS_createPath("/espeak-ng-data/lang", "bnt", true, true), o.FS_createPath("/espeak-ng-data/lang", "ccs", true, true), o.FS_createPath("/espeak-ng-data/lang", "cel", true, true), o.FS_createPath("/espeak-ng-data/lang", "cus", true, true), o.FS_createPath("/espeak-ng-data/lang", "dra", true, true), o.FS_createPath("/espeak-ng-data/lang", "esx", true, true), o.FS_createPath("/espeak-ng-data/lang", "gmq", true, true), o.FS_createPath("/espeak-ng-data/lang", "gmw", true, true), o.FS_createPath("/espeak-ng-data/lang", "grk", true, true), o.FS_createPath("/espeak-ng-data/lang", "inc", true, true), o.FS_createPath("/espeak-ng-data/lang", "ine", true, true), o.FS_createPath("/espeak-ng-data/lang", "ira", true, true), o.FS_createPath("/espeak-ng-data/lang", "iro", true, true), o.FS_createPath("/espeak-ng-data/lang", "itc", true, true), o.FS_createPath("/espeak-ng-data/lang", "jpx", true, true), o.FS_createPath("/espeak-ng-data/lang", "map", true, true), o.FS_createPath("/espeak-ng-data/lang", "miz", true, true), o.FS_createPath("/espeak-ng-data/lang", "myn", true, true), o.FS_createPath("/espeak-ng-data/lang", "poz", true, true), o.FS_createPath("/espeak-ng-data/lang", "roa", true, true), o.FS_createPath("/espeak-ng-data/lang", "sai", true, true), o.FS_createPath("/espeak-ng-data/lang", "sem", true, true), o.FS_createPath("/espeak-ng-data/lang", "sit", true, true), o.FS_createPath("/espeak-ng-data/lang", "tai", true, true), o.FS_createPath("/espeak-ng-data/lang", "trk", true, true), o.FS_createPath("/espeak-ng-data/lang", "urj", true, true), o.FS_createPath("/espeak-ng-data/lang", "zle", true, true), o.FS_createPath("/espeak-ng-data/lang", "zls", true, true), o.FS_createPath("/espeak-ng-data/lang", "zlw", true, true), o.FS_createPath("/espeak-ng-data", "mbrola_ph", true, true), o.FS_createPath("/espeak-ng-data", "voices", true, true), o.FS_createPath("/espeak-ng-data/voices", "!v", true, true), o.FS_createPath("/espeak-ng-data/voices", "mb", true, true);
                function g(b2, S2, f2) {
                  this.start = b2, this.end = S2, this.audio = f2;
                }
                g.prototype = {
                  requests: {},
                  open: function(b2, S2) {
                    this.name = S2, this.requests[S2] = this, o.addRunDependency(`fp ${this.name}`);
                  },
                  send: function() {
                  },
                  onload: function() {
                    var b2 = this.byteArray.subarray(this.start, this.end);
                    this.finish(b2);
                  },
                  finish: function(b2) {
                    var S2 = this;
                    o.FS_createDataFile(this.name, null, b2, true, true, true), o.removeRunDependency(`fp ${S2.name}`), this.requests[this.name] = null;
                  }
                };
                for (var p2 = a.files, _3 = 0; _3 < p2.length; ++_3)
                  new g(p2[_3].start, p2[_3].end, p2[_3].audio || 0).open(
                    "GET",
                    p2[_3].filename
                  );
                function E(b2) {
                  h2(b2, "Loading data file failed."), h2(
                    b2.constructor.name === ArrayBuffer.name,
                    "bad input to processPackageData"
                  );
                  var S2 = new Uint8Array(b2);
                  g.prototype.byteArray = S2;
                  for (var f2 = a.files, c2 = 0; c2 < f2.length; ++c2)
                    g.prototype.requests[f2[c2].filename].onload();
                  o.removeRunDependency("datafile_piper_phonemize.data");
                }
                o.addRunDependency("datafile_piper_phonemize.data"), o.preloadResults || (o.preloadResults = {}), o.preloadResults[t] = { fromCache: false }, v ? (E(v), v = null) : m = E;
              }
              o.calledRun ? y() : (o.preRun || (o.preRun = []), o.preRun.push(y));
            };
            e({
              files: [
                { filename: "/espeak-ng-data/af_dict", start: 0, end: 121473 },
                { filename: "/espeak-ng-data/am_dict", start: 121473, end: 185351 },
                { filename: "/espeak-ng-data/an_dict", start: 185351, end: 192042 },
                { filename: "/espeak-ng-data/ar_dict", start: 192042, end: 670207 },
                { filename: "/espeak-ng-data/as_dict", start: 670207, end: 675212 },
                { filename: "/espeak-ng-data/az_dict", start: 675212, end: 718985 },
                { filename: "/espeak-ng-data/ba_dict", start: 718985, end: 721083 },
                { filename: "/espeak-ng-data/be_dict", start: 721083, end: 723735 },
                { filename: "/espeak-ng-data/bg_dict", start: 723735, end: 810786 },
                { filename: "/espeak-ng-data/bn_dict", start: 810786, end: 900765 },
                { filename: "/espeak-ng-data/bpy_dict", start: 900765, end: 905991 },
                { filename: "/espeak-ng-data/bs_dict", start: 905991, end: 953059 },
                { filename: "/espeak-ng-data/ca_dict", start: 953059, end: 998625 },
                { filename: "/espeak-ng-data/chr_dict", start: 998625, end: 1001484 },
                { filename: "/espeak-ng-data/cmn_dict", start: 1001484, end: 2567819 },
                { filename: "/espeak-ng-data/cs_dict", start: 2567819, end: 2617464 },
                { filename: "/espeak-ng-data/cv_dict", start: 2617464, end: 2618808 },
                { filename: "/espeak-ng-data/cy_dict", start: 2618808, end: 2661938 },
                { filename: "/espeak-ng-data/da_dict", start: 2661938, end: 2907225 },
                { filename: "/espeak-ng-data/de_dict", start: 2907225, end: 2975501 },
                { filename: "/espeak-ng-data/el_dict", start: 2975501, end: 3048342 },
                { filename: "/espeak-ng-data/en_dict", start: 3048342, end: 3215286 },
                { filename: "/espeak-ng-data/eo_dict", start: 3215286, end: 3219952 },
                { filename: "/espeak-ng-data/es_dict", start: 3219952, end: 3269204 },
                { filename: "/espeak-ng-data/et_dict", start: 3269204, end: 3313467 },
                { filename: "/espeak-ng-data/eu_dict", start: 3313467, end: 3362308 },
                { filename: "/espeak-ng-data/fa_dict", start: 3362308, end: 3655543 },
                { filename: "/espeak-ng-data/fi_dict", start: 3655543, end: 3699471 },
                { filename: "/espeak-ng-data/fr_dict", start: 3699471, end: 3763198 },
                { filename: "/espeak-ng-data/ga_dict", start: 3763198, end: 3815871 },
                { filename: "/espeak-ng-data/gd_dict", start: 3815871, end: 3864992 },
                { filename: "/espeak-ng-data/gn_dict", start: 3864992, end: 3868240 },
                { filename: "/espeak-ng-data/grc_dict", start: 3868240, end: 3871673 },
                { filename: "/espeak-ng-data/gu_dict", start: 3871673, end: 3954153 },
                { filename: "/espeak-ng-data/hak_dict", start: 3954153, end: 3957488 },
                { filename: "/espeak-ng-data/haw_dict", start: 3957488, end: 3959931 },
                { filename: "/espeak-ng-data/he_dict", start: 3959931, end: 3966894 },
                { filename: "/espeak-ng-data/hi_dict", start: 3966894, end: 4059037 },
                { filename: "/espeak-ng-data/hr_dict", start: 4059037, end: 4108425 },
                { filename: "/espeak-ng-data/ht_dict", start: 4108425, end: 4110228 },
                { filename: "/espeak-ng-data/hu_dict", start: 4110228, end: 4264013 },
                { filename: "/espeak-ng-data/hy_dict", start: 4264013, end: 4326276 },
                { filename: "/espeak-ng-data/ia_dict", start: 4326276, end: 4657551 },
                { filename: "/espeak-ng-data/id_dict", start: 4657551, end: 4701009 },
                { filename: "/espeak-ng-data/intonations", start: 4701009, end: 4703049 },
                { filename: "/espeak-ng-data/io_dict", start: 4703049, end: 4705214 },
                { filename: "/espeak-ng-data/is_dict", start: 4705214, end: 4749568 },
                { filename: "/espeak-ng-data/it_dict", start: 4749568, end: 4902457 },
                { filename: "/espeak-ng-data/ja_dict", start: 4902457, end: 4950109 },
                { filename: "/espeak-ng-data/jbo_dict", start: 4950109, end: 4952352 },
                { filename: "/espeak-ng-data/ka_dict", start: 4952352, end: 5040127 },
                { filename: "/espeak-ng-data/kk_dict", start: 5040127, end: 5041986 },
                { filename: "/espeak-ng-data/kl_dict", start: 5041986, end: 5044824 },
                { filename: "/espeak-ng-data/kn_dict", start: 5044824, end: 5132652 },
                { filename: "/espeak-ng-data/ko_dict", start: 5132652, end: 5180175 },
                { filename: "/espeak-ng-data/kok_dict", start: 5180175, end: 5186569 },
                { filename: "/espeak-ng-data/ku_dict", start: 5186569, end: 5188834 },
                { filename: "/espeak-ng-data/ky_dict", start: 5188834, end: 5253811 },
                { filename: "/espeak-ng-data/la_dict", start: 5253811, end: 5257617 },
                { filename: "/espeak-ng-data/lang/aav/vi", start: 5257617, end: 5257728 },
                { filename: "/espeak-ng-data/lang/aav/vi-VN-x-central", start: 5257728, end: 5257871 },
                { filename: "/espeak-ng-data/lang/aav/vi-VN-x-south", start: 5257871, end: 5258013 },
                { filename: "/espeak-ng-data/lang/art/eo", start: 5258013, end: 5258054 },
                { filename: "/espeak-ng-data/lang/art/ia", start: 5258054, end: 5258083 },
                { filename: "/espeak-ng-data/lang/art/io", start: 5258083, end: 5258133 },
                { filename: "/espeak-ng-data/lang/art/jbo", start: 5258133, end: 5258202 },
                { filename: "/espeak-ng-data/lang/art/lfn", start: 5258202, end: 5258337 },
                { filename: "/espeak-ng-data/lang/art/piqd", start: 5258337, end: 5258393 },
                { filename: "/espeak-ng-data/lang/art/py", start: 5258393, end: 5258533 },
                { filename: "/espeak-ng-data/lang/art/qdb", start: 5258533, end: 5258590 },
                { filename: "/espeak-ng-data/lang/art/qya", start: 5258590, end: 5258763 },
                { filename: "/espeak-ng-data/lang/art/sjn", start: 5258763, end: 5258938 },
                { filename: "/espeak-ng-data/lang/azc/nci", start: 5258938, end: 5259052 },
                { filename: "/espeak-ng-data/lang/bat/lt", start: 5259052, end: 5259080 },
                { filename: "/espeak-ng-data/lang/bat/ltg", start: 5259080, end: 5259392 },
                { filename: "/espeak-ng-data/lang/bat/lv", start: 5259392, end: 5259621 },
                { filename: "/espeak-ng-data/lang/bnt/sw", start: 5259621, end: 5259662 },
                { filename: "/espeak-ng-data/lang/bnt/tn", start: 5259662, end: 5259704 },
                { filename: "/espeak-ng-data/lang/ccs/ka", start: 5259704, end: 5259828 },
                { filename: "/espeak-ng-data/lang/cel/cy", start: 5259828, end: 5259865 },
                { filename: "/espeak-ng-data/lang/cel/ga", start: 5259865, end: 5259931 },
                { filename: "/espeak-ng-data/lang/cel/gd", start: 5259931, end: 5259982 },
                { filename: "/espeak-ng-data/lang/cus/om", start: 5259982, end: 5260021 },
                { filename: "/espeak-ng-data/lang/dra/kn", start: 5260021, end: 5260076 },
                { filename: "/espeak-ng-data/lang/dra/ml", start: 5260076, end: 5260133 },
                { filename: "/espeak-ng-data/lang/dra/ta", start: 5260133, end: 5260184 },
                { filename: "/espeak-ng-data/lang/dra/te", start: 5260184, end: 5260254 },
                { filename: "/espeak-ng-data/lang/esx/kl", start: 5260254, end: 5260284 },
                { filename: "/espeak-ng-data/lang/eu", start: 5260284, end: 5260338 },
                { filename: "/espeak-ng-data/lang/gmq/da", start: 5260338, end: 5260381 },
                { filename: "/espeak-ng-data/lang/gmq/is", start: 5260381, end: 5260408 },
                { filename: "/espeak-ng-data/lang/gmq/nb", start: 5260408, end: 5260495 },
                { filename: "/espeak-ng-data/lang/gmq/sv", start: 5260495, end: 5260520 },
                { filename: "/espeak-ng-data/lang/gmw/af", start: 5260520, end: 5260643 },
                { filename: "/espeak-ng-data/lang/gmw/de", start: 5260643, end: 5260685 },
                { filename: "/espeak-ng-data/lang/gmw/en", start: 5260685, end: 5260825 },
                { filename: "/espeak-ng-data/lang/gmw/en-029", start: 5260825, end: 5261160 },
                { filename: "/espeak-ng-data/lang/gmw/en-GB-scotland", start: 5261160, end: 5261455 },
                { filename: "/espeak-ng-data/lang/gmw/en-GB-x-gbclan", start: 5261455, end: 5261693 },
                { filename: "/espeak-ng-data/lang/gmw/en-GB-x-gbcwmd", start: 5261693, end: 5261881 },
                { filename: "/espeak-ng-data/lang/gmw/en-GB-x-rp", start: 5261881, end: 5262130 },
                { filename: "/espeak-ng-data/lang/gmw/en-US", start: 5262130, end: 5262387 },
                { filename: "/espeak-ng-data/lang/gmw/en-US-nyc", start: 5262387, end: 5262658 },
                { filename: "/espeak-ng-data/lang/gmw/lb", start: 5262658, end: 5262689 },
                { filename: "/espeak-ng-data/lang/gmw/nl", start: 5262689, end: 5262712 },
                { filename: "/espeak-ng-data/lang/grk/el", start: 5262712, end: 5262735 },
                { filename: "/espeak-ng-data/lang/grk/grc", start: 5262735, end: 5262834 },
                { filename: "/espeak-ng-data/lang/inc/as", start: 5262834, end: 5262876 },
                { filename: "/espeak-ng-data/lang/inc/bn", start: 5262876, end: 5262901 },
                { filename: "/espeak-ng-data/lang/inc/bpy", start: 5262901, end: 5262940 },
                { filename: "/espeak-ng-data/lang/inc/gu", start: 5262940, end: 5262982 },
                { filename: "/espeak-ng-data/lang/inc/hi", start: 5262982, end: 5263005 },
                { filename: "/espeak-ng-data/lang/inc/kok", start: 5263005, end: 5263031 },
                { filename: "/espeak-ng-data/lang/inc/mr", start: 5263031, end: 5263072 },
                { filename: "/espeak-ng-data/lang/inc/ne", start: 5263072, end: 5263109 },
                { filename: "/espeak-ng-data/lang/inc/or", start: 5263109, end: 5263148 },
                { filename: "/espeak-ng-data/lang/inc/pa", start: 5263148, end: 5263173 },
                { filename: "/espeak-ng-data/lang/inc/sd", start: 5263173, end: 5263239 },
                { filename: "/espeak-ng-data/lang/inc/si", start: 5263239, end: 5263294 },
                { filename: "/espeak-ng-data/lang/inc/ur", start: 5263294, end: 5263388 },
                { filename: "/espeak-ng-data/lang/ine/hy", start: 5263388, end: 5263449 },
                { filename: "/espeak-ng-data/lang/ine/hyw", start: 5263449, end: 5263814 },
                { filename: "/espeak-ng-data/lang/ine/sq", start: 5263814, end: 5263917 },
                { filename: "/espeak-ng-data/lang/ira/fa", start: 5263917, end: 5264007 },
                { filename: "/espeak-ng-data/lang/ira/fa-Latn", start: 5264007, end: 5264276 },
                { filename: "/espeak-ng-data/lang/ira/ku", start: 5264276, end: 5264316 },
                { filename: "/espeak-ng-data/lang/iro/chr", start: 5264316, end: 5264885 },
                { filename: "/espeak-ng-data/lang/itc/la", start: 5264885, end: 5265182 },
                { filename: "/espeak-ng-data/lang/jpx/ja", start: 5265182, end: 5265234 },
                { filename: "/espeak-ng-data/lang/ko", start: 5265234, end: 5265285 },
                { filename: "/espeak-ng-data/lang/map/haw", start: 5265285, end: 5265327 },
                { filename: "/espeak-ng-data/lang/miz/mto", start: 5265327, end: 5265510 },
                { filename: "/espeak-ng-data/lang/myn/quc", start: 5265510, end: 5265720 },
                { filename: "/espeak-ng-data/lang/poz/id", start: 5265720, end: 5265854 },
                { filename: "/espeak-ng-data/lang/poz/mi", start: 5265854, end: 5266221 },
                { filename: "/espeak-ng-data/lang/poz/ms", start: 5266221, end: 5266651 },
                { filename: "/espeak-ng-data/lang/qu", start: 5266651, end: 5266739 },
                { filename: "/espeak-ng-data/lang/roa/an", start: 5266739, end: 5266766 },
                { filename: "/espeak-ng-data/lang/roa/ca", start: 5266766, end: 5266791 },
                { filename: "/espeak-ng-data/lang/roa/es", start: 5266791, end: 5266854 },
                { filename: "/espeak-ng-data/lang/roa/es-419", start: 5266854, end: 5267021 },
                { filename: "/espeak-ng-data/lang/roa/fr", start: 5267021, end: 5267100 },
                { filename: "/espeak-ng-data/lang/roa/fr-BE", start: 5267100, end: 5267184 },
                { filename: "/espeak-ng-data/lang/roa/fr-CH", start: 5267184, end: 5267270 },
                { filename: "/espeak-ng-data/lang/roa/ht", start: 5267270, end: 5267410 },
                { filename: "/espeak-ng-data/lang/roa/it", start: 5267410, end: 5267519 },
                { filename: "/espeak-ng-data/lang/roa/pap", start: 5267519, end: 5267581 },
                { filename: "/espeak-ng-data/lang/roa/pt", start: 5267581, end: 5267676 },
                { filename: "/espeak-ng-data/lang/roa/pt-BR", start: 5267676, end: 5267785 },
                { filename: "/espeak-ng-data/lang/roa/ro", start: 5267785, end: 5267811 },
                { filename: "/espeak-ng-data/lang/sai/gn", start: 5267811, end: 5267858 },
                { filename: "/espeak-ng-data/lang/sem/am", start: 5267858, end: 5267899 },
                { filename: "/espeak-ng-data/lang/sem/ar", start: 5267899, end: 5267949 },
                { filename: "/espeak-ng-data/lang/sem/he", start: 5267949, end: 5267989 },
                { filename: "/espeak-ng-data/lang/sem/mt", start: 5267989, end: 5268030 },
                { filename: "/espeak-ng-data/lang/sit/cmn", start: 5268030, end: 5268716 },
                { filename: "/espeak-ng-data/lang/sit/cmn-Latn-pinyin", start: 5268716, end: 5268877 },
                { filename: "/espeak-ng-data/lang/sit/hak", start: 5268877, end: 5269005 },
                { filename: "/espeak-ng-data/lang/sit/my", start: 5269005, end: 5269061 },
                { filename: "/espeak-ng-data/lang/sit/yue", start: 5269061, end: 5269255 },
                { filename: "/espeak-ng-data/lang/sit/yue-Latn-jyutping", start: 5269255, end: 5269468 },
                { filename: "/espeak-ng-data/lang/tai/shn", start: 5269468, end: 5269560 },
                { filename: "/espeak-ng-data/lang/tai/th", start: 5269560, end: 5269597 },
                { filename: "/espeak-ng-data/lang/trk/az", start: 5269597, end: 5269642 },
                { filename: "/espeak-ng-data/lang/trk/ba", start: 5269642, end: 5269667 },
                { filename: "/espeak-ng-data/lang/trk/cv", start: 5269667, end: 5269707 },
                { filename: "/espeak-ng-data/lang/trk/kk", start: 5269707, end: 5269747 },
                { filename: "/espeak-ng-data/lang/trk/ky", start: 5269747, end: 5269790 },
                { filename: "/espeak-ng-data/lang/trk/nog", start: 5269790, end: 5269829 },
                { filename: "/espeak-ng-data/lang/trk/tk", start: 5269829, end: 5269854 },
                { filename: "/espeak-ng-data/lang/trk/tr", start: 5269854, end: 5269879 },
                { filename: "/espeak-ng-data/lang/trk/tt", start: 5269879, end: 5269902 },
                { filename: "/espeak-ng-data/lang/trk/ug", start: 5269902, end: 5269926 },
                { filename: "/espeak-ng-data/lang/trk/uz", start: 5269926, end: 5269965 },
                { filename: "/espeak-ng-data/lang/urj/et", start: 5269965, end: 5270202 },
                { filename: "/espeak-ng-data/lang/urj/fi", start: 5270202, end: 5270439 },
                { filename: "/espeak-ng-data/lang/urj/hu", start: 5270439, end: 5270512 },
                { filename: "/espeak-ng-data/lang/urj/smj", start: 5270512, end: 5270557 },
                { filename: "/espeak-ng-data/lang/zle/be", start: 5270557, end: 5270609 },
                { filename: "/espeak-ng-data/lang/zle/ru", start: 5270609, end: 5270666 },
                { filename: "/espeak-ng-data/lang/zle/ru-LV", start: 5270666, end: 5270946 },
                { filename: "/espeak-ng-data/lang/zle/ru-cl", start: 5270946, end: 5271037 },
                { filename: "/espeak-ng-data/lang/zle/uk", start: 5271037, end: 5271134 },
                { filename: "/espeak-ng-data/lang/zls/bg", start: 5271134, end: 5271245 },
                { filename: "/espeak-ng-data/lang/zls/bs", start: 5271245, end: 5271475 },
                { filename: "/espeak-ng-data/lang/zls/hr", start: 5271475, end: 5271737 },
                { filename: "/espeak-ng-data/lang/zls/mk", start: 5271737, end: 5271765 },
                { filename: "/espeak-ng-data/lang/zls/sl", start: 5271765, end: 5271808 },
                { filename: "/espeak-ng-data/lang/zls/sr", start: 5271808, end: 5272058 },
                { filename: "/espeak-ng-data/lang/zlw/cs", start: 5272058, end: 5272081 },
                { filename: "/espeak-ng-data/lang/zlw/pl", start: 5272081, end: 5272119 },
                { filename: "/espeak-ng-data/lang/zlw/sk", start: 5272119, end: 5272143 },
                { filename: "/espeak-ng-data/lb_dict", start: 5272143, end: 5960074 },
                { filename: "/espeak-ng-data/lfn_dict", start: 5960074, end: 5962867 },
                { filename: "/espeak-ng-data/lt_dict", start: 5962867, end: 6012757 },
                { filename: "/espeak-ng-data/lv_dict", start: 6012757, end: 6079094 },
                { filename: "/espeak-ng-data/mbrola_ph/af1_phtrans", start: 6079094, end: 6080730 },
                { filename: "/espeak-ng-data/mbrola_ph/ar1_phtrans", start: 6080730, end: 6082342 },
                { filename: "/espeak-ng-data/mbrola_ph/ar2_phtrans", start: 6082342, end: 6083954 },
                { filename: "/espeak-ng-data/mbrola_ph/ca_phtrans", start: 6083954, end: 6085950 },
                { filename: "/espeak-ng-data/mbrola_ph/cmn_phtrans", start: 6085950, end: 6087442 },
                { filename: "/espeak-ng-data/mbrola_ph/cr1_phtrans", start: 6087442, end: 6089606 },
                { filename: "/espeak-ng-data/mbrola_ph/cs_phtrans", start: 6089606, end: 6090186 },
                { filename: "/espeak-ng-data/mbrola_ph/de2_phtrans", start: 6090186, end: 6091918 },
                { filename: "/espeak-ng-data/mbrola_ph/de4_phtrans", start: 6091918, end: 6093722 },
                { filename: "/espeak-ng-data/mbrola_ph/de6_phtrans", start: 6093722, end: 6095118 },
                { filename: "/espeak-ng-data/mbrola_ph/de8_phtrans", start: 6095118, end: 6096274 },
                { filename: "/espeak-ng-data/mbrola_ph/ee1_phtrans", start: 6096274, end: 6097718 },
                { filename: "/espeak-ng-data/mbrola_ph/en1_phtrans", start: 6097718, end: 6098514 },
                { filename: "/espeak-ng-data/mbrola_ph/es3_phtrans", start: 6098514, end: 6099574 },
                { filename: "/espeak-ng-data/mbrola_ph/es4_phtrans", start: 6099574, end: 6100682 },
                { filename: "/espeak-ng-data/mbrola_ph/es_phtrans", start: 6100682, end: 6102414 },
                { filename: "/espeak-ng-data/mbrola_ph/fr_phtrans", start: 6102414, end: 6104386 },
                { filename: "/espeak-ng-data/mbrola_ph/gr1_phtrans", start: 6104386, end: 6106598 },
                { filename: "/espeak-ng-data/mbrola_ph/gr2_phtrans", start: 6106598, end: 6108810 },
                { filename: "/espeak-ng-data/mbrola_ph/grc-de6_phtrans", start: 6108810, end: 6109294 },
                { filename: "/espeak-ng-data/mbrola_ph/he_phtrans", start: 6109294, end: 6110042 },
                { filename: "/espeak-ng-data/mbrola_ph/hn1_phtrans", start: 6110042, end: 6110574 },
                { filename: "/espeak-ng-data/mbrola_ph/hu1_phtrans", start: 6110574, end: 6112018 },
                { filename: "/espeak-ng-data/mbrola_ph/ic1_phtrans", start: 6112018, end: 6113150 },
                { filename: "/espeak-ng-data/mbrola_ph/id1_phtrans", start: 6113150, end: 6114858 },
                { filename: "/espeak-ng-data/mbrola_ph/in_phtrans", start: 6114858, end: 6116302 },
                { filename: "/espeak-ng-data/mbrola_ph/ir1_phtrans", start: 6116302, end: 6122114 },
                { filename: "/espeak-ng-data/mbrola_ph/it1_phtrans", start: 6122114, end: 6123438 },
                { filename: "/espeak-ng-data/mbrola_ph/it3_phtrans", start: 6123438, end: 6124330 },
                { filename: "/espeak-ng-data/mbrola_ph/jp_phtrans", start: 6124330, end: 6125366 },
                { filename: "/espeak-ng-data/mbrola_ph/la1_phtrans", start: 6125366, end: 6126114 },
                { filename: "/espeak-ng-data/mbrola_ph/lt_phtrans", start: 6126114, end: 6127174 },
                { filename: "/espeak-ng-data/mbrola_ph/ma1_phtrans", start: 6127174, end: 6128114 },
                { filename: "/espeak-ng-data/mbrola_ph/mx1_phtrans", start: 6128114, end: 6129918 },
                { filename: "/espeak-ng-data/mbrola_ph/mx2_phtrans", start: 6129918, end: 6131746 },
                { filename: "/espeak-ng-data/mbrola_ph/nl_phtrans", start: 6131746, end: 6133430 },
                { filename: "/espeak-ng-data/mbrola_ph/nz1_phtrans", start: 6133430, end: 6134154 },
                { filename: "/espeak-ng-data/mbrola_ph/pl1_phtrans", start: 6134154, end: 6135742 },
                { filename: "/espeak-ng-data/mbrola_ph/pt1_phtrans", start: 6135742, end: 6137834 },
                { filename: "/espeak-ng-data/mbrola_ph/ptbr4_phtrans", start: 6137834, end: 6140190 },
                { filename: "/espeak-ng-data/mbrola_ph/ptbr_phtrans", start: 6140190, end: 6142714 },
                { filename: "/espeak-ng-data/mbrola_ph/ro1_phtrans", start: 6142714, end: 6144878 },
                { filename: "/espeak-ng-data/mbrola_ph/sv2_phtrans", start: 6144878, end: 6146466 },
                { filename: "/espeak-ng-data/mbrola_ph/sv_phtrans", start: 6146466, end: 6148054 },
                { filename: "/espeak-ng-data/mbrola_ph/tl1_phtrans", start: 6148054, end: 6148826 },
                { filename: "/espeak-ng-data/mbrola_ph/tr1_phtrans", start: 6148826, end: 6149190 },
                { filename: "/espeak-ng-data/mbrola_ph/us3_phtrans", start: 6149190, end: 6150346 },
                { filename: "/espeak-ng-data/mbrola_ph/us_phtrans", start: 6150346, end: 6151574 },
                { filename: "/espeak-ng-data/mbrola_ph/vz_phtrans", start: 6151574, end: 6153858 },
                { filename: "/espeak-ng-data/mi_dict", start: 6153858, end: 6155204 },
                { filename: "/espeak-ng-data/mk_dict", start: 6155204, end: 6219063 },
                { filename: "/espeak-ng-data/ml_dict", start: 6219063, end: 6311408 },
                { filename: "/espeak-ng-data/mr_dict", start: 6311408, end: 6398799 },
                { filename: "/espeak-ng-data/ms_dict", start: 6398799, end: 6452340 },
                { filename: "/espeak-ng-data/mt_dict", start: 6452340, end: 6456724 },
                { filename: "/espeak-ng-data/mto_dict", start: 6456724, end: 6460684 },
                { filename: "/espeak-ng-data/my_dict", start: 6460684, end: 6556632 },
                { filename: "/espeak-ng-data/nci_dict", start: 6556632, end: 6558166 },
                { filename: "/espeak-ng-data/ne_dict", start: 6558166, end: 6653543 },
                { filename: "/espeak-ng-data/nl_dict", start: 6653543, end: 6719522 },
                { filename: "/espeak-ng-data/no_dict", start: 6719522, end: 6723700 },
                { filename: "/espeak-ng-data/nog_dict", start: 6723700, end: 6726994 },
                { filename: "/espeak-ng-data/om_dict", start: 6726994, end: 6729296 },
                { filename: "/espeak-ng-data/or_dict", start: 6729296, end: 6818542 },
                { filename: "/espeak-ng-data/pa_dict", start: 6818542, end: 6898495 },
                { filename: "/espeak-ng-data/pap_dict", start: 6898495, end: 6900623 },
                { filename: "/espeak-ng-data/phondata", start: 6900623, end: 7451047 },
                { filename: "/espeak-ng-data/phondata-manifest", start: 7451047, end: 7472868 },
                { filename: "/espeak-ng-data/phonindex", start: 7472868, end: 7511942 },
                { filename: "/espeak-ng-data/phontab", start: 7511942, end: 7567738 },
                { filename: "/espeak-ng-data/piqd_dict", start: 7567738, end: 7569448 },
                { filename: "/espeak-ng-data/pl_dict", start: 7569448, end: 7646178 },
                { filename: "/espeak-ng-data/pt_dict", start: 7646178, end: 7713995 },
                { filename: "/espeak-ng-data/py_dict", start: 7713995, end: 7716404 },
                { filename: "/espeak-ng-data/qdb_dict", start: 7716404, end: 7719432 },
                { filename: "/espeak-ng-data/qu_dict", start: 7719432, end: 7721351 },
                { filename: "/espeak-ng-data/quc_dict", start: 7721351, end: 7722801 },
                { filename: "/espeak-ng-data/qya_dict", start: 7722801, end: 7724740 },
                { filename: "/espeak-ng-data/ro_dict", start: 7724740, end: 7793278 },
                { filename: "/espeak-ng-data/ru_dict", start: 7793278, end: 16325670 },
                { filename: "/espeak-ng-data/sd_dict", start: 16325670, end: 16385598 },
                { filename: "/espeak-ng-data/shn_dict", start: 16385598, end: 16473770 },
                { filename: "/espeak-ng-data/si_dict", start: 16473770, end: 16559154 },
                { filename: "/espeak-ng-data/sjn_dict", start: 16559154, end: 16560937 },
                { filename: "/espeak-ng-data/sk_dict", start: 16560937, end: 16610939 },
                { filename: "/espeak-ng-data/sl_dict", start: 16610939, end: 16655986 },
                { filename: "/espeak-ng-data/smj_dict", start: 16655986, end: 16691081 },
                { filename: "/espeak-ng-data/sq_dict", start: 16691081, end: 16736084 },
                { filename: "/espeak-ng-data/sr_dict", start: 16736084, end: 16782916 },
                { filename: "/espeak-ng-data/sv_dict", start: 16782916, end: 16830752 },
                { filename: "/espeak-ng-data/sw_dict", start: 16830752, end: 16878556 },
                { filename: "/espeak-ng-data/ta_dict", start: 16878556, end: 17088109 },
                { filename: "/espeak-ng-data/te_dict", start: 17088109, end: 17182946 },
                { filename: "/espeak-ng-data/th_dict", start: 17182946, end: 17185247 },
                { filename: "/espeak-ng-data/tk_dict", start: 17185247, end: 17206115 },
                { filename: "/espeak-ng-data/tn_dict", start: 17206115, end: 17209187 },
                { filename: "/espeak-ng-data/tr_dict", start: 17209187, end: 17255980 },
                { filename: "/espeak-ng-data/tt_dict", start: 17255980, end: 17258101 },
                { filename: "/espeak-ng-data/ug_dict", start: 17258101, end: 17260171 },
                { filename: "/espeak-ng-data/uk_dict", start: 17260171, end: 17263663 },
                { filename: "/espeak-ng-data/ur_dict", start: 17263663, end: 17397219 },
                { filename: "/espeak-ng-data/uz_dict", start: 17397219, end: 17399759 },
                { filename: "/espeak-ng-data/vi_dict", start: 17399759, end: 17452367 },
                { filename: "/espeak-ng-data/voices/!v/Alex", start: 17452367, end: 17452495 },
                { filename: "/espeak-ng-data/voices/!v/Alicia", start: 17452495, end: 17452969 },
                { filename: "/espeak-ng-data/voices/!v/Andrea", start: 17452969, end: 17453326 },
                { filename: "/espeak-ng-data/voices/!v/Andy", start: 17453326, end: 17453646 },
                { filename: "/espeak-ng-data/voices/!v/Annie", start: 17453646, end: 17453961 },
                { filename: "/espeak-ng-data/voices/!v/AnxiousAndy", start: 17453961, end: 17454322 },
                { filename: "/espeak-ng-data/voices/!v/Demonic", start: 17454322, end: 17458180 },
                { filename: "/espeak-ng-data/voices/!v/Denis", start: 17458180, end: 17458485 },
                { filename: "/espeak-ng-data/voices/!v/Diogo", start: 17458485, end: 17458864 },
                { filename: "/espeak-ng-data/voices/!v/Gene", start: 17458864, end: 17459145 },
                { filename: "/espeak-ng-data/voices/!v/Gene2", start: 17459145, end: 17459428 },
                { filename: "/espeak-ng-data/voices/!v/Henrique", start: 17459428, end: 17459809 },
                { filename: "/espeak-ng-data/voices/!v/Hugo", start: 17459809, end: 17460187 },
                { filename: "/espeak-ng-data/voices/!v/Jacky", start: 17460187, end: 17460454 },
                { filename: "/espeak-ng-data/voices/!v/Lee", start: 17460454, end: 17460792 },
                { filename: "/espeak-ng-data/voices/!v/Marco", start: 17460792, end: 17461259 },
                { filename: "/espeak-ng-data/voices/!v/Mario", start: 17461259, end: 17461529 },
                { filename: "/espeak-ng-data/voices/!v/Michael", start: 17461529, end: 17461799 },
                { filename: "/espeak-ng-data/voices/!v/Mike", start: 17461799, end: 17461911 },
                { filename: "/espeak-ng-data/voices/!v/Mr serious", start: 17461911, end: 17465104 },
                { filename: "/espeak-ng-data/voices/!v/Nguyen", start: 17465104, end: 17465384 },
                { filename: "/espeak-ng-data/voices/!v/Reed", start: 17465384, end: 17465586 },
                { filename: "/espeak-ng-data/voices/!v/RicishayMax", start: 17465586, end: 17465819 },
                { filename: "/espeak-ng-data/voices/!v/RicishayMax2", start: 17465819, end: 17466254 },
                { filename: "/espeak-ng-data/voices/!v/RicishayMax3", start: 17466254, end: 17466689 },
                { filename: "/espeak-ng-data/voices/!v/Storm", start: 17466689, end: 17467109 },
                { filename: "/espeak-ng-data/voices/!v/Tweaky", start: 17467109, end: 17470298 },
                { filename: "/espeak-ng-data/voices/!v/UniRobot", start: 17470298, end: 17470715 },
                { filename: "/espeak-ng-data/voices/!v/adam", start: 17470715, end: 17470790 },
                { filename: "/espeak-ng-data/voices/!v/anika", start: 17470790, end: 17471283 },
                { filename: "/espeak-ng-data/voices/!v/anikaRobot", start: 17471283, end: 17471795 },
                { filename: "/espeak-ng-data/voices/!v/announcer", start: 17471795, end: 17472095 },
                { filename: "/espeak-ng-data/voices/!v/antonio", start: 17472095, end: 17472476 },
                { filename: "/espeak-ng-data/voices/!v/aunty", start: 17472476, end: 17472834 },
                { filename: "/espeak-ng-data/voices/!v/belinda", start: 17472834, end: 17473174 },
                { filename: "/espeak-ng-data/voices/!v/benjamin", start: 17473174, end: 17473375 },
                { filename: "/espeak-ng-data/voices/!v/boris", start: 17473375, end: 17473599 },
                { filename: "/espeak-ng-data/voices/!v/caleb", start: 17473599, end: 17473656 },
                { filename: "/espeak-ng-data/voices/!v/croak", start: 17473656, end: 17473749 },
                { filename: "/espeak-ng-data/voices/!v/david", start: 17473749, end: 17473861 },
                { filename: "/espeak-ng-data/voices/!v/ed", start: 17473861, end: 17474148 },
                { filename: "/espeak-ng-data/voices/!v/edward", start: 17474148, end: 17474299 },
                { filename: "/espeak-ng-data/voices/!v/edward2", start: 17474299, end: 17474451 },
                { filename: "/espeak-ng-data/voices/!v/f1", start: 17474451, end: 17474775 },
                { filename: "/espeak-ng-data/voices/!v/f2", start: 17474775, end: 17475132 },
                { filename: "/espeak-ng-data/voices/!v/f3", start: 17475132, end: 17475507 },
                { filename: "/espeak-ng-data/voices/!v/f4", start: 17475507, end: 17475857 },
                { filename: "/espeak-ng-data/voices/!v/f5", start: 17475857, end: 17476289 },
                { filename: "/espeak-ng-data/voices/!v/fast", start: 17476289, end: 17476438 },
                { filename: "/espeak-ng-data/voices/!v/grandma", start: 17476438, end: 17476701 },
                { filename: "/espeak-ng-data/voices/!v/grandpa", start: 17476701, end: 17476957 },
                { filename: "/espeak-ng-data/voices/!v/gustave", start: 17476957, end: 17477210 },
                { filename: "/espeak-ng-data/voices/!v/ian", start: 17477210, end: 17480378 },
                { filename: "/espeak-ng-data/voices/!v/iven", start: 17480378, end: 17480639 },
                { filename: "/espeak-ng-data/voices/!v/iven2", start: 17480639, end: 17480918 },
                { filename: "/espeak-ng-data/voices/!v/iven3", start: 17480918, end: 17481180 },
                { filename: "/espeak-ng-data/voices/!v/iven4", start: 17481180, end: 17481441 },
                { filename: "/espeak-ng-data/voices/!v/john", start: 17481441, end: 17484627 },
                { filename: "/espeak-ng-data/voices/!v/kaukovalta", start: 17484627, end: 17484988 },
                { filename: "/espeak-ng-data/voices/!v/klatt", start: 17484988, end: 17485026 },
                { filename: "/espeak-ng-data/voices/!v/klatt2", start: 17485026, end: 17485064 },
                { filename: "/espeak-ng-data/voices/!v/klatt3", start: 17485064, end: 17485103 },
                { filename: "/espeak-ng-data/voices/!v/klatt4", start: 17485103, end: 17485142 },
                { filename: "/espeak-ng-data/voices/!v/klatt5", start: 17485142, end: 17485181 },
                { filename: "/espeak-ng-data/voices/!v/klatt6", start: 17485181, end: 17485220 },
                { filename: "/espeak-ng-data/voices/!v/linda", start: 17485220, end: 17485570 },
                { filename: "/espeak-ng-data/voices/!v/m1", start: 17485570, end: 17485905 },
                { filename: "/espeak-ng-data/voices/!v/m2", start: 17485905, end: 17486169 },
                { filename: "/espeak-ng-data/voices/!v/m3", start: 17486169, end: 17486469 },
                { filename: "/espeak-ng-data/voices/!v/m4", start: 17486469, end: 17486759 },
                { filename: "/espeak-ng-data/voices/!v/m5", start: 17486759, end: 17487021 },
                { filename: "/espeak-ng-data/voices/!v/m6", start: 17487021, end: 17487209 },
                { filename: "/espeak-ng-data/voices/!v/m7", start: 17487209, end: 17487463 },
                { filename: "/espeak-ng-data/voices/!v/m8", start: 17487463, end: 17487747 },
                { filename: "/espeak-ng-data/voices/!v/marcelo", start: 17487747, end: 17487998 },
                { filename: "/espeak-ng-data/voices/!v/max", start: 17487998, end: 17488223 },
                { filename: "/espeak-ng-data/voices/!v/michel", start: 17488223, end: 17488627 },
                { filename: "/espeak-ng-data/voices/!v/miguel", start: 17488627, end: 17489009 },
                { filename: "/espeak-ng-data/voices/!v/mike2", start: 17489009, end: 17489197 },
                { filename: "/espeak-ng-data/voices/!v/norbert", start: 17489197, end: 17492386 },
                { filename: "/espeak-ng-data/voices/!v/pablo", start: 17492386, end: 17495528 },
                { filename: "/espeak-ng-data/voices/!v/paul", start: 17495528, end: 17495812 },
                { filename: "/espeak-ng-data/voices/!v/pedro", start: 17495812, end: 17496164 },
                { filename: "/espeak-ng-data/voices/!v/quincy", start: 17496164, end: 17496518 },
                { filename: "/espeak-ng-data/voices/!v/rob", start: 17496518, end: 17496783 },
                { filename: "/espeak-ng-data/voices/!v/robert", start: 17496783, end: 17497057 },
                { filename: "/espeak-ng-data/voices/!v/robosoft", start: 17497057, end: 17497508 },
                { filename: "/espeak-ng-data/voices/!v/robosoft2", start: 17497508, end: 17497962 },
                { filename: "/espeak-ng-data/voices/!v/robosoft3", start: 17497962, end: 17498417 },
                { filename: "/espeak-ng-data/voices/!v/robosoft4", start: 17498417, end: 17498864 },
                { filename: "/espeak-ng-data/voices/!v/robosoft5", start: 17498864, end: 17499309 },
                { filename: "/espeak-ng-data/voices/!v/robosoft6", start: 17499309, end: 17499596 },
                { filename: "/espeak-ng-data/voices/!v/robosoft7", start: 17499596, end: 17500006 },
                { filename: "/espeak-ng-data/voices/!v/robosoft8", start: 17500006, end: 17500249 },
                { filename: "/espeak-ng-data/voices/!v/sandro", start: 17500249, end: 17500779 },
                { filename: "/espeak-ng-data/voices/!v/shelby", start: 17500779, end: 17501059 },
                { filename: "/espeak-ng-data/voices/!v/steph", start: 17501059, end: 17501423 },
                { filename: "/espeak-ng-data/voices/!v/steph2", start: 17501423, end: 17501790 },
                { filename: "/espeak-ng-data/voices/!v/steph3", start: 17501790, end: 17502167 },
                { filename: "/espeak-ng-data/voices/!v/travis", start: 17502167, end: 17502550 },
                { filename: "/espeak-ng-data/voices/!v/victor", start: 17502550, end: 17502803 },
                { filename: "/espeak-ng-data/voices/!v/whisper", start: 17502803, end: 17502989 },
                { filename: "/espeak-ng-data/voices/!v/whisperf", start: 17502989, end: 17503381 },
                { filename: "/espeak-ng-data/voices/!v/zac", start: 17503381, end: 17503656 },
                { filename: "/espeak-ng-data/voices/mb/mb-af1", start: 17503656, end: 17503744 },
                { filename: "/espeak-ng-data/voices/mb/mb-af1-en", start: 17503744, end: 17503827 },
                { filename: "/espeak-ng-data/voices/mb/mb-ar1", start: 17503827, end: 17503911 },
                { filename: "/espeak-ng-data/voices/mb/mb-ar2", start: 17503911, end: 17503995 },
                { filename: "/espeak-ng-data/voices/mb/mb-br1", start: 17503995, end: 17504127 },
                { filename: "/espeak-ng-data/voices/mb/mb-br2", start: 17504127, end: 17504263 },
                { filename: "/espeak-ng-data/voices/mb/mb-br3", start: 17504263, end: 17504395 },
                { filename: "/espeak-ng-data/voices/mb/mb-br4", start: 17504395, end: 17504531 },
                { filename: "/espeak-ng-data/voices/mb/mb-ca1", start: 17504531, end: 17504636 },
                { filename: "/espeak-ng-data/voices/mb/mb-ca2", start: 17504636, end: 17504741 },
                { filename: "/espeak-ng-data/voices/mb/mb-cn1", start: 17504741, end: 17504833 },
                { filename: "/espeak-ng-data/voices/mb/mb-cr1", start: 17504833, end: 17504944 },
                { filename: "/espeak-ng-data/voices/mb/mb-cz1", start: 17504944, end: 17505014 },
                { filename: "/espeak-ng-data/voices/mb/mb-cz2", start: 17505014, end: 17505096 },
                { filename: "/espeak-ng-data/voices/mb/mb-de1", start: 17505096, end: 17505240 },
                { filename: "/espeak-ng-data/voices/mb/mb-de1-en", start: 17505240, end: 17505336 },
                { filename: "/espeak-ng-data/voices/mb/mb-de2", start: 17505336, end: 17505464 },
                { filename: "/espeak-ng-data/voices/mb/mb-de2-en", start: 17505464, end: 17505544 },
                { filename: "/espeak-ng-data/voices/mb/mb-de3", start: 17505544, end: 17505643 },
                { filename: "/espeak-ng-data/voices/mb/mb-de3-en", start: 17505643, end: 17505739 },
                { filename: "/espeak-ng-data/voices/mb/mb-de4", start: 17505739, end: 17505868 },
                { filename: "/espeak-ng-data/voices/mb/mb-de4-en", start: 17505868, end: 17505949 },
                { filename: "/espeak-ng-data/voices/mb/mb-de5", start: 17505949, end: 17506185 },
                { filename: "/espeak-ng-data/voices/mb/mb-de5-en", start: 17506185, end: 17506275 },
                { filename: "/espeak-ng-data/voices/mb/mb-de6", start: 17506275, end: 17506397 },
                { filename: "/espeak-ng-data/voices/mb/mb-de6-en", start: 17506397, end: 17506471 },
                { filename: "/espeak-ng-data/voices/mb/mb-de6-grc", start: 17506471, end: 17506554 },
                { filename: "/espeak-ng-data/voices/mb/mb-de7", start: 17506554, end: 17506704 },
                { filename: "/espeak-ng-data/voices/mb/mb-de8", start: 17506704, end: 17506775 },
                { filename: "/espeak-ng-data/voices/mb/mb-ee1", start: 17506775, end: 17506872 },
                { filename: "/espeak-ng-data/voices/mb/mb-en1", start: 17506872, end: 17507003 },
                { filename: "/espeak-ng-data/voices/mb/mb-es1", start: 17507003, end: 17507117 },
                { filename: "/espeak-ng-data/voices/mb/mb-es2", start: 17507117, end: 17507225 },
                { filename: "/espeak-ng-data/voices/mb/mb-es3", start: 17507225, end: 17507329 },
                { filename: "/espeak-ng-data/voices/mb/mb-es4", start: 17507329, end: 17507417 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr1", start: 17507417, end: 17507583 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr1-en", start: 17507583, end: 17507687 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr2", start: 17507687, end: 17507790 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr3", start: 17507790, end: 17507890 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr4", start: 17507890, end: 17508017 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr4-en", start: 17508017, end: 17508124 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr5", start: 17508124, end: 17508224 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr6", start: 17508224, end: 17508324 },
                { filename: "/espeak-ng-data/voices/mb/mb-fr7", start: 17508324, end: 17508407 },
                { filename: "/espeak-ng-data/voices/mb/mb-gr1", start: 17508407, end: 17508501 },
                { filename: "/espeak-ng-data/voices/mb/mb-gr2", start: 17508501, end: 17508595 },
                { filename: "/espeak-ng-data/voices/mb/mb-gr2-en", start: 17508595, end: 17508683 },
                { filename: "/espeak-ng-data/voices/mb/mb-hb1", start: 17508683, end: 17508751 },
                { filename: "/espeak-ng-data/voices/mb/mb-hb2", start: 17508751, end: 17508834 },
                { filename: "/espeak-ng-data/voices/mb/mb-hu1", start: 17508834, end: 17508936 },
                { filename: "/espeak-ng-data/voices/mb/mb-hu1-en", start: 17508936, end: 17509033 },
                { filename: "/espeak-ng-data/voices/mb/mb-ic1", start: 17509033, end: 17509121 },
                { filename: "/espeak-ng-data/voices/mb/mb-id1", start: 17509121, end: 17509222 },
                { filename: "/espeak-ng-data/voices/mb/mb-in1", start: 17509222, end: 17509291 },
                { filename: "/espeak-ng-data/voices/mb/mb-in2", start: 17509291, end: 17509376 },
                { filename: "/espeak-ng-data/voices/mb/mb-ir1", start: 17509376, end: 17510129 },
                { filename: "/espeak-ng-data/voices/mb/mb-it1", start: 17510129, end: 17510213 },
                { filename: "/espeak-ng-data/voices/mb/mb-it2", start: 17510213, end: 17510300 },
                { filename: "/espeak-ng-data/voices/mb/mb-it3", start: 17510300, end: 17510442 },
                { filename: "/espeak-ng-data/voices/mb/mb-it4", start: 17510442, end: 17510587 },
                { filename: "/espeak-ng-data/voices/mb/mb-jp1", start: 17510587, end: 17510658 },
                { filename: "/espeak-ng-data/voices/mb/mb-jp2", start: 17510658, end: 17510759 },
                { filename: "/espeak-ng-data/voices/mb/mb-jp3", start: 17510759, end: 17510846 },
                { filename: "/espeak-ng-data/voices/mb/mb-la1", start: 17510846, end: 17510929 },
                { filename: "/espeak-ng-data/voices/mb/mb-lt1", start: 17510929, end: 17511016 },
                { filename: "/espeak-ng-data/voices/mb/mb-lt2", start: 17511016, end: 17511103 },
                { filename: "/espeak-ng-data/voices/mb/mb-ma1", start: 17511103, end: 17511201 },
                { filename: "/espeak-ng-data/voices/mb/mb-mx1", start: 17511201, end: 17511321 },
                { filename: "/espeak-ng-data/voices/mb/mb-mx2", start: 17511321, end: 17511441 },
                { filename: "/espeak-ng-data/voices/mb/mb-nl1", start: 17511441, end: 17511510 },
                { filename: "/espeak-ng-data/voices/mb/mb-nl2", start: 17511510, end: 17511606 },
                { filename: "/espeak-ng-data/voices/mb/mb-nl2-en", start: 17511606, end: 17511697 },
                { filename: "/espeak-ng-data/voices/mb/mb-nl3", start: 17511697, end: 17511782 },
                { filename: "/espeak-ng-data/voices/mb/mb-nz1", start: 17511782, end: 17511850 },
                { filename: "/espeak-ng-data/voices/mb/mb-pl1", start: 17511850, end: 17511949 },
                { filename: "/espeak-ng-data/voices/mb/mb-pl1-en", start: 17511949, end: 17512031 },
                { filename: "/espeak-ng-data/voices/mb/mb-pt1", start: 17512031, end: 17512162 },
                { filename: "/espeak-ng-data/voices/mb/mb-ro1", start: 17512162, end: 17512249 },
                { filename: "/espeak-ng-data/voices/mb/mb-ro1-en", start: 17512249, end: 17512330 },
                { filename: "/espeak-ng-data/voices/mb/mb-sw1", start: 17512330, end: 17512428 },
                { filename: "/espeak-ng-data/voices/mb/mb-sw1-en", start: 17512428, end: 17512521 },
                { filename: "/espeak-ng-data/voices/mb/mb-sw2", start: 17512521, end: 17512623 },
                { filename: "/espeak-ng-data/voices/mb/mb-sw2-en", start: 17512623, end: 17512722 },
                { filename: "/espeak-ng-data/voices/mb/mb-tl1", start: 17512722, end: 17512807 },
                { filename: "/espeak-ng-data/voices/mb/mb-tr1", start: 17512807, end: 17512892 },
                { filename: "/espeak-ng-data/voices/mb/mb-tr2", start: 17512892, end: 17513006 },
                { filename: "/espeak-ng-data/voices/mb/mb-us1", start: 17513006, end: 17513176 },
                { filename: "/espeak-ng-data/voices/mb/mb-us2", start: 17513176, end: 17513354 },
                { filename: "/espeak-ng-data/voices/mb/mb-us3", start: 17513354, end: 17513534 },
                { filename: "/espeak-ng-data/voices/mb/mb-vz1", start: 17513534, end: 17513678 },
                { filename: "/espeak-ng-data/yue_dict", start: 17513678, end: 18077249 }
              ],
              remote_package_size: 18077249
            });
          }
        })();
        var De2 = Object.assign({}, o), ge = [], ae2 = "./this.program", te = (e, a) => {
          throw a;
        }, Ae = typeof window == "object", q = typeof importScripts == "function", ne2 = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string", N2 = "";
        function Ze2(e) {
          return o.locateFile ? o.locateFile(e, N2) : N2 + e;
        }
        var G, $, re;
        if (ne2) {
          var ue = (init_stub_node(), __toCommonJS(stub_node_exports)), ve2 = (init_stub_node(), __toCommonJS(stub_node_exports));
          q ? N2 = ve2.dirname(N2) + "/" : N2 = __dirname + "/", G = (e, a) => (e = oe2(e) ? new URL(e) : ve2.normalize(e), ue.readFileSync(e, a ? void 0 : "utf8")), re = (e) => {
            var a = G(e, true);
            return a.buffer || (a = new Uint8Array(a)), a;
          }, $ = (e, a, t, r = true) => {
            e = oe2(e) ? new URL(e) : ve2.normalize(e), ue.readFile(e, r ? void 0 : "utf8", (s, i) => {
              s ? t(s) : a(r ? i.buffer : i);
            });
          }, !o.thisProgram && process.argv.length > 1 && (ae2 = process.argv[1].replace(/\\/g, "/")), ge = process.argv.slice(2), te = (e, a) => {
            throw process.exitCode = e, a;
          }, o.inspect = () => "[Emscripten Module object]";
        } else (Ae || q) && (q ? N2 = self.location.href : typeof document < "u" && document.currentScript && (N2 = document.currentScript.src), Q2 && (N2 = Q2), N2.indexOf("blob:") !== 0 ? N2 = N2.substr(
          0,
          N2.replace(/[?#].*/, "").lastIndexOf("/") + 1
        ) : N2 = "", G = (e) => {
          var a = new XMLHttpRequest();
          return a.open("GET", e, false), a.send(null), a.responseText;
        }, q && (re = (e) => {
          var a = new XMLHttpRequest();
          return a.open("GET", e, false), a.responseType = "arraybuffer", a.send(null), new Uint8Array(a.response);
        }), $ = (e, a, t) => {
          var r = new XMLHttpRequest();
          r.open("GET", e, true), r.responseType = "arraybuffer", r.onload = () => {
            if (r.status == 200 || r.status == 0 && r.response) {
              a(r.response);
              return;
            }
            t();
          }, r.onerror = t, r.send(null);
        });
        var ke = o.print || console.log.bind(console), C = o.printErr || console.error.bind(console);
        Object.assign(o, De2), De2 = null, o.arguments && (ge = o.arguments), o.thisProgram && (ae2 = o.thisProgram), o.quit && (te = o.quit);
        var X;
        o.wasmBinary && (X = o.wasmBinary), typeof WebAssembly != "object" && L3("no native wasm support detected");
        var Me2, he = false, se;
        function Qe2(e, a) {
          e || L3(a);
        }
        var T, H2, V2, k, A;
        function ea2() {
          var e = Me2.buffer;
          o.HEAP8 = T = new Int8Array(e), o.HEAP16 = V2 = new Int16Array(e), o.HEAPU8 = H2 = new Uint8Array(e), o.HEAPU16 = new Uint16Array(e), o.HEAP32 = k = new Int32Array(e), o.HEAPU32 = A = new Uint32Array(e), o.HEAPF32 = new Float32Array(e), o.HEAPF64 = new Float64Array(e);
        }
        var Re = [], ze = [], aa2 = [], Te = [];
        function ta2() {
          if (o.preRun)
            for (typeof o.preRun == "function" && (o.preRun = [o.preRun]); o.preRun.length; )
              ia2(o.preRun.shift());
          de(Re);
        }
        function na() {
          !o.noFSInit && !n.init.initialized && n.init(), n.ignorePermissions = false, de(ze);
        }
        function ra() {
          de(aa2);
        }
        function sa2() {
          if (o.postRun)
            for (typeof o.postRun == "function" && (o.postRun = [o.postRun]); o.postRun.length; )
              da2(o.postRun.shift());
          de(Te);
        }
        function ia2(e) {
          Re.unshift(e);
        }
        function oa2(e) {
          ze.unshift(e);
        }
        function da2(e) {
          Te.unshift(e);
        }
        var U2 = 0, K = null;
        function lt2(e) {
          return e;
        }
        function ie(e) {
          U2++, o.monitorRunDependencies && o.monitorRunDependencies(U2);
        }
        function J(e) {
          if (U2--, o.monitorRunDependencies && o.monitorRunDependencies(U2), U2 == 0 && K) {
            var a = K;
            K = null, a();
          }
        }
        function L3(e) {
          o.onAbort && o.onAbort(e), e = "Aborted(" + e + ")", C(e), he = true, se = 1, e += ". Build with -sASSERTIONS for more info.";
          var a = new WebAssembly.RuntimeError(e);
          throw ee(a), a;
        }
        var la2 = "data:application/octet-stream;base64,", Ne = (e) => e.startsWith(la2), oe2 = (e) => e.startsWith("file://"), I2;
        I2 = "piper_phonemize.wasm", Ne(I2) || (I2 = Ze2(I2));
        function xe(e) {
          if (e == I2 && X)
            return new Uint8Array(X);
          if (re)
            return re(e);
          throw "both async and sync fetching of the wasm failed";
        }
        function fa2(e) {
          if (!X && (Ae || q)) {
            if (typeof fetch == "function" && !oe2(e))
              return fetch(e, { credentials: "same-origin" }).then((a) => {
                if (!a.ok)
                  throw "failed to load wasm binary file at '" + e + "'";
                return a.arrayBuffer();
              }).catch(() => xe(e));
            if ($)
              return new Promise((a, t) => {
                $(e, (r) => a(new Uint8Array(r)), t);
              });
          }
          return Promise.resolve().then(() => xe(e));
        }
        function Ce(e, a, t) {
          return fa2(e).then((r) => WebAssembly.instantiate(r, a)).then((r) => r).then(t, (r) => {
            C(`failed to asynchronously prepare wasm: ${r}`), L3(r);
          });
        }
        function ma(e, a, t, r) {
          return !e && typeof WebAssembly.instantiateStreaming == "function" && !Ne(a) && !oe2(a) && !ne2 && typeof fetch == "function" ? fetch(a, { credentials: "same-origin" }).then((s) => {
            var i = WebAssembly.instantiateStreaming(s, t);
            return i.then(r, function(d) {
              return C(`wasm streaming compile failed: ${d}`), C("falling back to ArrayBuffer instantiation"), Ce(a, t, r);
            });
          }) : Ce(a, t, r);
        }
        function ca2() {
          var e = { a: dt2 };
          function a(r, s) {
            return j2 = r.exports, Me2 = j2.w, ea2(), oa2(j2.x), J(), j2;
          }
          ie();
          function t(r) {
            a(r.instance);
          }
          if (o.instantiateWasm)
            try {
              return o.instantiateWasm(e, a);
            } catch (r) {
              C(`Module.instantiateWasm callback failed with error: ${r}`), ee(r);
            }
          return ma(X, I2, e, t).catch(
            ee
          ), {};
        }
        var u2, M;
        function Le(e) {
          this.name = "ExitStatus", this.message = `Program terminated with exit(${e})`, this.status = e;
        }
        var de = (e) => {
          for (; e.length > 0; )
            e.shift()(o);
        }, pa2 = o.noExitRuntime || true, Oe = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, Y = (e, a, t) => {
          for (var r = a + t, s = a; e[s] && !(s >= r); ) ++s;
          if (s - a > 16 && e.buffer && Oe)
            return Oe.decode(e.subarray(a, s));
          for (var i = ""; a < s; ) {
            var d = e[a++];
            if (!(d & 128)) {
              i += String.fromCharCode(d);
              continue;
            }
            var l = e[a++] & 63;
            if ((d & 224) == 192) {
              i += String.fromCharCode((d & 31) << 6 | l);
              continue;
            }
            var m = e[a++] & 63;
            if ((d & 240) == 224 ? d = (d & 15) << 12 | l << 6 | m : d = (d & 7) << 18 | l << 12 | m << 6 | e[a++] & 63, d < 65536)
              i += String.fromCharCode(d);
            else {
              var v = d - 65536;
              i += String.fromCharCode(55296 | v >> 10, 56320 | v & 1023);
            }
          }
          return i;
        }, W = (e, a) => e ? Y(H2, e, a) : "", ga = (e, a, t, r) => {
          L3(
            `Assertion failed: ${W(e)}, at: ` + [
              a ? W(a) : "unknown filename",
              t,
              r ? W(r) : "unknown function"
            ]
          );
        };
        function ua2(e) {
          this.excPtr = e, this.ptr = e - 24, this.set_type = function(a) {
            A[this.ptr + 4 >> 2] = a;
          }, this.get_type = function() {
            return A[this.ptr + 4 >> 2];
          }, this.set_destructor = function(a) {
            A[this.ptr + 8 >> 2] = a;
          }, this.get_destructor = function() {
            return A[this.ptr + 8 >> 2];
          }, this.set_caught = function(a) {
            a = a ? 1 : 0, T[this.ptr + 12 >> 0] = a;
          }, this.get_caught = function() {
            return T[this.ptr + 12 >> 0] != 0;
          }, this.set_rethrown = function(a) {
            a = a ? 1 : 0, T[this.ptr + 13 >> 0] = a;
          }, this.get_rethrown = function() {
            return T[this.ptr + 13 >> 0] != 0;
          }, this.init = function(a, t) {
            this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(t);
          }, this.set_adjusted_ptr = function(a) {
            A[this.ptr + 16 >> 2] = a;
          }, this.get_adjusted_ptr = function() {
            return A[this.ptr + 16 >> 2];
          }, this.get_exception_ptr = function() {
            var a = Xe2(this.get_type());
            if (a)
              return A[this.excPtr >> 2];
            var t = this.get_adjusted_ptr();
            return t !== 0 ? t : this.excPtr;
          };
        }
        var je = 0, va = (e, a, t) => {
          var r = new ua2(e);
          throw r.init(a, t), je = e, je;
        }, ka = (e) => (k[$e2() >> 2] = e, e), P2 = {
          isAbs: (e) => e.charAt(0) === "/",
          splitPath: (e) => {
            var a = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            return a.exec(e).slice(1);
          },
          normalizeArray: (e, a) => {
            for (var t = 0, r = e.length - 1; r >= 0; r--) {
              var s = e[r];
              s === "." ? e.splice(r, 1) : s === ".." ? (e.splice(r, 1), t++) : t && (e.splice(r, 1), t--);
            }
            if (a)
              for (; t; t--)
                e.unshift("..");
            return e;
          },
          normalize: (e) => {
            var a = P2.isAbs(e), t = e.substr(-1) === "/";
            return e = P2.normalizeArray(
              e.split("/").filter((r) => !!r),
              !a
            ).join("/"), !e && !a && (e = "."), e && t && (e += "/"), (a ? "/" : "") + e;
          },
          dirname: (e) => {
            var a = P2.splitPath(e), t = a[0], r = a[1];
            return !t && !r ? "." : (r && (r = r.substr(0, r.length - 1)), t + r);
          },
          basename: (e) => {
            if (e === "/") return "/";
            e = P2.normalize(e), e = e.replace(/\/$/, "");
            var a = e.lastIndexOf("/");
            return a === -1 ? e : e.substr(a + 1);
          },
          join: function() {
            var e = Array.prototype.slice.call(arguments);
            return P2.normalize(e.join("/"));
          },
          join2: (e, a) => P2.normalize(e + "/" + a)
        }, ha = () => {
          if (typeof crypto == "object" && typeof crypto.getRandomValues == "function")
            return (r) => crypto.getRandomValues(r);
          if (ne2)
            try {
              var e = __require("crypto"), a = e.randomFillSync;
              if (a)
                return (r) => e.randomFillSync(r);
              var t = e.randomBytes;
              return (r) => (r.set(t(r.byteLength)), r);
            } catch {
            }
          L3("initRandomDevice");
        }, Ue2 = (e) => (Ue2 = ha())(e), O = {
          resolve: function() {
            for (var e = "", a = false, t = arguments.length - 1; t >= -1 && !a; t--) {
              var r = t >= 0 ? arguments[t] : n.cwd();
              if (typeof r != "string")
                throw new TypeError("Arguments to path.resolve must be strings");
              if (!r)
                return "";
              e = r + "/" + e, a = P2.isAbs(r);
            }
            return e = P2.normalizeArray(
              e.split("/").filter((s) => !!s),
              !a
            ).join("/"), (a ? "/" : "") + e || ".";
          },
          relative: (e, a) => {
            e = O.resolve(e).substr(1), a = O.resolve(a).substr(1);
            function t(v) {
              for (var y = 0; y < v.length && v[y] === ""; y++)
                ;
              for (var h2 = v.length - 1; h2 >= 0 && v[h2] === ""; h2--)
                ;
              return y > h2 ? [] : v.slice(y, h2 - y + 1);
            }
            for (var r = t(e.split("/")), s = t(a.split("/")), i = Math.min(r.length, s.length), d = i, l = 0; l < i; l++)
              if (r[l] !== s[l]) {
                d = l;
                break;
              }
            for (var m = [], l = d; l < r.length; l++)
              m.push("..");
            return m = m.concat(s.slice(d)), m.join("/");
          }
        }, _e2 = [], we2 = (e) => {
          for (var a = 0, t = 0; t < e.length; ++t) {
            var r = e.charCodeAt(t);
            r <= 127 ? a++ : r <= 2047 ? a += 2 : r >= 55296 && r <= 57343 ? (a += 4, ++t) : a += 3;
          }
          return a;
        }, ye2 = (e, a, t, r) => {
          if (!(r > 0)) return 0;
          for (var s = t, i = t + r - 1, d = 0; d < e.length; ++d) {
            var l = e.charCodeAt(d);
            if (l >= 55296 && l <= 57343) {
              var m = e.charCodeAt(++d);
              l = 65536 + ((l & 1023) << 10) | m & 1023;
            }
            if (l <= 127) {
              if (t >= i) break;
              a[t++] = l;
            } else if (l <= 2047) {
              if (t + 1 >= i) break;
              a[t++] = 192 | l >> 6, a[t++] = 128 | l & 63;
            } else if (l <= 65535) {
              if (t + 2 >= i) break;
              a[t++] = 224 | l >> 12, a[t++] = 128 | l >> 6 & 63, a[t++] = 128 | l & 63;
            } else {
              if (t + 3 >= i) break;
              a[t++] = 240 | l >> 18, a[t++] = 128 | l >> 12 & 63, a[t++] = 128 | l >> 6 & 63, a[t++] = 128 | l & 63;
            }
          }
          return a[t] = 0, t - s;
        };
        function le2(e, a, t) {
          var r = we2(e) + 1, s = new Array(r), i = ye2(e, s, 0, s.length);
          return a && (s.length = i), s;
        }
        var _a = () => {
          if (!_e2.length) {
            var e = null;
            if (ne2) {
              var a = 256, t = Buffer.alloc(a), r = 0, s = process.stdin.fd;
              try {
                r = ue.readSync(s, t);
              } catch (i) {
                if (i.toString().includes("EOF")) r = 0;
                else throw i;
              }
              r > 0 ? e = t.slice(0, r).toString("utf-8") : e = null;
            } else typeof window < "u" && typeof window.prompt == "function" ? (e = window.prompt("Input: "), e !== null && (e += `
`)) : typeof readline == "function" && (e = readline(), e !== null && (e += `
`));
            if (!e)
              return null;
            _e2 = le2(e, true);
          }
          return _e2.shift();
        }, B3 = {
          ttys: [],
          init() {
          },
          shutdown() {
          },
          register(e, a) {
            B3.ttys[e] = { input: [], output: [], ops: a }, n.registerDevice(e, B3.stream_ops);
          },
          stream_ops: {
            open(e) {
              var a = B3.ttys[e.node.rdev];
              if (!a)
                throw new n.ErrnoError(43);
              e.tty = a, e.seekable = false;
            },
            close(e) {
              e.tty.ops.fsync(e.tty);
            },
            fsync(e) {
              e.tty.ops.fsync(e.tty);
            },
            read(e, a, t, r, s) {
              if (!e.tty || !e.tty.ops.get_char)
                throw new n.ErrnoError(60);
              for (var i = 0, d = 0; d < r; d++) {
                var l;
                try {
                  l = e.tty.ops.get_char(e.tty);
                } catch {
                  throw new n.ErrnoError(29);
                }
                if (l === void 0 && i === 0)
                  throw new n.ErrnoError(6);
                if (l == null) break;
                i++, a[t + d] = l;
              }
              return i && (e.node.timestamp = Date.now()), i;
            },
            write(e, a, t, r, s) {
              if (!e.tty || !e.tty.ops.put_char)
                throw new n.ErrnoError(60);
              try {
                for (var i = 0; i < r; i++)
                  e.tty.ops.put_char(e.tty, a[t + i]);
              } catch {
                throw new n.ErrnoError(29);
              }
              return r && (e.node.timestamp = Date.now()), i;
            }
          },
          default_tty_ops: {
            get_char(e) {
              return _a();
            },
            put_char(e, a) {
              a === null || a === 10 ? (ke(Y(e.output, 0)), e.output = []) : a != 0 && e.output.push(a);
            },
            fsync(e) {
              e.output && e.output.length > 0 && (ke(Y(e.output, 0)), e.output = []);
            },
            ioctl_tcgets(e) {
              return {
                c_iflag: 25856,
                c_oflag: 5,
                c_cflag: 191,
                c_lflag: 35387,
                c_cc: [
                  3,
                  28,
                  127,
                  21,
                  4,
                  0,
                  1,
                  0,
                  17,
                  19,
                  26,
                  0,
                  18,
                  15,
                  23,
                  22,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              };
            },
            ioctl_tcsets(e, a, t) {
              return 0;
            },
            ioctl_tiocgwinsz(e) {
              return [24, 80];
            }
          },
          default_tty1_ops: {
            put_char(e, a) {
              a === null || a === 10 ? (C(Y(e.output, 0)), e.output = []) : a != 0 && e.output.push(a);
            },
            fsync(e) {
              e.output && e.output.length > 0 && (C(Y(e.output, 0)), e.output = []);
            }
          }
        }, Be = (e) => {
          L3();
        }, w = {
          ops_table: null,
          mount(e) {
            return w.createNode(null, "/", 16895, 0);
          },
          createNode(e, a, t, r) {
            if (n.isBlkdev(t) || n.isFIFO(t))
              throw new n.ErrnoError(63);
            w.ops_table || (w.ops_table = {
              dir: {
                node: {
                  getattr: w.node_ops.getattr,
                  setattr: w.node_ops.setattr,
                  lookup: w.node_ops.lookup,
                  mknod: w.node_ops.mknod,
                  rename: w.node_ops.rename,
                  unlink: w.node_ops.unlink,
                  rmdir: w.node_ops.rmdir,
                  readdir: w.node_ops.readdir,
                  symlink: w.node_ops.symlink
                },
                stream: { llseek: w.stream_ops.llseek }
              },
              file: {
                node: { getattr: w.node_ops.getattr, setattr: w.node_ops.setattr },
                stream: {
                  llseek: w.stream_ops.llseek,
                  read: w.stream_ops.read,
                  write: w.stream_ops.write,
                  allocate: w.stream_ops.allocate,
                  mmap: w.stream_ops.mmap,
                  msync: w.stream_ops.msync
                }
              },
              link: {
                node: {
                  getattr: w.node_ops.getattr,
                  setattr: w.node_ops.setattr,
                  readlink: w.node_ops.readlink
                },
                stream: {}
              },
              chrdev: {
                node: { getattr: w.node_ops.getattr, setattr: w.node_ops.setattr },
                stream: n.chrdev_stream_ops
              }
            });
            var s = n.createNode(e, a, t, r);
            return n.isDir(s.mode) ? (s.node_ops = w.ops_table.dir.node, s.stream_ops = w.ops_table.dir.stream, s.contents = {}) : n.isFile(s.mode) ? (s.node_ops = w.ops_table.file.node, s.stream_ops = w.ops_table.file.stream, s.usedBytes = 0, s.contents = null) : n.isLink(s.mode) ? (s.node_ops = w.ops_table.link.node, s.stream_ops = w.ops_table.link.stream) : n.isChrdev(s.mode) && (s.node_ops = w.ops_table.chrdev.node, s.stream_ops = w.ops_table.chrdev.stream), s.timestamp = Date.now(), e && (e.contents[a] = s, e.timestamp = s.timestamp), s;
          },
          getFileDataAsTypedArray(e) {
            return e.contents ? e.contents.subarray ? e.contents.subarray(0, e.usedBytes) : new Uint8Array(e.contents) : new Uint8Array(0);
          },
          expandFileStorage(e, a) {
            var t = e.contents ? e.contents.length : 0;
            if (!(t >= a)) {
              var r = 1024 * 1024;
              a = Math.max(
                a,
                t * (t < r ? 2 : 1.125) >>> 0
              ), t != 0 && (a = Math.max(a, 256));
              var s = e.contents;
              e.contents = new Uint8Array(a), e.usedBytes > 0 && e.contents.set(s.subarray(0, e.usedBytes), 0);
            }
          },
          resizeFileStorage(e, a) {
            if (e.usedBytes != a)
              if (a == 0)
                e.contents = null, e.usedBytes = 0;
              else {
                var t = e.contents;
                e.contents = new Uint8Array(a), t && e.contents.set(t.subarray(0, Math.min(a, e.usedBytes))), e.usedBytes = a;
              }
          },
          node_ops: {
            getattr(e) {
              var a = {};
              return a.dev = n.isChrdev(e.mode) ? e.id : 1, a.ino = e.id, a.mode = e.mode, a.nlink = 1, a.uid = 0, a.gid = 0, a.rdev = e.rdev, n.isDir(e.mode) ? a.size = 4096 : n.isFile(e.mode) ? a.size = e.usedBytes : n.isLink(e.mode) ? a.size = e.link.length : a.size = 0, a.atime = new Date(e.timestamp), a.mtime = new Date(e.timestamp), a.ctime = new Date(e.timestamp), a.blksize = 4096, a.blocks = Math.ceil(a.size / a.blksize), a;
            },
            setattr(e, a) {
              a.mode !== void 0 && (e.mode = a.mode), a.timestamp !== void 0 && (e.timestamp = a.timestamp), a.size !== void 0 && w.resizeFileStorage(e, a.size);
            },
            lookup(e, a) {
              throw n.genericErrors[44];
            },
            mknod(e, a, t, r) {
              return w.createNode(e, a, t, r);
            },
            rename(e, a, t) {
              if (n.isDir(e.mode)) {
                var r;
                try {
                  r = n.lookupNode(a, t);
                } catch {
                }
                if (r)
                  for (var s in r.contents)
                    throw new n.ErrnoError(55);
              }
              delete e.parent.contents[e.name], e.parent.timestamp = Date.now(), e.name = t, a.contents[t] = e, a.timestamp = e.parent.timestamp, e.parent = a;
            },
            unlink(e, a) {
              delete e.contents[a], e.timestamp = Date.now();
            },
            rmdir(e, a) {
              var t = n.lookupNode(e, a);
              for (var r in t.contents)
                throw new n.ErrnoError(55);
              delete e.contents[a], e.timestamp = Date.now();
            },
            readdir(e) {
              var a = [".", ".."];
              for (var t in e.contents)
                e.contents.hasOwnProperty(t) && a.push(t);
              return a;
            },
            symlink(e, a, t) {
              var r = w.createNode(e, a, 41471, 0);
              return r.link = t, r;
            },
            readlink(e) {
              if (!n.isLink(e.mode))
                throw new n.ErrnoError(28);
              return e.link;
            }
          },
          stream_ops: {
            read(e, a, t, r, s) {
              var i = e.node.contents;
              if (s >= e.node.usedBytes) return 0;
              var d = Math.min(e.node.usedBytes - s, r);
              if (d > 8 && i.subarray)
                a.set(i.subarray(s, s + d), t);
              else
                for (var l = 0; l < d; l++) a[t + l] = i[s + l];
              return d;
            },
            write(e, a, t, r, s, i) {
              if (!r) return 0;
              var d = e.node;
              if (d.timestamp = Date.now(), a.subarray && (!d.contents || d.contents.subarray)) {
                if (i)
                  return d.contents = a.subarray(t, t + r), d.usedBytes = r, r;
                if (d.usedBytes === 0 && s === 0)
                  return d.contents = a.slice(t, t + r), d.usedBytes = r, r;
                if (s + r <= d.usedBytes)
                  return d.contents.set(a.subarray(t, t + r), s), r;
              }
              if (w.expandFileStorage(d, s + r), d.contents.subarray && a.subarray)
                d.contents.set(a.subarray(t, t + r), s);
              else
                for (var l = 0; l < r; l++)
                  d.contents[s + l] = a[t + l];
              return d.usedBytes = Math.max(d.usedBytes, s + r), r;
            },
            llseek(e, a, t) {
              var r = a;
              if (t === 1 ? r += e.position : t === 2 && n.isFile(e.node.mode) && (r += e.node.usedBytes), r < 0)
                throw new n.ErrnoError(28);
              return r;
            },
            allocate(e, a, t) {
              w.expandFileStorage(e.node, a + t), e.node.usedBytes = Math.max(e.node.usedBytes, a + t);
            },
            mmap(e, a, t, r, s) {
              if (!n.isFile(e.node.mode))
                throw new n.ErrnoError(43);
              var i, d, l = e.node.contents;
              if (!(s & 2) && l.buffer === T.buffer)
                d = false, i = l.byteOffset;
              else {
                if ((t > 0 || t + a < l.length) && (l.subarray ? l = l.subarray(t, t + a) : l = Array.prototype.slice.call(l, t, t + a)), d = true, i = Be(), !i)
                  throw new n.ErrnoError(48);
                T.set(l, i);
              }
              return { ptr: i, allocated: d };
            },
            msync(e, a, t, r, s) {
              return w.stream_ops.write(e, a, 0, r, t, false), 0;
            }
          }
        }, wa = (e, a, t, r) => {
          var s = `al ${e}`;
          $(
            e,
            (i) => {
              Qe2(i, `Loading data file "${e}" failed (no arrayBuffer).`), a(new Uint8Array(i)), s && J();
            },
            (i) => {
              if (t)
                t();
              else
                throw `Loading data file "${e}" failed.`;
            }
          ), s && ie();
        }, ya = (e, a, t, r, s, i) => n.createDataFile(e, a, t, r, s, i), ba = o.preloadPlugins || [], Ea = (e, a, t, r) => {
          typeof Browser < "u" && Browser.init();
          var s = false;
          return ba.forEach((i) => {
            s || i.canHandle(a) && (i.handle(e, a, t, r), s = true);
          }), s;
        }, Sa = (e, a, t, r, s, i, d, l, m, v) => {
          var y = a ? O.resolve(P2.join2(e, a)) : e;
          function h2(g) {
            function p2(_3) {
              v && v(), l || ya(e, a, _3, r, s, m), i && i(), J();
            }
            Ea(g, y, p2, () => {
              d && d(), J();
            }) || p2(g);
          }
          ie(), typeof t == "string" ? wa(t, (g) => h2(g), d) : h2(t);
        }, Fa = (e) => {
          var a = {
            r: 0,
            "r+": 2,
            w: 577,
            "w+": 578,
            a: 1089,
            "a+": 1090
          }, t = a[e];
          if (typeof t > "u")
            throw new Error(`Unknown file open mode: ${e}`);
          return t;
        }, be2 = (e, a) => {
          var t = 0;
          return e && (t |= 365), a && (t |= 146), t;
        }, n = {
          root: null,
          mounts: [],
          devices: {},
          streams: [],
          nextInode: 1,
          nameTable: null,
          currentPath: "/",
          initialized: false,
          ignorePermissions: true,
          ErrnoError: null,
          genericErrors: {},
          filesystems: null,
          syncFSRequests: 0,
          lookupPath(e, a = {}) {
            if (e = O.resolve(e), !e) return { path: "", node: null };
            var t = { follow_mount: true, recurse_count: 0 };
            if (a = Object.assign(t, a), a.recurse_count > 8)
              throw new n.ErrnoError(32);
            for (var r = e.split("/").filter((h2) => !!h2), s = n.root, i = "/", d = 0; d < r.length; d++) {
              var l = d === r.length - 1;
              if (l && a.parent)
                break;
              if (s = n.lookupNode(s, r[d]), i = P2.join2(i, r[d]), n.isMountpoint(s) && (!l || l && a.follow_mount) && (s = s.mounted.root), !l || a.follow)
                for (var m = 0; n.isLink(s.mode); ) {
                  var v = n.readlink(i);
                  i = O.resolve(P2.dirname(i), v);
                  var y = n.lookupPath(i, { recurse_count: a.recurse_count + 1 });
                  if (s = y.node, m++ > 40)
                    throw new n.ErrnoError(32);
                }
            }
            return { path: i, node: s };
          },
          getPath(e) {
            for (var a; ; ) {
              if (n.isRoot(e)) {
                var t = e.mount.mountpoint;
                return a ? t[t.length - 1] !== "/" ? `${t}/${a}` : t + a : t;
              }
              a = a ? `${e.name}/${a}` : e.name, e = e.parent;
            }
          },
          hashName(e, a) {
            for (var t = 0, r = 0; r < a.length; r++)
              t = (t << 5) - t + a.charCodeAt(r) | 0;
            return (e + t >>> 0) % n.nameTable.length;
          },
          hashAddNode(e) {
            var a = n.hashName(e.parent.id, e.name);
            e.name_next = n.nameTable[a], n.nameTable[a] = e;
          },
          hashRemoveNode(e) {
            var a = n.hashName(e.parent.id, e.name);
            if (n.nameTable[a] === e)
              n.nameTable[a] = e.name_next;
            else
              for (var t = n.nameTable[a]; t; ) {
                if (t.name_next === e) {
                  t.name_next = e.name_next;
                  break;
                }
                t = t.name_next;
              }
          },
          lookupNode(e, a) {
            var t = n.mayLookup(e);
            if (t)
              throw new n.ErrnoError(t, e);
            for (var r = n.hashName(e.id, a), s = n.nameTable[r]; s; s = s.name_next) {
              var i = s.name;
              if (s.parent.id === e.id && i === a)
                return s;
            }
            return n.lookup(e, a);
          },
          createNode(e, a, t, r) {
            var s = new n.FSNode(e, a, t, r);
            return n.hashAddNode(s), s;
          },
          destroyNode(e) {
            n.hashRemoveNode(e);
          },
          isRoot(e) {
            return e === e.parent;
          },
          isMountpoint(e) {
            return !!e.mounted;
          },
          isFile(e) {
            return (e & 61440) === 32768;
          },
          isDir(e) {
            return (e & 61440) === 16384;
          },
          isLink(e) {
            return (e & 61440) === 40960;
          },
          isChrdev(e) {
            return (e & 61440) === 8192;
          },
          isBlkdev(e) {
            return (e & 61440) === 24576;
          },
          isFIFO(e) {
            return (e & 61440) === 4096;
          },
          isSocket(e) {
            return (e & 49152) === 49152;
          },
          flagsToPermissionString(e) {
            var a = ["r", "w", "rw"][e & 3];
            return e & 512 && (a += "w"), a;
          },
          nodePermissions(e, a) {
            return n.ignorePermissions ? 0 : a.includes("r") && !(e.mode & 292) || a.includes("w") && !(e.mode & 146) || a.includes("x") && !(e.mode & 73) ? 2 : 0;
          },
          mayLookup(e) {
            var a = n.nodePermissions(e, "x");
            return a || (e.node_ops.lookup ? 0 : 2);
          },
          mayCreate(e, a) {
            try {
              var t = n.lookupNode(e, a);
              return 20;
            } catch {
            }
            return n.nodePermissions(e, "wx");
          },
          mayDelete(e, a, t) {
            var r;
            try {
              r = n.lookupNode(e, a);
            } catch (i) {
              return i.errno;
            }
            var s = n.nodePermissions(e, "wx");
            if (s)
              return s;
            if (t) {
              if (!n.isDir(r.mode))
                return 54;
              if (n.isRoot(r) || n.getPath(r) === n.cwd())
                return 10;
            } else if (n.isDir(r.mode))
              return 31;
            return 0;
          },
          mayOpen(e, a) {
            return e ? n.isLink(e.mode) ? 32 : n.isDir(e.mode) && (n.flagsToPermissionString(a) !== "r" || a & 512) ? 31 : n.nodePermissions(e, n.flagsToPermissionString(a)) : 44;
          },
          MAX_OPEN_FDS: 4096,
          nextfd() {
            for (var e = 0; e <= n.MAX_OPEN_FDS; e++)
              if (!n.streams[e])
                return e;
            throw new n.ErrnoError(33);
          },
          getStreamChecked(e) {
            var a = n.getStream(e);
            if (!a)
              throw new n.ErrnoError(8);
            return a;
          },
          getStream: (e) => n.streams[e],
          createStream(e, a = -1) {
            return n.FSStream || (n.FSStream = function() {
              this.shared = {};
            }, n.FSStream.prototype = {}, Object.defineProperties(n.FSStream.prototype, {
              object: {
                get() {
                  return this.node;
                },
                set(t) {
                  this.node = t;
                }
              },
              isRead: {
                get() {
                  return (this.flags & 2097155) !== 1;
                }
              },
              isWrite: {
                get() {
                  return (this.flags & 2097155) !== 0;
                }
              },
              isAppend: {
                get() {
                  return this.flags & 1024;
                }
              },
              flags: {
                get() {
                  return this.shared.flags;
                },
                set(t) {
                  this.shared.flags = t;
                }
              },
              position: {
                get() {
                  return this.shared.position;
                },
                set(t) {
                  this.shared.position = t;
                }
              }
            })), e = Object.assign(new n.FSStream(), e), a == -1 && (a = n.nextfd()), e.fd = a, n.streams[a] = e, e;
          },
          closeStream(e) {
            n.streams[e] = null;
          },
          chrdev_stream_ops: {
            open(e) {
              var a = n.getDevice(e.node.rdev);
              e.stream_ops = a.stream_ops, e.stream_ops.open && e.stream_ops.open(e);
            },
            llseek() {
              throw new n.ErrnoError(70);
            }
          },
          major: (e) => e >> 8,
          minor: (e) => e & 255,
          makedev: (e, a) => e << 8 | a,
          registerDevice(e, a) {
            n.devices[e] = { stream_ops: a };
          },
          getDevice: (e) => n.devices[e],
          getMounts(e) {
            for (var a = [], t = [e]; t.length; ) {
              var r = t.pop();
              a.push(r), t.push.apply(t, r.mounts);
            }
            return a;
          },
          syncfs(e, a) {
            typeof e == "function" && (a = e, e = false), n.syncFSRequests++, n.syncFSRequests > 1 && C(
              `warning: ${n.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`
            );
            var t = n.getMounts(n.root.mount), r = 0;
            function s(d) {
              return n.syncFSRequests--, a(d);
            }
            function i(d) {
              if (d)
                return i.errored ? void 0 : (i.errored = true, s(d));
              ++r >= t.length && s(null);
            }
            t.forEach((d) => {
              if (!d.type.syncfs)
                return i(null);
              d.type.syncfs(d, e, i);
            });
          },
          mount(e, a, t) {
            var r = t === "/", s = !t, i;
            if (r && n.root)
              throw new n.ErrnoError(10);
            if (!r && !s) {
              var d = n.lookupPath(t, { follow_mount: false });
              if (t = d.path, i = d.node, n.isMountpoint(i))
                throw new n.ErrnoError(10);
              if (!n.isDir(i.mode))
                throw new n.ErrnoError(54);
            }
            var l = { type: e, opts: a, mountpoint: t, mounts: [] }, m = e.mount(l);
            return m.mount = l, l.root = m, r ? n.root = m : i && (i.mounted = l, i.mount && i.mount.mounts.push(l)), m;
          },
          unmount(e) {
            var a = n.lookupPath(e, { follow_mount: false });
            if (!n.isMountpoint(a.node))
              throw new n.ErrnoError(28);
            var t = a.node, r = t.mounted, s = n.getMounts(r);
            Object.keys(n.nameTable).forEach((d) => {
              for (var l = n.nameTable[d]; l; ) {
                var m = l.name_next;
                s.includes(l.mount) && n.destroyNode(l), l = m;
              }
            }), t.mounted = null;
            var i = t.mount.mounts.indexOf(r);
            t.mount.mounts.splice(i, 1);
          },
          lookup(e, a) {
            return e.node_ops.lookup(e, a);
          },
          mknod(e, a, t) {
            var r = n.lookupPath(e, { parent: true }), s = r.node, i = P2.basename(e);
            if (!i || i === "." || i === "..")
              throw new n.ErrnoError(28);
            var d = n.mayCreate(s, i);
            if (d)
              throw new n.ErrnoError(d);
            if (!s.node_ops.mknod)
              throw new n.ErrnoError(63);
            return s.node_ops.mknod(s, i, a, t);
          },
          create(e, a) {
            return a = a !== void 0 ? a : 438, a &= 4095, a |= 32768, n.mknod(e, a, 0);
          },
          mkdir(e, a) {
            return a = a !== void 0 ? a : 511, a &= 1023, a |= 16384, n.mknod(e, a, 0);
          },
          mkdirTree(e, a) {
            for (var t = e.split("/"), r = "", s = 0; s < t.length; ++s)
              if (t[s]) {
                r += "/" + t[s];
                try {
                  n.mkdir(r, a);
                } catch (i) {
                  if (i.errno != 20) throw i;
                }
              }
          },
          mkdev(e, a, t) {
            return typeof t > "u" && (t = a, a = 438), a |= 8192, n.mknod(e, a, t);
          },
          symlink(e, a) {
            if (!O.resolve(e))
              throw new n.ErrnoError(44);
            var t = n.lookupPath(a, { parent: true }), r = t.node;
            if (!r)
              throw new n.ErrnoError(44);
            var s = P2.basename(a), i = n.mayCreate(r, s);
            if (i)
              throw new n.ErrnoError(i);
            if (!r.node_ops.symlink)
              throw new n.ErrnoError(63);
            return r.node_ops.symlink(r, s, e);
          },
          rename(e, a) {
            var t = P2.dirname(e), r = P2.dirname(a), s = P2.basename(e), i = P2.basename(a), d, l, m;
            if (d = n.lookupPath(e, { parent: true }), l = d.node, d = n.lookupPath(a, { parent: true }), m = d.node, !l || !m) throw new n.ErrnoError(44);
            if (l.mount !== m.mount)
              throw new n.ErrnoError(75);
            var v = n.lookupNode(l, s), y = O.relative(e, r);
            if (y.charAt(0) !== ".")
              throw new n.ErrnoError(28);
            if (y = O.relative(a, t), y.charAt(0) !== ".")
              throw new n.ErrnoError(55);
            var h2;
            try {
              h2 = n.lookupNode(m, i);
            } catch {
            }
            if (v !== h2) {
              var g = n.isDir(v.mode), p2 = n.mayDelete(l, s, g);
              if (p2)
                throw new n.ErrnoError(p2);
              if (p2 = h2 ? n.mayDelete(m, i, g) : n.mayCreate(m, i), p2)
                throw new n.ErrnoError(p2);
              if (!l.node_ops.rename)
                throw new n.ErrnoError(63);
              if (n.isMountpoint(v) || h2 && n.isMountpoint(h2))
                throw new n.ErrnoError(10);
              if (m !== l && (p2 = n.nodePermissions(l, "w"), p2))
                throw new n.ErrnoError(p2);
              n.hashRemoveNode(v);
              try {
                l.node_ops.rename(v, m, i);
              } catch (_3) {
                throw _3;
              } finally {
                n.hashAddNode(v);
              }
            }
          },
          rmdir(e) {
            var a = n.lookupPath(e, { parent: true }), t = a.node, r = P2.basename(e), s = n.lookupNode(t, r), i = n.mayDelete(t, r, true);
            if (i)
              throw new n.ErrnoError(i);
            if (!t.node_ops.rmdir)
              throw new n.ErrnoError(63);
            if (n.isMountpoint(s))
              throw new n.ErrnoError(10);
            t.node_ops.rmdir(t, r), n.destroyNode(s);
          },
          readdir(e) {
            var a = n.lookupPath(e, { follow: true }), t = a.node;
            if (!t.node_ops.readdir)
              throw new n.ErrnoError(54);
            return t.node_ops.readdir(t);
          },
          unlink(e) {
            var a = n.lookupPath(e, { parent: true }), t = a.node;
            if (!t)
              throw new n.ErrnoError(44);
            var r = P2.basename(e), s = n.lookupNode(t, r), i = n.mayDelete(t, r, false);
            if (i)
              throw new n.ErrnoError(i);
            if (!t.node_ops.unlink)
              throw new n.ErrnoError(63);
            if (n.isMountpoint(s))
              throw new n.ErrnoError(10);
            t.node_ops.unlink(t, r), n.destroyNode(s);
          },
          readlink(e) {
            var a = n.lookupPath(e), t = a.node;
            if (!t)
              throw new n.ErrnoError(44);
            if (!t.node_ops.readlink)
              throw new n.ErrnoError(28);
            return O.resolve(n.getPath(t.parent), t.node_ops.readlink(t));
          },
          stat(e, a) {
            var t = n.lookupPath(e, { follow: !a }), r = t.node;
            if (!r)
              throw new n.ErrnoError(44);
            if (!r.node_ops.getattr)
              throw new n.ErrnoError(63);
            return r.node_ops.getattr(r);
          },
          lstat(e) {
            return n.stat(e, true);
          },
          chmod(e, a, t) {
            var r;
            if (typeof e == "string") {
              var s = n.lookupPath(e, { follow: !t });
              r = s.node;
            } else
              r = e;
            if (!r.node_ops.setattr)
              throw new n.ErrnoError(63);
            r.node_ops.setattr(r, {
              mode: a & 4095 | r.mode & -4096,
              timestamp: Date.now()
            });
          },
          lchmod(e, a) {
            n.chmod(e, a, true);
          },
          fchmod(e, a) {
            var t = n.getStreamChecked(e);
            n.chmod(t.node, a);
          },
          chown(e, a, t, r) {
            var s;
            if (typeof e == "string") {
              var i = n.lookupPath(e, { follow: !r });
              s = i.node;
            } else
              s = e;
            if (!s.node_ops.setattr)
              throw new n.ErrnoError(63);
            s.node_ops.setattr(s, { timestamp: Date.now() });
          },
          lchown(e, a, t) {
            n.chown(e, a, t, true);
          },
          fchown(e, a, t) {
            var r = n.getStreamChecked(e);
            n.chown(r.node, a, t);
          },
          truncate(e, a) {
            if (a < 0)
              throw new n.ErrnoError(28);
            var t;
            if (typeof e == "string") {
              var r = n.lookupPath(e, { follow: true });
              t = r.node;
            } else
              t = e;
            if (!t.node_ops.setattr)
              throw new n.ErrnoError(63);
            if (n.isDir(t.mode))
              throw new n.ErrnoError(31);
            if (!n.isFile(t.mode))
              throw new n.ErrnoError(28);
            var s = n.nodePermissions(t, "w");
            if (s)
              throw new n.ErrnoError(s);
            t.node_ops.setattr(t, { size: a, timestamp: Date.now() });
          },
          ftruncate(e, a) {
            var t = n.getStreamChecked(e);
            if (!(t.flags & 2097155))
              throw new n.ErrnoError(28);
            n.truncate(t.node, a);
          },
          utime(e, a, t) {
            var r = n.lookupPath(e, { follow: true }), s = r.node;
            s.node_ops.setattr(s, { timestamp: Math.max(a, t) });
          },
          open(e, a, t) {
            if (e === "")
              throw new n.ErrnoError(44);
            a = typeof a == "string" ? Fa(a) : a, t = typeof t > "u" ? 438 : t, a & 64 ? t = t & 4095 | 32768 : t = 0;
            var r;
            if (typeof e == "object")
              r = e;
            else {
              e = P2.normalize(e);
              try {
                var s = n.lookupPath(e, { follow: !(a & 131072) });
                r = s.node;
              } catch {
              }
            }
            var i = false;
            if (a & 64)
              if (r) {
                if (a & 128)
                  throw new n.ErrnoError(20);
              } else
                r = n.mknod(e, t, 0), i = true;
            if (!r)
              throw new n.ErrnoError(44);
            if (n.isChrdev(r.mode) && (a &= -513), a & 65536 && !n.isDir(r.mode))
              throw new n.ErrnoError(54);
            if (!i) {
              var d = n.mayOpen(r, a);
              if (d)
                throw new n.ErrnoError(d);
            }
            a & 512 && !i && n.truncate(r, 0), a &= -131713;
            var l = n.createStream({
              node: r,
              path: n.getPath(r),
              flags: a,
              seekable: true,
              position: 0,
              stream_ops: r.stream_ops,
              ungotten: [],
              error: false
            });
            return l.stream_ops.open && l.stream_ops.open(l), o.logReadFiles && !(a & 1) && (n.readFiles || (n.readFiles = {}), e in n.readFiles || (n.readFiles[e] = 1)), l;
          },
          close(e) {
            if (n.isClosed(e))
              throw new n.ErrnoError(8);
            e.getdents && (e.getdents = null);
            try {
              e.stream_ops.close && e.stream_ops.close(e);
            } catch (a) {
              throw a;
            } finally {
              n.closeStream(e.fd);
            }
            e.fd = null;
          },
          isClosed(e) {
            return e.fd === null;
          },
          llseek(e, a, t) {
            if (n.isClosed(e))
              throw new n.ErrnoError(8);
            if (!e.seekable || !e.stream_ops.llseek)
              throw new n.ErrnoError(70);
            if (t != 0 && t != 1 && t != 2)
              throw new n.ErrnoError(28);
            return e.position = e.stream_ops.llseek(e, a, t), e.ungotten = [], e.position;
          },
          read(e, a, t, r, s) {
            if (r < 0 || s < 0)
              throw new n.ErrnoError(28);
            if (n.isClosed(e))
              throw new n.ErrnoError(8);
            if ((e.flags & 2097155) === 1)
              throw new n.ErrnoError(8);
            if (n.isDir(e.node.mode))
              throw new n.ErrnoError(31);
            if (!e.stream_ops.read)
              throw new n.ErrnoError(28);
            var i = typeof s < "u";
            if (!i)
              s = e.position;
            else if (!e.seekable)
              throw new n.ErrnoError(70);
            var d = e.stream_ops.read(e, a, t, r, s);
            return i || (e.position += d), d;
          },
          write(e, a, t, r, s, i) {
            if (r < 0 || s < 0)
              throw new n.ErrnoError(28);
            if (n.isClosed(e))
              throw new n.ErrnoError(8);
            if (!(e.flags & 2097155))
              throw new n.ErrnoError(8);
            if (n.isDir(e.node.mode))
              throw new n.ErrnoError(31);
            if (!e.stream_ops.write)
              throw new n.ErrnoError(28);
            e.seekable && e.flags & 1024 && n.llseek(e, 0, 2);
            var d = typeof s < "u";
            if (!d)
              s = e.position;
            else if (!e.seekable)
              throw new n.ErrnoError(70);
            var l = e.stream_ops.write(
              e,
              a,
              t,
              r,
              s,
              i
            );
            return d || (e.position += l), l;
          },
          allocate(e, a, t) {
            if (n.isClosed(e))
              throw new n.ErrnoError(8);
            if (a < 0 || t <= 0)
              throw new n.ErrnoError(28);
            if (!(e.flags & 2097155))
              throw new n.ErrnoError(8);
            if (!n.isFile(e.node.mode) && !n.isDir(e.node.mode))
              throw new n.ErrnoError(43);
            if (!e.stream_ops.allocate)
              throw new n.ErrnoError(138);
            e.stream_ops.allocate(e, a, t);
          },
          mmap(e, a, t, r, s) {
            if (r & 2 && !(s & 2) && (e.flags & 2097155) !== 2)
              throw new n.ErrnoError(2);
            if ((e.flags & 2097155) === 1)
              throw new n.ErrnoError(2);
            if (!e.stream_ops.mmap)
              throw new n.ErrnoError(43);
            return e.stream_ops.mmap(e, a, t, r, s);
          },
          msync(e, a, t, r, s) {
            return e.stream_ops.msync ? e.stream_ops.msync(e, a, t, r, s) : 0;
          },
          munmap: (e) => 0,
          ioctl(e, a, t) {
            if (!e.stream_ops.ioctl)
              throw new n.ErrnoError(59);
            return e.stream_ops.ioctl(e, a, t);
          },
          readFile(e, a = {}) {
            if (a.flags = a.flags || 0, a.encoding = a.encoding || "binary", a.encoding !== "utf8" && a.encoding !== "binary")
              throw new Error(`Invalid encoding type "${a.encoding}"`);
            var t, r = n.open(e, a.flags), s = n.stat(e), i = s.size, d = new Uint8Array(i);
            return n.read(r, d, 0, i, 0), a.encoding === "utf8" ? t = Y(d, 0) : a.encoding === "binary" && (t = d), n.close(r), t;
          },
          writeFile(e, a, t = {}) {
            t.flags = t.flags || 577;
            var r = n.open(e, t.flags, t.mode);
            if (typeof a == "string") {
              var s = new Uint8Array(we2(a) + 1), i = ye2(a, s, 0, s.length);
              n.write(r, s, 0, i, void 0, t.canOwn);
            } else if (ArrayBuffer.isView(a))
              n.write(r, a, 0, a.byteLength, void 0, t.canOwn);
            else
              throw new Error("Unsupported data type");
            n.close(r);
          },
          cwd: () => n.currentPath,
          chdir(e) {
            var a = n.lookupPath(e, { follow: true });
            if (a.node === null)
              throw new n.ErrnoError(44);
            if (!n.isDir(a.node.mode))
              throw new n.ErrnoError(54);
            var t = n.nodePermissions(a.node, "x");
            if (t)
              throw new n.ErrnoError(t);
            n.currentPath = a.path;
          },
          createDefaultDirectories() {
            n.mkdir("/tmp"), n.mkdir("/home"), n.mkdir("/home/web_user");
          },
          createDefaultDevices() {
            n.mkdir("/dev"), n.registerDevice(n.makedev(1, 3), {
              read: () => 0,
              write: (r, s, i, d, l) => d
            }), n.mkdev("/dev/null", n.makedev(1, 3)), B3.register(n.makedev(5, 0), B3.default_tty_ops), B3.register(n.makedev(6, 0), B3.default_tty1_ops), n.mkdev("/dev/tty", n.makedev(5, 0)), n.mkdev("/dev/tty1", n.makedev(6, 0));
            var e = new Uint8Array(1024), a = 0, t = () => (a === 0 && (a = Ue2(e).byteLength), e[--a]);
            n.createDevice("/dev", "random", t), n.createDevice("/dev", "urandom", t), n.mkdir("/dev/shm"), n.mkdir("/dev/shm/tmp");
          },
          createSpecialDirectories() {
            n.mkdir("/proc");
            var e = n.mkdir("/proc/self");
            n.mkdir("/proc/self/fd"), n.mount(
              {
                mount() {
                  var a = n.createNode(e, "fd", 16895, 73);
                  return a.node_ops = {
                    lookup(t, r) {
                      var s = +r, i = n.getStreamChecked(s), d = {
                        parent: null,
                        mount: { mountpoint: "fake" },
                        node_ops: { readlink: () => i.path }
                      };
                      return d.parent = d, d;
                    }
                  }, a;
                }
              },
              {},
              "/proc/self/fd"
            );
          },
          createStandardStreams() {
            o.stdin ? n.createDevice("/dev", "stdin", o.stdin) : n.symlink("/dev/tty", "/dev/stdin"), o.stdout ? n.createDevice("/dev", "stdout", null, o.stdout) : n.symlink("/dev/tty", "/dev/stdout"), o.stderr ? n.createDevice("/dev", "stderr", null, o.stderr) : n.symlink("/dev/tty1", "/dev/stderr"), n.open("/dev/stdin", 0), n.open("/dev/stdout", 1), n.open("/dev/stderr", 1);
          },
          ensureErrnoError() {
            n.ErrnoError || (n.ErrnoError = function(a, t) {
              this.name = "ErrnoError", this.node = t, this.setErrno = function(r) {
                this.errno = r;
              }, this.setErrno(a), this.message = "FS error";
            }, n.ErrnoError.prototype = new Error(), n.ErrnoError.prototype.constructor = n.ErrnoError, [44].forEach((e) => {
              n.genericErrors[e] = new n.ErrnoError(e), n.genericErrors[e].stack = "<generic error, no stack>";
            }));
          },
          staticInit() {
            n.ensureErrnoError(), n.nameTable = new Array(4096), n.mount(w, {}, "/"), n.createDefaultDirectories(), n.createDefaultDevices(), n.createSpecialDirectories(), n.filesystems = { MEMFS: w };
          },
          init(e, a, t) {
            n.init.initialized = true, n.ensureErrnoError(), o.stdin = e || o.stdin, o.stdout = a || o.stdout, o.stderr = t || o.stderr, n.createStandardStreams();
          },
          quit() {
            n.init.initialized = false;
            for (var e = 0; e < n.streams.length; e++) {
              var a = n.streams[e];
              a && n.close(a);
            }
          },
          findObject(e, a) {
            var t = n.analyzePath(e, a);
            return t.exists ? t.object : null;
          },
          analyzePath(e, a) {
            try {
              var t = n.lookupPath(e, { follow: !a });
              e = t.path;
            } catch {
            }
            var r = {
              isRoot: false,
              exists: false,
              error: 0,
              name: null,
              path: null,
              object: null,
              parentExists: false,
              parentPath: null,
              parentObject: null
            };
            try {
              var t = n.lookupPath(e, { parent: true });
              r.parentExists = true, r.parentPath = t.path, r.parentObject = t.node, r.name = P2.basename(e), t = n.lookupPath(e, { follow: !a }), r.exists = true, r.path = t.path, r.object = t.node, r.name = t.node.name, r.isRoot = t.path === "/";
            } catch (s) {
              r.error = s.errno;
            }
            return r;
          },
          createPath(e, a, t, r) {
            e = typeof e == "string" ? e : n.getPath(e);
            for (var s = a.split("/").reverse(); s.length; ) {
              var i = s.pop();
              if (i) {
                var d = P2.join2(e, i);
                try {
                  n.mkdir(d);
                } catch {
                }
                e = d;
              }
            }
            return d;
          },
          createFile(e, a, t, r, s) {
            var i = P2.join2(typeof e == "string" ? e : n.getPath(e), a), d = be2(r, s);
            return n.create(i, d);
          },
          createDataFile(e, a, t, r, s, i) {
            var d = a;
            e && (e = typeof e == "string" ? e : n.getPath(e), d = a ? P2.join2(e, a) : e);
            var l = be2(r, s), m = n.create(d, l);
            if (t) {
              if (typeof t == "string") {
                for (var v = new Array(t.length), y = 0, h2 = t.length; y < h2; ++y) v[y] = t.charCodeAt(y);
                t = v;
              }
              n.chmod(m, l | 146);
              var g = n.open(m, 577);
              n.write(g, t, 0, t.length, 0, i), n.close(g), n.chmod(m, l);
            }
            return m;
          },
          createDevice(e, a, t, r) {
            var s = P2.join2(typeof e == "string" ? e : n.getPath(e), a), i = be2(!!t, !!r);
            n.createDevice.major || (n.createDevice.major = 64);
            var d = n.makedev(n.createDevice.major++, 0);
            return n.registerDevice(d, {
              open(l) {
                l.seekable = false;
              },
              close(l) {
                r && r.buffer && r.buffer.length && r(10);
              },
              read(l, m, v, y, h2) {
                for (var g = 0, p2 = 0; p2 < y; p2++) {
                  var _3;
                  try {
                    _3 = t();
                  } catch {
                    throw new n.ErrnoError(29);
                  }
                  if (_3 === void 0 && g === 0)
                    throw new n.ErrnoError(6);
                  if (_3 == null) break;
                  g++, m[v + p2] = _3;
                }
                return g && (l.node.timestamp = Date.now()), g;
              },
              write(l, m, v, y, h2) {
                for (var g = 0; g < y; g++)
                  try {
                    r(m[v + g]);
                  } catch {
                    throw new n.ErrnoError(29);
                  }
                return y && (l.node.timestamp = Date.now()), g;
              }
            }), n.mkdev(s, i, d);
          },
          forceLoadFile(e) {
            if (e.isDevice || e.isFolder || e.link || e.contents) return true;
            if (typeof XMLHttpRequest < "u")
              throw new Error(
                "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
              );
            if (G)
              try {
                e.contents = le2(G(e.url), true), e.usedBytes = e.contents.length;
              } catch {
                throw new n.ErrnoError(29);
              }
            else
              throw new Error("Cannot load without read() or XMLHttpRequest.");
          },
          createLazyFile(e, a, t, r, s) {
            function i() {
              this.lengthKnown = false, this.chunks = [];
            }
            if (i.prototype.get = function(p2) {
              if (!(p2 > this.length - 1 || p2 < 0)) {
                var _3 = p2 % this.chunkSize, E = p2 / this.chunkSize | 0;
                return this.getter(E)[_3];
              }
            }, i.prototype.setDataGetter = function(p2) {
              this.getter = p2;
            }, i.prototype.cacheLength = function() {
              var p2 = new XMLHttpRequest();
              if (p2.open("HEAD", t, false), p2.send(null), !(p2.status >= 200 && p2.status < 300 || p2.status === 304))
                throw new Error("Couldn't load " + t + ". Status: " + p2.status);
              var _3 = Number(p2.getResponseHeader("Content-length")), E, b2 = (E = p2.getResponseHeader("Accept-Ranges")) && E === "bytes", S2 = (E = p2.getResponseHeader("Content-Encoding")) && E === "gzip", f2 = 1024 * 1024;
              b2 || (f2 = _3);
              var c2 = (D2, x2) => {
                if (D2 > x2)
                  throw new Error("invalid range (" + D2 + ", " + x2 + ") or no bytes requested!");
                if (x2 > _3 - 1)
                  throw new Error("only " + _3 + " bytes available! programmer error!");
                var R3 = new XMLHttpRequest();
                if (R3.open("GET", t, false), _3 !== f2 && R3.setRequestHeader("Range", "bytes=" + D2 + "-" + x2), R3.responseType = "arraybuffer", R3.overrideMimeType && R3.overrideMimeType("text/plain; charset=x-user-defined"), R3.send(null), !(R3.status >= 200 && R3.status < 300 || R3.status === 304))
                  throw new Error("Couldn't load " + t + ". Status: " + R3.status);
                return R3.response !== void 0 ? new Uint8Array(R3.response || []) : le2(R3.responseText || "", true);
              }, z = this;
              z.setDataGetter((D2) => {
                var x2 = D2 * f2, R3 = (D2 + 1) * f2 - 1;
                if (R3 = Math.min(R3, _3 - 1), typeof z.chunks[D2] > "u" && (z.chunks[D2] = c2(x2, R3)), typeof z.chunks[D2] > "u") throw new Error("doXHR failed!");
                return z.chunks[D2];
              }), (S2 || !_3) && (f2 = _3 = 1, _3 = this.getter(0).length, f2 = _3, ke("LazyFiles on gzip forces download of the whole file when length is accessed")), this._length = _3, this._chunkSize = f2, this.lengthKnown = true;
            }, typeof XMLHttpRequest < "u") {
              if (!q)
                throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
              var d = new i();
              Object.defineProperties(d, {
                length: {
                  get: function() {
                    return this.lengthKnown || this.cacheLength(), this._length;
                  }
                },
                chunkSize: {
                  get: function() {
                    return this.lengthKnown || this.cacheLength(), this._chunkSize;
                  }
                }
              });
              var l = { isDevice: false, contents: d };
            } else
              var l = { isDevice: false, url: t };
            var m = n.createFile(e, a, l, r, s);
            l.contents ? m.contents = l.contents : l.url && (m.contents = null, m.url = l.url), Object.defineProperties(m, {
              usedBytes: {
                get: function() {
                  return this.contents.length;
                }
              }
            });
            var v = {}, y = Object.keys(m.stream_ops);
            y.forEach((g) => {
              var p2 = m.stream_ops[g];
              v[g] = function() {
                return n.forceLoadFile(m), p2.apply(null, arguments);
              };
            });
            function h2(g, p2, _3, E, b2) {
              var S2 = g.node.contents;
              if (b2 >= S2.length) return 0;
              var f2 = Math.min(S2.length - b2, E);
              if (S2.slice)
                for (var c2 = 0; c2 < f2; c2++)
                  p2[_3 + c2] = S2[b2 + c2];
              else
                for (var c2 = 0; c2 < f2; c2++)
                  p2[_3 + c2] = S2.get(b2 + c2);
              return f2;
            }
            return v.read = (g, p2, _3, E, b2) => (n.forceLoadFile(m), h2(g, p2, _3, E, b2)), v.mmap = (g, p2, _3, E, b2) => {
              n.forceLoadFile(m);
              var S2 = Be();
              if (!S2)
                throw new n.ErrnoError(48);
              return h2(g, T, S2, p2, _3), { ptr: S2, allocated: true };
            }, m.stream_ops = v, m;
          }
        }, F2 = {
          DEFAULT_POLLMASK: 5,
          calculateAt(e, a, t) {
            if (P2.isAbs(a))
              return a;
            var r;
            if (e === -100)
              r = n.cwd();
            else {
              var s = F2.getStreamFromFD(e);
              r = s.path;
            }
            if (a.length == 0) {
              if (!t)
                throw new n.ErrnoError(44);
              return r;
            }
            return P2.join2(r, a);
          },
          doStat(e, a, t) {
            try {
              var r = e(a);
            } catch (l) {
              if (l && l.node && P2.normalize(a) !== P2.normalize(n.getPath(l.node)))
                return -54;
              throw l;
            }
            k[t >> 2] = r.dev, k[t + 4 >> 2] = r.mode, A[t + 8 >> 2] = r.nlink, k[t + 12 >> 2] = r.uid, k[t + 16 >> 2] = r.gid, k[t + 20 >> 2] = r.rdev, M = [
              r.size >>> 0,
              (u2 = r.size, +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
            ], k[t + 24 >> 2] = M[0], k[t + 28 >> 2] = M[1], k[t + 32 >> 2] = 4096, k[t + 36 >> 2] = r.blocks;
            var s = r.atime.getTime(), i = r.mtime.getTime(), d = r.ctime.getTime();
            return M = [
              Math.floor(s / 1e3) >>> 0,
              (u2 = Math.floor(s / 1e3), +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
            ], k[t + 40 >> 2] = M[0], k[t + 44 >> 2] = M[1], A[t + 48 >> 2] = s % 1e3 * 1e3, M = [
              Math.floor(i / 1e3) >>> 0,
              (u2 = Math.floor(i / 1e3), +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
            ], k[t + 56 >> 2] = M[0], k[t + 60 >> 2] = M[1], A[t + 64 >> 2] = i % 1e3 * 1e3, M = [
              Math.floor(d / 1e3) >>> 0,
              (u2 = Math.floor(d / 1e3), +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
            ], k[t + 72 >> 2] = M[0], k[t + 76 >> 2] = M[1], A[t + 80 >> 2] = d % 1e3 * 1e3, M = [
              r.ino >>> 0,
              (u2 = r.ino, +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
            ], k[t + 88 >> 2] = M[0], k[t + 92 >> 2] = M[1], 0;
          },
          doMsync(e, a, t, r, s) {
            if (!n.isFile(a.node.mode))
              throw new n.ErrnoError(43);
            if (r & 2)
              return 0;
            var i = H2.slice(e, e + t);
            n.msync(a, i, s, t, r);
          },
          varargs: void 0,
          get() {
            var e = k[+F2.varargs >> 2];
            return F2.varargs += 4, e;
          },
          getp() {
            return F2.get();
          },
          getStr(e) {
            var a = W(e);
            return a;
          },
          getStreamFromFD(e) {
            var a = n.getStreamChecked(e);
            return a;
          }
        };
        function Pa(e, a, t) {
          F2.varargs = t;
          try {
            var r = F2.getStreamFromFD(e);
            switch (a) {
              case 0: {
                var s = F2.get();
                if (s < 0)
                  return -28;
                for (; n.streams[s]; )
                  s++;
                var i;
                return i = n.createStream(r, s), i.fd;
              }
              case 1:
              case 2:
                return 0;
              case 3:
                return r.flags;
              case 4: {
                var s = F2.get();
                return r.flags |= s, 0;
              }
              case 5: {
                var s = F2.getp(), d = 0;
                return V2[s + d >> 1] = 2, 0;
              }
              case 6:
              case 7:
                return 0;
              case 16:
              case 8:
                return -28;
              case 9:
                return ka(28), -1;
              default:
                return -28;
            }
          } catch (l) {
            if (typeof n > "u" || l.name !== "ErrnoError") throw l;
            return -l.errno;
          }
        }
        var qe = (e, a, t) => ye2(e, H2, a, t);
        function Da(e, a, t) {
          try {
            var r = F2.getStreamFromFD(e);
            r.getdents || (r.getdents = n.readdir(r.path));
            for (var s = 280, i = 0, d = n.llseek(r, 0, 1), l = Math.floor(d / s); l < r.getdents.length && i + s <= t; ) {
              var m, v, y = r.getdents[l];
              if (y === ".")
                m = r.node.id, v = 4;
              else if (y === "..") {
                var h2 = n.lookupPath(r.path, { parent: true });
                m = h2.node.id, v = 4;
              } else {
                var g = n.lookupNode(r.node, y);
                m = g.id, v = n.isChrdev(g.mode) ? 2 : n.isDir(g.mode) ? 4 : n.isLink(g.mode) ? 10 : 8;
              }
              M = [
                m >>> 0,
                (u2 = m, +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
              ], k[a + i >> 2] = M[0], k[a + i + 4 >> 2] = M[1], M = [
                (l + 1) * s >>> 0,
                (u2 = (l + 1) * s, +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
              ], k[a + i + 8 >> 2] = M[0], k[a + i + 12 >> 2] = M[1], V2[a + i + 16 >> 1] = 280, T[a + i + 18 >> 0] = v, qe(y, a + i + 19, 256), i += s, l += 1;
            }
            return n.llseek(r, l * s, 0), i;
          } catch (p2) {
            if (typeof n > "u" || p2.name !== "ErrnoError") throw p2;
            return -p2.errno;
          }
        }
        function Aa(e, a, t) {
          F2.varargs = t;
          try {
            var r = F2.getStreamFromFD(e);
            switch (a) {
              case 21509:
                return r.tty ? 0 : -59;
              case 21505: {
                if (!r.tty) return -59;
                if (r.tty.ops.ioctl_tcgets) {
                  var s = r.tty.ops.ioctl_tcgets(r), i = F2.getp();
                  k[i >> 2] = s.c_iflag || 0, k[i + 4 >> 2] = s.c_oflag || 0, k[i + 8 >> 2] = s.c_cflag || 0, k[i + 12 >> 2] = s.c_lflag || 0;
                  for (var d = 0; d < 32; d++)
                    T[i + d + 17 >> 0] = s.c_cc[d] || 0;
                  return 0;
                }
                return 0;
              }
              case 21510:
              case 21511:
              case 21512:
                return r.tty ? 0 : -59;
              case 21506:
              case 21507:
              case 21508: {
                if (!r.tty) return -59;
                if (r.tty.ops.ioctl_tcsets) {
                  for (var i = F2.getp(), l = k[i >> 2], m = k[i + 4 >> 2], v = k[i + 8 >> 2], y = k[i + 12 >> 2], h2 = [], d = 0; d < 32; d++)
                    h2.push(T[i + d + 17 >> 0]);
                  return r.tty.ops.ioctl_tcsets(r.tty, a, {
                    c_iflag: l,
                    c_oflag: m,
                    c_cflag: v,
                    c_lflag: y,
                    c_cc: h2
                  });
                }
                return 0;
              }
              case 21519: {
                if (!r.tty) return -59;
                var i = F2.getp();
                return k[i >> 2] = 0, 0;
              }
              case 21520:
                return r.tty ? -28 : -59;
              case 21531: {
                var i = F2.getp();
                return n.ioctl(r, a, i);
              }
              case 21523: {
                if (!r.tty) return -59;
                if (r.tty.ops.ioctl_tiocgwinsz) {
                  var g = r.tty.ops.ioctl_tiocgwinsz(r.tty), i = F2.getp();
                  V2[i >> 1] = g[0], V2[i + 2 >> 1] = g[1];
                }
                return 0;
              }
              case 21524:
                return r.tty ? 0 : -59;
              case 21515:
                return r.tty ? 0 : -59;
              default:
                return -28;
            }
          } catch (p2) {
            if (typeof n > "u" || p2.name !== "ErrnoError") throw p2;
            return -p2.errno;
          }
        }
        function Ma(e, a, t, r) {
          F2.varargs = r;
          try {
            a = F2.getStr(a), a = F2.calculateAt(e, a);
            var s = r ? F2.get() : 0;
            return n.open(a, t, s).fd;
          } catch (i) {
            if (typeof n > "u" || i.name !== "ErrnoError") throw i;
            return -i.errno;
          }
        }
        function Ra(e) {
          try {
            return e = F2.getStr(e), n.rmdir(e), 0;
          } catch (a) {
            if (typeof n > "u" || a.name !== "ErrnoError") throw a;
            return -a.errno;
          }
        }
        function za(e, a) {
          try {
            return e = F2.getStr(e), F2.doStat(n.stat, e, a);
          } catch (t) {
            if (typeof n > "u" || t.name !== "ErrnoError") throw t;
            return -t.errno;
          }
        }
        function Ta(e, a, t) {
          try {
            return a = F2.getStr(a), a = F2.calculateAt(e, a), t === 0 ? n.unlink(a) : t === 512 ? n.rmdir(a) : L3("Invalid flags passed to unlinkat"), 0;
          } catch (r) {
            if (typeof n > "u" || r.name !== "ErrnoError") throw r;
            return -r.errno;
          }
        }
        var Na = true, xa = () => Na, Ca = () => {
          L3("");
        }, La = () => Date.now(), Oa = (e, a, t) => H2.copyWithin(e, a, a + t), ja2 = (e) => {
          L3("OOM");
        }, Ua = (e) => {
          H2.length, ja2();
        }, Ee2 = {}, Ba = () => ae2 || "./this.program", Z2 = () => {
          if (!Z2.strings) {
            var e = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", a = {
              USER: "web_user",
              LOGNAME: "web_user",
              PATH: "/",
              PWD: "/",
              HOME: "/home/web_user",
              LANG: e,
              _: Ba()
            };
            for (var t in Ee2)
              Ee2[t] === void 0 ? delete a[t] : a[t] = Ee2[t];
            var r = [];
            for (var t in a)
              r.push(`${t}=${a[t]}`);
            Z2.strings = r;
          }
          return Z2.strings;
        }, qa2 = (e, a) => {
          for (var t = 0; t < e.length; ++t)
            T[a++ >> 0] = e.charCodeAt(t);
          T[a >> 0] = 0;
        }, Ha2 = (e, a) => {
          var t = 0;
          return Z2().forEach((r, s) => {
            var i = a + t;
            A[e + s * 4 >> 2] = i, qa2(r, i), t += r.length + 1;
          }), 0;
        }, Ia = (e, a) => {
          var t = Z2();
          A[e >> 2] = t.length;
          var r = 0;
          return t.forEach((s) => r += s.length + 1), A[a >> 2] = r, 0;
        }, Ya2 = 0, Wa2 = () => pa2 || Ya2 > 0, Ga = (e) => {
          se = e, Wa2() || (o.onExit && o.onExit(e), he = true), te(e, new Le(e));
        }, He = (e, a) => {
          se = e, Ga(e);
        }, $a = He;
        function Xa2(e) {
          try {
            var a = F2.getStreamFromFD(e);
            return n.close(a), 0;
          } catch (t) {
            if (typeof n > "u" || t.name !== "ErrnoError") throw t;
            return t.errno;
          }
        }
        var Va2 = (e, a, t, r) => {
          for (var s = 0, i = 0; i < t; i++) {
            var d = A[a >> 2], l = A[a + 4 >> 2];
            a += 8;
            var m = n.read(e, T, d, l, r);
            if (m < 0) return -1;
            if (s += m, m < l) break;
          }
          return s;
        };
        function Ka2(e, a, t, r) {
          try {
            var s = F2.getStreamFromFD(e), i = Va2(s, a, t);
            return A[r >> 2] = i, 0;
          } catch (d) {
            if (typeof n > "u" || d.name !== "ErrnoError") throw d;
            return d.errno;
          }
        }
        var Ja2 = (e, a) => a + 2097152 >>> 0 < 4194305 - !!e ? (e >>> 0) + a * 4294967296 : NaN;
        function Za2(e, a, t, r, s) {
          var i = Ja2(a, t);
          try {
            if (isNaN(i)) return 61;
            var d = F2.getStreamFromFD(e);
            return n.llseek(d, i, r), M = [
              d.position >>> 0,
              (u2 = d.position, +Math.abs(u2) >= 1 ? u2 > 0 ? +Math.floor(u2 / 4294967296) >>> 0 : ~~+Math.ceil((u2 - +(~~u2 >>> 0)) / 4294967296) >>> 0 : 0)
            ], k[s >> 2] = M[0], k[s + 4 >> 2] = M[1], d.getdents && i === 0 && r === 0 && (d.getdents = null), 0;
          } catch (l) {
            if (typeof n > "u" || l.name !== "ErrnoError") throw l;
            return l.errno;
          }
        }
        var Qa2 = (e, a, t, r) => {
          for (var s = 0, i = 0; i < t; i++) {
            var d = A[a >> 2], l = A[a + 4 >> 2];
            a += 8;
            var m = n.write(e, T, d, l, r);
            if (m < 0) return -1;
            s += m;
          }
          return s;
        };
        function et(e, a, t, r) {
          try {
            var s = F2.getStreamFromFD(e), i = Qa2(s, a, t);
            return A[r >> 2] = i, 0;
          } catch (d) {
            if (typeof n > "u" || d.name !== "ErrnoError") throw d;
            return d.errno;
          }
        }
        var fe2 = (e) => e % 4 === 0 && (e % 100 !== 0 || e % 400 === 0), at = (e, a) => {
          for (var t = 0, r = 0; r <= a; t += e[r++])
            ;
          return t;
        }, Ie = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ye = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], tt = (e, a) => {
          for (var t = new Date(e.getTime()); a > 0; ) {
            var r = fe2(t.getFullYear()), s = t.getMonth(), i = (r ? Ie : Ye)[s];
            if (a > i - t.getDate())
              a -= i - t.getDate() + 1, t.setDate(1), s < 11 ? t.setMonth(s + 1) : (t.setMonth(0), t.setFullYear(t.getFullYear() + 1));
            else
              return t.setDate(t.getDate() + a), t;
          }
          return t;
        }, nt2 = (e, a) => {
          T.set(e, a);
        }, rt = (e, a, t, r) => {
          var s = A[r + 40 >> 2], i = {
            tm_sec: k[r >> 2],
            tm_min: k[r + 4 >> 2],
            tm_hour: k[r + 8 >> 2],
            tm_mday: k[r + 12 >> 2],
            tm_mon: k[r + 16 >> 2],
            tm_year: k[r + 20 >> 2],
            tm_wday: k[r + 24 >> 2],
            tm_yday: k[r + 28 >> 2],
            tm_isdst: k[r + 32 >> 2],
            tm_gmtoff: k[r + 36 >> 2],
            tm_zone: s ? W(s) : ""
          }, d = W(t), l = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var m in l)
            d = d.replace(new RegExp(m, "g"), l[m]);
          var v = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], y = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
          ];
          function h2(f2, c2, z) {
            for (var D2 = typeof f2 == "number" ? f2.toString() : f2 || ""; D2.length < c2; )
              D2 = z[0] + D2;
            return D2;
          }
          function g(f2, c2) {
            return h2(f2, c2, "0");
          }
          function p2(f2, c2) {
            function z(x2) {
              return x2 < 0 ? -1 : x2 > 0 ? 1 : 0;
            }
            var D2;
            return (D2 = z(f2.getFullYear() - c2.getFullYear())) === 0 && (D2 = z(f2.getMonth() - c2.getMonth())) === 0 && (D2 = z(f2.getDate() - c2.getDate())), D2;
          }
          function _3(f2) {
            switch (f2.getDay()) {
              case 0:
                return new Date(f2.getFullYear() - 1, 11, 29);
              case 1:
                return f2;
              case 2:
                return new Date(f2.getFullYear(), 0, 3);
              case 3:
                return new Date(f2.getFullYear(), 0, 2);
              case 4:
                return new Date(f2.getFullYear(), 0, 1);
              case 5:
                return new Date(f2.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f2.getFullYear() - 1, 11, 30);
            }
          }
          function E(f2) {
            var c2 = tt(new Date(f2.tm_year + 1900, 0, 1), f2.tm_yday), z = new Date(c2.getFullYear(), 0, 4), D2 = new Date(c2.getFullYear() + 1, 0, 4), x2 = _3(z), R3 = _3(D2);
            return p2(x2, c2) <= 0 ? p2(R3, c2) <= 0 ? c2.getFullYear() + 1 : c2.getFullYear() : c2.getFullYear() - 1;
          }
          var b2 = {
            "%a": (f2) => v[f2.tm_wday].substring(0, 3),
            "%A": (f2) => v[f2.tm_wday],
            "%b": (f2) => y[f2.tm_mon].substring(0, 3),
            "%B": (f2) => y[f2.tm_mon],
            "%C": (f2) => {
              var c2 = f2.tm_year + 1900;
              return g(c2 / 100 | 0, 2);
            },
            "%d": (f2) => g(f2.tm_mday, 2),
            "%e": (f2) => h2(f2.tm_mday, 2, " "),
            "%g": (f2) => E(f2).toString().substring(2),
            "%G": (f2) => E(f2),
            "%H": (f2) => g(f2.tm_hour, 2),
            "%I": (f2) => {
              var c2 = f2.tm_hour;
              return c2 == 0 ? c2 = 12 : c2 > 12 && (c2 -= 12), g(c2, 2);
            },
            "%j": (f2) => g(
              f2.tm_mday + at(
                fe2(f2.tm_year + 1900) ? Ie : Ye,
                f2.tm_mon - 1
              ),
              3
            ),
            "%m": (f2) => g(f2.tm_mon + 1, 2),
            "%M": (f2) => g(f2.tm_min, 2),
            "%n": () => `
`,
            "%p": (f2) => f2.tm_hour >= 0 && f2.tm_hour < 12 ? "AM" : "PM",
            "%S": (f2) => g(f2.tm_sec, 2),
            "%t": () => "	",
            "%u": (f2) => f2.tm_wday || 7,
            "%U": (f2) => {
              var c2 = f2.tm_yday + 7 - f2.tm_wday;
              return g(Math.floor(c2 / 7), 2);
            },
            "%V": (f2) => {
              var c2 = Math.floor((f2.tm_yday + 7 - (f2.tm_wday + 6) % 7) / 7);
              if ((f2.tm_wday + 371 - f2.tm_yday - 2) % 7 <= 2 && c2++, c2) {
                if (c2 == 53) {
                  var D2 = (f2.tm_wday + 371 - f2.tm_yday) % 7;
                  D2 != 4 && (D2 != 3 || !fe2(f2.tm_year)) && (c2 = 1);
                }
              } else {
                c2 = 52;
                var z = (f2.tm_wday + 7 - f2.tm_yday - 1) % 7;
                (z == 4 || z == 5 && fe2(f2.tm_year % 400 - 1)) && c2++;
              }
              return g(c2, 2);
            },
            "%w": (f2) => f2.tm_wday,
            "%W": (f2) => {
              var c2 = f2.tm_yday + 7 - (f2.tm_wday + 6) % 7;
              return g(Math.floor(c2 / 7), 2);
            },
            "%y": (f2) => (f2.tm_year + 1900).toString().substring(2),
            "%Y": (f2) => f2.tm_year + 1900,
            "%z": (f2) => {
              var c2 = f2.tm_gmtoff, z = c2 >= 0;
              return c2 = Math.abs(c2) / 60, c2 = c2 / 60 * 100 + c2 % 60, (z ? "+" : "-") + ("0000" + c2).slice(-4);
            },
            "%Z": (f2) => f2.tm_zone,
            "%%": () => "%"
          };
          d = d.replace(/%%/g, "\0\0");
          for (var m in b2)
            d.includes(m) && (d = d.replace(new RegExp(m, "g"), b2[m](i)));
          d = d.replace(/\0\0/g, "%");
          var S2 = le2(d, false);
          return S2.length > a ? 0 : (nt2(S2, e), S2.length - 1);
        }, st = (e, a, t, r, s) => rt(e, a, t, r), it2 = (e) => {
          if (e instanceof Le || e == "unwind")
            return se;
          te(1, e);
        }, ot = (e) => {
          var a = we2(e) + 1, t = Se(a);
          return qe(e, t, a), t;
        }, We2 = function(e, a, t, r) {
          e || (e = this), this.parent = e, this.mount = e.mount, this.mounted = null, this.id = n.nextInode++, this.name = a, this.mode = t, this.node_ops = {}, this.stream_ops = {}, this.rdev = r;
        }, me2 = 365, ce2 = 146;
        Object.defineProperties(We2.prototype, {
          read: {
            get: function() {
              return (this.mode & me2) === me2;
            },
            set: function(e) {
              e ? this.mode |= me2 : this.mode &= ~me2;
            }
          },
          write: {
            get: function() {
              return (this.mode & ce2) === ce2;
            },
            set: function(e) {
              e ? this.mode |= ce2 : this.mode &= ~ce2;
            }
          },
          isFolder: {
            get: function() {
              return n.isDir(this.mode);
            }
          },
          isDevice: {
            get: function() {
              return n.isChrdev(this.mode);
            }
          }
        }), n.FSNode = We2, n.createPreloadedFile = Sa, n.staticInit(), o.FS_createPath = n.createPath, o.FS_createDataFile = n.createDataFile, o.FS_createPreloadedFile = n.createPreloadedFile, o.FS_unlink = n.unlink, o.FS_createLazyFile = n.createLazyFile, o.FS_createDevice = n.createDevice;
        var dt2 = {
          a: ga,
          b: va,
          e: Pa,
          r: Da,
          v: Aa,
          f: Ma,
          p: Ra,
          o: za,
          q: Ta,
          j: xa,
          h: Ca,
          g: La,
          k: Oa,
          n: Ua,
          s: Ha2,
          t: Ia,
          d: $a,
          c: Xa2,
          u: Ka2,
          l: Za2,
          i: et,
          m: st
        }, j2 = ca2(), Ge = o._main = (e, a) => (Ge = o._main = j2.y)(e, a), $e2 = () => ($e2 = j2.z)(), Se = (e) => (Se = j2.B)(e), Xe2 = (e) => (Xe2 = j2.C)(e);
        o.addRunDependency = ie, o.removeRunDependency = J, o.FS_createPath = n.createPath, o.FS_createLazyFile = n.createLazyFile, o.FS_createDevice = n.createDevice, o.callMain = Ve, o.FS_createPreloadedFile = n.createPreloadedFile, o.FS = n, o.FS_createDataFile = n.createDataFile, o.FS_unlink = n.unlink;
        var pe;
        K = function e() {
          pe || Ke(), pe || (K = e);
        };
        function Ve(e = []) {
          var a = Ge;
          e.unshift(ae2);
          var t = e.length, r = Se((t + 1) * 4), s = r;
          e.forEach((d) => {
            A[s >> 2] = ot(d), s += 4;
          }), A[s >> 2] = 0;
          try {
            var i = a(t, r);
            return He(i, true), i;
          } catch (d) {
            return it2(d);
          }
        }
        function Ke(e = ge) {
          if (U2 > 0 || (ta2(), U2 > 0))
            return;
          function a() {
            pe || (pe = true, o.calledRun = true, !he && (na(), ra(), Pe(o), o.onRuntimeInitialized && o.onRuntimeInitialized(), Je2 && Ve(e), sa2()));
          }
          o.setStatus ? (o.setStatus("Running..."), setTimeout(function() {
            setTimeout(function() {
              o.setStatus("");
            }, 1), a();
          }, 1)) : a();
        }
        if (o.preInit)
          for (typeof o.preInit == "function" && (o.preInit = [o.preInit]); o.preInit.length > 0; )
            o.preInit.pop()();
        var Je2 = false;
        return o.noInitialRun && (Je2 = false), Ke(), Fe.ready;
      };
    })();
  }
});

// node_modules/onnxruntime-web/dist/esm/ort.min.js
var ort_min_exports = {};
__export(ort_min_exports, {
  InferenceSession: () => Pd,
  TRACE: () => ls,
  TRACE_FUNC_BEGIN: () => lr,
  TRACE_FUNC_END: () => fr,
  Tensor: () => Me,
  TrainingSession: () => Dd,
  default: () => jO,
  env: () => Z,
  registerBackend: () => Pr
});
function Xt(a, t, o, e) {
  if (t === void 0) return Cd(a);
  if (o === void 0) Bn(a, t, 1);
  else if (typeof o == "number" && e === void 0) Bn(a, t, o);
  else if (typeof o == "string" && e === void 0) Bn(a, o, 1, t);
  else if (typeof o == "string" && typeof e == "number") Bn(a, o, e, t);
  else throw new TypeError("input is valid");
}
function Cd(a) {
  return { verbose: Xt.verbose.bind(null, a), info: Xt.info.bind(null, a), warning: Xt.warning.bind(null, a), error: Xt.error.bind(null, a), fatal: Xt.fatal.bind(null, a) };
}
function Bn(a, t, o, e) {
  let r = en[e || ""] || en[""];
  xs[a] < xs[r.minimalSeverity] || (r.logDateTime && (t = `${(/* @__PURE__ */ new Date()).toISOString()}|${t}`), r.logSourceLocation, Ld[r.provider].log(a, t, e));
}
function vs(a, t, o) {
  for (let e of o) {
    let r = e[0], n = e[1], s = e[2], i = e[3], u2 = e[4];
    if (a.opType === r) {
      for (let l of t) if ((l.domain === n || l.domain === "ai.onnx" && n === "") && Fd(l.version, s)) return { opImpl: i, opInit: u2 };
    }
  }
  throw new TypeError(`cannot resolve operator '${a.opType}' with opsets: ${t.map((e) => `${e.domain || "ai.onnx"} v${e.version}`).join(", ")}`);
}
function Fd(a, t) {
  if (t.endsWith("+")) {
    let o = Number.parseInt(t.substring(0, t.length - 1), 10);
    return !isNaN(o) && o <= a;
  } else if (t.split("-").length === 2) {
    let o = t.split("-"), e = Number.parseInt(o[0], 10), r = Number.parseInt(o[1], 10);
    return !isNaN(e) && !isNaN(r) && e <= a && a <= r;
  } else return Number.parseInt(t, 10) === a;
}
function be(a, t, o) {
  this.low = a | 0, this.high = t | 0, this.unsigned = !!o;
}
function Xe(a) {
  return (a && a.__isLong__) === true;
}
function Is(a) {
  var t = Math.clz32(a & -a);
  return a ? 31 - t : t;
}
function cr(a, t) {
  var o, e, r;
  return t ? (a >>>= 0, (r = 0 <= a && a < 256) && (e = As[a], e) ? e : (o = le(a, 0, true), r && (As[a] = o), o)) : (a |= 0, (r = -128 <= a && a < 128) && (e = Ss[a], e) ? e : (o = le(a, a < 0 ? -1 : 0, false), r && (Ss[a] = o), o));
}
function ct(a, t) {
  if (isNaN(a)) return t ? zt : It;
  if (t) {
    if (a < 0) return zt;
    if (a >= Ls) return $s;
  } else {
    if (a <= -Es) return nt;
    if (a + 1 >= Es) return Fs;
  }
  return a < 0 ? ct(-a, t).neg() : le(a % Dr | 0, a / Dr | 0, t);
}
function le(a, t, o) {
  return new be(a, t, o);
}
function Jo(a, t, o) {
  if (a.length === 0) throw Error("empty string");
  if (typeof t == "number" ? (o = t, t = false) : t = !!t, a === "NaN" || a === "Infinity" || a === "+Infinity" || a === "-Infinity") return t ? zt : It;
  if (o = o || 10, o < 2 || 36 < o) throw RangeError("radix");
  var e;
  if ((e = a.indexOf("-")) > 0) throw Error("interior hyphen");
  if (e === 0) return Jo(a.substring(1), t, o).neg();
  for (var r = ct(Un(o, 8)), n = It, s = 0; s < a.length; s += 8) {
    var i = Math.min(8, a.length - s), u2 = parseInt(a.substring(s, s + i), o);
    if (i < 8) {
      var l = ct(Un(o, i));
      n = n.mul(l).add(ct(u2));
    } else n = n.mul(r), n = n.add(ct(u2));
  }
  return n.unsigned = t, n;
}
function St(a, t) {
  return typeof a == "number" ? ct(a, t) : typeof a == "string" ? Jo(a, t) : le(a.low, a.high, typeof t == "boolean" ? t : a.unsigned);
}
function Fr(a, t) {
  if (!a) throw new Error(typeof t == "string" ? t : t());
}
function sn(a) {
  return new TextDecoder().decode(a);
}
function Hd(a) {
  switch (a) {
    case "bool":
    case "int8":
    case "uint8":
      return 1;
    case "int16":
    case "uint16":
      return 2;
    case "int32":
    case "uint32":
    case "float32":
      return 4;
    case "float64":
      return 8;
    default:
      throw new Error(`cannot calculate sizeof() on type ${a}`);
  }
}
function Fu(a) {
  switch (a) {
    case ne.onnx.TensorProto.DataType.UINT8:
    case ne.onnx.TensorProto.DataType.INT8:
    case ne.onnx.TensorProto.DataType.BOOL:
      return 1;
    case ne.onnx.TensorProto.DataType.UINT16:
    case ne.onnx.TensorProto.DataType.INT16:
      return 2;
    case ne.onnx.TensorProto.DataType.FLOAT:
    case ne.onnx.TensorProto.DataType.INT32:
    case ne.onnx.TensorProto.DataType.UINT32:
      return 4;
    case ne.onnx.TensorProto.DataType.INT64:
    case ne.onnx.TensorProto.DataType.DOUBLE:
    case ne.onnx.TensorProto.DataType.UINT64:
      return 8;
    default:
      throw new Error(`cannot calculate sizeof() on type ${ne.onnx.TensorProto.DataType[a]}`);
  }
}
function qd(a, t) {
  return new (Bu(t))(a);
}
function Bu(a) {
  switch (a) {
    case "bool":
    case "uint8":
      return Uint8Array;
    case "int8":
      return Int8Array;
    case "int16":
      return Int16Array;
    case "uint16":
      return Uint16Array;
    case "int32":
      return Int32Array;
    case "uint32":
      return Uint32Array;
    case "int64":
      return BigInt64Array;
    case "float32":
      return Float32Array;
    case "float64":
      return Float64Array;
    default:
      throw new Error("unspecified error");
  }
}
function hi(a, t) {
  if (t === ne.onnx.TensorProto.DataType.INT64 || t === di.TensorDataType.INT64) {
    if (a.greaterThanOrEqual(2147483648) || a.lessThan(-2147483648)) throw new TypeError("int64 is not supported");
  } else if (t === ne.onnx.TensorProto.DataType.UINT32 || t === di.TensorDataType.UINT32 || t === ne.onnx.TensorProto.DataType.UINT64 || t === di.TensorDataType.UINT64) {
    if (a.greaterThanOrEqual(4294967296) || a.lessThan(0)) throw new TypeError("uint64 is not supported");
  } else throw new TypeError(`not a LONG type: ${ne.onnx.TensorProto.DataType[t]}`);
  return a.toNumber();
}
function $u(a, t, o) {
  switch (t) {
    case ne.onnx.TensorProto.DataType.BOOL:
    case ne.onnx.TensorProto.DataType.UINT8:
      return a.getUint8(o);
    case ne.onnx.TensorProto.DataType.INT8:
      return a.getInt8(o);
    case ne.onnx.TensorProto.DataType.UINT16:
      return a.getUint16(o, true);
    case ne.onnx.TensorProto.DataType.INT16:
      return a.getInt16(o, true);
    case ne.onnx.TensorProto.DataType.FLOAT:
      return a.getFloat32(o, true);
    case ne.onnx.TensorProto.DataType.INT32:
      return a.getInt32(o, true);
    case ne.onnx.TensorProto.DataType.UINT32:
      return a.getUint32(o, true);
    case ne.onnx.TensorProto.DataType.INT64:
      return hi(Vt.fromBits(a.getUint32(o, true), a.getUint32(o + 4, true), false), t);
    case ne.onnx.TensorProto.DataType.DOUBLE:
      return a.getFloat64(o, true);
    case ne.onnx.TensorProto.DataType.UINT64:
      return hi(Vt.fromBits(a.getUint32(o, true), a.getUint32(o + 4, true), true), t);
    default:
      throw new Error(`cannot read from DataView for type ${ne.onnx.TensorProto.DataType[t]}`);
  }
}
function H(a) {
  return a === 1 ? jd : Yd;
}
function Nu(a) {
  let t = H(a);
  return `${t.version}
      precision highp float;
      ${t.attribute} vec3 position;
      ${t.attribute} vec2 textureCoord;

      ${t.varyingVertex} vec2 TexCoords;

      void main()
      {
          gl_Position = vec4(position, 1.0);
          TexCoords = textureCoord;
      }`;
}
function Ru(a) {
  let t = H(a);
  return `${t.version}
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    ${t.varyingFrag} vec2 TexCoords;
    ${t.outputDeclaration}
    const vec2 halfCR = vec2(0.5, 0.5);

    // Custom vector types to handle higher dimenalities.
    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    `;
}
function Mu(a, t) {
  let o = H(a);
  return `
  void main() {
    int indices[${t}];
    toVec(TexCoords, indices);
    vec4 result = vec4(process(indices));
    ${o.output} = result;
  }
  `;
}
async function mi(a, t = (e) => 0, o) {
  return new Promise((e, r) => {
    let n = 0, s = () => {
      if (a()) {
        e();
        return;
      }
      n++;
      let i = t(n);
      if (o != null && n >= o) {
        r();
        return;
      }
      setTimeout(s, i);
    };
    s();
  });
}
function Yn(a) {
  return Fr(typeof a < "u" && a.length !== 0, () => "empty string found for sampler name"), "get" + a.charAt(0).toUpperCase() + a.slice(1);
}
function Gu(a) {
  return Fr(typeof a < "u" && a.length !== 0, () => "empty string found for sampler name"), "get" + a.charAt(0).toUpperCase() + a.slice(1) + "AtOutCoords";
}
function $r(a, t) {
  let o = JSON.parse(JSON.stringify(a));
  return o = t, o;
}
function kr(a, t) {
  return t.map((o) => a[o]).join(", ");
}
function Qe(a) {
  if (a <= 1) return "int";
  if (a === 2) return "ivec2";
  if (a === 3) return "ivec3";
  if (a === 4) return "ivec4";
  if (a === 5) return "ivec5";
  if (a === 6) return "ivec6";
  throw Error(`GPU for rank ${a} is not yet supported`);
}
function Dt(a = 6) {
  return ["x", "y", "z", "w", "u", "v"].slice(0, a);
}
function Xd(a, t) {
  return Dt(t).map((o) => `${a}.${o}`);
}
function Br(a, t) {
  return t === 1 ? [a] : Xd(a, t);
}
function Nt() {
  return `
    float getChannel(vec4 frag, int dim) {
      int modCoord = imod(dim, 2);
      return modCoord == 0 ? frag.r : frag.g;
    }

    float getChannel(vec4 frag, vec2 innerDims) {
      vec2 modCoord = mod(innerDims, 2.);
      return modCoord.x == 0. ?
        (modCoord.y == 0. ? frag.r : frag.g) :
        (modCoord.y == 0. ? frag.b : frag.a);
    }
  `;
}
function Jd(a, t, o) {
  if (a === 0) return "false";
  if (a === 1) return `rc > ${t[0]}`;
  let e = "";
  for (let r = a - 2; r < a; r++) e += `${o[r]} >= ${t[r - a + 2]}`, r < a - 1 && (e += "||");
  return e;
}
function Zd(a, t) {
  let o = a.length;
  if (o === 0) return "getA(), 0, 0, 0";
  if (o === 1) return `getA(rc),
            rc + 1 >= ${a[0]} ? 0. : getA(rc + 1),
            0, 0`;
  let e = "r, c", r = "r, cp1", n = "rp1, c", s = "rp1, cp1", i = "";
  if (o > 2) for (let u2 = 0; u2 < o - 2; ++u2) i = i + `${t[u2]},`;
  return `getA(${i}${e}),
          rEdge ? 0. : getA(${i}${n}),
          cEdge ? 0. : getA(${i}${r}),
          rEdge || cEdge ? 0. : getA(${i}${s})`;
}
function Qd(a, t, o, e) {
  return a === 0 || a === 1 ? "" : `
    int r = ${t[a - 2]};
    int c = ${t[a - 1]};
    int rp1 = ${t[a - 2]} + 1;
    int cp1 = ${t[a - 1]} + 1;
    bool rEdge = rp1 >= ${e};
    bool cEdge = cp1 >= ${o};
    `;
}
function bi(a) {
  if (a.length === 0) return [1, 1, 1];
  let t = 1;
  for (let o = 0; o < a.length - 2; ++o) t *= a[o];
  return [t, a.length > 1 ? a[a.length - 2] : 1, a[a.length - 1]];
}
function Hu(a, t) {
  let o = false;
  return a.length === 0 || t.length === 0 ? o = true : a.length < 2 || t.length < 2 ? o = a[a.length - 1] === t[t.length - 1] : o = a[a.length - 1] === t[t.length - 1] && a[a.length - 2] === t[t.length - 2], o;
}
function rh(a) {
  let t = U.computeStrides(a), o = ["b", "r", "c"], e = "index";
  return `
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${t.map((n, s) => {
    let i = `int ${o[s]} = ${e} / ${n}`, u2 = s === t.length - 1 ? `int ${o[s + 1]} = ${e} - ${o[s]} * ${n}` : `index -= ${o[s]} * ${n}`;
    return `${i}; ${u2};`;
  }).join("")}
      return ivec3(b, r, c);
    }
  `;
}
function nh(a) {
  let t = U.computeStrides(a);
  return `
  int getFlattenedIndex(ivec3 coords) {
    // reverse y, z order
    return coords.x * ${t[0]} + coords.z * ${t[1]} + coords.y;
  }
`;
}
function ih(a, t) {
  if (a === 1) return "rc";
  let o = "";
  for (let e = 0; e < a; e++) o += t[e], e < a - 1 && (o += ",");
  return o;
}
function ch() {
  let a = "add_";
  return { body: `
  float ${a}(float a, float b) {
    return a + b;
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return v1 + v2;
  }
  `, name: a, type: 0 };
}
function ph() {
  let a = "div_";
  return { body: `
  float ${a}(float a, float b) {
    return a / b;
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return v1 / v2;
  }
  `, name: a, type: 0 };
}
function dh() {
  let a = "mul_";
  return { body: `
  float ${a}(float a, float b) {
    return a * b;
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return v1 * v2;
  }
  `, name: a, type: 0 };
}
function hh() {
  let a = "sub_";
  return { body: `
  float ${a}(float a, float b) {
    return a - b;
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return v1 - v2;
  }
  `, name: a, type: 0 };
}
function mh() {
  let a = "equal_";
  return { body: `
  float ${a}(float a, float b) {
    return float(a == b);
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return vec4(equal(v1, v2));
  }
  `, name: a, type: 0 };
}
function bh() {
  let a = "greater_";
  return { body: `
  float ${a}(float a, float b) {
    return float(a > b);
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return vec4( v1.r > v2.r ,
      v1.g > v2.g,
      v1.b > v2.b,
      v1.a > v2.a );
  }
  `, name: a, type: 0 };
}
function gh() {
  let a = "less_";
  return { body: `
  float ${a}(float a, float b) {
    return float(a < b);
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return vec4( v1.r < v2.r ,
                v1.g < v2.g,
                v1.b < v2.b,
                v1.a < v2.a );
  }
  `, name: a, type: 0 };
}
function yh() {
  let a = "and_";
  return { body: `
  float ${a}(float a, float b) {
    return float( bool(a) && bool(b) );
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    bvec4 b1 = bvec4(v1);
    bvec4 b2 = bvec4(v2);
    return vec4( b1.r && b2.r ,
                b1.g && b2.g,
                b1.b && b2.b,
                b1.a && b2.a );
  }
  `, name: a, type: 0 };
}
function Th() {
  let a = "or_";
  return { body: `
  float ${a}(float a, float b) {
    return float( bool(a) || bool(b) );
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    bvec4 b1 = bvec4(v1);
    bvec4 b2 = bvec4(v2);
    return vec4( b1.r || b2.r ,
                b1.g || b2.g,
                b1.b || b2.b,
                b1.a || b2.a );
  }
  `, name: a, type: 0 };
}
function xh() {
  let a = "xor_";
  return { body: `
  float ${a}(float a, float b) {
    return float( bool(a) ^^ bool(b) );
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    bvec4 b1 = bvec4(v1);
    bvec4 b2 = bvec4(v2);
    return vec4( b1.r ^^ b2.r ,
                b1.g ^^ b2.g,
                b1.b ^^ b2.b,
                b1.a ^^ b2.a );
  }
  `, name: a, type: 0 };
}
function wh() {
  return _h("pow");
}
function vh() {
  let a = "prelu_";
  return { body: `
  float ${a}(float a, float b) {
    return a < 0.0 ? a * b: a;
  }
  vec4 ${a}(vec4 v1, vec4 v2) {
    return vec4(
      v1.r < 0.0 ? v1.r * v2.r: v1.r,
      v1.g < 0.0 ? v1.g * v2.g: v1.g,
      v1.b < 0.0 ? v1.b * v2.b: v1.b,
      v1.a < 0.0 ? v1.a * v2.a: v1.a
      );
  }
  `, name: a, type: 0 };
}
function _h(a) {
  let t = `${a}_`;
  return { body: `
  float ${t}(float a, float b) {
    return ${a}(a, b);
  }
  vec4 ${t}(vec4 v1, vec4 v2) {
    return ${a}(v1, v2);
  }
  `, name: t, type: 0 };
}
function Bh() {
  return mt("abs");
}
function Nh() {
  return mt("acos");
}
function Rh() {
  return mt("asin");
}
function Mh() {
  return mt("atan");
}
function Gh() {
  return mt("ceil");
}
function Uh() {
  return mt("cos");
}
function zh(a) {
  let t = "elu";
  return { body: `
  const float alpha = float(${a});

  float ${t}_(float a) {
    return a >= 0.0 ? a: (exp(a) - 1.0) * alpha;
  }
  vec4 ${t}_(vec4 v) {
    return vec4(${t}_(v.x), ${t}_(v.y), ${t}_(v.z), ${t}_(v.w));
  }
  `, name: t, type: 0 };
}
function Vh() {
  return mt("exp");
}
function Wh() {
  return mt("floor");
}
function xi(a, t) {
  let o = "clip";
  return { body: `
  const float min = float(${a});
  const float max = float(${t});

  float ${o}_(float a) {
    return clamp(a, min, max);
  }
  vec4 ${o}_(vec4 v) {
    return clamp(v, min, max);
  }
  `, name: o, type: 0 };
}
function Hh() {
  let a = "indentity";
  return { body: `
  float ${a}_(float a) {
    return a;
  }
  vec4 ${a}_(vec4 v) {
    return v;
  }
  `, name: a, type: 0 };
}
function qh(a) {
  let t = "leakyRelu";
  return { body: `
  const float alpha = float(${a});

  float ${t}_(float a) {
    return a < 0.0 ? a * alpha : a;
  }
  vec4 ${t}_(vec4 v) {
    return vec4(${t}_(v.x), ${t}_(v.y), ${t}_(v.z), ${t}_(v.w));
  }
  `, name: t, type: 0 };
}
function jh() {
  return mt("log");
}
function Yh() {
  let a = "neg";
  return { body: `
  float ${a}_(float a) {
    return -a;
  }
  vec4 ${a}_(vec4 v) {
    return -v;
  }
  `, name: a, type: 0 };
}
function Xh() {
  let a = "not";
  return { body: `
  float ${a}_(float a) {
    return float( ! bool(a) );
  }
  bool ${a}_(bool a) {
    return !a;
  }
  vec4 ${a}_(vec4 v) {
    return vec4(!bool(v.x), !bool(v.y), !bool(v.z), !bool(v.w));
  }
  bvec4 ${a}_(bvec4 v) {
    return bvec4(!v.x, !v.y, !v.z, !v.w);
  }
  `, name: a, type: 0 };
}
function Kh() {
  return mt("sin");
}
function wi() {
  let a = "relu";
  return { body: `
  float ${a}_(float a) {
    return max( a, 0.0 );
  }
  vec4 ${a}_(vec4 v) {
    return max( v, 0.0 );
  }
  `, name: a, type: 0 };
}
function vi() {
  let a = "sigmoid";
  return { body: `
  float ${a}_(float a) {
    return 1.0 / (1.0 + exp(-a));
  }
  vec4 ${a}_(vec4 v) {
    return 1.0 / (1.0 + exp(-v));
  }
  `, name: a, type: 0 };
}
function Jh() {
  return mt("sqrt");
}
function Zh() {
  return mt("tan");
}
function Qh() {
  let a = "tanh";
  return { body: `
  float ${a}_(float a) {
    a = clamp(a, -10., 10.);
    a = exp(2.*a);
    return (a - 1.) / (a + 1.);
  }
  vec4 ${a}_(vec4 v) {
    v = clamp(v, -10., 10.);
    v = exp(2.*v);
    return (v - 1.) / (v + 1.);
  }
  `, name: a, type: 0 };
}
function mt(a) {
  return { body: `
  float ${a}_(float a) {
    return ${a}(a);
  }
  vec4 ${a}_(vec4 v) {
    return ${a}(v);
  }
  `, name: a, type: 0 };
}
function Rt(a) {
  let t;
  switch (a.activation) {
    case "Relu":
      t = wi();
      break;
    case "Sigmoid":
      t = vi();
      break;
    case "Clip":
      t = xi(a.clipMin, a.clipMax);
      break;
    default:
      return { activationFunction: "", applyActivation: "" };
  }
  let o = t.name, e = t.body, r = `value = ${o}_(value);`;
  return { activationFunction: e, applyActivation: r };
}
function um(a, t, o) {
  let e = t[0].dims, r = t[1].dims, n = Ze.calcShape(e, r, true);
  if (!n) throw new Error("Can't use matmul on the given tensors");
  let s = Qe(n.length), i = Dt(), { activationFunction: u2, applyActivation: l } = Rt(o), c2 = t.length > 2, p2 = c2 ? "value += getBiasForMatmul();" : "", d = c2 ? `${Ai(s, i, t[2].dims, n, false)}` : "", T = n.length, w = e.length, v = r.length, S2 = e[e.length - 1], A = `
    ${u2}
    ${d}
    float process(int indices[${T}]) {
        int a[${w}];
        int b[${v}];
        bcastMatmulIndices_A(indices, a);
        bcastMatmulIndices_B(indices, b);

        float value;
        for (int k=0; k<${S2}; ++k) {
            a[${w - 1}] = k;
            b[${v - 2}] = k;
            value += _A(a) * _B(b);
        }
        ${p2}
        ${l}
        return value;
    }`;
  return { ...a, output: { dims: n, type: t[0].type, textureType: 0 }, shaderSource: A };
}
function Si(a, t) {
  let o = sm(a.length > 2, t.activationCacheKey);
  return { ...o, get: () => um(o, a, t) };
}
function Ai(a, t, o, e, r) {
  let n = "", s = o.length, i = e.length, u2 = i - s;
  i < 2 && s > 0 ? n = "coords" : n = o.map((v, S2) => `coords.${t[S2 + u2]}`).join(", ");
  let c2 = Ze.getBroadcastDims(o, e).map((v) => `coords.${t[v + u2]} = 0;`).join(`
`), d = U.size(o) === 1, T = "vec4(outputValue.xx, outputValue.yy)";
  return d && (T = "vec4(outputValue.x)"), r ? `
vec4 getBiasForMatmul() {
  ${a} coords = getOutputCoords();
  ${c2}
  vec4 outputValue = getBias(${n});
  return ${T};
}` : `
float getBiasForMatmul() {
  ${a} coords = getOutputCoords();
  ${c2}
  return getBias(coords.x);
}`;
}
function pm(a, t, o, e) {
  let r = [], n = [], s = o[0].dims, i = o[1].dims, u2 = s.length, l = i.length, c2 = e.length, p2 = c2 - u2, d = c2 - l;
  r = s.map((F2, J) => `coords.${t[J + p2]}`), r[u2 - 1] = "i*2", r.join(", "), n = i.map((F2, J) => `coords.${t[J + d]}`), n[l - 2] = "i*2", n.join(", ");
  let T = Ze.getBroadcastDims(s, e), w = Ze.getBroadcastDims(i, e), v = T.map((F2) => `coords.${t[F2 + p2]} = 0;`).join(`
`), S2 = w.map((F2) => `coords.${t[F2 + d]} = 0;`).join(`
`), A = `int lastDim = coords.${t[c2 - 1]};
  coords.${t[c2 - 1]} = coords.${t[c2 - 2]};
  coords.${t[c2 - 2]} = lastDim;`;
  return `
vec4 getAAtOutCoordsMatmul(int i) {
  ${a} coords = getOutputCoords();
  ${A}
  ${v}
  vec4 outputValue = getA(${r});
  return outputValue;
}

vec4 getBAtOutCoordsMatmul(int i) {
  ${a} coords = getOutputCoords();
  ${A}
  ${S2}
  vec4 outputValue = getB(${n});
  return outputValue;
}`;
}
function dm(a, t) {
  let o = "";
  for (let e = 0; e < t - 2; e++) o += `rc.${a[e]}, `;
  return o += `rc.${a[t - 2]}, i*2`, o;
}
function hm(a, t) {
  let o = "";
  for (let e = 0; e < t - 2; e++) o += `rc.${a[e]}, `;
  return o += `i*2, rc.${a[t - 1]}`, o;
}
function ob(a, t) {
  let o = a[0].dims[1], e = a[0].dims.length, r = -Math.floor((t.size - 1) / 2), n = Math.ceil((t.size - 1) / 2), s = `float(${t.alpha}) / float(${t.size})`, i = `float(${t.bias})`, u2 = `float(${t.beta})`, l = `
    float process(int indices[${e}]) {
        int c = indices[1];
        float x = _X(indices);
        float square_sum = 0.0;

        for (int i = ${r}; i <= ${n}; i++) {
          int idx = c + i;
          if (c >= 0 && c < ${o}) {
            indices[1] = idx;
            float j = _X(indices);
            square_sum += j * j;
          }
        }
        return x / pow(${i} + ${s} * square_sum, ${u2});
    }`;
  return { ...Bf, cacheHint: t.cacheKey, output: { dims: a[0].dims, type: a[0].type, textureType: 0 }, shaderSource: l };
}
function ib(a, t) {
  return { ...Bf, cacheHint: t.cacheKey, get: () => ob(a, t) };
}
function Jc(a) {
  let t = {}, o;
  for (; (o = Kc.exec(a)) !== null; ) {
    let e = o[3].split(",").map((r) => {
      let n = r.trim().split(" ");
      return n && n.length === 2 ? { type: n[0], name: n[1] } : null;
    }).filter((r) => r !== null);
    t[o[2]] = { params: e, body: o[4] };
  }
  for (let e in t) {
    let r = Vb.replace("__FUNC__", e), n = new RegExp(r, "gm");
    for (; (o = n.exec(a)) !== null; ) {
      let s = o[1], i = o[2], u2 = o[3].split(","), l = s ? `${s} ${i};` : "", c2 = t[e].body, p2 = "";
      t[e].params.forEach((T, w) => {
        T && (p2 += `${T.type} ${T.name} = ${u2[w]};
`);
      }), c2 = `${p2}
 ${c2}`, c2 = c2.replace("return", `${i} = `);
      let d = `
      ${l}
      {
        ${c2}
      }
      `;
      a = a.replace(o[0], d);
    }
  }
  return a = a.replace(Kc, ""), a;
}
function Mr(a, t) {
  let o = [], e = [], r = t != null && Array.isArray(t) && t.length === 0, n = t == null || r ? null : Wb(t, a).sort(), s = 0;
  for (let i = 0; i < a.length; ++i) {
    if (n != null) {
      if (n[s] === i && a[i] !== 1) throw new Error(`Can't squeeze axis ${i} since its dim '${a[i]}' is not 1`);
      (n[s] == null || n[s] > i) && a[i] === 1 && (o.push(a[i]), e.push(i)), n[s] <= i && s++;
    }
    a[i] !== 1 && (o.push(a[i]), e.push(i));
  }
  return { newShape: o, keptDims: e };
}
function Wb(a, t) {
  let o = t.length;
  return a = a == null ? t.map((e, r) => r) : [].concat(a), Fr(a.every((e) => e >= -o && e < o), () => `All values in axis param must be in range [-${o}, ${o}) but got axis ${a}`), Fr(a.every(Hb), () => `All values in axis param must be integers but got axis ${a}`), a.map((e) => e < 0 ? o + e : e);
}
function Hb(a) {
  return a % 1 === 0;
}
function qb(a) {
  if (a.length === 0) return 1;
  let t = a[0];
  for (let o = 1; o < a.length; o++) t *= a[o];
  return t;
}
function Qc(a) {
  let t = Math.ceil(Math.sqrt(a));
  return [t, Math.ceil(a / t)];
}
function jb(a) {
  let t = 0;
  for (; t < a.length && a[t](); ++t) ;
  return t - 1;
}
function Hi(a) {
  let t;
  if ((!a || a === "webgl2") && "webgl2" in Gr ? t = Gr.webgl2 : (!a || a === "webgl") && "webgl" in Gr && (t = Gr.webgl), !t) try {
    let e = Xb();
    t = cp(e, a);
  } catch {
    let r = Yb();
    t = cp(r, a);
  }
  a = a || t.version === 1 ? "webgl" : "webgl2";
  let o = t.gl;
  return Gr[a] = t, o.isContextLost() ? (delete Gr[a], Hi(a)) : (o.disable(o.DEPTH_TEST), o.disable(o.STENCIL_TEST), o.disable(o.BLEND), o.disable(o.DITHER), o.disable(o.POLYGON_OFFSET_FILL), o.disable(o.SAMPLE_COVERAGE), o.enable(o.SCISSOR_TEST), o.enable(o.CULL_FACE), o.cullFace(o.BACK), t);
}
function cp(a, t) {
  let o = { alpha: false, depth: false, antialias: false, stencil: false, preserveDrawingBuffer: false, premultipliedAlpha: false, failIfMajorPerformanceCaveat: false }, e, r = o;
  if ((!t || t === "webgl2") && (e = a.getContext("webgl2", r), e)) try {
    return new hn(e, 2);
  } catch (n) {
    ce.warning("GlContextFactory", `failed to create WebGLContext using contextId 'webgl2'. Error: ${n}`);
  }
  if ((!t || t === "webgl") && (e = a.getContext("webgl", r) || a.getContext("experimental-webgl", r), e)) try {
    return new hn(e, 1);
  } catch (n) {
    ce.warning("GlContextFactory", `failed to create WebGLContext using contextId 'webgl' or 'experimental-webgl'. Error: ${n}`);
  }
  throw new Error("WebGL is not supported");
}
function Yb() {
  if (typeof document > "u") throw new TypeError("failed to create canvas: document is not supported");
  let a = document.createElement("canvas");
  return a.width = 1, a.height = 1, a;
}
function Xb() {
  if (typeof OffscreenCanvas > "u") throw new TypeError("failed to create offscreen canvas: OffscreenCanvas is not supported");
  return new OffscreenCanvas(1, 1);
}
async function qi(a) {
  if (a) {
    let t = typeof a == "string" ? [a] : a;
    for (let o of t) {
      let e = hp.get(o);
      if (e) return e;
      let r = await Jb(o);
      if (r) return r;
    }
  } else return qi(["webgl"]);
  throw new Error("no available backend to use");
}
async function Jb(a) {
  let t = Kb;
  if (typeof t[a] < "u" && Zb(t[a])) {
    let o = t[a], e = o.initialize();
    if (typeof e == "object" && "then" in e && (e = await e), e) return hp.set(a, o), o;
  }
}
function Zb(a) {
  let t = a;
  return "initialize" in t && typeof t.initialize == "function" && "createSessionHandler" in t && typeof t.createSessionHandler == "function" && "dispose" in t && typeof t.dispose == "function";
}
var vd, Pn, _d, Od, Id, Sd, L, me, Sr, Va, Ar, ar, En, sr, Pr, Ad, Dn, Ln, Wa, Ha, qa, ja, ut, Vo, Z, Ya, Xa, Ka, Ja, Wo, Za, Qa, es, ts, rs, ur, Qr, ns, os, is, as, ss, us, Je, Cn, Me, Fn, ls, fs, lr, fr, Ho, $n, cs, Pd, ps, ds, hs, ms, bs, Ed, kn, gs, Dd, ys, qo, Ot, jo, Yo, xs, Ld, ws, en, ce, Rn, Mn, Gn, Nn, lt, _s, Os, ft2, Ss, As, Un, Ps, kd, Dr, Ls, Es, Ds, It, zt, Er, Cs, Ko, Fs, $s, nt, B, Vt, Zo, _, zn, V, tn, Bs, Gs, zs, Xs, Ks, Zs, eu, ru, Jt, si, cu, fi, xu, vu, Ou, Su, Eu, Lu, Cr, ye, hr, pi, Ze, jn, We, it, U, an, mr, br, gr, fe, ku, ne, di, $e, yr, jd, Yd, we, ae, Bt, Tr, Uu, Kd, zu, Vu, eh, th, Wu, qu, gi, ju, Yu, oh, Xu, Ku, Xn, un, Kn, ln, fn, Ju, yi, Zu, sh, Jn, el, Ti, Q, Ue, tl, rl, nl, uh, lh, ol, Zn, dt, R, cn, Qn, Wt, ht, Oh, il, al, sl, ul, ll, fl, cl, pl, dl, hl, ml, bl, gl, yl, Tl, Sh, xl, Ah, Ph, wl, eo, vl, _l, Eh, Dh, Lh, Ol, Ch, Fh, $h, Il, kh, Sl, em, Ee, Al, Pl, El, Dl, _i, Ll, Cl, tm, Fl, $l, kl, Bl, Nl, Rl, Oi, Ml, Gl, Ul, zl, Vl, Wl, Hl, ql, jl, Yl, Xl, Ii, Nr, xr, nm, om, Kl, Jl, im, am, Zl, Ql, ef, tf, sm, lm, ro, fm, cm, no, Pi, rf, nf, mm, bm, of, Ei, Di, gm, ym, af, sf, Rr, Li, Tm, xm, wm, vm, Ci, _m, to, Om, Im, Sm, uf, Am, Pm, Em, Dm, Lm, Cm, lf, Fm, ff, cf, wr, pf, $m, df, km, Bm, Nm, oo, hf, mf, Rm, bf, gf, yf, Mm, Tf, Qt, pn, xf, wf, Gm, Um, zm, Vm, vf, Fi, _f, Of, If, Wm, Hm, qm, Sf, Af, Pf, jm, Ym, Xm, Km, Jm, Ef, Lf, Cf, Df, Zm, Qm, eb, tb, rb, nb, Ff, $f, kf, Bf, ab, Nf, sb, $i, Rf, Mf, Gf, ub, lb, fb, cb, pb, db, hb, mb, Uf, Vf, Wf, Hf, qf, jf, Yf, Xf, Kf, Jf, bb, zf, Zf, ao, Qf, io, gb, ec, vr, er, yb, Tb, tc, rc, nc, oc, ic, ac, sc, uc, lc, fc, cc, ki, pc, dc, dn, xb, Bi, so, Ni, Ri, Mi, hc, mc, wb, vb, _b, Ob, bc, gc, Ib, yc, Gi, Tc, xc, wc, Sb, vc, Ab, Pb, _c, Oc, Ic, Sc, Ac, Pc, Ec, Dc, Lc, Eb, Db, Lb, Cc, Fc, $c, kc, Bc, Cb, Fb, $b, Nc, Ui, Rc, Mc, kb, Bb, Gc, Uc, Nb, Rb, zc, Vc, Mb, Gb, Wc, zi, Hc, qc, Ub, zb, jc, Yc, Xc, Kc, Vb, Zc, uo, Vi, lo, ep, fo, tp, co, rp, po, np, ho, op, Wi, ip, mo, ap, bo, sp, go, up, yo, lp, hn, fp, Gr, pp, To, dp, hp, Kb, mp, ji, xo, bp, oe, bt, mn, gp, Xi, wo, Ki, Mt, vo, Yi, yp, Tp, Qb, _o, xp, Oo, wp, Io, vp, _p, Ji, tg, Op, Zi, rg, ng, Ip, Qi, ea, og, ta, Pp, Ep, Dp, Lp, ig, Cp, kp, Bp, Rp, sg, oa, ia, So, Np, ug, lg, fg, Mp, De, Ur, ve, bn, _e, Ao, Gp, Up, cg, pg, dg, hg, zp, Vp, aa, Wp, sa, Hp, qp, Po, jp, ua, gn, la, mg, Xp, Kp, zr, bg, fa, Jp, Zp, Yp, Qp, ed, td, rd, nd, _r, gt, yn, Do, Lo, ca, pa, Vr, Wr, Tg, Eo, od, id, ad, sd, ud, ld, fd, da, cd, xg, Co, pd, wg, Fo, dd, hd, vg, md, Ts, jO;
var init_ort_min = __esm({
  "node_modules/onnxruntime-web/dist/esm/ort.min.js"() {
    vd = Object.create;
    Pn = Object.defineProperty;
    _d = Object.getOwnPropertyDescriptor;
    Od = Object.getOwnPropertyNames;
    Id = Object.getPrototypeOf;
    Sd = Object.prototype.hasOwnProperty;
    L = (a, t) => () => (a && (t = a(a = 0)), t);
    me = (a, t) => () => (t || a((t = { exports: {} }).exports, t), t.exports);
    Sr = (a, t) => {
      for (var o in t) Pn(a, o, { get: t[o], enumerable: true });
    };
    Va = (a, t, o, e) => {
      if (t && typeof t == "object" || typeof t == "function") for (let r of Od(t)) !Sd.call(a, r) && r !== o && Pn(a, r, { get: () => t[r], enumerable: !(e = _d(t, r)) || e.enumerable });
      return a;
    };
    Ar = (a, t, o) => (o = a != null ? vd(Id(a)) : {}, Va(t || !a || !a.__esModule ? Pn(o, "default", { value: a, enumerable: true }) : o, a));
    ar = (a) => Va(Pn({}, "__esModule", { value: true }), a);
    Ln = L(() => {
      "use strict";
      En = /* @__PURE__ */ new Map(), sr = [], Pr = (a, t, o) => {
        if (t && typeof t.init == "function" && typeof t.createInferenceSessionHandler == "function") {
          let e = En.get(a);
          if (e === void 0) En.set(a, { backend: t, priority: o });
          else {
            if (e.priority > o) return;
            if (e.priority === o && e.backend !== t) throw new Error(`cannot register backend "${a}" using priority ${o}`);
          }
          if (o >= 0) {
            let r = sr.indexOf(a);
            r !== -1 && sr.splice(r, 1);
            for (let n = 0; n < sr.length; n++) if (En.get(sr[n]).priority <= o) {
              sr.splice(n, 0, a);
              return;
            }
            sr.push(a);
          }
          return;
        }
        throw new TypeError("not a valid backend");
      }, Ad = async (a) => {
        let t = En.get(a);
        if (!t) return "backend not found.";
        if (t.initialized) return t.backend;
        if (t.aborted) return t.error;
        {
          let o = !!t.initPromise;
          try {
            return o || (t.initPromise = t.backend.init(a)), await t.initPromise, t.initialized = true, t.backend;
          } catch (e) {
            return o || (t.error = `${e}`, t.aborted = true), t.error;
          } finally {
            delete t.initPromise;
          }
        }
      }, Dn = async (a) => {
        let t = a.executionProviders || [], o = t.map((u2) => typeof u2 == "string" ? u2 : u2.name), e = o.length === 0 ? sr : o, r, n = [], s = /* @__PURE__ */ new Set();
        for (let u2 of e) {
          let l = await Ad(u2);
          typeof l == "string" ? n.push({ name: u2, err: l }) : (r || (r = l), r === l && s.add(u2));
        }
        if (!r) throw new Error(`no available backend found. ERR: ${n.map((u2) => `[${u2.name}] ${u2.err}`).join(", ")}`);
        for (let { name: u2, err: l } of n) o.includes(u2) && console.warn(`removing requested execution provider "${u2}" from session options because it is not available: ${l}`);
        let i = t.filter((u2) => s.has(typeof u2 == "string" ? u2 : u2.name));
        return [r, new Proxy(a, { get: (u2, l) => l === "executionProviders" ? i : Reflect.get(u2, l) })];
      };
    });
    Wa = L(() => {
      "use strict";
      Ln();
    });
    qa = L(() => {
      "use strict";
      Ha = "1.18.0";
    });
    Vo = L(() => {
      "use strict";
      qa();
      ja = "warning", ut = { wasm: {}, webgl: {}, webgpu: {}, versions: { common: Ha }, set logLevel(a) {
        if (a !== void 0) {
          if (typeof a != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(a) === -1) throw new Error(`Unsupported logging level: ${a}`);
          ja = a;
        }
      }, get logLevel() {
        return ja;
      } };
      Object.defineProperty(ut, "logLevel", { enumerable: true });
    });
    Ya = L(() => {
      "use strict";
      Vo();
      Z = ut;
    });
    Ja = L(() => {
      "use strict";
      Xa = (a, t) => {
        let o = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
        o.width = a.dims[3], o.height = a.dims[2];
        let e = o.getContext("2d");
        if (e != null) {
          let r, n;
          t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (r = a.dims[2], n = a.dims[3]) : (r = a.dims[3], n = a.dims[2]);
          let s = t?.format !== void 0 ? t.format : "RGB", i = t?.norm, u2, l;
          i === void 0 || i.mean === void 0 ? u2 = [255, 255, 255, 255] : typeof i.mean == "number" ? u2 = [i.mean, i.mean, i.mean, i.mean] : (u2 = [i.mean[0], i.mean[1], i.mean[2], 0], i.mean[3] !== void 0 && (u2[3] = i.mean[3])), i === void 0 || i.bias === void 0 ? l = [0, 0, 0, 0] : typeof i.bias == "number" ? l = [i.bias, i.bias, i.bias, i.bias] : (l = [i.bias[0], i.bias[1], i.bias[2], 0], i.bias[3] !== void 0 && (l[3] = i.bias[3]));
          let c2 = n * r, p2 = 0, d = c2, T = c2 * 2, w = -1;
          s === "RGBA" ? (p2 = 0, d = c2, T = c2 * 2, w = c2 * 3) : s === "RGB" ? (p2 = 0, d = c2, T = c2 * 2) : s === "RBG" && (p2 = 0, T = c2, d = c2 * 2);
          for (let v = 0; v < n; v++) for (let S2 = 0; S2 < r; S2++) {
            let A = (a.data[p2++] - l[0]) * u2[0], C = (a.data[d++] - l[1]) * u2[1], F2 = (a.data[T++] - l[2]) * u2[2], J = w === -1 ? 255 : (a.data[w++] - l[3]) * u2[3];
            e.fillStyle = "rgba(" + A + "," + C + "," + F2 + "," + J + ")", e.fillRect(S2, v, 1, 1);
          }
          if ("toDataURL" in o) return o.toDataURL();
          throw new Error("toDataURL is not supported");
        } else throw new Error("Can not access image data");
      }, Ka = (a, t) => {
        let o = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), e;
        if (o != null) {
          let r, n, s;
          t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (r = a.dims[2], n = a.dims[1], s = a.dims[3]) : (r = a.dims[3], n = a.dims[2], s = a.dims[1]);
          let i = t !== void 0 && t.format !== void 0 ? t.format : "RGB", u2 = t?.norm, l, c2;
          u2 === void 0 || u2.mean === void 0 ? l = [255, 255, 255, 255] : typeof u2.mean == "number" ? l = [u2.mean, u2.mean, u2.mean, u2.mean] : (l = [u2.mean[0], u2.mean[1], u2.mean[2], 255], u2.mean[3] !== void 0 && (l[3] = u2.mean[3])), u2 === void 0 || u2.bias === void 0 ? c2 = [0, 0, 0, 0] : typeof u2.bias == "number" ? c2 = [u2.bias, u2.bias, u2.bias, u2.bias] : (c2 = [u2.bias[0], u2.bias[1], u2.bias[2], 0], u2.bias[3] !== void 0 && (c2[3] = u2.bias[3]));
          let p2 = n * r;
          if (t !== void 0 && (t.format !== void 0 && s === 4 && t.format !== "RGBA" || s === 3 && t.format !== "RGB" && t.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
          let d = 4, T = 0, w = 1, v = 2, S2 = 3, A = 0, C = p2, F2 = p2 * 2, J = -1;
          i === "RGBA" ? (A = 0, C = p2, F2 = p2 * 2, J = p2 * 3) : i === "RGB" ? (A = 0, C = p2, F2 = p2 * 2) : i === "RBG" && (A = 0, F2 = p2, C = p2 * 2), e = o.createImageData(r, n);
          for (let j2 = 0; j2 < n * r; T += d, w += d, v += d, S2 += d, j2++) e.data[T] = (a.data[A++] - c2[0]) * l[0], e.data[w] = (a.data[C++] - c2[1]) * l[1], e.data[v] = (a.data[F2++] - c2[2]) * l[2], e.data[S2] = J === -1 ? 255 : (a.data[J++] - c2[3]) * l[3];
        } else throw new Error("Can not access image data");
        return e;
      };
    });
    rs = L(() => {
      "use strict";
      Cn();
      Wo = (a, t) => {
        if (a === void 0) throw new Error("Image buffer must be defined");
        if (t.height === void 0 || t.width === void 0) throw new Error("Image height and width must be defined");
        if (t.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
        let { height: o, width: e } = t, r = t.norm ?? { mean: 255, bias: 0 }, n, s;
        typeof r.mean == "number" ? n = [r.mean, r.mean, r.mean, r.mean] : n = [r.mean[0], r.mean[1], r.mean[2], r.mean[3] ?? 255], typeof r.bias == "number" ? s = [r.bias, r.bias, r.bias, r.bias] : s = [r.bias[0], r.bias[1], r.bias[2], r.bias[3] ?? 0];
        let i = t.format !== void 0 ? t.format : "RGBA", u2 = t.tensorFormat !== void 0 && t.tensorFormat !== void 0 ? t.tensorFormat : "RGB", l = o * e, c2 = u2 === "RGBA" ? new Float32Array(l * 4) : new Float32Array(l * 3), p2 = 4, d = 0, T = 1, w = 2, v = 3, S2 = 0, A = l, C = l * 2, F2 = -1;
        i === "RGB" && (p2 = 3, d = 0, T = 1, w = 2, v = -1), u2 === "RGBA" ? F2 = l * 3 : u2 === "RBG" ? (S2 = 0, C = l, A = l * 2) : u2 === "BGR" && (C = 0, A = l, S2 = l * 2);
        for (let j2 = 0; j2 < l; j2++, d += p2, w += p2, T += p2, v += p2) c2[S2++] = (a[d] + s[0]) / n[0], c2[A++] = (a[T] + s[1]) / n[1], c2[C++] = (a[w] + s[2]) / n[2], F2 !== -1 && v !== -1 && (c2[F2++] = (a[v] + s[3]) / n[3]);
        return u2 === "RGBA" ? new Je("float32", c2, [1, 4, o, e]) : new Je("float32", c2, [1, 3, o, e]);
      }, Za = async (a, t) => {
        let o = typeof HTMLImageElement < "u" && a instanceof HTMLImageElement, e = typeof ImageData < "u" && a instanceof ImageData, r = typeof ImageBitmap < "u" && a instanceof ImageBitmap, n = typeof a == "string", s, i = t ?? {}, u2 = () => {
          if (typeof document < "u") return document.createElement("canvas");
          if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
          throw new Error("Canvas is not supported");
        }, l = (c2) => c2 instanceof HTMLCanvasElement || c2 instanceof OffscreenCanvas ? c2.getContext("2d") : null;
        if (o) {
          let c2 = u2();
          c2.width = a.width, c2.height = a.height;
          let p2 = l(c2);
          if (p2 != null) {
            let d = a.height, T = a.width;
            if (t !== void 0 && t.resizedHeight !== void 0 && t.resizedWidth !== void 0 && (d = t.resizedHeight, T = t.resizedWidth), t !== void 0) {
              if (i = t, t.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
              i.tensorFormat = "RGBA", i.height = d, i.width = T;
            } else i.tensorFormat = "RGBA", i.height = d, i.width = T;
            p2.drawImage(a, 0, 0), s = p2.getImageData(0, 0, T, d).data;
          } else throw new Error("Can not access image data");
        } else if (e) {
          let c2, p2;
          if (t !== void 0 && t.resizedWidth !== void 0 && t.resizedHeight !== void 0 ? (c2 = t.resizedHeight, p2 = t.resizedWidth) : (c2 = a.height, p2 = a.width), t !== void 0 && (i = t), i.format = "RGBA", i.height = c2, i.width = p2, t !== void 0) {
            let d = u2();
            d.width = p2, d.height = c2;
            let T = l(d);
            if (T != null) T.putImageData(a, 0, 0), s = T.getImageData(0, 0, p2, c2).data;
            else throw new Error("Can not access image data");
          } else s = a.data;
        } else if (r) {
          if (t === void 0) throw new Error("Please provide image config with format for Imagebitmap");
          let c2 = u2();
          c2.width = a.width, c2.height = a.height;
          let p2 = l(c2);
          if (p2 != null) {
            let d = a.height, T = a.width;
            return p2.drawImage(a, 0, 0, T, d), s = p2.getImageData(0, 0, T, d).data, i.height = d, i.width = T, Wo(s, i);
          } else throw new Error("Can not access image data");
        } else {
          if (n) return new Promise((c2, p2) => {
            let d = u2(), T = l(d);
            if (!a || !T) return p2();
            let w = new Image();
            w.crossOrigin = "Anonymous", w.src = a, w.onload = () => {
              d.width = w.width, d.height = w.height, T.drawImage(w, 0, 0, d.width, d.height);
              let v = T.getImageData(0, 0, d.width, d.height);
              i.height = d.height, i.width = d.width, c2(Wo(v.data, i));
            };
          });
          throw new Error("Input data provided is not supported - aborted tensor creation");
        }
        if (s !== void 0) return Wo(s, i);
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }, Qa = (a, t) => {
        let { width: o, height: e, download: r, dispose: n } = t, s = [1, e, o, 4];
        return new Je({ location: "texture", type: "float32", texture: a, dims: s, download: r, dispose: n });
      }, es = (a, t) => {
        let { dataType: o, dims: e, download: r, dispose: n } = t;
        return new Je({ location: "gpu-buffer", type: o ?? "float32", gpuBuffer: a, dims: e, download: r, dispose: n });
      }, ts = (a, t, o) => new Je({ location: "cpu-pinned", type: a, data: t, dims: o ?? [t.length] });
    });
    is = L(() => {
      "use strict";
      ur = /* @__PURE__ */ new Map([["float32", Float32Array], ["uint8", Uint8Array], ["int8", Int8Array], ["uint16", Uint16Array], ["int16", Int16Array], ["int32", Int32Array], ["bool", Uint8Array], ["float64", Float64Array], ["uint32", Uint32Array]]), Qr = /* @__PURE__ */ new Map([[Float32Array, "float32"], [Uint8Array, "uint8"], [Int8Array, "int8"], [Uint16Array, "uint16"], [Int16Array, "int16"], [Int32Array, "int32"], [Float64Array, "float64"], [Uint32Array, "uint32"]]), ns = false, os = () => {
        if (!ns) {
          ns = true;
          let a = typeof BigInt64Array < "u" && BigInt64Array.from, t = typeof BigUint64Array < "u" && BigUint64Array.from, o = typeof Float16Array < "u" && Float16Array.from;
          a && (ur.set("int64", BigInt64Array), Qr.set(BigInt64Array, "int64")), t && (ur.set("uint64", BigUint64Array), Qr.set(BigUint64Array, "uint64")), o ? (ur.set("float16", Float16Array), Qr.set(Float16Array, "float16")) : ur.set("float16", Uint16Array);
        }
      };
    });
    us = L(() => {
      "use strict";
      Cn();
      as = (a) => {
        let t = 1;
        for (let o = 0; o < a.length; o++) {
          let e = a[o];
          if (typeof e != "number" || !Number.isSafeInteger(e)) throw new TypeError(`dims[${o}] must be an integer, got: ${e}`);
          if (e < 0) throw new RangeError(`dims[${o}] must be a non-negative integer, got: ${e}`);
          t *= e;
        }
        return t;
      }, ss = (a, t) => {
        switch (a.location) {
          case "cpu":
            return new Je(a.type, a.data, t);
          case "cpu-pinned":
            return new Je({ location: "cpu-pinned", data: a.data, type: a.type, dims: t });
          case "texture":
            return new Je({ location: "texture", texture: a.texture, type: a.type, dims: t });
          case "gpu-buffer":
            return new Je({ location: "gpu-buffer", gpuBuffer: a.gpuBuffer, type: a.type, dims: t });
          default:
            throw new Error(`tensorReshape: tensor location ${a.location} is not supported`);
        }
      };
    });
    Cn = L(() => {
      "use strict";
      Ja();
      rs();
      is();
      us();
      Je = class {
        constructor(t, o, e) {
          os();
          let r, n;
          if (typeof t == "object" && "location" in t) switch (this.dataLocation = t.location, r = t.type, n = t.dims, t.location) {
            case "cpu-pinned": {
              let i = ur.get(r);
              if (!i) throw new TypeError(`unsupported type "${r}" to create tensor from pinned buffer`);
              if (!(t.data instanceof i)) throw new TypeError(`buffer should be of type ${i.name}`);
              this.cpuData = t.data;
              break;
            }
            case "texture": {
              if (r !== "float32") throw new TypeError(`unsupported type "${r}" to create tensor from texture`);
              this.gpuTextureData = t.texture, this.downloader = t.download, this.disposer = t.dispose;
              break;
            }
            case "gpu-buffer": {
              if (r !== "float32" && r !== "float16" && r !== "int32" && r !== "int64" && r !== "uint32" && r !== "uint8" && r !== "bool") throw new TypeError(`unsupported type "${r}" to create tensor from gpu buffer`);
              this.gpuBufferData = t.gpuBuffer, this.downloader = t.download, this.disposer = t.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
          else {
            let i, u2;
            if (typeof t == "string") if (r = t, u2 = e, t === "string") {
              if (!Array.isArray(o)) throw new TypeError("A string tensor's data must be a string array.");
              i = o;
            } else {
              let l = ur.get(t);
              if (l === void 0) throw new TypeError(`Unsupported tensor type: ${t}.`);
              if (Array.isArray(o)) {
                if (t === "float16" && l === Uint16Array) throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                t === "uint64" || t === "int64" ? i = l.from(o, BigInt) : i = l.from(o);
              } else if (o instanceof l) i = o;
              else throw new TypeError(`A ${r} tensor's data must be type of ${l}`);
            }
            else if (u2 = o, Array.isArray(t)) {
              if (t.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
              let l = typeof t[0];
              if (l === "string") r = "string", i = t;
              else if (l === "boolean") r = "bool", i = Uint8Array.from(t);
              else throw new TypeError(`Invalid element type of data array: ${l}.`);
            } else {
              let l = Qr.get(t.constructor);
              if (l === void 0) throw new TypeError(`Unsupported type for tensor data: ${t.constructor}.`);
              r = l, i = t;
            }
            if (u2 === void 0) u2 = [i.length];
            else if (!Array.isArray(u2)) throw new TypeError("A tensor's dims must be a number array");
            n = u2, this.cpuData = i, this.dataLocation = "cpu";
          }
          let s = as(n);
          if (this.cpuData && s !== this.cpuData.length) throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);
          this.type = r, this.dims = n, this.size = s;
        }
        static async fromImage(t, o) {
          return Za(t, o);
        }
        static fromTexture(t, o) {
          return Qa(t, o);
        }
        static fromGpuBuffer(t, o) {
          return es(t, o);
        }
        static fromPinnedBuffer(t, o, e) {
          return ts(t, o, e);
        }
        toDataURL(t) {
          return Xa(this, t);
        }
        toImageData(t) {
          return Ka(this, t);
        }
        get data() {
          if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
          return this.cpuData;
        }
        get location() {
          return this.dataLocation;
        }
        get texture() {
          if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
          return this.gpuTextureData;
        }
        get gpuBuffer() {
          if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
          return this.gpuBufferData;
        }
        async getData(t) {
          switch (this.ensureValid(), this.dataLocation) {
            case "cpu":
            case "cpu-pinned":
              return this.data;
            case "texture":
            case "gpu-buffer": {
              if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
              if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
              try {
                this.isDownloading = true;
                let o = await this.downloader();
                return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = o, t && this.disposer && (this.disposer(), this.disposer = void 0), o;
              } finally {
                this.isDownloading = false;
              }
            }
            default:
              throw new Error(`cannot get data from location: ${this.dataLocation}`);
          }
        }
        dispose() {
          if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
          this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
        }
        ensureValid() {
          if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
        }
        reshape(t) {
          if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
          return ss(this, t);
        }
      };
    });
    Fn = L(() => {
      "use strict";
      Cn();
      Me = Je;
    });
    Ho = L(() => {
      "use strict";
      Vo();
      ls = (a, t) => {
        (typeof ut.trace > "u" ? !ut.wasm.trace : !ut.trace) || console.timeStamp(`${a}::ORT::${t}`);
      }, fs = (a, t) => {
        let o = new Error().stack?.split(/\r\n|\r|\n/g) || [], e = false;
        for (let r = 0; r < o.length; r++) {
          if (e && !o[r].includes("TRACE_FUNC")) {
            let n = `FUNC_${a}::${o[r].trim().split(" ")[1]}`;
            t && (n += `::${t}`), ls("CPU", n);
            return;
          }
          o[r].includes("TRACE_FUNC") && (e = true);
        }
      }, lr = (a) => {
        (typeof ut.trace > "u" ? !ut.wasm.trace : !ut.trace) || fs("BEGIN", a);
      }, fr = (a) => {
        (typeof ut.trace > "u" ? !ut.wasm.trace : !ut.trace) || fs("END", a);
      };
    });
    cs = L(() => {
      "use strict";
      Ln();
      Fn();
      Ho();
      $n = class a {
        constructor(t) {
          this.handler = t;
        }
        async run(t, o, e) {
          lr();
          let r = {}, n = {};
          if (typeof t != "object" || t === null || t instanceof Me || Array.isArray(t)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
          let s = true;
          if (typeof o == "object") {
            if (o === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
            if (o instanceof Me) throw new TypeError("'fetches' cannot be a Tensor");
            if (Array.isArray(o)) {
              if (o.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
              s = false;
              for (let l of o) {
                if (typeof l != "string") throw new TypeError("'fetches' must be a string array or an object.");
                if (this.outputNames.indexOf(l) === -1) throw new RangeError(`'fetches' contains invalid output name: ${l}.`);
                r[l] = null;
              }
              if (typeof e == "object" && e !== null) n = e;
              else if (typeof e < "u") throw new TypeError("'options' must be an object.");
            } else {
              let l = false, c2 = Object.getOwnPropertyNames(o);
              for (let p2 of this.outputNames) if (c2.indexOf(p2) !== -1) {
                let d = o[p2];
                (d === null || d instanceof Me) && (l = true, s = false, r[p2] = d);
              }
              if (l) {
                if (typeof e == "object" && e !== null) n = e;
                else if (typeof e < "u") throw new TypeError("'options' must be an object.");
              } else n = o;
            }
          } else if (typeof o < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
          for (let l of this.inputNames) if (typeof t[l] > "u") throw new Error(`input '${l}' is missing in 'feeds'.`);
          if (s) for (let l of this.outputNames) r[l] = null;
          let i = await this.handler.run(t, r, n), u2 = {};
          for (let l in i) if (Object.hasOwnProperty.call(i, l)) {
            let c2 = i[l];
            c2 instanceof Me ? u2[l] = c2 : u2[l] = new Me(c2.type, c2.data, c2.dims);
          }
          return fr(), u2;
        }
        async release() {
          return this.handler.dispose();
        }
        static async create(t, o, e, r) {
          lr();
          let n, s = {};
          if (typeof t == "string") {
            if (n = t, typeof o == "object" && o !== null) s = o;
            else if (typeof o < "u") throw new TypeError("'options' must be an object.");
          } else if (t instanceof Uint8Array) {
            if (n = t, typeof o == "object" && o !== null) s = o;
            else if (typeof o < "u") throw new TypeError("'options' must be an object.");
          } else if (t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer) {
            let c2 = t, p2 = 0, d = t.byteLength;
            if (typeof o == "object" && o !== null) s = o;
            else if (typeof o == "number") {
              if (p2 = o, !Number.isSafeInteger(p2)) throw new RangeError("'byteOffset' must be an integer.");
              if (p2 < 0 || p2 >= c2.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${c2.byteLength}).`);
              if (d = t.byteLength - p2, typeof e == "number") {
                if (d = e, !Number.isSafeInteger(d)) throw new RangeError("'byteLength' must be an integer.");
                if (d <= 0 || p2 + d > c2.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${c2.byteLength - p2}].`);
                if (typeof r == "object" && r !== null) s = r;
                else if (typeof r < "u") throw new TypeError("'options' must be an object.");
              } else if (typeof e < "u") throw new TypeError("'byteLength' must be a number.");
            } else if (typeof o < "u") throw new TypeError("'options' must be an object.");
            n = new Uint8Array(c2, p2, d);
          } else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
          let [i, u2] = await Dn(s), l = await i.createInferenceSessionHandler(n, u2);
          return fr(), new a(l);
        }
        startProfiling() {
          this.handler.startProfiling();
        }
        endProfiling() {
          this.handler.endProfiling();
        }
        get inputNames() {
          return this.handler.inputNames;
        }
        get outputNames() {
          return this.handler.outputNames;
        }
      };
    });
    ps = L(() => {
      "use strict";
      cs();
      Pd = $n;
    });
    ds = L(() => {
      "use strict";
    });
    hs = L(() => {
      "use strict";
    });
    ms = L(() => {
      "use strict";
    });
    bs = L(() => {
      "use strict";
    });
    gs = L(() => {
      "use strict";
      Ln();
      Fn();
      Ed = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.", kn = class a {
        constructor(t, o, e) {
          this.handler = t, this.hasOptimizerModel = o, this.hasEvalModel = e;
        }
        get trainingInputNames() {
          return this.handler.inputNames;
        }
        get trainingOutputNames() {
          return this.handler.outputNames;
        }
        get evalInputNames() {
          if (this.hasEvalModel) return this.handler.evalInputNames;
          throw new Error("This training session has no evalModel loaded.");
        }
        get evalOutputNames() {
          if (this.hasEvalModel) return this.handler.evalOutputNames;
          throw new Error("This training session has no evalModel loaded.");
        }
        static async create(t, o) {
          let e = t.evalModel || "", r = t.optimizerModel || "", n = o || {}, [s, i] = await Dn(n);
          if (s.createTrainingSessionHandler) {
            let u2 = await s.createTrainingSessionHandler(t.checkpointState, t.trainModel, e, r, i);
            return new a(u2, !!t.optimizerModel, !!t.evalModel);
          } else throw new Error(Ed);
        }
        typeNarrowingForRunStep(t, o, e, r, n) {
          let s = {}, i = {};
          if (typeof e != "object" || e === null || e instanceof Me || Array.isArray(e)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
          let u2 = true;
          if (typeof r == "object") {
            if (r === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
            if (r instanceof Me) throw new TypeError("'fetches' cannot be a Tensor");
            if (Array.isArray(r)) {
              if (r.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
              u2 = false;
              for (let l of r) {
                if (typeof l != "string") throw new TypeError("'fetches' must be a string array or an object.");
                if (o.indexOf(l) === -1) throw new RangeError(`'fetches' contains invalid output name: ${l}.`);
                s[l] = null;
              }
              if (typeof n == "object" && n !== null) i = n;
              else if (typeof n < "u") throw new TypeError("'options' must be an object.");
            } else {
              let l = false, c2 = Object.getOwnPropertyNames(r);
              for (let p2 of o) if (c2.indexOf(p2) !== -1) {
                let d = r[p2];
                (d === null || d instanceof Me) && (l = true, u2 = false, s[p2] = d);
              }
              if (l) {
                if (typeof n == "object" && n !== null) i = n;
                else if (typeof n < "u") throw new TypeError("'options' must be an object.");
              } else i = r;
            }
          } else if (typeof r < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
          for (let l of t) if (typeof e[l] > "u") throw new Error(`input '${l}' is missing in 'feeds'.`);
          if (u2) for (let l of o) s[l] = null;
          return [s, i];
        }
        convertHandlerReturnTypeToMapOfTensors(t) {
          let o = {};
          for (let e in t) if (Object.hasOwnProperty.call(t, e)) {
            let r = t[e];
            r instanceof Me ? o[e] = r : o[e] = new Me(r.type, r.data, r.dims);
          }
          return o;
        }
        async lazyResetGrad() {
          await this.handler.lazyResetGrad();
        }
        async runTrainStep(t, o, e) {
          let [r, n] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, t, o, e), s = await this.handler.runTrainStep(t, r, n);
          return this.convertHandlerReturnTypeToMapOfTensors(s);
        }
        async runOptimizerStep(t) {
          if (this.hasOptimizerModel) await this.handler.runOptimizerStep(t || {});
          else throw new Error("This TrainingSession has no OptimizerModel loaded.");
        }
        async runEvalStep(t, o, e) {
          if (this.hasEvalModel) {
            let [r, n] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, t, o, e), s = await this.handler.runEvalStep(t, r, n);
            return this.convertHandlerReturnTypeToMapOfTensors(s);
          } else throw new Error("This TrainingSession has no EvalModel loaded.");
        }
        async getParametersSize(t = true) {
          return this.handler.getParametersSize(t);
        }
        async loadParametersBuffer(t, o = true) {
          let e = await this.getParametersSize(o);
          if (t.length !== 4 * e) throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
          return this.handler.loadParametersBuffer(t, o);
        }
        async getContiguousParameters(t = true) {
          return this.handler.getContiguousParameters(t);
        }
        async release() {
          return this.handler.dispose();
        }
      };
    });
    ys = L(() => {
      "use strict";
      gs();
      Dd = kn;
    });
    qo = {};
    Sr(qo, { InferenceSession: () => Pd, TRACE: () => ls, TRACE_FUNC_BEGIN: () => lr, TRACE_FUNC_END: () => fr, Tensor: () => Me, TrainingSession: () => Dd, env: () => Z, registerBackend: () => Pr });
    Ot = L(() => {
      "use strict";
      Wa();
      Ya();
      ps();
      Fn();
      ds();
      hs();
      Ho();
      ms();
      bs();
      ys();
    });
    lt = L(() => {
      "use strict";
      jo = class {
        log(t, o, e) {
        }
      }, Yo = class {
        log(t, o, e) {
          console.log(`${this.color(t)} ${e ? "\x1B[35m" + e + "\x1B[0m " : ""}${o}`);
        }
        color(t) {
          switch (t) {
            case "verbose":
              return "\x1B[34;40mv\x1B[0m";
            case "info":
              return "\x1B[32mi\x1B[0m";
            case "warning":
              return "\x1B[30;43mw\x1B[0m";
            case "error":
              return "\x1B[31;40me\x1B[0m";
            case "fatal":
              return "\x1B[101mf\x1B[0m";
            default:
              throw new Error(`unsupported severity: ${t}`);
          }
        }
      }, xs = { verbose: 1e3, info: 2e3, warning: 4e3, error: 5e3, fatal: 6e3 }, Ld = { none: new jo(), console: new Yo() }, ws = { provider: "console", minimalSeverity: "warning", logDateTime: true, logSourceLocation: false }, en = { "": ws };
      ((u2) => {
        function a(l, c2) {
          u2("verbose", l, c2);
        }
        u2.verbose = a;
        function t(l, c2) {
          u2("info", l, c2);
        }
        u2.info = t;
        function o(l, c2) {
          u2("warning", l, c2);
        }
        u2.warning = o;
        function e(l, c2) {
          u2("error", l, c2);
        }
        u2.error = e;
        function r(l, c2) {
          u2("fatal", l, c2);
        }
        u2.fatal = r;
        function n(l) {
          en = {}, s("", l || {});
        }
        u2.reset = n;
        function s(l, c2) {
          if (l === "*") n(c2);
          else {
            let p2 = en[l] || ws;
            en[l] = { provider: c2.provider || p2.provider, minimalSeverity: c2.minimalSeverity || p2.minimalSeverity, logDateTime: c2.logDateTime === void 0 ? p2.logDateTime : c2.logDateTime, logSourceLocation: c2.logSourceLocation === void 0 ? p2.logSourceLocation : c2.logSourceLocation };
          }
        }
        u2.set = s;
        function i(l) {
          let c2 = {};
          l.logLevel && (c2.minimalSeverity = l.logLevel), s("", c2);
        }
        u2.setWithEnv = i;
      })(Xt || (Xt = {}));
      ce = Xt, Rn = class {
        constructor(t, o, e, r, n, s) {
          this.category = t;
          this.name = o;
          this.startTime = e;
          this.endCallback = r;
          this.timer = n;
          this.ctx = s;
        }
        async end() {
          return this.endCallback(this);
        }
        async checkTimer() {
          if (this.ctx === void 0 || this.timer === void 0) throw new Error("No webgl timer found");
          return this.ctx.endTimer(), this.ctx.waitForQueryAndGetTime(this.timer);
        }
      }, Mn = class {
        constructor(t, o, e, r) {
          this.category = t;
          this.name = o;
          this.startTime = e;
          this.endTime = r;
        }
      }, Gn = class {
        constructor(t, o, e) {
          this._started = false;
          this._flushPointer = 0;
          this._started = false, this._maxNumberEvents = t === void 0 ? 1e4 : t, this._flushBatchSize = o === void 0 ? 10 : o, this._flushIntervalInMilliseconds = e === void 0 ? 5e3 : e;
        }
        static create(t) {
          return t === void 0 ? new this() : new this(t.maxNumberEvents, t.flushBatchSize, t.flushIntervalInMilliseconds);
        }
        start() {
          this._started = true, this._timingEvents = [], this._flushTime = Nn(), this._flushPointer = 0;
        }
        stop() {
          for (this._started = false; this._flushPointer < this._timingEvents.length; this._flushPointer++) this.logOneEvent(this._timingEvents[this._flushPointer]);
        }
        event(t, o, e, r) {
          let n = this._started ? this.begin(t, o, r) : void 0, s = false, i = e();
          if (i && typeof i.then == "function") return s = true, new Promise((u2, l) => {
            i.then(async (c2) => {
              n && await n.end(), u2(c2);
            }, async (c2) => {
              n && await n.end(), l(c2);
            });
          });
          if (!s && n) {
            let u2 = n.end();
            if (u2 && typeof u2.then == "function") return new Promise((l, c2) => {
              u2.then(() => {
                l(i);
              }, (p2) => {
                c2(p2);
              });
            });
          }
          return i;
        }
        begin(t, o, e) {
          if (!this._started) throw new Error("profiler is not started yet");
          if (e === void 0) {
            let r = Nn();
            return this.flush(r), new Rn(t, o, r, (n) => this.endSync(n));
          } else {
            let r = e.beginTimer();
            return new Rn(t, o, 0, async (n) => this.end(n), r, e);
          }
        }
        async end(t) {
          let o = await t.checkTimer();
          this._timingEvents.length < this._maxNumberEvents && (this._timingEvents.push(new Mn(t.category, t.name, t.startTime, o)), this.flush(o));
        }
        endSync(t) {
          let o = Nn();
          this._timingEvents.length < this._maxNumberEvents && (this._timingEvents.push(new Mn(t.category, t.name, t.startTime, o)), this.flush(o));
        }
        logOneEvent(t) {
          ce.verbose(`Profiler.${t.category}`, `${(t.endTime - t.startTime).toFixed(2)}ms on event '${t.name}' at ${t.endTime.toFixed(2)}`);
        }
        flush(t) {
          if (this._timingEvents.length - this._flushPointer >= this._flushBatchSize || t - this._flushTime >= this._flushIntervalInMilliseconds) {
            for (let o = this._flushPointer; this._flushPointer < o + this._flushBatchSize && this._flushPointer < this._timingEvents.length; this._flushPointer++) this.logOneEvent(this._timingEvents[this._flushPointer]);
            this._flushTime = Nn();
          }
        }
        get started() {
          return this._started;
        }
      }, Nn = typeof performance < "u" && performance.now ? () => performance.now() : Date.now;
    });
    _s = L(() => {
      "use strict";
    });
    Os = me((Xo) => {
      "use strict";
      Xo.__esModule = true;
      var $d = (function() {
        function a(t) {
          if (!t) throw new TypeError("Invalid argument; `value` has no value.");
          this.value = a.EMPTY, t && a.isGuid(t) && (this.value = t);
        }
        return a.isGuid = function(t) {
          var o = t.toString();
          return t && (t instanceof a || a.validator.test(o));
        }, a.create = function() {
          return new a([a.gen(2), a.gen(1), a.gen(1), a.gen(1), a.gen(3)].join("-"));
        }, a.createEmpty = function() {
          return new a("emptyguid");
        }, a.parse = function(t) {
          return new a(t);
        }, a.raw = function() {
          return [a.gen(2), a.gen(1), a.gen(1), a.gen(1), a.gen(3)].join("-");
        }, a.gen = function(t) {
          for (var o = "", e = 0; e < t; e++) o += ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
          return o;
        }, a.prototype.equals = function(t) {
          return a.isGuid(t) && this.value === t.toString();
        }, a.prototype.isEmpty = function() {
          return this.value === a.EMPTY;
        }, a.prototype.toString = function() {
          return this.value;
        }, a.prototype.toJSON = function() {
          return { value: this.value };
        }, a.validator = new RegExp("^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$", "i"), a.EMPTY = "00000000-0000-0000-0000-000000000000", a;
      })();
      Xo.Guid = $d;
    });
    Zo = L(() => {
      ft2 = null;
      try {
        ft2 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
      } catch {
      }
      be.prototype.__isLong__;
      Object.defineProperty(be.prototype, "__isLong__", { value: true });
      be.isLong = Xe;
      Ss = {}, As = {};
      be.fromInt = cr;
      be.fromNumber = ct;
      be.fromBits = le;
      Un = Math.pow;
      be.fromString = Jo;
      be.fromValue = St;
      Ps = 65536, kd = 1 << 24, Dr = Ps * Ps, Ls = Dr * Dr, Es = Ls / 2, Ds = cr(kd), It = cr(0);
      be.ZERO = It;
      zt = cr(0, true);
      be.UZERO = zt;
      Er = cr(1);
      be.ONE = Er;
      Cs = cr(1, true);
      be.UONE = Cs;
      Ko = cr(-1);
      be.NEG_ONE = Ko;
      Fs = le(-1, 2147483647, false);
      be.MAX_VALUE = Fs;
      $s = le(-1, -1, true);
      be.MAX_UNSIGNED_VALUE = $s;
      nt = le(0, -2147483648, false);
      be.MIN_VALUE = nt;
      B = be.prototype;
      B.toInt = function() {
        return this.unsigned ? this.low >>> 0 : this.low;
      };
      B.toNumber = function() {
        return this.unsigned ? (this.high >>> 0) * Dr + (this.low >>> 0) : this.high * Dr + (this.low >>> 0);
      };
      B.toString = function(t) {
        if (t = t || 10, t < 2 || 36 < t) throw RangeError("radix");
        if (this.isZero()) return "0";
        if (this.isNegative()) if (this.eq(nt)) {
          var o = ct(t), e = this.div(o), r = e.mul(o).sub(this);
          return e.toString(t) + r.toInt().toString(t);
        } else return "-" + this.neg().toString(t);
        for (var n = ct(Un(t, 6), this.unsigned), s = this, i = ""; ; ) {
          var u2 = s.div(n), l = s.sub(u2.mul(n)).toInt() >>> 0, c2 = l.toString(t);
          if (s = u2, s.isZero()) return c2 + i;
          for (; c2.length < 6; ) c2 = "0" + c2;
          i = "" + c2 + i;
        }
      };
      B.getHighBits = function() {
        return this.high;
      };
      B.getHighBitsUnsigned = function() {
        return this.high >>> 0;
      };
      B.getLowBits = function() {
        return this.low;
      };
      B.getLowBitsUnsigned = function() {
        return this.low >>> 0;
      };
      B.getNumBitsAbs = function() {
        if (this.isNegative()) return this.eq(nt) ? 64 : this.neg().getNumBitsAbs();
        for (var t = this.high != 0 ? this.high : this.low, o = 31; o > 0 && !(t & 1 << o); o--) ;
        return this.high != 0 ? o + 33 : o + 1;
      };
      B.isZero = function() {
        return this.high === 0 && this.low === 0;
      };
      B.eqz = B.isZero;
      B.isNegative = function() {
        return !this.unsigned && this.high < 0;
      };
      B.isPositive = function() {
        return this.unsigned || this.high >= 0;
      };
      B.isOdd = function() {
        return (this.low & 1) === 1;
      };
      B.isEven = function() {
        return (this.low & 1) === 0;
      };
      B.equals = function(t) {
        return Xe(t) || (t = St(t)), this.unsigned !== t.unsigned && this.high >>> 31 === 1 && t.high >>> 31 === 1 ? false : this.high === t.high && this.low === t.low;
      };
      B.eq = B.equals;
      B.notEquals = function(t) {
        return !this.eq(t);
      };
      B.neq = B.notEquals;
      B.ne = B.notEquals;
      B.lessThan = function(t) {
        return this.comp(t) < 0;
      };
      B.lt = B.lessThan;
      B.lessThanOrEqual = function(t) {
        return this.comp(t) <= 0;
      };
      B.lte = B.lessThanOrEqual;
      B.le = B.lessThanOrEqual;
      B.greaterThan = function(t) {
        return this.comp(t) > 0;
      };
      B.gt = B.greaterThan;
      B.greaterThanOrEqual = function(t) {
        return this.comp(t) >= 0;
      };
      B.gte = B.greaterThanOrEqual;
      B.ge = B.greaterThanOrEqual;
      B.compare = function(t) {
        if (Xe(t) || (t = St(t)), this.eq(t)) return 0;
        var o = this.isNegative(), e = t.isNegative();
        return o && !e ? -1 : !o && e ? 1 : this.unsigned ? t.high >>> 0 > this.high >>> 0 || t.high === this.high && t.low >>> 0 > this.low >>> 0 ? -1 : 1 : this.sub(t).isNegative() ? -1 : 1;
      };
      B.comp = B.compare;
      B.negate = function() {
        return !this.unsigned && this.eq(nt) ? nt : this.not().add(Er);
      };
      B.neg = B.negate;
      B.add = function(t) {
        Xe(t) || (t = St(t));
        var o = this.high >>> 16, e = this.high & 65535, r = this.low >>> 16, n = this.low & 65535, s = t.high >>> 16, i = t.high & 65535, u2 = t.low >>> 16, l = t.low & 65535, c2 = 0, p2 = 0, d = 0, T = 0;
        return T += n + l, d += T >>> 16, T &= 65535, d += r + u2, p2 += d >>> 16, d &= 65535, p2 += e + i, c2 += p2 >>> 16, p2 &= 65535, c2 += o + s, c2 &= 65535, le(d << 16 | T, c2 << 16 | p2, this.unsigned);
      };
      B.subtract = function(t) {
        return Xe(t) || (t = St(t)), this.add(t.neg());
      };
      B.sub = B.subtract;
      B.multiply = function(t) {
        if (this.isZero()) return this;
        if (Xe(t) || (t = St(t)), ft2) {
          var o = ft2.mul(this.low, this.high, t.low, t.high);
          return le(o, ft2.get_high(), this.unsigned);
        }
        if (t.isZero()) return this.unsigned ? zt : It;
        if (this.eq(nt)) return t.isOdd() ? nt : It;
        if (t.eq(nt)) return this.isOdd() ? nt : It;
        if (this.isNegative()) return t.isNegative() ? this.neg().mul(t.neg()) : this.neg().mul(t).neg();
        if (t.isNegative()) return this.mul(t.neg()).neg();
        if (this.lt(Ds) && t.lt(Ds)) return ct(this.toNumber() * t.toNumber(), this.unsigned);
        var e = this.high >>> 16, r = this.high & 65535, n = this.low >>> 16, s = this.low & 65535, i = t.high >>> 16, u2 = t.high & 65535, l = t.low >>> 16, c2 = t.low & 65535, p2 = 0, d = 0, T = 0, w = 0;
        return w += s * c2, T += w >>> 16, w &= 65535, T += n * c2, d += T >>> 16, T &= 65535, T += s * l, d += T >>> 16, T &= 65535, d += r * c2, p2 += d >>> 16, d &= 65535, d += n * l, p2 += d >>> 16, d &= 65535, d += s * u2, p2 += d >>> 16, d &= 65535, p2 += e * c2 + r * l + n * u2 + s * i, p2 &= 65535, le(T << 16 | w, p2 << 16 | d, this.unsigned);
      };
      B.mul = B.multiply;
      B.divide = function(t) {
        if (Xe(t) || (t = St(t)), t.isZero()) throw Error("division by zero");
        if (ft2) {
          if (!this.unsigned && this.high === -2147483648 && t.low === -1 && t.high === -1) return this;
          var o = (this.unsigned ? ft2.div_u : ft2.div_s)(this.low, this.high, t.low, t.high);
          return le(o, ft2.get_high(), this.unsigned);
        }
        if (this.isZero()) return this.unsigned ? zt : It;
        var e, r, n;
        if (this.unsigned) {
          if (t.unsigned || (t = t.toUnsigned()), t.gt(this)) return zt;
          if (t.gt(this.shru(1))) return Cs;
          n = zt;
        } else {
          if (this.eq(nt)) {
            if (t.eq(Er) || t.eq(Ko)) return nt;
            if (t.eq(nt)) return Er;
            var s = this.shr(1);
            return e = s.div(t).shl(1), e.eq(It) ? t.isNegative() ? Er : Ko : (r = this.sub(t.mul(e)), n = e.add(r.div(t)), n);
          } else if (t.eq(nt)) return this.unsigned ? zt : It;
          if (this.isNegative()) return t.isNegative() ? this.neg().div(t.neg()) : this.neg().div(t).neg();
          if (t.isNegative()) return this.div(t.neg()).neg();
          n = It;
        }
        for (r = this; r.gte(t); ) {
          e = Math.max(1, Math.floor(r.toNumber() / t.toNumber()));
          for (var i = Math.ceil(Math.log(e) / Math.LN2), u2 = i <= 48 ? 1 : Un(2, i - 48), l = ct(e), c2 = l.mul(t); c2.isNegative() || c2.gt(r); ) e -= u2, l = ct(e, this.unsigned), c2 = l.mul(t);
          l.isZero() && (l = Er), n = n.add(l), r = r.sub(c2);
        }
        return n;
      };
      B.div = B.divide;
      B.modulo = function(t) {
        if (Xe(t) || (t = St(t)), ft2) {
          var o = (this.unsigned ? ft2.rem_u : ft2.rem_s)(this.low, this.high, t.low, t.high);
          return le(o, ft2.get_high(), this.unsigned);
        }
        return this.sub(this.div(t).mul(t));
      };
      B.mod = B.modulo;
      B.rem = B.modulo;
      B.not = function() {
        return le(~this.low, ~this.high, this.unsigned);
      };
      B.countLeadingZeros = function() {
        return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
      };
      B.clz = B.countLeadingZeros;
      B.countTrailingZeros = function() {
        return this.low ? Is(this.low) : Is(this.high) + 32;
      };
      B.ctz = B.countTrailingZeros;
      B.and = function(t) {
        return Xe(t) || (t = St(t)), le(this.low & t.low, this.high & t.high, this.unsigned);
      };
      B.or = function(t) {
        return Xe(t) || (t = St(t)), le(this.low | t.low, this.high | t.high, this.unsigned);
      };
      B.xor = function(t) {
        return Xe(t) || (t = St(t)), le(this.low ^ t.low, this.high ^ t.high, this.unsigned);
      };
      B.shiftLeft = function(t) {
        return Xe(t) && (t = t.toInt()), (t &= 63) === 0 ? this : t < 32 ? le(this.low << t, this.high << t | this.low >>> 32 - t, this.unsigned) : le(0, this.low << t - 32, this.unsigned);
      };
      B.shl = B.shiftLeft;
      B.shiftRight = function(t) {
        return Xe(t) && (t = t.toInt()), (t &= 63) === 0 ? this : t < 32 ? le(this.low >>> t | this.high << 32 - t, this.high >> t, this.unsigned) : le(this.high >> t - 32, this.high >= 0 ? 0 : -1, this.unsigned);
      };
      B.shr = B.shiftRight;
      B.shiftRightUnsigned = function(t) {
        return Xe(t) && (t = t.toInt()), (t &= 63) === 0 ? this : t < 32 ? le(this.low >>> t | this.high << 32 - t, this.high >>> t, this.unsigned) : t === 32 ? le(this.high, 0, this.unsigned) : le(this.high >>> t - 32, 0, this.unsigned);
      };
      B.shru = B.shiftRightUnsigned;
      B.shr_u = B.shiftRightUnsigned;
      B.rotateLeft = function(t) {
        var o;
        return Xe(t) && (t = t.toInt()), (t &= 63) === 0 ? this : t === 32 ? le(this.high, this.low, this.unsigned) : t < 32 ? (o = 32 - t, le(this.low << t | this.high >>> o, this.high << t | this.low >>> o, this.unsigned)) : (t -= 32, o = 32 - t, le(this.high << t | this.low >>> o, this.low << t | this.high >>> o, this.unsigned));
      };
      B.rotl = B.rotateLeft;
      B.rotateRight = function(t) {
        var o;
        return Xe(t) && (t = t.toInt()), (t &= 63) === 0 ? this : t === 32 ? le(this.high, this.low, this.unsigned) : t < 32 ? (o = 32 - t, le(this.high << o | this.low >>> t, this.low << o | this.high >>> t, this.unsigned)) : (t -= 32, o = 32 - t, le(this.low << o | this.high >>> t, this.high << o | this.low >>> t, this.unsigned));
      };
      B.rotr = B.rotateRight;
      B.toSigned = function() {
        return this.unsigned ? le(this.low, this.high, false) : this;
      };
      B.toUnsigned = function() {
        return this.unsigned ? this : le(this.low, this.high, true);
      };
      B.toBytes = function(t) {
        return t ? this.toBytesLE() : this.toBytesBE();
      };
      B.toBytesLE = function() {
        var t = this.high, o = this.low;
        return [o & 255, o >>> 8 & 255, o >>> 16 & 255, o >>> 24, t & 255, t >>> 8 & 255, t >>> 16 & 255, t >>> 24];
      };
      B.toBytesBE = function() {
        var t = this.high, o = this.low;
        return [t >>> 24, t >>> 16 & 255, t >>> 8 & 255, t & 255, o >>> 24, o >>> 16 & 255, o >>> 8 & 255, o & 255];
      };
      be.fromBytes = function(t, o, e) {
        return e ? be.fromBytesLE(t, o) : be.fromBytesBE(t, o);
      };
      be.fromBytesLE = function(t, o) {
        return new be(t[0] | t[1] << 8 | t[2] << 16 | t[3] << 24, t[4] | t[5] << 8 | t[6] << 16 | t[7] << 24, o);
      };
      be.fromBytesBE = function(t, o) {
        return new be(t[4] << 24 | t[5] << 16 | t[6] << 8 | t[7], t[0] << 24 | t[1] << 16 | t[2] << 8 | t[3], o);
      };
      Vt = be;
    });
    zn = L(() => {
      _ = {};
      _.Offset;
      _.Table;
      _.SIZEOF_SHORT = 2;
      _.SIZEOF_INT = 4;
      _.FILE_IDENTIFIER_LENGTH = 4;
      _.SIZE_PREFIX_LENGTH = 4;
      _.Encoding = { UTF8_BYTES: 1, UTF16_STRING: 2 };
      _.int32 = new Int32Array(2);
      _.float32 = new Float32Array(_.int32.buffer);
      _.float64 = new Float64Array(_.int32.buffer);
      _.isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
      _.Long = function(a, t) {
        this.low = a | 0, this.high = t | 0;
      };
      _.Long.create = function(a, t) {
        return a == 0 && t == 0 ? _.Long.ZERO : new _.Long(a, t);
      };
      _.Long.prototype.toFloat64 = function() {
        return (this.low >>> 0) + this.high * 4294967296;
      };
      _.Long.prototype.equals = function(a) {
        return this.low == a.low && this.high == a.high;
      };
      _.Long.ZERO = new _.Long(0, 0);
      _.Builder = function(a) {
        if (a) var t = a;
        else var t = 1024;
        this.bb = _.ByteBuffer.allocate(t), this.space = t, this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = false, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = false;
      };
      _.Builder.prototype.clear = function() {
        this.bb.clear(), this.space = this.bb.capacity(), this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = false, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = false;
      };
      _.Builder.prototype.forceDefaults = function(a) {
        this.force_defaults = a;
      };
      _.Builder.prototype.dataBuffer = function() {
        return this.bb;
      };
      _.Builder.prototype.asUint8Array = function() {
        return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
      };
      _.Builder.prototype.prep = function(a, t) {
        a > this.minalign && (this.minalign = a);
        for (var o = ~(this.bb.capacity() - this.space + t) + 1 & a - 1; this.space < o + a + t; ) {
          var e = this.bb.capacity();
          this.bb = _.Builder.growByteBuffer(this.bb), this.space += this.bb.capacity() - e;
        }
        this.pad(o);
      };
      _.Builder.prototype.pad = function(a) {
        for (var t = 0; t < a; t++) this.bb.writeInt8(--this.space, 0);
      };
      _.Builder.prototype.writeInt8 = function(a) {
        this.bb.writeInt8(this.space -= 1, a);
      };
      _.Builder.prototype.writeInt16 = function(a) {
        this.bb.writeInt16(this.space -= 2, a);
      };
      _.Builder.prototype.writeInt32 = function(a) {
        this.bb.writeInt32(this.space -= 4, a);
      };
      _.Builder.prototype.writeInt64 = function(a) {
        this.bb.writeInt64(this.space -= 8, a);
      };
      _.Builder.prototype.writeFloat32 = function(a) {
        this.bb.writeFloat32(this.space -= 4, a);
      };
      _.Builder.prototype.writeFloat64 = function(a) {
        this.bb.writeFloat64(this.space -= 8, a);
      };
      _.Builder.prototype.addInt8 = function(a) {
        this.prep(1, 0), this.writeInt8(a);
      };
      _.Builder.prototype.addInt16 = function(a) {
        this.prep(2, 0), this.writeInt16(a);
      };
      _.Builder.prototype.addInt32 = function(a) {
        this.prep(4, 0), this.writeInt32(a);
      };
      _.Builder.prototype.addInt64 = function(a) {
        this.prep(8, 0), this.writeInt64(a);
      };
      _.Builder.prototype.addFloat32 = function(a) {
        this.prep(4, 0), this.writeFloat32(a);
      };
      _.Builder.prototype.addFloat64 = function(a) {
        this.prep(8, 0), this.writeFloat64(a);
      };
      _.Builder.prototype.addFieldInt8 = function(a, t, o) {
        (this.force_defaults || t != o) && (this.addInt8(t), this.slot(a));
      };
      _.Builder.prototype.addFieldInt16 = function(a, t, o) {
        (this.force_defaults || t != o) && (this.addInt16(t), this.slot(a));
      };
      _.Builder.prototype.addFieldInt32 = function(a, t, o) {
        (this.force_defaults || t != o) && (this.addInt32(t), this.slot(a));
      };
      _.Builder.prototype.addFieldInt64 = function(a, t, o) {
        (this.force_defaults || !t.equals(o)) && (this.addInt64(t), this.slot(a));
      };
      _.Builder.prototype.addFieldFloat32 = function(a, t, o) {
        (this.force_defaults || t != o) && (this.addFloat32(t), this.slot(a));
      };
      _.Builder.prototype.addFieldFloat64 = function(a, t, o) {
        (this.force_defaults || t != o) && (this.addFloat64(t), this.slot(a));
      };
      _.Builder.prototype.addFieldOffset = function(a, t, o) {
        (this.force_defaults || t != o) && (this.addOffset(t), this.slot(a));
      };
      _.Builder.prototype.addFieldStruct = function(a, t, o) {
        t != o && (this.nested(t), this.slot(a));
      };
      _.Builder.prototype.nested = function(a) {
        if (a != this.offset()) throw new Error("FlatBuffers: struct must be serialized inline.");
      };
      _.Builder.prototype.notNested = function() {
        if (this.isNested) throw new Error("FlatBuffers: object serialization must not be nested.");
      };
      _.Builder.prototype.slot = function(a) {
        this.vtable[a] = this.offset();
      };
      _.Builder.prototype.offset = function() {
        return this.bb.capacity() - this.space;
      };
      _.Builder.growByteBuffer = function(a) {
        var t = a.capacity();
        if (t & 3221225472) throw new Error("FlatBuffers: cannot grow buffer beyond 2 gigabytes.");
        var o = t << 1, e = _.ByteBuffer.allocate(o);
        return e.setPosition(o - t), e.bytes().set(a.bytes(), o - t), e;
      };
      _.Builder.prototype.addOffset = function(a) {
        this.prep(_.SIZEOF_INT, 0), this.writeInt32(this.offset() - a + _.SIZEOF_INT);
      };
      _.Builder.prototype.startObject = function(a) {
        this.notNested(), this.vtable == null && (this.vtable = []), this.vtable_in_use = a;
        for (var t = 0; t < a; t++) this.vtable[t] = 0;
        this.isNested = true, this.object_start = this.offset();
      };
      _.Builder.prototype.endObject = function() {
        if (this.vtable == null || !this.isNested) throw new Error("FlatBuffers: endObject called without startObject");
        this.addInt32(0);
        for (var a = this.offset(), t = this.vtable_in_use - 1; t >= 0 && this.vtable[t] == 0; t--) ;
        for (var o = t + 1; t >= 0; t--) this.addInt16(this.vtable[t] != 0 ? a - this.vtable[t] : 0);
        var e = 2;
        this.addInt16(a - this.object_start);
        var r = (o + e) * _.SIZEOF_SHORT;
        this.addInt16(r);
        var n = 0, s = this.space;
        e: for (t = 0; t < this.vtables.length; t++) {
          var i = this.bb.capacity() - this.vtables[t];
          if (r == this.bb.readInt16(i)) {
            for (var u2 = _.SIZEOF_SHORT; u2 < r; u2 += _.SIZEOF_SHORT) if (this.bb.readInt16(s + u2) != this.bb.readInt16(i + u2)) continue e;
            n = this.vtables[t];
            break;
          }
        }
        return n ? (this.space = this.bb.capacity() - a, this.bb.writeInt32(this.space, n - a)) : (this.vtables.push(this.offset()), this.bb.writeInt32(this.bb.capacity() - a, this.offset() - a)), this.isNested = false, a;
      };
      _.Builder.prototype.finish = function(a, t, o) {
        var e = o ? _.SIZE_PREFIX_LENGTH : 0;
        if (t) {
          var r = t;
          if (this.prep(this.minalign, _.SIZEOF_INT + _.FILE_IDENTIFIER_LENGTH + e), r.length != _.FILE_IDENTIFIER_LENGTH) throw new Error("FlatBuffers: file identifier must be length " + _.FILE_IDENTIFIER_LENGTH);
          for (var n = _.FILE_IDENTIFIER_LENGTH - 1; n >= 0; n--) this.writeInt8(r.charCodeAt(n));
        }
        this.prep(this.minalign, _.SIZEOF_INT + e), this.addOffset(a), e && this.addInt32(this.bb.capacity() - this.space), this.bb.setPosition(this.space);
      };
      _.Builder.prototype.finishSizePrefixed = function(a, t) {
        this.finish(a, t, true);
      };
      _.Builder.prototype.requiredField = function(a, t) {
        var o = this.bb.capacity() - a, e = o - this.bb.readInt32(o), r = this.bb.readInt16(e + t) != 0;
        if (!r) throw new Error("FlatBuffers: field " + t + " must be set");
      };
      _.Builder.prototype.startVector = function(a, t, o) {
        this.notNested(), this.vector_num_elems = t, this.prep(_.SIZEOF_INT, a * t), this.prep(o, a * t);
      };
      _.Builder.prototype.endVector = function() {
        return this.writeInt32(this.vector_num_elems), this.offset();
      };
      _.Builder.prototype.createString = function(a) {
        if (a instanceof Uint8Array) var t = a;
        else for (var t = [], o = 0; o < a.length; ) {
          var e, r = a.charCodeAt(o++);
          if (r < 55296 || r >= 56320) e = r;
          else {
            var n = a.charCodeAt(o++);
            e = (r << 10) + n + (65536 - 56623104 - 56320);
          }
          e < 128 ? t.push(e) : (e < 2048 ? t.push(e >> 6 & 31 | 192) : (e < 65536 ? t.push(e >> 12 & 15 | 224) : t.push(e >> 18 & 7 | 240, e >> 12 & 63 | 128), t.push(e >> 6 & 63 | 128)), t.push(e & 63 | 128));
        }
        this.addInt8(0), this.startVector(1, t.length, 1), this.bb.setPosition(this.space -= t.length);
        for (var o = 0, s = this.space, i = this.bb.bytes(); o < t.length; o++) i[s++] = t[o];
        return this.endVector();
      };
      _.Builder.prototype.createLong = function(a, t) {
        return _.Long.create(a, t);
      };
      _.ByteBuffer = function(a) {
        this.bytes_ = a, this.position_ = 0;
      };
      _.ByteBuffer.allocate = function(a) {
        return new _.ByteBuffer(new Uint8Array(a));
      };
      _.ByteBuffer.prototype.clear = function() {
        this.position_ = 0;
      };
      _.ByteBuffer.prototype.bytes = function() {
        return this.bytes_;
      };
      _.ByteBuffer.prototype.position = function() {
        return this.position_;
      };
      _.ByteBuffer.prototype.setPosition = function(a) {
        this.position_ = a;
      };
      _.ByteBuffer.prototype.capacity = function() {
        return this.bytes_.length;
      };
      _.ByteBuffer.prototype.readInt8 = function(a) {
        return this.readUint8(a) << 24 >> 24;
      };
      _.ByteBuffer.prototype.readUint8 = function(a) {
        return this.bytes_[a];
      };
      _.ByteBuffer.prototype.readInt16 = function(a) {
        return this.readUint16(a) << 16 >> 16;
      };
      _.ByteBuffer.prototype.readUint16 = function(a) {
        return this.bytes_[a] | this.bytes_[a + 1] << 8;
      };
      _.ByteBuffer.prototype.readInt32 = function(a) {
        return this.bytes_[a] | this.bytes_[a + 1] << 8 | this.bytes_[a + 2] << 16 | this.bytes_[a + 3] << 24;
      };
      _.ByteBuffer.prototype.readUint32 = function(a) {
        return this.readInt32(a) >>> 0;
      };
      _.ByteBuffer.prototype.readInt64 = function(a) {
        return new _.Long(this.readInt32(a), this.readInt32(a + 4));
      };
      _.ByteBuffer.prototype.readUint64 = function(a) {
        return new _.Long(this.readUint32(a), this.readUint32(a + 4));
      };
      _.ByteBuffer.prototype.readFloat32 = function(a) {
        return _.int32[0] = this.readInt32(a), _.float32[0];
      };
      _.ByteBuffer.prototype.readFloat64 = function(a) {
        return _.int32[_.isLittleEndian ? 0 : 1] = this.readInt32(a), _.int32[_.isLittleEndian ? 1 : 0] = this.readInt32(a + 4), _.float64[0];
      };
      _.ByteBuffer.prototype.writeInt8 = function(a, t) {
        this.bytes_[a] = t;
      };
      _.ByteBuffer.prototype.writeUint8 = function(a, t) {
        this.bytes_[a] = t;
      };
      _.ByteBuffer.prototype.writeInt16 = function(a, t) {
        this.bytes_[a] = t, this.bytes_[a + 1] = t >> 8;
      };
      _.ByteBuffer.prototype.writeUint16 = function(a, t) {
        this.bytes_[a] = t, this.bytes_[a + 1] = t >> 8;
      };
      _.ByteBuffer.prototype.writeInt32 = function(a, t) {
        this.bytes_[a] = t, this.bytes_[a + 1] = t >> 8, this.bytes_[a + 2] = t >> 16, this.bytes_[a + 3] = t >> 24;
      };
      _.ByteBuffer.prototype.writeUint32 = function(a, t) {
        this.bytes_[a] = t, this.bytes_[a + 1] = t >> 8, this.bytes_[a + 2] = t >> 16, this.bytes_[a + 3] = t >> 24;
      };
      _.ByteBuffer.prototype.writeInt64 = function(a, t) {
        this.writeInt32(a, t.low), this.writeInt32(a + 4, t.high);
      };
      _.ByteBuffer.prototype.writeUint64 = function(a, t) {
        this.writeUint32(a, t.low), this.writeUint32(a + 4, t.high);
      };
      _.ByteBuffer.prototype.writeFloat32 = function(a, t) {
        _.float32[0] = t, this.writeInt32(a, _.int32[0]);
      };
      _.ByteBuffer.prototype.writeFloat64 = function(a, t) {
        _.float64[0] = t, this.writeInt32(a, _.int32[_.isLittleEndian ? 0 : 1]), this.writeInt32(a + 4, _.int32[_.isLittleEndian ? 1 : 0]);
      };
      _.ByteBuffer.prototype.getBufferIdentifier = function() {
        if (this.bytes_.length < this.position_ + _.SIZEOF_INT + _.FILE_IDENTIFIER_LENGTH) throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");
        for (var a = "", t = 0; t < _.FILE_IDENTIFIER_LENGTH; t++) a += String.fromCharCode(this.readInt8(this.position_ + _.SIZEOF_INT + t));
        return a;
      };
      _.ByteBuffer.prototype.__offset = function(a, t) {
        var o = a - this.readInt32(a);
        return t < this.readInt16(o) ? this.readInt16(o + t) : 0;
      };
      _.ByteBuffer.prototype.__union = function(a, t) {
        return a.bb_pos = t + this.readInt32(t), a.bb = this, a;
      };
      _.ByteBuffer.prototype.__string = function(a, t) {
        a += this.readInt32(a);
        var o = this.readInt32(a), e = "", r = 0;
        if (a += _.SIZEOF_INT, t === _.Encoding.UTF8_BYTES) return this.bytes_.subarray(a, a + o);
        for (; r < o; ) {
          var n, s = this.readUint8(a + r++);
          if (s < 192) n = s;
          else {
            var i = this.readUint8(a + r++);
            if (s < 224) n = (s & 31) << 6 | i & 63;
            else {
              var u2 = this.readUint8(a + r++);
              if (s < 240) n = (s & 15) << 12 | (i & 63) << 6 | u2 & 63;
              else {
                var l = this.readUint8(a + r++);
                n = (s & 7) << 18 | (i & 63) << 12 | (u2 & 63) << 6 | l & 63;
              }
            }
          }
          n < 65536 ? e += String.fromCharCode(n) : (n -= 65536, e += String.fromCharCode((n >> 10) + 55296, (n & 1024 - 1) + 56320));
        }
        return e;
      };
      _.ByteBuffer.prototype.__indirect = function(a) {
        return a + this.readInt32(a);
      };
      _.ByteBuffer.prototype.__vector = function(a) {
        return a + this.readInt32(a) + _.SIZEOF_INT;
      };
      _.ByteBuffer.prototype.__vector_len = function(a) {
        return this.readInt32(a + this.readInt32(a));
      };
      _.ByteBuffer.prototype.__has_identifier = function(a) {
        if (a.length != _.FILE_IDENTIFIER_LENGTH) throw new Error("FlatBuffers: file identifier must be length " + _.FILE_IDENTIFIER_LENGTH);
        for (var t = 0; t < _.FILE_IDENTIFIER_LENGTH; t++) if (a.charCodeAt(t) != this.readInt8(this.position_ + _.SIZEOF_INT + t)) return false;
        return true;
      };
      _.ByteBuffer.prototype.createLong = function(a, t) {
        return _.Long.create(a, t);
      };
    });
    tn = L(() => {
      "use strict";
      zn();
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            let r;
            ((F2) => (F2[F2.UNDEFINED = 0] = "UNDEFINED", F2[F2.FLOAT = 1] = "FLOAT", F2[F2.INT = 2] = "INT", F2[F2.STRING = 3] = "STRING", F2[F2.TENSOR = 4] = "TENSOR", F2[F2.GRAPH = 5] = "GRAPH", F2[F2.FLOATS = 6] = "FLOATS", F2[F2.INTS = 7] = "INTS", F2[F2.STRINGS = 8] = "STRINGS", F2[F2.TENSORS = 9] = "TENSORS", F2[F2.GRAPHS = 10] = "GRAPHS", F2[F2.SPARSE_TENSOR = 11] = "SPARSE_TENSOR", F2[F2.SPARSE_TENSORS = 12] = "SPARSE_TENSORS"))(r = n.AttributeType || (n.AttributeType = {}));
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            let r;
            ((l) => (l[l.UNKNOWN = 0] = "UNKNOWN", l[l.VALUE = 1] = "VALUE", l[l.PARAM = 2] = "PARAM"))(r = n.DimensionValueType || (n.DimensionValueType = {}));
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            let r;
            ((Y) => (Y[Y.UNDEFINED = 0] = "UNDEFINED", Y[Y.FLOAT = 1] = "FLOAT", Y[Y.UINT8 = 2] = "UINT8", Y[Y.INT8 = 3] = "INT8", Y[Y.UINT16 = 4] = "UINT16", Y[Y.INT16 = 5] = "INT16", Y[Y.INT32 = 6] = "INT32", Y[Y.INT64 = 7] = "INT64", Y[Y.STRING = 8] = "STRING", Y[Y.BOOL = 9] = "BOOL", Y[Y.FLOAT16 = 10] = "FLOAT16", Y[Y.DOUBLE = 11] = "DOUBLE", Y[Y.UINT32 = 12] = "UINT32", Y[Y.UINT64 = 13] = "UINT64", Y[Y.COMPLEX64 = 14] = "COMPLEX64", Y[Y.COMPLEX128 = 15] = "COMPLEX128", Y[Y.BFLOAT16 = 16] = "BFLOAT16", Y[Y.FLOAT8E4M3FN = 17] = "FLOAT8E4M3FN", Y[Y.FLOAT8E4M3FNUZ = 18] = "FLOAT8E4M3FNUZ", Y[Y.FLOAT8E5M2 = 19] = "FLOAT8E5M2", Y[Y.FLOAT8E5M2FNUZ = 20] = "FLOAT8E5M2FNUZ"))(r = n.TensorDataType || (n.TensorDataType = {}));
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            let r;
            ((u2) => (u2[u2.Primitive = 0] = "Primitive", u2[u2.Fused = 1] = "Fused"))(r = n.NodeType || (n.NodeType = {}));
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            let r;
            ((c2) => (c2[c2.NONE = 0] = "NONE", c2[c2.tensor_type = 1] = "tensor_type", c2[c2.sequence_type = 2] = "sequence_type", c2[c2.map_type = 3] = "map_type"))(r = n.TypeInfoValue || (n.TypeInfoValue = {}));
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsShape(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsShape(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              dim(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 4);
                return l ? (u2 || new t.experimental.fbs.Dimension()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              dimLength() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startShape(i) {
                i.startObject(1);
              }
              static addDim(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static createDimVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startDimVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static endShape(i) {
                return i.endObject();
              }
              static createShape(i, u2) {
                return r.startShape(i), r.addDim(i, u2), r.endShape(i);
              }
            }
            n.Shape = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsDimension(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsDimension(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              value(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? (i || new t.experimental.fbs.DimensionValue()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              denotation(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              static startDimension(i) {
                i.startObject(2);
              }
              static addValue(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addDenotation(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static endDimension(i) {
                return i.endObject();
              }
              static createDimension(i, u2, l) {
                return r.startDimension(i), r.addValue(i, u2), r.addDenotation(i, l), r.endDimension(i);
              }
            }
            n.Dimension = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsDimensionValue(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsDimensionValue(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              dimType() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.readInt8(this.bb_pos + i) : 0;
              }
              dimValue() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.readInt64(this.bb_pos + i) : this.bb.createLong(0, 0);
              }
              dimParam(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              static startDimensionValue(i) {
                i.startObject(3);
              }
              static addDimType(i, u2) {
                i.addFieldInt8(0, u2, 0);
              }
              static addDimValue(i, u2) {
                i.addFieldInt64(1, u2, i.createLong(0, 0));
              }
              static addDimParam(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static endDimensionValue(i) {
                return i.endObject();
              }
              static createDimensionValue(i, u2, l, c2) {
                return r.startDimensionValue(i), r.addDimType(i, u2), r.addDimValue(i, l), r.addDimParam(i, c2), r.endDimensionValue(i);
              }
            }
            n.DimensionValue = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsTensorTypeAndShape(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsTensorTypeAndShape(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              elemType() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.readInt32(this.bb_pos + i) : 0;
              }
              shape(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? (i || new t.experimental.fbs.Shape()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              static startTensorTypeAndShape(i) {
                i.startObject(2);
              }
              static addElemType(i, u2) {
                i.addFieldInt32(0, u2, 0);
              }
              static addShape(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static endTensorTypeAndShape(i) {
                return i.endObject();
              }
              static createTensorTypeAndShape(i, u2, l) {
                return r.startTensorTypeAndShape(i), r.addElemType(i, u2), r.addShape(i, l), r.endTensorTypeAndShape(i);
              }
            }
            n.TensorTypeAndShape = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsMapType(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsMapType(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              keyType() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.readInt32(this.bb_pos + i) : 0;
              }
              valueType(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? (i || new t.experimental.fbs.TypeInfo()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              static startMapType(i) {
                i.startObject(2);
              }
              static addKeyType(i, u2) {
                i.addFieldInt32(0, u2, 0);
              }
              static addValueType(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static endMapType(i) {
                return i.endObject();
              }
              static createMapType(i, u2, l) {
                return r.startMapType(i), r.addKeyType(i, u2), r.addValueType(i, l), r.endMapType(i);
              }
            }
            n.MapType = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsSequenceType(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsSequenceType(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              elemType(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? (i || new t.experimental.fbs.TypeInfo()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              static startSequenceType(i) {
                i.startObject(1);
              }
              static addElemType(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static endSequenceType(i) {
                return i.endObject();
              }
              static createSequenceType(i, u2) {
                return r.startSequenceType(i), r.addElemType(i, u2), r.endSequenceType(i);
              }
            }
            n.SequenceType = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              nodeIndex() {
                return this.bb.readUint32(this.bb_pos);
              }
              srcArgIndex() {
                return this.bb.readInt32(this.bb_pos + 4);
              }
              dstArgIndex() {
                return this.bb.readInt32(this.bb_pos + 8);
              }
              static createEdgeEnd(i, u2, l, c2) {
                return i.prep(4, 12), i.writeInt32(c2), i.writeInt32(l), i.writeInt32(u2), i.offset();
              }
            }
            n.EdgeEnd = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsNodeEdge(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsNodeEdge(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              nodeIndex() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.readUint32(this.bb_pos + i) : 0;
              }
              inputEdges(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 6);
                return l ? (u2 || new t.experimental.fbs.EdgeEnd()).__init(this.bb.__vector(this.bb_pos + l) + i * 12, this.bb) : null;
              }
              inputEdgesLength() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              outputEdges(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 8);
                return l ? (u2 || new t.experimental.fbs.EdgeEnd()).__init(this.bb.__vector(this.bb_pos + l) + i * 12, this.bb) : null;
              }
              outputEdgesLength() {
                let i = this.bb.__offset(this.bb_pos, 8);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startNodeEdge(i) {
                i.startObject(3);
              }
              static addNodeIndex(i, u2) {
                i.addFieldInt32(0, u2, 0);
              }
              static addInputEdges(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static startInputEdgesVector(i, u2) {
                i.startVector(12, u2, 4);
              }
              static addOutputEdges(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static startOutputEdgesVector(i, u2) {
                i.startVector(12, u2, 4);
              }
              static endNodeEdge(i) {
                return i.endObject();
              }
              static createNodeEdge(i, u2, l, c2) {
                return r.startNodeEdge(i), r.addNodeIndex(i, u2), r.addInputEdges(i, l), r.addOutputEdges(i, c2), r.endNodeEdge(i);
              }
            }
            n.NodeEdge = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsNode(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsNode(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              name(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              docString(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              domain(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              sinceVersion() {
                let i = this.bb.__offset(this.bb_pos, 10);
                return i ? this.bb.readInt32(this.bb_pos + i) : 0;
              }
              index() {
                let i = this.bb.__offset(this.bb_pos, 12);
                return i ? this.bb.readUint32(this.bb_pos + i) : 0;
              }
              opType(i) {
                let u2 = this.bb.__offset(this.bb_pos, 14);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              type() {
                let i = this.bb.__offset(this.bb_pos, 16);
                return i ? this.bb.readInt32(this.bb_pos + i) : 0;
              }
              executionProviderType(i) {
                let u2 = this.bb.__offset(this.bb_pos, 18);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              inputs(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 20);
                return l ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + i * 4, u2) : null;
              }
              inputsLength() {
                let i = this.bb.__offset(this.bb_pos, 20);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              outputs(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 22);
                return l ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + i * 4, u2) : null;
              }
              outputsLength() {
                let i = this.bb.__offset(this.bb_pos, 22);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              attributes(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 24);
                return l ? (u2 || new t.experimental.fbs.Attribute()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              attributesLength() {
                let i = this.bb.__offset(this.bb_pos, 24);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              inputArgCounts(i) {
                let u2 = this.bb.__offset(this.bb_pos, 26);
                return u2 ? this.bb.readInt32(this.bb.__vector(this.bb_pos + u2) + i * 4) : 0;
              }
              inputArgCountsLength() {
                let i = this.bb.__offset(this.bb_pos, 26);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              inputArgCountsArray() {
                let i = this.bb.__offset(this.bb_pos, 26);
                return i ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + i), this.bb.__vector_len(this.bb_pos + i)) : null;
              }
              implicitInputs(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 28);
                return l ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + i * 4, u2) : null;
              }
              implicitInputsLength() {
                let i = this.bb.__offset(this.bb_pos, 28);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startNode(i) {
                i.startObject(13);
              }
              static addName(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addDocString(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static addDomain(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static addSinceVersion(i, u2) {
                i.addFieldInt32(3, u2, 0);
              }
              static addIndex(i, u2) {
                i.addFieldInt32(4, u2, 0);
              }
              static addOpType(i, u2) {
                i.addFieldOffset(5, u2, 0);
              }
              static addType(i, u2) {
                i.addFieldInt32(6, u2, 0);
              }
              static addExecutionProviderType(i, u2) {
                i.addFieldOffset(7, u2, 0);
              }
              static addInputs(i, u2) {
                i.addFieldOffset(8, u2, 0);
              }
              static createInputsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startInputsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addOutputs(i, u2) {
                i.addFieldOffset(9, u2, 0);
              }
              static createOutputsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startOutputsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addAttributes(i, u2) {
                i.addFieldOffset(10, u2, 0);
              }
              static createAttributesVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startAttributesVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addInputArgCounts(i, u2) {
                i.addFieldOffset(11, u2, 0);
              }
              static createInputArgCountsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addInt32(u2[l]);
                return i.endVector();
              }
              static startInputArgCountsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addImplicitInputs(i, u2) {
                i.addFieldOffset(12, u2, 0);
              }
              static createImplicitInputsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startImplicitInputsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static endNode(i) {
                return i.endObject();
              }
              static createNode(i, u2, l, c2, p2, d, T, w, v, S2, A, C, F2, J) {
                return r.startNode(i), r.addName(i, u2), r.addDocString(i, l), r.addDomain(i, c2), r.addSinceVersion(i, p2), r.addIndex(i, d), r.addOpType(i, T), r.addType(i, w), r.addExecutionProviderType(i, v), r.addInputs(i, S2), r.addOutputs(i, A), r.addAttributes(i, C), r.addInputArgCounts(i, F2), r.addImplicitInputs(i, J), r.endNode(i);
              }
            }
            n.Node = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsValueInfo(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsValueInfo(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              name(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              docString(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              type(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? (i || new t.experimental.fbs.TypeInfo()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              static startValueInfo(i) {
                i.startObject(3);
              }
              static addName(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addDocString(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static addType(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static endValueInfo(i) {
                return i.endObject();
              }
              static createValueInfo(i, u2, l, c2) {
                return r.startValueInfo(i), r.addName(i, u2), r.addDocString(i, l), r.addType(i, c2), r.endValueInfo(i);
              }
            }
            n.ValueInfo = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsTypeInfo(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsTypeInfo(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              denotation(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              valueType() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.readUint8(this.bb_pos + i) : 0;
              }
              value(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? this.bb.__union(i, this.bb_pos + u2) : null;
              }
              static startTypeInfo(i) {
                i.startObject(3);
              }
              static addDenotation(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addValueType(i, u2) {
                i.addFieldInt8(1, u2, 0);
              }
              static addValue(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static endTypeInfo(i) {
                return i.endObject();
              }
              static createTypeInfo(i, u2, l, c2) {
                return r.startTypeInfo(i), r.addDenotation(i, u2), r.addValueType(i, l), r.addValue(i, c2), r.endTypeInfo(i);
              }
            }
            n.TypeInfo = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsOperatorSetId(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsOperatorSetId(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              domain(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              version() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.readInt64(this.bb_pos + i) : this.bb.createLong(0, 0);
              }
              static startOperatorSetId(i) {
                i.startObject(2);
              }
              static addDomain(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addVersion(i, u2) {
                i.addFieldInt64(1, u2, i.createLong(0, 0));
              }
              static endOperatorSetId(i) {
                return i.endObject();
              }
              static createOperatorSetId(i, u2, l) {
                return r.startOperatorSetId(i), r.addDomain(i, u2), r.addVersion(i, l), r.endOperatorSetId(i);
              }
            }
            n.OperatorSetId = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsTensor(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsTensor(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              name(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              docString(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              dims(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? this.bb.readInt64(this.bb.__vector(this.bb_pos + u2) + i * 8) : this.bb.createLong(0, 0);
              }
              dimsLength() {
                let i = this.bb.__offset(this.bb_pos, 8);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              dataType() {
                let i = this.bb.__offset(this.bb_pos, 10);
                return i ? this.bb.readInt32(this.bb_pos + i) : 0;
              }
              rawData(i) {
                let u2 = this.bb.__offset(this.bb_pos, 12);
                return u2 ? this.bb.readUint8(this.bb.__vector(this.bb_pos + u2) + i) : 0;
              }
              rawDataLength() {
                let i = this.bb.__offset(this.bb_pos, 12);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              rawDataArray() {
                let i = this.bb.__offset(this.bb_pos, 12);
                return i ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + i), this.bb.__vector_len(this.bb_pos + i)) : null;
              }
              stringData(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 14);
                return l ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + i * 4, u2) : null;
              }
              stringDataLength() {
                let i = this.bb.__offset(this.bb_pos, 14);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startTensor(i) {
                i.startObject(6);
              }
              static addName(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addDocString(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static addDims(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static createDimsVector(i, u2) {
                i.startVector(8, u2.length, 8);
                for (let l = u2.length - 1; l >= 0; l--) i.addInt64(u2[l]);
                return i.endVector();
              }
              static startDimsVector(i, u2) {
                i.startVector(8, u2, 8);
              }
              static addDataType(i, u2) {
                i.addFieldInt32(3, u2, 0);
              }
              static addRawData(i, u2) {
                i.addFieldOffset(4, u2, 0);
              }
              static createRawDataVector(i, u2) {
                i.startVector(1, u2.length, 1);
                for (let l = u2.length - 1; l >= 0; l--) i.addInt8(u2[l]);
                return i.endVector();
              }
              static startRawDataVector(i, u2) {
                i.startVector(1, u2, 1);
              }
              static addStringData(i, u2) {
                i.addFieldOffset(5, u2, 0);
              }
              static createStringDataVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startStringDataVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static endTensor(i) {
                return i.endObject();
              }
              static createTensor(i, u2, l, c2, p2, d, T) {
                return r.startTensor(i), r.addName(i, u2), r.addDocString(i, l), r.addDims(i, c2), r.addDataType(i, p2), r.addRawData(i, d), r.addStringData(i, T), r.endTensor(i);
              }
            }
            n.Tensor = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsSparseTensor(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsSparseTensor(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              values(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? (i || new t.experimental.fbs.Tensor()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              indices(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? (i || new t.experimental.fbs.Tensor()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              dims(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? this.bb.readInt64(this.bb.__vector(this.bb_pos + u2) + i * 8) : this.bb.createLong(0, 0);
              }
              dimsLength() {
                let i = this.bb.__offset(this.bb_pos, 8);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startSparseTensor(i) {
                i.startObject(3);
              }
              static addValues(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addIndices(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static addDims(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static createDimsVector(i, u2) {
                i.startVector(8, u2.length, 8);
                for (let l = u2.length - 1; l >= 0; l--) i.addInt64(u2[l]);
                return i.endVector();
              }
              static startDimsVector(i, u2) {
                i.startVector(8, u2, 8);
              }
              static endSparseTensor(i) {
                return i.endObject();
              }
              static createSparseTensor(i, u2, l, c2) {
                return r.startSparseTensor(i), r.addValues(i, u2), r.addIndices(i, l), r.addDims(i, c2), r.endSparseTensor(i);
              }
            }
            n.SparseTensor = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsAttribute(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsAttribute(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              name(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              docString(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              type() {
                let i = this.bb.__offset(this.bb_pos, 8);
                return i ? this.bb.readInt32(this.bb_pos + i) : 0;
              }
              f() {
                let i = this.bb.__offset(this.bb_pos, 10);
                return i ? this.bb.readFloat32(this.bb_pos + i) : 0;
              }
              i() {
                let i = this.bb.__offset(this.bb_pos, 12);
                return i ? this.bb.readInt64(this.bb_pos + i) : this.bb.createLong(0, 0);
              }
              s(i) {
                let u2 = this.bb.__offset(this.bb_pos, 14);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              t(i) {
                let u2 = this.bb.__offset(this.bb_pos, 16);
                return u2 ? (i || new t.experimental.fbs.Tensor()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              g(i) {
                let u2 = this.bb.__offset(this.bb_pos, 18);
                return u2 ? (i || new t.experimental.fbs.Graph()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              floats(i) {
                let u2 = this.bb.__offset(this.bb_pos, 20);
                return u2 ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + u2) + i * 4) : 0;
              }
              floatsLength() {
                let i = this.bb.__offset(this.bb_pos, 20);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              floatsArray() {
                let i = this.bb.__offset(this.bb_pos, 20);
                return i ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + i), this.bb.__vector_len(this.bb_pos + i)) : null;
              }
              ints(i) {
                let u2 = this.bb.__offset(this.bb_pos, 22);
                return u2 ? this.bb.readInt64(this.bb.__vector(this.bb_pos + u2) + i * 8) : this.bb.createLong(0, 0);
              }
              intsLength() {
                let i = this.bb.__offset(this.bb_pos, 22);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              strings(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 24);
                return l ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + i * 4, u2) : null;
              }
              stringsLength() {
                let i = this.bb.__offset(this.bb_pos, 24);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              tensors(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 26);
                return l ? (u2 || new t.experimental.fbs.Tensor()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              tensorsLength() {
                let i = this.bb.__offset(this.bb_pos, 26);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              graphs(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 28);
                return l ? (u2 || new t.experimental.fbs.Graph()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              graphsLength() {
                let i = this.bb.__offset(this.bb_pos, 28);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startAttribute(i) {
                i.startObject(13);
              }
              static addName(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addDocString(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static addType(i, u2) {
                i.addFieldInt32(2, u2, 0);
              }
              static addF(i, u2) {
                i.addFieldFloat32(3, u2, 0);
              }
              static addI(i, u2) {
                i.addFieldInt64(4, u2, i.createLong(0, 0));
              }
              static addS(i, u2) {
                i.addFieldOffset(5, u2, 0);
              }
              static addT(i, u2) {
                i.addFieldOffset(6, u2, 0);
              }
              static addG(i, u2) {
                i.addFieldOffset(7, u2, 0);
              }
              static addFloats(i, u2) {
                i.addFieldOffset(8, u2, 0);
              }
              static createFloatsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addFloat32(u2[l]);
                return i.endVector();
              }
              static startFloatsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addInts(i, u2) {
                i.addFieldOffset(9, u2, 0);
              }
              static createIntsVector(i, u2) {
                i.startVector(8, u2.length, 8);
                for (let l = u2.length - 1; l >= 0; l--) i.addInt64(u2[l]);
                return i.endVector();
              }
              static startIntsVector(i, u2) {
                i.startVector(8, u2, 8);
              }
              static addStrings(i, u2) {
                i.addFieldOffset(10, u2, 0);
              }
              static createStringsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startStringsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addTensors(i, u2) {
                i.addFieldOffset(11, u2, 0);
              }
              static createTensorsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startTensorsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addGraphs(i, u2) {
                i.addFieldOffset(12, u2, 0);
              }
              static createGraphsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startGraphsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static endAttribute(i) {
                return i.endObject();
              }
              static createAttribute(i, u2, l, c2, p2, d, T, w, v, S2, A, C, F2, J) {
                return r.startAttribute(i), r.addName(i, u2), r.addDocString(i, l), r.addType(i, c2), r.addF(i, p2), r.addI(i, d), r.addS(i, T), r.addT(i, w), r.addG(i, v), r.addFloats(i, S2), r.addInts(i, A), r.addStrings(i, C), r.addTensors(i, F2), r.addGraphs(i, J), r.endAttribute(i);
              }
            }
            n.Attribute = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsGraph(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsGraph(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              initializers(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 4);
                return l ? (u2 || new t.experimental.fbs.Tensor()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              initializersLength() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              nodeArgs(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 6);
                return l ? (u2 || new t.experimental.fbs.ValueInfo()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              nodeArgsLength() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              nodes(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 8);
                return l ? (u2 || new t.experimental.fbs.Node()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              nodesLength() {
                let i = this.bb.__offset(this.bb_pos, 8);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              maxNodeIndex() {
                let i = this.bb.__offset(this.bb_pos, 10);
                return i ? this.bb.readUint32(this.bb_pos + i) : 0;
              }
              nodeEdges(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 12);
                return l ? (u2 || new t.experimental.fbs.NodeEdge()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              nodeEdgesLength() {
                let i = this.bb.__offset(this.bb_pos, 12);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              inputs(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 14);
                return l ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + i * 4, u2) : null;
              }
              inputsLength() {
                let i = this.bb.__offset(this.bb_pos, 14);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              outputs(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 16);
                return l ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + i * 4, u2) : null;
              }
              outputsLength() {
                let i = this.bb.__offset(this.bb_pos, 16);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              sparseInitializers(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 18);
                return l ? (u2 || new t.experimental.fbs.SparseTensor()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              sparseInitializersLength() {
                let i = this.bb.__offset(this.bb_pos, 18);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startGraph(i) {
                i.startObject(8);
              }
              static addInitializers(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static createInitializersVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startInitializersVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addNodeArgs(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static createNodeArgsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startNodeArgsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addNodes(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static createNodesVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startNodesVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addMaxNodeIndex(i, u2) {
                i.addFieldInt32(3, u2, 0);
              }
              static addNodeEdges(i, u2) {
                i.addFieldOffset(4, u2, 0);
              }
              static createNodeEdgesVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startNodeEdgesVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addInputs(i, u2) {
                i.addFieldOffset(5, u2, 0);
              }
              static createInputsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startInputsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addOutputs(i, u2) {
                i.addFieldOffset(6, u2, 0);
              }
              static createOutputsVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startOutputsVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addSparseInitializers(i, u2) {
                i.addFieldOffset(7, u2, 0);
              }
              static createSparseInitializersVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startSparseInitializersVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static endGraph(i) {
                return i.endObject();
              }
              static createGraph(i, u2, l, c2, p2, d, T, w, v) {
                return r.startGraph(i), r.addInitializers(i, u2), r.addNodeArgs(i, l), r.addNodes(i, c2), r.addMaxNodeIndex(i, p2), r.addNodeEdges(i, d), r.addInputs(i, T), r.addOutputs(i, w), r.addSparseInitializers(i, v), r.endGraph(i);
              }
            }
            n.Graph = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsModel(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsModel(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              irVersion() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.readInt64(this.bb_pos + i) : this.bb.createLong(0, 0);
              }
              opsetImport(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 6);
                return l ? (u2 || new t.experimental.fbs.OperatorSetId()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              opsetImportLength() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              producerName(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              producerVersion(i) {
                let u2 = this.bb.__offset(this.bb_pos, 10);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              domain(i) {
                let u2 = this.bb.__offset(this.bb_pos, 12);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              modelVersion() {
                let i = this.bb.__offset(this.bb_pos, 14);
                return i ? this.bb.readInt64(this.bb_pos + i) : this.bb.createLong(0, 0);
              }
              docString(i) {
                let u2 = this.bb.__offset(this.bb_pos, 16);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              graph(i) {
                let u2 = this.bb.__offset(this.bb_pos, 18);
                return u2 ? (i || new t.experimental.fbs.Graph()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              graphDocString(i) {
                let u2 = this.bb.__offset(this.bb_pos, 20);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              static startModel(i) {
                i.startObject(9);
              }
              static addIrVersion(i, u2) {
                i.addFieldInt64(0, u2, i.createLong(0, 0));
              }
              static addOpsetImport(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static createOpsetImportVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startOpsetImportVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addProducerName(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static addProducerVersion(i, u2) {
                i.addFieldOffset(3, u2, 0);
              }
              static addDomain(i, u2) {
                i.addFieldOffset(4, u2, 0);
              }
              static addModelVersion(i, u2) {
                i.addFieldInt64(5, u2, i.createLong(0, 0));
              }
              static addDocString(i, u2) {
                i.addFieldOffset(6, u2, 0);
              }
              static addGraph(i, u2) {
                i.addFieldOffset(7, u2, 0);
              }
              static addGraphDocString(i, u2) {
                i.addFieldOffset(8, u2, 0);
              }
              static endModel(i) {
                return i.endObject();
              }
              static createModel(i, u2, l, c2, p2, d, T, w, v, S2) {
                return r.startModel(i), r.addIrVersion(i, u2), r.addOpsetImport(i, l), r.addProducerName(i, c2), r.addProducerVersion(i, p2), r.addDomain(i, d), r.addModelVersion(i, T), r.addDocString(i, w), r.addGraph(i, v), r.addGraphDocString(i, S2), r.endModel(i);
              }
            }
            n.Model = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsKernelCreateInfos(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsKernelCreateInfos(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              nodeIndices(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.readUint32(this.bb.__vector(this.bb_pos + u2) + i * 4) : 0;
              }
              nodeIndicesLength() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              nodeIndicesArray() {
                let i = this.bb.__offset(this.bb_pos, 4);
                return i ? new Uint32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + i), this.bb.__vector_len(this.bb_pos + i)) : null;
              }
              kernelDefHashes(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? this.bb.readUint64(this.bb.__vector(this.bb_pos + u2) + i * 8) : this.bb.createLong(0, 0);
              }
              kernelDefHashesLength() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startKernelCreateInfos(i) {
                i.startObject(2);
              }
              static addNodeIndices(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static createNodeIndicesVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addInt32(u2[l]);
                return i.endVector();
              }
              static startNodeIndicesVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static addKernelDefHashes(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static createKernelDefHashesVector(i, u2) {
                i.startVector(8, u2.length, 8);
                for (let l = u2.length - 1; l >= 0; l--) i.addInt64(u2[l]);
                return i.endVector();
              }
              static startKernelDefHashesVector(i, u2) {
                i.startVector(8, u2, 8);
              }
              static endKernelCreateInfos(i) {
                return i.endObject();
              }
              static createKernelCreateInfos(i, u2, l) {
                return r.startKernelCreateInfos(i), r.addNodeIndices(i, u2), r.addKernelDefHashes(i, l), r.endKernelCreateInfos(i);
              }
            }
            n.KernelCreateInfos = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsSubGraphSessionState(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsSubGraphSessionState(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              graphId(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              sessionState(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? (i || new t.experimental.fbs.SessionState()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              static startSubGraphSessionState(i) {
                i.startObject(2);
              }
              static addGraphId(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addSessionState(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static endSubGraphSessionState(i) {
                let u2 = i.endObject();
                return i.requiredField(u2, 4), u2;
              }
              static createSubGraphSessionState(i, u2, l) {
                return r.startSubGraphSessionState(i), r.addGraphId(i, u2), r.addSessionState(i, l), r.endSubGraphSessionState(i);
              }
            }
            n.SubGraphSessionState = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsSessionState(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsSessionState(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              kernels(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? (i || new t.experimental.fbs.KernelCreateInfos()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              subGraphSessionStates(i, u2) {
                let l = this.bb.__offset(this.bb_pos, 6);
                return l ? (u2 || new t.experimental.fbs.SubGraphSessionState()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + l) + i * 4), this.bb) : null;
              }
              subGraphSessionStatesLength() {
                let i = this.bb.__offset(this.bb_pos, 6);
                return i ? this.bb.__vector_len(this.bb_pos + i) : 0;
              }
              static startSessionState(i) {
                i.startObject(2);
              }
              static addKernels(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addSubGraphSessionStates(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static createSubGraphSessionStatesVector(i, u2) {
                i.startVector(4, u2.length, 4);
                for (let l = u2.length - 1; l >= 0; l--) i.addOffset(u2[l]);
                return i.endVector();
              }
              static startSubGraphSessionStatesVector(i, u2) {
                i.startVector(4, u2, 4);
              }
              static endSessionState(i) {
                return i.endObject();
              }
              static createSessionState(i, u2, l) {
                return r.startSessionState(i), r.addKernels(i, u2), r.addSubGraphSessionStates(i, l), r.endSessionState(i);
              }
            }
            n.SessionState = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
      ((t) => {
        let a;
        ((e) => {
          let o;
          ((n) => {
            class r {
              constructor() {
                this.bb = null;
                this.bb_pos = 0;
              }
              __init(i, u2) {
                return this.bb_pos = i, this.bb = u2, this;
              }
              static getRootAsInferenceSession(i, u2) {
                return (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static getSizePrefixedRootAsInferenceSession(i, u2) {
                return i.setPosition(i.position() + _.SIZE_PREFIX_LENGTH), (u2 || new r()).__init(i.readInt32(i.position()) + i.position(), i);
              }
              static bufferHasIdentifier(i) {
                return i.__has_identifier("ORTM");
              }
              ortVersion(i) {
                let u2 = this.bb.__offset(this.bb_pos, 4);
                return u2 ? this.bb.__string(this.bb_pos + u2, i) : null;
              }
              model(i) {
                let u2 = this.bb.__offset(this.bb_pos, 6);
                return u2 ? (i || new t.experimental.fbs.Model()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              sessionState(i) {
                let u2 = this.bb.__offset(this.bb_pos, 8);
                return u2 ? (i || new t.experimental.fbs.SessionState()).__init(this.bb.__indirect(this.bb_pos + u2), this.bb) : null;
              }
              static startInferenceSession(i) {
                i.startObject(3);
              }
              static addOrtVersion(i, u2) {
                i.addFieldOffset(0, u2, 0);
              }
              static addModel(i, u2) {
                i.addFieldOffset(1, u2, 0);
              }
              static addSessionState(i, u2) {
                i.addFieldOffset(2, u2, 0);
              }
              static endInferenceSession(i) {
                return i.endObject();
              }
              static finishInferenceSessionBuffer(i, u2) {
                i.finish(u2, "ORTM");
              }
              static finishSizePrefixedInferenceSessionBuffer(i, u2) {
                i.finish(u2, "ORTM", true);
              }
              static createInferenceSession(i, u2, l, c2) {
                return r.startInferenceSession(i), r.addOrtVersion(i, u2), r.addModel(i, l), r.addSessionState(i, c2), r.endInferenceSession(i);
              }
            }
            n.InferenceSession = r;
          })(o = e.fbs || (e.fbs = {}));
        })(a = t.experimental || (t.experimental = {}));
      })(V || (V = {}));
    });
    Bs = me((vy, ks) => {
      "use strict";
      ks.exports = Bd;
      function Bd(a, t) {
        for (var o = new Array(arguments.length - 1), e = 0, r = 2, n = true; r < arguments.length; ) o[e++] = arguments[r++];
        return new Promise(function(i, u2) {
          o[e] = function(c2) {
            if (n) if (n = false, c2) u2(c2);
            else {
              for (var p2 = new Array(arguments.length - 1), d = 0; d < p2.length; ) p2[d++] = arguments[d];
              i.apply(null, p2);
            }
          };
          try {
            a.apply(t || null, o);
          } catch (l) {
            n && (n = false, u2(l));
          }
        });
      }
    });
    Gs = me((Ms) => {
      "use strict";
      var Vn = Ms;
      Vn.length = function(t) {
        var o = t.length;
        if (!o) return 0;
        for (var e = 0; --o % 4 > 1 && t.charAt(o) === "="; ) ++e;
        return Math.ceil(t.length * 3) / 4 - e;
      };
      var Lr = new Array(64), Rs = new Array(123);
      for (At = 0; At < 64; ) Rs[Lr[At] = At < 26 ? At + 65 : At < 52 ? At + 71 : At < 62 ? At - 4 : At - 59 | 43] = At++;
      var At;
      Vn.encode = function(t, o, e) {
        for (var r = null, n = [], s = 0, i = 0, u2; o < e; ) {
          var l = t[o++];
          switch (i) {
            case 0:
              n[s++] = Lr[l >> 2], u2 = (l & 3) << 4, i = 1;
              break;
            case 1:
              n[s++] = Lr[u2 | l >> 4], u2 = (l & 15) << 2, i = 2;
              break;
            case 2:
              n[s++] = Lr[u2 | l >> 6], n[s++] = Lr[l & 63], i = 0;
              break;
          }
          s > 8191 && ((r || (r = [])).push(String.fromCharCode.apply(String, n)), s = 0);
        }
        return i && (n[s++] = Lr[u2], n[s++] = 61, i === 1 && (n[s++] = 61)), r ? (s && r.push(String.fromCharCode.apply(String, n.slice(0, s))), r.join("")) : String.fromCharCode.apply(String, n.slice(0, s));
      };
      var Ns = "invalid encoding";
      Vn.decode = function(t, o, e) {
        for (var r = e, n = 0, s, i = 0; i < t.length; ) {
          var u2 = t.charCodeAt(i++);
          if (u2 === 61 && n > 1) break;
          if ((u2 = Rs[u2]) === void 0) throw Error(Ns);
          switch (n) {
            case 0:
              s = u2, n = 1;
              break;
            case 1:
              o[e++] = s << 2 | (u2 & 48) >> 4, s = u2, n = 2;
              break;
            case 2:
              o[e++] = (s & 15) << 4 | (u2 & 60) >> 2, s = u2, n = 3;
              break;
            case 3:
              o[e++] = (s & 3) << 6 | u2, n = 0;
              break;
          }
        }
        if (n === 1) throw Error(Ns);
        return e - r;
      };
      Vn.test = function(t) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(t);
      };
    });
    zs = me((Oy, Us) => {
      "use strict";
      Us.exports = Wn;
      function Wn() {
        this._listeners = {};
      }
      Wn.prototype.on = function(t, o, e) {
        return (this._listeners[t] || (this._listeners[t] = [])).push({ fn: o, ctx: e || this }), this;
      };
      Wn.prototype.off = function(t, o) {
        if (t === void 0) this._listeners = {};
        else if (o === void 0) this._listeners[t] = [];
        else for (var e = this._listeners[t], r = 0; r < e.length; ) e[r].fn === o ? e.splice(r, 1) : ++r;
        return this;
      };
      Wn.prototype.emit = function(t) {
        var o = this._listeners[t];
        if (o) {
          for (var e = [], r = 1; r < arguments.length; ) e.push(arguments[r++]);
          for (r = 0; r < o.length; ) o[r].fn.apply(o[r++].ctx, e);
        }
        return this;
      };
    });
    Xs = me((Iy, Ys) => {
      "use strict";
      Ys.exports = Vs(Vs);
      function Vs(a) {
        return typeof Float32Array < "u" ? (function() {
          var t = new Float32Array([-0]), o = new Uint8Array(t.buffer), e = o[3] === 128;
          function r(u2, l, c2) {
            t[0] = u2, l[c2] = o[0], l[c2 + 1] = o[1], l[c2 + 2] = o[2], l[c2 + 3] = o[3];
          }
          function n(u2, l, c2) {
            t[0] = u2, l[c2] = o[3], l[c2 + 1] = o[2], l[c2 + 2] = o[1], l[c2 + 3] = o[0];
          }
          a.writeFloatLE = e ? r : n, a.writeFloatBE = e ? n : r;
          function s(u2, l) {
            return o[0] = u2[l], o[1] = u2[l + 1], o[2] = u2[l + 2], o[3] = u2[l + 3], t[0];
          }
          function i(u2, l) {
            return o[3] = u2[l], o[2] = u2[l + 1], o[1] = u2[l + 2], o[0] = u2[l + 3], t[0];
          }
          a.readFloatLE = e ? s : i, a.readFloatBE = e ? i : s;
        })() : (function() {
          function t(e, r, n, s) {
            var i = r < 0 ? 1 : 0;
            if (i && (r = -r), r === 0) e(1 / r > 0 ? 0 : 2147483648, n, s);
            else if (isNaN(r)) e(2143289344, n, s);
            else if (r > 34028234663852886e22) e((i << 31 | 2139095040) >>> 0, n, s);
            else if (r < 11754943508222875e-54) e((i << 31 | Math.round(r / 1401298464324817e-60)) >>> 0, n, s);
            else {
              var u2 = Math.floor(Math.log(r) / Math.LN2), l = Math.round(r * Math.pow(2, -u2) * 8388608) & 8388607;
              e((i << 31 | u2 + 127 << 23 | l) >>> 0, n, s);
            }
          }
          a.writeFloatLE = t.bind(null, Ws), a.writeFloatBE = t.bind(null, Hs);
          function o(e, r, n) {
            var s = e(r, n), i = (s >> 31) * 2 + 1, u2 = s >>> 23 & 255, l = s & 8388607;
            return u2 === 255 ? l ? NaN : i * (1 / 0) : u2 === 0 ? i * 1401298464324817e-60 * l : i * Math.pow(2, u2 - 150) * (l + 8388608);
          }
          a.readFloatLE = o.bind(null, qs), a.readFloatBE = o.bind(null, js);
        })(), typeof Float64Array < "u" ? (function() {
          var t = new Float64Array([-0]), o = new Uint8Array(t.buffer), e = o[7] === 128;
          function r(u2, l, c2) {
            t[0] = u2, l[c2] = o[0], l[c2 + 1] = o[1], l[c2 + 2] = o[2], l[c2 + 3] = o[3], l[c2 + 4] = o[4], l[c2 + 5] = o[5], l[c2 + 6] = o[6], l[c2 + 7] = o[7];
          }
          function n(u2, l, c2) {
            t[0] = u2, l[c2] = o[7], l[c2 + 1] = o[6], l[c2 + 2] = o[5], l[c2 + 3] = o[4], l[c2 + 4] = o[3], l[c2 + 5] = o[2], l[c2 + 6] = o[1], l[c2 + 7] = o[0];
          }
          a.writeDoubleLE = e ? r : n, a.writeDoubleBE = e ? n : r;
          function s(u2, l) {
            return o[0] = u2[l], o[1] = u2[l + 1], o[2] = u2[l + 2], o[3] = u2[l + 3], o[4] = u2[l + 4], o[5] = u2[l + 5], o[6] = u2[l + 6], o[7] = u2[l + 7], t[0];
          }
          function i(u2, l) {
            return o[7] = u2[l], o[6] = u2[l + 1], o[5] = u2[l + 2], o[4] = u2[l + 3], o[3] = u2[l + 4], o[2] = u2[l + 5], o[1] = u2[l + 6], o[0] = u2[l + 7], t[0];
          }
          a.readDoubleLE = e ? s : i, a.readDoubleBE = e ? i : s;
        })() : (function() {
          function t(e, r, n, s, i, u2) {
            var l = s < 0 ? 1 : 0;
            if (l && (s = -s), s === 0) e(0, i, u2 + r), e(1 / s > 0 ? 0 : 2147483648, i, u2 + n);
            else if (isNaN(s)) e(0, i, u2 + r), e(2146959360, i, u2 + n);
            else if (s > 17976931348623157e292) e(0, i, u2 + r), e((l << 31 | 2146435072) >>> 0, i, u2 + n);
            else {
              var c2;
              if (s < 22250738585072014e-324) c2 = s / 5e-324, e(c2 >>> 0, i, u2 + r), e((l << 31 | c2 / 4294967296) >>> 0, i, u2 + n);
              else {
                var p2 = Math.floor(Math.log(s) / Math.LN2);
                p2 === 1024 && (p2 = 1023), c2 = s * Math.pow(2, -p2), e(c2 * 4503599627370496 >>> 0, i, u2 + r), e((l << 31 | p2 + 1023 << 20 | c2 * 1048576 & 1048575) >>> 0, i, u2 + n);
              }
            }
          }
          a.writeDoubleLE = t.bind(null, Ws, 0, 4), a.writeDoubleBE = t.bind(null, Hs, 4, 0);
          function o(e, r, n, s, i) {
            var u2 = e(s, i + r), l = e(s, i + n), c2 = (l >> 31) * 2 + 1, p2 = l >>> 20 & 2047, d = 4294967296 * (l & 1048575) + u2;
            return p2 === 2047 ? d ? NaN : c2 * (1 / 0) : p2 === 0 ? c2 * 5e-324 * d : c2 * Math.pow(2, p2 - 1075) * (d + 4503599627370496);
          }
          a.readDoubleLE = o.bind(null, qs, 0, 4), a.readDoubleBE = o.bind(null, js, 4, 0);
        })(), a;
      }
      function Ws(a, t, o) {
        t[o] = a & 255, t[o + 1] = a >>> 8 & 255, t[o + 2] = a >>> 16 & 255, t[o + 3] = a >>> 24;
      }
      function Hs(a, t, o) {
        t[o] = a >>> 24, t[o + 1] = a >>> 16 & 255, t[o + 2] = a >>> 8 & 255, t[o + 3] = a & 255;
      }
      function qs(a, t) {
        return (a[t] | a[t + 1] << 8 | a[t + 2] << 16 | a[t + 3] << 24) >>> 0;
      }
      function js(a, t) {
        return (a[t] << 24 | a[t + 1] << 16 | a[t + 2] << 8 | a[t + 3]) >>> 0;
      }
    });
    Ks = me((exports, module) => {
      "use strict";
      module.exports = inquire;
      function inquire(moduleName) {
        try {
          var mod = eval("quire".replace(/^/, "re"))(moduleName);
          if (mod && (mod.length || Object.keys(mod).length)) return mod;
        } catch (a) {
        }
        return null;
      }
    });
    Zs = me((Js) => {
      "use strict";
      var Qo = Js;
      Qo.length = function(t) {
        for (var o = 0, e = 0, r = 0; r < t.length; ++r) e = t.charCodeAt(r), e < 128 ? o += 1 : e < 2048 ? o += 2 : (e & 64512) === 55296 && (t.charCodeAt(r + 1) & 64512) === 56320 ? (++r, o += 4) : o += 3;
        return o;
      };
      Qo.read = function(t, o, e) {
        var r = e - o;
        if (r < 1) return "";
        for (var n = null, s = [], i = 0, u2; o < e; ) u2 = t[o++], u2 < 128 ? s[i++] = u2 : u2 > 191 && u2 < 224 ? s[i++] = (u2 & 31) << 6 | t[o++] & 63 : u2 > 239 && u2 < 365 ? (u2 = ((u2 & 7) << 18 | (t[o++] & 63) << 12 | (t[o++] & 63) << 6 | t[o++] & 63) - 65536, s[i++] = 55296 + (u2 >> 10), s[i++] = 56320 + (u2 & 1023)) : s[i++] = (u2 & 15) << 12 | (t[o++] & 63) << 6 | t[o++] & 63, i > 8191 && ((n || (n = [])).push(String.fromCharCode.apply(String, s)), i = 0);
        return n ? (i && n.push(String.fromCharCode.apply(String, s.slice(0, i))), n.join("")) : String.fromCharCode.apply(String, s.slice(0, i));
      };
      Qo.write = function(t, o, e) {
        for (var r = e, n, s, i = 0; i < t.length; ++i) n = t.charCodeAt(i), n < 128 ? o[e++] = n : n < 2048 ? (o[e++] = n >> 6 | 192, o[e++] = n & 63 | 128) : (n & 64512) === 55296 && ((s = t.charCodeAt(i + 1)) & 64512) === 56320 ? (n = 65536 + ((n & 1023) << 10) + (s & 1023), ++i, o[e++] = n >> 18 | 240, o[e++] = n >> 12 & 63 | 128, o[e++] = n >> 6 & 63 | 128, o[e++] = n & 63 | 128) : (o[e++] = n >> 12 | 224, o[e++] = n >> 6 & 63 | 128, o[e++] = n & 63 | 128);
        return e - r;
      };
    });
    eu = me((Ay, Qs) => {
      "use strict";
      Qs.exports = Nd;
      function Nd(a, t, o) {
        var e = o || 8192, r = e >>> 1, n = null, s = e;
        return function(u2) {
          if (u2 < 1 || u2 > r) return a(u2);
          s + u2 > e && (n = a(e), s = 0);
          var l = t.call(n, s, s += u2);
          return s & 7 && (s = (s | 7) + 1), l;
        };
      }
    });
    ru = me((Py, tu) => {
      "use strict";
      tu.exports = Ge;
      var rn = Jt();
      function Ge(a, t) {
        this.lo = a >>> 0, this.hi = t >>> 0;
      }
      var pr = Ge.zero = new Ge(0, 0);
      pr.toNumber = function() {
        return 0;
      };
      pr.zzEncode = pr.zzDecode = function() {
        return this;
      };
      pr.length = function() {
        return 1;
      };
      var Rd = Ge.zeroHash = "\0\0\0\0\0\0\0\0";
      Ge.fromNumber = function(t) {
        if (t === 0) return pr;
        var o = t < 0;
        o && (t = -t);
        var e = t >>> 0, r = (t - e) / 4294967296 >>> 0;
        return o && (r = ~r >>> 0, e = ~e >>> 0, ++e > 4294967295 && (e = 0, ++r > 4294967295 && (r = 0))), new Ge(e, r);
      };
      Ge.from = function(t) {
        if (typeof t == "number") return Ge.fromNumber(t);
        if (rn.isString(t)) if (rn.Long) t = rn.Long.fromString(t);
        else return Ge.fromNumber(parseInt(t, 10));
        return t.low || t.high ? new Ge(t.low >>> 0, t.high >>> 0) : pr;
      };
      Ge.prototype.toNumber = function(t) {
        if (!t && this.hi >>> 31) {
          var o = ~this.lo + 1 >>> 0, e = ~this.hi >>> 0;
          return o || (e = e + 1 >>> 0), -(o + e * 4294967296);
        }
        return this.lo + this.hi * 4294967296;
      };
      Ge.prototype.toLong = function(t) {
        return rn.Long ? new rn.Long(this.lo | 0, this.hi | 0, !!t) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!t };
      };
      var Kt = String.prototype.charCodeAt;
      Ge.fromHash = function(t) {
        return t === Rd ? pr : new Ge((Kt.call(t, 0) | Kt.call(t, 1) << 8 | Kt.call(t, 2) << 16 | Kt.call(t, 3) << 24) >>> 0, (Kt.call(t, 4) | Kt.call(t, 5) << 8 | Kt.call(t, 6) << 16 | Kt.call(t, 7) << 24) >>> 0);
      };
      Ge.prototype.toHash = function() {
        return String.fromCharCode(this.lo & 255, this.lo >>> 8 & 255, this.lo >>> 16 & 255, this.lo >>> 24, this.hi & 255, this.hi >>> 8 & 255, this.hi >>> 16 & 255, this.hi >>> 24);
      };
      Ge.prototype.zzEncode = function() {
        var t = this.hi >> 31;
        return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ t) >>> 0, this.lo = (this.lo << 1 ^ t) >>> 0, this;
      };
      Ge.prototype.zzDecode = function() {
        var t = -(this.lo & 1);
        return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ t) >>> 0, this.hi = (this.hi >>> 1 ^ t) >>> 0, this;
      };
      Ge.prototype.length = function() {
        var t = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, e = this.hi >>> 24;
        return e === 0 ? o === 0 ? t < 16384 ? t < 128 ? 1 : 2 : t < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : e < 128 ? 9 : 10;
      };
    });
    Jt = me((ei) => {
      "use strict";
      var W = ei;
      W.asPromise = Bs();
      W.base64 = Gs();
      W.EventEmitter = zs();
      W.float = Xs();
      W.inquire = Ks();
      W.utf8 = Zs();
      W.pool = eu();
      W.LongBits = ru();
      W.isNode = !!(typeof global < "u" && global && global.process && global.process.versions && global.process.versions.node);
      W.global = W.isNode && global || typeof window < "u" && window || typeof self < "u" && self || ei;
      W.emptyArray = Object.freeze ? Object.freeze([]) : [];
      W.emptyObject = Object.freeze ? Object.freeze({}) : {};
      W.isInteger = Number.isInteger || function(t) {
        return typeof t == "number" && isFinite(t) && Math.floor(t) === t;
      };
      W.isString = function(t) {
        return typeof t == "string" || t instanceof String;
      };
      W.isObject = function(t) {
        return t && typeof t == "object";
      };
      W.isset = W.isSet = function(t, o) {
        var e = t[o];
        return e != null && t.hasOwnProperty(o) ? typeof e != "object" || (Array.isArray(e) ? e.length : Object.keys(e).length) > 0 : false;
      };
      W.Buffer = (function() {
        try {
          var a = W.inquire("buffer").Buffer;
          return a.prototype.utf8Write ? a : null;
        } catch {
          return null;
        }
      })();
      W._Buffer_from = null;
      W._Buffer_allocUnsafe = null;
      W.newBuffer = function(t) {
        return typeof t == "number" ? W.Buffer ? W._Buffer_allocUnsafe(t) : new W.Array(t) : W.Buffer ? W._Buffer_from(t) : typeof Uint8Array > "u" ? t : new Uint8Array(t);
      };
      W.Array = typeof Uint8Array < "u" ? Uint8Array : Array;
      W.Long = W.global.dcodeIO && W.global.dcodeIO.Long || W.global.Long || W.inquire("long");
      W.key2Re = /^true|false|0|1$/;
      W.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
      W.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
      W.longToHash = function(t) {
        return t ? W.LongBits.from(t).toHash() : W.LongBits.zeroHash;
      };
      W.longFromHash = function(t, o) {
        var e = W.LongBits.fromHash(t);
        return W.Long ? W.Long.fromBits(e.lo, e.hi, o) : e.toNumber(!!o);
      };
      function nu(a, t, o) {
        for (var e = Object.keys(t), r = 0; r < e.length; ++r) (a[e[r]] === void 0 || !o) && (a[e[r]] = t[e[r]]);
        return a;
      }
      W.merge = nu;
      W.lcFirst = function(t) {
        return t.charAt(0).toLowerCase() + t.substring(1);
      };
      function ou(a) {
        function t(o, e) {
          if (!(this instanceof t)) return new t(o, e);
          Object.defineProperty(this, "message", { get: function() {
            return o;
          } }), Error.captureStackTrace ? Error.captureStackTrace(this, t) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), e && nu(this, e);
        }
        return t.prototype = Object.create(Error.prototype, { constructor: { value: t, writable: true, enumerable: false, configurable: true }, name: { get: function() {
          return a;
        }, set: void 0, enumerable: false, configurable: true }, toString: { value: function() {
          return this.name + ": " + this.message;
        }, writable: true, enumerable: false, configurable: true } }), t;
      }
      W.newError = ou;
      W.ProtocolError = ou("ProtocolError");
      W.oneOfGetter = function(t) {
        for (var o = {}, e = 0; e < t.length; ++e) o[t[e]] = 1;
        return function() {
          for (var r = Object.keys(this), n = r.length - 1; n > -1; --n) if (o[r[n]] === 1 && this[r[n]] !== void 0 && this[r[n]] !== null) return r[n];
        };
      };
      W.oneOfSetter = function(t) {
        return function(o) {
          for (var e = 0; e < t.length; ++e) t[e] !== o && delete this[t[e]];
        };
      };
      W.toJSONOptions = { longs: String, enums: String, bytes: String, json: true };
      W._configure = function() {
        var a = W.Buffer;
        if (!a) {
          W._Buffer_from = W._Buffer_allocUnsafe = null;
          return;
        }
        W._Buffer_from = a.from !== Uint8Array.from && a.from || function(o, e) {
          return new a(o, e);
        }, W._Buffer_allocUnsafe = a.allocUnsafe || function(o) {
          return new a(o);
        };
      };
    });
    si = me((Dy, uu) => {
      "use strict";
      uu.exports = se;
      var pt = Jt(), ti, Hn = pt.LongBits, iu = pt.base64, au = pt.utf8;
      function nn(a, t, o) {
        this.fn = a, this.len = t, this.next = void 0, this.val = o;
      }
      function ni() {
      }
      function Md(a) {
        this.head = a.head, this.tail = a.tail, this.len = a.len, this.next = a.states;
      }
      function se() {
        this.len = 0, this.head = new nn(ni, 0, 0), this.tail = this.head, this.states = null;
      }
      var su = function() {
        return pt.Buffer ? function() {
          return (se.create = function() {
            return new ti();
          })();
        } : function() {
          return new se();
        };
      };
      se.create = su();
      se.alloc = function(t) {
        return new pt.Array(t);
      };
      pt.Array !== Array && (se.alloc = pt.pool(se.alloc, pt.Array.prototype.subarray));
      se.prototype._push = function(t, o, e) {
        return this.tail = this.tail.next = new nn(t, o, e), this.len += o, this;
      };
      function oi(a, t, o) {
        t[o] = a & 255;
      }
      function Gd(a, t, o) {
        for (; a > 127; ) t[o++] = a & 127 | 128, a >>>= 7;
        t[o] = a;
      }
      function ii(a, t) {
        this.len = a, this.next = void 0, this.val = t;
      }
      ii.prototype = Object.create(nn.prototype);
      ii.prototype.fn = Gd;
      se.prototype.uint32 = function(t) {
        return this.len += (this.tail = this.tail.next = new ii((t = t >>> 0) < 128 ? 1 : t < 16384 ? 2 : t < 2097152 ? 3 : t < 268435456 ? 4 : 5, t)).len, this;
      };
      se.prototype.int32 = function(t) {
        return t < 0 ? this._push(ai, 10, Hn.fromNumber(t)) : this.uint32(t);
      };
      se.prototype.sint32 = function(t) {
        return this.uint32((t << 1 ^ t >> 31) >>> 0);
      };
      function ai(a, t, o) {
        for (; a.hi; ) t[o++] = a.lo & 127 | 128, a.lo = (a.lo >>> 7 | a.hi << 25) >>> 0, a.hi >>>= 7;
        for (; a.lo > 127; ) t[o++] = a.lo & 127 | 128, a.lo = a.lo >>> 7;
        t[o++] = a.lo;
      }
      se.prototype.uint64 = function(t) {
        var o = Hn.from(t);
        return this._push(ai, o.length(), o);
      };
      se.prototype.int64 = se.prototype.uint64;
      se.prototype.sint64 = function(t) {
        var o = Hn.from(t).zzEncode();
        return this._push(ai, o.length(), o);
      };
      se.prototype.bool = function(t) {
        return this._push(oi, 1, t ? 1 : 0);
      };
      function ri(a, t, o) {
        t[o] = a & 255, t[o + 1] = a >>> 8 & 255, t[o + 2] = a >>> 16 & 255, t[o + 3] = a >>> 24;
      }
      se.prototype.fixed32 = function(t) {
        return this._push(ri, 4, t >>> 0);
      };
      se.prototype.sfixed32 = se.prototype.fixed32;
      se.prototype.fixed64 = function(t) {
        var o = Hn.from(t);
        return this._push(ri, 4, o.lo)._push(ri, 4, o.hi);
      };
      se.prototype.sfixed64 = se.prototype.fixed64;
      se.prototype.float = function(t) {
        return this._push(pt.float.writeFloatLE, 4, t);
      };
      se.prototype.double = function(t) {
        return this._push(pt.float.writeDoubleLE, 8, t);
      };
      var Ud = pt.Array.prototype.set ? function(t, o, e) {
        o.set(t, e);
      } : function(t, o, e) {
        for (var r = 0; r < t.length; ++r) o[e + r] = t[r];
      };
      se.prototype.bytes = function(t) {
        var o = t.length >>> 0;
        if (!o) return this._push(oi, 1, 0);
        if (pt.isString(t)) {
          var e = se.alloc(o = iu.length(t));
          iu.decode(t, e, 0), t = e;
        }
        return this.uint32(o)._push(Ud, o, t);
      };
      se.prototype.string = function(t) {
        var o = au.length(t);
        return o ? this.uint32(o)._push(au.write, o, t) : this._push(oi, 1, 0);
      };
      se.prototype.fork = function() {
        return this.states = new Md(this), this.head = this.tail = new nn(ni, 0, 0), this.len = 0, this;
      };
      se.prototype.reset = function() {
        return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new nn(ni, 0, 0), this.len = 0), this;
      };
      se.prototype.ldelim = function() {
        var t = this.head, o = this.tail, e = this.len;
        return this.reset().uint32(e), e && (this.tail.next = t.next, this.tail = o, this.len += e), this;
      };
      se.prototype.finish = function() {
        for (var t = this.head.next, o = this.constructor.alloc(this.len), e = 0; t; ) t.fn(t.val, o, e), e += t.len, t = t.next;
        return o;
      };
      se._configure = function(a) {
        ti = a, se.create = su(), ti._configure();
      };
    });
    cu = me((Ly, fu) => {
      "use strict";
      fu.exports = kt;
      var lu = si();
      (kt.prototype = Object.create(lu.prototype)).constructor = kt;
      var Zt = Jt();
      function kt() {
        lu.call(this);
      }
      kt._configure = function() {
        kt.alloc = Zt._Buffer_allocUnsafe, kt.writeBytesBuffer = Zt.Buffer && Zt.Buffer.prototype instanceof Uint8Array && Zt.Buffer.prototype.set.name === "set" ? function(t, o, e) {
          o.set(t, e);
        } : function(t, o, e) {
          if (t.copy) t.copy(o, e, 0, t.length);
          else for (var r = 0; r < t.length; ) o[e++] = t[r++];
        };
      };
      kt.prototype.bytes = function(t) {
        Zt.isString(t) && (t = Zt._Buffer_from(t, "base64"));
        var o = t.length >>> 0;
        return this.uint32(o), o && this._push(kt.writeBytesBuffer, o, t), this;
      };
      function zd(a, t, o) {
        a.length < 40 ? Zt.utf8.write(a, t, o) : t.utf8Write ? t.utf8Write(a, o) : t.write(a, o);
      }
      kt.prototype.string = function(t) {
        var o = Zt.Buffer.byteLength(t);
        return this.uint32(o), o && this._push(zd, o, t), this;
      };
      kt._configure();
    });
    fi = me((Cy, bu) => {
      "use strict";
      bu.exports = Ae;
      var Pt = Jt(), li, hu = Pt.LongBits, Vd = Pt.utf8;
      function Et(a, t) {
        return RangeError("index out of range: " + a.pos + " + " + (t || 1) + " > " + a.len);
      }
      function Ae(a) {
        this.buf = a, this.pos = 0, this.len = a.length;
      }
      var pu = typeof Uint8Array < "u" ? function(t) {
        if (t instanceof Uint8Array || Array.isArray(t)) return new Ae(t);
        throw Error("illegal buffer");
      } : function(t) {
        if (Array.isArray(t)) return new Ae(t);
        throw Error("illegal buffer");
      }, mu = function() {
        return Pt.Buffer ? function(o) {
          return (Ae.create = function(r) {
            return Pt.Buffer.isBuffer(r) ? new li(r) : pu(r);
          })(o);
        } : pu;
      };
      Ae.create = mu();
      Ae.prototype._slice = Pt.Array.prototype.subarray || Pt.Array.prototype.slice;
      Ae.prototype.uint32 = /* @__PURE__ */ (function() {
        var t = 4294967295;
        return function() {
          if (t = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (t = (t | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (t = (t | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (t = (t | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (t = (t | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return t;
          if ((this.pos += 5) > this.len) throw this.pos = this.len, Et(this, 10);
          return t;
        };
      })();
      Ae.prototype.int32 = function() {
        return this.uint32() | 0;
      };
      Ae.prototype.sint32 = function() {
        var t = this.uint32();
        return t >>> 1 ^ -(t & 1) | 0;
      };
      function ui() {
        var a = new hu(0, 0), t = 0;
        if (this.len - this.pos > 4) {
          for (; t < 4; ++t) if (a.lo = (a.lo | (this.buf[this.pos] & 127) << t * 7) >>> 0, this.buf[this.pos++] < 128) return a;
          if (a.lo = (a.lo | (this.buf[this.pos] & 127) << 28) >>> 0, a.hi = (a.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128) return a;
          t = 0;
        } else {
          for (; t < 3; ++t) {
            if (this.pos >= this.len) throw Et(this);
            if (a.lo = (a.lo | (this.buf[this.pos] & 127) << t * 7) >>> 0, this.buf[this.pos++] < 128) return a;
          }
          return a.lo = (a.lo | (this.buf[this.pos++] & 127) << t * 7) >>> 0, a;
        }
        if (this.len - this.pos > 4) {
          for (; t < 5; ++t) if (a.hi = (a.hi | (this.buf[this.pos] & 127) << t * 7 + 3) >>> 0, this.buf[this.pos++] < 128) return a;
        } else for (; t < 5; ++t) {
          if (this.pos >= this.len) throw Et(this);
          if (a.hi = (a.hi | (this.buf[this.pos] & 127) << t * 7 + 3) >>> 0, this.buf[this.pos++] < 128) return a;
        }
        throw Error("invalid varint encoding");
      }
      Ae.prototype.bool = function() {
        return this.uint32() !== 0;
      };
      function qn(a, t) {
        return (a[t - 4] | a[t - 3] << 8 | a[t - 2] << 16 | a[t - 1] << 24) >>> 0;
      }
      Ae.prototype.fixed32 = function() {
        if (this.pos + 4 > this.len) throw Et(this, 4);
        return qn(this.buf, this.pos += 4);
      };
      Ae.prototype.sfixed32 = function() {
        if (this.pos + 4 > this.len) throw Et(this, 4);
        return qn(this.buf, this.pos += 4) | 0;
      };
      function du() {
        if (this.pos + 8 > this.len) throw Et(this, 8);
        return new hu(qn(this.buf, this.pos += 4), qn(this.buf, this.pos += 4));
      }
      Ae.prototype.float = function() {
        if (this.pos + 4 > this.len) throw Et(this, 4);
        var t = Pt.float.readFloatLE(this.buf, this.pos);
        return this.pos += 4, t;
      };
      Ae.prototype.double = function() {
        if (this.pos + 8 > this.len) throw Et(this, 4);
        var t = Pt.float.readDoubleLE(this.buf, this.pos);
        return this.pos += 8, t;
      };
      Ae.prototype.bytes = function() {
        var t = this.uint32(), o = this.pos, e = this.pos + t;
        if (e > this.len) throw Et(this, t);
        if (this.pos += t, Array.isArray(this.buf)) return this.buf.slice(o, e);
        if (o === e) {
          var r = Pt.Buffer;
          return r ? r.alloc(0) : new this.buf.constructor(0);
        }
        return this._slice.call(this.buf, o, e);
      };
      Ae.prototype.string = function() {
        var t = this.bytes();
        return Vd.read(t, 0, t.length);
      };
      Ae.prototype.skip = function(t) {
        if (typeof t == "number") {
          if (this.pos + t > this.len) throw Et(this, t);
          this.pos += t;
        } else do
          if (this.pos >= this.len) throw Et(this);
        while (this.buf[this.pos++] & 128);
        return this;
      };
      Ae.prototype.skipType = function(a) {
        switch (a) {
          case 0:
            this.skip();
            break;
          case 1:
            this.skip(8);
            break;
          case 2:
            this.skip(this.uint32());
            break;
          case 3:
            for (; (a = this.uint32() & 7) !== 4; ) this.skipType(a);
            break;
          case 5:
            this.skip(4);
            break;
          default:
            throw Error("invalid wire type " + a + " at offset " + this.pos);
        }
        return this;
      };
      Ae._configure = function(a) {
        li = a, Ae.create = mu(), li._configure();
        var t = Pt.Long ? "toLong" : "toNumber";
        Pt.merge(Ae.prototype, { int64: function() {
          return ui.call(this)[t](false);
        }, uint64: function() {
          return ui.call(this)[t](true);
        }, sint64: function() {
          return ui.call(this).zzDecode()[t](false);
        }, fixed64: function() {
          return du.call(this)[t](true);
        }, sfixed64: function() {
          return du.call(this)[t](false);
        } });
      };
    });
    xu = me((Fy, Tu) => {
      "use strict";
      Tu.exports = dr;
      var yu = fi();
      (dr.prototype = Object.create(yu.prototype)).constructor = dr;
      var gu = Jt();
      function dr(a) {
        yu.call(this, a);
      }
      dr._configure = function() {
        gu.Buffer && (dr.prototype._slice = gu.Buffer.prototype.slice);
      };
      dr.prototype.string = function() {
        var t = this.uint32();
        return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
      };
      dr._configure();
    });
    vu = me(($y, wu) => {
      "use strict";
      wu.exports = on;
      var ci = Jt();
      (on.prototype = Object.create(ci.EventEmitter.prototype)).constructor = on;
      function on(a, t, o) {
        if (typeof a != "function") throw TypeError("rpcImpl must be a function");
        ci.EventEmitter.call(this), this.rpcImpl = a, this.requestDelimited = !!t, this.responseDelimited = !!o;
      }
      on.prototype.rpcCall = function a(t, o, e, r, n) {
        if (!r) throw TypeError("request must be specified");
        var s = this;
        if (!n) return ci.asPromise(a, s, t, o, e, r);
        if (!s.rpcImpl) {
          setTimeout(function() {
            n(Error("already ended"));
          }, 0);
          return;
        }
        try {
          return s.rpcImpl(t, o[s.requestDelimited ? "encodeDelimited" : "encode"](r).finish(), function(u2, l) {
            if (u2) return s.emit("error", u2, t), n(u2);
            if (l === null) {
              s.end(true);
              return;
            }
            if (!(l instanceof e)) try {
              l = e[s.responseDelimited ? "decodeDelimited" : "decode"](l);
            } catch (c2) {
              return s.emit("error", c2, t), n(c2);
            }
            return s.emit("data", l, t), n(null, l);
          });
        } catch (i) {
          s.emit("error", i, t), setTimeout(function() {
            n(i);
          }, 0);
          return;
        }
      };
      on.prototype.end = function(t) {
        return this.rpcImpl && (t || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
      };
    });
    Ou = me((_u) => {
      "use strict";
      var Wd = _u;
      Wd.Service = vu();
    });
    Su = me((By, Iu) => {
      "use strict";
      Iu.exports = {};
    });
    Eu = me((Pu) => {
      "use strict";
      var ot = Pu;
      ot.build = "minimal";
      ot.Writer = si();
      ot.BufferWriter = cu();
      ot.Reader = fi();
      ot.BufferReader = xu();
      ot.util = Jt();
      ot.rpc = Ou();
      ot.roots = Su();
      ot.configure = Au;
      function Au() {
        ot.util._configure(), ot.Writer._configure(ot.BufferWriter), ot.Reader._configure(ot.BufferReader);
      }
      Au();
    });
    Lu = me((Ry, Du) => {
      "use strict";
      Du.exports = Eu();
    });
    Cr = me((My, Cu) => {
      "use strict";
      var ge = Lu(), N2 = ge.Reader, Pe = ge.Writer, g = ge.util, h2 = ge.roots.default || (ge.roots.default = {});
      h2.onnx = (function() {
        var a = {};
        return a.Version = (function() {
          var t = {}, o = Object.create(t);
          return o[t[0] = "_START_VERSION"] = 0, o[t[1] = "IR_VERSION_2017_10_10"] = 1, o[t[2] = "IR_VERSION_2017_10_30"] = 2, o[t[3] = "IR_VERSION_2017_11_3"] = 3, o[t[4] = "IR_VERSION_2019_1_22"] = 4, o[t[5] = "IR_VERSION_2019_3_18"] = 5, o[t[6] = "IR_VERSION_2019_9_19"] = 6, o[t[7] = "IR_VERSION_2020_5_8"] = 7, o[t[8] = "IR_VERSION_2021_7_30"] = 8, o[t[9] = "IR_VERSION"] = 9, o;
        })(), a.AttributeProto = (function() {
          function t(o) {
            if (this.floats = [], this.ints = [], this.strings = [], this.tensors = [], this.graphs = [], this.sparseTensors = [], this.typeProtos = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.name = "", t.prototype.refAttrName = "", t.prototype.docString = "", t.prototype.type = 0, t.prototype.f = 0, t.prototype.i = g.Long ? g.Long.fromBits(0, 0, false) : 0, t.prototype.s = g.newBuffer([]), t.prototype.t = null, t.prototype.g = null, t.prototype.sparseTensor = null, t.prototype.tp = null, t.prototype.floats = g.emptyArray, t.prototype.ints = g.emptyArray, t.prototype.strings = g.emptyArray, t.prototype.tensors = g.emptyArray, t.prototype.graphs = g.emptyArray, t.prototype.sparseTensors = g.emptyArray, t.prototype.typeProtos = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.name != null && Object.hasOwnProperty.call(e, "name") && r.uint32(10).string(e.name), e.f != null && Object.hasOwnProperty.call(e, "f") && r.uint32(21).float(e.f), e.i != null && Object.hasOwnProperty.call(e, "i") && r.uint32(24).int64(e.i), e.s != null && Object.hasOwnProperty.call(e, "s") && r.uint32(34).bytes(e.s), e.t != null && Object.hasOwnProperty.call(e, "t") && h2.onnx.TensorProto.encode(e.t, r.uint32(42).fork()).ldelim(), e.g != null && Object.hasOwnProperty.call(e, "g") && h2.onnx.GraphProto.encode(e.g, r.uint32(50).fork()).ldelim(), e.floats != null && e.floats.length) {
              r.uint32(58).fork();
              for (var n = 0; n < e.floats.length; ++n) r.float(e.floats[n]);
              r.ldelim();
            }
            if (e.ints != null && e.ints.length) {
              r.uint32(66).fork();
              for (var n = 0; n < e.ints.length; ++n) r.int64(e.ints[n]);
              r.ldelim();
            }
            if (e.strings != null && e.strings.length) for (var n = 0; n < e.strings.length; ++n) r.uint32(74).bytes(e.strings[n]);
            if (e.tensors != null && e.tensors.length) for (var n = 0; n < e.tensors.length; ++n) h2.onnx.TensorProto.encode(e.tensors[n], r.uint32(82).fork()).ldelim();
            if (e.graphs != null && e.graphs.length) for (var n = 0; n < e.graphs.length; ++n) h2.onnx.GraphProto.encode(e.graphs[n], r.uint32(90).fork()).ldelim();
            if (e.docString != null && Object.hasOwnProperty.call(e, "docString") && r.uint32(106).string(e.docString), e.tp != null && Object.hasOwnProperty.call(e, "tp") && h2.onnx.TypeProto.encode(e.tp, r.uint32(114).fork()).ldelim(), e.typeProtos != null && e.typeProtos.length) for (var n = 0; n < e.typeProtos.length; ++n) h2.onnx.TypeProto.encode(e.typeProtos[n], r.uint32(122).fork()).ldelim();
            if (e.type != null && Object.hasOwnProperty.call(e, "type") && r.uint32(160).int32(e.type), e.refAttrName != null && Object.hasOwnProperty.call(e, "refAttrName") && r.uint32(170).string(e.refAttrName), e.sparseTensor != null && Object.hasOwnProperty.call(e, "sparseTensor") && h2.onnx.SparseTensorProto.encode(e.sparseTensor, r.uint32(178).fork()).ldelim(), e.sparseTensors != null && e.sparseTensors.length) for (var n = 0; n < e.sparseTensors.length; ++n) h2.onnx.SparseTensorProto.encode(e.sparseTensors[n], r.uint32(186).fork()).ldelim();
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.AttributeProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.name = e.string();
                  break;
                }
                case 21: {
                  s.refAttrName = e.string();
                  break;
                }
                case 13: {
                  s.docString = e.string();
                  break;
                }
                case 20: {
                  s.type = e.int32();
                  break;
                }
                case 2: {
                  s.f = e.float();
                  break;
                }
                case 3: {
                  s.i = e.int64();
                  break;
                }
                case 4: {
                  s.s = e.bytes();
                  break;
                }
                case 5: {
                  s.t = h2.onnx.TensorProto.decode(e, e.uint32());
                  break;
                }
                case 6: {
                  s.g = h2.onnx.GraphProto.decode(e, e.uint32());
                  break;
                }
                case 22: {
                  s.sparseTensor = h2.onnx.SparseTensorProto.decode(e, e.uint32());
                  break;
                }
                case 14: {
                  s.tp = h2.onnx.TypeProto.decode(e, e.uint32());
                  break;
                }
                case 7: {
                  if (s.floats && s.floats.length || (s.floats = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.floats.push(e.float());
                  else s.floats.push(e.float());
                  break;
                }
                case 8: {
                  if (s.ints && s.ints.length || (s.ints = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.ints.push(e.int64());
                  else s.ints.push(e.int64());
                  break;
                }
                case 9: {
                  s.strings && s.strings.length || (s.strings = []), s.strings.push(e.bytes());
                  break;
                }
                case 10: {
                  s.tensors && s.tensors.length || (s.tensors = []), s.tensors.push(h2.onnx.TensorProto.decode(e, e.uint32()));
                  break;
                }
                case 11: {
                  s.graphs && s.graphs.length || (s.graphs = []), s.graphs.push(h2.onnx.GraphProto.decode(e, e.uint32()));
                  break;
                }
                case 23: {
                  s.sparseTensors && s.sparseTensors.length || (s.sparseTensors = []), s.sparseTensors.push(h2.onnx.SparseTensorProto.decode(e, e.uint32()));
                  break;
                }
                case 15: {
                  s.typeProtos && s.typeProtos.length || (s.typeProtos = []), s.typeProtos.push(h2.onnx.TypeProto.decode(e, e.uint32()));
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.name != null && e.hasOwnProperty("name") && !g.isString(e.name)) return "name: string expected";
            if (e.refAttrName != null && e.hasOwnProperty("refAttrName") && !g.isString(e.refAttrName)) return "refAttrName: string expected";
            if (e.docString != null && e.hasOwnProperty("docString") && !g.isString(e.docString)) return "docString: string expected";
            if (e.type != null && e.hasOwnProperty("type")) switch (e.type) {
              default:
                return "type: enum value expected";
              case 0:
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
              case 11:
              case 13:
              case 6:
              case 7:
              case 8:
              case 9:
              case 10:
              case 12:
              case 14:
                break;
            }
            if (e.f != null && e.hasOwnProperty("f") && typeof e.f != "number") return "f: number expected";
            if (e.i != null && e.hasOwnProperty("i") && !g.isInteger(e.i) && !(e.i && g.isInteger(e.i.low) && g.isInteger(e.i.high))) return "i: integer|Long expected";
            if (e.s != null && e.hasOwnProperty("s") && !(e.s && typeof e.s.length == "number" || g.isString(e.s))) return "s: buffer expected";
            if (e.t != null && e.hasOwnProperty("t")) {
              var r = h2.onnx.TensorProto.verify(e.t);
              if (r) return "t." + r;
            }
            if (e.g != null && e.hasOwnProperty("g")) {
              var r = h2.onnx.GraphProto.verify(e.g);
              if (r) return "g." + r;
            }
            if (e.sparseTensor != null && e.hasOwnProperty("sparseTensor")) {
              var r = h2.onnx.SparseTensorProto.verify(e.sparseTensor);
              if (r) return "sparseTensor." + r;
            }
            if (e.tp != null && e.hasOwnProperty("tp")) {
              var r = h2.onnx.TypeProto.verify(e.tp);
              if (r) return "tp." + r;
            }
            if (e.floats != null && e.hasOwnProperty("floats")) {
              if (!Array.isArray(e.floats)) return "floats: array expected";
              for (var n = 0; n < e.floats.length; ++n) if (typeof e.floats[n] != "number") return "floats: number[] expected";
            }
            if (e.ints != null && e.hasOwnProperty("ints")) {
              if (!Array.isArray(e.ints)) return "ints: array expected";
              for (var n = 0; n < e.ints.length; ++n) if (!g.isInteger(e.ints[n]) && !(e.ints[n] && g.isInteger(e.ints[n].low) && g.isInteger(e.ints[n].high))) return "ints: integer|Long[] expected";
            }
            if (e.strings != null && e.hasOwnProperty("strings")) {
              if (!Array.isArray(e.strings)) return "strings: array expected";
              for (var n = 0; n < e.strings.length; ++n) if (!(e.strings[n] && typeof e.strings[n].length == "number" || g.isString(e.strings[n]))) return "strings: buffer[] expected";
            }
            if (e.tensors != null && e.hasOwnProperty("tensors")) {
              if (!Array.isArray(e.tensors)) return "tensors: array expected";
              for (var n = 0; n < e.tensors.length; ++n) {
                var r = h2.onnx.TensorProto.verify(e.tensors[n]);
                if (r) return "tensors." + r;
              }
            }
            if (e.graphs != null && e.hasOwnProperty("graphs")) {
              if (!Array.isArray(e.graphs)) return "graphs: array expected";
              for (var n = 0; n < e.graphs.length; ++n) {
                var r = h2.onnx.GraphProto.verify(e.graphs[n]);
                if (r) return "graphs." + r;
              }
            }
            if (e.sparseTensors != null && e.hasOwnProperty("sparseTensors")) {
              if (!Array.isArray(e.sparseTensors)) return "sparseTensors: array expected";
              for (var n = 0; n < e.sparseTensors.length; ++n) {
                var r = h2.onnx.SparseTensorProto.verify(e.sparseTensors[n]);
                if (r) return "sparseTensors." + r;
              }
            }
            if (e.typeProtos != null && e.hasOwnProperty("typeProtos")) {
              if (!Array.isArray(e.typeProtos)) return "typeProtos: array expected";
              for (var n = 0; n < e.typeProtos.length; ++n) {
                var r = h2.onnx.TypeProto.verify(e.typeProtos[n]);
                if (r) return "typeProtos." + r;
              }
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.AttributeProto) return e;
            var r = new h2.onnx.AttributeProto();
            switch (e.name != null && (r.name = String(e.name)), e.refAttrName != null && (r.refAttrName = String(e.refAttrName)), e.docString != null && (r.docString = String(e.docString)), e.type) {
              default:
                if (typeof e.type == "number") {
                  r.type = e.type;
                  break;
                }
                break;
              case "UNDEFINED":
              case 0:
                r.type = 0;
                break;
              case "FLOAT":
              case 1:
                r.type = 1;
                break;
              case "INT":
              case 2:
                r.type = 2;
                break;
              case "STRING":
              case 3:
                r.type = 3;
                break;
              case "TENSOR":
              case 4:
                r.type = 4;
                break;
              case "GRAPH":
              case 5:
                r.type = 5;
                break;
              case "SPARSE_TENSOR":
              case 11:
                r.type = 11;
                break;
              case "TYPE_PROTO":
              case 13:
                r.type = 13;
                break;
              case "FLOATS":
              case 6:
                r.type = 6;
                break;
              case "INTS":
              case 7:
                r.type = 7;
                break;
              case "STRINGS":
              case 8:
                r.type = 8;
                break;
              case "TENSORS":
              case 9:
                r.type = 9;
                break;
              case "GRAPHS":
              case 10:
                r.type = 10;
                break;
              case "SPARSE_TENSORS":
              case 12:
                r.type = 12;
                break;
              case "TYPE_PROTOS":
              case 14:
                r.type = 14;
                break;
            }
            if (e.f != null && (r.f = Number(e.f)), e.i != null && (g.Long ? (r.i = g.Long.fromValue(e.i)).unsigned = false : typeof e.i == "string" ? r.i = parseInt(e.i, 10) : typeof e.i == "number" ? r.i = e.i : typeof e.i == "object" && (r.i = new g.LongBits(e.i.low >>> 0, e.i.high >>> 0).toNumber())), e.s != null && (typeof e.s == "string" ? g.base64.decode(e.s, r.s = g.newBuffer(g.base64.length(e.s)), 0) : e.s.length >= 0 && (r.s = e.s)), e.t != null) {
              if (typeof e.t != "object") throw TypeError(".onnx.AttributeProto.t: object expected");
              r.t = h2.onnx.TensorProto.fromObject(e.t);
            }
            if (e.g != null) {
              if (typeof e.g != "object") throw TypeError(".onnx.AttributeProto.g: object expected");
              r.g = h2.onnx.GraphProto.fromObject(e.g);
            }
            if (e.sparseTensor != null) {
              if (typeof e.sparseTensor != "object") throw TypeError(".onnx.AttributeProto.sparseTensor: object expected");
              r.sparseTensor = h2.onnx.SparseTensorProto.fromObject(e.sparseTensor);
            }
            if (e.tp != null) {
              if (typeof e.tp != "object") throw TypeError(".onnx.AttributeProto.tp: object expected");
              r.tp = h2.onnx.TypeProto.fromObject(e.tp);
            }
            if (e.floats) {
              if (!Array.isArray(e.floats)) throw TypeError(".onnx.AttributeProto.floats: array expected");
              r.floats = [];
              for (var n = 0; n < e.floats.length; ++n) r.floats[n] = Number(e.floats[n]);
            }
            if (e.ints) {
              if (!Array.isArray(e.ints)) throw TypeError(".onnx.AttributeProto.ints: array expected");
              r.ints = [];
              for (var n = 0; n < e.ints.length; ++n) g.Long ? (r.ints[n] = g.Long.fromValue(e.ints[n])).unsigned = false : typeof e.ints[n] == "string" ? r.ints[n] = parseInt(e.ints[n], 10) : typeof e.ints[n] == "number" ? r.ints[n] = e.ints[n] : typeof e.ints[n] == "object" && (r.ints[n] = new g.LongBits(e.ints[n].low >>> 0, e.ints[n].high >>> 0).toNumber());
            }
            if (e.strings) {
              if (!Array.isArray(e.strings)) throw TypeError(".onnx.AttributeProto.strings: array expected");
              r.strings = [];
              for (var n = 0; n < e.strings.length; ++n) typeof e.strings[n] == "string" ? g.base64.decode(e.strings[n], r.strings[n] = g.newBuffer(g.base64.length(e.strings[n])), 0) : e.strings[n].length >= 0 && (r.strings[n] = e.strings[n]);
            }
            if (e.tensors) {
              if (!Array.isArray(e.tensors)) throw TypeError(".onnx.AttributeProto.tensors: array expected");
              r.tensors = [];
              for (var n = 0; n < e.tensors.length; ++n) {
                if (typeof e.tensors[n] != "object") throw TypeError(".onnx.AttributeProto.tensors: object expected");
                r.tensors[n] = h2.onnx.TensorProto.fromObject(e.tensors[n]);
              }
            }
            if (e.graphs) {
              if (!Array.isArray(e.graphs)) throw TypeError(".onnx.AttributeProto.graphs: array expected");
              r.graphs = [];
              for (var n = 0; n < e.graphs.length; ++n) {
                if (typeof e.graphs[n] != "object") throw TypeError(".onnx.AttributeProto.graphs: object expected");
                r.graphs[n] = h2.onnx.GraphProto.fromObject(e.graphs[n]);
              }
            }
            if (e.sparseTensors) {
              if (!Array.isArray(e.sparseTensors)) throw TypeError(".onnx.AttributeProto.sparseTensors: array expected");
              r.sparseTensors = [];
              for (var n = 0; n < e.sparseTensors.length; ++n) {
                if (typeof e.sparseTensors[n] != "object") throw TypeError(".onnx.AttributeProto.sparseTensors: object expected");
                r.sparseTensors[n] = h2.onnx.SparseTensorProto.fromObject(e.sparseTensors[n]);
              }
            }
            if (e.typeProtos) {
              if (!Array.isArray(e.typeProtos)) throw TypeError(".onnx.AttributeProto.typeProtos: array expected");
              r.typeProtos = [];
              for (var n = 0; n < e.typeProtos.length; ++n) {
                if (typeof e.typeProtos[n] != "object") throw TypeError(".onnx.AttributeProto.typeProtos: object expected");
                r.typeProtos[n] = h2.onnx.TypeProto.fromObject(e.typeProtos[n]);
              }
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.floats = [], n.ints = [], n.strings = [], n.tensors = [], n.graphs = [], n.typeProtos = [], n.sparseTensors = []), r.defaults) {
              if (n.name = "", n.f = 0, g.Long) {
                var s = new g.Long(0, 0, false);
                n.i = r.longs === String ? s.toString() : r.longs === Number ? s.toNumber() : s;
              } else n.i = r.longs === String ? "0" : 0;
              r.bytes === String ? n.s = "" : (n.s = [], r.bytes !== Array && (n.s = g.newBuffer(n.s))), n.t = null, n.g = null, n.docString = "", n.tp = null, n.type = r.enums === String ? "UNDEFINED" : 0, n.refAttrName = "", n.sparseTensor = null;
            }
            if (e.name != null && e.hasOwnProperty("name") && (n.name = e.name), e.f != null && e.hasOwnProperty("f") && (n.f = r.json && !isFinite(e.f) ? String(e.f) : e.f), e.i != null && e.hasOwnProperty("i") && (typeof e.i == "number" ? n.i = r.longs === String ? String(e.i) : e.i : n.i = r.longs === String ? g.Long.prototype.toString.call(e.i) : r.longs === Number ? new g.LongBits(e.i.low >>> 0, e.i.high >>> 0).toNumber() : e.i), e.s != null && e.hasOwnProperty("s") && (n.s = r.bytes === String ? g.base64.encode(e.s, 0, e.s.length) : r.bytes === Array ? Array.prototype.slice.call(e.s) : e.s), e.t != null && e.hasOwnProperty("t") && (n.t = h2.onnx.TensorProto.toObject(e.t, r)), e.g != null && e.hasOwnProperty("g") && (n.g = h2.onnx.GraphProto.toObject(e.g, r)), e.floats && e.floats.length) {
              n.floats = [];
              for (var i = 0; i < e.floats.length; ++i) n.floats[i] = r.json && !isFinite(e.floats[i]) ? String(e.floats[i]) : e.floats[i];
            }
            if (e.ints && e.ints.length) {
              n.ints = [];
              for (var i = 0; i < e.ints.length; ++i) typeof e.ints[i] == "number" ? n.ints[i] = r.longs === String ? String(e.ints[i]) : e.ints[i] : n.ints[i] = r.longs === String ? g.Long.prototype.toString.call(e.ints[i]) : r.longs === Number ? new g.LongBits(e.ints[i].low >>> 0, e.ints[i].high >>> 0).toNumber() : e.ints[i];
            }
            if (e.strings && e.strings.length) {
              n.strings = [];
              for (var i = 0; i < e.strings.length; ++i) n.strings[i] = r.bytes === String ? g.base64.encode(e.strings[i], 0, e.strings[i].length) : r.bytes === Array ? Array.prototype.slice.call(e.strings[i]) : e.strings[i];
            }
            if (e.tensors && e.tensors.length) {
              n.tensors = [];
              for (var i = 0; i < e.tensors.length; ++i) n.tensors[i] = h2.onnx.TensorProto.toObject(e.tensors[i], r);
            }
            if (e.graphs && e.graphs.length) {
              n.graphs = [];
              for (var i = 0; i < e.graphs.length; ++i) n.graphs[i] = h2.onnx.GraphProto.toObject(e.graphs[i], r);
            }
            if (e.docString != null && e.hasOwnProperty("docString") && (n.docString = e.docString), e.tp != null && e.hasOwnProperty("tp") && (n.tp = h2.onnx.TypeProto.toObject(e.tp, r)), e.typeProtos && e.typeProtos.length) {
              n.typeProtos = [];
              for (var i = 0; i < e.typeProtos.length; ++i) n.typeProtos[i] = h2.onnx.TypeProto.toObject(e.typeProtos[i], r);
            }
            if (e.type != null && e.hasOwnProperty("type") && (n.type = r.enums === String ? h2.onnx.AttributeProto.AttributeType[e.type] === void 0 ? e.type : h2.onnx.AttributeProto.AttributeType[e.type] : e.type), e.refAttrName != null && e.hasOwnProperty("refAttrName") && (n.refAttrName = e.refAttrName), e.sparseTensor != null && e.hasOwnProperty("sparseTensor") && (n.sparseTensor = h2.onnx.SparseTensorProto.toObject(e.sparseTensor, r)), e.sparseTensors && e.sparseTensors.length) {
              n.sparseTensors = [];
              for (var i = 0; i < e.sparseTensors.length; ++i) n.sparseTensors[i] = h2.onnx.SparseTensorProto.toObject(e.sparseTensors[i], r);
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.AttributeProto";
          }, t.AttributeType = (function() {
            var o = {}, e = Object.create(o);
            return e[o[0] = "UNDEFINED"] = 0, e[o[1] = "FLOAT"] = 1, e[o[2] = "INT"] = 2, e[o[3] = "STRING"] = 3, e[o[4] = "TENSOR"] = 4, e[o[5] = "GRAPH"] = 5, e[o[11] = "SPARSE_TENSOR"] = 11, e[o[13] = "TYPE_PROTO"] = 13, e[o[6] = "FLOATS"] = 6, e[o[7] = "INTS"] = 7, e[o[8] = "STRINGS"] = 8, e[o[9] = "TENSORS"] = 9, e[o[10] = "GRAPHS"] = 10, e[o[12] = "SPARSE_TENSORS"] = 12, e[o[14] = "TYPE_PROTOS"] = 14, e;
          })(), t;
        })(), a.ValueInfoProto = (function() {
          function t(o) {
            if (o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.name = "", t.prototype.type = null, t.prototype.docString = "", t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            return r || (r = Pe.create()), e.name != null && Object.hasOwnProperty.call(e, "name") && r.uint32(10).string(e.name), e.type != null && Object.hasOwnProperty.call(e, "type") && h2.onnx.TypeProto.encode(e.type, r.uint32(18).fork()).ldelim(), e.docString != null && Object.hasOwnProperty.call(e, "docString") && r.uint32(26).string(e.docString), r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.ValueInfoProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.name = e.string();
                  break;
                }
                case 2: {
                  s.type = h2.onnx.TypeProto.decode(e, e.uint32());
                  break;
                }
                case 3: {
                  s.docString = e.string();
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.name != null && e.hasOwnProperty("name") && !g.isString(e.name)) return "name: string expected";
            if (e.type != null && e.hasOwnProperty("type")) {
              var r = h2.onnx.TypeProto.verify(e.type);
              if (r) return "type." + r;
            }
            return e.docString != null && e.hasOwnProperty("docString") && !g.isString(e.docString) ? "docString: string expected" : null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.ValueInfoProto) return e;
            var r = new h2.onnx.ValueInfoProto();
            if (e.name != null && (r.name = String(e.name)), e.type != null) {
              if (typeof e.type != "object") throw TypeError(".onnx.ValueInfoProto.type: object expected");
              r.type = h2.onnx.TypeProto.fromObject(e.type);
            }
            return e.docString != null && (r.docString = String(e.docString)), r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            return r.defaults && (n.name = "", n.type = null, n.docString = ""), e.name != null && e.hasOwnProperty("name") && (n.name = e.name), e.type != null && e.hasOwnProperty("type") && (n.type = h2.onnx.TypeProto.toObject(e.type, r)), e.docString != null && e.hasOwnProperty("docString") && (n.docString = e.docString), n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.ValueInfoProto";
          }, t;
        })(), a.NodeProto = (function() {
          function t(o) {
            if (this.input = [], this.output = [], this.attribute = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.input = g.emptyArray, t.prototype.output = g.emptyArray, t.prototype.name = "", t.prototype.opType = "", t.prototype.domain = "", t.prototype.attribute = g.emptyArray, t.prototype.docString = "", t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.input != null && e.input.length) for (var n = 0; n < e.input.length; ++n) r.uint32(10).string(e.input[n]);
            if (e.output != null && e.output.length) for (var n = 0; n < e.output.length; ++n) r.uint32(18).string(e.output[n]);
            if (e.name != null && Object.hasOwnProperty.call(e, "name") && r.uint32(26).string(e.name), e.opType != null && Object.hasOwnProperty.call(e, "opType") && r.uint32(34).string(e.opType), e.attribute != null && e.attribute.length) for (var n = 0; n < e.attribute.length; ++n) h2.onnx.AttributeProto.encode(e.attribute[n], r.uint32(42).fork()).ldelim();
            return e.docString != null && Object.hasOwnProperty.call(e, "docString") && r.uint32(50).string(e.docString), e.domain != null && Object.hasOwnProperty.call(e, "domain") && r.uint32(58).string(e.domain), r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.NodeProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.input && s.input.length || (s.input = []), s.input.push(e.string());
                  break;
                }
                case 2: {
                  s.output && s.output.length || (s.output = []), s.output.push(e.string());
                  break;
                }
                case 3: {
                  s.name = e.string();
                  break;
                }
                case 4: {
                  s.opType = e.string();
                  break;
                }
                case 7: {
                  s.domain = e.string();
                  break;
                }
                case 5: {
                  s.attribute && s.attribute.length || (s.attribute = []), s.attribute.push(h2.onnx.AttributeProto.decode(e, e.uint32()));
                  break;
                }
                case 6: {
                  s.docString = e.string();
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.input != null && e.hasOwnProperty("input")) {
              if (!Array.isArray(e.input)) return "input: array expected";
              for (var r = 0; r < e.input.length; ++r) if (!g.isString(e.input[r])) return "input: string[] expected";
            }
            if (e.output != null && e.hasOwnProperty("output")) {
              if (!Array.isArray(e.output)) return "output: array expected";
              for (var r = 0; r < e.output.length; ++r) if (!g.isString(e.output[r])) return "output: string[] expected";
            }
            if (e.name != null && e.hasOwnProperty("name") && !g.isString(e.name)) return "name: string expected";
            if (e.opType != null && e.hasOwnProperty("opType") && !g.isString(e.opType)) return "opType: string expected";
            if (e.domain != null && e.hasOwnProperty("domain") && !g.isString(e.domain)) return "domain: string expected";
            if (e.attribute != null && e.hasOwnProperty("attribute")) {
              if (!Array.isArray(e.attribute)) return "attribute: array expected";
              for (var r = 0; r < e.attribute.length; ++r) {
                var n = h2.onnx.AttributeProto.verify(e.attribute[r]);
                if (n) return "attribute." + n;
              }
            }
            return e.docString != null && e.hasOwnProperty("docString") && !g.isString(e.docString) ? "docString: string expected" : null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.NodeProto) return e;
            var r = new h2.onnx.NodeProto();
            if (e.input) {
              if (!Array.isArray(e.input)) throw TypeError(".onnx.NodeProto.input: array expected");
              r.input = [];
              for (var n = 0; n < e.input.length; ++n) r.input[n] = String(e.input[n]);
            }
            if (e.output) {
              if (!Array.isArray(e.output)) throw TypeError(".onnx.NodeProto.output: array expected");
              r.output = [];
              for (var n = 0; n < e.output.length; ++n) r.output[n] = String(e.output[n]);
            }
            if (e.name != null && (r.name = String(e.name)), e.opType != null && (r.opType = String(e.opType)), e.domain != null && (r.domain = String(e.domain)), e.attribute) {
              if (!Array.isArray(e.attribute)) throw TypeError(".onnx.NodeProto.attribute: array expected");
              r.attribute = [];
              for (var n = 0; n < e.attribute.length; ++n) {
                if (typeof e.attribute[n] != "object") throw TypeError(".onnx.NodeProto.attribute: object expected");
                r.attribute[n] = h2.onnx.AttributeProto.fromObject(e.attribute[n]);
              }
            }
            return e.docString != null && (r.docString = String(e.docString)), r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.input = [], n.output = [], n.attribute = []), r.defaults && (n.name = "", n.opType = "", n.docString = "", n.domain = ""), e.input && e.input.length) {
              n.input = [];
              for (var s = 0; s < e.input.length; ++s) n.input[s] = e.input[s];
            }
            if (e.output && e.output.length) {
              n.output = [];
              for (var s = 0; s < e.output.length; ++s) n.output[s] = e.output[s];
            }
            if (e.name != null && e.hasOwnProperty("name") && (n.name = e.name), e.opType != null && e.hasOwnProperty("opType") && (n.opType = e.opType), e.attribute && e.attribute.length) {
              n.attribute = [];
              for (var s = 0; s < e.attribute.length; ++s) n.attribute[s] = h2.onnx.AttributeProto.toObject(e.attribute[s], r);
            }
            return e.docString != null && e.hasOwnProperty("docString") && (n.docString = e.docString), e.domain != null && e.hasOwnProperty("domain") && (n.domain = e.domain), n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.NodeProto";
          }, t;
        })(), a.TrainingInfoProto = (function() {
          function t(o) {
            if (this.initializationBinding = [], this.updateBinding = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.initialization = null, t.prototype.algorithm = null, t.prototype.initializationBinding = g.emptyArray, t.prototype.updateBinding = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.initialization != null && Object.hasOwnProperty.call(e, "initialization") && h2.onnx.GraphProto.encode(e.initialization, r.uint32(10).fork()).ldelim(), e.algorithm != null && Object.hasOwnProperty.call(e, "algorithm") && h2.onnx.GraphProto.encode(e.algorithm, r.uint32(18).fork()).ldelim(), e.initializationBinding != null && e.initializationBinding.length) for (var n = 0; n < e.initializationBinding.length; ++n) h2.onnx.StringStringEntryProto.encode(e.initializationBinding[n], r.uint32(26).fork()).ldelim();
            if (e.updateBinding != null && e.updateBinding.length) for (var n = 0; n < e.updateBinding.length; ++n) h2.onnx.StringStringEntryProto.encode(e.updateBinding[n], r.uint32(34).fork()).ldelim();
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.TrainingInfoProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.initialization = h2.onnx.GraphProto.decode(e, e.uint32());
                  break;
                }
                case 2: {
                  s.algorithm = h2.onnx.GraphProto.decode(e, e.uint32());
                  break;
                }
                case 3: {
                  s.initializationBinding && s.initializationBinding.length || (s.initializationBinding = []), s.initializationBinding.push(h2.onnx.StringStringEntryProto.decode(e, e.uint32()));
                  break;
                }
                case 4: {
                  s.updateBinding && s.updateBinding.length || (s.updateBinding = []), s.updateBinding.push(h2.onnx.StringStringEntryProto.decode(e, e.uint32()));
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.initialization != null && e.hasOwnProperty("initialization")) {
              var r = h2.onnx.GraphProto.verify(e.initialization);
              if (r) return "initialization." + r;
            }
            if (e.algorithm != null && e.hasOwnProperty("algorithm")) {
              var r = h2.onnx.GraphProto.verify(e.algorithm);
              if (r) return "algorithm." + r;
            }
            if (e.initializationBinding != null && e.hasOwnProperty("initializationBinding")) {
              if (!Array.isArray(e.initializationBinding)) return "initializationBinding: array expected";
              for (var n = 0; n < e.initializationBinding.length; ++n) {
                var r = h2.onnx.StringStringEntryProto.verify(e.initializationBinding[n]);
                if (r) return "initializationBinding." + r;
              }
            }
            if (e.updateBinding != null && e.hasOwnProperty("updateBinding")) {
              if (!Array.isArray(e.updateBinding)) return "updateBinding: array expected";
              for (var n = 0; n < e.updateBinding.length; ++n) {
                var r = h2.onnx.StringStringEntryProto.verify(e.updateBinding[n]);
                if (r) return "updateBinding." + r;
              }
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.TrainingInfoProto) return e;
            var r = new h2.onnx.TrainingInfoProto();
            if (e.initialization != null) {
              if (typeof e.initialization != "object") throw TypeError(".onnx.TrainingInfoProto.initialization: object expected");
              r.initialization = h2.onnx.GraphProto.fromObject(e.initialization);
            }
            if (e.algorithm != null) {
              if (typeof e.algorithm != "object") throw TypeError(".onnx.TrainingInfoProto.algorithm: object expected");
              r.algorithm = h2.onnx.GraphProto.fromObject(e.algorithm);
            }
            if (e.initializationBinding) {
              if (!Array.isArray(e.initializationBinding)) throw TypeError(".onnx.TrainingInfoProto.initializationBinding: array expected");
              r.initializationBinding = [];
              for (var n = 0; n < e.initializationBinding.length; ++n) {
                if (typeof e.initializationBinding[n] != "object") throw TypeError(".onnx.TrainingInfoProto.initializationBinding: object expected");
                r.initializationBinding[n] = h2.onnx.StringStringEntryProto.fromObject(e.initializationBinding[n]);
              }
            }
            if (e.updateBinding) {
              if (!Array.isArray(e.updateBinding)) throw TypeError(".onnx.TrainingInfoProto.updateBinding: array expected");
              r.updateBinding = [];
              for (var n = 0; n < e.updateBinding.length; ++n) {
                if (typeof e.updateBinding[n] != "object") throw TypeError(".onnx.TrainingInfoProto.updateBinding: object expected");
                r.updateBinding[n] = h2.onnx.StringStringEntryProto.fromObject(e.updateBinding[n]);
              }
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.initializationBinding = [], n.updateBinding = []), r.defaults && (n.initialization = null, n.algorithm = null), e.initialization != null && e.hasOwnProperty("initialization") && (n.initialization = h2.onnx.GraphProto.toObject(e.initialization, r)), e.algorithm != null && e.hasOwnProperty("algorithm") && (n.algorithm = h2.onnx.GraphProto.toObject(e.algorithm, r)), e.initializationBinding && e.initializationBinding.length) {
              n.initializationBinding = [];
              for (var s = 0; s < e.initializationBinding.length; ++s) n.initializationBinding[s] = h2.onnx.StringStringEntryProto.toObject(e.initializationBinding[s], r);
            }
            if (e.updateBinding && e.updateBinding.length) {
              n.updateBinding = [];
              for (var s = 0; s < e.updateBinding.length; ++s) n.updateBinding[s] = h2.onnx.StringStringEntryProto.toObject(e.updateBinding[s], r);
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.TrainingInfoProto";
          }, t;
        })(), a.ModelProto = (function() {
          function t(o) {
            if (this.opsetImport = [], this.metadataProps = [], this.trainingInfo = [], this.functions = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.irVersion = g.Long ? g.Long.fromBits(0, 0, false) : 0, t.prototype.opsetImport = g.emptyArray, t.prototype.producerName = "", t.prototype.producerVersion = "", t.prototype.domain = "", t.prototype.modelVersion = g.Long ? g.Long.fromBits(0, 0, false) : 0, t.prototype.docString = "", t.prototype.graph = null, t.prototype.metadataProps = g.emptyArray, t.prototype.trainingInfo = g.emptyArray, t.prototype.functions = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.irVersion != null && Object.hasOwnProperty.call(e, "irVersion") && r.uint32(8).int64(e.irVersion), e.producerName != null && Object.hasOwnProperty.call(e, "producerName") && r.uint32(18).string(e.producerName), e.producerVersion != null && Object.hasOwnProperty.call(e, "producerVersion") && r.uint32(26).string(e.producerVersion), e.domain != null && Object.hasOwnProperty.call(e, "domain") && r.uint32(34).string(e.domain), e.modelVersion != null && Object.hasOwnProperty.call(e, "modelVersion") && r.uint32(40).int64(e.modelVersion), e.docString != null && Object.hasOwnProperty.call(e, "docString") && r.uint32(50).string(e.docString), e.graph != null && Object.hasOwnProperty.call(e, "graph") && h2.onnx.GraphProto.encode(e.graph, r.uint32(58).fork()).ldelim(), e.opsetImport != null && e.opsetImport.length) for (var n = 0; n < e.opsetImport.length; ++n) h2.onnx.OperatorSetIdProto.encode(e.opsetImport[n], r.uint32(66).fork()).ldelim();
            if (e.metadataProps != null && e.metadataProps.length) for (var n = 0; n < e.metadataProps.length; ++n) h2.onnx.StringStringEntryProto.encode(e.metadataProps[n], r.uint32(114).fork()).ldelim();
            if (e.trainingInfo != null && e.trainingInfo.length) for (var n = 0; n < e.trainingInfo.length; ++n) h2.onnx.TrainingInfoProto.encode(e.trainingInfo[n], r.uint32(162).fork()).ldelim();
            if (e.functions != null && e.functions.length) for (var n = 0; n < e.functions.length; ++n) h2.onnx.FunctionProto.encode(e.functions[n], r.uint32(202).fork()).ldelim();
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.ModelProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.irVersion = e.int64();
                  break;
                }
                case 8: {
                  s.opsetImport && s.opsetImport.length || (s.opsetImport = []), s.opsetImport.push(h2.onnx.OperatorSetIdProto.decode(e, e.uint32()));
                  break;
                }
                case 2: {
                  s.producerName = e.string();
                  break;
                }
                case 3: {
                  s.producerVersion = e.string();
                  break;
                }
                case 4: {
                  s.domain = e.string();
                  break;
                }
                case 5: {
                  s.modelVersion = e.int64();
                  break;
                }
                case 6: {
                  s.docString = e.string();
                  break;
                }
                case 7: {
                  s.graph = h2.onnx.GraphProto.decode(e, e.uint32());
                  break;
                }
                case 14: {
                  s.metadataProps && s.metadataProps.length || (s.metadataProps = []), s.metadataProps.push(h2.onnx.StringStringEntryProto.decode(e, e.uint32()));
                  break;
                }
                case 20: {
                  s.trainingInfo && s.trainingInfo.length || (s.trainingInfo = []), s.trainingInfo.push(h2.onnx.TrainingInfoProto.decode(e, e.uint32()));
                  break;
                }
                case 25: {
                  s.functions && s.functions.length || (s.functions = []), s.functions.push(h2.onnx.FunctionProto.decode(e, e.uint32()));
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.irVersion != null && e.hasOwnProperty("irVersion") && !g.isInteger(e.irVersion) && !(e.irVersion && g.isInteger(e.irVersion.low) && g.isInteger(e.irVersion.high))) return "irVersion: integer|Long expected";
            if (e.opsetImport != null && e.hasOwnProperty("opsetImport")) {
              if (!Array.isArray(e.opsetImport)) return "opsetImport: array expected";
              for (var r = 0; r < e.opsetImport.length; ++r) {
                var n = h2.onnx.OperatorSetIdProto.verify(e.opsetImport[r]);
                if (n) return "opsetImport." + n;
              }
            }
            if (e.producerName != null && e.hasOwnProperty("producerName") && !g.isString(e.producerName)) return "producerName: string expected";
            if (e.producerVersion != null && e.hasOwnProperty("producerVersion") && !g.isString(e.producerVersion)) return "producerVersion: string expected";
            if (e.domain != null && e.hasOwnProperty("domain") && !g.isString(e.domain)) return "domain: string expected";
            if (e.modelVersion != null && e.hasOwnProperty("modelVersion") && !g.isInteger(e.modelVersion) && !(e.modelVersion && g.isInteger(e.modelVersion.low) && g.isInteger(e.modelVersion.high))) return "modelVersion: integer|Long expected";
            if (e.docString != null && e.hasOwnProperty("docString") && !g.isString(e.docString)) return "docString: string expected";
            if (e.graph != null && e.hasOwnProperty("graph")) {
              var n = h2.onnx.GraphProto.verify(e.graph);
              if (n) return "graph." + n;
            }
            if (e.metadataProps != null && e.hasOwnProperty("metadataProps")) {
              if (!Array.isArray(e.metadataProps)) return "metadataProps: array expected";
              for (var r = 0; r < e.metadataProps.length; ++r) {
                var n = h2.onnx.StringStringEntryProto.verify(e.metadataProps[r]);
                if (n) return "metadataProps." + n;
              }
            }
            if (e.trainingInfo != null && e.hasOwnProperty("trainingInfo")) {
              if (!Array.isArray(e.trainingInfo)) return "trainingInfo: array expected";
              for (var r = 0; r < e.trainingInfo.length; ++r) {
                var n = h2.onnx.TrainingInfoProto.verify(e.trainingInfo[r]);
                if (n) return "trainingInfo." + n;
              }
            }
            if (e.functions != null && e.hasOwnProperty("functions")) {
              if (!Array.isArray(e.functions)) return "functions: array expected";
              for (var r = 0; r < e.functions.length; ++r) {
                var n = h2.onnx.FunctionProto.verify(e.functions[r]);
                if (n) return "functions." + n;
              }
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.ModelProto) return e;
            var r = new h2.onnx.ModelProto();
            if (e.irVersion != null && (g.Long ? (r.irVersion = g.Long.fromValue(e.irVersion)).unsigned = false : typeof e.irVersion == "string" ? r.irVersion = parseInt(e.irVersion, 10) : typeof e.irVersion == "number" ? r.irVersion = e.irVersion : typeof e.irVersion == "object" && (r.irVersion = new g.LongBits(e.irVersion.low >>> 0, e.irVersion.high >>> 0).toNumber())), e.opsetImport) {
              if (!Array.isArray(e.opsetImport)) throw TypeError(".onnx.ModelProto.opsetImport: array expected");
              r.opsetImport = [];
              for (var n = 0; n < e.opsetImport.length; ++n) {
                if (typeof e.opsetImport[n] != "object") throw TypeError(".onnx.ModelProto.opsetImport: object expected");
                r.opsetImport[n] = h2.onnx.OperatorSetIdProto.fromObject(e.opsetImport[n]);
              }
            }
            if (e.producerName != null && (r.producerName = String(e.producerName)), e.producerVersion != null && (r.producerVersion = String(e.producerVersion)), e.domain != null && (r.domain = String(e.domain)), e.modelVersion != null && (g.Long ? (r.modelVersion = g.Long.fromValue(e.modelVersion)).unsigned = false : typeof e.modelVersion == "string" ? r.modelVersion = parseInt(e.modelVersion, 10) : typeof e.modelVersion == "number" ? r.modelVersion = e.modelVersion : typeof e.modelVersion == "object" && (r.modelVersion = new g.LongBits(e.modelVersion.low >>> 0, e.modelVersion.high >>> 0).toNumber())), e.docString != null && (r.docString = String(e.docString)), e.graph != null) {
              if (typeof e.graph != "object") throw TypeError(".onnx.ModelProto.graph: object expected");
              r.graph = h2.onnx.GraphProto.fromObject(e.graph);
            }
            if (e.metadataProps) {
              if (!Array.isArray(e.metadataProps)) throw TypeError(".onnx.ModelProto.metadataProps: array expected");
              r.metadataProps = [];
              for (var n = 0; n < e.metadataProps.length; ++n) {
                if (typeof e.metadataProps[n] != "object") throw TypeError(".onnx.ModelProto.metadataProps: object expected");
                r.metadataProps[n] = h2.onnx.StringStringEntryProto.fromObject(e.metadataProps[n]);
              }
            }
            if (e.trainingInfo) {
              if (!Array.isArray(e.trainingInfo)) throw TypeError(".onnx.ModelProto.trainingInfo: array expected");
              r.trainingInfo = [];
              for (var n = 0; n < e.trainingInfo.length; ++n) {
                if (typeof e.trainingInfo[n] != "object") throw TypeError(".onnx.ModelProto.trainingInfo: object expected");
                r.trainingInfo[n] = h2.onnx.TrainingInfoProto.fromObject(e.trainingInfo[n]);
              }
            }
            if (e.functions) {
              if (!Array.isArray(e.functions)) throw TypeError(".onnx.ModelProto.functions: array expected");
              r.functions = [];
              for (var n = 0; n < e.functions.length; ++n) {
                if (typeof e.functions[n] != "object") throw TypeError(".onnx.ModelProto.functions: object expected");
                r.functions[n] = h2.onnx.FunctionProto.fromObject(e.functions[n]);
              }
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.opsetImport = [], n.metadataProps = [], n.trainingInfo = [], n.functions = []), r.defaults) {
              if (g.Long) {
                var s = new g.Long(0, 0, false);
                n.irVersion = r.longs === String ? s.toString() : r.longs === Number ? s.toNumber() : s;
              } else n.irVersion = r.longs === String ? "0" : 0;
              if (n.producerName = "", n.producerVersion = "", n.domain = "", g.Long) {
                var s = new g.Long(0, 0, false);
                n.modelVersion = r.longs === String ? s.toString() : r.longs === Number ? s.toNumber() : s;
              } else n.modelVersion = r.longs === String ? "0" : 0;
              n.docString = "", n.graph = null;
            }
            if (e.irVersion != null && e.hasOwnProperty("irVersion") && (typeof e.irVersion == "number" ? n.irVersion = r.longs === String ? String(e.irVersion) : e.irVersion : n.irVersion = r.longs === String ? g.Long.prototype.toString.call(e.irVersion) : r.longs === Number ? new g.LongBits(e.irVersion.low >>> 0, e.irVersion.high >>> 0).toNumber() : e.irVersion), e.producerName != null && e.hasOwnProperty("producerName") && (n.producerName = e.producerName), e.producerVersion != null && e.hasOwnProperty("producerVersion") && (n.producerVersion = e.producerVersion), e.domain != null && e.hasOwnProperty("domain") && (n.domain = e.domain), e.modelVersion != null && e.hasOwnProperty("modelVersion") && (typeof e.modelVersion == "number" ? n.modelVersion = r.longs === String ? String(e.modelVersion) : e.modelVersion : n.modelVersion = r.longs === String ? g.Long.prototype.toString.call(e.modelVersion) : r.longs === Number ? new g.LongBits(e.modelVersion.low >>> 0, e.modelVersion.high >>> 0).toNumber() : e.modelVersion), e.docString != null && e.hasOwnProperty("docString") && (n.docString = e.docString), e.graph != null && e.hasOwnProperty("graph") && (n.graph = h2.onnx.GraphProto.toObject(e.graph, r)), e.opsetImport && e.opsetImport.length) {
              n.opsetImport = [];
              for (var i = 0; i < e.opsetImport.length; ++i) n.opsetImport[i] = h2.onnx.OperatorSetIdProto.toObject(e.opsetImport[i], r);
            }
            if (e.metadataProps && e.metadataProps.length) {
              n.metadataProps = [];
              for (var i = 0; i < e.metadataProps.length; ++i) n.metadataProps[i] = h2.onnx.StringStringEntryProto.toObject(e.metadataProps[i], r);
            }
            if (e.trainingInfo && e.trainingInfo.length) {
              n.trainingInfo = [];
              for (var i = 0; i < e.trainingInfo.length; ++i) n.trainingInfo[i] = h2.onnx.TrainingInfoProto.toObject(e.trainingInfo[i], r);
            }
            if (e.functions && e.functions.length) {
              n.functions = [];
              for (var i = 0; i < e.functions.length; ++i) n.functions[i] = h2.onnx.FunctionProto.toObject(e.functions[i], r);
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.ModelProto";
          }, t;
        })(), a.StringStringEntryProto = (function() {
          function t(o) {
            if (o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.key = "", t.prototype.value = "", t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            return r || (r = Pe.create()), e.key != null && Object.hasOwnProperty.call(e, "key") && r.uint32(10).string(e.key), e.value != null && Object.hasOwnProperty.call(e, "value") && r.uint32(18).string(e.value), r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.StringStringEntryProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.key = e.string();
                  break;
                }
                case 2: {
                  s.value = e.string();
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            return typeof e != "object" || e === null ? "object expected" : e.key != null && e.hasOwnProperty("key") && !g.isString(e.key) ? "key: string expected" : e.value != null && e.hasOwnProperty("value") && !g.isString(e.value) ? "value: string expected" : null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.StringStringEntryProto) return e;
            var r = new h2.onnx.StringStringEntryProto();
            return e.key != null && (r.key = String(e.key)), e.value != null && (r.value = String(e.value)), r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            return r.defaults && (n.key = "", n.value = ""), e.key != null && e.hasOwnProperty("key") && (n.key = e.key), e.value != null && e.hasOwnProperty("value") && (n.value = e.value), n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.StringStringEntryProto";
          }, t;
        })(), a.TensorAnnotation = (function() {
          function t(o) {
            if (this.quantParameterTensorNames = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.tensorName = "", t.prototype.quantParameterTensorNames = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.tensorName != null && Object.hasOwnProperty.call(e, "tensorName") && r.uint32(10).string(e.tensorName), e.quantParameterTensorNames != null && e.quantParameterTensorNames.length) for (var n = 0; n < e.quantParameterTensorNames.length; ++n) h2.onnx.StringStringEntryProto.encode(e.quantParameterTensorNames[n], r.uint32(18).fork()).ldelim();
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.TensorAnnotation(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.tensorName = e.string();
                  break;
                }
                case 2: {
                  s.quantParameterTensorNames && s.quantParameterTensorNames.length || (s.quantParameterTensorNames = []), s.quantParameterTensorNames.push(h2.onnx.StringStringEntryProto.decode(e, e.uint32()));
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.tensorName != null && e.hasOwnProperty("tensorName") && !g.isString(e.tensorName)) return "tensorName: string expected";
            if (e.quantParameterTensorNames != null && e.hasOwnProperty("quantParameterTensorNames")) {
              if (!Array.isArray(e.quantParameterTensorNames)) return "quantParameterTensorNames: array expected";
              for (var r = 0; r < e.quantParameterTensorNames.length; ++r) {
                var n = h2.onnx.StringStringEntryProto.verify(e.quantParameterTensorNames[r]);
                if (n) return "quantParameterTensorNames." + n;
              }
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.TensorAnnotation) return e;
            var r = new h2.onnx.TensorAnnotation();
            if (e.tensorName != null && (r.tensorName = String(e.tensorName)), e.quantParameterTensorNames) {
              if (!Array.isArray(e.quantParameterTensorNames)) throw TypeError(".onnx.TensorAnnotation.quantParameterTensorNames: array expected");
              r.quantParameterTensorNames = [];
              for (var n = 0; n < e.quantParameterTensorNames.length; ++n) {
                if (typeof e.quantParameterTensorNames[n] != "object") throw TypeError(".onnx.TensorAnnotation.quantParameterTensorNames: object expected");
                r.quantParameterTensorNames[n] = h2.onnx.StringStringEntryProto.fromObject(e.quantParameterTensorNames[n]);
              }
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.quantParameterTensorNames = []), r.defaults && (n.tensorName = ""), e.tensorName != null && e.hasOwnProperty("tensorName") && (n.tensorName = e.tensorName), e.quantParameterTensorNames && e.quantParameterTensorNames.length) {
              n.quantParameterTensorNames = [];
              for (var s = 0; s < e.quantParameterTensorNames.length; ++s) n.quantParameterTensorNames[s] = h2.onnx.StringStringEntryProto.toObject(e.quantParameterTensorNames[s], r);
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.TensorAnnotation";
          }, t;
        })(), a.GraphProto = (function() {
          function t(o) {
            if (this.node = [], this.initializer = [], this.sparseInitializer = [], this.input = [], this.output = [], this.valueInfo = [], this.quantizationAnnotation = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.node = g.emptyArray, t.prototype.name = "", t.prototype.initializer = g.emptyArray, t.prototype.sparseInitializer = g.emptyArray, t.prototype.docString = "", t.prototype.input = g.emptyArray, t.prototype.output = g.emptyArray, t.prototype.valueInfo = g.emptyArray, t.prototype.quantizationAnnotation = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.node != null && e.node.length) for (var n = 0; n < e.node.length; ++n) h2.onnx.NodeProto.encode(e.node[n], r.uint32(10).fork()).ldelim();
            if (e.name != null && Object.hasOwnProperty.call(e, "name") && r.uint32(18).string(e.name), e.initializer != null && e.initializer.length) for (var n = 0; n < e.initializer.length; ++n) h2.onnx.TensorProto.encode(e.initializer[n], r.uint32(42).fork()).ldelim();
            if (e.docString != null && Object.hasOwnProperty.call(e, "docString") && r.uint32(82).string(e.docString), e.input != null && e.input.length) for (var n = 0; n < e.input.length; ++n) h2.onnx.ValueInfoProto.encode(e.input[n], r.uint32(90).fork()).ldelim();
            if (e.output != null && e.output.length) for (var n = 0; n < e.output.length; ++n) h2.onnx.ValueInfoProto.encode(e.output[n], r.uint32(98).fork()).ldelim();
            if (e.valueInfo != null && e.valueInfo.length) for (var n = 0; n < e.valueInfo.length; ++n) h2.onnx.ValueInfoProto.encode(e.valueInfo[n], r.uint32(106).fork()).ldelim();
            if (e.quantizationAnnotation != null && e.quantizationAnnotation.length) for (var n = 0; n < e.quantizationAnnotation.length; ++n) h2.onnx.TensorAnnotation.encode(e.quantizationAnnotation[n], r.uint32(114).fork()).ldelim();
            if (e.sparseInitializer != null && e.sparseInitializer.length) for (var n = 0; n < e.sparseInitializer.length; ++n) h2.onnx.SparseTensorProto.encode(e.sparseInitializer[n], r.uint32(122).fork()).ldelim();
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.GraphProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.node && s.node.length || (s.node = []), s.node.push(h2.onnx.NodeProto.decode(e, e.uint32()));
                  break;
                }
                case 2: {
                  s.name = e.string();
                  break;
                }
                case 5: {
                  s.initializer && s.initializer.length || (s.initializer = []), s.initializer.push(h2.onnx.TensorProto.decode(e, e.uint32()));
                  break;
                }
                case 15: {
                  s.sparseInitializer && s.sparseInitializer.length || (s.sparseInitializer = []), s.sparseInitializer.push(h2.onnx.SparseTensorProto.decode(e, e.uint32()));
                  break;
                }
                case 10: {
                  s.docString = e.string();
                  break;
                }
                case 11: {
                  s.input && s.input.length || (s.input = []), s.input.push(h2.onnx.ValueInfoProto.decode(e, e.uint32()));
                  break;
                }
                case 12: {
                  s.output && s.output.length || (s.output = []), s.output.push(h2.onnx.ValueInfoProto.decode(e, e.uint32()));
                  break;
                }
                case 13: {
                  s.valueInfo && s.valueInfo.length || (s.valueInfo = []), s.valueInfo.push(h2.onnx.ValueInfoProto.decode(e, e.uint32()));
                  break;
                }
                case 14: {
                  s.quantizationAnnotation && s.quantizationAnnotation.length || (s.quantizationAnnotation = []), s.quantizationAnnotation.push(h2.onnx.TensorAnnotation.decode(e, e.uint32()));
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.node != null && e.hasOwnProperty("node")) {
              if (!Array.isArray(e.node)) return "node: array expected";
              for (var r = 0; r < e.node.length; ++r) {
                var n = h2.onnx.NodeProto.verify(e.node[r]);
                if (n) return "node." + n;
              }
            }
            if (e.name != null && e.hasOwnProperty("name") && !g.isString(e.name)) return "name: string expected";
            if (e.initializer != null && e.hasOwnProperty("initializer")) {
              if (!Array.isArray(e.initializer)) return "initializer: array expected";
              for (var r = 0; r < e.initializer.length; ++r) {
                var n = h2.onnx.TensorProto.verify(e.initializer[r]);
                if (n) return "initializer." + n;
              }
            }
            if (e.sparseInitializer != null && e.hasOwnProperty("sparseInitializer")) {
              if (!Array.isArray(e.sparseInitializer)) return "sparseInitializer: array expected";
              for (var r = 0; r < e.sparseInitializer.length; ++r) {
                var n = h2.onnx.SparseTensorProto.verify(e.sparseInitializer[r]);
                if (n) return "sparseInitializer." + n;
              }
            }
            if (e.docString != null && e.hasOwnProperty("docString") && !g.isString(e.docString)) return "docString: string expected";
            if (e.input != null && e.hasOwnProperty("input")) {
              if (!Array.isArray(e.input)) return "input: array expected";
              for (var r = 0; r < e.input.length; ++r) {
                var n = h2.onnx.ValueInfoProto.verify(e.input[r]);
                if (n) return "input." + n;
              }
            }
            if (e.output != null && e.hasOwnProperty("output")) {
              if (!Array.isArray(e.output)) return "output: array expected";
              for (var r = 0; r < e.output.length; ++r) {
                var n = h2.onnx.ValueInfoProto.verify(e.output[r]);
                if (n) return "output." + n;
              }
            }
            if (e.valueInfo != null && e.hasOwnProperty("valueInfo")) {
              if (!Array.isArray(e.valueInfo)) return "valueInfo: array expected";
              for (var r = 0; r < e.valueInfo.length; ++r) {
                var n = h2.onnx.ValueInfoProto.verify(e.valueInfo[r]);
                if (n) return "valueInfo." + n;
              }
            }
            if (e.quantizationAnnotation != null && e.hasOwnProperty("quantizationAnnotation")) {
              if (!Array.isArray(e.quantizationAnnotation)) return "quantizationAnnotation: array expected";
              for (var r = 0; r < e.quantizationAnnotation.length; ++r) {
                var n = h2.onnx.TensorAnnotation.verify(e.quantizationAnnotation[r]);
                if (n) return "quantizationAnnotation." + n;
              }
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.GraphProto) return e;
            var r = new h2.onnx.GraphProto();
            if (e.node) {
              if (!Array.isArray(e.node)) throw TypeError(".onnx.GraphProto.node: array expected");
              r.node = [];
              for (var n = 0; n < e.node.length; ++n) {
                if (typeof e.node[n] != "object") throw TypeError(".onnx.GraphProto.node: object expected");
                r.node[n] = h2.onnx.NodeProto.fromObject(e.node[n]);
              }
            }
            if (e.name != null && (r.name = String(e.name)), e.initializer) {
              if (!Array.isArray(e.initializer)) throw TypeError(".onnx.GraphProto.initializer: array expected");
              r.initializer = [];
              for (var n = 0; n < e.initializer.length; ++n) {
                if (typeof e.initializer[n] != "object") throw TypeError(".onnx.GraphProto.initializer: object expected");
                r.initializer[n] = h2.onnx.TensorProto.fromObject(e.initializer[n]);
              }
            }
            if (e.sparseInitializer) {
              if (!Array.isArray(e.sparseInitializer)) throw TypeError(".onnx.GraphProto.sparseInitializer: array expected");
              r.sparseInitializer = [];
              for (var n = 0; n < e.sparseInitializer.length; ++n) {
                if (typeof e.sparseInitializer[n] != "object") throw TypeError(".onnx.GraphProto.sparseInitializer: object expected");
                r.sparseInitializer[n] = h2.onnx.SparseTensorProto.fromObject(e.sparseInitializer[n]);
              }
            }
            if (e.docString != null && (r.docString = String(e.docString)), e.input) {
              if (!Array.isArray(e.input)) throw TypeError(".onnx.GraphProto.input: array expected");
              r.input = [];
              for (var n = 0; n < e.input.length; ++n) {
                if (typeof e.input[n] != "object") throw TypeError(".onnx.GraphProto.input: object expected");
                r.input[n] = h2.onnx.ValueInfoProto.fromObject(e.input[n]);
              }
            }
            if (e.output) {
              if (!Array.isArray(e.output)) throw TypeError(".onnx.GraphProto.output: array expected");
              r.output = [];
              for (var n = 0; n < e.output.length; ++n) {
                if (typeof e.output[n] != "object") throw TypeError(".onnx.GraphProto.output: object expected");
                r.output[n] = h2.onnx.ValueInfoProto.fromObject(e.output[n]);
              }
            }
            if (e.valueInfo) {
              if (!Array.isArray(e.valueInfo)) throw TypeError(".onnx.GraphProto.valueInfo: array expected");
              r.valueInfo = [];
              for (var n = 0; n < e.valueInfo.length; ++n) {
                if (typeof e.valueInfo[n] != "object") throw TypeError(".onnx.GraphProto.valueInfo: object expected");
                r.valueInfo[n] = h2.onnx.ValueInfoProto.fromObject(e.valueInfo[n]);
              }
            }
            if (e.quantizationAnnotation) {
              if (!Array.isArray(e.quantizationAnnotation)) throw TypeError(".onnx.GraphProto.quantizationAnnotation: array expected");
              r.quantizationAnnotation = [];
              for (var n = 0; n < e.quantizationAnnotation.length; ++n) {
                if (typeof e.quantizationAnnotation[n] != "object") throw TypeError(".onnx.GraphProto.quantizationAnnotation: object expected");
                r.quantizationAnnotation[n] = h2.onnx.TensorAnnotation.fromObject(e.quantizationAnnotation[n]);
              }
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.node = [], n.initializer = [], n.input = [], n.output = [], n.valueInfo = [], n.quantizationAnnotation = [], n.sparseInitializer = []), r.defaults && (n.name = "", n.docString = ""), e.node && e.node.length) {
              n.node = [];
              for (var s = 0; s < e.node.length; ++s) n.node[s] = h2.onnx.NodeProto.toObject(e.node[s], r);
            }
            if (e.name != null && e.hasOwnProperty("name") && (n.name = e.name), e.initializer && e.initializer.length) {
              n.initializer = [];
              for (var s = 0; s < e.initializer.length; ++s) n.initializer[s] = h2.onnx.TensorProto.toObject(e.initializer[s], r);
            }
            if (e.docString != null && e.hasOwnProperty("docString") && (n.docString = e.docString), e.input && e.input.length) {
              n.input = [];
              for (var s = 0; s < e.input.length; ++s) n.input[s] = h2.onnx.ValueInfoProto.toObject(e.input[s], r);
            }
            if (e.output && e.output.length) {
              n.output = [];
              for (var s = 0; s < e.output.length; ++s) n.output[s] = h2.onnx.ValueInfoProto.toObject(e.output[s], r);
            }
            if (e.valueInfo && e.valueInfo.length) {
              n.valueInfo = [];
              for (var s = 0; s < e.valueInfo.length; ++s) n.valueInfo[s] = h2.onnx.ValueInfoProto.toObject(e.valueInfo[s], r);
            }
            if (e.quantizationAnnotation && e.quantizationAnnotation.length) {
              n.quantizationAnnotation = [];
              for (var s = 0; s < e.quantizationAnnotation.length; ++s) n.quantizationAnnotation[s] = h2.onnx.TensorAnnotation.toObject(e.quantizationAnnotation[s], r);
            }
            if (e.sparseInitializer && e.sparseInitializer.length) {
              n.sparseInitializer = [];
              for (var s = 0; s < e.sparseInitializer.length; ++s) n.sparseInitializer[s] = h2.onnx.SparseTensorProto.toObject(e.sparseInitializer[s], r);
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.GraphProto";
          }, t;
        })(), a.TensorProto = (function() {
          function t(o) {
            if (this.dims = [], this.floatData = [], this.int32Data = [], this.stringData = [], this.int64Data = [], this.externalData = [], this.doubleData = [], this.uint64Data = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.dims = g.emptyArray, t.prototype.dataType = 0, t.prototype.segment = null, t.prototype.floatData = g.emptyArray, t.prototype.int32Data = g.emptyArray, t.prototype.stringData = g.emptyArray, t.prototype.int64Data = g.emptyArray, t.prototype.name = "", t.prototype.docString = "", t.prototype.rawData = g.newBuffer([]), t.prototype.externalData = g.emptyArray, t.prototype.dataLocation = 0, t.prototype.doubleData = g.emptyArray, t.prototype.uint64Data = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.dims != null && e.dims.length) {
              r.uint32(10).fork();
              for (var n = 0; n < e.dims.length; ++n) r.int64(e.dims[n]);
              r.ldelim();
            }
            if (e.dataType != null && Object.hasOwnProperty.call(e, "dataType") && r.uint32(16).int32(e.dataType), e.segment != null && Object.hasOwnProperty.call(e, "segment") && h2.onnx.TensorProto.Segment.encode(e.segment, r.uint32(26).fork()).ldelim(), e.floatData != null && e.floatData.length) {
              r.uint32(34).fork();
              for (var n = 0; n < e.floatData.length; ++n) r.float(e.floatData[n]);
              r.ldelim();
            }
            if (e.int32Data != null && e.int32Data.length) {
              r.uint32(42).fork();
              for (var n = 0; n < e.int32Data.length; ++n) r.int32(e.int32Data[n]);
              r.ldelim();
            }
            if (e.stringData != null && e.stringData.length) for (var n = 0; n < e.stringData.length; ++n) r.uint32(50).bytes(e.stringData[n]);
            if (e.int64Data != null && e.int64Data.length) {
              r.uint32(58).fork();
              for (var n = 0; n < e.int64Data.length; ++n) r.int64(e.int64Data[n]);
              r.ldelim();
            }
            if (e.name != null && Object.hasOwnProperty.call(e, "name") && r.uint32(66).string(e.name), e.rawData != null && Object.hasOwnProperty.call(e, "rawData") && r.uint32(74).bytes(e.rawData), e.doubleData != null && e.doubleData.length) {
              r.uint32(82).fork();
              for (var n = 0; n < e.doubleData.length; ++n) r.double(e.doubleData[n]);
              r.ldelim();
            }
            if (e.uint64Data != null && e.uint64Data.length) {
              r.uint32(90).fork();
              for (var n = 0; n < e.uint64Data.length; ++n) r.uint64(e.uint64Data[n]);
              r.ldelim();
            }
            if (e.docString != null && Object.hasOwnProperty.call(e, "docString") && r.uint32(98).string(e.docString), e.externalData != null && e.externalData.length) for (var n = 0; n < e.externalData.length; ++n) h2.onnx.StringStringEntryProto.encode(e.externalData[n], r.uint32(106).fork()).ldelim();
            return e.dataLocation != null && Object.hasOwnProperty.call(e, "dataLocation") && r.uint32(112).int32(e.dataLocation), r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.TensorProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  if (s.dims && s.dims.length || (s.dims = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.dims.push(e.int64());
                  else s.dims.push(e.int64());
                  break;
                }
                case 2: {
                  s.dataType = e.int32();
                  break;
                }
                case 3: {
                  s.segment = h2.onnx.TensorProto.Segment.decode(e, e.uint32());
                  break;
                }
                case 4: {
                  if (s.floatData && s.floatData.length || (s.floatData = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.floatData.push(e.float());
                  else s.floatData.push(e.float());
                  break;
                }
                case 5: {
                  if (s.int32Data && s.int32Data.length || (s.int32Data = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.int32Data.push(e.int32());
                  else s.int32Data.push(e.int32());
                  break;
                }
                case 6: {
                  s.stringData && s.stringData.length || (s.stringData = []), s.stringData.push(e.bytes());
                  break;
                }
                case 7: {
                  if (s.int64Data && s.int64Data.length || (s.int64Data = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.int64Data.push(e.int64());
                  else s.int64Data.push(e.int64());
                  break;
                }
                case 8: {
                  s.name = e.string();
                  break;
                }
                case 12: {
                  s.docString = e.string();
                  break;
                }
                case 9: {
                  s.rawData = e.bytes();
                  break;
                }
                case 13: {
                  s.externalData && s.externalData.length || (s.externalData = []), s.externalData.push(h2.onnx.StringStringEntryProto.decode(e, e.uint32()));
                  break;
                }
                case 14: {
                  s.dataLocation = e.int32();
                  break;
                }
                case 10: {
                  if (s.doubleData && s.doubleData.length || (s.doubleData = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.doubleData.push(e.double());
                  else s.doubleData.push(e.double());
                  break;
                }
                case 11: {
                  if (s.uint64Data && s.uint64Data.length || (s.uint64Data = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.uint64Data.push(e.uint64());
                  else s.uint64Data.push(e.uint64());
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.dims != null && e.hasOwnProperty("dims")) {
              if (!Array.isArray(e.dims)) return "dims: array expected";
              for (var r = 0; r < e.dims.length; ++r) if (!g.isInteger(e.dims[r]) && !(e.dims[r] && g.isInteger(e.dims[r].low) && g.isInteger(e.dims[r].high))) return "dims: integer|Long[] expected";
            }
            if (e.dataType != null && e.hasOwnProperty("dataType") && !g.isInteger(e.dataType)) return "dataType: integer expected";
            if (e.segment != null && e.hasOwnProperty("segment")) {
              var n = h2.onnx.TensorProto.Segment.verify(e.segment);
              if (n) return "segment." + n;
            }
            if (e.floatData != null && e.hasOwnProperty("floatData")) {
              if (!Array.isArray(e.floatData)) return "floatData: array expected";
              for (var r = 0; r < e.floatData.length; ++r) if (typeof e.floatData[r] != "number") return "floatData: number[] expected";
            }
            if (e.int32Data != null && e.hasOwnProperty("int32Data")) {
              if (!Array.isArray(e.int32Data)) return "int32Data: array expected";
              for (var r = 0; r < e.int32Data.length; ++r) if (!g.isInteger(e.int32Data[r])) return "int32Data: integer[] expected";
            }
            if (e.stringData != null && e.hasOwnProperty("stringData")) {
              if (!Array.isArray(e.stringData)) return "stringData: array expected";
              for (var r = 0; r < e.stringData.length; ++r) if (!(e.stringData[r] && typeof e.stringData[r].length == "number" || g.isString(e.stringData[r]))) return "stringData: buffer[] expected";
            }
            if (e.int64Data != null && e.hasOwnProperty("int64Data")) {
              if (!Array.isArray(e.int64Data)) return "int64Data: array expected";
              for (var r = 0; r < e.int64Data.length; ++r) if (!g.isInteger(e.int64Data[r]) && !(e.int64Data[r] && g.isInteger(e.int64Data[r].low) && g.isInteger(e.int64Data[r].high))) return "int64Data: integer|Long[] expected";
            }
            if (e.name != null && e.hasOwnProperty("name") && !g.isString(e.name)) return "name: string expected";
            if (e.docString != null && e.hasOwnProperty("docString") && !g.isString(e.docString)) return "docString: string expected";
            if (e.rawData != null && e.hasOwnProperty("rawData") && !(e.rawData && typeof e.rawData.length == "number" || g.isString(e.rawData))) return "rawData: buffer expected";
            if (e.externalData != null && e.hasOwnProperty("externalData")) {
              if (!Array.isArray(e.externalData)) return "externalData: array expected";
              for (var r = 0; r < e.externalData.length; ++r) {
                var n = h2.onnx.StringStringEntryProto.verify(e.externalData[r]);
                if (n) return "externalData." + n;
              }
            }
            if (e.dataLocation != null && e.hasOwnProperty("dataLocation")) switch (e.dataLocation) {
              default:
                return "dataLocation: enum value expected";
              case 0:
              case 1:
                break;
            }
            if (e.doubleData != null && e.hasOwnProperty("doubleData")) {
              if (!Array.isArray(e.doubleData)) return "doubleData: array expected";
              for (var r = 0; r < e.doubleData.length; ++r) if (typeof e.doubleData[r] != "number") return "doubleData: number[] expected";
            }
            if (e.uint64Data != null && e.hasOwnProperty("uint64Data")) {
              if (!Array.isArray(e.uint64Data)) return "uint64Data: array expected";
              for (var r = 0; r < e.uint64Data.length; ++r) if (!g.isInteger(e.uint64Data[r]) && !(e.uint64Data[r] && g.isInteger(e.uint64Data[r].low) && g.isInteger(e.uint64Data[r].high))) return "uint64Data: integer|Long[] expected";
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.TensorProto) return e;
            var r = new h2.onnx.TensorProto();
            if (e.dims) {
              if (!Array.isArray(e.dims)) throw TypeError(".onnx.TensorProto.dims: array expected");
              r.dims = [];
              for (var n = 0; n < e.dims.length; ++n) g.Long ? (r.dims[n] = g.Long.fromValue(e.dims[n])).unsigned = false : typeof e.dims[n] == "string" ? r.dims[n] = parseInt(e.dims[n], 10) : typeof e.dims[n] == "number" ? r.dims[n] = e.dims[n] : typeof e.dims[n] == "object" && (r.dims[n] = new g.LongBits(e.dims[n].low >>> 0, e.dims[n].high >>> 0).toNumber());
            }
            if (e.dataType != null && (r.dataType = e.dataType | 0), e.segment != null) {
              if (typeof e.segment != "object") throw TypeError(".onnx.TensorProto.segment: object expected");
              r.segment = h2.onnx.TensorProto.Segment.fromObject(e.segment);
            }
            if (e.floatData) {
              if (!Array.isArray(e.floatData)) throw TypeError(".onnx.TensorProto.floatData: array expected");
              r.floatData = [];
              for (var n = 0; n < e.floatData.length; ++n) r.floatData[n] = Number(e.floatData[n]);
            }
            if (e.int32Data) {
              if (!Array.isArray(e.int32Data)) throw TypeError(".onnx.TensorProto.int32Data: array expected");
              r.int32Data = [];
              for (var n = 0; n < e.int32Data.length; ++n) r.int32Data[n] = e.int32Data[n] | 0;
            }
            if (e.stringData) {
              if (!Array.isArray(e.stringData)) throw TypeError(".onnx.TensorProto.stringData: array expected");
              r.stringData = [];
              for (var n = 0; n < e.stringData.length; ++n) typeof e.stringData[n] == "string" ? g.base64.decode(e.stringData[n], r.stringData[n] = g.newBuffer(g.base64.length(e.stringData[n])), 0) : e.stringData[n].length >= 0 && (r.stringData[n] = e.stringData[n]);
            }
            if (e.int64Data) {
              if (!Array.isArray(e.int64Data)) throw TypeError(".onnx.TensorProto.int64Data: array expected");
              r.int64Data = [];
              for (var n = 0; n < e.int64Data.length; ++n) g.Long ? (r.int64Data[n] = g.Long.fromValue(e.int64Data[n])).unsigned = false : typeof e.int64Data[n] == "string" ? r.int64Data[n] = parseInt(e.int64Data[n], 10) : typeof e.int64Data[n] == "number" ? r.int64Data[n] = e.int64Data[n] : typeof e.int64Data[n] == "object" && (r.int64Data[n] = new g.LongBits(e.int64Data[n].low >>> 0, e.int64Data[n].high >>> 0).toNumber());
            }
            if (e.name != null && (r.name = String(e.name)), e.docString != null && (r.docString = String(e.docString)), e.rawData != null && (typeof e.rawData == "string" ? g.base64.decode(e.rawData, r.rawData = g.newBuffer(g.base64.length(e.rawData)), 0) : e.rawData.length >= 0 && (r.rawData = e.rawData)), e.externalData) {
              if (!Array.isArray(e.externalData)) throw TypeError(".onnx.TensorProto.externalData: array expected");
              r.externalData = [];
              for (var n = 0; n < e.externalData.length; ++n) {
                if (typeof e.externalData[n] != "object") throw TypeError(".onnx.TensorProto.externalData: object expected");
                r.externalData[n] = h2.onnx.StringStringEntryProto.fromObject(e.externalData[n]);
              }
            }
            switch (e.dataLocation) {
              default:
                if (typeof e.dataLocation == "number") {
                  r.dataLocation = e.dataLocation;
                  break;
                }
                break;
              case "DEFAULT":
              case 0:
                r.dataLocation = 0;
                break;
              case "EXTERNAL":
              case 1:
                r.dataLocation = 1;
                break;
            }
            if (e.doubleData) {
              if (!Array.isArray(e.doubleData)) throw TypeError(".onnx.TensorProto.doubleData: array expected");
              r.doubleData = [];
              for (var n = 0; n < e.doubleData.length; ++n) r.doubleData[n] = Number(e.doubleData[n]);
            }
            if (e.uint64Data) {
              if (!Array.isArray(e.uint64Data)) throw TypeError(".onnx.TensorProto.uint64Data: array expected");
              r.uint64Data = [];
              for (var n = 0; n < e.uint64Data.length; ++n) g.Long ? (r.uint64Data[n] = g.Long.fromValue(e.uint64Data[n])).unsigned = true : typeof e.uint64Data[n] == "string" ? r.uint64Data[n] = parseInt(e.uint64Data[n], 10) : typeof e.uint64Data[n] == "number" ? r.uint64Data[n] = e.uint64Data[n] : typeof e.uint64Data[n] == "object" && (r.uint64Data[n] = new g.LongBits(e.uint64Data[n].low >>> 0, e.uint64Data[n].high >>> 0).toNumber(true));
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.dims = [], n.floatData = [], n.int32Data = [], n.stringData = [], n.int64Data = [], n.doubleData = [], n.uint64Data = [], n.externalData = []), r.defaults && (n.dataType = 0, n.segment = null, n.name = "", r.bytes === String ? n.rawData = "" : (n.rawData = [], r.bytes !== Array && (n.rawData = g.newBuffer(n.rawData))), n.docString = "", n.dataLocation = r.enums === String ? "DEFAULT" : 0), e.dims && e.dims.length) {
              n.dims = [];
              for (var s = 0; s < e.dims.length; ++s) typeof e.dims[s] == "number" ? n.dims[s] = r.longs === String ? String(e.dims[s]) : e.dims[s] : n.dims[s] = r.longs === String ? g.Long.prototype.toString.call(e.dims[s]) : r.longs === Number ? new g.LongBits(e.dims[s].low >>> 0, e.dims[s].high >>> 0).toNumber() : e.dims[s];
            }
            if (e.dataType != null && e.hasOwnProperty("dataType") && (n.dataType = e.dataType), e.segment != null && e.hasOwnProperty("segment") && (n.segment = h2.onnx.TensorProto.Segment.toObject(e.segment, r)), e.floatData && e.floatData.length) {
              n.floatData = [];
              for (var s = 0; s < e.floatData.length; ++s) n.floatData[s] = r.json && !isFinite(e.floatData[s]) ? String(e.floatData[s]) : e.floatData[s];
            }
            if (e.int32Data && e.int32Data.length) {
              n.int32Data = [];
              for (var s = 0; s < e.int32Data.length; ++s) n.int32Data[s] = e.int32Data[s];
            }
            if (e.stringData && e.stringData.length) {
              n.stringData = [];
              for (var s = 0; s < e.stringData.length; ++s) n.stringData[s] = r.bytes === String ? g.base64.encode(e.stringData[s], 0, e.stringData[s].length) : r.bytes === Array ? Array.prototype.slice.call(e.stringData[s]) : e.stringData[s];
            }
            if (e.int64Data && e.int64Data.length) {
              n.int64Data = [];
              for (var s = 0; s < e.int64Data.length; ++s) typeof e.int64Data[s] == "number" ? n.int64Data[s] = r.longs === String ? String(e.int64Data[s]) : e.int64Data[s] : n.int64Data[s] = r.longs === String ? g.Long.prototype.toString.call(e.int64Data[s]) : r.longs === Number ? new g.LongBits(e.int64Data[s].low >>> 0, e.int64Data[s].high >>> 0).toNumber() : e.int64Data[s];
            }
            if (e.name != null && e.hasOwnProperty("name") && (n.name = e.name), e.rawData != null && e.hasOwnProperty("rawData") && (n.rawData = r.bytes === String ? g.base64.encode(e.rawData, 0, e.rawData.length) : r.bytes === Array ? Array.prototype.slice.call(e.rawData) : e.rawData), e.doubleData && e.doubleData.length) {
              n.doubleData = [];
              for (var s = 0; s < e.doubleData.length; ++s) n.doubleData[s] = r.json && !isFinite(e.doubleData[s]) ? String(e.doubleData[s]) : e.doubleData[s];
            }
            if (e.uint64Data && e.uint64Data.length) {
              n.uint64Data = [];
              for (var s = 0; s < e.uint64Data.length; ++s) typeof e.uint64Data[s] == "number" ? n.uint64Data[s] = r.longs === String ? String(e.uint64Data[s]) : e.uint64Data[s] : n.uint64Data[s] = r.longs === String ? g.Long.prototype.toString.call(e.uint64Data[s]) : r.longs === Number ? new g.LongBits(e.uint64Data[s].low >>> 0, e.uint64Data[s].high >>> 0).toNumber(true) : e.uint64Data[s];
            }
            if (e.docString != null && e.hasOwnProperty("docString") && (n.docString = e.docString), e.externalData && e.externalData.length) {
              n.externalData = [];
              for (var s = 0; s < e.externalData.length; ++s) n.externalData[s] = h2.onnx.StringStringEntryProto.toObject(e.externalData[s], r);
            }
            return e.dataLocation != null && e.hasOwnProperty("dataLocation") && (n.dataLocation = r.enums === String ? h2.onnx.TensorProto.DataLocation[e.dataLocation] === void 0 ? e.dataLocation : h2.onnx.TensorProto.DataLocation[e.dataLocation] : e.dataLocation), n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.TensorProto";
          }, t.DataType = (function() {
            var o = {}, e = Object.create(o);
            return e[o[0] = "UNDEFINED"] = 0, e[o[1] = "FLOAT"] = 1, e[o[2] = "UINT8"] = 2, e[o[3] = "INT8"] = 3, e[o[4] = "UINT16"] = 4, e[o[5] = "INT16"] = 5, e[o[6] = "INT32"] = 6, e[o[7] = "INT64"] = 7, e[o[8] = "STRING"] = 8, e[o[9] = "BOOL"] = 9, e[o[10] = "FLOAT16"] = 10, e[o[11] = "DOUBLE"] = 11, e[o[12] = "UINT32"] = 12, e[o[13] = "UINT64"] = 13, e[o[14] = "COMPLEX64"] = 14, e[o[15] = "COMPLEX128"] = 15, e[o[16] = "BFLOAT16"] = 16, e[o[17] = "FLOAT8E4M3FN"] = 17, e[o[18] = "FLOAT8E4M3FNUZ"] = 18, e[o[19] = "FLOAT8E5M2"] = 19, e[o[20] = "FLOAT8E5M2FNUZ"] = 20, e;
          })(), t.Segment = (function() {
            function o(e) {
              if (e) for (var r = Object.keys(e), n = 0; n < r.length; ++n) e[r[n]] != null && (this[r[n]] = e[r[n]]);
            }
            return o.prototype.begin = g.Long ? g.Long.fromBits(0, 0, false) : 0, o.prototype.end = g.Long ? g.Long.fromBits(0, 0, false) : 0, o.create = function(r) {
              return new o(r);
            }, o.encode = function(r, n) {
              return n || (n = Pe.create()), r.begin != null && Object.hasOwnProperty.call(r, "begin") && n.uint32(8).int64(r.begin), r.end != null && Object.hasOwnProperty.call(r, "end") && n.uint32(16).int64(r.end), n;
            }, o.encodeDelimited = function(r, n) {
              return this.encode(r, n).ldelim();
            }, o.decode = function(r, n) {
              r instanceof N2 || (r = N2.create(r));
              for (var s = n === void 0 ? r.len : r.pos + n, i = new h2.onnx.TensorProto.Segment(); r.pos < s; ) {
                var u2 = r.uint32();
                switch (u2 >>> 3) {
                  case 1: {
                    i.begin = r.int64();
                    break;
                  }
                  case 2: {
                    i.end = r.int64();
                    break;
                  }
                  default:
                    r.skipType(u2 & 7);
                    break;
                }
              }
              return i;
            }, o.decodeDelimited = function(r) {
              return r instanceof N2 || (r = new N2(r)), this.decode(r, r.uint32());
            }, o.verify = function(r) {
              return typeof r != "object" || r === null ? "object expected" : r.begin != null && r.hasOwnProperty("begin") && !g.isInteger(r.begin) && !(r.begin && g.isInteger(r.begin.low) && g.isInteger(r.begin.high)) ? "begin: integer|Long expected" : r.end != null && r.hasOwnProperty("end") && !g.isInteger(r.end) && !(r.end && g.isInteger(r.end.low) && g.isInteger(r.end.high)) ? "end: integer|Long expected" : null;
            }, o.fromObject = function(r) {
              if (r instanceof h2.onnx.TensorProto.Segment) return r;
              var n = new h2.onnx.TensorProto.Segment();
              return r.begin != null && (g.Long ? (n.begin = g.Long.fromValue(r.begin)).unsigned = false : typeof r.begin == "string" ? n.begin = parseInt(r.begin, 10) : typeof r.begin == "number" ? n.begin = r.begin : typeof r.begin == "object" && (n.begin = new g.LongBits(r.begin.low >>> 0, r.begin.high >>> 0).toNumber())), r.end != null && (g.Long ? (n.end = g.Long.fromValue(r.end)).unsigned = false : typeof r.end == "string" ? n.end = parseInt(r.end, 10) : typeof r.end == "number" ? n.end = r.end : typeof r.end == "object" && (n.end = new g.LongBits(r.end.low >>> 0, r.end.high >>> 0).toNumber())), n;
            }, o.toObject = function(r, n) {
              n || (n = {});
              var s = {};
              if (n.defaults) {
                if (g.Long) {
                  var i = new g.Long(0, 0, false);
                  s.begin = n.longs === String ? i.toString() : n.longs === Number ? i.toNumber() : i;
                } else s.begin = n.longs === String ? "0" : 0;
                if (g.Long) {
                  var i = new g.Long(0, 0, false);
                  s.end = n.longs === String ? i.toString() : n.longs === Number ? i.toNumber() : i;
                } else s.end = n.longs === String ? "0" : 0;
              }
              return r.begin != null && r.hasOwnProperty("begin") && (typeof r.begin == "number" ? s.begin = n.longs === String ? String(r.begin) : r.begin : s.begin = n.longs === String ? g.Long.prototype.toString.call(r.begin) : n.longs === Number ? new g.LongBits(r.begin.low >>> 0, r.begin.high >>> 0).toNumber() : r.begin), r.end != null && r.hasOwnProperty("end") && (typeof r.end == "number" ? s.end = n.longs === String ? String(r.end) : r.end : s.end = n.longs === String ? g.Long.prototype.toString.call(r.end) : n.longs === Number ? new g.LongBits(r.end.low >>> 0, r.end.high >>> 0).toNumber() : r.end), s;
            }, o.prototype.toJSON = function() {
              return this.constructor.toObject(this, ge.util.toJSONOptions);
            }, o.getTypeUrl = function(r) {
              return r === void 0 && (r = "type.googleapis.com"), r + "/onnx.TensorProto.Segment";
            }, o;
          })(), t.DataLocation = (function() {
            var o = {}, e = Object.create(o);
            return e[o[0] = "DEFAULT"] = 0, e[o[1] = "EXTERNAL"] = 1, e;
          })(), t;
        })(), a.SparseTensorProto = (function() {
          function t(o) {
            if (this.dims = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.values = null, t.prototype.indices = null, t.prototype.dims = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.values != null && Object.hasOwnProperty.call(e, "values") && h2.onnx.TensorProto.encode(e.values, r.uint32(10).fork()).ldelim(), e.indices != null && Object.hasOwnProperty.call(e, "indices") && h2.onnx.TensorProto.encode(e.indices, r.uint32(18).fork()).ldelim(), e.dims != null && e.dims.length) {
              r.uint32(26).fork();
              for (var n = 0; n < e.dims.length; ++n) r.int64(e.dims[n]);
              r.ldelim();
            }
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.SparseTensorProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.values = h2.onnx.TensorProto.decode(e, e.uint32());
                  break;
                }
                case 2: {
                  s.indices = h2.onnx.TensorProto.decode(e, e.uint32());
                  break;
                }
                case 3: {
                  if (s.dims && s.dims.length || (s.dims = []), (i & 7) === 2) for (var u2 = e.uint32() + e.pos; e.pos < u2; ) s.dims.push(e.int64());
                  else s.dims.push(e.int64());
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.values != null && e.hasOwnProperty("values")) {
              var r = h2.onnx.TensorProto.verify(e.values);
              if (r) return "values." + r;
            }
            if (e.indices != null && e.hasOwnProperty("indices")) {
              var r = h2.onnx.TensorProto.verify(e.indices);
              if (r) return "indices." + r;
            }
            if (e.dims != null && e.hasOwnProperty("dims")) {
              if (!Array.isArray(e.dims)) return "dims: array expected";
              for (var n = 0; n < e.dims.length; ++n) if (!g.isInteger(e.dims[n]) && !(e.dims[n] && g.isInteger(e.dims[n].low) && g.isInteger(e.dims[n].high))) return "dims: integer|Long[] expected";
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.SparseTensorProto) return e;
            var r = new h2.onnx.SparseTensorProto();
            if (e.values != null) {
              if (typeof e.values != "object") throw TypeError(".onnx.SparseTensorProto.values: object expected");
              r.values = h2.onnx.TensorProto.fromObject(e.values);
            }
            if (e.indices != null) {
              if (typeof e.indices != "object") throw TypeError(".onnx.SparseTensorProto.indices: object expected");
              r.indices = h2.onnx.TensorProto.fromObject(e.indices);
            }
            if (e.dims) {
              if (!Array.isArray(e.dims)) throw TypeError(".onnx.SparseTensorProto.dims: array expected");
              r.dims = [];
              for (var n = 0; n < e.dims.length; ++n) g.Long ? (r.dims[n] = g.Long.fromValue(e.dims[n])).unsigned = false : typeof e.dims[n] == "string" ? r.dims[n] = parseInt(e.dims[n], 10) : typeof e.dims[n] == "number" ? r.dims[n] = e.dims[n] : typeof e.dims[n] == "object" && (r.dims[n] = new g.LongBits(e.dims[n].low >>> 0, e.dims[n].high >>> 0).toNumber());
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.dims = []), r.defaults && (n.values = null, n.indices = null), e.values != null && e.hasOwnProperty("values") && (n.values = h2.onnx.TensorProto.toObject(e.values, r)), e.indices != null && e.hasOwnProperty("indices") && (n.indices = h2.onnx.TensorProto.toObject(e.indices, r)), e.dims && e.dims.length) {
              n.dims = [];
              for (var s = 0; s < e.dims.length; ++s) typeof e.dims[s] == "number" ? n.dims[s] = r.longs === String ? String(e.dims[s]) : e.dims[s] : n.dims[s] = r.longs === String ? g.Long.prototype.toString.call(e.dims[s]) : r.longs === Number ? new g.LongBits(e.dims[s].low >>> 0, e.dims[s].high >>> 0).toNumber() : e.dims[s];
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.SparseTensorProto";
          }, t;
        })(), a.TensorShapeProto = (function() {
          function t(o) {
            if (this.dim = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.dim = g.emptyArray, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.dim != null && e.dim.length) for (var n = 0; n < e.dim.length; ++n) h2.onnx.TensorShapeProto.Dimension.encode(e.dim[n], r.uint32(10).fork()).ldelim();
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.TensorShapeProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.dim && s.dim.length || (s.dim = []), s.dim.push(h2.onnx.TensorShapeProto.Dimension.decode(e, e.uint32()));
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.dim != null && e.hasOwnProperty("dim")) {
              if (!Array.isArray(e.dim)) return "dim: array expected";
              for (var r = 0; r < e.dim.length; ++r) {
                var n = h2.onnx.TensorShapeProto.Dimension.verify(e.dim[r]);
                if (n) return "dim." + n;
              }
            }
            return null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.TensorShapeProto) return e;
            var r = new h2.onnx.TensorShapeProto();
            if (e.dim) {
              if (!Array.isArray(e.dim)) throw TypeError(".onnx.TensorShapeProto.dim: array expected");
              r.dim = [];
              for (var n = 0; n < e.dim.length; ++n) {
                if (typeof e.dim[n] != "object") throw TypeError(".onnx.TensorShapeProto.dim: object expected");
                r.dim[n] = h2.onnx.TensorShapeProto.Dimension.fromObject(e.dim[n]);
              }
            }
            return r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.dim = []), e.dim && e.dim.length) {
              n.dim = [];
              for (var s = 0; s < e.dim.length; ++s) n.dim[s] = h2.onnx.TensorShapeProto.Dimension.toObject(e.dim[s], r);
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.TensorShapeProto";
          }, t.Dimension = (function() {
            function o(r) {
              if (r) for (var n = Object.keys(r), s = 0; s < n.length; ++s) r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            o.prototype.dimValue = null, o.prototype.dimParam = null, o.prototype.denotation = "";
            var e;
            return Object.defineProperty(o.prototype, "value", { get: g.oneOfGetter(e = ["dimValue", "dimParam"]), set: g.oneOfSetter(e) }), o.create = function(n) {
              return new o(n);
            }, o.encode = function(n, s) {
              return s || (s = Pe.create()), n.dimValue != null && Object.hasOwnProperty.call(n, "dimValue") && s.uint32(8).int64(n.dimValue), n.dimParam != null && Object.hasOwnProperty.call(n, "dimParam") && s.uint32(18).string(n.dimParam), n.denotation != null && Object.hasOwnProperty.call(n, "denotation") && s.uint32(26).string(n.denotation), s;
            }, o.encodeDelimited = function(n, s) {
              return this.encode(n, s).ldelim();
            }, o.decode = function(n, s) {
              n instanceof N2 || (n = N2.create(n));
              for (var i = s === void 0 ? n.len : n.pos + s, u2 = new h2.onnx.TensorShapeProto.Dimension(); n.pos < i; ) {
                var l = n.uint32();
                switch (l >>> 3) {
                  case 1: {
                    u2.dimValue = n.int64();
                    break;
                  }
                  case 2: {
                    u2.dimParam = n.string();
                    break;
                  }
                  case 3: {
                    u2.denotation = n.string();
                    break;
                  }
                  default:
                    n.skipType(l & 7);
                    break;
                }
              }
              return u2;
            }, o.decodeDelimited = function(n) {
              return n instanceof N2 || (n = new N2(n)), this.decode(n, n.uint32());
            }, o.verify = function(n) {
              if (typeof n != "object" || n === null) return "object expected";
              var s = {};
              if (n.dimValue != null && n.hasOwnProperty("dimValue") && (s.value = 1, !g.isInteger(n.dimValue) && !(n.dimValue && g.isInteger(n.dimValue.low) && g.isInteger(n.dimValue.high)))) return "dimValue: integer|Long expected";
              if (n.dimParam != null && n.hasOwnProperty("dimParam")) {
                if (s.value === 1) return "value: multiple values";
                if (s.value = 1, !g.isString(n.dimParam)) return "dimParam: string expected";
              }
              return n.denotation != null && n.hasOwnProperty("denotation") && !g.isString(n.denotation) ? "denotation: string expected" : null;
            }, o.fromObject = function(n) {
              if (n instanceof h2.onnx.TensorShapeProto.Dimension) return n;
              var s = new h2.onnx.TensorShapeProto.Dimension();
              return n.dimValue != null && (g.Long ? (s.dimValue = g.Long.fromValue(n.dimValue)).unsigned = false : typeof n.dimValue == "string" ? s.dimValue = parseInt(n.dimValue, 10) : typeof n.dimValue == "number" ? s.dimValue = n.dimValue : typeof n.dimValue == "object" && (s.dimValue = new g.LongBits(n.dimValue.low >>> 0, n.dimValue.high >>> 0).toNumber())), n.dimParam != null && (s.dimParam = String(n.dimParam)), n.denotation != null && (s.denotation = String(n.denotation)), s;
            }, o.toObject = function(n, s) {
              s || (s = {});
              var i = {};
              return s.defaults && (i.denotation = ""), n.dimValue != null && n.hasOwnProperty("dimValue") && (typeof n.dimValue == "number" ? i.dimValue = s.longs === String ? String(n.dimValue) : n.dimValue : i.dimValue = s.longs === String ? g.Long.prototype.toString.call(n.dimValue) : s.longs === Number ? new g.LongBits(n.dimValue.low >>> 0, n.dimValue.high >>> 0).toNumber() : n.dimValue, s.oneofs && (i.value = "dimValue")), n.dimParam != null && n.hasOwnProperty("dimParam") && (i.dimParam = n.dimParam, s.oneofs && (i.value = "dimParam")), n.denotation != null && n.hasOwnProperty("denotation") && (i.denotation = n.denotation), i;
            }, o.prototype.toJSON = function() {
              return this.constructor.toObject(this, ge.util.toJSONOptions);
            }, o.getTypeUrl = function(n) {
              return n === void 0 && (n = "type.googleapis.com"), n + "/onnx.TensorShapeProto.Dimension";
            }, o;
          })(), t;
        })(), a.TypeProto = (function() {
          function t(e) {
            if (e) for (var r = Object.keys(e), n = 0; n < r.length; ++n) e[r[n]] != null && (this[r[n]] = e[r[n]]);
          }
          t.prototype.tensorType = null, t.prototype.sequenceType = null, t.prototype.mapType = null, t.prototype.optionalType = null, t.prototype.sparseTensorType = null, t.prototype.denotation = "";
          var o;
          return Object.defineProperty(t.prototype, "value", { get: g.oneOfGetter(o = ["tensorType", "sequenceType", "mapType", "optionalType", "sparseTensorType"]), set: g.oneOfSetter(o) }), t.create = function(r) {
            return new t(r);
          }, t.encode = function(r, n) {
            return n || (n = Pe.create()), r.tensorType != null && Object.hasOwnProperty.call(r, "tensorType") && h2.onnx.TypeProto.Tensor.encode(r.tensorType, n.uint32(10).fork()).ldelim(), r.sequenceType != null && Object.hasOwnProperty.call(r, "sequenceType") && h2.onnx.TypeProto.Sequence.encode(r.sequenceType, n.uint32(34).fork()).ldelim(), r.mapType != null && Object.hasOwnProperty.call(r, "mapType") && h2.onnx.TypeProto.Map.encode(r.mapType, n.uint32(42).fork()).ldelim(), r.denotation != null && Object.hasOwnProperty.call(r, "denotation") && n.uint32(50).string(r.denotation), r.sparseTensorType != null && Object.hasOwnProperty.call(r, "sparseTensorType") && h2.onnx.TypeProto.SparseTensor.encode(r.sparseTensorType, n.uint32(66).fork()).ldelim(), r.optionalType != null && Object.hasOwnProperty.call(r, "optionalType") && h2.onnx.TypeProto.Optional.encode(r.optionalType, n.uint32(74).fork()).ldelim(), n;
          }, t.encodeDelimited = function(r, n) {
            return this.encode(r, n).ldelim();
          }, t.decode = function(r, n) {
            r instanceof N2 || (r = N2.create(r));
            for (var s = n === void 0 ? r.len : r.pos + n, i = new h2.onnx.TypeProto(); r.pos < s; ) {
              var u2 = r.uint32();
              switch (u2 >>> 3) {
                case 1: {
                  i.tensorType = h2.onnx.TypeProto.Tensor.decode(r, r.uint32());
                  break;
                }
                case 4: {
                  i.sequenceType = h2.onnx.TypeProto.Sequence.decode(r, r.uint32());
                  break;
                }
                case 5: {
                  i.mapType = h2.onnx.TypeProto.Map.decode(r, r.uint32());
                  break;
                }
                case 9: {
                  i.optionalType = h2.onnx.TypeProto.Optional.decode(r, r.uint32());
                  break;
                }
                case 8: {
                  i.sparseTensorType = h2.onnx.TypeProto.SparseTensor.decode(r, r.uint32());
                  break;
                }
                case 6: {
                  i.denotation = r.string();
                  break;
                }
                default:
                  r.skipType(u2 & 7);
                  break;
              }
            }
            return i;
          }, t.decodeDelimited = function(r) {
            return r instanceof N2 || (r = new N2(r)), this.decode(r, r.uint32());
          }, t.verify = function(r) {
            if (typeof r != "object" || r === null) return "object expected";
            var n = {};
            if (r.tensorType != null && r.hasOwnProperty("tensorType")) {
              n.value = 1;
              {
                var s = h2.onnx.TypeProto.Tensor.verify(r.tensorType);
                if (s) return "tensorType." + s;
              }
            }
            if (r.sequenceType != null && r.hasOwnProperty("sequenceType")) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h2.onnx.TypeProto.Sequence.verify(r.sequenceType);
                if (s) return "sequenceType." + s;
              }
            }
            if (r.mapType != null && r.hasOwnProperty("mapType")) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h2.onnx.TypeProto.Map.verify(r.mapType);
                if (s) return "mapType." + s;
              }
            }
            if (r.optionalType != null && r.hasOwnProperty("optionalType")) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h2.onnx.TypeProto.Optional.verify(r.optionalType);
                if (s) return "optionalType." + s;
              }
            }
            if (r.sparseTensorType != null && r.hasOwnProperty("sparseTensorType")) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h2.onnx.TypeProto.SparseTensor.verify(r.sparseTensorType);
                if (s) return "sparseTensorType." + s;
              }
            }
            return r.denotation != null && r.hasOwnProperty("denotation") && !g.isString(r.denotation) ? "denotation: string expected" : null;
          }, t.fromObject = function(r) {
            if (r instanceof h2.onnx.TypeProto) return r;
            var n = new h2.onnx.TypeProto();
            if (r.tensorType != null) {
              if (typeof r.tensorType != "object") throw TypeError(".onnx.TypeProto.tensorType: object expected");
              n.tensorType = h2.onnx.TypeProto.Tensor.fromObject(r.tensorType);
            }
            if (r.sequenceType != null) {
              if (typeof r.sequenceType != "object") throw TypeError(".onnx.TypeProto.sequenceType: object expected");
              n.sequenceType = h2.onnx.TypeProto.Sequence.fromObject(r.sequenceType);
            }
            if (r.mapType != null) {
              if (typeof r.mapType != "object") throw TypeError(".onnx.TypeProto.mapType: object expected");
              n.mapType = h2.onnx.TypeProto.Map.fromObject(r.mapType);
            }
            if (r.optionalType != null) {
              if (typeof r.optionalType != "object") throw TypeError(".onnx.TypeProto.optionalType: object expected");
              n.optionalType = h2.onnx.TypeProto.Optional.fromObject(r.optionalType);
            }
            if (r.sparseTensorType != null) {
              if (typeof r.sparseTensorType != "object") throw TypeError(".onnx.TypeProto.sparseTensorType: object expected");
              n.sparseTensorType = h2.onnx.TypeProto.SparseTensor.fromObject(r.sparseTensorType);
            }
            return r.denotation != null && (n.denotation = String(r.denotation)), n;
          }, t.toObject = function(r, n) {
            n || (n = {});
            var s = {};
            return n.defaults && (s.denotation = ""), r.tensorType != null && r.hasOwnProperty("tensorType") && (s.tensorType = h2.onnx.TypeProto.Tensor.toObject(r.tensorType, n), n.oneofs && (s.value = "tensorType")), r.sequenceType != null && r.hasOwnProperty("sequenceType") && (s.sequenceType = h2.onnx.TypeProto.Sequence.toObject(r.sequenceType, n), n.oneofs && (s.value = "sequenceType")), r.mapType != null && r.hasOwnProperty("mapType") && (s.mapType = h2.onnx.TypeProto.Map.toObject(r.mapType, n), n.oneofs && (s.value = "mapType")), r.denotation != null && r.hasOwnProperty("denotation") && (s.denotation = r.denotation), r.sparseTensorType != null && r.hasOwnProperty("sparseTensorType") && (s.sparseTensorType = h2.onnx.TypeProto.SparseTensor.toObject(r.sparseTensorType, n), n.oneofs && (s.value = "sparseTensorType")), r.optionalType != null && r.hasOwnProperty("optionalType") && (s.optionalType = h2.onnx.TypeProto.Optional.toObject(r.optionalType, n), n.oneofs && (s.value = "optionalType")), s;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(r) {
            return r === void 0 && (r = "type.googleapis.com"), r + "/onnx.TypeProto";
          }, t.Tensor = (function() {
            function e(r) {
              if (r) for (var n = Object.keys(r), s = 0; s < n.length; ++s) r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return e.prototype.elemType = 0, e.prototype.shape = null, e.create = function(n) {
              return new e(n);
            }, e.encode = function(n, s) {
              return s || (s = Pe.create()), n.elemType != null && Object.hasOwnProperty.call(n, "elemType") && s.uint32(8).int32(n.elemType), n.shape != null && Object.hasOwnProperty.call(n, "shape") && h2.onnx.TensorShapeProto.encode(n.shape, s.uint32(18).fork()).ldelim(), s;
            }, e.encodeDelimited = function(n, s) {
              return this.encode(n, s).ldelim();
            }, e.decode = function(n, s) {
              n instanceof N2 || (n = N2.create(n));
              for (var i = s === void 0 ? n.len : n.pos + s, u2 = new h2.onnx.TypeProto.Tensor(); n.pos < i; ) {
                var l = n.uint32();
                switch (l >>> 3) {
                  case 1: {
                    u2.elemType = n.int32();
                    break;
                  }
                  case 2: {
                    u2.shape = h2.onnx.TensorShapeProto.decode(n, n.uint32());
                    break;
                  }
                  default:
                    n.skipType(l & 7);
                    break;
                }
              }
              return u2;
            }, e.decodeDelimited = function(n) {
              return n instanceof N2 || (n = new N2(n)), this.decode(n, n.uint32());
            }, e.verify = function(n) {
              if (typeof n != "object" || n === null) return "object expected";
              if (n.elemType != null && n.hasOwnProperty("elemType") && !g.isInteger(n.elemType)) return "elemType: integer expected";
              if (n.shape != null && n.hasOwnProperty("shape")) {
                var s = h2.onnx.TensorShapeProto.verify(n.shape);
                if (s) return "shape." + s;
              }
              return null;
            }, e.fromObject = function(n) {
              if (n instanceof h2.onnx.TypeProto.Tensor) return n;
              var s = new h2.onnx.TypeProto.Tensor();
              if (n.elemType != null && (s.elemType = n.elemType | 0), n.shape != null) {
                if (typeof n.shape != "object") throw TypeError(".onnx.TypeProto.Tensor.shape: object expected");
                s.shape = h2.onnx.TensorShapeProto.fromObject(n.shape);
              }
              return s;
            }, e.toObject = function(n, s) {
              s || (s = {});
              var i = {};
              return s.defaults && (i.elemType = 0, i.shape = null), n.elemType != null && n.hasOwnProperty("elemType") && (i.elemType = n.elemType), n.shape != null && n.hasOwnProperty("shape") && (i.shape = h2.onnx.TensorShapeProto.toObject(n.shape, s)), i;
            }, e.prototype.toJSON = function() {
              return this.constructor.toObject(this, ge.util.toJSONOptions);
            }, e.getTypeUrl = function(n) {
              return n === void 0 && (n = "type.googleapis.com"), n + "/onnx.TypeProto.Tensor";
            }, e;
          })(), t.Sequence = (function() {
            function e(r) {
              if (r) for (var n = Object.keys(r), s = 0; s < n.length; ++s) r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return e.prototype.elemType = null, e.create = function(n) {
              return new e(n);
            }, e.encode = function(n, s) {
              return s || (s = Pe.create()), n.elemType != null && Object.hasOwnProperty.call(n, "elemType") && h2.onnx.TypeProto.encode(n.elemType, s.uint32(10).fork()).ldelim(), s;
            }, e.encodeDelimited = function(n, s) {
              return this.encode(n, s).ldelim();
            }, e.decode = function(n, s) {
              n instanceof N2 || (n = N2.create(n));
              for (var i = s === void 0 ? n.len : n.pos + s, u2 = new h2.onnx.TypeProto.Sequence(); n.pos < i; ) {
                var l = n.uint32();
                switch (l >>> 3) {
                  case 1: {
                    u2.elemType = h2.onnx.TypeProto.decode(n, n.uint32());
                    break;
                  }
                  default:
                    n.skipType(l & 7);
                    break;
                }
              }
              return u2;
            }, e.decodeDelimited = function(n) {
              return n instanceof N2 || (n = new N2(n)), this.decode(n, n.uint32());
            }, e.verify = function(n) {
              if (typeof n != "object" || n === null) return "object expected";
              if (n.elemType != null && n.hasOwnProperty("elemType")) {
                var s = h2.onnx.TypeProto.verify(n.elemType);
                if (s) return "elemType." + s;
              }
              return null;
            }, e.fromObject = function(n) {
              if (n instanceof h2.onnx.TypeProto.Sequence) return n;
              var s = new h2.onnx.TypeProto.Sequence();
              if (n.elemType != null) {
                if (typeof n.elemType != "object") throw TypeError(".onnx.TypeProto.Sequence.elemType: object expected");
                s.elemType = h2.onnx.TypeProto.fromObject(n.elemType);
              }
              return s;
            }, e.toObject = function(n, s) {
              s || (s = {});
              var i = {};
              return s.defaults && (i.elemType = null), n.elemType != null && n.hasOwnProperty("elemType") && (i.elemType = h2.onnx.TypeProto.toObject(n.elemType, s)), i;
            }, e.prototype.toJSON = function() {
              return this.constructor.toObject(this, ge.util.toJSONOptions);
            }, e.getTypeUrl = function(n) {
              return n === void 0 && (n = "type.googleapis.com"), n + "/onnx.TypeProto.Sequence";
            }, e;
          })(), t.Map = (function() {
            function e(r) {
              if (r) for (var n = Object.keys(r), s = 0; s < n.length; ++s) r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return e.prototype.keyType = 0, e.prototype.valueType = null, e.create = function(n) {
              return new e(n);
            }, e.encode = function(n, s) {
              return s || (s = Pe.create()), n.keyType != null && Object.hasOwnProperty.call(n, "keyType") && s.uint32(8).int32(n.keyType), n.valueType != null && Object.hasOwnProperty.call(n, "valueType") && h2.onnx.TypeProto.encode(n.valueType, s.uint32(18).fork()).ldelim(), s;
            }, e.encodeDelimited = function(n, s) {
              return this.encode(n, s).ldelim();
            }, e.decode = function(n, s) {
              n instanceof N2 || (n = N2.create(n));
              for (var i = s === void 0 ? n.len : n.pos + s, u2 = new h2.onnx.TypeProto.Map(); n.pos < i; ) {
                var l = n.uint32();
                switch (l >>> 3) {
                  case 1: {
                    u2.keyType = n.int32();
                    break;
                  }
                  case 2: {
                    u2.valueType = h2.onnx.TypeProto.decode(n, n.uint32());
                    break;
                  }
                  default:
                    n.skipType(l & 7);
                    break;
                }
              }
              return u2;
            }, e.decodeDelimited = function(n) {
              return n instanceof N2 || (n = new N2(n)), this.decode(n, n.uint32());
            }, e.verify = function(n) {
              if (typeof n != "object" || n === null) return "object expected";
              if (n.keyType != null && n.hasOwnProperty("keyType") && !g.isInteger(n.keyType)) return "keyType: integer expected";
              if (n.valueType != null && n.hasOwnProperty("valueType")) {
                var s = h2.onnx.TypeProto.verify(n.valueType);
                if (s) return "valueType." + s;
              }
              return null;
            }, e.fromObject = function(n) {
              if (n instanceof h2.onnx.TypeProto.Map) return n;
              var s = new h2.onnx.TypeProto.Map();
              if (n.keyType != null && (s.keyType = n.keyType | 0), n.valueType != null) {
                if (typeof n.valueType != "object") throw TypeError(".onnx.TypeProto.Map.valueType: object expected");
                s.valueType = h2.onnx.TypeProto.fromObject(n.valueType);
              }
              return s;
            }, e.toObject = function(n, s) {
              s || (s = {});
              var i = {};
              return s.defaults && (i.keyType = 0, i.valueType = null), n.keyType != null && n.hasOwnProperty("keyType") && (i.keyType = n.keyType), n.valueType != null && n.hasOwnProperty("valueType") && (i.valueType = h2.onnx.TypeProto.toObject(n.valueType, s)), i;
            }, e.prototype.toJSON = function() {
              return this.constructor.toObject(this, ge.util.toJSONOptions);
            }, e.getTypeUrl = function(n) {
              return n === void 0 && (n = "type.googleapis.com"), n + "/onnx.TypeProto.Map";
            }, e;
          })(), t.Optional = (function() {
            function e(r) {
              if (r) for (var n = Object.keys(r), s = 0; s < n.length; ++s) r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return e.prototype.elemType = null, e.create = function(n) {
              return new e(n);
            }, e.encode = function(n, s) {
              return s || (s = Pe.create()), n.elemType != null && Object.hasOwnProperty.call(n, "elemType") && h2.onnx.TypeProto.encode(n.elemType, s.uint32(10).fork()).ldelim(), s;
            }, e.encodeDelimited = function(n, s) {
              return this.encode(n, s).ldelim();
            }, e.decode = function(n, s) {
              n instanceof N2 || (n = N2.create(n));
              for (var i = s === void 0 ? n.len : n.pos + s, u2 = new h2.onnx.TypeProto.Optional(); n.pos < i; ) {
                var l = n.uint32();
                switch (l >>> 3) {
                  case 1: {
                    u2.elemType = h2.onnx.TypeProto.decode(n, n.uint32());
                    break;
                  }
                  default:
                    n.skipType(l & 7);
                    break;
                }
              }
              return u2;
            }, e.decodeDelimited = function(n) {
              return n instanceof N2 || (n = new N2(n)), this.decode(n, n.uint32());
            }, e.verify = function(n) {
              if (typeof n != "object" || n === null) return "object expected";
              if (n.elemType != null && n.hasOwnProperty("elemType")) {
                var s = h2.onnx.TypeProto.verify(n.elemType);
                if (s) return "elemType." + s;
              }
              return null;
            }, e.fromObject = function(n) {
              if (n instanceof h2.onnx.TypeProto.Optional) return n;
              var s = new h2.onnx.TypeProto.Optional();
              if (n.elemType != null) {
                if (typeof n.elemType != "object") throw TypeError(".onnx.TypeProto.Optional.elemType: object expected");
                s.elemType = h2.onnx.TypeProto.fromObject(n.elemType);
              }
              return s;
            }, e.toObject = function(n, s) {
              s || (s = {});
              var i = {};
              return s.defaults && (i.elemType = null), n.elemType != null && n.hasOwnProperty("elemType") && (i.elemType = h2.onnx.TypeProto.toObject(n.elemType, s)), i;
            }, e.prototype.toJSON = function() {
              return this.constructor.toObject(this, ge.util.toJSONOptions);
            }, e.getTypeUrl = function(n) {
              return n === void 0 && (n = "type.googleapis.com"), n + "/onnx.TypeProto.Optional";
            }, e;
          })(), t.SparseTensor = (function() {
            function e(r) {
              if (r) for (var n = Object.keys(r), s = 0; s < n.length; ++s) r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return e.prototype.elemType = 0, e.prototype.shape = null, e.create = function(n) {
              return new e(n);
            }, e.encode = function(n, s) {
              return s || (s = Pe.create()), n.elemType != null && Object.hasOwnProperty.call(n, "elemType") && s.uint32(8).int32(n.elemType), n.shape != null && Object.hasOwnProperty.call(n, "shape") && h2.onnx.TensorShapeProto.encode(n.shape, s.uint32(18).fork()).ldelim(), s;
            }, e.encodeDelimited = function(n, s) {
              return this.encode(n, s).ldelim();
            }, e.decode = function(n, s) {
              n instanceof N2 || (n = N2.create(n));
              for (var i = s === void 0 ? n.len : n.pos + s, u2 = new h2.onnx.TypeProto.SparseTensor(); n.pos < i; ) {
                var l = n.uint32();
                switch (l >>> 3) {
                  case 1: {
                    u2.elemType = n.int32();
                    break;
                  }
                  case 2: {
                    u2.shape = h2.onnx.TensorShapeProto.decode(n, n.uint32());
                    break;
                  }
                  default:
                    n.skipType(l & 7);
                    break;
                }
              }
              return u2;
            }, e.decodeDelimited = function(n) {
              return n instanceof N2 || (n = new N2(n)), this.decode(n, n.uint32());
            }, e.verify = function(n) {
              if (typeof n != "object" || n === null) return "object expected";
              if (n.elemType != null && n.hasOwnProperty("elemType") && !g.isInteger(n.elemType)) return "elemType: integer expected";
              if (n.shape != null && n.hasOwnProperty("shape")) {
                var s = h2.onnx.TensorShapeProto.verify(n.shape);
                if (s) return "shape." + s;
              }
              return null;
            }, e.fromObject = function(n) {
              if (n instanceof h2.onnx.TypeProto.SparseTensor) return n;
              var s = new h2.onnx.TypeProto.SparseTensor();
              if (n.elemType != null && (s.elemType = n.elemType | 0), n.shape != null) {
                if (typeof n.shape != "object") throw TypeError(".onnx.TypeProto.SparseTensor.shape: object expected");
                s.shape = h2.onnx.TensorShapeProto.fromObject(n.shape);
              }
              return s;
            }, e.toObject = function(n, s) {
              s || (s = {});
              var i = {};
              return s.defaults && (i.elemType = 0, i.shape = null), n.elemType != null && n.hasOwnProperty("elemType") && (i.elemType = n.elemType), n.shape != null && n.hasOwnProperty("shape") && (i.shape = h2.onnx.TensorShapeProto.toObject(n.shape, s)), i;
            }, e.prototype.toJSON = function() {
              return this.constructor.toObject(this, ge.util.toJSONOptions);
            }, e.getTypeUrl = function(n) {
              return n === void 0 && (n = "type.googleapis.com"), n + "/onnx.TypeProto.SparseTensor";
            }, e;
          })(), t;
        })(), a.OperatorSetIdProto = (function() {
          function t(o) {
            if (o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.domain = "", t.prototype.version = g.Long ? g.Long.fromBits(0, 0, false) : 0, t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            return r || (r = Pe.create()), e.domain != null && Object.hasOwnProperty.call(e, "domain") && r.uint32(10).string(e.domain), e.version != null && Object.hasOwnProperty.call(e, "version") && r.uint32(16).int64(e.version), r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.OperatorSetIdProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.domain = e.string();
                  break;
                }
                case 2: {
                  s.version = e.int64();
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            return typeof e != "object" || e === null ? "object expected" : e.domain != null && e.hasOwnProperty("domain") && !g.isString(e.domain) ? "domain: string expected" : e.version != null && e.hasOwnProperty("version") && !g.isInteger(e.version) && !(e.version && g.isInteger(e.version.low) && g.isInteger(e.version.high)) ? "version: integer|Long expected" : null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.OperatorSetIdProto) return e;
            var r = new h2.onnx.OperatorSetIdProto();
            return e.domain != null && (r.domain = String(e.domain)), e.version != null && (g.Long ? (r.version = g.Long.fromValue(e.version)).unsigned = false : typeof e.version == "string" ? r.version = parseInt(e.version, 10) : typeof e.version == "number" ? r.version = e.version : typeof e.version == "object" && (r.version = new g.LongBits(e.version.low >>> 0, e.version.high >>> 0).toNumber())), r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if (r.defaults) if (n.domain = "", g.Long) {
              var s = new g.Long(0, 0, false);
              n.version = r.longs === String ? s.toString() : r.longs === Number ? s.toNumber() : s;
            } else n.version = r.longs === String ? "0" : 0;
            return e.domain != null && e.hasOwnProperty("domain") && (n.domain = e.domain), e.version != null && e.hasOwnProperty("version") && (typeof e.version == "number" ? n.version = r.longs === String ? String(e.version) : e.version : n.version = r.longs === String ? g.Long.prototype.toString.call(e.version) : r.longs === Number ? new g.LongBits(e.version.low >>> 0, e.version.high >>> 0).toNumber() : e.version), n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.OperatorSetIdProto";
          }, t;
        })(), a.OperatorStatus = (function() {
          var t = {}, o = Object.create(t);
          return o[t[0] = "EXPERIMENTAL"] = 0, o[t[1] = "STABLE"] = 1, o;
        })(), a.FunctionProto = (function() {
          function t(o) {
            if (this.input = [], this.output = [], this.attribute = [], this.attributeProto = [], this.node = [], this.opsetImport = [], o) for (var e = Object.keys(o), r = 0; r < e.length; ++r) o[e[r]] != null && (this[e[r]] = o[e[r]]);
          }
          return t.prototype.name = "", t.prototype.input = g.emptyArray, t.prototype.output = g.emptyArray, t.prototype.attribute = g.emptyArray, t.prototype.attributeProto = g.emptyArray, t.prototype.node = g.emptyArray, t.prototype.docString = "", t.prototype.opsetImport = g.emptyArray, t.prototype.domain = "", t.create = function(e) {
            return new t(e);
          }, t.encode = function(e, r) {
            if (r || (r = Pe.create()), e.name != null && Object.hasOwnProperty.call(e, "name") && r.uint32(10).string(e.name), e.input != null && e.input.length) for (var n = 0; n < e.input.length; ++n) r.uint32(34).string(e.input[n]);
            if (e.output != null && e.output.length) for (var n = 0; n < e.output.length; ++n) r.uint32(42).string(e.output[n]);
            if (e.attribute != null && e.attribute.length) for (var n = 0; n < e.attribute.length; ++n) r.uint32(50).string(e.attribute[n]);
            if (e.node != null && e.node.length) for (var n = 0; n < e.node.length; ++n) h2.onnx.NodeProto.encode(e.node[n], r.uint32(58).fork()).ldelim();
            if (e.docString != null && Object.hasOwnProperty.call(e, "docString") && r.uint32(66).string(e.docString), e.opsetImport != null && e.opsetImport.length) for (var n = 0; n < e.opsetImport.length; ++n) h2.onnx.OperatorSetIdProto.encode(e.opsetImport[n], r.uint32(74).fork()).ldelim();
            if (e.domain != null && Object.hasOwnProperty.call(e, "domain") && r.uint32(82).string(e.domain), e.attributeProto != null && e.attributeProto.length) for (var n = 0; n < e.attributeProto.length; ++n) h2.onnx.AttributeProto.encode(e.attributeProto[n], r.uint32(90).fork()).ldelim();
            return r;
          }, t.encodeDelimited = function(e, r) {
            return this.encode(e, r).ldelim();
          }, t.decode = function(e, r) {
            e instanceof N2 || (e = N2.create(e));
            for (var n = r === void 0 ? e.len : e.pos + r, s = new h2.onnx.FunctionProto(); e.pos < n; ) {
              var i = e.uint32();
              switch (i >>> 3) {
                case 1: {
                  s.name = e.string();
                  break;
                }
                case 4: {
                  s.input && s.input.length || (s.input = []), s.input.push(e.string());
                  break;
                }
                case 5: {
                  s.output && s.output.length || (s.output = []), s.output.push(e.string());
                  break;
                }
                case 6: {
                  s.attribute && s.attribute.length || (s.attribute = []), s.attribute.push(e.string());
                  break;
                }
                case 11: {
                  s.attributeProto && s.attributeProto.length || (s.attributeProto = []), s.attributeProto.push(h2.onnx.AttributeProto.decode(e, e.uint32()));
                  break;
                }
                case 7: {
                  s.node && s.node.length || (s.node = []), s.node.push(h2.onnx.NodeProto.decode(e, e.uint32()));
                  break;
                }
                case 8: {
                  s.docString = e.string();
                  break;
                }
                case 9: {
                  s.opsetImport && s.opsetImport.length || (s.opsetImport = []), s.opsetImport.push(h2.onnx.OperatorSetIdProto.decode(e, e.uint32()));
                  break;
                }
                case 10: {
                  s.domain = e.string();
                  break;
                }
                default:
                  e.skipType(i & 7);
                  break;
              }
            }
            return s;
          }, t.decodeDelimited = function(e) {
            return e instanceof N2 || (e = new N2(e)), this.decode(e, e.uint32());
          }, t.verify = function(e) {
            if (typeof e != "object" || e === null) return "object expected";
            if (e.name != null && e.hasOwnProperty("name") && !g.isString(e.name)) return "name: string expected";
            if (e.input != null && e.hasOwnProperty("input")) {
              if (!Array.isArray(e.input)) return "input: array expected";
              for (var r = 0; r < e.input.length; ++r) if (!g.isString(e.input[r])) return "input: string[] expected";
            }
            if (e.output != null && e.hasOwnProperty("output")) {
              if (!Array.isArray(e.output)) return "output: array expected";
              for (var r = 0; r < e.output.length; ++r) if (!g.isString(e.output[r])) return "output: string[] expected";
            }
            if (e.attribute != null && e.hasOwnProperty("attribute")) {
              if (!Array.isArray(e.attribute)) return "attribute: array expected";
              for (var r = 0; r < e.attribute.length; ++r) if (!g.isString(e.attribute[r])) return "attribute: string[] expected";
            }
            if (e.attributeProto != null && e.hasOwnProperty("attributeProto")) {
              if (!Array.isArray(e.attributeProto)) return "attributeProto: array expected";
              for (var r = 0; r < e.attributeProto.length; ++r) {
                var n = h2.onnx.AttributeProto.verify(e.attributeProto[r]);
                if (n) return "attributeProto." + n;
              }
            }
            if (e.node != null && e.hasOwnProperty("node")) {
              if (!Array.isArray(e.node)) return "node: array expected";
              for (var r = 0; r < e.node.length; ++r) {
                var n = h2.onnx.NodeProto.verify(e.node[r]);
                if (n) return "node." + n;
              }
            }
            if (e.docString != null && e.hasOwnProperty("docString") && !g.isString(e.docString)) return "docString: string expected";
            if (e.opsetImport != null && e.hasOwnProperty("opsetImport")) {
              if (!Array.isArray(e.opsetImport)) return "opsetImport: array expected";
              for (var r = 0; r < e.opsetImport.length; ++r) {
                var n = h2.onnx.OperatorSetIdProto.verify(e.opsetImport[r]);
                if (n) return "opsetImport." + n;
              }
            }
            return e.domain != null && e.hasOwnProperty("domain") && !g.isString(e.domain) ? "domain: string expected" : null;
          }, t.fromObject = function(e) {
            if (e instanceof h2.onnx.FunctionProto) return e;
            var r = new h2.onnx.FunctionProto();
            if (e.name != null && (r.name = String(e.name)), e.input) {
              if (!Array.isArray(e.input)) throw TypeError(".onnx.FunctionProto.input: array expected");
              r.input = [];
              for (var n = 0; n < e.input.length; ++n) r.input[n] = String(e.input[n]);
            }
            if (e.output) {
              if (!Array.isArray(e.output)) throw TypeError(".onnx.FunctionProto.output: array expected");
              r.output = [];
              for (var n = 0; n < e.output.length; ++n) r.output[n] = String(e.output[n]);
            }
            if (e.attribute) {
              if (!Array.isArray(e.attribute)) throw TypeError(".onnx.FunctionProto.attribute: array expected");
              r.attribute = [];
              for (var n = 0; n < e.attribute.length; ++n) r.attribute[n] = String(e.attribute[n]);
            }
            if (e.attributeProto) {
              if (!Array.isArray(e.attributeProto)) throw TypeError(".onnx.FunctionProto.attributeProto: array expected");
              r.attributeProto = [];
              for (var n = 0; n < e.attributeProto.length; ++n) {
                if (typeof e.attributeProto[n] != "object") throw TypeError(".onnx.FunctionProto.attributeProto: object expected");
                r.attributeProto[n] = h2.onnx.AttributeProto.fromObject(e.attributeProto[n]);
              }
            }
            if (e.node) {
              if (!Array.isArray(e.node)) throw TypeError(".onnx.FunctionProto.node: array expected");
              r.node = [];
              for (var n = 0; n < e.node.length; ++n) {
                if (typeof e.node[n] != "object") throw TypeError(".onnx.FunctionProto.node: object expected");
                r.node[n] = h2.onnx.NodeProto.fromObject(e.node[n]);
              }
            }
            if (e.docString != null && (r.docString = String(e.docString)), e.opsetImport) {
              if (!Array.isArray(e.opsetImport)) throw TypeError(".onnx.FunctionProto.opsetImport: array expected");
              r.opsetImport = [];
              for (var n = 0; n < e.opsetImport.length; ++n) {
                if (typeof e.opsetImport[n] != "object") throw TypeError(".onnx.FunctionProto.opsetImport: object expected");
                r.opsetImport[n] = h2.onnx.OperatorSetIdProto.fromObject(e.opsetImport[n]);
              }
            }
            return e.domain != null && (r.domain = String(e.domain)), r;
          }, t.toObject = function(e, r) {
            r || (r = {});
            var n = {};
            if ((r.arrays || r.defaults) && (n.input = [], n.output = [], n.attribute = [], n.node = [], n.opsetImport = [], n.attributeProto = []), r.defaults && (n.name = "", n.docString = "", n.domain = ""), e.name != null && e.hasOwnProperty("name") && (n.name = e.name), e.input && e.input.length) {
              n.input = [];
              for (var s = 0; s < e.input.length; ++s) n.input[s] = e.input[s];
            }
            if (e.output && e.output.length) {
              n.output = [];
              for (var s = 0; s < e.output.length; ++s) n.output[s] = e.output[s];
            }
            if (e.attribute && e.attribute.length) {
              n.attribute = [];
              for (var s = 0; s < e.attribute.length; ++s) n.attribute[s] = e.attribute[s];
            }
            if (e.node && e.node.length) {
              n.node = [];
              for (var s = 0; s < e.node.length; ++s) n.node[s] = h2.onnx.NodeProto.toObject(e.node[s], r);
            }
            if (e.docString != null && e.hasOwnProperty("docString") && (n.docString = e.docString), e.opsetImport && e.opsetImport.length) {
              n.opsetImport = [];
              for (var s = 0; s < e.opsetImport.length; ++s) n.opsetImport[s] = h2.onnx.OperatorSetIdProto.toObject(e.opsetImport[s], r);
            }
            if (e.domain != null && e.hasOwnProperty("domain") && (n.domain = e.domain), e.attributeProto && e.attributeProto.length) {
              n.attributeProto = [];
              for (var s = 0; s < e.attributeProto.length; ++s) n.attributeProto[s] = h2.onnx.AttributeProto.toObject(e.attributeProto[s], r);
            }
            return n;
          }, t.prototype.toJSON = function() {
            return this.constructor.toObject(this, ge.util.toJSONOptions);
          }, t.getTypeUrl = function(e) {
            return e === void 0 && (e = "type.googleapis.com"), e + "/onnx.FunctionProto";
          }, t;
        })(), a;
      })();
      Cu.exports = h2;
    });
    fe = L(() => {
      "use strict";
      zn();
      Zo();
      ye = Ar(Cr());
      yr();
      hr = class {
        static arraysEqual(t, o) {
          if (t.length !== o.length) return false;
          for (let e = 0; e < t.length; e++) if (t[e] !== o[e]) return false;
          return true;
        }
      }, pi = class {
        static preprocessInputShapes(t, o) {
          let e = t.length === 1 ? [1, t[0]] : t, r = o.length === 1 ? [o[0], 1] : o;
          return [e, r];
        }
        static postprocessOutputShape(t, o, e) {
          o === 1 && t.splice(t.length - 2, 1), e === 1 && t.pop();
        }
        static calcMatMulShape(t, o) {
          return t[1] !== o[0] ? void 0 : [t[0], o[1]];
        }
      }, Ze = class a {
        static calcShape(t, o, e = false) {
          let r = t.length, n = o.length;
          if (r === 0) return o;
          if (n === 0) return t;
          let s = Math.max(t.length, o.length), i = new Array(s);
          if (e) {
            if (r < 2 || n < 2) return;
            let u2 = pi.calcMatMulShape([t[r - 2], t[r - 1]], [o[n - 2], o[n - 1]]);
            if (u2 === void 0) return;
            [i[s - 2], i[s - 1]] = u2;
          }
          for (let u2 = e ? 3 : 1; u2 <= s; u2++) {
            let l = r - u2 < 0 ? 1 : t[r - u2], c2 = n - u2 < 0 ? 1 : o[n - u2];
            if (l !== c2 && l > 1 && c2 > 1) return;
            i[s - u2] = Math.max(l, c2);
          }
          return i;
        }
        static index(t, o) {
          let e = new Array(o.length);
          return a.fillIndex(t, o, e), e;
        }
        static fillIndex(t, o, e) {
          let r = t.length - o.length;
          for (let n = 0; n < o.length; n++) e[n] = t[r + n] % o[n];
        }
        static calc(t, o, e, r, n) {
          let s = a.calcShape(t.dims, o.dims);
          if (s) {
            if (r && !U.areEqual(s, t.dims)) return;
            let i = U.size(s), u2 = r ? t : new $e(s, n || t.type);
            if (s.length === 0) u2.set([], e(t.get([]), o.get([])));
            else {
              let l = new Array(s.length), c2 = new Array(t.dims.length), p2 = new Array(o.dims.length), d = 0, T = 0, w = false, v = false;
              t.dims.length === 0 && (d = t.get([]), w = true), o.dims.length === 0 && (T = o.get([]), v = true);
              let S2;
              for (let A = 0; A < i; A++) {
                S2 = A;
                for (let C = s.length - 1; C >= 0; C--) l[C] = S2 % s[C], S2 = Math.floor(S2 / s[C]);
                w || (a.fillIndex(l, t.dims, c2), d = t.get(c2)), v || (a.fillIndex(l, o.dims, p2), T = o.get(p2)), u2.set(l, e(d, T));
              }
            }
            return u2;
          }
        }
        static isValidBroadcast(t, o) {
          let e = t.length, r = o.length;
          if (e > r) return false;
          for (let n = 1; n <= e; n++) if (t[e - n] !== 1 && t[e - n] !== o[r - n]) return false;
          return true;
        }
        static getBroadcastDims(t, o) {
          let e = t.length, r = [];
          for (let n = 0; n < e; n++) {
            let s = e - 1 - n, i = t[s] || 1;
            (o[o.length - 1 - n] || 1) > 1 && i === 1 && r.unshift(s);
          }
          return r;
        }
      }, jn = class {
        static getShapeOfGemmResult(t, o, e, r, n) {
          if (t.length !== 2 || e.length !== 2) throw new Error("shape need to be of size 2");
          let s, i, u2;
          o ? (s = t[1], i = t[0]) : (s = t[0], i = t[1]);
          let l = -1;
          if (r ? (u2 = e[0], l = 1) : (u2 = e[1], l = 0), e[l] !== i) throw new Error("dimension mismatch");
          if (s <= 0 || u2 <= 0 || i <= 0) throw new Error("invalid shape specified");
          if (n && !Ze.isValidBroadcast(n, [s, u2])) throw new Error("gemm: invalid bias shape for broadcast");
          return [s, u2, i];
        }
      }, We = class a {
        static tensorDataTypeFromProto(t) {
          switch (t) {
            case ye.onnx.TensorProto.DataType.INT8:
              return "int8";
            case ye.onnx.TensorProto.DataType.UINT8:
              return "uint8";
            case ye.onnx.TensorProto.DataType.BOOL:
              return "bool";
            case ye.onnx.TensorProto.DataType.INT16:
              return "int16";
            case ye.onnx.TensorProto.DataType.UINT16:
              return "uint16";
            case ye.onnx.TensorProto.DataType.INT32:
              return "int32";
            case ye.onnx.TensorProto.DataType.UINT32:
              return "uint32";
            case ye.onnx.TensorProto.DataType.FLOAT:
              return "float32";
            case ye.onnx.TensorProto.DataType.DOUBLE:
              return "float64";
            case ye.onnx.TensorProto.DataType.STRING:
              return "string";
            case ye.onnx.TensorProto.DataType.INT64:
              return "int32";
            case ye.onnx.TensorProto.DataType.UINT64:
              return "uint32";
            default:
              throw new Error(`unsupported data type: ${ye.onnx.TensorProto.DataType[t]}`);
          }
        }
        static tensorDataTypeStringToEnum(t) {
          switch (t) {
            case "int8":
              return ye.onnx.TensorProto.DataType.INT8;
            case "uint8":
              return ye.onnx.TensorProto.DataType.UINT8;
            case "bool":
              return ye.onnx.TensorProto.DataType.BOOL;
            case "int16":
              return ye.onnx.TensorProto.DataType.INT16;
            case "uint16":
              return ye.onnx.TensorProto.DataType.UINT16;
            case "int32":
              return ye.onnx.TensorProto.DataType.INT32;
            case "uint32":
              return ye.onnx.TensorProto.DataType.UINT32;
            case "float32":
              return ye.onnx.TensorProto.DataType.FLOAT;
            case "float64":
              return ye.onnx.TensorProto.DataType.DOUBLE;
            case "string":
              return ye.onnx.TensorProto.DataType.STRING;
            case "int64":
              return ye.onnx.TensorProto.DataType.INT64;
            case "uint64":
              return ye.onnx.TensorProto.DataType.UINT64;
            default:
              throw new Error(`unsupported data type: ${t}`);
          }
        }
        static tensorDimsFromProto(t) {
          return t.map((o) => Vt.isLong(o) ? o.toNumber() : o);
        }
        static tensorValueTypeFromProto(t) {
          return { tensorType: a.tensorDataTypeFromProto(t.elemType), shape: { dims: a.tensorDimsFromProto(t.shape.dim.map((o) => o.dimValue)) } };
        }
        static tensorDimsFromORTFormat(t) {
          let o = [];
          for (let e = 0; e < t.dimsLength(); e++) o.push(it.longToNumber(t.dims(e)));
          return o;
        }
        static tensorAttributesFromORTFormat(t) {
          let o = [];
          for (let e = 0; e < t.attributesLength(); e++) o.push(t.attributes(e));
          return o;
        }
      }, it = class {
        static longToNumber(t, o) {
          return Vt.isLong(t) ? t.toNumber() : t instanceof _.Long ? Vt.fromValue({ low: t.low, high: t.high, unsigned: o ?? false }).toNumber() : t;
        }
        static isLong(t) {
          return Vt.isLong(t) || t instanceof _.Long;
        }
      }, U = class a {
        static size(t) {
          return a.getSizeFromDimensionRange(t, 0, t.length);
        }
        static sizeFromDimension(t, o) {
          if (o < 0 || o > t.length) throw new Error(`invalid dimension of ${o} for sizeFromDimension as Tensor has ${t.length} dimensions.`);
          return a.getSizeFromDimensionRange(t, o, t.length);
        }
        static sizeToDimension(t, o) {
          if (o < 0 || o > t.length) throw new Error(`invalid dimension of ${o} for sizeToDimension as Tensor has ${t.length} dimensions.`);
          return a.getSizeFromDimensionRange(t, 0, o);
        }
        static getSizeFromDimensionRange(t, o, e) {
          let r = 1;
          for (let n = o; n < e; n++) {
            if (t[n] <= 0) throw new Error("cannot get valid size from specified dimension range. Most likely the range contains 0 or negative values in them.");
            r *= t[n];
          }
          return r;
        }
        static computeStrides(t) {
          let o = t.length;
          if (o === 0) return [];
          if (o === 1) return [1];
          let e = new Array(o);
          e[o - 1] = 1, e[o - 2] = t[o - 1];
          for (let r = o - 3; r >= 0; --r) e[r] = e[r + 1] * t[r + 1];
          return e;
        }
        static transpose(t) {
          return t.slice().reverse();
        }
        static indicesToOffset(t, o, e) {
          e === void 0 && (e = t.length);
          let r = 0;
          for (let n = 0; n < e; ++n) r += o[n] * t[n];
          return r;
        }
        static offsetToIndices(t, o) {
          let e = o.length;
          if (e === 0) return [];
          if (e === 1) return [t * o[0]];
          let r = new Array(o.length);
          for (let n = 0; n < r.length - 1; ++n) r[n] = Math.floor(t / o[n]), t -= r[n] * o[n];
          return r[r.length - 1] = t, r;
        }
        static normalizeAxis(t, o) {
          if (t < -o && t >= o) throw new Error("unsupported axis for this operation.");
          return t < 0 ? t + o : t;
        }
        static normalizeAxes(t, o) {
          return t.map((e) => this.normalizeAxis(e, o));
        }
        static incrementIndex(t, o, e) {
          if (o.length === 0 || t.length === 0) throw new Error("Index incrementing unsupported for scalar Tensor");
          if (e === void 0) e = o.length;
          else if (e <= 0 || e > o.length) throw new Error("Incorrect axis to increment on");
          for (let r = e - 1; r >= 0 && (t[r]++, !(t[r] < o[r])); --r) t[r] = 0;
        }
        static calculateReshapedDims(t, o) {
          if (o.length === 0) {
            if (t.length === 0 || a.size(t) === 1) return [];
            throw new Error("cannot reshape to a scalar Tensor");
          }
          let e = o.length, r = new Array(e), n = -1, s = 1;
          for (let u2 = 0; u2 < e; u2++) {
            if (o[u2] < -1) throw new Error("a dimension in shape hints cannot be less than -1");
            if (o[u2] === -1) {
              if (n !== -1) throw new Error("at most one dimension in shape hints can be -1");
              n = u2;
            } else {
              if (o[u2] === 0) {
                if (u2 >= t.length) throw new Error("the dimension with value zero exceeds the dimension size of the input tensor");
                r[u2] = t[u2];
              } else r[u2] = o[u2];
              s *= r[u2];
            }
          }
          let i = a.size(t);
          if (n !== -1) {
            if (i % s !== 0) throw new Error(`the input tensor cannot be reshaped to the requested shape. Input shape: [${t}] Output shape: [${o}]`);
            r[n] = i / s;
          } else if (s !== i) throw new Error("reshapedDims and originalDims don't have matching sizes");
          return r;
        }
        static sortBasedOnPerm(t, o) {
          return o ? o.map((e) => t[e]) : t.slice().reverse();
        }
        static padShape(t, o) {
          let e = t.length;
          return t.map((r, n) => r + o[n] + o[n + e]);
        }
        static areEqual(t, o) {
          return t.length !== o.length ? false : t.every((e, r) => e === o[r]);
        }
        static validateDimsAndCalcSize(t) {
          if (t.length > 6) throw new TypeError("Only rank 0 to 6 is supported for tensor shape.");
          let o = 1;
          for (let e of t) {
            if (!Number.isInteger(e)) throw new TypeError(`Invalid shape: ${e} is not an integer`);
            if (e < 0 || e > 2147483647) throw new TypeError(`Invalid shape: length ${e} is not allowed`);
            o *= e;
          }
          return o;
        }
        static flattenShape(t, o) {
          o < 0 && (o += t.length);
          let e = t.reduce((s, i) => s * i, 1), r = t.slice(o).reduce((s, i) => s * i, 1);
          return [e / r, r];
        }
        static squeezeShape(t, o) {
          let e = new Array();
          o = a.normalizeAxes(o, t.length);
          for (let r = 0; r < t.length; r++) {
            let n = o.indexOf(r) >= 0;
            if (n && t[r] !== 1) throw new Error("squeeze an axis of size different than 1");
            (o.length === 0 && t[r] > 1 || o.length > 0 && !n) && e.push(t[r]);
          }
          return e;
        }
        static unsqueezeShape(t, o) {
          let e = new Array(t.length + o.length);
          e.fill(0);
          for (let n = 0; n < o.length; n++) {
            let s = a.normalizeAxis(o[n], e.length);
            if (s >= e.length) throw new Error("'axes' has an out of range axis");
            if (e[s] !== 0) throw new Error("'axes' has a duplicate axis");
            e[s] = 1;
          }
          let r = 0;
          for (let n = 0; n < e.length; n++) e[n] === 0 && (e[n] = t[r++]);
          if (r !== t.length) throw new Error("the unsqueezed dimension could not be established");
          return e;
        }
      }, an = class a {
        static splitShape(t, o, e, r) {
          if (e.length === 0) {
            if (!r) throw new Error("need to know number of outputs when the 'split' attribute is not specified");
            a.determineSplit(t[o], r, e);
          }
          let n = [], s = [0];
          for (let i = 0; i < e.length; ++i) {
            i !== 0 && s.push(s[i - 1] + e[i - 1]);
            let u2 = t.slice();
            u2[o] = e[i], n.push(u2);
          }
          return [n, s];
        }
        static determineSplit(t, o, e) {
          if (t % o !== 0) throw new Error("cannot split tensor to equal sized parts");
          for (let r = 0; r < o; ++r) e.push(t / o);
        }
      }, mr = class a {
        static adjustPoolAttributes(t, o, e, r, n, s) {
          if (!t && e.length !== o.length - 2) throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");
          if (t) for (let i = 0; i < o.length - 2; i++) i >= e.length ? e.push(o[i + 2]) : e[i] = o[i + 2];
          for (let i = 0; i < e.length; i++) if (i < r.length) {
            if (r[i] < 0) throw new Error("strides should be greater than or equal to 1");
          } else r.push(1);
          for (let i = 0; i < e.length; i++) if (i < n.length) {
            if (n[i] < 0) throw new Error("dilations should be greater than or equal to 1");
          } else n.push(1);
          for (let i = 0; i < e.length * 2; i++) if (i < s.length) {
            if (s[i] < 0) throw new Error("pad should be greater than or equal to 1");
          } else s.push(0);
          for (let i = 0; i < e.length; i++) {
            if (e[i] <= 0) throw new Error("kernel shapes need to be greater than 0");
            if (s[i] >= e[i] || s[i + e.length] >= e[i]) throw new Error("pads should be smaller than kernel");
          }
        }
        static adjustPadsBasedOnAutoPad(t, o, e, r, n, s) {
          if (s) {
            if (n.length !== 2 * (t.length - 2)) throw new Error("length of pads should be twice the length of data dimensions");
            if (o.length !== t.length - 2) throw new Error("length of strides should be the length of data dimensions");
            if (r.length !== t.length - 2) throw new Error("length of kernel shapes should be the length of data dimensions");
            for (let i = 0; i < t.length - 2; i++) a.adjustPadAndReturnShape(t[i + 2], o[i], e[i], r[i], n, i, i + t.length - 2, s);
          }
        }
        static computePoolOutputShape(t, o, e, r, n, s, i) {
          if (o.length <= 0) throw new Error("input shape must be of size greater than 0");
          let u2 = [o[0], o[1]];
          return a.computeShapeHelper(t, o, u2, e, r, n, s, i), u2;
        }
        static computeConvOutputShape(t, o, e, r, n, s, i) {
          if (t.length <= 0 || o.length <= 0) throw new Error("invalid input tensor dims or invalid filter tensor dims");
          let u2 = [t[0], o[0]];
          return a.computeShapeHelper(false, t, u2, e, r, n, s, i), u2;
        }
        static computeShapeHelper(t, o, e, r, n, s, i, u2) {
          if (t) for (let l = 0; l < o.length - 2; l++) e.push(1);
          else for (let l = 0; l < o.length - 2; l++) e.push(a.adjustPadAndReturnShape(o[l + 2], r[l], n[l], s[l], i, l, l + o.length - 2, u2));
        }
        static adjustPadAndReturnShape(t, o, e, r, n, s, i, u2) {
          let l = e * (r - 1) + 1;
          if (u2 && u2 !== "NOTSET") switch (u2) {
            case "VALID":
              return n[s] = 0, n[i] = 0, Math.floor((t - l) / o + 1);
            case "SAME_LOWER":
            case "SAME_UPPER":
              if (e !== 1) throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");
              {
                let p2 = ((t + o - 1) / o - 1) * o + r - t;
                return n[s] = Math.floor(u2 === "SAME_LOWER" ? (p2 + 1) / 2 : p2 / 2), n[i] = p2 - n[s], Math.floor((t + p2 - r) / o + 1);
              }
            default:
              throw new Error("Unsupported AutoPad type");
          }
          else return Math.floor((t + n[s] + n[i] - l) / o + 1);
        }
      }, br = -34028234663852886e22, gr = 34028234663852886e22;
    });
    yr = L(() => {
      "use strict";
      ku = Ar(Os());
      Zo();
      tn();
      ne = Ar(Cr());
      fe();
      di = V.experimental.fbs, $e = class a {
        constructor(t, o, e, r, n, s = ku.Guid.create()) {
          this.dims = t;
          this.type = o;
          this.dataProvider = e;
          this.asyncDataProvider = r;
          this.cache = n;
          this.dataId = s;
          this.size = U.validateDimsAndCalcSize(t);
          let i = this.size, u2 = e === void 0 && r === void 0 && n === void 0;
          if (n !== void 0 && n.length !== i) throw new RangeError("Input dims doesn't match data length.");
          if (o === "string") {
            if (n !== void 0 && (!Array.isArray(n) || !n.every((l) => typeof l == "string"))) throw new TypeError("cache should be a string array");
            u2 && (this.cache = new Array(i));
          } else {
            if (n !== void 0) {
              let l = Bu(o);
              if (!(n instanceof l)) throw new TypeError(`cache should be type ${l.name}`);
            }
            if (u2) {
              let l = new ArrayBuffer(i * Hd(o));
              this.cache = qd(l, o);
            }
          }
        }
        get data() {
          if (this.cache === void 0) {
            let t = this.dataProvider(this.dataId);
            if (t.length !== this.size) throw new Error("Length of data provided by the Data Provider is inconsistent with the dims of this Tensor.");
            this.cache = t;
          }
          return this.cache;
        }
        get stringData() {
          if (this.type !== "string") throw new TypeError("data type is not string");
          return this.data;
        }
        get integerData() {
          switch (this.type) {
            case "uint8":
            case "int8":
            case "uint16":
            case "int16":
            case "int32":
            case "uint32":
            case "bool":
              return this.data;
            default:
              throw new TypeError("data type is not integer (uint8, int8, uint16, int16, int32, uint32, bool)");
          }
        }
        get floatData() {
          switch (this.type) {
            case "float32":
            case "float64":
              return this.data;
            default:
              throw new TypeError("data type is not float (float32, float64)");
          }
        }
        get numberData() {
          if (this.type !== "string") return this.data;
          throw new TypeError("type cannot be non-number (string)");
        }
        get(t) {
          return this.data[U.indicesToOffset(t, this.strides)];
        }
        set(t, o) {
          this.data[U.indicesToOffset(t, this.strides)] = o;
        }
        async getData() {
          return this.cache === void 0 && (this.cache = await this.asyncDataProvider(this.dataId)), this.cache;
        }
        get strides() {
          return this._strides || (this._strides = U.computeStrides(this.dims)), this._strides;
        }
        static fromProto(t) {
          if (!t) throw new Error("cannot construct Value from an empty tensor");
          let o = We.tensorDataTypeFromProto(t.dataType), e = We.tensorDimsFromProto(t.dims), r = new a(e, o);
          if (o === "string") t.stringData.forEach((n, s) => {
            r.data[s] = sn(n);
          });
          else if (t.rawData && typeof t.rawData.byteLength == "number" && t.rawData.byteLength > 0) {
            let n = r.data, s = new DataView(t.rawData.buffer, t.rawData.byteOffset, t.rawData.byteLength), i = Fu(t.dataType), u2 = t.rawData.byteLength / i;
            if (t.rawData.byteLength % i !== 0) throw new Error("invalid buffer length");
            if (n.length !== u2) throw new Error("buffer length mismatch");
            for (let l = 0; l < u2; l++) {
              let c2 = $u(s, t.dataType, l * i);
              n[l] = c2;
            }
          } else {
            let n;
            switch (t.dataType) {
              case ne.onnx.TensorProto.DataType.FLOAT:
                n = t.floatData;
                break;
              case ne.onnx.TensorProto.DataType.INT32:
              case ne.onnx.TensorProto.DataType.INT16:
              case ne.onnx.TensorProto.DataType.UINT16:
              case ne.onnx.TensorProto.DataType.INT8:
              case ne.onnx.TensorProto.DataType.UINT8:
              case ne.onnx.TensorProto.DataType.BOOL:
                n = t.int32Data;
                break;
              case ne.onnx.TensorProto.DataType.INT64:
                n = t.int64Data;
                break;
              case ne.onnx.TensorProto.DataType.DOUBLE:
                n = t.doubleData;
                break;
              case ne.onnx.TensorProto.DataType.UINT32:
              case ne.onnx.TensorProto.DataType.UINT64:
                n = t.uint64Data;
                break;
              default:
                throw new Error("unspecific error");
            }
            if (n == null) throw new Error("failed to populate data from a tensorproto value");
            let s = r.data;
            if (s.length !== n.length) throw new Error("array length mismatch");
            for (let i = 0; i < n.length; i++) {
              let u2 = n[i];
              Vt.isLong(u2) ? s[i] = hi(u2, t.dataType) : s[i] = u2;
            }
          }
          return r;
        }
        static fromData(t, o, e) {
          return new a(o, e, void 0, void 0, t);
        }
        static fromOrtTensor(t) {
          if (!t) throw new Error("cannot construct Value from an empty tensor");
          let o = We.tensorDimsFromORTFormat(t), e = We.tensorDataTypeFromProto(t.dataType()), r = new a(o, e);
          if (e === "string") for (let n = 0; n < t.stringDataLength(); n++) r.data[n] = t.stringData(n);
          else if (t.rawDataArray() && typeof t.rawDataLength() == "number" && t.rawDataLength() > 0) {
            let n = r.data, s = new DataView(t.rawDataArray().buffer, t.rawDataArray().byteOffset, t.rawDataLength()), i = Fu(t.dataType()), u2 = t.rawDataLength() / i;
            if (t.rawDataLength() % i !== 0) throw new Error("invalid buffer length");
            if (n.length !== u2) throw new Error("buffer length mismatch");
            for (let l = 0; l < u2; l++) {
              let c2 = $u(s, t.dataType(), l * i);
              n[l] = c2;
            }
          }
          return r;
        }
      };
    });
    we = L(() => {
      "use strict";
      jd = { version: "", attribute: "attribute", varyingVertex: "varying", varyingFrag: "varying", texture2D: "texture2D", output: "gl_FragColor", outputDeclaration: "" }, Yd = { version: "#version 300 es", attribute: "in", varyingVertex: "out", varyingFrag: "in", texture2D: "texture", output: "outputColor", outputDeclaration: "out vec4 outputColor;" };
    });
    ae = L(() => {
      "use strict";
    });
    Bt = L(() => {
      "use strict";
      fe();
    });
    Tr = L(() => {
      "use strict";
      Bt();
    });
    Vu = L(() => {
      "use strict";
      we();
      ae();
      Bt();
      Tr();
      Uu = { name: "pack", inputNames: ["A"], inputTypes: [1] }, Kd = (a, t) => {
        let o = H(a.session.backend.glContext.version), e = t.dims, r = e.length, n = t.dims.length, s = Qe(n), i = Br("rc", n), u2 = Qd(n, i, e[e.length - 2], e[e.length - 1]), l;
        r === 0 ? l = [1, 1] : r === 1 ? l = [e[0], 1] : l = [e[n - 1], e[n - 2]];
        let c2 = Jd(n, l, i), p2 = Zd(e, i), d = `
        void main() {
          ${s} rc = getOutputCoords();

          if(${c2}) {
            ${o.output} = vec4(0);
          } else {
            ${u2}

            ${o.output} = vec4(${p2});
          }
        }
      `;
        return { ...Uu, hasMain: true, output: { dims: t.dims, type: t.type, textureType: 2 }, shaderSource: d };
      }, zu = (a, t) => ({ ...Uu, get: () => Kd(a, t) });
    });
    qu = L(() => {
      "use strict";
      fe();
      we();
      ae();
      Tr();
      eh = (a) => ({ name: "Reshape (packed)", inputTypes: [2], inputNames: ["A"], cacheHint: `${a}` }), th = (a, t, o, e) => {
        let r = t.dims, n = e, s = "";
        for (let l = 0; l < 4; l++) {
          let c2 = "";
          switch (l) {
            case 0:
              c2 = "outputCoords = rc;";
              break;
            case 1:
              c2 = "outputCoords = ivec3(rc.x, rc.y+1, rc.z);";
              break;
            case 2:
              c2 = "outputCoords = ivec3(rc.x, rc.y, rc.z+1);";
              break;
            case 3:
              c2 = "outputCoords = ivec3(rc.x, rc.y+1, rc.z+1);";
              break;
            default:
              throw new Error();
          }
          s += `
        ${c2}
        ${l > 0 ? "if(outputCoords.y < rows && outputCoords.z < cols){" : ""}
          int flattenedIndex = getFlattenedIndex(outputCoords);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flattenedIndex);
          vec2 innerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${l}] = getChannel(getA(inputRC.x, inputRC.y, inputRC.z), innerDims);

        ${l > 0 ? "}" : ""}
      `;
        }
        let i = H(a.session.backend.glContext.version), u2 = `
      ${rh(r)}
      ${nh(n)}
      ${Nt()}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.0);

        ivec3 outputCoords;
        int rows = ${n[2]};
        int cols = ${n[1]};

        ${s}
        ${i.output} = result;
      }
    `;
        return { ...o, output: { dims: n, type: t.type, textureType: 2 }, shaderSource: u2, hasMain: true };
      }, Wu = (a, t, o) => {
        let e = eh(o);
        return { ...e, get: () => th(a, t, e, o) };
      };
    });
    ju = L(() => {
      "use strict";
      we();
      ae();
      gi = (a, t) => {
        let o = t.shape, e = H(a.session.backend.glContext.version), r = `
    const float FLOAT_MAX = 1.70141184e38;
    const float FLOAT_MIN = 1.17549435e-38;

    bool isNaN(float val) {
      return (val < 1.0 || 0.0 < val || val == 0.0) ? false : true;
    }

    highp vec4 encodeAsUint8(highp float v) {
      if (isNaN(v)) {
        return vec4(255, 255, 255, 255);
      }

      highp float av = abs(v);

      if(av < FLOAT_MIN) {
        return vec4(0.0, 0.0, 0.0, 0.0);
      } else if(v > FLOAT_MAX) {
        return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
      } else if(v < -FLOAT_MAX) {
        return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
      }

      highp vec4 c = vec4(0,0,0,0);

      highp float e = floor(log2(av));
      highp float m = exp2(fract(log2(av))) - 1.0;

      c[2] = floor(128.0 * m);
      m -= c[2] / 128.0;
      c[1] = floor(32768.0 * m);
      m -= c[1] / 32768.0;
      c[0] = floor(8388608.0 * m);

      highp float ebias = e + 127.0;
      c[3] = floor(ebias / 2.0);
      ebias -= c[3] * 2.0;
      c[2] += floor(ebias) * 128.0;

      c[3] += 128.0 * step(0.0, -v);

      return c / 255.0;
    }

    void main() {
      float value = ${e.texture2D}(X,TexCoords).r;
      ${e.output} = encodeAsUint8(value);
    }`, n = { name: "Uint8Encode", inputTypes: [0], inputNames: ["X"], output: { dims: o, type: t.tensor.type, textureType: 3 }, shaderSource: r, hasMain: true };
        return a.executeProgram(n, [t.tensor]);
      };
    });
    Ku = L(() => {
      "use strict";
      we();
      ae();
      Bt();
      Tr();
      Yu = { name: "unpack", inputNames: ["A"], inputTypes: [2] }, oh = (a, t) => {
        let o = t.dims.length, e = Br("rc", o), r = e.slice(-2), n = Qe(o), s = Nt(), u2 = t.dims.length === 0 ? "" : ih(o, e), l = o <= 1 ? "rc" : `vec2(${r.join(",")})`, c2 = H(a.session.backend.glContext.version), p2 = `
    ${s}
    void main() {
      ${n} rc = getOutputCoords();

       // Sample the texture with the coords to get the rgba channel value.
       vec4 packedInput = getA(${u2});

       ${c2.output} = vec4(getChannel(packedInput, ${l}), 0, 0, 0);
     }
   `;
        return { ...Yu, hasMain: true, output: { dims: t.dims, type: t.type, textureType: 0 }, shaderSource: p2 };
      }, Xu = (a, t) => ({ ...Yu, get: () => oh(a, t) });
    });
    ln = L(() => {
      "use strict";
      lt();
      Xn = class {
        constructor(t, o = 1) {
          if (o === 1) this.internalFormat = t.R32F, this.format = t.RED, this.textureType = t.FLOAT, this.channelSize = o;
          else if (o === 4) this.internalFormat = t.RGBA32F, this.format = t.RGBA, this.textureType = t.FLOAT, this.channelSize = o;
          else throw new Error(`Invalid number of channels: ${o}`);
        }
        encode(t, o) {
          let e, r;
          return t.constructor !== Float32Array && (ce.warning("Encoder", "data was not of type Float32; creating new Float32Array"), r = new Float32Array(t)), o * this.channelSize > t.length ? (ce.warning("Encoder", "Source data too small. Allocating larger array"), r = t, e = this.allocate(o * this.channelSize), r.forEach((n, s) => e[s] = n)) : (r = t, e = r), e;
        }
        allocate(t) {
          return new Float32Array(t * 4);
        }
        decode(t, o) {
          return this.channelSize === 1 ? t.filter((r, n) => n % 4 === 0).subarray(0, o) : t.subarray(0, o);
        }
      }, un = class {
        constructor(t, o = 1, e) {
          if (o !== 1 && o !== 4) throw new Error(`Invalid number of channels: ${o}`);
          this.internalFormat = t.RGBA, this.format = t.RGBA, this.channelSize = o, this.textureType = e || t.FLOAT;
        }
        encode(t, o) {
          let e = t;
          return this.channelSize === 1 && (ce.verbose("Encoder", "Exploding into a larger array"), e = this.allocate(o), t.forEach((r, n) => e[n * 4] = r)), e;
        }
        allocate(t) {
          return new Float32Array(t * 4);
        }
        decode(t, o) {
          return this.channelSize === 1 ? t.filter((r, n) => n % 4 === 0).subarray(0, o) : t.subarray(0, o);
        }
      }, Kn = class {
        constructor(t, o = 1) {
          this.channelSize = 4;
          if (o === 1) this.internalFormat = t.ALPHA, this.format = t.ALPHA, this.textureType = t.UNSIGNED_BYTE, this.channelSize = o;
          else if (o === 4) this.internalFormat = t.RGBA, this.format = t.RGBA, this.textureType = t.UNSIGNED_BYTE, this.channelSize = o;
          else throw new Error(`Invalid number of channels: ${o}`);
        }
        encode(t, o) {
          return new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
        }
        allocate(t) {
          return new Uint8Array(t * this.channelSize);
        }
        decode(t, o) {
          if (t instanceof Uint8Array) return t.subarray(0, o);
          throw new Error(`Invalid array type: ${t.constructor}`);
        }
      };
    });
    Zu = L(() => {
      "use strict";
      fe();
      ae();
      fn = (a, t, o) => {
        let e = o === 0 || o === 1 ? 1 : 4, r = o === 2, n = o === 1 || o === 2, s = o === 4 ? t.length - 1 : void 0, i = o === 4 ? t.map((u2, l) => l === t.length - 1 ? u2 * 4 : u2) : void 0;
        return yi(a, t, e, i, { isPacked: r, reverseWH: n, breakAxis: s });
      }, Ju = (a, t, o) => {
        let e = fn(a, t, o);
        return [e.width, e.height];
      }, yi = (a, t, o = 1, e, r) => {
        let n = !!(r && r.isPacked), [s, i] = a.computeTextureWH(n && e || t, r), u2 = t.length, l = t.slice(0);
        if (u2 === 0 && (l = [1]), o === 1) e = t;
        else if (n) {
          if (o !== 4) throw new Error("a packed texture must be 4-channel");
          e = t, u2 > 0 && (l[u2 - 1] = Math.ceil(l[u2 - 1] / 2)), u2 > 1 && (l[u2 - 2] = Math.ceil(l[u2 - 2] / 2));
        } else if (!e) throw new Error("Unpacked shape is needed when using channels > 1");
        return { width: s, height: i, channels: o, isPacked: n, shape: l, strides: U.computeStrides(l), unpackedShape: e, reversedWH: r && r.reverseWH };
      };
    });
    el = L(() => {
      "use strict";
      lt();
      yr();
      fe();
      Vu();
      qu();
      ju();
      Ku();
      ln();
      Zu();
      ae();
      sh = (a, t) => {
        let o = t.map((r) => `${r.unpackedShape.join(",")};${r.width}x${r.height}`).join("_"), e = a.name;
        return a.cacheHint && (e += "[" + a.cacheHint + "]"), e += ":" + o, e;
      }, Jn = class {
        constructor(t) {
          this.session = t;
          this.packedTextureDataCache = /* @__PURE__ */ new Map(), this.unpackedTextureDataCache = /* @__PURE__ */ new Map();
        }
        calculateTextureWidthAndHeight(t, o) {
          return Ju(this.session.layoutStrategy, t, o);
        }
        executeProgram(t, o) {
          if (o.length < t.inputNames.length) throw new Error(`Input size mustn't be less than ${t.inputNames.length}.`);
          if (t.inputNames.length !== t.inputTypes.length) throw new Error("input names size does not match input types");
          let e = [];
          for (let l = 0; l < t.inputNames.length; ++l) e[l] = this.getOrCreateTextureData(o[l], t.inputTypes[l]);
          let r = sh(t, e), n = this.session.programManager.getArtifact(r), s = n ? n.programInfo : typeof t.get == "function" ? t.get() : t, i = fn(this.session.layoutStrategy, s.output.dims, s.output.textureType), u2 = this.createTextureData(i, s.output.type);
          return n || (n = this.session.programManager.build(s, e, u2), this.session.programManager.setArtifact(r, n)), this.runProgram(n, e, u2), u2;
        }
        run(t, o) {
          return this.executeProgram(t, o).tensor;
        }
        runProgram(t, o, e) {
          for (let r = 0; r < o.length; ++r) if (!!o[r].isPacked != (t.programInfo.inputTypes[r] === 2)) throw new Error(`input[${r}] property packed inconsistent`);
          if (!!e.isPacked != (t.programInfo.output.textureType === 2)) throw new Error("output property packed inconsistent");
          this.session.programManager.run(t, o, e);
        }
        getOrCreateTextureData(t, o) {
          let e = this.getTextureData(t.dataId, o === 2);
          if (!e && (e = this.getTextureData(t.dataId, o !== 2), e)) return o === 2 ? this.pack(e) : this.unpack(e);
          if (!e) {
            let r = fn(this.session.layoutStrategy, t.dims, o);
            if (o === 4) {
              let i = t.dims;
              if (i.length === 4) {
                let u2 = [i[0], Math.ceil(i[1] * i[2] * i[3] / 4)], l = fn(this.session.layoutStrategy, u2, o), c2 = t.numberData;
                if (i[1] * i[2] * i[3] % 4 !== 0) {
                  let p2 = i[0], d = i[1] * i[2] * i[3], T = Math.ceil(d * 1 / 4) * 4, w = p2 * T;
                  c2 = new Float32Array(w);
                  for (let v = 0; v < p2; ++v) {
                    let S2 = v * d, A = v * T + v % 1 * d;
                    c2.set(t.numberData.subarray(S2, S2 + d), A);
                  }
                }
                return this.createTextureData(l, t.type, c2, t, 1);
              }
            }
            if (o === 2) {
              let n = yi(this.session.layoutStrategy, t.dims, 1, [], { reverseWH: true }), s = this.createTextureData(n, t.type, t.numberData, t, 1);
              e = this.pack(s);
            } else e = this.createTextureData(r, t.type, t.numberData, t, 1);
          }
          return e;
        }
        createTextureDataFromLayoutBindTensor(t, o, e, r) {
          return this.createTextureData(t, o, e, r, 1);
        }
        createTextureData(t, o, e, r, n) {
          ce.verbose("InferenceHandler", `Creating TextureData: layout:[${JSON.stringify(t)}]`);
          let s = this.session.textureManager.createTextureFromLayout(o, t, e, n);
          return this.createTextureDataFromTexture(t, o, s, r);
        }
        reshapeUnpacked(t, o) {
          let e = this.getOrCreateTextureData(t, 0), r = { channels: e.channels, height: e.height, width: e.width, shape: o.length !== 0 ? o : [1], strides: U.computeStrides(o), unpackedShape: o };
          return this.createTextureDataFromTexture(r, t.type, e.texture).tensor;
        }
        reshapePacked(t, o) {
          let e = this.getOrCreateTextureData(t, 2);
          if (Hu(t.dims, o)) {
            let l = { channels: e.channels, height: e.height, width: e.width, shape: o.length !== 0 ? o : [1], strides: U.computeStrides(o), unpackedShape: o, isPacked: true };
            return this.createTextureDataFromTexture(l, t.type, e.texture).tensor;
          }
          let r = bi(t.dims), n = bi(o), s = this.reshapePacked(t, r), i = this.run(Wu(this, s, n), [s]);
          return this.reshapePacked(i, o);
        }
        cast(t, o) {
          let e = this.getOrCreateTextureData(t, 0);
          return this.createTextureDataFromTexture(e, o, e.texture).tensor;
        }
        createTextureDataFromTexture(t, o, e, r, n) {
          let s = { ...t, tensor: r || new $e(t.unpackedShape, o, (i) => this.readTexture(s), async (i) => this.readTextureAsync(s), void 0, n), texture: e };
          return this.setTextureData(s.tensor.dataId, s, t.isPacked), s;
        }
        getTextureData(t, o = false) {
          return this.session.isInitializer(t) ? this.session.getTextureData(t, o) : o ? this.packedTextureDataCache.get(t) : this.unpackedTextureDataCache.get(t);
        }
        setTextureData(t, o, e = false) {
          this.session.isInitializer(t) ? this.session.setTextureData(t, o, e) : (e ? this.packedTextureDataCache : this.unpackedTextureDataCache).set(t, o);
        }
        isTextureLayoutCached(t, o = false) {
          return !!this.getTextureData(t.dataId, o);
        }
        dispose() {
          this.session.textureManager.clearActiveTextures(), this.packedTextureDataCache.forEach((t) => this.session.textureManager.releaseTexture(t)), this.packedTextureDataCache = /* @__PURE__ */ new Map(), this.unpackedTextureDataCache.forEach((t) => this.session.textureManager.releaseTexture(t)), this.unpackedTextureDataCache = /* @__PURE__ */ new Map();
        }
        readTexture(t) {
          return t.isPacked ? this.readTexture(this.unpack(t)) : this.session.backend.glContext.isFloat32DownloadSupported ? this.session.textureManager.readTexture(t, t.tensor.type, t.channels) : this.session.textureManager.readUint8TextureAsFloat(gi(this, t));
        }
        async readTextureAsync(t) {
          return t.isPacked ? this.readTextureAsync(this.unpack(t)) : this.session.backend.glContext.isFloat32DownloadSupported ? this.session.textureManager.readTextureAsync(t, t.tensor.type, t.channels) : this.session.textureManager.readUint8TextureAsFloat(gi(this, t));
        }
        pack(t) {
          return this.executeProgram(zu(this, t.tensor), [t.tensor]);
        }
        unpack(t) {
          return this.executeProgram(Xu(this, t.tensor), [t.tensor]);
        }
      };
    });
    Ue = L(() => {
      "use strict";
      Ti = class {
        constructor(t) {
          Object.assign(this, t);
        }
        get cacheKey() {
          return this.key || (this.key = Object.getOwnPropertyNames(this).sort().map((t) => `${this[t]}`).join(";")), this.key;
        }
      }, Q = (a) => new Ti(a);
    });
    ol = L(() => {
      "use strict";
      Ue();
      we();
      ae();
      tl = { name: "BatchNormalization", inputNames: ["A", "Scale", "B", "Mean", "Variance"], inputTypes: [0, 0, 0, 0, 0] }, rl = (a, t, o) => (lh(t), [a.run({ ...tl, cacheHint: o.cacheKey, get: () => uh(a, t, o) }, t)]), nl = (a) => {
        let t = a.attributes.getFloat("epsilon", 1e-5), o = a.attributes.getFloat("momentum", 0.9), e = a.attributes.getInt("spatial", 1);
        return Q({ epsilon: t, momentum: o, spatial: e });
      }, uh = (a, t, o) => {
        let e = H(a.session.backend.glContext.version), r = t[0].dims.length, [n, s] = a.calculateTextureWidthAndHeight(t[1].dims, 0), i = `
  float process(int[${r}] indices) {
    vec2 position = offsetToCoords(indices[1], ${n}, ${s});
    float scale = getColorAsFloat(${e.texture2D}(Scale, position));
    float mean = getColorAsFloat(${e.texture2D}(Mean, position));
    float variance = getColorAsFloat(${e.texture2D}(Variance, position));
    float b = getColorAsFloat(${e.texture2D}(B, position));

    return scale * ( (_A(indices) - mean) / sqrt(variance + float(${o.epsilon})) ) + b;
  }`;
        return { ...tl, output: { dims: t[0].dims, type: t[0].type, textureType: 0 }, shaderSource: i };
      }, lh = (a) => {
        if (!a || a.length !== 5) throw new Error("BatchNormalization requires 5 inputs.");
        let t = a[0], o = a[1], e = a[2], r = a[3], n = a[4];
        if (t.dims.length < 3 || o.dims.length !== 1 || e.dims.length !== 1 || r.dims.length !== 1 || n.dims.length !== 1) throw new Error("invalid input shape.");
        if (o.dims[0] !== t.dims[1] || e.dims[0] !== t.dims[1] || r.dims[0] !== t.dims[1] || n.dims[0] !== t.dims[1]) throw new Error("invalid input shape.");
        if (t.type !== "float32" && t.type !== "float64" || o.type !== "float32" && o.type !== "float64" || e.type !== "float32" && e.type !== "float64" || r.type !== "float32" && r.type !== "float64" || n.type !== "float32" && n.type !== "float64") throw new Error("invalid input tensor types.");
      };
    });
    Wt = L(() => {
      "use strict";
      Zn = class {
        constructor(t, o, e, r) {
          this.glContext = t;
          this.programInfo = o;
          this.inputTextureLayouts = e;
          this.outputTextureLayout = r;
        }
      }, dt = class {
        constructor(t) {
          this.context = t;
        }
      }, R = class {
        constructor(t, o) {
          this.routineBody = t;
          this.dependencies = o;
        }
      }, cn = class {
        constructor(t, o, e) {
          this.name = t;
          e ? this.dependencies = e : this.dependencies = [], o && (this.routineBody = o);
        }
        addDependency(t) {
          t && this.dependencies.push(t);
        }
      }, Qn = class {
        static returnOrderedNodes(t) {
          if (!t || t.length === 0) return [];
          if (t.length === 1) return t;
          let o = /* @__PURE__ */ new Set(), e = /* @__PURE__ */ new Set(), r = new Array();
          return this.createOrderedNodes(t, o, e, r), r;
        }
        static createOrderedNodes(t, o, e, r) {
          for (let n = 0; n < t.length; ++n) this.dfsTraverse(t[n], o, e, r);
        }
        static dfsTraverse(t, o, e, r) {
          if (!t || e.has(t.name)) return;
          if (o.has(t.name)) throw new Error("Cyclic dependency detected. Can't topologically sort routines needed for shader.");
          o.add(t.name);
          let n = t.dependencies;
          if (n && n.length > 0) for (let s = 0; s < n.length; ++s) this.dfsTraverse(n[s], o, e, r);
          r.push(t), e.add(t.name), o.delete(t.name);
        }
      };
    });
    gl = L(() => {
      "use strict";
      fe();
      Wt();
      we();
      ae();
      ht = (a, t, o, e = t[0].type, r) => {
        let n = a.session.pack ? 2 : 0;
        return { name: o.name, inputNames: ["A", "B"], inputTypes: [n, n], cacheHint: r, get: () => Oh(a, t, o, e) };
      }, Oh = (a, t, o, e = t[0].type) => {
        let r = a.session.pack ? 2 : 0, n = !U.areEqual(t[0].dims, t[1].dims), s = t[0].dims, i = a.session.pack;
        if (n) {
          let c2 = Ze.calcShape(t[0].dims, t[1].dims, false);
          if (!c2) throw new Error("Can't perform binary op on the given tensors");
          s = c2;
          let p2 = s.length, d = t[0].dims.length !== 0 ? t[0].dims.length : 1, T = t[1].dims.length !== 0 ? t[1].dims.length : 1, w = t[0].dims.length !== 0 ? "bcastIndices_A(indices, aindices);" : "aindices[0] = 0;", v = t[1].dims.length !== 0 ? "bcastIndices_B(indices, bindices);" : "bindices[0] = 0;", S2 = H(a.session.backend.glContext.version), A = i ? `
      ${o.body}
      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();
        vec4 result = ${o.name}(a, b);
        ${S2.output} = result;
      }` : `
      ${o.body}
      float process(int indices[${p2}]) {
        int aindices[${d}];
        int bindices[${T}];
        ${w}
        ${v}
        return ${o.name}(_A(aindices), _B(bindices));
      }`;
          return { name: o.name, inputNames: ["A", "B"], inputTypes: [r, r], output: { dims: s, type: e, textureType: r }, shaderSource: A, hasMain: i };
        }
        let u2 = H(a.session.backend.glContext.version), l = `
    ${o.body}
    void main() {
      vec4 v1 = ${u2.texture2D}(A, TexCoords);
      vec4 v2 = ${u2.texture2D}(B, TexCoords);
      vec4 result = ${o.name}(v1, v2);
      ${u2.output} = result;
    }
    `;
        return { name: o.name, inputNames: ["A", "B"], inputTypes: [r, r], output: { dims: t[0].dims, type: e, textureType: r }, shaderSource: l, hasMain: true };
      }, il = (a, t) => [a.run(ht(a, t, ch()), t)], al = (a, t) => [a.run(ht(a, t, yh(), "bool"), t)], sl = (a, t) => [a.run(ht(a, t, ph()), t)], ul = (a, t) => [a.run(ht(a, t, mh(), "bool"), t)], ll = (a, t) => [a.run(ht(a, t, bh(), "bool"), t)], fl = (a, t) => [a.run(ht(a, t, gh(), "bool"), t)], cl = (a, t) => [a.run(ht(a, t, dh()), t)], pl = (a, t) => [a.run(ht(a, t, Th(), "bool"), t)], dl = (a, t) => [a.run(ht(a, t, wh()), t)], hl = (a, t) => [a.run(ht(a, t, vh()), t)], ml = (a, t) => [a.run(ht(a, t, hh()), t)], bl = (a, t) => [a.run(ht(a, t, xh(), "bool"), t)];
    });
    xl = L(() => {
      "use strict";
      fe();
      yl = (a, t, o) => (Sh(t), [a.cast(t[0], o)]), Tl = (a) => We.tensorDataTypeFromProto(a.attributes.getInt("to")), Sh = (a) => {
        if (!a || a.length !== 1) throw new Error("Cast requires 1 input.");
        if (a[0].type === "string") throw new Error("Invalid input type.");
      };
    });
    vl = L(() => {
      "use strict";
      we();
      ae();
      Bt();
      Tr();
      Ah = (a, t) => ({ name: "Concat (packed)", inputNames: Array.from({ length: a }, (o, e) => `X${e}`), inputTypes: Array(a).fill(2), cacheHint: t }), Ph = (a, t, o, e) => {
        let r = o[0].dims.slice();
        if (e >= r.length || e < -1 * r.length) throw new Error("axis specified for concat doesn't match input dimensionality");
        e < 0 && (e = r.length + e);
        let n = r.slice(0);
        for (let j2 = 1; j2 < o.length; j2++) {
          let ie = o[j2].dims.slice();
          for (let G = 0; G < r.length; G++) if (G === e) n[e] += ie[G];
          else if (r[G] !== ie[G]) throw new Error("non concat dimensions must match");
        }
        let s = n.length, i = Br("coords", s), u2 = Qe(s), l = Nt(), c2 = o.map((j2) => j2.dims), p2 = Dt(s), d = new Array(c2.length - 1);
        d[0] = c2[0][e];
        for (let j2 = 1; j2 < d.length; j2++) d[j2] = d[j2 - 1] + c2[j2][e];
        let T = p2[e], w = p2.slice(-2), v = p2.join(), S2 = `if (${T} < ${d[0]}) {
        return getChannel(
            getX0(${v}), vec2(${w.join()}));
        }`;
        for (let j2 = 1; j2 < d.length; j2++) {
          let ie = d[j2 - 1];
          S2 += `
            if (${T} < ${d[j2]}  && ${T} >= ${d[j2 - 1]}) {
              return getChannel(
                getX${j2}(${eo(p2, T, ie)}),
                vec2(${eo(w, T, ie)}));
            }`;
        }
        let A = d.length, C = d[d.length - 1];
        S2 += `
            return getChannel(
              getX${A}(${eo(p2, T, C)}),
              vec2(${eo(w, T, C)}));`;
        let F2 = H(a.session.backend.glContext.version), J = `
          ${l}
          float getValue(${p2.map((j2) => "int " + j2)}) {
            ${S2}
          }

          void main() {
            ${u2} coords = getOutputCoords();
            int lastDim = coords.${p2[s - 1]};
            coords.${p2[s - 1]} = coords.${p2[s - 2]};
            coords.${p2[s - 2]} = lastDim;

            vec4 result = vec4(getValue(${i}), 0., 0., 0.);

            ${i[s - 1]} = ${i[s - 1]} + 1;
            if (${i[s - 1]} < ${n[s - 1]}) {
              result.g = getValue(${i});
            }

            ${i[s - 2]} = ${i[s - 2]} + 1;
            if (${i[s - 2]} < ${n[s - 2]}) {
              result.a = getValue(${i});
            }

            ${i[s - 1]} = ${i[s - 1]} - 1;
            if (${i[s - 2]} < ${n[s - 2]} &&
                ${i[s - 1]} < ${n[s - 1]}) {
              result.b = getValue(${i});
            }
            ${F2.output} = result;
          }
        `;
        return { ...t, output: { dims: n, type: o[0].type, textureType: 2 }, shaderSource: J, hasMain: true };
      }, wl = (a, t, o) => {
        let e = Ah(t.length, o.cacheKey);
        return { ...e, get: () => Ph(a, e, t, o.axis) };
      }, eo = (a, t, o) => {
        let e = a.indexOf(t);
        return a.map((n, s) => s === e ? `${n} - ${o}` : n).join();
      };
    });
    Sl = L(() => {
      "use strict";
      Ue();
      ae();
      vl();
      _l = (a, t, o) => (kh(t), a.session.pack && t[0].dims.length > 1 ? [a.run(wl(a, t, o), t)] : [a.run(Lh(a, t, o), t)]), Eh = (a, t) => ({ name: "Concat", inputNames: Array.from({ length: a }, (o, e) => `X${e}`), inputTypes: Array(a).fill(0), cacheHint: t }), Dh = (a, t, o, e) => {
        let r = o[0].dims.slice();
        if (e >= r.length || e < -1 * r.length) throw new Error("axis specified for concat doesn't match input dimensionality");
        e < 0 && (e = r.length + e);
        let n = r.slice(0);
        for (let T = 1; T < o.length; T++) {
          let w = o[T].dims.slice();
          for (let v = 0; v < r.length; v++) if (v === e) n[e] += w[v];
          else if (r[v] !== w[v]) throw new Error("non concat dimensions must match");
        }
        let s = n.length, i = new Array(o.length), u2 = 0;
        for (let T = 0; T < i.length; ++T) u2 += o[T].dims[e], i[T] = u2;
        let l = "";
        o.length < 5 ? l = Ol(i) : l = Ch(i);
        let c2 = Fh(o.length, s), p2 = $h(i), d = `
        ${c2}
        ${p2}
        ${l}
        float process(int indices[${s}]) {
          int textureIndex = getTextureWhereDataResides (indices[${e}]);

          if(textureIndex != 0) {
            indices[${e}] = indices[${e}] - int(getSizeInConcatAxisValueFromIndex(textureIndex-int(1)));
          }

          return fetchDataFromCorrectTexture(textureIndex, indices);
        }`;
        return { ...t, output: { dims: n, type: o[0].type, textureType: 0 }, shaderSource: d };
      }, Lh = (a, t, o) => {
        let e = Eh(t.length, o.cacheKey);
        return { ...e, get: () => Dh(a, e, t, o.axis) };
      }, Ol = (a) => `int getTextureWhereDataResides(int index) {
      ${a.map((o, e) => `if(index<${o}) {return ${e};}
`).join("")}
    }`, Ch = (a) => Ol(a), Fh = (a, t) => {
        let o = [`float fetchDataFromCorrectTexture(int textureIndex, int indices[${t}]) {`];
        for (let e = 0; e < a; ++e) e === 0 ? o.push(`	if (textureIndex == ${e}) { return _X${e}(indices); }`) : e === a - 1 ? o.push(`	else { return _X${e}(indices); }`) : o.push(`	else if (textureIndex == ${e}) { return _X${e}(indices); }`);
        return o.push("	}"), o.join(`
`);
      }, $h = (a) => {
        let t = ["int getSizeInConcatAxisValueFromIndex(int index) {"];
        for (let o = 0; o < a.length; ++o) o === 0 ? t.push(`	if (index == ${o}) { return ${a[o]}; }`) : o === a.length - 1 ? t.push(`	else { return ${a[o]}; }`) : t.push(`	else if (index == ${o}) { return ${a[o]}; }`);
        return t.push("	}"), t.join(`
`);
      }, Il = (a) => Q({ axis: a.attributes.getInt("axis") }), kh = (a) => {
        if (!a || a.length < 1) throw new Error("too few inputs");
        let t = a[0].type, o = a[0].dims.length;
        if (t === "string") throw new Error("string tensor is not supported yet");
        for (let e of a) {
          if (e.type !== t) throw new Error("input tensors should be one type");
          if (e.dims.length !== o) throw new Error("input tensors should have the same shape");
        }
      };
    });
    Ii = L(() => {
      "use strict";
      Ue();
      fe();
      Wt();
      we();
      ae();
      em = (a, t, o, e) => {
        let r = a.session.pack ? 2 : 0, n = H(a.session.backend.glContext.version);
        return { ...t, output: { dims: o.dims, type: o.type, textureType: r }, shaderSource: `
     ${e.body}
     void main() {
       vec4 v = ${n.texture2D}(A, TexCoords);
       v = ${e.name}_(v);
       ${n.output} = v;
     }
     `, hasMain: true };
      }, Ee = (a, t, o, e) => {
        let r = a.session.pack ? 2 : 0, n = { name: o.name, inputTypes: [r], inputNames: ["A"], cacheHint: e };
        return { ...n, get: () => em(a, n, t, o) };
      }, Al = (a, t) => [a.run(Ee(a, t[0], Bh()), t)], Pl = (a, t) => [a.run(Ee(a, t[0], Nh()), t)], El = (a, t) => [a.run(Ee(a, t[0], Rh()), t)], Dl = (a, t) => [a.run(Ee(a, t[0], Mh()), t)], _i = (a, t, o) => [a.run(Ee(a, t[0], xi(o.min, o.max), o.cacheKey), t)], Ll = (a) => Q({ min: a.attributes.getFloat("min", br), max: a.attributes.getFloat("max", gr) }), Cl = (a, t) => {
        let o = tm(a, t);
        return _i(a, [t[0]], o);
      }, tm = (a, t) => {
        if (t.length >= 3 && (!a.session.isInitializer(t[1].dataId) || !a.session.isInitializer(t[2].dataId))) throw new Error("dynamic clip attributes are not allowed");
        let o = t.length >= 3 ? t[1].numberData[0] : br, e = t.length >= 3 ? t[2].numberData[0] : gr;
        return Q({ min: o, max: e });
      }, Fl = (a, t) => [a.run(Ee(a, t[0], Gh()), t)], $l = (a, t) => [a.run(Ee(a, t[0], Uh()), t)], kl = (a, t, o) => [a.run(Ee(a, t[0], zh(o.alpha), o.cacheKey), t)], Bl = (a) => Q({ alpha: a.attributes.getFloat("alpha", 1) }), Nl = (a, t) => [a.run(Ee(a, t[0], Vh()), t)], Rl = (a, t) => [a.run(Ee(a, t[0], Wh()), t)], Oi = (a, t) => [a.run(Ee(a, t[0], Hh()), t)], Ml = (a, t, o) => [a.run(Ee(a, t[0], qh(o.alpha), o.cacheKey), t)], Gl = (a) => Q({ alpha: a.attributes.getFloat("alpha", 0.01) }), Ul = (a, t) => [a.run(Ee(a, t[0], jh()), t)], zl = (a, t) => [a.run(Ee(a, t[0], Yh()), t)], Vl = (a, t) => [a.run(Ee(a, t[0], Xh()), t)], Wl = (a, t) => [a.run(Ee(a, t[0], wi()), t)], Hl = (a, t) => [a.run(Ee(a, t[0], vi()), t)], ql = (a, t) => [a.run(Ee(a, t[0], Kh()), t)], jl = (a, t) => [a.run(Ee(a, t[0], Jh()), t)], Yl = (a, t) => [a.run(Ee(a, t[0], Zh()), t)], Xl = (a, t) => [a.run(Ee(a, t[0], Qh()), t)];
    });
    xr = L(() => {
      "use strict";
      fe();
      Ii();
      Nr = (a) => {
        let t = a.getString("activation", "");
        if (t === "Clip") {
          let [o, e] = a.getFloats("activation_params", [br, gr]);
          return { activation: t, clipMax: e, clipMin: o, activationCacheKey: `${t}:${o},${e}` };
        }
        return { activation: t, activationCacheKey: t };
      };
    });
    Jl = L(() => {
      "use strict";
      lt();
      we();
      ae();
      to();
      xr();
      nm = (a, t) => ({ name: "GroupedConv", inputNames: a ? ["X", "W", "Bias"] : ["X", "W"], inputTypes: a ? [0, 0, 0] : [0, 0], cacheHint: t }), om = (a, t, o, e) => {
        let n = t.length > 2 ? "value += getBias(output_channel);" : "", s = t[0].dims.slice(), i = t[1].dims.slice(), u2 = i[0] / e.group;
        ce.verbose("GroupedConv", `autpPad:${e.autoPad}, dilations:${e.dilations}, group:${e.group}, kernelShape:${e.kernelShape}, pads:${e.pads}, strides:${e.strides}`);
        let l = Rr(s, i, e.dilations, e.pads, e.strides), c2 = H(a.session.backend.glContext.version), { activationFunction: p2, applyActivation: d } = Rt(e), T = `
  const ivec2 strides = ivec2(${e.strides[0]}, ${e.strides[1]});
  const ivec2 pads = ivec2(${e.pads[0]}, ${e.pads[1]});
  ${p2}
  void main() {
    ivec4 coords = getOutputCoords();
    int batch = coords.x;
    int output_channel = coords.y;
    ivec2 xRCCorner = coords.zw * strides - pads;
    int group_id = output_channel / ${u2};

    float value = 0.0;
    for (int wInChannel = 0; wInChannel < ${i[1]}; wInChannel++) {
      int input_channel = group_id * ${i[1]} + wInChannel;
      for (int wHeight = 0; wHeight < ${i[2]}; wHeight++) {
        int xHeight = xRCCorner.x + wHeight * ${e.dilations[0]};

        if (xHeight < 0 || xHeight >= ${s[2]}) {
          continue;
        }

        for (int wWidth = 0; wWidth < ${i[3]}; wWidth++) {
          int xWidth = xRCCorner.y + wWidth * ${e.dilations[1]};
          if (xWidth < 0 || xWidth >= ${s[3]}) {
            continue;
          }

          float xVal = getX(batch, input_channel, xWidth, xHeight);
          float wVal = getW(output_channel, wInChannel, wWidth, wHeight);
          value += xVal*wVal;
        }
      }
    }
    ${n}
    ${d}
    ${c2.output} = vec4(value, .0, .0, .0);
  }
`;
        return { ...o, output: { dims: l, type: t[0].type, textureType: 0 }, shaderSource: T, hasMain: true };
      }, Kl = (a, t, o) => {
        let e = nm(t.length > 2, o.cacheKey);
        return { ...e, get: () => om(a, t, e, o) };
      };
    });
    Ql = L(() => {
      "use strict";
      we();
      ae();
      Tr();
      im = (a) => ({ name: "Im2Col (packed)", inputNames: ["A"], inputTypes: [2], cacheHint: a }), am = (a, t, o, e, r, n) => {
        let s = o.dims, i = e.dims, u2 = 2, l = 3, c2 = r.length, p2 = [i[1] * i[2] * i[3], r[2] * r[3]], d = i[2] * i[3], T = Nt(), w = H(a.session.backend.glContext.version), v = "";
        for (let A = 0; A <= 1; A++) for (let C = 0; C <= 1; C++) v += `
            blockIndex = rc.x + ${C};
            pos = rc.y + ${A};

            if(blockIndex < ${p2[1]} && pos < ${p2[0]}) {
              offsetY = int(blockIndex / (${r[c2 - 1]})) * ${n.strides[0]} -
                ${n.pads[0]};
              d0 = offsetY + ${n.dilations[0]} * (imod(pos, ${d}) / ${i[2]});

              if(d0 < ${s[u2]} && d0 >= 0) {
                offsetX = imod(blockIndex, ${r[c2 - 1]}) * ${n.strides[1]} -
                  ${n.pads[1]};
                d1 = offsetX + ${n.dilations[1]} * imod(imod(pos, ${d}), ${i[2]});

                if(d1 < ${s[l]} && d1 >= 0) {

                  ch = int(float(pos)/ ${d}.);
                    innerDims = vec2(d0, d1);
                    result[${A * 2 + C}] = getChannel(
                      getA(0, ch, int(innerDims.x),
                      int(innerDims.y)), innerDims);
                }
              }
            }

          `;
        let S2 = `
      ${T}

      void main() {
        ivec2 rc = getOutputCoords();
          vec4 result = vec4(0.0);
          int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
          vec2 innerDims;
          ${v}
          ${w.output} = result;
      }
            `;
        return { ...t, output: { dims: p2, type: o.type, textureType: 2 }, shaderSource: S2, hasMain: true };
      }, Zl = (a, t, o, e, r) => {
        let n = im(r.cacheKey);
        return { ...n, get: () => am(a, n, t, o, e, r) };
      };
    });
    ro = L(() => {
      "use strict";
      fe();
      ae();
      Bt();
      xr();
      Pi();
      ef = (a, t, o) => (lm(t), a.session.pack ? [a.run(no(a, t, o), t)] : [a.run(Si(t, o), t)]), tf = (a) => Nr(a.attributes), sm = (a, t) => ({ name: "MatMul", inputNames: a ? ["A", "B", "Bias"] : ["A", "B"], inputTypes: a ? [0, 0, 0] : [0, 0], cacheHint: t });
      lm = (a) => {
        if (!a || a.length !== 2) throw new Error("MatMul requires 2 inputs.");
        if (a[0].dims[a[0].dims.length - 1] !== a[1].dims[a[1].dims.length - 2]) throw new Error("shared dimension does not match.");
        if (a[0].type !== "float32" && a[0].type !== "float64" || a[1].type !== "float32" && a[1].type !== "float64") throw new Error("inputs should be float type");
        if (a[0].type !== a[1].type) throw new Error("inputs types should match");
      };
    });
    Pi = L(() => {
      "use strict";
      fe();
      we();
      ae();
      Bt();
      xr();
      ro();
      fm = (a, t) => ({ name: "MatMul (packed)", inputNames: a ? ["A", "B", "Bias"] : ["A", "B"], inputTypes: a ? [2, 2, 2] : [2, 2], cacheHint: t }), cm = (a, t, o, e) => {
        let r = o.length > 2, n = r ? "value += getBiasForMatmul();" : "", s = o[0].dims, i = o[1].dims, u2 = Ze.calcShape(s, i, true), l = !U.areEqual(o[0].dims, o[1].dims);
        if (!u2) throw new Error("Can't use matmul on the given tensors");
        let c2 = s[s.length - 1], p2 = Math.ceil(c2 / 2), d = s.length, T = i.length, w = H(a.session.backend.glContext.version), v = Qe(u2.length), S2 = u2.length, A = Dt(), { activationFunction: C, applyActivation: F2 } = Rt(e), J = r ? `${Ai(v, A, o[2].dims, u2, true)}` : "", j2 = l ? `${pm(v, A, o, u2)}` : "", ie = l ? "getAAtOutCoordsMatmul(i)" : `getA(${dm(A, d)})`, G = l ? "getBAtOutCoordsMatmul(i)" : `getB(${hm(A, T)})`, Te = l ? "" : `${v} rc =
          getOutputCoords(); int lastDim = rc.${A[S2 - 1]}; rc.${A[S2 - 1]} =
          rc.${A[S2 - 2]}; rc.${A[S2 - 2]} = lastDim;
      `, He = `
            ${j2}
            ${J}
            ${C}
            void main() {
              ${Te}

              vec4 value = vec4(0);
              for (int i = 0; i < ${p2}; i++) {
                vec4 a = ${ie};
                vec4 b = ${G};

                value += (a.rrbb * b.rgrg);
                value += (a.ggaa * b.baba);
              }
              ${n}
              ${F2}
              ${w.output} = value;
            }`;
        return { ...t, output: { dims: u2, type: o[0].type, textureType: 2 }, shaderSource: He, hasMain: true };
      }, no = (a, t, o) => {
        let e = fm(t.length > 2, o.activationCacheKey);
        return { ...e, get: () => cm(a, e, t, o) };
      };
    });
    nf = L(() => {
      "use strict";
      to();
      Ql();
      Pi();
      rf = (a, t, o) => {
        let e = t[0].dims, r = t[1].dims, n = Rr(e, r, o.dilations, o.pads, o.strides), s = a.run(Zl(a, t[0], t[1], n, o), [t[0]]), i = a.reshapePacked(t[1], [r[0], r[1] * r[2] * r[3]]), u2 = t.length === 3 ? [i, s, t[2]] : [i, s], l = a.run(no(a, u2, o), u2);
        return a.reshapePacked(l, n);
      };
    });
    Di = L(() => {
      "use strict";
      ae();
      mm = (a) => ({ name: "Im2Col", inputNames: ["X"], inputTypes: [0], cacheHint: a }), bm = (a, t, o, e, r, n) => {
        let s = o.dims, i = e.dims, u2 = r.length, l = Ei(s, i, r, 4), c2 = `
        const int XC = ${s[1]};
        const int XH = ${s[2]};
        const int XW = ${s[3]};
        const int KH = ${n.kernelShape[0]};
        const int KW = ${n.kernelShape[1]};
        const int dilationH = ${n.dilations[0]};
        const int dilationW = ${n.dilations[1]};
        const int strideH = ${n.strides[0]};
        const int strideW = ${n.strides[1]};
        const int padH = ${n.pads[0]};
        const int padW = ${n.pads[1]};
        const int KHKW = KH*KW;
        const int XCKHKW = XC * KHKW;
        const int outputChannels = 4;
        vec4 process(int indices[${u2}]) {
          int b  = indices[0]; // batch size
          int oh = indices[1] * strideH - padH; //output height
          int ow = indices[2] * strideW - padW; //output width
          int p = indices[3] * outputChannels; //patch
          vec4 value = vec4(0.0);
          for(int i=0; i < outputChannels; ++i) {
            if(p < XCKHKW) {
              int patchC = p / KHKW;
              int patchH = (p - patchC*KHKW) / KW;
              int patchW = (p - patchC*KHKW) - patchH * KW;
              int xh2 = oh + patchH * dilationH;
              int xw2 = ow + patchW * dilationW;
              int x[${s.length}];
              x[0] = b;
              x[1] = patchC;
              x[2] = xh2;
              x[3] = xw2;
              if(xh2 >= 0 &&
                  xh2 < XH &&
                  xw2 >= 0 &&
                  xw2 < XW) {
                value[i] = _X(x);
              }
            }
            ++p;
          }
          return value;
        }
        `;
        return { ...t, output: { dims: l, type: o.type, textureType: 4 }, shaderSource: c2 };
      }, of = (a, t, o, e, r) => {
        let n = mm(r.cacheKey);
        return { ...n, get: () => bm(a, n, t, o, e, r) };
      }, Ei = (a, t, o, e = 4) => [o[0], o[2], o[3], Math.ceil(a[1] * t[2] * t[3] / e)];
    });
    sf = L(() => {
      "use strict";
      fe();
      we();
      ae();
      xr();
      Di();
      gm = (a, t) => ({ name: "ConvDotProduct", inputNames: a ? ["Im2Col", "K", "B"] : ["Im2Col", "K"], inputTypes: a ? [0, 4, 0] : [0, 4], cacheKey: t.activationCacheKey }), ym = (a, t, o, e, r) => {
        let n = o[0].dims, s = o[1].dims, i = [s[0], Math.ceil(n[1] * s[2] * s[3] / 4)], u2 = Ei(n, s, e), [l, c2] = a.calculateTextureWidthAndHeight(i, 4), p2 = U.computeStrides(u2), [d, T] = a.calculateTextureWidthAndHeight(u2, 4), w = e.length, v = o.length < 3 ? "0.0" : "_B(b)", S2 = Math.ceil(n[1] * s[2] * s[3] / 4), { activationFunction: A, applyActivation: C } = Rt(r), F2 = H(a.session.backend.glContext.version), J = `
${A}
float process(int indices[${w}]) {
  int b[1];
  b[0] = indices[1];
  int im2col[4];
  im2col[0] = indices[0];
  im2col[1] = indices[2];
  im2col[2] = indices[3];
  int im2colOffset = im2col[0] * ${p2[0]} + im2col[1] * ${p2[1]} + im2col[2] * ${p2[2]};
  int kernelOffset = indices[1] * ${i[1]};
  float value = ${v};
  for (int i = 0; i < ${S2}; ++i) {
    vec2 im2colCoords = offsetToCoords(im2colOffset, ${d}, ${T});
    vec2 kernelCoords = offsetToCoords(kernelOffset, ${l}, ${c2});
    value += dot(${F2.texture2D}(Im2Col, im2colCoords), ${F2.texture2D}(K, kernelCoords));
    ++im2colOffset;
    ++kernelOffset;
  }
  ${C}
  return value;
}`;
        return { ...t, output: { dims: e, type: o[0].type, textureType: 0 }, shaderSource: J };
      }, af = (a, t, o, e) => {
        let r = gm(t.length > 2, e);
        return { ...r, get: () => ym(a, r, t, o, e) };
      };
    });
    to = L(() => {
      "use strict";
      Ue();
      fe();
      Jl();
      nf();
      sf();
      xr();
      Di();
      ro();
      Rr = (a, t, o, e, r) => {
        let n = a[0], s = a.slice(2), i = s.length, u2 = t[0], c2 = t.slice(2).map((w, v) => w + (w - 1) * (o[v] - 1)), d = s.map((w, v) => w + e[v] + e[v + i]).map((w, v) => Math.floor((w - c2[v] + r[v]) / r[v]));
        return [n, u2].concat(...d);
      }, Li = (a, t, o) => (_m(t, o), Tm(a, t, o)), Tm = (a, t, o) => {
        let e = vm(o, t), r = a.session.pack, n = e.kernelShape[0] === 1 && e.kernelShape[1] === 1;
        return e.group > 1 ? [a.run(Kl(a, t, e), t)] : n && r ? [xm(a, t, e)] : r && t[0].dims.length === 4 && t[0].dims[0] === 1 && !n ? [rf(a, t, e)] : [wm(a, t, e)];
      }, xm = (a, t, o) => {
        let e = t[0].dims, r = t[1].dims, n = Rr(e, r, o.dilations, o.pads, o.strides), s = a.reshapeUnpacked(t[0], [e[1], e[2] * e[3]]), i = a.reshapeUnpacked(t[1], [r[0], r[1]]), u2 = t.length > 2 ? [i, s, t[2]] : [i, s], l = a.run(Si(u2, o), u2);
        return a.reshapeUnpacked(l, n);
      }, wm = (a, t, o) => {
        let e = t[0].dims, r = t[1].dims, n = Rr(e, r, o.dilations, o.pads, o.strides), s = a.run(of(a, t[0], t[1], n, o), [t[0]]), i = t.length === 3 ? [s, t[1], t[2]] : [s, t[1]];
        return a.run(af(a, t, n, o), i);
      }, vm = (a, t) => {
        let o = a.kernelShape.slice();
        if (a.kernelShape.length === 0) for (let n = 2; n < t[1].dims.length; ++n) o.push(t[1].dims[n]);
        let e = a.pads.slice();
        mr.adjustPadsBasedOnAutoPad(t[0].dims, a.strides, a.dilations, o, e, a.autoPad);
        let r = Object.assign({}, a);
        return Object.assign(r, { kernelShape: o, pads: e, cacheKey: a.cacheKey }), r;
      }, Ci = (a) => {
        let t = a.attributes, o = Nr(t), e = t.getString("auto_pad", "NOTSET"), r = t.getInts("dilations", [1, 1]), n = t.getInt("group", 1), s = t.getInts("kernel_shape", []), i = t.getInts("pads", [0, 0, 0, 0]), u2 = t.getInts("strides", [1, 1]);
        return Q({ autoPad: e, dilations: r, group: n, kernelShape: s, pads: i, strides: u2, ...o });
      }, _m = (a, t) => {
        if (!a || a.length !== 2 && a.length !== 3) throw new Error("Conv requires 2 or 3 inputs");
        if (a[0].dims.length !== 4 || a[1].dims.length !== 4) throw new Error("currently only support 2-dimensional conv");
        let o = a[0].dims[1], e = a[1].dims[1] * t.group;
        if (o !== e) throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
        if (a.length === 3 && (a[2].dims.length !== 1 || a[1].dims[0] !== a[2].dims[0])) throw new Error("invalid bias");
        let r = a[0].dims.length - 2;
        if (t.dilations.length !== r) throw new Error(`dilations should be ${r}D`);
        if (t.strides.length !== r) throw new Error(`strides should be ${r}D`);
        if (t.pads.length !== r * 2) throw new Error(`pads should be ${r * 2}D`);
        if (t.kernelShape.length !== 0 && t.kernelShape.length !== a[1].dims.length - 2) throw new Error("invalid kernel shape");
        if (a[0].type !== "float32" || a[1].type !== "float32") throw new Error("Conv input(X,W) should be float tensor");
        if (a.length === 3 && a[2].type !== "float32") throw new Error("Conv input(bias) should be float tensor");
      };
    });
    ff = L(() => {
      "use strict";
      Ue();
      we();
      ae();
      xr();
      Om = (a, t, o, e, r, n) => (a - 1) * t + o + (e - 1) * r + 1 - n, Im = (a, t, o, e, r) => {
        let n = Math.floor(a / 2);
        t === "SAME_UPPER" ? (o[e] = n, o[r] = a - n) : t === "SAME_LOWER" && (o[e] = a - n, o[r] = n);
      }, Sm = (a, t, o, e, r, n, s, i) => {
        let u2 = a.length - 2, l = i.length === 0;
        for (let c2 = 0; c2 < u2; ++c2) {
          let p2 = l ? a[c2 + 2] * n[c2] : i[c2], d = Om(a[c2 + 2], n[c2], r[c2], t[c2], o[c2], p2);
          Im(d, e, r, c2, c2 + u2), l && i.push(n[c2] * (a[c2 + 2] - 1) + s[c2] + (t[c2] - 1) * o[c2] + 1 - r[c2] - r[c2 + u2]);
        }
      }, uf = (a, t, o) => (Fm(t, o), Am(a, t, o)), Am = (a, t, o) => {
        let e = Cm(o, t);
        return [Lm(a, t, e)];
      }, Pm = (a, t) => ({ name: "ConvTranspose", inputNames: a ? ["X", "W", "B"] : ["X", "W"], inputTypes: a ? [0, 0, 0] : [0, 0], cacheHint: t }), Em = (a, t, o, e) => {
        let n = t.length > 2 ? "getB(output_channel)" : "0.0", s = t[0].dims, i = t[1].dims, u2 = i[1], l = i[0] / e.group, c2 = [t[0].dims[0], t[1].dims[1] * e.group, ...e.outputShape], p2 = H(a.session.backend.glContext.version), { activationFunction: d, applyActivation: T } = Rt(e), w = `
  const ivec2 strides = ivec2(${e.strides[0]}, ${e.strides[1]});
  const ivec2 pads = ivec2(${e.pads[0]}, ${e.pads[1]});
  ${d}
  void main() {
    ivec4 coords = getOutputCoords();
    int batch = coords.x;
    int output_channel = coords.y;

    ivec2 loc = coords.zw + pads;

    int group_id = output_channel / ${u2};
    int wOutChannel = output_channel - group_id * ${u2};

    float value = ${n};
    for (int inChannelOffset = 0; inChannelOffset < ${l}; inChannelOffset++) {
      int input_channel = group_id * ${l} + inChannelOffset;
      for (int wWOff = 0; wWOff < ${i[2]}; wWOff++) {
        for (int wHOff = 0; wHOff < ${i[3]}; wHOff++) {
          ivec2 wOff = ivec2(wWOff * ${e.dilations[0]}, wHOff * ${e.dilations[1]});
          ivec2 wLoc = loc - wOff;
          ivec2 wLocIn = wLoc / strides;
          if (
            wLocIn * strides == wLoc &&
            wLocIn.x >= 0 && wLocIn.x < ${s[2]} &&
            wLocIn.y >= 0 && wLocIn.y < ${s[3]}
          ) {
            float xVal = getX(batch, input_channel, wLocIn.y, wLocIn.x);
            float wVal = getW(input_channel, wOutChannel, wHOff, wWOff);
            value += xVal * wVal;
          }
        }
      }
    }
    ${T}
    ${p2.output} = vec4(value, .0, .0, .0);
  }
`;
        return { ...o, output: { dims: c2, type: t[0].type, textureType: 0 }, shaderSource: w, hasMain: true };
      }, Dm = (a, t, o) => {
        let e = Pm(t.length > 2, o.cacheKey);
        return { ...e, get: () => Em(a, t, e, o) };
      }, Lm = (a, t, o) => a.run(Dm(a, t, o), t), Cm = (a, t) => {
        let o = a.kernelShape.slice();
        if (a.kernelShape.length === 0) for (let i = 2; i < t[1].dims.length; ++i) o.push(t[1].dims[i]);
        let e = a.pads.slice(), r = a.outputShape.slice(), n = t[0].dims;
        Sm(n, o, a.dilations, a.autoPad, e, a.strides, a.outputPadding, r);
        let s = Object.assign({}, a);
        return Object.assign(s, { kernelShape: o, pads: e, outputShape: r, cacheKey: a.cacheKey }), s;
      }, lf = (a) => {
        let t = a.attributes, o = Nr(t), e = t.getString("auto_pad", "NOTSET"), r = t.getInts("dilations", [1, 1]), n = t.getInt("group", 1), s = t.getInts("kernel_shape", []), i = t.getInts("output_padding", [0, 0]), u2 = t.getInts("output_shape", []), l = t.getInts("pads", [0, 0, 0, 0]), c2 = t.getInts("strides", [1, 1]);
        return Q({ autoPad: e, dilations: r, group: n, kernelShape: s, outputPadding: i, outputShape: u2, pads: l, strides: c2, ...o });
      }, Fm = (a, t) => {
        if (!a || a.length !== 2 && a.length !== 3) throw new Error("Conv requires 2 or 3 inputs");
        if (a[0].dims.length !== 4 || a[1].dims.length !== 4) throw new Error("currently only support 2-dimensional conv");
        let o = a[0].dims[1], e = a[1].dims[0];
        if (o !== e) throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
        let r = a[1].dims[1] * t.group;
        if (a.length === 3 && (a[2].dims.length !== 1 || a[2].dims[0] !== r)) throw new Error("invalid bias");
        let n = a[0].dims.length - 2;
        if (t.dilations.length !== n) throw new Error(`dilations should be ${n}D`);
        if (t.strides.length !== n) throw new Error(`strides should be ${n}D`);
        if (t.pads.length !== n * 2) throw new Error(`pads should be ${n * 2}D`);
        if (t.outputPadding.length !== n) throw new Error(`output_padding should be ${n}D`);
        if (t.kernelShape.length !== 0 && t.kernelShape.length !== a[1].dims.length - 2) throw new Error("invalid kernel shape");
        if (t.outputShape.length !== 0 && t.outputShape.length !== a[0].dims.length - 2) throw new Error("invalid output shape");
        if (a[0].type !== "float32" || a[1].type !== "float32") throw new Error("ConvTranspose input(X,W) should be float tensor");
        if (a.length === 3 && a[2].type !== "float32") throw new Error("ConvTranspose input(bias) should be float tensor");
      };
    });
    oo = L(() => {
      "use strict";
      Ue();
      fe();
      ae();
      cf = { name: "Transpose", inputNames: ["A"], inputTypes: [0] }, wr = (a, t, o) => (Nm(t), [a.run({ ...cf, cacheHint: o.cacheKey, get: () => $m(a, t[0], o.perm) }, t)]), pf = (a) => Q({ perm: a.attributes.getInts("perm", []) }), $m = (a, t, o) => {
        let e = t.dims;
        o = df(e, o);
        let r = km(e, o), n = e.length, s = `
      ${Bm("perm", o, n)}
      float process(int indices[${n}]) {
        int a[${n}];
        perm(a, indices);
        return _A(a);
      }`;
        return { ...cf, output: { dims: r, type: t.type, textureType: 0 }, shaderSource: s };
      }, df = (a, t) => (t && t.length !== a.length && (t = [...a.keys()].reverse()), t), km = (a, t) => (t = df(a, t), U.sortBasedOnPerm(a, t)), Bm = (a, t, o) => {
        let e = [];
        e.push(`void ${a}(out int a[${o}], int src[${o}]) {`);
        for (let r = 0; r < o; ++r) e.push(`	a[${t[r]}]=src[${r}];`);
        return e.push("	}"), e.join(`
`);
      }, Nm = (a) => {
        if (!a || a.length !== 1) throw new Error("Transpose requires 1 input.");
        if (a[0].type !== "float32" && a[0].type !== "float64") throw new Error("input should be float tensor");
      };
    });
    bf = L(() => {
      "use strict";
      oo();
      hf = (a, t, o) => {
        Rm(t);
        let e = o.blocksize, r = e * e, n = o.mode === "DCR" ? [0, 3, 4, 1, 5, 2] : [0, 1, 4, 2, 5, 3], s = o.mode === "DCR" ? [t[0].dims[0], e, e, t[0].dims[1] / r, t[0].dims[2], t[0].dims[3]] : [t[0].dims[0], t[0].dims[1] / r, e, e, t[0].dims[2], t[0].dims[3]], i = a.reshapeUnpacked(t[0], s), u2 = { perm: n, cacheKey: `${n}` }, [l] = wr(a, [i], u2), c2 = [t[0].dims[0], t[0].dims[1] / r, t[0].dims[2] * e, t[0].dims[3] * e];
        return [a.reshapeUnpacked(l, c2)];
      }, mf = (a) => {
        let t = a.attributes.getInt("blocksize");
        if (t < 1) throw new Error(`blocksize must be >= 1, but got : ${t} for DepthToSpace`);
        let o = a.attributes.getString("mode", "DCR");
        if (o !== "DCR" && o !== "CRD") throw new Error(`unrecognized mode: ${o} for DepthToSpace`);
        return { mode: o, blocksize: t };
      }, Rm = (a) => {
        if (a.length !== 1) throw new Error(`DepthToSpace expect 1 inputs, but got ${a.length}`);
        if (a[0].type === "string" || a[0].dims.length !== 4) throw new TypeError("DepthToSpace input should be a 4-D numeric tensor");
      };
    });
    Tf = L(() => {
      "use strict";
      fe();
      gf = (a, t, o) => {
        Mm(t, o);
        let e = U.flattenShape(t[0].dims, o);
        return [a.reshapeUnpacked(t[0], e)];
      }, yf = (a) => a.attributes.getInt("axis", 1), Mm = (a, t) => {
        if (!a || a.length !== 1) throw new Error("Flatten requires 1 input.");
        let o = a[0].dims.length;
        if (o === 0) throw new Error("scalar tensor is not supported.");
        if (t < -o || t > o) throw new Error("Invalid axis");
        if (a[0].type === "string") throw new Error("string tensor is not supported.");
      };
    });
    pn = L(() => {
      "use strict";
      Qt = ["float32", "float64", "int32", "int16", "int8", "uint16", "uint32", "uint8"];
    });
    vf = L(() => {
      "use strict";
      Ue();
      pn();
      fe();
      ae();
      xf = (a, t, o) => (Vm(t, o.axis), [a.run(zm(a, t, o), t)]), wf = (a) => Q({ axis: a.attributes.getInt("axis", 0) }), Gm = { name: "Gather", inputNames: ["A", "B"], inputTypes: [0, 0] }, Um = (a, t, o, e) => {
        let r = o[0].dims.slice(), n = o[1].dims.slice(), s = new Array(r.length + n.length - 1);
        e = U.normalizeAxis(e, r.length);
        let i = [];
        for (let d = 0; d < s.length; d++) d < e ? (s[d] = r[d], i.push(`inputIdx[${d}] = outputIdx[${d}];`)) : d < e + n.length ? (s[d] = n[d - e], i.push(`indexDataIdx[${d - e}] = outputIdx[${d}];`)) : (s[d] = r[d - n.length + 1], i.push(`inputIdx[${d - n.length + 1}] = outputIdx[${d}];`));
        let u2 = s.length || 1, l = r.length, c2 = n.length || 1, p2 = `
      float process(int outputIdx[${u2}]) {
        int inputIdx[${l}];
        int indexDataIdx[${c2}];
        indexDataIdx[0] = 0;
        ${i.join(`
        `)}
        int idx = int(_B(indexDataIdx));
        inputIdx[${e}] = idx < 0 ? idx + ${r[e]} : idx;
        return _A(inputIdx);
      }`;
        return { ...t, output: { dims: s, type: o[0].type, textureType: 0 }, shaderSource: p2 };
      }, zm = (a, t, o) => {
        let e = { ...Gm, cacheHint: o.cacheKey };
        return { ...e, get: () => Um(a, e, t, o.axis) };
      }, Vm = (a, t) => {
        if (!a || a.length !== 2) throw new Error("Gather requires 2 inputs.");
        let o = a[0].dims.length;
        if (o < 1) throw new Error("Invalid input shape.");
        if (t < -o || t > o - 1) throw new Error("Invalid axis.");
        if (Qt.indexOf(a[0].type) === -1) throw new Error("Invaid input type.");
        if (a[1].type !== "int32" && a[1].type !== "int16") throw new Error("Invaid input type.");
      };
    });
    Sf = L(() => {
      "use strict";
      Ue();
      fe();
      ae();
      Fi = (a, t, o) => (qm(t, o), [a.run(Wm(t, o), t)]), _f = (a, t) => {
        let o = a.attributes.getInt("transA", 0) !== 0, e = a.attributes.getInt("transB", 0) !== 0, r = a.attributes.getFloat("alpha", 1), n = a.attributes.getFloat("beta", 1);
        return Q({ transA: o, transB: e, alpha: r, beta: n, isOptionalC: t });
      }, Of = (a) => _f(a, false), If = (a) => _f(a, true), Wm = (a, t) => {
        let o = { name: "Gemm", inputNames: a.length === 3 ? ["A", "B", "C"] : ["A", "B"], inputTypes: a.length === 3 ? [0, 0, 0] : [0, 0], key: t.cacheKey };
        return { ...o, get: () => Hm(o, a, t) };
      }, Hm = (a, t, o) => {
        let e = t[0].dims.slice(), r = t[1].dims.slice(), [n, s] = jn.getShapeOfGemmResult(e, o.transA, r, o.transB, t.length === 3 ? t[2].dims : void 0), i = [n, s];
        if (!i) throw new Error("Can't use gemm on the given tensors");
        let u2 = e[e.length - 1], l = "";
        o.transA && (u2 = e[0]), o.transA && o.transB ? l = "value += _A_T(a) * _B_T(b);" : o.transA && !o.transB ? l = "value += _A_T(a) * _B(b);" : !o.transA && o.transB ? l = "value += _A(a) * _B_T(b);" : !o.transA && !o.transB && (l = "value += _A(a) * _B(b);");
        let c2 = i.length, p2 = t.length === 3 ? `int c[${t[2].dims.length}];` : "", d = t.length === 3 ? "bcastIndices_C(indices, c);" : "", T = t.length === 3 ? "value += beta * _C(c);" : "", w = `
      float process(int indices[${c2}]) {
          int a[${c2}];
          int b[${c2}];
          ${p2}

          copyVec(indices, a);
          copyVec(indices, b);
          ${d}

          float value = 0.0;
          for (int k=0; k<${u2}; ++k) {
              a[${c2 - 1}] = k;
              b[${c2 - 2}] = k;
              ${l}
          }

          value = value * alpha;
          ${T}
          return value;
      }`;
        return { ...a, output: { dims: i, type: t[0].type, textureType: 0 }, variables: [{ name: "alpha", type: "float", data: o.alpha }, { name: "beta", type: "float", data: o.beta }], shaderSource: w };
      }, qm = (a, t) => {
        if (!a) throw new Error("Input is missing");
        if (t.isOptionalC && (a.length < 2 || a.length > 3)) throw new Error("Invaid input shape.");
        if (!t.isOptionalC && a.length !== 3) throw new Error("Gemm requires 3 inputs");
        if (a.length === 3 && a[2].dims.length !== 1 && a[2].dims.length !== 2) throw new Error("Invalid input shape of C");
        if (a[0].type !== "float32" && a[0].type !== "float64" || a[1].type !== "float32" && a[1].type !== "float64" || a.length === 3 && a[2].type !== "float32" && a[2].type !== "float64") throw new Error("Invalid input type.");
        if (a[0].type !== a[1].type || a.length === 3 && a[0].type !== a[2].type) throw new Error("Input types are mismatched");
      };
    });
    Ef = L(() => {
      "use strict";
      Ue();
      ae();
      Af = (a, t, o) => (Jm(t), [a.run(Xm(a, t, o), t)]), Pf = (a) => {
        let t = a.attributes.getFloat("scale"), o = a.attributes.getFloats("bias");
        return Q({ scale: t, bias: o });
      }, jm = { name: "ImageScaler", inputNames: ["X"], inputTypes: [0] }, Ym = (a, t, o, e) => {
        let r = o[0].dims.slice(), n = r.length, i = `
      ${Km(e.bias.length)}
      float process(int indices[${n}]) {
        return _X(indices) * scale + getBias(bias, indices[1]);
      }`;
        return { ...t, output: { dims: r, type: o[0].type, textureType: 0 }, variables: [{ name: "bias", type: "float", arrayLength: e.bias.length, data: e.bias }, { name: "scale", type: "float", data: e.scale }], shaderSource: i };
      }, Xm = (a, t, o) => {
        let e = { ...jm, cacheHint: o.cacheKey };
        return { ...e, get: () => Ym(a, e, t, o) };
      }, Km = (a) => {
        let t = [`float getBias(float bias[${a}], int channel) {`];
        for (let o = 0; o < a; ++o) o === 0 ? t.push(`	if (channel == ${o}) { return bias[${o}]; }`) : o === a - 1 ? t.push(`	else { return bias[${o}]; }`) : t.push(`	else if (channel == ${o}) { return bias[${o}]; }`);
        return t.push("	}"), t.join(`
`);
      }, Jm = (a) => {
        if (!a || a.length !== 1) throw new Error("ImageScaler requires 1 input.");
        if (a[0].dims.length !== 4) throw new Error("Invalid input shape.");
        if (a[0].type !== "float32" && a[0].type !== "float64") throw new Error("Invalid input type.");
      };
    });
    Ff = L(() => {
      "use strict";
      we();
      ae();
      Lf = (a, t, o) => {
        nb(t);
        let e = a.run(Qm(t[0]), t);
        return [a.run(rb(a, t[0], o, e.dims), [t[0], e, t[1], t[2]])];
      }, Cf = (a) => a.attributes.getFloat("epsilon", 1e-5), Df = { name: "InstanceNormalization_MeanAndVariance", inputNames: ["X"], inputTypes: [0] }, Zm = (a, t) => {
        let o = t.dims.slice(), e = o[1], r = o[2] * o[3], n = [o[0], e], s = `
      vec4 process(int[2] indices) {
        vec4 v = vec4(0.0);
        int a[4];
        a[0] = indices[0];
        a[1] = indices[1];
        float temp = 0.0;
        for(int a2=0; a2<${o[2]}; a2++) {
          a[2] = a2;
          for(int a3=0; a3<${o[3]}; a3++) {
            a[3] = a3;
            float x = _X(a);
            temp += x;
          }
        }
        float mean = temp / float(${r});
        temp = 0.0;
        for(int a2=0; a2<${o[2]}; a2++) {
          a[2] = a2;
          for(int a3=0; a3<${o[3]}; a3++) {
            a[3] = a3;
            float x = _X(a);
            temp += (x - mean) * (x - mean);
          }
        }
        v.r = mean;
        v.g = temp / float(${r});

        return v;
      }`;
        return { ...a, output: { dims: n, type: t.type, textureType: 4 }, shaderSource: s };
      }, Qm = (a) => ({ ...Df, get: () => Zm(Df, a) }), eb = { name: "InstanceNormalization_ComputeOutput", inputNames: ["X", "MeanAndVariance", "Scale", "B"], inputTypes: [0, 4, 0, 0] }, tb = (a, t, o, e, r) => {
        let n = H(a.session.backend.glContext.version), [s, i] = a.calculateTextureWidthAndHeight(r, 4), [u2, l] = [s / 4, i], c2 = `
      vec4 get_MeanAndVariance(int[2] mv) {
        int offset = indicesToOffset_MeanAndVariance(mv);
        vec2 coords = offsetToCoords(offset, ${u2}, ${l});
        return ${n.texture2D}(MeanAndVariance, coords);
      }

      float process(int[4] indices) {
        int mv[2];
        mv[0] = indices[0];
        mv[1] = indices[1];
        vec4 mean_and_variance = get_MeanAndVariance(mv);
        float mean = mean_and_variance.r;
        float variance = mean_and_variance.g;

        int sb[1];
        sb[0] = indices[1];
        float scale = _Scale(sb);
        float b = _B(sb);

        return scale * (_X(indices) - mean) / sqrt(variance + epsilon) + b;
      }`;
        return { ...t, output: { dims: o.dims, type: o.type, textureType: 0 }, variables: [{ name: "epsilon", type: "float", data: e }], shaderSource: c2 };
      }, rb = (a, t, o, e) => {
        let r = { ...eb, cacheHint: `${o}` };
        return { ...r, get: () => tb(a, r, t, o, e) };
      }, nb = (a) => {
        if (!a || a.length !== 3) throw new Error("InstanceNormalization requires 3 inputs.");
        let t = a[0], o = a[1], e = a[2];
        if (t.dims.length < 3 || o.dims.length !== 1 || e.dims.length !== 1) throw new Error("Invalid input shape.");
        if (o.dims[0] !== t.dims[1] || e.dims[0] !== t.dims[1]) throw new Error("Input shapes are mismatched.");
        if (t.type !== "float32" && t.type !== "float64" || o.type !== "float32" && o.type !== "float64" || e.type !== "float32" && e.type !== "float64") throw new Error("Invalid input type.");
        if (a[0].dims.length !== 4) throw new Error("Only support 4-D input shape.");
      };
    });
    Nf = L(() => {
      "use strict";
      Ue();
      ae();
      $f = (a, t, o) => (ab(t), [a.run(ib(t, o), t)]), kf = (a) => {
        let t = a.attributes.getFloat("alpha", 1e-4), o = a.attributes.getFloat("beta", 0.75), e = a.attributes.getFloat("bias", 1), r = a.attributes.getInt("size");
        return Q({ alpha: t, beta: o, bias: e, size: r });
      }, Bf = { name: "LRN", inputNames: ["X"], inputTypes: [0] };
      ab = (a) => {
        if (!a || a.length !== 1) throw new Error("LRN requires 1 input.");
        if (a[0].dims.length !== 4) throw new Error('currently only support LRN for input with "NCHW" format');
        if (a[0].type !== "float32") throw new Error("input should be float type");
      };
    });
    Uf = L(() => {
      "use strict";
      Ue();
      fe();
      we();
      ae();
      sb = { name: "Pad", inputNames: ["A"], inputTypes: [0] }, $i = (a, t, o) => (fb(t), [a.run({ ...sb, cacheHint: o.cacheKey, get: () => lb(a, t[0], o) }, t)]), Rf = (a) => {
        let t = a.attributes.getString("mode", "constant"), o = a.attributes.getFloat("value", 0), e = a.attributes.getInts("pads");
        return Q({ mode: t, value: o, pads: e });
      }, Mf = (a, t, o) => {
        cb(t);
        let e = ub(a, t, o);
        return $i(a, [t[0]], e);
      }, Gf = (a) => a.attributes.getString("mode", "constant"), ub = (a, t, o) => {
        if (!a.session.isInitializer(t[1].dataId) || t.length >= 3 && !a.session.isInitializer(t[2].dataId)) throw new Error("dynamic pad attributes are not allowed");
        let e = Array.from(t[1].integerData), r = t.length >= 3 ? t[2].floatData[0] : 0;
        return Q({ mode: o, pads: e, value: r });
      }, lb = (a, t, o) => {
        let e = U.padShape(t.dims.slice(), o.pads), r = e.length, s = `
      ${pb(a, t, o)}
      float process(int[${r}] indices) {
          return padA(indices);
      }`;
        return { name: "Pad", inputNames: ["A"], inputTypes: [0], output: { dims: e, type: t.type, textureType: 0 }, shaderSource: s };
      }, fb = (a) => {
        if (!a || a.length !== 1) throw new Error("Pad requires 1 input");
        if (a[0].type !== "float32" && a[0].type !== "float64") throw new Error("Invalid input type.");
      }, cb = (a) => {
        if (!a || a.length !== 2 && a.length !== 3) throw new Error("Pad requires 2 or 3 inputs");
        if (a[1].type !== "int32") throw new Error("Invalid input type.");
        if (a.length >= 3 && a[2].type === "string") throw new Error("Invalid input type.");
      }, pb = (a, t, o) => {
        let e = H(a.session.backend.glContext.version), [r, n] = a.calculateTextureWidthAndHeight(t.dims, 0), s = U.computeStrides(t.dims);
        switch (o.mode) {
          case "constant":
            return db(e, t.dims, s, r, n, o.pads, o.value);
          case "reflect":
            return hb(e, t.dims, s, r, n, o.pads);
          case "edge":
            return mb(e, t.dims, s, r, n, o.pads);
          default:
            throw new Error("Invalid mode");
        }
      }, db = (a, t, o, e, r, n, s) => {
        let i = t.length, u2 = "";
        for (let l = i - 1; l >= 0; --l) u2 += `
        k = m[${l}] - ${n[l]};
        if (k < 0)  return constant;
        if (k >= ${t[l]}) return constant;
        offset += k * ${o[l]};
        `;
        return `
      float padA(int m[${i}]) {
        const float constant = float(${s});
        int offset = 0;
        int k = 0;
        ${u2}
        vec2 coords = offsetToCoords(offset, ${e}, ${r});
        float value = getColorAsFloat(${a.texture2D}(A, coords));
        return value;
      }
      `;
      }, hb = (a, t, o, e, r, n) => {
        let s = t.length, i = "";
        for (let u2 = s - 1; u2 >= 0; --u2) i += `
        k = m[${u2}] - ${n[u2]};
        if (k < 0) { k = -k; }
        {
          const int _2n_1 = ${2 * (t[u2] - 1)};
          k = int( mod( float(k), float(_2n_1) ) ) ;
          if(k >= ${t[u2]}) { k = _2n_1 - k; }
        }
        offset += k * ${o[u2]};
        `;
        return `
      float padA(int m[${s}]) {
        int offset = 0;
        int k = 0;
        ${i}
        vec2 coords = offsetToCoords(offset, ${e}, ${r});
        float value = getColorAsFloat(${a.texture2D}(A, coords));
        return value;
      }
      `;
      }, mb = (a, t, o, e, r, n) => {
        let s = t.length, i = "";
        for (let u2 = s - 1; u2 >= 0; --u2) i += `
        k = m[${u2}] - ${n[u2]};
        if (k < 0)  k = 0;
        if (k >= ${t[u2]}) k = ${t[u2] - 1};
        offset += k * ${o[u2]};
      `;
        return `
      float padA(int m[${s}]) {
        int offset = 0;
        int k = 0;
        ${i}
        vec2 coords = offsetToCoords(offset, ${e}, ${r});
        float value = getColorAsFloat(${a.texture2D}(A, coords));
        return value;
      }
      `;
      };
    });
    ec = L(() => {
      "use strict";
      Ue();
      fe();
      ae();
      Vf = (a, t, o) => {
        ao(t);
        let e = { name: "AveragePool", inputNames: ["X"], inputTypes: [0], cacheHint: o.cacheKey };
        return [a.run({ ...e, get: () => Hf(t, e, false, o) }, t)];
      }, Wf = (a) => {
        let t = a.attributes.getString("auto_pad", "NOTSET"), o = a.attributes.getInt("ceil_mode", 0), e = a.attributes.getInt("count_include_pad", 0) !== 0, r = a.attributes.getInts("kernel_shape"), n = a.attributes.getInts("strides", []), s = a.attributes.getInts("pads", []);
        if (o !== 0) throw new Error("using ceil() in shape computation is not yet supported for AveragePool");
        return Q({ autoPad: t, ceilMode: o, countIncludePad: e, kernelShape: r, strides: n, pads: s });
      }, Hf = (a, t, o, e) => {
        let [r, n] = Jf(a, e, o), s = U.size(r.kernelShape), i = "value += _X(x);", u2 = "";
        r.countIncludePad ? u2 += `value /= float(${s});` : u2 += `value /= float(${s} - pad);`;
        let c2 = `
        ${Qf(a[0].dims, r, i, u2, "0.0")}
      `;
        return { ...t, output: { dims: n, type: a[0].type, textureType: 0 }, shaderSource: c2 };
      }, qf = (a, t, o) => {
        ao(t);
        let e = { name: "GlobalAveragePool", inputNames: ["X"], inputTypes: [0], cacheHint: `${o.countIncludePad}` };
        return [a.run({ ...e, get: () => Hf(t, e, true, o) }, t)];
      }, jf = (a) => {
        let t = a.attributes.getInt("count_include_pad", 0) !== 0;
        return Q({ autoPad: "", ceilMode: 0, countIncludePad: t, kernelShape: [], strides: [], pads: [] });
      }, Yf = (a, t, o) => {
        ao(t);
        let e = { name: "MaxPool", inputNames: ["X"], inputTypes: [0], cacheHint: o.cacheKey };
        return [a.run({ ...e, get: () => Kf(t, e, false, o) }, t)];
      }, Xf = (a) => {
        let t = a.attributes.getString("auto_pad", "NOTSET"), o = a.attributes.getInt("ceil_mode", 0), e = a.attributes.getInts("kernel_shape"), r = a.attributes.getInts("strides", []), n = a.attributes.getInts("pads", []), s = a.attributes.getInt("storage_order", 0), i = a.attributes.getInts("dilations", []);
        if (s !== 0) throw new Error("column major storage order is not yet supported for MaxPool");
        if (o !== 0) throw new Error("using ceil() in shape computation is not yet supported for MaxPool");
        return Q({ autoPad: t, ceilMode: o, countIncludePad: false, kernelShape: e, strides: r, pads: n, storageOrder: s, dilations: i });
      }, Kf = (a, t, o, e) => {
        let [r, n] = Jf(a, e, o), s = `
      value = max(_X(x), value);
    `, i = "", l = `
      ${Qf(a[0].dims, r, s, i, "-1e5")}
    `;
        return { ...t, output: { dims: n, type: a[0].type, textureType: 0 }, shaderSource: l };
      }, Jf = (a, t, o) => {
        let e = a[0].dims.slice(), r = Object.hasOwnProperty.call(t, "dilations"), n = t.kernelShape.slice(), s = t.strides.slice(), i = r ? t.dilations.slice() : [], u2 = t.pads.slice();
        mr.adjustPoolAttributes(o, e, n, s, i, u2);
        let l = mr.computePoolOutputShape(o, e, s, i, n, u2, t.autoPad), c2 = Object.assign({}, t);
        return r ? Object.assign(c2, { kernelShape: n, strides: s, pads: u2, dilations: i, cacheKey: t.cacheKey }) : Object.assign(c2, { kernelShape: n, strides: s, pads: u2, cacheKey: t.cacheKey }), [c2, l];
      }, bb = { autoPad: "", ceilMode: 0, countIncludePad: false, kernelShape: [], strides: [], pads: [], storageOrder: 0, dilations: [], cacheKey: "" }, zf = { name: "GlobalMaxPool", inputNames: ["X"], inputTypes: [0] }, Zf = (a, t) => (ao(t), [a.run({ ...zf, get: () => Kf(t, zf, true, bb) }, t)]), ao = (a) => {
        if (!a || a.length !== 1) throw new Error("Pool ops requires 1 input.");
        if (a[0].type !== "float32" && a[0].type !== "float64") throw new Error("Invalid input type.");
      }, Qf = (a, t, o, e, r) => {
        let n = a.length;
        if (t.kernelShape.length <= 2) {
          let s = t.kernelShape[t.kernelShape.length - 1], i = t.strides[t.strides.length - 1], u2 = t.pads[t.pads.length / 2 - 1], l = t.pads[t.pads.length - 1], c2 = a[n - 1], p2 = "", d = "", T = "";
          if (u2 + l !== 0 ? p2 = `
          for (int i = 0; i < ${s}; i++) {
            x[${n} - 1] = indices[${n} - 1] * ${i} - ${u2} + i;
            if (x[${n} - 1] < 0 || x[${n} - 1] >= ${c2}) {
              pad++;
              continue;
            }
            ${o}
          }` : p2 = `
          for (int i = 0; i < ${s}; i++) {
            x[${n} - 1] = indices[${n} - 1] * ${i} - ${u2} + i;
            ${o}
          }`, t.kernelShape.length === 2) {
            let v = t.kernelShape[t.kernelShape.length - 2], S2 = t.strides[t.strides.length - 2], A = t.pads[t.pads.length / 2 - 2], C = t.pads[t.pads.length - 2], F2 = a[n - 2];
            A + C !== 0 ? d = `
            for (int j = 0; j < ${v}; j++) {
              x[${n} - 2] = indices[${n} - 2] * ${S2} - ${A} + j;
              if (x[${n} - 2] < 0 || x[${n} - 2] >= ${F2}) {
                pad+= ${s};
                continue;
              }
          ` : d = `
            for (int j = 0; j < ${v}; j++) {
              x[${n} - 2] = indices[${n} - 2] * ${S2} - ${A} + j;
            `, T = `
          }
        `;
          }
          return `
        float process(int indices[${n}]) {
          int x[${n}];
          copyVec(indices, x);

          float value = ${r};
          int pad = 0;
          ${d}
          ${p2}
          ${T}
          ${e}
          return value;
        }
      `;
        } else {
          let s = U.size(t.kernelShape), i = U.computeStrides(t.kernelShape), u2 = i.length, l = t.pads.length, c2 = gb(u2), p2 = io(a, "inputDims"), d = io(t.pads, "pads"), T = io(i, "kernelStrides"), w = io(t.strides, "strides"), v = t.pads.reduce((C, F2) => C + F2), S2 = "";
          return v ? S2 = `
            if (x[j] >= inputDims[j] || x[j] < 0) {
              pad++;
              isPad = true;
              break;
            }
          }
          if (!isPad) {
            ${o}
          }` : S2 = `
          }
          ${o}
        `, `
        ${c2}
        float process(int indices[${n}]) {
          int x[${n}];
          copyVec(indices, x);
          int offset[${u2}];
          int pads[${l}];
          int inputDims[${n}];
          int kernelStrides[${u2}];
          int strides[${u2}];
          ${d}
          ${p2}
          ${w}
          ${T}

          float value = ${r};
          int pad = 0;
          bool isPad = false;
          for (int i = 0; i < ${s}; i++) {
            offsetToIndices(i, kernelStrides, offset);
            isPad = false;
            for (int j = ${n} - ${u2}; j < ${n}; j++) {
              x[j] = indices[j] * strides[j - ${n} + ${u2}]
                + offset[j - ${n} + ${u2}] - pads[j - 2];
              ${S2}
          }
          ${e}

          return value;
        }
      `;
        }
      }, io = (a, t) => {
        let o = "";
        for (let e = 0; e < a.length; e++) o += `
      ${t}[${e}] = ${a[e]};
    `;
        return o;
      }, gb = (a) => `
  void offsetToIndices(int offset, int[${a}] strides, out int[${a}] indices) {
    if (${a} == 0) {
      return;
    }
    for (int i = 0; i < ${a} - 1; ++i) {
      indices[i] = offset / strides[i];
      offset -= indices[i] * strides[i];
    }
    indices[${a} - 1] = offset;
  }`;
    });
    uc = L(() => {
      "use strict";
      Ue();
      pn();
      fe();
      ae();
      vr = (a, t, o, e, r) => {
        Tb(t);
        let n = { name: e, inputNames: ["A"], inputTypes: [0] };
        return [a.run({ ...n, cacheHint: o.cacheKey, get: () => yb(a, t, o, e, r, n) }, t)];
      }, er = (a) => {
        let t = a.attributes.getInts("axes", []), o = a.attributes.getInt("keepdims", 1) === 1;
        return Q({ axes: t, keepDims: o });
      }, yb = (a, t, o, e, r, n) => {
        let s = [], i = t[0].dims.length || 1, u2 = [], l = U.normalizeAxes(o.axes, t[0].dims.length), c2 = r(t, l), p2 = c2[1];
        for (let w = 0; w < t[0].dims.length; w++) l.indexOf(w) >= 0 || l.length === 0 ? (o.keepDims && s.push(1), p2 = `
          for(int j${w} = 0; j${w} < ${t[0].dims[w]}; j${w}++) {
            inputIdx[${w}] = j${w};
            ${p2}
          }`) : (u2.push(`inputIdx[${w}] = outputIdx[${s.length}];`), s.push(t[0].dims[w]));
        let T = `
      float process(int outputIdx[${s.length || 1}]) {
        float value;                 // final result
        int inputIdx[${i}];      // addressing input data
        ${u2.join(`
`)}
        ${c2[0]}       // init ops for reduce max/min
        ${p2}
        ${c2[2]}       // final computation for reduce mean
        return value;
      }`;
        return { ...n, output: { dims: s, type: t[0].type, textureType: 0 }, shaderSource: T };
      }, Tb = (a) => {
        if (!a || a.length !== 1) throw new Error("Reduce op requires 1 input.");
        if (Qt.indexOf(a[0].type) === -1) throw new Error("Invalid input type.");
      }, tc = (a, t, o) => vr(a, t, o, "ReduceSum", () => ["value = 0.0;", "value += _A(inputIdx);", ""]), rc = (a, t, o) => vr(a, t, o, "ReduceMean", (r, n) => {
        let s = 1;
        for (let i = 0; i < r[0].dims.length; i++) (n.indexOf(i) >= 0 || n.length === 0) && (s *= r[0].dims[i]);
        return ["value = 0.0;", "value += _A(inputIdx);", `value /= ${s}.;`];
      }), nc = (a, t, o) => vr(a, t, o, "ReduceMax", (r, n) => {
        let s = [];
        for (let i = 0; i < r[0].dims.length; i++) (n.indexOf(i) >= 0 || n.length === 0) && s.push(`inputIdx[${i}] = 0;`);
        return [`${s.join(`
`)}
value = _A(inputIdx);`, "value = max(value, _A(inputIdx));", ""];
      }), oc = (a, t, o) => vr(a, t, o, "ReduceMin", (r, n) => {
        let s = [];
        for (let i = 0; i < r[0].dims.length; i++) (n.indexOf(i) >= 0 || n.length === 0) && s.push(`inputIdx[${i}] = 0;`);
        return [`${s.join(`
`)}
value = _A(inputIdx);`, "value = min(value, _A(inputIdx));", ""];
      }), ic = (a, t, o) => vr(a, t, o, "ReduceProd", () => ["value = 1.0;", "value *= _A(inputIdx);", ""]), ac = (a, t, o) => vr(a, t, o, "ReduceLogSum", () => ["value = 0.0;", "value += _A(inputIdx);", "value = log(value);"]), sc = (a, t, o) => vr(a, t, o, "ReduceLogSumSquare", () => ["float t; value = 0.0;", "t = _A(inputIdx); value += t * t;", ""]);
    });
    fc = L(() => {
      "use strict";
      fe();
      lc = (a, t) => {
        let o = U.calculateReshapedDims(t[0].dims, t[1].integerData);
        return a.session.pack ? [a.reshapePacked(t[0], o)] : [a.reshapeUnpacked(t[0], o)];
      };
    });
    Ni = L(() => {
      "use strict";
      Ue();
      we();
      ae();
      cc = { name: "Upsample", inputNames: ["X"], inputTypes: [0] }, ki = (a, t, o) => (Bi(t, o), [a.run({ ...cc, cacheHint: o.cacheKey, get: () => xb(a, t, o) }, t)]), pc = (a) => dn(a, 7), dc = (a) => dn(a, 9), dn = (a, t) => {
        let o = t >= 10, e = a.attributes.getString("mode", "nearest");
        if (e !== "nearest" && e !== "linear" && (t < 11 || e !== "cubic")) throw new Error(`unrecognized mode: ${e}`);
        let r = [];
        t < 9 && (r = a.attributes.getFloats("scales"), so(r, e, o));
        let n = a.attributes.getFloat("extrapolation_value", 0), s = t > 10 ? a.attributes.getString("coordinate_transformation_mode", "half_pixel") : "asymmetric";
        if (["asymmetric", "pytorch_half_pixel", "tf_half_pixel_for_nn", "align_corners", "tf_crop_and_resize", "half_pixel"].indexOf(s) === -1) throw new Error(`coordinate_transform_mode '${s}' is not supported`);
        let i = s === "tf_crop_and_resize", u2 = i, l = e === "nearest" && t >= 11 ? a.attributes.getString("nearest_mode", "round_prefer_floor") : "";
        if (["round_prefer_floor", "round_prefer_ceil", "floor", "ceil", ""].indexOf(l) === -1) throw new Error(`nearest_mode '${l}' is not supported`);
        let c2 = a.attributes.getFloat("cubic_coeff_a", -0.75), p2 = a.attributes.getInt("exclude_outside", 0) !== 0;
        if (p2 && e !== "cubic") throw new Error("exclude_outside can be set to 1 only when mode is CUBIC.");
        let d = t < 11 ? true : e === "nearest" && s === "asymmetric" && l === "floor", T = 0, w = 0, v = 0;
        return t > 10 ? a.inputs.length > 2 ? (T = 1, w = 2, v = 3) : (w = 1, v = 2) : t === 9 && (w = 1), Q({ opset: t, isResize: o, mode: e, scales: r, extrapolationValue: n, coordinateTransformMode: s, useExtrapolation: u2, needRoiInput: i, nearestMode: l, cubicCoefficientA: c2, excludeOutside: p2, useNearest2xOptimization: d, roiInputIdx: T, scalesInputIdx: w, sizesInputIdx: v });
      }, xb = (a, t, o) => {
        let e = H(a.session.backend.glContext.version), [r, n] = a.calculateTextureWidthAndHeight(t[0].dims, 0), s = t[0].dims.map((v, S2) => Math.floor(v * o.scales[S2])), [i, u2] = a.calculateTextureWidthAndHeight(s, 0), l = s.length, c2 = new Array(l), p2 = new Array(l), d = `
      int output_pitches[${l}];
      int input_pitches[${l}];
      `;
        for (let v = l - 1; v >= 0; v--) c2[v] = v === l - 1 ? 1 : c2[v + 1] * s[v + 1], p2[v] = v === l - 1 ? 1 : p2[v + 1] * t[0].dims[v + 1], d += `
        output_pitches[${v}] = ${c2[v]};
        input_pitches[${v}] = ${p2[v]};
        `;
        let T = `
      float getInputFloat(int index) {
        vec2 coords = offsetToCoords(index, ${r}, ${n});
        float value = getColorAsFloat(${e.texture2D}(X, coords));
        return value;
      }
      `, w = o.mode === "nearest" ? `
    ${T}
    float process(int indices[${l}]) {
      int input_index = 0;
      int output_index = coordsToOffset(TexCoords, ${i}, ${u2});

      ${d}

      int d, m;
      for (int dim = 0; dim < ${l}; ++dim) {
        d = output_index / output_pitches[dim];
        m = output_index - d * output_pitches[dim];
        output_index = m;

        if (scales[dim] != 1 && d > 0) {
          int d2 = d / scales[dim];
          m = d - d2 * scales[dim];
          d = d2;
        }
        input_index += input_pitches[dim] * d;
      }

      return getInputFloat(input_index);
    }` : l === 4 ? `
    ${T}
    float process(int indices[4]) {
      int input_index = 0;
      int output_index = coordsToOffset(TexCoords, ${i}, ${u2});

      ${d}

      int m;
      int index_of_dim0, index_of_dim1, index_of_dim2, index_of_dim3;
      index_of_dim0 = output_index / output_pitches[0];
      m = output_index - index_of_dim0 * output_pitches[0];
      index_of_dim1 = m / output_pitches[1];
      m = m - index_of_dim1 * output_pitches[1];
      index_of_dim2 = m / output_pitches[2];
      m = m - index_of_dim2 * output_pitches[2];
      index_of_dim3 = m;

      int index_of_input_dim2, index_of_input_dim3, x_offset, y_offset;
      index_of_input_dim2 = index_of_dim2 / scales[2];
      y_offset = index_of_dim2 - index_of_input_dim2 * scales[2];
      index_of_input_dim3 = index_of_dim3 / scales[3];
      x_offset = index_of_dim3 - index_of_input_dim3 * scales[3];

      input_index = index_of_dim0 * input_pitches[0] +
            index_of_dim1 * input_pitches[1] +
            index_of_input_dim2 * input_pitches[2] +
            index_of_input_dim3;

      float x00 = getInputFloat(input_index);
      float x10, x01, x11;

      bool end_of_dim2 = false;
      if (index_of_input_dim2 == (${t[0].dims[2]} - 1)) {
        // It's the end in dimension 2
        x01 = x00;
        end_of_dim2 = true;
      } else {
        x01 = getInputFloat(input_index + input_pitches[2]);
      }

      if (index_of_input_dim3 == (input_pitches[2] - 1)) {
        // It's the end in dimension 3
        x10 = x00;
        x11 = x01;
      }
      else {
        x10 = getInputFloat(input_index + 1);
        x11 = end_of_dim2 ? x10 : getInputFloat(input_index + input_pitches[2] + 1);
      }

      float y0 = x00 + float(y_offset) * (x01 - x00) / float(scales[2]);
      float y1 = x10 + float(y_offset) * (x11 - x10) / float(scales[2]);
      return y0 + float(x_offset) * (y1 - y0) / float(scales[3]);
    }` : `
    ${T}
    float process(int indices[2]) {
      int input_index = 0;
      int output_index = coordsToOffset(TexCoords, ${i}, ${u2});

      ${d}

      int m;
      int index_of_dim0, index_of_dim1;
      index_of_dim0 = output_index / output_pitches[0];
      m = output_index - index_of_dim0 * output_pitches[0];
      index_of_dim1 = m;

      int index_of_input_dim0, index_of_input_dim1, x_offset, y_offset;
      index_of_input_dim0 = index_of_dim0 / scales[0];
      y_offset = index_of_dim0 - index_of_input_dim0 * scales[0];
      index_of_input_dim1 = index_of_dim1 / scales[1];
      x_offset = index_of_dim1 - index_of_input_dim1 * scales[1];

      input_index = index_of_input_dim0 * input_pitches[0] + index_of_input_dim1;

      float x00 = getInputFloat(input_index);
      float x10, x01, x11;

      bool end_of_dim0 = false;
      if (index_of_input_dim0 == (${t[0].dims[0]} - 1)) {
        // It's the end in dimension 0
        x01 = x00;
        end_of_dim0 = true;
      } else {
        x01 = getInputFloat(input_index + input_pitches[0]);
      }

      if (index_of_input_dim1 == (input_pitches[0] - 1)) {
        // It's the end in dimension 1
        x10 = x00;
        x11 = x01;
      }
      else {
        x10 = getInputFloat(input_index + 1);
        x11 = end_of_dim0 ? x10 : getInputFloat(input_index + input_pitches[0] + 1);
      }

      float y0 = x00 + float(y_offset) * (x01 - x00) / float(scales[0]);
      float y1 = x10 + float(y_offset) * (x11 - x10) / float(scales[0]);
      return y0 + float(x_offset) * (y1 - y0) / float(scales[1]);
    }`;
        return { ...cc, output: { dims: s, type: t[0].type, textureType: 0 }, shaderSource: w, variables: [{ name: "scales", type: "int", arrayLength: o.scales.length, data: o.scales.map((v) => Math.ceil(v)) }] };
      }, Bi = (a, t) => {
        if (!a || t.opset < 9 && a.length !== 1 || t.opset >= 9 && t.opset < 11 && a.length !== 2 || t.opset >= 11 && a.length < 2) throw new Error("invalid inputs.");
        if (t.scales.length > 0 && a[0].dims.length !== t.scales.length) throw new Error("Invalid input shape.");
        if (a[0].type === "string") throw new Error("Invalid input tensor types.");
      }, so = (a, t, o) => {
        if (o) {
          for (let e of a) if (e <= 0) throw new Error("Scale value should be greater than 0.");
        } else for (let e of a) if (e < 1) throw new Error("Scale value should be greater than or equal to 1.");
        if ((t === "linear" || t === "cubic") && a.length !== 2 && (a.length !== 4 || a[0] !== 1 || a[1] !== 1)) throw new Error(`'Linear' mode and 'Cubic' mode only support 2-D inputs ('Bilinear', 'Bicubic')         or 4-D inputs with the corresponding outermost 2 scale values being 1         in the ${o ? "Resize" : "Upsample"} opeartor.`);
      };
    });
    bc = L(() => {
      "use strict";
      we();
      ae();
      Bt();
      Tr();
      Ni();
      Ri = { name: "Resize", inputNames: ["A"], inputTypes: [2] }, Mi = (a, t, o) => (Bi(t, o), [a.run({ ...Ri, cacheHint: o.cacheKey, get: () => wb(a, t, o) }, t)]), hc = (a) => dn(a, 10), mc = (a) => dn(a, 11), wb = (a, t, o) => {
        let e = H(a.session.backend.glContext.version), [r, n] = vb(t, o);
        if (r.every((F2) => F2 === 1) && o.coordinateTransformMode !== "tf_crop_and_resize") return { ...Ri, output: { dims: n, type: t[0].type, textureType: 2 }, hasMain: true, shaderSource: `void main() {
                    vec4 v = ${e.texture2D}(X, TexCoords);
                    ${e.output} = v;
                }` };
        let i = n.length;
        if (i < 2) throw new Error(`output dimension should be at least 2, but got ${i}`);
        let u2 = n[i - 2], l = n[i - 1], c2 = t[0].dims;
        if (i !== c2.length) throw new Error(`output dimension should match input ${c2.length}, but got ${i}`);
        let p2 = c2[i - 2], d = c2[i - 1], T = r[i - 2], w = r[i - 1], v = "";
        if (o.mode !== "linear") throw new Error(`resize (packed) does not support mode: '${o.mode}'`);
        switch (o.coordinateTransformMode) {
          case "asymmetric":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        return vec4(coords) / scaleWHWH;
                    }
                `;
            break;
          case "half_pixel":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        return (vec4(coords) + 0.5) / scaleWHWH - 0.5;
                    }
                `;
            break;
          case "pytorch_half_pixel":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        vec4 fcoords = vec4(coords);
                        return vec4(
                            ${l}.0 > 1.0 ? (fcoords.x + 0.5) / scaleWHWH.x - 0.5 : 0.0,
                            ${u2}.0 > 1.0 ? (fcoords.y + 0.5) / scaleWHWH.y - 0.5 : 0.0,
                            ${l}.0 > 1.0 ? (fcoords.z + 0.5) / scaleWHWH.z - 0.5 : 0.0,
                            ${u2}.0 > 1.0 ? (fcoords.w + 0.5) / scaleWHWH.w - 0.5 : 0.0
                          );
                    }
                `;
            break;
          case "align_corners":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        vec4 resized = vec4(${l}.0 - 1.0, ${u2}.0 - 1.0, ${l}.0 - 1.0,
                            ${u2}.0 - 1.0);
                        vec4 original = vec4(${d}.0 - 1.0, ${p2}.0 - 1.0, ${d}.0 - 1.0,
                            ${p2}.0 - 1.0);
                        vec4 new_scale = original / resized;
                        return vec4(coords) * new_scale;
                    }
                `;
            break;
          default:
            throw new Error(`resize (packed) does not support coordinateTransformMode:                                 '${o.coordinateTransformMode}'`);
        }
        let S2 = Qe(i), A = Nt(), C = `
            const vec2 inputWH = vec2(${p2}.0, ${d}.0);
            const vec4 scaleWHWH = vec4(float(${T}), float(${w}), float(${T}), float(${w}));
            ${A}
            ${v}
            float getAValue(int x10, int r, int c, int d) {
                return getChannel(getA(x10, r, c, d), vec2(c, d));
            }
            void main() {
                ${S2} rc = getOutputCoords();

                int batch = rc[0];
                int depth = rc[1];

                // retrieve the 4 coordinates that is used in the 4 packed output values.
                ivec4 coords = ivec4(rc.wz, rc.w + 1, rc.z + 1);

                // calculate the source index in fraction
                vec4 sourceFrac = getSourceFracIndex(coords);

                // get the lower and upper bound of the 4 values that will be packed into one texel.
                ivec4 x00 = ivec4(max(sourceFrac.xy, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.xy)));
                ivec4 x01 = ivec4(max(sourceFrac.xw, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.xw)));
                ivec4 x10 = ivec4(max(sourceFrac.zy, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.zy)));
                ivec4 x11 = ivec4(max(sourceFrac.zw, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.zw)));

                bool hasNextRow = rc.w < ${u2 - 1};
                bool hasNextCol = rc.z < ${l - 1};

                // pack x00, x01, x10, x11's top-left corner into one vec4 structure
                vec4 topLeft = vec4(
                    getAValue(batch, depth, x00.x, x00.y),
                    hasNextCol ? getAValue(batch, depth, x01.x, x01.y) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.x, x10.y) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.x, x11.y) : 0.0);

                // pack x00, x01, x10, x11's top-right corner into one vec4 structure
                vec4 topRight = vec4(
                    getAValue(batch, depth, x00.x, x00.w),
                    hasNextCol ? getAValue(batch, depth, x01.x, x01.w) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.x, x10.w) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.x, x11.w) : 0.0);

                // pack x00, x01, x10, x11's bottom-left corner into one vec4 structure
                vec4 bottomLeft = vec4(
                    getAValue(batch, depth, x00.z, x00.y),
                    hasNextCol ? getAValue(batch, depth, x01.z, x01.y) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.z, x10.y) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.z, x11.y) : 0.0);

                // pack x00, x01, x10, x11's bottom-right corner into one vec4 structure
                vec4 bottomRight = vec4(
                    getAValue(batch, depth, x00.z, x00.w),
                    hasNextCol ? getAValue(batch, depth, x01.z, x01.w) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.z, x10.w) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.z, x11.w) : 0.0);

                // calculate the interpolation fraction on u and v direction
                vec4 frac = vec4(sourceFrac) - floor(sourceFrac);
                vec4 clampFrac = clamp(frac, vec4(0.0), vec4(1.0));

                vec4 top = mix(topLeft, topRight, clampFrac.ywyw);
                vec4 bottom = mix(bottomLeft, bottomRight, clampFrac.ywyw);
                vec4 newValue = mix(top, bottom, clampFrac.xxzz);

                ${e.output} = vec4(newValue);
            }
        `;
        return { ...Ri, output: { dims: n, type: t[0].type, textureType: 2 }, hasMain: true, shaderSource: C };
      }, vb = (a, t) => {
        let e = a[0].dims, r = t.scales, n;
        if (r.length === 0) {
          let i = a[t.scalesInputIdx];
          if (i && i.size !== 0) {
            if (a[t.sizesInputIdx]) throw new Error("Only one of scales or sizes must be provided as input.");
            r = _b(i, t.mode, t.isResize);
          } else {
            let u2 = a[t.sizesInputIdx];
            if (!u2 || u2.size === 0) throw new Error("Either scales or sizes MUST be provided as input.");
            n = Array.from(u2.integerData), r = Ob(n, e, t.mode, t.isResize);
          }
        } else if (a[t.sizesInputIdx]) throw new Error("Only one of scales or sizes must be provided as input.");
        let s = n || e.map((i, u2) => Math.floor(i * r[u2]));
        return [r, s];
      }, _b = (a, t, o) => {
        let e = Array.from(a.floatData);
        return so(e, t, o), e;
      }, Ob = (a, t, o, e) => {
        let r = t.length, n = new Array(r);
        for (let s = 0, i = r; s < i; s++) if (t[s] === 0) {
          if (a[s] !== 0) throw new Error("Input dim is zero but required output dim is non-zero.");
          n[s] = 1;
        } else n[s] = a[s] / t[s];
        return so(n, o, e), n;
      };
    });
    yc = L(() => {
      "use strict";
      yr();
      gc = (a, t) => (Ib(t), [new $e([t[0].dims.length], "int32", void 0, void 0, new Int32Array(t[0].dims))]), Ib = (a) => {
        if (!a || a.length !== 1) throw new Error("Shape requires 1 input.");
      };
    });
    _c = L(() => {
      "use strict";
      Ue();
      pn();
      fe();
      ae();
      Gi = { name: "Slice", inputNames: ["A"], inputTypes: [0] }, Tc = (a, t, o) => (Sb(t), [a.run({ ...Gi, cacheHint: o.cacheKey, get: () => wc(a, t[0], o) }, t)]), xc = (a) => {
        let t = a.attributes.getInts("starts"), o = a.attributes.getInts("ends"), e = a.attributes.getInts("axes", []);
        return Q({ starts: t, ends: o, axes: e });
      }, wc = (a, t, o) => {
        let e = o.axes.length === 0 ? t.dims.slice(0).map((p2, d) => d) : o.axes, r = U.normalizeAxes(e, t.dims.length), n = o.starts.map((p2, d) => p2 > t.dims[r[d]] - 1 ? t.dims[r[d]] : U.normalizeAxis(p2, t.dims[r[d]])), s = o.ends.map((p2, d) => p2 > t.dims[r[d]] - 1 ? t.dims[r[d]] : U.normalizeAxis(p2, t.dims[r[d]])), i = t.dims.slice(), u2 = [];
        for (let p2 = 0; p2 < r.length; p2++) i[r[p2]] = s[p2] - n[p2], n[p2] > 0 && u2.push(`outputIdx[${r[p2]}] += ${n[p2]};`);
        let c2 = `
      float process(int outputIdx[${i.length}]) {
        ${u2.join(`
      `)}
        return _A(outputIdx);
      }`;
        return { ...Gi, output: { dims: i, type: t.type, textureType: 0 }, shaderSource: c2 };
      }, Sb = (a) => {
        if (!a || a.length !== 1) throw new Error("Slice requires 1 input.");
        if (Qt.indexOf(a[0].type) === -1) throw new Error("Invalid input type.");
      }, vc = (a, t) => {
        Pb(t);
        let o = Ab(a, t);
        return [a.run({ ...Gi, cacheHint: o.cacheKey, get: () => wc(a, t[0], o) }, [t[0]])];
      }, Ab = (a, t) => {
        if (!a.session.isInitializer(t[1].dataId) || !a.session.isInitializer(t[2].dataId) || t.length >= 4 && !a.session.isInitializer(t[3].dataId) || t.length >= 5 && !a.session.isInitializer(t[4].dataId)) throw new Error("dynamic slice attributes are not allowed");
        if (t.length >= 5 && t[4].integerData.some((s) => s !== 1)) throw new Error("currently non-1 steps is not supported for Slice");
        let o = Array.from(t[1].integerData), e = Array.from(t[2].integerData), r = t.length >= 4 ? Array.from(t[3].integerData) : [], n = `${r};${o};${e}`;
        return { starts: o, ends: e, axes: r, cacheKey: n };
      }, Pb = (a) => {
        if (!a || a.length < 3 || a.length > 5) throw new Error("Invalid input number.");
        if (a[1].type !== "int32" || a[1].dims.length !== 1) throw new Error("Invalid input type.");
        if (a[2].type !== "int32" || a[2].dims.length !== 1) throw new Error("Invalid input type.");
        if (a.length >= 4 && (a[3].type !== "int32" || a[3].dims.length !== 1)) throw new Error("Invalid input type.");
        if (a.length >= 5 && (a[4].type !== "int32" || a[4].dims.length !== 1)) throw new Error("Invalid input type.");
      };
    });
    Fc = L(() => {
      "use strict";
      Ue();
      fe();
      we();
      ae();
      oo();
      Oc = { name: "SoftmaxComputeMax", inputNames: ["A"], inputTypes: [0] }, Ic = { name: "SoftmaxComputeScale", inputNames: ["A", "Max"], inputTypes: [0, 0] }, Sc = { name: "SoftMax", inputNames: ["A", "Max", "Norm"], inputTypes: [0, 0, 0] }, Ac = (a, t, o) => {
        Cc(t);
        let e = t[0].dims.slice(), r = U.normalizeAxis(o.axis, e.length), n = U.sizeToDimension(e, r), s = U.sizeFromDimension(e, r);
        return Lc(a, t, o, n, s);
      }, Pc = (a) => Q({ axis: a.attributes.getInt("axis", 1) }), Ec = (a) => Q({ axis: a.attributes.getInt("axis", -1) }), Dc = (a, t, o) => {
        Cc(t);
        let e = t[0].dims.slice(), r = U.normalizeAxis(o.axis, e.length), n = e.length, s = r !== n - 1, i = [], u2 = [], l = [], c2;
        s && (u2 = Array.from({ length: n }).map((w, v) => v), u2[r] = n - 1, u2[n - 1] = r, u2.map((w) => i.push(e[w])), c2 = Q({ perm: u2 }), l = wr(a, t, c2));
        let p2 = s ? U.sizeToDimension(i, n - 1) : U.sizeToDimension(e, n - 1), d = s ? U.sizeFromDimension(i, n - 1) : U.sizeFromDimension(e, n - 1), T = Lc(a, s ? l : t, o, p2, d);
        return s ? wr(a, T, c2) : T;
      }, Lc = (a, t, o, e, r) => {
        let n = Eb(a, t[0], e, r, [e]), s = a.run({ ...Oc, cacheHint: o.cacheKey, get: () => n }, t), i = Db(a, t[0], e, r, n.output.dims, [e]), u2 = a.run({ ...Ic, cacheHint: o.cacheKey, get: () => i }, [t[0], s]), l = Lb(a, t[0], e, r, n.output.dims, i.output.dims);
        return [a.run({ ...Sc, cacheHint: o.cacheKey, get: () => l }, [t[0], s, u2])];
      }, Eb = (a, t, o, e, r) => {
        let [n, s] = a.calculateTextureWidthAndHeight(t.dims, 0), i = r.length;
        if (o < 1 || e < 1) throw new Error("Logical row count N and feature count D must be greater than or equal to 1");
        if (r.length !== 1) throw new Error("Dimensionality of the output should be 1");
        if (r[0] !== o) throw new Error("Shape of the output should be equal to logical row count");
        let u2 = H(a.session.backend.glContext.version), l = `
      float process(int[${i}] indices) {
        int logical_row_start_offset = indices[0] * ${e};

        float max = getColorAsFloat(${u2.texture2D}(A, offsetToCoords(logical_row_start_offset, ${n},
        ${s} )));
        for(int i=1; i<${e}; ++i)
        {
          float current = getColorAsFloat(${u2.texture2D}(A, offsetToCoords(logical_row_start_offset + i,
            ${n}, ${s})));
          if(current > max)
          max = current;
        }

        return max;
      }`;
        return { ...Oc, output: { dims: r, type: t.type, textureType: 0 }, shaderSource: l };
      }, Db = (a, t, o, e, r, n) => {
        let [s, i] = a.calculateTextureWidthAndHeight(t.dims, 0), u2 = n.length;
        if (o < 1 || e < 1) throw new Error("Logical row count N and feature count D must be greater than or equal to 1");
        if (n.length !== 1) throw new Error("Dimensionality of the output should be 1");
        if (n[0] !== o) throw new Error("Shape of the output should be equal to logical row count");
        if (r.length !== 1) throw new Error("Dimensionality of the intermediate results should be 1");
        if (r[0] !== o) throw new Error("Shape of the intermediate results should be equal to logical row count");
        let l = H(a.session.backend.glContext.version), c2 = `
      float process(int[${u2}] indices) {
        int logical_row_start_offset = indices[0] * ${e};

        float norm_factor = 0.0;
        float max = _Max(indices);
        for(int i=0; i<${e}; ++i)
        {
          norm_factor += exp(getColorAsFloat(${l.texture2D}(A, offsetToCoords(logical_row_start_offset + i,
            ${s}, ${i}))) - max);
        }

        return norm_factor;
      }`;
        return { ...Ic, output: { dims: n, type: t.type, textureType: 0 }, shaderSource: c2 };
      }, Lb = (a, t, o, e, r, n) => {
        let [s, i] = a.calculateTextureWidthAndHeight(t.dims, 0), u2 = t.dims.length;
        if (o < 1 || e < 1) throw new Error("Logical row count N and feature count D must be greater than or equal to 1");
        if (r.length !== 1 || n.length !== 1) throw new Error("Dimensionality of the intermediate results should be 1");
        if (r[0] !== o || n[0] !== o) throw new Error("Shape of the intermediate results should be equal to logical row count");
        let l = `
      float process(int[${u2}] indices) {

      // get offset of current logical tensor index from the 2-D texture coordinates (TexCoords)
      int offset = coordsToOffset(TexCoords, ${s}, ${i});

      //determine the logical row for this index
      int logical_row_index[1];
      logical_row_index[0] = offset / ${e};

      float norm_factor = _Norm(logical_row_index);

      // avoid possible division by 0
      // if norm_facor is 0, all elements are zero
      // if so, return 0
      if(norm_factor == 0.0)
        return 0.0;

      return exp(_A(indices) - _Max(logical_row_index)) / norm_factor;
    }`;
        return { ...Sc, output: { dims: t.dims, type: t.type, textureType: 0 }, shaderSource: l };
      }, Cc = (a) => {
        if (!a || a.length !== 1) throw new Error("Softmax requires 1 input.");
        if (a[0].type !== "float32" && a[0].type !== "float64") throw new Error("Invalid input type");
      };
    });
    Nc = L(() => {
      "use strict";
      Ue();
      fe();
      ae();
      $c = { name: "Split", inputNames: ["A"], inputTypes: [0] }, kc = (a, t, o) => {
        $b(t);
        let e = U.normalizeAxis(o.axis, t[0].dims.length), r = Cb(a, t, e, o), n = [];
        for (let s = 0; s < r; ++s) n.push(a.run({ ...$c, cacheHint: `${o.cacheKey};${s}`, get: () => Fb(a, t[0], o, e, s) }, t));
        return n;
      }, Bc = (a) => {
        let t = a.attributes.getInt("axis", 0), o = a.attributes.getInts("split", []), e = a.outputs.length;
        return Q({ axis: t, split: o, numOutputs: e });
      }, Cb = (a, t, o, e) => {
        let [, r] = an.splitShape(t[0].dims, o, e.split, e.numOutputs);
        return r.length;
      }, Fb = (a, t, o, e, r) => {
        let [n, s] = an.splitShape(t.dims, e, o.split, o.numOutputs), i = s[r], u2 = n[r], c2 = `
      float process(int indices[${u2.length}]) {
        indices[${e}] += ${i};
        return _A(indices);
      }
    `;
        return { ...$c, cacheHint: `${o.cacheKey}:${r}`, output: { dims: u2, type: t.type, textureType: 0 }, shaderSource: c2 };
      }, $b = (a) => {
        if (!a || a.length !== 1) throw new Error("Split requires one input.");
        if (a[0].type !== "int8" && a[0].type !== "uint8" && a[0].type !== "int16" && a[0].type !== "uint16" && a[0].type !== "int32" && a[0].type !== "uint32" && a[0].type !== "float32" && a[0].type !== "float64" && a[0].type !== "bool") throw new Error("Invalid input type.");
      };
    });
    Gc = L(() => {
      "use strict";
      fe();
      Ui = (a, t, o) => {
        kb(t);
        let e = U.squeezeShape(t[0].dims, o);
        return [a.reshapeUnpacked(t[0], e)];
      }, Rc = (a, t) => (Bb(t), Ui(a, [t[0]], Array.from(t[1].integerData))), Mc = (a) => a.attributes.getInts("axes"), kb = (a) => {
        if (!a || a.length !== 1) throw new Error("Squeeze requires 1 input.");
        if (a[0].type === "string") throw new Error("invalid input tensor types.");
      }, Bb = (a) => {
        if (!a || a.length !== 2) throw new Error("Squeeze requires 2 inputs.");
        if (a[1].type !== "int32") throw new Error("Invalid input type.");
      };
    });
    zc = L(() => {
      "use strict";
      we();
      ae();
      Uc = (a, t) => {
        Rb(t);
        let o = { name: "Sum", inputNames: t.map((r, n) => `X${n}`), inputTypes: new Array(t.length).fill(0) };
        return [a.run({ ...o, get: () => Nb(a, t, o) }, t)];
      }, Nb = (a, t, o) => {
        let e = H(a.session.backend.glContext.version), r = t[0].dims.slice(), s = `
      void main() {
        vec4 result = ${t.map((i, u2) => `${e.texture2D}(X${u2},TexCoords)`).join(" + ")};
        ${e.output} = result;
      }
    `;
        return { ...o, output: { dims: r, type: t[0].type, textureType: 0 }, hasMain: true, shaderSource: s };
      }, Rb = (a) => {
        if (!a || a.length === 0) throw new Error("Sum requires inputs.");
        let t = a[0].dims.length;
        for (let o = 1; o < a.length; o++) {
          if (t !== a[o].dims.length) throw new Error("Input shapes are mismatched.");
          for (let e = 0; e < t; e++) if (a[0].dims[e] !== a[o].dims[e]) throw new Error("Input shapes are not matched.");
        }
        if (a[0].type !== "float32" && a[0].type !== "float64") throw new Error("Invalid input type.");
        for (let o = 1; o < a.length; o++) if (a[0].type !== a[o].type) throw new Error("Input types are not matched.");
      };
    });
    Wc = L(() => {
      "use strict";
      pn();
      ae();
      Vc = (a, t) => {
        Gb(t);
        let o = { name: "Tile", inputNames: ["A"], inputTypes: [0] };
        return [a.run({ ...o, get: () => Mb(a, t, o) }, t)];
      }, Mb = (a, t, o) => {
        let e = t[0].dims.slice(), r = new Array(e.length), n = [];
        for (let u2 = 0; u2 < e.length; u2++) r[u2] = e[u2] * t[1].numberData[u2], n.push(`inputIdx[${u2}] = int(mod(float(outputIdx[${u2}]), ${e[u2]}.));`);
        let s = r.length, i = `
      float process(int outputIdx[${s}]) {
        int inputIdx[${s}];
        ${n.join(`
`)}
        return _A(inputIdx);
      }
    `;
        return { ...o, output: { dims: r, type: t[0].type, textureType: 0 }, shaderSource: i };
      }, Gb = (a) => {
        if (!a || a.length !== 2) throw new Error("Tile requires 2 input.");
        if (a[1].dims.length !== 1) throw new Error("The second input shape must 1 dimension.");
        if (a[1].dims[0] !== a[0].dims.length) throw new Error("Invalid input shape.");
        if (Qt.indexOf(a[0].type) === -1) throw new Error("Invalid input type.");
        if (a[1].type !== "int32" && a[1].type !== "int16") throw new Error("Invalid repeat type.");
      };
    });
    jc = L(() => {
      "use strict";
      fe();
      zi = (a, t, o) => {
        Ub(t);
        let e = U.unsqueezeShape(t[0].dims, o);
        return [a.reshapeUnpacked(t[0], e)];
      }, Hc = (a, t) => (zb(t), zi(a, [t[0]], Array.from(t[1].integerData))), qc = (a) => a.attributes.getInts("axes"), Ub = (a) => {
        if (!a || a.length !== 1) throw new Error("Unsqueeze requires 1 input.");
        if (a[0].type === "string") throw new Error("invalid input tensor types.");
      }, zb = (a) => {
        if (!a || a.length !== 2) throw new Error("Unsqueeze requires 2 inputs.");
        if (a[1].type !== "int32") throw new Error("Invalid input type.");
      };
    });
    Xc = L(() => {
      "use strict";
      ol();
      gl();
      xl();
      Sl();
      to();
      ff();
      bf();
      Tf();
      vf();
      Sf();
      Ef();
      Ff();
      Nf();
      ro();
      Uf();
      ec();
      uc();
      fc();
      bc();
      yc();
      _c();
      Fc();
      Nc();
      Gc();
      zc();
      Wc();
      oo();
      Ii();
      jc();
      Ni();
      Yc = [["Abs", "", "6+", Al], ["Acos", "", "7+", Pl], ["Add", "", "7+", il], ["And", "", "7+", al], ["Asin", "", "7+", El], ["Atan", "", "7+", Dl], ["AveragePool", "", "7+", Vf, Wf], ["BatchNormalization", "", "7+", rl, nl], ["Cast", "", "6+", yl, Tl], ["Ceil", "", "6+", Fl], ["Clip", "", "6-10", _i, Ll], ["Clip", "", "11+", Cl], ["Concat", "", "4+", _l, Il], ["Conv", "", "1+", Li, Ci], ["ConvTranspose", "", "1+", uf, lf], ["Cos", "", "7+", $l], ["Div", "", "7+", sl], ["Dropout", "", "7+", Oi], ["DepthToSpace", "", "1+", hf, mf], ["Equal", "", "7+", ul], ["Elu", "", "6+", kl, Bl], ["Exp", "", "6+", Nl], ["Flatten", "", "1+", gf, yf], ["Floor", "", "6+", Rl], ["FusedConv", "com.microsoft", "1+", Li, Ci], ["Gather", "", "1+", xf, wf], ["Gemm", "", "7-10", Fi, Of], ["Gemm", "", "11+", Fi, If], ["GlobalAveragePool", "", "1+", qf, jf], ["GlobalMaxPool", "", "1+", Zf], ["Greater", "", "7+", ll], ["Identity", "", "1+", Oi], ["ImageScaler", "", "1+", Af, Pf], ["InstanceNormalization", "", "6+", Lf, Cf], ["LeakyRelu", "", "6+", Ml, Gl], ["Less", "", "7+", fl], ["LRN", "", "1+", $f, kf], ["Log", "", "6+", Ul], ["MatMul", "", "1+", ef, tf], ["MaxPool", "", "1+", Yf, Xf], ["Mul", "", "7+", cl], ["Neg", "", "6+", zl], ["Not", "", "1+", Vl], ["Or", "", "7+", pl], ["Pad", "", "2-10", $i, Rf], ["Pad", "", "11+", Mf, Gf], ["Pow", "", "7+", dl], ["PRelu", "", "7+", hl], ["ReduceLogSum", "", "1+", ac, er], ["ReduceMax", "", "1+", nc, er], ["ReduceMean", "", "1+", rc, er], ["ReduceMin", "", "1+", oc, er], ["ReduceProd", "", "1+", ic, er], ["ReduceSum", "", "1-12", tc, er], ["ReduceSumSquare", "", "1+", sc, er], ["Relu", "", "6+", Wl], ["Reshape", "", "5+", lc], ["Resize", "", "10", Mi, hc], ["Resize", "", "11+", Mi, mc], ["Shape", "", "1+", gc], ["Sigmoid", "", "6+", Hl], ["Sin", "", "7+", ql], ["Slice", "", "10+", vc], ["Slice", "", "1-9", Tc, xc], ["Softmax", "", "1-12", Ac, Pc], ["Softmax", "", "13+", Dc, Ec], ["Split", "", "2-12", kc, Bc], ["Sqrt", "", "6+", jl], ["Squeeze", "", "1-12", Ui, Mc], ["Squeeze", "", "13+", Rc], ["Sub", "", "7+", ml], ["Sum", "", "6+", Uc], ["Tan", "", "7+", Yl], ["Tanh", "", "6+", Xl], ["Tile", "", "6+", Vc], ["Transpose", "", "1+", wr, pf], ["Upsample", "", "7-8", ki, pc], ["Upsample", "", "9", ki, dc], ["Unsqueeze", "", "1-12", zi, qc], ["Unsqueeze", "", "13+", Hc], ["Xor", "", "7+", bl]];
    });
    Zc = L(() => {
      "use strict";
      Kc = /@inline[\s\n\r]+(\w+)[\s\n\r]+([0-9a-zA-Z_]+)\s*\(([^)]*)\)\s*{(([^}]|[\n\r])*)}/gm, Vb = "(\\w+)?\\s+([_0-9a-zA-Z]+)\\s+=\\s+__FUNC__\\((.*)\\)\\s*;";
    });
    Vi = L(() => {
      "use strict";
      lt();
      fe();
      uo = class {
        constructor(t) {
          this.maxTextureSize = t;
        }
        computeTextureWH(t, o) {
          let e = this.computeTexture(t, o);
          return o && o.isPacked && (e[0] /= 2, e[1] /= 2), o && o.reverseWH ? [e[1], e[0]] : e;
        }
        computeTexture(t, o) {
          let e = o && o.isPacked;
          if (t.length === 0) return e ? [2, 2] : [1, 1];
          let r = this.maxTextureSize;
          if (o && o.breakAxis !== void 0) {
            let i = o.breakAxis >= t.length ? 1 : t.slice(o.breakAxis).reduce((l, c2) => l * c2), u2 = o.breakAxis <= 0 ? 1 : t.slice(0, o.breakAxis).reduce((l, c2) => l * c2);
            if (i > r || u2 > r) ce.verbose("TextureLayout", `Given width/height preferences were unattainable: shape:${t}, breakAxis:${o.breakAxis}`);
            else return [i, u2];
          }
          let n = t.slice(0);
          e && (r = r * 2, n = n.map((i, u2) => u2 >= n.length - 2 ? n[u2] % 2 === 0 ? n[u2] : n[u2] + 1 : n[u2]), n.length === 1 && (n = [2, n[0]])), n.length !== 2 && (n = Mr(n).newShape);
          let s = qb(n);
          return n.length <= 1 && s <= r ? [1, s] : n.length === 2 && n[0] <= r && n[1] <= r ? n : n.length === 3 && n[0] * n[1] <= r && n[2] <= r ? [n[0] * n[1], n[2]] : n.length === 3 && n[0] <= r && n[1] * n[2] <= r ? [n[0], n[1] * n[2]] : n.length === 4 && n[0] * n[1] * n[2] <= r && n[3] <= r ? [n[0] * n[1] * n[2], n[3]] : n.length === 4 && n[0] <= r && n[1] * n[2] * n[3] <= r ? [n[0], n[1] * n[2] * n[3]] : e ? Qc(s / 4).map((i) => i * 2) : Qc(s);
        }
      };
    });
    ep = L(() => {
      "use strict";
      fe();
      Wt();
      we();
      Vi();
      Bt();
      lo = class extends dt {
        constructor(o) {
          super(o);
        }
        getFunctions() {
          return { ...this.offsetToCoords(), ...this.coordsToOffset(), ...this.toVec(), ...this.valueFrom(), ...this.getCommonUtilFuncs(), ...this.getInputsSamplingSnippets(), ...this.getOutputSamplingSnippet() };
        }
        getCustomTypes() {
          return {};
        }
        offsetToCoords() {
          let o = "offsetToCoords";
          return { offsetToCoords: new R(`
      vec2 ${o}(int offset, int width, int height) {
        int t = offset / width;
        int s = offset - t*width;
        vec2 coords = (vec2(s,t) + vec2(0.5,0.5)) / vec2(width, height);
        return coords;
      }
      `) };
        }
        coordsToOffset() {
          let o = "coordsToOffset";
          return { coordsToOffset: new R(`
      int ${o}(vec2 coords, int width, int height) {
        float s = coords.s * float(width);
        float t = coords.t * float(height);
        int offset = int(t) * width + int(s);
        return offset;
      }
      `) };
        }
        getOutputSamplingSnippet() {
          let o = this.context.outputTextureLayout;
          return o.isPacked ? this.getPackedOutputSamplingSnippet(o) : this.getUnpackedOutputSamplingSnippet(o);
        }
        getPackedOutputSamplingSnippet(o) {
          let e = o.unpackedShape, r = [o.width, o.height], n = {}, s = "getOutputCoords";
          switch (e.length) {
            case 0:
              n[s] = this.getOutputScalarCoords();
              break;
            case 1:
              n[s] = this.getOutputPacked1DCoords(e, r);
              break;
            case 2:
              n[s] = this.getOutputPacked2DCoords(e, r);
              break;
            case 3:
              n[s] = this.getOutputPacked3DCoords(e, r);
              break;
            default:
              n[s] = this.getOutputPackedNDCoords(e, r);
          }
          let u2 = `
      void setOutput(vec4 val) {
        ${H(this.context.glContext.version).output} = val;
      }
    `, l = "floatTextureSetRGBA";
          return n[l] = new R(u2), n;
        }
        getUnpackedOutputSamplingSnippet(o) {
          let e = o.unpackedShape, r = [o.width, o.height], n = {}, s = "getOutputCoords";
          switch (e.length) {
            case 0:
              n[s] = this.getOutputScalarCoords();
              break;
            case 1:
              n[s] = this.getOutputUnpacked1DCoords(e, r);
              break;
            case 2:
              n[s] = this.getOutputUnpacked2DCoords(e, r);
              break;
            case 3:
              n[s] = this.getOutputUnpacked3DCoords(e, r);
              break;
            case 4:
              n[s] = this.getOutputUnpacked4DCoords(e, r);
              break;
            case 5:
              n[s] = this.getOutputUnpacked5DCoords(e, r);
              break;
            case 6:
              n[s] = this.getOutputUnpacked6DCoords(e, r);
              break;
            default:
              throw new Error(`Unsupported output dimensionality: ${e.length}`);
          }
          let u2 = `
        void setOutput(float val) {
          ${H(this.context.glContext.version).output} = vec4(val, 0, 0, 0);
        }
    `, l = "floatTextureSetR";
          return n[l] = new R(u2), n;
        }
        getOutputScalarCoords() {
          return new R(`
      int getOutputCoords() {
        return 0;
      }
    `);
        }
        getOutputPacked1DCoords(o, e) {
          let r = e, n = "";
          return r[0] === 1 ? (n = `
          int getOutputCoords() {
            return 2 * int(TexCoords.y * ${r[1]}.0);
          }
        `, new R(n)) : r[1] === 1 ? (n = `
          int getOutputCoords() {
            return 2 * int(TexCoords.x * ${r[0]}.0);
          }
        `, new R(n)) : (n = `
        int getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                 vec2(${r[0]}, ${r[1]}));
          return 2 * (resTexRC.y * ${r[0]} + resTexRC.x);
        }
      `, new R(n));
        }
        getOutputPacked2DCoords(o, e) {
          let r = "";
          if (hr.arraysEqual(o, e)) return r = `
        ivec2 getOutputCoords() {
          return 2 * ivec2(TexCoords.xy * vec2(${e[0]}, ${e[1]}));
        }
      `, new R(r);
          let n = e, s = Math.ceil(o[1] / 2);
          return r = `
        ivec2 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${n[0]}, ${n[1]}));

          int index = resTexRC.y * ${n[0]} + resTexRC.x;

          // reverse r and c order for packed texture
          int r = imod(index, ${s}) * 2;
          int c = 2 * (index / ${s});

          return ivec2(r, c);
        }
      `, new R(r);
        }
        getOutputPacked3DCoords(o, e) {
          let r = [e[0], e[1]], n = Math.ceil(o[2] / 2), s = n * Math.ceil(o[1] / 2), i = `
        ivec3 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${r[0]}, ${r[1]}));
          int index = resTexRC.y * ${r[0]} + resTexRC.x;

          int b = index / ${s};
          index -= b * ${s};

          // reverse r and c order for packed texture
          int r = imod(index, ${n}) * 2;
          int c = 2 * (index / ${n});

          return ivec3(b, r, c);
        }
      `;
          return new R(i);
        }
        getOutputPackedNDCoords(o, e) {
          let r = [e[0], e[1]], n = Math.ceil(o[o.length - 1] / 2), s = n * Math.ceil(o[o.length - 2] / 2), i = s, u2 = "", l = "b, r, c";
          for (let p2 = 2; p2 < o.length - 1; p2++) i *= o[o.length - p2 - 1], u2 = `
      int b${p2} = index / ${i};
      index -= b${p2} * ${i};
    ` + u2, l = `b${p2}, ` + l;
          let c2 = `
      ivec${o.length} getOutputCoords() {
        ivec2 resTexRC = ivec2(TexCoords.xy *
                              vec2(${r[0]}, ${r[1]}));
        int index = resTexRC.y * ${r[0]} + resTexRC.x;

        ${u2}

        int b = index / ${s};
        index -= b * ${s};

        // reverse r and c order for packed texture
        int r = imod(index, ${n}) * 2;
        int c = 2 * (index / ${n});

        return ivec${o.length}(${l});
      }
    `;
          return new R(c2);
        }
        getOutputUnpacked1DCoords(o, e) {
          let r = `
        int getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${e[0]}, ${e[1]}));
          return resTexRC.y * ${e[0]} + resTexRC.x;
        }
      `;
          return new R(r);
        }
        getOutputUnpacked2DCoords(o, e) {
          let r = `
        ivec2 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${e[0]}, ${e[1]}));
          int index = resTexRC.y * ${e[0]} + resTexRC.x;
          int r = index / ${o[1]};
          int c = index - r * ${o[1]};
          return ivec2(r, c);
        }
      `;
          return new R(r);
        }
        getOutputUnpacked3DCoords(o, e) {
          let r = "", n = o.length, s = null;
          n < 2 && (s = []), s = new Array(n - 1), s[n - 2] = o[n - 1];
          for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
          let i = ["r", "c", "d"], u2 = s.map((l, c2) => {
            let p2 = `int ${i[c2]} = index / ${l}`, d = c2 === s.length - 1 ? `int ${i[c2 + 1]} = index - ${i[c2]} * ${l}` : `index -= ${i[c2]} * ${l}`;
            return `${p2}; ${d};`;
          }).join("");
          return r = `
        ivec3 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${e[0]}, ${e[1]}));
          int index = resTexRC.y * ${e[0]} + resTexRC.x;
          ${u2}
          return ivec3(r, c, d);
        }
      `, new R(r);
        }
        getOutputUnpacked4DCoords(o, e) {
          let r = "", n = o.length, s = null;
          n < 2 && (s = []), s = new Array(n - 1), s[n - 2] = o[n - 1];
          for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
          let i = ["r", "c", "d", "d2"], u2 = s.map((l, c2) => {
            let p2 = `int ${i[c2]} = index / ${l}`, d = c2 === s.length - 1 ? `int ${i[c2 + 1]} = index - ${i[c2]} * ${l}` : `index -= ${i[c2]} * ${l}`;
            return `${p2}; ${d};`;
          }).join("");
          return r = `
      ivec4 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${e[0]}, ${e[1]}));
          int index = resTexRC.y * ${e[0]} + resTexRC.x;
          ${u2}
          return ivec4(r, c, d, d2);
        }
      `, new R(r);
        }
        getOutputUnpacked5DCoords(o, e) {
          let r = "", n = o.length, s = null;
          n < 2 && (s = []), s = new Array(n - 1), s[n - 2] = o[n - 1];
          for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
          let i = ["r", "c", "d", "d2", "d3"], u2 = s.map((l, c2) => {
            let p2 = `int ${i[c2]} = index / ${l}`, d = c2 === s.length - 1 ? `int ${i[c2 + 1]} = index - ${i[c2]} * ${l}` : `index -= ${i[c2]} * ${l}`;
            return `${p2}; ${d};`;
          }).join("");
          return r = `
      ivec5 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${e[0]}, ${e[1]}));
          int index = resTexRC.y * ${e[0]} + resTexRC.x;
          ${u2}
          return ivec5(r, c, d, d2, d3);
        }
      `, new R(r);
        }
        getOutputUnpacked6DCoords(o, e) {
          let r = "", n = o.length, s = null;
          n < 2 && (s = []), s = new Array(n - 1), s[n - 2] = o[n - 1];
          for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
          let i = ["r", "c", "d", "d2", "d3", "d4"], u2 = s.map((l, c2) => {
            let p2 = `int ${i[c2]} = index / ${l}`, d = c2 === s.length - 1 ? `int ${i[c2 + 1]} = index - ${i[c2]} * ${l}` : `index -= ${i[c2]} * ${l}`;
            return `${p2}; ${d};`;
          }).join("");
          return r = `
     ivec6 getOutputCoords() {
         ivec2 resTexRC = ivec2(TexCoords.xy *
                               vec2(${e[0]}, ${e[1]}));
         int index = resTexRC.y * ${e[0]} + resTexRC.x;
         ${u2}
         return ivec6(r, c, d, d2, d3, d4);
       }
     `, new R(r);
        }
        getCommonUtilFuncs() {
          let o = {}, e = "uvFromFlat";
          o[e] = new R(`
    vec2 uvFromFlat(int texNumR, int texNumC, int index) {
      int texC = index / texNumR;
      int texR = index - texC * texNumR;
      // TODO: swap texR, texC order in following function so row is corresponding to u and column is corresponding to
      //       v.
      return (vec2(texR, texC) + halfCR) / vec2(texNumR, texNumC);
    }
    `), e = "packedUVfrom1D", o[e] = new R(`
      vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
        int texelIndex = index / 2;
        int texR = texelIndex / texNumC;
        int texC = texelIndex - texR * texNumC;
        return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
      }
      `), e = "packedUVfrom2D", o[e] = new R(`
      vec2 packedUVfrom2D(int texNumR, int texNumC, int texelsInLogicalRow, int row, int col) {
        int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
        int texR = texelIndex / texNumC;
        int texC = texelIndex - texR * texNumC;
        return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
      }
      `), e = "packedUVfrom3D", o[e] = new R(`
      vec2 packedUVfrom3D(int texNumR, int texNumC,
          int texelsInBatch, int texelsInLogicalRow, int b,
          int row, int col) {
        int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
        int texR = index / texNumC;
        int texC = index - texR * texNumC;
        return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
      }
      `), e = "sampleTexture";
          let r = H(this.context.glContext.version);
          return o[e] = new R(`
        float sampleTexture(sampler2D textureSampler, vec2 uv) {
            return ${r.texture2D}(textureSampler, uv).r;
        }`), o;
        }
        getInputsSamplingSnippets() {
          let o = {}, e = this.context.outputTextureLayout;
          return this.context.programInfo.inputNames.forEach((r, n) => {
            let s = this.context.inputTextureLayouts[n], i = Yn(r);
            s.isPacked ? o[i] = this.getPackedSamplerFromInput(i, r, s) : o[i] = this.getUnpackedSamplerFromInput(i, r, s);
            let u2 = Gu(r);
            s.unpackedShape.length <= e.unpackedShape.length && (s.isPacked ? o[u2] = this.getPackedSamplerAtOutputCoords(u2, s, e, r) : o[u2] = this.getUnpackedSamplerAtOutputCoords(u2, s, e, r));
          }), o;
        }
        getPackedSamplerAtOutputCoords(o, e, r, n) {
          let s = e.unpackedShape, i = r.unpackedShape, l = Yn(n), c2 = s.length, p2 = i.length, d = Ze.getBroadcastDims(s, i), T = Qe(p2), w = p2 - c2, v, S2 = Dt();
          c2 === 0 ? v = "" : p2 < 2 && d.length >= 1 ? v = "coords = 0;" : v = d.map((He) => `coords.${S2[He + w]} = 0;`).join(`
`);
          let A = "";
          p2 < 2 && c2 > 0 ? A = "coords" : A = s.map((He, Le) => `coords.${S2[Le + w]}`).join(", ");
          let C = "return outputValue;", J = U.size(s) === 1, ie = U.size(i) === 1;
          if (c2 === 1 && !J && !ie) C = `
        return vec4(outputValue.xy, outputValue.xy);
      `;
          else if (J && !ie) p2 === 1 ? C = `
          return vec4(outputValue.x, outputValue.x, 0., 0.);
        ` : C = `
          return vec4(outputValue.x);
        `;
          else if (d.length) {
            let He = c2 - 2, Le = c2 - 1;
            d.indexOf(He) > -1 && d.indexOf(Le) > -1 ? C = "return vec4(outputValue.x);" : d.indexOf(He) > -1 ? C = "return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);" : d.indexOf(Le) > -1 && (C = "return vec4(outputValue.xx, outputValue.zz);");
          }
          let G = `
        int lastDim = coords.${S2[p2 - 1]};
        coords.${S2[p2 - 1]} = coords.${S2[p2 - 2]};
        coords.${S2[p2 - 2]} = lastDim;
      `, Te = `
      vec4 ${o}() {
        ${T} coords = getOutputCoords();
        ${G}
        ${v}
        vec4 outputValue = ${l}(${A});
        ${C}
      }
    `;
          return new R(Te, ["coordinates.getOutputCoords"]);
        }
        getUnpackedSamplerAtOutputCoords(o, e, r, n) {
          let s = [r.width, r.height], i = [e.width, e.height], u2 = e.unpackedShape.length, l = r.unpackedShape.length, c2 = e.unpackedShape, p2 = r.unpackedShape, d = Yn(n);
          if (u2 === l && hr.arraysEqual(i, s)) {
            let J = `
          float ${o}() {
            return sampleTexture(${n}, TexCoords);
          }
        `;
            return new R(J, ["coordinates.sampleTexture"]);
          }
          let T = Qe(l), w = Ze.getBroadcastDims(c2, p2), v = l - u2, S2, A = Dt();
          u2 === 0 ? S2 = "" : l < 2 && w.length >= 1 ? S2 = "coords = 0;" : S2 = w.map((J) => `coords.${A[J + v]} = 0;`).join(`
`);
          let C = "";
          l < 2 && u2 > 0 ? C = "coords" : C = e.unpackedShape.map((J, j2) => `coords.${A[j2 + v]}`).join(", ");
          let F2 = `
        float ${o}() {
          ${T} coords = getOutputCoords();
          ${S2}
          return ${d}(${C});
        }
      `;
          return new R(F2, ["coordinates.getOutputCoords"]);
        }
        getPackedSamplerFromInput(o, e, r) {
          switch (r.unpackedShape.length) {
            case 0:
              return this.getPackedSamplerScalar(o, e);
            case 1:
              return this.getPackedSampler1D(o, e, r);
            case 2:
              return this.getPackedSampler2D(o, e, r);
            case 3:
              return this.getPackedSampler3D(o, e, r);
            default:
              return this.getPackedSamplerND(o, e, r);
          }
        }
        getUnpackedSamplerFromInput(o, e, r) {
          let n = r.unpackedShape;
          switch (n.length) {
            case 0:
              return this.getUnpackedSamplerScalar(o, e, r);
            case 1:
              return this.getUnpackedSampler1D(o, e, r);
            case 2:
              return this.getUnpackedSampler2D(o, e, r);
            case 3:
              return this.getUnpackedSampler3D(o, e, r);
            case 4:
              return this.getUnpackedSampler4D(o, e, r);
            case 5:
              return this.getUnpackedSampler5D(o, e, r);
            case 6:
              return this.getUnpackedSampler6D(o, e, r);
            default:
              throw new Error(`Unsupported dimension ${n.length}-D`);
          }
        }
        getPackedSamplerScalar(o, e) {
          let r = H(this.context.glContext.version), n = `
          vec4 ${o}() {
            return ${r.texture2D}(${e}, halfCR);
          }
        `;
          return new R(n);
        }
        getPackedSampler1D(o, e, r) {
          let n = [r.width, r.height], s = [n[1], n[0]], i = H(this.context.glContext.version), l = `vec4 ${o}(int index) {
      vec2 uv = packedUVfrom1D(
      ${s[0]}, ${s[1]}, index);
      return ${i.texture2D}(${e}, uv);
    }`;
          return new R(l, ["coordinates.packedUVfrom1D"]);
        }
        getPackedSampler2D(o, e, r) {
          let n = r.unpackedShape, s = [r.width, r.height], i = H(this.context.glContext.version), u2 = s[0], l = s[1];
          if (s != null && hr.arraysEqual(n, s)) {
            let w = `vec4 ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${l}.0, ${u2}.0);
        return ${i.texture2D}(${e}, uv);
      }`;
            return new R(w);
          }
          let c2 = s, p2 = Math.ceil(n[1] / 2), T = `vec4 ${o}(int row, int col) {
      vec2 uv = packedUVfrom2D(${c2[1]}, ${c2[0]}, ${p2}, row, col);
      return ${i.texture2D}(${e}, uv);
    }`;
          return new R(T, ["coordinates.packedUVfrom2D"]);
        }
        getPackedSampler3D(o, e, r) {
          let n = r.unpackedShape, s = [r.width, r.height], i = [s[0], s[1]], u2 = H(this.context.glContext.version);
          if (n[0] === 1) {
            let v = n.slice(1), S2 = [1, 2], A = $r(n, v), C = ["b", "row", "col"], F2 = JSON.parse(JSON.stringify(r));
            F2.unpackedShape = A;
            let J = this.getPackedSamplerFromInput(o, e, F2), ie = `${J.routineBody}
      vec4 ${o}(int b, int row, int col) {
        return ${o}(${kr(C, S2)});
      } `;
            return new R(ie, J.dependencies);
          }
          let l = i[0], c2 = i[1], p2 = Math.ceil(n[2] / 2), d = p2 * Math.ceil(n[1] / 2), w = `vec4 ${o}(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        ${c2}, ${l}, ${d}, ${p2}, b, row, col);
      return ${u2.texture2D}(${e}, uv);}`;
          return new R(w, ["coordinates.packedUVfrom3D"]);
        }
        getPackedSamplerND(o, e, r) {
          let n = r.unpackedShape, s = n.length, i = [r.width, r.height], u2 = H(this.context.glContext.version), l = [i[0], i[1]], c2 = l[1], p2 = l[0], d = Math.ceil(n[s - 1] / 2), T = d * Math.ceil(n[s - 2] / 2), w = "int b, int row, int col", v = `b * ${T} + (row / 2) * ${d} + (col / 2)`;
          for (let C = 2; C < s - 1; C++) w = `int b${C}, ` + w, T *= n[s - C - 1], v = `b${C} * ${T} + ` + v;
          let A = `vec4 ${o}(${w}) {
      int index = ${v};
      int texR = index / ${p2};
      int texC = index - texR * ${p2};
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${p2}, ${c2});
      return ${u2.texture2D}(${e}, uv);
    }`;
          return new R(A);
        }
        getUnpackedSamplerScalar(o, e, r) {
          let [n, s] = [r.width, r.height];
          if (n === 1 && s === 1) {
            let u2 = `
          float ${o}() {
            return sampleTexture(${e}, halfCR);
          }
        `;
            return new R(u2, ["coordinates.sampleTexture"]);
          }
          let i = `
        float ${o}() {
          int offset_${e} = coordsToOffset(TexCoords, ${n}, ${s});
          vec2 uv = uvFromFlat(${n}, ${s}, offset_${e});
          return sampleTexture(${e}, uv);
        }
      `;
          return new R(i, ["coordinates.uvFromFlat", "coordinates.sampleTexture", "coordinates.coordsToOffset"]);
        }
        getUnpackedSampler1D(o, e, r) {
          let n = r.width, s = r.height;
          if (s === 1 && n === 1) {
            let u2 = `
        float ${o}(int index) {
          return sampleTexture(${e}, halfCR);
        }
      `;
            return new R(u2, ["coordinates.sampleTexture"]);
          }
          if (s === 1) {
            let u2 = `
          float ${o}(int index) {
            vec2 uv = vec2((float(index) + 0.5) / ${n}.0, 0.5);
            return sampleTexture(${e}, uv);
          }
        `;
            return new R(u2, ["coordinates.sampleTexture"]);
          }
          if (n === 1) {
            let u2 = `
          float ${o}(int index) {
            vec2 uv = vec2(0.5, (float(index) + 0.5) / ${s}.0);
            return sampleTexture(${e}, uv);
          }
        `;
            return new R(u2, ["coordinates.sampleTexture"]);
          }
          let i = `
        float ${o}(int index) {
          vec2 uv = uvFromFlat(${n}, ${s}, index);
          return sampleTexture(${e}, uv);
        }
      `;
          return new R(i, ["coordinates.uvFromFlat", "coordinates.sampleTexture"]);
        }
        getUnpackedSampler2D(o, e, r) {
          let n = r.unpackedShape, s = [r.height, r.width];
          if (s != null && hr.arraysEqual(n, s)) {
            let T = s[1], w = s[0], v = `
          float ${o}(int row, int col) {
            vec2 uv = (vec2(row, col) + halfCR) / vec2(${T}.0, ${w}.0);
            return sampleTexture(${e}, uv);
          }
        `;
            return new R(v, ["coordinates.sampleTexture"]);
          }
          let { newShape: i, keptDims: u2 } = Mr(n), l = i;
          if (l.length < n.length) {
            let T = $r(n, l), w = JSON.parse(JSON.stringify(r));
            w.unpackedShape = T;
            let v = ["col", "row"], S2 = `
          ${this.getUnpackedSamplerFromInput(o, e, w).routineBody}
          float ${o}(int row, int col) {
            return ${o}(${kr(v, u2)});
          }
        `;
            return new R(S2, ["coordinates.sampleTexture"]);
          }
          let c2 = s[1], p2 = s[0];
          if (p2 === 1) {
            let T = `
          float ${o}(int row, int col) {
            int offset_${e} = coordsToOffset(TexCoords, ${c2}, ${p2});
            float index = dot(vec3(row, col, offset_${e}), vec3(${n[1]}, 1, 1));
            vec2 uv = vec2(0.5, (index + 0.5) / ${c2}.0);
            return sampleTexture(${e}, uv);
          }
        `;
            return new R(T, ["coordinates.sampleTexture", "coordinates.coordsToOffset"]);
          }
          if (c2 === 1) {
            let T = `
          float ${o}(int row, int col) {
            int offset_${e} = coordsToOffset(TexCoords, ${c2}, ${p2});
            float index = dot(vec3(row, col, offset_${e}), vec3(${n[1]}, 1, 1));
            vec2 uv = vec2((index + 0.5) / ${p2}.0, 0.5);
            return sampleTexture(${e}, uv);
          }
        `;
            return new R(T, ["coordinates.sampleTexture", "coordinates.coordsToOffset"]);
          }
          let d = `
        float ${o}(int row, int col) {
          int index = col * ${n[1]} + row;
          vec2 uv = uvFromFlat(${c2}, ${p2}, index);
          return sampleTexture(${e}, uv);
        }
      `;
          return new R(d, ["coordinates.uvFromFlat", "coordinates.sampleTexture", "coordinates.coordsToOffset"]);
        }
        getUnpackedSampler3D(o, e, r) {
          let n = r.unpackedShape, s = n[1] * n[2], i = n[2], { newShape: u2, keptDims: l } = Mr(n), c2 = u2;
          if (c2.length < n.length) {
            let w = $r(n, c2), v = ["batch", "col", "row"], S2 = JSON.parse(JSON.stringify(r));
            S2.unpackedShape = w;
            let A = this.getUnpackedSamplerFromInput(o, e, S2), C = l.reverse(), F2 = `
          ${A.routineBody}
          float ${o}(int batch, int row, int col) {
            return ${o}(${kr(v, C)});
          }
        `;
            return new R(F2, A.dependencies);
          }
          let p2 = r.width, d = r.height, T = `
          float ${o}(int depth, int row, int col) {
            // Explicitly use integer operations as dot() only works on floats.
            int index = depth * ${s} + col * ${i} + row;
            vec2 uv = uvFromFlat(${p2}, ${d}, index);
            return sampleTexture(${e}, uv);
          }
      `;
          return new R(T, ["coordinates.uvFromFlat", "coordinates.sampleTexture", "coordinates.coordsToOffset"]);
        }
        getUnpackedSampler4D(o, e, r) {
          let n = r.unpackedShape, s = n[3], i = n[2] * s, u2 = n[1] * i, l = r.width, c2 = r.height, p2 = `
        float ${o}(int row, int col, int depth, int depth2) {
          int index = row * ${u2} + col * ${i} +
              depth2 * ${s} + depth;
          vec2 uv = uvFromFlat(${l}, ${c2}, index);
          return sampleTexture(${e}, uv);
        }
      `;
          return new R(p2, ["coordinates.uvFromFlat", "coordinates.sampleTexture"]);
        }
        getUnpackedSampler5D(o, e, r) {
          let n = r.unpackedShape, s = n[4], i = n[3] * s, u2 = n[2] * i, l = n[1] * u2, { newShape: c2, keptDims: p2 } = Mr(n);
          if (c2.length < n.length) {
            let v = $r(n, c2), S2 = ["row", "col", "depth", "depth2", "depth3"], A = JSON.parse(JSON.stringify(r));
            A.unpackedShape = v;
            let C = `
          ${this.getUnpackedSamplerFromInput(o, e, A).routineBody}
          float ${o}(int row, int col, int depth, int depth2, int depth3) {
            return ${o}(${kr(S2, p2)});
          }
        `;
            return new R(C, ["coordinates.sampleTexture", "coordinates.uvFromFlat"]);
          }
          let d = r.width, T = r.height, w = `
        float ${o}(int row, int col, int depth, int depth2, int depth3) {
          int index = row * ${l} + col * ${u2} + depth * ${i} +
          depth3 * ${s} + depth2;
          vec2 uv = uvFromFlat(${d}, ${T}, index);
          return sampleTexture(${e}, uv);
        }
      `;
          return new R(w, ["coordinates.sampleTexture", "coordinates.uvFromFlat"]);
        }
        getUnpackedSampler6D(o, e, r) {
          let n = r.unpackedShape, s = n[5], i = n[4] * s, u2 = n[3] * i, l = n[2] * u2, c2 = n[1] * l, { newShape: p2, keptDims: d } = Mr(n);
          if (p2.length < n.length) {
            let S2 = $r(n, p2), A = ["row", "col", "depth", "depth2", "depth3", "depth4"], C = JSON.parse(JSON.stringify(r));
            C.unpackedShape = S2;
            let F2 = `
            ${this.getUnpackedSamplerFromInput(o, e, C).routineBody}
            float ${o}(int row, int col, int depth,
              int depth2, int depth3, int depth4) {
              return ${o}(${kr(A, d)});
            }
          `;
            return new R(F2, ["coordinates.sampleTexture", "coordinates.uvFromFlat"]);
          }
          let T = r.width, w = r.height, v = `
          float ${o}(int row, int col, int depth,
            int depth2, int depth3, int depth4) {
            int index = row * ${c2} + col * ${l} + depth * ${u2} +
            depth2 * ${i} + depth3 * ${s} + depth4;
            vec2 uv = uvFromFlat(${T}, ${w}, index);
            return sampleTexture(${e}, uv);
          }
        `;
          return new R(v, ["coordinates.uvFromFlat", "coordinates.sampleTexture", "coordinates.coordsToOffset"]);
        }
        toVec() {
          let o = this.context.outputTextureLayout, e = o.shape.length, r = o.strides, n = o.width, s = o.height, i = [];
          for (let l = 0; l < e - 1; ++l) i.push(`
        c[${l}] = offset / ${r[l]};`), i.push(`
        offset -= c[${l}] * ${r[l]};`);
          i.push(`
        c[${e - 1}] = offset;`);
          let u2 = `
      void toVec(vec2 texCoords, out int c[${e}]) {
        int offset = coordsToOffset(texCoords, ${n}, ${s});
        ${i.join("")}
      }
      void toVec(int offset, out int c[${e}]) {
        ${i.join("")}
      }
    `;
          return { toVec: new R(u2, ["coordinates.coordsToOffset"]) };
        }
        valueFrom() {
          let o = {};
          return this.context.programInfo.inputNames.forEach((e, r) => {
            let n = this.context.inputTextureLayouts[r], i = (n.unpackedShape.length > 0 ? n.unpackedShape : n.shape).length, u2 = `_${e}`;
            o[u2] = new R(this.getValueFromSingle(e, i, n.width, n.height, false), [`shapeUtils.indicesToOffset${u2}`, "coordinates.offsetToCoords", "fragcolor.getColorAsFloat"]), u2 = u2 + "_T", o[u2] = new R(this.getValueFromSingle(e, i, n.width, n.height, true), [`shapeUtils.indicesToOffset${u2}`, "coordinates.offsetToCoords", "fragcolor.getColorAsFloat"]);
          }), o;
        }
        getValueFromSingle(o, e, r, n, s) {
          let i = `_${o}`;
          s && (i = i + "_T");
          let u2 = H(this.context.glContext.version);
          return `
        float ${i}(int m[${e}]) {
          int offset = indicesToOffset${i}(m);
          vec2 coords = offsetToCoords(offset, ${r}, ${n});
          float value = getColorAsFloat(${u2.texture2D}(${o}, coords));
          return value;
        }
        `;
        }
        getPackedValueFrom(o, e, r, n, s) {
          let i = `_${o}_Pack`;
          s && (i = i + "_T");
          let u2 = H(this.context.glContext.version);
          return `
        vec4 ${i}(int m[${e}]) {
          int offset = indicesToOffset_${o}(m);
          vec2 coords = offsetToCoords(offset, ${r}, ${n});
          return ${u2.texture2D}(${o}, coords);
        }
        `;
        }
      };
    });
    tp = L(() => {
      "use strict";
      Wt();
      fo = class a extends dt {
        constructor(t) {
          super(t);
        }
        getFunctions() {
          return { ...this.encodeFloat32(), ...this.decodeFloat32() };
        }
        getCustomTypes() {
          return {};
        }
        encodeFloat32() {
          return { encode: new R(`highp vec4 encode(highp float f) {
        return vec4(f, 0.0, 0.0, 0.0);
      }
        `) };
        }
        decodeFloat32() {
          return { decode: new R(`highp float decode(highp vec4 rgba) {
        return rgba.r;
      }
        `) };
        }
        encodeUint8() {
          let t = a.isLittleEndian() ? "rgba.rgba=rgba.abgr;" : "";
          return { encode: new R(`
      highp vec4 encode(highp float f) {
        highp float F = abs(f);
        highp float Sign = step(0.0,-f);
        highp float Exponent = floor(log2(F));
        highp float Mantissa = (exp2(- Exponent) * F);
        Exponent = floor(log2(F) + 127.0) + floor(log2(Mantissa));
        highp vec4 rgba;
        rgba[0] = 128.0 * Sign  + floor(Exponent*exp2(-1.0));
        rgba[1] = 128.0 * mod(Exponent,2.0) + mod(floor(Mantissa*128.0),128.0);
        rgba[2] = floor(mod(floor(Mantissa*exp2(23.0 -8.0)),exp2(8.0)));
        rgba[3] = floor(exp2(23.0)*mod(Mantissa,exp2(-15.0)));
        ${t}
        rgba = rgba / 255.0; // values need to be normalized to [0,1]
        return rgba;
    }
        `) };
        }
        decodeUint8() {
          let t = a.isLittleEndian() ? "rgba.rgba=rgba.abgr;" : "";
          return { decode: new R(`
        highp float decode(highp vec4 rgba) {
          rgba = rgba * 255.0; // values need to be de-normalized from [0,1] to [0,255]
          ${t}
          highp float Sign = 1.0 - step(128.0,rgba[0])*2.0;
          highp float Exponent = 2.0 * mod(rgba[0],128.0) + step(128.0,rgba[1]) - 127.0;
          highp float Mantissa = mod(rgba[1],128.0)*65536.0 + rgba[2]*256.0 +rgba[3] + float(0x800000);
          highp float Result =  Sign * exp2(Exponent) * (Mantissa * exp2(-23.0 ));
          return Result;
      }
        `) };
        }
        static isLittleEndian() {
          let t = new ArrayBuffer(4), o = new Uint32Array(t), e = new Uint8Array(t);
          if (o[0] = 3735928559, e[0] === 239) return true;
          if (e[0] === 222) return false;
          throw new Error("unknown endianness");
        }
      };
    });
    rp = L(() => {
      "use strict";
      Wt();
      we();
      co = class extends dt {
        constructor(t) {
          super(t);
        }
        getFunctions() {
          return { ...this.setFragColor(), ...this.getColorAsFloat() };
        }
        getCustomTypes() {
          return {};
        }
        setFragColor() {
          let t = H(this.context.glContext.version);
          return { setFragColor: new R(`
        void setFragColor(float value) {
            ${t.output} = encode(value);
        }
        `, ["encoding.encode"]) };
        }
        getColorAsFloat() {
          return { getColorAsFloat: new R(`
        float getColorAsFloat(vec4 color) {
            return decode(color);
        }
        `, ["encoding.decode"]) };
        }
      };
    });
    np = L(() => {
      "use strict";
      Wt();
      po = class a extends dt {
        constructor(t) {
          super(t);
        }
        getFunctions() {
          return { ...this.bcastIndex(), ...this.bcastMatmulIndex(), ...this.offsetToIndices(), ...this.indicesToOffset(), ...this.incrementIndices() };
        }
        getCustomTypes() {
          return {};
        }
        bcastIndex() {
          let t = this.context.outputTextureLayout.shape.length, o = {};
          return this.context.programInfo.inputNames.forEach((e, r) => {
            let n = this.context.inputTextureLayouts[r].unpackedShape;
            if (n.length <= t) {
              let s = n.length, i = t - s, u2 = `bcastIndices_${e}`, l = "";
              for (let p2 = 0; p2 < s; ++p2) l += `
          realIndices[${p2}] = int( mod(float(bcastedIndices[${i + p2}]), ${n[p2]}.0) );
          `;
              let c2 = `
        void ${u2} (int bcastedIndices[${t}], out int realIndices[${s}]) {
          ${l}
        }
        `;
              o[u2] = new R(c2);
            }
          }), o;
        }
        bcastMatmulIndex() {
          let t = this.context.outputTextureLayout.shape.length, o = {};
          return this.context.programInfo.inputNames.forEach((e, r) => {
            let n = this.context.inputTextureLayouts[r].shape;
            if (!(n.length < 2 || n.length > t)) {
              let s = n.length, i = t - s, u2 = `bcastMatmulIndices_${e}`, l = "";
              for (let p2 = 0; p2 < s - 2; ++p2) l += `
          realIndices[${p2}] = int( mod(float(bcastedIndices[${i + p2}]), ${n[p2]}.0) );
          `;
              let c2 = `
        void ${u2}(int bcastedIndices[${t}], out int realIndices[${s}]) {
          ${l}
          realIndices[${s - 1}] = bcastedIndices[${t - 1}];
          realIndices[${s - 2}] = bcastedIndices[${t - 2}];
        }
        `;
              o[u2] = new R(c2);
            }
          }), o;
        }
        indicesToOffset() {
          let t = {};
          return this.context.programInfo.inputNames.forEach((o, e) => {
            let r = this.context.inputTextureLayouts[e].shape, n = this.context.inputTextureLayouts[e].strides, s = r.length, i = `indicesToOffset_${o}`;
            t[i] = new R(a.indexToOffsetSingle(i, s, n)), i = `indicesToOffset_${o}_T`, t[i] = new R(a.indexToOffsetSingle(i, s, n.slice().reverse()));
          }), t;
        }
        static indexToOffsetSingle(t, o, e) {
          let r = "";
          for (let n = o - 1; n >= 0; --n) r += `
        offset += indices[${n}] * ${e[n]};
        `;
          return `
      int ${t}(int indices[${o}]) {
        int offset = 0;
        ${r}
        return offset;
      }
      `;
        }
        offsetToIndices() {
          let t = {};
          return this.context.programInfo.inputNames.forEach((o, e) => {
            let r = this.context.inputTextureLayouts[e].shape, n = this.context.inputTextureLayouts[e].strides, s = r.length, i = `offsetToIndices_${o}`;
            t[i] = new R(a.offsetToIndicesSingle(i, s, n)), i = `offsetToIndices_${o}_T`, t[i] = new R(a.offsetToIndicesSingle(i, s, n.slice().reverse()));
          }), t;
        }
        static offsetToIndicesSingle(t, o, e) {
          let r = [];
          for (let n = 0; n < o - 1; ++n) r.push(`
      indices[${n}] = offset / ${e[n]};`), r.push(`
        offset -= indices[${n}] * ${e[n]};`);
          return r.push(`
      indices[${o - 1}] = offset;`), `
      void ${t}(int offset, out int indices[${o}]) {
        ${r.join("")}
      }
      `;
        }
        incrementIndices() {
          let t = {};
          return this.context.programInfo.inputNames.forEach((o, e) => {
            let r = this.context.inputTextureLayouts[e].shape, n = r.length, s = `incrementIndices_${o}`, i = "";
            for (let l = 0; l < n; ++l) i += `
        shape[${l}] = ${r[l]};`;
            let u2 = `
        void ${s}(int axis, out int indices[${n}]) {
          int shape[${n}];
          ${i};
          for(int i = ${n} -1 ; i >= 0; --i) {
            if(i > axis) continue;
            indices[i] += 1;
            if(indices[i] < shape[i]) {
              break;
            }
            indices[i] = 0;
          }
        }
        `;
            t[s] = new R(u2);
          }), t;
        }
      };
    });
    op = L(() => {
      "use strict";
      Wt();
      ho = class extends dt {
        constructor(t) {
          super(t);
        }
        getCustomTypes() {
          return {};
        }
        getFunctions() {
          return { ...this.binaryVecFunctions(), ...this.copyVec(), ...this.setVecItem(), ...this.getVecItem() };
        }
        binaryVecFunctions() {
          let o = this.context.outputTextureLayout.shape.length, e = { add: "+=", sub: "-=", mul: "*=", div: "/=" }, r = {};
          for (let n in e) {
            let s = `${n}Vec`, i = "";
            for (let l = 0; l < o; ++l) i += `
          dest[${l}] ${e[n]} src[${l}];
          `;
            let u2 = `
        void ${s}(int src[${o}], out int dest[${o}]) {
          ${i}
        }
        `;
            r[s] = new R(u2);
          }
          return r;
        }
        copyVec() {
          let o = this.context.outputTextureLayout.shape.length, e = "";
          for (let n = 0; n < o; ++n) e += `
        dest[${n}] = src[${n}];
        `;
          let r = `
      void copyVec(int src[${o}], out int dest[${o}]) {
        ${e}
      }
      `;
          return { copyVec: new R(r) };
        }
        setVecItem() {
          let o = this.context.outputTextureLayout.shape.length, e = `
        if(index < 0)
            index =${o} + index;
        if (index == 0)
            m[0] = value;
        `;
          for (let n = 1; n < o - 1; ++n) e += `
        else if (index == ${n})
            m[${n}] = value;
            `;
          e += `
        else
            m[${o - 1}] = value;
        `;
          let r = `
      void setVecItem(out int m[${o}], int index, int value) {
        ${e}
      }
        `;
          return { setVecItem: new R(r) };
        }
        getVecItem() {
          let o = this.context.outputTextureLayout.shape.length, e = `
        if(index < 0)
            index = ${o} + index;
        if (index == 0)
            return m[0];
      `;
          for (let n = 1; n < o - 1; ++n) e += `
        else if (index == ${n})
            return m[${n}];
      `;
          e += `
        else
            return m[${o - 1}];
        `;
          let r = `
      int getVecItem(int m[${o}], int index) {
        ${e}
      }
    `;
          return { getVecItem: new R(r) };
        }
      };
    });
    ip = L(() => {
      "use strict";
      ep();
      tp();
      rp();
      np();
      op();
      Wi = { encoding: fo, fragcolor: co, vec: ho, shapeUtils: po, coordinates: lo };
    });
    ap = L(() => {
      "use strict";
      Wt();
      Zc();
      ip();
      we();
      mo = class {
        constructor(t, o, e, r) {
          this.libs = {};
          this.glslLibRoutineDependencyGraph = {};
          this.context = new Zn(t, o, e, r), Object.keys(Wi).forEach((s) => {
            let i = new Wi[s](this.context);
            this.libs[s] = i;
          });
          let n = this.glslLibRoutineDependencyGraph;
          for (let s in this.libs) {
            let u2 = this.libs[s].getFunctions();
            for (let l in u2) {
              let c2 = s + "." + l, p2;
              n[c2] ? (p2 = n[c2], p2.routineBody = u2[l].routineBody) : (p2 = new cn(c2, u2[l].routineBody), n[c2] = p2);
              let d = u2[l].dependencies;
              if (d) for (let T = 0; T < d.length; ++T) if (n[d[T]]) p2.addDependency(n[d[T]]);
              else {
                let w = new cn(d[T]);
                n[d[T]] = w, p2.addDependency(w);
              }
            }
          }
        }
        preprocess() {
          let t = this.context.programInfo, o = t.shaderSource;
          return this.context.programInfo.hasMain || (o = `${o}
      ${Mu(this.context.glContext.version, this.context.outputTextureLayout.shape.length)}`), o = Jc(o), `${Ru(this.context.glContext.version)}
    ${this.getUniforms(t.inputNames, t.variables)}
    ${this.getImports(o)}
    ${o}`;
        }
        getImports(t) {
          let o = this.selectGlslLibRoutinesToBeIncluded(t);
          if (o.length === 0) return "";
          let e = "";
          for (let r = 0; r < o.length; ++r) if (o[r].routineBody) e += o[r].routineBody + `
`;
          else throw new Error(`Missing body for the Glsl Library routine: ${o[r].name}`);
          return e;
        }
        selectGlslLibRoutinesToBeIncluded(t) {
          let o = [];
          return Object.keys(this.glslLibRoutineDependencyGraph).forEach((e) => {
            let r = e.split(".")[1];
            t.indexOf(r) !== -1 && o.push(this.glslLibRoutineDependencyGraph[e]);
          }), Qn.returnOrderedNodes(o);
        }
        getUniforms(t, o) {
          let e = [];
          if (t) for (let r of t) e.push(`uniform sampler2D ${r};`);
          if (o) for (let r of o) e.push(`uniform ${r.type} ${r.name}${r.arrayLength ? `[${r.arrayLength}]` : ""};`);
          return e.join(`
`);
        }
      };
    });
    sp = L(() => {
      "use strict";
      Ot();
      lt();
      ap();
      we();
      bo = class {
        constructor(t, o, e) {
          this.profiler = t;
          this.glContext = o;
          this.textureLayoutStrategy = e;
          this.repo = /* @__PURE__ */ new Map(), this.attributesBound = false;
        }
        getArtifact(t) {
          return this.repo.get(t);
        }
        setArtifact(t, o) {
          this.repo.set(t, o);
        }
        run(t, o, e) {
          this.profiler.event("op", `ProgramManager.run ${t.programInfo.name ?? "unknown kernel"}`, () => {
            let r = this.glContext.gl, n = t.program;
            r.useProgram(n);
            try {
              this.bindOutput(e), this.attributesBound || this.bindAttributes(t.attribLocations), this.bindUniforms(t.uniformLocations, t.programInfo.variables ?? [], o);
            } catch (s) {
              throw ce.error("ProgramManager", t.programInfo.shaderSource), s;
            }
            this.profiler.event("backend", "GlContext.draw()", () => {
              this.glContext.draw();
            });
          }, this.glContext);
        }
        dispose() {
          this.vertexShader && this.glContext.deleteShader(this.vertexShader), this.repo.forEach((t) => this.glContext.deleteProgram(t.program));
        }
        build(t, o, e) {
          return this.profiler.event("backend", "ProgramManager.build", () => {
            let r = new mo(this.glContext, t, o, e), n = r.preprocess(), s = this.compile(n);
            return { programInfo: t, program: s, uniformLocations: this.getUniformLocations(s, r.context.programInfo.inputNames, r.context.programInfo.variables), attribLocations: this.getAttribLocations(s) };
          });
        }
        compile(t) {
          if (!this.vertexShader) {
            ce.verbose("ProrgramManager", "Compiling and caching Vertex shader for the first time");
            let r = Nu(this.glContext.version);
            this.vertexShader = this.glContext.compileShader(r, this.glContext.gl.VERTEX_SHADER);
          }
          Z.debug && ce.verbose("ProrgramManager", `FragShader:
${t}
`);
          let o = this.glContext.compileShader(t, this.glContext.gl.FRAGMENT_SHADER), e = this.glContext.createProgram(this.vertexShader, o);
          return this.glContext.deleteShader(o), e;
        }
        bindOutput(t) {
          let o = t.width, e = t.height;
          ce.verbose("ProrgramManager", `Binding output texture to Framebuffer: w/h=${o}/${e}, shape=${t.shape}, type=${t.tensor.type}`), this.glContext.attachFramebuffer(t.texture, o, e);
        }
        bindAttributes(t) {
          let o = t.position, e = t.textureCoord;
          this.glContext.setVertexAttributes(o, e), this.attributesBound = true;
        }
        bindUniforms(t, o, e) {
          let r = this.glContext.gl, n = 0;
          for (let { name: s, type: i, location: u2, arrayLength: l } of t) {
            let c2 = o.find((p2) => p2.name === s)?.data;
            if (i !== "sampler2D" && !c2) throw new Error(`variable '${s}' does not have data defined in program info`);
            switch (i) {
              case "sampler2D":
                this.bindTexture(e[n], u2, n), n++;
                break;
              case "float":
                l ? r.uniform1fv(u2, c2) : r.uniform1f(u2, c2);
                break;
              case "int":
                l ? r.uniform1iv(u2, c2) : r.uniform1i(u2, c2);
                break;
              default:
                throw new Error(`Uniform not implemented: ${i}`);
            }
          }
        }
        bindTexture(t, o, e) {
          this.glContext.bindTextureToUniform(t.texture, e, o);
        }
        getAttribLocations(t) {
          return { position: this.getAttribLocation(t, "position"), textureCoord: this.getAttribLocation(t, "textureCoord") };
        }
        getUniformLocations(t, o, e) {
          let r = [];
          if (o) for (let n of o) r.push({ name: n, type: "sampler2D", location: this.getUniformLocation(t, n) });
          if (e) for (let n of e) r.push({ ...n, location: this.getUniformLocation(t, n.name) });
          return r;
        }
        getUniformLocation(t, o) {
          let r = this.glContext.gl.getUniformLocation(t, o);
          if (r === null) throw new Error(`Uniform ${o} not found.`);
          return r;
        }
        getAttribLocation(t, o) {
          return this.glContext.gl.getAttribLocation(t, o);
        }
      };
    });
    up = L(() => {
      "use strict";
      lt();
      ln();
      go = class {
        constructor(t, o, e, r) {
          this.glContext = t;
          this.layoutStrategy = o;
          this.profiler = e;
          this.config = r;
          this.pendingRead = /* @__PURE__ */ new Map();
          r.reuseTextures && (this.inUseTextures = /* @__PURE__ */ new Map(), this.idleTextures = /* @__PURE__ */ new Map(), this.textureLookup = /* @__PURE__ */ new Map());
        }
        createTextureFromLayout(t, o, e, r) {
          let n = this.toEncoderType(t), s = this.glContext.getEncoder(n, o.channels || 1, r);
          if (o.isPacked && r === 1) throw new Error("not implemented");
          let i = o.width, u2 = o.height, l, c2;
          if (this.config.reuseTextures) {
            l = `${i}x${u2}_${s.format}_${s.internalFormat}_${s.textureType}`, c2 = this.inUseTextures.get(l), c2 || (c2 = [], this.inUseTextures.set(l, c2));
            let d = this.idleTextures.get(l);
            if (d && d.length > 0) {
              let T = d.pop();
              return c2.push(T), r === 1 && this.glContext.updateTexture(T, i, u2, s, this.toTextureData(t, e)), T;
            }
          }
          ce.verbose("TextureManager", `Creating new texture of size ${o.width}x${o.height}`);
          let p2 = this.glContext.allocateTexture(i, u2, s, this.toTextureData(t, e));
          return this.config.reuseTextures && (c2.push(p2), this.textureLookup.set(p2, l)), p2;
        }
        readTexture(t, o, e) {
          return e || (e = 1), this.profiler.event("backend", "TextureManager.readTexture", () => {
            let r = t.shape.reduce((s, i) => s * i) * e, n = this.glContext.readTexture(t.texture, t.width, t.height, r, this.toEncoderType(o), e);
            return this.toTensorData(o, n);
          });
        }
        async readTextureAsync(t, o, e) {
          let r = t.tensor.dataId;
          if (e || (e = 1), this.pendingRead.has(r)) {
            let n = this.pendingRead.get(r);
            return new Promise((s) => n?.push(s));
          }
          return this.profiler.event("backend", "TextureManager.readTextureAsync", async () => {
            this.pendingRead.set(r, []);
            let n = t.shape.reduce((l, c2) => l * c2) * e;
            await this.glContext.createAndWaitForFence();
            let s = this.glContext.readTexture(t.texture, t.width, t.height, n, this.toEncoderType(o), e), i = this.toTensorData(o, s), u2 = this.pendingRead.get(r);
            return this.pendingRead.delete(r), u2?.forEach((l) => l(i)), i;
          });
        }
        readUint8TextureAsFloat(t) {
          return this.profiler.event("backend", "TextureManager.readUint8TextureAsFloat", () => {
            let o = t.shape.reduce((r, n) => r * n), e = this.glContext.readTexture(t.texture, t.width, t.height, o * 4, "byte", 4);
            return new Float32Array(e.buffer, e.byteOffset, o);
          });
        }
        releaseTexture(t, o) {
          let e;
          if (this.config.reuseTextures && (e = this.textureLookup.get(t.texture), e)) {
            o && this.textureLookup.delete(e);
            let r = this.inUseTextures.get(e);
            if (r) {
              let n = r.indexOf(t.texture);
              if (n !== -1) {
                r.splice(n, 1);
                let s = this.idleTextures.get(e);
                s || (s = [], this.idleTextures.set(e, s)), s.push(t.texture);
              }
            }
          }
          (!e || o) && (ce.verbose("TextureManager", `Deleting texture of size ${t.width}x${t.height}`), this.glContext.deleteTexture(t.texture));
        }
        toTensorData(t, o) {
          switch (t) {
            case "int16":
              return o instanceof Int16Array ? o : Int16Array.from(o);
            case "int32":
              return o instanceof Int32Array ? o : Int32Array.from(o);
            case "int8":
              return o instanceof Int8Array ? o : Int8Array.from(o);
            case "uint16":
              return o instanceof Uint16Array ? o : Uint16Array.from(o);
            case "uint32":
              return o instanceof Uint32Array ? o : Uint32Array.from(o);
            case "uint8":
            case "bool":
              return o instanceof Uint8Array ? o : Uint8Array.from(o);
            case "float32":
              return o instanceof Float32Array ? o : Float32Array.from(o);
            case "float64":
              return o instanceof Float64Array ? o : Float64Array.from(o);
            default:
              throw new Error(`TensorData type ${t} is not supported`);
          }
        }
        toTextureData(t, o) {
          if (o) return o instanceof Float32Array ? o : new Float32Array(o);
        }
        toEncoderType(t) {
          return "float";
        }
        clearActiveTextures() {
          this.glContext.clearActiveTextures();
        }
      };
    });
    lp = L(() => {
      "use strict";
      lt();
      _s();
      el();
      Xc();
      sp();
      Vi();
      up();
      yo = class {
        constructor(t, o) {
          this.backend = t;
          this.context = o;
          this.layoutStrategy = new uo(t.glContext.maxTextureSize), this.programManager = new bo(this.context.profiler, t.glContext, this.layoutStrategy), this.textureManager = new go(t.glContext, this.layoutStrategy, this.context.profiler, { reuseTextures: t.textureCacheMode === "full" }), this.packedTextureDataCache = /* @__PURE__ */ new Map(), this.unpackedTextureDataCache = /* @__PURE__ */ new Map(), this.pack = t.pack, this.pack2unpackMap = /* @__PURE__ */ new Map(), this.unpack2packMap = /* @__PURE__ */ new Map();
        }
        createInferenceHandler() {
          return new Jn(this);
        }
        onGraphInitialized(t) {
          let o = t.getValues().filter((e) => e.from === -1 && e.tensor).map((e) => e.tensor.dataId);
          this.initializers = new Set(o);
        }
        isInitializer(t) {
          return this.initializers ? this.initializers.has(t) : false;
        }
        addInitializer(t) {
          this.initializers.add(t);
        }
        getTextureData(t, o) {
          return o ? this.packedTextureDataCache.get(t) : this.unpackedTextureDataCache.get(t);
        }
        setTextureData(t, o, e = false) {
          ce.verbose("WebGLSessionHandler", "Storing Texture data in cache"), e ? this.packedTextureDataCache.set(t, o) : this.unpackedTextureDataCache.set(t, o);
        }
        dispose() {
          this.programManager.dispose(), this.textureManager.clearActiveTextures(), this.packedTextureDataCache.forEach((t) => this.textureManager.releaseTexture(t, true)), this.packedTextureDataCache = /* @__PURE__ */ new Map(), this.unpackedTextureDataCache.forEach((t) => this.textureManager.releaseTexture(t, true)), this.unpackedTextureDataCache = /* @__PURE__ */ new Map();
        }
        resolve(t, o, e) {
          let r = vs(t, o, Yc);
          return { impl: r.opImpl, context: r.opInit ? r.opInit(t, e) : t };
        }
      };
    });
    fp = L(() => {
      "use strict";
      Ot();
      ln();
      ln();
      Bt();
      hn = class {
        constructor(t, o) {
          this.frameBufferBound = false;
          this.itemsToPoll = [];
          this.gl = t, this.version = o, this.getExtensions(), this.vertexbuffer = this.createVertexbuffer(), this.framebuffer = this.createFramebuffer(), this.queryVitalParameters();
        }
        allocateTexture(t, o, e, r) {
          let n = this.gl, s = n.createTexture();
          n.bindTexture(n.TEXTURE_2D, s), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE);
          let i = r ? e.encode(r, t * o) : null;
          return n.texImage2D(n.TEXTURE_2D, 0, e.internalFormat, t, o, 0, e.format, e.textureType, i), this.checkError(), s;
        }
        updateTexture(t, o, e, r, n) {
          let s = this.gl;
          s.bindTexture(s.TEXTURE_2D, t);
          let i = r.encode(n, o * e);
          s.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, o, e, r.format, r.textureType, i), this.checkError();
        }
        attachFramebuffer(t, o, e) {
          let r = this.gl;
          r.bindTexture(r.TEXTURE_2D, t), r.bindFramebuffer(r.FRAMEBUFFER, this.framebuffer), r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, t, 0), this.checkError(), r.viewport(0, 0, o, e), r.scissor(0, 0, o, e);
        }
        readTexture(t, o, e, r, n, s) {
          let i = this.gl;
          s || (s = 1), this.frameBufferBound || this.attachFramebuffer(t, o, e);
          let u2 = this.getEncoder(n, s), l = u2.allocate(o * e);
          return i.bindTexture(i.TEXTURE_2D, t), i.framebufferTexture2D(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, t, 0), i.readPixels(0, 0, o, e, i.RGBA, u2.textureType, l), this.checkError(), u2.decode(l, r);
        }
        isFramebufferReady() {
          return true;
        }
        getActiveTexture() {
          let t = this.gl;
          return `TEXTURE${t.getParameter(this.gl.ACTIVE_TEXTURE) - t.TEXTURE0}`;
        }
        getTextureBinding() {
          return this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);
        }
        getFramebufferBinding() {
          return this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
        }
        setVertexAttributes(t, o) {
          let e = this.gl;
          e.vertexAttribPointer(t, 3, e.FLOAT, false, 20, 0), e.enableVertexAttribArray(t), o !== -1 && (e.vertexAttribPointer(o, 2, e.FLOAT, false, 20, 12), e.enableVertexAttribArray(o)), this.checkError();
        }
        createProgram(t, o) {
          let e = this.gl, r = e.createProgram();
          return e.attachShader(r, t), e.attachShader(r, o), e.linkProgram(r), r;
        }
        compileShader(t, o) {
          let e = this.gl, r = e.createShader(o);
          if (!r) throw new Error(`createShader() returned null with type ${o}`);
          if (e.shaderSource(r, t), e.compileShader(r), e.getShaderParameter(r, e.COMPILE_STATUS) === false) throw new Error(`Failed to compile shader: ${e.getShaderInfoLog(r)}
Shader source:
${t}`);
          return r;
        }
        deleteShader(t) {
          this.gl.deleteShader(t);
        }
        bindTextureToUniform(t, o, e) {
          let r = this.gl;
          r.activeTexture(r.TEXTURE0 + o), this.checkError(), r.bindTexture(r.TEXTURE_2D, t), this.checkError(), r.uniform1i(e, o), this.checkError();
        }
        draw() {
          this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4), this.checkError();
        }
        checkError() {
          if (Z.debug) {
            let t = this.gl, o = t.getError(), e = "";
            switch (o) {
              case t.NO_ERROR:
                return;
              case t.INVALID_ENUM:
                e = "INVALID_ENUM";
                break;
              case t.INVALID_VALUE:
                e = "INVALID_VALUE";
                break;
              case t.INVALID_OPERATION:
                e = "INVALID_OPERATION";
                break;
              case t.INVALID_FRAMEBUFFER_OPERATION:
                e = "INVALID_FRAMEBUFFER_OPERATION";
                break;
              case t.OUT_OF_MEMORY:
                e = "OUT_OF_MEMORY";
                break;
              case t.CONTEXT_LOST_WEBGL:
                e = "CONTEXT_LOST_WEBGL";
                break;
              default:
                e = `Unknown WebGL Error: ${o.toString(16)}`;
            }
            throw new Error(e);
          }
        }
        deleteTexture(t) {
          this.gl.deleteTexture(t);
        }
        deleteProgram(t) {
          this.gl.deleteProgram(t);
        }
        getEncoder(t, o, e = 0) {
          if (this.version === 2) return new Xn(this.gl, o);
          switch (t) {
            case "float":
              return e === 1 || this.isRenderFloat32Supported ? new un(this.gl, o) : new un(this.gl, o, this.textureHalfFloatExtension.HALF_FLOAT_OES);
            case "int":
              throw new Error("not implemented");
            case "byte":
              return new Kn(this.gl, o);
            default:
              throw new Error(`Invalid dataType: ${t}`);
          }
        }
        clearActiveTextures() {
          let t = this.gl;
          for (let o = 0; o < this.maxTextureImageUnits; ++o) t.activeTexture(t.TEXTURE0 + o), t.bindTexture(t.TEXTURE_2D, null);
        }
        dispose() {
          if (this.disposed) return;
          let t = this.gl;
          t.bindFramebuffer(t.FRAMEBUFFER, null), t.deleteFramebuffer(this.framebuffer), t.bindBuffer(t.ARRAY_BUFFER, null), t.deleteBuffer(this.vertexbuffer), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, null), t.finish(), this.disposed = true;
        }
        createDefaultGeometry() {
          return new Float32Array([-1, 1, 0, 0, 1, -1, -1, 0, 0, 0, 1, 1, 0, 1, 1, 1, -1, 0, 1, 0]);
        }
        createVertexbuffer() {
          let t = this.gl, o = t.createBuffer();
          if (!o) throw new Error("createBuffer() returned null");
          let e = this.createDefaultGeometry();
          return t.bindBuffer(t.ARRAY_BUFFER, o), t.bufferData(t.ARRAY_BUFFER, e, t.STATIC_DRAW), this.checkError(), o;
        }
        createFramebuffer() {
          let t = this.gl.createFramebuffer();
          if (!t) throw new Error("createFramebuffer returned null");
          return t;
        }
        queryVitalParameters() {
          let t = this.gl;
          if (this.isFloatTextureAttachableToFrameBuffer = this.checkFloatTextureAttachableToFrameBuffer(), this.isRenderFloat32Supported = this.checkRenderFloat32(), this.isFloat32DownloadSupported = this.checkFloat32Download(), this.version === 1 && !this.textureHalfFloatExtension && !this.isRenderFloat32Supported) throw new Error("both float32 and float16 TextureType are not supported");
          this.isBlendSupported = !this.isRenderFloat32Supported || this.checkFloat32Blend(), this.maxTextureSize = t.getParameter(t.MAX_TEXTURE_SIZE), this.maxTextureImageUnits = t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS), this.version;
        }
        getExtensions() {
          this.version === 2 ? (this.colorBufferFloatExtension = this.gl.getExtension("EXT_color_buffer_float"), this.disjointTimerQueryWebgl2Extension = this.gl.getExtension("EXT_disjoint_timer_query_webgl2")) : (this.textureFloatExtension = this.gl.getExtension("OES_texture_float"), this.textureHalfFloatExtension = this.gl.getExtension("OES_texture_half_float"));
        }
        checkFloatTextureAttachableToFrameBuffer() {
          let t = this.gl, o = t.createTexture();
          t.bindTexture(t.TEXTURE_2D, o);
          let e = this.version === 2 ? t.RGBA32F : t.RGBA;
          t.texImage2D(t.TEXTURE_2D, 0, e, 1, 1, 0, t.RGBA, t.FLOAT, null);
          let r = t.createFramebuffer();
          t.bindFramebuffer(t.FRAMEBUFFER, r), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, o, 0);
          let n = t.checkFramebufferStatus(t.FRAMEBUFFER) === t.FRAMEBUFFER_COMPLETE;
          return t.bindTexture(t.TEXTURE_2D, null), t.bindFramebuffer(t.FRAMEBUFFER, null), t.deleteTexture(o), t.deleteFramebuffer(r), n;
        }
        checkRenderFloat32() {
          if (this.version === 2) {
            if (!this.colorBufferFloatExtension) return false;
          } else if (!this.textureFloatExtension) return false;
          return this.isFloatTextureAttachableToFrameBuffer;
        }
        checkFloat32Download() {
          if (this.version === 2) {
            if (!this.colorBufferFloatExtension) return false;
          } else if (!this.textureFloatExtension || !this.gl.getExtension("WEBGL_color_buffer_float")) return false;
          return this.isFloatTextureAttachableToFrameBuffer;
        }
        checkFloat32Blend() {
          let t = this.gl, o, e, r, n, s;
          try {
            o = t.createTexture(), e = t.createFramebuffer(), t.bindTexture(t.TEXTURE_2D, o);
            let i = this.version === 2 ? t.RGBA32F : t.RGBA;
            return t.texImage2D(t.TEXTURE_2D, 0, i, 1, 1, 0, t.RGBA, t.FLOAT, null), t.bindFramebuffer(t.FRAMEBUFFER, e), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, o, 0), t.enable(t.BLEND), r = t.createShader(t.VERTEX_SHADER), !r || (t.shaderSource(r, "void main(){}"), t.compileShader(r), n = t.createShader(t.FRAGMENT_SHADER), !n) || (t.shaderSource(n, "precision highp float;void main(){gl_FragColor=vec4(0.5);}"), t.compileShader(n), s = t.createProgram(), !s) ? false : (t.attachShader(s, r), t.attachShader(s, n), t.linkProgram(s), t.useProgram(s), t.drawArrays(t.POINTS, 0, 1), t.getError() === t.NO_ERROR);
          } finally {
            t.disable(t.BLEND), s && t.deleteProgram(s), r && t.deleteShader(r), n && t.deleteShader(n), e && (t.bindFramebuffer(t.FRAMEBUFFER, null), t.deleteFramebuffer(e)), o && (t.bindTexture(t.TEXTURE_2D, null), t.deleteTexture(o));
          }
        }
        beginTimer() {
          if (this.version === 2 && this.disjointTimerQueryWebgl2Extension) {
            let t = this.gl, o = this.disjointTimerQueryWebgl2Extension, e = t.createQuery();
            return t.beginQuery(o.TIME_ELAPSED_EXT, e), e;
          } else throw new Error("WebGL1 profiling currently not supported.");
        }
        endTimer() {
          if (this.version === 2 && this.disjointTimerQueryWebgl2Extension) {
            let t = this.gl, o = this.disjointTimerQueryWebgl2Extension;
            t.endQuery(o.TIME_ELAPSED_EXT);
            return;
          } else throw new Error("WebGL1 profiling currently not supported");
        }
        isTimerResultAvailable(t) {
          let o = false, e = false;
          if (this.version === 2 && this.disjointTimerQueryWebgl2Extension) {
            let r = this.gl, n = this.disjointTimerQueryWebgl2Extension;
            o = r.getQueryParameter(t, r.QUERY_RESULT_AVAILABLE), e = r.getParameter(n.GPU_DISJOINT_EXT);
          } else throw new Error("WebGL1 profiling currently not supported");
          return o && !e;
        }
        getTimerResult(t) {
          let o = 0;
          if (this.version === 2) {
            let e = this.gl;
            o = e.getQueryParameter(t, e.QUERY_RESULT), e.deleteQuery(t);
          } else throw new Error("WebGL1 profiling currently not supported");
          return o / 1e6;
        }
        async waitForQueryAndGetTime(t) {
          return await mi(() => this.isTimerResultAvailable(t)), this.getTimerResult(t);
        }
        async createAndWaitForFence() {
          let t = this.createFence(this.gl);
          return this.pollFence(t);
        }
        createFence(t) {
          let o, e = t, r = e.fenceSync(e.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return t.flush(), r === null ? o = () => true : o = () => {
            let n = e.clientWaitSync(r, 0, 0);
            return n === e.ALREADY_SIGNALED || n === e.CONDITION_SATISFIED;
          }, { query: r, isFencePassed: o };
        }
        async pollFence(t) {
          return new Promise((o) => {
            this.addItemToPoll(() => t.isFencePassed(), () => o());
          });
        }
        pollItems() {
          let t = jb(this.itemsToPoll.map((o) => o.isDoneFn));
          for (let o = 0; o <= t; ++o) {
            let { resolveFn: e } = this.itemsToPoll[o];
            e();
          }
          this.itemsToPoll = this.itemsToPoll.slice(t + 1);
        }
        async addItemToPoll(t, o) {
          this.itemsToPoll.push({ isDoneFn: t, resolveFn: o }), !(this.itemsToPoll.length > 1) && await mi(() => (this.pollItems(), this.itemsToPoll.length === 0));
        }
      };
    });
    pp = L(() => {
      "use strict";
      lt();
      fp();
      Gr = {};
    });
    dp = L(() => {
      "use strict";
      Ot();
      lt();
      lp();
      pp();
      To = class {
        get contextId() {
          return Z.webgl.contextId;
        }
        set contextId(t) {
          Z.webgl.contextId = t;
        }
        get matmulMaxBatchSize() {
          return Z.webgl.matmulMaxBatchSize;
        }
        set matmulMaxBatchSize(t) {
          Z.webgl.matmulMaxBatchSize = t;
        }
        get textureCacheMode() {
          return Z.webgl.textureCacheMode;
        }
        set textureCacheMode(t) {
          Z.webgl.textureCacheMode = t;
        }
        get pack() {
          return Z.webgl.pack;
        }
        set pack(t) {
          Z.webgl.pack = t;
        }
        get async() {
          return Z.webgl.async;
        }
        set async(t) {
          Z.webgl.async = t;
        }
        initialize() {
          try {
            return this.glContext = Hi(this.contextId), typeof this.matmulMaxBatchSize != "number" && (this.matmulMaxBatchSize = 16), typeof this.textureCacheMode != "string" && (this.textureCacheMode = "full"), typeof this.pack != "boolean" && (this.pack = false), typeof this.async != "boolean" && (this.async = false), ce.setWithEnv(Z), Z.webgl.context || Object.defineProperty(Z.webgl, "context", { value: this.glContext.gl }), ce.verbose("WebGLBackend", `Created WebGLContext: ${typeof this.glContext} with matmulMaxBatchSize: ${this.matmulMaxBatchSize}; textureCacheMode: ${this.textureCacheMode}; pack: ${this.pack}; async: ${this.async}.`), true;
          } catch (t) {
            return ce.warning("WebGLBackend", `Unable to initialize WebGLBackend. ${t}`), false;
          }
        }
        createSessionHandler(t) {
          return new yo(this, t);
        }
        dispose() {
          this.glContext.dispose();
        }
      };
    });
    mp = L(() => {
      "use strict";
      dp();
      hp = /* @__PURE__ */ new Map(), Kb = { webgl: new To() };
    });
    bp = L(() => {
      "use strict";
      lt();
      ji = class {
        constructor(t, o) {
          this.op = t;
          this.node = o;
        }
      }, xo = class {
        constructor(t, o, e) {
          this.graph = t;
          this.profiler = e;
          this.initialize(o);
        }
        initialize(t) {
          this.profiler.event("session", "ExecutionPlan.initialize", () => {
            let o = this.graph.getNodes();
            if (o.length !== t.length) throw new Error("The size of nodes and OPs do not match.");
            this._ops = t.map((e, r) => new ji(e, o[r])), this.reset(), this._starter = [], this._ops.forEach((e, r) => {
              let n = true;
              for (let s of e.node.inputs) if (!this._values[s] && this.graph.getInputIndices().indexOf(s) === -1) {
                n = false;
                break;
              }
              n && this._starter.push(r);
            });
          });
        }
        reset() {
          this._values = this.graph.getValues().map((t) => t.tensor);
        }
        async execute(t, o) {
          return this.profiler.event("session", "ExecutionPlan.execute", async () => {
            this.reset();
            let e = t.createInferenceHandler(), r = this.graph.getInputIndices();
            if (o.length !== r.length) throw new Error(`number of input tensors don't match the number of inputs to the model: actual: ${o.length} expected: ${r.length}`);
            o.forEach((c2, p2) => {
              let d = r[p2];
              this._values[d] = c2;
            });
            let n = this._starter.slice(0), s = this.graph.getValues(), i = this.graph.getNodes(), u2 = 0;
            for (; u2 < n.length; ) {
              let c2 = n[u2++], p2 = this._ops[c2], d = p2.node.inputs.map((S2) => this._values[S2]);
              if (d.indexOf(void 0) !== -1) throw new Error(`unresolved input detected: op: ${p2.node}`);
              let T = d;
              ce.verbose("ExecPlan", `Runing op:${p2.node.name} (${T.map((S2, A) => `'${p2.node.inputs[A]}': ${S2.type}[${S2.dims.join(",")}]`).join(", ")})`);
              let w = await this.profiler.event("node", p2.node.name, async () => p2.op.impl(e, T, p2.op.context));
              if (w.length !== p2.node.outputs.length) throw new Error("the size of output does not match model definition.");
              w.forEach((S2, A) => {
                let C = p2.node.outputs[A];
                if (this._values[C]) throw new Error(`output [${C}] already has value: op:${p2.node.name}`);
                this._values[C] = S2;
              });
              let v = /* @__PURE__ */ new Set();
              w.forEach((S2, A) => {
                let C = p2.node.outputs[A];
                for (let F2 of s[C].to) {
                  let J = i[F2], j2 = true;
                  for (let ie of J.inputs) if (!this._values[ie]) {
                    j2 = false;
                    break;
                  }
                  j2 && v.add(F2);
                }
              }), n.push(...v);
            }
            let l = [];
            for (let c2 = 0; c2 < this.graph.getOutputIndices().length; c2++) {
              let p2 = this.graph.getOutputIndices()[c2], d = this._values[p2];
              if (d === void 0) throw new Error(`required output [${p2}] does not have value`);
              p2 === 0 ? await d.getData() : d.data, l.push(d);
            }
            return ce.verbose("ExecPlan", "disposing of inferenceHandler"), e.dispose(), l;
          });
        }
      };
    });
    gp = L(() => {
      "use strict";
      tn();
      oe = Ar(Cr());
      yr();
      fe();
      bt = V.experimental.fbs, mn = class a {
        constructor(t) {
          if (this._attributes = /* @__PURE__ */ new Map(), t != null) {
            for (let o of t) o instanceof oe.onnx.AttributeProto ? this._attributes.set(o.name, [a.getValue(o), a.getType(o)]) : o instanceof bt.Attribute && this._attributes.set(o.name(), [a.getValue(o), a.getType(o)]);
            if (this._attributes.size < t.length) throw new Error("duplicated attribute names");
          }
        }
        set(t, o, e) {
          this._attributes.set(t, [e, o]);
        }
        delete(t) {
          this._attributes.delete(t);
        }
        getFloat(t, o) {
          return this.get(t, "float", o);
        }
        getInt(t, o) {
          return this.get(t, "int", o);
        }
        getString(t, o) {
          return this.get(t, "string", o);
        }
        getTensor(t, o) {
          return this.get(t, "tensor", o);
        }
        getFloats(t, o) {
          return this.get(t, "floats", o);
        }
        getInts(t, o) {
          return this.get(t, "ints", o);
        }
        getStrings(t, o) {
          return this.get(t, "strings", o);
        }
        getTensors(t, o) {
          return this.get(t, "tensors", o);
        }
        get(t, o, e) {
          let r = this._attributes.get(t);
          if (r === void 0) {
            if (e !== void 0) return e;
            throw new Error(`required attribute not found: ${t}`);
          }
          if (r[1] !== o) throw new Error(`type mismatch: expected ${o} but got ${r[1]}`);
          return r[0];
        }
        static getType(t) {
          let o = t instanceof oe.onnx.AttributeProto ? t.type : t.type();
          switch (o) {
            case oe.onnx.AttributeProto.AttributeType.FLOAT:
              return "float";
            case oe.onnx.AttributeProto.AttributeType.INT:
              return "int";
            case oe.onnx.AttributeProto.AttributeType.STRING:
              return "string";
            case oe.onnx.AttributeProto.AttributeType.TENSOR:
              return "tensor";
            case oe.onnx.AttributeProto.AttributeType.FLOATS:
              return "floats";
            case oe.onnx.AttributeProto.AttributeType.INTS:
              return "ints";
            case oe.onnx.AttributeProto.AttributeType.STRINGS:
              return "strings";
            case oe.onnx.AttributeProto.AttributeType.TENSORS:
              return "tensors";
            default:
              throw new Error(`attribute type is not supported yet: ${oe.onnx.AttributeProto.AttributeType[o]}`);
          }
        }
        static getValue(t) {
          let o = t instanceof oe.onnx.AttributeProto ? t.type : t.type();
          if (o === oe.onnx.AttributeProto.AttributeType.GRAPH || o === oe.onnx.AttributeProto.AttributeType.GRAPHS) throw new Error("graph attribute is not supported yet");
          let e = this.getValueNoCheck(t);
          if (o === oe.onnx.AttributeProto.AttributeType.INT && it.isLong(e)) return it.longToNumber(e);
          if (o === oe.onnx.AttributeProto.AttributeType.INTS) {
            let r = e, n = new Array(r.length);
            for (let s = 0; s < r.length; s++) {
              let i = r[s];
              n[s] = it.longToNumber(i);
            }
            return n;
          }
          if (o === oe.onnx.AttributeProto.AttributeType.TENSOR) return t instanceof oe.onnx.AttributeProto ? $e.fromProto(e) : $e.fromOrtTensor(e);
          if (o === oe.onnx.AttributeProto.AttributeType.TENSORS) {
            if (t instanceof oe.onnx.AttributeProto) return e.map((n) => $e.fromProto(n));
            if (t instanceof bt.Attribute) return e.map((n) => $e.fromOrtTensor(n));
          }
          return o === oe.onnx.AttributeProto.AttributeType.STRING && t instanceof oe.onnx.AttributeProto ? sn(e) : o === oe.onnx.AttributeProto.AttributeType.STRINGS && t instanceof oe.onnx.AttributeProto ? e.map(sn) : e;
        }
        static getValueNoCheck(t) {
          return t instanceof oe.onnx.AttributeProto ? this.getValueNoCheckFromOnnxFormat(t) : this.getValueNoCheckFromOrtFormat(t);
        }
        static getValueNoCheckFromOnnxFormat(t) {
          switch (t.type) {
            case oe.onnx.AttributeProto.AttributeType.FLOAT:
              return t.f;
            case oe.onnx.AttributeProto.AttributeType.INT:
              return t.i;
            case oe.onnx.AttributeProto.AttributeType.STRING:
              return t.s;
            case oe.onnx.AttributeProto.AttributeType.TENSOR:
              return t.t;
            case oe.onnx.AttributeProto.AttributeType.GRAPH:
              return t.g;
            case oe.onnx.AttributeProto.AttributeType.FLOATS:
              return t.floats;
            case oe.onnx.AttributeProto.AttributeType.INTS:
              return t.ints;
            case oe.onnx.AttributeProto.AttributeType.STRINGS:
              return t.strings;
            case oe.onnx.AttributeProto.AttributeType.TENSORS:
              return t.tensors;
            case oe.onnx.AttributeProto.AttributeType.GRAPHS:
              return t.graphs;
            default:
              throw new Error(`unsupported attribute type: ${oe.onnx.AttributeProto.AttributeType[t.type]}`);
          }
        }
        static getValueNoCheckFromOrtFormat(t) {
          switch (t.type()) {
            case bt.AttributeType.FLOAT:
              return t.f();
            case bt.AttributeType.INT:
              return t.i();
            case bt.AttributeType.STRING:
              return t.s();
            case bt.AttributeType.TENSOR:
              return t.t();
            case bt.AttributeType.GRAPH:
              return t.g();
            case bt.AttributeType.FLOATS:
              return t.floatsArray();
            case bt.AttributeType.INTS: {
              let o = [];
              for (let e = 0; e < t.intsLength(); e++) o.push(t.ints(e));
              return o;
            }
            case bt.AttributeType.STRINGS: {
              let o = [];
              for (let e = 0; e < t.stringsLength(); e++) o.push(t.strings(e));
              return o;
            }
            case bt.AttributeType.TENSORS: {
              let o = [];
              for (let e = 0; e < t.tensorsLength(); e++) o.push(t.tensors(e));
              return o;
            }
            default:
              throw new Error(`unsupported attribute type: ${bt.AttributeType[t.type()]}`);
          }
        }
      };
    });
    yp = L(() => {
      "use strict";
      gp();
      tn();
      Xi = Ar(Cr());
      yr();
      fe();
      wo = V.experimental.fbs, Ki = { from: (a, t) => new Yi(a, t) }, Mt = class {
        constructor(t) {
          this._from = void 0, this._to = [], this.tensor = void 0, this.type = void 0, t && (this.type = We.tensorValueTypeFromProto(t.type.tensorType));
        }
        get from() {
          return this._from;
        }
        get to() {
          return this._to;
        }
      }, vo = class {
        constructor(t, o) {
          t instanceof Xi.onnx.NodeProto ? (this.name = t.name, this.opType = t.opType, this.attributes = new mn(t.attribute)) : t instanceof wo.Node && (this.name = o ?? t.name(), this.opType = t.opType(), this.attributes = new mn(We.tensorAttributesFromORTFormat(t))), this.inputs = [], this.outputs = [], this.executeNode = true;
        }
      }, Yi = class {
        constructor(t, o) {
          if (!t) throw new TypeError("graph is empty");
          this.buildGraph(t), this.transformGraph(o), this.checkIsAcyclic();
        }
        getInputIndices() {
          return this._allInputIndices;
        }
        getInputNames() {
          return this._allInputNames;
        }
        getOutputIndices() {
          return this._allOutputIndices;
        }
        getOutputNames() {
          return this._allOutputNames;
        }
        getValues() {
          return this._allData;
        }
        getNodes() {
          return this._nodes;
        }
        buildGraph(t) {
          if (t instanceof Xi.onnx.GraphProto) this.buildGraphFromOnnxFormat(t);
          else if (t instanceof wo.Graph) this.buildGraphFromOrtFormat(t);
          else throw new TypeError("Graph type is not supported.");
        }
        buildGraphFromOnnxFormat(t) {
          let o = /* @__PURE__ */ new Map();
          this._allData = [], this._allInputIndices = [], this._allInputNames = [], this._allOutputIndices = [], this._allOutputNames = [], this._nodes = [];
          let e = /* @__PURE__ */ new Map();
          if (!t.input) throw new Error("missing information in graph: input");
          let r = [];
          for (let n of t.input) {
            if (o.has(n.name)) throw new Error(`duplicated input name: ${n.name}`);
            let s = this._allData.push(new Mt(n)) - 1;
            o.set(n.name, s), r.push(n.name);
          }
          if (!t.initializer) throw new Error("missing information in graph: initializer");
          for (let n of t.initializer) {
            let s = o.get(n.name);
            if (s === void 0) {
              let i = new Mt();
              i.type = { shape: { dims: We.tensorDimsFromProto(n.dims) }, tensorType: We.tensorDataTypeFromProto(n.dataType) }, s = this._allData.push(i) - 1, o.set(n.name, s);
            }
            this._allData[s]._from = -1, this._allData[s].tensor = $e.fromProto(n);
          }
          for (let n = 0; n < this._allData.length; n++) this._allData[n].tensor || (this._allInputIndices.push(n), this._allInputNames.push(r[n]));
          if (!t.output) throw new Error("missing information in graph: output");
          for (let n of t.output) {
            if (o.has(n.name)) throw new Error(`duplicated output name: ${n.name}`);
            let s = this._allData.push(new Mt(n)) - 1;
            o.set(n.name, s), this._allOutputIndices.push(s), this._allOutputNames.push(n.name);
          }
          if (!t.node) throw new Error("missing information in graph: node");
          for (let n of t.node) {
            if (!n.name) for (let i = 0; ; i++) {
              let u2 = `unnamed_${n.opType}_${i}`;
              if (!e.has(u2)) {
                n.name = u2;
                break;
              }
            }
            if (e.has(n.name)) throw new Error(`duplicated node name: ${n.name}`);
            let s = this._nodes.push(new vo(n)) - 1;
            e.set(n.name, s);
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n], i = t.node[n];
            if (!i.output) throw new Error(`missing output for node: ${i.name}`);
            for (let u2 of i.output) {
              let l = o.get(u2);
              if (typeof l > "u" && (l = this._allData.push(new Mt()) - 1, o.set(u2, l)), s.outputs.push(l), this._allData[l]._from !== void 0) throw new Error(`multiple nodes output to one data value: ${l}`);
              if (this._allData[l]._from = n, i.opType === "Constant") {
                if (!i.attribute || i.attribute.length !== 1 || !i.attribute[0].t) throw new Error("missing attributes or missing tensor value in attributes for this Constant operator");
                if (!i.output || i.output.length !== 1) throw new Error("missing output or incorrect number of outputs for this Constant operator");
                s.outputs.pop(), s.executeNode = false, this._allData[l]._from = -1, this._allData[l].tensor = $e.fromProto(i.attribute[0].t);
              }
            }
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n], i = t.node[n];
            if (!i.input) throw new Error(`missing input for node: ${i.name}`);
            for (let u2 of i.input) {
              let l = o.get(u2);
              if (typeof l > "u") {
                if (u2 === "" && (i.input.length === 3 || i.input.length === 4) && i.opType === "Resize") continue;
                throw new Error(`unrecognized input '${u2}' for node: ${i.name}`);
              }
              s.inputs.push(l), this._allData[l]._to.push(n);
            }
          }
          return true;
        }
        buildGraphFromOrtFormat(t) {
          let o = /* @__PURE__ */ new Map();
          this._allData = [], this._allInputIndices = [], this._allInputNames = [], this._allOutputIndices = [], this._allOutputNames = [], this._nodes = [];
          let e = /* @__PURE__ */ new Map(), r = [];
          for (let n = 0; n < t.inputsLength(); n++) {
            let s = t.inputs(n);
            if (o.has(s)) throw new Error(`duplicated input name: ${s}`);
            for (let i = 0; i < t.nodeArgsLength(); i++) if (t.nodeArgs(i)?.name() === s) {
              let u2 = new Mt();
              if (t.nodeArgs(i)?.type()?.valueType() !== wo.TypeInfoValue.tensor_type) throw new Error("Unexpected value type for the nodeArg.");
              let c2 = t.nodeArgs(i).type().value(new wo.TensorTypeAndShape()), p2 = We.tensorDataTypeFromProto(c2.elemType()), d = c2.shape(), T = [];
              for (let v = 0; v < d.dimLength(); v++) T.push(it.longToNumber(d.dim(v).value().dimValue()));
              u2.type = { shape: { dims: T }, tensorType: p2 };
              let w = this._allData.push(u2) - 1;
              o.set(s, w), r.push(s);
            }
          }
          for (let n = 0; n < t.initializersLength(); n++) {
            let s = t.initializers(n), i = o.get(s.name());
            if (i === void 0) {
              let u2 = new Mt(), l = We.tensorDimsFromORTFormat(s), c2 = We.tensorDataTypeFromProto(s.dataType());
              u2.type = { shape: { dims: l }, tensorType: c2 }, i = this._allData.push(u2) - 1, o.set(s.name(), i);
            }
            this._allData[i]._from = -1, this._allData[i].tensor = $e.fromOrtTensor(s);
          }
          for (let n = 0; n < this._allData.length; n++) this._allData[n].tensor || (this._allInputIndices.push(n), this._allInputNames.push(r[n]));
          for (let n = 0; n < t.outputsLength(); n++) {
            let s = t.outputs(n);
            if (o.has(s)) throw new Error(`duplicated output name: ${s}`);
            let i = this._allData.push(new Mt()) - 1;
            o.set(s, i), this._allOutputIndices.push(i), this._allOutputNames.push(s);
          }
          if (!t.nodes) throw new Error("missing information in graph: node");
          for (let n = 0; n < t.nodesLength(); n++) {
            let s = t.nodes(n), i = s.name();
            if (!i) for (let l = 0; i = `unnamed_${s.opType()}_${l}`, !!e.has(i); l++) ;
            if (e.has(i)) throw new Error(`duplicated node name: ${i}`);
            let u2 = this._nodes.push(new vo(s, i)) - 1;
            e.set(i, u2);
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n], i = t.nodes(n);
            if (i == null) throw new Error(`No node exists at index ${n}`);
            if (i?.outputsLength() === 0) throw new Error(`missing output for node: ${i.name}`);
            for (let u2 = 0; u2 < i?.outputsLength(); u2++) {
              let l = i?.outputs(u2), c2 = o.get(l);
              if (typeof c2 > "u" && (c2 = this._allData.push(new Mt()) - 1, o.set(l, c2)), s.outputs.push(c2), this._allData[c2]._from !== void 0) throw new Error(`multiple nodes output to one data value: ${c2}`);
              if (this._allData[c2]._from = n, i.opType() === "Constant") {
                if (i.attributesLength() !== 1 || !i.attributes(0).t()) throw new Error("missing attributes or missing tensor value in attributes for this Constant operator");
                if (i.outputsLength() !== 1) throw new Error("missing output or incorrect number of outputs for this Constant operator");
                s.outputs.pop(), s.executeNode = false, this._allData[c2]._from = -1, this._allData[c2].tensor = $e.fromOrtTensor(i.attributes(0).t());
              }
            }
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n], i = t.nodes(n);
            if (i.inputsLength() === 0) throw new Error(`missing input for node: ${i.name}`);
            for (let u2 = 0; u2 < i.inputsLength(); u2++) {
              let l = i.inputs(u2), c2 = o.get(l);
              if (typeof c2 > "u") throw new Error(`unrecognized input '${l}' for node: ${i.name()}`);
              s.inputs.push(c2), this._allData[c2]._to.push(n);
            }
          }
        }
        checkIsAcyclic() {
          let t = /* @__PURE__ */ new Set();
          this._allInputIndices.forEach((r) => {
            this._allData[r]._to.forEach((s) => {
              t.add(s);
            });
          });
          let o = Array.from(t), e = new Array(this._nodes.length).fill("white");
          for (; o.length > 0; ) {
            let r = o.pop();
            e[r] === "gray" ? e[r] = "black" : (o.push(r), e[r] = "gray", this._nodes[r].outputs.forEach((n) => {
              let s = this._allData[n];
              if (typeof s.tensor < "u") throw new Error("node outputs should not be initialized");
              if (s._from !== r) throw new Error("from property of the Value object doesn't match index of Node being processed");
              s._to.forEach((i) => {
                if (e[i] === "gray") throw new Error("model graph is cyclic");
                e[i] === "white" && o.push(i);
              });
            }));
          }
        }
        transformGraph(t) {
          this.removeAllIdentityNodes(), this.removeAllDropoutNodes(), this.fuseConvActivationNodes(), t && t.transformGraph(this), this.finalizeGraph();
        }
        finalizeGraph() {
          let t = 0, o = new Array(this._nodes.length, 0), e = 0;
          for (let r = 0; r < this._nodes.length; r++) o[r] = e, this._nodes[r].executeNode ? (e !== r && (this._nodes[e] = this._nodes[r]), e++) : this._nodes[r].outputs.forEach((n) => {
            this._allData[n]._from = -2;
          });
          this._nodes.splice(e, this._nodes.length - e);
          for (let r = 0; r < this._allData.length; r++) {
            let n = this._allData[r];
            n._from !== void 0 && n._from !== -1 && n._from !== -2 && (n._from = o[n._from]);
            for (let s = 0; s < n._to.length; s++) if (n._to[s] >= 0) n._to[s] = o[n._to[s]];
            else throw new Error("Trying to update a removed node");
          }
          t = 0;
          for (let r = 0; r < this._allData.length; r++) {
            if (this._allData[r].from === -2 && this._allOutputIndices.indexOf(r + t) === -1) {
              t++, this._allData.splice(r, 1), r--;
              continue;
            }
            if (t > 0) {
              let n = -1;
              this._allData[r].from !== void 0 && this._allData[r].from !== -1 ? (n = this._nodes[this._allData[r].from].outputs.indexOf(r + t), n !== -1 && (this._nodes[this._allData[r].from].outputs[n] = r)) : (n = this._allInputIndices.indexOf(r + t), n !== -1 && (this._allInputIndices[n] = r)), this._allData[r].to.forEach((s) => {
                n = this._nodes[s].inputs.indexOf(r + t), n !== -1 && (this._nodes[s].inputs[n] = r);
              }), this._allData[r].to.length === 0 && (n = this._allOutputIndices.indexOf(r + t), n !== -1 && (this._allOutputIndices[n] = r));
            }
          }
        }
        deleteNode(t) {
          let o = this._nodes[t];
          if (o.outputs.length > 1) {
            for (let i = 1; i < o.outputs.length; i++) if (this._allData[o.outputs[i]].to.length > 0) throw new Error("Node deletion with more than one output connected to other nodes is not supported. ");
          }
          o.executeNode = false;
          let e = o.inputs[0], r = o.outputs[0], n = this._allData[r].to;
          for (let i = 0; i < o.inputs.length; i++) {
            let u2 = this._allData[o.inputs[i]].to.indexOf(t);
            if (u2 === -1) throw new Error("The Value object doesn't have the current Node in it's 'to' property ");
            this._allData[o.inputs[i]].to.splice(u2, 1);
          }
          this._allData[r]._to = [];
          let s = this._allOutputIndices.indexOf(r);
          if (s !== -1 && (this._allOutputIndices[s] = e), n && n.length > 0) for (let i of n) {
            let u2 = this._nodes[i].inputs.indexOf(r);
            if (u2 === -1) throw new Error("The Node object doesn't have the output Value in it's 'inputs' property ");
            this._nodes[i].inputs[u2] = e, this._allData[e].to.push(i);
          }
        }
        removeAllDropoutNodes() {
          let t = 0;
          for (let o of this._nodes) {
            if (o.opType === "Dropout") {
              if (o.inputs.length !== 1) throw new Error("Dropout nodes should only contain one input. ");
              if (o.outputs.length !== 1 && o.outputs.length !== 2) throw new Error("Dropout nodes should contain either 1 or 2 output(s)");
              if (o.outputs.length === 2 && this._allData[o.outputs[1]]._to.length !== 0) throw new Error("Dropout nodes's second output should not be referenced by other nodes");
              this.deleteNode(t);
            }
            t++;
          }
        }
        removeAllIdentityNodes() {
          let t = 0;
          for (let o of this._nodes) o.opType === "Identity" && this.deleteNode(t), t++;
        }
        isActivation(t) {
          switch (t.opType) {
            case "Relu":
            case "Sigmoid":
            case "Clip":
              return true;
            default:
              return false;
          }
        }
        fuseConvActivationNodes() {
          for (let t of this._nodes) if (t.opType === "Conv") {
            let o = this._allData[t.outputs[0]]._to;
            if (o.length === 1 && this.isActivation(this._nodes[o[0]])) {
              let e = this._nodes[o[0]];
              if (e.opType === "Clip") if (e.inputs.length === 1) try {
                t.attributes.set("activation_params", "floats", [e.attributes.getFloat("min"), e.attributes.getFloat("max")]);
              } catch {
                t.attributes.set("activation_params", "floats", [br, gr]);
              }
              else if (e.inputs.length >= 3 && this._allData[e.inputs[1]].tensor !== void 0 && this._allData[e.inputs[2]].tensor !== void 0) t.attributes.set("activation_params", "floats", [this._allData[e.inputs[1]].tensor.floatData[0], this._allData[e.inputs[2]].tensor.floatData[0]]);
              else continue;
              t.attributes.set("activation", "string", e.opType), this.deleteNode(o[0]);
            }
          }
        }
      };
    });
    xp = L(() => {
      "use strict";
      zn();
      yp();
      tn();
      Tp = Ar(Cr());
      fe();
      Qb = V.experimental.fbs, _o = class {
        constructor() {
        }
        load(t, o, e) {
          let r;
          if (!e) try {
            this.loadFromOnnxFormat(t, o);
            return;
          } catch (n) {
            if (e !== void 0) throw n;
            r = n;
          }
          try {
            this.loadFromOrtFormat(t, o);
          } catch (n) {
            throw e !== void 0 ? n : new Error(`Failed to load model as ONNX format: ${r}
as ORT format: ${n}`);
          }
        }
        loadFromOnnxFormat(t, o) {
          let e = Tp.onnx.ModelProto.decode(t);
          if (it.longToNumber(e.irVersion) < 3) throw new Error("only support ONNX model with IR_VERSION>=3");
          this._opsets = e.opsetImport.map((n) => ({ domain: n.domain, version: it.longToNumber(n.version) })), this._graph = Ki.from(e.graph, o);
        }
        loadFromOrtFormat(t, o) {
          let e = new _.ByteBuffer(t), r = Qb.InferenceSession.getRootAsInferenceSession(e).model();
          if (it.longToNumber(r.irVersion()) < 3) throw new Error("only support ONNX model with IR_VERSION>=3");
          this._opsets = [];
          for (let s = 0; s < r.opsetImportLength(); s++) {
            let i = r.opsetImport(s);
            this._opsets.push({ domain: i?.domain(), version: it.longToNumber(i.version()) });
          }
          this._graph = Ki.from(r.graph(), o);
        }
        get graph() {
          return this._graph;
        }
        get opsets() {
          return this._opsets;
        }
      };
    });
    wp = L(() => {
      "use strict";
      mp();
      bp();
      lt();
      xp();
      Oo = class {
        constructor(t = {}) {
          this._initialized = false, this.backendHint = t.backendHint, this.profiler = Gn.create(t.profiler), this.context = { profiler: this.profiler, graphInputTypes: [], graphInputDims: [] };
        }
        get inputNames() {
          return this._model.graph.getInputNames();
        }
        get outputNames() {
          return this._model.graph.getOutputNames();
        }
        startProfiling() {
          this.profiler.start();
        }
        endProfiling() {
          this.profiler.stop();
        }
        async loadModel(t, o, e) {
          await this.profiler.event("session", "Session.loadModel", async () => {
            let r = await qi(this.backendHint);
            if (this.sessionHandler = r.createSessionHandler(this.context), this._model = new _o(), typeof t == "string") {
              let n = t.endsWith(".ort");
              if (typeof process < "u" && process.versions && process.versions.node) {
                let s = await (void 0)(t);
                this.initialize(s, n);
              } else {
                let i = await (await fetch(t)).arrayBuffer();
                this.initialize(new Uint8Array(i), n);
              }
            } else if (ArrayBuffer.isView(t)) this.initialize(t);
            else {
              let n = new Uint8Array(t, o || 0, e || t.byteLength);
              this.initialize(n);
            }
          });
        }
        initialize(t, o) {
          if (this._initialized) throw new Error("already initialized");
          this.profiler.event("session", "Session.initialize", () => {
            let e = this.sessionHandler.transformGraph ? this.sessionHandler : void 0;
            this._model.load(t, e, o), this.sessionHandler.onGraphInitialized && this.sessionHandler.onGraphInitialized(this._model.graph), this.initializeOps(this._model.graph), this._executionPlan = new xo(this._model.graph, this._ops, this.profiler);
          }), this._initialized = true;
        }
        async run(t) {
          if (!this._initialized) throw new Error("session not initialized yet");
          return this.profiler.event("session", "Session.run", async () => {
            let o = this.normalizeAndValidateInputs(t), e = await this._executionPlan.execute(this.sessionHandler, o);
            return this.createOutput(e);
          });
        }
        normalizeAndValidateInputs(t) {
          let o = this._model.graph.getInputNames();
          if (Array.isArray(t)) {
            if (t.length !== o.length) throw new Error(`incorrect input array length: expected ${o.length} but got ${t.length}`);
          } else {
            if (t.size !== o.length) throw new Error(`incorrect input map size: expected ${o.length} but got ${t.size}`);
            let e = new Array(t.size), r = 0;
            for (let n = 0; n < o.length; ++n) {
              let s = t.get(o[n]);
              if (!s) throw new Error(`missing input tensor for: '${name}'`);
              e[r++] = s;
            }
            t = e;
          }
          if (!this.context.graphInputTypes || this.context.graphInputTypes.length === 0 || !this.context.graphInputDims || this.context.graphInputDims.length === 0) {
            let e = this._model.graph.getInputIndices(), r = this._model.graph.getValues(), n = new Array(e.length);
            for (let s = 0; s < e.length; ++s) {
              let i = r[e[s]];
              n[s] = i.type.shape.dims, this.context.graphInputTypes.push(i.type.tensorType), this.context.graphInputDims.push(t[s].dims);
            }
            this.validateInputTensorDims(n, t, true);
          } else this.validateInputTensorDims(this.context.graphInputDims, t, false);
          return this.validateInputTensorTypes(this.context.graphInputTypes, t), t;
        }
        validateInputTensorTypes(t, o) {
          for (let e = 0; e < o.length; e++) {
            let r = t[e], n = o[e].type;
            if (r !== n) throw new Error(`input tensor[${e}] check failed: expected type '${r}' but got ${n}`);
          }
        }
        validateInputTensorDims(t, o, e) {
          for (let r = 0; r < o.length; r++) {
            let n = t[r], s = o[r].dims;
            if (!this.compareTensorDims(n, s, e)) throw new Error(`input tensor[${r}] check failed: expected shape '[${n.join(",")}]' but got [${s.join(",")}]`);
          }
        }
        compareTensorDims(t, o, e) {
          if (t.length !== o.length) return false;
          for (let r = 0; r < t.length; ++r) if (t[r] !== o[r] && (!e || t[r] !== 0)) return false;
          return true;
        }
        createOutput(t) {
          let o = this._model.graph.getOutputNames();
          if (t.length !== o.length) throw new Error("expected number of outputs do not match number of generated outputs");
          let e = /* @__PURE__ */ new Map();
          for (let r = 0; r < o.length; ++r) e.set(o[r], t[r]);
          return e;
        }
        initializeOps(t) {
          let o = t.getNodes();
          this._ops = new Array(o.length);
          for (let e = 0; e < o.length; e++) this._ops[e] = this.sessionHandler.resolve(o[e], this._model.opsets, t);
        }
      };
    });
    vp = L(() => {
      "use strict";
      Ot();
      yr();
      Io = class {
        constructor(t) {
          this.session = t;
          this.inputNames = this.session.inputNames, this.outputNames = this.session.outputNames;
        }
        async dispose() {
        }
        async run(t, o, e) {
          let r = /* @__PURE__ */ new Map();
          for (let i in t) if (Object.hasOwnProperty.call(t, i)) {
            let u2 = t[i];
            r.set(i, new $e(u2.dims, u2.type, void 0, void 0, u2.data));
          }
          let n = await this.session.run(r), s = {};
          return n.forEach((i, u2) => {
            s[u2] = new Me(i.type, i.data, i.dims);
          }), s;
        }
        startProfiling() {
          this.session.startProfiling();
        }
        endProfiling() {
          this.session.endProfiling();
        }
      };
    });
    _p = {};
    Sr(_p, { onnxjsBackend: () => tg });
    Op = L(() => {
      "use strict";
      wp();
      vp();
      Ji = class {
        async init() {
        }
        async createInferenceSessionHandler(t, o) {
          let e = new Oo(o);
          return typeof t == "string" ? await e.loadModel(t) : await e.loadModel(t), new Io(e);
        }
      }, tg = new Ji();
    });
    Zi = {};
    Sr(Zi, { createReadStream: () => Ip, readFile: () => rg, readFileSync: () => ng });
    Qi = L(() => {
      rg = void 0, ng = void 0, Ip = void 0;
    });
    ea = {};
    Sr(ea, { join: () => og });
    ta = L(() => {
      og = void 0;
    });
    Pp = me((Ap, ra) => {
      "use strict";
      var Sp = (() => {
        var a = typeof document < "u" ? document.currentScript?.src : void 0;
        return typeof __filename < "u" && (a || (a = __filename)), function(t = {}) {
          var o = t, e, r, n = new Promise((m, x2) => {
            e = m, r = x2;
          }), s = Object.assign({}, o), i = "./this.program", u2 = typeof window == "object", l = typeof importScripts == "function", c2 = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string", p2 = "", d, T, w;
          if (c2) {
            var v = (Qi(), ar(Zi)), S2 = (ta(), ar(ea));
            p2 = l ? S2.dirname(p2) + "/" : __dirname + "/", d = (m, x2) => (m = Ke(m) ? new URL(m) : S2.normalize(m), v.readFileSync(m, x2 ? void 0 : "utf8")), w = (m) => (m = d(m, true), m.buffer || (m = new Uint8Array(m)), m), T = (m, x2, O, D2 = true) => {
              m = Ke(m) ? new URL(m) : S2.normalize(m), v.readFile(m, D2 ? void 0 : "utf8", (M, q) => {
                M ? O(M) : x2(D2 ? q.buffer : q);
              });
            }, !o.thisProgram && 1 < process.argv.length && (i = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2);
          } else (u2 || l) && (l ? p2 = self.location.href : typeof document < "u" && document.currentScript && (p2 = document.currentScript.src), a && (p2 = a), p2.startsWith("blob:") ? p2 = "" : p2 = p2.substr(0, p2.replace(/[?#].*/, "").lastIndexOf("/") + 1), d = (m) => {
            var x2 = new XMLHttpRequest();
            return x2.open("GET", m, false), x2.send(null), x2.responseText;
          }, l && (w = (m) => {
            var x2 = new XMLHttpRequest();
            return x2.open("GET", m, false), x2.responseType = "arraybuffer", x2.send(null), new Uint8Array(x2.response);
          }), T = (m, x2, O) => {
            var D2 = new XMLHttpRequest();
            D2.open("GET", m, true), D2.responseType = "arraybuffer", D2.onload = () => {
              D2.status == 200 || D2.status == 0 && D2.response ? x2(D2.response) : O();
            }, D2.onerror = O, D2.send(null);
          });
          var A = console.log.bind(console), C = console.error.bind(console);
          Object.assign(o, s), s = null;
          var F2, J = false, j2, ie, G, Te, He;
          function Le() {
            var m = F2.buffer;
            o.HEAP8 = j2 = new Int8Array(m), o.HEAP16 = new Int16Array(m), o.HEAPU8 = ie = new Uint8Array(m), o.HEAPU16 = new Uint16Array(m), o.HEAP32 = G = new Int32Array(m), o.HEAPU32 = Te = new Uint32Array(m), o.HEAPF32 = new Float32Array(m), o.HEAPF64 = He = new Float64Array(m);
          }
          var Y = [], Ne = [], Se = [], yt = 0, et = null, ee = null;
          function qe(m) {
            throw m = "Aborted(" + m + ")", C(m), J = true, m = new WebAssembly.RuntimeError(m + ". Build with -sASSERTIONS for more info."), r(m), m;
          }
          var Ht = (m) => m.startsWith("data:application/octet-stream;base64,"), Ke = (m) => m.startsWith("file://"), at;
          if (at = "ort-wasm.wasm", !Ht(at)) {
            var Re = at;
            at = o.locateFile ? o.locateFile(Re, p2) : p2 + Re;
          }
          function Ce(m) {
            if (w) return w(m);
            throw "both async and sync fetching of the wasm failed";
          }
          function Hr(m) {
            if (u2 || l) {
              if (typeof fetch == "function" && !Ke(m)) return fetch(m, { credentials: "same-origin" }).then((x2) => {
                if (!x2.ok) throw `failed to load wasm binary file at '${m}'`;
                return x2.arrayBuffer();
              }).catch(() => Ce(m));
              if (T) return new Promise((x2, O) => {
                T(m, (D2) => x2(new Uint8Array(D2)), O);
              });
            }
            return Promise.resolve().then(() => Ce(m));
          }
          function Tt(m, x2, O) {
            return Hr(m).then((D2) => WebAssembly.instantiate(D2, x2)).then(O, (D2) => {
              C(`failed to asynchronously prepare wasm: ${D2}`), qe(D2);
            });
          }
          function qt(m, x2) {
            var O = at;
            return typeof WebAssembly.instantiateStreaming != "function" || Ht(O) || Ke(O) || c2 || typeof fetch != "function" ? Tt(O, m, x2) : fetch(O, { credentials: "same-origin" }).then((D2) => WebAssembly.instantiateStreaming(D2, m).then(x2, function(M) {
              return C(`wasm streaming compile failed: ${M}`), C("falling back to ArrayBuffer instantiation"), Tt(O, m, x2);
            }));
          }
          var xt, Lt = { 798088: (m, x2, O, D2) => {
            if (typeof o > "u" || !o.ya) return 1;
            if (m = je(m >>> 0), m.startsWith("./") && (m = m.substring(2)), m = o.ya.get(m), !m) return 2;
            if (x2 >>>= 0, O >>>= 0, x2 + O > m.byteLength) return 3;
            try {
              return ie.set(m.subarray(x2, x2 + O), D2 >>> 0 >>> 0), 0;
            } catch {
              return 4;
            }
          } };
          class wt {
            constructor(x2) {
              this.wa = x2 - 24;
            }
          }
          var tt = 0, tr = 0, ke = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, Be = (m, x2, O) => {
            x2 >>>= 0;
            var D2 = x2 + O;
            for (O = x2; m[O] && !(O >= D2); ) ++O;
            if (16 < O - x2 && m.buffer && ke) return ke.decode(m.subarray(x2, O));
            for (D2 = ""; x2 < O; ) {
              var M = m[x2++];
              if (M & 128) {
                var q = m[x2++] & 63;
                if ((M & 224) == 192) D2 += String.fromCharCode((M & 31) << 6 | q);
                else {
                  var re = m[x2++] & 63;
                  M = (M & 240) == 224 ? (M & 15) << 12 | q << 6 | re : (M & 7) << 18 | q << 12 | re << 6 | m[x2++] & 63, 65536 > M ? D2 += String.fromCharCode(M) : (M -= 65536, D2 += String.fromCharCode(55296 | M >> 10, 56320 | M & 1023));
                }
              } else D2 += String.fromCharCode(M);
            }
            return D2;
          }, je = (m, x2) => (m >>>= 0) ? Be(ie, m, x2) : "", vt = (m) => {
            for (var x2 = 0, O = 0; O < m.length; ++O) {
              var D2 = m.charCodeAt(O);
              127 >= D2 ? x2++ : 2047 >= D2 ? x2 += 2 : 55296 <= D2 && 57343 >= D2 ? (x2 += 4, ++O) : x2 += 3;
            }
            return x2;
          }, _t = (m, x2, O, D2) => {
            if (O >>>= 0, !(0 < D2)) return 0;
            var M = O;
            D2 = O + D2 - 1;
            for (var q = 0; q < m.length; ++q) {
              var re = m.charCodeAt(q);
              if (55296 <= re && 57343 >= re) {
                var Fe = m.charCodeAt(++q);
                re = 65536 + ((re & 1023) << 10) | Fe & 1023;
              }
              if (127 >= re) {
                if (O >= D2) break;
                x2[O++ >>> 0] = re;
              } else {
                if (2047 >= re) {
                  if (O + 1 >= D2) break;
                  x2[O++ >>> 0] = 192 | re >> 6;
                } else {
                  if (65535 >= re) {
                    if (O + 2 >= D2) break;
                    x2[O++ >>> 0] = 224 | re >> 12;
                  } else {
                    if (O + 3 >= D2) break;
                    x2[O++ >>> 0] = 240 | re >> 18, x2[O++ >>> 0] = 128 | re >> 12 & 63;
                  }
                  x2[O++ >>> 0] = 128 | re >> 6 & 63;
                }
                x2[O++ >>> 0] = 128 | re & 63;
              }
            }
            return x2[O >>> 0] = 0, O - M;
          }, jt = (m) => m % 4 === 0 && (m % 100 !== 0 || m % 400 === 0), qr = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Tn = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ct = [], Or = {}, rr = () => {
            if (!nr) {
              var m = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: i || "./this.program" }, x2;
              for (x2 in Or) Or[x2] === void 0 ? delete m[x2] : m[x2] = Or[x2];
              var O = [];
              for (x2 in m) O.push(`${x2}=${m[x2]}`);
              nr = O;
            }
            return nr;
          }, nr, xn = [null, [], []], Gt = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], wn = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          function he(m) {
            var x2 = Array(vt(m) + 1);
            return _t(m, x2, 0, x2.length), x2;
          }
          function jr(m, x2, O, D2) {
            function M(P2, pe, xe) {
              for (P2 = typeof P2 == "number" ? P2.toString() : P2 || ""; P2.length < pe; ) P2 = xe[0] + P2;
              return P2;
            }
            function q(P2, pe) {
              return M(P2, pe, "0");
            }
            function re(P2, pe) {
              function xe(Zr) {
                return 0 > Zr ? -1 : 0 < Zr ? 1 : 0;
              }
              var Ft;
              return (Ft = xe(P2.getFullYear() - pe.getFullYear())) === 0 && (Ft = xe(P2.getMonth() - pe.getMonth())) === 0 && (Ft = xe(P2.getDate() - pe.getDate())), Ft;
            }
            function Fe(P2) {
              switch (P2.getDay()) {
                case 0:
                  return new Date(P2.getFullYear() - 1, 11, 29);
                case 1:
                  return P2;
                case 2:
                  return new Date(P2.getFullYear(), 0, 3);
                case 3:
                  return new Date(P2.getFullYear(), 0, 2);
                case 4:
                  return new Date(P2.getFullYear(), 0, 1);
                case 5:
                  return new Date(P2.getFullYear() - 1, 11, 31);
                case 6:
                  return new Date(P2.getFullYear() - 1, 11, 30);
              }
            }
            function st(P2) {
              var pe = P2.sa;
              for (P2 = new Date(new Date(P2.ta + 1900, 0, 1).getTime()); 0 < pe; ) {
                var xe = P2.getMonth(), Ft = (jt(P2.getFullYear()) ? Gt : wn)[xe];
                if (pe > Ft - P2.getDate()) pe -= Ft - P2.getDate() + 1, P2.setDate(1), 11 > xe ? P2.setMonth(xe + 1) : (P2.setMonth(0), P2.setFullYear(P2.getFullYear() + 1));
                else {
                  P2.setDate(P2.getDate() + pe);
                  break;
                }
              }
              return xe = new Date(P2.getFullYear() + 1, 0, 4), pe = Fe(new Date(P2.getFullYear(), 0, 4)), xe = Fe(xe), 0 >= re(pe, P2) ? 0 >= re(xe, P2) ? P2.getFullYear() + 1 : P2.getFullYear() : P2.getFullYear() - 1;
            }
            m >>>= 0, x2 >>>= 0, O >>>= 0, D2 >>>= 0;
            var ze = Te[D2 + 40 >>> 2 >>> 0];
            D2 = { Ba: G[D2 >>> 2 >>> 0], Aa: G[D2 + 4 >>> 2 >>> 0], ua: G[D2 + 8 >>> 2 >>> 0], xa: G[D2 + 12 >>> 2 >>> 0], va: G[D2 + 16 >>> 2 >>> 0], ta: G[D2 + 20 >>> 2 >>> 0], na: G[D2 + 24 >>> 2 >>> 0], sa: G[D2 + 28 >>> 2 >>> 0], Da: G[D2 + 32 >>> 2 >>> 0], za: G[D2 + 36 >>> 2 >>> 0], Ca: ze ? je(ze) : "" }, O = je(O), ze = { "%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y" };
            for (var Ve in ze) O = O.replace(new RegExp(Ve, "g"), ze[Ve]);
            var Jr = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Yt = "January February March April May June July August September October November December".split(" ");
            ze = { "%a": (P2) => Jr[P2.na].substring(0, 3), "%A": (P2) => Jr[P2.na], "%b": (P2) => Yt[P2.va].substring(0, 3), "%B": (P2) => Yt[P2.va], "%C": (P2) => q((P2.ta + 1900) / 100 | 0, 2), "%d": (P2) => q(P2.xa, 2), "%e": (P2) => M(P2.xa, 2, " "), "%g": (P2) => st(P2).toString().substring(2), "%G": st, "%H": (P2) => q(P2.ua, 2), "%I": (P2) => (P2 = P2.ua, P2 == 0 ? P2 = 12 : 12 < P2 && (P2 -= 12), q(P2, 2)), "%j": (P2) => {
              for (var pe = 0, xe = 0; xe <= P2.va - 1; pe += (jt(P2.ta + 1900) ? Gt : wn)[xe++]) ;
              return q(P2.xa + pe, 3);
            }, "%m": (P2) => q(P2.va + 1, 2), "%M": (P2) => q(P2.Aa, 2), "%n": () => `
`, "%p": (P2) => 0 <= P2.ua && 12 > P2.ua ? "AM" : "PM", "%S": (P2) => q(P2.Ba, 2), "%t": () => "	", "%u": (P2) => P2.na || 7, "%U": (P2) => q(Math.floor((P2.sa + 7 - P2.na) / 7), 2), "%V": (P2) => {
              var pe = Math.floor((P2.sa + 7 - (P2.na + 6) % 7) / 7);
              if (2 >= (P2.na + 371 - P2.sa - 2) % 7 && pe++, pe) pe == 53 && (xe = (P2.na + 371 - P2.sa) % 7, xe == 4 || xe == 3 && jt(P2.ta) || (pe = 1));
              else {
                pe = 52;
                var xe = (P2.na + 7 - P2.sa - 1) % 7;
                (xe == 4 || xe == 5 && jt(P2.ta % 400 - 1)) && pe++;
              }
              return q(pe, 2);
            }, "%w": (P2) => P2.na, "%W": (P2) => q(Math.floor((P2.sa + 7 - (P2.na + 6) % 7) / 7), 2), "%y": (P2) => (P2.ta + 1900).toString().substring(2), "%Y": (P2) => P2.ta + 1900, "%z": (P2) => {
              P2 = P2.za;
              var pe = 0 <= P2;
              return P2 = Math.abs(P2) / 60, (pe ? "+" : "-") + ("0000" + (P2 / 60 * 100 + P2 % 60)).slice(-4);
            }, "%Z": (P2) => P2.Ca, "%%": () => "%" }, O = O.replace(/%%/g, "\0\0");
            for (Ve in ze) O.includes(Ve) && (O = O.replace(new RegExp(Ve, "g"), ze[Ve](D2)));
            return O = O.replace(/\0\0/g, "%"), Ve = he(O), Ve.length > x2 ? 0 : (j2.set(Ve, m >>> 0), Ve.length - 1);
          }
          var Yr = { a: function(m, x2, O) {
            m >>>= 0;
            var D2 = new wt(m);
            throw Te[D2.wa + 16 >>> 2 >>> 0] = 0, Te[D2.wa + 4 >>> 2 >>> 0] = x2 >>> 0, Te[D2.wa + 8 >>> 2 >>> 0] = O >>> 0, tt = m, tr++, tt;
          }, e: function() {
            return 0;
          }, H: function() {
          }, x: function() {
          }, z: function() {
          }, J: function() {
            return 0;
          }, F: function() {
          }, A: function() {
          }, E: function() {
          }, g: function() {
          }, y: function() {
          }, v: function() {
          }, G: function() {
          }, w: function() {
          }, k: () => 1, I: function(m, x2, O) {
            return x2 >>>= 0, ie.copyWithin(m >>> 0 >>> 0, x2 >>> 0, x2 + (O >>> 0) >>> 0);
          }, n: function(m, x2, O) {
            m = x2 + 2097152 >>> 0 < 4194305 - !!m ? (m >>> 0) + 4294967296 * x2 : NaN, O >>>= 0, m = new Date(1e3 * m), G[O >>> 2 >>> 0] = m.getUTCSeconds(), G[O + 4 >>> 2 >>> 0] = m.getUTCMinutes(), G[O + 8 >>> 2 >>> 0] = m.getUTCHours(), G[O + 12 >>> 2 >>> 0] = m.getUTCDate(), G[O + 16 >>> 2 >>> 0] = m.getUTCMonth(), G[O + 20 >>> 2 >>> 0] = m.getUTCFullYear() - 1900, G[O + 24 >>> 2 >>> 0] = m.getUTCDay(), G[O + 28 >>> 2 >>> 0] = (m.getTime() - Date.UTC(m.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
          }, o: function(m, x2, O) {
            m = x2 + 2097152 >>> 0 < 4194305 - !!m ? (m >>> 0) + 4294967296 * x2 : NaN, O >>>= 0, m = new Date(1e3 * m), G[O >>> 2 >>> 0] = m.getSeconds(), G[O + 4 >>> 2 >>> 0] = m.getMinutes(), G[O + 8 >>> 2 >>> 0] = m.getHours(), G[O + 12 >>> 2 >>> 0] = m.getDate(), G[O + 16 >>> 2 >>> 0] = m.getMonth(), G[O + 20 >>> 2 >>> 0] = m.getFullYear() - 1900, G[O + 24 >>> 2 >>> 0] = m.getDay(), G[O + 28 >>> 2 >>> 0] = (jt(m.getFullYear()) ? qr : Tn)[m.getMonth()] + m.getDate() - 1 | 0, G[O + 36 >>> 2 >>> 0] = -(60 * m.getTimezoneOffset()), x2 = new Date(m.getFullYear(), 6, 1).getTimezoneOffset();
            var D2 = new Date(m.getFullYear(), 0, 1).getTimezoneOffset();
            G[O + 32 >>> 2 >>> 0] = (x2 != D2 && m.getTimezoneOffset() == Math.min(D2, x2)) | 0;
          }, p: function(m) {
            m >>>= 0;
            var x2 = new Date(G[m + 20 >>> 2 >>> 0] + 1900, G[m + 16 >>> 2 >>> 0], G[m + 12 >>> 2 >>> 0], G[m + 8 >>> 2 >>> 0], G[m + 4 >>> 2 >>> 0], G[m >>> 2 >>> 0], 0), O = G[m + 32 >>> 2 >>> 0], D2 = x2.getTimezoneOffset(), M = new Date(x2.getFullYear(), 6, 1).getTimezoneOffset(), q = new Date(x2.getFullYear(), 0, 1).getTimezoneOffset(), re = Math.min(q, M);
            return 0 > O ? G[m + 32 >>> 2 >>> 0] = +(M != q && re == D2) : 0 < O != (re == D2) && (M = Math.max(q, M), x2.setTime(x2.getTime() + 6e4 * ((0 < O ? re : M) - D2))), G[m + 24 >>> 2 >>> 0] = x2.getDay(), G[m + 28 >>> 2 >>> 0] = (jt(x2.getFullYear()) ? qr : Tn)[x2.getMonth()] + x2.getDate() - 1 | 0, G[m >>> 2 >>> 0] = x2.getSeconds(), G[m + 4 >>> 2 >>> 0] = x2.getMinutes(), G[m + 8 >>> 2 >>> 0] = x2.getHours(), G[m + 12 >>> 2 >>> 0] = x2.getDate(), G[m + 16 >>> 2 >>> 0] = x2.getMonth(), G[m + 20 >>> 2 >>> 0] = x2.getYear(), m = x2.getTime(), m = isNaN(m) ? -1 : m / 1e3, Xr((xt = m, 1 <= +Math.abs(xt) ? 0 < xt ? +Math.floor(xt / 4294967296) >>> 0 : ~~+Math.ceil((xt - +(~~xt >>> 0)) / 4294967296) >>> 0 : 0)), m >>> 0;
          }, l: function() {
            return -52;
          }, m: function() {
          }, t: function(m, x2, O, D2) {
            O >>>= 0, D2 >>>= 0;
            var M = (/* @__PURE__ */ new Date()).getFullYear(), q = new Date(M, 0, 1), re = new Date(M, 6, 1);
            M = q.getTimezoneOffset();
            var Fe = re.getTimezoneOffset();
            Te[m >>> 0 >>> 2 >>> 0] = 60 * Math.max(M, Fe), G[x2 >>> 0 >>> 2 >>> 0] = +(M != Fe), m = (st) => st.toLocaleTimeString(void 0, { hour12: false, timeZoneName: "short" }).split(" ")[1], q = m(q), re = m(re), Fe < M ? (_t(q, ie, O, 17), _t(re, ie, D2, 17)) : (_t(q, ie, D2, 17), _t(re, ie, O, 17));
          }, d: () => {
            qe("");
          }, B: function(m, x2, O) {
            m >>>= 0, x2 >>>= 0, O >>>= 0, Ct.length = 0;
            for (var D2; D2 = ie[x2++ >>> 0]; ) {
              var M = D2 != 105;
              M &= D2 != 112, O += M && O % 8 ? 4 : 0, Ct.push(D2 == 112 ? Te[O >>> 2 >>> 0] : D2 == 105 ? G[O >>> 2 >>> 0] : He[O >>> 3 >>> 0]), O += M ? 8 : 4;
            }
            return Lt[m](...Ct);
          }, h: () => Date.now(), u: function() {
            return 4294901760;
          }, b: () => performance.now(), s: function(m) {
            m >>>= 0;
            var x2 = ie.length;
            if (4294901760 < m) return false;
            for (var O = 1; 4 >= O; O *= 2) {
              var D2 = x2 * (1 + 0.2 / O);
              D2 = Math.min(D2, m + 100663296);
              var M = Math;
              D2 = Math.max(m, D2);
              e: {
                M = (M.min.call(M, 4294901760, D2 + (65536 - D2 % 65536) % 65536) - F2.buffer.byteLength + 65535) / 65536;
                try {
                  F2.grow(M), Le();
                  var q = 1;
                  break e;
                } catch {
                }
                q = void 0;
              }
              if (q) return true;
            }
            return false;
          }, C: function(m, x2) {
            m >>>= 0, x2 >>>= 0;
            var O = 0;
            return rr().forEach((D2, M) => {
              var q = x2 + O;
              for (M = Te[m + 4 * M >>> 2 >>> 0] = q, q = 0; q < D2.length; ++q) j2[M++ >>> 0] = D2.charCodeAt(q);
              j2[M >>> 0] = 0, O += D2.length + 1;
            }), 0;
          }, D: function(m, x2) {
            m >>>= 0, x2 >>>= 0;
            var O = rr();
            Te[m >>> 2 >>> 0] = O.length;
            var D2 = 0;
            return O.forEach((M) => D2 += M.length + 1), Te[x2 >>> 2 >>> 0] = D2, 0;
          }, f: () => 52, j: function() {
            return 52;
          }, q: function() {
            return 70;
          }, i: function(m, x2, O, D2) {
            x2 >>>= 0, O >>>= 0, D2 >>>= 0;
            for (var M = 0, q = 0; q < O; q++) {
              var re = Te[x2 >>> 2 >>> 0], Fe = Te[x2 + 4 >>> 2 >>> 0];
              x2 += 8;
              for (var st = 0; st < Fe; st++) {
                var ze = ie[re + st >>> 0], Ve = xn[m];
                ze === 0 || ze === 10 ? ((m === 1 ? A : C)(Be(Ve, 0)), Ve.length = 0) : Ve.push(ze);
              }
              M += Fe;
            }
            return Te[D2 >>> 2 >>> 0] = M, 0;
          }, r: jr, c: function(m, x2, O, D2) {
            return jr(m >>> 0, x2 >>> 0, O >>> 0, D2 >>> 0);
          } }, te = (function() {
            function m(O) {
              return te = O.exports, te = _n(), F2 = te.K, Le(), Ne.unshift(te.L), yt--, yt == 0 && (et !== null && (clearInterval(et), et = null), ee && (O = ee, ee = null, O())), te;
            }
            var x2 = { a: Yr };
            if (yt++, o.instantiateWasm) try {
              return o.instantiateWasm(x2, m);
            } catch (O) {
              C(`Module.instantiateWasm callback failed with error: ${O}`), r(O);
            }
            return qt(x2, function(O) {
              m(O.instance);
            }).catch(r), {};
          })();
          o._OrtInit = (m, x2) => (o._OrtInit = te.M)(m, x2), o._OrtGetLastError = (m, x2) => (o._OrtGetLastError = te.N)(m, x2), o._OrtCreateSessionOptions = (m, x2, O, D2, M, q, re, Fe, st, ze) => (o._OrtCreateSessionOptions = te.O)(m, x2, O, D2, M, q, re, Fe, st, ze), o._OrtAppendExecutionProvider = (m, x2) => (o._OrtAppendExecutionProvider = te.P)(m, x2), o._OrtAddFreeDimensionOverride = (m, x2, O) => (o._OrtAddFreeDimensionOverride = te.Q)(m, x2, O), o._OrtAddSessionConfigEntry = (m, x2, O) => (o._OrtAddSessionConfigEntry = te.R)(m, x2, O), o._OrtReleaseSessionOptions = (m) => (o._OrtReleaseSessionOptions = te.S)(m), o._OrtCreateSession = (m, x2, O) => (o._OrtCreateSession = te.T)(m, x2, O), o._OrtReleaseSession = (m) => (o._OrtReleaseSession = te.U)(m), o._OrtGetInputOutputCount = (m, x2, O) => (o._OrtGetInputOutputCount = te.V)(m, x2, O), o._OrtGetInputName = (m, x2) => (o._OrtGetInputName = te.W)(m, x2), o._OrtGetOutputName = (m, x2) => (o._OrtGetOutputName = te.X)(m, x2), o._OrtFree = (m) => (o._OrtFree = te.Y)(m), o._OrtCreateTensor = (m, x2, O, D2, M, q) => (o._OrtCreateTensor = te.Z)(m, x2, O, D2, M, q), o._OrtGetTensorData = (m, x2, O, D2, M) => (o._OrtGetTensorData = te._)(m, x2, O, D2, M), o._OrtReleaseTensor = (m) => (o._OrtReleaseTensor = te.$)(m), o._OrtCreateRunOptions = (m, x2, O, D2) => (o._OrtCreateRunOptions = te.aa)(m, x2, O, D2), o._OrtAddRunConfigEntry = (m, x2, O) => (o._OrtAddRunConfigEntry = te.ba)(m, x2, O), o._OrtReleaseRunOptions = (m) => (o._OrtReleaseRunOptions = te.ca)(m), o._OrtCreateBinding = (m) => (o._OrtCreateBinding = te.da)(m), o._OrtBindInput = (m, x2, O) => (o._OrtBindInput = te.ea)(m, x2, O), o._OrtBindOutput = (m, x2, O, D2) => (o._OrtBindOutput = te.fa)(m, x2, O, D2), o._OrtClearBoundOutputs = (m) => (o._OrtClearBoundOutputs = te.ga)(m), o._OrtReleaseBinding = (m) => (o._OrtReleaseBinding = te.ha)(m), o._OrtRunWithBinding = (m, x2, O, D2, M) => (o._OrtRunWithBinding = te.ia)(m, x2, O, D2, M), o._OrtRun = (m, x2, O, D2, M, q, re, Fe) => (o._OrtRun = te.ja)(m, x2, O, D2, M, q, re, Fe), o._OrtEndProfiling = (m) => (o._OrtEndProfiling = te.ka)(m), o._malloc = (m) => (o._malloc = te.la)(m), o._free = (m) => (o._free = te.ma)(m);
          var Xr = (m) => (Xr = te.oa)(m), vn = (m) => (vn = te.pa)(m), X = (m) => (X = te.qa)(m), or = () => (or = te.ra)();
          function _n() {
            var m = te;
            m = Object.assign({}, m);
            var x2 = (O) => (D2) => O(D2) >>> 0;
            return m.la = x2(m.la), m.qa = x2(m.qa), m.ra = /* @__PURE__ */ ((O) => () => O() >>> 0)(m.ra), m;
          }
          o.stackSave = () => or(), o.stackRestore = (m) => vn(m), o.stackAlloc = (m) => X(m), o.UTF8ToString = je, o.stringToUTF8 = (m, x2, O) => _t(m, ie, x2, O), o.lengthBytesUTF8 = vt;
          var Ut;
          ee = function m() {
            Ut || Kr(), Ut || (ee = m);
          };
          function Kr() {
            if (!(0 < yt)) {
              if (o.preRun) for (typeof o.preRun == "function" && (o.preRun = [o.preRun]); o.preRun.length; ) {
                var m = o.preRun.shift();
                Y.unshift(m);
              }
              for (; 0 < Y.length; ) Y.shift()(o);
              if (!(0 < yt || Ut || (Ut = true, o.calledRun = true, J))) {
                for (; 0 < Ne.length; ) Ne.shift()(o);
                for (e(o); 0 < Se.length; ) Se.shift()(o);
              }
            }
          }
          return Kr(), n;
        };
      })();
      typeof Ap == "object" && typeof ra == "object" ? ra.exports = Sp : typeof define == "function" && define.amd && define([], () => Sp);
    });
    Ep = me(() => {
    });
    Dp = me(() => {
    });
    Lp = {};
    Sr(Lp, { cpus: () => ig });
    Cp = L(() => {
      ig = void 0;
    });
    kp = me(($p, na) => {
      "use strict";
      var Fp = (() => {
        var a = typeof document < "u" ? document.currentScript?.src : void 0;
        return typeof __filename < "u" && (a || (a = __filename)), function(t = {}) {
          function o() {
            return Se.buffer != qe.buffer && Ce(), qe;
          }
          function e() {
            return Se.buffer != qe.buffer && Ce(), Ht;
          }
          function r() {
            return Se.buffer != qe.buffer && Ce(), Ke;
          }
          function n() {
            return Se.buffer != qe.buffer && Ce(), at;
          }
          function s() {
            return Se.buffer != qe.buffer && Ce(), Re;
          }
          var i = t, u2, l, c2 = new Promise((f2, b2) => {
            u2 = f2, l = b2;
          }), p2 = Object.assign({}, i), d = "./this.program", T = (f2, b2) => {
            throw b2;
          }, w = typeof window == "object", v = typeof importScripts == "function", S2 = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string", A = i.ENVIRONMENT_IS_PTHREAD || false, C = "";
          function F2(f2) {
            return i.locateFile ? i.locateFile(f2, C) : C + f2;
          }
          var J, j2, ie;
          if (S2) {
            var G = (Qi(), ar(Zi)), Te = (ta(), ar(ea));
            C = v ? Te.dirname(C) + "/" : __dirname + "/", J = (f2, b2) => (f2 = je(f2) ? new URL(f2) : Te.normalize(f2), G.readFileSync(f2, b2 ? void 0 : "utf8")), ie = (f2) => (f2 = J(f2, true), f2.buffer || (f2 = new Uint8Array(f2)), f2), j2 = (f2, b2, y, I2 = true) => {
              f2 = je(f2) ? new URL(f2) : Te.normalize(f2), G.readFile(f2, I2 ? void 0 : "utf8", (k, $) => {
                k ? y(k) : b2(I2 ? $.buffer : $);
              });
            }, !i.thisProgram && 1 < process.argv.length && (d = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2), T = (f2, b2) => {
              throw process.exitCode = f2, b2;
            }, global.Worker = Ep().Worker;
          } else (w || v) && (v ? C = self.location.href : typeof document < "u" && document.currentScript && (C = document.currentScript.src), typeof a < "u" && a && (C = a), C.startsWith("blob:") ? C = "" : C = C.substr(0, C.replace(/[?#].*/, "").lastIndexOf("/") + 1), S2 || (J = (f2) => {
            var b2 = new XMLHttpRequest();
            return b2.open("GET", f2, false), b2.send(null), b2.responseText;
          }, v && (ie = (f2) => {
            var b2 = new XMLHttpRequest();
            return b2.open("GET", f2, false), b2.responseType = "arraybuffer", b2.send(null), new Uint8Array(b2.response);
          }), j2 = (f2, b2, y) => {
            var I2 = new XMLHttpRequest();
            I2.open("GET", f2, true), I2.responseType = "arraybuffer", I2.onload = () => {
              I2.status == 200 || I2.status == 0 && I2.response ? b2(I2.response) : y();
            }, I2.onerror = y, I2.send(null);
          }));
          S2 && typeof performance > "u" && (global.performance = Dp().performance);
          var He = console.log.bind(console), Le = console.error.bind(console);
          S2 && (He = (...f2) => G.writeSync(1, f2.join(" ") + `
`), Le = (...f2) => G.writeSync(2, f2.join(" ") + `
`));
          var Y = He, Ne = Le;
          Object.assign(i, p2), p2 = null;
          var Se, yt, et = false, ee, qe, Ht, Ke, at, Re;
          function Ce() {
            var f2 = Se.buffer;
            i.HEAP8 = qe = new Int8Array(f2), i.HEAP16 = new Int16Array(f2), i.HEAPU8 = Ht = new Uint8Array(f2), i.HEAPU16 = new Uint16Array(f2), i.HEAP32 = Ke = new Int32Array(f2), i.HEAPU32 = at = new Uint32Array(f2), i.HEAPF32 = new Float32Array(f2), i.HEAPF64 = Re = new Float64Array(f2);
          }
          var Hr = 16777216;
          if (A) Se = i.wasmMemory;
          else if (i.wasmMemory) Se = i.wasmMemory;
          else if (Se = new WebAssembly.Memory({ initial: Hr / 65536, maximum: 65536, shared: true }), !(Se.buffer instanceof SharedArrayBuffer)) throw Ne("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), S2 && Ne("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
          Ce(), Hr = Se.buffer.byteLength;
          var Tt = [], qt = [], xt = [], Lt = 0, wt = null, tt = null;
          function tr() {
            if (Lt--, Lt == 0 && (wt !== null && (clearInterval(wt), wt = null), tt)) {
              var f2 = tt;
              tt = null, f2();
            }
          }
          function ke(f2) {
            throw f2 = "Aborted(" + f2 + ")", Ne(f2), et = true, ee = 1, f2 = new WebAssembly.RuntimeError(f2 + ". Build with -sASSERTIONS for more info."), l(f2), f2;
          }
          var Be = (f2) => f2.startsWith("data:application/octet-stream;base64,"), je = (f2) => f2.startsWith("file://"), vt;
          vt = "ort-wasm-threaded.wasm", Be(vt) || (vt = F2(vt));
          function _t(f2) {
            if (ie) return ie(f2);
            throw "both async and sync fetching of the wasm failed";
          }
          function jt(f2) {
            if (w || v) {
              if (typeof fetch == "function" && !je(f2)) return fetch(f2, { credentials: "same-origin" }).then((b2) => {
                if (!b2.ok) throw `failed to load wasm binary file at '${f2}'`;
                return b2.arrayBuffer();
              }).catch(() => _t(f2));
              if (j2) return new Promise((b2, y) => {
                j2(f2, (I2) => b2(new Uint8Array(I2)), y);
              });
            }
            return Promise.resolve().then(() => _t(f2));
          }
          function qr(f2, b2, y) {
            return jt(f2).then((I2) => WebAssembly.instantiate(I2, b2)).then(y, (I2) => {
              Ne(`failed to asynchronously prepare wasm: ${I2}`), ke(I2);
            });
          }
          function Tn(f2, b2) {
            var y = vt;
            return typeof WebAssembly.instantiateStreaming != "function" || Be(y) || je(y) || S2 || typeof fetch != "function" ? qr(y, f2, b2) : fetch(y, { credentials: "same-origin" }).then((I2) => WebAssembly.instantiateStreaming(I2, f2).then(b2, function(k) {
              return Ne(`wasm streaming compile failed: ${k}`), Ne("falling back to ArrayBuffer instantiation"), qr(y, f2, b2);
            }));
          }
          var Ct, Or = { 799444: (f2, b2, y, I2) => {
            if (typeof i > "u" || !i.bb) return 1;
            if (f2 = Fe(f2 >>> 0), f2.startsWith("./") && (f2 = f2.substring(2)), f2 = i.bb.get(f2), !f2) return 2;
            if (b2 >>>= 0, y >>>= 0, I2 >>>= 0, b2 + y > f2.byteLength) return 3;
            try {
              return e().set(f2.subarray(b2, b2 + y), I2 >>> 0), 0;
            } catch {
              return 4;
            }
          } };
          function rr(f2) {
            this.name = "ExitStatus", this.message = `Program terminated with exit(${f2})`, this.status = f2;
          }
          var nr = (f2) => {
            f2.terminate(), f2.onmessage = () => {
            };
          }, xn = (f2) => {
            X.Oa.length == 0 && (Xr(), X.Xa(X.Oa[0]));
            var b2 = X.Oa.pop();
            if (!b2) return 6;
            X.Pa.push(b2), X.La[f2.Na] = b2, b2.Na = f2.Na;
            var y = { cmd: "run", start_routine: f2.gb, arg: f2.cb, pthread_ptr: f2.Na };
            return S2 && b2.unref(), b2.postMessage(y, f2.mb), 0;
          }, Gt = 0, wn = (f2) => {
            var b2 = zo();
            return f2 = f2(), Sn(b2), f2;
          }, he = (f2, b2, ...y) => wn(() => {
            for (var I2 = y.length, k = Uo(8 * I2), $ = k >>> 3, z = 0; z < y.length; z++) {
              var Oe = y[z];
              s()[$ + z >>> 0] = Oe;
            }
            return ka(f2, 0, I2, k, b2);
          });
          function jr(f2) {
            if (A) return he(0, 1, f2);
            ee = f2, 0 < Gt || (X.hb(), i.onExit?.(f2), et = true), T(f2, new rr(f2));
          }
          var Yr = (f2) => {
            if (ee = f2, A) throw _n(f2), "unwind";
            jr(f2);
          };
          function te() {
            for (var f2 = i.numThreads; f2--; ) Xr();
            Tt.unshift(() => {
              Lt++, vn(() => tr());
            });
          }
          function Xr() {
            var f2 = F2("ort-wasm-threaded.worker.js");
            f2 = new Worker(f2), X.Oa.push(f2);
          }
          function vn(f2) {
            A ? f2() : Promise.all(X.Oa.map(X.Xa)).then(f2);
          }
          var X = { Oa: [], Pa: [], ab: [], La: {}, Va() {
            A ? (X.receiveObjectTransfer = X.fb, X.threadInitTLS = X.$a, X.setExitStatus = X.Za) : te();
          }, Za: (f2) => ee = f2, pb: ["$terminateWorker"], hb: () => {
            for (var f2 of X.Pa) nr(f2);
            for (f2 of X.Oa) nr(f2);
            X.Oa = [], X.Pa = [], X.La = [];
          }, Ya: (f2) => {
            var b2 = f2.Na;
            delete X.La[b2], X.Oa.push(f2), X.Pa.splice(X.Pa.indexOf(f2), 1), f2.Na = 0, Mo(b2);
          }, fb() {
          }, $a() {
            X.ab.forEach((f2) => f2());
          }, Xa: (f2) => new Promise((b2) => {
            f2.onmessage = ($) => {
              $ = $.data;
              var z = $.cmd;
              if ($.targetThread && $.targetThread != In()) {
                var Oe = X.La[$.targetThread];
                Oe ? Oe.postMessage($, $.transferList) : Ne(`Internal error! Worker sent a message "${z}" to target pthread ${$.targetThread}, but that thread no longer exists!`);
              } else z === "checkMailbox" ? On() : z === "spawnThread" ? xn($) : z === "cleanupThread" ? X.Ya(X.La[$.thread]) : z === "killThread" ? ($ = $.thread, z = X.La[$], delete X.La[$], nr(z), Mo($), X.Pa.splice(X.Pa.indexOf(z), 1), z.Na = 0) : z === "cancelThread" ? X.La[$.thread].postMessage({ cmd: "cancel" }) : z === "loaded" ? (f2.loaded = true, S2 && !f2.Na && f2.unref(), b2(f2)) : z === "alert" ? alert(`Thread ${$.threadId}: ${$.text}`) : $.target === "setimmediate" ? f2.postMessage($) : z === "callHandler" ? i[$.handler](...$.args) : z && Ne(`worker sent an unknown command ${z}`);
            }, f2.onerror = ($) => {
              throw Ne(`worker sent an error! ${$.filename}:${$.lineno}: ${$.message}`), $;
            }, S2 && (f2.on("message", ($) => f2.onmessage({ data: $ })), f2.on("error", ($) => f2.onerror($)));
            var y = [], I2 = ["onExit"], k;
            for (k of I2) i.hasOwnProperty(k) && y.push(k);
            f2.postMessage({ cmd: "load", handlers: y, urlOrBlob: i.mainScriptUrlOrBlob || a, wasmMemory: Se, wasmModule: yt });
          }) };
          i.PThread = X;
          var or = (f2) => {
            for (; 0 < f2.length; ) f2.shift()(i);
          };
          i.establishStackSpace = () => {
            var f2 = In(), b2 = n()[f2 + 52 >>> 2 >>> 0];
            f2 = n()[f2 + 56 >>> 2 >>> 0], Ra(b2, b2 - f2), Sn(b2);
          };
          function _n(f2) {
            if (A) return he(1, 0, f2);
            Yr(f2);
          }
          var Ut = [], Kr;
          i.invokeEntryPoint = (f2, b2) => {
            Gt = 0;
            var y = Ut[f2];
            y || (f2 >= Ut.length && (Ut.length = f2 + 1), Ut[f2] = y = Kr.get(f2)), f2 = y(b2), 0 < Gt ? X.Za(f2) : Go(f2);
          };
          class m {
            constructor(b2) {
              this.Ua = b2 - 24;
            }
            Va(b2, y) {
              n()[this.Ua + 16 >>> 2 >>> 0] = 0, n()[this.Ua + 4 >>> 2 >>> 0] = b2, n()[this.Ua + 8 >>> 2 >>> 0] = y;
            }
          }
          var x2 = 0, O = 0;
          function D2(f2, b2, y, I2) {
            return A ? he(2, 1, f2, b2, y, I2) : M(f2, b2, y, I2);
          }
          function M(f2, b2, y, I2) {
            if (f2 >>>= 0, b2 >>>= 0, y >>>= 0, I2 >>>= 0, typeof SharedArrayBuffer > "u") return Ne("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
            var k = [];
            return A && k.length === 0 ? D2(f2, b2, y, I2) : (f2 = { gb: y, Na: f2, cb: I2, mb: k }, A ? (f2.ob = "spawnThread", postMessage(f2, k), 0) : xn(f2));
          }
          var q = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, re = (f2, b2, y) => {
            b2 >>>= 0;
            var I2 = b2 + y;
            for (y = b2; f2[y] && !(y >= I2); ) ++y;
            if (16 < y - b2 && f2.buffer && q) return q.decode(f2.buffer instanceof SharedArrayBuffer ? f2.slice(b2, y) : f2.subarray(b2, y));
            for (I2 = ""; b2 < y; ) {
              var k = f2[b2++];
              if (k & 128) {
                var $ = f2[b2++] & 63;
                if ((k & 224) == 192) I2 += String.fromCharCode((k & 31) << 6 | $);
                else {
                  var z = f2[b2++] & 63;
                  k = (k & 240) == 224 ? (k & 15) << 12 | $ << 6 | z : (k & 7) << 18 | $ << 12 | z << 6 | f2[b2++] & 63, 65536 > k ? I2 += String.fromCharCode(k) : (k -= 65536, I2 += String.fromCharCode(55296 | k >> 10, 56320 | k & 1023));
                }
              } else I2 += String.fromCharCode(k);
            }
            return I2;
          }, Fe = (f2, b2) => (f2 >>>= 0) ? re(e(), f2, b2) : "";
          function st(f2, b2, y) {
            return A ? he(3, 1, f2, b2, y) : 0;
          }
          function ze(f2, b2) {
            if (A) return he(4, 1, f2, b2);
          }
          var Ve = (f2) => {
            for (var b2 = 0, y = 0; y < f2.length; ++y) {
              var I2 = f2.charCodeAt(y);
              127 >= I2 ? b2++ : 2047 >= I2 ? b2 += 2 : 55296 <= I2 && 57343 >= I2 ? (b2 += 4, ++y) : b2 += 3;
            }
            return b2;
          }, Jr = (f2, b2, y, I2) => {
            if (y >>>= 0, !(0 < I2)) return 0;
            var k = y;
            I2 = y + I2 - 1;
            for (var $ = 0; $ < f2.length; ++$) {
              var z = f2.charCodeAt($);
              if (55296 <= z && 57343 >= z) {
                var Oe = f2.charCodeAt(++$);
                z = 65536 + ((z & 1023) << 10) | Oe & 1023;
              }
              if (127 >= z) {
                if (y >= I2) break;
                b2[y++ >>> 0] = z;
              } else {
                if (2047 >= z) {
                  if (y + 1 >= I2) break;
                  b2[y++ >>> 0] = 192 | z >> 6;
                } else {
                  if (65535 >= z) {
                    if (y + 2 >= I2) break;
                    b2[y++ >>> 0] = 224 | z >> 12;
                  } else {
                    if (y + 3 >= I2) break;
                    b2[y++ >>> 0] = 240 | z >> 18, b2[y++ >>> 0] = 128 | z >> 12 & 63;
                  }
                  b2[y++ >>> 0] = 128 | z >> 6 & 63;
                }
                b2[y++ >>> 0] = 128 | z & 63;
              }
            }
            return b2[y >>> 0] = 0, y - k;
          }, Yt = (f2, b2, y) => Jr(f2, e(), b2, y);
          function P2(f2, b2) {
            if (A) return he(5, 1, f2, b2);
          }
          function pe(f2, b2, y) {
            if (A) return he(6, 1, f2, b2, y);
          }
          function xe(f2, b2, y) {
            return A ? he(7, 1, f2, b2, y) : 0;
          }
          function Ft(f2, b2) {
            if (A) return he(8, 1, f2, b2);
          }
          function Zr(f2, b2, y) {
            if (A) return he(9, 1, f2, b2, y);
          }
          function ha(f2, b2, y, I2) {
            if (A) return he(10, 1, f2, b2, y, I2);
          }
          function ma(f2, b2, y, I2) {
            if (A) return he(11, 1, f2, b2, y, I2);
          }
          function ba(f2, b2, y, I2) {
            if (A) return he(12, 1, f2, b2, y, I2);
          }
          function ga(f2) {
            if (A) return he(13, 1, f2);
          }
          function ya(f2, b2) {
            if (A) return he(14, 1, f2, b2);
          }
          function Ta(f2, b2, y) {
            if (A) return he(15, 1, f2, b2, y);
          }
          function $o(f2) {
            f2 >>>= 0, typeof Atomics.nb == "function" && (Atomics.nb(r(), f2 >>> 2, f2).value.then(On), f2 += 128, Atomics.store(r(), f2 >>> 2, 1));
          }
          i.__emscripten_thread_mailbox_await = $o;
          var On = () => {
            var f2 = In();
            if (f2 && ($o(f2), f2 = Ba, !et)) try {
              if (f2(), !(0 < Gt)) try {
                A ? Go(ee) : Yr(ee);
              } catch (b2) {
                b2 instanceof rr || b2 == "unwind" || T(1, b2);
              }
            } catch (b2) {
              b2 instanceof rr || b2 == "unwind" || T(1, b2);
            }
          };
          i.checkMailbox = On;
          var ko = [], Ir = (f2) => f2 % 4 === 0 && (f2 % 100 !== 0 || f2 % 400 === 0), xa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
          function va(f2, b2, y, I2, k, $, z, Oe) {
            return A ? he(16, 1, f2, b2, y, I2, k, $, z, Oe) : -52;
          }
          function _a(f2, b2, y, I2, k, $, z) {
            if (A) return he(17, 1, f2, b2, y, I2, k, $, z);
          }
          var Bo = [], No = {}, Oa = () => {
            if (!Ro) {
              var f2 = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: d || "./this.program" }, b2;
              for (b2 in No) No[b2] === void 0 ? delete f2[b2] : f2[b2] = No[b2];
              var y = [];
              for (b2 in f2) y.push(`${b2}=${f2[b2]}`);
              Ro = y;
            }
            return Ro;
          }, Ro;
          function Ia(f2, b2) {
            if (A) return he(18, 1, f2, b2);
            f2 >>>= 0, b2 >>>= 0;
            var y = 0;
            return Oa().forEach((I2, k) => {
              var $ = b2 + y;
              for (k = n()[f2 + 4 * k >>> 2 >>> 0] = $, $ = 0; $ < I2.length; ++$) o()[k++ >>> 0] = I2.charCodeAt($);
              o()[k >>> 0] = 0, y += I2.length + 1;
            }), 0;
          }
          function Sa(f2, b2) {
            if (A) return he(19, 1, f2, b2);
            f2 >>>= 0, b2 >>>= 0;
            var y = Oa();
            n()[f2 >>> 2 >>> 0] = y.length;
            var I2 = 0;
            return y.forEach((k) => I2 += k.length + 1), n()[b2 >>> 2 >>> 0] = I2, 0;
          }
          function Aa(f2) {
            return A ? he(20, 1, f2) : 52;
          }
          function Pa(f2, b2, y, I2) {
            return A ? he(21, 1, f2, b2, y, I2) : 52;
          }
          function Ea(f2, b2, y, I2, k) {
            return A ? he(22, 1, f2, b2, y, I2, k) : 70;
          }
          var bd = [null, [], []];
          function Da(f2, b2, y, I2) {
            if (A) return he(23, 1, f2, b2, y, I2);
            b2 >>>= 0, y >>>= 0, I2 >>>= 0;
            for (var k = 0, $ = 0; $ < y; $++) {
              var z = n()[b2 >>> 2 >>> 0], Oe = n()[b2 + 4 >>> 2 >>> 0];
              b2 += 8;
              for (var $t = 0; $t < Oe; $t++) {
                var Ye = e()[z + $t >>> 0], rt = bd[f2];
                Ye === 0 || Ye === 10 ? ((f2 === 1 ? Y : Ne)(re(rt, 0)), rt.length = 0) : rt.push(Ye);
              }
              k += Oe;
            }
            return n()[I2 >>> 2 >>> 0] = k, 0;
          }
          var La = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ca = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          function gd(f2) {
            var b2 = Array(Ve(f2) + 1);
            return Jr(f2, b2, 0, b2.length), b2;
          }
          var yd = (f2, b2) => {
            o().set(f2, b2 >>> 0);
          };
          function Fa(f2, b2, y, I2) {
            function k(E, de, Ie) {
              for (E = typeof E == "number" ? E.toString() : E || ""; E.length < de; ) E = Ie[0] + E;
              return E;
            }
            function $(E, de) {
              return k(E, de, "0");
            }
            function z(E, de) {
              function Ie(za) {
                return 0 > za ? -1 : 0 < za ? 1 : 0;
              }
              var ir;
              return (ir = Ie(E.getFullYear() - de.getFullYear())) === 0 && (ir = Ie(E.getMonth() - de.getMonth())) === 0 && (ir = Ie(E.getDate() - de.getDate())), ir;
            }
            function Oe(E) {
              switch (E.getDay()) {
                case 0:
                  return new Date(E.getFullYear() - 1, 11, 29);
                case 1:
                  return E;
                case 2:
                  return new Date(E.getFullYear(), 0, 3);
                case 3:
                  return new Date(E.getFullYear(), 0, 2);
                case 4:
                  return new Date(E.getFullYear(), 0, 1);
                case 5:
                  return new Date(E.getFullYear() - 1, 11, 31);
                case 6:
                  return new Date(E.getFullYear() - 1, 11, 30);
              }
            }
            function $t(E) {
              var de = E.Qa;
              for (E = new Date(new Date(E.Ra + 1900, 0, 1).getTime()); 0 < de; ) {
                var Ie = E.getMonth(), ir = (Ir(E.getFullYear()) ? La : Ca)[Ie];
                if (de > ir - E.getDate()) de -= ir - E.getDate() + 1, E.setDate(1), 11 > Ie ? E.setMonth(Ie + 1) : (E.setMonth(0), E.setFullYear(E.getFullYear() + 1));
                else {
                  E.setDate(E.getDate() + de);
                  break;
                }
              }
              return Ie = new Date(E.getFullYear() + 1, 0, 4), de = Oe(new Date(E.getFullYear(), 0, 4)), Ie = Oe(Ie), 0 >= z(de, E) ? 0 >= z(Ie, E) ? E.getFullYear() + 1 : E.getFullYear() : E.getFullYear() - 1;
            }
            f2 >>>= 0, b2 >>>= 0, y >>>= 0, I2 >>>= 0;
            var Ye = n()[I2 + 40 >>> 2 >>> 0];
            I2 = { kb: r()[I2 >>> 2 >>> 0], jb: r()[I2 + 4 >>> 2 >>> 0], Sa: r()[I2 + 8 >>> 2 >>> 0], Wa: r()[I2 + 12 >>> 2 >>> 0], Ta: r()[I2 + 16 >>> 2 >>> 0], Ra: r()[I2 + 20 >>> 2 >>> 0], Ma: r()[I2 + 24 >>> 2 >>> 0], Qa: r()[I2 + 28 >>> 2 >>> 0], qb: r()[I2 + 32 >>> 2 >>> 0], ib: r()[I2 + 36 >>> 2 >>> 0], lb: Ye ? Fe(Ye) : "" }, y = Fe(y), Ye = { "%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y" };
            for (var rt in Ye) y = y.replace(new RegExp(rt, "g"), Ye[rt]);
            var Ga = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Ua = "January February March April May June July August September October November December".split(" ");
            Ye = { "%a": (E) => Ga[E.Ma].substring(0, 3), "%A": (E) => Ga[E.Ma], "%b": (E) => Ua[E.Ta].substring(0, 3), "%B": (E) => Ua[E.Ta], "%C": (E) => $((E.Ra + 1900) / 100 | 0, 2), "%d": (E) => $(E.Wa, 2), "%e": (E) => k(E.Wa, 2, " "), "%g": (E) => $t(E).toString().substring(2), "%G": $t, "%H": (E) => $(E.Sa, 2), "%I": (E) => (E = E.Sa, E == 0 ? E = 12 : 12 < E && (E -= 12), $(E, 2)), "%j": (E) => {
              for (var de = 0, Ie = 0; Ie <= E.Ta - 1; de += (Ir(E.Ra + 1900) ? La : Ca)[Ie++]) ;
              return $(E.Wa + de, 3);
            }, "%m": (E) => $(E.Ta + 1, 2), "%M": (E) => $(E.jb, 2), "%n": () => `
`, "%p": (E) => 0 <= E.Sa && 12 > E.Sa ? "AM" : "PM", "%S": (E) => $(E.kb, 2), "%t": () => "	", "%u": (E) => E.Ma || 7, "%U": (E) => $(Math.floor((E.Qa + 7 - E.Ma) / 7), 2), "%V": (E) => {
              var de = Math.floor((E.Qa + 7 - (E.Ma + 6) % 7) / 7);
              if (2 >= (E.Ma + 371 - E.Qa - 2) % 7 && de++, de) de == 53 && (Ie = (E.Ma + 371 - E.Qa) % 7, Ie == 4 || Ie == 3 && Ir(E.Ra) || (de = 1));
              else {
                de = 52;
                var Ie = (E.Ma + 7 - E.Qa - 1) % 7;
                (Ie == 4 || Ie == 5 && Ir(E.Ra % 400 - 1)) && de++;
              }
              return $(de, 2);
            }, "%w": (E) => E.Ma, "%W": (E) => $(Math.floor((E.Qa + 7 - (E.Ma + 6) % 7) / 7), 2), "%y": (E) => (E.Ra + 1900).toString().substring(2), "%Y": (E) => E.Ra + 1900, "%z": (E) => {
              E = E.ib;
              var de = 0 <= E;
              return E = Math.abs(E) / 60, (de ? "+" : "-") + ("0000" + (E / 60 * 100 + E % 60)).slice(-4);
            }, "%Z": (E) => E.lb, "%%": () => "%" }, y = y.replace(/%%/g, "\0\0");
            for (rt in Ye) y.includes(rt) && (y = y.replace(new RegExp(rt, "g"), Ye[rt](I2)));
            return y = y.replace(/\0\0/g, "%"), rt = gd(y), rt.length > b2 ? 0 : (yd(rt, f2), rt.length - 1);
          }
          X.Va();
          var Td = [jr, _n, D2, st, ze, P2, pe, xe, Ft, Zr, ha, ma, ba, ga, ya, Ta, va, _a, Ia, Sa, Aa, Pa, Ea, Da], xd = { b: function(f2, b2, y) {
            throw f2 >>>= 0, new m(f2).Va(b2 >>> 0, y >>> 0), x2 = f2, O++, x2;
          }, L: function(f2) {
            $a(f2 >>> 0, !v, 1, !w, 131072, false), X.$a();
          }, j: function(f2) {
            f2 >>>= 0, A ? postMessage({ cmd: "cleanupThread", thread: f2 }) : X.Ya(X.La[f2]);
          }, H: M, h: st, S: ze, D: P2, F: pe, T: xe, Q: Ft, J: Zr, P: ha, n: ma, E: ba, B: ga, R: ya, C: Ta, p: () => 1, z: function(f2, b2) {
            f2 >>>= 0, f2 == b2 >>> 0 ? setTimeout(On) : A ? postMessage({ targetThread: f2, cmd: "checkMailbox" }) : (f2 = X.La[f2]) && f2.postMessage({ cmd: "checkMailbox" });
          }, I: function(f2, b2, y, I2, k) {
            b2 >>>= 0, y >>>= 0, ko.length = I2, k = k >>> 0 >>> 3;
            for (var $ = 0; $ < I2; $++) ko[$] = s()[k + $ >>> 0];
            return f2 = b2 ? Or[b2] : Td[f2], X.eb = y, y = f2(...ko), X.eb = 0, y;
          }, K: $o, o: function(f2) {
            S2 && X.La[f2 >>> 0].ref();
          }, s: function(f2, b2, y) {
            f2 = b2 + 2097152 >>> 0 < 4194305 - !!f2 ? (f2 >>> 0) + 4294967296 * b2 : NaN, y >>>= 0, f2 = new Date(1e3 * f2), r()[y >>> 2 >>> 0] = f2.getUTCSeconds(), r()[y + 4 >>> 2 >>> 0] = f2.getUTCMinutes(), r()[y + 8 >>> 2 >>> 0] = f2.getUTCHours(), r()[y + 12 >>> 2 >>> 0] = f2.getUTCDate(), r()[y + 16 >>> 2 >>> 0] = f2.getUTCMonth(), r()[y + 20 >>> 2 >>> 0] = f2.getUTCFullYear() - 1900, r()[y + 24 >>> 2 >>> 0] = f2.getUTCDay(), f2 = (f2.getTime() - Date.UTC(f2.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, r()[y + 28 >>> 2 >>> 0] = f2;
          }, t: function(f2, b2, y) {
            f2 = b2 + 2097152 >>> 0 < 4194305 - !!f2 ? (f2 >>> 0) + 4294967296 * b2 : NaN, y >>>= 0, f2 = new Date(1e3 * f2), r()[y >>> 2 >>> 0] = f2.getSeconds(), r()[y + 4 >>> 2 >>> 0] = f2.getMinutes(), r()[y + 8 >>> 2 >>> 0] = f2.getHours(), r()[y + 12 >>> 2 >>> 0] = f2.getDate(), r()[y + 16 >>> 2 >>> 0] = f2.getMonth(), r()[y + 20 >>> 2 >>> 0] = f2.getFullYear() - 1900, r()[y + 24 >>> 2 >>> 0] = f2.getDay(), b2 = (Ir(f2.getFullYear()) ? xa : wa)[f2.getMonth()] + f2.getDate() - 1 | 0, r()[y + 28 >>> 2 >>> 0] = b2, r()[y + 36 >>> 2 >>> 0] = -(60 * f2.getTimezoneOffset()), b2 = new Date(f2.getFullYear(), 6, 1).getTimezoneOffset();
            var I2 = new Date(f2.getFullYear(), 0, 1).getTimezoneOffset();
            f2 = (b2 != I2 && f2.getTimezoneOffset() == Math.min(I2, b2)) | 0, r()[y + 32 >>> 2 >>> 0] = f2;
          }, u: function(f2) {
            f2 >>>= 0;
            var b2 = new Date(r()[f2 + 20 >>> 2 >>> 0] + 1900, r()[f2 + 16 >>> 2 >>> 0], r()[f2 + 12 >>> 2 >>> 0], r()[f2 + 8 >>> 2 >>> 0], r()[f2 + 4 >>> 2 >>> 0], r()[f2 >>> 2 >>> 0], 0), y = r()[f2 + 32 >>> 2 >>> 0], I2 = b2.getTimezoneOffset(), k = new Date(b2.getFullYear(), 6, 1).getTimezoneOffset(), $ = new Date(b2.getFullYear(), 0, 1).getTimezoneOffset(), z = Math.min($, k);
            return 0 > y ? r()[f2 + 32 >>> 2 >>> 0] = +(k != $ && z == I2) : 0 < y != (z == I2) && (k = Math.max($, k), b2.setTime(b2.getTime() + 6e4 * ((0 < y ? z : k) - I2))), r()[f2 + 24 >>> 2 >>> 0] = b2.getDay(), y = (Ir(b2.getFullYear()) ? xa : wa)[b2.getMonth()] + b2.getDate() - 1 | 0, r()[f2 + 28 >>> 2 >>> 0] = y, r()[f2 >>> 2 >>> 0] = b2.getSeconds(), r()[f2 + 4 >>> 2 >>> 0] = b2.getMinutes(), r()[f2 + 8 >>> 2 >>> 0] = b2.getHours(), r()[f2 + 12 >>> 2 >>> 0] = b2.getDate(), r()[f2 + 16 >>> 2 >>> 0] = b2.getMonth(), r()[f2 + 20 >>> 2 >>> 0] = b2.getYear(), f2 = b2.getTime(), f2 = isNaN(f2) ? -1 : f2 / 1e3, Na((Ct = f2, 1 <= +Math.abs(Ct) ? 0 < Ct ? +Math.floor(Ct / 4294967296) >>> 0 : ~~+Math.ceil((Ct - +(~~Ct >>> 0)) / 4294967296) >>> 0 : 0)), f2 >>> 0;
          }, q: va, r: _a, y: function(f2, b2, y, I2) {
            f2 >>>= 0, b2 >>>= 0, y >>>= 0, I2 >>>= 0;
            var k = (/* @__PURE__ */ new Date()).getFullYear(), $ = new Date(k, 0, 1), z = new Date(k, 6, 1);
            k = $.getTimezoneOffset();
            var Oe = z.getTimezoneOffset(), $t = Math.max(k, Oe);
            n()[f2 >>> 2 >>> 0] = 60 * $t, r()[b2 >>> 2 >>> 0] = +(k != Oe), f2 = (Ye) => Ye.toLocaleTimeString(void 0, { hour12: false, timeZoneName: "short" }).split(" ")[1], $ = f2($), z = f2(z), Oe < k ? (Yt($, y, 17), Yt(z, I2, 17)) : (Yt($, I2, 17), Yt(z, y, 17));
          }, c: () => {
            ke("");
          }, O: function(f2, b2, y) {
            f2 >>>= 0, b2 >>>= 0, y >>>= 0, Bo.length = 0;
            for (var I2; I2 = e()[b2++ >>> 0]; ) {
              var k = I2 != 105;
              k &= I2 != 112, y += k && y % 8 ? 4 : 0, Bo.push(I2 == 112 ? n()[y >>> 2 >>> 0] : I2 == 105 ? r()[y >>> 2 >>> 0] : s()[y >>> 3 >>> 0]), y += k ? 8 : 4;
            }
            return Or[f2](...Bo);
          }, k: () => {
          }, i: () => Date.now(), U: () => {
            throw Gt += 1, "unwind";
          }, A: function() {
            return 4294901760;
          }, e: () => performance.timeOrigin + performance.now(), f: () => S2 ? (Cp(), ar(Lp)).cpus().length : navigator.hardwareConcurrency, x: function(f2) {
            f2 >>>= 0;
            var b2 = e().length;
            if (f2 <= b2 || 4294901760 < f2) return false;
            for (var y = 1; 4 >= y; y *= 2) {
              var I2 = b2 * (1 + 0.2 / y);
              I2 = Math.min(I2, f2 + 100663296);
              var k = Math;
              I2 = Math.max(f2, I2);
              e: {
                k = (k.min.call(k, 4294901760, I2 + (65536 - I2 % 65536) % 65536) - Se.buffer.byteLength + 65535) / 65536;
                try {
                  Se.grow(k), Ce();
                  var $ = 1;
                  break e;
                } catch {
                }
                $ = void 0;
              }
              if ($) return true;
            }
            return false;
          }, M: Ia, N: Sa, G: Yr, g: Aa, m: Pa, v: Ea, l: Da, a: Se || i.wasmMemory, w: Fa, d: function(f2, b2, y, I2) {
            return Fa(f2 >>> 0, b2 >>> 0, y >>> 0, I2 >>> 0);
          } }, K = (function() {
            function f2(y, I2) {
              return K = y.exports, K = wd(), X.ab.push(K.ya), Kr = K.za, qt.unshift(K.V), yt = I2, tr(), K;
            }
            var b2 = { a: xd };
            if (Lt++, i.instantiateWasm) try {
              return i.instantiateWasm(b2, f2);
            } catch (y) {
              Ne(`Module.instantiateWasm callback failed with error: ${y}`), l(y);
            }
            return Tn(b2, function(y) {
              f2(y.instance, y.module);
            }).catch(l), {};
          })();
          i._OrtInit = (f2, b2) => (i._OrtInit = K.W)(f2, b2), i._OrtGetLastError = (f2, b2) => (i._OrtGetLastError = K.X)(f2, b2), i._OrtCreateSessionOptions = (f2, b2, y, I2, k, $, z, Oe, $t, Ye) => (i._OrtCreateSessionOptions = K.Y)(f2, b2, y, I2, k, $, z, Oe, $t, Ye), i._OrtAppendExecutionProvider = (f2, b2) => (i._OrtAppendExecutionProvider = K.Z)(f2, b2), i._OrtAddFreeDimensionOverride = (f2, b2, y) => (i._OrtAddFreeDimensionOverride = K._)(f2, b2, y), i._OrtAddSessionConfigEntry = (f2, b2, y) => (i._OrtAddSessionConfigEntry = K.$)(f2, b2, y), i._OrtReleaseSessionOptions = (f2) => (i._OrtReleaseSessionOptions = K.aa)(f2), i._OrtCreateSession = (f2, b2, y) => (i._OrtCreateSession = K.ba)(f2, b2, y), i._OrtReleaseSession = (f2) => (i._OrtReleaseSession = K.ca)(f2), i._OrtGetInputOutputCount = (f2, b2, y) => (i._OrtGetInputOutputCount = K.da)(f2, b2, y), i._OrtGetInputName = (f2, b2) => (i._OrtGetInputName = K.ea)(f2, b2), i._OrtGetOutputName = (f2, b2) => (i._OrtGetOutputName = K.fa)(f2, b2), i._OrtFree = (f2) => (i._OrtFree = K.ga)(f2), i._OrtCreateTensor = (f2, b2, y, I2, k, $) => (i._OrtCreateTensor = K.ha)(f2, b2, y, I2, k, $), i._OrtGetTensorData = (f2, b2, y, I2, k) => (i._OrtGetTensorData = K.ia)(f2, b2, y, I2, k), i._OrtReleaseTensor = (f2) => (i._OrtReleaseTensor = K.ja)(f2), i._OrtCreateRunOptions = (f2, b2, y, I2) => (i._OrtCreateRunOptions = K.ka)(f2, b2, y, I2), i._OrtAddRunConfigEntry = (f2, b2, y) => (i._OrtAddRunConfigEntry = K.la)(f2, b2, y), i._OrtReleaseRunOptions = (f2) => (i._OrtReleaseRunOptions = K.ma)(f2), i._OrtCreateBinding = (f2) => (i._OrtCreateBinding = K.na)(f2), i._OrtBindInput = (f2, b2, y) => (i._OrtBindInput = K.oa)(f2, b2, y), i._OrtBindOutput = (f2, b2, y, I2) => (i._OrtBindOutput = K.pa)(f2, b2, y, I2), i._OrtClearBoundOutputs = (f2) => (i._OrtClearBoundOutputs = K.qa)(f2), i._OrtReleaseBinding = (f2) => (i._OrtReleaseBinding = K.ra)(f2), i._OrtRunWithBinding = (f2, b2, y, I2, k) => (i._OrtRunWithBinding = K.sa)(f2, b2, y, I2, k), i._OrtRun = (f2, b2, y, I2, k, $, z, Oe) => (i._OrtRun = K.ta)(f2, b2, y, I2, k, $, z, Oe), i._OrtEndProfiling = (f2) => (i._OrtEndProfiling = K.ua)(f2);
          var In = i._pthread_self = () => (In = i._pthread_self = K.va)();
          i._malloc = (f2) => (i._malloc = K.wa)(f2), i._free = (f2) => (i._free = K.xa)(f2), i.__emscripten_tls_init = () => (i.__emscripten_tls_init = K.ya)();
          var $a = i.__emscripten_thread_init = (f2, b2, y, I2, k, $) => ($a = i.__emscripten_thread_init = K.Aa)(f2, b2, y, I2, k, $);
          i.__emscripten_thread_crashed = () => (i.__emscripten_thread_crashed = K.Ba)();
          var ka = (f2, b2, y, I2, k) => (ka = K.Ca)(f2, b2, y, I2, k), Mo = (f2) => (Mo = K.Da)(f2), Go = i.__emscripten_thread_exit = (f2) => (Go = i.__emscripten_thread_exit = K.Ea)(f2), Ba = () => (Ba = K.Fa)(), Na = (f2) => (Na = K.Ga)(f2), Ra = (f2, b2) => (Ra = K.Ha)(f2, b2), Sn = (f2) => (Sn = K.Ia)(f2), Uo = (f2) => (Uo = K.Ja)(f2), zo = () => (zo = K.Ka)();
          function wd() {
            var f2 = K;
            f2 = Object.assign({}, f2);
            var b2 = (I2) => () => I2() >>> 0, y = (I2) => (k) => I2(k) >>> 0;
            return f2.va = b2(f2.va), f2.wa = y(f2.wa), f2.emscripten_main_runtime_thread_id = b2(f2.emscripten_main_runtime_thread_id), f2.Ja = y(f2.Ja), f2.Ka = b2(f2.Ka), f2;
          }
          i.wasmMemory = Se, i.stackSave = () => zo(), i.stackRestore = (f2) => Sn(f2), i.stackAlloc = (f2) => Uo(f2), i.keepRuntimeAlive = () => 0 < Gt, i.UTF8ToString = Fe, i.stringToUTF8 = Yt, i.lengthBytesUTF8 = Ve, i.ExitStatus = rr, i.PThread = X;
          var An;
          tt = function f2() {
            An || Ma(), An || (tt = f2);
          };
          function Ma() {
            if (!(0 < Lt)) if (A) u2(i), A || or(qt), startWorker(i);
            else {
              if (i.preRun) for (typeof i.preRun == "function" && (i.preRun = [i.preRun]); i.preRun.length; ) Tt.unshift(i.preRun.shift());
              or(Tt), 0 < Lt || An || (An = true, i.calledRun = true, et || (A || or(qt), u2(i), A || or(xt)));
            }
          }
          return Ma(), c2;
        };
      })();
      typeof $p == "object" && typeof na == "object" ? na.exports = Fp : typeof define == "function" && define.amd && define([], () => Fp);
    });
    Bp = me((aO, ag) => {
      ag.exports = '"use strict";var Module={},ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads"),parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",e=>onmessage({data:e}));var fs=require("fs"),vm=require("vm");Object.assign(global,{self:global,require,Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:e=>vm.runInThisContext(fs.readFileSync(e,"utf8"),{filename:e}),postMessage:e=>parentPort.postMessage(e),performance:global.performance||{now:Date.now}})}var initializedJS=!1;function threadPrintErr(...e){var a=e.join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,a+`\n`);return}console.error(a)}function threadAlert(...e){var a=e.join(" ");postMessage({cmd:"alert",text:a,threadId:Module._pthread_self()})}var err=threadPrintErr;self.alert=threadAlert,Module.instantiateWasm=(e,a)=>{var r=Module.wasmModule;Module.wasmModule=null;var t=new WebAssembly.Instance(r,e);return a(t)},self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let r=[];self.onmessage=t=>r.push(t),self.startWorker=t=>{Module=t,postMessage({cmd:"loaded"});for(let s of r)handleMessage(s);self.onmessage=handleMessage},Module.wasmModule=e.data.wasmModule;for(const t of e.data.handlers)Module[t]=(...s)=>{postMessage({cmd:"callHandler",handler:t,args:s})};if(Module.wasmMemory=e.data.wasmMemory,Module.buffer=Module.wasmMemory.buffer,Module.ENVIRONMENT_IS_PTHREAD=!0,typeof e.data.urlOrBlob=="string")importScripts(e.data.urlOrBlob);else{var a=URL.createObjectURL(e.data.urlOrBlob);importScripts(a),URL.revokeObjectURL(a)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module.__emscripten_thread_init(e.data.pthread_ptr,0,0,1),Module.__emscripten_thread_mailbox_await(e.data.pthread_ptr),Module.establishStackSpace(),Module.PThread.receiveObjectTransfer(e.data),Module.PThread.threadInitTLS(),initializedJS||(initializedJS=!0);try{Module.invokeEntryPoint(e.data.start_routine,e.data.arg)}catch(r){if(r!="unwind")throw r}}else e.data.cmd==="cancel"?Module._pthread_self()&&Module.__emscripten_thread_exit(-1):e.data.target==="setimmediate"||(e.data.cmd==="checkMailbox"?initializedJS&&Module.checkMailbox():e.data.cmd&&(err(`worker.js received unknown command ${e.data.cmd}`),err(e.data)))}catch(r){throw Module.__emscripten_thread_crashed?.(),r}}self.onmessage=handleMessage;\n';
    });
    Ur = L(() => {
      "use strict";
      Rp = Pp();
      sg = kp(), ia = false, So = false, Np = false, ug = (a) => {
        if (a === 1) return false;
        if (typeof SharedArrayBuffer > "u") return typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + a + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), false;
        typeof process < "u" && process.versions && process.versions.node && console.warn("env.wasm.numThreads is set to " + a + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios.");
        try {
          return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
        } catch {
          return false;
        }
      }, lg = () => {
        try {
          return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11]));
        } catch {
          return false;
        }
      }, fg = (a, t) => a ? t ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm" : t ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm", Mp = async (a) => {
        if (ia) return Promise.resolve();
        if (So) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
        if (Np) throw new Error("previous call to 'initializeWebAssembly()' failed.");
        So = true;
        let t = a.initTimeout, o = a.numThreads, e = a.simd, r = ug(o), n = e && lg(), s = a.wasmPaths, i = typeof s == "string" ? s : void 0, u2 = fg(n, r), l = typeof s == "object" ? s[u2] : void 0, c2 = false, p2 = [];
        if (t > 0 && p2.push(new Promise((d) => {
          setTimeout(() => {
            c2 = true, d();
          }, t);
        })), p2.push(new Promise((d, T) => {
          let w = r ? sg : Rp, v = { locateFile: (S2, A) => r && S2.endsWith(".worker.js") && typeof Blob < "u" ? URL.createObjectURL(new Blob([Bp()], { type: "text/javascript" })) : S2.endsWith(".wasm") ? l || (i ?? A) + u2 : A + S2 };
          if (r) if (v.numThreads = o, typeof Blob > "u") v.mainScriptUrlOrBlob = (void 0)(__dirname, "ort-wasm-threaded.js");
          else {
            let S2 = `var ortWasmThreaded=${w.toString()};`;
            v.mainScriptUrlOrBlob = new Blob([S2], { type: "text/javascript" });
          }
          w(v).then((S2) => {
            So = false, ia = true, oa = S2, d();
          }, (S2) => {
            So = false, Np = true, T(S2);
          });
        })), await Promise.race(p2), c2) throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`);
      }, De = () => {
        if (ia && oa) return oa;
        throw new Error("WebAssembly is not initialized yet.");
      };
    });
    Ao = L(() => {
      "use strict";
      Ur();
      ve = (a, t) => {
        let o = De(), e = o.lengthBytesUTF8(a) + 1, r = o._malloc(e);
        return o.stringToUTF8(a, r, e), t.push(r), r;
      }, bn = (a, t, o, e) => {
        if (typeof a == "object" && a !== null) {
          if (o.has(a)) throw new Error("Circular reference in options");
          o.add(a);
        }
        Object.entries(a).forEach(([r, n]) => {
          let s = t ? t + r : r;
          if (typeof n == "object") bn(n, s + ".", o, e);
          else if (typeof n == "string" || typeof n == "number") e(s, n.toString());
          else if (typeof n == "boolean") e(s, n ? "1" : "0");
          else throw new Error(`Can't handle extra config type: ${typeof n}`);
        });
      }, _e = (a) => {
        let t = De(), o = t.stackSave();
        try {
          let e = t.stackAlloc(8);
          t._OrtGetLastError(e, e + 4);
          let r = t.HEAP32[e / 4], n = t.HEAPU32[e / 4 + 1], s = n ? t.UTF8ToString(n) : "";
          throw new Error(`${a} ERROR_CODE: ${r}, ERROR_MESSAGE: ${s}`);
        } finally {
          t.stackRestore(o);
        }
      };
    });
    Up = L(() => {
      "use strict";
      Ur();
      Ao();
      Gp = (a) => {
        let t = De(), o = 0, e = [], r = a || {};
        try {
          if (a?.logSeverityLevel === void 0) r.logSeverityLevel = 2;
          else if (typeof a.logSeverityLevel != "number" || !Number.isInteger(a.logSeverityLevel) || a.logSeverityLevel < 0 || a.logSeverityLevel > 4) throw new Error(`log serverity level is not valid: ${a.logSeverityLevel}`);
          if (a?.logVerbosityLevel === void 0) r.logVerbosityLevel = 0;
          else if (typeof a.logVerbosityLevel != "number" || !Number.isInteger(a.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${a.logVerbosityLevel}`);
          a?.terminate === void 0 && (r.terminate = false);
          let n = 0;
          return a?.tag !== void 0 && (n = ve(a.tag, e)), o = t._OrtCreateRunOptions(r.logSeverityLevel, r.logVerbosityLevel, !!r.terminate, n), o === 0 && _e("Can't create run options."), a?.extra !== void 0 && bn(a.extra, "", /* @__PURE__ */ new WeakSet(), (s, i) => {
            let u2 = ve(s, e), l = ve(i, e);
            t._OrtAddRunConfigEntry(o, u2, l) !== 0 && _e(`Can't set a run config entry: ${s} - ${i}.`);
          }), [o, e];
        } catch (n) {
          throw o !== 0 && t._OrtReleaseRunOptions(o), e.forEach((s) => t._free(s)), n;
        }
      };
    });
    Vp = L(() => {
      "use strict";
      Ur();
      Ao();
      cg = (a) => {
        switch (a) {
          case "disabled":
            return 0;
          case "basic":
            return 1;
          case "extended":
            return 2;
          case "all":
            return 99;
          default:
            throw new Error(`unsupported graph optimization level: ${a}`);
        }
      }, pg = (a) => {
        switch (a) {
          case "sequential":
            return 0;
          case "parallel":
            return 1;
          default:
            throw new Error(`unsupported execution mode: ${a}`);
        }
      }, dg = (a) => {
        a.extra || (a.extra = {}), a.extra.session || (a.extra.session = {});
        let t = a.extra.session;
        t.use_ort_model_bytes_directly || (t.use_ort_model_bytes_directly = "1"), a.executionProviders && a.executionProviders.some((o) => (typeof o == "string" ? o : o.name) === "webgpu") && (a.enableMemPattern = false);
      }, hg = (a, t, o) => {
        for (let e of t) {
          let r = typeof e == "string" ? e : e.name;
          switch (r) {
            case "webnn":
              if (r = "WEBNN", typeof e != "string") {
                let s = e;
                if (s?.deviceType) {
                  let i = ve("deviceType", o), u2 = ve(s.deviceType, o);
                  De()._OrtAddSessionConfigEntry(a, i, u2) !== 0 && _e(`Can't set a session config entry: 'deviceType' - ${s.deviceType}.`);
                }
                if (s?.numThreads) {
                  let i = s.numThreads;
                  (typeof i != "number" || !Number.isInteger(i) || i < 0) && (i = 0);
                  let u2 = ve("numThreads", o), l = ve(i.toString(), o);
                  De()._OrtAddSessionConfigEntry(a, u2, l) !== 0 && _e(`Can't set a session config entry: 'numThreads' - ${s.numThreads}.`);
                }
                if (s?.powerPreference) {
                  let i = ve("powerPreference", o), u2 = ve(s.powerPreference, o);
                  De()._OrtAddSessionConfigEntry(a, i, u2) !== 0 && _e(`Can't set a session config entry: 'powerPreference' - ${s.powerPreference}.`);
                }
              }
              break;
            case "webgpu":
              if (r = "JS", typeof e != "string") {
                let s = e;
                if (s?.preferredLayout) {
                  if (s.preferredLayout !== "NCHW" && s.preferredLayout !== "NHWC") throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${s.preferredLayout}`);
                  let i = ve("preferredLayout", o), u2 = ve(s.preferredLayout, o);
                  De()._OrtAddSessionConfigEntry(a, i, u2) !== 0 && _e(`Can't set a session config entry: 'preferredLayout' - ${s.preferredLayout}.`);
                }
              }
              break;
            case "wasm":
            case "cpu":
              continue;
            default:
              throw new Error(`not supported execution provider: ${r}`);
          }
          let n = ve(r, o);
          De()._OrtAppendExecutionProvider(a, n) !== 0 && _e(`Can't append execution provider: ${r}.`);
        }
      }, zp = (a) => {
        let t = De(), o = 0, e = [], r = a || {};
        dg(r);
        try {
          let n = cg(r.graphOptimizationLevel ?? "all"), s = pg(r.executionMode ?? "sequential"), i = typeof r.logId == "string" ? ve(r.logId, e) : 0, u2 = r.logSeverityLevel ?? 2;
          if (!Number.isInteger(u2) || u2 < 0 || u2 > 4) throw new Error(`log serverity level is not valid: ${u2}`);
          let l = r.logVerbosityLevel ?? 0;
          if (!Number.isInteger(l) || l < 0 || l > 4) throw new Error(`log verbosity level is not valid: ${l}`);
          let c2 = typeof r.optimizedModelFilePath == "string" ? ve(r.optimizedModelFilePath, e) : 0;
          if (o = t._OrtCreateSessionOptions(n, !!r.enableCpuMemArena, !!r.enableMemPattern, s, !!r.enableProfiling, 0, i, u2, l, c2), o === 0 && _e("Can't create session options."), r.executionProviders && hg(o, r.executionProviders, e), r.enableGraphCapture !== void 0) {
            if (typeof r.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${r.enableGraphCapture}`);
            let p2 = ve("enableGraphCapture", e), d = ve(r.enableGraphCapture.toString(), e);
            t._OrtAddSessionConfigEntry(o, p2, d) !== 0 && _e(`Can't set a session config entry: 'enableGraphCapture' - ${r.enableGraphCapture}.`);
          }
          if (r.freeDimensionOverrides) for (let [p2, d] of Object.entries(r.freeDimensionOverrides)) {
            if (typeof p2 != "string") throw new Error(`free dimension override name must be a string: ${p2}`);
            if (typeof d != "number" || !Number.isInteger(d) || d < 0) throw new Error(`free dimension override value must be a non-negative integer: ${d}`);
            let T = ve(p2, e);
            t._OrtAddFreeDimensionOverride(o, T, d) !== 0 && _e(`Can't set a free dimension override: ${p2} - ${d}.`);
          }
          return r.extra !== void 0 && bn(r.extra, "", /* @__PURE__ */ new WeakSet(), (p2, d) => {
            let T = ve(p2, e), w = ve(d, e);
            t._OrtAddSessionConfigEntry(o, T, w) !== 0 && _e(`Can't set a session config entry: ${p2} - ${d}.`);
          }), [o, e];
        } catch (n) {
          throw o !== 0 && t._OrtReleaseSessionOptions(o), e.forEach((s) => t._free(s)), n;
        }
      };
    });
    ua = L(() => {
      "use strict";
      aa = (a) => {
        switch (a) {
          case "int8":
            return 3;
          case "uint8":
            return 2;
          case "bool":
            return 9;
          case "int16":
            return 5;
          case "uint16":
            return 4;
          case "int32":
            return 6;
          case "uint32":
            return 12;
          case "float16":
            return 10;
          case "float32":
            return 1;
          case "float64":
            return 11;
          case "string":
            return 8;
          case "int64":
            return 7;
          case "uint64":
            return 13;
          default:
            throw new Error(`unsupported data type: ${a}`);
        }
      }, Wp = (a) => {
        switch (a) {
          case 3:
            return "int8";
          case 2:
            return "uint8";
          case 9:
            return "bool";
          case 5:
            return "int16";
          case 4:
            return "uint16";
          case 6:
            return "int32";
          case 12:
            return "uint32";
          case 10:
            return "float16";
          case 1:
            return "float32";
          case 11:
            return "float64";
          case 8:
            return "string";
          case 7:
            return "int64";
          case 13:
            return "uint64";
          default:
            throw new Error(`unsupported data type: ${a}`);
        }
      }, sa = (a) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][a], Hp = (a) => {
        switch (a) {
          case "float16":
            return typeof Float16Array < "u" && Float16Array.from ? Float16Array : Uint16Array;
          case "float32":
            return Float32Array;
          case "uint8":
            return Uint8Array;
          case "int8":
            return Int8Array;
          case "uint16":
            return Uint16Array;
          case "int16":
            return Int16Array;
          case "int32":
            return Int32Array;
          case "bool":
            return Uint8Array;
          case "float64":
            return Float64Array;
          case "uint32":
            return Uint32Array;
          case "int64":
            return BigInt64Array;
          case "uint64":
            return BigUint64Array;
          default:
            throw new Error(`unsupported type: ${a}`);
        }
      }, qp = (a) => {
        switch (a) {
          case "verbose":
            return 0;
          case "info":
            return 1;
          case "warning":
            return 2;
          case "error":
            return 3;
          case "fatal":
            return 4;
          default:
            throw new Error(`unsupported logging level: ${a}`);
        }
      }, Po = (a) => a === "float32" || a === "float16" || a === "int32" || a === "int64" || a === "uint32" || a === "uint8" || a === "bool", jp = (a) => {
        switch (a) {
          case "none":
            return 0;
          case "cpu":
            return 1;
          case "cpu-pinned":
            return 2;
          case "texture":
            return 3;
          case "gpu-buffer":
            return 4;
          default:
            throw new Error(`unsupported data location: ${a}`);
        }
      };
    });
    la = L(() => {
      "use strict";
      gn = async (a) => {
        if (typeof a == "string") if (typeof process < "u" && process.versions && process.versions.node) try {
          return new Uint8Array(await (void 0)(a));
        } catch (t) {
          if (t.code === "ERR_FS_FILE_TOO_LARGE") {
            let o = (void 0)(a), e = [];
            for await (let r of o) e.push(r);
            return new Uint8Array(Buffer.concat(e));
          }
          throw t;
        }
        else {
          let t = await fetch(a);
          if (!t.ok) throw new Error(`failed to load external data file: ${a}`);
          let o = t.headers.get("Content-Length"), e = o ? parseInt(o, 10) : 0;
          if (e < 1073741824) return new Uint8Array(await t.arrayBuffer());
          {
            if (!t.body) throw new Error(`failed to load external data file: ${a}, no response body.`);
            let r = t.body.getReader(), n;
            try {
              n = new ArrayBuffer(e);
            } catch (i) {
              if (i instanceof RangeError) {
                let u2 = Math.ceil(e / 65536);
                n = new WebAssembly.Memory({ initial: u2, maximum: u2 }).buffer;
              } else throw i;
            }
            let s = 0;
            for (; ; ) {
              let { done: i, value: u2 } = await r.read();
              if (i) break;
              let l = u2.byteLength;
              new Uint8Array(n, s, l).set(u2), s += l;
            }
            return new Uint8Array(n, 0, e);
          }
        }
        else return a instanceof Blob ? new Uint8Array(await a.arrayBuffer()) : a instanceof Uint8Array ? a : new Uint8Array(a);
      };
    });
    rd = L(() => {
      "use strict";
      Up();
      Vp();
      ua();
      Ur();
      Ao();
      la();
      mg = (a, t) => {
        De()._OrtInit(a, t) !== 0 && _e("Can't initialize onnxruntime.");
      }, Xp = async (a) => {
        mg(a.wasm.numThreads, qp(a.logLevel));
      }, Kp = async (a, t) => {
      }, zr = /* @__PURE__ */ new Map(), bg = (a) => {
        let t = De(), o = t.stackSave();
        try {
          let e = t.stackAlloc(8);
          return t._OrtGetInputOutputCount(a, e, e + 4) !== 0 && _e("Can't get session input/output count."), [t.HEAP32[e / 4], t.HEAP32[e / 4 + 1]];
        } finally {
          t.stackRestore(o);
        }
      }, fa = (a) => {
        let t = De(), o = t._malloc(a.byteLength);
        if (o === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${a.byteLength}.`);
        return t.HEAPU8.set(a, o), [o, a.byteLength];
      }, Jp = async (a, t) => {
        let o, e, r = De();
        Array.isArray(a) ? [o, e] = a : a.buffer === r.HEAPU8.buffer ? [o, e] = [a.byteOffset, a.byteLength] : [o, e] = fa(a);
        let n = 0, s = 0, i = 0, u2 = [], l = [], c2 = [];
        try {
          if ([s, u2] = zp(t), t?.externalData && r.mountExternalData) {
            let C = [];
            for (let F2 of t.externalData) {
              let J = typeof F2 == "string" ? F2 : F2.path;
              C.push(gn(typeof F2 == "string" ? F2 : F2.data).then((j2) => {
                r.mountExternalData(J, j2);
              }));
            }
            await Promise.all(C);
          }
          n = await r._OrtCreateSession(o, e, s), n === 0 && _e("Can't create a session.");
          let [p2, d] = bg(n), T = !!t?.enableGraphCapture, w = [], v = [], S2 = [];
          for (let C = 0; C < p2; C++) {
            let F2 = r._OrtGetInputName(n, C);
            F2 === 0 && _e("Can't get an input name."), l.push(F2), w.push(r.UTF8ToString(F2));
          }
          for (let C = 0; C < d; C++) {
            let F2 = r._OrtGetOutputName(n, C);
            F2 === 0 && _e("Can't get an output name."), c2.push(F2);
            let J = r.UTF8ToString(F2);
            v.push(J);
          }
          let A = null;
          return zr.set(n, [n, l, c2, A, T, false]), [n, w, v];
        } catch (p2) {
          throw l.forEach((d) => r._OrtFree(d)), c2.forEach((d) => r._OrtFree(d)), i !== 0 && r._OrtReleaseBinding(i), n !== 0 && r._OrtReleaseSession(n), p2;
        } finally {
          r._free(o), s !== 0 && r._OrtReleaseSessionOptions(s), u2.forEach((p2) => r._free(p2)), r.unmountExternalData?.();
        }
      }, Zp = (a) => {
        let t = De(), o = zr.get(a);
        if (!o) throw new Error(`cannot release session. invalid session id: ${a}`);
        let [e, r, n, s, i] = o;
        s && (i && t._OrtClearBoundOutputs(s.handle), t._OrtReleaseBinding(s.handle)), t.jsepOnReleaseSession?.(a), r.forEach((u2) => t._OrtFree(u2)), n.forEach((u2) => t._OrtFree(u2)), t._OrtReleaseSession(e), zr.delete(a);
      }, Yp = (a, t, o, e, r, n = false) => {
        if (!a) {
          t.push(0);
          return;
        }
        let s = De(), i = a[0], u2 = a[1], l = a[3], c2, p2;
        if (i === "string" && l === "gpu-buffer") throw new Error("String tensor is not supported on GPU.");
        if (n && l !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${r} when enableGraphCapture is true.`);
        if (l === "gpu-buffer") {
          let w = a[2].gpuBuffer, v = sa(aa(i));
          p2 = u2.reduce((A, C) => A * C, 1) * v;
          let S2 = s.jsepRegisterBuffer;
          if (!S2) throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
          c2 = S2(e, r, w, p2);
        } else {
          let w = a[2];
          if (Array.isArray(w)) {
            p2 = 4 * w.length, c2 = s._malloc(p2), o.push(c2);
            let v = c2 / 4;
            for (let S2 = 0; S2 < w.length; S2++) {
              if (typeof w[S2] != "string") throw new TypeError(`tensor data at index ${S2} is not a string`);
              s.HEAPU32[v++] = ve(w[S2], o);
            }
          } else p2 = w.byteLength, c2 = s._malloc(p2), o.push(c2), s.HEAPU8.set(new Uint8Array(w.buffer, w.byteOffset, p2), c2);
        }
        let d = s.stackSave(), T = s.stackAlloc(4 * u2.length);
        try {
          let w = T / 4;
          u2.forEach((S2) => s.HEAP32[w++] = S2);
          let v = s._OrtCreateTensor(aa(i), c2, p2, T, u2.length, jp(l));
          v === 0 && _e(`Can't create tensor for input/output. session=${e}, index=${r}.`), t.push(v);
        } finally {
          s.stackRestore(d);
        }
      }, Qp = async (a, t, o, e, r, n) => {
        let s = De(), i = zr.get(a);
        if (!i) throw new Error(`cannot run inference. invalid session id: ${a}`);
        let u2 = i[0], l = i[1], c2 = i[2], p2 = i[3], d = i[4], T = i[5], w = t.length, v = e.length, S2 = 0, A = [], C = [], F2 = [], J = [], j2 = s.stackSave(), ie = s.stackAlloc(w * 4), G = s.stackAlloc(w * 4), Te = s.stackAlloc(v * 4), He = s.stackAlloc(v * 4);
        try {
          [S2, A] = Gp(n);
          for (let ee = 0; ee < w; ee++) Yp(o[ee], C, J, a, t[ee], d);
          for (let ee = 0; ee < v; ee++) Yp(r[ee], F2, J, a, w + e[ee], d);
          let Le = ie / 4, Y = G / 4, Ne = Te / 4, Se = He / 4;
          for (let ee = 0; ee < w; ee++) s.HEAPU32[Le++] = C[ee], s.HEAPU32[Y++] = l[t[ee]];
          for (let ee = 0; ee < v; ee++) s.HEAPU32[Ne++] = F2[ee], s.HEAPU32[Se++] = c2[e[ee]];
          s.jsepOnRunStart?.(u2);
          let yt;
          yt = await s._OrtRun(u2, G, ie, w, He, v, Te, S2), yt !== 0 && _e("failed to call OrtRun().");
          let et = [];
          for (let ee = 0; ee < v; ee++) {
            let qe = s.HEAPU32[Te / 4 + ee];
            if (qe === F2[ee]) {
              et.push(r[ee]);
              continue;
            }
            let Ht = s.stackSave(), Ke = s.stackAlloc(4 * 4), at = false, Re, Ce = 0;
            try {
              s._OrtGetTensorData(qe, Ke, Ke + 4, Ke + 8, Ke + 12) !== 0 && _e(`Can't access output tensor data on index ${ee}.`);
              let Tt = Ke / 4, qt = s.HEAPU32[Tt++];
              Ce = s.HEAPU32[Tt++];
              let xt = s.HEAPU32[Tt++], Lt = s.HEAPU32[Tt++], wt = [];
              for (let ke = 0; ke < Lt; ke++) wt.push(s.HEAPU32[xt / 4 + ke]);
              s._OrtFree(xt);
              let tt = wt.reduce((ke, Be) => ke * Be, 1);
              Re = Wp(qt);
              let tr = p2?.outputPreferredLocations[e[ee]];
              if (Re === "string") {
                if (tr === "gpu-buffer") throw new Error("String tensor is not supported on GPU.");
                let ke = [], Be = Ce / 4;
                for (let je = 0; je < tt; je++) {
                  let vt = s.HEAPU32[Be++], _t = je === tt - 1 ? void 0 : s.HEAPU32[Be] - vt;
                  ke.push(s.UTF8ToString(vt, _t));
                }
                et.push([Re, wt, ke, "cpu"]);
              } else if (tr === "gpu-buffer" && tt > 0) {
                let ke = s.jsepGetBuffer;
                if (!ke) throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
                let Be = ke(Ce), je = sa(qt);
                if (je === void 0 || !Po(Re)) throw new Error(`Unsupported data type: ${Re}`);
                at = true, et.push([Re, wt, { gpuBuffer: Be, download: s.jsepCreateDownloader(Be, tt * je, Re), dispose: () => {
                  s._OrtReleaseTensor(qe);
                } }, "gpu-buffer"]);
              } else {
                let ke = Hp(Re), Be = new ke(tt);
                new Uint8Array(Be.buffer, Be.byteOffset, Be.byteLength).set(s.HEAPU8.subarray(Ce, Ce + Be.byteLength)), et.push([Re, wt, Be, "cpu"]);
              }
            } finally {
              s.stackRestore(Ht), Re === "string" && Ce && s._free(Ce), at || s._OrtReleaseTensor(qe);
            }
          }
          return p2 && !d && (s._OrtClearBoundOutputs(p2.handle), zr.set(a, [u2, l, c2, p2, d, false])), et;
        } finally {
          s.stackRestore(j2), C.forEach((Le) => s._OrtReleaseTensor(Le)), F2.forEach((Le) => s._OrtReleaseTensor(Le)), J.forEach((Le) => s._free(Le)), S2 !== 0 && s._OrtReleaseRunOptions(S2), A.forEach((Le) => s._free(Le));
        }
      }, ed = (a) => {
        let t = De(), o = zr.get(a);
        if (!o) throw new Error("invalid session id");
        let e = o[0], r = t._OrtEndProfiling(e);
        r === 0 && _e("Can't get an profile file name."), t._OrtFree(r);
      }, td = (a) => {
        let t = [];
        for (let o of a) {
          let e = o[2];
          !Array.isArray(e) && "buffer" in e && t.push(e.buffer);
        }
        return t;
      };
    });
    nd = me((IO, yg) => {
      yg.exports = '/*!\n * ONNX Runtime Web v1.18.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";(()=>{var vt=Object.defineProperty;var qr=Object.getOwnPropertyDescriptor;var Vr=Object.getOwnPropertyNames;var Jr=Object.prototype.hasOwnProperty;var _t=(i,c)=>()=>(i&&(c=i(i=0)),c);var Ke=(i,c)=>()=>(c||i((c={exports:{}}).exports,c),c.exports),Et=(i,c)=>{for(var a in c)vt(i,a,{get:c[a],enumerable:!0})},Xr=(i,c,a,h)=>{if(c&&typeof c=="object"||typeof c=="function")for(let f of Vr(c))!Jr.call(i,f)&&f!==a&&vt(i,f,{get:()=>c[f],enumerable:!(h=qr(c,f))||h.enumerable});return i};var et=i=>Xr(vt({},"__esModule",{value:!0}),i);var St={};Et(St,{createReadStream:()=>lr,readFile:()=>Qr,readFileSync:()=>Zr});var Qr,Zr,lr,At=_t(()=>{Qr=void 0,Zr=void 0,lr=void 0});var Tt={};Et(Tt,{join:()=>Kr});var Kr,Mt=_t(()=>{Kr=void 0});var pr=Ke((dr,Ct)=>{"use strict";var cr=(()=>{var i=typeof document<"u"?document.currentScript?.src:void 0;return typeof __filename<"u"&&(i||=__filename),function(c={}){var a=c,h,f,w=new Promise((t,o)=>{h=t,f=o}),g=Object.assign({},a),s="./this.program",S=typeof window=="object",x=typeof importScripts=="function",H=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",A="",I,V,R;if(H){var B=(At(),et(St)),D=(Mt(),et(Tt));A=x?D.dirname(A)+"/":__dirname+"/",I=(t,o)=>(t=ce(t)?new URL(t):D.normalize(t),B.readFileSync(t,o?void 0:"utf8")),R=t=>(t=I(t,!0),t.buffer||(t=new Uint8Array(t)),t),V=(t,o,u,m=!0)=>{t=ce(t)?new URL(t):D.normalize(t),B.readFile(t,m?void 0:"utf8",(O,E)=>{O?u(O):o(m?E.buffer:E)})},!a.thisProgram&&1<process.argv.length&&(s=process.argv[1].replace(/\\\\/g,"/")),process.argv.slice(2)}else(S||x)&&(x?A=self.location.href:typeof document<"u"&&document.currentScript&&(A=document.currentScript.src),i&&(A=i),A.startsWith("blob:")?A="":A=A.substr(0,A.replace(/[?#].*/,"").lastIndexOf("/")+1),I=t=>{var o=new XMLHttpRequest;return o.open("GET",t,!1),o.send(null),o.responseText},x&&(R=t=>{var o=new XMLHttpRequest;return o.open("GET",t,!1),o.responseType="arraybuffer",o.send(null),new Uint8Array(o.response)}),V=(t,o,u)=>{var m=new XMLHttpRequest;m.open("GET",t,!0),m.responseType="arraybuffer",m.onload=()=>{m.status==200||m.status==0&&m.response?o(m.response):u()},m.onerror=u,m.send(null)});var T=console.log.bind(console),L=console.error.bind(console);Object.assign(a,g),g=null;var W,de=!1,pe,Z,_,J,Pe;function le(){var t=W.buffer;a.HEAP8=pe=new Int8Array(t),a.HEAP16=new Int16Array(t),a.HEAPU8=Z=new Uint8Array(t),a.HEAPU16=new Uint16Array(t),a.HEAP32=_=new Int32Array(t),a.HEAPU32=J=new Uint32Array(t),a.HEAPF32=new Float32Array(t),a.HEAPF64=Pe=new Float64Array(t)}var Ie=[],ne=[],X=[],we=0,me=null,F=null;function ie(t){throw t="Aborted("+t+")",L(t),de=!0,t=new WebAssembly.RuntimeError(t+". Build with -sASSERTIONS for more info."),f(t),t}var xe=t=>t.startsWith("data:application/octet-stream;base64,"),ce=t=>t.startsWith("file://"),be;if(be="ort-wasm.wasm",!xe(be)){var ae=be;be=a.locateFile?a.locateFile(ae,A):A+ae}function K(t){if(R)return R(t);throw"both async and sync fetching of the wasm failed"}function je(t){if(S||x){if(typeof fetch=="function"&&!ce(t))return fetch(t,{credentials:"same-origin"}).then(o=>{if(!o.ok)throw`failed to load wasm binary file at \'${t}\'`;return o.arrayBuffer()}).catch(()=>K(t));if(V)return new Promise((o,u)=>{V(t,m=>o(new Uint8Array(m)),u)})}return Promise.resolve().then(()=>K(t))}function Oe(t,o,u){return je(t).then(m=>WebAssembly.instantiate(m,o)).then(u,m=>{L(`failed to asynchronously prepare wasm: ${m}`),ie(m)})}function Ue(t,o){var u=be;return typeof WebAssembly.instantiateStreaming!="function"||xe(u)||ce(u)||H||typeof fetch!="function"?Oe(u,t,o):fetch(u,{credentials:"same-origin"}).then(m=>WebAssembly.instantiateStreaming(m,t).then(o,function(O){return L(`wasm streaming compile failed: ${O}`),L("falling back to ArrayBuffer instantiation"),Oe(u,t,o)}))}var ve,Ae={798088:(t,o,u,m)=>{if(typeof a>"u"||!a.ya)return 1;if(t=ue(t>>>0),t.startsWith("./")&&(t=t.substring(2)),t=a.ya.get(t),!t)return 2;if(o>>>=0,u>>>=0,o+u>t.byteLength)return 3;try{return Z.set(t.subarray(o,o+u),m>>>0>>>0),0}catch{return 4}}};class _e{constructor(o){this.wa=o-24}}var ge=0,Be=0,te=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,re=(t,o,u)=>{o>>>=0;var m=o+u;for(u=o;t[u]&&!(u>=m);)++u;if(16<u-o&&t.buffer&&te)return te.decode(t.subarray(o,u));for(m="";o<u;){var O=t[o++];if(O&128){var E=t[o++]&63;if((O&224)==192)m+=String.fromCharCode((O&31)<<6|E);else{var U=t[o++]&63;O=(O&240)==224?(O&15)<<12|E<<6|U:(O&7)<<18|E<<12|U<<6|t[o++]&63,65536>O?m+=String.fromCharCode(O):(O-=65536,m+=String.fromCharCode(55296|O>>10,56320|O&1023))}}else m+=String.fromCharCode(O)}return m},ue=(t,o)=>(t>>>=0)?re(Z,t,o):"",Ee=t=>{for(var o=0,u=0;u<t.length;++u){var m=t.charCodeAt(u);127>=m?o++:2047>=m?o+=2:55296<=m&&57343>=m?(o+=4,++u):o+=3}return o},Se=(t,o,u,m)=>{if(u>>>=0,!(0<m))return 0;var O=u;m=u+m-1;for(var E=0;E<t.length;++E){var U=t.charCodeAt(E);if(55296<=U&&57343>=U){var ee=t.charCodeAt(++E);U=65536+((U&1023)<<10)|ee&1023}if(127>=U){if(u>=m)break;o[u++>>>0]=U}else{if(2047>=U){if(u+1>=m)break;o[u++>>>0]=192|U>>6}else{if(65535>=U){if(u+2>=m)break;o[u++>>>0]=224|U>>12}else{if(u+3>=m)break;o[u++>>>0]=240|U>>18,o[u++>>>0]=128|U>>12&63}o[u++>>>0]=128|U>>6&63}o[u++>>>0]=128|U&63}}return o[u>>>0]=0,u-O},Le=t=>t%4===0&&(t%100!==0||t%400===0),ze=[0,31,60,91,121,152,182,213,244,274,305,335],rt=[0,31,59,90,120,151,181,212,243,273,304,334],Te=[],Ge={},ke=()=>{if(!We){var t={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:s||"./this.program"},o;for(o in Ge)Ge[o]===void 0?delete t[o]:t[o]=Ge[o];var u=[];for(o in t)u.push(`${o}=${t[o]}`);We=u}return We},We,nt=[null,[],[]],De=[31,29,31,30,31,30,31,31,30,31,30,31],at=[31,28,31,30,31,30,31,31,30,31,30,31];function G(t){var o=Array(Ee(t)+1);return Se(t,o,0,o.length),o}function qe(t,o,u,m){function O(d,k,$){for(d=typeof d=="number"?d.toString():d||"";d.length<k;)d=$[0]+d;return d}function E(d,k){return O(d,k,"0")}function U(d,k){function $(Ze){return 0>Ze?-1:0<Ze?1:0}var Me;return(Me=$(d.getFullYear()-k.getFullYear()))===0&&(Me=$(d.getMonth()-k.getMonth()))===0&&(Me=$(d.getDate()-k.getDate())),Me}function ee(d){switch(d.getDay()){case 0:return new Date(d.getFullYear()-1,11,29);case 1:return d;case 2:return new Date(d.getFullYear(),0,3);case 3:return new Date(d.getFullYear(),0,2);case 4:return new Date(d.getFullYear(),0,1);case 5:return new Date(d.getFullYear()-1,11,31);case 6:return new Date(d.getFullYear()-1,11,30)}}function ye(d){var k=d.sa;for(d=new Date(new Date(d.ta+1900,0,1).getTime());0<k;){var $=d.getMonth(),Me=(Le(d.getFullYear())?De:at)[$];if(k>Me-d.getDate())k-=Me-d.getDate()+1,d.setDate(1),11>$?d.setMonth($+1):(d.setMonth(0),d.setFullYear(d.getFullYear()+1));else{d.setDate(d.getDate()+k);break}}return $=new Date(d.getFullYear()+1,0,4),k=ee(new Date(d.getFullYear(),0,4)),$=ee($),0>=U(k,d)?0>=U($,d)?d.getFullYear()+1:d.getFullYear():d.getFullYear()-1}t>>>=0,o>>>=0,u>>>=0,m>>>=0;var oe=J[m+40>>>2>>>0];m={Ba:_[m>>>2>>>0],Aa:_[m+4>>>2>>>0],ua:_[m+8>>>2>>>0],xa:_[m+12>>>2>>>0],va:_[m+16>>>2>>>0],ta:_[m+20>>>2>>>0],na:_[m+24>>>2>>>0],sa:_[m+28>>>2>>>0],Da:_[m+32>>>2>>>0],za:_[m+36>>>2>>>0],Ca:oe?ue(oe):""},u=ue(u),oe={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var se in oe)u=u.replace(new RegExp(se,"g"),oe[se]);var Qe="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),Re="January February March April May June July August September October November December".split(" ");oe={"%a":d=>Qe[d.na].substring(0,3),"%A":d=>Qe[d.na],"%b":d=>Re[d.va].substring(0,3),"%B":d=>Re[d.va],"%C":d=>E((d.ta+1900)/100|0,2),"%d":d=>E(d.xa,2),"%e":d=>O(d.xa,2," "),"%g":d=>ye(d).toString().substring(2),"%G":ye,"%H":d=>E(d.ua,2),"%I":d=>(d=d.ua,d==0?d=12:12<d&&(d-=12),E(d,2)),"%j":d=>{for(var k=0,$=0;$<=d.va-1;k+=(Le(d.ta+1900)?De:at)[$++]);return E(d.xa+k,3)},"%m":d=>E(d.va+1,2),"%M":d=>E(d.Aa,2),"%n":()=>`\n`,"%p":d=>0<=d.ua&&12>d.ua?"AM":"PM","%S":d=>E(d.Ba,2),"%t":()=>"	","%u":d=>d.na||7,"%U":d=>E(Math.floor((d.sa+7-d.na)/7),2),"%V":d=>{var k=Math.floor((d.sa+7-(d.na+6)%7)/7);if(2>=(d.na+371-d.sa-2)%7&&k++,k)k==53&&($=(d.na+371-d.sa)%7,$==4||$==3&&Le(d.ta)||(k=1));else{k=52;var $=(d.na+7-d.sa-1)%7;($==4||$==5&&Le(d.ta%400-1))&&k++}return E(k,2)},"%w":d=>d.na,"%W":d=>E(Math.floor((d.sa+7-(d.na+6)%7)/7),2),"%y":d=>(d.ta+1900).toString().substring(2),"%Y":d=>d.ta+1900,"%z":d=>{d=d.za;var k=0<=d;return d=Math.abs(d)/60,(k?"+":"-")+("0000"+(d/60*100+d%60)).slice(-4)},"%Z":d=>d.Ca,"%%":()=>"%"},u=u.replace(/%%/g,"\\0\\0");for(se in oe)u.includes(se)&&(u=u.replace(new RegExp(se,"g"),oe[se](m)));return u=u.replace(/\\0\\0/g,"%"),se=G(u),se.length>o?0:(pe.set(se,t>>>0),se.length-1)}var Ve={a:function(t,o,u){t>>>=0;var m=new _e(t);throw J[m.wa+16>>>2>>>0]=0,J[m.wa+4>>>2>>>0]=o>>>0,J[m.wa+8>>>2>>>0]=u>>>0,ge=t,Be++,ge},e:function(){return 0},H:function(){},x:function(){},z:function(){},J:function(){return 0},F:function(){},A:function(){},E:function(){},g:function(){},y:function(){},v:function(){},G:function(){},w:function(){},k:()=>1,I:function(t,o,u){return o>>>=0,Z.copyWithin(t>>>0>>>0,o>>>0,o+(u>>>0)>>>0)},n:function(t,o,u){t=o+2097152>>>0<4194305-!!t?(t>>>0)+4294967296*o:NaN,u>>>=0,t=new Date(1e3*t),_[u>>>2>>>0]=t.getUTCSeconds(),_[u+4>>>2>>>0]=t.getUTCMinutes(),_[u+8>>>2>>>0]=t.getUTCHours(),_[u+12>>>2>>>0]=t.getUTCDate(),_[u+16>>>2>>>0]=t.getUTCMonth(),_[u+20>>>2>>>0]=t.getUTCFullYear()-1900,_[u+24>>>2>>>0]=t.getUTCDay(),_[u+28>>>2>>>0]=(t.getTime()-Date.UTC(t.getUTCFullYear(),0,1,0,0,0,0))/864e5|0},o:function(t,o,u){t=o+2097152>>>0<4194305-!!t?(t>>>0)+4294967296*o:NaN,u>>>=0,t=new Date(1e3*t),_[u>>>2>>>0]=t.getSeconds(),_[u+4>>>2>>>0]=t.getMinutes(),_[u+8>>>2>>>0]=t.getHours(),_[u+12>>>2>>>0]=t.getDate(),_[u+16>>>2>>>0]=t.getMonth(),_[u+20>>>2>>>0]=t.getFullYear()-1900,_[u+24>>>2>>>0]=t.getDay(),_[u+28>>>2>>>0]=(Le(t.getFullYear())?ze:rt)[t.getMonth()]+t.getDate()-1|0,_[u+36>>>2>>>0]=-(60*t.getTimezoneOffset()),o=new Date(t.getFullYear(),6,1).getTimezoneOffset();var m=new Date(t.getFullYear(),0,1).getTimezoneOffset();_[u+32>>>2>>>0]=(o!=m&&t.getTimezoneOffset()==Math.min(m,o))|0},p:function(t){t>>>=0;var o=new Date(_[t+20>>>2>>>0]+1900,_[t+16>>>2>>>0],_[t+12>>>2>>>0],_[t+8>>>2>>>0],_[t+4>>>2>>>0],_[t>>>2>>>0],0),u=_[t+32>>>2>>>0],m=o.getTimezoneOffset(),O=new Date(o.getFullYear(),6,1).getTimezoneOffset(),E=new Date(o.getFullYear(),0,1).getTimezoneOffset(),U=Math.min(E,O);return 0>u?_[t+32>>>2>>>0]=+(O!=E&&U==m):0<u!=(U==m)&&(O=Math.max(E,O),o.setTime(o.getTime()+6e4*((0<u?U:O)-m))),_[t+24>>>2>>>0]=o.getDay(),_[t+28>>>2>>>0]=(Le(o.getFullYear())?ze:rt)[o.getMonth()]+o.getDate()-1|0,_[t>>>2>>>0]=o.getSeconds(),_[t+4>>>2>>>0]=o.getMinutes(),_[t+8>>>2>>>0]=o.getHours(),_[t+12>>>2>>>0]=o.getDate(),_[t+16>>>2>>>0]=o.getMonth(),_[t+20>>>2>>>0]=o.getYear(),t=o.getTime(),t=isNaN(t)?-1:t/1e3,Je((ve=t,1<=+Math.abs(ve)?0<ve?+Math.floor(ve/4294967296)>>>0:~~+Math.ceil((ve-+(~~ve>>>0))/4294967296)>>>0:0)),t>>>0},l:function(){return-52},m:function(){},t:function(t,o,u,m){u>>>=0,m>>>=0;var O=new Date().getFullYear(),E=new Date(O,0,1),U=new Date(O,6,1);O=E.getTimezoneOffset();var ee=U.getTimezoneOffset();J[t>>>0>>>2>>>0]=60*Math.max(O,ee),_[o>>>0>>>2>>>0]=+(O!=ee),t=ye=>ye.toLocaleTimeString(void 0,{hour12:!1,timeZoneName:"short"}).split(" ")[1],E=t(E),U=t(U),ee<O?(Se(E,Z,u,17),Se(U,Z,m,17)):(Se(E,Z,m,17),Se(U,Z,u,17))},d:()=>{ie("")},B:function(t,o,u){t>>>=0,o>>>=0,u>>>=0,Te.length=0;for(var m;m=Z[o++>>>0];){var O=m!=105;O&=m!=112,u+=O&&u%8?4:0,Te.push(m==112?J[u>>>2>>>0]:m==105?_[u>>>2>>>0]:Pe[u>>>3>>>0]),u+=O?8:4}return Ae[t](...Te)},h:()=>Date.now(),u:function(){return 4294901760},b:()=>performance.now(),s:function(t){t>>>=0;var o=Z.length;if(4294901760<t)return!1;for(var u=1;4>=u;u*=2){var m=o*(1+.2/u);m=Math.min(m,t+100663296);var O=Math;m=Math.max(t,m);e:{O=(O.min.call(O,4294901760,m+(65536-m%65536)%65536)-W.buffer.byteLength+65535)/65536;try{W.grow(O),le();var E=1;break e}catch{}E=void 0}if(E)return!0}return!1},C:function(t,o){t>>>=0,o>>>=0;var u=0;return ke().forEach((m,O)=>{var E=o+u;for(O=J[t+4*O>>>2>>>0]=E,E=0;E<m.length;++E)pe[O++>>>0]=m.charCodeAt(E);pe[O>>>0]=0,u+=m.length+1}),0},D:function(t,o){t>>>=0,o>>>=0;var u=ke();J[t>>>2>>>0]=u.length;var m=0;return u.forEach(O=>m+=O.length+1),J[o>>>2>>>0]=m,0},f:()=>52,j:function(){return 52},q:function(){return 70},i:function(t,o,u,m){o>>>=0,u>>>=0,m>>>=0;for(var O=0,E=0;E<u;E++){var U=J[o>>>2>>>0],ee=J[o+4>>>2>>>0];o+=8;for(var ye=0;ye<ee;ye++){var oe=Z[U+ye>>>0],se=nt[t];oe===0||oe===10?((t===1?T:L)(re(se,0)),se.length=0):se.push(oe)}O+=ee}return J[m>>>2>>>0]=O,0},r:qe,c:function(t,o,u,m){return qe(t>>>0,o>>>0,u>>>0,m>>>0)}},P=function(){function t(u){return P=u.exports,P=st(),W=P.K,le(),ne.unshift(P.L),we--,we==0&&(me!==null&&(clearInterval(me),me=null),F&&(u=F,F=null,u())),P}var o={a:Ve};if(we++,a.instantiateWasm)try{return a.instantiateWasm(o,t)}catch(u){L(`Module.instantiateWasm callback failed with error: ${u}`),f(u)}return Ue(o,function(u){t(u.instance)}).catch(f),{}}();a._OrtInit=(t,o)=>(a._OrtInit=P.M)(t,o),a._OrtGetLastError=(t,o)=>(a._OrtGetLastError=P.N)(t,o),a._OrtCreateSessionOptions=(t,o,u,m,O,E,U,ee,ye,oe)=>(a._OrtCreateSessionOptions=P.O)(t,o,u,m,O,E,U,ee,ye,oe),a._OrtAppendExecutionProvider=(t,o)=>(a._OrtAppendExecutionProvider=P.P)(t,o),a._OrtAddFreeDimensionOverride=(t,o,u)=>(a._OrtAddFreeDimensionOverride=P.Q)(t,o,u),a._OrtAddSessionConfigEntry=(t,o,u)=>(a._OrtAddSessionConfigEntry=P.R)(t,o,u),a._OrtReleaseSessionOptions=t=>(a._OrtReleaseSessionOptions=P.S)(t),a._OrtCreateSession=(t,o,u)=>(a._OrtCreateSession=P.T)(t,o,u),a._OrtReleaseSession=t=>(a._OrtReleaseSession=P.U)(t),a._OrtGetInputOutputCount=(t,o,u)=>(a._OrtGetInputOutputCount=P.V)(t,o,u),a._OrtGetInputName=(t,o)=>(a._OrtGetInputName=P.W)(t,o),a._OrtGetOutputName=(t,o)=>(a._OrtGetOutputName=P.X)(t,o),a._OrtFree=t=>(a._OrtFree=P.Y)(t),a._OrtCreateTensor=(t,o,u,m,O,E)=>(a._OrtCreateTensor=P.Z)(t,o,u,m,O,E),a._OrtGetTensorData=(t,o,u,m,O)=>(a._OrtGetTensorData=P._)(t,o,u,m,O),a._OrtReleaseTensor=t=>(a._OrtReleaseTensor=P.$)(t),a._OrtCreateRunOptions=(t,o,u,m)=>(a._OrtCreateRunOptions=P.aa)(t,o,u,m),a._OrtAddRunConfigEntry=(t,o,u)=>(a._OrtAddRunConfigEntry=P.ba)(t,o,u),a._OrtReleaseRunOptions=t=>(a._OrtReleaseRunOptions=P.ca)(t),a._OrtCreateBinding=t=>(a._OrtCreateBinding=P.da)(t),a._OrtBindInput=(t,o,u)=>(a._OrtBindInput=P.ea)(t,o,u),a._OrtBindOutput=(t,o,u,m)=>(a._OrtBindOutput=P.fa)(t,o,u,m),a._OrtClearBoundOutputs=t=>(a._OrtClearBoundOutputs=P.ga)(t),a._OrtReleaseBinding=t=>(a._OrtReleaseBinding=P.ha)(t),a._OrtRunWithBinding=(t,o,u,m,O)=>(a._OrtRunWithBinding=P.ia)(t,o,u,m,O),a._OrtRun=(t,o,u,m,O,E,U,ee)=>(a._OrtRun=P.ja)(t,o,u,m,O,E,U,ee),a._OrtEndProfiling=t=>(a._OrtEndProfiling=P.ka)(t),a._malloc=t=>(a._malloc=P.la)(t),a._free=t=>(a._free=P.ma)(t);var Je=t=>(Je=P.oa)(t),ot=t=>(ot=P.pa)(t),M=t=>(M=P.qa)(t),Ne=()=>(Ne=P.ra)();function st(){var t=P;t=Object.assign({},t);var o=u=>m=>u(m)>>>0;return t.la=o(t.la),t.qa=o(t.qa),t.ra=(u=>()=>u()>>>0)(t.ra),t}a.stackSave=()=>Ne(),a.stackRestore=t=>ot(t),a.stackAlloc=t=>M(t),a.UTF8ToString=ue,a.stringToUTF8=(t,o,u)=>Se(t,Z,o,u),a.lengthBytesUTF8=Ee;var Fe;F=function t(){Fe||Xe(),Fe||(F=t)};function Xe(){if(!(0<we)){if(a.preRun)for(typeof a.preRun=="function"&&(a.preRun=[a.preRun]);a.preRun.length;){var t=a.preRun.shift();Ie.unshift(t)}for(;0<Ie.length;)Ie.shift()(a);if(!(0<we||Fe||(Fe=!0,a.calledRun=!0,de))){for(;0<ne.length;)ne.shift()(a);for(h(a);0<X.length;)X.shift()(a)}}}return Xe(),w}})();typeof dr=="object"&&typeof Ct=="object"?Ct.exports=cr:typeof define=="function"&&define.amd&&define([],()=>cr)});var mr=Ke(()=>{});var gr=Ke(()=>{});var hr={};Et(hr,{cpus:()=>en});var en,br=_t(()=>{en=void 0});var Or=Ke((wr,Dt)=>{"use strict";var yr=(()=>{var i=typeof document<"u"?document.currentScript?.src:void 0;return typeof __filename<"u"&&(i||=__filename),function(c={}){function a(){return X.buffer!=ie.buffer&&K(),ie}function h(){return X.buffer!=ie.buffer&&K(),xe}function f(){return X.buffer!=ie.buffer&&K(),ce}function w(){return X.buffer!=ie.buffer&&K(),be}function g(){return X.buffer!=ie.buffer&&K(),ae}var s=c,S,x,H=new Promise((e,r)=>{S=e,x=r}),A=Object.assign({},s),I="./this.program",V=(e,r)=>{throw r},R=typeof window=="object",B=typeof importScripts=="function",D=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",T=s.ENVIRONMENT_IS_PTHREAD||!1,L="";function W(e){return s.locateFile?s.locateFile(e,L):L+e}var de,pe,Z;if(D){var _=(At(),et(St)),J=(Mt(),et(Tt));L=B?J.dirname(L)+"/":__dirname+"/",de=(e,r)=>(e=ue(e)?new URL(e):J.normalize(e),_.readFileSync(e,r?void 0:"utf8")),Z=e=>(e=de(e,!0),e.buffer||(e=new Uint8Array(e)),e),pe=(e,r,n,l=!0)=>{e=ue(e)?new URL(e):J.normalize(e),_.readFile(e,l?void 0:"utf8",(y,b)=>{y?n(y):r(l?b.buffer:b)})},!s.thisProgram&&1<process.argv.length&&(I=process.argv[1].replace(/\\\\/g,"/")),process.argv.slice(2),V=(e,r)=>{throw process.exitCode=e,r},global.Worker=mr().Worker}else(R||B)&&(B?L=self.location.href:typeof document<"u"&&document.currentScript&&(L=document.currentScript.src),typeof i<"u"&&i&&(L=i),L.startsWith("blob:")?L="":L=L.substr(0,L.replace(/[?#].*/,"").lastIndexOf("/")+1),D||(de=e=>{var r=new XMLHttpRequest;return r.open("GET",e,!1),r.send(null),r.responseText},B&&(Z=e=>{var r=new XMLHttpRequest;return r.open("GET",e,!1),r.responseType="arraybuffer",r.send(null),new Uint8Array(r.response)}),pe=(e,r,n)=>{var l=new XMLHttpRequest;l.open("GET",e,!0),l.responseType="arraybuffer",l.onload=()=>{l.status==200||l.status==0&&l.response?r(l.response):n()},l.onerror=n,l.send(null)}));D&&typeof performance>"u"&&(global.performance=gr().performance);var Pe=console.log.bind(console),le=console.error.bind(console);D&&(Pe=(...e)=>_.writeSync(1,e.join(" ")+`\n`),le=(...e)=>_.writeSync(2,e.join(" ")+`\n`));var Ie=Pe,ne=le;Object.assign(s,A),A=null;var X,we,me=!1,F,ie,xe,ce,be,ae;function K(){var e=X.buffer;s.HEAP8=ie=new Int8Array(e),s.HEAP16=new Int16Array(e),s.HEAPU8=xe=new Uint8Array(e),s.HEAPU16=new Uint16Array(e),s.HEAP32=ce=new Int32Array(e),s.HEAPU32=be=new Uint32Array(e),s.HEAPF32=new Float32Array(e),s.HEAPF64=ae=new Float64Array(e)}var je=16777216;if(T)X=s.wasmMemory;else if(s.wasmMemory)X=s.wasmMemory;else if(X=new WebAssembly.Memory({initial:je/65536,maximum:65536,shared:!0}),!(X.buffer instanceof SharedArrayBuffer))throw ne("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),D&&ne("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"),Error("bad memory");K(),je=X.buffer.byteLength;var Oe=[],Ue=[],ve=[],Ae=0,_e=null,ge=null;function Be(){if(Ae--,Ae==0&&(_e!==null&&(clearInterval(_e),_e=null),ge)){var e=ge;ge=null,e()}}function te(e){throw e="Aborted("+e+")",ne(e),me=!0,F=1,e=new WebAssembly.RuntimeError(e+". Build with -sASSERTIONS for more info."),x(e),e}var re=e=>e.startsWith("data:application/octet-stream;base64,"),ue=e=>e.startsWith("file://"),Ee;Ee="ort-wasm-threaded.wasm",re(Ee)||(Ee=W(Ee));function Se(e){if(Z)return Z(e);throw"both async and sync fetching of the wasm failed"}function Le(e){if(R||B){if(typeof fetch=="function"&&!ue(e))return fetch(e,{credentials:"same-origin"}).then(r=>{if(!r.ok)throw`failed to load wasm binary file at \'${e}\'`;return r.arrayBuffer()}).catch(()=>Se(e));if(pe)return new Promise((r,n)=>{pe(e,l=>r(new Uint8Array(l)),n)})}return Promise.resolve().then(()=>Se(e))}function ze(e,r,n){return Le(e).then(l=>WebAssembly.instantiate(l,r)).then(n,l=>{ne(`failed to asynchronously prepare wasm: ${l}`),te(l)})}function rt(e,r){var n=Ee;return typeof WebAssembly.instantiateStreaming!="function"||re(n)||ue(n)||D||typeof fetch!="function"?ze(n,e,r):fetch(n,{credentials:"same-origin"}).then(l=>WebAssembly.instantiateStreaming(l,e).then(r,function(y){return ne(`wasm streaming compile failed: ${y}`),ne("falling back to ArrayBuffer instantiation"),ze(n,e,r)}))}var Te,Ge={799444:(e,r,n,l)=>{if(typeof s>"u"||!s.bb)return 1;if(e=ee(e>>>0),e.startsWith("./")&&(e=e.substring(2)),e=s.bb.get(e),!e)return 2;if(r>>>=0,n>>>=0,l>>>=0,r+n>e.byteLength)return 3;try{return h().set(e.subarray(r,r+n),l>>>0),0}catch{return 4}}};function ke(e){this.name="ExitStatus",this.message=`Program terminated with exit(${e})`,this.status=e}var We=e=>{e.terminate(),e.onmessage=()=>{}},nt=e=>{M.Oa.length==0&&(Je(),M.Xa(M.Oa[0]));var r=M.Oa.pop();if(!r)return 6;M.Pa.push(r),M.La[e.Na]=r,r.Na=e.Na;var n={cmd:"run",start_routine:e.gb,arg:e.cb,pthread_ptr:e.Na};return D&&r.unref(),r.postMessage(n,e.mb),0},De=0,at=e=>{var r=Ot();return e=e(),ft(r),e},G=(e,r,...n)=>at(()=>{for(var l=n.length,y=wt(8*l),b=y>>>3,v=0;v<n.length;v++){var z=n[v];g()[b+v>>>0]=z}return rr(e,0,l,y,r)});function qe(e){if(T)return G(0,1,e);F=e,0<De||(M.hb(),s.onExit?.(e),me=!0),V(e,new ke(e))}var Ve=e=>{if(F=e,T)throw st(e),"unwind";qe(e)};function P(){for(var e=s.numThreads;e--;)Je();Oe.unshift(()=>{Ae++,ot(()=>Be())})}function Je(){var e=W("ort-wasm-threaded.worker.js");e=new Worker(e),M.Oa.push(e)}function ot(e){T?e():Promise.all(M.Oa.map(M.Xa)).then(e)}var M={Oa:[],Pa:[],ab:[],La:{},Va(){T?(M.receiveObjectTransfer=M.fb,M.threadInitTLS=M.$a,M.setExitStatus=M.Za):P()},Za:e=>F=e,pb:["$terminateWorker"],hb:()=>{for(var e of M.Pa)We(e);for(e of M.Oa)We(e);M.Oa=[],M.Pa=[],M.La=[]},Ya:e=>{var r=e.Na;delete M.La[r],M.Oa.push(e),M.Pa.splice(M.Pa.indexOf(e),1),e.Na=0,bt(r)},fb(){},$a(){M.ab.forEach(e=>e())},Xa:e=>new Promise(r=>{e.onmessage=b=>{b=b.data;var v=b.cmd;if(b.targetThread&&b.targetThread!=ut()){var z=M.La[b.targetThread];z?z.postMessage(b,b.transferList):ne(`Internal error! Worker sent a message "${v}" to target pthread ${b.targetThread}, but that thread no longer exists!`)}else v==="checkMailbox"?it():v==="spawnThread"?nt(b):v==="cleanupThread"?M.Ya(M.La[b.thread]):v==="killThread"?(b=b.thread,v=M.La[b],delete M.La[b],We(v),bt(b),M.Pa.splice(M.Pa.indexOf(v),1),v.Na=0):v==="cancelThread"?M.La[b.thread].postMessage({cmd:"cancel"}):v==="loaded"?(e.loaded=!0,D&&!e.Na&&e.unref(),r(e)):v==="alert"?alert(`Thread ${b.threadId}: ${b.text}`):b.target==="setimmediate"?e.postMessage(b):v==="callHandler"?s[b.handler](...b.args):v&&ne(`worker sent an unknown command ${v}`)},e.onerror=b=>{throw ne(`worker sent an error! ${b.filename}:${b.lineno}: ${b.message}`),b},D&&(e.on("message",b=>e.onmessage({data:b})),e.on("error",b=>e.onerror(b)));var n=[],l=["onExit"],y;for(y of l)s.hasOwnProperty(y)&&n.push(y);e.postMessage({cmd:"load",handlers:n,urlOrBlob:s.mainScriptUrlOrBlob||i,wasmMemory:X,wasmModule:we})})};s.PThread=M;var Ne=e=>{for(;0<e.length;)e.shift()(s)};s.establishStackSpace=()=>{var e=ut(),r=w()[e+52>>>2>>>0];e=w()[e+56>>>2>>>0],or(r,r-e),ft(r)};function st(e){if(T)return G(1,0,e);Ve(e)}var Fe=[],Xe;s.invokeEntryPoint=(e,r)=>{De=0;var n=Fe[e];n||(e>=Fe.length&&(Fe.length=e+1),Fe[e]=n=Xe.get(e)),e=n(r),0<De?M.Za(e):yt(e)};class t{constructor(r){this.Ua=r-24}Va(r,n){w()[this.Ua+16>>>2>>>0]=0,w()[this.Ua+4>>>2>>>0]=r,w()[this.Ua+8>>>2>>>0]=n}}var o=0,u=0;function m(e,r,n,l){return T?G(2,1,e,r,n,l):O(e,r,n,l)}function O(e,r,n,l){if(e>>>=0,r>>>=0,n>>>=0,l>>>=0,typeof SharedArrayBuffer>"u")return ne("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;var y=[];return T&&y.length===0?m(e,r,n,l):(e={gb:n,Na:e,cb:l,mb:y},T?(e.ob="spawnThread",postMessage(e,y),0):nt(e))}var E=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,U=(e,r,n)=>{r>>>=0;var l=r+n;for(n=r;e[n]&&!(n>=l);)++n;if(16<n-r&&e.buffer&&E)return E.decode(e.buffer instanceof SharedArrayBuffer?e.slice(r,n):e.subarray(r,n));for(l="";r<n;){var y=e[r++];if(y&128){var b=e[r++]&63;if((y&224)==192)l+=String.fromCharCode((y&31)<<6|b);else{var v=e[r++]&63;y=(y&240)==224?(y&15)<<12|b<<6|v:(y&7)<<18|b<<12|v<<6|e[r++]&63,65536>y?l+=String.fromCharCode(y):(y-=65536,l+=String.fromCharCode(55296|y>>10,56320|y&1023))}}else l+=String.fromCharCode(y)}return l},ee=(e,r)=>(e>>>=0)?U(h(),e,r):"";function ye(e,r,n){return T?G(3,1,e,r,n):0}function oe(e,r){if(T)return G(4,1,e,r)}var se=e=>{for(var r=0,n=0;n<e.length;++n){var l=e.charCodeAt(n);127>=l?r++:2047>=l?r+=2:55296<=l&&57343>=l?(r+=4,++n):r+=3}return r},Qe=(e,r,n,l)=>{if(n>>>=0,!(0<l))return 0;var y=n;l=n+l-1;for(var b=0;b<e.length;++b){var v=e.charCodeAt(b);if(55296<=v&&57343>=v){var z=e.charCodeAt(++b);v=65536+((v&1023)<<10)|z&1023}if(127>=v){if(n>=l)break;r[n++>>>0]=v}else{if(2047>=v){if(n+1>=l)break;r[n++>>>0]=192|v>>6}else{if(65535>=v){if(n+2>=l)break;r[n++>>>0]=224|v>>12}else{if(n+3>=l)break;r[n++>>>0]=240|v>>18,r[n++>>>0]=128|v>>12&63}r[n++>>>0]=128|v>>6&63}r[n++>>>0]=128|v&63}}return r[n>>>0]=0,n-y},Re=(e,r,n)=>Qe(e,h(),r,n);function d(e,r){if(T)return G(5,1,e,r)}function k(e,r,n){if(T)return G(6,1,e,r,n)}function $(e,r,n){return T?G(7,1,e,r,n):0}function Me(e,r){if(T)return G(8,1,e,r)}function Ze(e,r,n){if(T)return G(9,1,e,r,n)}function Rt(e,r,n,l){if(T)return G(10,1,e,r,n,l)}function It(e,r,n,l){if(T)return G(11,1,e,r,n,l)}function Bt(e,r,n,l){if(T)return G(12,1,e,r,n,l)}function kt(e){if(T)return G(13,1,e)}function Wt(e,r){if(T)return G(14,1,e,r)}function Nt(e,r,n){if(T)return G(15,1,e,r,n)}function dt(e){e>>>=0,typeof Atomics.nb=="function"&&(Atomics.nb(f(),e>>>2,e).value.then(it),e+=128,Atomics.store(f(),e>>>2,1))}s.__emscripten_thread_mailbox_await=dt;var it=()=>{var e=ut();if(e&&(dt(e),e=nr,!me))try{if(e(),!(0<De))try{T?yt(F):Ve(F)}catch(r){r instanceof ke||r=="unwind"||V(1,r)}}catch(r){r instanceof ke||r=="unwind"||V(1,r)}};s.checkMailbox=it;var pt=[],$e=e=>e%4===0&&(e%100!==0||e%400===0),Ht=[0,31,60,91,121,152,182,213,244,274,305,335],Gt=[0,31,59,90,120,151,181,212,243,273,304,334];function $t(e,r,n,l,y,b,v,z){return T?G(16,1,e,r,n,l,y,b,v,z):-52}function Yt(e,r,n,l,y,b,v){if(T)return G(17,1,e,r,n,l,y,b,v)}var mt=[],gt={},jt=()=>{if(!ht){var e={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:I||"./this.program"},r;for(r in gt)gt[r]===void 0?delete e[r]:e[r]=gt[r];var n=[];for(r in e)n.push(`${r}=${e[r]}`);ht=n}return ht},ht;function zt(e,r){if(T)return G(18,1,e,r);e>>>=0,r>>>=0;var n=0;return jt().forEach((l,y)=>{var b=r+n;for(y=w()[e+4*y>>>2>>>0]=b,b=0;b<l.length;++b)a()[y++>>>0]=l.charCodeAt(b);a()[y>>>0]=0,n+=l.length+1}),0}function qt(e,r){if(T)return G(19,1,e,r);e>>>=0,r>>>=0;var n=jt();w()[e>>>2>>>0]=n.length;var l=0;return n.forEach(y=>l+=y.length+1),w()[r>>>2>>>0]=l,0}function Vt(e){return T?G(20,1,e):52}function Jt(e,r,n,l){return T?G(21,1,e,r,n,l):52}function Xt(e,r,n,l,y){return T?G(22,1,e,r,n,l,y):70}var Hr=[null,[],[]];function Qt(e,r,n,l){if(T)return G(23,1,e,r,n,l);r>>>=0,n>>>=0,l>>>=0;for(var y=0,b=0;b<n;b++){var v=w()[r>>>2>>>0],z=w()[r+4>>>2>>>0];r+=8;for(var Ce=0;Ce<z;Ce++){var fe=h()[v+Ce>>>0],he=Hr[e];fe===0||fe===10?((e===1?Ie:ne)(U(he,0)),he.length=0):he.push(fe)}y+=z}return w()[l>>>2>>>0]=y,0}var Zt=[31,29,31,30,31,30,31,31,30,31,30,31],Kt=[31,28,31,30,31,30,31,31,30,31,30,31];function Gr(e){var r=Array(se(e)+1);return Qe(e,r,0,r.length),r}var $r=(e,r)=>{a().set(e,r>>>0)};function er(e,r,n,l){function y(p,N,q){for(p=typeof p=="number"?p.toString():p||"";p.length<N;)p=q[0]+p;return p}function b(p,N){return y(p,N,"0")}function v(p,N){function q(fr){return 0>fr?-1:0<fr?1:0}var He;return(He=q(p.getFullYear()-N.getFullYear()))===0&&(He=q(p.getMonth()-N.getMonth()))===0&&(He=q(p.getDate()-N.getDate())),He}function z(p){switch(p.getDay()){case 0:return new Date(p.getFullYear()-1,11,29);case 1:return p;case 2:return new Date(p.getFullYear(),0,3);case 3:return new Date(p.getFullYear(),0,2);case 4:return new Date(p.getFullYear(),0,1);case 5:return new Date(p.getFullYear()-1,11,31);case 6:return new Date(p.getFullYear()-1,11,30)}}function Ce(p){var N=p.Qa;for(p=new Date(new Date(p.Ra+1900,0,1).getTime());0<N;){var q=p.getMonth(),He=($e(p.getFullYear())?Zt:Kt)[q];if(N>He-p.getDate())N-=He-p.getDate()+1,p.setDate(1),11>q?p.setMonth(q+1):(p.setMonth(0),p.setFullYear(p.getFullYear()+1));else{p.setDate(p.getDate()+N);break}}return q=new Date(p.getFullYear()+1,0,4),N=z(new Date(p.getFullYear(),0,4)),q=z(q),0>=v(N,p)?0>=v(q,p)?p.getFullYear()+1:p.getFullYear():p.getFullYear()-1}e>>>=0,r>>>=0,n>>>=0,l>>>=0;var fe=w()[l+40>>>2>>>0];l={kb:f()[l>>>2>>>0],jb:f()[l+4>>>2>>>0],Sa:f()[l+8>>>2>>>0],Wa:f()[l+12>>>2>>>0],Ta:f()[l+16>>>2>>>0],Ra:f()[l+20>>>2>>>0],Ma:f()[l+24>>>2>>>0],Qa:f()[l+28>>>2>>>0],qb:f()[l+32>>>2>>>0],ib:f()[l+36>>>2>>>0],lb:fe?ee(fe):""},n=ee(n),fe={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var he in fe)n=n.replace(new RegExp(he,"g"),fe[he]);var ir="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),ur="January February March April May June July August September October November December".split(" ");fe={"%a":p=>ir[p.Ma].substring(0,3),"%A":p=>ir[p.Ma],"%b":p=>ur[p.Ta].substring(0,3),"%B":p=>ur[p.Ta],"%C":p=>b((p.Ra+1900)/100|0,2),"%d":p=>b(p.Wa,2),"%e":p=>y(p.Wa,2," "),"%g":p=>Ce(p).toString().substring(2),"%G":Ce,"%H":p=>b(p.Sa,2),"%I":p=>(p=p.Sa,p==0?p=12:12<p&&(p-=12),b(p,2)),"%j":p=>{for(var N=0,q=0;q<=p.Ta-1;N+=($e(p.Ra+1900)?Zt:Kt)[q++]);return b(p.Wa+N,3)},"%m":p=>b(p.Ta+1,2),"%M":p=>b(p.jb,2),"%n":()=>`\n`,"%p":p=>0<=p.Sa&&12>p.Sa?"AM":"PM","%S":p=>b(p.kb,2),"%t":()=>"	","%u":p=>p.Ma||7,"%U":p=>b(Math.floor((p.Qa+7-p.Ma)/7),2),"%V":p=>{var N=Math.floor((p.Qa+7-(p.Ma+6)%7)/7);if(2>=(p.Ma+371-p.Qa-2)%7&&N++,N)N==53&&(q=(p.Ma+371-p.Qa)%7,q==4||q==3&&$e(p.Ra)||(N=1));else{N=52;var q=(p.Ma+7-p.Qa-1)%7;(q==4||q==5&&$e(p.Ra%400-1))&&N++}return b(N,2)},"%w":p=>p.Ma,"%W":p=>b(Math.floor((p.Qa+7-(p.Ma+6)%7)/7),2),"%y":p=>(p.Ra+1900).toString().substring(2),"%Y":p=>p.Ra+1900,"%z":p=>{p=p.ib;var N=0<=p;return p=Math.abs(p)/60,(N?"+":"-")+("0000"+(p/60*100+p%60)).slice(-4)},"%Z":p=>p.lb,"%%":()=>"%"},n=n.replace(/%%/g,"\\0\\0");for(he in fe)n.includes(he)&&(n=n.replace(new RegExp(he,"g"),fe[he](l)));return n=n.replace(/\\0\\0/g,"%"),he=Gr(n),he.length>r?0:($r(he,e),he.length-1)}M.Va();var Yr=[qe,st,m,ye,oe,d,k,$,Me,Ze,Rt,It,Bt,kt,Wt,Nt,$t,Yt,zt,qt,Vt,Jt,Xt,Qt],jr={b:function(e,r,n){throw e>>>=0,new t(e).Va(r>>>0,n>>>0),o=e,u++,o},L:function(e){tr(e>>>0,!B,1,!R,131072,!1),M.$a()},j:function(e){e>>>=0,T?postMessage({cmd:"cleanupThread",thread:e}):M.Ya(M.La[e])},H:O,h:ye,S:oe,D:d,F:k,T:$,Q:Me,J:Ze,P:Rt,n:It,E:Bt,B:kt,R:Wt,C:Nt,p:()=>1,z:function(e,r){e>>>=0,e==r>>>0?setTimeout(it):T?postMessage({targetThread:e,cmd:"checkMailbox"}):(e=M.La[e])&&e.postMessage({cmd:"checkMailbox"})},I:function(e,r,n,l,y){r>>>=0,n>>>=0,pt.length=l,y=y>>>0>>>3;for(var b=0;b<l;b++)pt[b]=g()[y+b>>>0];return e=r?Ge[r]:Yr[e],M.eb=n,n=e(...pt),M.eb=0,n},K:dt,o:function(e){D&&M.La[e>>>0].ref()},s:function(e,r,n){e=r+2097152>>>0<4194305-!!e?(e>>>0)+4294967296*r:NaN,n>>>=0,e=new Date(1e3*e),f()[n>>>2>>>0]=e.getUTCSeconds(),f()[n+4>>>2>>>0]=e.getUTCMinutes(),f()[n+8>>>2>>>0]=e.getUTCHours(),f()[n+12>>>2>>>0]=e.getUTCDate(),f()[n+16>>>2>>>0]=e.getUTCMonth(),f()[n+20>>>2>>>0]=e.getUTCFullYear()-1900,f()[n+24>>>2>>>0]=e.getUTCDay(),e=(e.getTime()-Date.UTC(e.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,f()[n+28>>>2>>>0]=e},t:function(e,r,n){e=r+2097152>>>0<4194305-!!e?(e>>>0)+4294967296*r:NaN,n>>>=0,e=new Date(1e3*e),f()[n>>>2>>>0]=e.getSeconds(),f()[n+4>>>2>>>0]=e.getMinutes(),f()[n+8>>>2>>>0]=e.getHours(),f()[n+12>>>2>>>0]=e.getDate(),f()[n+16>>>2>>>0]=e.getMonth(),f()[n+20>>>2>>>0]=e.getFullYear()-1900,f()[n+24>>>2>>>0]=e.getDay(),r=($e(e.getFullYear())?Ht:Gt)[e.getMonth()]+e.getDate()-1|0,f()[n+28>>>2>>>0]=r,f()[n+36>>>2>>>0]=-(60*e.getTimezoneOffset()),r=new Date(e.getFullYear(),6,1).getTimezoneOffset();var l=new Date(e.getFullYear(),0,1).getTimezoneOffset();e=(r!=l&&e.getTimezoneOffset()==Math.min(l,r))|0,f()[n+32>>>2>>>0]=e},u:function(e){e>>>=0;var r=new Date(f()[e+20>>>2>>>0]+1900,f()[e+16>>>2>>>0],f()[e+12>>>2>>>0],f()[e+8>>>2>>>0],f()[e+4>>>2>>>0],f()[e>>>2>>>0],0),n=f()[e+32>>>2>>>0],l=r.getTimezoneOffset(),y=new Date(r.getFullYear(),6,1).getTimezoneOffset(),b=new Date(r.getFullYear(),0,1).getTimezoneOffset(),v=Math.min(b,y);return 0>n?f()[e+32>>>2>>>0]=+(y!=b&&v==l):0<n!=(v==l)&&(y=Math.max(b,y),r.setTime(r.getTime()+6e4*((0<n?v:y)-l))),f()[e+24>>>2>>>0]=r.getDay(),n=($e(r.getFullYear())?Ht:Gt)[r.getMonth()]+r.getDate()-1|0,f()[e+28>>>2>>>0]=n,f()[e>>>2>>>0]=r.getSeconds(),f()[e+4>>>2>>>0]=r.getMinutes(),f()[e+8>>>2>>>0]=r.getHours(),f()[e+12>>>2>>>0]=r.getDate(),f()[e+16>>>2>>>0]=r.getMonth(),f()[e+20>>>2>>>0]=r.getYear(),e=r.getTime(),e=isNaN(e)?-1:e/1e3,ar((Te=e,1<=+Math.abs(Te)?0<Te?+Math.floor(Te/4294967296)>>>0:~~+Math.ceil((Te-+(~~Te>>>0))/4294967296)>>>0:0)),e>>>0},q:$t,r:Yt,y:function(e,r,n,l){e>>>=0,r>>>=0,n>>>=0,l>>>=0;var y=new Date().getFullYear(),b=new Date(y,0,1),v=new Date(y,6,1);y=b.getTimezoneOffset();var z=v.getTimezoneOffset(),Ce=Math.max(y,z);w()[e>>>2>>>0]=60*Ce,f()[r>>>2>>>0]=+(y!=z),e=fe=>fe.toLocaleTimeString(void 0,{hour12:!1,timeZoneName:"short"}).split(" ")[1],b=e(b),v=e(v),z<y?(Re(b,n,17),Re(v,l,17)):(Re(b,l,17),Re(v,n,17))},c:()=>{te("")},O:function(e,r,n){e>>>=0,r>>>=0,n>>>=0,mt.length=0;for(var l;l=h()[r++>>>0];){var y=l!=105;y&=l!=112,n+=y&&n%8?4:0,mt.push(l==112?w()[n>>>2>>>0]:l==105?f()[n>>>2>>>0]:g()[n>>>3>>>0]),n+=y?8:4}return Ge[e](...mt)},k:()=>{},i:()=>Date.now(),U:()=>{throw De+=1,"unwind"},A:function(){return 4294901760},e:()=>performance.timeOrigin+performance.now(),f:()=>D?(br(),et(hr)).cpus().length:navigator.hardwareConcurrency,x:function(e){e>>>=0;var r=h().length;if(e<=r||4294901760<e)return!1;for(var n=1;4>=n;n*=2){var l=r*(1+.2/n);l=Math.min(l,e+100663296);var y=Math;l=Math.max(e,l);e:{y=(y.min.call(y,4294901760,l+(65536-l%65536)%65536)-X.buffer.byteLength+65535)/65536;try{X.grow(y),K();var b=1;break e}catch{}b=void 0}if(b)return!0}return!1},M:zt,N:qt,G:Ve,g:Vt,m:Jt,v:Xt,l:Qt,a:X||s.wasmMemory,w:er,d:function(e,r,n,l){return er(e>>>0,r>>>0,n>>>0,l>>>0)}},C=function(){function e(n,l){return C=n.exports,C=zr(),M.ab.push(C.ya),Xe=C.za,Ue.unshift(C.V),we=l,Be(),C}var r={a:jr};if(Ae++,s.instantiateWasm)try{return s.instantiateWasm(r,e)}catch(n){ne(`Module.instantiateWasm callback failed with error: ${n}`),x(n)}return rt(r,function(n){e(n.instance,n.module)}).catch(x),{}}();s._OrtInit=(e,r)=>(s._OrtInit=C.W)(e,r),s._OrtGetLastError=(e,r)=>(s._OrtGetLastError=C.X)(e,r),s._OrtCreateSessionOptions=(e,r,n,l,y,b,v,z,Ce,fe)=>(s._OrtCreateSessionOptions=C.Y)(e,r,n,l,y,b,v,z,Ce,fe),s._OrtAppendExecutionProvider=(e,r)=>(s._OrtAppendExecutionProvider=C.Z)(e,r),s._OrtAddFreeDimensionOverride=(e,r,n)=>(s._OrtAddFreeDimensionOverride=C._)(e,r,n),s._OrtAddSessionConfigEntry=(e,r,n)=>(s._OrtAddSessionConfigEntry=C.$)(e,r,n),s._OrtReleaseSessionOptions=e=>(s._OrtReleaseSessionOptions=C.aa)(e),s._OrtCreateSession=(e,r,n)=>(s._OrtCreateSession=C.ba)(e,r,n),s._OrtReleaseSession=e=>(s._OrtReleaseSession=C.ca)(e),s._OrtGetInputOutputCount=(e,r,n)=>(s._OrtGetInputOutputCount=C.da)(e,r,n),s._OrtGetInputName=(e,r)=>(s._OrtGetInputName=C.ea)(e,r),s._OrtGetOutputName=(e,r)=>(s._OrtGetOutputName=C.fa)(e,r),s._OrtFree=e=>(s._OrtFree=C.ga)(e),s._OrtCreateTensor=(e,r,n,l,y,b)=>(s._OrtCreateTensor=C.ha)(e,r,n,l,y,b),s._OrtGetTensorData=(e,r,n,l,y)=>(s._OrtGetTensorData=C.ia)(e,r,n,l,y),s._OrtReleaseTensor=e=>(s._OrtReleaseTensor=C.ja)(e),s._OrtCreateRunOptions=(e,r,n,l)=>(s._OrtCreateRunOptions=C.ka)(e,r,n,l),s._OrtAddRunConfigEntry=(e,r,n)=>(s._OrtAddRunConfigEntry=C.la)(e,r,n),s._OrtReleaseRunOptions=e=>(s._OrtReleaseRunOptions=C.ma)(e),s._OrtCreateBinding=e=>(s._OrtCreateBinding=C.na)(e),s._OrtBindInput=(e,r,n)=>(s._OrtBindInput=C.oa)(e,r,n),s._OrtBindOutput=(e,r,n,l)=>(s._OrtBindOutput=C.pa)(e,r,n,l),s._OrtClearBoundOutputs=e=>(s._OrtClearBoundOutputs=C.qa)(e),s._OrtReleaseBinding=e=>(s._OrtReleaseBinding=C.ra)(e),s._OrtRunWithBinding=(e,r,n,l,y)=>(s._OrtRunWithBinding=C.sa)(e,r,n,l,y),s._OrtRun=(e,r,n,l,y,b,v,z)=>(s._OrtRun=C.ta)(e,r,n,l,y,b,v,z),s._OrtEndProfiling=e=>(s._OrtEndProfiling=C.ua)(e);var ut=s._pthread_self=()=>(ut=s._pthread_self=C.va)();s._malloc=e=>(s._malloc=C.wa)(e),s._free=e=>(s._free=C.xa)(e),s.__emscripten_tls_init=()=>(s.__emscripten_tls_init=C.ya)();var tr=s.__emscripten_thread_init=(e,r,n,l,y,b)=>(tr=s.__emscripten_thread_init=C.Aa)(e,r,n,l,y,b);s.__emscripten_thread_crashed=()=>(s.__emscripten_thread_crashed=C.Ba)();var rr=(e,r,n,l,y)=>(rr=C.Ca)(e,r,n,l,y),bt=e=>(bt=C.Da)(e),yt=s.__emscripten_thread_exit=e=>(yt=s.__emscripten_thread_exit=C.Ea)(e),nr=()=>(nr=C.Fa)(),ar=e=>(ar=C.Ga)(e),or=(e,r)=>(or=C.Ha)(e,r),ft=e=>(ft=C.Ia)(e),wt=e=>(wt=C.Ja)(e),Ot=()=>(Ot=C.Ka)();function zr(){var e=C;e=Object.assign({},e);var r=l=>()=>l()>>>0,n=l=>y=>l(y)>>>0;return e.va=r(e.va),e.wa=n(e.wa),e.emscripten_main_runtime_thread_id=r(e.emscripten_main_runtime_thread_id),e.Ja=n(e.Ja),e.Ka=r(e.Ka),e}s.wasmMemory=X,s.stackSave=()=>Ot(),s.stackRestore=e=>ft(e),s.stackAlloc=e=>wt(e),s.keepRuntimeAlive=()=>0<De,s.UTF8ToString=ee,s.stringToUTF8=Re,s.lengthBytesUTF8=se,s.ExitStatus=ke,s.PThread=M;var lt;ge=function e(){lt||sr(),lt||(ge=e)};function sr(){if(!(0<Ae))if(T)S(s),T||Ne(Ue),startWorker(s);else{if(s.preRun)for(typeof s.preRun=="function"&&(s.preRun=[s.preRun]);s.preRun.length;)Oe.unshift(s.preRun.shift());Ne(Oe),0<Ae||lt||(lt=!0,s.calledRun=!0,me||(T||Ne(Ue),S(s),T||Ne(ve)))}}return sr(),H}})();typeof wr=="object"&&typeof Dt=="object"?Dt.exports=yr:typeof define=="function"&&define.amd&&define([],()=>yr)});var vr=Ke((yn,tn)=>{tn.exports=\'"use strict";var Module={},ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads"),parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",e=>onmessage({data:e}));var fs=require("fs"),vm=require("vm");Object.assign(global,{self:global,require,Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:e=>vm.runInThisContext(fs.readFileSync(e,"utf8"),{filename:e}),postMessage:e=>parentPort.postMessage(e),performance:global.performance||{now:Date.now}})}var initializedJS=!1;function threadPrintErr(...e){var a=e.join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,a+`\\n`);return}console.error(a)}function threadAlert(...e){var a=e.join(" ");postMessage({cmd:"alert",text:a,threadId:Module._pthread_self()})}var err=threadPrintErr;self.alert=threadAlert,Module.instantiateWasm=(e,a)=>{var r=Module.wasmModule;Module.wasmModule=null;var t=new WebAssembly.Instance(r,e);return a(t)},self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let r=[];self.onmessage=t=>r.push(t),self.startWorker=t=>{Module=t,postMessage({cmd:"loaded"});for(let s of r)handleMessage(s);self.onmessage=handleMessage},Module.wasmModule=e.data.wasmModule;for(const t of e.data.handlers)Module[t]=(...s)=>{postMessage({cmd:"callHandler",handler:t,args:s})};if(Module.wasmMemory=e.data.wasmMemory,Module.buffer=Module.wasmMemory.buffer,Module.ENVIRONMENT_IS_PTHREAD=!0,typeof e.data.urlOrBlob=="string")importScripts(e.data.urlOrBlob);else{var a=URL.createObjectURL(e.data.urlOrBlob);importScripts(a),URL.revokeObjectURL(a)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module.__emscripten_thread_init(e.data.pthread_ptr,0,0,1),Module.__emscripten_thread_mailbox_await(e.data.pthread_ptr),Module.establishStackSpace(),Module.PThread.receiveObjectTransfer(e.data),Module.PThread.threadInitTLS(),initializedJS||(initializedJS=!0);try{Module.invokeEntryPoint(e.data.start_routine,e.data.arg)}catch(r){if(r!="unwind")throw r}}else e.data.cmd==="cancel"?Module._pthread_self()&&Module.__emscripten_thread_exit(-1):e.data.target==="setimmediate"||(e.data.cmd==="checkMailbox"?initializedJS&&Module.checkMailbox():e.data.cmd&&(err(`worker.js received unknown command ${e.data.cmd}`),err(e.data)))}catch(r){throw Module.__emscripten_thread_crashed?.(),r}}self.onmessage=handleMessage;\\n\'});var Er;Er=pr();var rn=Or(),Ft,Pt=!1,ct=!1,_r=!1,nn=i=>{if(i===1)return!1;if(typeof SharedArrayBuffer>"u")return typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+i+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),!1;typeof process<"u"&&process.versions&&process.versions.node&&console.warn("env.wasm.numThreads is set to "+i+", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios.");try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},an=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},on=(i,c)=>i?c?"ort-wasm-simd-threaded.wasm":"ort-wasm-simd.wasm":c?"ort-wasm-threaded.wasm":"ort-wasm.wasm",Sr=async i=>{if(Pt)return Promise.resolve();if(ct)throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");if(_r)throw new Error("previous call to \'initializeWebAssembly()\' failed.");ct=!0;let c=i.initTimeout,a=i.numThreads,h=i.simd,f=nn(a),w=h&&an(),g=i.wasmPaths,s=typeof g=="string"?g:void 0,S=on(w,f),x=typeof g=="object"?g[S]:void 0,H=!1,A=[];if(c>0&&A.push(new Promise(I=>{setTimeout(()=>{H=!0,I()},c)})),A.push(new Promise((I,V)=>{let R=f?rn:Er,B={locateFile:(D,T)=>f&&D.endsWith(".worker.js")&&typeof Blob<"u"?URL.createObjectURL(new Blob([vr()],{type:"text/javascript"})):D.endsWith(".wasm")?x||(s??T)+S:T+D};if(f)if(B.numThreads=a,typeof Blob>"u")B.mainScriptUrlOrBlob=(void 0)(__dirname,"ort-wasm-threaded.js");else{let D=`var ortWasmThreaded=${R.toString()};`;B.mainScriptUrlOrBlob=new Blob([D],{type:"text/javascript"})}R(B).then(D=>{ct=!1,Pt=!0,Ft=D,I()},D=>{ct=!1,_r=!0,V(D)})})),await Promise.race(A),H)throw new Error(`WebAssembly backend initializing failed due to timeout: ${c}ms`)},Q=()=>{if(Pt&&Ft)return Ft;throw new Error("WebAssembly is not initialized yet.")};var Y=(i,c)=>{let a=Q(),h=a.lengthBytesUTF8(i)+1,f=a._malloc(h);return a.stringToUTF8(i,f,h),c.push(f),f},tt=(i,c,a,h)=>{if(typeof i=="object"&&i!==null){if(a.has(i))throw new Error("Circular reference in options");a.add(i)}Object.entries(i).forEach(([f,w])=>{let g=c?c+f:f;if(typeof w=="object")tt(w,g+".",a,h);else if(typeof w=="string"||typeof w=="number")h(g,w.toString());else if(typeof w=="boolean")h(g,w?"1":"0");else throw new Error(`Can\'t handle extra config type: ${typeof w}`)})},j=i=>{let c=Q(),a=c.stackSave();try{let h=c.stackAlloc(8);c._OrtGetLastError(h,h+4);let f=c.HEAP32[h/4],w=c.HEAPU32[h/4+1],g=w?c.UTF8ToString(w):"";throw new Error(`${i} ERROR_CODE: ${f}, ERROR_MESSAGE: ${g}`)}finally{c.stackRestore(a)}};var Ar=i=>{let c=Q(),a=0,h=[],f=i||{};try{if(i?.logSeverityLevel===void 0)f.logSeverityLevel=2;else if(typeof i.logSeverityLevel!="number"||!Number.isInteger(i.logSeverityLevel)||i.logSeverityLevel<0||i.logSeverityLevel>4)throw new Error(`log serverity level is not valid: ${i.logSeverityLevel}`);if(i?.logVerbosityLevel===void 0)f.logVerbosityLevel=0;else if(typeof i.logVerbosityLevel!="number"||!Number.isInteger(i.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${i.logVerbosityLevel}`);i?.terminate===void 0&&(f.terminate=!1);let w=0;return i?.tag!==void 0&&(w=Y(i.tag,h)),a=c._OrtCreateRunOptions(f.logSeverityLevel,f.logVerbosityLevel,!!f.terminate,w),a===0&&j("Can\'t create run options."),i?.extra!==void 0&&tt(i.extra,"",new WeakSet,(g,s)=>{let S=Y(g,h),x=Y(s,h);c._OrtAddRunConfigEntry(a,S,x)!==0&&j(`Can\'t set a run config entry: ${g} - ${s}.`)}),[a,h]}catch(w){throw a!==0&&c._OrtReleaseRunOptions(a),h.forEach(g=>c._free(g)),w}};var sn=i=>{switch(i){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${i}`)}},un=i=>{switch(i){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${i}`)}},fn=i=>{i.extra||(i.extra={}),i.extra.session||(i.extra.session={});let c=i.extra.session;c.use_ort_model_bytes_directly||(c.use_ort_model_bytes_directly="1"),i.executionProviders&&i.executionProviders.some(a=>(typeof a=="string"?a:a.name)==="webgpu")&&(i.enableMemPattern=!1)},ln=(i,c,a)=>{for(let h of c){let f=typeof h=="string"?h:h.name;switch(f){case"webnn":if(f="WEBNN",typeof h!="string"){let g=h;if(g?.deviceType){let s=Y("deviceType",a),S=Y(g.deviceType,a);Q()._OrtAddSessionConfigEntry(i,s,S)!==0&&j(`Can\'t set a session config entry: \'deviceType\' - ${g.deviceType}.`)}if(g?.numThreads){let s=g.numThreads;(typeof s!="number"||!Number.isInteger(s)||s<0)&&(s=0);let S=Y("numThreads",a),x=Y(s.toString(),a);Q()._OrtAddSessionConfigEntry(i,S,x)!==0&&j(`Can\'t set a session config entry: \'numThreads\' - ${g.numThreads}.`)}if(g?.powerPreference){let s=Y("powerPreference",a),S=Y(g.powerPreference,a);Q()._OrtAddSessionConfigEntry(i,s,S)!==0&&j(`Can\'t set a session config entry: \'powerPreference\' - ${g.powerPreference}.`)}}break;case"webgpu":if(f="JS",typeof h!="string"){let g=h;if(g?.preferredLayout){if(g.preferredLayout!=="NCHW"&&g.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${g.preferredLayout}`);let s=Y("preferredLayout",a),S=Y(g.preferredLayout,a);Q()._OrtAddSessionConfigEntry(i,s,S)!==0&&j(`Can\'t set a session config entry: \'preferredLayout\' - ${g.preferredLayout}.`)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${f}`)}let w=Y(f,a);Q()._OrtAppendExecutionProvider(i,w)!==0&&j(`Can\'t append execution provider: ${f}.`)}},Tr=i=>{let c=Q(),a=0,h=[],f=i||{};fn(f);try{let w=sn(f.graphOptimizationLevel??"all"),g=un(f.executionMode??"sequential"),s=typeof f.logId=="string"?Y(f.logId,h):0,S=f.logSeverityLevel??2;if(!Number.isInteger(S)||S<0||S>4)throw new Error(`log serverity level is not valid: ${S}`);let x=f.logVerbosityLevel??0;if(!Number.isInteger(x)||x<0||x>4)throw new Error(`log verbosity level is not valid: ${x}`);let H=typeof f.optimizedModelFilePath=="string"?Y(f.optimizedModelFilePath,h):0;if(a=c._OrtCreateSessionOptions(w,!!f.enableCpuMemArena,!!f.enableMemPattern,g,!!f.enableProfiling,0,s,S,x,H),a===0&&j("Can\'t create session options."),f.executionProviders&&ln(a,f.executionProviders,h),f.enableGraphCapture!==void 0){if(typeof f.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${f.enableGraphCapture}`);let A=Y("enableGraphCapture",h),I=Y(f.enableGraphCapture.toString(),h);c._OrtAddSessionConfigEntry(a,A,I)!==0&&j(`Can\'t set a session config entry: \'enableGraphCapture\' - ${f.enableGraphCapture}.`)}if(f.freeDimensionOverrides)for(let[A,I]of Object.entries(f.freeDimensionOverrides)){if(typeof A!="string")throw new Error(`free dimension override name must be a string: ${A}`);if(typeof I!="number"||!Number.isInteger(I)||I<0)throw new Error(`free dimension override value must be a non-negative integer: ${I}`);let V=Y(A,h);c._OrtAddFreeDimensionOverride(a,V,I)!==0&&j(`Can\'t set a free dimension override: ${A} - ${I}.`)}return f.extra!==void 0&&tt(f.extra,"",new WeakSet,(A,I)=>{let V=Y(A,h),R=Y(I,h);c._OrtAddSessionConfigEntry(a,V,R)!==0&&j(`Can\'t set a session config entry: ${A} - ${I}.`)}),[a,h]}catch(w){throw a!==0&&c._OrtReleaseSessionOptions(a),h.forEach(g=>c._free(g)),w}};var xt=i=>{switch(i){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;default:throw new Error(`unsupported data type: ${i}`)}},Mr=i=>{switch(i){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";default:throw new Error(`unsupported data type: ${i}`)}},Ut=i=>[void 0,4,1,1,2,2,4,8,void 0,1,2,8,4,8,void 0,void 0,void 0][i],Cr=i=>{switch(i){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${i}`)}},Dr=i=>{switch(i){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${i}`)}},Fr=i=>i==="float32"||i==="float16"||i==="int32"||i==="int64"||i==="uint32"||i==="uint8"||i==="bool",Pr=i=>{switch(i){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;default:throw new Error(`unsupported data location: ${i}`)}};var xr=async i=>{if(typeof i=="string")if(typeof process<"u"&&process.versions&&process.versions.node)try{return new Uint8Array(await(void 0)(i))}catch(c){if(c.code==="ERR_FS_FILE_TOO_LARGE"){let a=(void 0)(i),h=[];for await(let f of a)h.push(f);return new Uint8Array(Buffer.concat(h))}throw c}else{let c=await fetch(i);if(!c.ok)throw new Error(`failed to load external data file: ${i}`);let a=c.headers.get("Content-Length"),h=a?parseInt(a,10):0;if(h<1073741824)return new Uint8Array(await c.arrayBuffer());{if(!c.body)throw new Error(`failed to load external data file: ${i}, no response body.`);let f=c.body.getReader(),w;try{w=new ArrayBuffer(h)}catch(s){if(s instanceof RangeError){let S=Math.ceil(h/65536);w=new WebAssembly.Memory({initial:S,maximum:S}).buffer}else throw s}let g=0;for(;;){let{done:s,value:S}=await f.read();if(s)break;let x=S.byteLength;new Uint8Array(w,g,x).set(S),g+=x}return new Uint8Array(w,0,h)}}else return i instanceof Blob?new Uint8Array(await i.arrayBuffer()):i instanceof Uint8Array?i:new Uint8Array(i)};var cn=(i,c)=>{Q()._OrtInit(i,c)!==0&&j("Can\'t initialize onnxruntime.")},Lr=async i=>{cn(i.wasm.numThreads,Dr(i.logLevel))},Rr=async(i,c)=>{},Ye=new Map,dn=i=>{let c=Q(),a=c.stackSave();try{let h=c.stackAlloc(8);return c._OrtGetInputOutputCount(i,h,h+4)!==0&&j("Can\'t get session input/output count."),[c.HEAP32[h/4],c.HEAP32[h/4+1]]}finally{c.stackRestore(a)}},Lt=i=>{let c=Q(),a=c._malloc(i.byteLength);if(a===0)throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${i.byteLength}.`);return c.HEAPU8.set(i,a),[a,i.byteLength]},Ir=async(i,c)=>{let a,h,f=Q();Array.isArray(i)?[a,h]=i:i.buffer===f.HEAPU8.buffer?[a,h]=[i.byteOffset,i.byteLength]:[a,h]=Lt(i);let w=0,g=0,s=0,S=[],x=[],H=[];try{if([g,S]=Tr(c),c?.externalData&&f.mountExternalData){let L=[];for(let W of c.externalData){let de=typeof W=="string"?W:W.path;L.push(xr(typeof W=="string"?W:W.data).then(pe=>{f.mountExternalData(de,pe)}))}await Promise.all(L)}w=await f._OrtCreateSession(a,h,g),w===0&&j("Can\'t create a session.");let[A,I]=dn(w),V=!!c?.enableGraphCapture,R=[],B=[],D=[];for(let L=0;L<A;L++){let W=f._OrtGetInputName(w,L);W===0&&j("Can\'t get an input name."),x.push(W),R.push(f.UTF8ToString(W))}for(let L=0;L<I;L++){let W=f._OrtGetOutputName(w,L);W===0&&j("Can\'t get an output name."),H.push(W);let de=f.UTF8ToString(W);B.push(de)}let T=null;return Ye.set(w,[w,x,H,T,V,!1]),[w,R,B]}catch(A){throw x.forEach(I=>f._OrtFree(I)),H.forEach(I=>f._OrtFree(I)),s!==0&&f._OrtReleaseBinding(s),w!==0&&f._OrtReleaseSession(w),A}finally{f._free(a),g!==0&&f._OrtReleaseSessionOptions(g),S.forEach(A=>f._free(A)),f.unmountExternalData?.()}},Br=i=>{let c=Q(),a=Ye.get(i);if(!a)throw new Error(`cannot release session. invalid session id: ${i}`);let[h,f,w,g,s]=a;g&&(s&&c._OrtClearBoundOutputs(g.handle),c._OrtReleaseBinding(g.handle)),c.jsepOnReleaseSession?.(i),f.forEach(S=>c._OrtFree(S)),w.forEach(S=>c._OrtFree(S)),c._OrtReleaseSession(h),Ye.delete(i)},Ur=(i,c,a,h,f,w=!1)=>{if(!i){c.push(0);return}let g=Q(),s=i[0],S=i[1],x=i[3],H,A;if(s==="string"&&x==="gpu-buffer")throw new Error("String tensor is not supported on GPU.");if(w&&x!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${f} when enableGraphCapture is true.`);if(x==="gpu-buffer"){let R=i[2].gpuBuffer,B=Ut(xt(s));A=S.reduce((T,L)=>T*L,1)*B;let D=g.jsepRegisterBuffer;if(!D)throw new Error(\'Tensor location "gpu-buffer" is not supported without using WebGPU.\');H=D(h,f,R,A)}else{let R=i[2];if(Array.isArray(R)){A=4*R.length,H=g._malloc(A),a.push(H);let B=H/4;for(let D=0;D<R.length;D++){if(typeof R[D]!="string")throw new TypeError(`tensor data at index ${D} is not a string`);g.HEAPU32[B++]=Y(R[D],a)}}else A=R.byteLength,H=g._malloc(A),a.push(H),g.HEAPU8.set(new Uint8Array(R.buffer,R.byteOffset,A),H)}let I=g.stackSave(),V=g.stackAlloc(4*S.length);try{let R=V/4;S.forEach(D=>g.HEAP32[R++]=D);let B=g._OrtCreateTensor(xt(s),H,A,V,S.length,Pr(x));B===0&&j(`Can\'t create tensor for input/output. session=${h}, index=${f}.`),c.push(B)}finally{g.stackRestore(I)}},kr=async(i,c,a,h,f,w)=>{let g=Q(),s=Ye.get(i);if(!s)throw new Error(`cannot run inference. invalid session id: ${i}`);let S=s[0],x=s[1],H=s[2],A=s[3],I=s[4],V=s[5],R=c.length,B=h.length,D=0,T=[],L=[],W=[],de=[],pe=g.stackSave(),Z=g.stackAlloc(R*4),_=g.stackAlloc(R*4),J=g.stackAlloc(B*4),Pe=g.stackAlloc(B*4);try{[D,T]=Ar(w);for(let F=0;F<R;F++)Ur(a[F],L,de,i,c[F],I);for(let F=0;F<B;F++)Ur(f[F],W,de,i,R+h[F],I);let le=Z/4,Ie=_/4,ne=J/4,X=Pe/4;for(let F=0;F<R;F++)g.HEAPU32[le++]=L[F],g.HEAPU32[Ie++]=x[c[F]];for(let F=0;F<B;F++)g.HEAPU32[ne++]=W[F],g.HEAPU32[X++]=H[h[F]];g.jsepOnRunStart?.(S);let we;we=await g._OrtRun(S,_,Z,R,Pe,B,J,D),we!==0&&j("failed to call OrtRun().");let me=[];for(let F=0;F<B;F++){let ie=g.HEAPU32[J/4+F];if(ie===W[F]){me.push(f[F]);continue}let xe=g.stackSave(),ce=g.stackAlloc(4*4),be=!1,ae,K=0;try{g._OrtGetTensorData(ie,ce,ce+4,ce+8,ce+12)!==0&&j(`Can\'t access output tensor data on index ${F}.`);let Oe=ce/4,Ue=g.HEAPU32[Oe++];K=g.HEAPU32[Oe++];let ve=g.HEAPU32[Oe++],Ae=g.HEAPU32[Oe++],_e=[];for(let te=0;te<Ae;te++)_e.push(g.HEAPU32[ve/4+te]);g._OrtFree(ve);let ge=_e.reduce((te,re)=>te*re,1);ae=Mr(Ue);let Be=A?.outputPreferredLocations[h[F]];if(ae==="string"){if(Be==="gpu-buffer")throw new Error("String tensor is not supported on GPU.");let te=[],re=K/4;for(let ue=0;ue<ge;ue++){let Ee=g.HEAPU32[re++],Se=ue===ge-1?void 0:g.HEAPU32[re]-Ee;te.push(g.UTF8ToString(Ee,Se))}me.push([ae,_e,te,"cpu"])}else if(Be==="gpu-buffer"&&ge>0){let te=g.jsepGetBuffer;if(!te)throw new Error(\'preferredLocation "gpu-buffer" is not supported without using WebGPU.\');let re=te(K),ue=Ut(Ue);if(ue===void 0||!Fr(ae))throw new Error(`Unsupported data type: ${ae}`);be=!0,me.push([ae,_e,{gpuBuffer:re,download:g.jsepCreateDownloader(re,ge*ue,ae),dispose:()=>{g._OrtReleaseTensor(ie)}},"gpu-buffer"])}else{let te=Cr(ae),re=new te(ge);new Uint8Array(re.buffer,re.byteOffset,re.byteLength).set(g.HEAPU8.subarray(K,K+re.byteLength)),me.push([ae,_e,re,"cpu"])}}finally{g.stackRestore(xe),ae==="string"&&K&&g._free(K),be||g._OrtReleaseTensor(ie)}}return A&&!I&&(g._OrtClearBoundOutputs(A.handle),Ye.set(i,[S,x,H,A,I,!1])),me}finally{g.stackRestore(pe),L.forEach(le=>g._OrtReleaseTensor(le)),W.forEach(le=>g._OrtReleaseTensor(le)),de.forEach(le=>g._free(le)),D!==0&&g._OrtReleaseRunOptions(D),T.forEach(le=>g._free(le))}},Wr=i=>{let c=Q(),a=Ye.get(i);if(!a)throw new Error("invalid session id");let h=a[0],f=c._OrtEndProfiling(h);f===0&&j("Can\'t get an profile file name."),c._OrtFree(f)},Nr=i=>{let c=[];for(let a of i){let h=a[2];!Array.isArray(h)&&"buffer"in h&&c.push(h.buffer)}return c};self.onmessage=i=>{let{type:c,in:a}=i.data;try{switch(c){case"init-wasm":Sr(a.wasm).then(()=>{Lr(a).then(()=>{postMessage({type:c})},h=>{postMessage({type:c,err:h})})},h=>{postMessage({type:c,err:h})});break;case"init-ep":{let{epName:h,env:f}=a;Rr(f,h).then(()=>{postMessage({type:c})},w=>{postMessage({type:c,err:w})});break}case"copy-from":{let{buffer:h}=a,f=Lt(h);postMessage({type:c,out:f});break}case"create":{let{model:h,options:f}=a;Ir(h,f).then(w=>{postMessage({type:c,out:w})},w=>{postMessage({type:c,err:w})});break}case"release":Br(a),postMessage({type:c});break;case"run":{let{sessionId:h,inputIndices:f,inputs:w,outputIndices:g,options:s}=a;kr(h,f,w,g,new Array(g.length).fill(null),s).then(S=>{S.some(x=>x[3]!=="cpu")?postMessage({type:c,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:c,out:S},Nr([...w,...S]))},S=>{postMessage({type:c,err:S})});break}case"end-profiling":Wr(a),postMessage({type:c});break;default:}}catch(h){postMessage({type:c,err:h})}};})();\n';
    });
    da = L(() => {
      "use strict";
      Ot();
      rd();
      Ur();
      _r = () => !!Z.wasm.proxy && typeof document < "u", yn = false, Do = false, Lo = false, pa = /* @__PURE__ */ new Map(), Vr = (a, t) => {
        let o = pa.get(a);
        o ? o.push(t) : pa.set(a, [t]);
      }, Wr = () => {
        if (yn || !Do || Lo || !gt) throw new Error("worker not ready");
      }, Tg = (a) => {
        switch (a.data.type) {
          case "init-wasm":
            yn = false, a.data.err ? (Lo = true, ca[1](a.data.err)) : (Do = true, ca[0]());
            break;
          case "init-ep":
          case "copy-from":
          case "create":
          case "release":
          case "run":
          case "end-profiling": {
            let t = pa.get(a.data.type);
            a.data.err ? t.shift()[1](a.data.err) : t.shift()[0](a.data.out);
            break;
          }
          default:
        }
      }, Eo = typeof document < "u" ? document?.currentScript?.src : void 0, od = async () => {
        if (!Do) {
          if (yn) throw new Error("multiple calls to 'initWasm()' detected.");
          if (Lo) throw new Error("previous call to 'initWasm()' failed.");
          if (yn = true, _r()) return Z.wasm.wasmPaths === void 0 && Eo && Eo.indexOf("blob:") !== 0 && (Z.wasm.wasmPaths = Eo.substr(0, +Eo.lastIndexOf("/") + 1)), new Promise((a, t) => {
            gt?.terminate();
            let o = URL.createObjectURL(new Blob([nd()], { type: "text/javascript" }));
            gt = new Worker(o, { name: "ort-wasm-proxy-worker" }), gt.onerror = (r) => t(r), gt.onmessage = Tg, URL.revokeObjectURL(o), ca = [a, t];
            let e = { type: "init-wasm", in: Z };
            gt.postMessage(e);
          });
          try {
            await Mp(Z.wasm), await Xp(Z), Do = true;
          } catch (a) {
            throw Lo = true, a;
          } finally {
            yn = false;
          }
        }
      }, id = async (a) => {
        if (_r()) return Wr(), new Promise((t, o) => {
          Vr("init-ep", [t, o]);
          let e = { type: "init-ep", in: { epName: a, env: Z } };
          gt.postMessage(e);
        });
        await Kp(Z, a);
      }, ad = async (a) => _r() ? (Wr(), new Promise((t, o) => {
        Vr("copy-from", [t, o]);
        let e = { type: "copy-from", in: { buffer: a } };
        gt.postMessage(e, [a.buffer]);
      })) : fa(a), sd = async (a, t) => {
        if (_r()) {
          if (t?.preferredOutputLocation) throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
          return Wr(), new Promise((o, e) => {
            Vr("create", [o, e]);
            let r = { type: "create", in: { model: a, options: { ...t } } }, n = [];
            a instanceof Uint8Array && n.push(a.buffer), gt.postMessage(r, n);
          });
        } else return Jp(a, t);
      }, ud = async (a) => {
        if (_r()) return Wr(), new Promise((t, o) => {
          Vr("release", [t, o]);
          let e = { type: "release", in: a };
          gt.postMessage(e);
        });
        Zp(a);
      }, ld = async (a, t, o, e, r, n) => {
        if (_r()) {
          if (o.some((s) => s[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
          if (r.some((s) => s)) throw new Error("pre-allocated output tensor is not supported for proxy.");
          return Wr(), new Promise((s, i) => {
            Vr("run", [s, i]);
            let u2 = o, l = { type: "run", in: { sessionId: a, inputIndices: t, inputs: u2, outputIndices: e, options: n } };
            gt.postMessage(l, td(u2));
          });
        } else return Qp(a, t, o, e, r, n);
      }, fd = async (a) => {
        if (_r()) return Wr(), new Promise((t, o) => {
          Vr("end-profiling", [t, o]);
          let e = { type: "end-profiling", in: a };
          gt.postMessage(e);
        });
        ed(a);
      };
    });
    pd = L(() => {
      "use strict";
      Ot();
      da();
      ua();
      la();
      cd = (a, t) => {
        switch (a.location) {
          case "cpu":
            return [a.type, a.dims, a.data, "cpu"];
          case "gpu-buffer":
            return [a.type, a.dims, { gpuBuffer: a.gpuBuffer }, "gpu-buffer"];
          default:
            throw new Error(`invalid data location: ${a.location} for ${t()}`);
        }
      }, xg = (a) => {
        switch (a[3]) {
          case "cpu":
            return new Me(a[0], a[2], a[1]);
          case "gpu-buffer": {
            let t = a[0];
            if (!Po(t)) throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);
            let { gpuBuffer: o, download: e, dispose: r } = a[2];
            return Me.fromGpuBuffer(o, { dataType: t, dims: a[1], download: e, dispose: r });
          }
          default:
            throw new Error(`invalid data location: ${a[3]}`);
        }
      }, Co = class {
        async fetchModelAndCopyToWasmMemory(t) {
          return ad(await gn(t));
        }
        async loadModel(t, o) {
          lr();
          let e;
          typeof t == "string" ? typeof process < "u" && process.versions && process.versions.node ? e = await gn(t) : e = await this.fetchModelAndCopyToWasmMemory(t) : e = t, [this.sessionId, this.inputNames, this.outputNames] = await sd(e, o), fr();
        }
        async dispose() {
          return ud(this.sessionId);
        }
        async run(t, o, e) {
          lr();
          let r = [], n = [];
          Object.entries(t).forEach((d) => {
            let T = d[0], w = d[1], v = this.inputNames.indexOf(T);
            if (v === -1) throw new Error(`invalid input '${T}'`);
            r.push(w), n.push(v);
          });
          let s = [], i = [];
          Object.entries(o).forEach((d) => {
            let T = d[0], w = d[1], v = this.outputNames.indexOf(T);
            if (v === -1) throw new Error(`invalid output '${T}'`);
            s.push(w), i.push(v);
          });
          let u2 = r.map((d, T) => cd(d, () => `input "${this.inputNames[n[T]]}"`)), l = s.map((d, T) => d ? cd(d, () => `output "${this.outputNames[i[T]]}"`) : null), c2 = await ld(this.sessionId, n, u2, i, l, e), p2 = {};
          for (let d = 0; d < c2.length; d++) p2[this.outputNames[i[d]]] = s[d] ?? xg(c2[d]);
          return fr(), p2;
        }
        startProfiling() {
        }
        endProfiling() {
          fd(this.sessionId);
        }
      };
    });
    dd = L(() => {
      "use strict";
      Ot();
      da();
      pd();
      wg = () => {
        if ((typeof Z.wasm.initTimeout != "number" || Z.wasm.initTimeout < 0) && (Z.wasm.initTimeout = 0), typeof Z.wasm.simd != "boolean" && (Z.wasm.simd = true), typeof Z.wasm.proxy != "boolean" && (Z.wasm.proxy = false), typeof Z.wasm.trace != "boolean" && (Z.wasm.trace = false), typeof Z.wasm.numThreads != "number" || !Number.isInteger(Z.wasm.numThreads) || Z.wasm.numThreads <= 0) {
          (typeof self < "u" && !self.crossOriginIsolated || typeof process < "u" && process.versions && process.versions.node) && (Z.wasm.numThreads = 1);
          let a = typeof navigator > "u" ? (void 0)().length : navigator.hardwareConcurrency;
          Z.wasm.numThreads = Math.min(4, Math.ceil((a || 1) / 2));
        }
      }, Fo = class {
        async init(t) {
          wg(), await od(), await id(t);
        }
        async createInferenceSessionHandler(t, o) {
          let e = new Co();
          return await e.loadModel(t, o), Promise.resolve(e);
        }
      };
    });
    hd = {};
    Sr(hd, { wasmBackend: () => vg });
    md = L(() => {
      "use strict";
      dd();
      vg = new Fo();
    });
    Ot();
    Ot();
    Ot();
    Ts = "1.18.0";
    jO = qo;
    {
      let a = (Op(), ar(_p)).onnxjsBackend;
      Pr("webgl", a, -10);
    }
    {
      let a = (md(), ar(hd)).wasmBackend;
      Pr("cpu", a, 10), Pr("wasm", a, 10);
    }
    Object.defineProperty(Z.versions, "web", { value: Ts, enumerable: true });
  }
});

// node_modules/@diffusionstudio/vits-web/dist/vits-web.js
var u = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main";
var B2 = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/";
var x = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize";
var c = {
  "ar_JO-kareem-low": "ar/ar_JO/kareem/low/ar_JO-kareem-low.onnx",
  "ar_JO-kareem-medium": "ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx",
  "ca_ES-upc_ona-medium": "ca/ca_ES/upc_ona/medium/ca_ES-upc_ona-medium.onnx",
  "ca_ES-upc_ona-x_low": "ca/ca_ES/upc_ona/x_low/ca_ES-upc_ona-x_low.onnx",
  "ca_ES-upc_pau-x_low": "ca/ca_ES/upc_pau/x_low/ca_ES-upc_pau-x_low.onnx",
  "cs_CZ-jirka-low": "cs/cs_CZ/jirka/low/cs_CZ-jirka-low.onnx",
  "cs_CZ-jirka-medium": "cs/cs_CZ/jirka/medium/cs_CZ-jirka-medium.onnx",
  "da_DK-talesyntese-medium": "da/da_DK/talesyntese/medium/da_DK-talesyntese-medium.onnx",
  "de_DE-eva_k-x_low": "de/de_DE/eva_k/x_low/de_DE-eva_k-x_low.onnx",
  "de_DE-karlsson-low": "de/de_DE/karlsson/low/de_DE-karlsson-low.onnx",
  "de_DE-kerstin-low": "de/de_DE/kerstin/low/de_DE-kerstin-low.onnx",
  "de_DE-mls-medium": "de/de_DE/mls/medium/de_DE-mls-medium.onnx",
  "de_DE-pavoque-low": "de/de_DE/pavoque/low/de_DE-pavoque-low.onnx",
  "de_DE-ramona-low": "de/de_DE/ramona/low/de_DE-ramona-low.onnx",
  "de_DE-thorsten-high": "de/de_DE/thorsten/high/de_DE-thorsten-high.onnx",
  "de_DE-thorsten-low": "de/de_DE/thorsten/low/de_DE-thorsten-low.onnx",
  "de_DE-thorsten-medium": "de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx",
  "de_DE-thorsten_emotional-medium": "de/de_DE/thorsten_emotional/medium/de_DE-thorsten_emotional-medium.onnx",
  "el_GR-rapunzelina-low": "el/el_GR/rapunzelina/low/el_GR-rapunzelina-low.onnx",
  "en_GB-alan-low": "en/en_GB/alan/low/en_GB-alan-low.onnx",
  "en_GB-alan-medium": "en/en_GB/alan/medium/en_GB-alan-medium.onnx",
  "en_GB-alba-medium": "en/en_GB/alba/medium/en_GB-alba-medium.onnx",
  "en_GB-aru-medium": "en/en_GB/aru/medium/en_GB-aru-medium.onnx",
  "en_GB-cori-high": "en/en_GB/cori/high/en_GB-cori-high.onnx",
  "en_GB-cori-medium": "en/en_GB/cori/medium/en_GB-cori-medium.onnx",
  "en_GB-jenny_dioco-medium": "en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx",
  "en_GB-northern_english_male-medium": "en/en_GB/northern_english_male/medium/en_GB-northern_english_male-medium.onnx",
  "en_GB-semaine-medium": "en/en_GB/semaine/medium/en_GB-semaine-medium.onnx",
  "en_GB-southern_english_female-low": "en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx",
  "en_GB-vctk-medium": "en/en_GB/vctk/medium/en_GB-vctk-medium.onnx",
  "en_US-amy-low": "en/en_US/amy/low/en_US-amy-low.onnx",
  "en_US-amy-medium": "en/en_US/amy/medium/en_US-amy-medium.onnx",
  "en_US-arctic-medium": "en/en_US/arctic/medium/en_US-arctic-medium.onnx",
  "en_US-danny-low": "en/en_US/danny/low/en_US-danny-low.onnx",
  "en_US-hfc_female-medium": "en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx",
  "en_US-hfc_male-medium": "en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx",
  "en_US-joe-medium": "en/en_US/joe/medium/en_US-joe-medium.onnx",
  "en_US-kathleen-low": "en/en_US/kathleen/low/en_US-kathleen-low.onnx",
  "en_US-kristin-medium": "en/en_US/kristin/medium/en_US-kristin-medium.onnx",
  "en_US-kusal-medium": "en/en_US/kusal/medium/en_US-kusal-medium.onnx",
  "en_US-l2arctic-medium": "en/en_US/l2arctic/medium/en_US-l2arctic-medium.onnx",
  "en_US-lessac-high": "en/en_US/lessac/high/en_US-lessac-high.onnx",
  "en_US-lessac-low": "en/en_US/lessac/low/en_US-lessac-low.onnx",
  "en_US-lessac-medium": "en/en_US/lessac/medium/en_US-lessac-medium.onnx",
  "en_US-libritts-high": "en/en_US/libritts/high/en_US-libritts-high.onnx",
  "en_US-libritts_r-medium": "en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx",
  "en_US-ljspeech-high": "en/en_US/ljspeech/high/en_US-ljspeech-high.onnx",
  "en_US-ljspeech-medium": "en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx",
  "en_US-ryan-high": "en/en_US/ryan/high/en_US-ryan-high.onnx",
  "en_US-ryan-low": "en/en_US/ryan/low/en_US-ryan-low.onnx",
  "en_US-ryan-medium": "en/en_US/ryan/medium/en_US-ryan-medium.onnx",
  "es_ES-carlfm-x_low": "es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx",
  "es_ES-davefx-medium": "es/es_ES/davefx/medium/es_ES-davefx-medium.onnx",
  "es_ES-mls_10246-low": "es/es_ES/mls_10246/low/es_ES-mls_10246-low.onnx",
  "es_ES-mls_9972-low": "es/es_ES/mls_9972/low/es_ES-mls_9972-low.onnx",
  "es_ES-sharvard-medium": "es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx",
  "es_MX-ald-medium": "es/es_MX/ald/medium/es_MX-ald-medium.onnx",
  "es_MX-claude-high": "es/es_MX/claude/high/es_MX-claude-high.onnx",
  "fa_IR-amir-medium": "fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx",
  "fa_IR-gyro-medium": "fa/fa_IR/gyro/medium/fa_IR-gyro-medium.onnx",
  "fi_FI-harri-low": "fi/fi_FI/harri/low/fi_FI-harri-low.onnx",
  "fi_FI-harri-medium": "fi/fi_FI/harri/medium/fi_FI-harri-medium.onnx",
  "fr_FR-gilles-low": "fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx",
  "fr_FR-mls-medium": "fr/fr_FR/mls/medium/fr_FR-mls-medium.onnx",
  "fr_FR-mls_1840-low": "fr/fr_FR/mls_1840/low/fr_FR-mls_1840-low.onnx",
  "fr_FR-siwis-low": "fr/fr_FR/siwis/low/fr_FR-siwis-low.onnx",
  "fr_FR-siwis-medium": "fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx",
  "fr_FR-tom-medium": "fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx",
  "fr_FR-upmc-medium": "fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx",
  "hu_HU-anna-medium": "hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx",
  "hu_HU-berta-medium": "hu/hu_HU/berta/medium/hu_HU-berta-medium.onnx",
  "hu_HU-imre-medium": "hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx",
  "is_IS-bui-medium": "is/is_IS/bui/medium/is_IS-bui-medium.onnx",
  "is_IS-salka-medium": "is/is_IS/salka/medium/is_IS-salka-medium.onnx",
  "is_IS-steinn-medium": "is/is_IS/steinn/medium/is_IS-steinn-medium.onnx",
  "is_IS-ugla-medium": "is/is_IS/ugla/medium/is_IS-ugla-medium.onnx",
  "it_IT-riccardo-x_low": "it/it_IT/riccardo/x_low/it_IT-riccardo-x_low.onnx",
  "ka_GE-natia-medium": "ka/ka_GE/natia/medium/ka_GE-natia-medium.onnx",
  "kk_KZ-iseke-x_low": "kk/kk_KZ/iseke/x_low/kk_KZ-iseke-x_low.onnx",
  "kk_KZ-issai-high": "kk/kk_KZ/issai/high/kk_KZ-issai-high.onnx",
  "kk_KZ-raya-x_low": "kk/kk_KZ/raya/x_low/kk_KZ-raya-x_low.onnx",
  "lb_LU-marylux-medium": "lb/lb_LU/marylux/medium/lb_LU-marylux-medium.onnx",
  "ne_NP-google-medium": "ne/ne_NP/google/medium/ne_NP-google-medium.onnx",
  "ne_NP-google-x_low": "ne/ne_NP/google/x_low/ne_NP-google-x_low.onnx",
  "nl_BE-nathalie-medium": "nl/nl_BE/nathalie/medium/nl_BE-nathalie-medium.onnx",
  "nl_BE-nathalie-x_low": "nl/nl_BE/nathalie/x_low/nl_BE-nathalie-x_low.onnx",
  "nl_BE-rdh-medium": "nl/nl_BE/rdh/medium/nl_BE-rdh-medium.onnx",
  "nl_BE-rdh-x_low": "nl/nl_BE/rdh/x_low/nl_BE-rdh-x_low.onnx",
  "nl_NL-mls-medium": "nl/nl_NL/mls/medium/nl_NL-mls-medium.onnx",
  "nl_NL-mls_5809-low": "nl/nl_NL/mls_5809/low/nl_NL-mls_5809-low.onnx",
  "nl_NL-mls_7432-low": "nl/nl_NL/mls_7432/low/nl_NL-mls_7432-low.onnx",
  "no_NO-talesyntese-medium": "no/no_NO/talesyntese/medium/no_NO-talesyntese-medium.onnx",
  "pl_PL-darkman-medium": "pl/pl_PL/darkman/medium/pl_PL-darkman-medium.onnx",
  "pl_PL-gosia-medium": "pl/pl_PL/gosia/medium/pl_PL-gosia-medium.onnx",
  "pl_PL-mc_speech-medium": "pl/pl_PL/mc_speech/medium/pl_PL-mc_speech-medium.onnx",
  "pl_PL-mls_6892-low": "pl/pl_PL/mls_6892/low/pl_PL-mls_6892-low.onnx",
  "pt_BR-edresson-low": "pt/pt_BR/edresson/low/pt_BR-edresson-low.onnx",
  "pt_BR-faber-medium": "pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx",
  "pt_PT-tug\xE3o-medium": "pt/pt_PT/tug\xE3o/medium/pt_PT-tug\xE3o-medium.onnx",
  "ro_RO-mihai-medium": "ro/ro_RO/mihai/medium/ro_RO-mihai-medium.onnx",
  "ru_RU-denis-medium": "ru/ru_RU/denis/medium/ru_RU-denis-medium.onnx",
  "ru_RU-dmitri-medium": "ru/ru_RU/dmitri/medium/ru_RU-dmitri-medium.onnx",
  "ru_RU-irina-medium": "ru/ru_RU/irina/medium/ru_RU-irina-medium.onnx",
  "ru_RU-ruslan-medium": "ru/ru_RU/ruslan/medium/ru_RU-ruslan-medium.onnx",
  "sk_SK-lili-medium": "sk/sk_SK/lili/medium/sk_SK-lili-medium.onnx",
  "sl_SI-artur-medium": "sl/sl_SI/artur/medium/sl_SI-artur-medium.onnx",
  "sr_RS-serbski_institut-medium": "sr/sr_RS/serbski_institut/medium/sr_RS-serbski_institut-medium.onnx",
  "sv_SE-nst-medium": "sv/sv_SE/nst/medium/sv_SE-nst-medium.onnx",
  "sw_CD-lanfrica-medium": "sw/sw_CD/lanfrica/medium/sw_CD-lanfrica-medium.onnx",
  "tr_TR-dfki-medium": "tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx",
  "tr_TR-fahrettin-medium": "tr/tr_TR/fahrettin/medium/tr_TR-fahrettin-medium.onnx",
  "tr_TR-fettah-medium": "tr/tr_TR/fettah/medium/tr_TR-fettah-medium.onnx",
  "uk_UA-lada-x_low": "uk/uk_UA/lada/x_low/uk_UA-lada-x_low.onnx",
  "uk_UA-ukrainian_tts-medium": "uk/uk_UA/ukrainian_tts/medium/uk_UA-ukrainian_tts-medium.onnx",
  "vi_VN-25hours_single-low": "vi/vi_VN/25hours_single/low/vi_VN-25hours_single-low.onnx",
  "vi_VN-vais1000-medium": "vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx",
  "vi_VN-vivos-x_low": "vi/vi_VN/vivos/x_low/vi_VN-vivos-x_low.onnx",
  "zh_CN-huayan-medium": "zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx",
  "zh_CN-huayan-x_low": "zh/zh_CN/huayan/x_low/zh_CN-huayan-x_low.onnx"
};
async function p(e, m) {
  if (e.match("https://huggingface.co"))
    try {
      const o = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper", {
        create: true
      }), a = e.split("/").at(-1), t = await (await o.getFileHandle(a, { create: true })).createWritable();
      await t.write(m), await t.close();
    } catch (n) {
      console.error(n);
    }
}
async function R2(e) {
  try {
    const n = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper"), o = e.split("/").at(-1);
    await (await n.getFileHandle(o)).remove();
  } catch (m) {
    console.error(m);
  }
}
async function D(e) {
  if (e.match("https://huggingface.co"))
    try {
      const n = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper", {
        create: true
      }), o = e.split("/").at(-1);
      return await (await n.getFileHandle(o)).getFile();
    } catch {
      return;
    }
}
async function S(e, m) {
  var r;
  const n = await fetch(e), o = (r = n.body) == null ? void 0 : r.getReader(), a = +(n.headers.get("Content-Length") ?? 0);
  let i = 0, t = [];
  for (; o; ) {
    const { done: s, value: d } = await o.read();
    if (s)
      break;
    t.push(d), i += d.length, m == null || m({
      url: e,
      total: a,
      loaded: i
    });
  }
  return new Blob(t, { type: n.headers.get("Content-Type") ?? void 0 });
}
function b(e, m, n) {
  const o = e.length, a = 44, i = new DataView(new ArrayBuffer(o * m * 2 + a));
  i.setUint32(0, 1179011410, true), i.setUint32(4, i.buffer.byteLength - 8, true), i.setUint32(8, 1163280727, true), i.setUint32(12, 544501094, true), i.setUint32(16, 16, true), i.setUint16(20, 1, true), i.setUint16(22, m, true), i.setUint32(24, n, true), i.setUint32(28, m * 2 * n, true), i.setUint16(32, m * 2, true), i.setUint16(34, 16, true), i.setUint32(36, 1635017060, true), i.setUint32(40, 2 * o, true);
  let t = a;
  for (let r = 0; r < o; r++) {
    const s = e[r];
    s >= 1 ? i.setInt16(t, 32767, true) : s <= -1 ? i.setInt16(t, -32768, true) : i.setInt16(t, s * 32768 | 0, true), t += 2;
  }
  return i.buffer;
}
var h;
var _2;
async function N(e, m) {
  h = h ?? await Promise.resolve().then(() => (init_piper_DeOu3H9E(), piper_DeOu3H9E_exports)), _2 = _2 ?? await Promise.resolve().then(() => (init_ort_min(), ort_min_exports));
  const n = c[e.voiceId], o = JSON.stringify([{ text: e.text.trim() }]);
  _2.env.allowLocalModels = false, _2.env.wasm.numThreads = navigator.hardwareConcurrency, _2.env.wasm.wasmPaths = B2;
  const a = await f(`${u}/${n}.json`), i = JSON.parse(await a.text()), t = await new Promise(async (v) => {
    (await h.createPiperPhonemize({
      print: (l) => {
        v(JSON.parse(l).phoneme_ids);
      },
      printErr: (l) => {
        throw new Error(l);
      },
      locateFile: (l) => l.endsWith(".wasm") ? `${x}.wasm` : l.endsWith(".data") ? `${x}.data` : l
    })).callMain([
      "-l",
      i.espeak.voice,
      "--input",
      o,
      "--espeak_data",
      "/espeak-ng-data"
    ]);
  }), r = 0, s = i.audio.sample_rate, d = i.inference.noise_scale, g = i.inference.length_scale, U2 = i.inference.noise_w, k = await f(`${u}/${n}`, m), y = await _2.InferenceSession.create(await k.arrayBuffer()), w = {
    input: new _2.Tensor("int64", t, [1, t.length]),
    input_lengths: new _2.Tensor("int64", [t.length]),
    scales: new _2.Tensor("float32", [d, g, U2])
  };
  Object.keys(i.speaker_id_map).length && Object.assign(w, { sid: new _2.Tensor("int64", [r]) });
  const {
    output: { data: E }
  } = await y.run(w);
  return new Blob([b(E, 1, s)], { type: "audio/x-wav" });
}
async function f(e, m) {
  let n = await D(e);
  return n || (n = await S(e, m), await p(e, n)), n;
}
async function I(e, m) {
  const n = c[e], o = [`${u}/${n}`, `${u}/${n}.json`];
  await Promise.all(
    o.map(async (a) => {
      p(a, await S(a, a.endsWith(".onnx") ? m : void 0));
    })
  );
}
async function F(e) {
  const m = c[e], n = [`${u}/${m}`, `${u}/${m}.json`];
  await Promise.all(n.map((o) => R2(o)));
}
async function L2() {
  const m = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper", {
    create: true
  }), n = [];
  for await (const o of m.keys()) {
    const a = o.split(".")[0];
    o.endsWith(".onnx") && a in c && n.push(a);
  }
  return n;
}
async function j() {
  try {
    await (await (await navigator.storage.getDirectory()).getDirectoryHandle("piper")).remove({ recursive: true });
  } catch (e) {
    console.error(e);
  }
}
async function P() {
  const e = await fetch(`${u}/voices.json`);
  if (!e.ok)
    throw new Error("Could not retrieve voices file from huggingface");
  return Object.values(await e.json());
}
export {
  u as HF_BASE,
  B2 as ONNX_BASE,
  c as PATH_MAP,
  x as WASM_BASE,
  I as download,
  j as flush,
  N as predict,
  F as remove,
  L2 as stored,
  P as voices
};
/*! Bundled license information:

onnxruntime-web/dist/esm/ort.min.js:
  (*!
   * ONNX Runtime Web v1.18.0
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
  (*! Bundled license information:
  
  long/index.js:
    (**
     * @license
     * Copyright 2009 The Closure Library Authors
     * Copyright 2020 Daniel Wirtz / The long.js Authors.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * SPDX-License-Identifier: Apache-2.0
     *)
  *)
*/
