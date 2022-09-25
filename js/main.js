var isIOS = false;
var isIOSMobile = false;
var isIE = false;

function toggleFullScreen(target) {
    // if already full screen; exit
    // else go fullscreen
    // If slider, toggle small-slider class.
    if(target === "#sliderBox") {
        $('#sliderBox').toggleClass("small-slider");
        $('#sliderBox').toggleClass("full-screen-slider");
        adjustParentHeight(500)
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
// toggleFullScreen is not fired when  exiting fullscreen on (chrome + others?) with ESC.
document.addEventListener('fullscreenchange', exitHandler);
document.addEventListener('webkitfullscreenchange', exitHandler);
document.addEventListener('mozfullscreenchange', exitHandler);
document.addEventListener('MSFullscreenChange', exitHandler);
function exitHandler() {
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        // TO DO: this leaves a smallish black margin to the left of the 1st image after exiting the slider.
        $('#sliderBox').addClass("small-slider");
        $('#sliderBox').removeClass("full-screen-slider");

        $('#mapContainer').addClass("map-borders");
    }
    adjustParentHeight(1500)
}

// Remove httml & www from url and / # from the end.
function generatePrettyUrl (url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    // Remove / and # from url if last characters
    if (url.substring(url.length-1) === "/" || url.substring(url.length-1) === "#") {
        url = url.substring(0, url.length-1);
    }
    return url;
}

// Genearate mailto links within a string. There is a different generator for contacts table, this is used only for service modals.
// https://stackoverflow.com/questions/24269116/convert-plain-text-email-to-clickable-link-regex-jquery
function generateMailToLink(string) {
    var result = "";
    if(string.charAt(0) == '"' && string.substr(-1) == '"') {
        string = string.slice(1,-1);
    }
    // Unless we wrap the address to html, we will get an error. TO DO: fix.
    string = '<p>' + string + '</p>';
    $(string).filter(function () {
        var html = $(this).html();
        var emailPattern = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;

        var matched_str = $(this).html().match(emailPattern);
        if ( matched_str ) {
            var text = $(this).html();
            $.each(matched_str, function (index, value) {
                text = text.replace(value,"<a class='no-external-icon' target='_blank' href='mailto:"+value+"'>"+value+"</a>");
            });
            $(this).html(text);
            result = $(this).html(text)[0].innerHTML;
            return $(this)
        }
    });
    return result;
}

function generateWebropolSurveyFrames(description) {
    if (description.indexOf("<a href=") !== -1) {
        // Make all links external.
        //description = description.replace(/(<a href=")+/g, '<a class="external-link" target="_blank" href="');
        // Generate iframes from links that contain "embed"
        var linksToReplace = [];
        var reFindLinks = new RegExp(/<a\b[^>]*>(.*?)<\/a>/g);
        var reFindLinksExec = reFindLinks.exec(description);
        while (reFindLinksExec != null) {
            // If link contains "embed", turn it into iframe.
            if (reFindLinksExec[0].indexOf("webropol") !== -1) {
                // Find url
                var urlOfLink = new RegExp(/"(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?"/g).exec(reFindLinksExec[0]);
                // Generate iframe
                var iframeCode = '<iframe style="overflow-x: hidden;" frameborder="0" height="800px" scrolling="yes" src='  + urlOfLink[0] + ' width="100%"></iframe>';
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
    return description;
}

// Capitalize the 1st letter of a string.
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateAccessibilityImg(translationName, iconPath) {
    translationName = i18n.get(translationName);
    iconPath = "https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/images/accessibility/" + iconPath;
    $(".accessibility-images").append(' <img alt="' + translationName + '" ' +
        'src="' + iconPath + '" data-placement="bottom" title="' + translationName + '" data-toggle="accessibility-tooltip"  /> ');
}

function generateAccessibilityTextBlock(serviceName) {
    var blockItem = '<span class="accessibility-text-block" role="img" alt="' + serviceName +'">' +
        serviceName + ' </span>';
    // Use timeout so actual icons are rendered first.
    setTimeout(function(){
        $(".accessibility-images").append(blockItem);
    }, 100);
}

// Function for adding a new palvelut item.
// Define accessibility count here, define other counts later on.
var accessibilityCount = 0;
var accessibilityIsEmpty = true;
var serviceNames = [];
function addItem(item, listElement) {
    var name = item.standardName;
    // Use "Custom name", where available.
    if (item.name != null && item.name.length != 0) {
        name = item.name;
    }
    if(listElement === "#accessibilityItems" && accessibilityIsEmpty) {
        // List of values separated by "," in the short description.
        if (item.shortDescription !== null && isEmpty($('#accessibility-images'))) {
            accessibilityIsEmpty = false;
            $(".accessibility-details").css("display", "block");
            var splittedValues = item.shortDescription.split(",");
            $.each(splittedValues, function (index, value) {
                accessibilityCount = accessibilityCount + 1;
                if (value.toLocaleLowerCase().indexOf("esteetön sisäänpääsy") !== -1) {
                    generateAccessibilityImg("Accessible entrance", "Esteetön_kulku_saavutettavuus.svg");
                }
                else if (value.toLocaleLowerCase().indexOf("invapysäköinti") !== -1) {
                    generateAccessibilityImg("Disabled parking", "Esteetön_parkki.svg");
                }
                else if (value.toLocaleLowerCase().indexOf("esteetön wc") !== -1) {
                    generateAccessibilityImg("Accessible toilet", "Esteetön_wc.svg");
                }
                else if (value.toLocaleLowerCase().indexOf("hissi") !== -1) {
                    generateAccessibilityImg("Elevator", "Esteetön_hissi.svg");
                }
                else if (value.toLocaleLowerCase().indexOf("pyörätuoliluiska") !== -1) {
                    generateAccessibilityImg("Wheelchar ramp", "Esteetön_ramppi.svg");
                }
                else if (value.toLocaleLowerCase().indexOf("induktiosilmukka") !== -1) {
                    generateAccessibilityImg("Induction loop", "Esteetön_induktiosilmukka.svg");
                }
                else if (value.toLocaleLowerCase().indexOf("suuren kirjasinkoon kokoelma") !== -1) {
                    generateAccessibilityTextBlock(i18n.get("Collection of books with large fonts"));
                }
                else {
                    if (value != null && value.length != 0) {
                        generateAccessibilityTextBlock(value);
                    }
                }
            });
        }
        if (isEmpty($('#accessibilityDetails'))) {
            // Description.
            if (item.description != null && item.description.length != 0) {
                accessibilityIsEmpty = false;
                $(".accessibility-details").css("display", "block");
                if(accessibilityCount !== 0) {
                    $("#accessibilityDetails").append('<h4>' + i18n.get("Accessibility details") + '</h4>')
                }
                $("#accessibilityDetails").append(item.description.replace(/(<a )+/g, '<a target="_blank" '));
            }
        }
        if (accessibilityCount != 0 || !accessibilityIsEmpty) {
            $("#accessibility").css('display', 'block');
            $("#accessibilityTitle").prepend(i18n.get("Accessibility"));
            if(accessibilityCount !== 0) {
                $("#accessibilityBadge").append('(' + accessibilityCount + ')');
                $('[data-toggle="accessibility-tooltip"]').tooltip();
            }
            noServices = false;
        }
    }
    else {
        // serviceNames list is used to navigate to the service via url.
        serviceNames.push(name);
        // Add popup link if additional details are available.
        if (isValue(item.shortDescription) || isValue(item.description) || isValue(item.website) ||
        isValue(item.email) || isValue(item.phoneNumber)) {
            var description = "";
            if (item.shortDescription != null && item.shortDescription.length != 0 &&
                !strippedValueEquals(item.shortDescription, item.name)) {
                var shortDescription = item.shortDescription;
                var lastChar = shortDescription[shortDescription.length -1];
                if(lastChar != "." && lastChar != "!" && lastChar != "?") {
                    shortDescription = shortDescription + ".";
                }
                description = '<p>' + shortDescription + '</p>';
            }
            // Add "long" description where available && not equal to the short one.
            if (item.description != null && item.description.length != 0 && item.description !== item.shortDescription) {
                // Replace row splits with <br>
                var longDescription = item.description.replace(/\r\n/g, "<br>");
                description = '<p>' + description + '</p><p>' + longDescription + '</p>';
            }
            // Accessible icons: https://fontawesome.com/how-to-use/on-the-web/other-topics/accessibility
            // Add price where available.
            if (isValue(item.price)) {
                var priceText = capitalize(item.price);
                if(priceText == "Ilmainen" && lang == "en") {
                    priceText = "Free"
                }
                description = description + '<p class="service-info service-price" aria-label="' + i18n.get("Price") + '">' +
                    '<i class="fas fa-money-bill-alt" data-toggle="tooltip" title="' + i18n.get("Price") + '" data-placement="top"></i>' + priceText + '</p>';
            }
            // Website
            if(isValue(item.website)) {
                var prettyLink = generatePrettyUrl (item.website);
                description = description + '<p class="service-info service-website" aria-label="' + i18n.get("Price") +
                    '"><i class="fas fa-globe" data-toggle="tooltip" title="' + i18n.get("Website") + '" ' +
                    'data-placement="top"></i><a target="_blank" href="' + item.website + '">' +
                    capitalize(prettyLink) + '</a></p>';
            }
            // Email & Phone
            if(isValue(item.email)) {
                var mailToLink = generateMailToLink(capitalize(item.email));
                description = description + '<p class="service-info service-email" aria-label="' + i18n.get("Email") + '">' +
                    '<i class="fas fa-envelope-square" data-toggle="tooltip" title="' + i18n.get("Email") + '" ' +
                    'data-placement="top"></i>' + mailToLink +'</p>';
            }
            if(isValue(item.phoneNumber)) {
                description = description + '<p class="service-info service-phone" aria-label="' + i18n.get("Phone") + '">' +
                    '<i class="fas fa-phone-square" data-toggle="tooltip" title="' + i18n.get("Phone") + '" ' +
                    'data-placement="top"></i>' + capitalize(item.phoneNumber) + '</p>';
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

            // Replace quotes from the description., they would break things...
            description = description.replace(/["']/g, '&quot;');


            // Add the item to a desired element. href javascript... prevents opening in new tab (iframe src is github)
            // https://stackoverflow.com/questions/31472065/preventing-pages-being-open-in-a-new-tab-window
            $(listElement).append('<li> ' +
                '<a class="index-item" data-name="' + name + '"  data-message="' + description + '" tabindex="0" href="javascript:void(0);"' +
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
        $("#navContacts").removeClass( "active" );
        $("#contactsTab").hide(animationTime);
        // Show selected section + add active to nav
        $("#navInfo").addClass( "active" );
        $("#introductionTab").show(animationTime);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleModal();
        }
        if(activeTab === 1) {
            activeTab = 0;
            adjustParentHeight(animationTime);
            adjustParentUrl('', 'introduction');
            // Image slider goes black if we move from contacts, re-adding class with timeout fixes it.
            $("#sliderBox").removeClass("small-slider");
            setTimeout(function(){
                $("#sliderBox").addClass("small-slider");
            }, 600);
            if(!fbWidgetSetUp) {
                generateFbWidgets();
            }
        }
    }

    function navigateToContacts(animationTime) {
        // Hide other sections & active nav styles.
        $("#navInfo").removeClass( "active" );
        $("#introductionTab").hide(animationTime);
        // Show selected section + add active to nav.
        $("#navContacts").addClass( "active" );
        $("#contactsTab").show(animationTime);
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

    $( "#navInfo" ).on('click', function () {
        navigateToDefault(600);
    });

    $( "#navContacts" ).on('click', function () {
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
function adjustParentHeight(delay, elementPosY) {
    clearTimeout(clearTimer);
    isAdjustingHeight = true;
    delay = delay + 150;
    setTimeout(function(){
        try {
            var newHeight = 75;
            newHeight = newHeight + document.getElementById("mainContainer").scrollHeight;
            if(isInfoBoxVisible) {
                var popoverHeight = document.getElementById("myModal").scrollHeight;
                if(elementPosY !== undefined) {
                    //console.log("newHeight: " + newHeight + " elementPosY: " + elementPosY);
                    //adjustedPos = adjustedPos - elementPosY;
                    popoverHeight = popoverHeight + elementPosY;
                    popoverHeight = popoverHeight - newHeight;
                }
                if(popoverHeight > 0) {
                    newHeight = newHeight + popoverHeight;
                }
                //console.log("newHeight: " + newHeight + " popoverHeight: " + popoverHeight);
                /*
                if(popoverHeight > 400) {
                    popoverHeight = popoverHeight - 375;
                    newHeight = newHeight + popoverHeight;
                }*/
            }
            if (isIE) {
                if(newHeight < 200) {
                    newHeight = newHeight + 3000;
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
    refUrl = encodeVal(refUrl);
    // Sometimes refurl is set to github when paging back or forwards, reset in case so...
    if(refUrl.indexOf("github") >-1) {
        refUrl = (window.location != window.parent.location)
            ? document.referrer
            : document.location.href;
        if(refUrl.length === 0) {
            refUrl = window.location.href;
        }
        refUrl = decodeVal(refUrl);
    }
    toAdd = encodeVal(toAdd);
    var stateTitle = libName;
    if(stateTitle === undefined) {
        if(lang == "fi") {
            stateTitle = "Kirjastot"
        }
        else {
            stateTitle = "Libraries"
        }
    }
    // Remove item from url, if it already exists.
    refUrl = refUrl.replace(new RegExp(toAdd,"i"), "");
    // Check for services.
    if(type !== "introduction" && type !== "contact") {
        // Loop services and check if refUrl contains one of them, if so remove it.
        for (var i = 0; i < serviceNames.length; i++) {
            var serviceName = encodeVal(serviceNames[i]);
            if(refUrl.indexOf(serviceName) > -1) {
                refUrl = refUrl.replace(serviceName, "");
                stateTitle = stateTitle + " | " + serviceNames[i];
            }
        }
    }
    if(lang === "fi") {
        refUrl = refUrl.replace(/contacts/g, "");
    }
    else if(lang === "en") {
        refUrl = refUrl.replace(/yhteystiedot/g, "");
    }
    // Remove contacts from url if navigating to introduction.
    if(type === "introduction") {
        refUrl = refUrl.replace(/yhteystiedot/g, "");
        refUrl = refUrl.replace(/contacts/g, "");
    }
    // Loop libraries and check if refUrl contains one of them, if so remove it.
    if(type === "library") {
        for (var i = 0; i < libListMultiLang.length; i++) {
            var nameFi = libListMultiLang[i].nameFi;
            var nameEn = libListMultiLang[i].nameEn;
            if(refUrl.indexOf(nameFi) > -1) {
                refUrl = refUrl.replace(
                    new RegExp(nameFi,"i"), "");
            }
            else if (refUrl.indexOf(nameEn) > -1) {
                refUrl = refUrl.replace(
                    new RegExp(nameEn,"i"), "");
            }
        }
    }
    if(toAdd !== ''){
        refUrl = refUrl + "?" + toAdd;
    }
    refUrl = refUrl.replace(/(%3f)/g, "?");
    // Remove duplicated ?
    refUrl = refUrl.replace(/[?]{2,}/g, "?");
    // Fix jkl redirects ?=? patterns.
    refUrl = refUrl.replace(/(\?=\?)/g, "?");
    // Always place contacts at the end of the url.
    if(refUrl.indexOf('?yhteystiedot') > -1) {
        refUrl = refUrl.replace('?yhteystiedot', "");
        refUrl = refUrl + '?yhteystiedot';
        stateTitle = stateTitle + " | Yhteystiedot"
    }
    else if(refUrl.indexOf('?contacts') > -1) {
        refUrl = refUrl.replace('?contacts', "");
        refUrl = refUrl + '?contacts';
        stateTitle = stateTitle + " | Contacts"
    }
    // Remove ?, = if last character.
    refUrl = refUrl.replace(/\?$/, '');
    refUrl = refUrl.replace(/=$/, '');
    try {
        parent.postMessage({value: refUrl, stateTitle: stateTitle, type: 'url'}, '*');
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
        $('#librarySelectorLabel').append(i18n.get("Library selector"));
    }
    $('#navInfo').append(i18n.get("Info"));
    $('#navContacts').append(i18n.get("Contact details"));
    $('#transitTitle').append(i18n.get("Transit details"));
    $('#socialMediaSr').append(i18n.get("Social media"));
    $('#srPictures').append(i18n.get("Pictures from the library"));
    // Yhteystiedot UI texts.
    document.getElementById('expandMap').title = i18n.get("Toggle full-screen");
    $('#locationTitle').append(i18n.get("Location"));
    $('#srAddress').append(i18n.get("Address details"));
    $('#transitDetailsTitle').append(i18n.get("Instructions for transit"));
    // Services
    $('#closeInfoBtn').append(i18n.get("Close"));
    // Apparently IOS does not support Full screen API:  https://github.com/googlevr/vrview/issues/112
    // Hide fullscreen toggler & increase slider/map sizes a bit on larger screens to compensate the lack of full screen.
    // https://stackoverflow.com/questions/7944460/detect-safari-browser
    var testSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
        navigator.userAgent &&
        navigator.userAgent.indexOf('CriOS') == -1 &&
        navigator.userAgent.indexOf('FxiOS') == -1;
    if(testSafari || /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        isIOS = true;
    }

    // https://stackoverflow.com/questions/4617638/detect-ipad-users-using-jquery
    var isIPad = navigator.userAgent.match(/iPad/i) != null;
    var isIPhone = (navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null);
    if(isIPad || isIPhone) {
        isIOSMobile = true;
    }

    if(navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {
        isIE = true;
    }
    if(isIOS) {
        $('#expandMap').css('display', 'none');
        if($(window).width() > 767) {
            //$('.small-slider').css('height', '330px');
            $('#contactsFirstCol').addClass("col-md-12");
            $('#contactsFirstCol').removeClass("col-md-8");
            $('#contactsMapCol').addClass("col-md-12");
            $('#contactsMapCol').removeClass("col-md-col-md-4");
            $('#contactsMapCol').css('height', '500px');
        }
    }
    // Since the api is having problems with special schedules, add a notification. To be commented when fixed.
    //$('#schedules').prepend('<p style="color: red">' + i18n.get("Wrong schedules") + '</p>');
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
