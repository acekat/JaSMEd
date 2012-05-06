/** inspired by Express 2.x req.flash() */
function flash(req, type, msg) {
	if (req.session === undefined) throw Error('req.flashMessage() requires sessions');
	var msgs = req.session.messages = req.session.messages || {};
	
	if (type && msg)
		return (msgs[type] = msgs[type] || []).push(msg);
	else if (type) {
		var arr = msgs[type];
		delete msgs[type];
		return arr || [];
	} else {
		req.session.messages = {};
		return msgs;
	}
};

module.exports = {
	flash: flash
}