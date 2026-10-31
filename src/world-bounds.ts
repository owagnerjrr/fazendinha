/** Keep the whole physics body inside the server's accepted foot coordinates.
 * Arcade clamps the body, not the sprite origin; leave room for its foot offset.
 * The south portal (750,1040) and legacy southern facilities stay reachable.
 */
export const WORLD_BOUNDS={x:100,y:180,width:1380,height:890} as const;
