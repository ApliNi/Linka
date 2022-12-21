
// 初始化
$t.plugins.message = {
	enable: false,
	// 打开 or 收起
	func: async function ($open){
		if($open === true){
			$t.plugins.message.enable = true;
			lib.geb('message').classList.add('-open');
			lib.geb('message-input').focus();
			// 滚动到底部
			lib.geb('message-list').scrollTop = lib.geb('message-list').scrollHeight;
		}else{
			$t.plugins.message.enable = false;
			lib.geb('message').classList.remove('-open');
		}
	},
};


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


// 发送消息
$e.ui.on('message.send_key', async () => {
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
	$t.plugins.message.func(false);
});


// 监听输入框回车
lib.geb('message-input').addEventListener('keypress', async (event) => {
	if(event.code === 'Enter'){
		$e.ui.emit('message.send_key');
	}
});
// 聊天组件打开
$e.system.on('onkeyup.KeyT', async () => {
	if($t.plugins.message.enable === false){
		$t.plugins.message.func(true);
	}
});
$e.system.on('onkeyup.Backspace', async () => {
	if($t.plugins.message.enable === false){
		$t.plugins.message.func(true);
	}
});
// 收起
$e.system.on('onkeyup.Escape', async () => {
	if($t.plugins.message.enable === true){
		$t.plugins.message.func(false);
	}
});

