/* Shared, deterministic image resolver for the extension configurator.
   Material and opening must be selected together; never fall back to brick. */
(function(root){
  'use strict';
  var base='./assets/media/uitbouw-v2/';
  var materials={
    'classic-brick':{prefix:'metselwerk',colors:['rood','antraciet','geel']},
    'stuc-modern':{prefix:'stuc',colors:['wit','wit-zwart']},
    'modern-wood':{prefix:'hout',colors:['eiken','donker','zwart']},
    keralit:{prefix:'keralit',colors:['wit','zwart','antraciet','donkergroen']},
    composite:{prefix:'composiet',colors:['eiken','donker','donkerbruin','zwart']}
  };
  /* Elf puikeuzes maal zestien gevels maal drie kozijnkleuren is de hele set:
     528 renders op dezelfde woning. 'raam-2vaks-deur' is de instapkeuze en
     verving de oude dichte gevel, die op een ander basishuis was gerenderd. */
  var doors=['raam-2vaks-deur','schuifpui-300','schuifpui-400','openslaande-300','openslaande-400','harmonica-300','harmonica-400','harmonica-500','harmonica-600','dubbele-schuifpui-400','dubbele-schuifpui-500'];
  var frames=['zwart','wit','antraciet'];
  /* De set is gerenderd met een rechte dakrand. Komt er ooit een overstekserie,
     dan wisselt alleen dit achtervoegsel; de bestandsnamen dragen het al. */
  var DAKRAND='--zonder-overstek';
  function resolve(state){
    var m=materials[state.material];
    if(!m||m.colors.indexOf(state.facadeColor)<0) return null;
    if(doors.indexOf(state.accent)<0||frames.indexOf(state.frameColor)<0) return null;
    return base+'combinaties/'+m.prefix+'-'+state.facadeColor+'--'+state.accent+'--'+state.frameColor+DAKRAND+'.webp';
  }

  /* ---------- binnenbeelden ----------
     Deze series zijn besteld maar nog niet geleverd; zie
     next-growth/docs/RENDERBRIEF-UITBOUW.md. Wat er niet in AANWEZIG staat,
     levert null op en dan valt de configurator terug op de bestaande foto's.
     Zodra een beeld binnen is, komt de naam hier in de lijst. */
  /* Geleverd op 5 oktober: 33 binnenaanzichten voor de schakelaar plus 19 afwerkings-
     en installatiebeelden. Wat hier niet in staat is nog niet gemaakt. */
  var AANWEZIG={
    'aanleg--vloerverwarming':1, 'binnen--casco':1, 'binnen--luxe--houtlook-pvc':1,
    'binnen--luxe--tegels-donker':1, 'binnen--luxe--tegels-licht':1, 'binnen--luxe--visgraat-pvc':1,
    'binnen--stuc':1, 'binnen/dubbele-schuifpui-400--antraciet':1, 'binnen/dubbele-schuifpui-400--wit':1,
    'binnen/dubbele-schuifpui-400--zwart':1, 'binnen/dubbele-schuifpui-500--antraciet':1, 'binnen/dubbele-schuifpui-500--wit':1,
    'binnen/dubbele-schuifpui-500--zwart':1, 'binnen/harmonica-300--antraciet':1, 'binnen/harmonica-300--wit':1,
    'binnen/harmonica-300--zwart':1, 'binnen/harmonica-400--antraciet':1, 'binnen/harmonica-400--wit':1,
    'binnen/harmonica-400--zwart':1, 'binnen/harmonica-500--antraciet':1, 'binnen/harmonica-500--wit':1,
    'binnen/harmonica-500--zwart':1, 'binnen/harmonica-600--antraciet':1, 'binnen/harmonica-600--wit':1,
    'binnen/harmonica-600--zwart':1, 'binnen/openslaande-300--antraciet':1, 'binnen/openslaande-300--wit':1,
    'binnen/openslaande-300--zwart':1, 'binnen/openslaande-400--antraciet':1, 'binnen/openslaande-400--wit':1,
    'binnen/openslaande-400--zwart':1, 'binnen/raam-2vaks-deur--antraciet':1, 'binnen/raam-2vaks-deur--wit':1,
    'binnen/raam-2vaks-deur--zwart':1, 'binnen/schuifpui-300--antraciet':1, 'binnen/schuifpui-300--wit':1,
    'binnen/schuifpui-300--zwart':1, 'binnen/schuifpui-400--antraciet':1, 'binnen/schuifpui-400--wit':1,
    'binnen/schuifpui-400--zwart':1, 'elektra--lamppunten':1, 'elektra--radiator-1':1,
    'elektra--radiator-2':1, 'elektra--spotjes-2':1, 'elektra--spotjes-4':1,
    'elektra--spotjes-6':1, 'elektra--spotjes-8':1, 'elektra--stopcontacten-2':1,
    'elektra--stopcontacten-4':1, 'elektra--stopcontacten-6':1, 'elektra--stopcontacten-8':1,
    'klimaat--airco':1
  };
  function pad(naam){ return AANWEZIG[naam]?base+naam+'.webp':null; }
  /* Binnenafwerking: casco, stuc, of luxe met een vloerkeuze. */
  function binnen(state){
    var f=state.finish;
    /* Luxe is inclusief vloer. Vraagt de configurator geen vloersoort (de
       uitbouw doet dat niet) of staat hij nog op casco, dan is er toch een
       vloer afgesproken: dan het houtlook-beeld, niet terugvallen op de
       gevel. */
    if(f==='luxe'){
      var v=state.vloer;
      if(!v||!AANWEZIG['binnen--luxe--'+v]) v='houtlook-pvc';
      return pad('binnen--luxe--'+v);
    }
    return (f==='casco'||f==='stuc')?pad('binnen--'+f):null;
  }
  /* Een uitbouw krijgt één airco-opstelling, dus er is één beeld. Zonder airco is
     er niets te tonen wat het binnenaanzicht niet al laat zien. */
  function klimaat(state){
    var a=state.airco;
    return (!a||a==='none')?null:pad('klimaat--airco');
  }
  /* Elektra met aantallen: de klant moet ze kunnen tellen, dus er is een beeld
     per even stap tot acht. Een oneven aantal pakt het beeld eronder, boven
     acht blijft het bij acht en is het getal in de samenvatting leidend. */
  var TELBAAR={spotjes:1,'stopcontacten-binnen':1,radiator:1};
  function bucket(aantal,max){
    var n=Math.floor((parseInt(aantal,10)||1)/2)*2;
    if(n<2) n=2;
    return n>max?max:n;
  }
  function elektra(key,aantal){
    if(!key) return null;
    if(key==='radiator') return pad('elektra--radiator-'+((parseInt(aantal,10)||1)>1?2:1));
    if(TELBAAR[key]) return pad('elektra--'+(key==='stopcontacten-binnen'?'stopcontacten':key)+'-'+bucket(aantal,8));
    if(key==='lamp-punten-binnen') return pad('elektra--lamppunten');
    return null;
  }
  /* Het binnenaanzicht van de toggle hangt af van wat je vanuit de kamer ziet:
     de pui en de kozijnkleur. De gevelbekleding zit aan de buitenkant en is
     van binnen niet in beeld, dus 11 puien maal 3 kozijnkleuren dekt het. */
  function binnenAanzicht(state){
    if(doors.indexOf(state.accent)<0||frames.indexOf(state.frameColor)<0) return null;
    return pad('binnen/'+state.accent+'--'+state.frameColor);
  }
  /* Dakbedekking zie je vanuit de tuin niet; die beelden kijken van boven op het dak.
     Een lichtstraat verkoopt zich juist van binnenuit, om het licht dat hij binnenlaat. */
  function dak(state){ return state.roofing?pad('dak--'+state.roofing):null; }
  function daklicht(state){
    var l=state.skylight;
    return (!l||l==='none')?null:pad('daklicht--'+l);
  }
  function vloerverwarming(){ return pad('aanleg--vloerverwarming'); }
  function overstek(afwerking){ return pad('overstek--'+afwerking); }

  var api={resolve:resolve,binnen:binnen,binnenAanzicht:binnenAanzicht,klimaat:klimaat,elektra:elektra,
           dak:dak,daklicht:daklicht,
           vloerverwarming:vloerverwarming,overstek:overstek,
           materials:materials,doors:doors,frames:frames,aanwezig:AANWEZIG};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.NGUitbouwBeelden=api;
})(typeof window!=='undefined'?window:globalThis);
