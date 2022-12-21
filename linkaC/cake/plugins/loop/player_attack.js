
// 玩家攻击
$e.system.on('tps.loopStart', () => {
	// 处理攻击
	if($t.queue.disable_attack === false && $t.queue.attack === true){
		$t.queue.attack = false;
		// 遍历当前碰撞的实体
		$t.queue.overlap.forEach((e) => {
			// 事件
			$e.ui.emit('attack', {
				id: e,
				trigger_y: ['attack'],
			});
			// 新版事件 !!
			$e.ui.emit('2attack', e);
		});
	}
});
