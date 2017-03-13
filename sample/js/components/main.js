(function() {
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

  MainCtrl.$inject = ['PersonaService', '$timeout', 'Filter', 'ConfirmationModal', '$http'];

  function MainCtrl(PersonaService, $timeout, Filter, ConfirmationModal, $http) {
    var vm = this;
    Object.assign(this, { ConfirmationModal });

    activate();

    function activate() {
      const parametrosQuery = Filter.path('tipo.codigo').eq('modulo');
      const parametrosUrl = encodeURI('valores?filter=' + JSON.stringify(parametrosQuery));
      const defaultColumnOrder = ['nombre', 'apellido', 'cedula', 'fechaNacimiento'];
      vm.options = {
        resource: '@', // resource '@' significa in-memory
        title: 'Listado de personas',
        factory: PersonaService,
        hasOptions: true,
        defaultColumnOrder: defaultColumnOrder,
        columns: [
          { data: 'id', title: '', visible: false },
          {
            data: 'nombre',
            title: vm.translations.NOMBRE,
            type: 'combo',
            filterUrl: parametrosUrl,
            idField: 'valor',
            textField: 'valor'
          },
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
        onComplete: function(files) {
          console.log('UPLOADED', files);
        },
        target: 'http://127.0.0.1:8080/spa-backend/api/adjuntos',
        publicPath: 'http://127.0.0.1:8080/public/spa-frontend',
        imageOnly: true
      };

      $timeout(function() {
        vm.files = {
          id: 1,
          path: '1016175.jpg'
        };
      }, 5000);

      vm.model = {};
      vm.paises = [
        { id: 1, nombre: 'Paraguay' },
        { id: 2, nombre: 'Brasil' },
        { id: 3, nombre: 'Argentina' }
      ];
      vm.fileuploadDisabled = false;
      vm.onPasswordGenerate = (password) => console.log('password', password);
      vm.showConfirmationModal = showConfirmationModal.bind(vm);
      vm.checkbox = true;
      $timeout(() => {
        vm.checkboxDisabled = true;
      }, 3000);

      vm.searchRepositories = searchRepositories.bind(vm);
      vm.renderRepo = renderRepo.bind(vm);
      vm.currentPage = 1;
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

    function showConfirmationModal() {
      this.ConfirmationModal.open({
        title: 'Borrar elemento',
        id: 1,
        message: '¿Desea borrar elemento?',
        ok: function() {
          console.log(`Se borró ${this.id}`);
        }
      });
    }

    /**
     * Handler para lazy loading de ui-select
     * @param {string} query.
     * @param {number} page.
     */
    function searchRepositories(query) {
      this.currentPage = this.currentPage + 1;
      query = query || 'angular';

      return $http({ url: 'https://api.github.com/search/repositories?q=' + query + '&page=' + this.currentPage }).then(
        response => {
          return response.data.items;
        }
      );
    }

    function renderRepo(repo) {
      return `
        <p>
          ${repo.full_name} <i class="fa fa-star">  ${repo.stargazers_count}</i>
        </p>
      `;
    }
  }

  function config(tkeysProvider) {
    tkeysProvider.addKeys('MainCtrl', ['NOMBRE', 'APELLIDO', 'CEDULA', 'FECHA_NACIMIENTO']);
  }
}());