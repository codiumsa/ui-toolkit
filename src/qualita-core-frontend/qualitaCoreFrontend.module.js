(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('qualitaCoreFrontend.config', [])
      .value('qualitaCoreFrontend.config', {
          debug: true
      });

  // Modules
  angular.module('qualitaCoreFrontend.directives', []);
  angular.module('qualitaCoreFrontend.filters', []);
  angular.module('qualitaCoreFrontend.services', []);
  angular.module('qualitaCoreFrontend',
      [
          'qualitaCoreFrontend.config',
          'qualitaCoreFrontend.directives',
          'qualitaCoreFrontend.filters',
          'qualitaCoreFrontend.services',
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
