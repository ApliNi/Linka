const db = require('./db.js');
// 基础库


// 生成唯一id
function uuid($m = ''){
	// 根据时间戳生成唯一的随机字符串
	let $i = (Date.now().toString(36) + Math.random().toString(36).substring(2)).substring(0, 17).padStart(17, '0');
	// 直接输出
	if($m === ''){return $i;}
	// 打乱字符串, 作为通讯密钥使用
	if($m === 'key'){return $i.split('').sort(() => {return Math.random() > 0.7 ? 1 : -1}).join('');}
};


// 判断是否为json, 如果是则转换
function toJSON($i){
	// 判断是否为字符串
	try{
		$i = JSON.parse($i);
		return $i;
	}catch(e){
		return false;
	}
};


// 注销并删除一个客户端
function logoutClient($id, $message = ''){
	// 判断这个客户端还在不在
	if(db.get({id: $id})?.ws){
		// 注销ws
		try{
			db.get({id: $id}).ws.terminate();
		}catch(error){
			log.out('ERROR', '[注销] 玩家 WebSocket 注销失败. 可能存在过期数据库!');
		}
	}
	if(db.getif({id: $id})){
		// 广播玩家退出
		to_queue_net('_ALL_', 'playerQuit_'+ $id, {
			type: 'playerQuit',
			id: $id,
			message: $message,
		});

		log.out('PLAYER', '[注销] '+ db.get({id: $id}).name +' 已退出服务器');

		// 删除数据
		db.del({id: $id});

		$c.system.playerNum --;
	}
};


// 随机选择一位玩家
function randomPlayer(){
	let $player = Object.keys($c.clients);
	$player = $c.clients[$player[Math.floor(Math.random() * $player.length)]];
	return $player;
};


// 计算坐标移动到另一个坐标一定距离后的位置
function moveRectangleToCoordinate($p1, $p2, $r){ // 当前坐标, 目标坐标, 移动距离
	if($p1[0] === $p2[0] && $p1[1] === $p2[1]) return $p2;
	let $dx = $p2[0] - $p1[0];
	let $dy = $p2[1] - $p1[1];

	let $total = Math.sqrt(Math.pow($dx, 2) + Math.pow($dy, 2));
	return [Math.round($p1[0] + $r * $dx / $total), Math.round($p1[1] + $r * $dy / $total)];
};


// 在玩家周围n距离外生成随机坐标
function randomCoordinate_playerOutside($r){
	// 1. 随机选择一位玩家, 以他的坐标为原点往随机方向偏移n距离
	// 2. 判断这个位置周围是否有玩家, 如果没有则在此坐标周围n距离内随机位置生成怪物
	// 3. 如果存在玩家, 就在此位置往随机方向(不与上一个随机方向相同或相反(或者+90度))偏移n距离
	// 4. 返回第2步, 每次生成失败时, n = n * 2, 如果失败5次就生成在第5次的位置

	let $player = randomPlayer();
	let $xy = $player.place;
	let $forNum = 0;

	// 以此坐标往上偏移$r
	_shift();
	function _shift(){
		// 随机偏移
		$xy[Math.round(Math.random())] += $r + 1;
		// 检查是否在范围内
		for(let key in $c.clients){
			if(isOverlap($xy, $c.clients[key].place, $r)){
				$r = $r + $r;
				$forNum ++;
				if($forNum < 5){
					_shift();
				}
			}else{
				return;
			}
		}
	};

	return [$xy, $player];
};


// 添加到网络队列
function to_queue_net($entity_id, $name, $data){
	// 如果为空则创建
	if(typeof $t.queue_net[$entity_id] !== 'object'){
		$t.queue_net[$entity_id] = {};
	}
	$t.queue_net[$entity_id][$name] = $data;
};


// 为客户端准备服务器同步数据
function getSyncDataAll(){
	let $arr = {
		entity: {},
		// index_entity: {
		// 	type: {
		// 		player: [],
		// 		mob: [],
		// 	}
		// },
	};
	// 遍历服务器的实体
	db.get({}, true).forEach((e) => {
		if(e.type === 'player'){ // 玩家
			$arr.entity[e.id] = {
				// 基础数据
				type: e.type,
				id: e.id,
				name: e?.name || '',
				place: e.place,
			};
		}else
		if(e.type === 'npc'){ // npc
			$arr.entity[e.id] = e;
		}
		if(e.type === 'npc2'){ // npc-v2
			$arr.entity[e.id] = {
				// 基础数据
				id: e.id,
				type: e.type,
				name: e?.name || '',
				place: e.place,

				// NPC程序
				p_client: e?.p_client,
				p_event: e?.p_event,
			};
		}
	});


	// 添加旧消息
	$arr.message = $t.message;

	return $arr;
};


// 获取单个玩家的同步数据
function getSyncDataPlayer($id){
	let $player = db.get({id: $id});
	return {
		type: $player.type,
		id: $player.id,
		name: $player.name,
		place: $player.place,
	};
};


// 判断服务器中是否有这个玩家, 以及密钥是否正确
function enter_playerOK($tp){
	let $player = db.get({id: $tp.id});
	if($player !== undefined		// 判断服务器中是否有这个实体id
	&& $player.type === 'player'	// 判断这个实体是不是玩家
	&& $player.key === $tp.key		// 判断通讯密钥是否正确
	){
		return true;
	}
	return false;
};


// 判断数据类型, 简写
function is(i){
	return Object.prototype.toString.call(i);
};


// 获取客户端ip, 返回 [ip, port, 连接方式]
function getIP(req){
	let $noIP = ['127.0.0.1', '::ffff:127.0.0.1', '::1'];

	// console.log(req.headers['proxy_protocol_addr']);
	// console.log(req.headers['remote_addr']);
	// console.log(req.connection.remoteAddress);

	// nginx 获取的代理服务器转发的客户端地址
	if(req.headers['proxy_protocol_addr'] && $noIP.indexOf(req.headers['proxy_protocol_addr']) === -1){
		return [req.headers['proxy_protocol_addr'], req.headers['proxy_protocol_port'], 'proxy'];
	}else

	// nginx 获取的地址
	if(req.headers['remote_addr'] && $noIP.indexOf(req.headers['remote_addr']) === -1){
		return [req.headers['remote_addr'], req.headers['remote_port'], 'direct'];
	}else

	// Node.js 获取的地址
	return [req.connection.remoteAddress, req.connection.remotePort, 'direct_node'];
};


// 转换为json字符串, 但保留json对象中不可正常转换的对象
// 如果是函数就转换为['标识', '函数字符串']
function JSON_stringify_retainFunc($json){
	return JSON.stringify($json, (key, value) => {
		// 函数
		if(typeof value === 'function'){
			return ['LINKA_FUNC', value.toString()];
		}
		return value;
	});
};


module.exports = {
	uuid,
	toJSON,
	logoutClient,
	randomCoordinate_playerOutside,
	randomPlayer,
	moveRectangleToCoordinate,
	to_queue_net,
	getSyncDataAll,
	getSyncDataPlayer,
	enter_playerOK,
	is,
	getIP,
	JSON_stringify_retainFunc,
};


