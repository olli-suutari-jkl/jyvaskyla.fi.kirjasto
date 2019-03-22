// This file is linked to the parent page, it adds functionality to libFrames.
var container = document.getElementById('libFrame');
// Add transition style for smooth height adjustments.
var css = document.createElement("style");
css.type = "text/css";
css.innerHTML = '#libFrame { transition: height 800ms; }';
document.head.appendChild(css);
// Event listener for messages from the iframe.
var libList;
var storedUrl = window.location.href;
window.addEventListener('message', function(event) {
    var data = event.data;
    if(data.type === "libList") {
        libList = data.value;
        var currentLib = data.selectedLib;
        var lang = data.lang;
        var referrer = document.referrer;
        var currentUrl = window.location.href;
        var needsRedirect = false;
        var name = "";
        if(lang === "fi") {
            for (var i = 0; i < libList.length; i++) {
                if (referrer.indexOf(libList[i].nameEn) > -1 && libList[i].id != currentLib &&
                    libList[i].nameEn !== libList[i].nameFi) {
                    name = "?" + libList[i].nameFi;
                    currentUrl = currentUrl.replace(/\?(.*)/g, name);
                    needsRedirect = true;
                }
            }
            if (referrer.indexOf("contacts") > -1) {
                currentUrl = currentUrl + "?yhteystiedot";
                //currentUrl = currentUrl.replace(/(contacts)/g, "yhteystiedot");
                needsRedirect = true;
            }
        }
        else if(lang === "en") {
            for (var i = 0; i < libList.length; i++) {
                if (referrer.indexOf(libList[i].nameFi) > -1 && libList[i].id != currentLib &&
                    libList[i].nameEn !== libList[i].nameFi) {
                    name = "?" + libList[i].nameEn;
                    currentUrl = currentUrl.replace(/\?(.*)/g, name);
                    needsRedirect = true;
                }
            }
            if (referrer.indexOf("yhteystiedot") > -1) {
                currentUrl = currentUrl + "?contacts";
                //currentUrl = currentUrl.replace(/(contacts)/g, "yhteystiedot");
                needsRedirect = true;
            }
        }
        if(needsRedirect) {
            setTimeout(function(){
                /* IE does not update referrer if we use history.replaceState or .pushState , thus this wont work on ie.
                https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10474810/
                Bonus: IE also loses referrer when using window.location.href = ...
                // https://blog.mathiaskunto.com/2012/02/20/internet-explorer-loses-referrer-when-redirecting-or-linking-with-javascript/
                */
                storedUrl = currentUrl;
                window.location.href = currentUrl;
            }, 50);
        }
    }
    // Scroll to position
    else if(data.type === "scroll") {
        var rect = container.getBoundingClientRect();
        var scrollToPos = rect.top + data.value;
        if(data.scrollParameter === "under") {
            // Scroll if under the scroll position
            if(window.pageYOffset > scrollToPos) {
                window.scrollTo({ top: scrollToPos, behavior: 'smooth' })
            }
        }
        else if(data.scrollParameter === "center") {
            // Scroll to position.
            window.scrollTo({ top: scrollToPos, behavior: 'smooth' })
        }
        else {
            // Scroll if above the scroll position.
            if(window.pageYOffset < scrollToPos) {
                window.scrollTo({ top: scrollToPos, behavior: 'smooth' })
            }
        }
    }
    // Resize the window.
    else if(data.type === "resize") {
        // Arena makes elements smaller in width if their height  is less than 900 something pixels...
        if(window.location.href.indexOf('keskikirjastot') > -1 && window.innerWidth > 900) {
            if(data.value < 1000) {
                data.value = 1000;
            }
        }
        container.style.height = (data.value) + "px";
    }
    // Update the url
    else if(data.type === "url") {
        // https://developer.mozilla.org/en-US/docs/Web/API/History_API
        var stateObj = { urlValue: data.value };
        try {
            var currentUrl = window.location.href;
            if(data.value == currentUrl || !(currentUrl.indexOf('?') > -1)) {
                //history.replaceState("", "", data.value);
                history.replaceState(stateObj, data.stateTitle, data.value);

            }
            else {
                //history.pushState("", "", data.value);
                history.pushState(stateObj, data.stateTitle, data.value);
            }
            storedUrl = data.value;
        }
        catch (e) {
            console.log("Url failed to update: " + e);
        }
    }
});
// Hide liferay portlet title for keskikirjastot.
if(window.location.href.indexOf('keskikirjastot') > -1) {
    $( ".portlet-title" ).each(function() {
        if ($(this).context.innerText.length === 0) {
            $(this).hide();
        }
    });
}
// Handle history forward/back calls.
window.onpopstate = function(e) {
    setTimeout(function(){
        if(e.state.urlValue !== storedUrl) {
            window.location.href = e.state.urlValue;
        }
    }, 300);
};