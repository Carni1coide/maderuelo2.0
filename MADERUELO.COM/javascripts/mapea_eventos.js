/* A More Accessible Map */

fundidoObjects = new Object();
fundidoTimers = new Object();

/* object - image to be faded (actual object, not name);
* destop - destination transparency level (ie 80, for mostly solid)
* rate - time in milliseconds between trasparency changes (best under 100)
* delta - amount of change each time (ie 5, for 5% change in transparency)
*/

function nereidFade(object, destOp, rate, delta){
//if (!document.all)
//return
//if (object != "[object]")
//{ //do this so I can take a string too
//setTimeout("nereidFade("+object+","+destOp+","+rate+","+delta+")",0);
//return;
//}

clearTimeout(fundidoTimers[object.sourceIndex]);
diff = destOp-object.filters.alpha.opacity;
direction = 1;
if (object.filters.alpha.opacity > destOp){
direction = -1;
}
delta=Math.min(direction*diff,delta);
object.filters.alpha.opacity+=direction*delta;
if (object.filters.alpha.opacity != destOp){
fundidoObjects[object.sourceIndex]=object;
fundidoTimers[object.sourceIndex]=setTimeout("nereidFade(fundidoObjects["+object.sourceIndex+"],"+destOp+","+rate+","+delta+")",rate);
}
}



var mapMaker = {
	offsetX: -16, // tooltip X offset
	offsetY: 16,  // tooltip Y offset
	element: false,
	DLs:     false,
	DTs:     false,
	on:      false,
	/* constructor - sets events */
	init: function(){
		var i=0;
		var ii=0;
		var currentLocation = 0;
		mapMaker.DLs = document.getElementsByTagName('dl');
		mapMaker.DTs = document.getElementsByTagName('dt');
		// only loop thru items once
		if( mapMaker.on == false ){
			//loop through each DL on page
			while (mapMaker.DLs.length > i) {
				//only affect DLs with a class of 'map'
				if (mapMaker.DLs[i].className == 'map'){
					//change map DL class, this way map is text only without javascript enabled
					mapMaker.DLs[i].className = 'map on';
					//remove any white space
					mapMaker.stripWhitespace(mapMaker.DLs[i]);
					mapMaker.stripWhitespace(mapMaker.DTs[i]);
					// loop thru all DT elements
					while (mapMaker.DTs.length > ii){
						//current Location
						currentLocation = mapMaker.DTs[ii].firstChild;
						// add events to links
						mapMaker.addEvt(currentLocation,'mouseover',mapMaker.showTooltip);//displays tooltip on mouse over
						mapMaker.addEvt(currentLocation,'mouseout',mapMaker.hideTooltip);//hide tooltip on mouse out
						mapMaker.addEvt(currentLocation,'focus',mapMaker.showTooltip);//display tooltip on focus, for added keyboard accessibility
						mapMaker.addEvt(currentLocation,'blur',mapMaker.hideTooltip);//hide tooltip on focus, for added keyboard accessibility
						ii++;
					};
					ii=0;
				};
				i++;
			};
			mapMaker.on = true;
		};
	},
	/* SHOW TOOLTIP */
	showTooltip: function() {
		var evt = this;
		var i = 0;
		//Find DD to display - based on currently hovered anchor move to parent DT then next sibling DD
		var objid = evt.parentNode.nextSibling;
		mapMaker.element = objid;//set for the hideTooltip
		//get width and height of background map
		var mapWidth  = objid.parentNode.offsetWidth;
		var mapHeight = objid.parentNode.offsetHeight;
		//get width and height of the DD
		var toopTipWidth = objid.offsetWidth;
		var toopTipHeight = objid.offsetHeight;
		//figure out where tooltip should be places based on point location
		var newX = evt.offsetLeft + mapMaker.offsetX;
		var newY = evt.offsetTop + mapMaker.offsetY;
		//check if tooltip fits map width 
		if ((newX + toopTipWidth) > mapWidth) {
			objid.style.left = newX-toopTipWidth-24 + 'px';
		} else {
			objid.style.left = newX + 'px';
		};
		//check if tooltip fits map height 
		if ((newY + toopTipHeight) > mapHeight) {
			objid.style.top = newY-toopTipHeight-14 + 'px';
		} else {
			objid.style.top = newY + 'px';
		};
	},
	/* HIDE TOOLTIP */
	hideTooltip: function() {
		mapMaker.element.style.left = '-9999px';
	},
	addEvt: function(element, type, handler) {
		// assign each event handler a unique ID
		if (!handler.$$guid) handler.$$guid = mapMaker.addEvt.guid++;
		// create a hash table of event types for the element
		if (!element.events) element.events = {};
		// create a hash table of event handlers for each element/event pair
		var handlers = element.events[type];
		if (!handlers) {
			handlers = element.events[type] = {};
			// store the existing event handler (if there is one)
			if (element["on" + type]) {
				handlers[0] = element["on" + type];
			};
		};
		// store the event handler in the hash table
		handlers[handler.$$guid] = handler;
		// assign a global event handler to do all the work
		element["on" + type] = mapMaker.handleEvent;
	},
	handleEvent: function(event) {
		var returnValue = true;
		// grab the event object (IE uses a global event object)
		event = event || mapMaker.fixEvent(window.event);
		// get a reference to the hash table of event handlers
		var handlers = this.events[event.type];
		// execute each event handler
		for (var i in handlers) {
			this.$$handleEvent = handlers[i];
			if (this.$$handleEvent(event) === false) {
				returnValue = false;
			};
		};
		return returnValue;
	},
	fixEvent: function(event) {
		// add W3C standard event methods
		event.preventDefault = mapMaker.fixEvent.preventDefault;
		event.stopPropagation = mapMaker.fixEvent.stopPropagation;
		return event;
	},
	stripWhitespace: function( el ){
		for(var i = 0; i < el.childNodes.length; i++){
			var node = el.childNodes[i];
			if( node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
				node.parentNode.removeChild(node);
			};
		};
	}
};
mapMaker.fixEvent.preventDefault = function() {this.returnValue = false;};
mapMaker.fixEvent.stopPropagation = function() {this.cancelBubble = true;};
mapMaker.addEvt.guid = 1;


/* LOAD SCRIPT */
	/* for Mozilla */
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", mapMaker.init, null);
		};
		
	/* for Internet Explorer */
		/*@cc_on @*/
		/*@if (@_win32)
			document.write("<script defer src=ie_onload.js><"+"/script>");
		/*@end @*/
		
	/* for other browsers */
		mapMaker.addEvt( window, 'load', mapMaker.init);


