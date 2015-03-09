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
