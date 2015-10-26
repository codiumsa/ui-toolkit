'use strict';

/**
 * @ngdoc directive
 * @name qualita.directive:tdnDatatable
 * @description
 * # tdnDatatable
 */
angular.module('qualitaCoreFrontend')
  .directive('tdnDatatable', function ($timeout, $modal, $compile, $state, $resource, AuthorizationService, DTOptionsBuilder, DTColumnBuilder, DTInstances, baseurl) {
    
    var hasPermission = AuthorizationService.hasPermission;
    
    return {
      template: '<div>' +
          '<h2>{{options.title}}<button type="button" ng-show="canCreate()" style="margin-left:10px;" class="btn btn-default glyphicon glyphicon-plus-sign" ng-click="new()"></button></h2>' +
          '<hr>' +
          '<div class="table-responsive">' +
            '<table datatable="" dt-options="dtOptions" dt-columns="dtColumns" dt-instance="dtInstanceCallback" width=100% class="table table-striped no-footer">' +
                '<tfoot>' +
                    '<tr>' +
                    '</tr>' +
                '</tfoot>' +
            '</table>' +
          '</div>' + 
          '<div ng-if="selected">' +
              '<h3>Detalles</h3>' +
              '<table class="table table-striped table-bordered table-detail">' +
                  '<tbody>' +
                      '<tr ng-repeat="row in options.detailRows">' +
                          '<td ng-if="selected[row.data]" class="row-title">{{row.title}}</td>' +
                          '<td ng-if="selected[row.data] && row.renderWith">{{row.renderWith(selected[row.data])}}</td>' +
                          '<td ng-if="selected[row.data] && !row.renderWith">{{selected[row.data]}}</td>' +
                      '</tr>' +
                  '</tbody>' +
              '</table>' +
          '</div>' + 
      '</div>',
      restrict: 'AE',
      replace: true,
      scope: {
        options: '='
      },
      controller: function controller($scope, $element) {
        var actionsColumn, selectionColumn, urlTemplate = _.template(baseurl.getBaseUrl() + '/<%= resource %>/datatables?');

        //$scope.selection = {};
        $scope.selectAll = false;
        //$scope.toggleAll = toggleAll;
        //$scope.toggleOne = toggleOne;
        var titleHtml = '<label class="checkbox-inline">' +
                '<input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, $scope.options.selection)">' +
              '</label>';

        var ajaxRequest = function(data, callback) {
          var xhr = $resource(urlTemplate($scope.options) + $.param(data), {}, {
            query: {
              isArray: false
            }
          });
          xhr.query().$promise.then(function(response) {
            callback(response);
          });
        };
        var ajaxConfig = ($scope.options.ajax) ? $scope.options.ajax : ajaxRequest;
        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withOption('ajax', ajaxConfig)
          .withDataProp('data')
          .withOption('processing', true)
          .withOption('serverSide', true)
          .withOption('order', [[ $scope.options.defaultOrderColumn, $scope.options.defaultOrderDir ]])
          .withOption('language', {
                  'sProcessing' : 'Procesando...',
                  'sLengthMenu' : 'Mostrar _MENU_ registros',
                  'sZeroRecords' : 'No se encontraron resultados',
                  'sEmptyTable' : 'Ningún dato disponible en esta tabla',
                  'sInfo' : 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
                  'sInfoEmpty' : 'Mostrando registros del 0 al 0 de un total de 0 registros',
                  'sInfoFiltered' : '(filtrado de un total de _MAX_ registros)',
                  'sInfoPostFix' : '.',
                  'sSearch' : 'Buscar:',
                  'sInfoThousands' : ',',
                  'sLoadingRecords' : 'Cargando...',
                  'oPaginate' : {
                    'sFirst' : 'Primero',
                    'sLast' : 'Último',
                    'sNext' : 'Siguiente',
                    'sPrevious' : 'Anterior'
                  },
                  'oAria' : {
                    'sSortAscending' : ': Activar para ordenar la columna de manera ascendente',
                    'sSortDescending' : ': Activar para ordenar la columna de manera descendente'
                  }
                })
          .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withPaginationType('full_numbers')
          .withBootstrap();

        if($scope.options.detailRows){
          $scope.dtOptions = $scope.dtOptions.withOption('rowCallback', rowCallback);

        }

        $scope.visibleColumns = $scope.options.columns.length;

        $scope.dtColumns = _.map($scope.options.columns, function(c){
          var column = DTColumnBuilder.newColumn(c.data);
          var commonAttrs = ['data', 'title', 'class', 'renderWith', 'visible', 'sortable']
          if(c.title) column = column.withTitle(c.title);
          if(c.class) column = column.withClass(c.class);
          if(c.renderWith) column = column.renderWith(c.renderWith);
          if(c.visible === false) {
            column = column.notVisible();
            $scope.visibleColumns -= 1;
          }
          if(c.sortable === false) column = column.notSortable();
          _.forOwn(c, function(value, key){
            if(!_.contains(commonAttrs, key)){
              column = column.withOption(key, value);
            }
          });
          return column;
        });

        actionsColumn = DTColumnBuilder.newColumn(null).withTitle('Operaciones').notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var basicOpts = '<button class="btn btn-success btn-dt" style="margin-right: 5px;" ng-show="canEdit()" ng-click="edit(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-pencil"></span>' +
                  '</button>' +
                  '<button class="btn btn-danger btn-dt" style="margin-right: 5px;" ng-show="canRemove()" ng-click="remove(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-trash"></span>' +
                  '</button>' +
                  '<button class="btn btn-success btn-dt" style="margin-right: 5px;" ng-show="canDownload()" ng-click="download(' + data.id + ',\'' + data.file + '\')">' +
                  '   <span class="glyphicon glyphicon-download-alt"></span>' +
                  '</button>';
            if($scope.options.extraMenuOptions) {
              _.forEach($scope.options.extraMenuOptions, function(menuOpt) {
                var compilado = _.template(menuOpt.templateToRender);
                $scope[menuOpt.functionName] = menuOpt.functionDef;
                basicOpts = basicOpts + compilado({'dataId': data.id, '$state': $state, '$scope': $scope});
              });
            }
            return basicOpts;
          });

        selectionColumn = DTColumnBuilder.newColumn(null).withTitle('').notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var checkbox = '<label class="checkbox-inline">' +
                '<input type="checkbox" ng-model="$scope.options.selection[' + data.id + ']" ng-click="toggleOne($scope.options.selection)">' +
              '</label>';
              return checkbox;
          });

        $scope.canEdit = function() {
          return hasPermission('update_' + $scope.options.resource);        
        };
        
        $scope.canRemove = function() {
          return hasPermission('delete_' + $scope.options.resource);        
        };
        
        $scope.canCreate = function() {
          return hasPermission('create_' + $scope.options.resource);        
        };

        $scope.canDownload = function() {
          return hasPermission('upload_' + $scope.options.resource);        
        };

        if($scope.options.hasOptions) {
          $scope.dtColumns.push(actionsColumn);
          $scope.visibleColumns += 1;
        }

        if($scope.options.isSelectable) {
          $scope.dtColumns.push(selectionColumn);
          $scope.visibleColumns += 1;
        }

        $scope.new = function(){
          var pathTemplate = _.template('app.<%= resource %>.new');
          $state.go(pathTemplate($scope.options));
        }

        $scope.edit = function(itemId){
          var pathTemplate = _.template('app.<%= resource %>.edit');
          //var params = _.extend($scope.options, {itemId: itemId});
          $state.go(pathTemplate($scope.options), {id: itemId});
          //$location.path(pathTemplate(params));
        }

        $scope.tooggleAll = function (selectAll, selectedItems) {
            console.log('tooggleAll');
            console.log(selectedItems);
            for (var id in selectedItems) {
                if (selectedItems.hasOwnProperty(id)) {
                    selectedItems[id] = selectAll;
                }
            }
            $scope.options.selection = selectedItems;
        }

        $scope.toggleOne = function (selectedItems) {
            console.log('toggleOne');
            console.log(selectedItems);
            for (var id in selectedItems) {
                if (selectedItems.hasOwnProperty(id)) {
                    if(!selectedItems[id]) {
                        $scope.selectAll = false;
                        return;
                    }
                }
            }
            $scope.selectAll = true;
            $scope.options.selection = selectedItems;
        }

        $scope.dtInstanceCallback = function(dtInstance){
          $('thead+tfoot').remove();
          var tableId = dtInstance.id;
          //console.log($scope.visibleColumns)
          for (var i = 0; i < $scope.visibleColumns; i++) {
            $('#' + tableId + ' tfoot tr').append('<th></th>');
          }

          // Setup - add a text input to each footer cell
          $('#' + tableId + ' tfoot th').not(':last').each(
            function() {
              var title = $('#' + tableId + ' thead th').eq($(this).index()).text();
              $(this).html(
                  '<input id="' + title + '" class="column-filter form-control input-sm" type="text" style="min-width:60px; width: 100%;" />');
          });

          $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');
          var table = dtInstance.DataTable;


          table.columns().eq(0).each(
            function(colIdx) {
              $('tfoot input:eq(' + colIdx.toString() + ')').on('keyup change',
                  function(e) {
                      var realIndex;
                      var that = this;
                      _.each($scope.dtColumns, function(object, index) {
                          if (object.sTitle == that.id) {
                              realIndex = index;
                          }
                      });
                      var index = realIndex || colIdx;
                      if(this.value.length >= 1 || e.keyCode == 13){
                        table.column(index).search(this.value).draw();
                      }
                      // Ensure we clear the search if they backspace far enough
                      if(this.value == "") {
                          table.column(index).search("").draw();
                      }
                  });
          });

          _.each($scope.dtColumns, function(col, index) {
              if(col.filter) {
                var a = $('.input-sm')[index + 1]; // data: estado
                a.value = col.filter;
              }
          });

          //$('.input-sm').keyup();

          /* Esto se hace por un bug en Angular Datatables,
          al actualizar hay que revisar */
          $scope.dtOptions.reloadData = function(){
            $('#' + tableId).DataTable().ajax.reload();
          }

        }

        $scope.remove = function(itemId) {
          $scope.selectedItemId = itemId;
          $scope.tituloModal = "Confirmación de Borrado";
          $scope.mensajeModal = "Esta operación eliminará el registro seleccionado. ¿Desea continuar?";
          var modalInstance = $modal.open({
            template: '<div class="modal-header">' +
                '<h3 class="modal-title">{{::tituloModal}}</h3>' +
            '</div>' +
            '<div class="modal-body">{{::mensajeModal}}</div>' +
            '<div class="modal-footer">' +
                '<button class="btn btn-primary" ng-click="ok(selectedItemId)">Aceptar</button>' +
                '<button class="btn btn-warning" ng-click="cancel()">Cancelar</button>' +
            '</div>',
            scope: $scope
          });

          $scope.cancel = function() {
            modalInstance.dismiss('cancel');
          }

          $scope.ok = function(itemId) {
            var model = $scope.options.factory.create({id: itemId});
            $scope.options.factory.remove(model).then(function() {
              $scope.dtOptions.reloadData();
              modalInstance.close(itemId);
            });
          }
        };

        $scope.download = function(itemId, filename){
          $scope.options.factory.download({id: itemId, file : filename});
        };

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
          $('td', nRow).unbind('click');
          $('td', nRow).bind('click', function() {
              $scope.$apply(function() {
                  $scope.selected = aData;
                  $timeout(function(){
                    $(document).scrollTop($('.table-detail').offset().top);
                  });
              });
          });
          return nRow;
        }

        if($scope.options.detailRows){
          if($scope.options.detailRows === true){
            $scope.options.detailRows = $scope.options.columns;
          }else{
            $scope.options.detailRows = _.union($scope.options.columns, $scope.options.detailRows);
          }
        }

      }
    };
  });
