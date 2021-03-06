(function() {
'use strict';

angular.module('ui')
  .controller('BasicController', ['$rootScope', '$scope', 'formFactory', '$location',
    '$state', '$injector',
    function($rootScope, $scope, formFactory, $location,
      $state, $injector) {

      $scope.activate = function() {
        $scope.schema = $scope.factory.schema();
        $scope.options = formFactory.defaultOptions();

        if ($state.is($scope.newProperties.state)) {
          activateNew();
        } else if ($state.is($scope.editProperties.state)) {
          activateEdit();
        } else if ($state.is($scope.viewProperties.state)) {
          activateView();
        }
        
        $rootScope.isProcessing = false;
      };

      function activateNew() {
        if (!formFactory.canCreate($scope.resources)) {
          var notify = $injector.get('notify');
          // error de autorización
          notify({
            message: 'No tiene permiso de creación',
            classes: ['alert-danger'],
            position: 'right'
          });
          $location.path('/');
        }
        $scope.title = $scope.newProperties.title;
        $scope.form = $scope.factory.form('new');
        $scope.model = {};
        $scope.schema.readonly = false;
      }

      function activateEdit() {
        if (!formFactory.canEdit($scope.resources)) {
          var notify = $injector.get('notify');
          // error de autorización
          notify({
            message: 'No tiene permiso de edición',
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
        $scope.schema.readonly = false;
      }

      function activateView() {
        if (!formFactory.canList($scope.resources)) {
          var notify = $injector.get('notify');
          // error de autorización
          notify({
            message: 'No tiene permiso de vista',
            classes: ['alert-danger'],
            position: 'right'
          });
          $location.path('/');
        }
        $scope.options = formFactory.defaultViewOptions();
        $scope.model = $scope.prepService;
        $scope.entidadId = $scope.model.id;
        $scope.entidad = $scope.viewProperties.entidad;
        $scope.form = $scope.factory.form('view');
        $scope.title = $scope.viewProperties.title;
        $scope.view = true;
        $scope.schema.readonly = true;
      }

      $scope.submit = function(form) {
        formFactory.defaultSubmit($scope.resource, $scope, form, $scope.factory);
      };

      $scope.cancel = function() {
        $location.path('/' + $scope.resource);
      };
    }
  ]);
}());