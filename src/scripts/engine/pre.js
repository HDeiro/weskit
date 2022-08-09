fetch('./settings/settings.json')
	.then(resp => resp.json())
	.then(loadConfigurations);

function loadConfigurations(configurations) {
	window.appConfigs = configurations;
	window.dispatchEvent(new Event('settingsAreReady'));
}
