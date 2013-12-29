/**
 * @module lol
 */
lol = lol || {};

/**
 * MonoBitmap is the most efficient way of storing boolean values in a cartezian system,
 * in other words a value can be accessed by two axes but it can store only boolean values.
 *
 * @constructor MonoBitmap
 * @class MonoBitmap
 */
lol.MonoBitmap = function(options) {
	options = options || {};
	this.value = options.value || [], this.w = options.w, this.h = options.h, this.bits = options.bits || 8;
	this.setSize(this.w, this.h);
};

/**
 * @prototype MonoBitmap
 * @extends lol.gfx
 */
lol.MonoBitmap.prototype = _.extend(lol.gfx, {
	/**
	 * Sets value at the specified coordinates
	 * @method setValue
	 * @param {Long} x first axis coordinate
	 * @param {Long} y second axis coordinate
	 * @param {Boolean} value the value to set
	 */
	setValue : function(x, y, value) {
		var idx = this.idxFromCoord(x, y);
		this.value[idx.x] = this.setBit(this.value[idx.x] || 0, idx.bitNum, value);
	},
	/**
	 * Get the value at the specified coordinates
	 * @method getValue
	 * @param {Long} x first axis coordinate
	 * @param {Long} y second axis coordinate
	 * @return {Boolean} value at the coordinates
	 */
	getValue : function(x, y) {
		var idx = this.idxFromCoord(x, y);
		num = this.value[idx.x] || 0;
		var value = this.getBit(num, idx.bitNum);
		return value;
	},
	/**
	 * Checks if the column is empty
	 * @method colEmpty
	 * @param {Long} col Column index (0 based)
	 * @return {Boolean} true if empty
	 */
	colEmpty : function(col) {
		var empty = true;
		for (var y = 0; y < this.h; y++) {
			var val = this.getValue(col, y);
			if (empty && val) {
				empty = false;
				break;
			}
		}
		return empty;
	},
	/**
	 * Checks if the row is empty
	 * @method rowEmpty
	 * @param {Long} row Row index (0 based)
	 * @return {Boolean} true if empty
	 */
	rowEmpty : function(row) {
		var empty = true;
		for (var x = 0; x < this.w; x++) {
			var val = this.getValue(x, row);
			if (empty && val) {
				empty = false;
				break;
			}
		}
		return empty;
	},
	/**
	 * Fills the whole table with random values
	 * @method randomize
	 */
	randomize : function() {
		for (var x = 0; x < this.w; x++) {
			for (var y = 0; y < this.h; y++) {
				var value = Math.floor(Math.random() * 2);
				this.setValue(x, y, value);
			}
		}
	},
	/**
	 * Shallow copy of the internal array
	 * @method rawValue
	 * @return the raw value of this
	 */
	rawValue : function() {
		return this.value.concat([]);
	},
	/**
	 * Copies to the internal array the specified array shalow copy
	 * @method rawCopy
	 * @param value
	 */
	rawCopy : function(value) {
		this.value = value.concat([]);
	},
	/**
	 * Clears true values in this where the provided bitmap has true values
	 * @method clearWithBitmap
	 * @param {Long} px first axis offset coordinate
	 * @param {Long} py second axis offset coordinate
	 * @param {Bitmap} bitmap clear bitmap
	 */
	clearWithBitmap : function(px, py, bitmap) {
		var w = Math.min(this.w - px, bitmap.w);
		var h = Math.min(this.h - py, bitmap.h);
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				var value = bitmap.getValue(x, y);
				if (value) {
					this.setValue(px + x, py + y, 0);
				}
			}
		}
	},
	/**
	 * Copies values from provided bitmap.
	 * @method clear
	 * @param {Long} px first axis offset coordinate
	 * @param {Long} py second axis offset coordinate
	 * @param {Bitmap} bitmap Bitmap to copy
	 * @param {Boolean} overlay if true it doesn't write false values
	 */
	copy : function(px, py, bitmap, overlay) {
		var w = Math.min(this.w - px, bitmap.w);
		var h = Math.min(this.h - py, bitmap.h);
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				var value = bitmap.getValue(x, y);
				if (overlay && value || !overlay) {
					this.setValue(px + x, py + y, value);
				}
			}
		}
	},
	/**
	 * Creates a subdivision copy of this
	 * @method sub
	 * @param {Long} x0 first axis from offset coordinate
	 * @param {Long} y0 second axis from offset coordinate
	 * @param {Long} x1 first axis to offset coordinate
	 * @param {Long} y1 second axis to offset coordinate
	 * @param {Bitmap} bitmap Bitmap to copy
	 * @return {MonoBitmap} subdivision MonoBitmap (new instance)
	 */
	sub : function(x0, y0, x1, y1) {
		var w = x1 - x0, h = y1 - y0;
		var b = new lol.Bitmap(w, h, [], this.bits);
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				var value = this.getValue(x0 + x, y0 + y);
				b.setValue(x, y, value);
			}
		}
		return b;
	},
	/**
	 * Checks if a bitmap true values intersects with this true values
	 * @method intersects
	 * @param {Long} px first axis offset coordinate
	 * @param {Long} py second axis offset coordinate
	 * @param {Bitmap} bitmap Bitmap to check
	 * @return {Boolean} true if it intersects
	 */
	intersects : function(px, py, bitmap) {
		var w = Math.min(this.w - px, bitmap.w);
		var h = Math.min(this.h - py, bitmap.h);
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				var bValue = bitmap.getValue(x, y);
				var thisValue = this.getValue(px + x, py + y);
				if (bValue && thisValue) {
					return true;
				}
			}
		}
		return false;
	},
	/**
	 * Checks if a bitmap is in this bounds
	 * @method notInBounds
	 * @param {Long} px first axis offset coordinate
	 * @param {Long} py second axis offset coordinate
	 * @param {Bitmap} bitmap Bitmap to copy
	 * @return {Boolean} true is not in bounds
	 */
	notInBounds : function(px, py, bitmap) {
		return (px + bitmap.w) < 0 || (py + bitmap.h) < 0 || (px + bitmap.w) > this.w || (py + bitmap.h) > this.h;
	},
	/**
	 * Rotates current shape 90 deg to left or to right
	 *
	 * @method rotate
	 * @param {Boolean} dir - true left, false right
	 */
	rotate : function(dir) {
		// rotating 90 deg will always swap the with with the height
		var b = new Bitmap(this.h, this.w, [0]);
		for (var x = 0; x < this.w; x++) {
			for (var y = 0; y < this.h; y++) {
				var value = this.getValue(x, y);
				useY = dir ? y : (this.h - 1) - y;
				b.setValue(useY, x, value);
			}
		}
		return b;
	},
	/**
	 * Returns a copy with empty rows and cols removed from the start and the end
	 * @method autocrop
	 * @return {MonoBitmap} subdivision MonoBitmap (new instance)
	 */
	autocrop : function() {
		var colEmpty = _bind(this.colEmpty, this);
		var rowEmpty = _bind(this.rowEmpty, this);
		var x0 = this.firstIndexFalse(this.w, colEmpty, false);
		var y0 = this.firstIndexFalse(this.h, rowEmpty, false);
		var x1 = this.firstIndexFalse(this.w, colEmpty, true);
		var y1 = this.firstIndexFalse(this.h, rowEmpty, true);
		return this.sub(x0 + 1, y0 + 1, x1, y1);
	},
	/**
	 * Looks for the first index where the callback returned false
	 * @method firstIndexFalse
	 * @param {Long} num
	 * @param {callback} check callback
	 * @param {Boolean} reverse count backwards
	 * @return {Long} index
	 */
	firstIndexFalse : function(num, check, reverse) {
		// reverse array with a flag
		var flag, res;
		for (var r = reverse, i = r ? num - 1 : 0, n = r ? -1 : num, d = r ? -1 : 1; i != n; i += d) {
			flag = check(i);
			if (flag) {
				res = i;
			} else {
				break;
			}
		}
		return res;
	},
	/**
	 * Sets this bitmap size
	 * @method setSize
	 * @param {Long} w Width
	 * @param {Long} h Height
	 */
	setSize : function(w, h) {
		this.w = w;
		this.h = h;
		this.bytes = this.bytesPerRow();
	},
	/**
	 * Calculates how many bytes goes into a row
	 * @method bytesPerRow
	 */
	bytesPerRow : function() {
		if (this.w % this.bits > 0) {
			return ((this.w - (this.w % this.bits)) / this.bits) + 1;
		} else {
			return (this.w / this.bits);
		}
	},
	/**
	 * Calculates the id of the internal array and the bitNum for the coordinates
	 * @method idxFromCoord
	 * @param x first axis coordinate
	 * @param y second axis coordinate
	 * @return {Object} object containing the id of the internal array and the bitNum
	 */
	idxFromCoord : function(x, y) {
		var index = (y * this.bytes) + ((x - x % this.bits) / this.bits);
		var bitNum = (this.bits - 1) - x % this.bits;
		return {
			x : index,
			bitNum : bitNum
		};
	},
	/**
	 * Sets a bit in a value at the specified place
	 * @method setBit
	 * @param {Object} value value
	 * @param {Long} x bit index
	 * @param {Long} bit the bit to be set
	 * @return {Object} the new value with the bit set
	 */
	setBit : function(value, x, bit) {
		return bit ? value | (1 << x) : value & ~(1 << x);
	},
	/**
	 * Gets a bit from a value at the specified place
	 * @method setBit
	 * @param {Object} value value
	 * @param {Long} x bit index
	 * @return {Boolean} the value of the bit
	 */
	getBit : function(value, x) {
		var result = value & (1 << x);
		return result > 0 ? 1 : 0;
	},
	/**
	 * Dumps the value array in console, useful for debug logging
	 * @method consolePrint
	 */
	consolePrint : function() {
		console.log('w: ' + this.w + ' h:' + this.h);
		for (var x = 0; x < this.w; x++) {
			var buff = "";
			for (var y = 0; y < this.h; y++) {
				buff += this.getValue(x, y) > 0 ? ' X ' : ' 0 ';
			}
			console.log(x + ' :' + buff);
		}

	}
});
