/*
 * SOCRAT UI - global effects
 * Upload to: Shared Components > Static Application Files
 * Reference in: User Interface Attributes > JavaScript > File URLs
 *     #APP_FILES#socrat-ui.js
 */
(function ($) {
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ripple on every APEX button
  $(document).on('mousedown', '.t-Button', function (e) {
    if (reduceMotion) return;
    var rect = this.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var dot = document.createElement('span');
    dot.className = 's-ripple';
    dot.style.width = dot.style.height = size + 'px';
    dot.style.left = (e.clientX - rect.left - size / 2) + 'px';
    dot.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(dot);
    setTimeout(function () { dot.remove(); }, 600);
  });

  // Counts KPI numbers up from 0 (cards inside a region with CSS class s-kpi)
  function countUp(el) {
    var text = el.textContent.trim();
    var target = parseFloat(text.replace(/,/g, ''));
    if (isNaN(target) || el.dataset.counted) return;
    el.dataset.counted = '1';

    var decimals = (text.split('.')[1] || '').length;
    var start = performance.now();
    var duration = 900;

    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Cards regions render on the client, so wait until APEX has finished the page
  $(window).on('apexreadyend', function () {
    if (reduceMotion) return;
    $('.s-kpi .a-CardView-mainContent').each(function () { countUp(this); });
  });
})(apex.jQuery);
