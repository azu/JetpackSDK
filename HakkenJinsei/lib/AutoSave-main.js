const self = require("self");
const widgets = require("statusbar");
const requests = require("request");
const timer = require("timer");
const tabs = require("tabs");

exports.main = function(options, callbacks) {
    var functionEnabled = false;
    var listener;
    var tab=tabs.activeTab;
    widgets.add(widgets.Widget({
        label: "人生発見",
        image: self.data.url("light-bulb-off-24.png"),
        onClick: function(e) {
            if(!tab) tab=tabs.activeTab;
            if (functionEnabled) {
                if (timeID){
                    timer.clearTimeout(timeID);
                }
                timeID = null;
                tab.onLoad.remove(listener);
                listener = null;
                tab = null;
                functionEnabled = false;
                e.view.content.location.href = "javascript:void (" + function(){
                    var doc = document;
                    var timerDiv = doc.getElementById("JP_move_timer");
                    if(timerDiv) doc.body.removeChild(timerDiv);//XPCNativeWrapperなので直接アクセスできない
                }+ ")()";
                this.image = self.data.url("light-bulb-off-24.png");
            } else {
                listener = startTimer(tab)
                tab.onLoad.add(listener);
                tab.location = getNextURL();// 初回
                functionEnabled = true;
                this.image = self.data.url("light-bulb-on-24.png");
            }
        }
    }));
};
var timeID; // タイマー
var viewServiceID;
var moveInterval = 60;// デフォルト60秒
var SITEINFO = [
    /* sample
    {
        name: "Wikipedia",
        url:  "http://ja.wikipedia.org/wiki/Special:Randompage",
    },
    */
    /* template
    {
        name: "",
        url : "",
    },
    */
    {
        name: "Wikipedia",
        url : "http://ja.wikipedia.org/wiki/Special:Randompage",
    },
    {
        name: "はてブ:最近の人気エントリ",
        url : "http://hatebu.ta2o.net/rj.cgi?jump=1",
    },
    {
        name: "はてブ:ここ数日の人気エントリ",
        url : "http://hatebu.ta2o.net/rj.cgi?jump=2",
    },
    {
        name: "ニコニコ大百科",
        url : "http://dic.nicovideo.jp/random",
    }
]
function startTimer(tab){
    /* .add .removeでイベントリスナーを付けられる
        しかしリスナーオブジェクトを作って他の関数からやろうとしてもremoveできなかった。
        tabs.activeTabが変化しているのかもしれない
    */
    return function() {
        var doc = tab.contentDocument;
        var win = tab.contentWindow;
        var timerDiv = doc.getElementById("JP_move_timer");
        if (timerDiv) return;
        var div = doc.createElement("div");
        div.id = "JP_move_timer";
        div.setAttribute("style", "font-size:12px!important;position:fixed;overflow:auto;z-index:18999;border:0;margin:0;padding:5px;bottom:0;right:0;background-color:#fff;-moz-border-radius:10px 0 0 0;opacity:0.7;");
        div.addEventListener("mouseover", function(e) {
            this.style.opacity = "1";
        },false);
        div.addEventListener("mouseout", function(e) {
            this.style.opacity = "0.7";
        },
        false);
        var sel = doc.createElement("select");
        var input = doc.createElement("input");
        input.value = moveInterval;
        input.addEventListener("keyup", function() {
            var t = this.value;
            if (/^\d+$/.test(t) && t > 5) {
                setMoveInterval(t);
            }
        },false);
        div.appendChild(input);
        var option = doc.createElement("option");
        option.value = "random";
        option.textContent = "ランダム";
        sel.appendChild(option);
        for (var i = 0, l = SITEINFO.length; i < l; i++)(function() {
            var option = doc.createElement("option")
            option.value = i;
            option.textContent = SITEINFO[i].name;
            if (i == viewServiceID) option.selected = true;
            sel.appendChild(option);
        })();
        sel.addEventListener('change', function() {
            var id = this.options[sel.selectedIndex].value;
            if (id !== "random") {
                setUsedServiceID(id);
            } else {
                setUsedServiceID(null);
            }
        },false);
        div.appendChild(sel);
        var nextBt = doc.createElement("Button");
        nextBt.textContent = "Next";
        nextBt.addEventListener("click", function() {
            if (timeID) timer.clearTimeout(timeID);
            timeID = null;
            tab.location = getNextURL();
        },
        false)
        div.appendChild(nextBt);
        doc.body.appendChild(div);
        autoScroll(tab.location);
        if (!timeID) {
            timeID = timer.setTimeout(function() {
                // console.log(getNextURL())
                timeID = null;
                tab.location = getNextURL();
            },moveInterval * 1000);
        }
    }
}
function autoScroll(win,doc){
    var scrolledPx = -1;
    var vs = 1;
    function scrolla() {
        win.scrollBy(0, vs);
        var scrPx = (doc.docElement && doc.documentElement.scrollTop) ? doc.documentElement.scrollTop : doc.body.scrollTop;
        if (scrolledPx == scrPx) {
            vs = (vs == 1) ? -1 : 1
        }
        scrolledPx = scrPx
        return timer.setTimeout(arguments.callee , 30);
    }
    var scrollID = scrolla();
    doc.body.addEventListener("click",function(){
        timer.clearTimeout(scrollID);
    },false);
}
function getMoveInterval(){
    return moveInterval;
}
function setMoveInterval(time){
    moveInterval = time;
}
function getUsedServiceID(){
    return viewServiceID;
}
function setUsedServiceID(id){
    viewServiceID = id;
}
// 次に飛ぶURLを返す
function getNextURL(){
    if(viewServiceID){
        return SITEINFO[viewServiceID].url;
    }else{
        return SITEINFO[Math.floor(Math.random () * SITEINFO.length)].url
    }
}