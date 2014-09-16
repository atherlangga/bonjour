// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint       = require('gulp-jshint');
var sass         = require('gulp-ruby-sass');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var rename       = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var include      = require('gulp-include');
var exec         = require('child_process').exec;
var sys          = require('sys');
var karma        = require('gulp-karma');

// Merchant CSS
var cssDir      = 'assets/css/main.scss',
    cssDirFiles = [cssDir,'assets/css/**/*.scss'];

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src(cssDir)
        .pipe(sass({ style:'compressed' }))
        .pipe(rename('style.css'))
        .pipe(gulp.dest('assets'));
});

// Merchant Javascript
var jsFile     = 'assets/js/main.js',
    jsDir      = 'assets/js/*.js',
    jsDestDir  = 'assets';
var cssHome = 'assets/css/home.scss';
var jsHome = 'assets/js/home.js';
var cssDashboard = 'assets/css/dashboard.scss';
var jsDashboard = 'assets/js/dashboard.js';

// Lint Task
gulp.task('lint', function() {
    return gulp.src(jsFile)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(jsFile)
        .pipe(include())
        //.pipe(uglify())
        .pipe(rename('script.js'))
        .pipe(gulp.dest(jsDestDir));
});

gulp.task('home-sass', function() {
    return gulp.src(cssHome)
        .pipe(sass({ style:'compressed' }))
        .pipe(rename('home.css'))
        .pipe(gulp.dest('assets'));
});

// Concatenate & Minify JS
gulp.task('home-scripts', function() {
    return gulp.src(jsHome)
        .pipe(include())
        //.pipe(uglify())
        .pipe(rename('home.js'))
        .pipe(gulp.dest(jsDestDir));
});

gulp.task('dashboard-sass', function() {
    return gulp.src(cssDashboard)
        .pipe(sass({ style:'compressed' }))
        .pipe(rename('dashboard.css'))
        .pipe(gulp.dest('assets'));
});

// Concatenate & Minify JS
gulp.task('dashboard-scripts', function() {
    return gulp.src(jsDashboard)
        .pipe(include())
        //.pipe(uglify())
        .pipe(rename('dashboard.js'))
        .pipe(gulp.dest(jsDestDir));
});

// Watch Files For Merchant Files Changes
gulp.task('watch', function() {
    gulp.watch(jsDir, ['lint', 'scripts','home-scripts','dashboard-scripts']);
    gulp.watch(cssDirFiles,{verbose:true}, ['sass','home-sass','dashboard-sass']);
});

// Buat task sendiri-sendiri untuk tiap bagian aplikasi
// gulp.task('client',['client-lint','client-sass','client-scripts','client-watch']);
// gulp.task('admin',['admin-lint','admin-sass','admin-scripts','admin-watch']);

gulp.task('home',['home-sass','home-scripts','watch']);


// Default Task
gulp.task('default', ['lint', 'sass', 'scripts','home-sass','home-scripts','dashboard-sass','dashboard-scripts','watch']);
