import type{Definition}from'./studio-schema.js';import{uuid}from'./studio-schema.js';
/** The southern fields are part of the farm's outdoor environment. */
export function petAllowed(d:Definition,room:string){const rooms=d.data.environments as string[]|undefined;return !rooms||rooms.includes(room)||room==='expansion'&&rooms.includes('farm')||rooms.includes('scene')&&uuid(room);}
