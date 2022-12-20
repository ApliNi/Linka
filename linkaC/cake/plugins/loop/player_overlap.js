
// 玩家碰撞
$e.system.on('tps.loopStart', () => {
	// 遍历实体移动队列
	let $_t = {
		add: [],
		del: [],
	};
	$t.queue.move.forEach((e) => { // e = 发生移动的实体的id
		// 不是自己移动
		if(e !== $c.player.id){
			// 是否在自己的攻击范围内
			// 判断 对方的坐标是否在 自己的攻击范围半径 + 对方的碰撞箱半径 内
			if(lib.isOverlap($c.entity[$c.player.id].place, 40 + 25, $c.entity[e].place)){
				// 不在碰撞队列中
				if($t.queue.overlap.indexOf(e) === -1){
					// 将这个实体添加到碰撞队列中
					$_t.add.push(e);
					//$t.queue.overlap.push(e);
				}
			}else{
				// 在碰撞队列中
				if($t.queue.overlap.indexOf(e) !== -1){
					// 将这个实体从碰撞队列中删除
					$_t.del.push(e);
					//$t.queue.overlap.splice($t.queue.overlap.indexOf(e), 1);
				}
			}
		}else

		// 是自己移动
		{
			// 遍历所有实体列表
			for(let key in $c.entity){
				let $id = $c.entity[key].id;
				// 不是自己
				if($id !== $c.player.id){
					// 不在实体移动队列中
					if($t.queue.move.indexOf($id) === -1){
						// 在自己的攻击范围内
						if(lib.isOverlap($c.entity[$c.player.id].place, 40 + 25, $c.entity[$id].place)){
							// 不在碰撞队列中
							if($t.queue.overlap.indexOf($id) === -1){
								// 将这个实体添加到碰撞队列中
								$_t.add.push($id);
								//$t.queue.overlap.push(e2);
							}
						}else{
							// 在碰撞队列中
							if($t.queue.overlap.indexOf($id) !== -1){
								// 将这个实体从碰撞队列中删除
								$_t.del.push($id);
								//$t.queue.overlap.splice($t.queue.overlap.indexOf(e2), 1);
							}
						}
					}
				}
			}
		}
	});
	// 对比, 如果碰撞队列发生变化
	if($_t.add.length !== 0){
		// 遍历添加
		$_t.add.forEach((e) => {
			$t.queue.overlap.push(e);
			// 渲染状态
			lib.geb(e).classList.add('--overlap');
			// 事件
			$e.ui.emit('overlap', {id: e,
				trigger_y: ['overlap', true],
			})
		});
		lib.geb($c.player.id).classList.add('--overlap');
	}
	if($_t.del.length !== 0){
		// 遍历删除
		$_t.del.forEach((e) => {
			$t.queue.overlap.splice($t.queue.overlap.indexOf(e), 1);
			// 渲染状态
			lib.geb(e).classList.remove('--overlap');
			// 事件
			$e.ui.emit('overlap', {id: e,
				trigger_y: ['overlap', false],
			})
		});
		if($t.queue.overlap.length === 0) lib.geb($c.player.id).classList.remove('--overlap');
	}

	// 清空队列
	$t.queue.move = [];
});
