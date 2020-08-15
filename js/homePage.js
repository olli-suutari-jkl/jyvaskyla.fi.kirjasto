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

function adjustHomePageHeight(delay) {
    clearTimeout(clearTimer);
    isAdjustingHeight = true;
    delay = delay + 250;
    setTimeout(function(){
        try {
            var newHeight = 0;
            if (selectIsOpen) {
                if (height < 650) {
                    newHeight = 650;
                }
                else {
                    newHeight = height
                }
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

var selectIsOpen = false;
$(document).ready(function() {
    $("#btnOpenLibryPage").append(i18n.get("Open library page"))
    //$("#btnOpenLibryPage").append('<i style="margin-left: 15px; color: white;" class="fas fa-arrow-alt-circle-right" aria-hidden="true"></i>');

    // Since the api is having problems with special schedules, add a notification. To be commented when fixed.
    //$('#schedules').prepend('<p style="color: red">' + i18n.get("Wrong schedules") + '</p>');
    adjustHomePageHeight(500);
    $("#btnOpenLibryPage").on('click', function () {
        moveParentToLibraryUrl(libName);
    });

    $("#btnOpenLibryPage").on('click', function () {
        moveParentToLibraryUrl(libName);
    });
    $('#librarySelector').on('select2:open', function (e) {
        selectIsOpen = true;
        adjustHomePageHeight(0);
    });
    $('#librarySelector').on('select2:close', function (e) {
        selectIsOpen = false;
        adjustHomePageHeight(0);
    });
    setTimeout(function(){
        if($( "body" ).height() > 200) {
            $('#homePageWidget').css("min-height", $( "body" ).height() -18);
        }
        // If we do something like timeout 500, the size will go crazy!
    }, 1200);

    // Sometimes the initial adjustHomePageHeight triggers too early.
    adjustHomePageHeight(1700);

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
    }
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
                }
            }
        }
        if(holidayDescription !== undefined) {
            holidayDescription = holidayDescription.replace(/(?:\r\n|\r|\n)/g, '<br>');
            holidayDescription = generateLinks(holidayDescription);
                $('#specialInfo').replaceWith('<span id="specialInfo" class="info-span info-text"><i class="fas fa-info-circle" > </i> '
                    + holidayDescription + '</span>');
        }
        else {
            $('#specialInfo').replaceWith('<span id="specialInfo" style="display: none" class="info-span info-text"><i class="fas fa-info-circle" > </i></span>');
        }
        if(genericDescription !== undefined) {
            genericDescription = genericDescription.replace(/(?:\r\n|\r|\n)/g, '<br>');
            genericDescription = generateLinks(genericDescription);
            $('#scheduleInfo').replaceWith('<span id="scheduleInfo" class="info-span info-text"><i class="fas fa-info-circle" > </i> '
                + genericDescription + '</span>');
        }
        else {
            $('#scheduleInfo').replaceWith('<span id="scheduleInfo" style="display: none" class="info-span info-text"><i class="fas fa-info-circle" > </i></span>');
        }
    }
}

var weekCounter = 0;
var dateInSchedule;
var selectedDate = new Date();
var weekMinReached = false;
var weekMaxReached = false;
function getDaySchelude(direction, lib) {
    // If no library is provided, use the default option.
    if (lib === undefined) {
        lib = library;
    }
    // +1 or -1;
    weekCounter = weekCounter + direction;
    // Do not allow going more than 30 days to the past or 60 days to the future.
    if (weekCounter < -30) {
        weekCounter = -30;
        if(!weekMinReached) {
            $('#lastWeek').attr('data-toggle', 'tooltip');
            $('#lastWeek').attr('title', i18n.get("Min schedules"));
            $("#lastWeek").tooltip("enable");
            weekMinReached = true;
        }
        $('#lastWeek').tooltip('show');
        return;
    }
    if (weekCounter > 60) {
        weekCounter = 60;
        if(!weekMaxReached) {
            $('#nextWeek').attr('data-toggle', 'tooltip');
            $('#nextWeek').attr('title', i18n.get("Max schedules"));
            $("#nextWeek").tooltip("enable");
            weekMaxReached = true;
        }
        $('#nextWeek').tooltip('show');
        return;
    }
    if(weekMinReached) {
        // Hiding hides tooltip even if cursor is placed on it.
        $("#lastWeek").tooltip("hide");
        // Disable removes the bootstrap tooltip.
        $("#lastWeek").tooltip("disable");
        // Removing attributes removes the normal tooltip.
        $("#lastWeek").removeAttr("data-toggle");
        $("#lastWeek").removeAttr("title");
        weekMinReached = false;
    }
    if(weekMaxReached) {
        $("#nextWeek").tooltip("hide");
        $("#nextWeek").tooltip("disable");
        $("#nextWeek").removeAttr("data-toggle");
        $("#nextWeek").removeAttr("title");
        weekMaxReached = false;
    }
    selectedDate.setDate(selectedDate.getDate() + direction);
    var prettyDate = moment(selectedDate).format("DD.MM.YY");
    // Capitalize 1st letter of dayname.
    var dayName = moment(selectedDate).format("dddd");
    dayName = dayName[0].toUpperCase() + dayName.substr(1);
    $("#weekNumber").html(dayName + " " + prettyDate);
    $.getJSON("https://api.kirjastot.fi/v4/schedules?library=" + lib + "&lang=" + lang +
        "&period.start=" + weekCounter + "d&period.end=" + weekCounter + "d&refs=period&limit=5000",
        {_: new Date().getTime()}, function (data) {
        if (data.items.length === 0) {
            //$('#schedules').css('display', 'none');
            $("#weekSchelude").replaceWith('<tbody id="weekSchelude" class="schedules-weekly">' + "<tr><td></td></tr>");
            $('#dayInfo').replaceWith('<span id="dayInfo" style="display: none" class="info-text"><i class="fas fa-info-circle" > </i></span>');
            $('#scheduleInfo').replaceWith('<span id="scheduleInfo" class="info-span info-text"><i class="fas fa-info-circle" > </i> '
                + i18n.get("No opening hours") + '</span>');
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
                    var infoText = capitalize(schedules[i].info);
                    if (largeSchedules) {
                        if (infoText.length > 30 && infoText.length < 80) {
                            infoText = splitString(infoText);
                        }
                    } else {
                        if (infoText.length > 40 && infoText.length < 90) {
                            infoText = splitString(infoText);
                        }
                    }
                    $('#dayInfo').replaceWith('<span id="dayInfo" class="info-span info-text"><i class="fas fa-info-circle"> </i> ' + infoText + '</span>');
                    increaseRowCount(true);
                }
                else {
                    $('#dayInfo').replaceWith('<span id="dayInfo" style="display: none" class="info-text"><i class="fas fa-info-circle" > </i></span>');
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
                    if (time.status === 1) {
                        staffPresentStart = from;
                        staffPresentEnd = to;
                        // Store the row as a variable.
                        staffToday = '<tr class="time--sub time isTodayClass time--with-staff">' +
                            '<td class="align-right trn"><i class="fas fa-level-up-alt fa-rotate-90"></i> ' + i18n.get("Service time") + '</td>' +
                            '<td class="align-left">' + staffPresentStart + ' – ' + staffPresentEnd + '</td>' +
                            '</tr>';
                    }
                    // self-service
                    else if(time.status === 2) {
                        if (staffPresentStart === '') {
                            selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td class="align-right"><i class="fas fa-level-up-alt fa-rotate-90"></i> ' + i18n.get("Self-service") + '</td>' +
                                '<td class="align-left">' + from + ' – ' + to + '</td>' +
                                '</tr>';
                        } else {
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td class="align-right"><i class="fas fa-level-up-alt fa-rotate-90"></i> ' + i18n.get("Self-service") + '</td>' +
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
            var mainScheduleText = i18n.get("Day schedule");
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
                    mainScheduleText = i18n.get("Self-service");
                    selfServiceBefore = '';
                    selfServiceAfter = '';
                }
            }
            if (isClosed) {
                // Add info row on closed days.
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                    '<td colspan="2" class="main-schedule day-main-schedule closed">' + i18n.get("Closed") + '</td>' +
                    '</tr>';
            } else {
                var mainSchedule = '<tr class="time ' + isTodayClass + '">' +
                    '<td colspan="2" class="main-schedule day-main-schedule">' + mainScheduleText +': <time datetime="' + dayStart + '">' + dayStart.replace(/:/g, ".") + '</time> – <time datetime="' + dayEnd + '">'
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
        adjustHomePageHeight(0);
        $('#scheduleTitle').html(i18n.get("Opening hours"));
        $('#scheduleTitle').css('display', 'block');
    });
}
