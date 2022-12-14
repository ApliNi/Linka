// LinkaS ... main


// 软件配置
$config = {
	// 服务器启动时间
	start_time: performance.now(),
	// 是否输出日志. 不影响 console.log(); 输出消息
	log_out: true,

	// MSPT
	mspt_main: 62,
	mspt_net: 62,

	// 最大玩家数量
	max_player_num: 64,
	// 存储多少条历史消息
	max_messageArray: 128,

	// 服务器根目录
	rootPath: require('path').resolve('./'),
};


// 启动开始
new Promise(function(resolve, reject){
	// 加载全局模块
	log = require($config.rootPath +'/lib/log.js');
	lib = require($config.rootPath +'/lib/lib.js');
	db = require($config.rootPath +'/lib/db.js');

	log.out('INFO', '[主线程] 服务器正在启动...');

	// 显示版本信息
	require($config.rootPath +'/lib/server_info.js');
	resolve();
})

// 运行启动器, 初始化数据
.then(function(){return new Promise(function(resolve, reject){
	const func = require($config.rootPath +'/starter.js');
	func.main(function(){
		$e.server.emit('starter.js_end');
		resolve();
	});
})})

// 启动循环
.then(function(){return new Promise(function(resolve, reject){
	$e.server.emit('loop.js_start');
	require($config.rootPath +'/loop.js');
	$e.server.emit('loop.js_end');
	resolve();
})})

// 启动网络程序
.then(function(){return new Promise(function(resolve, reject){
	$e.server.emit('net.js_start');
	require($config.rootPath +'/net.js');
	$e.server.emit('net.js_end');
	resolve();
})})

// 启动完成
.then(function(){
	log.out('INFO', '[主线程] 服务器启动完成! 耗时 '+ (performance.now() - $config.start_time) +'ms');
	$e.server.emit('index.js_end');
});














