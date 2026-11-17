function buildMap() {
  var root = DriveApp.getFolderById('1jMzqb8Zw_HdWJJGAKomTLVaqtI_gLai2');
  var map = {};
  (function walk(folder, prefix) {
    var files = folder.getFiles();
    while (files.hasNext()) {
      var f = files.next();
      map[prefix + f.getName()] = f.getId();
    }
    var subs = folder.getFolders();
    while (subs.hasNext()) {
      var s = subs.next();
      walk(s, prefix + s.getName() + '/');
    }
  })(root, 'assets/');
  var out = 'window.DRIVE_FILES = ' + JSON.stringify(map, null, 1) + ';\n';
  DriveApp.createFile('drive-files.js', out);
  Logger.log(Object.keys(map).length + ' files mapped. drive-files.js was created in My Drive.');
}
