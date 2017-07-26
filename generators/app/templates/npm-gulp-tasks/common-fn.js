(function () {

    var fs = require('fs');

    module.exports = {
        statusTask: statusTask,
        packageJson: packageJson
    }

    function statusTask(error, msg, done) {
        if (error) {
            console.log(error.message)
            return process.exit(2)
        } else {
            console.log(msg)
        }
        done();
    }

    function packageJson() {
        return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    }
})();