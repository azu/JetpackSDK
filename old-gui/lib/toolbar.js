const apiutils = require("api-utils");
const collection = require("collection");
const storage = require("simple-storage").storage;
const windowItems = require("window-items");

const storageKey = "oldgui-toolbar-nav-bar-currentSet";

const EVENTS = {
  onClick: "command",
  onMouseover: "mouseover",
  onMouseout: "mouseout"
};

function Widget(options){
  options = apiutils.validateOptions(options, {
    label: {
      is: ["null", "undefined", "string"],
    },
    image: {
      is: ["null", "undefined", "string"],
    },
    onClick: {
      is: ["function", "array", "null", "undefined"],
    },
    onMouseover: {
      is: ["function", "array", "null", "undefined"],
    },
    onMouseout: {
      is: ["function", "array", "null", "undefined"],
    }
  });
  if (!(options.image || options.content)) {
    throw new Error("No image or content property found. Widgets must have one or the other.");
  }

  this.__defineGetter__("label", function() options.label);
  this.__defineSetter__("label", function(label) {
    options.label = label;
    manager.updateItem(this, "label", label);
  });
  this.__defineGetter__("image", function() options.image);
  this.__defineSetter__("image", function(image) {
    options.image = image;
    manager.updateItem(this, "image", image);
  });
  for (let method in EVENTS) {
    collection.addCollectionProperty(this, method);
    if (options[method]){
      this[method].add(options[method]);
    }
  }
  this.toString = function() {
    return '[object Toolbar-Widget "' + options.label + '"]';
  };
}

exports.Widget = apiutils.publicConstructor(Widget);

function getPalette(win) {
  return win.document.getElementById("navigator-toolbox").palette;
}

function getItemId(item) {
  return "oldgui_toolbar_" + require("self").id + "_" + item.id;
}

function getIndex(parent, id) {
  var childNodes = parent.childNodes;
  for (var i = 0; i < childNodes.length; ++i) {
    var c = childNodes[i];
    if(c.id == id){ return i; }
  }
  return -1;
}

function getItemNode(win, item) {
  var id = getItemId(item);
  var x = win.document.getElementById(id);
  if(x){ return x; }
  var palette = getPalette(win);
  var index = getIndex(palette, id);
  if(index >= 0) {
    return palette.childNodes[index];
  }
  return null;
}

function addEventHandlers(node, item) {
  for (let [method, type] in Iterator(EVENTS)) {
    for(let listener in item[method]) {
      node.addEventListener(type, function(e){
        listener.apply(item, [e]);
      }, false);
    }
  }
}

function ToolbarManager() {
  this.map = [];
  require("unload").ensure(this);
};

ToolbarManager.prototype = {
  restore: function(navBar, item){
    let currentSet = storage[storageKey];
    if(currentSet && currentSet.indexOf(getItemId(item)) >= 0){
      navBar.currentSet = currentSet;
    }
  },
  observe: function(navBar){
    if(this.map.some(function(e) e.target == navBar)){
      // already listening
      return;
    }
    let listener = function() {
       let currentSet = navBar.currentSet;
       // dirty fix
       currentSet = currentSet.replace(
         "urlbar-container,splitter,search-container",
         "urlbar-container,search-container");
       storage[storageKey] = currentSet;
    };
    this.map.push({ target: navBar, listener: listener });
    navBar.parentNode.addEventListener("aftercustomization", listener, false);
  },
  unload : function(){
    this.map.forEach(function(e){
      let toolbox = e.target.parentNode;
      let listener = e.listener;
      toolbox.removeEventListener("aftercustomization", listener, false);
    });
  }
};

var toolbarManager = new ToolbarManager();

var manager = windowItems.Manager({
  onTrack: function(win, item) {
    let node = win.document.createElement("toolbarbutton");
    if(item.id) node.setAttribute("id", getItemId(item));
    node.setAttribute("class", "toolbarbutton-1");
    if(item.label) {
      node.setAttribute("label", item.label);
      node.setAttribute("tooltiptext", item.label);
    }
    if(item.image) {
      node.setAttribute("style", "list-style-image: url('" + item.image + "');");
    }
    addEventHandlers(node, item);
    getPalette(win).appendChild(node);

    let navBar = win.document.getElementById("nav-bar");
    toolbarManager.restore(navBar, item);
    toolbarManager.observe(navBar);
  },

  onUntrack: function(win, item) {
    let node = getItemNode(win, item);
    if(node) {
      node.parentNode.removeChild(node);
    }
  },

  onUpdate: function(win, item, property, value) {
    let node = getItemNode(win, item);
    if(node) {
      if(property == "label"){
        if(value){
          node.setAttribute("label", value);
          node.setAttribute("tooltiptext", value);
        }else{
          node.removeAttribute("label");
          node.removeAttribute("tooltiptext");
        }
      }else if(property == "image"){
        node.setAttribute("style", "list-style-image: url('" + item.image + "');");
      }
    }
  }
});

exports.add = function(button) {
  manager.addItem(button);
};

exports.remove = function(button) {
  manager.removeItem(button);
};
