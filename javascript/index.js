'use strict';

(function(){

	/*
	 * Color Class
	 * Stores the RGB values for this color and provides useful methods
	 * @param r: red value in decimal
	 * @param g: green value in decimal
	 * @param b: blue value in decimal
	 */
	var Color = function(r, g, b) {

		// RGB values for this color (defaults to 0)
		var m_rgb = {r: r || 0,
					 g: g || 0,
					 b: b || 0};

		/*
		 * getRGB()
		 * Gets the specified rgb values in the input field
		 * @param[rgb]: An array which specifies which rgb values to return
		 * @return: The specified RGB values
		 */
		this.getRGB = function(rgb) {

			// If |rgb| isn't specified we return all the values in an array
			if (!rgb) return [m_rgb.r, m_rgb.g, m_rgb.b];

			// Check for inappropriate inputs
			if (rgb.length > 3 || rgb.constructor !== Array) throw Error("Expected an Array of length 3");

			var values = [];

			// Return the values specified by |rgb| in an array
			for (var i = 0; i < rgb.length; i++) {

				var key = rgb[i];

				// Check key type validity
				if (typeof(key) !== 'string') throw Error("Expected 'r', 'g', 'b' keys");

				// Push appropriate RGB value to return value using key
				values.push(m_rgb[key]);
			}

			return values;
		};

		/*
		 * toCSS()
		 * Returns the CSS string of the stored RGB values
		 * @return: The CSS string of the RGB values in the format 'rgb(r,g,b)'
		 */
		this.toCSS = function() {
			return "rgb(" + m_rgb.r + "," + m_rgb.g + "," + m_rgb.b + ")";
		};
	};
})();