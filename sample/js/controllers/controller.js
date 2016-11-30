(function(){
'use strict';

angular
  .module('uix')
  .config(config)
  .controller('MainCtrl', MainCtrl);



MainCtrl.$inject = ['PersonaService', 'translations'];

function MainCtrl(PersonaService, translations) {
  var vm = this;

  activate();

  function activate() {
    var defaultColumnOrder = ['nombre', 'apellido', 'cedula', 'fechaNacimiento'];
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
        {data: 'fechaNacimiento', title: translations.FECHA_NACIMIENTO, type: 'date-range'}
      ],
      defaultOrderColumn : 0,
      defaultOrderDir: 'desc'
    };
  }
}

function config(tkeysProvider) {
  tkeysProvider.addKeys('MainCtrl', ['NOMBRE', 'APELLIDO', 'CEDULA', 'FECHA_NACIMIENTO']);
}
}());
