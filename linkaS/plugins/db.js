const log = require('./log.js');

// 数据库

// t.insert(json | array) 写入或批量写入数据
// t.find(json) 查找数据
// t.update(t) 更新数据
// t.remove(json) 根据查找指令删除数据


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

// 添加到数据库
function add($data, $p = $c.Entity){

	try{
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
	$p.update($data);
};

// 从数据库中删除
function del($json, $p = $c.Entity){
	$p.remove(get($json));
};


module.exports = {
	get,
	add,
	up,
	del,
};
