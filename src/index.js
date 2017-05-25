import values from 'lodash/values'
import { flattenHierarchies } from './flatten'

const INTS = [
  'Int',
  'Int8',
  'Int16',
  'Int32',
  'Int64'
]

const getTab = num => {
  let result = ''
  for (let i = 0; i < num; i++) {
    result += '  '
  }
  return result
}

function _fromEnum (context, property) {
  if (context.enums[property.label]) {
    return
  }
  let text = `enum ${property.label} {\n`
  for (const val of property.range.values) {
    text += `  ${val}\n`
  }
  text += '}'
  context.enums[property.label] = text
  return property.label
}

function _fromLinkedClassType (context, ref) {
  const classItem = context.classCache[ref]
  _generateTypeSchema(context, classItem.label, classItem.propertySpecs)
  return classItem.label
}

function _fromNestedObjectType (context, property) {
  _generateTypeSchema(context, property.label, property.range.propertySpecs)
  return property.label
}

function _getType (context, property, depth) {
  const { range } = property

  switch (range.type) {
    case 'Boolean': return 'Boolean'
    case 'Number':
      if (INTS.includes(range.format)) {
        return 'Int'
      } else {
        return 'Float'
      }
    case 'Enum':
      return _fromEnum(context, property)
    case 'LinkedClass':
      return _fromLinkedClassType(context, range.ref)
    case 'NestedObject':
      return _fromNestedObjectType(context, property)
    case 'Text':
    default:
      return 'String'
  }
}

export function _generateTypeSchema (context, label, propertySpecs) {
  if (context.types[label]) {
    return
  }

  /* Set this to prevent recursion */
  context.types[label] = true

  let schema = `type ${label} {\n`

  propertySpecs.forEach(propertySpec => {
    const property = context.propertyCache[propertySpec.ref]

    let type = propertySpec.primaryKey
      ? 'ID'
      : _getType(context, property)

    if (propertySpec.array) {
      type = `[${type}]`
    }

    if (propertySpec.required) {
      type += '!'
    }

    schema += `${getTab(1)}${property.label}: ${type}\n`
  })

  schema += `}`

  context.types[label] = schema
}

export function generateFromClass (graph, classUid, opts = {}) {
  /* Create a simple context obj to thread through */
  const context = {
    classCache: {},
    propertyCache: {},
    types: {},
    enums: {}
  }

  /* Create a dict lookup for classes and properties for speed and convenience */
  graph.forEach(node => {
    if (node.type === 'Class') {
      context.classCache[node.uid] = node
    } else if (node.type === 'Property') {
      context.propertyCache[node.uid] = node
    }
  })

  /* TODO: make this optional, use graphql interfaces */
  flattenHierarchies(context)

  const currentClass = context.classCache[classUid]
  if (!currentClass) {
    throw new Error(`Could not find class ${classUid} in graph`)
  }

  _generateTypeSchema(context, currentClass.label, currentClass.propertySpecs)

  const combined = [
    ...values(context.enums),
    ...values(context.types)
  ]

  return combined.join('\n\n')
}
