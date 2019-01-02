var libraryList = [];
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

function initSelect(items) {
    var placeholderText = "Hae nimellä...";
    if(lang === "en") {
        placeholderText = "Search by name...";
    }
    $(".library-select").select2({
        data: items,
        language: lang, // Global parameter from getParameters.js
        searchInputPlaceholder: placeholderText
    });
    $('#librarySelectorContainer').addClass("always-visible");
}

function setSelectDefault() {
    $('.library-select').val(library).trigger('change');
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

        $.when( asyncReplaceIdWithCity() ).then(
            function(){
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
        if($(this).val() !== library) {
             $("#pageContainer").replaceWith(divClone.clone()); // Restore main with a copy of divClone
                // Reset variables.
                accessibilityIsEmpty = true;
                transitIsEmpty = true;
                descriptionIsEmpty = true;
                mapLoaded = false;
                sliderNeedsToRestart = true;
                contactsIsEmpty = true;
                noServices = true;
                indexItemClicked = false;
                isReFetching = false;
                // Set the global library parameter, so schedule switching won't mess things up.
                library = $(this).val();
                // Fetch data
                getWeekSchelude(0, library);
                fetchInformation(lang, $(this).val());
                fetchImagesAndSocialMedia($(this).val());
                // Re-bind navigation and other stuff.
                bindActions();
                bindScheduleKeyNavigation();
                // Add swiping detection for schedules & sliderbox if available.
                detectswipe("schedules", swipeNavigation);
                if(document.getElementById("sliderBox") != null) {
                    detectswipe("sliderBox", swipeNavigation);
                }
        }
    });

    $(document).on('click', '.map-library-changer', function () {
        // Trigger the library change.
        $('.library-select').val($(this).val()).trigger('change');

    });
}); // OnReady