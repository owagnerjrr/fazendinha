import type {Avatar} from './content';
/** A costume model, never a rewrite of the player's saved customization. */
export function outfitAppearance(avatar:Avatar):Avatar{return avatar.outfit==='forest'?{...avatar,style:'short',hair:5}:avatar;}
