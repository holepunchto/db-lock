module.exports = class DBLock {
  constructor ({ enter, exit, maxParallel = -1 } = {}) {
    this.entered = 0
    this.state = null
    this.locked = null
    this.maxParallel = maxParallel
    this.needsDrain = false
    this.onenter = enter || null
    this.onexit = exit || null
    this.pendingExits = []
  }

  async enter () {
    if (this.needsDrain) await this.waitForExit()

    if (this.entered === 0) {
      const release = await this._lock()

      try {
        if (++this.entered === 1 && this.onenter !== null) this.state = await this.onenter()
      } finally {
        release()
      }
    } else {
      this.entered++
    }

    if (this.maxParallel >= 0 && this.entered >= this.maxParallel) this.needsDrain = true

    return this.state
  }

  async exit () {
    this.entered--

    if (this.entered === 0) {
      const release = await this._lock()
      const exits = this.pendingExits
      const state = this.state

      this.pendingExits = []
      this.state = null
      this.needsDrain = false

      try {
        if (this.onexit !== null) await this.onexit(state)
        for (let i = 0; i < exits.length; i++) exits[i]()
      } finally {
        release()
      }

      return
    }

    return this.waitForExit()
  }

  waitForExit () {
    return new Promise((resolve) => {
      this.pendingExits.push(resolve)
    })
  }

  async _lock () {
    while (this.locked !== null) await this.locked
    let release = null
    this.locked = new Promise((resolve) => {
      release = resolve
    })
    return () => {
      this.locked = null
      release()
    }
  }
}
