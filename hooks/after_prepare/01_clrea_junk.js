#!/usr/bin/env node

var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path');
var sh = require('shelljs');
var fsExtra = require('fs-extra');

var cwd = process.cwd();
var rootDir = process.argv[2];
var platformPath = path.join(rootDir, 'platforms');
var platforms = process.env.CORDOVA_PLATFORMS.split(',');
var cliCommand = process.env.CORDOVA_CMDLINE;
var config = {
  file: 'www/index.html',
  js:  {
    selector: 'script',
    attribute: 'src'
  },
  style: {
    selector: 'link',
    attribute: 'href'
  }
};

run();

function run(){
  sh.config.silent = true;

  platforms.forEach(function(platform) {
    var wwwPath;


    switch(platform){
      case 'android':
        wwwPath = path.join(platformPath, platform, 'assets', 'www');
        break;

      case 'ios':
      case 'browser':
      case 'wp8':
      case 'windows':
        wwwPath = path.join(platformPath, platform, 'www');
        break;

      default:
        console.log('this hook only supports android, ios, wp8, windows, and browser currently');
        return;
    }

    var html = fs.readFileSync(path.join(rootDir,config.file),'utf8');
    var files = findFilenames(html, config.js);

    sh.rm('-rf', path.join(wwwPath, 'lib'));
    sh.mkdir(wwwPath, 'lib');

    files.forEach(function(file){
      fsExtra.copySync(path.join(rootDir, 'www', file), path.join(wwwPath, file));
    });

    fsExtra.copySync(path.join(rootDir, 'www', 'lib', 'ionic', 'release', 'fonts'), path.join(wwwPath, 'lib', 'ionic', 'release', 'fonts'));
    fsExtra.copySync(path.join(rootDir, 'www', 'lib', 'ionic', 'release', 'css'), path.join(wwwPath, 'lib', 'ionic', 'release', 'css'));


  });
}

function findFilenames(html, config) {
  var $ = cheerio.load(html);
  return $(config.selector).map(
      function(i,elem){
        return $(elem).attr(config.attribute);
      }).toArray().filter(
        function(item){
          return (item !== undefined && item.substring(0,3) === 'lib');
        }).map(
          function(item){
            return item;
          });
}
