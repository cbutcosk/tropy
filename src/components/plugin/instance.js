'use strict'

const React = require('react')
const { PureComponent } = require('react')
const {
  arrayOf, bool, func, number, oneOf, object, oneOfType, shape, string
} = require('prop-types')
const { FormField, FormToggle } = require('../form')
const { get, set } = require('../../common/util')
const { IconPlusCircle, IconMinusCircle } = require('../icons')
const { Button, ButtonGroup } = require('../button')

class PluginInstance extends PureComponent {
  getValue({ field, default: defaultValue }) {
    const value = get(this.props.config.options, field)
    return typeof value !== 'undefined' ? value : defaultValue
  }

  renderField(option, idx) {
    const { field, label, hint } = option
    const common = {
      id: field,
      label,
      title: hint,
      key: idx,
      tabIndex: idx,
      name: `options.${field}`,
      onChange: this.handleChange,
      value: this.getValue(option),
      isCompact: true
    }
    switch (option.type) {
      case 'number':
        return (
          <FormField {...common}
            value={this.getValue(option).toString()}/>)
      case 'bool':
      case 'boolean':
        return <FormToggle {...common}/>
      default: // 'string' implied
        return <FormField {...common}/>
    }
  }

  get idx() {
    return (this.props.index + 1) * 100
  }

  handleInsert = () => {
    this.props.onInsert(this.props.config.plugin, this.props.config)
  }

  handleRemove = () => {
    this.props.onRemove(this.props.config)
  }

  handleChange = (data) => {
    let { config, index } = this.props
    for (const field in data) {
      set(config, field, data[field])
    }
    this.props.onChange(this.props.config.plugin, index, config)
    this.forceUpdate()
  }

  render() {
    return (
      <li className="plugin-instance">
        <fieldset>
          <FormField
            id="plugin.name"
            name="name"
            value={this.props.config.name}
            tabIndex={this.idx}
            onChange={this.handleChange}
            isCompact/>
          {this.props.guiOptions.map((option, idx) =>
            this.renderField(option, this.idx + idx + 1))}
        </fieldset>
        <ButtonGroup>
          <Button
            icon={<IconMinusCircle/>}
            onClick={this.handleRemove}/>
          <Button
            icon={<IconPlusCircle/>}
            onClick={this.handleInsert}/>
        </ButtonGroup>
      </li>
    )
  }

  static propTypes = {
    index: number,
    config: shape({
      plugin: string.isRequired,
      name: string,
      options: object
    }).isRequired,
    onRemove: func.isRequired,
    onInsert: func.isRequired,
    onChange: func.isRequired,
    guiOptions: arrayOf(shape({
      field: string.isRequired,
      required: bool,
      default: oneOfType([string, bool, number]),
      hint: string,
      type: oneOf(['string', 'bool', 'boolean', 'number']),
      label: string.isRequired
    })),
  }

  static defaultProps = {
    guiOptions: []
  }
}

module.exports = {
  PluginInstance
}
