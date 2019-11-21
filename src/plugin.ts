const { selection } = figma.currentPage

function hasValidSelection(nodes) {
  return !(!nodes || nodes.length === 0)
}

const settings = [
  { format: "PNG", suffix: "-72",  constraint: { type: "WIDTH", value: 72  }},
  { format: "PNG", suffix: "-96",  constraint: { type: "WIDTH", value: 96  }},
  { format: "PNG", suffix: "-120", constraint: { type: "WIDTH", value: 120 }}, // iOS
  { format: "PNG", suffix: "-128", constraint: { type: "WIDTH", value: 128 }},
  { format: "PNG", suffix: "-144", constraint: { type: "WIDTH", value: 144 }},
  { format: "PNG", suffix: "-152", constraint: { type: "WIDTH", value: 152 }},
  { format: "PNG", suffix: "-180", constraint: { type: "WIDTH", value: 180 }}, // iOS
  { format: "PNG", suffix: "-192", constraint: { type: "WIDTH", value: 192 }}, // min
  { format: "PNG", suffix: "-384", constraint: { type: "WIDTH", value: 384 }},
  { format: "PNG", suffix: "-512", constraint: { type: "WIDTH", value: 512 }}, // min
]

async function main(nodes): Promise<string> {
  if (!hasValidSelection(nodes)) return Promise.resolve('No valid selection')

  for (let node of nodes) {
    node.exportSettings = settings
  }

  return Promise.resolve('Done!')
}

main(selection).then((res) => figma.closePlugin(res))