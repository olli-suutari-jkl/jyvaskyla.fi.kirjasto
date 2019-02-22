function moveParentToLibraryUrl(toAdd) {
    toAdd = toAdd.toLowerCase();
    toAdd = toAdd.replace(/ /g, "-");
    toAdd = toAdd.replace(/ä/g, "a");
    toAdd = toAdd.replace(/ö/g, "o");
    toAdd = toAdd.replace(/\(/g, "");
    toAdd = toAdd.replace(/\)/g, "");
    toAdd =  libPageUrl + "?" + toAdd;
    try {
        parent.postMessage({value: toAdd, type: 'redirect'}, '*');
    }
    catch (e) {
        console.log("Parent redirect failed: " + e);
    }
}

// Timer  is used to stop onresize event from firing after adjustment is done by triggering the function manually.
var isAdjustingHeight = false;
var clearTimer;
function setAdjustingToFalse() {
    clearTimer = setTimeout(function(){
        isAdjustingHeight = false;
    }, 1200);
}

var height = 0;
function adjustHomePageHeight(delay, openSelect) {
    clearTimeout(clearTimer);
    isAdjustingHeight = true;
    delay = delay + 150;
    setTimeout(function(){
        try {
            var newHeight = 15;
            if(openSelect) {
                newHeight = 650;
            }
            else {
                newHeight = newHeight + document.getElementById("homePageWidget").scrollHeight;
            }
            if(newHeight !== height) {
                parent.postMessage({value: newHeight, type: 'resize'}, '*');
            }
            height = newHeight;
            setAdjustingToFalse();

        }
        catch (e) {
            console.log("iframe size adjustment failed: " + e);
        }
    }, delay);
}

$(document).ready(function() {
    $("#btnOpenLibryPage").append(i18n.get("Open library page"));
    adjustHomePageHeight(500);
    $("#btnOpenLibryPage").on('click', function () {
        moveParentToLibraryUrl(libName);
    });

    $("#btnOpenLibryPage").on('click', function () {
        moveParentToLibraryUrl(libName);
    });
    $('#librarySelector').on('select2:open', function (e) {
        adjustHomePageHeight(0, true);
    });
    $('#librarySelector').on('select2:close', function (e) {
        adjustHomePageHeight(0);
    });

    // Add event listener for resizing the window, adjust parent when done so.
    // https://stackoverflow.com/questions/5489946/jquery-how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-ac
    var rtime;
    var timeout = false;
    var delta = 200;
    $(window).resize(function() {
        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(resizeend, delta);
        }
    });
    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            timeout = false;
            if(!isAdjustingHeight) {
                adjustHomePageHeight(1);
            }
        }
    }
});


// Function for generating the period info of the schedule.
function generateScheduleInfo(data) {
    var genericDescription;
    var holidayDescription;
    var isHoliday = false;
    var items = [];
    // Turn object object array to object array.
    for (var key in data) {
        if (data.hasOwnProperty(key) && (typeof data[key] === "object")) {
            //jsonPrinter(data[key]);
            var obj = data[key];
            var row = {};
            for (var key in obj) {
                //console.log(key + " -> " + obj[key]);
                row[key] = obj[key];
            }
            items.push(row);
        }
    };
    // Loop the array.
    for (var i = 0; i < items.length; i++) {
        // Collections
        if (items[i].name != null) {
            // Generic description has no valid_until (null)
            if(items[i].description !== null && items[i].description.length !== 0) {
                if(!items[i].isException) {
                    genericDescription = items[i].description;
                }
                else {
                    holidayDescription = items[i].description;
                    isHoliday = true;
                }
            }
        }
        var isSpecialWeek = false;
        if(holidayDescription !== undefined) {
            var mondayDate = moment().add(weekCounter, 'weeks').weekday(0).format("YYYY-MM-DD");
            var sundayDate = moment().add(weekCounter, 'weeks').weekday(6).format("YYYY-MM-DD");
            //console.log(items[i].validFrom + "|"  + mondayDate);
            //console.log(items[i].validUntil + "|"  + sundayDate);
            if(items[i].validFrom == mondayDate && items[i].validUntil == sundayDate) {
                isSpecialWeek = true;
                $('#specialInfo').replaceWith('<span id="specialInfo" class="info-span info-text"><i class="fa fa-info-circle" > </i> '
                    + holidayDescription + '</span>');
            }
            else {
                //genericDescription = genericDescription + "<br><br>" + holidayDescription;
                $('#specialInfo').replaceWith('<span id="specialInfo" class="info-span info-text"><i class="fa fa-info-circle" > </i> '
                    + holidayDescription + '</span>');
            }
        }
        if(genericDescription !== undefined && !isSpecialWeek) {
            $('#scheduleInfo').replaceWith('<span id="scheduleInfo" class="info-span info-text"><i class="fa fa-info-circle" > </i> '
                + genericDescription + '</span>');
        }
        else {
            $('#scheduleInfo').replaceWith('<span id="scheduleInfo" style="display: none" class="info-span info-text"><i class="fa fa-info-circle" > </i></span>');
        }
        if(holidayDescription === undefined) {
            $('#specialInfo').replaceWith('<span id="specialInfo" style="display: none" class="info-span info-text"><i class="fa fa-info-circle" > </i></span>');
        }
    }
}

var weekCounter = 0;
var dateInSchedule;
var selectedDate = new Date();
function getDaySchelude(direction, lib) {
    // If no library is provided, use the default option.
    if (lib === undefined) {
        lib = library;
    }
    // +1 or -1;
    weekCounter = weekCounter + direction;
    // Do not allow going more than 14 days to the past or 28 days to the future.
    if (weekCounter < -14) {
        weekCounter = -14;
        return;
    }
    if (weekCounter > 28) {
        weekCounter = 28;
        return;
    }
    selectedDate.setDate(selectedDate.getDate() + direction);
    //console.log(selectedDate);
    var prettyDate = moment(selectedDate).format("DD.MM.YY");
    // Capitalize 1st letter of dayname.
    var dayName = moment(selectedDate).format("dddd");
    dayName = dayName[0].toUpperCase() + dayName.substr(1);

    $("#weekNumber").html(dayName + " " + prettyDate);
    // Use &pretty: https://github.com/libraries-fi/kirkanta-api/issues/3
    $.getJSON("https://api.kirjastot.fi/v4/schedules?library=" + lib + "&lang=" + lang +
        "&period.start=" + weekCounter + "d&period.end=" + weekCounter + "d&refs=period&limit=5000&pretty", function (data) {
        if (data.items.length === 0) {
            //$('#schedules').css('display', 'none');
            $("#weekSchelude").replaceWith('<tbody id="weekSchelude" class="schedules-weekly">' + "<tr><td></td></tr>");
            $('#dayInfo').replaceWith('<span id="dayInfo" style="display: none" class="info-text"><i class="fa fa-info-circle" > </i></span>');
            $('#scheduleInfo').replaceWith('<span id="scheduleInfo" class="info-span info-text"><i class="fa fa-info-circle" > </i> '
                + i18n.get("Suljettu") + '</span>');
            return;
        }
        var date = moment().add(weekCounter, 'weeks');
        dateInSchedule = new Date();
        dateInSchedule.setDate(dateInSchedule.getDate() + (weekCounter * 7));
        var begin = moment(date).startOf('week').isoWeekday(1);
        // If lang == en, add 1 week. Otherwise last week will be shown... but why?
        if (lang == "en") {
            date = moment().add(weekCounter + 1, 'weeks');
            begin = moment(date).startOf('week').isoWeekday(1);
        }
        var str = '';
        var schedules = data.items;
        generateScheduleInfo(data.refs.period);
        for (var i = 0; i < schedules.length; i++) {
            // If today, add some colourful classes!
            var isTodayClass = '';
            var rowspanCount = 1;
            var isClosed = true;
            var dayStart = '';
            var dayEnd = '';
            var selfServiceBefore = '';
            var staffToday = '';
            var selfServiceAfter = '';
            // ScheludeRow will be used to bring things together
            var scheludeRow = '';
            // Variables for schelude times.
            var staffPresentStart = '';
            var staffPresentEnd = '';
            // Capitalize 1st letter of dayname.
            var dayName = begin.format("dddd");
            dayName = dayName[0].toUpperCase() + dayName.substr(1);

            function increaseRowCount(isInfo) {
                // Increase rowspanCount to be used with DD.M. for each open section.
                rowspanCount = rowspanCount + 1;
                // Don't set library as open for info rows
                if (!isInfo) {
                    isClosed = false;
                }
            }
            // If schedules exists
            if (schedules != null) {
                // Info row.
                if (schedules[i].info !== null) {
                    // Split long info strings in half, ignore longer than 60/80 chars.
                    var infoText = schedules[i].info;
                    if (largeSchedules) {
                        if (infoText.length > 30 && infoText.length < 80) {
                            infoText = splitString(infoText);
                        }
                    } else {
                        if (infoText.length > 40 && infoText.length < 90) {
                            infoText = splitString(infoText);
                        }
                    }
                    $('#dayInfo').replaceWith('<span id="dayInfo" class="info-span info-text"><i class="fa fa-info-circle"> </i> ' + infoText + '</span>');
                    increaseRowCount(true);
                }
                else {
                    $('#dayInfo').replaceWith('<span id="dayInfo" style="display: none" class="info-text"><i class="fa fa-info-circle" > </i></span>');
                }
                for (var t = 0; t < schedules[i].times.length; t++) {
                    var time = schedules[i].times[t];
                    increaseRowCount();
                    var from = time.from;
                    var to = time.to;
                    // Adjust main opening times.
                    if (dayStart === '' || isBefore(from, dayStart)) {
                        dayStart = from;
                    }
                    if (dayEnd === '' || isBefore(dayEnd, to)) {
                        dayEnd = to;
                    }
                    // If staff is present.
                    if (time.staff) {
                        staffPresentStart = from;
                        staffPresentEnd = to;
                        // Store the row as a variable.
                        staffToday = '<tr class="time--sub time isTodayClass time--with-staff">' +
                            '<td class="align-right trn"><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Palveluaika") + '</td>' +
                            '<td class="align-left">' + staffPresentStart + ' – ' + staffPresentEnd + '</td>' +
                            '</tr>';
                    }
                    // self-service
                    else {
                        if (staffPresentStart === '') {
                            selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td class="align-right"><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td class="align-left">' + from + ' – ' + to + '</td>' +
                                '</tr>';
                        } else {
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td class="align-right"><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td class="align-left">' + from + ' – ' + to + '</td>' +
                                '</tr>';
                        }
                    }
                }
            }
            // If today, apply 'today' -class.
            //if (moment(begin).isSame(moment(), 'day')) {
                isTodayClass = "is-closed";
                // var time = moment() gives you current time. no format required.
                var time = moment(moment(), HHmmFormat),
                    openingTime = moment(staffPresentStart, HHmmFormat),
                    closingTime = moment(staffPresentEnd, HHmmFormat);
                // Check if staff is present.
                if (time.isBetween(openingTime, closingTime)) {
                    isTodayClass = "is-open";
                }
                // If not, check if self service time.
                else {
                    time = moment(moment(), HHmmFormat),
                        openingTime = moment(dayStart, HHmmFormat),
                        closingTime = moment(dayEnd, HHmmFormat);
                    if (time.isBetween(openingTime, closingTime)) {
                        isTodayClass = "is-self-service";
                    }
                }
                // Apply the class to the sections.
                selfServiceBefore = selfServiceBefore.replace("isTodayClass", isTodayClass);
                staffToday = staffToday.replace("isTodayClass", isTodayClass);
                selfServiceAfter = selfServiceAfter.replace("isTodayClass", isTodayClass);
            //}
            // Replace : with . in schedules.
            selfServiceBefore = selfServiceBefore.replace(/:/g, ".");
            staffToday = staffToday.replace(/:/g, ".");
            selfServiceAfter = selfServiceAfter.replace(/:/g, ".");
            var mainScheduleText = i18n.get("Aukiolo");
            // If no selfService, don't display a separate row for "Staff present".
            if (selfServiceBefore.length === 0 && selfServiceAfter.length === 0) {
                if (staffToday.length !== 0) {
                    staffToday = '';
                    rowspanCount = rowspanCount - 1;
                }
            }
            // Display main schedule text as "Omatoimiaika"
            else {
                if (staffToday.length === 0) {
                    mainScheduleText = i18n.get("Omatoimiaika");
                    selfServiceBefore = '';
                    selfServiceAfter = '';
                }
            }
            if (isClosed) {
                // Add info row on closed days.
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                    '<td colspan="2" class="main-schedule closed">' + i18n.get("Suljettu") + '</td>' +
                    '</tr>';
            } else {

                var mainSchedule = '<tr class="time ' + isTodayClass + '">' +
                    '<td colspan="2" class="main-schedule">' + mainScheduleText +': <time datetime="' + dayStart + '">' + dayStart.replace(/:/g, ".") + '</time> – <time datetime="' + dayEnd + '">'
                    + dayEnd.replace(/:/g, ".") + '</time></td></tr>';
                // If day has service & selfService times.
                if(staffToday.length !== 0 && (selfServiceBefore.length !== 0 ||
                    selfServiceAfter.length !== 0)) {
                    mainSchedule = "";
                }
                scheludeRow = mainSchedule + selfServiceBefore + staffToday + selfServiceAfter;
            }
            str += scheludeRow;
            begin.add(1, 'd');
        }
        $("#weekSchelude").replaceWith('<tbody id="weekSchelude" class="schedules-weekly">' + str);
        // If document has no title, set it to Library name.
        if (document.title === '') {
            if (data.name != null) {
                document.title = data.name;
            }
        }
        $('#scheduleTitle').html(i18n.get("Aukioloajat"));
        $('#scheduleTitle').css('display', 'block');
    });
}