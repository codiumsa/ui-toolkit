(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.directive:fileupload
   * @description
   * # fileupload
   */
  angular.module('ui')
    .directive('fileupload', ['ngNotify', 'UploadFactory', 'baseurl', function (ngNotify, UploadFactory, baseurl) {
      return {
        templateUrl: 'views/fileupload.html',
        restrict: 'E',
        tranclude: true,
        scope: {
          options: '=',
          title: '@'
        },
        link: function postLink(scope, element, attrs) {
          var defaults = {
            singleFile: false,
            method: 'octet',
            showFilesSummary: false
          };
          defaults.target = scope.options.target;
          scope.uploader = {};
          scope.uploader.flow = new Flow(defaults);
          scope.title = attrs.title;
          scope.fileModel = {};

          scope.progressWith = function (progress) {
            return (progress * 100) + '%';
          };

          scope.files = [];
          scope.adjuntosBaseURL = baseurl.getPublicBaseUrl();

          scope.fileAdded = function (file, event) {
            // controlamos que no se supere el limite de tamano          
            if (scope.options.FILE_UPLOAD_LIMIT && file.size > (scope.options.FILE_UPLOAD_LIMIT * 1000 * 1000)) {
              event.preventDefault();
              ngNotify.set('El tamaño del archivo supera el límite de ' + scope.options.FILE_UPLOAD_LIMIT + ' MB.', 'error');
              return false;
            }
            var ext = file.getExtension();
            // si es imagen controlamos que sea alguna de las extensiones permitidas
            if (scope.options.imageOnly && ['png', 'gif', 'jpg', 'jpeg'].indexOf(ext) < 0) {
              ngNotify.set('Solo se permiten archivos con extensión: png, gif, jpg o jpeg.', 'error');
              return false;
            }
            // controlamos que el tamanio del nombre no supere 255 caracteres
            if (file.name.length > 255) {
              ngNotify.set('El nombre del archivo supera los 255 caracteres', 'error');
              return false;
            }
          };

          scope.uploadCompleted = function () {
            ngNotify.set('Archivo cargado correctamente', 'success');
            var files = UploadFactory.getCurrentFiles(scope.uploader);

            if (angular.isFunction(scope.options.onComplete)) {
              scope.options.onComplete(files);
            }
          };
        }
      };
    }]);
} ());
