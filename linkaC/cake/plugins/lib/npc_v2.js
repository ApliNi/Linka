
// NPC-v2
npc_v2 = {
	// 处理NPC监听的事件
	p_event: function ($npc, $eventName){
		// 判断这个npc是否有事件监听
		if($npc?.p_event !== undefined){
			let $npc_p_event = $npc.p_event;
			// 判断是否监听此事件
			if($npc_p_event[$eventName] !== undefined){
				// 将字符串转换为函数
				let $program = $npc_p_event[$eventName];
				// 运行程序, 传入npc数据
				$program($npc);
			}
		}
	},
};


// 实体创建事件
$e.system.on('syncServerData.entity_join..type=npc2', ($npc) => {
	console.log('[NPC-v2] 预处理NPC: '+ $npc.id);

	// 如果有客户端程序
	if($npc?.p_client !== undefined){
		console.log('[NPC-v2] ^ 运行客户端程序');
		$npc.p_client = lib.toFunction($npc.p_client);
		$npc.p_client();
	}
	// 如果有事件程序
	if($npc?.p_event){
		// 遍历事件程序, 将字符串转换为函数
		for(let key in $npc.p_event){
			console.log('[NPC-v2] ^ 预处理事件监听: '+ key);
			$npc.p_event[key] = lib.toFunction($npc.p_event[key]);
		}
	}
});

// 玩家碰撞
$e.ui.on('2overlap.true', ($id) => {
	let $entity = $c.entity[$id];
	// NPC
	if($entity.type === 'npc2'){
		npc_v2.p_event($entity, 'overlap.true');
	}
});
$e.ui.on('2overlap.false', ($id) => {
	let $entity = $c.entity[$id];
	// NPC
	if($entity.type === 'npc2'){
		npc_v2.p_event($entity, 'overlap.false');
	}
});

// 玩家攻击
$e.ui.on('2attack', ($id) => {
	let $entity = $c.entity[$id];
	// NPC
	if($entity.type === 'npc2'){
		npc_v2.p_event($entity, 'attack');
	}
});
