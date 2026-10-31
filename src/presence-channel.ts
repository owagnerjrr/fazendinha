/** One ordered channel for home, visit arrival, movement and action presence. */
export class PresenceChannel<T>{
 private tail:Promise<unknown>=Promise.resolve();
 constructor(private request:(payload:T)=>Promise<any>){}
 send(payload:T){const pending=this.tail.then(()=>this.request(payload));this.tail=pending.catch(()=>{});return pending;}
}
