/* AO Header: drawer menu toggle + sticky/transparent solidify on scroll */
class AOHeader extends HTMLElement {
  connectedCallback() {
    this.toggle = this.querySelector('.ao-header__menu-toggle');
    this.drawer = this.querySelector('.ao-drawer');
    this.isTransparent = this.dataset.transparent === 'true';
    this.isSticky = this.dataset.sticky === 'true';

    if (this.toggle && this.drawer) {
      this.toggle.addEventListener('click', () => this.openDrawer());
      this.drawer.querySelectorAll('[data-ao-drawer-close]').forEach((el) =>
        el.addEventListener('click', () => this.closeDrawer())
      );
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.drawer.classList.contains('is-open')) this.closeDrawer();
      });
    }

    if (this.isSticky) this.initSticky();
  }

  openDrawer() {
    this.drawer.classList.add('is-open');
    this.drawer.setAttribute('aria-hidden', 'false');
    this.toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const first = this.drawer.querySelector('.ao-drawer__close, a');
    if (first) first.focus();
  }

  closeDrawer() {
    this.drawer.classList.remove('is-open');
    this.drawer.setAttribute('aria-hidden', 'true');
    this.toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    this.toggle.focus();
  }

  initSticky() {
    // Solidify (and, for transparent headers, fix) once the user scrolls past the header height.
    const threshold = this.offsetHeight || 120;
    let ticking = false;
    const update = () => {
      const stuck = window.scrollY > threshold;
      this.classList.toggle('ao-header--is-stuck', stuck);
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }
}
customElements.define('ao-header', AOHeader);
