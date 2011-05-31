/**
 * Created by azu.
 * Date: 11/05/30 15:47
 * License: MIT License
 */
const Cc = require("chrome").Cc;
const Ci = require("chrome").Ci;
function fbug(x) {
    var args = Array.slice(arguments);
    var windowManager = Cc['@mozilla.org/appshell/window-mediator;1']
                        .getService(Ci.nsIWindowMediator);
    var {Firebug} = windowManager.getMostRecentWindow("navigator:browser");
    if (Firebug.Console.isEnabled() && Firebug.toggleBar(true, 'console')) {
        Firebug.Console.logFormatted(args);
    }
    return args.length > 1 ? args : args[0];
}
exports.fbug = fbug;