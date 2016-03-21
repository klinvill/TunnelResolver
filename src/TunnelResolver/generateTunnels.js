/**
 * Created by Kirby on 3/12/16.
 */

if (!window.LOOKUP_TABLE) window.LOOKUP_TABLE = "lookupTable";

function formatTunnelCommand(sourcePort, targetHostname, targetPort) {
    return "-L "+sourcePort+":"+targetHostname+":"+targetPort;
}

/**
 *
 * @param lookupTable object with sourcehostname:sourceport to targethostname:targetport mapping
 * @param source sourcehostname to generate ssh command for
 */
function formatSSHCommand(lookupTable, source) {
    var tunnelCommands = [];

    for (var key in lookupTable) {
        if (!lookupTable.hasOwnProperty(key)) continue;

        var parsedSource = lookupTable[key].split(':');
        var sourceHostname = parsedSource[0];
        var sourcePort = parsedSource[1];
        var parsedTarget = key.split(':');
        var targetHostname = parsedTarget[0];
        var targetPort = parsedTarget[1];

        if (sourceHostname===source) tunnelCommands.push(formatTunnelCommand(sourcePort, targetHostname, targetPort));
    }

    if (tunnelCommands.length > 0) return "ssh " + tunnelCommands.join(" ") + " " + source;
    else return "";
}


document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(LOOKUP_TABLE, function(results) {
        var lookupTable = results[LOOKUP_TABLE];
        if (lookupTable) {
            document.getElementById("generateSSHLocalCommands").addEventListener('click', function() {
                const commandId = "sshCommands";

                if (!document.getElementById(commandId)) {
                    var command = document.createElement("div");
                    command.className = "boxed";
                    command.id = commandId;

                    var title = document.createElement("b");
                    title.appendChild(document.createTextNode("SSH Command:"));

                    var text = document.createElement("p");
                    text.appendChild(document.createTextNode(formatSSHCommand(lookupTable, "localhost")));

                    command.appendChild(title);
                    command.appendChild(text);
                    document.getElementById("currentTunnels").parentNode.appendChild(command);
                }
            });
        }
    });
});

