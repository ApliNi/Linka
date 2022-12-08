// 全局变量
let $c = {
	net: {
		interval_id: null,
		lastSend: 0,

	},
};
let $t = {};
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
	}

	// if($tp.type === 'start_net_loop'){ // 启动网络io循环
	// 	setInterval(_loop_net, $c.loop._net_time)
	// }
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
// function net_loop(){
// 	let $funcStartTime = Date.now();

// 	// 发送心跳包
// 	if($c.net.lastSend < $funcStartTime - 20 * 1000){
// 		$t.queue_net['heartbeat'] = {
// 			type: 'heartbeat',
// 		};
// 	}

// 	// 已超时


// 	// 处理网络io队列
// 	let $arr = [];
// 	// 遍历网络io队列
// 	for(let key in $t.queue_net){
// 		$arr.push($t.queue_net[key]);
// 		delete $t.queue_net[key];
// 	}
// 	// 如果数据不为空则发送
// 	if($arr.length > 0){
// 		// $w.postMessage({type: 'ws_send', data: {
// 		// 	id: $c.player.id,
// 		// 	key: $c.player.key,
// 		// 	time: $funcStartTime,
// 		// 	data: $arr,
// 		// }});
// 		$ws.send(JSON.stringify({
// 			id: $c.player.id,
// 			key: $c.player.key,
// 			time: $funcStartTime,
// 			data: $arr,
// 		}));
// 		$c.net.lastSend = $funcStartTime;
// 	}
// };


// 启动完成
postMessage({type: 'worker_ok'});
