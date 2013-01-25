clientjs
=========

华为网盘js-sdk

引用JSSDK JavaScript文件
=========

在页面顶端加入如下代码

	<script src="http://st1.dbank.com/netdisk/components/xdr/client.js"></script>

使用
=========


*1.引入sdk*

>函数说明：初始化nspclient

>参数说明：appid 对应应用级appid 必填
    
	var nsp = new NSPClient(appid);

*2.判断登录*

>函数说明：判断当前用户是否登录，如果已经登录执行回调函数，如果没有登录跳转到登录页面。
    
	nsp.login(function(){
		//回调函数
	})

*3.调用api服务*


>nsp.api(order,params,callback)

>order  服务名称

>params 参数

>callback 回调


*4.调用实例*

(1) nsp.user.getInfo
	
	var nsp = new NSPClient('xxxxxx');
	nsp.login(function(){
		var userInfo = ['user.username', 'user.uid'];
		nsp.api('nsp.user.getInfo',{attrs:userInfo},function(data){
			console.log(data);
		});
	})
    返回:{"user.username":"test","user.uid":"123456"}

(2) nsp.vfs.lsdir

	var nsp = new NSPClient('xxxxxx');
	nsp.login(function(){
		var data = {
			'path':'/',
			'fields':'["name","size","type", "dirCount", "fileCount", "dbank_systemType", "dbank_isShared", "modifyTime"]'	    
		}
		nsp.api('nsp.vfs.lsdir',data,function(data){
			console.log(data);
		});
	})
    返回:{"childList":[{"name":"Netdisk","dirCount":"0","fileCount":"0","modifyTime":"2012-07-19 07:08:40","type":"Directory"}]}


版权
=========
此包里包括了以下两个功能，压缩js考虑到性能去掉版权信息：
*1.MD5 hash algorithm 具体版权属于 Muhammad Hussein Fattahizadeh < muhammad [AT] semnanweb [DOT] com > - MIT License: http://www.gnu.org/licenses/gpl.html*
*2.JSONP Core 具体版权属于 Julian Aubourg - MIT License: http://www.opensource.org/licenses/mit-license.php*





