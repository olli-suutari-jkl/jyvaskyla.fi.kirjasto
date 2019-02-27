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
var links = getParamValue('links');
var linksHover = getParamValue('linksHover');
var linksExternal = getParamValue('linksExternal');
var btnHover =  getParamValue('btnHover');
if(primary === undefined){
    primary = "#026FCF";
}
else {
    primary = "#" + primary;
}
if(links === undefined){
    links = "#0b62c1";
}
else {
    links = "#" + links;
}

if(linksHover === undefined){
    linksHover = "#0050a8";
}
else {
    linksHover = "#" + linksHover;
}

if(linksExternal === undefined){
    linksExternal = "#026FCF";
}
else {
    linksExternal = "#" + linksExternal;
}
if(btnHover === undefined){
    btnHover = primary;
}
else {
    btnHover = "#" + btnHover;
}

// Generate lessVariables.
primary = "@primary: " + primary + "; ";
links = "@links: " + links + "; ";
linksHover = "@linksHover: " + linksHover + "; ";
linksExternal = "@linksExternal: " + linksExternal + "; ";
btnHover = "@btnHover: " + btnHover + "; ";
var lessVariables = primary + links + linksHover + linksExternal + btnHover;

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
