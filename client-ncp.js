(function(win, doc){
	/**
     * NSPClient Class
     * @param {string} appid 第三方开发者的appid
	 * @param {obj} option 扩展属性:
	 *				option.sid 手动输入sid
	 *				option.secret 手动输入secret
	 *				option.debug 进入调试模式，如果调试模式遇到sid/secret问题不做处理
     * @return undefined
     */
	var NSPClient = function(appid,option){
		this.appid = appid;		
		this.url = 'http://api.dbank.com/rest.php';
		this.loginUrl = 'http://login.dbank.com/login.php?appid='+this.appid;
		this.sidKey = option && option.app ? 'app' : 'sid';
		if(option && option.app){
			this.sidKey = 'app';
			this.sidValue = option.app;
		}
		else{
			this.sidKey = 'sid';
			this.sidValue = option && option.sid ? option.sid : '';
		}
		this.sid = option && option.sid ? option.sid : '';
		this.secret = option && option.secret ? option.secret : '';
		this.debug = option && option.debug ? option.debug : false;
	}
	/**
     * 检查是否登录
     * @param {function} success 回调函数
     * @return undefined
     */
	NSPClient.prototype.login = function(success){
		if(NSPHelper.getCookie('nsp_'+this.appid)){
			this.identity();
			success();
		}
		else if(window.name.indexOf('nsp_app') == 0 && this.appid == NSPHelper.getParam('nsp_app',window.name)){
			var windowName = window.name;
			var str = 'sid='+NSPHelper.getParam('session',windowName)+'&secret='+NSPHelper.getParam('secret',windowName);
			NSPHelper.setCookie('nsp_'+this.appid,str);
			this.identity();
			window.name = '';
			success();
		}
		else{
			this.logout();
		}
		
	}
	/**
     * api请求
     * @param {string} name 命令字 eg. 'nsp.user.getInfo'
	 *		  {obj} param 参数对像 eg. {attrs:['user.uid','user.username']} 可选
	 *		  {function} callback 成功回调函数 可选
     * @return undefined
     */
	NSPClient.prototype.api = function(name,param,callback){
			var self = this;
			var API = {},name,paramData,success;			
			name = arguments[0];
			if(arguments.length == 2){
                success = arguments[1];
            }
            else if(arguments.length == 3){                
                paramData = arguments[1];
                success = arguments[2];
				for(var i in paramData){
					if(typeof paramData[i]  === 'object'){
						paramData[i] = NSPHelper.jsonToString(paramData[i]);
					}
					API[i] = paramData[i];
				}
            }else{
                return;
            }
			API["nsp_svc"] = name;
			self.send(self.url,self.secret,API,success);
	}
	/**
     * 分解cookie信息得到this.sid&this.secret
     * @return undefined
     */
	NSPClient.prototype.identity = function(){
		var cookie = NSPHelper.getCookie('nsp_'+this.appid);
		//this.sid = NSPHelper.getParam('sid',cookie);
		this.sidKey = 'sid';
		this.sidValue = NSPHelper.getParam('sid',cookie);
		this.secret = NSPHelper.getParam('secret',cookie);
	}
	/**
     * 退出 清除当前cookie跳转到登录页面
     * @return undefined
     */
	NSPClient.prototype.logout = function(){
		if(NSPHelper.getCookie('nsp_'+this.appid)){
			NSPHelper.delCookie('nsp_'+this.appid);
		}
		window.name = encodeURIComponent(window.location.href);
		window.location.href=this.loginUrl;
	}

	/**
	 * 组装数据,发送jsonp请求
	 * @param {string} url 请求地址 
	 *		  {string} sid sid
	 *		  {string} secret secret
	 *		  {object} data 请求数据
	 *		  {function} callback 成功回调函数
	 * @return undefined
	 */
	NSPClient.prototype.send = function(url,secret,param,callback){
			var self = this;
			param["nsp_ts"] = new Date().getTime();
			param["nsp_"+self.sidKey] = self.sidValue;
			param["nsp_fmt"] = 'JS';
			param['nsp_cb'] = '_jqjsp';
			param = NSPHelper.encrypt(secret,param);
			ajax({
				url: url,
				data:param,
				dataType: "jsonp",
				timeout: 30000,
				callbackParameter: "nsp_cb",
				success: function(data){
					//sid过期的情况，后台未返回有效数据					
					if(data.NSP_STATUS && (104 == data.NSP_STATUS ||102 == data.NSP_STATUS || 6 == data.NSP_STATUS) && !self.debug){
						//self.logout();
					}
					else{
						if (self.debug){
							var rt = {data: data, url: url + '?' + NSPHelper.objToURIComponent(param)};
							callback(rt);
						} else {
							callback(data);
						}
					}
				},			
				error: onerror
			});	
	}

	/**
	 * 组装jsonp请求
	 * @return {function} jsonp
	 */
	 /*
	 * jQuery JSONP Core Plugin 2.1.4 (2010-11-17)
	 * 
	 * http://code.google.com/p/jquery-jsonp/
	 *
	 * Copyright (c) 2010 Julian Aubourg
	 *
	 * This document is licensed as free software under the terms of the
	 * MIT License: http://www.opensource.org/licenses/mit-license.php
	 */
	var ajax =function(){
		function noop() {
		}		
		// Generic callback
		function genericCallback( data ) {
			lastValue = [ data ];
		}

		// Add script to document
		function appendScript( node ) {
			head.insertBefore( node , head.firstChild );
		}
		
		// Call if defined
		function callIfDefined( method , object , parameters ) {
			return method && method.apply( object.context || object , parameters );
		}
		
		// Give joining character given url
		function qMarkOrAmp( url ) {
			return /\?/ .test( url ) ? "&" : "?";
		}
		function encodeUrlParam(o){
  			var parames = "";
	   		for(key in o) {
	   			if(Object.prototype.hasOwnProperty.call(o,key)){
	   				parames +=key +"="+ o[key]+"&"
	   			}
	   		}
	   		return parames =parames.substring(0,parames.lastIndexOf("&"));
	  	};
	
		var // String constants (for better minification)
			STR_ASYNC = "async",
			STR_CHARSET = "charset",
			STR_EMPTY = "",
			STR_ERROR = "error",
			STR_JQUERY_JSONP = "_jqjsp",
			STR_ON = "on",
			STR_ONCLICK = STR_ON + "click",
			STR_ONERROR = STR_ON + STR_ERROR,
			STR_ONLOAD = STR_ON + "load",
			STR_ONREADYSTATECHANGE = STR_ON + "readystatechange",
			STR_REMOVE_CHILD = "removeChild",
			STR_SCRIPT_TAG = "<script/>",
			STR_SUCCESS = "success",
			STR_TIMEOUT = "timeout",
			
			// Head element (for faster use)
			head = document.getElementsByTagName("head")[0] || document.documentElement,
			// Page cache
			pageCache = {},
			// Counter
			count = 0,
			// Last returned value
			lastValue
			function jsonp( xOptions ) {
				xOptions.callback = STR_JQUERY_JSONP;
				// Build data with default
				
				// References to xOptions members (for better minification)
				var completeCallback = xOptions.complete,
					dataFilter = xOptions.dataFilter,
					callbackParameter = xOptions.callbackParameter,
					successCallbackName = xOptions.callback,
					cacheFlag = xOptions.cache,
					pageCacheFlag = xOptions.pageCache,
					charset = xOptions.charset,
					url = xOptions.url,
					data = xOptions.data,
					timeout = xOptions.timeout,
					pageCached,
					
					// Abort/done flag
					done = 0,
					
					// Life-cycle functions
					cleanUp = noop;
				
				// Create the abort method
				xOptions.abort = function() { 
					! done++ &&	cleanUp(); 
				};

				// Call beforeSend if provided (early abort if false returned)
				if ( callIfDefined( xOptions.beforeSend, xOptions , [ xOptions ] ) === false || done ) {
					return xOptions;
				}
					
				// Control entries
				url = url || STR_EMPTY;
				data = data ? ( (typeof data) == "string" ? data : encodeUrlParam(data) ) : STR_EMPTY;
					
				// Build final url
				url += data ? ( qMarkOrAmp( url ) + data ) : STR_EMPTY;
				
				// Add callback parameter if provided as option
				//callbackParameter && ( url += qMarkOrAmp( url ) + encodeURIComponent( callbackParameter ) + "=?" );
				
				// Add anticache parameter if needed
				
				// Replace last ? by callback parameter
				//url = url.replace( /=\?(&|$)/ , "=" + successCallbackName + "$1" );
				
				// Success notifier
				function notifySuccess( json ) {
					! done++ && setTimeout( function() {
						cleanUp();
						// Pagecache if needed
						pageCacheFlag && ( pageCache [ url ] = { s: [ json ] } );
						// Apply the data filter if provided
						dataFilter && ( json = dataFilter.apply( xOptions , [ json ] ) );
						// Call success then complete
						callIfDefined( xOptions.success , xOptions , [ json , STR_SUCCESS ] );
						callIfDefined( completeCallback , xOptions , [ xOptions , STR_SUCCESS ] );
					} , 0 );
				}
				
				// Error notifier
				function notifyError( type ) {
					! done++ && setTimeout( function() {
						// Clean up
						cleanUp();
						// If pure error (not timeout), cache if needed
						pageCacheFlag && type != STR_TIMEOUT && ( pageCache[ url ] = type );
						// Call error then complete
						callIfDefined( xOptions.error , xOptions , [ xOptions , type ] );
						callIfDefined( completeCallback , xOptions , [ xOptions , type ] );
					} , 0 );
				}
				
				// Check page cache
				pageCacheFlag && ( pageCached = pageCache[ url ] ) 
					? ( pageCached.s ? notifySuccess( pageCached.s[ 0 ] ) : notifyError( pageCached ) )
					:
					// Initiate request
					setTimeout( function( script , scriptAfter , timeoutTimer ) {
						
						if ( ! done ) {
						
							// If a timeout is needed, install it
							timeoutTimer = timeout > 0 && setTimeout( function() {
								notifyError( STR_TIMEOUT );
							} , timeout );
							
							// Re-declare cleanUp function
							cleanUp = function() {
								timeoutTimer && clearTimeout( timeoutTimer );
								script[ STR_ONREADYSTATECHANGE ]
									= script[ STR_ONCLICK ]
									= script[ STR_ONLOAD ]
									= script[ STR_ONERROR ]
									= null;
								head[ STR_REMOVE_CHILD ]( script );
								scriptAfter && head[ STR_REMOVE_CHILD ]( scriptAfter );
							};
							
							// Install the generic callback
							// (BEWARE: global namespace pollution ahoy)
							window[ successCallbackName ] = genericCallback;

							// Create the script tag
							script = document.createElement('script');
							script.id = STR_JQUERY_JSONP + count++;
							
							// Set charset if provided
							if ( charset ) {
								script[ STR_CHARSET ] = charset;
							}
							
							// Callback function
							function callback( result ) {
								( script[ STR_ONCLICK ] || noop )();
								result = lastValue;
								lastValue = undefined;
								result ? notifySuccess( result[ 0 ] ) : notifyError( STR_ERROR );
							}
												
							// IE: event/htmlFor/onclick trick
							// One can't rely on proper order for onreadystatechange
							// We have to sniff since FF doesn't like event & htmlFor... at all
							if ( /msie/i.test(navigator.userAgent)) {
								
								script.event = STR_ONCLICK;
								script.htmlFor = script.id;
								script[ STR_ONREADYSTATECHANGE ] = function() {
									/loaded|complete/.test( script.readyState ) && callback();
								};
								
							// All others: standard handlers
							} else {					
							
								script[ STR_ONERROR ] = script[ STR_ONLOAD ] = callback;
								
								/Opera/i.test(navigator.userAgent) ?
									
									// Opera: onerror is not called, use synchronized script execution
									( ( scriptAfter = $( STR_SCRIPT_TAG )[ 0 ] ).text = "jQuery('#" + script.id + "')[0]." + STR_ONERROR + "()" )
									
									// Firefox: set script as async to avoid blocking scripts (3.6+ only)
									: script[ STR_ASYNC ] = STR_ASYNC;
									
								;
							}
							
							// Set source
							script.src = url;
							
							
						
							
							// Append main script
							appendScript( script );
							
							// Opera: Append trailing script
							scriptAfter && appendScript( scriptAfter );
						}
						
					} , 0 );
				
				return xOptions;
			}
			return jsonp
	}();
	/*工具类*/
	var NSPHelper ={
		/**
		 * 对象转换成数组
		 * @param {obj} data 需要转换的对象
		 * @return {array} 生成数组
		 */
		sort:function(data){
			var jsonArr = [];
			var paramArr = [];
			for(var key in data){
				paramArr.push(key);
			}
			paramArr.sort();
			for(var i=0;i<paramArr.length;i++){
				jsonArr.push(paramArr[i]+data[paramArr[i]]);
			}			
			return jsonArr.join("");
		},
		/**
		 * 给对象插入nsp_key键
		 * @param {string} secret 需要secret
		 * @param {obj} params 需要插入的对象
		 * @return {obj} 生成新对象
		 */
		encrypt:function(secret,params){
			var sdata = this.sort(params);
			var retString = secret + sdata;
			params.nsp_key = this.md5(retString).toLocaleUpperCase();
			return params;
		},
		/**
		 * 获得cookie
		 * @param {string} name 通过cookie的key查找value
		 * @return undefined
		 */
		getCookie : function(name) {
				var str = document.cookie.split(";");
			    for(var i=0;i<str.length;i++){
			     var str2=str[i].split("=");
			       if(str2[0].replace(/^ | $/g,'')==name)return unescape(str2[1]);
			    }
			},
		/**
		 * 设置cookie
		 * @param {string} name cookie的key
		 * @param {string} value 要设置的cookie的value
		 * @param {string} path path路径 可选
		 * @param {string} expires expires 可选
		 * @return undefined
		 */
		setCookie : function(name,value,path,expires){
		    var exp  = new Date();
		    exp.setTime(exp.getTime() + expires*24*60*60*1000);
		    document.cookie = name + "="+ escape (value)+(path==null?"":";path=" + path) +(expires==null?"":";expires=" + exp.toGMTString());
		},
		/**
		 * 删除cookie
		 * @param {string} name
		 * @param {string} domain
		 * @return undefined 
		 */
		delCookie:function(name,domain){
			
			var expires = new Date();
			expires.setTime(expires.getTime()-1);//将expires设为一个过去的日期，浏览器会自动删除它
			document.cookie = name+"=; expires="+expires.toGMTString()+(domain==null?"":"; domain="+domain);
		},
		/**
		 * 查找字符串中是否包含key，获得对应的value 
		 * @param {string} name eg. age
		 * @param {string} str eg. name=zhang&age=31
		 * @return {string} 返回对应的value 返回 31
		 */
		getParam : function(name,str){ 
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); 
			var r = str.match(reg); 
			if (r!=null) { 
				return unescape(r[2]); 
			} 
			return null; 
		}, 
		/**
		* 对象转换成字符串
		* @param {object} obj 需要转换的对象
		* @return {string} 返回一个字符串
		*/
		jsonToString : function(obj){
			switch(typeof(obj)){ 
				 case 'string': 
					 return '"' + obj.replace(/(["\\])/g, '\\$1') + '"'; 
				 case 'array': 
					 return '[' + obj.map(this.jsonToString).join(',') + ']'; 
				 case 'object': 
					  if(obj instanceof Array){ 
						 var strArr = []; 
						 var len = obj.length; 
						 for(var i=0; i<len; i++){ 
							 strArr.push(this.jsonToString(obj[i])); 
						 } 
						 return '[' + strArr.join(',') + ']'; 
					 }else if(obj==null){ 
						 return 'null'; 
		
					 }else{ 
						 var string = []; 
						 for (var property in obj) string.push(this.jsonToString(property) + ':' + this.jsonToString(obj[property])); 
						 return '{' + string.join(',') + '}'; 
					 } 
				 case 'number': 
					 return obj; 
				 case false : 
					 return obj; 
			 }
		},
		/**
		* 字符串转换成JSON
		* @param {string} text 需要转换的对象
		* @return {obj} 返回一个JSON
		*/
		stringToJson :function(text){
			var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
            }
			text = String(text);
			cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
			if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))){
                return j = eval('(' + text + ')');
            }
		},
		/**
		* md5加密
		* @param {string} string 需要转换的字符串
		* @return {string} 返回加密之后的字符串
		*/
		/**
		 * jQuery MD5 hash algorithm function
		 * 
		 * 	<code>
		 * 		Calculate the md5 hash of a String 
		 * 		String $.md5 ( String str )
		 * 	</code>
		 * 
		 * Calculates the MD5 hash of str using the » RSA Data Security, Inc. MD5 Message-Digest Algorithm, and returns that hash. 
		 * MD5 (Message-Digest algorithm 5) is a widely-used cryptographic hash function with a 128-bit hash value. MD5 has been employed in a wide variety of security applications, and is also commonly used to check the integrity of data. The generated hash is also non-reversable. Data cannot be retrieved from the message digest, the digest uniquely identifies the data.
		 * MD5 was developed by Professor Ronald L. Rivest in 1994. Its 128 bit (16 byte) message digest makes it a faster implementation than SHA-1.
		 * This script is used to process a variable length message into a fixed-length output of 128 bits using the MD5 algorithm. It is fully compatible with UTF-8 encoding. It is very useful when u want to transfer encrypted passwords over the internet. If you plan using UTF-8 encoding in your project don't forget to set the page encoding to UTF-8 (Content-Type meta tag). 
		 * This function orginally get from the WebToolkit and rewrite for using as the jQuery plugin.
		 * 
		 * Example
		 * 	Code
		 * 		<code>
		 * 			$.md5("I'm Persian."); 
		 * 		</code>
		 * 	Result
		 * 		<code>
		 * 			"b8c901d0f02223f9761016cfff9d68df"
		 * 		</code>
		 * 
		 * @alias Muhammad Hussein Fattahizadeh < muhammad [AT] semnanweb [DOT] com >
		 * @link http://www.semnanweb.com/jquery-plugin/md5.html
		 * @see http://www.webtoolkit.info/
		 * @license http://www.gnu.org/licenses/gpl.html [GNU General Public License]
		 * @param {jQuery} {md5:function(string))
		 * @return string
		 */
		md5 : function(string){
			var rotateLeft = function(lValue, iShiftBits) {
				return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
			}	
			var addUnsigned = function(lX, lY) {
				var lX4, lY4, lX8, lY8, lResult;
				lX8 = (lX & 0x80000000);
				lY8 = (lY & 0x80000000);
				lX4 = (lX & 0x40000000);
				lY4 = (lY & 0x40000000);
				lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
				if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
				if (lX4 | lY4) {
					if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
					else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ lX8 ^ lY8);
				}
			}	
			var F = function(x, y, z) {
				return (x & y) | ((~ x) & z);
			}	
			var G = function(x, y, z) {
				return (x & z) | (y & (~ z));
			}		
			var H = function(x, y, z) {
				return (x ^ y ^ z);
			}		
			var I = function(x, y, z) {
				return (y ^ (x | (~ z)));
			}		
			var FF = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};		
			var GG = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};		
			var HH = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};		
			var II = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};		
			var convertToWordArray = function(string) {
				var lWordCount;
				var lMessageLength = string.length;
				var lNumberOfWordsTempOne = lMessageLength + 8;
				var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
				var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
				var lWordArray = Array(lNumberOfWords - 1);
				var lBytePosition = 0;
				var lByteCount = 0;
				while (lByteCount < lMessageLength) {
					lWordCount = (lByteCount - (lByteCount % 4)) / 4;
					lBytePosition = (lByteCount % 4) * 8;
					lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
					lByteCount++;
				}
				lWordCount = (lByteCount - (lByteCount % 4)) / 4;
				lBytePosition = (lByteCount % 4) * 8;
				lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
				lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
				lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
				return lWordArray;
			};	
			var wordToHex = function(lValue) {
				var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
				for (lCount = 0; lCount <= 3; lCount++) {
					lByte = (lValue >>> (lCount * 8)) & 255;
					WordToHexValueTemp = "0" + lByte.toString(16);
					WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
				}
				return WordToHexValue;
			};		
			var uTF8Encode = function(string) {
				string = string.replace(/\x0d\x0a/g, "\x0a");
				var output = "";
				for (var n = 0; n < string.length; n++) {
					var c = string.charCodeAt(n);
					if (c < 128) {
						output += String.fromCharCode(c);
					} else if ((c > 127) && (c < 2048)) {
						output += String.fromCharCode((c >> 6) | 192);
						output += String.fromCharCode((c & 63) | 128);
					} else {
						output += String.fromCharCode((c >> 12) | 224);
						output += String.fromCharCode(((c >> 6) & 63) | 128);
						output += String.fromCharCode((c & 63) | 128);
					}
				}
				return output;
			};		
			var x = Array();
			var k, AA, BB, CC, DD, a, b, c, d;
			var S11=7, S12=12, S13=17, S14=22;
			var S21=5, S22=9 , S23=14, S24=20;
			var S31=4, S32=11, S33=16, S34=23;
			var S41=6, S42=10, S43=15, S44=21;
			string = uTF8Encode(string);
			x = convertToWordArray(string);
			a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
			for (k = 0; k < x.length; k += 16) {
				AA = a; BB = b; CC = c; DD = d;
				a = FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
				d = FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
				c = FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
				b = FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
				a = FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
				d = FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
				c = FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
				b = FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
				a = FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
				d = FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
				c = FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
				b = FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
				a = FF(a, b, c, d, x[k+12], S11, 0x6B901122);
				d = FF(d, a, b, c, x[k+13], S12, 0xFD987193);
				c = FF(c, d, a, b, x[k+14], S13, 0xA679438E);
				b = FF(b, c, d, a, x[k+15], S14, 0x49B40821);
				a = GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
				d = GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
				c = GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
				b = GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
				a = GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
				d = GG(d, a, b, c, x[k+10], S22, 0x2441453);
				c = GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
				b = GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
				a = GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
				d = GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
				c = GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
				b = GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
				a = GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
				d = GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
				c = GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
				b = GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
				a = HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
				d = HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
				c = HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
				b = HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
				a = HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
				d = HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
				c = HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
				b = HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
				a = HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
				d = HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
				c = HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
				b = HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
				a = HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
				d = HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
				c = HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
				b = HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
				a = II(a, b, c, d, x[k+0],  S41, 0xF4292244);
				d = II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
				c = II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
				b = II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
				a = II(a, b, c, d, x[k+12], S41, 0x655B59C3);
				d = II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
				c = II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
				b = II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
				a = II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
				d = II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
				c = II(c, d, a, b, x[k+6],  S43, 0xA3014314);
				b = II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
				a = II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
				d = II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
				c = II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
				b = II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
				a = addUnsigned(a, AA);
				b = addUnsigned(b, BB);
				c = addUnsigned(c, CC);
				d = addUnsigned(d, DD);
			}
			var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
			return tempValue.toLowerCase();
		
		},
		/**
		 *将对象转换为url查询字符串
		 * @param object 需要转换的对象
		 * @return string 转换后的字符串
		*/
		objToURIComponent: function (obj) {
			var str = '';
			for (var item in obj){
				str += str ? '&' + item + '=' + obj[item] : item + '=' + obj[item];
			}
			return str;
		}
	}
	win.NSPClient = NSPClient;
})(window)