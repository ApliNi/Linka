
// 初始化锁
$t.plugins.update_place_to_background_ing = false;

// 重新渲染场景和玩家位置
$e.system.on('window.resize', () => {
	if($t.plugins.update_place_to_background_ing === false){
		$t.plugins.update_place_to_background_ing = true;
		// 100ms后释放锁
		setTimeout(function(){
			$t.plugins.update_place_to_background_ing = false;
			lib.update_place_to_background();
		}, 100);
		// 重新渲染
		lib.update_place_to_background();
	}
});
