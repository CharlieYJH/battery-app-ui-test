'use strict';

(function(){

	/* -------------------------- Class Definitions -------------------------- */

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
		 * @return: The CSS string of the RGB values in the format 'rgba(r,g,b,opacity)'
		 */
		this.toCSS = function(opacity) {
			return "rgba(" + m_rgb.r + "," + m_rgb.g + "," + m_rgb.b + "," + opacity + ")";
		};
	};

	/*
	 * Progress Class
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

			// Get current range
			var range = getCurrentRange();

			// Transition the RGB colors
			transitionRGB(m_progress, range);
		};

		/*
		 * getProgress()
		 * Gets the actual progress number
		 * @return: The actual progress amount
		 */
		this.getProgress = function() {
			return m_progress;
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
		this.getColorCSS = function(opacity) {
			return m_color.toCSS(opacity);
		};
	};

	/* -------------------------- Main Code -------------------------- */

	window.addEventListener("load", function() {

		// Color Ranges
		var range = [
			[245, 12, 13],
			[243, 166, 0],
			[33, 150, 9]
		];

		// Charge object containing relevant display data and objects
		var charge = {
			progress: (new Progress(new Color(), range)).init(),
			bar: document.getElementById("battery-charge"),
			background: document.getElementById("charge-bg"),
			dot: document.getElementById("charge-dot"),
			text: document.getElementById("charge-data"),
			data: document.getElementById("charge-data").children[1],
			input: document.getElementById("charge-input"),
			circumference: 0	// Calculate once document loads to prevent wrong circumference
		};

		// Health object containing relevant display data and objects
		var health = {
			progress: (new Progress(new Color(), range)).init(),
			bar: document.getElementById("battery-health"),
			background: document.getElementById("health-bg"),
			dot: document.getElementById("health-dot"),
			text: document.getElementById("health-data"),
			data: document.getElementById("health-data").children[1],
			input: document.getElementById("health-input"),
			circumference: 0	// Calculate once document loads to prevent wrong circumference
		};

		// Randomizer checkbox
		var randomizer = document.getElementById("randomize");

		// Helper function for updating display
		var update = function(element, progress) {

			// Update progress information
			element.progress.setProgress(progress);
			element.data.innerHTML = element.progress.getProgress();
			element.bar.style.strokeDashoffset = (1 - element.progress.getProgressPercentage()) * element.circumference;

			// Get new colors
			var cover_color = element.progress.getColorCSS(1);
			var bg_color = element.progress.getColorCSS(0.2);

			// Linear equation to get proper rotation for dot to sync with progress bar
			var angle = -360 * (1 - element.progress.getProgressPercentage()) + 630;
			element.dot.style.transform = "rotate(" + angle + "deg)";

			// Update colors
			element.bar.style.stroke = cover_color;
			element.dot.style.stroke = cover_color;
			element.text.style.color = cover_color;
			element.background.style.stroke = bg_color;
		};

		// Calculate circumference after loading to prevent 0 error
		charge.circumference = Math.round(2 * Math.PI * charge.bar.r.baseVal.value);
		health.circumference = Math.round(2 * Math.PI * health.bar.r.baseVal.value);

		// Initialize health and charge
		update(health, 0);
		update(charge, 0);

		// Initialize slider input values
		charge.input.value = 0;
		health.input.value = 0;

		// Set it to initially randomize charge and health values
		randomizer.checked = true;

		// Randomizes progress readings every 1 second
		setInterval(function() {

			// If randomize isn't checked, return
			if (!randomizer.checked) return;

			// Increment new charge and health progress
			var new_charge = Math.floor(Math.random() * 100);
			var new_health = Math.floor(Math.random() * 100);

			// Update health and charge
			update(charge, new_charge);
			update(health, new_health);

			// Update slider positions
			charge.input.value = new_charge;
			health.input.value = new_health;

		}, 1000);

		// Updates charge progress using slider
		charge.input.addEventListener("input", function() {
			if (!randomizer.checked) update(charge, charge.input.value);
		});

		// Updates health progress using slider
		health.input.addEventListener("input", function() {
			if (!randomizer.checked) update(health, health.input.value);
		});

		// Reads randomize checkbox
		randomizer.addEventListener("change", function() {

			var class_name = "randomize";

			// Add or remove classes depending on randomizer checkbox to add or remove CSS transitions
			// This prevents jittery animation when the bars are manually controlled
			if (randomizer.checked) {
				charge.bar.classList.add(class_name);
				charge.dot.classList.add(class_name);
				health.bar.classList.add(class_name);
				health.dot.classList.add(class_name);
			} else {
				charge.bar.classList.remove(class_name);
				charge.dot.classList.remove(class_name);
				health.bar.classList.remove(class_name);
				health.dot.classList.remove(class_name);
			}
		});
	});
})();