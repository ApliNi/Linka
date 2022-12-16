// npc运行库
npc = {
	// npc临时数据
	data: {
		npc: {},
	},
};


// 触发npc
npc.activation = function ($tp){
	// 初始化
	if($c.entity[$tp.id]?.__program_queue === undefined){
		$c.entity[$tp.id].__program_queue = {};
	}
	// 遍历NPC程序数组
	for(let key in $c.entity[$tp.id].program){
		// 交给脚本解析器
		npc.func({
			id: $tp.id,
			trigger_y: $tp.trigger_y,
			program: $c.entity[$tp.id].program[key],
		})
	}
};


// 脚本解析器
npc.func = function ($tp){
	if($tp.program.type === 'program'){ // 程序组
		let $e = $tp.program;

		let $triggerOK = false;
		let $_trigger_y = $tp.trigger_y;
		// trigger_x
		if($e?.trigger_x === undefined || new Function('return '+ $e.trigger_x)() === true){
			//$triggerOK = true;

			// trigger_y, 支持判断多个事件
			if($e?.trigger_y !== undefined){
				if(Object.prototype.toString.call($e.trigger_y[0]) === '[object Array]'){ // 如果trigger_y里面套了一个trigger_y数组
					$e.trigger_y.forEach((e) => {
						if(lib.triggerOK(e, $tp.trigger_y)){
							$_trigger_y = $tp.trigger_y;
							$triggerOK = true;
							return;
						}
					})
				}else{
					if(lib.triggerOK($e.trigger_y, $tp.trigger_y)){
						$_trigger_y = $tp.trigger_y;
						$triggerOK = true;
					}
				}
			}else{
				$triggerOK = true;
			}

			// trigger_z
			if(!true){
				$triggerOK = false;
			}
		}

		// 条件成立
		if($triggerOK === true){
			// console.log($e);
			// 初始化程序数据
			if($e?.mode === undefined) $e.mode = ['all'];
			if($e?.__pointer === undefined) $e.__pointer = 0;
			if($e?.loop === undefined) $e.loop = true;

			// 判断运行模式
			if($e.mode[0] === 'all'){ // 运行全部
				for(let key in $e.program){
					// 交给脚本解析器
					let $s = npc.func({
						id: $tp.id,
						trigger_y: $_trigger_y,
						program: $e.program[key],
						parent_program: $e,
					});
				}
				// 更新指针
				$e.__pointer = $e.program.length;
			}else

			if($e.mode[0] === 'pointer'){ // 根据指针
				// 将指针指向的程序交给脚本解析器
				let $s = npc.func({
					id: $tp.id,
					trigger_y: $_trigger_y,
					program: $e.program[$e.__pointer],
					parent_program: $e,
				});
				// 如果返回信息为false则不递增指针
				if($s !== false){
					$e.__pointer ++;
				}
			}

			// 判断指针是否超出程序范围
			if($e.__pointer >= $e.program.length){
				// 判断程序是否允许循环
				if($e.loop === true){
					// 重置指针
					$e.__pointer = 0;
				}
			}
		}
		return;
	}else
	// 判断这是一个最小化程序组还是独立程序
	if(Object.prototype.toString.call($tp.program) === '[object Array]'){
		// 是程序组, 遍历并将程序交给解析器
		$tp.program.forEach((e) => {
			npc.func({
				id: $tp.id,
				trigger_y: $tp.trigger_y,
				program: e,
			});
		});
	}

	// npc_id覆盖
	let $original_id = $tp.id;
	if($tp.program?.sudo_npc_id){
		$tp.id = $tp.program.sudo_npc_id;
	}
	// ---



	if($tp.program.type === 'text'){ // 显示消息
		// 选择一条消息
		let $text = '';
		if($tp.program?.mode === undefined){ // 默认, 只有一条消息
			// 直接赋值消息
			$text = $tp.program.text;
		}else if($tp.program?.mode === '随机'){ // 随机消息
			// 获取一条随机消息
			$text = $tp.program.text[Math.floor(Math.random() * $tp.program.text.length)];
		}else if($tp.program?.mode === 'default_addp'){ // 修改默认附加参数
			$t.npc_func.text.addp = $tp.program.addp;
			return;
		}

		// 加载默认附加参数
		if($t.npc_func.text.addp !== ''){
			// 程序定义配置 > 全局配置 > 默认配置
			$tp.program.addp = ($tp.program?.addp !== undefined)? $tp.program.addp : $t.npc_func.text.addp;
		}

		// 运行附加参数
		if($tp.program?.addp === 'clear_pre' && $t.npc_func.text.pre_id !== ''){ // 清除上一条消息
			// 如果上一条消息的id与当前消息的id相同则不清理, 因为auto会自动处理
			if($t.npc_func.text.pre_id !== $tp.id){
				npc.func({
					id: $t.npc_func.text.pre_id,
					program: {
						type: 'text',
						sudo_trigger_x: false,
						addp: '',
					},
				});
			}
		}

		// 显示在哪里
		if($tp.program?.place === undefined || $tp.program.place === 'npc_top'){ // 默认, NPC顶部(名称上方)
			// 检查并创建消息 dom
			let $root = lib.geb($tp.id).getElementsByClassName('top_text')[0];
			if($root.getElementsByClassName('func-'+ $tp.program.type).length < 1){
				// 创建消息显示dom
				let $dom = document.createElement('span');
					$dom.setAttribute('class', '-quit func-'+ $tp.program.type);
				$root.appendChild($dom);
			}
			let $dom = $root.getElementsByClassName('func-'+ $tp.program.type)[0];

			// 显示模式, 优先级: 数据覆盖 > 触发器(碰撞) > 自动
			let $mode = 'auto';
			if($tp.program?.sudo_trigger_x !== undefined){
				$mode = $tp.program.sudo_trigger_x;
			}else if($tp.trigger_y[0] === 'overlap'){
				$mode = $tp.trigger_y[1];
			}


			if($mode === 'auto'){ // 自动
				// 如果有消息则收起后显示新消息, 否则直接显示新消息
				if($dom.classList.contains('-quit') !== true){
					$dom.classList.add('-quit'); // 收起
					setTimeout(function(){ // 延迟显示新消息
						if($text !== undefined) $dom.innerText = $text;
						$dom.classList.remove('-quit'); // 显示
					}, 170);
				}else{
					$dom.classList.remove('-quit'); // 显示
					if($text !== undefined) $dom.innerText = $text;
				}
			}else if($mode === true){ // 显示消息, 不自动收起
				$dom.innerText = $text;
				$dom.classList.remove('-quit');
			}else if($mode === false){ // 收起消息
				$dom.classList.add('-quit');
			}

			// 记录这个npc_id
			$t.npc_func.text.pre_id = $tp.id;
		}
	}else

	if($tp.program.type === 'animationLib'){ // 调用动画库
		// 遍历动画数组
		$tp.program.data.forEach((e) => {
			lib.animationLib(e.id, e.mode);
		});
		// 其他更新
		lib.update_place_to_background();
	}else

	if($tp.program.type === 'decision'){ // 向玩家显示选择框, 并保存结果到 $d.playerDecision
		if($tp.program.mode === true){
			// 启用消息选择组件
			$t.npc_func.decision.enable = true;
			lib.geb('decision').classList.add('-join');
			lib.geb('decision').innerHTML = '';
			// 渲染可选择的消息
			$t.npc_func.decision.id_list = $tp.program.data;
			$tp.program.data.forEach((e) => {
				lib.geb('decision').innerHTML += `
					<p onclick="npc.decision_click({this: this})" data-id="${e.id}">${e.text}</p>
				`;
			});
			// 添加默认选中的消息
			$t.npc_func.decision.pointer = Math.round(($tp.program.data.length - 1) / 2);
			lib.geb('decision').querySelectorAll('p')[$t.npc_func.decision.pointer].click();
		}else{
			// 获取玩家选择的消息id
			$t.npc_func.decision.id = lib.geb('decision').getElementsByClassName('-join')[0].dataset.id;
			// 关闭消息选择组件
			$t.npc_func.decision.enable = false;
			lib.geb('decision').classList.remove('-join');
		}
	}else

	if($tp.program.type === 'js'){ // 运行js代码
		new Function('$tp', '$data', $tp.program.code)($tp, npc.data);
	}
};


// 渲染npc样式
npc.style = function ($tp){
	// 遍历这个npc的样式数组
	$c.entity[$tp.id].style.forEach((e) => {
		if(e.type === 'addDom'){ // 添加dom
			lib.geb($tp.id).innerHTML += e.dom;
		}
	});
};


// 玩家点击选择消息
npc.decision_click = function ($tp){
	// 取消上一个的选中样式
	if(lib.geb('decision').getElementsByClassName('-join').length > 0){
		lib.geb('decision').getElementsByClassName('-join')[0].classList.remove('-join');
	}
	// 获取这个消息的数据
	$t.npc_func.decision.id = $tp.this.dataset.id;
	// 添加选中样式
	$tp.this.classList.add('-join');
};
