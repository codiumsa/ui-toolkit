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