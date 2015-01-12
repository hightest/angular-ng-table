angular.module('demo', ['ht.ng-table']).controller('DemoCtrl', function ($scope, ngTableParams, $filter) {
    $scope.settings = {
        fields: [
            {name: "1", field: "name"},
            {name: "2", field: "name"},
            {name: "3", field: "name"},
            {name: "4", field: "name"},
            {name: "5", field: "name"},
            {name: "6", field: "name"},
            {name: "7", field: "name"},
            {name: "8", field: "name"},
            {name: "9", field: "name"},
            {name: "10", field: "name"},
            {name: "11", field: "name"},
            {name: "12", field: "name"},
            {name: "13", field: "name"},
            {name: "14", field: "name"},
            {name: "15", field: "age"}
        ],
        template: 'test',
        show: function(row) {
            if (row.age % 2)
                return false;
        },
        expand: function (row) {
            console.log('expand');
        }
    };

    $scope.data = [
        {name: "Moroni", age: 50},
        {name: "Tiancum", age: 43},
        {name: "Jacob", age: 27},
        {name: "Nephi", age: 29},
        {name: "Enos", age: 34},
        {name: "Tiancum", age: 43},
        {name: "Jacob", age: 27},
        {name: "Nephi", age: 29},
        {name: "Enos", age: 34},
        {name: "Tiancum", age: 43},
        {name: "Jacob", age: 27},
        {name: "Nephi", age: 29},
        {name: "Enos", age: 34},
        {name: "Tiancum", age: 43},
        {name: "Jacob", age: 27},
        {name: "Nephi", age: 29},
        {name: "Enos", age: 34}
    ];
});
