// This file is linked to the parent page, it adds functionality to libFrames.
var container = document.getElementById('libFrame');
// Add transition style for smooth height adjustments.
var css = document.createElement("style");
css.type = "text/css";
css.innerHTML = '#libFrame { transition: height 800ms; }';
document.head.appendChild(css);
// Event listener for messages from the iframe.
window.addEventListener('message', function(event) {
    var data = event.data;
    // Scroll to position
    if(data.type === "scroll") {
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
        try {
            history.replaceState("", "", data.value);
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
