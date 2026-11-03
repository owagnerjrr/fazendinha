/** Move existing controls without replacing nodes, handlers or command validation. */
export function compactAnimalCard(root:HTMLElement){
 const body=root.querySelector<HTMLElement>(':scope > div');if(!body)return;
 let details=body.querySelector<HTMLDetailsElement>(':scope > .animal-management');
 if(!details){details=document.createElement('details');details.className='animal-management';details.innerHTML='<summary>Nome e localização</summary>';body.append(details);}
 details.querySelector('summary')!.textContent='Nome e localização';
 for(const selector of ['[data-autonomy]','[data-pet-mode]','[data-save-pet-mode]','[data-animal-house]','[data-animal-pen]','[data-move-animal]','[data-animal-name]','[data-rename]']){
  const node=body.querySelector<HTMLElement>(selector);if(node&&!details.contains(node))details.append(node.closest('label')??node);
 }
 const options=document.createElement('div');options.className='animal-options-grid';
 for(const node of Array.from(details.children))if(node.tagName!=='SUMMARY')options.append(node);
 details.append(options);
 for(const select of Array.from(body.querySelectorAll(':scope > select, :scope > .animal-life-details > select'))){const button=select.nextElementSibling;if(button?.tagName==='BUTTON')options.append(select,button);}
 const actions=document.createElement('div');actions.className='animal-care-actions';actions.setAttribute('aria-label','Cuidados e atividades');
 for(const node of Array.from(body.children))if(node.tagName==='BUTTON'||node.matches('label:has([data-fish-choice])'))actions.append(node);
 const ordered=['[data-feed]','[data-water-animal]','[data-clean-animal]','[data-treat-animal]','[data-pet-animal]','[data-play-animal]','[data-walk-animal]'].map(selector=>actions.querySelector(selector)).filter((node):node is Element=>!!node);
 for(const node of Array.from(actions.children))if(!ordered.includes(node))ordered.push(node);actions.append(...ordered);
 if(actions.childElementCount)body.insertBefore(actions,body.querySelector(':scope > .animal-life-details')??details);
}
