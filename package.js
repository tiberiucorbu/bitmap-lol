Package.describe({
	summary : 'A bitmap implementation for lots of LEDs grid'
});

Package.on_use(function(api) {
	api.use(['underscore', 'value-utils', 'history'], ['client', 'server']);
	api.export(['lol']);
	api.add_files(['gfx.js', 'mono-bitmap.js', 'text-bitmap.js', 'layer-bitmap.js'], ['client', 'server']);
});
