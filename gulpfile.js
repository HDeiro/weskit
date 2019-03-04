'use strict';

//####################################
// Lists of Gulp Plugins
//####################################

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const pump = require('pump');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const bsync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const estream = require('event-stream');
const cssmin = require('gulp-cssmin');
const htmlreplace = require('gulp-html-replace');
const runsequence = require('run-sequence');
const clean = require('gulp-clean');
const fs = require('fs');
const yargs = require('yargs').argv;
const gulpif = require('gulp-if');
const sprity = require('sprity');
const gutil = require('gulp-util');

//####################################
// List of Gulp tasks
// 
// You can edit tasks names. For
// example: by default there's a css 
// task, but you can exchange the name
// as you want. You could call it as
// styles, and you use it like:
//
//      gulp styles
//####################################

const tasks = {
    js: {
        bundler: 'js'
    },
    css: {
        bundler: 'css'
    }
};

//####################################
// List of Gulp paths
// 
// You can rename the project folders
// as you want. For example, you could
// call the production folder as 'build'.
//
// You can also exchange the working
// project folders. For example, you
// can call your js folders as 
// 'JavaScripts' instead of 'js'
//####################################

const path_build = 'www';
const path_source = 'app';
const paths = {
    js: {
        "internal-critical": {
            "destination": `${path_build}/js`,
            "bundle": []
        },
        "internal": {
            "destination": `${path_build}/js`,
            "bundle": ['www/**/*.js']
        },
        "external-critical": {
            "destination": `${path_build}/js`,
            "bundle": ['www/**/*.js']
        },
        "external": {
            "destination": `${path_build}/js`,
            "bundle": ['www/**/*.js']
        }
    },
    css: {
        "internal-critical": {
            "destination": `${path_build}/css`,
            "bundle": ['www/**/*.css']
        },
        "internal": {
            "destination": `${path_build}/css`,
            "bundle": ['www/**/*.css']
        },
        "external-critical": {
            "destination": `${path_build}/css`,
            "bundle": ['www/**/*.css']
        },
        "external": {
            "destination": `${path_build}/css`,
            "bundle": ['www/**/*.css']
        }
    }
}

//####################################
// Global Variables
//####################################

const MODE_PRODUCTION = true;
const JS_COMPRESS_OPTIONS = {
    preserveComments: 'license',
    compress: {
        drop_console: true
    }
};
const JS_BABEL_CONFIG = {
    presets: ['@babel/env']
};

//####################################
// Utilitary Functions
//####################################

const listBundle = (group, filter) => {
    return Object.keys(paths[group])
        .filter(bundle => paths[group][bundle].bundle.length)
        .filter(bundle => filter ? filter == bundle : true);
}

//####################################
// List of Gulp tasks
// 
// There's some gulp tasks to work
// with code concatenation, uglification,
// replaces and a lot of other possibilities
//####################################

// JavaScript Bundler
gulp.task(tasks.js.bundler, _ => {
    listBundle("js", yargs.bundle).forEach(bundle => {
        let bundleItem = paths.js[bundle];

        gulp.src(bundleItem.bundle)
            .pipe(sourcemaps.init())
            .pipe(concat(`${bundle}.js`))
            .pipe(babel(JS_BABEL_CONFIG))
            .pipe(gulpif(MODE_PRODUCTION, uglify(JS_COMPRESS_OPTIONS)))
            .pipe(sourcemaps.write('.'))
            .pipe(bsync.stream({match: '**/*.js'}))
            .pipe(gulp.dest(`${bundleItem.destination}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[JS] Bundle ${bundleItem.destination}/${bundle}.js has been generated`)))
    });
});

// CSS Bundler
gulp.task(tasks.css.bundler, _ => {
    listBundle("css", yargs.bundle).forEach(bundle => {
        let bundleItem = paths.css[bundle];

        gulp.src(bundleItem.bundle)
            .pipe(sourcemaps.init())
            .pipe(concat(`${bundle}.css`))
            .pipe(autoprefixer())
            .pipe(gulpif(MODE_PRODUCTION, cssmin()))
            .pipe(sourcemaps.write('.'))
            .pipe(bsync.stream({match: '**/*.css'}))
            .pipe(gulp.dest(`${bundleItem.destination}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[CSS] Bundle ${bundleItem.destination}/${bundle}.css has been generated`)))
    });
});
