'use strict'

const createCollectDeps = require('.')

const createCollectWhile = (departures) => {
	const collectDeps = createCollectDeps(departures)

	const collectWhile = (id, when, predicate) => {
		if ('function' !== typeof predicate) {
			throw new Error('predicate must be a function')
		}

		const depsAt = collectDeps(id, when)
		const iterator = depsAt[Symbol.asyncIterator]()
		const collected = []

		const loop = async () => {
			for await (const deps of depsAt) {
				for (let dep of deps) {
					if (!predicate(dep, collected.length)) return collected
					collected.push(dep)
				}
			}
		}
		return loop()
	}
	return collectWhile
}

module.exports = createCollectWhile
