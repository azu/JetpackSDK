var page = {};
var self = require("self");
var tabs = require("tabs");
var {Cc, Ci} = require("chrome");
// �y�[�W�ړ����ɔ�������
// http://d.hatena.ne.jp/cou929_la/20100301/1267434283
// http://piro.sakura.ne.jp/latest/blosxom/mozilla/xul/2007-01-21_splitbrowser-subbrowser.htm
var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Ci.nsIWindowMediator);
var mainWindow = wm.getMostRecentWindow("navigator:browser"); // gBrowser�̂��߂�
var myExtension = {
  // nsIWebProgress�C���^�t�F�[�X�̎���
  urlBarListener: {
    QueryInterface: function(aIID) {
      if (aIID.equals(Ci.nsIWebProgressListener) ||
          aIID.equals(Ci.nsISupportsWeakReference) ||
          aIID.equals(Ci.nsISupports))
        return this;
    },

    // ���݂̃^�u�̃h�L�������g��URI���ύX���ꂽ��R�[�������
    onLocationChange: function(aProgress, aRequest, aUri) {
      // myExtension.processNewUrl(aUri);
    },

    onStateChange : function(aWebProgress, aRequest, aStateFlags, aStatus) {
      const nsIWebProgressListener = Ci.nsIWebProgressListener;
      if (aStateFlags & nsIWebProgressListener.STATE_START &&
          aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
          // �ǂݍ��݊J�n���̏���
          playSound();
      }
      else if (aStateFlags & nsIWebProgressListener.STATE_STOP &&
               aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
          // �ǂݍ��݊������̏���
      }
    },
    onProgressChange: function() {},
    onStatusChange: function() {},
    onSecurityChange: function() {},
    onLinkIconAvailable: function() {}
  },

  // progress listener ��ǉ�����
  init: function() {
    mainWindow.gBrowser.addProgressListener(myExtension.urlBarListener, Ci.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  },

  // progress listener ���폜����
  uninit: function() {
    mainWindow.gBrowser.removeProgressListener(myExtension.urlBarListener);
  },

};
exports.main = function(options, callbacks) {
    var pageWorker = require("page-worker");
    page = pageWorker.Page({
        content: self.data.url("clicksound.html"),
        onReady: function() {
            myExtension.init();// �C�x���g�o�^
        }
    });
    pageWorker.add(page);
};

function playSound(){
    var soundObj = page.document.getElementById("clicksound");//page-worker�œ����Ă�html�ɂ���Audio�^�O������Ă���
//    soundObj.addEventListener("play" , function(){
//        console.log("played");
//    },false);
    soundObj.src = self.data.url("move.wav");
    soundObj.play();
}