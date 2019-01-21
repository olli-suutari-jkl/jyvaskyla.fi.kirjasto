// Variables
var jsonp_url = "https://api.kirjastot.fi/v3/library/" + library + "?lang=" + lang;
var jsonpUrlV4 = "https://api.kirjastot.fi/v4/library/" + library + "?lang=" + lang;
var transitIsEmpty = true;
var descriptionIsEmpty = true;
var isReFetching = false;
var contactsIsEmpty = true;
var noServices = true;
var indexItemClicked = false;
var lon;
var lat;
var mapLoaded = false;
var contactlist = [];
var numbersList = [];
var staffList = [];
/* Functions for checking if name or contact detail exists in arrays with keys "name" and "contact".
   IEC CRASHES: if (contactlist.findIndex(x => x.contact==data.phone_numbers[i].number) === -1){
   https://stackoverflow.com/questions/37698996/findindex-method-issue-with-internet-explorer */
function checkIfNameExists(array, item) {
    for (var i = 0; i < array.length; ++i) {
        if (array[i].name == item) {
            return true;
        }
    }
    return false;
}
function checkIfContactExists(array, item) {
    for (var i = 0; i < contactlist.length; ++i) {
        if (contactlist[i].contact == item) {
            return true;
        }
    }
    return false;
}

/* Fetch generic details and generate the UI */
function asyncFetchGenericDetails() {
    var genericDeferred = jQuery.Deferred();
    setTimeout(function() {
        $.getJSON(jsonp_url + "&with=extra", function (data) {
            if ($("#blockquote").is(':empty')) {
                if (data.extra.slogan !== null && data.extra.slogan.length !== 0) {
                    $("#blockquote").append(' <blockquote class="blockquote library-slogan">' + data.extra.slogan + '</blockquote>');
                }
            }
            if (isEmpty($('#introContent'))) {
                var description = data.extra.description;
                if (description != null && description.length !== 0) {
                    // Turn bolded Ajankohtaista/Tervetuloa to <h2>
                    description = description.replace("<strong>Ajankohtaista</strong>", "<h2>Ajankohtaista</h2>");
                    description = description.replace("<p><h2>Ajankohtaista</h2></p>", "<h2>Ajankohtaista</h2>");
                    description = description.replace("<strong>Tervetuloa kirjastoon!</strong>", "<h2>Tervetuloa kirjastoon!</h2>");
                    description = description.replace("<p><h2>Tervetuloa kirjastoon!</h2></p>", "<h2>Tervetuloa kirjastoon!</h2>");
                    // Remove <br> and it's variations since everything is inside <p> anyways...
                    // https://stackoverflow.com/questions/4184272/remove-all-br-from-a-string
                    description = description.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
                    // Remove multiple spaces
                    description = description.replace(/^(&nbsp;)+/g, '');
                    // Remove empty paragraphs
                    description = description.replace(/(<p>&nbsp;<\/p>)+/g, "");
                    // Add target="_blank" to links. Same url links would open inside Iframe, links to outside  wouldn't work.
                    description = description.replace(/(<a )+/g, '<a target="_blank" ');
                    $("#introContent").append(description);
                    descriptionIsEmpty = false;
                }
            }
            if (isEmpty($('#genericTransit'))) {
                if (data.extra.transit.transit_directions != null && data.extra.transit.transit_directions.length != 0) {
                    transitIsEmpty = false;
                    $('.transit-details').css('display', 'block');
                    $('#navYhteystiedot').css('display', 'block');
                    $('#genericTransit').append('<h4>' + i18n.get("Ohjeita liikenteeseen") + '</h4><p>' + data.extra.transit.transit_directions.replace(/(<a )+/g, '<a target="_blank" ') + '</p>')
                }
                if (data.extra.transit.buses != null && data.extra.transit.buses !== "") {
                    transitIsEmpty = false;
                    $('.transit-details').css('display', 'block');
                    $('#navYhteystiedot').css('display', 'block');
                    $('#genericTransit').append('<h4>' + i18n.get("Linja-autot") + ':</h4><p>' + data.extra.transit.buses + '</p>')
                }
            }
            if (isEmpty($('#parkingDetails'))) {
                if (data.extra.transit.parking_instructions != null && data.extra.transit.parking_instructions !== "") {
                    transitIsEmpty = false;
                    $('.transit-details').css('display', 'block');
                    // Replace row splits with <br>
                    var parking_instructions = data.extra.transit.parking_instructions.replace(/\r\n/g, "<br>");
                    $('#parkingDetails').append('<h4>' + i18n.get("Pysäköinti") + '</h4><p>' + parking_instructions + '</p>')
                }
            }
            // Table
            var triviaIsEmpty = true;
            if (isEmpty($('#buildingDetails')) && !isReFetching) {
                // If display none by default, colspan gets messed up.
                $('#triviaTitle').append( i18n.get("Tietoa kirjastosta"));
                if (data.extra.founded != null) {
                    triviaIsEmpty = false;
                    $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Perustamisvuosi") + ': </strong></td>' +
                        '<td class="trivia-detail">' + data.extra.founded + '</td></tr>');
                }
                if (data.extra.building.building_name != null) {
                    triviaIsEmpty = false;
                    $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Rakennus") + ': </strong></td>' +
                        '<td class="trivia-detail">' + data.extra.building.building_name + '</td></tr>');
                }
                if (data.extra.building.construction_year != null && data.extra.building.construction_year != 0) {
                    triviaIsEmpty = false;
                    $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Rakennettu") + ': </strong></td>' +
                        '<td class="trivia-detail">' + data.extra.building.construction_year + '</td></tr>');
                }
                if (data.extra.building.building_architect != null) {
                    triviaIsEmpty = false;
                    $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Arkkitehti") + ': </strong></td>' +
                        '<td class="trivia-detail">' + data.extra.building.building_architect + '</td></tr>');
                }
                if (data.extra.building.interior_designer != null) {
                    triviaIsEmpty = false;
                    $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Sisustus") + ': </strong></td>' +
                        '<td class="trivia-detail">' + data.extra.building.interior_designer + '</td></tr>');
                }
                if (triviaIsEmpty) {
                    $("#triviaTitle").css("display", "none");
                }
            }

            // Hide news/description toggler if no transit details && not on mobile.
            else if (lang === "fi" && $(window).width() < 500) {
                if (!descriptionIsEmpty) {
                    $("#newsDescriptionToggle").css("display", "block");
                }
            }
            // Update the title to match data.name.
            if(document.title !== data.name && !isReFetching) {
                if(data.name != null) {
                    document.title = data.name;
                }
            }
            genericDeferred.resolve()
        });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return genericDeferred.promise();
}

//var isSet = false;
// Fetch services & generate the UI
function asyncFetchServices() {
    var servicesDeferred = jQuery.Deferred();
    setTimeout(function() {
        $.getJSON(jsonp_url + "&with=services", function (data) {
            var collectionCount = 0;
            var hardwareCount = 0;
            var roomCount = 0;
            var serviceCount = 0;
            var collections = [];
            var hardware = [];
            var rooms = [];
            var services = [];
            accessibilityCount = 0;
            var roomsAndCollectionsAdded = true;
            var hardwareAndServicesAdded = true;
            var accessibilityAdded = false;
            if (isEmpty($('#collectionItems'))) {
                roomsAndCollectionsAdded = false;
            }
            if (isEmpty($('#roomsAndCollectionsItems'))) {
                roomsAndCollectionsAdded = false;
            }
            if (isEmpty($('#hardwareAndServicesItems'))) {
                hardwareAndServicesAdded = false;
            }
            if (isEmpty($('#accessibilityItems'))) {
                accessibilityAdded = false;
            }
            for (var i = 0; i < data.services.length; i++) {
                // Collections
                if (data.services[i].name != null && data.services[i].name.length != 0 || data.services[i].custom_name != null) {
                    if (data.services[i].type == "collection") {
                        if (!roomsAndCollectionsAdded) {
                            collectionCount = collectionCount + 1;
                            collections.push(data.services[i]);
                            roomCount = roomCount + 1;
                        }
                    }
                    // Rooms
                    else if (data.services[i].type == "room") {
                        if (!roomsAndCollectionsAdded) {
                            roomCount = roomCount + 1;
                            rooms.push(data.services[i]);
                        }
                    }
                    // Hardware
                    else if (data.services[i].type == "hardware") {
                        if (!hardwareAndServicesAdded) {
                            hardwareCount = hardwareCount + 1;
                            serviceCount = serviceCount + 1;
                            hardware.push(data.services[i]);
                        }
                    }
                    // Services
                    else if (data.services[i].type == "service") {
                        if(data.services[i].name === "Esteettömyyspalvelut" || data.services[i].name === "Accessibility services") {
                            // Set accessibility added to true, this is used to display "Services" tab if other tabs are missing.
                            if(!accessibilityAdded) {
                                accessibilityAdded = true;
                                // Accessibility count is increased in the function.
                                addItem(data.services[i], '#accessibilityItems');
                            }
                        }
                        else {
                            if (!hardwareAndServicesAdded) {
                                serviceCount = serviceCount + 1;
                                services.push(data.services[i]);
                            }
                        }
                    }
                }
            }
            // Generate list items... Do it here display them in the right order...
            for (var x=0; x<rooms.length; x++) {
                addItem(rooms[x], '#roomsAndCollectionsItems');
            }
            for (var x=0; x<collections.length; x++) {
                addItem(collections[x], '#roomsAndCollectionsItems');
            }
            for (var x=0; x<hardware.length; x++) {
                addItem(hardware[x], '#hardwareAndServicesItems');
            }
            for (var x=0; x<services.length; x++) {
                addItem(services[x], '#hardwareAndServicesItems');
            }
            // Show titles & counts if found.
            if (roomCount != 0 || collectionCount != 0) {
                $("#roomsAndCollections").css('display', 'block');
                if(roomCount != 0 && collectionCount != 0) {
                    $("#roomsAndCollectionsTitle").prepend(i18n.get("Tilat ja kokoelmat"));
                }
                else if(roomCount != 0) {
                    $("#roomsAndCollectionsTitle").prepend(i18n.get("Tilat"));
                }
                else {
                    $("#roomsAndCollectionsTitle").prepend(i18n.get("Kokoelmat"));
                }
                $("#roomsAndCollectionsBadge").append('(' + roomCount + ')');
                noServices = false;
            }
            if (serviceCount != 0 || hardwareCount != 0) {
                $("#hardwareAndServices").css('display', 'block');
                if(serviceCount != 0 && hardwareCount != 0) {
                    $("#hardwareAndServicesTitle").prepend(i18n.get("Laitteet ja palvelut"));
                }
                else if(hardwareCount != 0) {
                    $("#hardwareAndServicesTitle").prepend(i18n.get("Laitteisto"));
                }
                else {
                    $("#hardwareAndServicesTitle").prepend(i18n.get("Palvelut"));
                }
                $("#hardwareAndServicesBadge").append('(' + serviceCount + ')');
                noServices = false;
            }
            if (!roomsAndCollectionsAdded || !hardwareAndServicesAdded || !accessibilityAdded) {
                if (noServices) {
                    if (lang == "fi") {
                        //$('#servicesInfo').append(i18n.get("Ei palveluita"));
                        // Hide the whole navigation if no contact details are listed either...
                        if (contactsIsEmpty && isEmpty($('#staffMembers')) && isEmpty($('#contactsTbody'))) {
                            $('.nav-pills').css('display', 'none');
                        }
                    }
                } else {
                    $('#navEsittely').css('display', 'block');
                    // Add event listener for clicking links.
                    $(".index-item").on('click', function () {
                        if (!indexItemClicked) {
                            indexItemClicked = true;
                            // If infobox already visible, hide it instantly to avoid wonky animations.
                            if (isInfoBoxVisible) {
                                toggleInfoBox(0);
                            }
                            // If website is not null and contains stuff. Sometimes empty website is shown unless lenght is checked.
                            if ($(this).data('website') !== null && $(this).data('website') !== "undefined" && $(this).data('website').length > 5) {
                                // Use _blank, because iframes don't like moving to new pages.
                                $("#linkToInfo").replaceWith('<p id="linkToInfo"><a target="_blank" href="' + $(this).data('website') +
                                    '" class="external-link">' + i18n.get("Lisätietoja") + '</a></p>');
                            } else {
                                $("#linkToInfo").replaceWith('<p id="linkToInfo"></p>');
                            }

                            var popupText = $(this).data('message');
                            // Check the description for links.
                            if(popupText.indexOf("LINKSTART") !== -1) {
                                popupText = popupText.replace(/(LINKSTART)+/g, '<a class="external-link" target="_blank" href="');
                                popupText = popupText.replace(/(URLEND)+/g, '">');
                                popupText = popupText.replace(/(LINKEND)+/g, '<\/a>');
                            }

                            popupText = popupText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
                            // Remove multiple spaces
                            popupText = popupText.replace(/^(&nbsp;)+/g, '');
                            // Remove empty paragraphs
                            popupText = popupText.replace(/(<p>&nbsp;<\/p>)+/g, "");
                            popupText = popupText.replace(/(<p><\/p>)+/g, "");
                            popupText = popupText.replace(/(<p>\s<\/p>)+/g, "");

                            if(popupText.length > 175) {
                                $('#modal').addClass("modal-lg");
                                $('#modal').css("text-align", "left");
                            }
                            else {
                                $('#modal').removeClass("modal-lg");
                                $('#modal').css("text-align", "center");
                            }


                            $("#modalContent").replaceWith('<div id="modalContent"><p>' + popupText + '</p></div>');


                            // Check if text contains headers..
                            if(popupText.indexOf("<h") !== -1) {
                                $("#modalTitle").replaceWith('<h1 id="modalTitle" class="modal-title underlined-title">' +
                                    $(this).data('name') + '</h1>');
                            }
                            else {
                                $("#modalTitle").replaceWith('<h1 id="modalTitle" class="modal-title modal-title-small underlined-title">' +
                                    $(this).data('name') + '</h1>');
                            }

                            // Check if text contains headers..
                            if(popupText.indexOf("<h") !== -1) {
                                $('#modalTitle').removeClass("modal-title-small");
                            }
                            else {
                                $('#modalTitle').addClass("modal-title-small");
                            }


                            // Define these here, won't work inside  hide.bs.modal event.
                            var offsetTop = $(this)[0].offsetTop;
                            var offsetLeft = $(this)[0].offsetLeft;


                            /*
                            if(!isSet) {
                                isSet = true
                                $('#myModal').on('show.bs.modal', function (e) {
                                    var is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                                    if(is_safari || navigator.userAgent.match(/iPhone/i) ||
                                        navigator.userAgent.match(/ipad/i) ||
                                        navigator.userAgent.match(/iPod/i)) {
                                        // block scroll for mobile;
                                        // causes underlying page to jump to top;
                                        // prevents scrolling on all screens

                                        $('.modal-open').css('overflow', 'hidden');
                                        $('.modal-open').css('position', 'fixed');
                                        $('body.modal-open').css('overflow', 'hidden');
                                        $('body.modal-open').css('position', 'fixed');
                                        alert("IS IOS");

                                    }
                                });
                            }
                            */



                            // Show modal, bind hiding event.
                            $('#myModal').modal();



                            // Add timeout. This prevents duplicated click events if we have changed library.
                            setTimeout(function()
                            {

                                $('#myModal').on('hide.bs.modal', function (e) {
                                    window.scrollTo(offsetLeft, offsetTop);
                                });
                                indexItemClicked = false;
                                //$('#myModal').modal('handleUpdate')
                            }, 50);
                        }
                    });
                }
                if(noServices) {
                    $('#libraryServices').css('display', 'none');
                    // If no content is provided for the left collumn.
                    if (descriptionIsEmpty && lang === "fi") {
                        // Hide the content on left, make the sidebar 100% in width.
                        $(".details").css("display", "none");
                        $("#leftBar").css("display", "none");

                        $("#introductionSidebar").addClass("col-md-12");
                        $("#introductionSidebar").removeClass("col-lg-5 col-xl-4 order-2 sidebar");
                    }
                }
            }
            servicesDeferred.resolve();
        }); // Palvelut
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return servicesDeferred.promise();
}

function asyncFetchDepartments() {
    var departmentsDeferred = jQuery.Deferred();
    setTimeout(function() {
        // https://stackoverflow.com/questions/309953/how-do-i-catch-jquery-getjson-or-ajax-with-datatype-set-to-jsonp-error-w
        $.getJSON(jsonpUrlV4 + "&with=departments",
            function(data){
                var data = data.data.departments;
                // If no pictures found, hide the slider...
                if (data.length === 0) {
                    departmentsDeferred.resolve()
                }
                else {
                    for (var i = 0; i < data.length; i++) {
                        // Collections
                        addItem(data[i], '#roomsAndCollectionsItems');
                    }
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                    console.log("Fetching of departments failed: " + textStatus + ": " + errorThrown);
            })
            .always(function() {
                departmentsDeferred.resolve();
            });

    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return departmentsDeferred.promise();
}


function generateImages(data) {
    var imageListDeferred = jQuery.Deferred();
    var counter = 0;
    setTimeout(function() {
        for (var i = 0; i < data.pictures.length; i++) {
            var altCount = i + 1;
            // Use medium image size, large scales smaller images a lot...
            var altText = i18n.get("Kuva kirjastolta") + ' (' + altCount + '/' + data.pictures.length + ')';
            $(".rslides").append('<li><img src="' + data.pictures[i].files.medium + '" alt="' + altText + '"></li>');
            counter = counter +1;
            if(counter === data.pictures.length) {
                imageListDeferred.resolve();
            }
        }
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return imageListDeferred.promise();
}

function asyncFetchImages() {
    var imagesDeferred = jQuery.Deferred();
    setTimeout(function() {
            $.getJSON(jsonp_url + "&with=pictures", function (data) {
                // If no pictures found, hide the slider...
                if (data.pictures.length === 0) {
                    $('#sliderBox').css('display', 'none');
                    imagesDeferred.resolve();
                }
                $.when( generateImages(data) ).then  (
                    function() {
                        $('#currentSlide').html(1);
                        $('.top-left').append('/' + data.pictures.length);
                        //$('.top-left').replaceWith('<i class="top-left"><span id="currentSlide"></span></i>/' + data.pictures.length);
-
                        $(".rslides").responsiveSlides({
                            navContainer: "#sliderBox" // Selector: Where controls should be appended to, default is after the 'ul'
                        });
                        // Exit fullscreen if clicking the .rslides and not within 75px range from the center.
                        $('.rslides').on('click', function () {
                            if (!$("#sliderBox").hasClass("small-slider")) {
                                var centerPos = $(window).scrollTop() + $(window).height() / 2;
                                if (!(event.clientY >= centerPos - 75 && event.clientY <= centerPos + 75)) {
                                    toggleFullScreen("#sliderBox");
                                }
                            }
                        });
                        // Ignore clicks on selected image && add hover class.
                        // We re-do this in responsiveslides.js every time the image is changed.
                        $(".rslides1_on").click(function (event) {
                            event.stopPropagation();
                            $("#sliderBox").addClass('hovering');
                        });
                        // Activate arrow navigation when hovering over the small slider.
                        $("#sliderBox").mouseenter(function () {
                            if (!$("#sliderBox").hasClass('hovering') && $("#sliderBox").hasClass("small-slider")) {
                                // If element is never focused, navigation may not work.
                                $("#sliderBox").addClass('hovering');
                                $("#sliderForward").focus();
                                // If we blur instantly, arrow navigation won't work unless something has been clicked in the document.
                                setTimeout(function () {
                                    $("#sliderForward").blur();
                                }, 5);
                                //$("#sliderForward").blur();
                            }
                        });
                        $("#sliderBox").mouseleave(function () {
                            if ($("#sliderBox").hasClass('hovering') && $("#sliderBox").hasClass("small-slider")) {
                                $("#sliderBox").removeClass('hovering');
                            }
                        });
                        $( "#expandSlider" ).on('click', function () {
                            toggleFullScreen('#sliderBox');
                        });
                        imagesDeferred.resolve()
                    }
                );
            });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return imagesDeferred.promise();
}

function asyncFetchLocation() {
    var locationDeferred = jQuery.Deferred();
    setTimeout(function() {
        $.getJSON(jsonp_url + "&with=mail_address", function (data) {
            if (data.address != null) {
                contactsIsEmpty = false;
                if (isEmpty($('#streetAddress'))) {
                    if (data.address.street != null && data.address.zipcode != null && data.address.city != null) {
                        $("#streetAddress").append(data.name + '<br>' + data.address.street + '<br>' + data.address.zipcode + ' ' + data.address.city);
                    }
                }
                if (isEmpty($('#postalAddress'))) {
                    if (data.mail_address != null && data.mail_address.area != null) {
                        var boxNumber = '';
                        // Use boxNumber, if null use address
                        if (data.mail_address.box_number !== null) {
                            boxNumber = 'PL ' + data.mail_address.box_number;
                        }
                        else {
                            boxNumber = data.address.street;
                        }
                        // Generate postal address based on available data.
                        var postalString = '';
                        if(data.name !== null && data.name.length !== 0) {
                            postalString += data.name + '<br>';
                        }
                        if(boxNumber != null && boxNumber.length !== 0) {
                            postalString += boxNumber + '<br>';
                        }
                        if(data.mail_address.zipcode !== null && data.mail_address.zipcode.length !== 0) {
                            postalString += data.mail_address.zipcode + ' ';
                        }
                        if(data.mail_address.area !== null && data.mail_address.area.length !== 0) {
                            postalString += data.mail_address.area;
                        }
                        if(postalString !== data.name + '<br>') {
                            $("#postalAddress").append(postalString);
                        }
                    }
                    else {
                        // If no postal address, hide header & increase map size.
                        $("#contactsFirstCol").addClass( "col-md-5");
                        $("#contactsFirstCol").removeClass( "col-md-7" );
                        $("#contactsMapCol").addClass( "col-md-7");
                        $("#contactsMapCol").removeClass( "col-md-5" );
                        $("#postalTh").css('display', 'none');
                    }
                }
                // Get coordinates to be used in loadMap function.
                // Map coordinates (marker)
                if (data.address.coordinates != null) {
                    lon = data.address.coordinates.lon;
                    lat = data.address.coordinates.lat;
                }
            }
            if (data.email != null && data.email.length !== 0) {
                contactsIsEmpty = false;
                if(!checkIfContactExists(contactlist, data.email)) {
                    contactlist.push({name: i18n.get("Oletussähköposti"), contact: data.email});
                }
            }
            // Show navigation if content.
            if (!contactsIsEmpty) {
                $('#navEsittely').css('display', 'block');
                $('#navYhteystiedot').css('display', 'block');
            }
            locationDeferred.resolve();
        });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return locationDeferred.promise();
}

function asyncLoadMap() {
    var mapDeferred = jQuery.Deferred();
    setTimeout(function() {
        // Load wikimedia map styles instead of openstreetmap.
        //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        // https://wiki.openstreetmap.org/wiki/Tiles
        L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png').addTo(map);
        //L.tileLayer.provider('Wikimedia').addTo(map);
        // Min/max zoom levels + default focus.
        map.options.minZoom = 6;
        map.options.maxZoom = 17.9;
        // Set the contribution text.
        $('.leaflet-control-attribution').replaceWith('<div class="leaflet-control-attribution leaflet-control">© <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</div>');
        function addCoordinatesToMap() {
            var addCoordinatesDeferred = jQuery.Deferred();
            setTimeout(function() {
            if(libraryList.length !== 0) {
                var markerIcon = L.icon({
                    // https://material.io/tools/icons/?style=baseline
                    iconUrl: '../images/icons/local_library.svg',
                    popupAnchor:  [-9, -4], // point from which the popup should open relative to the iconAnchor
                    iconSize:     [28, 28], // size of the icon
                });
                var counter = 0;
                for (var i = 0; i < libraryList.length; i++) {
                    var text = '<strong>' + libraryList[i].text + '</strong><br>' +
                        libraryList[i].street + ', <br>' + libraryList[i].zipcode + ', ' + libraryList[i].city +
                        '<br><button type="button" value="' + libraryList[i].id + '" class="map-library-changer btn btn-md btn-primary py-0 mb-3">' +
                        i18n.get("Hae tiedot") + '</button>';
                    if(libraryList[i].id == library) {
                        text = '<strong>' + libraryList[i].text + '</strong><br>' +
                            libraryList[i].street + ', <br>' + libraryList[i].zipcode + ', ' + libraryList[i].city;
                        // Add a notification text about missing coordinates for map.
                        if(libraryList[i].coordinates === null) {
                            $('#contactsMapCol').prepend('<div id="noCoordinates">' + i18n.get("Huom") + '! ' + libraryList[i].text.toString() + i18n.get("Ei koordinaatteja") + '</div>');
                            var container = document.getElementById('contactsMapCol');
                            container.style.height = (container.offsetHeight + 70) + "px";
                            var noCoordinatesHeight = $('#noCoordinates').height();
                            noCoordinatesHeight = noCoordinatesHeight + 20; // Add margin.
                            var mapContainer = document.getElementById('mapContainer');
                            mapContainer.style.height = (mapContainer.offsetHeight + -noCoordinatesHeight) + "px";
                        }
                    }
                    if (libraryList[i].coordinates != null) {
                        L.marker([libraryList[i].coordinates.lat, libraryList[i].coordinates.lon], {icon: markerIcon}).addTo(map)
                            .bindPopup(text)
                            .openPopup();
                    }
                    counter = counter +1;
                    if(counter === libraryList.length){
                        addCoordinatesDeferred.resolve();
                    }
                }
            }
            else {
                // Use larger icon for a single library pages.
                var markerIcon = L.icon({
                    // https://material.io/tools/icons/?style=baseline
                    iconUrl: '../images/icons/local_library.svg',
                    popupAnchor:  [-11, -5], // point from which the popup should open relative to the iconAnchor
                    iconSize:     [42, 42], // size of the icon
                });
                L.marker([lat, lon], {icon: markerIcon}).addTo(map)
                    .bindPopup(document.title)
                    .openPopup();
                addCoordinatesDeferred.resolve();
            }
        }, 1 );
        // Return the Promise so caller can't change the Deferred
        return addCoordinatesDeferred.promise();
    }
    $.when( addCoordinatesToMap() ).then(
        function() {

            // If we are in the contacts tab, set map view.
            if(activeTab === 1) {
                // If we try to set view & open the popup in asyncLoadMap, things get messed.
                map.setView([lat, lon], 15);
                // Open popup
                map.eachLayer(function (layer) {
                    if(layer._latlng !== undefined) {
                        if(layer._latlng.lat == lat) {
                            layer.fire('click');
                        }
                    }
                });
            }
            mapDeferred.resolve();
        });

    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return mapDeferred.promise();
}

function asyncFetchLinks() {
    var linksDeferred = jQuery.Deferred();
    setTimeout(function() {
        // Social media links
        $.getJSON(jsonp_url + "&with=links", function (data) {
            var linkCount = 0;
            // Loop the links of group category [0].
            var loopCounter = 0;
            if(data.links.length === 0) {
                linksDeferred.resolve();
            }
            data.links.forEach(function (element) {
                // Get url.
                var url = element.url;
                if (url === null) {
                    return
                }
                if (url.indexOf("facebook") !== -1) {
                    linkCount = linkCount +1;
                    $(".some-links").append('<a target="_blank" ' +
                        'href="' + url + '" title="' + element.name + '"> <img src="../images/icons/facebook.svg" alt="' +
                        i18n.get("Kirjaston") + ' Facebook"/>' +
                        '</a>');
                }
                else if (url.indexOf("instagram") !== -1) {
                    linkCount = linkCount +1;
                    $(".some-links").append('<a target="_blank" ' +
                        'href="' + url + '" title="' + element.name + '"> <img src="../images/icons/instagram.svg" alt="' +
                        i18n.get("Kirjaston") + ' Instagram"/>' +
                        '</a>');
                }
                else {
                    // Add the link to the contact details listing
                    // https://stackoverflow.com/questions/41942690/removing-http-or-http-and-www/41942787
                    // Check if refurl contains url, when we remove http / www & ending from it.
                    if(refUrl.length === 0 || url.indexOf(refUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]) === -1) {
                        // Remove httml & www
                        var prettyUrl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
                        // Remove / and # from url if last characters
                        if (prettyUrl.substring(prettyUrl.length-1) === "/" || prettyUrl.substring(prettyUrl.length-1) === "#") {
                            prettyUrl = prettyUrl.substring(0, prettyUrl.length-1);
                        }
                        // Generate the link
                        prettyUrl = '<a target="_blank" href="' + url + '">' + prettyUrl + '</a>';

                        if(!checkIfContactExists(contactlist, prettyUrl) && !checkIfNameExists(contactlist, element.name)) {
                            contactlist.unshift({name: element.name,
                                contact: prettyUrl});
                            linkCount = linkCount +1;
                        }
                    }
                }
                loopCounter = loopCounter +1;
                if(loopCounter === data.links.length) {
                    // Mention links in title, if any are present.
                    if(linkCount !== 0 ) {
                        $('#contactsTitle').append('<span>' + i18n.get("Linkit ja yhteystiedot") + '</span>');
                    } else {
                        $('#contactsTitle').append('<span>' + i18n.get("Yhteystiedot") + '</span>');
                    }
                    linksDeferred.resolve();
                }
            });
        });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return linksDeferred.promise();
}

function asyncFetchNumbers() {
    var numbersDeferred = jQuery.Deferred();
    setTimeout(function() {
        var counter = 0;
        $.getJSON(jsonp_url + "&with=phone_numbers", function (data) {
            if(data.phone_numbers.length !== 0) {
                for (var i = 0; i < data.phone_numbers.length; i++) {
                    // Check if detail is unique.
                    if(!checkIfContactExists(numbersList, data.phone_numbers[i].number)) {
                        numbersList.push({name: data.phone_numbers[i].name, contact: data.phone_numbers[i].number});
                    }
                    counter = counter +1;
                }
                // If we have looped all, set as resolved, thus moving on.
                if(counter === data.phone_numbers.length) {
                    $.when(
                        // Sort alphabetically. https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
                        numbersList.sort(function(a, b){
                            var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
                            if (nameA < nameB) //sort string ascending
                                return -1;
                            if (nameA > nameB)
                                return 1;
                            return 0; //default return value (no sorting)
                        })
                    ).then  (
                        numbersDeferred.resolve()
                    );
                }
            }
            // Resolve, if no length.
            else if(data.phone_numbers === undefined || data.phone_numbers.length === 0) {
                numbersDeferred.resolve()
            }
        });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return numbersDeferred.promise();
}

function asyncFetchStaff() {
    var staffDeferred = jQuery.Deferred();
    setTimeout(function() {
        var counter = 0;
        $.getJSON(jsonp_url + "&with=persons", function (data) {
            if(data.persons.length !== 0) {
                for (var i = 0; i < data.persons.length; i++) {
                    var name = data.persons[i].first_name + ' ' + data.persons[i].last_name;
                    if (data.persons[i].job_title !== null) {
                        name += ' – ' + data.persons[i].job_title;
                    }
                    // Check if name or detail is unique.
                    if (!checkIfContactExists(staffList, data.persons[i].email) || !checkIfNameExists(staffList, name)){
                        staffList.push({name: name, contact: data.persons[i].email});
                    }
                    counter = counter +1;
                }
                // If we have looped all, set as resolved, thus moving on.
                if(counter === data.persons.length) {
                    // Sort alphabetically. https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
                    $.when(
                        staffList.sort(function(a, b){
                            var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
                            if (nameA < nameB) //sort string ascending
                                return -1;
                            if (nameA > nameB)
                                return 1;
                            return 0; //default return value (no sorting)
                        })
                    ).then  (
                        staffDeferred.resolve()
                    );
                }
            }
            else {
                staffDeferred.resolve()
            }
        });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return staffDeferred.promise();
}

// Fetch numbers & staff, then generate the list.
function generateContacts() {
    var contactsDeferred = jQuery.Deferred();
    setTimeout(function() {
        if (isEmpty($('#contactsTbody'))) {
            $.when( asyncFetchNumbers(), asyncFetchStaff() ).then  (
                function() {
                    if(contactlist.length === 0 && staffList.length === 0 && numbersList.length === 0) {
                        contactlist.push({name: i18n.get("Ei yhteystietoja"), contact: ""});
                    }
                    for (var i = 0; i < contactlist.length; i++) {
                        var contactDetail = "";
                        if(contactlist[i].contact != null) {
                            contactDetail = contactlist[i].contact;
                        }
                        $("#contactsTbody").append('<tr>' +
                            '<td>' + contactlist[i].name + '</td>' +
                            '<td>' + contactDetail + '</td>' +
                            '</tr>');
                    }
                    for (var i = 0; i < staffList.length; i++) {
                        var contactDetail = "";
                        if(staffList[i].contact != null) {
                            contactDetail = staffList[i].contact;
                        }
                        $("#contactsTbody").append('<tr>' +
                            '<td>' + staffList[i].name + '</td>' +
                            '<td>' + contactDetail + '</td>' +
                            '</tr>');
                    }
                    for (var i = 0; i < numbersList.length; i++) {
                        var contactDetail = "";
                        if(numbersList[i].contact != null) {
                            contactDetail = numbersList[i].contact;
                        }
                        $("#contactsTbody").append('<tr>' +
                            '<td>' + numbersList[i].name + '</td>' +
                            '<td>' + contactDetail + '</td>' +
                            '</tr>');
                    }
                    // Show navigation if content.
                    if (!isEmpty($('#contactsTbody'))) {
                        $('#navEsittely').css('display', 'block');
                        $('#navYhteystiedot').css('display', 'block');
                    }
                    contactsDeferred.resolve();
                }
            );

        }
        else {
            contactsDeferred.resolve();
        }
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return contactsDeferred.promise();
}

function fetchInformation(language, lib) {
    if (lib === undefined) {
        lib = library; // Use default if none provided.
    }
    jsonp_url = "https://api.kirjastot.fi/v3/library/" + lib + "?lang=" + language;
    jsonpUrlV4 = "https://api.kirjastot.fi/v4/library/" + lib + "?lang=" + language;
    // Fetch generic details.
    function triggerFetch() {
        var fetchDeferred = jQuery.Deferred();
        setTimeout(function() {
            if(!isReFetching) {
                $.when( asyncFetchGenericDetails(), asyncFetchDepartments(), asyncFetchImages(), asyncFetchLinks(), asyncFetchLocation() ).then(
                    function() {
                        $.when( asyncFetchServices(), asyncLoadMap(), generateContacts() ).then(
                            function() {
                                fetchDeferred.resolve();
                            });
                    });
            }
            else {
                $.when( asyncFetchGenericDetails() ).then(
                function() {
                    fetchDeferred.resolve();
                });
            }
        }, 1 );
        // Return the Promise so caller can't change the Deferred
        return fetchDeferred.promise();
    }
    $.when( triggerFetch() ).then(
        function() {
            // If lang is english, do this again with Finnish to add missing infos.
            if (language == "en") {
                setTimeout(function () {
                    isReFetching = true;
                    fetchInformation("fi", lib);
                    $("header").append('<small class="en-notification">Note: If information is missing in English, Finnish version is used where available.</small>');
                }, 400);
            }
            else {
                adjustParentHeight(250);
            }
        }
    );
}
