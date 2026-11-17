(function () {
  var files = window.DRIVE_FILES || {};
  var lower = {};
  Object.keys(files).forEach(function (k) { lower[k.toLowerCase()] = files[k]; });

  var byUrl = {};
  var IMG = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
  var AUDIO = /\.(mp3|m4a|wav|ogg|opus|aac)$/i;

  function imageUrl(id) { return "https://lh3.googleusercontent.com/d/" + id; }
  function videoUrl(id) { return "https://drive.usercontent.google.com/download?id=" + id + "&export=download&confirm=t"; }
  function thumbUrl(id, w) { return "https://drive.google.com/thumbnail?id=" + id + "&sz=w" + (w || 640); }

  function resolve(v) {
    if (typeof v !== "string" || v.indexOf("assets/") !== 0) return v;
    var key = v;
    try { key = decodeURIComponent(v); } catch (e) {}
    if (AUDIO.test(key)) return v;
    var id = lower[key.toLowerCase()];
    if (!id) return v;
    var url = IMG.test(key) ? imageUrl(id) : videoUrl(id);
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

  var played = [];
  var origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (this.tagName === "AUDIO" && played.indexOf(this) < 0) played.push(this);
    return origPlay.apply(this, arguments);
  };

  function pauseMusic() {
    played.forEach(function (a) { try { a.pause(); } catch (e) {} });
  }

  function handleVideo(v) {
    var src = v.getAttribute("src") || v.src;
    var id = byUrl[src];
    if (!id) return;
    if (v.controls && v.parentNode) {
      var f = document.createElement("iframe");
      f.src = "https://drive.google.com/file/d/" + id + "/preview";
      f.allow = "autoplay; fullscreen";
      f.allowFullscreen = true;
      f.style.cssText = "width:min(92vw,900px);height:min(70vh,520px);border:0;border-radius:12px;background:#000";
      v.parentNode.replaceChild(f, v);
      pauseMusic();
    } else {
      v.poster = thumbUrl(id, 640);
      v.removeAttribute("src");
      v.preload = "none";
    }
  }

  function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.tagName === "VIDEO") { handleVideo(node); return; }
    if (node.querySelectorAll) Array.prototype.forEach.call(node.querySelectorAll("video"), handleVideo);
  }

  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      Array.prototype.forEach.call(m.addedNodes, scan);
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener("error", function (e) {
    var el = e.target;
    if (!el || el.tagName !== "IMG") return;
    if (!el._did) el._did = byUrl[el.src];
    var id = el._did;
    if (!id) return;
    el._dtry = (el._dtry || 0) + 1;
    if (el._dtry === 1) el.src = thumbUrl(id, 2000);
    else if (el._dtry === 2) el.src = "https://drive.google.com/uc?export=view&id=" + id;
  }, true);
})();
