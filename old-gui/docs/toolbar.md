The `toolbar` module provides a way for extensions to create toolbar icons.

## Constructors ##

<tt>toolbar.**Widget**(*options*)</tt>

Creates a new widget. *options* is an object with
the following keys.  If any option is invalid, an exception is thrown.

<table>
  <tr>
    <td><tt>image</tt></td>
    <td>
      An optional string URL of an image from your package to use
      as the displayed content of the <tt>Widget</tt>.

      See the `self` module for directions on where in your package to store
      your static data files.
    </td>
  </tr>
  <tr>
    <td><tt>label</tt></td>
    <td>
      An optional string to use as the displayed text in the tooltip.
    </td>
  </tr>
  <tr>
    <td><tt>onClick</tt></td>
    <td>
      An optional function to be called when the <tt>Widget</tt> is clicked.
      It is called as <tt>onClick(<em>event</em>)</tt>. <em>event</em> is the 
      standard DOM event object.
    </td>
  </tr>
  <tr>
    <td><tt>onMouseover</tt></td>
    <td>
      An optional function to be called when the user passes the mouse
      over the <tt>Widget</tt>.
      
      It is called as <tt>onMouseover(<em>event</em>)</tt>. <em>event</em>
      is the standard DOM event object.
    </td>
  </tr>
  <tr>
    <td><tt>onMouseout</tt></td>
    <td>
      An optional function to be called when the mouse is no longer
      over the <tt>Widget</tt>.
      
      It is called as <tt>onMouseout(<em>event</em>)</tt>. <em>event</em>
      is the standard DOM event object.
    </td>
  </tr>
</table>

## Functions ##

<tt>statusbar.**add**(*Widget*)</tt>

Adds a widget to the toolbar palette.

<tt>statusbar.**remove**(*Widget*)</tt>

Removes a widget from the toolbar palette.

## Examples ##

    const toolbar = require("toolbar");
    const tabs = require("tabs");

    // A basic click-able image widget.
    toolbar.add(toolbar.Widget({
      image: "http://www.google.com/favicon.ico",
      label: "Go to google",
      onClick: function(e) tabs.open("http://www.google.com")
    }));
