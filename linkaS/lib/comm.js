// 获取玩家名称, 如果不存在则获取id
function _name($player){
	return $player?.name || $player.id;
};

// 解析指令
// $comm = ['/tp', 'player', , ,]
// $player = 执行指令的实体
// $power = 0不允许使用指令 | 1基础功能 | 2管理功能 | 3后端功能 | 4忽略权限
function run($comm, $player, $power){
	if($power === 0) return false;

	// 传送指令
	if($comm[0] === '/tp'){
		// 广播玩家的坐标
		function net_send_place($aim){
			lib.to_queue_net('_ALL_', 'playerMove_'+ $aim.id, {
				type: 'playerMove',
				id: $aim.id,
				place: $aim.place,
			});
		};
		// 被操作的玩家
		let $aim = {};

		// tp <player>		- 传送到玩家
		if($comm.length === 2 && $power >= 1
		&& db.getif({id: $comm[1]}) !== false
		){
			// 将玩家的坐标修改为另一位玩家的坐标
			$aim = $player;
			let $aim2 = db.get({id: $comm[1]});
			$aim.place = $aim2.place;
			db.up($aim);
			net_send_place($aim);
			return [true, '将 '+ _name($aim) +' 传送到 '+ _name($aim2)];
		}else

		// tp <player> <player>		- 将玩家传送到玩家
		if($comm.length === 3 && $power >= 2
		&& db.getif({id: $comm[1]}) !== false
		&& db.getif({id: $comm[2]}) !== false
		){
			$aim = db.get({id: $comm[1]});
			let $aim2 = db.get({id: $comm[2]});
			$aim.place = $aim2.place;
			db.up($aim);
			net_send_place($aim);
			return [true, '将 '+ _name($aim) +' 传送到 '+ _name($aim2)];
		}else

		// tp <x> <y>		- 传送到坐标
		if($comm.length === 3 && $power >= 1
		&& isNaN(Number($comm[1])) === false
		&& isNaN(Number($comm[2])) === false
		){
			$aim = $player;
			$aim.place[0] = $comm[1];
			$aim.place[1] = $comm[2];
			db.up($aim);
			net_send_place($aim);
			return [true, '将 '+ _name($aim) +' 传送到 '+ JSON.stringify($aim.place)];
		}else

		// tp <player> <x> <y>		- 将玩家传送到坐标
		if($comm.length === 4 && $power >= 2
		&& db.getif({id: $comm[1]}) !== false
		&& isNaN(Number($comm[2])) === false
		&& isNaN(Number($comm[3])) === false
		){
			$aim = db.get({id: $comm[1]});
			$aim.place[0] = $comm[1];
			$aim.place[1] = $comm[2];
			db.up($aim);
			net_send_place($aim);
			return [true, '将 '+ _name($aim) +' 传送到 '+ JSON.stringify($aim.place)];
		}

		return [false];
	}

	return [false];
};



module.exports = {
	run,
};
