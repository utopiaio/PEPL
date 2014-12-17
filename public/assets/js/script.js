(function () {
  'use strict';

  window.addEventListener('load', function (e) {
    window.applicationCache.addEventListener('updateready', function (e) {
      if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
        window.location.reload();
      }
    }, false);
  }, false);
})();

/**
 * yes i need this function available globally
 */
function scrollToTheTop () {
  $('html, body').animate({
    scrollTop: 0
  }, 0, 'linear');
};
