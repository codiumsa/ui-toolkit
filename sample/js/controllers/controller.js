(function () {
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
        hasOptions: true,
        defaultColumnOrder: defaultColumnOrder,
        columns: [
          { data: 'id', title: '', visible: false },
          { data: 'nombre', title: translations.NOMBRE },
          { data: 'apellido', title: translations.APELLIDO },
          { data: 'cedula', title: translations.CEDULA },
          { data: 'fechaNacimiento', title: translations.FECHA_NACIMIENTO, type: 'date-range' }
        ],
        defaultOrderColumn: 0,
        defaultOrderDir: 'desc',
        onNew: onNew,
        onEdit: onEdit,
        onView: onView,
        onRemove: onRemove
      };

      vm.uploadOptions = {
        onComplete: function (files) {
          console.log('UPLOADED', files);
        },
        target: 'http://127.0.0.1:8080/spa-backend/api/adjuntos',
        publicPath: 'http://127.0.0.1:8080/public/spa-frontend/',
        imageOnly: true
      };
      vm.files = {
        path: '1016175.jpg'
      };
    }
  }

  function config(tkeysProvider) {
    tkeysProvider.addKeys('MainCtrl', ['NOMBRE', 'APELLIDO', 'CEDULA', 'FECHA_NACIMIENTO']);
  }

  function onNew() {
    console.log('on new');
  }

  function onEdit(itemId) {
    console.log('on edit: ' + itemId);
  }

  function onView(itemId) {
    console.log('on view: ' + itemId);
  }

  function onRemove(itemId) {
    console.log('on remove: ' + itemId);
  }
} ());
