(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('qualitaCoreFrontend.config', [])
      .value('qualitaCoreFrontend.config', {
          debug: true
      });

  // Modules
  angular.module('qualitaCoreFrontend.directives', []);
  angular.module('qualitaCoreFrontend.filters', []);
  angular.module('qualitaCoreFrontend.services', []);
  angular.module('qualitaCoreFrontend',
      [
          'qualitaCoreFrontend.config',
          'qualitaCoreFrontend.directives',
          'qualitaCoreFrontend.filters',
          'qualitaCoreFrontend.services',
          'ngResource',
          'ngCookies',
          'ngSanitize',
          'ngTouch',
          'datatables',
          'datatables.bootstrap',
          'schemaForm',
          'pascalprecht.translate',
          'cgNotify',
          'angular-underscore/filters',
          'flow',
          'ui.bootstrap',
          'ui.select',
          'ui.highlight',
          'mgcrea.ngStrap.select',
          'ncy-angular-breadcrumb',
          'ui.router',
          'oc.lazyLoad',
          'ngStorage',
          'LocalForageModule'
      ]);

})(angular);

'use strict';

/**
 * @ngdoc directive
 * @name qualita.directive:fileupload
 * @description
 * # fileupload
 */
angular.module('qualitaCoreFrontend')
  .directive('fileupload', ['$rootScope', function ($rootScope) {
    return {
      template: '<div ng-show="form.uploadOptions.imageOnly">' +
        '<div flow-init="{singleFile: true, target: form.uploadOptions.target}" ' +
             'flow-file-added="!!{png:1,gif:1,jpg:1,jpeg:1}[$file.getExtension()]"' +
             'flow-files-submitted="form.uploader.flow.upload()"' +
             'flow-files-added="filesAdded($files, $event, form.uploader.flow)"' +
             'flow-name="form.uploader.flow"' +
             'class="ng-scope">' +
        '<h3>{{showTitle()}}</h3>' +
        
        '<div class="thumbnail" ng-show="form.uploader.currentFile && !form.uploader.flow.files.length">' +
          '<img src="{{form.uploader.currentFile}}"/> ' +
        '</div>' +
        
        '<div class="thumbnail" ng-show="!form.uploader.flow.files.length && !form.uploader.currentFile">' +
          '<img src="images/placeholder.png">' +
        '</div>' +

        '<div class="thumbnail" ng-show="form.uploader.flow.files.length">' +
          '<img flow-img="form.uploader.flow.files[0]"/> ' +
        '</div>' +

        '<div>' +
          '<span class="btn btn-primary" ng-show="!form.uploader.flow.files.length" flow-btn="">' +
            'Seleccionar imagen' +
            '<input type="file" sf-changed="form" ng-model="$$value$$" style="visibility: hidden; position: absolute;" />' +
          '</span>' +
          '<span class="btn btn-info ng-hide" ng-show="form.uploader.flow.files.length" flow-btn="">' +
            'Cambiar' +
            '<input type="file" sf-changed="form" ng-model="$$value$$" style="visibility: hidden; position: absolute;" />' +
          '</span>' +
          '<span class="btn btn-danger ng-hide" ng-show="form.uploader.flow.files.length" ng-click="form.uploader.flow.cancel()">' +
            'Eliminar' +
          '</span>' +
        '</div>' +
        '<p>' +
          'Formatos permitidos: PNG, GIF, JPG y JPEG.' +
        '</p>' +
        '</div>' +
      '</div>' +

      '<div ng-show="!form.uploadOptions.imageOnly">' +
        '<div flow-init="{singleFile: true, target: form.uploadOptions.target}" ' +
             'flow-file-added="filesAdded($files, $event, uploader.flow)"' +
             'flow-files-submitted="form.uploader.flow.upload()"' +
             'flow-files-added="filesAdded($files, $event, form.uploader.flow)"' +
             'flow-name="form.uploader.flow"' +
             'class="ng-scope">' +
          '<h3>{{showTitle()}}</h3>' +
          '<div class="drop" flow-drop ng-class="dropClass">' +
            '<span class="btn btn-default" flow-btn>Cargar archivo' +
              '<input type="file" ng-model="$$value$$" sf-changed="form" style="visibility: hidden; position: absolute;" />' +
            '</span>' +
            '<b>OR</b>' +
            'Arrastre el archivo aqu&iacute;' +
          '</div>' +
          '<br/>' +
          '<div>' +
            '<div ng-repeat="file in form.uploader.flow.files" class="transfer-box">' +
              '{{file.relativePath}} ({{file.size}}bytes)' +
              '<div class="progress progress-striped" ng-class="{active: file.isUploading()}">' +
                '<div class="progress-bar" role="progressbar"' +
                     'aria-valuenow="{{file.progress() * 100}}"' +
                     'aria-valuemin="0"' +
                     'aria-valuemax="100"' +
                     'ng-style="{width: (file.progress() * 100) + '%'}">' +
                  '<span class="sr-only">{{file.progress()}}% Complete</span>' +
                '</div>' +
              '</div>' +
              '<div class="btn-group">' +
                //'<a class="btn btn-xs btn-warning" ng-click="file.pause()" ng-show="!file.paused && file.isUploading()">' +
                //  'Pausar' +
                //'</a>' +
                //'<a class="btn btn-xs btn-warning" ng-click="file.resume()" ng-show="file.paused">' +
                //  'Reanudar' +
                //'</a>' +
                '<a class="btn btn-xs btn-danger" ng-click="file.cancel()">' +
                  'Cancelar' +
                '</a>' +
                '<a class="btn btn-xs btn-info" ng-click="file.retry()" ng-show="file.error">' +
                  'Reintentar' +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
      restrict: 'E',
      tranclude: true,
      scope: true,
      link: function postLink(scope, element, attrs) {
        scope.uploader = {};
        scope.title = attrs.title;
        scope.fileModel = {};
        scope.filesAdded = function (files, event, flow) {

          if (!$rootScope.flow) {
            $rootScope.flow = flow;
          }
        };
      }
    };
  }]);

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
      '<button ng-disabled="!pending.length || position == 0" type="button" class="glyphicon glyphicon-arrow-left btn btn-default" ng-click="previous()"></button>' +
      '<button ng-disabled="!pending.length || position == pending.length" type="button" class="glyphicon glyphicon-arrow-right btn btn-default" ng-click="next()"></button>' +
      '<button ng-disabled="!pending.length || position == 0" type="button" class="glyphicon glyphicon-remove btn btn-default" ng-click="remove()"></button>' +
      '</div>',
      restrict: 'EA',
      link: function postLink(scope, element, attrs) {
        scope.position = 0;

        $localForage.getItem(scope.resource).then(function(value) {
          scope.pending = _(value).filter(function(e) { return !e.id; })
                            .map(function(e, i){ e.index = i; return e; }).value();
        });

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
angular.module('qualitaCoreFrontend').config(
  ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
    function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {

      var select = function (name, schema, options) {
        if ((schema.type === 'string') && ("enum" in schema)) {
          var f = schemaFormProvider.stdFormObj(name, schema, options);
          f.key = options.path;
          f.type = 'strapselect';
          options.lookup[sfPathProvider.stringify(options.path)] = f;
          return f;
        }
      };

      schemaFormProvider.defaults.string.unshift(select);

      //Add to the bootstrap directive
      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapselect',
        'views/directives/strapselect.html');
      schemaFormDecoratorsProvider.createDirective('strapselect',
        'views/directives/strapselect.html');

      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapmultiselect',
        'views/directives/strapmultiselect.html');
      schemaFormDecoratorsProvider.createDirective('strapmultiselect',
        'views/directives/strapmultiselect.html');

      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapselectdynamic',
        'views/directives/strapselect.html');
      schemaFormDecoratorsProvider.createDirective('strapselectdynamic',
        'views/directives/strapselect.html');

      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapmultiselectdynamic',
        'views/directives/strapmultiselect.html');
      schemaFormDecoratorsProvider.createDirective('strapmultiselectdynamic',
        'views/directives/strapmultiselect.html');


      // UI SELECT
      //Add to the bootstrap directive
      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'uiselect',
        'views/directives/uiselect.html');

      schemaFormDecoratorsProvider.createDirective('uiselect',
        'views/directives/uiselect.html');

      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'uiselectmultiple',
        'views/directives/uiselectmultiple.html');

      schemaFormDecoratorsProvider.createDirective('uiselectmultiple',
        'views/directives/uiselectmultiple.html');

    }])
  .directive("toggleSingleModel", function () {
    // some how we get this to work ...
    return {
      require: 'ngModel',
      restrict: "A",
      scope: {},
      replace: true,
      controller: ['$scope', function ($scope) {
        $scope.$parent.$watch('select_model.selected', function () {
          if ($scope.$parent.select_model.selected != undefined) {
            $scope.$parent.insideModel = $scope.$parent.select_model.selected.value;
            $scope.$parent.ngModel.$setViewValue($scope.$parent.select_model.selected.value);
          }
        });
      }]
    };
  })
  .directive("toggleModel", function () {
    // some how we get this to work ...
    return {
      require: 'ngModel',
      restrict: "A",
      scope: {},
      controller: ['$scope', 'sfSelect', function ($scope, sfSelect) {

        var list = sfSelect($scope.$parent.form.key, $scope.$parent.model);
        //as per base array implemenation if the array is undefined it must be set as empty for data binding to work
        if (angular.isUndefined(list)) {
          list = [];
          sfSelect($scope.$parent.form.key, $scope.$parent.model, list);
        }
        $scope.$parent.$watch('form.selectedOptions', function () {
          if (!($scope.$parent.form.selectedOptions)) {

          } else if ($scope.$parent.form.selectedOptions.length == 0) {

            if ($scope.$parent.ngModel.$viewValue != undefined) {
              $scope.$parent.ngModel.$setViewValue($scope.$parent.form.selectedOptions);
            }
          } else {
            $scope.$parent.$$value$$ = [];
            $scope.$parent.form.selectedOptions.forEach(function (item) {
                $scope.$parent.$$value$$.push(item.value);
              }
            );
            $scope.$parent.ngModel.$setViewValue($scope.$parent.$$value$$);
          }
        }, true);
      }]
    };
  })
  .directive('multipleOn', function () {
    return {
      link: function ($scope, $element, $attrs) {
        $scope.$watch(
          function () {
            return $element.attr('multiple-on');
          },
          function (newVal) {

            if (newVal == "true") {
              var select_scope = angular.element($element).scope().$$childTail;
              select_scope.$isMultiple = true;
              select_scope.options.multiple = true;
              select_scope.$select.$element.addClass('select-multiple');
            }
            else {
              angular.element($element).scope().$$childTail.$isMultiple = false;
            }
          }
        );
      }
    };
  })
  .filter('whereMulti', function () {
    return function (items, key, values) {
      var out = [];

      if (angular.isArray(values) && items !== undefined) {
        values.forEach(function (value) {
          for (var i = 0; i < items.length; i++) {
            if (value == items[i][key]) {
              out.push(items[i]);
              break;
            }
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  })
  .filter('propsFilter', function () {
    return function (items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function (item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            if (item.hasOwnProperty(prop)) {
              //only match if this property is actually in the item to avoid
              var text = props[prop].toLowerCase();
              //search for either a space before the text or the textg at the start of the string so that the middle of words are not matched
              if (item[prop].toString().toLowerCase().indexOf(text) === 0 || ( item[prop].toString()).toLowerCase().indexOf(' ' + text) !== -1) {
                itemMatches = true;
                break;
              }
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  }).filter('filterRelated', function () {

    return function(items, props) {
      if(typeof props.form.options.filterRelated === 'function') {
        return props.form.options.filterRelated(items);
      }
      return items;
    };
  });

angular.module('qualitaCoreFrontend').controller('dynamicSelectController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {


  $scope.select_model = {};

  $scope.triggerTitleMap = function () {
    console.log("listener triggered");
    // Ugly workaround to trigger titleMap expression re-evaluation so that the selectFilter it reapplied.
    $scope.form.titleMap.push({"value": "345890u340598u3405u9", "name": "34095u3p4ouij"})
    $timeout(function () {
      $scope.form.titleMap.pop()
    });

  };

  $scope.initFiltering = function (localModel) {
    if ($scope.form.options.filterTriggers) {
      $scope.form.options.filterTriggers.forEach(function (trigger) {
        $scope.$parent.$watch(trigger, $scope.triggerTitleMap)

      });
    }
    // This is set here, as the model value may become unitialized and typeless if validation fails.
    $scope.localModelType = Object.prototype.toString.call(localModel);
    $scope.filteringInitialized = true;
  };


  /**
   * Función implementada para solucionar el problema de pre-seleccionar el elemento.
   * Dejamos el elemento a pre-seleccionar en la primera posición del titleMap.
   **/
  function initSelection(data, scope, options) {
    var model = getModel(options);
    var map = options.map;
    if (angular.isArray(model)) {
      return data;
    } else {

      if (!model) {
        return [{value: undefined, name: $scope.form.placeholder}].concat(data);
      }

      for (var i = 0; i < data.length; i++) {

        if (data[i][map.valueProperty] === model[map.valueProperty]) {
          break;
        }
      }
      var tmp = data[0];
      data[0] = data[i];
      data[i] = tmp;
      return data;
    }
  }

  function getModel(options) {
    var form = $scope.form;
    var modelKey = form.key[0];
    var _scope = angular.element('form[name=' + options.formName + ']').scope();
    return _scope.model[modelKey];
  }

  /**
   * Función implementada para solucionar el problema de pre-seleccionar el elemento.
   **/
  function initEnumSelection(data, options) {
    var model = getModel(options);
    $scope.select_model.selected = {value: model, name: model};
  }

  $scope.remap = function (options, data) {


    if (options && "map" in options && options.map) {
      var current_row = null;
      var result = [];
      data.forEach(function (current_row) {
        current_row["value"] = current_row[options.map.valueProperty];
        current_row["name"] = current_row[options.map.nameProperty];
        result.push(current_row);
      });

      if (options.formName) {
        var _scope = angular.element('form[name=' + options.formName + ']').scope();
        result = initSelection(data, _scope, options);
      }
      return result;
    }
    else {
      data.forEach(function (item) {
          if ("text" in item) {
            item.name = item.text
          }
        }
      );
      return data;
    }
  };

  $scope.clone = function (obj) {
    if (null == obj || "object" != typeof(obj)) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = $scope.clone(obj[attr]);
    }
    return copy;
  };


  $scope.getCallback = function (callback, name) {
    if (typeof(callback) == "string") {
      var _result = $scope.$parent.evalExpr(callback);
      if (typeof(_result) == "function") {
        return _result;
      }
      else {
        throw("A callback string must match name of a function in the parent scope")
      }

    }
    else if (typeof(callback) == "function") {
      return callback;
    }
    else {
      throw("A callback must either be a string matching the name of a function in the parent scope or a " +
      "direct function reference")

    }
  };

  $scope.getOptions = function (options) {
    // If defined, let the a callback function manipulate the options
    if (options.httpPost && options.httpPost.optionsCallback) {
      newOptionInstance = $scope.clone(options);
      return $scope.getCallback(options.httpPost.optionsCallback)(newOptionInstance);
    }
    if (options.httpGet && options.httpGet.optionsCallback) {
      newOptionInstance = $scope.clone(options);
      return $scope.getCallback(options.httpGet.optionsCallback)(newOptionInstance);
    }
    else {
      return options;
    }
  };

  $scope.test = function (form) {
    form.titleMap.pop();
  };

  $scope.populateTitleMap = function (form) {

    if ("enum" in form.schema) {
      form.titleMap = [];
      form.schema.enum.forEach(function (item) {
        form.titleMap.push({"value": item, "name": item})
      });
      initEnumSelection(form.titleMap, form.options);

    }/* else if (form.titleMap) {
     console.log("dynamicSelectController.populateTitleMap(key:" + form.key + ") : There is already a titleMap");
     }*/
    else if (!form.options) {

      console.log("dynamicSelectController.populateTitleMap(key:" + form.key + ") : No options set, needed for dynamic selects");
    }
    else if (form.options.callback) {
      form.titleMap = $scope.getCallback(form.options.callback)(form.options);
      console.log('callback items', form.titleMap);
    }
    else if (form.options.asyncCallback) {
      return $scope.getCallback(form.options.asyncCallback)(form.options).then(
        function (_data) {
          form.titleMap = $scope.remap(form.options, _data.data);

          if (form.options.multiple) {
            $scope.uiMultiSelectInitInternalModel(getModel(form.options));
          } else {
            $scope.select_model.selected = form.titleMap[0];
          }
          console.log('asyncCallback items', form.titleMap);
        },
        function (data, status) {
          alert("Loading select items failed(Options: '" + String(form.options) +
            "\nError: " + status);
        });
    }
    else if (form.options.httpPost) {
      var finalOptions = $scope.getOptions(form.options);

      return $http.post(finalOptions.httpPost.url, finalOptions.httpPost.parameter).then(
        function (_data) {

          form.titleMap = $scope.remap(finalOptions, _data.data);
          console.log('httpPost items', form.titleMap);
        },
        function (data, status) {
          alert("Loading select items failed (URL: '" + String(finalOptions.httpPost.url) +
            "' Parameter: " + String(finalOptions.httpPost.parameter) + "\nError: " + status);
        });
    }
    else if (form.options.httpGet) {
      var finalOptions = $scope.getOptions(form.options);
      return $http.get(finalOptions.httpGet.url, finalOptions.httpGet.parameter).then(
        function (data) {
          form.titleMap = $scope.remap(finalOptions, data.data);
          console.log('httpGet items', form.titleMap);
        },
        function (data, status) {
          alert("Loading select items failed (URL: '" + String(finalOptions.httpGet.url) +
            "\nError: " + status);
        });
    }
  };
  $scope.uiMultiSelectInitInternalModel = function (_model) {

    function find_in_titleMap(value) {
      for (i = 0; i < $scope.form.titleMap.length; i++) {
        if ($scope.form.titleMap[i].value == value) {
          return $scope.form.titleMap[i].name
        }
      }


    }

    $scope.internalModel = [];

    if (_model !== undefined && angular.isArray(_model)) {
      _model.forEach(function (value) {
          $scope.internalModel.push({"value": value, "name": find_in_titleMap(value)})
        }
      )
    }
  }

}]);

angular.module('qualitaCoreFrontend').filter('selectFilter', [function ($filter) {
  return function (inputArray, controller, localModel, strLocalModel) {
    // As the controllers' .model is the global and its form is the local, we need to get the local model as well.
    // We also need tp be able to set it if is undefined after a validation failure,so for that we need
    // its string representation as well as we do not know its name. A typical value if strLocalModel is model['groups']
    // This is very ugly, though. TODO: Find out why the model is set to undefined after validation failure.

    if (!angular.isDefined(inputArray) || !angular.isDefined(controller.form.options) || !angular.isDefined(controller.form.options.filter) || controller.form.options.filter == '') {
      return inputArray;
    }

    console.log("----- In filtering for " + controller.form.key + "(" + controller.form.title + "), model value: " + JSON.stringify(localModel) + "----");
    console.log("Filter:" + controller.form.options.filter);
    if (!controller.filteringInitialized) {
      console.log("Initialize filter");
      controller.initFiltering(localModel);
    }
    var data = [];


    angular.forEach(inputArray, function (curr_item) {
      console.log("Compare: curr_item: " + JSON.stringify(curr_item) +
        "with : " + JSON.stringify(controller.$eval(controller.form.options.filterTriggers[0])));
      if (controller.$eval(controller.form.options.filter, {item: curr_item})) {
        data.push(curr_item);
      }
      else if (localModel) {
        // If not in list, also remove the set value

        if (controller.localModelType == "[object Array]" && localModel.indexOf(curr_item.value) > -1) {
          localModel.splice(localModel.indexOf(curr_item.value), 1);
        }
        else if (localModel == curr_item.value) {
          console.log("Setting model of type " + controller.localModelType + "to null.");
          localModel = null;
        }
      }
    });

    if (controller.localModelType == "[object Array]" && !localModel) {
      // An undefined local model seems to mess up bootstrap select's indicators
      console.log("Resetting model of type " + controller.localModelType + " to [].");

      controller.$eval(strLocalModel + "=[]");
    }

    console.log("Input: " + JSON.stringify(inputArray));
    console.log("Output: " + JSON.stringify(data));
    console.log("Model value out : " + JSON.stringify(localModel));
    console.log("----- Exiting filter for " + controller.form.title + "-----");

    return data;
  };
}]);

'use strict';

/**
 * @ngdoc directive
 * @name qualita.directive:tdnDatatable
 * @description
 * # tdnDatatable
 */
angular.module('qualitaCoreFrontend')
  .directive('tdnDatatable', function ($timeout, $modal, $compile, $state, $resource, AuthorizationService, DTOptionsBuilder, DTColumnBuilder, DTInstances, baseurl) {
    
    var hasPermission = AuthorizationService.hasPermission;
    
    return {
      template: '<div>' +
          '<h2>{{options.title}}<button type="button" ng-show="canCreate()" style="margin-left:10px;" class="btn btn-default glyphicon glyphicon-plus-sign" ng-click="new()"></button></h2>' +
          '<hr>' +
          '<div class="table-responsive">' +
            '<table datatable="" dt-options="dtOptions" dt-columns="dtColumns" dt-instance="dtInstanceCallback" width=100% class="table table-striped no-footer">' +
                '<tfoot>' +
                    '<tr>' +
                    '</tr>' +
                '</tfoot>' +
            '</table>' +
          '</div>' + 
          '<div ng-if="selected">' +
              '<h3>Detalles</h3>' +
              '<table class="table table-striped table-bordered table-detail">' +
                  '<tbody>' +
                      '<tr ng-repeat="row in options.detailRows">' +
                          '<td ng-if="selected[row.data]" class="row-title">{{row.title}}</td>' +
                          '<td ng-if="selected[row.data] && row.renderWith">{{row.renderWith(selected[row.data])}}</td>' +
                          '<td ng-if="selected[row.data] && !row.renderWith">{{selected[row.data]}}</td>' +
                      '</tr>' +
                  '</tbody>' +
              '</table>' +
          '</div>' + 
      '</div>',
      restrict: 'AE',
      replace: true,
      scope: {
        options: '='
      },
      controller: function controller($scope, $element) {
        var actionsColumn, selectionColumn, urlTemplate = _.template(baseurl.getBaseUrl() + '/<%= resource %>/datatables?');

        //$scope.selection = {};
        $scope.selectAll = false;
        //$scope.toggleAll = toggleAll;
        //$scope.toggleOne = toggleOne;
        var titleHtml = '<label class="checkbox-inline">' +
                '<input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, $scope.options.selection)">' +
              '</label>';

        var ajaxRequest = function(data, callback) {
          var xhr = $resource(urlTemplate($scope.options) + $.param(data), {}, {
            query: {
              isArray: false
            }
          });
          xhr.query().$promise.then(function(response) {
            callback(response);
          });
        };
        var ajaxConfig = ($scope.options.ajax) ? $scope.options.ajax : ajaxRequest;
        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withOption('ajax', ajaxConfig)
          .withDataProp('data')
          .withOption('processing', true)
          .withOption('serverSide', true)
          .withOption('language', {
                  'sProcessing' : 'Procesando...',
                  'sLengthMenu' : 'Mostrar _MENU_ registros',
                  'sZeroRecords' : 'No se encontraron resultados',
                  'sEmptyTable' : 'Ningún dato disponible en esta tabla',
                  'sInfo' : 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
                  'sInfoEmpty' : 'Mostrando registros del 0 al 0 de un total de 0 registros',
                  'sInfoFiltered' : '(filtrado de un total de _MAX_ registros)',
                  'sInfoPostFix' : '.',
                  'sSearch' : 'Buscar:',
                  'sInfoThousands' : ',',
                  'sLoadingRecords' : 'Cargando...',
                  'oPaginate' : {
                    'sFirst' : 'Primero',
                    'sLast' : 'Último',
                    'sNext' : 'Siguiente',
                    'sPrevious' : 'Anterior'
                  },
                  'oAria' : {
                    'sSortAscending' : ': Activar para ordenar la columna de manera ascendente',
                    'sSortDescending' : ': Activar para ordenar la columna de manera descendente'
                  }
                })
          .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withPaginationType('full_numbers')
          .withBootstrap();

        if($scope.options.detailRows){
          $scope.dtOptions = $scope.dtOptions.withOption('rowCallback', rowCallback);

        }

        $scope.visibleColumns = $scope.options.columns.length;

        $scope.dtColumns = _.map($scope.options.columns, function(c){
          var column = DTColumnBuilder.newColumn(c.data);
          var commonAttrs = ['data', 'title', 'class', 'renderWith', 'visible', 'sortable']
          if(c.title) column = column.withTitle(c.title);
          if(c.class) column = column.withClass(c.class);
          if(c.renderWith) column = column.renderWith(c.renderWith);
          if(c.visible === false) {
            column = column.notVisible();
            $scope.visibleColumns -= 1;
          }
          if(c.sortable === false) column = column.notSortable();
          _.forOwn(c, function(value, key){
            if(!_.contains(commonAttrs, key)){
              column = column.withOption(key, value);
            }
          });
          return column;
        });

        actionsColumn = DTColumnBuilder.newColumn(null).withTitle('Operaciones').notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var basicOpts = '<button class="btn btn-success btn-dt" style="margin-right: 5px;" ng-show="canEdit()" ng-click="edit(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-pencil"></span>' +
                  '</button>' +
                  '<button class="btn btn-danger btn-dt" style="margin-right: 5px;" ng-show="canRemove()" ng-click="remove(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-trash"></span>' +
                  '</button>' +
                  '<button class="btn btn-success btn-dt" style="margin-right: 5px;" ng-show="canDownload()" ng-click="download(' + data.id + ',\'' + data.file + '\')">' +
                  '   <span class="glyphicon glyphicon-download-alt"></span>' +
                  '</button>';
            if($scope.options.extraMenuOptions) {
              _.forEach($scope.options.extraMenuOptions, function(menuOpt) {
                var compilado = _.template(menuOpt.templateToRender);
                $scope[menuOpt.functionName] = menuOpt.functionDef;
                basicOpts = basicOpts + compilado({'dataId': data.id, '$state': $state, '$scope': $scope});
              });
            }
            return basicOpts;
          });

        selectionColumn = DTColumnBuilder.newColumn(null).withTitle('Seleccionar').notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var checkbox = '<label class="checkbox-inline">' +
                '<input type="checkbox" ng-model="$scope.options.selection[' + data.id + ']" ng-click="toggleOne($scope.options.selection)">' +
              '</label>';
              return checkbox;
          });

        $scope.canEdit = function() {
          return hasPermission('update_' + $scope.options.resource);        
        };
        
        $scope.canRemove = function() {
          return hasPermission('delete_' + $scope.options.resource);        
        };
        
        $scope.canCreate = function() {
          return hasPermission('create_' + $scope.options.resource);        
        };

        $scope.canDownload = function() {
          return hasPermission('upload_' + $scope.options.resource);        
        };

        if($scope.options.hasOptions) {
          $scope.dtColumns.push(actionsColumn);
          $scope.visibleColumns += 1;
        }

        if($scope.options.isSelectable) {
          $scope.dtColumns.push(selectionColumn);
          $scope.visibleColumns += 1;
        }

        $scope.new = function(){
          var pathTemplate = _.template('app.<%= resource %>.new');
          $state.go(pathTemplate($scope.options));
        }

        $scope.edit = function(itemId){
          var pathTemplate = _.template('app.<%= resource %>.edit');
          //var params = _.extend($scope.options, {itemId: itemId});
          $state.go(pathTemplate($scope.options), {id: itemId});
          //$location.path(pathTemplate(params));
        }

        $scope.tooggleAll = function (selectAll, selectedItems) {
            console.log('tooggleAll');
            console.log(selectedItems);
            for (var id in selectedItems) {
                if (selectedItems.hasOwnProperty(id)) {
                    selectedItems[id] = selectAll;
                }
            }
            $scope.options.selection = selectedItems;
        }

        $scope.toggleOne = function (selectedItems) {
            console.log('toggleOne');
            console.log(selectedItems);
            for (var id in selectedItems) {
                if (selectedItems.hasOwnProperty(id)) {
                    if(!selectedItems[id]) {
                        $scope.selectAll = false;
                        return;
                    }
                }
            }
            $scope.selectAll = true;
            $scope.options.selection = selectedItems;
        }

        $scope.dtInstanceCallback = function(dtInstance){
          $('thead+tfoot').remove();
          var tableId = dtInstance.id;
          //console.log($scope.visibleColumns)
          for (var i = 0; i < $scope.visibleColumns; i++) {
            $('#' + tableId + ' tfoot tr').append('<th></th>');
          }

          // Setup - add a text input to each footer cell
          $('#' + tableId + ' tfoot th').not(':last').each(
            function() {
              var title = $('#' + tableId + ' thead th').eq($(this).index()).text();
              $(this).html(
                  '<input class="column-filter form-control input-sm" type="text" placeholder="'
                      + title + '" style="min-width:60px; width: 100%;" />');
          });

          $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');
          var table = dtInstance.DataTable;


          table.columns().eq(0).each(
            function(colIdx) {
              $('tfoot input:eq(' + colIdx.toString() + ')').on('keyup change',
                  function(e) {
                      var realIndex;
                      var that = this;
                      _.each($scope.dtColumns, function(object, index) {
                          if (object.sTitle == that.placeholder) {
                              realIndex = index;
                          }
                      });
                      var index = realIndex || colIdx;
                      if(this.value.length >= 1 || e.keyCode == 13){
                        table.column(index).search(this.value).draw();
                      }
                      // Ensure we clear the search if they backspace far enough
                      if(this.value == "") {
                          table.column(index).search("").draw();
                      }
                  });
          });

          /*table.columns().eq(0).each(
            function(colIdx) {
              $('tfoot input:eq(' + colIdx.toString() + ')').on('keyup change',
                  function(e) {
                      if(this.value.length >= 1 || e.keyCode === 13){
                        table.column(colIdx).search(this.value).draw();
                      }
                      // Ensure we clear the search if they backspace far enough
                      if(this.value === "") {
                          table.column(colIdx).search("").draw();
                      }
                  });
          });*/

          /* Esto se hace por un bug en Angular Datatables,
          al actualizar hay que revisar */
          $scope.dtOptions.reloadData = function(){
            $('#' + tableId).DataTable().ajax.reload();
          }

        }

        $scope.remove = function(itemId) {
          $scope.selectedItemId = itemId;
          $scope.tituloModal = "Confirmación de Borrado";
          $scope.mensajeModal = "Esta operación eliminará el registro seleccionado. ¿Desea continuar?";
          var modalInstance = $modal.open({
            template: '<div class="modal-header">' +
                '<h3 class="modal-title">{{::tituloModal}}</h3>' +
            '</div>' +
            '<div class="modal-body">{{::mensajeModal}}</div>' +
            '<div class="modal-footer">' +
                '<button class="btn btn-primary" ng-click="ok(selectedItemId)">Aceptar</button>' +
                '<button class="btn btn-warning" ng-click="cancel()">Cancelar</button>' +
            '</div>',
            scope: $scope
          });

          $scope.cancel = function() {
            modalInstance.dismiss('cancel');
          }

          $scope.ok = function(itemId) {
            var model = $scope.options.factory.create({id: itemId});
            $scope.options.factory.remove(model).then(function() {
              $scope.dtOptions.reloadData();
              modalInstance.close(itemId);
            });
          }
        };

        $scope.download = function(itemId, filename){
          $scope.options.factory.download({id: itemId, file : filename});
        };

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
          $('td', nRow).unbind('click');
          $('td', nRow).bind('click', function() {
              $scope.$apply(function() {
                  $scope.selected = aData;
                  $timeout(function(){
                    $(document).scrollTop($('.table-detail').offset().top);
                  });
              });
          });
          return nRow;
        }

        if($scope.options.detailRows){
          if($scope.options.detailRows === true){
            $scope.options.detailRows = $scope.options.columns;
          }else{
            $scope.options.detailRows = _.union($scope.options.columns, $scope.options.detailRows);
          }
        }

      }
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name qualita.Authentication
 * @description
 * # Authentication
 * Service in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .service('AuthenticationService', function ($resource, baseurl) {
    var Authentication = $resource(baseurl.getBaseUrl() + '/:action', {action: '@action'});

    return {
      login: function(username, password) {
        var auth = new Authentication({username: username, password: password});
        return auth.$save({action: 'login'});
      },

      postLogin: function(authParams) {
        return new Authentication.save({action: 'loginApp'}, {username: authParams.username});
      },

      token: function(authParams) {
        //$log.debug("en token");
        var auth = new Authentication({username: authParams.username,
                                       accessToken: authParams.accessToken,
                                       requestToken: authParams.requestToken});
        return auth.$save({action: 'token'});
      },

      logout: function(authParams) {
        var auth = new Authentication({accessToken: authParams.accessToken,
                                       requestToken: authParams.requestToken});
        return auth.$save({action: 'logout'});
      }
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name qualita.Authorization
 * @description
 * # Authorization
 * Service in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .service('AuthorizationService', function ($rootScope, $resource, $http, baseurl) {
    
    var Authorization = $resource(baseurl.getBaseUrl() + '/authorization/:action',
                                  {action: '@action'});

    return {
      /**
       * Retorna true si el usuario actual de la aplicación posee el permiso dado como
       * parámetro.
       **/
      hasPermission: function(permission) {
        var permissions = $rootScope.AuthParams.permissions || [];
        return permissions.indexOf(permission) >= 0;
      },

      principal: function() {
        return Authorization.get({action: 'principal'}).$promise;
      },

      setupCredentials: function(username, requestToken, accessToken) {
        
        var AuthParams = {
          username: username,
          requestToken: requestToken,
          accessToken: accessToken
        };

        $rootScope.AuthParams = AuthParams;
        localStorage.setItem('AUTH_PARAMS', JSON.stringify(AuthParams));
        $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
        // cargamos los permisos del usuario
        this.principal().then(function(response) {
          AuthParams.permissions = response.permisos;
          AuthParams.stamp = response.stamp;
          localStorage.setItem('AUTH_PARAMS', JSON.stringify(AuthParams));
        });
      },

      cleanupCredentials: function() {        
        localStorage.removeItem('AUTH_PARAMS');
      }
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name qualita.baseurl
 * @description
 * # baseurl
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('baseurl', function () {

    // Public API here
    return {
      getBaseUrl: function () {
        var hostname = window.location.hostname;
        //si es 159.203.94.34 es el servidor de homologacion
        if (hostname === '159.203.94.34')
          return 'http://' + hostname + '/qualita-client/rest';
        //si es localhost quiere es desarrollo local
        else
          return 'http://' + hostname + ':8088/qualita-client/rest';
      },
      getPublicBaseUrl: function () {
        var hostname = window.location.hostname;
        //si es 159.203.94.34 es el servidor de homologacion
        if (hostname === '159.203.94.34')
          return 'http://' + hostname + '/public/';
        //si es localhost quiere es desarrollo local
        else
          return 'http://' + hostname + ':8088/public/';
      }
    };
  });
'use strict';

/**
 * @ngdoc service
 * @name qualita.fileUpload
 * @description
 * # fileUpload
 * Service in the qualita.
 */
angular.module('qualitaCoreFrontend').config(
['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider', 'flowFactoryProvider',
  function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider, flowFactoryProvider) {

    flowFactoryProvider.defaults = {
      method: 'octet'
    };

    var fileupload = function(name, schema, options) {
      if (schema.type === 'object' && schema.format === 'fileupload') {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key  = options.path;
        f.type = 'fileupload';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    };

    schemaFormProvider.defaults.object.unshift(fileupload);

    //Add to the bootstrap directive
    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'fileupload',
                                            'views/directives/fileupload.html');
    schemaFormDecoratorsProvider.createDirective('fileupload',
                                                 'views/directives/fileupload.html');
  }]).factory('fileupload', function(){
  });

'use strict';

/**
 * @ngdoc service
 * @name qualita.filterFactory
 * @description
 * # filterFactory
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('filterFactory', function () {
    // Service logic
    // ...

    var logicalOp = function(type, filters) {
      var result = {
        _inner: {
          type: type
        }
      };
      result._inner.filters = (this && this._inner) ? [this._inner, filters] : filters;
      if(!result.or && type === 'and') result.or = or;
      if(!result.value) result.value = value;
      if(!result.add) result.add = add;
      result.paginate = paginate;
      return result;
    }

    var and = function(filters) {
      return logicalOp.call(this, 'and', filters);
    }

    var or = function(filters) {
      return logicalOp.call(this, 'or', filters);
    }

    var add = function(filter) {
      this.filters.push(filter);
      return this;
    }

    var single = function(filter) {
      return and([filter]);
    }

    var value = function() {
      return this._inner;
    }

    var paginate = function(limit, offset) {
      this._inner.limit = limit;
      this._inner.offset = offset;
      return this;
    }


    // Public API here
    return {
      and: and,
      or: or,
      add: add,
      single: single,
      value : value
    };
  });

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
      defaultSubmit: function(resource, scope, form, factory) {
        // First we broadcast an event so all fields validate themselves
        scope.$broadcast('schemaFormValidate');

        // Then we check if the form is valid
        if (form.$valid) {
          // ... do whatever you need to do with your data.
          var model = factory.create(scope.model);
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

'use strict';

/**
 * @ngdoc service
 * @name acadSvnApp.HttpInterceptor
 * @description
 * # HttpInterceptor
 * Factory in the acadSvnApp.
 */
angular.module('qualitaCoreFrontend')
  .factory('HttpInterceptor', function ($q, $location, $rootScope,
                                        $cookieStore, $injector) {

    return {
      request: function(config) {

        if($location.path() !== '/login') {
          config.headers.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
        }
        return config;
      },

      requestError: function(rejection) {

        if(rejection.status === 401) {
          $location.path('/login');
        }
        return $q.reject(rejection);
      },


      response: function(response) {
        return response;
      },

      responseError: function(rejection) {

        var notify = $injector.get('notify');

        if(rejection.status === 401) {
          if(rejection.data && rejection.data.code === 403) {
            // error de autorización
            notify({
              message: rejection.data.error,
              classes: ['alert-danger']
            });
            $location.path('/');
            return $q.reject(rejection);
          }

          var deferred = $q.defer();
          var AuthenticationService = $injector.get('AuthenticationService');
          var $http = $injector.get('$http');
          var auth = AuthenticationService.token($rootScope.AuthParams);

          auth.then(function(response) {
            $rootScope.AuthParams.accessToken = response.accessToken;
            localStorage.setItem('AUTH_PARAMS', JSON.stringify($rootScope.AuthParams));
          }).then(deferred.resolve, deferred.reject);

          return deferred.promise.then(function() {
              rejection.config.headers.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
              return $http(rejection.config);
          });
        }
        return $q.reject(rejection);
      }
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name portalApp.ReportTicketFactory
 * @description
 * # ReportTicketFactory
 * Factory in the portalApp.
 */
angular.module('qualitaCoreFrontend')
  .factory('ReportTicketFactory', ['$resource', 'baseurl', function ($resource, baseurl) {
  
    var ReportTicket = $resource(baseurl.getBaseUrl() + '/ticket/:reportID', {action: '@reportID'});

    return {
      ticket: function(reportID, filters) {
        var report = new ReportTicket(filters);
        return report.$save({reportID: reportID});
      },

      downloadURL: function(reportTicket, exportType) {
        console.log('downloadURL');
        return baseurl.getBaseUrl() + '/generar/' + reportTicket + '/' + exportType;
      }
    };
  }]);
'use strict';

/**
 * @ngdoc service
 * @name qualita.usuariosFactory
 * @description
 * # usuariosFactory
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('usuariosFactory', function ($resource, filterFactory, baseurl) {
    // Service logic
    // ...

    var Usuario = $resource(baseurl.getBaseUrl() + '/usuarios/:id', { id: '@id' }, {
      'update': { method: 'PUT' }, // this method issues a PUT request
    });

    // Public API here
    return {
      all: function(params) {
        return Usuario.query(params);
      },

      get: function(id) {
        return Usuario.get({id: id});
      },

      getByUsername: function(username) {
        var params = {};
        params.search = filterFactory.single({
                        path: 'username',
                        equals: username
                      }).value();
        return Usuario.query(params);
      },

      create: function(attrs) {
        return new Usuario(attrs);
      },

      save: function(usuario) {
        return (usuario.id) ? usuario.$update() : usuario.$save();
      },

      remove: function(usuario) {
        return usuario.$remove();
      }/*,

      schema: function() {
        return schema;
      },

      form: function() {
        return form;
      }*/
    };
  });
