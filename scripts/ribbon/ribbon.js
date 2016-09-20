define([
	'ribbon/ribbon-segment',
	'settings'
],function(RibbonSegment, settings){

	function Ribbon() {

		var self = this;
		self.drivePoint = 0.5;
		self.idleSpeed = 0.2;
		self.speed = self.idleSpeed;

		var lastSegment;

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
			requestAnimationFrame(self.advance);
		};

		self.createSegments = function () {

			for (lastSegment = new RibbonSegment(); lastSegment.endPoint.x < settings.dimensions.width + 600;) {
				lastSegment = new RibbonSegment(lastSegment);
			}
		};

		self.draw = function () {
			for (var segment = lastSegment; segment; segment = segment.nextSegment) {
				segment.draw();
			}

			for (segment = lastSegment.previousSegment; segment; segment = segment.previousSegment) {
				segment.draw();
			}
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

		self._construct();
	}

	return Ribbon;

});