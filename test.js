import {DateTime} from 'luxon'
import _tapePromise from 'tape-promise'
const {default: tapePromise} = _tapePromise
import tape from 'tape'
import isPromise from 'is-promise'
import sinon from 'sinon'
import {createVbbHafas} from 'vbb-hafas'

import {createCollectDeps} from './index.js'

const test = tapePromise(tape)

const friedrichsstr = '900100001'

const minute = 60 * 1000
// next Monday
const when = DateTime.fromMillis(Date.now(), {
	zone: 'Europe/Berlin',
	locale: 'de-DE',
}).startOf('week').plus({weeks: 1, hours: 10}).toJSDate()

const mockDeparture = (id, t, cancelled = false) => ({
	stop: {type: 'stop', id, name: 'foo'},
	when: cancelled ? null : new Date(t).toISOString(),
	plannedWhen: cancelled ? new Date(t).toISOString() : null,
})
const mockDepartures = (id, opt) => Promise.resolve([
	mockDeparture(id, 1 * minute + (+new Date(opt.when))),
	mockDeparture(id, 2 * minute + (+new Date(opt.when))),
	mockDeparture(id, 4 * minute + (+new Date(opt.when))),
	mockDeparture(id, 7 * minute + (+new Date(opt.when)))
])
const mockedCollectDeps = createCollectDeps(mockDepartures)

test('throws with invalid usage', (t) => {
	t.throws(() => mockedCollectDeps())
	t.throws(() => mockedCollectDeps('123'))
	t.throws(() => mockedCollectDeps(123456789))
	t.throws(() => mockedCollectDeps('123456789', null))
	t.throws(() => mockedCollectDeps('123456789', {}))
	t.throws(() => mockedCollectDeps('123456789', 'tomorrow'))
	t.end()
})

test('returns an async iterable', (t) => {
	const deps = mockedCollectDeps(friedrichsstr, when)
	t.equal(typeof deps, 'object', 'deps should be an obj')
	t.notOk(Array.isArray(deps), 'deps should not be an array')

	const makeIterator = deps[Symbol.asyncIterator]
	t.equal(typeof makeIterator, 'function', 'deps should have an iterator fn')

	const iterator = makeIterator()
	t.equal(typeof iterator, 'object', 'iterator should be an obj')
	t.notOk(Array.isArray(iterator), 'iterator should not be an array')

	t.equal(typeof iterator.next, 'function', 'iterator should have a next fn')

	const promise = iterator.next()
	promise.catch(() => {}) // errors are irrelevant in this case
	t.ok(isPromise(promise), 'iterator should return a Promise')

	t.end()
})

test('properly collects the departures', async (t) => {
	const depsA = await mockDepartures(friedrichsstr, {when: +when})
	const depsB = await mockDepartures(friedrichsstr, {
		when: 7 * minute + (+new Date(when))
	})
	const fetchDeps = sinon.stub()
	fetchDeps.onCall(0).resolves(depsA)
	fetchDeps.onCall(1).resolves(depsB)
	fetchDeps.onCall(2).rejects(new Error('departures mock called too often'))

	const depsAt = createCollectDeps(fetchDeps)(friedrichsstr, when)
	let result = []

	let iterations = 0
	for await (const deps of depsAt) {
		result = result.concat(deps)
		if (++iterations >= 2) break
	}

	const expected = depsA.concat(depsB)
	t.deepEqual(result, expected)
	t.end()
})

test('increases when even if 0 departures', async (t) => {
	const initialWhen = Date.now()
	let call = 0, lastWhen = initialWhen
	const fetchDeps = (s, opt) => {
		if (call++ === 0) t.equal(+opt.when, initialWhen)
		else t.ok(opt.when > lastWhen)
		lastWhen = opt.when

		return Promise.resolve([])
	}

	const depsAt = createCollectDeps(fetchDeps)(friedrichsstr, initialWhen)

	let iterations = 0
	// eslint-disable-next-line no-unused-vars
	for await (const _ of depsAt) {
		if (++iterations > 3) break
	}

	t.end()
})

test('increases `when` even if last dep has equal when', async (t) => {
	const initialWhen = Date.now()
	let call = 0, lastWhen = initialWhen
	const fetchDeps = (s, opt) => {
		if (call++ > 0) t.ok(opt.when > lastWhen)
		lastWhen = opt.when

		return Promise.resolve([
			mockDeparture(friedrichsstr, opt.when)
		])
	}

	const depsAt = createCollectDeps(fetchDeps)(friedrichsstr, initialWhen)
	let iterations = 0
	// eslint-disable-next-line no-unused-vars
	for await (const _ of depsAt) {
		if (++iterations > 3) break
	}

	t.end()
})

test('works with the latest departure being cancelled', async (t) => {
	let call = 0
	const fetchDeps = async (id, opt) => {
		if (call++ > 0) {
			t.ok(opt.when > Date.parse('2023-01-10T10:00+01:00'), 'opt.when is too low')
			return []
		}
		return [
			mockDeparture(friedrichsstr, '2023-01-10T10:01+01:00', false),
			mockDeparture(friedrichsstr, '2023-01-10T10:10+01:00', true),
		]
	}

	const collectDeps = createCollectDeps(fetchDeps)
	const depsAt = collectDeps(friedrichsstr, Date.parse('2023-01-10T10:00+01:00'))
	let iterations = 0
	// eslint-disable-next-line no-unused-vars
	for await (const _ of depsAt) {
		if (++iterations >= 2) break
	}

	t.end()
})

test('works with vbb-hafas', async (t) => {
	const hafas = createVbbHafas('hafas-collect-departures-at')
	const collectDeps = createCollectDeps(hafas.departures)

	const depsAt = collectDeps(friedrichsstr, when)
	let iterations = 0
	// eslint-disable-next-line no-unused-vars
	for await (const _ of depsAt) {
		if (++iterations > 3) break
	}

	t.end()
})
