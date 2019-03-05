/* eslint-disable no-console */
const express = require('express')
const fetch = require('./fetchPdf')

fetch.fetch()
let wasMerged = false

let app = express()
app.get('/', (req, res) => {
	console.log('requested menus')
	if (!fetch.lesto() || !fetch.intero()) return res.status(500).send()
	res.set('Content-Type', 'application/json')
	if (!wasMerged) {
		wasMerged = true
		Object.keys(fetch.intero()).forEach(key => {
			if (fetch.lesto()[key])
				fetch.intero()[key] = Object.assign(fetch.intero()[key], fetch.lesto()[key])
		})
	}
	res.send(JSON.stringify(fetch.intero()))
})
app.get('/links', (req, res) => {
	res.set('Content-Type', 'application/json')
	console.log('requested links')
	return res.send(JSON.stringify(fetch.links()))
})
app.get('/refresh', (req, res) => {
	console.log('requested a refresh')
	fetch.fetch()
	wasMerged = false
	return res.send('requested')
})

app.listen(process.env.PORT || 8080)
console.log('http://localhost:8080')
