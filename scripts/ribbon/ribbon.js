define([
	'ribbon/ribbon-segment',
	'settings'
],function(RibbonSegment, settings){

	function Ribbon() {

		var self = this;
		self.drivePoint = 0.5;

		var currentSegment;

		function getSegmentFromPullPoint(pullPoint) {
			for (var segment = currentSegment; segment;) {
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
			self.draw();

			requestAnimationFrame(self.advance);
		};

		self.advance = function() {
			// self.move(self.speed);
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
			// for (segment = currentSegment; segment;) {
			// 	segment.resetPolygon();
			// 	segment = segment.nextSegment;
			// }
			self.draw();
			requestAnimationFrame(self.advance);
		};

		self.createSegments = function () {

			for (currentSegment = new RibbonSegment(); currentSegment.endPoint.x < settings.dimensions.width;) {
				currentSegment = new RibbonSegment(currentSegment);
			}
		};

		self.draw = function () {
			for (var segment = currentSegment; segment; segment = segment.nextSegment) {
				segment.draw();
			}

			for (segment = currentSegment.previousSegment; segment; segment = segment.previousSegment) {
				segment.draw();
			}
		};

		self._construct();
	}

	return Ribbon;

});