angular.module('demo', ['ht.table']).controller('DemoCtrl', function ($scope) {
    $scope.data = [
        {id: 1, name: "Moroni", age: 50},
        {id: 1, name: "Tiancum", age: 43},
        {id: 1, name: "Jacob", age: 27},
        {id: 1, name: "Nephi", age: 29},
        {id: 1, name: "Enos", age: 34},
        {id: 1, name: "Tiancum", age: 43},
        {id: 1, name: "Jacob", age: 27},
        {id: 1, name: "Nephi", age: 29},
        {id: 1, name: "Enos", age: 33},
        {id: 1, name: "Tiancum", age: 43},
        {id: 1, name: "Jacob", age: 27},
        {id: 1, name: "Nephi", age: 29},
        {id: 1, name: "Enos", age: 34},
        {id: 1, name: "Tiancum", age: 43},
        {id: 1, name: "Jacob", age: 27},
        {id: 1, name: "Nephi", age: 29},
        {id: 1, name: "Enos", age: 34}
    ];

    $scope.settings = {
        data: $scope.data,
        id: 'table-id',
        class: ['myClass'],
        selectMultiple: true,
        active: 'active',
        fields: [
            {
                name: "imie",
                value: "name",
                sort: "asc"
            },
            {
                name: "wiek",
                value: "age",
                type: "sum"
            },
            {
                type: 'template',
                templateUrl: 'template.html'
            }
        ],
        init: function(data, pagination) {
            pagination.current = 2;
        },
        checked: function(rows) {
            console.log(rows);
        },
        postSorting: function(sorting, pagination) {
            console.log(sorting);
            console.log(pagination);
        },
        expand: function() {
            console.log('expand');
        },
        rowClick: function() {
            console.log('row click');
        }
    };

});

angular.module('demo').run(function($templateCache) {
    $templateCache.put("template.html","<div>{{ row.name }}!</div>");
});
