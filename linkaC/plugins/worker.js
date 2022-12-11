// 全局变量
let $c = {
	net: {
		interval_id: null,
		lastSend: 0,
	},
	loop: { // 循环指标 and 循环本体
		_net_time: 62,
		_net: null,
	},
	player: { // 用户数据
		id: '',
		key: '',
		name: '',
	},
};
let $t = {
	queue_net: {},	// 网络io队列
};
let $ws = null;

// 通讯
onmessage = function($data){
	let $tp = $data.data;
	//console.log($tp);

	if($tp.type === 'start_ws'){ // 初始化ws
		start_ws();
	}else

	if($tp.type === 'ws_send'){ // 发送消息
		$ws.send(JSON.stringify($tp.data));
	}else

	if($tp.type === 'net_loop'){ // 启动或停止网络io循环
		if($tp.mode === true){
			$c.loop._net = setInterval(net_loop, $c.loop._net_time);
		}else{
			clearInterval($c.loop._net);
		}
	}else

	if($tp.type === 'queue_net'){ // 将数据包添加到网络IO队列
		$t.queue_net[$tp.key] = $tp.data;
	}else

	if($tp.type === 'add_$c.player'){ // 添加用户数据
		$c.player = $tp.data
	}else

	if($tp.type === 'cc'){ // 测试
		new Function($tp.func)();
	}
};

// ws
function start_ws(){
	console.log('[/] ws.开始连接...');
	$ws = new WebSocket('wss://ipacel.cc/websocket/');

	// 已建立连接
	$ws.onopen = function(e){
		console.log('[/] ws.连接成功');
		postMessage({type: 'ws.onopen'});
	};

	// 收到消息
	$ws.onmessage = function(e){
		let $tp = JSON.parse(e.data);
		postMessage({type: 'ws.onmessage', data: $tp});
	};

	// 已断开连接
	$ws.onclose = function (){
		postMessage({type: 'ws.onclose'});

		// 注销ws
		$ws.close();
		console.log('[/] ws.连接已断开, 4秒后重试');
		setTimeout(start_ws, 4000);
	};
};

// 网络io循环
function net_loop(){
	let $funcStartTime = Date.now();

	// 发送心跳包
	if($c.net.lastSend < $funcStartTime - 20 * 1000){
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
		$ws.send(JSON.stringify({
			id: $c.player.id,
			key: $c.player.key,
			time: $funcStartTime,
			data: $arr,
		}));
		$c.net.lastSend = $funcStartTime;
	}
};


function cc_自动移动(){
	let $p = [0, 0, 0, 0, 0];
	let $i = true;
	// 定时取反
	setInterval(function(){
		$i = !$i;
	}, 1000);
	// 创建数据
	setInterval(function(){
		if($i){
			$p[0] += 20;
		}else{
			$p[0] -= 20;
		}

		$t.queue_net['WASD'] = {
			type: "playerMove",
			place: $p,
		}
	}, 62);
};

// 启动完成
postMessage({type: 'worker_ok'});
