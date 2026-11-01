import{CARE_REFERENCE_MINUTES}from'./animal-defaults';
import type{Definition,StudioKind}from'./studio-schema';
export type CreationTemplate={id:string;icon:string;title:string;hint:string;definition:Definition};
const animal=['wander','follow','pet','play','feed','water','clean','heal'];
export function creationDefaults(kind:StudioKind):Definition{
 const data:Record<StudioKind,Record<string,unknown>>={animal:{shape:'long',speed:35,careMinutes:CARE_REFERENCE_MINUTES},item:{action:'feed',effect:100},crop:{growthSeconds:120,yield:3},cosmetic:{shirtColor:'#507e98'},model:{style:'cap',skin:2,hair:1,shirt:1},building:{function:'decoration',widthTiles:1,heightTiles:1},scene:{width:20,height:16,spawnX:5,spawnY:8,cells:[{x:5,y:14,type:'door',destination:'farm'}]},shop:{products:[]},config:{minuteMs:1000},bundle:{contents:[]}};
 return{kind,name:'',description:'',price:100,sellPrice:0,color:'#8e9270',behaviors:kind==='animal'?[...animal]:[],dependencies:[],data:structuredClone(data[kind])};
}
function template(id:string,icon:string,title:string,hint:string,kind:StudioKind,name:string,data:Record<string,unknown>,color='#8e9270',price=100,sellPrice=0):CreationTemplate{
 return{id,icon,title,hint,definition:{...creationDefaults(kind),name,color,price,sellPrice,data:{...creationDefaults(kind).data,...data}}};
}
export function creationTemplates():CreationTemplate[]{
 const cells:Record<string,unknown>[]=[];
 for(let y=2;y<14;y++){cells.push({x:5,y,type:'path'});}
 for(let y=4;y<9;y++)for(let x=12;x<17;x++)cells.push({x,y,type:'water',fishing:true});
 for(let y=10;y<13;y++)for(let x=9;x<13;x++)cells.push({x,y,type:'crop'});
 for(const[x,y]of[[2,2],[9,2],[18,2],[2,12],[17,12]])cells.push({x,y,type:'tree'});
 cells.push({x:5,y:14,type:'door',destination:'farm'},{x:6,y:8,type:'lamp'});
 return[
 template('rabbit','🐇','Coelho','Já anda, acompanha, aceita carinho, brincadeira, comida e água.','animal','Meu coelho',{shape:'long'},'#a79b84'),
 template('bird','🐦','Ave','Base de ave com patas, cuidados e movimentos próprios.','animal','Minha ave',{shape:'bird',speed:28},'#bc9055'),
 template('pet','🐾','Animal de orelhas curtas','Escolha nome e cor; os cuidados já vêm configurados.','animal','Meu bichinho',{shape:'short'},'#9c7655'),
 template('food','🥕','Alimento para animais','Uma porção repõe a alimentação de um animal compatível.','item','Meu alimento',{action:'feed',effect:100},'#c28b4a',20),
 template('medicine','🌿','Defensivo para plantas','Prepara uma dose para usar no borrifador existente.','item','Meu defensivo',{action:'plantMedicine',portions:1},'#688844',30),
 template('crop','🌱','Planta para cultivar','Semente, rega, crescimento, colheita e venda configurados.','crop','Minha planta',{growthSeconds:120,yield:3},'#c29950',15,8),
 template('shirt','👕','Roupa por cor','Funciona sem enviar imagem; escolha a cor do tecido.','cosmetic','Minha roupa',{shirtColor:'#507e98'},'#507e98',80),
 template('model','🧑‍🌾','Aparência de personagem','Escolha cabelo, pele e cores sobre os modelos suportados.','model','Minha aparência',{},'#88765a',100),
 template('garden','🌾','Horta','Área de cultivo de 2 × 2 para posicionar num cenário criado.','building','Minha horta',{function:'garden',widthTiles:2,heightTiles:2},'#8c754b',100),
 template('decoration','🏡','Decoração','Objeto para posicionar; imagens próprias são opcionais.','building','Minha decoração',{function:'decoration'},'#a8875b',80),
 template('pond','🏞️','Bosque com lago','Mapa pronto com pesca, horta, árvores, caminho e volta à fazenda.','scene','Meu bosque',{width:20,height:16,spawnX:5,spawnY:8,cells,entry:'menu'},'#82985b',0),
 template('empty-scene','🗺️','Cenário livre','Comece com terreno e porta de volta; pinte o que quiser.','scene','Meu cenário',{},'#82985b',0)
 ];
}
