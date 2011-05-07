The `statusbar` module provides a way for extensions to create statusbar icons.

## Constructors ##

<api name="Widget">
@constructor {options}
  Creates a new widget.

@param options {object}
  An object with the following keys:

  @prop [label] {string}
    An optional string description of the widget used for accessibility
    and error reporting.

  @prop [tooltip] {string}
    An optional text to show when the user's mouse hovers over the widget.
    If not given, the `label` is used.

  @prop [content] {string}
    An optional string value containing the displayed content of the `Widget`.
    It contains raw HTML content.
    Widgets must either have a `content` property or an `image` property.

  @prop [image] {string}
    An optional string URL of an image from your package to use as the displayed
    content of the widget.  See the [`self`](#module/jetpack-core/self) module
    for directions on where in your package to store your static data files.
    Widgets must either have a `content` property or an `image` property.

  @prop [panel] {panel}
    An optional `Panel` to open when the user clicks on the widget.
    Note: If you also specify an `onClick` callback function,
    it will be called instead of the panel being opened.
    However, you can then show the panel from the `onClick`
    callback function by calling `panel.show()`.

  @prop [width] {integer}
    An optional width in pixels of the widget. This property can be updated after
    the widget has been created, to resize it. If not given, a default width is
    used.

  @prop [onClick] {callback}
    An optional function to be called when the widget is clicked. It is called
    as `onClick(event)`. `event` is the standard DOM event object.

  @prop [onMouseover] {callback}
    An optional function to be called when the user passes the mouse over the
    widget. It is called as `onClick(event)`. `event` is the standard DOM event
    object.

  @prop [onMouseout] {callback}
    An optional function to be called when the mouse is no longer over the
    widget. It is called as `onClick(event)`. `event` is the standard DOM event
    object.
</api>

## Functions ##

<api name="add">
@function
  Adds a widget to the statusbar.

@param widget {Widget}
  Widget to be added.
</api>

<api name="remove">
@function
  Removes a widget from the statusbar.

@param Widget {Widget}
  Widget to be removed.
</api>

## Examples ##

    const statusbar = require("statusbar");
    const tabs = require("tabs");

    // A basic click-able image widget.
    statusbar.add(statusbar.Widget({
      image: "http://www.google.com/favicon.ico",
      label: "Go to google",
      onClick: function(e) tabs.open("http://www.google.com")
    }));
