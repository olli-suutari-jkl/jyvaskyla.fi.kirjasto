function toggleFullScreen(target) {
    // if already full screen; exit
    // else go fullscreen
    // If slider, toggle small-slider class.
    if(target === "#sliderBox") {
        $('#sliderBox').toggleClass("small-slider");
        $('#sliderBox').toggleClass("full-screen-slider");
        $('.fa-stop').click();
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

function generateAccessibilityImg(translationName, iconPath) {
    translationName = i18n.get(translationName);
    iconPath = "../images/accessibility/" + iconPath;
    // Celia block should be generated 1st.
    setTimeout(function(){
        $(".accessibility-images").append(' <img alt="' + translationName + '" ' +
            'src="' + iconPath + '" data-placement="bottom" title="' + translationName + '" data-toggle="accessibility-tooltip"  /> ');
    }, 200);
}

function generateAccessibilityTextBlock(serviceName) {
    var blockItem = '<span class="accessibility-text-block" role="img" alt="' + serviceName +'">' +
        serviceName + ' </span>';
    // Use timeout so actual icons are rendered first.
    setTimeout(function(){
        $(".accessibility-images").append(blockItem);
    }, 300);
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

function removeHtmlTags(string) {
    string = string.replace(/<p>/g, "");
    string = string.replace(/<\/p>/g, "");
    return string;
}

// Function for adding a new palvelut item.
// Define accessibility count here, define other counts later on.
var accessibilityIsEmpty = true;
var serviceNamesWithLinks = [];
function addItem(item, listElement) {
    var name = item.standardName;
    // Use "Custom name", where available.
    if (item.name != null && item.name.length != 0) {
        name = item.name;
    }
    if(listElement == "accessibilityCelia") {
        var celiaDescription = "";
        if(isValue(item.shortDescription)) {
            celiaDescription = capitalize(addMissingDot(item.shortDescription));
        }
        if(isValue(item.description)) {
            if(removeHtmlTags(item.description) != celiaDescription) {
                celiaDescription = celiaDescription + " " + capitalize(addMissingDot(removeHtmlTags(item.description)));
            }
        }
        var standardName = item.standardName;
        if(standardName.toLowerCase().indexOf("registeration") > -1 ||
            standardName.toLowerCase().indexOf("rekisteröityminen") > -1 ) {
            if(isValue(celiaDescription)) {
                celiaDescription = standardName + ": " + celiaDescription;
            }
        }
        if(celiaDescription == "") {
            celiaDescription = i18n.get("Celia info");
        }
        celiaDescription = "<p>" + celiaDescription + '</p>';
        if(isValue(item.website)) {
            var prettyLink = generatePrettyUrl (item.website);
            celiaDescription = celiaDescription + "<p class='service-info service-website' " +
                " aria-label='" + i18n.get("Website") + "'>" +
                "<i aria-hidden='true' class='fas fa-globe'></i><span class='sr-only'>" + i18n.get('Website') +
                ":</span> <a target='_blank' href='" + item.website + "'>" +
                capitalize(prettyLink) + "</a></p>";
        }
        if($(".celia-services").length) {
            if ($(".celia-services").attr('data-content') != celiaDescription) {
                var newDescription = celiaDescription + $(".celia-services").attr('data-content');
                if(standardName.toLowerCase().indexOf("registration") > -1 ||
                    standardName.toLowerCase().indexOf("rekisteröityminen") > -1 ) {
                    newDescription = $(".celia-services").attr('data-content') + celiaDescription
                }
                $(".celia-services").attr('data-content', newDescription);
            }
        }
        else {
            var blockItem = '<img  class="celia-services" src="../images/accessibility/Celia.png" alt="Celia-logo" data-placement="bottom" title="' + i18n.get("Celia title") + '" data-content="' + celiaDescription + '" data-toggle="accessibility-tooltip">';
            $(".accessibility-images").append(blockItem);
            accessibilityCount = accessibilityCount + 1;
            noServices = false;
        }
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
    }
    else {
        // Add popup link if additional details are available.
        if (isValue(item.shortDescription) || isValue(item.description) || isValue(item.website) ||
        isValue(item.email) || isValue(item.phoneNumber)) {
            // serviceNames list is used to navigate to the service via url.
            serviceNamesWithLinks.push(name);
            var description = "";
            if (item.shortDescription != null && item.shortDescription.length != 0 &&
                !strippedValueEquals(item.shortDescription, item.name)) {
                var shortDescription = capitalize(addMissingDot(item.shortDescription));
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
                description = description + '<p class="service-info service-website" aria-label="' + i18n.get("Website") +
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
                    // Microsoft Bookings calendars
                    else if (reFindLinksExec[0].indexOf("/bookings/") !== -1) {
                        // Find url
                        var BookingUrlOfLink = new RegExp(/"(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?"/g).exec(reFindLinksExec[0]);
                        // Generate iframe if not null (Link invalid)
                        if(BookingUrlOfLink !== null) {
                            var iframeCode = '<iframe frameborder="0" height="1550px" scrolling="yes"  src='  + BookingUrlOfLink[0] +
                                ' width="100%" style="border: 0"></iframe>';
                            // Push to array
                            linksToReplace.push({position: reFindLinksExec[0], replacement: iframeCode});
                        }
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
}); // OnReady
