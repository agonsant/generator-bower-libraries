(function () {
    var plugins = require('gulp-load-plugins')();
    var del = require('del');
    var fs = require('fs');
    var git = require('./git-fn.js');
    var common = require('./common-fn.js');

    module.exports = function (gulp, projectConfigurations, gulpConfig, config) {

        var paths = gulpConfig;

        gulp.task('checkout-master', function (cb) {
            git.checkout(config.branches.master, cb);
        });

        gulp.task('pull-master', function (cb) {
            git.pull(config.branches.master, cb);
        });

        gulp.task('push-master', function (cb) {
            git.push(config.branches.master, cb);
        });


        gulp.task('checkout-develop', function (cb) {
            git.checkout(config.branches.develop, cb);
        });

        gulp.task('pull-develop', function (cb) {
            git.pull(config.branches.develop, cb);
        });

        gulp.task('push-develop', function (cb) {
            git.push(config.branches.develop, cb);
        });

        gulp.task('register-component', function (cb) {
            
        });

        gulp.task('update-version-file', function (cb) {
            console.log('Updating version.txt')
            fs.writeFile('version.txt', common.packageJson().version, cb);
        });
    };

})();