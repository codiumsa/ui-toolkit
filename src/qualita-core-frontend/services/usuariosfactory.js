'use strict';

/**
 * @ngdoc service
 * @name qualita.usuariosFactory
 * @description
 * # usuariosFactory
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('usuariosFactory', function ($resource, filterFactory, baseurl) {
    // Service logic
    // ...

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
      }/*,

      schema: function() {
        return schema;
      },

      form: function() {
        return form;
      }*/
    };
  });
