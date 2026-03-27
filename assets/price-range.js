//<![CDATA[
document.addEventListener("DOMContentLoaded", function(event) {
    // $(".filter_input").change(function() {
    //   bindURL()
    // });
    if($("#slider-range").length > 0){
        $("#slider-range").slider({
            range: true,
            min: filterMinPrice,
            max: filterMaxPrice,
            values: [minFilterPrice, maxFilterPrice],
            slide: function(event, ui) {
                $("#minprice").val(ui.values[0]);
                $("#maxprice").val(ui.values[1]);
            },
            stop: function(e, ui) {
                $("#minprice").val(ui.values[0]);
                $("#maxprice").val(ui.values[1]);
                bindURL();
            },
        });
        //slider range data tooltip set
        $("#amount").val(
            currencyCode +
            $("#slider-range").slider("values", 0).toFixed(2) +" - " +currencyCode + $("#slider-range").slider("values", 1).toFixed(2)
        );
    }
});

function numberWithCommas(x) {
    if (x !== null) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

function bindURL() {
    $("#filter_test_form").submit();
}

$(".size-filter,#amount,.color-filter,.filter_vendor").on(
    "change",
    function() {
        bindURL();
    }
);

// Shortcircuit variable
let triggered = false;

function ScrollExecute() {
    // Locate loadmore button

    if (!triggered) {
        var moreButon = $("#more").last(),
            currentPage = moreButon.data('current-page'),
            totalPages = moreButon.data('total-pages');

        if(currentPage < totalPages){
            var offsetTop = moreButon.offset().top;
            // Get URL from the loadmore button
            var nextUrl = $(moreButon).attr("data-next-url");
            // Button position when AJAX call should be made one time
            if (offsetTop - $(window).scrollTop() < 800 && triggered == false) {
                // Trigger shortcircuit to ensure AJAX only fires once
                triggered = true;
                // Make ajax call to next page for load more data
                
                $.ajax({
                    url: nextUrl,
                    type: "GET",
                    beforeSend: function() {
                        moreButon.remove();
                    },
                }).done(function(data) {
                    // Append data
                    //console.log("data ", data)
                    $(".product-sec1").append(
                        $(data).find(".product-sec1").html()
                    );
                    // On success, reset shortcircuit
                    triggered = false;
                });
            }

        }
    }
}

$(document).ready(function() {
    $(window).scroll(function() {
        $('.loadmore').last().removeClass('hide')
        ScrollExecute();
        $('.loadmore').addClass('hide')
    });
});

function setSortBy(value) {
    let newUrl = updateQueryStringParameter(window.location.href, 'sort_by', value)
    window.location.href = newUrl
}

function clearfilter(type) {
    let url = new URL(window.location.href)
    let tempUrl  = window.location.href+ ''
    let newUrl = tempUrl.split('?')[0];
    let params = new URLSearchParams(url.search);
    params.delete(type);
    newUrl = new URL(newUrl+'?'+params)
    window.location.href = newUrl;
}
function changeView(key,value){
    let newUrl = updateQueryStringParameter(window.location.href, key, value)
    window.location.href = newUrl
}

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

$('.menu-collections').on('change',function(){
    window.location.href = '/collections/'+$(this).val()
})
//]]>