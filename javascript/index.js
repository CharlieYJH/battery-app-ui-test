'use strict';

(function(){

	/*
	 * Color Class
	 * Stores the RGB values for this color and provides useful methods for accessing and setting colors
	 * @param [r]: red value in decimal
	 * @param [g]: green value in decimal
	 * @param [b]: blue value in decimal
	 */
	var Color = function(r, g, b) {

		// RGB values for this color (defaults to 0)
		var m_rgb = {
			r: r || 0,
			g: g || 0,
			b: b || 0
		};

		/*
		 * getRGB()
		 * Gets the specified rgb values in the input field
		 * @param [rgb]: An array which specifies which rgb values to return
		 * @return: The specified RGB values
		 */
		this.getRGB = function(rgb) {

			// If |rgb| isn't specified we return all the values in an array
			if (!rgb) return [m_rgb.r, m_rgb.g, m_rgb.b];

			// Check for inappropriate inputs
			if (rgb.constructor !== Array || rgb.length > 3) throw new Error("Expected an Array of length 1 to 3");

			var values = [];

			// Return the values specified by |rgb| in an array
			for (var i = 0; i < rgb.length; i++) {

				var key = rgb[i];

				// Check key type validity
				if (key !== 'r' && key !== 'g' && key !== 'b') throw new Error("Expected 'r', 'g', 'b' keys");

				// Push appropriate RGB value to return value using key
				values.push(m_rgb[key]);
			}

			// Return an array of values or the value itself if it's the only value
			return (values.length === 1) ? values[0] : values;
		};

		/*
		 * setRGB()
		 * Sets the stored RGB values
		 * @param [rgb]: An array containing the rgb values in the format [r, g, b]
		 */
		this.setRGB = function(rgb) {

			// Throw error if array is incomplete
			if (rgb.constructor !== Array || rgb.length !== 3) throw new Error("Expected an Array of length 3");

			for (var i = 0; i < rgb.length; i++) {
				if (typeof(rgb[i]) !== 'number') throw new Error("Expected number inputs");
			}

			// Helper function to bound the input range
			var boundNum = function(num, max, min) {
				return (num > max) ? max
								   : (num < min) ? min
								   				 : num;
			}

			// Replace the stored RGB values
			m_rgb.r = boundNum(rgb[0], 255, 0);
			m_rgb.g = boundNum(rgb[1], 255, 0);
			m_rgb.b = boundNum(rgb[2], 255, 0);
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

	/*
	 * Progress Bar Class
	 * Creates progress bar objects which has color and progress information
	 * @param [color]: A color object
	 * @param [range]: A range of RGB values that define the progress bar color at different points
	 * @param [start]: Starting progress value
	 * @param [end]: Ending progress value
	 */
	var Progress = function(color, range, start, end) {

		// Check inputs for errors
		if (color.constructor !== Color) throw new Error("Expected a Color object");
		if (range.length < 1) throw new Error("The range must have at least 1 RGB element");
		if ((start !== null && end !== null) && (start >= end)) throw new Error("Start must be less than end");

		// Color object and color ranges
		var m_color = color;
		var m_range = range;

		// Progress end points and initializes the current progress
		var m_start = start || 0;
		var m_end = end || 100;
		var m_progress = m_start;

		/*
		 * getBreakpoints()
		 * Helper function to get the breakpoints according to the given range
		 * @return: An array containing the breakpoints
		 */
		var getBreakpoints = function() {

			var breakpoints = [];
			var length = m_range.length - 1;

			// If the color range array only had 1 element in it, return the start and end points
			if (length === 0) return [m_start, m_end];

			var step = (m_end - m_start) / length;

			// Add in the breakpoints according to given range
			for (var val = m_start; val < m_end; val = val + step) {
				breakpoints.push(val);
			}

			// Correct errors from comparing floating point and ensuring last element is the end number
			if (breakpoints.length < length) {
				breakpoints.push(m_end);
			} else {
				breakpoints[length] = m_end;
			}

			return breakpoints;
		};

		// Breakpoints array which will break the range into |m_range.length - 1| segments
		var m_breakpoints = getBreakpoints();

		/*
		 * getCurrentRange()
		 * Helper function to determine the current progress range we're in
		 * @return: A 2-element array containing the indices of the range in the format [range_start, range_end]
		 */
		var getCurrentRange = function() {

			var range_start, range_end;

			for (var i = 1; i < m_breakpoints.length; i++) {
				if (m_progress <= m_breakpoints[i]) {

					// Check which range the current progress is in and return it
					range_start = i - 1;
					range_end = i;

					return [range_start, range_end];
				}
			}
		};

		/*
		 * setProgress()
		 * Sets the current stored progress and adjusts the RGB value accordingly
		 * @param [progress]: The progress to be assigned
		 */
		this.setProgress = function(progress) {

			// Check that the progress is within the range
			if (progress < m_start || progress > m_end) throw new Error("Progress is not within the set range");

			// Sets the current progress
			m_progress = progress;

			var range = getCurrentRange();

			console.log(m_breakpoints);
			console.log(m_breakpoints[range[0]], m_breakpoints[range[1]]);
		};
	};

	(new Progress(new Color(), [2, 4, 5, 6], 70.001, 70.1)).setProgress(70.001);

})();