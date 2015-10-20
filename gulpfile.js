var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence');

// Minify, Uglify and Clone JS & CSS files
gulp.task('useref', function(){
  var assets = useref.assets();

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(gulpIf('*.css', minifyCSS())) // Minifies only if it's a CSS file
    .pipe(gulpIf('*.js', uglify())) // uglifies only javascript files
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist/'));
});

// Clone images directory
gulp.task('images', function(){
  return gulp.src('app/images/**/*')
  .pipe(gulp.dest('dist/images'));
});

gulp.task('clean', function() {
  del('dist');
});

gulp.task('build', function (callback) {
  runSequence('clean', 'useref', 'images', callback );
});
