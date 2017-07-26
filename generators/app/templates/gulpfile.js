(function () {
    var gulp = require('gulp-help')(require('gulp'));
    var wrench = require('wrench');
    var gulpConfig = require('./config/gulp.config');
    var projectConfigurations = require('./package.json');
    var config = require('./config/config.js')

    wrench.readdirSyncRecursive('./npm-gulp-tasks').filter(function (file) {
        return !(/\-fn.(js)$/i).test(file);
    }).map(function (file) {
        require('./npm-gulp-tasks/' + file)(gulp, projectConfigurations, gulpConfig, config);
    });
})();