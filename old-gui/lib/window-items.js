/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Jetpack.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Dietrich Ayala <dietrich@mozilla.com> (Original Author)
 *   Drew Willcoxon <adw@mozilla.com>
 *   Asukaze <mail@asukaze.net> (window-items.js)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const apiutils = require("api-utils");

function Manager(options){
  this.options = apiutils.validateOptions(options, {
    onTrack: {
      is: ["function", "null", "undefined"]
    },
    onUntrack: {
      is: ["function", "null", "undefined"]
    },
    onUpdate: {
      is: ["function", "null", "undefined"]
    },
  });
  this.items = [];
  this.windows = [];
  let windowTracker = new (require("window-utils").WindowTracker)(this);
  require("unload").ensure(windowTracker);
}

Manager.prototype = {
  id: 0,

  // Registers a window with the manager.  This is a WindowTracker callback.
  onTrack: function(window) {
    if (this._isBrowserWindow(window)) {
      if(this.options.onTrack){
        let callback = this.options.onTrack;
        this.items.forEach(function (item) callback(window, item));
      }
      this.windows.push(window);
    }
  },

  // Unregisters a window from the manager.  It's told to undo all 
  // modifications.  This is a WindowTracker callback.  Note that when
  // WindowTracker is unloaded, it calls onUntrack for every currently opened
  // window.  The browserManager therefore doesn't need to specially handle
  // unload itself, since unloading the browserManager means untracking all
  // currently opened windows.
  onUntrack: function(window) {
    if (this._isBrowserWindow(window)) {
      let i = this.windows.indexOf(window);
      if(i >= 0){
        this.windows.splice(i, 1)[0];
        if(this.options.onUntrack){
          let callback = this.options.onUntrack;
          this.items.reverse().forEach(function (item) callback(window, item));
        }
      }
    }
  },

  // Registers an item with the manager. It's added to the add-on bar of
  // all currently registered windows, and when new windows are registered it
  // will be added to them, too.
  addItem: function(item) {
    if(!item.id){
      item.id = ++(Manager.prototype.id);
    }
    this.items.forEach(function(it){
      if(it.id == item.id){
        throw new Error("The item " + item + " has already been added.");
      }
    });
    this.items.push(item);
    if(this.options.onTrack){
      let callback = this.options.onTrack;
      this.windows.forEach(function (w) callback(w, item));
    }
  },

  // Unregisters an item from the manager.  It's removed from the addon-bar
  // of all windows that are currently registered.
  removeItem: function browserManager_removeItem(item) {
    let idx = this.items.indexOf(item);
    if (idx == -1) {
      throw new Error("The item " + item + " has not been added " +
                      "and therefore cannot be removed.");
    }
    this.items.splice(idx, 1);
    if(this.options.onUntrack){
      let callback = this.options.onUntrack;
      this.windows.forEach(function (w) callback(w, item));
    }
  },

  // Updates the content of an item registered with the manager,
  // propagating the change to all windows.
  updateItem: function(item, property, value) {
    let idx = this.items.indexOf(item);
    if (idx == -1) {
      throw new Error("The item " + item + " cannot be updated because it is not currently registered.");
    }
    if(this.options.onUpdate){
      let callback = this.options.onUpdate;
      this.windows.forEach(function (w) callback(w, item, property, value));
    }
  },

  _isBrowserWindow: function(win) {
    let winType = win.document.documentElement.getAttribute("windowtype");
    return winType === "navigator:browser";
  }
};

exports.Manager = apiutils.publicConstructor(Manager);
