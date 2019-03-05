const $ = require('cheerio');
const request = require('request-promise')
const fs = require('fs')

module.exports = {
	fetch: function (pdfParser) {
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
				method: "GET",
				encoding: "binary",
				headers: {
					"Content-type": "applcation/pdf"
				}
			}
			const optionsCompleto = {
				uri: pastoUrls[0],
				method: "GET",
				encoding: "binary",
				headers: {
					"Content-type": "applcation/pdf"
				}
			}
			//getFileLesto
			request(optionsLesto)
				.then(function (body, data) {
					let writeStream = fs.createWriteStream('/tmp/lesto.pdf')
					writeStream.write(body, 'binary')
					writeStream.on('finish', () => {
						pdfParser.loadPDF('/tmp/lesto.pdf')
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
						//pdfParser.loadPDF('/tmp/completo.pdf')
						console.log('[Completo]parsed data to file.')
					})
					writeStream.end();
				}).catch(function (err) {
					throw err
				})
			//end get file.
		}).catch(function (err) {
			throw err
		})
	}
}