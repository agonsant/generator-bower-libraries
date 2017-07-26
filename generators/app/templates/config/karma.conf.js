// Karma configuration
// Generated on Mon Apr 25 2016 10:11:56 GMT+0200 (Hora de verano romance)

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        'basePath': '',
        // frameworks to use available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        'frameworks': ['jasmine'],
        'plugins': ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-coverage', 'karma-junit-reporter', 'karma-html-reporter', 'karma-jenkins-reporter', 'karma-ng-html2js-preprocessor'],
        // list of files / patterns to load in the browser
        'files': [
            '../bower_components/jquery/dist/jquery.js',
            '../node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
            '../dist/web-manage-my-booking.dependencies.min.js',
            '../dist/web-manage-my-booking.min.js',
            '../node_modules/angular-mocks/angular-mocks.js',
            '../dist/web-manage-my-booking.templates.js',
            '../test/unit/components/**/*-test.js',
            '../test/unit/*-test.js'
            // if you wanna load template files in nested directories, you must use this
            //'**/*.html'
        ],
        // list of files to exclude
        'exclude': [],
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        'preprocessors': { '../dist/web-manage-my-booking.min.js': ['coverage'], '**/*.html': ['ng-html2js'] },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        'reporters': ['progress', 'html', 'dots', 'coverage', 'junit'],
        'specjsonReporter': { 'outputFile': '../reports/karma-specs.json' },
        'jenkinsReporter': { 'outputFile': '../reports/test-results.xml', 'suite': 'foobar', 'classnameSuffix': 'browser-test' },
        //Karma htmlfile plugin configuration
        'htmlReporter': { 'outputDir': 'reports', 'reportName': 'report-summary' },
        'coverageReporter': {
            'reporters': [
              { 'type': 'text-summary' },
              { 'type': 'html', 'dir': '../reports/coverage/' },
              { 'type': 'cobertura', 'dir': '../reports/coverage' }
            ]
        },
        'junitReporter': { 'outputDir': '../reports/junit', 'outputFile': 'test-results.xml' },
        // web server port
        'port': 9876,
        // enable / disable colors in the output (reporters and logs)
        'colors': true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        'logLevel': config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        'autoWatch': true,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        'browsers': ['PhantomJS'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        'singleRun': true,
        // Concurrency level
        // how many browser should be started simultaneous
        'concurrency': Infinity,
        'browserDisconnectTimeout': 5000,
        'browserNoActivityTimeout': 60000,
        'browserDisconnectTolerance': 10,
        'client': {
            'captureConsole': true,
            'mocha': { 'bail': true }
        },
        'ngHtml2JsPreprocessor': { 'moduleName': 'templates' }
    });
};
