'use strict'

const createHafas = require('vbb-hafas')
const createCollectWhile = require('../while')

const hafas = createHafas('hafas-collect-departures-at example')
const friedrichsstr = '900000100001'
const when = 1563177600000 // 2019-07-15T10:00:00+0200

const collectWhile = createCollectWhile(hafas.departures)

collectWhile(friedrichsstr, when, (dep, i) => i < 10)
.then(console.log)
.catch(console.error)
