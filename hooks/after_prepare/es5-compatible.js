#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var babel = require('babel-core');

var cwd = process.cwd();
var rootDir = process.argv[2];
var platformPath = path.join(rootDir, 'platforms');
var platforms = process.env.CORDOVA_PLATFORMS.split(',');
var cliCommand = process.env.CORDOVA_CMDLINE;

run();

function run(){
  platforms.forEach(function(platform) {
    var wwwPath;

    switch(platform){
      case 'android':
        wwwPath = path.join(platformPath, platform, 'app', 'src', 'main', 'assets', 'www');
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

    processFolders(wwwPath);
  });
}

function processFolders(wwwPath){
  processFiles(path.join(wwwPath, 'js'));
}

function processFiles(dir){
  fs.readdir(dir, function(err, list){
    if(err){
      console.log('processFiles failed err: ' + err);
      return;
    }

    list.forEach(function(file){
      file = path.join(dir, file);
      fs.stat(file, function(err, stat){
        if(stat.isFile()){
          transform(file);
          return;
        }

        if(stat.isDirectory()){
          processFiles(file);
          return;
        }
      });
    });
  });
}

function transform(file){
  var ext = path.extname(file);

  if(ext === '.js'){
    var res = babel.transformFileSync(file, { presets: ['es2015'] });

    if(!res.code){
      console.log('Failed to transform file ' + file + ' \r\n err: ' + err);
    }

    fs.writeFileSync(file, res.code, 'utf-8');
  }
}
