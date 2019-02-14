// isLibraryList variable is used to determine when to load schedules.
var isLibaryList = false;
// isScheduleEmpty is is used for displaying error message if no description or schedules is found.
var isScheduleEmpty = false;

moment.locale(lang);
var HHmmFormat = 'HH:mm';

function isBefore(timeOne, timeTwo) {
    return !!moment(timeOne, HHmmFormat).isBefore(moment(timeTwo, HHmmFormat));
}

function isSame(timeOne, timeTwo) {
    if(moment(timeOne, HHmmFormat).isSame(moment(timeTwo, HHmmFormat))) {
        return true;
    } else {
        return false;
    }
}

function isSameOrBefore(timeOne, timeTwo) {
    if(moment(timeOne, HHmmFormat).isBefore(moment(timeTwo, HHmmFormat)) ||
        (moment(timeOne, HHmmFormat).isSame(moment(timeTwo, HHmmFormat)))) {
        return true;
    } else {
        return false;
    }
}

/* Split string after the word in the middle
* https://stackoverflow.com/questions/18087416/split-string-in-half-by-word */
function splitString(s) {
    var middle = Math.floor(s.length / 2);
    var before = s.lastIndexOf(' ', middle);
    var after = s.indexOf(' ', middle + 1);
    if (before == -1 || (after != -1 && middle - before >= after - middle)) {
        middle = after;
    } else {
        middle = before;
    }
    var s1 = s.substr(0, middle);
    var s2 = s.substr(middle + 1);
    return s1 + '<br>' + s2;
}

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
                    // Add rows for infoscreen font-size calculations...
                    if (holidayDescription.length < 40) {
                        totalRows = totalRows +1;
                    }
                    else if (holidayDescription.length > 40 && holidayDescription.length < 90) {
                        holidayDescription = splitString(holidayDescription);
                        totalRows = totalRows +2;
                    }
                    else if(holidayDescription.length > 130 && holidayDescription.length < 170) {
                        totalRows = totalRows +3;
                    }
                    else {
                        totalRows = totalRows +4;
                    }
                    var mondayDate = moment().add(weekCounter, 'weeks').weekday(0).format("YYYY-MM-DD");
                    var sundayDate = moment().add(weekCounter, 'weeks').weekday(6).format("YYYY-MM-DD");
                    //console.log(items[i].validFrom + "|"  + mondayDate);
                    //console.log(items[i].validUntil + "|"  + sundayDate);
                    if(items[i].validFrom == mondayDate && items[i].validUntil == sundayDate) {
                        isSpecialWeek = true;
                        totalRows = totalRows +2;
                        $('#specialInfo').replaceWith('<span id="specialInfo" class="info-span info-text"><i class="fa fa-info-circle" > </i> '
                            + holidayDescription + '</span>');
                    }
                    else {
                        totalRows = totalRows +2;
                        //genericDescription = genericDescription + "<br><br>" + holidayDescription;
                        $('#specialInfo').replaceWith('<span id="specialInfo" class="info-span info-text"><i class="fa fa-info-circle" > </i> '
                            + holidayDescription + '</span>');
                    }
                }
                if(genericDescription !== undefined && !isSpecialWeek) {
                    $('#scheduleInfo').replaceWith('<span id="scheduleInfo" class="info-span info-text"><i class="fa fa-info-circle" > </i> '
                        + genericDescription + '</span>');
                    // Add rows for infoscreen font-size calculations...
                    if (genericDescription.length < 40) {
                        totalRows = totalRows +1;
                    }
                    else if (genericDescription.length > 40 && genericDescription.length < 90) {
                        genericDescription = splitString(genericDescription);
                        totalRows = totalRows +2;
                    }
                    else if(genericDescription.length > 130 && genericDescription.length < 170) {
                        totalRows = totalRows +3;
                    }
                    else {
                        totalRows = totalRows +4;
                    }
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
// totalRows is used to dynamically adjust font sizes for info-screens.
var totalRows = 0;
function getWeekSchelude(direction, lib) {
    totalRows = 0;
    // If no library is provided, use the default option.
    if (lib === undefined) {
        lib = library;
    }
    // +1 or -1;
    weekCounter = weekCounter + direction;
    var weekNumber = moment().add(weekCounter, 'weeks').format('W');
    // As of 4.1.2019, the API does not return the schedule periods and their infos from
    // 2018, thus limit going back to the last year, prevent going to the last year..
    if (weekCounter < 0 && weekNumber == 52) {
        weekCounter = weekCounter + 1;
        return;
    }
    // Do not allow going more than 10 weeks to the past or for more than 26 weeks.
    if (weekCounter < -10) {
        weekCounter = -10;
        return;
    }
    if (weekCounter > 26) {
        weekCounter = 26;
        return;
    }
    // Display week number.
    $("#weekNumber").html(i18n.get("Viikko") + ' ' + weekNumber);
    // Use &pretty: https://github.com/libraries-fi/kirkanta-api/issues/3
    $.getJSON("https://api.kirjastot.fi/v4/schedules?library=" + lib + "&lang=" + lang +
        "&period.start=" + weekCounter + "w&period.end=" + weekCounter + "w&refs=period&limit=5000&pretty", function (data) {
        if (data.items.length === 0) {
            $('#schedules').css('display', 'none');
            isScheduleEmpty = true;
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
            var dayInfo = '';
            var rowspanCount = 1;
            // Scheludes for: combined, selfServiceBefore, MagazinesBefore,  staffToday, selfServiceAfter & magazinesAfter
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
                            totalRows = totalRows + 1;
                        } else if (infoText.length > 80) {
                            totalRows = totalRows + 1;
                        }
                    } else {
                        if (infoText.length > 40 && infoText.length < 90) {
                            infoText = splitString(infoText);
                            totalRows = totalRows + 1;
                        } else if (infoText.length > 90) {
                            totalRows = totalRows + 1;
                        }
                    }
                    dayInfo = '<tr class="info-row time--sub isTodayClass">' +
                        '<td colspan="2"><span class="info-text"><i class="fa fa-info-circle" > </i> ' + infoText + '</span></td>' +
                        '</tr>';
                    increaseRowCount(true);
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
                            '<td class="trn"><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Henkilökunta paikalla") + '</td>' +
                            '<td>' + staffPresentStart + ' – ' + staffPresentEnd + '</td>' +
                            '</tr>';
                    }
                    // self-service
                    else {
                        if (staffPresentStart === '') {
                            selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td>' + from + ' – ' + to + '</td>' +
                                '</tr>';
                        } else {
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td>' + from + ' – ' + to + '</td>' +
                                '</tr>';
                        }
                    }
                }
            }
            // If today, apply 'today' -class.
            if (moment(begin).isSame(moment(), 'day')) {
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
                dayInfo = dayInfo.replace("isTodayClass", isTodayClass);
            }
            // Replace : with . in schedules.
            selfServiceBefore = selfServiceBefore.replace(/:/g, ".");
            staffToday = staffToday.replace(/:/g, ".");
            selfServiceAfter = selfServiceAfter.replace(/:/g, ".");
            // If no selfService or magazines, don't display a separate row for "Staff present".
            if (selfServiceBefore.length === 0 &&
                selfServiceAfter.length === 0) {
                if (staffToday.length !== 0) {
                    staffToday = '';
                    rowspanCount = rowspanCount - 1;
                }
            }
            if (isClosed) {
                // Add info row on closed days.
                var closedRowSpan = 1;
                if (dayInfo !== "") {
                    closedRowSpan = 2;
                }
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                    '<th class="date-container" scope="row" rowspan="' + closedRowSpan + '">' +
                    '<time datetime="' + begin.format('YYYY-MM-DD') + '">' + begin.format('D.M.') + '</time>' +
                    '</th>' +
                    '<td class="day-name">' + dayName + '</td>' +
                    '<td class="main-schedule closed">' + i18n.get("Suljettu") + '</td>' +
                    '</tr>' + dayInfo;
            } else {
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                    '<th class="date-container" scope="row" rowspan="' + rowspanCount + '">' +
                    '<time datetime="' + begin.format('YYYY-MM-DD') + '">' + begin.format('D.M.') + '</time>' +
                    '</th>' +
                    '<td class="day-name">' + dayName + '</td>' +
                    '<td class="main-schedule"><time datetime="' + dayStart + '">' + dayStart.replace(/:/g, ".") + '</time> – <time datetime="' + dayEnd + '">'
                    + dayEnd.replace(/:/g, ".") + '</time></td></tr>' + selfServiceBefore + staffToday +
                    selfServiceAfter + dayInfo;
            }
            totalRows = totalRows + rowspanCount;
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
        // Large schedules are used in iDiD info screens.
        if(largeSchedules) {
            $(".library-schedules").removeClass('col-lg-4 col-xl-3 schedules-widget xxl-font xl-font m-font');
            $('#schedules').addClass("large-schedules col-md-12");
            $('#scheduleInfo').addClass("large-schedules col-md-12");
            // If less than 18 rows, apply the xxl font.
            //console.log(totalRows + " rows ");
            if(totalRows < 18) {
                //console.log("Use XXL-Font");
                $(".library-schedules").addClass('xxl-font');
                $("#scheduleInfo").addClass('xxl-font');
            }
            // If 26 rows or less, apply the xl font.
            else if(totalRows < 27) {
                //console.log("Use XL-Font");
                $(".library-schedules").addClass('xl-font');
                $("#scheduleInfo").addClass('xl-font');
            }
            // If more than 26 rows, change to 'medium' font.
            else if(totalRows > 26) {
                //console.log("Use M-Font");
                $(".library-schedules").addClass('m-font');
                $("#scheduleInfo").addClass('m-font');
            }
        } else {
            $('#scheduleTitle').html(i18n.get("Aukioloajat"));
            $('#scheduleTitle').css('display', 'block');
        }
    });
}

function bindScheduleKeyNavigation() {
    // This prevents the page from jumping to "nextWeek", when hovering over the schedules.
    var element = document.getElementById('nextWeek');
    element.focus({
        preventScroll: false
    });
    // Blur, since the previous thing would leave focus to the element by default.
    $("#nextWeek").blur();
    // Activate arrow navigation when hovering over the schedules.
    $("#schedules").mouseenter (function(){
        if(!$(".library-schedules").hasClass('hovering')) {
            $(".library-schedules").addClass('hovering');
            // If we blur instantly, arrow navigation won't work unless something has been clicked in the document.
            setTimeout(function(){ $("#nextWeek").blur(); }, 5);
        }
    });
    $( "#schedules" ).mouseleave(function() {
        $(".library-schedules").removeClass('hovering');
    });
}

// Swiping for schedules & image slider. https://stackoverflow.com/questions/15084675/how-to-implement-swipe-gestures-for-mobile-devices
function detectswipe(el,func) {
    var swipe_det = new Object();
    swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
    var min_x = 30;  // min x swipe for horizontal swipe
    var max_x = 1;  // max x difference for vertical swipe (ignored)
    var min_y = 1;  // min y swipe for vertical swipe (ignored)
    var max_y = 60;  // max y difference for horizontal swipe
    var direc = "";
    ele = document.getElementById(el);
    ele.addEventListener('touchstart',function(e){
        var t = e.touches[0];
        swipe_det.sX = t.screenX;
        swipe_det.sY = t.screenY;
    },false);
    ele.addEventListener('touchmove',function(e){
        var t = e.touches[0];
        swipe_det.eX = t.screenX;
        swipe_det.eY = t.screenY;
    },false);
    ele.addEventListener('touchend',function(e){
        // horizontal detection
        if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
            e.preventDefault();
            if(swipe_det.eX > swipe_det.sX) direc = "r";
            else direc = "l";
        }
        // vertical detection
        else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
            return;
            //if(swipe_det.eY > swipe_det.sY) direc = "d";
            //else direc = "u";
        }
        // Call the swipeNavigation function with the right direction.
        if (direc != "") {
            if(typeof func == 'function') func(el,direc);
        }
        direc = "";
        swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
    },false);
}
// Navigate schedules or image slider by swiping.
function swipeNavigation(el,d) {
    if (el === "schedules") {
        //alert("Thou swiped on element with id '"+el+"' to "+d+" direction");
        if(d === "r") {
            $("#lastWeek").focus();
            $("#lastWeek").click();
        } else if (d === "l") {
            $("#nextWeek").focus();
            $("#nextWeek").click();
        }
    }
    else if(el === "sliderBox") {
        if(d === "r") {
            $("#sliderPrevious").focus();
            $("#sliderPrevious").click();
        } else if (d === "l") {
            $("#sliderForward").focus();
            $("#sliderForward").click();
        }
    }
}

$(document).ready(function() {
    // Trigger schedule fetching, if no library list, otherwise trigger in consortium.js
    if(!isLibaryList) {
        getWeekSchelude(0, library);
    }
    // UI texts.
    $('#scheludesSr').append(i18n.get("Aikataulut"));
    bindScheduleKeyNavigation();
    // Detect left/right on schedules or move backwards/forwards in slider if in fullscreen mode or when hovering small slider..
    $(document).keydown(function(e) {
        switch(e.which) {
            case 37: // left
                if($(".library-schedules").hasClass("hovering")
                    || $("#lastWeek").is(":focus") || $("#nextWeek").is(":focus")) {
                    $("#lastWeek").focus();
                    $("#lastWeek").click();
                }
                // Slider hovering is not really used with schedules, but it's better to do it here instead of adding another $(document).keydown(function(e) {
                else if(!$("#sliderBox").hasClass("small-slider") || $("#sliderBox").hasClass("hovering")
                    || $("#sliderPrevious").is(":focus") || $("#sliderForward").is(":focus")) {
                    $("#sliderPrevious").focus();
                    $("#sliderPrevious").click();
                }
                else if($(".nav-pills").hasClass("hovering")
                    || $("#navEsittely").is(":focus") || $("#navYhteystiedot").is(":focus")|| $("#navPalvelut").is(":focus")) {
                    if(activeTab === 1) {
                        $("#navEsittely").focus();
                        $("#navEsittely").click();
                    }
                    else if(activeTab === 2) {
                        $("#navYhteystiedot").focus();
                        $("#navYhteystiedot").click();
                    }
                }
                break;
            case 39: // right
                if($(".library-schedules").hasClass("hovering")
                    || $("#lastWeek").is(":focus") || $("#nextWeek").is(":focus")) {
                    $("#nextWeek").focus();
                    $("#nextWeek").click();
                }
                // Slider hovering is not really used with schedules, but it's better to do it here instead of adding another $(document).keydown(function(e) {
                else if(!$("#sliderBox").hasClass("small-slider") || $("#sliderBox").hasClass("hovering")
                    || $("#sliderPrevious").is(":focus") || $("#sliderForward").is(":focus")) {
                    // Go to slide
                    $("#sliderForward").focus();
                    $("#sliderForward").click();
                }
                else if($(".nav-pills").hasClass("hovering")
                    || $("#navEsittely").is(":focus") || $("#navYhteystiedot").is(":focus")|| $("#navPalvelut").is(":focus")) {
                    if(activeTab === 0) {
                        $("#navYhteystiedot").focus();
                        $("#navYhteystiedot").click();
                    }
                    else if(activeTab === 1) {
                        $("#navPalvelut").focus();
                        $("#navPalvelut").click();
                    }
                }
                break;
            default: return; // exit this handler for other keys
        }
    });
    // Add swiping detection for schedules & sliderbox if available.
    detectswipe("schedules", swipeNavigation);
    if(document.getElementById("sliderBox") != null) {
        detectswipe("sliderBox", swipeNavigation);
    }
}); // OnReady
