(function() {
'use strict';

angular.module('ui')
.value('$datepickerSuppressError', true)
.directive('pickDate', ['$filter', function ($filter) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      moment.locale('es');
      if (scope.model[scope.form.key[0]]) {
        scope.model[scope.form.key[0]] = new Date(scope.model[scope.form.key[0]]);
      }
      
      scope.status = {
        opened: false
      };
      
      scope.open = function () {
        scope.status.opened = true;
      };
      var defaultFormat = 'dd/MM/yyyy';

      ngModel.$parsers.push(function () {
        console.log(scope.schema.formatDate);
        return $filter('date')(element.val(), scope.form.schema.formatDate || defaultFormat);
      });
    }
  };
}]);
}());
