'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (angular) {
  'use strict';
  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config

  angular.module('ui.config', []).value('ui.config', {
    debug: true
  });

  // Modules
  angular.module('ui.directives', []);
  angular.module('ui.filters', []);
  angular.module('ui.services', []);
  angular.module('ui', ['ui.config', 'ui.directives', 'ui.filters', 'ui.services', 'ngResource', 'ngCookies', 'ngSanitize', 'ngTouch', 'datatables', 'datatables.bootstrap', 'schemaForm', 'pascalprecht.translate', 'cgNotify', 'angular-underscore/filters', 'flow', 'ui.bootstrap', 'ui.select', 'ui.highlight', 'ncy-angular-breadcrumb', 'ui.router', 'oc.lazyLoad', 'ngStorage', 'LocalForageModule', 'datatables.buttons', 'datatables.colreorder', 'daterangepicker', 'rangepicker', 'ngWebSocket', 'pickadate', 'ngAnimate', 'ngMessages', 'ngResource', 'angularSpinner', 'ngTagsInput', 'angular-ladda', 'perfect_scrollbar', 'angular-intro', 'datatables.colreorder', 'ngNotify', 'ngclipboard']);

  angular.module('ui').config(['$provide', function ($provide) {

    $provide.decorator('uibYearpickerDirective', ['$delegate', function ($delegate) {
      var directive = $delegate[0];
      directive.templateUrl = 'views/datepicker/year.html';
      return $delegate;
    }]);

    $provide.decorator('uibMonthpickerDirective', ['$delegate', function ($delegate) {
      var directive = $delegate[0];
      directive.templateUrl = 'views/datepicker/month.html';
      return $delegate;
    }]);

    $provide.decorator('uibDaypickerDirective', ['$delegate', function ($delegate) {
      var directive = $delegate[0];
      directive.templateUrl = 'views/datepicker/day.html';
      return $delegate;
    }]);
  }]);

  angular.module('ui').config(['flowFactoryProvider', 'baseurlProvider', 'CONFIGURATION', function (flowFactoryProvider, baseurlProvider, CONFIGURATION) {
    baseurlProvider.setConfig(CONFIGURATION);
    flowFactoryProvider.defaults = {
      method: 'octet',
      target: baseurlProvider.$get().getBaseUrl() + '/adjuntos'
    };
  }]);

  angular.module('ui').config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider', function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {
    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'customcheckbox', 'views/custom-checkbox.html');
    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'switch', 'views/custom-checkbox-switch.html');

    var datepicker = function datepicker(name, schema, options) {
      if (schema.type === 'string' && (schema.format === 'date' || schema.format === 'date-time')) {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key = options.path;
        f.type = 'datepicker';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    };
    schemaFormProvider.defaults.string.unshift(datepicker);

    //Add to the bootstrap directive
    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'datepicker', 'views/datepicker.html');
    schemaFormDecoratorsProvider.createDirective('datepicker', 'views/datepicker.html');
  }]);
})(angular);
(function () {
  'use strict';

  angular.module('ui').controller('BasicController', ['$rootScope', '$scope', 'formFactory', '$location', '$state', '$injector', function ($rootScope, $scope, formFactory, $location, $state, $injector) {

    $scope.activate = function () {
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

    $scope.submit = function (form) {
      formFactory.defaultSubmit($scope.resource, $scope, form, $scope.factory);
    };

    $scope.cancel = function () {
      $location.path('/' + $scope.resource);
    };
  }]);
})();
(function () {
  'use strict';

  angular.module('ui').directive('aDisabled', function () {
    return {
      compile: function compile(tElement, tAttrs, transclude) {
        //Disable ngClick
        tAttrs['ngClick'] = '!(' + tAttrs['aDisabled'] + ') && (' + tAttrs['ngClick'] + ')';

        //return a link function
        return function (scope, iElement, iAttrs) {

          //Toggle 'disabled' to class when aDisabled becomes true
          scope.$watch(iAttrs['aDisabled'], function (newValue) {
            if (newValue !== undefined) {
              iElement.toggleClass('disabled', newValue);
            }
          });

          //Disable href on click
          iElement.on('click', function (e) {
            if (scope.$eval(iAttrs['aDisabled'])) {
              e.preventDefault();
            }
          });
        };
      }
    };
  });

  angular.module('ui').directive('uiRequired', function () {
    return {
      require: 'ngModel',
      link: function link(scope, elm, attrs, ctrl) {
        ctrl.$validators.required = function (modelValue, viewValue) {
          return !((viewValue && viewValue.length === 0 || false) && attrs.uiRequired === 'true');
        };

        attrs.$observe('uiRequired', function () {
          ctrl.$setValidity('required', !(attrs.uiRequired === 'true' && ctrl.$viewValue && ctrl.$viewValue.length === 0));
        });
      }
    };
  });
})();

(function () {
  angular.module('ui').directive('advancedDatatablesSearch', advancedDatatablesSearch);

  function advancedDatatablesSearch() {
    var directive = {
      restrict: 'E',
      controllerAs: 'vm',
      scope: {
        model: '=',
        options: '=',
        factory: '=',
        disabledBtn: '=',
        multipleSelection: '=?',
        size: '@',
        serializationView: '@',
        style: '@'
      },
      bindToController: true,
      templateUrl: 'views/directives/advanced-datatables-search.html',
      link: linkFunc,
      controller: AdvancedDatatablesSearchController
    };

    function linkFunc(scope, elem, attr) {
      scope.vm.multipleSelection = angular.isDefined(scope.vm.multipleSelection) ? scope.vm.multipleSelection : false;
    }

    return directive;
  }

  AdvancedDatatablesSearchController.$inject = ['$log', '$scope', '$modal', '$state'];
  function AdvancedDatatablesSearchController($log, $scope, $modal, $state) {
    var vm = this;
    if (!vm.size) {
      vm.size = "btn-xs";
    }
    vm.valorScope = "hola";
    vm.pick = pick;
    vm.showSearch = showSearch;
    vm.addAll = addAll;
    if (!vm.multipleSelection) {
      vm.options.extraRowOptions = [{
        templateToRender: "<button class='btn btn-primary' style='margin-right: 5px;' ng-click='pick(<%=dataId%>)'> <span class='glyphicon glyphicon-ok'></span> </button>",
        functionName: "pick",
        functionDef: function functionDef(itemId) {
          vm.pick(itemId);
        }
      }];
    } else {
      if (vm.multipleSelection) {
        vm.options.isSelectable = true;
        vm.options.selection = {};
        vm.options.extraMenuOptions = [{
          'title': "GSDG",
          'icon': 'glyphicon glyphicon-plus',
          'showCondition': function showCondition() {
            return true;
          },
          'action': function action() {
            if (vm.isProcesoImportacion) {
              $state.go("app.importaciones.proceso.ordenescompra.new");
            } else {
              $state.go("app.orden_compra_importacion.new");
            }
          }
        }];
      }
    }
    vm.options.hideAddMenu = true;
    vm.options.hideEditMenu = true;
    vm.options.hideRemoveMenu = true;
    vm.options.hideHeader = true;

    var createFilters = function createFilters(filters) {
      var filtersArr = [];
      _.each(filters, function (search, data) {
        filtersArr.push({ path: data, like: search });
      });
      var filters = filterFactory.and(filtersArr).value();
      return filters;
    };

    activate();

    function activate() {
      vm.modalInstance = undefined;
    }

    function pick(item) {
      vm.model = vm.factory.get(item, vm.serializationView);

      if (vm.modalInstance) {
        vm.modalInstance.close();
      }
    }

    function showSearch() {
      vm.modalInstance = $modal.open({
        templateUrl: 'views/datatables-modal.html',
        scope: $scope,
        size: 'lg'
      });
    }

    function addAll() {
      //convertimos los datos a un array de indicesSelected
      var indicesSelected = _.filter(_.map(vm.options.selection, function (val, idx) {
        return val == true ? parseInt(idx) : false;
      }), function (val) {
        return val;
      });
      vm.model = _.map(indicesSelected, function (idx) {
        return vm.factory.get(idx, vm.serializationView);
      });

      if (vm.modalInstance) {
        vm.modalInstance.close();
      }
    }
  }
})();

(function () {
  'use strict';

  angular.module('ui').value('$datepickerSuppressError', true).directive('pickDate', ['$filter', function ($filter) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ngModel) {
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
})();

(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.directive:fileupload
   * @description
   * # fileupload
   */

  angular.module('ui').directive('fileupload', fileupload);

  fileupload.$inject = ['ngNotify', '$http'];

  function fileupload(ngNotify, $http) {
    return {
      templateUrl: 'views/fileupload.html',
      restrict: 'E',
      tranclude: true,
      scope: {
        /**
         * Objeto de configuración:
         *  - {boolean} singleFile
         *  - {string} method
         *  - {boolean} showFilesSummary
         *  - {string} publicPath
         *  - {Function} onComplete
         *  - {Function} onDelete
         *  - {Function} onDeleteError
         */
        options: '=',
        title: '@',
        ngModel: '=',
        disabled: '='
      },
      link: function postLink(scope, element, attrs) {
        var defaults = {
          singleFile: false,
          method: 'octet',
          showFilesSummary: false
        };
        defaults.target = scope.options.target;
        scope.uploader = {};
        scope.title = attrs.title;
        scope.fileModel = {};

        scope.progressWith = function (progress) {
          return progress * 100 + '%';
        };
        scope.files = [];
        scope.adjuntosBaseURL = scope.options.publicPath;
        scope.options.onDelete = scope.options.onDelete || angular.noop;
        scope.options.onDeleteError = scope.options.onDeleteError || angular.noop;
        scope.fileAdded = fileAdded.bind(scope);
        scope.uploadCompleted = uploadCompleted.bind(scope);
        scope.loadFiles = loadFiles.bind(scope);
        scope.getCurrentFiles = getCurrentFiles.bind(scope);
        scope.getFilename = getFilename.bind(scope);
        scope.remove = remove.bind(scope);
        scope.mimeTypeMap = {
          jpg: 'image/jpg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif'
        };
        scope.preload = false;

        scope.$watch('ngModel', function (newVal) {
          if (newVal && !scope.preload && !scope.ngModelIgnoreSync) {
            scope.preload = true;
            scope.ngModelIgnoreSync = false;
            scope.loadFiles(angular.isArray(scope.ngModel) ? scope.ngModel : [scope.ngModel]);
          }
        });
      }
    };

    function fileAdded(file, event, $flow) {
      // controlamos que no se supere el limite de tamano          
      if (this.options.FILE_UPLOAD_LIMIT && file.size > this.options.FILE_UPLOAD_LIMIT * 1000 * 1000) {
        event.preventDefault();
        ngNotify.set('El tamaño del archivo supera el límite de ' + this.options.FILE_UPLOAD_LIMIT + ' MB.', 'error');
        return false;
      }
      var ext = file.getExtension();
      // si es imagen controlamos que sea alguna de las extensiones permitidas
      if (this.options.imageOnly && ['png', 'gif', 'jpg', 'jpeg'].indexOf(ext) < 0) {
        ngNotify.set('Solo se permiten archivos con extensión: png, gif, jpg o jpeg.', 'error');
        return false;
      }
      // controlamos que el tamanio del nombre no supere 255 caracteres
      if (file.name.length > 255) {
        ngNotify.set('El nombre del archivo supera los 255 caracteres', 'error');
        return false;
      }
    }

    function uploadCompleted(files) {
      ngNotify.set('Archivo cargado correctamente', 'success');
      var files = this.getCurrentFiles(files);

      if (angular.isFunction(this.options.onComplete)) {
        this.options.onComplete(files);
      }
      this.ngModelIgnoreSync = true;
      this.ngModel = files;
    }

    /**
     * Retorna una lista compacta de los archivos cargados correctamente.
     * 
     * @param {object[]} files - FlowFile list
     */
    function getCurrentFiles(flowFiles) {
      var _this2 = this;

      var files = []; // Lista de objetos de tipo { path: '' }

      if (flowFiles.length > 0) {
        angular.forEach(flowFiles, function (file) {
          files.push({
            path: _this2.getFilename(file)
          });
        });
      }
      return files;
    }

    /**
     * Se encarga de cargar en el objeto flow el array de imagenes. Esto es necesario
     * cuando tenemos imagenes que precargar (ya se encuentran en el server)
     **/
    function loadFiles(images) {
      var _this3 = this;

      var flow = this.uploader.flow;
      angular.forEach(images, function (img) {
        var contentType = _this3.mimeTypeMap[img.path.toLowerCase().substring(_.lastIndexOf(img.path, '.') + 1)];
        var blob = new Blob(['pre_existing_image'], { type: contentType });
        blob.name = img.path;
        blob.image_url = _this3.options.publicPath + '/' + img.path;
        var file = new Flow.FlowFile(flow, blob);
        file.fromServer = true;
        flow.files.push(file);
      });
    }

    /**
     * Retorna el nombre del archivo. Esto se corresponde con la logica en el backend para 
     * el generación del nombre final del archivo.
     **/
    function getFilename(file) {

      if (file.fromServer) {
        return file.name;
      }
      var basename = file.size + '-' + file.name;
      basename = basename.replace(/[^a-zA-Z/-_\\.0-9]+/g, '');
      basename = basename.replace(/\s/g, '');
      return basename;
    }

    /**
     * Se encarga de eliminar el archivo en el servidor.
     * 
     * @param {object} file - El archivo a eliminar
     */
    function remove(file) {
      file.cancel();
      var data = { flowFilename: this.getFilename(file) };
      $http.delete(this.options.target, { params: data }).then(this.options.onDelete, this.options.onDeleteError);
    }
  }
})();
(function () {
  'use strict';

  angular.module('ui').directive('focusOn', ['$timeout', function ($timeout) {
    return function (scope, elem, attrs) {
      scope.$on(attrs.focusOn, function (e) {
        $timeout(function () {
          elem[0].focus();
        }, 10);
      });
    };
  }]);
})();

(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.directive:menuBuilder
   * @description
   * # menuBuilder
   */

  angular.module('ui').directive('menuBuilder', ['$timeout', function ($timeout) {
    return {
      templateUrl: 'views/menu-builder.html',
      restrict: 'EA',
      replace: true,
      scope: { options: '=', menu: '=', save: '=' },
      link: function postLink(scope, element, attrs) {
        //scope.menu = {};
        var setLeafs = function setLeafs(nodes) {
          _.each(nodes, function (n) {
            n.data = { estado: n.estado };
            if (n.children) setLeafs(n.children);else n.type = 'leaf';
          });
          return nodes;
        };

        function drawJSTree(treeData) {
          $('#menu-builder').jstree({
            'core': {
              'animation': 0,
              'check_callback': function check_callback(operation, node, parent, position) {
                switch (operation) {
                  case 'move_node':
                    return !parent.parent || parent.original.type !== 'leaf';
                  case 'create_node':
                    return parent.original.type !== 'leaf';
                  case 'rename_node':
                    return node.original.type !== 'leaf';
                  case 'delete_node':
                    return _.isEmpty(node.children) && node.original.type !== 'leaf';
                }
                return false;
              },
              'themes': { 'stripes': true },
              'data': setLeafs(treeData)
            },
            'types': {
              'default': {
                'icon': 'glyphicon glyphicon-record'
              },
              'leaf': {
                'icon': 'glyphicon glyphicon-asterisk'
              }
            },
            'plugins': ['dnd', 'search', 'state', 'types', 'wholerow']
          });
        }

        function nodeRename() {
          var ref = $('#menu-builder').jstree(true),
              sel = ref.get_selected();
          if (!sel.length) {
            return false;
          }
          sel = sel[0];
          //console.log(ref.get_node(sel));
          if (ref.get_node(sel).original.type !== 'leaf') ref.edit(sel);
        }

        $('#menu-builder').delegate("li", "dblclick", function (e) {
          nodeRename();
          return false;
        });

        scope.nodeCreate = function () {
          var ref = $('#menu-builder').jstree(true),
              sel = ref.get_selected();
          if (!sel.length) {
            return false;
          }
          sel = sel[0];
          sel = ref.create_node(sel);
          if (sel) {
            ref.edit(sel);
          }
        };

        scope.nodeDelete = function () {
          var ref = $('#menu-builder').jstree(true),
              sel = ref.get_selected();
          if (!sel.length) {
            return false;
          }
          ref.delete_node(sel);
        };

        scope.getMenu = function () {
          var getMenuNode = function getMenuNode(e) {
            var result = {
              text: e.text,
              estado: e.data.estado
            };

            if (!_.isEmpty(e.children)) {
              result.children = _.map(e.children, function (c) {
                return getMenuNode(c);
              });
            }

            return result;
          };

          var ref = $('#menu-builder').jstree(true);
          var menu = _.map(ref.get_json(), getMenuNode);

          scope.save(menu);
          //scope.menu = menu;
        };

        scope.$watch('menu', function (menu) {
          if (menu) drawJSTree(menu);
        });
      }
    };
  }]);
})();

(function () {
  'use strict';

  angular.module('ui').directive('mmenu', function () {
    return {
      restrict: 'A',
      link: function link(scope, element, attrs) {
        $(element).mmenu({
          "extensions": ["pagedim-black", "effect-listitems-slide", "multiline", "pageshadow"],
          "counters": true,
          "iconPanels": { add: true,
            hideNavbars: true
          },
          "navbar": {
            "title": attrs.navbarTitle
          },
          "navbars": [{
            "position": "top",
            "content": ["searchfield"]
          }, true],
          searchfield: {
            resultsPanel: {
              title: "Resultados",
              add: true },
            placeholder: "Buscar menú",
            noResults: "Sin coincidencias"

          }
        }, {
          searchfield: {
            clear: true
          }
        });
      }
    };
  });
})();
(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name qualita.directive:offlineFormRecovery
   * @description
   * # offlineFormRecovery
   */

  angular.module('ui').directive('offlineFormRecovery', ['$localForage', function ($localForage) {
    return {
      template: '<div class="btn-group" role="group" aria-label="First group">' + '<button ng-disabled="!pending.length || position == 0" type="button" class="glyphicon glyphicon-arrow-left btn btn-default btn-recovery" ng-click="previous()"></button>' + '<button ng-disabled="!pending.length || position == pending.length" type="button" class="glyphicon glyphicon-arrow-right btn btn-default btn-recovery" ng-click="next()"></button>' + '<button ng-disabled="!pending.length || position == 0" type="button" class="glyphicon glyphicon-remove btn btn-default btn-recovery" ng-click="remove()"></button>' + '</div>',
      restrict: 'EA',
      link: function postLink(scope, element, attrs) {
        scope.position = 0;

        if (scope.resource) {
          $localForage.getItem(scope.resource).then(function (value) {
            scope.pending = _(value).filter(function (e) {
              return !e.id;
            }).map(function (e, i) {
              e.index = i;return e;
            }).value();
          });
        } else {
          console.log('scope.resource no definido');
        }

        scope.next = function () {
          scope.position++;
          scope.model = scope.position == 0 ? {} : scope.pending[scope.position - 1];
        };

        scope.previous = function () {
          scope.position--;
          scope.model = scope.position == 0 ? {} : scope.pending[scope.position - 1];
        };

        scope.remove = function () {
          $localForage.getItem(scope.resource).then(function (value) {
            scope.pending = _.filter(value, function (e, i) {
              return i !== scope.position - 1;
            });
            $localForage.setItem(scope.resource, scope.pending);
            scope.previous();
          });
        };
      }
    };
  }]);
})();

(function () {
  'use strict';

  /**
   * Directiva que genera un campo "Generador de contraseñas" 
   */

  angular.module('ui').component('passwordGenerator', {
    templateUrl: 'views/password-generator.html',
    selector: 'passwordGenerator',
    bindings: {
      /**
       * Handler a llamar cuando se genera una contraseña. Recibe como parámetro
       * el password generado.
       */
      afterGenerate: '&'
    },
    controller: PasswordGeneratorCtrl,
    controllerAs: 'vm'
  });

  // lista de caracteres extraído de 
  // https://github.com/rkammer/AngularJS-Password-Generator/blob/master/js/application.js
  var lowerCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var upperCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var symbols = ['!', '"', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'];

  PasswordGeneratorCtrl.$inject = ['$timeout'];

  function PasswordGeneratorCtrl($timeout) {
    var _this4 = this;

    this.$timeout = $timeout;
    this.passwordLength = 10;
    this.generate = generate.bind(this);
    this.onSuccess = onSuccess.bind(this);
    this.showTooltip = showTooltip.bind(this);

    this.$onDestroy = function () {
      if (_this4.clipboardObj) {
        _this4.clipboardObj.destroy();
      }
    };
  }

  function generate() {
    var buffer = lowerCharacters;
    buffer = buffer.concat(this.includeCapitalLetters ? upperCharacters : []).concat(this.includeNumbers ? numbers : []).concat(this.includeSymbols ? symbols : []);
    var len = this.passwordLength;
    var password = '';

    do {
      password += buffer[Math.floor(Math.random() * buffer.length)];
    } while (password.length < len);
    this.model = password;

    if (angular.isFunction(this.afterGenerate)) {
      this.afterGenerate({ password: password });
    }
  }

  function onSuccess(event) {
    event.clearSelection();
    this.showTooltip(event.trigger, 'Copiado!');
  }

  function showTooltip(elem, msg) {
    var classes = elem.className;
    elem.setAttribute('class', classes + ' btn tooltipped tooltipped-s');
    elem.setAttribute('aria-label', msg);
    this.$timeout(function () {
      elem.setAttribute('class', classes);
    }, 1000);
  }
})();
(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.directive:reportViewer
   * @description
   * # reportViewer
   */

  angular.module('ui').directive('reportViewer', ['$modal', '$sce', function ($modal, $sce) {
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

        scope.$watch('url', function () {

          if (scope.url) {
            scope.trustedUrl = $sce.trustAsResourceUrl(scope.url);

            if (!scope.background) {
              scope.modalInstance = $modal.open({
                template: '<div class="modal-header">' + '<div class="close glyphicon glyphicon-remove" ng-click="close()"></div>' + '<h3 class="modal-title">{{title}}</h3>' + '</div>' + '<div class="modal-body">' + '<iframe src="{{trustedUrl}}" width="100%" height="450"></iframe>' + '</div>' + '<div class="modal-footer">' + '<button class="btn btn-primary" ng-click="close()">Cerrar</button>' + '</div>',
                scope: scope
              });
            } else {
              element.append('<iframe src="' + scope.trustedUrl + '" hidden></iframe>');
            }
          }
        });
      }
    };
  }]);
})();
(function () {
  'use strict';

  angular.module('ui').directive('resize', ['$window', function ($window) {
    return {
      link: function link(scope, element, attrs) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
          return { 'h': w.height(), 'w': w.width() };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
          scope.windowHeight = newValue.h;
          scope.windowWidth = newValue.w;

          scope.style = function () {
            return {
              'height': newValue.h + 'px',
              'width': newValue.w + 'px'
            };
          };
          scope.getHeight = function (padding) {
            return {
              'height': newValue.h + padding + 'px'
            };
          };
          scope.getWidth = function (padding) {
            return {
              'width': newValue.w + padding + 'px'
            };
          };
        }, true);

        w.bind('resize', function () {
          scope.$apply();
        });
      }
    };
  }]);
})();

angular.module('ui').run(["$templateCache", function ($templateCache) {

  $templateCache.put("views/directives/uiselect.html", "<div class=\"form-group\"\n" + "     ng-class=\"{'has-error': form.disableErrorState !== true && hasError(), 'has-success': form.disableSuccessState !== true && hasSuccess(), 'has-feedback': form.feedback !== false}\"\n" + "     ng-init=\"selectedOptions=form.titleMap; insideModel=$$value$$;\" ng-controller=\"dynamicSelectController\">\n" + "  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n" + "\n" + "  <div class=\"form-group\">\n" + "    <ui-select ng-model=\"select_model.selected\"\n" + "               ng-if=\"!(form.options.tagging||false)\" theme=\"bootstrap\" ng-disabled=\"form.disabled\"\n" + "               on-select=\"$$value$$=$item.value\" class=\"{{form.options.uiClass}}\">\n" + "      <ui-select-match\n" + "        placeholder=\"{{form.placeholder || form.schema.placeholder || ('' | translate)}}\">\n" + "        {{select_model.selected.name}}\n" + "      </ui-select-match>\n" + "      <ui-select-choices refresh=\"populateTitleMap(form, form.options, $select.search)\"\n" + "                         refresh-delay=\"form.options.refreshDelay\" group-by=\"form.options.groupBy\"\n" + "                         repeat=\"item in form.titleMap | filterRelated: {form: form} | propsFilter: {name: $select.search, description: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS') }\">\n" + "        <div ng-bind-html=\"item.name | highlight: $select.search\"></div>\n" + "        <div ng-if=\"item.description\">\n" + "          <span\n" + "            ng-bind-html=\"'<small>' + (''+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS'))+ '</small>'\"></span>\n" + "        </div>\n" + "      </ui-select-choices>\n" + "    </ui-select>\n" + "    <ui-select ng-model=\"select_model.selected\"\n" + "               ng-if=\"(form.options.tagging||false) && !(form.options.groupBy || false)\"\n" + "               tagging=\"form.options.tagging||false\" tagging-label=\"form.options.taggingLabel\"\n" + "               tagging-tokens=\"form.options.taggingTokens\"\n" + "               theme=\"bootstrap\" ng-disabled=\"form.disabled\" on-select=\"$$value$$=$item.value\"\n" + "               class=\"{{form.options.uiClass}}\">\n" + "      <ui-select-match\n" + "        placeholder=\"{{form.placeholder || form.schema.placeholder || ('' | translate)}}\">\n" + "        {{select_model.selected.name}}&nbsp;\n" + "        <small>{{(select_model.selected.isTag===true ? form.options.taggingLabel : '')}}</small>\n" + "      </ui-select-match>\n" + "      <!--repeat code because tagging does not display properly under group by but is still useful -->\n" + "      <ui-select-choices refresh=\"populateTitleMap(form, form.options, $select.search)\"\n" + "                         refresh-delay=\"form.options.refreshDelay\"\n" + "                         repeat=\"item in form.titleMap | filterRelated: {form: form} | propsFilter: {name: $select.search, description: (form.options.searchDescription===true ? $select.search : 'NOTSEARCHINGFORTHIS') }\">\n" + "        <div ng-if=\"item.isTag\"\n" + "             ng-bind-html=\"'<div>' + (item.name   | highlight: $select.search) + ' ' + form.options.taggingLabel + '</div><div class=&quot;divider&quot;></div>'\"></div>\n" + "        <div ng-if=\"!item.isTag\" ng-bind-html=\"item.name + item.isTag| highlight: $select.search\"></div>\n" + "        <div ng-if=\"item.description\">\n" + "          <span\n" + "            ng-bind-html=\"'<small>' + (''+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS')) + '</small>'\"></span>\n" + "        </div>\n" + "      </ui-select-choices>\n" + "    </ui-select>\n" + "\n" + "    <!--repeat code because tagging does not display properly under group by but is still useful -->\n" + "\n" + "    <ui-select ng-model=\"select_model.selected\"\n" + "               ng-if=\"(form.options.tagging||false) && (form.options.groupBy || false)\"\n" + "               tagging=\"form.options.tagging||false\" tagging-label=\"form.options.taggingLabel\"\n" + "               tagging-tokens=\"form.options.taggingTokens\"\n" + "               theme=\"bootstrap\" ng-disabled=\"form.disabled\" on-select=\"$$value$$=$item.value\"\n" + "               class=\"{{form.options.uiClass}}\">\n" + "      <ui-select-match\n" + "        placeholder=\"{{form.placeholder || form.schema.placeholder || ('' | translate)}}\">\n" + "        {{select_model.selected.name}}&nbsp;\n" + "        <small>{{(select_model.selected.isTag===true ? form.options.taggingLabel : '')}}</small>\n" + "      </ui-select-match>\n" + "      <ui-select-choices group-by=\"form.options.groupBy\"\n" + "                         refresh=\"populateTitleMap(form, form.options, $select.search)\"\n" + "                         refresh-delay=\"form.options.refreshDelay\"\n" + "                         repeat=\"item in form.titleMap | filterRelated: {form: form} | propsFilter: {name: $select.search, description: (form.options.searchDescription===true ? $select.search : 'NOTSEARCHINGFORTHIS') }\">\n" + "        <div ng-if=\"item.isTag\"\n" + "             ng-bind-html=\"'<div>' + (item.name  | highlight: $select.search) + ' ' + form.options.taggingLabel + '</div><div class=&quot;divider&quot;></div>'\"></div>\n" + "        <div ng-if=\"!item.isTag\" ng-bind-html=\"item.name + item.isTag| highlight: $select.search\"></div>\n" + "        <div ng-if=\"item.description\">\n" + "          <span\n" + "            ng-bind-html=\"'<small>' + (''+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS')) + '</small>'\"></span>\n" + "        </div>\n" + "      </ui-select-choices>\n" + "    </ui-select>\n" + "    <input type=\"hidden\" toggle-single-model sf-changed=\"form\" ng-model=\"insideModel\" schema-validate=\"form\"/>\n" + "    <span ng-if=\"form.feedback !== false\"\n" + "          class=\"form-control-feedback\"\n" + "          ng-class=\"evalInScope(form.feedback) || {'glyphicon': true, 'glyphicon-ok': hasSuccess(), 'glyphicon-remove': hasError() }\"></span>\n" + "\n" + "    <div class=\"help-block\"\n" + "         ng-show=\"(hasError() && errorMessage(schemaError())) || form.description\"\n" + "         ng-bind-html=\"(hasError() && errorMessage(schemaError())) || form.description\"></div>\n" + "  </div>\n" + "</div>\n");

  $templateCache.put('ngTagsInput/tags-input.html', "<div class=\"host\" tabindex=\"-1\" ng-click=\"eventHandlers.host.click()\" ti-transclude-append><div class=\"tags\" ng-class=\"{focused: hasFocus}\"><ul class=\"tag-list\"><li class=\"tag-item\" ng-repeat=\"tag in tagList.items track by track(tag)\" ng-class=\"{ selected: tag == tagList.selected }\" ng-click=\"eventHandlers.tag.click(tag)\"><ti-tag-item data=\"::tag\"></ti-tag-item></li></ul><input class=\"tag-input-text input\" autocomplete=\"off\" ng-model=\"newTag.text\" ng-model-options=\"{getterSetter: true}\" ng-keydown=\"eventHandlers.input.keydown($event)\" ng-focus=\"eventHandlers.input.focus($event)\" ng-blur=\"eventHandlers.input.blur($event)\" ng-paste=\"eventHandlers.input.paste($event)\" ng-trim=\"false\" ng-class=\"{'invalid-tag': newTag.invalid}\" ng-disabled=\"disabled\" ti-bind-attrs=\"{type: options.type, tabindex: options.tabindex, spellcheck: options.spellcheck}\" ti-autosize></div></div>");

  $templateCache.put('ngTagsInput/tag-item.html', "<span ng-bind=\"$getDisplayText()\"></span> <span class=\"remove-button close ui-select-match-close\" ng-click=\"$removeTag()\" ng-bind=\"::$$removeTagSymbol\"></span>");

  $templateCache.put('ngTagsInput/auto-complete.html', "<div class=\"autocomplete\" ng-if=\"suggestionList.visible\"><ul class=\"suggestion-list\"><li class=\"suggestion-item\" ng-repeat=\"item in suggestionList.items track by track(item)\" ng-class=\"{selected: item == suggestionList.selected}\" ng-click=\"addSuggestionByIndex($index)\" ng-mouseenter=\"suggestionList.select($index)\"><ti-autocomplete-match data=\"::item\"></ti-autocomplete-match></li></ul></div>");

  $templateCache.put('ngTagsInput/auto-complete-match.html', "<span ng-bind-html=\"$highlight($getDisplayText())\"></span>");

  $templateCache.put("bootstrap/select-multiple.tpl.html", "<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control\" ng-class=\"{open: $select.open}\"><div><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-hide=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" role=\"combobox\" aria-label=\"{{ $select.baseTitle }}\" ondrop=\"return false;\"></div><div class=\"ui-select-choices\"></div></div>");
  $templateCache.put("bootstrap/select.tpl.html", "<div class=\"ui-select-container ui-select-bootstrap dropdown\" ng-class=\"{open: $select.open}\"><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" aria-activedescendant=\"ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}\" class=\"form-control ui-select-search ui-select-search-single\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.searchEnabled && $select.open\"><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");
}]);

angular.module('ui').config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider', function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {

  var select = function select(name, schema, options) {
    if (schema.type === 'string' && "enum" in schema) {
      var f = schemaFormProvider.stdFormObj(name, schema, options);
      f.key = options.path;
      f.type = 'strapselect';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  schemaFormProvider.defaults.string.unshift(select);

  //Add to the bootstrap directive
  schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapselect', 'views/directives/strapselect.html');
  schemaFormDecoratorsProvider.createDirective('strapselect', 'views/directives/strapselect.html');

  schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapmultiselect', 'views/directives/strapmultiselect.html');
  schemaFormDecoratorsProvider.createDirective('strapmultiselect', 'views/directives/strapmultiselect.html');

  schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapselectdynamic', 'views/directives/strapselect.html');
  schemaFormDecoratorsProvider.createDirective('strapselectdynamic', 'views/directives/strapselect.html');

  schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'strapmultiselectdynamic', 'views/directives/strapmultiselect.html');
  schemaFormDecoratorsProvider.createDirective('strapmultiselectdynamic', 'views/directives/strapmultiselect.html');

  // UI SELECT
  //Add to the bootstrap directive
  schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'uiselect', 'views/directives/uiselect.html');

  schemaFormDecoratorsProvider.createDirective('uiselect', 'views/directives/uiselect.html');

  schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'uiselectmultiple', 'views/directives/uiselectmultiple.html');

  schemaFormDecoratorsProvider.createDirective('uiselectmultiple', 'views/directives/uiselectmultiple.html');
}]).directive("toggleSingleModel", function () {
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
}).directive("toggleModel", function () {
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
        if (!$scope.$parent.form.selectedOptions) {} else if ($scope.$parent.form.selectedOptions.length == 0) {

          if ($scope.$parent.ngModel.$viewValue != undefined) {
            $scope.$parent.ngModel.$setViewValue($scope.$parent.form.selectedOptions);
          }
        } else {
          $scope.$parent.$$value$$ = [];
          $scope.$parent.form.selectedOptions.forEach(function (item) {
            $scope.$parent.$$value$$.push(item.value);
          });
          $scope.$parent.ngModel.$setViewValue($scope.$parent.$$value$$);
        }
      }, true);
    }]
  };
}).directive('multipleOn', function () {
  return {
    link: function link($scope, $element, $attrs) {
      $scope.$watch(function () {
        return $element.attr('multiple-on');
      }, function (newVal) {

        if (newVal == "true") {
          var select_scope = angular.element($element).scope().$$childTail;
          select_scope.$isMultiple = true;
          select_scope.options.multiple = true;
          select_scope.$select.$element.addClass('select-multiple');
        } else {
          angular.element($element).scope().$$childTail.$isMultiple = false;
        }
      });
    }
  };
}).filter('whereMulti', function () {
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
}).filter('propsFilter', function () {
  return function (items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function (item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          if (item && item.hasOwnProperty(prop)) {
            //only match if this property is actually in the item to avoid
            var text = props[prop].toLowerCase();
            //search for either a space before the text or the textg at the start of the string so that the middle of words are not matched
            if (item[prop] && (item[prop].toString().toLowerCase().indexOf(text) === 0 || item[prop].toString().toLowerCase().indexOf(' ' + text) !== -1)) {
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

  return function (items, props) {
    if (typeof props.form.options.filterRelated === 'function') {
      return props.form.options.filterRelated(items);
    }
    return items;
  };
});

angular.module('ui').controller('dynamicSelectController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

  $scope.select_model = {};

  $scope.triggerTitleMap = function () {
    console.log("listener triggered");
    // Ugly workaround to trigger titleMap expression re-evaluation so that the selectFilter it reapplied.
    $scope.form.titleMap.push({ "value": "345890u340598u3405u9", "name": "34095u3p4ouij" });
    $timeout(function () {
      $scope.form.titleMap.pop();
    });
  };

  $scope.initFiltering = function (localModel) {
    if ($scope.form.options.filterTriggers) {
      $scope.form.options.filterTriggers.forEach(function (trigger) {
        $scope.$parent.$watch(trigger, $scope.triggerTitleMap);
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
        return [{ value: undefined, name: $scope.form.placeholder }].concat(data);
      }

      var isEdit = false;
      for (var i = 0; i < data.length; i++) {
        if (data[i][map.valueProperty] === model[map.valueProperty]) {
          isEdit = true;
          break;
        }
      }
      var tmp = data[0];
      data[0] = data[i];
      data[i] = tmp;

      if (isEdit) {
        $scope.select_model.selected = data[0];
      }
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
    $scope.select_model.selected = { value: model, name: model };
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
    } else {
      data.forEach(function (item) {
        if ("text" in item) {
          item.name = item.text;
        }
      });
      return data;
    }
  };

  $scope.clone = function (obj) {
    if (null == obj || "object" != (typeof obj === 'undefined' ? 'undefined' : _typeof(obj))) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = $scope.clone(obj[attr]);
    }
    return copy;
  };

  $scope.getCallback = function (callback, name) {
    if (typeof callback == "string") {
      var _result = $scope.$parent.evalExpr(callback);
      if (typeof _result == "function") {
        return _result;
      } else {
        throw "A callback string must match name of a function in the parent scope";
      }
    } else if (typeof callback == "function") {
      return callback;
    } else {
      throw "A callback must either be a string matching the name of a function in the parent scope or a " + "direct function reference";
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
    } else {
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
        form.titleMap.push({ "value": item, "name": item });
      });
      initEnumSelection(form.titleMap, form.options);
    } /* else if (form.titleMap) {
      console.log("dynamicSelectController.populateTitleMap(key:" + form.key + ") : There is already a titleMap");
      }*/
    else if (!form.options) {

        console.log("dynamicSelectController.populateTitleMap(key:" + form.key + ") : No options set, needed for dynamic selects");
      } else if (form.options.callback) {
        form.titleMap = $scope.getCallback(form.options.callback)(form.options);
        console.log('callback items', form.titleMap);
      } else if (form.options.asyncCallback) {
        return $scope.getCallback(form.options.asyncCallback)(form.options).then(function (_data) {
          form.titleMap = $scope.remap(form.options, _data.data);

          if (form.options.multiple) {
            $scope.uiMultiSelectInitInternalModel(getModel(form.options));
          } else {
            //$scope.select_model.selected = form.titleMap[0];
          }
          console.log('asyncCallback items', form.titleMap);
        }, function (data, status) {
          alert("Loading select items failed(Options: '" + String(form.options) + "\nError: " + status);
        });
      } else if (form.options.httpPost) {
        var finalOptions = $scope.getOptions(form.options);

        return $http.post(finalOptions.httpPost.url, finalOptions.httpPost.parameter).then(function (_data) {

          form.titleMap = $scope.remap(finalOptions, _data.data);
          console.log('httpPost items', form.titleMap);
        }, function (data, status) {
          alert("Loading select items failed (URL: '" + String(finalOptions.httpPost.url) + "' Parameter: " + String(finalOptions.httpPost.parameter) + "\nError: " + status);
        });
      } else if (form.options.httpGet) {
        var finalOptions = $scope.getOptions(form.options);
        return $http.get(finalOptions.httpGet.url, finalOptions.httpGet.parameter).then(function (data) {
          form.titleMap = $scope.remap(finalOptions, data.data);
          console.log('httpGet items', form.titleMap);
        }, function (data, status) {
          alert("Loading select items failed (URL: '" + String(finalOptions.httpGet.url) + "\nError: " + status);
        });
      }
  };
  $scope.uiMultiSelectInitInternalModel = function (_model) {

    function find_in_titleMap(value) {
      for (i = 0; i < $scope.form.titleMap.length; i++) {
        if ($scope.form.titleMap[i].value == value) {
          return $scope.form.titleMap[i].name;
        }
      }
    }

    $scope.internalModel = [];

    if (_model !== undefined && angular.isArray(_model)) {
      _model.forEach(function (value) {
        $scope.internalModel.push({ "value": value, "name": find_in_titleMap(value) });
      });
    }
  };
}]);

angular.module('ui').filter('selectFilter', [function ($filter) {
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
      console.log("Compare: curr_item: " + JSON.stringify(curr_item) + "with : " + JSON.stringify(controller.$eval(controller.form.options.filterTriggers[0])));
      if (controller.$eval(controller.form.options.filter, { item: curr_item })) {
        data.push(curr_item);
      } else if (localModel) {
        // If not in list, also remove the set value

        if (controller.localModelType == "[object Array]" && localModel.indexOf(curr_item.value) > -1) {
          localModel.splice(localModel.indexOf(curr_item.value), 1);
        } else if (localModel == curr_item.value) {
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

(function () {
  'use strict';

  /**
   * AngularJS Module for pop up timepicker
   */

  angular.module('ui').factory('timepickerState', function () {
    var pickers = [];
    return {
      addPicker: function addPicker(picker) {
        pickers.push(picker);
      },
      closeAll: function closeAll() {
        for (var i = 0; i < pickers.length; i++) {
          pickers[i].close();
        }
      }
    };
  }).directive('timeFormat', ['$filter', function ($filter) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        showMeridian: '='
      },
      link: function link(scope, element, attrs, ngModel) {
        var parseTime = function parseTime(viewValue) {

          if (!viewValue) {
            ngModel.$setValidity('time', true);
            return null;
          } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
            ngModel.$setValidity('time', true);
            return viewValue;
          } else if (angular.isString(viewValue)) {
            var timeRegex = /^(0?[0-9]|1[0-2]):[0-5][0-9] ?[a|p]m$/i;
            if (!scope.showMeridian) {
              timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            }
            if (!timeRegex.test(viewValue)) {
              ngModel.$setValidity('time', false);
              return undefined;
            } else {
              ngModel.$setValidity('time', true);
              var date = new Date();
              var sp = viewValue.split(":");
              var apm = sp[1].match(/[a|p]m/i);
              if (apm) {
                sp[1] = sp[1].replace(/[a|p]m/i, '');
                if (apm[0].toLowerCase() == 'pm') {
                  sp[0] = sp[0] + 12;
                }
              }
              date.setHours(sp[0], sp[1]);
              return date;
            };
          } else {
            ngModel.$setValidity('time', false);
            return undefined;
          };
        };

        ngModel.$parsers.push(parseTime);

        var showTime = function showTime(data) {
          parseTime(data);
          var timeFormat = !scope.showMeridian ? "HH:mm" : "hh:mm a";
          return $filter('date')(data, timeFormat);
        };
        ngModel.$formatters.push(showTime);
        scope.$watch('showMeridian', function (value) {
          var myTime = ngModel.$modelValue;
          if (myTime) {
            element.val(showTime(myTime));
          }
        });
      }
    };
  }]).directive('timepickerPop', ['$document', 'timepickerState', function ($document, timepickerState) {
    return {
      restrict: 'E',
      transclude: false,
      scope: {
        inputTime: '=',
        showMeridian: '=',
        disabled: '='
      },
      controller: function controller($scope, $element) {
        $scope.isOpen = false;
        $scope.disabledInt = angular.isUndefined($scope.disabled) ? false : $scope.disabled;
        $scope.toggle = function () {
          if ($scope.isOpen) {
            $scope.close();
          } else {
            $scope.open();
          }
        };
      },
      link: function link(scope, element, attrs) {
        var picker = {
          open: function open() {
            timepickerState.closeAll();
            scope.isOpen = true;
          },
          close: function close() {
            scope.isOpen = false;
          }

        };
        timepickerState.addPicker(picker);

        scope.open = picker.open;
        scope.close = picker.close;

        scope.$watch("disabled", function (value) {
          scope.disabledInt = angular.isUndefined(scope.disabled) ? false : scope.disabled;
        });

        scope.$watch("inputTime", function (value) {
          if (!scope.inputTime) {
            element.addClass('has-error');
          } else {
            element.removeClass('has-error');
          }
        });

        element.bind('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
        });

        $document.bind('click', function (event) {
          scope.$apply(function () {
            scope.isOpen = false;
          });
        });
      },
      template: "<input type='text' class='form-control' ng-model='inputTime' ng-disabled='disabledInt' time-format show-meridian='showMeridian' ng-focus='open()' />" + "  <div class='input-group-btn' ng-class='{open:isOpen}'> " + "    <button type='button' ng-disabled='disabledInt' class='btn btn-default form-control' ng-class=\"{'btn-primary':isOpen}\" data-toggle='dropdown' ng-click='toggle()'> " + "        <i class='glyphicon glyphicon-time'></i></button> " + "          <div class='dropdown-menu pull-right'> " + "            <timepicker ng-model='inputTime' show-meridian='showMeridian' style='margin-left: 15%;'></timepicker> " + "           </div> " + "  </div>"
    };
  }]);
})();
(function () {
  'use strict';

  /**
   * Wrapper simple para bootstrap-toggle. El wrapper acepta las configuraciones
   * de bootstrap-toggle.
   * 
   * @ngdoc directive
   * @name ui.directive:uiCheckbox
   * @description
   * # uiCheckbox
   */

  angular.module('ui').directive('uiCheckbox', uiCheckbox);

  uiCheckbox.$inject = ['$compile', '$timeout'];

  function uiCheckbox($compile, $timeout) {
    return {
      restrict: 'A',
      scope: true,
      require: 'ngModel',
      link: function link(scope, element, attrs, ngModel) {
        if ($(element).attr('type') !== 'checkbox') {
          console.warn('ui-checkbox solamente se usa en inputs de tipo checkbox');
          return;
        }

        $(element).removeAttr('ui-checkbox');
        var newElement = $compile(element)(scope.$parent)[0];
        $(element).replaceWith(newElement);

        $timeout(function () {
          return $(newElement).bootstrapToggle().change(changeHandler);
        });
        var initialized = false;
        var disabled = false;

        scope.$watch(attrs.ngModel, function (value) {
          if (initialized || value === undefined) {
            return;
          }
          initialized = true;
          $(newElement).bootstrapToggle('on');

          if (disabled) {
            $(newElement).bootstrapToggle('disable');
          }
        });

        scope.$watch(attrs.isDisabled, function (value) {
          if (value === undefined) {
            return;
          }

          if (initialized) {
            $(newElement).bootstrapToggle(!value ? 'enable' : 'disable');
          } else {
            disabled = value;
          }
        });

        // actualizamos el ngModel cuando cambia el valor del checkbox
        function changeHandler() {
          var checked = $(this).prop('checked');
          ngModel.$setViewValue(checked);
        }
      }
    };
  }
})();
(function () {
  'use strict';
  /**
   * @ngdoc directive
   * @name ui.directive:uiDatatable
   * @description
   * # uiDatatable
   */

  angular.module('ui').directive('uiDatatable', ['$timeout', '$uibModal', '$compile', '$state', '$resource', 'DTOptionsBuilder', 'DTColumnBuilder', 'baseurl', '$rootScope', '$injector', function ($timeout, $modal, $compile, $state, $resource, DTOptionsBuilder, DTColumnBuilder, baseurl, $rootScope, $injector) {

    return {
      template: '<div>' + '<div class="widget">' + '<div class="widget-header bordered-top bordered-palegreen" ng-if="!options.hideHeader">' + '<span class="widget-caption">{{options.title}}</span>' + '<div class="widget-buttons">' + '<a href="" ng-show="canCreate()" ng-click="new()" title="Nuevo">' + '<i class="glyphicon glyphicon-plus"></i>' + '</a>' + '<a ng-repeat="menuOption in options.extraMenuOptions" href="" ng-show="menuOption.showCondition()" ng-click="menuOption.action()" title="{{menuOption.title}}">' + '<p><i class="{{menuOption.icon}}"></i>' + '  {{menuOption.data}}&nbsp;&nbsp;&nbsp;</p>' + '</a>' + '</div>' + '</div>' + '<div class="widget-body">' + '<div class="table-responsive">' + '<table datatable="" dt-options="dtOptions" dt-columns="dtColumns" dt-instance="dtInstanceCallback" width=100% class="table table-hover table-responsive table-condensed no-footer">' + '</table>' + '</div>' + '<div ng-if="selected">' + '<h3>Detalles</h3>' + '<table class="table table-striped table-bordered table-detail">' + '<tbody>' + '<tr ng-repeat="row in options.detailRows">' + '<td ng-if="selected[row.data]" class="row-title">{{row.title}}</td>' + '<td ng-if="selected[row.data] && row.renderWith">{{row.renderWith(selected[row.data])}}</td>' + '<td ng-if="selected[row.data] && !row.renderWith">{{selected[row.data]}}</td>' + '</tr>' + '</tbody>' + '</table>' + '</div>' + '</div>' + '</div>',
      restrict: 'AE',
      replace: true,
      scope: {
        options: '='
      },
      controller: function controller($scope, $element) {
        var actionsColumn, selectionColumn, urlTemplate;
        // Se arma la ruta según tenga o no filtros estáticos
        updateStaticFilters();

        $scope.dtInstance = {};
        $scope.selectAll = false;
        $scope.options.selection = {};

        $scope.headerCompiled = false;
        $scope.customFilters = {};

        function defaultCondition() {
          return true;
        }
        $scope.options.canEditCondition = $scope.options.canEditCondition || defaultCondition;
        $scope.options.canCreateCondition = $scope.options.canCreateCondition || defaultCondition;
        $scope.options.canRemoveCondition = $scope.options.canRemoveCondition || defaultCondition;
        $scope.options.canListCondition = $scope.options.canListCondition || defaultCondition;
        var rangeSeparator = "~";
        var dateFormat = "DD/MM/YYYY";
        var defaultFilterType = 'string';
        var table;
        var tableId;

        var ajaxRequest = function ajaxRequest(data, callback) {

          if (table) {
            $scope.options.tableAjaxParams = table.ajax.params();

            _.forEach(table.colReorder.order(), function (columnIndex, index) {
              if ($scope.customFilters[columnIndex]) {
                data.columns[index]['type'] = $scope.customFilters[columnIndex].filterType;
              } else {
                data.columns[index]['type'] = defaultFilterType;
              }
            });
          }
          data.rangeSeparator = rangeSeparator;
          data.columns = _.filter(data.columns, function (c) {
            return !!c.data;
          });
          var reqBody = null;

          if ($scope.options.staticFilter) {
            reqBody = $scope.options.staticFilter;
          }
          var xhr = $resource(urlTemplate($scope.options), data, {
            query: {
              isArray: false,
              method: 'POST'
            }
          });

          xhr.query(reqBody).$promise.then(function (response) {
            var datos = response.data;
            if (datos) {
              datos.forEach(function (registro) {
                Object.keys(registro).forEach(function (key) {
                  if (registro[key] === true) {
                    registro[key] = "Sí";
                  } else if (registro[key] === false) {
                    registro[key] = "No";
                  }
                });
              });
            }
            callback(response);
          }).catch(function (response) {
            console.log(response);
          });
        };
        var ajaxConfig = $scope.options.ajax ? $scope.options.ajax : ajaxRequest;

        //modelos de los filtros de rangos de fechas
        $scope.dateRangeFilters = {
          'i': {
            startDate: null,
            endDate: null
          }
        };

        //callback para el boton apply en el widget de rango de fechas
        var datePickerApplyEvent = function datePickerApplyEvent(ev, picker) {
          var ini = ev.model.startDate.format(dateFormat);
          var end = ev.model.endDate.format(dateFormat);

          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search(ini + rangeSeparator + end).draw();
        };

        //callback para el boton cancel en el widget de rango de fechas, que borra el filtro
        var datePickerCancelEvent = function datePickerCancelEvent(ev, picker) {
          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search("").draw();
          $("#daterange_" + ev.opts.index).val("");
          $scope.dateRangeFilters[ev.opts.index].startDate = null;
          $scope.dateRangeFilters[ev.opts.index].endDate = null;
        };

        //callback para borrar el rango previamente seleccionado
        var datePickerShowEvent = function datePickerShowEvent(ev, picker) {

          if ($scope.dateRangeFilters[ev.opts.index].startDate === null) {
            var widgetIndex = $scope.dateRangePickerWidgetsOrder.indexOf(ev.opts.index);
            var widget = $($(".daterangepicker").get(widgetIndex));
            widget.parent().find('.in-range').removeClass("in-range");
            widget.parent().find('.active').removeClass("active");
            widget.parent().find('.input-mini').removeClass("active").val("");
          }
        };

        moment.locale('es');
        var dateRangeLocaleOptions = {
          cancelLabel: 'Limpiar',
          applyLabel: 'Aplicar',
          format: dateFormat,
          separator: ' a ',
          weekLabel: 'S',
          daysOfWeek: moment.weekdaysMin(),
          monthNames: moment.monthsShort(),
          firstDay: moment.localeData().firstDayOfWeek()
        };

        $scope.dateRangeOptions = {};

        var dateRangeDefaultOptions = {
          eventHandlers: {
            'apply.daterangepicker': datePickerApplyEvent,
            'cancel.daterangepicker': datePickerCancelEvent,
            'show.daterangepicker': datePickerShowEvent
          },
          opens: "right",
          index: 0,
          showDropdowns: true,
          locale: dateRangeLocaleOptions
        };

        $scope.dateRangePickerWidgetsOrder = [];

        //modelos del filtro de rango numericos
        $scope.numberRangeFilters = {
          'i': {
            startRange: null,
            endRange: null
          }
        };

        //callback para el boton apply en el widget de rango de numeros
        var rangePickerApplyEvent = function rangePickerApplyEvent(ev, picker) {
          //console.log("apply");
          var ini = ev.model.startRange;
          var end = ev.model.endRange;

          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search(ini + rangeSeparator + end).draw();
        };

        //callback para el boton cancel en el widget de rango de numeros, que borra el filtro
        var rangePickerCancelEvent = function rangePickerCancelEvent(ev, picker) {
          //console.log("cancel");
          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search("").draw();
          $("#numberrange_" + ev.opts.index).val("");
          $scope.numberRangeFilters[ev.opts.index].startRange = null;
          $scope.numberRangeFilters[ev.opts.index].endRange = null;

          var widgetIndex = $scope.rangePickerWidgetsOrder.indexOf(ev.opts.index);
          var widget = $($(".rangepicker").get(widgetIndex));
          widget.parent().find('input[name=rangepicker_start]').val();
          widget.parent().find('input[name=rangepicker_end]').val();
        };

        var rangeLocaleOptions = {
          cancelLabel: 'Limpiar',
          applyLabel: 'Aplicar',
          separator: ' a '
        };

        $scope.rangeOptions = {};

        var rangeDefaultOptions = {
          eventHandlers: {
            'apply.rangepicker': rangePickerApplyEvent,
            'cancel.rangepicker': rangePickerCancelEvent
          },
          opens: "right",
          index: 0,
          showDropdowns: true,
          locale: rangeLocaleOptions
        };

        $scope.rangePickerWidgetsOrder = [];

        $scope.dtOptions = DTOptionsBuilder.newOptions().withDataProp('data').withOption('language', {
          'sProcessing': 'Procesando...',
          'sLengthMenu': 'Registros _MENU_',
          'sZeroRecords': 'No se encontraron resultados',
          'sEmptyTable': 'Ningún dato disponible en esta tabla',
          'sInfo': 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
          'sInfoEmpty': 'Mostrando registros del 0 al 0 de un total de 0 registros',
          'sInfoFiltered': '(filtrado de un total de _MAX_ registros)',
          'sInfoPostFix': '.',
          'sSearch': 'Buscar:',
          'sInfoThousands': ',',
          'sLoadingRecords': 'Cargando...',
          'oPaginate': {
            'sFirst': 'Primero',
            'sLast': 'Último',
            'sNext': 'Siguiente',
            'sPrevious': 'Anterior'
          },
          'oAria': {
            'sSortAscending': ': Activar para ordenar la columna de manera ascendente',
            'sSortDescending': ': Activar para ordenar la columna de manera descendente'
          }
        }).withOption('createdRow', function (row, data, dataIndex) {
          $compile(angular.element(row).contents())($scope);
        }).withOption('headerCallback', function (header) {
          if (!$scope.headerCompiled) {
            // Use this headerCompiled field to only compile header once
            $scope.headerCompiled = true;
            $compile(angular.element(header).contents())($scope);
          }
        }).withPaginationType('full_numbers').withButtons(['colvis']).withBootstrap();

        if ($scope.options.resource === '@') {
          // @ indica que es los datos para el datatable son locales
          $scope.dtOptions.withOption('data', $scope.options.factory.all());
        } else {
          $scope.dtOptions.withOption('ajax', ajaxConfig);
          $scope.dtOptions.withOption('serverSide', true);
          $scope.dtOptions.withOption('processing', true);
        }

        if ($scope.options.detailRows) {
          $scope.dtOptions = $scope.dtOptions.withOption('rowCallback', rowCallback);
        }

        //inicializan la cantidad de columnas visibles
        $scope.visibleColumns = 0; //$scope.options.columns.length;

        $scope.dtColumns = [];
        //indices
        $scope.defaultColumnOrderIndices = [];
        $scope.originalIndexKey = {};

        //si tiene checkboxes para seleccion
        var indexPadding = 0;
        if ($scope.options.isSelectable) {

          var titleHtml = '<label><input type="checkbox" ng-model="selectAll" ng-click="toggleAll()"><span class="text"></span></label>';

          selectionColumn = DTColumnBuilder.newColumn(null).withTitle(titleHtml).notSortable().withOption('searchable', false).renderWith(function (data, type, full, meta) {
            var checkbox = '<label>' + '<input id="' + data.id + '" type="checkbox" ng-model="options.selection[' + data.id + ']" ng-click="toggleOne()">' + '<span class="text"></span></label>';
            return checkbox;
          }).withOption('name', 'checkbox');

          $scope.dtColumns.push(selectionColumn);
          $scope.visibleColumns += 1;
          indexPadding = 1;
          $scope.originalIndexKey[0] = null; //'checkbox';
          $scope.defaultColumnOrderIndices.push(0);
          $scope.dtOptions.withColReorderOption('iFixedColumnsLeft', 1);
        }

        /* RENDERS BASICOS */
        var dateRender = function dateRender(dateFormat) {
          return function (data) {
            //return moment.utc(data).format(dateFormat);
            return moment(data).format(dateFormat);
          };
        };

        var emptyRender = function emptyRender(data) {
          if (data == undefined) return "";else return data;
        };

        var numberRender = function numberRender(data) {
          if (data) return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");else return '';
        };

        var monedaRender = function monedaRender(pathAtt) {
          return function (data, type, row) {
            if (data) {
              var moneda = "Gs. ";
              if (row[pathAtt] === 'dolares') {
                moneda = "Usd. ";
                data = parseFloat(data).toFixed(2);
              } else if (row[pathAtt] === 'pesos') {
                moneda = "Pes. ";
                data = parseFloat(data).toFixed(2);
              } else if (row[pathAtt] === 'real') {
                moneda = "Rel. ";
                data = parseFloat(data).toFixed(2);
              } else if (row[pathAtt] === 'euro') {
                moneda = "Eur. ";
                data = parseFloat(data).toFixed(2);
              }
              return moneda + data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else return "";
          };
        };

        var commonAttrs = ['data', 'title', 'class', 'renderWith', 'visible', 'sortable', 'searchable'];
        _.map($scope.options.columns, function (c, index) {

          var column = DTColumnBuilder.newColumn(c.data);
          //el indice original para la columna
          var originalIndex = indexPadding + index;
          $scope.originalIndexKey[originalIndex] = c.data;

          if (c.title) column = column.withTitle(c.title);
          if (c.class) column = column.withClass(c.class);
          if (c.renderWith) {
            if (c.renderWith === 'dateRender') column = column.renderWith(dateRender(c.dateFormat));else if (c.renderWith === 'emptyRender') column = column.renderWith(emptyRender);else if (c.renderWith === 'numberRender') column = column.renderWith(numberRender);else if (c.renderWith === 'monedaRender') column = column.renderWith(monedaRender(c.pathAttMoneda));else column = column.renderWith(c.renderWith);
          }
          if (c.sortable === false) column = column.notSortable();

          //si hay un orden definido y no está dentro de ese orden o si especifica que no es visible
          if (!_.contains($scope.options.defaultColumnOrder, c.data) || c.visible === false) column = column.notVisible();else $scope.visibleColumns += 1;

          _.forOwn(c, function (value, key) {
            if (!_.contains(commonAttrs, key)) column = column.withOption(key, value);
          });

          if (c.searchable === false) {
            column = column.withOption('bSearchable', false);
          } else {
            column = column.withOption('bSearchable', true);
          }

          if (c.type) {
            var customFilter = { 'filterType': c.type, 'filterUrl': c.filterUrl };

            if (c.type === 'date-range') {
              $scope.dateRangeFilters[originalIndex] = { startDate: null, endDate: null };
            } else if (c.type === 'number-range') {
              $scope.numberRangeFilters[originalIndex] = { startRange: null, endRange: null };
            }

            $scope.customFilters[originalIndex] = customFilter;
          }
          $scope.dtColumns.push(column);
        });

        //console.log($scope.dtColumns);
        if ($scope.options.hasOptions) {
          $scope.originalIndexKey[$scope.visibleColumns] = null; //'actions';
          // Fix last right column
          $scope.dtOptions.withColReorderOption('iFixedColumnsRight', 1);
          $scope.visibleColumns += 1;
        }

        //columnas reordenables, por defecto habilitado
        if ($scope.options.colReorder === true || $scope.options.colReorder === undefined) {
          $scope.dtOptions.withColReorder();
        }

        actionsColumn = DTColumnBuilder.newColumn(null).withTitle('Operaciones').notSortable().withOption('searchable', false).renderWith(function (data, type, full, meta) {
          var basicOpts = '<button class="btn-row-datatable btn btn-success btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canEdit(' + data.id + ')}" ng-click="edit(' + data.id + ', $event)">' + '   <span class="glyphicon glyphicon-pencil"></span>' + '</button>' + '<button class="btn-row-datatable btn btn-danger btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canRemove(' + data.id + ')}" ng-click="remove(' + data.id + ', $event)">' + '   <span class="glyphicon glyphicon-trash"></span>' + '</button>' + '<button class="btn-row-datatable btn btn-info btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canList(' + data.id + ')}" ng-click="view(' + data.id + ', $event)">' + '   <span class="glyphicon glyphicon-eye-open"></span>' + '</button>';
          if ($scope.options.extraRowOptions) {
            _.forEach($scope.options.extraRowOptions, function (menuOpt) {
              var compilado = _.template(menuOpt.templateToRender);
              $scope[menuOpt.functionName] = menuOpt.functionDef;
              var customAttribute = menuOpt.customAttribute;
              var compiled = { 'dataId': data.id, '$state': $state, '$scope': $scope };
              if (customAttribute && customAttribute.constructor === Array) {
                compiled.dataCustom = JSON.stringify(_.map(customAttribute, function (ca) {
                  return data[ca];
                }));
              } else {
                compiled.dataCustom = JSON.stringify(data[menuOpt.customAttribute]);
              }
              basicOpts = basicOpts + compilado(compiled);
              $scope[menuOpt.conditionName] = menuOpt.conditionDef;
              $scope.currentRowData = data;
            });
          }
          return basicOpts;
        });

        $scope.canEdit = function (data) {
          return $scope.options.canEditCondition(data) && !$scope.options.hideEditMenu;
        };

        $scope.canRemove = function (data) {
          return $scope.options.canRemoveCondition(data) && !$scope.options.hideRemoveMenu;
        };

        $scope.canCreate = function (data) {
          return $scope.options.canCreateCondition(data) && !$scope.options.hideCreateMenu;
        };

        $scope.canList = function (data) {
          return $scope.options.canListCondition(data) && !$scope.options.hideViewMenu;
        };

        if ($scope.options.hasOptions) {
          $scope.dtColumns.push(actionsColumn);
          $scope.visibleColumns += 1;
        }

        $scope.new = function () {
          if (angular.isFunction($scope.options.onNew)) {
            $scope.options.onNew();
          } else {
            console.warn("No se especificó función options.onNew");
          }
        };

        $scope.edit = function (itemId) {

          if (angular.isFunction($scope.options.onEdit)) {
            $scope.options.onEdit(itemId);
          } else {
            console.warn("No se especificó función options.onEdit");
          }
        };

        $scope.view = function (itemId) {

          if (angular.isFunction($scope.options.onView)) {
            $scope.options.onView(itemId);
          } else {
            console.warn("No se especificó función options.onView");
          }
        };

        $scope.toggleAll = function () {
          if ($scope.selectAll) {
            //If true then select visible
            _.each(table.rows().data(), function (value, index) {
              $scope.options.selection[value.id] = true;
            });
          } else {
            _.each(table.rows().data(), function (value, index) {
              $scope.options.selection[value.id] = false;
            });
          }
        };

        $scope.toggleOne = function () {
          var notSelectAll = _.some(table.rows().data(), function (value, index) {
            return !$scope.options.selection[value.id];
          });
          $scope.selectAll = !notSelectAll;
        };

        //funcion para crear los filtros
        var createFilters = function createFilters() {
          $('#' + tableId + ' tfoot tr').empty();
          $scope.dateRangePickerWidgetsOrder = [];
          $(".daterangepicker").remove();
          $scope.options.currentColumnOrder = [];

          _.forEach(table.context[0].aoColumns, function (column) {
            var realIndex = column._ColReorder_iOrigCol;
            var data = column.mData;
            var html = '<th></th>';

            if (column.bVisible) {
              if (data) {
                $scope.options.currentColumnOrder.push(data);
              }

              var title = column.name;
              if (!name) {
                title = column.sTitle;
              }

              var customFilter = $scope.customFilters[realIndex];

              if (customFilter) {
                if (customFilter.filterType === 'combo') {
                  var id = 'combo_' + realIndex;
                  html = '<th><div id="' + id + '" name="' + title + '" class="filtro-ancho"></div></th>';
                  $('#' + tableId + ' tfoot tr').append(html);
                  html = '';
                  var headers = { 'Content-Type': 'application/json' };
                  var TokenService = $injector.get('TokenService');

                  if (TokenService) {
                    headers.Authorization = 'Bearer ' + TokenService.getToken();
                  }

                  $('#' + id).select2({
                    minimumResultsForSearch: -1,
                    id: function id(text) {
                      return text[column.idField];
                    },
                    data: function data() {
                      return $http({
                        url: baseurl.getUrl() + customFilter.filterUrl,
                        method: "GET"
                      });
                    },
                    ajax: {
                      url: baseurl.getUrl() + '/' + customFilter.filterUrl,
                      dataType: 'json',
                      params: { headers: headers },
                      quietMillis: 250,
                      data: function data(term, page) {
                        // page is the one-based page number tracked by Select2
                        return {
                          q: term
                        };
                      },
                      results: function results(data, page) {
                        // parse the results into the format expected by Select2.
                        // since we are using custom formatting functions we do not need to alter the remote JSON data
                        return { results: data };
                      },
                      cache: true
                    },

                    initSelection: function initSelection(element, callback) {
                      var value = table.column(column.idx).search();
                      $.ajax(baseurl.getUrl() + '/' + customFilter.filterUrl, {
                        beforeSend: function beforeSend(xhr) {
                          xhr.setRequestHeader('Content-Type', 'application/json');
                          var TokenService = $injector.get('TokenService');

                          if (TokenService) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + TokenService.getToken());
                          }
                        },
                        dataType: 'json'
                      }).done(function (data) {
                        callback(data);
                      });
                    },
                    formatResult: function formatResult(text) {
                      return '<div class="select2-user-result">' + text[column.textField] + '</div>';
                    },
                    formatSelection: function formatSelection(text) {
                      return text[column.idField];
                    },
                    escapeMarkup: function escapeMarkup(m) {
                      return m;
                    }
                  }).on('change', function (e) {
                    var value = $('#' + id).select2('val');
                    //los ids de los inputs tiene la forma "combo_[realIndex]"
                    var realIndex = parseInt(id.substring(6));
                    var index = table.colReorder.order().indexOf(realIndex);

                    if (this.value.length >= 1) {
                      table.column(index).search(this.value).draw();
                    } else {
                      table.column(index).search("").draw();
                    }
                  });
                } else if (customFilter.filterType === 'date-range') {
                  $scope.dateRangeOptions[realIndex] = _.clone(dateRangeDefaultOptions, true);
                  $scope.dateRangeOptions[realIndex].index = realIndex;

                  //si esta despues de la mitad abrir a la izquierda
                  if (realIndex > $scope.options.columns.length / 2) {
                    $scope.dateRangeOptions[realIndex].opens = 'left';
                  }

                  $scope.dateRangePickerWidgetsOrder.push[realIndex];
                  var input = '<th><input id="daterange_' + realIndex + '" date-range-picker class="column-filter form-control input-sm date-picker" options="dateRangeOptions[' + realIndex + ']" type="text" ng-model="dateRangeFilters[' + realIndex + ']" /></th>';

                  html = $compile(input)($scope);
                } else if (customFilter.filterType === 'number-range') {
                  $scope.rangeOptions[realIndex] = _.clone(rangeDefaultOptions, true);
                  $scope.rangeOptions[realIndex].index = realIndex;

                  //si esta despues de la mitad abrir a la izquierda
                  if (realIndex > $scope.options.columns.length / 2) {
                    $scope.rangeOptions[realIndex].opens = 'left';
                  }

                  $scope.rangePickerWidgetsOrder.push[realIndex];
                  var input = '<th><input  id="numberrange_' + realIndex + '" range-picker class="column-filter form-control input-sm " options="rangeOptions[' + realIndex + ']" type="text" ng-model="numberRangeFilters[' + realIndex + ']" /></th>';

                  html = $compile(input)($scope);
                }
              } else if (column.mData && column.bSearchable) {
                var value = table.column(column.idx).search();

                html = '<th><input id="filtro_' + realIndex + '" class="column-filter form-control input-sm" type="text" style="min-width:60px; width: 100%;" value="' + value + '"/></th>';
              } else {
                html = '<th></th>';
              }

              $('#' + tableId + ' tfoot tr').append(html);
            }
          });

          //bind de eventos para filtros
          _.forEach($("[id^='filtro']"), function (el) {
            $(el).on('keyup change', function (e) {
              //los ids de los inputs tiene la forma "filtro_[realIndex]"
              var realIndex = parseInt(el.id.substring(7));
              var index = table.colReorder.order().indexOf(realIndex);

              if (this.value.length >= 1 || e.keyCode == 13) {
                table.column(index).search(this.value).draw();
              }

              // Ensure we clear the search if they backspace far enough
              if (this.value == "") {
                table.column(index).search("").draw();
              }
            });
          });
        };

        /* Funcion de actualizacion de URL Base con o sin filtros estaticos */
        function updateStaticFilters() {
          urlTemplate = _.template(baseurl.getUrl() + '/<%= resource %>/datatables');
        }

        $scope.dtInstanceCallback = function (dtInstance) {
          $('thead+tfoot').remove();
          tableId = dtInstance.id;
          table = dtInstance.DataTable;

          //creacion de filtros
          $('#' + tableId).append('<tfoot><tr></tr></tfoot>');
          createFilters();
          $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');

          _.each($scope.dtColumns, function (col, index) {
            if (col.filter) {
              var a = $('.input-sm')[index + 1]; // data: estado
              a.value = col.filter;
            }
          });

          //Texto del boton de visibilidad de columnas
          $(".dt-button.buttons-colvis").removeClass().addClass("columns-selection").html('<i class="glyphicon glyphicon-th-list"></i>');

          /* funcion para actualizar la tabla manualmente */
          $scope.options.reloadData = function () {

            if ($scope.options.resource !== '@') {
              updateStaticFilters();
              $('#' + tableId).DataTable().ajax.reload();
            }
          };

          /* whatcher para actualizar la tabla automaticamente cuando los filtros estaticos cambian */
          $scope.$watch("options.staticFilter", function handleStaticFilterChange(newValue, oldValue) {

            if ($scope.options.resource !== '@') {
              updateStaticFilters();
              $('#' + tableId).DataTable().ajax.reload();
            }
          });

          table.on('draw', function () {
            $timeout(function () {
              if (table.rows().data().length > 0) {
                var selectAll = true;
                _.each(table.rows().data(), function (value, index) {

                  if ($scope.options.selection[value.id] === undefined) {
                    $scope.options.selection[value.id] = false;
                    selectAll = false;
                  } else if ($scope.options.selection[value.id] == false) {
                    selectAll = false;
                  }
                });

                $scope.selectAll = selectAll;
              } else {
                $scope.selectAll = false;
              }
            });
          });

          table.on('column-visibility', function (e, settings, column, state) {
            createFilters();
          });

          table.on('column-reorder', function (e, settings, details) {
            createFilters();
          });

          $scope.dtInstance = dtInstance;

          // obtiene los filtros actuales
          $scope.options.getFilters = function getFilters() {
            var filters = {};
            _.forEach(table.context[0].aoColumns, function (column) {
              var realIndex = column._ColReorder_iOrigCol;
              var data = column.mData;
              if (data !== undefined && data !== "" && data !== null) {
                filters[data] = table.column(realIndex).search();
              }
            });
            return filters;
          };

          if ($scope.options.defaultOrderColumn !== undefined && $scope.options.defaultOrderDir !== undefined) {
            table.order([[$scope.options.defaultOrderColumn, $scope.options.defaultOrderDir]]);
          }
        };

        $scope.remove = function (itemId) {
          $scope.disableButton = false;
          $scope.selectedItemId = itemId;
          $scope.tituloModal = "Confirmación de Borrado";
          $scope.mensajeModal = "Esta operación eliminará el registro seleccionado. ¿Desea continuar?";
          $scope.modalInstanceBorrar1 = $modal.open({
            template: '<div class="modal-header">' + '<h3 class="modal-title">{{::tituloModal}}</h3>' + '</div>' + '<div class="modal-body">{{::mensajeModal}}</div>' + '<div class="modal-footer">' + '<button class="btn btn-primary" ng-disabled="disableButton" ng-click="ok(selectedItemId)">Aceptar</button>' + '<button class="btn btn-warning" ng-disabled="disableButton" ng-click="cancel()">Cancelar</button>' + '</div>',
            scope: $scope
          });

          $scope.cancel = function () {
            $scope.disableButton = true;
            $scope.modalInstanceBorrar1.dismiss('cancel');
          };

          $scope.ok = function (itemId) {
            $scope.disableButton = true;

            if (angular.isFunction($scope.options.onRemove)) {
              $scope.options.onRemove(itemId);
              $scope.modalInstanceBorrar1.close(itemId);
            }
            // var model = $scope.options.factory.create({ id: itemId });
            // $scope.options.factory.remove(model).then(function () {
            //   // se refresca la tabla
            //   $('#' + tableId).DataTable().ajax.reload();
            //   $scope.modalInstanceBorrar1.close(itemId);
            // }, function (error) {
            //   $scope.modalInstanceBorrar1.dismiss('cancel');
            //   $scope.tituloModal = "No se pudo borrar el registro";
            //   $scope.mensajeModal = $scope.options.failedDeleteError;
            //   var modalInstance = $modal.open({
            //     template: '<div class="modal-header">' +
            //     '<h3 class="modal-title">{{::tituloModal}}</h3>' +
            //     '</div>' +
            //     '<div class="modal-body">{{::mensajeModal}}</div>' +
            //     '<div class="modal-footer">' +
            //     '<button class="btn btn-primary" ng-click="cancel()">Aceptar</button>' +
            //     '</div>',
            //     scope: $scope
            //   });
            //   $scope.cancel = function () {
            //     modalInstance.dismiss('cancel');
            //   };
            // });
          };
        };

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
          $('td', nRow).unbind('click');
          $('td', nRow).bind('click', function () {
            $scope.$apply(function () {
              $scope.selected = aData;
              $timeout(function () {
                $(document).scrollTop($('.table-detail').offset().top);
              });
            });
          });
          return nRow;
        }

        if ($scope.options.detailRows) {
          if ($scope.options.detailRows === true) {
            $scope.options.detailRows = $scope.options.columns;
          } else {
            $scope.options.detailRows = _.union($scope.options.columns, $scope.options.detailRows);
          }
        }
      }
    };
  }]);
})();
(function () {
  'use strict';

  angular.module('ui').directive('validatedDateInput', validatedDateInput);

  function validatedDateInput() {
    var directive = {
      restrict: 'E',
      scope: {
        // el valor que almacena la fecha asociada al input. Para precargar el input se puede
        // especificar un date, string o un unix timestamp.
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        classes: '@',
        onChange: '&',
        isDisabled: '=',
        dateOptions: '@',
        // formato esperado para la fecha dada como parámetro.
        // Posibles formatos: http://angular-ui.github.io/bootstrap/#!#dateparser
        format: '@',
        opened: '@'
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-date-input.html',
      controller: ValidatedDateInputController
    };
    return directive;
  }

  ValidatedDateInputController.$inject = ['$scope', '$timeout', 'uibDateParser'];

  function ValidatedDateInputController($scope, $timeout, uibDateParser) {
    var vm = this;
    var init = false;

    $scope.$watch('vm.model', function (model) {
      if (model && !init) {

        if (angular.isString(model)) {
          $scope.vm.model = uibDateParser.parse(model, $scope.vm.format);
        } else if (angular.isDate(model)) {
          $scope.vm.model = model;
        } else {
          $scope.vm.model = new Date(model);
        }
        init = true;
      }
    });

    if (!vm.format) {
      vm.format = 'dd/MM/yyyy';
    }
    vm.onChange = vm.onChange || angular.noop;
    vm.showWeeks = false;

    vm.open = function () {
      vm.opened = true;
    };

    vm.focus = false;
    vm.onFocus = function () {
      vm.opened = true;
      vm.focus = true;
    };

    vm.today = function () {
      vm.model = new Date();
    };

    vm.clear = function () {
      vm.model = null;
    };

    vm.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    activate();
    vm.updateListener = updateListener;

    function activate() {
      moment.locale('es');
    }

    function updateListener() {
      vm.focus = false;
      $timeout(vm.onChange, 0);
    }
  }
})();
(function () {
  'use strict';

  angular.module('ui').directive('validatedTextInput', validatedTextInput);

  function validatedTextInput() {
    var directive = {
      restrict: 'E',
      scope: {
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        placeholder: '@',
        classes: '@',
        inputType: '@',
        onChange: '&',
        maxLength: '@',
        minLength: '@',
        focusElement: '@',
        isDisabled: '=',
        textPattern: '@',
        min: '=',
        max: '='
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-text-input.html',
      link: linkFunc,
      controller: ValidatedTextInputController
    };

    function linkFunc(scope, elem, attr) {}

    return directive;
  }

  ValidatedTextInputController.$inject = ['$scope', '$timeout'];

  function ValidatedTextInputController($scope, $timeout) {
    var vm = this;

    activate();
    vm.updateListener = updateListener;

    function activate() {}

    function updateListener() {
      $timeout(vm.onChange, 0);
    }
  };
})();
(function () {
  'use strict';

  angular.module('ui').directive('validatedTextareaInput', validatedTextareaInput);

  function validatedTextareaInput() {
    var directive = {
      restrict: 'E',
      scope: {
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        classes: '@',
        inputType: '@',
        onChange: '&',
        maxLength: '@',
        minLength: '@',
        isDisabled: '='
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-textarea-input.html',
      link: linkFunc,
      controller: ValidatedTextareaInputController
    };

    function linkFunc(scope, elem, attr) {}

    return directive;
  }

  ValidatedTextareaInputController.$inject = ['$scope', '$timeout'];
  function ValidatedTextareaInputController($scope, $timeout) {
    var vm = this;

    activate();
    vm.updateListener = updateListener;

    function activate() {
      vm.campo = vm.form[vm.name];
    }

    function updateListener() {
      $timeout(vm.onChange, 0);
    }
  }
})();

(function () {
  'use strict';

  angular.module('ui').directive('validatedTimeInput', validatedTimeInput);

  function validatedTimeInput() {
    var directive = {
      restrict: 'E',
      scope: {
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        classes: '@',
        onChange: '&',
        isDisabled: '=',
        dateOptions: '@',
        format: '@',
        opened: '@'
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-time-input.html',
      link: linkFunc,
      controller: validatedTimeInputController
    };

    function linkFunc(scope, elem, attr, controller, dateFilter) {
      if (controller.model) {
        controller.model = new Date(controller.model);
      }
    }
    return directive;
  }
  validatedTimeInputController.$inject = ['$scope', '$timeout', '$element', '$document'];

  function validatedTimeInputController($scope, $timeout, element, $document) {
    var vm = this;
    vm.isValid = true;
    if (!vm.format) vm.format = "HH:mm";
    vm.date = new Date();
    vm.showWeeks = false;

    vm.open = function () {
      vm.opened = !vm.opened;
    };

    vm.focus = false;
    vm.onFocus = function () {
      vm.opened = true;
      vm.focus = true;
    };

    vm.blur = function () {
      vm.opened = false;
      vm.focus = false;
    };

    vm.today = function () {
      vm.date = new Date();
      vm.model = moment(vm.date).format(vm.format);
    };

    vm.clear = function () {
      vm.date = null;
      vm.model = null;
    };

    vm.close = function () {
      vm.opened = false;
      vm.focus = false;
    };
    activate();
    vm.updateListener = updateListener;
    vm.updateInputListener = updateInputListener;

    function activate() {
      moment.locale('es');
      vm.opened = false;
    }

    function updateListener() {
      vm.model = moment(vm.date).format(vm.format);
      var pattern = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
      vm.isValid = pattern.test(vm.model);

      if (!vm.isValid) {
        vm.form[vm.name].$setValidity('invalido', !vm.isValid);
      } else {
        $timeout(vm.onChange, 0);
      }
    }

    function updateInputListener() {
      var pattern = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
      vm.isValid = pattern.test(vm.model);

      if (!vm.isValid) {
        vm.form[vm.name].$setValidity('invalido', !vm.isValid);
      } else {
        $timeout(vm.onChange, 0);
      }
    }

    vm.keydown = function (evt) {
      if (evt.which === 27 || evt.which === 9 || evt.which === 13) {
        vm.close();
      }
    };

    element.bind('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });

    $document.bind('click', function (event) {
      $scope.$apply(function () {
        return vm.opened = false;
      });
    });
  };
})();
(function () {
  'use strict';

  angular.module('ui').directive('validatedUiselectInput', validatedUiselectInput);

  function validatedUiselectInput() {
    var directive = {
      restrict: 'E',
      scope: {
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        fieldToShow: '@',
        options: '=',
        classes: '@',
        onSelect: '&',
        focusElement: '@',
        isDisabled: '='
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-uiselect-input.html',
      link: linkFunc,
      controller: ValidatedUiselectInputController,
      compile: compileFunc
    };

    function linkFunc(scope, elem, attr) {}

    function compileFunc(element, attrs) {}

    return directive;
  }

  ValidatedUiselectInputController.$inject = ['$scope', '$timeout'];
  function ValidatedUiselectInputController($scope, $timeout) {
    var vm = this;

    vm.getChoice = getChoice;

    vm.selectListener = selectListener;

    vm.getFilter = getFilter;

    activate();

    function activate() {}

    function getChoice(obj) {
      return _.get(obj, vm.fieldToShow);
    }

    function selectListener() {
      $timeout(vm.onSelect, 0);
    }

    function getFilter(param) {
      var obj = {};
      obj[vm.fieldToShow] = param;
      return obj;
    }
  }
})();

(function () {
  'use strict';

  angular.module('ui').directive('validatedUiselectMultipleInput', validatedUiselectMultipleInput);

  function validatedUiselectMultipleInput() {
    var directive = {
      restrict: 'E',
      scope: {
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        fieldToShow: '@',
        options: '=',
        classes: '@',
        onSelect: '&',
        isDisabled: '='
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-uiselect-multiple-input.html',
      link: linkFunc,
      controller: ValidatedUiselectMultipleInputController
    };

    function linkFunc(scope, elem, attr) {}

    return directive;
  }

  ValidatedUiselectMultipleInputController.$inject = ['$scope', '$timeout'];
  function ValidatedUiselectMultipleInputController($scope, $timeout) {
    var vm = this;

    vm.getChoice = getChoice;

    vm.selectListener = selectListener;

    vm.printTest = printTest;

    vm.getFilter = getFilter;

    activate();

    function activate() {}

    function getChoice(obj) {
      return _.get(obj, vm.fieldToShow);
    }

    function selectListener() {
      $timeout(vm.onSelect, 0);
    }

    function getFilter(param) {
      var obj = {};
      obj[vm.fieldToShow] = param;
      return obj;
    }

    function printTest() {
      console.log('este es un test');
    }
  }
})();

(function () {
  'use strict';

  angular.module('ui').directive('wizard', wizard);

  function wizard() {
    var directive = {
      restrict: 'E',
      scope: {},
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/wizard.html',
      controller: WizardController,
      transclude: true
    };
    return directive;
  }

  WizardController.$inject = ['$scope', '$timeout'];

  function WizardController($scope, $timeout) {
    var vm = this;
    vm.tabs = [];

    activate();
    vm.addTab = addTab;

    function activate() {}

    function addTab() {
      // TODO Agregar TAB
    }
  }
})();

(function () {
  'use strict';

  angular.module('ui').directive('wizardContent', wizardContent);

  function wizardContent() {
    var directive = {
      restrict: 'E',
      transclude: true,
      scope: {},
      templateUrl: 'views/wizardcontent.html',
      link: linkFunc
    };

    return directive;
  }

  function linkFunc(scope, element, attrs) {}
})();

(function () {
  'use strict';

  angular.module('ui').directive('wizardPane', wizardPane);

  wizardPane.$inject = ['$state'];

  function wizardPane($state) {
    var directive = {
      required: '^^wizard',
      restrict: 'E',
      scope: {
        title: '@',
        number: '@',
        activeIf: '@',
        disabledIf: '=',
        state: '@'
      },
      templateUrl: 'views/wizardpane.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controllerFunc.$inject = ['$state'];

  function controllerFunc($state) {
    var vm = this;

    /**
     * Verifica si el estado dado como parametro es el estado actual
     * 
     * @param {string} state - nombre relativo o completo
     */
    vm.isActive = function (state) {
      return state.startsWith('.') ? $state.is($state.get('^').name + state) : $state.is(state);
    };

    vm.go = function (dest) {
      if (vm.disabledIf) {
        return;
      }
      $state.go(dest);
    };
  }
})();
(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.Authentication
   * @description
   * # Authentication
   */

  angular.module('ui').service('AuthenticationService', function ($resource, $rootScope, $http, baseurl) {
    var Authentication = $resource(baseurl.getBaseUrl() + '/:action', { action: '@action' });

    return {

      login: function login(username, password) {
        $rootScope.auxiliarUsername = username;
        var auth = new Authentication({ username: username, password: password });
        return auth.$save({ action: 'login' });
      },

      postLogin: function postLogin(authParams) {
        return new Authentication.save({ action: 'loginApp' }, { username: authParams.username });
      },

      token: function token(authParams) {
        var auth = new Authentication({
          username: authParams.username,
          accessToken: authParams.accessToken,
          requestToken: authParams.requestToken
        });
        return auth.$save({ action: 'token' });
      },

      logout: function logout() {
        var authParams = this.getCurrentUser();
        var auth = new Authentication({
          username: authParams.username,
          accessToken: authParams.accessToken
        });
        $rootScope.AuthParams = {};
        localStorage.removeItem('AUTH_PARAMS');

        return auth.$save({ action: 'logout' });
      },

      getCurrentUser: function getCurrentUser() {
        var user = $rootScope.AuthParams;

        if (!user || Object.keys(user).length === 0) {
          user = JSON.parse(localStorage.getItem('AUTH_PARAMS')) || undefined;

          if (user) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + user.accessToken;
          }
        }
        return user;
      }

    };
  });
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.Authorization
   * @description
   * # Authorization
   */

  angular.module('ui').service('AuthorizationService', function ($rootScope, $resource, $http, baseurl, AuthenticationService) {

    var Authorization = $resource(baseurl.getBaseUrl() + '/authorization/:action', { action: '@action' });

    return {
      /**
       * Retorna true si el usuario actual de la aplicación posee el permiso dado como
       * parámetro.
       **/
      hasPermission: function hasPermission(permission, userToCheck) {
        var user = userToCheck || AuthenticationService.getCurrentUser();
        var permissions = [];

        if (user) {
          permissions = user.permissions || [];
        }
        return permissions.indexOf(permission) >= 0;
      },

      principal: function principal() {
        return Authorization.get({ action: 'principal' }).$promise;
      },

      setupCredentials: function setupCredentials(username, requestToken, accessToken, callback) {

        var AuthParams = {
          username: username,
          requestToken: requestToken,
          accessToken: accessToken
        };

        $rootScope.AuthParams = AuthParams;
        localStorage.setItem('AUTH_PARAMS', JSON.stringify(AuthParams));
        $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
        // cargamos los permisos del usuario
        this.principal().then(function (response) {
          AuthParams.permissions = response.permisos;
          AuthParams.stamp = response.stamp;
          localStorage.setItem('AUTH_PARAMS', JSON.stringify(AuthParams));
          callback(AuthParams);
        });
      },

      cleanupCredentials: function cleanupCredentials() {
        localStorage.removeItem('AUTH_PARAMS');
      },

      authorize: function authorize(loginRequired, requiredPermissions) {
        var user = AuthenticationService.getCurrentUser();

        if (loginRequired === true && user === undefined) {
          return this.enums.LOGIN_REQUIRED;
        } else if (loginRequired && user !== undefined && (requiredPermissions === undefined || requiredPermissions.length === 0)) {
          return this.enums.AUTHORIZED;
        } else if (requiredPermissions) {
          var isAuthorized = true;

          for (var i = 0; i < requiredPermissions.length; i++) {
            isAuthorized = this.hasPermission(requiredPermissions[i], user);

            if (isAuthorized === false) {
              break;
            }
          }
          return isAuthorized ? this.enums.AUTHORIZED : this.enums.NOT_AUTHORIZED;
        }
      },

      enums: {
        LOGIN_REQUIRED: 'loginRequired',
        NOT_AUTHORIZED: 'notAuthorized',
        AUTHORIZED: 'authorized'
      }
    };
  });
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.baseurl
   * @description
   * # baseurl
   */

  angular.module('ui').provider('baseurl', function () {
    this.config = {};

    this.setConfig = function (config) {
      this.config = config;
    };

    this.$get = function () {
      var Config = this.config;
      return {
        getUrl: function getUrl() {
          return 'http://' + Config.serverIp + ':' + Config.serverPort + '/' + Config.serverName + '/' + Config.serverAPI;
        },


        getBaseUrl: function getBaseUrl() {
          var hostname = window.location.hostname;

          //si es el servidor de homologacion
          if (hostname === Config.serverIp) {
            return 'http://' + hostname + '/' + Config.serverName + '/' + Config.serverAPI;
          } else {
            //si es localhost es desarrollo local
            return 'http://' + hostname + ':' + Config.serverPort + '/' + Config.serverName + '/' + Config.serverAPI;
          }
        },

        getPublicBaseUrl: function getPublicBaseUrl() {
          var hostname = window.location.hostname;

          //si es el servidor de homologacion
          if (hostname === Config.serverIp) {
            return 'http://' + hostname + '/public/';
          } else {
            //si es localhost es desarrollo local
            return 'http://' + hostname + ':' + Config.serverPort + '/public/';
          }
        },

        getBareServerUrl: function getBareServerUrl() {
          var hostname = window.location.hostname;
          //si es el servidor de homologacion
          if (hostname === Config.serverIp) {
            return 'ws://' + hostname + '/' + Config.serverWSName + '/';
          } else {
            //si es localhost es desarrollo local
            return 'ws://' + hostname + ':' + Config.serverPort + '/' + Config.serverName + '/';
          }
        }
      };
    };
  });
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.ConfigProvider
   * @description
   * # ConfigProvider
   */

  angular.module('ui').provider('Config', function () {

    var options = {};

    this.config = function (opt) {
      angular.extend(options, opt);
    };

    this.$get = [function () {
      return options;
    }];
  });
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.ConfirmationModal
   * @description
   * # ConfirmationModal
   */

  angular.module('ui').factory('ConfirmationModal', ConfirmationModal);

  ConfirmationModal.$inject = ['$uibModal', '$rootScope'];

  function ConfirmationModal($uibModal, $rootScope) {

    return {
      /**
       * Se encarga de mostrar un confirmation modal.
       * 
       * @param {Object} options - Las opciones de configuración del modal.
       * @param {string} options.title - titulo del modal.
       * @param {string} options.message - El mensaje de confirmación.
       * @param {Function} options.ok - Función a invocar cuando se hace click en Aceptar.
       * @param {Function} [options.cancel] - Función a invocar cuando se hace click en Cancelar.
       */
      open: function open(options) {
        var scope = $rootScope.$new(true);
        Object.assign(scope, options);
        var modalInstance = $uibModal.open({
          template: '\n              <div class="modal-header">\n                <h3 class="modal-title">{{::title}}</h3>\n              </div>\n              <div class="modal-body">{{::message}}</div>\n              <div class="modal-footer">\n                <button class="btn btn-primary" ng-click="submit()">Aceptar</button>\n                <button class="btn btn-warning" ng-click="doCancel()">Cancelar</button>\n              </div>',
          scope: scope
        });

        scope.submit = function () {
          modalInstance.dismiss('cancel');
          scope.$destroy();

          if (angular.isFunction(options.ok)) {
            options.ok();
          }
        };
        scope.doCancel = function (id) {
          modalInstance.dismiss('cancel');
          scope.$destroy();
          if (angular.isFunction(options.cancel)) {
            options.cancel();
          }
        };
      }
    };
  }
})();
(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.fileUpload
   * @description
   * # fileUpload
   */

  angular.module('ui').config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider', 'flowFactoryProvider', function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider, flowFactoryProvider) {

    flowFactoryProvider.defaults = {
      method: 'octet'
    };

    var fileupload = function fileupload(name, schema, options) {
      if (schema.type === 'object' && schema.format === 'fileupload') {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key = options.path;
        f.type = 'fileupload';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    };
    schemaFormProvider.defaults.object.unshift(fileupload);

    //Add to the bootstrap directive
    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'fileupload', 'views/directives/fileupload.html');
    schemaFormDecoratorsProvider.createDirective('fileupload', 'views/directives/fileupload.html');
  }]).factory('fileupload', function () {});
})();

(function () {
  'use strict';

  angular.module('ui').factory('Filter', FilterFactory);

  function FilterFactory() {
    var FilterTypes = {
      EQUALS: 'equals',
      NOT_EQUALS: 'notEquals',
      NULL: 'null',
      NOT_NULL: 'notNull',
      LIKE: 'like',
      NOT_LIKE: 'notLike',
      GT: 'gt',
      GTE: 'gte',
      LT: 'lt',
      LTE: 'lte',
      IN: 'in'
    };

    function joinFilters(builder, filters, joinType) {
      if (!angular.isArray(filters)) {
        filters = [filters];
      }

      angular.forEach(filters, function (f) {
        builder.booleanJoins.push({
          joinType: joinType,
          filter: f
        });
      });
    }

    function addCondition(builder, condition, other) {
      var cond = { condition: condition };

      if (other) {
        cond.comparingObject = other;

        if (_.isBoolean(other)) {
          cond.type = 'boolean';
        } else if (_.isString(other)) {
          cond.type = 'string';
        } else if (_.isDate(other)) {
          cond.type = 'date';
        } else if (_.isNumber(other)) {
          cond.type = 'integer';
        }
      }
      builder.conditions.push(cond);
    }

    // Filter class
    function Filter(path) {
      this.path = path;
      this.conditions = [];
      this.booleanJoins = [];
    }

    var prototype = {
      or: function or(filters) {
        joinFilters(this, filters, 'or');
        return this;
      },

      and: function and(filters) {
        joinFilters(this, filters, 'and');
        return this;
      },

      eq: function eq(other) {
        addCondition(this, FilterTypes.EQUALS, other);
        return this;
      },

      notEq: function notEq(other) {
        addCondition(this, FilterTypes.NOT_EQUALS, other);
        return this;
      },

      isNull: function isNull() {
        addCondition(this, FilterTypes.NULL);
        return this;
      },

      notNull: function notNull() {
        addCondition(this, FilterTypes.NOT_NULL);
        return this;
      },

      like: function like(other) {
        addCondition(this, FilterTypes.LIKE, other);
        return this;
      },

      notLike: function notLike(other) {
        addCondition(this, FilterTypes.NOT_LIKE, other);
        return this;
      },

      gt: function gt(other) {
        addCondition(this, FilterTypes.GT, other);
        return this;
      },

      gte: function gte(other) {
        addCondition(this, FilterTypes.GTE, other);
        return this;
      },

      lt: function lt(other) {
        addCondition(this, FilterTypes.LT, other);
        return this;
      },

      lte: function lte(other) {
        addCondition(this, FilterTypes.LTE, other);
        return this;
      },

      /**
       * sql IN
       *
       * @param other{Array} the elements to include
       **/
      in: function _in(other) {
        addCondition(this, FilterTypes.IN, other);
        return this;
      }
    };
    Filter.prototype = prototype;

    return {
      path: function path(filterPath) {
        return new Filter(filterPath);
      }
    };
  }
})();
(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.filterFactory
   * @description
   * # filterFactory
   * Factory in the qualita.
   */

  angular.module('ui').factory('filterFactory', function () {
    var logicalOp = function logicalOp(type, filters) {
      var result = {
        _inner: {
          type: type
        }
      };

      if (filters.constructor !== Array) {
        filters = [filters];
      }

      result._inner.filters = this && this._inner ? [this._inner, filters] : filters;
      if (!result.or && type === 'and') result.or = or;
      if (!result.value) result.value = value;
      if (!result.add) result.add = add;
      result.paginate = paginate;
      return result;
    };

    var and = function and(filters) {
      return logicalOp.call(this, 'and', filters);
    };

    var or = function or(filters) {
      return logicalOp.call(this, 'or', filters);
    };

    var add = function add(filter) {
      this._inner.filters.push(filter);
      return this;
    };

    var single = function single(filter) {
      return and([filter]);
    };

    var value = function value() {
      return this._inner;
    };

    var paginate = function paginate(limit, offset) {
      this._inner.limit = limit;
      this._inner.offset = offset;
      return this;
    };

    // Public API here
    return {
      and: and,
      or: or,
      add: add,
      single: single,
      value: value
    };
  });
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.formFactory
   * @description
   * # formFactory
   */

  angular.module('ui').factory('formFactory', function ($location, $localForage, notify, $rootScope, AuthorizationService, $q) {
    var hasPermission = AuthorizationService.hasPermission;

    // Public API here
    return {
      defaultForm: function defaultForm() {
        return ['*', {
          type: 'submit',
          title: 'Guardar',
          htmlClass: 'pull-right'
        }];
      },
      defaultOptions: function defaultOptions() {
        return {
          formDefaults: {
            ngModelOptions: {
              updateOn: 'blur'
            },
            disabled: false,
            disableSuccessState: false,
            disableErrorState: false,
            feedback: true
          },
          validationMessage: {
            302: 'El campo es obligatorio'
          }
        };
      },
      defaultViewOptions: function defaultViewOptions() {
        return {
          formDefaults: {
            disabled: true,
            disableSuccessState: true,
            disableErrorState: true,
            feedback: false
          }
        };
      },
      defaultSubmit: function defaultSubmit(resource, scope, form, factory, vm, errorHandler) {
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
          if (scope.model) {
            var model = factory.create(scope.model);
          } else {
            //si se usa controllerAs, se busca el modelo dentro del vm especificado
            var model = factory.create(vm.model);
          }

          //se convierten los campos de fecha desde string a date
          if (scope.schema) {
            var schema = scope.schema;
          } else {
            var schema = vm.schema;
          }
          _.each(schema.properties, function (field, fieldName) {
            if (field.format && (field.format === 'date' || field.format === 'date-time')) {
              if (model[fieldName] && typeof model[fieldName] === 'string') {
                //console.log(field.formatDate);
                model[fieldName] = new moment(model[fieldName], field.formatDate || 'DD/MM/YYYY').toDate();
              }
            }
          });

          factory.save(model).then(function () {
            $location.path('/' + resource);
          }).catch(function (e) {
            console.log(e);
            $rootScope.isProcessing = false;

            if (errorHandler) {
              errorHandler(e);
              return;
            }

            //se convierten los campos de fecha desde date a string
            if (scope.schema) {
              var schema = scope.schema;
            } else {
              var schema = vm.schema;
            }
            _.each(schema.properties, function (field, fieldName) {
              if (field.format && (field.format === 'date' || field.format === 'date-time')) {
                if (scope.model[fieldName] && scope.model[fieldName] instanceof Date) {
                  scope.model[fieldName] = currentForm[fieldName].$viewValue; //.to('dd/MM/yyyy');
                }
              }
            });

            //se establecen los errores del backend
            if (e.constructor === Array && e.data[0].constraint) {
              scope.$broadcast('schemaForm.error.' + e.data[0].constraint, e.data[0].codigoError.toString(), false);
            }

            if (e.data && e.data.code !== 403) {
              var msg = 'Error al persistir la operación.';
              if (!scope.model.id) msg += '\n\nGuardando localmente, reintente más tarde.';
              notify({ message: msg, classes: 'alert-danger', position: 'right' });
              $localForage.getItem(resource).then(function (value) {
                value = value || [];
                value.unshift(scope.model);
                if (!scope.model.id) $localForage.setItem(resource, value);
              });
            }

            // manejo general de errores
            else if (e && e.status === 500) {
                var msg = '';
                _.forEach(e.data, function (error) {
                  msg += '\n\n' + error.message + '.';
                });
                notify({ message: msg, classes: 'alert-danger', position: 'right' });
                // guardar en local storage
                deferred.reject(msg);
              }
          });
        }
      },
      defaultNSFSubmit: function defaultNSFSubmit(form, factory, resourceModel, errorHandler) {
        var deferred = $q.defer();
        // Then we check if the form is valid
        if (form.$valid && !$rootScope.isProcessing) {
          $rootScope.isProcessing = true;
          // ... do whatever you need to do with your data.
          var model = factory.create(resourceModel);

          //se convierten los campos de fecha desde string a date
          factory.save(model).then(function (response) {
            // la redireccion se deja a cargo del controller
            // $location.path('/' + resource);
            deferred.resolve(response);
          }).catch(function (e) {
            console.log(e);
            $rootScope.isProcessing = false;

            if (errorHandler) {
              errorHandler(e);
              deferred.reject(msg);
            } else {
              //se establecen los errores del backend
              if (e && e.status === 500) {
                var msg = '';
                _.forEach(e.data, function (error) {
                  msg += '\n\n' + error.message + '.';
                });
                notify({ message: msg, classes: 'alert-danger', position: 'right' });
                // guardar en local storage
                deferred.reject(msg);
              }
            }
          });
        }
        return deferred.promise;
      },

      canEdit: function canEdit(resource) {
        var permission = hasPermission('update_' + resource);
        return permission;
      },

      canList: function canList(resource) {
        var permission = hasPermission('index_' + resource);
        return permission;
      },

      canRemove: function canRemove(resource) {
        var permission = hasPermission('delete_' + resource);
        return permission;
      },

      canCreate: function canCreate(resource) {
        var permission = hasPermission('create_' + resource);
        return permission;
      }
    };
  });
})();

(function () {
  'use strict';

  angular.module('ui').factory('LangService', Service);

  Service.$inject = ['$translate', '$translatePartialLoader'];

  function Service($translate, $translatePartialLoader) {

    var service = {
      getTranslations: getTranslations
    };

    return service;

    /**
     * Metodo que retorna un objeto con las traducciones para
     * los keys dados como parametro.
     *
     * @param translationKeys {Array} claves para la traduccion.
     * @param module {String} (opcional) nombre del modulo que contiene las traducciones.
     **/
    function getTranslations(translationKeys, module) {

      if (module) {
        $translatePartialLoader.addPart(module);
      }
      return $translate.refresh().then(function () {
        return $translate(translationKeys);
      });
    }
  }
})();

(function () {
  'use strict';

  angular.module('ui').factory('ModelTrimmer', ModelTrimmer);

  function ModelTrimmer() {
    var service = {
      trimDetails: trimDetails
    };

    return service;

    function trimDetails(model, ignoredFields) {
      var response = {};
      var keys = _.keys(model);

      _.forEach(keys, function (key) {
        var ignoredIndex = _.findIndex(ignoredFields, function (elem) {
          return elem == key;
        });
        if (ignoredFields && ignoredIndex !== -1) {
          response[key] = model[key];
          return;
        }

        if (_.isArray(model[key]) == true) {
          response[key] = [];
          _.forEach(model[key], function (elem, index) {
            //no se hace recursivo porque solo se debería de necesitar comprobar en primer nivel
            fieldTrimmer(model[key], response[key], index, ignoredFields);
          });
        } else {
          fieldTrimmer(model, response, key, ignoredFields);
        }
      });
      return response;
    }

    function fieldTrimmer(model, newModel, fieldName, ignoredFields) {
      if (_.isObject(model[fieldName]) && model[fieldName].hasOwnProperty("id")) {
        newModel[fieldName] = model[fieldName].id;
      } else {
        newModel[fieldName] = model[fieldName];
      }
    }
  }
})();

(function () {
  angular.module('ui').factory('NotificacionesWSFactory', NotificacionesWSFactory);
  NotificacionesWSFactory.$inject = ['$resource', 'baseurl', '$log', '$websocket', '$timeout'];

  function NotificacionesWSFactory($resource, baseurl, $log, $websocket, $timeout) {
    var service = {
      all: all,
      close: close,
      create: create,
      get: get,
      getLatest: getLatest,
      init: init,
      remove: remove,
      save: save,
      sendAction: sendAction,
      registerMessageObserver: registerMessageObserver
    };

    var notificaciones = $resource(baseurl.getBaseUrl() + "/notificaciones/:id", { id: '@id' }, {
      update: {
        method: 'PUT'
      }
    });

    var closedByUser = false;

    var retries = 0;

    var websocket = undefined;

    return service;

    function all(params) {
      return notificaciones.query(params);
    }

    function close(forceClose) {
      closedByUser = true;
      var forzar = false;
      if (forceClose) {
        forzar = forceClose;
      }

      websocket.close(forzar);
    }

    function create(attrs) {
      return new notificaciones(attrs);
    }

    function get(id) {
      return notificaciones.get({ id: id });
    }

    function getLatest(offset, limit) {
      var obj = {
        action: "get",
        offset: offset,
        limit: limit
      };
      websocket.send(JSON.stringify(obj));
    }

    function init(username) {
      websocket = $websocket(baseurl.getBareServerUrl() + "wsnotificaciones");
      var obj = {
        action: "init",
        username: username
      };
      websocket.onOpen(function () {
        console.log("Socket abierto");
        retries = 0;
      });

      websocket.onClose(function () {
        console.log("Socket cerrado");
        if (!closedByUser) {
          if (retries < 4) {
            retries = retries + 1;
            $timeout(function () {
              init(username);
            }, 1000 * retries);
          } else {
            console.error("Tras 4 intentos no se pudo reestablecer conexion con websocket de notificaciones.");
          }
        } else {
          closedByUser = false;
        }
      });
      console.log(websocket);
      websocket.send(JSON.stringify(obj));
    }

    function sendAction(accion, notificacion) {
      var obj = {
        action: accion,
        notificacion: notificacion.id
      };
      $log.info("mensaje a mandar: ");
      $log.info(obj);
      websocket.send(JSON.stringify(obj));
    }

    function registerMessageObserver(functionHandler) {
      if (!websocket) {
        websocket = $websocket(baseurl.getBareServerUrl() + "wsnotificaciones");
      }
      websocket.onMessage(functionHandler);
    }

    function remove(notificacion) {
      return notificacion.$remove();
    }

    function save(notificacion) {
      return notificacion.id ? notificacion.$update() : notificacion.$save();
    }
  }
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.ReportTicketFactory
   * @description
   * # ReportTicketFactory
   */

  angular.module('ui').factory('ReportTicketFactory', ['$resource', 'baseurl', function ($resource, baseurl) {

    var ReportTicket = $resource(baseurl.getBaseUrl() + '/ticket/:reportID?:query&currentColumnOrder=:currentColumnOrder', {
      action: '@reportID'
    });

    return {
      ticket: function ticket(reportID, filters, searchParams, currentColumnOrder) {
        var report = new ReportTicket(filters);
        var params = { reportID: reportID };

        if (searchParams) {
          params.query = decodeURIComponent($.param(searchParams));
        }

        if (currentColumnOrder) {
          params.currentColumnOrder = currentColumnOrder;
        }

        return report.$save(params);
      },

      downloadURL: function downloadURL(reportTicket, exportType) {
        console.log('downloadURL');
        return baseurl.getBaseUrl() + '/generar/' + reportTicket + '/' + exportType;
      },

      downloadCustomReport: function downloadCustomReport(reportID, exportType, filters) {
        console.log('dowloadCustomReport');
        var downloadUrl = baseurl.getBaseUrl() + '/reportes/' + reportID;
        if (filters) {
          downloadUrl += "?";
          _.forEach(filters, function (filter) {
            //console.log(filter);
            downloadUrl += filter + "&";
          });
          return downloadUrl;
        }
        return downloadUrl;
      }
    };
  }]);
})();
(function () {
  'use strict';

  /**
   * Provider que permite:
   *
   * 1) Que un controller/service pueda definir las claves de traduccion que necesita.
   * 2) Que un controller/service pueda recuperar las claves de traduccion registradas por un modulo.
   *
   * @author Jorge Ramirez <jorge@codium.com.py>
   **/

  angular.module('ui').provider('tkeys', Provider);

  function Provider() {
    var keysMap = {};
    this.addKeys = addKeys;
    this.$get = [tkeysFactory];

    /**
     * Agrega la lista de claves de traduccion que el modulo va a necesitar
     *
     * @param module {String}: identificador del modulo.
     * @param keys {Array}
     **/
    function addKeys(module, keys) {
      keysMap[module] = keys;
    }

    /**
     * Esta funcion es la que retorna el prototipo del servicio tkeys.
     **/
    function tkeysFactory() {
      return keysMap;
    }
  }
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.usuariosFactory
   * @description
   * # usuariosFactory
   */

  angular.module('ui').factory('usuariosFactory', function ($resource, filterFactory, baseurl) {

    var Usuario = $resource(baseurl.getBaseUrl() + '/usuarios/:id', { id: '@id' }, {
      'update': { method: 'PUT' } });

    // Public API here
    return {
      all: function all(params) {
        return Usuario.query(params);
      },

      get: function get(id) {
        return Usuario.get({ id: id });
      },

      getByUsername: function getByUsername(username) {
        var params = {};
        params.search = filterFactory.single({
          path: 'username',
          equals: username
        }).value();
        return Usuario.query(params);
      },

      create: function create(attrs) {
        return new Usuario(attrs);
      },

      save: function save(usuario) {
        return usuario.id ? usuario.$update() : usuario.$save();
      },

      remove: function remove(usuario) {
        return usuario.$remove();
      }
    };
  });
})();

(function () {
  'use strict';

  angular.module('ui').factory('Util', Util);

  function Util() {
    var service = {
      toUnidadMedidaBase: toUnidadMedidaBase,
      fromUnidadMedidaBase: fromUnidadMedidaBase
    };

    return service;

    function toUnidadMedidaBase(cantidad, unidadMedida) {
      var multiplicador = 1;
      var unidadActual = unidadMedida;
      while (!unidadActual.esBase) {
        multiplicador = multiplicador * unidadActual.cantidad;
        unidadActual = unidadActual.unidadContenida;
      }
      return cantidad * multiplicador;
    }

    function fromUnidadMedidaBase(cantidad, unidadObjetivo) {
      var multiplicador = 1;
      var unidadActual = unidadObjetivo;
      while (!unidadActual.esBase) {
        multiplicador = multiplicador * unidadActual.cantidad;
        unidadActual = unidadActual.unidadContenida;
      }
      return cantidad / multiplicador;
    }
  }
})();

/**
 * Define la funcion bootstrap que permite realizar inicializaciones basicas
 * de la aplicacion. Es obligatoria la utilizacion de esta funcion.
 *
 * @author Jorge Ramirez <jorge@codium.com.py>
 **/
(function () {
  'use strict';

  window.ui = window.ui || {};
  // bootstrap namespace
  window.ui.bs = {};
  window.ui.bs.bootstrap = bootstrap;
  window.ui.bs.configure = configure;

  /**
   * Funcion que se realiza configuraciones basicas del modulo ui. A partir
   * de la configuracion que recibe como parametro.
   * @param {object} config - Parametros de configuracion.
   */
  function configure(config) {
    angular.module('ui').config(['ConfigProvider', 'flowFactoryProvider', 'baseurlProvider', function (ConfigProvider, flowFactoryProvider, baseurlProvider) {
      flowFactoryProvider.defaults = {
        method: 'octet',
        target: config.serverURL + '/adjuntos'
      };
      ConfigProvider.config(config);
      baseurlProvider.setConfig(config);
    }]);

    angular.module('ui').constant('CONFIGURATION', {
      serverName: config.serverName,
      serverIp: config.serverIp,
      serverPort: config.serverPort,
      serverAPI: config.serverAPI
    });
  }
  /**
   * Funcion que realiza inicializaciones basicas de la aplicacion.
   *
   * @param callback {Function}: Funcion a ejecutarse en caso de querer realizar inicializaciones
   *                             adicionales. La funcion recibe los parametros de configuracion.
   **/
  function bootstrap(callback) {
    $.getJSON('config.json', function (config) {
      configure(config);

      if (angular.isFunction(callback)) {
        callback(config);
      }
      angular.bootstrap('#' + config.appId, [config.appModule]);
    });
  }
})();

/**
 * Wraps the
 * @param text {string} haystack to search through
 * @param search {string} needle to search for
 * @param [caseSensitive] {boolean} optional boolean to use case-sensitive searching
 */
angular.module('ui.highlight', []).filter('highlight', function () {
  'use strict';

  return function (text, search, caseSensitive) {
    if (text && (search || angular.isNumber(search))) {
      text = text.toString();
      search = search.toString();
      if (caseSensitive) {
        return text.split(search).join('<span class="ui-match">' + search + '</span>');
      } else {
        return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
      }
    } else {
      return text;
    }
  };
});
/*
Copyright 2012 Igor Vaynberg

Version: 3.5.2 Timestamp: Sat Nov  1 14:43:36 EDT 2014

This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
General Public License version 2 (the "GPL License"). You may choose either license to govern your
use of this software only upon the condition that you accept all of the terms of either the Apache
License or the GPL License.

You may obtain a copy of the Apache License and the GPL License at:

    http://www.apache.org/licenses/LICENSE-2.0
    http://www.gnu.org/licenses/gpl-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the
Apache License or the GPL License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the Apache License and the GPL License for
the specific language governing permissions and limitations under the Apache License and the GPL License.
*/
(function ($) {
  if (typeof $.fn.each2 == "undefined") {
    $.extend($.fn, {
      /*
      * 4-10 times faster .each replacement
      * use it carefully, as it overrides jQuery context of element on each iteration
      */
      each2: function each2(c) {
        var j = $([0]),
            i = -1,
            l = this.length;
        while (++i < l && (j.context = j[0] = this[i]) && c.call(j[0], i, j) !== false //"this"=DOM, i=index, j=jQuery object
        ) {}
        return this;
      }
    });
  }
})(jQuery);

(function ($, undefined) {
  "use strict";
  /*global document, window, jQuery, console */

  if (window.Select2 !== undefined) {
    return;
  }

  var AbstractSelect2,
      SingleSelect2,
      MultiSelect2,
      nextUid,
      sizer,
      lastMousePosition = { x: 0, y: 0 },
      $document,
      scrollBarDimensions,
      KEY = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 36,
    END: 35,
    BACKSPACE: 8,
    DELETE: 46,
    isArrow: function isArrow(k) {
      k = k.which ? k.which : k;
      switch (k) {
        case KEY.LEFT:
        case KEY.RIGHT:
        case KEY.UP:
        case KEY.DOWN:
          return true;
      }
      return false;
    },
    isControl: function isControl(e) {
      var k = e.which;
      switch (k) {
        case KEY.SHIFT:
        case KEY.CTRL:
        case KEY.ALT:
          return true;
      }

      if (e.metaKey) return true;

      return false;
    },
    isFunctionKey: function isFunctionKey(k) {
      k = k.which ? k.which : k;
      return k >= 112 && k <= 123;
    }
  },
      MEASURE_SCROLLBAR_TEMPLATE = "<div class='select2-measure-scrollbar'></div>",
      DIACRITICS = { '\u24B6': "A", '\uFF21': "A", '\xC0': "A", '\xC1': "A", '\xC2': "A", '\u1EA6': "A", '\u1EA4': "A", '\u1EAA': "A", '\u1EA8': "A", '\xC3': "A", '\u0100': "A", '\u0102': "A", '\u1EB0': "A", '\u1EAE': "A", '\u1EB4': "A", '\u1EB2': "A", '\u0226': "A", '\u01E0': "A", '\xC4': "A", '\u01DE': "A", '\u1EA2': "A", '\xC5': "A", '\u01FA': "A", '\u01CD': "A", '\u0200': "A", '\u0202': "A", '\u1EA0': "A", '\u1EAC': "A", '\u1EB6': "A", '\u1E00': "A", '\u0104': "A", '\u023A': "A", '\u2C6F': "A", '\uA732': "AA", '\xC6': "AE", '\u01FC': "AE", '\u01E2': "AE", '\uA734': "AO", '\uA736': "AU", '\uA738': "AV", '\uA73A': "AV", '\uA73C': "AY", '\u24B7': "B", '\uFF22': "B", '\u1E02': "B", '\u1E04': "B", '\u1E06': "B", '\u0243': "B", '\u0182': "B", '\u0181': "B", '\u24B8': "C", '\uFF23': "C", '\u0106': "C", '\u0108': "C", '\u010A': "C", '\u010C': "C", '\xC7': "C", '\u1E08': "C", '\u0187': "C", '\u023B': "C", '\uA73E': "C", '\u24B9': "D", '\uFF24': "D", '\u1E0A': "D", '\u010E': "D", '\u1E0C': "D", '\u1E10': "D", '\u1E12': "D", '\u1E0E': "D", '\u0110': "D", '\u018B': "D", '\u018A': "D", '\u0189': "D", '\uA779': "D", '\u01F1': "DZ", '\u01C4': "DZ", '\u01F2': "Dz", '\u01C5': "Dz", '\u24BA': "E", '\uFF25': "E", '\xC8': "E", '\xC9': "E", '\xCA': "E", '\u1EC0': "E", '\u1EBE': "E", '\u1EC4': "E", '\u1EC2': "E", '\u1EBC': "E", '\u0112': "E", '\u1E14': "E", '\u1E16': "E", '\u0114': "E", '\u0116': "E", '\xCB': "E", '\u1EBA': "E", '\u011A': "E", '\u0204': "E", '\u0206': "E", '\u1EB8': "E", '\u1EC6': "E", '\u0228': "E", '\u1E1C': "E", '\u0118': "E", '\u1E18': "E", '\u1E1A': "E", '\u0190': "E", '\u018E': "E", '\u24BB': "F", '\uFF26': "F", '\u1E1E': "F", '\u0191': "F", '\uA77B': "F", '\u24BC': "G", '\uFF27': "G", '\u01F4': "G", '\u011C': "G", '\u1E20': "G", '\u011E': "G", '\u0120': "G", '\u01E6': "G", '\u0122': "G", '\u01E4': "G", '\u0193': "G", '\uA7A0': "G", '\uA77D': "G", '\uA77E': "G", '\u24BD': "H", '\uFF28': "H", '\u0124': "H", '\u1E22': "H", '\u1E26': "H", '\u021E': "H", '\u1E24': "H", '\u1E28': "H", '\u1E2A': "H", '\u0126': "H", '\u2C67': "H", '\u2C75': "H", '\uA78D': "H", '\u24BE': "I", '\uFF29': "I", '\xCC': "I", '\xCD': "I", '\xCE': "I", '\u0128': "I", '\u012A': "I", '\u012C': "I", '\u0130': "I", '\xCF': "I", '\u1E2E': "I", '\u1EC8': "I", '\u01CF': "I", '\u0208': "I", '\u020A': "I", '\u1ECA': "I", '\u012E': "I", '\u1E2C': "I", '\u0197': "I", '\u24BF': "J", '\uFF2A': "J", '\u0134': "J", '\u0248': "J", '\u24C0': "K", '\uFF2B': "K", '\u1E30': "K", '\u01E8': "K", '\u1E32': "K", '\u0136': "K", '\u1E34': "K", '\u0198': "K", '\u2C69': "K", '\uA740': "K", '\uA742': "K", '\uA744': "K", '\uA7A2': "K", '\u24C1': "L", '\uFF2C': "L", '\u013F': "L", '\u0139': "L", '\u013D': "L", '\u1E36': "L", '\u1E38': "L", '\u013B': "L", '\u1E3C': "L", '\u1E3A': "L", '\u0141': "L", '\u023D': "L", '\u2C62': "L", '\u2C60': "L", '\uA748': "L", '\uA746': "L", '\uA780': "L", '\u01C7': "LJ", '\u01C8': "Lj", '\u24C2': "M", '\uFF2D': "M", '\u1E3E': "M", '\u1E40': "M", '\u1E42': "M", '\u2C6E': "M", '\u019C': "M", '\u24C3': "N", '\uFF2E': "N", '\u01F8': "N", '\u0143': "N", '\xD1': "N", '\u1E44': "N", '\u0147': "N", '\u1E46': "N", '\u0145': "N", '\u1E4A': "N", '\u1E48': "N", '\u0220': "N", '\u019D': "N", '\uA790': "N", '\uA7A4': "N", '\u01CA': "NJ", '\u01CB': "Nj", '\u24C4': "O", '\uFF2F': "O", '\xD2': "O", '\xD3': "O", '\xD4': "O", '\u1ED2': "O", '\u1ED0': "O", '\u1ED6': "O", '\u1ED4': "O", '\xD5': "O", '\u1E4C': "O", '\u022C': "O", '\u1E4E': "O", '\u014C': "O", '\u1E50': "O", '\u1E52': "O", '\u014E': "O", '\u022E': "O", '\u0230': "O", '\xD6': "O", '\u022A': "O", '\u1ECE': "O", '\u0150': "O", '\u01D1': "O", '\u020C': "O", '\u020E': "O", '\u01A0': "O", '\u1EDC': "O", '\u1EDA': "O", '\u1EE0': "O", '\u1EDE': "O", '\u1EE2': "O", '\u1ECC': "O", '\u1ED8': "O", '\u01EA': "O", '\u01EC': "O", '\xD8': "O", '\u01FE': "O", '\u0186': "O", '\u019F': "O", '\uA74A': "O", '\uA74C': "O", '\u01A2': "OI", '\uA74E': "OO", '\u0222': "OU", '\u24C5': "P", '\uFF30': "P", '\u1E54': "P", '\u1E56': "P", '\u01A4': "P", '\u2C63': "P", '\uA750': "P", '\uA752': "P", '\uA754': "P", '\u24C6': "Q", '\uFF31': "Q", '\uA756': "Q", '\uA758': "Q", '\u024A': "Q", '\u24C7': "R", '\uFF32': "R", '\u0154': "R", '\u1E58': "R", '\u0158': "R", '\u0210': "R", '\u0212': "R", '\u1E5A': "R", '\u1E5C': "R", '\u0156': "R", '\u1E5E': "R", '\u024C': "R", '\u2C64': "R", '\uA75A': "R", '\uA7A6': "R", '\uA782': "R", '\u24C8': "S", '\uFF33': "S", '\u1E9E': "S", '\u015A': "S", '\u1E64': "S", '\u015C': "S", '\u1E60': "S", '\u0160': "S", '\u1E66': "S", '\u1E62': "S", '\u1E68': "S", '\u0218': "S", '\u015E': "S", '\u2C7E': "S", '\uA7A8': "S", '\uA784': "S", '\u24C9': "T", '\uFF34': "T", '\u1E6A': "T", '\u0164': "T", '\u1E6C': "T", '\u021A': "T", '\u0162': "T", '\u1E70': "T", '\u1E6E': "T", '\u0166': "T", '\u01AC': "T", '\u01AE': "T", '\u023E': "T", '\uA786': "T", '\uA728': "TZ", '\u24CA': "U", '\uFF35': "U", '\xD9': "U", '\xDA': "U", '\xDB': "U", '\u0168': "U", '\u1E78': "U", '\u016A': "U", '\u1E7A': "U", '\u016C': "U", '\xDC': "U", '\u01DB': "U", '\u01D7': "U", '\u01D5': "U", '\u01D9': "U", '\u1EE6': "U", '\u016E': "U", '\u0170': "U", '\u01D3': "U", '\u0214': "U", '\u0216': "U", '\u01AF': "U", '\u1EEA': "U", '\u1EE8': "U", '\u1EEE': "U", '\u1EEC': "U", '\u1EF0': "U", '\u1EE4': "U", '\u1E72': "U", '\u0172': "U", '\u1E76': "U", '\u1E74': "U", '\u0244': "U", '\u24CB': "V", '\uFF36': "V", '\u1E7C': "V", '\u1E7E': "V", '\u01B2': "V", '\uA75E': "V", '\u0245': "V", '\uA760': "VY", '\u24CC': "W", '\uFF37': "W", '\u1E80': "W", '\u1E82': "W", '\u0174': "W", '\u1E86': "W", '\u1E84': "W", '\u1E88': "W", '\u2C72': "W", '\u24CD': "X", '\uFF38': "X", '\u1E8A': "X", '\u1E8C': "X", '\u24CE': "Y", '\uFF39': "Y", '\u1EF2': "Y", '\xDD': "Y", '\u0176': "Y", '\u1EF8': "Y", '\u0232': "Y", '\u1E8E': "Y", '\u0178': "Y", '\u1EF6': "Y", '\u1EF4': "Y", '\u01B3': "Y", '\u024E': "Y", '\u1EFE': "Y", '\u24CF': "Z", '\uFF3A': "Z", '\u0179': "Z", '\u1E90': "Z", '\u017B': "Z", '\u017D': "Z", '\u1E92': "Z", '\u1E94': "Z", '\u01B5': "Z", '\u0224': "Z", '\u2C7F': "Z", '\u2C6B': "Z", '\uA762': "Z", '\u24D0': "a", '\uFF41': "a", '\u1E9A': "a", '\xE0': "a", '\xE1': "a", '\xE2': "a", '\u1EA7': "a", '\u1EA5': "a", '\u1EAB': "a", '\u1EA9': "a", '\xE3': "a", '\u0101': "a", '\u0103': "a", '\u1EB1': "a", '\u1EAF': "a", '\u1EB5': "a", '\u1EB3': "a", '\u0227': "a", '\u01E1': "a", '\xE4': "a", '\u01DF': "a", '\u1EA3': "a", '\xE5': "a", '\u01FB': "a", '\u01CE': "a", '\u0201': "a", '\u0203': "a", '\u1EA1': "a", '\u1EAD': "a", '\u1EB7': "a", '\u1E01': "a", '\u0105': "a", '\u2C65': "a", '\u0250': "a", '\uA733': "aa", '\xE6': "ae", '\u01FD': "ae", '\u01E3': "ae", '\uA735': "ao", '\uA737': "au", '\uA739': "av", '\uA73B': "av", '\uA73D': "ay", '\u24D1': "b", '\uFF42': "b", '\u1E03': "b", '\u1E05': "b", '\u1E07': "b", '\u0180': "b", '\u0183': "b", '\u0253': "b", '\u24D2': "c", '\uFF43': "c", '\u0107': "c", '\u0109': "c", '\u010B': "c", '\u010D': "c", '\xE7': "c", '\u1E09': "c", '\u0188': "c", '\u023C': "c", '\uA73F': "c", '\u2184': "c", '\u24D3': "d", '\uFF44': "d", '\u1E0B': "d", '\u010F': "d", '\u1E0D': "d", '\u1E11': "d", '\u1E13': "d", '\u1E0F': "d", '\u0111': "d", '\u018C': "d", '\u0256': "d", '\u0257': "d", '\uA77A': "d", '\u01F3': "dz", '\u01C6': "dz", '\u24D4': "e", '\uFF45': "e", '\xE8': "e", '\xE9': "e", '\xEA': "e", '\u1EC1': "e", '\u1EBF': "e", '\u1EC5': "e", '\u1EC3': "e", '\u1EBD': "e", '\u0113': "e", '\u1E15': "e", '\u1E17': "e", '\u0115': "e", '\u0117': "e", '\xEB': "e", '\u1EBB': "e", '\u011B': "e", '\u0205': "e", '\u0207': "e", '\u1EB9': "e", '\u1EC7': "e", '\u0229': "e", '\u1E1D': "e", '\u0119': "e", '\u1E19': "e", '\u1E1B': "e", '\u0247': "e", '\u025B': "e", '\u01DD': "e", '\u24D5': "f", '\uFF46': "f", '\u1E1F': "f", '\u0192': "f", '\uA77C': "f", '\u24D6': "g", '\uFF47': "g", '\u01F5': "g", '\u011D': "g", '\u1E21': "g", '\u011F': "g", '\u0121': "g", '\u01E7': "g", '\u0123': "g", '\u01E5': "g", '\u0260': "g", '\uA7A1': "g", '\u1D79': "g", '\uA77F': "g", '\u24D7': "h", '\uFF48': "h", '\u0125': "h", '\u1E23': "h", '\u1E27': "h", '\u021F': "h", '\u1E25': "h", '\u1E29': "h", '\u1E2B': "h", '\u1E96': "h", '\u0127': "h", '\u2C68': "h", '\u2C76': "h", '\u0265': "h", '\u0195': "hv", '\u24D8': "i", '\uFF49': "i", '\xEC': "i", '\xED': "i", '\xEE': "i", '\u0129': "i", '\u012B': "i", '\u012D': "i", '\xEF': "i", '\u1E2F': "i", '\u1EC9': "i", '\u01D0': "i", '\u0209': "i", '\u020B': "i", '\u1ECB': "i", '\u012F': "i", '\u1E2D': "i", '\u0268': "i", '\u0131': "i", '\u24D9': "j", '\uFF4A': "j", '\u0135': "j", '\u01F0': "j", '\u0249': "j", '\u24DA': "k", '\uFF4B': "k", '\u1E31': "k", '\u01E9': "k", '\u1E33': "k", '\u0137': "k", '\u1E35': "k", '\u0199': "k", '\u2C6A': "k", '\uA741': "k", '\uA743': "k", '\uA745': "k", '\uA7A3': "k", '\u24DB': "l", '\uFF4C': "l", '\u0140': "l", '\u013A': "l", '\u013E': "l", '\u1E37': "l", '\u1E39': "l", '\u013C': "l", '\u1E3D': "l", '\u1E3B': "l", '\u017F': "l", '\u0142': "l", '\u019A': "l", '\u026B': "l", '\u2C61': "l", '\uA749': "l", '\uA781': "l", '\uA747': "l", '\u01C9': "lj", '\u24DC': "m", '\uFF4D': "m", '\u1E3F': "m", '\u1E41': "m", '\u1E43': "m", '\u0271': "m", '\u026F': "m", '\u24DD': "n", '\uFF4E': "n", '\u01F9': "n", '\u0144': "n", '\xF1': "n", '\u1E45': "n", '\u0148': "n", '\u1E47': "n", '\u0146': "n", '\u1E4B': "n", '\u1E49': "n", '\u019E': "n", '\u0272': "n", '\u0149': "n", '\uA791': "n", '\uA7A5': "n", '\u01CC': "nj", '\u24DE': "o", '\uFF4F': "o", '\xF2': "o", '\xF3': "o", '\xF4': "o", '\u1ED3': "o", '\u1ED1': "o", '\u1ED7': "o", '\u1ED5': "o", '\xF5': "o", '\u1E4D': "o", '\u022D': "o", '\u1E4F': "o", '\u014D': "o", '\u1E51': "o", '\u1E53': "o", '\u014F': "o", '\u022F': "o", '\u0231': "o", '\xF6': "o", '\u022B': "o", '\u1ECF': "o", '\u0151': "o", '\u01D2': "o", '\u020D': "o", '\u020F': "o", '\u01A1': "o", '\u1EDD': "o", '\u1EDB': "o", '\u1EE1': "o", '\u1EDF': "o", '\u1EE3': "o", '\u1ECD': "o", '\u1ED9': "o", '\u01EB': "o", '\u01ED': "o", '\xF8': "o", '\u01FF': "o", '\u0254': "o", '\uA74B': "o", '\uA74D': "o", '\u0275': "o", '\u01A3': "oi", '\u0223': "ou", '\uA74F': "oo", '\u24DF': "p", '\uFF50': "p", '\u1E55': "p", '\u1E57': "p", '\u01A5': "p", '\u1D7D': "p", '\uA751': "p", '\uA753': "p", '\uA755': "p", '\u24E0': "q", '\uFF51': "q", '\u024B': "q", '\uA757': "q", '\uA759': "q", '\u24E1': "r", '\uFF52': "r", '\u0155': "r", '\u1E59': "r", '\u0159': "r", '\u0211': "r", '\u0213': "r", '\u1E5B': "r", '\u1E5D': "r", '\u0157': "r", '\u1E5F': "r", '\u024D': "r", '\u027D': "r", '\uA75B': "r", '\uA7A7': "r", '\uA783': "r", '\u24E2': "s", '\uFF53': "s", '\xDF': "s", '\u015B': "s", '\u1E65': "s", '\u015D': "s", '\u1E61': "s", '\u0161': "s", '\u1E67': "s", '\u1E63': "s", '\u1E69': "s", '\u0219': "s", '\u015F': "s", '\u023F': "s", '\uA7A9': "s", '\uA785': "s", '\u1E9B': "s", '\u24E3': "t", '\uFF54': "t", '\u1E6B': "t", '\u1E97': "t", '\u0165': "t", '\u1E6D': "t", '\u021B': "t", '\u0163': "t", '\u1E71': "t", '\u1E6F': "t", '\u0167': "t", '\u01AD': "t", '\u0288': "t", '\u2C66': "t", '\uA787': "t", '\uA729': "tz", '\u24E4': "u", '\uFF55': "u", '\xF9': "u", '\xFA': "u", '\xFB': "u", '\u0169': "u", '\u1E79': "u", '\u016B': "u", '\u1E7B': "u", '\u016D': "u", '\xFC': "u", '\u01DC': "u", '\u01D8': "u", '\u01D6': "u", '\u01DA': "u", '\u1EE7': "u", '\u016F': "u", '\u0171': "u", '\u01D4': "u", '\u0215': "u", '\u0217': "u", '\u01B0': "u", '\u1EEB': "u", '\u1EE9': "u", '\u1EEF': "u", '\u1EED': "u", '\u1EF1': "u", '\u1EE5': "u", '\u1E73': "u", '\u0173': "u", '\u1E77': "u", '\u1E75': "u", '\u0289': "u", '\u24E5': "v", '\uFF56': "v", '\u1E7D': "v", '\u1E7F': "v", '\u028B': "v", '\uA75F': "v", '\u028C': "v", '\uA761': "vy", '\u24E6': "w", '\uFF57': "w", '\u1E81': "w", '\u1E83': "w", '\u0175': "w", '\u1E87': "w", '\u1E85': "w", '\u1E98': "w", '\u1E89': "w", '\u2C73': "w", '\u24E7': "x", '\uFF58': "x", '\u1E8B': "x", '\u1E8D': "x", '\u24E8': "y", '\uFF59': "y", '\u1EF3': "y", '\xFD': "y", '\u0177': "y", '\u1EF9': "y", '\u0233': "y", '\u1E8F': "y", '\xFF': "y", '\u1EF7': "y", '\u1E99': "y", '\u1EF5': "y", '\u01B4': "y", '\u024F': "y", '\u1EFF': "y", '\u24E9': "z", '\uFF5A': "z", '\u017A': "z", '\u1E91': "z", '\u017C': "z", '\u017E': "z", '\u1E93': "z", '\u1E95': "z", '\u01B6': "z", '\u0225': "z", '\u0240': "z", '\u2C6C': "z", '\uA763': "z", '\u0386': '\u0391', '\u0388': '\u0395', '\u0389': '\u0397', '\u038A': '\u0399', '\u03AA': '\u0399', '\u038C': '\u039F', '\u038E': '\u03A5', '\u03AB': '\u03A5', '\u038F': '\u03A9', '\u03AC': '\u03B1', '\u03AD': '\u03B5', '\u03AE': '\u03B7', '\u03AF': '\u03B9', '\u03CA': '\u03B9', '\u0390': '\u03B9', '\u03CC': '\u03BF', '\u03CD': '\u03C5', '\u03CB': '\u03C5', '\u03B0': '\u03C5', '\u03C9': '\u03C9', '\u03C2': '\u03C3' };

  $document = $(document);

  nextUid = function () {
    var counter = 1;return function () {
      return counter++;
    };
  }();

  function reinsertElement(element) {
    var placeholder = $(document.createTextNode(''));

    element.before(placeholder);
    placeholder.before(element);
    placeholder.remove();
  }

  function stripDiacritics(str) {
    // Used 'uni range + named function' from http://jsperf.com/diacritics/18
    function match(a) {
      return DIACRITICS[a] || a;
    }

    return str.replace(/[^\u0000-\u007E]/g, match);
  }

  function indexOf(value, array) {
    var i = 0,
        l = array.length;
    for (; i < l; i = i + 1) {
      if (equal(value, array[i])) return i;
    }
    return -1;
  }

  function measureScrollbar() {
    var $template = $(MEASURE_SCROLLBAR_TEMPLATE);
    $template.appendTo(document.body);

    var dim = {
      width: $template.width() - $template[0].clientWidth,
      height: $template.height() - $template[0].clientHeight
    };
    $template.remove();

    return dim;
  }

  /**
   * Compares equality of a and b
   * @param a
   * @param b
   */
  function equal(a, b) {
    if (a === b) return true;
    if (a === undefined || b === undefined) return false;
    if (a === null || b === null) return false;
    // Check whether 'a' or 'b' is a string (primitive or object).
    // The concatenation of an empty string (+'') converts its argument to a string's primitive.
    if (a.constructor === String) return a + '' === b + ''; // a+'' - in case 'a' is a String object
    if (b.constructor === String) return b + '' === a + ''; // b+'' - in case 'b' is a String object
    return false;
  }

  /**
   * Splits the string into an array of values, transforming each value. An empty array is returned for nulls or empty
   * strings
   * @param string
   * @param separator
   */
  function splitVal(string, separator, transform) {
    var val, i, l;
    if (string === null || string.length < 1) return [];
    val = string.split(separator);
    for (i = 0, l = val.length; i < l; i = i + 1) {
      val[i] = transform(val[i]);
    }return val;
  }

  function getSideBorderPadding(element) {
    return element.outerWidth(false) - element.width();
  }

  function installKeyUpChangeEvent(element) {
    var key = "keyup-change-value";
    element.on("keydown", function () {
      if ($.data(element, key) === undefined) {
        $.data(element, key, element.val());
      }
    });
    element.on("keyup", function () {
      var val = $.data(element, key);
      if (val !== undefined && element.val() !== val) {
        $.removeData(element, key);
        element.trigger("keyup-change");
      }
    });
  }

  /**
   * filters mouse events so an event is fired only if the mouse moved.
   *
   * filters out mouse events that occur when mouse is stationary but
   * the elements under the pointer are scrolled.
   */
  function installFilteredMouseMove(element) {
    element.on("mousemove", function (e) {
      var lastpos = lastMousePosition;
      if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
        $(e.target).trigger("mousemove-filtered", e);
      }
    });
  }

  /**
   * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made
   * within the last quietMillis milliseconds.
   *
   * @param quietMillis number of milliseconds to wait before invoking fn
   * @param fn function to be debounced
   * @param ctx object to be used as this reference within fn
   * @return debounced version of fn
   */
  function debounce(quietMillis, fn, ctx) {
    ctx = ctx || undefined;
    var timeout;
    return function () {
      var args = arguments;
      window.clearTimeout(timeout);
      timeout = window.setTimeout(function () {
        fn.apply(ctx, args);
      }, quietMillis);
    };
  }

  function installDebouncedScroll(threshold, element) {
    var notify = debounce(threshold, function (e) {
      element.trigger("scroll-debounced", e);
    });
    element.on("scroll", function (e) {
      if (indexOf(e.target, element.get()) >= 0) notify(e);
    });
  }

  function focus($el) {
    if ($el[0] === document.activeElement) return;

    /* set the focus in a 0 timeout - that way the focus is set after the processing
        of the current event has finished - which seems like the only reliable way
        to set focus */
    window.setTimeout(function () {
      var el = $el[0],
          pos = $el.val().length,
          range;

      $el.focus();

      /* make sure el received focus so we do not error out when trying to manipulate the caret.
          sometimes modals or others listeners may steal it after its set */
      var isVisible = el.offsetWidth > 0 || el.offsetHeight > 0;
      if (isVisible && el === document.activeElement) {

        /* after the focus is set move the caret to the end, necessary when we val()
            just before setting focus */
        if (el.setSelectionRange) {
          el.setSelectionRange(pos, pos);
        } else if (el.createTextRange) {
          range = el.createTextRange();
          range.collapse(false);
          range.select();
        }
      }
    }, 0);
  }

  function getCursorInfo(el) {
    el = $(el)[0];
    var offset = 0;
    var length = 0;
    if ('selectionStart' in el) {
      offset = el.selectionStart;
      length = el.selectionEnd - offset;
    } else if ('selection' in document) {
      el.focus();
      var sel = document.selection.createRange();
      length = document.selection.createRange().text.length;
      sel.moveStart('character', -el.value.length);
      offset = sel.text.length - length;
    }
    return { offset: offset, length: length };
  }

  function killEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  function killEventImmediately(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function measureTextWidth(e) {
    if (!sizer) {
      var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
      sizer = $(document.createElement("div")).css({
        position: "absolute",
        left: "-10000px",
        top: "-10000px",
        display: "none",
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform,
        whiteSpace: "nowrap"
      });
      sizer.attr("class", "select2-sizer");
      $(document.body).append(sizer);
    }
    sizer.text(e.val());
    return sizer.width();
  }

  function syncCssClasses(dest, src, adapter) {
    var classes,
        replacements = [],
        adapted;

    classes = $.trim(dest.attr("class"));

    if (classes) {
      classes = '' + classes; // for IE which returns object

      $(classes.split(/\s+/)).each2(function () {
        if (this.indexOf("select2-") === 0) {
          replacements.push(this);
        }
      });
    }

    classes = $.trim(src.attr("class"));

    if (classes) {
      classes = '' + classes; // for IE which returns object

      $(classes.split(/\s+/)).each2(function () {
        if (this.indexOf("select2-") !== 0) {
          adapted = adapter(this);

          if (adapted) {
            replacements.push(adapted);
          }
        }
      });
    }

    dest.attr("class", replacements.join(" "));
  }

  function markMatch(text, term, markup, escapeMarkup) {
    var match = stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),
        tl = term.length;

    if (match < 0) {
      markup.push(escapeMarkup(text));
      return;
    }

    markup.push(escapeMarkup(text.substring(0, match)));
    markup.push("<span class='select2-match'>");
    markup.push(escapeMarkup(text.substring(match, match + tl)));
    markup.push("</span>");
    markup.push(escapeMarkup(text.substring(match + tl, text.length)));
  }

  function defaultEscapeMarkup(markup) {
    var replace_map = {
      '\\': '&#92;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#47;'
    };

    return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
      return replace_map[match];
    });
  }

  /**
   * Produces an ajax-based query function
   *
   * @param options object containing configuration parameters
   * @param options.params parameter map for the transport ajax call, can contain such options as cache, jsonpCallback, etc. see $.ajax
   * @param options.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $.ajax
   * @param options.url url for the data
   * @param options.data a function(searchTerm, pageNumber, context) that should return an object containing query string parameters for the above url.
   * @param options.dataType request data type: ajax, jsonp, other datatypes supported by jQuery's $.ajax function or the transport function if specified
   * @param options.quietMillis (optional) milliseconds to wait before making the ajaxRequest, helps debounce the ajax function if invoked too often
   * @param options.results a function(remoteData, pageNumber, query) that converts data returned form the remote request to the format expected by Select2.
   *      The expected format is an object containing the following keys:
   *      results array of objects that will be used as choices
   *      more (optional) boolean indicating whether there are more results available
   *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}
   */
  function ajax(options) {
    var timeout,
        // current scheduled but not yet executed request
    handler = null,
        quietMillis = options.quietMillis || 100,
        ajaxUrl = options.url,
        self = this;

    return function (query) {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(function () {
        var data = options.data,
            // ajax data function
        url = ajaxUrl,
            // ajax url string or function
        transport = options.transport || $.fn.select2.ajaxDefaults.transport,

        // deprecated - to be removed in 4.0  - use params instead
        deprecated = {
          type: options.type || 'GET', // set type of request (GET or POST)
          cache: options.cache || false,
          jsonpCallback: options.jsonpCallback || undefined,
          dataType: options.dataType || "json"
        },
            params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);

        data = data ? data.call(self, query.term, query.page, query.context) : null;
        url = typeof url === 'function' ? url.call(self, query.term, query.page, query.context) : url;

        if (handler && typeof handler.abort === "function") {
          handler.abort();
        }

        if (options.params) {
          if ($.isFunction(options.params)) {
            $.extend(params, options.params.call(self));
          } else {
            $.extend(params, options.params);
          }
        }

        $.extend(params, {
          url: url,
          dataType: options.dataType,
          data: data,
          success: function success(data) {
            // TODO - replace query.page with query so users have access to term, page, etc.
            // added query as third paramter to keep backwards compatibility
            var results = options.results(data, query.page, query);
            query.callback(results);
          },
          error: function error(jqXHR, textStatus, errorThrown) {
            var results = {
              hasError: true,
              jqXHR: jqXHR,
              textStatus: textStatus,
              errorThrown: errorThrown
            };

            query.callback(results);
          }
        });
        handler = transport.call(self, params);
      }, quietMillis);
    };
  }

  /**
   * Produces a query function that works with a local array
   *
   * @param options object containing configuration parameters. The options parameter can either be an array or an
   * object.
   *
   * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.
   *
   * If the object form is used it is assumed that it contains 'data' and 'text' keys. The 'data' key should contain
   * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'
   * key can either be a String in which case it is expected that each element in the 'data' array has a key with the
   * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract
   * the text.
   */
  function local(options) {
    var data = options,
        // data elements
    dataText,
        tmp,
        text = function text(item) {
      return "" + item.text;
    }; // function used to retrieve the text portion of a data item that is matched against the search

    if ($.isArray(data)) {
      tmp = data;
      data = { results: tmp };
    }

    if ($.isFunction(data) === false) {
      tmp = data;
      data = function data() {
        return tmp;
      };
    }

    var dataItem = data();
    if (dataItem.text) {
      text = dataItem.text;
      // if text is not a function we assume it to be a key name
      if (!$.isFunction(text)) {
        dataText = dataItem.text; // we need to store this in a separate variable because in the next step data gets reset and data.text is no longer available
        text = function text(item) {
          return item[dataText];
        };
      }
    }

    return function (query) {
      var t = query.term,
          filtered = { results: [] },
          _process;
      if (t === "") {
        query.callback(data());
        return;
      }

      _process = function process(datum, collection) {
        var group, attr;
        datum = datum[0];
        if (datum.children) {
          group = {};
          for (attr in datum) {
            if (datum.hasOwnProperty(attr)) group[attr] = datum[attr];
          }
          group.children = [];
          $(datum.children).each2(function (i, childDatum) {
            _process(childDatum, group.children);
          });
          if (group.children.length || query.matcher(t, text(group), datum)) {
            collection.push(group);
          }
        } else {
          if (query.matcher(t, text(datum), datum)) {
            collection.push(datum);
          }
        }
      };

      $(data().results).each2(function (i, datum) {
        _process(datum, filtered.results);
      });
      query.callback(filtered);
    };
  }

  // TODO javadoc
  function tags(data) {
    var isFunc = $.isFunction(data);
    return function (query) {
      var t = query.term,
          filtered = { results: [] };
      var result = isFunc ? data(query) : data;
      if ($.isArray(result)) {
        $(result).each(function () {
          var isObject = this.text !== undefined,
              text = isObject ? this.text : this;
          if (t === "" || query.matcher(t, text)) {
            filtered.results.push(isObject ? this : { id: this, text: this });
          }
        });
        query.callback(filtered);
      }
    };
  }

  /**
   * Checks if the formatter function should be used.
   *
   * Throws an error if it is not a function. Returns true if it should be used,
   * false if no formatting should be performed.
   *
   * @param formatter
   */
  function checkFormatter(formatter, formatterName) {
    if ($.isFunction(formatter)) return true;
    if (!formatter) return false;
    if (typeof formatter === 'string') return true;
    throw new Error(formatterName + " must be a string, function, or falsy value");
  }

  /**
   * Returns a given value
   * If given a function, returns its output
   *
   * @param val string|function
   * @param context value of "this" to be passed to function
   * @returns {*}
   */
  function evaluate(val, context) {
    if ($.isFunction(val)) {
      var args = Array.prototype.slice.call(arguments, 2);
      return val.apply(context, args);
    }
    return val;
  }

  function countResults(results) {
    var count = 0;
    $.each(results, function (i, item) {
      if (item.children) {
        count += countResults(item.children);
      } else {
        count++;
      }
    });
    return count;
  }

  /**
   * Default tokenizer. This function uses breaks the input on substring match of any string from the
   * opts.tokenSeparators array and uses opts.createSearchChoice to create the choice object. Both of those
   * two options have to be defined in order for the tokenizer to work.
   *
   * @param input text user has typed so far or pasted into the search field
   * @param selection currently selected choices
   * @param selectCallback function(choice) callback tho add the choice to selection
   * @param opts select2's opts
   * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value
   */
  function defaultTokenizer(input, selection, selectCallback, opts) {
    var original = input,
        // store the original so we can compare and know if we need to tell the search to update its text
    dupe = false,
        // check for whether a token we extracted represents a duplicate selected choice
    token,
        // token
    index,
        // position at which the separator was found
    i,
        l,
        // looping variables
    separator; // the matched separator

    if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;

    while (true) {
      index = -1;

      for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
        separator = opts.tokenSeparators[i];
        index = input.indexOf(separator);
        if (index >= 0) break;
      }

      if (index < 0) break; // did not find any token separator in the input string, bail

      token = input.substring(0, index);
      input = input.substring(index + separator.length);

      if (token.length > 0) {
        token = opts.createSearchChoice.call(this, token, selection);
        if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
          dupe = false;
          for (i = 0, l = selection.length; i < l; i++) {
            if (equal(opts.id(token), opts.id(selection[i]))) {
              dupe = true;break;
            }
          }

          if (!dupe) selectCallback(token);
        }
      }
    }

    if (original !== input) return input;
  }

  function cleanupJQueryElements() {
    var self = this;

    $.each(arguments, function (i, element) {
      self[element].remove();
      self[element] = null;
    });
  }

  /**
   * Creates a new class
   *
   * @param superClass
   * @param methods
   */
  function clazz(SuperClass, methods) {
    var constructor = function constructor() {};
    constructor.prototype = new SuperClass();
    constructor.prototype.constructor = constructor;
    constructor.prototype.parent = SuperClass.prototype;
    constructor.prototype = $.extend(constructor.prototype, methods);
    return constructor;
  }

  AbstractSelect2 = clazz(Object, {

    // abstract
    bind: function bind(func) {
      var self = this;
      return function () {
        func.apply(self, arguments);
      };
    },

    // abstract
    init: function init(opts) {
      var results,
          search,
          resultsSelector = ".select2-results";

      // prepare options
      this.opts = opts = this.prepareOpts(opts);

      this.id = opts.id;

      // destroy if called on an existing component
      if (opts.element.data("select2") !== undefined && opts.element.data("select2") !== null) {
        opts.element.data("select2").destroy();
      }

      this.container = this.createContainer();

      this.liveRegion = $('.select2-hidden-accessible');
      if (this.liveRegion.length == 0) {
        this.liveRegion = $("<span>", {
          role: "status",
          "aria-live": "polite"
        }).addClass("select2-hidden-accessible").appendTo(document.body);
      }

      this.containerId = "s2id_" + (opts.element.attr("id") || "autogen" + nextUid());
      this.containerEventName = this.containerId.replace(/([.])/g, '_').replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
      this.container.attr("id", this.containerId);

      this.container.attr("title", opts.element.attr("title"));

      this.body = $(document.body);

      syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);

      this.container.attr("style", opts.element.attr("style"));
      this.container.css(evaluate(opts.containerCss, this.opts.element));
      this.container.addClass(evaluate(opts.containerCssClass, this.opts.element));

      this.elementTabIndex = this.opts.element.attr("tabindex");

      // swap container for the element
      this.opts.element.data("select2", this).attr("tabindex", "-1").before(this.container).on("click.select2", killEvent); // do not leak click events

      this.container.data("select2", this);

      this.dropdown = this.container.find(".select2-drop");

      syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);

      this.dropdown.addClass(evaluate(opts.dropdownCssClass, this.opts.element));
      this.dropdown.data("select2", this);
      this.dropdown.on("click", killEvent);

      this.results = results = this.container.find(resultsSelector);
      this.search = search = this.container.find("input.select2-input");

      this.queryCount = 0;
      this.resultsPage = 0;
      this.context = null;

      // initialize the container
      this.initContainer();

      this.container.on("click", killEvent);

      installFilteredMouseMove(this.results);

      this.dropdown.on("mousemove-filtered", resultsSelector, this.bind(this.highlightUnderEvent));
      this.dropdown.on("touchstart touchmove touchend", resultsSelector, this.bind(function (event) {
        this._touchEvent = true;
        this.highlightUnderEvent(event);
      }));
      this.dropdown.on("touchmove", resultsSelector, this.bind(this.touchMoved));
      this.dropdown.on("touchstart touchend", resultsSelector, this.bind(this.clearTouchMoved));

      // Waiting for a click event on touch devices to select option and hide dropdown
      // otherwise click will be triggered on an underlying element
      this.dropdown.on('click', this.bind(function (event) {
        if (this._touchEvent) {
          this._touchEvent = false;
          this.selectHighlighted();
        }
      }));

      installDebouncedScroll(80, this.results);
      this.dropdown.on("scroll-debounced", resultsSelector, this.bind(this.loadMoreIfNeeded));

      // do not propagate change event from the search field out of the component
      $(this.container).on("change", ".select2-input", function (e) {
        e.stopPropagation();
      });
      $(this.dropdown).on("change", ".select2-input", function (e) {
        e.stopPropagation();
      });

      // if jquery.mousewheel plugin is installed we can prevent out-of-bounds scrolling of results via mousewheel
      if ($.fn.mousewheel) {
        results.mousewheel(function (e, delta, deltaX, deltaY) {
          var top = results.scrollTop();
          if (deltaY > 0 && top - deltaY <= 0) {
            results.scrollTop(0);
            killEvent(e);
          } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
            results.scrollTop(results.get(0).scrollHeight - results.height());
            killEvent(e);
          }
        });
      }

      installKeyUpChangeEvent(search);
      search.on("keyup-change input paste", this.bind(this.updateResults));
      search.on("focus", function () {
        search.addClass("select2-focused");
      });
      search.on("blur", function () {
        search.removeClass("select2-focused");
      });

      this.dropdown.on("mouseup", resultsSelector, this.bind(function (e) {
        if ($(e.target).closest(".select2-result-selectable").length > 0) {
          this.highlightUnderEvent(e);
          this.selectHighlighted(e);
        }
      }));

      // trap all mouse events from leaving the dropdown. sometimes there may be a modal that is listening
      // for mouse events outside of itself so it can close itself. since the dropdown is now outside the select2's
      // dom it will trigger the popup close, which is not what we want
      // focusin can cause focus wars between modals and select2 since the dropdown is outside the modal.
      this.dropdown.on("click mouseup mousedown touchstart touchend focusin", function (e) {
        e.stopPropagation();
      });

      this.nextSearchTerm = undefined;

      if ($.isFunction(this.opts.initSelection)) {
        // initialize selection based on the current value of the source element
        this.initSelection();

        // if the user has provided a function that can set selection based on the value of the source element
        // we monitor the change event on the element and trigger it, allowing for two way synchronization
        this.monitorSource();
      }

      if (opts.maximumInputLength !== null) {
        this.search.attr("maxlength", opts.maximumInputLength);
      }

      var disabled = opts.element.prop("disabled");
      if (disabled === undefined) disabled = false;
      this.enable(!disabled);

      var readonly = opts.element.prop("readonly");
      if (readonly === undefined) readonly = false;
      this.readonly(readonly);

      // Calculate size of scrollbar
      scrollBarDimensions = scrollBarDimensions || measureScrollbar();

      this.autofocus = opts.element.prop("autofocus");
      opts.element.prop("autofocus", false);
      if (this.autofocus) this.focus();

      this.search.attr("placeholder", opts.searchInputPlaceholder);
    },

    // abstract
    destroy: function destroy() {
      var element = this.opts.element,
          select2 = element.data("select2"),
          self = this;

      this.close();

      if (element.length && element[0].detachEvent && self._sync) {
        element.each(function () {
          if (self._sync) {
            this.detachEvent("onpropertychange", self._sync);
          }
        });
      }
      if (this.propertyObserver) {
        this.propertyObserver.disconnect();
        this.propertyObserver = null;
      }
      this._sync = null;

      if (select2 !== undefined) {
        select2.container.remove();
        select2.liveRegion.remove();
        select2.dropdown.remove();
        element.show().removeData("select2").off(".select2").prop("autofocus", this.autofocus || false);
        if (this.elementTabIndex) {
          element.attr({ tabindex: this.elementTabIndex });
        } else {
          element.removeAttr("tabindex");
        }
        element.show();
      }

      cleanupJQueryElements.call(this, "container", "liveRegion", "dropdown", "results", "search");
    },

    // abstract
    optionToData: function optionToData(element) {
      if (element.is("option")) {
        return {
          id: element.prop("value"),
          text: element.text(),
          element: element.get(),
          css: element.attr("class"),
          disabled: element.prop("disabled"),
          locked: equal(element.attr("locked"), "locked") || equal(element.data("locked"), true)
        };
      } else if (element.is("optgroup")) {
        return {
          text: element.attr("label"),
          children: [],
          element: element.get(),
          css: element.attr("class")
        };
      }
    },

    // abstract
    prepareOpts: function prepareOpts(opts) {
      var element,
          select,
          idKey,
          ajaxUrl,
          self = this;

      element = opts.element;

      if (element.get(0).tagName.toLowerCase() === "select") {
        this.select = select = opts.element;
      }

      if (select) {
        // these options are not allowed when attached to a select because they are picked up off the element itself
        $.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function () {
          if (this in opts) {
            throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.");
          }
        });
      }

      opts = $.extend({}, {
        populateResults: function populateResults(container, results, query) {
          var _populate,
              id = this.opts.id,
              liveRegion = this.liveRegion;

          _populate = function populate(results, container, depth) {

            var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;

            results = opts.sortResults(results, container, query);

            // collect the created nodes for bulk append
            var nodes = [];
            for (i = 0, l = results.length; i < l; i = i + 1) {

              result = results[i];

              disabled = result.disabled === true;
              selectable = !disabled && id(result) !== undefined;

              compound = result.children && result.children.length > 0;

              node = $("<li></li>");
              node.addClass("select2-results-dept-" + depth);
              node.addClass("select2-result");
              node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
              if (disabled) {
                node.addClass("select2-disabled");
              }
              if (compound) {
                node.addClass("select2-result-with-children");
              }
              node.addClass(self.opts.formatResultCssClass(result));
              node.attr("role", "presentation");

              label = $(document.createElement("div"));
              label.addClass("select2-result-label");
              label.attr("id", "select2-result-label-" + nextUid());
              label.attr("role", "option");

              formatted = opts.formatResult(result, label, query, self.opts.escapeMarkup);
              if (formatted !== undefined) {
                label.html(formatted);
                node.append(label);
              }

              if (compound) {

                innerContainer = $("<ul></ul>");
                innerContainer.addClass("select2-result-sub");
                _populate(result.children, innerContainer, depth + 1);
                node.append(innerContainer);
              }

              node.data("select2-data", result);
              nodes.push(node[0]);
            }

            // bulk append the created nodes
            container.append(nodes);
            liveRegion.text(opts.formatMatches(results.length));
          };

          _populate(results, container, 0);
        }
      }, $.fn.select2.defaults, opts);

      if (typeof opts.id !== "function") {
        idKey = opts.id;
        opts.id = function (e) {
          return e[idKey];
        };
      }

      if ($.isArray(opts.element.data("select2Tags"))) {
        if ("tags" in opts) {
          throw "tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + opts.element.attr("id");
        }
        opts.tags = opts.element.data("select2Tags");
      }

      if (select) {
        opts.query = this.bind(function (query) {
          var data = { results: [], more: false },
              term = query.term,
              children,
              placeholderOption,
              _process2;

          _process2 = function process(element, collection) {
            var group;
            if (element.is("option")) {
              if (query.matcher(term, element.text(), element)) {
                collection.push(self.optionToData(element));
              }
            } else if (element.is("optgroup")) {
              group = self.optionToData(element);
              element.children().each2(function (i, elm) {
                _process2(elm, group.children);
              });
              if (group.children.length > 0) {
                collection.push(group);
              }
            }
          };

          children = element.children();

          // ignore the placeholder option if there is one
          if (this.getPlaceholder() !== undefined && children.length > 0) {
            placeholderOption = this.getPlaceholderOption();
            if (placeholderOption) {
              children = children.not(placeholderOption);
            }
          }

          children.each2(function (i, elm) {
            _process2(elm, data.results);
          });

          query.callback(data);
        });
        // this is needed because inside val() we construct choices from options and their id is hardcoded
        opts.id = function (e) {
          return e.id;
        };
      } else {
        if (!("query" in opts)) {

          if ("ajax" in opts) {
            ajaxUrl = opts.element.data("ajax-url");
            if (ajaxUrl && ajaxUrl.length > 0) {
              opts.ajax.url = ajaxUrl;
            }
            opts.query = ajax.call(opts.element, opts.ajax);
          } else if ("data" in opts) {
            opts.query = local(opts.data);
          } else if ("tags" in opts) {
            opts.query = tags(opts.tags);
            if (opts.createSearchChoice === undefined) {
              opts.createSearchChoice = function (term) {
                return { id: $.trim(term), text: $.trim(term) };
              };
            }
            if (opts.initSelection === undefined) {
              opts.initSelection = function (element, callback) {
                var data = [];
                $(splitVal(element.val(), opts.separator, opts.transformVal)).each(function () {
                  var obj = { id: this, text: this },
                      tags = opts.tags;
                  if ($.isFunction(tags)) tags = tags();
                  $(tags).each(function () {
                    if (equal(this.id, obj.id)) {
                      obj = this;return false;
                    }
                  });
                  data.push(obj);
                });

                callback(data);
              };
            }
          }
        }
      }
      if (typeof opts.query !== "function") {
        throw "query function not defined for Select2 " + opts.element.attr("id");
      }

      if (opts.createSearchChoicePosition === 'top') {
        opts.createSearchChoicePosition = function (list, item) {
          list.unshift(item);
        };
      } else if (opts.createSearchChoicePosition === 'bottom') {
        opts.createSearchChoicePosition = function (list, item) {
          list.push(item);
        };
      } else if (typeof opts.createSearchChoicePosition !== "function") {
        throw "invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";
      }

      return opts;
    },

    /**
     * Monitor the original element for changes and update select2 accordingly
     */
    // abstract
    monitorSource: function monitorSource() {
      var el = this.opts.element,
          observer,
          self = this;

      el.on("change.select2", this.bind(function (e) {
        if (this.opts.element.data("select2-change-triggered") !== true) {
          this.initSelection();
        }
      }));

      this._sync = this.bind(function () {

        // sync enabled state
        var disabled = el.prop("disabled");
        if (disabled === undefined) disabled = false;
        this.enable(!disabled);

        var readonly = el.prop("readonly");
        if (readonly === undefined) readonly = false;
        this.readonly(readonly);

        if (this.container) {
          syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
          this.container.addClass(evaluate(this.opts.containerCssClass, this.opts.element));
        }

        if (this.dropdown) {
          syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
          this.dropdown.addClass(evaluate(this.opts.dropdownCssClass, this.opts.element));
        }
      });

      // IE8-10 (IE9/10 won't fire propertyChange via attachEventListener)
      if (el.length && el[0].attachEvent) {
        el.each(function () {
          this.attachEvent("onpropertychange", self._sync);
        });
      }

      // safari, chrome, firefox, IE11
      observer = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
      if (observer !== undefined) {
        if (this.propertyObserver) {
          delete this.propertyObserver;this.propertyObserver = null;
        }
        this.propertyObserver = new observer(function (mutations) {
          $.each(mutations, self._sync);
        });
        this.propertyObserver.observe(el.get(0), { attributes: true, subtree: false });
      }
    },

    // abstract
    triggerSelect: function triggerSelect(data) {
      var evt = $.Event("select2-selecting", { val: this.id(data), object: data, choice: data });
      this.opts.element.trigger(evt);
      return !evt.isDefaultPrevented();
    },

    /**
     * Triggers the change event on the source element
     */
    // abstract
    triggerChange: function triggerChange(details) {

      details = details || {};
      details = $.extend({}, details, { type: "change", val: this.val() });
      // prevents recursive triggering
      this.opts.element.data("select2-change-triggered", true);
      this.opts.element.trigger(details);
      this.opts.element.data("select2-change-triggered", false);

      // some validation frameworks ignore the change event and listen instead to keyup, click for selects
      // so here we trigger the click event manually
      this.opts.element.click();

      // ValidationEngine ignores the change event and listens instead to blur
      // so here we trigger the blur event manually if so desired
      if (this.opts.blurOnChange) this.opts.element.blur();
    },

    //abstract
    isInterfaceEnabled: function isInterfaceEnabled() {
      return this.enabledInterface === true;
    },

    // abstract
    enableInterface: function enableInterface() {
      var enabled = this._enabled && !this._readonly,
          disabled = !enabled;

      if (enabled === this.enabledInterface) return false;

      this.container.toggleClass("select2-container-disabled", disabled);
      this.close();
      this.enabledInterface = enabled;

      return true;
    },

    // abstract
    enable: function enable(enabled) {
      if (enabled === undefined) enabled = true;
      if (this._enabled === enabled) return;
      this._enabled = enabled;

      this.opts.element.prop("disabled", !enabled);
      this.enableInterface();
    },

    // abstract
    disable: function disable() {
      this.enable(false);
    },

    // abstract
    readonly: function readonly(enabled) {
      if (enabled === undefined) enabled = false;
      if (this._readonly === enabled) return;
      this._readonly = enabled;

      this.opts.element.prop("readonly", enabled);
      this.enableInterface();
    },

    // abstract
    opened: function opened() {
      return this.container ? this.container.hasClass("select2-dropdown-open") : false;
    },

    // abstract
    positionDropdown: function positionDropdown() {
      var $dropdown = this.dropdown,
          container = this.container,
          offset = container.offset(),
          height = container.outerHeight(false),
          width = container.outerWidth(false),
          dropHeight = $dropdown.outerHeight(false),
          $window = $(window),
          windowWidth = $window.width(),
          windowHeight = $window.height(),
          viewPortRight = $window.scrollLeft() + windowWidth,
          viewportBottom = $window.scrollTop() + windowHeight,
          dropTop = offset.top + height,
          dropLeft = offset.left,
          enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
          enoughRoomAbove = offset.top - dropHeight >= $window.scrollTop(),
          dropWidth = $dropdown.outerWidth(false),
          enoughRoomOnRight = function enoughRoomOnRight() {
        return dropLeft + dropWidth <= viewPortRight;
      },
          enoughRoomOnLeft = function enoughRoomOnLeft() {
        return offset.left + viewPortRight + container.outerWidth(false) > dropWidth;
      },
          aboveNow = $dropdown.hasClass("select2-drop-above"),
          bodyOffset,
          above,
          changeDirection,
          css,
          resultsListNode;

      // always prefer the current above/below alignment, unless there is not enough room
      if (aboveNow) {
        above = true;
        if (!enoughRoomAbove && enoughRoomBelow) {
          changeDirection = true;
          above = false;
        }
      } else {
        above = false;
        if (!enoughRoomBelow && enoughRoomAbove) {
          changeDirection = true;
          above = true;
        }
      }

      //if we are changing direction we need to get positions when dropdown is hidden;
      if (changeDirection) {
        $dropdown.hide();
        offset = this.container.offset();
        height = this.container.outerHeight(false);
        width = this.container.outerWidth(false);
        dropHeight = $dropdown.outerHeight(false);
        viewPortRight = $window.scrollLeft() + windowWidth;
        viewportBottom = $window.scrollTop() + windowHeight;
        dropTop = offset.top + height;
        dropLeft = offset.left;
        dropWidth = $dropdown.outerWidth(false);
        $dropdown.show();

        // fix so the cursor does not move to the left within the search-textbox in IE
        this.focusSearch();
      }

      if (this.opts.dropdownAutoWidth) {
        resultsListNode = $('.select2-results', $dropdown)[0];
        $dropdown.addClass('select2-drop-auto-width');
        $dropdown.css('width', '');
        // Add scrollbar width to dropdown if vertical scrollbar is present
        dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);
        dropWidth > width ? width = dropWidth : dropWidth = width;
        dropHeight = $dropdown.outerHeight(false);
      } else {
        this.container.removeClass('select2-drop-auto-width');
      }

      //console.log("below/ droptop:", dropTop, "dropHeight", dropHeight, "sum", (dropTop+dropHeight)+" viewport bottom", viewportBottom, "enough?", enoughRoomBelow);
      //console.log("above/ offset.top", offset.top, "dropHeight", dropHeight, "top", (offset.top-dropHeight), "scrollTop", this.body.scrollTop(), "enough?", enoughRoomAbove);

      // fix positioning when body has an offset and is not position: static
      if (this.body.css('position') !== 'static') {
        bodyOffset = this.body.offset();
        dropTop -= bodyOffset.top;
        dropLeft -= bodyOffset.left;
      }

      if (!enoughRoomOnRight() && enoughRoomOnLeft()) {
        dropLeft = offset.left + this.container.outerWidth(false) - dropWidth;
      }

      css = {
        left: dropLeft,
        width: width
      };

      if (above) {
        css.top = offset.top - dropHeight;
        css.bottom = 'auto';
        this.container.addClass("select2-drop-above");
        $dropdown.addClass("select2-drop-above");
      } else {
        css.top = dropTop;
        css.bottom = 'auto';
        this.container.removeClass("select2-drop-above");
        $dropdown.removeClass("select2-drop-above");
      }
      css = $.extend(css, evaluate(this.opts.dropdownCss, this.opts.element));

      $dropdown.css(css);
    },

    // abstract
    shouldOpen: function shouldOpen() {
      var event;

      if (this.opened()) return false;

      if (this._enabled === false || this._readonly === true) return false;

      event = $.Event("select2-opening");
      this.opts.element.trigger(event);
      return !event.isDefaultPrevented();
    },

    // abstract
    clearDropdownAlignmentPreference: function clearDropdownAlignmentPreference() {
      // clear the classes used to figure out the preference of where the dropdown should be opened
      this.container.removeClass("select2-drop-above");
      this.dropdown.removeClass("select2-drop-above");
    },

    /**
     * Opens the dropdown
     *
     * @return {Boolean} whether or not dropdown was opened. This method will return false if, for example,
     * the dropdown is already open, or if the 'open' event listener on the element called preventDefault().
     */
    // abstract
    open: function open() {

      if (!this.shouldOpen()) return false;

      this.opening();

      // Only bind the document mousemove when the dropdown is visible
      $document.on("mousemove.select2Event", function (e) {
        lastMousePosition.x = e.pageX;
        lastMousePosition.y = e.pageY;
      });

      return true;
    },

    /**
     * Performs the opening of the dropdown
     */
    // abstract
    opening: function opening() {
      var cid = this.containerEventName,
          scroll = "scroll." + cid,
          resize = "resize." + cid,
          orient = "orientationchange." + cid,
          mask;

      this.container.addClass("select2-dropdown-open").addClass("select2-container-active");

      this.clearDropdownAlignmentPreference();

      if (this.dropdown[0] !== this.body.children().last()[0]) {
        this.dropdown.detach().appendTo(this.body);
      }

      // create the dropdown mask if doesn't already exist
      mask = $("#select2-drop-mask");
      if (mask.length === 0) {
        mask = $(document.createElement("div"));
        mask.attr("id", "select2-drop-mask").attr("class", "select2-drop-mask");
        mask.hide();
        mask.appendTo(this.body);
        mask.on("mousedown touchstart click", function (e) {
          // Prevent IE from generating a click event on the body
          reinsertElement(mask);

          var dropdown = $("#select2-drop"),
              self;
          if (dropdown.length > 0) {
            self = dropdown.data("select2");
            if (self.opts.selectOnBlur) {
              self.selectHighlighted({ noFocus: true });
            }
            self.close();
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }

      // ensure the mask is always right before the dropdown
      if (this.dropdown.prev()[0] !== mask[0]) {
        this.dropdown.before(mask);
      }

      // move the global id to the correct dropdown
      $("#select2-drop").removeAttr("id");
      this.dropdown.attr("id", "select2-drop");

      // show the elements
      mask.show();

      this.positionDropdown();
      this.dropdown.show();
      this.positionDropdown();

      this.dropdown.addClass("select2-drop-active");

      // attach listeners to events that can change the position of the container and thus require
      // the position of the dropdown to be updated as well so it does not come unglued from the container
      var that = this;
      this.container.parents().add(window).each(function () {
        $(this).on(resize + " " + scroll + " " + orient, function (e) {
          if (that.opened()) that.positionDropdown();
        });
      });
    },

    // abstract
    close: function close() {
      if (!this.opened()) return;

      var cid = this.containerEventName,
          scroll = "scroll." + cid,
          resize = "resize." + cid,
          orient = "orientationchange." + cid;

      // unbind event listeners
      this.container.parents().add(window).each(function () {
        $(this).off(scroll).off(resize).off(orient);
      });

      this.clearDropdownAlignmentPreference();

      $("#select2-drop-mask").hide();
      this.dropdown.removeAttr("id"); // only the active dropdown has the select2-drop id
      this.dropdown.hide();
      this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active");
      this.results.empty();

      // Now that the dropdown is closed, unbind the global document mousemove event
      $document.off("mousemove.select2Event");

      this.clearSearch();
      this.search.removeClass("select2-active");
      this.opts.element.trigger($.Event("select2-close"));
    },

    /**
     * Opens control, sets input value, and updates results.
     */
    // abstract
    externalSearch: function externalSearch(term) {
      this.open();
      this.search.val(term);
      this.updateResults(false);
    },

    // abstract
    clearSearch: function clearSearch() {},

    //abstract
    getMaximumSelectionSize: function getMaximumSelectionSize() {
      return evaluate(this.opts.maximumSelectionSize, this.opts.element);
    },

    // abstract
    ensureHighlightVisible: function ensureHighlightVisible() {
      var results = this.results,
          children,
          index,
          child,
          hb,
          rb,
          y,
          more,
          topOffset;

      index = this.highlight();

      if (index < 0) return;

      if (index == 0) {

        // if the first element is highlighted scroll all the way to the top,
        // that way any unselectable headers above it will also be scrolled
        // into view

        results.scrollTop(0);
        return;
      }

      children = this.findHighlightableChoices().find('.select2-result-label');

      child = $(children[index]);

      topOffset = (child.offset() || {}).top || 0;

      hb = topOffset + child.outerHeight(true);

      // if this is the last child lets also make sure select2-more-results is visible
      if (index === children.length - 1) {
        more = results.find("li.select2-more-results");
        if (more.length > 0) {
          hb = more.offset().top + more.outerHeight(true);
        }
      }

      rb = results.offset().top + results.outerHeight(false);
      if (hb > rb) {
        results.scrollTop(results.scrollTop() + (hb - rb));
      }
      y = topOffset - results.offset().top;

      // make sure the top of the element is visible
      if (y < 0 && child.css('display') != 'none') {
        results.scrollTop(results.scrollTop() + y); // y is negative
      }
    },

    // abstract
    findHighlightableChoices: function findHighlightableChoices() {
      return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)");
    },

    // abstract
    moveHighlight: function moveHighlight(delta) {
      var choices = this.findHighlightableChoices(),
          index = this.highlight();

      while (index > -1 && index < choices.length) {
        index += delta;
        var choice = $(choices[index]);
        if (choice.hasClass("select2-result-selectable") && !choice.hasClass("select2-disabled") && !choice.hasClass("select2-selected")) {
          this.highlight(index);
          break;
        }
      }
    },

    // abstract
    highlight: function highlight(index) {
      var choices = this.findHighlightableChoices(),
          choice,
          data;

      if (arguments.length === 0) {
        return indexOf(choices.filter(".select2-highlighted")[0], choices.get());
      }

      if (index >= choices.length) index = choices.length - 1;
      if (index < 0) index = 0;

      this.removeHighlight();

      choice = $(choices[index]);
      choice.addClass("select2-highlighted");

      // ensure assistive technology can determine the active choice
      this.search.attr("aria-activedescendant", choice.find(".select2-result-label").attr("id"));

      this.ensureHighlightVisible();

      this.liveRegion.text(choice.text());

      data = choice.data("select2-data");
      if (data) {
        this.opts.element.trigger({ type: "select2-highlight", val: this.id(data), choice: data });
      }
    },

    removeHighlight: function removeHighlight() {
      this.results.find(".select2-highlighted").removeClass("select2-highlighted");
    },

    touchMoved: function touchMoved() {
      this._touchMoved = true;
    },

    clearTouchMoved: function clearTouchMoved() {
      this._touchMoved = false;
    },

    // abstract
    countSelectableResults: function countSelectableResults() {
      return this.findHighlightableChoices().length;
    },

    // abstract
    highlightUnderEvent: function highlightUnderEvent(event) {
      var el = $(event.target).closest(".select2-result-selectable");
      if (el.length > 0 && !el.is(".select2-highlighted")) {
        var choices = this.findHighlightableChoices();
        this.highlight(choices.index(el));
      } else if (el.length == 0) {
        // if we are over an unselectable item remove all highlights
        this.removeHighlight();
      }
    },

    // abstract
    loadMoreIfNeeded: function loadMoreIfNeeded() {
      var results = this.results,
          more = results.find("li.select2-more-results"),
          below,
          // pixels the element is below the scroll fold, below==0 is when the element is starting to be visible
      page = this.resultsPage + 1,
          self = this,
          term = this.search.val(),
          context = this.context;

      if (more.length === 0) return;
      below = more.offset().top - results.offset().top - results.height();

      if (below <= this.opts.loadMorePadding) {
        more.addClass("select2-active");
        this.opts.query({
          element: this.opts.element,
          term: term,
          page: page,
          context: context,
          matcher: this.opts.matcher,
          callback: this.bind(function (data) {

            // ignore a response if the select2 has been closed before it was received
            if (!self.opened()) return;

            self.opts.populateResults.call(this, results, data.results, { term: term, page: page, context: context });
            self.postprocessResults(data, false, false);

            if (data.more === true) {
              more.detach().appendTo(results).html(self.opts.escapeMarkup(evaluate(self.opts.formatLoadMore, self.opts.element, page + 1)));
              window.setTimeout(function () {
                self.loadMoreIfNeeded();
              }, 10);
            } else {
              more.remove();
            }
            self.positionDropdown();
            self.resultsPage = page;
            self.context = data.context;
            this.opts.element.trigger({ type: "select2-loaded", items: data });
          }) });
      }
    },

    /**
     * Default tokenizer function which does nothing
     */
    tokenize: function tokenize() {},

    /**
     * @param initial whether or not this is the call to this method right after the dropdown has been opened
     */
    // abstract
    updateResults: function updateResults(initial) {
      var search = this.search,
          results = this.results,
          opts = this.opts,
          data,
          self = this,
          input,
          term = search.val(),
          lastTerm = $.data(this.container, "select2-last-term"),

      // sequence number used to drop out-of-order responses
      queryNumber;

      // prevent duplicate queries against the same term
      if (initial !== true && lastTerm && equal(term, lastTerm)) return;

      $.data(this.container, "select2-last-term", term);

      // if the search is currently hidden we do not alter the results
      if (initial !== true && (this.showSearchInput === false || !this.opened())) {
        return;
      }

      function postRender() {
        search.removeClass("select2-active");
        self.positionDropdown();
        if (results.find('.select2-no-results,.select2-selection-limit,.select2-searching').length) {
          self.liveRegion.text(results.text());
        } else {
          self.liveRegion.text(self.opts.formatMatches(results.find('.select2-result-selectable:not(".select2-selected")').length));
        }
      }

      function render(html) {
        results.html(html);
        postRender();
      }

      queryNumber = ++this.queryCount;

      var maxSelSize = this.getMaximumSelectionSize();
      if (maxSelSize >= 1) {
        data = this.data();
        if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, "formatSelectionTooBig")) {
          render("<li class='select2-selection-limit'>" + evaluate(opts.formatSelectionTooBig, opts.element, maxSelSize) + "</li>");
          return;
        }
      }

      if (search.val().length < opts.minimumInputLength) {
        if (checkFormatter(opts.formatInputTooShort, "formatInputTooShort")) {
          render("<li class='select2-no-results'>" + evaluate(opts.formatInputTooShort, opts.element, search.val(), opts.minimumInputLength) + "</li>");
        } else {
          render("");
        }
        if (initial && this.showSearch) this.showSearch(true);
        return;
      }

      if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
        if (checkFormatter(opts.formatInputTooLong, "formatInputTooLong")) {
          render("<li class='select2-no-results'>" + evaluate(opts.formatInputTooLong, opts.element, search.val(), opts.maximumInputLength) + "</li>");
        } else {
          render("");
        }
        return;
      }

      if (opts.formatSearching && this.findHighlightableChoices().length === 0) {
        render("<li class='select2-searching'>" + evaluate(opts.formatSearching, opts.element) + "</li>");
      }

      search.addClass("select2-active");

      this.removeHighlight();

      // give the tokenizer a chance to pre-process the input
      input = this.tokenize();
      if (input != undefined && input != null) {
        search.val(input);
      }

      this.resultsPage = 1;

      opts.query({
        element: opts.element,
        term: search.val(),
        page: this.resultsPage,
        context: null,
        matcher: opts.matcher,
        callback: this.bind(function (data) {
          var def; // default choice

          // ignore old responses
          if (queryNumber != this.queryCount) {
            return;
          }

          // ignore a response if the select2 has been closed before it was received
          if (!this.opened()) {
            this.search.removeClass("select2-active");
            return;
          }

          // handle ajax error
          if (data.hasError !== undefined && checkFormatter(opts.formatAjaxError, "formatAjaxError")) {
            render("<li class='select2-ajax-error'>" + evaluate(opts.formatAjaxError, opts.element, data.jqXHR, data.textStatus, data.errorThrown) + "</li>");
            return;
          }

          // save context, if any
          this.context = data.context === undefined ? null : data.context;
          // create a default choice and prepend it to the list
          if (this.opts.createSearchChoice && search.val() !== "") {
            def = this.opts.createSearchChoice.call(self, search.val(), data.results);
            if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
              if ($(data.results).filter(function () {
                return equal(self.id(this), self.id(def));
              }).length === 0) {
                this.opts.createSearchChoicePosition(data.results, def);
              }
            }
          }

          if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, "formatNoMatches")) {
            render("<li class='select2-no-results'>" + evaluate(opts.formatNoMatches, opts.element, search.val()) + "</li>");
            return;
          }

          results.empty();
          self.opts.populateResults.call(this, results, data.results, { term: search.val(), page: this.resultsPage, context: null });

          if (data.more === true && checkFormatter(opts.formatLoadMore, "formatLoadMore")) {
            results.append("<li class='select2-more-results'>" + opts.escapeMarkup(evaluate(opts.formatLoadMore, opts.element, this.resultsPage)) + "</li>");
            window.setTimeout(function () {
              self.loadMoreIfNeeded();
            }, 10);
          }

          this.postprocessResults(data, initial);

          postRender();

          this.opts.element.trigger({ type: "select2-loaded", items: data });
        }) });
    },

    // abstract
    cancel: function cancel() {
      this.close();
    },

    // abstract
    blur: function blur() {
      // if selectOnBlur == true, select the currently highlighted option
      if (this.opts.selectOnBlur) this.selectHighlighted({ noFocus: true });

      this.close();
      this.container.removeClass("select2-container-active");
      // synonymous to .is(':focus'), which is available in jquery >= 1.6
      if (this.search[0] === document.activeElement) {
        this.search.blur();
      }
      this.clearSearch();
      this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
    },

    // abstract
    focusSearch: function focusSearch() {
      focus(this.search);
    },

    // abstract
    selectHighlighted: function selectHighlighted(options) {
      if (this._touchMoved) {
        this.clearTouchMoved();
        return;
      }
      var index = this.highlight(),
          highlighted = this.results.find(".select2-highlighted"),
          data = highlighted.closest('.select2-result').data("select2-data");

      if (data) {
        this.highlight(index);
        this.onSelect(data, options);
      } else if (options && options.noFocus) {
        this.close();
      }
    },

    // abstract
    getPlaceholder: function getPlaceholder() {
      var placeholderOption;
      return this.opts.element.attr("placeholder") || this.opts.element.attr("data-placeholder") || // jquery 1.4 compat
      this.opts.element.data("placeholder") || this.opts.placeholder || ((placeholderOption = this.getPlaceholderOption()) !== undefined ? placeholderOption.text() : undefined);
    },

    // abstract
    getPlaceholderOption: function getPlaceholderOption() {
      if (this.select) {
        var firstOption = this.select.children('option').first();
        if (this.opts.placeholderOption !== undefined) {
          //Determine the placeholder option based on the specified placeholderOption setting
          return this.opts.placeholderOption === "first" && firstOption || typeof this.opts.placeholderOption === "function" && this.opts.placeholderOption(this.select);
        } else if ($.trim(firstOption.text()) === "" && firstOption.val() === "") {
          //No explicit placeholder option specified, use the first if it's blank
          return firstOption;
        }
      }
    },

    /**
     * Get the desired width for the container element.  This is
     * derived first from option `width` passed to select2, then
     * the inline 'style' on the original element, and finally
     * falls back to the jQuery calculated element width.
     */
    // abstract
    initContainerWidth: function initContainerWidth() {
      function resolveContainerWidth() {
        var style, attrs, matches, i, l, attr;

        if (this.opts.width === "off") {
          return null;
        } else if (this.opts.width === "element") {
          return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
        } else if (this.opts.width === "copy" || this.opts.width === "resolve") {
          // check if there is inline style on the element that contains width
          style = this.opts.element.attr('style');
          if (style !== undefined) {
            attrs = style.split(';');
            for (i = 0, l = attrs.length; i < l; i = i + 1) {
              attr = attrs[i].replace(/\s/g, '');
              matches = attr.match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i);
              if (matches !== null && matches.length >= 1) return matches[1];
            }
          }

          if (this.opts.width === "resolve") {
            // next check if css('width') can resolve a width that is percent based, this is sometimes possible
            // when attached to input type=hidden or elements hidden via css
            style = this.opts.element.css('width');
            if (style.indexOf("%") > 0) return style;

            // finally, fallback on the calculated width of the element
            return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
          }

          return null;
        } else if ($.isFunction(this.opts.width)) {
          return this.opts.width();
        } else {
          return this.opts.width;
        }
      };

      var width = resolveContainerWidth.call(this);
      if (width !== null) {
        this.container.css("width", width);
      }
    }
  });

  SingleSelect2 = clazz(AbstractSelect2, {

    // single

    createContainer: function createContainer() {
      var container = $(document.createElement("div")).attr({
        "class": "select2-container"
      }).html(["<a href='javascript:void(0)' class='select2-choice' tabindex='-1'>", "   <span class='select2-chosen'>&#160;</span><abbr class='select2-search-choice-close'></abbr>", "   <span class='select2-arrow' role='presentation'><b role='presentation'></b></span>", "</a>", "<label for='' class='select2-offscreen'></label>", "<input class='select2-focusser select2-offscreen' type='text' aria-haspopup='true' role='button' />", "<div class='select2-drop select2-display-none'>", "   <div class='select2-search'>", "       <label for='' class='select2-offscreen'></label>", "       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'", "       aria-autocomplete='list' />", "   </div>", "   <ul class='select2-results' role='listbox'>", "   </ul>", "</div>"].join(""));
      return container;
    },

    // single
    enableInterface: function enableInterface() {
      if (this.parent.enableInterface.apply(this, arguments)) {
        this.focusser.prop("disabled", !this.isInterfaceEnabled());
      }
    },

    // single
    opening: function opening() {
      var el, range, len;

      if (this.opts.minimumResultsForSearch >= 0) {
        this.showSearch(true);
      }

      this.parent.opening.apply(this, arguments);

      if (this.showSearchInput !== false) {
        // IE appends focusser.val() at the end of field :/ so we manually insert it at the beginning using a range
        // all other browsers handle this just fine

        this.search.val(this.focusser.val());
      }
      if (this.opts.shouldFocusInput(this)) {
        this.search.focus();
        // move the cursor to the end after focussing, otherwise it will be at the beginning and
        // new text will appear *before* focusser.val()
        el = this.search.get(0);
        if (el.createTextRange) {
          range = el.createTextRange();
          range.collapse(false);
          range.select();
        } else if (el.setSelectionRange) {
          len = this.search.val().length;
          el.setSelectionRange(len, len);
        }
      }

      // initializes search's value with nextSearchTerm (if defined by user)
      // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter
      if (this.search.val() === "") {
        if (this.nextSearchTerm != undefined) {
          this.search.val(this.nextSearchTerm);
          this.search.select();
        }
      }

      this.focusser.prop("disabled", true).val("");
      this.updateResults(true);
      this.opts.element.trigger($.Event("select2-open"));
    },

    // single
    close: function close() {
      if (!this.opened()) return;
      this.parent.close.apply(this, arguments);

      this.focusser.prop("disabled", false);

      if (this.opts.shouldFocusInput(this)) {
        this.focusser.focus();
      }
    },

    // single
    focus: function focus() {
      if (this.opened()) {
        this.close();
      } else {
        this.focusser.prop("disabled", false);
        if (this.opts.shouldFocusInput(this)) {
          this.focusser.focus();
        }
      }
    },

    // single
    isFocused: function isFocused() {
      return this.container.hasClass("select2-container-active");
    },

    // single
    cancel: function cancel() {
      this.parent.cancel.apply(this, arguments);
      this.focusser.prop("disabled", false);

      if (this.opts.shouldFocusInput(this)) {
        this.focusser.focus();
      }
    },

    // single
    destroy: function destroy() {
      $("label[for='" + this.focusser.attr('id') + "']").attr('for', this.opts.element.attr("id"));
      this.parent.destroy.apply(this, arguments);

      cleanupJQueryElements.call(this, "selection", "focusser");
    },

    // single
    initContainer: function initContainer() {

      var selection,
          container = this.container,
          dropdown = this.dropdown,
          idSuffix = nextUid(),
          elementLabel;

      if (this.opts.minimumResultsForSearch < 0) {
        this.showSearch(false);
      } else {
        this.showSearch(true);
      }

      this.selection = selection = container.find(".select2-choice");

      this.focusser = container.find(".select2-focusser");

      // add aria associations
      selection.find(".select2-chosen").attr("id", "select2-chosen-" + idSuffix);
      this.focusser.attr("aria-labelledby", "select2-chosen-" + idSuffix);
      this.results.attr("id", "select2-results-" + idSuffix);
      this.search.attr("aria-owns", "select2-results-" + idSuffix);

      // rewrite labels from original element to focusser
      this.focusser.attr("id", "s2id_autogen" + idSuffix);

      elementLabel = $("label[for='" + this.opts.element.attr("id") + "']");
      this.opts.element.focus(this.bind(function () {
        this.focus();
      }));

      this.focusser.prev().text(elementLabel.text()).attr('for', this.focusser.attr('id'));

      // Ensure the original element retains an accessible name
      var originalTitle = this.opts.element.attr("title");
      this.opts.element.attr("title", originalTitle || elementLabel.text());

      this.focusser.attr("tabindex", this.elementTabIndex);

      // write label for search field using the label from the focusser element
      this.search.attr("id", this.focusser.attr('id') + '_search');

      this.search.prev().text($("label[for='" + this.focusser.attr('id') + "']").text()).attr('for', this.search.attr('id'));

      this.search.on("keydown", this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;

        // filter 229 keyCodes (input method editor is processing key input)
        if (229 == e.keyCode) return;

        if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
          // prevent the page from scrolling
          killEvent(e);
          return;
        }

        switch (e.which) {
          case KEY.UP:
          case KEY.DOWN:
            this.moveHighlight(e.which === KEY.UP ? -1 : 1);
            killEvent(e);
            return;
          case KEY.ENTER:
            this.selectHighlighted();
            killEvent(e);
            return;
          case KEY.TAB:
            this.selectHighlighted({ noFocus: true });
            return;
          case KEY.ESC:
            this.cancel(e);
            killEvent(e);
            return;
        }
      }));

      this.search.on("blur", this.bind(function (e) {
        // a workaround for chrome to keep the search field focussed when the scroll bar is used to scroll the dropdown.
        // without this the search field loses focus which is annoying
        if (document.activeElement === this.body.get(0)) {
          window.setTimeout(this.bind(function () {
            if (this.opened()) {
              this.search.focus();
            }
          }), 0);
        }
      }));

      this.focusser.on("keydown", this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
          return;
        }

        if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {
          killEvent(e);
          return;
        }

        if (e.which == KEY.DOWN || e.which == KEY.UP || e.which == KEY.ENTER && this.opts.openOnEnter) {

          if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;

          this.open();
          killEvent(e);
          return;
        }

        if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {
          if (this.opts.allowClear) {
            this.clear();
          }
          killEvent(e);
          return;
        }
      }));

      installKeyUpChangeEvent(this.focusser);
      this.focusser.on("keyup-change input", this.bind(function (e) {
        if (this.opts.minimumResultsForSearch >= 0) {
          e.stopPropagation();
          if (this.opened()) return;
          this.open();
        }
      }));

      selection.on("mousedown touchstart", "abbr", this.bind(function (e) {
        if (!this.isInterfaceEnabled()) {
          return;
        }

        this.clear();
        killEventImmediately(e);
        this.close();

        if (this.selection) {
          this.selection.focus();
        }
      }));

      selection.on("mousedown touchstart", this.bind(function (e) {
        // Prevent IE from generating a click event on the body
        reinsertElement(selection);

        if (!this.container.hasClass("select2-container-active")) {
          this.opts.element.trigger($.Event("select2-focus"));
        }

        if (this.opened()) {
          this.close();
        } else if (this.isInterfaceEnabled()) {
          this.open();
        }

        killEvent(e);
      }));

      dropdown.on("mousedown touchstart", this.bind(function () {
        if (this.opts.shouldFocusInput(this)) {
          this.search.focus();
        }
      }));

      selection.on("focus", this.bind(function (e) {
        killEvent(e);
      }));

      this.focusser.on("focus", this.bind(function () {
        if (!this.container.hasClass("select2-container-active")) {
          this.opts.element.trigger($.Event("select2-focus"));
        }
        this.container.addClass("select2-container-active");
      })).on("blur", this.bind(function () {
        if (!this.opened()) {
          this.container.removeClass("select2-container-active");
          this.opts.element.trigger($.Event("select2-blur"));
        }
      }));
      this.search.on("focus", this.bind(function () {
        if (!this.container.hasClass("select2-container-active")) {
          this.opts.element.trigger($.Event("select2-focus"));
        }
        this.container.addClass("select2-container-active");
      }));

      this.initContainerWidth();
      this.opts.element.hide();
      this.setPlaceholder();
    },

    // single
    clear: function clear(triggerChange) {
      var data = this.selection.data("select2-data");
      if (data) {
        // guard against queued quick consecutive clicks
        var evt = $.Event("select2-clearing");
        this.opts.element.trigger(evt);
        if (evt.isDefaultPrevented()) {
          return;
        }
        var placeholderOption = this.getPlaceholderOption();
        this.opts.element.val(placeholderOption ? placeholderOption.val() : "");
        this.selection.find(".select2-chosen").empty();
        this.selection.removeData("select2-data");
        this.setPlaceholder();

        if (triggerChange !== false) {
          this.opts.element.trigger({ type: "select2-removed", val: this.id(data), choice: data });
          this.triggerChange({ removed: data });
        }
      }
    },

    /**
     * Sets selection based on source element's value
     */
    // single
    initSelection: function initSelection() {
      var selected;
      if (this.isPlaceholderOptionSelected()) {
        this.updateSelection(null);
        this.close();
        this.setPlaceholder();
      } else {
        var self = this;
        this.opts.initSelection.call(null, this.opts.element, function (selected) {
          if (selected !== undefined && selected !== null) {
            self.updateSelection(selected);
            self.close();
            self.setPlaceholder();
            self.nextSearchTerm = self.opts.nextSearchTerm(selected, self.search.val());
          }
        });
      }
    },

    isPlaceholderOptionSelected: function isPlaceholderOptionSelected() {
      var placeholderOption;
      if (this.getPlaceholder() === undefined) return false; // no placeholder specified so no option should be considered
      return (placeholderOption = this.getPlaceholderOption()) !== undefined && placeholderOption.prop("selected") || this.opts.element.val() === "" || this.opts.element.val() === undefined || this.opts.element.val() === null;
    },

    // single
    prepareOpts: function prepareOpts() {
      var opts = this.parent.prepareOpts.apply(this, arguments),
          self = this;

      if (opts.element.get(0).tagName.toLowerCase() === "select") {
        // install the selection initializer
        opts.initSelection = function (element, callback) {
          var selected = element.find("option").filter(function () {
            return this.selected && !this.disabled;
          });
          // a single select box always has a value, no need to null check 'selected'
          callback(self.optionToData(selected));
        };
      } else if ("data" in opts) {
        // install default initSelection when applied to hidden input and data is local
        opts.initSelection = opts.initSelection || function (element, callback) {
          var id = element.val();
          //search in data by id, storing the actual matching item
          var match = null;
          opts.query({
            matcher: function matcher(term, text, el) {
              var is_match = equal(id, opts.id(el));
              if (is_match) {
                match = el;
              }
              return is_match;
            },
            callback: !$.isFunction(callback) ? $.noop : function () {
              callback(match);
            }
          });
        };
      }

      return opts;
    },

    // single
    getPlaceholder: function getPlaceholder() {
      // if a placeholder is specified on a single select without a valid placeholder option ignore it
      if (this.select) {
        if (this.getPlaceholderOption() === undefined) {
          return undefined;
        }
      }

      return this.parent.getPlaceholder.apply(this, arguments);
    },

    // single
    setPlaceholder: function setPlaceholder() {
      var placeholder = this.getPlaceholder();

      if (this.isPlaceholderOptionSelected() && placeholder !== undefined) {

        // check for a placeholder option if attached to a select
        if (this.select && this.getPlaceholderOption() === undefined) return;

        this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(placeholder));

        this.selection.addClass("select2-default");

        this.container.removeClass("select2-allowclear");
      }
    },

    // single
    postprocessResults: function postprocessResults(data, initial, noHighlightUpdate) {
      var selected = 0,
          self = this,
          showSearchInput = true;

      // find the selected element in the result list

      this.findHighlightableChoices().each2(function (i, elm) {
        if (equal(self.id(elm.data("select2-data")), self.opts.element.val())) {
          selected = i;
          return false;
        }
      });

      // and highlight it
      if (noHighlightUpdate !== false) {
        if (initial === true && selected >= 0) {
          this.highlight(selected);
        } else {
          this.highlight(0);
        }
      }

      // hide the search box if this is the first we got the results and there are enough of them for search

      if (initial === true) {
        var min = this.opts.minimumResultsForSearch;
        if (min >= 0) {
          this.showSearch(countResults(data.results) >= min);
        }
      }
    },

    // single
    showSearch: function showSearch(showSearchInput) {
      if (this.showSearchInput === showSearchInput) return;

      this.showSearchInput = showSearchInput;

      this.dropdown.find(".select2-search").toggleClass("select2-search-hidden", !showSearchInput);
      this.dropdown.find(".select2-search").toggleClass("select2-offscreen", !showSearchInput);
      //add "select2-with-searchbox" to the container if search box is shown
      $(this.dropdown, this.container).toggleClass("select2-with-searchbox", showSearchInput);
    },

    // single
    onSelect: function onSelect(data, options) {

      if (!this.triggerSelect(data)) {
        return;
      }

      var old = this.opts.element.val(),
          oldData = this.data();

      this.opts.element.val(this.id(data));
      this.updateSelection(data);

      this.opts.element.trigger({ type: "select2-selected", val: this.id(data), choice: data });

      this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());
      this.close();

      if ((!options || !options.noFocus) && this.opts.shouldFocusInput(this)) {
        this.focusser.focus();
      }

      if (!equal(old, this.id(data))) {
        this.triggerChange({ added: data, removed: oldData });
      }
    },

    // single
    updateSelection: function updateSelection(data) {

      var container = this.selection.find(".select2-chosen"),
          formatted,
          cssClass;

      this.selection.data("select2-data", data);

      container.empty();
      if (data !== null) {
        formatted = this.opts.formatSelection(data, container, this.opts.escapeMarkup);
      }
      if (formatted !== undefined) {
        container.append(formatted);
      }
      cssClass = this.opts.formatSelectionCssClass(data, container);
      if (cssClass !== undefined) {
        container.addClass(cssClass);
      }

      this.selection.removeClass("select2-default");

      if (this.opts.allowClear && this.getPlaceholder() !== undefined) {
        this.container.addClass("select2-allowclear");
      }
    },

    // single
    val: function val() {
      var val,
          triggerChange = false,
          data = null,
          self = this,
          oldData = this.data();

      if (arguments.length === 0) {
        return this.opts.element.val();
      }

      val = arguments[0];

      if (arguments.length > 1) {
        triggerChange = arguments[1];
      }

      if (this.select) {
        this.select.val(val).find("option").filter(function () {
          return this.selected;
        }).each2(function (i, elm) {
          data = self.optionToData(elm);
          return false;
        });
        this.updateSelection(data);
        this.setPlaceholder();
        if (triggerChange) {
          this.triggerChange({ added: data, removed: oldData });
        }
      } else {
        // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
        if (!val && val !== 0) {
          this.clear(triggerChange);
          return;
        }
        if (this.opts.initSelection === undefined) {
          throw new Error("cannot call val() if initSelection() is not defined");
        }
        this.opts.element.val(val);
        this.opts.initSelection(this.opts.element, function (data) {
          self.opts.element.val(!data ? "" : self.id(data));
          self.updateSelection(data);
          self.setPlaceholder();
          if (triggerChange) {
            self.triggerChange({ added: data, removed: oldData });
          }
        });
      }
    },

    // single
    clearSearch: function clearSearch() {
      this.search.val("");
      this.focusser.val("");
    },

    // single
    data: function data(value) {
      var data,
          triggerChange = false;

      if (arguments.length === 0) {
        data = this.selection.data("select2-data");
        if (data == undefined) data = null;
        return data;
      } else {
        if (arguments.length > 1) {
          triggerChange = arguments[1];
        }
        if (!value) {
          this.clear(triggerChange);
        } else {
          data = this.data();
          this.opts.element.val(!value ? "" : this.id(value));
          this.updateSelection(value);
          if (triggerChange) {
            this.triggerChange({ added: value, removed: data });
          }
        }
      }
    }
  });

  MultiSelect2 = clazz(AbstractSelect2, {

    // multi
    createContainer: function createContainer() {
      var container = $(document.createElement("div")).attr({
        "class": "select2-container select2-container-multi"
      }).html(["<ul class='select2-choices'>", "  <li class='select2-search-field'>", "    <label for='' class='select2-offscreen'></label>", "    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>", "  </li>", "</ul>", "<div class='select2-drop select2-drop-multi select2-display-none'>", "   <ul class='select2-results'>", "   </ul>", "</div>"].join(""));
      return container;
    },

    // multi
    prepareOpts: function prepareOpts() {
      var opts = this.parent.prepareOpts.apply(this, arguments),
          self = this;

      // TODO validate placeholder is a string if specified
      if (opts.element.get(0).tagName.toLowerCase() === "select") {
        // install the selection initializer
        opts.initSelection = function (element, callback) {

          var data = [];

          element.find("option").filter(function () {
            return this.selected && !this.disabled;
          }).each2(function (i, elm) {
            data.push(self.optionToData(elm));
          });
          callback(data);
        };
      } else if ("data" in opts) {
        // install default initSelection when applied to hidden input and data is local
        opts.initSelection = opts.initSelection || function (element, callback) {
          var ids = splitVal(element.val(), opts.separator, opts.transformVal);
          //search in data by array of ids, storing matching items in a list
          var matches = [];
          opts.query({
            matcher: function matcher(term, text, el) {
              var is_match = $.grep(ids, function (id) {
                return equal(id, opts.id(el));
              }).length;
              if (is_match) {
                matches.push(el);
              }
              return is_match;
            },
            callback: !$.isFunction(callback) ? $.noop : function () {
              // reorder matches based on the order they appear in the ids array because right now
              // they are in the order in which they appear in data array
              var ordered = [];
              for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                for (var j = 0; j < matches.length; j++) {
                  var match = matches[j];
                  if (equal(id, opts.id(match))) {
                    ordered.push(match);
                    matches.splice(j, 1);
                    break;
                  }
                }
              }
              callback(ordered);
            }
          });
        };
      }

      return opts;
    },

    // multi
    selectChoice: function selectChoice(choice) {

      var selected = this.container.find(".select2-search-choice-focus");
      if (selected.length && choice && choice[0] == selected[0]) {} else {
        if (selected.length) {
          this.opts.element.trigger("choice-deselected", selected);
        }
        selected.removeClass("select2-search-choice-focus");
        if (choice && choice.length) {
          this.close();
          choice.addClass("select2-search-choice-focus");
          this.opts.element.trigger("choice-selected", choice);
        }
      }
    },

    // multi
    destroy: function destroy() {
      $("label[for='" + this.search.attr('id') + "']").attr('for', this.opts.element.attr("id"));
      this.parent.destroy.apply(this, arguments);

      cleanupJQueryElements.call(this, "searchContainer", "selection");
    },

    // multi
    initContainer: function initContainer() {

      var selector = ".select2-choices",
          selection;

      this.searchContainer = this.container.find(".select2-search-field");
      this.selection = selection = this.container.find(selector);

      var _this = this;
      this.selection.on("click", ".select2-container:not(.select2-container-disabled) .select2-search-choice:not(.select2-locked)", function (e) {
        _this.search[0].focus();
        _this.selectChoice($(this));
      });

      // rewrite labels from original element to focusser
      this.search.attr("id", "s2id_autogen" + nextUid());

      this.search.prev().text($("label[for='" + this.opts.element.attr("id") + "']").text()).attr('for', this.search.attr('id'));
      this.opts.element.focus(this.bind(function () {
        this.focus();
      }));

      this.search.on("input paste", this.bind(function () {
        if (this.search.attr('placeholder') && this.search.val().length == 0) return;
        if (!this.isInterfaceEnabled()) return;
        if (!this.opened()) {
          this.open();
        }
      }));

      this.search.attr("tabindex", this.elementTabIndex);

      this.keydowns = 0;
      this.search.on("keydown", this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;

        ++this.keydowns;
        var selected = selection.find(".select2-search-choice-focus");
        var prev = selected.prev(".select2-search-choice:not(.select2-locked)");
        var next = selected.next(".select2-search-choice:not(.select2-locked)");
        var pos = getCursorInfo(this.search);

        if (selected.length && (e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.BACKSPACE || e.which == KEY.DELETE || e.which == KEY.ENTER)) {
          var selectedChoice = selected;
          if (e.which == KEY.LEFT && prev.length) {
            selectedChoice = prev;
          } else if (e.which == KEY.RIGHT) {
            selectedChoice = next.length ? next : null;
          } else if (e.which === KEY.BACKSPACE) {
            if (this.unselect(selected.first())) {
              this.search.width(10);
              selectedChoice = prev.length ? prev : next;
            }
          } else if (e.which == KEY.DELETE) {
            if (this.unselect(selected.first())) {
              this.search.width(10);
              selectedChoice = next.length ? next : null;
            }
          } else if (e.which == KEY.ENTER) {
            selectedChoice = null;
          }

          this.selectChoice(selectedChoice);
          killEvent(e);
          if (!selectedChoice || !selectedChoice.length) {
            this.open();
          }
          return;
        } else if ((e.which === KEY.BACKSPACE && this.keydowns == 1 || e.which == KEY.LEFT) && pos.offset == 0 && !pos.length) {

          this.selectChoice(selection.find(".select2-search-choice:not(.select2-locked)").last());
          killEvent(e);
          return;
        } else {
          this.selectChoice(null);
        }

        if (this.opened()) {
          switch (e.which) {
            case KEY.UP:
            case KEY.DOWN:
              this.moveHighlight(e.which === KEY.UP ? -1 : 1);
              killEvent(e);
              return;
            case KEY.ENTER:
              this.selectHighlighted();
              killEvent(e);
              return;
            case KEY.TAB:
              this.selectHighlighted({ noFocus: true });
              this.close();
              return;
            case KEY.ESC:
              this.cancel(e);
              killEvent(e);
              return;
          }
        }

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {
          return;
        }

        if (e.which === KEY.ENTER) {
          if (this.opts.openOnEnter === false) {
            return;
          } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
            return;
          }
        }

        this.open();

        if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
          // prevent the page from scrolling
          killEvent(e);
        }

        if (e.which === KEY.ENTER) {
          // prevent form from being submitted
          killEvent(e);
        }
      }));

      this.search.on("keyup", this.bind(function (e) {
        this.keydowns = 0;
        this.resizeSearch();
      }));

      this.search.on("blur", this.bind(function (e) {
        this.container.removeClass("select2-container-active");
        this.search.removeClass("select2-focused");
        this.selectChoice(null);
        if (!this.opened()) this.clearSearch();
        e.stopImmediatePropagation();
        this.opts.element.trigger($.Event("select2-blur"));
      }));

      this.container.on("click", selector, this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;
        if ($(e.target).closest(".select2-search-choice").length > 0) {
          // clicked inside a select2 search choice, do not open
          return;
        }
        this.selectChoice(null);
        this.clearPlaceholder();
        if (!this.container.hasClass("select2-container-active")) {
          this.opts.element.trigger($.Event("select2-focus"));
        }
        this.open();
        this.focusSearch();
        e.preventDefault();
      }));

      this.container.on("focus", selector, this.bind(function () {
        if (!this.isInterfaceEnabled()) return;
        if (!this.container.hasClass("select2-container-active")) {
          this.opts.element.trigger($.Event("select2-focus"));
        }
        this.container.addClass("select2-container-active");
        this.dropdown.addClass("select2-drop-active");
        this.clearPlaceholder();
      }));

      this.initContainerWidth();
      this.opts.element.hide();

      // set the placeholder if necessary
      this.clearSearch();
    },

    // multi
    enableInterface: function enableInterface() {
      if (this.parent.enableInterface.apply(this, arguments)) {
        this.search.prop("disabled", !this.isInterfaceEnabled());
      }
    },

    // multi
    initSelection: function initSelection() {
      var data;
      if (this.opts.element.val() === "" && this.opts.element.text() === "") {
        this.updateSelection([]);
        this.close();
        // set the placeholder if necessary
        this.clearSearch();
      }
      if (this.select || this.opts.element.val() !== "") {
        var self = this;
        this.opts.initSelection.call(null, this.opts.element, function (data) {
          if (data !== undefined && data !== null) {
            self.updateSelection(data);
            self.close();
            // set the placeholder if necessary
            self.clearSearch();
          }
        });
      }
    },

    // multi
    clearSearch: function clearSearch() {
      var placeholder = this.getPlaceholder(),
          maxWidth = this.getMaxSearchWidth();

      if (placeholder !== undefined && this.getVal().length === 0 && this.search.hasClass("select2-focused") === false) {
        this.search.val(placeholder).addClass("select2-default");
        // stretch the search box to full width of the container so as much of the placeholder is visible as possible
        // we could call this.resizeSearch(), but we do not because that requires a sizer and we do not want to create one so early because of a firefox bug, see #944
        this.search.width(maxWidth > 0 ? maxWidth : this.container.css("width"));
      } else {
        this.search.val("").width(10);
      }
    },

    // multi
    clearPlaceholder: function clearPlaceholder() {
      if (this.search.hasClass("select2-default")) {
        this.search.val("").removeClass("select2-default");
      }
    },

    // multi
    opening: function opening() {
      this.clearPlaceholder(); // should be done before super so placeholder is not used to search
      this.resizeSearch();

      this.parent.opening.apply(this, arguments);

      this.focusSearch();

      // initializes search's value with nextSearchTerm (if defined by user)
      // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter
      if (this.search.val() === "") {
        if (this.nextSearchTerm != undefined) {
          this.search.val(this.nextSearchTerm);
          this.search.select();
        }
      }

      this.updateResults(true);
      if (this.opts.shouldFocusInput(this)) {
        this.search.focus();
      }
      this.opts.element.trigger($.Event("select2-open"));
    },

    // multi
    close: function close() {
      if (!this.opened()) return;
      this.parent.close.apply(this, arguments);
    },

    // multi
    focus: function focus() {
      this.close();
      this.search.focus();
    },

    // multi
    isFocused: function isFocused() {
      return this.search.hasClass("select2-focused");
    },

    // multi
    updateSelection: function updateSelection(data) {
      var ids = [],
          filtered = [],
          self = this;

      // filter out duplicates
      $(data).each(function () {
        if (indexOf(self.id(this), ids) < 0) {
          ids.push(self.id(this));
          filtered.push(this);
        }
      });
      data = filtered;

      this.selection.find(".select2-search-choice").remove();
      $(data).each(function () {
        self.addSelectedChoice(this);
      });
      self.postprocessResults();
    },

    // multi
    tokenize: function tokenize() {
      var input = this.search.val();
      input = this.opts.tokenizer.call(this, input, this.data(), this.bind(this.onSelect), this.opts);
      if (input != null && input != undefined) {
        this.search.val(input);
        if (input.length > 0) {
          this.open();
        }
      }
    },

    // multi
    onSelect: function onSelect(data, options) {

      if (!this.triggerSelect(data) || data.text === "") {
        return;
      }

      this.addSelectedChoice(data);

      this.opts.element.trigger({ type: "selected", val: this.id(data), choice: data });

      // keep track of the search's value before it gets cleared
      this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());

      this.clearSearch();
      this.updateResults();

      if (this.select || !this.opts.closeOnSelect) this.postprocessResults(data, false, this.opts.closeOnSelect === true);

      if (this.opts.closeOnSelect) {
        this.close();
        this.search.width(10);
      } else {
        if (this.countSelectableResults() > 0) {
          this.search.width(10);
          this.resizeSearch();
          if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize()) {
            // if we reached max selection size repaint the results so choices
            // are replaced with the max selection reached message
            this.updateResults(true);
          } else {
            // initializes search's value with nextSearchTerm and update search result
            if (this.nextSearchTerm != undefined) {
              this.search.val(this.nextSearchTerm);
              this.updateResults();
              this.search.select();
            }
          }
          this.positionDropdown();
        } else {
          // if nothing left to select close
          this.close();
          this.search.width(10);
        }
      }

      // since its not possible to select an element that has already been
      // added we do not need to check if this is a new element before firing change
      this.triggerChange({ added: data });

      if (!options || !options.noFocus) this.focusSearch();
    },

    // multi
    cancel: function cancel() {
      this.close();
      this.focusSearch();
    },

    addSelectedChoice: function addSelectedChoice(data) {
      var enableChoice = !data.locked,
          enabledItem = $("<li class='select2-search-choice'>" + "    <div></div>" + "    <a href='#' class='select2-search-choice-close' tabindex='-1'></a>" + "</li>"),
          disabledItem = $("<li class='select2-search-choice select2-locked'>" + "<div></div>" + "</li>");
      var choice = enableChoice ? enabledItem : disabledItem,
          id = this.id(data),
          val = this.getVal(),
          formatted,
          cssClass;

      formatted = this.opts.formatSelection(data, choice.find("div"), this.opts.escapeMarkup);
      if (formatted != undefined) {
        choice.find("div").replaceWith($("<div></div>").html(formatted));
      }
      cssClass = this.opts.formatSelectionCssClass(data, choice.find("div"));
      if (cssClass != undefined) {
        choice.addClass(cssClass);
      }

      if (enableChoice) {
        choice.find(".select2-search-choice-close").on("mousedown", killEvent).on("click dblclick", this.bind(function (e) {
          if (!this.isInterfaceEnabled()) return;

          this.unselect($(e.target));
          this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
          killEvent(e);
          this.close();
          this.focusSearch();
        })).on("focus", this.bind(function () {
          if (!this.isInterfaceEnabled()) return;
          this.container.addClass("select2-container-active");
          this.dropdown.addClass("select2-drop-active");
        }));
      }

      choice.data("select2-data", data);
      choice.insertBefore(this.searchContainer);

      val.push(id);
      this.setVal(val);
    },

    // multi
    unselect: function unselect(selected) {
      var val = this.getVal(),
          data,
          index;
      selected = selected.closest(".select2-search-choice");

      if (selected.length === 0) {
        throw "Invalid argument: " + selected + ". Must be .select2-search-choice";
      }

      data = selected.data("select2-data");

      if (!data) {
        // prevent a race condition when the 'x' is clicked really fast repeatedly the event can be queued
        // and invoked on an element already removed
        return;
      }

      var evt = $.Event("select2-removing");
      evt.val = this.id(data);
      evt.choice = data;
      this.opts.element.trigger(evt);

      if (evt.isDefaultPrevented()) {
        return false;
      }

      while ((index = indexOf(this.id(data), val)) >= 0) {
        val.splice(index, 1);
        this.setVal(val);
        if (this.select) this.postprocessResults();
      }

      selected.remove();

      this.opts.element.trigger({ type: "select2-removed", val: this.id(data), choice: data });
      this.triggerChange({ removed: data });

      return true;
    },

    // multi
    postprocessResults: function postprocessResults(data, initial, noHighlightUpdate) {
      var val = this.getVal(),
          choices = this.results.find(".select2-result"),
          compound = this.results.find(".select2-result-with-children"),
          self = this;

      choices.each2(function (i, choice) {
        var id = self.id(choice.data("select2-data"));
        if (indexOf(id, val) >= 0) {
          choice.addClass("select2-selected");
          // mark all children of the selected parent as selected
          choice.find(".select2-result-selectable").addClass("select2-selected");
        }
      });

      compound.each2(function (i, choice) {
        // hide an optgroup if it doesn't have any selectable children
        if (!choice.is('.select2-result-selectable') && choice.find(".select2-result-selectable:not(.select2-selected)").length === 0) {
          choice.addClass("select2-selected");
        }
      });

      if (this.highlight() == -1 && noHighlightUpdate !== false && this.opts.closeOnSelect === true) {
        self.highlight(0);
      }

      //If all results are chosen render formatNoMatches
      if (!this.opts.createSearchChoice && !choices.filter('.select2-result:not(.select2-selected)').length > 0) {
        if (!data || data && !data.more && this.results.find(".select2-no-results").length === 0) {
          if (checkFormatter(self.opts.formatNoMatches, "formatNoMatches")) {
            this.results.append("<li class='select2-no-results'>" + evaluate(self.opts.formatNoMatches, self.opts.element, self.search.val()) + "</li>");
          }
        }
      }
    },

    // multi
    getMaxSearchWidth: function getMaxSearchWidth() {
      return this.selection.width() - getSideBorderPadding(this.search);
    },

    // multi
    resizeSearch: function resizeSearch() {
      var minimumWidth,
          left,
          maxWidth,
          containerLeft,
          searchWidth,
          sideBorderPadding = getSideBorderPadding(this.search);

      minimumWidth = measureTextWidth(this.search) + 10;

      left = this.search.offset().left;

      maxWidth = this.selection.width();
      containerLeft = this.selection.offset().left;

      searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;

      if (searchWidth < minimumWidth) {
        searchWidth = maxWidth - sideBorderPadding;
      }

      if (searchWidth < 40) {
        searchWidth = maxWidth - sideBorderPadding;
      }

      if (searchWidth <= 0) {
        searchWidth = minimumWidth;
      }

      this.search.width(Math.floor(searchWidth));
    },

    // multi
    getVal: function getVal() {
      var val;
      if (this.select) {
        val = this.select.val();
        return val === null ? [] : val;
      } else {
        val = this.opts.element.val();
        return splitVal(val, this.opts.separator, this.opts.transformVal);
      }
    },

    // multi
    setVal: function setVal(val) {
      var unique;
      if (this.select) {
        this.select.val(val);
      } else {
        unique = [];
        // filter out duplicates
        $(val).each(function () {
          if (indexOf(this, unique) < 0) unique.push(this);
        });
        this.opts.element.val(unique.length === 0 ? "" : unique.join(this.opts.separator));
      }
    },

    // multi
    buildChangeDetails: function buildChangeDetails(old, current) {
      var current = current.slice(0),
          old = old.slice(0);

      // remove intersection from each array
      for (var i = 0; i < current.length; i++) {
        for (var j = 0; j < old.length; j++) {
          if (equal(this.opts.id(current[i]), this.opts.id(old[j]))) {
            current.splice(i, 1);
            if (i > 0) {
              i--;
            }
            old.splice(j, 1);
            j--;
          }
        }
      }

      return { added: current, removed: old };
    },

    // multi
    val: function val(_val, triggerChange) {
      var oldData,
          self = this;

      if (arguments.length === 0) {
        return this.getVal();
      }

      oldData = this.data();
      if (!oldData.length) oldData = [];

      // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
      if (!_val && _val !== 0) {
        this.opts.element.val("");
        this.updateSelection([]);
        this.clearSearch();
        if (triggerChange) {
          this.triggerChange({ added: this.data(), removed: oldData });
        }
        return;
      }

      // val is a list of ids
      this.setVal(_val);

      if (this.select) {
        this.opts.initSelection(this.select, this.bind(this.updateSelection));
        if (triggerChange) {
          this.triggerChange(this.buildChangeDetails(oldData, this.data()));
        }
      } else {
        if (this.opts.initSelection === undefined) {
          throw new Error("val() cannot be called if initSelection() is not defined");
        }

        this.opts.initSelection(this.opts.element, function (data) {
          var ids = $.map(data, self.id);
          self.setVal(ids);
          self.updateSelection(data);
          self.clearSearch();
          if (triggerChange) {
            self.triggerChange(self.buildChangeDetails(oldData, self.data()));
          }
        });
      }
      this.clearSearch();
    },

    // multi
    onSortStart: function onSortStart() {
      if (this.select) {
        throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
      }

      // collapse search field into 0 width so its container can be collapsed as well
      this.search.width(0);
      // hide the container
      this.searchContainer.hide();
    },

    // multi
    onSortEnd: function onSortEnd() {

      var val = [],
          self = this;

      // show search and move it to the end of the list
      this.searchContainer.show();
      // make sure the search container is the last item in the list
      this.searchContainer.appendTo(this.searchContainer.parent());
      // since we collapsed the width in dragStarted, we resize it here
      this.resizeSearch();

      // update selection
      this.selection.find(".select2-search-choice").each(function () {
        val.push(self.opts.id($(this).data("select2-data")));
      });
      this.setVal(val);
      this.triggerChange();
    },

    // multi
    data: function data(values, triggerChange) {
      var self = this,
          ids,
          old;
      if (arguments.length === 0) {
        return this.selection.children(".select2-search-choice").map(function () {
          return $(this).data("select2-data");
        }).get();
      } else {
        old = this.data();
        if (!values) {
          values = [];
        }
        ids = $.map(values, function (e) {
          return self.opts.id(e);
        });
        this.setVal(ids);
        this.updateSelection(values);
        this.clearSearch();
        if (triggerChange) {
          this.triggerChange(this.buildChangeDetails(old, this.data()));
        }
      }
    }
  });

  $.fn.select2 = function () {

    var args = Array.prototype.slice.call(arguments, 0),
        opts,
        select2,
        method,
        value,
        multiple,
        allowedMethods = ["val", "destroy", "opened", "open", "close", "focus", "isFocused", "container", "dropdown", "onSortStart", "onSortEnd", "enable", "disable", "readonly", "positionDropdown", "data", "search"],
        valueMethods = ["opened", "isFocused", "container", "dropdown"],
        propertyMethods = ["val", "data"],
        methodsMap = { search: "externalSearch" };

    this.each(function () {
      if (args.length === 0 || _typeof(args[0]) === "object") {
        opts = args.length === 0 ? {} : $.extend({}, args[0]);
        opts.element = $(this);

        if (opts.element.get(0).tagName.toLowerCase() === "select") {
          multiple = opts.element.prop("multiple");
        } else {
          multiple = opts.multiple || false;
          if ("tags" in opts) {
            opts.multiple = multiple = true;
          }
        }

        select2 = multiple ? new window.Select2["class"].multi() : new window.Select2["class"].single();
        select2.init(opts);
      } else if (typeof args[0] === "string") {

        if (indexOf(args[0], allowedMethods) < 0) {
          throw "Unknown method: " + args[0];
        }

        value = undefined;
        select2 = $(this).data("select2");
        if (select2 === undefined) return;

        method = args[0];

        if (method === "container") {
          value = select2.container;
        } else if (method === "dropdown") {
          value = select2.dropdown;
        } else {
          if (methodsMap[method]) method = methodsMap[method];

          value = select2[method].apply(select2, args.slice(1));
        }
        if (indexOf(args[0], valueMethods) >= 0 || indexOf(args[0], propertyMethods) >= 0 && args.length == 1) {
          return false; // abort the iteration, ready to return first matched value
        }
      } else {
        throw "Invalid arguments to select2 plugin: " + args;
      }
    });
    return value === undefined ? this : value;
  };

  // plugin defaults, accessible to users
  $.fn.select2.defaults = {
    width: "copy",
    loadMorePadding: 0,
    closeOnSelect: true,
    openOnEnter: true,
    containerCss: {},
    dropdownCss: {},
    containerCssClass: "",
    dropdownCssClass: "",
    formatResult: function formatResult(result, container, query, escapeMarkup) {
      var markup = [];
      markMatch(this.text(result), query.term, markup, escapeMarkup);
      return markup.join("");
    },
    transformVal: function transformVal(val) {
      return $.trim(val);
    },
    formatSelection: function formatSelection(data, container, escapeMarkup) {
      return data ? escapeMarkup(this.text(data)) : undefined;
    },
    sortResults: function sortResults(results, container, query) {
      return results;
    },
    formatResultCssClass: function formatResultCssClass(data) {
      return data.css;
    },
    formatSelectionCssClass: function formatSelectionCssClass(data, container) {
      return undefined;
    },
    minimumResultsForSearch: 0,
    minimumInputLength: 0,
    maximumInputLength: null,
    maximumSelectionSize: 0,
    id: function id(e) {
      return e == undefined ? null : e.id;
    },
    text: function text(e) {
      if (e && this.data && this.data.text) {
        if ($.isFunction(this.data.text)) {
          return this.data.text(e);
        } else {
          return e[this.data.text];
        }
      } else {
        return e.text;
      }
    },
    matcher: function matcher(term, text) {
      return stripDiacritics('' + text).toUpperCase().indexOf(stripDiacritics('' + term).toUpperCase()) >= 0;
    },
    separator: ",",
    tokenSeparators: [],
    tokenizer: defaultTokenizer,
    escapeMarkup: defaultEscapeMarkup,
    blurOnChange: false,
    selectOnBlur: false,
    adaptContainerCssClass: function adaptContainerCssClass(c) {
      return c;
    },
    adaptDropdownCssClass: function adaptDropdownCssClass(c) {
      return null;
    },
    nextSearchTerm: function nextSearchTerm(selectedObject, currentSearchTerm) {
      return undefined;
    },
    searchInputPlaceholder: '',
    createSearchChoicePosition: 'top',
    shouldFocusInput: function shouldFocusInput(instance) {
      // Attempt to detect touch devices
      var supportsTouchEvents = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0;

      // Only devices which support touch events should be special cased
      if (!supportsTouchEvents) {
        return true;
      }

      // Never focus the input if search is disabled
      if (instance.opts.minimumResultsForSearch < 0) {
        return false;
      }

      return true;
    }
  };

  $.fn.select2.locales = [];

  $.fn.select2.locales['en'] = {
    formatMatches: function formatMatches(matches) {
      if (matches === 1) {
        return "One result is available, press enter to select it.";
      }return matches + " results are available, use up and down arrow keys to navigate.";
    },
    formatNoMatches: function formatNoMatches() {
      return "No matches found";
    },
    formatAjaxError: function formatAjaxError(jqXHR, textStatus, errorThrown) {
      return "Loading failed";
    },
    formatInputTooShort: function formatInputTooShort(input, min) {
      var n = min - input.length;return "Please enter " + n + " or more character" + (n == 1 ? "" : "s");
    },
    formatInputTooLong: function formatInputTooLong(input, max) {
      var n = input.length - max;return "Please delete " + n + " character" + (n == 1 ? "" : "s");
    },
    formatSelectionTooBig: function formatSelectionTooBig(limit) {
      return "You can only select " + limit + " item" + (limit == 1 ? "" : "s");
    },
    formatLoadMore: function formatLoadMore(pageNumber) {
      return "Loading more results…";
    },
    formatSearching: function formatSearching() {
      return "Searching…";
    }
  };

  $.extend($.fn.select2.defaults, $.fn.select2.locales['en']);

  $.fn.select2.ajaxDefaults = {
    transport: $.ajax,
    params: {
      type: "GET",
      cache: false,
      dataType: "json"
    }
  };

  // exports
  window.Select2 = {
    query: {
      ajax: ajax,
      local: local,
      tags: tags
    }, util: {
      debounce: debounce,
      markMatch: markMatch,
      escapeMarkup: defaultEscapeMarkup,
      stripDiacritics: stripDiacritics
    }, "class": {
      "abstract": AbstractSelect2,
      "single": SingleSelect2,
      "multi": MultiSelect2
    }
  };
})(jQuery);

/**
 * Select2 Spanish translation
 */
(function ($) {
  "use strict";

  $.fn.select2.locales['es'] = {
    formatMatches: function formatMatches(matches) {
      if (matches === 1) {
        return "Un resultado disponible, presione enter para seleccionarlo.";
      }return matches + " resultados disponibles, use las teclas de dirección para navegar.";
    },
    formatNoMatches: function formatNoMatches() {
      return "No se encontraron resultados";
    },
    formatInputTooShort: function formatInputTooShort(input, min) {
      var n = min - input.length;return "Por favor, introduzca " + n + " car" + (n == 1 ? "ácter" : "acteres");
    },
    formatInputTooLong: function formatInputTooLong(input, max) {
      var n = input.length - max;return "Por favor, elimine " + n + " car" + (n == 1 ? "ácter" : "acteres");
    },
    formatSelectionTooBig: function formatSelectionTooBig(limit) {
      return "Sólo puede seleccionar " + limit + " elemento" + (limit == 1 ? "" : "s");
    },
    formatLoadMore: function formatLoadMore(pageNumber) {
      return "Cargando más resultados…";
    },
    formatSearching: function formatSearching() {
      return "Buscando…";
    },
    formatAjaxError: function formatAjaxError() {
      return "La carga falló";
    }
  };

  $.extend($.fn.select2.defaults, $.fn.select2.locales['es']);
})(jQuery);