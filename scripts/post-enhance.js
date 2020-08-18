(function (doc) {
  function addHeaderAnchor() {
    var headers,
      i,
      j = 0,
      len = 0,
      postContainer = doc.getElementsByClassName("post-content")[0];
    if (!postContainer) return;
    for (i = 1; i < 7; i++) {
      headers = postContainer.getElementsByTagName("h" + i);
      for (len = headers.length, j = 0; j < len; j++) {
        headers[j].insertAdjacentHTML(
          "beforeend",
          '<a class="header-link" href="#' + headers[j].id + '">#</a>'
        );
      }
    }
  }

  function addPostMenus() {
    var postContainer = doc.getElementsByClassName("post-content")[0];
    if (!postContainer) return;
    var titles = postContainer.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (!titles || !titles.length) return;
    titles = [].slice.apply(titles);
    var htmlStr = '<ol class="post-menus';
    var childStr = '';
    var minLevel;
    for (var i = 0, len = titles.length; i < len; i++) {
      var title = titles[i];
      var level;
      var result = /H(\d+)/.exec(title.tagName);
      if (result) {
        level = +result[1];
      }
      if (minLevel === undefined) {
        minLevel = level;
      } else {
        if (minLevel > +level) {
          minLevel = level;
        }
      }
      childStr +=
        '<li class="post-menu-' +
        level +
        '"><a href="#' +
        title.id +
        '">' +
        title.innerText +
        "</a></li>";
    }
    htmlStr = htmlStr + ' min-level-' + minLevel + '">' + childStr + '</ol>'
    postContainer.insertAdjacentHTML("beforebegin", htmlStr);
  }

  doc.onreadystatechange = function () {
    if (doc.readyState !== "interactive") return; // 只在可交互过程中，添加链接，防止complete时再次添加
    addPostMenus();
    addHeaderAnchor();
  };
})(document);
