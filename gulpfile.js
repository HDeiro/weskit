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
            "bundle": []
        },
        "external-critical": {
            "destination": `${path_build}/js`,
            "bundle": []
        },
        "external": {
            "destination": `${path_build}/js`,
            "bundle": []
        }
    },
    css: {
        "internal-critical": {
            "destination": `${path_build}/css`,
            "bundle": []
        },
        "internal": {
            "destination": `${path_build}/css`,
            "bundle": []
        },
        "external-critical": {
            "destination": `${path_build}/css`,
            "bundle": []
        },
        "external": {
            "destination": `${path_build}/css`,
            "bundle": []
        }
    }
}

//####################################
// Utilitary Functions
//####################################
const listBundle = (group, filter) => {
    return Object.keys(paths[group])
        .filter(bundle => paths[group][bundle].bundle.length)
        .filter(bundle => filter ? filter == bundle : true)
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
        gulp.src(paths.js[bundle].bundle)
            .pipe(concat(`${bundle}.js`))
            .pipe(babel({presets: ['es2015']}))
            .pipe(sourcemaps.write('.'))
            .pipe(bsync.stream({match: '**/*.js'}))
            .pipe(gulp.dest(`${paths.js[bundle].destination}`))
    });
});

// CSS Bundler

