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
const gutil = require('gulp-util');
const jsonmin = require('gulp-jsonmin');
const minifyInline = require('gulp-minify-inline');
const spritesmith = require('gulp.spritesmith');
const sass = require('gulp-sass');
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
    metadata: {
        copy: "copy-metadata"
    },
    jsons: "jsons",
    views: "views",
    fonts: "fonts",
    sounds: "sounds",
	videos: "videos",
	images: "images",
	sprites: "sprites"
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
        "pwa-cache-service-worker": {
            buildTo: `${path_build}`,
            bundle: [`${path_source}/pwa-cache-service-worker.js`],
            options: {
                skipSourceMapGeneration: true
            }
        },
        "internal-critical": {
            buildTo: `${path_build}/js`,
            bundle: []
        },
        "internal": {
            buildTo: `${path_build}/js`,
            bundle: []
        },
        "external-critical": {
            buildTo: `${path_build}/js`,
            bundle: []
        },
        "external": {
            buildTo: `${path_build}/js`,
            bundle: []
        }
    },
    css: {
        "external-critical": {
            buildTo: `${path_build}/css`,
            bundle: []
        },
        "external": {
            buildTo: `${path_build}/css`,
            bundle: []
        }
    },
    sass: {
        "internal-critical": {
            buildTo: `${path_build}/css`,
            bundle: []
        },
        "internal": {
            buildTo: `${path_build}/css`,
            bundle: []
        },
        "external-critical": {
            buildTo: `${path_build}/css`,
            bundle: []
        },
        "external": {
            buildTo: `${path_build}/css`,
            bundle: ['www/**/*.scss']
        }
    },
    views: {
        source: `${path_source}/**/*.{html,php}`,
        buildTo: `${path_build}`
    },
    jsons: {
        source: `${path_source}/**/*.json`,
        buildTo: `${path_build}`
    },
    metadata: {
        source: [
            `${path_source}/humans.txt`,
            `${path_source}/robots.txt`
        ],
        buildTo: `${path_build}`
    },
    fonts: {
        source: [
            `${path_source}/fonts/**/*.{ttf,otf,eot,woff,svg,svgz}`,
            `${path_source}/fonts/*.{ttf,otf,eot,woff,svg,svgz}`
        ],
        buildTo: `${path_build}/fonts`
    },
    sounds: {
        source: [
            `${path_source}/sounds/**/*.{mp3,aac,wav,ogg}`,
            `${path_source}/sounds/*.{mp3,aac,wav,ogg}`
        ],
        buildTo: `${path_build}/sounds`
    },
    videos: {
        source: [
            `${path_source}/videos/**/*.{mp4,ogg,webm}`,
            `${path_source}/videos/*.{mp4,ogg,webm}`
        ],
        buildTo: `${path_build}/videos`
	},
	images: {
		compress: {
			source: `${path_source}/images/**/*.{jpg,png,jpeg,gif,svg}`,
			buildTo: `${path_build}/images`
		},
		sprites: {
			source: `${path_source}/images/sprites/*.{jpg,png,jpeg,gif,svg}`,
			buildTo: `${path_build}/images`
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
            .pipe(gulpif(!bundleItem.options.skipSourceMapGeneration, sourcemaps.init()))
            .pipe(concat(`${bundle}.js`))
            .pipe(babel(JS_BABEL_CONFIG))
            .pipe(gulpif(MODE_PRODUCTION, uglify(JS_COMPRESS_OPTIONS)))
            .pipe(gulpif(!bundleItem.options.skipSourceMapGeneration, sourcemaps.write('.')))
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
            .pipe(gulpif(!bundleItem.options.skipSourceMapGeneration, sourcemaps.init()))
            .pipe(concat(`${bundle}.css`))
            .pipe(autoprefixer())
            .pipe(gulpif(MODE_PRODUCTION, cssmin()))
            .pipe(gulpif(!bundleItem.options.skipSourceMapGeneration, sourcemaps.write('.')))
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
            .pipe(gulpif(!bundleItem.options.skipSourceMapGeneration, sourcemaps.init()))
            .pipe(sass(SASS_CONFIG))
            .pipe(concat(`${bundle}.css`))
            .pipe(autoprefixer())
            .pipe(gulpif(MODE_PRODUCTION, cssmin()))
            .pipe(gulpif(!bundleItem.options.skipSourceMapGeneration, sourcemaps.write('.')))
            .pipe(bsync.stream({match: '**/*.css'}))
            .pipe(gulp.dest(`${bundleItem.buildTo}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[SASS] Bundle ${bundleItem.buildTo}/${bundle}.css has been generated`)))
    });
});

// JSON minifier
gulp.task(tasks.jsons, () => {
    gulp.src(paths.jsons.source)
        .pipe(jsonmin())
        .pipe(gulp.dest(paths.jsons.buildTo));
})

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

// Copy metadata
gulp.task(tasks.metadata.copy, _ => {
    gulp.src(paths.metadata.source)
        .pipe(gulp.dest(paths.metadata.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
        .on('end', _ => gutil.log(gutil.colors.green(`\t[Metadata] Metadata files has been generated`)));
});

// Copy fonts
gulp.task(tasks.fonts, _ => {
    gulp.src(paths.fonts.source)
        .pipe(gulp.dest(paths.fonts.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
        .on('end', _ => gutil.log(gutil.colors.green(`\t[Font] Font files has been generated`)));
});

// Copy sounds
gulp.task(tasks.sounds, _ => {
    gulp.src(paths.sounds.source)
        .pipe(gulp.dest(paths.sounds.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
        .on('end', _ => gutil.log(gutil.colors.green(`\t[Sound] Sound files has been generated`)));
});

// Copy videos
gulp.task(tasks.videos, _ => {
    gulp.src(paths.videos.source)
        .pipe(gulp.dest(paths.videos.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
        .on('end', _ => gutil.log(gutil.colors.green(`\t[Video] Video files has been generated`)));
});

// Image compression
gulp.task(tasks.images, _ => {
	gulp.src(paths.images.compress.source)
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true, optimizationLevel: 2}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({plugins:[{removeViewBox: true}]})
		]))
		.pipe(gulp.dest(paths.images.compress.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
        .on('end', _ => gutil.log(gutil.colors.green(`\t[Image] Image files has been generated`)));
});
