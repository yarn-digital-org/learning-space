
/**
 * Module to add a shipping rates calculator to cart page.
 *
 * Copyright (c) 2011-2016 Caroline Schnapp (11heavens.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Modified by David Little, 2016
 */

 "object"==typeof Countries&&(Countries.updateProvinceLabel=function(e,t){if("string"==typeof e&&Countries[e]&&Countries[e].provinces){if("object"!=typeof t&&(t=document.getElementById("address_province_label"),null===t))return;t.innerHTML=Countries[e].label;var r=jQuery(t).parent();r.find("select");r.find(".custom-style-select-box-inner").html(Countries[e].provinces[0])}}),"undefined"==typeof Shopify.Cart&&(Shopify.Cart={}),Shopify.Cart.ShippingCalculator=function(){var _config={submitButton:"Calculate shipping",submitButtonDisabled:"Calculating...",templateId:"shipping-calculator-response-template",wrapperId:"wrapper-response",customerIsLoggedIn:!1,moneyFormat:"${{amount}}"},_render=function(e){var t=jQuery("#"+_config.templateId),r=jQuery("#"+_config.wrapperId);if(t.length&&r.length){var templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var n=Handlebars.compile(jQuery.trim(t.text())),a=n(e);if(jQuery(a).appendTo(r),"undefined"!=typeof Currency&&"function"==typeof Currency.convertAll){var i="";jQuery("[name=currencies]").size()?i=jQuery("[name=currencies]").val():jQuery("#currencies span.selected").size()&&(i=jQuery("#currencies span.selected").attr("data-currency")),""!==i&&Currency.convertAll(shopCurrency,i,"#wrapper-response span.money, #estimated-shipping span.money")}}},_enableButtons=function(){jQuery(".get-rates").removeAttr("disabled").removeClass("disabled").val(_config.submitButton)},_disableButtons=function(){jQuery(".get-rates").val(_config.submitButtonDisabled).attr("disabled","disabled").addClass("disabled")},_getCartShippingRatesForDestination=function(e){var t={type:"POST",url:"/cart/prepare_shipping_rates",data:jQuery.param({shipping_address:e}),success:_pollForCartShippingRatesForDestination(e),error:_onError};jQuery.ajax(t)},_pollForCartShippingRatesForDestination=function(e){var t=function(){jQuery.ajax("/cart/async_shipping_rates",{dataType:"json",success:function(r,n,a){200===a.status?_onCartShippingRatesUpdate(r.shipping_rates,e):setTimeout(t,500)},error:_onError})};return t},_fullMessagesFromErrors=function(e){var t=[];return jQuery.each(e,function(e,r){jQuery.each(r,function(r,n){t.push(e+" "+n)})}),t},_onError=function(XMLHttpRequest,textStatus){jQuery("#estimated-shipping").hide(),jQuery("#estimated-shipping em").empty(),_enableButtons();var feedback="",data=eval("("+XMLHttpRequest.responseText+")");feedback=data.message?data.message+"("+data.status+"): "+data.description:"Error : "+_fullMessagesFromErrors(data).join("; ")+".","Error : country is not supported."===feedback&&(feedback="We do not ship to this destination."),_render({rates:[],errorFeedback:feedback,success:!1}),jQuery("#"+_config.wrapperId).show()},_onCartShippingRatesUpdate=function(e,t){_enableButtons();var r="";if(t.zip&&(r+=t.zip+", "),t.province&&(r+=t.province+", "),r+=t.country,e.length){"0.00"==e[0].price?jQuery("#estimated-shipping em").html("FREE"):jQuery("#estimated-shipping em").html(_formatRate(e[0].price));for(var n=0;n<e.length;n++)e[n].price=_formatRate(e[n].price)}_render({rates:e,address:r,success:!0}),jQuery("#"+_config.wrapperId+", #estimated-shipping").fadeIn()},_formatRate=function(e){function t(e,t){return"undefined"==typeof e?t:e}function r(e,r,n,a){if(r=t(r,2),n=t(n,","),a=t(a,"."),isNaN(e)||null==e)return 0;e=(e/100).toFixed(r);var i=e.split("."),o=i[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+n),s=i[1]?a+i[1]:"";return o+s}if("function"==typeof Shopify.formatMoney)return Shopify.formatMoney(e,_config.moneyFormat);"string"==typeof e&&(e=e.replace(".",""));var n="",a=/\{\{\s*(\w+)\s*\}\}/,i=_config.moneyFormat;switch(i.match(a)[1]){case"amount":n=r(e,2);break;case"amount_no_decimals":n=r(e,0);break;case"amount_with_comma_separator":n=r(e,2,".",",");break;case"amount_no_decimals_with_comma_separator":n=r(e,0,".",",")}return i.replace(a,n)};return _init=function(){new Shopify.CountryProvinceSelector("address_country","address_province",{hideElement:"address_province_container"});var e=jQuery("#address_country"),t=jQuery("#address_province_label").get(0);"undefined"!=typeof Countries&&(Countries.updateProvinceLabel(e.val(),t),e.change(function(){Countries.updateProvinceLabel(e.val(),t)})),jQuery(".get-rates").click(function(){_disableButtons(),jQuery("#"+_config.wrapperId).empty().hide();var e={};e.zip=jQuery("#address_zip").val()||"",e.country=jQuery("#address_country").val()||"",e.province=jQuery("#address_province").val()||"",_getCartShippingRatesForDestination(e)}),_config.customerIsLoggedIn&&jQuery(".get-rates:eq(0)").trigger("click")},{show:function(e){e=e||{},jQuery.extend(_config,e),jQuery(function(){_init()})},getConfig:function(){return _config},formatRate:function(e){return _formatRate(e)}}}();
 var _config = {
     moneyFormat: '{{amount}}'
 };  

 
 /*Format Currency */
 
   var _formatRate = function(cents) {
 
     if (typeof Shopify.formatMoney === 'function') {
     
       return Shopify.formatMoney(cents, _config.moneyFormat);
     }    
     if (typeof cents == 'string') { cents = cents.replace('.',''); }
     
     var value = '';
     var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
     var formatString = _config.moneyFormat;
 
     function defaultOption(opt, def) {
        return (typeof opt == 'undefined' ? def : opt);
     }
 
     function formatWithDelimiters(number, precision, thousands, decimal) {
       precision = defaultOption(precision, 2);
       thousands = defaultOption(thousands, ',');
       decimal   = defaultOption(decimal, '.');
       if (isNaN(number) || number == null) { return 0; }
       number = (number).toFixed(precision);
       var parts   = number.split('.'),
           dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
           cents   = parts[1] ? (decimal + parts[1]) : 0;
         
           let ex_price = document.getElementById('cart_total_ex').getAttribute('data-rate')
           let inc_price = document.getElementById('cart_total_inc').getAttribute('data-rate')
           let currencyCode = document.getElementById('cart_total_inc').getAttribute('data-currency')
        
           ex_price = Number(ex_price).toFixed(2)
       
           if(currencyCode == '€'){
            ex_price =  Number(ex_price.replace(' ', '').replace(',', '').replace('.', ''));
            inc_price = Number(inc_price.replace(' ', '').replace(',', '').replace('.', ''));
            ex_price =(ex_price / 100).toFixed(2)
            ex_price = Number(+ ex_price + Number(dollars + cents)).toFixed(2)
            inc_price = Number(+ inc_price + Number(dollars + cents)).toFixed(2)
              
           } else {
              ex_price = Number(ex_price.replace(' ', '').replace(',', '').replace('.', '')).toFixed(2)
              ex_price =(ex_price / 100).toFixed(2)
              ex_price = ( + ex_price + Number(dollars + cents))
              inc_price = ( + inc_price + Number(dollars + cents)) 
           }
          
          
            
            let shippingRate = Number(dollars + cents).toFixed(2)
            if(currencyCode == '€'){
                inc_price = inc_price
                shippingRate = shippingRate
            }
            if(typeof ex_price === 'number'){
               ex_price = (ex_price).toFixed(2)
            }else{
               ex_price = number(ex_price).toFixed(2)
            }
            document.getElementById('cart_total_ex').innerHTML = '<b>'+currencyCode + ex_price +'</b>'
            document.getElementById('cart_total_inc').innerHTML = '<b>'+ currencyCode + inc_price +'</b>'
         
            return '<b>'+ shippingRate +'</b>';
   }

   switch(formatString.match(placeholderRegex)[1]) {
       case 'amount':
         value = formatWithDelimiters(cents, 2);
         break;
       case 'amount_no_decimals':
         value = formatWithDelimiters(cents, 0);
         break;
       case 'amount_with_comma_separator':
         value = formatWithDelimiters(cents, 2, '.', ',');
         break;
       case 'amount_no_decimals_with_comma_separator':
         value = formatWithDelimiters(cents, 0, '.', ',');
         break;
     }
     
     return formatString.replace(placeholderRegex, value);
   };
 
 
 
 if (typeof Countries === 'object') {
   Countries.updateProvinceLabel = function(country, provinceLabelElement) {
     jQuery("#address_province").html("")
     if (typeof country === 'string' && Countries[country] && Countries[country].provinces) {
       
         if (typeof provinceLabelElement !== 'object') {
             provinceLabelElement = document.getElementById('address_province_label');
                 if (provinceLabelElement === null) return;
         }
         
         const selectProvince = document.getElementById('address_province')
         const selectValues = Countries[country].province_codes;

         //$("#address_province option[value='British Forces']").remove();
         
         $("#address_province").append(
             $.map(selectValues, function(v,k){
                 return $("<option>").val(k).text(k);
             })
         );
    
     }
   };
 }
 
 
 /*
     Get Province or State based on country selection
 */
 jQuery('#address_country').change(countryChange);



 function countryChange() {
 
    var countriesSelect = jQuery('#address_country');
    var addressProvinceLabelEl = jQuery('#address_province_label').get(0);
    //alert(JSON.stringify(Countries))
    if (typeof Countries !== 'undefined') {
      
        countriesSelect = jQuery('#address_country');
        
        Countries.updateProvinceLabel(countriesSelect.val(), addressProvinceLabelEl);
        
        countriesSelect.change(function() {
            
            Countries.updateProvinceLabel(countriesSelect.val(), addressProvinceLabelEl);
          //setProvinceLabel()
        });
    }
}
function setProvinceLabel() {
      
      let countrySelect = document.querySelector('#address_country');
      let countryVal = countrySelect.options[countrySelect.selectedIndex].value;
      let label = document.querySelector("label[for='address_province']");
      if (countryVal === 'United Kingdom') {
        label.innerHTML = 'County';
        //$("#address_province option[value='British Forces']").remove();
      } else {
        label.innerHTML = 'Province';
      }
  }  
 /*
   Prepare all error messages as array
 */
 var _fullMessagesFromErrors = function(errors) {
     var fullMessages = [];
     jQuery.each(errors, function(attribute, messages) {
         jQuery.each(messages, function(index, message) {
             fullMessages.push(attribute + ' ' + message);
         });
     });
     return fullMessages;
 };
 
 /*
 *
  IF Error Occurs
 */
 
 var _onError = function(XMLHttpRequest, textStatus) {
     var feedback = '';
     var data = eval('(' + XMLHttpRequest.responseText + ')');
     if (!!data.message) {
         feedback = data.message + '(' + data.status + '): ' + data.description;
     } else {
         feedback = 'Error : ' + _fullMessagesFromErrors(data).join('; ') + '.';
     }

     _formatRate(0)
     jQuery('#shipping_calculate_error').show();
     jQuery('#shipping_calculate_error').html(feedback);
 
     jQuery('#estimated-shipping-currency').hide();
     jQuery('#estimated-shipping').html('');
 };
 
 
 /*
   Helps in display shipping rates
 */
 var _onCartShippingRatesUpdate = function(rates, shipping_address) {
     var readable_address = '';
 
     if (shipping_address.zip) readable_address += shipping_address.zip + ', ';
     if (shipping_address.province) readable_address += shipping_address.province + ', ';
     readable_address += shipping_address.country;
 
     if (rates.length) {
         if (rates[0].price == '0.00') {
             jQuery('#estimated-shipping-currency').hide();
             jQuery('#estimated-shipping').html('<span style="color: #01AD1C;">FREE</span>');
             let currencyCode = document.getElementById('cart_total_inc').getAttribute('data-currency')
             let ex_price = document.getElementById('cart_total_ex').getAttribute('data-rate')
             document.getElementById('cart_total_ex').innerHTML = '<b>'+currencyCode + ex_price +'</b>'
         } else {
             jQuery('#estimated-shipping-currency').show();
             jQuery('#estimated-shipping').html(_formatRate(parseFloat(rates[0].price)));
             for (var i = 0; i < rates.length; i++) {
                 rates[i].price = _formatRate(parseFloat(rates[i].price));
             }
         }
         
     } else {
          jQuery('#estimated-shipping-currency').hide();
          let ex_price = document.getElementById('cart_total_ex').getAttribute('data-rate')
          let inc_price = document.getElementById('cart_total_inc').getAttribute('data-rate')
          let currencyCode = document.getElementById('cart_total_inc').getAttribute('data-currency')
       
          
       
          document.getElementById('cart_total_ex').innerHTML = "<b>"+currencyCode +""+ parseFloat(ex_price) +"</b>"
          document.getElementById('cart_total_inc').innerHTML = "<b>"+ currencyCode +""+ parseFloat(inc_price) +"</b>"
          jQuery('#estimated-shipping').html('<span style="color: #01AD1C;">N/A</span>');
     }
 
     jQuery('#estimated-shipping').fadeIn();
 
 };
 
 var _pollForCartShippingRatesForDestination = function(shippingAddress) {
     //let hits = 0
     //console.log('hits', hits)
     //if(hits === 0) {
       var poller = function() {
           jQuery.ajax('/cart/async_shipping_rates', {
               dataType: 'json',
               success: function(response, textStatus, xhr) {
                   if (xhr.status === 200) {
                       _onCartShippingRatesUpdate(response.shipping_rates, shippingAddress)
                   } else {
                       setTimeout(poller, 500)
                   }
               },
               error: _onError
           })
       }
       return poller;
     //} 
     //hits += 1
 };
 
 
 var _getCartShippingRatesForDestination = function(shippingAddress) {
   
     var params = {
         type: 'POST',
         url: '/cart/prepare_shipping_rates',
         data: jQuery.param({ 'shipping_address': shippingAddress }),
         success: _pollForCartShippingRatesForDestination(shippingAddress),
         error: _onError
     }
     
     jQuery.ajax(params);
     
 };
 
 
 jQuery('#calc_shipping_btn').click(calculatate);
 
 function calculatate() {
    var shippingAddress = {};    

    jQuery('#shipping_calculate_error').hide();
    jQuery('#shipping_calculate_error').empty();

    /*shippingAddress.zip = BT35 8QB; 
    shippingAddress.country = 'United Kingdom';
    shippingAddress.province = 'Northern Ireland';*/

    shippingAddress.zip = jQuery('#address_zip').val() || ''; 
    shippingAddress.country = jQuery('#address_country').val() || '';
    shippingAddress.province = jQuery('#address_province').val() || '';

    _getCartShippingRatesForDestination(shippingAddress);
      
}

//if(__st.cid){
    var countriesSelect = jQuery('#address_country');
    if(Object.keys(countriesSelect).length !== 0){
      countriesSelect.val(countriesSelect.attr('data-default')).change();
      countryChange();
      //setProvinceLabel() 
      calculatate();
    }
    
//}