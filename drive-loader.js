(function () {
  var files = window.DRIVE_FILES || {};
  var lower = {};
  Object.keys(files).forEach(function (k) { lower[k.toLowerCase()] = files[k]; });

  var byUrl = {};
  var IMG = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;

  function imageUrl(id) { return "https://lh3.googleusercontent.com/d/" + id; }
  function fileUrl(id) { return "https://drive.usercontent.google.com/download?id=" + id + "&export=download&confirm=t"; }

  function resolve(v) {
    if (typeof v !== "string" || v.indexOf("assets/") !== 0) return v;
    var key = v;
    try { key = decodeURIComponent(v); } catch (e) {}
    var id = lower[key.toLowerCase()];
    if (!id) return v;
    var url = IMG.test(key) ? imageUrl(id) : fileUrl(id);
    byUrl[url] = id;
    return url;
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

  document.addEventListener("error", function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    var tag = el.tagName;
    if (tag !== "IMG" && tag !== "VIDEO" && tag !== "AUDIO") return;
    if (!el._did) el._did = byUrl[el.src];
    var id = el._did;
    if (!id) return;
    el._dtry = (el._dtry || 0) + 1;

    if (tag === "IMG") {
      if (el._dtry === 1) el.src = "https://drive.google.com/thumbnail?id=" + id + "&sz=w2000";
      else if (el._dtry === 2) el.src = "https://drive.google.com/uc?export=view&id=" + id;
      return;
    }
    if (el._dtry === 1) {
      el.src = "https://drive.google.com/uc?export=download&id=" + id + "&confirm=t";
      return;
    }
    if (tag === "VIDEO" && el.controls && el._dtry === 2 && el.parentNode) {
      var f = document.createElement("iframe");
      f.src = "https://drive.google.com/file/d/" + id + "/preview";
      f.allow = "autoplay; fullscreen";
      f.allowFullscreen = true;
      f.style.cssText = "width:min(92vw,900px);height:min(70vh,520px);border:0;border-radius:12px;background:#000";
      el.parentNode.replaceChild(f, el);
    }
  }, true);
})();
