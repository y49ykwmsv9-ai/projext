export type NationState = { id:string; name:string; population:number; gdp:number; industry:number; stability:number; military:number; relations:number };
const anchors: Record<string, Partial<NationState>> = {
 '840':{name:'United States',population:131.7,gdp:85.2,industry:92,military:55,stability:78,relations:10},
 '276':{name:'Germany',population:69.3,gdp:65.4,industry:88,military:84,stability:62,relations:-20},
 '250':{name:'France',population:41.9,gdp:58.7,industry:64,military:70,stability:67,relations:8},
 '826':{name:'United Kingdom',population:47.8,gdp:72.1,industry:79,military:76,stability:82,relations:12},
 '643':{name:'Soviet Union',population:168.5,gdp:48.5,industry:72,military:80,stability:58,relations:-8},
 '392':{name:'Japan',population:69.3,gdp:52.4,industry:76,military:82,stability:73,relations:-4},
 '156':{name:'China',population:519.0,gdp:29.0,industry:28,military:58,stability:45,relations:2},
 '203':{name:'Czechoslovakia',population:15.2,gdp:36.8,industry:74,military:67,stability:75,relations:5}
};
function hash(id:string){let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;return h}
export function makeNation(id:string,name:string):NationState{const a=anchors[id]??{},h=hash(id);return{id,name:a.name??name,population:a.population??(.2+h%120),gdp:a.gdp??(2+h%45),industry:a.industry??(18+h%63),stability:a.stability??(42+h%45),military:a.military??(12+h%70),relations:a.relations??((h%41)-20)}}
export const START_DATE='1936-01-01';
