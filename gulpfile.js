const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
const eslint = require('gulp-eslint');
const stylelint = require('gulp-stylelint');
const cache = require('gulp-cache');
const sourcemaps = require('gulp-sourcemaps');
const svgmin = require('gulp-svgmin');
const accessibility = require('gulp-accessibility');

// Путь к файлам
const paths = {
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css/'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/'
  },
  images: {
    src: 'src/images/*',
    dest: 'dist/images/'
  },
  html: {
    src: 'src/**/*.html',
    dest: 'dist/'
  },
  fonts: {
    src: 'src/fonts/**/*',
    dest: 'dist/fonts/'
  }
};

// Задача для обработки SCSS
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Задача для обработки JS
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Задача для обработки изображений
async function images() {
  const imagemin = await import('gulp-imagemin');
  return gulp.src(paths.images.src)
    .pipe(cache(imagemin.default()))
    .pipe(gulp.dest(paths.images.dest));
}

// Задача для обработки HTML
function html() {
  return gulp.src(paths.html.src)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Задача для обработки шрифтов
function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

// Задача для линтинга скриптов
function lintScripts() {
  return gulp.src(paths.scripts.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Задача для линтинга стилей
function lintStyles() {
  return gulp.src(paths.styles.src)
    .pipe(stylelint({
      reporters: [{formatter: 'string', console: true}]
    }));
}

// Задача для обработки SVG
function svg() {
  return gulp.src('src/images/**/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest(paths.images.dest));
}

// Задача для проверки доступности
function accessibilityCheck() {
  return gulp.src('dist/*.html')
    .pipe(accessibility())
    .pipe(accessibility.report({formatter: 'text'}));
}

// Задача для очистки папки dist
async function clean() {
  const {deleteAsync: del} = await import('del'); // Импортируем del корректно
  return del(['dist/**/*']);
}

// Задача для запуска сервера
function serve() {
  browserSync.init({
    server: {baseDir: './dist'}
  });

  gulp.watch(paths.styles.src, gulp.series(styles, lintStyles));
  gulp.watch(paths.scripts.src, gulp.series(scripts, lintScripts));
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.html.src, html);
  gulp.watch('./dist/*.html').on('change', browserSync.reload);
}

// Задача по умолчанию
const build = gulp.series(clean, gulp.parallel(styles, scripts, images, html, fonts));
gulp.task('default', gulp.series(build, serve));
