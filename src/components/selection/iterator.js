'use strict'

const React = require('react')
const { Iterator } = require('../iterator')
const { arrayOf, bool, number, shape, string } = require('prop-types')


class SelectionIterator extends Iterator {
  get iteration() {
    return this.props.selections
  }

  map(fn) {
    this.idx = {}

    return this.props.selections.map((selection, index) => {
      this.idx[selection] = index

      return fn({
        selection,
        cache: this.props.cache,
        isDisabled: this.props.isDisabled,
        isLast: index === this.props.selections.length - 1,
        isVertical: this.isVertical,
        photo: this.props.photo
      })
    })
  }

  static propTypes = {
    isDisabled: bool.isRequired,
    photo: shape({
      id: number.isRequired
    }).isRequired,
    selections: arrayOf(shape({
      id: number.isRequired
    })).isRequired,
    cache: string.isRequired,
    size: number.isRequired
  }
}

module.exports = {
  SelectionIterator
}