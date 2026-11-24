/*
 * SOCRAT - welcome screen, shown once after each login
 * Upload to: Shared Components > Static Application Files
 * Reference in: User Interface Attributes > JavaScript > File URLs
 *     #APP_FILES#socrat-welcome.js
 *
 * Needs on Page 0 (Global Page), only for logged-in users:
 *   <div id="s-welcome-data" hidden
 *        data-name="&AI_FULL_NAME!ATTR."
 *        data-role="&AI_ROLE!ATTR."
 *        data-logo="#APP_FILES#socrat-logo.png"></div>
 */
(function ($) {
  var DURATION = 2800;

  var ROLES = {
    manager:   { label: 'المدير',        icon: 'fa-line-chart', msg: 'جاهز تتابع أداء المركز النهاردة؟' },
    super:     { label: 'المشرف',        icon: 'fa-sliders',    msg: 'كل الإعدادات تحت إيدك.' },
    reception: { label: 'الاستقبال',     icon: 'fa-car',        msg: 'يلا نستقبل عربيات النهاردة.' },
    store:     { label: 'أمين المخزن',   icon: 'fa-cubes',      msg: 'خلّي عينك على الأصناف اللي قربت تخلص.' },
    customer:  { label: 'عميلنا العزيز', icon: 'fa-heart',      msg: 'سعداء إنك معانا، عربيتك في أيد أمينة.' }
  };

  var CSS =
    '.s-welcome{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:16px;' +
      'background:rgba(10,10,10,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
      'opacity:0;transition:opacity .4s ease;cursor:pointer}' +
    '.s-welcome.is-in{opacity:1}' +
    '.s-welcome-card{width:min(380px,100%);padding:32px 28px 26px;border-radius:20px;text-align:center;color:#fff;' +
      'background:linear-gradient(160deg,#1f1f1f,#0e0e0e);border:1px solid rgba(245,166,35,.35);' +
      'box-shadow:0 30px 80px rgba(0,0,0,.45);transform:translateY(24px) scale(.95);' +
      'transition:transform .55s cubic-bezier(.2,.9,.3,1.25)}' +
    '.s-welcome.is-in .s-welcome-card{transform:none}' +
    '.s-welcome-logo{width:72px;height:72px;object-fit:contain;margin:0 auto 12px;display:block;' +
      'animation:s-welcome-pop .7s ease .15s both}' +
    '.s-welcome-greet{font-size:15px;font-weight:700;color:#F5A623}' +
    '.s-welcome-name{margin:4px 0 12px;font-size:26px;font-weight:900;line-height:1.4}' +
    '.s-welcome-role{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:999px;' +
      'background:rgba(245,166,35,.15);color:#F5A623;font-size:13px;font-weight:700}' +
    '.s-welcome-msg{margin:14px 0 20px;font-size:14px;line-height:1.8;opacity:.8}' +
    '.s-welcome-bar{height:4px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,.12)}' +
    '.s-welcome-bar span{display:block;height:100%;background:linear-gradient(90deg,#F5A623,#D98A0B);' +
      'transform-origin:right;animation:s-welcome-bar ' + DURATION + 'ms linear forwards}' +
    '.s-welcome-skip{margin-top:12px;font-size:11px;opacity:.45}' +
    '@keyframes s-welcome-pop{from{opacity:0;transform:scale(.6) rotate(-12deg)}to{opacity:1;transform:none}}' +
    '@keyframes s-welcome-bar{from{transform:scaleX(1)}to{transform:scaleX(0)}}' +
    '@media (prefers-reduced-motion:reduce){.s-welcome,.s-welcome-card{transition:none}' +
      '.s-welcome-logo{animation:none}}';

  function seenKey() {
    return 'socrat-welcome-' + $v('pInstance');
  }

  function greeting() {
    var h = new Date().getHours();
    return (h >= 5 && h < 12) ? 'صباح الخير ☀️' : 'مساء الخير 🌙';
  }

  function show() {
    var data = document.getElementById('s-welcome-data');
    if (!data) return;

    try {
      if (sessionStorage.getItem(seenKey())) return;
    } catch (e) {
      return; // no storage: skip rather than show on every page
    }

    var role = ROLES[data.dataset.role] || { label: '', icon: 'fa-hand-paper-o', msg: 'يومك سعيد!' };
    var name = data.dataset.name || (apex.env && apex.env.APP_USER) || '';

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var el = document.createElement('div');
    el.className = 's-welcome';
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<div class="s-welcome-card">' +
        (data.dataset.logo ? '<img class="s-welcome-logo" alt="">' : '') +
        '<div class="s-welcome-greet"></div>' +
        '<div class="s-welcome-name"></div>' +
        (role.label ? '<div class="s-welcome-role"><span class="fa ' + role.icon + '"></span><span></span></div>' : '') +
        '<p class="s-welcome-msg"></p>' +
        '<div class="s-welcome-bar"><span></span></div>' +
        '<div class="s-welcome-skip">اضغط في أي مكان للمتابعة</div>' +
      '</div>';

    var logo = el.querySelector('.s-welcome-logo');
    if (logo) {
      logo.onerror = function () { logo.remove(); };
      logo.src = data.dataset.logo;
    }
    el.querySelector('.s-welcome-greet').textContent = greeting();
    el.querySelector('.s-welcome-name').textContent = 'مرحباً بك، ' + name;
    if (role.label) el.querySelector('.s-welcome-role span:last-child').textContent = role.label;
    el.querySelector('.s-welcome-msg').textContent = role.msg;

    document.body.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('is-in'); });
    });

    // Mark as seen a bit later, so a theme-sync reload right after login still shows it
    setTimeout(function () {
      try { sessionStorage.setItem(seenKey(), '1'); } catch (e) {}
    }, 1500);

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      try { sessionStorage.setItem(seenKey(), '1'); } catch (e) {}
      el.classList.remove('is-in');
      setTimeout(function () { el.remove(); }, 450);
    }
    el.addEventListener('click', close);
    $(document).one('keydown', close);
    setTimeout(close, DURATION);
  }

  $(show);
})(apex.jQuery);
