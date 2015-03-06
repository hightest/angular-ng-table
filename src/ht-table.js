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

            $scope.$watch('htTable', function(newVal, oldVal) {
                if (newVal == oldVal)
                    return;
                originalData = newVal.data;
                reloadTable();
            }, true);

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
