
// 键盘按下事件
$e.system.on('onkeydown', async (event) => {
	// console.log("按钮按下", event);

	$e.system.emit('onkeydown.'+ event.code, event);

	if(event.code === 'Tab'){
		event?.preventDefault();
		// 其他组件
		if($t.message.enable === true){ // 聊天组件
			// 如果是指令

			// 运行指令补全

		}else{ // 没有组件, 显示玩家列表
			// 显示玩家名称和数量
			let $iM = '';
			// 遍历实体索引
			for(let key in $c.index_entity.type){
				// 添加实体类型
				$iM += '<p class="title" title="实体类型">'+ key +': </p>';
				// 遍历此类型的实体
				$c.index_entity.type[key].forEach((e) => {
					// 添加实体名称
					$iM += '<p class="main" title="id='+ e +'">'+ lib.filter($c.entity[e].name) +'</p>';
				});
			}
			// 渲染消息
			lib.geb('key-tab').innerHTML = $iM;
			lib.geb('key-tab').style.display = 'block';
		}

	}else

	// // 屏蔽浏览器默认的F3功能键
	// if(event.code === 'F3'){
	// 	event?.preventDefault();
	// }else


	// 4个方向键
	if(['KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(event.code) !== -1){
		// 使用键盘操作
		if($t.WASD.isKeyboard === true){
			if($t.message.enable === true) return;
			$t.WASD.keyboard[event.code] = true;
			$t.WASD.enable = true;
		}
	}
});


// 按键松开事件
$e.system.on('onkeyup', async (event) => {
	// console.log("按钮按下", event);

	$e.system.emit('onkeyup.'+ event.code, event);

	// ESC
	if(event.code === 'Escape'){
		// 聊天组件
		if($t.message.enable === true){
			$t.message.enable = false;
			lib.geb('message').classList.remove('-open');
		}
	}else

	// 在线玩家显示
	if(event.code === 'Tab'){
		lib.geb('key-tab').style.display = 'none';
	}else

	// // F3 调试界面
	// if(event.code === 'F3'){
	// 	$t.F3.enable = ($t.F3.enable === true)? false : true;
	// 	lib.geb('F3').style.display = ($t.F3.enable === true)? 'block' : 'none';
	// 	if($t.F3.enable === true){
	// 		lib.geb('all-player').classList.add('-debug');
	// 		lib.geb('background').classList.add('-debug');
	// 	}else{
	// 		lib.geb('all-player').classList.remove('-debug');
	// 		lib.geb('background').classList.remove('-debug');
	// 	}
	// }else

	// 聊天组件
	if(event.code === 'KeyT' || event.code === 'Backspace'){
		// 如果已经打开则不重复运行
		if($t.message.enable === false){
			$t.message.enable = true;
			lib.geb('message').classList.add('-open');
			lib.geb('message-input').focus();
			// 滚动到底部
			lib.geb('message-list').scrollTop = lib.geb('message-list').scrollHeight;
		}
	}else



	// 4个方向键, 移动
	if(['KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(event.code) !== -1){
		// 使用键盘操作
		if($t.WASD.isKeyboard === true){
			$t.WASD.keyboard[event.code] = false;
			// 松开时判断是否所有按键都松开
			let $key = false;
			for(let key in $t.WASD.keyboard){
				if($t.WASD.keyboard[key] === true){
					$key = true;
					return;
				}
			}
			$t.WASD.enable = $key;

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
		// 前置不兼容
		if($t.message.enable === true) return;
		// 创建攻击任务
		$t.queue.attack = true;
	}
});


// 窗口失去焦点
$e.system.on('window.onblur', () => {
	// 恢复所有按键
	['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach((e) => {
		$t.WASD.keyboard[e] = false;
	});
	$t.WASD.enable = false;
});
