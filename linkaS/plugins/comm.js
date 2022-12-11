const lib = require('../lib.js');

// 解析指令
// $comm = ['/tp', 'player', , ,]
// $player = 执行指令的实体的id
// $power = 0不允许使用指令 | 1基础功能 | 2管理功能 | 3后端功能 | 4忽略权限
function run($comm, $player, $power){
	if($power === 0) return false;

	// 传送指令
	if($comm[0] === '/tp'){
		// tp <player>		- 传送到玩家
		if($comm.length === 2 && $power >= 1
		&& $c.entity[$comm[1]] !== undefined
		){
			// 将玩家的坐标修改为另一位玩家的坐标
			$c.entity[$player].place = $c.entity[$comm[1]].place;
		}else

		// tp <player> <player>		- 将玩家传送到玩家
		if($comm.length === 3 && $power >= 2
		&& $c.entity[$comm[1]] !== undefined
		&& $c.entity[$comm[2]] !== undefined
		){
			$c.entity[$comm[1]].place = $c.entity[$comm[2]].place;
		}else

		// tp <x> <y>		- 传送到坐标
		if($comm.length === 3 && $power >= 2
		&& isNaN(Number($comm[1])) === false
		&& isNaN(Number($comm[2])) === false
		){
			$c.entity[$player].place[0] = $comm[1];
			$c.entity[$player].place[1] = $comm[2];
		}else

		// tp <player> <x> <y>		- 将玩家传送到坐标
		if($comm.length === 4 && $power >= 2
		&& $c.entity[$comm[1]] !== undefined
		&& isNaN(Number($comm[2])) === false
		&& isNaN(Number($comm[3])) === false
		){
			$c.entity[$comm[1]].place[0] = $comm[1];
			$c.entity[$comm[1]].place[1] = $comm[2];
		}else{return false}

		// 广播玩家位置
		lib.to_queue_net('_ALL_', 'playerMove_'+ $player, {
			type: 'playerMove',
			id: $player,
			place: $c.entity[$player].place,
		});
	}


};



module.exports = {
	run,
};
