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
	var storePath = window.location.pathname.split('store/')[1];
	console.log('storePath', storePath);
	//Modules
	jasmed.module('editorModels').initialize(storePath);
	jasmed.module('struct').initialize(storePath);
	//envoi ici un message au lieu de initialize... pour init les deux...
	
	//Views
	jasmed.module('toolsView').initialize();
	jasmed.module('playerView').initialize();
	jasmed.module('instrumentView').initialize();
});