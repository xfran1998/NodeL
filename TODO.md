  ---                                                                                                                                                                                                                                                                       
  High Impact, Relatively Quick Wins                                                                                                                                                                                                                                           
  1. Save / Load (biggest gap)                                                                                                                                                                                 Right now every page refresh wipes the canvas. Persisting to localStorage would make the tool actually usable for building anything non-trivial. Exporting / importing as JSON would let users share their programs.                                                      

  2. Share via URL
  Encode the flow as a compressed base64 JSON in the URL hash. One link = shareable program. Very high value for a public project.

  3. Searchable context menu
  With 16+ node types the right-click menu will get unwieldy. A text input that filters nodes as you type (like UE's node picker) would scale much better.

  ---
  Core Missing Capabilities

  4. Array nodes
  push, pop, length, get[i], set[i] — without arrays you can't build most real algorithms. This is the single biggest gap in expressiveness right now.

  5. Proper type system on edges
  Currently all data edges are typed as 'any'. Giving pins real types (number, string, boolean, array) with color-coded wires would catch misconnections visually before runtime — exactly like Blueprints do.

  6. Break / Continue nodes
  Loops are there but you can't exit them early. These are small nodes but complete the control flow story.

  ---
  Developer Experience

  7. Execution visualization
  Highlight the currently-executing node and animate the active wire. This is the feature that would make the app feel alive and educational — and it's surprisingly achievable because the transpiler already walks the graph sequentially.

  8. Variable inspector
  Show live values of all Set variables in a sidebar while the program runs. Closes the feedback loop between the visual graph and runtime state.

  9. Comment / Group nodes
  Resizable "frame" nodes (like UE's comment boxes) that let you label regions of the canvas. Essential once flows grow beyond ~10 nodes.
