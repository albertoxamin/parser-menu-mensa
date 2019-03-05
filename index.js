/* eslint-disable no-console */
const express = require('express')
const { fetch } = require('./fetchPdf')

let lestoMonth = {}
let interoMonth = {}
fetch(lestoMonth, interoMonth)
let wasMerged = false

let app = express()

app.get('/', function (req, res) {
	console.log('requested menus')
	if (!lestoMonth || !interoMonth) return res.status(500).send()
	res.set('Content-Type', 'application/json')
	if (!wasMerged) {
		wasMerged = true
		Object.keys(interoMonth).forEach(function (key) {
			if (lestoMonth[key])
				interoMonth[key] = Object.assign(interoMonth[key], lestoMonth[key])
		})
	}
	res.send(JSON.stringify(interoMonth))
})

app.get('/refresh', function (req, res) {
	console.log('requested a refresh')
	fetch(lestoMonth, interoMonth)
	wasMerged = false
	return res.send('requested')
})

app.listen(process.env.PORT || 8080)
console.log('http://localhost:8080')