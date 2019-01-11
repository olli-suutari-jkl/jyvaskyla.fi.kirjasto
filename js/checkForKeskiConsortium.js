/* We use ? to navigate right to library X, # is not passed in refUrl.
  Check the libraries of JKL, by default the main library is used. (lib param from iframe) */
function asyncCheckUrlForKeskiLibrary() {
    var urlDeferred = jQuery.Deferred();
    setTimeout(function() {
        if(refUrl.indexOf("halssila") > -1) {
            library = 85305;
        }
        else if(refUrl.indexOf("huhtasuo") > -1) {
            library = 85533;
        }
        else if(refUrl.indexOf("keljo") > -1) {
            library = 85516;
        }
        else if(refUrl.indexOf("keltin") > -1) {
            library = 85754;
        }
        else if(refUrl.indexOf("korpi") > -1) {
            library = 85116;
        }
        else if(refUrl.indexOf("korte") > -1) {
            library = 85160;
        }
        else if(refUrl.indexOf("kuokka") > -1) {
            library = 86583;
        }
        else if(refUrl.indexOf("lohi") > -1) {
            library = 85909;
        }
        else if(refUrl.indexOf("palok") > -1) {
            library = 85732;
        }
        else if(refUrl.indexOf("saynat") > -1 || refUrl.indexOf("s%c3%a4yn%c3%a4t") > -1 ||
            refUrl.indexOf("s%C3%A4yn%C3%A4tsalo") > -1 || refUrl.indexOf("säynät") > -1) {
            library = 85117;
        }
        else if(refUrl.indexOf("tikka") > -1) {
            library = 85111;
        }
        else if(refUrl.indexOf("vaaja") > -1) {
            library = 85573;
        }
        else if(refUrl.indexOf("vesan") > -1) {
            library = 85306;
        }
        // Hankasalmi
        else if(refUrl.indexOf("aseman") > -1) {
            library = 85906;
        }
        else if(refUrl.indexOf("hankasalm") > -1) {
            library = 85301;
        }
        else if(refUrl.indexOf("niemis") > -1) {
            library = 85513;
        }
        // Keuruu
        else if(refUrl.indexOf("haapam") > -1) {
            library = 85945;
        }
        /* TO DO: Keuruun kaupunginkirjasto 85481 should be hidden */
        else if(refUrl.indexOf("keuruu") > -1) {
            library = 85126;
        }
        else if(refUrl.indexOf("turbo") > -1) {
            library = 86133;
        }
        else if(refUrl.indexOf("pohjoislah") > -1) {
            library = 86033;
        }
        // Joutsa
        else if(refUrl.indexOf("joutsa") > -1) {
            library = 85377;
        }
        else if(refUrl.indexOf("leivonm") > -1) {
            library = 85774;
        }
        // Jämsä
        else if(refUrl.indexOf("jamsa") > -1 || refUrl.indexOf("j%c3%a4ms%c3%a4t") > -1 ||
            refUrl.indexOf("j%C3%A4ms%C3%A4") > -1 || refUrl.indexOf("jämsä") > -1) {
            library = 85933;
        }
        else if(refUrl.indexOf("sever") > -1) {
            library = 85060;
        }
        else if(refUrl.indexOf("kuoro") > -1) {
            library = 85272;
        }
        else if(refUrl.indexOf("lanki") > -1 || refUrl.indexOf("l%c3%a4nki") > -1 ||
            refUrl.indexOf("l%C3%A4nki") > -1 || refUrl.indexOf("länki") > -1) {
            library = 85933;
        }
        // Kannonkoski
        else if(refUrl.indexOf("kannon") > -1) {
            library = 85384;
        }
        // Karstula
        else if(refUrl.indexOf("karstula") > -1) {
            library = 85777;
        }
        // Kinnula
        else if(refUrl.indexOf("kinnula") > -1) {
            library = 85086;
        }
        // Saarijärvi kirjastoauto is called "Saarijärven kirjastoauto"...
        else if(refUrl.indexOf("auto") > -1 && refUrl.indexOf("saari") > -1) {
            library = 85440;
        }
        else if(refUrl.indexOf("saarij") > -1) {
            library = 85957;
        }
        // Kivijärvi
        else if(refUrl.indexOf("kivi") > -1) {
            library = 85070;
        }
        // Äänekoski
        else if(refUrl.indexOf("kongi") > -1) {
            library = 85591;
        }
        else if(refUrl.indexOf("sumi") > -1) {
            library = 85724;
        }
        else if(refUrl.indexOf("suolah") > -1) {
            library = 85532;
        }
        else if(refUrl.indexOf("aanekos") > -1 || refUrl.indexOf("%c3%a4%c3%a4nekos") > -1 ||
            refUrl.indexOf("l%C3%A4l%C3%A4nekos") > -1 || refUrl.indexOf("äänekos") > -1) {
            library = 85933;
        }
        // Konnevesi
        else if(refUrl.indexOf("konneve") > -1) {
            library = 85295;
        }
        // Kuhmoinen
        else if(refUrl.indexOf("kuhmoi") > -1) {
            library = 85020;
        }
        else if(refUrl.indexOf("pihlaja") > -1) {
            library = 85830;
        }
        else if(refUrl.indexOf("paija") > -1 || refUrl.indexOf("p%c3%a4%c3%a4ij%c3%a4") > -1 ||
            refUrl.indexOf("pl%C3%A4ijl%C3%A4") > -1 || refUrl.indexOf("päijä") > -1) {
            library = 86433;
        }
        // Kyyjärvi
        else if(refUrl.indexOf("kyyj") > -1) {
            library = 85337;
        }
        // Laukaa kirjastoauto is called Laukkaan kirjastoauto....
        else if(refUrl.indexOf("auto") > -1 && refUrl.indexOf("lauk") > -1) {
            library = 85390;
        }
        else if(refUrl.indexOf("lauk") > -1) {
            library = 85785;
        }
        else if(refUrl.indexOf("lepp") > -1) {
            library = 85389;
        }
        else if(refUrl.indexOf("lieve") > -1) {
            library = 85990;
        }
        // Luhanka
        else if(refUrl.indexOf("luhan") > -1) {
            library = 85161;
        }
        else if(refUrl.indexOf("tammi") > -1) {
            library = 85382;
        }
        // Multia
        else if(refUrl.indexOf("multi") > -1) {
            library = 85287;
        }
        // Muurame
        else if(refUrl.indexOf("muur") > -1) {
            library = 85713;
        }
        // Petäjävesi
        else if(refUrl.indexOf("pet") > -1) {
            library = 85655;
        }
        // Pihtipudas
        else if(refUrl.indexOf("pihti") > -1) {
            library = 86070;
        }
        // Toivakka
        else if(refUrl.indexOf("toiva") > -1) {
            library = 85963;
        }
        // Uurainen
        else if(refUrl.indexOf("uurai") > -1) {
            library = 85972;
        }
        // Viitasaari
        else if(refUrl.indexOf("viita") > -1) {
            library = 85346;
        }
        else if(refUrl.indexOf("Wiita") > -1) {
            library = 85449;
        }
        // If no library parameter was provided.
        if(library === undefined || library === null || library === '') {
            library = 85159;
        }
        urlDeferred.resolve();
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return urlDeferred.promise();
}


