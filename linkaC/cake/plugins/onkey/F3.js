
// 初始化
$t.plugins.F3 = {
	enable: false,	// 启动
	suspend: false,	// 暂停功能
	loop_id: null,
	loop_func: async function (){
		// 是否暂停
		if($t.plugins.F3.suspend === false){
			// 渲染调试信息
			lib.geb('F3_info').innerHTML = `
				<p title="[宽, 高]">视窗尺寸: [${[document.documentElement.clientWidth, document.documentElement.clientHeight]}]</p>

				<br />
				<p>MSPT: UI:${$c.time.mspt_ui}/${$c.loop.ui_time}, MAIN:${$c.time.mspt_tps}/${$c.loop.tps_time}. SERVER:${$c.time.mspt_server} (ms)</p>
				<p>DOM数量: ${document.querySelectorAll('*').length}</p>
				<p>内存占用: ${Math.round(window.performance.memory.usedJSHeapSize / 1048576)}MB / ${Math.round(window.performance.memory.totalJSHeapSize / 1048576)}MB</p>
				<p>数据大小: $c: ${Math.round(JSON.stringify($c).length / 1024)}KB, $t: ${Math.round(JSON.stringify($t).length / 1024)}KB (不包括Func等对象)</p>
				<p>相对时间: ${Math.round(performance.now())}ms</p>

				<br />
				<p>玩家信息: <span title="[x(+left), y(-top), z(未定义), y(偏航角), p(俯仰角)]">ID:'${$c.player.id}', PLACE:[${$c.entity[$c.player.id].place}]</span></p>
				<p>实体碰撞队列: [${$t.queue.overlap}]</p>
				<p>实体移动队列: [${$t.queue.move}]</p>
			`;
		}
	},
};


// 添加dom
(function (){
	let $dom = document.createElement('div');
		$dom.setAttribute('id', 'F3');
		$dom.setAttribute('class', '--user_select');
		$dom.innerHTML = `
			<!-- 功能键 -->
			<p>
				<span onclick="$t.plugins.F3.suspend = !$t.plugins.F3.suspend;">[暂停]</span>
			</p>

			<hr />
			<div id="F3_info"></div>
		`;
	lib.geb('main').appendChild($dom);
})();


// F3启动时创建循环, 关闭是注销循环
$e.system.on('onkeyup.F3', () => {
	$t.plugins.F3.enable = !$t.plugins.F3.enable;
	if($t.plugins.F3.enable === true){
		$t.plugins.F3.loop_func();
		// 样式
		lib.geb('F3').style.display = 'block';
		lib.geb('all-player').classList.add('-debug');
		lib.geb('background').classList.add('-debug');
		// 创建循环
		$t.plugins.F3.loop_id = setInterval($t.plugins.F3.loop_func, 115);
	}else{
		// 样式
		lib.geb('F3').style.display = 'none';
		lib.geb('all-player').classList.remove('-debug');
		lib.geb('background').classList.remove('-debug');
		// 注销循环
		clearInterval($t.plugins.F3.loop_id);
	}
});


// 取消默认功能键
$e.system.on('onkeydown.F3', (event) => {
	// 取消按键的默认操作
	event?.preventDefault();
});
