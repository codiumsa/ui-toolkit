(function () {
  'use strict';

  angular
    .module('uix')
    .config(config)
    .component('main', {
      templateUrl: 'views/main.html',
      selector: 'main',
      bindings: {
        translations: '='
      },
      controller: MainCtrl,
      controllerAs: 'vm'
    });

  MainCtrl.$inject = ['PersonaService', '$timeout'];

  function MainCtrl(PersonaService, $timeout) {
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
          { data: 'nombre', title: vm.translations.NOMBRE },
          { data: 'apellido', title: vm.translations.APELLIDO },
          { data: 'cedula', title: vm.translations.CEDULA },
          { data: 'fechaNacimiento', title: vm.translations.FECHA_NACIMIENTO, type: 'date-range' }
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

      $timeout(function () {
        vm.files = {
          id: 1,
          path: '1016175.jpg'
        };
      }, 5000);
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
