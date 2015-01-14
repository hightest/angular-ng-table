var app = angular.module('ht.table', ['ui.bootstrap']);

app.directive('htTable', function() {
    return {
        templateUrl: 'ht-table.html',
        scope: {
            'htTable': '='
        },
        controller: function($scope, orderByFilter) {
            var settings = $scope.htTable;
            var rowClick = angular.isDefined(settings.rowClick) ? settings.rowClick : function() {};
            var expand = angular.isDefined(settings.expand) ? settings.expand : function() {};
            var self = this;
            var originalData = settings.data;
            var init = angular.isDefined(settings.init) ? settings.init : function() {};
            this.fields = settings.fields;
            this.checked = [];
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

            this.changeSorting = function(field) {
                var changed = false;
                for (var i = 0; i < sorting.length; i++) {
                    if (sorting[i].field == field.value) {
                        var sort = sorting[i].sort;
                        if (sort == 'asc')
                            sorting[i].sort = 'desc';
                        else
                            sorting.splice(i, 1);
                        changed = true;
                        break;
                    }
                }
                if (!changed) {
                    sorting.push({field: field.value, sort: 'asc'});
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
        },
        controllerAs: 'table'
    };
});