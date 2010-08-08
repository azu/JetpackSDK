const apiutils = require("api-utils");
const collection = require("collection");
const windowItems = require("window-items");

const EVENTS = {
  onClick: "click",
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
    content: {
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
  if (options.image) {
    this.__defineGetter__("image", function() options.image);
    this.__defineSetter__("image", function(image) {
      options.image = image;
      manager.updateItem(this, "image", image);
    });
  }
  if (options.content) {
    this.__defineGetter__("content", function() options.content);
    this.__defineSetter__("content", function(content) {
      options.content = content;
      manager.updateItem(this, "content", content);
    });
  }
  for (let method in EVENTS) {
    collection.addCollectionProperty(this, method);
    if (options[method]){
      this[method].add(options[method]);
    }
  }
  this.toString = function() {
    return '[object Statusbar-Widget "' + options.label + '"]';
  };
}

exports.Widget = apiutils.publicConstructor(Widget);

function getItemId(item) {
  return "oldgui_statusbar_" + require("self").id + "_" + item.id;
}

function getItemNode(win, item) {
  return win.document.getElementById(getItemId(item));
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

function setContent(iframe, content) {
  iframe.setAttribute("src", "data:text/html," + encodeURI(content))
};

function getStatusbar(win) {
  return win.document.getElementById("status-bar");
};

var manager = windowItems.Manager({
  onTrack: function(win, item) {
    let node = win.document.createElement("statusbarpanel");
    if(item.id) node.setAttribute("id", getItemId(item));
    if(item.label) node.setAttribute("tooltiptext", item.label);
    if(item.image) {
      node.setAttribute("class", "statusbarpanel-iconic");
      node.setAttribute("src", item.image);
    }else if(item.content) {
      node.height = "22px";
      node.maxWidth = "250px";
      let iframe = win.document.createElement("iframe");
      iframe.setAttribute("type", "content");
      iframe.setAttribute("transparent", "transparent");
      iframe.style.overflow = "hidden";
      setContent(iframe, item.content);
      node.appendChild(iframe);
    }
    addEventHandlers(node, item);
    getStatusbar(win).appendChild(node);
  },

  onUntrack: function(win, item) {
    let node = getItemNode(win, item);
    if(node) {
      getStatusbar(win).removeChild(node);
    }
  },

  onUpdate: function(win, item, property, value) {
    let node = getItemNode(win, item);
    if(node) {
      if(property == "label"){
        if(value){
          node.setAttribute("tooltiptext", value);
        }else{
          node.removeAttribute("tooltiptext");
        }
      }else if(property == "image"){
        node.setAttribute("src", value);
      }else if(property == "content"){
        setContent(node.firstChild, value);
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
