var gulp = require('gulp');
var swig = require('gulp-swig');

gulp.task('mail-templates', function () {
	gulp.src('./templates/swig/input/**/*.html')
		.pipe(swig({ ext: '.html', load_json: true, defaults: { cache: false }}))
		.pipe(gulp.dest('./templates/swig/output'));
});

gulp.task('watch', function () {
	gulp.watch('./templates/swig/input/**', function () {
		gulp.run('mail-templates');
	});
});
