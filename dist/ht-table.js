/*!
 * angular-ht-ng-table
 * https://github.com/hightest/angular-ng-table
 * Version: 0.0.1 - 2015-03-10T12:05:29.706Z
 * License: 
 */


var app = angular.module('ht.table', ['ui.bootstrap', 'naturalSort']);

app.directive('htTable', function() {
    return {
        templateUrl: 'ht-table.html',
        scope: {
            'htTable': '='
        },
        controller: function($scope, $filter) {
            var self = this;
            var settings = $scope.htTable;
            var functions = prepareFunctions(settings);
            self.id = angular.isDefined(settings.id) ? settings.id : 'table';
            self.class = angular.isDefined(settings.class) ? settings.class : [];
            self.selectMultiple = angular.isDefined(settings.selectMultiple) ? settings.selectMultiple : false;
            var active = angular.isDefined(settings.active) ? settings.active : '';
            var originalData = settings.data;
            var singleSelect = null;
            self.fields = settings.fields;
            self.pagination = {
                total: 0,
                current: 1,
                itemsPerPage: 10
            };
            var sorting = [];
            self.data = originalData;

            self.reloadTable = reloadTable;
            self.expand = expand;
            self.show = show;
            self.pageChanged = pageChanged;
            self.pages = pages;
            self.rowStyle = rowStyle;
            self.getFieldClass = getFieldClass;
            self.findField = findField;
            self.changeSorting = changeSorting;
            self.countColumns = countColumns;
            self.checkedChange = checkedChange;
            self.hasSum = hasSum;
            self.getCheckedElements = getCheckedElements;
            self.sum = sum;
            self.getValue = getValue;
            self.isTemplate = isTemplate;
            self.updatePagination = updatePagination;

            preSort();
            reloadTable();

            function prepareFunctions(settings) {
                return {
                    rowClick: getFunction(settings, 'rowClick'),
                    expand: getFunction(settings, 'expand'),
                    postSorting: getFunction(settings, 'postSorting'),
                    checkedRows: getFunction(settings, 'checked'),
                    init: getFunction(settings, 'init')
                };
            }

            function getFunction(object, name) {
                if (angular.isDefined(object[name])) {
                    return object[name];
                } else {
                    return function() {};
                }
            }

            function preSort() {
                for (var i = 0, countFields = self.fields.length; i < countFields; i++) {
                    var field = self.fields[i];

                    if (angular.isDefined(field.sort)) {
                        sorting.push({field: field.value, sort: field.sort});
                    }

                    if (angular.isUndefined(field.visible)) {
                        field.visible = true;
                    }
                }
            }

            $scope.$watch('htTable', function(newVal, oldVal) {
                if (newVal == oldVal)
                    return;
                originalData = newVal.data;
                updatePagination();
            });

            function reloadTable() {
                if (originalData.length === 0 && angular.isFunction(functions.init)) return;

                var predicates = [];

                for (var i = 0, count = sorting.length; i < count; i++) {
                    var sort = sorting[i];
                    var predicate = '';

                    if (sort.sort == 'asc') {
                        predicate = '+';
                    } else {
                        predicate = '-';
                    }

                    predicate += sort.field;
                    predicates.push(predicate);
                }

                var orderedData = sorting.length ? $filter('natural')(originalData, predicates) : originalData;
                var pagination = self.pagination;

                if (angular.isFunction(functions.init)) {
                    functions.init(orderedData, pagination);
                    functions.init = null;
                }

                pagination.total = orderedData.length;
                if (!pagination.itemsPerPage)
                    self.data = orderedData;
                else
                    self.data = orderedData.slice(
                        (pagination.current - 1) * pagination.itemsPerPage,
                        pagination.current * self.pagination.itemsPerPage
                    );
            }

            function updatePagination() {
                self.pagination.current = 1;
                reloadTable();
            }

            function expand(row) {
                singleSelect = row;
                return functions.rowClick(row);
            }

            function show(row) {
                return functions.expand(row);
            }

            function pageChanged() {
                this.reloadTable();
            }

            function pages() {
                return parseInt(self.pagination.total / self.pagination.itemsPerPage) + 1;
            }

            function rowStyle(element) {
                if ((self.selectMultiple && element.checked) || element == singleSelect)
                    return active;

                return '';
            }

            function getFieldClass(field) {
                for (var i = 0; i < sorting.length; i++) {
                    if (field.value == sorting[i].field) {
                        if (sorting[i].sort == 'asc')
                            return 'ht-table-icon-up';
                        else
                            return 'ht-table-icon-down';
                    }
                }
                return '';
            }

            function findField(field) {
                for (var i = 0; i < sorting.length; i++) {
                    if (sorting[i].field == field.value) {
                        return i;
                    }
                }

                return null;
            }

            function changeSorting(field, $event) {
                var shift = $event.shiftKey;

                var fieldPosition = findField(field);

                var newField = {};

                if (null === fieldPosition)
                    newField = {field: field.value, sort: 'asc'};
                else
                    newField = sorting[fieldPosition];

                if (null !== fieldPosition) {
                    var sort = newField.sort;
                    if (sort == 'asc') {
                        sorting[fieldPosition].sort = 'desc';
                        if (!shift) {
                            sorting = [sorting[fieldPosition]];
                        }
                    } else {
                        if (shift)
                            sorting.splice(fieldPosition, 1);
                        else
                            sorting = [];
                    }
                } else {
                    if (shift)
                        sorting.push(newField);
                    else
                        sorting = [newField];
                }

                functions.postSorting(sorting, self.pagination);
                reloadTable();
            }

            function countColumns() {
                var count = 1;

                for (var i = 0, length = self.fields.length; i < length; i++) {
                    var field = self.fields[i];

                    if (field.visible) count++;
                }

                if (self.selectMultiple)
                    count++;

                return count;
            }

            function checkedChange() {
                var checkedElements = getCheckedElements();

                functions.checkedRows(checkedElements);
            }

            function hasSum() {
                for (var i = 0, count = self.fields.length; i < count; i++) {
                    if (angular.isDefined(self.fields[i].type) && self.fields[i].type == 'sum')
                        return true;
                }

                return false;
            }

            function getCheckedElements() {
                var checkedElements = [];

                for (var i = 0, count = self.data.length; i < count; i++) {
                    var row = self.data[i];
                    if (angular.isDefined(row.checked) && row.checked) {
                        checkedElements.push(row);
                    }
                }

                return checkedElements;
            }

            function sum(field) {
                var result = 0;
                var checkedElements = getCheckedElements();

                if (!checkedElements.length) checkedElements = originalData;

                var count = checkedElements.length;
                for (var i = 0; i < count; i++) {
                    var element = checkedElements[i];
                    result += element[field];
                }

                return result;
            }
            
            function getValue(field, row) {
                var arrayField = field.split('.');
                var result = row;

                for (var i = 0, count = arrayField.length; i < count; i++) {
                    var entry = arrayField[i];

                    if (null !== result && result.hasOwnProperty(entry)) {
                        result = result[entry];
                    } else {
                        return '';
                    }
                }

                return result;
            }

            function isTemplate(field) {
                return field.type == 'template';
            }
            
        },
        controllerAs: 'table'
    };
})

.filter('natural', function($parse, naturalService){
        var slice = [].slice;

        function toBoolean(value) {
            if (typeof value === 'function') {
                value = true;
            } else if (value && value.length !== 0) {
                var v = angular.lowercase("" + value);
                value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
            } else {
                value = false;
            }
            return value;
        }

        function isWindow(obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        }

        function map(obj, iterator, context) {
            var results = [];
            angular.forEach(obj, function(value, index, list) {
                results.push(iterator.call(context, value, index, list));
            });
            return results;
        }

        function isArrayLike(obj) {
            if (obj === null || isWindow(obj)) {
                return false;
            }

            var length = obj.length;

            if (obj.nodeType === 1 && length) {
                return true;
            }

            return angular.isString(obj) || angular.isArray(obj) || length === 0 ||
                typeof length === 'number' && length > 0 && (length - 1) in obj;
        }


    return function(array, sortPredicate, reverseOrder) {
        if (!(isArrayLike(array))) return array;
        sortPredicate = angular.isArray(sortPredicate) ? sortPredicate: [sortPredicate];
        if (sortPredicate.length === 0) { sortPredicate = ['+']; }
        sortPredicate = map(sortPredicate, function(predicate){
            var descending = false, get = predicate || identity;
            if (angular.isString(predicate)) {
                if ((predicate.charAt(0) == '+' || predicate.charAt(0) == '-')) {
                    descending = predicate.charAt(0) == '-';
                    predicate = predicate.substring(1);
                }
                if ( predicate === '' ) {
                    // Effectively no predicate was passed so we compare identity
                    return reverseComparator(function(a,b) {
                        return compare(a, b);
                    }, descending);
                }
                get = $parse(predicate);
                if (get.constant) {
                    var key = get();
                    return reverseComparator(function(a,b) {
                        return compare(a[key], b[key]);
                    }, descending);
                }
            }
            return reverseComparator(function(a,b){
                return compare(get(a),get(b));
            }, descending);
        });
        return slice.call(array).sort(reverseComparator(comparator, reverseOrder));

        function comparator(o1, o2){
            for ( var i = 0; i < sortPredicate.length; i++) {
                var comp = sortPredicate[i](o1, o2);
                if (comp !== 0) return comp;
            }
            return 0;
        }

        function reverseComparator(comp, descending) {
            return toBoolean(descending) ? function(a,b){return comp(b,a);} : comp;
        }

        function compare(v1, v2){
            var t1 = typeof v1;
            var t2 = typeof v2;
            if (t1 == t2) {
                if (angular.isDate(v1) && angular.isDate(v2)) {
                    v1 = v1.valueOf();
                    v2 = v2.valueOf();
                }
                if (t1 == "string") {
                    v1 = naturalService.naturalValue(v1.toLowerCase());
                    v2 = naturalService.naturalValue(v2.toLowerCase());
                }
                if (v1 === v2) return 0;
                return v1 < v2 ? -1 : 1;
            } else {
                return t1 < t2 ? -1 : 1;
            }
        }
    };
});

/* global angular: false */

/*!
 * Copyright 2013 Phil DeJarnett - http://www.overzealous.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Create a module for naturalSorting
angular.module("naturalSort", [])

// The core natural service
    .factory("naturalService", ["$locale", function($locale) {
        "use strict";
        // the cache prevents re-creating the values every time, at the expense of
        // storing the results forever. Not recommended for highly changing data
        // on long-term applications.
        var natCache = {},
        // amount of extra zeros to padd for sorting
            padding = function(value) {
                return "00000000000000000000".slice(value.length);
            },

        // Converts a value to a string.  Null and undefined are converted to ''
            toString = function(value) {
                if(value === null || value === undefined) return '';
                return ''+value;
            },

        // Calculate the default out-of-order date format (dd/MM/yyyy vs MM/dd/yyyy)
            natDateMonthFirst = $locale.DATETIME_FORMATS.shortDate.charAt(0) === "M",
        // Replaces all suspected dates with a standardized yyyy-m-d, which is fixed below
            fixDates = function(value) {
                // first look for dd?-dd?-dddd, where "-" can be one of "-", "/", or "."
                return toString(value).replace(/(\d\d?)[-\/\.](\d\d?)[-\/\.](\d{4})/, function($0, $m, $d, $y) {
                    // temporary holder for swapping below
                    var t = $d;
                    // if the month is not first, we'll swap month and day...
                    if(!natDateMonthFirst) {
                        // ...but only if the day value is under 13.
                        if(Number($d) < 13) {
                            $d = $m;
                            $m = t;
                        }
                    } else if(Number($m) > 12) {
                        // Otherwise, we might still swap the values if the month value is currently over 12.
                        $d = $m;
                        $m = t;
                    }
                    // return a standardized format.
                    return $y+"-"+$m+"-"+$d;
                });
            },

        // Fix numbers to be correctly padded
            fixNumbers = function(value) {
                // First, look for anything in the form of d.d or d.d.d...
                return value.replace(/(\d+)((\.\d+)+)?/g, function ($0, integer, decimal, $3) {
                    // If there's more than 2 sets of numbers...
                    if (decimal !== $3) {
                        // treat as a series of integers, like versioning,
                        // rather than a decimal
                        return $0.replace(/(\d+)/g, function ($d) {
                            return padding($d) + $d;
                        });
                    } else {
                        // add a decimal if necessary to ensure decimal sorting
                        decimal = decimal || ".0";
                        return padding(integer) + integer + decimal + padding(decimal);
                    }
                });
            },

        // Finally, this function puts it all together.
            natValue = function (value) {
                if(natCache[value]) {
                    return natCache[value];
                }
                natCache[value] = fixNumbers(fixDates(value));
                return natCache[value];
            };

        // The actual object used by this service
        return {
            naturalValue: natValue,
            naturalSort: function(a, b) {
                a = natVale(a);
                b = natValue(b);
                return (a < b) ? -1 : ((a > b) ? 1 : 0);
            }
        };
    }])

// Attach a function to the rootScope so it can be accessed by "orderBy"
    .run(["$rootScope", "naturalService", function($rootScope, naturalService) {
        "use strict";
        $rootScope.natural = function (field) {
            return function (item) {
                return naturalService.naturalValue(item[field]);
            };
        };
    }]);
angular.module("ht.table").run(["$templateCache", function($templateCache) {$templateCache.put("ht-table.html","<div class=\"table-responsive\"><table class=\"table table-bordered\" id=\"{{table.id}}\" ng-class=\"table.class\"><thead><tr><th><div dropdown=\"\" class=\"btn-group\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" dropdown-toggle=\"\"><span class=\"glyphicon glyphicon-cog\" aria-hidden=\"true\"></span></button><ul class=\"dropdown-menu\" role=\"menu\" ng-click=\"$event.stopPropagation()\"><li ng-repeat=\"field in table.fields\" ng-if=\"!table.isTemplate(field)\"><label><input type=\"checkbox\" ng-model=\"field.visible\">{{field.name}}</label></li></ul></div></th><th ng-if=\"table.selectMultiple\"></th><th ng-repeat=\"field in table.fields\" ng-if=\"field.visible\" ng-click=\"table.changeSorting(field, $event)\" ng-class=\"table.getFieldClass(field)\" style=\"cursor:pointer\">{{field.name}}</th></tr></thead><tbody><tr ng-repeat-start=\"row in table.data\" ng-class=\"table.rowStyle(row)\"><td>{{(table.pagination.current - 1) * table.pagination.itemsPerPage + $index + 1}}.</td><th scope=\"row\" ng-if=\"table.selectMultiple\"><input type=\"checkbox\" ng-model=\"row.checked\" ng-change=\"table.checkedChange()\"></th><td ng-repeat=\"field in table.fields\" ng-if=\"field.visible\" ng-click=\"table.expand(row)\"><div ng-if=\"!table.isTemplate(field)\">{{table.getValue(field.value, row)}}</div><div ng-if=\"table.isTemplate(field)\" ng-click=\"$event.stopPropagation()\" ng-include=\"field.templateUrl\"></div></td></tr><tr ng-repeat-end=\"\" ng-if=\"table.show(row)\"><td colspan=\"{{table.countColumns()}}\"><div ui-view=\"\"></div></td></tr></tbody><tfoot ng-if=\"table.hasSum()\"><tr><td>&nbsp;</td><td ng-if=\"table.selectMultiple\">&nbsp;</td><td ng-repeat=\"field in table.fields\" ng-if=\"field.visible\"><span ng-if=\"field.type == \'sum\'\">Suma: {{table.sum(field.value) | number:2}}</span></td></tr></tfoot></table></div><div class=\"row\"><div class=\"col-xs-6\" ng-if=\"table.pages() > 1\"><pagination total-items=\"table.pagination.total\" ng-model=\"table.pagination.current\" ng-change=\"table.pageChanged()\" max-size=\"5\" items-per-page=\"table.pagination.itemsPerPage\" previous-text=\"&laquo;\" next-text=\"&raquo;\"></pagination></div><div class=\"btn-group col-xs-6\" ng-if=\"table.pagination.total > 10\"><label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" ng-change=\"table.updatePagination()\" btn-radio=\"10\">10</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" ng-change=\"table.updatePagination()\" btn-radio=\"25\">25</label> <label class=\"btn btn-primary\" ng-if=\"table.pagination.total > 25\" ng-change=\"table.updatePagination()\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"50\">50</label> <label class=\"btn btn-primary\" ng-if=\"table.pagination.total > 50\" ng-change=\"table.updatePagination()\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"100\">100</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" ng-change=\"table.updatePagination()\" btn-radio=\"0\">Wszystkie</label></div></div>");}]);