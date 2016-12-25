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

		if ((start !== undefined && end === undefined) || (start === undefined && end !== undefined)) throw new Error("One of the end point values are missing");

		if ((start !== undefined && end !== undefined) && (start >= end)) throw new Error("Start must be less than end");

		// Color object and color ranges
		var m_color = color;
		var m_range = range;

		// Progress end points and initializes the current progress
		var m_start = start || 0;
		var m_end = end || 100;

		// Progress tracker
		var m_progress;

		// Breakpoints array which will break the range into |m_range.length - 1| segments
		var m_breakpoints;

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
		 * transitionRGB()
		 * Transitions the current RGB to the new RGB value based on current progress
		 * @param [progress]: Current progress
		 * @param [range]: An array with the indices of the range we are currently in
		 */
		var transitionRGB = function(progress, range) {

			// Get the start and end of the range
			var start = m_breakpoints[range[0]];
			var end = m_breakpoints[range[1]];

			// Get the percentage of progress relative to this range
			var percentage = (progress - start) / (end - start);

			// Get the corresponding start and end colors for this range
			var start_color = m_range[range[0]];
			var end_color = (m_range.length > 1) ? m_range[range[1]] : start_color;

			var new_rgb = [];

			// For each RGB value, calculate the new value based on the progress percentage in the current range
			for (var i = 0; i < start_color.length; i++) {

				var step = percentage * (end_color[i] - start_color[i]);
				var new_color = Math.round(start_color[i] + step);

				new_rgb.push(new_color);
			}

			m_color.setRGB(new_rgb);
		};

		/*
		 * init()
		 * Initializes various internal variables
		 */
		this.init = function() {

			// Initializes the breakpoints based on range
			m_breakpoints = getBreakpoints();

			// Initializes the color to the first color in the range
			m_color.setRGB(m_range[0]);

			// Initializes the progress to the start value
			m_progress = m_start;

			return this;
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

			transitionRGB(m_progress, range);

			// console.log(m_breakpoints);
			// console.log(m_breakpoints[range[0]], m_breakpoints[range[1]]);
			// console.log(m_range[range[0]], m_range[range[1]]);
		};

		/*
		 * getProgressPercentage()
		 * Gets the progress in percentage with respect to the total range
		 * @return: A progress in percentage
		 */
		this.getProgressPercentage = function() {
			return (m_progress - m_start) / (m_end - m_start);
		};

		/*
		 * getColorCSS()
		 * Converts the current color to an RGB CSS string
		 * @return: A CSS RGB string
		 */
		this.getColorCSS = function() {
			return m_color.toCSS();
		}
	};

	// var range = [
	// 	[255, 255, 255],
	// 	[255, 0, 255],
	// 	[0, 0, 0],
	// 	[240, 240, 12]
	// ];
})();