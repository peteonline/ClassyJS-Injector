var gulp = require('gulp'),
	concat = require('gulp-concat'),
	watch = require('gulp-watch'),
	uglify = require('gulp-uglify'),
	gzip = require('gulp-gzip'),
	rename = require('gulp-rename'),
	karma = require('gulp-karma'),
	bump = require('gulp-bump'),
	args = require('yargs').argv;

gulp.task('default', ['test'], function(){
	gulp.watch(['./src/**/*.js', '!./src/**/*Test.js']);
});

gulp.task('build', function(){
	gulp.src([
		'Shim.js',
		'./src/Injector.js'
	])
		.pipe(concat('injector.js'))
		.pipe(gulp.dest('./build/'))
		.pipe(uglify())
		.pipe(rename('injector.min.js'))
		.pipe(gulp.dest('./build/'))
		.pipe(gzip())
		.pipe(gulp.dest('./build/'));
});

gulp.task('test', function(){
	return gulp.src(['**/*invalid']).pipe(karma({
		configFile: 'karma.conf.js',
		action: 'watch'
	})).on('error', function(error) { console.error(error); });
});

gulp.task('bump', function(){
	var argsHolder = [];
	if (args.major) argsHolder.push('major');
	if (args.minor) argsHolder.push('minor');
	if (args.patch) argsHolder.push('patch');
	if (argsHolder.length == 0) {
		console.log('Please provide either --major, --minor or --patch');
		return;
	}
	if (argsHolder.length > 1) {
		console.log('Please only provide one bump type');
		return;
	}
	return gulp.src('./bower.json')
		.pipe(bump({type: argsHolder[0]}))
		.pipe(gulp.dest('./'));
});
