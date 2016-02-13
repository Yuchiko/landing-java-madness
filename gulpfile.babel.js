'use strict';

import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import {output as pagespeed} from 'psi';
import rigger from 'gulp-rigger';
import concat from 'gulp-concat';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Autoprefixer Settings
const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];


const folders = {

  // Place files here
  src: {
    html: './src/*.html',
    js: './src/js/*.js',
    css: './src/styles/css/*.css',
    sass: './src/styles/sass/*.scss',
    img: 'src/images/**/*',
    fonts: './src/fonts/**/*.*'
  },
  // Folders for release
  release: {
    root: './release/',
    js: './release/js/',
    sass: './release/css/',
    css: './release/css/',
    img: './release/images/',
    fonts: './release/fonts/'
  },
  // Folders for dev
  dev: {
    root: './dev/',
    js: './dev/js/',
    css: './dev/css/',
    sass: './dev/sass/',
    img: './dev/images/',
    fonts: './dev/fonts/'
    },
  // Folders for watching
  watcher: {
    html: './src/**/*.html',
    js: './src/js/**/*.js',
    styles: './src/styles/**/*.*',
    img: './src/images/**/*.*',
    fonts: './src/fonts/**/*.*'
  },
  clean: ['.tmp', './dist/', '!dist/.git', './release', './dev/']
};


// Lint JavaScript
gulp.task('jshint', function() {
  gulp.src(folders.src.js)
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
      .on('error', function (error) {
          console.error('' + error);
      });
});

// Images Dev Task
gulp.task('images:dev', function() {
  gulp.src(folders.src.img)
      .pipe(gulp.dest(folders.dev.img))
      .pipe($.size({title: 'images'}))
      .on('error', function (error) {
          console.error('' + error);
      });
});

// Images Release Task With Images Optimization
gulp.task('images:release', function() {
  gulp.src(folders.src.img)
      .pipe($.cache($.imagemin({
        progressive: true,
        interlaced: true
      })))
      .pipe(gulp.dest(folders.release.img))
      .pipe($.size({title: 'images'}))
      .on('error', function (error) {
          console.error('' + error);
      });
});

// Copy all files at the root level
gulp.task('copy', function() {
  gulp.src([
    'src/*',
    '!src/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest(folders.release.root))
      .pipe($.size({title: 'copy'}))
      .on('error', function (error) {
          console.error('' + error);
      });
});

// Dev compile and automatically prefix stylesheets
gulp.task('styles:dev', function(){
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    folders.src.css,
    folders.src.sass
  ])
      .pipe($.newer('.tmp/styles'))
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        precision: 10
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe(gulp.dest('.tmp/styles'))
      .pipe($.if('*.css', $.concat('bundle.min.css')))
      .pipe($.sourcemaps.write())
      .pipe($.size({title: 'styles'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(folders.dev.css))
      .on('error', function (error) {
          console.error('' + error);
      });

});


// Compile and automatically prefix stylesheets
gulp.task('styles:release', function(){
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    folders.src.css,
    folders.src.sass
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.concat('bundle.min.css'), $.minifyCss()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(folders.release.css))
      .on('error', function (error) {
          console.error('' + error);
      });
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enables ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts:dev', function() {
  gulp.src(folders.src.js)
      .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      .pipe(rigger())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(folders.dev.js))
      .on('error', function (error) {
          console.error('' + error);
      });
});


// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enables ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts:release', function() {
  gulp.src(folders.src.js)
      .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      .pipe(rigger())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.uglify())
    // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(folders.release.js))
      .on('error', function (error) {
          console.error('' + error);
      });
});


gulp.task('fonts:dev', function() {
    gulp.src(folders.src.fonts)
        .pipe(gulp.dest(folders.dev.fonts))
        .on('error', function (error) {
            console.error('' + error);
        });
});

gulp.task('fonts:release', function() {
    gulp.src(folders.src.fonts)
        .pipe(gulp.dest(folders.release.fonts))
        .on('error', function (error) {
            console.error('' + error);
        });
});


gulp.task('html:dev', function () {
    return gulp.src(folders.src.html)
        // Use rigger
        .pipe(rigger())
        // Output files
        //.pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
        .pipe(gulp.dest(folders.dev.root))
        .on('error', function (error) {
            console.error('' + error);
        });
});

gulp.task('html:release', function () {
    gulp.src(folders.src.html)
        // Use rigger
        .pipe(rigger())
        // Minify any HTML
        .pipe($.if('*.html', $.minifyHtml()))
        // Output files
        .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
        .pipe(gulp.dest(folders.release.root))
        .on('error', function (error) {
            console.error('' + error);
        });
});

// Clean output directory
gulp.task('clean', function (cb) {
  del(folders.clean,
      {dot: true},
      cb)
});

// Watch files for changes & reload
gulp.task('serve:dev', ['dev'], function(){
  browserSync({
    notify: false,
    //tunnel: "kimikamikaze",
    // Customize the Browsersync console logging prefix
    logPrefix: 'BS LOG',
    // Allow scroll syncing across breakpoints
    //scrollElementMapping: ['body'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: folders.dev.root,
    port: 3000
  });

  gulp.watch([folders.watcher.html], ['html:dev', reload]);
  gulp.watch([folders.watcher.styles], ['styles:dev', reload]);
  gulp.watch([folders.watcher.js], ['jshint', 'scripts:dev', reload]);
  gulp.watch([folders.watcher.img], ['images:dev', reload]);
  gulp.watch([folders.watcher.fonts], ['fonts:dev', reload]);
});

// Build and serve the output from the dist build
gulp.task('serve:release', ['default'], function() {
  browserSync({
    notify: false,
    tunnel: "kimikamikaze",
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    //scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: folders.release.root,
    port: 3001
  })
});

// Build production files, the dev task.
// No uglifying, no minifying, no img optimizaition.
gulp.task('dev', ['clean'], function (cb) {
  runSequence(
      'styles:dev',
      [
          'jshint',
          'html:dev',
          'scripts:dev',
          'images:dev',
          'fonts:dev',
          'copy'
      ],
      'generate-service-worker',
      cb
  )
});

// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
  runSequence(
    'styles:release',
    [
        'jshint',
        'html:release',
        'scripts:release',
        'images:release',
        'fonts:release',
        'copy'
    ],
    'generate-service-worker',
    cb
  )
});

// Run PageSpeed Insights
gulp.task('pagespeed', function (cb) {
  // Update the below URL to the public URL of your site
  pagespeed('example.com', {
    strategy: 'mobile'
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb)
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'app' directory.
gulp.task('generate-service-worker', function() {
  const rootDir = 'dev';
  const filepath = path.join(rootDir, 'service-worker.js');

  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || 'web-starter-kit',
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      '${rootDir}/images/**/*',
      '${rootDir}/scripts/**/*.js',
      '${rootDir}/css/**/*.css',
      '${rootDir}/*.{html,json}'
    ],
    // Translates a static file path to the relative URL that it's served from.
    stripPrefix: path.join(rootDir, path.sep)
  });
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
