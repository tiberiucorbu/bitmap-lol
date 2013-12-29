/**
 * @module lol
 */

lol = lol || {};

lol.LayerBitmap = function(options) {
	this.bitmap = new lol.MonoBitmap(options);
	this.viewPort = {x:0, y: 0};
};
