(function () {
  var files = window.DRIVE_FILES || {};
  var lower = {};
  Object.keys(files).forEach(function (k) { lower[k.toLowerCase()] = files[k]; });

  function driveUrl(id) {
    return "https://drive.usercontent.google.com/download?id=" + id + "&export=download";
  }

  function resolve(v) {
    if (typeof v !== "string" || v.indexOf("assets/") !== 0) return v;
    var key = v;
    try { key = decodeURIComponent(v); } catch (e) {}
    var id = lower[key.toLowerCase()];
    return id ? driveUrl(id) : v;
  }

  function walk(o) {
    if (!o || typeof o !== "object") return;
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === "string") o[k] = resolve(v);
      else walk(v);
    });
  }

  if (typeof CONFIG !== "undefined") walk(CONFIG);
})();
