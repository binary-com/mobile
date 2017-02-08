#!/usr/bin/env node

var os = require('os');
var pkgjson = require('./package.json');
var path = require('path');
var sh = require('shelljs');

var appVersion = pkgjson.version
  , electronPackager = 'electron-packager'
  , electronVersion = '1.4.15'
  , icon = 'www/img/icons/binary.icns';

var archs = ['ia32', 'x64'];

if(process.arch){
  archs = [process.arch];
}

if (process.argv[2] === '--all') {

  // build for all platforms
  var platforms = ['linux', 'darwin'];

  // Only build for Windows when in Windows
  if(process.platform === 'win32') platforms.push('win32');

  platforms.forEach(function (plat) {
    archs.forEach(function (arch) {
      pack(plat, arch);
    });
  });

} else if (typeof process.argv[2] !== 'undefined' && process.argv[2].indexOf('--platform') > -1) {
  archs.forEach(function (arch) {
    var plat = process.argv[2];
    pack(plat, arch);
  });
} else {
  // build for current platform only
  pack(os.platform(), os.arch());
}

function pack (plat, arch) {
  plat = plat.replace('--platform=', '');
  var outputPath = './build/releases/' + plat + '/' + arch;

  sh.exec('./node_modules/.bin/rimraf ' + outputPath);

  var appName = pkgjson.name;
  if(plat == 'linux') appName = appName.toLowerCase();

  // there is no darwin ia32 electron
  if (plat === 'darwin' && arch === 'ia32') return;

  var cmds = [];

  var location = '.';

  cmds.push(electronPackager + ' '+location+' ' + appName +
    ' --platform=' + plat +
    ' --arch=' + arch +
    ' --electron-version=' + electronVersion +
    ' --app-version=' + appVersion +
    ' --icon=' + icon +
    ' --out=' + outputPath +
    ((plat == 'linux') ? '' : ' --prune') +
    ((plat === 'win32') ? ' --asar=true' : '') +
    ' --ignore="build|electron-packager|www|\.git|\.gitignore|gulpfile\.js|\.bowerrc' +
    '|\.editorconfig|.*\.swp|.publish|bower\.json|config\.xml|crowdin\.yaml|electron-pkg\.json' +
    '|hooks|ionic\.config\.json|node_modules|platforms|plugins|README\.md|resoucers|scss"' +
    ' --overwrite');

  for(var i in cmds){
    console.log(cmds[i]);
    if(process.platform == 'win32'){
      sh.exec(cmds[i], {silent:false});
    } else {
      sh.exec(cmds[i]);
    }
  }

}
