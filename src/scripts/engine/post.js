function loadAsyncCss() {
	window.appConfigs.asyncCss.forEach(stylePath => {
		const myCSS = document.createElement('link');
		myCSS.rel = 'stylesheet';
		myCSS.href = stylePath;
		// insert it at the end of the head in a legacy-friendly manner
		document.head.insertBefore(myCSS, document.head.childNodes[document.head.childNodes.length - 1].nextSibling);
	});
}

function loadGoogleAnalytics() {
	const key = window.appConfigs.googleAnalytics;

	// Key exists and differs from default value
	if (key.length && key !== 'UA-XXXXX-X') {
		const script = document.createElement("script");
		script.innerHTML =
			`(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');`
			+ `ga('create', '${window.appConfigs.analytics}', 'auto');`
			+ `ga('send', 'pageview');`;
		document.body.appendChild(script);
	}
}

function loadPwa() {
	const { pwa: { enabled, version, cache }} = window.appConfigs;

	if (!enabled) return;

	const cacheName = `${cache.namePrefix}-${version}`;
	const cachable = cache.files;

	console.log(cacheName, cachable);
	// When installing a PWA
	self.addEventListener('install', event => event.waitUntil(caches
		.open(cacheName)
		.then(cache => cache
			.addAll(cachable)
			.then(() => self.skipWaiting())
		)
	));

	// When activating a PWA
	self.addEventListener('activate',
		event => event.waitUntil(self.clients.claim())
	);

	// On cache fetching
	self.addEventListener('fetch',
		event => event.respondWith(caches.open(cacheName)
			.then(cache => cache.match(event.request, {ignoreSearch: true}))
			.then(response => response || fetch(event.request))
		)
	);
}

window.addEventListener('settingsAreReady', () => {
	loadAsyncCss();
	loadGoogleAnalytics();
	loadPwa();
})
