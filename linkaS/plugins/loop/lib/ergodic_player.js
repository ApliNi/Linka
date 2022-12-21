
// 循环启动时遍历玩家
$e.loop.on('loopStart', ($funcStartTime) => {
	// 遍历所有玩家
	db.get({type: 'player'}, true).forEach(($player) => {

		$e.loop.emit('ergodic_player', $funcStartTime, $player);

	});
});

