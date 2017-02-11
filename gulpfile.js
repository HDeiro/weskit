var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var pump = require('pump');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');
var bsync = require('browser-sync').create();

//Paths
var paths = {
    scripts: {
        dest: 'dist/js',
        origin: {
            external: [
            ],
            internal_root: 'app/scripts',
            internal: [
                'app/scripts/script.js'
            ]
        }
    },
    styles: {
        dest: 'dist/css',
        origin: 'app/styles/style.scss',
        origin_root: 'app/styles'
    },
    views: {
        dest: 'dist',
        origin: 'app/**/*.html'
    }
}

//Tasks
gulp.task('styles', function() {
    return gulp.src(paths.styles.origin)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        })).on('error', sass.logError)
        .pipe(autoprefixer())
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
    var options = {
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
            collapseWhitespace: true
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
            baseDir: 'dist/'
        }
    });

    gulp.watch(paths.scripts.origin.internal_root + '/**/*.js', ['scripts'])
        .on('change', bsync.reload);
    gulp.watch(paths.styles.origin_root + '/**/*.scss', ['styles'])
        .on('change', bsync.reload);
    gulp.watch(paths.views.origin, ['views'])
        .on('change', bsync.reload);
});