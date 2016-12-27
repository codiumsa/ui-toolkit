var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");

/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');
  
// Bower directory for build process
var bowerDirectory = path.join(rootDirectory, './bower');


var sourceFiles = [

  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),

  // Then add all JavaScript files
  path.join(sourceDirectory, '/**/*.js')
];

var cssFiles = [
  path.join(sourceDirectory, '/styles/main.scss'),
  path.join(sourceDirectory, '/**/*.css')
];

var themeCssFile = [path.join(sourceDirectory, '/styles/theme.scss')];

var htmlFiles = [
  path.join(sourceDirectory, '/views/**/*.html'),
];

var imgFiles = [
  path.join(sourceDirectory, '/images/**/*'),
];

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(sourceFiles);

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(concat('ui.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('ui.min.js'))
    .pipe(gulp.dest('./dist'));
  
  gulp.src(cssFiles)
    .pipe(concat('ui.scss'))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
  
  gulp.src(imgFiles)
    .pipe(gulp.dest('./dist/images/'));

  gulp.src(themeCssFile)
    .pipe(concat('ui.theme.scss'))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./dist'));

  gulp.src(htmlFiles)
    .pipe(minifyHtml({
        empty: true,
        spare: true,
        quotes: true
    }))
    .pipe(ngHtml2Js({
        moduleName: 'ui',
        prefix: 'views/'
    }))
    .pipe(concat('ui-views.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('views', function() {
  // Any other view files from app/views
  gulp.src('./views/*')
  // Will be put in the dist/views folder
  .pipe(gulp.dest('dist/views/'));
});

/**
 * Process
 */
gulp.task('process-all', function (done) {
  runSequence(/*'jshint',*/ 'test-src', 'build', 'views', done);
});

/**
 * Watch task
 */
gulp.task('watch', function () {

  // Watch JavaScript files
  gulp.watch(sourceFiles, ['process-all']);
});

/**
 * Validate source JavaScript
 */
/*gulp.task('jshint', function () {
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});*/

/**
 * Run test once and exit
 */
gulp.task('test-src', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-concatenated.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-minified.conf.js',
    singleRun: true
  }, done);
});

gulp.task('default', function () {
  runSequence('process-all', 'watch');
});
