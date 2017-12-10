'use strict'

const vbb = require('vbb-hafas')
const createCollectDeps = require('.')

const friedrichsstr = '900000100001'
const when = 1519977600000 // 2018-03-02T08:00:00.000Z

const collectDeps = createCollectDeps(vbb.departures)
const depsAtFriedrichstr = collectDeps(friedrichsstr, when)

const fetchDepsTwice = async () => {
	// todo: use async iteration once supported
	// see https://github.com/tc39/proposal-async-iteration
	const iterator = depsAtFriedrichstr[Symbol.iterator]()
	let iterations = 0
	while (++iterations <= 2) {
		const result = await iterator.next()
		const deps = result.value
		console.log(deps)
	}
}

fetchDepsTwice()
.catch(console.error)
