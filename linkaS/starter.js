const loki = require('lokijs');
const log = require('./plugins/log.js');
const db = require('./plugins/db.js');

// 启动器, 用于初始化各种东西

function starte(){
	let $t = performance.now();
	log.out('INFO', '[初始化] 初始化进程开始!');

	// 初始化全局变量
	log.out('INFO', '[初始化] [变量] 正在初始化全局变量...');
	initial_var();

	// 初始化内存数据库
	log.out('INFO', '[初始化] [内存数据库] 正在初始化内存数据库...');
	initial_loki(function(){

		// 运行配置加载器
		log.out('INFO', '[初始化] [配置] 正在运行配置加载器...');
		initial_config();


		log.out('INFO', '[初始化] 初始化进程结束! [耗时'+ (performance.now() - $t) +'ms]');
	});
};


// 初始化全局变量
function initial_var(){
	// 全局变量
	$c = {
		config: {	// 系统配置
			due_mspt: 62,	// 预期mspt
			max_player_num: 64,		// 最大玩家数量
			max_message_num: 128,	// 最大暂存聊天数量
		},
		system: {	// 系统数据
			mspt: 0,	// mspt
			playerNum: 0,
		},
		db: {},	// 数据库
		Entity: {},	// 实体数据库
	};

	// 全局缓存
	$t = {
		queue_net: {	// 网络io队列
			tpAll: {},
			tpPlayer: {},
		},
		message: [],	// 聊天消息
	};
};

// 初始化内存数据库
function initial_loki(back){

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
			indices: ['id', 'type', 'name', 'place_x', 'place_y'],
		});

		back();
	};

};

// 配置加载器
function initial_config(){
	const fs = require('fs');
	const path = require("path");

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

	// 遍历配置目录
	travel('./config', (path) => {
		// 判断文件格式
		let $form = path.substring(path.lastIndexOf('.') + 1, path.length);
		if($form === 'js'){
			log.out('INFO', '[初始化] [配置] [JS] 正在运行: '+ path);
			// 运行js脚本
			let $tp = fs.readFileSync(path);
			new Function('db', $tp)(db);
		}
	});
};


module.exports = {
	starte,
};
