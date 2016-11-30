(function() {
'use strict';

angular
  .module('ui').directive('focusOn', ['$timeout', function($timeout) {
   return function(scope, elem, attrs) {
     scope.$on(attrs.focusOn, function(e) {
       $timeout((function() {
         elem[0].focus();
       }), 10);
     });
   };
}]);
}());
