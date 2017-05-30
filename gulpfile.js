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
    sprites: 'sprites',
    css: 'css',
    js_concat: 'js',
    js_uglify: 'compress',
    html: 'views',
    html_replace: 'htmlreplace',
    watch: 'watch',
    server: 'server',
    images: 'images',
    production: 'production',
    clean: 'clean'
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

const project_dist = 'www';
const project_src = 'app';
const paths = {
    // JavaScripts
    scripts: {
        dest: `${project_dist}/js`,
        origin: {
            internal_root: `${project_src}/scripts`,
            internal: [
                `${project_src}/scripts/script.js`
            ],
            external: [
            ]
        }
    },
    // Styles (SASS/CSS)
    styles: {
        dest: `${project_dist}/css`,
        origin: {
            // SASS files
            internal: [
                `${project_src}/styles/style.{scss,sass}`
            ],
            // CSS files
            external: [
            ]
        },
        origin_root: `${project_src}/styles`
    },
    // Views
    views: {
        dest: project_dist,
        origin: `${project_src}/**/*.{html,php}`
    },
    // Images to be minified
    images: {
        dest: `${project_dist}/images`,
        origin: `${project_src}/images/**/*`,
        sprites_origins: `${project_src}/images/sprites/**/*`,
    },
    // Folders and files to be cleaned after development
    to_be_cleanded: [
        project_dist,
        'node_modules'
    ]
}


//####################################
// List of Gulp tasks
// 
// There's some gulp tasks to work
// with code concatenation, uglification,
// replaces and a lot of other possibilities
//####################################

gulp.task(tasks.css, () => {
    const cssStream = gulp.src(paths.styles.origin.external);
    const sassStream = gulp.src(paths.styles.origin.internal)
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .on('error', sass.logError);

    return estream.merge(cssStream, sassStream)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write('.'))
        .pipe(bsync.stream({match: '**/*.css'}))
        .pipe(gulp.dest(paths.styles.dest))
        .on('end', () => console.log(`SASS files has been concatenated and minifed`));
});

gulp.task(tasks.js_concat, () => {
    return gulp.src(paths.scripts.origin.external.concat(paths.scripts.origin.internal))
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(bsync.stream({match: '**/*.js'}))
        .pipe(gulp.dest(paths.scripts.dest))
        .on('end', () => console.log(`Listed origin and external JavaScript files has been concatenated`));
});

gulp.task(tasks.js_uglify, cb => {
    runsequence(tasks.js_concat, () => {
        const options = {
            preserveComments: 'license',
            compress: {
                drop_console: true
            }
        };
        
        pump([
            gulp.src(paths.scripts.dest + '/script.js'),
            uglify(options),
            rename('script.min.js'),
            gulp.dest(paths.scripts.dest)
        ], cb)
        .on('end', () => console.log(`${paths.scripts.dest}/script.js has been minified`));
    });
});

gulp.task(tasks.html, () => {
    return gulp.src(paths.views.origin)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            ignoreCustomComments: [
                /build:[a-zA-Z]{1,}/,
                /endbuild/,
            ]
        }))
        .pipe(bsync.stream({match: '**/*.{html,php}'}))
        .pipe(gulp.dest(paths.views.dest))
        .on('end', () => console.log(`${paths.views.origin} has been minified`));
});

gulp.task(tasks.watch, () => {
    gulp.watch(paths.scripts.origin.internal_root + '/**/*.js', [tasks.js_concat]);
    gulp.watch(paths.styles.origin_root + '/**/*.{sass,scss}', [tasks.css]);
    gulp.watch(paths.views.origin, [tasks.html]);
});

gulp.task(tasks.server, () => {
    bsync.init({
        server: {
            baseDir: `${project_dist}/`
        }
    });

    gulp.watch(paths.scripts.origin.internal_root + '/**/*.js', [tasks.js_concat]).on('change', bsync.reload);
    gulp.watch(paths.styles.origin_root + '/**/*.scss', [tasks.css]).on('change', bsync.reload);
    gulp.watch(paths.views.origin, [tasks.html]).on('change', bsync.reload);
});

gulp.task(tasks.images, () => {
    return gulp.src(paths.images.origin)
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true,
                optimizationLevel: 1 // Minimum 1 and Maximum 3
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5 // Minimum 0 and Maximum 7
            }),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true}
                ]
            })
        ]))
        .pipe(gulp.dest(paths.images.dest))
        .on('end', () => console.log(`${paths.images.dest} has now optimizated images from ${paths.images.origin}`));
});

gulp.task(tasks.sprites, () => {
    return sprity.src({
        src: `${paths.images.sprites_origins}.{png,jpg}`,
        style: `./sprites.scss`,
        processor: 'sass'
    }).pipe(gulpif(
        '*.png',
        gulp.dest(paths.images.dest),
        gulp.dest(paths.styles.origin_root)
    )).on('end', () => {
        console.log(`${paths.images.dest}/sprite.png has been created`);
        console.log(`${paths.styles.origin_root}/sprites.scss has been created`);
    })
});

gulp.task(tasks.html_replace, () => {
    runsequence(tasks.html, () => {
        let css = `${paths.styles.dest}/style.css`;
        let js = `${paths.scripts.dest}/script.js`;

        // Use gulp htmlreplace --xcss
        if(yargs.xcss) {
           // Take the content of CSS file and rip off all the "../" 
           // references to refer from the index.html
            css = fs.readFileSync(css, 'utf8').split('../').join('');
            css = `<style>${css}</style>`;
            console.log('Exchanged the CSS reference for the stylesheet content');
        }

        // Use gulp htmlreplace --xjs
        //
        // You can use like: gulp htmlreplace --xjs --xcss
        // to apply css and javascript replacement
        if(yargs.xjs) {
            //Take the content of JavaScript concatenated file and put it direct on body of index.html
            js = fs.readFileSync(js, 'utf8');
            js = `<script>${js}</script>`;
            console.log('Exchanged the JS reference for the script content');
        }

        // It takes all html/php files and apply the html
        // replacement. It's important to say that all the
        // files will have the same reference/content for
        // CSS or JavaScript.
        gulp.src(`${project_dist}/**/*.{html,php}`)
            .pipe(htmlreplace({
                'js': js,
                'css': css
            }))
            .pipe(gulp.dest(`${project_dist}/`))
            .on('end', () => {
                console.log('HTML replacement is done');
            });
    });
});

gulp.task(tasks.production, () => {
    runsequence(
        tasks.images,
        tasks.js_uglify, 
        tasks.css, 
        tasks.html_replace, 
        () => {
            console.log('The production task has finished.');
        }
    );
});

gulp.task(tasks.clean, () => {
    return gulp.src(paths.to_be_cleanded)
        .pipe(clean({ force: true }));
});