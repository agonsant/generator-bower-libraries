(function () {
    var fs = require('fs');
    var gulp = require('gulp-help')(require('gulp'));
    var plugins = require('gulp-load-plugins')();
    var runSequence = require('run-sequence');
    var git = require('./git-fn.js')
    var common = require('./common-fn.js')

    module.exports = function (gulp, projectConfigurations, gulpConfig, config) {

        var knownOptions = {
            string: 'feature'
        };

        var argv = require('minimist')(process.argv.slice(2), knownOptions);

        var feature = argv['feature'];
        if (feature) {
            feature = 'feature/' + feature;
        }

        gulp.task('feature-start', function (done) {
            var feature = argv['feature'];
            if (!feature) {
                console.log('Tell me the feature param');
                process.exit(1);
            }
            runSequence(
                'checkout-develop',
                'pull-develop',
                'checkout-feature',
                'push-feature',
                function (error) {
                    common.statusTask(error, 'FEATURE BRANCH CREATED', done);
                }
            )
        });

        gulp.task('feature-try', function (done) {
            var feature = argv['feature'];
            if (!feature) {
                console.log('Tell me the feature param');
                process.exit(1);
            }
            runSequence(
                'checkout-feature',
                'pull-feature',
                'checkout-develop',
                'pull-develop',
                'merge-feature',
                'push-develop',
                'checkout-feature',
                function (error) {
                    common.statusTask(error, 'FEATURE BRANCH MERGE DEVELOP SUCCESSFULLY', done);
                }
            )
        });

        gulp.task('feature-finish', function (done) {
            var feature = argv['feature'];
            if (!feature) {
                console.log('Tell me the feature param');
                process.exit(1);
            }
            runSequence(
                'feature-try',
                'checkout-develop',
                'pull-develop',
                'remove-feature-local',
                'remove-feature-remote',
                function (error) {
                    common.statusTask(error, 'FEATURE FINISHED SUCCESSFULLY', done);
                }
            )
        })

        gulp.task('checkout-feature', function (cb) {
            git.checkout(feature, cb);
        })

        gulp.task('push-feature', function (cb) {
            git.push(feature, cb);
        })

        gulp.task('pull-feature', function (cb) {
            git.pull(feature, cb);
        })

        gulp.task('merge-feature', function (cb) {
            git.merge(feature, cb);
        })

        gulp.task('remove-feature-local', function (cb) {
            git.removeLocal(feature, cb);
        })

        gulp.task('remove-feature-remote', function (cb) {
            git.removeRemote(feature, cb);
        })

    }
})();