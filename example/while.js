'use strict'

const vbb = require('vbb-hafas')
const createCollectWhile = require('./while')

const friedrichsstr = '900000100001'
const when = 1519977600000 // 2018-03-02T08:00:00.000Z

const collectWhile = createCollectWhile(vbb.departures)

collectWhile(friedrichsstr, when, (dep, i) => i < 10)
.then(console.log)
.catch(console.error)
