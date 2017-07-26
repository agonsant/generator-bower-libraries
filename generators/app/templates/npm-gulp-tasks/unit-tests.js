(function () {
    var gulp = require('gulp-help')(require('gulp'));
    var fs = require('fs');
    var plugins = require('gulp-load-plugins')();
    var wiredep = require('wiredep');

    module.exports = function (gulp, projectConfigurations, gulpConfig, config) {

        var paths = gulpConfig;
        var testPaths = config.paths;
        var moduleLocation = projectConfigurations.moduleLocation;

        //only call this from within functions that use generate-test-dependencies task
        // as the file must be generated before we use it.
        function karmaDeps() {
            return require('./config/' + paths.test_dependencies);
        }

        //creates a file containing an array of dependencies that we get from bower.json
        gulp.task('generate-test-dependencies', function (callback) {
            //first lets create the file to store the testDependencies array
            var fileText = "module.exports = [ \n" + "//bower:js //endbower \n";
            var i;
            var numberOfDependencies;
            if (config.devUnitTestDependencies) {
                numberOfDependencies = config.devUnitTestDependencies.length;

                for (i = 0; i < numberOfDependencies; i++) {
                    if (i > 0 && i <= numberOfDependencies - 1)
                        fileText += ',\n'

                    fileText += JSON.stringify(config.devUnitTestDependencies[i]);
                }
            }

            fileText += "\n];";

            fs.writeFileSync(paths.config + paths.test_dependencies, fileText);

            //now use wiredeps to read bower.json and write these dependency files into the test_dependencies array
            return gulp.src(paths.config + paths.test_dependencies)
                .pipe(wiredep.stream({
                    ignorePath: '../bower_components/',
                    exclude: ['bower_components/modernizr/modernizr.js'],
                    fileTypes: {
                        js: {
                            replace: {
                                js: function (filePath) {
                                    return "'./build/lib/" + filePath + "',";
                                }
                            }
                        }
                    }
                }))
                .pipe(gulp.dest(paths.config), callback);
        });

        var runUnitTests = function (cfg) {
            cfg.files.push('./test/unit/**/*.js');

            return gulp.src([])
                .pipe(plugins.karma(cfg))
                .on('error', function (err) {
                    throw err;
                });
        };

        //injecting test-dependencies ensures the dependencies list is written before we attempt to use it
        gulp.task('test', 'Runs all JSUnit tests against the minified code and produces JSUnit report', ['generate-test-dependencies', 'build'], function () {

            var buildFiles = karmaDeps().concat(['./build/*.min.js', './build/*.templates.js']);

            return runUnitTests({
                configFile: paths.config + paths.karma_config,
                action: 'run',
                files: buildFiles,
                plugins: ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-junit-reporter', 'karma-html-reporter'],
                reporters: ['dots', 'junit', 'html'],
                junitReporter: {
                    outputFile: paths.reports + paths.junit_report
                },
                htmlReporter: {
                    outputDir: paths.reports + 'unit'
                }
            });
        });

        //injecting test-dependencies ensures the dependencies list is written before we attempt to use it
        gulp.task('test-coverage', false, ['generate-test-dependencies', 'move-bower', 'templates'], function () {

            var coverageFiles = karmaDeps().concat(testPaths.js_src).concat(['./build/*.templates.js']);

            return runUnitTests({
                configFile: paths.config + paths.karma_config,
                action: 'run',
                files: coverageFiles,
                plugins: ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-coverage'],
                reporters: ['dots', 'coverage'],
                preprocessors: { './src/**/*.js': ['coverage'] },
                coverageReporter: {
                    dir: './' + paths.reports + paths.coverage_reports,
                    reporters: [
                        { type: 'html', includeAllSources: true },
                        { type: 'cobertura', includeAllSources: true, file: paths.coverage_cobertura_report }
                    ]
                }
            });
        });

        gulp.task('coverage', 'Run all JSUnit tests against the *unminified* code and produce a coverage report.  NOTE: This does not test your built code.', ['test-coverage'], function (cb) {
            console.log('Code coverage available in ' + paths.reports + paths.coverage_reports + ' folder');
            cb();
        });

        gulp.task('copy-debug-karma-config', false, function () {
            return gulp.src([paths.config + paths.karma_config])
                .pipe(plugins.rename(paths.config + paths.karma_config_webstorm))
                .pipe(gulp.dest('.'));
        });

        //injecting test-dependencies ensures the dependencies list is written before we attempt to use it
        gulp.task('generate-debug-karma-config', false, ['generate-test-dependencies', 'copy-debug-karma-config', 'templates'], function () {
            var coverageFiles = karmaDeps().concat(testPaths.js_src);
            coverageFiles.push('./test/unit/**/*.js');
            coverageFiles.push('./build/*.templates.js');

            var debugConfig = {
                files: coverageFiles,
                plugins: ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-coverage'],
                reporters: ['dots'],
                preprocessors: { './src/**/*.js': ['coverage'] }
            };
            return gulp.src([paths.config + paths.karma_config_webstorm])
                .pipe(plugins.replace("/* DEBUG_CONFIG */", "config.set(" + JSON.stringify(debugConfig) + ');'))
                .pipe(gulp.dest(paths.config));

        });

    };
})();