(function ($) {
    "use strict";

    $(document).ready(function () {
        // simple plugin that is intended to be attached to hidden HTML inputs.
        // stores a list of objects in memory and keeps this list synced
        // as json with its underlying input value so they can be
        // conveniently submitted back to the server as JSON
        $.widget("circleup.listInput", {
            _create: function () {
                var initJson = this.element.attr('value');
                if (initJson) {
                    this.list = $.parseJSON(initJson);
                } else {
                    this.list = [];
                }
            },
            sync: function () {
                // syncs the contents of "list" to "value" attribute of
                // underlying input element, as json
                var old_value, new_value;
                old_value = this.element.attr('value');
                new_value = JSON.stringify(this.list);
                this.element.attr("value", JSON.stringify(this.list));
                if (old_value !== new_value) {
                    this.element.trigger('change');
                }
            },
            // called when created, and later when changing options
            add: function (obj) {
                this.list.push(obj);
                this.sync();
            },
            get: function () {
                return this.list;
            },
            change: function () {
                this.element.trigger('change');
            },
            'delete': function (obj) {
                var index = this.list.indexOf(obj);
                if (index != -1) {
                    this.list.splice(index, 1);
                    this.sync();
                }
            }
        });

         $.widget("circleup.jsonInput", {
            _create: function () {
                var initJson = this.element.attr('value');
                if (initJson) {
                    this.obj = $.parseJSON(initJson);
                } else {
                    this.obj = null;
                }
            },
            _sync: function () {
                // syncs the contents of "list" to "value" attribute of
                // underlying input element, as json
                var value = JSON.stringify(this.obj) || "";
                this.element.attr("value", value);
                this.element.trigger('change');
            },
            // called when created, and later when changing options
            set: function (obj) {
                this.obj = obj;
                this._sync();
            },
            get: function () {
                return this.obj;
            },
            change: function () {
                this.element.trigger('change');
            }
        });

    });
}(window.jQuery));

// Namespacing approach: http://stackoverflow.com/a/5947280/1450683
(function ($, $CU) {
    "use strict";
    var ajaxInProgress = {},
        fbLoaded = false,
        linkedinLoaded = false;

    $.fn.exists = function () {
        return this.length !== 0;
    };

    /**
     * Get a cookie
     * @param name
     * @return the cookie value
     */
    function getCookie(name) {
        var cookieValue, cookies, cookie, i;
        cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            cookies = document.cookie.split(';');
            for (i = 0; i < cookies.length; i += 1) {
                cookie = $.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    /**
     * Get a hash/dictionary of all the GET parameters in the URL
     * @returns {{}}
     */
    function getGetDictionary(){
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }

    function loadJS(src, id) {
        var e, s;
        e = document.createElement('script');
        e.src = src;
        e.async = true;
        e.type = "text/javascript";
        if (id) {
            e.id = id;
        }
        s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(e, s);
    }


    function displayError(msg) {
        if (!msg) {
            msg = 'Sorry, an error occurred. Please try again later.';
        }
        noty({
            text: msg,
            type: 'error',
            layout: 'topCenter',
            theme: 'noty_theme_circleup'
        });
    }

    function displayInfo(msg) {
        noty({
            text: msg,
            type: 'success',
            layout: 'topCenter',
            theme: 'noty_theme_circleup'
        });
    }

    var _ajaxCall = function(url, success, data, type, async) {
        type = (typeof type === "undefined") ? "post" : type;
        async = (typeof async === "undefined") ? true : async;
        return $.ajax({
            url: url,
            dataType: "json",
            type: type,
            data: data,
            async: async,
            success: function (data) {
                if (data.status === "success") {
                    if (success) {
                        success(data.obj);
                    }
                } else {
                    displayError(data.reason);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (textStatus != "abort" && !jqXHR.isRejected())
                    displayError();
            }
        });

    }

    function ajax(url, success, data, type) {
        // make ajax calls to server in a standard way
        return _ajaxCall(url, success, data, type, true);
    }

    function ajaxSynchronous(url, success, data, type) {
        return _ajaxCall(url, success, data, type, false);
    }

    // Mapping of namespace to last ajax call in that namespace
    function ajaxOnce(namespace, url, success, data, type) {
        // block callback of previous ajax calls in the same namespace that may be in progress
        var xhr;

        // Abort previous call if it exists
        if (ajaxInProgress[namespace]) {
            ajaxInProgress[namespace].abort();
        }

        xhr = ajax(url, success, data, type);
        ajaxInProgress[namespace] = xhr;

    }

    // Ajax but return a promise.
    function ajaxPromise(settings){
        // Take a settings dictionary for a $.ajax call.
        //  Handle our weird case where errors return 200 but data.status == 'error'

        var deferred = $.Deferred();
        var oldSuccess = settings.success || function(){}
        var oldError = settings.error || function(){}

        settings.success = function(data, textStatus){
            if (data.status == "error"){
                settings.error(null, data.reason);
                deferred.reject(data.reason);
            }else{
                oldSuccess(data, textStatus);
                deferred.resolve(data.obj);
            }
        };

        settings.error = function(request, textStatus, errorThrown){
            oldError(request, textStatus, errorThrown);
            deferred.reject(textStatus);
        };

        $.ajax(settings);

        return deferred.promise();
    }

    // Better Strict XHTML compliance for links to external websites.
    function prepareExternalLinks() {
        $("a[rel=external]").attr("target", "_blank");
    }

    function prepareTooltips() {
        var tooltipEls = $('[rel=tooltip]');
        if (typeof tooltipEls.tooltip === 'function') {
            tooltipEls.tooltip();
        } else {
            console.warn('Tooltip JS library was not loaded before main.js');
        }
    }

    function prepareAutoGrow() {
        $("textarea[autogrow]").each(function () {
            $(this).autogrow();
        });
    }

    // Prepare text boxes that contain watermarks.
    function prepareWatermarks() {
        var test, active, $textElements;
        test = document.createElement('input');
        $.support.placeholder = ('placeholder' in test);

        if (!$.support.placeholder) {
            active = document.activeElement;
            $textElements = $(':text, textarea');
            $textElements.focus(function () {
                var $this = $(this);
                if ($this.attr('placeholder') !== undefined && $this.attr('placeholder') !== '' && $(this).val() === $this.attr('placeholder')) {
                    $this.val('').removeClass('hasPlaceholder');
                }
            }).blur(function () {
                var $this = $(this);
                if ($this.attr('placeholder') !== undefined && $this.attr('placeholder') !== '' && ($this.val() === '' || $this.val() === $this.attr('placeholder'))) {
                    $this.val($(this).attr('placeholder')).addClass('hasPlaceholder');
                }
            });
            $textElements.blur();
            $(active).focus();
            $('form').submit(function () {
                $(this).find('.hasPlaceholder').each(function () {
                    $(this).val('');
                });
            });
        }
    }

    function prepareFollowButtons() {
        function followBtnClicked(){
            $(".followBtn").hide();
            $(".unfollowBtn").show();
            $('.btn-follow').addClass('following');
        }
        function unfollowBtnClicked(){
            $(".unfollowBtn").hide();
            $(".followBtn").show();
            $('.btn-follow').removeClass('following');
        }

        $(".followBtn").click(function (event) {
            var link = $(this);
            $.get(link.attr('href'), function (data) {
                followBtnClicked();
            });
            event.preventDefault();
        });
        $(".unfollowBtn").click(function (event) {
            var link = $(this);
            $.get(link.attr('href'), function (data) {
                unfollowBtnClicked();
            });
            event.preventDefault();
        });

        $('.btn-follow[data-company-slug]').click(function(event){
            var $that = $(this);
            var company_slug = $(this).data('company-slug');
            var is_following = $(this).hasClass('following');
            var url_partial = is_following ? "unfollow" : "follow" ;

            $.get('/c/' + company_slug + '/' + url_partial + '/', function (data) {
                if(is_following){
                    $that.removeClass('following');
                    unfollowBtnClicked();
                }else{
                    $that.addClass('following');
                    followBtnClicked();
                }
            });
            event.preventDefault();
        })
    }

    /* Prepare fancybox modals */
    function prepareFancyBoxes() {
        if ($().fancybox) {
            $('.fancybox').fancybox({
                modal: true,
                onStart: function (event) {
                    if (event.length > 0) {
                        var theHref = event[0];
                        $CU.trackEvent(theHref.href, 'Modal view', theHref.hash, $(theHref).text(), '');
                    }
                }
            });
            $('[data-fancybox-close=true]').click(function () {
                parent.jQuery.fancybox.close();
                return false;
            });
            /* intend to eventually transition above to this. prefer hooking events to data-xxx attributes
             over styles. modal: true hides the close button and we want that in this hook.
             */
            $('[data-fancybox]').fancybox({
                onStart: function (event) {
                    if (event.length > 0) {
                        var theHref = event[0];
                        $CU.trackEvent(theHref.href, 'Modal view', theHref.hash, $(theHref).text(), '');
                    }
                }
            });

            // some pages now use newer version of fancybox (older one looks terrible on bootstrap3).
            // probably can eventually move everything to the newer fancybox but retaining old one
            // until we can do thorough regression tests
            if($.fancybox2) {
                $('[data-fancybox2]').fancybox2({
                    onStart: function (event) {
                        if (event.length > 0) {
                            var theHref = event[0];
                            $CU.trackEvent(theHref.href, 'Modal view', theHref.hash, $(theHref).text(), '');
                        }
                    }
                });
            }
        }

    }

    $CU.preparePopovers = preparePopovers;
    $CU.keepPopoversOpenOnHover = keepPopoversOpenOnHover;
    $CU.preparePopoverDismissalUponExternalClick = preparePopoverDismissalUponExternalClick;

    function keepPopoversOpenOnHover(){
        var originalLeave = $.fn.popover.Constructor.prototype.leave;
        $.fn.popover.Constructor.prototype.leave = function(obj){
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
            var container, timeout;

            originalLeave.call(this, obj);

            if(obj.currentTarget) {
                container = $(obj.currentTarget).siblings('.popover');
                timeout = self.timeout;
                container.one('mouseenter', function(){
                    //We entered the actual popover – call off the dogs
                    clearTimeout(timeout);
                    //Let's monitor popover content instead
                    container.one('mouseleave', function(){
                        $.fn.popover.Constructor.prototype.leave.call(self, self);
                    });
                })
            }
        };
    }

    function preparePopovers() {
        // globally set popovers on all elements with rel=popover
        var $popoverElements = $('[rel=popover]');
        if (typeof $popoverElements.popover === 'function') {
            $popoverElements.not('input, select, textarea').popover({
                delay: {show: 50, hide: 200},
                placement: function (context, source) {
                    var position = $(source).position();

                    if (position.left < 515 && position.top > 400) {
                        return "right";
                    }

                    if (position.left > 515 && position.top > 400) {
                        return "left";
                    }

                    if (position.top < 400) {
                        return "bottom";
                    }

                    return "top";
                }
            });
            $popoverElements.filter('input, select, textarea').popover({trigger: 'focus'});

        } else {
            console.warn('Popover JS library was not loaded before main.js');
        }
    }

    function preparePopoverDismissalUponExternalClick(){
        $('body').on('click', function (e) {
            $('[rel="popover"]').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    }

    /**
     * Any pre-ajax setup (currently just CSRF token) before sending
     */
    function ajaxBeforeSend(xhr, settings) {
        var csrf_token = getCookie('csrftoken');

        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrf_token);
        }
    }

    /**
     * AJAX calls will automatically send the csrf token because of this code.
     */
    function prepareAjaxCSRF() {

        $.ajaxSetup({
            crossDomain: false, // obviates need for sameOrigin test
            beforeSend: ajaxBeforeSend
        });
    }

    /**
     * An attempt at creating a generalized way of exchanging ajax information with the
     * server. Any data you want to send should be an attribute on the element. For example
     * data-email="test@circleup.com".
     */
    function prepareAjaxActionButtons() {
        $('body').on('click', 'button.post-ajax, a.post-ajax', function (event) {
            var $this, data, url, success;
            $this = $(this);
            data = $this.data();
            url = $this.attr('href');

            displayInfo('Working...');

            $this.attr('disabled', 'disabled');
            success = function (returnData) {
                if (returnData && returnData.hasOwnProperty('new_button_text')) {
                    //noinspection JSUnresolvedVariable
                    $this.text(returnData.new_button_text);
                }
                if (returnData && returnData.hasOwnProperty('completion_message')) {
                    //noinspection JSUnresolvedVariable
                    displayInfo(returnData.completion_message);
                }
                $this.removeAttr('disabled');
            };

            $CU.ajax(url, success, data);

            event.preventDefault();
            event.stopPropagation();
            return false;
        });
    }


    function prepareFacebook() {
        var fbAppId;
        if (!fbLoaded) {
            fbAppId = $('#fb-root').data('fb-app-id');
            window.fbAsyncInit = function () {
                FB.init({
                    appId: fbAppId, // App ID
                    version: 'v2.3',
                    status: true, // check login status
                    cookie: true, // enable cookies to allow the server to access the session
                    xfbml: true  // parse XFBML
                });
            };
            loadJS('//connect.facebook.net/en_US/sdk.js', 'facebook-jssdk');
            fbLoaded = true;
        }
    }

    function prepareLinkedin() {
        if (!linkedinLoaded) {
            loadJS('//platform.linkedin.com/in.js');
            linkedinLoaded = true;
        }
    }

    function prepareFileAttachWidgets() {
        var $fileAttachElements = $('[data-fileattach-widget]');
        if (typeof $fileAttachElements.fileattach === 'function') {
            $fileAttachElements.fileattach();
        } else {
            console.warn("Fileattach JS was not loaded before main.js was executed.");
        }
    }

    function prepareListInputs() {
        var $listInputElements = $('[data-list-input]');
        if (typeof $listInputElements.listInput === 'function') {
            $listInputElements.listInput();
        } else {
            console.warn("listInput JS was not loaded before main.js was executed.");
        }
    }

    function preparePageData() {
        var pageData = {},
            pageJson = $('#page-data').html();
        if (pageJson) {
            pageData = $.parseJSON(pageJson);
        }
        $CU.pageData = pageData;
    }

    function prepareHideAlertAction() {
        $('.premoney_val_alert button.close').on('click', function (e) {
            ajax('/companies/hide-premoney-alert/', null, {});
        });
    }

//	function prepareNavCollapseToggle() {
//		// Implement navbar reveal/collapse toggle button
//		// This is a workaround for the bootstrap functionality broken by the unevent library
//		$('.navbar-collapse-toggle').on('click', function(e) {
//			var target = $(this).data('target');
//			$(target).slideToggle(200);
//		});
//	}

    function prepareMobileNav() {
        $('.navbar-collapse').css('max-height', $(window).height() - 50);
        $(window).on('resize', function() {
            $('.navbar-collapse').css('max-height', $(window).height() - 50);
        });
    }

    function isElementInViewport (el) {
        // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
        //special bonus for those using jQuery
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    }

    function testInvestorFeedbackModals(){
        var getParams = getGetDictionary();
        if(getParams['alreadycompletedfeedback'] == 'true'){
            $('#alreadycompletedfeedback').modal('show');
        }
        if(getParams['feedbackthanks'] == 'true'){
            $('#feedbackthanks').modal('show');
        }
    }

    function updateCounter(key, limit) {
        ajax('/track/counter/', function(e) {}, {'key': key, 'limit': limit});
    }

    function prepareNewFeatureNotificationModal(shouldShowModal, modalSelector, userCounterKey) {
        if(shouldShowModal) {
            $(modalSelector).modal();
            $CU.updateCounter(userCounterKey, 1);
        }
    }

    function unmask(value) {
        value = value.replace(/,/g, '')
        value = value.replace(/$/g, '')
        return parseFloat(value)
    }

    $(document).ready(function () {
        testInvestorFeedbackModals();
        preparePageData();
        prepareExternalLinks();
        prepareWatermarks();
        prepareAutoGrow();
        prepareTooltips();
        prepareFollowButtons();
        prepareFancyBoxes();
        if($CU.pageData.popover_hover_persist){
            keepPopoversOpenOnHover();
        }
        preparePopovers();
        prepareAjaxCSRF();
        prepareAjaxActionButtons();
        prepareFileAttachWidgets();
        prepareListInputs();
        prepareHideAlertAction();
        prepareMobileNav();
    });

    $(window).load(function () {
        prepareFacebook();
        prepareLinkedin();
    });

    $CU.isElementInViewport = isElementInViewport;
    $CU.displayError = displayError;
    $CU.displayInfo = displayInfo;
    $CU.ajax = ajax;
    $CU.ajaxSynchronous = ajaxSynchronous;
    $CU.ajaxOnce = ajaxOnce;
    $CU.ajaxBeforeSend = ajaxBeforeSend;
    $CU.ajaxPromise = ajaxPromise;
    $CU.getCookie = getCookie;
    $CU.loadJS = loadJS;
    $CU.prepareFacebook = prepareFacebook;
    $CU.prepareLinkedin = prepareLinkedin;
    $CU.updateCounter = updateCounter;
    $CU.prepareNewFeatureNotificationModal = prepareNewFeatureNotificationModal;
    $CU.unmask = unmask;
}(window.jQuery, window.$CU = window.$CU || {}));

// Namespacing approach: http://stackoverflow.com/a/5947280/1450683
/*jslint browser: true*/
window.$CU = window.$CU || {};
window.tracking = window.tracking || {};
(function ($, $CU, window, document, tracking) {
    "use strict";

    /*
     Important to capture company_document_id in case presentation is ever altered
     and re-uploaded post raise.
     */
    function trackPresentationPageEvent(company_id, company_document_id, box_document_id, page, num_pages) {
        $.ajax({
            url: '/track/presentation/',
            data: {
                page: page,  // the page number. completely different from 'page' in track()
                num_pages: num_pages,
                company_id: company_id,
                company_document_id: company_document_id,
                box_document_id: box_document_id
            }
        });
    }


    function prepareBootstrapTracking() {
        // Modal Tracking
        $('.modal').on('show.bs.modal', function (event) {
            var $modalDiv, $sourceLink;
            $modalDiv = $(this);
            $sourceLink = $(event.relatedTarget);
            tracking.track('Modal view', {
                section: $modalDiv.attr('id'),
                extra: $sourceLink.text(),
                modalId: $modalDiv.attr('id'),
                triggerElementText: $sourceLink.text()
            });
        }).on('hide.bs.modal', function (event) {
            var $modalDiv, $sourceLink;
            $modalDiv = $(this);
            $sourceLink = $(event.relatedTarget);
            tracking.track('Modal dismiss', {
                section: $modalDiv.attr('id'),
                extra: $sourceLink.text(),
                modalId: $modalDiv.attr('id'),
                triggerElementText: $sourceLink.text()
            });
        });
    }


    function prepareTabTracking() {
        $('#tabMenu').on('click keypress', "a[data-toggle='tab']", function (event) {
            var theHref, code;
            theHref = this;
            code = event.charCode || event.keyCode;
            if (!code || (code && code === 13)) {
                $CU.trackEvent(this.href, 'Tab click', $(theHref).attr('data-target'), $(theHref).text(), null);
            }
        });
    }

    function prepareExternalLinkTracking() {
        var company_id = $CU.pageData.company_id; // for document downloads
        $('body').on('click keypress', "a", function (event) {
            var code, theHref;
            theHref = this;
            if (theHref.hostname && theHref.hostname !== window.location.hostname) {
                $(theHref).attr('target', '_blank');
                code = event.charCode || event.keyCode;
                if (!code || (code && code === 13)) {
                    $CU.trackEvent(this.href, 'Outgoing link click', theHref.hash, $(theHref).text(), company_id);
                }
            }
        });
    }

    function isScrolledIntoView(elem) {
        var docViewTop, docViewBottom, elemTop, elemBottom;
        docViewTop = $(window).scrollTop();
        docViewBottom = docViewTop + $(window).height();
        elemTop = $(elem).offset().top;
        elemBottom = elemTop + $(elem).height();

        // any part is on the page
        return (((elemTop <= docViewBottom) && (elemTop >= docViewTop)) || ((elemBottom <= docViewBottom) && (elemBottom >= docViewTop)));

        // whole thing is on the page
        //return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    function elementsOnScreenFilter(elems) {
        var onScreenElements = [];
        $.each(elems, function () {
            if (isScrolledIntoView(this)) {
                onScreenElements.push(this);
            }
        });
        return onScreenElements;
    }

    function arrayDiff(a, b) {
        return a.filter(function (i) {
            return b.indexOf(i) <= -1;
        });
    }

    function prepareElementViewedTracking(event_name) {
        var $trackedElements, onScreenSections, onScreenSectionsPrevious, companyId;
        companyId = $CU.pageData.company_id; // for document downloads
        onScreenSectionsPrevious = [];
        $trackedElements = $('[data-track-section]');

        function trackNewElementsOnScreen() {
            var onScreenElements, newlySeenSections;
            onScreenSections = [];
            onScreenElements = elementsOnScreenFilter($trackedElements);
            $.each(onScreenElements, function () {
                onScreenSections.push($(this).data('track-section'));
            });
            // for debugging
            //$trackedElements.css('background-color', 'white');
            //$(onScreenElements).css('background-color', '#E3CAD2');
            newlySeenSections = arrayDiff(onScreenSections, onScreenSectionsPrevious);
            if (!event_name) {
                event_name = 'Section view';
            }
            $.each(newlySeenSections, function () {
                $CU.trackEvent(window.location.pathname, event_name, this, '', companyId);

            });
            onScreenSectionsPrevious = onScreenSections;
        }

        trackNewElementsOnScreen();
        // This delay syntax is from jquery.unevent.js; prevents firing more than once within the interval
        $(document).on2('scroll', trackNewElementsOnScreen, 250);
    }

    $(document).ready(function () {
        prepareTabTracking();
        prepareBootstrapTracking();
        prepareExternalLinkTracking();
    });


    $CU.prepareElementViewedTracking = prepareElementViewedTracking;
    $CU.elementsOnScreenFilter = elementsOnScreenFilter;
    $CU.trackPresentationPageEvent = trackPresentationPageEvent;
    $CU.isScrolledIntoView = isScrolledIntoView;


}(window.jQuery, window.$CU, window, document, window.tracking));

(function($, $CU) {

    var shouldShow = typeof showErrors !== 'undefined';
    $CU.errors = [], $CU.errorCount = 0, $CU.uniqueErrorMap = {};
    if(shouldShow === false) {
        $CU.errorHandler = handleError;
        window.onerror = handleError;
    }
    var ERROR_REPORTING_RATE = 7500;
    var errorKeyRegex = /circleup|angular|localhost/;

    function handleError(msg, url, line, col, errorObj, type){

        if(/script error/i.test(msg)) {
            return; //Error loading external script.
        }

        var validSourceURL = errorObj ? errorObj.sourceURL || null : null; //Only Safari uses this key

        var bugData = {
            'error_message': msg || errorObj.message || null, //Otherwise they'll be undefined
            'file_name': url || validSourceURL ||  null,
            'line_number': line || errorObj.line || null,
            'column': col || errorObj.column || null
        };
        bugData.stack_trace = errorObj ? errorObj.stack || null : null; //Not all browsers pass in error object

        bugData.type = type || "javascript"; //Angular errors will have type defined
        if(bugData.file_name && errorKeyRegex.test(bugData.file_name)) { //Only want CircleUp errors
            processError(bugData);
        } else if(errorKeyRegex.test(bugData.stack_trace)) {
            bugData.file_name = "Angular";
            processError(bugData);
        }
    }

    function processError(errorObj){

        $.extend(errorObj, {
            visitors_url: document.URL
        });
        var uniqueErrorString = errorObj.error_message + errorObj.file_name;
        if(!$CU.uniqueErrorMap[uniqueErrorString]){
            $CU.uniqueErrorMap[uniqueErrorString] = 1;
            $CU.errors.push(errorObj);
        }
    }

    setInterval(function(){
        if($CU.errors.length) {
            reportError();
        }
    }, ERROR_REPORTING_RATE);

    function reportError() {
        $CU.ajax("/a/bugs/client/", null, JSON.stringify({'errors': $CU.errors}));
        $CU.errors = [];
    }

}(window.jQuery, window.$CU = window.$CU || {}));





(function ($) {
    "use strict";
    $.widget("circleup.fileattach", {
        _FILE_TYPES: {
            'PDF': {
                name: 'PDF',
                icon: "/static/images/company-hub/PDF-icon.png",
                icon_dim: "/static/images/company-hub/PDF-icon-dim.png",
                extensions: ["pdf"]
            },
            'Excel': {
                name: 'Excel',
                icon: "/static/images/company-hub/XLS-icon.png",
                icon_dim: "/static/images/company-hub/XLS-icon-dim.png",
                extensions: ["xls", "xlsx", "csv"]
            },
            'Powerpoint': {
                name: 'Powerpoint',
                icon: "/static/images/company-hub/PPT-icon.png",
                icon_dim: "/static/images/company-hub/PPT-icon-dim.png",
                extensions: ["ppt", "pptx"]
            },
            'Word': {
                name: 'Word',
                icon: "/static/images/company-hub/DOC-icon.jpg",
                icon_dim: "/static/images/company-hub/DOC-icon-dim.jpg",
                extensions: ["doc", "docx"]
            },
            'Image': {
                name: 'Image',
                icon: "/static/images/company-hub/image-icon.jpg",
                icon_dim: "/static/images/company-hub/image-icon-dim.jpg",
                extensions: ["png", "jpg", "gif", "jpeg"]
            }
        },

        _getTypeByExtension: function(extension) {
            for(var filetypename in this._FILE_TYPES) {
                if(this._FILE_TYPES[filetypename].extensions.indexOf(extension) != -1) {
                    return this._FILE_TYPES[filetypename];
                }
            }
            return null;
        },

        _getFileTypeOptions: function() {
            var options = [];
            var optionExtensions = this.element.attr('data-fileTypeOptions').split(',');
            for(var i=0; i<optionExtensions.length; i++) {
                var filetype;
                filetype = this._getTypeByExtension(optionExtensions[i]);
                if(filetype) {
                    options.push(filetype);
                }
            }
            return options;
        },

        // the constructor
        _create: function () {
            var source = $("#fileattach-widget-template").html();
            var extension, s3url;
            this.template = Handlebars.compile(source);
            this.data = {};
            this.data.fileTypeOptions = this._getFileTypeOptions();
            this.data.docTemplateUrl = this.element.attr('data-example-url');
            this.data.docTemplateText = this.element.attr('data-example-text');

            s3url = this.element.attr('data-s3url');
            if(s3url){
                extension = s3url.split('.').pop();
                this.data.filename = s3url.split('/').pop();
                this.data.s3url = s3url.replace(this.data.filename, encodeURIComponent(this.data.filename));
                this.data.currentFileType = this._getTypeByExtension(extension);
            }
            this._refresh();
        },

        // called when created, and later when changing options
        _refresh: function () {
            var html = this.template(this.data);
            $(this.element).html(html);
        },

        done: function (s3url) {
            var extension;
            if(s3url) {
                extension = s3url.split('.').pop();
                this.data.filename = s3url.split('/').pop();
                this.data.s3url = s3url.replace(this.data.filename, encodeURIComponent(this.data.filename));
                this.data.currentFileType = this._getTypeByExtension(extension);
                this._refresh();
            }
        }
    });
}(window.jQuery));

/*jslint browser: true*/
window.$CU = window.$CU || {};
(function ($, $CU) {
    "use strict";

    // Global variable to hold last form ajax submission
    var lastAjaxSubmission = 'undefined';

    /**
     * Add a date calendar to date for fields.
     */
    function prepareDateCalendars() {
        //noinspection JSUnresolvedFunction
        $('input.date, input[type=date]').datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "yy-mm-dd"
        });

        $('input.datetime, input[type=datetime]').each(function () {
            $(this).datetimepicker({
                dateFormat: "yy-mm-dd",
                timeFormat: 'HH:mm',
                changeMonth: true,
                changeYear: true,
                hour: $(this).data('hour'),
                minute: $(this).data('minute'),
                second: $(this).data('second')
            });
        });
    }

    /**
     * Creates an overlay directly over a form - preventing it's use while an ajax request completes.
     * @param form
     */
    function blockForm(form) {
        var $form, $div, $submitButton, $spinner, spinSize;

        $form = $(form);

        if ($form.data('is-blocked')) {
            return;
        }
        $div = $('<div class="formBlocker"></div>');
        $div.css({
            position: 'absolute',
            top: $form.offset().top,
            left: $form.offset().left,
            width: $form.outerWidth(),
            height: $form.outerHeight(),
            backgroundColor: '#efefef'
        });
        $div.fadeTo(0, 0);
        $('body').append($div);
        $div.fadeTo(200, 0.0);
        $form.data('blocker', $div);

        // save existing style
        $submitButton = $form.data('last-button-clicked');

        if (!$submitButton) {
            $submitButton = $form.find('.submit-button');
        }

        spinSize = Math.min($submitButton.height(), $submitButton.width());
        spinSize -= 12;
        if (!($submitButton.is('button') && $submitButton.hasClass('spinner-fix'))) {
            if ($submitButton.is('a')) {
                $submitButton.css({
                    width: $submitButton.width(),
                    height: $submitButton.height()
                });
            } else {
                $submitButton.css({
                    width: $submitButton.outerWidth(),
                    height: $submitButton.outerHeight()
                });
            }
        }

        $submitButton.data('original-contents', $submitButton.html());

        $spinner = $('<div class="spinner"></div>');

        $spinner.height(spinSize);
        $spinner.width(spinSize);
        $submitButton.empty();
        $submitButton.append($spinner);
        $submitButton.addClass('disabled');
        $form.data('is-blocked', true);
    }

    /**
     * Removes the overlay placed over a form
     * @param form
     */
    function unblockForm(form) {
        var $form, $submitButton;
        $form = $(form);
        if ($form.data('is-blocked')) {
            $form.data('blocker').remove();

            // save existing style
            $submitButton = $form.data('last-button-clicked');
            if (!$submitButton) {
                $submitButton = $form.find('.submit-button');
            }
            $submitButton.removeClass('disabled');
            $submitButton.html($submitButton.data('original-contents'));
            $form.data('is-blocked', false);
        }
    }

    function recordFormError(errorList) {
        var fieldErrors = [];
        $.each(errorList, function (index, data) {
            fieldErrors.push([ data.element.name, data.message, data.element.value ]);
        });
        $.post('/track/form-error/', {
            url: window.location.pathname,
            error_data: JSON.stringify(fieldErrors)
        });
    }

    function attachFormValidation(form, do_validate, override_settings) {
        var $form, errorClass, validClass, formControlCss, settings;

        $form = $(form);

        if ($form.data('form-validation-attached')) {
            return;
        }
        errorClass = "has-error";
        validClass = "has-success";
        formControlCss = '.control-group, .form-group';

        settings = {
            errorClass: errorClass,
            validClass: validClass,
            errorPlacement: function (error, element) {
                var inputWrapper, name;
                if (error.text() === '') {
                    return;
                }
                error.addClass('help-inline');
                if (element.is(":radio")) {
                    name = element.attr("name");

                    if (name && name !== "") {
                        element = $("input[name='" + name + "']").last();
                    }
                }
                if (!element.is(":checkbox")) {
                    inputWrapper = $(element).parent('.input-prepend, .input-append');
                    if (inputWrapper.length > 0) {
                        inputWrapper.after(error);
                    } else {
                        element.after(error);
                    }
                }
            },
            highlight: function (element, errorClass, validClass) {
                var $controlGroup = $(element).closest(formControlCss),
                    $elementToMark;
                if ($controlGroup.exists()) {
                    $elementToMark = $controlGroup;
                } else if (element.type === 'radio') {
                    $elementToMark = this.findByName(element.name);
                } else {
                    $elementToMark = $(element);
                }
                $elementToMark.addClass(errorClass).removeClass(validClass);
            },
            unhighlight: function (element, errorClass, validClass) {
                var $controlGroup, $errorList, $elementToMark;
                $controlGroup = $(element).closest(formControlCss);

                if ($controlGroup.exists()) {
                    $elementToMark = $controlGroup;
                } else if (element.type === 'radio') {
                    $elementToMark = this.findByName(element.name);
                } else {
                    $elementToMark = $(element);
                }
                $elementToMark.removeClass(errorClass);

                $errorList = $controlGroup.find('.errorlist');
                if ($errorList.exists()) {
                    $errorList.empty();
                }
            },
            invalidHandler: function (form, validator) {
                var firstElement = $(validator.errorList[0].element),
                    controlGroup = $(firstElement).closest(formControlCss);
                if (controlGroup.length > 0) {
                    firstElement = controlGroup;
                }
                recordFormError(validator.errorList);
                if (!$CU.isScrolledIntoView(firstElement)) {
                    $.scrollTo(firstElement, 400, {offset: -150});
                }
                firstElement.addClass(errorClass).removeClass(validClass);
                shakeElement(firstElement);
            }
        };

        if(override_settings !== "undefined") {
            $.extend(settings, override_settings);
        }
        $form.validate(settings);

        $form.find(".submit-button").each(function () {
            var $submitButton;
            $submitButton = $(this);

            $submitButton.click(function (event) {
                $form.data('last-button-clicked', $(this));
                if (!do_validate || $form.valid()) {
                    blockForm($form);
                    $form.submit();
                    return false;
                }
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
            });
        });

        $form.on('click', 'button, .btn', function () {
            $form.data('last-button-clicked', $(this));
        });

        $form.data('form-validation-attached', true);
    }

    /**
     * Submits a form via ajax and processes the response.
     * @param form
     * @param successHandler
     */
    function ajaxSubmit(form, successHandler, errorHandler, iframe) {
        var $form = $(form), doValidate;
        doValidate = $form.hasClass('validate');

        attachFormValidation($form, doValidate);

        errorHandler = errorHandler || $CU.displayError;
        iframe = iframe || false;

        $form.ajaxSubmit({
            dataType: 'json',
            iframe: iframe,
            beforeSend: function (xhr, settings) {
                $CU.ajaxBeforeSend(xhr, settings);
                if (lastAjaxSubmission !== 'undefined') {
                    // Abort last ajax
                    lastAjaxSubmission.abort();
                }
                lastAjaxSubmission = xhr;
                return true;
            },
            beforeSubmit: function () {
                if (!doValidate) {
                    return true;
                }
                if ($form.valid()) {
                    blockForm($form);
                    return true;
                }
                return false;
            },
            success: function (data) {
                unblockForm($form);
                if (data.status === "success") {
                    successHandler(data.obj);
                } else {
                    errorHandler(data.reason, data.error);
                }
            },
            error: function () {
                unblockForm($form);
                errorHandler();
            }
        });
    }

    /**
     * Converts a form into an ajax form with validation. Handles error messages from the server.
     * @param form A form.
     * @param successHandler The function to call if the submission was successful.
     */
    function ajaxForm(form, successHandler, errorHandler) {
        var $form = $(form);

        attachFormValidation($form, $form.hasClass('validate'));

        errorHandler = errorHandler || $CU.displayError;

        $form.ajaxForm({
            dataType: 'json',
            beforeSubmit: function () {
                if ($form.data('before-submit')) {
                    $form.data('before-submit')();
                }

                if ($form.valid()) {
                    blockForm($form);
                    return true;
                }
                return false;
            },
            success: function (data) {
                unblockForm($form);
                if (data.status === "success") {
                    successHandler(data.obj, $form);
                } else {
                    $CU.displayError(data.reason);
                }
            },
            error: function () {
                unblockForm($form);
                errorHandler();
            }
        });

        return false;
    }

    /**
     * Converts a form into an ajax form that automatically saves when input data has changed.
     * @param form
     * @param successHandler
     */
    function ajaxAutoForm(form, successHandler, errorHandler, iframe, override_settings, ignoreInputs) {
        var $form = $(form), selector;

        attachFormValidation($form, $form.hasClass('validate'), override_settings);

        errorHandler = errorHandler || $CU.displayError;
        iframe = iframe || false;


        selector = _(['input', 'textarea', 'select']).chain();
        if (typeof ignoreInputs !== 'undefined') {
            selector = selector.map(function (item) {
                return item + ':not(' + ignoreInputs + ')';
            });
        }

        selector = selector.reduce(function(memo, value){
            return memo + ', ' + value;
        }).value();

        $form.on('save', function () {
            $CU.ajaxSubmit(form, successHandler, errorHandler, iframe);
        });

        $form.on('change', selector, function () {
            $CU.ajaxSubmit(form, successHandler, errorHandler, iframe);
        });
    }

    function nl2br(str) {
        //noinspection JSLint
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
    }

    var shakeTimeoutPointer;
    function shakeElement(el) {
        var $el = $(el);
        $el.removeClass('animated shake');
        $el.addClass('animated shake');
        clearTimeout(shakeTimeoutPointer);
        shakeTimeoutPointer = setTimeout(function () {
            $el.removeClass('animated shake');
        }, 1000);
    }

    /*
     Finds the first form element with an error and draws attention to it by scrolling to it
     and shaking it. Pretty effective at reducing users not seeing the form errors.
     */
    function drawAttentionToFirstError(formContainer) {
        var $formContainer = formContainer || $('body'),
            firstElement = $formContainer.find(".control-group.error, .form-group.has-error").first();
        if (firstElement.exists()) {
            if (!$CU.isScrolledIntoView(firstElement)) {
                $.scrollTo(firstElement, 400, {offset: -150});
            }
            shakeElement(firstElement);
        }
    }


    // Prepare basic links as form submit buttons.
    function prepareFormValidation() {

        // change default
        $.extend($.validator.messages, {
            required: "",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            accept: "Please enter a value with a valid extension.",
            maxlength: $.validator.format("Please enter no more than {0} characters."),
            minlength: $.validator.format("Please enter at least {0} characters."),
            rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
            range: $.validator.format("Please enter a value between {0} and {1}."),
            max: $.validator.format("Please enter a value less than or equal to {0}."),
            min: $.validator.format("Please enter a value greater than or equal to {0}."),
            complete_url: "Please enter a valid URL."
        });

        $.validator.addMethod("must-check", function (value, element) {
            return $(element).is(":checked");
        }, "You must agree to this.");

        $.validator.addMethod("requireOnce", function (value, element, param) {
            var $fields = $(param, element.form),
                $fieldsFirst = $fields.eq(0),
                validator = $fieldsFirst.data("valid_req_grp") ? $fieldsFirst.data("valid_req_grp") : $.extend({}, this),
                isValid = $fields.filter(function () {
                        return validator.elementValue(this);
                    }).length >= 1;

            // Store the cloned validator for future validation
            $fieldsFirst.data("valid_req_grp", validator);

            // If element isn't being validated, run each require_from_group field's validation rules
            if (!$(element).data("being_validated")) {
                $fields.data("being_validated", true);
                $fields.each(function () {
                    validator.element(this);
                });
                $fields.data("being_validated", false);
            }
            return isValid;
        }, $.validator.format("You must select at least 1 option."));

        $('form.validate').each(function () {
            attachFormValidation(this, true);
        });
    }

    $(document).ready(function () {
        prepareDateCalendars();
        prepareFormValidation();
        // better to have pages opt-in to this behavior...
        // for now just at least providing flag to disable in preraise dashboard
        if (!$CU.pageData['NO_FIRST_ERROR_SHAKE']) {
            drawAttentionToFirstError();
        }
    });

    $CU.nl2br = nl2br;
    $CU.ajaxSubmit = ajaxSubmit;
    $CU.ajaxForm = ajaxForm;
    $CU.ajaxAutoForm = ajaxAutoForm;
    $CU.attachFormValidation = attachFormValidation;
    $CU.blockForm = blockForm;
    $CU.unblockForm = unblockForm;
    $CU.drawAttentionToFirstError = drawAttentionToFirstError;
    $CU.shakeElement = shakeElement;

}(window.jQuery, window.$CU));

/*************************************************
**  jQuery Quicktag, Version 1.0
**  Copyright Milos Sutanovac, licensed MIT
**  http://twitter.com/mixn
**  MODIFIED BY EVK FOR CIRCLEUP TO SUPPORT A
**  FIXED SET OF ALLOWED TAGS
**************************************************/
(function($){

	$.fn.quickTag = function(options){

		// Options
		options	= $.extend({

			limitation	: 	30,
			triggerKey	: 	13,
			allowedTags : 	5,
			focus		: 	false,
			coloring	: 	false,
			colors 		: 	['yellow', 'orange', 'red'],
			fade		: 	false,
			isForm 		: 	undefined,
			img 		: 	undefined,
			counter		: 	undefined,
			tagList		: 	$('#taglist'),
			notice		: 	undefined,
			tagClass	: 	'tag',
			closeClass	: 	'close',
			formField   :   undefined,
            permissibleTags: undefined
								
		}, options);		

		// Vars
		var	that 		= 	$(this),
			val			=	undefined,
			valLength	=	0,
			mainColor	=	undefined,
			colorSpots 	=	undefined;
			
		// Allow chaining, something like $('input').hide().quickTag().show() works now			
		return that.each(function(){
			
			// Built everything inside an object to secure overwriting
			var quickTag = {

				init		: 	function(){

					// Hide notice
					$(options.notice).hide();
					
					// Cache counters color if counter is enabled
					if($(options.counter)) mainColor = $(options.counter).css('color');

					// Check if counter is enabled
					if(options.counter && options.limitation){

						// Attach necessary keyup event
						this.keyUp();

						// Set maxlength for the inputfield
						$(that).attr('maxlength', options.limitation);

						// Set starting value for the counter div
						$(options.counter).text(options.limitation);
					}

					// Check if image replacement is true, if yes, overwrite the value with value as src attribute + img tag
					if(options.img) options.img = '<img src="' + options.img + '" alt="Close this tag" />';

					// Check if everything's inside a form, if yes, call secureSubmit function
					options.isForm && this.secureSubmit();
					
					if(options.coloring) options.colors.reverse();
					
					// Wenn the counter and the coloringoption are set - generate colorSpots and store the array inside a global var
					if(options.counter && options.coloring) colorSpots = this.setColoring();

					// Call all necessary functions
					this.keyDown(); this.deleteTag();
					
			
					if(options.formField) {
					  var values = options.formField.val().split(",");
					  for(var i = 0 ; i < values.length ; i++) {
					    if(values[i].length>0) this.addTag(values[i])
					  }
					}
					
				},

				keyDown		: 	function(){
                    function permissible(tag) {
                        var val = $(that).val();
                        for(var i=0; i<options.permissibleTags.length; i++) {
                            if(val == options.permissibleTags[i]) {
                                return true;
                            }
                        }
                        return false;
                    }
					
					// keyDown Event, Event as a parameter
					$(that).keydown(function(e){

						// If the pressed key is the triggerKey - add it as a Tag & reset inputLength
						if(e.keyCode === options.triggerKey){

							// triggerKey pressed
							if($(options.tagList).children().length < options.allowedTags){


								if($(that).val() != ""){


                                    if(permissible($(that).val())) {
                                        // Add Tag
                                        quickTag.addTag();

                                        // Reset counter value
                                        $(options.counter).text(options.limitation);

                                        // Reset input value
                                        $(that).val('');
                                        $(options.notice).hide();
                                    } else {
                                        quickTag.displayErr('Please use one of the tags given by autocomplete.');
                                    }
								}
								
								// If the triggerKey is fired inside a form, don't submit the form
								if(options.isForm) return false;
							}else{

								// display the Error
								quickTag.displayErr('A maximum of ' + options.allowedTags + ' is allowed.');

								// disable event if the key isn't the triggerKey
								return false;
							}
						}else if(options.counter && valLength >= options.limitation && e.keyCode !== options.triggerKey && e.keyCode !== 8){

							// >= limitation && pressed key != triggerKey && pressed key != Backspace
							return false;
						}
					});
				},

				keyUp		: 	function(){

					// keyUp Event, Event as a parameter
					$(that).keyup(function(e){
						
						// Cache the inputs length when key is released
						valLength = $(this).val().length;

						// Set new/current value of the counter
						if(e.keyCode !== options.triggerKey && options.counter) $(options.counter).text(options.limitation - valLength);
						
						// Check if coloring is true / see if css needs to be applied
						if(colorSpots){

							// Necessary, local vars
							var	colorNow 	= undefined,
								lastEntry 	= colorSpots.length - 1,
								rest 		= options.limitation - valLength;

							// Loop backwards? I can haz!
							for(var i = lastEntry; i >= 0; i--){

								if(rest <= colorSpots[i]) colorNow = options.colors[i];
							}

							// See if rest is bigger than last entry inside the array, if yes, overwrite color with mainColor
							if(rest > colorSpots[lastEntry]) colorNow = mainColor;
							
							// Apply color
							$(options.counter).css('color', colorNow);
						}
					});
				},

				addTag		: 	function(val){

					// Cache inputs value
					val = val || $(that).val();

					// Check if tag needs to be wrapped inside an li or div
				   	if($(options.tagList).is('ul')){

						// li - (options.img || 'x') checks whether an image-replacement is defined, if not use an 'x'
				   		$(options.tagList).append('<li tag="' + val + '" class="fmquicktag ' + options.tagClass + '"><a class="' + options.closeClass + '">' + (options.img || 'x') + '</a>' + ' ' + val + '</li>');
				   	}else if($(options.tagList).is('div')){

						// div - (options.img || 'x') checks whether an image-replacement is defined, if not use an 'x'
						$(options.tagList).append('<div tag="' + val + '" class="fmquicktag ' + options.tagClass + '"><a class="' + options.closeClass + '">' + (options.img || 'x') + '</a>' + ' ' + val + '</div>');
				   	}
				   	if(options.formField) {
				   		options.formField.val(this.addValue(options.formField.val(),val));
				   	}
				   	$(that).val('');
				},

				deleteTag	: 	function(){
					var qt = this;
					// This needs to be a live event since tags are generated on the fly
					$('.fmquicktag').live('click', function(){
						if(options.formField) {
					   		options.formField.val(qt.removeValue(options.formField.val(),$(this).attr('tag')));
					   	}
						// Remove tag & fade/hide notice if visible
						$(this).remove();

						// Fade/hide notice if visible
						($(options.notice).is(':visible') && options.fade) ? $(options.notice).stop(true, true).fadeOut(options.fade) : $(options.notice).hide();
						
						// If focus is true, refocus the inputfield
						options.focus && $(that).focus();

						// return false / don't jump to the top of the site
						return false;
					});
					
				},

				removeValue :   function(list,value,separator) {
				  separator = separator || ",";
				  var values = list.split(separator);
				  for(var i = 0 ; i < values.length ; i++) {
				    if(values[i] == value) {
				      values.splice(i, 1);
				      return values.join(separator);
				    }
				  }
				  return list;
				},
				
				addValue    :   function(list,value,separator){
				  separator = separator || ",";
				  var values = list.split(separator);
				  for(var i = 0 ; i < values.length ; i++) {
				    if(values[i] == value) {
				      return list;
				    }
				  }
				  return list+separator+value;
				},
				
				displayErr	: 	function(msg){

                    options.notice.text(msg);
					// Check if fade is enabled - if not, just show
					(options.fade) ? $(options.notice).stop(true, true).fadeIn(options.fade) : $(options.notice).show();
				},

				secureSubmit: 	function(){

					// Check if form has a submit button
					if($(options.isForm + ':has(input=[type=submit])')){

						// If it has one, cache it and set Eventhandler aka. submit *only* on click
						$(options.isForm)
							.find('input[type=submit]')
								.click(function(){ return true; });
					}
				},
				
				setColoring	: 	function(){
					
					// Local vars - colorableArea is the half of the limitation
					var colorableArea 	= 	Math.round(options.limitation),
						colorSpots		=	[];
					
					// Push the half of every half into an array so the coloring's dynamic
					for(var i = 0, z = 1; i < options.colors.length; i++){
						
						// Overwrite the var with its own value / 2
						colorableArea	=	Math.round(colorableArea / 2);
						
						// Check if the number is a 'nice' number (like 10, 15, 20), if not ...
						while(colorableArea % 5 != 0){
							
							// ... make it one
							colorableArea += z;
						}
						
						// Push rounded value into an array
					 	colorSpots.unshift(colorableArea);
					}
					
					// return the array
					return colorSpots;
				}
			};

			// Call init-function - this literally starts everything
			quickTag.init();
		});
	}
})(jQuery);
/**
 * jQuery Validation Plugin 1.9.0
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2011 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function ($) {
    "use strict";
    var safeStringToFloat = function (value) {
        return parseFloat(value.replace(",", ""));
    };

    /*
     * Fix JQuery Validation issue 188
     * https://github.com/jzaefferer/jquery-validation/issues/188
     */
    $.validator.methods.range = function (value, element, param) {
        return this.optional(element) || (safeStringToFloat(value) >= param[0] && safeStringToFloat(value) <= param[1]);
    };

    $.validator.methods.min = function (value, element, param) {
        return this.optional(element) || safeStringToFloat(value) >= param;
    };

    $.validator.methods.max = function (value, element, param) {
        return this.optional(element) || safeStringToFloat(value) <= param;
    };

}(window.jQuery));



(function ($, $CU) {
    "use strict";

    function tag($input, $output, fullTagList, $tagList, $button, $notice) {
        // autocomplete plugin from jquery UI
        $input.autocomplete({
            source: fullTagList,
            minLength: 0,
            delay: 0
        }).quickTag({
            tagList: $output,
            isForm: true,
            tagClass: 'tag-label ui-widget-content ui-state-default ui-corner-all',
            closeClass: 'tag-close',
            allowedTags: 10,
            formField: $tagList,
            notice: $notice,
            permissibleTags: fullTagList
        });

        $button.click(function (event) {
            event.preventDefault();
            var e = $.Event("keydown");
            e.which = 13; // # Some key code value
            e.keyCode = 13;
            $input.trigger(e);
            return false;
        });
    }

    $CU.tagging = tag;

}(window.jQuery, window.$CU = window.$CU || {}));

(function ($, $CU) {
    "use strict";

    $(".investor-howitworks-slides").slidesjs({
        width: 300,
        height: 266,
        generatePagination: false,
        navigation: {
            active: false
        },
        play: {
            auto: true
        }
    });
}(window.jQuery, window.$CU = window.$CU || {}));

$(document).ready(function(e) {
    var slideJsHeight= 140;
   $('#top-featured-press-carousel .csel').slidesjs({
    width: 800,
    height: slideJsHeight,
    navigation: {
        active: false,
        effect: 'slide',
    },
   }); 

   $('#featured-video-carousel .csel').slidesjs({
    width: 800,
    height: slideJsHeight,
    navigation: {
        active: false,
        effect: 'slide',
    },
   });

   var carousel_revolver = setInterval(function() {
        $('#featured-csel-right').click();
        $('#video-csel-right').click();
   }, 10000);

   $('.cselarrow-right, .cselarrow-left').click(function(e) {
        clearInterval(carousel_revolver);
   });

   // Cheats to put arrows outside carousel
   $('.fcselarrow-left').on('click', function(e) {
        $('#featured-csel-left').click();
   });

   $('.fcselarrow-right').on('click', function(e) {
        $('#featured-csel-right').click();
   });

   $('.vcselarrow-left').on('click', function(e) {
        $('#video-csel-left').click();
   });

   $('.vcselarrow-right').on('click', function(e) {
        $('#video-csel-right').click();
   });

   $('#nfo_show_90_days').click(function(e) {
        show_more_press(90);
   });

   $('#nfo_show_12_months').click(function(e) {
        show_more_press(365);
   });

   $('#nfo_show_all').click(function(e) {
        $('.not-featured-press').fadeIn();
        $('.not-featured-options').hide();
   });

   $('#content-wrapper').delegate(".newsMention", "click", function (e) {
       var $href = $(this).find(".newsTitle");
       var url = $href.attr('href');
       window.open(url, '_blank');
       $CU.trackEvent(url, 'Outgoing link click', '', $href.text(), 'false');
       e.preventDefault();
   })

   var days_ago_to_show = 0;

   function show_more_press(days) {
    days_ago_to_show += days;
    $('.not-featured-press').filter(function() {
      return $(this).data('dayssince') <= days_ago_to_show
    }).fadeIn();
   } 

   show_more_press(90);
});

(function ($CU) {

    function prepareUserSelectAutocomplete() {
        // User autocompletes
        function format(user) {
            return "<img src='"+user.photo+"' width='25px' height='25px'> "+ user.name_display;
        }
        function format_no_highlight(user) {
            return "<img src='"+user.photo+"' width='25px' height='25px'> "+ user.name;
        }
        $('input.user-search').select2({
            placeholder: 'Enter a name',
            width: 'resolve',
            minimumInputLength: 3,
            maximumSelectionSize: 5,
            multiple: true,
            ajax: {
                url: "/api/search/users/",
                quietMillis: 200,
                dataType: 'json',
                // generates query parameters
                data: function(term, page) {
                    return {'q': term};
                },
                results: function(data, page) {
                    var search_results = $.map(data.obj.hits, function (item) {
                        return {
                            id: item.slug,
                            name: item.name,
                            name_display: item.name_display,
                            photo: item.photo,
                            text: item.name,
                        };
                    });
                    return {
                        'results': search_results,
                        'more': false
                    };
                },
            },
            // format a result that the user can choose to select
            formatResult: format,
            // format a result when it's been selected by the user (or initially selected)
            formatSelection: format_no_highlight,
            formatNoMatches: function(term) { return "No matches found. Please note that the current regulatory environment requires limiting deal sharing to only accredited investors on CircleUp." },
            formatSelectionTooBig: function (maxSize) {
                return "You can only select "+maxSize+" people to share this company with at once.";
            },
            formatInputTooShort: function (term, minLength) {
                var n = minLength - term.length;
                return "" +
                    "Start typing the name of an investor. Please enter at least " + n + " more character" + (n == 1? "" : "s");
            },
            escapeMarkup: function(m) { return m; },
            initSelection: function(element, callback) {
                var init_slug, init_name, init_image;
                init_slug = element.data('user-slug');
                init_name = element.data('user-name');
                init_image = element.data('user-image');
                var init_obj = [{
                    id: init_slug,
                    name: init_name,
                    name_display: init_name,
                    photo: init_image,
                }];
                if(init_slug && init_name && init_image) {
                    callback(init_obj);
                }
            }
        });

    }

    function prepareFAQSearch() {
        $(function(){
           $('.faq_search').select2({
                width: 'resolve',
                minimumInputLength: 0,
                multiple: false,
                ajax: {
                    url: "/api/search/faq/",
                    quietMillis: 200,
                    dataType: 'json',
                    // generates query parameters
                    data: function(term, page) {
                        return {'q': term, 'priority': $(this).data('priority')};
                    },
                    results: function(data, page) {
                        var search_results = $.map(data.obj.hits, function (item) {
                            return {
                                id: item.id,
                                question: item.question,
                                answer: item.answer,
                                url: item.url,
                            };
                        });
                        return {
                            'results': search_results,
                            'more': false
                        };
                    },
                },
               formatResult: function(faq) { return faq.question },
               formatSelection: function(faq) { return faq.question },
           });
           $('.faq_search').on('change', function(e) {
              var x = e.added;
              $CU.trackEvent(document.URL, 'FAQ search', null, x.id, '');
              var x_no_hash = x.url.split('#')[0];
              if (x_no_hash==window.location.pathname) {
                window.open(x.url, '_self');
              } else {
                window.open(x.url, '_blank');
              }
           });
        });
    }

    $(document).ready(function () {
        prepareUserSelectAutocomplete();
        prepareFAQSearch();
    });

}(window.$CU, window.$CU = window.$CU || {}));

(function ($, $CU) {
    "use strict";  

    var $noSegmentError = $('.signup-box .no-segment-error');

    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i"),
            separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        return uri + separator + key + "=" + value;
    }

    function _userSegment() {
        return $('.signup-box input[name=segment]:checked').val();
    }

    function _updateSocialLinks() {
        $('.signup-box .social-login').each(function () {
            var newLink = updateQueryStringParameter($(this).attr('href'), 'segment', _userSegment());
            $(this).attr('href', newLink);
        });
    }

    function makeActive($input) {
        $('.signup-box .btn-pill').removeClass('active');
        $input.closest('.btn-pill').addClass('active');
        if($input.val()==2) {
            $('.signup-box .submit-button').text("Join to Raise Capital");
        } else {
            $('.signup-box .submit-button').text("Join to View Deals");
        }
    }

    function prepareSegmentChooser() {
        $('.signup-box input[name=segment]').on('change', function () {
            makeActive($(this));
            _updateSocialLinks();
            $noSegmentError.hide();
        });
        makeActive($('.signup-box input[name=segment]:checked'));
        _updateSocialLinks();


        $('.signup-box .social-login').on('click', function(e) {
            if(typeof _userSegment() == 'undefined') {
                $noSegmentError.show();
                return false;
            }
            return true;
        })
    }

    $(window).ready(function () {
        prepareSegmentChooser();
    });

}(window.jQuery, window.$CU = window.$CU || {}));



//noinspection JSUnresolvedVariable
(function ($, $CU) {
    "use strict";  // http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/


    function prepareTagFields() {
        var options = {
            closeOnSelect: false
        };
        $("#id_interested_industry_tags").select2(options);
        $("#id_interested_feature_tags").select2(options);
    }

    function prepareEmailSubscriptions() {
        $('#email-subscriptions-uncheck-all').on('click', function(e) {
            $('#editForm input[type=checkbox]').prop('checked', false);
            $('.email-subscriptions-check-toggle').toggle();
            return false;
        });

        $('#email-subscriptions-check-all').on('click', function(e) {
            $('#editForm input[type=checkbox]').prop('checked', true);
            $('.email-subscriptions-check-toggle').toggle();
            return false;
        });
    }

    function prepareJCrop() {
        var submissionInProgress, $jCropContainer,
            $jCropImg, $profileImg,
            $errorDivs, $fileInput;

        var coordUpdate = function(coordinates) {
            /* Updates the crop form with coordinate data. */
            $("#id_x").val(Math.floor(coordinates.x));
            $("#id_x2").val(Math.floor(coordinates.x2));
            $("#id_y").val(Math.floor(coordinates.y));
            $("#id_y2").val(Math.floor(coordinates.y2));
        };

        submissionInProgress = false;

        $jCropContainer = $('#jcropContainer');
        $jCropImg = $jCropContainer.find('img');
        $profileImg = $('#profileImg').find('img');
        $errorDivs = $('.error');
        $fileInput = $('#id_file');

        $('#imgEditSubmit').on('click', function () {
            /* When a users clicks 'Update Image' in the edit image dialog */
            var form;
            $errorDivs.html("").hide();  // clear any error messages

            if (submissionInProgress) {  // if submission already in progress, do nothing
                return false;
            }

            if ($fileInput.val() === "") {
                $errorDivs.show().html("No file chosen. Please try again.");
                return false;
            }

            submissionInProgress = true;
            form = $(this).closest('form');

            form.ajaxSubmit({
                url: form.attr("action"),
                iframe: 'true',
                success: function (data) {
                    form.hide();
                    $jCropImg.attr("src", data);
                    $jCropContainer.show();
                    $jCropImg.Jcrop({
                        aspectRatio: "1",
                        onChange: coordUpdate,
                        onSelect: coordUpdate,
                        boxWidth: 350,
                        boxHeight: 500
                    });
                    $(".jcropBtns").css("display", "inline-block");
                    $.fancybox.resize();
                },
                complete: function () {
                    submissionInProgress = false;
                }
            });

            return false;
        });

        $('.jcropSubmit').on("click", function () {
            /* submit the crop interface coordinates */
            $("#coordForm").ajaxSubmit({
                success: function (data) {
                    $profileImg.attr("src", data);
                    $.fancybox.close();
                }
            });
        });
    }

    function prepareWhyIInvested() {

        var window_hash = window.location.hash;
        if (window_hash.indexOf('feedback_') !== -1) {
            var company_slug = window_hash.split('feedback_')[1];
            if (company_slug) {
                $('a.why-i-invested-edit-btn[data-company-slug='+company_slug+']').click();
            }
        }

        $('a.why-i-invested-edit-btn').click(function(e) {
            var company_name = $(this).data('company-name');
            var company_form_action = $(this).data('form-action');
            var quote = $(this).data('quote');

            var $thisbtn = $(this);

            // Change modal references to company name
            $('div#why-invested-modal span.company-name').text(company_name);

            // Change URL of form submission
            $('form#sendCompanyFeedbackForm').attr('action', company_form_action);

            // Prefill textarea with current quote from investment in selected company
            $('div#why-invested-modal textarea').val(quote);

            // Ajaxify form submission
            $CU.ajaxForm('form#sendCompanyFeedbackForm', function(data) {
                $CU.displayInfo("Feedback saved.");
                $.fancybox.close();
                $thisbtn.removeClass("btn-primary").text("Edit feedback");
                $thisbtn.data('quote', data.feedback_msg);
            });

            // Initialize "Why I Invested" modal
            $.fancybox({
                'href': '#why-invested-modal'
            });
        });

    }

    $(document).ready(function () {
        prepareEmailSubscriptions();
        prepareTagFields();
        prepareJCrop();
        prepareWhyIInvested();
    });


}(window.jQuery, window.$CU = window.$CU || {}));


(function ($) {
    "use strict";
    $.widget("circleup.optionPicker", {
        // the constructor
        options: {
            chosen: null
        },
        _create: function () {
            var self = this,
                source = $("#option-picker-widget-template").html();
            self.choices = [];
            self.template = Handlebars.compile(source);
            self._refresh();
        },

        // called when created, and later when changing options
        _refresh: function () {
            var self = this,
                html = self.template({'choices': this.choices}),
                val;
            self.element.html(html);

            self.element.on('change', 'select', function(data) {
                if(self.options.chosen) {
                    self.element.find("select option:selected").each(function () {
                         val = $(this).val();
                         self.options.chosen(val);
                    });
                }
            });
        },

        set: function (choices) {
            this.choices = choices;
            this._refresh();
        }
    });
}(window.jQuery));
