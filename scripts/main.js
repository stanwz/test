require.config({
	paths: {
		pixi: 'vendor/pixi',
		perlin: 'ribbon/perlin'
	},
	shim: {
		perlin: {
			exports: 'noise'
		}
	}
});

define('settings',['pixi'],function(PIXI){
	var settings = {};

	settings.anchorPoints = {
		START: 0,
		CENTER: 1,
		END: 2
	};

	settings.dimensions = {
		width: window.innerWidth - 15,
		height: window.innerHeight - 20
	};

	settings.renderer = PIXI.autoDetectRenderer(settings.dimensions.width, settings.dimensions.height);

	document.body.appendChild(settings.renderer.view);

	settings.stage = new PIXI.Container();

	return settings;
});

define([
	'ribbon/ribbon'
],function(Ribbon){

	new Ribbon();
});