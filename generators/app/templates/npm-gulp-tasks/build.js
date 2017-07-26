(function () {

    var fs = require('fs');
    var plugins = require('gulp-load-plugins')();
    var mainBowerFiles = require('main-bower-files');
    var del = require('del');
    var gutil = require('gulp-util');
    var validate = require('html-angular-validate');
    var runSequence = require('run-sequence');
    var common = require('./common-fn.js');
    // eslint-html-reporter required to export report to human readable file
    var reporter = require('eslint-html-reporter');

    module.exports = function (gulp, projectConfigurations, gulpConfig, config) {

        var paths = gulpConfig;
        var buildPaths = config.paths;
        var pkg = projectConfigurations;

        gulp.task('scripts', false, ['lint-all'], function () {
            return gulp.src(buildPaths.js_src)
                // Initialize the sourcemap tooling
                .pipe(plugins.sourcemaps.init())
                // Apply AngularJS annotations to module definitions
                .pipe(plugins.ngAnnotate())
                // Concatenate all the files into one big one, defined by the order of the files specified in paths.app_src
                .pipe(plugins.concat(pkg.name + '.min.js'))
                // Uglify
                .pipe(plugins.uglify())
                // Output the Source map
                .pipe(plugins.sourcemaps.write('.'))
                // Output the minified file
                .pipe(gulp.dest(paths.dist));
        });

        gulp.task('sass', false, function () {
            return gulp.src(paths.sass_src)
                .pipe(plugins.sass({outputStyle: 'expanded',sourceComments: 'normal'}))
                .pipe(gulp.dest(paths.css));
        });

        gulp.task('css', false, function () {
            return gulp.src(paths.css_src)
                // Concatenate all files into one big one
                .pipe(plugins.concat(pkg.name + '.css'))
                // Minify and rename to module.min.js
                .pipe(plugins.minifyCss({ keepBreaks: true, keepSpecialComments: 0 }))
                .pipe(plugins.rename({ extname: '.min.css' }))
                // Dump all files into build folder
                .pipe(gulp.dest(paths.dist));
        });

        gulp.task('templates', false, function () {
            return gulp.src(paths.template_src)
                .pipe(plugins.flatten())
                .pipe(plugins.dedupe())
                .on('error', function (err) {
                    // Make sure duplicate files cause gulp to exit non-zero
                    throw err;
                })
                .pipe(plugins.angularTemplatecache({
                    standalone: true,
                    module: pkg.name + '-templates',
                    filename: pkg.name + '.templates.js',
                    root: pkg.name + '/templates'
                }))
                .pipe(gulp.dest(paths.dist));
        });

        gulp.task('html-lint', [], function (callback) {
            var colors = gutil.colors;
            var log = gutil.log;
            var stats;
            try {
                stats = fs.statSync("reports");
            }
            catch (err) {
                if (err.errno === -2) {
                    fs.mkdir("reports", function (err) {
                        if (err && err.errno !== -17) {
                            return console.log(err);
                        }
                    });
                }
                else console.log(err);
            }
            try {
                stats = fs.statSync(paths.htmlReports);
            }
            catch (err) {
                if (err.errno === -2) {
                    fs.mkdir(paths.htmlReports, function (err) {
                        if (err && err.errno !== -17) {
                            return console.log(err);
                        }
                    });
                }
                else console.log(err);
            }
            fs.writeFile(paths.htmlReports + "html-validator-report.html", '<!DOCTYPE html><html><head><meta charset="utf-8"><title>HTML Lint Output</title><style>' +
                'body {' +
                'font-family :"Arial";}' +
                'h1 {' +
                'color: blue;}' +
                'h2 {' +
                'color: green;}' +
                'h3 {' +
                'color: black;}' +
                'li{' +
                'color : red;}' +
                '</style></head> <body><h1>HTML Lint Output</h1> <br />', function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });

            validate.validate([
                "src/**/!(index)*.html",
                "etc/**/!(index)*.html"
            ], {
                    wrapping: {
                        'tr': '<tbody>{0}</tbody>'
                    },
                    reportpath: 'reports/html/html-validator-report.json',
                    reportCheckstylePath: 'reports/html/html-validator-report.xml',
                    relaxerror: ['Empty heading.'],
                    tmplext: 'html',
                    w3clocal: paths.w3ValidatorUrl
                }).then(function (result) {
                    if (result.allpassed) {
                        log(colors.green('All files validated successfully'));
                        fs.appendFileSync('reports/html/html-validator-report.html', '<h2>All files validated successfully</h2>');
                        callback();
                    } else {
                        log(colors.red('Found validation failures'));
                        for (var i = 0; i < result.failed.length; i++) {
                            var file = result.failed[i];
                            log(colors.yellow(file.filepath));
                            fs.appendFileSync('reports/html/html-validator-report.html', '<h3>' + file.filepath + '</h3>');
                            for (var j = 0; j < file.errors.length; j++) {
                                var err = file.errors[j];
                                if (err.line !== undefined) {
                                    log(colors.red('  --[' +
                                        err.line +
                                        ':' +
                                        err.col +
                                        '] ' +
                                        err.msg));
                                    fs.appendFileSync('reports/html/html-validator-report.html', '<li>  --[' + err.line + ':' + err.col + '] ' + err.msg + '</li>');
                                } else {
                                    log(colors.red('  --[file] ' + err.msg));
                                    fs.appendFileSync('reports/html/html-validator-report.html', '<li>  --[file] ' + err.msg + '</li>');
                                }

                            }
                        }

                        callback(false);
                    }
                }, function (err) {
                    // Unable to validate files
                    if (err === "No files found to match") {
                        log(colors.blue('No HTML files in this project, so nothing to lint'));
                        callback();
                    } else {
                        log(colors.red('htmlangular error: ' + err));
                        callback(err);
                    }
                })
        });

        gulp.task('lint', 'ESLint Your Code and Tests', function () {
            // Create reports directory if it doesn't already exist
            if (!fs.existsSync(paths.reports)) {
                fs.mkdirSync(paths.reports);
            }
            // Create lint reports directory if it doesn't already exist
            if (!fs.existsSync(paths.lintReports)) {
                fs.mkdirSync(paths.lintReports);
            }
            // Create checkstyle.xml lint report output
            var output = fs.createWriteStream(paths.lintReports + 'checkstyle.xml');

            return gulp.src(buildPaths.js_src.concat(paths.all_tests_src))
                // Tell the eslint plugin where to look for the rules
                .pipe(plugins.eslint({
                    rulePaths: ['config/lint/'],
                    configFile: 'config/lint/.eslintrc',
                    extends: ['angular']
                }))
                // Run eslint and return the results to the console screen
                .pipe(plugins.eslint.format())
                // Run eslint and put the results into the checkstyle.xml created above
                .pipe(plugins.eslint.format('checkstyle', output))
                // Run eslint, format the report into html file and export to lint reports directory
                .pipe(plugins.eslint.format(reporter, function (results) {
                    fs.writeFileSync(paths.lintReports + 'report-results.html', results);
                })
                );
        });

        gulp.task('sass-lint', 'Lint Your SASS', function () {
            if (!fs.existsSync(paths.reports)) {
                fs.mkdirSync(paths.reports);
            }

            if (!fs.existsSync(paths.lintReports)) {
                fs.mkdirSync(paths.lintReports);
            }

            return gulp.src(paths.sass_watch)
                .pipe(plugins.scssLint({ config: 'config/sass.yml', reporterOutput: paths.lintReports + 'sass.json' }));
        });

        gulp.task('lint-all', false, ['sass-lint', 'lint', 'html-lint']);

        gulp.task('clean', 'Deletes the build', function (cb) {
            return del([paths.dist], cb);
        });

        gulp.task('build', function (done) {
            runSequence(
                'clean',
                'scripts',
                'sass',
                'css',
                'templates',
                function (error) {
                    if (error) {
                        var exitCode = 2;
                        console.log(error.message);
                        return process.exit(exitCode);
                    } else {
                        console.log('BUILD SUCCESS');
                        done();
                    }
                }
            )
        });

    };
})();