var $lockMZUpdate = false,
    $firstImageIsVideo = false;

mzOptions = mzOptions || {};
mzOptions.onUpdate = function() {
    if (!$lockMZUpdate) {
        mtHighlightActiveSelector();
    }
    $lockMZUpdate = false;
};
var mtZoomIsReady = false;
mzOptions.onZoomReady = function(id) {
    mtZoomIsReady = true;
    if (!$firstImageIsVideo) {
        mtHighlightActiveSelector();
    }
}

function mtIfZoomReady(fnc) {
    if (!mtZoomIsReady) {
        setTimeout(function() {
            mtIfZoomReady(fnc);
        }, 250);
        return;
    }
    fnc();
}

function mtInitSelectors(selector) {
    jQuery(selector).on((mzOptions && mzOptions.selectorTrigger && mzOptions.selectorTrigger == 'hover') ? 'mouseover click touchend' : 'click touchend', function(e) {
        var el = jQuery(this);
        var $iframe = jQuery('.active-magic-slide iframe');
        if ($iframe.length == 1) {
            $iframe.attr('src', $iframe.attr('src').replace(/(.*)\?.*/gm, '$1'));
        }
        var $video = jQuery('.active-magic-slide video');
        if ($video.length == 1) {
            $video.get(0).pause();
        }
        jQuery('.MagicToolboxContainer .MagicToolboxSlide').removeClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSlide[data-slide-id="' + el.attr('data-slide-id') + '"]').addClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a').removeClass('active-magic-selector mz-thumb-selected');
        el.addClass('active-magic-selector mz-thumb-selected');
        if (el.attr('data-slide-id') == 'spin') {
            var resizeEvent = window.document.createEvent('UIEvents');
            resizeEvent.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(resizeEvent);
            if (typeof jQuery('.Sirv').attr('data-started') == 'undefined') {
                Sirv.start();
                jQuery('.Sirv').attr('data-started', 1)
            }
        }

        var $iframe = jQuery('.active-magic-slide iframe');
        if ($iframe.length) {
            var $s = $iframe.attr('data-video-options');
            $iframe.attr('src', $iframe.attr('src').replace(/(.*)\?.*/gm, '$1') + '?' + $s);
        }

        var $video = jQuery('.active-magic-slide video');
        if ($video.length == 1) {
            $video.get(0).play();
        }

        e.preventDefault();
    });
}

function mtInitVideoSelectors() {

    jQuery('.MagicToolboxSlides div[data-video-url]').each(function(index) {

        if (jQuery(this).data('processed')) return;

        var regex_youtube_short = /https?:\/\/youtu\.be\/([^\/]{1,})\/?/gm,
            regex_youtube_full = /https?:\/\/www\.youtube\.com\/watch\?v=(.*?)(&|$).*/gm,
        regex_youtube_embed = /https?:\/\/www\.youtube\.com\/(?:embed|shorts)\/(.{1,})/gm,
            regex_vimeo = /https?:\/\/vimeo\.com\/(.{1,})/gm,
            regex_sproutvideo = /https\:\/\/.*?\.vids\.io\/videos\/(.*?)\/.*/gm,
            regex_sproutvideo2 = /https\:\/\/sproutvideo\.com\/videos\/(.*?)\/*$/gm,
            regex_sproutvideo3 = /https:\/\/[a-z]{1,}.sproutvideo\.com\/embed\/(.*?)\/.*?$/gm,
            video_id, video_type;
        var $videoURL = jQuery(this).attr('data-video-url').replace(/https\:\/\/player\.vimeo\.com\/video\/([0-9]{1,})/gm, 'https://vimeo.com/$1');
        var m = regex_youtube_short.exec($videoURL);
        if (m) {
            video_id = m[1];
            video_type = 'youtube';
        } else {
            var m = regex_youtube_full.exec($videoURL);
            if (m) {
                video_id = m[1];
                video_type = 'youtube';
            } else {
                var m = regex_youtube_embed.exec($videoURL);
                if (m) {
                    video_id = m[1];
                    video_type = 'youtube';
                } else {
                    var m = regex_vimeo.exec($videoURL);
                    if (m) {
                        video_id = m[1];
                        video_type = 'vimeo';
                    } else {
                        var m = regex_sproutvideo.exec($videoURL);

                        if (m) {
                            video_id = m[1];
                            video_type = 'sproutvideo';
                        } else {
                            var m = regex_sproutvideo2.exec($videoURL);
                            if (m) {
                                video_id = m[1];
                                video_type = 'sproutvideo';

                            } else {
                                var m = regex_sproutvideo3.exec($videoURL);
                                if (m) {
                                    video_id = m[1];
                                    video_type = 'sproutvideo_embed';
                                }
                            }
                        }
                    }
                }
            }
        }
        if (video_type == 'youtube') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="https://www.youtube.com/embed/' + video_id + '" frameborder="0" allowfullscreen></iframe></div>');
        } else if (video_type == 'vimeo') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="https://player.vimeo.com/video/' + video_id + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>');
        } else if (video_type == 'sproutvideo') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>');

            jQuery.ajax({
                slide_id: jQuery(this).attr('data-slide-id'),
                video_url: $videoURL,
                url: 'https://sproutvideo.com/oembed.json?url=' + 'http://sproutvideo.com/videos/' + video_id,
                crossDomain: true,
                success: function(data, textStatus, jqXHR) {
                    jQuery('div[data-slide-id="' + this.slide_id + '"] .magic-video-container').html(data.html)
                    var $iframe = jQuery('div[data-slide-id="' + this.slide_id + '"] .magic-video-container').find('iframe');

                    var $s = 'autoPlay=true&volume=0&loop=true&background=true';

                    $iframe.attr('data-video-options', $s);

                    if ($iframe.closest('div').is(':visible') && $s != '') {
                        $iframe.attr('src', $iframe.attr('src') + '?' + $s);
                    }


                    jQuery('a[data-slide-id="' + this.slide_id + '"] img').attr('src', data.thumbnail_url).css('max-width', '100px').closest('a').show();
                },
            });

        } else if (video_type == 'sproutvideo_embed') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="' + $videoURL + '?autoPlay=true&volume=0&loop=true&background=true" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>');

            jQuery('a[data-slide-id="' + jQuery(this).attr('data-slide-id') + '"] img').closest('a').show();

        } else {
            jQuery('div[data-slide-id="' + jQuery(this).attr('data-slide-id') + '"],a[data-slide-id="' + jQuery(this).attr('data-slide-id') + '"]').remove();
        }
    })
}

function mtHighlightActiveSelector() {
    if (typeof jQuery == 'undefined') {
        return;
    }
    jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a').removeClass('active-magic-selector');
    jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a.mz-thumb-selected').addClass('active-magic-selector');

    var $s_item = jQuery('.active-magic-selector').closest('.mcs-item');
    if ($s_item.length) {
        MagicScroll.jump('msc-selectors-container', $s_item.data('item'));
    }

}

function mtGetMaxSizes() {
    var $maxWidth = $maxHeight = 1;
    jQuery('.MagicToolboxSelectorsContainer a > img').each(function() {
        var img = jQuery(this);
        if (img.is(':visible')) {
            $maxHeight = Math.max($maxHeight, img.height());
            $maxWidth = Math.max($maxWidth, img.width());
        }
    });
    return { 'width': $maxWidth, 'height': $maxHeight };
}

function SirvSKUTransform($sku) {
    if (typeof SirvSpinsPathTransform != 'undefined' && SirvSpinsPathTransform != '') {
        var re = new RegExp('^' + SirvSpinsPathTransform + '$', 'gmsi');
        return $sku.replace(re, '$1');
    }
    return $sku;
}


function mtInitSirv() {

    if (typeof(SirvID) == 'undefined' || SirvID == '') {
        //initMagicScroll();
        return;
    }

    SirvProductSKU = SirvProductSKU.replace(/\//gmi,'-')


    var spinURL = 'https://' + SirvID + '.sirv.com/' +
        SirvSpinsPath.replace(/{product\-id}/g, SirvProductID)
        .replace(/{product\-sku}/g, SirvProductSKU)
        .replace(/{vendor}/g, SirvProductVendor)
        .replace(/{product\-name}/g, SirvProductName);

    if (typeof SirvSpinOverrides != 'undefined' && typeof SirvSpinOverrides[SirvProductID + '-'] != 'undefined' && SirvSpinOverrides[SirvProductID + '-'] != '') {
        spinURL = 'https://' + SirvID + '.sirv.com' + SirvSpinOverrides[SirvProductID + '-'];
    }

    if (typeof SirvCache != 'undefined' && typeof SirvCache[spinURL.replace('https://' + SirvID + '.sirv.com/', '')] != 'undefined') {
        mtInitSirvIcon(spinURL);
    } else {
        if (SirvUseCache == 'Yes') {
            initMagicScroll();
        } else {
            jQuery.ajax({
                url: spinURL,
                type: 'HEAD',
                cache: true,
                timeout: 4000,
                error: function(jqXHR, textStatus, errorThrown) {
                    initMagicScroll();
                },
                success: function(data, textStatus, jqXHR) {
                    mtInitSirvIcon(spinURL);
                },
            });
        }
    }

    if (Object.keys(SirvVariants).length > 0) {
        for (var i in SirvVariants) {
            if (SirvVariantsSKU[i].sku == null) {
                SirvVariantsSKU[i].sku = '';
            }
            SirvVariantsSKU[i].sku = SirvVariantsSKU[i].sku.replace(/\//gmi,'-')
            var $sku = SirvSKUTransform(SirvVariantsSKU[i].sku);
            var v_spinURL = 'https://' + SirvID + '.sirv.com/' +
                ( (typeof SirvSpinsPath_v != 'undefined' && SirvSpinsPath_v != '') ? SirvSpinsPath_v : SirvSpinsPath )
                .replace(/{product\-id}/g, i)
                .replace(/{product\-sku}/g, (typeof SirvVariantsSKU[i].sku != 'undefined' && SirvVariantsSKU[i].sku != '' && SirvVariantsSKU[i].sku != null) ? $sku.replace('/', '') : i)
                .replace(/{vendor}/g, SirvProductVendor)
                .replace(/{product\-name}/g, SirvProductName)
              ;

            for(var $i = 1; $i <= 3; $i++) {
              v_spinURL = v_spinURL.replace( new RegExp('{option' + $i + '}', 'gi'), SirvVariantsSKU[i]['option' + $i] )
              if (typeof mt_product.options[$i-1] != 'undefined') {
                v_spinURL = v_spinURL.replace( new RegExp('{' + mt_product.options[$i-1] + '}', 'gi'), SirvVariantsSKU[i]['option' + $i] )
              }                
            }

          

            if (typeof SirvSpinOverrides != 'undefined' && typeof SirvSpinOverrides[SirvProductID + '-' + i] != 'undefined' && SirvSpinOverrides[SirvProductID + '-' + i] != '') {
                v_spinURL = 'https://' + SirvID + '.sirv.com' + SirvSpinOverrides[SirvProductID + '-' + i];
            }

            if (typeof SirvCache != 'undefined' && typeof SirvCache[v_spinURL.replace('https://' + SirvID + '.sirv.com/', '')] != 'undefined') {
                SirvVariants[i] = v_spinURL.replace(/\?callback.*/gm, '');
                if (i == currentVariantID) {
                    SirvSetActiveItem(SirvVariants[currentVariantID])
                    if (SirvSpinPosition == 'first') {
                        mtShowSirvVariant(currentVariantID)
                    } else {
                        mtInitSirvIcon(SirvVariants[i]);
                        var $h = (SirvMaxHeight > 0) ? '?h=' + SirvMaxHeight : '';
                        //jQuery('.Sirv div').attr('data-src', SirvVariants[i] + $h);
                    }
                    currentVariantID = 0;
                }
            } else {
                if (SirvUseCache == 'Yes') {
                    SirvVariants[i] = false;
                } else {
                    jQuery.ajax({
                        url: v_spinURL,
                        type: 'HEAD',
                        'cache': 'false',
                        timeout: 4000,
                        spinID: i,
                        error: function() { SirvVariants[this.spinID] = false; },
                        success: function(data) {
                            SirvVariants[this.spinID] = this.url.replace(/\?callback.*/gm, '');
                            if (this.spinID == currentVariantID) {
                                SirvSetActiveItem(SirvVariants[currentVariantID])
                                if (SirvSpinPosition == 'first') {
                                    mtShowSirvVariant(currentVariantID)
                                } else {
                                    mtInitSirvIcon(SirvVariants[this.spinID]);
                                    var $h = (SirvMaxHeight > 0) ? '?h=' + SirvMaxHeight : '';
                                    //jQuery('.Sirv div').attr('data-src', SirvVariants[this.spinID] + $h);
                                }
                                currentVariantID = 0;
                            }
                        }
                    });
                }
            }
        }
    }
}

function initMagicScroll() {
    if (jQuery('#msc-selectors-container').length) {
        MagicScroll.start();
    }
}

function mtInitArrows() {
    jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').on('click', function(e) {
        var $selectorsContainer = jQuery(this).closest('.MagicToolboxContainer').find('.MagicToolboxSelectorsContainer'),
            $currentSelector = $selectorsContainer.find('a.active-magic-selector'),
            $newSelector = false,
            $useScroll = jQuery('.MagicScroll').length,
            $forward = jQuery(this).hasClass('magic-next'),
            $mscItem, $mscCurItemId, $mscNewItemId;

        if ($useScroll) {
            $mscItem = $currentSelector.parent();
            $mscCurItemId = $mscItem.attr('data-item');
            $mscItem = $forward ? $mscItem.next() : $mscItem.prev();
            if (!$mscItem.length) {
                $mscItem = $selectorsContainer.find('div[data-item=' + $mscCurItemId + ']');
                $mscItem = $forward ? $mscItem.first().next() : $mscItem.last().prev();
                if (!$mscItem.length) {
                    //NOTE: carousel, cover-flow
                    $mscItem = $forward ? $selectorsContainer.find('.mcs-item:first') : $selectorsContainer.find('.mcs-item:last');
                    if (!$mscItem.length) {
                        e.preventDefault();
                        return;
                    }
                }
            }
            $newSelector = $mscItem.find('a');
            $mscNewItemId = $mscItem.attr('data-item');
            $mscNewItemId = parseInt($mscNewItemId, 10);
            MagicScroll.jump('msc-selectors-container', $mscNewItemId);
        } else {
            $newSelector = $forward ? $currentSelector.next('a') : $currentSelector.prev('a');
            if (!$newSelector.length) {
                $newSelector = $forward ? $selectorsContainer.find('a:first') : $selectorsContainer.find('a:last');
            }
        }

        if ($newSelector.length) {
            $newSelector.trigger('click');
            if ($newSelector.hasClass('mz-thumb')) {
                $lockMZUpdate = true;
                MagicZoom.switchTo(jQuery(this).closest('.MagicToolboxContainer').find('a.MagicZoomPlus').attr('id'), $newSelector[0]);
            }
        }
        e.preventDefault();
    });
}

function SirvSetActiveItem(spinURL) {

  spinURL = spinURL.replace(/[^a-zA-Z0-9]/gmi,'');

    var $instance = Sirv.viewer.getInstance('#sirv-spin');
    if ($instance && $instance.isReady() && $instance.items() != null && $instance.items().length) {
        for (var $i in $instance.items()) {
            $instance.disableItem($i * 1);
        }
        $instance.enableItem(spinURL);
    } else {
        jQuery('#sirv-spin [data-id]').attr('data-disabled', 'true');
        jQuery('[data-id="' + spinURL + '"]').removeAttr('data-disabled');
    }
    //Sirv.start();
}

function mtInitSirvIcon(spinURL) {

    if (jQuery('a[data-slide-id="spin"]').length) {
        return;
    }

    var $iconClass = '';

    if (SirvIconURL == 'gif-overlay' || SirvIconURL == 'giftwitch-overlay') {
        $iconClass = 'spin-overlay-icon';
    }

    if (SirvIconURL == 'gif' || SirvIconURL == 'gif-overlay') {
        SirvIconURL = spinURL + '?image'
    }
    if (SirvIconURL == 'giftwitch' || SirvIconURL == 'giftwitch-overlay') {
        SirvIconURL = spinURL + '?image.rules=R30L60R30&image.speed=1000&image.pause=3000'
    }

    $instance = Sirv.viewer.getInstance('#sirv-spin');

    SirvSetActiveItem(spinURL);


    jQuery('.MagicToolboxContainer').removeClass('no-thumbnails');
    jQuery('.MagicToolboxSelectorsContainer').show();

    jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').show();

    var sizes = mtGetMaxSizes();
    var iconHTML = ' <a class="' + $iconClass + '" data-slide-id="spin" href="#"><img alt="360 view" id="SirvIcon" style="display:none;" src="' + SirvIconURL + '"/></a>';

    if (jQuery('.MagicToolboxSelectorsContainer a').length == 0) {
        jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').hide();
        jQuery('.MagicToolboxSelectorsContainer').append(iconHTML);
    } else if (SirvSpinPosition == 'last') {
        jQuery('.MagicToolboxSelectorsContainer a:last').after(iconHTML);
    } else if (SirvSpinPosition == 'second') {
        jQuery('.MagicToolboxSelectorsContainer a:first').after(iconHTML);
    } else {
        jQuery('.MagicToolboxSelectorsContainer a:first').before(iconHTML);
    }

    if (jQuery('.MagicToolboxContainer').hasClass('layout-bottom')) {
        jQuery('#SirvIcon').css('height', sizes.height + 'px').show();
    } else {
        jQuery('#SirvIcon').css('width', sizes.width + 'px').show();
    }

    mtInitSelectors('.MagicToolboxSelectorsContainer a[data-slide-id="spin"]');

    if (SirvSpinPosition == 'first') {
        if (SirvVariants[currentVariantID]) {
            mtShowSirvVariant(currentVariantID);
            currentVariantID = 0;
        } else {
            jQuery('.MagicToolboxSelectorsContainer a[data-slide-id="spin"]').trigger('click');
        }
    }

    if (jQuery('.MagicToolboxSelectorsContainer a').length == 0) {
        jQuery('.MagicToolboxContainer').addClass('no-thumbnails');
        jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow, .MagicToolboxSelectorsContainer').hide();
        jQuery('div[data-slide-id="zoom"]').removeClass('active-magic-slide');
        jQuery('div[data-slide-id="spin"]').addClass('active-magic-slide');
        Sirv.start();

    }

    initMagicScroll();
}

function mtShowSirvVariant(variant_id) {

  

    if (jQuery('#SirvIcon').length == 0) {
        var $useScroll = jQuery('#msc-selectors-container').length;
        if ($useScroll) {
            MagicScroll.stop();
        }
        mtInitSirvIcon(SirvVariants[variant_id]);
    }

    var $h = (SirvMaxHeight > 0) ? '?h=' + SirvMaxHeight : '';

    var $instance = Sirv.viewer.getInstance('#sirv-spin'),
        spinURL = SirvVariants[variant_id];

    SirvSetActiveItem(SirvVariants[variant_id])

    if (SirvIconURL_ == 'gif' || SirvIconURL_ == 'gif-overlay') {
        SirvIconURL = spinURL + '?image'
    }
    if (SirvIconURL_ == 'giftwitch' || SirvIconURL_ == 'giftwitch-overlay') {
        SirvIconURL = spinURL + '?image.rules=R30L60R30&image.speed=1000&image.pause=3000'
    }
    jQuery('a[data-slide-id="spin"] img').attr('src', SirvIconURL)


    if (SirvSpinPosition == 'first') {
        jQuery('a[data-slide-id="spin"]').trigger('click');
    } else {
        jQuery('a.mz-thumb-selected').trigger('click')
    }
}

function mtSwitchImage(largeImage, smallImage) {
    var activeSlide = jQuery('.MagicToolboxContainer .active-magic-slide');
    if (activeSlide.attr('data-slide-id') == 'spin') {
        activeSlide.removeClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSlide[data-slide-id="zoom"]').addClass('active-magic-slide');
    }
    if (jQuery('.mz-lens').length == 0) {
        mtHighlightActiveSelector();
        jQuery('a.MagicZoomPlus').attr('href', largeImage)
        jQuery('a.MagicZoomPlus img').first().attr('src', smallImage);
    } else {
        MagicZoom.update(jQuery('a.MagicZoomPlus').attr('id'), largeImage, smallImage);
    }
}

window['MagicjQueryTries'] = 0;

function mtOnDomReady(fnc) {
    if (typeof(jQuery) == 'undefined') {
        window['MagicjQueryTries']++;
        if (window['MagicjQueryTries'] == 10) {
            var mt_jq = document.createElement('script');
            mt_jq.type = 'text/javascript';
            mt_jq.async = false;
            mt_jq.src = 'https://code.jquery.com/jquery-2.2.4.min.js';
            document.getElementsByTagName('script')[0].parentNode.appendChild(mt_jq);
        }
        setTimeout(function() {
            mtOnDomReady(fnc);
        }, 250);
        return;
    }
    jQuery(document).ready(fnc);
}


function mtGetParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function mtGetVariantId() {
    // Try to get variant from URL
    var variantId = mtGetParameterByName('variant');
    // If not get variants on product object
    if (!variantId && typeof mt_product != 'undefined' && mt_product.variants && mt_product.variants.length > 0) {
        for (var i = 0; i < mt_product.variants.length; i++) {
            if (mt_product.variants[i].available) {
                variantId = mt_product.variants[i].id;
                break;
            }
        }
    }
    return variantId;
}

function updateMZPGallery($id) {
    var $s = jQuery('a[data-variants*="' + $id + '"]');
    if ($s.length) {
        $s.show();
        $s.prevAll().hide();
        var $hide = false;
        $s.nextAll().each(function() {
            if (jQuery(this).attr('data-variants') != ',') {
                $hide = true;
            }
            if ($hide) {
                jQuery(this).hide();
            } else {
                jQuery(this).show();
            }
        })
        jQuery('a[data-slide-id="spin"]').show();
    }
}

function initmzp() {
    if (jQuery('#admin_bar_iframe').length) {
        jQuery(document.body).append(
            '<style type="text/css">.mz-zoom-window { margin-top: -' + jQuery('#admin_bar_iframe').height() + 'px; </style>'
        );
    }

    window['SirvIconURL_'] = (typeof SirvIconURL != 'undefined')?SirvIconURL:'';

    mtInitVideoSelectors('.MagicToolboxSelectorsContainer a');

    mtInitSelectors('.MagicToolboxSelectorsContainer a');

    var $firstVideoSelector = jQuery('[data-slide-num="0"][data-video-url]');
    if ($firstVideoSelector.length) {
        jQuery('a[data-slide-id="' + $firstVideoSelector.attr('data-slide-id') + '"]').trigger('click');
        $firstImageIsVideo = true;
    }

    mtInitSirv();

    mtInitArrows();

    jQuery('form[action*="/cart/add"]').on('change', function() {
        setTimeout(function() {
            var $id = mtGetVariantId();
            //updateMZPGallery($id)

            if (typeof currentVariantID == 'undefined' || $id == currentVariantID) return;
            currentVariantID = $id;

            var $s = jQuery('a[data-variants*="' + $id + '"]');
            if (typeof MagicZoom != 'undefined' && $s.length) {
                MagicZoom.update(
                    $s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'),
                    $s.attr('href'),
                    $s.attr('data-image')
                )
            }

            if (typeof SirvVariants != 'undefined' && typeof SirvVariants[$id] != 'undefined' && typeof SirvVariants[$id] == 'string') {
                mtShowSirvVariant($id);
            } else {
                $s.trigger('click')
            }
        }, 500)
    })

}

mtOnDomReady(function() {
    initmzp();
});