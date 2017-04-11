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

//Paths
const project_dist = 'www';

const paths = {
    scripts: {
        dest: `${project_dist}/js`,
        origin: {
            internal_root: 'app/scripts',
            internal: [
                'app/scripts/script.js'
            ],
            external: [
            ]
        }
    },
    styles: {
        dest: `${project_dist}/css`,
        origin: {
            //SASS files
            internal: [
                'app/styles/style.scss'
            ],
            //CSS files from plugins
            external: [
            ]
        },
        origin_root: 'app/styles'
    },
    views: {
        dest: project_dist,
        origin: 'app/**/*.html'
    },
    images: {
        dest: `${project_dist}/images`,
        origin: 'app/images/*'
    }
}

//Tasks
gulp.task('styles', function() {
    const cssStream = gulp.src(paths.styles.origin.external);
    const sassStream = gulp.src(paths.styles.origin.internal).pipe(sass({
            outputStyle: 'compressed'
        })).on('error', sass.logError);

    return estream.merge(cssStream, sassStream)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write('.'))
        .pipe(bsync.stream({match: '**/*.css'}))
        .pipe(gulp.dest(paths.styles.dest))
});

gulp.task('scripts', function() {
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

gulp.task('compress', function(cb) {
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

gulp.task('views', function() {
    return gulp.src(paths.views.origin)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(bsync.stream({match: '**/*.html'}))
        .pipe(gulp.dest(paths.views.dest));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts.origin.internal_root + '/**/*.js', ['scripts']);
    gulp.watch(paths.styles.origin_root + '/**/*.scss', ['styles']);
    gulp.watch(paths.views.origin, ['views']);
});

gulp.task('serve', function() {
    bsync.init({
        server: {
            baseDir: `${project_dist}/`
        }
    });

    gulp.watch(paths.scripts.origin.internal_root + '/**/*.js', ['scripts']).on('change', bsync.reload);
    gulp.watch(paths.styles.origin_root + '/**/*.scss', ['styles']).on('change', bsync.reload);
    gulp.watch(paths.views.origin, ['views']).on('change', bsync.reload);
});

gulp.task('imagemin', function() {
    return gulp.src(paths.images.origin)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.images.dest));
});

gulp.task('uncss', function() {
    return gulp.src(paths.styles.dest + '/**/*.css')
        .pipe(uncss({
            html: [paths.views.dest + '/**/*.html']
        }))
        .pipe(gulp.dest(paths.scripts.dest));
});