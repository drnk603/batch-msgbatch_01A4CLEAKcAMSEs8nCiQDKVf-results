(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var panel = header.querySelector('#dr-nav-menu');

  if (!toggle || !panel) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    var newState = !expanded;
    toggle.setAttribute('aria-expanded', newState ? 'true' : 'false');
    panel.setAttribute('aria-hidden', newState ? 'false' : 'true');

    var container = header;
    if (newState) {
      container.classList.add('dr-nav-panel-open');
    } else {
      container.classList.remove('dr-nav-panel-open');
    }
  });
})();