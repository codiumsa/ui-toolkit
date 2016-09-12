(function (angular) {
'use strict';
// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Gulp

// Config
angular.module('ui.config', [])
    .value('ui.config', {
        debug: true
    });

// Modules
angular.module('ui.directives', []);
angular.module('ui.filters', []);
angular.module('ui.services', []);
angular.module('ui',
    [
        'ui.config',
        'ui.directives',
        'ui.filters',
        'ui.services',
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
        'ncy-angular-breadcrumb',
        'ui.router',
        'oc.lazyLoad',
        'ngStorage',
        'LocalForageModule',
        'datatables.buttons',
        'datatables.colreorder',
        'daterangepicker',
        'rangepicker',
        'ngWebSocket',
        'pickadate'
    ]);
})(angular);

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
(function() {
'use strict';

/**
 * @ngdoc directive
 * @name ui.directive:fileupload
 * @description
 * # fileupload
 */
angular.module('ui')
  .directive('fileupload', ['$rootScope', 'notify', 'UploadFactory', 'baseurl', function ($rootScope, notify, UploadFactory, baseurl) {
    return {
      template: '<div ng-show="uploadOptions.imageOnly">' +
      '<div flow-init="{singleFile: true}" ' +
      'flow-files-submitted="uploader.flow.upload()"' +
      'flow-file-added="!!{png:1,gif:1,jpg:1,jpeg:1}[$file.getExtension()]"' +
      'flow-files-added="filesAdded($files, $event, uploader.flow)"' +
      'flow-name="uploader.flow"' +
      'class="ng-scope">' +
      '<label>{{uploadOptions.title}}</label>' +

      '<div class="thumbnail" ng-show="uploader.currentFile && !uploader.flow.files.length">' +
      '<img src="{{uploader.currentFile}}" style="max-width: 300px; max-height: 200px;"/> ' +
      '</div>' +

      '<div class="thumbnail" ng-show="!uploader.flow.files.length && !uploader.currentFile && !uploadOptions.imagePath">' +
      '<img src="images/placeholder.png" style="max-width: 300px; max-height: 200px;">' +
      '</div>' +

      '<div class="thumbnail" ng-show="uploader.flow.files.length">' +
      '<img flow-img="uploader.flow.files[0]" style="max-width: 300px; max-height: 200px;"/> ' +
      '</div>' +

      '<div class="thumbnail" ng-show="uploadOptions.imagePath && !uploader.currentFile && !uploader.flow.files.length">' +
      '<img ng-src="{{uploadOptions.imagePath}}" style="max-width: 300px; max-height: 200px;"/> ' +
      '</div>' +

      '<div>' +
      '<span class="btn btn-primary" ng-show="!uploader.flow.files.length" flow-btn="">' +
      'Seleccionar imagen' +
      '<input type="file" sf-changed="form" ng-model="$$value$$" style="visibility: hidden; position: absolute;" />' +
      '</span>' +
      '<span class="btn btn-info ng-hide" ng-show="uploader.flow.files.length" flow-btn="">' +
      'Cambiar' +
      '<input type="file" sf-changed="form" ng-model="$$value$$" style="visibility: hidden; position: absolute;" />' +
      '</span>' +
      '<span class="btn btn-danger ng-hide" ng-show="uploader.flow.files.length" ng-click="uploader.flow.cancel()">' +
      'Eliminar' +
      '</span>' +
      '</div>' +
      '<p>' +
      'Formatos permitidos: PNG, GIF, JPG y JPEG.' +
      '</p>' +
      '</div>' +
      '</div>' +

      '<div ng-show="!uploadOptions.imageOnly">' +
      '<div flow-init ' +
      'flow-files-submitted="uploader.flow.upload()"' +
      'flow-file-added="fileAdded($file, $event, $flow)" ' +
      'flow-files-added="filesAdded($files, $event, $flow)" ' +
      'flow-file-success="uploadCompleted()" ' +
      'class="ng-scope">' +
      '<h3>{{uploadOptions.title}}</h3>' +
      '<div class="drop" flow-drop ng-class="dropClass">' +

      '<span class="btn btn-default btn-sm" flow-btn>Cargar archivo ' +
        '<input type="file" ng-model="$$value$$" sf-changed="form" style="visibility: hidden; position: absolute;"/> ' +
      '</span> ' +
      '<br/> ' +
      '<b>O</b> ' +
      'Arrastre el archivo aqu&iacute; ' +
      '</div> ' +
      '<br/> ' +
      '<div ng-repeat="file in uploader.flow.files" class="transfer-box">' +
      '{{file.relativePath}} ({{file.size}}bytes)' +
      '<div class="progress progress-striped" ng-class="{active: file.isUploading()}">' +
      '<div class="progress-bar" role="progressbar" ' +
      'aria-valuenow="{{file.progress() * 100}}" ' +
      'aria-valuemin="0" ' +
      'aria-valuemax="100" ' +
      'ng-style="{width: progressWith(file.progress())}">' +
      '<span class="sr-only">{{file.progress()}}% Complete</span>' +
      '</div>' +
      '</div>' +
      '<div class="btn-group">' +
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
      scope: {
        uploadOptions: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.uploader = {};
        scope.title = attrs.title;
        scope.fileModel = {};

        scope.progressWith = function (progress) {
          return (progress * 100) + '%';
        };
        
        scope.filesAdded = function (files, event, flow) {
          scope.uploader.flow = flow;
          scope.uploadOptions.flow = flow;
        };

        if (scope.uploadOptions) {
          scope.uploader.flow = scope.uploadOptions.flow;
        }
        scope.files = [];
        scope.adjuntosBaseURL = baseurl.getPublicBaseUrl();

        scope.fileAdded = function(file, event) {
          // controlamos que no se supere el limite de tamano          
          if(scope.uploadOptions.FILE_UPLOAD_LIMIT && file.size > (scope.uploadOptions.FILE_UPLOAD_LIMIT * 1000 * 1000)){
            event.preventDefault();
            ngNotify.set('El tamaño del archivo supera el límite de ' + scope.uploadOptions.FILE_UPLOAD_LIMIT + ' MB.', 'warn');
            return false;
          }
          var ext = file.getExtension();
          // si es imagen controlamos que sea alguna de las extensiones permitidas
          if(scope.uploadOptions.imageOnly && ['png', 'gif', 'jpg', 'jpeg'].indexOf(ext) < 0){
            notify({message: 'Solo se permiten archivos con extensión: png, gif, jpg o jpeg.', classes: 'alert-warning', position: 'right'});
            return false;
          }
          // controlamos que el tamanio del nombre no supere 255 caracteres
          if(file.name.length > 255) {
            notify({message: 'El nombre del archivo supera los 255 caracteres', classes: 'alert-warning', position: 'right'});
            return false;
          }
        };

        scope.uploadCompleted = function() {
          notify({message: 'Archivo cargado correctamente', classes: 'alert-warning', position: 'right'});
          scope.files = UploadFactory.getCurrentFiles(scope.uploadOptions);
        };
      }
    };
  }]);
}());

(function() {
'use strict';

/**
 * @ngdoc directive
 * @name qualita.directive:offlineFormRecovery
 * @description
 * # offlineFormRecovery
 */
angular.module('ui')
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
}());

(function() {
'use strict';

/**
 * @ngdoc directive
 * @name ui.directive:reportViewer
 * @description
 * # reportViewer
 */
angular.module('ui')
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
}());
angular.module('ui').run(["$templateCache", function($templateCache) {

$templateCache.put("views/directives/uiselect.html", "<div class=\"form-group\"\n" +
      "     ng-class=\"{'has-error': form.disableErrorState !== true && hasError(), 'has-success': form.disableSuccessState !== true && hasSuccess(), 'has-feedback': form.feedback !== false}\"\n" +
      "     ng-init=\"selectedOptions=form.titleMap; insideModel=$$value$$;\" ng-controller=\"dynamicSelectController\">\n" +
      "  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n" +
      "\n" +
      "  <div class=\"form-group\">\n" +
      "    <ui-select ng-model=\"select_model.selected\"\n" +
      "               ng-if=\"!(form.options.tagging||false)\" theme=\"bootstrap\" ng-disabled=\"form.disabled\"\n" +
      "               on-select=\"$$value$$=$item.value\" class=\"{{form.options.uiClass}}\">\n" +
      "      <ui-select-match\n" +
      "        placeholder=\"{{form.placeholder || form.schema.placeholder || ('' | translate)}}\">\n" +
      "        {{select_model.selected.name}}\n" +
      "      </ui-select-match>\n" +
      "      <ui-select-choices refresh=\"populateTitleMap(form, form.options, $select.search)\"\n" +
      "                         refresh-delay=\"form.options.refreshDelay\" group-by=\"form.options.groupBy\"\n" +
      "                         repeat=\"item in form.titleMap | filterRelated: {form: form} | propsFilter: {name: $select.search, description: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS') }\">\n" +
      "        <div ng-bind-html=\"item.name | highlight: $select.search\"></div>\n" +
      "        <div ng-if=\"item.description\">\n" +
      "          <span\n" +
      "            ng-bind-html=\"'<small>' + (''+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS'))+ '</small>'\"></span>\n" +
      "        </div>\n" +
      "      </ui-select-choices>\n" +
      "    </ui-select>\n" +
      "    <ui-select ng-model=\"select_model.selected\"\n" +
      "               ng-if=\"(form.options.tagging||false) && !(form.options.groupBy || false)\"\n" +
      "               tagging=\"form.options.tagging||false\" tagging-label=\"form.options.taggingLabel\"\n" +
      "               tagging-tokens=\"form.options.taggingTokens\"\n" +
      "               theme=\"bootstrap\" ng-disabled=\"form.disabled\" on-select=\"$$value$$=$item.value\"\n" +
      "               class=\"{{form.options.uiClass}}\">\n" +
      "      <ui-select-match\n" +
      "        placeholder=\"{{form.placeholder || form.schema.placeholder || ('' | translate)}}\">\n" +
      "        {{select_model.selected.name}}&nbsp;\n" +
      "        <small>{{(select_model.selected.isTag===true ? form.options.taggingLabel : '')}}</small>\n" +
      "      </ui-select-match>\n" +
      "      <!--repeat code because tagging does not display properly under group by but is still useful -->\n" +
      "      <ui-select-choices refresh=\"populateTitleMap(form, form.options, $select.search)\"\n" +
      "                         refresh-delay=\"form.options.refreshDelay\"\n" +
      "                         repeat=\"item in form.titleMap | filterRelated: {form: form} | propsFilter: {name: $select.search, description: (form.options.searchDescription===true ? $select.search : 'NOTSEARCHINGFORTHIS') }\">\n" +
      "        <div ng-if=\"item.isTag\"\n" +
      "             ng-bind-html=\"'<div>' + (item.name   | highlight: $select.search) + ' ' + form.options.taggingLabel + '</div><div class=&quot;divider&quot;></div>'\"></div>\n" +
      "        <div ng-if=\"!item.isTag\" ng-bind-html=\"item.name + item.isTag| highlight: $select.search\"></div>\n" +
      "        <div ng-if=\"item.description\">\n" +
      "          <span\n" +
      "            ng-bind-html=\"'<small>' + (''+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS')) + '</small>'\"></span>\n" +
      "        </div>\n" +
      "      </ui-select-choices>\n" +
      "    </ui-select>\n" +
      "\n" +
      "    <!--repeat code because tagging does not display properly under group by but is still useful -->\n" +
      "\n" +
      "    <ui-select ng-model=\"select_model.selected\"\n" +
      "               ng-if=\"(form.options.tagging||false) && (form.options.groupBy || false)\"\n" +
      "               tagging=\"form.options.tagging||false\" tagging-label=\"form.options.taggingLabel\"\n" +
      "               tagging-tokens=\"form.options.taggingTokens\"\n" +
      "               theme=\"bootstrap\" ng-disabled=\"form.disabled\" on-select=\"$$value$$=$item.value\"\n" +
      "               class=\"{{form.options.uiClass}}\">\n" +
      "      <ui-select-match\n" +
      "        placeholder=\"{{form.placeholder || form.schema.placeholder || ('' | translate)}}\">\n" +
      "        {{select_model.selected.name}}&nbsp;\n" +
      "        <small>{{(select_model.selected.isTag===true ? form.options.taggingLabel : '')}}</small>\n" +
      "      </ui-select-match>\n" +
      "      <ui-select-choices group-by=\"form.options.groupBy\"\n" +
      "                         refresh=\"populateTitleMap(form, form.options, $select.search)\"\n" +
      "                         refresh-delay=\"form.options.refreshDelay\"\n" +
      "                         repeat=\"item in form.titleMap | filterRelated: {form: form} | propsFilter: {name: $select.search, description: (form.options.searchDescription===true ? $select.search : 'NOTSEARCHINGFORTHIS') }\">\n" +
      "        <div ng-if=\"item.isTag\"\n" +
      "             ng-bind-html=\"'<div>' + (item.name  | highlight: $select.search) + ' ' + form.options.taggingLabel + '</div><div class=&quot;divider&quot;></div>'\"></div>\n" +
      "        <div ng-if=\"!item.isTag\" ng-bind-html=\"item.name + item.isTag| highlight: $select.search\"></div>\n" +
      "        <div ng-if=\"item.description\">\n" +
      "          <span\n" +
      "            ng-bind-html=\"'<small>' + (''+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : 'NOTSEARCHINGFORTHIS')) + '</small>'\"></span>\n" +
      "        </div>\n" +
      "      </ui-select-choices>\n" +
      "    </ui-select>\n" +
      "    <input type=\"hidden\" toggle-single-model sf-changed=\"form\" ng-model=\"insideModel\" schema-validate=\"form\"/>\n" +
      "    <span ng-if=\"form.feedback !== false\"\n" +
      "          class=\"form-control-feedback\"\n" +
      "          ng-class=\"evalInScope(form.feedback) || {'glyphicon': true, 'glyphicon-ok': hasSuccess(), 'glyphicon-remove': hasError() }\"></span>\n" +
      "\n" +
      "    <div class=\"help-block\"\n" +
      "         ng-show=\"(hasError() && errorMessage(schemaError())) || form.description\"\n" +
      "         ng-bind-html=\"(hasError() && errorMessage(schemaError())) || form.description\"></div>\n" +
      "  </div>\n" +
      "</div>\n"
  );

  $templateCache.put('ngTagsInput/tags-input.html',
    "<div class=\"host\" tabindex=\"-1\" ng-click=\"eventHandlers.host.click()\" ti-transclude-append><div class=\"tags\" ng-class=\"{focused: hasFocus}\"><ul class=\"tag-list\"><li class=\"tag-item\" ng-repeat=\"tag in tagList.items track by track(tag)\" ng-class=\"{ selected: tag == tagList.selected }\" ng-click=\"eventHandlers.tag.click(tag)\"><ti-tag-item data=\"::tag\"></ti-tag-item></li></ul><input class=\"tag-input-text input\" autocomplete=\"off\" ng-model=\"newTag.text\" ng-model-options=\"{getterSetter: true}\" ng-keydown=\"eventHandlers.input.keydown($event)\" ng-focus=\"eventHandlers.input.focus($event)\" ng-blur=\"eventHandlers.input.blur($event)\" ng-paste=\"eventHandlers.input.paste($event)\" ng-trim=\"false\" ng-class=\"{'invalid-tag': newTag.invalid}\" ng-disabled=\"disabled\" ti-bind-attrs=\"{type: options.type, tabindex: options.tabindex, spellcheck: options.spellcheck}\" ti-autosize></div></div>"
  );

  $templateCache.put('ngTagsInput/tag-item.html',
    "<span ng-bind=\"$getDisplayText()\"></span> <span class=\"remove-button close ui-select-match-close\" ng-click=\"$removeTag()\" ng-bind=\"::$$removeTagSymbol\"></span>"
  );

  $templateCache.put('ngTagsInput/auto-complete.html',
    "<div class=\"autocomplete\" ng-if=\"suggestionList.visible\"><ul class=\"suggestion-list\"><li class=\"suggestion-item\" ng-repeat=\"item in suggestionList.items track by track(item)\" ng-class=\"{selected: item == suggestionList.selected}\" ng-click=\"addSuggestionByIndex($index)\" ng-mouseenter=\"suggestionList.select($index)\"><ti-autocomplete-match data=\"::item\"></ti-autocomplete-match></li></ul></div>"
  );

  $templateCache.put('ngTagsInput/auto-complete-match.html',
    "<span ng-bind-html=\"$highlight($getDisplayText())\"></span>"
  );

  $templateCache.put("bootstrap/select-multiple.tpl.html","<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control\" ng-class=\"{open: $select.open}\"><div><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-hide=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" role=\"combobox\" aria-label=\"{{ $select.baseTitle }}\" ondrop=\"return false;\"></div><div class=\"ui-select-choices\"></div></div>");
  $templateCache.put("bootstrap/select.tpl.html","<div class=\"ui-select-container ui-select-bootstrap dropdown\" ng-class=\"{open: $select.open}\"><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" aria-activedescendant=\"ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}\" class=\"form-control ui-select-search ui-select-search-single\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.searchEnabled && $select.open\"><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");

}]);

angular.module('ui').config(
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
            if (item && item.hasOwnProperty(prop)) {
              //only match if this property is actually in the item to avoid
              var text = props[prop].toLowerCase();
              //search for either a space before the text or the textg at the start of the string so that the middle of words are not matched
              if (item[prop] && (item[prop].toString().toLowerCase().indexOf(text) === 0 || ( item[prop].toString()).toLowerCase().indexOf(' ' + text) !== -1)) {
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

angular.module('ui').controller('dynamicSelectController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {


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
            //$scope.select_model.selected = form.titleMap[0];
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


(function() {
'use strict';
/**
 * @ngdoc directive
 * @name qualita.directive:uiDatatable
 * @description
 * # uiDatatable
 */
angular.module('ui')
  .directive('uiDatatable', function ($timeout, $modal, $compile, $state, $resource, AuthorizationService, DTOptionsBuilder, DTColumnBuilder, baseurl, $rootScope) {

    var hasPermission = AuthorizationService.hasPermission;

    return {
      template: '<div>' +
    '<div class="widget">' +
      '<div class="widget-header bordered-top bordered-palegreen" ng-if="!options.hideHeader">' +
        '<span class="widget-caption">{{options.title}}</span>' +
        '<div class="widget-buttons">' +
          '<a href="" ng-show="canCreate()" ng-click="new()" title="Nuevo">' +
            '<i class="glyphicon glyphicon-plus"></i>' +
          '</a>' +
          '<a ng-repeat="menuOption in options.extraMenuOptions" href="" ng-show="menuOption.showCondition()" ng-click="menuOption.action()" title="{{menuOption.title}}">' +
            '<p><i class="{{menuOption.icon}}"></i>' +
            '  {{menuOption.data}}&nbsp;&nbsp;&nbsp;</p>' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<div class="widget-body">' +
          '<div class="table-responsive">' +
            '<table datatable="" dt-options="dtOptions" dt-columns="dtColumns" dt-instance="dtInstanceCallback" width=100% class="table table-hover table-responsive table-condensed no-footer">' +
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
        '</div>' +
      '</div>',
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

        var rangeSeparator = "~";
        var dateFormat = "DD/MM/YYYY";
        var defaultFilterType = 'string';
        var table;
        var tableId;


        var ajaxRequest = function(data, callback) {

          if (table) {
            $scope.options.tableAjaxParams = table.ajax.params();

            _.forEach(table.colReorder.order(), function(columnIndex, index) {
              if ($scope.customFilters[columnIndex]) {
                data.columns[index]['type'] = $scope.customFilters[columnIndex].filterType;
              } else {
                data.columns[index]['type'] = defaultFilterType;
              }
            });
          }
          data.rangeSeparator = rangeSeparator;
          //console.log(data);

          var xhr = $resource(urlTemplate($scope.options) + $.param(data), {}, {
            query: {
              isArray: false
            }
          });

          xhr.query().$promise.then(function(response) {
            //console.log("respuesta obtenida: ");
            //console.log(response);
            var datos = response.data;
            if(datos) {
              datos.forEach(function(registro) {
                Object.keys(registro).forEach(function(key) {
                  if(registro[key] === true) {
                    registro[key] = "Sí";
                  } else if(registro[key] === false) {
                    registro[key] = "No";
                  }
                });
              });
            }
            callback(response);
          }).catch(function(response) {
            console.log(response);
            console.log("error");
          });
        };
        var ajaxConfig = ($scope.options.ajax) ? $scope.options.ajax : ajaxRequest;

        //modelos de los filtros de rangos de fechas
        $scope.dateRangeFilters = {
          'i': {
            startDate: null,
            endDate: null
          }
        };

        //callback para el boton apply en el widget de rango de fechas
        var datePickerApplyEvent = function(ev, picker) {
          var ini = ev.model.startDate.format(dateFormat);
          var end = ev.model.endDate.format(dateFormat);

          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search(ini + rangeSeparator + end).draw();
        }

        //callback para el boton cancel en el widget de rango de fechas, que borra el filtro
        var datePickerCancelEvent = function(ev, picker) {
          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search("").draw();
          $("#daterange_" + ev.opts.index ).val("");
          $scope.dateRangeFilters[ev.opts.index].startDate = null;
          $scope.dateRangeFilters[ev.opts.index].endDate = null;
        }

        //callback para borrar el rango previamente seleccionado
        var datePickerShowEvent = function(ev, picker) {

          if ($scope.dateRangeFilters[ev.opts.index].startDate === null) {
            var widgetIndex = $scope.dateRangePickerWidgetsOrder.indexOf(ev.opts.index);
            var widget = $($(".daterangepicker").get(widgetIndex));
            widget.parent().find('.in-range').removeClass("in-range");
            widget.parent().find('.active').removeClass("active");
            widget.parent().find('.input-mini').removeClass("active").val("");
          }
        }

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
            'apply.daterangepicker' : datePickerApplyEvent,
            'cancel.daterangepicker' : datePickerCancelEvent,
            'show.daterangepicker' : datePickerShowEvent
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
        var rangePickerApplyEvent = function(ev, picker) {
          //console.log("apply");
          var ini = ev.model.startRange;
          var end = ev.model.endRange;

          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search(ini + rangeSeparator + end).draw();
        }

        //callback para el boton cancel en el widget de rango de numeros, que borra el filtro
        var rangePickerCancelEvent = function(ev, picker) {
          //console.log("cancel");
          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search("").draw();
          $("#numberrange_" + ev.opts.index ).val("");
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
            'apply.rangepicker' : rangePickerApplyEvent,
            'cancel.rangepicker' : rangePickerCancelEvent
          },
          opens: "right",
          index: 0,
          showDropdowns: true,
          locale: rangeLocaleOptions
        };

        $scope.rangePickerWidgetsOrder = [];

        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withOption('ajax', ajaxConfig)
          .withDataProp('data')
          .withOption('processing', true)
          .withOption('serverSide', true)
          //.withOption('order', [[$scope.options.defaultOrderColumn, $scope.options.defaultOrderDir]])
          //.withOption('order', [])
          .withOption('language', {
                  'sProcessing' : 'Procesando...',
                  'sLengthMenu' : 'Registros _MENU_',
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
          .withOption('headerCallback', function(header) {
            if (!$scope.headerCompiled) {
                // Use this headerCompiled field to only compile header once
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
          })
          .withPaginationType('full_numbers')
          .withButtons(['colvis'])
          .withBootstrap();

        if($scope.options.detailRows){
          $scope.dtOptions = $scope.dtOptions.withOption('rowCallback', rowCallback);
        }

        //inicializan la cantidad de columnas visibles
        $scope.visibleColumns = 0;//$scope.options.columns.length;

        $scope.dtColumns = [];
        //indices
        $scope.defaultColumnOrderIndices = [];
        $scope.originalIndexKey = {};

        //si tiene checkboxes para seleccion
        var indexPadding = 0;
        if($scope.options.isSelectable) {

          var titleHtml = '<label><input type="checkbox" ng-model="selectAll" ng-click="toggleAll()"><span class="text"></span></label>';

          selectionColumn = DTColumnBuilder.newColumn(null).withTitle(titleHtml).notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var checkbox = '<label>' +
                '<input id="' + data.id + '" type="checkbox" ng-model="options.selection[' + data.id + ']" ng-click="toggleOne()">' +
              '<span class="text"></span></label>';
              return checkbox;
          })
          .withOption('name', 'checkbox');

          $scope.dtColumns.push(selectionColumn);
          $scope.visibleColumns += 1;
          indexPadding = 1;
          $scope.originalIndexKey[0] = null;//'checkbox';
          $scope.defaultColumnOrderIndices.push(0);
          $scope.dtOptions.withColReorderOption('iFixedColumnsLeft', 1);
        }

        /* RENDERS BASICOS */
        var dateRender =  function(dateFormat) {
          return function(data) {
            //return moment.utc(data).format(dateFormat);
            return moment(data).format(dateFormat);
          }
        };

        var emptyRender =  function(data) {
          if (data == undefined) return "";
          else return data;
        };

        var numberRender =  function(data) {
          if (data) return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          else return '';
        };

        var monedaRender =  function(pathAtt) {
          return function(data, type, row) {
            if (data) {
              var moneda = "Gs. ";
              if (row[pathAtt]==='dolares') {
                moneda = "Usd. ";
                data = parseFloat(data).toFixed(2);
              } else if(row[pathAtt]==='pesos') {
                moneda = "Pes. ";
                data = parseFloat(data).toFixed(2);
              } else if (row[pathAtt]==='real') {
                moneda = "Rel. ";
                data = parseFloat(data).toFixed(2);
              } else if (row[pathAtt]==='euro') {
                moneda = "Eur. ";
                data = parseFloat(data).toFixed(2);
              }
              return moneda + data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else return "";
          }
        };

        var commonAttrs = ['data', 'title', 'class', 'renderWith', 'visible', 'sortable', 'searchable'];
        _.map($scope.options.columns, function(c, index){

          var column = DTColumnBuilder.newColumn(c.data);
          //el indice original para la columna
          var originalIndex = indexPadding + index
          $scope.originalIndexKey[originalIndex] = c.data;

          if(c.title) column = column.withTitle(c.title);
          if(c.class) column = column.withClass(c.class);
          if(c.renderWith) {
            if(c.renderWith === 'dateRender')
              column = column.renderWith(dateRender(c.dateFormat));
            else if (c.renderWith === 'emptyRender')
              column = column.renderWith(emptyRender);
            else if (c.renderWith === 'numberRender')
              column = column.renderWith(numberRender);
            else if (c.renderWith === 'monedaRender')
              column = column.renderWith(monedaRender(c.pathAttMoneda));
            else
              column = column.renderWith(c.renderWith);
          }
          if(c.sortable === false) column = column.notSortable();

          //si hay un orden definido y no está dentro de ese orden o si especifica que no es visible
          if(!_.contains($scope.options.defaultColumnOrder, c.data) || c.visible === false) column = column.notVisible();
          else $scope.visibleColumns += 1;

          _.forOwn(c, function(value, key){
            if(!_.contains(commonAttrs, key)) column = column.withOption(key, value);
          });

          if(c.searchable === false) {
            column = column.withOption('bSearchable', false);
          } else {
            column = column.withOption('bSearchable', true);
          }

          if(c.type) {
            var customFilter = {'filterType': c.type, 'filterUrl' : c.filterUrl};

            if (c.type === 'date-range') {
              $scope.dateRangeFilters[originalIndex] = {startDate: null, endDate: null};
            } else if (c.type === 'number-range') {
              $scope.numberRangeFilters[originalIndex] = {startRange: null, endRange: null};
            }

            $scope.customFilters[originalIndex] = customFilter;
          }
          $scope.dtColumns.push(column);
        });

        //console.log($scope.dtColumns);
        if($scope.options.hasOptions) {
          $scope.originalIndexKey[$scope.visibleColumns] = null;//'actions';
          // Fix last right column
          $scope.dtOptions.withColReorderOption('iFixedColumnsRight', 1);
          $scope.visibleColumns += 1;
        }

        //columnas reordenables, por defecto habilitado
        if ($scope.options.colReorder === true || $scope.options.colReorder === undefined) {
          $scope.dtOptions.withColReorder();
        }

        // Se establece el orden por defecto
        //$scope.dtOptions.withColReorderOrder($scope.defaultColumnOrderIndices);

        actionsColumn = DTColumnBuilder.newColumn(null).withTitle('Operaciones').notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var basicOpts = '<button class="btn-row-datatable btn btn-success btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canEdit(' + data.id + ')}" ng-click="edit(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-pencil"></span>' +
                  '</button>' +
                  '<button class="btn-row-datatable btn btn-danger btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canRemove(' + data.id + ')}" ng-click="remove(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-trash"></span>' +
                  '</button>' +
                  '<button class="btn-row-datatable btn btn-info btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canList(' + data.id + ')}" ng-click="view(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-eye-open"></span>' +
                  '</button>';
            if($scope.options.extraRowOptions) {
              _.forEach($scope.options.extraRowOptions, function(menuOpt) {
                var compilado = _.template(menuOpt.templateToRender);
                $scope[menuOpt.functionName] = menuOpt.functionDef;
                var customAttribute = menuOpt.customAttribute;
                var compiled = {'dataId': data.id, '$state': $state, '$scope': $scope};
                if(customAttribute && customAttribute.constructor === Array) {
                  compiled.dataCustom = JSON.stringify(_.map(customAttribute, function(ca) { return data[ca] }));
                } else {
                  compiled.dataCustom = JSON.stringify(data[menuOpt.customAttribute]);
                }
                basicOpts = basicOpts + compilado(compiled);
                $scope[menuOpt.conditionName] = menuOpt.conditionDef;
              });
            }
            return basicOpts;
          });


        $scope.canEdit = function(data) {
          var permission = hasPermission('update_' + $scope.options.resource);
          if($scope.options.extraEditConditions) {
            var valor = _.find(table.rows().data(), function(value) {
              return value.id == data;
            });
            return permission && $scope.options.extraEditConditions(valor) && !$scope.options.hideEditMenu;
          }
          return permission && !$scope.options.hideEditMenu;
        };

        $scope.canRemove = function(data) {
          var permission = hasPermission('delete_' + $scope.options.resource);
          if($scope.options.extraRemoveConditions) {
            var valor = _.find(table.rows().data(), function(value) {
              return value.id == data;
            });
            return permission && $scope.options.extraRemoveConditions(valor) && !$scope.options.hideRemoveMenu;
          }
          return permission && !$scope.options.hideRemoveMenu;
        };
 
        $scope.canCreate = function() {
          var permission = hasPermission('create_' + $scope.options.resource);
          return permission && ! $scope.options.hideAddMenu;
        };

        $scope.canList = function(data) {
          var permission = hasPermission('index_' + $scope.options.resource);
          if($scope.options.extraViewConditions) {
            var valor = _.find(table.rows().data(), function(value) {
              return value.id == data;
            });
            return permission && $scope.options.extraViewConditions(valor) && !$scope.options.hideViewMenu;
          }
          return permission && ! $scope.options.hideViewMenu;
        };

        if($scope.options.hasOptions) {
          $scope.dtColumns.push(actionsColumn);
          $scope.visibleColumns += 1;
        }

        $scope.new = function(){
          var pathTemplate;
          if(!$scope.options.customResource)
            pathTemplate = _.template('app.<%= resource %>.new');
          else
            pathTemplate = _.template('app.<%= customResource %>.new');
          $state.go(pathTemplate($scope.options), {});
        }

        $scope.edit = function(itemId){
          var pathTemplate;
          if(!$scope.options.customResource)
            pathTemplate = _.template('app.<%= resource %>.edit');
          else
            pathTemplate = _.template('app.<%= customResource %>.edit');
          $state.go(pathTemplate($scope.options), {id: itemId});
        }

        $scope.view = function(itemId) {
          var pathTemplate;
          if(!$scope.options.customResource)
            pathTemplate = _.template('app.<%= resource %>.view');
          else
            pathTemplate = _.template('app.<%= customResource %>.view');
          $state.go(pathTemplate($scope.options), {id: itemId});
        }

        $scope.toggleAll = function () {
            if ($scope.selectAll) {         //If true then select visible
                _.each(table.rows().data(), function (value, index) {
                    $scope.options.selection[value.id] = true;
                });
            } else {
              _.each(table.rows().data(), function (value, index) {
                  $scope.options.selection[value.id] = false;
              });
            }

        }

        $scope.toggleOne = function () {
            var notSelectAll = _.some(table.rows().data(), function (value, index) {
              return !$scope.options.selection[value.id];
            });
            $scope.selectAll = !notSelectAll;
        }

        //funciones para el select2
        var formatSelection = function(text) {
          return text.descripcion;
        };

        var formatResult = function(text) {
          if (text.descripcion === "")
            return '<div class="select2-user-result">Todos</div>';
          return '<div class="select2-user-result">' + text.descripcion + '</div>';
        };


        //funcion para crear los filtros
        var createFilters = function() {
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

                  $('#' + id).select2({
                    minimumResultsForSearch: -1,
                    //allowClear: true,
                    id: function (text) {
                      return text.descripcion;
                    },
                    data: function () {
                      return $http({
                        url: baseurl.getBaseUrl() + customFilter.filterUrl,
                        method: "GET"
                      });
                    },
                    ajax: {
                      url: baseurl.getBaseUrl() + "/" + customFilter.filterUrl,
                      dataType: 'json',
                      quietMillis: 250,
                      params: {headers: {"Authorization": $rootScope.AuthParams.accessToken}},
                      data: function (term, page) { // page is the one-based page number tracked by Select2
                        return {
                          q: term
                        };
                      },
                      results: function (data, page) { // parse the results into the format expected by Select2.
                        // since we are using custom formatting functions we do not need to alter the remote JSON data
                        return {results: data};
                      },
                      cache: true
                    },

                    initSelection: function (element, callback) {
                      //var id = $(element).val();
                      var value = table.column(column.idx).search();
                      $.ajax(baseurl.getBaseUrl() + "/" + customFilter.filterUrl, {
                        dataType: "json",
                        beforeSend: function (xhr) {
                          xhr.setRequestHeader("Authorization", $rootScope.AuthParams.accessToken);
                        }
                      }).done(function (data) {
                        callback(data);
                      });
                    },
                    formatResult: formatResult, // omitted for brevity, see the source of this page
                    formatSelection: formatSelection,  // omitted for brevity, see the source of this page
                    //dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                    escapeMarkup: function (m) {
                      return m;
                    }
                  })
                    .on('change', function (e) {
                      var value = $('#' + id).select2('val');

                      //los ids de los inputs tiene la forma "combo_[realIndex]"
                      var realIndex = parseInt(id.substring(6));
                      var index = table.colReorder.order().indexOf(realIndex);

                      //console.log(this.value);
                      if (this.value.length >= 1) {
                        table.column(index).search(this.value).draw();
                      } else {
                        table.column(index).search("").draw();
                      }
                    });
                }  else if (customFilter.filterType === 'date-range') {
                  $scope.dateRangeOptions[realIndex] = _.clone(dateRangeDefaultOptions, true);
                  $scope.dateRangeOptions[realIndex].index = realIndex;

                  //si esta despues de la mitad abrir a la izquierda
                  if (realIndex > ($scope.options.columns.length / 2)) {
                     $scope.dateRangeOptions[realIndex].opens = 'left';
                  }

                  //$('body').append('<div id="container-daterange_' + realIndex +'"></div>');
                  //$scope.dateRangeOptions[realIndex]['parentEl'] = "#container-daterange_" + realIndex;
                  $scope.dateRangePickerWidgetsOrder.push[realIndex];
                  var input = '<th><input id="daterange_' + realIndex +
                   '" date-range-picker class="column-filter form-control input-sm date-picker" options="dateRangeOptions[' + realIndex +
                    ']" type="text" ng-model="dateRangeFilters[' + realIndex + ']" /></th>';

                  html = $compile(input)($scope);
                } else if (customFilter.filterType === 'number-range') {
                  $scope.rangeOptions[realIndex] = _.clone(rangeDefaultOptions, true);
                  $scope.rangeOptions[realIndex].index = realIndex;

                  //si esta despues de la mitad abrir a la izquierda
                  if (realIndex > ($scope.options.columns.length / 2)) {
                     $scope.rangeOptions[realIndex].opens = 'left';
                  }

                  $scope.rangePickerWidgetsOrder.push[realIndex];
                  var input = '<th><input  id="numberrange_' + realIndex +
                   '" range-picker class="column-filter form-control input-sm " options="rangeOptions[' + realIndex +
                    ']" type="text" ng-model="numberRangeFilters[' + realIndex + ']" /></th>';

                  html = $compile(input)($scope);
                }

              } else if (column.mData && column.bSearchable) {
                var value = table.column(column.idx).search();

                html = '<th><input id="filtro_' + realIndex
                + '" class="column-filter form-control input-sm" type="text" style="min-width:60px; width: 100%;" value="' + value
                + '"/></th>';
              } else {
                html = '<th></th>';
              }

              $('#' + tableId + ' tfoot tr').append(html);
              //$('[id="filtro_' + table.colReorder.order()[column] + '"]').val(settings.oAjaxData.columns[column].search.value);            }
            }

            $compile($('.btn-row-datatable'))($scope);
          });

          //bind de eventos para filtros
          _.forEach($("[id^='filtro']"), function (el) {
            $(el).on('keyup change',
              function(e) {
                //los ids de los inputs tiene la forma "filtro_[realIndex]"
                var realIndex = parseInt(el.id.substring(7));
                var index = table.colReorder.order().indexOf(realIndex);

                if(this.value.length >= 1 || e.keyCode == 13){
                  table.column(index).search(this.value).draw();
                }

                // Ensure we clear the search if they backspace far enough
                if(this.value == "") {
                  table.column(index).search("").draw();
                }
            });
          });
        };

        /* Funcion de actualizacion de URL Base con o sin filtros estaticos */
        function updateStaticFilters() {
          if ($scope.options.staticFilter) {
            urlTemplate = _.template(baseurl.getBaseUrl() + '/<%= resource %>/datatables?search='
              + encodeURI(JSON.stringify($scope.options.staticFilter.search)) + '&');
          } else {
            urlTemplate = _.template(baseurl.getBaseUrl() + '/<%= resource %>/datatables?');
          }
        }

        $scope.dtInstanceCallback = function(dtInstance){
          $('thead+tfoot').remove();
          tableId = dtInstance.id;
          table = dtInstance.DataTable;

          //creacion de filtros
          $('#' + tableId).append('<tfoot><tr></tr></tfoot>');
          createFilters();
          $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');

          _.each($scope.dtColumns, function(col, index) {
              if(col.filter) {
                var a = $('.input-sm')[index + 1]; // data: estado
                a.value = col.filter;
              }
          });

          //Texto del boton de visibilidad de columnas
          //$(".dt-buttons").append("<label class='view-columns'>Vistas&nbsp;</label>");
          $(".dt-button.buttons-colvis").removeClass().addClass("columns-selection").html('<i class="glyphicon glyphicon-th-list"></i>');

          /* Esto se hace por un bug en Angular Datatables,
          al actualizar hay que revisar */
          // $scope.dtOptions.reloadData = function(){
          //   $('#' + tableId).DataTable().ajax.reload();
          // }

          /* funcion para actualizar la tabla manualmente */
          $scope.options.reloadData = function(){
            updateStaticFilters();
            $('#' + tableId).DataTable().ajax.reload();
          }

          /* whatcher para actualizar la tabla automaticamente cuando los filtros estaticos cambian */
          $scope.$watch(
              "options.staticFilter",
              function handleStaticFilterChange( newValue, oldValue ) {
                  //console.log( "oldValue", oldValue );
                  //console.log( "newValue", newValue );
                  updateStaticFilters();
                  $('#' + tableId).DataTable().ajax.reload();
              }
          );

          table.on('draw', function() {
            $timeout(function() {
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

          table.on('column-visibility', function (e, settings, column, state ) {
            //console.log('change column visibility %o', state);
            createFilters();
          });

          table.on('column-reorder', function (e, settings, details ) {
            //console.log('change column visibility %o', state);
            createFilters();
          });

          $scope.dtInstance = dtInstance;

          // obtiene los filtros actuales
          $scope.options.getFilters = function getFilters () {
            var filters = {};
            _.forEach(table.context[0].aoColumns, function (column) {
                  var realIndex = column._ColReorder_iOrigCol;
                  var data = column.mData;
                  if (data !== undefined && data !== "" && data !== null) {
                    //console.log(data);
                    filters[data] = table.column(realIndex).search();
                  }
            });
            return filters;
          }

          if ($scope.options.defaultOrderColumn !== undefined && $scope.options.defaultOrderDir !== undefined) {
            //console.log('order: ' + $scope.options.defaultOrderColumn);
            table.order([[$scope.options.defaultOrderColumn, $scope.options.defaultOrderDir]]);
          }
        }

        $scope.remove = function(itemId) {
          $scope.disableButton = false;
          $scope.selectedItemId = itemId;
          $scope.tituloModal = "Confirmación de Borrado";
          $scope.mensajeModal = "Esta operación eliminará el registro seleccionado. ¿Desea continuar?";
          $scope.modalInstanceBorrar1 = $modal.open({
            template: '<div class="modal-header">' +
                '<h3 class="modal-title">{{::tituloModal}}</h3>' +
            '</div>' +
            '<div class="modal-body">{{::mensajeModal}}</div>' +
            '<div class="modal-footer">' +
                '<button class="btn btn-primary" ng-disabled="disableButton" ng-click="ok(selectedItemId)">Aceptar</button>' +
                '<button class="btn btn-warning" ng-disabled="disableButton" ng-click="cancel()">Cancelar</button>' +
            '</div>',
            scope: $scope
          });

          $scope.cancel = function() {
            $scope.disableButton = true;
            $scope.modalInstanceBorrar1.dismiss('cancel');
          }

          $scope.ok = function(itemId) {
            $scope.disableButton = true;
            var model = $scope.options.factory.create({id: itemId});
            $scope.options.factory.remove(model).then(function() {
              // se refresca la tabla
              $('#' + tableId).DataTable().ajax.reload();
              $scope.modalInstanceBorrar1.close(itemId);
            }, function(error) {
              $scope.modalInstanceBorrar1.dismiss('cancel');
              $scope.tituloModal = "No se pudo borrar el registro";
              $scope.mensajeModal = $scope.options.failedDeleteError;
              var modalInstance = $modal.open({
                template: '<div class="modal-header">' +
                '<h3 class="modal-title">{{::tituloModal}}</h3>' +
                '</div>' +
                '<div class="modal-body">{{::mensajeModal}}</div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-primary" ng-click="cancel()">Aceptar</button>' +
                '</div>',
                scope: $scope
              });
              $scope.cancel = function() {
                modalInstance.dismiss('cancel');
              };
              console.log("error al borrar: ");
              console.log(error);
            });
          }
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
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.Authentication
 * @description
 * # Authentication
 */
angular.module('ui')
  .service('AuthenticationService', function ($resource, $rootScope, $http, baseurl) {
    var Authentication = $resource(baseurl.getBaseUrl() + '/:action', {action: '@action'});

    return {

      login: function (username, password) {
        $rootScope.auxiliarUsername = username;
        var auth = new Authentication({username: username, password: password});
        return auth.$save({action: 'login'});
      },

      postLogin: function(authParams) {
        return new Authentication.save({action: 'loginApp'}, {username: authParams.username});
      },

      token: function (authParams) {
        var auth = new Authentication({
          username: authParams.username,
          accessToken: authParams.accessToken,
          requestToken: authParams.requestToken
        });
        return auth.$save({action: 'token'});
      },

      logout: function () {
        var authParams = this.getCurrentUser();
        var auth = new Authentication({
          username: authParams.username,
          accessToken: authParams.accessToken
        });
        $rootScope.AuthParams = {};
        localStorage.removeItem('AUTH_PARAMS');

        return auth.$save({action: 'logout'});
      },

      getCurrentUser: function () {
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
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.Authorization
 * @description
 * # Authorization
 */
angular.module('ui')
  .service('AuthorizationService', function ($rootScope, $resource, $http, baseurl, AuthenticationService) {
    
    var Authorization = $resource(baseurl.getBaseUrl() + '/authorization/:action',
                                  {action: '@action'});

    return {
      /**
       * Retorna true si el usuario actual de la aplicación posee el permiso dado como
       * parámetro.
       **/
      hasPermission: function(permission, userToCheck) {
        var user = userToCheck || AuthenticationService.getCurrentUser();
        var permissions = [];

        if (user) {
          permissions = user.permissions || [];
        }
        return permissions.indexOf(permission) >= 0;
      },

      principal: function() {
        return Authorization.get({action: 'principal'}).$promise;
      },

      setupCredentials: function(username, requestToken, accessToken, callback) {
        
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
          callback(AuthParams);
        });
      },

      cleanupCredentials: function() {        
        localStorage.removeItem('AUTH_PARAMS');
      },

      authorize: function (loginRequired, requiredPermissions) {
          var user = AuthenticationService.getCurrentUser();

          if (loginRequired === true && user === undefined) {
            return this.enums.LOGIN_REQUIRED;
          } else if ((loginRequired && user !== undefined) &&
            (requiredPermissions === undefined || requiredPermissions.length === 0)) {
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
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.baseurl
 * @description
 * # baseurl
 */
angular.module('ui')
  .provider('baseurl', function () {
    this.config = {};

    this.setConfig = function(config) {
        this.config = config;
    };

    this.$get = function() {
      var Config = this.config;
      return {
        getBaseUrl: function () {
          var hostname = window.location.hostname;

          //si es el servidor de homologacion
          if (hostname === Config.serverIp) {
            return 'http://' + hostname + '/' + Config.serverName + '/' + Config.serverAPI;
          }else{
            //si es localhost es desarrollo local
            return 'http://' + hostname + ':' + Config.serverPort + 
                   '/' + Config.serverName + '/' + Config.serverAPI;
          }
        },

        getPublicBaseUrl: function () {
          var hostname = window.location.hostname;

          //si es el servidor de homologacion
          if (hostname === Config.serverIp){
            return 'http://' + hostname + '/public/';
          }else{
            //si es localhost es desarrollo local
            return 'http://' + hostname + ':' + Config.serverPort + '/public/';
          }
        },

        getBareServerUrl: function() {
          var hostname = window.location.hostname;
          //si es el servidor de homologacion
          if (hostname === Config.serverIp) {
            return 'ws://' + hostname + '/' + Config.serverWSName + '/';
          }else{
            //si es localhost es desarrollo local
            return 'ws://' + hostname + ':' + Config.serverPort + '/' + Config.serverName + '/';
          }
        }
      };
    };
  });
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.fileUpload
 * @description
 * # fileUpload
 */
angular.module('ui').config(
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
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.filterFactory
 * @description
 * # filterFactory
 * Factory in the qualita.
 */
angular.module('ui')
  .factory('filterFactory', function () {
    var logicalOp = function (type, filters) {
      var result = {
        _inner: {
          type: type
        }
      };

      if (filters.constructor !== Array) {
        filters = [filters];
      }

      result._inner.filters = (this && this._inner) ? [this._inner, filters] : filters;
      if (!result.or && type === 'and') result.or = or;
      if (!result.value) result.value = value;
      if (!result.add) result.add = add;
      result.paginate = paginate;
      return result;
    };

    var and = function (filters) {
      return logicalOp.call(this, 'and', filters);
    };

    var or = function (filters) {
      return logicalOp.call(this, 'or', filters);
    };

    var add = function (filter) {
      this._inner.filters.push(filter);
      return this;
    };

    var single = function (filter) {
      return and([filter]);
    };

    var value = function () {
      return this._inner;
    };

    var paginate = function (limit, offset) {
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
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.formFactory
 * @description
 * # formFactory
 */
angular.module('ui')
  .factory('formFactory', function ($location, $localForage, notify, $rootScope, AuthorizationService, $q) {
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
      defaultViewOptions: function() {
        return {
          formDefaults: {
            disabled: true,
            disableSuccessState: true,
            disableErrorState: true,
            feedback: false            
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
          if(scope.schema) {
            var schema = scope.schema;
          } else {
            var schema = vm.schema;
          }
          _.each(schema.properties, function (field, fieldName) {
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
            $rootScope.isProcessing = false;

            if (errorHandler) {
              errorHandler(e);
              return;
            }

            //se convierten los campos de fecha desde date a string
              if(scope.schema) {
                var schema = scope.schema;
              } else {
                var schema = vm.schema;
              }
            _.each(schema.properties, function (field, fieldName) {
              if (field.format && (field.format === 'date' || field.format === 'date-time')) {
                if(scope.model[fieldName] && scope.model[fieldName] instanceof Date) {
                  scope.model[fieldName] = currentForm[fieldName].$viewValue;//.to('dd/MM/yyyy');
                }
              }
            });

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

            // manejo general de errores
            else if(e && e.status === 500) {
              var msg = '';
              _.forEach(e.data, function(error) {
                msg += '\n\n' + error.message + '.'
              });
              notify({ message: msg, classes: 'alert-danger', position: 'right' });
              // guardar en local storage
              deferred.reject(msg);
            }

          });
        }
      },
      defaultNSFSubmit: function(form, factory, resourceModel, errorHandler) {
        var deferred = $q.defer();
        // Then we check if the form is valid
        if (form.$valid && !$rootScope.isProcessing) {
          $rootScope.isProcessing = true;
          // ... do whatever you need to do with your data.
          var model = factory.create(resourceModel);

          //se convierten los campos de fecha desde string a date
          factory.save(model).then(function(response){
            // la redireccion se deja a cargo del controller
            // $location.path('/' + resource);
            deferred.resolve(response);
          })
          .catch(function(e) {
            console.log(e);
            $rootScope.isProcessing = false;

            if (errorHandler) {
              errorHandler(e);
              deferred.reject(msg);
            } else {
              //se establecen los errores del backend
              if(e && e.status === 500) {
                var msg = '';
                _.forEach(e.data, function(error) {
                  msg += '\n\n' + error.message + '.'
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

      canEdit : function(resource) {
          var permission = hasPermission('update_' + resource);
          return permission;
      },

      canList : function(resource) {
        var permission = hasPermission('index_' + resource);
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
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.HttpInterceptor
 * @description
 * # HttpInterceptor
 */
angular.module('ui')
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
        console.log('responseError 401');
        var notify = $injector.get('notify');
        if(rejection.status === 401) {
          if(rejection.data && rejection.data.code === 403) {
            // error de autorización
            notify({
              message: rejection.data.error,
              classes: ['alert-danger'],
              position: 'right'
            });
            $location.path('/');
            return $q.reject(rejection);
          }

          if($location.path() === "/login") {
            return $q.reject(rejection);
          }


          var deferred = $q.defer();
          var AuthenticationService = $injector.get('AuthenticationService');
          var $http = $injector.get('$http');
          var auth = AuthenticationService.token($rootScope.AuthParams);

          auth.then(function(response) {
            $rootScope.AuthParams.accessToken = response.accessToken;
            localStorage.setItem('AUTH_PARAMS', JSON.stringify($rootScope.AuthParams));
            $http.defaults.headers.common.Authorization = 'Bearer ' + response.accessToken;
            AuthenticationService.postLogin($rootScope.AuthParams).$promise.then(function (data){
              $rootScope.AuthParams.accesoSistema = data;
              console.log("se ejecutó el response error");
              $http.defaults.headers.common['X-Access'] = $rootScope.AuthParams.accesoSistema.accesosSistema[0].locacion.id;
            });
          }).then(deferred.resolve, deferred.reject);

          return deferred.promise.then(function() {
              //$http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
              rejection.config.headers.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
              return $http(rejection.config);
          });
        }
        return $q.reject(rejection);
      }
    };
  });
}());

(function() {
'use strict';

angular.module('ui')
  .factory('ModelTrimmer', ModelTrimmer);

function ModelTrimmer() {
  var service = {
    trimDetails: trimDetails
  };

  return service;

  function trimDetails(model, ignoredFields) {
    var response = {};
    var keys = _.keys(model);

    _.forEach(keys, function(key) {
      var ignoredIndex = _.findIndex(ignoredFields, function(elem) { return elem == key; } );
      if(ignoredFields &&  ignoredIndex !== -1) {
        response[key] = model[key];
        return;
      }

      if(_.isArray(model[key]) == true) {
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
    if(_.isObject(model[fieldName]) && model[fieldName].hasOwnProperty("id")) {
      newModel[fieldName] = model[fieldName].id;
    } else {
      newModel[fieldName] = model[fieldName];
    }
  }
}
}());

(function() {
angular.module('ui')
  .factory('NotificacionesWSFactory', NotificacionesWSFactory);
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

  var notificaciones = $resource( baseurl.getBaseUrl() + "/notificaciones/:id", {id: '@id'}, {
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
    if(forceClose) {
      forzar = forceClose;
    }

    websocket.close(forzar);
  }

  function create(attrs) {
    return new notificaciones(attrs);
  }

  function get(id) {
    return notificaciones.get({id: id});
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
    websocket.onOpen(function() {
      console.log("Socket abierto");
      retries = 0;
    });

    websocket.onClose(function() {
      console.log("Socket cerrado");
      if(!closedByUser) {
        if(retries < 4) {
          retries = retries + 1;
          $timeout(function() { init(username) }, (1000 * retries));
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
    if(!websocket) {
      websocket = $websocket(baseurl.getBareServerUrl() + "wsnotificaciones");
    }
    websocket.onMessage(functionHandler);
  }

  function remove(notificacion) {
    return notificacion.$remove();
  }

  function save(notificacion) {
    return (notificacion.id) ? notificacion.$update() : notificacion.$save();
  }
}
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.ReportTicketFactory
 * @description
 * # ReportTicketFactory
 */
angular.module('ui')
  .factory('ReportTicketFactory', ['$resource', 'baseurl', function ($resource, baseurl) {
  
    var ReportTicket = $resource(baseurl.getBaseUrl() + '/ticket/:reportID?:query&currentColumnOrder=:currentColumnOrder', 
      {
        action: '@reportID'
      });

    return {
      ticket: function(reportID, filters, searchParams, currentColumnOrder) {
        var report = new ReportTicket(filters);
        var params = {reportID: reportID}; 

        if (searchParams) {
          params.query = decodeURIComponent($.param(searchParams));
        }

        if (currentColumnOrder) {
          params.currentColumnOrder = currentColumnOrder;
        }
        
        return report.$save(params);
      },

      downloadURL: function(reportTicket, exportType) {
        console.log('downloadURL');
        return baseurl.getBaseUrl() + '/generar/' + reportTicket + '/' + exportType;
      },

      downloadCustomReport: function(reportID, exportType, filters) {
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
}());
(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.UploadFactory
 * @description
 */
angular.module('ui')
  .service('UploadFactory', ['$rootScope', 'baseurl', function ($rootScope, baseurl) {
      var flow;
      var mimeTypeMap = {
        jpg: 'image/jpg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif'
      };
     
      function setFlow(uploadOptions) {
        flow = uploadOptions.flow;
      }

      // Public API here
      return {
        getCurrentFiles: function(uploadOptions) {
          var self = this;
          setFlow(uploadOptions);

          if(!flow) {
            return;
          }
          var flowFiles = flow.files;
          var files = []; // Lista de objetos de tipo { path: '' }

          if (flowFiles.length > 0){
            angular.forEach(flowFiles, function(file) {
              files.push({
                path: self.getFilename(file)
              });
            });
          }
          return files;
        },

        clearCurrentFiles: function() {
          $rootScope.flow.files = [];
        },

        /**
         * Se encarga de cargar en el objeto flow el array de imagenes.
         **/
        addFiles: function(images) {
          setFlow();
          
          if(!flow) {
            return;
          }
          
          angular.forEach(images, function(img) {
            var contentType = mimeTypeMap[img.path.toLowerCase().substring(_.lastIndexOf(img.path, '.') + 1)];
            var blob = new Blob(['pre_existing_image'], {type: contentType});
            blob.name = img.path;
            blob.image_url = baseurl.getPublicBaseUrl() + img.path;
            var file = new Flow.FlowFile(flow, blob);
            file.fromServer = true; // el archivo ya se encuentra en el servidor, no hay que procesar de vuelta.
            flow.files.push(file);
          });
        },
        
        /**
         * Retorna el nombre del archivo. Esto se corresponde con la logica en el backend
         **/
        getFilename: function(file) {
          
          if(file.fromServer) {
            return file.name;
          }
          var basename = file.size + '-' + file.name;
          // se corresponde con el backend
          basename = basename.replace(/[^a-zA-Z/-_\\.0-9]+/g, '');
          basename = basename.replace(/\s/g, '');
          return basename;
        }
      };
  }]);
}());

(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.usuariosFactory
 * @description
 * # usuariosFactory
 */
angular.module('ui')
  .factory('usuariosFactory', function ($resource, filterFactory, baseurl) {

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
      }
    };
  });
}());

(function() {
'use strict';

angular.module('ui')
  .factory('Util', Util);

function Util() {
  var service = {
    toUnidadMedidaBase: toUnidadMedidaBase,
    fromUnidadMedidaBase: fromUnidadMedidaBase
  };

  return service;

  function toUnidadMedidaBase(cantidad, unidadMedida) {
      var multiplicador=1;
      var unidadActual = unidadMedida;
      while(!unidadActual.esBase){
        multiplicador=multiplicador*unidadActual.cantidad;
        unidadActual=unidadActual.unidadContenida;
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
}());