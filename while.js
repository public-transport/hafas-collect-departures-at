import {createCollectDeps} from './index.js'

const createCollectDepsWhile = (departures) => {
	const collectDeps = createCollectDeps(departures)

	const collectDepsWhile = (id, when, predicate) => {
		if ('function' !== typeof predicate) {
			throw new Error('predicate must be a function')
		}

		const depsAt = collectDeps(id, when)
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
	return collectDepsWhile
}

export {
	createCollectDepsWhile,
}
