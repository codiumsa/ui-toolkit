(function(angular) {
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
  angular.module('ui', [
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
    'pickadate',
    'ngAnimate',
    'ngMessages',
    'ngResource',
    'angularSpinner',
    'ngTagsInput',
    'angular-ladda',
    'perfect_scrollbar',
    'angular-intro',
    'datatables.colreorder',
    'ngNotify',
    'ngclipboard',
    'infinite-scroll'
  ]);

  angular.module('ui').config(['$provide', function($provide) {

    $provide.decorator('uibYearpickerDirective', ['$delegate', function($delegate) {
      var directive = $delegate[0];
      directive.templateUrl = 'views/datepicker/year.html';
      return $delegate;
    }]);

    $provide.decorator('uibMonthpickerDirective', ['$delegate', function($delegate) {
      var directive = $delegate[0];
      directive.templateUrl = 'views/datepicker/month.html';
      return $delegate;
    }]);

    $provide.decorator('uibDaypickerDirective', ['$delegate', function($delegate) {
      var directive = $delegate[0];
      directive.templateUrl = 'views/datepicker/day.html';
      return $delegate;
    }]);
  }]);

  angular.module('ui').config(['flowFactoryProvider', 'baseurlProvider', 'CONFIGURATION',
    function(flowFactoryProvider, baseurlProvider, CONFIGURATION) {
      baseurlProvider.setConfig(CONFIGURATION);
      flowFactoryProvider.defaults = {
        method: 'octet',
        target: baseurlProvider.$get().getBaseUrl() + '/adjuntos'
      };
    }
  ]);

  angular.module('ui').config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
    function(schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {
      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'customcheckbox', 'views/custom-checkbox.html');
      schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'switch', 'views/custom-checkbox-switch.html');

      var datepicker = function(name, schema, options) {
        if (schema.type === 'string' && (schema.format === 'date' || schema.format === 'date-time')) {
          var f = schemaFormProvider.stdFormObj(name, schema, options);
          f.key = options.path;
          f.type = 'datepicker';
          options.lookup[sfPathProvider.stringify(options.path)] = f;
          return f;
        }
      };
      schemaFormProvider.defaults.string.unshift(datepicker);

      //Add to the bootstrap directive
      schemaFormDecoratorsProvider.addMapping(
        'bootstrapDecorator',
        'datepicker',
        'views/datepicker.html'
      );
      schemaFormDecoratorsProvider.createDirective(
        'datepicker',
        'views/datepicker.html'
      );
    }
  ]);
})(angular);