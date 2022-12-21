// 注册事件监听
db.add({type: 'player', name: 'ping'}, $c.Event);

// 预留, ping目前由网络模块自动处理
$e.player.on('ping', ($eData, $tp, $player) => {
	if($eData.prohibit.indexOf('server_ping') !== -1) return false;

});
