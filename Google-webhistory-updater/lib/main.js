let tabs = require("tabs");
let requests = require("request");
let simpleStorage = require("simple-storage");
exports.main = function(options, callbacks) {
    // 読み込み時のイベント登録
    tabs.on('ready', function(tab) {
        var location = parseUri(tab.url);
        sendToWebhistory(location);
    });
};
// 最近の履歴をローカル内で作る
function simpleHistory() {
    this.initialize.apply(this, arguments);
}
simpleHistory.prototype = {
    initialize: function(name, limit) {
        this.name = name;
        this.value = this.load() || [];
    },
    save :function(v) {
        simpleStorage.storage[this.name] = v;
    },
    load :function() {
        var v = simpleStorage.storage[this.name];
        if (v) {
            return v;
        } else {
            return false;
        }
    },
    record :function(hash) {
        this.value.push(hash);
        if (this.value && this.value.length > this.limit) {
            this.value.shift();
        }
        this.save(this.value);
    },
    // 同じものが既にあるかどうか
    check :function(target) {
        if (this.value) {
            return this.value.some(function(val) {
                return (val == target);
            });
        }
    }
}
function sendToWebhistory(location) {
    if (filteredURL(location)) {
        var url = getUrlToSendQueryFor(location.href).split("#")[0];
        var hash = awesomeHash(url);
        var query = "http://www.google.com/search?client=navclient-auto&ch=8" + hash + "&features=Rank&q=info:" + url;
        var hashHis = new simpleHistory("hash", 100);
        if (!hashHis.check(hash)) {// 既に送ってないかn件のうちで判定
            var request = requests.Request({
                url: query,
                onComplete: function() {
                    hashHis.record(hash);
                }
            });
            // GETメソッドで送信
            request.get();
        }
    }
}

function parseUri(str) {
    var o = parseUri.options,
            m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });
    uri.href = uri.source;
    return uri;
}

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};
// URLをフィルタリングする
function filteredURL(location) {
    if (location.href.substr(0, 4) != "http") {
        return;
    }
    if (location.host.indexOf(".") > 0 && !/[^\d\.:]+/.test(location.host)) {
        return;
    }
    return true;
}
// httpsは ホストのみ
function getUrlToSendQueryFor(b) {
    var c = b.match(/^https:\/\/[^\/]*[\/]?/i);
    if (c) return c[0];
    return b
}
function toHex8(b) {
    return (b < 16 ? "0" : "") + b.toString(16)
}
function hexEncodeU32(b) {
    var c = toHex8(b >>> 24);
    c += toHex8(b >>> 16 & 255);
    c += toHex8(b >>> 8 & 255);
    return c + toHex8(b & 255)
}

function awesomeHash(b) {
    for (var c = 16909125, d = 0; d < b.length; d++) {
        var HASH_SEED_ = "Mining PageRank is AGAINST GOOGLE'S TERMS OF SERVICE. Yes, I'm talking to you, scammer.";
        c ^= HASH_SEED_.charCodeAt(d % HASH_SEED_.length) ^ b.charCodeAt(d);
        c = c >>> 23 | c << 9
    }
    return hexEncodeU32(c)
}

