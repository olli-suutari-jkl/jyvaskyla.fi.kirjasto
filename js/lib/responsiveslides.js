/*! Based on: ResponsiveSlides.js v1.55, but modified heavily.
 * http://responsiveslides.com
 * http://viljamis.com
 *
 * Copyright (c) 2011-2012 @viljamis
 * Available under the MIT license
 */
// Global variable, this will be set to true when changing the selected library.
var sliderNeedsToRestart = false;
var rotate;

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
      'prevText': '<',          // String: Text for the 'previous' button
      'nextText': '>',          // String: Text for the 'next' button
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
        slideToHelper = function(idx) {
          $slide
              .removeClass(visibleClass)
              .css(hidden)
              .eq(idx)
              .addClass(visibleClass)
              .css(visible);
          index = idx;
          setTimeout(function () {
            settings.after(idx);
          }, fadeTime);
        };

      slideTo = function (idx) {
        settings.before(idx);
        // Lazy loading crashes the slider for iOS...
        if (settings.lazy && !isIOS) {
          try {
            var imgSlide = $($($slide).find("img")[idx]);
            var dataSrc = imgSlide.attr("src");
            imgSlide.attr("src", dataSrc);
            imgSlide.on("load", function() {
              slideToHelper(idx);
            })
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
        stopAuto = function (playButton) {
          clearInterval(rotate);
          sliderHasStopped = true;
          $('#sliderPlay').removeClass('progress');
          $('.fa-stop').addClass('fa-play').removeClass('fa-stop');
          if(playButton) {
            $('.slider-play-container').tooltip('hide')
                .attr('data-original-title', i18n.get('Start automatic playback'))
                .tooltip('show');
          }

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
            '<div class="progress-value"><i class="fa fa-stop"></i></div>' +
            '</button></div>';
        var navMarkup =
            '<div class="slider-navigation-container">' +
            '<div class="slider-navigation slider-counter-container">' +
            '<button title="' + i18n.get("Previous slide") +  '" data-placement="bottom" ' +
            'data-toggle="navigation-tooltip" id="sliderPrevious" ' +
            'class="slider-btn ' + navClass + ' prev">' + settings.prevText + '</button>' +
            '<i class="slider-counter"><span id="currentSlide">1</span></i>' +
            '<button title="' + i18n.get("Next slide") + '" data-placement="right" data-toggle="navigation-tooltip" ' +
            'id="sliderForward" class="slider-btn ' + navClass + ' next">' + settings.nextText + '</button></div>' +
            '<div class="slider-navigation slider-play-expand-container"> ' + progressBar +
            '<button id="expandSlider" title="' + i18n.get('Toggle full-screen') + '" data-placement="right" ' +
            ' data-toggle="navigation-tooltip" class="slider-btn test"> ' +
            '<i class="fa fa-expand"></i></button></div></div>';
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
            stopAuto(true);
          }
        });
        $('[data-toggle="navigation-tooltip"]').tooltip({
          // Unless container is specified, tooltips won't work in full screen.
          container: '.slider-navigation-container',
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
          if ($visibleClass.queue("fx").length) {
            return;
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
      startCycle();
    });
  };
})(jQuery, this, 0);
