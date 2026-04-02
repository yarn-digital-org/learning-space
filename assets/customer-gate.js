/**
 * Learning Space - Customer Gate Logic
 *
 * Manages the Organisation/Individual customer type selection:
 * - Logged-in users: reads/writes customer metafield (custom.customer_type)
 * - Anonymous users: reads/writes a 30-day cookie
 * - Controls gate page visibility on homepage
 * - Swaps navigation menus based on customer type
 * - Provides switch functionality in nav and footer
 */

(function () {
  'use strict';

  var COOKIE_NAME = 'ls_customer_type';
  var COOKIE_DAYS = 30;
  var VALID_TYPES = ['organisation', 'individual'];

  // ---- Cookie helpers ----

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
  }

  // ---- Metafield update for logged-in users ----

  function saveCustomerMetafield(type) {
    // Uses Shopify's customer account AJAX endpoint to update metafield
    // This requires the metafield namespace/key to be defined in Shopify admin:
    // namespace: custom, key: customer_type, type: single_line_text_field
    if (!window.__LS_GATE || !window.__LS_GATE.isLoggedIn) return;

    fetch('/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'customer[metafields][custom][customer_type]': type,
        'form_type': 'customer',
        'utf8': '\u2713'
      })
    }).catch(function () {
      // Silently fail — the cookie is the fallback
    });
  }

  // ---- Detect current customer type ----

  function getCustomerType() {
    // Priority: 1) Logged-in customer metafield, 2) Cookie
    if (window.__LS_GATE && window.__LS_GATE.customerType) {
      var metaType = window.__LS_GATE.customerType.toLowerCase().trim();
      if (VALID_TYPES.indexOf(metaType) !== -1) {
        // Also sync cookie so JS-dependent features work consistently
        setCookie(COOKIE_NAME, metaType, COOKIE_DAYS);
        return metaType;
      }
    }
    var cookieType = getCookie(COOKIE_NAME);
    if (cookieType && VALID_TYPES.indexOf(cookieType) !== -1) {
      return cookieType;
    }
    return null;
  }

  // ---- Menu switching ----

  function activateMenu(type) {
    var orgMenu = document.getElementById('organisation_menu');
    var indMenu = document.getElementById('individual_menu');
    var parentMenu = document.getElementById('parent_menu');

    // Hide the default parent menu
    if (parentMenu) parentMenu.classList.add('hide');

    if (type === 'organisation') {
      if (orgMenu) orgMenu.classList.remove('hide');
      if (indMenu) indMenu.classList.add('hide');
    } else if (type === 'individual') {
      if (indMenu) indMenu.classList.remove('hide');
      if (orgMenu) orgMenu.classList.add('hide');
    }

    // Show/hide typed homepage sections (sliders, featured products, etc.)
    activateTypedSections(type);
  }

  function showDefaultMenu() {
    var parentMenu = document.getElementById('parent_menu');
    var orgMenu = document.getElementById('organisation_menu');
    var indMenu = document.getElementById('individual_menu');

    if (parentMenu) parentMenu.classList.remove('hide');
    if (orgMenu) orgMenu.classList.add('hide');
    if (indMenu) indMenu.classList.add('hide');
    showAllTypedSections();
  }

  // ---- Typed section show/hide ----
  // Sections with data-customer-type="organisation" or "individual"
  // are shown/hidden based on the active customer type.

  function activateTypedSections(type) {
    var allTyped = document.querySelectorAll('[data-customer-type]');
    for (var i = 0; i < allTyped.length; i++) {
      var el = allTyped[i];
      var sectionType = el.getAttribute('data-customer-type');
      var wrapper = el.closest('.shopify-section') || el;

      if (sectionType === type) {
        // Show matching typed section
        wrapper.style.display = '';
      } else if (sectionType === 'default') {
        // Hide the default section when a specific type is active
        wrapper.style.display = 'none';
      } else {
        // Hide the other type's section
        wrapper.style.display = 'none';
      }
    }
  }

  function showAllTypedSections() {
    var allTyped = document.querySelectorAll('[data-customer-type]');
    for (var i = 0; i < allTyped.length; i++) {
      var el = allTyped[i];
      var sectionType = el.getAttribute('data-customer-type');
      var wrapper = el.closest('.shopify-section') || el;

      if (sectionType === 'default') {
        // Show default sections when no type is selected
        wrapper.style.display = '';
      } else {
        // Hide typed sections when resetting
        wrapper.style.display = 'none';
      }
    }
  }

  // ---- Gate page visibility ----

  // Keywords in section IDs to keep visible when the gate is showing
  var KEEP_KEYWORDS = ['gate-page', 'apps', 'newsletters'];

  function shouldKeepSection(id) {
    if (!id) return false;
    for (var i = 0; i < KEEP_KEYWORDS.length; i++) {
      if (id.indexOf(KEEP_KEYWORDS[i]) !== -1) return true;
    }
    return false;
  }

  function hideHomepageSections() {
    var main = document.querySelector('main[role="main"]') || document.querySelector('main');
    if (!main) return;
    // Hide all direct children of main that aren't whitelisted
    var children = main.children;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      var id = el.id || '';
      if (!shouldKeepSection(id) && id.indexOf('gate-page-section') === -1) {
        el.classList.add('gate-hidden');
      }
    }
  }

  function showHomepageSections() {
    var hidden = document.querySelectorAll('.gate-hidden');
    for (var i = 0; i < hidden.length; i++) {
      hidden[i].classList.remove('gate-hidden');
    }
  }

  function showGatePage() {
    var gateSection = document.getElementById('gate-page-section');
    if (gateSection) {
      gateSection.classList.remove('gate-dismissed');
      document.body.classList.add('gate-page-visible');
      hideHomepageSections();
    }
  }

  function hideGatePage() {
    var gateSection = document.getElementById('gate-page-section');
    if (gateSection) {
      gateSection.classList.add('gate-dismissed');
      document.body.classList.remove('gate-page-visible');
      showHomepageSections();
    }
  }

  // ---- Header browse toggle + footer switch ----

  function updateBrowseToggle(type) {
    var orgPill = document.getElementById('browse-pill-org');
    var indPill = document.getElementById('browse-pill-ind');

    if (orgPill) {
      orgPill.classList.toggle('active', type === 'organisation');
    }
    if (indPill) {
      indPill.classList.toggle('active', type === 'individual');
    }
  }

  function updateSwitchUI(type) {
    // Header browse toggle
    updateBrowseToggle(type);

    // Footer link
    var footerSwitch = document.getElementById('gate-switch-footer');
    if (footerSwitch) {
      footerSwitch.classList.add('active');
      var otherType = type === 'organisation' ? 'Individual' : 'Organisation';
      footerSwitch.innerHTML = 'Currently browsing as <strong>' + (type === 'organisation' ? 'Organisation' : 'Individual') + '</strong>. <a href="#" class="gate-switch-link" onclick="LearningSpaceGate.switchType(); return false;">Switch to ' + otherType + '</a>';
    }
  }

  function hideSwitchUI() {
    var footerSwitch = document.getElementById('gate-switch-footer');
    if (footerSwitch) footerSwitch.classList.remove('active');
    updateBrowseToggle(null);
  }

  // ---- Public API (used by gate-page.liquid onclick handlers) ----

  var chosen = null;

  window.LearningSpaceGate = {
    pick: function (type) {
      if (VALID_TYPES.indexOf(type) === -1) return;
      chosen = type;

      var cardOrg = document.getElementById('gate-card-org');
      var cardInd = document.getElementById('gate-card-ind');
      var ctaBtn = document.getElementById('gate-cta-btn');

      if (cardOrg) cardOrg.classList.toggle('active', type === 'organisation');
      if (cardInd) cardInd.classList.toggle('active', type === 'individual');
      if (ctaBtn) ctaBtn.classList.add('ready');
    },

    proceed: function () {
      if (!chosen) return;

      // Save preference
      setCookie(COOKIE_NAME, chosen, COOKIE_DAYS);

      // Save to customer metafield if logged in
      saveCustomerMetafield(chosen);

      // Switch UI
      hideGatePage();
      activateMenu(chosen);
      updateSwitchUI(chosen);
    },

    // Called by the header browse toggle pills — instant switch without gate page
    setType: function (type) {
      if (VALID_TYPES.indexOf(type) === -1) return;

      // Save preference
      setCookie(COOKIE_NAME, type, COOKIE_DAYS);

      // Save to customer metafield if logged in (only touches custom.customer_type)
      saveCustomerMetafield(type);

      // Swap menu + update toggle highlight
      activateMenu(type);
      updateSwitchUI(type);

      // If on homepage with gate showing, dismiss it
      var gateSection = document.getElementById('gate-page-section');
      if (gateSection && !gateSection.classList.contains('gate-dismissed')) {
        hideGatePage();
      }
    },

    switchType: function () {
      // Clear preference and show gate page (if on homepage) or redirect to homepage
      deleteCookie(COOKIE_NAME);
      chosen = null;
      hideSwitchUI();
      showDefaultMenu();
      updateBrowseToggle(null);

      if (window.__LS_GATE && window.__LS_GATE.isHomepage) {
        showGatePage();
      } else {
        window.location.href = '/';
      }
    },

    // Called on page load
    init: function () {
      var customerType = getCustomerType();
      var isHomepage = window.__LS_GATE && window.__LS_GATE.isHomepage;
      var gateExists = !!document.getElementById('gate-page-section');

      if (isHomepage && gateExists) {
        // On the homepage with the gate section present
        if (customerType) {
          // Has a preference — dismiss gate, show homepage with correct menu
          hideGatePage();
          activateMenu(customerType);
          updateSwitchUI(customerType);
        } else {
          // No preference — gate is already visible (CSS default), just hide other sections
          hideHomepageSections();
          document.body.classList.add('gate-page-visible');
        }
      } else if (gateExists) {
        // Gate section exists but not homepage context — hide it
        hideGatePage();
        if (customerType) {
          activateMenu(customerType);
          updateSwitchUI(customerType);
        }
      } else {
        // No gate section (non-homepage pages) — just activate the right menu
        if (customerType) {
          activateMenu(customerType);
          updateSwitchUI(customerType);
        }
      }
    }
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.LearningSpaceGate.init);
  } else {
    window.LearningSpaceGate.init();
  }
})();
