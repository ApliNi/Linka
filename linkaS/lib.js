// 获取全局变量


// 生成唯一id
function uuid($m = ''){
	let $i = (Date.now().toString(36) + Math.random().toString(36).substring(2)).substring(0, 17).padStart(17, '0');
	if($m === ''){return $i;}
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
function logoutClient($id){
	// 判断这个客户端还在不在
	if(typeof $c.entity[$id]?.ws === 'object'){
		// 注销ws
		$c.entity[$id].ws.terminate();
	}
	if(typeof $c.entity[$id] === 'object'){
		// 删除数据和索引
		delete $c.entity[$id];
		$c.index_entity.type.player.splice($c.index_entity.type.player.indexOf($id), 1);
		// 广播玩家退出
		to_queue_net('_ALL_', 'playerQuit-'+ $id, {
			type: 'playerQuit',
			id: $id,
		});
		console.log('玩家退出: '+ $id);
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
		index_entity: {
			type: {
				player: [],
				mob: [],
			}
		},
	};
	// 遍历服务器的实体
	for(let key in $c.entity){
		let e = $c.entity[key];
		if(e.type === 'player'){ // 玩家
			$arr.entity[key] = {
				type: e.type,
				id: e.id,
				name: e?.name || '',
				place: e.place,
			};
		}else
		if(e.type === 'npc'){ // npc
			$arr.entity[key] = e;
		}

	}

	// 添加消息列表
	$arr.message = $t.message;

	return $arr;
};

// 获取单个玩家的同步数据
function getSyncDataPlayer($id){
	return {
		type: $c.entity[$id].type,
		id: $c.entity[$id].id,
		name: $c.entity[$id].name,
		place: $c.entity[$id].place,
	};
};

// 判断服务器中是否有这个玩家, 以及密钥是否正确
function enter_playerOK($tp){
	if(typeof $c.entity[$tp.id] === 'object'	// 判断服务器中是否有这个实体id
	&& $c.entity[$tp.id].type === 'player'		// 判断这个实体是不是玩家
	&& $c.entity[$tp.id].key === $tp.key		// 判断通讯密钥是否正确
	){
		return true;
	}
	return false;
};

// 判断数据类型, 简写
function is(i){
	return Object.prototype.toString.call(i);
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
};
