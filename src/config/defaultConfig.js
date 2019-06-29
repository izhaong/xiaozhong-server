module.exports = {
	root: global.process.cwd(), // 当前路径
	hostname: '127.0.0.1',
	port: 3000,
	compress: /\.(html|js|css|md)/,
	cache: {
		maxAge: 6000,
		expires: true,
		cacheControl: true,
		lastModified: true,
		etag: true
	}
}