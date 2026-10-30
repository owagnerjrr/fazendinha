/// <reference types="vite/client" />
import '../src/style.css';import {mountChat} from '../src/chat-ui';
if(!import.meta.env.DEV)throw Error('Somente prévia local.');
const root=document.getElementById('qa-chat')!;const messages=[{id:'1',body:'Olá! Pode visitar minha fazenda 🌱',mine:false,at:Date.now()-60000},{id:'2',body:'Vou levar sementes de cenoura!',mine:true,at:Date.now()-30000}];
mountChat(root,{code:'QAVISUAL01',chatRequest:async(path='',input?:any)=>input?{message:{id:String(messages.length+1),body:input.body,mine:true,at:Date.now()}}:{friend:{name:'QA vizinho',code:'QAVISUAL02'},messages:path.includes('after=')?[]:messages,more:false}},'QAVISUAL02',()=>{});
