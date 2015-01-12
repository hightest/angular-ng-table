/*!
 * angular-ht-ng-table
 * https://github.com/hightest/angular-ng-table
 * Version: 0.0.1 - 2015-01-12T14:56:55.004Z
 * License: 
 */


angular.module('ht.ng-table', ['ngTable']).directive('htNgTable', ['$compile', function($compile) {
    'use strict';

    var prepareTemplate = function(fields, templateVal) {
        var template = '<table ng-table="tableParams" class="table">' +
            '<tr ng-repeat-start="row in $data" ng-click="toggle(row)">';
        angular.forEach(fields, function(value) {
            template += '<td data-title="\'' + value.name + '\'" sortable="\'' + value.field + '\'">{{row.' + value.field + '}}</td>';
        });
        template += '</tr><tr ng-repeat-end="" ng-if="show(row)"><td colspan="' + fields.length + '">' + templateVal + '</td></tr>';
        template += '</table>';

        return template;
    };

    return {
        require: '^ngModel',
        scope: {
            htNgTable: '=',
            ngModel: '='
        },
        controller: ['$scope', 'ngTableParams', 'orderByFilter', function ($scope, ngTableParams, orderByFilter) {
            var settings = $scope.htNgTable;
            $scope.fields = settings.fields;
            $scope.template = settings.template;
            $scope.toggle = settings.expand;
            $scope.initTable = settings.init;


            $scope.show = function (row) {
                return $scope.htNgTable.show(row);
            };

            $scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue)
                    return;
                $scope.tableParams.reload();
            }, true);

            /* jshint ignore:start */
            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10          // count per page
            }, {
                total: $scope.ngModel.length,
                getData: function($defer, params) {
                    var orderedData = params.sorting() ?
                        orderByFilter($scope.ngModel, params.orderBy()) :
                        $scope.ngModel;
                    params.total = orderedData.length;
                    $scope.initTable(orderedData, params);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
            /* jshint ignore:end */
        }],
        link: function(scope, element) {
            var html = prepareTemplate(scope.fields, scope.template);
            element.html(html);
            $compile(element.contents())(scope);
        }
    };

}]);