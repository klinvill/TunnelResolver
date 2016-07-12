// name of the lookup table in chrome.storage.local
// state is persisted across sessions, tabs, and popups using chrome.storage.local
if (!window.LOOKUP_TABLE) window.LOOKUP_TABLE = "lookupTable";
if (!window.TR_CURRENT_PROFILE) window.TR_CURRENT_PROFILE = $('.nav-tabs .active').text() || 1;

function newTunnel() {
    var source = document.getElementById("src").value;
    var target = document.getElementById("target").value;
    var profile = $('.nav-tabs .active').text() || 1;
    addTunnel(source, target, profile);
}

function buildUrl (url) {
    var FQUrl; // fully-qualified url, protocol required for parsing reasons
    // Currently only http and https protocol urls are parsed
    if (url.substring(0,7)!=="http://" && url.substring(0,8)!=="https://") FQUrl = "http://".concat(url);
    else FQUrl = url;

    return new URL(FQUrl);
}

function addTunnel(source, target, profile) {

    var sourceParser = buildUrl(source);
    var targetParser = buildUrl(target);

    // Add source and target mapping to the lookupTable
    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        var fullLookupTable = results[LOOKUP_TABLE] || {};
        var lookupTable = fullLookupTable[profile] || {};
        lookupTable[sourceParser.host] = targetParser.host;
        fullLookupTable[profile] = lookupTable;

        // { LOOKUP_TABLE: val } will use LOOKUP_TABLE as the key instead of using the value of LOOKUP_TABLE as the key, so the workaround is to use object[LOOKUP_TABLE] = val
        var value = {};
        value[LOOKUP_TABLE] = fullLookupTable;
        chrome.storage.local.set(value);
    });
}


function removeTunnel(sourceHost) {
    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        // Used to track which tab is currently selected
        // var profile = window.TR_CURRENT_PROFILE;
        var profile = $('.nav-tabs .active').text();

        var fullLookupTable = results[LOOKUP_TABLE];
        var lookupTable = fullLookupTable[profile];

        // Delete mapping from the lookupTable
        delete lookupTable[sourceHost];
        fullLookupTable[profile] = lookupTable;
        
        // { LOOKUP_TABLE: val } will use LOOKUP_TABLE as the key instead of using the value of LOOKUP_TABLE as the key, so the workaround is to use object[LOOKUP_TABLE] = val
        var storedTable = {};
        storedTable[LOOKUP_TABLE] = fullLookupTable;
        chrome.storage.local.set(storedTable);
    });
}


function createTunnelText(source, target) {
    return document.createTextNode(source.concat(" -> ").concat(target));
}


function createTab(profile, isActive) {
    var newTabLink = document.createElement("a");
    newTabLink.setAttribute("href", "#"+profile);
    newTabLink.setAttribute("data-toggle", "tab");
    newTabLink.appendChild(document.createTextNode(profile));

    var newTab = document.createElement("li");
    newTab.appendChild(newTabLink);
    if (isActive) newTab.classList.add("active");

    // The active tab has to be tracked periodically since chrome extensions don't fire a beforeunload event
    newTab.addEventListener("click", function () {
        trackActiveTab(profile);
    });

    return newTab;
}


function createTabContent(profile, lookupTable, isActive) {
    var tunnels = document.createElement("ul");
    tunnels.classList.add("tunnels");

    var tabContent = document.createElement("div");
    tabContent.classList.add("tab-pane");
    tabContent.setAttribute("id", profile);
    if (isActive) tabContent.classList.add("active");

    if (lookupTable) {
        for(var source in lookupTable) {
            // check to make sure the key is a property we want to be using
            if (!lookupTable.hasOwnProperty(source)) continue;

            var target = lookupTable[source];
            var newLi = createTunnelListItem(source, target);

            tunnels.appendChild(newLi);                        
        }
    }

    tabContent.appendChild(tunnels);

    return tabContent;
}


function createTunnelListItem(source, target) {
    var newLi = document.createElement("li");
    newLi.appendChild(createTunnelText(source, target));

    // add a delete button for each listed tunnel
    var deleteButton = document.createElement("button");
    deleteButton.appendChild(document.createTextNode("delete"));

    // source is a mutable variable used throughout the loop so we need to create a local copy for the event listener callback
    (function (source) {
        deleteButton.addEventListener('click', function () {
            removeTunnel(source);
            // Since there's very little to reload, it's much easier to just reload the pop-up than to handle selectively removing html elements
            window.location.reload();
        });
    }(source));

    newLi.appendChild(deleteButton);

    return newLi;
}


function addTab(profile, isActive) {
    var newTab = createTab(profile, isActive);
    document.getElementById("profiles").insertBefore(newTab, document.getElementById("newProfile"));
}


function addTabContent(profile, lookupTable, isActive) {
    var tabContent = createTabContent(profile, lookupTable, isActive);
    document.getElementById("currentTunnels").appendChild(tabContent);
}


function addNewProfile() {
    var numProfiles = document.getElementById("profiles").childElementCount;

    // Currently the profile names are just numbers, could be swapped out at a later point
    var newProfile = numProfiles;

    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        var newLookupTable = results[LOOKUP_TABLE] || {};
        newLookupTable[newProfile] = {};

        var value = {};
        value[LOOKUP_TABLE] = newLookupTable;
        chrome.storage.local.set(value);

        trackActiveTab(newProfile);

        location.reload();
    });
}

function trackActiveTab(profile) {
    chrome.storage.local.set({"activeTab": profile});
}


document.addEventListener('DOMContentLoaded', function() {
    // load last known active tab from local storage
    chrome.storage.local.get("activeTab", function(tabInfo) {
        var currentProfile = tabInfo["activeTab"] || 1;

        // List current tunnels
        chrome.storage.local.get(LOOKUP_TABLE, function(results) {
            var fullLookupTable = results[LOOKUP_TABLE];
            if (fullLookupTable) {
                for (var profile in fullLookupTable) {
                    // check to make sure the key is a property we want to be using
                    if (!fullLookupTable.hasOwnProperty(profile)) continue;

                    var lookupTable = fullLookupTable[profile];

                    var tabIsActive = profile == currentProfile;

                    // Create a new tab
                    addTab(profile, tabIsActive);

                    // Fill in new tab content
                    addTabContent(profile, lookupTable, tabIsActive);
                }
            }
        });
    });

    document.getElementById("newProfile").onclick = addNewProfile;

    document.getElementById("newTunnel").addEventListener('submit', newTunnel);
});