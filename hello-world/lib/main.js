exports.main = function(options, callbacks) {
    const widgets = require("widget");
    widgets.add(widgets.Widget({
         label: "Widget with an image and a click handler",
         image: "http://reader.livedoor.com/favicon.ico",
         onClick: function(e){
            e.view.content.location = "http://reader.livedoor.com/reader/" 
         }
        })
    );
};
