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
