/*	---------------------------------------------

	owl: Optimalworks Library
	(c) optimalworks.net

	core components:
		owl
		owl.RegEx
		owl.Number
		owl.String
		owl.Property

	--------------------------------------------- */

if (!owl) {
var owl = {};
owl.Version = 0.1;


/*	---------------------------------------------

	owl.Browser

	--------------------------------------------- */
owl.UserAgent = navigator.userAgent.toLowerCase();
owl.Browser = {
	IE: /msie/.test(owl.UserAgent) && !/opera/.test(owl.UserAgent),
	Mozilla: /mozilla/.test(owl.UserAgent) && !/(compatible|webkit)/.test(owl.UserAgent),
	Opera: /opera/.test(owl.UserAgent),
	Safari: /webkit/.test(owl.UserAgent),
	Konqueror: /konqueror/.test(owl.UserAgent)
};
owl.Browser.Version = owl.UserAgent.replace(/^.+[ox|ra|on|or][\/: ]/, "");
if (owl.Browser.Version.indexOf("msie") >= 0) owl.Browser.Version = owl.Browser.Version.replace(/^.+[ie][\/: ]/, "");
owl.Browser.Version = owl.Browser.Version.replace(/([^\d.].+$)/, "");
owl.Browser.VerNum = parseFloat(owl.Browser.Version);


/*	---------------------------------------------

	owl.Number

	--------------------------------------------- */
owl.Number = function() {

	var reNumeric = /[^0-9-.]/g;

	// to integer
	function toInt(obj) {
		var str = String(obj);
		str = str.replace(reNumeric, "");
		var ret = parseInt(str, 10);
		return (isNaN(ret) ? 0 : ret);
	}
	
	// sign - returns -1, 0 or 1
	function Sign(num) {
		if (isNaN(num)) num = 0;
		return (Math.min(1, Math.max(-1, num)));
	}

	// public
	return {
		toInt: toInt,
		Sign: Sign
	};

}();


/*	---------------------------------------------

	owl.String

	--------------------------------------------- */
owl.String = function() {

	var reTrim = /^\s*|\s*$/g;
	var reClean = /[^\w|\s|@|&|.|,|!|%|(|)|+|-]/g;
	var reWhitespace = /[_|\s]+/g;

	// string trim
	function Trim(str) { return String(str).replace(reTrim, ""); }

	// string clean
	function Clean(str) { return Trim(String(str).replace(reClean, "").replace(reWhitespace, " ")); }

	// string pad
	function Pad(str, length, chr) {
		str = String(str);
		length = owl.Number.toInt(length);
		if (typeof chr == 'undefined') chr = " ";
		else {
			chr = String(chr);
			if (chr.length < 1) chr = " ";
		}
		while (str.length < length) str = chr + str;
		return str;
	}

	// string format - replaces %0, %1 ... %n with values in the params array|string
	function Format(str, params) {
		if (typeof params == 'string') params = [params];
		if (params && params.length) {
			for (var p = 0, pl = params.length; p < pl; p++) str = str.replace(new RegExp("(^|[^%])%"+p+"([^0-9]|$)", "g"), "$1"+params[p]+"$2");
		}
		return str;
	}

	// public methods
	return {
		Trim: Trim,
		Clean: Clean,
		Pad: Pad,
		Format: Format
	};

}();


/*	---------------------------------------------

	owl.Array

	--------------------------------------------- */
if (owl && !owl.Array) owl.Array = function() {

	// is array
	function Is(array) { return !!(array && array.constructor == Array); }

	// push
	function Push(array, element) { array[array.length] = element; }

	// pop
	function Pop(array) {
		var ret = null;
		if (array.length > 0) {
			ret = array[array.length-1];
			array.length--;
		}
		return ret;
	}
	
	// make (array arr, default value/array def)
	function Make(arr, def) {
		return (arr ? (Is(arr) ? arr : [arr]) : (typeof def == "undefined" ? [] : (Is(def) ? def : [def])));
	}

	// public methods
	return {
		Is: Is,
		Push: Push,
		Pop: Pop,
		Make: Make
	};

}();


/*	---------------------------------------------

	owl.Each

	--------------------------------------------- */
owl.Each = function (obj, fn) {
	if (obj.length) for (var i = 0, ol = obj.length, v = obj[0]; i < ol && fn(v, i) !== false; v = obj[++i]);
	else for (var p in obj) if (fn(obj[p], p) === false) break;
};


/*	---------------------------------------------

	owl.Property

	--------------------------------------------- */
owl.Property = function() {

	// add owl namespace to element
	function owlNamespace(element) {
		if (!element.owlP) {
			element.owlP = {};
			element.owlP.length = 0;
		}
	}

	// add value to owl namespace (for one or more elements)
	function Set(element, name, value) {
		owl.Each(owl.Array.Make(element), function(e) {
			owlNamespace(e);
			e.owlP[name] = value;
			e.owlP.length++;
		});
	}

	// get value from owl namespace
	function Get(element, name) {
		return (Exists(element, name) ? element.owlP[name] : null);
	}

	// does value exist?
	function Exists(element, name) {
		return (element && element.owlP && typeof element.owlP[name] != "undefined");
	}

	// remove value and namespace if required
	function Delete(element, name) {
		owl.Each(owl.Array.Make(element), function(e) {
			if (e.owlP && e.owlP[name]) {
				delete e.owlP[name];
				e.owlP.length--;
				if (e.owlP.length == 0) e.owlP = null;
			}
		});
	}

	// public methods
	return {
		Set: Set,
		Get: Get,
		Exists: Exists,
		Delete: Delete
	};

}();


/*	---------------------------------------------

	owl.Object

	--------------------------------------------- */
owl.Object = function() {

	// property/method exists
	function Exists(object, item) { return (object && typeof object[item] != 'undefined'); }

	// property exists
	function PropertyExists(object, item) { var type = (object ? typeof(object[item]) : 'undefined'); return (type != 'undefined' && type != 'function'); }

	// method exists
	function MethodExists(object, item) { return (object && typeof object[item] == 'function'); }

	// serialize object properties (to JSON)
	function Serialize(obj) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {

			// simple data type
			if (t == "string") obj = '"'+obj+'"';
			return String(obj);

		}
		else {

			// recurse array or object
			var n, v, json = [], arr = owl.Array.Is(obj);

			for (n in obj) {
				v = obj[n]; t = typeof(v);

				if (t == "string") v = '"'+v+'"';
				else if (t == "object" && v !== null) v = owl.Object.Serialize(v);

				json.push((arr ? "" : '"' + n + '":') + String(v));
			}

			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	}

	// return a deserialize object from a JSON string
	function DeSerialize(serial) {
		if (serial === "") serial = '""';
		eval("var ret = " + serial + ";");
		return ret;
	}

	// public methods
	return {
		Exists: Exists,
		PropertyExists: PropertyExists,
		MethodExists: MethodExists,
		Serialize: Serialize,
		DeSerialize: DeSerialize
	};

}();


}/*	---------------------------------------------

	owl.Css

	--------------------------------------------- */
if (owl && !owl.Css) owl.Css = function() {


	// returns true if class applied to passed elements
	function ClassExists(elements, name) {
		var cfound = true;
		if (name) owl.Each(owl.Array.Make(elements), function(e) { var cn = " "+e.className+" "; cfound = (cn.indexOf(" "+name+" ") >= 0); return cfound; });
		return cfound;
	}


	// apply class to all elements
	function ClassApply(elements, name) {
		owl.Each(owl.Array.Make(elements),
			function(e) {
				var cn = " "+e.className+" ";
				if (cn.indexOf(" "+name+" ") < 0) {
					cn += name;
					e.className = owl.String.Trim(cn);
				}
			}
		);
	}


	// remove class from elements (pass name of "" to remove all classes)
	function ClassRemove(elements, name) {
		owl.Each(owl.Array.Make(elements),
			function(e) {
				var cn = "";
				if (name) {
					cn = " "+e.className+" ";
					cn = owl.String.Trim(cn.replace(new RegExp(" "+name+" ", "gi"), " "));
				}
				e.className = cn;
			}
		);
	}


	// set elements opacity (0 to 100). Set autoHide to false to keep visibility
	// IE5.5/6.0 elements require hasLayout and often a background colour
	function Opacity(elements, oVal, autoHide) {
		oVal = Math.min(Math.max(oVal, 0), 99.999999);
		var oValFrac = oVal / 100;
		owl.Each(owl.Array.Make(elements),
			function(e) {
				if (autoHide !== false) {
					if (e.style.visibility == "hidden") { if (oVal > 0) e.style.visibility = "visible"; }
					else { if (oVal == 0) e.style.visibility = "hidden"; }
				}
				e.style.opacity = oValFrac;
				e.style.MozOpacity = oValFrac;
				e.style.filter = "alpha(opacity:"+oVal+")";
				e.style.KHTMLOpacity = oValFrac;
			}
		);
	}
	
	
	// fetch the computed style of an element, e.g. element, "width"
	function ComputedStyle(element, rule) {
		var value = "";
		if (element) {
			if (document.defaultView && document.defaultView.getComputedStyle) value = document.defaultView.getComputedStyle(element, "").getPropertyValue(rule);
			else if (element.currentStyle) {
				rule = rule.replace(/\-(\w)/g, function(m,c) { return c.toUpperCase(); });
				value = element.currentStyle[rule];
			}
		}
		return value;
	}


	return {
		ClassExists: ClassExists,
		ClassApply: ClassApply,
		ClassRemove: ClassRemove,
		Opacity: Opacity,
		ComputedStyle: ComputedStyle
	};

}();


// prevent IE CSS background flickering
if (owl && owl.Browser && owl.Browser.IE && Math.floor(owl.Browser.VerNum) == 6) {
	try { document.execCommand("BackgroundImageCache", false, true); }
	catch(e) {};
}/*	---------------------------------------------

	owl.Dom

	--------------------------------------------- */
if (owl && owl.Css && !owl.Dom && document.getElementById && document.getElementsByTagName) owl.Dom = function() {

	// node types
	var ElementNode = 1;
	var AttributeNode = 2;
	var TextNode = 3;
	var CommentNode = 8;

	// regular expressions
	var CSSclean = /[^\w|\s|\-|#|\.|,|\[|\]|=|~|!|*]/g;
	var CSSwhitespace = /\s+/g;
	var reTag = /^[^#|\.|\[]*/;
	var reID = /#[^#|\.|\[]+/;
	var reClass = /\.[^#|\.|\[]+/;
	var reAttribute = /\[(.+)\]/;
	var reAttrExp = /([~|!|*]*=)/;
	var reAttrName = /(^[^=|~|!|*])+/;

	// array defaults
	var $A = owl.Array, doc = [document];

	// find a node collection
	function Get(css, nodes) {

		nodes = $A.Make(nodes, doc);
		css = owl.String.Trim(String(css).replace(CSSclean, "").replace(CSSwhitespace, " "));
		var allNodes = [], args = css.split(","), arg, exp, a, al, e, el;

		// all arguments
		for (a = 0, al = args.length; a < al; a++) {
			arg = owl.String.Trim(args[a]);
			var sNodes = nodes.slice();

			// all argument elements
			exp = arg.split(" ");
			for (e = 0, el = exp.length; e < el; e++) if (nodes.length > 0) sNodes = parseGet(exp[e], sNodes);
			owl.Each(sNodes, function(s) { $A.Push(allNodes, s); });
		}

		return allNodes;
	}

	// parse Get expression
	function parseGet(exp, nodes) {

		var nCollect = [], subnodes, tempnodes, n, nl, s, sl, t, tl;
		var nType = { Tag: '', ID: '', Class: '', AttribCheck: function() { return true; } };
		nType.Tag = reTag.exec(exp); nType.Tag = (nType.Tag ? nType.Tag[0].toLowerCase() : '*'); if (nType.Tag == "") nType.Tag = "*";
		nType.ID = reID.exec(exp); nType.ID = (nType.ID ? nType.ID[0].substr(1) : '');
		nType.Class = reClass.exec(exp); nType.Class = (nType.Class ? nType.Class[0].substr(1) : '');

		// attributes
		var attr = reAttribute.exec(exp);
		if (attr) {
			attr = attr[1];
			var aName, aValue = null, aExp = reAttrExp.exec(attr);
			aExp = (aExp ? aExp[1] : null);
			if (aExp) {
				var p = attr.indexOf(aExp);
				aName = attr.substr(0, p);
				aValue = attr.substr(p+aExp.length);
			}
			else aName = attr;

			nType.AttribCheck = function(node) {
				var a;
				switch (aName) {
					case "class": a = node.className; break;
					case "for": a = node.htmlFor; break;
					default: a = node.getAttribute(aName); break;
				}
				a = (a ? a : "");
				return (
					(a == '' && (!aExp || aExp == '!=')) || (!aExp || (
						(aExp == '=' && a == aValue) ||
						(aExp == '!=' && a != aValue) ||
						(aExp == '*=' && a.indexOf(aValue) >= 0) ||
						(aExp == '~=' && (" "+a+" ").indexOf(" "+aValue+" ") >= 0)
					))
				);
			};
		}

		// do all roots
		for (n = 0, nl = nodes.length; n < nl; n++) {

			subnodes = [];

			// ID passed
			if (nType.ID) {
				tempnodes = document.getElementById(nType.ID);
				if (tempnodes && (nType.Tag == '*' || tempnodes.nodeName.toLowerCase() == nType.Tag) && (!nType.Class || owl.Css.ClassExists(tempnodes, nType.Class)) && nType.AttribCheck(tempnodes) ) subnodes[0] = tempnodes;
			}
			else {
				// other types
				var checkNode = function(node) {
					return (
						(nType.Tag == "*" || node.nodeName.toLowerCase() == nType.Tag) &&
						(nType.Class == "" || owl.Css.ClassExists(node, nType.Class)) &&
						nType.AttribCheck(node)
					);
				};
				if (nType.Tag == "*") subnodes = Descendents(nodes[n], 0, checkNode);
				else {
					tempnodes = nodes[n].getElementsByTagName(nType.Tag);
					for (t = 0, tl = tempnodes.length; t < tl; t++) if (checkNode(tempnodes[t])) subnodes[subnodes.length] = tempnodes[t];
				}
			}

			// add subnodes to collection
			for (s = 0, sl = subnodes.length; s < sl; s++) nCollect[nCollect.length] = subnodes[s];
		}

		return nCollect;
	}


	// returns all descendent elements (to optional level n, e.g. 1 = immediate children and condition function)
	function Descendents(element, maxLevel, condition) {
		var recurseNodes = function(eNodes, level) {
			var cNodes = [], e, el, node;
			if (!level) level = 1;
			for (e = 0, el = eNodes.childNodes.length; e < el; e++) {
				node = eNodes.childNodes[e];
				if (node.nodeType == ElementNode && node.nodeName != "!") {
					if (!condition || condition(node)) cNodes[cNodes.length] = node;
					if (eNodes.childNodes.length > 0 && (!maxLevel || level < maxLevel)) cNodes = cNodes.concat(recurseNodes(node, level++));
				}
			}
			return cNodes;
		};

		element = $A.Make(element, doc);
		var nodes = [];
		owl.Each(element, function(e) { nodes = nodes.concat(recurseNodes(e)); });
		return nodes;
	}

	
	// find a node by type and work up parents until found
	function Ancestors(nodes, nodename) {
		var ret = [];
		nodename = (nodename.toLowerCase() || 'div');
		owl.Each($A.Make(nodes), function(n, i) {
			while (n.nodeName.toLowerCase() != nodename && n.parentNode) n = n.parentNode;
			ret[i] = (n.nodeName.toLowerCase() == nodename ? n : null);
		});
		if (!owl.Array.Is(nodes)) ret = ret[0];
		return ret;
	}
	

	// clones nodes (from, to, move nodes, clear original children)
	function Clone(nFrom, nTo, move, clear) {
		nFrom = $A.Make(nFrom, doc); nTo = $A.Make(nTo, doc);
		owl.Each(nTo, function(node, i) {
			if (clear) RemoveChildren(node);
			var nf = Math.min(i, nFrom.length-1);
			for (var t = 0, tl = nFrom[nf].childNodes.length; t < tl; t++) node.appendChild(nFrom[nf].childNodes[t].cloneNode(true));
			if (move) RemoveChildren(nFrom[nf]);
			else RemoveIDs(node);
		});
	}


	// remove child node IDs
	function RemoveIDs(nodes) {
		owl.Each($A.Make(nodes, doc), function(n) { Descendents(n, null, function(e) { if (e.id) e.removeAttribute('id'); return true; }) });
	}


	// remove child nodes
	function RemoveChildren(nodes) {
		owl.Each($A.Make(nodes, doc), function(n) { while (n.lastChild) n.removeChild(n.lastChild); });
	}


	// find text node (private)
	function FindTextNode(node) {
		var found = false;
		for (var c = 0, cl = node.childNodes.length; c < cl && !found; c++) found = ( node.childNodes[c].nodeType == TextNode ? node.childNodes[c] : FindTextNode(node.childNodes[c]) );
		return found;
	}


	// get or set text
	function Text(nodes, str) {
		var rep = (typeof str != 'undefined');
		str = (rep ? (typeof str == 'string' ? [str] : str) : "");
		owl.Each($A.Make(nodes, doc), function(node, i) {
			var tn = FindTextNode(node);
			if (rep) {
				var newstr = str[Math.min(i, str.length-1)];
				if (tn) tn.nodeValue = newstr;
				else tn = node.appendChild(document.createTextNode(newstr));
			}
			else if (tn) str += (str == '' ? '' : "\n") + tn.nodeValue;
		});
		return (rep ? true : str);
	}


	return {
		ElementNode: ElementNode,
		AttributeNode: AttributeNode,
		TextNode: TextNode,
		CommentNode: CommentNode,
		Get: Get,
		Descendents: Descendents,
		Ancestors: Ancestors,
		Clone: Clone,
		RemoveIDs: RemoveIDs,
		RemoveChildren: RemoveChildren,
		Text: Text
	};

}();/*	---------------------------------------------

	owl.Xml

	--------------------------------------------- */
if (owl && !owl.Xml) owl.Xml = function() {

	// node types
	var ElementNode = 1;
	var AttributeNode = 2;
	var TextNode = 3;
	var CommentNode = 8;


	// create a new empty XML document
	function New() {
		var xml = null;
		if (document.implementation && document.implementation.createDocument) xml = document.implementation.createDocument("", "xml", null);
		else {
			// IE XML
			owl.Each(
				["MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"],
				function(dom) { try { xml = new ActiveXObject(dom); } catch(e) {}; return !!xml; }
			);
		}
		return xml;
	}


	// create an XML document from a string
	function Load(str) {
		var xml = null;
		if (!str) xml = New();
		else {
			if (typeof DOMParser != "undefined") xml = (new DOMParser()).parseFromString(str, "application/xml");
			else { xml = New(); if (xml) xml.loadXML(str); }
		}
		return xml;
	}
	
	
	// create node event (private)
	function AddEvent(node, evt, fn) { node[evt] = function() { return eval(fn); }; }


	// copy XML node children to DOM node
	function Copy(xmlDoc, domNode, level) {

		if (typeof level == "undefined") level = 1;
		if (level > 1) {

			if (xmlDoc.nodeType == 1) {
				// element node
				var thisNode = document.createElement(xmlDoc.nodeName);

				// attributes
				var handler = {};
				for (var a = 0, attr = xmlDoc.attributes.length; a < attr; a++) {
					var aName = xmlDoc.attributes[a].name, aValue = xmlDoc.attributes[a].value, evt = (aName.substr(0,2) == "on");
					if (evt) handler[aName] = aValue;
					else {
						switch (aName) {
							case "class": thisNode.className = aValue; break;
							case "for": thisNode.htmlFor = aValue; break;
							default: thisNode.setAttribute(aName, aValue); break;
						}
					}
				}

				// append node
				domNode = domNode.appendChild(thisNode);
				
				// attach events
				for (evt in handler) AddEvent(domNode, evt, handler[evt]);
				
			}
			else if (xmlDoc.nodeType == 3) {
				// text node
				var text = (xmlDoc.nodeValue ? xmlDoc.nodeValue : "");
				var test = owl.String.Trim(text);
				if (test.length < 7 || (test.indexOf("<!--") != 0 && test.indexOf("-->") != (test.length - 3))) domNode.appendChild(document.createTextNode(text));
			}
		}

		// recurse child nodes
		for (var i = 0; i < xmlDoc.childNodes.length; i++) Copy(xmlDoc.childNodes[i], domNode, level+1);
		
		// return last child added
		return (domNode.lastChild ? domNode.lastChild : domNode);
	}


	// transform XML using XSL
	function Transform(xml, xsl) {
		var trans = null;
		if (window.XSLTProcessor) {
			try {
				var xslp = new XSLTProcessor();
				xslp.importStylesheet(xsl);
				trans = xslp.transformToDocument(xml, document);
			} catch(e) {};
		}
		else {
			try {
				trans = this.New();
				trans.loadXML( xml.transformNode(xsl) );
			} catch(e) {};
		}
		return (trans && trans.documentElement && trans.documentElement.childNodes.length ? trans : null);
	}


	return {
		ElementNode: ElementNode,
		AttributeNode: AttributeNode,
		TextNode: TextNode,
		CommentNode: CommentNode,
		New: New,
		Load: Load,
		Copy: Copy,
		Transform: Transform
	};

}();/*	---------------------------------------------

	owl.innerHTML

	--------------------------------------------- */
if (owl && owl.Dom && owl.Xml && !owl.innerHTML) owl.innerHTML = function(node, str, clear) {

	clear = (clear != false);
	node = owl.Array.Make(node);
	if (node.length > 0) {
		var xml = owl.Xml.Load("<root>"+str+"</root>");
		if (xml && xml.documentElement) owl.Each(node, function(n) {
			if (clear) owl.Dom.RemoveChildren(n);
			node = owl.Xml.Copy(xml.documentElement, n);
		});
	}

	return node;
};/*	---------------------------------------------

	owl.Event

	--------------------------------------------- */
if (owl && !owl.Event) {

	// define an event on one or more elements
	owl.Event = function(element, type, handler, priority) {

		element = owl.Array.Make(element, [window]);
		handler = (typeof handler == 'function' ? handler : null);
		priority = (priority || priority == 0 ? owl.Number.toInt(priority) : null);
		var regIndex = [];

		// add event(s)
		owl.Each(
			element,
			function(e) { regIndex[regIndex.length] = owl.EventRegister.Add(e, type, handler, priority); }
		);

		// detach event(s)
		this.Detach = function() {
			for (var e = 0, el = element.length; e < el; e++) owl.EventRegister.Detach(element[e], type, regIndex[e], true);
		};
	};


	/*	---------------------------------------------
		owl.EventRegister
		--------------------------------------------- */
	owl.EventRegister = function() {

		// element store
		var regElements = [], register = [], precedence = [], guid = 0, pReset = false;
		var ns = 'EventRegister';

		// create event
		function Add(element, type, handler, priority) {

			// existing event list
			var regEvents = owl.Property.Get(element, ns);
			if (!regEvents) {
				regEvents = {};
				regElements[regElements.length] = element;
			}

			// register new event type for element
			if (!regEvents[type]) {

				guid++;
				register[guid] = [];
				regEvents[type] = guid;
				owl.Property.Set(element, ns, regEvents);

				// define event
				var existingEvent = element["on"+type];
				if (existingEvent) new owl.Event(element, type, existingEvent);
				element["on"+type] = owl.EventRegister.Handler;

				// clean up event
				if (guid == 1) new owl.Event(window, "unload", owl.EventRegister.CleanUp, 1e+100);

			}

			// set handler
			var regIndex = regEvents[type];
			var funcIndex = register[regIndex].length;
			register[regIndex][funcIndex] = { Handler: handler, Priority: priority };

			// handler precedence
			SetPrecedence(element, type, regIndex);

			// return handler reference
			return { Reg: regIndex, Func: funcIndex };
		}

		// set handler priority order
		function SetPrecedence(element, type, regIndex) {
			var prec = [];
			for (var p = 0, pl = register[regIndex].length; p < pl; p++) {
				if (register[regIndex][p].Handler != null) prec[prec.length] = { Index: p, Priority: register[regIndex][p].Priority };
			}

			// sort by priority
			if (prec.length > 0) prec.sort(function(a, b) { return a.Priority - b.Priority; });
			else {
				// or remove event
				element["on"+type] = null;
				delete element.owlP[ns][type];
				prec = null;
			}

			precedence[regIndex] = prec;
			pReset = false;
		}

		// run all events
		function Handler(event) {
			var ret = true, e = new owl.EventInformation(this, event);
			if (e.Index && e.Index.Reg) {
				var prec = precedence[e.Index.Reg].slice();
				for (var p = 0, pl = prec.length; p < pl; p++) {
					e.Index.Func = prec[p].Index;
					if (e.AllowNext && register[e.Index.Reg][e.Index.Func].Handler) {
						ret &= (register[e.Index.Reg][e.Index.Func].Handler(e) !== false);
					}
				}
			}
			if (pReset) SetPrecedence(e.Element, e.Type, e.Index.Reg);
			return ret;
		}

		// detach event
		function Detach(element, type, index, forceReset) {
			register[index.Reg][index.Func].Handler = null;
			if (forceReset) SetPrecedence(element, type, index.Reg);
			else pReset = true;
		}

		// cleanup event
		function CleanUp() {
			for (var e = 0, el = regElements.length, em = regElements[0]; e < el; em = regElements[++e]) { // all elements
				for (var h in owl.Property.Get(em, ns)) em["on"+h] = null;
				owl.Property.Delete(em, ns);
			}
			regElements = null; register = null; precedence = null;
		}

		// public values
		return {
			Namespace: ns,
			Add: Add,
			Handler: Handler,
			Detach: Detach,
			CleanUp: CleanUp
		};

	}();


	/*	---------------------------------------------
	owl.EventInformation
	--------------------------------------------- */
	owl.EventInformation = function(element, event) {
		this.Element = element;
		this.Event = (event ? event : window.event);
		if (this.Event) {
			this.Type = this.Event.type.toLowerCase();
			this.Target = (this.Event.target ? this.Event.target : this.Event.srcElement);
			this.Index = { Reg: this.Element.owlP[owl.EventRegister.Namespace][this.Type], Func: null };
			this.AllowNext = true;
		}
	};

	// key press
	owl.EventInformation.prototype.Key = function() {
		if (!this.KeySet) {
			this.KeySet = { Pressed: '', Function: '', Shift: this.Event.shiftKey, Ctrl: this.Event.ctrlKey, Alt: this.Event.altKey };

			if (owl.EventKey.test(this.Type)) {
				var keyCode = this.Event.keyCode; // key pressed
				var charCode = (typeof this.Event.charCode != 'undefined' ? this.Event.charCode : null); // character returned (Firefox keypress)

				if (charCode > 0) this.KeySet.Pressed = String.fromCharCode(charCode);
				else {
					if (owl.EventCK[keyCode] && (charCode != null || keyCode < 32 || (this.Type != "keypress" || (!this.Shift && keyCode < 112 && keyCode != 35 && keyCode != 39 && keyCode != 45 && keyCode != 46)))) this.KeySet.Function = owl.EventCK[keyCode];
					else if (keyCode >= 32) this.KeySet.Pressed = String.fromCharCode(keyCode);
				}

			}
		}
		return this.KeySet;
	};

	// mouse event
	owl.EventInformation.prototype.Mouse = function() {
		if (!this.MouseSet) {
			this.MouseSet = { X: 0, Y: 0 };

			if (owl.EventMouse.test(this.Type)) {
				this.MouseSet.X = (this.Event.pageX ? this.Event.pageX : this.Event.clientX + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft));
				this.MouseSet.Y = (this.Event.pageY ? this.Event.pageY : this.Event.clientY + Math.max(document.documentElement.scrollTop, document.body.scrollTop));
			}
		}
		return this.MouseSet;
	};

	// detach event
	owl.EventInformation.prototype.Detach = function() {
		owl.EventRegister.Detach(this.Element, this.Type, this.Index);
	};

	// stop processing further events
	owl.EventInformation.prototype.StopHandlers = function() { this.AllowNext = false; };

	// stop propagation
	owl.EventInformation.prototype.StopPropagation = function() {
		if (this.Event.stopPropagation) this.Event.stopPropagation();
		this.Event.cancelBubble = true;
	};

	// stop default action
	owl.EventInformation.prototype.StopDefaultAction = function() {
		if (this.Event.preventDefault) this.Event.preventDefault();
		this.Event.returnValue = false;
	};

	// event settings
	owl.EventKey = /^key/i;
	owl.EventMouse = /mouse|click/i;
	owl.EventCK = []; owl.EventCK[8] = "backspace"; owl.EventCK[9] = "tab"; owl.EventCK[13] = "enter"; owl.EventCK[19] = "break"; owl.EventCK[27] = "esc"; owl.EventCK[33] = "pageup"; owl.EventCK[34] = "pagedown"; owl.EventCK[35] = "end"; owl.EventCK[36] = "home"; owl.EventCK[37] = "left"; owl.EventCK[38] = "up"; owl.EventCK[39] = "right"; owl.EventCK[40] = "down"; owl.EventCK[45] = "insert"; owl.EventCK[46] = "delete"; owl.EventCK[112] = "f1"; owl.EventCK[113] = "f2"; owl.EventCK[114] = "f3"; owl.EventCK[115] = "f4"; owl.EventCK[116] = "f5"; owl.EventCK[117] = "f6"; owl.EventCK[118] = "f7"; owl.EventCK[119] = "f8"; owl.EventCK[120] = "f9"; owl.EventCK[121] = "f10"; owl.EventCK[122] = "f11"; owl.EventCK[123] = "f12"; owl.EventCK[144] = "numlock"; owl.EventCK[145] = "scrolllock";

	// disable fast back
	if (history && history.navigationMode) history.navigationMode = "compatible";
}/*	---------------------------------------------

	owl.Timer

	--------------------------------------------- */
if (owl && !owl.Timer) {

	// define a timer
	owl.Timer = function(start, stop, step, pause, startPause, stopPause, callback) {

		var timer = null, Inc = (step || step == 0 ? step : (start < stop ? 1 : -1));
		var timerDelay = (pause ? pause : 20), startDelay = (startPause ? startPause : 0), stopDelay = (stopPause ? stopPause : 0);

		// public properties
		this.StartValue = (start ? start : 0);
		this.StopValue = (stop || stop == 0 ? stop : 100);
		this.Value = this.StartValue;
		this.CallBack = (callback ? callback : null);
		this.OnStart = null;
		this.OnStop = null;
		this.OnReverse = null;
		var abort = false;
		var T = this;

		// set step: starts/stops timer and reverses if necessary
		this.SetStep = function(newInc) {
			if (newInc == 0) { this.Stop(); Inc = 0; }
			else {
				if ((newInc < 0 && this.StartValue < this.StopValue) || (newInc > 0 && this.StartValue > this.StopValue)) {
					Inc = -newInc;
					this.Reverse();
				}
				else Inc = newInc;
				this.Start();
			}
		};
		
		// returns the step value
		this.GetStep = function() { return Inc; };

		// start timer
		this.Start = function() {
			if (!timer) {
				abort = false;
				var tFunc = function(start) {
					if (!abort) {
						if (start) { if (T.OnStart) T.OnStart(T); if (T.CallBack) T.CallBack(T); }
						timer = setInterval( function() { T.Run(); }, timerDelay );
					}
				};
				var s = (this.Value == this.StartValue);
				if (s && startDelay > 0) setTimeout( function() { tFunc(s); }, startDelay ); else tFunc(s);
			}
		};

		// run timer
		this.Run = function() {
			this.Value += Inc;
			this.Value = ( Inc > 0 ? Math.min(this.Value, this.StopValue) : Math.max(this.Value, this.StopValue) );
			if (this.CallBack) this.CallBack(this);
			if (this.Value == this.StopValue) this.Stop();
		};

		// reverse timer
		this.Reverse = function() {
			var sv = this.StartValue;
			this.StartValue = this.StopValue;
			this.StopValue = sv;
			Inc = -Inc;
			if (this.OnReverse) this.OnReverse(this);
		};

		// stop timer
		this.Stop = function() {
			abort = true;
			if (timer) {
				timer = clearInterval(timer);
				if (this.Value == this.StopValue) setTimeout(function() { if (T.OnStop) T.OnStop(T); }, stopDelay);
			}
		};

		// start immediately if callback defined
		if (this.CallBack) this.Start();
	};

}/*	---------------------------------------------

	owl.Image

	--------------------------------------------- */
if (owl && !owl.Image) owl.Image = function() {

	// load an image and run a callback function
	function Load(imgsrc, callback) {
		var img = new Image();
		img.src = imgsrc;
		if (callback) {
			if (img.complete) callback(img);
			else img.onload = function() { callback(img); };
		}
	}

	// load an alpha-transparent PNG in IE
	function IEpng(element, imgsrc, sizing) {
		if (owl.Browser.IE && owl.Browser.VerNum >= 5.5 && owl.Browser.VerNum < 7) {
			if (!sizing) sizing = "crop";
			owl.Each(owl.Array.Make(element), function(e) {
				e.style.backgroundImage = "none";
				e.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgsrc+"', sizingMethod='"+sizing+"')";
			});
		}
	}

	// public methods
	return {
		Load: Load,
		IEpng: IEpng
	};

}();/*	---------------------------------------------

	owl.Screen

	--------------------------------------------- */
if (owl && owl.Dom && owl.Timer && !owl.Screen) {

	owl.Screen = function() {

		// get body node
		var Body = function() {
			var b = owl.Dom.Get("body");
			if (b.length == 1) { Body = function() { return b[0]; }; return Body(); }
			else return null;
		};


		// returns the X, Y co-ordinates of a single element
		function Location(element) {
			var Loc = { X: element.offsetLeft - element.scrollLeft, Y: element.offsetTop - element.scrollTop };
			while ((element = element.offsetParent)) { Loc.X += element.offsetLeft - element.scrollLeft; Loc.Y += element.offsetTop - element.scrollTop; }
			return Loc;
		}


		// viewport dimensions
		var ViewPortFunction;
		function ViewPort() {
			if (!ViewPortFunction) {
				if (window.innerWidth) {
					ViewPortFunction = function() { return { Width: window.innerWidth, Height: window.innerHeight }; };
				}
				else if (document.documentElement && document.documentElement.clientWidth) {
					ViewPortFunction = function() { return { Width: document.documentElement.clientWidth, Height: document.documentElement.clientHeight }; };
				}
				else ViewPortFunction = function() { return { Width: (Body() ? Body().clientWidth : 0), Height: (Body() ? Body().clientHeight : 0) }; };
			}
			return ViewPortFunction();
		}


		// scroll offsets
		function ViewScroll() {
			return {
				X: window.pageXOffset || (document.documentElement && document.documentElement.scrollLeft) || (Body() && Body().scrollLeft),
				Y: window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (Body() && Body().scrollTop)
			};
		}


		// page dimensions
		function Page() {
			var p = { Width: 0, Height: 0 };
			if (Body()) {
				if (document.documentElement && document.documentElement.scrollWidth) {
					p.Width = document.documentElement.scrollWidth; p.Height = document.documentElement.scrollHeight;
				}
				else if (Body().offsetWidth) { p.Width = Body().offsetWidth; p.Height = Body().offsetHeight; }
			}
			return p;
		}


		// screen resolution
		var Resolution = function() {
			var r = {};
			r.Width = (screen.width ? screen.width : null);
			r.Height = (screen.height ? screen.height : null);
			r.AvailWidth = (screen.availWidth ? screen.availWidth : r.Width);
			r.AvailHeight = (screen.availHeight ? screen.availHeight : r.Height);
			r.AvailLeft = (screen.availLeft ? screen.availTop : 0);
			r.AvailTop = (screen.availTop ? screen.availTop : 0);
			r.ColorDepth = (screen.colorDepth ? screen.colorDepth : (screen.pixelDepth ? screen.pixelDepth : null));
			Resolution = function() { return r; };
			return Resolution();
		};


		// move to new scroll position and run callback when complete
		var timerScroll = null;
		function ScrollTo(newX, newY, animate, callback) {

			if (animate === false) {
				// jump to new location
				window.scrollTo(newX, newY);
				if (typeof callback == "function") callback();
			}
			else {
				// scroll to new location
				if (timerScroll) timerScroll.Stop();
				timerScroll = new owl.Timer(owl.Screen.Config.MoveFrames, 1, -1, owl.Screen.Config.MovePause, 0, 0, function(t) {
					// scroll animation
					var v = ViewScroll();
					var f = Math.sqrt(t.Value);
					window.scrollTo( v.X + Math.ceil((newX - v.X) / f), v.Y + Math.ceil((newY - v.Y) / f) );
					var nv = ViewScroll();
					if (nv.X == v.X && nv.Y == v.Y) {
						t.Stop();
						if (typeof callback == "function") { callback(); callback = null; }
					}
				});
			}

		}


		// scrolls the top left of an element into view
		function ScrollToElement(element, left, right, top, bottom, absolute, animate, callback) {
			if (absolute !== true) {
				var vp = ViewPort();
				left = Math.floor((left/100) * vp.Width);
				right = Math.ceil((right/100) * vp.Width);
				top = Math.floor((top/100) * vp.Height);
				bottom = Math.ceil((bottom/100) * vp.Height);
			}
			var loc = Location(element); // element location
			var vs = ViewScroll(); // scroll location
			var sx = (loc.X < vs.X + left ? loc.X - left : (loc.X > vs.X + right ? loc.X - right : vs.X));
			var sy = (loc.Y < vs.Y + top ? loc.Y - top : (loc.Y > vs.Y + bottom ? loc.Y - bottom : vs.Y));
			ScrollTo(sx, sy, animate, callback);
		}


		return {
			Location: Location,
			ViewPort: ViewPort,
			ViewScroll: ViewScroll,
			Page: Page,
			Resolution: Resolution,
			ScrollTo: ScrollTo,
			ScrollToElement: ScrollToElement
		};

	}();


	/* ---------------------------------------------
	owl.Screen.Config
	--------------------------------------------- */
	owl.Screen.Config = {
		MoveFrames: 50,
		MovePause: 20
	}

}/*	---------------------------------------------

	owl.Overlay

	--------------------------------------------- */
if (owl && owl.Css && owl.Dom && owl.Screen && owl.Timer && !owl.Overlay) {

	owl.Overlay = function() {

		// default configuration
		var Config = {
			PageFadeID: "lb_pageoverlay",
			PageFadeMax: 60,
			PageFadeStep: (owl.Browser.IE ? 20 : 10),
			PageFadePause: 20
		};

		// page fade out
		var pLayer = null, pElements = null, pTimer = null, pOpac = "opacity";
		function PageFadeOut(callback, col, opacMax, opacStep, opacPause) {

			// define layer
			if (!pLayer) {
				var b = owl.Dom.Get("body");
				if (b.length == 1) {
					pLayer = b[0].appendChild(document.createElement("div"));
					pLayer.style.position = "absolute"; pLayer.style.top = "0px"; pLayer.style.left = "0px";
				}
			}

			// set layer defaults
			if (pLayer) {
				pLayer.id = Config.PageFadeID;
				if (col) pLayer.style.backgroundColor = col;
				owl.Property.Set(pLayer, pOpac, 0);
				owl.Css.Opacity(pLayer, 0);
				pLayer.style.width = "100%"; pLayer.style.height = "100%";
				var page = owl.Screen.Page();
				var view = owl.Screen.ViewPort();
				var pWidth = Math.max(pLayer.offsetWidth, page.Width, (owl.Browser.IE ? view.Width : 0));
				var pHeight = Math.max(pLayer.offsetHeight, page.Height, (owl.Browser.IE ? view.Height : 0));
				pElements = new owl.Overlay.Elements(0, 0, pWidth, pHeight);
				pLayer.style.width = pWidth + "px";
				pLayer.style.height = pHeight + "px";

				// start timer
				opacMax = (opacMax ? opacMax : Config.PageFadeMax);
				pTimer = new owl.Timer(0, opacMax, (opacStep ? opacStep : Config.PageFadeStep), (opacPause ? opacPause : Config.PageFadePause));
				pTimer.CallBack = function(t) { owl.Css.Opacity(pLayer, t.Value); };
				if (callback) pTimer.OnStop = function(t) { if (t.Value >= opacMax) callback(); };
				pTimer.Start();
			}
		}

		// page fade in
		function PageFadeIn(callback) {
			if (pTimer) {
				pTimer.Reverse();
				pTimer.OnStop = function(t) {
					pElements.Show();
					pLayer.style.width = "0px"; pLayer.style.height = "0px";
					if (callback) callback();
				};
				pTimer.Start();
			}
		}


		// create an iframe for element hiding
		function CreateIframe() {
			var ifb = document.createElement("iframe");
			ifb.src = "javascript:false;";
			ifb.frameBorder = "0"; ifb.scrolling = "no"; ifb.style.position = "absolute";
			ifb.style.padding = "0px"; ifb.style.margin = "0px";
			ifb.style.width = "50px"; ifb.style.height = "50px"; ifb.style.top = "0px"; ifb.style.left = "0px";
			ifb.style.filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
			return ifb;
		}

		// public methods
		return {
			Config: Config,
			PageFadeOut: PageFadeOut,
			PageFadeIn: PageFadeIn,
			CreateIframe: CreateIframe
		};

	}();


	// cover elements that cannot be overlaid in IE
	owl.Overlay.Elements = function(tx, ty, bx, by) {
		if (owl.Browser.IE && owl.Browser.VerNum < 7) {
			this.Hidden = null;
			this.HideTags = "select, iframe, applet";
			this.HideID = "owlframe";
			this.TX = tx; this.TY = ty;
			this.BX = bx; this.BY = by;
			this.Cover();
		}
	};

	// cover elements that cannot be overlaid in IE
	owl.Overlay.Elements.prototype.Cover = function() {

		// parse tags to hide
		if (this.HideTags && !this.Hidden) {

			var C = this;
			this.Hidden = [];
			owl.Each(owl.Dom.Get(this.HideTags), function(e) {

				if (!owl.Property.Exists(e, C.HideID)) {

					var loc = owl.Screen.Location(e);
					var ebox = { TX: loc.X, TY: loc.Y, BX: loc.X+e.offsetWidth, BY: loc.Y+e.offsetHeight };
					if (ebox.BX > C.TX && ebox.BY > C.TY && C.BX > ebox.TX && C.BY > ebox.TY) {

						if (owl.Browser.VerNum < 5.5) {
							// hide box in IE5.0
							if (e.style.visibility != "hidden") {
								e.style.visibility = "hidden";
								owl.Array.Push(C.Hidden, { Element: e, Iframe: false });
							}
						}
						else {
							// create iframe in IE5.5 and IE6.0
							var eop = (e.offsetParent.nodeName.toLowerCase() == "body");
							var iframe = e.parentNode.appendChild(owl.Overlay.CreateIframe());
							iframe.style.left = (eop ? ebox.TX : e.offsetLeft) + Math.max(0, C.TX - ebox.TX) + "px";
							iframe.style.top = (eop ? ebox.TY : e.offsetTop) + Math.max(0, C.TY - ebox.TY) + "px";
							iframe.style.width = Math.min(C.BX, ebox.BX) - Math.max(C.TX, ebox.TX) + "px";
							iframe.style.height = Math.min(C.BY, ebox.BY) - Math.max(C.TY, ebox.TY) + "px";
							owl.Property.Set(iframe, C.HideID, true);
							owl.Array.Push(C.Hidden, { Element: e, Iframe: iframe });
						}
					}

				}
			});
		}
	};

	// show hidden elements
	owl.Overlay.Elements.prototype.Show = function() {
		if (this.Hidden) owl.Each(this.Hidden, function(h) {
			if (h.Iframe) h.Element.parentNode.removeChild(h.Iframe);
			else h.Element.style.visibility = "visible";
		});
		this.Hidden = null;
	};

}/*	---------------------------------------------

	owl.Lightbox

	--------------------------------------------- */
if (owl && owl.Event && owl.innerHTML && owl.Image && owl.Overlay && !owl.Lightbox) {

	// lightbox object
	owl.Lightbox = function(node) {

		// define new lightbox
		if (!owl.Css.ClassExists(node, owl.Lightbox.Config.Container.ActiveClass)) {

			// shortcuts
			var $D = owl.Dom;
			var $E = owl.Event;
			var $T = owl.Timer;
			var $Conf = owl.Lightbox.Config;
			var A = $Conf.Animation;

			owl.Css.ClassApply(node, $Conf.Container.ActiveClass);
			var LB = {shown: false, win: null, img: null, bar: null };
			var Event = {};
			var width = 0, height = 0, maxwidth = 0, maxheight = 0, scrwidth = 0, scrheight = 0, vScroll = null;
			var image = [], cImage = null, opacityImage = 0;
			var hoverOver = null, iReady = false, barText = null, barPos = false;
			var locX = 0, locY = 0, curX = 0, curY = 0;
			var timerBox = null, timerImg = null, timerBar = null, timerHover = null, timerZoom = null;

			// attach click event to images
			owl.Each(owl.Dom.Get("a", node), function(a, i) {
				image[i] = new owl.Lightbox.Image(a);
				owl.Property.Set(a, "LBindex", i);
				new $E(a, "click", function(e) { Start(e); });
			});

			// load first image
			if (!$Conf.Preload.All && $Conf.Preload.Next && image.length > 0) image[0].Load();
		}

		// start lightbox
		function Start(e) {
			if ($Conf.Enabled) {
				StopEvent(e);
				var i = owl.Property.Get(e.Element, "LBindex");
				image[i].Load();
				if (!LB.shown) {
					// determine dimensions
					LB.shown = true;
					owl.Overlay.PageFadeOut(function() { ShowWindow(i); });
					var vp = owl.Screen.ViewPort();
					scrwidth = vp.Width; scrheight = vp.Height;
					maxwidth = Math.max($Conf.Size.Minimum, Math.ceil(scrwidth - $Conf.Size.WidthPad));
					maxheight = Math.max($Conf.Size.Minimum, Math.ceil(scrheight - $Conf.Size.HeightPad));
				}
			}
		}

		// stop lightbox
		function Stop(e) {
			StopEvent(e);

			// remove events
			owl.Each(Event, function(e) { e.Detach(); });

			// fade out
			if (timerBox) timerBox.Stop();
			if (timerImg) timerImg.Stop();
			LB.win.style.display = "none";
			owl.Overlay.PageFadeIn(function() { LB.shown = false; });
		}

		// show window
		function ShowWindow(i) {

			// create window
			if (LB.win === null) {
				LB.win = owl.Lightbox.CreateWindow();
				LB.img = $D.Get("img", LB.win)[0];
				LB.bar = $D.Get("#lb_bar", LB.win)[0];
				if (image.length < 2) owl.Each($D.Get("a[id!=lb_close]", LB.bar), function(n) { n.style.display = "none"; });
				owl.Css.Opacity(LB.bar, $Conf.Animation.BarOpacity);
			}

			// configure
			HideInfo();
			width = $Conf.Size.Start;
			height = width;
			vScroll = owl.Screen.ViewScroll();
			LB.win.style.display = "block";
			WindowSize(width, height);
			ShowImage(i);

			// define events
			Event.KeyDown = new $E(document, "keydown", HandleKeyEvent);
			Event.Next = new $E($D.Get("#lb_next", LB.bar), "click", NextImage);
			Event.Back = new $E($D.Get("#lb_back", LB.bar), "click", NextImage);
			Event.Close = new $E($D.Get("#lb_close", LB.bar), "click", Stop);
			Event.ImgNext = new $E(LB.win, "click", NextImage);
			Event.MouseOver = new $E(LB.win, "mouseover", InfoHover);
			Event.Focus = new $E(LB.win, "focus", InfoHover);
			Event.MouseOut = new $E(LB.win, "mouseout", InfoHover);
			Event.Blur = new $E(LB.win, "blur", InfoHover);
			Event.MouseMove = new $E(LB.win, "mousemove", ZoomMove);
			Event.Overlay = new $E($D.Get("#"+owl.Overlay.Config.PageFadeID), "click", Stop);
			Event.WinFocus = new $E(document, "focus", HandleWindowFocus);
		}

		// stop page element focus
		function HandleWindowFocus(e) {
			var t = e.Target;
			while (t != LB.win && t.parentNode) t = t.parentNode;
			if (t != LB.win) { StopEvent(e); LB.win.focus(); InfoHover(e); }
		}

		// key event
		function HandleKeyEvent(e) {
			var c = e.Key().Function;
			if (e.Key().Pressed == " ") c = "right";
			var f = {
				"esc": 99,
				"left": -1, "up": -1, "pageup": -1,
				"right": 1, "down": 1, "pagedown": -1
			};
			if (f[c]) { if (f[c] == 99) Stop(); else NextImage(e, f[c]); }
		}

		// go to next image
		function NextImage(e, dir) {
			StopEvent(e);
			if (!dir) dir = (e.Element && e.Element.id == "lb_back" ? -1 : 1);
			if (cImage !== null) {
				var i = cImage + dir;
				var il = image.length - 1;
				i = (i > il ? 0 : (i < 0 ? il : i));
				if (i != cImage) ShowImage(i);
			}
		}

		// show image
		function ShowImage(i) {

			HideInfo();
			if (timerZoom) timerZoom.Stop();
			timerZoom = null;
			if (timerBox) timerBox.Stop();
			if (timerImg) timerImg.Stop();

			// load image
			iReady = false;
			cImage = i;
			image[cImage].Load(ResizeWindow);

			// fade current image
			if (opacityImage > 0) timerImg = new $T(opacityImage, 0, -A.FadeStep, A.FramePause, 0, 0, function(t) { ImageOpacity(t.Value); });

			// preload next image
			if (!$Conf.Preload.All && $Conf.Preload.Next && cImage+1 < image.length) image[cImage+1].Load();
		}

		// prepare window
		function ResizeWindow() {

			// load image
			if (timerImg) timerImg.Stop();
			ImageOpacity(0);
			image[cImage].Resize(maxwidth, maxheight);
			LB.img.width = image[cImage].Width;
			LB.img.height = image[cImage].Height;
			LB.img.src = image[cImage].Src;
			vScroll = owl.Screen.ViewScroll();
			WindowSize(width, height);

			// fade image in and resize
			var ws = A.SizeStep * (width > image[cImage].Width ? -1 : 1);
			var hs = A.SizeStep * (height > image[cImage].Height ? -1 : 1);

			// resize width
			if (timerBox) timerBox.Stop();
			timerBox = new $T(width, image[cImage].Width, ws, A.FramePause, $Conf.Throttle, 0);
			timerBox.CallBack = function(t) { WindowSize(t.Value, height); };
			timerBox.OnStop = function() {

				// resize height
				timerBox = new $T(height, image[cImage].Height, hs, A.FramePause, 0, 0);
				timerBox.CallBack = function(t) { WindowSize(width, t.Value); };
				timerBox.OnStop = function() {

					// fade image in
					var loc = owl.Screen.Location(LB.img);
					locX = loc.X; locY = loc.Y;
					iReady = true;
					if (timerImg) timerImg.Stop();
					timerImg = new $T(0, 100, A.FadeStep, A.FramePause, 0, 0);
					timerImg.CallBack = function(t) { ImageOpacity(t.Value); };
					timerImg.OnStop = function() { if (hoverOver) { ShowInfo(); ZoomIn(); } };
					timerImg.Start();

				};
				timerBox.Start();
			};
			timerBox.Start();

		}

		// resize window
		function WindowSize(w, h) {
			LB.img.style.left = ((w - LB.img.width) / 2) + "px";
			LB.img.style.top = ((h - LB.img.height) / 2) + "px";
			LB.win.style.left = ((scrwidth - w) / 2 + vScroll.X) +"px";
			LB.win.style.top = ((scrheight - h) / 2 + vScroll.Y) +"px";
			LB.win.style.width = w+"px";
			LB.win.style.height = h+"px";
			width = w;
			height = h;
		}

		// throttle showing the info box
		function InfoHover(e) {
			if (timerHover) clearInterval(timerHover);
			hoverOver = !(e.Type == "mouseout" || e.Type == "blur");
			timerHover = setTimeout( function() { if (hoverOver) { ShowInfo(); ZoomIn(); } else { HideInfo(); ZoomOut(); } }, $Conf.Throttle);
		}

		// show information panel
		function ShowInfo() {
			if ($Conf.ShowInfo && iReady) {

				// copy description
				if (barText != cImage) {
					if (timerBar) { timerBar.Stop(); timerBar = null; }
					barText = cImage;
					var p = $D.Get("p", LB.bar)[0];
					$D.Clone(image[barText].Node, p, false, true);
					var i = $D.Get("img", p);
					if (i.length > 0) i[0].parentNode.removeChild(i[0]);
				}

				// slide into view
				if (timerBar) {
					if (timerBar.OnStop) { timerBar.OnStop = null; timerBar.Reverse(); }
				}
				else {
					var h = -LB.bar.offsetHeight;
					timerBar = new $T(h, -1, A.BarStep, A.FramePause, 0, 0);
					timerBar.CallBack = function(t) { barPos = t.Value; LB.bar.style.bottom = barPos + "px"; };
					LB.bar.style.visibility = "visible";
				}
				timerBar.Start();
			}
		}

		// hide information panel
		function HideInfo() {
			if (timerBar && !timerBar.OnStop) {
				timerBar.Reverse();
				timerBar.OnStop = function() { timerBar = null; };
				timerBar.Start();
			}
			else LB.bar.style.visibility = "hidden";
		}

		// zoom in
		function ZoomIn() {
			if ($Conf.Magnify && iReady) {
				if (timerZoom) {
					if (timerZoom.OnStop) { timerZoom.OnStop = null; timerZoom.Reverse(); }
				}
				else {
					if (image[cImage].Ratio < 1) {
						timerZoom = new $T(image[cImage].Ratio, 1, (1 - image[cImage].Ratio) / A.ZoomSteps, A.FramePause, 0, 0);
						timerZoom.CallBack = function(t) { ZoomImage(t.Value); };
					}
				}
				if (timerZoom) timerZoom.Start();
			}
		}

		// zoom out
		function ZoomOut() {
			if (timerZoom && !timerZoom.OnStop) {
				timerZoom.Reverse();
				timerZoom.OnStop = function() { timerZoom = null; };
				timerZoom.Start();
			}
		}

		// zoom image handler
		function ZoomMove(e) {
			if ($Conf.Magnify && iReady && hoverOver && image[cImage].Ratio < 1) {
				var m = e.Mouse();
				curX = Math.max(0, Math.min(width, m.X - locX));
				curY = Math.max(0, Math.min(height, m.Y - locY));
				if (!timerZoom || timerZoom.Value == 1) ZoomImage();
			}
		}

		// zoom the image
		function ZoomImage(zoom) {
			var w, h;
			if (zoom) { w = Math.ceil(image[cImage].RealWidth * zoom); h = Math.ceil(image[cImage].RealHeight * zoom); }
			else { w = LB.img.width; h = LB.img.height; }

			// move to location
			LB.img.style.left = ( (1 - ((width - curX) / width)) * (width - w) ) + "px";
			LB.img.style.top = ( (1 - ((height - curY) / height)) * (height - h) ) + "px";

			// zoom
			if (zoom) { LB.img.width = w; LB.img.height = h; }
		}

		// change image opacity
		function ImageOpacity(o) { owl.Css.Opacity(LB.img, o); opacityImage = o; }

		// stop event
		function StopEvent(e) { if (e) { e.StopDefaultAction(); e.StopPropagation(); if (e.Element && e.Element.blur) e.Element.blur(); } }

	};

	// create the lightbox window
	owl.Lightbox.CreateWindow = function() {
		var lbw = owl.innerHTML(owl.Dom.Get("body"), owl.Lightbox.Config.WindowHTML, false);
		owl.Lightbox.CreateWindow = function() { return lbw; };
		return owl.Lightbox.CreateWindow();
	};

	/*	---------------------------------------------
		owl.Lightbox.Image
		--------------------------------------------- */
	owl.Lightbox.Image = function(node) {
		this.Node = node;
		this.Src = this.Node.href;
		this.Pic = null;
		this.RealWidth = 0; this.RealHeight = 0;
		this.Ratio = 1; this.Width = 0; this.Height = 0;
		this.Loading = false;
		this.LoadCallback = null;
		if (owl.Lightbox.Config.Preload.All) this.Load();
	};

	// load the image
	owl.Lightbox.Image.prototype.Load = function(callback) {

		// queue callbacks
		if (callback) {
			var CallbackQ = this.LoadCallback;
			if (CallbackQ) this.LoadCallback = function() { CallbackQ(); callback(); };
			else this.LoadCallback = callback;
		}

		// does image need caching?
		if (this.Pic === null) {
			if (!this.Loading) {
				this.Loading = true; var P = this;
				owl.Image.Load(this.Src, function(i) {
					P.Pic = i; P.Loading = false;
					P.RealWidth = i.width; P.RealHeight = i.height;
					if (P.LoadCallback) { P.LoadCallback(); P.LoadCallback = null; }
				});
			}
		}
		else if (this.LoadCallback) { this.LoadCallback(); this.LoadCallback = null; }
	};

	// calculate the new size of the image based on a maximum width and height
	owl.Lightbox.Image.prototype.Resize = function(maxWidth, maxHeight) {
		if (this.RealWidth > 0 && this.RealHeight > 0) {
			this.Ratio = Math.min(Math.min(maxWidth / this.RealWidth, 1), Math.min(maxHeight / this.RealHeight, 1));
			this.Width = Math.floor(this.RealWidth * this.Ratio); this.Height = Math.floor(this.RealHeight * this.Ratio);
		}
	};

	/* ---------------------------------------------
	owl.Lightbox.Config
	--------------------------------------------- */
	owl.Lightbox.Config = {
		AutoStart: true,
		Enabled: true,
		ShowInfo: true,
		Magnify: true,
		Throttle: 200,
		Container: {
			Element: ".lightbox",
			ActiveClass: "active"
		},
		Preload: {
			All: false,
			Next: false
		},
		Size: {
			Start: 40,
			Minimum: 200,
			WidthPad: 30,
			HeightPad: 50
		},
		Animation: {
			FramePause: 10,
			FadeStep: 5,
			SizeStep: 20,
			BarOpacity: 60,
			BarStep: 2,
			ZoomSteps: 20
		},
		WindowHTML: '<div id="lb_window"><div id="lb_image"><img tabindex="0" /><div id="lb_bar"><p></p><a id="lb_close" href="#" title="close"><strong>close</strong></a><a  id="lb_next" href="#" title="next image"><strong>next</strong></a><a id="lb_back" href="#" title="previous image"><strong>back</strong></a></div></div></div>'
	};

	// auto-start lightbox
	if (owl.Lightbox.Config.AutoStart) new owl.Event(window, "load", function (e) {
		owl.Each(owl.Dom.Get(owl.Lightbox.Config.Container.Element), function(n) { new owl.Lightbox(n); });
	}, 99999);

}/*
Taylor Property Maintenance JavaScript
(C) Optimalworks.net
*/

// setup
var tpm = tpm || {};

tpm.Initialise = function() {

	tpm.Setup = {

		// email address node
		EmailNode: "a.email",

		// contact form
		Contact: {
			Form: "#enquiry",
			ErrorClass: "error",
			Check: [
				{ Field: "#name", Validate: tpm.Validate.String, Req: true, Min: 1, Max: 80 },
				{ Field: "#telephone", Validate: tpm.Validate.String, Req: false, Min: 6, Max: 20, Additonal: function(f) {
					var ret = true;
					if (f == '') {
						var g = owl.Dom.Get("#email");
						if (g.length == 1) ret = tpm.Validate.Email(g[0].value, true, 6, 80);
					}
					return ret;
				} },
				{ Field: "#email", Validate: tpm.Validate.Email, Req: false, Min: 6, Max: 80, Additonal: function(f) {
					var ret = true;
					if (f == '') {
						var g = owl.Dom.Get("#telephone");
						if (g.length == 1) ret = (owl.String.Trim(g[0].value).length >= 6);
					}
					return ret;
				} }
			]
		},
		
		// fader
		Fader: {
			Element: "#pageimage",
			Delay: 5000,
			Step: 2,
			Pause: 1
		},

		// Google Analytics ID
		Analytics: "UA-114126-25"

	};

};


// ---------------------------------------------
// onload event
tpm.Start = function() {
	tpm.Initialise();
	tpm.EmailParse();
	new tpm.Validator(tpm.Setup.Contact);
	tpm.Fader.Init();
	tpm.Analytics();
};
new owl.Event(window, "load", tpm.Start, 0);


// ---------------------------------------------
// email replacement
tpm.EmailParse = function() {
	owl.Each(owl.Dom.Get(tpm.Setup.EmailNode), function(e) {
		if (e.firstChild) {
			var es = e.firstChild.nodeValue;
			es = es.replace(/dot/ig, ".");
			es = es.replace(/\{at\}/ig, "@");
			es = es.replace(/\s/g, "");
			e.href="mai"+'lto:'+es;
			owl.Dom.Text(e, es);
		}
	});
};


// ---------------------------------------------
// form validation
tpm.Validator = function(setup) {

	var form = owl.Dom.Get(setup.Form);
	if (form.length == 1) {
		this.Form = form[0];
		this.ErrorClass = setup.ErrorClass;
		this.Fields = setup.Check;
		var T = this;
		new owl.Event(form, "submit", function(evt) { T.Check(evt); }, 0);
	}

};

// check form
tpm.Validator.prototype.Check = function(evt) {

	var valid = true;
	var form = this.Form;
	var err = this.ErrorClass;

	// check all fields
	owl.Each(this.Fields, function(f) {
		var fNode = owl.Dom.Get(f.Field, form);
		if (fNode.length == 1) fNode = fNode[0];
		if (fNode && f.Validate) {
			var v = owl.String.Trim(fNode.value);
			if (v != fNode.value) fNode.value = v;
			var check = f.Validate(v, f.Req, f.Min, f.Max);
			if (f.Additonal) check &= f.Additonal(v);
			if (!check) {
				if (valid && fNode.select && fNode.focus) { fNode.select(); fNode.focus(); }
				owl.Css.ClassApply(fNode.parentNode, err);
				valid = false;
			}
			else owl.Css.ClassRemove(fNode.parentNode, err);
		}
	});

	if (!valid) {
		evt.StopDefaultAction();
		evt.StopHandlers();
	}

	return valid;

}


// ---------------------------------------------
// field checking
tpm.Validate = function() {

	// integer validation
	function Int(str, req, min, max) {
		var i = owl.Number.toInt(str);
		var valid = (str != '' && (!min || i >= min) && (!max || i <= max));
		return (valid || (!req && str == ''));
	}

	// string validation
	function String(str, req, min, max) { return !req || (str && (!min || str.length >= min) && (!max || str.length <= max)); }

	// email validation
	var reEmail = /^[^@]+@[a-z0-9]+([_\.\-]{0,1}[a-z0-9]+)*([\.]{1}[a-z0-9]+)+$/;
	function Email(str, req, min, max) {
		str = str.toLowerCase();
		var valid = (str != '' && (!min || str.length >= min) && (!max || str.length <= max) && (str.replace(reEmail, "") == ""));
		return (valid || (!req && str == ''));
	}

	return {
		Int: Int,
		String: String,
		Email: Email
	};

}();


// ---------------------------------------------
// fader
tpm.Fader = function() {

	var $C;
	
	// initalise all faders
	function Init() {
		$C = tpm.Setup.Fader;
		owl.Each(owl.Dom.Get($C.Element), function(e) { new Fader(e); });
	}
	
	// fader
	function Fader(element) {
		this.Element = element;
		this.Item = owl.Dom.Descendents(element, 1);
		if (this.Item.length > 1) {
		
			// apply z-index
			owl.Each(this.Item, function(e, i) { e.style.zIndex = i; });
			
			// set up fade animation
			this.Current = this.Item.length - 1;
			this.Start();
			
		}
	}

	// start fader
	Fader.prototype.Start = function() {
	
		var T = this;
		var E = this.Item[this.Current];
		this.Timer = new owl.Timer(100, 0, -$C.Step, $C.Pause, $C.Delay, 0);
		this.Timer.CallBack = function(t) { owl.Css.Opacity(E, t.Value, false); };
		this.Timer.OnStop = function(t) {
			
			// move slide to back
			E.style.zIndex = E.style.zIndex - T.Item.length;
			owl.Css.Opacity(E, 100);
			
			// reset timer
			T.Timer = null;
			T.Current--;
			if (T.Current < 0) T.Current = T.Item.length - 1;
			T.Start();
			
		};
		this.Timer.Start();
	
	};
	
	return { Init: Init };

}();


// ---------------------------------------------
// Analytics tracking
tpm.Analytics = function() {
	if (typeof _gat != 'undefined' && _gat._getTracker) {
		var pageTracker = _gat._getTracker(tpm.Setup.Analytics);
		pageTracker._initData();
		pageTracker._trackPageview();
	}
};