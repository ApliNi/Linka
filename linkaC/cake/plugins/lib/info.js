// 信息显示


(function (){
	// 创建dom
	let $0 = document.createElement('div');
		$0.setAttribute('id', '_info_actionBar');
		$0.innerHTML = '<span>信息显示dom</span>';
	lib.geb('main').appendChild($0);
})();


// lib
infoLib = {
	_data: {},
};


// 操作栏
infoLib._data.actionBar = {
	TimeoutID: null,
}
infoLib.actionBar = async function ($html, $time = 3000){
	let $_d = infoLib._data.actionBar;

	// 修改当前消息
	lib.geb('_info_actionBar').innerHTML = $html;
	lib.geb('_info_actionBar').classList.add('-open');

	// 如果有一个定时器: 将其注销
	if($_d.TimeoutID !== null){
		clearTimeout($_d.TimeoutID);
	}

	$_d.TimeoutID = setTimeout(function (){
		lib.geb('_info_actionBar').classList.remove('-open');
	}, $time);
};
