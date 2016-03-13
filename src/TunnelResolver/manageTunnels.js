// name of the lookup table in chrome.storage.local
// state is persisted across sessions, tabs, and popups using chrome.storage.local
if(!LOOKUP_TABLE) const LOOKUP_TABLE = "lookupTable";

function newTunnel() {
    var source = document.getElementById("src").value;
    var target = document.getElementById("target").value;
    addTunnel(source, target);
}

function addTunnel(source, target) {

    var sourceURL;
    var targetURL;

    // appends http:// if needed to get a valid url
    if (!(source.substring(0,7)=="http://" || source.substring(0,8)=="https://")) sourceURL = "http://".concat(source);
    if (!(target.substring(0,7)=="http://" || target.substring(0,8)=="https://")) targetURL = "http://".concat(target);

    var sourceParser = new URL(sourceURL);
    var targetParser = new URL(targetURL);

    var sourceHost = sourceParser.host;
    var targetHost = targetParser.host;

    // Add source and target mapping to the lookupTable
    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        var lookupTable;
        if (Object.keys(results).length === 0) lookupTable = {};
        else lookupTable = results[LOOKUP_TABLE];

        lookupTable[sourceHost] = targetHost;
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