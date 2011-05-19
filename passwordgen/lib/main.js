let widgets = require("widget");
let tabs = require("tabs");
let clipboard = require("clipboard");
let generateRandomString = require("random-string-generator").generateRandomString;
let pageMod = require("page-mod");
let self = require("self");
var port = (function() {
    // パスワードを生成して、返す
    function genaratePassword(length, useNumbers, useUpperCaseCharacters, additinals) {
        var password = generateRandomString(length, useNumbers, useUpperCaseCharacters, additinals);
        return password;
    }

    function insertPassToContent(password) {
        tabs.activeTab.attach({
            // jsファイルをロードして、引数を渡して実行
            contentScript: '(function(arg){'
                    + self.data.load('insert-pass.js')
                    + '})("' + password + '")'
        });
    }

    return {
        "genaratePassword" : genaratePassword,
        "insertPassToContent" : insertPassToContent
    }
})();

var widget = widgets.Widget({
    id: "efcl-passwordgen",
    label: "Password generator",
    contentURL: self.data.url('keyicon.png'),
    onClick: function() {
        var password = port.genaratePassword(12, true, true);
        // クリップボードにコピーする
        clipboard.set(password, "text");
        port.insertPassToContent(password);
    }
});