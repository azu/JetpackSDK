
var contentRuby = {};
(function() {
    contentRuby = {
        parseDoc: parseDoc,
        createRuby : createRuby
    }
    function parseDoc(doc) {
        var r = document.evaluate(
                './/text()',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
        );
        console.log(r.snapshotLength);
        var i;
        var node;
        var match;
        var left;
        var fragment;
        var text;
        for (i = 0;
             i < r.snapshotLength;
             i++) {
            node = r.snapshotItem(i);
            text = node.textContent;
            fragment = document.createDocumentFragment();
            console.log(text);

            //        fragment.appendChild(
            //                document.createTextNode(text.slice(left))
            //        );
            //        node.parentNode.replaceChild(fragment, node);
        }
    }

    function createRuby(text, annotation) {
        var ruby = document.createElement("ruby");
        var rp1 = document.createElement("rp");
        var rt = document.createElement("rt");
        var rp2 = document.createElement("rp");
        rp1.appendChild(document.createTextNode("（"));
        rt.appendChild(document.createTextNode(annotation));
        rp2.appendChild(document.createTextNode("（"));
        ruby.appendChild(document.createTextNode(text));
        ruby.appendChild(rp1);
        ruby.appendChild(rt);
        ruby.appendChild(rp2);
        return ruby;
    }
})();

self.on('click', function(text) {
    console.log(window.location.toString());
    contentRuby.parseDoc();
    self.postMessage("test");
});
self.on('message', function(text) {
    console.log(window.location.toString());
});
