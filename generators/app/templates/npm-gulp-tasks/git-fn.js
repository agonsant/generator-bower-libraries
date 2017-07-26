(function () {
    var gulp = require('gulp-help')(require('gulp'));
    var plugins = require('gulp-load-plugins')();

    module.exports = {
        checkout: checkout,
        pull: pull,
        push: push,
        merge: merge,
        removeLocal: removeLocal,
        removeRemote: removeRemote,
        commitChanges: commitChanges,
        createTag: createTag,
        createBranch: createBranch
    };

    function checkout(branchName, cb) {
        plugins.git.checkout(branchName, function (err) {
            if (err) {
                plugins.git.checkout(branchName, { args: '-b' }, function (err) {
                    if (err) {
                        throw err
                    } else {
                        cb();
                    }
                });
            } else {
                cb();
            }
        })
    }

    function pull(branchName, cb) {
        plugins.git.pull('origin', branchName, { args: '--rebase' }, function (err) {
            if (err) {
                throw err
            } else {
                cb();
            }
        });
    };

    function push(branchName, cb) {
        plugins.git.push('origin', branchName, function (err) {
            if (err) {
                console.log('WARN: ' + err);
            }
            cb();
        });
    };

    function merge(branchName, cb) {
        plugins.git.merge(branchName, function (err) {
            if (err) {
                throw err
            } else {
                cb();
            }
        })
    };

    function removeLocal(branchName, cb) {
        plugins.git.branch(branchName, { args: '-d' }, function (err) {
            if (err) {
                throw err;
            } else {
                cb();
            }
        });
    };

    function removeRemote(branchName, cb) {
        plugins.git.push('origin', branchName, { args: '--delete' }, function (err) {
            if (err) {
                throw err;
            } else {
                cb();
            }
        });
    };

    function commitChanges(msgCommit, cb) {
        return gulp.src('.')
            .pipe(plugins.git.add())
            .pipe(plugins.git.commit(msgCommit, function (err) {
                if (err) {
                    console.log(err)
                }
                cb();
            }));
    }

    function createTag(nameTag, msgTag, cb) {
        plugins.git.tag(nameTag, msgTag, { args: '--force' }, function (error) {
            if (error) {
                return cb(error);
            }
            plugins.git.push('origin', 'master', { args: '--tags --force' }, cb);
        });
    }

    function createBranch(nameBranch, cb) {
        plugins.git.branch(nameBranch, function (err) {
            if (err) {
                throw err;
            } else {
                cb();
            }
        })
    }
})();