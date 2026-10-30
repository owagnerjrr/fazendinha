export type Wallet={coins:number;coinDebt?:number};
/** Refunds never make spendable coins negative. Future earnings settle the recorded debt. */
export function settleCoinDebt(f:Wallet){const debt=Math.max(0,f.coinDebt??0),paid=Math.min(debt,f.coins);if(paid){f.coins-=paid;f.coinDebt=debt-paid;}return f;}
export function applyCoinDelta(f:Wallet,delta:number){if(!Number.isSafeInteger(delta))throw Error('Invalid coin delta');if(delta>=0){f.coins+=delta;settleCoinDebt(f);}else{const taken=Math.min(f.coins,-delta);f.coins-=taken;f.coinDebt=(f.coinDebt??0)-delta-taken;}return f;}
