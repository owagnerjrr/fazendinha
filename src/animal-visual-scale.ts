import type{Definition}from'./studio-schema';import{rabbitDefinition}from'./rabbit-content';
/** World scale is independent of sprite-sheet dimensions and never changes saved age. */
export function studioVisualScale(d:Definition,sleeping=false){const builtinRabbit=rabbitDefinition(d)&&!d.data.sprite&&!d.data.animations,base=builtinRabbit?.44:1.1;return{x:base,y:sleeping?base*(.8/1.1):base,labelHeight:builtinRabbit?40:56,touchHeight:builtinRabbit?16:22};}
