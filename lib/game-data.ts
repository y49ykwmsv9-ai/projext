export type NationState = {
 id:string; name:string; population:number; gdp:number; industry:number; stability:number;
 military:number; relations:number; government:'democracy'|'monarchy'|'republic'|'dictatorship'|'communist'|'colonial'|'theocracy';
 capital:string; urbanization:number; literacy:number; resources:number; manpowerRate:number;
};

type Profile=Partial<NationState>;
const anchors:Record<string,Profile>={
 '840':{name:'United States',population:131.7,gdp:85.2,industry:92,military:55,stability:78,relations:10,government:'democracy',capital:'Washington',urbanization:56,literacy:96,resources:90,manpowerRate:.18},
 '276':{name:'Germany',population:69.3,gdp:65.4,industry:88,military:84,stability:62,relations:-20,government:'dictatorship',capital:'Berlin',urbanization:67,literacy:99,resources:76,manpowerRate:.23},
 '250':{name:'France',population:41.9,gdp:58.7,industry:64,military:70,stability:67,relations:8,government:'democracy',capital:'Paris',urbanization:53,literacy:94,resources:62,manpowerRate:.2},
 '826':{name:'United Kingdom',population:47.8,gdp:72.1,industry:79,military:76,stability:82,relations:12,government:'monarchy',capital:'London',urbanization:78,literacy:97,resources:80,manpowerRate:.19},
 '643':{name:'Soviet Union',population:168.5,gdp:48.5,industry:72,military:80,stability:58,relations:-8,government:'communist',capital:'Moscow',urbanization:33,literacy:76,resources:94,manpowerRate:.26},
 '392':{name:'Japan',population:69.3,gdp:52.4,industry:76,military:82,stability:73,relations:-4,government:'monarchy',capital:'Tokyo',urbanization:38,literacy:91,resources:34,manpowerRate:.25},
 '156':{name:'China',population:519,gdp:29,industry:28,military:58,stability:45,relations:2,government:'republic',capital:'Nanjing',urbanization:11,literacy:30,resources:71,manpowerRate:.24},
 '203':{name:'Czechoslovakia',population:15.2,gdp:36.8,industry:74,military:67,stability:75,relations:5,government:'democracy',capital:'Prague',urbanization:42,literacy:95,resources:78,manpowerRate:.22},
 '380':{name:'Italy',population:42.9,gdp:45,industry:58,military:68,stability:69,relations:0,government:'dictatorship',capital:'Rome',urbanization:42,literacy:80,resources:38,manpowerRate:.23},
 '724':{name:'Spain',population:25,gdp:31,industry:38,military:34,stability:35,relations:0,government:'democracy',capital:'Madrid',urbanization:31,literacy:68,resources:53,manpowerRate:.22},
 '792':{name:'Turkey',population:17.7,gdp:18,industry:35,military:51,stability:67,relations:0,government:'republic',capital:'Ankara',urbanization:24,literacy:35,resources:64,manpowerRate:.25},
 '076':{name:'Brazil',population:39.9,gdp:29,industry:30,military:38,stability:60,relations:0,government:'dictatorship',capital:'Rio de Janeiro',urbanization:31,literacy:45,resources:82,manpowerRate:.2},
 '356':{name:'India',population:352.8,gdp:23,industry:23,military:42,stability:48,relations:0,government:'colonial',capital:'New Delhi',urbanization:12,literacy:12,resources:75,manpowerRate:.22},
 '036':{name:'Australia',population:6.9,gdp:14,industry:32,military:28,stability:80,relations:5,government:'monarchy',capital:'Canberra',urbanization:33,literacy:90,resources:88,manpowerRate:.2},
 '124':{name:'Canada',population:11.1,gdp:18,industry:41,military:30,stability:82,relations:8,government:'monarchy',capital:'Ottawa',urbanization:44,literacy:94,resources:86,manpowerRate:.19}
};
function hash(id:string){let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function bounded(v:number,min:number,max:number){return Math.max(min,Math.min(max,v))}
function inferredGovernment(name:string):NationState['government']{
 const n=name.toLowerCase();
 if(/soviet|union of soviet|mongol|tuvan/.test(n))return 'communist';
 if(/kingdom|empire|japan|belgium|netherlands|sweden|norway|denmark|romania|yugoslavia|greece/.test(n))return 'monarchy';
 if(/colony|india|burma|ceylon|palestine|rhodesia|nigeria|kenya|gold coast/.test(n))return 'colonial';
 if(/germany|italy|portugal|hungary|austria/.test(n))return 'dictatorship';
 if(/iran|saudi|yemen/.test(n))return 'monarchy';
 return 'republic';
}
export function makeNation(id:string,name:string):NationState{
 const a=anchors[id]??{},h=hash(id);
 const population=a.population??bounded(.3+(h%180)/2,0.4,90);
 const gdp=a.gdp??bounded(2+(h%500)/10,2,50);
 const industry=a.industry??bounded(16+h%67,12,82);
 const government=a.government??inferredGovernment(name);
 return {
  id,name:a.name??name,population,gdp,industry,
  stability:a.stability??bounded(42+h%42,30,90),
  military:a.military??bounded(14+h%68,10,82),
  relations:a.relations??((h%41)-20),government,
  capital:a.capital??name.split(' ')[0]??name,
  urbanization:a.urbanization??bounded(8+h%62,5,78),
  literacy:a.literacy??bounded(18+h%76,10,98),
  resources:a.resources??bounded(25+h%71,15,96),
  manpowerRate:a.manpowerRate??bounded(.16+(h%12)/100,.15,.29)
 };
}
export const START_DATE='1936-01-01';