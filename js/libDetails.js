// Variables
var jsonp_url = "https://api.kirjastot.fi/v3/library/" + library + "?lang=" + lang;
var jsonpUrlV4 = "https://api.kirjastot.fi/v4/library/" + library + "?lang=" + lang;
var transitIsEmpty = true;
var descriptionIsEmpty = true;
var isReFetching = false;
var contactsIsEmpty = true;
var noServices = true;
var noImages = true;
var triviaIsEmpty = true;
var isInfoBoxVisible = false;
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
            if (transitIsEmpty) {
                if (data.extra.transit.buses != null && data.extra.transit.buses !== "") {
                    transitIsEmpty = false;
                    $('#transitBody').append('<p>' + i18n.get("Linja-autot") + ': ' + data.extra.transit.buses + '</p>')
                }
                if (data.extra.transit.transit_directions != null && data.extra.transit.transit_directions.length != 0) {
                    transitIsEmpty = false;
                    $('#transitBody').append('<p>' + data.extra.transit.transit_directions.replace(/(<a )+/g, '<a target="_blank" ') + '</p>')
                }
                if (data.extra.transit.parking_instructions != null && data.extra.transit.parking_instructions !== "") {
                    transitIsEmpty = false;
                    // Replace row splits with <br>
                    var parking_instructions = data.extra.transit.parking_instructions.replace(/\r\n/g, "<br>");
                    $('#transitBody').append('<p>' + parking_instructions + '</p>')
                }
            }

            if(!transitIsEmpty) {
                $('#transitDetails').css('display', 'block');
            }

            // Table
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
                if (!triviaIsEmpty) {
                    $(".trivia-section").css("display", "block");
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
// CollectionCount is used with departments.
var roomCount = 0;
// Bind modal closing event only once.
var isModalCloseBinded = false;
// Fetch services & generate the UI
function hideModal() {
    isInfoBoxVisible = false;
    $('#myModal').modal('hide');
    adjustParentHeight(50);
    adjustParentUrl('', 'service');
}

var openOnLoad = false;
function toggleModal(elementPosY) {
    if(isInfoBoxVisible) {
        hideModal();
    }
    else {
        var delay = 0;
        // If we are opening a service by navigating to it via url, delay so page can finish adjusting in peace.
        if(openOnLoad) {
            delay = 50;
            openOnLoad = false;
            try {
                setTimeout(function(){
                    parent.postMessage({value: $("#myModal").position().top -50, type: 'scroll'}, '*');
                }, delay + 300);

            }
            catch (e) {
                console.log("Parent position adjustment failed: " + e);
            }
        }
        function showModal(delay) {
            setTimeout(function() {
                $('#myModal').modal('show');
                // Re-bind backdrop event. This is destroyed when modal is hidden.
                // Bind this, since the default event area is not full page in height.
                $(".modal-backdrop").on('click', function () {
                    hideModal();
                });
                isInfoBoxVisible = true;
                // Add timeout. This prevents duplicated click events if we have changed library.
                setTimeout(function() {
                    // Bind closing event. If this is done before generating content, it doesn't work.
                    if(!isModalCloseBinded) {
                        // When clicking close buttons or outside that is not in .modal-backdrop
                        $('#myModal').on('hide.bs.modal', function (e) {
                            // calling hideModal here would result in a loop.
                            isInfoBoxVisible = false;
                            adjustParentHeight(50);
                            adjustParentUrl('', 'service');
                        });
                        isModalCloseBinded = true;
                    }
                    adjustParentHeight(50, elementPosY)

                }, 100);

            }, delay);
        }
        showModal(delay);
    }
}

var isServiceClickBinded = false;
function bindServiceClicks() {
    if(isServiceClickBinded) {
        return
    }
    $(".index-item").on('click', function (e) {
        var popupText = $(this).data('message');
        // Remove multiple spaces
        popupText = popupText.replace(/^(&nbsp;)+/g, '');
        // This would remove br from <br>*:  popupText = popupText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
        // Remove empty paragraphs
        popupText = popupText.replace(/(<p>&nbsp;<\/p>)+/g, "");
        popupText = popupText.replace(/(<p><\/p>)+/g, "");
        popupText = popupText.replace(/(<p>\s<\/p>)+/g, "");

        if (popupText.indexOf("blockquote") !== -1) {
            var linksToServices = [];
            var reFindLinks = new RegExp(/<blockquote>.*?(<p>.*?<\/p>).*?<\/blockquote>/g);
            var reFindLinksExec = reFindLinks.exec(popupText);
            while (reFindLinksExec != null) {
                var textInside = reFindLinksExec[0].replace("<blockquote>", "");
                textInside = textInside.replace("</blockquote>","");
                textInside = textInside.replace("<p>","");
                textInside = textInside.replace("</p>","");
                textInside = textInside.toLowerCase();
                textInside = textInside.replace(/ä/g, "a");
                textInside = textInside.replace(/ö/g, "o");
                textInside = textInside.replace(/\(/g, "");
                textInside = textInside.replace(/\)/g, "");
                textInside = textInside.replace(/_/g, " ");
                textInside = textInside.replace(/-/g, " ");
                // Loop services and check if refUrl contains one of them and click if so.
                for (var i = 0; i < serviceNames.length; i++) {
                    var escapedName = serviceNames[i].toLowerCase();
                    escapedName = escapedName.replace(/ä/g, "a");
                    escapedName = escapedName.replace(/ö/g, "o");
                    escapedName = escapedName.replace(/\(/g, "");
                    escapedName = escapedName.replace(/\)/g, "");
                    escapedName = escapedName.replace(/_/g, " ");
                    escapedName = escapedName.replace(/-/g, " ");
                    if(textInside.indexOf(escapedName) > -1) {
                        var linkToService = reFindLinksExec[0].replace('<p>',
                            '<a class="service-link-in-modal" data-name="' + serviceNames[i] + '" href="#">');
                        linkToService = linkToService.replace('</p>', '</a>');
                        linksToServices.push({position: reFindLinksExec[0], iframe: linkToService});
                    }
                }
                // Loop all links.
                reFindLinksExec = reFindLinks.exec(popupText);
            }
            // Loop & add iframes from embedded links.
            for (var i = 0; i < linksToServices.length; i++) {
                popupText = popupText.replace(linksToServices[i].position, linksToServices[i].iframe);
            }
        }

        // Check if large or small text/modal.
        if(popupText.length > 200) {
            $('#modal').addClass("modal-lg");
            $('#modal').css("text-align", "left");
        }
        else {
            $('#modal').removeClass("modal-lg");
            $('#modal').css("text-align", "center");
        }
        // If website is not null and contains stuff. Sometimes empty website is shown unless lenght is checked.
        if ($(this).data('website') !== null && $(this).data('website') !== "undefined" &&
            $(this).data('website').length > 5) {
            // Use _blank, because iframes don't like moving to new pages.
            popupText = popupText + '<p id="linkToInfo"><a target="_blank" href="' + $(this).data('website') +
                '" class="external-link">' + i18n.get("Lisätietoja") + '</a></p>';
        }
        $("#modalContent").replaceWith('<div id="modalContent">' + popupText + '</div>');
        // Bind click event for clicking links to other services inside the modal.
        $(".service-link-in-modal").on('click', function () {
            var name = $(this).data('name');
            toggleModal();
            setTimeout(function(){
                $("li").find('[data-name="'+ name +'"]').click();
            }, 50);

            try {
                setTimeout(function(){
                    parent.postMessage({value: $("#myModal").position().top -50, type: 'scroll'}, '*');
                }, 1300);
            }
            catch (e) {
                console.log("Parent position adjustment failed: " + e);
            }
        });
        // Check if text contains headers..
        if(popupText.indexOf("<h") !== -1) {
            $("#modalTitle").replaceWith('<h1 id="modalTitle" class="modal-title underlined-title">' +
                $(this).data('name') + '</h1>');
        }
        else {
            $("#modalTitle").replaceWith('<h1 id="modalTitle" class="modal-title modal-title-small underlined-title">' +
                $(this).data('name') + '</h1>');
        }
        // Use animate, $('#myModal').css('top', -posY); works pretty badly.
        $('#myModal').css({
            position: 'absolute',
            left: 0,
            top: $(this).offset().top-85  // Element position -85,
        }).animate();
        // Show modal.
        var offSet = e.pageY;
        // If we trigger the click programmatically, e.pageY will be undefined...
        if(offSet === undefined) {
            offSet = e.target;
            // OffsetTop is always about 200 px too little...
            offSet = offSet.offsetTop + 200;
        }
        //console.log("e.pageY " + e.pageY + " | ta "  +offSet);
        toggleModal(offSet);
        // Adjust parent url.
        adjustParentUrl($(this).data('name'), "service");
    });
    isServiceClickBinded = true;
}

function asyncFetchServices() {
    var servicesDeferred = jQuery.Deferred();
    setTimeout(function() {
        $.getJSON(jsonpUrlV4 + "&with=services", function (data) {
            var hardwareCount = 0;
            var collectionCount = 0;
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
            var data = data.data;
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
                        if(data.services[i].name === "Saavutettavuus" || data.services[i].name === "Esteettömyyspalvelut" || data.services[i].name === "Accessibility services") {
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
            // Add event listener for clicking links.
            bindServiceClicks();
            if (!roomsAndCollectionsAdded || !hardwareAndServicesAdded || !accessibilityAdded) {
                // Loop services and check if refUrl contains one of them and click if so.
                var urlUnescapeSpaces = refUrl.replace(/%20/g, " ");
                urlUnescapeSpaces = refUrl.replace(/_/g, " ");
                urlUnescapeSpaces = refUrl.replace(/-/g, " ");
                urlUnescapeSpaces = urlUnescapeSpaces.replace(/\(/g, "");
                urlUnescapeSpaces = urlUnescapeSpaces.replace(/\)/g, "");
                // Loop services and check if refUrl contains one of them and click if so.
                var toClick = "";
                for (var i = 0; i < serviceNames.length; i++) {
                    var escapedName = serviceNames[i].toLowerCase();
                    escapedName = escapedName.replace(/ä/g, "a");
                    escapedName = escapedName.replace(/ö/g, "o");
                    escapedName = escapedName.replace(/\(/g, "");
                    escapedName = escapedName.replace(/\)/g, "");
                    escapedName = escapedName.replace(/_/g, " ");
                    escapedName = escapedName.replace(/-/g, " ");
                    if(urlUnescapeSpaces.indexOf(escapedName) > -1) {
                        toClick = serviceNames[i];
                        setTimeout(function(){
                            openOnLoad = true;
                            $("li").find('[data-name="'+ toClick +'"]').click();
                        }, 600);
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
        $.getJSON(jsonpUrlV4 + "&with=departments&limit=500",
            function(data){
                var data = data.data.departments;
                // If no pictures found, hide the slider...
                if (data.length === 0) {
                    departmentsDeferred.resolve()
                }
                else {
                    for (var i = 0; i < data.length; i++) {
                        // Collections
                        roomCount = roomCount +1;
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
                        noImages = false;
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
                        $("#streetAddress").append('<p><strong>' + i18n.get("Osoite") + '</strong><br>' + data.name + '<br>' + data.address.street + '<br>' + data.address.zipcode + ' ' + data.address.city + '</p>');
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
                            $("#postalAddress").append('<p><strong>' + i18n.get("Postiosoite") + '</strong><br>' + postalString + '</p>');
                        }
                    }
                    else {
                        // If no postal address, hide header & increase map size.
                        $("#contactsFirstCol").addClass( "col-md-5");
                        $("#contactsFirstCol").removeClass( "col-md-7" );
                        $("#contactsMapCol").addClass( "col-md-7");
                        $("#contactsMapCol").removeClass( "col-md-5" );
                        $("#streetAddress").addClass( "col-md-12" );
                        $("#streetAddress").removeClass( "col-md-6" );
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
                    popupAnchor:  [-8, -3], // point from which the popup should open relative to the iconAnchor
                    iconSize:     [24, 24], // size of the icon
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
                            $('#mapContainer').append('<div id="noCoordinates">' + i18n.get("Huom") + '! ' +
                                libraryList[i].text.toString() + i18n.get("Ei koordinaatteja") + '</div>');
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
                if(lat !== undefined) {
                    map.setView([lat, lon], 13.5);
                } else {
                    map.setView(["62.750", "25.700"], 6);
                }
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
                        $('#contactsTitle').append('<span>' + i18n.get("Linkit ja kontaktit") + '</span>');
                    } else {
                        $('#contactsTitle').append('<span>' + i18n.get("Kontaktit") + '</span>');
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
                    $("header").append('<span class="en-notification">Note: If information is missing in English, Finnish version is used where available.</span>');
                }, 400);
            }
            else {
                if(noServices && language === "fi") {
                    $('#libraryServices').css('display', 'none');
                    // If no content is provided for the left collumn.
                    if (descriptionIsEmpty) {
                        // Hide the content on left, make the sidebar 100% in width.
                        $(".details").css("display", "none");
                        $("#leftBar").css("display", "none");
                        $("#introductionSidebar").addClass("col-md-12");
                        $("#introductionSidebar").removeClass("col-lg-5 col-xl-4 order-2 sidebar");
                        if(isScheduleEmpty && noImages && triviaIsEmpty) {
                            $("#introductionSidebar").append('<div id="noIntroContent"><h3>' +
                                i18n.get("No content") + ' <i class="fa fa-frown-o"></i></h3></div>');

                        }
                    }
                }
                adjustParentHeight(200);
            }
        }
    );
}
