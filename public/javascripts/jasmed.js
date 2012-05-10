var mediator = (function() {

	var subscribe = function(channel, fn) {
		if (!mediator.channels[channel]) mediator.channels[channel] = [];
		mediator.channels[channel].push({ context: this, callback: fn });
		return this;
	};

	var publish = function(channel) {
		if (!mediator.channels[channel]) return false;
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
			var subscription = mediator.channels[channel][i];
			subscription.callback.apply(subscription.context, args);
		}
		return this; //so can chain method calls
	};

	return {
		channels: {},
		publish: publish,
		subscribe: subscribe,
		installTo: function(obj) {
			obj.subscribe = subscribe;
			obj.publish = publish;
		}
	};

})();

var jasmed = {
	// Create/Get module
	module: _.memoize(function(name) {
		var m = jasmed.module[name];
		var newModule = {};
		mediator.installTo(newModule);
		return m || newModule;
	})
};


// Single entry point into the application.
$(function() {

	jasmed.module("struct").initialize();
	jasmed.module("editor").initialize();
	// WHY .initialize() doesn't work for me?
	jasmed.module("utils").initialization();

});