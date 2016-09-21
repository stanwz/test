define(function(){
	var Ease = {
		linear: function(elapsedTime, start, progress, duration) {
			return progress * elapsedTime / duration + start
		},
		easeOut: {
			quad: function(elapsedTime, start, progress, duration) {
				return -progress * (elapsedTime /= duration) * (elapsedTime - 2) + start
			},
			cubic: function(elapsedTime, start, progress, duration) {
				return progress * (Math.pow(elapsedTime / duration - 1, 3) + 1) + start
			},
			quart: function(elapsedTime, start, progress, duration) {
				return -progress * (Math.pow(elapsedTime / duration - 1, 4) - 1) + start
			},
			quint: function(elapsedTime, start, progress, duration) {
				return progress * (Math.pow(elapsedTime / duration - 1, 5) + 1) + start
			},
			sine: function(elapsedTime, start, progress, duration) {
				return progress * Math.sin(elapsedTime / duration * (Math.PI / 2)) + start
			},
			expo: function(elapsedTime, start, progress, duration) {
				return progress * (-Math.pow(2, -10 * elapsedTime / duration) + 1) + start
			},
			circ: function(elapsedTime, start, progress, duration) {
				return progress * Math.sqrt(1 - (elapsedTime = elapsedTime / duration - 1) * elapsedTime) + start
			},
			bounce: function(elapsedTime, start, progress, duration) {
				return (elapsedTime /= duration) < 1 / 2.75 ?
				7.5625 * progress * elapsedTime * elapsedTime + start : elapsedTime < 2 / 2.75 ? progress * (7.5625 * (elapsedTime -= 1.5 / 2.75) * elapsedTime + 0.75) + start : elapsedTime < 2.5 / 2.75 ? progress * (7.5625 * (elapsedTime -= 2.25 / 2.75) * elapsedTime + 0.9375) + start : progress * (7.5625 * (elapsedTime -= 2.625 / 2.75) * elapsedTime + 0.984375) + start
			},
			back: function(elapsedTime, start, progress, duration, c) {
				void 0 == c && (c = 1.70158);
				return progress * ((elapsedTime = elapsedTime / duration - 1) * elapsedTime * ((c + 1) * elapsedTime + c) + 1) + start
			}
		},
		easeIn: {
			quad: function(elapsedTime, start, progress, duration) {
				return progress * (elapsedTime /= duration) * elapsedTime + start
			},
			cubic: function(elapsedTime, start, progress, duration) {
				return progress * Math.pow(elapsedTime / duration, 3) + start
			},
			quart: function(elapsedTime, start, progress, duration) {
				return progress * Math.pow(elapsedTime / duration, 4) + start
			},
			quint: function(elapsedTime, start, progress, duration) {
				return progress * Math.pow(elapsedTime / duration, 5) + start
			},
			sine: function(elapsedTime, start, progress, duration) {
				return progress * (1 - Math.cos(elapsedTime / duration * (Math.PI /
						2))) + start
			},
			expo: function(elapsedTime, start, progress, duration) {
				return progress * Math.pow(2, 10 * (elapsedTime / duration - 1)) + start
			},
			circ: function(elapsedTime, start, progress, duration) {
				return progress * (1 - Math.sqrt(1 - (elapsedTime /= duration) * elapsedTime)) + start
			},
			bounce: function(elapsedTime, start, progress, duration) {
				return progress - Ease.easeOut.bounce(duration - elapsedTime, 0, progress, duration) + start
			},
			back: function(elapsedTime, start, progress, duration, c) {
				void 0 == c && (c = 1.70158);
				return progress * (elapsedTime /= duration) * elapsedTime * ((c + 1) * elapsedTime - c) + start
			}
		},
		easeInOut: {
			quad: function(elapsedTime, start, progress, duration) {
				return 1 > (elapsedTime /= duration / 2) ? progress / 2 * elapsedTime * elapsedTime + start : -progress / 2 * (--elapsedTime * (elapsedTime - 2) - 1) + start
			},
			cubic: function(elapsedTime, start, progress, duration) {
				return 1 > (elapsedTime /= duration / 2) ? progress / 2 * Math.pow(elapsedTime, 3) + start : progress / 2 * (Math.pow(elapsedTime - 2, 3) + 2) + start
			},
			quart: function(elapsedTime, start, progress, duration) {
				return 1 > (elapsedTime /= duration / 2) ? progress / 2 * Math.pow(elapsedTime,
					4) + start : -progress / 2 * (Math.pow(elapsedTime - 2, 4) - 2) + start
			},
			quint: function(elapsedTime, start, progress, duration) {
				return 1 > (elapsedTime /= duration / 2) ? progress / 2 * Math.pow(elapsedTime, 5) + start : progress / 2 * (Math.pow(elapsedTime - 2, 5) + 2) + start
			},
			sine: function(elapsedTime, start, progress, duration) {
				return progress / 2 * (1 - Math.cos(Math.PI * elapsedTime / duration)) + start
			},
			expo: function(elapsedTime, start, progress, duration) {
				return 1 > (elapsedTime /= duration / 2) ? progress / 2 * Math.pow(2, 10 * (elapsedTime - 1)) + start : progress / 2 * (-Math.pow(2, -10 * --elapsedTime) + 2) + start
			},
			circ: function(elapsedTime, start, progress, duration) {
				return 1 > (elapsedTime /= duration / 2) ? progress / 2 * (1 - Math.sqrt(1 - elapsedTime * elapsedTime)) + start : progress / 2 * (Math.sqrt(1 - (elapsedTime -= 2) * elapsedTime) + 1) + start
			},
			bounce: function(elapsedTime, start, progress, duration) {
				return elapsedTime < duration / 2 ? 0.5 * Ease.easeIn.bounce(2 * elapsedTime, 0, progress, duration) + start : 0.5 * Ease.easeOut.bounce(2 * elapsedTime - duration, 0, progress, duration) + 0.5 * progress + start
			},
			back: function(elapsedTime, start, progress, duration, c) {
				void 0 == c && (c = 1.70158);
				return 1 > (elapsedTime /= duration / 2) ? progress / 2 * elapsedTime * elapsedTime * (((c *= 1.525) + 1) * elapsedTime - c) + start : progress / 2 * ((elapsedTime -= 2) * elapsedTime * (((c *= 1.525) + 1) * elapsedTime + c) + 2) + start
			}
		}
	};

	return Ease;
});