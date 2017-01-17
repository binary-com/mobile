var gulp = require('gulp');

var gutil = require('gulp-util');
var file = require('gulp-file');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var ngmin = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var htmlreplace = require('gulp-html-replace');
var ghPagesDeploy = require('gulp-gh-pages');
var del = require('del');

var sh = require('shelljs');
var bower = require('bower');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
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

gulp.task('deploy-translation', function(done){

  sh.config.silent = true;

  var remote = getRemoteName(process.argv);
  var remoteUrl = getRemoteUrl(remote);

  // remove last tmp directory if it exists
  sh.rm('-rf', 'tmp');

  //make a tmp directory
  sh.mkdir('tmp');
  if(sh.error()){
    console.log(gutil.colors.red('Error: ' + sh.error()));
    process.exit(1);
  }

  sh.cd('tmp');
  console.log('Fetching gh-pages ...');
  sh.config.silent = false;
  sh.exec('git clone '+ remoteUrl +' -b gh-pages ./');
  sh.config.silent = true;

  console.log('Copying translation version ...');
  sh.rm('-rf', 'translation');
  sh.cp('-R', '../www/*','translation');

  console.log('Adding Crowdin scripts ...');
  var config = '<script type="text/javascript">\n\t\tvar _jipt = [];\n\t\t' +
               "_jipt.push(['project', 'tick-trade-app']);\n\t\t" +
               "localStorage.language = 'ach';\n\t</script>\n\t" +
               '<script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js"></script>';

  sh.sed('-i', '<!-- CROWDIN SCRIPT -->', config, 'translation/index.html');

  console.log('Pushing changes to gh-pages ...');
  sh.config.silent = false;
  sh.exec('git add .');
  sh.exec('git commit -m "Updated translation version"');
  sh.exec('git push origin gh-pages:gh-pages');
  sh.config.silent = true;

  console.log('Cleaning workspace ...');
  // remove tmp directory to clean workspace
  sh.cd('../');
  sh.rm('-rf', 'tmp');
  return done();
});

gulp.task('code-push', function(done){
  if(!sh.which('code-push')){
    console.log('  ' + gutil.colors.red('Code-Push is not installed.'));
    process.exit(-1);
  }

  var app = getArgvBySwitchName("--app");

  if(!app){
    console.log('  ' + gutil.colors.red('Application name is not defined.'));
    process.exit(-1);
  }

  var platform = getArgvBySwitchName("--platform");

  if(!platform){
    console.log('  ' + gutil.colors.red('Platform is not defined.'));
    process.exit(-1);
  }

  var deployment = getArgvBySwitchName("--deployment");

  if(!deployment){
    console.log('  ' + gutil.colors.red('Deployment name is not defined.'));
    process.exit(-1);
  }

  console.log('  ' + gutil.colors.blue('Preparing files ...'));
  sh.sed('-i', ".otherwise('/')", ".otherwise('/update')", 'www/js/configs/states.config.js');

  console.log('  ' + gutil.colors.blue('Run code-push ...'));
  sh.exec('code-push release-cordova ' + app + ' ' + platform + ' --deploymentName ' + deployment + ' --mandatory');

  console.log('  ' + gutil.colors.blue('Rolling back dump changes ...'));
  sh.sed('-i', ".otherwise('/update')", ".otherwise('/')", 'www/js/configs/states.config.js');
  sh.exec('ionic prepare');

  done();
});


gulp.task('compress', function(done){
  gulp.src(['www/js/**/*.module.js', 'www/js/**/{*.js, !*.module.js}', 'www/*.js'])
      .pipe(babel({presets: ['es2015']}))
      .pipe(ngmin())
      .pipe(concat('main.js'))
      .pipe(minify().on('error', function(e){ console.log(e);}))
      .pipe(gulp.dest('dist/js'));

  return done();
});

gulp.task('modify-index', function(done){
  gulp.src('www/index.html')
      .pipe(htmlreplace({
            js: 'js/main-min.js',
            customscript: {
              src: "window.location.href.indexOf('translation') < 0 && localStorage.language == 'ach'? localStorage.language = 'en' : null;",
              tpl: '<script> %s </script>'
            }
           }
         )
      )
      .pipe(gulp.dest('dist'));

  return done();
});

gulp.task('clean', function(done){
    del.sync('dist/**');
    sh.exec('mkdir dist');
    return done();
});

gulp.task('add-cname', function(done){
  file('CNAME', 'ticktrade.binary.com')
  .pipe(gulp.dest('dist'));
  return done();
});

gulp.task('build', ['clean', 'compress', 'modify-index', 'add-cname'], function(){
  return gulp.src(['www/**/*', '!www/js/**/*.js', '!www/index.html'])
      .pipe(gulp.dest('dist'));
});

gulp.task('deploy', ['build'], function(){
    return gulp.src('dist/**/*')
        .pipe(ghPagesDeploy());
});


function getRemoteUrl(remote){
  var result = sh.exec('git remote show '+ remote  +' -n | grep "Push  URL:"');
  if(result && result.output){
    var pushUrl = result.output.trim();
    var regex = /^Push  URL: (\S+)$/;
    regResult = regex.exec(pushUrl);
    if(regResult != null){
      return regResult[1];
    }
  }
  else {
    console.log("It's not a git repo!");
    process.exit(-1);
  }
  return;
}

function getRemoteName(argv){
  if((index = argv.indexOf('--remote')) > -1){
    return argv[index+1] ? argv[index+1] : 'origin';
  }
  return 'origin';
}

function getArgvBySwitchName(name){
  var argv = process.argv;
  if((index = argv.indexOf(name)) > -1){
    return argv[index+1] ? argv[index+1] : null;
  }
  return null;
}
