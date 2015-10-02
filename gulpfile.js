/* jshint node: true */
'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');
var run = require('gulp-run');
var notifier = require('node-notifier');

gulp.task('watch', function() {
  gulp.start('watch:test');
});

gulp.task('watch:test', function() {
  var filePaths = ['src/**/*.js', 'test/**/*.js'];

  return gulp.src(filePaths)
    .pipe(watch(filePaths))
    .on('change', test);

    function test(file) {
      console.log(`File ${file} was changed.`.blue);

      gulp.start('test');
    }
});

gulp.task('test', function() {

  var cmd = new run.Command('npm test');
  cmd.exec('', function(err) {
    var msg = err || 'Pass!';

    notifier.notify({
      'title': 'Unit test',
      'message': msg
    });
  });
});
