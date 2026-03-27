function addtocart(id, qty, is_text_free = false,ex_price=0,is_vat_relief = false,personalized='') {
    ex_price = Number(ex_price / 100).toFixed(2)

      var propertiesObj = new Object();
      if(is_text_free){
        propertiesObj.tax_free = is_text_free;
      }
       
      if(ex_price){
      // propertiesObj.ex_price = ex_price
      }
       if(is_vat_relief){
       propertiesObj.is_vat_relief = is_vat_relief
      }
      if(personalized){
         propertiesObj.personalized = personalized
      }
    fetch(`/cart/add.js`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ id: id, quantity: qty, properties:propertiesObj}] })
        }).then((response) => {

            return response.json();
        })
        .then((response) => {
            if (!response.status) {
               window.gulshanCart = items;
                  toastr.success('Product added to cart', { position: 'right-top' });
                  window.addedtocart = true
                  getCart()
                return false;
               
            } else {
              // window.scroll({
              //    top: 0, 
              //    left: 0, 
              //    behavior: 'smooth' 
              //   });
                toastr.error(response.description, { position: 'right-top' });
            }
        })
        .catch((error) => {
          toastr.error(error.description, { position: 'right-top' });
        });
}

function updatecart(variant_id, qty) {
    var cartRes = jQuery.post(window.Shopify.routes.root + 'cart/update.js', {
        updates: {
            [variant_id]: parseInt(qty),
        }
    });
    
    cartRes.always(function() {
        //$.toastr.success('Cart Updated', { position: 'right-bottom' });
        window.location.reload()
    });
}

function getCart() {
    jQuery.getJSON(`/cart.js`, function(cart, textStatus) {
        $('.cart-item-count').html(cart.item_count)
        var currency = $('#mini-cart-total-price').attr('data-currency')
        $('#mini-cart-total-price').html(currency+' '+(cart.total_price / 100).toFixed(2))
        $('#mini-cart-total-price-pop').html(currency+' '+(cart.total_price / 100).toFixed(2))
        let excTaxPrice = cart.total_price / 1.20
        $('#mini-cart-total-inc-price').html(currency+' '+(excTaxPrice / 100).toFixed(2))
        $('#mini-cart-total-inc-price-pop').html(currency+' '+(excTaxPrice / 100).toFixed(2))

          
        if(cart.item_count > 0){
            let cartItems = '';
            cart.items.forEach(item => {
         
                let tax_fee = window.gulshanCart ? window.gulshanCart.filter((meta)=>{ return item.handle === meta.handle }) : []
                let excItemTaxPrice = item.properties.ex_price ? item.properties.ex_price :  item.final_price / 1.20
                let excItemClass = '';
                let excItemLabel = 'incl. VAT';
                if(!item.properties.tax_free){
                  item.properties.tax_free = (tax_fee.length > 0 && tax_fee[0].is_tax_free) ? tax_fee[0].is_tax_free : false
                }
                // console.log(item.handle+'==item.properties.tax_free ==' + item.properties.tax_free )
                if(item.properties.tax_free == 'true'){
                   excItemTaxPrice = item.final_price 
                   excItemClass = 'style="visibility:hidden"'
                   excItemLabel = 'No. VAT';
                }
                exItemPrice = currency+' '+(excItemTaxPrice / 100).toFixed(2)
                cartItems += `<div class="row header-cart cart-contant p-3">
                <div class="col-4">` 
                if(item.image){
                    cartItems +=`<img class="img-thumbnail" src="`+item.image+`">`
                }else{
                    cartItems +=`<img class="img-thumbnail" src="https://cdn.shopify.com/s/files/1/0649/0688/7411/files/no-image.png?v=1663069484">`
                }
               
                
                cartItems +=`</div>
                <div class="col-8 text-start">`;
               if( item.gift_card){
                 var incItemPrice = currency+' '+(item.final_price / 100).toFixed(2) 
                 cartItems +=`<b class="inc-vat-price">`+incItemPrice+`</b>` 
               }else{
                 if(item.properties.is_vat_relief == 'true' || item.properties.is_vat_relief == true || (item.variant_title && item.variant_title.includes('VAT Exempt'))){
                   var exitemPrice = (item.final_price / 100)
                   var incPrice = (exitemPrice * 1.20)
                    cartItems +=`<b class="inc-vat-price">`+currency+' '+Number(incPrice).toFixed(2)+` `+excItemLabel+` </b> 
                    <b class="ex-vat-price"> / `+currency+' '+Number(exitemPrice).toFixed(2)+` excl. VAT </b>` 
                 }else{
                    var incItemPrice = currency+' '+(item.final_price / 100).toFixed(2)       
                    cartItems +=`<b class="inc-vat-price">`+incItemPrice+` `+excItemLabel+` </b> 
                    <b class="ex-vat-price" `+excItemClass+`> / `+exItemPrice+` excl. VAT </b>` 
                 }
                
               }
                
              
                cartItems +=`<p>`+item.title+`</p>
                <p class="justify-content-sm-between">`
                    if(Object.keys(item.options_with_values).length > 0 && item.variant_title != null){
                     
                        item.options_with_values.forEach(item => {
                            if(item.name != 'denominations'){
                              cartItems +=`<span>`+item.name+`</span>`
                          
                              cartItems +=`<span>`+item.value+`</span>`
                            }
                        });
                    }
                    
                cartItems +=`
                </p>
                <p><span>Qty(s): `+item.quantity+`</span></p>
                </div>
            </div>`;
            });
            document.getElementById('cartitems-js').innerHTML = cartItems
        }else{
          document.getElementById('cartitems-js').innerHTML = '<div class="alert alert-warning text-center mt-2">Cart is empty</div>'
        }
    });
}
$('.coupon-code').on('click',function(){
    if($('#discount_td').hasClass('hide')){
        $('#discount_td').removeClass('hide')
    }else{
        $('#discount_td').addClass('hide')
    }
    
})
function showPopUpCart(){
		  $("#show_cart").hide();
	  $(".cart_toggle").click(function(){
		$("#show_cart").toggle();
	  });
}
getCart()
showPopUpCart()