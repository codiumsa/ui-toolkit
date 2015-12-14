'use strict';
/**
 * @ngdoc directive
 * @name qualita.directive:tdnDatatable
 * @description
 * # tdnDatatable
 */
angular.module('qualitaCoreFrontend')
  .directive('tdnDatatable', function ($timeout, $modal, $compile, $state, $resource, AuthorizationService, DTOptionsBuilder, DTColumnBuilder, baseurl, $rootScope) {

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
        $scope.customFilters = {};

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
              console.log('Columns order has been changed with: ' + order);
              $scope.realOrder = {};
              _.each($scope.dtColumns, function (value, index) {
                var realIndex;
                _.each(order, function (value, indexCol) {
                  if (value === index)
                    realIndex = indexCol;
                });
                $scope.realOrder[value.sTitle] = realIndex;
              });
          })
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
          if(c.type) {
            var customFilter = { 'filterType': c.type, 'filterUrl' : c.filterUrl };
            $scope.customFilters[c.title] = customFilter;
          }
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
                  '</button>';
            if($scope.options.extraRowOptions) {
              _.forEach($scope.options.extraRowOptions, function(menuOpt) {
                var compilado = _.template(menuOpt.templateToRender);
                $scope[menuOpt.functionName] = menuOpt.functionDef;
                basicOpts = basicOpts + compilado({'dataCustom': data[menuOpt.customAttribute] ,'dataId': data.id, '$state': $state, '$scope': $scope});
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
            $scope.options.selection = selectedItems;
        }

        var table;
        var tableId;

        $scope.dtInstanceCallback = function(dtInstance){
          $('thead+tfoot').remove();
          tableId = dtInstance.id;
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

          var createCustomFilters = function (tableId, exceptFirst, exceptLast) {
            $('#' + tableId + ' tfoot th').not(exceptFirst).not(exceptLast).each(
            function() {
              var title = $('#' + tableId + ' thead th').eq($(this).index()).text();
              var customFilter = $scope.customFilters[title];
              if (customFilter) {
                if (customFilter.filterType === 'combo') {

                  $(this).html('<div id="' + title + '" name="' + title + '" class="filtro-ancho"></div>');

                  var formatSelection = function(text) {
                    return text.descripcion;
                  };

                  var formatResult = function(text) {
                    if (text.descripcion === "")
                      return '<div class="select2-user-result">Todos</div>';
                    return '<div class="select2-user-result">' + text.descripcion + '</div>';
                  };

                  $('#' + title).select2({
                    minimumResultsForSearch: -1,
                    //allowClear: true,
                    id: function(text){ return text.codigo; },
                    data: function () {
                      return $http({
                          url: baseurl.getBaseUrl() + customFilter.filterUrl,
                          method: "GET"
                       });
                    },
                    ajax: {
                        url: baseurl.getBaseUrl() + "/" + customFilter.filterUrl,
                        dataType: 'json',
                        quietMillis: 250,
                        params: { headers: { "Authorization": $rootScope.AuthParams.accessToken } },
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                            return {
                                q: term
                            };
                        },
                        results: function (data, page) { // parse the results into the format expected by Select2.
                            // since we are using custom formatting functions we do not need to alter the remote JSON data
                            return { results: data };
                        },
                        cache: true
                    },

                    initSelection: function(element, callback) {
                        var id = $(element).val();
                        $.ajax(baseurl.getBaseUrl() + "/" + customFilter.filterUrl, {
                                dataType: "json",
                                beforeSend: function(xhr){
                                  xhr.setRequestHeader("Authorization", $rootScope.AuthParams.accessToken);
                                }
                            }).done(function(data) {
                              callback(data);
                            });
                    },
                    formatResult: formatResult, // omitted for brevity, see the source of this page
                    formatSelection: formatSelection,  // omitted for brevity, see the source of this page
                    //dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                    escapeMarkup: function (m) { return m; }
                  })
                  .on('change', function(e) {
                    var value = $('#' + title).select2('val');
                    if (value.length > 0) {
                      table.column(':contains('+title+')').search(value).draw();
                    } else {
                      table.column(':contains('+title+')').search('').draw();
                    }
                  });
                }
              } else {
                $(this).html(
                  '<input id="' + title + '" class="column-filter form-control input-sm" type="text" placeholder="' + title + '" style="min-width:60px; width: 100%;" />');
              }
            });
            $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');
              table = dtInstance.DataTable;

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
          }

          createCustomFilters(tableId, exceptFirst, exceptLast);

          _.each($scope.dtColumns, function(col, index) {
              if(col.filter) {
                var a = $('.input-sm')[index + 1]; // data: estado
                a.value = col.filter;
              }
          });

          //$('.input-sm').keyup();
          $(".dt-button.buttons-collection.buttons-colvis").text('Columnas');

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

            //llamada a la funcion general de creacion de filtros
            createCustomFilters(tableId, exceptFirst, exceptLast);

          })

          $scope.dtInstance = dtInstance;

          // obtiene los filtros actuales
          $scope.options.getFilters = function getFilters () {
            var oTable = $('#' + tableId).dataTable();
            var oParams = oTable.oApi._fnAjaxParameters(oTable.fnSettings());
            var res = $.param(oParams).split('data');
            var filters = {};
            _.each(res, function(value, index) {
              if (value.indexOf("draw") === -1) {
                var column = value.substring(value.indexOf("=") + 1, value.indexOf("&"));
                var search = value.substring(value.indexOf("=", value.indexOf("value")) + 1, value.indexOf("&", value.indexOf("value")));
                if (column !== undefined && search !== undefined && column != "" && search !== "") {
                  filters[column] = search;
                }
              }

            });
            return filters;
          }
        }

        $scope.remove = function(itemId) {
          $scope.selectedItemId = itemId;
          $scope.tituloModal = "Confirmación de Borrado";
          $scope.mensajeModal = "Esta operación eliminará el registro seleccionado. ¿Desea continuar?";
          $scope.modalInstanceBorrar1 = $modal.open({
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
            $scope.modalInstanceBorrar1.dismiss('cancel');
          }

          $scope.ok = function(itemId) {
            var model = $scope.options.factory.create({id: itemId});
            $scope.options.factory.remove(model).then(function() {
              $scope.dtOptions.reloadData();
              $scope.modalInstanceBorrar1.close(itemId);
            }, function(error) {
              $scope.modalInstanceBorrar1.dismiss('cancel');
              $scope.tituloModal = "No se pudo borrar el usuario";
              $scope.mensajeModal = $scope.options.failedDeleteError;
              var modalInstance = $modal.open({
                template: '<div class="modal-header">' +
                '<h3 class="modal-title">{{::tituloModal}}</h3>' +
                '</div>' +
                '<div class="modal-body">{{::mensajeModal}}</div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-primary" ng-click="cancel()">Aceptar</button>' +
                '</div>',
                scope: $scope
              });
              $scope.cancel = function() {
                modalInstance.dismiss('cancel');
              };
              console.log("error al borrar: ");
              console.log(error);
            });
          }
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
