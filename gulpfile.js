var gulp = require('gulp');
var riot = require('gulp-riot');
var browserify = require('gulp-browserify');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var path = require('path');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');

var BUILD_DEST = './www';

gulp.task('riot', function () {
  return gulp.src('src/**/*.tag.html')
      .pipe(riot())
      .pipe(gulp.dest('./src/js'));
});

gulp.task('browserify', ['riot'], function () {
  return gulp.src('src/js/main.js')
    .pipe(browserify({
      insertGlobalVars: {
        riot: function(file, dir) {
          return 'require("riot")';
        }
      }
    }))
    .pipe(gulp.dest(path.join(BUILD_DEST, 'js')));
});

gulp.task('minify-css', function() {
  return gulp.src([
      'src/css/reset.css',
      'src/css/material.min.css',
      'src/css/material-icons.css',
      'src/css/style.css'
    ])
    .pipe(concat('bundle.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.join(BUILD_DEST, 'css')));
});

gulp.task('minify-html', function() {
  return gulp.src('src/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(BUILD_DEST));
});

gulp.task('dist', ['build'], function () {
  return gulp.src('src/js/main.js')
    .pipe(browserify({
      insertGlobalVars: {
        riot: function(file, dir) {
          return 'require("riot")';
        }
      }
    }))
    .pipe(uglify({
      mangle: false
    }).on('error', function(e){
      console.log(e);
    }))
    .pipe(gulp.dest(path.join(BUILD_DEST, 'js')));
});

gulp.task('build', ['minify-html', 'minify-css', 'browserify'], function () {
  return gulp.src([
    'src/**/*',
    '!src/**/*.{css,js,html}'
  ])
  .pipe(gulp.dest(BUILD_DEST));
});

gulp.task('watch', ['build'], function () {
  return gulp.watch([
    'src/**/*',
    '!src/js/tags',
    '!src/js/tags/**/*',
  ], ['build'], function () {
    console.log("BUILD");
  });
});
