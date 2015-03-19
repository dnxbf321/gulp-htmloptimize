# gulp-htmloptimize
构建 html 的 gulp 模块

## 用法

```js
var htmloptimize = require('gulp-htmloptimize');
gulp.task('htmloptimize', function() {
  return gulp.src('./**/*.html')
    .pipe(htmloptimize({}))
    .pipe(gulp.dest('./dist'));
});
```

## 优化哪些方面
1.  在合适的地方加上特定格式的html注释就能编译css、 js 文件
2.  编译css文件：
    * 支持 @import url(file.css)
    * 自动加浏览器厂商前缀，解决兼容性问题，使用 autoprefixer-core 库
    * 压缩、优化css，使用 clean-css 库
3.  编译js文件
    * 压缩混淆 js 代码，使用 uglify-js 库
4.  行内样式、js优化
5.  自定义配置（待支持）

## 文档
[wiki](https://github.com/dnxbf321/gulp-htmloptimize/wiki)

## LICENSE

[MIT License](https://github.com/dnxbf321/gulp-htmloptimize/blob/master/LICENSE)
