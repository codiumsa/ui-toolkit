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
