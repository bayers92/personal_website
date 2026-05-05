var $window = $(window); // Performance boost

$(function(){

  "use strict"; // Using strict mode

  // Settings

  var $toTopButton = true, // Back to top button, set this to false if you don't want it
      $grid = $('.grid'); // The grid, using this for Isotope / Masonry layout

  $('html').append('<div class="loader"></div>'); // Append the loader to the  DOM

  $grid.isotope({
    itemSelector: '.item', // Portfolio item
    stamp: '.stamp',
    percentPosition: true
  });

  // Use Masonry script when images are loaded
  $('.item').imagesLoaded({background:true}).progress( function() {
    $(this).addClass('loaded');
    $grid.isotope('layout');
  });

  // Filter through portfolio items
  $('.filter').on('click', function(){
    $('.filter.active').removeClass('active');
    $(this).addClass('active');
    var filterData = $(this).attr('data-filter');
    $grid.isotope({ filter: filterData });
  });

  // Use smooth transitions between pages on certain links
  // $('#mainnav a, .grid a, .list a, a.btn, .content a').on('click', function(e){
  //   e.preventDefault();
  //   var target = $(this).attr('target');
  //   if(!$(this).hasClass('dropdown-toggle') && !$(this).hasClass('lightbox') && !$(this).hasClass('anchor') && $(this).attr('role') != 'tab' && $(this).attr('href') != '#'){
  //     e.stopPropagation();
  //     loadPage($(this),target);
  //   }
  // });

  // Smooth transition between pages function
  // function loadPage(e,t){
  //   $('body').addClass('unload');
  //   var url = e.attr('href');
  //   $('.loader').addClass('out');
  //   setTimeout(function(){
  //     if(t){
  //       $('body').removeClass('unload');
  //       window.open(url,t);
  //     }
  //     else
  //       window.location = url;
  //   }, 650);
  // }

  // You can use anchor links, using the .anchor class
  $('.anchor').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var href = $(this).attr('href');
    $('html,body').animate({
      scrollTop : $(href).offset().top-50+'px'
    });
  });

  // For the modern navigation, we use a script to trigger the menu
  $('.menu-trigger').on('click', function(){
    $('.navbar-modern').fadeIn();
  });

  // To close the modern menu
  $('.close').on('click', function(){
    $('.navbar-modern').fadeOut();
  });

  // Parallax background script, use the ".parallax" class.
  var parallaxSpeed = 0.15;

  function parallax(){
    // Parallax scrolling function
    $('.parallax').each(function(){
      var el = $(this);
      var yOffset = $(window).scrollTop(),
          parallaxOffset = yOffset * parallaxSpeed,
          parallaxOffset = +parallaxOffset.toFixed(2);
      if(el.hasClass('fs')){
        el.css('transform','translate3d(-50%,-'+(50-parallaxOffset*.15)+'%,0)');
      } else {
        el.css('transform','translate3d(0,'+parallaxOffset+'px,0)');
      }

    });
  }

  // Initialize functions on scroll
  $(window).scroll(function(){
    window.requestAnimationFrame(parallax); // Parallax

    if($window.scrollTop() > 100)
      toTopElement.addClass('show'); // Show ToTop button when scrolled 100px
    else
      toTopElement.removeClass('show'); // Else: hide ToTop button

  });

  // To top Button
  var toTopElement = $('<div class="to-top ion-chevron-up"></div>'); // The ToTop element

  if($toTopButton = true)
    $('body').append(toTopElement);

  toTopElement.on('click', function(){ // When ToTop button is clicked, scroll up
    $('html,body').animate({
      scrollTop: 0
    });
  });

  var $animation_elements = $('.fly-in'); // The fly-in element, used for elements that fly-in the window after they're visible on screen

  function inView() { // Function when element is in view
    var window_height = $window.height();
    var window_top_position = $window.scrollTop();
    var window_bottom_position = (window_top_position + window_height);

    $.each($animation_elements, function() {
      var $element = $(this);
      var element_height = $element.outerHeight();
      var element_top_position = $element.offset().top;
      var element_bottom_position = (element_top_position + element_height);

      //check to see if this current container is within viewport
      if ((element_bottom_position >= window_top_position) &&
        (element_top_position <= window_bottom_position)) {
        $element.addClass('in-view');
      } else {
        $element.removeClass('in-view');
      }
    });
  }

  $window.on('scroll resize', function(){
    window.requestAnimationFrame(inView); // Performance boost
  });

  $window.trigger('scroll');

  //Fixes Firefox back button issue
  $window.on('unload', function() {
    // Nothing needed here :-)
  });

  window.requestAnimationFrame(inView); // Performance boost

});

$window.on('load', function(){
  $('body, .loader').addClass('load'); // Adding class load when loaded.
  $('section .animated').addClass('activate'); // Activate animated backgrounds
});
