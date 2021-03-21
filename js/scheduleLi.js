// Function for generating the period info of the schedule.
function generateScheduleInfo(data) {
	var genericDescription;
	var holidayDescription;
	var isHoliday = false;
	var items = [];
	var isWeekInfo = false;
	var isSpecialInfo = false;
	var normalScheduleIsAvailable = false;
	var isSpecialWeek = false;
	// Turn object object array to object array.
	for (var key in data) {
		if (data.hasOwnProperty(key) && typeof data[key] === 'object') {
			//jsonPrinter(data[key]);
			var obj = data[key];
			var row = {};
			for (var key in obj) {
				//console.log(key + " -> " + obj[key]);
				row[key] = obj[key];
			}
			items.push(row);
			/* If no normal schedules are not available, do not set the variable to true.
               This is used to detect special schedules within special schedules. (eq. summer schedules and mid summer special schedules. */
			if (!row.isException) {
				normalScheduleIsAvailable = true;
			}
		}
	}
	// Loop the array.
	for (var i = 0; i < items.length; i++) {
		var mondayDate = moment().add(weekCounter, 'weeks').weekday(1).format('YYYY-MM-DD');
		var sundayDate = moment().add(weekCounter, 'weeks').weekday(7).format('YYYY-MM-DD');
		//console.log(items[i].validFrom + " | " + mondayDate);
		//console.log(items[i].validUntil + " | " + sundayDate);
		if (items[i].validFrom == mondayDate && items[i].validUntil == sundayDate) {
			isSpecialWeek = true;
			totalRows = totalRows + 2;
			if (isValue(items[i].description)) {
				holidayDescription = items[i].description;
			}
			isHoliday = true;
		}
		if (items[i].name != null && !isSpecialWeek) {
			// Generic description has no valid_until (null)
			if (items[i].description !== null && items[i].description.length !== 0) {
				if (!items[i].isException) {
					genericDescription = items[i].description;
				} else {
					if (normalScheduleIsAvailable) {
						holidayDescription = items[i].description;
						isHoliday = true;
					} else {
						genericDescription = items[i].description;
					}
				}
			}
		}
	}
	if (genericDescription != undefined && holidayDescription != undefined) {
		if (strippedValueEquals(genericDescription, holidayDescription)) {
			genericDescription = undefined;
		}
	}
	if (holidayDescription !== undefined) {
		// Add rows for infoscreen font-size calculations...
		if (holidayDescription.length < 40) {
			totalRows = totalRows + 1;
		} else if (holidayDescription.length > 40 && holidayDescription.length < 90) {
			holidayDescription = splitString(holidayDescription);
			totalRows = totalRows + 2;
		} else if (holidayDescription.length > 130 && holidayDescription.length < 170) {
			totalRows = totalRows + 3;
		} else {
			totalRows = totalRows + 4;
		}
		isSpecialInfo = true;
	}
	if (genericDescription !== undefined) {
		isWeekInfo = true;
	} else {
		$('#scheduleInfo').replaceWith(
			'<div id="scheduleInfo" style="display: none" class="info-span info-text"><i class="fas fa-info-circle" > </i></div>'
		);
	}
	if (holidayDescription === undefined) {
		$('#specialInfo').replaceWith(
			'<div id="specialInfo" style="display: none" class="info-span info-text"><i class="fas fa-info-circle" > </i></div>'
		);
	}
	if (isWeekInfo || isSpecialInfo) {
		$('#scheduleInfos').css('display', '');
	} else {
		$('#scheduleInfos').css('display', 'none');
	}
	if (isWeekInfo) {
		// Replace line breaks with br.
		genericDescription = genericDescription.replace(/(?:\r\n|\r|\n)/g, '<br>');
		genericDescription = generateLinks(genericDescription);
		$('#scheduleInfo').replaceWith(
			'<div id="scheduleInfo" class="info-span-lg info-text"><span class="week-info-icon-container"><i aria-hidden="true"  class="fas fa-info-circle" > </i> ' +
				genericDescription +
				'</span></div>'
		);
		$('#scheduleInfo').css('display', '');
	} else {
		$('#scheduleInfo').css('display', 'none');
	}
	if (isSpecialInfo) {
		holidayDescription = holidayDescription.replace(/(?:\r\n|\r|\n)/g, '<br>');
		holidayDescription = generateLinks(holidayDescription);
		$('#specialInfo').replaceWith(
			'<div id="specialInfo" class="info-span-lg info-text"><span class="week-info-icon-container"><i aria-hidden="true" class="fas fa-info-circle" > </i>' +
				holidayDescription +
				'</span></div>'
		);
		$('#specialInfoRow').css('display', '');
	} else {
		$('#specialInfoRow').css('display', 'none');
	}
}
var weekCounter = 0;
var dateInSchedule;
// totalRows is used to dynamically adjust font sizes for info-screens.
var totalRows = 0;
var schedulesAreAvailable = true;
var weekMinReached = false;
var weekMaxReached = false;
var weekDayFormat = 'dddd';

function getWeekSchelude(direction, lib) {
	totalRows = 0;
	// If no library is provided, use the default option.
	if (lib === undefined) {
		lib = library;
	}
	// +1 or -1;
	weekCounter = weekCounter + direction;
	var weekNumber = moment().add(weekCounter, 'weeks').format('W');
	// Kirkanta does not support going back multiple weeks. Limit going back to 8 weeks.
	// As of 4.1.2019, the API does not return the schedule periods and their infos from
	// 2018, thus limit going back to the last year, prevent going to the last year..
	if (weekCounter <= -8 || (weekCounter < 0 && weekNumber == 52)) {
		if (!largeSchedules) {
			if (!weekMaxReached) {
				$('lastWeek').attr('title', i18n.get('Min schedules'));
				$('#lastWeek').attr('data-original-title', i18n.get('Min schedules'));
				weekMinReached = true;
			}
			$('#lastWeek').tooltip('show');
		}
		// Return if under 8 weeks.
		if (weekCounter < -8 || (weekCounter < 0 && weekNumber == 52)) {
			if (weekCounter < 0 && weekNumber == 52) {
				weekCounter = 0;
			} else {
				weekCounter = 8;
			}
			return;
		}
	}
	// Set default tooltip + enable for customized effect.
	else if ($('#lastWeek').attr('data-original-title') != i18n.get('Previous week') && !largeSchedules) {
		$('#lastWeek').attr('title', i18n.get('Previous week'));
		$('#lastWeek').attr('data-original-title', i18n.get('Previous week'));
		$('#lastWeek').tooltip('enable');
		weekMinReached = false;
	}
	// Restrict to 12 weeks in to the future.
	// Show tooltip when max is reached.
	if (weekCounter >= 12) {
		if (!largeSchedules) {
			if (!weekMaxReached) {
				$('#nextWeek').attr('title', i18n.get('Max schedules'));
				$('#nextWeek').attr('data-original-title', i18n.get('Max schedules'));
				weekMaxReached = true;
			}
			$('#nextWeek').tooltip('show');
		}
		// Return if over 13 weeks.
		if (weekCounter > 12) {
			weekCounter = 12;
			return;
		}
	}
	// Set default tooltip + enable for customized effect.
	else if ($('#nextWeek').attr('title') !== i18n.get('Next week') && !largeSchedules) {
		$('#nextWeek').attr('title', i18n.get('Next week'));
		$('#nextWeek').attr('data-original-title', i18n.get('Next week'));
		$('#nextWeek').tooltip('enable');
		weekMaxReached = false;
	}
	// Display week number.
	$('#weekNumber').html(i18n.get('Week') + ' ' + weekNumber);
	$.getJSON(
		'https://api.kirjastot.fi/v4/schedules?library=' +
			lib +
			'&lang=' +
			lang +
			'&period.start=' +
			weekCounter +
			'w&period.end=' +
			weekCounter +
			'w&refs=period&limit=5000',
		{ _: new Date().getTime() },
		function (data) {
			if (data.items.length === 0) {
				// If we have not previously fetched the schedules succesfully and week is 0 or larger.
				if (weekNumber <= 0) {
					$('#schedules').css('display', 'none');
					schedulesAreAvailable = false;
				} else {
					$('#scheduleInfos').replaceWith(
						'<div id="scheduleInfo" class="info-span-lg info-text"><span class="week-info-icon-container"><i aria-hidden="true"  class="fas fa-info-circle" > </i> ' +
							i18n.get('No schedules') +
							'</span></div>'
					);
					$('#weekSchelude').css('display', 'none');
					//$("#weekSchelude").append(dayInfo);
					isScheduleEmpty = true;
				}
			} else {
				if (!schedulesAreAvailable || isScheduleEmpty) {
					schedulesAreAvailable = true;
					isScheduleEmpty = false;
					// Adjust parent size if previously failed. Check if function exists (false in standalone)
					if (typeof adjustParentHeight === 'function') {
						adjustParentHeight();
					}
				}
				var date = moment().add(weekCounter, 'weeks');
				dateInSchedule = new Date();
				dateInSchedule.setDate(dateInSchedule.getDate() + weekCounter * 7);
				var begin = moment(date).startOf('week').isoWeekday(1);
				// If lang == en, add 1 week. Otherwise last week will be shown... but why?
				if (lang == 'en') {
					date = moment().add(weekCounter + 1, 'weeks');
					begin = moment(date).startOf('week').isoWeekday(1);
				}
				var str = '';
				var schedules = data.items;
				generateScheduleInfo(data.refs.period);
				for (var i = 0; i < schedules.length; i++) {
					// If today, add some colourful classes!
					var isTodayClass = '';
					var dayInfo = '';
					var rowspanCount = 1;
					// Scheludes for: combined, selfServiceBefore, staffToday, selfServiceAfter
					var isClosed = true;
					var dayStart = '';
					var dayEnd = '';
					var selfServiceBefore = '';
					var staffToday = '';
					var selfServiceAfter = '';
					// ScheludeRow will be used to bring things together
					var scheludeRow = '';
					// Variables for schelude times.
					var staffPresentStart = '';
					var staffPresentEnd = '';
					// Capitalize 1st letter of dayname.
					var dayName = begin.format(weekDayFormat);
					dayName = dayName[0].toUpperCase() + dayName.substr(1);

					// Because we cannot detect screen width within iframes, we must separate the day name to
					// 2 parts and hide the 2nd part via css.
					var dayNameStart = dayName[0] + dayName[1];
					var dayNameEnd = dayName.substr(2);
					dayName =
						'<span class="day-name"><span>' +
						dayNameStart +
						'</span>' +
						'<span class="day-name-end">' +
						dayNameEnd +
						'</span></span>';

					function increaseRowCount(isInfo) {
						// Increase rowspanCount to be used with DD.M. for each open section.
						// Don't set library as open for info rows
						if (!isInfo) {
							rowspanCount = rowspanCount + 1;
							isClosed = false;
						} else {
							totalRows = totalRows + 1;
						}
					}
					// If schedules exists
					if (schedules != null) {
						// Info row.
						if (schedules[i].info !== null) {
							// Split long info strings in half, ignore longer than 60/80 chars.
							var infoText = capitalize(schedules[i].info);
							if (largeSchedules) {
								if (infoText.length > 30 && infoText.length < 80) {
									infoText = splitString(infoText);
									totalRows = totalRows + 1;
								} else if (infoText.length > 80) {
									totalRows = totalRows + 1;
								}
							} else {
								if (infoText.length > 40 && infoText.length < 90) {
									infoText = splitString(infoText);
									totalRows = totalRows + 1;
								} else if (infoText.length > 90) {
									totalRows = totalRows + 1;
								}
							}
							dayInfo =
								'<div >' +
								'<p class="info-row time--sub isTodayClass" ><span><i class="fas fa-info-circle" > </i></span>' +
								'<span class="info-span info-text"> ' +
								infoText +
								'</span>';
							'</p>' + '</div>';
							increaseRowCount(true);
						}
						var lastStatusIsStaff = false;
						for (var t = 0; t < schedules[i].times.length; t++) {
							var time = schedules[i].times[t];
							var from = time.from;
							var to = time.to;
							// Adjust main opening times.
							if (dayStart === '' || isBefore(from, dayStart)) {
								dayStart = from;
							}
							if (dayEnd === '' || isBefore(dayEnd, to)) {
								dayEnd = to;
							}
							/* https://api.kirjastot.fi/: Each entry in times contains a status field:
							 *         0 means the library is temporarily closed during the day.
							 *         1 means the library is open and has staff.
							 *         2 means the library is in self-service mode (no staff).
							 */
							if (time.status !== 0) {
								if (time.status == 1) {
									// https://github.com/libraries-fi/kirkanta/issues/12 | Don't increase row count for overlapping staff presents.
									if (!lastStatusIsStaff) {
										increaseRowCount();
										lastStatusIsStaff = true;
									}
								} else {
									increaseRowCount();
									lastStatusIsStaff = false;
								}
							}
							if (time.status === 1) {
								staffPresentStart = from;
								staffPresentEnd = to;
								// Store the row as a variable.
								staffToday =
									'<p class="time--sub time isTodayClass time--with-staff">' +
									'<span><i class="fas fa-level-up-alt fa-rotate-90"></i></span><span> ' +
									' ' +
									i18n.get('Service time') +
									' ' +
									'</span>' +
									'<span>' +
									staffPresentStart +
									' – ' +
									staffPresentEnd +
									'</span>' +
									'</p>';
							}
							// self-service
							else if (time.status === 2) {
								if (staffPresentStart === '') {
									selfServiceBefore =
										'<p class="time--sub time isTodayClass time--no-staff"><span><i aria-hidden="true" class="fas fa-level-up-alt fa-rotate-90"></i></span>' +
										'<span> ' +
										i18n.get('Self-service') +
										' </span>' +
										'<span>' +
										from +
										' – ' +
										to +
										'</span></p>';
								} else {
									selfServiceAfter =
										'<p class="time--sub time isTodayClass time--no-staff"><span><i aria-hidden="true" class="fas fa-level-up-alt fa-rotate-90"></i></span> ' +
										'<span> ' +
										i18n.get('Self-service') +
										'</span> ' +
										'<span>' +
										from +
										' – ' +
										to +
										'</span></p>';
								}
							}
						}
					}
					// If today, apply 'today' -class.
					if (moment(begin).isSame(moment(), 'day')) {
						isTodayClass = 'is-closed';
						// var time = moment() gives you current time. no format required.
						var time = moment(moment(), HHmmFormat),
							openingTime = moment(staffPresentStart, HHmmFormat),
							closingTime = moment(staffPresentEnd, HHmmFormat);
						// Check if staff is present.
						if (time.isBetween(openingTime, closingTime)) {
							isTodayClass = 'is-open';
						}
						// If not, check if self service time.
						else {
							(time = moment(moment(), HHmmFormat)),
								(openingTime = moment(dayStart, HHmmFormat)),
								(closingTime = moment(dayEnd, HHmmFormat));
							if (time.isBetween(openingTime, closingTime)) {
								isTodayClass = 'is-self-service';
							}
						}
						// Apply the class to the sections.
						selfServiceBefore = selfServiceBefore.replace('isTodayClass', isTodayClass);
						staffToday = staffToday.replace('isTodayClass', isTodayClass);
						selfServiceAfter = selfServiceAfter.replace('isTodayClass', isTodayClass);
						dayInfo = dayInfo.replace('isTodayClass', isTodayClass);
					}
					// Replace : with . in schedules.
					selfServiceBefore = selfServiceBefore.replace(/:/g, '.');
					staffToday = staffToday.replace(/:/g, '.');
					selfServiceAfter = selfServiceAfter.replace(/:/g, '.');
					// If no selfService or magazines, don't display a separate row for "Staff present".
					if (selfServiceBefore.length === 0 && selfServiceAfter.length === 0) {
						if (staffToday.length !== 0) {
							staffToday = '';
							rowspanCount = rowspanCount - 1;
						}
					}
					if (isClosed) {
						// Add info row on closed days.
						var closedRowSpan = 1;
						scheludeRow =
							'<div class="pretty-weekday-container ' +
							isTodayClass +
							'">' +
							'<span class="date-container"> ' +
							'<time datetime="' +
							begin.format('YYYY-MM-DD') +
							'">' +
							begin.format('D.M.') +
							'</time>' +
							'</span>' +
							' ' +
							dayName +
							' ' +
							'<span class="main-schedule closed">' +
							i18n.get('Closed') +
							'</span></div>' +
							dayInfo;
					} else {
						scheludeRow =
							'<div class="time pretty-weekday-container ' +
							isTodayClass +
							'">' +
							'<span class="date-container">' +
							'<time datetime="' +
							begin.format('YYYY-MM-DD') +
							'">' +
							begin.format('D.M.') +
							'</time>' +
							'</span>' +
							' ' +
							dayName +
							' ' +
							'<span class="main-schedule"><time datetime="' +
							dayStart +
							'">' +
							dayStart.replace(/:/g, '.') +
							'</time> – <time datetime="' +
							dayEnd +
							'">' +
							dayEnd.replace(/:/g, '.') +
							'</time></span></div>' +
							selfServiceBefore +
							staffToday +
							selfServiceAfter +
							dayInfo;
					}
					totalRows = totalRows + rowspanCount;
					str += '<li class="' + isTodayClass + '">' + scheludeRow + '</li>';
					begin.add(1, 'd');
				}
				$('#weekSchelude').replaceWith('<ul id="weekSchelude" class="schedules-weekly">' + str);
			}
			// If document has no title, set it to Library name.
			if (document.title === '') {
				if (data.name != null) {
					document.title = data.name;
				}
			}
			// Note: bodywidth does not actually work inside iframes.
			if (bodyWidth < 768 && !mobileSchedulesMoved && $('#blockquote').length) {
				mobileSchedulesMoved = true;
				var scheduleClone = $('#schedules').clone();
				var eventsClone = $('#events').clone();
				$('#schedules').html('');
				$('#events').html('');
				$('#blockquote').after(scheduleClone);
				$('#schedules').after(eventsClone);
				bindScheduleKeyNavigation();
				detectswipe('schedules', swipeNavigation);
			}
			// Large schedules are used in iDiD info screens.
			if (largeSchedules) {
				$('.library-schedules').removeClass('col-lg-4 col-xl-3 schedules-widget xxl-font xl-font m-font');
				$('#schedules').addClass('large-schedules col-md-12');
				$('#scheduleInfo').addClass('large-schedules col-md-12');
				// If less than 13 rows, apply the xxl font.
				//console.log(totalRows + " rows ");
				if (totalRows < 13) {
					//console.log("Use XXL-Font");
					$('.library-schedules').addClass('xxl-font');
					$('#scheduleInfo').addClass('xxl-font');
				}
				// If 26 rows or less, apply the xl font.
				else if (totalRows < 27) {
					//console.log("Use XL-Font");
					$('.library-schedules').addClass('xl-font');
					$('#scheduleInfo').addClass('xl-font');
				}
				// If more than 26 rows, change to 'medium' font.
				else if (totalRows > 26) {
					//console.log("Use M-Font");
					$('.library-schedules').addClass('m-font');
					$('#scheduleInfo').addClass('m-font');
				}
			} else {
				$('#scheduleTitle').html(i18n.get('Opening hours'));
				$('#scheduleTitle').css('display', 'block');
			}
			if (homePage) {
				adjustHomePageHeight(200);
			}
		}
	);
}
