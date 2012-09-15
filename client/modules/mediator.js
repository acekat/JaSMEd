var channels = {};

function subscribe(channel, fn) {
	if (!channels[channel]) channels[channel] = [];
	channels[channel].push({ context: this, callback: fn });
	return this;
};

function publish(channel) {
	if (!channels[channel]) return false;
	var args = Array.prototype.slice.call(arguments, 1);
	for (var i = 0, l = channels[channel].length; i < l; i++) {
		var subscription = channels[channel][i];
		subscription.callback.apply(subscription.context, args);
	}
	return this; //so can chain method calls
};

module.exports = {
	channels: channels,
	publish: publish,
	subscribe: subscribe,
	installTo: function(obj) {
		obj.subscribe = subscribe;
		obj.publish = publish;
	}
};
