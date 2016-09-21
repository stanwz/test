define([
	'ribbon/ribbon-segment',
	'settings'
],function(RibbonSegment, settings){

	var SearchDirection = {
		LEFT: 0,
		RIGHT: 1
	};

	function Ribbon() {

		var self = this;
		self.drivePoint = 0.5;
		self.idleSpeed = 0.2;
		self.speed = self.idleSpeed;

		var lastSegment;
		var segmentPulled;
		var segments = {back: [], front: []};
		var totalSegmentLengthAtLastPull;
		var totalSegmentLength;

		function getSegmentFromPullPoint(pullPoint) {
			for (var segment = lastSegment; segment;) {
				if (segment.endPoint.x / settings.dimensions.width > pullPoint || !segment.nextSegment) {
					return segment;
				}
				segment = segment.nextSegment;
			}
		}

		function advanceSegment(segment, anchorPoint) {
			// segment.setColor();
			segment.advance();
			segment.applyForces(anchorPoint);
		}

		self._construct = function() {
			self.createSegments();
			requestAnimationFrame(self.advance);
		};

		self.advance = function() {
			self.move(self.speed);
			var segmentBeingPulled = getSegmentFromPullPoint(self.drivePoint);
			advanceSegment(segmentBeingPulled, settings.anchorPoints.CENTER);
			for (var segment = segmentBeingPulled.previousSegment; segment;) {
				advanceSegment(segment, settings.anchorPoints.END);
				segment = segment.previousSegment;
			}
			for (segment = segmentBeingPulled.nextSegment; segment;) {
				advanceSegment(segment, settings.anchorPoints.START);
				segment = segment.nextSegment;
			}

			for (segment = lastSegment; segment;) {
				segment.resetPolygon();
				segment = segment.previousSegment;
			}
			self.draw();
			// requestAnimationFrame(self.advance);
		};

		self.clearPullPoint = function() {
			segmentPulled = null;
		};

		self.createSegments = function () {
			segments.back.length = 0;
			segments.front.length = 0;
			for (lastSegment = new RibbonSegment(); lastSegment.endPoint.x < settings.dimensions.width + 600;) {
				segments[lastSegment.backface? 'back' : 'front'].push(lastSegment);
				lastSegment = new RibbonSegment(lastSegment);
			}

			segments.back.forEach(function (segment) {
				settings.stage.addChild(segment.graphic);
			});

			segments.front.forEach(function (segment) {
				settings.stage.addChild(segment.graphic);
			});
		};

		self.draw = function () {
			segments.back.forEach(function (segment) {
				segment.draw();
			});

			segments.front.forEach(function (segment) {
				segment.draw();
			});
		};

		self.move = function(amount) {
			for (var segment = lastSegment; segment;) {
				segment.move(amount);
				segment = segment.previousSegment;
			}
			// if (self.canDestruct) {
			// 	self.destroySegments();
			// }
			// self.createSegments()
		};

		self.setPullPoint = function(pullPoint) {
			segmentPulled = getSegmentFromPullPoint(pullPoint);
			totalSegmentLengthAtLastPull = totalSegmentLength;
		};

		self.straighten = function() {
			// self.straightenStrength = Math.max(Math.min(self.straightenStrength, 1), 0);
			// self.width = self.collapsedRibbonWidth + (self.fullRibbonWidth - self.collapsedRibbonWidth) * (1 - self.straightenStrength);

			var segment = segmentPulled ? segmentPulled : getSegmentFromPullPoint(0.5);
			segment.width = self.width;
			segment.straightenStrength = Math.min(self.straightenStrength + self.pullStrength, 1);
			segment.applyForces(settings.anchorPoints.CENTER);
			for (var seg = segment.nextSegment, pullStrengthScale; segment;) {
				seg.width = self.width;
				pullStrengthScale = 1;
				if (self.pullSpread > 0) {
					// the further away from the pull, the weak the pull strength
					var distanceLvl = seg.distanceFromSegment(segment, SearchDirection.LEFT) / totalSegmentLengthAtLastPull;
					var doublePullSpread = 2 * self.pullSpread,
						quadrupleSpread = 2 * doublePullSpread;

					if(distanceLvl < doublePullSpread) {
						pullStrengthScale = 1
					} else if (distanceLvl > quadrupleSpread) {
						pullStrengthScale = 0;
					} else {
						pullStrengthScale = 1 - (distanceLvl - doublePullSpread) / doublePullSpread;
					}
				}
				var pullStrength = pullStrengthScale * self.pullStrength;
				seg.straightenStrength = Math.min(self.straightenStrength + pullStrength, 1);
				seg.applyForces(settings.anchorPoints.START);
				seg = seg.nextSegment
			}
			for (seg = segment.previousSegment; seg;) {
				seg.width = self.width;
				distanceLvl = 1;
				if (self.pullSpread > 0) {
					distanceLvl = seg.distanceFromSegment(segment, SearchDirection.RIGHT) / totalSegmentLengthAtLastPull;
					doublePullSpread = 2 * self.pullSpread;
					quadrupleSpread = 2 * doublePullSpread;

					if(distanceLvl < doublePullSpread) {
						pullStrengthScale = 1;
					} else if (distanceLvl > quadrupleSpread) {
						pullStrengthScale = 0;
					} else {
						pullStrengthScale = 1 - (distanceLvl - doublePullSpread) / (quadrupleSpread - doublePullSpread);
					}

				}

				pullStrength = pullStrengthScale * self.pullStrength;
				seg.straightenStrength = Math.min(self.straightenStrength + pullStrength, 1);
				seg.applyForces(settings.anchorPoints.END);
				seg = seg.previousSegment
			}
		};

		self._construct();
	}

	return Ribbon;

});