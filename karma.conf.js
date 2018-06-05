// Karma configuration
// Generated on Fri Jun 01 2018 15:51:16 GMT+0800 (+08)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'www/lib/ionic/release/js/ionic.bundle.js',
        'www/lib/angular-animate/angular-animate.js',
        'www/lib/angular-messages/angular-messages.js',
        'www/lib/angular-sanitize/angular-sanitize.js',
        'www/lib/angular-translate/angular-translate.js',
        'www/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'www/lib/angular-ui-router/release/angular-ui-router.js',
        'www/lib/hammerjs/hammer.js',
        'www/lib/AngularHammer/angular.hammer.js',
        'www/lib/Chart.js/Chart.js',
        'www/lib/intl/Intl.js',
        'www/lib/ionic-native/ionic.native.js',
        'www/lib/ngCordova/dist/ng-cordova.js',
        'www/lib/lodash/dist/lodash.js',
        'www/js/configs/angular-ios9-uiwebview.patch.js',
        './node_modules/angular-mocks/angular-mocks.js',
        'www/js/app.js',
        'www/js/app.run.js',
        'www/js/**/*.module.js',
        'www/js/**/*.config.js',
        'www/js/**/*.options.js',
        'www/js/**/*.service.js',
        'www/js/**/*.controller.js',
        'www/js/**/*.directive.js',
        'www/js/**/*.decorator.js',
        'www/js/**/*.spec.js',
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
