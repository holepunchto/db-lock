const DBLock = require('./')
const test = require('brittle')

test('basic', async function (t) {
  const state = { ran: 0 }
  const l = new DBLock({
    enter () {
      t.is(state.ran, 0)
      return state
    },
    exit (state) {
      t.is(state.ran, 3)
    }
  })

  {
    const a = run()
    const b = run()
    const c = run()

    await a
    await b
    await c
  }

  t.is(state.ran, 3)
  state.ran = 0

  {
    const a = run()
    const b = run()
    const c = run()

    await a
    await b
    await c
  }

  t.is(state.ran, 3)

  async function run () {
    const st = await l.enter()
    st.ran++
    await new Promise(resolve => setImmediate(resolve))
    await l.exit()
  }
})

test('exit waits for flush', async function (t) {
  t.plan(3)

  let exited = false

  const l = new DBLock({
    enter () {
      return true
    },
    exit (state) {
      exited = true
    }
  })

  run(100)
  run(10)
  run(300)

  async function run (ms) {
    await l.enter()
    await new Promise(resolve => setTimeout(resolve, ms))
    await l.exit()
    t.ok(exited)
  }
})

test('respects maxParallel softlimit', async function (t) {
  t.plan(4)

  const l = new DBLock({
    maxParallel: 2,
    enter () {
      return true
    },
    exit (state) {
      exited = true
    }
  })

  run()
  run()
  run()
  run()

  async function run () {
    await l.enter()
    await new Promise(resolve => setImmediate(resolve))
    t.ok(l.entered <= 2)
    await l.exit()
  }
})
