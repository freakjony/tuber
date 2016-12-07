'use strict';

angular.module('ngMap')
    .factory('Services', ['$http', '$localStorage', function($http, $localStorage) {
        var baseUrl = "/api/";

        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            var token = $localStorage.token;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        return {
            signup: function(data, success, error) {
                $http({
                    method: 'POST',
                    url: baseUrl + 'user',
                    data: data,
                    headers: { 'Content-Type': 'application/json' }
                }).success(success).error(error)
            },
            login: function(data, success, error) {
                $http.post(baseUrl + 'login', data).success(success).error(error)
            },
            me: function(token, success, error) {
                $http.get(baseUrl + 'me?token=' + token).success(success).error(error)
            },
            logout: function(success) {
                changeUser({});
                delete $localStorage.token;
                delete $localStorage.admin;
                success();
            },
            getByName: function(username, success, error) {
                $http({
                    method: 'GET',
                    url: '/api/user?username=' + username,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: username
                }).success(success).error(error)
            },
            history: function(dates, success, error) {
                $http({
                    method: 'POST',
                    url: baseUrl + 'history',
                    data: dates,
                    headers: { 'Content-Type': 'application/json' }
                }).success(success).error(error)
            }
        };
    }]);
