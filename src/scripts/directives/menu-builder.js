(function() {
'use strict';

/**
 * @ngdoc directive
 * @name ui.directive:menuBuilder
 * @description
 * # menuBuilder
 */
angular.module('ui')
  .directive('menuBuilder', ['$timeout', function ($timeout) {
    return {
      templateUrl: 'views/menu-builder.html',
      restrict: 'EA',
      replace: true,
      scope: { options: '=', menu: '=', save: '=' },
      link: function postLink(scope, element, attrs) {
        //scope.menu = {};
        var setLeafs = function(nodes) {
          _.each(nodes, function(n) {
            n.data = { estado: n.estado };
            if(n.children) setLeafs(n.children);
            else n.type = 'leaf';
          }); 
          return nodes;
        };

        function drawJSTree(treeData) {
          $('#menu-builder').jstree({
            'core' : {
              'animation' : 0,
              'check_callback': function(operation, node, parent, position)
              { 
                switch (operation) {
                    case 'move_node':
                      return !parent.parent || parent.original.type !== 'leaf';
                    case 'create_node':
                      return parent.original.type !== 'leaf';
                    case 'rename_node':
                      return node.original.type !== 'leaf';
                    case 'delete_node':
                      return _.isEmpty(node.children) && node.original.type !== 'leaf';
                }
                return false;
              },
              'themes' : { 'stripes' : true },
              'data' : setLeafs(treeData)
            },
            'types' : {
              'default' : {
                'icon' : 'glyphicon glyphicon-record'
              },
              'leaf' : {
                'icon' : 'glyphicon glyphicon-asterisk'
              }
            },
            'plugins' : [
              'dnd', 'search',
              'state', 'types', 'wholerow'
            ]
          });
        }

        function nodeRename() {
          var ref = $('#menu-builder').jstree(true),
            sel = ref.get_selected();
          if(!sel.length) { return false; }
          sel = sel[0];
          //console.log(ref.get_node(sel));
          if(ref.get_node(sel).original.type !== 'leaf') ref.edit(sel);
        }

        $('#menu-builder').delegate("li","dblclick", function(e) {
          nodeRename();
          return false;
        });

        scope.nodeCreate = function() {
          var ref = $('#menu-builder').jstree(true),
              sel = ref.get_selected();
          if(!sel.length) { return false; }
          sel = sel[0];
          sel = ref.create_node(sel);
          if(sel) {
              ref.edit(sel);
          }
        };

        scope.nodeDelete = function() {
          var ref = $('#menu-builder').jstree(true),
              sel = ref.get_selected();
          if(!sel.length) { return false; }
          ref.delete_node(sel);
        };

        scope.getMenu = function() {
          var getMenuNode = function(e) {
            var result = {
              text: e.text,
              estado: e.data.estado
            };

            if(!_.isEmpty(e.children)){
              result.children = _.map(e.children, function(c){
                return getMenuNode(c);
              });
            }

            return result;
          }

          var ref = $('#menu-builder').jstree(true);
          var menu = _.map(ref.get_json(), getMenuNode);
          
          scope.save(menu);
          //scope.menu = menu;
        };

        scope.$watch('menu', function(menu) {
          if(menu) drawJSTree(menu);
        });
      }
    };
  }]);
}());
