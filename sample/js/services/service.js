(function() {
'use strict';

angular
  .module('uix')
  .factory('PersonaService', PersonaService);

PersonaService.$inject = ['Filter'];

function PersonaService(Filter) {

  // tiny Filter test
  var filters = Filter.path('nombre').eq('Jorge').build();
  console.log('FILTER TEST', filters);

  // esta es la API minima para un factory
  var service = {
    all: all,
    get: get,
    create: create,
    save: save,
    remove: remove
  };
  var personas = [
    {id: 1, nombre: 'Carlos', apellido: 'Sanchez', cedula: '121212'},
    {id: 2, nombre: 'Juan', apellido: 'Ramirez', cedula: '131313'}
  ];

  return service;

  function all() {
    return personas;
  }

  function get(id) {
  }

  function create() {
  }
  
  function save(persona) { 
  }

  function remove() {
  }
}
}());
