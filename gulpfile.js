var fs = require('fs');
var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var prettify = require('gulp-jsbeautifier');
var exit = require('gulp-exit');

/**
 * Launch tests
 */
gulp.task('test', function(){
  process.env.NODE_ENV = 'test';
  return gulp.src('./test/**/*.js', {read: false})
        .pipe(mocha({reporter: 'xunit-file'}))
        .pipe(exit());
});

/**
 * Jshint
 */
gulp.task('jshint', function() {
  return gulp.src(['./lib/**/*.js', './index.js', './test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});
