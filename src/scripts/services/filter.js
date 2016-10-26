(function() {
'use strict';

angular
  .module('ui')
  .factory('Filter', FilterFactory);

function FilterFactory() {
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
  
  function joinFilters(builder, filters, joinType) {
    if(!angular.isArray(filters)){
      filters = [filters];
    }

    angular.forEach(filters, function(f) {
      builder.booleanJoins.push({
        joinType: joinType,
        filter: f
      });
    });
  }

  function addCondition(builder, condition, other) {
    var cond = {condition: condition};
    
    if(other){
      cond.comparingObject = other;
    }
    builder.conditions.push(cond);
  }

  // Filter class
  function Filter(path){
    this.path = path;
    this.conditions = [];
    this.booleanJoins = [];
  }
  
  var prototype = {
    or: function(filters) {
      joinFilters(this, filters, 'or');
      return this;
    },

    and: function(filters) {
      joinFilters(this, filters, 'and');
      return this;
    },
   
    eq: function(other) {
      addCondition(this, FilterTypes.EQUALS, other);
      return this;
    },
    
    notEq: function(other) {
      addCondition(this, FilterTypes.NOT_EQUALS, other);
      return this;
    },
    
    isNull: function() {
      addCondition(this, FilterTypes.NULL);
      return this;
    },
    
    notNull: function() {
      addCondition(this, FilterTypes.NOT_NULL);
      return this;
    },

    like: function(other) {
      addCondition(this, FilterTypes.LIKE, other);
      return this;
    },
    
    notLike: function(other) {
      addCondition(this, FilterTypes.NOT_LIKE, other);
      return this;
    },

    gt: function(other) {
      addCondition(this, FilterTypes.GT, other);
      return this;
    },
    
    gte: function(other) {
      addCondition(this, FilterTypes.GTE, other);
      return this;
    },
    
    lt: function(other) {
      addCondition(this, FilterTypes.LT, other);
      return this;
    },
    
    lte: function(other) {
      addCondition(this, FilterTypes.LTE, other);
      return this;
    },

    /**
     * sql IN
     *
     * @param other{Array} the elements to include
     **/
    in: function(other) {
      addCondition(this, FilterTypes.IN, other);
      return this;
    }
  };
  Filter.prototype = prototype;
  
  return {
    path: function(filterPath) {
      return new Filter(filterPath);
    }
  };
}
}());