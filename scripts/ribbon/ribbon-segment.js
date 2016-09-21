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

	var SegmentMinLength = 250;
	var SegmentMaxLength = 600;
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

	function rotateAngleClockwiseBy90(avgAngle) {
		avgAngle += 90;
		if (avgAngle > 180) {
			avgAngle -= 360;
		}
		return avgAngle;
	}

	function Point() {
		this.x = this.y = 0;
	}

	function Polygon() {
		var self = this,
			verticesLength = 4;
		// this.color = null;
		this._construct = function() {
			self.points = [new Point(), new Point(), new Point(), new Point()];
		};
		this.setVerticesLength = function(length) {
			for (; verticesLength < length;) {
				self.points.push(new Point());
				verticesLength++;
			}
			for (; verticesLength > length;) {
				self.points.pop();
				verticesLength--;
			}
		};
		this.getVerticesLength = function() {
			return verticesLength;
		};
		this._construct();
	}

	function RibbonSegment(segment) {

		var baseAngleUnit = 25;
		var self = this;

		self.originalStartPoint = {};
		self.originalEndPoint = {};
		self.startPoint = {};
		self.endPoint = {};
		self.backface = null;
		self.color = 0xE45B5B;
		self.graphic = null;
		self.polygon = new Polygon();
		self.simplexStepper = new SimplexStepper(Math.random());
		self.straightenStrength = 0.6;

		self.fullRibbonWidth = 100;
		self.collapsedRibbonWidth = 60;
		self.width = self.fullRibbonWidth;

		self._construct = function(segment) {

			self.graphic = new PIXI.Graphics();

			if (segment) {
				self.previousSegment = segment;
				segment.nextSegment = self;
				self.originalStartPoint.x = self.startPoint.x = segment.originalEndPoint.x;
				self.originalStartPoint.y = self.startPoint.y = segment.originalEndPoint.y;
				self.backface = !segment.backface;
				if(self.backface) {
					self.color = 0xB54646;
					baseAngleUnit /= 2;
				}
			} else {
				self.originalStartPoint.x = self.startPoint.x = -200;
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

		self.advance = function() {
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
			// var graphic = self.graphic;
			// graphic.clear();
			// graphic.lineStyle(1, 0xf3a33f);
			// graphic.moveTo(self.startPoint.x, self.startPoint.y);
			// graphic.lineTo(self.endPoint.x, self.endPoint.y);
			// graphic.endFill();
			// settings.renderer.render(settings.stage);

			var graphic = self.graphic;
			graphic.clear();
			graphic.beginFill(self.color);

			var points = self.polygon.points;
			graphic.moveTo(points[0].x, points[0].y);
			for (var length = self.polygon.getVerticesLength(), pointIndex = 1; pointIndex < length; pointIndex++) {
				graphic.lineTo(points[pointIndex].x,points[pointIndex].y);
			}
			graphic.lineTo(points[0].x, points[0].y);
			graphic.endFill();

			settings.renderer.render(settings.stage);
		};

		self.getCurrentAngle = function() {
			var movedAngle = baseAngleUnit * self.simplexStepper.getValue() - (baseAngleUnit / 2);
			return (self.primaryAngle + movedAngle) * (1 - self.straightenStrength);
		};

		self.move = function(amount) {
			self.startPoint.x -= amount;
			self.endPoint.x -= amount;
		};

		self.resetPolygon = function () {
			var forward = self.getCurrentAngle();
			var backward = forward - 180;
			if(backward < - 180) {
				backward += 360;
			}
			var rightward = backward - 90;
			var leftward = backward + 90;
			var pointIndex = 0;

			if (self.previousSegment) {
				var prevForward = self.previousSegment.getCurrentAngle();
				var angleDiff = forward - prevForward;
				var absAngleDiff = Math.abs(angleDiff);

				var avgAngle = (prevForward + forward) / 2;
				var radius = self.width / 2 / Math.cos((leftward - avgAngle) * DegToRad);

				if (absAngleDiff > 45) {

					self.polygon.points[0].x = self.startPoint.x - radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[0].y = self.startPoint.y - radius * Math.sin(avgAngle * DegToRad);
					self.polygon.points[1].x = self.startPoint.x + radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[1].y = self.startPoint.y + radius * Math.sin(avgAngle * DegToRad);
					pointIndex = 2;

				} else if (absAngleDiff > 30) {

					self.polygon.points[0].x = self.startPoint.x - radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[0].y = self.startPoint.y - radius * Math.sin(avgAngle * DegToRad);
					self.polygon.points[2].x = self.startPoint.x + radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[2].y = self.startPoint.y + radius * Math.sin(avgAngle * DegToRad);

					avgAngle = rotateAngleClockwiseBy90(avgAngle);
					var radius2 = self.width / 2 / Math.cos((avgAngle - leftward) * DegToRad);
					radius2 *=  1 - (absAngleDiff - 30) / 15;

					if(angleDiff > 0) {
						self.polygon.points[1].x = self.startPoint.x + radius2 * Math.cos(avgAngle * DegToRad);
						self.polygon.points[1].y = self.startPoint.y + radius2 * Math.sin(avgAngle * DegToRad);
					} else {
						self.polygon.points[1].x = self.startPoint.x - radius2 * Math.cos(avgAngle * DegToRad);
						self.polygon.points[1].y = self.startPoint.y - radius2 * Math.sin(avgAngle * DegToRad);
					}
					pointIndex = 3;

				} else {
					avgAngle = rotateAngleClockwiseBy90(avgAngle);
					radius2 = self.width / 2 / Math.cos((avgAngle - leftward) * DegToRad);

					var adjustedStartingX = self.startPoint.x - 0.5 * Math.cos(forward * DegToRad);
					var adjustedStartingY = self.startPoint.y - 0.5 * Math.sin(forward * DegToRad);

					self.polygon.points[0].x = adjustedStartingX - radius2 * Math.cos(avgAngle * DegToRad);
					self.polygon.points[0].y = adjustedStartingY - radius2 * Math.sin(avgAngle * DegToRad);
					self.polygon.points[1].x = adjustedStartingX + radius2 * Math.cos(avgAngle * DegToRad);
					self.polygon.points[1].y = adjustedStartingY + radius2 * Math.sin(avgAngle * DegToRad);
					pointIndex = 2;
				}
			} else {
				self.polygon.points[0].x = self.startPoint.x + self.width / 2 * Math.cos(rightward * DegToRad);
				self.polygon.points[0].y = self.startPoint.y + self.width / 2 * Math.sin(rightward * DegToRad);
				self.polygon.points[1].x = self.startPoint.x + self.width / 2 * Math.cos(leftward * DegToRad);
				self.polygon.points[1].y = self.startPoint.y + self.width / 2 * Math.sin(leftward * DegToRad);
				pointIndex = 2;
			}


			var leftward2 = forward - 90;
			var rightward2 = forward + 90;

			if (self.nextSegment) {
				var nextForward = self.nextSegment.getCurrentAngle();
				angleDiff = nextForward - forward;
				absAngleDiff = Math.abs(angleDiff);
				avgAngle = (forward + nextForward) / 2;
				radius = self.width / 2 / Math.cos((rightward2 - avgAngle) * DegToRad);

				if (45 < absAngleDiff) {
					self.polygon.setVerticesLength(pointIndex + 2);

					self.polygon.points[pointIndex].x = self.endPoint.x - radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[pointIndex].y = self.endPoint.y - radius * Math.sin(avgAngle * DegToRad);
					self.polygon.points[pointIndex + 1].x = self.endPoint.x + radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[pointIndex + 1].y = self.endPoint.y + radius * Math.sin(avgAngle * DegToRad);
				} else if (30 < absAngleDiff) {
					self.polygon.setVerticesLength(pointIndex + 3);

					self.polygon.points[pointIndex].x = self.endPoint.x - radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[pointIndex].y = self.endPoint.y - radius * Math.sin(avgAngle * DegToRad);
					self.polygon.points[pointIndex + 2].x = self.endPoint.x + radius * Math.cos(avgAngle * DegToRad);
					self.polygon.points[pointIndex + 2].y = self.endPoint.y + radius * Math.sin(avgAngle * DegToRad);

					avgAngle = rotateAngleClockwiseBy90(avgAngle);
					radius2 = self.width / 2 / Math.cos((avgAngle - rightward2) * DegToRad);
					radius2 *=  1 - (absAngleDiff - 30) / 15;

					if (0 < angleDiff) {
						self.polygon.points[pointIndex + 1].x = self.endPoint.x - radius2 * Math.cos(avgAngle * DegToRad);
						self.polygon.points[pointIndex + 1].y = self.endPoint.y - radius2 * Math.sin(avgAngle * DegToRad);
					} else {
						self.polygon.points[pointIndex + 1].x = self.endPoint.x + radius2 * Math.cos(avgAngle * DegToRad);
						self.polygon.points[pointIndex + 1].y = self.endPoint.y + radius2 * Math.sin(avgAngle * DegToRad);
					}

				} else {
					self.polygon.setVerticesLength(pointIndex + 2);

					avgAngle = rotateAngleClockwiseBy90(avgAngle);
					radius2 = self.width / 2 / Math.cos((avgAngle - rightward2) * DegToRad);

					adjustedStartingX = self.endPoint.x + 0.5 * Math.cos(forward * DegToRad);
					adjustedStartingY = self.endPoint.y + 0.5 * Math.sin(forward * DegToRad);

					self.polygon.points[pointIndex].x = adjustedStartingX - radius2 * Math.cos(avgAngle * DegToRad);
					self.polygon.points[pointIndex].y = adjustedStartingY - radius2 * Math.sin(avgAngle * DegToRad);
					self.polygon.points[pointIndex + 1].x = adjustedStartingX + radius2 * Math.cos(avgAngle * DegToRad);
					self.polygon.points[pointIndex + 1].y = adjustedStartingY + radius2 * Math.sin(avgAngle * DegToRad);
				}
			} else {
				self.polygon.setVerticesLength(pointIndex + 2);
				self.polygon.points[pointIndex].x = self.endPoint.x + self.width / 2 * Math.cos(leftward2 * DegToRad);
				self.polygon.points[pointIndex].y = self.endPoint.y + self.width / 2 * Math.sin(leftward2 * DegToRad);
				self.polygon.points[pointIndex + 1].x = self.endPoint.x + self.width / 2 * Math.cos(rightward2 * DegToRad);
				self.polygon.points[pointIndex + 1].y = self.endPoint.y + self.width / 2 * Math.sin(rightward2 * DegToRad);
			}
		};

		self._construct(segment);
	}

	return RibbonSegment;
});