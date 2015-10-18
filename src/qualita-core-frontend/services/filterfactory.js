'use strict';

/**
 * @ngdoc service
 * @name qualita.filterFactory
 * @description
 * # filterFactory
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('filterFactory', function () {
    // Service logic
    // ...

    var logicalOp = function(type, filters) {
      var result = {
        _inner: {
          type: type
        }
      };
      result._inner.filters = (this && this._inner) ? [this._inner, filters] : filters;
      if(!result.or && type === 'and') result.or = or;
      if(!result.value) result.value = value;
      if(!result.add) result.add = add;
      result.paginate = paginate;
      return result;
    }

    var and = function(filters) {
      return logicalOp.call(this, 'and', filters);
    }

    var or = function(filters) {
      return logicalOp.call(this, 'or', filters);
    }

    var add = function(filter) {
      this.filters.push(filter);
      return this;
    }

    var single = function(filter) {
      return and([filter]);
    }

    var value = function() {
      return this._inner;
    }

    var paginate = function(limit, offset) {
      this._inner.limit = limit;
      this._inner.offset = offset;
      return this;
    }


    // Public API here
    return {
      and: and,
      or: or,
      add: add,
      single: single,
      value : value
    };
  });
