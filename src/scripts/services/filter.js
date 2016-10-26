(function() {
'use strict';

angular
  .module('ui')
  .factory('Filter', Filter);

function Filter() {
  var FilterTypes =  {
    EQUALS : 'equals',
    NOT_EQUALS : 'notEquals',
    NULL : 'null',
    NOT_NULL : 'notNull',
    LIKE : 'like',
    NOT_LIKE : 'notLike',
    GT : 'gt',
    GTE : 'gte',
    LT : 'lt',
    LTE : 'lte',
    IN : 'in'
  };
  
  // the filter to build
  var filter;

  function joinFilters(filters, joinType) {
    angular.forEach(filters, function(f) {
      filter.booleanJoins.push({
        joinType: joinType,
        filter: f
      });
    });
  }

  function addCondition(condition, other) {
    var cond = {condition: condition};
    
    if(other){
      cond.comparingObject = other;
    }
    filter.conditions.push(cond);
  }

  return {
    path: function(filterPath) {
      filter = {
        path: filterPath,
        conditions: [],
        booleanJoins: []
      };
      return this;
    },

    or: function(filters) {
      joinFilters(filters, 'or');
      return this;
    },

    and: function(filters) {
      joinFilters(filters, 'and');
      return this;
    },
   
    eq: function(other) {
      addCondition(FilterTypes.EQUALS, other);
      return this;
    },
    
    notEq: function(other) {
      addCondition(FilterTypes.NOT_EQUALS, other);
      return this;
    },
    
    isNull: function() {
      addCondition(FilterTypes.NULL);
      return this;
    },
    
    notNull: function() {
      addCondition(FilterTypes.NOT_NULL);
      return this;
    },

    like: function(other) {
      addCondition(FilterTypes.LIKE, other);
      return this;
    },
    
    notLike: function(other) {
      addCondition(FilterTypes.NOT_LIKE, other);
      return this;
    },

    gt: function(other) {
      addCondition(FilterTypes.GT, other);
      return this;
    },
    
    gte: function(other) {
      addCondition(FilterTypes.GTE, other);
      return this;
    },
    
    lt: function(other) {
      addCondition(FilterTypes.LT, other);
      return this;
    },
    
    lte: function(other) {
      addCondition(FilterTypes.LTE, other);
      return this;
    },
    
    /**
     * sql IN
     *
     * @param other{Array} the elements to include
     **/
    in: function(other) {
      addCondition(FilterTypes.IN, other);
      return this;
    },
    
    /**
     * Returns the generated filter.
     *
     * @returns {Object}
     **/
    build: function() {
      return filter;
    }
  };
}
}());