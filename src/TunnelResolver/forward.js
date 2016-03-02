// Map from source host to target host
var lookupTable = new Map();
var DEBUG = false;

// If there's a mapping for the host of the source address, the user will be redirected to the same url but with the target host in place of the source host
function useTunnel(source) {
    var parser = new URL(source);
    var sourceHost = parser.host;

    if (DEBUG) console.log("Handling source host: "+sourceHost+" for url: "+parser);
    var newHost = lookupTable.get(sourceHost);
    if (newHost) {
        parser.host=newHost;
        if (DEBUG) console.log("Setting url to: " + parser.href);
        chrome.tabs.update({url: parser.href});
    }
}

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {useTunnel(details.url)});



