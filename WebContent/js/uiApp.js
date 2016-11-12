//(function(angular) {
    var app = angular.module("ngMap", []);
    app.controller(
        "tuberApp", [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.newContainer = { "containerId": null, "percentageFull": 0, "lng": null, "lat": null, "address": null };

                $scope.addContainer = function(jsonContainer) {
                	console.log("Inside addContainer angular function");
                	console.log("Saving container from UI: " + JSON.parse(jsonContainer));

                    $http({
                        method: 'POST',
                        url: 'http://localhost:5000/api/container',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: jsonContainer
                    }).then(
                        function(response) {
                            response.data
                            noty({
                                text: "Request sent!",
                                type: 'success',
                                timeout: 4000
                            });
                        },
                        function(response) {
                            $scope.addressError = 'Request failed' + " error code: " + response.status + response.data.status;
                        });
                };
            }
        ]);
//});
