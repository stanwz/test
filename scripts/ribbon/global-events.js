define(function(){
	var GlobalEvents = {
		registry: {},
		dispatch: function(event) {
			this.register(event.name);
			for (var eventListeners = this.registry[event.name], i = 0; i < eventListeners.length; i++) {
				eventListeners[i](event);
			}
		},
		addListener: function(eventName, listener) {
			this.register(eventName);
			this.registry[eventName].push(listener);
		},
		removeListener: function(eventName, listener) {
			var listeners = this.registry[eventName];
			if (!listeners) return false;
			for (var j = listeners.length, i = j - 1; i >= 0; i--) {
				if (listener == listeners[i]) {
					listeners.splice(i, 1);
				}
			}
		},
		register: function(eventName) {
			if (!this.registry[eventName]) {
				this.registry[eventName] = [];
			}
		},
		destroy: function(eventName) {
			this.registry[eventName] = false;
		}
	};

	return GlobalEvents;
});