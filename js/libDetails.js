// Variables
var withParams = "&with=pictures,services,buildingInfo,departments,mailAddress,links,phoneNumbers,primaryContactInfo," +
    "persons,transitInfo&limit=1500";
var jsonpUrlV4 = "https://api.kirjastot.fi/v4/library/" + library + "?lang=" + lang + withParams;
var transitIsEmpty = true;
var descriptionIsEmpty = true;
var isReFetching = false;
var contactsIsEmpty = true;
var noServices = true;
var noImages = true;
var triviaIsEmpty = true;
var isInfoBoxVisible = false;
var mapLoaded = false;
var address = null;
var mailAddress = null;
var coordinates = null;
var departments = null;
var links = null;
var phoneNumbers = null;
var pictures = null;
var arrayOfServices = null;
var arrayOfServiceNames = [];
var arrayOfServiceNamesInOppositeLang = [];
var slogan = null;
var founded = null;
var buildingInfo = null;
var email = null;
var description = null;
var transitInfo = null;
var lon;
var lat;
var persons = null;
var contactlist = [];
var numbersList = [];
var staffList = [];

/* Functions for checking if name or contact detail exists in arrays with keys "name" and "contact".
   IEC CRASHES: if (contactlist.findIndex(x => x.contact==data.phoneNumbers[i].number) === -1){
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

function asyncFetchV4Data() {
    var genericDeferred = jQuery.Deferred();
    setTimeout(function() {
        // Disable caching: https://stackoverflow.com/questions/13391563/how-to-set-cache-false-for-getjson-in-jquery
        $.getJSON(jsonpUrlV4, {_: new Date().getTime()}, function (data) {
            var data = data.data;
            address = data.address;
            mailAddress = data.mailAddress;
            coordinates = data.coordinates;
            departments = data.departments;
            links = data.links;
            phoneNumbers = data.phoneNumbers;
            persons = data.persons;
            pictures = data.pictures;
            arrayOfServices = data.services;
            slogan = data.slogan;
            founded = data.founded;
            buildingInfo = data.buildingInfo;
            // libName is undefined if on a standalone lib page.
            if(libName === undefined) {
                libName = data.name;
            }
            if(data.primaryContactInfo.email != null) {
                // Add description if available.
                if(isValue(data.primaryContactInfo.email.description)) {
                    email = data.primaryContactInfo.email.email + data.primaryContactInfo.email.description;
                }
                else {
                    email = data.primaryContactInfo.email.email;
                }
            }
            description = data.description;
            transitInfo = data.transitInfo;
            for (var i = 0; i < arrayOfServices.length; i++) {
                var name = arrayOfServices[i].standardName.toLowerCase();
                var customName = "";
                if(arrayOfServices[i].name !== null) {
                    customName = arrayOfServices[i].name.toLowerCase();
                    customName = customName.replace(/,/g, "");
                    customName = customName.replace(/ä/g, "a");
                    customName = customName.replace(/ö/g, "o");
                    customName = customName.replace(/\(/g, "");
                    customName = customName.replace(/\)/g, "");
                    customName = customName.replace(/_/g, " ");
                    customName = customName.replace(/-/g, " ");
                }
                arrayOfServiceNames.push({name: name, customName: customName});
            }
            genericDeferred.resolve();
        });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return genericDeferred.promise();
}

function asyncFetchServiceNamesInOppositeLang() {
    var serviceNamesDeferred = jQuery.Deferred();
    var oppositeLang = "fi";
    if(lang == "fi") {
        oppositeLang = "en";
    }
    setTimeout(function() {
        // Disable caching: https://stackoverflow.com/questions/13391563/how-to-set-cache-false-for-getjson-in-jquery
        $.getJSON("https://api.kirjastot.fi/v4/library/" + library + "?lang=" + oppositeLang + "&with=services", {_: new Date().getTime()}, function (data) {
            var data = data.data.services;
            for (var i = 0; i < data.length; i++) {
                var name = data[i].standardName.toLowerCase();
                var customName = "";
                if(data[i].name !== null) {
                    customName = data[i].name.toLowerCase();
                    customName = customName.replace(/,/g, "");
                    customName = customName.replace(/ä/g, "a");
                    customName = customName.replace(/ö/g, "o");
                    customName = customName.replace(/\(/g, "");
                    customName = customName.replace(/\)/g, "");
                    customName = customName.replace(/_/g, " ");
                    customName = customName.replace(/-/g, " ");
                }
                arrayOfServiceNamesInOppositeLang.push({name: name, customName: customName});
            }
            serviceNamesDeferred.resolve();
        });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return serviceNamesDeferred.promise();
}


/* Fetch things via v4 api, expect persons & building details */
function asyncGenerateGenericDetails() {
    var genericDeferred = jQuery.Deferred();
    setTimeout(function() {
        if ($("#blockquote").is(':empty')) {
            if (slogan !== null && slogan.length > 1) {
                $("#blockquote").append(' <blockquote class="blockquote library-slogan">' + slogan + '</blockquote>');
            }
        }
        if (isEmpty($('#introContent'))) {
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
                // Generate webropol survey frames.
                description = generateWebropolSurveyFrames(description);
                // Add target="_blank" to links. Same url links would open inside Iframe, links to outside  wouldn't work.
                description = description.replace(/(<a )+/g, '<a target="_blank" ');
                $("#introContent").append(description);
                descriptionIsEmpty = false;
            }
        }
        // Transit details
        if (transitIsEmpty) {
            // There is a bug that is hard to re-produce where the generate UI functions would be triggered even though the data is still null. It may be linked to slow networks. As a workaround, we reload the page if address details are null. TO DO: Better fix.
            if(address == null || transitInfo == null || buildingInfo == null) {
                fetchInformation(lang, library);
                return;
            }
            var cityName = address.city;
            if(coordinates != null && address.street != null && cityName != null) {
                transitIsEmpty = false;
                var linkToTransitInfo = address.street + ", "  + address.city +
                    "::" + coordinates.lat + ", "  + coordinates.lon ;

                var infoText = i18n.get("Route and transportation");
                linkToTransitInfo = "https://opas.matka.fi/reitti/POS/" + linkToTransitInfo;
                linkToTransitInfo = encodeURI(linkToTransitInfo);
                // Matka.fi does not support all cities for public transport details, see: https://www.traficom.fi/fi/asioi-kanssamme/reittiopas
                if(cityName !== "Jyväskylä") {
                    linkToTransitInfo = "https://www.google.com";
                    if(lang === "fi") {
                        linkToTransitInfo = "https://www.google.fi"
                    }
                    linkToTransitInfo = linkToTransitInfo + "/maps/dir//";
                    linkToTransitInfo = linkToTransitInfo + address.street + ", "  + address.zipcode +
                        ", " + address.city + "/@" + coordinates.lat + ", "  + coordinates.lon + ", 15z/";
                    infoText = i18n.get("Navigation to location");
                }
                $('#transitBody').append('<p><a target="_blank" href="' + linkToTransitInfo + '">' + infoText + '</a></p>')
            }
            if (transitInfo.buses != null && transitInfo.buses !== "") {
                transitIsEmpty = false;
                $('#transitBody').append('<p>' + i18n.get("Buses") + ': ' + transitInfo.buses + '</p>')
            }
            if (transitInfo.directions != null && transitInfo.directions.length != 0) {
                transitIsEmpty = false;
                $('#transitBody').append('<p>' + transitInfo.directions.replace(/(<a )+/g, '<a target="_blank" ') + '</p>')
            }
            if (transitInfo.parking != null && transitInfo.parking !== "") {
                transitIsEmpty = false;
                // Replace row splits with <br>
                var parking = transitInfo.parking.replace(/\r\n/g, "<br>");
                $('#transitBody').append('<p>' + parking + '</p>')
            }
        }
        if(!transitIsEmpty) {
            $('#transitDetails').css('display', 'block');
        }
        // Update the title to match data.name.
        if(document.title !== libName && !isReFetching) {
            if(libName != null) {
                document.title = libName;
            }
        }
        genericDeferred.resolve();
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
                    adjustParentHeight(50, elementPosY);
                }, 100);
                // Bind the tooltips.
                $('[data-toggle="tooltip"]').tooltip();
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
                            '<a class="service-link-in-modal" data-name="' + serviceNames[i] + '" href="javascript:void(0);">');
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
        if(popupText.length > 260) {
            $('#modal').addClass("modal-lg");
            $('#modal').removeClass("modal-small");
        }
        else {
            $('#modal').addClass("modal-small");
            $('#modal').removeClass("modal-lg");
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
        for (var i = 0; i < arrayOfServices.length; i++) {
            // Collections
            if (arrayOfServices[i].name != null && arrayOfServices[i].name.length != 0 || arrayOfServices[i].standardName != null) {
                if (arrayOfServices[i].type == "collection") {
                    if (!roomsAndCollectionsAdded) {
                        collectionCount = collectionCount + 1;
                        collections.push(arrayOfServices[i]);
                        roomCount = roomCount + 1;
                    }
                }
                // Rooms
                else if (arrayOfServices[i].type == "room") {
                    if (!roomsAndCollectionsAdded) {
                        roomCount = roomCount + 1;
                        rooms.push(arrayOfServices[i]);
                    }
                }
                // Hardware
                else if (arrayOfServices[i].type == "hardware") {
                    if (!hardwareAndServicesAdded) {
                        hardwareCount = hardwareCount + 1;
                        serviceCount = serviceCount + 1;
                        hardware.push(arrayOfServices[i]);
                    }
                }
                // Services
                else if (arrayOfServices[i].type == "service") {
                    if(arrayOfServices[i].name === "Saavutettavuus" || arrayOfServices[i].name === "Esteettömyyspalvelut" || arrayOfServices[i].name === "Accessibility services") {
                        // Set accessibility added to true, this is used to display "Services" tab if other tabs are missing.
                        if(!accessibilityAdded) {
                            accessibilityAdded = true;
                            // Accessibility count is increased in the function.
                            addItem(arrayOfServices[i], '#accessibilityItems');
                        }
                    }
                    else {
                        if (!hardwareAndServicesAdded) {
                            serviceCount = serviceCount + 1;
                            services.push(arrayOfServices[i]);
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
                $("#roomsAndCollectionsTitle").prepend(i18n.get("Rooms and collections"));
            }
            else if(roomCount != 0) {
                $("#roomsAndCollectionsTitle").prepend(i18n.get("Rooms"));
            }
            else {
                $("#roomsAndCollectionsTitle").prepend(i18n.get("Collections"));
            }
            $("#roomsAndCollectionsBadge").append('(' + roomCount + ')');
            noServices = false;
        }
        if (serviceCount != 0 || hardwareCount != 0) {
            $("#hardwareAndServices").css('display', 'block');
            if(serviceCount != 0 && hardwareCount != 0) {
                $("#hardwareAndServicesTitle").prepend(i18n.get("Hardware and services"));
            }
            else if(hardwareCount != 0) {
                $("#hardwareAndServicesTitle").prepend(i18n.get("Hardware"));
            }
            else {
                $("#hardwareAndServicesTitle").prepend(i18n.get("Services"));
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
            var matchFound = false;
            for (var i = 0; i < serviceNamesWithLinks.length; i++) {
                var escapedName = serviceNamesWithLinks[i].toLowerCase();
                escapedName = escapedName.replace(/ä/g, "a");
                escapedName = escapedName.replace(/ö/g, "o");
                escapedName = escapedName.replace(",", "")
                escapedName = escapedName.replace(/\(/g, "");
                escapedName = escapedName.replace(/\)/g, "");
                escapedName = escapedName.replace(/_/g, " ");
                escapedName = escapedName.replace(/-/g, " ");
                if(urlUnescapeSpaces.indexOf(escapedName) > -1) {
                    matchFound = true;
                    toClick = serviceNamesWithLinks[i];
                    setTimeout(function(){
                        openOnLoad = true;
                        $("li").find('[data-name="'+ toClick +'"]').click();
                    }, 600);
                }
            }
            var matchingServiceLinkFound = false;
            if(!matchFound) {
                for (var i = 0; i < arrayOfServiceNamesInOppositeLang.length; i++) {
                    if(arrayOfServiceNamesInOppositeLang[i].customName !== "") {
                    var oppositeCustomName = encodeVal(arrayOfServiceNamesInOppositeLang[i].customName);
                    oppositeCustomName = oppositeCustomName.replace(/-/g, " ");
                    oppositeCustomName = oppositeCustomName.replace(/,/g, "");
                    if(urlUnescapeSpaces.indexOf(oppositeCustomName) > -1) {
                        matchFound = true;
                        toClick = decodeVal(arrayOfServiceNames[i].customName);
                        if(toClick == "") {
                            toClick = decodeVal(arrayOfServiceNames[i].name)
                        }
                        for (var t = 0; t < serviceNamesWithLinks.length; t++) {
                            var valueInLowerCase = decodeVal(serviceNamesWithLinks[t].toLowerCase());
                            if(valueInLowerCase.indexOf(toClick) > -1) {
                                matchingServiceLinkFound = true;
                                toClick = serviceNamesWithLinks[t];
                                setTimeout(function(){
                                    openOnLoad = true;
                                    $("li").find('[data-name="'+ toClick +'"]').click();
                                }, 600);
                            }
                        }
                        // If no matching service is available to click, remove name from url.
                        if(!matchingServiceLinkFound) {
                            var index = refUrl.lastIndexOf("?");
                            var serviceToRemove = refUrl.substr(index+1);
                            adjustParentUrl(serviceToRemove, "removeService");
                        }
                    }
                }
            }
        }
        if(!matchFound) {
            for (var i = 0; i < arrayOfServiceNames.length; i++) {
                // Service names may contain "-" eg. Celia-library services
                var oppositeName = encodeVal(arrayOfServiceNamesInOppositeLang[i].name);
                oppositeName = oppositeName.replace(/-/g, " ");
                oppositeName = oppositeName.replace(/,/g, "");
                if(urlUnescapeSpaces.indexOf(oppositeName) > -1) {
                    matchFound = true;
                    toClick = decodeVal(arrayOfServiceNames[i].name);
                    if(arrayOfServiceNames[i].customName !== "") {
                        toClick = decodeVal(arrayOfServiceNames[i].customName);
                    }
                    for (var t = 0; t < serviceNamesWithLinks.length; t++) {
                        var valueInLowerCase = decodeVal(serviceNamesWithLinks[t].toLowerCase());
                        if(valueInLowerCase.indexOf(toClick) > -1) {
                            matchingServiceLinkFound = true;
                            toClick = serviceNamesWithLinks[t];
                            setTimeout(function(){
                                openOnLoad = true;
                                $("li").find('[data-name="'+ toClick +'"]').click();
                            }, 600);
                        }
                    }
                    // If no matching service is available to click, remove name from url.
                    if(!matchingServiceLinkFound) {
                        adjustParentUrl();
                    }
                }
            }
        }
        }
        servicesDeferred.resolve();
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return servicesDeferred.promise();
}

function asyncFetchDepartments() {
    var departmentsDeferred = jQuery.Deferred();
    setTimeout(function() {
        if (departments.length === 0) {
            departmentsDeferred.resolve();
        }
        else {
            for (var i = 0; i < departments.length; i++) {
                // Collections
                roomCount = roomCount +1;
                addItem(departments[i], '#roomsAndCollectionsItems');
            }
            departmentsDeferred.resolve();
        }

    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return departmentsDeferred.promise();
}

function generateImages(data) {
    var imageListDeferred = jQuery.Deferred();
    var counter = 0;
    setTimeout(function() {
        for (var i = 0; i < pictures.length; i++) {
            var altCount = i + 1;
            // Use medium image size, large scales smaller images a lot...
            var altText = i18n.get("Picture from the library") + ' (' + altCount + '/' + pictures.length + ')';
            $(".rslides").append('<li><img src="' + pictures[i].files.medium.url + '" alt="' + altText + '"></li>');
            counter = counter +1;
            if(counter === data.length) {
                if(igImages.length !== 0) {
                    for (var i = 0; i < igImages.length; i++) {
                        var igHref = 'target="_blank" href="https://www.instagram.com/p/' + igImages[i].shortcode + '/"';
                        var igLogo = '<a title="' + i18n.get("Open in instagram") + '" data-placement="bottom" ' +
                            'data-toggle="navigation-tooltip" class="slider-ig-logo no-external-icon"' + igHref + '>' +
                            '<i class="fab fa-instagram"></i></a>';
                        var likesAlt = igImages[i].likes + " " + i18n.get("Likes on Instagam");
                        if(igImages[i].likes == 1) {
                            likesAlt = igImages[i].likes + " " + i18n.get("Likes on Instagram singular");
                        }
                        var igHeart = '<a title="' + likesAlt + '" data-placement="bottom" ' +
                            'data-toggle="navigation-tooltip" class="ig-love-btn ig-love-btn-counter no-external-icon" '
                            + igHref + '><span>&#x2764;</span><span>' + igImages[i].likes + '</span></a>';
                        var igCaption = '<figcaption class="ig-caption">' + igImages[i].caption + '</figcaption>';
                        var igContainer = '<div class="ig-likes-logo-container">' + igHeart + igLogo + '</div>';
                            $(".rslides").append('<li class="ig-img-container">' + igContainer  +
                                '<figure><img class="ig-img" src="' + igImages[i].url + '">' + igCaption + '</figure></li>');
                        counter = counter +1;
                    }
                    imageListDeferred.resolve();
                }
                else {
                    imageListDeferred.resolve();
                }
            }
        }
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return imageListDeferred.promise();
}

function asyncGenerateTrivia() {
    var triviaDeferred = jQuery.Deferred();
    setTimeout(function() {
        if (isEmpty($('#buildingDetails')) && !isReFetching) {
            // If display none by default, colspan gets messed up.
            $('#triviaTitle').append( i18n.get("Trivia"));
            if(buildingInfo == null && founded == null) {
                triviaIsEmpty = true;
                $(".trivia-section").css("display", "block");
                triviaDeferred.resolve();
            }
            if (founded != null) {
                triviaIsEmpty = false;
                $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Founded") + ': </strong></td>' +
                    '<td class="trivia-detail">' + founded + '</td></tr>');
            }
            if (buildingInfo.buildingName != null) {
                triviaIsEmpty = false;
                $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Building") + ': </strong></td>' +
                    '<td class="trivia-detail">' + buildingInfo.buildingName + '</td></tr>');
            }
            if (buildingInfo.constructionYear != null && buildingInfo.constructionYear != 0) {
                triviaIsEmpty = false;
                $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Year built") + ': </strong></td>' +
                    '<td class="trivia-detail">' + buildingInfo.constructionYear + '</td></tr>');
            }
            if (buildingInfo.architect != null) {
                triviaIsEmpty = false;
                $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Architect") + ': </strong></td>' +
                    '<td class="trivia-detail">' + buildingInfo.architect + '</td></tr>');
            }
            if (buildingInfo.interiorDesigner != null) {
                triviaIsEmpty = false;
                $("#triviaBody").append('<tr><td class="trivia-cell-title"><strong>' + i18n.get("Decoration") + ': </strong></td>' +
                    '<td class="trivia-detail">' + buildingInfo.interiorDesigner + '</td></tr>');
            }
            if (!triviaIsEmpty) {
                $(".trivia-section").css("display", "block");
            }
            triviaDeferred.resolve();
        }
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return triviaDeferred.promise();
}

var sliderInitialized = false;
function asyncFetchImages() {
    var imagesDeferred = jQuery.Deferred();
    setTimeout(function() {
                // If no pictures found, hide the slider...
                if (pictures.length === 0) {
                    $('#sliderBox').css('display', 'none');
                    imagesDeferred.resolve();
                }
                $.when( generateImages(pictures) ).then  (
                    function() {
                        noImages = false;
                        setTimeout(function() {
                            var combinedLenght = pictures.length + igImages.length;
                            length = combinedLenght;
                            //$('.top-left').replaceWith('<i class="top-left"><span id="currentSlide"></span></i>/' + data.pictures.length);
                            if(!sliderInitialized) {
                                $(".rslides").responsiveSlides({});
                                sliderInitialized = true;
                            }
                            else {
                                $( ".rslides1_on" ).unbind();
                                $( "#sliderBox" ).unbind();
                                $("#sliderPlay").unbind();

                                $(".rslides").responsiveSlides({});
                            }

                            $('.slider-counter').append('/' + combinedLenght);
                            // Exit fullscreen if clicking the .rslides and not within 75px range from the center.
                            $('.rslides').on('click', function () {
                                if (!$("#sliderBox").hasClass("small-slider")) {
                                    var centerPos = $(window).scrollTop() + $(window).height() / 2;
                                    if (!(event.clientY >= centerPos - 75 && event.clientY <= centerPos + 75)) {
                                        //toggleFullScreen("#sliderBox");
                                        //expandedSliderToggler();
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
                                    $("#sliderBox").addClass('hovering');
                                }
                            });
                            $("#sliderBox").mouseleave(function () {
                                if ($("#sliderBox").hasClass('hovering') && $("#sliderBox").hasClass("small-slider")) {
                                    $("#sliderBox").removeClass('hovering');
                                }
                            });
                            $( "#expandSlider" ).on('click', function () {
                                expandedSliderToggler();
                                //toggleFullScreen('#sliderBox');
                            });
                            imagesDeferred.resolve()
                        }, 250 );
                    }
                );
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return imagesDeferred.promise();
}

function expandedSliderToggler() {
    /* TO DO: Implement expanded slider for IE iOS.
    if(isIOS || isIE) {
        $('#sliderBox').toggleClass("small-slider");
        var sliderPos = $("#sliderBox").position().top -50;
        $('#sliderBox').toggleClass("expanded-slider");
        var sliderHeight = $("#sliderBox").height();
        var bodyHeight = $("body").height();
        var newBodyHeight = sliderHeight + bodyHeight - sliderPos;
        if($('#sliderBox').hasClass("expanded-slider")) {
            $('#sliderBox').css("top", sliderPos);
            $('body').css("height", newBodyHeight);
        }
        else {
            $('#sliderBox').css("top", "");
            $('body').css("height", "");
        }
        adjustParentHeight(500);
    }
    else {*/
        toggleFullScreen("#sliderBox");
    //}
}

function asyncFetchLocation() {
    var locationDeferred = jQuery.Deferred();
    setTimeout(function() {
            if (address != null) {
                contactsIsEmpty = false;
                if (isEmpty($('#streetAddress'))) {
                    if (address.street != null && address.zipcode != null && address.city != null) {
                        $("#streetAddress").append('<p><strong>' + i18n.get("Address") + '</strong><br>' + libName + '<br>' + address.street + '<br>' + address.zipcode + ' ' + address.city + '</p>');
                    }
                }
                if (isEmpty($('#postalAddress'))) {
                    if (mailAddress != null && mailAddress.area != null) {
                        var boxNumber = '';
                        // Use boxNumber, if null use address
                        if (mailAddress.boxNumber !== null) {
                            boxNumber = 'PL ' + mailAddress.boxNumber;
                        }
                        else {
                            boxNumber = address.street;
                        }
                        // Generate postal address based on available data.
                        var postalString = '';
                        if(libName !== null && libName.length !== 0) {
                            postalString += libName + '<br>';
                        }
                        if(boxNumber != null && boxNumber.length !== 0) {
                            postalString += boxNumber + '<br>';
                        }
                        if(mailAddress.zipcode !== null && mailAddress.zipcode.length !== 0) {
                            postalString += mailAddress.zipcode + ' ';
                        }
                        if(mailAddress.area !== null && mailAddress.area.length !== 0) {
                            postalString += mailAddress.area;
                        }
                        if(postalString !== libName + '<br>') {
                            $("#postalAddress").append('<p><strong>' + i18n.get("Postal address") + '</strong><br>' + postalString + '</p>');
                        }
                    }
                    else {
                        // If no postal address, hide header & increase map size.
                        $("#contactsFirstCol").addClass( "col-md-5");
                        $("#contactsFirstCol").removeClass( "col-md-7" );
                        $("#contactsMapCol").addClass( "col-md-7");
                        $("#contactsMapCol").removeClass( "col-md-5" );
                        // Oddly col-sm-12 is required for smaller displays.
                        $("#streetAddress").addClass( "col-12" );
                        $("#streetAddress").removeClass( "col-md-6" );
                        $("#postalAddress").css('display', 'none');
                    }
                }
                // Get coordinates to be used in loadMap function.
                // Map coordinates (marker)
                if (coordinates != null) {
                    lon = coordinates.lon;
                    lat = coordinates.lat;
                }
            }
            if (email != null && email.length !== 0) {
                contactsIsEmpty = false;
                if(!checkIfContactExists(contactlist, email)) {
                    contactlist.push({name: i18n.get("Generic email"), contact: email});
                }
            }
            // Show navigation if content.
            if (!contactsIsEmpty) {
                $('#navInfo').css('display', 'block');
                $('#navContacts').css('display', 'block');
            }
            locationDeferred.resolve();
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
        $('.leaflet-control-attribution').replaceWith('<div class="leaflet-control-attribution leaflet-control">© <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></div>');
        function addCoordinatesToMap() {
            var addCoordinatesDeferred = jQuery.Deferred();
            setTimeout(function() {
            if(libraryList.length !== 0) {

                var markerIcon = L.divIcon({
                    html: '<i class="fas fa-book-reader"></i>',
                    iconSize: [24, 24],
                    popupAnchor:  [-10, -1], // point from which the popup should open relative to the iconAnchor
                    className: 'lib-marker'
                });

                var counter = 0;
                // coordinateErrorSet is used when a library is listed twice in the listing. (Mobile library of Wiitaunion)
                var coordinateErrorSet = false;
                for (var i = 0; i < libraryList.length; i++) {
                    var text = '<strong>' + libraryList[i].text + '</strong><br>' +
                        libraryList[i].street + ', <br>' + libraryList[i].zipcode + ', ' + libraryList[i].city +
                        '<br><button type="button" value="' + libraryList[i].id + '" class="map-library-changer btn btn-md btn-primary py-0 mb-3">' +
                        i18n.get("Fetch details") + '</button>';
                    if(libraryList[i].id == library) {
                        text = '<strong>' + libraryList[i].text + '</strong><br>' +
                            libraryList[i].street + ', <br>' + libraryList[i].zipcode + ', ' + libraryList[i].city;
                        // Add a notification text about missing coordinates for map.
                        if(libraryList[i].coordinates === null && !coordinateErrorSet) {
                            $('#mapContainer').append('<div id="noCoordinates">' + i18n.get("Note") + '! ' +
                                libraryList[i].text.toString() + i18n.get("No coordinates") + '</div>');
                            coordinateErrorSet = true;
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

var noLinks = true;
var igImages = [];
var igName;
var fbPageNames = [];
var fbScriptLoaded = false;
var fbWidgetSetUp = false;
var descriptionWidth = Math.round($('.news-description').width());
function generateFbWidgets() {
    // Do not generate the widget if we are in contacts. This will be re-triggered when moving to the description.
    if(fbPageNames.length == 0 || activeTab == 1) {
        return;
    }
    var fbHTML = "";
    var adaptWidth = "true";
    var fbWidth = 500;
    var bsCols = "col-lg-6 col-md-12";
    // The widget has a bug in iOS where switching to events tab does not work as it just jumps back to timeline.
    var tabs = "timeline,events";
    if(isIOSMobile) {
        tabs = "timeline";
    }
    // Descriptionheight is used with side by side layout. This is increased if 2 col layout is used.
    var descriptionHeight = 500;
    var leftBarWidth = Math.round($('#leftBar').outerWidth());
    // If FB widget is not atleast 316 px in width, the event dates are not visible.
    if(leftBarWidth < 632) {
        bsCols = "";
    }
    if(leftBarWidth < 500) {
        fbWidth = Math.round($('body').width());
        adaptWidth = "false";
    }
    else if(leftBarWidth < 1000 && fbPageNames.length != 1) {
        fbWidth = fbWidth/2;
    }
    if(fbWidth > leftBarWidth) {
        fbWidth = leftBarWidth ;
    }
    if(fbWidth < 316) {
        fbWidth = 316;
    }
    if(fbPageNames.length == 1) {
        if (!isEmpty($('#introContent'))) {
            $('.news-description').addClass(bsCols);
            if(leftBarWidth > 632) {
                descriptionHeight = Math.round($('.news-description').height() -50);
            }
        }
        else {
            $('.news-description').hide();
        }
        // If description + fb do not fit together, don't set fb height to description height.
        descriptionWidth = Math.round($('.news-description').width());
        // If we use smaller than xl, event calendar date icons are lost because the frame gets too small.
        fbHTML =  '<div class="fb-page ' + bsCols + '" style="width: ' + fbWidth + '; margin-bottom: 2em;" data-href="https://www.facebook.com/' + fbPageNames[0] + '" data-tabs="' + tabs + '" data-width="' + fbWidth + 'px" data-height="' + descriptionHeight + 'px" data-small-header="' + adaptWidth + '" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false"></div>';
        $('.news-description').after(fbHTML);
    }
    else {
        var feedOne = "";
        var feedTwo = "";
        // Feeds 3 & 4 are only used with iOS mobile..
        var feedThree = "";
        var feedFour = "";
        for (var i = 0; i < fbPageNames.length; i++) {
            // Max 2 feeds.
            if(i == 0) {
                feedOne = '<div class="fb-page ' + bsCols + '" data-href="https://www.facebook.com/' + fbPageNames[0] + '" data-tabs="' + tabs + '" data-width="' + fbWidth + 'px" data-height="' + descriptionHeight + 'px" data-small-header="true" data-adapt-container-width="' + adaptWidth + '" data-hide-cover="false" data-show-facepile="false"></div>';
            }
            if(i == 1) {
                // 2nd item is for events in iOS
                if(isIOSMobile){
                    tabs = "events"
                }
                feedTwo = '<div class="fb-page ' + bsCols + '" data-href="https://www.facebook.com/' + fbPageNames[1] + '" data-tabs="' + tabs + '" data-width="' + fbWidth + 'px" data-height="' + descriptionHeight + 'px" data-small-header="true" data-adapt-container-width="' + adaptWidth + '" data-hide-cover="false" data-show-facepile="false"></div>';
            }
            if(i == 2 && isIOSMobile) {
                tabs = "timeline";
                feedThree = '<div class="fb-page ' + bsCols + '" data-href="https://www.facebook.com/' + fbPageNames[2] + '" data-tabs="' + tabs + '" data-width="' + fbWidth + 'px" data-height="' + descriptionHeight + 'px" data-small-header="true" data-adapt-container-width="' + adaptWidth + '" data-hide-cover="false" data-show-facepile="false"></div>';
            }
            if(i == 3 && isIOSMobile) {
                tabs = "events";
                feedFour = '<div class="fb-page ' + bsCols + '" data-href="https://www.facebook.com/' + fbPageNames[3] + '" data-tabs="' + tabs + '" data-width="' + fbWidth + 'px" data-height="' + descriptionHeight + 'px" data-small-header="true" data-adapt-container-width="' + adaptWidth + '" data-hide-cover="false" data-show-facepile="false"></div>';
            }
        }
        fbHTML = '<div class="row" style="width: 100vmin; margin-bottom: 2em;">' + feedOne + feedTwo +
            feedThree + feedFour + '</div>';
        $('.news-description').after(fbHTML);
    }
    // Load the fb script if not already loaded.
    if(!fbScriptLoaded) {
        fbScriptLoaded = true;
        var fbScript = "https://connect.facebook.net/fi_FI/sdk.js#xfbml=1&version=v3.3";
        if(lang != "fi") {
            fbScript = "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v3.3"
        }
        var script = document.createElement('script');
        /*script.onload = function () {
            console.log("D O  A F T E R  I N I T")
        }*/
        script.src = fbScript;
        document.head.appendChild(script); //or something of the likes
    }
    // After lib has changed.
    else {
        FB.init({
            status: true,
            xfbml: true,
            version: 'v3.3'
        });
    }
    fbWidgetSetUp = true;
    adjustParentHeight();
}

function asyncFetchLinks() {
    var linksDeferred = jQuery.Deferred();
    setTimeout(function() {
        // Social media links
            noLinks = true;
            var linkCount = 0;
            // Loop the links of group category [0].
            var loopCounter = 0;
            if(links.length === 0) {
                linksDeferred.resolve();
            }
        var igExists = false;
        links.forEach(function (element) {
            // Get url.
            var url = element.url;
            if (url === null) {
                return
            }
            var description = "";
            if(element.description !== null && element.description.length > 1) {
                description =  "<br>" + element.description;
            }
            if (url.indexOf("facebook") !== -1) {
                linkCount = linkCount +1;
                $(".some-links").append('<a target="_blank" ' +
                    'href="' + url + '" title="' + i18n.get("Librarys") + ' Facebook"> <i class="fab ' +
                    'fa-facebook-square"></i></a>');
                var fbName = url;
                if (fbName.charAt(fbName.length - 1) == '/') {
                    fbName = fbName.substr(0, fbName.length - 1);
                }
                var index = fbName.lastIndexOf("/");
                var fbName = fbName.substr(index+1);
                fbPageNames.push(fbName);
                // Push twice for iPhones + pads/(pods?), since the tab switching is broken...
                if(isIOSMobile) {
                    fbPageNames.push(fbName);
                }
            }
            else if (url.indexOf("instagram") !== -1) {
                igExists = true;
                linkCount = linkCount +1;
                $(".some-links").append('<a target="_blank" title="' + i18n.get("Librarys") + ' Instagram"' +
                    'href="' + url + '">  <i class="fab fa-instagram"></i></a>');
                igName = url;
                if (igName.charAt(igName.length - 1) == '/') {
                    igName = igName.substr(0, igName.length - 1);
                }
                var index = igName.lastIndexOf("/");
                var igName = igName.substr(index+1);
                // Fetch ig images (+ captions & likes) via the IG api.
                $.getJSON('https://www.instagram.com/' + igName + '/?__a=1', function (data) {
                    var images = data.graphql.user.edge_owner_to_timeline_media.edges;
                    for (var i=0; i<images.length; i++) {
                        // Limit to 10 latest images.
                        if(i===10) {
                            linksDeferred.resolve();
                            return;
                        }
                        var url = images[i].node.display_url;
                        var shortcode = images[i].node.shortcode;
                        var likes = images[i].node.edge_liked_by.count;
                        var caption = "";
                        if(images[i].node.edge_media_to_caption.edges[0] !== undefined) {
                            caption = images[i].node.edge_media_to_caption.edges[0].node.text;
                        }
                        var tagsToReplace = [];
                        var reFindTags = new RegExp(/#\S+\s*/g);
                        var reFindTagsExec = reFindTags.exec(caption);
                        while (reFindTagsExec != null) {
                            var tagText = reFindTagsExec[0];
                            tagText = tagText.replace(" ", "");
                            var tagLink = tagText.substring(1);
                            tagLink = '<a target="_blank" class="external-link" href="https://www.instagram.com/explore/tags/' + tagLink
                                + '/">' + tagText + '</a> ';
                            tagsToReplace.push({position: reFindTagsExec[0],
                                replacement: tagLink, type: "tag"});
                            reFindTagsExec = reFindTags.exec(caption);
                        }
                        var reFindUsers = new RegExp(/@\S+\s*/g);
                        var reFindUsersExec = reFindUsers.exec(caption);
                        while (reFindUsersExec != null) {
                            var tagText = reFindUsersExec[0];
                            tagText = tagText.replace(" ", "");
                            var tagLink = tagText.substring(1);
                            tagLink = '<a target="_blank" class="external-link" href="https://www.instagram.com/' + tagLink
                                + '/">' + tagText + '</a> ';
                            tagsToReplace.push({position: reFindUsersExec[0],
                                replacement: tagLink, type: "user"});
                            reFindUsersExec = reFindUsers.exec(caption);
                        }
                        for (var t = 0; t < tagsToReplace.length; t++) {
                            // If we have tags #foobar & #foo, #foo would re-place #foobar incorrectly.
                            if(tagsToReplace[t].type == "tag") {
                                caption = caption.replace(tagsToReplace[t].position,
                                    tagsToReplace[t].replacement.replace("#", "%%%"));
                            }
                            else {
                                caption = caption.replace(tagsToReplace[t].position,
                                    tagsToReplace[t].replacement.replace("@", "<<><<>"));
                            }
                        }
                        caption = caption.replace(/%%%/g,'#');
                        caption = caption.replace(/<<><<>/g,'@');
                        igImages.push({url: url, shortcode: shortcode, likes: likes, caption: caption});
                    }
                    linksDeferred.resolve();
                    });
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
                                contact: prettyUrl + description});
                            linkCount = linkCount +1;
                        }
                    }
                }
                loopCounter = loopCounter +1;
                if(loopCounter === links.length) {
                    // Mention links in title, if any are present.
                    if(linkCount !== 0 ) {
                        noLinks = false;
                    }
                    if(!igExists){
                        linksDeferred.resolve();
                    }
                }
            });
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return linksDeferred.promise();
}

function asyncGenerateNumbers() {
    var numbersDeferred = jQuery.Deferred();
    setTimeout(function() {
        var counter = 0;
            if(phoneNumbers.length !== 0) {
                for (var i = 0; i < phoneNumbers.length; i++) {
                    // Check if detail is unique.
                    if(!checkIfContactExists(numbersList, phoneNumbers[i].number)) {
                        var description = "";
                        if(phoneNumbers[i].description !== null && phoneNumbers[i].description.length > 1) {
                            description = phoneNumbers[i].description;
                        }
                        numbersList.push({name: phoneNumbers[i].name,
                            contact: phoneNumbers[i].number + description});
                    }
                    counter = counter +1;
                }
                // If we have looped all, set as resolved, thus moving on.
                if(counter === phoneNumbers.length) {
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
            else if(phoneNumbers === undefined || phoneNumbers.length === 0) {
                numbersDeferred.resolve()
            }
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return numbersDeferred.promise();
}

function asyncGenerateStaff() {
    var staffDeferred = jQuery.Deferred();
    setTimeout(function() {
        var counter = 0;
        if(persons.length !== 0) {
            for (var i = 0; i < persons.length; i++) {
                var name = persons[i].firstName + ' ' + persons[i].lastName;
                if (persons[i].jobTitle !== null) {
                    name += ' – ' + persons[i].jobTitle;
                }
                // Do not include contacts with null emails.
                if(persons[i].email != null || persons[i].phone != null) {
                    // Check if name or detail is unique.
                    var contact = "";
                    if(persons[i].email != null) {
                        contact = contact + persons[i].email;
                        if(persons[i].phone != null && persons[i].phone.length !== 0) {
                            contact = contact + "<br>" + persons[i].phone;
                        }
                    }
                    else {
                        if(persons[i].phone.length !== 0) {
                            contact = contact + persons[i].phone;
                        }
                    }
                    if (!checkIfContactExists(staffList, contact) || !checkIfNameExists(staffList, name)){
                        // Don't push if contact or name is empty.
                        if(contact.length !== 0 && name.length !== 0) {
                            // Note: Staff does not have description field.
                            staffList.push({name: name, contact: contact});
                        }
                    }
                }
                counter = counter +1;
            }
            // If we have looped all, set as resolved, thus moving on.
            if(counter === persons.length) {
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
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return staffDeferred.promise();
}

// Fetch numbers & staff, then generate the list.
function generateContacts() {
    var contactsDeferred = jQuery.Deferred();
    setTimeout(function() {
        if (isEmpty($('#contactsTbody'))) {
            $.when( asyncGenerateNumbers(), asyncGenerateStaff() ).then  (
                function() {
                    if(contactlist.length === 0 && staffList.length === 0 && numbersList.length === 0) {
                        contactlist.push({name: i18n.get("No contacts"), contact: ""});
                    }
                    // Links & generic email.
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
                    // Phones
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
                    // Staff
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
                    // Show navigation if content.
                    if (!isEmpty($('#contactsTbody'))) {
                        $('#navInfo').css('display', 'block');
                        $('#navContacts').css('display', 'block');
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
    jsonpUrlV4 = "https://api.kirjastot.fi/v4/library/" + lib + "?lang=" + language + withParams;
    // Fetch generic details.
    function triggerFetch() {
        var fetchDeferred = jQuery.Deferred();
        setTimeout(function() {
            if(!isReFetching) {
                $.when( asyncFetchV4Data() && asyncFetchServiceNamesInOppositeLang() ).then(
                    function() {
                        $.when( asyncGenerateGenericDetails(), asyncGenerateTrivia(), asyncFetchDepartments(),
                            asyncFetchLinks(), asyncFetchLocation()).then(
                            function() {
                                $.when( asyncFetchImages(), asyncFetchServices(), asyncLoadMap(), generateContacts()  ).then(
                                    function() {
                                        // Generate links & contacts text based on if links were found or not.
                                        if(!noLinks) {
                                            $('#contactsTitle').append('<span>' + i18n.get("Links and contacts") + '</span>');
                                        } else {
                                            $('#contactsTitle').append('<span>' + i18n.get("Contacts") + '</span>');
                                        }
                                        fetchDeferred.resolve();
                                    });
                            });
                    });
            }
            else {
                $.when( asyncGenerateGenericDetails() ).then(
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
                if(language === "fi") {
                    var noLeftCol = false;
                    var noSidebar = false;
                    if(noServices) {
                        $('#libraryServices').css('display', 'none');
                        // If no content is provided for the left column.
                        if (descriptionIsEmpty) {
                            if(slogan !== null) {
                                if(slogan.length <2) {
                                    noLeftCol = true;
                                }
                            }
                            else {
                                noLeftCol = true;
                            }
                        }
                    }
                    else {
                        $("#closeModal").text(i18n.get("Close"));
                    }
                    // Right bar is empty.
                    if(isScheduleEmpty && !schedulesAreAvailable && noImages && triviaIsEmpty) {
                        noSidebar = true;
                    }
                    if(noLeftCol) {
                        // Hide the content on left, make the sidebar 100% in width.
                        $(".details").css("display", "none");
                        $("#leftBar").css("display", "none");
                        $("#introductionSidebar").removeClass("col-lg-5 col-xl-4 order-2 sidebar");
                        $("#introductionSidebar").addClass("col-md-12");
                        $("#sliderBox").removeClass("small-slider");
                        $("#expandSlider").css("display", "none");
                        $('.slider-play-container').css('margin-left', '-10px');
                    }
                    if(noSidebar && !noLeftCol) {
                        $(".introductionSidebar").css("display", "none");
                        $("#leftBar").addClass("col-md-12");
                        $("#leftBar").removeClass("col-lg-5 col-xl-4 order-2 col-sm-12 col-md-7 col-lg-7 col-xl-8 col-md-12");
                        $("#leftBar").css("border", "none");
                    }
                    // No content at all.
                    if(noLeftCol && noSidebar) {
                        $("#introductionSidebar").append('<div id="noIntroContent"><h3>' +
                            i18n.get("No content") + ' <i class="fas fa-frown-o"></i></h3></div>');
                    }
                    // Generate mailto links into the contacts table + descriptions. If we do this for all things, modal links and hover popups break.
                    // https://www.joe-stevens.com/2010/02/18/convert-all-static-text-email-addresses-to-mailto-links-using-jquery/
                    $().ready(function() {
                        var regEx = /(\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)/;
                        $("#introContent, #accessibilityDetails, table td").filter(function() {
                            return $(this).html().match(regEx);
                        }).each(function() {
                            $(this).html($(this).html().replace(regEx, "<a href=\"mailto:$1\">$1</a>"));
                        });
                    });
                    // Generate FB widget(s)
                    generateFbWidgets();
                }
                adjustParentHeight(200);
            }
        }
    );
}
