[![Build Status](https://travis-ci.org/binary-com/mobile.svg?branch=dev)](https://travis-ci.org/binary-com/mobile)

# Tick Trade Mobile Application

- Make sure you have node.js installed

## Setting up the App

```
// Fork the repo in GitHub
git clone git@github.com:[your git username]/mobile.git
cd mobile
git remote add upstream git@github.com:binary-com/mobile.git

npm install -g bower gulp cordova ionic ios-sim
npm install
```

## Running the App - localhost
```
// In project root
git pull upstream master
bower update
ionic serve
```

## Running the App - iOS Emulator
```shell
ionic emulate ios
```

## Running The App - iOS Device
```shell
cordova run ios --device
```

## Running the App - Android Emulator
```shell
ionic emulate android
```

## Running the App - Android Device
```
cordova run android --device
```

## Submitting the code
```shell
git push origin master
// Create a pull request from your fork in GitHub
```

## Working with SCSS
To update SCSS files, run the following command in another terminal
```shell
gulp sass  // compiles scss files to css
gulp watch // compiles scss files to css everytime a scss file gets changed
```

## Deploy new web version to GH-Pages
To buil new version of the app and deploy it on gh-pages run the below command.

```shell
gulp deploy
```

## Update and Deploy CrowdIn version

```shell
gulp deploy-translation (--remote <remote-name>)
```

## How to use code-push to push new version

```shell
1. Install code-push
2. Modify `www/versions.json` file and add details of new version on it.
2. Use gulp to push the release

  `$gulp code-push --app <registered appName in code-push> --deployment <deploymentName> --platform <[android, ios]>`
```

## How to build desktop version of TickTrade
1. install electron globally `npm install -g electron electron-packager`
2. use gulp to build `gulp build-desktop --platform=[win32|linux|darwin|mas] --arch=[x64|ia32]`
3. sign the released app:
  1. install electron-osx-sign globally `npm instal -g electron-osx-sign`
  2. run `electron-osx-sign path/to/release/app`

## How to test
1. run `npm install` to install `karam`, `jasmine` and all other dependencies.
2. run `npm install -g karma-cli`
3. run 'karma start`
