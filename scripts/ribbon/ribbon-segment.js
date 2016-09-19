define([
	'pixi',
	'settings',
	'ribbon/weight-random',
	'ribbon/simplex-stepper'
],function(PIXI, settings, WeightedRandom, SimplexStepper){

	var DegToRad = Math.PI / 180;

	var Directions = {
		ANY: 0,
		UP: 1,
		DOWN: 2
	};

	var SegmentMinLength = 200;
	var SegmentMaxLength = 450;
	var oneSidedWeightedRandom = new WeightedRandom(1.5, 0, 1);
	var twoSidedWeightedRandom = new WeightedRandom(1.5, 1, 1);

	function getRandomAngle(minDegree, maxDegree, direction) {
		if (direction == Directions.UP) {
			return -Math.abs(oneSidedWeightedRandom.random() * minDegree);
		} else if (direction == Directions.DOWN) {
			return Math.abs(oneSidedWeightedRandom.random() * maxDegree);
		} else {
			return minDegree + twoSidedWeightedRandom.random() * (maxDegree - minDegree);
		}
	}

	function RibbonSegment(segment) {

		var baseAngleUnit = 20;
		var self = this;

		self.originalStartPoint = {};
		self.originalEndPoint = {};
		self.startPoint = {};
		self.endPoint = {};
		self.backface = null;
		self.polygon = null;
		self.simplexStepper = new SimplexStepper(0.6);
		self.straightenStrength = 0;

		self._construct = function(segment) {

			self.polygon = new PIXI.Graphics();

			settings.stage.addChild(self.polygon);

			if (segment) {
				self.previousSegment = segment;
				segment.nextSegment = self;
				self.originalStartPoint.x = self.startPoint.x = segment.originalEndPoint.x;
				self.originalStartPoint.y = self.startPoint.y = segment.originalEndPoint.y;
				self.backface = !segment.backface;
				if(self.backface) {
					baseAngleUnit /= 2;
				}
			} else {
				self.originalStartPoint.x = self.startPoint.x = 0;
				self.originalStartPoint.y = self.startPoint.y = settings.dimensions.height / 2;
			}

			var direction = Directions.ANY;

			if (self.originalStartPoint.y >= settings.dimensions.height / 2 + 100){
				direction = Directions.UP;
			}
			if (self.originalStartPoint.y <=  settings.dimensions.height / 2 -100) {
				direction = Directions.DOWN;
			}

			if (self.previousSegment) {

				if (self.previousSegment.primaryAngle > -30 && self.previousSegment.primaryAngle < 30) {
					self.primaryAngle = getRandomAngle(-130, 130, direction);
				} else if (self.previousSegment.primaryAngle > -90 && self.previousSegment.primaryAngle < 90) {
					self.primaryAngle = getRandomAngle(-60, 60, direction);
				} else if (self.previousSegment.primaryAngle <= -90) {
					self.primaryAngle = getRandomAngle(self.previousSegment.primaryAngle + 45, self.previousSegment.primaryAngle + 135, direction);
				} else {
					self.primaryAngle = getRandomAngle(self.previousSegment.primaryAngle - 135, self.previousSegment.primaryAngle - 45, direction);
				}

				var angleDiff = self.primaryAngle - self.previousSegment.primaryAngle;

				if (angleDiff > -55 && angleDiff < 55) {
					if(0 < angleDiff) {
						self.primaryAngle = self.previousSegment.primaryAngle + 55.55;
					} else {
						self.primaryAngle = self.previousSegment.primaryAngle - 55.55;
					}
				}

			} else {
				self.primaryAngle = getRandomAngle(-130, 130, direction);
			}

			var allowedRatio = Math.random();

			if (self.previousSegment && Math.abs(self.previousSegment.primaryAngle) > 90 && Math.abs(self.primaryAngle) < 90 ||
				self.nextSegment && Math.abs(self.nextSegment.primaryAngle) > 90 && Math.abs(self.primaryAngle) < 90) {
				allowedRatio = 0.6 + 0.4 * allowedRatio;
			} else if (self.primaryAngle > -90 && self.primaryAngle < 90) {
				allowedRatio = 0.3 + 0.7 * allowedRatio;
			} else {
				allowedRatio = 0.3 * allowedRatio;
			}

			self.segmentLength = SegmentMinLength + allowedRatio * (SegmentMaxLength - SegmentMinLength);

			self.originalEndPoint.x = self.endPoint.x = self.startPoint.x + self.segmentLength * Math.cos(self.primaryAngle * DegToRad);
			self.originalEndPoint.y = self.endPoint.y = self.startPoint.y + self.segmentLength * Math.sin(self.primaryAngle * DegToRad);
		};

		this.advance = function() {
			self.simplexStepper.advance();
		};

		self.applyForces = function(anchorPoint) {
			var currentAngle = self.getCurrentAngle(),
				xRatio = Math.cos(currentAngle * DegToRad),
				yRatio = Math.sin(currentAngle * DegToRad);

			if (anchorPoint == settings.anchorPoints.CENTER) {
				var anchorPointX = (self.startPoint.x + self.endPoint.x) / 2;
				var anchorPointY = (self.startPoint.y + self.endPoint.y) / 2;
				self.endPoint.x = anchorPointX + self.segmentLength / 2 * xRatio;
				self.endPoint.y = anchorPointY + self.segmentLength / 2 * yRatio;
				self.startPoint.x = anchorPointX - self.segmentLength / 2 * xRatio;
				self.startPoint.y = anchorPointY - self.segmentLength / 2 * yRatio
			} else if (anchorPoint == settings.anchorPoints.START) {
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

		self.draw = function() {
			var polygon = self.polygon;

			polygon.clear();
			polygon.lineStyle(1, 0xf3a33f);
			polygon.moveTo(self.startPoint.x, self.startPoint.y);
			polygon.lineTo(self.endPoint.x, self.endPoint.y);
			polygon.endFill();

			settings.renderer.render(settings.stage);
		};

		self.getCurrentAngle = function() {
			var movedAngle = baseAngleUnit * self.simplexStepper.getValue() - (baseAngleUnit / 2);
			return (self.primaryAngle + movedAngle) * (1 - self.straightenStrength);
		};

		self._construct(segment);
	}

	return RibbonSegment;
});