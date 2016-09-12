(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.ConfigProvider
 * @description
 * # ConfigProvider
 */
angular.module('ui')
  .provider('Config', function () {

    var options = {};

    this.config = function (opt) {
      angular.extend(options, opt);
    };

    this.$get = [function () {
      return options;
    }];
  });
}());
