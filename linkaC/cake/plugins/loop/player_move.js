
// 玩家移动
$e.ui.on('ui.loopStart', ($loopStartTime) => {
	// 移动是否被禁用
	if($t.WASD.disable !== true){
		// 玩家是否移动
		if($t.WASD.enable === true){
			let $place = [0, 0, 0, 0, 0];
			// 如果是键盘就将其转换为角度
			if($t.WASD.isKeyboard === true){
				// 遍历按下的键, 获取固定角度名
				let $keyName = '';
				for(let key in $t.WASD.keyboard){
					if($t.WASD.keyboard[key] === true){
						$keyName += key;
					}
				}

				// 角度
				let $a = $t.WASD.keyAngle[$keyName];

				// 判断是否按下不支持的键, 比如 AD, WASD
				if($a === undefined){
					return false;
				}

				$place[3] = $a;

				// 移动时速度倍率递增, 直到1. 反之递减
				if($t.WASD.angle[2] !== 1){
					$t.WASD.angle[2] = Math.min(Math.max($t.WASD.angle[2] + 0.2, 0.5), 1);
				}
			}else{
				$place[3] = $t.WASD.angle[0];
			}

			// 根据速度倍率计算步长
			let $stepSize = $t.WASD.angle[2] * $t.WASD.stepSize;

			// 已知偏航角和圆的半径, 计算圆上点的坐标
			$place[0] = Math.round(Math.sin($place[3] * Math.PI / 180) * $stepSize);
			$place[1] = Math.round(Math.cos($place[3] * Math.PI / 180) * $stepSize);

			// 应用
			$c.entity[$c.player.id].place[0] += $place[0];
			$c.entity[$c.player.id].place[1] += $place[1];
			$c.entity[$c.player.id].place[3] = $place[3];

			// 实时更新
			lib.update_place_to_player();		// 玩家位置
			lib.update_place_to_background();	// 背景相对玩家位置

			// 场景层更新周期
			if($c.time.last_update_place_noRealTime < $loopStartTime - 1200){
				$c.time.last_update_place_noRealTime = $loopStartTime;
				// 层缩放中心位置, 因为过渡动画时间足够长, 不需要实时更新
				lib.update_place_to_transformOrigin();
			}

			// 发送给服务器
			lib.netQueue('playerMove', {
				type: 'playerMove',
				place: $c.entity[$c.player.id].place,
			});
		}else{
			$c.time.player_move_start = $loopStartTime;

			// 使用键盘控制
			if($t.WASD.isKeyboard === true){
				// 反之递减, 移动时速度倍率递增, 直到1.
				if($t.WASD.angle[2] !== 0){
					$t.WASD.angle[2] = Math.max($t.WASD.angle[2] - 0.1, 0);
				}
			}
		}
	}
});
