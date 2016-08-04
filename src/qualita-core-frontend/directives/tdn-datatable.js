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
      '<div class="widget-header bordered-top bordered-palegreen" ng-if="!options.hideHeader">' +
        '<span class="widget-caption">{{options.title}}</span>' +
        '<div class="widget-buttons">' +
          '<a href="" ng-show="canCreate()" ng-click="new()" title="Nuevo">' +
            '<i class="glyphicon glyphicon-plus"></i>' +
          '</a>' +
          '<a ng-repeat="menuOption in options.extraMenuOptions" href="" ng-show="menuOption.showCondition()" ng-click="menuOption.action()" title="{{menuOption.title}}">' +
            '<p><i class="{{menuOption.icon}}"></i>' +
            '  {{menuOption.data}}&nbsp;&nbsp;&nbsp;</p>' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<div class="widget-body">' +
          '<div class="table-responsive">' +
            '<table datatable="" dt-options="dtOptions" dt-columns="dtColumns" dt-instance="dtInstanceCallback" width=100% class="table table-hover table-responsive table-condensed no-footer">' +
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
        var actionsColumn, selectionColumn, urlTemplate;
        // Se arma la ruta según tenga o no filtros estáticos
        updateStaticFilters();

        $scope.dtInstance = {};
        $scope.selectAll = false;
        $scope.options.selection = {};
        $scope.headerCompiled = false;
        $scope.customFilters = {};

        var rangeSeparator = "~";
        var dateFormat = "DD/MM/YYYY";
        var defaultFilterType = 'string';
        var table;
        var tableId;


        var ajaxRequest = function(data, callback) {

          if (table) {
            $scope.options.tableAjaxParams = table.ajax.params(); 
            
            _.forEach(table.colReorder.order(), function(columnIndex, index) {
              if ($scope.customFilters[columnIndex]) {
                data.columns[index]['type'] = $scope.customFilters[columnIndex].filterType;
              } else {
                data.columns[index]['type'] = defaultFilterType;
              }
            });
          }
          data.rangeSeparator = rangeSeparator;
          //console.log(data);

          var xhr = $resource(urlTemplate($scope.options) + $.param(data), {}, {
            query: {
              isArray: false
            }
          });

          xhr.query().$promise.then(function(response) {
            //console.log("respuesta obtenida: ");
            //console.log(response);
            var datos = response.data;
            if(datos) {
              datos.forEach(function(registro) {
                Object.keys(registro).forEach(function(key) {
                  if(registro[key] === true) {
                    registro[key] = "Sí";
                  } else if(registro[key] === false) {
                    registro[key] = "No";
                  }
                });
              });
            }
            callback(response);
          }).catch(function(response) {
            console.log(response);
            console.log("error");
          });
        };
        var ajaxConfig = ($scope.options.ajax) ? $scope.options.ajax : ajaxRequest;

        //modelos de los filtros de rangos de fechas
        $scope.dateRangeFilters = {
          'i': {
            startDate: null,
            endDate: null
          }
        };

        //callback para el boton apply en el widget de rango de fechas
        var datePickerApplyEvent = function(ev, picker) {
          var ini = ev.model.startDate.format(dateFormat);
          var end = ev.model.endDate.format(dateFormat);

          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search(ini + rangeSeparator + end).draw();
        }

        //callback para el boton cancel en el widget de rango de fechas, que borra el filtro
        var datePickerCancelEvent = function(ev, picker) {
          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search("").draw();
          $("#daterange_" + ev.opts.index ).val("");
          $scope.dateRangeFilters[ev.opts.index].startDate = null;
          $scope.dateRangeFilters[ev.opts.index].endDate = null;
        }

        //callback para borrar el rango previamente seleccionado
        var datePickerShowEvent = function(ev, picker) {

          if ($scope.dateRangeFilters[ev.opts.index].startDate === null) {
            var widgetIndex = $scope.dateRangePickerWidgetsOrder.indexOf(ev.opts.index);
            var widget = $($(".daterangepicker").get(widgetIndex));
            widget.parent().find('.in-range').removeClass("in-range");
            widget.parent().find('.active').removeClass("active");
            widget.parent().find('.input-mini').removeClass("active").val("");
          }
        }

        moment.locale('es');
        var dateRangeLocaleOptions = {
          cancelLabel: 'Limpiar',
          applyLabel: 'Aplicar',
          format: dateFormat,
          separator: ' a ',
          weekLabel: 'S',
          daysOfWeek: moment.weekdaysMin(),
          monthNames: moment.monthsShort(),
          firstDay: moment.localeData().firstDayOfWeek()
        };

        $scope.dateRangeOptions = {};

        var dateRangeDefaultOptions = {
          eventHandlers: {
            'apply.daterangepicker' : datePickerApplyEvent,
            'cancel.daterangepicker' : datePickerCancelEvent,
            'show.daterangepicker' : datePickerShowEvent
          },
          opens: "right",
          index: 0,
          showDropdowns: true,
          locale: dateRangeLocaleOptions
        };

        $scope.dateRangePickerWidgetsOrder = [];

        //modelos del filtro de rango numericos
        $scope.numberRangeFilters = {
          'i': {
            startRange: null,
            endRange: null
          }
        };

        //callback para el boton apply en el widget de rango de numeros
        var rangePickerApplyEvent = function(ev, picker) {
          //console.log("apply");
          var ini = ev.model.startRange;
          var end = ev.model.endRange;

          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search(ini + rangeSeparator + end).draw();
        }

        //callback para el boton cancel en el widget de rango de numeros, que borra el filtro
        var rangePickerCancelEvent = function(ev, picker) {
          //console.log("cancel");
          var index = table.colReorder.order().indexOf(ev.opts.index);
          table.column(index).search("").draw();
          $("#numberrange_" + ev.opts.index ).val("");
          $scope.numberRangeFilters[ev.opts.index].startRange = null;
          $scope.numberRangeFilters[ev.opts.index].endRange = null;

          var widgetIndex = $scope.rangePickerWidgetsOrder.indexOf(ev.opts.index);
          var widget = $($(".rangepicker").get(widgetIndex));
            widget.parent().find('input[name=rangepicker_start]').val();
            widget.parent().find('input[name=rangepicker_end]').val();
        };

        var rangeLocaleOptions = {
          cancelLabel: 'Limpiar',
          applyLabel: 'Aplicar',
          separator: ' a '
        };

        $scope.rangeOptions = {};

        var rangeDefaultOptions = {
          eventHandlers: {
            'apply.rangepicker' : rangePickerApplyEvent,
            'cancel.rangepicker' : rangePickerCancelEvent
          },
          opens: "right",
          index: 0,
          showDropdowns: true,
          locale: rangeLocaleOptions
        };

        $scope.rangePickerWidgetsOrder = [];

        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withOption('ajax', ajaxConfig)
          .withDataProp('data')
          .withOption('processing', true)
          .withOption('serverSide', true)
          //.withOption('order', [[$scope.options.defaultOrderColumn, $scope.options.defaultOrderDir]])
          //.withOption('order', [])
          .withOption('language', {
                  'sProcessing' : 'Procesando...',
                  'sLengthMenu' : 'Registros _MENU_',
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
          .withBootstrap();

        if($scope.options.detailRows){
          $scope.dtOptions = $scope.dtOptions.withOption('rowCallback', rowCallback);
        }

        //inicializan la cantidad de columnas visibles
        $scope.visibleColumns = 0;//$scope.options.columns.length;

        $scope.dtColumns = [];
        //indices
        $scope.defaultColumnOrderIndices = [];
        $scope.originalIndexKey = {};

        //si tiene checkboxes para seleccion
        var indexPadding = 0;
        if($scope.options.isSelectable) {

          var titleHtml = '<label><input type="checkbox" ng-model="selectAll" ng-click="toggleAll()"><span class="text"></span></label>';

          selectionColumn = DTColumnBuilder.newColumn(null).withTitle(titleHtml).notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var checkbox = '<label>' +
                '<input id="' + data.id + '" type="checkbox" ng-model="options.selection[' + data.id + ']" ng-click="toggleOne()">' +
              '<span class="text"></span></label>';
              return checkbox;
          })
          .withOption('name', 'checkbox');

          $scope.dtColumns.push(selectionColumn);
          $scope.visibleColumns += 1;
          indexPadding = 1;
          $scope.originalIndexKey[0] = null;//'checkbox';
          $scope.defaultColumnOrderIndices.push(0);
          $scope.dtOptions.withColReorderOption('iFixedColumnsLeft', 1);
        }

        /* RENDERS BASICOS */
        var dateRender =  function(dateFormat) {
          return function(data) {
            return moment.utc(data).format(dateFormat);  
          }
        };

        var emptyRender =  function(data) {
          if (data == undefined) return "";
          else return data;
        };

        var numberRender =  function(data) {
          if (data) return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          else return '';
        };

        var monedaRender =  function(pathAtt) {
          return function(data, type, row) {
            if (data) {
              var moneda = "Gs. ";
              if (row[pathAtt]==='dolares') {
                moneda = "Usd. ";
                data = parseFloat(data).toFixed(2);
              } else if(row[pathAtt]==='pesos') {
                moneda = "Pes. ";
                data = parseFloat(data).toFixed(2);
              } else if (row[pathAtt]==='real') {
                moneda = "Rel. ";
                data = parseFloat(data).toFixed(2);
              } else if (row[pathAtt]==='euro') {
                moneda = "Eur. ";
                data = parseFloat(data).toFixed(2);
              }
              return moneda + data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else return "";
          }
        };

        var commonAttrs = ['data', 'title', 'class', 'renderWith', 'visible', 'sortable', 'searchable'];
        _.map($scope.options.columns, function(c, index){

          var column = DTColumnBuilder.newColumn(c.data);
          //el indice original para la columna
          var originalIndex = indexPadding + index
          $scope.originalIndexKey[originalIndex] = c.data;

          if(c.title) column = column.withTitle(c.title);
          if(c.class) column = column.withClass(c.class);
          if(c.renderWith) {
            if(c.renderWith === 'dateRender')
              column = column.renderWith(dateRender(c.dateFormat));
            else if (c.renderWith === 'emptyRender')
              column = column.renderWith(emptyRender);
            else if (c.renderWith === 'numberRender')
              column = column.renderWith(numberRender);
            else if (c.renderWith === 'monedaRender')
              column = column.renderWith(monedaRender(c.pathAttMoneda));
            else
              column = column.renderWith(c.renderWith);
          } 
          if(c.sortable === false) column = column.notSortable();

          //si hay un orden definido y no está dentro de ese orden o si especifica que no es visible
          if(!_.contains($scope.options.defaultColumnOrder, c.data) || c.visible === false) column = column.notVisible();
          else $scope.visibleColumns += 1;

          _.forOwn(c, function(value, key){
            if(!_.contains(commonAttrs, key)) column = column.withOption(key, value);
          });

          if(c.searchable === false) {
            column = column.withOption('bSearchable', false);
          } else {
            column = column.withOption('bSearchable', true);
          }

          if(c.type) {
            var customFilter = {'filterType': c.type, 'filterUrl' : c.filterUrl};

            if (c.type === 'date-range') {
              $scope.dateRangeFilters[originalIndex] = {startDate: null, endDate: null};
            } else if (c.type === 'number-range') {
              $scope.numberRangeFilters[originalIndex] = {startRange: null, endRange: null};
            }

            $scope.customFilters[originalIndex] = customFilter;
          }
          $scope.dtColumns.push(column);
        });

        //console.log($scope.dtColumns);
        if($scope.options.hasOptions) {
          $scope.originalIndexKey[$scope.visibleColumns] = null;//'actions';
          // Fix last right column
          $scope.dtOptions.withColReorderOption('iFixedColumnsRight', 1);
          $scope.visibleColumns += 1;
        }

        //columnas reordenables, por defecto habilitado
        if ($scope.options.colReorder === true || $scope.options.colReorder === undefined) {
          $scope.dtOptions.withColReorder();
        }

        // Se establece el orden por defecto
        //$scope.dtOptions.withColReorderOrder($scope.defaultColumnOrderIndices);

        actionsColumn = DTColumnBuilder.newColumn(null).withTitle('Operaciones').notSortable()
          .withOption('searchable', false)
          .renderWith(function(data, type, full, meta) {
              var basicOpts = '<button class="btn-row-datatable btn btn-success btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canEdit(' + data.id + ')}" ng-click="edit(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-pencil"></span>' +
                  '</button>' +
                  '<button class="btn-row-datatable btn btn-danger btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canRemove(' + data.id + ')}" ng-click="remove(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-trash"></span>' +
                  '</button>' +
                  '<button class="btn-row-datatable btn btn-info btn-dt" style="margin-right: 5px;" ng-class="{ hidden : !canList(' + data.id + ')}" ng-click="view(' + data.id + ')">' +
                  '   <span class="glyphicon glyphicon-eye-open"></span>' +
                  '</button>';
            if($scope.options.extraRowOptions) {
              _.forEach($scope.options.extraRowOptions, function(menuOpt) {
                var compilado = _.template(menuOpt.templateToRender);
                $scope[menuOpt.functionName] = menuOpt.functionDef;
                basicOpts = basicOpts + compilado({'dataCustom': JSON.stringify(data[menuOpt.customAttribute]) ,'dataId': data.id, '$state': $state, '$scope': $scope});
                $scope[menuOpt.conditionName] = menuOpt.conditionDef;
              });
            }
            return basicOpts;
          });


        $scope.canEdit = function(data) {
          var permission = hasPermission('update_' + $scope.options.resource);
          if($scope.options.extraEditConditions) {
            var valor = _.find(table.rows().data(), function(value) {
              return value.id == data;
            });
            return permission && $scope.options.extraEditConditions(valor) && !$scope.options.hideEditMenu;
          }
          return permission && !$scope.options.hideEditMenu;
        };

        $scope.canRemove = function(data) {
          var permission = hasPermission('delete_' + $scope.options.resource);
          if($scope.options.extraRemoveConditions) {
            var valor = _.find(table.rows().data(), function(value) {
              return value.id == data;
            });
            return permission && $scope.options.extraRemoveConditions(valor) && !$scope.options.hideRemoveMenu;
          }
          return permission && !$scope.options.hideRemoveMenu;
        };
 
        $scope.canCreate = function() {
          var permission = hasPermission('create_' + $scope.options.resource);
          return permission && ! $scope.options.hideAddMenu;
        };

        $scope.canList = function(data) {
          var permission = hasPermission('index_' + $scope.options.resource);
          if($scope.options.extraViewConditions) {
            var valor = _.find(table.rows().data(), function(value) {
              return value.id == data;
            });
            return permission && $scope.options.extraViewConditions(valor) && !$scope.options.hideViewMenu;
          }
          return permission && ! $scope.options.hideViewMenu;
        };

        if($scope.options.hasOptions) {
          $scope.dtColumns.push(actionsColumn);
          $scope.visibleColumns += 1;
        }

        $scope.new = function(){
          var pathTemplate;
          if(!$scope.options.customResource)
            pathTemplate = _.template('app.<%= resource %>.new');
          else
            pathTemplate = _.template('app.<%= customResource %>.new');
          $state.go(pathTemplate($scope.options), {});
        }

        $scope.edit = function(itemId){
          var pathTemplate;
          if(!$scope.options.customResource)
            pathTemplate = _.template('app.<%= resource %>.edit');
          else
            pathTemplate = _.template('app.<%= customResource %>.edit');
          $state.go(pathTemplate($scope.options), {id: itemId});
        }

        $scope.view = function(itemId) {
          var pathTemplate;
          if(!$scope.options.customResource)
            pathTemplate = _.template('app.<%= resource %>.view');
          else
            pathTemplate = _.template('app.<%= customResource %>.view');
          $state.go(pathTemplate($scope.options), {id: itemId});
        }

        $scope.toggleAll = function () {
            if ($scope.selectAll) {         //If true then select visible
                _.each(table.rows().data(), function (value, index) {
                    $scope.options.selection[value.id] = true;
                });
            } else {
              _.each(table.rows().data(), function (value, index) {
                  $scope.options.selection[value.id] = false;
              });
            }

        }

        $scope.toggleOne = function () {
            var notSelectAll = _.some(table.rows().data(), function (value, index) {
              return !$scope.options.selection[value.id];
            });
            $scope.selectAll = !notSelectAll;
        }

        //funciones para el select2
        var formatSelection = function(text) {
          return text.descripcion;
        };

        var formatResult = function(text) {
          if (text.descripcion === "")
            return '<div class="select2-user-result">Todos</div>';
          return '<div class="select2-user-result">' + text.descripcion + '</div>';
        };


        //funcion para crear los filtros
        var createFilters = function() {
          $('#' + tableId + ' tfoot tr').empty();
          $scope.dateRangePickerWidgetsOrder = [];
          $(".daterangepicker").remove();
          $scope.options.currentColumnOrder = [];

          
          _.forEach(table.context[0].aoColumns, function (column) {
            var realIndex = column._ColReorder_iOrigCol;
            var data = column.mData;
            var html = '<th></th>';

            if (column.bVisible) {
              if (data) {
                $scope.options.currentColumnOrder.push(data);
              }
              
              var title = column.name;
              if (!name) {
                title = column.sTitle;
              }

              var customFilter = $scope.customFilters[realIndex];

              if (customFilter) {
                if (customFilter.filterType === 'combo') {
                  var id = 'combo_' + realIndex;

                  html = '<th><div id="' + id + '" name="' + title + '" class="filtro-ancho"></div></th>';
                  $('#' + tableId + ' tfoot tr').append(html);
                  html = '';

                  $('#' + id).select2({
                    minimumResultsForSearch: -1,
                    //allowClear: true,
                    id: function (text) {
                      return text.descripcion;
                    },
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
                      params: {headers: {"Authorization": $rootScope.AuthParams.accessToken}},
                      data: function (term, page) { // page is the one-based page number tracked by Select2
                        return {
                          q: term
                        };
                      },
                      results: function (data, page) { // parse the results into the format expected by Select2.
                        // since we are using custom formatting functions we do not need to alter the remote JSON data
                        return {results: data};
                      },
                      cache: true
                    },

                    initSelection: function (element, callback) {
                      //var id = $(element).val();
                      var value = table.column(column.idx).search();
                      $.ajax(baseurl.getBaseUrl() + "/" + customFilter.filterUrl, {
                        dataType: "json",
                        beforeSend: function (xhr) {
                          xhr.setRequestHeader("Authorization", $rootScope.AuthParams.accessToken);
                        }
                      }).done(function (data) {
                        callback(data);
                      });
                    },
                    formatResult: formatResult, // omitted for brevity, see the source of this page
                    formatSelection: formatSelection,  // omitted for brevity, see the source of this page
                    //dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                    escapeMarkup: function (m) {
                      return m;
                    }
                  })
                    .on('change', function (e) {
                      var value = $('#' + id).select2('val');

                      //los ids de los inputs tiene la forma "combo_[realIndex]"
                      var realIndex = parseInt(id.substring(6));
                      var index = table.colReorder.order().indexOf(realIndex);

                      //console.log(this.value);
                      if (this.value.length >= 1) {
                        table.column(index).search(this.value).draw();
                      } else {
                        table.column(index).search("").draw();
                      }
                    });
                }  else if (customFilter.filterType === 'date-range') {
                  $scope.dateRangeOptions[realIndex] = _.clone(dateRangeDefaultOptions, true);
                  $scope.dateRangeOptions[realIndex].index = realIndex;

                  //si esta despues de la mitad abrir a la izquierda
                  if (realIndex > ($scope.options.columns.length / 2)) {
                     $scope.dateRangeOptions[realIndex].opens = 'left';
                  }

                  //$('body').append('<div id="container-daterange_' + realIndex +'"></div>');
                  //$scope.dateRangeOptions[realIndex]['parentEl'] = "#container-daterange_" + realIndex;
                  $scope.dateRangePickerWidgetsOrder.push[realIndex];
                  var input = '<th><input id="daterange_' + realIndex +
                   '" date-range-picker class="column-filter form-control input-sm date-picker" options="dateRangeOptions[' + realIndex +
                    ']" type="text" ng-model="dateRangeFilters[' + realIndex + ']" /></th>';

                  html = $compile(input)($scope);
                } else if (customFilter.filterType === 'number-range') {
                  $scope.rangeOptions[realIndex] = _.clone(rangeDefaultOptions, true);
                  $scope.rangeOptions[realIndex].index = realIndex;

                  //si esta despues de la mitad abrir a la izquierda
                  if (realIndex > ($scope.options.columns.length / 2)) {
                     $scope.rangeOptions[realIndex].opens = 'left';
                  }

                  $scope.rangePickerWidgetsOrder.push[realIndex];
                  var input = '<th><input  id="numberrange_' + realIndex +
                   '" range-picker class="column-filter form-control input-sm " options="rangeOptions[' + realIndex +
                    ']" type="text" ng-model="numberRangeFilters[' + realIndex + ']" /></th>';

                  html = $compile(input)($scope);
                }

              } else if (column.mData && column.bSearchable) {
                var value = table.column(column.idx).search();

                html = '<th><input id="filtro_' + realIndex
                + '" class="column-filter form-control input-sm" type="text" style="min-width:60px; width: 100%;" value="' + value
                + '"/></th>';
              } else {
                html = '<th></th>';
              }

              $('#' + tableId + ' tfoot tr').append(html);
              //$('[id="filtro_' + table.colReorder.order()[column] + '"]').val(settings.oAjaxData.columns[column].search.value);            }
            }
            
            $compile($('.btn-row-datatable'))($scope);
          });

          //bind de eventos para filtros
          _.forEach($("[id^='filtro']"), function (el) {
            $(el).on('keyup change',
              function(e) {
                //los ids de los inputs tiene la forma "filtro_[realIndex]"
                var realIndex = parseInt(el.id.substring(7));
                var index = table.colReorder.order().indexOf(realIndex);

                if(this.value.length >= 1 || e.keyCode == 13){
                  table.column(index).search(this.value).draw();
                }

                // Ensure we clear the search if they backspace far enough
                if(this.value == "") {
                  table.column(index).search("").draw();
                }
            });
          });
        };

        /* Funcion de actualizacion de URL Base con o sin filtros estaticos */
        function updateStaticFilters() {
          if ($scope.options.staticFilter) {
            urlTemplate = _.template(baseurl.getBaseUrl() + '/<%= resource %>/datatables?search='
              + encodeURI(JSON.stringify($scope.options.staticFilter.search)) + '&');
          } else {
            urlTemplate = _.template(baseurl.getBaseUrl() + '/<%= resource %>/datatables?');
          }
        }

        $scope.dtInstanceCallback = function(dtInstance){
          $('thead+tfoot').remove();
          tableId = dtInstance.id;
          table = dtInstance.DataTable;

          //creacion de filtros
          $('#' + tableId).append('<tfoot><tr></tr></tfoot>');
          createFilters();
          $('#' + tableId + ' tfoot').insertAfter('#' + tableId + ' thead');

          _.each($scope.dtColumns, function(col, index) {
              if(col.filter) {
                var a = $('.input-sm')[index + 1]; // data: estado
                a.value = col.filter;
              }
          });

          //Texto del boton de visibilidad de columnas
          //$(".dt-buttons").append("<label class='view-columns'>Vistas&nbsp;</label>");
          $(".dt-button.buttons-colvis").removeClass().addClass("columns-selection").html('<i class="glyphicon glyphicon-th-list"></i>');

          /* Esto se hace por un bug en Angular Datatables,
          al actualizar hay que revisar */
          // $scope.dtOptions.reloadData = function(){
          //   $('#' + tableId).DataTable().ajax.reload();
          // }

          /* funcion para actualizar la tabla manualmente */
          $scope.options.reloadData = function(){
            updateStaticFilters();
            $('#' + tableId).DataTable().ajax.reload();
          }

          /* whatcher para actualizar la tabla automaticamente cuando los filtros estaticos cambian */
          $scope.$watch(
              "options.staticFilter",
              function handleStaticFilterChange( newValue, oldValue ) {
                  //console.log( "oldValue", oldValue );
                  //console.log( "newValue", newValue );
                  updateStaticFilters();
                  $('#' + tableId).DataTable().ajax.reload();
              }
          );

          table.on('draw', function() {
            $timeout(function() {
              if (table.rows().data().length > 0) {
                var selectAll = true;
                _.each(table.rows().data(), function (value, index) {

                    if ($scope.options.selection[value.id] === undefined) {
                      $scope.options.selection[value.id] = false;
                      selectAll = false;
                    } else if ($scope.options.selection[value.id] == false) {
                      selectAll = false;
                    }
                  });

                $scope.selectAll = selectAll;
              } else {
                $scope.selectAll = false;
              }
            });
          });

          table.on('column-visibility', function (e, settings, column, state ) {
            //console.log('change column visibility %o', state);
            createFilters();
          });

          table.on('column-reorder', function (e, settings, details ) {
            //console.log('change column visibility %o', state);
            createFilters();
          });

          $scope.dtInstance = dtInstance;

          // obtiene los filtros actuales
          $scope.options.getFilters = function getFilters () {
            var filters = {};
            _.forEach(table.context[0].aoColumns, function (column) {
                  var realIndex = column._ColReorder_iOrigCol;
                  var data = column.mData;
                  if (data !== undefined && data !== "" && data !== null) {
                    //console.log(data);
                    filters[data] = table.column(realIndex).search();
                  }
            });
            return filters;
          }

          if ($scope.options.defaultOrderColumn !== undefined && $scope.options.defaultOrderDir !== undefined) {
            //console.log('order: ' + $scope.options.defaultOrderColumn);
            table.order([[$scope.options.defaultOrderColumn, $scope.options.defaultOrderDir]]);
          }
        }

        $scope.remove = function(itemId) {
          $scope.disableButton = false;
          $scope.selectedItemId = itemId;
          $scope.tituloModal = "Confirmación de Borrado";
          $scope.mensajeModal = "Esta operación eliminará el registro seleccionado. ¿Desea continuar?";
          $scope.modalInstanceBorrar1 = $modal.open({
            template: '<div class="modal-header">' +
                '<h3 class="modal-title">{{::tituloModal}}</h3>' +
            '</div>' +
            '<div class="modal-body">{{::mensajeModal}}</div>' +
            '<div class="modal-footer">' +
                '<button class="btn btn-primary" ng-disabled="disableButton" ng-click="ok(selectedItemId)">Aceptar</button>' +
                '<button class="btn btn-warning" ng-disabled="disableButton" ng-click="cancel()">Cancelar</button>' +
            '</div>',
            scope: $scope
          });

          $scope.cancel = function() {
            $scope.disableButton = true;
            $scope.modalInstanceBorrar1.dismiss('cancel');
          }

          $scope.ok = function(itemId) {
            $scope.disableButton = true;
            var model = $scope.options.factory.create({id: itemId});
            $scope.options.factory.remove(model).then(function() {
              // se refresca la tabla
              $('#' + tableId).DataTable().ajax.reload();
              $scope.modalInstanceBorrar1.close(itemId);
            }, function(error) {
              $scope.modalInstanceBorrar1.dismiss('cancel');
              $scope.tituloModal = "No se pudo borrar el registro";
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
