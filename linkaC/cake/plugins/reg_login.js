
// sw已连接, 发送注册数据包
$e.net.on('ws.onopen', () => {
	// 发送注册数据包
	lib.netQueue('reg', {
		type: 'reg',
		name: $c.player.name,
	});
});


// 处理服务器返回的注册数据包
$e.player.on('reg', ($tp) => {
	// 将服务器分配的玩家id保存下来
	$c.player.id = $tp.id;
	$c.player.key = $tp.key;
	// 同步到worker线程
	$w.net.postMessage({type: 'add_$player', data: $c.player});
});



