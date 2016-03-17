/** Various utilities useful for HTML pages
    Package: SuperGLU
    Authors: Benjamin Nye and Daqi Dong
    License: APL 2.0
    Requires:
        - jquery
        - purl.js
**/

/** Check if a file exists on the server (synchronously)
    @param urlToFile: The URL for the file
    @type urlToFile: str
    @return: True if file exists, else false.
    @rtype: bool
**/
var checkIfFileExists = function checkIfFileExists(urlToFile){
	var xhr = new XMLHttpRequest();
	xhr.open('HEAD', urlToFile, false);
	xhr.send();
	
	if (xhr.status == "404") {
		return false;
	} else {
		return true;
	}
};

/** Get a URL parameter **/
function getParameterByName(name, url, allowMultiParam) {
    var params = getURLParams(url, allowMultiParam);
    return params[name];
}

/** Get URL Parameters 
    Adapted From SO-Querty: http://stackoverflow.com/revisions/21152762/21
**/
var getURLParams = function getURLParams(url, allowMultiParam){
    if (allowMultiParam == null){allowMultiParam = false;}
    if (url == null){
        url = window.location.search;
    }
    var qd = {};
    url.substr(1).split("&").forEach(function(item) {
        var s = item.split("="),
            k = s[0],
            v = s[1] && decodeURIComponent(s[1]);
        if (allowMultiParam){
            if (!(k in qd)) {
                qd[k] = [];
            }
                qd[k].push(v);
        } else {
            qd[k] = v;
        }
    });
    return qd;
};

/** Add a set of parameters to a URL. Assumes all params unique.
    @param url: The base URL to change parameters on. If null, uses the window.location
    @param sourceParams: The original URL parameters. If null, pulled from window.location
    @param updatedParams: The updated parameters (e.g., new values, additional values)
    @param invalidParams: Parameters to filter from the URL, if identified.
**/
var addURLParams = function addURLParams(url, sourceParams, updatedParams, invalidParams){
    var key,
        queryStr = [],
        outParams = {};
    if (url == null){ 
        url = window.location.protocol + '//' + window.location.host + window.location.pathname;
    }
    if (invalidParams == null){ invalidParams = []; }
    if (sourceParams == null){ sourceParams = getURLParams(null, false); }
    if (updatedParams == null){ updatedParams = {}; }
    for (key in sourceParams){ 
        if (invalidParams.indexOf(key) < 0){
            outParams[key] = sourceParams[key];
        }
    }
    for (key in updatedParams){ 
        if (invalidParams.indexOf(key) < 0){
            outParams[key] = updatedParams[key];
        }
    }
    Object.keys(outParams)
      .sort()
      .forEach(function(key, i) {
        if (outParams[key] === undefined){
            queryStr.push(key);
        } else {
            queryStr.push(key + '=' + encodeURIComponent(outParams[key]));
        }
    });
    return url + '?' + queryStr.join("&");
};

/** Remove unneeded URL parameters **/
var removeURLParams = function removeURLParams(url, invalidParams){
    return addURLParams(url, null, null, invalidParams);
};