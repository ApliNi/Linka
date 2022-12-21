// 功能库
lib = {};


//常用的获取div
lib.geb = function ($i){return document.getElementById($i)};


// 是否为移动端
lib.isPE = function (){return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false;}


//获取url参数
lib.fromUrl = function ($name){
	let $i = window.location.search.substring(1).match(new RegExp('(^|&)'+ $name +'=([^&]*)(&|$)', 'i'));
	return $i ? decodeURIComponent($i[2]) : '';
};


// 转义html标签的特殊字符
lib.filter = function ($i){return String($i).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')};


// 渲染 Tpsbar
lib.render_tpsbar = async function ($mspt, $ping){
	// tps
	let $tps = Math.round(1000 / Math.max($c.loop.tps_time, $mspt));
	// 进度条, 百分比
	let $a = $mspt / $c.loop.tps_time * 100;

	let $dom = lib.geb('tpsbar').style;
	$dom.setProperty('--tpsbar_tps', $tps);
	$dom.setProperty('--tpsbar_mspt', $mspt);
	$dom.setProperty('--tpsbar_ping', $ping);
	$dom.setProperty('--tpsbar_width', $a +'%');
};


// 渲染实体
lib.render_entity = async function ($tp){

	// 创建实体主dom
	let $dom = document.createElement('div');
		$dom.setAttribute('id', $tp.id);
		$dom.setAttribute('class', ($tp.id === $c.player.id)? 'entity my' : 'entity');
		$dom.setAttribute('data-type', $tp.type);

	// 偏航角dom
	let $dom2 = document.createElement('div');
		$dom2.setAttribute('class', 'debug yawAngle');
	$dom.appendChild($dom2);

	// 攻击范围dom
	$dom2 = document.createElement('div');
		$dom2.setAttribute('class', 'debug attackRange');
	$dom.appendChild($dom2);

	// 消息dom
	$dom2 = document.createElement('div');
		$dom2.setAttribute('class', 'top_text');

	// 往消息dom中插入名称
	let $dom3 = document.createElement('span');
		$dom3.setAttribute('class', 'name');
		$dom3.innerText = $tp.name; // filter()

	// 往名称dom中插入头像
	// let $dom4 = document.createElement('div');
	// 	$dom4.setAttribute('class', 'img');
	// 	// $dom4.setAttribute('src', 'https://ipacel.cc/api/skin/'+ filter($tp.name) +'.png');
	// 	// $dom4.setAttribute('onerror', 'this.style.display = "none"');
	// 	$dom4.style.backgroundImage = 'url(https://ipacel.cc/api/skin/'+ filter($tp.name) +'.png';
	// $dom3.appendChild($dom4);

	$dom2.appendChild($dom3);

	// 插入聊天气泡框
	// $dom3 = document.createElement('span');
	// 	$dom3.setAttribute('class', 'message -quit');
	// $dom2.appendChild($dom3);

	$dom.appendChild($dom2);

	// 渲染到实体层
	lib.geb('all-player').appendChild($dom);

	// 更新坐标
	lib.update_place_to_player($tp.id);
};


// 更新玩家的坐标
lib.update_place_to_player = async function ($entity = ''){
	// 注意!!! css的top是反方向的y轴, 赋值时使用 0-y 即可
	// 注意!!! .debug.yawAngle偏航角的角度需要 -90, 因为dom是歪的

	let $id = ($entity === '')? $c.player.id : $entity;
	if($id === '') return false;

	let $xy = [
		$c.entity[$id].place[0],
		0 - $c.entity[$id].place[1],
	];

	lib.geb($id).style.left = $xy[0] + 'px';
	lib.geb($id).style.top = $xy[1] + 'px';
	lib.geb($id).getElementsByClassName('debug yawAngle')[0].style.transform = 'rotate('+ ($c.entity[$id].place[3] - 90) +'deg)';

	// 添加到实体移动队列
	if($t.queue.move.indexOf($id) === -1){
		$t.queue.move.push($id);
	}

	return true;
};


// 更新需要缩放的层的缩放中心
lib.update_place_to_transformOrigin = async function (){
	let $xy = [
		$c.entity[$c.player.id].place[0],
		0 - $c.entity[$c.player.id].place[1],
	];
	// 将背景层和玩家层的缩放中心调整到玩家位置
	lib.geb('all-player').style.transformOrigin = $xy[0] +'px '+ $xy[1] +'px';
	lib.geb('background').style.transformOrigin = $xy[0] +'px '+ $xy[1] +'px';
};


// 更新背景的坐标
lib.update_place_to_background = async function (){
	// 注意!!! css的top是反方向的y轴, 赋值时使用 0-y 即可

	let $xy = [
		(document.documentElement.clientWidth / 2 + (0 - $c.entity[$c.player.id]?.place[0] || 0)) + 'px',
		0 - (0 - document.documentElement.clientHeight / 2 + (0 - $c.entity[$c.player.id]?.place[1] || 0)) + 'px',
	];

	lib.geb('all-player').style.left = $xy[0];
	lib.geb('all-player').style.top = $xy[1];
	lib.geb('background').style.left = $xy[0];
	lib.geb('background').style.top = $xy[1];
};


// 判断一个坐标是否在一个矩形范围内, (矩形中心坐标, 矩形半径, 判断的坐标)
lib.isOverlap = function (p1, d, p2){
	if(p1[0] + d > p2[0]
	&& p2[0] + d > p1[0]
	&& p1[1] + d > p2[1]
	&& p2[1] + d > p1[1]
	) return true; // 重叠
	return false;
};

// 显示消息到聊天框
// $m1 = 不需要特殊处理的消息, 比如玩家名/消息前缀; $m2 = 消息内容
lib.addMessage = async function ($m1, $m2, $tp){
	$tp = {
		class: $tp.class || 'new',
		playerID: $tp.playerID || '',
		notification: $tp.notification || false,
	}

	// 删除一条旧消息, 如果有的话
	let $dom = lib.geb('message-list').getElementsByTagName('p');
	for(let key = 0; $dom.length >= 256; key++){ // 删除256条之前的
		$dom[key].remove();
	}
	$dom = null;

	// 解析消息中的特殊文本
	$m2 = lib.filter($m2);
	$m1 = lib.filter($m1);
	$m2 = $m2
		// 图片 `![描述](url)` // loading="lazy"
		.replace(/\!\[([^\]])?\]\((https?\:\/\/[0-9a-zA-Z](?:[-.\w]*[0-9a-zA-Z])*(?:\:(?:0-9)*)*(?:\/?)(?:[a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_\=]*))\s?(?:\s+\"([^\"])\")?\)/gi, '<img alt="$1" decoding="async" loading="lazy" src="$2" title="$3" />')
		// URL
		.replace(/(\<[^\>]+)?(https?\:\/\/[0-9a-zA-Z](?:[-.\w]*[0-9a-zA-Z])*(?:\:(?:0-9)*)*(?:\/?)(?:[a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_\=]*)?)([^\<]+\>)?/gi, ($0, $1, $2, $3) => {
			if($1 === undefined && $3 === undefined){
				return '<a href="'+ $2 +'" target="_blank" rel="noopener noreferrer">'+ $2 +'</a>';
			}else{
				return $0;
			}
		})
		// 反斜杠转义字符
		.replace(/\\(.{1})/gi, '$1')
	;

	// 通过domApi验证消息, 是否包含危险的标签 (防止正则注入)
	// !! 还需要防止危险的html事件属性... 可能会使用第三方库解决
	// !! 需要判断消息来自客户端还是服务器, 否则影响扩展性
	let $0 = document.createElement('span');
		$0.setAttribute('class', 'm2');
		$0.innerHTML = $m2;
	if($0.querySelectorAll(':not(img, a)').length !== 0){
		console.log('危险的消息:', $m2);
		$m2 = '!这条消息可能存在危险, 客户端不允许进行渲染, 请在控制台中查看';
		$tp.class += ' error';
	}
	$0 = null;

	// 创建消息dom
	let $p = document.createElement('p');
		$p.setAttribute('class', $tp.class);
		$p.innerHTML = `<span class="m1"><span class="name">${$m1}</span></span><span class="m2">${$m2}</span>`;
	lib.geb('message-list').appendChild($p);

	// 消息也在玩家名称上方显示
	// if($tp.playerID !== ''){
	// 	// 获取指定玩家的气泡框
	// 	let $dom = lib.geb($tp.playerID).querySelector('.top_text > span.message');
	// 	// 如果气泡框已经打开
	// 	if($dom.classList.contains('-quit') === false){
	// 		// 关闭后填充消息再重新打开
	// 		$dom.classList.add('-quit');
	// 		setTimeout(function(){ // 延迟显示新消息
	// 			$dom.innerHTML = `<span class="m2">${$m2}</span>`;
	// 			$dom.classList.remove('-quit');
	// 		}, 100);
	// 	}else{
	// 		$dom.innerHTML = `<span class="m2">${$m2}</span>`;
	// 		$dom.classList.remove('-quit');
	// 	}
	// 	setTimeout(function(){
	// 		$dom.classList.add('-quit');
	// 	}, 4000);
	// }

	// 桌面通知
	if($tp.notification === true){
		lib.desktopNotification($m1, $m2);
	}
};


// 动效库
lib.animationLib = async function ($id, $m){
	if($id === '主体放大'){
		// 遍历指定class的元素
		Array.prototype.forEach.call(lib.geb('main').getElementsByClassName('moveFollowLayer'), (e) => {
			e.classList.add('_animationLib_default');
			if($m === true){
				e.classList.add('_animationLib_主体放大');
			}else{
				e.classList.remove('_animationLib_主体放大');
			}
		});
	}else

	if($id === '上下黑边'){
		lib.geb('_window').classList.add('_animationLib_default');
		if($m === true){
			lib.geb('_window').classList.add('_animationLib_上下黑边');
		}else{
			lib.geb('_window').classList.remove('_animationLib_上下黑边');
		}
	}
};


// 判断指定数组2是否包含数组1
lib.triggerOK = function ($arr1, $arr2){
	if($arr2.join().indexOf($arr1.join()) === 0){
		return true;
	}
	return false;
};


// btnStyleSwitch 按钮样式切换, 添加或删除 -open 标签
lib.btnSS = function ($this){
	if($this.classList.contains('-open')){
		$this.classList.remove('-open');
		return false;
	}else{
		$this.classList.add('-open');
		return true;
	}
};


// 将数据包放入网络队列, $cover=true: 覆盖重复的数据, false: 保留旧数据
lib.netQueue = function ($id, $data, $mode = true){
	$w.net.postMessage({
		type: 'netQueue',
		mode: $mode,
		id: $id,
		data: $data,
	});
};


//创建桌面通知
lib.desktopNotification = async function ($title, $message, $clear = true){
	Notification.requestPermission(($p) => { // 权限
		if($p === 'granted'){
			//弹出通知 //全局变量
			let $id = new Notification($title, {
				lang: 'zh-cmn-Hans',
				icon: 'img/server-icon.png',
				timestamp: Math.floor(Date.now()),
				tag: 112, //通知标记 用于覆盖通知
				silent: true, // 通知静音
				body: $message,
			});
			// $clear = false 时不清除消息
			if($clear) setTimeout(function(){$id.close()}, 10000);
		}
	});
};


// 将不可正常转换为json字符串的对象字符串转换为对象
// 如果是函数就转换为['标识', '函数字符串']
lib.toFunction = function ($arr){
	// 函数
	if($arr[0] === 'LINKA_FUNC'){
		return new Function('return '+ $arr[1])();
	}
	return null;
};

