// Public build flag only. Secrets remain exclusively on the server.
if((import.meta as unknown as {env:{VITE_PAYMENT_SANDBOX?:string}}).env.VITE_PAYMENT_SANDBOX==='true'){
 const notice=document.createElement('aside');notice.textContent='HOMOLOGAÇÃO · sem dinheiro real · progresso separado';notice.setAttribute('role','status');
 Object.assign(notice.style,{position:'fixed',top:'0',left:'0',right:'0',zIndex:'10000',background:'#fff0c0',color:'#633800',font:'bold 11px system-ui',textAlign:'center',padding:'3px',pointerEvents:'none'});document.body.append(notice);
}
