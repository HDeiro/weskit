'use strict';

//####################################
// Lists of Gulp Plugins
//####################################

const gulp = require('gulp');
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
const sass = require('gulp-sass');
const minifyInline = require('gulp-minify-inline');
sass.compiler = require('node-sass');

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
    },
    sass: {
        bundler: 'sass'
    },
    views: "views"
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
            "buildTo": `${path_build}/js`,
            "bundle": []
        },
        "internal": {
            "buildTo": `${path_build}/js`,
            "bundle": []
        },
        "external-critical": {
            "buildTo": `${path_build}/js`,
            "bundle": []
        },
        "external": {
            "buildTo": `${path_build}/js`,
            "bundle": []
        }
    },
    css: {
        "external-critical": {
            "buildTo": `${path_build}/css`,
            "bundle": []
        },
        "external": {
            "buildTo": `${path_build}/css`,
            "bundle": []
        }
    },
    sass: {
        "internal-critical": {
            "buildTo": `${path_build}/css`,
            "bundle": []
        },
        "internal": {
            "buildTo": `${path_build}/css`,
            "bundle": []
        },
        "external-critical": {
            "buildTo": `${path_build}/css`,
            "bundle": []
        },
        "external": {
            "buildTo": `${path_build}/css`,
            "bundle": ['www/**/*.scss']
        }
    },
    views: {
        source: `${path_source}/**/*.{html,php}`,
        buildTo: `${path_build}`
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
const SASS_CONFIG = {
    outputStyle: "compressed"
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
            .pipe(gulp.dest(`${bundleItem.buildTo}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[JS] Bundle ${bundleItem.buildTo}/${bundle}.js has been generated`)))
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
            .pipe(gulp.dest(`${bundleItem.buildTo}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[CSS] Bundle ${bundleItem.buildTo}/${bundle}.css has been generated`)))
    });
});

// Sass Bundler
gulp.task(tasks.sass.bundler, _ => {
    listBundle("sass", yargs.bundle).forEach(bundle => {
        let bundleItem = paths.sass[bundle];

        gulp.src(bundleItem.bundle)
            .pipe(sourcemaps.init())
            .pipe(sass(SASS_CONFIG))
            .pipe(concat(`${bundle}.css`))
            .pipe(autoprefixer())
            .pipe(gulpif(MODE_PRODUCTION, cssmin()))
            .pipe(sourcemaps.write('.'))
            .pipe(bsync.stream({match: '**/*.css'}))
            .pipe(gulp.dest(`${bundleItem.buildTo}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[SASS] Bundle ${bundleItem.buildTo}/${bundle}.css has been generated`)))
    });
});

// HTML compressor
gulp.task(tasks.views, _ => {
    gulp.src(paths.views.source)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            ignoreCustomComments: [
                /build:[a-zA-Z]{1,}/,
                /endbuild/,
            ]
        }))
        .pipe(minifyInline())
        .pipe(bsync.stream({match: '**/*.{html,php}'}))
        .pipe(gulp.dest(paths.views.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
        .on('end', _ => gutil.log(gutil.colors.green(`\t[View] The views has been generated`)));
});