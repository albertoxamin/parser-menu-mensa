/* eslint-disable no-console */

const express = require('express')
const moment = require('moment')
const PDFParser = require('pdf2json')
const { fetch } = require('./fetchPdf')

let pdfParser = new PDFParser()
let month = ''
pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError))
pdfParser.on('pdfParser_dataReady', pdfData => {
	let w1 = parseMenu(pdfData.formImage.Pages[0].Texts)
	let w2 = parseMenu(pdfData.formImage.Pages[1].Texts)
	let w3 = parseMenu(pdfData.formImage.Pages[2].Texts)
	let w4 = parseMenu(pdfData.formImage.Pages[3].Texts)
	let w5 = (pdfData.formImage.Pages.length > 4) ? parseMenu(pdfData.formImage.Pages[4].Texts) : {}
	month = JSON.stringify(Object.assign({}, w1, w2, w3, w4, w5))
})

fetch(pdfParser)

let app = express()
app.get('/', function (req, res) {
	if (!month) return res.status(500).send()
	res.set('Content-Type', 'application/json')
	res.send(month)
})

const parseMenu = function (texts) {
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
				daysLabels.push(str)
			}
		})


	} catch (e) {
		if (e !== 'shit') throw e
	}
	let menus = {}
	for (let i = 0; i < 5; i++) {
		let match = daysLabels[i].match('[0-9].*$')
		let md = moment(match[0], 'DD MMMM')
		let menu = {
			lesto: { primo: [days[0].menu[i]], secondo: [days[1].menu[i]], contorno: [days[2].menu[i]] }
		}
		menus[Buffer.from(md.format('YYYY-MM-DD')).toString('base64')] = menu
	}
	return menus
}

app.listen(process.env.PORT || 8080)
console.log('http://localhost:8080')