# hafas-collect-departures-at

**Utility to collect departures, using any HAFAS client.**

[![npm version](https://img.shields.io/npm/v/hafas-collect-departures-at.svg)](https://www.npmjs.com/package/hafas-collect-departures-at)
[![build status](https://api.travis-ci.org/derhuerst/hafas-collect-departures-at.svg?branch=master)](https://travis-ci.org/derhuerst/hafas-collect-departures-at)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-collect-departures-at.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install hafas-collect-departures-at
```


## Usage

```js
const createHafas = require('vbb-hafas')
const createCollectDeps = require('hafas-collect-departures-at')

const fooStation = '900000100001'
const hafas = createHafas('my-awesome-program')
const collectDeps = createCollectDeps(hafas.departures)
const depsAtFoo = collectDeps(fooStation, Date.now())

const fetchDepsTwice = async () => {
	let iterations = 0
	for await (let deps of depsAtFoo) {
		if (++iterations > 2) break
		console.log(deps)
	}
}

fetchDepsTwice()
.catch(console.error)
```

Keep in mind that the example above only works in Node 10+ (and Node 9 with the `--harmony-async-iteration` flag), because it uses [async iteration](http://2ality.com/2017/12/for-await-of-sync-iterables.html).

You can also use [Babel](https://babeljs.io) with the [async generators plugin](https://github.com/babel/babel/tree/12ac1bccd7697eb919fe442e35d83ab92e3c882d/packages/babel-plugin-proposal-async-generator-functions) (currently in [the stage 3 preset](https://github.com/babel/babel/tree/12ac1bccd7697eb919fe442e35d83ab92e3c882d/packages/babel-preset-stage-3)) to use this syntax. Alternatively, you can write `fetchDepsTwice` without async iteration:

```js
const fetchDepsTwice = async () => {
	const iterator = depsAtFoo[Symbol.asyncIterator]()
	let iterations = 0
	while (++iterations <= 2) {
		const result = await iterator.next()
		const deps = result.value
		console.log(deps)
	}
}
```

### `while` helper

If you don't like to use the async iteration syntax, there's a helper that works like a regular [`while` loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while):

```js
const createCollectWhile = require('hafas-collect-departures-at/while')

const shouldPick = (dep, i) => i < 10

const collectWhile = createCollectWhile(vbb.departures)
collectWhile(fooStation, Date.now(), shouldPick)
.then(console.log)
.catch(console.error)
```

`collectWhile()` returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an *array of 10* items.


## Contributing

If you have a question or have difficulties using `hafas-collect-departures-at`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/hafas-collect-departures-at/issues).
