$(document).ready(function() {

    $(".slick-carousel").slick({

        // normal options...
        infinite: true,
        slidesToShow: 3,
        slidesToSlide: 1,

        // the magic
        responsive: [{

            breakpoint: 1024,
            settings: {
                slidesToShow: 3
            }

        }, {

            breakpoint: 1000,
            settings: {
                slidesToShow: 2,
                dots: true
            }

        }, {

            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                dots: true,
                variableWidth: true
            }

        }]
    });

    var wow = new WOW(
        {
            boxClass:     'wow',      // animated element css class (default is wow)
            animateClass: 'animated', // animation css class (default is animated)
            offset:       0,          // distance to the element when triggering the animation (default is 0)
            mobile:       true,       // trigger animations on mobile devices (default is true)
            live:         true,       // act on asynchronously loaded content (default is true)
            callback:     function(box) {
            },
            scrollContainer: null // optional scroll container selector, otherwise use window
        }
    );
    wow.init();
});




