'use strict'

const tapePromise = require('tape-promise').default
const tape = require('tape')
const floorDate = require('floordate')
const isPromise = require('is-promise')
const co = require('co')
const sinon = require('sinon')

const createCollectDeps = require('.')

const test = tapePromise(tape)

const friedrichsstr = '900000100001'

const minute = 60 * 1000
const hour = 60 * minute
const week = 7 * 24 * hour
// next Monday
const when = new Date(+floorDate(new Date(), 'week') + week + 10 * hour)

const mockDeparture = (id, t) => ({
	station: {type: 'station', id, name: 'foo'},
	when: new Date(t).toISOString()
})
const mockDepartures = (id, opt) => Promise.resolve([
	mockDeparture(id, 1 * minute + opt.when),
	mockDeparture(id, 2 * minute + opt.when),
	mockDeparture(id, 4 * minute + opt.when),
	mockDeparture(id, 7 * minute + opt.when)
])
const mockedCollectDeps = createCollectDeps(mockDepartures)

test('throws with invalid usage', (t) => {
	t.throws(() => collectDeps())
	t.throws(() => collectDeps('123'))
	t.throws(() => collectDeps(123456789))
	t.throws(() => collectDeps('123456789', null))
	t.throws(() => collectDeps('123456789', {}))
	t.throws(() => collectDeps('123456789', 'tomorrow'))
	t.end()
})

test('returns an async iterable', (t) => {
	const deps = mockedCollectDeps(friedrichsstr, when)
	t.equal(typeof deps, 'object', 'deps should be an obj')
	t.notOk(Array.isArray(deps), 'deps should be an obj')

	// todo: Symbol.asyncIterator ?
	const makeIterator = deps[Symbol.iterator]
	t.equal(typeof makeIterator, 'function', 'deps should have an iterator fn')

	const iterator = makeIterator()
	t.equal(typeof iterator, 'object', 'iterator should be an obj')
	t.notOk(Array.isArray(iterator), 'iterator should be an obj')

	t.equal(typeof iterator.next, 'function', 'iterator should have a next fn')

	const promise = iterator.next()
	promise.catch(() => {}) // errors are irrelevant in this case
	t.ok(isPromise(promise), 'iterator should return a Promise')

	t.end()
})

// todo: move to async test fn once Node 6 is out of active LTS
test('properly collects the departures', co.wrap(function* (t) {
	const depsA = yield mockDepartures(friedrichsstr, {when: +when})
	const depsB = yield mockDepartures(friedrichsstr, {
		when: 7 * minute + (+when)
	})
	const fetchDeps = sinon.stub()
	fetchDeps.onCall(0).resolves(depsA)
	fetchDeps.onCall(1).resolves(depsB)
	fetchDeps.onCall(2).rejects(new Error('departures mock called too often'))

	const depsAt = createCollectDeps(fetchDeps)(friedrichsstr, when)
	let result = []

	// todo: use async iteration once supported
	// see https://github.com/tc39/proposal-async-iteration
	const iterator = depsAt[Symbol.iterator]()
	let iterations = 0
	while (++iterations <= 2) {
		const deps = (yield iterator.next()).value
		result = result.concat(deps)
	}

	const expected = depsA.concat(depsB)
	t.deepEqual(result, expected)
	t.end()
}))
