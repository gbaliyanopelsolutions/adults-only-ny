/* AO Footer: mobile accordion for link columns; always expanded on desktop */
(function () {
  var mq = window.matchMedia('(min-width: 750px)');

  function initSection(root) {
    var cols = root.querySelectorAll('.ao-footer__col--collapsible');

    function apply() {
      var desktop = mq.matches;
      cols.forEach(function (col) {
        var head = col.querySelector('.ao-footer__col-head');
        if (!head) return;
        if (desktop) {
          col.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
        } else {
          col.classList.remove('is-open');
          head.setAttribute('aria-expanded', 'false');
        }
      });
    }

    cols.forEach(function (col) {
      var head = col.querySelector('.ao-footer__col-head');
      if (!head) return;
      head.addEventListener('click', function () {
        if (mq.matches) return; // no toggle on desktop
        var open = col.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
  }

  document.querySelectorAll('.ao-footer-section').forEach(initSection);
})();
