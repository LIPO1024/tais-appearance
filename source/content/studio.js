/* TAIS Glass 1.3 studio: 12 visual presets, local backgrounds, paper and form controls. */
TG_VERSION='2.4.0';
function tgMigrate130(){
 if(getPref('migration-130')===true)return;
 const lower=(k,threshold,value)=>{const n=Number(getPref(k));if(!Number.isFinite(n)||n>=threshold)setPref(k,value);};
 lower('popup-opacity',90,82);lower('input-opacity',82,64);lower('sidebar-opacity',15,18);lower('panel-opacity',10,12);
 lower('card-opacity',30,46);lower('ai4paper-opacity',45,50);
 const defaults={'metadata-opacity':24,'metadata-focus-opacity':68,'paper-tolerance':12,'paper-mode':'native-glass','reader-background':'glass','reader-gradient':'mist','reader-background-fit':'cover','reader-background-opacity':30,'reader-background-blur':20,'reader-background-brightness':100,'keep-inactive':true,'saved-profiles':'[]'};
 for(const [k,v]of Object.entries(defaults))if(getPref(k)===undefined||getPref(k)===null)setPref(k,v);
 setPref('migration-130',true);
 micalog('TAIS 1.3: one-time appearance migration completed; user library and annotations untouched');
}

Object.assign(TG_NUM,{
 'interface-text-size':{label:'界面正文与元数据',section:'type',value:15,min:10,max:24,unit:'px',css:'--tg-ui-font'},
 'annotation-text-size':{label:'批注正文',section:'type',value:16,min:10,max:24,unit:'px',css:'--tg-annotation-font'},
 'annotation-leading':{label:'批注行距',section:'type',value:160,min:140,max:190,unit:'%',css:'--tg-annotation-leading-percent'},
 'dark-window-opacity':{label:'深色 · 窗口底色',section:'surface',value:32,min:0,max:90,unit:'%',css:'--tg-dark-window-requested'},
 'native-paper-opacity':{label:'纸底不透明度',section:'reader',value:72,min:12,max:98,unit:'%',css:'--tg-native-paper-alpha'},
 'metadata-opacity':{label:'元数据 · 平时底色',section:'surface',value:24,min:0,max:100,unit:'%',css:'--tg-metadata-alpha'},
 'metadata-focus-opacity':{label:'元数据 · 输入时底色',section:'surface',value:36,min:30,max:100,unit:'%',css:'--tg-metadata-focus-alpha'},
 'paper-opacity':{label:'旧版纸面透明度（已停用）',section:'reader',value:100,min:100,max:100,unit:'%',css:'--tg-paper-alpha',hidden:true},
 'paper-tolerance':{label:'旧版纸色识别范围（已停用）',section:'reader',value:12,min:2,max:24,unit:'级',css:'--tg-paper-tolerance',hidden:true},
 'reader-background-opacity':{label:'阅读背景强度',section:'reader',value:32,min:0,max:65,unit:'%',css:'--tg-bg-alpha'},
 'reader-background-blur':{label:'阅读背景模糊',section:'reader',value:20,min:0,max:40,unit:'px',css:'--tg-bg-blur'},
 'reader-background-brightness':{label:'阅读背景亮度',section:'reader',value:100,min:60,max:140,unit:'%',css:'--tg-bg-brightness'}
});
Object.assign(TG_NUM['pdf-surround-opacity'],{value:8,min:0,max:40});
Object.assign(TG_NUM['input-opacity'],{value:56,min:10});Object.assign(TG_NUM['popup-opacity'],{value:72,min:45});Object.assign(TG_NUM['ai4paper-opacity'],{value:50,min:20});Object.assign(TG_NUM['dialog-opacity'],{value:72,min:40});
Object.assign(TG_ENUM,{'interface-type-mode':['custom','native'],'annotation-type-mode':['custom','native'],'reader-dark-mode':['native','preserve'],'paper-mode':['native-glass','background-only'],'reader-background':['glass','builtin','gradient','image'],'reader-gradient':['mist','forest','sand','night','violet'],'reader-background-fit':['cover','contain','tile']});
TG_BOOLS['readable-ui']=true;TG_BOOLS['ui-bold-text']=false;TG_BOOLS['keep-inactive']=true;TG_BOOLS['paper-follow-surround']=false;
for(const [k,v] of Object.entries(TG_NUM)){GLASS_NUMBERS[k]=v.value;VARS[k]=v.css;}
for(const [k,v] of Object.entries(TG_BOOLS))GLASS_FLAGS[k]=v;
var tg130Get=tgGet;tgGet=function(k){const v=tg130Get(k);return v!==undefined?v:({'paper-mode':'native-glass','reader-background':'glass','reader-gradient':'mist','reader-background-fit':'cover'})[k];};
var TG_TEMPLATES=[
  {
    "id": "crystal",
    "name": "日光 · 轻透",
    "description": "清透玻璃 / 轻盈工作区",
    "tone": "#f2f7fc",
    "theme": "light",
    "values": {
      "light-tint": "#f2f7fc",
      "accent-color": "#436b8e",
      "window-opacity": 12,
      "sidebar-opacity": 22,
      "panel-opacity": 10,
      "toolbar-opacity": 18,
      "card-opacity": 40,
      "reader-card-opacity": 48,
      "metadata-opacity": 30,
      "metadata-focus-opacity": 48,
      "input-opacity": 48,
      "popup-opacity": 76,
      "dialog-opacity": 48,
      "ai4paper-opacity": 42,
      "border-opacity": 13,
      "corner-radius": 6
    },
    "family": "清透"
  },
  {
    "id": "balanced",
    "name": "银雾 · 均衡",
    "description": "清透玻璃 / 轻盈工作区",
    "tone": "#e3e8ef",
    "theme": "light",
    "values": {
      "light-tint": "#e3e8ef",
      "accent-color": "#536b87",
      "window-opacity": 24,
      "sidebar-opacity": 38,
      "panel-opacity": 20,
      "toolbar-opacity": 28,
      "card-opacity": 56,
      "reader-card-opacity": 64,
      "metadata-opacity": 30,
      "metadata-focus-opacity": 48,
      "input-opacity": 62,
      "popup-opacity": 76,
      "dialog-opacity": 48,
      "ai4paper-opacity": 58,
      "border-opacity": 20,
      "corner-radius": 9
    },
    "family": "清透"
  },
  {
    "id": "ice",
    "name": "冰川 · 冷光",
    "description": "清透玻璃 / 轻盈工作区",
    "tone": "#d7edf4",
    "theme": "light",
    "values": {
      "light-tint": "#d7edf4",
      "accent-color": "#236780",
      "window-opacity": 18,
      "sidebar-opacity": 31,
      "panel-opacity": 15,
      "toolbar-opacity": 23,
      "card-opacity": 50,
      "reader-card-opacity": 58,
      "metadata-opacity": 30,
      "metadata-focus-opacity": 48,
      "input-opacity": 58,
      "popup-opacity": 76,
      "dialog-opacity": 48,
      "ai4paper-opacity": 52,
      "border-opacity": 17,
      "corner-radius": 8
    },
    "family": "清透"
  },
  {
    "id": "warm",
    "name": "暖纸 · 长读",
    "description": "柔光玻璃 / 温和阅读",
    "tone": "#f0dfc6",
    "theme": "light",
    "values": {
      "light-tint": "#f0dfc6",
      "accent-color": "#835d39",
      "window-opacity": 32,
      "sidebar-opacity": 46,
      "panel-opacity": 28,
      "toolbar-opacity": 35,
      "card-opacity": 64,
      "reader-card-opacity": 72,
      "metadata-opacity": 30,
      "metadata-focus-opacity": 48,
      "input-opacity": 72,
      "popup-opacity": 84,
      "dialog-opacity": 48,
      "ai4paper-opacity": 64,
      "border-opacity": 18,
      "corner-radius": 11
    },
    "family": "柔光"
  },
  {
    "id": "sage",
    "name": "林间 · 静读",
    "description": "柔光玻璃 / 温和阅读",
    "tone": "#dce9d8",
    "theme": "light",
    "values": {
      "light-tint": "#dce9d8",
      "accent-color": "#3e6650",
      "window-opacity": 25,
      "sidebar-opacity": 37,
      "panel-opacity": 19,
      "toolbar-opacity": 28,
      "card-opacity": 55,
      "reader-card-opacity": 63,
      "metadata-opacity": 30,
      "metadata-focus-opacity": 48,
      "input-opacity": 64,
      "popup-opacity": 76,
      "dialog-opacity": 48,
      "ai4paper-opacity": 56,
      "border-opacity": 17,
      "corner-radius": 9
    },
    "family": "柔光"
  },
  {
    "id": "lavender",
    "name": "鸢尾 · 注释",
    "description": "柔光玻璃 / 温和阅读",
    "tone": "#e6dcf0",
    "theme": "light",
    "values": {
      "light-tint": "#e6dcf0",
      "accent-color": "#72588f",
      "window-opacity": 29,
      "sidebar-opacity": 43,
      "panel-opacity": 24,
      "toolbar-opacity": 32,
      "card-opacity": 63,
      "reader-card-opacity": 71,
      "metadata-opacity": 30,
      "metadata-focus-opacity": 48,
      "input-opacity": 70,
      "popup-opacity": 82,
      "dialog-opacity": 48,
      "ai4paper-opacity": 62,
      "border-opacity": 24,
      "corner-radius": 12
    },
    "family": "柔光"
  },
  {
    "id": "graphite",
    "name": "石墨 · 均衡",
    "description": "专业玻璃 / 清晰操作",
    "tone": "#20262f",
    "theme": "dark",
    "values": {
      "dark-tint": "#20262f",
      "accent-color": "#a7c3df",
      "dark-window-opacity": 44,
      "sidebar-opacity": 46,
      "panel-opacity": 42,
      "toolbar-opacity": 40,
      "card-opacity": 48,
      "reader-card-opacity": 56,
      "metadata-opacity": 36,
      "metadata-focus-opacity": 58,
      "input-opacity": 56,
      "popup-opacity": 76,
      "dialog-opacity": 54,
      "ai4paper-opacity": 48,
      "border-opacity": 18,
      "corner-radius": 8
    },
    "family": "专业"
  },
  {
    "id": "ocean",
    "name": "深海 · 清晰",
    "description": "专业玻璃 / 清晰操作",
    "tone": "#112b3d",
    "theme": "dark",
    "values": {
      "dark-tint": "#112b3d",
      "accent-color": "#9ed2e9",
      "dark-window-opacity": 43,
      "sidebar-opacity": 50,
      "panel-opacity": 44,
      "toolbar-opacity": 42,
      "card-opacity": 52,
      "reader-card-opacity": 60,
      "metadata-opacity": 36,
      "metadata-focus-opacity": 58,
      "input-opacity": 62,
      "popup-opacity": 76,
      "dialog-opacity": 54,
      "ai4paper-opacity": 54,
      "border-opacity": 25,
      "corner-radius": 9
    },
    "family": "专业"
  },
  {
    "id": "midnight",
    "name": "黑匣 · 低亮",
    "description": "舞台玻璃 / 收敛外围",
    "tone": "#111822",
    "theme": "dark",
    "values": {
      "dark-tint": "#111822",
      "accent-color": "#b8c7da",
      "dark-window-opacity": 49,
      "sidebar-opacity": 54,
      "panel-opacity": 47,
      "toolbar-opacity": 44,
      "card-opacity": 56,
      "reader-card-opacity": 64,
      "metadata-opacity": 36,
      "metadata-focus-opacity": 58,
      "input-opacity": 67,
      "popup-opacity": 79,
      "dialog-opacity": 54,
      "ai4paper-opacity": 62,
      "border-opacity": 15,
      "corner-radius": 6
    },
    "family": "舞台"
  },
  {
    "id": "reading",
    "name": "琥珀 · 夜读",
    "description": "舞台玻璃 / 收敛外围",
    "tone": "#30271f",
    "theme": "dark",
    "values": {
      "dark-tint": "#30271f",
      "accent-color": "#e7c69b",
      "dark-window-opacity": 46,
      "sidebar-opacity": 51,
      "panel-opacity": 44,
      "toolbar-opacity": 42,
      "card-opacity": 54,
      "reader-card-opacity": 62,
      "metadata-opacity": 36,
      "metadata-focus-opacity": 58,
      "input-opacity": 66,
      "popup-opacity": 78,
      "dialog-opacity": 54,
      "ai4paper-opacity": 58,
      "border-opacity": 20,
      "corner-radius": 10
    },
    "family": "舞台"
  },
  {
    "id": "mist-photo",
    "name": "丝绒 · 静读",
    "description": "舞台玻璃 / 收敛外围",
    "tone": "#2d2537",
    "theme": "dark",
    "values": {
      "dark-tint": "#2d2537",
      "accent-color": "#cdb8e5",
      "dark-window-opacity": 45,
      "sidebar-opacity": 49,
      "panel-opacity": 42,
      "toolbar-opacity": 40,
      "card-opacity": 52,
      "reader-card-opacity": 60,
      "metadata-opacity": 36,
      "metadata-focus-opacity": 58,
      "input-opacity": 63,
      "popup-opacity": 76,
      "dialog-opacity": 54,
      "ai4paper-opacity": 56,
      "border-opacity": 21,
      "corner-radius": 11
    },
    "family": "舞台"
  },
  {
    "id": "high-contrast",
    "name": "曜石 · 强对比",
    "description": "专业玻璃 / 清晰操作",
    "tone": "#0d1218",
    "theme": "dark",
    "values": {
      "dark-tint": "#0d1218",
      "accent-color": "#d9e7f7",
      "dark-window-opacity": 55,
      "sidebar-opacity": 62,
      "panel-opacity": 57,
      "toolbar-opacity": 54,
      "card-opacity": 66,
      "reader-card-opacity": 74,
      "metadata-opacity": 36,
      "metadata-focus-opacity": 58,
      "input-opacity": 84,
      "popup-opacity": 92,
      "dialog-opacity": 76,
      "ai4paper-opacity": 78,
      "border-opacity": 34,
      "corner-radius": 5
    },
    "family": "专业"
  }
];
tgPreset=function(name){
 if(name==='clear')name='crystal';if(name==='reset')name='balanced';if(name==='solid')name='high-contrast';
 const preset=TG_TEMPLATES.find(t=>t.id===name);if(!preset)throw new Error('未知模板');
 const base={'material':'acrylic','glass-theme':preset.theme,'light-tint':'#f3f6fa','dark-tint':'#202936','accent-color':'#527eb7','paper-mode':'native-glass','reader-background':'glass','reader-gradient':'mist','reader-dark-mode':'native'};
 for(const [k,n]of Object.entries(TG_NUM))base[k]=n.value;
 Object.assign(base,{'window-opacity':10,'dark-window-opacity':32,'sidebar-opacity':10,'panel-opacity':6,'toolbar-opacity':12,'card-opacity':28,'reader-card-opacity':34,'input-opacity':32,'metadata-opacity':24,'metadata-focus-opacity':36,'popup-opacity':76,'dialog-opacity':40,'ai4paper-opacity':40,'pdf-surround-opacity':8,'native-paper-opacity':72},preset.values);
 for(const [k,v]of Object.entries(base))base[k]=tgValidate(k,v);
 return base;
};
Object.assign(TGWorkbench,{snapshot:tgSnapshot,preset:tgPreset,templates:TG_TEMPLATES});
addon.workbench=TGWorkbench;
