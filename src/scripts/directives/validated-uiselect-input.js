(function() {
  'use strict';

  angular
    .module('ui')
    .directive('validatedUiselectInput', validatedUiselectInput);


  function validatedUiselectInput() {
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
        focusElement: '@',
        isDisabled: '=',
        /**
         * Representa un callback que recibe como parámetro el texto ingresado por el usuario y retorna
         * un promise.
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
         * Al especificar el callback lazy-loader, ui-select agrega el enlace "..." al final del dropdown. Este
         * handler es invocado al hacer click en el enlace. Debe retornar un promise.
         */
        lazyLoader: '&?'
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-uiselect-input.html',
      controller: ValidatedUiselectInputController
    };
    return directive;
  }

  ValidatedUiselectInputController.$inject = ['$scope', '$timeout', '$filter', '$element'];

  function ValidatedUiselectInputController($scope, $timeout, $filter, $element) {
    var vm = this;
    vm.getChoice = getChoice.bind(this);
    vm.selectListener = selectListener.bind(this);
    vm.getFilter = getFilter.bind(this);
    vm.loadOptions = loadOptions.bind(this);
    vm.handleLazyLoading = handleLazyLoading.bind(this);

    activate();


    function activate() {
      vm.availableOptions = [];
      vm.loadOptions();
      const len = vm.searchTextMinLength ? parseInt(vm.searchTextMinLength) : 0;

      // listener para el text input asociado al ui-select.
      $timeout(() => {
        let input = $element.find('input.ui-select-search');

        $(input).on('keyup', () => {
          const query = $(input).val();

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
        return vm.renderer({ item });
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
      if (!angular.isFunction(this.optionsLoader)) {
        vm.availableOptions = $filter('filter')(vm.options, this.getFilter(query));
        return;
      }
      let rsp = this.optionsLoader({ query });

      if (angular.isFunction(rsp.then)) {
        rsp.then(response => vm.availableOptions = response);
      }
    }

    function handleLazyLoading() {
      if (!angular.isFunction(this.lazyLoader)) {
        return;
      }
      this.lazyLoader().then(response => vm.availableOptions = vm.availableOptions.concat(response));
    }
  }
}());