
// NPC-v2 Lib
npcLib = {
	// 运行库版本号, 整数
	_version: 1,

	// npc插件
	plugins: {},

	// data
	_data: {},
};


// 显示消息
npcLib.text = {};

// 显示消息, 在名称上方, 同时只能容纳一条消息
// $npcID		// NPC id
// $text	// 要显示的消息, 为 undefined 时跳过消息修改
// $mode = auto		// 自动处理消息显示, 如果有消息则先关闭然后延迟显示
// $mode = true		// 显示并修改一条消息
// $mode = false	// 收起一条消息
npcLib.text.nameTop = async function ($npcID, $text, $mode = 'auto'){
	// 检查并创建消息 dom
	let $root = lib.geb($npcID).getElementsByClassName('top_text')[0];
	if($root.getElementsByClassName('func_text_nameTop').length < 1){
		// 创建消息显示dom
		let $dom = document.createElement('span');
			$dom.setAttribute('class', '-quit func_text_nameTop');
		$root.appendChild($dom);
	}
	let $dom = $root.getElementsByClassName('func_text_nameTop')[0];
	$root = undefined;

	// 自动处理
	if($mode === 'auto'){
		// 如果有消息则收起后显示新消息, 否则直接显示新消息
		if($dom.classList.contains('-quit') !== true){
			$dom.classList.add('-quit'); // 收起
			setTimeout(function(){ // 延迟显示新消息
				if($text !== undefined) $dom.innerHTML = $text;
				$dom.classList.remove('-quit'); // 显示
			}, 170);
		}else{
			$dom.classList.remove('-quit'); // 显示
			if($text !== undefined) $dom.innerHTML = $text;
		}
	}else

	// 仅显示
	if($mode === true){
		if($text !== undefined) $dom.innerHTML = $text;
		$dom.classList.remove('-quit');
	}else

	// 仅收起
	if($mode === false){ // 收起消息
		$dom.classList.add('-quit');
	}
};
