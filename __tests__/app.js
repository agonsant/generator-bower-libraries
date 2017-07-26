'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-bower-libraries:app', () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({someAnswer: true});
  });

  it('creates files', () => {
    assert.file(['.eslintrc', 'bower.json', 'gulpfile.js', 'package.json', 'README.md', 'version.txt', 'config', 'npm-gulp-tasks', 'scss', 'src', 'test']);
  });
});
