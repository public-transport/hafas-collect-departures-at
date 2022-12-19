# hafas-collect-departures-at

**Utility to collect departures, using any HAFAS client.**

[![npm version](https://img.shields.io/npm/v/hafas-collect-departures-at.svg)](https://www.npmjs.com/package/hafas-collect-departures-at)
![ISC-licensed](https://img.shields.io/github/license/public-transport/hafas-collect-departures-at.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installing

```shell
npm install hafas-collect-departures-at
```


## Usage

```js
import {createVbbHafas} from 'vbb-hafas'
import {createCollectDeps} from 'hafas-collect-departures-at'

const fooStation = '900000100001'
const hafas = createVbbHafas('my-awesome-program')
const collectDeps = createCollectDeps(hafas.departures, {
	departuresOpts: {
		remarks: true,
		products: {tram: false},
	},
})
const depsAtFoo = collectDeps(fooStation, Date.now())

let iterations = 0
for await (const deps of depsAtFoo) {
	if (++iterations > 2) break
	console.log(deps)
}
```

### `while` helper

If you don't like to use the async iteration syntax, there's a helper that works like a regular [`while` loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while):

```js
import {createCollectDepsWhile} from 'hafas-collect-departures-at/while.js'

const collectWhile = createCollectDepsWhile(vbb.departures)

const shouldPick = (dep, i) => i < 10
const deps = await collectWhile(fooStation, Date.now(), shouldPick)
console.log(deps)
```

`collectWhile()` returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an *array of 10* items.


## Related

- [`hafas-find-alternative-legs`](https://github.com/derhuerst/hafas-find-alternative-legs) – Given a [`hafas-client`](https://npmjs.com/package/hafas-client) journey, get alternatives for each leg from HAFAS.


## Contributing

If you have a question or have difficulties using `hafas-collect-departures-at`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/public-transport/hafas-collect-departures-at/issues).
