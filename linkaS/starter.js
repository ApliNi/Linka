const loki = require('lokijs');
const EventEmitter = require('events').EventEmitter;

// 启动器, 用于初始化各种东西

function main(back){
	let $t = performance.now();
	log.out('INFO', '[初始化] 初始化进程开始!');


	// 初始化全局变量
	new Promise(function(resolve, reject){
		initial_var();
		resolve();
	})

	// 初始化内存数据库
	.then(function(){return new Promise(function(resolve, reject){
		initial_loki(function(){
			resolve();
		});
	})})

	// 运行配置加载器
	.then(function(){return new Promise(function(resolve, reject){
		initial_config();
		resolve();
	})})

	// 结束
	.then(function(){
		log.out('INFO', '[初始化] 初始化进程结束! 耗时 '+ (performance.now() - $t) +'ms');
		back();
	});
};


// 初始化全局变量
function initial_var(){
	log.out('INFO', '[初始化] [变量] 正在初始化全局变量...');
	// 全局变量
	$c = {
		system: {	// 系统数据
			mspt: 0,	// mspt
			playerNum: 0,	// 当前玩家数量
		},
		db: {},	// 与内存数据库建立连接
		Entity: {},	// 实体数据表
		Event: {},	// 事件数据表, 模块监听事件时将监听对象放进来, 触发事件前检查是否存在此事件名
	};

	// 全局缓存
	$t = {
		queue_net: {},	// 网络io队列
		message: [],	// 历史聊天消息
	};

	// 事件
	$e = {
		// 服务器内部事件
		server: new EventEmitter(),
		net: new EventEmitter(),
		loop: new EventEmitter(),

		// 客户端可触发的事件
		// mod: new EventEmitter(),
		player: new EventEmitter(),
	};
};

// 初始化内存数据库
function initial_loki(back){
	log.out('INFO', '[初始化] [内存数据库] 正在初始化内存数据库...');

	$c.db = new loki('linkas.loki.db.json', {
		autoload: true,
		autosave: false,
		// autosaveInterval: 4000,
		autoloadCallback: databaseInitialize,
	});

	function databaseInitialize(){
		log.out('INFO', '[初始化] [内存数据库] 正在创建基础数据和索引...');
		// 创建数据表

		// 实体表
		$c.Entity = $c.db.addCollection('Entity', {
			// 唯一约束
			unique: ['id'],
			// 二进制索引
			indices: [
				// 实体基础信息
				'id', 'type', 'name',
				// 坐标数组的索引
				'place_x', 'place_y', 'place_z', 'place_yaw', 'place_pitch',
				// 权限
				'power',
			],
		});

		// 事件表
		$c.Event = $c.db.addCollection('Event', {
			// 二进制索引
			indices: [
				// 事件类型
				'type',
				// 事件名
				'name',
			],
		});

		back();
	};

};

// 配置加载器
function initial_config(){
	log.out('INFO', '[初始化] [模块] 正在运行模块加载器...');

	const fs = require('fs');
	const path = require('path');

	// 返回文件路径
	function travel(dir, back){
		fs.readdirSync(dir).forEach((file) => {
			let pathname = path.join(dir, file);
			if(fs.statSync(pathname).isDirectory()){
				travel(pathname, back);
			}else{
				back(pathname);
			}
		});
	};

	// 遍历配置目录中的所有文件
	function ergodicPath($path){
		travel($path, (path) => {
			// 判断文件格式
			let $form = path.substring(path.lastIndexOf('.') + 1, path.length);
			if($form === 'js'){
				log.out('INFO', '[初始化] [模块] [JS] 正在运行: '+ path);
				$e.server.emit(path +'_start');
				require($config.rootPath +'/'+ path); // 运行js脚本
				$e.server.emit(path +'_end');
			}
		});
	}

	// 遍历目录数组
	[
		'./plugins',
		'./config',
	].forEach((e) => {
		ergodicPath(e);
	});
};


module.exports = {
	main,
};
