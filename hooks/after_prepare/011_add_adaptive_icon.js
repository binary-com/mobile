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

run();


function run() {
    var resPath = path.join(platformPath, 'android', 'app', 'src', 'main', 'res');
    sh.rm('-rf', path.join(resPath, 'mipmap-anydpi-v26', 'icon.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'anydpi-v26-icon.xml'), path.join(resPath, 'mipmap-anydpi-v26', 'icon.xml'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'values', 'colors.xml'), path.join(resPath, 'values', 'colors.xml'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'foreground', 'foreground-hdpi.png'), path.join(resPath, 'mipmap-hdpi', 'foreground.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'foreground', 'foreground-mdpi.png'), path.join(resPath, 'mipmap-mdpi', 'foreground.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'foreground', 'foreground-xhdpi.png'), path.join(resPath, 'mipmap-xhdpi', 'foreground.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'foreground', 'foreground-xxhdpi.png'), path.join(resPath, 'mipmap-xxhdpi', 'foreground.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'foreground', 'foreground-xxxhdpi.png'), path.join(resPath, 'mipmap-xxxhdpi', 'foreground.png'));

    fsExtra.copySync(path.join(rootDir, 'resources', 'icon-transparent', 'drawable-hdpi-icon.png'), path.join(resPath, 'mipmap-hdpi', 'notification.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'icon-transparent', 'drawable-ldpi-icon.png'), path.join(resPath, 'mipmap-ldpi', 'notification.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'icon-transparent', 'drawable-mdpi-icon.png'), path.join(resPath, 'mipmap-mdpi', 'notification.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'icon-transparent', 'drawable-xhdpi-icon.png'), path.join(resPath, 'mipmap-xhdpi', 'notification.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'icon-transparent', 'drawable-xxhdpi-icon.png'), path.join(resPath, 'mipmap-xxhdpi', 'notification.png'));
    fsExtra.copySync(path.join(rootDir, 'resources', 'icon-transparent', 'drawable-xxxhdpi-icon.png'), path.join(resPath, 'mipmap-xxxhdpi', 'notification.png'));
}
