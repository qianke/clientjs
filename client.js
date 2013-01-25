(function(win,doc){var NSPClient=function(appid,option){this.appid=appid;this.url="http://api.dbank.com/rest.php";this.loginUrl="http://login.dbank.com/login.php?appid="+this.appid;this.sidKey=option&&option.app?"app":"sid";if(option&&option.app){this.sidKey="app";this.sidValue=option.app}else{this.sidKey="sid";this.sidValue=option&&option.sid?option.sid:""}this.sid=option&&option.sid?option.sid:"";this.secret=option&&option.secret?option.secret:"";this.debug=option&&option.debug?option.debug:false};NSPClient.prototype.login=function(success){if(NSPHelper.getCookie("nsp_"+this.appid)){this.identity();success()}else{if(window.name.indexOf("nsp_app")==0&&this.appid==NSPHelper.getParam("nsp_app",window.name)){var windowName=window.name;var str="sid="+NSPHelper.getParam("session",windowName)+"&secret="+NSPHelper.getParam("secret",windowName);NSPHelper.setCookie("nsp_"+this.appid,str);this.identity();window.name="";success()}else{this.logout()}}};NSPClient.prototype.api=function(name,param,callback){var self=this;var API={},name,paramData,success;name=arguments[0];if(arguments.length==2){success=arguments[1]}else{if(arguments.length==3){paramData=arguments[1];success=arguments[2];for(var i in paramData){if(typeof paramData[i]==="object"){paramData[i]=NSPHelper.jsonToString(paramData[i])}API[i]=paramData[i]}}else{return}}API.nsp_svc=name;self.send(self.url,self.secret,API,success)};NSPClient.prototype.identity=function(){var cookie=NSPHelper.getCookie("nsp_"+this.appid);this.sidKey="sid";this.sidValue=NSPHelper.getParam("sid",cookie);this.secret=NSPHelper.getParam("secret",cookie)};NSPClient.prototype.logout=function(){if(NSPHelper.getCookie("nsp_"+this.appid)){NSPHelper.delCookie("nsp_"+this.appid)}window.name=encodeURIComponent(window.location.href);window.location.href=this.loginUrl};NSPClient.prototype.send=function(url,secret,param,callback){var self=this;param.nsp_ts=new Date().getTime();param["nsp_"+self.sidKey]=self.sidValue;param.nsp_fmt="JS";param.nsp_cb="_jqjsp";param=NSPHelper.encrypt(secret,param);ajax({url:url,data:param,dataType:"jsonp",timeout:30000,callbackParameter:"nsp_cb",success:function(data){if(data.NSP_STATUS&&(104==data.NSP_STATUS||102==data.NSP_STATUS||6==data.NSP_STATUS)&&!self.debug){}else{if(self.debug){var rt={data:data,url:url+"?"+NSPHelper.objToURIComponent(param)};callback(rt)}else{callback(data)}}},error:onerror})};var ajax=function(){function noop(){}function genericCallback(data){lastValue=[data]}function appendScript(node){head.insertBefore(node,head.firstChild)}function callIfDefined(method,object,parameters){return method&&method.apply(object.context||object,parameters)}function qMarkOrAmp(url){return/\?/.test(url)?"&":"?"}function encodeUrlParam(o){var parames="";for(key in o){if(Object.prototype.hasOwnProperty.call(o,key)){parames+=key+"="+o[key]+"&"}}return parames=parames.substring(0,parames.lastIndexOf("&"))}var STR_ASYNC="async",STR_CHARSET="charset",STR_EMPTY="",STR_ERROR="error",STR_JQUERY_JSONP="_jqjsp",STR_ON="on",STR_ONCLICK=STR_ON+"click",STR_ONERROR=STR_ON+STR_ERROR,STR_ONLOAD=STR_ON+"load",STR_ONREADYSTATECHANGE=STR_ON+"readystatechange",STR_REMOVE_CHILD="removeChild",STR_SCRIPT_TAG="<script/>",STR_SUCCESS="success",STR_TIMEOUT="timeout",head=document.getElementsByTagName("head")[0]||document.documentElement,pageCache={},count=0,lastValue;function jsonp(xOptions){xOptions.callback=STR_JQUERY_JSONP;var completeCallback=xOptions.complete,dataFilter=xOptions.dataFilter,callbackParameter=xOptions.callbackParameter,successCallbackName=xOptions.callback,cacheFlag=xOptions.cache,pageCacheFlag=xOptions.pageCache,charset=xOptions.charset,url=xOptions.url,data=xOptions.data,timeout=xOptions.timeout,pageCached,done=0,cleanUp=noop;xOptions.abort=function(){!done++&&cleanUp()};if(callIfDefined(xOptions.beforeSend,xOptions,[xOptions])===false||done){return xOptions}url=url||STR_EMPTY;data=data?((typeof data)=="string"?data:encodeUrlParam(data)):STR_EMPTY;url+=data?(qMarkOrAmp(url)+data):STR_EMPTY;function notifySuccess(json){!done++&&setTimeout(function(){cleanUp();pageCacheFlag&&(pageCache[url]={s:[json]});dataFilter&&(json=dataFilter.apply(xOptions,[json]));callIfDefined(xOptions.success,xOptions,[json,STR_SUCCESS]);callIfDefined(completeCallback,xOptions,[xOptions,STR_SUCCESS])},0)}function notifyError(type){!done++&&setTimeout(function(){cleanUp();pageCacheFlag&&type!=STR_TIMEOUT&&(pageCache[url]=type);callIfDefined(xOptions.error,xOptions,[xOptions,type]);callIfDefined(completeCallback,xOptions,[xOptions,type])},0)}pageCacheFlag&&(pageCached=pageCache[url])?(pageCached.s?notifySuccess(pageCached.s[0]):notifyError(pageCached)):setTimeout(function(script,scriptAfter,timeoutTimer){if(!done){timeoutTimer=timeout>0&&setTimeout(function(){notifyError(STR_TIMEOUT)},timeout);cleanUp=function(){timeoutTimer&&clearTimeout(timeoutTimer);script[STR_ONREADYSTATECHANGE]=script[STR_ONCLICK]=script[STR_ONLOAD]=script[STR_ONERROR]=null;head[STR_REMOVE_CHILD](script);scriptAfter&&head[STR_REMOVE_CHILD](scriptAfter)};window[successCallbackName]=genericCallback;script=document.createElement("script");script.id=STR_JQUERY_JSONP+count++;if(charset){script[STR_CHARSET]=charset}function callback(result){(script[STR_ONCLICK]||noop)();result=lastValue;lastValue=undefined;result?notifySuccess(result[0]):notifyError(STR_ERROR)}if(/msie/i.test(navigator.userAgent)){script.event=STR_ONCLICK;script.htmlFor=script.id;script[STR_ONREADYSTATECHANGE]=function(){/loaded|complete/.test(script.readyState)&&callback()}}else{script[STR_ONERROR]=script[STR_ONLOAD]=callback;/Opera/i.test(navigator.userAgent)?((scriptAfter=$(STR_SCRIPT_TAG)[0]).text="jQuery('#"+script.id+"')[0]."+STR_ONERROR+"()"):script[STR_ASYNC]=STR_ASYNC}script.src=url;appendScript(script);scriptAfter&&appendScript(scriptAfter)}},0);return xOptions}return jsonp}();var NSPHelper={sort:function(data){var jsonArr=[];var paramArr=[];for(var key in data){paramArr.push(key)}paramArr.sort();for(var i=0;i<paramArr.length;i++){jsonArr.push(paramArr[i]+data[paramArr[i]])}return jsonArr.join("")},encrypt:function(secret,params){var sdata=this.sort(params);var retString=secret+sdata;params.nsp_key=this.md5(retString).toLocaleUpperCase();return params},getCookie:function(name){var str=document.cookie.split(";");for(var i=0;i<str.length;i++){var str2=str[i].split("=");if(str2[0].replace(/^ | $/g,"")==name){return unescape(str2[1])}}},setCookie:function(name,value,path,expires){var exp=new Date();exp.setTime(exp.getTime()+expires*24*60*60*1000);document.cookie=name+"="+escape(value)+(path==null?"":";path="+path)+(expires==null?"":";expires="+exp.toGMTString())},delCookie:function(name,domain){var expires=new Date();expires.setTime(expires.getTime()-1);document.cookie=name+"=; expires="+expires.toGMTString()+(domain==null?"":"; domain="+domain)},getParam:function(name,str){var reg=new RegExp("(^|&)"+name+"=([^&]*)(&|$)");var r=str.match(reg);if(r!=null){return unescape(r[2])}return null},jsonToString:function(obj){switch(typeof(obj)){case"string":return'"'+obj.replace(/(["\\])/g,"\\$1")+'"';case"array":return"["+obj.map(this.jsonToString).join(",")+"]";case"object":if(obj instanceof Array){var strArr=[];var len=obj.length;for(var i=0;i<len;i++){strArr.push(this.jsonToString(obj[i]))}return"["+strArr.join(",")+"]"}else{if(obj==null){return"null"}else{var string=[];for(var property in obj){string.push(this.jsonToString(property)+":"+this.jsonToString(obj[property]))}return"{"+string.join(",")+"}"}}case"number":return obj;case false:return obj}},stringToJson:function(text){var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){return j=eval("("+text+")")}},md5:function(string){var rotateLeft=function(lValue,iShiftBits){return(lValue<<iShiftBits)|(lValue>>>(32-iShiftBits))};var addUnsigned=function(lX,lY){var lX4,lY4,lX8,lY8,lResult;lX8=(lX&2147483648);lY8=(lY&2147483648);lX4=(lX&1073741824);lY4=(lY&1073741824);lResult=(lX&1073741823)+(lY&1073741823);if(lX4&lY4){return(lResult^2147483648^lX8^lY8)}if(lX4|lY4){if(lResult&1073741824){return(lResult^3221225472^lX8^lY8)}else{return(lResult^1073741824^lX8^lY8)}}else{return(lResult^lX8^lY8)}};var F=function(x,y,z){return(x&y)|((~x)&z)};var G=function(x,y,z){return(x&z)|(y&(~z))};var H=function(x,y,z){return(x^y^z)};var I=function(x,y,z){return(y^(x|(~z)))};var FF=function(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(F(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b)};var GG=function(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(G(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b)};var HH=function(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(H(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b)};var II=function(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(I(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b)};var convertToWordArray=function(string){var lWordCount;var lMessageLength=string.length;var lNumberOfWordsTempOne=lMessageLength+8;var lNumberOfWordsTempTwo=(lNumberOfWordsTempOne-(lNumberOfWordsTempOne%64))/64;var lNumberOfWords=(lNumberOfWordsTempTwo+1)*16;var lWordArray=Array(lNumberOfWords-1);var lBytePosition=0;var lByteCount=0;while(lByteCount<lMessageLength){lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=(lWordArray[lWordCount]|(string.charCodeAt(lByteCount)<<lBytePosition));lByteCount++}lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=lWordArray[lWordCount]|(128<<lBytePosition);lWordArray[lNumberOfWords-2]=lMessageLength<<3;lWordArray[lNumberOfWords-1]=lMessageLength>>>29;return lWordArray};var wordToHex=function(lValue){var WordToHexValue="",WordToHexValueTemp="",lByte,lCount;for(lCount=0;lCount<=3;lCount++){lByte=(lValue>>>(lCount*8))&255;WordToHexValueTemp="0"+lByte.toString(16);WordToHexValue=WordToHexValue+WordToHexValueTemp.substr(WordToHexValueTemp.length-2,2)}return WordToHexValue};var uTF8Encode=function(string){string=string.replace(/\x0d\x0a/g,"\x0a");var output="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){output+=String.fromCharCode(c)}else{if((c>127)&&(c<2048)){output+=String.fromCharCode((c>>6)|192);output+=String.fromCharCode((c&63)|128)}else{output+=String.fromCharCode((c>>12)|224);output+=String.fromCharCode(((c>>6)&63)|128);output+=String.fromCharCode((c&63)|128)}}}return output};var x=Array();var k,AA,BB,CC,DD,a,b,c,d;var S11=7,S12=12,S13=17,S14=22;var S21=5,S22=9,S23=14,S24=20;var S31=4,S32=11,S33=16,S34=23;var S41=6,S42=10,S43=15,S44=21;string=uTF8Encode(string);x=convertToWordArray(string);a=1732584193;b=4023233417;c=2562383102;d=271733878;for(k=0;k<x.length;k+=16){AA=a;BB=b;CC=c;DD=d;a=FF(a,b,c,d,x[k+0],S11,3614090360);d=FF(d,a,b,c,x[k+1],S12,3905402710);c=FF(c,d,a,b,x[k+2],S13,606105819);b=FF(b,c,d,a,x[k+3],S14,3250441966);a=FF(a,b,c,d,x[k+4],S11,4118548399);d=FF(d,a,b,c,x[k+5],S12,1200080426);c=FF(c,d,a,b,x[k+6],S13,2821735955);b=FF(b,c,d,a,x[k+7],S14,4249261313);a=FF(a,b,c,d,x[k+8],S11,1770035416);d=FF(d,a,b,c,x[k+9],S12,2336552879);c=FF(c,d,a,b,x[k+10],S13,4294925233);b=FF(b,c,d,a,x[k+11],S14,2304563134);a=FF(a,b,c,d,x[k+12],S11,1804603682);d=FF(d,a,b,c,x[k+13],S12,4254626195);c=FF(c,d,a,b,x[k+14],S13,2792965006);b=FF(b,c,d,a,x[k+15],S14,1236535329);a=GG(a,b,c,d,x[k+1],S21,4129170786);d=GG(d,a,b,c,x[k+6],S22,3225465664);c=GG(c,d,a,b,x[k+11],S23,643717713);b=GG(b,c,d,a,x[k+0],S24,3921069994);a=GG(a,b,c,d,x[k+5],S21,3593408605);d=GG(d,a,b,c,x[k+10],S22,38016083);c=GG(c,d,a,b,x[k+15],S23,3634488961);b=GG(b,c,d,a,x[k+4],S24,3889429448);a=GG(a,b,c,d,x[k+9],S21,568446438);d=GG(d,a,b,c,x[k+14],S22,3275163606);c=GG(c,d,a,b,x[k+3],S23,4107603335);b=GG(b,c,d,a,x[k+8],S24,1163531501);a=GG(a,b,c,d,x[k+13],S21,2850285829);d=GG(d,a,b,c,x[k+2],S22,4243563512);c=GG(c,d,a,b,x[k+7],S23,1735328473);b=GG(b,c,d,a,x[k+12],S24,2368359562);a=HH(a,b,c,d,x[k+5],S31,4294588738);d=HH(d,a,b,c,x[k+8],S32,2272392833);c=HH(c,d,a,b,x[k+11],S33,1839030562);b=HH(b,c,d,a,x[k+14],S34,4259657740);a=HH(a,b,c,d,x[k+1],S31,2763975236);d=HH(d,a,b,c,x[k+4],S32,1272893353);c=HH(c,d,a,b,x[k+7],S33,4139469664);b=HH(b,c,d,a,x[k+10],S34,3200236656);a=HH(a,b,c,d,x[k+13],S31,681279174);d=HH(d,a,b,c,x[k+0],S32,3936430074);c=HH(c,d,a,b,x[k+3],S33,3572445317);b=HH(b,c,d,a,x[k+6],S34,76029189);a=HH(a,b,c,d,x[k+9],S31,3654602809);d=HH(d,a,b,c,x[k+12],S32,3873151461);c=HH(c,d,a,b,x[k+15],S33,530742520);b=HH(b,c,d,a,x[k+2],S34,3299628645);a=II(a,b,c,d,x[k+0],S41,4096336452);d=II(d,a,b,c,x[k+7],S42,1126891415);c=II(c,d,a,b,x[k+14],S43,2878612391);b=II(b,c,d,a,x[k+5],S44,4237533241);a=II(a,b,c,d,x[k+12],S41,1700485571);d=II(d,a,b,c,x[k+3],S42,2399980690);c=II(c,d,a,b,x[k+10],S43,4293915773);b=II(b,c,d,a,x[k+1],S44,2240044497);a=II(a,b,c,d,x[k+8],S41,1873313359);d=II(d,a,b,c,x[k+15],S42,4264355552);c=II(c,d,a,b,x[k+6],S43,2734768916);b=II(b,c,d,a,x[k+13],S44,1309151649);a=II(a,b,c,d,x[k+4],S41,4149444226);d=II(d,a,b,c,x[k+11],S42,3174756917);c=II(c,d,a,b,x[k+2],S43,718787259);b=II(b,c,d,a,x[k+9],S44,3951481745);a=addUnsigned(a,AA);b=addUnsigned(b,BB);c=addUnsigned(c,CC);d=addUnsigned(d,DD)}var tempValue=wordToHex(a)+wordToHex(b)+wordToHex(c)+wordToHex(d);return tempValue.toLowerCase()},objToURIComponent:function(obj){var str="";for(var item in obj){str+=str?"&"+item+"="+obj[item]:item+"="+obj[item]}return str}};win.NSPClient=NSPClient})(window);