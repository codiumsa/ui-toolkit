'use strict';

/**
 * @ngdoc service
 * @name qualita.formFactory
 * @description
 * # formFactory
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('formFactory', function ($location, $localForage, notify, $rootScope, AuthorizationService) {
    var hasPermission = AuthorizationService.hasPermission;

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
      defaultSubmit: function(resource, scope, form, factory, vm, errorHandler) {
        var backEndValidatedField = [];

        _.each(form.$error, function (error, errorKey) {

          if (_.contains(scope.schema.backEndValidatedErrors, errorKey)) {
            _.each(error, function (field, index) {
              var fieldName = 'schemaForm.error.' + field.$name;
              backEndValidatedField.push(fieldName);
              console.log('schemaForm.error.' + field.$name + ' error: ' + errorKey);
              scope.$broadcast(fieldName, errorKey.toString(), true, true);
            });
            
          } 

          _.each(backEndValidatedField, function (fieldName, index) {
            console.log(fieldName + ' error: ' + index);
            scope.$broadcast(fieldName, 'schemaForm', true, true);
          });

        });


        // First we broadcast an event so all fields validate themselves
        scope.$broadcast('schemaFormValidate');


        // Then we check if the form is valid
        if (form.$valid && !$rootScope.isProcessing) {
          $rootScope.isProcessing = true;
          // ... do whatever you need to do with your data.
          if(scope.model) {
            var model = factory.create(scope.model);
          } else {
            //si se usa controllerAs, se busca el modelo dentro del vm especificado
            var model = factory.create(vm.model);
          }

          //se convierten los campos de fecha desde string a date
          _.each(scope.schema.properties, function (field, fieldName) {
            if (field.format && (field.format === 'date' || field.format === 'date-time')) {
              if(model[fieldName] && typeof model[fieldName] === 'string') {
                //console.log(field.formatDate);
                model[fieldName] = new moment(model[fieldName], field.formatDate || 'DD/MM/YYYY').toDate();
              } 
            }
          });

          factory.save(model).then(function(){
            $location.path('/' + resource);
          })
          .catch(function(e) {
            console.log(e);

            if (errorHandler) {
              errorHandler(e);
            }
            
            //se convierten los campos de fecha desde date a string
            _.each(scope.schema.properties, function (field, fieldName) {
              if (field.format && (field.format === 'date' || field.format === 'date-time')) {
                if(scope.model[fieldName] && scope.model[fieldName] instanceof Date) {
                  scope.model[fieldName] = currentForm[fieldName].$viewValue;//.to('dd/MM/yyyy');
                }
              }
            });

            $rootScope.isProcessing = false;

            //se establecen los errores del backend
            if ((e.constructor === Array && e.data[0].constraint)) {
              scope.$broadcast('schemaForm.error.' + e.data[0].constraint, e.data[0].codigoError.toString(), false);
            }
            
            if(e.data && e.data.code !== 403) {
              var msg = 'Error al persistir la operación.';
              if(!scope.model.id) msg += '\n\nGuardando localmente, reintente más tarde.'
                notify({ message: msg, classes: 'alert-danger', position: 'right' });
                $localForage.getItem(resource).then(function(value) {
                  value = value || [];
                  value.unshift(scope.model);
                  if(!scope.model.id) $localForage.setItem(resource, value);
                });
              }
          });
        }
      },

      canEdit : function(resource) {
          var permission = hasPermission('update_' + resource);
          return permission;
      },

      canRemove : function(resource) {
          var permission = hasPermission('delete_' + resource);
          return permission;
      },

      canCreate : function(resource) {
          var permission = hasPermission('create_' + resource);
          return permission;
      }
    };
  });
