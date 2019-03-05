const moment = require('moment')

module.exports = {
	parseIntero: function (texts) {
		let days = []
		let daysLabels = []
		try {
			let j = 0, prevWasValidText = false
			texts.forEach((el, i) => {
				let str = decodeURI(el.R[0].T).replace('%2C', '').replace('*', ' ').trim()
				if (str === 'LEGENDA')
					throw 'shit'
				let m = str.match('[A-z|\\ |ù|à|è|é|ò|ì|\']*')
				if (m[0] && i > 12 && str !== 'KCAL' && isNaN(str) && str.indexOf('%2') === -1) {
					if (!prevWasValidText) {
						days.push(str)
						j++
						if (j === 17) { days.push(''); j++ } //non c'e' il terzo primo sab e dom
					}
					else
						days[days.length - 1] += ' ' + str
					prevWasValidText = true
				} else {
					if (i < 13 && i % 2 == 0) {
						let match = str.match('[0-9].*$')
						if (match && match[0])
							daysLabels.push(match[0])
					}
					prevWasValidText = false
				}
			})
		} catch (e) {
			if (e !== 'shit') throw e
		}

		let menus = {}
		for (let i = 0; i < 6; i++) {
			let md = moment(daysLabels[i], 'DD MMMM')
			let menu = {
				completo: {
					primo: [0, 1, 2].map(x => days[x * 6 + i]),
					secondo: [3, 4].map(x => days[x * 6 + i]),
					contorno: [5, 6].map(x => days[x * 6 + i])
				}
			}
			menus[Buffer.from(md.format('YYYY-MM-DD')).toString('base64')] = menu
		}
		return menus
	},
	parseLesto: function (texts) {
		let days = []
		let daysLabels = []
		try {
			let j = 0, prev = 0
			texts.forEach((el, i) => {
				let str = decodeURI(el.R[0].T).trim().replace('%2C', '').replace('*', '')
				if (str === 'LEGENDA')
					throw 'shit'
				//da i > 10 iniziano i menu
				if (i > 10 && str !== 'KCAL' && isNaN(str) && str.indexOf('%2') === -1) {
					let row = Math.floor(j / 5)
					if (prev === i - 1 && days[row] && days[row].menu) {
						//qui dentro provo ad attaccare le cose che vanno a capo
						let m = days[row].menu
						if (str.indexOf('%') === -1) //if str do not has % in it
							days[row].menu[m.length - 1] += ' ' + str
						return
					}
					if (days[row])
						days[row].menu.push(str)
					else
						days.push({ menu: [str] })
					j++
					prev = i
				} else if (i % 2 == 0 && i < 12) {
					let match = str.match('[0-9].*$')
					if (match && match[0])
						daysLabels.push(match[0])
				}
			})
		} catch (e) {
			if (e !== 'shit') throw e
		}
		let menus = {}
		for (let i = 0; i < 5; i++) {
			let md = moment(daysLabels[i], 'DD MMMM')
			let menu = {
				lesto: { primo: [days[0].menu[i]], secondo: [days[1].menu[i]], contorno: [days[2].menu[i]] }
			}
			menus[Buffer.from(md.format('YYYY-MM-DD')).toString('base64')] = menu
		}
		return menus
	}
}