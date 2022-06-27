var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var moment = require('moment');

function createDirIfNotExist(dir_path) {
  if (!fs.existsSync(dir_path)) {
      fs.mkdirSync(dir_path,{recursive:true});
  }
}

router.get('/view', function (req, res, next) {
  // 显示服务器文件 
  // 文件目录
  var filePath = path.join(__dirname, '../public/download');
  createDirIfNotExist(filePath)
  fs.readdir(filePath, function (err, results) {
    if (err) {
      res.end(err.toString());
    } else if (results && results.length > 0) {
      var files = [];
      results.forEach(function (file) {
        if (fs.statSync(path.join(filePath, file)).isFile()) {
          var ctime = moment(fs.statSync(path.join(filePath, file)).ctime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
          var kbsize = (fs.statSync(path.join(filePath, file)).size / 1024).toFixed(2)
          files.push({
            filename: file,
            ctime,
            kbsize
          });
        }
      })
      res.render('files', { files: files });
    } else {
      res.render('files', { files: [] });
    }
  });
});

router.get('/download/:fileName', function (req, res, next) {
  // 实现文件下载 
  var fileName = req.params.fileName;
  var filePathOut = path.join(__dirname, '../public/download');
  var filePath = path.join(filePathOut, fileName);
  var stats = fs.statSync(filePath);
  if (stats.isFile()) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename=' + fileName,
      'Content-Length': stats.size
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.end(404);
  }
});

module.exports = router;