// ==UserScript==
// @name     Improved Steam Wishlist
// @version  0.1.1
// @author   Xiyng
// @include  https://store.steampowered.com/wishlist/*
// @include  https://store.steampowered.com/wishlist/profiles/*
// @run-at   document-start
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

"use strict";

const codeToInject =
`// Code here relies on original wishlist code by Valve.

CWishlistController.prototype.OriginalOnScroll = CWishlistController.prototype.OnScroll;

CWishlistController.prototype.OnScroll = function() {
    this.LoadAllElementsWithoutImages();
    return this.OriginalOnScroll.apply(this, arguments);
};

CWishlistController.prototype.LoadAllElementsWithoutImages = function() {
    for (let i = 0; i < this.rgVisibleApps.length; i++) {
        this.LoadElementWithoutImages(i);
    }
};

// This is pretty much LoadElement with the images part removed.
CWishlistController.prototype.LoadElementWithoutImages = function(nIndex) {
    var unAppId = this.rgVisibleApps[nIndex];
    var $elTarget = this.rgElements[unAppId];

    if (!this.rgLoadedApps.includes(unAppId)) {
        this.rgLoadedApps.push(unAppId);
        this.elContainer.append($elTarget);
    }

    if(!$elTarget.hasClass('dragging')) {
				$elTarget.css('top', nIndex * this.nRowHeight);
    }
};

CWishlistController.prototype.UnloadElement = () => {};`;

function injectScript(sourceCode) {
  	const $script = $("<script></script>");
    $script.prop("type", "text/javascript");
    $script.text(sourceCode);
    $("head").append($script);
}

$(window).on("afterscriptexecute", event => {
    const scriptSource = event.target.src;
    if (scriptSource.indexOf("wishlist.js") >= 0) {
        console.log("Found wishlist.js");
        // We need to inject some code to override default wishlist behaviour.
        injectScript(codeToInject);
    }
});