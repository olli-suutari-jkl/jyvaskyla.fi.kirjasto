// isLibraryList variable is used to determine when to load schedules.
var isLibaryList = false;
// isScheduleEmpty is is used for displaying error message if no description or schedules is found.
var isScheduleEmpty = false;
var mobileSchedulesMoved = false;
moment.locale(lang);
var HHmmFormat = 'HH:mm';
// Check that generic and special descriptions are not the same.
function strippedValueEquals(valueA, valueB) {
	/*if (valueA == null && valueB == null) {
        return true;
    }*/
	if (valueA == null || valueB == null) {
		return false;
	}
	valueA = valueA.replace(/\r?\n|\r/g, '');
	valueA = valueA.replace(/\./g, '');
	valueA = valueA.replace(/,/g, '');
	valueA = valueA.replace(/ /g, '');
	valueA = valueA.replace(/-/g, '');
	valueA = valueA.replace(/–/g, '');
	valueA = valueA.toLowerCase();
	valueB = valueB.replace(/\r?\n|\r/g, '');
	valueB = valueB.replace(/\./g, '');
	valueB = valueB.replace(/,/g, '');
	valueB = valueB.replace(/ /g, '');
	valueB = valueB.replace(/-/g, '');
	valueB = valueB.replace(/–/g, '');
	valueB = valueB.toLowerCase();
	if (valueA == valueB) {
		return true;
	} else {
		return false;
	}
}

// Generate url in text.
function generateLinks(string) {
	var result = '';
	string = '<p>' + string + '</p>';
	$(string).filter(function () {
		// https://stackoverflow.com/questions/6038061/regular-expression-to-find-urls-within-a-string
		var linkPattern = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
		var matched_str = $(this).html().match(linkPattern);
		if (matched_str) {
			var text = $(this).html();
			$.each(matched_str, function (index, value) {
				text = text.replace(value, "<a target='_blank' href='" + value + "'>" + generatePrettyUrl(value) + '</a>');
			});
			$(this).html(text);
			result = $(this).html(text)[0].innerHTML;
			return $(this);
		}
	});
	if (result == '') {
		result = string;
	} else {
		// If the result contains a link, the layout is weird unless we wrap it to <p>
		result = '<p>' + result + '</p>';
	}
	return result;
}

function isBefore(timeOne, timeTwo) {
	return !!moment(timeOne, HHmmFormat).isBefore(moment(timeTwo, HHmmFormat));
}

function isSame(timeOne, timeTwo) {
	if (moment(timeOne, HHmmFormat).isSame(moment(timeTwo, HHmmFormat))) {
		return true;
	} else {
		return false;
	}
}

function isSameOrBefore(timeOne, timeTwo) {
	if (
		moment(timeOne, HHmmFormat).isBefore(moment(timeTwo, HHmmFormat)) ||
		moment(timeOne, HHmmFormat).isSame(moment(timeTwo, HHmmFormat))
	) {
		return true;
	} else {
		return false;
	}
}

/* Split string after the word in the middle
 * https://stackoverflow.com/questions/18087416/split-string-in-half-by-word */
function splitString(s) {
	var middle = Math.floor(s.length / 2);
	var before = s.lastIndexOf(' ', middle);
	var after = s.indexOf(' ', middle + 1);
	if (before == -1 || (after != -1 && middle - before >= after - middle)) {
		middle = after;
	} else {
		middle = before;
	}
	var s1 = s.substr(0, middle);
	var s2 = s.substr(middle + 1);
	return s1 + '<br>' + s2;
}

function bindScheduleKeyNavigation() {
	// This prevents the page from jumping to "nextWeek", when hovering over the schedules.
	var element = document.getElementById('nextWeek');
	element.focus({
		preventScroll: false
	});
	// Blur, since the previous thing would leave focus to the element by default.
	$('#nextWeek').blur();
	// Activate arrow navigation when hovering over the schedules.
	$('#schedules').mouseenter(function () {
		if (!$('.library-schedules').hasClass('hovering')) {
			$('.library-schedules').addClass('hovering');
			// If we blur instantly, arrow navigation won't work unless something has been clicked in the document.
			setTimeout(function () {
				$('#nextWeek').blur();
			}, 5);
		}
	});
	$('#schedules').mouseleave(function () {
		$('.library-schedules').removeClass('hovering');
	});
}

// Swiping for schedules & image slider. https://stackoverflow.com/questions/15084675/how-to-implement-swipe-gestures-for-mobile-devices
function detectswipe(el, func) {
	var swipe_det = new Object();
	swipe_det.sX = 0;
	swipe_det.sY = 0;
	swipe_det.eX = 0;
	swipe_det.eY = 0;
	var min_x = 70; // min x swipe for horizontal swipe
	var max_x = 1; // max x difference for vertical swipe (ignored)
	var min_y = 1; // min y swipe for vertical swipe (ignored)
	var max_y = 45; // max y difference for horizontal swipe
	var direc = '';
	ele = document.getElementById(el);
	ele.addEventListener(
		'touchstart',
		function (e) {
			var t = e.touches[0];
			swipe_det.sX = t.screenX;
			swipe_det.sY = t.screenY;
		},
		false
	);
	ele.addEventListener(
		'touchmove',
		function (e) {
			var t = e.touches[0];
			swipe_det.eX = t.screenX;
			swipe_det.eY = t.screenY;
		},
		false
	);
	ele.addEventListener(
		'touchend',
		function (e) {
			// Hide/inactivate any tooltips when swiping the slider.
			if (el == '#sliderbox') {
				$('.tooltip').hide();
				document.activeElement.blur();
			}
			// horizontal detection
			if (
				(swipe_det.eX - min_x > swipe_det.sX || swipe_det.eX + min_x < swipe_det.sX) &&
				swipe_det.eY < swipe_det.sY + max_y &&
				swipe_det.sY > swipe_det.eY - max_y &&
				swipe_det.eX > 0
			) {
				e.preventDefault();
				if (swipe_det.eX > swipe_det.sX) direc = 'r';
				else direc = 'l';
			}
			// vertical detection
			else if (
				(swipe_det.eY - min_y > swipe_det.sY || swipe_det.eY + min_y < swipe_det.sY) &&
				swipe_det.eX < swipe_det.sX + max_x &&
				swipe_det.sX > swipe_det.eX - max_x &&
				swipe_det.eY > 0
			) {
				return;
				//if (swipe_det.eY > swipe_det.sY) direc = "d";
				//else direc = "u";
			}
			// Call the swipeNavigation function with the right direction.
			if (direc != '') {
				if (typeof func == 'function') func(el, direc);
			}
			direc = '';
			swipe_det.sX = 0;
			swipe_det.sY = 0;
			swipe_det.eX = 0;
			swipe_det.eY = 0;
		},
		false
	);
}
// Navigate schedules or image slider by swiping.
function swipeNavigation(el, d) {
	if (el === 'schedules') {
		//alert("Thou swiped on element with id '"+el+"' to "+d+" direction");
		if (d === 'r') {
			$('#lastWeek').focus();
			$('#lastWeek').click();
		} else if (d === 'l') {
			$('#nextWeek').focus();
			$('#nextWeek').click();
		}
	} else if (el === 'sliderBox') {
		if (d === 'r') {
			$('#sliderPrevious').focus();
			$('#sliderPrevious').click();
		} else if (d === 'l') {
			$('#sliderForward').focus();
			$('#sliderForward').click();
		}
	}
}

$(document).ready(function () {
	// Trigger schedule fetching, if no library list, otherwise trigger in consortium.js
	if (!isLibaryList && !homePage) {
		setTimeout(function () {
			getWeekSchelude(0, library);
		}, 50);
	}
	// UI texts.
	$('#scheludesSr').append(i18n.get('Opening hours')); // Standalone schedules.
	bindScheduleKeyNavigation();
	// Detect left/right on schedules or move backwards/forwards in slider if in fullscreen mode or when hovering small slider..
	$(document).keydown(function (e) {
		switch (e.key) {
			case ' ': // Space detection for playing stopping Instagram videos within the slider.
				// Slider hovering is not really used with schedules, but it's better? to do it here instead.
				if (
					!$('#sliderBox').hasClass('small-slider') ||
					$('#sliderBox').hasClass('hovering') ||
					$('#sliderPrevious').is(':focus') ||
					$('#sliderForward').is(':focus')
				) {
					if ($('.rslides1_on').find('div.video-controls').length !== 0) {
						$('#sliderPrevious').blur();
						$('#sliderForward').blur();
						$('.play-stop-icon').focus();
						$('.play-stop-icon').click();
					}
				}
				break;
			case 'ArrowLeft': // left
				if (
					$('.library-schedules').hasClass('hovering') ||
					$('#lastWeek').is(':focus') ||
					$('#nextWeek').is(':focus')
				) {
					$('#lastWeek').focus();
					$('#lastWeek').click();
				}
				// Slider hovering is not really used with schedules, but it's better to do it here instead of adding another $(document).keydown(function(e) {
				else if (
					!$('#sliderBox').hasClass('small-slider') ||
					$('#sliderBox').hasClass('hovering') ||
					$('#sliderPrevious').is(':focus') ||
					$('#sliderForward').is(':focus')
				) {
					$('#sliderPrevious').focus();
					$('#sliderPrevious').click();
				} else if (
					$('.nav-pills').hasClass('hovering') ||
					$('#navInfo').is(':focus') ||
					$('#navContacts').is(':focus') ||
					$('#navPalvelut').is(':focus')
				) {
					if (activeTab === 1) {
						$('#navInfo').focus();
						$('#navInfo').click();
					} else if (activeTab === 2) {
						$('#navContacts').focus();
						$('#navContacts').click();
					}
				}
				break;
			case 'ArrowRight': // right
				if (
					$('.library-schedules').hasClass('hovering') ||
					$('#lastWeek').is(':focus') ||
					$('#nextWeek').is(':focus')
				) {
					$('#nextWeek').focus();
					$('#nextWeek').click();
				}
				// Slider hovering is not really used with schedules, but it's better to do it here instead of adding another $(document).keydown(function(e) {
				else if (
					!$('#sliderBox').hasClass('small-slider') ||
					$('#sliderBox').hasClass('hovering') ||
					$('#sliderPrevious').is(':focus') ||
					$('#sliderForward').is(':focus')
				) {
					// Go to slide
					$('#sliderForward').focus();
					$('#sliderForward').click();
				} else if (
					$('.nav-pills').hasClass('hovering') ||
					$('#navInfo').is(':focus') ||
					$('#navContacts').is(':focus') ||
					$('#navPalvelut').is(':focus')
				) {
					if (activeTab === 0) {
						$('#navContacts').focus();
						$('#navContacts').click();
					} else if (activeTab === 1) {
						$('#navPalvelut').focus();
						$('#navPalvelut').click();
					}
				}
				break;
			default:
				return; // exit this handler for other keys
		}
	});
	// Add swiping detection for schedules & sliderbox if available.
	detectswipe('schedules', swipeNavigation);
	if (document.getElementById('sliderBox') != null) {
		detectswipe('sliderBox', swipeNavigation);
	}
}); // OnReady
