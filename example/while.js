'use strict'

const createHafas = require('vbb-hafas')
const createCollectWhile = require('../while')

const hafas = createHafas('hafas-collect-departures-at example')
const friedrichsstr = '900000100001'
const when = 1534579200000 // 2018-08-18T10:00:00+0200

const collectWhile = createCollectWhile(hafas.departures)

collectWhile(friedrichsstr, when, (dep, i) => i < 10)
.then(console.log)
.catch(console.error)
