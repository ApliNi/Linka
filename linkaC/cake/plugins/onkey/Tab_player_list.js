
// 显示玩家列表
$t.plugins.player_list = {
	enable: false,	// 启动
	loop_id: null,
	func: async function (){
		// 显示玩家名称和数量
		let $iM = '<p class="title">玩家列表</p>';
		// 遍历实体索引
		$c.index_entity.type.player.forEach((e) => {
			// 添加实体名称
			$iM += '<p class="main" title="id='+ e +'">'+ lib.filter($c.entity[e].name) +'</p>';
		});
		// 渲染消息
		lib.geb('key-tab').innerHTML = $iM;
	},
};


// 添加dom
(function (){
	let $dom = document.createElement('div');
		$dom.setAttribute('id', 'key-tab');
		$dom.setAttribute('class', '--user_select');
		$dom.innerHTML = '';
	lib.geb('main').appendChild($dom);
})();


// 按下
$e.system.on('onkeydown.Tab', (event) => {
	event?.preventDefault();
	if($t.plugins.player_list.enable === false){
		$t.plugins.player_list.enable = true;
		$t.plugins.player_list.func();
		lib.geb('key-tab').style.display = 'block';
		$t.plugins.player_list.loop_id = setInterval($t.plugins.player_list.func, 300);
	}
});

// 松开
$e.system.on('onkeyup.Tab', () => {
	$t.plugins.player_list.enable = false;
	lib.geb('key-tab').style.display = 'none';
	clearInterval($t.plugins.player_list.loop_id);
});


