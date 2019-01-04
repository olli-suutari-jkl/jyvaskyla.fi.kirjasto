function toggleFullScreen(target) {
    // if already full screen; exit
    // else go fullscreen
    // If slider, toggle small-slider class.
    if(target === "#sliderBox") {
        $('#sliderBox').toggleClass("small-slider");
    }
    else if(target === "#mapContainer") {
        $('#mapContainer').toggleClass("map-borders");
    }
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
        element = $(target).get(0);
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen()
        }
    }
}

// Function for adding a new palvelut item.
// Define accessibility count here, define other counts later on.
var accessibilityCount = 0;
var accessibilityIsEmpty = true;
function addItem(item, listElement) {
    var name = item.name;
    // Use "custom_name", where available.
    if (item.custom_name != null && item.custom_name.length != 0) {
        name = item.custom_name;
    }
    if(item.name === "Esteettömyyspalvelut" && accessibilityIsEmpty) {
        if (isEmpty($('#accessibilityDetails'))) {
            // Description.
            if (item.description != null && item.description.length != 0) {
                accessibilityIsEmpty = false;
                $(".accessibility-details").css("display", "block");
                $("#accessibilityDetails").append('<p>' + item.description.replace(/(<a )+/g, '<a target="_blank" ') + '</p>');
            }
        }
        // List of values separated by "," in the short description.
        if (item.short_description !== null && isEmpty($('#accessibility-images')) && isEmpty($('#accessibilityList'))) {
            accessibilityIsEmpty = false;
            $(".accessibility-details").css("display", "block");
            var splittedValues = item.short_description.split(",");
            $.each(splittedValues, function (index, value) {
                accessibilityCount = accessibilityCount + 1;
                if (value.toLocaleLowerCase().indexOf("esteetön sisäänpääsy") !== -1) {
                    $(".accessibility-images").append(' <img alt="' + i18n.get("Esteetön sisäänpääsy") + '" src="../images/accessibility/Esteetön_kulku_saavutettavuus.png" /> ');
                    $("#accessibilityList").append('<li>' + i18n.get("Esteetön sisäänpääsy") + '</li>');
                }
                else if (value.toLocaleLowerCase().indexOf("invapysäköinti") !== -1) {
                    $(".accessibility-images").append(' <img alt="' + i18n.get("Invapysäköinti") + '" src="../images/accessibility/Esteetön_parkki.png" /> ');
                    $("#accessibilityList").append('<li>' + i18n.get("Invapysäköinti") + '</li>');
                }
                else if (value.toLocaleLowerCase().indexOf("esteetön wc") !== -1) {
                    $(".accessibility-images").append(' <img alt="' + i18n.get("Esteetön wc") + '" src="../images/accessibility/Esteetön_wc.png" /> ');
                    $("#accessibilityList").append('<li>' + i18n.get("Esteetön wc") + '</li>');
                }
                else if (value.toLocaleLowerCase().indexOf("hissi") !== -1) {
                    $(".accessibility-images").append(' <img alt="' + i18n.get("Hissi") + '" src="../images/accessibility/Esteetön_hissi.png" /> ');
                    $("#accessibilityList").append('<li>' + i18n.get("Hissi") + '</li>');
                }
                else if (value.toLocaleLowerCase().indexOf("pyörätuoliluiska") !== -1) {
                    $(".accessibility-images").append(' <img alt="' + i18n.get("Ramppi") + '" src="../images/accessibility/Esteetön_ramppi.png" /> ');
                    $("#accessibilityList").append('<li>' + i18n.get("Ramppi") + '</li>');
                }
                else if (value.toLocaleLowerCase().indexOf("induktiosilmukka") !== -1) {
                    $(".accessibility-images").append(' <img alt="' + i18n.get("Induktiosilmukka") + '" src="../images/accessibility/Esteetön_induktiosilmukka.png" /> ');
                    $("#accessibilityList").append('<li>' + i18n.get("Induktiosilmukka") + '</li>');
                }
                else if (value.toLocaleLowerCase().indexOf("suuren kirjasinkoon kokoelma") !== -1) {
                    $("#accessibilityList").append('<li>' + i18n.get("Suuren kirjasinkoon kokoelma") + '</li>');
                }
                else {
                    if (value != null && value.length != 0) {
                        $("#accessibilityList").append('<li>' + value + '</li>');
                    }
                }
            });
        }
        if (accessibilityCount != 0 || !accessibilityIsEmpty) {
            $("#accessibility").css('display', 'block');
            $("#accessibilityTitle").prepend(i18n.get("Saavutettavuus"));
            if(accessibilityCount !== 0) {
                $("#accessibilityBadge").append('(' + accessibilityCount + ')');
            }
            noServices = false;
        }
    }
    else {
        // Add popup link if additional details are available.
        if (item.short_description != null && item.short_description.length != 0) {

            var description = item.short_description;
            var websiteLink = item.website;
            // Add "long" description where available.
            if (item.description != null && item.description.length != 0) {
                // Replace row splits with <br>
                var longDescription = item.description.replace(/\r\n/g, "<br>");
                description = description + '<br><br>' + longDescription;
            }

            // Replace links from the description
            if (description.indexOf("<a href=") !== -1) {
                description = description.replace(/(<a href=")+/g, "LINKSTART");
                description = description.replace(/(">)+/g, "URLEND");
                description = description.replace(/(<\/a>)+/g, "LINKEND");
            }
            // Add price where available.
            if (item.price != null && item.price.length != 0) {
                description = description + '<br><br>' + i18n.get("Hintatiedot") + ': ' + item.price;
            }
            // If website is not null and contains stuff. Sometimes empty website is shown unless lenght is checked.
            if ($(this).data('website') != null && $(this).data('website').length > 5) {
                // Use _blank, because iframes don't like moving to new pages.
                $("#linkToInfo").html('<p id="linkToInfo"><a target="_blank" href="' + $(this).data('website') +
                    '" class="external-link">' + i18n.get("Lisätietoja") + '</a></p>');
            } else {
                $("#linkToInfo").html('<p id="linkToInfo"></p>');
            }


            // Add the item to a desired element.
            $(listElement).append('<li> ' +
                '<a class="index-item" data-message="' + description + '" data-website="' + websiteLink + '" tabindex="0" href="#"' +
                'role="button" aria-expanded="false" aria-controls="' + name + '"' +
                'title="' + name + '">' + name + '</a></li>');
        }
        // If no description found, don't create the link
        else {
            $( listElement ).append('<li> ' +
                name + '</li>');
        }
    }


}

// Function for checking if element is empty.
function isEmpty( el ){
    return !$.trim(el.html())
}


var contactlist = [];
// IEC CRASHES:
//                         if (contactlist.findIndex(x => x.contact==data.phone_numbers[i].number) === -1){
// https://stackoverflow.com/questions/37698996/findindex-method-issue-with-internet-explorer
function checkIfNameExists(item) {
    for (var i = 0; i < contactlist.length; ++i) {
        if (contactlist[i].name == item) {
            return true;
        }
    }
    return false;
}
function checkIfContactExists(item) {
    for (var i = 0; i < contactlist.length; ++i) {
        if (contactlist[i].contact == item) {
            return true;
        }
    }
    return false;
}

var isInfoBoxVisible = false;
// Togles the visibility of the popover modal.
function toggleInfoBox(delay) {
    if(isInfoBoxVisible) {
        isInfoBoxVisible = false;
        $('#infoPopup').toggle(delay);
    }
    else {
        isInfoBoxVisible = true;
        $('#infoPopup').toggle(delay);
    }
}

// Map coordinates (marker)
var lon;
var lat;
// Used for hiding sections if null....
var transitIsEmpty = true;
var descriptionIsEmpty = true;
var isReFetching = false;
var mapLoaded = false;
var contactsIsEmpty = true;
var noServices = true;
var indexItemClicked = false;
// divClone & active tab are used with consortium.js
var divClone = '';

var jsonp_url = "https://api.kirjastot.fi/v3/library/" + library + "?lang=" + lang;
function fetchInformation(language, lib) {
    if (lib === undefined) {
        lib = library;
    }
    jsonp_url = "https://api.kirjastot.fi/v3/library/" + lib + "?lang=" + language;
    // Generic details
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
        // Table "Rakennuksen tiedot".
        var triviaIsEmpty = true;
        if (isEmpty($('#buildingDetails'))) {
            // If display none by default, colspan gets messed up.
            $('#buildingDetails').append('<tr id="triviaThead" class="thead-light" style="text-align: center;"> ' +
                '<th colspan="3" >' + i18n.get("Tietoa kirjastosta") + '</th>' +
                '</tr>');
            if (data.extra.founded != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Perustamisvuosi") + ': </strong></td>' +
                    '<td>' + data.extra.founded + '</td></tr>');
            }
            if (data.extra.building.building_name != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Rakennus") + ': </strong></td>' +
                    '<td>' + data.extra.building.building_name + '</td></tr>');
            }
            if (data.extra.building.construction_year != null && data.extra.building.construction_year != 0) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Rakennettu") + ': </strong></td>' +
                    '<td>' + data.extra.building.construction_year + '</td></tr>');
            }
            if (data.extra.building.building_architect != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Arkkitehti") + ': </strong></td>' +
                    '<td>' + data.extra.building.building_architect + '</td></tr>');
            }
            if (data.extra.building.interior_designer != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Sisustus") + ': </strong></td>' +
                    '<td>' + data.extra.building.interior_designer + '</td></tr>');
            }
            if (triviaIsEmpty) {
                $("#triviaThead").css("display", "none");
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
    });
    /*
     Yhteystiedot
     */
    function fetchLocation() {
        contactlist = [];
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
                if(!checkIfContactExists(data.email)) {
                    contactlist.push({name: i18n.get("Oletussähköposti"), contact: data.email});
                }
            }
            // Show navigation if content.
            if (!contactsIsEmpty) {
                $('#navEsittely').css('display', 'block');
                $('#navYhteystiedot').css('display', 'block');
            }
        });
    }


    function fetchContacts() {
        // Phone numbers.
        if (isEmpty($('#contactsTbody'))) {
            $.getJSON(jsonp_url + "&with=phone_numbers", function (data) {
                if(data.phone_numbers.length !== 0) {
                    for (var i = 0; i < data.phone_numbers.length; i++) {
                        // Check if detail is unique.
                        if(!checkIfContactExists(data.phone_numbers[i].number)) {
                            contactlist.push({name: data.phone_numbers[i].name, contact: data.phone_numbers[i].number});
                        }

                    }
                }
                // Show navigation if content.
                if (!isEmpty($('#contactsTbody'))) {
                    $('#navEsittely').css('display', 'block');
                    $('#navYhteystiedot').css('display', 'block');
                }
            });
        }
        // Staff list
        if (isEmpty($('#staffMembers'))) {
            $.getJSON(jsonp_url + "&with=persons", function (data) {
                if(data.persons.length !== 0) {
                    for (var i = 0; i < data.persons.length; i++) {
                        var name = data.persons[i].first_name + ' ' + data.persons[i].last_name;
                        if (data.persons[i].job_title !== null) {
                            name += ' – ' + data.persons[i].job_title;
                        }
                        // Check if name or detail is unique.
                        if (!checkIfContactExists(data.persons[i].email) || !checkIfNameExists(name)){
                            contactlist.push({name: name, contact: data.persons[i].email});
                        }
                    }
                }
                // Show navigation if content.
                if (!isEmpty($('#staffMembers'))) {
                    $('#navEsittely').css('display', 'block');
                    $('#navYhteystiedot').css('display', 'block');
                }
            });
        }
    }

    if(!isReFetching) {
        $.when( fetchLocation() ).then(
            function() {
                fetchContacts();
                $.when( fetchContacts() ).then(
                    function() {
                        // If no timeout, list is not always ready...
                        setTimeout(function(){

                            if(contactlist.length === 0) {
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
                        }, 350);
                    }
                );

            }
        );
    }


    /*
     Palvelut
    */
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

        // Don't re-add items for english version re-run.
        if(!isReFetching) {
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
                        // Get element position
                        var posX = $(this).offset().left,
                            // Set top to be slightly under the element
                            posY = $(this).offset().top + 20;


                        // Set popup position & content, toggle visibility.
                        $("#infoPopup").css('transform', 'translate3d(' + posX + 'px,' + posY + 'px, 0px');

                        var popupText = $(this).data('message');
                        // Check the description for links.
                        if(popupText.indexOf("LINKSTART") !== -1) {
                            popupText = popupText.replace(/(LINKSTART)+/g, '<a class="external-link" target="_blank" href="');
                            popupText = popupText.replace(/(URLEND)+/g, '">');
                            popupText = popupText.replace(/(LINKEND)+/g, '<\/a>');
                        }

                        $("#popoverContent").html('<p id="popoverContent">' + popupText + '</p>');
                        // If website is not null and contains stuff. Sometimes empty website is shown unless lenght is checked.
                        if ($(this).data('website') != null && $(this).data('website').length > 5) {
                            // Use _blank, because iframes don't like moving to new pages.
                            $("#linkToInfo").html('<p id="linkToInfo"><a target="_blank" href="' + $(this).data('website') +
                                '" class="external-link">' + i18n.get("Lisätietoja") + '</a></p>');
                        } else {
                            $("#linkToInfo").html('<p id="linkToInfo"></p>');
                        }
                        toggleInfoBox(100);
                        // Add timeout. This prevents duplicated click events if we have changed library.
                        setTimeout(function(){
                            indexItemClicked = false;
                        }, 30);
                    }
                });
            }
            if(noServices) {
                $('#libraryServices').css('display', 'none');
                // If no content is provided for the left collumn.
                if (descriptionIsEmpty && language === "fi") {
                    // Hide the content on left, make the sidebar 100% in width.
                    $(".details").css("display", "none");
                    $("#introductionSidebar").addClass("col-md-12");
                    $("#introductionSidebar").removeClass("col-lg-5 col-xl-4 order-2 sidebar");
                }
            }
        }
    }); // Palvelut
    // If lang is english, do this again with Finnish to add missing infos.
    if (language == "en") {
        setTimeout(function () {
            isReFetching = true;
            fetchInformation("fi", lib);
            $("header").append('<small>Note: If information is missing in English, Finnish version is used where available.</small>');
        }, 400);
    }

}

function fetchImagesAndSocialMedia(lib) {
    // Images
    if(lib !== undefined) {
        jsonp_url = "https://api.kirjastot.fi/v3/library/" + library + "?lang=" + lang;
    }
    $.getJSON(jsonp_url + "&with=pictures", function (data) {
        for (var i = 0; i < data.pictures.length; i++) {
            var altCount = i + 1;
            // Use medium image size, large scales smaller images a lot...
            var altText = i18n.get("Kuva kirjastolta") + ' (' + altCount + '/' + data.pictures.length + ')';
            $(".rslides").append('<li><img src="' + data.pictures[i].files.medium + '" alt="' + altText + '"></li>');
        }
        // If no pictures found, hide the slider...
        if (data.pictures.length === 0) {
            $('#sliderBox').css('display', 'none');
        }
        else {
            $('#currentSlide').html(1);
            $('.top-left').append('/' + data.pictures.length);
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
        }
    });

    // Social media links
    $.getJSON(jsonp_url + "&with=links", function (data) {
        var linkCount = 0;
        // Loop the links of group category [0].
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
                if(url.indexOf(refUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]) === -1) {
                    // Remove httml & www
                    var prettyUrl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
                    // Remove / and # from url if last characters
                    if (prettyUrl.substring(prettyUrl.length-1) === "/" || prettyUrl.substring(prettyUrl.length-1) === "#") {
                        prettyUrl = prettyUrl.substring(0, prettyUrl.length-1);
                    }
                    // Generate the link
                    prettyUrl = '<a target="_blank" href="' + url + '">' + prettyUrl + '</a>';
                    if(!checkIfContactExists(prettyUrl) && !checkIfNameExists(element.name)) {
                        contactlist.unshift({name: element.name,
                            contact: prettyUrl});
                        linkCount = linkCount +1;
                    }
                }
            }
        });
        // Mention links in title, if any are present.
        if(linkCount !== 0 ) {
            $('#contactsTitle').append('<span>' + i18n.get("Linkit ja yhteystiedot") + '</span>');
        } else {
            $('#contactsTitle').append('<span>' + i18n.get("Yhteystiedot") + '</span>');
        }
    });
}


function loadMapWithLibraries() {
    var map = L.map('mapContainer').setView([lat, lon], 15.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    if(libraryList.length !== 0) {
        var markerIcon = L.icon({
            // https://material.io/tools/icons/?style=baseline
            iconUrl: '../images/icons/local_library.svg',
            popupAnchor:  [-10, -4], // point from which the popup should open relative to the iconAnchor
            iconSize:     [28, 28], // size of the icon
        });
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
                    $('#contactsMapCol').prepend('<div style="margin-top: 20px" id="toot">' + i18n.get("Huom") + '! ' + libraryList[i].text.toString() + i18n.get("Ei koordinaatteja") + '</div>');
                    var container = document.getElementById('contactsMapCol');
                    container.style.height = (container.offsetHeight + 70) + "px";
                    var mapContainer = document.getElementById('mapContainer');
                    mapContainer.style.height = (mapContainer.offsetHeight + -70) + "px";
                }
            }
            if (libraryList[i].coordinates != null) {
                L.marker([libraryList[i].coordinates.lat, libraryList[i].coordinates.lon], {icon: markerIcon}).addTo(map)
                    .bindPopup(text)
                    .openPopup();
            }
        }
    } else {
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
    }

    // add Wikimedia map styles to the map.
    L.tileLayer.provider('Wikimedia').addTo(map);
    // Min/max zoom levels + default focus.
    map.options.minZoom = 6;
    map.options.maxZoom = 17.9;
    map.setView([lat, lon], 15);
    // Set the contribution text.
    $('.leaflet-control-attribution').html('<div class="leaflet-control-attribution leaflet-control">© <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</div>')

    map.eachLayer(function (layer) {
        if(layer._latlng !== undefined) {
            if(layer._latlng.lat == lat) {
                layer.fire('click');
            }
        }
    });
}



function bindActions() {
    // Navigation events
    function navigateToDefault() {
        // Hide other sections & active nav styles.
        $("#navYhteystiedot").removeClass( "active" );
        $(".yhteystiedot").hide(600);
        // Show selected section + add active to nav
        $("#navEsittely").addClass( "active" );
        $(".esittely").show(600);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
        activeTab = 0;
    }

    $( "#navEsittely" ).on('click', function () {
        navigateToDefault();
    });

    $( "#navYhteystiedot" ).on('click', function () {
        // Hide other sections & active nav styles.
        $("#navEsittely").removeClass( "active" );
        $(".esittely").hide(600);
        // Show selected section + add active to nav.
        $("#navYhteystiedot").addClass( "active" );
        $(".yhteystiedot").show(600);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
        activeTab = 1;
        // Map zoom gets messed if the map is loaded before hiding the map div.
        if(!mapLoaded && lat != null) {
            setTimeout(function(){
                //loadMap();
                loadMapWithLibraries();
            }, 750);
            mapLoaded = true;
        }
    });
    // Activate arrow navigation when hovering over the navigation.
    $(".nav-pills").mouseenter(function () {
        if (!$(".nav-pills").hasClass('hovering')) {
            // If element is never focused, navigation may not work.
            $(".nav-pills").addClass('hovering');
            $(".nav-pills").focus();
            // If we blur instantly, arrow navigation won't work unless something has been clicked in the document.
            setTimeout(function () {
                $(".nav-pills").blur();
            }, 5);
            //$("#sliderForward").blur();
        }
    });

    $(".nav-pills").mouseleave(function () {
        if ($(".nav-pills").hasClass('hovering')) {
            $(".nav-pills").removeClass('hovering');
        }
    });

    if(activeTab === 0) {
        $("#navYhteystiedot").removeClass( "active" );
        $(".yhteystiedot").hide(0);
        // Show selected section + add active to nav.
        $("#navEsittely").addClass( "active" );
        $(".esittely").show(0);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
    }

    if(activeTab === 1) {
        $("#navEsittely").removeClass( "active" );
        $(".esittely").hide(0);
        // Show selected section + add active to nav.
        $("#navYhteystiedot").addClass( "active" );
        $(".yhteystiedot").show(0);
        // If no timeout is used, map may not load correctly. If if clause is not inside the timeout, map won't be loaded if contacts is the default tab.
        setTimeout(function(){
            if(!mapLoaded && lat != null) {
                //loadMap();
                loadMapWithLibraries();
                mapLoaded = true;
            }
        }, 750);

        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
        // Navigate to default after the timeout, if tab is empty.
        setTimeout(function(){
            if(contactsIsEmpty) {
                navigateToDefault();
            }
        }, 100);
    }
}

$(document).ready(function() {
    bindActions();
    $( "#closeInfoBtn" ).on('click', function () {
        toggleInfoBox(200);
    });
    // UI texts.
    if($('#librarySelectorTitle')) {
        $('#librarySelectorTitle').append(i18n.get("Kirjaston valinta"));
    }
    $('#navEsittely').append(i18n.get("Esittely"));
    $('#navYhteystiedot').append(i18n.get("Yhteystiedot"));
    $('#newsDescriptionToggle').append(i18n.get("Ajankohtaista ja esittely"));
    $('#transitTitle').append(i18n.get("Liikenneyhteydet"));
    $('#socialMediaSr').append(i18n.get("Sosiaalinen media"));
    $('#scheludesSr').append(i18n.get("Aikataulut"));
    document.getElementById('expandSlider').title = i18n.get("Avaa tai sulje kokoruututila");
    // Yhteystiedot UI texts.
    document.getElementById('expandMap').title = i18n.get("Avaa tai sulje kokoruututila");
    $('#locationTitle').append(i18n.get("Sijainti"));
    $('#addressTh').append(i18n.get("Osoite"));
    $('#postalTh').append(i18n.get("Postiosoite"));
    $('#emailTh').append(i18n.get("Sähköposti"));
    // Phone numbers
    $('#phonesTitle').append(i18n.get("Puhelinnumerot"));
    $('#sectionTh').append(i18n.get("Osasto"));
    $('#numberTh').append(i18n.get("Numero"));
    // Staff
    $('#staffTitle').append(i18n.get("Henkilökunta"));
    $('#nameTh').append(i18n.get("Nimi"));
    $('#titleTh').append(i18n.get("Työnimike"));
    $('#contactDetailsTh').append(i18n.get("Yhteystieto"));
    // Services
    $('#closeInfoBtn').append(i18n.get("Sulje"));
    // Apparently IOS does not support Full screen API:  https://github.com/googlevr/vrview/issues/112
    // Hide fullscreen toggler & increase slider/map sizes a bit on larger screens to compensate the lack of full screen.
    // Since navigation buttons on slider do not apparently work either, hide them too... we got swiping after all!
    // https://stackoverflow.com/questions/7944460/detect-safari-browser
    var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
        navigator.userAgent &&
        navigator.userAgent.indexOf('CriOS') == -1 &&
        navigator.userAgent.indexOf('FxiOS') == -1;
    if(isSafari || /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        $('#expandSlider').css('display', 'none');
        $('#expandMap').css('display', 'none');
        if($(window).width() > 767) {
            $('.small-slider').css('height', '330px');
            $('#contactsFirstCol').addClass("col-md-12");
            $('#contactsFirstCol').removeClass("col-md-8");
            $('#contactsMapCol').addClass("col-md-12");
            $('#contactsMapCol').removeClass("col-md-col-md-4");
            $('#contactsMapCol').css('height', '500px');
        }
    }

    // Since the api is having problems with special schedules, add a notification. To be commented when fixed.
    //$('#schedules').prepend('<p style="color: red">' + i18n.get("Virheelliset aukioloajat") + '</p>');

    // Clone page, to be restored if library selector is used.
    divClone = $("#pageContainer").clone();
    // Fetch details.
    fetchInformation(lang);
    fetchImagesAndSocialMedia(library);

}); // OnReady
