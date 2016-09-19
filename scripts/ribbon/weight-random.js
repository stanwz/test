define(function(){

	var WeightOption = {
		STRONGER: 1,
		NEUTRAL: 0,
		WEAKER: -1
	};

	function WeightedRandom(power, rightModifier, leftModifier) {
		var self = this;

		self._construct = function(power, rightModifier, leftModifier) {
			if(power) {
				self.power = power;
			}
			if (rightModifier) {
				self.leftModifier = rightModifier;
			}
			if (leftModifier) {
				self.rightModifier = leftModifier;
			}
		};

		self.power = 1;
		self.rightModifier = this.leftModifier = WeightOption.NEUTRAL;
		self.random = function() {
			var random = Math.random();
			return self.weightedValue(random)
		};
		self.weightedValue = function(random) {

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

		self._construct(power, rightModifier, leftModifier);
	}

	return WeightedRandom;
});