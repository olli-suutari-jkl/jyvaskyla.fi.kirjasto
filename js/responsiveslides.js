/*! Based on: ResponsiveSlides.js v1.55, but modified heavily.
 * http://responsiveslides.com
 * http://viljamis.com
 *
 * Copyright (c) 2011-2012 @viljamis
 * Available under the MIT license
 */
// Global variable, this will be set to true when changing the selected library.
var sliderNeedsToRestart = false;
var sliderHasIGVideo = false;
var rotate;
// This is called from consortium.js, after lib has changed. It stops the rotation interval within the interval.
function resetSliderAfterLibChange() {
  sliderNeedsToRestart = true;
  sliderHasStopped = true;
  index = 0;
  setTimeout(function() {
    sliderNeedsToRestart = false;
    sliderHasStopped = false;
  }, 6490 );
}
// Once the slider is stopped, don't resume automatically.
var sliderHasStopped = false;
var index = 0;
var length = 1;
(function ($, window, i) {
  $.fn.responsiveSlides = function (options) {
    // Default settings
    var settings = $.extend({
      'lazy': true,             // Boolean: Lazy Load Mode https://github.com/viljamis/ResponsiveSlides.js/pull/382/files
      'speed': 1500,            // Integer: Speed of the transition, in milliseconds
      'timeout': 6500,          // Integer: Time between slide transitions, in milliseconds
      'namespace': 'rslides',   // String: change the default namespace used
      'before': $.noop,         // Function: Before callback
      'after': $.noop           // Function: After callback
    }, options);

    return this.each(function () {
      // Index for namespacing
      i++;
      var $this = $(this),
        // Local variables
        startCycle,
        stopAuto,
        startAuto,
        bindVideoControls,
        setVideoLength,
        // Helpers
        $slide = $this.children(),
        fadeTime = parseFloat(settings.speed),
        waitTime = parseFloat(settings.timeout),
          // Namespacing
        namespace = settings.namespace,
        namespaceIdx = namespace + i,
        // Classes
        navClass = namespace + '_nav ' + namespaceIdx + '_nav',
        visibleClass = namespaceIdx + '_on',
        // Styles for visible and hidden slides
        visible = {'float': 'left', 'position': 'relative', 'opacity': 1, 'zIndex': 2},
        hidden = {'float': 'none', 'position': 'absolute', 'opacity': 0, 'zIndex': 1},
        bindVideoControls = function () {
          $('.video-controls').on("mouseover", function() {
            stopAuto();
          });
          $('.ig-vid').on("click", function() {
            stopAuto();
            var playBtn = $('.rslides1_on .play-pause')[0];
            playBtn.click()
          });
          // Event listener for the play/pause button
          $('.play-pause').on("click", function() {
            var playBtnIcon = $('.rslides1_on .play-stop-icon')[0];
            if($(playBtnIcon).hasClass('fa-redo-alt')) {
              $(playBtnIcon).removeClass('fa-redo-alt');
              //$(playBtnIcon).addClass('fa-play-circle');
              $('.rslides1_on video').trigger('play');
            }
            if($(playBtnIcon).hasClass('fa-stop-circle')) {
              $('.rslides1_on video').trigger('pause');
              $('.rslides1_on video').removeClass('playing');
              $(playBtnIcon).addClass('fa-play-circle');
              $(playBtnIcon).removeClass('fa-stop-circle');
            }
            else {
              $('.rslides1_on video').trigger('play');
              $('.rslides1_on video').addClass('playing');
              $(playBtnIcon).addClass('fa-stop-circle');
              $(playBtnIcon).removeClass('fa-play-circle');
            }
          });
          // Event listener for the mute button
          $('.mute').on("click", function() {
            var muteBtnIcon = $('.rslides1_on .play-mute-icon')[0];
            var volBar = $('.rslides1_on .volume-bar')[0];
            var volBarValue = volBar.value;
            if( $('.rslides1_on video').prop('muted') ) {
              $('.rslides1_on video').prop('muted', false);
              if(volBarValue == 0) {
                $(muteBtnIcon).addClass('fa-volume-off');
              }
              else if(volBarValue < 0.5) {
                $(muteBtnIcon).addClass('fa-volume-down');
              }
              else {
                $(muteBtnIcon).addClass('fa-volume-up');
              }
              $(muteBtnIcon).removeClass('fa-volume-mute');
            } else {
              $('.rslides1_on video').prop('muted', true);
              $(muteBtnIcon).addClass('fa-volume-mute');
              $(muteBtnIcon).removeClass('fa-volume-off');
              $(muteBtnIcon).removeClass('fa-volume-up');
              $(muteBtnIcon).removeClass('fa-volume-down');
            }
          });
          // Pause the video when the slider handle is being dragged
          $(".seek-bar").on("mousedown", function(){
            $('.rslides1_on video').trigger('pause');
          });

          // Play the video when the slider handle is dropped
          $(".seek-bar").on("mouseup", function() {
            $('.rslides1_on video').trigger('play');
            var playBtn = $('.rslides1_on .play-stop-icon')[0];
            $(playBtn).addClass('fa-stop-circle');
            $(playBtn).removeClass('fa-play-circle');
          });

          // Event listener for the seek bar
          $(".seek-bar").on("click touchend", function(e){
            var offset = $(this).offset();
            var left = (e.pageX - offset.left);
            // For touch events.
            if(e.pageX == undefined) {
              var touch = e.originalEvent.changedTouches[0];
              left = (touch.pageX - offset.left);
            }
            var totalWidth = $(".seek-bar").width();
            var percentage = ( left / totalWidth );
            var vid = $('.rslides1_on video')[0];
            var vidTime = vid.duration * percentage;
            vid.currentTime = vidTime;
          });
          // Event listener for the seek bar
          $(".seek-bar").on("input", function(e){
            var seekBar = $('.rslides1_on .seek-bar')[0];
            var vid = $('.rslides1_on video')[0];
            var duration = vid.duration;
            var durationPercentage = duration/100;
            var currentPos = seekBar.value * durationPercentage;
            // Calculate the slider value
            var mins = Math.floor(currentPos / 60);
            var secs = Math.floor(currentPos % 60);
            if (secs < 10) {
              secs = '0' + String(secs);
            }
            var timeStamp = $('.rslides1_on .video-timestamp')[0];
            if (isNaN(secs) || secs == "NaN" || isNaN(mins) && mins == "NaN") {
              $(timeStamp).text('0:00');
              return
            }
            else {
              $(timeStamp).text(mins + ':' + secs);
            }
          });
          // Update the seek bar as the video plays
          $('.ig-vid').on("timeupdate", function() {
            var vid = $('.rslides1_on video')[0];
            var seekBar = $('.rslides1_on .seek-bar')[0];
            var timeStamp = $('.rslides1_on .video-timestamp')[0];
            // Calculate the slider value
            var value = (100 / vid.duration) * vid.currentTime;
            // Update the slider value
            seekBar.value = value;
            var mins = Math.floor(vid.currentTime / 60);
            var secs = Math.floor(vid.currentTime % 60);
            if (secs < 10) {
              secs = '0' + String(secs);
            }
            if (isNaN(secs) || secs == "NaN" || isNaN(mins) && mins == "NaN") {
              $(timeStamp).text('0:00');
            }
            else {
              $(timeStamp).text(mins + ':' + secs);
            }
            if(vid.duration === vid.currentTime) {
              var playBtn = $('.rslides1_on .play-stop-icon')[0];
              $(playBtn).addClass('fa-redo-alt');
              $(playBtn).removeClass('fa-play-circle');
              $(playBtn).removeClass('fa-stop-circle');
            }
          });
          $(".volume-bar").on("change", function(){
            $('.rslides1_on video').prop('muted', false);
            var muteBtnIcon = $('.rslides1_on .play-mute-icon')[0];
            var vid = $('.rslides1_on video')[0];
            var volBar = $('.rslides1_on .volume-bar')[0];
            vid.volume = volBar.value;
            if($(muteBtnIcon).hasClass('fa-volume-mute')) {
              $(muteBtnIcon).removeClass('fa-volume-mute');
            }
            if(volBar.value == 0) {
              $(muteBtnIcon).addClass('fa-volume-off');
              $(muteBtnIcon).removeClass('fa-volume-up');
              $(muteBtnIcon).removeClass('fa-volume-down');
            }
            else if(volBar.value < 0.5) {
              $(muteBtnIcon).addClass('fa-volume-down');
              $(muteBtnIcon).removeClass('fa-volume-up');
              $(muteBtnIcon).removeClass('fa-volume-off');
            }
            else {
              $(muteBtnIcon).addClass('fa-volume-up');
              $(muteBtnIcon).removeClass('fa-volume-off');
              $(muteBtnIcon).removeClass('fa-volume-down');
            }
          });
          // Set video total time if the first slide is a video.
          var videoEnd = $('.rslides1_on .video-end')[0];
          if(videoEnd !== undefined) {
            setVideoLength(videoEnd);
          }
        };
        setVideoLength = function (vidEnd) {
          var vid = $('.rslides1_on video')[0];
          var mins = Math.floor(vid.duration / 60);
          var secs = Math.floor(vid.duration % 60);
          if (secs < 10) {
            secs = '0' + String(secs);
          }
          if(isNaN(secs) || isNaN(mins)) {
            setTimeout(function() {
              console.log("Failed to set video length, retry...");
              $(vidEnd).text('');
              setVideoLength($('.rslides1_on .video-end')[0]);
            }, 1000 );
          }
          else {
            $(vidEnd).text(mins + ':' + secs);
          }
        };
        slideToHelper = function(idx) {
          $slide
              .removeClass(visibleClass)
              .css(hidden)
              .eq(idx)
              .addClass(visibleClass)
              .css(visible);
          index = idx;
          // Set video total time if video. This works unless the video is 1st slide of the show.
          var videoEnd = $('.rslides1_on .video-end')[0];
          if(videoEnd !== undefined) {
            setVideoLength(videoEnd);
          }
          setTimeout(function () {
            settings.after(idx);
          }, fadeTime);
        };

      slideTo = function (idx) {
        // Pause any videos.
        if(sliderHasIGVideo) {
          $(".ig-vid").each(function(){
            $(this).get(0).pause();
          });
          $(".play-stop-icon").each(function(){
            $(this).addClass('fa-play-circle');
            $(this).removeClass('fa-stop-circle');
          });
        }
        settings.before(idx);
        // Lazy loading crashes the slider for iOS...
        if (settings.lazy && !isIOS) {
        try {
          var imgSlide = $($($slide).find("img")[idx]);
          // Is undefined for video elements.
          if(imgSlide[0] == undefined) {
            slideToHelper(idx);
          }
          else {
              var dataSrc = imgSlide.attr("src");
              imgSlide.attr("src", dataSrc);
              imgSlide.on("load", function() {
                slideToHelper(idx);
              })
            }
          }
          catch (e) {
            slideToHelper(idx);
          }
        } else {
          slideToHelper(idx);
        }
      };
      // Add max-width and classes
      $this.addClass(namespace + ' ' + namespaceIdx);
      // Hide all slides, then show first one
      $slide
        .hide()
        .css(hidden)
        .eq(0)
        .addClass(visibleClass)
        .css(visible)
        .show();
      $slide
          .show()
          .css({
            '-webkit-transition': 'opacity ' + fadeTime + 'ms ease-in-out',
            '-moz-transition': 'opacity ' + fadeTime + 'ms ease-in-out',
            '-o-transition': 'opacity ' + fadeTime + 'ms ease-in-out',
            'transition': 'opacity ' + fadeTime + 'ms ease-in-out'
          });
      // Only run if there"s more than one slide
      if ($slide.length > 1) {
        // Make sure the timeout is at least 100ms longer than the fade
        if (waitTime < fadeTime + 100) {
          return;
        }
        // Auto cycle, do-not re-init when changing the library.
        startCycle = function () {
          $("#sliderPlay").removeClass('progress');
          setTimeout(function(){
            $("#sliderPlay").addClass('progress');
          }, 75);
          clearInterval(rotate);
          rotate = setInterval(function () {
            // Clear the event queue
            $slide.stop(true, true);
            if($(".rslides li").length < 2) {
              clearInterval(rotate);
              return
            }
            $("#sliderPlay").removeClass('progress');
            setTimeout(function(){
              $("#sliderPlay").addClass('progress');
            }, 75);
              var idx = index + 1 < length ? index + 1 : 0;
              if(!sliderHasStopped && !sliderNeedsToRestart) {
                if(idx > length) {
                  idx = length;
                }
                $('.rslides1_on').off('click');
                slideTo(idx);
                $("#currentSlide").html(idx + 1);
                adjustParentHeight(50);
              }
          }, waitTime);
        };
        stopAuto = function () {
          clearInterval(rotate);
          sliderHasStopped = true;
          $('#sliderPlay').removeClass('progress');
          $('.fa-stop').addClass('fa-play').removeClass('fa-stop');
          $('.slider-play-container').tooltip('hide')
              .attr('data-original-title', i18n.get('Start automatic playback'))
        };
        startAuto = function (playButton) {
          sliderHasStopped = false;
          $('.fa-play').addClass('fa-stop').removeClass('fa-play');
          if(playButton) {
            $('.slider-play-container').tooltip('hide')
                .attr('data-original-title', i18n.get('Stop automatic playback'))
                .tooltip('show');
          }
          startCycle();
        };
        // Navigation
        var progressBar = '<div data-original-title="' + i18n.get("Stop automatic playback") + '" data-placement="bottom" ' +
            'data-toggle="navigation-tooltip" class="slider-play-container"> <button id="sliderPlay" class="slider-btn progress blue">' +
            '<span class="progress-left">' +
            '<span class="progress-bar"></span>' +
            '</span>' +
            '<span class="progress-right">' +
            '<span class="progress-bar"></span>' +
            '</span>' +
            '<div class="progress-value"><i class="fas fa-stop"></i></div>' +
            '</button></div>';
        var navMarkup =
            '<div class="slider-navigation-container">' +
            '<div class="slider-navigation slider-counter-container">' +
            '<button title="' + i18n.get("Previous slide") +  '" data-placement="bottom" ' +
            'data-toggle="navigation-tooltip" id="sliderPrevious" ' +
            'class="slider-btn ' + navClass + ' prev"><i class="fas fa-arrow-left"></i></button>' +
            '<i class="slider-counter"><span id="currentSlide">1</span></i>' +
            '<button title="' + i18n.get("Next slide") + '" data-placement="right" data-toggle="navigation-tooltip" ' +
            'id="sliderForward" class="slider-btn ' + navClass + ' next"><i class="fas fa-arrow-right"></i>' + '</button></div>' +
            '<div class="slider-navigation slider-play-expand-container"> ' + progressBar +
            '<button id="expandSlider" title="' + i18n.get('Toggle full-screen') + '" data-placement="right" ' +
            ' data-toggle="navigation-tooltip" class="slider-btn"> ' +
            '<i class="fas fa-expand"></i></button></div></div>';
        // Inject navigation
        $('#sliderBox').append(navMarkup);
        if(isIOS || isIE) {
          $('#expandSlider').css('display', 'none');
          $('.slider-play-container').css('margin-left', '-10px');
        }
        $('#sliderPlay').click(function() {
          if($('#sliderPlay i').hasClass('fa-play')) {
            startAuto(true);
          }
          else {
            stopAuto();
          }
        });
        $('[data-toggle="navigation-tooltip"]').tooltip({
          // Unless container is specified, tooltips won't work in full screen.
          container: '.slider-navigation-container',
        });

        $('.slider-play-container').on('show.bs.tooltip', function () {
            $('.slider-play-container').tooltip('hide');
        });
        // De-focus all other buttons
        $( '.slider-btn' ).mouseover(function() {
          $(this).focus()
        });
        // Defocus any active elements when leaving navigation container.
        $( '.slider-navigation-container' ).mouseleave(function() {
          document.activeElement.blur();
        });
        // Defocus any active elements when hovering over slide counter.
        $('.slider-counter').mouseover(function() {
          document.activeElement.blur();
        });
        var $trigger = $('.' + namespaceIdx + '_nav'),
          $prev = $trigger.filter('.prev');
        // Click event handler
        $trigger.bind('click', function (e) {
          e.preventDefault();
          var $visibleClass = $('.' + visibleClass);
          // Prevent clicking if currently animated
          if($visibleClass.queue("fx") === undefined) {
            // If slides are changed quick, sometimes things break. TO DO: Better fix.
            console.log("Something went wrong when loading the slide...");
            //slideTo(0);
            //$("#currentSlide").html("1");
            // float: left; position: relative; opacity: 1; z-index: 2; display: list-item; transition: opacity 1500ms ease-in-out 0s;
          } else {
            if ($visibleClass.queue("fx").length) {
              return;
            }
          }
          /*  Adds active class during slide animation
          $(this)
              .addClass(namespace + "_active")
              .delay(fadeTime)
              .queue(function (next) {
              $(this).removeClass(namespace + "_active");
              next();
          }); */
          // Determine where to slide
          var idx = $slide.index($visibleClass),
            prevIdx = idx - 1 < 0 ? length - 1 : idx - 1, // Fix for prevIdx going < 0 https://github.com/viljamis/ResponsiveSlides.js/pull/212/files
            nextIdx = idx + 1 < length ? index + 1 : 0;
          // Go to slide
          if ($(this)[0] === $prev[0]) {
            $('.rslides1_on').off('click');
            slideTo(prevIdx);
            if(prevIdx == -1) {
              // If we move from 0 to previous (last slide), ui text would be -1.
              // $slide.length is the amount of slides.
              $("#currentSlide").html($slide.length);
            }
            else {
              $("#currentSlide").html(prevIdx + 1);
            }
          }
          else {
            $('.rslides1_on').off('click');
            slideTo(nextIdx);
            $("#currentSlide").html(nextIdx + 1);
          }
          adjustParentHeight(750);
          stopAuto();
        });
      }
      $( '.ig-caption' ).mouseover(function() {
        stopAuto();
      });
      // Init cycle
      if ($slide.length > 1) {
        startCycle();
      }
      if(!sliderHasIGVideo) {
        return;
      }
      try {
        bindVideoControls();
      }
      catch (e) {
        console.log("Failed to set up video controls, trying again in 0.75 seconds.")
        setTimeout(function(){
          try {
            bindVideoControls()
          }
          catch (e) {
            console.log(e);
          }
        }, 750);
      }
    });
  };
})(jQuery, this, 0);
