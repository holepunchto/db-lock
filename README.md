# db-lock

Simple concurrent lock for DB patterns allowing for multiple transactions with a shared state to be open in parallel.

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

## API

#### `const lock = new DBLock({ enter, exit, maxParallel = -1 })`

Create a new lock with an `enter` and `exit` handlers defined.

The async `enter` handler should return a 'transaction' (`tx`) that will be used when it's the caller's turn to work on the database in parallel.

For example with [HyperDB](https://github.com/holepunchto/hyperdb), you can make a transaction like so:

```js
const db = HyperDB.from(SCHEMA_DIR, DB_DIR)
const lock = new DBLock({
  async enter () {
    return db.transaction()
  }
})
```

The async `exit` handler should flush the `tx` transaction to the database.

Expanding on the `enter` example with [HyperDB](https://github.com/holepunchto/hyperdb), you would flush the `tx` like so:

```js
const db = HyperDB.from(SCHEMA_DIR, DB_DIR)
const lock = new DBLock({
  async enter () {
    return db.transaction()
  },

  async exit (tx) {
    await tx.flush()
  }
})
```

`maxParallel` is the max number of transactions that can be entered concurrently. Defaults to unlimited (`-1`).

#### `lock.entered`

The number of current transactions entered.

#### `const tx = await lock.enter()`

Await a transaction value on the database to work with while holding the lock.

#### `await lock.exit()`

When called flushes the transaction as defined in the `exit` handler. Will resolve when all current transaction have exited.

## License

Apache-2.0
