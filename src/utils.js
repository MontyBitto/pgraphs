import { Writer } from "@pinemach/csv"
export const CSVWriter = Writer

// Maps arbitrary identifier strings to enumerated identifiers
export class IDMap extends Map {
  constructor(base = "") {
    super()
    this.base = base
  }

  map(id) {
    if (this.has(id)) {
      return this.get(id)
    } else {
      const mapped = `${this.base}${this.size + 1}`
      this.set(id, mapped)
      return mapped
    }
  }
}

export const graph = (nodes, edges) => ({
  nodes: Object.keys(nodes).sort().map(id => nodes[id]),
  edges,
})

export const addProperties = (props, properties={}) => {
  for (let [key, values] of props) {
    if (key in properties) {
      if (!(properties[key] instanceof Set)) {
        properties[key] = new Set(properties[key])
      }
      for (let v of values) {properties[key].add(v)}
    } else {
      properties[key] = new Set(values)
    }
  }
  for (let key in properties) {
    if (properties[key] instanceof Set) {
      properties[key] = [...properties[key].values()]
    }
  }
  return properties
}

