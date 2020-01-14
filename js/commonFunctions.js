var isIOS = false;
var isIOSMobile = false;
var isIE = false;
var bodyWidth = 0;

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
                text = text.replace(value,"<a class='no-external-icon' href='mailto:"+value+"'>"+value+"</a>");
            });
            $(this).html(text);
            result = $(this).html(text)[0].innerHTML;
            return $(this)
        }
    });
    return result;
}


function generateIgLinks(string) {
    var result = "";
    string = '<p>' + string + '</p>';
    $(string).filter(function () {
        // https://stackoverflow.com/questions/6038061/regular-expression-to-find-urls-within-a-string
        var linkPattern = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
        var matched_str = $(this).html().match(linkPattern);
        if ( matched_str ) {
            var text = $(this).html();
            $(this).html(text);
            result = $(this).html(text)[0].innerHTML;
            return $(this)
        }
    });
    if(result == "") {
        result = string;
    }
    else {
        // If the result contains a link, the layout is weird unless we wrap it to <p>
        result = '<p>' + result + '</p>';
    }
    return result;
}

// Capitalize the 1st letter of a string.
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeEmail(string) {
    var stringSplitted = string.split("@");
    var splittedByDots = stringSplitted[0].split(".");
    string = "";
    for (var i = 0; i < splittedByDots.length; i++) {
        string = string + capitalize(splittedByDots[i]) + ".";
    }
    string = string.slice(0, -1) + '@';
    string = string + stringSplitted[1];
    return string;
}
// Function for adding "." to a string if the last character is not "?", "." or "!".
function addMissingDot(string) {
    var lastChar = string[string.length -1];
    // Remove any potential " " chars from the end of the string.
    while (lastChar == " ") {
        string = string.slice(0, -1);
        lastChar = string[string.length -1];
    }
    if(lastChar != "." && lastChar != "!" && lastChar != "?") {
        string = string + ".";
    }
    return string;
}

// sanitizedHTMLString parses characters that would break html.
function sanitizedHTMLString(string) {
    string = string.replace('"', '&quot;');
    string = string.replace("'", '&apos;');
    string = string.replace("&", '&amp;');
    string = string.replace("<", '&lt;');
    string = string.replace(">", '&gt;');
    return string;
}

// Function for checking if element is empty.
function isEmpty( el ){
    return !$.trim(el.html())
}

function replaceQuotesWithServiceAndLibraryLinks(string, isModal) {
    if (string.indexOf("blockquote") !== -1) {
        var linksToServices = [];
        var reFindLinks = new RegExp(/<blockquote>.*?(<p>.*?<\/p>).*?<\/blockquote>/g);
        var reFindLinksExec = reFindLinks.exec(string);
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
            var matchFound = false;
            for (var i = 0; i < serviceNamesWithLinks.length; i++) {
                var escapedName = serviceNamesWithLinks[i].toLowerCase();
                escapedName = escapedName.replace(/ä/g, "a");
                escapedName = escapedName.replace(/ö/g, "o");
                escapedName = escapedName.replace(/\(/g, "");
                escapedName = escapedName.replace(/\)/g, "");
                escapedName = escapedName.replace(/_/g, " ");
                escapedName = escapedName.replace(/-/g, " ");
                if(textInside.indexOf(escapedName) > -1) {
                    var linkToService = reFindLinksExec[0].replace('<p>',
                        '<a class="service-link-in-modal" data-name="' + serviceNamesWithLinks[i] + '" href="javascript:void(0);">');
                    if(!isModal) {
                        linkToService = reFindLinksExec[0].replace('<p>',
                            '<a class="service-link-in-description" data-name="' + serviceNamesWithLinks[i] + '" href="javascript:void(0);">');
                    }
                    linkToService = linkToService.replace('</p>', '</a>');
                    linksToServices.push({position: reFindLinksExec[0], iframe: linkToService});
                    matchFound = true;
                }
            }
            if(!matchFound) {
                for (var i = 0; i < libListMultiLang.length; i++) {
                    if(textInside.indexOf(libListMultiLang[i].nameFi.replace('-', ' ')) > -1
                        || textInside.indexOf(libListMultiLang[i].nameEn) > -1) {
                        matchFound = true;
                        var libName = libListMultiLang[i].nameFi;
                        if(lang == "en") {
                            libName = libListMultiLang[i].nameEn;
                        }
                        var linkToService = reFindLinksExec[0].replace('<p>',
                            '<a class="library-link-in-description" data-lib="' + libListMultiLang[i].id + '" href="javascript:void(0);">');
                        if(isModal) {
                            linkToService = reFindLinksExec[0].replace('<p>',
                                '<a class="library-link-in-modal" data-lib="' + libListMultiLang[i].id + '" href="javascript:void(0);">');
                        }
                        linkToService = linkToService.replace('</p>', '</a>');
                        linksToServices.push({position: reFindLinksExec[0], iframe: linkToService});
                    }
                }
            }
            // Loop all links.
            reFindLinksExec = reFindLinks.exec(string);
        }
        // Loop string and replace.
        for (var i = 0; i < linksToServices.length; i++) {
            string = string.replace(linksToServices[i].position, linksToServices[i].iframe);
        }
    }
    return string;
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
            var popOverHeader = $('.popover-header');
            if(popOverHeader.length) {
                if(popOverHeader[0].innerText.toLowerCase().indexOf("celia") > -1) {
                    var popOverHeight = $('.popover').height();
                    if(newHeight < height) {
                        newHeight = newHeight + popOverHeight;
                    }
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
var checkedUrlForLibNamesInOppositeLang = false;
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
    // Remove item from url, if it already exists. Library name and service names can both contain "omatoimikirjasto"
    if(toAdd !== "omatoimikirjasto") {
        refUrl = refUrl.replace(new RegExp(toAdd,"i"), "");
    }
    if(type == "cleanupUrl") {
        toAdd = "";
    }
    // Remove lib name in opposite language, if any are present. If this is not done, it could sometimes result in infinite loop...
    if(!checkedUrlForLibNamesInOppositeLang) {
        for (var i = 0; i < libListMultiLang.length; i++) {
            var libName = libListMultiLang[i].nameEn;
            if(lang == "en") {
                libName = libListMultiLang[i].nameFi;
            }
            if (refUrl.indexOf("?" + libName) > -1) {
                refUrl = refUrl.replace("?" + libName, "");
            }
        }
        checkedUrlForLibNamesInOppositeLang = true;
    }
    // Cleanup any potential service names.
    var serviceMathchFound = false;
    for (var i = 0; i < arrayOfServiceNamesInOppositeLang.length; i++) {
        if(arrayOfServiceNamesInOppositeLang[i].customName !== "") {
            var oppositeCustomName = encodeVal(arrayOfServiceNamesInOppositeLang[i].customName);
            oppositeCustomName = oppositeCustomName.replace(/,/g, "");
            if(refUrl.indexOf("?" + oppositeCustomName) > -1) {
                serviceMathchFound = true;
                refUrl = refUrl.replace("?" + decodeVal(arrayOfServiceNamesInOppositeLang[i].customName), "");
            }
        }
        if(!serviceMathchFound) {
            if(arrayOfServiceNamesInOppositeLang[i].name !== "") {
                var oppositeName = encodeVal(arrayOfServiceNamesInOppositeLang[i].name);
                oppositeName = oppositeName.replace(/,/g, "");
                if(refUrl.indexOf("?" + oppositeName) > -1) {
                    serviceMathchFound = true;
                    refUrl = refUrl.replace("?" + decodeVal(arrayOfServiceNamesInOppositeLang[i].name), "");
                }
            }
        }
    }
    serviceMathchFound = false;
    for (var i = 0; i < arrayOfServiceNames.length; i++) {
        if(arrayOfServiceNames[i].customName !== "") {
            var oppositeCustomName = encodeVal(arrayOfServiceNames[i].customName);
            oppositeCustomName = oppositeCustomName.replace(/,/g, "");
            if(refUrl.indexOf("?" + oppositeCustomName) > -1) {
                serviceMathchFound = true;
                refUrl = refUrl.replace("?" + decodeVal(arrayOfServiceNames[i].customName), "");
            }
        }
        if(!serviceMathchFound) {
            if(arrayOfServiceNames[i].name !== "") {
                var oppositeName = encodeVal(arrayOfServiceNames[i].name);
                oppositeName = oppositeName.replace(/,/g, "");
                if(refUrl.indexOf("?" + oppositeName) > -1) {
                    serviceMathchFound = true;
                    refUrl = refUrl.replace("?" + decodeVal(arrayOfServiceNames[i].name), "");
                }
            }
        }
    }
    if(lang === "fi" && toAdd == "yhteystiedot") {
        var countYhteystiedotInUrl = (refUrl.match(/yhteystiedot/g) || []).length;
        if(countYhteystiedotInUrl !== 0) {
            toAdd = "";
        }
    }
    else if(lang === "en" && toAdd == "contacts") {
        refUrl = refUrl.replace(/yhteystiedot/g, "");
        var countContactsInUrl = (refUrl.match(/contacts/g) || []).length;
        if(countContactsInUrl !== 0 && toAdd == "contacts") {
            toAdd = "";
        }
    }
    if(lang === "fi") {
        refUrl = refUrl.replace(/contacts/g, "");
        var countYhteystiedotInUrl = (refUrl.match(/yhteystiedot/g) || []).length;

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
    // In Finna, all things within "Content" are case-sensitive... :)
    if(refUrl.indexOf('finna') > -1) {
        if(refUrl.indexOf('/content/') > -1) {
            refUrl = refUrl.replace('/content/', "/Content/");
        }
    }
    try {
        parent.postMessage({value: refUrl, stateTitle: stateTitle, type: 'url'}, '*');
    }
    catch (e) {
        console.log("Parent url adjustment failed: " + e);
    }
}

$(document).ready(function() {
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
    // Do not bind the resizing functions for large or homepage schedules. (Homepage has their own)
    if(homePage || largeSchedules) {
        return;
    }
    bodyWidth = $('body').width();
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
