
const express = require('express')
const moment = require('moment')
const PDFParser = require('pdf2json')

let pdfParser = new PDFParser()
let month = ''
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError))
pdfParser.on("pdfParser_dataReady", pdfData => {
	let w1 = parseMenu(pdfData.formImage.Pages[0].Texts)
	let w2 = parseMenu(pdfData.formImage.Pages[1].Texts)
	let w3 = parseMenu(pdfData.formImage.Pages[2].Texts)
	let w4 = parseMenu(pdfData.formImage.Pages[3].Texts)
	month = JSON.stringify(Object.assign({}, w1, w2, w3, w4))
})
const linkToOperaUni="https://www.operauni.tn.it/servizi/ristorazione/menu"

const $ = require('cheerio');
 const rp= require('request-promise')
 const fs=require('fs')

 //Obtain PDF's URL.
rp(linkToOperaUni).then(function(html){
		//linkgetter
		const pastoUrls = [];
		//pastoUrls[0] will be completo
		//pastoUrls[1] will be lesto.
		for (let i = 0; i < 2; i++) {// I only care about the first 2 links.
		 pastoUrls.push($('h4 > a', html)[i].attribs.href);//getting HREF VALUE
		 //only for <a> tags inside h4
	 	}
		//downloader
		const optionsLesto = {
		 uri: pastoUrls[1],
		 method: "GET",
		 encoding: "binary",
		 headers: {
			 "Content-type": "applcation/pdf"
		 }
	 };
	 const optionsCompleto = {
		uri: pastoUrls[0],
		method: "GET",
		encoding: "binary",
		headers: {
			"Content-type": "applcation/pdf"
		}
	};
	 //getFileLesto
		rp(optionsLesto)
		.then(function(body, data) {
			let writeStream = fs.createWriteStream('/tmp/lesto.pdf');
				writeStream.write(body, 'binary');
				writeStream.on('finish', () => {
				pdfParser.loadPDF('/tmp/lesto.pdf')
				console.log('[Lesto]parsed data to file.');
			});
			writeStream.end();
		}).catch(function (err) {
					 throw err;
			 });

			 //getFileCompleto
				rp(optionsCompleto)
				.then(function(body, data) {
					let writeStream = fs.createWriteStream('/tmp/completo.pdf');
						writeStream.write(body, 'binary');
						writeStream.on('finish', () => {
						//pdfParser.loadPDF('/tmp/completo.pdf')
						console.log('[Completo]parsed data to file.');
					});
					writeStream.end();
				}).catch(function (err) {
							 throw err;
					 });
	 //end get file.

  })
  .catch(function(err){
    throw err;
  });






let app = express()
app.get('/', function (req, res) {
	if (!month) return res.status(500).send()
	res.set('Content-Type', 'application/json')
	res.send(month)
})

var parseMenu = function (texts) {
	let days = []
	let daysLabels = []
	try {
		let j = 0, prev = 0
		texts.forEach((el, i) => {
			let str = decodeURI(el.R[0].T).trim().replace('%2C', '').replace('*', '')
			if (str === 'LEGENDA')
				throw 'shit'
			if (i > 10 && str.length > 6 && str !== 'KCAL' && isNaN(str)) {
				if (prev === i - 1) {
					let m = days[Math.floor(j / 5)].menu
					days[Math.floor(j / 5)].menu[m.length - 1] += ' ' + str
					return
				}
				if (days[Math.floor(j / 5)])
					days[Math.floor(j / 5)].menu.push(str)
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

app.listen(process.env.PORT || 80)
console.log("http://localhost:80")
