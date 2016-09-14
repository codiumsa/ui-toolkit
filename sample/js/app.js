(function() {
angular.module('uix', ['ui']);

angular.module('uix').config(config);

config.$inject = [
  '$stateProvider', '$urlRouterProvider', '$translatePartialLoaderProvider', '$translateProvider'
];

function config($stateProvider, $urlRouterProvider, $translatePartialLoaderProvider, $translateProvider) {
  $urlRouterProvider.when('', '/');

  $translatePartialLoaderProvider.addPart('common');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: 'lang/{part}/{lang}.json'
  });
  $translateProvider.preferredLanguage('es');

  $stateProvider.state('uix', {
    url: '/',
    templateUrl: 'views/main.html',
    controller: 'MainCtrl',
    controllerAs: 'vm',
    resolve: {
      translations: function(LangService, tkeys) {
        return LangService.getTranslations(tkeys.MainCtrl);
      }
    }
  })
  .state('uix.step1', {
    url: 'step1',
    template: '<span>Paso 1!</span>'
  })
  .state('uix.step2', {
    url: 'step2',
    template: '<span>Paso 2!</span>'
  })
  .state('uix.step3', {
    url: 'step3',
    template: '<span>Paso 3!</span>'
  });
  return $stateProvider;
}
}());
