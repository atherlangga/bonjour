chrome.app.runtime.onLaunched.addListener(function () {
	chrome.app.window.create('index.html', {
		bounds: {
			width: 1200,
			height: 620,
			left: 50,
			top: 50
		},
		minWidth: 420,
		minHeight: 220,
	});
});

