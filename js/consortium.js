var libraryList = [];
var libName;
// Group libraries by city.
// https://stackoverflow.com/questions/46043262/split-array-with-objects-to-multiple-arrays-based-on-unique-combination
function groupByCity(arr) {
    // for each object obj in the array arr
    return arr.reduce(function(res, obj) {
        var key = obj.city;
        // create a new object based on the object
        var newObj = {city: key, id: obj.id, text: obj.text};
        // if res has a sub-array for the current key then...
        if(res[key]) {
            res[key].push(newObj); // ... push newObj into that sub-array
        }
        else {
            // otherwise...
            res[key] = [ newObj ]; // ... create a new sub-array for this key that initially contain newObj
        }
        return res;
    }, {});
}

function modelMatcher (params, data) {
    data.parentText = data.parentText || "";

    // Always return the object if there is nothing to compare
    if ($.trim(params.term) === '') {
        return data;
    }

    // Do a recursive check for options with children
    if (data.children && data.children.length > 0) {
        // Clone the data object if there are children
        // This is required as we modify the object to remove any non-matches
        var match = $.extend(true, {}, data);

        // Check each child of the option
        for (var c = data.children.length - 1; c >= 0; c--) {
            var child = data.children[c];
            child.parentText += data.parentText + " " + data.text;

            var matches = modelMatcher(params, child);

            // If there wasn't a match, remove the object in the array
            if (matches == null) {
                match.children.splice(c, 1);
            }
        }

        // If any children matched, return the new object
        if (match.children.length > 0) {
            return match;
        }

        // If there were no matching children, check just the plain object
        return modelMatcher(params, match);
    }

    // If the typed-in term matches the text of this term, or the text from any
    // parent term, then it's a match.
    var original = (data.parentText + ' ' + data.text).toUpperCase();
    var term = params.term.toUpperCase();


    // Check if the text contains the term
    if (original.indexOf(term) > -1) {
        return data;
    }

    // If it doesn't contain the term, don't return anything
    return null;
}

function initSelect(items) {
    var placeholderText = "Hae nimellä...";
    if(lang === "en") {
        placeholderText = "Search by name...";
    }
    $(".library-select").select2({
        data: items,
        language: lang, // Global parameter from getParameters.js
        searchInputPlaceholder: placeholderText,
        matcher: modelMatcher
    });
    $('#librarySelectorContainer').addClass("always-visible");
}

function setSelectDefault() {
    $('.library-select').val(library).trigger('change');
    libName = $("#librarySelector option:selected").text();
}

function generateSelect() {
    // Sort alphabetically. https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
    libraryList.sort(function(a, b){
        var nameA=a.text.toLowerCase(), nameB=b.text.toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1;
        if (nameA > nameB)
            return 1;
        return 0; //default return value (no sorting)
    });

    // If we are fetching a consortium or a city.
    if(consortium !== undefined || city !== undefined) {
        var consortiumLibraries = [];
        function asyncReplaceIdWithCity() {
            var citiesDeferred = jQuery.Deferred();
            setTimeout(function() {
                var counter = 0;
                // Replace City ID's with city names. TO DO: Optimize, 50 items loop 2500 times.
                for (var x=0; x<libraryList.length; x++) {
                    $.getJSON("https://api.kirjastot.fi/v3/city/" + libraryList[x].city + "?lang=fi", function(data) {
                        for (var i = 0; i < libraryList.length; i++) {
                            if (libraryList[i].city == data.id.toString()) {
                                libraryList[i].city = data.name;
                            }
                        }
                        counter = counter +1;
                        // If we have looped all of the libraries, set as resolved, thus moving on.
                        if(counter === libraryList.length) {
                            citiesDeferred.resolve();
                        }
                    });
                }
            }, 1 );
            // Return the Promise so caller can't change the Deferred
            return citiesDeferred.promise();
        }

        // Replace city ID:s with names and check refurl for library names.
        $.when(asyncCheckUrlForKeskiLibrary(), asyncReplaceIdWithCity() ).then(
            function(){
                // Trigger schedule fetching.
                getWeekSchelude(0, library);
                // Fetch library details, map is also generated during the process - it is important that we have already generated the list for map items.
                if(!homePage) {
                    fetchInformation(lang);
                }
                // Consortium listing
                if(city === undefined) {
                    $.when( librariesGroupped = groupByCity(libraryList) ).then(
                        function() {
                            for (var key in librariesGroupped) {
                                consortiumLibraries.push({text: key, children: librariesGroupped[key]});
                            }
                            // Attach a done, fail, and progress handler for the asyncEvent
                            $.when( initSelect(consortiumLibraries) ).then(
                                function() {
                                    setSelectDefault();
                                }
                            );
                        }
                    );
                }
                // City listing
                else {
                    $.when( initSelect(libraryList) ).then(
                        function() {
                            setSelectDefault();
                        }
                    );
                }
            }

        );
    }
}

$(document).ready(function() {
    // Fetch libraries of city, that belong to the same consortium
    if(consortium !== undefined && city !== undefined) {
        isLibaryList = true;
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&city.name=" + city, function(data) {
            for (var i=0; i<data.items.length; i++) {
                // Due to a bug in the api, a test library cannot be deleted or hidden
                if(data.items[i].id !== 86605) {
                    // Ignore mobile libraries & other consortiums.
                    if(data.items[i].branch_type !== "mobile" && data.items[i].consortium == consortium) {
                        libraryList.push({id: data.items[i].id, text: data.items[i].name,
                            city: data.items[i].city.toString(),
                            street: data.items[i].address.street,
                            zipcode: data.items[i].address.zipcode,
                            coordinates: data.items[i].address.coordinates});
                    }
                }
            }
            generateSelect();
        });
    }
    // Fetch libraries of city
    else if(consortium === undefined && city !== undefined) {
        isLibaryList = true;
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&city.name=" + city, function(data) {
            for (var i=0; i<data.items.length; i++) {
                // Ignore mobile libraries
                if(data.items[i].branch_type !== "mobile") {
                    libraryList.push({id: data.items[i].id, text: data.items[i].name,
                        city: data.items[i].city.toString(),
                        street: data.items[i].address.street,
                        zipcode: data.items[i].address.zipcode,
                        coordinates: data.items[i].address.coordinates});
                }
            }
            generateSelect();
        });
    }
    // Fetch libraries of consortium
    else if(consortium !== undefined && city === undefined) {
        isLibaryList = true;
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&consortium=" + consortium + "&limit=500", function(data) {
            for (var i=0; i<data.items.length; i++) {
                // Due to a bug in the api, a test library cannot be deleted or hidden
                if(data.items[i].id !== 86605) {
                    // Include mobile libraries in consortium listings...
                    libraryList.push({
                        id: data.items[i].id, text: data.items[i].name,
                        city: data.items[i].city.toString(),
                        street: data.items[i].address.street,
                        zipcode: data.items[i].address.zipcode,
                        coordinates: data.items[i].address.coordinates
                    });
                    /*
                    if(data.items[i].branch_type !== "mobile") {

                    }
                    */
                }
            }
            generateSelect();
        });
    }

    $("#librarySelector").change(function(){
        // Don't use !== as it won't match.
        if($(this).val() != library) {
            // Set the global library parameter, so schedule switching won't mess things up.
            library = $(this).val();
            libName = $("#librarySelector option:selected").text();
            if(!homePage) {
                if (isInfoBoxVisible) {
                    toggleModal();
                }
                $("#pageContainer").replaceWith(divClone.clone()); // Restore main with a copy of divClone
                // Reset variables.
                accessibilityIsEmpty = true;
                transitIsEmpty = true;
                descriptionIsEmpty = true;
                isScheduleEmpty = true;
                noImages = true;
                triviaIsEmpty = true;
                mapLoaded = false;
                sliderNeedsToRestart = true;
                contactsIsEmpty = true;
                noServices = true;
                isReFetching = false;
                isModalCloseBinded = false;
                isServiceClickBinded = false;
                map = L.map('mapContainer');
                roomCount = 0;
                contactlist = [];
                numbersList = [];
                staffList = [];
                fetchInformation(lang, $(this).val());
                // Re-bind navigation and other stuff.
                bindActions();
                if(document.getElementById("sliderBox") != null) {
                    detectswipe("sliderBox", swipeNavigation);
                }
                // Adjust parent url.
                adjustParentUrl(libName, "library");
            }

            if(homePage) {
                adjustHomePageHeight(50)
            }

            // Fetch data
            getWeekSchelude(0, library);
            bindScheduleKeyNavigation();
            // Add swiping detection for schedules & sliderbox if available.
            detectswipe("schedules", swipeNavigation);
        }
    });

    $(document).on('click', '.map-library-changer', function () {
        // Trigger the library change.
        $('.library-select').val($(this).val()).trigger('change');
    });


}); // OnReady