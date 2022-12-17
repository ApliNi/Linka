// 全局变量
let $c = {
	net: {
		last_send: 0,		// 最后发送消息的时间
		last_receive: 0,	// 最后收到消息的时间
	},
	loop: { // 循环指标 and 循环本体
		_net_time: 62,
		_net: null,
	},
	player: { // 用户通讯基础数据
		id: '',
		key: '',
		name: '',
	},
	queue_net: {},	// 网络io队列
};
let $ws = null;


// 网络io循环
function net_loop(){
	let $loopStartTime = Date.now();

	// ping数据包, 代替心跳包
	if($c.net.last_send < $loopStartTime - 1700){
		$c.queue_net['ping'] = {
			type: 'ping',
		};
	}

	// 处理网络io队列
	let $arr = [];
	// 遍历网络io队列
	for(let key in $c.queue_net){
		$arr.push($c.queue_net[key]);
		delete $c.queue_net[key];
	}
	// 如果数据不为空则发送
	if($arr.length > 0){
		$ws.send(JSON.stringify({
			id: $c.player.id,
			key: $c.player.key,
			time: $loopStartTime,
			data: $arr,
		}));
		$c.net.last_send = $loopStartTime;
	}
};


// function cc_自动移动(){
// 	let $p = [0, 0, 0, 0, 0];
// 	let $i = true;
// 	// 定时取反
// 	setInterval(function(){
// 		$i = !$i;
// 	}, 1000);
// 	// 创建数据
// 	setInterval(function(){
// 		if($i){
// 			$p[0] += 20;
// 		}else{
// 			$p[0] -= 20;
// 		}

// 		$c.queue_net['WASD'] = {
// 			type: "playerMove",
// 			place: $p,
// 		}
// 	}, 62);
// };

// 启动ws
function start_ws(){
	$ws = new WebSocket('wss://ipacel.cc/websocket/');

	// 已建立连接
	$ws.onopen = function(e){
		postMessage({type: 'ws.onopen'});
		// 启动网络循环
		$c.loop._net = setInterval(net_loop, $c.loop._net_time);
	};

	// 收到消息
	$ws.onmessage = function(e){
		let $tp = JSON.parse(e.data);
		// postMessage({type: 'ws.onmessage', data: JSON.parse(e.data)});
		// 更新最后收到消息的时间
		$c.net.last_receive = performance.now();
		// 遍历数据数组
		$tp.data.forEach((e) => {
			// 这一部分的数据将通过事件发给各个对应的处理模块
			postMessage({
				type: 'ws.onm',
				type2: e.type,	// 数据包名称
				serverSendTime: $tp.time,
				data: e,		// 数据包本体
			});
		});
	};

	// 已断开连接
	$ws.onclose = function (){
		postMessage({type: 'ws.onclose'});

		// 停止网络循环, 注销ws
		clearInterval($c.loop._net);
		$ws.close();
		$ws = null;

		// 掉线重连
		console.log('[WebSocket] WebSocket 连接已断开, 4秒后重新连接');
		setTimeout(start_ws, 4000);
	};
};


// 程序与worker通讯
onmessage = function ($data){
	let $tp = $data.data;


	// 将数据包添加到网络队列
	if($tp.type === 'netQueue'){
		// 覆盖已有数据包
		if($tp.mode === true){
			$c.queue_net[$tp.id] = $tp.data;
		}else

		// 保留已有的数据包
		if($tp.mode === false && $c.queue_net[$tp.id] === undefined){
			$c.queue_net[$tp.id] = $tp.data;
		}
	}else

	// 发送数据
	if($tp.type === 'ws_send'){
		$ws.send(JSON.stringify($tp.data));
	}else

	// 添加用户通讯数据
	if($tp.type === 'add_$player'){
		$c.player = $tp.data
	}else

	// 启动ws
	if($tp.type === 'start_ws'){
		start_ws();
	}
};

// 启动完成
postMessage({type: 'worker_on'});
