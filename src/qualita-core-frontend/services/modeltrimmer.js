angular.module('qualitaCoreFrontend')
  .factory('ModelTrimmer', ModelTrimmer);


function ModelTrimmer() {
  var service = {
    trimDetails: trimDetails
  };

  return service;

  function trimDetails(model, ignoredFields) {
    var keys = _.keys(model);

    _.forEach(keys, function(key) {
      var ignoredIndex = _.findIndex(ignoredFields, function(elem) { return elem == key; } );
      if(ignoredFields &&  ignoredIndex !== -1) {
        return;
      }

      if(_.isArray(model[key]) == true) {
        _.forEach(model[key], function (elem, index) {
          //no se hace recursivo porque solo se debería de necesitar comprobar en primer nivel
          fieldTrimmer(model[key], index, ignoredFields);
        });

      } else {
        fieldTrimmer(model, key, ignoredFields);
      }
    });
  }

  function fieldTrimmer(model, fieldName, ignoredFields) {
    if(_.isObject(model[fieldName]) && model[fieldName].hasOwnProperty("id")) {
      model[fieldName] = model[fieldName].id;
    }
  }

}
