/*jslint browser: true*/
window.tracking = window.tracking || {};
window.$CU = window.$CU || {};
(function (tracking, $CU) {
    "use strict";
    var segmentMethods, currentAnonymousId, c2, c1, cudec;

    segmentMethods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "group", "track", "ready", "alias", "page", "once", "off", "on"];

    cudec = {_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", a: function (c) {for (var a = "", b, d, h, f, g, e = 0, c = c.replace(/[^A-Za-z0-9\+\/\=]/g, ""); e < c.length;)b = this._keyStr.indexOf(c.charAt(e++)), d = this._keyStr.indexOf(c.charAt(e++)), f = this._keyStr.indexOf(c.charAt(e++)), g = this._keyStr.indexOf(c.charAt(e++)), b = b << 2 | d >> 4, d = (d & 15) << 4 | f >> 2, h = (f & 3) << 6 | g, a += String.fromCharCode(b), 64 != f && (a += String.fromCharCode(d)), 64 != g && (a += String.fromCharCode(h)); a = cudec.b(a); return a = eval("(" + a + ")"); }, b: function (c) { for (var a = "", b = 0, d = c1 = c2 = 0; b < c.length;)d = c.charCodeAt(b), 128 > d ? (a += String.fromCharCode(d), b++) : 191 < d && 224 > d ? (c2 = c.charCodeAt(b + 1), a += String.fromCharCode((d & 31) << 6 | c2 & 63), b += 2) : (c2 = c.charCodeAt(b + 1), c3 = c.charCodeAt(b + 2), a += String.fromCharCode((d & 15) << 12 | (c2 & 63) << 6 | c3 & 63), b += 3); return a }};
    tracking.cudec = cudec;
    function insertTrackingScript(src, onloadCallback) {
        var e, s;
        e = document.createElement('script');
        e.src = src;
        e.async = true;
        e.type = "text/javascript";
        if (onloadCallback !== undefined) {
            e.onload = onloadCallback;
        }
        s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(e, s);
    }

    function trackEvent(page, event, section, extra, companyId, callback) {
        /* deprecated but put here for backward compatability */
        var properties = {
            nonInteraction: 1, /* tells Google Analytics to not include this in bounce rate stats */
            section: section,
            extra: extra,
            companyId: companyId
        };
        tracking.track(event, properties, callback);
    }

    function setDefault(properties, key, defaultValue) {
        if (key in properties && properties[key]) {
            return String(properties[key]).trim();
        }
        return defaultValue;
    }

    function cuTrackingEvent(event, properties, callback) {
        if (!window.location.origin) {
            window.location.origin = window.location.protocol + "//" + window.location.host;
        }

        var data = {
            page: document.URL.replace(window.location.origin, ''),
            event: event,
            section: setDefault(properties, 'section', ''),
            extra: setDefault(properties, 'extra', ''),
            company_id: setDefault(properties, 'companyId', ''),
            properties: properties
        };

        window.jQuery.ajax({
            url: '/track/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: callback || function () {
                return undefined;
            }
        });
    }


    function wrapSegmentApi() {
        var t, em, analytics;
        analytics = window.analytics;
        for (t = 0; t < segmentMethods.length; t += 1) {
            em = segmentMethods[t];
            tracking[em] = analytics[em];
        }

        tracking.track = function (event, properties, options, fn) {
            if (typeof options === "function") {
                fn = options;
                options = null;
            }
            if (typeof properties === "function") {
                fn = properties;
                options = null;
                properties = null;
            }

            properties = properties || {};
            properties.nonInteraction = 1; // don't affect google bounce rate

            options = options || {};
            options.anonymousId = currentAnonymousId;  // track with our visitor id

            analytics.track(event, properties, options, fn);
            cuTrackingEvent(event, properties);
        };

        tracking.page = function (category, name, properties, options, fn) {
            if (typeof options === "function") {
                fn = options;
                options = null;
            }
            if (typeof properties === "function") {
                fn = properties;
                options = properties = null;
            }
            if (typeof name === "function") {
                fn = name;
                options = properties = name = null;
            }
            if (typeof category === "object") {
                options = name;
                properties = category;
                name = category = null;
            }
            if (typeof name === "object") {
                options = properties;
                properties = name;
                name = null;
            }
            if (typeof category === "string" && typeof name !== "string") {
                name = category;
                category = null;
            }

            options = options || {};
            options.anonymousId = currentAnonymousId; // track with our visitor id

            analytics.page(category, name, properties, options, fn);
        };

        tracking.user = analytics.user;
        tracking.ready = analytics.ready;
    }

    function buildPreloadSegmentApi() {
        var analytics, t, em;
        analytics = window.analytics = window.analytics || [];
        if (!analytics.initialize) {
            if (analytics.invoked) {
                if (window.console && window.console.error) {
                    window.console.error("Segment snippet included twice.");
                }
            } else {
                analytics.invoked = !0;
                analytics.methods = segmentMethods;
                analytics.factory = function (t) {
                    return function () {
                        var e = Array.prototype.slice.call(arguments);
                        e.unshift(t);
                        analytics.push(e);
                        return analytics;
                    };
                };
                for (t = 0; t < analytics.methods.length; t += 1) {
                    em = analytics.methods[t];
                    analytics[em] = analytics.factory(em);
                }
                analytics.SNIPPET_VERSION = "3.0.1";
            }
            window.analytics = analytics;
        }
    }


    function prepareSegment(segmentWriteKey, anonymousId) {
        var segmentSrc;
        currentAnonymousId = anonymousId;

        buildPreloadSegmentApi();
        wrapSegmentApi();

        segmentSrc = ("https:" === document.location.protocol ? "https://" : "http://") + "cdn.segment.com/analytics.js/v1/" + segmentWriteKey + "/analytics.js";

        insertTrackingScript(segmentSrc, function () {
            wrapSegmentApi();
            tracking.user().anonymousId(anonymousId);
        });
    }

    tracking.prepareSegment = prepareSegment;
    tracking.insertTrackingScript = insertTrackingScript;
    $CU.trackEvent = trackEvent;

}(window.tracking, window.$CU));
