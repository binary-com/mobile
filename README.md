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
bower install
```

## Running the App - localhost
```shell
// In project root
git pull upstream master
bower update
ionic serve
```

## Running the App - iOS
```shell
ionic emulate ios
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