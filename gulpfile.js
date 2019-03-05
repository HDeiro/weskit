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
const htmlmin = require('gulp-htmlmin');
const bsync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const cssmin = require('gulp-cssmin');
const htmlreplace = require('gulp-html-replace');
const runsequence = require('run-sequence');
const fs = require('fs');
const yargs = require('yargs').argv;
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const jsonmin = require('gulp-jsonmin');
const minifyInline = require('gulp-minify-inline');
const spritesmith = require('gulp.spritesmith');
const jimp = require('gulp-jimp');
const glob = require("glob");
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
        copy: "generate-metadata"
    },
    jsons: "jsons",
    views: "views",
    fonts: "fonts",
    sounds: "sounds",
	videos: "videos",
	images: "images",
	sprites: "sprites",
	icons: "icons",
	server: "server",
	production: "production",
	generateAll: "generate-all"
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
			skipSourceMapGeneration: true
        },
        "internal-critical": {
            buildTo: `${path_build}/js`,
			bundle: [],
			skipSourceMapGeneration: true
        },
        "internal": {
            buildTo: `${path_build}/js`,
            bundle: []
        },
        "external-critical": {
            buildTo: `${path_build}/js`,
            bundle: [],
			skipSourceMapGeneration: true
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
            bundle: [],
			skipSourceMapGeneration: true
        },
        "internal": {
            buildTo: `${path_build}/css`,
            bundle: []
        },
        "external-critical": {
            buildTo: `${path_build}/css`,
            bundle: [],
			skipSourceMapGeneration: true
        },
        "external": {
            buildTo: `${path_build}/css`,
            bundle: []
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
		},
		icons: {
			source: `${path_source}/images/pwa-icons/*.{jpg,png,jpeg,gif,svg}`,
			buildTo: `${path_build}/images/pwa-icons/`
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
gulp.task(tasks.js.bundler, done => {
    listBundle("js", yargs.bundle).forEach(bundle => {
        let bundleItem = paths.js[bundle];

        gulp.src(bundleItem.bundle)
            .pipe(gulpif(!bundleItem.skipSourceMapGeneration, sourcemaps.init()))
            .pipe(concat(`${bundle}.js`))
            .pipe(babel(JS_BABEL_CONFIG))
            .pipe(gulpif(MODE_PRODUCTION, uglify(JS_COMPRESS_OPTIONS)))
            .pipe(gulpif(!bundleItem.skipSourceMapGeneration, sourcemaps.write('.')))
            .pipe(bsync.stream({match: '**/*.js'}))
            .pipe(gulp.dest(`${bundleItem.buildTo}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[JS] Bundle ${bundleItem.buildTo}/${bundle}.js has been generated`)));
	});

	return done();
});

// CSS Bundler
gulp.task(tasks.css.bundler, done => {
    listBundle("css", yargs.bundle).forEach(bundle => {
        let bundleItem = paths.css[bundle];

        gulp.src(bundleItem.bundle)
            .pipe(gulpif(!bundleItem.skipSourceMapGeneration, sourcemaps.init()))
            .pipe(concat(`${bundle}.css`))
            .pipe(autoprefixer())
            .pipe(gulpif(MODE_PRODUCTION, cssmin()))
            .pipe(gulpif(!bundleItem.skipSourceMapGeneration, sourcemaps.write('.')))
            .pipe(bsync.stream({match: '**/*.css'}))
            .pipe(gulp.dest(`${bundleItem.buildTo}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[CSS] Bundle ${bundleItem.buildTo}/${bundle}.css has been generated`)))
	});

	return done();
});

// Sass Bundler
gulp.task(tasks.sass.bundler, done => {
    listBundle("sass", yargs.bundle).forEach(bundle => {
        let bundleItem = paths.sass[bundle];

        gulp.src(bundleItem.bundle)
            .pipe(gulpif(!bundleItem.skipSourceMapGeneration, sourcemaps.init()))
            .pipe(sass(SASS_CONFIG))
            .pipe(concat(`${bundle}.css`))
            .pipe(autoprefixer())
            .pipe(gulpif(MODE_PRODUCTION, cssmin()))
            .pipe(gulpif(!bundleItem.skipSourceMapGeneration, sourcemaps.write('.')))
            .pipe(bsync.stream({match: '**/*.css'}))
            .pipe(gulp.dest(`${bundleItem.buildTo}`))
            .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
            .on('end', _ => gutil.log(gutil.colors.green(`\t[SASS] Bundle ${bundleItem.buildTo}/${bundle}.css has been generated`)))
	});

	return done();
});

// JSON minifier
gulp.task(tasks.jsons, done => {
    gulp.src(paths.jsons.source)
        .pipe(jsonmin())
        .pipe(gulp.dest(paths.jsons.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
		.on('end', _ => gutil.log(gutil.colors.green(`\t[JSON] JSON files has been processed`)));

	return done();
})

// HTML compressor
gulp.task(tasks.views, done => {
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

	return done();
});

// Copy metadata
gulp.task(tasks.metadata.copy, done => {
    gulp.src(paths.metadata.source)
        .pipe(gulp.dest(paths.metadata.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
		.on('end', _ => gutil.log(gutil.colors.green(`\t[Metadata] Metadata files has been generated`)));

	return done();
});

// Copy fonts
gulp.task(tasks.fonts, done => {
    gulp.src(paths.fonts.source)
        .pipe(gulp.dest(paths.fonts.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
		.on('end', _ => gutil.log(gutil.colors.green(`\t[Font] Font files has been generated`)));

	return done();
});

// Copy sounds
gulp.task(tasks.sounds, done => {
    gulp.src(paths.sounds.source)
        .pipe(gulp.dest(paths.sounds.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
		.on('end', _ => gutil.log(gutil.colors.green(`\t[Sound] Sound files has been generated`)));

	return done();
});

// Copy videos
gulp.task(tasks.videos, done => {
    gulp.src(paths.videos.source)
        .pipe(gulp.dest(paths.videos.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
		.on('end', _ => gutil.log(gutil.colors.green(`\t[Video] Video files has been generated`)));

	return done();
});

// Image compression
gulp.task(tasks.images, done => {
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

	return done();
});

// Images sprites
gulp.task(tasks.sprites, done => {
	gulp.src(paths.images.sprites.source)
		.pipe(spritesmith({
			cssName: `generated-sprite.css`,
			imgName: 'generated-sprite.png'
		}))
		.pipe(gulp.dest(paths.images.sprites.buildTo))
		.on('end', _ => {
			gutil.log(gutil.colors.green(`\t[Sprite] Sprite image file has been generated`));
			gutil.log(gutil.colors.green(`\t[Sprite] Sprite SASS file has been generated`));
			gutil.log(gutil.colors.yellow(`\t[Sprite] Move and edit the ${paths.images.sprites.buildTo}/generated-sprite.css as you need`));
		});

	return done();
});

// Icons
gulp.task(tasks.icons, done => {
	gulp.src(paths.images.icons.source)
		.pipe(jimp({
			'-72x72': {resize: { width: 72, heigth: 72}},
			'-96x96': {resize: { width: 96, heigth: 96}},
			'-128x128': {resize: { width: 128, heigth: 128}},
			'-144x144': {resize: { width: 144, heigth: 144}},
			'-152x152': {resize: { width: 152, heigth: 152}},
			'-192x192': {resize: { width: 192, heigth: 192}},
			'-384x384': {resize: { width: 384, heigth: 384}},
			'-512x512': {resize: { width: 512, heigth: 512}},
			'-120x120': {resize: { width: 120, heigth: 120}},
			'-180x180': {resize: { width: 180, heigth: 180}}
		}))
		.pipe(gulp.dest(paths.images.icons.buildTo))
        .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
		.on('end', _ => gutil.log(gutil.colors.green(`\t[Icon] Icon files has been generated`)));

	return done();
});

// Server
gulp.task(tasks.server, () => {
	bsync.init({server: {baseDir: `${path_build}/`}});

	gulp.watch(`${path_source}/**/*.js`, [tasks.js.bundler]).on('change', bsync.reload);
	gulp.watch(`${path_source}/styles/**/*.css`, [tasks.css.bundler]).on('change', bsync.reload);
	gulp.watch(`${path_source}/styles/**/*.{scss,sass}`, [tasks.sass.bundler]).on('change', bsync.reload);
	gulp.watch(`${path_source}/**/*.{html,php}`, [tasks.views]).on('change', bsync.reload);
	gulp.watch(`${path_source}/**/*.json`, [tasks.jsons]).on('change', bsync.reload);
});

// Generate all assets
gulp.task(tasks.generateAll, done => {
	runsequence(
		tasks.js.bundler,
		tasks.css.bundler,
		tasks.sass.bundler,
		tasks.views,
		tasks.jsons,
		tasks.metadata.copy,
		tasks.fonts,
		tasks.sounds,
		tasks.videos,
		tasks.images,
		tasks.sprites,
		tasks.icons,
		done
	)
})

// Generate Production code
gulp.task(tasks.production, done => {
	// Fetch the critical JS
	new Promise(resolve => {
		glob(`${path_build}/js/*-critical.js`, {}, (err, files) => {
			let criticalJS = "<script id=\"critical-js\">" + files.reduce((content, file) => content += fs.readFileSync(file, 'utf8'), "") + "</script>";
			criticalJS.split('../').join(''); // Strip out all "../" to refer via index.html
			resolve(criticalJS)
		});
	}).then(criticalJS => new Promise(resolve => {
		glob(`${path_build}/css/*-critical.css`, {}, (err, files) => {
			let criticalCSS = "<style id=\"critical-css\">" + files.reduce((content, file) => content += fs.readFileSync(file, 'utf8'), "") + "</style>";
			criticalCSS.split('../').join(''); // Strip out all "../" to refer via index.html
			resolve({
				css: criticalCSS,
				js: criticalJS
			});
		});
	})).then(critical => {
		critical.sw =  `
			<script>
				if('serviceWorker' in navigator) {
					navigator.serviceWorker
						.register('pwa-cache-service-worker.js', { scope: '/' })
						.then(registration => console.log('The Cache Service Worker has been registered'));

					navigator.serviceWorker.ready
						.then(registration => console.log('Service Worker Ready'));
				}
			</script>
		`;

		// Replace code
		gulp.src(`${path_build}/index.{html,php}`)
			.pipe(htmlreplace(critical))
			.pipe(minifyInline())
			.pipe(htmlmin({
				collapseWhitespace: true,
				removeComments: true
			}))
			.pipe(gulp.dest(path_build))
			.on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
			.on('end', _ => gutil.log(gutil.colors.green(`\tProduction code has been sucessfully generated`)));
		done();
	});
});
