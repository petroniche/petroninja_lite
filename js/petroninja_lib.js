(function (window) {

    function petroninja() {
        var _petroninjaObject = {};
        var api_url = 'https://api.petroninja.com/api/'
        var api_key = '';

        function loadDoc(url, cFunction) {
            var xhttp;
            xhttp = new XMLHttpRequest();


            xhttp.onreadystatechange = function () {

                if (this.readyState == 4 && this.status == 200) {
                    cFunction(this);
                }
            };

            xhttp.open("GET", url, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("x-api-key", api_key);
            xhttp.send();
        }

        _petroninjaObject.setApiKey = function (key) {
            api_key = key;
            return 'Api key set to ' + api_key;
        };

        //Get high level well data
        _petroninjaObject.getBasicWellData = function (uwi, callback) {
            loadDoc(api_url + 'v1/wells/' + uwi, callback);
        };

        //Get Well, Casing and Completion Data
        _petroninjaObject.getWellData = function (uwi, callback) {
            loadDoc(api_url + 'v1/wells/' + uwi + '/detailed', callback);
        };

        //Get production data for a uwi. param exact = true, returns production data for the given event number
        _petroninjaObject.getWellProductionData = function (uwi, callback) {
            loadDoc(api_url + 'v1/wells/' + uwi + '/production?exact=true', callback);
        };

        //Get All Events for a UWI
        _petroninjaObject.getWellEvents = function (uwi, callback) {
            loadDoc(api_url + 'v1/wells/' + uwi + '/events', callback);
        };

        //Search for a well based on a string
        _petroninjaObject.wellSearch = function (searchString, callback) {
            loadDoc(api_url + 'v1/wells/search?q=' + searchString, callback);
        };

        return _petroninjaObject;
    }

    if (typeof (window.PetroNinjaData) === 'undefined') {
        window.PetroNinjaData = petroninja();
    }
})(window);
