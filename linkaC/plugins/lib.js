// lib全局变量
let $lib_c = {
	// 正在重新加载
	reconnecting: false,
}

//常用的获取div
function geb($i){return document.getElementById($i)};

//获取url参数
function fromUrl($name){
	let $i = window.location.search.substring(1).match(new RegExp('(^|&)'+ $name +'=([^&]*)(&|$)', 'i'));
	return $i ? decodeURIComponent($i[2]) : '';
};

// 转义html标签的特殊字符
function filter($i){return String($i).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')};

// 获取网页宽高
function getClientWidthHeight(){
	return [
		document.documentElement.clientWidth,
		document.documentElement.clientHeight,
	];
	//return [0, 0];
};

// 渲染 Tpsbar
function render_tpsbar($mspt, $ping){
	// tps
	let $tps = Math.round(1000 / Math.max($c.loop._tps_time, $mspt));
	// 进度条, 百分比
	let $a = $mspt / $c.loop._tps_time * 100;

	geb('tpsbar').innerHTML = `
		<p>TPS: ${$tps}&nbsp;&nbsp; MSPT: ${$mspt}&nbsp;&nbsp; PING: ${$ping}ms</p>
		<div>
			<div class="a" style="max-width: ${$a}%"></div>
		</div>
	`;
};

// 通过服务器同步数据创建实体dom
function render_entity($tp){

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

	// 内容dom
	$dom2 = document.createElement('div');
		$dom2.setAttribute('class', 'top_text');

	// 往内容dom中插入名称
	let $dom3 = document.createElement('span');
		$dom3.setAttribute('class', 'name -join');
		$dom3.innerText = $tp.name; // filter()

	$dom2.appendChild($dom3);
	$dom.appendChild($dom2);

	// 渲染到实体层
	geb('all-player').appendChild($dom);

	// 更新坐标
	update_place_to_player($tp.id);
};

// 更新玩家的坐标
function update_place_to_player($entity = ''){
	// 注意!!! css的top是反方向的y轴, 赋值时使用 0-y 即可
	// 注意!!! .debug.yawAngle偏航角的角度需要 -90, 因为dom是歪的

	let $id = ($entity === '')? $c.player.id : $entity;
	if($id === '') return false;

	let $xy = [
		$c.entity[$id].place[0],
		0 - $c.entity[$id].place[1],
	];

	geb($id).style.left = $xy[0] + 'px';
	geb($id).style.top = $xy[1] + 'px';
	geb($id).getElementsByClassName('debug yawAngle')[0].style.transform = 'rotate('+ ($c.entity[$id].place[3] - 90) +'deg)';

	// 添加到实体移动队列
	if($t.queue_entity.move.indexOf($id) === -1){
		$t.queue_entity.move.push($id);
	}

	return true;
};

// 更新需要缩放的层的缩放中心
function update_place_to_transformOrigin(){
	let $xy = [
		$c.entity[$c.player.id].place[0],
		0 - $c.entity[$c.player.id].place[1],
	];
	// 将背景层和玩家层的缩放中心调整到玩家位置
	geb('all-player').style.transformOrigin = $xy[0] +'px '+ $xy[1] +'px';
	geb('background').style.transformOrigin = $xy[0] +'px '+ $xy[1] +'px';
};

// 更新背景的坐标
function update_place_to_background(){
	// 注意!!! css的top是反方向的y轴, 赋值时使用 0-y 即可

	let $xy = [
		(getClientWidthHeight()[0] / 2 + (0 - $c.entity[$c.player.id]?.place[0] || 0)) + 'px',
		0 - (0 - getClientWidthHeight()[1] / 2 + (0 - $c.entity[$c.player.id]?.place[1] || 0)) + 'px',
	];

	geb('all-player').style.left = $xy[0];
	geb('all-player').style.top = $xy[1];
	geb('background').style.left = $xy[0];
	geb('background').style.top = $xy[1];
};

// 清空实体
function delEntityAll(){
	geb('all-player').innerHTML = '';
};


// 对比两个矩形实体是否重叠, inp(矩形中心坐标, [39, 39], 攻击范围直径)
// 判断一个坐标是否在一个矩形范围内, (矩形中心坐标, 矩形半径, 判断的坐标)
function isOverlap(p1, d, p2){
	if(p1[0] + d > p2[0]
	&& p2[0] + d > p1[0]
	&& p1[1] + d > p2[1]
	&& p2[1] + d > p1[1]
	) return true; // 重叠
	return false;
};

// 显示消息到聊天框
function addMessage($m){
	let $p = document.createElement('p');
		$p.setAttribute('class', 'new');
		$p.innerText = $m; // filter()
	geb('message-list').appendChild($p);
};

// 打开或关闭聊天组件
function openMessageDom($mode){
	if($mode === true){
		$t.message.enable = true;
		geb('message-list').classList.add('-open');
		geb('message-input').style.display = 'block';
		geb('message-input').focus();
	}else{
		$t.message.enable = false;
		geb('message-list').classList.remove('-open');
		geb('message-input').style.display = 'none';
	}
};

// 动效库
function animationLib($id, $m){
	if($id === '主体放大'){
		// 遍历指定class的元素
		Array.prototype.forEach.call(geb('main').getElementsByClassName('moveFollowLayer'), (e) => {
			e.classList.add('_animationLib_default');
			if($m === true){
				e.classList.add('_animationLib_主体放大');
			}else{
				e.classList.remove('_animationLib_主体放大');
			}
		});
	}else

	if($id === '上下黑边'){
		geb('_window').classList.add('_animationLib_default');
		if($m === true){
			geb('_window').classList.add('_animationLib_上下黑边');
		}else{
			geb('_window').classList.remove('_animationLib_上下黑边');
		}
	}
};

// 判断指定数组2是否包含数组1
function triggerOK($arr1, $arr2){
	if($arr2.join().indexOf($arr1.join()) === 0){
		return true;
	}
	return false;
};

// 向玩家展示选择框, 回调选择的内容

