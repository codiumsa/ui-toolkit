(function() {
'use strict';

angular
  .module('ui').directive('aDisabled', function() {
    return {
      compile: function(tElement, tAttrs, transclude) {
        //Disable ngClick
        tAttrs['ngClick'] = '!(' + tAttrs['aDisabled']+ ') && (' + tAttrs['ngClick'] + ')';

        //return a link function
        return function (scope, iElement, iAttrs) {

          //Toggle 'disabled' to class when aDisabled becomes true
          scope.$watch(iAttrs['aDisabled'], function(newValue) {
            if (newValue !== undefined) {
              iElement.toggleClass('disabled', newValue);
            }
          });

          //Disable href on click
          iElement.on('click', function(e) {
            if (scope.$eval(iAttrs['aDisabled'])) {
              e.preventDefault();
            }
          });
        };
      }
    };
  });

angular.module('ui')
  .directive('uiRequired', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$validators.required = function(modelValue, viewValue) {
          return !((viewValue && viewValue.length === 0 || false) && attrs.uiRequired === 'true');
        };

        attrs.$observe('uiRequired', function() {
          ctrl.$setValidity('required', !(attrs.uiRequired === 'true' && ctrl.$viewValue && ctrl.$viewValue.length === 0));
        });
      }
    };
  });
}());
