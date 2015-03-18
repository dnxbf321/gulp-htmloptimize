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