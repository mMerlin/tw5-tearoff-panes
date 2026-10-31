/*\
title: $:/plugins/aboratech/tearoff-panes/widgets/action-openinpane.js
type: application/javascript
module-type: widget

Action widget that opens a tiddler in a tear-off pane, or brings its
existing pane to the front if one is already open for that tiddler.

\*/
(function(){

"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var STATE_PREFIX = "$:/state/tearoff/";

var OpenInPaneWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
OpenInPaneWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
OpenInPaneWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
OpenInPaneWidget.prototype.execute = function() {
	this.actionTiddler = this.getAttribute("$tiddler") || this.getVariable("currentTiddler");
	this.makeChildWidgets();
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
OpenInPaneWidget.prototype.refresh = function(changedTiddlers) {
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
OpenInPaneWidget.prototype.invokeAction = function(triggeringWidget,event) {
	var title = this.actionTiddler;
	if(!title) {
		return true;
	}
	var stateTitle = STATE_PREFIX + title;
	if(this.wiki.tiddlerExists(stateTitle)) {
		// Already open: bring it to the front
		var maxZ = 0;
		this.wiki.each(function(tiddler,t) {
			if(t.indexOf(STATE_PREFIX) === 0) {
				maxZ = Math.max(maxZ,Number(tiddler.fields.z) || 0);
			}
		});
		this.wiki.setText(stateTitle,"z",undefined,String(maxZ + 1));
	} else {
		this.wiki.addTiddler(new $tw.Tiddler(this.wiki.getCreationFields(),{
			title: stateTitle,
			list: [title],
			x: "80",
			y: "80",
			w: "480",
			h: "360",
			z: "10"
		}));
	}
	return true; // Action was invoked
};

exports["action-openinpane"] = OpenInPaneWidget;

})();
