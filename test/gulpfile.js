var gulp = require('gulp'),
	htmlbuild = require('../index.js'),
	path = require('path');
gulp.src('test/**/*.html')
	.pipe(htmlbuild({}))
	.pipe(gulp.dest('./dist'));