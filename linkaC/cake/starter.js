
// 初始化全局变量
new Promise(function(resolve, reject){
	// 全局变量
	$c = {
		wsOK: false, // 已连接
		time: {	// 各种时间
			lastHave: 0,	// 最后接收数据包
			last_update_place_noRealTime: 0,	// 不需要实时更新位置的组件的最后位置更新时间
			ping: 0,		// 网络延迟
			mspt_ui: 0,		// 用户操作mspt
			mspt_tps: 0,	// 运算mspt
			mspt_server: 0,	// 服务器mspt
			player_move_start: 0, // ui循环中, 玩家开始移动前{ui_mspt}毫秒的时间
		},
		player: { // 用户数据
			id: '',
			key: '',
			name: (lib.fromUrl('name') === '')? '未命名玩家' : lib.fromUrl('name').substring(0, 16),
		},
		entity: {},	// 实体数据
		index_entity: {},	// 实体索引
		loop: { // 循环指标 and 循环id
			run: function (){},

			tps_time: 62,
			tps_func: function (){},
			tps: null,

			ui_time: 30,
			ui_func: function (){},
			ui: null,
		},

		plugins: {}, // 插件数据, 插件自己填充
	};


	// 全局缓存
	$t = {
		queue: {	// 队列
			move: [],	// 移动的实体的id
			attack: false,	// 玩家攻击
			disable_attack: false,
			overlap: [],	// 在自己的攻击范围内的实体 | 当前碰撞的实体
			// reRenderForWindowSize: false,	// 重新渲染, 根据窗口尺寸
		},
		npc_func: {
			pointerAdd: true,
			text: {
				addp: '',
				pre_id: '',
			},
			decision: {	// 玩家选择层
				enable: false,
				id_list: [],
				pointer: 0,
				id: -1,
			},
		},
		plugins: {},	// 插件数据, 自行填充
	};


	// 事件
	// 事件封装, 模仿 Node.js 中的 EventEmitter
	const EventEmitter = function(){
		return {
			// 基于 EventTarget
			EventTarget: new EventTarget(),
			// 触发事件
			emit: function($name){
				// 获取所有参数的数组: arguments
				this.EventTarget.dispatchEvent(new CustomEvent($name, {
					detail: Array.from(arguments).splice(1), // 删除第一个: 事件名称
				}));
			},
			// 监听器
			on: function($name, back){
				this.EventTarget.addEventListener($name, (e) => {back.apply(this, e.detail)});
			},
			// 移除监听器
			remove: function($name, func){
				this.EventTarget.removeEventListener($name, func);
			},
		};
	};
	$e = {
		// 系统事件
		system: new EventEmitter(),
		// 网络事件
		net: new EventEmitter(),
		// 用户操作相关事件
		ui: new EventEmitter(),
		// 玩家相关事件, 用于处理服务器返回的数据
		player: new EventEmitter(),
	};
	// $e.player.on('name', (e, a) => {
	// 	console.log(e, a);
	// });

	// $e.player.emit('name', '1123', '112');


	resolve();
})


.then(function(){return new Promise(function(resolve, reject){

})})

