
// 处理服务器同步数据
$e.player.on('syncServerData', ($tp) => {
	let $funcStartTime = performance.now();

	console.log('[服务器同步数据] 开始处理服务器同步数据...');

	$c.entity = $tp.data.entity;
	$c.index_entity.type = [];

	// 清空现有实体
	lib.geb('all-player').innerHTML = '';

	console.groupCollapsed('[服务器同步数据] 处理实体数据...');

	// 遍历实体列表
	for(let key in $c.entity){

		// 触发实体创建事件
		$e.system.emit('syncServerData.entity_join', $c.entity[key]);
		// 根据type分类
		$e.system.emit('syncServerData.entity_join..type='+ $c.entity[key].type, $c.entity[key]);

		// 创建实体索引
		if($c.index_entity.type[$c.entity[key].type] === undefined){ // 如果实体索引中不存在当前type
			$c.index_entity.type[$c.entity[key].type] = [];
		}
		$c.index_entity.type[$c.entity[key].type].push($c.entity[key].id);
		// 渲染实体
		lib.render_entity($c.entity[key]);

		// 如果是NPC实体
		if($c.entity[key].type === 'npc'){
			// 如果存在 style 参数
			if($c.entity[key]?.style !== undefined){
				// 交给npc渲染器
				npc.style({
					trigger_y: 'syncServerData',
					id: $c.entity[key].id,
				})
			}
		}
	}

	console.groupEnd();

	// 更新背景层
	lib.update_place_to_background();

	lib.geb('message-list').innerHTML = '';
	// 遍历消息列表
	$tp.data.message.forEach((e) => {
		// 渲染一条旧消息
		lib.addMessage(e[0], e[1], {class: 'old'});
	});
	if($tp.data.message.length === 0){
		lib.addMessage('看上去没有旧的消息呢', '', {class: 'old flat center'});
	}else{
		lib.addMessage('以上为历史消息', '', {class: 'old flat center'});
	}

	// 启动循环
	$c.loop.run('tps', true);
	$c.loop.run('ui', true);

	// 注册成功
	$e.player.emit('login_ok');

	// tpsbar, 页面加载完成的动画
	lib.geb('tpsbar').style.setProperty('--tpsbar_max_width', '100%');

	console.log('[服务器同步数据] 处理完成, 耗时 '+ (performance.now() - $funcStartTime) + 'ms');
});


// WebSocket 连接断开
$e.net.on('ws.onclose', ($tp) => {
	// 终止循环
	$c.loop.run('tps', false);
	$c.loop.run('ui', false);
});


// 显示提示信息
$e.player.on('alert_info', ($tp) => {
	alert('[服务器] '+ $tp.info);
});



// ping数据包
$e.player.on('ping', async ($tp, $net) => {
	// 客户端接收时间 - 客户端发送时间 - (服务器发送时间 - 服务器接收时间)
	$c.time.ping = Date.now() - $tp.clientSend - ($net.serverSendTime - $tp.serverHave);
	// 渲染 tpsbar
	lib.render_tpsbar($tp.mspt, $c.time.ping);
	// 记录mspt
	$c.time.mspt_server = $tp.mspt;
});
