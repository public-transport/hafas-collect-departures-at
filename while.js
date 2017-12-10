'use strict'

const co = require('co')

const createCollectDeps = require('.')

const createCollectWhile = (departures) => {
	const collectDeps = createCollectDeps(departures)

	const collectWhile = (id, when, predicate) => {
		if ('function' !== typeof predicate) {
			throw new Error('predicate must be a function')
		}

		const depsAt = collectDeps(id, when)
		const iterator = depsAt[Symbol.iterator]()
		const collected = []

		// todo: move to async test fn once Node 6 is out of active LTS
		return co(function* loop () {
			// todo: use async iteration once supported
			// see https://github.com/tc39/proposal-async-iteration
			while (true) {
				const result = yield iterator.next()
				const deps = result.value

				for (let dep of deps) {
					if (!predicate(dep, collected.length)) return collected
					collected.push(dep)
				}
			}
		})
	}
	return collectWhile
}

module.exports = createCollectWhile
