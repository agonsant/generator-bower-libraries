var config = {
    paths : {
        context_path: '',
        index: 'src/index.html',
        js_src: ['src/*-lib.js','src/**/*-module.js','src/components/**/*-decorator.js','src/*-app.js','src/!(*-app.js)*js','src/components/**/!(*-module.js)*.js']
    },

    devUnitTestDependencies: [
        './bower_components/angular-mocks/angular-mocks.js'
    ],
    branches: {
        develop: 'develop',
        master: 'master'
    },
    release_types: {
        major: 'major',
        minor: 'minor',
        patch: 'patch'
    }
};

module.exports = config;
