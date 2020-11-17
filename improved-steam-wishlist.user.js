// ==UserScript==
// @name     Improved Steam Wishlist
// @version  0.1.3
// @author   Xiyng
// @include  https://store.steampowered.com/wishlist/*
// @include  https://store.steampowered.com/wishlist/profiles/*
// @run-at   document-start
// ==/UserScript==

"use strict";

// Code here relies on original wishlist code by Valve.
const CWishlistControllerMethods = {
    OnScroll: function() {
        this.LoadAllElementsWithoutImages();
        return this.OriginalOnScroll.apply(this, arguments);
    },

    LoadAllElementsWithoutImages: function() {
        for (let i = 0; i < this.rgVisibleApps.length; i++) {
            this.LoadElementWithoutImages(i);
        }
    },

    // This is pretty much LoadElement with the images part removed.
    LoadElementWithoutImages: function(nIndex) {
        var unAppId = this.rgVisibleApps[nIndex];
        var $elTarget = this.rgElements[unAppId];

        if (!this.rgLoadedApps.includes(unAppId)) {
            this.rgLoadedApps.push(unAppId);
            this.elContainer.append($elTarget);
        }

        if(!$elTarget.hasClass('dragging')) {
            $elTarget.css('top', nIndex * this.nRowHeight);
        }
    },

    UnloadElement: () => {}
};

function getCodeToInject() {
    return `
        CWishlistController.prototype.OriginalOnScroll = CWishlistController.prototype.OnScroll;
        CWishlistController.prototype.OnScroll = ${CWishlistControllerMethods.OnScroll.toString()};
        CWishlistController.prototype.LoadAllElementsWithoutImages = ${CWishlistControllerMethods.LoadAllElementsWithoutImages.toString()};
        CWishlistController.prototype.LoadElementWithoutImages = ${CWishlistControllerMethods.LoadElementWithoutImages.toString()};
        CWishlistController.prototype.UnloadElement = ${CWishlistControllerMethods.UnloadElement.toString()};
    `;
}

function injectScript(sourceCode) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = sourceCode;
    document.head.appendChild(script);
}

window.addEventListener("afterscriptexecute", event => {
    const scriptSource = event.target.src;
    if (scriptSource.indexOf("wishlist.js") >= 0) {
        console.log("Found wishlist.js");
        // We need to inject some code to override default wishlist behaviour.
        const codeToInject = getCodeToInject();
        injectScript(codeToInject);
    }
});