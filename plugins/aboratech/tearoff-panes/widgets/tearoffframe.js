/*\
title: $:/plugins/aboratech/tearoff-panes/widgets/tearoffframe.js
type: application/javascript
module-type: widget

Generic draggable, resizable floating frame. Knows nothing about tiddler
content -- it reads/writes its own geometry (x, y, w, h, z) on the state
tiddler named by its `state` attribute, and renders its children into its
body. Closing deletes that state tiddler, which is also everything the
`$:/tags/PageTemplate` list in ui/manager.tid needs to know a pane exists.

\*/
(function(){

"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var TearoffFrameWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
TearoffFrameWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
TearoffFrameWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();

	this.frameDomNode = this.document.createElement("div");
	this.frameDomNode.className = "tc-tearoff-pane";

	var titlebar = this.document.createElement("div");
	titlebar.className = "tc-tearoff-pane-titlebar";

	var caption = this.document.createElement("span");
	caption.className = "tc-tearoff-pane-titlebar-caption";
	caption.textContent = this.getAttribute("caption",this.stateTitle);
	titlebar.appendChild(caption);

	var closeButton = this.document.createElement("span");
	closeButton.className = "tc-tearoff-pane-close";
	closeButton.textContent = "✕";
	closeButton.setAttribute("title","Close");
	titlebar.appendChild(closeButton);

	this.frameDomNode.appendChild(titlebar);

	this.bodyDomNode = this.document.createElement("div");
	this.bodyDomNode.className = "tc-tearoff-pane-body";
	this.frameDomNode.appendChild(this.bodyDomNode);

	parent.insertBefore(this.frameDomNode,nextSibling);
	this.domNodes.push(this.frameDomNode);

	this.applyGeometry();
	this.renderChildren(this.bodyDomNode,null);
	this.setupInteraction(titlebar,closeButton);
};

/*
Compute the internal state of the widget
*/
TearoffFrameWidget.prototype.execute = function() {
	this.stateTitle = this.getAttribute("state");
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
TearoffFrameWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.state || changedAttributes.caption) {
		this.refreshSelf();
		return true;
	}
	if(changedTiddlers[this.stateTitle]) {
		this.applyGeometry();
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Apply this pane's geometry fields to its DOM node. Safe to call repeatedly --
writing geometry we just read back from the same tiddler is a no-op.
*/
TearoffFrameWidget.prototype.applyGeometry = function() {
	var tiddler = this.wiki.getTiddler(this.stateTitle),
		fields = tiddler ? tiddler.fields : {};
	this.frameDomNode.style.left = (fields.x || "80") + "px";
	this.frameDomNode.style.top = (fields.y || "80") + "px";
	this.frameDomNode.style.width = (fields.w || "480") + "px";
	this.frameDomNode.style.height = (fields.h || "360") + "px";
	this.frameDomNode.style.zIndex = fields.z || "10";
};

TearoffFrameWidget.prototype.bringToFront = function() {
	var maxZ = 0;
	this.wiki.each(function(tiddler,t) {
		if(t.indexOf("$:/state/tearoff/") === 0) {
			maxZ = Math.max(maxZ,Number(tiddler.fields.z) || 0);
		}
	});
	this.wiki.setText(this.stateTitle,"z",undefined,String(maxZ + 1));
};

TearoffFrameWidget.prototype.setupInteraction = function(titlebar,closeButton) {
	var self = this,
		dragging = null;

	closeButton.addEventListener("click",function(event) {
		event.stopPropagation();
		self.wiki.deleteTiddler(self.stateTitle);
	});

	this.frameDomNode.addEventListener("pointerdown",function() {
		self.bringToFront();
	});

	titlebar.addEventListener("pointerdown",function(event) {
		if(event.target === closeButton) {
			return;
		}
		dragging = {
			startX: event.clientX,
			startY: event.clientY,
			originLeft: self.frameDomNode.offsetLeft,
			originTop: self.frameDomNode.offsetTop
		};
		titlebar.setPointerCapture(event.pointerId);
	});
	titlebar.addEventListener("pointermove",function(event) {
		if(!dragging) {
			return;
		}
		self.frameDomNode.style.left = (dragging.originLeft + (event.clientX - dragging.startX)) + "px";
		self.frameDomNode.style.top = (dragging.originTop + (event.clientY - dragging.startY)) + "px";
	});
	titlebar.addEventListener("pointerup",function() {
		if(!dragging) {
			return;
		}
		dragging = null;
		self.wiki.setText(self.stateTitle,"x",undefined,String(self.frameDomNode.offsetLeft));
		self.wiki.setText(self.stateTitle,"y",undefined,String(self.frameDomNode.offsetTop));
	});

	// Resize relies on native CSS `resize: both` (see ui/styles.tid); persist the
	// final size whenever a pointer interaction over the frame ends.
	this.frameDomNode.addEventListener("pointerup",function() {
		self.wiki.setText(self.stateTitle,"w",undefined,String(self.frameDomNode.offsetWidth));
		self.wiki.setText(self.stateTitle,"h",undefined,String(self.frameDomNode.offsetHeight));
	});
};

exports.tearoffframe = TearoffFrameWidget;

})();
