/* We use ? to navigate right to library X, # is not passed in refUrl.
  Check the libraries of JKL, by default the main library is used. (lib param from iframe) */

// Function to replace short library names of Jyvaskyla with longer variants.
// TO DO: Add english or remove.
function replaceJyvaskylaLibName(replaceWith) {
    refUrl = refUrl.replace(/\?.*/g, "");
    adjustParentUrl(replaceWith, 'library');
}

function asyncCheckUrlForKeskiLibrary() {
    var urlDeferred = jQuery.Deferred();
    setTimeout(function() {
        if(homePage) {
            urlDeferred.resolve();
            return;
        }
        var matchFound = false;
        var urlUnescapeSpaces = refUrl.replace(/%20/g, " ");
        if(!matchFound) {
            // Loop libraries and check if refUrl contains one of them and click if so.
            for (var i = 0; i < libListMultiLang.length; i++) {
                if(urlUnescapeSpaces.indexOf(libListMultiLang[i].nameFi) > -1
                || urlUnescapeSpaces.indexOf(libListMultiLang[i].nameEn) > -1) {
                    library = libListMultiLang[i].id;
                    matchFound = true;
                    var libName = libListMultiLang[i].nameFi;
                    if(lang == "en") {
                        libName = libListMultiLang[i].nameEn;
                        adjustParentUrl(libListMultiLang[i].nameFi, "cleanupUrl")
                    }
                    else {
                        adjustParentUrl(libListMultiLang[i].nameFi, "cleanupUrl")

                    }
                    adjustParentUrl(libName);
                }
                else if(urlUnescapeSpaces.indexOf(libListMultiLang[i].id) > -1) {
                    library = libListMultiLang[i].id;
                    matchFound = true;
                    var libName = libListMultiLang[i].nameFi;
                    if(lang == "en") {
                        libName = libListMultiLang[i].nameEn;
                    }
                    refUrl = refUrl.replace(libListMultiLang[i].id, libName);
                    adjustParentUrl(libName);
                }
            }
        }
        // Custom names used for libraries of Jyväskylä.
        if(!matchFound) {
            if(refUrl.indexOf("halssila") > -1) {
                library = 85305;
                if(lang === "fi") {
                    replaceJyvaskylaLibName("halssilan-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("halssila-library");
                }

            }
            else if(refUrl.indexOf("huhtasuo") > -1) {
                library = 85533;

                if(lang === "fi") {
                    replaceJyvaskylaLibName("huhtasuon-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("huhtasuo-library");
                }
            }
            else if(refUrl.indexOf("keljo") > -1) {
                library = 85516;

                if(lang === "fi") {
                    replaceJyvaskylaLibName("keljonkankaan-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("keljonkangas-library");
                }
            }
            else if(refUrl.indexOf("keltin") > -1) {
                library = 85754;

                if(lang === "fi") {
                    replaceJyvaskylaLibName("keltinmaen-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("keltinmaki-library");
                }
            }
            else if(refUrl.indexOf("korpi") > -1) {
                library = 85116;

                if(lang === "fi") {
                    replaceJyvaskylaLibName("korpilahden-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("korpilahti-library");
                }
            }
            else if(refUrl.indexOf("korte") > -1) {
                library = 85160;

                if(lang === "fi") {
                    replaceJyvaskylaLibName("kortepohjan-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("kortepohja-library");
                }
            }
            else if(refUrl.indexOf("kuokka") > -1) {
                library = 86583;

                if(lang === "fi") {
                    replaceJyvaskylaLibName("kuokkalan-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("kuokkala-library");
                }
            }
            else if(refUrl.indexOf("lohi") > -1) {
                library = 85909;

                if(lang === "fi") {
                    replaceJyvaskylaLibName("lohikosken-pienkirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("lohikoski-library");
                }
            }
            else if(refUrl.indexOf("palok") > -1) {
                library = 85732;
                if(lang === "fi") {
                    replaceJyvaskylaLibName("palokan-aluekirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("palokka-library");
                }
            }
            else if(refUrl.indexOf("saynat") > -1 || refUrl.indexOf("s%c3%a4yn%c3%a4t") > -1 ||
                refUrl.indexOf("s%C3%A4yn%C3%A4tsalo") > -1 || refUrl.indexOf("säynät") > -1) {
                library = 85117;
                if(lang === "fi") {
                    replaceJyvaskylaLibName("saynatsalon-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("saynatsalo-library");
                }
            }
            else if(refUrl.indexOf("tikka") > -1) {
                library = 85111;
                if(lang === "fi") {
                    replaceJyvaskylaLibName("tikkakosken-lahikirjasto");
                }
                else if(lang === "en") {
                    replaceJyvaskylaLibName("tikkakoski-library");
                }
            }
            else if(refUrl.indexOf("vaaja") > -1) {
                library = 85573;

                if(lang === "fi") {
                    adjustParentUrl('vaajakosken-aluekirjasto', 'library');
                }
                else if(lang === "en") {
                    adjustParentUrl('vaajakoski-library', 'library');
                }
            }
            else if(refUrl.indexOf("vesan") > -1) {
                library = 85306;

                if(lang === "fi") {
                    adjustParentUrl('vesangan-lahikirjasto', 'library');
                }
                else if(lang === "en") {
                    adjustParentUrl('vesanka-library', 'library');
                }
            }
        }
        // If no library parameter was provided.
        if(library === undefined || library === null || library === '' || library == 85159) {
            library = 85159;
            if(lang === "fi") {
                adjustParentUrl('jyvaskylan-paakirjasto', 'library');
            }
            else if(lang === "en") {
                adjustParentUrl('main-library-jyvaskyla', 'library');
            }
        }
        try {
            parent.postMessage({value: libListMultiLang, lang: lang, selectedLib: library, type: 'libList'}, '*');
        }
        catch (e) {
            console.log("Parent libList adjustment failed: " + e);
        }
        urlDeferred.resolve();
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return urlDeferred.promise();
}


