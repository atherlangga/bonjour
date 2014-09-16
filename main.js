chrome.app.runtime.onLaunched.addListener(function () {
	chrome.app.window.create('index.html', {
		frame: "none",
		id: "framelessWinID",
		bounds: {
			width: 800,
			height: 620,
			left: 200,
			top:200
		},
		minWidth: 220,
		minHeight: 220,
		transparentBackground: true
	});
});

