// name of the lookup table in chrome.storage.local
// state is persisted across sessions, tabs, and popups using chrome.storage.local
if (!window.LOOKUP_TABLE) window.LOOKUP_TABLE = "lookupTable";

function newTunnel() {
    var source = document.getElementById("src").value;
    var target = document.getElementById("target").value;
    addTunnel(source, target);
}

function buildUrl (url) {
    var FQUrl; // fully-qualified url, protocol required for parsing reasons
    // Currently only http and https protocol urls are parsed
    if (url.substring(0,7)!=="http://" && url.substring(0,8)!=="https://") FQUrl = "http://".concat(url);
    else FQUrl = url;

    return new URL(FQUrl);
}

function addTunnel(source, target) {

    var sourceParser = buildUrl(source);
    var targetParser = buildUrl(target);

    // Add source and target mapping to the lookupTable
    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        var lookupTable = results[LOOKUP_TABLE] || {};

        lookupTable[sourceParser.host] = targetParser.host;

        // { LOOKUP_TABLE: val } will use LOOKUP_TABLE as the key instead of using the value of LOOKUP_TABLE as the key, so the workaround is to use object[LOOKUP_TABLE] = val
        var value = {};
        value[LOOKUP_TABLE] = lookupTable;
        chrome.storage.local.set(value);
    });
}

function removeTunnel(sourceHost) {
    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        var lookupTable = results[LOOKUP_TABLE];
        // Delete mapping from the lookupTable
        delete lookupTable[sourceHost];

        // { LOOKUP_TABLE: val } will use LOOKUP_TABLE as the key instead of using the value of LOOKUP_TABLE as the key, so the workaround is to use object[LOOKUP_TABLE] = val
        var storedTable = {};
        storedTable[LOOKUP_TABLE] = lookupTable;
        chrome.storage.local.set(storedTable);
    });
}

function createTunnelText(source, target) {
    return document.createTextNode(source.concat(" -> ").concat(target));
}

document.addEventListener('DOMContentLoaded', function() {
    // List current tunnels
    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        var lookupTable = results[LOOKUP_TABLE];
        if (lookupTable) {
            for(var source in lookupTable) {

                // check to make sure the key is a property we want to be using
                if (!lookupTable.hasOwnProperty(source)) continue;

                var target = lookupTable[source];
                var newLi = document.createElement("li");
                newLi.appendChild(createTunnelText(source, target));

                // add a delete button for each listed tunnel
                var deleteButton = document.createElement("button");
                deleteButton.appendChild(document.createTextNode("delete"));
                newLi.appendChild(deleteButton);

                // source is a mutable variable used throughout the loop so we need to create a local copy for the event listener callback
                (function (source) {
                    deleteButton.addEventListener('click', function () {
                        removeTunnel(source);
                        // Since there's very little to reload, it's much easier to just reload the pop-up than to handle selectively removing html elements
                        window.location.reload();
                    });
                }(source));
                document.getElementById("tunnels").appendChild(newLi);
            }
        }
    });

    document.getElementById("newTunnel").addEventListener('submit', newTunnel);
});