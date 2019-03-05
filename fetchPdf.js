/* eslint-disable no-console */
const $ = require('cheerio')
const request = require('request-promise')
const fs = require('fs')
const PDFParser = require('pdf2json')
const { parseIntero, parseLesto } = require('./parser')

module.exports = {
	fetch: function (lestoMonth, completoMonth) {
		let parserLesto = new PDFParser()
		let parserIntero = new PDFParser()
		parserLesto.on('pdfParser_dataReady', pdfData => {
			let w1 = parseLesto(pdfData.formImage.Pages[0].Texts)
			let w2 = parseLesto(pdfData.formImage.Pages[1].Texts)
			let w3 = parseLesto(pdfData.formImage.Pages[2].Texts)
			let w4 = parseLesto(pdfData.formImage.Pages[3].Texts)
			let w5 = (pdfData.formImage.Pages.length > 4) ? parseLesto(pdfData.formImage.Pages[4].Texts) : {}
			lestoMonth = Object.assign(lestoMonth, w1, w2, w3, w4, w5)
		})
		parserIntero.on('pdfParser_dataReady', pdfData => {
			let w1 = parseIntero(pdfData.formImage.Pages[0].Texts)
			let w2 = parseIntero(pdfData.formImage.Pages[2].Texts)
			let w3 = parseIntero(pdfData.formImage.Pages[4].Texts)
			let w4 = parseIntero(pdfData.formImage.Pages[6].Texts)
			let w5 = (pdfData.formImage.Pages.length > 8) ? parseIntero(pdfData.formImage.Pages[8].Texts) : {}
			completoMonth = Object.assign(completoMonth, w1, w2, w3, w4, w5)
		})
		//Obtain PDF's URL.
		request('https://www.operauni.tn.it/servizi/ristorazione/menu').then(function (html) {
			//linkgetter
			const pastoUrls = []
			//pastoUrls[0] will be completo
			//pastoUrls[1] will be lesto.
			for (let i = 0; i < 2; i++) {// I only care about the first 2 links.
				pastoUrls.push($('h4 > a', html)[i].attribs.href)//getting HREF VALUE
				//only for <a> tags inside h4
			}
			//downloader
			const optionsLesto = {
				uri: pastoUrls[1],
				method: 'GET',
				encoding: 'binary',
				headers: {
					'Content-type': 'applcation/pdf'
				}
			}
			const optionsCompleto = {
				uri: pastoUrls[0],
				method: 'GET',
				encoding: 'binary',
				headers: {
					'Content-type': 'applcation/pdf'
				}
			}
			//getFileLesto
			request(optionsLesto)
				.then(function (body, data) {
					let writeStream = fs.createWriteStream('/tmp/lesto.pdf')
					writeStream.write(body, 'binary')
					writeStream.on('finish', () => {
						parserLesto.loadPDF('/tmp/lesto.pdf')
						console.log('[Lesto]parsed data to file.')
					})
					writeStream.end()
				}).catch(function (err) {
					throw err
				})

			//getFileCompleto
			request(optionsCompleto)
				.then(function (body, data) {
					let writeStream = fs.createWriteStream('/tmp/completo.pdf')
					writeStream.write(body, 'binary')
					writeStream.on('finish', () => {
						parserIntero.loadPDF('/tmp/completo.pdf')
						console.log('[Completo]parsed data to file.')
					})
					writeStream.end()
				}).catch(function (err) {
					throw err
				})
			//end get file.
		}).catch(function (err) {
			throw err
		})
	}
}