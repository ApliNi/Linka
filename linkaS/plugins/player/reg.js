// 注册事件监听
db.add({type: 'player', name: 'reg'}, $c.Event);


$e.player.on('reg', ($eData, $tp, $player) => {
	if($eData.prohibit.indexOf('server_reg') !== -1) return false;

	// 数据检查
	if($player !== undefined	// 玩家在服务器里
	|| lib.is($tp.data?.name) !== '[object String]'
	|| $tp.data.name.replaceAll(' ', '').replaceAll('　', '') === ''
	|| ($tp.data.name).length > 16
	) return false;

	log.out('INFO', '[注册] '+ $tp.data.name +' 正在注册...');

	// 判断玩家已满
	if($c.system.playerNum >= $config.max_player_num){
		ws.send(JSON.stringify({
			time: $startTime,
			data: [
				{
					type: 'info',
					info: '服务器已满',
				},
			],
		}));
		log.out('INFO', '[注册] '+ $tp.data.name +' 注册失败, 服务器已满');
		return false;
	}

	// 生成id和通讯密钥等
	let $id = lib.uuid();
	let $key = lib.uuid('key');
	let $time = Date.now();

	log.out('INFO', '[注册] ' +$tp.data.name +' 分配基础数据: ID='+ $id +', KEY='+ $key);

	// 在ws中添加id, 用于连接断开之类的场景下从数据包中找到玩家!
	$tp.ws.id = $id;

	// 将玩家添加到数据库
	db.add({
		type: 'player',
		ip: $tp.ip_port[0],
		port: $tp.ip_port[1],
		id: $id,
		ws: $tp.ws,
		key: $key,	// 通讯密钥
		name: $tp.data.name,	// 玩家名称
		time: {	// 各种时间
			lastHave: $time,	// 客户端 最后连接 服务器
			lastSend: 0,				// 服务器 最后连接 客户端
			place: $time,		// 最后同步坐标
			ping: $time,		// 最后发送ping数据
		},
		place: [0, 0, 0, 0, 0],	// 玩家位置: x, y, z, 偏航角, 俯仰角
		power: 1,	// 玩家权限
	});

	$c.system.playerNum ++;

	// 将数据发送给玩家
	lib.to_queue_net($id, 'reg', {
		type: 'reg',
		id: $id,
		key: $key,
	});

	// 将服务器数据同步给玩家
	lib.to_queue_net($id, 'syncServerData', {
		type: 'syncServerData',
		data: lib.getSyncDataAll(),
	});

	// 广播玩家加入事件, 发送新玩家的同步数据
	lib.to_queue_net('_ALL_', 'playerJoin'+ $id, {
		type: 'playerJoin',
		data: lib.getSyncDataPlayer($id),
	});

	// 补发ping数据
	lib.to_queue_net($id, 'ping', {
		type: 'ping',
		clientSend: $tp.clientTime,
		serverHave: $time,
		mspt: $c.system.mspt,
	});

	log.out('PLAYER', '[注册] '+ $tp.data.name +' 已加入服务器');
});
