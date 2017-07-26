(function () {

    var plugins = require('gulp-load-plugins')();
    var runSequence = require('run-sequence');

    var git = require('./git-fn.js');
    var common = require('./common-fn.js');

    module.exports = function (gulp, projectConfigurations, gulpConfig, config) {

        var knownOptions = {
            string: ['release-type', 'version']
        };

        var argv = require('minimist')(process.argv.slice(2), knownOptions);

        gulp.task('release-start', function (done) {
            var releaseType = argv['release-type'];
            if (!releaseType) {
                console.log('Tell me the release-type param');
                process.exit(1)
            }
            runSequence(
                'checkout-develop',
                'commit-changes-develop',
                'pull-develop',
                'bump',
                'update-version-file',
                'commit-changes-develop',
                'push-develop',
                'checkout-master',
                'merge-develop',
                'push-master',
                'create-new-tag',
                'build',
                'register-component',
                function (error) {
                    common.statusTask(error, 'COMPONENT SUCCESSFULLY REGISTERED: ' + releaseType, done);
                }
            )
        });

        gulp.task('release-info', function () {
            if (!/^(major|minor|patch|\d{1,2}\.\d{1,4}\.\d{1,4})$/.test(argv['release-type'])) {
                console.log('\nINVALID PARAMETER:\n');
                console.log('\nrelease-type should be \'patch\', \'minor\', \'major\' for automatic version number increments, or an explicit version number specified in xx.yyyy.zzzz format.\n\nThe default (if not supplied) is \'patch\'.');
                process.exit(1);
            }
        });

        gulp.task('bump', ['release-info'], function () {
            var bumpType = /^(major|minor|patch)$/.test(argv['release-type'])
                ? { 'type': argv['release-type'] }
                : { 'version': argv['release-type'] };
            return gulp.src(['package.json'])
                .pipe(plugins.bump(bumpType))
                .pipe(gulp.dest('./'));
        });

        gulp.task('create-new-tag', function (cb) {
            var version = common.packageJson().version;
            git.createTag(version, 'Created Tag for version: ' + version, cb)
        });

        gulp.task('commit-changes-develop', function (cb) {
            git.commitChanges('Changes on develop in release', cb);
        });

        gulp.task('merge-develop', function (cb) {
            git.merge('develop', cb)
        });

    };
})();