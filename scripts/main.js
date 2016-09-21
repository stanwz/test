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

	settings.RENDER_FRAME = "global_event_render_frame";
	settings.WINDOW_RESIZE = "global_event_window_resize";
	settings.WINDOW_SCROLL = "global_event_window_scroll";
	settings.WINDOW_LOAD = "global_event_window_load";

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
	'ribbon/ribbon',
	'ribbon/global-events',
	'settings'
],function(Ribbon, GlobalEvents, settings){

	var ribbon = new Ribbon();

	var renderEvent = {name: settings.RENDER_FRAME};

	render();

	document.addEventListener('keydown', function(e){
		switch(e.keyCode) {
			case 38: ribbon.animateToTop();break;
			case 40: ribbon.animateToBottom();break;
		}
	});

	function render() {
		window.requestAnimationFrame(render);
		GlobalEvents.dispatch(renderEvent);
	}
});