/*
 * Socrat - Dark / Light theme toggle (app-wide)
 * Upload to: Shared Components > Static Application Files
 * Reference in: Shared Components > User Interface Attributes > JavaScript > File URLs
 *     #APP_FILES#theme-toggle.js
 */
var SocratTheme = (function () {
  var KEY = 'socrat-theme';
  var LOGIN_PAGE = '9999';

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function save(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }

  function isLoginPage() {
    return $v('pFlowStepId') === LOGIN_PAGE;
  }

  // Dark styles (Vita - Dark or a Theme Roller copy of it) load a stylesheet with "Dark"
  // in its file name; otherwise fall back to checking how dark the page background is
  function serverIsDark() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (/dark/i.test(links[i].href)) return true;
    }
    var rgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    return !!rgb && (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) < 128;
  }

  // Saves the style for the logged-in user (APEX_THEME.SET_USER_STYLE) then reloads
  function applyOnServer(mode) {
    apex.server.process('SET_THEME_STYLE', { x01: mode }, {
      success: function () { location.reload(); },
      error: function () { apex.message.alert('تعذر تغيير المظهر'); }
    });
  }

  function setLoginIcon(isLight) {
    $('#themeToggle .fa')
      .toggleClass('fa-sun-o', !isLight)
      .toggleClass('fa-moon-o', isLight);
  }

  function toggle() {
    if (isLoginPage()) {
      // Login page: user is not logged in yet, so just switch the CSS class
      var isLight = document.documentElement.classList.toggle('light-mode');
      save(isLight ? 'light' : 'dark');
      setLoginIcon(isLight);
    } else {
      var next = serverIsDark() ? 'light' : 'dark';
      save(next);
      applyOnServer(next);
    }
  }

  $(function () {
    if (isLoginPage()) {
      setLoginIcon(document.documentElement.classList.contains('light-mode'));
      return;
    }

    // Sync: if the user picked a mode on the login page, apply it after login.
    // Runs once per tab session so it can never loop on reloads.
    var mode = saved();
    var synced = false;
    try { synced = sessionStorage.getItem('socrat-theme-synced') === '1'; } catch (e) {}
    if (mode && !synced && (mode === 'dark') !== serverIsDark()) {
      try { sessionStorage.setItem('socrat-theme-synced', '1'); } catch (e) {}
      applyOnServer(mode);
    }
  });

  return { toggle: toggle };
})();
