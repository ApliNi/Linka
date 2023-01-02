// 使NPC可以骑乘

// 注册事件监听
db.add({type: 'player', name: 'ride_switch'}, $c.Event);


$e.player.on('ride_switch', async ($eData, $tp, $player) => {
	if($eData.prohibit.indexOf('ride_switch') !== -1) return false;

	// 获取实体数据
	let $npc = db.get({id: $tp.data.npcID});
	//  $player

	// 数据检查
	if($npc === undefined
	|| lib.isOverlap($player, $npc, 65) === false // 两个实体是否碰撞 40 + 25 = 自己的攻击范围半径 + 对方的碰撞箱半径
	) return false;

	// 未处于被骑乘状态
	if($npc.serverData.ride.enable === false){
		// 创建骑乘状态数据
		$npc.serverData.ride.enable = true;
		$npc.serverData.ride.ing_player_id = $player.id;

		// 将玩家移动到npc的位置
		$player.place = $npc.place;

		// 广播玩家位置
		lib.to_queue_net('_ALL_', 'playerMove_'+ $player.id, {
			type: 'playerMove',
			id: $player.id,
			place: $player.place,
		});
		// 发送数据包
		lib.to_queue_net($player.id, 'ride_switch.player'+ $player.id, {
			type: 'ride_switch.player',
			enable: $npc.serverData.ride.enable,
		});
	}else

	// 如果骑乘状态 === false && 点击的玩家 === 正在骑乘的玩家: 取消骑乘状态
	if($player.id === $npc.serverData.ride.ing_player_id){
		$npc.serverData.ride.enable = false;
		$npc.serverData.ride.ing_player_id = null;

		// 发送数据包
		lib.to_queue_net($player.id, 'ride_switch.player'+ $player.id, {
			type: 'ride_switch.player',
			enable: $npc.serverData.ride.enable,
		});
	}
});
