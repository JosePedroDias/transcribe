(function() {

var ajax = function(uri, cb) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', uri, true);

	var cbInner = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var o, err;
			try {
				o = JSON.parse(xhr.response);
			} catch (ex) {
				err = 'json parsing problem: ' + ex;
			}
		}
		cb(err, o);
	};

	xhr.onload  = cbInner;
	xhr.onerror = cbInner;
	xhr.send(null);
};



var pendingsJsonpCbs = [];

var jsonp = function(uri, cb) {
	pendingsJsonpCbs.push(cb);
	var scriptEl = document.createElement('script');
	scriptEl.setAttribute('type', 'text/javascript');
	scriptEl.setAttribute('src', uri + '&jsonp=parseJSON');
	document.head.appendChild(scriptEl);
};

var parseJSON = function(o) {
	pendingsJsonpCbs.shift()(o);
};



window.ajax  = ajax;
window.jsonp = jsonp;

})();
