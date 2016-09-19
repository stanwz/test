define(
	['perlin'], function (Perlin) {

	function SimplexStepper(step) {

		var self = this;
		var count = 0;
		var totalSteps = 0;
		var simpleStep = 1;
		var value;
		var flag = false;

		self._construct = function(step) {
			if (step) {
				simpleStep = step;
			}
		};
		self.advance = function() {
			count++;
			totalSteps += 0.5 * simpleStep * (Perlin.simplex2(0, count / 100) + 1);
			flag = false;
		};
		self.getValue = function() {
			if (!flag) {
				value = 0.5 * (Perlin.simplex2(1, totalSteps / 500) + 1);
				flag = true
			}
			return value;
		};

		self._construct(step);
	}

	return SimplexStepper;
});