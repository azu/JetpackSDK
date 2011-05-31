const widgets = require("widget");
const tabs = require("tabs");
const Cc = require("chrome").Cc;
const Ci = require("chrome").Ci;
const self = require("self");
const contextMenu = require("context-menu");
const fbug = require("fbug").fbug;
const common_tokens = require("common_tokens").common_tokens;
const segment = require("tiny_segmenter_mod").segment;
var alc = {};
(function() {
    var db = null;// Database
    alc = {
        openDB : openDB,
        closeDB:closeDB,
        searchWord:searchWord,
        searchEntry:searchEntry,
        searchFull:searchFull,
        suggest:suggest
    }
    // Database
    function openDB(file) {
        //ファイルサービスの生成
        var file = Cc['@mozilla.org/file/local;1']
                .createInstance(Ci.nsILocalFile);
        file.initWithPath('C:\\Users\\azu\\Documents\\www\\eijiroDB\\database.db');
        //ストレージサービスの生成
        var storage = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService);
        //コネクションの生成
        db = storage.openDatabase(file);
    }

    function closeDB() {
        db && db.close();
    }

    function dbexecute(q, params, callback, failback) {
        try {
            let query = db.createStatement(q);
            for (var i = 0,len = params.length;
                 i < len;
                 i++) {
                var param = params[i];
                query.bindStringParameter(i, param);
            }
            var results = [];
            query.executeAsync({
                handleResult: function(aResultSet) {

                    var row = aResultSet.getNextRow();
                    row === 'undefined' && log(row);

                    for (var i = 0;
                         row;
                         i++,row = aResultSet.getNextRow()) {
                        var car = [];
                        var rowLenght = row.numEntries;// Indexの数
                        for (var j = 0,len = rowLenght;
                             j < len;
                             j++) {
                            car.push(row.getResultByIndex(j));
                        }
                        car && results.push(car);
                    }
                },

                handleError: function(aError) {
                    log("Error: " + aError.message);
                    failback && failback(aError);
                },

                handleCompletion: function(aReason) {
                    if (aReason != Ci.mozIStorageStatementCallback.REASON_FINISHED) {
                        log("Query canceled or aborted!");
                    } else {// finish
                        callback && callback(results)
                    }
                }
            });
            var count = 0;
            //            while (query.executeStep() && count++ != 2000) {
            //                log(query.getString(0))
            //            }
        } catch(err) {
            failback && failback(err);
            log("dbexecute: " + err);
        }
    }

    // wordとマッチするもの
    function searchWord(opt, callback) {
        var query = opt.query;
        var limit = opt.limit || default_limit || 20;
        var q = (query + '').replace(/[\x00-\x1f\x7f-\xa0]/g, '').toLowerCase();
        var t = Date.now();
        dbexecute(
                'SELECT raw FROM eijiro ' +
                        'WHERE entry = ? ' +
                        'LIMIT ?;',
                [q,limit],
                function sqlSuccess(res) {
                    //log('took ' + (Date.now() - t) + ' ms');
                    callback(res);
                },
                function sqlError(tx, err) {
                    if (callback) {
                        callback(rv);
                    }
                    //log(err);
                }
        );
    }

    // query
    function searchEntry(opt, callback) {
        var query = opt.query;
        var page = opt.page;
        // log([query, page].toString());
        var rv = {query:query, page:page, more:false, full:false, results:[]};
        var limit = opt.limit || default_limit || 20;
        var offset = (page - 1) * limit || 1;
        var q = (query + '').replace(/[\x00-\x1f\x7f-\xa0]/g, '').toLowerCase();
        var t = Date.now();
        dbexecute(
                'SELECT raw FROM eijiro ' +
                        'WHERE entry >= ? AND entry < ? ' +
                        'LIMIT ? OFFSET ?;',
                [q, nextWord(q), limit, offset],
                function sqlSuccess(res) {
                    //log('took ' + (Date.now() - t) + ' ms');
                    callback(res);
                },
                function sqlError(tx, err) {
                    if (callback) {
                        callback(rv);
                    }
                    log(err);
                }
        );
    }


    // segment is defined in tiny_segmenter_mod.js
    function tokenize(str) {
        tokenize.re_sep || (tokenize.re_sep = /[^一-龠々〆ヵヶぁ-んァ-ヴーｱ-ﾝﾞｰa-zA-Zａ-ｚＡ-Ｚ0-9０-９]+/g);
        var tokens = [];
        var segments = uniqAry(segment(str).map(function(s) {
            return s.replace(tokenize.re_sep, '')
        }));
        for (var i = 0, l = segments.length;
             i < l;
             i++) {
            var seg = segments[i];
            if (seg.length) {
                tokens.push(seg);
            }
        }
        return tokens;
    }

    // full entry search
    function searchFull(opt, callback) {
        var re_kanji = /[一-龠々〆ヵヶ]/;
        var query = opt.query;
        var page = opt.page || 1;
        var limit = opt.limit || default_limit || 10;
        var offset = (page - 1) * limit || 1;
        var rv = {query:query, page:page, more:false, full:true, results:[]};
        var tokens = tokenize(query.toLowerCase());
        var qtokens = '|' + tokens.join('|') + '|';
        var re_line = /■(.*?)(?:  ?{.*?})? : (.*)/;
        tokens = tokens.filter(function(c) {
            return !((c.length === 1 && !re_kanji.test(c)) || common_tokens[c] > 10000)
        })// opposite of "don't-index-condition"
                .sort(function(a, b) {
                    return (common_tokens[a] || 0) - (common_tokens[b] || 0)
                }); // sort by the least common order
        if (!tokens.length) {
            callback(rv);
        }
        // log([query, page, tokens[0], common_tokens[tokens[0]] || 0].toString());
        //log([tokens[0], '%' + likeEscape(query) + '%', '@', limit, offset]);
        var t = Date.now();
        dbexecute(
                'SELECT entry, raw FROM eijiro JOIN invindex USING(id) ' +
                        'WHERE token = ? AND coalesce(entry, raw) LIKE ? ESCAPE ? LIMIT ? OFFSET ?;',
                [tokens[0], '%' + likeEscape(query) + '%', '@', limit, offset],
                function sqlSuccess(res) {
                    //log('took ' + (Date.now() - t) + ' ms');
                    callback(res);
                },
                function sqlError(err) {
                    if (callback) {
                        callback(rv);
                    }
                    log(err);
                }
        );
    }

    function suggest(query, callback) {
        log('*' + query);
        var rv = [query, []];
        var q = (query + '').replace(/[\x00-\x1f\x7f-\xa0]/g, '').toLowerCase();
        var re_line = /■(.*?)(?:  ?{.*?})? : (.*)/;
        var re_ruby = /｛.*?｝/g;
        var t = Date.now();
        dbexecute(
                'SELECT raw FROM eijiro ' +
                        'WHERE entry >= ? AND entry < ? ' +
                        'LIMIT 10; ',
                [q, nextWord(q)],
                function sqlSuccess(res) {
                    //log('took ' + (Date.now() - t) + ' ms');
                    if (callback) {
                        callback(res);
                    }
                },
                function sqlError(err) {
                    if (callback) {
                        callback(rv);
                    }
                    log(err);
                }
        );
    }

    /* utils */
    function likeEscape(text) {
        return (text + '').replace(/@/g, '@@').replace(/%/g, '@%').replace(/_/g, '@_');
    }

    function nextWord(str) {// str is a non-empty string
        return str.substr(0, str.length - 1) + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
    }
})();

alc.openDB();
var myItem = contextMenu.Item({
    label: "My Mozilla Item",
    contentScript: '(function(arg) {'
            + self.data.load('widget/content-script.js')
            + '})()',
    onMessage: function (pageURL) {
        log(pageURL);
        self.postMessage("message");
    }
});

var contentRuby = {};
(function() {
    contentRuby = {
        parseDoc: parseDoc,
        replaceRuby: replaceRuby
    }

    function parseDoc() {
        var r = document.evaluate(
                './/text()',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
        );
        // contentRuby.cache = r;
        var i;
        var node;
        var text;
        var res = [];
        for (i = 0;
             i < r.snapshotLength;
             i++) {
            node = r.snapshotItem(i);
            res.push(node.textContent);
        }
        return res;
    }

    function replaceRuby(data) {
        console.log(arguments);
        data = arguments[0];
        console.log(data)
        var re_line = /■(.*?)(?:  ?{.*?})? : (.*)/;
        var reg = /[\s,.;:=@#<>\[\]{}()`'"!\/]/;
        var match;
        var left;
        var fragment;
        var text;
        var node;
        var r = document.evaluate(
                './/text()',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
        );
        var i;
        for (i = 0;
             i < r.snapshotLength;
             i++) {
            node = r.snapshotItem(i);
            text = node.textContent;
            fragment = document.createDocumentFragment();
            text.split(reg).map(function(s) {
                //console.log(typeof data[s] !== 'undefined' && data[s][0]);
                var ruby = typeof data[s] !== 'undefined' && typeof data[s][0] !== 'undefined' && data[s][0][0];
                if (ruby) {
                    // TODO : 単語抽出
                    //ruby = ruby.match(re_line)[2];
                    fragment.appendChild(createRuby(s, ruby));
                } else {
                    fragment.appendChild(document.createTextNode(s));
                }
            });

            fragment.appendChild(
                    document.createTextNode(" ")
            );
            node.parentNode.replaceChild(fragment, node);
        }
        function createRuby(text, annotation) {
            var span = document.createElement("span");
            var ruby = document.createElement("ruby");
            ruby.style.align = "center";
            var rp1 = document.createElement("rp");
            var rt = document.createElement("rt");
            rt.setAttribute("style", "max-width: 35px; text-indent: 3px; letter-spacing: 6px;");
            var rp2 = document.createElement("rp");
            rp1.appendChild(document.createTextNode("（"));
            rt.appendChild(document.createTextNode(annotation));
            rp2.appendChild(document.createTextNode("（"));
            ruby.appendChild(document.createTextNode(text));
            ruby.appendChild(rp1);
            ruby.appendChild(rt);
            ruby.appendChild(rp2);
            span.appendChild(ruby);
            return span;
        }
    }
})();
function evalInActiveTab(func, args, callback) {
    var argStr = JSON.stringify(args || []);
    tabs.activeTab.attach({
        contentScript:'var res = (' + func + ').apply(null,' + argStr + ');'
                + 'res && self.postMessage(res);',
        onMessage: function (data) {
            callback && callback(data);
        }
    })
}
function makequery(data) {
    // log("makequery", data);
    var t = Date.now();
    var result = {};
    var reg = /[\s,.;:=@#<>\[\]{}()`'"!\/]/;
    var tasks = data.map(function(s) {
        return s.split(reg);
    });
    tasks = Array.concat.apply(0, tasks);
    tasks = tasks.filter(function(element, index, array) {
        return element.length > 2 && array.indexOf(element) === index;
    });
    doQuery(tasks.pop());
    function doQuery(query) {
        alc.searchWord({
                    query: query,
                    limit : 1
                }, function(res) {
                    res && (result[query] = res);
                    if (tasks.length > 0) {
                        doQuery(tasks.pop());
                    } else {
                        log(Date.now() - t + "ms");
                        log([result]);
                        evalInActiveTab(contentRuby.replaceRuby, [result])
                    }
                });
    }
}

var widget = widgets.Widget({
    id: "mozilla-link",
    label: "Mozilla website",
    contentURL: "http://www.mozilla.org/favicon.ico",
    onClick: function(e) {
        evalInActiveTab(contentRuby.parseDoc, [], makequery);
    },
    onMessage: function(query) {
        if (query) {
            alc.searchWord({
                        query: query,
                        limit : 10
                    }, function(res) {
                        widget.port.emit("doc.set", res);
                    }
            )
        }
    }
});
//util functions

function uniqAry(ary) {
    return ary.reduce(function(memo, el, i) {
        if (0 == i || memo.indexOf(el) === -1) { // ソートされてないときはincludeで含んでいるかを調べる
            // memoにまだ無い要素だったらpushする
            memo[memo.length] = el;
        }
        return memo;
    }, []);// memoの初期値
}

function evalInPage(fun) {
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
            .getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
    var win = wm.content.window;
    win.location.href = "javascript:void (" + fun + ")()";
}

function log() {
    fbug.apply(this, arguments);
}
