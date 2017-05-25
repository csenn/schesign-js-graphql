import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { generateFromClass } from '../src'

import propertyVariations from 'schesign-graph-examples/graphs/export/property_variations'
// import recursion from 'schesign-graph-examples/graphs/export/recursion'
import linkedNodes2 from 'schesign-graph-examples/graphs/export/linked_nodes_2'
import inheritanceChain2 from 'schesign-graph-examples/graphs/export/inheritance_chain_2'

const { describe, it } = global
const readSql = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', name), 'utf-8')

describe('generateFromClass()', () => {
  it('should convert propertyVariations to graphql schema', () => {
    const str = generateFromClass(
      propertyVariations.graph,
      'o/tests/property_variations/master/class/class1'
    )
    expect(str).to.deep.equal(readSql('property_variations.txt'))
  })

  it('should convert LinkedNodes to a graphql schema', () => {
    const str = generateFromClass(
      linkedNodes2.graph,
      'o/tests/linked_nodes_2/master/class/class3'
    )
    expect(str).to.deep.equal(readSql('linked_nodes.txt'))
  })

  it('should convert inheritance to a graphql schema', () => {
    const str = generateFromClass(
      inheritanceChain2.graph,
      'o/tests/inheritance_chain_2/master/class/class5'
    )
    expect(str).to.deep.equal(readSql('inheritance.txt'))
  })
})
