export function setupInstall(toast:(message:string)=>void) {
  let prompt:any;
  const button=document.getElementById('install-app')!;
  window.addEventListener('beforeinstallprompt',(event:Event)=>{event.preventDefault();prompt=event;button.hidden=false;});
  button.onclick=async()=>{if(prompt){await prompt.prompt();prompt=null;button.hidden=true;}else toast('No Safari, toque em Compartilhar e Adicionar à Tela de Início.');};
  window.addEventListener('appinstalled',()=>{button.hidden=true;toast('Fazendinha instalada!');});
  if('serviceWorker' in navigator)window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js').catch(()=>{});});
}
