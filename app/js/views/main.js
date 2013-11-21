/*!
* zzChat - HTML5 Chat Application
*
* Main container view.
*
* @author Kévin Subileau
* @link https://github.com/ksubileau/zzChat
* @license GNU GPLv3 (http://www.gnu.org/licenses/gpl-3.0.html also in /LICENSE)
*/
define(['backbone', 'underscore', 'jquery', 'views/disposable', 'views/tab-home', 'views/tab-room', 'text!templates/main.html'],
    function(Backbone, _, $, DisposableView, HomeTabItem, RoomTabItem, mainView){
		var MainView = DisposableView.extend({
		    el: $('#main'),

		    template: _.template(mainView),

            events : {
                "click #tabs li .closeTab": "closeTab",
            },

		    initialize : function() {
			    this.currentTab = null;
			    this.tabItems = [];
			    this.addTab(new HomeTabItem());
			    this.addTab(new RoomTabItem());
			},

		    render: function() {
				this.$el.html(this.template({
                    tabs: this.tabItems,
                }));
				this.showTab(this.currentTab);
				return this;
		    },

		    renderTabList: function() {
		    	// TODO Avoid re-render entire view
		    	this.render();
		    },

		    addTab: function(tab) {
			    this.tabItems.push(tab);
			    this.renderTabList();

			    return this;
		    },

		    getTabFromId: function (tabId) {
		    	return _(this.tabItems).findWhere({"id":tabId});
		    },

		    showTab: function(tab) {
		    	if (typeof tab === 'string') {
		    		tab = this.getTabFromId(tab);
		    	}

		    	if (tab) {
			    	// Remove previous tab content
			    	if(this.currentTab) {
			    		this.currentTab.dispose();
			    		this.disposed(this.currentTab);
			    	}
			    	// Set new current tab
			    	this.currentTab = tab;
			    	// Render current tab
					this.$(".tab-content").html(this.currentTab.render().$el);
					this.rendered(this.currentTab);
					// Mark tab as active
			    	$('ul li#' + tab.getId(), this.$el).addClass('active');
			    	$('ul li:not(#' + tab.getId() + ')', this.$el).removeClass('active');
			    	// Delegate Events
			    	this.currentTab.delegateEvents();
		    	}

		    	// Update route
		    	if(zzChat.router && this.currentTab) {
		    		zzChat.router.navigate(this.currentTab.getHref());
		    	}

			    return this;
		    },

		    closeTab: function(e) {
		    	e.preventDefault();
		    	// Get target tab.
		    	var tabLi = $(e.currentTarget).closest("li");
		    	var tab = this.getTabFromId(tabLi.attr("id"));
		    	// If it's the current tab, navigate to another.
		    	if (this.currentTab == tab) {
		    		// Select the closest tab.
		    		var tabIndex = _(this.tabItems).indexOf(tab);
		    		if (tabIndex + 1 < _(this.tabItems).size()) {
		    			tabIndex++;
		    		}
		    		else {
		    			tabIndex--;
		    		}
		    		this.showTab(this.tabItems[tabIndex]);
		    	}
		    	// Remove tab from collection
                this.tabItems = _(this.tabItems).without(tab);
                // Render tabs list.
                this.renderTabList();
		    },
		});
		return MainView;
    }
);