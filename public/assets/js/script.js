;(function() {
  'use strict';

  window.addEventListener('load', function(e) {
    window.applicationCache.addEventListener('updateready', function(e) {
      if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
        window.location.reload();
      }
    }, false);
  }, false);
})();
