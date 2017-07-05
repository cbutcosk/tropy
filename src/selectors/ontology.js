'use strict'

const { createSelector: memo } = require('reselect')
const { entries, values } = Object
const { by } = require('../collate')
const { compose, filter, into, map } = require('transducers.js')
const { get } = require('../common/util')

const getAllProperties = memo(
  ({ ontology }) => ontology.props,
  (props) => values(props).sort(by('id'))
)

const getVocabs = memo(
  ({ ontology }) => ontology.vocab,
  ({ ontology }) => ontology.props,
  ({ ontology }) => ontology.class,
  (vocab, props, klass) => into(
    [],
    map(kv => ({
      ...kv[1],
      classes: kv[1].classes.map(id => klass[id]),
      properties: kv[1].properties.map(id => props[id])
    })),
    vocab
  )
)

const getAllTemplates = memo(
  ({ ontology }) => ontology.template,
  ({ ontology }) => ontology.props,

  (templates, props) =>
    entries(templates)
      .reduce((tpl, [k, v]) => {
        tpl[k] = {
          ...v,
          fields: v.fields.map(field => ({
            ...field,
            property: props[field.property] || { id: field.property }
          }))
        }

        return tpl

      }, {}))


const getTemplatesByType = (type) => memo(
  getAllTemplates,
  (templates) => into(
    [],
    compose(
      map(kv => kv[1]),
      filter(t => t.type === type)),
    templates
  ).sort(by('name', 'id'))
)

const getTemplates = memo(
  getAllTemplates, (templates) => values(templates).sort(by('name', 'id'))
)

const getTemplateFields = ({ ontology }, props) =>
  get(ontology.template, [props.id, 'fields'], [])

const getTemplateField = memo(
  getTemplateFields,
  (_, props) => props.field,
  (fields, id) => {
    const idx = fields.findIndex(f => f.id === id)
    return { idx, field: fields[idx] }
  }
)


module.exports = {
  getAllProperties,
  getAllTemplates,
  getItemTemplates: getTemplatesByType('item'),
  getPhotoTemplates: getTemplatesByType('photo'),
  getTemplateField,
  getTemplateFields,
  getTemplates,
  getVocabs
}
