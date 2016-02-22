'use strict';

/**
 * @ngdoc directive
 * @name qualita.directive:offlineFormRecovery
 * @description
 * # offlineFormRecovery
 */
angular.module('qualitaCoreFrontend')
  .directive('offlineFormRecovery', function ($localForage) {
    return {
      template: '<div class="btn-group" role="group" aria-label="First group">' +
      '<button ng-disabled="!pending.length || position == 0" type="button" class="glyphicon glyphicon-arrow-left btn btn-default btn-recovery" ng-click="previous()"></button>' +
      '<button ng-disabled="!pending.length || position == pending.length" type="button" class="glyphicon glyphicon-arrow-right btn btn-default btn-recovery" ng-click="next()"></button>' +
      '<button ng-disabled="!pending.length || position == 0" type="button" class="glyphicon glyphicon-remove btn btn-default btn-recovery" ng-click="remove()"></button>' +
      '</div>',
      restrict: 'EA',
      link: function postLink(scope, element, attrs) {
        scope.position = 0;

        if (scope.resource) {
          $localForage.getItem(scope.resource).then(function(value) {
            scope.pending = _(value).filter(function(e) { return !e.id; })
                              .map(function(e, i){ e.index = i; return e; }).value();
          });
        } else {
          console.log('scope.resource no definido');
        }

        scope.next = function() {
          scope.position++;
          scope.model = (scope.position == 0) ? {} : scope.pending[scope.position - 1];
        };

        scope.previous = function() {
          scope.position--;
          scope.model = (scope.position == 0) ? {} : scope.pending[scope.position - 1];
        };

        scope.remove = function() {
          $localForage.getItem(scope.resource).then(function(value) {
            scope.pending = _.filter(value, function(e, i) { return i !== scope.position - 1; });
            $localForage.setItem(scope.resource, scope.pending);
            scope.previous();
          });
        }
      }
    };
  });
