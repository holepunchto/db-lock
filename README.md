# db-lock

Simple concurrent lock for DB patterns

```
npm install db-lock
```

## Usage

``` js
const DBLock = require('db-lock')

const l = new DBLock({
  async enter () {
    return db.transaction()
  },
  async exit (tx) {
    await tx.flush()
  }
})

const tx = await l.enter() // opens the tx on first enter
// ... do stuff
await l.exit() // flushes the tx on last exit
```

## License

Apache-2.0
