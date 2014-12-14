(function () {
  'use strict';
})();

/**
 * yes i need this function available globally
 */
function scrollToTheTop () {
  $('html, body').animate({
    scrollTop: 0
  }, 0, 'linear');
};
