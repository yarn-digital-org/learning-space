jQuery(document).ready(function(){
  jQuery('.recommend-products').owlCarousel({
  loop: true,
  margin: 10,
  nav: true,
  navText: [
    "",
    ""
  ],
  autoplay: true,
  autoplayHoverPause: true,
  responsive: {
    0: {
      items: 2
    },
    600: {
      items: 2
    },
    1000: {
      items: 3
    }
  }
})
})
