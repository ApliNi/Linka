const WebSocket = require('ws');

log.out('INFO', '[网络] 正在启动 WebSocket...');
const wss = new WebSocket.Server({port: 2027});

// 监听客户端的消息
wss.on('connection', (ws) => {

	// 通讯: 客户端和服务端均通过发送数组, 软件通过遍历数组得到所有数据内容, 再将这些内容交给主程序处理
	// {
	// 	id: 玩家id,
	// 	key: 通讯密钥,
	// 	data: {数据内容},
	// }

	// 收到消息
	ws.on('message', (m) => {
		let $loopStartTime = Date.now();
		let $tp = lib.toJSON(m);

		//console.log(JSON.stringify($tp));

		if(lib.is($tp) === '[object Object]'		// 判断格式是否正确
		&& lib.is($tp?.data) === '[object Array]'
		&& lib.is($tp?.id) === '[object String]'	// 判断id和key是否存在
		&& lib.is($tp?.key) === '[object String]'
		&& lib.is($tp?.time) === '[object Number]'	// 判断时间数据, 以及是否超时
		&& $tp.time < ($loopStartTime - 30 * 1000) === false
		&& ($tp.data).length >= 1					// 判断数据长度是否正常
		&& ($tp.data).length <= 16
		){

			// 获取玩家数据
			let $player = db.get({id: $tp.id});

			// 遍历数据数组
			$tp.data.forEach((e) => {
				// 转换为单个数据的格式
				// let $s = main.main({
				// 	id: $tp.id,
				// 	key: $tp.key,
				// 	data: e,
				// }, ws, $tp.time, $player);
				// // 功能模块返回无效数据
				// if($s === false){
				// 	log.out('WARN', '[功能] ['+ e?.type +'] 无效数据, 来自玩家: '+ $tp.id);
				// };

				// 是否存在这个事件名
				if(db.getif({type: 'player', name: e.type}, $c.Event)){
					// 转换为单个数据的格式
					let $tp1 = {
						id: $tp.id,
						key: $tp.key,
						data: e,
						ws: ws,
						clientTime: $tp.time,
					};
					// 事件监听器临时数据
					let $eData = {
						prohibit: [],
					};
					// 触发事件
					$e.player.emit(e.type, $eData, $tp1, $player);
				}else{
					log.out('WARN', '[网络] '+ $tp.id +' 发送无效事件名: '+ e.type);
				}
			});

			// 如果玩家在服务器中
			if($player !== undefined){
				// 更新上次连接时间
				$player.time.lastHave = $loopStartTime;

				// 判断最近1秒是否有发送数据
				if(db.get({id: $tp.id}).time.ping < $loopStartTime - 1700){
					// 创建ping数据
					lib.to_queue_net($tp.id, 'ping', {
						type: 'ping',
						clientSend: $tp.time,
						serverHave: $loopStartTime,
						mspt: $c.system.mspt,
					});
					// 更新发送ping数据的时间
					$player.time.ping = $loopStartTime;
				}

				db.up($player);
			}

		}else{
			log.out('WARN', '[网络] 无效数据, 来自玩家: '+ $tp.id);
		}
	});

	// 连接断开
	ws.on('close', (error) => {
		log.out('INFO', '[网络] 连接断开: id='+ ws.id + ', error='+ error);
		if(typeof ws.id === 'string') lib.logoutClient(ws.id); // 跑了
	});

	// 连接丢失
	ws.on('disconnect', (error) => {
		log.out('INFO', '[网络] 连接丢失: id='+ ws.id + ', error='+ error);
		if(typeof ws.id === 'string') lib.logoutClient(ws.id, '连接丢失');
	});

});


log.out('INFO', '[网络] WebSocket 启动完成, 正在监听 '+ wss.options.port +'端口');
