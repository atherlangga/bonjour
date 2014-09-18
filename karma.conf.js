// Karma configuration
// Generated on Tue Sep 16 2014 16:45:31 GMT+0700 (WIB)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'lib/lodash/lodash.js',
      'lib/pusher/pusher.js',
      'lib/angular/angular.js',
      'lib/qiscus/qiscus.js',
      'lib/qiscus/qiscus-api-client.js',
      'lib/qiscus/qiscus-listener.js',
      'lib/qiscus-adapters/qiscus-api-client-angular.js',
      'lib/qiscus-adapters/qiscus-listener-pusher.js',
      'lib/qiscus-adapters/qiscus-promises-angular.js',
      'lib/angular-route/angular-route.js',
      'assets/components/angular-strap/dist/angular-strap.js',
      'assets/components/angular-mocks/angular-mocks.js',
      'src/app.js',
      'src/**/*.js',
      'test/ui/*test.js'
    ],


    // list of files to exclude
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
    singleRun: false
  });
};
