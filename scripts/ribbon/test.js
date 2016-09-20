(function(){
	var avgAngle;
	var radius;
	var leftward2 = 0;
	var rightward2 = 180;
	var self = {};

	var forward = 90;
	var backward = forward - 180;
	if(backward < - 180) {
		backward += 360;
	}
	var rightward = backward - 90;
	var leftward = backward + 90;
	var pointIndex = 0;

	if (self.previousSegment) {

		var prevForward = self.previousSegment.getCurrentAngle();
		var	angleDiff = forward - prevForward;
		var	absAngleDiff = Math.abs(angleDiff);
		avgAngle = (prevForward + forward) / 2;
		radius = self.width / 2 / Math.cos((backward + 90 - pointIndex) * DegToRad);

		if (45 < absAngleDiff){
			self.polygon.points[0].x = self.startPoint.x - radius * Math.cos(avgAngle * DegToRad);
			self.polygon.points[0].y = self.startPoint.y - radius * Math.sin(avgAngle * DegToRad);
			self.polygon.points[1].x = self.startPoint.x + radius * Math.cos(avgAngle * DegToRad);
			self.polygon.points[1].y = self.startPoint.y + radius * Math.sin(avgAngle * DegToRad);
			pointIndex = 2;
		}  else if (30 < absAngleDiff) {
			self.polygon.points[0].x = self.startPoint.x - radius * Math.cos(avgAngle * DegToRad);
			self.polygon.points[0].y = self.startPoint.y - radius * Math.sin(avgAngle * DegToRad);
			self.polygon.points[2].x = self.startPoint.x + radius * Math.cos(avgAngle * DegToRad);
			self.polygon.points[2].y = self.startPoint.y + radius * Math.sin(avgAngle * DegToRad);

			avgAngle = (forward + prevForward) / 2 + 90;
			180 < avgAngle && (avgAngle -= 360);

			var rate = 1 - (absAngleDiff - 30) / 15;
			radius = self.width / 2 / Math.cos((avgAngle - (backward + 90)) * DegToRad) * rate;

			if (0 < angleDiff) {
				self.polygon.points[1].x = self.startPoint.x + radius * Math.cos(avgAngle * DegToRad);
				self.polygon.points[1].y = self.startPoint.y + radius * Math.sin(avgAngle * DegToRad);
			} else {
				self.polygon.points[1].x = self.startPoint.x - radius * Math.cos(avgAngle * DegToRad);
				self.polygon.points[1].y = self.startPoint.y - radius * Math.sin(avgAngle * DegToRad);
			}
			pointIndex = 3;
		} else {
			avgAngle +=  90;
			if (avgAngle > 180) {
				avgAngle -= 360;
			}
			
			radius = self.width / 2 / Math.cos((avgAngle - (backward + 90)) * DegToRad);
			
			var adjustedStartingX = self.startPoint.x - 0.5 * Math.cos(forward * DegToRad);
			var adjustedStartingY = self.startPoint.y - 0.5 * Math.sin(forward * DegToRad);

			self.polygon.points[0].x = adjustedStartingX - radius * Math.cos(avgAngle * DegToRad);
			self.polygon.points[0].y = adjustedStartingY - radius * Math.sin(avgAngle * DegToRad);
			self.polygon.points[1].x = adjustedStartingX + radius * Math.cos(avgAngle * DegToRad);
			self.polygon.points[1].y = adjustedStartingY + radius * Math.sin(avgAngle * DegToRad);
			pointIndex = 2
		}
	} else {
		self.polygon.points[0].x = self.startPoint.x + self.width / 2 * Math.cos(rightward * DegToRad);
		self.polygon.points[0].y = self.startPoint.y + self.width / 2 * Math.sin(rightward * DegToRad);
		self.polygon.points[1].x = self.startPoint.x + self.width / 2 * Math.cos(leftward * DegToRad);
		self.polygon.points[1].y = self.startPoint.y + self.width / 2 * Math.sin(leftward * DegToRad);
		pointIndex = 2;
	}

	if (self.nextSegment) {
		var nextForward = self.nextSegment.getCurrentAngle();
		angleDiff = nextForward - forward;
		absAngleDiff = Math.abs(angleDiff);
		avgAngle = (forward + nextForward) / 2;
		var rightward2 = forward + 90;
		radius = self.width / 2 / Math.cos((rightward2 - avgAngle) * DegToRad);
		var radius2 = self.width / 2 / Math.cos((avgAngle - rightward2) * DegToRad);

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

			avgAngle += 90;
			180 < avgAngle && (avgAngle -= 360);

			radius2 *= 1 - (absAngleDiff - 30) / 15;

			if (0 < angleDiff) {
				self.polygon.points[pointIndex + 1].x = self.endPoint.x - radius2 * Math.cos(avgAngle * DegToRad);
				self.polygon.points[pointIndex + 1].y = self.endPoint.y - radius2 * Math.sin(avgAngle * DegToRad);
			} else {
				self.polygon.points[pointIndex + 1].x = self.endPoint.x + radius2 * Math.cos(avgAngle * DegToRad);
				self.polygon.points[pointIndex + 1].y = self.endPoint.y + radius2 * Math.sin(avgAngle * DegToRad);
			}

		} else {
			self.polygon.setVerticesLength(pointIndex + 2);
			avgAngle = (forward + nextForward) / 2 + 90;
			180 < avgAngle && (avgAngle -= 360);

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
})();