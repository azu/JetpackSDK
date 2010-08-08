const contextMenu = require("context-menu");
const windowItems = require("window-items");

exports.Item = contextMenu.Item;
exports.Menu = contextMenu.Menu;
exports.Separator = contextMenu.Separator;

function getItemId(item) {
  return "oldgui_tabbar_" + require("self").id + "_" + item.id;
}

function getItemNode(win, item) {
  return win.document.getElementById(getItemId(item));
}

function getTabContextMenu(win) {
  let gBrowser = win.document.getElementById("content");
  return gBrowser.tabContextMenu
      || gBrowser.mStrip.firstChild.nextSibling;
};

function createElement(win, item){
  let node = null;
  if(item instanceof contextMenu.Item) {
    node = win.document.createElement("menuitem");
  }else if(item instanceof contextMenu.Menu) {
    node = win.document.createElement("menu");
  }else if(item instanceof contextMenu.Separator) {
    node = win.document.createElement("menuseparator");
  }
  if(node) {
    if(item.id) node.setAttribute("id", getItemId(item));
    if(item.label) node.setAttribute("label", item.label);
    if(item.onClick) {
      node.addEventListener("command", function(e){
        item.onClick.apply(item, [e]);
      }, false);
    }
    if(item.items) {
      let menupopup = win.document.createElement("menupopup");
      item.items.forEach(function (c){
        menupopup.appendChild(createElement(win, c));
      });
      node.appendChild(menupopup);
    }
  }
  return node;
}

var manager = windowItems.Manager({
  onTrack: function(win, item) {
    getTabContextMenu(win).appendChild(createElement(win, item));
  },

  onUntrack: function(win, item) {
    let node = getItemNode(win, item);
    if(node) {
      getTabContextMenu(win).removeChild(node);
    }
  }
});

exports.add = function(item) {
  manager.addItem(item);
};

exports.remove = function(button) {
  manager.removeItem(button);
};
