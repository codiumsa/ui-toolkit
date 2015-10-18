'use strict';

/**
 * @ngdoc service
 * @name portalApp.ReportTicketFactory
 * @description
 * # ReportTicketFactory
 * Factory in the portalApp.
 */
angular.module('qualitaCoreFrontend')
  .factory('ReportTicketFactory', ['$resource', 'baseurl', function ($resource, baseurl) {
  
    var ReportTicket = $resource(baseurl.getBaseUrl() + '/ticket/:reportID', {action: '@reportID'});

    return {
      ticket: function(reportID, filters) {
        var report = new ReportTicket(filters);
        return report.$save({reportID: reportID});
      },

      downloadURL: function(reportTicket, exportType) {
        console.log('downloadURL');
        return baseurl.getBaseUrl() + '/generar/' + reportTicket + '/' + exportType;
      }
    };
  }]);