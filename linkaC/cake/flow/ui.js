
// 页面加载完成
$e.system.on('window.onload', () => {
	// 更新背景的坐标
	lib.update_place_to_background();
	// 结束加载动画 or 显示页面
	lib.geb('main').style.opacity = '1';
});
