
// 在遍历玩家时处理数据包发送
$e.loop.on('ergodic_player', ($funcStartTime, $player) => {
	e = $player.id;

	// 删除已超时的玩家
	if(db.get({id: e}).time.lastHave < $funcStartTime - 20000){ // 20s
		log.out('INFO', '[网络] '+ db.get({id: e})?.name +'('+ e +') 心跳超时');
		lib.logoutClient(e, '因心跳超时断开连接');
	}

	// 处理当前玩家的网络io队列
	// 所有数据都堆在网络队列中, 根据数据的标签判断发送给谁, 比如 'player_id', '_ALL_'
	let $arr = [];
	// 检查网络队列中是否有正在遍历的玩家的id
	if($t.queue_net[e] !== undefined){ // 如果网络队列中有这个玩家id
		//存在, 遍历这个玩家的数据表
		for(let key in $t.queue_net[e]){
			// 将数据push到这个玩家的临时数组
			$arr.push($t.queue_net[e][key]);
		}
	}
	// 检查是否有 _ALL_ (发送给所有玩家)
	if($t.queue_net['_ALL_'] !== undefined){
		for(let key in $t.queue_net['_ALL_']){
			$arr.push($t.queue_net['_ALL_'][key]);
		}
	}
	// 排除玩家 _!ALL_
	if($t.queue_net['_!ALL_'] !== undefined){
		for(let key in $t.queue_net['_!ALL_']){
			// 如果不是排除当前玩家
			if($t.queue_net['_!ALL_'][key].id !== e){
				$arr.push($t.queue_net['_!ALL_'][key]);
			}
		}
	}
	// 将合并后的数据发送给目标玩家
	if($arr.length > 0){
		// 判断玩家是否存在
		if(db.get({id: e}) !== undefined){
			// 发送数据
			db.get({id: e}).ws.send(JSON.stringify({
				time: $funcStartTime,
				data: $arr,
			}));
			// 更新最后发送时间
			let $player = db.get({id: e});
			$player.time.lastSend = $funcStartTime
			db.up($player);
		}
	}
	// console.log(JSON.stringify($t.queue_net));
});


// 循环结束, 清空网络队列
$e.loop.on('loopEnd', () => {
	$t.queue_net = {};
});
