const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

// const config = require('../config/defaultConfig')
const Handlebars = require('handlebars')
const tplPath = path.join(__dirname, '../template/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())

// 处理contentType
const mime = require('./mime')

// 压缩
const compress = require('./compress')

// range
const range = require('./range')

// 缓存
const isFresh = require('./cache.js')

module.exports = async function (req, res, filePath, config) {
	try {
		const stats = await stat(filePath)
		// 如果是文件, 返回内容
		if (stats.isFile()) {
			const contentType = mime(filePath)

			res.setHeader('Content-Type', `${contentType}; charset=utf-8`)

			if (isFresh(stats, req, res)) {
				res.statusCode = 304
				res.end()
				return
			}

			// fs.createReadStream(filePath).pipe(res)
			// let rs = fs.createReadStream(filePath)
			let rs
			const {
				code,
				start,
				end
			} = range(stats.size, req, res)
			if (code === 200) {
				res.statusCode = 200
				rs = fs.createReadStream(filePath)
			} else {
				res.statusCode = 206
				rs = fs.createReadStream(filePath, {
					start,
					end
				})
			}
			if (filePath.match(config.compress)) {
				rs = compress(rs, req, res)
			}
			rs.pipe(res)
		} else if (stats.isDirectory()) { // 如果是文件夹, 返回文件列表
			const files = await readdir(filePath)
			res.writeHead(200, {
				'Content-Type': 'text/html; charset=utf-8'
			})
			const dir = path.relative(config.root, filePath)
			const data = {
				title: path.basename(filePath),
				dir: dir ? `/${dir}` : '',
				files: files.map(file => {
					return {
						file,
						icon: mime(file)
					}
				})
			}
			res.end(template(data))
		}
	} catch (err) {
		// 如果不存在
		// console.error(err)
		res.write('Content-Type', 'text/plain; charset=utf-8')
		res.end(`${filePath} is not directory or file\n ${err.toString()}`)
	}
}