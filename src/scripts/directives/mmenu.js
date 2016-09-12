(function() {
'use strict';

angular.module('ui')
.directive('mmenu', function() {
    return {
        restrict : 'A',
        link : function(scope, element, attrs) {
            $(element).mmenu({
               "extensions": [
                  "pagedim-black",
                  "effect-listitems-slide",
                  "multiline",
                  "pageshadow"
               ],
               "counters": true,
               "iconPanels": {add:true,
                 hideNavbars: true
               },
               "navbar": {
                 "title": attrs.navbarTitle
               },
               "navbars": [
                  {
                     "position": "top",
                     "content": [
                        "searchfield"
                     ]
                  },
                  true
               ],
               searchfield: {
                  resultsPanel: {
                    title: "Resultados",
                    add: true},
                  placeholder: "Buscar menú",
                  noResults: "Sin coincidencias",
                  
               }
            }, {
             searchfield: {
                clear: true  
             }
          });
        }
    };
});
}());