(function(doc) {
    doc.onreadystatechange = function () {
        if(doc.readyState !== "interactive") return;    // 只在可交互过程中，添加链接，防止complete时再次添加
        var headers, i, j=0,
            len = 0,
            postContainer = doc.getElementsByClassName('post-content')[0];
        if(!postContainer) return;
        for(i=1; i<7; i++) {
            headers = postContainer.getElementsByTagName('h' + i);
            for(len=headers.length, j=0; j<len; j++) {
                var anchor = document.createElement('a');
                anchor.className = 'header-link';
                anchor.href = '#' + headers[j].id;
                anchor.innerHTML = '#';
                headers[j].appendChild(anchor);
            }
        }
    }
})(document);