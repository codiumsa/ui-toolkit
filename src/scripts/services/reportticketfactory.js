(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.ReportTicketFactory
 * @description
 * # ReportTicketFactory
 */
angular.module('ui')
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
      },

      downloadCustomReport: function(reportID, exportType, filters) {
        console.log('dowloadCustomReport');
        var downloadUrl = baseurl.getBaseUrl() + '/reportes/' + reportID;
        if (filters) {
          downloadUrl += "?";
          _.forEach(filters, function (filter) {
            //console.log(filter);
            downloadUrl += filter + "&";
          });
          return downloadUrl;
        }
        return downloadUrl;
      }
    };
  }]);
}());