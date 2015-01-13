var app = angular.module('ht.table', []);

app.directive('htTable', function() {
    return {
        templateUrl: 'ht-table.html',
        scope: {
            'htTable': '='
        },
        controller: function($scope) {
            var settings = $scope.htTable;
            var originalData = settings.data;
            this.fields = settings.fields;
            var showId = null;
            var total = originalData.length;
            var elementsPerPage = 10;
            var pages = parseInt(total / elementsPerPage) + 1;
            var currentPage = 1;
            this.data = originalData.slice((currentPage - 1) * elementsPerPage, elementsPerPage);

            this.expand = function(row) {
                console.log('expand ' + row.id);
                if (this.show(row))
                    showId = null;
                else
                    showId = row.id;
            };

            this.show = function (row) {
                console.log('show ' + row.id);
                return row.id == showId;
            };

            this.isFirstPage = function() {
                return currentPage == 1;
            };

            this.isLastPage = function() {
                return pages == currentPage;
            };

            this.isActivePage = function(page) {
                return page == currentPage;
            };

            this.getPages = function() {
                var result = [];
                for (var i = 1; i <= pages; i++) {
                    result.push(i);
                }

                return result;
            };

            this.nextPage = function() {
                currentPage++;
            };

            this.previousPage = function() {
                currentPage--;
            };
        },
        controllerAs: 'table'
    };
});