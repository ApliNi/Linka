// tps循环和用户操作循环


// tps循环
$c.loop.tps_func = function (){
	let $loopStartTime = Date.now();

	// 遍历实体移动队列
	let $_t = {
		add: [],
		del: [],
	};
	$t.queue.move.forEach((e) => { // e = 发生移动的实体的id
		// 不是自己移动
		if(e !== $c.player.id){
			// 是否在自己的攻击范围内
			// 判断 对方的坐标是否在 自己的攻击范围半径 + 对方的碰撞箱半径 内
			if(lib.isOverlap($c.entity[$c.player.id].place, 40 + 25, $c.entity[e].place)){
				// 不在碰撞队列中
				if($t.queue.overlap.indexOf(e) === -1){
					// 将这个实体添加到碰撞队列中
					$_t.add.push(e);
					//$t.queue.overlap.push(e);
				}
			}else{
				// 在碰撞队列中
				if($t.queue.overlap.indexOf(e) !== -1){
					// 将这个实体从碰撞队列中删除
					$_t.del.push(e);
					//$t.queue.overlap.splice($t.queue.overlap.indexOf(e), 1);
				}
			}
		}else

		// 是自己移动
		{
			// 遍历所有实体列表
			for(let key in $c.entity){
				let $id = $c.entity[key].id;
				// 不是自己
				if($id !== $c.player.id){
					// 不在实体移动队列中
					if($t.queue.move.indexOf($id) === -1){
						// 在自己的攻击范围内
						if(lib.isOverlap($c.entity[$c.player.id].place, 40 + 25, $c.entity[$id].place)){
							// 不在碰撞队列中
							if($t.queue.overlap.indexOf($id) === -1){
								// 将这个实体添加到碰撞队列中
								$_t.add.push($id);
								//$t.queue.overlap.push(e2);
							}
						}else{
							// 在碰撞队列中
							if($t.queue.overlap.indexOf($id) !== -1){
								// 将这个实体从碰撞队列中删除
								$_t.del.push($id);
								//$t.queue.overlap.splice($t.queue.overlap.indexOf(e2), 1);
							}
						}
					}
				}
			}
		}
	});
	// 对比, 如果碰撞队列发生变化
	if($_t.add.length !== 0){
		// 遍历添加
		$_t.add.forEach((e) => {
			$t.queue.overlap.push(e);
			// 渲染状态
			lib.geb(e).classList.add('--overlap');
			// 事件
			$e.ui.emit('overlap', {id: e,
				trigger_y: ['overlap', true],
			})
		});
		lib.geb($c.player.id).classList.add('--overlap');
	}
	if($_t.del.length !== 0){
		// 遍历删除
		$_t.del.forEach((e) => {
			$t.queue.overlap.splice($t.queue.overlap.indexOf(e), 1);
			// 渲染状态
			lib.geb(e).classList.remove('--overlap');
			// 事件
			$e.ui.emit('overlap', {id: e,
				trigger_y: ['overlap', false],
			})
		});
		if($t.queue.overlap.length === 0) lib.geb($c.player.id).classList.remove('--overlap');
	}

	// 清空队列
	$t.queue.move = [];


	// 处理攻击
	if($t.queue.disable_attack === false && $t.queue.attack === true){
		$t.queue.attack = false;
		// 遍历当前碰撞的实体
		$t.queue.overlap.forEach((e) => {
			// 事件
			$e.ui.emit('attack', {id: e,
				trigger_y: ['attack'],
			})
		});
	}

	$c.time.mspt_tps = Date.now() - $loopStartTime;
};


// ui循环
$c.loop.ui_func = function (){
	let $loopStartTime = Date.now();

	// 玩家移动
	playerMove();
	function playerMove(){
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
	};


	// 窗口尺寸变化事件
	if($t.queue.reRenderForWindowSize === true){
		lib.update_place_to_background();
		$t.queue.reRenderForWindowSize = false;
	}

	// F3 调试界面启用
	if($t.F3.enable === true){
		// 设置更新周期, 防止太快
		if($t.F3.lastUpdateTime < $loopStartTime - 70){
			$t.F3.lastUpdateTime = $loopStartTime;
			// 如果允许更新
			if($t.F3.update === true){
				// 渲染调试信息
				let $iM = `
					<p title="[宽, 高]">视窗尺寸: [${[document.documentElement.clientWidth, document.documentElement.clientHeight]}]</p>

					<br />
					<p>MSPT: UI:${$c.time.mspt_ui}/${$c.loop._ui_time}, MAIN:${$c.time.mspt_tps}/${$c.loop._tps_time}. SERVER:${$c.time.mspt_server} (ms)</p>
					<p>DOM数量: ${document.querySelectorAll('*').length}</p>
					<p>内存占用: ${Math.round(window.performance.memory.usedJSHeapSize / 1024)}KB / ${Math.round(window.performance.memory.totalJSHeapSize / 1024)}KB (Data: ${Math.round((JSON.stringify($c).length + JSON.stringify($c).length) / 1024)}KB)</p>
					<p>相对时间: ${Math.round(performance.now())}ms</p>

					<br />
					<p>玩家信息: <span title="[x(+left), y(-top), z(未定义), y(偏航角), p(俯仰角)]">ID:'${$c.player.id}', PLACE:[${$c.entity[$c.player.id].place}]</span></p>
					<p>玩家碰撞队列: [${$t.queue.overlap}]</p>
					<p>实体移动队列: [${$t.queue.move}]</p>
				`;
				// 如果与上一个不同就渲染
				if(lib.geb('F3_info').innerHTML !== $iM){
					lib.geb('F3_info').innerHTML = $iM;
				}
			}
		}

	}

	$c.time.mspt_ui = Date.now() - $loopStartTime;
};


// 循环管理器
$c.loop.run = function ($name, $mode){
	if($mode === true){
		if($name === 'tps'){
			$c.loop.tps = setInterval($c.loop.tps_func, $c.loop.tps_time)
		}else if($name === 'ui'){
			$c.loop.ui = setInterval($c.loop.ui_func, $c.loop.ui_time)
		}
	}else{
		if($name === 'tps'){
			clearInterval($c.loop.tps);
		}else if($name === 'ui'){
			clearInterval($c.loop.ui);
		}
	}
};
