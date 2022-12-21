
// NPC-v2
// 更好的可编程npc

(function (){

	let $place_x = -350;
	let $place_y = 350;

	let $p_client = function ($npc){
		console.log('NPC-v2 NPC加载完成');
	};

	let $p_event = {
		'overlap.true': function (){
			console.log('触发碰撞');
		},
		'overlap.false': function (){
			console.log('取消碰撞');
		},
		'attack': function (){
			console.log('触发攻击');
		},
	};

	let $arr = [];
	for(let i = 0; i < 10; i ++){
		for(let ii = 0; ii < 10; ii ++){
			$arr.push({
				id: lib.uuid(),
				type: 'npc2',
				name: 'NPC-v2',
				place: [$place_x - 128 * i, $place_y + 128 * ii, 0, 0, 0],
				p_client: $p_client,
				p_server: function (){

				},
				p_event: $p_event,
			});
		}
	}

	db.add($arr);

})();
