/*
  JS port of cleverbot.py
  http://code.google.com/p/pycleverbot/
*/

var request = require('request');
var crypto = require('crypto');


/*
handler - function(clevebotReply)
*/
function Session(handler){
    var self  = this;
    
    this.handler = handler;

    self.keylist=['stimulus','start','sessionid','vText8','vText7','vText6','vText5','vText4','vText3','vText2','icognoid','icognocheck','prevref','emotionaloutput','emotionalhistory','asbotname','ttsvoice','typing','lineref','fno','sub','islearning','cleanslate'];

    headers={};
    headers['User-Agent']='Mozilla/5.0 (Windows NT 6.1; WOW64; rv:7.0.1) Gecko/20100101 Firefox/7.0';
    headers['Accept']='text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
    
    headers['Accept-Language']='en-us;q=0.8,en;q=0.5';
    headers['X-Moz']='prefetch';
    headers['Accept-Charset']='ISO-8859-1,utf-8;q=0.7,*;q=0.7';
    headers['Referer']='http://www.cleverbot.com';
    headers['Cache-Control']='no-cache, no-cache';
    headers['Pragma']='no-cache';

    
    self.arglist=['','y','','','','','','','','','wsf','','','','','','','','','0','Say','1','false'];
    self.MsgList=[];

    handleParseAnswers = function(e,r,asw){

	var answer = parseAnswers(asw);

        for (var k in answer){
	    var v = answer[k];
            try{
                self.arglist[self.keylist.indexOf(k)] = v;
	    }
	    catch(e){	
	    }               
	}
        
	self.arglist[self.keylist.indexOf('emotionaloutput')]='';
        text = answer['ttsText'];
        self.MsgList.push(text);

	self.handler(text);
    }
   

    this.send = function(handler){
	var data = encode(self.keylist, self.arglist);
	var digest_txt = data.substring(9,29); // IMPORTANT!!
	var md5 = crypto.createHash('md5');
	md5.update(digest_txt);
        var hash = md5.digest('hex');

	
	self.arglist[self.keylist.indexOf('icognocheck')]=hash;
        data=encode(self.keylist,self.arglist);
	
	var url = "http://www.cleverbot.com/webservicemin";
	

	request.post({url:url,
		      headers: headers, 
		      body: data}, handleParseAnswers);
    }

    this.ask = function(q){
	console.log("[CLEVERBOT] " + q);
	self.arglist[self.keylist.indexOf('stimulus')]=q;
        if (self.MsgList.length > 0){	    
	    self.arglist[self.keylist.indexOf('lineref')]='!0'+(self.MsgList.length/2);
        }
        self.send(handler);
        self.MsgList.push(q);
    }
    

    return this;

}


function encode(keylist, arglist){
    var text = "";
    for (var i=0; i < keylist.length; i++){
	var k = keylist[i];
	var v = encodeURIComponent(arglist[i]);
	text += (i===0 ? '' : '&') + k + '=' + v;
    }
    return text;
}

function parseAnswers(text){
    var d = {};
    var keys = ["text", "sessionid", "logurl", "vText8", "vText7", "vText6", "vText5", "vText4", "vText3",
                "vText2", "prevref", "foo", "emotionalhistory", "ttsLocMP3", "ttsLocTXT",
                "ttsLocTXT3", "ttsText", "lineRef", "lineURL", "linePOST", "lineChoices",
                "lineChoicesAbbrev", "typingData", "divert"];
    var values = text.split("\r")
    var i = 0
    for (var i=0; i < keys.length; i++){
	d[keys[i]] = values[i];
    }
    return d;
}

// test code
//var sess = Session(function(text){console.log(text)});
//sess.ask('hi');

exports.Session = Session
