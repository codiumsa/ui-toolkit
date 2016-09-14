(function(){
'use strict';

angular
  .module('uix')
  .config(config)
  .controller('MainCtrl', Controller);



Controller.$inject = ['PersonaService', 'translations'];

function Controller(PersonaService, translations) {
  var vm = this;

  activate();

  function activate() {
    var defaultColumnOrder = ['nombre', 'apellido', 'cedula'];
    vm.options = {
      resource: '@', // resource '@' significa in-memory
      title: 'Listado de personas',
      factory: PersonaService,
      defaultColumnOrder: defaultColumnOrder,
      columns: [
        {data: 'id', title: '', visible: false},
        {data: 'nombre', title: translations.NOMBRE},
        {data: 'apellido', title: translations.APELLIDO},
        {data: 'cedula', title: translations.CEDULA},
      ],
      defaultOrderColumn : 0,
      defaultOrderDir: 'desc'
    };
  }
}

function config(tkeysProvider) {
  tkeysProvider.addKeys('MainCtrl', ['NOMBRE', 'APELLIDO', 'CEDULA']);
}
}());
