/*!
* zzChat - HTML5 Chat Application
*
* Application Javascript entry point.
*
* @author Kévin Subileau
* @link https://github.com/ksubileau/zzchat
* @license GNU GPLv3 (http://www.gnu.org/licenses/gpl-3.0.html also in /LICENSE)
*/

define([
        'jquery',
        'backbone',
        'i18next',
        'config',
        'router',
    ],
    function($, Backbone, i18n, config, Router){
        'use strict';

        var zzChat = {
            router: null,
            token: null,
            user: null,
            currentLang: null,
            options : null,

            init: function() {
                // Register this instance to global scope
                this.registerGlobal();

                // Load configuration from file
                this.options = config;

                // Set Backbone options
                Backbone.emulateHTTP = this.options.api.emulateHTTP;
                Backbone.emulateJSON = this.options.api.emulateJSON;

                /*
                 * Override Backbone.sync in order to set the root URL of all Backbone API request
                 * and send the authentication token once the user is connected.
                 * Inspired from https://coderwall.com/p/8ldaqw
                 */
                // Store the original version of Backbone.sync
                Backbone.basicSync = Backbone.sync;
                Backbone.sync = function (method, model, options) {
                    var rootUrl = this.options.api.url;
                    var url = _.isFunction(model.url) ? model.url() : model.url;

                    // If no url, don't override, let Backbone.sync do its normal fail
                    if (url) {
                        options = _.extend(options, {
                            url: rootUrl + (rootUrl.charAt(rootUrl.length - 1) === '/' ? '' : '/')
                                         + (url.charAt(0) === '/' ? url.substr(1) : url),

                            // Automatically send the authentication token in HTTP headers if available.
                            beforeSend: function(xhr) {
                                if(zzChat.isLogin()) {
                                    xhr.setRequestHeader(zzChat.options.api.authHeaderName, zzChat.getAuthToken());
                                }
                            },
                        });
                    }

                    // Call the stored original Backbone.sync method with the new url property
                    return Backbone.basicSync(method, model, options);
                };

                var i18nOpts = zzChat.options.i18next;
                // Configure default language if specified
                if (this.options.defaultLanguage != null) {
                    if (this.isValidLangCode(this.options.defaultLanguage)) {
                        i18nOpts = _.extend(i18nOpts, {lng:this.options.defaultLanguage});
                    }
                    // TODO Throw error or warning if value is invalid ?
                }
                // Initialize internationalization
                i18n.init(i18nOpts);

                // Start application
                this.router = new Router();
                this.router.loginView();

            },

            registerGlobal: function() {
                window.zzChat = this;
            },

            isLogin: function() {
                return this.getAuthToken() != null;
            },

            getAuthToken: function() {
                return this.token;
            },

            getCurrentUser: function() {
                return user;
            },

            setLanguage: function(langCode, callback) {
                return i18n.setLng(langCode, callback);
            },

            getLanguage: function() {
                // Get the current language of i18next.
                var selectedLng = i18n.lng();
                // Check that it corresponds to a valid language code.
                if(this.isValidLangCode(selectedLng))
                    return selectedLng;
                // Else try to remove the second part of the language code.
                if(_.contains(selectedLng, '-')) {
                    selectedLng = selectedLng.split('-')[0];
                    if(this.isValidLangCode(selectedLng))
                        return selectedLng;
                }
                return null;
            },

            isValidLangCode: function(langCode) {
                return _.contains(_.pluck(this.options.langAvailable, "langcode"), langCode);
            },
        }
        return zzChat;
    }
);