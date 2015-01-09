angular.module('demo', ['ht.ng-table']).controller('DemoCtrl', function ($scope, ngTableParams, $filter) {
    $scope.settings = {
        fields: [
            {name: "Imię", field: "name"},
            {name: "Wiek", field: "age"}
        ],
        template: 'test',
        show: function(row) {
            if (row.age % 2)
                return true;
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
