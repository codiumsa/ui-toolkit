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
  function(schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider, flowFactoryProvider) {

        flowFactoryProvider.defaults = {
          method: 'octet'
        };

        var fileupload = function(name, schema, options) {
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
        schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'fileupload',
          'views/directives/fileupload.html');
        schemaFormDecoratorsProvider.createDirective('fileupload',
          'views/directives/fileupload.html');
  }]).factory('fileupload', function() {});
}());


/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */
angular.module('ui').filter('filesize', function() {
  var units = [
    'bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB'
  ];

  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '?';
    }

    var unit = 0;

    while (bytes >= 1024) {
      bytes /= 1024;
      unit++;
    }

    return bytes.toFixed(+precision) + ' ' + units[unit];
  };
});