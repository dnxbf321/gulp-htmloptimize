module.exports = function(opts) {
  var through = require('through2'),
    gutil = require('gulp-util'),
    glob = require('glob'),
    CleanCSS = require('clean-css'),
    autoprefixer = require('autoprefixer-core'),
    uglifyJs = require('uglify-js'),
    uglify = uglifyJs.uglify,
    parser = uglifyJs.parser,
    path = require('path'),
    fs = require('fs');

  var START_REG = /<!--\s*build:(\w+)\s*([^\s]+)\s*-->/gim,
    END_REG = /<!--\s*endbuild\s*-->/gim,
    JSFILE_REG = /<script\s+.*src=(?:"|')([^"']+?)(?:"|').*><\/script>/gi,
    CSSFILE_REG = /<link\s+.*href\s*=\s*(?:"|')([^"']+)(?:"|').*>/gi,
    IMPORT_REG = /@import\s*url\((?:'|")?([^\s]+)(?:'|")?\)[\s\;]?/gi;

  opts = mergeObj({
    root: process.cwd().replace(/\\/g, '/'),
    assetsDir: ''
  }, opts);

  function mergeObj(source1, source2) {
    var target = {};
    for (var key1 in source1) {
      target[key1] = source1[key1];
    }
    for (var key2 in source2) {
      target[key2] = source2[key2];
    }
    return target;
  }

  function resolveSrc(p, relativeDir) {
    switch (true) {
      case !path.isAbsolute(p):
        p = path.join(relativeDir, p);
        break;
      case p[0] === '/':
        p = path.join(opts.root, opts.assetsDir, p);
        break;
    }
    return path.resolve(p).replace(/\\/g, '/');
  }

  function relativeDest(p, base) {
    return p.replace(base, '').replace(opts.root, '').replace(/^\//i, '');
  }

  function getNewImports(filepath, content, included) {
    var newPaths = [];
    content.replace(IMPORT_REG, function(g, p) {
      p = resolveSrc(p, path.dirname(filepath));
      if (included.indexOf(p) === -1) {
        newPaths.push(p);
      }
    });
    return newPaths;
  }

  function concatSource(paths) {
    var source = '';
    for (var i = 0; i < paths.length; i) {
      var p = paths[i];

      if (glob.sync(p)[0] === undefined) {
        throw new gutil.PluginError('gulp-htmlbuild', 'file ' + p + ' not found\n');
      }

      var _source = fs.readFileSync(p).toString();

      // 支持 @import url(import.css)
      if (path.extname(p) === '.css') {
        var newPaths = getNewImports(p, _source, paths);

        // 推入paths数组，位置紧邻 i 前面
        if (newPaths.length) {
          Array.prototype.splice.apply(paths, [i, 0].concat(newPaths));
          continue;
        }
        _source = _source.replace(IMPORT_REG, '');
      }
      source += _source;
      i += 1;
    }
    return source;
  }

  /*
   * do autoprefixer, clean-css
   */
  function optimizeCss(source) {
    var ret = '';
    // autoprefixer
    ret = autoprefixer.process(source, {
      safe: true,
      browsers: ['> 2%', 'last 4 versions', 'Firefox ESR', 'iOS >= 6', 'Android >= 2.3', 'ExplorerMobile >= 10']
    }).css;
    // minify
    ret = new CleanCSS({
      advanced: false,
      keepSpecialComments: 0,
      processImport: false,
      rebase: false
    }).minify(ret).styles;

    return ret;
  }

  /*
   * do uglify
   */
  function optimizeJs(source) {
    var ret = '';
    ret = parser.parse(source);
    ret = uglify.ast_mangle(ret, {
      except: ['require', 'exports', 'module']
    });
    ret = uglify.ast_lift_variables(ret);
    ret = uglify.ast_squeeze(ret);
    ret = uglify.gen_code(ret, {
      'quote_keys': true
    });
    return ret;
  }

  function inlineOptimze() {

  }

  function Builder(file, push) {
    this.push = push;

    this.filebase = file.base.replace(/\\/g, '/');
    this.filepath = file.path.replace(/\\/g, '/');
    this.filedir = path.dirname(this.filepath).replace(/\\/g, '/');

    var result = this.analysis(file);
    this.pushHtmlFile(result.blocks).pushStaticFile(result.files);
  }

  Builder.prototype = {
    /*
     * 分析 html 代码
     * return {blocks: ['html代码块'], files: [{type: 'css', paths: ['static file path']}]}
     */
    analysis: function(file) {
      var sections = file.contents.toString().split(END_REG);

      var blocks = [],
        files = [];

      var self = this;

      sections.forEach(function(s) {
        if (s.match(START_REG)) {
          // s[0] html code
          // s[1] string 'css' or 'js'
          // s[2] string dest url
          // s[3] tags of link or script
          s = s.split(START_REG);
          blocks.push(s[0]);
          switch (s[1]) {
            case 'css':
              blocks.push('<link rel="stylesheet" href="' + s[2] + '">');
              break;
            case 'js':
              blocks.push('<script src="' + s[2] + '"></script>');
              break;
            default:
              throw new gutil.PluginError('gulp-htmlbuild', 'only build:css build:js accept\n');
          }
          var paths = self.matchContentPaths(s[1] === 'css' ? CSSFILE_REG : JSFILE_REG, s[3]);
          var source = concatSource(paths);
          files.push({
            type: s[1],
            dest: resolveSrc(s[2], self.filedir),
            source: source
          });
        } else {
          blocks.push(s);
        }
      });

      return {
        blocks: blocks,
        files: files
      }
    },
    matchContentPaths: function(reg, content) {
      var self = this;
      var paths = [];
      content.replace(reg, function(g, p) {
        p = resolveSrc(p, self.filedir);
        paths.push(p);
      });
      return paths;
    },
    pushHtmlFile: function(blocks) {
      var dest = relativeDest(this.filepath, this.filebase);
      var htmlFile = new gutil.File({
        path: dest,
        contents: new Buffer(blocks.join(''))
      });
      this.push(htmlFile);
      return this;
    },
    pushStaticFile: function(groups) {
      var self = this;
      groups.forEach(function(group) {
        var dest = relativeDest(group.dest, self.filebase);
        
        var optimizeFun = group.type === 'css' ? optimizeCss : optimizeJs;
        var optimized = optimizeFun(group.source);

        self.push(new gutil.File({
          path: dest,
          contents: new Buffer(optimized)
        }));
      });
      return this;
    }
  };

  return through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-htmlbuild', 'Streams are not supported!\n'));
      cb();
    } else if (file.isNull()) {
      cb(null, file);
    } else {
      try {
        new Builder(file, this.push.bind(this));
      } catch (e) {
        this.emit('error', e);
      } finally {
        cb();
      }
    }
  });
};