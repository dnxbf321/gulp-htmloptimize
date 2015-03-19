# gulp-htmloptimize
构建 html 的 gulp 模块

## 用法

```js
var htmloptimize = require('gulp-htmloptimize');
gulp.task('htmloptimize', function() {
  // 自定义配置
  var opts = {};
  return gulp.src('./**/*.html')
    .pipe(htmloptimize(opts))
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
5.  自定义配置


## options
```
opts = mergeObj({
    debug: false,
    root: process.cwd().replace(/\\/g, '/'),
    assetsDir: '',
    uglifyJs: {
      mangle: {
        except: ['require', 'exports', 'module']
      },
      code: {
        indent_level: 2
      }
    },
    autoprefixer: {
      safe: true,
      browsers: ['> 5%', 'last 3 versions', 'Firefox ESR', 'iOS >= 6', 'Android >= 4.0', 'ExplorerMobile >= 10']
    },
    cleanCss: {
      advanced: false,
      keepSpecialComments: 0,
      processImport: false,
      rebase: false
    }
  }, yourOpts);
```
<table>
  <tr>
    <td> debug </td>
    <td> 什么都不做，directly pipe </td>
  </tr>
  <tr>
    <td> root </td>
    <td> web项目根目录，大部分情况应当与package.json同级（tips：硬盘路径，使用path.resolve(process.cwd(), '../yourproject')获得） </td>
  </tr>
  <tr>
    <td> assetsDir </td>
    <td> 外联js、css文件存放目录，当html使用绝对路径引入js、css文件时，对应的真实文件路径是path.join(opts.root, opts.assetsDir, 'static_file_href') </td>
  </tr>
  <tr>
    <td> uglifyJs </td>
    <td> 见 [uglifyJs的配置](https://github.com/mishoo/UglifyJS) </td>
  </tr>
  <tr>
    <td> autoprefixer </td>
    <td> 见 [autoprefixer-core的配置](https://github.com/postcss/autoprefixer-core) </td>
  </tr>
  <tr>
    <td> cleanCss </td>
    <td> 见 [clean-css的配置](https://github.com/jakubpawlowicz/clean-css) </td>
  </tr>
</table>

## 文档
[wiki](https://github.com/dnxbf321/gulp-htmloptimize/wiki)

## LICENSE

[MIT License](https://github.com/dnxbf321/gulp-htmloptimize/blob/master/LICENSE)
