define([
	'ribbon/global-events',
	'settings'
], function (GlobalEvents, settings) {
	var Tween = function (obj, duration, options) {
		this.ease = function (elapsedTime, start, distance, totalDuration) {
			return distance * elapsedTime / totalDuration + start;
		};
		this.onComplete = function () {
		};
		this.onUpdate = function () {
		};
		this.running = null;
		this.prefix = this.units = "";
		this.delay = 0;
		this.begin = {};
		var self = this;
		this.__construct__ = function () {
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
			this.playTimeout = setTimeout(function () {
				self.play();
			}, this.delay);
		};
		this.play = function () {
			if (!Tween.tweens[obj]) {
				Tween.tweens[obj] = [];
			}
			Tween.tweens[obj].push(this);
			this.endAt = (new Date).getTime() + this.time;
			GlobalEvents.addListener(settings.RENDER_FRAME, this.mechanism)
		};
		this.stop = function () {
			clearTimeout(self.playTimeout);
			GlobalEvents.removeListener(settings.RENDER_FRAME, self.mechanism);
			self.stopped = true;
		};
		this.mechanism = function () {
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
		this.advanceFrame = function (elapsedTime, totalDuration) {
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
	Tween.killTweensOf = function (tweenObj) {
		for (var prop in Tween.tweens) {
			var tween = Tween.tweens[prop];
			if (tween.obj == tweenObj) {
				tween.stop();
			}
		}
	};
	Tween.getId = function () {
		return ++Tween.id
	};

	return Tween;
});