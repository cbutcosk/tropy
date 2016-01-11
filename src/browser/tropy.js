'use strict'

const { EventEmitter } = require('events')
const { resolve } = require('path')
const { app, shell, BrowserWindow, ipcMain: ipc } = require('electron')
const { verbose } = require('../common/log')
const AppMenu = require('./menu')
const Storage = require('./storage')
const url = require('url')

const pkg = require('../../package')

const { defineProperty: prop } = Object

module.exports = class Tropy extends EventEmitter {

  constructor({ environment, debug } = {}) {
    if (Tropy.instance) return Tropy.instance

    super()
    Tropy.instance = this

    this.menu = new AppMenu(this)
    this.menu.load('app')

    prop(this, 'store', { value: new Storage() })

    prop(this, 'debug', { value: debug })
    prop(this, 'environment', { value: environment || process.env.NODE_ENV })

    prop(this, 'home', {
      value: resolve(__dirname, '..', '..')
    })

    prop(this, 'hash', {
      value: encode({ environment, debug, home: app.getPath('userData') })
    })

    this.resume()
    this.listen()
  }

  open() {
    if (!this.win) {
      this.win = new BrowserWindow({
        show: false,
        preload: resolve(__dirname, '..', 'bootstrap.js')
      })

      this.win.webContents.once('dom-ready', () => this.win.show())

      this.win
        .once('closed', () => { this.win = undefined })
        .loadURL(this.url('index.html'))

    } else {
      this.win.show()
    }

    return this
  }

  url(filename) {
    return url.format({
      protocol: 'file',
      pathname: `${this.home}/static/${filename}`,
      hash: this.hash
    })
  }

  resume() {
    return this.store
      .load('state.json')
      .catch({ code: 'ENOENT' }, () => ({}))

      .then(state => {
        this.state = state
        this.emit('app:resume')
      })
  }

  persist() {
    return this.store.save.sync('state.json', this.state), this
  }

  listen() {
    this
      .on('app:quit', () => app.quit())

      .on('app:toggle-full-screen', win => {
        verbose('toggle fullscreen')
        win.setFullScreen(!win.isFullScreen())
      })

      .on('app:toggle-menu-bar', win => {
        verbose('toggle menu bar')

        if (win.isMenuBarAutoHide()) {
          win.setAutoHideMenuBar(false)
        } else {
          win.setAutoHideMenuBar(true)
          win.setMenuBarVisibility(false)
        }
      })

      .on('app:open-license', () => {
        shell.openExternal('https://github.com/tropy/tropy/blob/master/LICENSE')
      })

      .on('app:search-issues', () => {
        shell.openExternal('https://github.com/tropy/tropy/issues')
      })

    app
      .on('before-quit', () => {
        verbose('saving app state')
        this.persist()
      })

    ipc
      .on('command', (_, command) => this.emit(command))
  }


  get name() {
    return pkg.productName || pkg.name
  }

  get version() {
    return pkg.version
  }

  get development() {
    return this.environment === 'development'
  }
  get production() {
    return this.environment === 'production'
  }
}

function encode(data) {
  return encodeURIComponent(JSON.stringify(data))
}
