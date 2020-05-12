var isEventsPage = false;
var eventTags = [];
var eventLocations = [];
var allEvents = [];
var filteredEvents = [];
var eventMap;
// Load FA from keski-finna.fi // TO DO; use svg for icons in other locations.
var faPath = "https://keski-finna.fi/external/finna/style/fa/svgs/solid/";

// Function for generating navigation links to event venue.
function generateLinkToTransitInfo(coordinates, street, zipcode, city, text) {
    var linkToTransitInfo = street + ", " + city + "::" + coordinates.lat + ", " + coordinates.lon;
    var infoText = i18n.get("Route and transportation"); //var infoText = text;
    // Use the matka.fi if in Jyväskylä for public transportation details.
    linkToTransitInfo = "https://opas.matka.fi/reitti/POS/" + linkToTransitInfo;
    linkToTransitInfo = encodeURI(linkToTransitInfo); // Matka.fi does not support all cities for public transport details, see: https://www.traficom.fi/fi/asioi-kanssamme/reittiopas
    // Link to Google maps for other cities. TO DO: Use matka.fi api to determine if the location has nearby public transportation.
    if (city !== "Jyväskylä") {
        linkToTransitInfo = "https://www.google.com";
        if (lang === "fi") {
            linkToTransitInfo = "https://www.google.fi";
        }
        linkToTransitInfo = linkToTransitInfo + "/maps/dir//";
        linkToTransitInfo = linkToTransitInfo + street + ", " + zipcode + ", " + city + "/@" + coordinates.lat + ", " + coordinates.lon + ", 15z/";
        infoText = i18n.get("Navigation to location");
    }
    return '<a target="_blank" class="external-navigation-link" href="' + linkToTransitInfo + '">' + infoText + '</a>';
}

function fetchEvents() {
    $.ajax("https://keski-finna.fi/wp-json/acf/v3/events?per_page=500", {
        accepts: {
            xml: "application/json"
        },
        dataType: "json",
        success: function success(data) {
            generateEventList(data);
        },
        error: function error(request, status, _error) {
            console.log(_error);
        },
        complete: function complete() {
            $("#closeEventModal").text(i18n.get("Close"));
        }
    });
} // Generates a list of events for library ID.


function generateEventListForLib(library) {
    var eventList = [];
    for (var i = 0; i < allEvents.length; i++) {
        for (var t = 0; t < allEvents[i].organizers.length; t++) {
            if (allEvents[i].organizers[t].libId == library) {
                eventList.push(allEvents[i]);
            }
        }
    }
    if (eventList.length != 0) {
        $("#eventsTitle").css('display', 'block');
    }
    // Show up to 5 upcoming events. + toggle for more.
    for (var e = 0; e < eventList.length; e++) {
        var showMoreClass = "";
        if (e > 4) {
            showMoreClass = "show-more-events";
        }
        $('#keskiEventsUl').append('<li class="event-li ' + showMoreClass + '" >' + eventList[e].listItem + '</li>');
    }
    // Generate the button for displaying more than 5 events + bind the functionality.
    if (eventList.length > 5) {
        $('#keskiEventsUl').append('<li class="event-li load-more-events">' + '<button class="show-all-events-btn btn-secondary">' + i18n.get('Show all events') + '</button>' + '</li>');
        $(".show-all-events-btn").on('click', function () {
            $('.show-more-events').removeClass('show-more-events');
            $('.show-all-events-btn').hide();
        });
    }

    // TO DO
    // Open the event if url contains an event link.
    var pageUrl = window.location.href;
    if (pageUrl.indexOf('?event=') > -1) {
        // If we use simple indexOf match articles that contain other articles names are problematic,
        // eg. event=test and event=test-2
        var reMatchEvents = new RegExp(/\?event=.*/g);
        var matchingEventInUrl = pageUrl.match(reMatchEvents)[0];

        for (var i = 0; i < allEvents.length; i++) {
            var toMatch = "?event=" + allEvents[i].url;

            if (matchingEventInUrl === toMatch) {
                var toClick = allEvents[i].url;
                setTimeout(function () {
                    $(".events-item").find('[data-url="' + toClick + '"]').click();
                }, 400);
            }
        }
    }

    $(".event-item-link").on('click', function (e) {
        var popupTitle = $(this).data('name');
        var popupText = $(this).data('message');
        var locationText = $(this).data('location-text');
        var locationData = $(this).data('location');
        var locationInfo = $(this).data('location-info');
        var image = $(this).data('image');

        if (image != undefined && image != "") {
            $('#eventImageContainer').css('display', 'block');
        } // Remove multiple spaces


        popupText = popupText.replace(/^(&nbsp;)+/g, ''); // This would remove br from <br>*:  popupText = popupText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
        // Remove empty paragraphs

        popupText = popupText.replace(/(<p>&nbsp;<\/p>)+/g, "");
        popupText = popupText.replace(/(<p><\/p>)+/g, "");
        popupText = popupText.replace(/(<p>\s<\/p>)+/g, ""); // Make all links external.
        popupText = popupText.replace(/(<a href=")+/g, '<a class="external-link" target="_blank" href="');
        /* Generate location info & map. */
        var itemLocation = '<p class="event-detail event-location" aria-label="' + i18n.get("Event location") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'map-marker.svg" class="fa-svg event-details-icon">' + locationText + '</p>';
        $('#modalTitle').replaceWith('<h1 class="modal-title underlined-title" id="modalTitle">' + popupTitle + '</h1>');
        $('#modal').addClass('modal-lg');
        $('#modal').removeClass("modal-small");
        $("#modalContent").replaceWith('<div id="modalContent">' + '<div> ' + '<div class="feed-content">' + '<div class="holder">' + popupText + '</div>' + '</div>' + '</div' + '></div>');

        if (locationText != "Verkkotapahtuma" && locationText != "Web event") {
            $('#eventMapRow').css('display', 'block');
            asyncGenerateEventMap(locationData);
        } else {
            $('#eventMapRow').css('display', 'none');
        }

        $('#eventImageContainer').html('<div id="eventImageContainer">' + image + '</div>'); // Show modal.

        $('#myModal').css({
            position: 'absolute',
            left: 0,
            top: $(this).offset().top - 85 // Element position -85,

        }).animate();
        // Show modal.
        var offSet = e.pageY;
        // If we trigger the click programmatically, e.pageY will be undefined...
        if (offSet === undefined) {
            offSet = e.target;
            // OffsetTop is always about 200 px too little...
            offSet = offSet.offsetTop + 200;
        }
        toggleModal(offSet);
        // TO DO: adjustParentUrl($(this).data('name'), "service"); // Update the page url.
        /*
        var itemUrl = $(this).data('url').toString();
        var currentUrl = window.location.href.toString(); // Do not add to url if already there.

        if (currentUrl.indexOf(itemUrl) === -1) {
            itemUrl = currentUrl + '?event=' + itemUrl;
            var stateObj = {
                urlValue: itemUrl
            };
            history.replaceState(stateObj, popupTitle, itemUrl);
        }
         */
    });
    $("#myModal").on('hide.bs.modal', function () {
        var pageUrl = window.location.href;

        if (pageUrl.indexOf('?event=')) {
            var reMatchEvents = new RegExp(/\?event=.*/g);
            pageUrl = pageUrl.replace(reMatchEvents, '');
            var stateObj = {
                urlValue: pageUrl
            };
            // TO DO: history.replaceState(stateObj, '', pageUrl);
        }
    });
}

function generateEventItem(event, id) {
    // Always set finnish as a fallback.
    var itemStartDate = "";
    var prettyDate = "";
    var organizers = [];
    var customAddress = null;
    var tags = [];
    var tagIdList = [];
    var eventPrice = "";
    var eventLocation = "";
    var eventCityList = [];
    var tagDisplay = "";

    if (event.tags.length !== 0) {
        tags = event.tags;
        for (var t = 0; t < tags.length; t++) {
            var tagsJson = JSON.parse(tags[t]);
            // Add tagID to list,
            tagIdList.push(tagsJson.id);
            if (lang == "fi") {
                var tagEnd = ", ";
                if (t == tags.length - 1 || tags.length == 1) {
                    tagEnd = "";
                }
                else if (t == tags.length - 2) {
                    tagEnd = " & ";
                }
                var casedTag = tagsJson.fi;
                if (t != 0) {
                    casedTag = casedTag.toLowerCase();
                }
                tagDisplay = tagDisplay + casedTag + tagEnd;
            }
            else {
                tagDisplay = tagDisplay + tagsJson.en + ". ";
            }
        }

        tagDisplay = '<span class="event-detail event-tags" aria-label="' + i18n.get("Event category") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Event category") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'tags.svg" class="fa-svg event-details-icon">' + tagDisplay + '</span>';
    } // 10 first chars = date.


    var startDateDay = event.start_date.substr(0, 10); // 5 last chars = time.

    var startDateTime = event.start_date.slice(-5); // If 00.00 = no specified start time.

    if (startDateTime === "00.00") {
        startDateTime = "";
    }

    var startTimeDisplay = '';

    if (startDateTime !== "") {
        startTimeDisplay = '<i class="fa fa-clock-o" aria-hidden="true"></i>' + startDateTime;
        startTimeDisplay = '<img alt="" src="' + faPath + 'calendar.svg" class="fa-svg event-details-icon">' + startDateDay + '<img alt="" src="' + faPath + 'clock.svg" class="fa-svg event-details-icon event-li-clock">' + startDateTime;
    } else {
        startTimeDisplay = '<img alt="" src="' + faPath + 'calendar.svg" class="fa-svg event-details-icon">' + startDateDay;
    }

    var endDateDay = "";
    var endDateTime = "";

    if (event.end_date !== null && event.end_date !== "") {
        endDateDay = event.end_date.substr(0, 10);
        endDateTime = event.end_date.slice(-5); // If 00.00 = no specified start time.

        if (endDateTime === "00.00") {
            endDateTime = "";
        }
    }

    var endDateTimeDisplay = "";

    if (endDateDay !== "") {
        // If ending date is same as starting date.
        if (endDateDay == startDateDay) {
            if (startDateTime == endDateTime) {
                startTimeDisplay = startTimeDisplay + ' alkaen ';
            } else {
                // Ends on same day with a set clock time.
                startTimeDisplay = startTimeDisplay + '<i class="start-end-divider">–</i>' + endDateTime;
            }
        } else {
            var endTimeDisplay = "";
            var endTimeRowSplit = ""; // Ending has a clock time.

            if (endDateTime !== "") {
                endTimeDisplay = '<img alt="" src="' + faPath + 'clock.svg" class="fa-svg event-details-icon event-li-clock">' + endDateTime;
                endTimeRowSplit = '<span class="time-row-splitter" aria-hidden="true"> </span>';
            } // End date


            endDateTimeDisplay = '<i class="start-end-divider">–</i>' + endTimeRowSplit + '<img alt="" src="' + faPath + 'calendar.svg" class="fa-svg event-details-icon"> ' + endDateDay + endTimeDisplay;
        }
    } else {
        if (!startDateTime == "") {
            endDateTimeDisplay = " alkaen";
        }
    }

    var dateDisplayRow = '<span class="event-li-time">' + startTimeDisplay + endDateTimeDisplay;
    '</span>';
    var itemImg = "";

    if (event.image !== null && event.image !== false) {
        itemImg = '<img class="event-image" alt="" src="' + event.image + '">';
    } else {// TO DO: No image...
    }

    var itemTitle = event.title;
    if (lang != "fi" && event.english_title !== null && event.english_title != "") {
        itemTitle = event.english_title;
    }

    var itemContent = event.content;

    if (lang != "fi" && event.english_content !== null && event.english_content != "") {
        itemContent = event.english_content;
    }

    var eventLocation = "";
    var customLocation = "";
    var customLocationObject = [];

    if (event.custom_address) {
        var customLocationData = event.custom_address;
        var customStreet = customLocationData.street_name;
        var customStreetNumber = customLocationData.street_number;
        var customZipcode = customLocationData.post_code;
        var customCity = customLocationData.city; // Google maps returns place name as: Placename, address. If there is no Placename, only address is returned.

        var customPlace = customLocationData.name;
        if (customPlace == undefined) {
            customPlace = "";
        }
        else {
            var startOfPlace = customPlace.slice(0, 4);
            var startOfAddress = customStreet.slice(0, 4);
            if (startOfPlace == startOfAddress) {
                customPlace = customPlace + ', ' + customCity;
            }
        }
        customLocation = customPlace;
        var customCoordinates = {
            lat: customLocationData.lat,
            lon: customLocationData.lng
        };
        var customAddressObject = {
            street: customStreet + ' ' + customStreetNumber,
            zipcode: customZipcode
        };

        if (customCity != null) {//eventCityList.push(customCity);
        }

        customLocationObject.push({
            location: customPlace,
            coordinates: customCoordinates,
            city: customCity,
            address: customAddressObject
        });
    }

    for (var i = 0; i < event.organizer.length; i++) {
        // Check if libraryList contains the ID.
        var organizerIsLibrary = false;

        for (var x = 0; x < libraryList.length; x++) {
            if (event.organizer[i] == libraryList[x].id) {
                // Replace the id with city name.
                var street = libraryList[x].street;
                var zipcode = libraryList[x].zipcode;
                var city = libraryList[x].city;
                var addressObject = {
                    street: street,
                    zipcode: zipcode
                };
                event.organizer[i] = {
                    libId: libraryList[x].id,
                    location: libraryList[x].text,
                    coordinates: libraryList[x].coordinates,
                    city: city,
                    address: addressObject
                };
                eventCityList.push(libraryList[x].city);
                organizerIsLibrary = true;
            }
        }

        if (!organizerIsLibrary) {
            /*
            0 = "Other"
            1 = "Keski-libraries"
            2 = "Web event"
             */
            if (event.organizer[i] == 0) {// TO DO: Other
                //event.organizer[i] = { location: libraryList[x].text, coordinates: libraryList[x].coordinates,
                //    city: libraryList[x].city };
            }
            else if (event.organizer[i] == 1) {
                event.organizer[i] = {
                    location: "Keski-kirjastot",
                    coordinates: null,
                    city: null
                };
            }
            else if (event.organizer[i] == 2) {
                event.organizer[i] = {
                    location: i18n.get('Web event'),
                    coordinates: null,
                    city: null
                };
                eventCityList.push(i18n.get('Web event'));
            }
        }
    }

    if (event.organizer.length > 1) {
        eventLocation = event.organizer.length + " " + i18n.get('event locations');
    }
    else {
        if (event.organizer[0] !== undefined) {
            eventLocation = event.organizer[0].location;
        }
        else {
            // TO DO: No event location?
            eventLocation = i18n.get('Other location');
        }
    }
    // Accessible icons: https://fontawesome.com/how-to-use/on-the-web/other-topics/accessibility
    // Add price where available.
    if (event.price != "") {
        eventPrice = event.price + " €"; //eventPrice = '<span class="event-price">' + eventPrice + '</span>';
        eventPrice = '<span class="event-detail event-price" aria-label="' + i18n.get("Price") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Price") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'money-bill-alt.svg" class="fa-svg event-details-icon">' + eventPrice + '</span>';
    }
    // Website
    var itemLink = "";
    if (event.link_url !== null && event.link_url != "") {
        var prettyUrl = generatePrettyUrl(event.link_url);
        itemLink = '<span class="event-detail event-link" aria-label="' + i18n.get("Website") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Website") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'globe.svg" class="fa-svg event-details-icon"><a href="' + event.link_url + '">' + prettyUrl + '</a></span>';
    }
    // Location
    var locationData = event.organizer;
    if (customLocation !== "") {
        eventLocation = customLocation;
        locationData = customLocationObject;
    }
    var itemLocation = '<span class="event-detail event-location" aria-label="' + i18n.get("Event location") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'map-marker-alt.svg" class="fa-svg event-details-icon">' + eventLocation + '</span>';
    var locationInfo = "";
    var locationHelpText = "";
    if (event.location_info != "" && event.location_info != undefined) {
        locationHelpText = event.location_info;
        if (locationHelpText.charAt(locationHelpText.length - 1) != ".") {
            locationHelpText = locationHelpText + ".";
        }
    }
    if (locationHelpText !== "") {
        locationInfo = '<span class="event-detail event-location-info" aria-label="' + i18n.get("Location information") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Location information") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'location-arrow.svg" class="fa-svg event-details-icon">' + locationHelpText + '</span>';
    }
    // Generate the transit info.
    var linkToNavigation = "";
    var linksToNavigation = []; // TO DO: Multiple locations.
    if (locationData.length == 1) {
        var location = locationData[0];
        if (location.address != null && location.city != null && location.coordinates != null) {
            linkToNavigation = generateLinkToTransitInfo(location.coordinates, location.address.street, location.address.zipcode, location.city) + ". ";
        }
    }
    if (linkToNavigation != "") {
        linkToNavigation = '<span class="event-detail event-transit" aria-label="' + i18n.get("Navigation to location") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Navigation to location") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'directions.svg" class="fa-svg event-details-icon">' + linkToNavigation + '</span>';
    }

    // Generate modal infoboxes.
    var itemInfoBoxes = '<div class="event-info-box">' + dateDisplayRow + tagDisplay + eventPrice + itemLink + itemLocation + locationInfo + linkToNavigation + '</div>';
    itemContent = '<div class="event-content">' + itemContent + itemInfoBoxes + '</div>';
    locationData = JSON.stringify(locationData); // If the event location is the library, do not display this information in the event list.

    var index = libraryList.map(function (o) {
        return o.id;
    }).indexOf(library);

    var selectedLibName = libraryList[index].text;
    if (eventLocation == selectedLibName) {
        itemLocation = "";
    }

    var listItem = '<a id="event-' + id + '" class="event-item-link" href="javascript:void(0);"' + "data-url='" + event.perma_link +
        "' data-image='" + itemImg + "' " + "data-name='" + itemTitle + "' data-message='" + itemContent + "' data-location-text='" +
        eventLocation + "' data-location='" + locationData + "' data-location-info='" + locationInfo + "'>" + '<div class="event-li-details">' +
        '<span class="event-li-title event-detail">' + '<i class="svg-inline--fa fas fa-marker fa-read-me" data-toggle="tooltip" title="" data-placement="top"></i> ' +
        itemTitle + '</span>' + dateDisplayRow + itemLocation + '</div>' + '</a>'; +
        allEvents.push({
            id: id,
            tags: tagIdList,
            city: eventCityList,
            url: event.perma_link,
            organizers: event.organizer,
            listItem: listItem
        });
}

// ARGS: Date in dd.mm.YYYY hh.mm (eq. 17.03.2020 14.00)
function formatEventTimeToDate(rawDate) {
    // 10 first chars = date.
    var startDateDay = rawDate.substr(0, 10); // 5 last chars = time.

    var startDateTime = rawDate.slice(-5);
    var day = startDateDay.substr(0, 2);
    var month = startDateDay.substr(3, 2);
    var year = startDateDay.substr(6, 4);
    var hours = startDateTime.substr(0, 2);
    var minutes = startDateTime.substr(3, 2);
    var standardDate = new Date();
    standardDate.setDate(day);
    standardDate.setMonth(month - 1);
    standardDate.setYear(year);
    standardDate.setHours(0);
    standardDate.setMinutes(1);
    return standardDate;
}

var eventListGenerated = false;

function generateEventList(events) {
    // Sort by start date
    events.sort(function (a, b) {
        var dateA = formatEventTimeToDate(a.acf.start_date),
            dateB = formatEventTimeToDate(b.acf.start_date);
        return dateA - dateB;
    }); // Add each event to event array

    for (var i = 0; i < events.length; i++) {
        generateEventItem(events[i].acf, events[i].id);
    }
    // Set eventListGenerated to true, this will be used in libDetails to fetch per library event generation.
    eventListGenerated = true;
}

var eventMap;
// Leaflet layerGroups are required for clearing multiple event location pointers at once
var layerGroup = null;
function asyncGenerateEventMap(locations) {
    var mapDeferred = jQuery.Deferred();
    setTimeout(function () {
        if (!eventMap) {
            eventMap = L.map('eventMapContainer');
            // Add fallback layer to the default titles in case something goes wrong (err 429 etc.)
            console.log(refUrl);
            if (refUrl.indexOf('finna') > -1) {
                // Blocked for non-finna websites.
                L.tileLayer.fallback('https://map-api.finna.fi/v1/rendered/{z}/{x}/{y}.png').addTo(eventMap);
            }
            else {
                L.tileLayer.fallback('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(eventMap);
            }
            // Limitations: free usage for up to 75,000 mapviews per month, none-commercial services only. For bigger usage and other cases contact CARTO sales for enterprise service key.
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(eventMap);
            // Min/max zoom levels + default focus.
            eventMap.options.minZoom = 6;
            eventMap.options.maxZoom = 18;
            eventMap.setView(["62.750", "25.700"], 10.5);
            layerGroup = L.layerGroup().addTo(eventMap);
            // Set the contribution text.
            $('.leaflet-control-attribution').replaceWith('<div class="leaflet-control-attribution leaflet-control">' +
                '© <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a target="_blank" href="https://carto.com/attributions">CARTO</a></div>');
        }
        else {
            layerGroup.clearLayers();
        }
        var lastCoordinates = null;
        var markerIcon = L.divIcon({
            html: '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" alt="" ' + 'src="' + faPath + 'book-reader.svg" class="fa-svg fa-leaflet-map-marker">',
            iconSize: [24, 24],
            popupAnchor: [0, 3],
            // point from which the popup should open relative to the iconAnchor
            //popupAnchor:  [-88, 3], // point from which the popup should open relative to the iconAnchor
            className: 'event-map-marker'
        });

        function addCoordinatesToMap() {
            var addCoordinatesDeferred = jQuery.Deferred();
            setTimeout(function () {
                if (locations.length !== 0) {
                    var counter = 0; // create markers
                    // remove all the markers in one go

                    for (var i = 0; i < locations.length; i++) {
                        var text = '';
                        var placeName = locations[i].location;

                        if (placeName == "Verkkotapahtuma" || placeName == "Web event") {
                            $('#eventMapRow').css('display', 'none');
                            addCoordinatesDeferred.resolve();
                            return;
                        }

                        if (locations[i].address != undefined) {
                            if (placeName.indexOf(locations[i].address.street) > -1) {
                                placeName = "";
                            } else {
                                placeName = '<strong>' + locations[i].location + '</strong><br>';
                            }
                        } else {
                            placeName = '<strong>' + locations[i].location + '</strong><br>';
                        }

                        var text = placeName + locations[i].address.street + ', <br>' + locations[i].address.zipcode + ', ' + locations[i].city;

                        if (locations[i].coordinates != null) {
                            L.marker([locations[i].coordinates.lat, locations[i].coordinates.lon], {
                                icon: markerIcon
                            }).addTo(layerGroup).bindPopup(text, {
                                autoClose: false,
                                autoPan: false
                            }).openPopup();
                        }

                        counter = counter + 1;

                        if (counter === locations.length) {
                            lastCoordinates = {
                                lat: locations[i].coordinates.lat,
                                lon: locations[i].coordinates.lon
                            };
                            eventMap.whenReady(function () {
                                setTimeout(function () {
                                    eventMap.invalidateSize();
                                    eventMap.setView([lastCoordinates.lat, lastCoordinates.lon], 10.5);
                                    // Open popups
                                    layerGroup.eachLayer(function (layer) {
                                        layer.openPopup();
                                    });
                                }, 250);
                            });
                            addCoordinatesDeferred.resolve();
                        }
                    }
                }
            }, 1); // Return the Promise so caller can't change the Deferred
            return addCoordinatesDeferred.promise();
        }

        $.when(addCoordinatesToMap()).then(function () {
            mapDeferred.resolve();
        });
    }, 1); // Return the Promise so caller can't change the Deferred
    return mapDeferred.promise();
}
