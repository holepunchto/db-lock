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
