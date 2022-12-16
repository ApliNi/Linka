
// 在数据库中查找数据
function get($json, $returnArray = false, $p = $c.Entity){
	// 查找数据
	let $dataArr = $p.find($json);
	if($returnArray === false){
		if($dataArr.length > 0){
			return $dataArr[0];
		}
	}else{
		return $dataArr;
	}
	return undefined;
};

// 判断是否存在
function getif($json, $p = $c.Entity){
	// 查找数据
	if($p.find($json).length === 0){
		return false;
	}else{
		return true;
	}
};

// 获取实体的坐标数组, 通过平面索引
// function getPlace($player, $p = $c.Entity){
// 	return [$player.place_x, $player.place_y, $player.place_z, $player.place_x, $player.place_yaw, $player.place_pitch];
// };

// 将坐标数组同步到平面索引
// 存取数据时可以忽略这些, 依旧读写place数组, 此部分的作用是索引数组中的数值
function _upPlace($player){
	if($player?.place){
		$player.place_x = $player.place[0];
		$player.place_y = $player.place[1];
		$player.place_z = $player.place[2];
		$player.place_yaw = $player.place[3];
		$player.place_pitch = $player.place[4];
	}
};

// 添加到数据库
function add($data, $p = $c.Entity){

	try{
		_upPlace($data);
		$p.insert($data);
	}catch(error){
		log.out('ERROR', '[数据库] [添加记录]');
		console.log(error);
	}

	// $p.on('error', (err) => {
	// 	log.out('ERROR', '[数据库] [添加记录]');
	// });
};

// 更新到数据库
function up($data, $p = $c.Entity){
	_upPlace($data);
	$p.update($data);
};

// 从数据库中删除
function del($json, $p = $c.Entity){
	$p.remove(get($json));
};


module.exports = {
	get,
	getif,
	// getPlace,
	add,
	up,
	del,
};
