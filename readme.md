# hafas-collect-departures-at

[![Greenkeeper badge](https://badges.greenkeeper.io/derhuerst/hafas-collect-departures-at.svg)](https://greenkeeper.io/)

**Utility to collect departures, using any HAFAS client.**

[![npm version](https://img.shields.io/npm/v/hafas-collect-departures-at.svg)](https://www.npmjs.com/package/hafas-collect-departures-at)
[![build status](https://api.travis-ci.org/derhuerst/hafas-collect-departures-at.svg?branch=master)](https://travis-ci.org/derhuerst/hafas-collect-departures-at)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-collect-departures-at.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


## Installing

```shell
npm install hafas-collect-departures-at
```


## Usage

```js
const vbb = require('vbb-hafas')
const createCollectDeps = require('hafas-collect-departures-at')

const fooStation = '900000100001'
const collectDeps = createCollectDeps(vbb.departures)
const depsAtFoo = collectDeps(fooStation, Date.now())

const fetchDepsTwice = async () => {
	// this looks awkward because async iteration is not stable yet
	const iterator = depsAtFoo[Symbol.iterator]()
	let iterations = 0
	while (++iterations <= 2) {
		const result = await iterator.next()
		const deps = result.value
		console.log(deps)
	}
}

fetchDepsTwice()
.catch(console.error)
```

If you're brave enough to use [Babel](https://babeljs.io) with [async generators plugin](https://github.com/babel/babel/tree/12ac1bccd7697eb919fe442e35d83ab92e3c882d/packages/babel-plugin-proposal-async-generator-functions) (currently in [the stage 3 preset](https://github.com/babel/babel/tree/12ac1bccd7697eb919fe442e35d83ab92e3c882d/packages/babel-preset-stage-3)), you can write `fetchDepsTwice` like this:

```js
const fetchDepsTwice = async () => {
	let iterations = 0
	for await (let deps of depsAtFoo) {
		if (++iterations > 2) break
		console.log(deps)
	}
}
```


## Contributing

If you have a question or have difficulties using `hafas-collect-departures-at`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/hafas-collect-departures-at/issues).
