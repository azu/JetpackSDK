let widgets = require("widget");
let tabs = require("tabs");
let clipboard = require("clipboard");
let generateRandomString = require("random-string-generator").generateRandomString;
let pageMod = require("page-mod");
let self = require("self");
var prefSet = require("simple-prefs");

var port = (function () {

    // パスワードを生成して、返す
    function genaratePassword(length, useNumbers, useUpperCaseCharacters, additinals) {
        var password = generateRandomString(length, useNumbers, useUpperCaseCharacters, additinals);
        return password;
    }

    function insertPassToContent(password) {
        tabs.activeTab.attach({
            // jsファイルをロードして、引数を渡して実行
            contentScript:'(function(arg){'
                    + self.data.load('insert-pass.js')
                    + '})("' + password + '")'
        });
    }

    return {
        "genaratePassword":genaratePassword,
        "insertPassToContent":insertPassToContent
    }
})();
// アドオンバーにアイコン表示
var widget = widgets.Widget({
    id:"efcl-passwordgen",
    label:"Password generator",
    contentURL:self.data.url('keyicon.png'),
    onClick:function () {
        var prefs = prefSet.prefs;
        var passLength = prefs.passLength,
                useNumbers = prefs.useNumbers,
                useUpperCaseCharacters = prefs.useUpperCaseCharacters,
                additionalCharacters = prefs.additionalCharacters.split("");
        var password = port.genaratePassword(passLength, useNumbers, useUpperCaseCharacters, additionalCharacters);
        // クリップボードにコピーする
        clipboard.set(password, "text");
        port.insertPassToContent(password);
    }
});
// 設定
var strPref = prefSet.prefs.stringPreference;
// define a generic prefs change callback
function onPrefChange(prefName) {
    console.log("The " + prefName +
            " preference changed, current value is: " +
            prefSet.prefs[prefName]
    );
}

prefSet.on("stringPreference", onPrefChange);