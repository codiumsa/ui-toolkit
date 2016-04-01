angular.module('qualitaCoreFrontend')
  .factory('ModelTrimmer', ModelTrimmer);


function ModelTrimmer() {
  var service = {
    trimDetails: trimDetails
  };

  return service;

  function trimDetails(model, ignoredFields) {
    var response = {};
    var keys = _.keys(model);

    _.forEach(keys, function(key) {
      var ignoredIndex = _.findIndex(ignoredFields, function(elem) { return elem == key; } );
      if(ignoredFields &&  ignoredIndex !== -1) {
        response[key] = model[key];
        return;
      }

      if(_.isArray(model[key]) == true) {
        response[key] = [];
        _.forEach(model[key], function (elem, index) {
          //no se hace recursivo porque solo se debería de necesitar comprobar en primer nivel
          fieldTrimmer(model[key], response[key], index, ignoredFields);
        });

      } else {
        fieldTrimmer(model, response, key, ignoredFields);
      }
    });
    return response;
  }

  function fieldTrimmer(model, newModel, fieldName, ignoredFields) {
    if(_.isObject(model[fieldName]) && model[fieldName].hasOwnProperty("id")) {
      newModel[fieldName] = model[fieldName].id;
    } else {
      newModel[fieldName] = model[fieldName];
    }
  }

}
