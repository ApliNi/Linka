// 防止浏览器应用上次滚动的位置
history.scrollRestoration = 'manual';

// 全局变量
let $c = {
	wsOK: false, // 已连接
	time: {	// 各种时间
		lastSend: 0,	// 最后发送数据包
		lastHave: 0,	// 最后接收数据包
		last_update_place_noRealTime: 0,	// 不需要实时更新位置的组件的最后位置更新时间
		ping: 0,		// 网络延迟
		mspt_ui: 0,		// 用户操作mspt
		mspt_tps: 0,	// 运算mspt
		mspt_net: 0,	// 网络io-mspt
		mspt_server: 0,	// 服务器mspt
		player_move_start: 0, // ui循环中, 玩家开始移动前{ui_mspt}毫秒的时间
	},
	lastConnectionTime: 0, // 与服务器通讯的时间
	player: {
		id: '',
		key: '',
		name: (fromUrl('name') === '')? '未命名玩家' : fromUrl('name'),
	},
	entity: {},	// 实体数据
	index_entity: {},	// 实体索引
	loop: { // 循环指标 and 循环本体
		_network_time: 62,
		_network: null,

		_tps_time: 62,
		_tps: null,

		_player_time: 30,
		_player: null,
	},
};

// 全局缓存
let $t = {
	queue_net: {},	// 网络io队列
	WASD: {	// 玩家移动处理队列
		disable: false,	// 移动被禁用
		enable: false,	// 当前是否存在移动事件
		isKeyboard: false,	// 是不是键盘操作
		keyboard: {	// 键盘的4个按键
			KeyW: false,
			KeyA: false,
			KeyS: false,
			KeyD: false,
		},
		keyAngle: {	// 固定角度名: 角度
			KeyW: 0,
			KeyWKeyA: 315,
			KeyWKeyAKeyD: 0,

			KeyA: 270,
			KeyAKeyS: 225,
			KeyWKeyAKeyS: 270,

			KeyS: 180,
			KeySKeyD: 135,
			KeyAKeySKeyD: 180,

			KeyD: 90,
			KeyWKeyD: 45,
			KeyWKeySKeyD: 90,
		},
		angle: [0, 0],	// 偏航角, 俯仰角
		stepSize: 13,	// 移动步长
	},
	queue_entity: {	// 实体相关事件
		move: [],	// 移动的实体的id
		attack: false,	// 玩家攻击
		disable_attack: false,
		overlap: [],	// 在自己的攻击范围内的实体 | 当前碰撞的实体
	},
	window: {
		reRenderForWindowSize: false,	// 重新渲染, 根据窗口尺寸
	},
	message: {	// 聊天组件
		enable: false,
	},
	F3: {	// F3 调试界面
		enable: false,	// 使能
		update: true,	// 循环更新
		lastUpdateTime: 0,	// 最后更新时间, 防止更新太快浪费cpu
	},
	npc_func: {
		pointerAdd: true,
		text: {
			addp: '',
			pre_id: '',
		},
		decision: {	// 玩家选择层
			enable: false,
			id_list: [],
			pointer: 0,
			id: -1,
		},
	},
};

// 脚本数据
let $d = {
	npc: {},
	playerDecision: 0,
};

// ws
let ws = null;

// 初始化背景层坐标, 通过主配置
update_place_to_background();

// ws 初始化
start_ws();
function start_ws(){
	console.log('[/] ws.开始连接...');
	ws = new WebSocket('wss://ipacel.cc/websocket/');

	// 已建立连接
	ws.onopen = function(e){
		console.log('[/] ws.连接成功');
		$c.wsOK = true;
		_loop('network', true);
		// 注册玩家
		main_send({type: 'reg'});
	};

	// 收到消息
	ws.onmessage = function(evt){
		let $funcStartTime = Date.now();

		// 服务器将为每个玩家打包数据
		// [
		// 	{data},
		// 	{data},
		// ]

		let $tp = JSON.parse(evt.data);

		// 遍历数组
		$tp.data.forEach((e) => {
			// 交给main
			main(e, $tp.time);
		});

		// 更新上次连接时间
		$c.time.lastHave = $funcStartTime;
	};

	// 已断开连接
	ws.onclose = function (){
		// 结束所有循环
		_loop('player', false);
		_loop('tps', false);
		_loop('network', false);
		// 注销ws
		$c.wsOK = false;
		ws.close();
		console.log('[/] ws.连接已断开, 4秒后重试');
		setTimeout(function(){start_ws();}, 4000);
	};
};



// mspt随服务器变化
// setInterval(function(){

// 	// 碰撞检查任务
// 	if($t.overlap.enable === true){
// 		// 获取自己
// 		let $i = geb('player-'+ $c.id);
// 		let $i_xy = [parseInt($i.style.top), parseInt($i.style.left)]

// 		// 遍历所有实体, 找出攻击范围与自己重复的一个实体
// 		let $dom = geb('all-player').getElementsByClassName('player');

// 		_for(); // 为了使用 return
// 		function _for(){
// 			for(let key in $dom){
// 				if(!isNaN(key)){
// 					let $e = $dom[key];
// 					// 排除自己
// 					if($e.id !== 'player-'+$c.id){
// 						// 判断是否重叠
// 						if(isOverlap($i_xy, [parseInt($e.style.top), parseInt($e.style.left)], 65)){ // 50+(80-50)/2: 自己的攻击范围触碰到对方的碰撞箱
// 							$e.classList.add('-overlap');
// 							$i.classList.add('-overlap');
// 							// 将对方的id记录下来
// 							$t.overlap.victim_id = $e.dataset.id;
// 							$t.overlap.ing = true; // 正在发生
// 							return;
// 						}else{
// 							$e.classList.remove('-overlap');
// 							$i.classList.remove('-overlap');
// 							$t.overlap.ing = false;
// 						}
// 					}
// 				}
// 			}
// 		};

// 		// 移除任务
// 		$t.overlap.enable = false;
// 	}

// }, Math.max(50, $t.server_mspt));


// 循环管理器
function _loop($name, $start){
	// 用于启动/停止循环
	if($start === true){
		if($name === 'network') $c.loop._network = setInterval(_loop_network, $c.loop._network_time);
		if($name === 'tps') $c.loop._tps = setInterval(_loop_tps, $c.loop._tps_time);
		if($name === 'player') $c.loop._player = setInterval(_loop_player, $c.loop._player_time);
	}else{
		if($name === 'network') clearInterval($c.loop._network);
		if($name === 'tps') clearInterval($c.loop._tps);
		if($name === 'player') clearInterval($c.loop._player);
	}
};

// 网络io循环
function _loop_network(){
	let $funcStartTime = Date.now();

	// 发送心跳包
	if($c.time.lastSend < $funcStartTime - 20 * 1000){
		$t.queue_net['heartbeat'] = {
			type: 'heartbeat',
		};
	}

	// 已超时


	// 处理网络io队列
	let $arr = [];
	// 遍历网络io队列
	for(let key in $t.queue_net){
		$arr.push($t.queue_net[key]);
		delete $t.queue_net[key];
	}
	// 如果数据不为空则发送
	if($arr.length > 0){
		ws.send(JSON.stringify({
			id: $c.player.id,
			key: $c.player.key,
			time: $funcStartTime,
			data: $arr,
		}));
		$c.time.lastSend = $funcStartTime;
	}

	$c.time.mspt_net = Date.now() - $funcStartTime;
};

// tps循环
function _loop_tps(){
	let $funcStartTime = Date.now();

	// 遍历实体移动队列
	let $_t = {
		add: [],
		del: [],
	};
	$t.queue_entity.move.forEach((e) => { // e = 发生移动的实体的id
		// 不是自己移动
		if(e !== $c.player.id){
			// 在自己的攻击范围内
			// 判断 对方的坐标是否在 自己的攻击范围半径 + 对方的碰撞箱半径 内
			if(isOverlap($c.entity[$c.player.id].place, 40 + 25, $c.entity[e].place)){
				// 不在碰撞队列中
				if($t.queue_entity.overlap.indexOf(e) === -1){
					// 将这个实体添加到碰撞队列中
					$_t.add.push(e);
					//$t.queue_entity.overlap.push(e);
				}
			}else{
				// 在碰撞队列中
				if($t.queue_entity.overlap.indexOf(e) !== -1){
					// 将这个实体从碰撞队列中删除
					$_t.del.push(e);
					//$t.queue_entity.overlap.splice($t.queue_entity.overlap.indexOf(e), 1);
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
					if($t.queue_entity.move.indexOf($id) === -1){
						// 在自己的攻击范围内
						if(isOverlap($c.entity[$c.player.id].place, 40 + 25, $c.entity[$id].place)){
							// 不在碰撞队列中
							if($t.queue_entity.overlap.indexOf($id) === -1){
								// 将这个实体添加到碰撞队列中
								$_t.add.push($id);
								//$t.queue_entity.overlap.push(e2);
							}
						}else{
							// 在碰撞队列中
							if($t.queue_entity.overlap.indexOf($id) !== -1){
								// 将这个实体从碰撞队列中删除
								$_t.del.push($id);
								//$t.queue_entity.overlap.splice($t.queue_entity.overlap.indexOf(e2), 1);
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
			$t.queue_entity.overlap.push(e);
			// 渲染状态
			geb(e).classList.add('--overlap');
			// 事件
			_event(['overlap', true, e]);
		});
		geb($c.player.id).classList.add('--overlap');
	}
	if($_t.del.length !== 0){
		// 遍历删除
		$_t.del.forEach((e) => {
			$t.queue_entity.overlap.splice($t.queue_entity.overlap.indexOf(e), 1);
			// 渲染状态
			geb(e).classList.remove('--overlap');
			// 事件
			_event(['overlap', false, e]);
		});
		if($t.queue_entity.overlap.length === 0) geb($c.player.id).classList.remove('--overlap');
	}
	if($_t.del.length !== 0 || $_t.add.length !== 0){
		//console.log($t.queue_entity.overlap);
		// 触发实体碰撞事件
		//main_cope({type: 'overlap', data: $_t});
	}
	// 清空队列
	$t.queue_entity.move = [];


	// 处理攻击
	if($t.queue_entity.disable_attack === false && $t.queue_entity.attack === true){
		$t.queue_entity.attack = false;
		// 遍历当前碰撞的实体
		$t.queue_entity.overlap.forEach((e) => {
			// 事件
			_event(['attack', e]);
		});
	}

	$c.time.mspt_tps = Date.now() - $funcStartTime;
};


// 本地ui处理循环
function _loop_player(){
	let $funcStartTime = Date.now();

	// 玩家移动
	playerMove();
	function playerMove(){
		// 移动是否被禁用
		if($t.WASD.disable !== true){
			// 玩家是否移动
			if($t.WASD.enable === true){
				let $place = [0, 0, 0, 0, 0];
				// 如果是键盘就将其转换为角度
				if($t.WASD.isKeyboard === true || true){
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
				}

				// 根据连续移动时间, 动态缩放移动步长
				let $stepSize = $t.WASD.stepSize; // 最大步长
				let $continuity_move_time = $funcStartTime - $c.time.player_move_start;
				if($continuity_move_time < 100){
					$stepSize = $continuity_move_time * ($t.WASD.stepSize / 200);
				}


				// 已知偏航角和圆的半径, 计算圆上点的坐标
				$place[0] = Math.round(Math.sin($place[3] * Math.PI / 180) * $stepSize);
				$place[1] = Math.round(Math.cos($place[3] * Math.PI / 180) * $stepSize);

				// 应用
				$c.entity[$c.player.id].place[0] += $place[0];
				$c.entity[$c.player.id].place[1] += $place[1];
				$c.entity[$c.player.id].place[3] = $place[3];

				// 背景层 = 反向的玩家的移动方向
				// $c.layer.backdrop[0] -= $place[0];
				// $c.layer.backdrop[1] -= $place[1];

				// 实时更新
				update_place_to_player();		// 玩家位置
				update_place_to_background();	// 背景相对玩家位置

				// 场景层更新周期
				if($c.time.last_update_place_noRealTime < $funcStartTime - 1200){
					$c.time.last_update_place_noRealTime = $funcStartTime;
					// 层缩放中心位置, 因为过渡动画时间足够长, 不需要实时更新
					update_place_to_transformOrigin();
				}

				// 发送给服务器
				$t.queue_net['WASD'] = {
					type: 'playerMove',
					place: $c.entity[$c.player.id].place,
				};

				// 触发玩家移动事件
				//__player_move();
			}else{
				$c.time.player_move_start = $funcStartTime;
			}
		}
	};


	// 窗口尺寸变化事件
	if($t.window.reRenderForWindowSize === true){
		reRenderForWindowSize = false;
		update_place_to_background();
	}

	// F3 调试界面启用
	if($t.F3.enable === true){
		// 设置更新周期, 防止太快
		if($t.F3.lastUpdateTime < $funcStartTime - 70){
			$t.F3.lastUpdateTime = $funcStartTime;
			// 如果允许更新
			if($t.F3.update === true){
				// 渲染调试信息
				let $iM = `
					<p title="[宽, 高]">视窗尺寸: [${getClientWidthHeight()}]</p>

					<br />
					<p>MSPT: UI:${$c.time.mspt_ui}/${$c.loop._player_time}, TPS:${$c.time.mspt_tps}/${$c.loop._tps_time}, NET:${$c.time.mspt_net}/${$c.loop._network_time}. SERVER:${$c.time.mspt_server} (ms)</p>
					<p>DOM数量: ${document.querySelectorAll('*').length}</p>
					<p>内存占用: ${Math.round(window.performance.memory.usedJSHeapSize / 1024)}KB / ${Math.round(window.performance.memory.totalJSHeapSize / 1024)}KB / ${Math.round(window.performance.memory.jsHeapSizeLimit / 1024)}KB (Data: ${Math.round((JSON.stringify($c).length + JSON.stringify($c).length) / 1024)}KB)</p>
					<p>相对时间: ${Math.round(performance.now())}ms</p>

					<br />
					<p>玩家信息: <span title="[x(+left), y(-top), z(未定义), y(偏航角), p(俯仰角)]">PLACE:[${$c.entity[$c.player.id].place}]. NAME:${filter($c.player.name)}, ID:${$c.player.id}, KEY:${$c.player.key}</span></p>
					<p>玩家碰撞队列: [${$t.queue_entity.overlap}]</p>
					<p>实体移动队列: [${$t.queue_entity.move}]</p>
				`;
				// 如果与上一个不同就渲染
				if(geb('F3_info').innerHTML !== $iM){
					geb('F3_info').innerHTML = $iM;
				}
			}
		}

	}

	$c.time.mspt_ui = Date.now() - $funcStartTime;
};



// 数据接收主程序
function main($tp, $serverTime){
	let $funcStartTime = Date.now();

	if($tp.type === 'reg'){ // 注册玩家
		// 将服务器分配的玩家id保存下来
		$c.player.id = $tp.id;
		$c.player.key = $tp.key;
	}else

	if($tp.type === 'info'){ // 显示提示信息
		alert('Server: '+ $tp.info);
	}else

	if($tp.type === 'syncServerData'){ // 与服务器同步数据
		$c.entity = $tp.data.entity;
		//$c.index_entity = $tp.data.index_entity;
		$c.index_entity.type = [];

		// 清空现有实体
		delEntityAll();
		// 遍历实体列表
		for(let key in $c.entity){
			// 创建实体索引
			if($c.index_entity.type[$c.entity[key].type] === undefined){ // 如果实体索引中不存在当前type
				$c.index_entity.type[$c.entity[key].type] = [];
			}
			$c.index_entity.type[$c.entity[key].type].push($c.entity[key].id);
			// 渲染实体
			render_entity($c.entity[key]);

			// 如果是NPC实体
			if($c.entity[key].type === 'npc'){
				// 如果存在 style 参数
				if($c.entity[key]?.style !== undefined){
					// 交给npc渲染器
					main_cope({
						type: 'npc_style',
						trigger_y: 'syncServerData',
						id: $c.entity[key].id,
					})
				}
			}
		}

		// 遍历消息列表
		$tp.data.message.forEach((e) => {
			main({
				type: 'message', type_message: 'old',
				message: e,
			});
		});
		main({
			type: 'message', type_message: 'old',
			message: '--- 以上为历史消息 ---',
		});

		// 启动循环
		_loop('tps', true);
		_loop('player', true);
	}else

	if($tp.type === 'playerMove'){ // 玩家移动
		let $need = false;
		// 判断是不是自己
		if($tp.id === $c.player.id){
			// 判断坐标差异是否大于这一段时间的最大移动距离
			let $_maxRange = ($funcStartTime - $serverTime) / 1000 * (1000 / 20 * 10) + 100; // +100 容错
			//console.log($_maxRange, $c.entity[$c.player.id].place[0] - $tp.place[0]);
			if(Math.abs($c.entity[$c.player.id].place[0] - $tp.place[0]) > $_maxRange
			|| Math.abs($c.entity[$c.player.id].place[1] - $tp.place[1]) > $_maxRange
			|| Math.abs($c.entity[$c.player.id].place[2] - $tp.place[2]) > $_maxRange
			){
				// 应用服务器的坐标
				//$need = true;
			}
		}else{
			$need = true;
		}

		if($need === true){
			// 更新数据
			$c.entity[$tp.id].place = $tp.place;
			// $c.layer.backdrop[0] = $tp.place[0];
			// $c.layer.backdrop[1] = $tp.place[1];
			// 渲染
			update_place_to_player($tp.id);
			// update_place_to_background();
		}
	}else

	if($tp.type === 'playerJoin'){ // 玩家加入
		// 如果客户端没有这个实体
		if(typeof $c.entity[$tp.data.id] !== 'object'){
			// 添加到实体列表
			$c.entity[$tp.data.id] = $tp.data;
			$c.index_entity.type.player.push($tp.data.id);

			// 通过服务器同步数据渲染实体
			render_entity($tp.data);
		}

		// 玩家加入消息
		main({
			type: 'message', type_message: 'old',
			message: 'SERVER > '+ $tp.data.name +'加入了服务器',
		});
	}else

	if($tp.type === 'playerQuit'){ // 玩家退出
		// 玩家退出消息
		main({
			type: 'message', type_message: 'old',
			message: 'SERVER > '+ $c.entity[$tp.id].name +'跑了',
		});

		// 如果客户端有这个实体
		if(typeof $c.entity[$tp.id] === 'object'){
			// 从数据中删除
			delete $c.entity[$tp.id];
			$c.index_entity.type.player.splice($c.index_entity.type.player.indexOf($tp.id), 1);
			// 从缓存中删除
			if($t.queue_entity.move.indexOf($tp.id) !== -1) $t.queue_entity.move.splice($t.queue_entity.move.indexOf($tp.id), 1);
			if($t.queue_entity.overlap.indexOf($tp.id) !== -1) $t.queue_entity.overlap.splice($t.queue_entity.overlap.indexOf($tp.id), 1);
			// 删除dom
			geb('all-player').removeChild(geb($tp.id));
		}
	}else

	if($tp.type === 'message'){ // 渲染一条消息
		if($tp.type_message === 'player'){
			addMessage($c.entity[$tp.id].name +' > '+ $tp.message);
		}else

		if($tp.type_message === 'old'){
			addMessage($tp.message);
		}
	}else

	if($tp.type === 'ping'){ // 处理延迟计算数据包
		// 客户端接收时间 - 客户端发送时间 - (服务器发送时间 - 服务器接收时间)
		$c.time.ping = $funcStartTime - $tp.clientSend - ($serverTime - $tp.serverHave);
		// 渲染 tpsbar
		render_tpsbar($tp.mspt, $c.time.ping);
		// 记录mspt
		$c.time.mspt_server = $tp.mspt;
	}

	// if($tp.type === 'reply-Heartbeat'){ // 心跳
	// 	if($tp.data === 'NO'){
	// 		// 重新连接
	// 		reconnect();
	// 	}
	// }else

	// if($tp.type === 'player-join'){ // 玩家加入
	// 	// 渲染玩家
	// 	geb('all-player').innerHTML += render_player($tp);
	// 	__player_move();
	// 	$c.server.players.push($tp.name);
	// }else

	// if($tp.type === 'mob-produce'){ // 怪物生成
	// 	// 渲染
	// 	geb('all-player').innerHTML += render_mob($tp);
	// 	__player_move();
	// }

	// if($tp.type === 'player-quit'){ // 玩家退出
	// 	geb('all-player').removeChild(geb('player-'+ $tp.id));
	// 	__player_move();
	// 	$c.server.players.splice($c.server.players.indexOf($tp.name), 1)
	// }else

	// if($tp.type === 'Broadcast-message'){ // 广播消息
	// 	// 将消息显示到聊天栏
	// 	addMessage(`${$tp.name} > ${$tp.message}`);
	// }else

	// if($tp.type === 'sync-coordinate'){ // 玩家移动
	// 	geb('player-'+ $tp.id).style.top = $tp.place[0] + 'px';
	// 	geb('player-'+ $tp.id).style.left = $tp.place[1] + 'px';
	// 	geb('player-'+ $tp.id).dataset.direction = $tp.direction;
	// 	__player_move();

	// }else

	// if($tp.type === 'mob-move'){ // 怪物移动
	// 	geb('mob-'+ $tp.id).style.top = $tp.place[0] + 'px';
	// 	geb('mob-'+ $tp.id).style.left = $tp.place[1] + 'px';
	// 	__player_move();

	// }else

	// if($tp.type === 'tpsbar'){ // 同步 Tpsbar
	// 	let $mspt = $tp.mspt;
	// 	let $tps = Math.min(20, 1000/$mspt);
	// 	let $ping = $funcStartTime - $tp.time;

	// 	geb('tpsbar').innerHTML = render_tpsbar($tps, $mspt, $ping);

	// 	$t.server_mspt = $mspt;
	// }else

	// if($tp.type === 'player-attack'){ // 玩家被攻击
	// 	// 显示攻击动效
	// 	let $dom = geb('player-'+ $tp.victim_id);
	// 	$dom.classList.add('-victim');
	// 	setTimeout(function(){
	// 		$dom.classList.remove('-victim');
	// 	}, 200);
	// }else

	// if($tp.type === 'mob-attack'){ // 怪物攻击玩家
	// 	// 显示攻击动效1
	// 	let $dom = geb('player-'+ $tp.victim_id);
	// 	$dom.classList.add('-victim');
	// 	setTimeout(function(){
	// 		$dom.classList.remove('-victim');
	// 	}, 200);
	// }
};

// 数据发送主程序
function main_send($tp){
	let $funcStartTime = Date.now();

	if($tp.type === 'sendMessage'){ // 发送聊天消息
		// 创建消息发送
		$t.queue_net['sendMessage'+ $funcStartTime] = {
			type: 'sendMessage',
			message: geb('message-input').value,
		};
		// 清空输入框
		geb('message-input').value = '';
	}else

	if($tp.type === 'reg'){ // 注册玩家
		$t.queue_net['reg'] = {
			type: 'reg',
			name: $c.player.name,
		};
	}

};

// 事件处理主程序
function _event($a){
	if($a[0] === 'overlap'){ // 玩家碰撞 [name, 状态, id]
		// NPC
		if($c.entity[$a[2]].type === 'npc'){
			main_cope({type: 'npc', id: $a[2], trigger_y: $a});
		}
	}else

	if($a[0] === 'attack'){ // 玩家攻击 [name, id]
		// NPC
		if($c.entity[$a[1]].type === 'npc'){
			main_cope({type: 'npc', id: $a[1], trigger_y: $a});
		}
	}
};

// 数据处理主程序
function main_cope($tp){
	// if($tp.type === 'overlap'){ // 实体碰撞
	// 	// 遍历与自己碰撞的实体
	// 	$tp.data.add.forEach((e) => { // 新增碰撞
	// 		// 异步碰撞处理程序
	// 		main_cope({
	// 			type: '_asyn_overlap',
	// 			id: e,
	// 			overlap: true, // 表示新增碰撞
	// 		});
	// 	});
	// 	$tp.data.del.forEach((e) => { // 碰撞取消
	// 		// 异步碰撞处理程序
	// 		main_cope({
	// 			type: '_asyn_overlap',
	// 			id: e,
	// 			overlap: false, // 表示取消碰撞
	// 		});
	// 	});
	// }else

	// if($tp.type === '_asyn_overlap'){ // 异步碰撞处理程序
	// 	// 判断这个实体是不是npc
	// 	if($c.entity[$tp.id].type === 'npc'){
	// 		// 触发npc
	// 		main_cope({
	// 			type: 'npc',
	// 			id: $tp.id,
	// 			trigger_y: ['overlap', $tp.overlap],
	// 		});
	// 	}
	// }else


	if($tp.type === 'npc'){ // 触发npc
		// 初始化
		if($c.entity[$tp.id]?.__program_queue === undefined){
			$c.entity[$tp.id].__program_queue = {};
		}
		// 遍历NPC程序数组
		for(let key in $c.entity[$tp.id].program){
			// 交给脚本解析器
			main_cope({type: 'npc_func', id: $tp.id, trigger_y: $tp.trigger_y,
				program: $c.entity[$tp.id].program[key],
			});
		}

	}else

	if($tp.type === 'npc_func'){ // 脚本解析器

		if($tp.program.type === 'program'){ // 程序组
			let $e = $tp.program;

			// 将自己注册到父级, 直到结束

			// // NPC子程序组将在其运行周期内占用父程序组, 直至运行结束
			// // NPC父程序组保存当前正在运行的子程序组, 直到子程序组完成再运行自己的下一步
			// // 初始化
			// if($e?.__program_queue === undefined){
			// 	$e.__program_queue = {};
			// }
			// // 判断自己是否被父级保存
			// if($e?.__parent_program !== true){
			// 	// 保存进父级, 并将自己标注为已保存
			// 	$tp.parent_program = $e;
			// 	$e.__parent_program = true;
			// }
			// // 这个程序接下来指向子程序组
			// $e = $tp.parent_program;


			// // 初始化npc独占队列
			// if($c.entity[$tp.id]?.__program_queue === undefined){
			// 	$c.entity[$tp.id].__program_queue = [];
			// }
			// // 判断当前子程序是否在独占队列中
			// if($tp.program?.__join_program_queue !== true){
			// 	// 将当前子程序放进队列, 并添加在队列中的标记
			// 	$c.entity[$tp.id].__program_queue.push($tp.program);
			// 	$tp.program.__join_program_queue = true;
			// }
			// // 将队列最上层的子程序拿出来运行
			// let $e = $c.entity[$tp.id].__program_queue[$c.entity[$tp.id].__program_queue.length - 1];



			let $triggerOK = false;
			let $_trigger_y = $tp.trigger_y;
			// trigger_x
			if($e?.trigger_x === undefined || new Function('return '+ $e.trigger_x)() === true){
				//$triggerOK = true;

				// trigger_y, 支持判断多个事件
				if($e?.trigger_y !== undefined){
					if(Object.prototype.toString.call($e.trigger_y[0]) === '[object Array]'){ // 如果trigger_y里面套了一个trigger_y数组
						$e.trigger_y.forEach((e) => {
							if(triggerOK(e, $tp.trigger_y)){
								$_trigger_y = $tp.trigger_y;
								$triggerOK = true;
								return;
							}
						})
					}else{
						if(triggerOK($e.trigger_y, $tp.trigger_y)){
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
				console.log($e);
				// 初始化程序数据
				if($e?.mode === undefined) $e.mode = ['all'];
				if($e?.__pointer === undefined) $e.__pointer = 0;
				if($e?.loop === undefined) $e.loop = true;

				// 判断运行模式
				if($e.mode[0] === 'all'){ // 运行全部
					for(let key in $e.program){
						// 交给脚本解析器
						let $s = main_cope({type: 'npc_func', id: $tp.id,
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
					let $s = main_cope({type: 'npc_func', id: $tp.id,
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
					// 子程序结束, 将其从NPC独占队列中移除
					// $c.entity[$tp.id].__program_queue.pop();
					// $tp.program.__join_program_queue = false;
					//$tp.parent_program = {};
				}
			}

			return;
		}else
		// 判断这是一个最小化程序组还是独立程序
		if(Object.prototype.toString.call($tp.program) === '[object Array]'){
			// 是程序组, 遍历并将程序交给解析器
			$tp.program.forEach((e) => {
				main_cope({type: 'npc_func', id: $tp.id, trigger_y: $tp.trigger_y,
					program: e,
				});
			});
		}

		// npc_id覆盖
		let $original_id = $tp.id;
		if($tp.program?.sudo_npc_id){
			$tp.id = $tp.program?.sudo_npc_id;
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
					main_cope({
						type: 'npc_func',
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
				let $root = geb($tp.id).getElementsByClassName('top_text')[0];
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
				animationLib(e.id, e.mode);
			});
			// 其他更新
			update_place_to_background();
		}else

		if($tp.program.type === 'decision'){ // 向玩家显示选择框, 并保存结果到 $d.playerDecision
			if($tp.program.mode === true){
				// 启用消息选择组件
				$t.npc_func.decision.enable = true;
				geb('decision').classList.add('-join');
				geb('decision').innerHTML = '';
				// 渲染可选择的消息
				$t.npc_func.decision.id_list = $tp.program.data;
				$tp.program.data.forEach((e) => {
					geb('decision').innerHTML += `
						<p onclick="main_cope({type: 'decision_click', this: this})" data-id="${e.id}">${e.text}</p>
					`;
				});
				// 添加默认选中的消息
				$t.npc_func.decision.pointer = Math.round(($tp.program.data.length - 1) / 2);
				geb('decision').querySelectorAll('p')[$t.npc_func.decision.pointer].click();
			}else{
				// 获取玩家选择的消息id
				$t.npc_func.decision.id = geb('decision').getElementsByClassName('-join')[0].dataset.id;
				// 关闭消息选择组件
				$t.npc_func.decision.enable = false;
				geb('decision').classList.remove('-join');
			}
		}

		if($tp.program.type === 'js'){ // 运行js代码
			new Function('$tp', $tp.program.code)($tp);
		}

	}else
	// 脚本解析器 END

	if($tp.type === 'npc_style'){ // npc样式
		// 遍历npc样式
		$c.entity[$tp.id].style.forEach((e) => {
			if(e.type === 'addDom'){ // 添加dom
				geb($tp.id).innerHTML += e.dom;
			}
		});
	}else

	if($tp.type === 'decision_click'){ // 玩家点击选择消息 [type, this]
		// 取消上一个的选中样式
		if(geb('decision').getElementsByClassName('-join').length > 0){
			geb('decision').getElementsByClassName('-join')[0].classList.remove('-join');
		}
		// 获取这个消息的数据
		$t.npc_func.decision.id = $tp.this.dataset.id;
		// 添加选中样式
		$tp.this.classList.add('-join');
	}


};


// 窗口尺寸变化事件
window.addEventListener('resize', function(){
	$t.window.reRenderForWindowSize = true;
});


// 键盘按下事件
// onkeydown = 连续按下, onkeyup = 松开
document.onkeydown = function (event){
	event = event || window.event;
	// console.log("按钮按下", event);

	if(event.code === 'Tab'){
		// 显示玩家名称和数量
		let $iM = '';
		// 遍历实体索引
		for(let key in $c.index_entity.type){
			// 添加实体类型
			$iM += '<p class="title" title="实体类型">'+ key +': </p>';
			// 遍历此类型的实体
			$c.index_entity.type[key].forEach((e) => {
				// 添加实体名称
				$iM += '<p class="main" title="id='+ e +'">'+ filter($c.entity[e].name) +'</p>';
			});
		}
		// 渲染消息
		geb('key-tab').innerHTML = $iM;
		geb('key-tab').style.display = 'block';

		return false;
	}else

	// 屏蔽F3
	if(event.code === 'F3'){
		event.preventDefault();
	}

	// 4个方向键
	if(['KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(event.code) !== -1){
		if($t.message.enable === true) return;
		$t.WASD.keyboard[event.code] = true;
		$t.WASD.enable = true;
	}


};
document.onkeyup = function (event){
	event = event || window.event;
	// console.log("按钮按下", event);

	// ESC
	if(event.code === 'Escape'){
		if($t.message.enable === true){
			openMessageDom(false);
		}
	}else

	// 在线玩家显示
	if(event.code === 'Tab'){
		geb('key-tab').style.display = 'none';
	}else

	// F3 调试界面
	if(event.code === 'F3'){
		$t.F3.enable = ($t.F3.enable === true)? false : true;
		geb('F3').style.display = ($t.F3.enable === true)? 'block' : 'none';
		if($t.F3.enable === true){geb('all-player').classList.add('-debug')}else{geb('all-player').classList.remove('-debug')}
	}else

	// 聊天组件
	if(event.code === 'KeyT'){
		openMessageDom(true);
	}else


	// 4个方向键, 移动
	if(['KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(event.code) !== -1){
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
			main_cope({
				type: 'decision_click',
				this: geb('decision').querySelectorAll('p')[$t.npc_func.decision.pointer]
			})
		}
	}else

	// 回车和空格, 攻击
	if(event.code === 'Enter' || event.code === 'Space'){
		// 前置不兼容
		if($t.message.enable === true) return;
		// 创建攻击任务
		$t.queue_entity.attack = true;
	}
};
// 窗口失去焦点
window.onblur = function (){
	// 恢复所有按键
	['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach((e) => {
		$t.WASD.keyboard[e] = false;
	});
	$t.WASD.enable = false;
};
