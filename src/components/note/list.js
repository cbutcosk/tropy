'use strict'

const React = require('react')
const { Iterator } = require('../iterator')
const { NoteListItem } = require('./list-item')
const { TABS, SASS: { NOTE } } = require('../../constants')
const { match } = require('../../keymap')
const { get } = require('../../common/util')
const { arrayOf, bool, func, number, object, shape } = require('prop-types')


class NoteList extends Iterator {
  get tabIndex() {
    return this.size === 0 ? null : TABS.NoteList
  }

  getColumns() {
    return 1
  }

  getRowHeight() {
    return NOTE.ROW_HEIGHT
  }

  getIterables() {
    return this.props.notes
  }

  head() {
    return get(this.props.selection, ['id'])
  }

  isSelected({ id }) {
    return id === this.head()
  }

  select = (note) => {
    if (note && !this.isSelected(note)) {
      this.props.onSelect({
        note:
        note.id,
        photo: note.photo,
        selection: note.selection
      })
    }
  }

  handleKeyDown = (event) => {
    switch (match(this.props.keymap, event)) {
      case 'up':
        this.select(this.prev())
        break
      case 'down':
        this.select(this.next())
        break
      case 'open':
        this.props.onOpen(this.current())
        break
      default:
        return
    }

    event.preventDefault()
    event.stopPropagation()
  }

  getIterableProps(note) {
    const isSelected = this.isSelected(note)

    return {
      note: isSelected ? this.props.selection : note,
      isDisabled: this.props.isDisabled,
      isSelected,
      onContextMenu: this.props.onContextMenu,
      onOpen: this.props.onOpen,
      onSelect: this.select
    }
  }

  render() {
    const { offset, height } = this.state
    const transform = `translate3d(0,${offset}px,0)`

    return (
      <div className="note list">
        <div
          className="scroll-container click-catcher"
          ref={this.setContainer}
          tabIndex={this.tabIndex}
          onKeyDown={this.handleKeyDown}>
          <div className="runway" style={{ height }}>
            <ul className="viewport" style={{ transform }}>
              {this.mapIterableRange(props =>
                <NoteListItem {...props} key={props.note.id}/>)}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  static propTypes = {
    keymap: object.isRequired,
    notes: arrayOf(shape({
      id: number.isRequired
    })).isRequired,
    selection: shape({
      id: number
    }),
    isDisabled: bool,
    onSelect: func.isRequired,
    onContextMenu: func.isRequired,
    onOpen: func.isRequired
  }
}

module.exports = {
  NoteList
}
