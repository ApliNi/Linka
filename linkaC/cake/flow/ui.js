
// 页面加载完成
$e.system.on('window.onload', () => {
	// 更新背景的坐标
	lib.update_place_to_background();
	// 结束加载动画 or 显示页面
	lib.geb('main').style.opacity = '1';
});


// 注册成功
$e.player.on('login_ok', () => {
	console.log('[注册] 登录成功');
	// 请求桌面通知权限
	if(Notification.permission !== 'granted') lib.desktopNotification('消息通知', '当页面后台运行时, 您将在这里收到聊天消息');
});

