'use strict';

angular.module('qualitaCoreFrontend')
  .controller('BasicController', ['$rootScope', '$scope', 'formFactory', '$location',
    '$state', '$injector', function ($rootScope, $scope, formFactory, $location,
    $state, $injector) {

      $scope.activate = function () {
        if($state.is($scope.newProperties.state)) {
          activateNew();
        } else if($state.is($scope.editProperties.state)) {
          activateEdit();
        }
        $scope.schema = $scope.factory.schema();
        $scope.options = formFactory.defaultOptions();
        $rootScope.isProcessing = false;
      }

      function activateNew() {
        if (!formFactory.canCreate($scope.resources)) {
          var notify = $injector.get('notify');
          // error de autorización
          notify({
            message: "No tiene permiso de creación",
            classes: ['alert-danger'],
            position: 'right'
          });
          $location.path('/');
        }
        $scope.title = $scope.newProperties.title;
        $scope.form = $scope.factory.form('new');
        $scope.model = {};
      }

      function activateEdit() {
        if (!formFactory.canEdit($scope.resources)) {
          var notify = $injector.get('notify');
          // error de autorización
          notify({
            message: "No tiene permiso de edición",
            classes: ['alert-danger'],
            position: 'right'
          });
          $location.path('/');
        }
        $scope.model = $scope.prepService;
        $scope.entidadId = $scope.model.id;
        $scope.entidad = $scope.editProperties.entidad;
        $scope.form = $scope.factory.form('edit');
        $scope.title = $scope.editProperties.title;
      }

      $scope.submit = function (form) {
        formFactory.defaultSubmit($scope.resource, $scope, form, $scope.factory);
      };

      $scope.cancel = function () {
        $location.path('/' + $scope.resource);
      };

  }]);
