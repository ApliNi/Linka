
// 渲染一条消息
$e.player.on('message', ($tp) => {
	if($tp.type_message === 'player'){ // 玩家发送消息
		lib.addMessage($c.entity[$tp.id].name, $tp.message, {
			playerID: $tp.id,
			notification: (document.visibilityState === 'hidden')? true : false,
		});
	}else

	if($tp.type_message === 'system'){ // 渲染系统消息数组
		lib.addMessage($tp.message[0], $tp.message[1], $tp.message[2]);
	}
});


// 监听输入框回车
lib.geb('message-input').addEventListener('keypress', async (event) => {
	if(event.code === 'Enter'){
		let $dom = lib.geb('message-input');
		// 如果消息为空则不发送
		if($dom.value.replaceAll(' ', '').replaceAll('　', '') !== ''){
			lib.netQueue('sendMessage'+ performance.now(), {
				type: 'sendMessage',
				message: $dom.value,
			})
			// 清空输入框
			$dom.value = '';
		}
		// 关闭输入框
		$e.system.emit('onkeyup', {code: 'Escape'});
	}
});
