const WebSocket = require('ws');
const lib = require('./lib.js');

// 全局变量
$c = {
	config: {	// 系统配置
		due_mspt: 62,	// 预期mspt
		max_player_num: 64,		// 最大玩家数量
		max_message_num: 64,	// 最大聊天消息数量
	},
	system: {	// 系统数据
		mspt: 0,	// mspt
	},
	entity: {},	// 实体数据
	index_entity: {	// 实体索引
		type: {	// 类型索引
			player: [],
			mob: [],
		},
	},
	file: [	// 配置文件列表
		'config/npc.js',
	]
};

// 全局缓存
$t = {
	queue_net: {	// 网络io队列
		tpAll: {},
		tpPlayer: {},
	},
	message: [],	// 聊天消息
};


// 加载文件
load_file();
function load_file(){
	let fs = require('fs');

	// 遍历文件列表
	$c.file.forEach((e) => {
		console.log('正在加载配置 '+ e +' ...');
		let $tp = fs.readFileSync(e);
		// 解析文件运行js配置
		new Function($tp)();
	});
};



console.log('正在启动 WebSocket...');
const wss = new WebSocket.Server({ // 创建一个WebSocketServer实例
	port: 2027,
	//ssl_key: 'cert/8837686_linkas.ipacel.cc.key',
	//ssl_cert: 'cert/8837686_linkas.ipacel.cc.crt',
});
wss.on('connection', (ws) => {

	// 通讯: 客户端和服务端均通过发送数组, 软件通过遍历数组得到所有数据内容, 再将这些内容交给主程序处理
	// {
	// 	id: 玩家id,
	// 	key: 通讯密钥,
	// 	data: {数据内容},
	// }

	// 收到消息
	ws.on('message', (m) => {
		let $funcStartTime = Date.now();
		let $tp = lib.toJSON(m);

		//console.log(JSON.stringify($tp));

		if(lib.is($tp) === '[object Object]'		// 判断格式是否正确
		&& lib.is($tp?.data) === '[object Array]'
		&& lib.is($tp?.id) === '[object String]'	// 判断id和key是否存在
		&& lib.is($tp?.key) === '[object String]'
		&& lib.is($tp?.time) === '[object Number]'	// 判断时间数据, 以及是否超时
		&& $tp.time < ($funcStartTime - 30 * 1000) === false
		&& ($tp.data).length >= 1					// 判断数据长度是否正常
		&& ($tp.data).length <= 16
		){
			let $s = _for();
			function _for(){
				// 遍历数据数组
				let $s = $tp.data.forEach((e) => {
					// 转换为单个数据的格式
					let $s = main({
						id: $tp.id,
						key: $tp.key,
						data: e,
					}, ws, $tp.time);
					if($s === false){return false;};
				});
				return ($s);
			}

			if($s === false){
				console.log('无效数据');
			}

			// 如果玩家在服务器中
			if(typeof $c.entity[$tp.id] === 'object'){
				// 更新上次连接时间
				$c.entity[$tp.id].time.lastHave = $funcStartTime;

				// 判断最近1秒是否有发送数据
				if($c.entity[$tp.id].time.ping < $funcStartTime - 1000){
					// 创建ping数据
					lib.to_queue_net($tp.id, 'ping', {
						type: 'ping',
						clientSend: $tp.time,
						serverHave: $funcStartTime,
						mspt: $c.system.mspt,
					});
					// 更新发送ping数据的时间
					$c.entity[$tp.id].time.ping = $funcStartTime;
				}
			}

		}else{
			console.log('无效数据');
		}
	});

	// 连接断开
	ws.on('close', (error) => {
		console.log('[/] 连接断开: '+ ws.id + ': '+ error);
		if(typeof ws.id === 'string') lib.logoutClient(ws.id);
	});

	// 连接丢失
	ws.on('disconnect', (error) => {
		console.log('[/] 连接丢失: '+ ws.id + ': '+ error);
		if(typeof ws.id === 'string') lib.logoutClient(ws.id);
	});

});

console.log('正在初始化程序和循环...');

// tps循环
setInterval(function(){
	// 循环开始, 记录时间戳
	let $funcStartTime = Date.now();

	// 遍历所有玩家
	$c.index_entity.type.player.forEach((e) => { // e = 玩家id

		// 处理连接超时的玩家
		_overtime();
		function _overtime(){
			// 删除已超时的玩家
			if($c.entity[e].time.lastHave < $funcStartTime - 30 * 1000){
				lib.logoutClient(e);
				console.log('[/] 心跳超时', e);
			}else
			// 向即将超时的玩家发送心跳包
			if($c.entity[e].time.lastHave < $funcStartTime - 30 * 1000){
				lib.to_queue_net(e, 'heartbeat', {
					type: 'heartbeat',
				});
			}
		};

		// 处理网络io队列
		_io();
		function _io(){
			let $arr = [];
			// 检查网络队列中是否有正在遍历的玩家的id
			if(typeof $t.queue_net[e] === 'object'){
				//存在, 遍历这个玩家的数据表
				for(let key in $t.queue_net[e]){
					// 将数据push到这个玩家的临时数组
					$arr.push($t.queue_net[e][key]);
				}
			}
			// 检查是否有_ALL_ (发送给所有玩家)
			if(typeof $t.queue_net['_ALL_'] === 'object'){
				for(let key in $t.queue_net['_ALL_']){
					$arr.push($t.queue_net['_ALL_'][key]);
				}
			}
			// 将合并后的数据发送给目标玩家
			if($arr.length > 0){
				// 判断玩家是否存在
				if(typeof $c.entity[e] === 'object'){
					// 发送数据
					$c.entity[e].ws.send(JSON.stringify({
						time: $funcStartTime,
						data: $arr,
					}));
					// 更新最后发送时间
					$c.entity[e].time.lastSend = $funcStartTime;
				}
			}
			//console.log(JSON.stringify($arr));
		};


	});

	// 清空网络io队列
	$t.queue_net = {};

	// 循环结束, 对比时间戳, 得到mspt
	$c.system.mspt = Date.now() - $funcStartTime;
}, $c.config.due_mspt);

// 主程序
function main($tp, ws, $clientTime){
	let $funcStartTime = Date.now();
	if($tp.data.type === 'reg'){ // 注册客户端
		// 数据检查
		//$tp.id !== '' || $tp.key !== ''
		if(lib.is($tp.data?.name) !== '[object String]'
		|| $tp.data.name === ''
		) return false;

		// 判断玩家已满
		if($c.index_entity.type.player.length >= $c.max_player_num){
			ws.send(JSON.stringify({
				time: $startTime,
				data: [
					{
						type: 'info',
						info: '服务器已满',
					},
				],
			}));
		}

		// 生成id和通讯密钥
		let $id = lib.uuid();
		let $key = lib.uuid('key');

		// 在ws中添加id
		ws.id = $id;

		// 创建玩家
		$c.entity[$id] = {
			type: 'player',
			id: $id,
			ws: ws,
			key: $key,	// 通讯密钥
			name: $tp.data.name,	// 玩家名称
			time: {	// 各种时间
				lastHave: $funcStartTime,	// 客户端 最后连接 服务器
				lastSend: 0,				// 服务器 最后连接 客户端
				place: $funcStartTime,		// 最后同步坐标
				ping: $funcStartTime,		// 最后发送ping数据
			},
			place: [0, 0, 0, 0, 0],	// 玩家位置: x, y, z, 偏航角, 俯仰角
		};
		// 将玩家添加到type索引
		$c.index_entity.type.player.push($id);

		// 将数据发送给玩家
		lib.to_queue_net($id, 'reg', {
			type: 'reg',
			id: $id,
			key: $key,
		});

		// 将服务器数据同步给玩家
		lib.to_queue_net($id, 'syncServerData', {
			type: 'syncServerData',
			data: lib.getSyncDataAll(),
		});

		// 广播玩家加入事件, 发送新玩家的同步数据
		lib.to_queue_net('_ALL_', 'playerJoin'+ $id, {
			type: 'playerJoin',
			data: lib.getSyncDataPlayer($id),
		});

		// 补发ping数据
		lib.to_queue_net($id, 'ping', {
			type: 'ping',
			clientSend: $clientTime,
			serverHave: $funcStartTime,
			mspt: $c.system.mspt,
		});

		console.log('玩家加入: '+ $id);

		return true;
	}else

	if($tp.data.type === 'playerMove'){ // 玩家移动
		// 数据检查
		if(lib.enter_playerOK($tp) !== true			// 验证玩家
		|| lib.is($tp.data?.place) !== '[object Array]'	// 判断位置
		|| ($tp.data.place).length !== 5	// 判断数组长度是否正常
		) return false;


		// 数据检查: 检查坐标数组的每个值
		$tp.data.place.forEach((e) => {
			if(lib.is(e) !== '[object Number]'	// 判断是否为数字
			|| String(e).indexOf('.') > -1		// 判断是否有小数点
			) return false;
		});

		// 检查坐标的数字范围
		if($tp.data.place[3] < 0
		|| $tp.data.place[3] > 360
		|| $tp.data.place[4] < 0
		|| $tp.data.place[4] > 360
		) return false;

		// // 从上次同步坐标到现在, 玩家最多能走多远. 判断玩家是否超过这个距离
		// let $_maxRange = ($funcStartTime - $c.entity[$tp.id].time.place) / 1000 * (1000 / 20 * 10) + 10; // +10 容错
		// //console.log($_maxRange, Math.abs($tp.data.place[0] - $c.entity[$tp.id].place[0]), Math.abs($tp.data.place[1] - $c.entity[$tp.id].place[1]), Math.abs($tp.data.place[2] - $c.entity[$tp.id].place[2]));
		// if(Math.abs($tp.data.place[0] - $c.entity[$tp.id].place[0]) > $_maxRange
		// || Math.abs($tp.data.place[1] - $c.entity[$tp.id].place[1]) > $_maxRange
		// || Math.abs($tp.data.place[2] - $c.entity[$tp.id].place[2]) > $_maxRange
		// ) return false;

		// 存储玩家位置
		$c.entity[$tp.id].place = $tp.data.place;
		// 更新位置更新时间
		$c.entity[$tp.id].time.place = $funcStartTime;

		// 广播玩家位置
		lib.to_queue_net('_ALL_', 'playerMove', {
			type: 'playerMove',
			id: $tp.id,
			place: $c.entity[$tp.id].place,
		});

		return true;
	}else

	if($tp.data.type === 'sendMessage'){ // 发送消息
		// 数据检查
		if(lib.enter_playerOK($tp) !== true			// 验证玩家
		|| lib.is($tp.data.message) !== '[object String]'	// 消息是否为字符串类型
		|| ($tp.data.message).length > 256	// 判断消息长度是否正常
		) return false;

		// 判断消息是否达到数量限制
		if(($t.message).length >= $c.config.max_message_num){
			// 删除第一条消息
			$t.message.splice(0, 1);
		}

		// 添加这条新消息
		$t.message.push($c.entity[$tp.id].name +' > '+ $tp.data.message);

		// 广播新消息
		lib.to_queue_net('_ALL_', 'message', {
			type: 'message',
			type_message: 'player',
			id: $tp.id,
			message: $tp.data.message,
		});

		return true;
	}


	return false;
};


console.log('服务器已启动!');
