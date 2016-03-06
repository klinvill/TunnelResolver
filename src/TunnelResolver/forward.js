// Map from source host to target host
const LOOKUP_TABLE = "lookupTable";
var lookupTable;
var DEBUG = true;

chrome.storage.local.get(LOOKUP_TABLE, function(results) { lookupTable = results[LOOKUP_TABLE] });
chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.runtime.getBackgroundPage(function(background) { background.console.log("Got changes: ", changes) });
    for (key in changes) {
        // check to make sure the key is a property we want to be using
        if (!changes.hasOwnProperty(key)) continue;
        if (key == LOOKUP_TABLE) lookupTable = changes[key].newValue;
    }
});

// If there's a mapping for the host of the source address, the user will be redirected to the same url but with the target host in place of the source host
function useTunnel(source) {
    var parser = new URL(source);
    var sourceHost = parser.host;

    if (DEBUG) console.log("Handling source host: "+sourceHost+" for url: "+parser);
    var newHost = lookupTable[sourceHost];
    if (newHost) {
        parser.host=newHost;
        if (DEBUG) console.log("Setting url to: " + parser.href);
        chrome.tabs.update({url: parser.href});
    }
}

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {useTunnel(details.url)});



