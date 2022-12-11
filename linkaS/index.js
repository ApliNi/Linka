const WebSocket = require('ws');
const loki = require('lokijs');
const starter = require('./starter.js');
const log = require('./plugins/log.js');
const comm = require('./plugins/comm.js');
log.out('INFO', '[主线程] 服务器已完成模块加载, 正在启动...');

// 全局变量
$c = {};
// 全局缓存
$t = {};

// 运行启动器
starter.starte();

const lib = require('./lib.js');
const db = require('./plugins/db.js');


log.out('INFO', '[网络] 正在启动 WebSocket...');
const wss = new WebSocket.Server({port: 2027});
log.out('INFO', '[网络] WebSocket 启动完成, 正在监听 '+ wss.options.port +'端口');

// 监听客户端的消息
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
				log.out('WARN', '[网络] [前置验证] 无效数据, 来自玩家: '+ db.get({id: $tp.id}).name +'('+ $tp.id +')');
			}

			// 如果玩家在服务器中
			if(db.get({id: $tp.id})){
				let $player = db.get({id: $tp.id});
				// 更新上次连接时间
				$player.time.lastHave = $funcStartTime;

				// 判断最近1秒是否有发送数据
				if(db.get({id: $tp.id}).time.ping < $funcStartTime - 1000){
					// 创建ping数据
					lib.to_queue_net($tp.id, 'ping', {
						type: 'ping',
						clientSend: $tp.time,
						serverHave: $funcStartTime,
						mspt: $c.system.mspt,
					});
					// 更新发送ping数据的时间
					$player.time.ping = $funcStartTime;

					db.up($player);
				}
			}

		}else{
			log.out('WARN', '[功能] 无效数据, 来自玩家: '+db.get({id: $tp.id}).name +'('+ $tp.id +')');
		}
	});

	// 连接断开
	ws.on('close', (error) => {
		log.out('PLAYER', '[网络] 连接断开: id='+ ws.id + ', error='+ error);
		if(typeof ws.id === 'string') lib.logoutClient(ws.id);
	});

	// 连接丢失
	ws.on('disconnect', (error) => {
		log.out('PLAYER', '[网络] 连接丢失: id='+ ws.id + ', error='+ error);
		if(typeof ws.id === 'string') lib.logoutClient(ws.id);
	});

});


log.out('INFO', '[循环] 开始运行计时器...');

// tps循环
setInterval(function(){
	// 循环开始, 记录时间戳
	let $funcStartTime = Date.now();

	// 遍历所有玩家
	db.get({type: 'player'}, true).forEach((e) => { // e = 玩家json
		e = e.id;

		// 处理连接超时的玩家
		_overtime();
		function _overtime(){
			// 删除已超时的玩家
			if(db.get({id: e}).time.lastHave < $funcStartTime - 30 * 1000){
				log.out('PLAYER', '[网络] '+ db.get({id: e})?.name +'('+ e +') 心跳超时');
				lib.logoutClient(e);
			}else
			// 向即将超时的玩家发送心跳包
			if(db.get({id: e}).time.lastHave < $funcStartTime - 30 * 1000){
				lib.to_queue_net(e, 'heartbeat', {
					type: 'heartbeat',
				});
			}
		};

		// 处理当前玩家的网络io队列
		// 所有数据都堆在网络队列中, 根据数据的标签判断发送给谁, 比如 'player_id', '_ALL_'
		_io();
		function _io(){
			let $arr = [];
			// 检查网络队列中是否有正在遍历的玩家的id
			if($t.queue_net[e] !== undefined){ // 如果网络队列中有这个玩家id
				//存在, 遍历这个玩家的数据表
				for(let key in $t.queue_net[e]){
					// 将数据push到这个玩家的临时数组
					$arr.push($t.queue_net[e][key]);
				}
			}
			// 检查是否有 _ALL_ (发送给所有玩家)
			if($t.queue_net['_ALL_'] !== undefined){
				for(let key in $t.queue_net['_ALL_']){
					$arr.push($t.queue_net['_ALL_'][key]);
				}
			}
			// 排除玩家 _!ALL_
			if($t.queue_net['_!ALL_'] !== undefined){
				for(let key in $t.queue_net['_!ALL_']){
					// 如果不是排除当前玩家
					if($t.queue_net['_!ALL_'][key].id !== e){
						$arr.push($t.queue_net['_!ALL_'][key]);
					}
				}
			}
			// 将合并后的数据发送给目标玩家
			if($arr.length > 0){
				// 判断玩家是否存在
				if(db.get({id: e}) !== undefined){
					// 发送数据
					db.get({id: e}).ws.send(JSON.stringify({
						time: $funcStartTime,
						data: $arr,
					}));
					// 更新最后发送时间
					let $player = db.get({id: e});
					$player.time.lastSend = $funcStartTime
					db.up($player);
				}
			}
			// console.log(JSON.stringify($t.queue_net));
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
		|| ($tp.data.name).length > 16
		) return false;

		log.out('INFO', '[注册] '+ $tp.data.name +' 正在注册...');

		// 判断玩家已满
		if($c.system.playerNum >= $c.max_player_num){
			ws.send(JSON.stringify({
				time: $startTime,
				data: [
					{
						type: 'info',
						info: '服务器已满',
					},
				],
			}));
			log.out('PLAYER', '[注册] ' +$tp.data.name +' 注册失败, 服务器已满');
		}

		// 生成id和通讯密钥
		let $id = lib.uuid();
		let $key = lib.uuid('key');

		log.out('INFO', '[注册] ' +$tp.data.name +' 分配基础数据: ID='+ $id +', KEY='+ $key);

		// 在ws中添加id, 用于从数据包中找到玩家
		ws.id = $id;

		// 创建玩家
		// $c.entity[$id] = {
		// 	type: 'player',
		// 	id: $id,
		// 	ws: ws,
		// 	key: $key,	// 通讯密钥
		// 	name: $tp.data.name,	// 玩家名称
		// 	time: {	// 各种时间
		// 		lastHave: $funcStartTime,	// 客户端 最后连接 服务器
		// 		lastSend: 0,				// 服务器 最后连接 客户端
		// 		place: $funcStartTime,		// 最后同步坐标
		// 		ping: $funcStartTime,		// 最后发送ping数据
		// 	},
		// 	place: [0, 0, 0, 0, 0],	// 玩家位置: x, y, z, 偏航角, 俯仰角
		// };
		// 将玩家添加到type索引
		// $c.index_entity.type.player.push($id);

		// 将玩家添加到数据库
		db.add({
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
			place_x: 0,
			place_y: 0,
			place: [0, 0, 0, 0, 0],	// 玩家位置: x, y, z, 偏航角, 俯仰角
		});

		$c.system.playerNum ++;

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

		log.out('PLAYER', '[注册] '+ $tp.data.name +' 已加入服务器');

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
		if($tp.data.place[3] < -180
		|| $tp.data.place[3] > 180
		// || $tp.data.place[4] < -180
		// || $tp.data.place[4] > 180
		) return false;

		// // 从上次同步坐标到现在, 玩家最多能走多远. 判断玩家是否超过这个距离
		// // let $_maxRange = ($funcStartTime - $c.entity[$tp.id].time.place) / 1000 * (1000 / 13 * 10) + 2; // +2 容错
		// let $_maxRange = ($funcStartTime - $c.entity[$tp.id].time.place) / 30 * (13 + 2); // +2 容错
		// //console.log($_maxRange, Math.abs($tp.data.place[0] - $c.entity[$tp.id].place[0]), Math.abs($tp.data.place[1] - $c.entity[$tp.id].place[1]), Math.abs($tp.data.place[2] - $c.entity[$tp.id].place[2]));
		// if(Math.abs($tp.data.place[0] - $c.entity[$tp.id].place[0]) > $_maxRange
		// || Math.abs($tp.data.place[1] - $c.entity[$tp.id].place[1]) > $_maxRange
		// || Math.abs($tp.data.place[2] - $c.entity[$tp.id].place[2]) > $_maxRange
		// ) return false;

		let $player = db.get({id: $tp.id});
		// 存储玩家位置
		$player.place = $tp.data.place;
		// 更新位置更新时间
		$player.time.place = $funcStartTime;

		db.up($player);

		// 广播玩家位置
		lib.to_queue_net('_!ALL_', 'playerMove_'+ $tp.id, {
			type: 'playerMove',
			id: $tp.id,
			place: db.get({id: $tp.id}).place,
		});

		return true;
	}else

	if($tp.data.type === 'sendMessage'){ // 发送消息
		// 数据检查
		if(lib.enter_playerOK($tp) !== true			// 验证玩家
		|| lib.is($tp.data.message) !== '[object String]'	// 消息是否为字符串类型
		|| ($tp.data.message).length > 2048	// 判断消息长度是否正常
		|| $tp.data.message.replaceAll(' ', '').replaceAll('　', '') === '' // 消息为空
		) return false;

		// 判断是消息还是指令
		if($tp.data.message.substring(0, 1) === '/'){
			// 获取指令数组
			let $comm = $tp.data.message.split(' ');
			// 运行指令
			let $s = comm.run($comm, $tp.id, 1);
			if($s === false){
				// 向玩家发送指令无效的消息
				lib.to_queue_net($tp.id, 'message', {
					type: 'message',
					type_message: 'system',
					id: $tp.id,
					message: ['错误', '指令无效', {class: 'new system err'}],
				});
				log.out('PLAYER', db.get({id: $tp.id}).name +' 运行指令失败: '+ $tp.data.message);
			}else{
				log.out('PLAYER', db.get({id: $tp.id}).name +' 运行指令: '+ $tp.data.message);
			}
		}else{
			// 服务器保存这条消息
			$t.message.push([db.get({id: $tp.id}).name, $tp.data.message]);

			// 删除超过暂存数量限制的消息
			for(let key = 0; ($t.message).length > $c.config.max_message_num; key++){
				$t.message.splice(key, 1);
			}

			// 广播新消息
			lib.to_queue_net('_ALL_', 'message', {
				type: 'message',
				type_message: 'player',
				id: $tp.id,
				message: $tp.data.message,
			});
			log.out('PLAYER', db.get({id: $tp.id}).name +' 发送消息: '+ $tp.data.message);
		}

		return true;
	}


	return false;
};



log.out('INFO', '[主线程] 服务器已启动!');
