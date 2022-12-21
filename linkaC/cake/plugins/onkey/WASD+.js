
// PC端方向键
$t.plugins.WASD = {
	enable: false,	// 玩家正在移动
	disable: false,	// 移动被禁用
	isKeyboard: true,	// 是键盘操作
	keyboard: {	// 键盘的4个按键
		KeyW: false,
		KeyA: false,
		KeyS: false,
		KeyD: false,
	},
	keyAngle: {	// 固定角度名: 按键: 角度
		KeyW: 0,
		KeyWKeyA: -45,
		KeyWKeyAKeyD: 0,
		KeyA: -90,
		KeyAKeyS: -135,
		KeyWKeyAKeyS: -90,
		KeyS: -180,
		KeySKeyD: 135,
		KeyAKeySKeyD: -180,
		KeyD: 90,
		KeyWKeyD: 45,
		KeyWKeySKeyD: 90,
	},
	angle: [0, 0, 0],	// 偏航角, 俯仰角, 速度倍率(0~1)
	stepSize: 13,	// 移动步长
};

// 按键按下
$e.system.on('onkeydown', (event) => {
	if(['KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(event.code) !== -1){
		// 使用键盘操作
		if($t.plugins.WASD.isKeyboard === true){
			if($t.plugins.message.enable === true) return;
			$t.plugins.WASD.keyboard[event.code] = true;
			$t.plugins.WASD.enable = true;
		}
	}
});


// 按键松开事件
$e.system.on('onkeyup', (event) => {
	if(['KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(event.code) !== -1){
		// 使用键盘操作
		if($t.plugins.WASD.isKeyboard === true){
			$t.plugins.WASD.keyboard[event.code] = false;
			// 松开时判断是否所有按键都松开
			let $key = false;
			for(let key in $t.plugins.WASD.keyboard){
				if($t.plugins.WASD.keyboard[key] === true){
					$key = true;
					return;
				}
			}
			$t.plugins.WASD.enable = $key;

			if($t.npc_func.decision.enable === true){ // 是否由"玩家选择组件"接管移动事件
				// 通过键盘上下键移动指针
				if(event.code === 'KeyW') $t.npc_func.decision.pointer --;
				if(event.code === 'KeyS') $t.npc_func.decision.pointer ++;
				// 判断指针是否超出范围
				if($t.npc_func.decision.pointer < 0){
					$t.npc_func.decision.pointer = $t.npc_func.decision.id_list.length - 1;
				}else if($t.npc_func.decision.pointer > $t.npc_func.decision.id_list.length - 1){
					$t.npc_func.decision.pointer = 0;
				}
				// 获取指针指向的dom
				npc.decision_click({
					this: lib.geb('decision').querySelectorAll('p')[$t.npc_func.decision.pointer]
				});
			}
		}
	}else

	// 回车和空格, 攻击
	if(event.code === 'Enter' || event.code === 'Space'){
		// 如果聊天组件打开
		if($t.plugins.message.enable === true) return;
		// 创建攻击任务
		$t.queue.attack = true;
	}
});


// 窗口失去焦点
$e.system.on('window.onblur', () => {
	// 恢复所有按键
	['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach((e) => {
		$t.plugins.WASD.keyboard[e] = false;
	});
	$t.plugins.WASD.enable = false;
});
