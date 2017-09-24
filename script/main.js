/*
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
};