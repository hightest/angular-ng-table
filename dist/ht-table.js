/*!
 * angular-ht-ng-table
 * https://github.com/hightest/angular-ng-table
 * Version: 0.0.1 - 2015-01-18T11:03:24.443Z
 * License: 
 */


var app = angular.module('ht.table', ['ui.bootstrap']);

app.directive('htTable', function() {
    return {
        templateUrl: 'ht-table.html',
        scope: {
            'htTable': '='
        },
        controller: function($scope, orderByFilter) {
            var self = this;
            var settings = $scope.htTable;
            var rowClick = angular.isDefined(settings.rowClick) ? settings.rowClick : function() {};
            var expand = angular.isDefined(settings.expand) ? settings.expand : function() {};
            var checkedRows = angular.isDefined(settings.checked) ? settings.checked : function() {};
            var originalData = settings.data;
            var init = angular.isDefined(settings.init) ? settings.init : function() {};
            this.fields = settings.fields;
            self.checked = [];
            this.pagination = {
                total: 0,
                current: 1,
                itemsPerPage: 10
            };
            var sorting = [];
            this.data = originalData;

            $scope.$watch('htTable', function(newVal, oldVal) {
                if (newVal == oldVal)
                    return;
                originalData = newVal.data;
                self.reloadTable();
            }, true);
            angular.forEach(this.fields, function(field) {
                if (angular.isUndefined(field.visible)) {
                    field.visible = true;
                }
            });
            this.reloadTable = function() {
                var predicates = [];
                angular.forEach(sorting, function (sort) {
                    var predicate = '';
                    if (sort.sort == 'asc')
                        predicate = '+';
                    else
                        predicate = '-';
                    predicate += sort.field;
                    predicates.push(predicate);
                });
                var orderedData = sorting.length ? orderByFilter(originalData, predicates) : originalData;
                if (angular.isFunction(init)) {
                    init(orderedData, this.pagination);
                    init = null;
                }
                this.pagination.total = orderedData.length;
                if (!this.pagination.itemsPerPage)
                    this.data = orderedData;
                else
                    this.data = orderedData.slice((this.pagination.current - 1) * this.pagination.itemsPerPage, this.pagination.current * this.pagination.itemsPerPage);
            };
            this.reloadTable();

            $scope.$watch(function() {
                return self.pagination.itemsPerPage;
            }, function(newVal, oldVal) {
                if (newVal == oldVal)
                    return;
                self.reloadTable();
            });
            this.expand = function(row) {
                return rowClick(row);
            };

            this.show = function (row) {
                return expand(row);
            };

            this.pageChanged = function() {
                this.reloadTable();
            };

            this.getFieldClass = function(field) {
                for (var i = 0; i < sorting.length; i++) {
                    if (field.value == sorting[i].field) {
                        if (sorting[i].sort == 'asc')
                            return 'ht-table-icon-up';
                        else
                            return 'ht-table-icon-down';
                    }
                }
                return '';
            };

            var findField = function (field) {
                for (var i = 0; i < sorting.length; i++) {
                    if (sorting[i].field == field.value) {
                        return i;
                    }
                }

                return null;
            };

            this.changeSorting = function(field, $event) {
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
                this.reloadTable();
            };

            this.countColumns = function() {
                var count = 1;
                angular.forEach(this.fields, function(field) {
                    if (field.visible)
                        count++;
                });

                return count;
            };

            $scope.$watch(function() {return self.checked;}, function(newVal, oldVal) {
                if (newVal == oldVal)
                    return;

                var checkedElements = [];

                for (var i = 0; i < originalData.length; i++) {
                    var id = originalData[i].id;
                    if (angular.isDefined(newVal[id]) && newVal[id])
                        checkedElements.push(originalData[i]);
                }

                checkedRows(checkedElements);
            }, true);
        },
        controllerAs: 'table'
    };
});
angular.module("ht.table").run(["$templateCache", function($templateCache) {$templateCache.put("ht-table.html","<div class=\"table-responsive\"><table class=\"table table-bordered\" id=\"table\"><thead><tr><th><div dropdown=\"\" class=\"btn-group\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" dropdown-toggle=\"\"><span class=\"glyphicon glyphicon-cog\" aria-hidden=\"true\"></span></button><ul class=\"dropdown-menu\" role=\"menu\" ng-click=\"$event.stopPropagation()\"><li ng-repeat=\"field in table.fields\"><label><input type=\"checkbox\" ng-model=\"field.visible\">{{field.name}}</label></li></ul></div></th><th ng-repeat=\"field in table.fields\" ng-if=\"field.visible\" ng-click=\"table.changeSorting(field, $event)\" ng-class=\"table.getFieldClass(field)\">{{field.name}}</th></tr></thead><tbody><tr ng-repeat-start=\"row in table.data\" ng-class=\"{active: table.show(row)}\"><th scope=\"row\"><input type=\"checkbox\" ng-model=\"table.checked[row.id]\"></th><td ng-repeat=\"field in table.fields\" ng-if=\"field.visible\" ng-click=\"table.expand(row)\">{{row[field.value]}}</td></tr><tr ng-repeat-end=\"\" ng-if=\"table.show(row)\"><td colspan=\"{{table.countColumns()}}\"><div ui-view=\"\"></div></td></tr></tbody></table></div><div class=\"row\"><div class=\"col-xs-6\"><pagination total-items=\"table.pagination.total\" ng-model=\"table.pagination.current\" ng-change=\"table.pageChanged()\" items-per-page=\"table.pagination.itemsPerPage\" previous-text=\"&laquo;\" next-text=\"&raquo;\"></pagination></div><div class=\"btn-group col-xs-6\"><label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"10\">10</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"25\">25</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"50\">50</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"100\">100</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"0\">Wszystkie</label></div></div>");}]);