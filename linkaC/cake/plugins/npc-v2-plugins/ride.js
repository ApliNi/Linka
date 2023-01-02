// 使NPC可以骑乘

// NPC运行库版本号 || -1
if((npcLib?._version || -1) < 1){
	console.error('[NPC-v2.plugins.ride] NPC-v2运行库不存在或版本过低');
}else{

	npcLib.plugins.ride = {
		// 骑乘状态切换
		switch: function ($npc){

			// 发送数据包
			lib.netQueue('ride_switch_'+ $npc.id, {
				type: 'ride_switch',
				npcID: $npc.id,
			});

		},
	};


	// 监听服务器返回数据
	// 骑乘状态切换
	$e.player.on('ride_switch.player', ($tp) => {
		console.log('[NPC-v2.plugins.ride] 骑乘', $tp.enable);

		// 骑乘 true
		if($tp.enable === true){
			// 禁用移动
			$t.plugins.WASD.disable = true;
			// 显示消息
			infoLib.actionBar('按下 确认键 来脱离', 2000);
		}else

		if($tp.enable === false){
			// 恢复移动
			$t.plugins.WASD.disable = false;
		}
	});

}
