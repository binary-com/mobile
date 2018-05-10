#!/usr/bin/env node

const path = require('path');
const shell = require('shelljs');

const rootDir = process.argv[2];
const platformPath = path.join(rootDir, 'platforms');
const platforms = process.env.CORDOVA_PLATFORMS.split(',');
run();

function run() {

    const fpResult = shell.exec(
        'echo | ' + 
        'openssl s_client -showcerts -connect frontend.binaryws.com:443 -servername frontend.binaryws.com | ' +
        'openssl x509 -fingerprint -noout'
    );

    if (fpResult && fpResult.output) {
        const fp = /^SHA1 Fingerprint=(.+)/.exec(fpResult.output)[1].replace(/:/g, ' ');
        const wwwPath = path.join(platformPath, 'android', 'app', 'src', 'main', 'assets', 'www', 'js', 'configs', 'app.config.js');

        shell.sed('-i', 'serverCertFP   : ""', `serverCertFP   : "${fp}"`, wwwPath);
    }
}
