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
var serviceNames = [];
function addItem(item, listElement) {
    var name = item.name;
    // Use "custom_name", where available.
    if (item.custom_name != null && item.custom_name.length != 0) {
        name = item.custom_name;
    }
    if(listElement === "#accessibilityItems" && accessibilityIsEmpty) {
        if (isEmpty($('#accessibilityDetails'))) {
            // Description.
            if (item.description != null && item.description.length != 0) {
                accessibilityIsEmpty = false;
                $(".accessibility-details").css("display", "block");
                $("#accessibilityDetails").append('<p>' + item.description.replace(/(<a )+/g, '<a target="_blank" ') + '</p>');
            }
        }
        // List of values separated by "," in the short description.
        if (item.shortDescription !== null && isEmpty($('#accessibility-images')) && isEmpty($('#accessibilityList'))) {
            accessibilityIsEmpty = false;
            $(".accessibility-details").css("display", "block");
            var splittedValues = item.shortDescription.split(",");
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
        // serviceNames list is used to navigate to the service via url.
        serviceNames.push(name);
        // Add popup link if additional details are available.
        if (item.shortDescription != null && item.shortDescription.length != 0 ||
            item.description != null && item.description.length != 0) {
            var description = "";
            if (item.shortDescription != null && item.shortDescription.length != 0) {
                description = '<p>' + item.shortDescription + '</p>';
            }
            var websiteLink = item.website;
            // Add "long" description where available.
            if (item.description != null && item.description.length != 0) {
                // Replace row splits with <br>
                var longDescription = item.description.replace(/\r\n/g, "<br>");
                description = '<p>' + description + '</p><p>' + longDescription + '</p>';
            }
            // Replace links from the description
            if (description.indexOf("<a href=") !== -1) {
                // Make all links external.
                //description = description.replace(/(<a href=")+/g, '<a class="external-link" target="_blank" href="');
                // Generate iframes from links that contain "embed"
                var linksToReplace = [];
                var reFindLinks = new RegExp(/<a\b[^>]*>(.*?)<\/a>/g);
                var reFindLinksExec = reFindLinks.exec(description);
                while (reFindLinksExec != null) {
                    // If link contains "embed", turn it into iframe.
                    if (reFindLinksExec[0].indexOf("embed") !== -1) {
                        // Find url
                        var urlOfLink = new RegExp(/"(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?"/g).exec(reFindLinksExec[0]);
                        // Generate iframe
                        var iframeCode = '<iframe frameborder="0" height="500px" scrolling="no" src='  + urlOfLink[0] + ' width="100%"></iframe>';
                        // Push to array
                        linksToReplace.push({position: reFindLinksExec[0], replacement: iframeCode});
                    }
                    // Normal links
                    else {
                        // Push to array
                        linksToReplace.push({position: reFindLinksExec[0], replacement: reFindLinksExec[0].replace(/(<a href=")+/g, '<a class="external-link" target="_blank" href="')});
                    }
                    // Loop all links.
                    reFindLinksExec = reFindLinks.exec(description);
                }
                // Loop & add iframes from embedded links.
                for (var i = 0; i < linksToReplace.length; i++) {
                    description = description.replace(linksToReplace[i].position, linksToReplace[i].replacement);
                }
            }

            // Add price where available.
            if (item.price != null && item.price.length != 0) {
                description = description + '<p><strong>' + i18n.get("Hintatiedot") + ':</strong> ' + item.price + '</p>';
            }
            // Replace quotes from the description., they would break things...
            description = description.replace(/["']/g, '&quot;');
            // Add the item to a desired element.
            $(listElement).append('<li> ' +
                '<a class="index-item" data-name="' + name + '"  data-message="' + description + '" data-website="' + websiteLink + '" tabindex="0" href="#"' +
                ' role="button" aria-expanded="false"' +
                ' title="' + name + '">' + name + '</a></li>');
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

function bindActions() {
    // Navigation events
    function navigateToDefault(animationTime) {
        // Hide other sections & active nav styles.
        $("#navYhteystiedot").removeClass( "active" );
        $(".yhteystiedot").hide(animationTime);
        // Show selected section + add active to nav
        $("#navEsittely").addClass( "active" );
        $(".esittely").show(animationTime);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleModal();
        }
        if(activeTab === 1) {
            activeTab = 0;
            adjustParentHeight(animationTime);
            adjustParentUrl('', 'introduction');
        }
    }

    function navigateToContacts(animationTime) {
        // Hide other sections & active nav styles.
        $("#navEsittely").removeClass( "active" );
        $(".esittely").hide(animationTime);
        // Show selected section + add active to nav.
        $("#navYhteystiedot").addClass( "active" );
        $(".yhteystiedot").show(animationTime);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleModal();
        }
        if(activeTab === 0) {
            adjustParentHeight(animationTime);
            activeTab = 1;
            // Map zoom gets messed if the map is loaded before hiding the map div.
            if(!mapLoaded) {
                setTimeout(function(){
                    // If we try to set view & open the popup in asyncLoadMap, things get messed.
                    if(lat !== undefined) {
                        map.setView([lat, lon], 15);
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
                }, 600);
                mapLoaded = true;
            }
        }
        if(lang === "fi") {
            adjustParentUrl('yhteystiedot', 'contact');
        }
        else {
            adjustParentUrl('contacts', 'contact');
        }
    }

    $( "#navEsittely" ).on('click', function () {
        navigateToDefault(600);
    });

    $( "#navYhteystiedot" ).on('click', function () {
        navigateToContacts(600);
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
        }
    });

    $(".nav-pills").mouseleave(function () {
        if ($(".nav-pills").hasClass('hovering')) {
            $(".nav-pills").removeClass('hovering');
        }
    });


    if(activeTab === 0) {
        $.when( navigateToDefault(0) ).then(
            function() {
                //adjustParentHeight();
            }
        );
    }

    if(activeTab === 1) {
        navigateToContacts(0);
    }
}

// Timer  is used to stop onresize event from firing after adjustment is done by triggering the function manually.
var isAdjustingHeight = false;
var clearTimer;
function setAdjustingToFalse() {
    clearTimer = setTimeout(function(){
        isAdjustingHeight = false;
    }, 1200);
}

var height = 0;
function adjustParentHeight(delay) {
    clearTimeout(clearTimer);
    isAdjustingHeight = true;
    delay = delay + 150;
    setTimeout(function(){
        try {
            var newHeight = 75;
            newHeight = newHeight + document.getElementById("mainContainer").scrollHeight;
            if(isInfoBoxVisible) {
                var popoverHeight = document.getElementById("modalContentContainer").scrollHeight;
                if(popoverHeight > 400) {
                    popoverHeight = popoverHeight - 375;
                    newHeight = newHeight + popoverHeight;
                }
            }
            if(newHeight !== height) {
                parent.postMessage({value: newHeight, type: 'resize'}, '*');
            }
            height = newHeight;
            setAdjustingToFalse();

        }
        catch (e) {
            console.log("iframe size adjustment failed: " + e);
        }
    }, delay);
}
/* If iframe has no referrerpolicy="unsafe-url" attribute, FF private mode blocks url from passing to iframe.
  https://gist.github.com/olli-suutari-jkl/8d6ccbc7d3c4e3b563bd5b7cbee095e2
 */
function adjustParentUrl(toAdd, type) {
    /*
    if(isFFPrivate) {
        //return;
    }*/
    refUrl = refUrl.replace(/ /g, "-");
    refUrl = refUrl.replace(/%20/g, "-");
    refUrl = refUrl.replace(/\(/g, "");
    refUrl = refUrl.replace(/\)/g, "");
    refUrl = refUrl.toLowerCase();
    toAdd = toAdd.toLowerCase();
    toAdd = toAdd.replace(/ /g, "-");
    toAdd = toAdd.replace(/ä/g, "a");
    toAdd = toAdd.replace(/ö/g, "o");
    toAdd = toAdd.replace(/\(/g, "");
    toAdd = toAdd.replace(/\)/g, "");

    // Remove item from url, if it already exists.
    refUrl = refUrl.replace(new RegExp(toAdd,"i"), "");
    // Check for services.
    if(type !== "introduction" && type !== "contact") {
        // Loop services and check if refUrl contains one of them, if so remove it.
        for (var i = 0; i < serviceNames.length; i++) {
            var serviceName = serviceNames[i].toLowerCase();
            serviceName = serviceName.replace(/ /g, "-");
            serviceName = serviceName.replace(/ /g, "-");
            serviceName = serviceName.replace(/ä/g, "a");
            serviceName = serviceName.replace(/ö/g, "o");
            serviceName = serviceName.replace(/\(/g, "");
            serviceName = serviceName.replace(/\)/g, "");
            if(refUrl.indexOf(serviceName) > -1) {
                refUrl = refUrl.replace(serviceName, "");
            }
        }
    }
    // Remove contacts from url if navigating to introduction.
    if(type === "introduction") {
        refUrl = refUrl.replace(/yhteystiedot/g, "");
        refUrl = refUrl.replace(/contacts/g, "");
    }
    // Loop libraries and check if refUrl contains one of them, if so remove it.
    if(type === "library") {
        for (var i = 0; i < libraryList.length; i++) {
            var libraryName = libraryList[i].text.toLowerCase();
            libraryName = libraryName.replace(/ /g, "-");
            libraryName = libraryName.replace(/ä/g, "a");
            libraryName = libraryName.replace(/ö/g, "o");
            libraryName = libraryName.replace(/\(/g, "");
            libraryName = libraryName.replace(/\)/g, "");
            if(refUrl.indexOf(libraryName.toLowerCase()) > -1) {
                refUrl = refUrl.replace(
                    new RegExp(libraryName,"i"), "");
            }
        }
    }
    if(toAdd !== ''){
        refUrl = refUrl + "?" + toAdd;
    }
    // Remove duplicated ?
    refUrl = refUrl.replace(/[?]{2,}/g, "?");
    // Remove ? if last character.
    refUrl = refUrl.replace(/\?$/, '');
    try {
        parent.postMessage({value: refUrl, type: 'url'}, '*');
    }
    catch (e) {
        console.log("Parent url adjustment failed: " + e);
    }
}

// divClone & active tab are used with consortium.js
var divClone = '';
var map;
$(document).ready(function() {
    bindActions();
    $( "#closeInfoBtn" ).on('click', function () {
        toggleInfoBox(200);
    });

    map = L.map('mapContainer');
    // UI texts.
    if($('#librarySelectorTitle')) {
        $('#librarySelectorLabel').append(i18n.get("Kirjaston valinta"));
    }
    $('#navEsittely').append(i18n.get("Esittely"));
    $('#navYhteystiedot').append(i18n.get("Yhteystiedot"));
    $('#transitTitle').append(i18n.get("Liikenneyhteydet"));
    $('#socialMediaSr').append(i18n.get("Sosiaalinen media"));
    $('#srPictures').append(i18n.get("Kuvia kirjastolta"));
    document.getElementById('expandSlider').title = i18n.get("Avaa tai sulje kokoruututila");
    // Yhteystiedot UI texts.
    document.getElementById('expandMap').title = i18n.get("Avaa tai sulje kokoruututila");
    $('#locationTitle').append(i18n.get("Sijainti"));
    $('#srAddress').append(i18n.get("Osoitetiedot"));
    $('#transitDetailsTitle').append(i18n.get("Ohjeita liikenteeseen"));
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
    // Fetch details if not generating select for libraries, otherwise trigger this in consortium.js
    if(consortium === undefined && city === undefined) {
        fetchInformation(lang);
    }

    // Add event listener for resizing the window, adjust parent when done so.
    // https://stackoverflow.com/questions/5489946/jquery-how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-ac
    var rtime;
    var timeout = false;
    var delta = 200;
    $(window).resize(function() {
        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(resizeend, delta);
        }
    });
    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            timeout = false;
            if(!isAdjustingHeight) {
                adjustParentHeight(1);
            }
        }
    }
}); // OnReady
