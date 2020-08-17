// This file is used to dynamically generate styles for library & homePage pages.
// https://stackoverflow.com/questions/3922139/add-css-to-head-with-javascript
function addCssToDocument(css){
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    if (s.styleSheet) {   // IE
        s.styleSheet.cssText = css;
    } else {                // the world
        s.appendChild(document.createTextNode(css));
    }
    head.appendChild(s);
}

// Generate colors for less.
var primary = getParamValue('primary');
var textColor = getParamValue('textColor')
var links = getParamValue('links');
var linksHover = getParamValue('linksHover');
var linksExternal = getParamValue('linksExternal');
var btnBg = getParamValue('btnBg');
var btnHover =  getParamValue('btnHover');
if (primary === undefined){
    primary = "#026FCF";
}
else {
    primary = "#" + primary;
}
if (textColor === undefined){
    textColor = "#212529";
}
else {
    textColor = "#" + textColor;
}
if (links === undefined){
    links = "#0b62c1";
}
else {
    links = "#" + links;
}

if (linksHover === undefined){
    linksHover = "#0050a8";
}
else {
    linksHover = "#" + linksHover;
}

if (linksExternal === undefined){
    linksExternal = "#026FCF";
}
else {
    linksExternal = "#" + linksExternal;
}

if (btnBg === undefined){
    btnBg = primary;
}
else {
    btnBg = "#" + btnBg;
}

if (btnHover === undefined){
    btnHover = primary;
}
else {
    btnHover = "#" + btnHover;
}

// Generate lessVariables.
primary = "@primary: " + primary + "; ";
textColor = "@textColor: " + textColor + "; ";
links = "@links: " + links + "; ";
linksHover = "@linksHover: " + linksHover + "; ";
linksExternal = "@linksExternal: " + linksExternal + "; ";
btnBg = "@btnBg: " + btnBg + "; ";
btnHover = "@btnHover: " + btnHover + "; ";
var lessVariables = primary + textColor + links + linksHover + linksExternal + btnBg + btnHover;

// Read less stylesheet, generate .css and add it to header.
var styleCssXml = new XMLHttpRequest();
styleCssXml.open('GET', '../style/style.less');
styleCssXml.onreadystatechange = function() {
    less.render(lessVariables + styleCssXml.responseText)
        .then(function(output) {
            addCssToDocument(output.css);
        });
};
styleCssXml.send();

var libraryCssXml = new XMLHttpRequest();
libraryCssXml.open('GET', '../style/library.less');
libraryCssXml.onreadystatechange = function() {
    //console.log(libraryCssXml.responseText);
    less.render(lessVariables + libraryCssXml.responseText)
        .then(function(output) {
            //console.log(output.css)
            addCssToDocument(output.css);
        });
};
libraryCssXml.send();
// Events
var eventsCssXml = new XMLHttpRequest();
eventsCssXml.open('GET', '../style/events.less');
eventsCssXml.onreadystatechange = function() {
    less.render(lessVariables + eventsCssXml.responseText)
        .then(function(output) {
            addCssToDocument(output.css);
        });
};
eventsCssXml.send();
// Slider
var sliderCssXml = new XMLHttpRequest();
sliderCssXml.open('GET', '../style/slider.less');
sliderCssXml.onreadystatechange = function() {
    less.render(lessVariables + sliderCssXml.responseText)
        .then(function(output) {
            addCssToDocument(output.css);
        });
};
sliderCssXml.send();
// HomePage stylings.
if(homePage) {
    var homePageCssXml = new XMLHttpRequest();
    homePageCssXml.open('GET', '../style/homepage.less');
    homePageCssXml.onreadystatechange = function() {
        //console.log(homePageCssXml.responseText);
        less.render(lessVariables + homePageCssXml.responseText)
            .then(function(output) {
                //console.log(output.css)
                addCssToDocument(output.css);
            });
    };
    homePageCssXml.send();
}
