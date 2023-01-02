// 注册事件监听
db.add({type: 'player', name: 'sendMessage'}, $c.Event);
const comm = require($config.rootPath +'/lib/command.js');


$e.player.on('sendMessage', async ($eData, $tp, $player) => {
	if($eData.prohibit.indexOf('server_sendMessage') !== -1) return false;

	// 数据检查
	if(lib.enter_playerOK($tp) !== true			// 验证玩家
	|| lib.is($tp.data.message) !== '[object String]'	// 消息是否为字符串类型
	|| $tp.data.message.length > 2048	// 判断消息长度是否正常
	|| $tp.data.message.replaceAll(' ', '').replaceAll('　', '') === '' // 消息为空
	) return false;

	// 移除首尾空格
	let $message = $tp.data.message.replace(/^\s*([\S\s]*?)\s*$/, '$1');

	// 判断是消息还是指令
	if($message.substring(0, 1) === '/'){
		// 获取指令数组
		let $comm = $message.split(' ');
		// 运行指令
		log.out('PLAYER', $player.name +' 运行指令: '+ $message);
		let $s = comm.run($comm, $player, $player.power);
		// 返回消息
		let $commMessage = $s[1] || (($s[0] === true)? '' : '未知指令或权限不足');
		log.out('INFO', '[指令] @'+ $player.name +': '+ $commMessage);

		// 向玩家发送指令返回消息
		lib.to_queue_net($tp.id, 'message', {
			type: 'message',
			type_message: 'system',
			id: $tp.id,
			message: ['服务器', $commMessage, {class: 'new system'}],
		});
	}else{
		// 服务器保存这条消息
		$t.message.push([$player.name, $message]);

		// 删除超过暂存数量限制的消息
		for(let key = 0; ($t.message).length > $config.max_messageArray; key++){
			$t.message.splice(key, 1);
		}

		// 广播新消息
		lib.to_queue_net('_ALL_', 'message', {
			type: 'message',
			type_message: 'player',
			id: $tp.id,
			message: $message,
		});
		log.out('PLAYER', $player.name +' 发送消息: '+ $message);
	}
});
