// Worker
$w = {
	// 管理器
	run: function (){},
	// Worker
	net: {},
};

// 启动
$w.run = function (){
	console.log('[Worker] Worker 正在启动...');
	$e.system.emit('worker_start');
	$w.net = new Worker('cake/worker/worker.net.js?v=0');
	// 收到的消息
	$w.net.onmessage = (e) => {
		let $tp = e.data;
		$e.system.emit('worker_message', $tp);

		if($tp.type === 'ws.onm'){ // 收到消息
			// console.log($tp);
			$e.player.emit($tp.type2, $tp.data, {
				serverSendTime: $tp.serverSendTime,
			});
			// let $loopStartTime = Date.now();
			// // 更新上次连接时间
			// $c.time.lastHave = $loopStartTime;

			// // 遍历数组
			// $tp.data.data.forEach((e) => {
			// 	// 交给main
			// 	main(e, $tp.data.time);
			// });
		}else

		if($tp.type === 'worker_on'){ // worker启动完成
			console.log('[Worker] Worker 启动完成');
			$e.net.emit('worker_on');
			// 启动 websocket
			$w.net.postMessage({type: 'start_ws'});
		}else

		if($tp.type === 'ws.onopen'){ // 建立连接
			console.log('[WebSocket] WebSocket 连接成功');
			$e.net.emit('ws.onopen');
			// $c.wsOK = true;
			// _loop('network', true);
			// 注册玩家
			// main_send({type: 'reg'});
		}else

		if($tp.type === 'ws.onclose'){ // 连接断开
			console.log('[WebSocket] WebSocket 连接断开');
			$e.net.emit('ws.onclose');
			// // 结束所有循环
			// _loop('player', false);
			// _loop('tps', false);
			// _loop('network', false);
			// $c.wsOK = false;
		}
	};
};



