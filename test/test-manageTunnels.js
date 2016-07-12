
// buildURL test suites
(
    var hostname = 127.0.0.1;
    var port = 22;
    var host = hostname+":"+port;

    
    describe ("buildURL builds valid URL from host and port without specified protocol", function() {
        var url = host;

        // url should be valid and should be given an http protocol header by default
        expect(buildURL(url)).toEqual("http://"+url);
    });

    describe ("buildURL builds a valid URL given a url with a specified protocol, host, and port", function() {
        var protocol = "http://";
        var url = protocol+host;

        expect(buildURL(url).url).toEqual(url);
    });

    describe ("buildURL maintains common protocols", function() {
        var protocols = ["http://", "https://", "hdfs://", "ftp://", "ftps://", "sftp://"];

        for protocol in protocols {
            var url = protocol+host;
            expect(buildURL(url).url).toEqual(url);
        }
    });

);