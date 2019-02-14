// Get global library/lang parameters from the script.
var library;
var lang;
var city;
var consortium;
var largeSchedules = false;
var homePage = false;
var libPageUrl;
var refUrl;
// Get parameters from iframe url.
function getParamValue(paramName) {
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++)
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName)
            return pArr[1]; //return value
    }
}
library = getParamValue('lib');
lang = getParamValue('lang');
city = getParamValue('city');
consortium = getParamValue('consortium');
/* Large schedules are used in iDiD info screens. */
if(getParamValue('large') === 'true') {
    largeSchedules = true;
}
// HomePage & libPageUrl are used in lite versions functions.
if(getParamValue('homePage') === 'true') {
    homePage = true;
}
libPageUrl = getParamValue('libPageUrl');

/* Old method, to be removed */
if(getParamValue('font') == 'l' || getParamValue('font') == 'xl') {
    largeSchedules = true;
}
/* Alternative:   <script data-library="85111" data-lang="fi" src="../../js/main.js" type="text/javascript"></script>*/
// If lang and lib are undefined (not used in iframe)
if(lang == undefined && library == undefined){
    var scripts = document.getElementsByTagName('script');
    var scriptName = scripts[scripts.length-1];
    library = scriptName.getAttribute('data-library'),
        lang = scriptName.getAttribute('data-lang')
}

// Setup the translations.
var i18n = $('body').translate({lang: lang, t: dict}); // Use the correct language
$("html").attr("lang", lang);

// Get referrer url (Iframe parent). If Library name is set, use that as the default (checkUrlForLibrary.js).
// This is also used for navigating to service x by default.
refUrl = (window.location != window.parent.location)
    ? document.referrer
    : document.location.href;
refUrl = refUrl.toLocaleLowerCase();
if(refUrl.length === 0) {
    refUrl = window.location.href;
}
// Navigate to contacts or services, if parameter is in the url.
// Active tab: 0 = info, 1 = contact details, 3 = services.
var activeTab = 0;
if(refUrl.indexOf("yhteys") > -1 || refUrl.indexOf("contact") > -1) {
    activeTab = 1;
}
