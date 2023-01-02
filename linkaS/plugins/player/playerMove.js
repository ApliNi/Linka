// 注册事件监听
db.add({type: 'player', name: 'playerMove'}, $c.Event);


$e.player.on('playerMove', async ($eData, $tp, $player) => {
	if($eData.prohibit.indexOf('server_playerMove') !== -1) return false;

	if(lib.enter_playerOK($tp) !== true			// 验证玩家
	|| lib.is($tp.data?.place) !== '[object Array]'	// 判断位置
	|| ($tp.data.place).length !== 5	// 判断数组长度是否正常
	) return false;

	// 数据检查: 检查坐标数组的每个值
	$tp.data.place.forEach((e) => {
		if(lib.is(e) !== '[object Number]'	// 判断是否为数字
		|| String(e).indexOf('.') > -1		// 判断是否有小数点
		) return false;
	});

	// 检查坐标的数字范围
	if($tp.data.place[3] < -180
	|| $tp.data.place[3] > 180
	// || $tp.data.place[4] < -180
	// || $tp.data.place[4] > 180
	) return false;

	// // 从上次同步坐标到现在, 玩家最多能走多远. 判断玩家是否超过这个距离
	// // let $_maxRange = ($funcStartTime - $c.entity[$tp.id].time.place) / 1000 * (1000 / 13 * 10) + 2; // +2 容错
	// let $_maxRange = ($funcStartTime - $c.entity[$tp.id].time.place) / 30 * (13 + 2); // +2 容错
	// //console.log($_maxRange, Math.abs($tp.data.place[0] - $c.entity[$tp.id].place[0]), Math.abs($tp.data.place[1] - $c.entity[$tp.id].place[1]), Math.abs($tp.data.place[2] - $c.entity[$tp.id].place[2]));
	// if(Math.abs($tp.data.place[0] - $c.entity[$tp.id].place[0]) > $_maxRange
	// || Math.abs($tp.data.place[1] - $c.entity[$tp.id].place[1]) > $_maxRange
	// || Math.abs($tp.data.place[2] - $c.entity[$tp.id].place[2]) > $_maxRange
	// ) return false;

	// 存储玩家位置
	$player.place = $tp.data.place;
	// 更新位置更新时间
	$player.time.place = Date.now();

	// db.up($player);

	// 广播玩家位置
	lib.to_queue_net('_!ALL_', 'playerMove_'+ $tp.id, {
		type: 'playerMove',
		id: $tp.id,
		place: $player.place,
	});
});


// $e.player.on('playerMove', ($eData, $tp, $player) => {
// 	$eData.prohibit.push('112');
// });


// $e.player.on('playerMove', ($eData, $tp, $player) => {
// 	if($eData.prohibit.indexOf('112') !== -1) return false;
// 	console.log(112);
// });
