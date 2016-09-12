(function() {
angular
  .module('ui')
  .directive('advancedDatatablesSearch', advancedDatatablesSearch);

function advancedDatatablesSearch() {
  var directive = {
    restrict: 'E',
    controllerAs: 'vm',
    scope: {
      model: '=',
      options: '=',
      factory: '=',
      disabledBtn: '=',
      multipleSelection: '=?',
      size: '@',
      serializationView: '@',
      style: '@'
    },
    bindToController: true,
    templateUrl: 'views/directives/advanced-datatables-search.html',
    link: linkFunc,
    controller: AdvancedDatatablesSearchController,
  };

  function linkFunc(scope, elem, attr) {
    scope.vm.multipleSelection = angular.isDefined(scope.vm.multipleSelection) ? scope.vm.multipleSelection : false;
  }

  return directive;
}

AdvancedDatatablesSearchController.$inject =  ['$log', '$scope', '$modal', '$state'];
function AdvancedDatatablesSearchController($log, $scope, $modal, $state) {
  var vm = this;
  if(!vm.size) { vm.size = "btn-xs"; }
  vm.valorScope = "hola";
  vm.pick = pick;
  vm.showSearch = showSearch;
  vm.addAll = addAll;
  if(!vm.multipleSelection) {
    vm.options.extraRowOptions = [{
      templateToRender: "<button class='btn btn-primary' style='margin-right: 5px;' ng-click='pick(<%=dataId%>)'> <span class='glyphicon glyphicon-ok'></span> </button>",
      functionName: "pick",
      functionDef: function (itemId) {
        vm.pick(itemId);
      }
    }];
  } else {
    if (vm.multipleSelection) {
      vm.options.isSelectable = true;
      vm.options.selection = {};
      vm.options.extraMenuOptions = [{
        'title': "GSDG",
        'icon': 'glyphicon glyphicon-plus',
        'showCondition': function() {
          return true;
        },
        'action': function() {
          if (vm.isProcesoImportacion){
            $state.go("app.importaciones.proceso.ordenescompra.new");
          }else{
            $state.go("app.orden_compra_importacion.new");
          }
        }
      }];
    }
  }
  vm.options.hideAddMenu = true;
  vm.options.hideEditMenu = true;
  vm.options.hideRemoveMenu = true;
  vm.options.hideHeader = true;

  var createFilters = function (filters) {
    var filtersArr = [];
    _.each(filters, function (search, data) {
      filtersArr.push({path: data, like: search})
    });
    var filters = filterFactory.and(filtersArr).value();
    return filters;
  };

  activate();

  function activate() {
    vm.modalInstance = undefined;
  }

  function pick(item) {
    vm.model = vm.factory.get(item, vm.serializationView);
    
    if(vm.modalInstance) {
      vm.modalInstance.close();
    }
  }

  function showSearch() {
    vm.modalInstance = $modal.open({
      templateUrl: 'views/datatables-modal.html',
      scope: $scope,
      size: 'lg'
    });
  }

  function addAll() {
    //convertimos los datos a un array de indicesSelected
    var indicesSelected = _.filter(_.map(vm.options.selection, function(val, idx) {
        return val == true ? parseInt(idx) : false; }),
      function(val) {  return val; });
    vm.model = _.map(indicesSelected, function(idx) { return vm.factory.get(idx, vm.serializationView); });
    
    if(vm.modalInstance) {
      vm.modalInstance.close();
    }
  }
}
}());
