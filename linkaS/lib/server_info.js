
// 版本号
log.out('INFO', '[信息] Node.js '+ process.version);

// 路径
log.out('INFO', '[信息] 服务器根目录: '+ $config.rootPath);

// 运行环境
if(process.env.NODE_ENV === 'development'){
	log.out('WARN', '[信息] 服务器运行在开发环境中');
}else
if(process.env.NODE_ENV === 'production'){
	log.out('INFO', '[信息] 服务器运行在生产环境中');
}else{
	log.out('WARN', '[信息] 未定义服务器运行环境');
}


