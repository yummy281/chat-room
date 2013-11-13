/*!
* zzChat - HTML5 Chat Application
*
* Application Javascript entry point.
*
* @author Kévin Subileau
* @link https://github.com/ksubileau/zzChat
* @license GNU GPLv3 (http://www.gnu.org/licenses/gpl-3.0.html also in /LICENSE)
*/
require.config({
	baseUrl: '/app/js',
	// Disable cache
	urlArgs: "bust=" +  (new Date()).getTime(),
	paths: {
		jquery: 'libs/jquery/jquery.min',
		underscore: 'libs/underscore/underscore.min',
		backbone: 'libs/backbone/backbone.min',
		text: 'libs/require/text',
		bootstrap: 'libs/bootstrap/bootstrap.min',
		i18next: 'libs/i18next/i18next.min',
        'jquery.placeholder': 'libs/jquery.placeholder/jquery.placeholder',
	},
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'bootstrap': {
			deps: ['jquery'],
		},
        'jquery.placeholder': {
            deps: ['jquery'],
        },
	}
});

window.zzchat = {
    // TODO Use external config file ?
    "options" : {
    	i18next : {
    		resGetPath: 'locales/__lng__.json',
    		useCookie: false,
    		fallbackLng: 'en',
    		getAsync: false // Synchronous loading in order to avoid uninitialized errors.
    	},
        // TODO Load dynamically from server ?
    	langAvailable : [
    		{
                "langcode": "en",
                "fullname":"English",
                "flagcode":"gb",
            },
    		{
                "langcode": "fr",
                "fullname":"Français",
                "flagcode":"fr",
            },
    		{
                "langcode": "es",
                "fullname":"Español",
                "flagcode":"es",
            },
    	],
        // TODO Detect browser language
    	currentLang : "fr",
        api: {
            url: '/api',

            // Authentication header name
            authHeaderName: 'X-Auth-Token',

            // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
            // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
            // set a `X-Http-Method-Override` header.
            emulateHTTP : false,

            // Turn on `emulateJSON` to support legacy servers that can't deal with direct
            // `application/json` requests ... will encode the body as
            // `application/x-www-form-urlencoded` instead and will send the model in a
            // form param named `model`.
            emulateJSON : false,
        },
    },
    "me":null,
    "token":null,
};

define(['jquery', 'bootstrap', 'i18next', 'views/home'], function($, _bootstrap, i18n, HomeView){
    'use strict';

    // Set Backbone options
    Backbone.emulateHTTP = window.zzchat.options.api.emulateHTTP;
    Backbone.emulateJSON = window.zzchat.options.api.emulateJSON;

    /*
     * Override Backbone.sync in order to set the root URL of all Backbone API request
     * and send the authentication token once the user is connected.
     * Inspired from https://coderwall.com/p/8ldaqw
     */
    // Store the original version of Backbone.sync
    Backbone.basicSync = Backbone.sync;
    Backbone.sync = function (method, model, options) {
    	var rootUrl = window.zzchat.options.api.url;
    	var url = _.isFunction(model.url) ? model.url() : model.url;

    	// If no url, don't override, let Backbone.sync do its normal fail
    	if (url) {
    		options = _.extend(options, {
    			url: rootUrl + (rootUrl.charAt(rootUrl.length - 1) === '/' ? '' : '/')
    						 + (url.charAt(0) === '/' ? url.substr(1) : url),

                // Automatically send the authentication token in HTTP headers if available.
                beforeSend: function(xhr) {
                    if(typeof window.zzchat.token != 'undefined') {
                        xhr.setRequestHeader(window.zzchat.options.api.authHeaderName, window.zzchat.token);
                    }
                },
    		});
        }

        // Call the stored original Backbone.sync method with the new url property
        return Backbone.basicSync(method, model, options);
    };

	// Initialize internationalization
	i18n.init(window.zzchat.options.i18next);

	// Start application
	var home_view = new HomeView;
	home_view.render();
});