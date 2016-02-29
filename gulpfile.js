var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var minify = require('gulp-minify');
var ngmin = require('gulp-ngmin');
var del = require('del');
var htmlreplace = require('gulp-html-replace');
var ghPagesDeploy = require('gulp-gh-pages');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('compress', function(done){
   gulp.src('www/js/**/*.js')
       .pipe(ngmin())
       .pipe(concat('binary-ticktrade.js'))
       .pipe(minify())
       .pipe(gulp.dest('dist/js'));
    
   return done();
});

gulp.task('clean', function(done){
    del.sync('dist/**');
    return done();
});

gulp.task('modify-index', ['compress'], function(){
    // replacing js files with min one
    return gulp.src('www/index.html')
       .pipe(htmlreplace({js: 'js/binary-ticktrade-min.js'}))
       .pipe(gulp.dest('dist/'))
});

gulp.task('build', ['git-check','clean', 'compress', 'modify-index'], function(){
    return gulp.src(['www/**/*', '!www/js{,/**}', '!www/index.html'])
       .pipe(gulp.dest('dist/'))
});

gulp.task('deploy', ['build'], function(){
    return gulp.src('dist/**/*')
        .pipe(ghPagesDeploy());
});
