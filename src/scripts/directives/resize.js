(function() {
'use strict';

angular
  .module('ui').directive('resize', ['$window', function($window){
  return{
    link: function(scope, element, attrs){
      var w = angular.element($window);
      scope.getWindowDimensions = function () {
        return { 'h': w.height(), 'w': w.width() };
      };
      scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
        scope.windowHeight = newValue.h;
        scope.windowWidth = newValue.w;

        scope.style = function () {
          return {
            'height': (newValue.h) + 'px',
            'width': (newValue.w) + 'px'
          };
        };
        scope.getHeight = function (padding) {
          return {
            'height': (newValue.h + padding) + 'px'
          };
        };
        scope.getWidth= function (padding) {
          return {
            'width': (newValue.w + padding) + 'px'
          };
        };
      }, true);

      w.bind('resize', function () {
        scope.$apply();
      });
    }
  };
}]);
}());
