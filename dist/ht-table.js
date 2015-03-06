/*!
 * angular-ht-ng-table
 * https://github.com/hightest/angular-ng-table
 * Version: 0.0.1 - 2015-03-06T15:09:03.147Z
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

            self.test = function() {
                console.log('s');
            };

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

                    field.visible = angular.isUndefined(field.visible);
                }
            }

            $scope.$watch('htTable.data', function(newVal, oldVal) {
                if (newVal == oldVal)
                    return;
                originalData = newVal;
                reloadTable();
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

                var orderedData = sorting.length ? orderByFilter(originalData, predicates) : originalData;
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
                self.reloadTable();
            }

            function expand(row) {
                singleSelect = row;
                return functions.rowClick(row);
            }

            function show(row) {
                return expand(row);
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

                postSorting(sorting, self.pagination);
                self.reloadTable();
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
                var checkedElements = self.getCheckedElements();

                checkedRows(checkedElements);
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
                var checkedElements = self.getCheckedElements();
                var count = checkedElements.length;

                if (!count) checkedElements = originalData;

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
});

angular.module("ht.table").run(["$templateCache", function($templateCache) {$templateCache.put("ht-table.html","<div class=\"table-responsive\"><table class=\"table table-bordered\" id=\"{{table.id}}\" ng-class=\"table.class\"><thead><tr><th><div dropdown=\"\" class=\"btn-group\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" dropdown-toggle=\"\"><span class=\"glyphicon glyphicon-cog\" aria-hidden=\"true\"></span></button><ul class=\"dropdown-menu\" role=\"menu\" ng-click=\"$event.stopPropagation()\"><li ng-repeat=\"field in table.fields\" ng-if=\"!table.isTemplate(field)\"><label><input type=\"checkbox\" ng-model=\"field.visible\">{{field.name}}</label></li></ul></div></th><th ng-if=\"table.selectMultiple\"></th><th ng-repeat=\"field in table.fields\" ng-if=\"field.visible\" ng-click=\"table.changeSorting(field, $event)\" ng-class=\"table.getFieldClass(field)\" style=\"cursor:pointer\">{{field.name}}</th></tr></thead><tbody><tr ng-repeat-start=\"row in table.data\" ng-class=\"table.rowStyle(row)\"><td>{{(table.pagination.current - 1) * table.pagination.itemsPerPage + $index + 1}}.</td><th scope=\"row\" ng-if=\"table.selectMultiple\"><input type=\"checkbox\" ng-model=\"row.checked\" ng-change=\"table.checkedChange()\"></th><td ng-repeat=\"field in table.fields\" ng-if=\"field.visible\" ng-click=\"table.expand(row)\"><div ng-if=\"!table.isTemplate(field)\">{{table.getValue(field.value, row)}}</div><div ng-if=\"table.isTemplate(field)\" ng-include=\"field.templateUrl\"></div></td></tr><tr ng-repeat-end=\"\" ng-if=\"table.show(row)\"><td colspan=\"{{table.countColumns()}}\"><div ui-view=\"\"></div></td></tr></tbody><tfoot ng-if=\"table.hasSum()\"><tr><td>&nbsp;</td><td ng-if=\"table.selectMultiple\">&nbsp;</td><td ng-repeat=\"field in table.fields\" ng-if=\"field.visible\"><span ng-if=\"field.type == \'sum\'\">Suma: {{table.sum(field.value) | number:2}}</span></td></tr></tfoot></table></div><div class=\"row\"><div class=\"col-xs-6\" ng-if=\"table.pages() > 1\"><pagination total-items=\"table.pagination.total\" ng-model=\"table.pagination.current\" ng-change=\"table.pageChanged()\" max-size=\"5\" items-per-page=\"table.pagination.itemsPerPage\" previous-text=\"&laquo;\" next-text=\"&raquo;\"></pagination></div><div class=\"btn-group col-xs-6\" ng-if=\"table.pagination.total > 10\"><label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" ng-change=\"table.updatePagination()\" btn-radio=\"10\">10</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" ng-change=\"table.updatePagination()\" btn-radio=\"25\">25</label> <label class=\"btn btn-primary\" ng-if=\"table.pagination.total > 25\" ng-change=\"table.updatePagination()\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"50\">50</label> <label class=\"btn btn-primary\" ng-if=\"table.pagination.total > 50\" ng-change=\"table.updatePagination()\" ng-model=\"table.pagination.itemsPerPage\" btn-radio=\"100\">100</label> <label class=\"btn btn-primary\" ng-model=\"table.pagination.itemsPerPage\" ng-change=\"table.updatePagination()\" btn-radio=\"0\">Wszystkie</label></div></div>");}]);