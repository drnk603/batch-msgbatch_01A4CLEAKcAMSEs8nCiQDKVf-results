(function () {
  'use strict';

  const CONFIG = {
    DEBOUNCE_DELAY: 150,
    THROTTLE_LIMIT: 200,
    TOAST_DURATION: 5000,
    HEADER_HEIGHT: 64,
    BREAKPOINT_MD: 768,
    BREAKPOINT_LG: 1024,
    PATTERNS: {
      EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PHONE: /^[\d+()\[\]-]{10,20}$/,
      NAME: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/
    }
  };

  const STATE = {
    initialized: false,
    menuOpen: false,
    formSubmitting: false
  };

  function debounce(fn, delay) {
    let timer;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(ctx, args), delay);
    };
  }

  function throttle(fn, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const ctx = this;
      if (!inThrottle) {
        fn.apply(ctx, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  function showNotification(message, type) {
    type = type || 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.setAttribute('role', 'alert');
    toast.style.minWidth = '250px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.innerHTML = `<div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    container.appendChild(toast);
    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 150);
      });
    }
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 150);
    }, CONFIG.TOAST_DURATION);
  }

  function sanitizeInput(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function validateField(input) {
    const type = input.type;
    const value = input.value.trim();
    const id = input.id;
    const name = input.name || id;
    let isValid = true;
    let errorMessage = '';

    if (input.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'Toto pole je povinné.';
    } else if (type === 'email' && value && !CONFIG.PATTERNS.EMAIL.test(value)) {
      isValid = false;
      errorMessage = 'Zadajte platnú e-mailovú adresu.';
    } else if (type === 'tel' && value && !CONFIG.PATTERNS.PHONE.test(value)) {
      isValid = false;
      errorMessage = 'Zadajte platné telefónne číslo (10-20 znakov).';
    } else if ((id === 'contactName' || name === 'name') && value && !CONFIG.PATTERNS.NAME.test(value)) {
      isValid = false;
      errorMessage = 'Meno musí obsahovať 2-50 písmen.';
    } else if (input.tagName === 'TEXTAREA' && input.hasAttribute('required') && value.length < 10) {
      isValid = false;
      errorMessage = 'Správa musí mať aspoň 10 znakov.';
    } else if (type === 'checkbox' && input.hasAttribute('required') && !input.checked) {
      isValid = false;
      errorMessage = 'Musíte súhlasiť s podmienkami.';
    }

    return { isValid, errorMessage };
  }

  function displayFieldError(input, errorMessage) {
    input.classList.add('is-invalid');
    let feedback = input.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentNode.appendChild(feedback);
    }
    feedback.textContent = errorMessage;
    feedback.classList.add('d-block');
  }

  function clearFieldError(input) {
    input.classList.remove('is-invalid');
    const feedback = input.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.classList.remove('d-block');
    }
  }

  function initBurgerMenu() {
    const nav = document.querySelector('.c-nav#main-nav') || document.querySelector('.c-nav');
    const toggle = document.querySelector('.c-nav__toggle') || document.querySelector('.navbar-toggler');
    const navList = document.querySelector('.c-nav__menu') || document.querySelector('.navbar-nav');

    if (!nav || !toggle || !navList) return;

    let focusableEls = [];
    let firstFocusable, lastFocusable;

    function updateFocusableElements() {
      focusableEls = Array.from(navList.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusableEls.length > 0) {
        firstFocusable = focusableEls[0];
        lastFocusable = focusableEls[focusableEls.length - 1];
      }
    }

    function openMenu() {
      STATE.menuOpen = true;
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
      updateFocusableElements();
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 50);
      }
    }

    function closeMenu() {
      STATE.menuOpen = false;
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    function trapFocus(e) {
      if (!STATE.menuOpen) return;
      if (e.key === 'Tab' || e.keyCode === 9) {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      STATE.menuOpen ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.keyCode === 27) && STATE.menuOpen) {
        closeMenu();
        toggle.focus();
      }
      trapFocus(e);
    });

    document.addEventListener('click', (e) => {
      if (!STATE.menuOpen) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    const navLinks = navList.querySelectorAll('a');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (STATE.menuOpen) closeMenu();
      });
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= CONFIG.BREAKPOINT_LG && STATE.menuOpen) {
        closeMenu();
      }
    }, CONFIG.DEBOUNCE_DELAY));
  }

  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      link.addEventListener('click', (e) => {
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;
        e.preventDefault();
        const headerHeight = CONFIG.HEADER_HEIGHT;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, null, `#${targetId}`);
        }
      });
    });
  }

  function initActiveMenu() {
    const currentPath = window.location.pathname.replace(/^\/+/, '/');
    const navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
    navLinks.forEach((link) => {
      const linkPath = (link.getAttribute('href') || '').replace(/^.\//, '').replace(/^\/+/, '/');
      if (linkPath === '/' || linkPath === '/index.html') {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath === '') {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      } else if (currentPath === linkPath) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    });
  }

  function initImages() {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('loading')) {
        const isLogo = img.classList.contains('c-logo__img');
        const isCritical = img.hasAttribute('data-critical');
        if (!isLogo && !isCritical) {
          img.setAttribute('loading', 'lazy');
        }
      }
      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }
      img.addEventListener('error', function handleError() {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';
        const svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E';
        this.src = svgPlaceholder;
        this.style.objectFit = 'contain';
      });
    });
  }

  function initForms() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }
    const allForms = document.querySelectorAll('form.needs-validation');
    allForms.forEach((form) => {
      if (form.id !== 'contactForm') {
        form.addEventListener('submit', handleFormSubmit);
      }
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    let formIsValid = true;
    inputs.forEach((input) => {
      clearFieldError(input);
      const { isValid, errorMessage } = validateField(input);
      if (!isValid) {
        formIsValid = false;
        displayFieldError(input, errorMessage);
      }
    });
    if (!formIsValid) {
      form.classList.add('was-validated');
      showNotification('Prosím, opravte chyby vo formulári.', 'danger');
      return;
    }
    form.classList.add('was-validated');
    const submitBtn = form.querySelector('button[type="submit"]');
    let originalText = '';
    if (submitBtn) {
      originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Odosielanie...';
    }
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = sanitizeInput(value);
    });
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      showNotification('Váš formulár bol úspešne odoslaný!', 'success');
      setTimeout(() => {
        window.location.href = 'thank_you.html';
      }, 1000);
    }, 1500);
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.c-nav__link[href^="#"], .nav-link[href^="#"]');
    if (sections.length === 0 || navLinks.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, { rootMargin: `-${CONFIG.HEADER_HEIGHT}px 0px -80% 0px` });
    sections.forEach((section) => observer.observe(section));
  }

  function initScrollToTop() {
    let scrollBtn = document.querySelector('.scroll-to-top');
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-to-top btn btn-primary';
      scrollBtn.setAttribute('aria-label', 'Scroll to top');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.position = 'fixed';
      scrollBtn.style.bottom = '20px';
      scrollBtn.style.right = '20px';
      scrollBtn.style.zIndex = '1000';
      scrollBtn.style.display = 'none';
      scrollBtn.style.width = '50px';
      scrollBtn.style.height = '50px';
      scrollBtn.style.borderRadius = '50%';
      scrollBtn.style.fontSize = '24px';
      document.body.appendChild(scrollBtn);
    }
    window.addEventListener('scroll', throttle(() => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'block';
      } else {
        scrollBtn.style.display = 'none';
      }
    }, CONFIG.THROTTLE_LIMIT));
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initHeaderScroll() {
    const header = document.querySelector('.l-header');
    if (!header) return;
    window.addEventListener('scroll', throttle(() => {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, CONFIG.THROTTLE_LIMIT));
  }

  function init() {
    if (STATE.initialized) return;
    STATE.initialized = true;
    initBurgerMenu();
    initSmoothScroll();
    initActiveMenu();
    initImages();
    initForms();
    initScrollSpy();
    initScrollToTop();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();