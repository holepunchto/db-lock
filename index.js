module.exports = class DBLock {
  constructor ({ enter, exit }) {
    this.entered = 0
    this.state = null
    this.locked = null
    this.onenter = enter || null
    this.onexit = exit || null
  }

  async enter () {
    if (this.entered === 0 && this.onenter !== null) {
      const release = await this._lock()
      try {
        if (this.state === null) this.state = await this.onenter()
      } finally {
        release()
      }
    }

    this.entered++
    return this.state
  }

  async exit () {
    if (this.entered === 1 && this.onexit !== null) {
      const release = await this._lock()
      try {
        await this.onexit(this.state)
      } finally {
        release()
      }
    }

    this.entered--
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
