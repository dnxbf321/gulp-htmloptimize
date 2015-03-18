# gulp-htmloptimize
构建 html 的 gulp 模块

## 使用方法

```js
var htmloptimize = require('gulp-htmloptimize');
gulp.task('htmloptimize', function() {
  return gulp.src('./**/*.html')
    .pipe(htmloptimize({}))
    .pipe(gulp.dest('./dist'));
});
```

## 做什么
1.  在合适的地方加上特定格式的html注释就能编译css、 js 文件
2.  编译css文件：
    * 支持 @import url(file.css)
    * 自动加浏览器厂商前缀，解决兼容性问题，使用 autoprefixer-core 库
    * 压缩、优化css，使用 clean-css 库
3.  编译js文件
    * 压缩混淆 js 代码，使用 uglify-js 库
4.  行内样式、js优化（待支持）
5.  自定义配置（待支持）

## 例子1
```
|
+- test
|   +- index.html
|   +- assets
|       +- js
|          +- a.js
|          +- b.js
|   +- css
|       +- a.css
|       +- b.css
+- dist
```

index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- build:css static/merge.css -->
  <link rel="stylesheet" href="css/a.css">
  <!-- endbuild -->
  <title>test</title>
</head>
<body>
  test body.
  <!-- build:js static/merge.js -->
  <script src="assets/js/a.js"></script>
  <script src="assets/js/b.js"></script>
  <!-- endbuild -->
</body>
</html>
```

a.css
```css
@import url(b.css);

body {
  height: 100px;

  background: #000;

  transform: scale(0.5);
}
```

b.css
```css
html {
  padding: 30px;
}
```

a.js
```js
(function(global, userAgent) {
  var isMobile = /mobile/i.test(userAgent);
  var browser = {
    ios: /iphone|ipod|ipad/i.test(userAgent),
    android: /android/i.test(userAgent),
    wechat: /micromessenger/i.test(userAgent),
    weibo: /weibo/i.test(userAgent)
  };
  global.browser = browser;
}(window, navigator.userAgent.toLowerCase()));
```

b.js
```js
console.log('hello world!');
```



####gulp task
```js
var htmloptimize = require('gulp-htmloptimize');
gulp.task('htmloptimize', function() {
  return gulp.src('./test/**/*.html')
    .pipe(htmloptimize({}))
    .pipe(gulp.dest('./dist'));
});
```


####output
```
|
+- test
|   +- index.html
|   +- assets
|       +- js
|          +- a.js
|          +- b.js
|   +- css
|       +- a.css
|       +- b.css
+- dist
|   +- index.html
|   +- static
|       +- merge.css
|       +- merge.js
```

dist/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="static/merge.css">
  <title>test</title>
</head>
<body>
  test body.
  <script src="static/merge.js"></script>
</body>
</html>
```

merge.css
```css
html{padding:30px}body{height:100px;background:#000;-webkit-transform:scale(.5);-ms-transform:scale(.5);transform:scale(.5)}
```

merge.js
```js
(function(e,t){var n=/mobile/i.test(t),r={"ios":/iphone|ipod|ipad/i.test(t),"android":/android/i.test(t),"wechat":/micromessenger/i.test(t),"weibo":/weibo/i.test(t)};e.browser=r})(window,navigator.userAgent.toLowerCase()),console.log("hello world!")
```

## 例子2 使用绝对路径

index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- build:css /static/merge2.css -->
  <link rel="stylesheet" href="/test/css/a.css">
  <!-- endbuild -->
  <title>test</title>
</head>
<body>
  test body.
  <!-- build:js /static/merge2.js -->
  <script src="/test/assets/js/a.js"></script>
  <script src="/test/assets/js/b.js"></script>
  <!-- endbuild -->
</body>
</html>
```

js、css文件同1

task同上

####output
dist/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/static/merge2.css">
  <title>test</title>
</head>
<body>
  test body.
  <script src="/static/merge2.js"></script>
</body>
</html>
```
js、css输出同1

## LICENSE

MIT License
