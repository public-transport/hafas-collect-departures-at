'use strict'

const createHafas = require('vbb-hafas')
const createCollectDeps = require('..')

const friedrichsstr = '900000100001'
const when = 1534579200000 // 2018-08-18T10:00:00+0200

const hafas = createHafas('hafas-collect-departures-at example')
const collectDeps = createCollectDeps(hafas.departures)
const depsAtFriedrichstr = collectDeps(friedrichsstr, when)

const fetchDepsTwice = async () => {
	let iterations = 0
	// only works in Node 10+, because it uses async iteration
	// see https://github.com/tc39/proposal-async-iteration
	for await (let deps of depsAtFriedrichstr) {
		console.log(deps)
		if (++iterations <= 2) break
	}
}

fetchDepsTwice()
.catch(console.error)
