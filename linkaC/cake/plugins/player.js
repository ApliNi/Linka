
// 玩家移动
$e.player.on('playerMove', ($tp) => {
	// 更新数据
	$c.entity[$tp.id].place = $tp.place;
	// 渲染
	lib.update_place_to_player($tp.id);

	// 如果是自己
	if($tp.id === $c.player.id){
		// 更新背景层
		lib.update_place_to_background();
	}
});


// 玩家加入
$e.player.on('playerJoin', ($tp) => {
	// 如果客户端没有这个实体
	if(typeof $c.entity[$tp.data.id] !== 'object'){
		// 添加到实体列表
		$c.entity[$tp.data.id] = $tp.data;
		$c.index_entity.type.player.push($tp.data.id);

		// 通过服务器同步数据渲染实体
		lib.render_entity($tp.data);
	}

	// 玩家加入消息
	lib.addMessage($tp.data.name, $tp?.message || '加入了服务器', {class: 'new player_join'});
});


// 玩家退出
$e.player.on('playerQuit', ($tp) => {
	// 玩家退出消息
	lib.addMessage($c.entity[$tp.id].name, $tp?.message || '断开连接', {class: 'new player_quit'});

	// 如果客户端有这个实体
	if(typeof $c.entity[$tp.id] === 'object'){
		// 从数据中删除
		delete $c.entity[$tp.id];
		$c.index_entity.type.player.splice($c.index_entity.type.player.indexOf($tp.id), 1);
		// 从缓存中删除
		if($t.queue.move.indexOf($tp.id) !== -1) $t.queue.move.splice($t.queue.move.indexOf($tp.id), 1);
		if($t.queue.overlap.indexOf($tp.id) !== -1) $t.queue.overlap.splice($t.queue.overlap.indexOf($tp.id), 1);
		// 删除dom
		lib.geb('all-player').removeChild(lib.geb($tp.id));
	}
});
