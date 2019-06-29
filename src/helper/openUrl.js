const { exec } = require('child_process')

module.exports = url => {
	switch (global.process.platform) {
	case 'darwin':
		exec(`open ${url}`)
		break
  
	case 'win32':
		exec(`start ${url}`)
		break
	}
}