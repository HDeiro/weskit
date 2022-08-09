/**
 * Load up async/non-critical CSS
 */
function loadAsyncCss() {
	window.appConfigs.asyncCss.forEach(stylePath => {
		const css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = stylePath;
		// insert it at the end of the head in a legacy-friendly manner
		document.head.insertBefore(css, document.head.childNodes[document.head.childNodes.length - 1].nextSibling);
	});
}

/**
 * Set up google analytics tracking
 */
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

/**
 * Load website as PWA
 */
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

/**
 * Start the listeners to define whether to animate an element or not
 */
function startAnimationListeners() {
	if (!window.appConfigs.useAnimations) return;

	// Capture all elements with animation data attribute
	const elementsToBeAnimated = Array.from(document.querySelectorAll('[data-animation]'));

	// Overrides some styling if applicable
	elementsToBeAnimated.forEach(element => {
		const { dataset: { animationDelay, animationDuration }} = element;

		// If animation delay is set up, it overrides css default value
		if (animationDelay)
		element.style.animationDelay = animationDelay;

		// If animation duration is set up, it overrides css default value
		if (animationDuration)
		element.style.animationDuration = animationDuration;
	});

	// Add an animation class to a given element
	const startAnimation = element => element.classList.add(element.dataset.animation);

	// Check the offset of an element to define whether to animate that or not
	const checkOffset = () => setTimeout(() => {
		elementsToBeAnimated.forEach(element => {
			const { dataset: { alreadyAnimated, animationOffset }} = element;

			// If element is already animated, it is skipped
			if (alreadyAnimated) return;

			// Captures elements bounding box
			const offset = animationOffset ? parseInt(animationOffset) : 0;
			const { top, bottom } = element.getBoundingClientRect();
			const elementBoxTop = top + offset;
			const elementBoxBottom = bottom - offset;

			// If element is on offset area, animate it
			if (elementBoxBottom > 0 && elementBoxTop < window.innerHeight) {
				startAnimation(element);
				element.dataset.alreadyAnimated = true;
			}
		});
	}, 0);

	//################################################################
	// Initialize Event Listeners
	//################################################################

	const eventsToBeListening = ['load', 'scroll', 'resize'];
	eventsToBeListening.forEach(event => window.addEventListener(event, checkOffset, false));
}

/**
 * Override the meta tags defined in `overrideMetaTags` on the `window.appConfigs`
 * by the value set on the configurations.
 */
function overrideMetaTags() {
	const overrides = Object.entries(window.appConfigs.overrideMetaTags || {});

	overrides.forEach(([meta, content]) => {
		const tag = document.querySelector(`meta[name="${meta}"]`);
		if (tag) tag.setAttribute("content", content);
	});
}

window.addEventListener('settingsAreReady', () => {
	// If use animations, leverages the `loadAsyncCss` to fetch animations.css
	if (window.appConfigs.useAnimations)
		window.appConfigs.asyncCss.push('./animations.css');

	loadAsyncCss();
	loadGoogleAnalytics();
	loadPwa();
	startAnimationListeners();
	overrideMetaTags();
})
