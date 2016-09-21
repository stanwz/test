function Ajax(a) {
	var d = this;
	d.request = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
	d.convertHeadersToObject = function(a) {
		a = a.split("\n");
		for (var c = {}, f = 0; f < a.length; f++) {
			var d = a[f].split(": ", 2);
			1 < d.length && (c[d[0]] = d[1])
		}
		return c
	};
	d.request.onreadystatechange = function() {
		if (4 == d.request.readyState && 200 == d.request.status) {
			var g = d.request.getResponseHeader("Content-Type");
			g.match(/xml/gi) ? g = d.request.responseXML : g.match(/json/gi) ? (eval("var qqq=" + d.request.responseText),
				g = qqq) : g = d.request.responseText;
			if (a.onComplete)
				if (d.includeHeaders) {
					var c = d.convertHeadersToObject(d.request.getAllResponseHeaders());
					a.onComplete(g, c)
				} else a.onComplete(g)
		} else if (4 == d.request.readyState && 200 != d.request.status && a.onFailure) a.onFailure({
			text: d.request.responseText,
			code: d.request.status
		})
	};
	var f = "";
	if (a.params)
		if (a.params.substr) f = a.params;
		else {
			for (param in a.params) f += "&" + encodeURIComponent(param) + "=" + encodeURIComponent(a.params[param]);
			f = f.substr(1)
		}
	d.includeHeaders = a.includeHeaders;
	if ("GET" == a.method) {
		f && (f = "?" + f);
		d.request.open("GET", a.path + f, !0);
		for (header in a.headers) d.request.setRequestHeader(header, a.headers[header]);
		d.request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		d.request.send(null)
	} else {
		d.request.open("POST", a.path, !0);
		for (header in a.headers) d.request.setRequestHeader(header, a.headers[header]);
		d.request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		d.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		d.request.send(f)
	}
	d.abort =
		function() {
			d.request.onreadystatechange = null;
			d.request.abort();
			if (a.onFailure) a.onFailure({
				text: d.request.responseText,
				code: d.request.status
			})
		}
};
var Tween = function(obj, duration, options) {
	this.ease = function(elapsedTime, start, distance, totalDuration) {
		return distance * elapsedTime / totalDuration + start;
	};
	this.onComplete = function() {};
	this.onUpdate = function() {};
	this.running = null;
	this.prefix = this.units = "";
	this.delay = 0;
	this.begin = {};
	var self = this;
	this.__construct__ = function() {
		this.time = duration;
		this.obj = obj;
		this.id = Tween.getId();
		Tween.tweens[this.id] = this;
		if (options.onComplete) {
			this.onComplete = options.onComplete;
			delete options.onComplete;
		}
		if (options.onUpdate) {
			this.onUpdate = options.onUpdate;
			delete options.onUpdate;
		}
		if (options.ease) {
			this.ease = options.ease;
			delete options.ease;
		}
		if (options.delay) {
			this.delay = options.delay;
			delete options.delay;
		}
		for (var prop in options) {
			this.begin[prop] = obj[prop];
		}
		this.playTimeout = setTimeout(function() {
			self.play();
		}, this.delay);
	};
	this.play = function() {
		if (!Tween.tweens[obj]) {
			Tween.tweens[obj] = [];
		}
		Tween.tweens[obj].push(this);
		this.endAt = (new Date).getTime() + this.time;
		GlobalEvents.addListener(GlobalEvent.RENDER_FRAME, this.mechanism)
	};
	this.stop = function() {
		clearTimeout(self.playTimeout);
		GlobalEvents.removeListener(GlobalEvent.RENDER_FRAME, self.mechanism);
		self.stopped = true;
	};
	this.mechanism = function() {
		if (self.stopped) return false;
		var remainingTIme = self.endAt - (new Date).getTime();
		if (remainingTIme <= 0) {
			self.stop();
			self.advanceFrame(1, 1);
			self.onUpdate();
			self.onComplete();
		} else {
			self.advanceFrame(self.time - remainingTIme, self.time);
			self.onUpdate();
		}
	};
	this.advanceFrame = function(elapsedTime, totalDuration) {
		for (var prop in options) {
			var startVal = this.begin[prop];
			var endVal = options[prop];
			var distance = endVal - startVal;
			obj[prop] = this.ease(elapsedTime, startVal, distance, totalDuration);
		}
	};
	this.__construct__()
};
Tween.id = 0;
Tween.tweens = {};
Tween.killTweensOf = function(a) {
	for (var d in Tween.tweens) {
		var f = Tween.tweens[d];
		f.obj == a && f.stop()
	}
};
Tween.getId = function() {
	return ++Tween.id
};
Ease = {
	linear: function(a, d, f, g) {
		return f * a / g + d
	},
	easeOut: {
		quad: function(a, d, f, g) {
			return -f * (a /= g) * (a - 2) + d
		},
		cubic: function(a, d, f, g) {
			return f * (Math.pow(a / g - 1, 3) + 1) + d
		},
		quart: function(a, d, f, g) {
			return -f * (Math.pow(a / g - 1, 4) - 1) + d
		},
		quint: function(a, d, f, g) {
			return f * (Math.pow(a / g - 1, 5) + 1) + d
		},
		sine: function(a, d, f, g) {
			return f * Math.sin(a / g * (Math.PI / 2)) + d
		},
		expo: function(a, d, f, g) {
			return f * (-Math.pow(2, -10 * a / g) + 1) + d
		},
		circ: function(a, d, f, g) {
			return f * Math.sqrt(1 - (a = a / g - 1) * a) + d
		},
		bounce: function(a, d, f, g) {
			return (a /= g) < 1 / 2.75 ?
			7.5625 * f * a * a + d : a < 2 / 2.75 ? f * (7.5625 * (a -= 1.5 / 2.75) * a + 0.75) + d : a < 2.5 / 2.75 ? f * (7.5625 * (a -= 2.25 / 2.75) * a + 0.9375) + d : f * (7.5625 * (a -= 2.625 / 2.75) * a + 0.984375) + d
		},
		back: function(a, d, f, g, c) {
			void 0 == c && (c = 1.70158);
			return f * ((a = a / g - 1) * a * ((c + 1) * a + c) + 1) + d
		}
	},
	easeIn: {
		quad: function(a, d, f, g) {
			return f * (a /= g) * a + d
		},
		cubic: function(a, d, f, g) {
			return f * Math.pow(a / g, 3) + d
		},
		quart: function(a, d, f, g) {
			return f * Math.pow(a / g, 4) + d
		},
		quint: function(a, d, f, g) {
			return f * Math.pow(a / g, 5) + d
		},
		sine: function(a, d, f, g) {
			return f * (1 - Math.cos(a / g * (Math.PI /
					2))) + d
		},
		expo: function(a, d, f, g) {
			return f * Math.pow(2, 10 * (a / g - 1)) + d
		},
		circ: function(a, d, f, g) {
			return f * (1 - Math.sqrt(1 - (a /= g) * a)) + d
		},
		bounce: function(a, d, f, g) {
			return f - Ease._out.bounce(g - a, 0, f, g) + d
		},
		back: function(a, d, f, g, c) {
			void 0 == c && (c = 1.70158);
			return f * (a /= g) * a * ((c + 1) * a - c) + d
		}
	},
	easeInOut: {
		quad: function(a, d, f, g) {
			return 1 > (a /= g / 2) ? f / 2 * a * a + d : -f / 2 * (--a * (a - 2) - 1) + d
		},
		cubic: function(a, d, f, g) {
			return 1 > (a /= g / 2) ? f / 2 * Math.pow(a, 3) + d : f / 2 * (Math.pow(a - 2, 3) + 2) + d
		},
		quart: function(a, d, f, g) {
			return 1 > (a /= g / 2) ? f / 2 * Math.pow(a,
				4) + d : -f / 2 * (Math.pow(a - 2, 4) - 2) + d
		},
		quint: function(a, d, f, g) {
			return 1 > (a /= g / 2) ? f / 2 * Math.pow(a, 5) + d : f / 2 * (Math.pow(a - 2, 5) + 2) + d
		},
		sine: function(a, d, f, g) {
			return f / 2 * (1 - Math.cos(Math.PI * a / g)) + d
		},
		expo: function(a, d, f, g) {
			return 1 > (a /= g / 2) ? f / 2 * Math.pow(2, 10 * (a - 1)) + d : f / 2 * (-Math.pow(2, -10 * --a) + 2) + d
		},
		circ: function(a, d, f, g) {
			return 1 > (a /= g / 2) ? f / 2 * (1 - Math.sqrt(1 - a * a)) + d : f / 2 * (Math.sqrt(1 - (a -= 2) * a) + 1) + d
		},
		bounce: function(a, d, f, g) {
			return a < g / 2 ? 0.5 * Ease._in.bounce(2 * a, 0, f, g) + d : 0.5 * Ease._out.bounce(2 * a - g, 0, f, g) + 0.5 * f + d
		},
		back: function(a,
		               d, f, g, c) {
			void 0 == c && (c = 1.70158);
			return 1 > (a /= g / 2) ? f / 2 * a * a * (((c *= 1.525) + 1) * a - c) + d : f / 2 * ((a -= 2) * a * (((c *= 1.525) + 1) * a + c) + 2) + d
		}
	}
};
GlobalEvent = function(name, data) {
	this.name = name;
	this.data = data
};
GlobalEvent.RENDER_FRAME = "global_event_render_frame";
GlobalEvent.WINDOW_RESIZE = "global_event_window_resize";
GlobalEvent.WINDOW_SCROLL = "global_event_window_scroll";
GlobalEvent.WINDOW_LOAD = "global_event_window_load";
GlobalEvents = {
	registry: {},
	dispatch: function(event) {
		this.register(event.name);
		for (var eventListeners = this.registry[event.name], i = 0; i < eventListeners.length; i++) {
			eventListeners[i](event);
		}
	},
	addListener: function(a, d) {
		this.register(a);
		this.registry[a].push(d)
	},
	removeListener: function(a, d) {
		var f = this.registry[a];
		if (!f) return !1;
		for (var g = 0; g < f.length; g++) d == f[g] && f.splice(g, 1)
	},
	register: function(a) {
		this.registry[a] || (this.registry[a] = [])
	},
	destroy: function(a) {
		this.registry[a] = !1
	}
};
KeyboardEvent = function(a, d) {
	this.name = a;
	this.keyCode = d.keyCode
};
KeyboardEvent.KEY_DOWN = "keyboard_event_key_down";
KeyboardEvent.KEY_UP = "keyboard_event_key_up";
KeyCode = {
	UP: 38,
	LEFT: 37,
	RIGHT: 39,
	DOWN: 40
};
KeyboardEvents = {
	pressed: [],
	preventDefault: function(a) {
		KeyboardEvents.preventedKeys || (KeyboardEvents.preventedKeys = []);
		KeyboardEvents.preventedKeys.push(a)
	}
};
document.onkeydown = function(a) {
	-1 == KeyboardEvents.pressed.indexOf(a.keyCode) && (KeyboardEvents.pressed.push(a.keyCode), GlobalEvents.dispatch(new KeyboardEvent(KeyboardEvent.KEY_DOWN, a)))
};
document.onkeyup = function(a) {
	var d = KeyboardEvents.pressed.indexOf(a.keyCode); - 1 != d && (KeyboardEvents.pressed.splice(d, 1), GlobalEvents.dispatch(new KeyboardEvent(KeyboardEvent.KEY_UP, a)))
};
MouseEvent = function(a, d) {
	this.name = a;
	this.data = d
};
MouseEvent.ROLL_OVER = "mouse_event_roll_over";
MouseEvent.ROLL_OUT = "mouse_event_roll_out";
MouseEvent.MOUSE_UP = "mouse_event_mouse_up";
MouseEvent.MOUSE_DOWN = "mouse_event_mouse_down";
MouseEvent.CLICK = "mouse_event_click";
var R = {
	scrollbarWidth: 0,
	iOS: !1,
	iOSVersion: 0,
	mobile: !1,
	phone: !1,
	tablet: !1,
	renderEvent: new GlobalEvent(GlobalEvent.RENDER_FRAME),
	resizeEvent: new GlobalEvent(GlobalEvent.WINDOW_RESIZE),
	scrollEvent: new GlobalEvent(GlobalEvent.WINDOW_SCROLL),
	loadEvent: new GlobalEvent(GlobalEvent.WINDOW_LOAD),
	touch: "ontouchstart" in document.documentElement,
	init: function() {
		R.iOS = /iP(hone|od|ad)/.test(navigator.platform);
		if (R.iOS) {
			var a = navigator.appVersion.match(/OS (\d+)/);
			a && (R.iOSVersion = a[1])
		}
		R.phone = -1 != document.body.className.indexOf("phone");
		R.tablet = -1 != document.body.className.indexOf("tablet");
		R.mobile = R.phone || R.tablet;
		R.scale = R.getPixelRatio();
		R.mobile && GestureEvent.setup();
		R.prefixData = R.getPrefixData();
		window.onload = R.windowLoad;
		window.onresize = R.windowResize;
		window.onscroll = R.windowScroll
	},
	domReady: function() {
		R.scrollbarWidth = R.getScrollBarWidth();
		R.startRendering()
	},
	windowLoad: function() {
		GlobalEvents.dispatch(R.loadEvent)
	},
	windowResize: function() {
		clearTimeout(R.resizeTimeout);
		R.resizeTimeout = setTimeout(R.fireWindowResize, 120)
	},
	fireWindowResize: function() {
		GlobalEvents.dispatch(R.resizeEvent)
	},
	windowScroll: function() {
		clearTimeout(R.scrollTimeout);
		R.scrollTimeout = setTimeout(R.fireWindowScroll, 120)
	},
	fireWindowScroll: function() {
		GlobalEvents.dispatch(R.scrollEvent)
	},
	windowRender: function() {
		if (R.rendering) {
			R.prefixed.requestAnimationFrame(R.windowRender);
			GlobalEvents.dispatch(R.renderEvent);
		}
	},
	startRendering: function(a) {
		if (!R.rendering) {
			R.prefixed.requestAnimationFrame(R.windowRender);
			R.rendering = true;
		}
	},
	stopRendering: function() {
		R.rendering = !1
	},
	onNextFrame: function(a) {
		setTimeout(function() {
			a()
		}, 32)
	},
	getScrollBarWidth: function() {
		var pElem = document.createElement("p");
		pElem.style.width = "100%";
		pElem.style.height = "200px";
		var div = document.createElement("div");
		div.style.position = "absolute";
		div.style.top = "0px";
		div.style.left = "0px";
		div.style.visibility = "hidden";
		div.style.width = "200px";
		div.style.height = "150px";
		div.style.overflow = "hidden";
		div.appendChild(pElem);
		document.body.appendChild(div);
		var f = pElem.offsetWidth;
		div.style.overflow = "scroll";
		pElem = pElem.offsetWidth;
		f == pElem && (pElem = div.clientWidth);
		document.body.removeChild(div);
		return f - pElem
	},
	getPrefixData: function() {
		var prop, fakeElem = document.createElement("fake-element"),
			prefixes = {
				transition: {},
				transform: {}
			},
			transformProps = {
				transform: "transform",
				MozTransform: "-moz-transform",
				WebkitTransform: "-webkit-transform"
			},
			transitionProps = {
				transition: "transition",
				MozTransition: "-moz-transition",
				WebkitTransition: "-webkit-transition"
			},
			transitionEndProps = {
				transition: "transitionend",
				MozTransition: "transitionend",
				WebkitTransition: "webkitTransitionEnd"
			};
		for (prop in transitionProps)
			if (void 0 !== fakeElem.style[prop]) {
				prefixes.transition.jsProp = prop;
				prefixes.transition.cssProp = transitionProps[prop];
				break
			}
		for (prop in transformProps)
			if (void 0 !==
				fakeElem.style[prop]) {
				prefixes.transform.jsProp = prop;
				prefixes.transform.cssProp = transformProps[prop];
				break
			}
		for (prop in transitionEndProps)
			if (void 0 !== fakeElem.style[prop]) {
				prefixes.transition.endEvent = transitionEndProps[prop];
				break
			}
		return prefixes
	},
	onTransitionEnd: function(domElem, d, f, g) {
		f || (f = domElem);
		domElem.onTransitionEnd && (domElem.removeEventListener(R.prefixData.transition.endEvent, domElem.onTransitionEnd), delete domElem.onTransitionEnd);
		domElem.onTransitionEnd = function(e) {
			var target = e.srcElement || e.originalTarget;
			f && target != f || g && e.propertyName != g || (domElem.removeEventListener(R.prefixData.transition.endEvent, domElem.onTransitionEnd), delete domElem.onTransitionEnd,
				d())
		};
		domElem.addEventListener(R.prefixData.transition.endEvent, domElem.onTransitionEnd)
	},
	setTransform: function(domElem, transformProp) {
		domElem.style[R.prefixData.transform.jsProp] = transformProp
	},
	setTransition: function(domElem, transformProp) {
		transformProp = transformProp.replace(/transform/g, R.prefixData.transform.cssProp);
		domElem.style[R.prefixData.transition.jsProp] = transformProp;
		domElem.clientHeight
	},
	id: function(id) {
		return document.getElementById(id)
	},
	qs: function(selector) {
		return document.querySelector(selector)
	},
	qsa: function(selector) {
		return document.querySelectorAll(selector)
	},
	hasClass: function(a, d) {
		var f = !1,
			g = a.getAttribute("class"),
			c =
				" " + d + " "; - 1 < (" " + g + " ").replace(/[\n\t]/g, " ").indexOf(c) && (f = !0);
		return f
	},
	addClass: function(a, d) {
		if (!R.hasClass(a, d)) {
			var f = a.getAttribute("class") + " " + d;
			a.setAttribute("class", f)
		}
	},
	removeClass: function(a, d) {
		if (R.hasClass(a, d)) {
			var f = a.getAttribute("class").replace(RegExp("(?:^|\\s)" + d + "(?!\\S)"), "");
			a.setAttribute("class", f)
		}
	},
	toggleClass: function(a, d) {
		R.hasClass(a, d) ? R.removeClass(a, d) : R.addClass(a, d)
	},
	isEmpty: function(a) {
		return null != a && void 0 !== typeof a ? !1 : !0
	},
	visible: function(a, d) {
		var f = document.body.getBoundingClientRect(),
			g = a.getBoundingClientRect().top - f.top,
			c = g + a.offsetHeight,
			h = window,
			f = h.scrollY,
			h = f + h.innerHeight,
			k;
		!0 === d ? k = c : (k = g, g = c);
		return g <= h && k >= f
	},
	visiblePlus: function(a, d) {
		var f = document.body.getBoundingClientRect(),
			g = a.getBoundingClientRect().top - f.top,
			c = g + a.offsetHeight,
			h = window,
			f = h.scrollY - h.innerHeight,
			h = h.scrollY + h.innerHeight + h.innerHeight,
			k;
		!0 === d ? k = c : (k = g, g = c);
		return g <= h && k >= f
	},
	getTransformY: function(a) {
		return parseFloat((a.transform || a.WebkitTransform).substr(22))
	},
	getTransformX: function(a) {
		return parseFloat((a.transform ||
		a.WebkitTransform).split(",")[4])
	},
	getPixelRatio: function() {
		if (window.devicePixelRatio) return window.devicePixelRatio;
		if (window.matchMedia && window.matchMedia("(-moz-device-pixel-ratio: 2.0)").matches) return 2
	},
	redrawElement: function(dom) {
		var display = dom.style.display;
		dom.style.display = "none";
		dom.style.display = display
	},
	normalize: function(a, d, f, g, c) {
		return g + (a - d) / (f - d) * (c - g)
	}
};
var DragHelper = function() {
	var a = this,
		d, f, g, c, h, k, l, n, p, r, q, s = !1;
	this.dragComplete = this.drag = void 0;
	this.init = function(a, c) {
		return this
	};
	this.getDimensionX = function() {
		return window.innerWidth
	};
	this.getDimensionY = function() {
		return window.innerHeight
	};
	this.start = function(a) {
		a.touches && (a.clientX = a.touches[0].clientX, a.clientY = a.touches[0].clientY);
		l = a.clientX;
		k = a.clientY;
		g = new Date;
		p = a;
		q = r = h = c = 0;
		s = !1;
		R.touch ? (window.addEventListener("touchmove", this.inputMove), window.addEventListener("touchend", this.inputEnd)) :
			(window.addEventListener("mousemove", this.inputMove), window.addEventListener("mouseup", this.inputEnd));
		return !0
	};
	this.stop = function() {
		R.touch ? (window.removeEventListener("touchmove", this.inputMove), window.removeEventListener("touchend", this.inputEnd)) : (window.removeEventListener("mousemove", this.inputMove), window.removeEventListener("mouseup", this.inputEnd))
	};
	this.getOutcome = function(a, c) {
		var g = DragHelper.OUTCOME_NONE;
		90 <= a && 0 >= c || -90 >= a && 0 <= c ? g = DragHelper.OUTCOME_NONE : 0.15 <= c ? g = DragHelper.OUTCOME_BACK :
		-0.15 >= c && (g = DragHelper.OUTCOME_NEXT);
		return g
	};
	this.inputEnd = function(f) {
		f = a.getOutcome(r, c / a.getDimensionX());
		var d = a.getOutcome(q, h / a.getDimensionY());
		500 > new Date - g && 9 > Math.abs(c) && 9 > Math.abs(h) && (f = d = DragHelper.OUTCOME_CLICK);
		a.dragComplete(f, d);
		a.stop()
	};
	this.inputMove = function(g) {
		g.touches && (g.clientX = g.touches[0].clientX, g.clientY = g.touches[0].clientY);
		var t = g.clientX - p.clientX,
			u = g.clientY - p.clientY;
		p.clientX > g.clientX && -1 != d ? (r = t, d = -1) : p.clientX < g.clientX && 1 != d && (r = t, d = 1);
		p.clientY > g.clientY &&
		-1 != f ? (q = u, f = -1) : p.clientY < g.clientX && 1 != f && (q = u, f = 1);
		r += t / 2;
		q += u / 2;
		c = g.clientX - l;
		h = g.clientY - k;
		p = g;
		if (!s && a.onIntentClear) {
			var v = !1;
			8 < Math.abs(h) ? (a.onIntentClear(DragHelper.DRAG_DIRECTION_Y, c, h, g.clientX, g.clientY, t, u), v = !0) : 8 < Math.abs(c) && (a.onIntentClear(DragHelper.DRAG_DIRECTION_X, c, h, g.clientX, g.clientY, t, u), v = !0);
			v && (l = g.clientX, k = g.clientY, c = g.clientX - l, h = g.clientY - k, s = !0)
		}
		clearTimeout(n);
		n = setTimeout(function() {
			_dragSpeed = 0
		}, 120);
		if (a.onDrag && !a.onDrag(c, h, g.clientX, g.clientY, t, u)) return g.preventDefault(), !1
	};
	this.dragComplete = function(a, c) {
		if (this.onComplete) this.onComplete(a, c)
	};
	this.enableTextSelection = function(a) {
		a.style.WebkitUserSelect = "";
		a.style.cursor = "";
		a.onselectstart = null;
		a.onmousedown = null
	};
	this.disableTextSelection = function(a) {
		a.style.WebkitUserSelect = "none";
		a.style.cursor = "-webkit-grabbing";
		a.style.cursor = "-moz-grabbing";
		a.style.cursor = "grabbing";
		a.onselectstart = function() {
			return !1
		};
		a.onmousedown = function() {
			return !1
		}
	}
};
DragHelper.DRAG_DIRECTION_X = "DRAG_HELPER_DIRECTION_X";
DragHelper.DRAG_DIRECTION_Y = "DRAG_HELPER_DIRECTION_Y";
DragHelper.OUTCOME_CLICK = "DRAG_HELPER_OUTCOME_CLICK";
DragHelper.OUTCOME_NEXT = "DRAG_HELPER_OUTCOME_NEXT";
DragHelper.OUTCOME_BACK = "DRAG_HELPER_OUTCOME_BACK";
DragHelper.OUTCOME_NONE = "DRAG_HELPER_OUTCOME_NONE";
R = R || {};
R.Prefixed = function() {
	var a = null,
		d = "",
		f = {
			cursor: [{
				value: "grab",
				pattern: /grab/
			}],
			transition: [{
				value: "transform 1s ease 0s",
				pattern: /transform/
			}]
		},
		g = "";
	this.init = function() {
		a = document.createElement("div");
		a: {
			for (var n in a.style) {
				var p = n.toLowerCase().match(/^(webkit|moz|ms)/);
				if (p) {
					d = "-" + p[1] + "-";
					break a
				}
			}
			d = ""
		}
		n = {};
		for (var r in f)
			if (prop = c(r))
				for (var q in f[r])
					if (p = f[r][q], a.style[prop] = p.value, a.style[prop] != p.value) {
						var s = p.value.replace(p.pattern, d + "$&");
						a.style[prop] = s;
						a.style[prop] == s && (n[r] ||
						(n[r] = []), n[r].push(p.pattern))
					}
		f = n;
		r = c("transition");
		g = "-webkit-transition" == r ? "WebkitTransitionEnd" : r ? "transitionend" : void 0;
		this.prefix = d;
		this.style = c;
		this.setStyle = h;
		this.onTransitionEnd = k;
		this.requestAnimationFrame = requestAnimationFrame(60);
		return this
	};
	var c = function(g, h) {
			if (!h) return g in a.style ? g : d + g in a.style ? d + g : !1;
			var k = f[g],
				l;
			for (l in k) h = h.replace(k[l], d + "$&");
			g = c(g);
			a.style[g] = "";
			a.style[g] = h;
			return a.style[g] ? h : !1
		},
		h = function(a, g, f) {
			f = c(g, f);
			return (g = c(g)) && f ? (a.style[g] = f, a.style[g]) : !1
		},
		k = function(a,
		             f, d) {
			if (!a || !f || !d) throw "Missing parameters";
			a.removeEventListener(g, a.onTransitionEnd);
			a.onTransitionEnd = function(h) {
				if (h.target != a || h.propertyName != c(d)) return !1;
				a.removeEventListener(g, a.onTransitionEnd);
				delete a.onTransitionEnd;
				f()
			};
			a.addEventListener(g, a.onTransitionEnd)
		},
		requestAnimationFrame = function(a) {
			var c = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(a) {
					window.setTimeout(a, 1E3 / 60)
				};
			return function(a) {
				c.call(window, a)
			}
		}
};
R.prefixed = (new R.Prefixed).init();
R.Nav = function() {
	var self = this;
	this.html = {};
	this.open = !1;
	this.delegate = null;
	this.contentMode = !1;
	this.init = function(a) {
		this.delegate = a;
		this.html.siteNavDiv = R.qs(".site-nav");
		this.html.navPaginationDiv = R.qs(".nav-pagination");
		this.html.navBarBgDiv = R.qs(".nav-bar-bg");
		this.html.navBarDiv = R.qs(".nav-bar");
		this.html.navLogoLink = R.qs(".nav-link-logo");
		this.html.navMenuLink = R.qs(".nav-link-menu");
		this.html.navMenuLinkOuter = R.qs(".nav-link-menu-outer");
		this.html.navMenuContent = R.qs("#nav-menu-content");
		this.html.navMenuDiv = R.qs("#nav-menu");
		this.html.navMenuContentCopies = R.qsa(".nav-menu-content");
		this.html.navPaginationList = R.qs(".nav-pagination ul");
		this.html.siteHeadPaginationDiv = R.qs(".site-head-pagination");
		this.html.baseContentDivs = R.qsa(".nav-menu-base-content");
		this.html.foldContentDivs = R.qsa(".nav-menu-fold-content");
		this.html.menuLinks = R.qsa("#nav-menu-content a");
		this.html.navMenuLink.onclick = this.menuClick.bind(this);
		this.initMenuContent();
		this.addListeners();
		this.resize();
		return this
	};
	this.addListeners = function() {
		GlobalEvents.addListener(GlobalEvent.WINDOW_RESIZE, this.resize.bind(this));
		GlobalEvents.addListener(GlobalEvent.WINDOW_LOAD, this.resize.bind(this));
		for (var a = 0; a < this.html.menuLinks.length; a++) this.html.menuLinks[a].onclick = this.menuLinkClick;
		this.html.navLogoLink.onclick = this.logoClick.bind(this)
	};
	this.menuLinkClick = function(e) {
		e.stopPropagation();
		return self.delegate.menuLinkClick(this)
	};
	this.logoClick = function(e) {
		e.stopPropagation();
		this.delegate.navLogoClick();
		return !1
	};
	this.initMenuContent = function() {
			for (var navHtml = this.html.navMenuContent.innerHTML, f = this.html.navMenuContentCopies.length; f--;) this.html.navMenuContentCopies[f].innerHTML = navHtml
		};
	this.resize = function() {
		for (var pageWidth = document.documentElement.clientWidth, f = this.html.navMenuContentCopies.length; f--;) this.html.navMenuContentCopies[f].style.width = pageWidth + "px"
	};
	this.menuClick = function(e) {
		e.stopPropagation();
		self.delegate.menuClick();
		return !1
	};
	this.menuWillOpen = function() {
		this.contentMode == R.Site.CONTENT_MODE_CONTENT ? (R.setTransition(this.html.navPaginationDiv,
			"opacity .25s linear"), this.html.navPaginationDiv.style.opacity = "0") : (R.setTransition(this.html.siteHeadPaginationDiv, "opacity .25s linear"), this.html.siteHeadPaginationDiv.style.opacity = "0");
		window.oldtouchmove = window.ontouchmove;
		window.ontouchmove = function(e) {
			e.stopPropagation();
			return !1
		};
		R.setTransition(this.html.navLogoLink, "opacity .25s linear");
		this.html.navLogoLink.style.opacity = "0";
		R.onTransitionEnd(this.html.navLogoLink, function() {
			self.html.siteHeadPaginationDiv.style.display = "none";
			self.html.navPaginationDiv.style.display =
				"none";
			self.html.navLogoLink.style.display = "none"
		});
		R.addClass(self.html.navMenuLink, "active")
	};
	this.menuWillClose = function() {
		this.contentMode == R.Site.CONTENT_MODE_CONTENT ? (this.html.navPaginationDiv.style.display = "block", R.setTransition(this.html.navPaginationDiv, "opacity .25s linear"), this.html.navPaginationDiv.style.opacity = "1") : (this.html.siteHeadPaginationDiv.style.display = "block", R.setTransition(this.html.siteHeadPaginationDiv, "opacity .25s linear .85s"), this.html.siteHeadPaginationDiv.style.opacity =
			"1");
		window.ontouchmove = window.oldtouchmove;
		this.html.navLogoLink.style.display = "";
		R.setTransition(this.html.navLogoLink, "opacity .25s linear");
		this.html.navLogoLink.style.opacity = "1";
		R.removeClass(this.html.navMenuLink, "active")
	};
	this.openMenu = function(callback) {
		self.html.navMenuDiv.style.display = "block";
		self.html.navMenuDiv.clientWidth;
		R.addClass(self.html.siteNavDiv, "nav-menu-open animating");
		R.onTransitionEnd(self.html.navMenuContent, function() {
			R.removeClass(self.html.siteNavDiv, "animating");
			callback && callback()
		})
	};
	this.closeMenu = function(callback) {
			R.addClass(self.html.siteNavDiv, "animating");
			R.removeClass(self.html.siteNavDiv, "nav-menu-open");
			R.onTransitionEnd(self.html.navMenuDiv, function() {
				R.removeClass(self.html.siteNavDiv, "animating");
				self.html.navMenuDiv.style.display = "none";
				callback && callback()
			})
		};
	this.setForegroundColor = function(color) {
		this.html.navBarBgDiv.style.backgroundColor = color;
		for (var i = 0; i < this.html.baseContentDivs.length; i++) {
			var g = this.html.baseContentDivs[i];
			g.style.backgroundColor = color
		}
		for (i = 0; i < this.html.foldContentDivs.length; i++) g = this.html.foldContentDivs[i],
			g.style.backgroundColor = color;
		this.html.navMenuContent.style.backgroundColor = color
	};
	this.setBackgroundColor = function(color) {
		this.html.navBarDiv.style.backgroundColor = color
	};
	this.enterContentMode = function() {
		if (this.contentMode) return !1;
		this.contentMode = !0;
		this.useLightIcons()
	};
	this.exitContentMode = function() {
		if (!this.contentMode) return !1;
		this.contentMode = !1;
		this.useDarkIcons()
	};
	this.useLightIcons = function() {
		R.addClass(this.html.navMenuLink, "content-mode");
		R.addClass(this.html.navLogoLink, "content-mode")
	};
	this.useDarkIcons = function() {
			R.removeClass(this.html.navMenuLink, "content-mode");
			R.removeClass(this.html.navLogoLink, "content-mode")
		};
	this.showBg = function() {
		this.html.navBarBgDiv.style.visibility = "visible"
	};
	this.hideBg = function() {
		this.html.navBarBgDiv.style.visibility = "hidden"
	};
	this.hidePagination = function(noTransition) {
		if (noTransition) {
			R.setTransition(this.html.navPaginationDiv, "");
			this.html.navPaginationDiv.style.display = "none";
		} else {
			R.setTransition(this.html.navPaginationDiv, "opacity .2s linear");
			this.html.navPaginationDiv.style.opacity = "0";
			R.onTransitionEnd(this.html.navPaginationDiv, function() {
				self.html.navPaginationDiv.style.display = "none"
			});
		}
	};
	this.showPagination = function() {
		this.html.navPaginationDiv.style.display = "block";
		this.html.navPaginationDiv.style.opacity = "0";
		R.onNextFrame(function() {
			R.setTransition(self.html.navPaginationDiv, "opacity .2s linear");
			self.html.navPaginationDiv.style.opacity = "1"
		})
	};
	this.updateMenuStatus = function() {
		this.html.navMenuDiv.setAttribute("data-path", window.location.pathname)
	}
};
R.Pagination = function() {
	var self = this;
	this.html = {
		sitePaginationDiv: null,
		navPaginationList: null,
		navPaginationItems: [],
		navPaginationLinks: []
	};
	this.open = !1;
	this.page = 0;
	this.inverted = !1;
	this.delegate = null;
	this.init = function(delegate, pagerDom) {
		this.delegate = delegate;
		this.html.sitePaginationDiv = pagerDom;
		this.html.sitePaginationList = pagerDom.querySelector("ul");
		this.html.sitePaginationItems = pagerDom.querySelectorAll("li");
		this.html.sitePaginationLinks = pagerDom.querySelectorAll("a");
		for (var i = 0; i < this.html.sitePaginationItems.length; i++)
			if (/selected/.test(this.html.sitePaginationItems[i].className)) {
				this.page =
					i;
				break
			}
		for (i = 0; i < this.html.sitePaginationLinks.length; i++) this.html.sitePaginationLinks[i].onclick = this.pageClick;
		return this
	};
	this.pageClick = function(e) {
		e.stopPropagation();
		for (e = 0; e < self.html.sitePaginationLinks.length && self.html.sitePaginationLinks[e] != this; e++);
		self.delegate.paginationClick(e);
		return !1
	};
	this.show = function() {
		this.html.sitePaginationDiv.style.display = "block"
	};
	this.hide = function() {
		this.html.sitePaginationDiv.style.display = "none"
	};
	this.invertIcons = function() {
		this.html.sitePaginationList.style.borderColor =
			this.inverted ? "" : "#fff";
		this.inverted = !this.inverted
	};
	this.enterContentMode = function() {
		this.html.sitePaginationDiv.style.position = "fixed";
		this.html.sitePaginationDiv.style.top = "0"
	};
	this.exitContentMode = function() {
		this.html.sitePaginationDiv.style.position = "";
		this.html.sitePaginationDiv.style.top = ""
	};
	this.setPage = function(pageIndex, f) {
		if (pageIndex != this.page) {
			var index = this.delegate.getRealIndex(this.page),
				pageItem = this.delegate.getRealIndex(pageIndex);
			R.removeClass(this.html.sitePaginationItems[index], "selected");
			R.addClass(this.html.sitePaginationItems[pageItem],
				"selected");
			this.page = pageIndex
		}
	}
};
R.Badge = function() {
	var self = this,
		site = this.site = null,
		tweenObj = {
			value: 0
		};
	this.html = {
		siteBadgeDiv: null,
		siteBadgeContentDiv: null,
		badgeControlsDiv: null,
		badgeNextLink: null,
		badgeBackLink: null,
		badgeCurrentSpan: null,
		badgeTotalSpan: null
	};
	this.init = function(site) {
		this.site = site;
		this.html.siteBadgeDiv = R.qs(".site-badge");
		this.html.siteBadgeContentDiv = R.qs(".site-badge-content");
		this.html.siteBadgePerspectiveDiv = R.qs(".site-badge-perspective");
		this.html.badgeControlsDiv = R.qs(".badge-controls");
		this.html.badgeCurrentSpan = R.qs(".badge-current");
		this.html.badgeTotalSpan = R.qs(".badge-total");
		this.html.badgeNextLink = R.qs(".badge-next-link");
		this.html.badgeBackLink = R.qs(".badge-back-link");
		this.html.badgeBackSpan = R.qs(".badge-back");
		this.html.badgeNextSpan = R.qs(".badge-next");
		this.page = parseInt(this.html.badgeCurrentSpan.innerHTML) - 1;
		this.addListeners();
		return this
	};
	this.addListeners = function() {
		this.html.badgeNextLink.onmouseover = this.nextOver;
		this.html.badgeBackLink.onmouseover = this.backOver;
		this.html.badgeNextLink.onclick = this.nextClick;
		this.html.badgeBackLink.onclick =
			this.backClick;
		this.html.badgeNextLink.onmouseout = this.nextOut;
		this.html.badgeBackLink.onmouseout = this.backOut
	};
	this.nextClick = function() {
		self.site.badgeNextClick();
		return !1
	};
	this.backClick = function() {
		self.site.badgeBackClick();
		return !1
	};
	this.nextOver = function() {
		self.html.badgeNextSpan.style.opacity = "1";
		self.animating || self.tilt(30)
	};
	this.nextOut = function() {
		self.html.badgeNextSpan.style.opacity = ".2";
		self.animating || self.tilt(0)
	};
	this.backOver = function() {
		self.html.badgeBackSpan.style.opacity = "1";
		self.animating || self.tilt(-30)
	};
	this.backOut =
		function() {
			self.html.badgeBackSpan.style.opacity = ".2";
			self.animating || self.tilt(0)
		};
	this.tilt = function(value) {
		site && site.stop();
		site = new Tween(tweenObj, 500, {
			ease: Ease.easeOut.sine,
			value: value,
			onUpdate: function() {
				R.setTransform(self.html.siteBadgePerspectiveDiv, "rotateY(" + tweenObj.value + "deg)")
			},
			onComplete: function() {
				0 == tweenObj.value && R.setTransform(self.html.siteBadgePerspectiveDiv, "")
			}
		})
	};
	this.setPage = function(pageIndex, c, transition, quick) {
		if (pageIndex != this.page) {
			if (transition) {
				site && site.stop();
				this.animating = !0;
				var duration = quick ? 200 : 400;
				R.setTransition(this.html.siteBadgePerspectiveDiv, "none");
				new Tween(tweenObj,
					duration, {
						ease: Ease.easeIn.sine,
						value: 90 * c,
						onUpdate: function() {
							R.setTransform(self.html.siteBadgePerspectiveDiv, "rotateY(" + tweenObj.value + "deg)")
						},
						onComplete: function() {
							new Tween(tweenObj, duration, {
								ease: Ease.easeOut.sine,
								value: 0,
								delay: 50,
								onUpdate: function() {
									R.setTransform(self.html.siteBadgePerspectiveDiv, "rotateY(" + -1 * tweenObj.value + "deg)")
								},
								onComplete: function() {
									R.setTransform(self.html.siteBadgePerspectiveDiv, "");
									self.animating = !1
								}
							});
							self.html.badgeCurrentSpan.innerHTML = self.site.getRealIndex(pageIndex) + 1
						}
					})
			} else self.html.badgeCurrentSpan.innerHTML = self.site.getRealIndex(pageIndex) +
				1;
			this.page = pageIndex
		}
	}
};
R.Site = function() {
	var self = this;
	R.Site.historyState = null;
	var modeContent = R.Site.CONTENT_MODE_CONTENT,
		modeMasthead = R.Site.CONTENT_MODE_MASTHEAD;
	this.html = {};
	this.animations = this.navPagination = this.headerPagination = this.badge = this.nav = null;
	this.mobileSize = this.pagesLoaded = !1;
	this.ribbonManager = this.ribbonCenter = this.ribbon = null;
	this.ribbonColorTransitions = [];
	this.mouseWheelSuspended = this.menuOpen = this.animating = !1;
	this.mouseWheelSpeedY = this.mouseWheelSpeedX = this.mouseWheelLastY = this.mouseWheelLastX = this.mouseWheelDirection = 0;
	this.dragHelper = null;
	this.dragging = this.dragSuspended = !1;
	this.dragSide = this.dragOffset = 0;
	this.contentMode = modeMasthead;
	this.pageIndex = PAGE_INDEX;
	this.pagesLength = PAGE_DATA.length;
	this.navHeight = this.ribbonWidth = 0;
	this.navArrowShowing = !0;
	this.currentFooter = null;
	this.footerShowing = !1;
	this.dribbbleShots = [];
	this.pageBodyImages = [];
	this.pageBodyBgDivs = [];
	this.init = function() {
		if ("simple" != document.body.className) {
			this.html.siteDiv = R.qs(".site");
			this.html.siteBodyDiv = R.qs(".site-body");
			this.html.siteBodyPageAreaDiv = R.qs(".site-body .page-area");
			this.html.siteNavDiv = R.qs(".site-nav");
			this.html.navBarBgDiv = R.qs(".nav-bar-bg");
			this.html.navMenuLink = R.qs(".nav-link-menu");
			this.html.navPaginationDiv = R.qs(".nav-pagination");
			this.html.navPaginationList = R.qs(".nav-pagination ul");
			this.html.navDirectionDiv = R.qs(".site-nav .nav-direction");
			this.html.navArrowLink = R.qs(".site-nav a.nav-arrow");
			this.html.siteHeadDiv = R.qs(".site-head");
			this.html.siteHeadPageAreaDiv = R.qs(".site-head .page-area");
			this.html.siteHeadPaginationDiv = R.qs(".site-head-pagination");
			this.html.siteHeadArrowsDiv = R.qs(".site-head-arrows");
			this.html.siteHeadDirectionDiv = R.qs(".site-head .site-direction");
			this.html.siteHeadDownArrowLink = R.qs(".site-head a.down-arrow");
			this.html.siteRibbonDiv = R.qs(".site-ribbon");
			this.html.pageHeadDivs = Array(PAGE_DATA.length);
			this.html.pageHeadDivs[this.pageIndex] = R.qs(".page-head");
			this.html.pageBodyDivs = Array(PAGE_DATA.length);
			this.html.pageBodyDivs[this.pageIndex] = R.qs(".page-body");
			this.html.pageBodyImages = Array(PAGE_DATA.length);
			this.html.pageBodyBgDivs = Array(PAGE_DATA.length);
			this.html.pageContentDivs = Array(PAGE_DATA.length);
			this.html.pageContentDivs[this.pageIndex] = R.qs(".page-content");
			this.nav = (new R.Nav).init(this);
			this.badge = (new R.Badge).init(this);
			this.navPagination = (new R.Pagination).init(this, this.html.navPaginationDiv);
			this.headerPagination = (new R.Pagination).init(this, this.html.siteHeadPaginationDiv);
			this.dragHelper = (new DragHelper).init();
			this.createRibbon();
			this.loadPages();
			if (!R.touch) {
				document.body.style.overflow = "hidden"
			} else {
				this.html.siteDiv.style.overflow = "hidden";
				window.onload = function() {
					setTimeout(function() {
						self.html.siteDiv.style.overflow = "";
						R.redrawElement(document.body)
					}, 32)
				};
			}
			if (R.scrollbarWidth > 0) {
				this.html.pageBodyDivs[this.pageIndex].style.paddingRight = R.scrollbarWidth + "px";
				if (0 == this.pageIndex) {
					this.adjustStudioHeader();
				}
			}
			this.nav.setForegroundColor(this.getPrimaryColor());
			return this;
		}
	};
	this.adjustStudioHeader = function() {
		R.qs("#studio header").style.marginRight = -R.scrollbarWidth + "px"
	};
	this.loadPages = function() {
		new Ajax({
			method: "GET",
			path: "/surrounding/" + PAGE_DATA[this.pageIndex].slug + "/",
			onComplete: this.onPagesLoaded.bind(this)
		})
	};
	this.onPagesLoaded = function(a) {
		var div = this.html.pageBodyDivs[this.pageIndex];
		div.insertAdjacentHTML("beforebegin", a.html_before);
		div.insertAdjacentHTML("afterend", a.html_after);
		div = this.html.pageHeadDivs[this.pageIndex];
		div.insertAdjacentHTML("beforebegin", a.header_html_before);
		div.insertAdjacentHTML("afterend", a.header_html_after);
		this.html.pageBodyDivs = R.qsa(".page-body");
		this.html.pageHeadDivs = R.qsa(".page-head");
		this.html.pageContentDivs = R.qsa(".page-content");
		this.pagesLoaded = !0;
		0 < R.scrollbarWidth && this.adjustStudioHeader();
		this.findInternalLinks();
		this.setupDribbbleShots();
		if (R.touch) {
			a = this.html.pageContentDivs[0].getElementsByClassName("person");
			new TapBios(a);
			div = this.html.pageContentDivs[0].getElementsByClassName("client");
			for (a = div.length - 1; 0 <= a; a--) new TapNonHoverable(div[a]);
			div = this.html.pageContentDivs[0].getElementsByClassName("award");
			for (a = div.length - 1; 0 <= a; a--) new TapNonHoverable(div[a])
		}
		var f = this,
			c = R.qsa(".page-head-actions a");
		for (a = 0; a < c.length; a++) c[a].onclick = function(a) {
			a = f.getPageIndexForPath(this.pathname);
			var c = a > f.pageIndex ? 1 : -1;
			a == f.pageIndex ? f.animateToContent() : f.animateToHeaderIndex(a, c, !0);
			return !1
		};
		this.enableDragging();
		this.addListeners()
	};
	this.resizeRibbon = function() {

		if (window.innerWidth < 768) {
			this.ribbonWidth = 60;
			this.navHeight = 40;
		} else {
			this.ribbonWidth = 136;
			this.navHeight = 60;
		}
		var canvas = R.id("ribbon");
		canvas.width = window.innerWidth * R.scale;
		canvas.height = window.innerHeight * R.scale;
		canvas.style.width = window.innerWidth + "px";
		canvas.style.height = window.innerHeight + this.navHeight + "px";
		if (this.ribbon) {
			this.ribbon.setWidth(this.ribbonWidth, this.navHeight);
			this.ribbon.straighten();
			this.ribbon.resetSize();
		}
	};
	this.createRibbon = function() {
		this.ribbon = new Ribbon(
			R.id("ribbon"),
			PAGE_DATA[this.pageIndex].colors.ribbonPrimary,
			PAGE_DATA[this.pageIndex].colors.ribbonSecondary,
			R.scale
		);
		this.resizeRibbon();
		this.ribbonManager = new RibbonInteractionManager(this.ribbon);
	};
	this.addListeners = function() {
		GlobalEvents.addListener(GlobalEvent.WINDOW_RESIZE, this.onResize.bind(this));
		GlobalEvents.addListener(GlobalEvent.WINDOW_SCROLL, this.onScroll.bind(this));
		this.html.siteHeadDownArrowLink.onclick = this.downArrowClick.bind(this);
		window.onkeydown = this.onKeyDown.bind(this);
		if (!R.touch) {
			var a = document.documentElement;
			a.addEventListener("mousewheel", this.onMouseWheel.bind(this), !1);
			a.addEventListener("wheel", this.onMouseWheel.bind(this), !1);
			window.onunload = function() {
				window.scrollTo(0, 0)
			}
		}
		window.onpopstate = this.onPopState.bind(this);
		window.history.state ||
		(a = {
			count: 0
		}, R.Site.historyState = a, window.history.replaceState(a, document.title, window.location.pathname));
		R.Site.historyCount = window.history.state.count;
		this.onResize()
	};
	this.downArrowClick = function() {
		this.animateToContent();
		return !1
	};
	this.upArrowClick = function() {
		this.animateToMasthead();
		return !1
	};
	this.onScroll = function() {
		if (this.contentMode == modeContent) {
			for (var a = 0; a < this.icons.length; a++) {
				var c = this.icons[a];
				R.visible(c, !0) && R.addClass(c, "case-study-icon-anim")
			}!this.footerShowing && window.innerHeight > this.currentFooter.getBoundingClientRect().top ?
				(this.footerShowing = !0, R.startRendering(), this.dribbbleShots[this.pageIndex] && this.dribbbleShots[this.pageIndex].setOnscreen(!0)) : this.footerShowing && window.innerHeight < this.currentFooter.getBoundingClientRect().top && (this.footerShowing = !1, R.stopRendering(), this.dribbbleShots[this.pageIndex] && this.dribbbleShots[this.pageIndex].setOnscreen(!1))
		}
		this.loadVisibleImages();
		this.loadVisibleBgDivs()
	};
	this.onResize = function() {
		!this.mobileSize && 768 > window.innerWidth ? (this.mobileSize = !0, this.updateDownArrow()) :
		this.mobileSize && 768 <= window.innerWidth && (this.mobileSize = !1, this.updateDownArrow());
		this.contentMode == modeMasthead && this.resizeRibbon();
		this.currentFooter = this.html.pageBodyDivs[this.pageIndex].getElementsByTagName("footer")[0]
	};
	this.onFontsReady = function() {};
	this.getRealIndex = function(pageIndex) {
		pageIndex %= this.pagesLength;
		0 > pageIndex && (pageIndex += this.html.pageBodyDivs.length);
		return pageIndex
	};
	this.getBackgroundColor = function(a) {
		void 0 === a && (a = this.pageIndex);
		a = this.getRealIndex(a);
		return PAGE_DATA[a].colors.background
	};
	this.getPrimaryColor = function(a) {
		void 0 ===
		a && (a = this.pageIndex);
		a = this.getRealIndex(a);
		return PAGE_DATA[a].colors.ribbonPrimary
	};
	this.getSecondaryColor = function(a) {
		void 0 === a && (a = this.pageIndex);
		a = this.getRealIndex(a);
		return PAGE_DATA[a].colors.ribbonSecondary
	};
	this.updateHeaders = function() {
		var a = this.html.pageHeadDivs[this.pageIndex];
		a.style.display = "block";
		a.style.right = "";
		a.style.left = "";
		for (a = 0; a < this.html.pageHeadDivs.length; a++)
			if (a != this.pageIndex) {
				var c = this.html.pageHeadDivs[a];
				c.style.display = "none";
				c.style.right = "";
				c.style.left =
					""
			}
		this.updateDownArrow()
	};
	this.activateIcons = function() {
		this.icons = this.html.pageBodyDivs[this.pageIndex].querySelectorAll(".case-study-icon");
		for (var a = 0; a < this.icons.length; a++) R.addClass(this.icons[a], "case-study-icon-ready")
	};
	this.activateSlideshows = function() {
		for (var a = this.html.pageBodyDivs[this.pageIndex], c = a.querySelectorAll(".slideshow"), f = a.querySelectorAll(".device-slideshow"), d = a.querySelectorAll(".simple-slideshow"), l = a.querySelectorAll(".slideshow, .device-slideshow, .simple-slideshow"),
			     n = 0; n < l.length; n++) a = l[n], a.slideshow && a.slideshow.deactivate();
		for (l = 0; l < c.length; l++) a = c[l], a.slideshow || (a.slideshow = (new R.Slideshow).init(a)), a.slideshow.activate();
		for (c = 0; c < f.length; c++) a = f[c], a.slideshow || (a.slideshow = (new R.DeviceSlider).init(a)), a.slideshow.activate();
		for (f = 0; f < d.length; f++) c = d[f], c.slideshow || (c.slideshow = (new R.SimpleSlider).init(c)), c.slideshow.activate()
	};
	this.activateVideoPlayers = function() {
		for (var a = this.html.pageBodyDivs[this.pageIndex].querySelectorAll(".device-screen > .video-player"),
			     c = 0; c < a.length; c++) {
			var f = a[c];
			f.videoPlayer || (f.videoPlayer = (new R.VideoPlayer).init(f))
		}
	};
	this.activateCodeSnippets = function() {
		for (var a = this.html.pageBodyDivs[this.pageIndex], c = a.querySelectorAll(".code-collection"), f = a.querySelectorAll(".code-sample"), d = a.querySelectorAll(".code-sample code"), l = a.querySelectorAll(".code-sample pre"), a = a.querySelectorAll(".code-expand-button"), n = a.length; n--;) {
			var p = a[n];
			p.collection = c[n];
			p.sample = f[n];
			p.code = d[n];
			p.pre = l[n];
			p.code.style.top = R.scrollbarWidth + "px";
			p.code.style.marginTop = "-" + R.scrollbarWidth + "px";
			p.addEventListener("click", function() {
				R.hasClass(this.collection, "expanded") ? (R.removeClass(this.collection, "expanded"), this.sample.style.height = "") : (R.addClass(this.collection, "expanded"), this.sample.style.height = this.pre.clientHeight + "px")
			})
		}
	};
	this.updateContent = function() {
		for (var a = 0; a < this.html.pageBodyDivs.length; a++) {
			var c = this.html.pageBodyDivs[a];
			c.style.display = "none"
		}
		c = this.html.pageBodyDivs[this.pageIndex];
		c.style.display = "block";
		0 < R.scrollbarWidth &&
		(c.style.paddingRight = R.scrollbarWidth + "px");
		c = c.querySelectorAll(".page-section");
		for (a = 0; a < c.length; a++) c[a].style.display = "none";
		c[0].style.display = "";
		c[1].style.display = "";
		this.nav.setForegroundColor(this.getPrimaryColor());
		this.html.siteBodyDiv.style.backgroundColor = this.getBackgroundColor();
		this.updateImages()
	};
	this.animateToContent = function() {
		if (!(this.animating || this.menuOpen || this.dragging)) {
			this.animating = !0;
			var f = this.ribbon.getCurrentVerticalPosition();
			this.ribbon.verticalPosition = f;
			this.ribbon.positionDamping = 1;
			this.ribbon.canDestruct = false;
			var c = window.innerHeight,
				h = (c - self.navHeight) / c,
				k = !1,
				l = {
					value: 0
				};
			new Tween(l, 860, {
				value: window.innerHeight,
				ease: Ease.easeInOut.sine,
				onUpdate: function() {
					R.setTransform(self.html.siteDiv, "translate3d(0," + -l.value + "px,0)");
					var d = l.value / c,
						p = Math.min(d, 1);
					self.ribbon.straightenStrength = Math.min(p, 1);
					self.ribbon.verticalPosition = f - f * p;
					self.ribbon.straighten();
					d >= h && (0 < R.scrollbarWidth && (d = R.normalize(d, h, 1, 0, 1), R.setTransform(self.html.navMenuLink, "translate3d(" + d * -R.scrollbarWidth + "px,0,0)")),
					k || (self.nav.enterContentMode(), k = !0))
				},
				onComplete: function() {
					R.onNextFrame(function() {
						self.setContentMode(modeContent);
						self.ribbon.canDestruct = true;
						self.animating = !1
					})
				}
			})
		}
	};
	this.prepareToAnimateToMasthead = function() {
		for (var a = this.html.pageBodyDivs[this.pageIndex].querySelectorAll(".page-section"), c = 2; c < a.length; c++) a[c].style.display = "none";
		R.setTransform(this.html.siteDiv, "translate3d(0,-100%,0)");
		this.html.siteDiv.style.top = "";
		R.touch || (document.body.style.overflow = "hidden");
		0 < R.scrollbarWidth && (this.html.pageBodyDivs[this.pageIndex].style.paddingRight =
			R.scrollbarWidth + "px", R.setTransform(this.html.navMenuLink, "translate3d(" + -R.scrollbarWidth + "px,0,0)"));
		0 < R.scrollbarWidth && (this.html.siteBodyDiv.style.backgroundColor = this.getBackgroundColor(), document.body.style.backgroundColor = this.getBackgroundColor());
		this.ribbon.setColors(new Color(PAGE_DATA[this.pageIndex].colors.ribbonPrimary), new Color(PAGE_DATA[this.pageIndex].colors.ribbonSecondary));
		R.startRendering();
		this.resizeRibbon();
		this.ribbonManager.attachToRenderFrame();
		this.nav.hidePagination(!0);
		this.nav.hideBg()
	};
	this.animateToMasthead = function() {
		if (!(this.animating || this.menuOpen || this.dragging)) {
			this.animating = !0;
			0 < R.scrollbarWidth && R.setTransform(this.html.navMenuLink, "translate3d(" + -R.scrollbarWidth + "px,0,0)");
			this.prepareToAnimateToMasthead();
			var g = this.ribbon.getCurrentVerticalPosition();
			this.ribbon.verticalPosition = g;
			this.ribbon.positionDamping = true;
			this.ribbon.canDestruct = false;
			var c = window.innerHeight,
				d = (c - self.navHeight) / c,
				k = !1,
				l = {
					value: c
				};
			new Tween(l, 860, {
				value: 0,
				ease: Ease.easeInOut.sine,
				onUpdate: function() {
					R.setTransform(self.html.siteDiv, "translate3d(0," + -l.value + "px,0)");
					var f = l.value / c,
						g = Math.min(f, 1);
					self.ribbon.verticalPosition = 0.5 * (1 - g);
					self.ribbon.positionDamping = g;
					self.ribbon.straightenStrength = g;
					self.ribbon.straighten();
					f <= d && (0 < R.scrollbarWidth && (f = R.normalize(f, d, 1, 0, 1), f = 1 - Math.min(-f, 1), R.setTransform(self.html.navMenuLink, "translate3d(" + f * -R.scrollbarWidth + "px,0,0)")), k || (self.nav.exitContentMode(), k = !0))
				},
				onComplete: function() {
					self.setContentMode(modeMasthead);
					self.ribbon.canDestruct = false;
					self.animating = false
				}
			})
		}
	};
	this.animateToHeaderIndex = function(f, c, d) {
		if (!(this.animating || this.dragging || this.menuOpen || f == this.pageIndex)) {
			this.animating = !0;
			var k = this.pageIndex;
			this.pageIndex = f = this.getRealIndex(f);
			this.setPage(f, c);
			d && this.updateHistory(c);
			this.ribbon.speed = 0;
			d = this.html.pageHeadDivs[f];
			d.style.display = "block";
			d.style.left = 100 * c + "%";
			d.style.right = -100 * c + "%";
			768 > window.innerWidth && (0 == f ? this.hideDownArrow(400, 0) : this.showDownArrow(400, 400));
			var l = this.getColorTransitions(k, f),
				n = window.innerWidth,
				p = 0,
				tweenObj = {
					value: 0
				};
			new Tween(tweenObj, 860, {
				value: 1,
				ease: Ease.easeInOut.sine,
				onUpdate: function() {
					R.setTransform(self.html.siteHeadPageAreaDiv, "translate3d(" + 100 * -tweenObj.value * c + "%,0,0)");
					self.ribbon.setColors(l.primary.getColorAtValue(tweenObj.value), l.secondary.getColorAtValue(tweenObj.value));
					self.ribbon.move(1.2 * (tweenObj.value - p) * c * n);
					p = tweenObj.value
				},
				onComplete: function() {
					R.setTransform(self.html.siteHeadPageAreaDiv, "");
					self.ribbon.speed = 0.3 * c;
					self.ribbon.setPullPoint(0.5);
					self.animating = false;
					self.updateContent();
					self.updateHeaders()
				}
			})
		}
	};
	this.getVisiblePageSectionDivs = function(a) {
		a =
			this.html.pageBodyDivs[a].querySelectorAll(".page-section");
		for (var c = [], f = 0; f < a.length; f++) {
			var d = a[f];
			R.visible(d, !0) && c.push(d)
		}
		return c
	};
	this.animateToPageIndex = function(f, c, d) {
		if (!(this.animating || this.dragging || this.menuOpen || f == this.pageIndex)) {
			this.animating = !0;
			var k = this.pageIndex,
				l = this.getRealIndex(f);
			this.pageIndex = l;
			this.setPage(l, c);
			d && this.updateHistory(c);
			f = this.getBackgroundColor(l);
			d = this.getPrimaryColor(l);
			this.html.siteBodyDiv.style.backgroundColor = f;
			this.nav.setBackgroundColor(d);
			var n = self.getVisiblePageSectionDivs(k);
			for (f = 0; f < n.length; f++) d = n[f], R.setTransition(d, "transform 860ms ease-in-out"), R.setTransform(d, "translate3d(" + 100 * -c + "%,0,0)");
			R.setTransition(self.html.navBarBgDiv, "transform 860ms ease-in-out");
			R.setTransform(self.html.navBarBgDiv, "translate3d(" + 100 * -c + "%,0,0)");
			R.onTransitionEnd(self.html.navBarBgDiv, function() {
				self.html.pageBodyDivs[k].style.display = "none";
				for (var f = 0; f < n.length; f++) {
					var d = n[f];
					R.setTransition(d, "");
					R.setTransform(d, "")
				}
				self.showPageContent(l, c)
			})
		}
	};
	this.showPageContent =
		function(f, c) {
			var d = self.html.pageBodyDivs[self.pageIndex];
			d.style.display = "block";
			0 < R.scrollbarWidth && (d.style.paddingRight = "");
			for (var k = d.querySelectorAll(".page-section"), l = Array.prototype.slice.call(k, 0, 2), d = 0; d < l.length; d++) {
				var n = l[d];
				n.style.display = "";
				R.setTransform(n, "translate3d(" + 90 * c + "px,0,0)");
				n.style.opacity = "0"
			}
			R.onNextFrame(function() {
				window.scrollTo(0, R.touch ? 1 : 0);
				for (var c = 0; c < l.length; c++) {
					var f = l[c];
					R.setTransition(f, "opacity .4s linear, transform .4s ease-out");
					R.setTransform(f, "translate3d(0,0,0)");
					f.style.opacity = "1"
				}
				R.onTransitionEnd(l[0], function() {
					for (var c = 0; c < l.length; c++) {
						var f = l[c];
						R.setTransition(f, "");
						R.setTransform(f, "")
					}
					R.onNextFrame(function() {
						for (var c = 0; c < k.length; c++) k[c].style.display = "";
						self.nav.setForegroundColor(self.getPrimaryColor());
						self.nav.setBackgroundColor("");
						R.setTransition(self.html.navBarBgDiv, "");
						R.setTransform(self.html.navBarBgDiv, "");
						self.updateHeaders();
						self.animating = !1;
						self.activateIcons();
						self.activateSlideshows();
						self.activateCodeSnippets();
						self.activateVideoPlayers();
						self.loadCurrentDribbleShots();
						R.onNextFrame(function() {
							self.updateImages()
						})
					})
				})
			})
		};
	this.setPage = function(a, c, f, d) {
		f = this.contentMode == R.Site.CONTENT_MODE_MASTHEAD;
		this.headerPagination.setPage(a, f);
		this.navPagination.setPage(a, !f);
		this.badge.setPage(a, c, f, d);
		this.currentFooter = this.html.pageBodyDivs[this.pageIndex].getElementsByTagName("footer")[0]
	};
	this.showAllPageSections = function(a) {
		a = this.html.pageBodyDivs[a].querySelectorAll(".page-section");
		for (var c = 0; c < a.length; c++) a[c].style.display = ""
	};
	this.setContentMode = function(g) {
		switch (g) {
			case modeContent:
				this.animating = !0;
				R.touch || (document.body.style.overflow = "");
				0 < R.scrollbarWidth && (R.setTransform(self.html.navMenuLink, ""), self.html.pageBodyDivs[self.pageIndex].style.paddingRight = "");
				this.nav.showBg();
				this.nav.showPagination();
				0 < R.scrollbarWidth && this.nav.resize();
				R.stopRendering();
				self.ribbon.setPullPoint(0.5);
				self.ribbon.clearCanvas();
				self.ribbonManager.detachFromRenderFrame();
				R.onNextFrame(function() {
					self.activateIcons();
					self.activateSlideshows();
					self.activateCodeSnippets();
					self.activateVideoPlayers();
					self.loadCurrentDribbleShots();
					self.updateImages();
					R.setTransform(self.html.siteDiv, "");
					self.html.siteDiv.style.top = "-100%";
					R.onNextFrame(function() {
						self.showAllPageSections(self.pageIndex);
						self.animating = !1
					})
				});
				this.contentMode = modeContent;
				break;
			case modeMasthead:
				R.touch || (document.body.style.overflow = "hidden"), R.setTransform(this.html.siteDiv, ""), this.nav.resize(), R.redrawElement(this.html.siteNavDiv), this.contentMode = modeMasthead
		}
	};
	this.badgeNextClick = function() {
		this.animating || this.dragging || this.menuOpen || this.animateToHeaderIndex(this.pageIndex + 1, 1, !0)
	};
	this.badgeBackClick = function() {
		this.animating ||
		this.dragging || this.menuOpen || this.animateToHeaderIndex(this.pageIndex - 1, -1, !0)
	};
	this.paginationClick = function(a) {
		if (!(this.animating || this.dragging || this.menuOpen)) {
			var c = a > this.pageIndex ? 1 : -1;
			this.contentMode == modeMasthead ? this.animateToHeaderIndex(a, c, !0) : this.animateToPageIndex(a, c, !0)
		}
	};
	this.navLogoClick = function() {
		if (this.contentMode == modeContent) {
			if (2 > window.pageYOffset) {
				window.scrollTo(0, 0);
				self.animateToMasthead();
				return
			}
			R.startRendering();
			this.animating = !0;
			var tweenObj = {
				value: window.pageYOffset
			};
			new Tween(tweenObj, 460, {
				value: 0,
				ease: Ease.easeInOut.sine,
				onUpdate: function() {
					window.scrollTo(0, tweenObj.value)
				},
				onComplete: function() {
					setTimeout(function() {
						self.animating = !1;
						self.animateToMasthead()
					}, 36)
				}
			})
		}
		return !1
	};
	this.navArrowClick = function() {};
	this.getColorTransitions = function(a, c) {
		a = this.getRealIndex(a);
		var f = this.getRealIndex(c);
		return {
			primary: new ColorTransition(new Color(PAGE_DATA[a].colors.ribbonPrimary), new Color(PAGE_DATA[f].colors.ribbonPrimary)),
			secondary: new ColorTransition(new Color(PAGE_DATA[a].colors.ribbonSecondary), new Color(PAGE_DATA[f].colors.ribbonSecondary))
		}
	}
};
R.Site.CONTENT_MODE_CONTENT = 1;
R.Site.CONTENT_MODE_MASTHEAD = 0;
R.Site.prototype.menuLinkClick = function(a) {
	if (!this.animating) {
		var d = this.getPageIndexForPath(a.pathname);
		if (-1 == d) return !0;
		var f = this,
			g = d > this.pageIndex ? 1 : -1;
		this.contentMode == R.Site.CONTENT_MODE_MASTHEAD ? (this.nav.menuWillClose(), this.nav.closeMenu(function() {
			f.menuOpen = !1;
			R.startRendering();
			f.ribbonManager.attachToRenderFrame();
			f.nav.setBackgroundColor("");
			f.ribbon.clearCanvas();
			d != f.pageIndex && f.animateToHeaderIndex(d, g, !0);
			var a = window.innerHeight,
				h = !1,
				tweenObj = {
					val: 1
				};
			new Tween(tweenObj, 860, {
				val: 0,
				ease: Ease.easeOut.sine,
				onUpdate: function() {
					!h && tweenObj.val * a > f.navHeight && (f.nav.useDarkIcons(), h = !0);
					f.ribbon.verticalPosition = 0.5 * (1 - tweenObj.val);
					f.ribbon.positionDamping = tweenObj.val;
					f.ribbon.straightenStrength = tweenObj.val;
					f.ribbon.straighten()
				},
				onComplete: function() {}
			})
		})) : (this.nav.menuWillClose(), this.nav.closeMenu(function() {
			f.menuOpen = !1;
			d != f.pageIndex && f.animateToPageIndex(d, g, !0)
		}));
		return !1
	}
};
R.Site.prototype.menuClick = function() {
	if (!this.animating) {
		this.animating = !0;
		var a = this;
		this.menuOpen ? (this.nav.menuWillClose(), this.nav.closeMenu(function() {
			a.menuClosed()
		})) : (this.contentMode == R.Site.CONTENT_MODE_MASTHEAD ? this.animateRibbonToTop(function() {
			R.stopRendering();
			a.ribbonManager.detachFromRenderFrame();
			a.nav.setBackgroundColor(a.getPrimaryColor());
			a.ribbon.clearCanvas();
			a.nav.openMenu(function() {
				a.menuOpened()
			})
		}) : (R.stopRendering(), this.ribbonManager.detachFromRenderFrame(), this.nav.openMenu(function() {
			a.menuOpened()
		})),
			this.nav.menuWillOpen(), this.menuOpen = !0)
	}
};
R.Site.prototype.menuOpened = function() {
	this.dragging = !1;
	this.dragHelper.stop();
	this.animating = !1
};
R.Site.prototype.menuClosed = function() {
	var a = this;
	this.contentMode == R.Site.CONTENT_MODE_MASTHEAD ? (R.startRendering(), this.ribbonManager.attachToRenderFrame(), a.nav.setBackgroundColor(""), this.animateRibbonToCenter(function() {
		a.animating = !1;
		a.menuOpen = !1
	})) : this.menuOpen = this.animating = !1
};
R.Site.prototype.animateRibbonToCenter = function(a) {
	this.ribbon.canDestruct = false;
	this.animating = true;
	var d = this,
		f = window.innerHeight,
		g = !1,
		tweenObj = {
			val: 1
		};
	new Tween(tweenObj, 400, {
		val: 0,
		onUpdate: function() {
			var a = tweenObj.val;
			!g && a * f > d.navHeight && (d.nav.useDarkIcons(), g = !0);
			a = Math.min(a, 1);
			d.ribbon.verticalPosition = 0.5 * (1 - a);
			d.ribbon.positionDamping = a;
			d.ribbon.straightenStrength = a;
			d.ribbon.straighten()
		},
		onComplete: function() {
			d.ribbon.canDestruct = true;
			d.animating = false;
			a && a()
		}
	})
};
R.Site.prototype.animateRibbonToTop = function(callback) {
	this.ribbon.canDestruct = false;
	this.animating = true;
	var self = this,
		windowInnerHeight = window.innerHeight,
		falseVal = false,
		tweenObj = {
			val: 0 // startingVal
		};
	new Tween(tweenObj, 400, {
		val: 1, //endVal
		onUpdate: function() {
			var val = tweenObj.val;
			if (!falseVal) {
				if ((1 - val) * windowInnerHeight < self.navHeight) {
					self.nav.useLightIcons();
					falseVal = true;
				}
			}
			val = Math.min(val, 1);
			self.ribbon.verticalPosition = 0.5 * (1 - val);
			self.ribbon.positionDamping = val;
			self.ribbon.straightenStrength = val;
			self.ribbon.straighten();
		},
		onComplete: function() {
			self.ribbon.canDestruct = true;
			self.animating = false;
			if (callback) {
				callback();
			}
		}
	})
};
R.Site.prototype.findInternalLinks = function() {
	for (var a = document.getElementsByClassName("internal-link"), d = this, f = a.length - 1; 0 <= f; f--) a[f].onclick = function() {
		return d.internalLinkClick(this)
	}
};
R.Site.prototype.internalLinkClick = function(a) {
	a = this.getPageIndexForPath(a.pathname);
	if (-1 == a) return !0;
	var d = a > this.pageIndex ? 1 : -1;
	a != this.pageIndex && this.animateToPageIndex(a, d, !0);
	return !1
};
R.Site.historyCount = 0;
R.Site.historyState = null;
R.Site.historyDirInit = 0;
R.Site.prototype.getPageIndexForPath = function(a) {
	for (var d = 0; d < PAGE_DATA.length; d++)
		if (a == PAGE_DATA[d].path) return d;
	return -1
};
R.Site.prototype.onPopState = function(a) {
	if (a.state) {
		var d = this.getPageIndexForPath(window.location.pathname),
			f;
		a.state.count < R.Site.historyCount ? (f = -R.Site.historyState.dir) || (f = -R.Site.historyDirInit) : f = a.state.dir;
		this.contentMode == R.Site.CONTENT_MODE_CONTENT ? this.animateToPageIndex(d, f, !1) : this.animateToHeaderIndex(d, f, !1);
		R.Site.historyDirInit || (R.Site.historyDirInit = f);
		a.state.dir || (R.Site.historyDirInit = 0);
		R.Site.historyState = a.state;
		R.Site.historyCount = a.state.count;
		this.nav.updateMenuStatus()
	}
};
R.Site.prototype.updateHistory = function(a) {
	R.Site.historyDirInit || (R.Site.historyDirInit = a);
	var d = PAGE_DATA[this.pageIndex];
	a = {
		dir: a,
		count: ++R.Site.historyCount
	};
	window.history.pushState(a, d.title, d.path);
	R.Site.historyState = a;
	this.nav.updateMenuStatus()
};
R.Site.prototype.enableDragging = function() {
	var a = this,
		d = function(f) {
			if (a.dragging || a.animating) return !1;
			if (a.menuOpen) return !0;
			a.dragging = !0;
			a.dragHelper.start(f);
			a.dragHelper.onIntentClear = a.dragIntentClear.bind(a);
			a.dragHelper.onDrag = function(f, c, d, k, l, n) {
				return a.contentMode == R.Site.CONTENT_MODE_MASTHEAD || 0 < n && 0 == window.pageYOffset ? !1 : !0
			};
			a.dragHelper.onComplete = function() {
				a.dragging = !1
			}
		};
	R.touch ? window.ontouchstart = d : document.body.onmousedown = d
};
R.Site.prototype.dragIntentClear = function(a, d, f, g, c, h, k) {
	this.dragHelper.onComplete = void 0;
	a == DragHelper.DRAG_DIRECTION_X ? this.startHorizontalDrag(h) : this.startVerticalDrag(k)
};
R.Site.prototype.startVerticalDrag = function(a) {
	this.contentMode == R.Site.CONTENT_MODE_MASTHEAD ? this.startVerticalDragMasthead() : 0 < a && 0 == window.pageYOffset ? this.startVerticalDragContent() : (this.dragHelper.onIntentClear = void 0, this.dragHelper.onComplete = void 0, this.dragHelper.onDrag = void 0, this.dragHelper.stop(), this.dragging = !1)
};
R.Site.prototype.startVerticalDragContent = function() {
	var a = this;
	this.prepareToAnimateToMasthead();
	var d = this.ribbon.getCurrentVerticalPosition();
	this.ribbon.verticalPosition = d;
	this.ribbon.positionDamping = true;
	this.ribbon.canDestruct = false;
	this.ribbon.speed = 0;
	var f = window.innerHeight,
		g = !0,
		c = 0;
	this.dragHelper.onDrag = function(d, k, l, n, p, r) {
		R.setTransform(a.html.siteDiv, "translate3d(0," + (-f + k) + "px,0)");
		a.ribbonDragVertical(1 - k / f, 0.5, 0);
		g && 0 > k / f ? (g = !1, a.nav.showBg()) : !g && 0 < k / f && (g = !0, a.nav.hideBg());
		c = k;
		return !1
	};
	this.dragHelper.onComplete = function(d, g) {
		a.dragHelper.onIntentClear = void 0;
		a.dragHelper.onComplete = void 0;
		a.dragHelper.onDrag = void 0;
		a.dragging = !1;
		a.animating = !0;
		var l;
		switch (g) {
			case DragHelper.OUTCOME_CLICK:
			case DragHelper.OUTCOME_NEXT:
			case DragHelper.OUTCOME_NONE:
				l = !1;
				break;
			case DragHelper.OUTCOME_BACK:
				l = !0
		}
		var n = {
			value: -f + c
		};
		l ? new Tween(n, 460, {
			value: 0,
			percent: 1,
			ease: Ease.easeInOut.sine,
			onUpdate: function() {
				R.setTransform(a.html.siteDiv, "translate3d(0," + n.value + "px,0)");
				a.ribbonDragVertical(-n.value /
					f, 0.5, 0, !0)
			},
			onComplete: function() {
				a.setContentMode(R.Site.CONTENT_MODE_MASTHEAD);
				a.ribbon.speed = 0.5 < Math.random() ? -0.3 : 0.3;
				a.ribbon.canDestruct = true;
				a.animating = false
			}
		}) : new Tween(n, 460, {
			value: -window.innerHeight,
			ease: Ease.easeInOut.sine,
			onUpdate: function() {
				R.setTransform(a.html.siteDiv, "translate3d(0," + n.value + "px,0)");
				a.ribbonDragVertical(-n.value / f, 0.5, 0)
			},
			onComplete: function() {
				a.setContentMode(R.Site.CONTENT_MODE_CONTENT);
				a.ribbon.canDestruct = true;
				a.animating = false
			}
		})
	}
};
R.Site.prototype.startVerticalDragMasthead = function() {
	var a = this,
		d = window.innerHeight,
		f = 0,
		g = this.ribbon.getCurrentVerticalPosition();
	this.ribbon.verticalPosition = g;
	this.ribbon.positionDamping = true;
	this.ribbon.canDestruct = false;
	this.ribbon.speed = 0;
	this.dragHelper.onDrag = function(c, h, k, l, n, p) {
		R.setTransform(a.html.siteDiv, "translate3d(0," + h + "px,0)");
		a.ribbonDragVertical(-h / d, g, 0, !1);
		f = h;
		return !1
	};
	this.dragHelper.onComplete = function(c, h) {
		a.dragHelper.onIntentClear = void 0;
		a.dragHelper.onComplete = void 0;
		a.dragHelper.onDrag =
			void 0;
		a.dragging = !1;
		a.animating = !0;
		var k;
		switch (h) {
			case DragHelper.OUTCOME_CLICK:
			case DragHelper.OUTCOME_BACK:
			case DragHelper.OUTCOME_NONE:
				k = !1;
				break;
			case DragHelper.OUTCOME_NEXT:
				k = !0
		}
		var l = {
			value: f
		};
		k ? new Tween(l, 460, {
			value: -window.innerHeight,
			ease: Ease.easeInOut.sine,
			onUpdate: function() {
				R.setTransform(a.html.siteDiv, "translate3d(0," + l.value + "px,0)");
				a.ribbonDragVertical(-l.value / d, g, 0)
			},
			onComplete: function() {
				R.onNextFrame(function() {
					a.setContentMode(R.Site.CONTENT_MODE_CONTENT);
					a.ribbon.canDestruct = false;
					a.animating = false
				})
			}
		}) : new Tween(l, 460, {
			value: 0,
			ease: Ease.easeInOut.sine,
			onUpdate: function() {
				R.setTransform(a.html.siteDiv, "translate3d(0," + l.value + "px,0)");
				a.ribbonDragVertical(-l.value / d, g, 0, !0)
			},
			onComplete: function() {
				R.setTransform(a.html.siteDiv, "");
				a.ribbon.speed = 0.5 < Math.random() ? -0.3 : 0.3;
				a.ribbon.canDestruct = false;
				a.animating = false
			}
		})
	}
};
R.Site.prototype.ribbonDragVertical = function(a, d, f, g) {
	var c = window.innerHeight,
		h = (c - this.navHeight) / c,
		c = R.normalize(a, 0, h, 0, 1),
		c = Math.min(c, 1);
	a < h && this.nav.contentMode ? this.nav.exitContentMode() : a > h && !this.nav.contentMode && this.nav.enterContentMode();
	0 < R.scrollbarWidth && (h = R.normalize(a, h, 1, 0, 1), h = Math.max(h, 0), h = Math.min(h, 1), R.setTransform(this.html.navMenuLink, "translate3d(" + h * -R.scrollbarWidth + "px,0,0)"));
	this.ribbon.straightenStrength = c;
	this.ribbon.verticalPosition = (f - d) * a / 1 + d;
	g && (this.ribbon.positionDamping = a);
	this.ribbon.straighten()
};
R.Site.prototype.startHorizontalDrag = function(a) {
	this.contentMode == R.Site.CONTENT_MODE_MASTHEAD ? this.startHorizontalDragMasthead() : this.startHorizontalDragContent()
};
R.Site.prototype.ribbonDragHorizontal = function(a, d) {
	var f = 0 < a ? 0 : 1,
		g = Math.abs(a);
	this.ribbon.setPullPoint(f);
	this.ribbon.pullStrength = 0.5 * g;
	this.ribbon.straighten();
	this.ribbon.move(d)
};
R.Site.prototype.startHorizontalDragMasthead = function() {
	var a = this,
		d = this.getRealIndex(this.pageIndex - 1),
		f = this.getRealIndex(this.pageIndex + 1),
		g = this.html.pageHeadDivs[f],
		c = this.html.pageHeadDivs[d];
	g.style.display = "block";
	g.style.right = "-100%";
	g.style.left = "100%";
	c.style.display = "block";
	c.style.right = "100%";
	c.style.left = "-100%";
	this.colorTransitionNext = this.getColorTransitions(this.pageIndex, f);
	this.colorTransitionPrev = this.getColorTransitions(this.pageIndex, d);
	this.ribbon.canDestruct = false;
	var h = window.innerWidth,
		k = 0;
	this.dragHelper.onDrag = function(c, f, d, g, q, s) {
		R.setTransform(a.html.siteHeadPageAreaDiv, "translate3d(" + c + "px,0,0)");
		f = -c / h;
		a.ribbon.pullStrength = 0.5 * Math.abs(f);
		a.ribbonDragHorizontal(f, c - k);
		a.adjustDownArrowOpacity(f);
		k = c;
		return !1
	};
	this.adjustDownArrowOpacity = function(c) {
		768 < window.innerWidth || (0 == a.pageIndex % 4 ? (c = Math.abs(c), a.html.siteHeadDownArrowLink.style.opacity = c) : 0 == (a.pageIndex + 1) % 4 ? 0 < c && (c = R.normalize(c, 0, 0.5, 1, 0), a.html.siteHeadDownArrowLink.style.opacity = Math.max(c, 0)) : 0 == (a.pageIndex -
		1) % 4 && 0 > c && (c = R.normalize(c, 0, -0.5, 1, 0), a.html.siteHeadDownArrowLink.style.opacity = Math.max(c, 0)))
	};
	this.dragHelper.onComplete = function(c, f) {
		a.dragHelper.onIntentClear = void 0;
		a.dragHelper.onComplete = void 0;
		a.dragHelper.onDrag = void 0;
		a.dragging = !1;
		a.animating = !0;
		var d = a.pageIndex,
			g = 0;
		switch (c) {
			case DragHelper.OUTCOME_NEXT:
				d += 1;
				g = 1;
				break;
			case DragHelper.OUTCOME_BACK:
				d -= 1, g = -1
		}
		d = a.getRealIndex(d);
		768 > window.innerWidth && (0 == d ? a.hideDownArrow(400, 0) : a.showDownArrow(400, 0));
		var q = {
				value: k,
				percent: 0
			},
			s =
				a.ribbon.pullStrength;
		a.pageIndex != d ? (a.pageIndex = d, a.setPage(d, g, !0, !0), a.updateHistory(g), new Tween(q, 460, {
			value: h * -g,
			percent: 1,
			ease: Ease.easeOut.sine,
			onUpdate: function() {
				R.setTransform(a.html.siteHeadPageAreaDiv, "translate3d(" + q.value + "px,0,0)");
				var c = -q.value / h;
				a.ribbon.pullStrength = s - s * q.percent;
				a.ribbonDragHorizontal(c, q.value - k);
				k = q.value
			},
			onComplete: function() {
				R.setTransform(a.html.siteHeadPageAreaDiv, "");
				a.ribbon.canDestruct = true;
				a.animating = false;
				a.updateContent();
				a.updateHeaders();
				a.ribbon.setPullPoint(0.5);
				g && (a.ribbon.speed = 0.3 * g)
			}
		})) : new Tween(q, 460, {
			value: 0,
			percent: 1,
			ease: Ease.easeOut.sine,
			onUpdate: function() {
				R.setTransform(a.html.siteHeadPageAreaDiv, "translate3d(" + q.value + "px,0,0)");
				var c = -q.value / h;
				a.ribbon.pullStrength = s - s * q.percent;
				a.ribbonDragHorizontal(c, q.value - k);
				k = q.value
			},
			onComplete: function() {
				R.setTransform(a.html.siteHeadPageAreaDiv, "");
				a.ribbon.canDestruct = true;
				a.animating = false;
				a.updateHeaders();
				a.ribbon.setPullPoint(0.5);
				g && (a.ribbon.speed = 0.3 * g)
			}
		})
	}
};
R.Site.prototype.startHorizontalDragContent = function() {
	var a = this,
		d = 0,
		f = this.getVisiblePageSectionDivs(this.pageIndex);
	this.dragHelper.onDrag = function(g, c, h, k, l, n) {
		0 < g && 0 >= d ? (c = a.getBackgroundColor(a.pageIndex - 1), h = a.getPrimaryColor(a.pageIndex - 1), a.html.siteBodyDiv.style.backgroundColor = c, a.nav.setBackgroundColor(h), a.html.siteBodyDiv.style.webkitTransform = "scale(1)") : 0 > g && 0 <= d && (c = a.getBackgroundColor(a.pageIndex + 1), h = a.getPrimaryColor(a.pageIndex + 1), a.html.siteBodyDiv.style.backgroundColor = c, a.nav.setBackgroundColor(h),
			a.html.siteBodyDiv.style.webkitTransform = "scale(1)");
		R.setTransform(a.html.navBarBgDiv, "translate3d(" + g + "px,0,0)");
		for (c = 0; c < f.length; c++) R.setTransform(f[c], "translate3d(" + g + "px,0,0)");
		d = g;
		return !1
	};
	this.dragHelper.onComplete = function(d, c) {
		a.dragHelper.onIntentClear = void 0;
		a.dragHelper.onComplete = void 0;
		a.dragHelper.onDrag = void 0;
		a.dragging = !1;
		a.animating = !0;
		var h = a.pageIndex,
			k = a.pageIndex,
			l;
		switch (d) {
			case DragHelper.OUTCOME_NEXT:
				k += 1;
				l = 1;
				break;
			case DragHelper.OUTCOME_BACK:
				k -= 1, l = -1
		}
		k = a.getRealIndex(k);
		if (h != k) {
			var n = 460;
			a.pageIndex = k;
			a.setPage(k, l, !0, !0);
			a.updateHistory(l);
			for (var p = 0; p < f.length; p++) {
				var r = f[p];
				R.setTransition(r, "transform " + n + "ms ease-out");
				R.setTransform(r, "translate3d(" + 100 * -l + "%,0,0)")
			}
			R.setTransition(a.html.navBarBgDiv, "transform " + n + "ms ease-out");
			R.setTransform(a.html.navBarBgDiv, "translate3d(" + 100 * -l + "%,0,0)");
			R.onTransitionEnd(a.html.navBarBgDiv, function() {
				a.html.pageBodyDivs[h].style.display = "none";
				for (var c = 0; c < f.length; c++) {
					var d = f[c];
					R.setTransition(d, "");
					R.setTransform(d,
						"")
				}
				a.showPageContent(k, l)
			})
		} else {
			n = 460;
			for (p = 0; p < f.length; p++) r = f[p], R.setTransition(r, "transform " + n + "ms ease-out"), R.setTransform(r, "translate3d(0,0,0)");
			R.setTransition(a.html.navBarBgDiv, "transform " + n + "ms ease-out");
			R.setTransform(a.html.navBarBgDiv, "translate3d(0,0,0)");
			R.onTransitionEnd(a.html.navBarBgDiv, function() {
				for (var c = 0; c < f.length; c++) {
					var d = f[c];
					R.setTransition(d, "");
					R.setTransform(d, "")
				}
				R.setTransition(a.html.navBarBgDiv, "");
				R.setTransform(a.html.navBarBgDiv, "");
				a.nav.setBackgroundColor("");
				a.animating = !1
			})
		}
	}
};
R.Site.prototype.ribbonDragHorizontal = function(a, d) {
	var f = Math.abs(a),
		f = Math.min(1, f),
		g, c;
	0 < a ? (g = 0, c = this.colorTransitionNext) : (g = 1, c = this.colorTransitionPrev);
	c && this.ribbon.setColors(c.primary.getColorAtValue(f), c.secondary.getColorAtValue(f));
	this.ribbon.setPullPoint(g);
	this.ribbon.straighten();
	this.ribbon.move(1.2 * -d)
};
R.Site.prototype.setupDribbbleShots = function() {
	for (var a = PAGE_DATA.length - 1; 0 <= a; a--) PAGE_DATA[a].dribbbleProject && (this.dribbbleShots[a] = new DribbbleShots(this.html.pageContentDivs[a].getElementsByClassName("dribbble-shots-inner")[0], PAGE_DATA[a].dribbbleProject, PAGE_DATA[a].colors.dribbble, PAGE_DATA[a].colors.dribbbleCTA, R.scale))
};
R.Site.prototype.loadCurrentDribbleShots = function() {
	this.dribbbleShots[this.pageIndex] && this.dribbbleShots[this.pageIndex].load()
};
R.Site.prototype.onMouseWheel = function(a) {
	var d = a.wheelDeltaX || -a.deltaX,
		f = a.wheelDeltaY || -a.deltaY,
		g = Math.abs(d),
		c = Math.abs(f);
	this.clearMouseWheelSuspension();
	if (0 > this.mouseWheelLastY && f < this.mouseWheelLastY || 0 < this.mouseWheelLastY && f > this.mouseWheelLastY) clearTimeout(this.mouseWheelTimeout), this.mouseWheelSuspended = !1;
	if (0 > this.mouseWheelLastX && d < this.mouseWheelLastX || 0 < this.mouseWheelLastX && d > this.mouseWheelLastX) clearTimeout(this.mouseWheelTimeout), this.mouseWheelSuspended = !1;
	if (0 < f && 0 > this.mouseWheelLastY ||
		0 > f && 0 < this.mouseWheelLastY) clearTimeout(this.mouseWheelTimeout), this.mouseWheelSuspended = !1;
	if (0 < d && 0 > this.mouseWheelLastX || 0 > d && 0 < this.mouseWheelLastX) clearTimeout(this.mouseWheelTimeout), this.mouseWheelSuspended = !1;
	this.mouseWheelLastX = d;
	this.mouseWheelLastY = f;
	0 >= window.pageYOffset && 0 < f && a.preventDefault();
	if (this.animating || this.mouseWheelSuspended) return !0; - 50 > d && g > c || 50 < d && g > c || (0 > f && c > g && this.contentMode == R.Site.CONTENT_MODE_MASTHEAD && 0 >= window.pageYOffset ? (this.animateToContent(), this.mouseWheelSuspended = !0, this.mouseWheelSpeed = 0) : 0 < f && c > g && this.contentMode == R.Site.CONTENT_MODE_CONTENT && 0 >= window.pageYOffset && (this.animateToMasthead(), this.mouseWheelSuspended = !0, this.mouseWheelSpeed = 0));
	this.mouseWheelSuspended && this.clearMouseWheelSuspension()
};
R.Site.prototype.clearMouseWheelSuspension = function() {
	var a = this;
	clearTimeout(this.mouseWheelTimeout);
	this.mouseWheelTimeout = setTimeout(function() {
		a.mouseWheelSuspended = !1;
		a.mouseWheelSpeed = 0
	}, 60)
};
R.Site.prototype.onKeyDown = function(a) {
	if (!this.animating)
		if (38 == a.keyCode && this.contentMode == R.Site.CONTENT_MODE_CONTENT && 0 == window.pageYOffset) this.animateToMasthead();
		else if (40 == a.keyCode && this.contentMode == R.Site.CONTENT_MODE_MASTHEAD && 0 == window.pageYOffset) this.animateToContent();
		else if (39 == a.keyCode && this.pagesLoaded) switch (this.contentMode) {
			case R.Site.CONTENT_MODE_CONTENT:
				this.animateToPageIndex(this.pageIndex + 1, 1, !0);
				break;
			case R.Site.CONTENT_MODE_MASTHEAD:
				this.animateToHeaderIndex(this.pageIndex +
					1, 1, !0)
		} else if (37 == a.keyCode && this.pagesLoaded) switch (this.contentMode) {
			case R.Site.CONTENT_MODE_CONTENT:
				this.animateToPageIndex(this.pageIndex - 1, -1, !0);
				break;
			case R.Site.CONTENT_MODE_MASTHEAD:
				this.animateToHeaderIndex(this.pageIndex - 1, -1, !0)
		}
};
R.Site.prototype.teaseNext = function() {
	var a = this.getSidebarWidth();
	this.nav.teaseNext(a);
	R.setTransition(this.html.siteBodyPageAreaDiv, "transform 300ms ease-out");
	R.setTransform(this.html.siteBodyPageAreaDiv, "translate3d(" + -a + "px,0,0)");
	var a = this.getRealIndex(this.pageIndex + 1),
		d = PAGE_DATA[a].colors.ribbonPrimary;
	this.html.siteBgDiv.style.backgroundColor = PAGE_DATA[a].colors.primary;
	this.nav.setBackgroundColor(d)
};
R.Site.prototype.teasePrev = function() {
	var a = this.getSidebarWidth();
	this.nav.teasePrev(a);
	R.setTransition(this.html.siteBodyPageAreaDiv, "transform 300ms ease-out");
	R.setTransform(this.html.siteBodyPageAreaDiv, "translate3d(" + a + "px,0,0)");
	var a = this.getRealIndex(this.pageIndex - 1),
		d = PAGE_DATA[a].colors.ribbonPrimary || "white";
	this.html.siteBgDiv.style.backgroundColor = PAGE_DATA[a].colors.primary || "white";
	this.nav.setBackgroundColor(d)
};
R.Site.prototype.teaseNone = function() {
	R.setTransition(this.html.siteBodyPageAreaDiv, "transform 300ms ease-out");
	R.setTransform(this.html.siteBodyPageAreaDiv, "translate3d(0,0,0)");
	this.nav.teaseNone()
};
R.Site.prototype.nextMouseOver = function(a) {
	this.dragging || this.animating || (this.dragSuspended && (this.dragSuspended = !1), this.teaseNext())
};
R.Site.prototype.nextMouseDown = function(a) {
	this.dragging || this.dragSuspended || this.animating || this.dragContentStart(-this.getSidebarWidth(), a)
};
R.Site.prototype.nextMouseOut = function(a) {
	this.dragging || this.dragSuspended || this.animating || this.teaseNone()
};
R.Site.prototype.prevMouseOver = function(a) {
	this.dragging || this.animating || (this.dragSuspended && (this.dragSuspended = !1), this.teasePrev())
};
R.Site.prototype.prevMouseDown = function(a) {
	this.dragging || this.dragSuspended || this.animating || this.dragContentStart(this.getSidebarWidth(), a)
};
R.Site.prototype.prevMouseOut = function(a) {
	this.dragging || this.dragSuspended || this.animating || this.teaseNone()
};
R.Site.prototype.updateDownArrow = function() {
	this.downArrowTween && this.downArrowTween.stop();
	var a = this.getRealIndex(this.pageIndex);
	768 > window.innerWidth && 0 == a ? (this.html.siteHeadDownArrowLink.style.opacity = 0, this.html.siteHeadDownArrowLink.style.visibility = "hidden", this.downArrowShowing = !1) : (768 > window.innerWidth && 0 != a ? (this.html.siteHeadDownArrowLink.style.opacity = 1, this.html.siteHeadDownArrowLink.style.visibility = "visible") : (this.html.siteHeadDownArrowLink.style.opacity = 1, this.html.siteHeadDownArrowLink.style.visibility =
		""), this.downArrowShowing = !0)
};
R.Site.prototype.showDownArrow = function(a, d) {
	if (!this.downArrowShowing) {
		this.downArrowShowing = !0;
		this.html.siteHeadDownArrowLink.style.visibility = "visible";
		var f = {
				val: parseFloat(this.html.siteHeadDownArrowLink.style.opacity)
			},
			g = this;
		this.downArrowTween && this.downArrowTween.stop();
		this.downArrowTween = new Tween(f, a, {
			val: 1,
			delay: d,
			onUpdate: function() {
				g.html.siteHeadDownArrowLink.style.opacity = f.val
			},
			onComplete: function() {}
		})
	}
};
R.Site.prototype.hideDownArrow = function(a, d) {
	if (this.downArrowShowing) {
		this.downArrowShowing = !1;
		var f = {
				val: parseFloat(this.html.siteHeadDownArrowLink.style.opacity)
			},
			g = this;
		this.downArrowTween && this.downArrowTween.stop();
		this.downArrowTween = new Tween(f, 400, {
			val: 0,
			delay: d,
			onUpdate: function() {
				g.html.siteHeadDownArrowLink.style.opacity = f.val
			},
			onComplete: function() {
				g.html.siteHeadDownArrowLink.style.visibility = "hidden"
			}
		})
	}
};
R.Site.prototype.updateImages = function() {
	var a = this.html.pageBodyDivs[this.pageIndex];
	this.html.pageBodyImages[this.pageIndex] = a.querySelectorAll("img[data-src]");
	this.html.pageBodyBgDivs[this.pageIndex] = a.querySelectorAll("div[data-src]");
	for (a = 0; a < this.html.pageBodyImages.length; a++)
		if (a != this.pageIndex) {
			var d = this.html.pageBodyImages[a];
			if (d)
				for (var f = 0; f < d.length; f++) this.unloadImage(d[f])
		}
	for (a = 0; a < this.html.pageBodyBgDivs.length; a++)
		if (a != this.pageIndex && (d = this.html.pageBodyBgDivs[a]))
			for (f =
				     0; f < d.length; f++) this.unloadBgDiv(d[f]);
	this.loadVisibleBgDivs();
	this.loadVisibleImages()
};
R.Site.prototype.unloadImagesForPageIndex = function(a) {};
R.Site.prototype.loadVisibleImages = function(a) {
	if (a = this.html.pageBodyImages[this.pageIndex])
		for (var d = 0; d < a.length; d++) {
			var f = a[d];
			if (R.visiblePlus(f, !0)) {
				if (!f.loaded) {
					f.style.opacity = "0";
					var g = f.getAttribute("data-src"),
						c = f.getAttribute("data-mobile-src");
					768 > window.innerWidth && c && (g = c);
					f.src = g;
					f.onload = function() {
						R.setTransition(this, "opacity .2s linear");
						this.style.opacity = "1"
					};
					f.loaded = !0
				}
			} else f.loaded && !f.getAttribute("data-no-unload") && this.unloadImage(f)
		}
};
R.Site.prototype.loadVisibleBgDivs = function(a) {
	if (a = this.html.pageBodyBgDivs[this.pageIndex])
		for (var d = 0; d < a.length; d++) {
			var f = a[d];
			if (R.visiblePlus(f, !0)) {
				if (!f.loaded) {
					f.style.opacity = "0";
					f.image = new Image;
					f.image.div = f;
					var g = f.getAttribute("data-src"),
						c = f.getAttribute("data-mobile-src");
					768 > window.innerWidth && c && (g = c);
					f.image.src = g;
					f.image.onload = function() {
						R.setTransition(this.div, "opacity .2s linear");
						this.div.style.backgroundImage = "url(" + this.src + ")";
						this.div.style.opacity = "1"
					};
					f.loaded = !0
				}
			} else f.loaded &&
			!f.getAttribute("data-no-unload") && this.unloadBgDiv(f)
		}
};
R.Site.prototype.unloadImage = function(a) {
	R.setTransition(a, "");
	a.style.opacity = "0";
	a.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
	a.loaded = !1;
	a.onload = void 0
};
R.Site.prototype.unloadBgDiv = function(a) {
	R.setTransition(a, "");
	a.style.opacity = "0";
	a.style.backgroundImage = "";
	a.loaded = !1;
	a.image && (a.image.onload = void 0, delete a.image)
};
var SimplexNoise = function(a) {
	void 0 == a && (a = Math);
	this.grad3 = [
		[1, 1, 0],
		[-1, 1, 0],
		[1, -1, 0],
		[-1, -1, 0],
		[1, 0, 1],
		[-1, 0, 1],
		[1, 0, -1],
		[-1, 0, -1],
		[0, 1, 1],
		[0, -1, 1],
		[0, 1, -1],
		[0, -1, -1]
	];
	this.p = [];
	for (var d = 0; 256 > d; d++) this.p[d] = Math.floor(256 * a.random());
	this.perm = [];
	for (d = 0; 512 > d; d++) this.perm[d] = this.p[d & 255];
	this.simplex = [
		[0, 1, 2, 3],
		[0, 1, 3, 2],
		[0, 0, 0, 0],
		[0, 2, 3, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 2, 3, 0],
		[0, 2, 1, 3],
		[0, 0, 0, 0],
		[0, 3, 1, 2],
		[0, 3, 2, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 3, 2, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 2, 0, 3],
		[0, 0, 0, 0],
		[1, 3, 0, 2],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[2, 3, 0, 1],
		[2, 3, 1, 0],
		[1, 0, 2, 3],
		[1, 0, 3, 2],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[2, 0, 3, 1],
		[0, 0, 0, 0],
		[2, 1, 3, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[2, 0, 1, 3],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[3, 0, 1, 2],
		[3, 0, 2, 1],
		[0, 0, 0, 0],
		[3, 1, 2, 0],
		[2, 1, 0, 3],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[3, 1, 0, 2],
		[0, 0, 0, 0],
		[3, 2, 0, 1],
		[3, 2, 1, 0]
	]
};
SimplexNoise.prototype.dot = function(a, d, f) {
	return a[0] * d + a[1] * f
};
//simplex-noise.js is a fast simplex noise implementation in Javascript. It works in the browser and on nodejs.
SimplexNoise.prototype.noise = function(a, d) {
	var f, g, c;
	c = 0.5 * (Math.sqrt(3) - 1);
	c *= a + d;
	var h = Math.floor(a + c),
		k = Math.floor(d + c),
		l = (3 - Math.sqrt(3)) / 6;
	c = (h + k) * l;
	f = a - (h - c);
	var n = d - (k - c),
		p, r;
	f > n ? (p = 1, r = 0) : (p = 0, r = 1);
	g = f - p + l;
	var q = n - r + l;
	c = f - 1 + 2 * l;
	var l = n - 1 + 2 * l,
		s = h & 255,
		k = k & 255,
		h = this.perm[s + this.perm[k]] % 12;
	p = this.perm[s + p + this.perm[k + r]] % 12;
	r = this.perm[s + 1 + this.perm[k + 1]] % 12;
	k = 0.5 - f * f - n * n;
	0 > k ? f = 0 : (k *= k, f = k * k * this.dot(this.grad3[h], f, n));
	n = 0.5 - g * g - q * q;
	0 > n ? g = 0 : (n *= n, g = n * n * this.dot(this.grad3[p], g, q));
	q = 0.5 - c *
		c - l * l;
	0 > q ? c = 0 : (q *= q, c = q * q * this.dot(this.grad3[r], c, l));
	return 70 * (f + g + c)
};
SimplexNoise.prototype.noise3d = function(a, d, f) {
	var g, c, h, k = (a + d + f) * (1 / 3),
		l = Math.floor(a + k),
		n = Math.floor(d + k),
		p = Math.floor(f + k),
		k = 1 / 6;
	h = (l + n + p) * k;
	g = a - (l - h);
	c = d - (n - h);
	var r = f - (p - h),
		q, s, w, t, u, v;
	g >= c ? c >= r ? (q = 1, w = s = 0, u = t = 1, v = 0) : (g >= r ? (q = 1, w = s = 0) : (s = q = 0, w = 1), t = 1, u = 0, v = 1) : c < r ? (s = q = 0, w = 1, t = 0, v = u = 1) : g < r ? (q = 0, s = 1, t = w = 0, v = u = 1) : (q = 0, s = 1, w = 0, u = t = 1, v = 0);
	var z = g - q + k,
		C = c - s + k,
		D = r - w + k;
	h = g - t + 2 * k;
	a = c - u + 2 * k;
	var F = r - v + 2 * k;
	f = g - 1 + 3 * k;
	d = c - 1 + 3 * k;
	var k = r - 1 + 3 * k,
		l = l & 255,
		B = n & 255,
		G = p & 255,
		n = this.perm[l + this.perm[B + this.perm[G]]] %
			12,
		p = this.perm[l + q + this.perm[B + s + this.perm[G + w]]] % 12;
	t = this.perm[l + t + this.perm[B + u + this.perm[G + v]]] % 12;
	l = this.perm[l + 1 + this.perm[B + 1 + this.perm[G + 1]]] % 12;
	u = 0.6 - g * g - c * c - r * r;
	0 > u ? g = 0 : (u *= u, g = u * u * this.dot(this.grad3[n], g, c, r));
	c = 0.6 - z * z - C * C - D * D;
	0 > c ? c = 0 : (c *= c, c = c * c * this.dot(this.grad3[p], z, C, D));
	z = 0.6 - h * h - a * a - F * F;
	0 > z ? h = 0 : (z *= z, h = z * z * this.dot(this.grad3[t], h, a, F));
	a = 0.6 - f * f - d * d - k * k;
	0 > a ? f = 0 : (a *= a, f = a * a * this.dot(this.grad3[l], f, d, k));
	return 32 * (g + c + h + f)
};
var SimplexStepper = function(step) {

	var simplexNoise = new SimplexNoise,
		count = 0,
		totalSteps = 0,
		simpleStep = 1,
		value,
		flag = false;
	this.__construct__ = function(step) {
		if (step) {
			simpleStep = step;
		}
	};
	this.advance = function() {
		count++;
		totalSteps += 0.5 * simpleStep * (simplexNoise.noise(0, count / 100) + 1);
		flag = false;
	};
	this.getValue = function() {
		if (!flag) {
			value = 0.5 * (simplexNoise.noise(1, totalSteps / 500) + 1);
			flag = true
		}
		return value;
	};
	this.__construct__(step)
};
var WeightOption = {
		STRONGER: 1,
		NEUTRAL: 0,
		WEAKER: -1
	},
	WeightedRandom = function(power, rightModifier, leftModifier) {
		var self = this;
		this.power = 1;
		this.rightModifier = this.leftModifier = WeightOption.NEUTRAL;
		this.random = function() {
			var random = Math.random();
			return self.weightedValue(random)
		};
		this.weightedValue = function(random) {

			if (self.leftModifier == WeightOption.NEUTRAL) {
				if (self.rightModifier == WeightOption.NEUTRAL) {
					return random;
				} else {
					if (self.rightModifier == WeightOption.STRONGER) {
						return 1 - Math.pow(1 - random, self.power);
					} else {
						return 1 - Math.pow(1 - random, 1 / self.power);
					}
				}
			}

			if (self.rightModifier == WeightOption.NEUTRAL) {
				if (self.leftModifier == WeightOption.STRONGER){
					return Math.pow(random, self.power);
				} else {
					return Math.pow(random, 1 / self.power);
				}
			}

			if (0.5 > random) {
				random *= 2;
				if (self.leftModifier == WeightOption.STRONGER) {
					return  Math.pow(random, self.power) / 2;
				} else {
					return Math.pow(random, 1 / self.power) / 2;
				}
			}
			random = 2 * (random - 0.5);
			random = 1 - random;

			if (self.rightModifier == WeightOption.STRONGER) {
				return (1 - Math.pow(random, self.power)) / 2 + 0.5;
			} else {
				return (1 - Math.pow(random, 1 / self.power)) / 2 + 0.5;
			}

		};
		(function(power, rightModifier, leftModifier) {
			if(power) {
				self.power = power;
			}
			if (rightModifier) {
				self.leftModifier = rightModifier;
			}
			if (leftModifier) {
				self.rightModifier = leftModifier;
			}
		})(power, rightModifier, leftModifier)
	};
var ColorMode = {
		RGB: 0,
		HSV: 1,
		CIELCh: 2
	},
	Color = function(a, d, f, g) {
		var c = this,
			h = !0,
			k = !0,
			l = !0,
			n = !0,
			p = !0,
			r = 0,
			q = 0,
			s = 0,
			w = 0,
			t = 0,
			u = 0,
			v = 0,
			z = 0,
			C = 0,
			D = 0,
			F = 0,
			B = 0,
			G = 0,
			J = 0,
			E = 0,
			M = 1,
			N, H, P;
		this.logRGB = function() {
			console.log({
				red: c.getRed(),
				green: c.getGreen(),
				blue: c.getBlue()
			})
		};
		this.logHSV = function() {
			console.log({
				hue: c.getHue(),
				saturation: c.getSaturation(),
				value: c.getValue()
			})
		};
		this.logCIELCh = function() {
			console.log({
				l: c.getCIELCh_L(),
				c: c.getCIELCh_C(),
				h: c.getCIELCh_H()
			})
		};
		this.clone = function() {
			p && I();
			return new Color(r,
				q, s, ColorMode.RGB)
		};
		this.getRGBA = function() {
			if (p) {
				I();
				var a = Math.round(r),
					c = Math.round(q),
					f = Math.round(s),
					d = Math.round(1E3 * M) / 1E3;
				N = "rgba(" + a + ", " + c + ", " + f + ", " + d + ")";
				p = !1
			}
			return N
		};
		this.getHex = function() {
			if (n) {
				I();
				var a = Math.round(r),
					c = Math.round(q),
					f = Math.round(s);
				P = a = (a << 16) + (c << 8) + f;
				for (a = a.toString(16); 6 > a.length;) a = "0" + a;
				H = "#" + a;
				n = !1
			}
			return H
		};
		this.getHexValue = function() {
			if (n) {
				I();
				var a = Math.round(r),
					c = Math.round(q),
					f = Math.round(s);
				P = a = (a << 16) + (c << 8) + f;
				for (a = a.toString(16); 6 > a.length;) a = "0" +
					a;
				H = "#" + a;
				n = !1
			}
			return P
		};
		this.setHex = function(a) {
			I();
			a = a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(a, c, f, d) {
				return c + c + f + f + d + d
			});
			a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
			r = parseInt(a[1], 16);
			q = parseInt(a[2], 16);
			s = parseInt(a[3], 16);
			O()
		};
		this.getRed = function() {
			I();
			return r
		};
		this.setRed = function(a) {
			I();
			r = A(a, 0, 255);
			O()
		};
		this.getGreen = function() {
			I();
			return q
		};
		this.setGreen = function(a) {
			I();
			q = A(a, 0, 255);
			O()
		};
		this.getBlue = function() {
			I();
			return s
		};
		this.setBlue = function(a) {
			I();
			s = A(a,
				0, 255);
			O()
		};
		this.getAlpha = function() {
			return M
		};
		this.setAlpha = function(a) {
			M = a;
			p = !0
		};
		this.getHue = function() {
			L();
			return w
		};
		this.setHue = function(a) {
			L();
			w = A(a, 0, 360);
			Q()
		};
		this.getSaturation = function() {
			L();
			return t
		};
		this.setSaturation = function(a) {
			L();
			t = A(a, 0, 100);
			Q()
		};
		this.getValue = function() {
			L();
			return u
		};
		this.setValue = function(a) {
			L();
			u = A(a, 0, 100);
			Q()
		};
		this.getCIELCh_L = function() {
			K();
			return G
		};
		this.setCIELCH_L = function(a) {
			K();
			G = A(a, 0, 100);
			S()
		};
		this.getCIELCh_C = function() {
			K();
			return J
		};
		this.setCIELCH_C =
			function(a) {
				K();
				J = A(a, 0, 100);
				S()
			};
		this.getCIELCh_H = function() {
			K();
			return E
		};
		this.setCIELCH_H = function(a) {
			K();
			E = 360 > a ? a : a - 360;
			S()
		};
		var T = function() {
				var a = w,
					c = t,
					f = u,
					d, g, h, c = c / 100,
					f = f / 100;
				if (0 == c) d = c = f;
				else switch (a /= 60, d = Math.floor(a), g = a - d, a = f * (1 - c), h = f * (1 - c * g), g = f * (1 - c * (1 - g)), d) {
					case 0:
						d = f;
						c = g;
						f = a;
						break;
					case 1:
						d = h;
						c = f;
						f = a;
						break;
					case 2:
						d = a;
						c = f;
						f = g;
						break;
					case 3:
						d = a;
						c = h;
						break;
					case 4:
						d = g;
						c = a;
						break;
					default:
						d = f, c = a, f = h
				}
				r = A(255 * d, 0, 255);
				q = A(255 * c, 0, 255);
				s = A(255 * f, 0, 255)
			},
			U = function() {
				var a = r,
					c = q,
					f = s,
					d = Math.min(a,
						c, f),
					g = Math.max(a, c, f),
					d = g - d,
					h = g,
					k = g;
				0 != g && (k = 100 * (d / g), h = 60 * (a == g ? (c - f) / d : c == g ? 2 + (f - a) / d : 4 + (a - c) / d), 0 > h && (h += 360));
				w = h;
				t = k;
				u = 100 * (g / 255)
			},
			V = function() {
				var a = r / 255,
					c = q / 255,
					f = s / 255,
					a = 0.04045 < a ? Math.pow((a + 0.055) / 1.055, 2.4) : a / 12.92,
					c = 0.04045 < c ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92,
					f = 0.04045 < f ? Math.pow((f + 0.055) / 1.055, 2.4) : f / 12.92,
					a = 100 * a,
					c = 100 * c,
					f = 100 * f;
				v = 0.4124 * a + 0.3576 * c + 0.1805 * f;
				z = 0.2126 * a + 0.7152 * c + 0.0722 * f;
				C = 0.0193 * a + 0.1192 * c + 0.9505 * f
			},
			W = function() {
				var a = v / 95.047,
					c = z / 100,
					f = C / 108.883,
					a = 0.008856 <
					a ? Math.pow(a, 1 / 3) : 7.787 * a + 16 / 116,
					c = 0.008856 < c ? Math.pow(c, 1 / 3) : 7.787 * c + 16 / 116,
					f = 0.008856 < f ? Math.pow(f, 1 / 3) : 7.787 * f + 16 / 116;
				D = 0.008856 < c ? 116 * c - 16 : 903.3 * c;
				F = 500 * (a - c);
				B = 200 * (c - f)
			},
			X = function() {
				var a = Math.atan2(B, F),
					a = 0 < a ? 180 * (a / Math.PI) : 360 - 180 * (Math.abs(a) / Math.PI);
				G = D;
				J = Math.sqrt(Math.pow(F, 2) + Math.pow(B, 2));
				E = 360 > a ? a : a - 360
			},
			Y = function() {
				var a = G,
					c = E * (Math.PI / 180),
					f = Math.cos(c) * J,
					c = Math.sin(c) * J;
				D = a;
				F = f;
				B = c
			},
			Z = function() {
				var a = (D + 16) / 116,
					c = F / 500 + a,
					f = a - B / 200,
					a = 0.008856 < Math.pow(a, 3) ? Math.pow(a, 3) : (a -
					16 / 116) / 7.787,
					c = 0.008856 < Math.pow(c, 3) ? Math.pow(c, 3) : (c - 16 / 116) / 7.787,
					f = 0.008856 < Math.pow(f, 3) ? Math.pow(f, 3) : (f - 16 / 116) / 7.787;
				v = 95.047 * c;
				z = 100 * a;
				C = 108.883 * f
			},
			$ = function() {
				var a = v / 100,
					c = z / 100,
					f = C / 100,
					d = 3.2406 * a + -1.5372 * c + -0.4986 * f,
					g = -0.9689 * a + 1.8758 * c + 0.0415 * f,
					a = 0.0557 * a + -0.204 * c + 1.057 * f,
					d = 0.0031308 < d ? 1.055 * Math.pow(d, 1 / 2.4) - 0.055 : 12.92 * d,
					g = 0.0031308 < g ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g,
					a = 0.0031308 < a ? 1.055 * Math.pow(a, 1 / 2.4) - 0.055 : 12.92 * a;
				r = A(255 * d, 0, 255);
				q = A(255 * g, 0, 255);
				s = A(255 * a, 0, 255)
			},
			I = function() {
				h &&
				(k ? l || (Y(), Z(), $()) : T(), h = !1)
			},
			L = function() {
				k && (h ? l || (Y(), Z(), $(), U()) : U(), k = !1)
			},
			K = function() {
				l && (k ? h || (V(), W(), X()) : (T(), V(), W(), X()), l = !1)
			},
			O = function() {
				p = n = l = k = !0
			},
			Q = function() {
				p = n = l = h = !0
			},
			S = function() {
				p = n = k = h = !0
			},
			A = function(a, c, f) {
				return Math.min(f, Math.max(c, a))
			};
		(function(a, f, d, g) {
			g || (g = ColorMode.RGB);
			"string" == typeof a ? c.setHex(a) : g == ColorMode.RGB ? (a && (r = A(a, 0, 255)), f && (q = A(f, 0, 255)), d && (s = A(d, 0, 255)), h = !1) : g == ColorMode.HSV ? (a && (w = A(a, 0, 360)), f && (t = A(f, 0, 100)), d && (u = A(d, 0, 100)), k = !1) : g == ColorMode.CIELCh &&
			(a && (G = a), f && (J = f), d && (E = 360 > d ? d : d - 360), l = !1)
		})(a, d, f, g)
	};
var ColorTransition = function(a, d, f) {
	var g = [],
		c;
	this.getColorAtValue = function(a) {
		var f = 1 / (c + 1),
			d = Math.floor(a / f),
			n = Math.ceil(a / f);
		if (d == n) return a = g[d], new Color(a.getRed(), a.getGreen(), a.getBlue());
		a = (a - d * f) / f;
		var d = g[d],
			p = g[n],
			n = d.getRed() + (p.getRed() - d.getRed()) * a,
			f = d.getGreen() + (p.getGreen() - d.getGreen()) * a;
		a = d.getBlue() + (p.getBlue() - d.getBlue()) * a;
		return new Color(n, f, a)
	};
	(function(a, f, d) {
		a || (a = new Color);
		f || (f = new Color);
		d || (d = 5);
		c = d;
		g.push(a);
		d = f.getCIELCh_H();
		var n = a.getCIELCh_H(),
			p = d - n;
		180 <
		Math.abs(p) && (0 < p ? n += 360 : d += 360);
		for (var p = 1 / (c + 1), r = 0; r < c; r++) {
			var q = (r + 1) * p,
				s = a.getCIELCh_L() + (f.getCIELCh_L() - a.getCIELCh_L()) * q,
				w = a.getCIELCh_C() + (f.getCIELCh_C() - a.getCIELCh_C()) * q,
				q = new Color(s, w, n + (d - n) * q, ColorMode.CIELCh);
			g.push(q)
		}
		g.push(f)
	})(a, d, f)
};
var Point2D = function(x, y) {
	this.x = x ? x : 0;
	this.y = y ? y : 0;
	this.rotate = function(val) {
		var d = this.x * Math.cos(val) - this.y * Math.sin(val);
		val = this.x * Math.sin(val) + this.y * Math.cos(val);
		this.x = d;
		this.y = val
	};
	this.rotateAround = function(a, d) {
		d = d || {
				x: 0,
				y: 0
			};
		var c = Math.cos,
			h = Math.sin;
		this.x = c(a) * (this.x - d.x) - h(a) * (this.y - d.y) + d.x;
		this.y = h(a) * (this.x - d.x) + c(a) * (this.y - d.y) + d.y
	};
	this.translate = function(a, d) {
		this.x += a;
		this.y += d
	};
	this.scaleX = function(val) {
		this.x *= val
	};
	this.scaleY = function(val) {
		this.y *= val
	};
	this.scale = function(val) {
		this.x *= val;
		this.y *= val;
	}
};
var Point3D = function() {
	this.z = this.y = this.x = 0
};
var Polygon3D = function() {
	var self = this,
		verticesLength = 4;
	this.color = null;
	this.__construct__ = function() {
		self.points = [new Point3D, new Point3D, new Point3D, new Point3D]
	};
	this.setVerticesLength = function(length) {
		for (; verticesLength < length;) {
			self.points.push(new Point3D);
			verticesLength++;
		}
		for (; verticesLength > length;) {
			self.points.pop();
			verticesLength--;
		}
	};
	this.getVerticesLength = function() {
		return verticesLength
	};
	this.__construct__()
};
var Flat3dSetup = function(canvasDom, scale) {
	var self = this,
		polygons = [],
		canvas, context2d, canvasWidth, canvasHeight, maxDepth = 0;
	this.yOffset = 0;
	this.scale = 1;
	this.shouldClear = !0;
	/**
	 *
	 * @param canvasDom
	 * @param scale
	 * @private
	 */
	this.__construct__ = function(canvasDom, scale) {
		canvas = canvasDom;
		context2d = canvas.getContext("2d");
		if (!scale) {
			scale = 1;
		}
		self.scale = scale;
		canvasWidth = canvas.clientWidth * scale;
		canvasHeight = canvas.clientHeight * scale;
		// Math.max(canvasWidth, canvasHeight);
		// Math.tan(62.5 / 180 * Math.PI);

		//Starting Drawing position?
		new Point2D(canvasWidth / 2, 0);
	};
	this.addPolygonAtDepth = function(polygon, depth) {
		if (polygon) {
			if (!depth) {
				depth = 0
			}
			maxDepth = Math.max(maxDepth, depth);
			if (!polygons[depth]) {
				polygons[depth] = [];
			}
			polygons[depth].push(polygon)
		}
	};
	this.removePolygon = function(polygon) {
		for (var i = maxDepth; 0 <= i; i--)
			if (polygons[i]) {
				var index = polygons[i].indexOf(polygon);
				- 1 != index && polygons[i].splice(index, 1)
			}
	};
	this.clear = function() {
		if (self.shouldClear) {
			context2d.clearRect(0, 0, canvasWidth, canvasHeight)
		}
	};
	this.draw = function() {
		if(self.shouldClear) {
			context2d.clearRect(0, 0, canvasWidth, canvasHeight);
		}
		for (var i = maxDepth; i >= 0; i--) {
			if (polygons[i]) {
				for (var n = 0; n < polygons[i].length; n++) {
					var polygon = polygons[i][n],
						points = polygon.points;
					context2d.fillStyle = polygon.color.getRGBA();
					context2d.beginPath();
					context2d.moveTo(
						points[0].x * self.scale,
						points[0].y * self.scale + canvasHeight / 2 - self.yOffset * self.scale
					);
					for (var length = polygon.getVerticesLength(), pointIndex = 1; pointIndex < length; pointIndex++) {
						context2d.lineTo(
							points[pointIndex].x * self.scale,
							points[pointIndex].y * self.scale + canvasHeight / 2 - self.yOffset * self.scale
						);
					}
					context2d.lineTo(
						points[0].x * self.scale,
						points[0].y * self.scale + canvasHeight / 2 - self.yOffset * self.scale
					);
					context2d.fill();
					context2d.closePath()
				}
			}
		}
	};
	this.resetSize = function() {
		canvasWidth = canvas.clientWidth *
			self.scale;
		canvasHeight = canvas.clientHeight * self.scale
	};
	this.__construct__(canvasDom, scale)
};
var DrawStyle = {
		LINE: 0,
		CANVAS_RIBBON: 1,
		DOM_RIBBON: 2
	},
	Ribbon = function(domElem, color1, color2, scale) {
		var self = this;
		self.drawStyle = DrawStyle.CANVAS_RIBBON;
		self.fullRibbonWidth = 136;
		self.collapsedRibbonWidth = 70;
		self.width = self.fullRibbonWidth;
		self.pullStrength = 0;
		self.pullSpread = 0;
		self.drivePoint = 0.5;
		self.straightenStrength = 0;
		self.verticalPosition = 0.5;
		self.positionDamping = 0;
		self.canDestruct = true;
		self.idleSpeed = 0.3;
		self.speed = self.idleSpeed;
		var canvas, Context2d, canvasDimensions = {},
			currentSegment = null,
			totalSegmentLength = 0,
			lengthMultiplier = 1,
			segmentPulled = null,
			totalSegmentLengthAtLastPull = 0;
		this.yOffsetForce = this.yOffset = 0;
		self.primaryColor = null;
		var flat3dDrawer = self.secondaryColor = null,
			ribbonDomHolder = null;
		self.setShouldClear = function(shouldClear) {
			if (flat3dDrawer) {
				flat3dDrawer.shouldClear = shouldClear;
			}
		};
		self.clearCanvas = function() {
			flat3dDrawer.clear();
		};
		self.setWidth = function(fullWidth, collapsedWidth) {
			self.fullRibbonWidth = fullWidth;
			self.collapsedRibbonWidth = collapsedWidth;
			self.width = fullWidth;
			lengthMultiplier = fullWidth / 136;
			for (var segment = currentSegment; segment;) {
				segment.setLengthMultiplier(lengthMultiplier);
				segment = segment.nextSegment;
			}
		};
		self.advance = function() {
			self.move(self.speed);
			var segmentBeingPulled = getSegmentFromPullPoint(self.drivePoint);
			var advanceSegment = function(segment, anchorPoint) {
				segment.setColor();
				segment.advance();
				segment.applyForces(anchorPoint);
			};
			advanceSegment(segmentBeingPulled, SegmentAnchorPoint.CENTER);
			for (var segment = segmentBeingPulled.previousSegment; segment;) {
				advanceSegment(segment, SegmentAnchorPoint.END);
				segment = segment.previousSegment;
			}
			for (segment = segmentBeingPulled.nextSegment; segment;) {
				advanceSegment(segment, SegmentAnchorPoint.START);
				segment = segment.nextSegment;
			}
			if (self.drawStyle == DrawStyle.CANVAS_RIBBON) {
				for (segment = currentSegment; segment;) {
					segment.resetPolygon();
					segment = segment.nextSegment;
				}
			}
		};
		self.draw = function() {
			var halfAvgSegmentHeight = getHalfOFAvgSegmentHeight(),
				segmentYOffset = 0.0005 * (halfAvgSegmentHeight - self.yOffset);
			self.yOffsetForce *= 0.95;
			self.yOffsetForce += segmentYOffset;
			var contentHeight = canvasDimensions.height * Math.pow(1 - self.positionDamping, 2);
			var totalYOffset = self.yOffset + self.yOffsetForce;
			if(Math.abs(halfAvgSegmentHeight - totalYOffset) > contentHeight / 2) {
				totalYOffset += (( halfAvgSegmentHeight - totalYOffset > 0 ? halfAvgSegmentHeight - contentHeight / 2 : halfAvgSegmentHeight + contentHeight / 2) - totalYOffset) * Math.max((self.positionDamping - 0.1) / 0.9, 0);
				self.yOffsetForce = totalYOffset - self.yOffset;
			}
			self.yOffset = totalYOffset;
			if (self.drawStyle == DrawStyle.LINE) {
				Context2d.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
				Context2d.strokeStyle = "#000000";
				Context2d.beginPath();
				var segment = currentSegment;
				for (Context2d.moveTo(segment.startPoint.x, canvasDimensions.height / 2 + segment.startPoint.y - self.yOffset); segment;) {
					Context2d.lineTo(segment.endPoint.x, canvasDimensions.height / 2 + segment.endPoint.y - self.yOffset);
					segment = segment.nextSegment;
				}
				Context2d.stroke();
				Context2d.closePath();
				for (segment = currentSegment; segment;) {
					Context2d.fillStyle = "#FF0000";
					Context2d.beginPath();
					Context2d.arc(segment.endPoint.x, canvasDimensions.height / 2 + segment.endPoint.y - self.yOffset, 5, 0, 2 * Math.PI);
					Context2d.fill();
					Context2d.closePath();
					segment = segment.nextSegment
				}
			} else if (self.drawStyle == DrawStyle.CANVAS_RIBBON) {
				flat3dDrawer.yOffset = self.yOffset;
				flat3dDrawer.draw();
			} else if (self.drawStyle == DrawStyle.DOM_RIBBON) {
				ribbonDomHolder.yOffset = -self.yOffset + canvasDimensions.height / 2;
				ribbonDomHolder.update();
			}
		};
		self.move = function(amount) {
			for (var segment = currentSegment; segment;) {
				segment.move(amount);
				segment = segment.nextSegment;
			}
			if (self.canDestruct) {
				self.destroySegments();
			}
			self.createSegments()
		};
		self.straighten = function() {
			self.straightenStrength = Math.max(Math.min(self.straightenStrength, 1), 0);
			self.width = self.collapsedRibbonWidth + (self.fullRibbonWidth - self.collapsedRibbonWidth) * (1 - self.straightenStrength);

			var segment = segmentPulled ? segmentPulled : getSegmentFromPullPoint(0.5);
			segment.width = self.width;
			segment.straightenStrength = Math.min(self.straightenStrength + self.pullStrength, 1);
			segment.applyForces(SegmentAnchorPoint.CENTER);
			for (var seg = segment.nextSegment, pullStrength; seg;) {
				seg.width = self.width;
				pullStrength = 1;
				if (self.pullSpread > 0) {
					// the further away from the pull, the weak the pull strength
					pullStrength = seg.distanceFromSegment(segment, SearchDirection.LEFT) / totalSegmentLengthAtLastPull;
					var doublePullSpread = 2 * self.pullSpread,
						quadrupleSpread = 2 * doublePullSpread;

					if(pullStrength < doublePullSpread) {
						pullStrength = 1
					} else if (pullStrength > quadrupleSpread) {
						pullStrength = 0;
					} else {
						pullStrength = 1 - (pullStrength - doublePullSpread) / (quadrupleSpread - doublePullSpread);
					}
				}
				pullStrength *= self.pullStrength;
				seg.straightenStrength = Math.min(self.straightenStrength + pullStrength, 1);
				seg.applyForces(SegmentAnchorPoint.START);
				seg = seg.nextSegment
			}
			for (seg = segment.previousSegment; seg;) {
				seg.width = self.width;
				pullStrength = 1;
				if (self.pullSpread > 0) {
					pullStrength = seg.distanceFromSegment(segment, SearchDirection.RIGHT) / totalSegmentLengthAtLastPull;
					doublePullSpread = 2 * self.pullSpread;
					quadrupleSpread = 2 * doublePullSpread;

					if(pullStrength < doublePullSpread) {
						pullStrength = 1;
					} else if (pullStrength > quadrupleSpread) {
						pullStrength = 0;
					} else {
						pullStrength = 1 - (pullStrength - doublePullSpread) / (quadrupleSpread - doublePullSpread);
					}

				}
				pullStrength *= self.pullStrength;
				seg.straightenStrength = Math.min(self.straightenStrength + pullStrength, 1);
				seg.applyForces(SegmentAnchorPoint.END);
				seg = seg.previousSegment
			}
		};
		self.setPullPoint = function(pullPoint) {
			segmentPulled = getSegmentFromPullPoint(pullPoint);
			totalSegmentLengthAtLastPull = totalSegmentLength;
		};
		self.clearPullPoint = function() {
			segmentPulled = null
		};
		self.destroySegments = function() {
			for (;currentSegment.endPoint.x < -800;) {
				if (flat3dDrawer) {
					flat3dDrawer.removePolygon(currentSegment.polygon);
				}
				if (ribbonDomHolder) {
					ribbonDomHolder.removeSegment(currentSegment);
				}
				totalSegmentLength -= currentSegment.segmentLength;
				currentSegment = currentSegment.nextSegment;
				currentSegment.previousSegment = null;
			}

			for (; currentSegment.startPoint.x > canvasDimensions.width + 800;) {
				if (flat3dDrawer) {
					flat3dDrawer.removePolygon(currentSegment.polygon);
				}
				if (ribbonDomHolder) {
					ribbonDomHolder.removeSegment(currentSegment);
				}
				totalSegmentLength -= currentSegment.segmentLength;
				currentSegment = currentSegment.previousSegment;
				currentSegment.nextSegment = null;
			}
		};
		self.createSegments = function() {
			for (var segments = [], isStarting = false; currentSegment.startPoint.x > -600;) {
				currentSegment = new RibbonSegment(currentSegment, self.primaryColor, self.secondaryColor, isStarting);
				currentSegment.setLengthMultiplier(lengthMultiplier);
				segments.push(currentSegment);

				for (var n = 0; hasSegmentsCloseToEachOther(currentSegment) && n < 5;) {
					n++;
					currentSegment = segments[0].nextSegment;
					currentSegment.previousSegment = null;
					if (flat3dDrawer) {
						for (var j = segments.length, i = 0; i < j; i++) {
							flat3dDrawer.removePolygon(segments[i].polygon);
						}
					}
					if (ribbonDomHolder) {
						for (j = segments.length, i = 0; i < j; i++) {
							ribbonDomHolder.removeSegment(segments[i]);
						}
					}
					segments = [];
					currentSegment = new RibbonSegment(currentSegment, self.primaryColor, self.secondaryColor, true);
					currentSegment.setLengthMultiplier(lengthMultiplier);
					segments.push(currentSegment)
				}

				totalSegmentLength += currentSegment.segmentLength;
				currentSegment.width = self.width;
				currentSegment.straightenStrength = Math.max(currentSegment.nextSegment.straightenStrength, self.pullStrength);
				currentSegment.applyForces(SegmentAnchorPoint.END);
				if (flat3dDrawer) {
					addPolygonToFlat3d(currentSegment);
				}
				if (ribbonDomHolder) {
					ribbonDomHolder.addSegment(currentSegment);
				}
			}
			segments = [];
			for (isStarting = false; currentSegment.endPoint.x < canvasDimensions.width + 600;) {
				currentSegment = new RibbonSegment(currentSegment, self.primaryColor, self.secondaryColor, isStarting);
				currentSegment.setLengthMultiplier(lengthMultiplier);
				segments.push(currentSegment);
				for (n = 0; hasSegmentsCloseToEachOther(currentSegment) && n < 5;) {
					n++;
					currentSegment = segments[0].previousSegment;
					currentSegment.nextSegment = null;
					if (flat3dDrawer) {
						for (i = 0, j = segments.length; i < j; i++) {
							flat3dDrawer.removePolygon(segments[i].polygon);
						}
					}
					if (ribbonDomHolder) {
						for (i = 0, j = segments.length; i < j; i++) {
							ribbonDomHolder.removeSegment(segments[i]);
						}
					}
					segments = [];
					currentSegment = new RibbonSegment(currentSegment, self.primaryColor, self.secondaryColor, false);
					currentSegment.setLengthMultiplier(lengthMultiplier);
					segments.push(currentSegment)
				}
				totalSegmentLength += currentSegment.segmentLength;
				currentSegment.width = self.width;
				currentSegment.straightenStrength = Math.max(currentSegment.previousSegment.straightenStrength, self.pullStrength);
				currentSegment.applyForces(SegmentAnchorPoint.START);
				if (flat3dDrawer) {
					addPolygonToFlat3d(currentSegment);
				}
				if (ribbonDomHolder) {
					ribbonDomHolder.addSegment(currentSegment);
				}
			}
		};
		self.resetSize = function() {
			canvasDimensions.width = canvas.clientWidth;
			canvasDimensions.height = canvas.clientHeight;
			if (flat3dDrawer) {
				flat3dDrawer.resetSize();
			}
		};
		self.setColors = function(color1, color2) {
			self.primaryColor.setRed(color1.getRed());
			self.primaryColor.setGreen(color1.getGreen());
			self.primaryColor.setBlue(color1.getBlue());
			self.secondaryColor.setRed(color2.getRed());
			self.secondaryColor.setGreen(color2.getGreen());
			self.secondaryColor.setBlue(color2.getBlue());
		};
		self.secondaryColorFromPrimaryColor = function(a) {
			return new Color(a.getHue(), a.getSaturation() + 7, a.getValue() - 19, ColorMode.HSV)
		};
		self.getCurrentVerticalPosition = function() {
			for (var count = 0, totalHeight = 0, segment = currentSegment; segment;) {
				count++;
				totalHeight += segment.startPoint.y;
				totalHeight += segment.endPoint.y;
				segment = segment.nextSegment
			}
			return (totalHeight / (2 * count) - self.yOffset + canvasDimensions.height / 2 - self.width / 2) / (canvasDimensions.height - self.width)
		};
		function addPolygonToFlat3d(segment) {
			if (segment.backface) {
				flat3dDrawer.addPolygonAtDepth(segment.polygon, 1);
			} else {
				flat3dDrawer.addPolygonAtDepth(segment.polygon, 0);
			}
		}
		function getSegmentFromPullPoint(pullPoint) {
			for (var segment = currentSegment; segment;) {
				if (segment.endPoint.x / canvasDimensions.width > pullPoint || !segment.nextSegment) {
					return segment;
				}
				segment = segment.nextSegment
			}
		}
		function getHalfOFAvgSegmentHeight() {
			for (var totalSegments = 0, totalHeight = 0, segment = currentSegment; segment;) {
				totalSegments++;
				totalHeight += segment.startPoint.y;
				totalHeight += segment.endPoint.y;
				segment = segment.nextSegment;
			}
			return totalHeight / (2 * totalSegments) + (0.5 - self.verticalPosition) * (canvasDimensions.height - self.width)
		}
		function hasSegmentsCloseToEachOther(segment) {
			var hasNextSegment = segment.nextSegment;
			var current;
			if (hasNextSegment) {
				current = segment.nextSegment.nextSegment;
			} else {
				current = segment.previousSegment.previousSegment;
			}

			for (var i = 0; current && i < 6;) {

				var segOriginalStartPoint = segment.originalStartPoint;
				var segOriginalEndPoint = segment.originalEndPoint;
				var segDistance = getDistance(segOriginalEndPoint, segOriginalStartPoint);

				var currentOriginalStartingPoint = current.originalStartPoint;
				var currentOriginalEndPoint = current.originalEndPoint;
				var currentDistance = getDistance(currentOriginalEndPoint, currentOriginalStartingPoint);

				var areaDiff = getAreaDiff(getDistance(currentOriginalStartingPoint, segOriginalStartPoint), segDistance);

				var diff1, diff2, close;

				if (areaDiff == 0 && segDistance == 0) {
					close = currentOriginalStartingPoint.x < 0 - segOriginalStartPoint.x != 0 > currentOriginalStartingPoint.x - segOriginalEndPoint.x != 0 > currentOriginalEndPoint.x - segOriginalStartPoint.x != 0 > currentOriginalEndPoint.x - segOriginalEndPoint.x || 0 > currentOriginalStartingPoint.y - segOriginalStartPoint.y != 0 > currentOriginalStartingPoint.y - segOriginalEndPoint.y != 0 > currentOriginalEndPoint.y - segOriginalStartPoint.y != 0 > currentOriginalEndPoint.y - segOriginalEndPoint.y
				} else {
					diff1 = areaDiff / segDistance;
					diff2 = getAreaDiff(getDistance(currentOriginalStartingPoint, segOriginalStartPoint), currentDistance) / segDistance;
					close = diff2 >= 0 && diff2 <= 1&& diff1 >= 0 && diff1 <= 1
				}

				if (close) {
					return true;
				}
				if (hasNextSegment) {
					current = current.nextSegment;
				} else {
					current = current.previousSegment;
				}
				i++
			}
			return false;
		}
		function getAreaDiff(point1, point2) {
			return point1.x * point2.y - point1.y * point2.x;
		}
		function getDistance(point1, point2) {
			var distance = {};
			distance.x = point1.x - point2.x;
			distance.y = point1.y - point2.y;
			return distance;
		}
		(function(domElem, color1, color2, scale) {
			canvas = domElem;
			if (canvas.getContext) {
				Context2d = canvas.getContext("2d");
			}
			if (!scale) {
				scale = 1;
			}
			canvasDimensions.width = canvas.clientWidth;
			canvasDimensions.height = canvas.clientHeight;

			if (color1 && color1.substr) {
				self.primaryColor = new Color(color1);
			} else {
				if (color1) {
					self.primaryColor = color1;
				} else {
					self.primaryColor = new Color(255 * Math.random(), 255 * Math.random(), 255 * Math.random());

					if (self.primaryColor.getValue() <= 20) {
						self.primaryColor.setValue(20);
					}
				}
			}

			if (color2 && color2.substr) {
				self.secondaryColor = new Color(color2);
			} else {
				if (color2) {
					self.secondaryColor = color2;
				} else {
					self.secondaryColor = self.secondaryColorFromPrimaryColor(self.primaryColor);
				}
			}

			if (self.drawStyle == DrawStyle.CANVAS_RIBBON) {
				flat3dDrawer = new Flat3dSetup(canvas, scale);
			}
			if (self.drawStyle == DrawStyle.DOM_RIBBON) {
				ribbonDomHolder = new RibbonDOMHolder(canvas);
			}
			currentSegment = new RibbonSegment(null, self.primaryColor, self.secondaryColor);
			currentSegment.setLengthMultiplier(lengthMultiplier);

			totalSegmentLength += currentSegment.segmentLength;

			if (flat3dDrawer) {
				addPolygonToFlat3d(currentSegment);
			}
			if (ribbonDomHolder) {
				ribbonDomHolder.addSegment(currentSegment);
			}
			self.createSegments();
			self.yOffset = getHalfOFAvgSegmentHeight();
			if (Math.random() > 0.5) {
				self.speed *= -1;
			}
		})(domElem, color1, color2, scale)
	};
var segmentMinimumLength = 300,
	segmentMaximumLength = 700,
	AllowedDirection = {
		ANY: 0,
		UP: 1,
		DOWN: 2
	},
	SegmentAnchorPoint = {
		START: 0,
		CENTER: 1,
		END: 2
	},
	SearchDirection = {
		LEFT: 0,
		RIGHT: 1
	},
	oneSidedWeightedRandom = new WeightedRandom(1.5, WeightOption.NEUTRAL, WeightOption.STRONGER),
	twoSidedWeightedRandom = new WeightedRandom(1.5, WeightOption.STRONGER, WeightOption.STRONGER),
	degToRad = Math.PI / 180,
	/**
	 *
	 * @param segment
	 * @param color1
	 * @param color2
	 * @param isStarting
	 * @constructor
	 */
	RibbonSegment = function(segment, color1, color2, isStarting) {
		var self = this;
		self.previousSegment = null;
		self.nextSegment = null;
		self.backface = false;
		self.startPoint = {};
		self.endPoint = {};
		self.width = 136;
		self.segmentLength = 0;
		self.originalStartPoint = {};
		self.originalEndPoint = {};
		self.straightenStrength = 0;
		self.simplexStepper = new SimplexStepper(0.6);
		self.polygon = new Polygon3D;
		self.primaryColor = color1;
		self.secondaryColor = color2;
		self.color = color1;
		var baseAngleUnit = 20,
			lengthMultiplier = 1;
		this.move = function(amount) {
			self.startPoint.x -= amount;
			self.endPoint.x -= amount
		};
		this.advance = function() {
			self.simplexStepper.advance();
		};
		this.applyForces = function(anchorPoint) {
			var currentAngle = self.getCurrentAngle(),
				xRatio = Math.cos(currentAngle * degToRad),
				yRatio = Math.sin(currentAngle * degToRad);
			if (anchorPoint == SegmentAnchorPoint.CENTER) {
				var anchorPointX = (self.startPoint.x + self.endPoint.x) / 2;
				var anchorPointY = (self.startPoint.y + self.endPoint.y) / 2;
				self.endPoint.x = anchorPointX + self.segmentLength / 2 * xRatio;
				self.endPoint.y = anchorPointY + self.segmentLength / 2 * yRatio;
				self.startPoint.x = anchorPointX - self.segmentLength / 2 * xRatio;
				self.startPoint.y = anchorPointY - self.segmentLength / 2 * yRatio
			} else if (anchorPoint == SegmentAnchorPoint.START) {
				if (self.previousSegment) {
					self.startPoint.x = self.previousSegment.endPoint.x;
					self.startPoint.y = self.previousSegment.endPoint.y;
				}
				self.endPoint.x = self.startPoint.x + self.segmentLength * xRatio;
				self.endPoint.y = self.startPoint.y + self.segmentLength * yRatio
			} else {
				if (self.nextSegment) {
					self.endPoint.x = self.nextSegment.startPoint.x;
					self.endPoint.y = self.nextSegment.startPoint.y;
				}
				self.startPoint.x = self.endPoint.x - self.segmentLength * xRatio;
				self.startPoint.y = self.endPoint.y - self.segmentLength * yRatio;
			}
		};
		self.setColor = function() {
			if (self.backface) {
				var base = 360,
					angle = self.getCurrentAngle();

				if (self.previousSegment) {
					base = Math.min(base, Math.abs(angle - self.previousSegment.getCurrentAngle()));
				}

				if (self.nextSegment) {
					base = Math.min(base, Math.abs(self.nextSegment.getCurrentAngle() - angle));
				}
				base = Math.min(Math.max(base - 30, 0) / 10, 1);

				self.color.setRed(self.primaryColor.getRed() + (self.secondaryColor.getRed() - self.primaryColor.getRed()) * base);
				self.color.setGreen(self.primaryColor.getGreen() + (self.secondaryColor.getGreen() - self.primaryColor.getGreen()) * base);
				self.color.setBlue(self.primaryColor.getBlue() + (self.secondaryColor.getBlue() - self.primaryColor.getBlue()) * base)
			}
		};
		self.getCurrentAngle = function() {
			var movedAngle = baseAngleUnit * self.simplexStepper.getValue() - (baseAngleUnit / 2);
			return (self.primaryAngle + movedAngle) * (1 - self.straightenStrength)
		};
		self.resetPolygon = function() {
			var myAngle = self.getCurrentAngle();
			var myOppositeAngle = myAngle - 180;
			if(myOppositeAngle < - 180) {
				myOppositeAngle += 360;
			}
			var right = myOppositeAngle - 90;
			var left = myOppositeAngle + 90;
			var left2 = myAngle - 90;
			var right2 = myAngle + 90;
			var avgAngle = 0;
			var pointIndex = 0;
			if (self.previousSegment) {
				var prevSegmentAngle = self.previousSegment.getCurrentAngle();
				var angleDiff = myAngle - prevSegmentAngle;
				var absAngleDiff = Math.abs(angleDiff);

				if (45 < absAngleDiff) {
					avgAngle = (prevSegmentAngle + myAngle) / 2;
					myOppositeAngle = myAngle - 180;

					if (myOppositeAngle < - 180) {
						myOppositeAngle += 360;
					}

					var radius = self.width / 2 / Math.cos((myOppositeAngle + 90 - avgAngle) * degToRad);
					self.polygon.points[0].x = self.startPoint.x - radius * Math.cos(avgAngle * degToRad);
					self.polygon.points[0].y = self.startPoint.y - radius * Math.sin(avgAngle * degToRad);
					self.polygon.points[0].z = self.startPoint.z;
					self.polygon.points[1].x = self.startPoint.x + radius * Math.cos(avgAngle * degToRad);
					self.polygon.points[1].y = self.startPoint.y + radius * Math.sin(avgAngle * degToRad);
					self.polygon.points[1].z = self.startPoint.z;
					pointIndex = 2;

				} else if (30 < absAngleDiff) {
					avgAngle = (prevSegmentAngle + myAngle) / 2;
					myOppositeAngle = myAngle - 180;

					if (myOppositeAngle < -180) {
						myOppositeAngle += 360;
					}

					var radius = self.width / 2 / Math.cos((myOppositeAngle + 90 - avgAngle) * degToRad);
					self.polygon.points[0].x = self.startPoint.x - radius * Math.cos(avgAngle * degToRad);
					self.polygon.points[0].y = self.startPoint.y - radius * Math.sin(avgAngle * degToRad);
					self.polygon.points[0].z = self.startPoint.z;
					self.polygon.points[2].x = self.startPoint.x + radius * Math.cos(avgAngle * degToRad);
					self.polygon.points[2].y = self.startPoint.y + radius * Math.sin(avgAngle * degToRad);
					self.polygon.points[2].z = self.startPoint.z;

					radius = 1 - (absAngleDiff - 30) / 15;
					avgAngle = (myAngle + prevSegmentAngle) / 2 + 90;

					if (avgAngle > 180) {
						avgAngle -= 360;
					}

					myOppositeAngle = myAngle - 180;

					if (myOppositeAngle < -180) {
						myOppositeAngle += 360;
					}

					radius *= self.width / 2 / Math.cos((avgAngle - (myOppositeAngle + 90)) * degToRad);

					if(0 < angleDiff) {
						self.polygon.points[1].x = self.startPoint.x + radius * Math.cos(avgAngle * degToRad);
						self.polygon.points[1].y = self.startPoint.y + radius * Math.sin(avgAngle * degToRad);
					} else {
						self.polygon.points[1].x = self.startPoint.x - radius * Math.cos(avgAngle * degToRad);
						self.polygon.points[1].y = self.startPoint.y - radius * Math.sin(avgAngle * degToRad);
					}
					self.polygon.points[1].z = self.startPoint.z;
					pointIndex = 3;
				} else {
					avgAngle = (myAngle + prevSegmentAngle) / 2 + 90;
					if (avgAngle > 180) {
						avgAngle -= 360;
					}

					myOppositeAngle = myAngle - 180;
					if (myOppositeAngle < -180) {
						myOppositeAngle += 360;
					}

					var radius = self.width / 2 / Math.cos((avgAngle - (myOppositeAngle + 90)) * degToRad);

					angleDiff = self.startPoint.x - 0.5 * Math.cos(myAngle * degToRad);
					absAngleDiff = self.startPoint.y - 0.5 * Math.sin(myAngle * degToRad);


					self.polygon.points[0].x = angleDiff - radius * Math.cos(avgAngle * degToRad);
					self.polygon.points[0].y = absAngleDiff - radius * Math.sin(avgAngle * degToRad);
					self.polygon.points[0].z = self.startPoint.z;
					self.polygon.points[1].x = angleDiff + radius * Math.cos(avgAngle * degToRad);
					self.polygon.points[1].y = absAngleDiff + radius * Math.sin(avgAngle * degToRad);
					self.polygon.points[1].z = self.startPoint.z;
					pointIndex = 2;
				}
			} else {
				self.polygon.points[0].x = self.startPoint.x + self.width / 2 * Math.cos(right * degToRad);
				self.polygon.points[0].y = self.startPoint.y + self.width / 2 * Math.sin(right * degToRad);
				self.polygon.points[0].z = self.startPoint.z;
				self.polygon.points[1].x = self.startPoint.x + self.width / 2 * Math.cos(left * degToRad);
				self.polygon.points[1].y = self.startPoint.y + self.width / 2 * Math.sin(left * degToRad);
				self.polygon.points[1].z = self.startPoint.z;
				pointIndex = 2;
			}

			if (self.nextSegment) {
				right2 = self.nextSegment.getCurrentAngle();
				left = right2 - myAngle;
				absAngleDiff = Math.abs(left);

				if (45 < absAngleDiff) {
					self.polygon.setVerticesLength(pointIndex + 2);
					right2 = (myAngle + right2) / 2;
					right = self.width / 2 / Math.cos((myAngle + 90 - right2) * degToRad);
					self.polygon.points[pointIndex].x = self.endPoint.x - right * Math.cos(right2 * degToRad);
					self.polygon.points[pointIndex].y = self.endPoint.y - right * Math.sin(right2 * degToRad);
					self.polygon.points[pointIndex].z = self.endPoint.z;
					self.polygon.points[pointIndex + 1].x = self.endPoint.x + right * Math.cos(right2 * degToRad);
					self.polygon.points[pointIndex + 1].y = self.endPoint.y + right * Math.sin(right2 * degToRad);
					self.polygon.points[pointIndex + 1].z = self.endPoint.z;
				} else if (30 < absAngleDiff) {
					self.polygon.setVerticesLength(avgAngle + 3);
					right2 = (myAngle + right2) / 2;
					right = self.width / 2 / Math.cos((myAngle + 90 - right2) * degToRad);
					self.polygon.points[pointIndex].x = self.endPoint.x - right * Math.cos(right2 * degToRad);
					self.polygon.points[pointIndex].y = self.endPoint.y - right * Math.sin(right2 * degToRad);
					self.polygon.points[pointIndex].z = self.endPoint.z;
					self.polygon.points[pointIndex + 2].x = self.endPoint.x + right * Math.cos(right2 * degToRad);
					self.polygon.points[pointIndex + 2].y = self.endPoint.y + right * Math.sin(right2 * degToRad);
					self.polygon.points[pointIndex + 2].z = self.endPoint.z;
					right = 1 - (absAngleDiff - 30) / 15;
					right2 = (myAngle + right2) / 2 + 90;
					180 < right2 && (right2 -= 360);
					right *= self.width / 2 / Math.cos((right2 - (myAngle + 90)) * degToRad);
					if (0 < left) {
						self.polygon.points[pointIndex + 1].x = self.endPoint.x - right * Math.cos(right2 * degToRad);
						self.polygon.points[pointIndex + 1].y = self.endPoint.y - right * Math.sin(right2 * degToRad);
					} else {
						self.polygon.points[pointIndex + 1].x = self.endPoint.x + right * Math.cos(right2 * degToRad);
						self.polygon.points[pointIndex + 1].y = self.endPoint.y + right * Math.sin(right2 * degToRad);
					}
					self.polygon.points[pointIndex + 1].z = self.startPoint.z
				} else {
					self.polygon.setVerticesLength(pointIndex + 2);
					right2 = (myAngle + right2) / 2 + 90;
					180 < right2 && (right2 -= 360);
					right = self.width / 2 / Math.cos((right2 - (myAngle + 90)) * degToRad);
					right2 = self.endPoint.x + 0.5 * Math.cos(myAngle * degToRad);
					myAngle = self.endPoint.y + 0.5 * Math.sin(myAngle * degToRad);
					left = self.endPoint.z;
					self.polygon.points[pointIndex].x = right2 - right * Math.cos(right2 * degToRad);
					self.polygon.points[pointIndex].y = myAngle - right * Math.sin(right2 * degToRad);
					self.polygon.points[pointIndex].z = left;
					self.polygon.points[pointIndex + 1].x = right2 + right * Math.cos(right2 * degToRad);
					self.polygon.points[pointIndex + 1].y = myAngle + right * Math.sin(right2 * degToRad);
					self.polygon.points[pointIndex + 1].z = left;
				}
			} else {
				self.polygon.setVerticesLength(pointIndex + 2);
				self.polygon.points[pointIndex].x = self.endPoint.x + self.width / 2 * Math.cos(right2 * degToRad);
				self.polygon.points[pointIndex].y = self.endPoint.y + self.width / 2 * Math.sin(right2 * degToRad);
				self.polygon.points[pointIndex].z = self.endPoint.z;
				self.polygon.points[pointIndex + 1].x = self.endPoint.x + self.width / 2 * Math.cos(right2 * degToRad);
				self.polygon.points[pointIndex + 1].y = self.endPoint.y + self.width / 2 * Math.sin(right2 * degToRad);
				self.polygon.points[pointIndex + 1].z = self.endPoint.z;
			}

		};
		self.distanceFromSegment = function(segment, searchDirection) {
			var distance = 0;
			if (segment == self) return distance;
			var another;
			if (searchDirection == SearchDirection.LEFT) {
				for (another = self.previousSegment; another && another != segment;) {
					distance += another.segmentLength;
					another = another.previousSegment;
				}
			} else {
				for (another = self.nextSegment; another && another != segment;) {
					distance += another.segmentLength;
					another = another.nextSegment;
				}
			}
			return distance + segment.segmentLength / 2
		};
		self.getStartEndCapLength = function() {
			if (self.previousSegment) {
				var a = self.getCurrentAngle(),
					f = self.previousSegment.getCurrentAngle();
				if (45 < Math.abs(a - f)) {
					var d = a - 180; - 180 > d && (d += 360);
					return Math.abs(Math.tan((d + 90 - (f + a) / 2) * degToRad) * (self.width / 2))
				}
			}
			return 0
		};
		self.getEndEndCapLength = function() {
			if (self.nextSegment) {
				var a = self.getCurrentAngle(),
					f = self.nextSegment.getCurrentAngle();
				if (45 < Math.abs(f - a)) return Math.abs(Math.tan((a + 90 - (a + f) / 2) * degToRad) * (self.width / 2))
			}
			return 0
		};
		self.setLengthMultiplier = function(val) {
			var newMultiplier = val / lengthMultiplier;
			lengthMultiplier = val;
			self.segmentLength *= newMultiplier
		};
		var getRandomAngle = function(minDegree, maxDegree, allowedDirection) {
			if (allowedDirection == AllowedDirection.UP) {
				return -Math.abs(oneSidedWeightedRandom.random() * minDegree);
			} else if (allowedDirection == AllowedDirection.DOWN) {
				return Math.abs(oneSidedWeightedRandom.random() * maxDegree);
			} else {
				return minDegree + twoSidedWeightedRandom.random() * (maxDegree - minDegree);
			}
		};
		(function(segment, isStarting) {
			var str = "0123456789abcdefghijklmnopqrstuvwxyz";
			var identifier = "";
			for (var length = 32; 0 < length; --length) {
				identifier += str[Math.round(35 * Math.random())];
			}
			self.identifier = identifier;
			if (segment) {
				self.backface = !segment.backface;
				if (self.backface) {
					self.color = new Color(0, 0, 0);
					baseAngleUnit /= 2;
				}
			}
			self.polygon.color = self.color;
			if (segment && segment.nextSegment && !segment.previousSegment) {
				self.nextSegment = segment;
				self.nextSegment.previousSegment = self;
				self.endPoint.x = self.nextSegment.startPoint.x;
				self.endPoint.y = self.nextSegment.startPoint.y;
				self.endPoint.z = self.nextSegment.startPoint.z;
				self.originalEndPoint.x = self.nextSegment.originalStartPoint.x;
				self.originalEndPoint.y = self.nextSegment.originalStartPoint.y;
				self.originalEndPoint.z = self.nextSegment.originalStartPoint.z;
			} else if (segment){
				self.previousSegment = segment;
				self.previousSegment.nextSegment = self;
				self.startPoint.x = self.previousSegment.endPoint.x;
				self.startPoint.y = self.previousSegment.endPoint.y;
				self.startPoint.z = self.previousSegment.endPoint.z;
				self.originalStartPoint.x = self.previousSegment.originalEndPoint.x;
				self.originalStartPoint.y = self.previousSegment.originalEndPoint.y;
				self.originalStartPoint.z = self.previousSegment.originalEndPoint.z
			} else {
				self.startPoint.x = -700;
				self.startPoint.y = 0;
				self.startPoint.z = 0;
				self.originalStartPoint.x = self.startPoint.x;
				self.originalStartPoint.y = self.startPoint.y;
				self.originalStartPoint.z = self.startPoint.z;
			}

			var allowedDirection = AllowedDirection.ANY;

			if (!isStarting) {
				if (self.previousSegment) {
					if (self.originalStartPoint.y >= 100){
						allowedDirection = AllowedDirection.UP;
					}
					if (self.originalStartPoint.y <= -100) {
						allowedDirection = AllowedDirection.DOWN;
					}
				} else if (self.nextSegment) {
					if (self.originalEndPoint.y >= 100){
						allowedDirection = AllowedDirection.DOWN;
					}
					if (self.originalEndPoint.y <= -100){
						allowedDirection = AllowedDirection.UP;
					}
				}
			}

			if (self.previousSegment) {

				if (-30 < self.previousSegment.primaryAngle && self.previousSegment.primaryAngle < 30) {
					self.primaryAngle = getRandomAngle(-130, 130, allowedDirection);
				} else if (-90 < self.previousSegment.primaryAngle && self.previousSegment.primaryAngle < 90) {
					self.primaryAngle = getRandomAngle(-60, 60, allowedDirection);
				} else if (self.previousSegment.primaryAngle <= -90) {
					self.primaryAngle = getRandomAngle(self.previousSegment.primaryAngle + 90 - 45, self.previousSegment.primaryAngle + 90 + 45, allowedDirection);
				} else {
					self.primaryAngle = getRandomAngle(self.previousSegment.primaryAngle - 90 - 45, self.previousSegment.primaryAngle - 90 + 45, allowedDirection);
				}

				allowedDirection = self.primaryAngle - self.previousSegment.primaryAngle;

				if (-55 < allowedDirection && allowedDirection < 55) {
					if(0 < allowedDirection) {
						self.primaryAngle = self.previousSegment.primaryAngle + 55.55;
					} else {
						self.primaryAngle = self.previousSegment.primaryAngle - 55.55;
					}
				}

			} else if(self.nextSegment) {

				if (-30 < self.nextSegment.primaryAngle && 30 > self.nextSegment.primaryAngle) {
					self.primaryAngle = getRandomAngle(-130, 130, allowedDirection);
				} else if (-90 < self.nextSegment.primaryAngle && 90 > self.nextSegment.primaryAngle) {
					self.primaryAngle = getRandomAngle(-60, 60, allowedDirection)
				} else if (-90 >= self.nextSegment.primaryAngle) {
					self.primaryAngle = getRandomAngle(self.nextSegment.primaryAngle + 90 - 45, self.nextSegment.primaryAngle + 90 + 45, allowedDirection);
				} else {
					self.primaryAngle = getRandomAngle(self.nextSegment.primaryAngle - 90 - 45, self.nextSegment.primaryAngle - 90 + 45, allowedDirection);
				}
				allowedDirection = self.nextSegment.primaryAngle - self.primaryAngle;

				if (55 > allowedDirection && -55 < allowedDirection) {
					self.primaryAngle = 0 < allowedDirection ? self.nextSegment.primaryAngle + 55.55 : self.nextSegment.primaryAngle - 55.55;
					if (0 < allowedDirection) {
						self.primaryAngle = self.nextSegment.primaryAngle + 55.55;
					} else {
						self.primaryAngle = self.nextSegment.primaryAngle - 55.55;
					}
				}
			} else {
				self.primaryAngle = getRandomAngle(-130, 130, allowedDirection);
			}

			var allowedRatio = Math.random();

			if (self.previousSegment && Math.abs(self.previousSegment.primaryAngle) > 90 && Math.abs(self.primaryAngle) < 90) {
				allowedRatio = 0.6 + 0.4 * allowedRatio;
			} else if (self.nextSegment && Math.abs(self.nextSegment.primaryAngle) > 90 && Math.abs(self.primaryAngle) < 90) {
				allowedRatio = 0.6 + 0.4 * allowedRatio;
			} else if (self.primaryAngle > -90 && self.primaryAngle < 90) {
				allowedRatio = 0.3 + 0.7 * allowedRatio;
			} else {
				allowedRatio = 0.3 * allowedRatio;
			}

			self.segmentLength = segmentMinimumLength + allowedRatio * (segmentMaximumLength - segmentMinimumLength);

			if (self.nextSegment) {
				self.startPoint.x = self.endPoint.x - self.segmentLength * Math.cos(self.primaryAngle * degToRad);
				self.startPoint.y = self.endPoint.y - self.segmentLength * Math.sin(self.primaryAngle * degToRad);
				self.startPoint.z = 0;
				self.originalStartPoint.x = self.originalEndPoint.x - self.segmentLength * Math.cos(self.primaryAngle * degToRad);
				self.originalStartPoint.y = self.originalEndPoint.y - self.segmentLength * Math.sin(self.primaryAngle * degToRad);
				self.originalStartPoint.z = 0
			} else {
				self.endPoint.x = self.startPoint.x + self.segmentLength * Math.cos(self.primaryAngle * degToRad);
				self.endPoint.y = self.startPoint.y + self.segmentLength * Math.sin(self.primaryAngle * degToRad);
				self.endPoint.z = 0;
				self.originalEndPoint.x = self.originalStartPoint.x + self.segmentLength * Math.cos(self.primaryAngle * degToRad);
				self.originalEndPoint.y = self.originalStartPoint.y + self.segmentLength * Math.sin(self.primaryAngle * degToRad);
				self.originalEndPoint.z = 0;
			}
		})(segment, isStarting)
	};
var RibbonDOMHolder = function(a) {
	var self = this;
	self.holder = null;
	self.yOffset = 0;
	var f = [],
		g = [];
	self.addSegment = function(a) {
		console.log("addSegment", a.identifier);
		f.push(new RibbonDOMSegment(a, c()))
	};
	self.removeSegment = function(a) {
		console.log("removeSegment", a.identifier);
		for (var c = f.length, d = 0; d < c; d++)
			if (f[d].segment === a) {
				a = f[d].element;
				a.style.display = "none";
				g.push(a);
				f.splice(d, 1);
				break
			}
	};
	self.update = function() {
		for (var a = f.length, c = 0; c < a; c++) f[c].yOffset = self.yOffset, f[c].update()
	};
	var c = function() {
		if (g.length) return g.pop();
		var a = document.createElement("div");
		a.className = "ribbon-segment";
		a.style.width = "300px";
		a.style.height = "100px";
		a.style.display = "none";
		a.style.position = "absolute";
		a.style.top = "-50px";
		a.style.left = "-150px";
		a.style.webkitTransformOrigin = "50% 50% 0";
		self.holder.appendChild(a);
		var c = document.createElement("div");
		c.className = "start-triangle";
		c.style.width = "0";
		c.style.height = "0";
		c.style.borderStyle = "solid";
		c.style.borderWidth = "0 0 100px 100px";
		c.style.borderColor = "transparent transparent #007bff transparent";
		c.style.position = "absolute";
		c.style.left = "0";
		c.style.webkitTransformOrigin = "0% 50% 0";
		a.appendChild(c);
		c = document.createElement("div");
		c.className = "end-triangle";
		c.style.width = "0";
		c.style.height = "0";
		c.style.borderStyle = "solid";
		c.style.borderWidth = "100px 100px 0 0";
		c.style.borderColor = "#007bff transparent transparent transparent";
		c.style.position = "absolute";
		c.style.right = "0";
		c.style.webkitTransformOrigin = "100% 50% 0";
		a.appendChild(c);
		c = document.createElement("div");
		c.className = "center-fill";
		c.style.width =
			"100px";
		c.style.height = "100px";
		c.style.backgroundColor = "red";
		c.style.webkitTransformOrigin = "0% 50% 0";
		a.appendChild(c);
		return a
	};
	self.holder = a
};
var RibbonDOMSegment = function(a, d) {
	var self = this;
	self.segment = null;
	self.element = null;
	self.centerFill = null;
	self.startTriangle = null;
	self.endTriangle = null;
	self.yOffset = 0;
	self.update = function() {
		var a = self.segment.getStartEndCapLength(),
			c = self.segment.getEndEndCapLength(),
			d = (self.segment.segmentLength + a + c) / 300,
			k = self.segment.width / 100,
			l = (c - a) / 2,
			n = (self.segment.startPoint.x + self.segment.endPoint.x) / 2 + Math.cos(self.segment.getCurrentAngle() * Math.PI / 180) * l,
			l = (self.segment.startPoint.y + self.segment.endPoint.y) / 2 + self.yOffset + Math.sin(self.segment.getCurrentAngle() *
					Math.PI / 180) * l,
			p = self.segment.getCurrentAngle();
		self.element.style.webkitTransform = "translate3d(" + n + "px," + l + "px, 0px) rotate3d(0,0,1," + p * Math.PI / 180 + "rad) scale3d(" + d + "," + k + ",1)";
		self.element.style.zIndex = self.segment.backface ? 0 : 1;
		d = 2 * a / (self.segment.segmentLength + a + c);
		k = 1;
		self.segment.previousSegment && self.segment.previousSegment.getCurrentAngle() > self.segment.getCurrentAngle() && (k = -1);
		self.startTriangle.style.webkitTransform = "scale3d(" + 3 * d + ", " + k + ", 1)";
		k = 2 * c / (self.segment.segmentLength + a + c);
		n = 1;
		self.segment.nextSegment && self.segment.getCurrentAngle() <
		self.segment.nextSegment.getCurrentAngle() && (n = -1);
		self.endTriangle.style.webkitTransform = "scale3d(" + 3 * k + ", " + n + ", 1)";
		a = 0.5 / (self.segment.segmentLength + a + c);
		self.centerFill.style.webkitTransform = "translate3d(" + 300 * (d - a) + "%, 0px, 0px) scale3d(" + 3 * (1 - (d + k) + a + a) + ", 1, 1)"
	};
	(function(a, c) {
		self.segment = a;
		self.element = c;
		self.element.style.display = "block";
		self.centerFill = self.element.getElementsByClassName("center-fill")[0];
		self.startTriangle = self.element.getElementsByClassName("start-triangle")[0];
		self.endTriangle = self.element.getElementsByClassName("end-triangle")[0];
		self.update()
	})(a, d)
};
var RibbonPullDirection = {
		RIGHT: 0,
		LEFT: 1
	},
	RibbonInteractionManager = function(ribbon) {
		this.ribbon = ribbon;
		var draw = function() {
			ribbon.advance();
			ribbon.draw();
		};
		this.attachToRenderFrame = function() {
			GlobalEvents.addListener(GlobalEvent.RENDER_FRAME, draw)
		};
		this.detachFromRenderFrame = function() {
			GlobalEvents.removeListener(GlobalEvent.RENDER_FRAME, draw)
		};
		this.animateToTop = function(callback) {
			var tweenObj = {
				value: 0
			};
			new Tween(tweenObj, 860, {
				value: 1,
				ease: Ease.easeIn.sine,
				onUpdate: function() {
					ribbon.verticalPosition = 0.5 - 0.5 * tweenObj.value;
					ribbon.positionDamping = tweenObj.value;
					ribbon.straightenStrength = Math.min(tweenObj.value / 0.85, 1);
					ribbon.straighten()
				},
				onComplete: function() {
					if (callback) {
						callback();
					}
				}
			})
		};
		this.releaseFromTop = function() {
			var tweenObj = {
				value: 1
			};
			new Tween(tweenObj, 860, {
				value: 0,
				ease: Ease.easeOut.sine,
				onUpdate: function() {
					ribbon.verticalPosition = 0.5 - 0.5 * tweenObj.value;
					ribbon.positionDamping = tweenObj.value;
					ribbon.straightenStrength = Math.min(tweenObj.value / 0.85, 1);
					ribbon.straighten()
				},
				onComplete: function() {}
			})
		};
		this.animatePull = function(pullDirection, color) {
			if (!color) {
				color = new Color(255 * Math.random(), 255 * Math.random(), 255 * Math.random());
			}
			var pullPoint, newSpeed, newIdleSpeed;
			if (pullDirection == RibbonPullDirection.RIGHT) {
				pullPoint = 0;
				newSpeed = 50;
				newIdleSpeed = Math.abs(ribbon.idleSpeed);
			} else {
				pullPoint = 1;
				newSpeed = -50;
				newIdleSpeed = -Math.abs(ribbon.idleSpeed);
			}
			var newColorPrimary = new ColorTransition(ribbon.primaryColor.clone(), color),
				newColorSecondary = new ColorTransition(ribbon.secondaryColor.clone(), ribbon.secondaryColorFromPrimaryColor(color));
			ribbon.canDestruct = false;
			ribbon.setPullPoint(pullPoint);
			var currentSpeed = ribbon.speed,
				tweenObj = {
					value: 0
				};
			new Tween(tweenObj, 750, {
				value: 1,
				ease: Ease.easeInOut.sine,
				onUpdate: function() {
					ribbon.pullStrength = 0.3 * tweenObj.value;
					ribbon.pullSpread = tweenObj.value;
					ribbon.straighten();
					ribbon.speed = (newSpeed - currentSpeed) * Math.min(tweenObj.value / 0.3, 1) + currentSpeed
				},
				onComplete: function() {
					ribbon.destroySegments();
					ribbon.setPullPoint(0.5);
					new Tween(tweenObj, 1150, {
						delay: 50,
						value: 0,
						ease: Ease.easeOut.back,
						onUpdate: function() {
							ribbon.pullStrength = 0.3 * tweenObj.value;
							ribbon.pullSpread = tweenObj.value;
							ribbon.straighten()
						}
					});
					var d = {
						value: 1
					};
					new Tween(d, 1250, {
						delay: 50,
						value: 0,
						ease: Ease.easeOut.cubic,
						onUpdate: function() {
							ribbon.speed = (newSpeed - newIdleSpeed) * d.value + newIdleSpeed
						},
						onComplete: function() {
							ribbon.canDestruct = true;
							ribbon.clearPullPoint()
						}
					})
				}
			});
			var tweenObj = {
				value: 0
			};
			new Tween(tweenObj, 2050, {
				value: 1,
				ease: Ease.easeInOut.cubic,
				onUpdate: function() {
					ribbon.setColors(newColorPrimary.getColorAtValue(tweenObj.value), newColorSecondary.getColorAtValue(tweenObj.value))
				}
			})
		};
		this.attachToRenderFrame()
	};
var DribbbleShots = function(a, d, f, g, c) {
	var h = this,
		k = !1,
		l = !1,
		n = !1,
		p = 0;
	h.scale = c;
	this.load = function() {
		k || (k = !0, new Ajax({
			method: "GET",
			path: "/dribbble-project/" + d + "/",
			onComplete: r,
			onFailure: function() {
				k = !1
			}
		}))
	};
	this.setOnscreen = function(a) {
		n = a;
		for (var c = 0; c < p; c++) h.shots[c].setOnscreen(a);
		n && !l && q()
	};
	var r = function(a) {
			h.shots = [];
			h.loadIndex = 0;
			for (var c = a.length, d = [], f = 0; f < Math.min(6, c);) {
				var g = Math.floor(Math.random() * (c - f));
				d.push(a[g]);
				a.splice(g, 1);
				f++
			}
			p = Math.min(c, 6);
			for (a = 0; a < p; a++) c = d[a], f = document.createElement("canvas"),
				f.id = "canvas" + a, f.width = 300 * h.scale, f.height = 300 * h.scale, c = new Triangle(f, c, h.primaryColor, h.ctaColor, h.scale, n), h.shots.push(c), h.container.appendChild(c.stage.canvas);
			n && q();
			GlobalEvents.addListener("TriangleToggleIn", w);
			GlobalEvents.addListener("TriangleToggleOut", t)
		},
		q = function() {
			h.shots && h.shots.length && (l = !0, GlobalEvents.addListener("TriangleLoad", s), h.shots[0].load())
		},
		s = function() {
			var a = h.shots[++h.loadIndex];
			a && a.load()
		},
		w = function(a) {
			a.triangle != h.activeTriangle && h.activeTriangle && h.activeTriangle.triangleMorph();
			h.activeTriangle = a.triangle
		},
		t = function(a) {
			a.triangle == h.activeTriangle && (h.activeTriangle = null)
		};
	(function(a, c, d, f) {
		h.container = a;
		h.project = c;
		h.primaryColor = d;
		h.ctaColor = f
	})(a, d, f, g)
};
Events = {
	registry: {},
	dispatch: function(a, d) {
		var f = a.uid;
		this.register(f, d.name);
		for (var f = this.registry[f][d.name], g = 0; g < f.length; g++) f[g](d)
	},
	addListener: function(a, d, f) {
		f && (a = a.uid, this.register(a, d), this.registry[a][d].push(f))
	},
	removeListener: function(a, d, f) {
		a = this.registry[a.uid][d];
		for (d = 0; d < a.length; d++) f == a[d] && a.splice(d, 1)
	},
	register: function(a, d) {
		this.registry[a] || (this.registry[a] = {});
		this.registry[a][d] || (this.registry[a][d] = [])
	},
	destroy: function(a, d) {
		this.registry[a.uid][d] = !1
	},
	showRegistry: function(a,
	                       d) {
		console.log(this.registry)
	}
};
var Sprite = function() {
	this.stage = null;
	this.height = this.width = this.y = this.x = 0;
	this.scaleY = this.scaleX = this.scale = 1;
	this.rotation = 0;
	this.alpha = 1;
	this.visible = !0;
	this.uid = Stage.getUniqueID();
	this.mouseColor = Stage.getMouseColor();
	this.mouseString = this.mouseColor.getHex();
	this.mouseEnabled = !1;
	this.children = [];
	this.mother = null;
	this.render = function(a, d) {
		if (this.stage && this.visible) {
			a.save();
			a.translate(this.x, this.y);
			a.scale(this.scaleX, this.scaleY);
			a.rotate(this.rotation * (Math.PI / 180));
			if (d) {
				this.mouseEnabled &&
				this.mouseDraw(a);
				for (var f = 0; f < this.children.length; f++) this.children[f].render(a, d)
			} else {
				a.globalAlpha *= this.alpha;
				this.draw(a);
				for (f = 0; f < this.children.length; f++) this.children[f].render(a, d);
				this.afterDraw(a)
			}
			a.restore()
		}
	};
	this.setStage = function(a) {
		a && !this.stage ? a.addMouseColor(this) : !a && this.stage && this.stage.removeMouseColor(this);
		this.stage = a;
		for (var d = 0; d < this.children.length; d++) this.children[d].setStage(a)
	};
	this.dispatchEvent = function(a) {
		Events.dispatch(this, a)
	};
	this.addEventListener = function(a,
	                                 d) {
		Events.addListener(this, a, d)
	};
	this.removeEventListener = function(a, d) {
		Events.removeListener(this, a, d)
	};
	this.dispatchRollOver = function() {
		!this.mouseOver && this.mouseEnabled && (this.dispatchEvent(new MouseEvent(MouseEvent.ROLL_OVER)), this.mouseOver = !0)
	};
	this.dispatchRollOut = function() {
		this.mouseOver && this.mouseEnabled && (this.dispatchEvent(new MouseEvent(MouseEvent.ROLL_OUT)), this.mouseOver = !1)
	};
	this.resetMouse = function() {
		this.mouseOver = !1;
		for (var a = 0; a < this.children.length; a++) this.children[a].resetMouse()
	};
	this.addChild = function(a) {
		this.children.push(a);
		a.setStage(this.stage);
		a.mother = this
	};
	this.removeChild = function(a) {
		var d = this.getChildIndex(a);
		this.children.splice(d, 1);
		a.setStage(null);
		a.mother = null;
		a.resetMouse()
	};
	this.setChildIndex = function(a, d) {
		var f = this.getChildIndex(a);
		this.children.splice(f, 1);
		this.children.splice(d, 0, a)
	};
	this.getChildIndex = function(a) {
		var d = this.children.indexOf(a);
		if (-1 == d) throw a + " is not a child of " + this;
		return d
	};
	this.isChildOf = function(a) {
		return a ? a == this.mother ? !0 :
			this.isChildOf(a.mother) : !1
	};
	this.getAncestry = function() {
		for (var a = this, d = [this]; a.mother;) d.push(a.mother), a = a.mother;
		return d
	};
	this.getProgeny = function() {
		for (var a = [this], d = 0; d < this.children.length; d++) a.concat(this.children[d].getProgeny());
		return a
	};
	this.getUncommonAncestors = function(a) {
		if (!a) return this.getAncestry();
		var d = this.getAncestry();
		a = a.getAncestry();
		for (var f = 0; f < a.length; f++) {
			var g = d.indexOf(a[f]); - 1 != g && d.splice(g, 1)
		}
		return d
	};
	this.draw = function(a) {};
	this.mouseDraw = function(a) {};
	this.afterDraw = function(a) {};
	this.toString = function() {
		return "[object Sprite]"
	}
};
var Stage = function(a, d) {
	var self = this;
	this.scale = 1;
	this.canvas = a;
	this.children = this.context = null;
	this.mouseColors = {};
	this.mouseContext = this.mouseCanvas = null;
	this.mouseOver = !1;
	this.mouseFocus = void 0;
	this.mouseEnabled = !1;
	this.layerY = this.layerX = 0;
	this.__construct__ = function() {
		this.children = [];
		this.uid = Stage.getUniqueID();
		this.context = this.canvas.getContext("2d");
		this.mouseCanvas = document.createElement("canvas");
		this.mouseContext = this.mouseCanvas.getContext("2d");
		this.mouseCanvas.width = this.canvas.width;
		this.mouseCanvas.height = this.canvas.height;
		Stage.globalContext = this.context
	};
	this.enableMouse = function() {
		if (this.mouseEnabled) return !1;
		this.canvas.onmousemove = this.onMouseMove;
		this.canvas.onmouseover = this.onMouseOver;
		this.canvas.onmouseout = this.onMouseOut;
		this.canvas.onmousedown = this.onMouseDown;
		this.canvas.onmouseup = this.onMouseUp;
		this.canvas.onclick = this.onMouseClick;
		this.mouseEnabled = !0
	};
	this.disableMouse = function() {
		if (!this.mouseEnabled) return !1;
		this.canvas.onmousemove = void 0;
		this.canvas.onmouseover =
			void 0;
		this.canvas.onmouseout = void 0;
		this.canvas.onmousedown = void 0;
		this.canvas.onmouseup = void 0;
		this.canvas.onclick = void 0;
		this.mouseEnabled = !1;
		this.mouseFocus = void 0;
		this.mouseOver = !1;
		for (var a = 0; a < this.children.length; a++) this.children[a].resetMouse()
	};
	this.refreshCanvas = function(a, c) {
		self.context.clearRect(0, 0, self.canvas.width, self.canvas.height)
	};
	this.refreshMouseCanvas = function(a, c) {};
	this.startRendering = function() {
		if (!self.rendering) {
			GlobalEvents.addListener(GlobalEvent.RENDER_FRAME, this.render);
			GlobalEvents.addListener(GlobalEvent.MOUSE_EVAL, this.evaluateMouse);
			self.rendering = true;
		}
	};
	this.stopRendering = function() {
		if (self.rendering) {
			GlobalEvents.removeListener(GlobalEvent.RENDER_FRAME, this.render);
			GlobalEvents.removeListener(GlobalEvent.MOUSE_EVAL, this.evaluateMouse);
			self.rendering = false;
		}
	};
	this.render = function() {
		self.refreshCanvas();
		self.mouseEnabled && self.refreshMouseCanvas();
		for (var a = 0; a < self.children.length; a++) {
			var c = self.children[a];
			c.render(self.context);
			self.mouseEnabled && (c.render(self.mouseContext, !0), self.dispatchMouseEvents())
		}
	};
	this.dispatchMouseEvents = function() {
		if (this.mouseOver) {
			try {
				var a =
					this.mouseContext.getImageData(this.layerX * this.scale, this.layerY * this.scale, 1, 1).data
			} catch (c) {
				return !1
			}
			a = new Color(a[0], a[1], a[2]);
			a = this.mouseColors[a.getHexValue()];
			if (a != this.mouseFocus) {
				if (this.mouseFocus)
					for (var d = this.mouseFocus.getUncommonAncestors(a), f = 0; f < d.length; f++) d[f].dispatchRollOut();
				if (a)
					for (d = a.getAncestry(), f = 0; f < d.length; f++) d[f].dispatchRollOver();
				this.mouseFocus = a;
				this.evaluateMouse()
			}
		}
	};
	this.evaluateMouse = function() {
		for (var a = "", c = self.mouseFocus; c;) {
			if (c.buttonMode) {
				a = "pointer";
				break
			}
			c = c.mother
		}
		this.canvas && (this.canvas.style.cursor = a);
		window.blur();
		window.focus()
	};
	this.onMouseDown = function(a) {
		self.mouseFocus && self.mouseFocus.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_DOWN))
	};
	this.onMouseUp = function(a) {
		self.mouseFocus && self.mouseFocus.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_UP))
	};
	this.onMouseClick = function(a) {
		self.mouseFocus && self.mouseFocus.dispatchEvent(new MouseEvent(MouseEvent.CLICK))
	};
	this.onMouseOver = function(a) {
		self.canvas.onmousemove = self.onMouseMove;
		self.mouseOver = !0
	};
	this.onMouseOut =
		function(a) {
			if (self.mouseFocus) {
				a = self.mouseFocus.getAncestry();
				for (var c = 0; c < a.length; c++) a[c].dispatchRollOut()
			}
			self.canvas.onmousemove = void 0;
			self.mouseFocus = !1;
			self.mouseOver = !1
		};
	this.onMouseMove = function(a) {
		self.layerX = void 0 == a.offsetX ? a.layerX : a.offsetX;
		self.layerY = void 0 == a.offsetY ? a.layerY : a.offsetY
	};
	this.addChild = function(a) {
		this.children.push(a);
		a.setStage(this);
		a.mother = this
	};
	this.removeChild = function(a) {
		var c = this.children.indexOf(a);
		if (-1 == c) throw a + " is not a child of " + this;
		this.children.splice(c, 1);
		a.setStage(null);
		a.mother = null
	};
	this.addMouseColor = function(a) {
		this.mouseColors[a.mouseColor.getHexValue()] = a
	};
	this.removeMouseColor = function(a) {
		delete this.mouseColors[a.mouseColor.getHexValue()]
	};
	this.dispatchEvent = function(a) {
		Events.dispatch(this, a)
	};
	this.addEventListener = function(a, c) {
		Events.addListener(this, a, c)
	};
	this.removeEventListener = function(a, c) {
		Events.removeListener(this, a, c)
	};
	this.dispatchRollOver = function() {
		!this.over && this.mouseEnabled && (this.dispatchEvent(new MouseEvent(MouseEvent.ROLL_OVER)), this.over = !0)
	};
	this.dispatchRollOut = function() {
		this.over && this.mouseEnabled && (this.dispatchEvent(new MouseEvent(MouseEvent.ROLL_OUT)), this.over = !1)
	};
	this.toString = function() {
		return "[object Stage]"
	};
	this.__construct__()
};
Stage.r = 0;
Stage.g = 0;
Stage.b = 0;
Stage.uid = 0;
Stage.renderEvent = new GlobalEvent(GlobalEvent.RENDER_FRAME);
Stage.getUniqueID = function() {
	return ++Stage.uid
};
Stage.getMouseColor = function() {
	Stage.r += 1;
	255 < Stage.r && (Stage.r = 0, Stage.g++);
	255 < Stage.g && (Stage.r = 0, Stage.g = 0, Stage.b++);
	return new Color(Stage.r, Stage.g, Stage.b)
};
Stage.init = function(a) {
	Stage.framerate = a;
	a = Math.round(1E3 * (1 / a));
	Stage.renderInterval = setInterval(Stage.renderFrame, a)
};
Stage.renderFrame = function() {
	GlobalEvents.dispatch(Stage.renderEvent)
};
Stage.suspend = function() {
	clearInterval(Stage.renderInterval)
};
var Triangle = function(a, d, f, g, c, h) {
	var self = this;
	this.onscreen = h;
	this.shot = d;
	this.primaryColor = f;
	this.ctaColor = g;
	this.scale = c;
	this.img = new Image;
	this.stage = new Stage(a);
	this.triangleMask = null;
	this.isTapping = !1;
	this.touchStartPoint = {
		x: 0,
		y: 0
	};
	this.touchScreenPoint = {
		x: 0,
		y: 0
	};
	this.isLoaded = this.isAnimated = !1;
	this.__construct__ = function() {
		this.triangleMask = new TriangleMask(this.img, this.shot, this.primaryColor, this.ctaColor, this.scale);
		this.stage.scale = this.scale;
		this.stage.addChild(this.triangleMask);
		this.stage.render()
	};
	this.load = function() {
		this.img.src = this.shot.images.hidpi || this.shot.images.normal || this.shot.images.teaser;
		this.img.onload = this.onload;
		this.isAnimated = /.gif/g.test(this.img.src)
	};
	this.setOnscreen = function(a) {
		self.onscreen = a;
		self.isLoaded && (self.onscreen ? self.isAnimated && self.stage.startRendering() : self.stage.stopRendering())
	};
	this.onload = function() {
		self.onscreen ? (R.startRendering(), setTimeout(function() {
				self.stage.startRendering();
				self.triangleMask.addEventListener("triangle_ready", self.triangleReady);
				self.triangleMask.fadeIn()
			},
			250)) : (self.triangleMask.drawImage = !0, self.triangleMask.scaleX = 1, self.triangleMask.scaleY = 1, self.triangleMask.blackAlpha = 0, self.stage.render(), self.finishLoad())
	};
	this.triangleReady = function() {
		self.isAnimated || self.stage.stopRendering();
		self.finishLoad()
	};
	this.finishLoad = function() {
		self.isLoaded = !0;
		GlobalEvents.dispatch({
			name: "TriangleLoad",
			triangle: this
		});
		self.triangleMask.addEventListener(TriangleMask.STOP_RENDERING, self.stopTriangle);
		self.triangleMask.addEventListener(TriangleMask.START_RENDERING, self.startTriangle);
		self.stage.canvas.addEventListener("touchstart",
			function(a) {
				self.isTapping = !0;
				self.touchStartPoint.x = a.touches[0].pageX;
				self.touchStartPoint.y = a.touches[0].pageY;
				self.touchScreenPoint.x = a.touches[0].clientX;
				self.touchScreenPoint.y = a.touches[0].clientY
			}, !1);
		self.stage.canvas.addEventListener("touchmove", function(a) {
			5 < Math.abs(a.touches[0].pageX - self.touchStartPoint.x) && (self.isTapping = !1);
			5 < Math.abs(a.touches[0].pageY - self.touchStartPoint.y) && (self.isTapping = !1);
			self.touchScreenPoint.x = a.touches[0].clientX;
			self.touchScreenPoint.y = a.touches[0].clientY
		}, !1);
		self.stage.canvas.addEventListener("touchend",
			function(a) {
				self.isTapping && (self.triangleMask.isTriangle ? self.triangleMask.toggle() : 180 < self.touchScreenPoint.y - self.stage.canvas.getBoundingClientRect().top ? (a.preventDefault(), window.open(self.shot.html_url)) : self.triangleMask.toggle());
				self.isTapping = !1
			}, !1);
		self.stage.canvas.addEventListener("mouseover", self.mouseOver, !1);
		self.stage.canvas.addEventListener("mouseout", self.mouseOut, !1);
		self.isAnimated && self.stage.startRendering()
	};
	this.mouseOver = function() {
		self.over = !0;
		self.stopped = !1;
		self.stage.enableMouse();
		self.stage.startRendering();
		self.stage.mouseOver = !0
	};
	this.mouseOut = function() {
		self.over = !1;
		self.stopped ? (self.stage.disableMouse(), self.isAnimated || self.stage.stopRendering(), self.stage.mouseOver = !1) : self.triangleMask.rollOut()
	};
	this.startTriangle = function(a) {
		self.stopped = !1;
		self.stage.enableMouse();
		self.stage.startRendering();
		self.stage.mouseOver = !0
	};
	this.stopTriangle = function(a) {
		self.stopped = !0;
		!1 == self.over && (self.stage.disableMouse(), self.isAnimated || self.stage.stopRendering(), self.stage.mouseOver = !1)
	};
	this.__construct__()
};
TriangleMask.prototype = new Sprite;
TriangleMask.prototype.constructor = TriangleMask;
TriangleMask.START_RENDERING = "triangle_start_rendering";
TriangleMask.STOP_RENDERING = "triangle_stop_rendering";
TriangleMask.READY = "triangle_ready";

function TriangleMask(a, d, f, g, c) {
	Sprite.call(this);
	var self = this;
	this.scale = c;
	this.img = a;
	this.shot = d;
	this.primaryColor = new Color(f);
	this.ctaColor = new Color(g);
	var k = 400 * c,
		l = 300 * c,
		n = 150 * c,
		p = 178 * c,
		r = 165 * c,
		q = 145 * c,
		s = 15 * c,
		w = 25 * c,
		t = 80.5 * c,
		u = -254 * c,
		v = -148 * c;
	this.__construct__ = function() {
		this.x = n;
		this.y = p;
		this.scaleY = this.scaleX = 0.8;
		this.width = 282 * c;
		this.height = 244 * c;
		this.buttonMode = this.mouseEnabled = !0;
		this.imageX = u;
		this.imageY = -p;
		this.maskAngle = 0;
		this.blackAlpha = this.maskScale = 1;
		this.cornerRadius = s;
		this.noTilt = !1;
		this.isTriangle = !0;
		this.rolledOver = this.toggling = this.drawImage = !1;
		this.icons = new Icons(this.shot, this.primaryColor, this.ctaColor, self.scale);
		this.icons.visible = !1;
		this.bottomBar = new BottomBar(this.primaryColor.getHex(), self.scale);
		this.bottomBar.visible = !1;
		this.bottomBar.x = -159 * this.scale;
		this.bottomBar.y = 100 * this.scale;
		this.addChild(this.icons);
		this.addChild(this.bottomBar);
		this.addListeners()
	};
	this.addListeners = function() {
		this.addEventListener(MouseEvent.ROLL_OUT, this.rollOut);
		this.addEventListener(MouseEvent.ROLL_OVER,
			this.rollOver);
		this.addEventListener(MouseEvent.CLICK, this.toggle)
	};
	this.getDistance = function(a, c) {
		var d = Math.pow;
		return Math.sqrt(d(c.x - a.x, 2) + d(c.y - a.y, 2))
	};
	this.getPointOnLine = function(a, c, d) {
		return new Point2D((1 - d) * a.x + d * c.x, (1 - d) * a.y + d * c.y)
	};
	this.getPointOnCircle = function(a, c, d) {
		x = a.x + c * Math.cos(d);
		y = a.y + c * Math.sin(d);
		return {
			x: x,
			y: y
		}
	};
	this.fadeIn = function() {
		this.drawImage = !0;
		new Tween(self, 300, {
			scaleX: 1,
			scaleY: 1,
			blackAlpha: 0,
			ease: Ease.easeOut.expo,
			onComplete: function() {
				self.dispatchEvent({
					name: TriangleMask.READY,
					triangle: self
				});
				self.blackAlpha = 0
			}
		})
	};
	this.draw = function(a) {
		var c = this.width,
			d = this.height,
			f = this.cornerRadius;
		this.c2 = new Point2D(0, 0);
		this.c5 = new Point2D(c / 2, d);
		this.c8 = new Point2D(-c / 2, d);
		var c = this.c2,
			d = this.c5,
			g = this.c8;
		this.center = new Point2D((c.x + d.x + g.x) / 3, (c.y + d.y + g.y) / 3);
		c.y -= this.center.y;
		c.x -= this.center.x;
		d.y -= this.center.y;
		d.x -= this.center.x;
		g.y -= this.center.y;
		g.x -= this.center.x;
		var p = this.getDistance(c, d),
			n = this.getDistance(d, g),
			q = this.getDistance(g, c);
		this.c1 = this.getPointOnLine(g, c, (q -
			1.75 * f) / q);
		this.c3 = this.getPointOnLine(d, c, (p - 1.75 * f) / p);
		this.c4 = this.getPointOnLine(c, d, (p - 1.75 * f) / p);
		this.c6 = this.getPointOnLine(g, d, (n - 1.75 * f) / n);
		this.c7 = this.getPointOnLine(d, g, (n - 1.75 * f) / n);
		this.c9 = this.getPointOnLine(c, g, (q - 1.75 * f) / q);
		this.rotateMask(this.maskAngle);
		self.drawTriangle(a);
		a.save();
		a.clip();
		self.drawImage && a.drawImage(this.img, this.imageX, this.imageY, k, l);
		a.fillStyle = "rgba(40,41,44," + this.blackAlpha + ")";
		a.fillRect(-200 * self.scale, -180 * self.scale, 400 * self.scale, 300 * self.scale)
	};
	this.afterDraw = function(a) {
		a.restore();
		a.strokeStyle = "#eeeeee";
		a.lineWidth = 1 * self.scale;
		a.stroke()
	};
	this.drawPoints = function(a) {
		a.fillStyle = "#ff0000";
		a.beginPath();
		a.arc(this.c1.x, this.c1.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.beginPath();
		a.arc(this.c4.x, this.c4.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.beginPath();
		a.arc(this.c7.x, this.c7.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.fillStyle = "#00ff00";
		a.beginPath();
		a.arc(this.c2.x, this.c2.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.beginPath();
		a.arc(this.c5.x,
			this.c5.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.beginPath();
		a.arc(this.c8.x, this.c8.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.fillStyle = "#0000ff";
		a.beginPath();
		a.arc(this.c3.x, this.c3.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.beginPath();
		a.arc(this.c6.x, this.c6.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill();
		a.beginPath();
		a.arc(this.c9.x, this.c9.y, 3 * this.scale, 0, 2 * Math.PI);
		a.closePath();
		a.fill()
	};
	this.drawTriangle = function(a) {
		var c = this.cornerRadius;
		a.beginPath();
		a.moveTo(this.c1.x, this.c1.y);
		a.arcTo(this.c2.x, this.c2.y, this.c3.x, this.c3.y, c);
		a.lineTo(this.c4.x, this.c4.y);
		a.arcTo(this.c5.x, this.c5.y, this.c6.x, this.c6.y, c);
		a.lineTo(this.c7.x, this.c7.y);
		a.arcTo(this.c8.x, this.c8.y, this.c9.x, this.c9.y, c);
		a.lineTo(this.c1.x, this.c1.y);
		a.closePath()
	};
	this.mouseDraw = function(a) {
		a.beginPath();
		a.fillStyle = "#00ff00";
		a.rect(-self.x, -self.y, 300 * this.scale, 300 * this.scale);
		a.closePath();
		a.fill();
		self.rolledOver && self.isTriangle && (a.lineWidth = 25 * this.scale);
		a.fillStyle = this.mouseString;
		a.strokeStyle = this.mouseString;
		this.drawTriangle(a);
		a.fill();
		a.stroke();
		a.lineWidth = 0
	};
	this.rotateMask = function(a) {
		a = a * Math.PI / 180;
		this.c1.rotate(a);
		this.c2.rotate(a);
		this.c3.rotate(a);
		this.c4.rotate(a);
		this.c5.rotate(a);
		this.c6.rotate(a);
		this.c7.rotate(a);
		this.c8.rotate(a);
		this.c9.rotate(a)
	};
	this.circleMorph = function() {
		self.cornerTween && self.cornerTween.stop();
		self.spinTween && self.spinTween.stop();
		self.tiltTween && self.tiltTween.stop();
		self.icons.show();
		self.icons.visible = !0;
		self.isTriangle = !1;
		self.cornerTween = new Tween(self, 800, {
			cornerRadius: t,
			ease: Ease.easeInOut.expo
		});
		self.spinTween = new Tween(self, 800, {
			y: q,
			scaleX: 1.5,
			scaleY: 1.5,
			blackAlpha: 1,
			rotation: 90,
			ease: Ease.easeInOut.back,
			onComplete: function() {
				self.y = q;
				self.scaleX = 1.5;
				self.scaleY = 1.5;
				self.imageX = u;
				self.imageY = -q;
				self.rotation = 90;
				self.maskAngle = 0;
				self.blackAlpha = 1;
				self.drawImage = !1;
				self.toggling = !1
			}
		})
	};
	this.triangleMorph = function() {
		self.tiltTween && self.tiltTween.stop();
		self.cornerTween && self.cornerTween.stop();
		self.spinTween && self.spinTween.stop();
		self.maskAngle = 0;
		self.imageX = u;
		self.imageY = -p;
		self.cornerTween = new Tween(self, 800, {
			delay: 200,
			cornerRadius: s,
			ease: Ease.easeInOut.expo
		});
		self.spinTween = new Tween(self, 800, {
			y: p,
			scaleX: 1,
			scaleY: 1,
			delay: 200,
			blackAlpha: 0,
			rotation: 0,
			ease: Ease.easeInOut.back,
			onComplete: function() {
				self.y = p;
				self.rotation = 0;
				self.blackAlpha = 0;
				self.scaleX = 1;
				self.scaleY = 1;
				self.dispatchEvent({
					name: TriangleMask.STOP_RENDERING,
					triangle: self
				});
				self.icons.visible = !1;
				self.isTriangle = !0;
				self.toggling = !1
			}
		});
		self.icons.hide();
		self.drawImage = !0
	};
	this.toggle = function() {
		if (self.toggling) return !1;
		self.toggling = !0;
		self.dispatchEvent({
			name: TriangleMask.START_RENDERING,
			triangle: self
		});
		self.isTriangle ?
			(self.circleMorph(), self.buttonMode = !1, GlobalEvents.dispatch(new GlobalEvent(GlobalEvent.EVAL_MOUSE)), GlobalEvents.dispatch({
				name: "TriangleToggleIn",
				triangle: self
			})) : (self.triangleMorph(), self.buttonMode = !0, GlobalEvents.dispatch(new GlobalEvent(GlobalEvent.EVAL_MOUSE)), GlobalEvents.dispatch({
			name: "TriangleToggleOut",
			triangle: self
		}));
		self.barTween && self.barTween.stop();
		self.barTween = new Tween(self.bottomBar, 400, {
			rotation: 20,
			y: 100 * self.scale,
			ease: Ease.easeOut.quint
		});
		self.bottomBar.hide()
	};
	this.rollOver = function() {
		if (!self.isTriangle || self.toggling) return !1;
		self.out = !1;
		self.rolledOver = !0;
		self.dispatchEvent({
			name: TriangleMask.START_RENDERING,
			triangle: self
		});
		self.tiltTween && self.tiltTween.stop();
		self.tiltTween = new Tween(self, 600, {
			maskAngle: 10,
			cornerRadius: w,
			y: r,
			imageY: -r,
			ease: Ease.easeOut.quint,
			onComplete: function() {}
		});
		self.imageTween && self.imageTween.stop();
		self.imageTween = new Tween(self, 800, {
			imageX: v,
			ease: Ease.easeOut.quint,
			onComplete: function() {}
		});
		self.barTween && self.barTween.stop();
		self.barTween = new Tween(self.bottomBar, 400, {
			rotation: 0,
			y: 30 * self.scale,
			ease: Ease.easeOut.quint
		});
		self.bottomBar.visible = !0;
		self.bottomBar.show()
	};
	this.rollOut = function() {
		if (!self.isTriangle || self.toggling || self.out) return !1;
		self.out = !0;
		self.rolledOver = !1;
		self.dispatchEvent({
			name: TriangleMask.START_RENDERING,
			triangle: self
		});
		self.tiltTween && self.tiltTween.stop();
		self.tiltTween = new Tween(self, 600, {
			maskAngle: 0,
			cornerRadius: s,
			y: p,
			imageY: -p,
			ease: Ease.easeOut.quint,
			onUpdate: function() {},
			onComplete: function() {}
		});
		self.imageTween && self.imageTween.stop();
		self.imageTween = new Tween(self, 800, {
			imageX: u,
			ease: Ease.easeOut.quint,
			onComplete: function() {
				self.dispatchEvent({
					name: TriangleMask.STOP_RENDERING,
					triangle: self
				});
				self.bottomBar.visible = !1;
				self.out = !1
			}
		});
		self.barTween && self.barTween.stop();
		self.barTween = new Tween(self.bottomBar, 400, {
			rotation: 20,
			y: 100 * self.scale,
			ease: Ease.easeIn.quint
		});
		self.bottomBar.hide()
	};
	this.toString = function() {
		return "[Sprite TriangleMask]"
	};
	this.__construct__()
};
Icons.prototype = new Sprite;
Icons.prototype.constructor = Icons;

function Icons(a, d, f, g) {
	Sprite.call(this);
	var self = this;
	this.scale = g;
	this.shot = a;
	this.primaryColor = d;
	this.ctaColor = f;
	this.viewTotal = a.views_count;
	this.likeTotal = a.likes_count;
	var h = 71 * g,
		k = 136 * g,
		l = -89 * g,
		n = -154 * g,
		p = 28 * g,
		r = -16 * g,
		q = 44 * g,
		s = 8 * g,
		w = -74 * g,
		t = -16 * g,
		u = 48 * g,
		v = 8 * g,
		z = -21 * g,
		C = 43 * g,
		D = 35 * g;
	this.count = {
		likes: 0,
		views: 0
	};
	this.__construct__ = function() {
		this.alpha = 0;
		this.iconsY = n;
		this.rotation = -180;
		this.scaleX = 1 / 1.5;
		this.scaleY = 1 / 1.5;
		this.views = new Image;
		this.likes = new Image;
		this.statsIcons = new Image;
		1 < self.scale ?
			(this.views.src = STATIC_URL + "img/case-studies/common/dribbble-views@2x.png", this.likes.src = STATIC_URL + "img/case-studies/common/dribbble-likes@2x.png", this.statsIcons.src = STATIC_URL + "img/case-studies/common/dribbble-stats-icons@2x.png") : (this.views.src = STATIC_URL + "img/case-studies/common/dribbble-views.png", this.likes.src = STATIC_URL + "img/case-studies/common/dribbble-likes.png", this.statsIcons.src = STATIC_URL + "img/case-studies/common/dribbble-stats-icons.png");
		this.likeCount = new CountText("0", "center",
			g);
		this.likeCount.x = 50 * self.scale;
		this.likeCount.y = 24 * self.scale;
		this.viewCount = new CountText("0", "center", g);
		this.viewCount.x = -50 * self.scale;
		this.viewCount.y = 24 * self.scale;
		this.dribbbleLink = new DribbbleLink(this.shot, this.primaryColor, this.ctaColor, this.scale);
		this.dribbbleLink.x = -123 * self.scale;
		this.dribbbleLink.y = k;
		this.addChild(this.likeCount);
		this.addChild(this.viewCount);
		this.addChild(this.dribbbleLink)
	};
	this.addListeners = function() {};
	this.draw = function(a) {
		a.drawImage(this.likes, p, r, q, s);
		a.drawImage(this.views,
			w, t, u, v);
		a.drawImage(this.statsIcons, z, this.iconsY, C, D)
	};
	this.mouseDraw = function(a) {};
	this.countUp = function() {
		self.countTween && self.countTween.stop();
		self.count = {
			likes: 0,
			feedback: 0,
			views: 0
		};
		self.likeCount.text = "0";
		self.viewCount.text = "0";
		self.countTween = new Tween(self.count, 800, {
			delay: 400,
			likes: self.likeTotal,
			feedback: self.feedbackTotal,
			views: self.viewTotal,
			ease: Ease.easeOut.sine,
			onUpdate: function() {
				self.likeCount.text = Math.round(self.count.likes) + "";
				self.viewCount.text = Math.round(self.count.views) + ""
			}
		})
	};
	this.show = function() {
		self.showTween &&
		self.showTween.stop();
		self.dribbbleLink.show();
		self.showTween = new Tween(self, 800, {
			rotation: -90,
			alpha: 1,
			iconsY: l,
			ease: Ease.easeOut.quint,
			delay: 600,
			onUpdate: function() {
				self.likeCount.textAlpha = self.alpha;
				self.viewCount.textAlpha = self.alpha;
				self.dribbbleLink.y = k + (h - k) * self.alpha
			},
			onComplete: function() {}
		});
		self.countUp()
	};
	this.hide = function() {
		self.showTween && self.showTween.stop();
		self.dribbbleLink.hide();
		self.showTween = new Tween(self, 800, {
			alpha: 0,
			rotation: -180,
			iconsY: n,
			ease: Ease.easeOut.quint,
			onUpdate: function() {
				self.likeCount.textAlpha = self.alpha;
				self.viewCount.textAlpha =
					self.alpha;
				self.dribbbleLink.y = k + (h - k) * self.alpha
			},
			onComplete: function() {
				self.alpha = 0
			}
		})
	};
	this.toString = function() {
		return "[Sprite Icons]"
	};
	this.__construct__()
};
CountText.prototype = new Sprite;
CountText.prototype.constructor = CountText;

function CountText(a, d, f) {
	Sprite.call(this);
	this.scale = f;
	this.text = a;
	this.align = d;
	this.textAlpha = 0;
	var g = 26 * f;
	this.__construct__ = function() {};
	this.addListeners = function() {};
	this.draw = function(a) {
		a.font = "bold " + g + "px 'Futura Bold'";
		var d = a.measureText(this.text).width,
			f = 0;
		"left" == this.align ? f = 0 : "right" == this.align ? f = -d : "center" == this.align && (f = -d / 2);
		a.fillStyle = "rgba(255,255,255," + Math.round(100 * this.textAlpha) / 100 + ")";
		a.fillText(this.text, f, 0)
	};
	this.mouseDraw = function(a) {};
	this.show = function() {};
	this.hide = function() {};
	this.toString = function() {
		return "[sprite CountText]"
	};
	this.__construct__()
};
DribbbleLink.prototype = new Sprite;
DribbbleLink.prototype.constructor = DribbbleLink;

function DribbbleLink(a, d, f, g) {
	Sprite.call(this);
	var self = this;
	this.scale = g;
	this.shot = a;
	this.buttonMode = !0;
	this.ctaAlpha = 0;
	var h = 113 * g,
		k = 17 * g,
		l = 20 * g,
		n = 12 * g;
	this.__construct__ = function() {
		this.mouseEnabled = !0;
		this.cta = new Image;
		this.cta.src = 1 < self.scale ? STATIC_URL + "img/case-studies/common/dribbble-arrow@2x.png" : STATIC_URL + "img/case-studies/common/dribbble-arrow.png"
	};
	this.addListeners = function() {
		this.addEventListener(MouseEvent.ROLL_OVER, this.rollOver);
		this.addEventListener(MouseEvent.ROLL_OUT, this.rollOut);
		this.addEventListener(MouseEvent.CLICK, this.click)
	};
	this.removeListeners = function() {
		this.removeEventListener(MouseEvent.ROLL_OVER, this.rollOver);
		this.removeEventListener(MouseEvent.ROLL_OUT, this.rollOut);
		this.removeEventListener(MouseEvent.CLICK, this.click)
	};
	this.draw = function(a) {
		a.fillStyle = "rgba(60, 61, 64, " + Math.round(100 * Math.min(self.ctaAlpha / 0.4, 1)) / 100 + ")";
		a.fillRect(0, 0, 246 * self.scale, 1 * self.scale);
		a.fillStyle = "rgba(32, 33, 35, " + Math.round(100 * Math.max((self.ctaAlpha - 0.4) / 0.6, 0)) / 100 + ")";
		a.fillRect(0,
			1 * self.scale, 246 * self.scale, 54 * self.scale);
		a.save();
		a.globalAlpha = self.ctaAlpha;
		a.drawImage(this.cta, h, k, l, n);
		a.restore()
	};
	this.mouseDraw = function(a) {
		a.fillStyle = self.mouseString;
		a.beginPath();
		a.arc(123 * self.scale, -71 * self.scale, 125 * self.scale, 34.1 * Math.PI / 180, 145.9 * Math.PI / 180);
		a.closePath();
		a.fill()
	};
	this.show = function() {
		self.showTween && self.showTween.stop();
		self.showTween = new Tween(self, 400, {
			ctaAlpha: 0.4,
			delay: 300,
			ease: Ease.easeOut.sine,
			onComplete: function() {
				self.addListeners()
			}
		})
	};
	this.hide = function() {
		self.removeListeners();
		self.showTween &&
		self.showTween.stop();
		self.showTween = new Tween(self, 400, {
			ctaAlpha: 0,
			ease: Ease.easeOut.sine
		})
	};
	this.rollOver = function() {
		self.showTween && self.showTween.stop();
		self.showTween = new Tween(self, 400, {
			ctaAlpha: 1,
			ease: Ease.easeOut.sine
		})
	};
	this.rollOut = function() {
		self.showTween && self.showTween.stop();
		self.showTween = new Tween(self, 400, {
			ctaAlpha: 0.4,
			ease: Ease.easeOut.sine
		})
	};
	this.click = function() {
		window.open(self.shot.html_url)
	};
	this.toString = function() {
		return "[Sprite DribbleLink]"
	};
	this.__construct__()
};
BottomBar.prototype = new Sprite;
BottomBar.prototype.constructor = BottomBar;

function BottomBar(a, d) {
	Sprite.call(this);
	var self = this;
	this.scale = d;
	this.__construct__ = function(a) {
		this.color = a;
		this.rotation = 20;
		var c = new Image;
		c.src = 1 < self.scale ? STATIC_URL + "img/case-studies/common/dribbble-stats-cta@2x.png" : STATIC_URL + "img/case-studies/common/dribbble-stats-cta.png";
		this.explore = new Sprite;
		this.explore.draw = function(a) {
			a.drawImage(c, 0, 0, 131 * self.scale, 12 * self.scale)
		};
		this.addChild(this.explore);
		this.explore.x = 114 * self.scale;
		this.explore.y = 17 * self.scale
	};
	this.addListeners = function() {};
	this.draw =
		function(a) {
			a.fillStyle = this.color;
			a.fillRect(0, 0, 318 * self.scale, 67 * self.scale)
		};
	this.mouseDraw = function(a) {
		a.fillStyle = self.mouseString;
		a.fillRect(0, 0, 318 * self.scale, 67 * self.scale)
	};
	this.show = function() {
		this.showTween && this.showTween.stop();
		this.showTween = new Tween(this.explore, 400, {
			alpha: 1,
			ease: Ease.easeOut.sine
		})
	};
	this.hide = function() {
		this.showTween && this.showTween.stop();
		this.showTween = new Tween(this.explore, 400, {
			alpha: 0,
			ease: Ease.easeOut.sine
		})
	};
	this.toString = function() {
		return "[Sprite BottomBar]"
	};
	this.__construct__(a)
};
var TapBio = function(a) {
	var self = this;
	this.element = a;
	this.touchStartPoint = {
		x: 0,
		y: 0
	};
	this.isTouchMoving = this.isTapping = !1;
	this.toggleOn = function() {
		R.addClass(self.element, "toggled")
	};
	this.toggleOff = function() {
		R.removeClass(self.element, "toggled")
	};
	(function() {
		self.element.addEventListener("touchstart", function(a) {
			self.isTouchMoving = !0;
			self.isTapping = !0;
			self.touchStartPoint.x = a.touches[0].pageX;
			self.touchStartPoint.y = a.touches[0].pageY;
			R.addClass(self.element.parentNode, "no-hover")
		}, !1);
		self.element.addEventListener("touchmove",
			function(a) {
				self.isTouchMoving = !0;
				5 < Math.abs(a.touches[0].pageX - self.touchStartPoint.x) && (self.isTapping = !1);
				5 < Math.abs(a.touches[0].pageY - self.touchStartPoint.y) && (self.isTapping = !1)
			}, !1);
		self.element.addEventListener("touchend", function(a) {
			self.isTapping && (R.hasClass(self.element, "toggled") ? (R.removeClass(self.element, "toggled"), GlobalEvents.dispatch({
				name: "bio_toggled_off",
				bio: self
			})) : (R.addClass(self.element, "toggled"), GlobalEvents.dispatch({
				name: "bio_toggled_on",
				bio: self
			})));
			self.isTapping = !1
		}, !1);
		self.element.addEventListener("mousemove",
			function(a) {
				self.isTouchMoving || R.removeClass(self.element.parentNode, "no-hover");
				self.isTouchMoving = !1
			}, !1)
	})()
};
var TapBios = function(a) {
	var self = this;
	this.elements = a;
	this.currentBio = null;
	(function() {
		for (var a = self.elements.length - 1; 0 <= a; a--) new TapBio(self.elements[a]);
		GlobalEvents.addListener("bio_toggled_on", function(a) {
			self.currentBio && self.currentBio != a.bio && self.currentBio.toggleOff();
			self.currentBio = a.bio
		});
		GlobalEvents.addListener("bio_toggled_off", function(a) {
			self.currentBio = null
		})
	})()
};
var TapNonHoverable = function(a) {
	var self = this;
	this.element = a;
	this.isTouchMoving = !1;
	(function() {
		self.element.addEventListener("touchstart", function(a) {
			self.isTouchMoving = !0;
			R.addClass(self.element.parentNode, "no-hover")
		}, !1);
		self.element.addEventListener("touchmove", function(a) {
			self.isTouchMoving = !0
		}, !1);
		self.element.addEventListener("mousemove", function(a) {
			self.isTouchMoving || R.removeClass(self.element.parentNode, "no-hover");
			self.isTouchMoving = !1
		}, !1)
	})()
};
R.Slideshow = function() {
	var self = this;
	this.html = {};
	this.dragHelper = null;
	this.animating = !1;
	this.videoPlayers = [];
	var d = 0,
		f = 0,
		g = 0,
		c = void 0,
		h = !1,
		k = !1,
		l = !1,
		n = 768 < window.innerWidth;
	this.init = function(a) {
		this.html.containerDiv = a;
		this.html.containerDiv.slideshow = this;
		this.html.screenshotsDiv = a.querySelector(".screenshots");
		this.html.screenshotDivs = a.querySelectorAll(".screenshot");
		this.html.screenshotCaptionDivs = a.querySelectorAll(".screenshot-caption");
		for (var c = 0; c < this.html.screenshotDivs.length; c++) {
			var d =
				this.html.screenshotDivs[c].querySelector(".video-player");
			d ? this.videoPlayers.push((new R.VideoPlayer).init(d, this)) : this.videoPlayers.push(null)
		}
		var f = a.querySelector(".device-aux-content .device-screen");
		f.innerHTML = this.html.screenshotsDiv.outerHTML;
		this.html.bgScreenshotsDiv = f.querySelector(".screenshots");
		this.html.slideshowControlsDiv = a.querySelector(".slideshow-controls");
		this.html.slideshowCaptionDiv = a.querySelector(".slideshow-caption");
		this.html.slideshowCaptionOuterDiv = a.querySelector(".slideshow-caption-outer");
		this.html.slideshowCaptionInnerDiv = a.querySelector(".slideshow-caption-inner");
		this.html.slideshowCaptionContentDiv = a.querySelector(".slideshow-caption-content");
		this.html.slideshowCaptionContinueSpan = a.querySelector(".slideshow-caption-continue");
		this.html.slideshowCaptionContinueSpan.innerHTML = "...continue";
		this.html.paginationBarDiv = a.querySelector(".pagination-bar");
		this.html.paginationBarOuterDiv = a.querySelector(".pagination-bar-outer");
		this.html.paginationBarInnerDiv = a.querySelector(".pagination-bar-inner");
		this.html.paginationBarContentDiv = a.querySelector(".pagination-bar-content");
		this.html.paginationBarHandleDiv = a.querySelector(".pagination-bar-handle");
		this.html.slideshowCaptionContentDiv.innerHTML = this.html.screenshotCaptionDivs[0].innerHTML;
		this.html.slideshowCaptionContentDiv.querySelector(".caption-text p").appendChild(this.html.slideshowCaptionContinueSpan);
		this.dragHelper = (new DragHelper).init();
		this.dragHelper.getDimensionX = function() {
			return f.clientWidth
		};
		return this
	};
	this.onDrag = function(c,
	                       g, h, k, n, t) {
		d = c;
		(!l && 5 < c || -5 > c) && self.hideCaption();
		k = f - c / self.html.screenshotsDiv.clientWidth;
		c = 1 - 1 / self.html.screenshotDivs.length;
		g = 1 - 1 / self.html.screenshotDivs.length / 3;
		h = -1 / self.html.screenshotDivs.length / 1.5;
		k > c ? (k = (k - c) * self.html.screenshotsDiv.clientWidth, k = Math.min(k / (window.innerWidth / 2), 1), k = c + (g - c) * k) : 0 > k && (k = (0 - k) * self.html.screenshotsDiv.clientWidth, k = Math.min(k / (window.innerWidth / 2), 1), k *= h);
		R.setTransform(self.html.screenshotsDiv, "translate3d(" + -100 * k + "%,0,0)");
		R.setTransform(self.html.bgScreenshotsDiv, "translate3d(" +
			-100 * k + "%,0,0)");
		R.setTransform(self.html.paginationBarContentDiv, "translate3d(" + 100 * k + "%,0,0)");
		return !1
	};
	this.onDragComplete = function(c, h) {
		if (c != DragHelper.OUTCOME_CLICK) {
			var k = this.html.screenshotDivs.length,
				l = Math.ceil((f - d / this.html.screenshotsDiv.clientWidth) * k);
			switch (c) {
				case DragHelper.OUTCOME_BACK:
					l -= 1
			}
			g = l = Math.max(Math.min(l, k - 1), 0);
			k = g / k;
			f - d / self.html.screenshotsDiv.clientWidth != k && (R.setTransition(self.html.screenshotsDiv, "transform .2s ease-out"), R.setTransform(self.html.screenshotsDiv, "translate3d(" +
				-100 * k + "%,0,0)"), R.setTransition(self.html.bgScreenshotsDiv, "transform .2s ease-out"), R.setTransform(self.html.bgScreenshotsDiv, "translate3d(" + -100 * k + "%,0,0)"), R.setTransition(self.html.paginationBarContentDiv, "transform .2s ease-out"), R.setTransform(self.html.paginationBarContentDiv, "translate3d(" + 100 * k + "%,0,0)"), this.animating = !0, R.onTransitionEnd(self.html.paginationBarContentDiv, function() {
				self.animating = !1
			}));
			self.hideCaption(function() {
				self.html.slideshowCaptionContentDiv.innerHTML = self.html.screenshotCaptionDivs[g].innerHTML;
				self.html.slideshowCaptionContentDiv.querySelector(".caption-text p").appendChild(self.html.slideshowCaptionContinueSpan);
				self.showCaption()
			});
			f = k
		}
	};
	this.activate = function() {
		this.addListeners()
	};
	this.deactivate = function() {
		this.removeListeners()
	};
	this.addListeners = function() {
		this.html.containerDiv[R.touch ? "ontouchstart" : "onmousedown"] = function(c) {
			self.dragHelper.start(c);
			self.dragHelper.onDrag = void 0;
			self.dragHelper.onComplete = void 0;
			self.dragHelper.onIntentClear = self.dragIntentClear;
			c.stopPropagation()
		};
		this.html.slideshowCaptionDiv.onclick =
			this.captionClick.bind(this);
		GlobalEvents.addListener(GlobalEvent.WINDOW_RESIZE, this.onResize.bind(this))
	};
	this.removeListeners = function() {
		this.html.containerDiv[R.touch ? "ontouchstart" : "onmousedown"] = void 0;
		this.html.slideshowCaptionDiv.onclick = void 0;
		GlobalEvents.removeListener(GlobalEvent.WINDOW_RESIZE, this.onResize.bind(this))
	};
	this.showCaption = function(d) {
		c = void 0;
		l = k = !1;
		self.html.slideshowCaptionDiv.style.opacity = "1"
	};
	this.hideCaption = function(d) {
		l ? d && d() : (c = d, k || (k = !0, R.setTransition(self.html.slideshowCaptionDiv,
			"opacity .2s linear"), self.html.slideshowCaptionDiv.style.opacity = 0, R.onTransitionEnd(self.html.slideshowCaptionDiv, function() {
			k = !1;
			l = !0;
			h = !1;
			R.setTransition(self.html.slideshowCaptionInnerDiv, "");
			R.setTransform(self.html.slideshowCaptionInnerDiv, "");
			n || (R.setTransition(self.html.slideshowCaptionContinueSpan, ""), self.html.slideshowCaptionContinueSpan.style.display = "block", self.html.slideshowCaptionContinueSpan.style.opacity = "1");
			c && (c(), c = void 0)
		})))
	};
	this.expandCaption = function() {
		var c = self.html.slideshowCaptionContentDiv.querySelector(".caption-text");
		self.html.slideshowCaptionContentDiv.querySelector(".caption-text-content");
		c = c.scrollHeight - c.clientHeight;
		R.setTransition(this.html.slideshowCaptionInnerDiv, "transform .25s ease-out");
		R.setTransform(this.html.slideshowCaptionInnerDiv, "translate3d(0," + -c + "px,0)");
		self.html.slideshowControlsDiv.style.zIndex = "1";
		R.setTransition(self.html.slideshowCaptionContinueSpan, "");
		self.html.slideshowCaptionContinueSpan.style.display = "none";
		self.html.slideshowCaptionContinueSpan.style.opacity = "0"
	};
	this.collapseCaption = function() {
		R.setTransition(this.html.slideshowCaptionInnerDiv,
			"transform .25s ease-out");
		R.setTransform(this.html.slideshowCaptionInnerDiv, "translate3d(0,0,0)");
		R.onTransitionEnd(this.html.slideshowCaptionInnerDiv, function() {
			h || (self.html.slideshowCaptionContinueSpan.style.display = "", R.setTransition(self.html.slideshowCaptionContinueSpan, "opacity .15s linear"), self.html.slideshowCaptionContinueSpan.style.opacity = "1", self.html.slideshowControlsDiv.style.zIndex = "")
		})
	};
	this.captionClick = function(a) {
		n || (h ? this.collapseCaption() : this.expandCaption(), h = !h)
	};
	this.stopVideoPlayers =
		function() {
			for (var a = 0; a < this.videoPlayers.length; a++) {
				var c = this.videoPlayers[a];
				c && c.stop()
			}
		};
	this.dragIntentClear = function(c) {
		self.animating || (self.stopVideoPlayers(), c == DragHelper.DRAG_DIRECTION_X ? (R.setTransition(self.html.screenshotsDiv, ""), R.setTransition(self.html.bgScreenshotsDiv, ""), R.setTransition(self.html.paginationBarContentDiv, ""), self.dragHelper.onDrag = self.onDrag.bind(self), self.dragHelper.onComplete = self.onDragComplete.bind(self), self.dragHelper.onIntentClear = void 0) : (self.dragHelper.onDrag = void 0, self.dragHelper.onComplete =
			void 0, self.dragHelper.onIntentClear = void 0, self.dragHelper.stop()))
	};
	this.onResize = function() {
		768 > window.innerWidth && n ? (n = !1, this.reset()) : 768 < window.innerWidth && !n && (n = !0, this.reset())
	};
	this.reset = function() {
		h = l = k = !1;
		c = void 0;
		self.html.slideshowCaptionContinueSpan.style.display = "";
		self.html.slideshowCaptionContinueSpan.style.opacity = "1";
		R.setTransition(this.html.slideshowCaptionInnerDiv, "");
		R.setTransform(this.html.slideshowCaptionInnerDiv, "")
	}
};
R.VideoPlayer = function() {
	var self = this;
	this.html = {};
	this.loaded = this.loading = this.playing = !1;
	this.init = function(a, f) {
		this.delegate = f;
		a.videoPlayer = this;
		this.html.containerDiv = a;
		this.html.overlayDiv = a.querySelector(".video-player-overlay");
		this.html.playLink = this.html.overlayDiv.querySelector("a");
		this.videoUrl = a.getAttribute("data-video-url");
		this.html.videoElement = document.createElement("video");
		this.html.videoImg = a.querySelector("img");
		this.addListeners();
		return this
	};
	this.addListeners = function() {
		this.html.playLink.onclick =
			this.playLinkClick.bind(this);
		this.delegate || (this.html.overlayDiv.ontouchstart = function(a) {
			a.stopPropagation()
		});
		R.touch ? this.html.videoElement.addEventListener("webkitendfullscreen", this.videoEnded, !1) : this.html.videoElement.onended = this.videoEnded
	};
	this.playLinkClick = function(a) {
		this.toggle();
		return !1
	};
	this.videoEnded = function(d) {
		self.stop()
	};
	this.loadVideo = function(a) {
		this.html.videoElement.canPlayType("video/mp4") || (this.videoUrl = this.videoUrl.replace(/\.mov$/, ".ogg"));
		this.html.videoElement.src =
			this.videoUrl;
		this.html.videoElement.load();
		this.html.videoElement.onloadeddata = function() {
			a && a()
		}
	};
	this.stop = function() {
		R.removeClass(this.html.overlayDiv, "playing");
		R.removeClass(this.html.overlayDiv, "loading");
		this.html.videoImg.style.display = "";
		this.html.videoElement.onloadeddata = void 0;
		this.html.videoElement.removeEventListener("webkitendfullscreen", this.videoEnded);
		this.html.videoElement.parentNode && this.html.videoElement.parentNode.removeChild(this.html.videoElement);
		this.html.videoElement.pause();
		this.html.videoElement.currentTime = 0;
		this.playing = !1
	};
	this.play = function() {
		this.playing || (R.addClass(self.html.overlayDiv, "loading"), this.loadVideo(function() {
			R.removeClass(self.html.overlayDiv, "loading");
			R.addClass(self.html.overlayDiv, "playing");
			self.html.containerDiv.appendChild(self.html.videoElement);
			self.html.videoImg.style.display = "none";
			self.html.videoElement.play();
			self.playing = !0
		}))
	};
	this.toggle = function() {
		this.playing ? this.stop() : this.play()
	}
};
R.DeviceSlider = function() {
	var self = this;
	this.html = {};
	this.dragHelper = null;
	this.animating = !1;
	var d = 0,
		f = 0,
		g = 0,
		c = !1;
	this.init = function(a) {
		this.html.containerDiv = a;
		this.html.deviceDivs = a.querySelectorAll(".device");
		this.html.deviceGroupDiv = a.querySelector(".device-group");
		this.html.deviceGroupContentDiv = a.querySelector(".device-group-content");
		this.html.paginationBarDiv = a.querySelector(".pagination-bar");
		this.html.paginationBarOuterDiv = a.querySelector(".pagination-bar-outer");
		this.html.paginationBarInnerDiv =
			a.querySelector(".pagination-bar-inner");
		this.html.paginationBarContentDiv = a.querySelector(".pagination-bar-content");
		this.html.paginationBarHandleDiv = a.querySelector(".pagination-bar-handle");
		var c = this.html.deviceDivs[0].offsetWidth;
		this.dragHelper = (new DragHelper).init();
		this.dragHelper.getDimensionX = function() {
			return c
		};
		return this
	};
	this.activate = function() {
		(c = this.html.containerDiv.offsetWidth < this.html.deviceGroupContentDiv.offsetWidth) && this.enableSlideshow();
		this.addListeners()
	};
	this.deactivate =
		function() {
			this.removeListeners()
		};
	this.enableSlideshow = function() {
		this.html.paginationBarDiv.style.display = "block";
		this.calculateBounds();
		R.addClass(this.html.containerDiv, "device-slideshow-enabled");
		var a = R.normalize(0, -this.rightBoundP, this.leftBoundP, 1, 0);
		g = Math.round(a * (this.html.deviceDivs.length - 1));
		this.updateElements()
	};
	this.disableSlideshow = function() {
		R.removeClass(this.html.containerDiv, "device-slideshow-enabled");
		R.setTransform(this.html.deviceGroupDiv, "");
		this.html.paginationBarDiv.style.display =
			"none"
	};
	this.onDrag = function(c, g, l, n, p, r) {
		c = f + c / self.html.deviceGroupDiv.offsetWidth;
		g = R.normalize(c, -self.rightBoundP, self.leftBoundP, 1 - self.handleWidthP, 0);
		R.setTransform(self.html.deviceGroupDiv, "translate3d(" + 100 * c + "%,0,0)");
		R.setTransform(self.html.paginationBarContentDiv, "translate3d(" + 100 * g + "%,0,0)");
		d = c;
		return !1
	};
	this.onDragComplete = function(c, k) {
		if (c != DragHelper.OUTCOME_CLICK) {
			var l = R.normalize(d, -this.rightBoundP, this.leftBoundP, 1, 0),
				l = Math.ceil(l * (this.html.deviceDivs.length - 1));
			switch (c) {
				case DragHelper.OUTCOME_BACK:
					l -=
						1
			}
			g = l = Math.max(Math.min(l, this.html.deviceDivs.length - 1), 0);
			var n = g / (this.html.deviceDivs.length - 1),
				l = R.normalize(n, 1, 0, -this.rightBoundP, this.leftBoundP),
				n = R.normalize(n, 1, 0, 1 - this.handleWidthP, 0);
			d != l && (R.setTransition(this.html.deviceGroupDiv, "transform .2s ease-out"), R.setTransform(this.html.deviceGroupDiv, "translate3d(" + 100 * l + "%,0,0)"), R.setTransition(this.html.paginationBarContentDiv, "transform .2s ease-out"), R.setTransform(this.html.paginationBarContentDiv, "translate3d(" + 100 * n + "%,0,0)"), this.animating = !0, R.onTransitionEnd(this.html.paginationBarContentDiv, function() {
				R.setTransition(self.html.deviceGroupDiv, "");
				R.setTransition(self.html.paginationBarContentDiv, "");
				self.animating = !1
			}));
			f = l
		}
	};
	this.addListeners = function() {
		this.html.containerDiv[R.touch ? "ontouchstart" : "onmousedown"] = function(d) {
			if (!c) return !0;
			d.stopPropagation();
			self.dragHelper.start(d);
			self.dragHelper.onDrag = void 0;
			self.dragHelper.onComplete = void 0;
			self.dragHelper.onIntentClear = self.dragIntentClear
		};
		GlobalEvents.addListener(GlobalEvent.WINDOW_RESIZE, this.onResize.bind(this))
	};
	this.removeListeners = function() {
		this.html.containerDiv[R.touch ? "ontouchstart" : "onmousedown"] = void 0;
		GlobalEvents.removeListener(GlobalEvent.WINDOW_RESIZE, this.onResize.bind(this))
	};
	this.dragIntentClear = function(c) {
		self.animating || (c == DragHelper.DRAG_DIRECTION_X ? (R.setTransition(self.html.deviceGroupDiv, ""), R.setTransition(self.html.paginationBarContentDiv, ""), self.dragHelper.onDrag = self.onDrag.bind(self), self.dragHelper.onComplete = self.onDragComplete.bind(self), self.dragHelper.onIntentClear = void 0) : (self.dragHelper.onDrag = void 0,
			self.dragHelper.onComplete = void 0, self.dragHelper.onIntentClear = void 0, self.dragHelper.stop()))
	};
	this.onResize = function() {
		!c && this.html.containerDiv.offsetWidth < this.html.deviceGroupContentDiv.offsetWidth ? (this.enableSlideshow(), c = !0) : c && this.html.containerDiv.offsetWidth > this.html.deviceGroupContentDiv.offsetWidth ? (this.disableSlideshow(), c = !1) : c && (this.calculateBounds(), this.updateElements())
	};
	this.calculateBounds = function() {
		var a = (this.html.deviceGroupContentDiv.offsetWidth - this.html.containerDiv.offsetWidth) /
				2,
			c = this.html.deviceDivs[0];
		this.leftBound = a - c.offsetLeft + this.html.containerDiv.offsetWidth / 2 - c.offsetWidth / 2;
		this.leftBoundP = this.leftBound / this.html.deviceGroupDiv.offsetWidth;
		c = this.html.deviceDivs[this.html.deviceDivs.length - 1];
		this.rightBound = a - (this.html.deviceGroupContentDiv.offsetWidth - (c.offsetLeft + c.offsetWidth)) + this.html.containerDiv.offsetWidth / 2 - c.offsetWidth / 2;
		this.rightBoundP = this.rightBound / this.html.deviceGroupDiv.offsetWidth;
		this.handleWidthP = this.html.paginationBarHandleDiv.offsetWidth /
			this.html.paginationBarContentDiv.offsetWidth
	};
	this.updateElements = function() {
		var c = g / (this.html.deviceDivs.length - 1),
			d = R.normalize(c, 1, 0, -this.rightBoundP, this.leftBoundP),
			c = R.normalize(c, 1, 0, 1 - this.handleWidthP, 0);
		R.setTransition(self.html.deviceGroupDiv, "");
		R.setTransform(self.html.deviceGroupDiv, "translate3d(" + 100 * d + "%,0,0)");
		R.setTransition(self.html.paginationBarContentDiv, "");
		R.setTransform(self.html.paginationBarContentDiv, "translate3d(" + 100 * c + "%,0,0)");
		f = d
	}
};
R.SimpleSlider = function() {
	var self = this;
	this.html = {};
	this.dragHelper = null;
	this.animating = !1;
	var d = 0,
		f = 0;
	this.init = function(a) {
		this.html.containerDiv = a;
		this.html.containerDiv.simpleSlider = this;
		this.html.stampImagesDiv = a.querySelector(".stamp-images");
		this.html.stampImagesOverflowDiv = a.querySelector(".stamp-images-overflow");
		this.html.paginationBarDiv = a.querySelector(".pagination-bar");
		this.html.paginationBarOuterDiv = a.querySelector(".pagination-bar-outer");
		this.html.paginationBarInnerDiv = a.querySelector(".pagination-bar-inner");
		this.html.paginationBarContentDiv = a.querySelector(".pagination-bar-content");
		this.html.paginationBarHandleDiv = a.querySelector(".pagination-bar-handle");
		this.handleWidthP = this.html.paginationBarHandleDiv.offsetWidth / this.html.paginationBarContentDiv.offsetWidth;
		this.dragHelper = (new DragHelper).init();
		this.dragHelper.getDimensionX = function() {
			return 600
		};
		a = this.html.stampImagesDiv.offsetWidth;
		var c = this.html.stampImagesOverflowDiv.offsetWidth;
		this.leftBoundP = 0;
		this.rightBoundP = (c - a) / c;
		return this
	};
	this.activate =
		function() {
			this.addListeners()
		};
	this.deactivate = function() {
		this.removeListeners()
	};
	this.updateScrollIndicator = function() {
		var d = this.html.stampImagesOverflowDiv.offsetWidth,
			d = R.normalize(this.html.stampImagesDiv.scrollLeft / d, 0, (d - this.html.stampImagesDiv.offsetWidth) / d, 0, 1 - self.handleWidthP);
		R.setTransform(this.html.paginationBarContentDiv, "translate3d(" + 100 * d + "%,0,0)")
	};
	this.addListeners = function() {
		R.touch && (this.html.stampImagesDiv.onscroll = function() {
			self.updateScrollIndicator()
		});
		this.html.containerDiv[R.touch ?
			"ontouchstart" : "onmousedown"] = function(d) {
			d.stopPropagation();
			R.touch || self.animating || (self.dragHelper.start(d), self.dragHelper.onDrag = self.onDrag, self.dragHelper.onComplete = self.onDragComplete)
		}
	};
	this.removeListeners = function() {
		R.touch && (this.html.stampImagesDiv.onscroll = void 0);
		this.html.containerDiv[R.touch ? "ontouchstart" : "onmousedown"] = void 0
	};
	this.onDrag = function(g, c, h, k, l, n) {
		g = f + g / self.html.stampImagesOverflowDiv.offsetWidth;
		c = R.normalize(g, self.leftBoundP, self.rightBoundP, 0, 1 - self.handleWidthP);
		R.setTransform(self.html.stampImagesOverflowDiv,
			"translate3d(" + 100 * g + "%,0,0)");
		R.setTransform(self.html.paginationBarContentDiv, "translate3d(" + 100 * -c + "%,0,0)");
		d = g;
		return !1
	};
	this.onDragComplete = function(g, c) {
		if (g != DragHelper.OUTCOME_CLICK) {
			var h = !1;
			d > self.leftBoundP ? (d = self.leftBoundP, h = !0) : d < -self.rightBoundP && (d = -self.rightBoundP, h = !0);
			h && (R.setTransition(self.html.stampImagesOverflowDiv, "transform .2s ease-out"), R.setTransform(self.html.stampImagesOverflowDiv, "translate3d(" + 100 * d + "%,0,0)"), h = R.normalize(d, self.leftBoundP, self.rightBoundP, 0, 1 - self.handleWidthP), R.setTransition(self.html.paginationBarContentDiv,
				"transform .2s ease-out"), R.setTransform(self.html.paginationBarContentDiv, "translate3d(" + 100 * -h + "%,0,0)"), self.animating = !0, R.onTransitionEnd(self.html.paginationBarContentDiv, function() {
				R.setTransition(self.html.stampImagesOverflowDiv, "");
				R.setTransition(self.html.paginationBarContentDiv, "");
				self.animating = !1
			}));
			f = d
		}
	}
};
R.Fonts = function() {
	GlobalEvent.FONTS_READY = "global_event_fonts_ready";
	this.init = function() {
		window.WebFontConfig = {
			fontdeck: {
				id: "46186"
			},
			typekit: {
				id: "djg5lpq"
			},
			timeout: 5E3,
			loading: function() {
				GlobalEvents.dispatch(new GlobalEvent(GlobalEvent.FONTS_READY))
			}
		};
		(function() {
			var a = document.createElement("script");
			a.src = ("https:" == document.location.protocol ? "https" : "http") + "://ajax.googleapis.com/ajax/libs/webfont/1.5.6/webfont.js";
			a.type = "text/javascript";
			a.async = "true";
			var d = document.getElementsByTagName("script")[0];
			d.parentNode.insertBefore(a, d)
		})();
		return this
	}
};