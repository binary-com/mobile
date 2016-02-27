var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var file = require('gulp-file');
var ghPages = require('gulp-gh-pages');
var sass = require('gulp-sass');
var minify = require('gulp-uglify');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var del = require('del');
var vinylPaths = require('vinyl-paths');


var files = {
  static: ['../www/i18n/**/*', '../www/templates/**/*', '../www/img/**/*', '../www/fonts/**/*'],
  lib: ['../www/lib/**/*.min.js', '../www/lib/ionic/js/ionic.bundle.js', '../www/lib/ionic/fonts/*'],
  style: ['../www/css/style.css'],
  script: ['../www/js/**/*.js'],
  index: './index.html',
  scss: '../scss/ionic.app.scss',
  dist: './dist'
};

gulp.task('default', ['deploy']);

gulp.task('clean', function(){
    return del([files.dist]);
});

gulp.task('static', function(){
  return gulp.src(files.static, { base: '../www/' })
    .pipe(gulp.dest(files.dist));
});

gulp.task('lib', function(){
  return gulp.src(files.lib, { base: '../www' })
    .pipe(gulp.dest(files.dist));
});

gulp.task('index', function(){
  return gulp.src(files.index)
    .pipe(gulp.dest(files.dist));
});

gulp.task('sass', function(){
  return gulp.src(files.scss)
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest(files.dist + '/css/'))
    .pipe(vinylPaths(del))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(files.dist + '/css/'))
    
});

gulp.task('style', function(){
  return gulp.src(files.style)
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(files.dist + '/css'));
});

gulp.task('js', function(){
  return gulp.src(files.script)
    .pipe(concat('binary.js'))
    .pipe(ngAnnotate())
    .pipe(rename({suffix: '.min'}))
    .pipe(minify())
    .pipe(gulp.dest(files.dist + '/js'));
});

gulp.task('deploy', ['static', 'lib', 'index', 'sass', 'style', 'js'], function() {
  return gulp.src([files.dist + '/**/*'])
    .pipe(file('CNAME', 'ticktrades.binary.com'))
    .pipe(ghPages());
});
