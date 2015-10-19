/*global $, google, storeLocator */
// Namespacing approach: http://stackoverflow.com/a/5947280/1450683
(function ($, $CU, _) {
    "use strict";

    var CircleUpCompanyDataSource = (function () {

        var source = $("#store-locator-info-window-template").html();
        var infoWindowTemplate = Handlebars.compile(source);
        var overlay = '<i id="map-overlay" style="position: absolute; bottom: 25px; left: 5px" class="icon-spinner icon-spin icon-4x"></i>';

        function CircleUpCompanyDataSource(placesService, locationsAPIUrl, companyId) {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            this.placesService = placesService;
            this.locationsAPIUrl = locationsAPIUrl;
            this.companyId = companyId;
        }

        // always called with a storeLocator.Store instance as the 'this' context
        function getInfoWindowContent() {
            return infoWindowTemplate(this.getDetails());
        }

        function addOverlay() {
            $('#locations-map-canvas').append(overlay);
        }

        function removeOverlay() {
            $('#map-overlay').remove();
        }


         function parseStoreFromDB(storeLocation) {
            var store, address, position, features, properties;

            position = new google.maps.LatLng(storeLocation.latitude, storeLocation.longitude);
            address = join([storeLocation.street_address_1, storeLocation.city, storeLocation.state, storeLocation.postal_code], '\n');
            features = new storeLocator.FeatureSet(new storeLocator.Feature(storeLocation.company.id, storeLocation.company['name']));
            properties = {
                store_name: storeLocation['name'],
                address: address,
                company_name: storeLocation.company['name'],
                company_url: storeLocation.company.url
            };

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            store = new storeLocator.Store(storeLocation.id, position, features, properties);
            store.getInfoWindowContent = getInfoWindowContent;
            return store;
        }

        /*
        function parseStoresFromGooglePlace(results, storeLocation) {
            var stores = [], store;
            _.each(results, function(result) {
                var position = result.geometry.location;
                var features = new storeLocator.FeatureSet(new storeLocator.Feature(storeLocation.company.id, storeLocation.company.name));
                var properties = {
                   title: result.name,
                   address: result.types.join(', '),
                   icon: result.icon,
                   reference: result.reference,
                   id: result.id,
                   vicinity: result.vicinity
                };
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                store = new storeLocator.Store(result.id, position, features, properties);
                store.getInfoWindowContent = getInfoWindowContent;
                stores.push(store);
            });
            return stores;
        }
        */

        //noinspection JSUnusedGlobalSymbols
        CircleUpCompanyDataSource.prototype.getStores = function (bounds, features, callback) {
            var self = this, stores = [], deferred = [], store, data;
            //noinspection JSUnresolvedFunction
            data = {
                n: bounds.getNorthEast().lat(),
                e: bounds.getNorthEast().lng(),
                s: bounds.getSouthWest().lat(),
                w: bounds.getSouthWest().lng(),
                company_id: this.companyId
            };

            addOverlay();

            // first make call to internal 'locations' API. this returns either matching stores from Database
            // or matching Places strings
            $.ajax({
                url: self.locationsAPIUrl,
                data: data
            }).done(function (data) {
                    _.each(data.obj.store_locations, function (storeLocation) {
                        store = parseStoreFromDB(storeLocation);
                        if (!features.asList().length || _.some(features.asList(), function (f) {
                            return store.hasFeature(f);
                        })) {
                            stores.push(store);
                        }
                    });

                    _.each(data.obj.search_term_locations, function(storeLocation) {
                        deferred.push(self.getStoresFromGooglePlaces(bounds, storeLocation));
                    });

                    $.when.apply($, deferred).done(function () {
                        _.each(arguments, function(pipeResult) {
                            /*
                            var placesData = pipeResult.placesServiceResult;
                            var storeLocation = pipeResult.storeLocation;
                            var placeStores = parseStoresFromGooglePlace(placesData, storeLocation);
                            _.each(placeStores, function(s) {
                                 stores.push(s);
                            });
                            */
                        });
                        removeOverlay();
                        callback(stores);
                    });
            });
        };

        /**
         * Creates a deferred search request to the google places api.
         * @param bounds
         * @param storeLocation
         * @return jQuery Promise **/
         CircleUpCompanyDataSource.prototype.getStoresFromGooglePlaces = function (bounds, storeLocation) {
            //noinspection JSUnresolvedFunction
            var deferred = $.Deferred();
            //noinspection JSUnresolvedVariable
            this.placesService.search({bounds: bounds, name: storeLocation.searchTerm}, deferred.resolve);

            // we need the original storeLocation to be paired with the google places result
            // so we can get the company name information
            //noinspection JSUnresolvedFunction
            return deferred.pipe(function(placesServiceResult) {
                return {
                    placesServiceResult: placesServiceResult,
                    storeLocation: storeLocation
                }
            });
        };

        return CircleUpCompanyDataSource;
    }());


    /**
     * Joins elements of an array that are non-empty and non-null.
     * @private
     * @param {!Array} arr array of elements to join.
     * @param {string} sep the separator.
     * @return {string}
     */
    function join(arr, sep) {
        var parts = [], i;
        for (i = 0; i < arr.length; ++i) {
            if (arr[i]) {
                parts.push(arr[i]);
            }
        }
        return parts.join(sep);
    }

    $(function () {
        var locatorData = $CU.pageData['locator'],
            $canvas = $('#locations-map-canvas'),
            $panel = $('#locations-panel'),
            map, features, placesService, dataSource, view, panel;

        if (locatorData && $canvas.length) {
            map = new google.maps.Map($canvas.get(0), {
                center: new google.maps.LatLng(locatorData['latitude'], locatorData['longitude']),
                zoom: 11,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            placesService = new google.maps.places.PlacesService(map);

            dataSource = new CircleUpCompanyDataSource(placesService, locatorData['locations_url'], locatorData['company_id']);

            features = new storeLocator.FeatureSet();
            _.each(locatorData['features'], function (f) {
                var feature = new storeLocator.Feature(f.id, f.name);
                features.add(feature);
            });

            view = new storeLocator.View(map, dataSource, {
                geolocation: false,
                features: features
            });

            panel = new storeLocator.Panel($panel.get(0), {
                view: view
            });
        }


        $("a[data-target='#product']").on("shown", function () {
            //noinspection JSUnresolvedVariable
            google.maps.event.trigger(map, 'resize');
        });


    });

}(window.jQuery, window.$CU = window.$CU || {}, window._));
