(function() {
'use strict';

angular
  .module('ui')
  .directive('wizardContent', wizardContent);

function wizardContent() {
  var directive = {
    restrict: 'E',
    transclude: true,
    scope: {},
    templateUrl: 'views/wizardcontent.html',
    link: linkFunc,
  };

  return directive;
}

function linkFunc(scope, element, attrs) {
}
}());
