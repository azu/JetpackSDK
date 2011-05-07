var page = {};
var self = require("self");
var {Cc, Ci} = require("chrome");
// ページ移動時に反応する
// http://d.hatena.ne.jp/cou929_la/20100301/1267434283
// http://piro.sakura.ne.jp/latest/blosxom/mozilla/xul/2007-01-21_splitbrowser-subbrowser.htm
var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Ci.nsIWindowMediator);
var mainWindow = wm.getMostRecentWindow("navigator:browser"); // gBrowserのために
var myExtension = {
  // nsIWebProgressインタフェースの実装
  urlBarListener: {
    QueryInterface: function(aIID) {
      if (aIID.equals(Ci.nsIWebProgressListener) ||
          aIID.equals(Ci.nsISupportsWeakReference) ||
          aIID.equals(Ci.nsISupports))
        return this;
    },

    // 現在のタブのドキュメントのURIが変更されたらコールされる
    onLocationChange: function(aProgress, aRequest, aUri) {
      // myExtension.processNewUrl(aUri);
    },

    onStateChange : function(aWebProgress, aRequest, aStateFlags, aStatus) {
      const nsIWebProgressListener = Ci.nsIWebProgressListener;
      if (aStateFlags & nsIWebProgressListener.STATE_START &&
          aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
          // 読み込み開始時の処理
          playSound();
      }
      else if (aStateFlags & nsIWebProgressListener.STATE_STOP &&
               aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
          // 読み込み完了時の処理
      }
    },
    onProgressChange: function() {},
    onSecurityChange: function() {},
    onLinkIconAvailable: function() {}
  },

  // progress listener を追加する
  init: function() {
    mainWindow.gBrowser.addProgressListener(myExtension.urlBarListener, Ci.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  },

  // progress listener を削除する
  uninit: function() {
    mainWindow.gBrowser.removeProgressListener(myExtension.urlBarListener);
  },

};
exports.main = function(options, callbacks) {
    var pageWorker = require("page-worker");
    page = pageWorker.Page({
        content: self.data.url("audio.html"),
        onReady: function() {
            myExtension.init();// イベント登録
        }
    });
    pageWorker.add(page);
};

function playSound(){
    var soundObj = page.document.getElementById("clicksound");//page-workerで動いてるhtmlにあるAudioタグを取ってくる
//    soundObj.addEventListener("play" , function(){
//        console.log("played");
//    },false);
    soundObj.src = self.data.url("move.wav");
    soundObj.play();
}