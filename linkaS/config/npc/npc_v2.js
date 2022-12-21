
// NPC-v2
// 更好的可编程npc

db.add([
	{
		id: lib.uuid(),
		type: 'npc2',
		name: 'NPC-v2',
		place: [-266, 213, 0, 0, 0],
		p_client: function (){
			console.log('NPC-v2 NPC加载完成');
		},
		p_server: function (){

		},
		p_event: {
			'overlap.true': function (){
				console.log('触发碰撞');
			},
			'overlap.false': function (){
				console.log('取消碰撞');
			},
			'attack': function (){
				console.log('触发攻击');
			},
		},
	},
]);
