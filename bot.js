const express = require('express');
const moment = require('moment')

let app = express()

let PDFParser = require("pdf2json");
let pdfParser = new PDFParser();
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
	let w1 = parseMenu(pdfData.formImage.Pages[0].Texts)
	let w2 = parseMenu(pdfData.formImage.Pages[1].Texts)
	let w3 = parseMenu(pdfData.formImage.Pages[2].Texts)
	let w4 = parseMenu(pdfData.formImage.Pages[3].Texts)
	_res.send(JSON.stringify(Object.assign({}, w1, w2, w3, w4), null, '\t'))
});
var _res;

app.get('/', function (req, res) {
	_res = res;
	pdfParser.loadPDF('./menu.pdf');
})

var parseMenu = function (texts) {
	let days = []
	let daysLabels = []
	try {
		let j = 0, prev = 0;
		texts.forEach((el, i) => {
			let str = decodeURI(el.R[0].T).trim().replace('%2C', '').replace('*', '');
			if (str === 'LEGENDA')
				throw 'shit';
			if (i > 10 && str.length > 6 && str !== 'KCAL' && isNaN(str)) {
				if (prev === i - 1) {
					let m = days[Math.floor(j / 5)].menu;
					days[Math.floor(j / 5)].menu[m.length - 1] += ' ' + str;
					return;
				}
				if (days[Math.floor(j / 5)])
					days[Math.floor(j / 5)].menu.push(str);
				else
					days.push({ menu: [str] });
				j++;
				prev = i;
			} else if (i % 2 == 0 && i < 12) {
				daysLabels.push(str);
			}
		});


	} catch (e) {
		if (e !== 'shit') throw e;
	}
	let menus = {};
	for (let i = 0; i < 5; i++) {
		let match = daysLabels[i].match('[0-9].*$')
		let md = moment(match[0], 'DD MMMM')
		let menu = {
			lesto: { primo: [days[0].menu[i]], secondo: [days[1].menu[i]], contorno: [days[2].menu[i]] }
		}
		menus[Buffer.from(md.unix().toString() + "000").toString('base64')] = menu
	}
	return menus;
}

app.listen(80);
console.log("http://localhost:80");