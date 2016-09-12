(function (angular) {
'use strict';
// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Gulp

// Config
angular.module('ui.config', [])
    .value('ui.config', {
        debug: true
    });

// Modules
angular.module('ui.directives', []);
angular.module('ui.filters', []);
angular.module('ui.services', []);
angular.module('ui',
    [
        'ui.config',
        'ui.directives',
        'ui.filters',
        'ui.services',
        'ngResource',
        'ngCookies',
        'ngSanitize',
        'ngTouch',
        'datatables',
        'datatables.bootstrap',
        'schemaForm',
        'pascalprecht.translate',
        'cgNotify',
        'angular-underscore/filters',
        'flow',
        'ui.bootstrap',
        'ui.select',
        'ui.highlight',
        'ncy-angular-breadcrumb',
        'ui.router',
        'oc.lazyLoad',
        'ngStorage',
        'LocalForageModule',
        'datatables.buttons',
        'datatables.colreorder',
        'daterangepicker',
        'rangepicker',
        'ngWebSocket',
        'pickadate'
    ]);
})(angular);
