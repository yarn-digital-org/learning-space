// Put your application javascript here
//Shopify currency switcher start
$('.localization-form li a').on('click', ()=>   {
      $('#currency_code').val($(this).data('value'))
      $(this)
      .parents('form')
      .submit();
});
//Shopify currency switcher end
