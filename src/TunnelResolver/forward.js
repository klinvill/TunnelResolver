// Map from source host to target host
if (!window.LOOKUP_TABLE) window.LOOKUP_TABLE = "lookupTable";

var lookupTable;
var activeTab;

chrome.storage.local.get(LOOKUP_TABLE, function(results) { lookupTable = results[LOOKUP_TABLE]; });
chrome.storage.local.get("activeTab", function(results) { activeTab = results["activeTab"]; });
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        // check to make sure the key is a property we want to be using
        if (!changes.hasOwnProperty(key)) continue;
        if (key == LOOKUP_TABLE) lookupTable = changes[key].newValue;
        else if (key == "activeTab") activeTab = changes[key].newValue;
    }
});

// If there's a mapping for the host of the source address, the user will be redirected to the same url but with the target host in place of the source host
function useTunnel(source) {
    var parser = new URL(source);
    var sourceHost = parser.host;

    // Used to track which tab is currently selected
    // var profile = window.TR_CURRENT_PROFILE;
    var profile = activeTab || 1;
    
    var newHost = lookupTable[profile][sourceHost];
    if (newHost) {
        parser.host=newHost;
        chrome.tabs.update({url: parser.href});
    }
}

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {useTunnel(details.url)});



