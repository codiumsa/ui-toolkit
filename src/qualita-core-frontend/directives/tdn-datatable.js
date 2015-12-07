'use strict';
/**
 * @ngdoc directive
 * @name qualita.directive:tdnDatatable
 * @description
 * # tdnDatatable
 */
angular.module('qualitaCoreFrontend')
  .directive('tdnDatatable', function ($timeout, $modal, $compile, $state, $resource, AuthorizationService, DTOptionsBuilder, DTColumnBuilder, baseurl) {

    var hasPermission = AuthorizationService.hasPermission;

    return {
      template: '<div>' +
    '<div class="widget">' +
      '<div class="widget-header">' +
        '<span class="widget-caption">{{options.title}}</span>' +
        '<div class="widget-buttons">' +
          '<a href="#" ng-show="canCreate()" ng-click="new()" title="Nuevo">' +
            '<i class="glyphicon glyphicon-plus"></i>' +
          '</a>' +
          '<a ng-repeat="menuOption in options.extraMenuOptions" href="#" ng-show="menuOption.showCondition()" ng-click="menuOption.action()" title="{{menuOption.title}}">' +
            '<p><i class="{{menuOption.icon}}"></i>' +
            '  {{menuOption.data}}&nbsp;&nbsp;&nbsp;</p>' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<div class="widget-body">' +
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
        '</div>' +
      '</div>',
      restrict: 'AE',
      replace: true,
      scope: {
        options: '='
      },
      controller: function controller($scope, $element) {
        var actionsColumn, selectionColumn, urlTemplate = _.template(baseurl.getBaseUrl() + '/<%= resource %>/datatables?');

        $scope.dtInstance = {};
        $scope.selectAll = false;
        $scope.headerCompiled = false;
        $scope.realOrder = {};

        var ajaxRequest = function(data, callback) {
          console.log(data);
          var xhr = $resource(urlTemplate($scope.options) + $.param(data), {}, {
            query: {
              isArray: false
            }
          });
          xhr.query().$promise.then(function(response) {
            console.log(response);
            callback(response);
          });
        };
        var ajaxConfig = ($scope.options.ajax) ? $scope.options.ajax : ajaxRequest;

        //$scope.options.columns.length
        $scope.dateRangeFilters = {0:{startDate: null, endDate: null}};

        moment.locale('es');
        $scope.dateRangeOptions = {
          eventHandlers: {
            'apply.daterangepicker' :  function(ev, picker) { console.log(ev);}
          },
          opens: "right",
          showDropdowns: true,
          locale: {
            cancelLabel: 'Cancelar',
            applyLabel: 'Aplicar',
            format: 'DD/MM/YYYY',
            separator: ' a ',
            weekLabel: 'S',
            daysOfWeek: moment.weekdaysMin(),
            monthNames: moment.monthsShort(),
            firstDay: moment.localeData().firstDayOfWeek()
          }
        };

        $scope.numberRangeFilters = {};
        

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
          .withOption('headerCallback', function(header) {
            if (!$scope.headerCompiled) {
                // Use this headerCompiled field to only compile header once
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
          })
          .withPaginationType('full_numbers')
          .withButtons(['colvis'])
          .withColReorder()
          // Set order
          //.withColReorderOrder([1, 0, 2])
          // Fix last right column
          //.withColReorderOption('iFixedColumnsLeft', 1)
          .withColReorderCallback(function() {
              var order = this.fnOrder();
              console.log('Columns order has been changed with: ' + order)
              $scope.realOrder = {};
              _.each($scope.dtColumns, function (value, index) {
                $scope.realOrder[value.sTitle] = order[index];
              });
          })
          //.withColumnFilter();
          //   aoColumns: [null, {
          //       type: 'text',
          //   }, {
          //       type: 'select',
          //       bRegex: false,
          //       values: ['Yoda', 'Titi', 'Kyle', 'Bar', 'Whateveryournameis']
          //   }]
          // });
          .withBootstrap();

        if($scope.options.detailRows){
          $scope.dtOptions = $scope.dtOptions.withOption('rowCallback', rowCallback);
        }

        $scope.visibleColumns = $scope.options.columns.length;

        $scope.dtColumns = [];
        var titleHtml = '<label><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll)"><span class="text"></span></label>';

        selectionColumn = DTColumnBuilder.newColumn(null).withTitle(titleHtml).notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var checkbox = '<label>' +
                '<input id="' + data.id + '" type="checkbox" ng-model="$scope.options.selection[' + data.id + ']" ng-click="toggleOne($scope.options.selection)">' +
              '<span class="text"></span></label>';
              return checkbox;
          });

        if($scope.options.isSelectable) {
          $scope.dtColumns.push(selectionColumn);
          $scope.visibleColumns += 1;
          $scope.dtOptions.withColReorderOption('iFixedColumnsLeft', 1);
        }

        if($scope.options.hasOptions) {
          $scope.dtOptions.withColReorderOption('iFixedColumnsRight', 1);
        }

        _.map($scope.options.columns, function(c){
          var column = DTColumnBuilder.newColumn(c.data);
          var commonAttrs = ['data', 'title', 'class', 'renderWith', 'visible', 'sortable', 'type']
          if(c.title) column = column.withTitle(c.title);
          if(c.class) column = column.withClass(c.class);
          if(c.renderWith) column = column.renderWith(c.renderWith);
          if(c.visible === false) {
            column = column.notVisible();
            $scope.visibleColumns -= 1;
          }
          if(c.type) {
            if (c.type === 'date-range') {
              $scope.dateRangeFilters[c.title] = {startDate: null, endDate: null};
            } else if (c.type === 'number-range') {
              $scope.numberRangeFilters[c.title] = {start: null, end: null};
            }
          }
          if(c.sortable === false) column = column.notSortable();
          _.forOwn(c, function(value, key){
            if(!_.contains(commonAttrs, key)){
              column = column.withOption(key, value);
            }
          });
          $scope.dtColumns.push(column);
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
            if($scope.options.extraRowOptions) {
              _.forEach($scope.options.extraRowOptions, function(menuOpt) {
                var compilado = _.template(menuOpt.templateToRender);
                $scope[menuOpt.functionName] = menuOpt.functionDef;
                basicOpts = basicOpts + compilado({'dataId': data.id, '$state': $state, '$scope': $scope});
              });
            }
            return basicOpts;
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

        $scope.toggleAll = function (selectAll) {
            //console.log('toggleAll');
            //$scope.selectAll = true;
            //console.log($scope.selectAll);
            //$scope.selectAll = !$scope.selectAll;
            if (!$scope.selectAll)
              $scope.selectAll = false;
            else
              $scope.selectAll = true;

            if ($scope.selectAll) {         //If true then select visible
                _.each(table.rows().data(), function (value, index) {
                  if (!$scope.options.selection[value.id]) {
                    $("#"+value.id).click();
                  }
                })
            } else {
              _.each($scope.options.selection, function (value, index) {
                if (value) {
                  $("#"+index).click();
                }
              })
            }
        }

        $scope.toggleOne = function (selectedItems) {
            //console.log('toggleOne');
            //console.log(selectedItems);
            for (var id in selectedItems) {
              if (selectedItems.hasOwnProperty(id)) {
                  if(!selectedItems[id]) {
                      $scope.selectAll = false;
                      return;
                  }
              }
            }
            var selectAll = true;
            _.each(table.rows().data(), function (value, index) {
                if (!$scope.options.selection[value.id]) {
                  selectAll = false;
                }
              });
            $scope.selectAll = selectAll;
            //$scope.selectAll = true;
            $scope.options.selection = selectedItems;
        }

        var table;
        var tableId;

        $scope.dtInstanceCallback = function(dtInstance){
          // $('thead+tfoot').remove();
          //console.log('csdfsd');
          tableId = dtInstance.id;
          for (var i = 0; i < $scope.visibleColumns; i++) {
            $('#' + tableId + ' tfoot tr').append('<th></th>');
          }

          //Setup - add a text input to each footer cell
          var exceptFirst;
          var exceptLast;
          if ($scope.options.isSelectable) {
            exceptFirst = ":first"
          }
          else if ($scope.options.hasOptions) {
            exceptLast = ":last"
          }

          //se colocan los filtros
          $('#' + tableId + ' tfoot th').not(exceptFirst).not(exceptLast).each(
            function() {
              var title = $('#' + tableId + ' thead th').eq($(this).index()).text();
              console.log($(this).index());

              var input = '<input id="' + title + '" class="column-filter form-control input-sm" type="text" placeholder="' + title + '" style="min-width:60px; width: 100%;" />';
              if ($scope.dateRangeFilters[title]) {
                input = '<input date-range-picker class="column-filter form-control input-sm date-picker" type="text" ng-model="dateRangeFilters[' + 0 + ']" options="dateRangeOptions"/>';
              }

              $(this).html($compile(input)($scope));
          });

          $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');

          
          table = dtInstance.DataTable;

        
          //table.column(1).search("16").draw();
          //var table2 = dtInstance.dataTable;
          //  table2.yadcf(table,
          // [{ column_number: 0},
          //     { column_number: 1 },
          //     { column_number: 2, data: ["Yes", "No"], filter_default_label: "Select Yes/No" },
          //     { column_number: 3, filter_type: "range_number_slider", filter_container_id: "external_filter_container"}         
          // ]);
          //   table2.columnFilter({
          //     aoColumns: [null, {
          //         type: 'text'
          //     }, {
          //         type: 'date-range',
          //         bRegex: false,
          //         values: ['Yoda', 'Titi', 'Kyle', 'Bar', 'Whateveryournameis']
          //     }, {
          //         type: 'number-range'
          //     }]
          // });

          //bind de eventos para filtros
          table.columns().eq(0).each(
            function(colIdx) {
              $('tfoot input:eq(' + colIdx.toString() + ')').on('keyup change',
                  function(e) {
                      var realIndex;
                      var that = this;
                      _.each($scope.dtColumns, function(object, index) {
                          if ($scope.realOrder[that.id]) {
                            realIndex = $scope.realOrder[that.id];
                          }
                          else if (object.sTitle == that.id) {
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

          table.on('draw', function() {
            $timeout(function() {
              var selectAll = true;
              _.each(table.rows().data(), function (value, index) {
                  if (!$scope.options.selection[value.id]) {
                    selectAll = false;
                  }
                });
              $scope.selectAll = selectAll;
            });
          });

          table.on('column-visibility', function (e, settings, column, state ) {
            console.log('change column visibility %o', state);
            $('tfoot tr').empty();
            tableId = dtInstance.id;
            if (state === false)
              $scope.visibleColumns -= 1;
            else
              $scope.visibleColumns += 1;
            for (var i = 0; i < $scope.visibleColumns; i++) {
              $('#' + tableId + ' tfoot tr').append('<th></th>');
            }
            // Setup - add a text input to each footer cell
            var exceptFirst;
            var exceptLast;
            if ($scope.options.isSelectable) {
              exceptFirst = ":first"
            }
            else if ($scope.options.hasOptions) {
              exceptLast = ":last"
            }

            $('#' + tableId + ' tfoot th').not(exceptFirst).not(exceptLast).each(
              function() {
                var title = $('#' + tableId + ' thead th').eq($(this).index()).text();
                $(this).html(
                    '<input id="' + title + '" class="column-filter form-control input-sm" type="text" placeholder="' + title + '" style="min-width:60px; width: 100%;" />');
            });

            $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');

            table.columns().eq(0).each(
            function(colIdx) {
              $('tfoot input:eq(' + colIdx.toString() + ')').on('keyup change',
                  function(e) {
                      var realIndex;
                      var that = this;
                      _.each($scope.dtColumns, function(object, index) {
                          if ($scope.realOrder[that.id]) {
                            realIndex = $scope.realOrder[that.id];
                          }
                          else if (object.sTitle == that.id) {
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

          })

          $scope.dtInstance = dtInstance;
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