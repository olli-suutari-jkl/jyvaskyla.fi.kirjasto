var libraryList = [];
// If we switch lang in keskikirjastot.fi, the old lang lib name will ghost in url.
var libListMultiLang = [];
var libListMultiLangHelper = [];
var libName;
// Group libraries by city.
// https://stackoverflow.com/questions/46043262/split-array-with-objects-to-multiple-arrays-based-on-unique-combination
function groupByCity(arr) {
	var wiitaUnionMobileAdded = false;
	// for each object obj in the array arr
	return arr.reduce(function (res, obj) {
		var key = obj.city;
		var newObj = {
			city: key,
			id: obj.id,
			text: obj.text
		};
		// Wiitaunion mobile library is used in both "Pihtipudas" and "Viitasaari".
		// b identifier is added so both won't be selected by id in selector.
		if (obj.id == 85449) {
			if (wiitaUnionMobileAdded) {
				newObj = { city: key, id: obj.id + 'b', text: obj.text };
			} else {
				wiitaUnionMobileAdded = true;
			}
		}
		// if res has a sub-array for the current key then...
		if (res[key]) {
			res[key].push(newObj); // ... push newObj into that sub-array
		} else {
			// otherwise...
			res[key] = [newObj]; // ... create a new sub-array for this key that initially contain newObj
		}
		return res;
	}, {});
}

function modelMatcher(params, data) {
	// If there are no search terms, return all of the data
	if ($.trim(params.term) === '') {
		return data;
	}
	// Skip if there is no 'children' property
	if (typeof data.children === 'undefined') {
		return null;
	}
	// Search term in lowercase
	params.term = params.term.toLowerCase();
	var filteredChildren = [];
	// `data.children` contains the actual option that we are matching against.
	$.each(data.children, function (idx, child) {
		// Find the matching item
		var libraryDetails = libraryList.find((o) => o.id.toString() === child.id);
		// Wiitaunionin kirjastoauto has b at the end
		if (libraryDetails === undefined) {
			libraryDetails = libraryList.find((o) => o.id === 85449);
		}
		// Match by library name
		if (libraryDetails.text.toLowerCase().indexOf(params.term) == 0) {
			filteredChildren.push(child);
			console.log('push');
		}
		// Match by city
		else if (libraryDetails.city.toLowerCase().indexOf(params.term) == 0) {
			console.log('cityyy');
			filteredChildren.push(child);
		}
		// Match by services
		else if (!homePage) {
			if (libraryDetails.services.toLowerCase().indexOf(params.term) > -1) {
				filteredChildren.push(child);
			}
		}
	});
	if (filteredChildren.length) {
		var modifiedData = $.extend({}, data, true);
		modifiedData.children = filteredChildren;
		// You can return modified objects from here
		// This includes matching the `children` how you want in nested data sets
		return modifiedData;
	}
	// Return `null` if the term should not be displayed
	return null;
}

function initSelect(items) {
	var placeholderText = 'Hae nimeä tai palvelua...';
	if (lang === 'en') {
		placeholderText = 'Search by name or service...';
	}
	if (homePage) {
		placeholderText = 'Hae nimellä...';
		if (lang === 'en') {
			placeholderText = 'Search by name...';
		}
	}
	// Unless we add the data first the screen readers will read the search term instead of the focused result.
	// The init must be done "twice" or it wont work properly.
	$('#librarySelector').select2({
		data: items
	});
	// If we use placeholder in IE, select always has focus and opens automatically.
	// https://stackoverflow.com/questions/29293452/ie-select2-always-gets-the-focus
	// TODO: Placeholder is not announced to screen readers with this fix.
	if (isIE) {
		$('#librarySelector').select2({
			language: lang, // Global parameter from getParameters.js
			matcher: modelMatcher
		});
	} else {
		$('#librarySelector').select2({
			language: lang, // Global parameter from getParameters.js
			searchInputPlaceholder: placeholderText,
			matcher: modelMatcher
		});
	}
	$('#librarySelectorContainer').addClass('always-visible');
}

function setSelectDefault() {
	$('.library-select').val(library).trigger('change');
	libName = $('#librarySelector option:selected').text();
}

function asyncReplaceIdWithCity() {
	var citiesDeferred = jQuery.Deferred();
	setTimeout(function () {
		try {
			// Fetch names of all cities in kirkanta.
			$.getJSON('https://api.kirjastot.fi/v4/city?lang=fi&limit=1500', function (data) {
				var counter = 0;
				for (var i = 0; i < data.items.length; i++) {
					// Check if libraryList contains the ID.
					for (var x = 0; x < libraryList.length; x++) {
						if (libraryList[x].city == data.items[i].id.toString()) {
							// Replace the id with city name.
							libraryList[x].city = data.items[i].name;
						}
					}
					counter = counter + 1;
					if (counter === data.items.length) {
						// Sort or the city listing wont be in  correct order...
						libraryList.sort(function (a, b) {
							if (a.city < b.city) {
								return -1;
							}
							if (a.city > b.city) {
								return 1;
							}
							return 0;
						});
						// Fetch events if events page.
						isEventsPage = $('.lib-events').length === 1;
						if (isEventsPage) {
							if (
								refUrl.indexOf('jyvaskyla') > -1 ||
								refUrl.indexOf('keski') > -1 ||
								refUrl.indexOf('localhost') > -1
							) {
								fetchEvents();
							}
						}
						citiesDeferred.resolve();
					}
				}
			});
		} catch (e) {
			console.log('Error in fetching cities: ' + e);
		}
	}, 1);
	// Return the Promise so caller can't change the Deferred
	return citiesDeferred.promise();
}

function generateSelect() {
	// Sort alphabetically. https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
	libraryList.sort(function (a, b) {
		var nameA = a.text.toLowerCase(),
			nameB = b.text.toLowerCase();
		if (nameA < nameB)
			//sort string ascending
			return -1;
		if (nameA > nameB) return 1;
		return 0; //default return value (no sorting)
	});

	// If we are fetching a consortium or a city.
	if (consortium !== undefined || city !== undefined) {
		var consortiumLibraries = [];
		var cityLibraries = [];
		// Replace city ID:s with names and check refurl for library names.
		$.when(asyncCheckUrlForKeskiLibrary(), asyncReplaceIdWithCity()).then(function () {
			// Trigger schedule fetching.
			if (homePage && $('.homepage-widget-week').length === 0) {
				getDaySchelude(0, library);
			} else {
				getWeekSchelude(0, library);
			}
			// Fetch library details, map is also generated during the process - it is important that we have already generated the list for map items.
			if (!homePage) {
				fetchInformation(lang);
			}
			// Consortium listing
			if (city === undefined) {
				$.when((librariesGroupped = groupByCity(libraryList))).then(function () {
					for (var key in librariesGroupped) {
						consortiumLibraries.push({ text: key, children: librariesGroupped[key] });
					}
					// Attach a done, fail, and progress handler for the asyncEvent
					$.when(initSelect(consortiumLibraries)).then(function () {
						setSelectDefault();
					});
				});
			}
			// City listing
			else {
				$.when((librariesGroupped = groupByCity(libraryList))).then(function () {
					for (var key in librariesGroupped) {
						cityLibraries.push({ text: key, children: librariesGroupped[key] });
					}
					// Attach a done, fail, and progress handler for the asyncEvent
					$.when(initSelect(cityLibraries)).then(function () {
						setSelectDefault();
					});
				});
			}
		});
	}
}

function findIndexInObjectArray(arraytosearch, key, valuetosearch) {
	for (var i = 0; i < arraytosearch.length; i++) {
		if (arraytosearch[i][key] == valuetosearch) {
			return i;
		}
	}
	return null;
}

function fetchConsortiumLibraries(consortium) {
	var consortiumLibListDeferred = jQuery.Deferred();
	setTimeout(function () {
		$.getJSON(
			'https://api.kirjastot.fi/v4/library?lang=' + lang + '&consortium=' + consortium + withServices + '&limit=1500',
			function (data) {
				for (var i = 0; i < data.items.length; i++) {
					// Include mobile libraries in consortium listings...
					libraryList.push({
						id: data.items[i].id,
						text: data.items[i].name,
						city: data.items[i].city.toString(),
						street: data.items[i].address.street,
						zipcode: data.items[i].address.zipcode,
						coordinates: data.items[i].coordinates,
						services: JSON.stringify(data.items[i].services)
					});
					if (lang === 'fi') {
						libListMultiLangHelper.push({ nameFi: encodeVal(data.items[i].name), id: data.items[i].id });
					} else {
						libListMultiLangHelper.push({ nameEn: encodeVal(data.items[i].name), id: data.items[i].id });
					}
					// Wiitaunion mobile library is used in both "Pihtipudas (85449)" and "Viitasaari".
					if (data.items[i].id == 85449) {
						libraryList.push({
							id: data.items[i].id,
							text: data.items[i].name,
							city: '16055',
							street: data.items[i].address.street,
							zipcode: data.items[i].address.zipcode,
							coordinates: data.items[i].coordinates,
							services: JSON.stringify(data.items[i].services)
						});
					}
				}
				$.getJSON(
					'https://api.kirjastot.fi/v4/library?lang=' + oppositeLang + '&consortium=' + consortium + '&limit=1500',
					function (data) {
						for (var i = 0; i < data.items.length; i++) {
							var index = findIndexInObjectArray(libListMultiLangHelper, 'id', data.items[i].id);
							if (oppositeLang === 'en') {
								libListMultiLang.push({
									nameFi: libListMultiLangHelper[index].nameFi,
									nameEn: encodeVal(data.items[i].name),
									id: data.items[i].id
								});
							} else {
								libListMultiLang.push({
									nameEn: libListMultiLangHelper[index].nameEn,
									nameFi: encodeVal(data.items[i].name),
									id: data.items[i].id
								});
							}
						}
						consortiumLibListDeferred.resolve();
						generateSelect();
					}
				);
			}
		);
	}, 1);
	// Return the Promise so caller can't change the Deferred
	return consortiumLibListDeferred.promise();
}

var withServices = '&with=services';
if (homePage) {
	withServices = '';
}
var oppositeLang = 'en';
if (lang === 'en') {
	oppositeLang = 'fi';
}
$(document).ready(function () {
	// Fetch libraries of city, that belong to the same consortium
	if (consortium !== undefined && city !== undefined) {
		isLibaryList = true;
		try {
			$.getJSON(
				'https://api.kirjastot.fi/v4/library?lang=' + lang + '&city.name=' + city + withServices + '&limit=1500',
				function (data) {
					for (var i = 0; i < data.items.length; i++) {
						// Ignore other consortiums.
						if (data.items[i].consortium == consortium) {
							libraryList.push({
								id: data.items[i].id,
								text: data.items[i].name,
								city: data.items[i].city.toString(),
								street: data.items[i].address.street,
								zipcode: data.items[i].address.zipcode,
								coordinates: data.items[i].coordinates,
								services: JSON.stringify(data.items[i].services)
							});
							if (lang === 'fi') {
								libListMultiLangHelper.push({ nameFi: encodeVal(data.items[i].name), id: data.items[i].id });
							} else {
								libListMultiLangHelper.push({ nameEn: encodeVal(data.items[i].name), id: data.items[i].id });
							}
						}
					}
					$.getJSON(
						'https://api.kirjastot.fi/v4/library?lang=' + oppositeLang + '&city.name=' + city + '&limit=1500',
						function (data) {
							for (var i = 0; i < data.items.length; i++) {
								// Ignore other consortiums.
								if (data.items[i].consortium == consortium) {
									var index = findIndexInObjectArray(libListMultiLangHelper, 'id', data.items[i].id);
									if (oppositeLang === 'en') {
										libListMultiLang.push({
											nameFi: libListMultiLangHelper[index].nameFi,
											nameEn: encodeVal(data.items[i].name),
											id: data.items[i].id
										});
									} else {
										libListMultiLang.push({
											nameEn: libListMultiLangHelper[index].nameEn,
											nameFi: encodeVal(data.items[i].name),
											id: data.items[i].id
										});
									}
								}
							}
							generateSelect();
						}
					);
				}
			);
		} catch (e) {
			alert(e);
		}
	}
	// Fetch libraries of city
	else if (consortium === undefined && city !== undefined) {
		isLibaryList = true;
		$.getJSON(
			'https://api.kirjastot.fi/v4/library?lang=' + lang + '&city.name=' + city + +withServices + '&limit=1500',
			function (data) {
				for (var i = 0; i < data.items.length; i++) {
					libraryList.push({
						id: data.items[i].id,
						text: data.items[i].name,
						city: data.items[i].city.toString(),
						street: data.items[i].address.street,
						zipcode: data.items[i].address.zipcode,
						coordinates: data.items[i].coordinates,
						services: JSON.stringify(data.items[i].services)
					});
					if (lang === 'fi') {
						libListMultiLangHelper.push({ nameFi: encodeVal(data.items[i].name), id: data.items[i].id });
					} else {
						libListMultiLangHelper.push({ nameEn: encodeVal(data.items[i].name), id: data.items[i].id });
					}
				}
				$.getJSON('https://api.kirjastot.fi/v4/library?lang=' + oppositeLang + '&city.name=' + city, function (data) {
					for (var i = 0; i < data.items.length; i++) {
						var index = findIndexInObjectArray(libListMultiLangHelper, 'id', data.items[i].id);
						if (oppositeLang === 'en') {
							libListMultiLang.push({
								nameFi: libListMultiLangHelper[index].nameFi,
								nameEn: encodeVal(data.items[i].name),
								id: data.items[i].id
							});
						} else {
							libListMultiLang.push({
								nameEn: libListMultiLangHelper[index].nameEn,
								nameFi: encodeVal(data.items[i].name),
								id: data.items[i].id
							});
						}
					}
					generateSelect();
				});
			}
		);
	}
	// Fetch libraries of consortium
	else if (consortium !== undefined && city === undefined) {
		isLibaryList = true;
		fetchConsortiumLibraries(consortium);
	}
	$('#librarySelector').change(function () {
		var newLib = $(this).val();
		// Wiitaunion mobile library is used in both "Pihtipudas" and "Viitasaari".
		// b identifier is added so both won't be selected by id in selector.
		if (newLib.indexOf('b') > -1) {
			newLib = newLib.replace('b', '');
		}
		// Don't use !== as it won't match.
		if (newLib != library) {
			// Set the global library parameter, so schedule switching won't mess things up.
			library = newLib;
			libName = $('#librarySelector option:selected').text();
			if (!homePage) {
				if (isInfoBoxVisible) {
					toggleModal();
				}
				$('#pageContainer').replaceWith(divClone.clone()); // Restore main with a copy of divClone
				// Reset variables.
				accessibilityIsEmpty = true;
				transitIsEmpty = true;
				descriptionIsEmpty = true;
				isScheduleEmpty = false;
				noImages = true;
				igImages = [];
				resetSliderAfterLibChange();
				igName = '';
				fbPageNames = [];
				fbWidgetSetUp = false;
				triviaIsEmpty = true;
				mapLoaded = false;
				contactsIsEmpty = true;
				noServices = true;
				isReFetching = false;
				isModalCloseBinded = false;
				isServiceClickBinded = false;
				schedulesAreAvailable = true;
				map = L.map('mapContainer');
				mailAddress = null;
				coordinates = null;
				departments = null;
				links = null;
				phoneNumbers = null;
				pictures = null;
				arrayOfServices = null;
				serviceNamesWithLinks = [];
				arrayOfServiceNames = [];
				arrayOfServiceNamesInOppositeLang = [];
				slogan = null;
				email = null;
				description = null;
				transitInfo = null;
				roomCount = 0;
				contactlist = [];
				numbersList = [];
				staffList = [];
				linksIncludeFacebook = false;
				weekMinReached = false;
				weekMaxReached = false;
				mobileSchedulesMoved = false;
				fetchInformation(lang, library);
				// Re-bind navigation and other stuff.
				bindActions();
				if (document.getElementById('sliderBox') != null) {
					detectswipe('sliderBox', swipeNavigation);
				}
				// Adjust parent url.
				adjustParentUrl(libName, 'library');
			}
			if (homePage) {
				if ($('.homepage-widget-week').length === 0) {
					getDaySchelude(0, library);
				} else {
					getWeekSchelude(0, library);
				}
				adjustHomePageHeight(50);
			} else {
				getWeekSchelude(0, library);
			}
			bindScheduleKeyNavigation();
			// Add swiping detection for schedules & sliderbox if available.
			detectswipe('schedules', swipeNavigation);
		}
	});
	$(document).on('click', '.map-library-changer', function () {
		// Trigger the library change.
		$('.library-select').val($(this).val()).trigger('change');
	});
}); // OnReady
