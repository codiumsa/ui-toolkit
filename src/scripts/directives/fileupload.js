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
      templateUrl: 'views/fileupload.html',
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
