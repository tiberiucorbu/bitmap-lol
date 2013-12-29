/**
 * @module lol
 */
lol = lol || {};

lol.gfx = _.extend(lol.gfx || {}, {

	drawLine : function(x0, y0, x1, y1, color) {
		// var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
		// // Swap variables if needed
		// if (steep)
		// [x0, y0, x1, y1] = [y0, x0, y1, x1];
		// if (x0 > x1)
		// [x0, x1, y0, y1] = [x1, x0, y1, y0];

		var dx = x1 - x0, dy = Math.abs(y1 - y0), err = dx / 2;
		var ystep;
		if (y0 < y1)
			ystep = 1;
		else
			ystep = -1;
		for (; x0 <= x1; x0++) {
			if (steep) {
				this.drawPixel(y0, x0, color);
			} else {
				this.drawPixel(x0, y0, color);
			}
			err -= dy;
			if (err < 0) {
				y0 += ystep;
				err += dx;
			}
		}
	},

	// Draw a circle outline
	drawCircle : function(x0, y0, r, color) {
		var f = 1 - r, ddF_x = 1, ddF_y = -2 * r, x = 0, y = r;

		this.drawPixel(x0, y0 + r, color);
		this.drawPixel(x0, y0 - r, color);
		this.drawPixel(x0 + r, y0, color);
		this.drawPixel(x0 - r, y0, color);

		while (x < y) {
			if (f >= 0) {
				y--;
				ddF_y += 2;
				f += ddF_y;
			}
			x++;
			ddF_x += 2;
			f += ddF_x;

			this.drawPixel(x0 + x, y0 + y, color);
			this.drawPixel(x0 - x, y0 + y, color);
			this.drawPixel(x0 + x, y0 - y, color);
			this.drawPixel(x0 - x, y0 - y, color);
			this.drawPixel(x0 + y, y0 + x, color);
			this.drawPixel(x0 - y, y0 + x, color);
			this.drawPixel(x0 + y, y0 - x, color);
			this.drawPixel(x0 - y, y0 - x, color);
		}
	},

	drawCircleHelper : function(x0, y0, r, cornername, color) {
		var f = 1 - r, ddF_x = 1, ddF_y = -2 * r, x = 0, y = r;

		while (x < y) {
			if (f >= 0) {
				y--;
				ddF_y += 2;
				f += ddF_y;
			}
			x++;
			ddF_x += 2;
			f += ddF_x;
			if (cornername & 0x4) {
				this.drawPixel(x0 + x, y0 + y, color);
				this.drawPixel(x0 + y, y0 + x, color);
			}
			if (cornername & 0x2) {
				this.drawPixel(x0 + x, y0 - y, color);
				this.drawPixel(x0 + y, y0 - x, color);
			}
			if (cornername & 0x8) {
				this.drawPixel(x0 - y, y0 + x, color);
				this.drawPixel(x0 - x, y0 + y, color);
			}
			if (cornername & 0x1) {
				this.drawPixel(x0 - y, y0 - x, color);
				this.drawPixel(x0 - x, y0 - y, color);
			}
		}
	},

	fillCircle : function(x0, y0, r, color) {
		this.drawFastVLine(x0, y0 - r, 2 * r + 1, color);
		this.fillCircleHelper(x0, y0, r, 3, 0, color);
	},

	// Used to do circles and roundrects
	fillCircleHelper : function(x0, y0, r, cornername, delta, color) {
		var f = 1 - r, ddF_x = 1, ddF_y = -2 * r, x = 0, y = r;

		while (x < y) {
			if (f >= 0) {
				y--;
				ddF_y += 2;
				f += ddF_y;
			}
			x++;
			ddF_x += 2;
			f += ddF_x;

			if (cornername & 0x1) {
				this.drawFastVLine(x0 + x, y0 - y, 2 * y + 1 + delta, color);
				this.drawFastVLine(x0 + y, y0 - x, 2 * x + 1 + delta, color);
			}
			if (cornername & 0x2) {
				this.drawFastVLine(x0 - x, y0 - y, 2 * y + 1 + delta, color);
				this.drawFastVLine(x0 - y, y0 - x, 2 * x + 1 + delta, color);
			}
		}
	},

	// Draw a rectangle
	drawRect : function(x, y, w, h, color) {
		this.drawFastHLine(x, y, w, color);
		this.drawFastHLine(x, y + h - 1, w, color);
		this.drawFastVLine(x, y, h, color);
		this.drawFastVLine(x + w - 1, y, h, color);
	},

	drawFastVLine : function(x, y, h, color) {
		// Update in subclasses if desired!
		this.drawLine(x, y, x, y + h - 1, color);
	},
	drawFastHLine : function(x, y, w, color) {
		// Update in subclasses if desired!
		this.drawLine(x, y, x + w - 1, y, color);
	},

	fillRect : function(x, y, w, h, color) {
		// Update in subclasses if desired!
		for ( i = x; i < x + w; i++) {
			this.drawFastVLine(i, y, h, color);
		}
	},

	fillScreen : function(color) {
		this.fillRect(0, 0, this.getWidth(), this.getHeight(), color);
	},
	// Draw a rounded rectangle
	drawRoundRect : function(x, y, w, h, r, color) {
		// smarter veextend(window.tc.gfx || {}, rsion
		this.drawFastHLine(x + r, y, w - 2 * r, color);
		// Top
		this.drawFastHLine(x + r, y + h - 1, w - 2 * r, color);
		// Bottom
		this.drawFastVLine(x, y + r, h - 2 * r, color);
		// Left
		this.drawFastVLine(x + w - 1, y + r, h - 2 * r, color);
		// Right
		// draw four corners
		this.drawCircleHelper(x + r, y + r, r, 1, color);
		this.drawCircleHelper(x + w - r - 1, y + r, r, 2, color);
		this.drawCircleHelper(x + w - r - 1, y + h - r - 1, r, 4, color);
		this.drawCircleHelper(x + r, y + h - r - 1, r, 8, color);
	},
	//
	// // Fill a rounded rectangle
	fillRoundRect : function(x, y, w, h, r, color) {
		// smarter version
		this.fillRect(x + r, y, w - 2 * r, h, color);

		// draw four corners
		this.fillCircleHelper(x + w - r - 1, y + r, r, 1, h - 2 * r - 1, color);
		this.fillCircleHelper(x + r, y + r, r, 2, h - 2 * r - 1, color);
	},
	//
	// // Draw a triangle
	drawTriangle : function(x0, y0, x1, y1, x2, y2, color) {
		this.drawLine(x0, y0, x1, y1, color);
		this.drawLine(x1, y1, x2, y2, color);
		this.drawLine(x2, y2, x0, y0, color);
	},
	//
	// Fill a triangle
	fillTriangle : function(x0, y0, x1, y1, x2, y2, color) {
		var a, b, y, last;
		// Sort coordinates by Y order (y2 >= y1 >= y0)
		// if (y0 > y1) {
		// [y0, y1, x0, x1] = [y1, y0, x1, x0];
		// }
		// if (y1 > y2) {
		// [y2, y1, x2, x1] = [y1, y2, x1, x2];
		// }
		// if (y0 > y1) {
		// [y0, y1, x0, x1] = [y1, y0, x1, x0];
		// }

		if (y0 == y2) {// Handle awkward all-on-same-line case as its own thing
			a = b = x0;
			if (x1 < a)
				a = x1;
			else if (x1 > b)
				b = x1;
			if (x2 < a)
				a = x2;
			else if (x2 > b)
				b = x2;
			this.drawFastHLine(a, y0, b - a + 1, color);
			return;
		}

		var dx01 = x1 - x0, dy01 = y1 - y0, dx02 = x2 - x0, dy02 = y2 - y0, dx12 = x2 - x1, dy12 = y2 - y1, sa = 0, sb = 0;

		// For upper part of triangle, find scanline crossings for segments
		// 0-1 and 0-2.  If y1=y2 (flat-bottomed triangle), the scanline y1
		// is included here (and second loop will be skipped, avoiding a /0
		// error there), otherwise scanline y1 is skipped here and handled
		// in the second loop...which also avoids a /0 error here if y0=y1
		// (flat-topped triangle).
		if (y1 == y2)
			last = y1;
		// Include y1 scanline
		else
			last = y1 - 1;
		// Skip it

		for ( y = y0; y <= last; y++) {
			a = x0 + sa / dy01;
			b = x0 + sb / dy02;
			sa += dx01;
			sb += dx02;
			/* longhand:
			a = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
			b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
			*/
			// if (a > b)
			// [a, b] = [b, a];
			this.drawFastHLine(a, y, b - a + 1, color);
		}

		// For lower part of triangle, find scanline crossings for segments
		// 0-2 and 1-2.  This loop is skipped if y1=y2.
		sa = dx12 * (y - y1);
		sb = dx02 * (y - y0);
		for (; y <= y2; y++) {
			a = x1 + sa / dy12;
			b = x0 + sb / dy02;
			sa += dx12;
			sb += dx02;
			/* longhand:
			a = x1 + (x2 - x1) * (y - y1) / (y2 - y1);
			b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
			*/
			// if (a > b)
			// [a, b] = [b, a];
			this.drawFastHLine(a, y, b - a + 1, color);
		}
	}
});
