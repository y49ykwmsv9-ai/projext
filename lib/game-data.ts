import {getWorldProfile} from './world-database';

export type NationState = {
 id:string; name:string; population:number; gdp:number; industry:number; stability:number;
 military:number; relations:Record<string,number>; government:'democracy'|'monarchy'|'republic'|'dictatorship'|'communist'|'colonial'|'theocracy'|'occupied';
 capital:string; urbanization:number; literacy:number; resourcePotential:number; manpowerRate:number; ideology:string; treasury:number; industrialCapacity:number; manpower:number; legitimacy:number; laws:string[]; technology:string[]; alliances:string[]; wars:string[]; resources:Record<string,number>; politicalGoals:string[]; strategicRegions:string[]; majorCities:string[]; historicalNotes:string;
};

type Profile=Partial<Omit<NationState,'resources'|'resourcePotential'>> & {resources?:number;resourcePotential?:number;resourcesMap?:Record<string,number>};
const anchors:Record<string,Profile>={
 '004':{name:'Afghanistan',population:12.8,gdp:1.9,industry:14,military:22,stability:48,government:'monarchy',capital:'Kabul',urbanization:6,literacy:8,resources:62,manpowerRate:.25},
 '008':{name:'Albania',population:1.0,gdp:.9,industry:12,military:18,stability:55,government:'monarchy',capital:'Tirana',urbanization:12,literacy:22,resources:48,manpowerRate:.24},
 '032':{name:'Argentina',population:12.0,gdp:15.4,industry:35,military:30,stability:62,government:'republic',capital:'Buenos Aires',urbanization:32,literacy:85,resources:78,manpowerRate:.21},
 '036':{name:'Australia',population:6.9,gdp:14,industry:32,military:28,stability:80,government:'monarchy',capital:'Canberra',urbanization:33,literacy:90,resources:88,manpowerRate:.2},
 '040':{name:'Austria',population:6.8,gdp:8.4,industry:42,military:35,stability:58,government:'dictatorship',capital:'Vienna',urbanization:52,literacy:95,resources:52,manpowerRate:.22},
 '056':{name:'Belgium',population:8.3,gdp:13.2,industry:58,military:34,stability:71,government:'monarchy',capital:'Brussels',urbanization:52,literacy:95,resources:58,manpowerRate:.2},
 '076':{name:'Brazil',population:39.9,gdp:29,industry:30,military:38,stability:60,government:'dictatorship',capital:'Rio de Janeiro',urbanization:31,literacy:45,resources:82,manpowerRate:.2},
 '124':{name:'Canada',population:11.1,gdp:18,industry:41,military:30,stability:82,government:'monarchy',capital:'Ottawa',urbanization:44,literacy:94,resources:86,manpowerRate:.19},
 '152':{name:'Chile',population:4.5,gdp:5.2,industry:28,military:26,stability:68,government:'republic',capital:'Santiago',urbanization:38,literacy:70,resources:74,manpowerRate:.21},
 '156':{name:'China',population:519,gdp:29,industry:28,military:58,stability:45,government:'republic',capital:'Nanjing',urbanization:11,literacy:30,resources:71,manpowerRate:.24},
 '170':{name:'Colombia',population:8.7,gdp:4.1,industry:20,military:24,stability:55,government:'republic',capital:'Bogota',urbanization:31,literacy:57,resources:72,manpowerRate:.22},
 '203':{name:'Czechoslovakia',population:15.2,gdp:36.8,industry:74,military:67,stability:75,government:'democracy',capital:'Prague',urbanization:42,literacy:95,resources:78,manpowerRate:.22},
 '208':{name:'Denmark',population:3.8,gdp:5.8,industry:38,military:22,stability:80,government:'monarchy',capital:'Copenhagen',urbanization:42,literacy:96,resources:54,manpowerRate:.19},
 '218':{name:'Ecuador',population:2.9,gdp:2.0,industry:16,military:20,stability:52,government:'republic',capital:'Quito',urbanization:17,literacy:55,resources:65,manpowerRate:.23},
 '250':{name:'France',population:41.9,gdp:58.7,industry:64,military:70,stability:67,government:'democracy',capital:'Paris',urbanization:53,literacy:94,resources:62,manpowerRate:.2},
 '268':{name:'Georgia',population:3.5,gdp:1.4,industry:24,military:24,stability:52,government:'republic',capital:'Tbilisi',urbanization:28,literacy:80,resources:62,manpowerRate:.23},
 '276':{name:'Germany',population:69.3,gdp:65.4,industry:88,military:84,stability:62,government:'dictatorship',capital:'Berlin',urbanization:67,literacy:99,resources:76,manpowerRate:.23},
 '300':{name:'Greece',population:6.2,gdp:3.2,industry:24,military:30,stability:55,government:'monarchy',capital:'Athens',urbanization:31,literacy:72,resources:55,manpowerRate:.23},
 '348':{name:'Hungary',population:9.0,gdp:7.4,industry:46,military:42,stability:59,government:'dictatorship',capital:'Budapest',urbanization:37,literacy:91,resources:61,manpowerRate:.23},
 '356':{name:'India',population:352.8,gdp:23,industry:23,military:42,stability:48,government:'colonial',capital:'New Delhi',urbanization:12,literacy:12,resources:75,manpowerRate:.22},
 '364':{name:'Iran',population:14.5,gdp:4.6,industry:25,military:34,stability:63,government:'monarchy',capital:'Tehran',urbanization:19,literacy:20,resources:82,manpowerRate:.24},
 '380':{name:'Italy',population:42.9,gdp:45,industry:58,military:68,stability:69,government:'dictatorship',capital:'Rome',urbanization:42,literacy:80,resources:38,manpowerRate:.23},
 '392':{name:'Japan',population:69.3,gdp:52.4,industry:76,military:82,stability:73,government:'monarchy',capital:'Tokyo',urbanization:38,literacy:91,resources:34,manpowerRate:.25},
 '398':{name:'Kazakhstan',population:6.1,gdp:3.0,industry:22,military:20,stability:58,government:'communist',capital:'Almaty',urbanization:26,literacy:86,resources:88,manpowerRate:.24},
 '410':{name:'South Korea',population:22.8,gdp:5.0,industry:25,military:28,stability:45,government:'republic',capital:'Seoul',urbanization:20,literacy:50,resources:45,manpowerRate:.23},
 '484':{name:'Mexico',population:19.7,gdp:10.5,industry:25,military:32,stability:58,government:'republic',capital:'Mexico City',urbanization:34,literacy:65,resources:80,manpowerRate:.22},
 '528':{name:'Netherlands',population:8.7,gdp:12.6,industry:50,military:28,stability:78,government:'monarchy',capital:'Amsterdam',urbanization:57,literacy:96,resources:52,manpowerRate:.19},
 '554':{name:'New Zealand',population:1.6,gdp:3.1,industry:24,military:18,stability:82,government:'monarchy',capital:'Wellington',urbanization:34,literacy:92,resources:75,manpowerRate:.2},
 '578':{name:'Norway',population:2.9,gdp:4.6,industry:31,military:22,stability:80,government:'monarchy',capital:'Oslo',urbanization:30,literacy:98,resources:82,manpowerRate:.19},
 '586':{name:'Pakistan',population:28.3,gdp:5.2,industry:19,military:35,stability:48,government:'colonial',capital:'Lahore',urbanization:13,literacy:18,resources:65,manpowerRate:.24},
 '616':{name:'Poland',population:34.0,gdp:15.5,industry:48,military:58,stability:64,government:'republic',capital:'Warsaw',urbanization:28,literacy:92,resources:67,manpowerRate:.24},
 '620':{name:'Portugal',population:7.1,gdp:4.5,industry:27,military:30,stability:61,government:'dictatorship',capital:'Lisbon',urbanization:25,literacy:60,resources:55,manpowerRate:.22},
 '642':{name:'Romania',population:19.9,gdp:8.2,industry:34,military:46,stability:57,government:'monarchy',capital:'Bucharest',urbanization:22,literacy:57,resources:78,manpowerRate:.25},
 '643':{name:'Soviet Union',population:168.5,gdp:48.5,industry:72,military:80,stability:58,government:'communist',capital:'Moscow',urbanization:33,literacy:76,resources:94,manpowerRate:.26},
 '724':{name:'Spain',population:25,gdp:31,industry:38,military:34,stability:35,government:'republic',capital:'Madrid',urbanization:31,literacy:68,resources:53,manpowerRate:.22},
 '752':{name:'Sweden',population:6.3,gdp:7.4,industry:44,military:32,stability:84,government:'monarchy',capital:'Stockholm',urbanization:36,literacy:98,resources:91,manpowerRate:.2},
 '756':{name:'Switzerland',population:4.1,gdp:7.3,industry:45,military:32,stability:87,government:'republic',capital:'Bern',urbanization:35,literacy:98,resources:50,manpowerRate:.2},
 '762':{name:'Tajikistan',population:3.0,gdp:1.0,industry:13,military:20,stability:45,government:'communist',capital:'Dushanbe',urbanization:12,literacy:75,resources:67,manpowerRate:.25},
 '764':{name:'Thailand',population:14.6,gdp:4.5,industry:19,military:29,stability:57,government:'monarchy',capital:'Bangkok',urbanization:12,literacy:45,resources:71,manpowerRate:.23},
 '792':{name:'Turkey',population:17.7,gdp:18,industry:35,military:51,stability:67,government:'republic',capital:'Ankara',urbanization:24,literacy:35,resources:64,manpowerRate:.25},
 '795':{name:'Turkmenistan',population:1.3,gdp:.8,industry:12,military:16,stability:50,government:'communist',capital:'Ashgabat',urbanization:20,literacy:80,resources:91,manpowerRate:.24},
 '800':{name:'Uganda',population:3.7,gdp:1.2,industry:11,military:14,stability:45,government:'colonial',capital:'Kampala',urbanization:5,literacy:18,resources:65,manpowerRate:.24},
 '804':{name:'Ukraine',population:30.9,gdp:10.8,industry:52,military:42,stability:55,government:'communist',capital:'Kyiv',urbanization:33,literacy:86,resources:87,manpowerRate:.25},
 '826':{name:'United Kingdom',population:47.8,gdp:72.1,industry:79,military:76,stability:82,government:'monarchy',capital:'London',urbanization:78,literacy:97,resources:80,manpowerRate:.19},
 '840':{name:'United States',population:131.7,gdp:85.2,industry:92,military:55,stability:78,government:'democracy',capital:'Washington',urbanization:56,literacy:96,resources:90,manpowerRate:.18},
 '858':{name:'Uruguay',population:1.7,gdp:2.0,industry:18,military:18,stability:72,government:'democracy',capital:'Montevideo',urbanization:35,literacy:80,resources:58,manpowerRate:.2},
 '860':{name:'Uzbekistan',population:6.3,gdp:1.7,industry:18,military:19,stability:48,government:'communist',capital:'Tashkent',urbanization:20,literacy:75,resources:76,manpowerRate:.25},
 '862':{name:'Venezuela',population:3.8,gdp:4.0,industry:18,military:24,stability:56,government:'republic',capital:'Caracas',urbanization:27,literacy:55,resources:95,manpowerRate:.22},
};
const strategicCatalog:Record<string,Partial<NationState>>={
 '203':{ideology:'Democratic Czechoslovak constitutionalism',politicalGoals:['Defend the Sudeten frontier','Maintain industrial superiority','Preserve the Little Entente'],strategicRegions:['Bohemia','Moravia','Slovakia','Carpathian Ruthenia'],majorCities:['Prague','Brno','Plzen','Bratislava','Kosice'],historicalNotes:'Industrial Central European state with a dense rail network and fortified frontiers.'},
 '276':{ideology:'National Socialist dictatorship',politicalGoals:['Rearmament','Revision of Versailles settlement','Continental strategic expansion'],strategicRegions:['Prussia','Silesia','Saxony','Bavaria','Rhineland'],majorCities:['Berlin','Hamburg','Munich','Cologne','Frankfurt'],historicalNotes:'Major industrial and military power with strong continental infrastructure.'},
 '826':{ideology:'Parliamentary constitutional monarchy',politicalGoals:['Protect maritime trade','Maintain imperial communications','Balance continental threats'],strategicRegions:['England','Scotland','Wales','Northern Ireland'],majorCities:['London','Liverpool','Manchester','Glasgow','Birmingham'],historicalNotes:'Global maritime power with extensive overseas economic connections.'},
 '840':{ideology:'Federal liberal democracy',politicalGoals:['Protect hemispheric security','Expand industrial capacity','Maintain Atlantic trade'],strategicRegions:['New England','Mid-Atlantic','Great Lakes','South','Great Plains','Mountain West','Pacific Coast'],majorCities:['Washington','New York','Chicago','Los Angeles','Detroit'],historicalNotes:'Large industrial and agricultural economy with high mobilization potential.'},
 '643':{ideology:'Marxist-Leninist one-party state',politicalGoals:['Industrialize','Secure western approaches','Expand strategic depth'],strategicRegions:['European Russia','Ukraine','Belarus','Caucasus','Central Asia','Siberia'],majorCities:['Moscow','Leningrad','Kyiv','Kharkiv','Tbilisi'],historicalNotes:'Vast continental state with exceptional manpower and natural-resource depth.'},
 '392':{ideology:'Imperial Japanese militarism',politicalGoals:['Secure resource access','Modernize armed forces','Expand regional influence'],strategicRegions:['Honshu','Hokkaido','Kyushu','Shikoku','Korea','Taiwan'],majorCities:['Tokyo','Osaka','Kyoto','Yokohama','Seoul'],historicalNotes:'Highly industrialized island empire with a powerful navy and constrained domestic resources.'},
 '156':{ideology:'Nationalist republicanism',politicalGoals:['Unify the country','Defend against foreign pressure','Modernize industry'],strategicRegions:['North China','Lower Yangtze','South China','Manchuria','Sichuan'],majorCities:['Nanjing','Shanghai','Beijing','Guangzhou','Chongqing'],historicalNotes:'Very large population spread across diverse regional economies and political centers.'},
 '250':{ideology:'Parliamentary republicanism',politicalGoals:['Defend the metropole','Maintain overseas influence','Modernize armed forces'],strategicRegions:['Ile-de-France','Normandy','Brittany','Occitania','Algeria'],majorCities:['Paris','Marseille','Lyon','Lille','Bordeaux'],historicalNotes:'Major European industrial power with extensive overseas possessions.'}
};
function hash(id:string){let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function bounded(v:number,min:number,max:number){return Math.max(min,Math.min(max,v))}
function inferredGovernment(name:string):NationState['government']{
 const n=name.toLowerCase();
 if(/soviet|north korea|mongol|tuvan/.test(n))return 'communist';
 if(/kingdom|empire|japan|belgium|netherlands|sweden|norway|denmark|romania|yugoslavia|greece|iraq|iran|afghanistan|nepal|ethiopia/.test(n))return 'monarchy';
 if(/colony|india|burma|ceylon|palestine|rhodesia|nigeria|kenya|gold coast|congo/.test(n))return 'colonial';
 if(/germany|italy|portugal|hungary|austria|spain/.test(n))return 'dictatorship';
 if(/saudi|yemen/.test(n))return 'monarchy';
 return 'republic';
}
export function makeNation(id:string,name:string):NationState{
 const db=getWorldProfile(id,name), a={...(anchors[id]??{}),...(db?{name:db.name,capital:db.capital,government:db.government,majorCities:db.cities,strategicRegions:[db.region+' Core',db.region+' Frontier'],historicalNotes:(db.notes??('Bundled world database profile for '+db.name+'.'))}:{}),...(strategicCatalog[id]??{})},h=hash(id);
 const resourcePotential=typeof a.resources==='number'?a.resources:50;
 const population=a.population??bounded(.35+(h%180)/2.2,.4,90);
 const gdp=a.gdp??bounded(.5+(h%500)/12,.5,50);
 const industry=a.industry??bounded(10+h%67,10,82);
 return {
  id,name:a.name??name,population,gdp,industry,
  stability:a.stability??bounded(40+h%48,30,90),
  military:a.military??bounded(10+h%70,8,82),
  relations:a.relations&&typeof a.relations==='object'?a.relations:{},government:a.government??inferredGovernment(name),
  capital:a.capital??(name.split(/[, ]+/)[0]||name),
  treasury:a.gdp!==undefined?a.gdp*.15:gdp*.15,industrialCapacity:industry,manpower:population*(a.manpowerRate??.22),legitimacy:65,laws:[],technology:['Agriculture','Basic Industry'],alliances:[],wars:[],
  urbanization:a.urbanization??bounded(7+h%65,5,78),
  literacy:a.literacy??bounded(18+h%76,8,98),
  resourcePotential:typeof a.resources==='number'?a.resources:50,
  manpowerRate:a.manpowerRate??bounded(.16+(h%13)/100,.15,.29),
  ideology:a.ideology??(a.government==='communist'?'State socialism':a.government==='dictatorship'?'Authoritarian nationalism':a.government==='monarchy'?'Constitutional/royal': 'Liberal republicanism'),
  politicalGoals:a.politicalGoals??['Preserve sovereignty','Develop national economy','Strengthen institutions'],
  resources:a.resourcesMap??{coal:Math.round((a.resources??50)*.8),iron:Math.round((a.resources??50)*.55),oil:Math.round((a.resources??50)*.35),food:Math.round((a.resources??50)*1.1)},
  strategicRegions:a.strategicRegions??(db?[db.region+' Core',db.region+' Frontier']:[name+' Core Territory']),
  majorCities:a.majorCities??db?.cities??[a.capital??(name.split(/[, ]+/)[0]||name)],
  historicalNotes:a.historicalNotes??('Baseline strategic profile for '+name+'.')
 };
}
export const START_DATE='1936-01-01';
