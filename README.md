# mobile
> This documentation is a work in progress.

- Make sure you have node.js installed

## Setting up the App

```shell
// Fork the repo in GitHub
git clone git@github.com:[your git username]/mobile.git
cd mobile
git remote add upstream git@github.com:binary-com/mobile.git

npm install -g bower gulp cordova ionic ios-sim
npm install
```

## Running the App - localhost
```shell
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
```shell
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

## Deploy new web version

We build with [Gulp](http://gulpjs.com/) and deploy to [GitHub Pages](https://pages.github.com/)

```
cd build
npm install or npm update (may need sudo)
gulp deploy
```

### Adding a new language
Adding a new language is as simple as copying en.json to the [new language basename].json, then commiting this change and running json2po in the translation branch.
```
cp en.json [new language basename].json
git commit -am 'Language added'
git checkout translation
gulp json2po 
```
### Updating translation branch with recent changes in dev
You need to update the translation branch every time you make a change in the dev branch in order to deliver those changes to the translators to translate. This process is as simple as running json2po in the translation branch.
```
vim en.json # Change the language file 
git commit -am 'Language file updated'
git checkout translation
gulp po2json
```
### Update language files with completed translations
In order to update the language files with the most recent translations simply run po2json
```
git checkout translation
gulp po2json
```
