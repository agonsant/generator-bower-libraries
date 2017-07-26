'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the groovy ' + chalk.red('generator-bower-libraries') + ' generator!'
    ));

    const prompts = [{
      type: 'input',
      name: 'componentName',
      message: 'What is your bower component name?',
      default: this.appname
    },
    {
      type: 'input',
      name: 'author',
      message: 'What is the component author?',
      default: ''
    }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    var i = 0;
    var files = ['.eslintrc', 'bower.json', 'gulpfile.js', 'package.json', 'README.md', 'version.txt', 'config', 'npm-gulp-tasks', 'scss', 'src', 'test'];
    for (i = 0; i < files.length; i++) {
      this.fs.copyTpl(
        this.templatePath(files[i]),
        this.destinationPath(files[i]),
        { data: this.props }
      );
    }
    this.fs.copyTpl(
      this.templatePath('_gitignore'),
      this.destinationPath('.gitignore')
    );
  }

  install() {
    /*this.npmInstall();
    this.runInstall('bower');*/
  }
};
