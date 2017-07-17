(function() {
  'use strict';

  angular
    .module('ui')
    .directive('validatedUiselectMultipleInput', validatedUiselectMultipleInput);

  function validatedUiselectMultipleInput() {
    var directive = {
      restrict: 'E',
      scope: {
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        fieldToShow: '@',
        options: '=',
        classes: '@',
        onSelect: '&',
        isDisabled: '=',
        /**
         * Representa un callback que recibe como parámetro el texto ingresado por el usuario y retorna
         * un promise. Al especificar esta opción, se define ui-select en modo lazy load.
         */
        optionsLoader: '&?',

        /**
         * Callback que se encarga de definir el texto que se muestra al usuario. Al especificar
         * un renderer, el campo atributo field-to-show se ignora por completo.
         */
        renderer: '&?',

        /**
         * Longitud mínima para que el search input dispare la lógica de búsqueda. Valor por defecto 0.
         */
        searchTextMinLength: '@',
        /**
         *  Si es true, no concatena la respuesta del optionsLoader
         */
        loadReplace: '=',
        /**
         *  Si se usa optionsLoader, el key donde está la respuesta del server
         */
        keyData: '@',

        /**
         * El theme a utilizar por ui-select. Por defecto boostrap.
         */
        theme: '='
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-uiselect-multiple-input.html',
      link: linkFunc,
      controller: ValidatedUiselectMultipleInputController,
    };

    function linkFunc(scope, elem, attr) {}

    return directive;
  }

  ValidatedUiselectMultipleInputController.$inject = ['$scope', '$timeout', '$element'];

  function ValidatedUiselectMultipleInputController($scope, $timeout, $element) {
    var vm = this;

    vm.getChoice = getChoice.bind(this);
    vm.selectListener = selectListener.bind(this);
    vm.getFilter = getFilter.bind(this);
    vm.loadOptions = loadOptions.bind(this);
    vm.selectedTheme = vm.theme || 'bootstrap';

    activate();

    function activate() {
      vm.loadOptions();
      vm.handleLazyLoading = vm.optionsLoader ? vm.loadOptions : undefined;
      var len = vm.searchTextMinLength ? parseInt(vm.searchTextMinLength) : 0;

      // listener para el text input asociado al ui-select.
      $timeout(() => {
        var input = $element.find('input.ui-select-search');

        $(input).on('keyup', () => {
          var query = $(input).val();

          if (query !== '' && len && query.length < len) {
            return;
          }
          $scope.$apply(() => vm.loadOptions(query));
        });
      }, 0);
    }

    function getChoice(item) {
      if (!item) {
        return;
      }

      if (angular.isFunction(vm.renderer)) {
        return vm.renderer({ item: item });
      }
      return _.get(item, vm.fieldToShow);
    }

    function selectListener() {
      $timeout(vm.onSelect, 0);
    }

    function getFilter(param) {
      return { $: param };
    }

    function loadOptions(query) {
      let vm = this;

      if (!angular.isFunction(this.optionsLoader)) {
        $scope.$watch('vm.options', (value) => {
          if (!value) {
            return;
          }
          vm.availableOptions = query ? $filter('filter')(value, vm.getFilter(query)) : value;
        });
        vm.availableOptions = query ? $filter('filter')(vm.options, vm.getFilter(query)) : vm.options;
        return;
      }
      let rsp = this.optionsLoader({ query: query });

      if (rsp && angular.isFunction(rsp.then)) {
        rsp.then(function(response) {
          var data = response;
          if (vm.keyData) {
            data = response[vm.keyData];
          }
          vm.availableOptions = vm.availableOptions || [];
          if (vm.loadReplace == undefined || vm.loadReplace) {
            vm.availableOptions = data;
          } else {
            vm.availableOptions = vm.availableOptions.concat(data);
          }
        });
      }
    }
  }
}());