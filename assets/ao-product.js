/*
 * Adults Only — product page behaviour.
 *
 * Self-contained on purpose: the AO PDP does not reuse Dawn's product-info
 * component, so everything it needs (variant matching, gallery switching,
 * the notify-me disclosure) lives here.
 */
(function () {
  'use strict';

  function AOProduct(root) {
    this.root = root;
    this.form = root.querySelector('[data-ao-product-form]');
    this.idInput = root.querySelector('[data-ao-variant-id]');
    this.optionInputs = Array.prototype.slice.call(root.querySelectorAll('[data-ao-option-index]'));
    this.priceEl = root.querySelector('[data-ao-price]');
    this.comparePriceEl = root.querySelector('[data-ao-compare-price]');
    this.submitEl = root.querySelector('[data-ao-add-to-cart]');
    this.availabilityEl = root.querySelector('[data-ao-availability]');
    this.notifyEl = root.querySelector('[data-ao-notify]');
    this.mainImage = root.querySelector('.ao-pdp__main-img');
    this.thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-ao-thumb]'));
    this.strings = {
      addToCart: root.dataset.stringAddToCart || 'Add to cart',
      soldOut: root.dataset.stringSoldOut || 'Sold out',
      unavailable: root.dataset.stringUnavailable || 'Unavailable'
    };

    var dataEl = root.querySelector('[data-ao-variant-data]');
    try {
      this.variants = dataEl ? JSON.parse(dataEl.textContent) : [];
    } catch (error) {
      this.variants = [];
    }

    this.bind();
  }

  AOProduct.prototype.bind = function () {
    var self = this;

    this.optionInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        self.onOptionChange();
      });
    });

    this.thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function (event) {
        event.preventDefault();
        self.showMedia(thumb);
      });
    });

    var notifyToggle = this.root.querySelector('[data-ao-notify-toggle]');
    var notifyPanel = this.root.querySelector('[data-ao-notify-panel]');
    if (notifyToggle && notifyPanel) {
      notifyToggle.addEventListener('click', function () {
        var open = notifyToggle.getAttribute('aria-expanded') === 'true';
        notifyToggle.setAttribute('aria-expanded', String(!open));
        notifyPanel.hidden = open;
        if (!open) {
          var field = notifyPanel.querySelector('input[type="email"]');
          if (field) field.focus();
        }
      });
    }
  };

  /* Read the currently selected value for every option, in option order. */
  AOProduct.prototype.selectedOptions = function () {
    var selected = [];
    this.optionInputs.forEach(function (input) {
      var index = parseInt(input.dataset.aoOptionIndex, 10);
      if (input.type === 'radio' && !input.checked) return;
      selected[index] = input.value;
    });
    return selected;
  };

  AOProduct.prototype.findVariant = function (selected) {
    for (var i = 0; i < this.variants.length; i++) {
      var variant = this.variants[i];
      var match = true;
      for (var j = 0; j < selected.length; j++) {
        if (selected[j] !== undefined && variant.options[j] !== selected[j]) {
          match = false;
          break;
        }
      }
      if (match) return variant;
    }
    return null;
  };

  AOProduct.prototype.onOptionChange = function () {
    var variant = this.findVariant(this.selectedOptions());
    this.render(variant);
  };

  AOProduct.prototype.render = function (variant) {
    if (this.idInput) this.idInput.value = variant ? variant.id : '';

    if (this.priceEl) {
      this.priceEl.innerHTML = variant ? variant.price : '';
    }
    if (this.comparePriceEl) {
      var onSale = variant && variant.compare_at_price_raw > variant.price_raw;
      this.comparePriceEl.innerHTML = onSale ? variant.compare_at_price : '';
      this.comparePriceEl.hidden = !onSale;
    }

    if (this.submitEl) {
      if (!variant) {
        this.submitEl.disabled = true;
        this.submitEl.textContent = this.strings.unavailable;
      } else if (!variant.available) {
        this.submitEl.disabled = true;
        this.submitEl.textContent = this.strings.soldOut;
      } else {
        this.submitEl.disabled = false;
        this.submitEl.textContent = this.strings.addToCart;
      }
    }

    if (this.availabilityEl) {
      var note = variant ? variant.availability_note : '';
      this.availabilityEl.textContent = note;
      this.availabilityEl.hidden = !note;
    }
    if (this.notifyEl) {
      this.notifyEl.hidden = !!(variant && variant.available);
    }

    // Swap the gallery to the variant's own image when it has one.
    if (variant && variant.featured_media_id) {
      var thumb = this.thumbs.filter(function (item) {
        return item.dataset.aoMediaId === String(variant.featured_media_id);
      })[0];
      if (thumb) this.showMedia(thumb);
    }

    if (variant && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  AOProduct.prototype.showMedia = function (thumb) {
    if (!this.mainImage) return;
    var src = thumb.dataset.aoFullSrc;
    var srcset = thumb.dataset.aoFullSrcset;
    var alt = thumb.dataset.aoAlt || '';
    if (src) this.mainImage.src = src;
    if (srcset) this.mainImage.srcset = srcset;
    this.mainImage.alt = alt;

    this.thumbs.forEach(function (item) {
      item.classList.toggle('is-active', item === thumb);
      item.setAttribute('aria-current', item === thumb ? 'true' : 'false');
    });
  };

  function init() {
    var roots = document.querySelectorAll('[data-ao-product]');
    Array.prototype.forEach.call(roots, function (root) {
      if (root.aoProductReady) return;
      root.aoProductReady = true;
      new AOProduct(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // The theme editor re-renders sections in place.
  document.addEventListener('shopify:section:load', init);
})();
