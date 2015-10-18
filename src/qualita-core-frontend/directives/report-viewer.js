'use strict';

/**
 * @ngdoc directive
 * @name portalApp.directive:reportViewer
 * @description
 * # reportViewer
 */
angular.module('qualitaCoreFrontend')
  .directive('reportViewer', ['$modal', '$sce', function ($modal, $sce) {
    return {
      template: '',
      restrict: 'E',
      scope: {
        url: '=',
        title: '@',
        background: '='
      },
      link: function postLink(scope, element) {

        scope.close = function () {
          scope.modalInstance.dismiss('close');
        };

        scope.$watch('url', function() {
         
          if(scope.url) {
            scope.trustedUrl = $sce.trustAsResourceUrl(scope.url);
            
            if(!scope.background){
              scope.modalInstance = $modal.open({
                template: '<div class="modal-header">' +
                  '<div class="close glyphicon glyphicon-remove" ng-click="close()"></div>' +
                  '<h3 class="modal-title">{{title}}</h3>' +
                '</div>' +
                '<div class="modal-body">' +
                  '<iframe src="{{trustedUrl}}" width="100%" height="450"></iframe>' +
                '</div>' +
                '<div class="modal-footer">' +
                  '<button class="btn btn-primary" ng-click="close()">Cerrar</button>' +
                '</div>',
                scope: scope
              });
            }else{
              element.append('<iframe src="' + scope.trustedUrl + '" hidden></iframe>');
            }
          }
        });
      }
    };
  }]);