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
        var serviceNameInUrl = "";
        var refParamCount = (referrer.match(/\?/g) || []).length;
        var fiLibNameInUrl = "";
        var enLibNameInUrl = "";
        for (var i = 0; i < libList.length; i++) {
            var libNameEn = libList[i].nameEn;
            var libNameFi = libList[i].nameFi;
            if (referrer.indexOf("?" + libNameEn) > -1) {
                enLibNameInUrl = libNameEn;
            }
            if (referrer.indexOf("?" + libNameFi) > -1) {
                fiLibNameInUrl = libNameFi;
            }
        }
        if(refParamCount == 2) {
            var index = referrer.lastIndexOf("?");
            serviceNameInUrl = "?" + referrer.substr(index+1);
            if(serviceNameInUrl != "?yhteystiedot" && serviceNameInUrl != "?contacts"
            && serviceNameInUrl != fiLibNameInUrl && serviceNameInUrl != enLibNameInUrl) {
                var redirectUrl = currentUrl + serviceNameInUrl;
                if (currentUrl.toLowerCase().indexOf(serviceNameInUrl) === -1) {
                    currentUrl = redirectUrl;
                    needsRedirect = true;
                }
            }
        }
        if(lang === "fi") {
            if(enLibNameInUrl != "") {
                for (var i = 0; i < libList.length; i++) {
                    if (enLibNameInUrl.indexOf(libList[i].nameEn) > -1 && libList[i].id != currentLib &&
                        libList[i].nameEn !== libList[i].nameFi) {
                        name = "?" + libList[i].nameFi;
                        currentUrl = currentUrl.replace(/\?(.*)/g, name) + serviceNameInUrl;
                        needsRedirect = true;
                    }
                }
            }
            if (referrer.indexOf("contacts") > -1) {
                if(currentUrl.indexOf("yhteystiedot") === -1) {
                    currentUrl = currentUrl + "?yhteystiedot";
                    needsRedirect = true;
                }
            }
        }
        else if(lang === "en") {
            if(fiLibNameInUrl != "") {
                for (var i = 0; i < libList.length; i++) {
                    if (fiLibNameInUrl.indexOf(libList[i].nameFi) > -1 && libList[i].id != currentLib &&
                        libList[i].nameEn !== libList[i].nameFi) {
                        name = "?" + libList[i].nameEn;
                        currentUrl = currentUrl.replace(/\?(.*)/g, name) + serviceNameInUrl;
                        needsRedirect = true;
                    }
                }
            }
            if (referrer.indexOf("yhteystiedot") > -1) {
                if(currentUrl.indexOf("contacts") === -1) {
                    currentUrl = currentUrl + "?contacts";
                    needsRedirect = true;
                }
            }
        }
        setTimeout(function(){
            if(needsRedirect) {
                var stateObj = { urlValue: currentUrl };
                history.replaceState( stateObj , '', currentUrl );
                window.location.href = currentUrl;
            }
        }, 100);
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
        if(e.state.urlValue != null && e.state.urlValue !== storedUrl) {
            window.location.href = e.state.urlValue;
        }
    }, 450);
};