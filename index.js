'use strict'

const maxBy = require('lodash.maxby')

const validId = /^\d{9,12}$/

const createCollectDeps = (fetchDepartures) => {
	if ('function' !== typeof fetchDepartures) {
		throw new Error('fetchDepartures must be a function.')
	}

	const collectDeps = (id, _when) => {
		if ('string' !== typeof id || !validId.test(id)) {
			throw new Error('id must be a string with 9 to 12 digits.')
		}
		_when = +_when
		if ('number' !== typeof _when || Number.isNaN(_when) || _when === 0) {
			throw new Error('when must be a Date or timestamp > 0.')
		}

		const makeIterator = () => {
			let when = _when

			const iterate = (duration = 10) => {
				return fetchDepartures(id, {when, duration})
				.then((deps) => {
					// todo: warn somehow if 0 departures
					if (deps.length > 0) {
						const last = maxBy(deps, (d) => {
							const w = +new Date(d.when)
							return Number.isNaN(w) ? 0 : w
						})
						// console.error('old when', when, 'new when', +new Date(last.when))
						when = +new Date(last.when)
					}
					// todo: find last, assign to when
					return {done: false, value: deps}
				})
			}

			return {next: iterate}
		}

		const iterable = {}
		iterable[Symbol.iterator] = makeIterator
		return iterable
	}
	return collectDeps
}

module.exports = createCollectDeps
