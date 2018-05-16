log = function(msg){
  console.log(msg);
}

setupConfig = function(err, launchdata, xAPIWrapper) {
    if (!err) {
      wrapper = ADL.XAPIWrapper = xAPIWrapper;
      log("--- content launched via xAPI Launch ---");
    } else {
      wrapper = ADL.XAPIWrapper;
      setRegAPIConfig();
      log("--- content statically configured ---");
    }
    mappingsAndDifficulties = getMappingsAndDifficulties();
    if(!!mycb){
      mycb();
    }
}

sendKCScore = function(learningResource,problemID,kcScore){
  setRegAPIConfig();
  var vars = window.location.search.substring(1).split('&');
  var params = {}
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = pair[1];
  }
  var email = "mailto:" + decodeURIComponent(params['user']);
  var fullName = decodeURIComponent(params['fullname']);
  var SKOTitle = learningResource + ":" + problemID;

  var statements = [];

  var kcs = mappingsAndDifficulties['mappings']['itemsToKCs'][problemID];
  var kcNamesAndScores = {};
  for(var index in kcs){
    var kc = kcs[index];
    kcNamesAndScores[kc] = kcScore;
  }

  for(var kcName in kcNamesAndScores){
    var kcScore = kcNamesAndScores[kcName];
    var objUUID = ADL.ruuid();
    allData = {
      "actor" :{
        "mbox" : email,
        "name" : fullName,
        "objectType" : "Agent"
      },
      "verb" : {
        "display": {
          "en-US": "SaveKCScore"
        },
        "id": "https://umiis.github.io/ITSProfile/verbs/SaveKCScore"
      },
      "object": {
        "objectType": "StatementRef",
        "id": objUUID
      },
      "context": {
        "extensions": {
          "http://autotutor&46;x-in-y&46;com/AT": QueryStringToJSON(SKOTitle)
        }
      },
      "result": {
        "response": kcName,
        "score": {
          "raw": kcScore,
          "max": 1,
          "min": 0,
          "scaled": kcScore
        }
      }
    }

    statements.push(allData);
  }

  var ret = wrapper.sendStatements(statements);
  return ret;
}

QueryStringToJSON = function(SKOTitle) {
	var pairs = window.location.href.split('?')[1].split('&');

	var result = {};
	pairs.forEach(function(pair) {
		pair = pair.split('=');
		result[pair[0]] = decodeURIComponent(pair[1] || '');
	});
	result.SKOTitle=SKOTitle;
	result.timeStart=timeStart;
	var timeNow=new Date();
	result.timeNow=timeNow;
	result.timeTaken=timeNow.getTime()-timeStart.getTime();
	return JSON.parse(JSON.stringify(result));
}

qs = function(search_for) {
	var query = window.location.search.substring(1);
	var params = query.split('&');
	for (var i = 0; i<params.length; i++) {
		var pos = params[i].indexOf('=');
		if (pos > 0  && search_for == params[i].substring(0,pos)) {
			return params[i].substring(pos+1);
		}
	}
}

getRandomArrayValue = function(arr){
  return arr[getRandomNumber(arr.length)];
}

getRandomNumber = function(max){
  return Math.floor(Math.random() * max);
}

toTitleCase = function(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

getMappingsAndDifficulties = function(){
  log("getMappingsAndDifficulties");
  try{
    setRegAPIConfig();
    var search = ADL.XAPIWrapper.searchParams();
    search['verb'] = "https://umiis.github.io/ITSProfile/System/Store_Data";
    search['agent'] = JSON.stringify({"mbox":"mailto:data@electronixtutor.com","objectType":"Agent"});
    search['limit'] = 1;
    var ret = ADL.XAPIWrapper.getStatements(search);
    if(ret){
      var mappingsAndDifficulties = ret['statements'][0]['context']["extensions"]["https://umiis.github.io/ITSProfile/System/Data"];
      log("mappingsAndDifficulties: " + JSON.stringify(mappingsAndDifficulties));
      return mappingsAndDifficulties;
    }
  }catch(e){
    log("error getting mappings and difficulties: " + e);
  }
}

var setAggAPIConfig = function(){
  wrapper.changeConfig({
    endpoint: "https://lrs.x-in-y.com/api/",
    user: '17e055b6235655b9893e27fe877fa5f46ef3f6cd',
    password: '0a0e8ad3df11b173b7eea1593f4ba3cea441429d'
  });
}

var setRegAPIConfig = function(){
  wrapper.changeConfig({
    endpoint: "https://lrs.x-in-y.com/data/xAPI/",
    user: '17e055b6235655b9893e27fe877fa5f46ef3f6cd',
    password: '0a0e8ad3df11b173b7eea1593f4ba3cea441429d'
  });
}

var wrapper;
var mycb;
var mappingsAndDifficulties;
var timeStart = new Date();
start = function(cb){
  mycb = cb;
  ADL.launch(setupConfig, true);
}
