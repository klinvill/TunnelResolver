// Note: the background page stores the tunnels for the extension so that the same settings can be used across multiple tabs
var DEBUG = chrome.extension.getBackgroundPage().DEBUG;

function newTunnel() {
    var source = document.getElementById("src").value;
    var target = document.getElementById("target").value;
    if (DEBUG) chrome.extension.getBackgroundPage().console.log("Source value: "+source+" Target value: "+target);
    addTunnel(source, target);
}

function addTunnel(source, target) {

    var sourceURL;
    var targetURL;

    // appends http:// if needed to get a valid url
    if (!(source.substring(0,7)=="http://" || source.substring(0,8)=="https://")) sourceURL = "http://".concat(source)
    if (!(target.substring(0,7)=="http://" || target.substring(0,8)=="https://")) targetURL = "http://".concat(target)

    var sourceParser = new URL(sourceURL);
    var targetParser = new URL(targetURL);

    if (DEBUG) chrome.extension.getBackgroundPage().console.log("Parsing source: "+source+" and target: "+target);
    var sourceHost = sourceParser.host;
    var targetHost = targetParser.host;

    if (DEBUG) chrome.extension.getBackgroundPage().console.log("Generated source host: "+sourceHost);
    if (DEBUG) chrome.extension.getBackgroundPage().console.log("Generated target host: "+targetHost);
    if (DEBUG) chrome.extension.getBackgroundPage().console.log("Adding source to target mapping for: "+sourceHost+" and: "+targetHost);

    // Add source and target mapping to the lookupTable
    chrome.extension.getBackgroundPage().lookupTable.set(sourceHost, targetHost);
}

function removeTunnel(sourceHost) {
    // Delete mapping from the lookupTable
    chrome.extension.getBackgroundPage().lookupTable.delete(sourceHost);
    // Since there's very little to reload, it's much easier to just reload the pop-up than to handle selectively removing html elements
    window.location.reload();
}

function createTunnelText(source, target) {
    return document.createTextNode(source.concat(" -> ").concat(target));
}

document.addEventListener('DOMContentLoaded', function() {
    // List current tunnels
    chrome.extension.getBackgroundPage().lookupTable.forEach(function(target, source, tunnels) {
        var newLi = document.createElement("li");
        newLi.appendChild(createTunnelText(source, target));
        var deleteButton = document.createElement("button").appendChild(document.createTextNode("delete"));
        newLi.appendChild(deleteButton);
        deleteButton.addEventListener('click', function() {removeTunnel(source)});
        document.getElementById("tunnels").appendChild(newLi);
    });

    document.getElementById("newTunnel").addEventListener('submit', newTunnel);
    if (DEBUG) chrome.extension.getBackgroundPage().console.log("Loaded!!!");
});