# Api for the unitn canteen menu 

## Why?

Opera Universitaria doesn't like keeping updated the firebase db, so this is a direct replacement to the firebase api

## How?

It parses the PDFs on their website

## Known bugs

Sundays aren't parsed, the third side dish isn't loaded because they randomly don't put it so it kinda ruins everything 

## How to use this

One simple `GET` at https://api-mensa-unitn.herokuapp.com

You can find the menu of the day with `(day.format('YYYY-MM-DD')).toString('base64')`
