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
