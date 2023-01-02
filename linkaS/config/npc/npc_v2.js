
// NPC-v2
// 更好的可编程npc

(function (){

	let $place_x = -350;
	let $place_y = 350;

	let $p_client = function ($npc){
		console.log('NPC-v2 NPC加载完成');
	};

	let $p_event = {
		// 'overlap.true': function ($npc){
		// },
		// 'overlap.false': function ($npc){
		// },
		'attack': function ($npc){
			npcLib.plugins.ride.switch($npc);
		},
	};

	let $arr = [];

	$arr.push({
		id: lib.uuid(),
		type: 'npc2',
		name: 'NPC-v2-骑乘测试',
		place: [$place_x, $place_y, 0, 0, 0],
		p_client: $p_client,
		p_server: function (){},
		p_event: $p_event,
		data: {},
		serverData: {
			ride: {
				enable: false,
				ing_player_id: null,
			},
		},
	});

	db.add($arr);

})();
