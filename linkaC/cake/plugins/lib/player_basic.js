
// 玩家碰撞
$e.ui.on('overlap', ($tp) => {
	// NPC
	if($c.entity[$tp.id].type === 'npc'){
		npc.activation({id: $tp.id, trigger_y: $tp.trigger_y});
	}
});


// 玩家攻击
$e.ui.on('attack', ($tp) => {
	// NPC
	if($c.entity[$tp.id].type === 'npc'){
		npc.activation({id: $tp.id, trigger_y: $tp.trigger_y});
	}
});
