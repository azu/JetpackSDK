The `toolbar` module provides a way for extensions to create toolbar icons.

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
    An optional text to show as a button label. If not given, the `label` is used.

  @prop image {string}
    An required string URL of an image from your package to use as the displayed
    content of the widget.  See the [`self`](#module/jetpack-core/self) module
    for directions on where in your package to store your static data files.

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
  Adds a widget to the toolbar palette.

@param widget {Widget}
  Widget to be added.
</api>

<api name="remove">
@function
  Removes a widget from the toolbar palette.

@param Widget {Widget}
  Widget to be removed.
</api>

## Examples ##

    const toolbar = require("toolbar");
    const tabs = require("tabs");

    // A basic click-able image widget.
    toolbar.add(toolbar.Widget({
      image: "http://www.google.com/favicon.ico",
      label: "Go to google",
      onClick: function(e) tabs.open("http://www.google.com")
    }));
