export const FRIEND_CODE=/^[A-Z0-9]{10}$/;
export const MESSAGE_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function normalizeMessage(value:unknown):string|null{
 if(typeof value!=='string')return null;const text=value.normalize('NFC').trim();
 return text.length>0&&[...text].length<=500&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text)?text:null;
}
export function messageCursor(value:string|null){if(value===null)return null;if(!/^(0|[1-9]\d{0,18})$/.test(value)||BigInt(value)>9223372036854775807n)throw new Error('Cursor inválido.');return value;}
export const canSocialize=(accepted:boolean,blocked:boolean)=>accepted&&!blocked;
