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

//Paths
const project_dist = 'www';
const project_src = 'app';

const paths = {
    //JavaScripts
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
    //Styles (SASS/CSS)
    styles: {
        dest: `${project_dist}/css`,
        origin: {
            //SASS files
            internal: [
                `${project_src}/styles/style.{scss,sass}`
            ],
            //CSS files
            external: [
            ]
        },
        origin_root: `${project_src}/styles`
    },
    //Views
    views: {
        dest: project_dist,
        origin: `${project_src}/**/*.{html,php}`
    },
    //Images to be minified
    images: {
        dest: `${project_dist}/images`,
        origin: `${project_src}/images/**/*`
    },
    //Folders and files to be cleaned after development
    to_be_cleanded: [
        project_dist,
        'node_modules'
    ]
}

//Tasks
gulp.task('styles', () => {
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
});

gulp.task('scripts', () => {
    return gulp.src(paths.scripts.origin.external.concat(paths.scripts.origin.internal))
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(bsync.stream({match: '**/*.js'}))
        .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('compress', cb => {
    const options = {
        preserveComments: 'license'
    };
    
    pump([
        gulp.src(paths.scripts.dest + '/*.js'),
        uglify(options),
        rename('scripts.min.js'),
        gulp.dest(paths.scripts.dest)
    ], cb);
});

gulp.task('views', () => {
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
        .pipe(gulp.dest(paths.views.dest));
});

gulp.task('watch', () => {
    gulp.watch(paths.scripts.origin.internal_root + '/**/*.js', ['scripts']);
    gulp.watch(paths.styles.origin_root + '/**/*.{sass,scss}', ['styles']);
    gulp.watch(paths.views.origin, ['views']);
});

gulp.task('serve', () => {
    bsync.init({
        server: {
            baseDir: `${project_dist}/`
        }
    });

    gulp.watch(paths.scripts.origin.internal_root + '/**/*.js', ['scripts']).on('change', bsync.reload);
    gulp.watch(paths.styles.origin_root + '/**/*.scss', ['styles']).on('change', bsync.reload);
    gulp.watch(paths.views.origin, ['views']).on('change', bsync.reload);
});

gulp.task('imagemin', () => {
    return gulp.src(paths.images.origin)
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true,
                optimizationLevel: 1 //Minimum 1 and Maximum 3
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5 //Minimum 0 and Maximum 7
            }),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true}
                ]
            })
        ]))
        .pipe(gulp.dest(paths.images.dest));
});

gulp.task('uncss', () => {
    return gulp.src(paths.styles.dest + '/**/*.css')
        .pipe(uncss({
            html: [paths.views.dest + '/**/*.html']
        }))
        .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('htmlreplace', () => {
    gulp.src(`${project_dist}/index.html`)
        .pipe(htmlreplace({
            'js': 'js/script.min.js'
        }))
        .pipe(gulp.dest(`${project_dist}/`));
});

gulp.task('production', () => {
    runsequence('views', 'scripts', 'compress', 'styles', 'htmlreplace', () => {
        console.log('The production task has finished.');
    });
});

gulp.task('clean', () => {
    return gulp.src(paths.to_be_cleanded)
        .pipe(clean({ force: true }));
});