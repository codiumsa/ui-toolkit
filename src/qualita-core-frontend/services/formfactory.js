'use strict';

/**
 * @ngdoc service
 * @name qualita.formFactory
 * @description
 * # formFactory
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('formFactory', function ($location, $localForage, notify) {

    // Public API here
    return {
      defaultForm: function () {
        return [
          '*',
          {
            type: 'submit',
            title: 'Guardar',
            htmlClass: 'pull-right'
          }
        ];
      },
      defaultOptions: function() {
        return {
          formDefaults: {
            ngModelOptions: {
             updateOn: 'blur'
            }
          },
          validationMessage: {
            302: 'El campo es obligatorio'
          }
        };
      },
      defaultSubmit: function(resource, scope, form, factory, vm) {
        // First we broadcast an event so all fields validate themselves
        scope.$broadcast('schemaFormValidate');

        // Then we check if the form is valid
        if (form.$valid) {
          // ... do whatever you need to do with your data.
          if(scope.model) {
            var model = factory.create(scope.model);
          } else {
            //si se usa controllerAs, se busca el modelo dentro del vm especificado
            var model = factory.create(vm.model);
          }
          factory.save(model).then(function(){
            $location.path('/' + resource);
          }, function(){
            var msg = 'Error al persistir la operación.';
            if(!scope.model.id) msg += '\n\nGuardando localmente, reintente más tarde.'
            notify({ message: msg, classes: 'alert-danger', position: 'right' });
            $localForage.getItem(resource).then(function(value) {
              value = value || [];
              value.unshift(scope.model);
              if(!scope.model.id) $localForage.setItem(resource, value);
            });
          });
        }
      }
    };
  });
