(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.directive:fileupload
   * @description
   * # fileupload
   */
  angular
    .module('ui')
    .directive('fileupload', fileupload);

  fileupload.$inject = ['ngNotify'];

  function fileupload(ngNotify) {
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
         */
        options: '=',
        title: '@',
        ngModel: '='
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
        scope.adjuntosBaseURL = scope.options.publicPath;
        scope.fileAdded = fileAdded.bind(scope);
        scope.uploadCompleted = uploadCompleted.bind(scope);
        scope.loadFiles = loadFiles.bind(scope);
        scope.getCurrentFiles = getCurrentFiles.bind(scope);
        scope.getFilename = getFilename.bind(scope);
        scope.mimeTypeMap = {
          jpg: 'image/jpg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif'
        };

        if (scope.ngModel) {
          scope.loadFiles(angular.isArray(scope.ngModel) ? scope.ngModel : [scope.ngModel]);
        }
      }
    }

    function fileAdded(file, event) {
      // controlamos que no se supere el limite de tamano          
      if (this.options.FILE_UPLOAD_LIMIT && file.size > (this.options.FILE_UPLOAD_LIMIT * 1000 * 1000)) {
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
      this.ngModel = files;
    }

    /**
     * Retorna una lista compacta de los archivos cargados correctamente.
     * 
     * @param {object[]} files - FlowFile list
     */
    function getCurrentFiles(flowFiles) {
      var files = []; // Lista de objetos de tipo { path: '' }

      if (flowFiles.length > 0) {
        angular.forEach(flowFiles, (file) => {
          files.push({
            path: this.getFilename(file)
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
      angular.forEach(images, (img) => {
        let flow = this.uploader.flow;
        let contentType = this.mimeTypeMap[img.path.toLowerCase().substring(_.lastIndexOf(img.path, '.') + 1)];
        let blob = new Blob(['pre_existing_image'], { type: contentType });
        blob.name = img.path;
        blob.image_url = this.options.publicPath + img.path;
        let file = new Flow.FlowFile(flow, blob);
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
      let basename = file.size + '-' + file.name;
      basename = basename.replace(/[^a-zA-Z/-_\\.0-9]+/g, '');
      basename = basename.replace(/\s/g, '');
      return basename;
    }
  }
} ());
