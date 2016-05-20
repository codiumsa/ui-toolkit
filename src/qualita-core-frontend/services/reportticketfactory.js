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
  
    var ReportTicket = $resource(baseurl.getBaseUrl() + '/ticket/:reportID?:query&currentColumnOrder=:currentColumnOrder', 
      {
        action: '@reportID'
      });

    return {
      ticket: function(reportID, filters, searchParams, currentColumnOrder) {
        var report = new ReportTicket(filters);
        var params = {reportID: reportID}; 

        if (searchParams) {
          params.query = decodeURIComponent($.param(searchParams));
        }

        if (currentColumnOrder) {
          params.currentColumnOrder = currentColumnOrder;
        }
        
        return report.$save(params);
      },

      downloadURL: function(reportTicket, exportType) {
        console.log('downloadURL');
        return baseurl.getBaseUrl() + '/generar/' + reportTicket + '/' + exportType;
      }
    };
  }]);