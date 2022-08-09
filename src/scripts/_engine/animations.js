/**
 * Loads the style file via the JS file
 */
function loadAnimationStyle() {
	const element = document.createElement('link');
	element.setAttribute('rel', 'stylesheet');
	element.setAttribute('type', 'text/css');
	element.setAttribute('href', 'animations.css');
	document.getElementsByTagName('head')[0].appendChild(element);
}

/**
 * Start the listeners to define whether to animate an element or not
 */
function startAnimationListeners() {
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

(() => {
	loadAnimationStyle();
	startAnimationListeners();
})();
