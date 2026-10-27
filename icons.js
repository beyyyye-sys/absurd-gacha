import { RARITIES } from './catalog.js';

// Small original vector toys, drawn locally so the cabinet needs no image service.
// Paths deliberately share the same heavy ink and limited arcade palette.
export function itemArt(item) {
  const ink = '#293024';
  const cream = '#edf0d6';
  const orange = '#f4b08c';
  const purple = '#b8a4e5';
  const lime = '#cfe78a';
  const blue = '#a9c9d9';
  const tint = RARITIES[item.rarity]?.color || lime;
  const number = Number(item.id.replace('lp', '')) || 75;
  const tilt = (number % 5 - 2) * 3;
  const face = (x=50,y=51) => `<g stroke="${ink}" fill="${ink}"><path d="M${x-8} ${y-2}v3m16-3v3" stroke-width="3"/><path d="M${x-3} ${y+6}q3 3 6 0" fill="none" stroke-width="1.7"/></g>`;
  const label = (text,x=50,y=66,size=5) => `<text x="${x}" y="${y}" fill="${ink}" stroke="none" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="${size}">${text}</text>`;
  const body = (x,y,w,h,r=5,fill=tint) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const dot = (x,y,r=2,fill=ink) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="none"/>`;
  let art = '';
  let kind = {
    lp001:'disk',lp002:'glasses',lp003:'keyboard',lp004:'battery',lp005:'noodles',lp006:'headphones',lp007:'bin',lp008:'plant',lp009:'pancake',lp010:'mouse',lp011:'fish',lp012:'paper',lp013:'coffee',lp014:'cookie',lp015:'woodfish',lp016:'plug',lp017:'scarf',lp018:'calendar',lp019:'robot',lp020:'door',lp021:'duck',lp022:'button',lp023:'chair',lp024:'cube',lp025:'cookie',lp026:'rock',lp027:'coat',lp028:'boba',lp029:'monitor',lp030:'jar',lp031:'bug',lp032:'satellite',lp033:'slipper',lp034:'press',lp035:'clock',lp036:'torch',lp037:'tear',lp038:'mushroom',lp039:'ticket',lp040:'glasses',lp041:'battery',lp042:'octopus',lp043:'plant',lp044:'box',lp045:'compass',lp046:'robot',lp047:'tape',lp048:'cactus',lp049:'remote',lp050:'paper',lp051:'disk',lp052:'pickle',lp053:'dino',lp054:'vortex',lp055:'weather',lp056:'washer',lp057:'vortex',lp058:'eraser',lp059:'wrap',lp060:'jelly',lp061:'gift',lp062:'badge',lp063:'key',lp064:'speech',lp065:'hamster',lp066:'stapler',lp067:'megaphone',lp068:'cat',lp069:'planetbadge',lp070:'calendar',lp071:'book',lp072:'scooter','secret-logo':'screw','secret-konami':'gamepad','secret-night':'ghost','secret-404':'egg'
  }[item.id] || 'robot';
  switch(kind) {
    case 'disk':
      art=`<path d="M26 20h40l10 10v47H24V23z" fill="${tint}"/><path d="M35 20h29v23H35z" fill="${cream}"/><path d="M53 22h6v16h-6z" fill="${ink}" stroke="none"/>${body(32,51,36,25,2,cream)}<path d="M38 68h24" opacity=".4"/>${face(50,57)}`;break;
    case 'glasses':
      art=`<path d="M17 42l-3-9h13m46 0h13l-3 9" fill="none"/>${body(18,38,28,24,8,tint)}${body(54,38,28,24,8,purple)}<path d="M46 46q4-6 8 0M24 43l8 13m28-13l8 13" fill="none" stroke="${cream}" stroke-width="3"/><path d="M46 46q4-6 8 0" fill="none" stroke="${ink}"/><path d="M29 71q20 8 41-3" stroke-dasharray="3 5" fill="none"/>`;break;
    case 'keyboard':
      art=`<path d="M20 32h61l5 34-8 7H15V42z" fill="${purple}"/><path d="M20 32h61l-4 30H15z" fill="${tint}"/>${[0,1,2].map(r=>[0,1,2,3,4,5,6].map(c=>body(23+c*7.4,38+r*7,4.5,4.5,1,cream)).join('')).join('')}<path d="M36 64h25" stroke="${ink}" stroke-width="3"/>`;break;
    case 'battery':
      art=`${body(39,16,22,8,2,purple)}${body(28,24,44,53,8,tint)}${body(34,32,32,35,3,ink)}<path d="M48 35l-7 14h11l-5 13 14-20H50l5-7" fill="${orange}" stroke="none"/><path d="M36 72h7m5 0h7m5 0h4" stroke="${cream}" stroke-width="2"/>`;break;
    case 'noodles':
      art=`<path d="M20 47h60l-9 29H30z" fill="${tint}"/><ellipse cx="50" cy="47" rx="30" ry="8" fill="${cream}"/><path d="M29 47q7-9 14 0t14 0t14 0M36 47V29m7 18V28m1 0l35-12m-35 18l35-12" fill="none" stroke="${orange}"/><path d="M44 28l35-12m-35 18l35-12" stroke="${ink}"/>${face(50,62)}`;break;
    case 'headphones':
      art=`<path d="M25 58V43a25 25 0 0150 0v15" fill="none" stroke="${purple}" stroke-width="10"/><path d="M25 58V43a25 25 0 0150 0v15" fill="none"/>${body(18,44,18,29,7,tint)}${body(64,44,18,29,7,tint)}<path d="M41 57h4m10 0h4M46 65q4 3 8 0" fill="none"/><path d="M11 42l-5-4m82 4l5-4" fill="none" stroke="${orange}"/>`;break;
    case 'bin':
      art=`<path d="M29 34h43l-5 43H34z" fill="${tint}"/>${body(24,27,53,9,2,purple)}<path d="M43 26v-6h17v6M42 44v24m9-24v24m9-24v24" fill="none"/><path d="M13 32l6 7m63-21l-4 8" stroke="${orange}"/>`;break;
    case 'plant':
      art=`<path d="M35 57h32l-5 24H40z" fill="${orange}"/><path d="M50 57V31" fill="none"/><path d="M50 42C20 44 21 21 28 23c20 1 22 19 22 19zM51 35c0-20 22-26 23-18 4 14-13 21-23 18" fill="${lime}"/><path d="M50 56c-2-21 17-22 21-18 3 13-11 20-21 18" fill="${tint}"/>${face(51,65)}`;break;
    case 'pancake':
      art=`<ellipse cx="50" cy="74" rx="32" ry="8" fill="${cream}"/><path d="M24 60v7c0 12 52 12 52 0v-7" fill="${orange}"/><ellipse cx="50" cy="59" rx="26" ry="9" fill="${tint}"/><path d="M24 48v9c0 13 52 13 52 0v-9" fill="${orange}"/><ellipse cx="50" cy="47" rx="26" ry="9" fill="${cream}"/><path d="M39 41l13-6 12 5-13 7z" fill="${lime}"/><path d="M37 52v8m26-7v10" stroke="${orange}" stroke-width="5"/>`;break;
    case 'mouse':
      art=`<path d="M50 26c-22 0-23 19-23 33s9 20 23 20 23-6 23-20-1-33-23-33z" fill="${tint}"/><path d="M50 26V12q0-6 12-6" fill="none" stroke-dasharray="4 4"/><path d="M50 27v23M28 51h44" fill="none"/>${body(46,34,8,14,4,purple)}${face(50,59)}`;break;
    case 'fish':
      art=`<path d="M23 49L12 35v30l11-10c10 22 47 16 60-6-15-23-47-23-60 0z" fill="${tint}"/><path d="M49 32l9-12 7 16M44 66l11 9 8-13" fill="${purple}"/><path d="M62 37q-11 13 0 26" fill="none"/>${dot(71,45,2.5)}<path d="M69 53h6M30 45l10 4-10 5" fill="none"/>`;break;
    case 'paper':
      art=`<path d="M29 18h34l12 12v49H26V22z" fill="${cream}"/><path d="M63 18v14h12" fill="${tint}"/><path d="M35 39h26m-26 8h30m-30 8h19" stroke="#8a9875"/><circle cx="57" cy="66" r="10" fill="${orange}"/><path d="M52 66l3 3 6-7" fill="none"/>`;break;
    case 'coffee':
      art=`<path d="M69 42h6c18 0 13 25-6 21" fill="none" stroke="${purple}" stroke-width="7"/><path d="M25 37h45v30q-3 13-22 13T25 67z" fill="${tint}"/><ellipse cx="47.5" cy="37" rx="22.5" ry="6" fill="${ink}"/><path d="M38 25q-8-7 0-13m15 13q8-7 0-13" fill="none" stroke="${cream}" opacity=".7"/>${face(48,53)}<path d="M19 81h59" fill="none" stroke="${purple}"/>`;break;
    case 'cookie':
      art=`<path d="M75 43c-11 1-13-8-12-16-25-13-49 8-44 32 4 22 35 30 51 12 6-7 8-17 5-28z" fill="${orange}"/>${[ [33,38],[25,54],[57,36],[65,60],[41,70] ].map(([x,y])=>body(x,y,5,5,1,purple)).join('')}${face(46,50)}<path d="M44 25l-5 5m34 46l6 5" stroke="${tint}"/>`;break;
    case 'woodfish':
      art=`<path d="M20 55c0-19 29-29 51-15 23 16 4 36-20 36-22 0-31-5-31-21z" fill="${orange}"/><path d="M55 41l-6 21 21-9" fill="${ink}"/><path d="M20 20l48 18" stroke="${purple}" stroke-width="7"/><circle cx="20" cy="20" r="8" fill="${tint}"/>${label('+1',35,59,7)}`;break;
    case 'plug':
      art=`<path d="M39 33V17m22 16V17" fill="none" stroke="${cream}" stroke-width="6"/>${body(29,32,42,32,9,tint)}<path d="M50 64v10q0 11 20 11" fill="none" stroke="${purple}" stroke-width="5"/>${face(50,43)}<path d="M25 47l-6-5m57 5l6-5" stroke="${orange}"/>`;break;
    case 'scarf':
      art=`<path d="M27 31q25-16 48 2l-8 21-10-2 2 27H40l-2-28-18 1z" fill="${tint}"/><path d="M24 45q23-11 45 1M42 54l16-2m-17 7h17m-16 9h16M41 80v6m7-6v6m7-6v6" fill="none" stroke="${purple}" stroke-width="4"/>`;break;
    case 'calendar':
      art=`${body(23,25,55,52,5,tint)}<path d="M23 40h55M36 18v15m28-15v15" stroke="${ink}" stroke-width="4"/><path d="M29 46h42v25H29z" fill="${cream}" stroke="none"/>${label(item.id==='lp070'?'SAT':'FRI',50,63,14)}${dot(72,28,2,cream)}`;break;
    case 'robot':
      art=`<path d="M50 25V14" stroke="${purple}" stroke-width="4"/><circle cx="50" cy="12" r="5" fill="${orange}"/>${body(23,27,54,42,9,tint)}${body(31,36,38,22,5,ink)}${body(17,40,7,17,2,purple)}${body(76,40,7,17,2,purple)}<path d="M36 47h7m14 0h7" stroke="${cream}" stroke-width="4"/><path d="M45 64h10M35 70v8m29-8v8" stroke="${ink}" stroke-width="4"/>`;break;
    case 'door':
      art=`<path d="M25 16h51v65H25z" fill="${purple}"/><path d="M30 22l36 5v52l-36 4z" fill="${tint}"/>${dot(58,54,3)}<path d="M36 37h22v9H36z" fill="${ink}"/><path d="M39 41h15" stroke="${lime}" stroke-width="3"/>${label('99%',47,65,7)}`;break;
    case 'duck':
      art=`<path d="M22 52q-7 5-7-2c-8 27 26 37 49 20 8-6 1-20-3-23 12-8 8-25-4-28-15-4-26 11-18 24-8 13-12 9-17 9z" fill="${tint}"/><path d="M61 32h17l-10 9H61" fill="${orange}"/>${dot(53,30,2.4)}<path d="M32 57q6 13 20-1" fill="none"/>`;break;
    case 'button':
      art=`<ellipse cx="50" cy="69" rx="31" ry="11" fill="${purple}"/><path d="M19 59v10c0 15 62 15 62 0V59" fill="${purple}"/><ellipse cx="50" cy="58" rx="31" ry="12" fill="${cream}"/><path d="M27 44v11c0 15 46 15 46 0V44" fill="${lime}"/><ellipse cx="50" cy="44" rx="23" ry="10" fill="${tint}"/><path d="M44 44l4 4 9-8" fill="none"/>`;break;
    case 'chair':
      art=`<path d="M31 23h35v28H31z" fill="${tint}"/><path d="M25 54h47v10H25z" fill="${purple}"/><path d="M30 64l-6 20m43-20l8 20M33 28v22m31-22v22" fill="none" stroke="${cream}" stroke-width="4"/>${face(49,33)}`;break;
    case 'cube':
      art=`<path d="M22 36l30-16 28 16v32L49 84 22 67z" fill="${blue}"/><path d="M22 36l27 17 31-17M49 53v31" fill="none"/><path d="M28 39v22m25-32l17 10M57 68l17-9" fill="none" stroke="${cream}" opacity=".6"/>${dot(33,50,2)}${dot(41,55,2)}`;break;
    case 'rock':
      art=`<path d="M18 66l7-32 21-14 25 8 14 35-11 12H36z" fill="${tint}"/><path d="M25 34l21 11 25-17M46 45l-10 30m10-30l28 30" fill="none" opacity=".5"/>${face(57,46)}`;break;
    case 'coat':
      art=`<path d="M41 22l-22 12-8 26 15 5 6-15-3 31h42l-3-31 6 15 15-5-8-26-22-12z" fill="${purple}"/><path d="M41 22l9 17 9-17M50 40v40M37 56h-5m36 0h-5" fill="none"/>${dot(55,49,1.7)}${dot(55,58,1.7)}${dot(55,67,1.7)}`;break;
    case 'boba':
      art=`<path d="M43 28l9-22h6l-9 22" fill="${purple}"/><path d="M27 31h47l-7 48H34z" fill="${tint}"/><path d="M31 49h39l-4 26H35z" fill="${orange}" stroke="none"/>${body(24,25,53,9,4,cream)}${[[41,67],[50,73],[59,66],[44,57],[60,75]].map(([x,y])=>dot(x,y,3,ink)).join('')}`;break;
    case 'monitor':
      art=`${body(18,21,64,45,7,tint)}${body(24,27,52,31,4,ink)}<path d="M43 66l-3 10h20l-3-10M31 79h38" fill="none" stroke="${purple}" stroke-width="5"/><path d="M29 43q13-16 34-3l7-5v16l-8-5q-16 13-33-3z" fill="${orange}" stroke="none"/>${dot(35,42,1.4,ink)}<path d="M54 33l2-3m10 24v-3" fill="none" stroke="${lime}"/>`;break;
    case 'jar':
      art=`${body(35,16,30,11,3,purple)}<path d="M35 27v7L25 44v29q0 6 25 6t25-6V44L65 34v-7" fill="${blue}"/><path d="M32 58q17-9 35 1v12q-18 6-35 0z" fill="${purple}" stroke="none"/><path d="M50 34l4 10 11 2-9 7 1 11-9-6-10 5 3-10-8-8 12-1z" fill="${tint}"/><path d="M30 46v12" stroke="${cream}" stroke-width="3"/>`;break;
    case 'bug':
      art=`<path d="M36 37L25 26m39 11l11-11M30 47l-12-4m13 17l-12 7m50-20l12-4M69 60l12 7" fill="none"/> <ellipse cx="50" cy="55" rx="21" ry="25" fill="${tint}"/><path d="M50 38v39"/><circle cx="50" cy="28" r="10" fill="${purple}"/>${dot(46,26,1.5)}${dot(54,26,1.5)}${dot(40,51,4,orange)}${dot(60,51,4,orange)}`;break;
    case 'satellite':
      art=`<path d="M39 64l-9 16h40l-9-16" fill="${purple}"/><path d="M28 25l48 42C47 86 12 53 28 25z" fill="${tint}"/><path d="M35 33q-2 26 30 28" fill="none" stroke="${cream}" stroke-width="4"/><path d="M47 50l24-25"/><circle cx="73" cy="23" r="5" fill="${orange}"/><path d="M78 13q9 0 10 11M76 7q18-1 19 21" fill="none" stroke="${purple}" stroke-width="2"/>`;break;
    case 'slipper':
      art=`<path d="M21 60c-2 23 26 28 40 16l15-24c16-29-14-39-30-20z" fill="${tint}"/><path d="M26 57l18-6 9 13 17-24M44 51l13-16" fill="none" stroke="${purple}" stroke-width="8"/><path d="M18 83h61" stroke="${cream}" stroke-dasharray="3 5"/>`;break;
    case 'press':
      art=`<path d="M25 19h52v12H25zM29 63h45v12H29z" fill="${purple}"/><path d="M33 31v32m34-32v32M50 10v35m-8-34h16" fill="none" stroke-width="5"/><path d="M38 46h24v11H38z" fill="${tint}"/><path d="M36 58l9-5 6 6 9-5 8 9H36z" fill="${cream}"/>`;break;
    case 'clock':
      art=`${body(30,17,42,62,11,purple)}<circle cx="51" cy="43" r="18" fill="${tint}"/><path d="M51 31v13l10 6" fill="none"/><circle cx="51" cy="68" r="4" fill="${orange}"/><path d="M35 79v5m31-5v5" fill="none"/>${dot(51,43,2)}`;break;
    case 'torch':
      art=`<path d="M23 27l22-10 16 31-22 10z" fill="${tint}"/><path d="M39 58l18 27 14-8-10-29z" fill="${purple}"/><ellipse cx="34" cy="23" rx="12" ry="5" transform="rotate(-25 34 23)" fill="${cream}"/><path d="M24 15l-6-6m17 1V2m-23 26l-9-1" stroke="${lime}"/>`;break;
    case 'tear':
      art=`<path d="M50 17c-5 15-26 30-26 43a26 26 0 0052 0c0-13-21-28-26-43z" fill="${blue}"/><path d="M33 53q-6 10 0 16" fill="none" stroke="${cream}" stroke-width="4"/>${face(52,54)}<path d="M46 74h10" opacity=".5"/>`;break;
    case 'mushroom':
      art=`<path d="M42 49l-6 30q14 7 28 0l-6-30" fill="${cream}"/><path d="M16 51c-1-43 68-43 68 0q-32 15-68 0z" fill="${purple}"/><ellipse cx="50" cy="50" rx="34" ry="8" fill="${tint}"/>${dot(33,32,5,cream)}${dot(60,27,7,cream)}${dot(74,43,4,cream)}${face(50,64)}<path d="M42 11q8-6 16 0m-12 5q4-3 8 0" fill="none" stroke="${lime}" stroke-width="2"/>`;break;
    case 'ticket':
      art=`<path d="M16 29h68v15c-10 0-10 15 0 15v15H16V59c10 0 10-15 0-15z" fill="${tint}"/><path d="M65 31v10m0 5v10m0 5v10" stroke-dasharray="3 4"/><circle cx="40" cy="50" r="13" fill="${purple}"/><ellipse cx="40" cy="50" rx="20" ry="5" transform="rotate(-25 40 50)" fill="none"/>`;break;
    case 'octopus':
      art=`<path d="M27 52c-10-39 57-45 47 0l9 17q6 12-8 10l-10-15 2 15q-3 8-10 0l-6-15-3 15q-4 8-11 1l-3-16-9 14q-9 6-12-4z" fill="${tint}"/>${face(51,41)}<path d="M33 25q-11-4-14 2m50-3q10-5 14 0" fill="none" stroke="${orange}"/>`;break;
    case 'box':
      art=`<path d="M22 34l28-13 29 13v40l-30 12-27-12z" fill="${purple}"/><path d="M22 34l27 13 30-13M49 47v39" fill="none"/><path d="M36 28l28 13v18l-12 5V47L29 36z" fill="${tint}" stroke="none"/><path d="M59 65l12-5" stroke="${cream}" stroke-width="4"/>`;break;
    case 'compass':
      art=`<path d="M45 20v-7h12v7" fill="${purple}"/><circle cx="51" cy="50" r="30" fill="${tint}"/><circle cx="51" cy="50" r="24" fill="${cream}"/><path d="M51 29v5m0 32v5M30 50h5m32 0h5"/><path d="M64 34l-7 26-19 7 7-25z" fill="${purple}"/><path d="M64 34L51 50l6 10" fill="${orange}"/>${dot(51,50,3,ink)}`;break;
    case 'tape':
      art=`<ellipse cx="46" cy="43" rx="27" ry="20" fill="${tint}"/><path d="M19 43v17c0 25 54 23 54 0V43" fill="${purple}"/><ellipse cx="46" cy="43" rx="27" ry="20" fill="${tint}"/><ellipse cx="46" cy="43" rx="13" ry="9" fill="${ink}"/><path d="M72 45l17 16-1 15-19-11" fill="${tint}"/>`;break;
    case 'cactus':
      art=`<path d="M39 62V30c0-19 23-19 23 0v8h7V27h12v16q-1 9-19 9v10M39 51H26q-10 0-10-12V28h12v11h11" fill="${lime}"/><path d="M32 62h37l-6 20H38z" fill="${purple}"/><path d="M46 20v7m8 5v7M23 31v6m51-9v7" stroke="${cream}" stroke-width="2"/>${face(51,45)}`;break;
    case 'remote':
      art=`${body(31,16,39,66,9,purple)}<circle cx="50" cy="35" r="11" fill="${tint}"/><path d="M45 35h10m-5-5v10"/>${[[42,56],[58,56],[42,69],[58,69]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="4" fill="${i%2?orange:cream}"/>`).join('')}`;break;
    case 'pickle':
      art=`<path d="M31 30c12-28 35-9 28 5-12 25 22 23 13 41C61 96 28 75 32 61c5-18-9-20-1-31z" fill="${lime}"/>${face(46,29)}<path d="M38 46l4 2m10 7l-4 3m13 12l4 1M42 67l4 2" stroke="${ink}" stroke-width="3"/>`;break;
    case 'dino':
      art=`<path d="M19 66l10-25 11 21 12-5V27q-1-12 11-12h16v25H66v18q0 12-9 16l-2 10H44l2-10h-9l-5 10H21l7-15z" fill="${lime}"/><path d="M54 26l-7 3 7 7m0 5l-7 3 7 6M37 56l-6 3" fill="${purple}"/>${dot(71,23,2.5)}<path d="M68 36h11M66 48l9 4-5 5" fill="none"/><path d="M52 57q8 2 12 10" fill="none" stroke="${cream}" stroke-width="4"/>`;break;
    case 'vortex':
      art=`<ellipse cx="50" cy="48" rx="36" ry="27" transform="rotate(-20 50 48)" fill="${purple}"/><ellipse cx="50" cy="48" rx="28" ry="20" transform="rotate(-20 50 48)" fill="${tint}"/><ellipse cx="50" cy="48" rx="18" ry="14" transform="rotate(-20 50 48)" fill="${ink}"/><path d="M23 27l-7-7m62 51l8 6M48 13V5m-1 75v8" stroke="${tint}"/>${item.id==='lp057'?`<path d="M45 49v3m10-3v3" stroke="${cream}" stroke-width="3"/>`:''}`;break;
    case 'weather':
      art=`<circle cx="65" cy="31" r="15" fill="${orange}"/><path d="M64 9v-7m20 28h8M79 14l6-6" stroke="${orange}"/><path d="M24 60c-20-3-15-28 3-26 5-23 35-20 38 0 22-2 27 25 6 26z" fill="${tint}"/>${face(48,42)}<path d="M31 70l-4 9m20-9l-4 9m20-9l-4 9" stroke="${blue}" stroke-width="4"/>`;break;
    case 'washer':
      art=`${body(24,18,52,63,6,purple)}<path d="M24 33h52"/>${dot(33,26,3,orange)}${dot(44,26,2,ink)}<path d="M60 25h9"/><circle cx="50" cy="55" r="18" fill="${ink}"/><circle cx="50" cy="55" r="13" fill="${blue}"/><path d="M39 56q9-10 22 0-9 12-22 0" fill="${tint}" stroke="none"/><path d="M31 81v4m38-4v4" stroke-width="4"/>`;break;
    case 'eraser':
      art=`<path d="M16 56l38-37 31 25-38 37H37z" fill="${purple}"/><path d="M16 56l19-18 32 25-20 18H37z" fill="${tint}"/><path d="M35 38l32 25"/>${face(55,39)}<path d="M16 84h32m8 0h7m7 0h3" fill="none" stroke="${cream}"/>`;break;
    case 'wrap':
      art=`<path d="M29 26c18-19 43-1 37 14l15 30-36 16-17-38z" fill="${orange}"/><path d="M28 37l22 5 17-12 12 42-34 14z" fill="${cream}"/><path d="M36 42l16 11 18-13" fill="${lime}"/>${face(55,62)}<path d="M42 28l-2-10m9 10l2-12m7 15l5-10" stroke="${lime}" stroke-width="4"/>`;break;
    case 'jelly':
      art=`<path d="M21 49c0-40 60-40 60 0q-8-7-15 0-8-7-15 0-8-7-15 0-8-7-15 0z" fill="${purple}"/><path d="M28 51q-10 17 0 26m16-25q10 15-1 29m17-29q-10 15 0 25m14-26q10 10 0 20" fill="none" stroke="${tint}" stroke-width="4"/>${face(51,31)}<path d="M28 33q5-13 13-12" fill="none" stroke="${cream}" stroke-width="3"/>`;break;
    case 'gift':
      art=`${body(25,40,50,39,3,purple)}${body(20,32,60,14,3,tint)}<path d="M44 33c-27 3-20-23-4-15l10 15c5-25 30-19 20-6-4 6-11 6-20 6v46" fill="${orange}"/><path d="M50 45v33" stroke="${orange}" stroke-width="10"/>`;break;
    case 'badge':
    case 'planetbadge':
      art=`<path d="M38 27L32 7h36l-6 20" fill="none" stroke="${purple}" stroke-width="6"/>${body(24,26,53,55,6,tint)}${body(43,30,14,4,2,ink)}${kind==='planetbadge'?`<circle cx="51" cy="52" r="12" fill="${purple}"/><ellipse cx="51" cy="52" rx="21" ry="6" transform="rotate(-25 51 52)" fill="none"/>`:`${body(33,41,18,20,4,cream)}${face(42,48)}<path d="M57 45h11m-11 7h11m-11 7h7" stroke="${ink}" stroke-width="2"/>`}<path d="M33 70h34m-34 5h22" stroke="${ink}" stroke-width="2"/>`;break;
    case 'key':
      art=`<path d="M23 30h54v41H23z" fill="${purple}"/><path d="M17 23h54v41H17z" fill="${tint}"/><path d="M50 38H35l7-7M35 38l7 7m-7-7h17q11 0 11 10v3" fill="none" stroke-width="4"/><path d="M24 67v5m57-35h5" stroke="${cream}"/>`;break;
    case 'speech':
      art=`<path d="M19 26h61v40H50L33 80V66H19z" fill="${tint}"/><path d="M32 43h7m8 0h7m8 0h7" stroke="${ink}" stroke-width="4"/><path d="M69 68l8 8m-57-3l-6 5" stroke="${purple}"/>`;break;
    case 'hamster':
      art=`${body(19,32,17,29,5,purple)}${body(65,32,17,29,5,purple)}${body(25,53,51,25,5,tint)}<circle cx="36" cy="24" r="10" fill="${orange}"/><circle cx="66" cy="24" r="10" fill="${orange}"/><ellipse cx="51" cy="40" rx="26" ry="23" fill="${orange}"/><ellipse cx="51" cy="48" rx="17" ry="12" fill="${cream}"/>${face(51,37)}<path d="M34 78v7m34-7v7M42 65h18" stroke-width="4"/>`;break;
    case 'stapler':
      art=`<path d="M20 61l50-12 9 20-53 10-10-9z" fill="${tint}"/><path d="M20 43l51-14 10 28-51 13z" fill="${purple}"/><path d="M25 42l8-6 43-11-5 10z" fill="${cream}"/><path d="M36 58l31-9" fill="none" stroke="${cream}" stroke-width="4"/>`;break;
    case 'megaphone':
      art=`<path d="M35 43l40-22v51L35 56z" fill="${tint}"/><path d="M30 41h13v19H30z" fill="${purple}"/><path d="M41 60l7 17H35l-6-17" fill="${orange}"/><ellipse cx="76" cy="47" rx="7" ry="25" fill="${purple}"/><path d="M86 35l8-5m-7 17h10m-11 12l8 5" stroke="${orange}"/>`;break;
    case 'cat':
      art=`<path d="M28 47L24 18l21 12h12l21-12-4 32c9 16-1 31-26 31S21 66 28 47z" fill="${tint}"/><path d="M29 30l5 6m37-6l-5 6" fill="none" stroke="${purple}" stroke-width="4"/><path d="M35 50l8 1m17-1l8-1m-14 8l-4 4-4-4M23 61h14m-13 7l13-3m26-4h14m-14 4l14 3" fill="none"/>`;break;
    case 'book':
      art=`<path d="M15 28q18-11 35 0 18-11 35 0v48q-19-10-35 0-18-10-35 0z" fill="${purple}"/><path d="M20 24q15-7 30 2 15-9 30-2v44q-15-7-30 2-15-9-30-2z" fill="${cream}"/><path d="M50 27v43m-23-31l16 1m-16 8l16 1m-16 8l16 1m14-19h15m-15 8h15m-15 8h11" fill="none" stroke="${ink}" stroke-width="2"/>`;break;
    case 'scooter':
      art=`<ellipse cx="50" cy="79" rx="39" ry="9" fill="${purple}"/><circle cx="27" cy="69" r="11" fill="${ink}"/><circle cx="73" cy="69" r="11" fill="${ink}"/><path d="M22 67l14-21h20l8 22H22z" fill="${tint}"/><path d="M56 68h16l-7-33h-8m8 0l8-7" fill="none" stroke="${tint}" stroke-width="7"/>${body(21,31,28,19,3,orange)}<path d="M31 31v19M35 55h15" stroke="${ink}"/><circle cx="67" cy="40" r="5" fill="${cream}"/>`;break;
    case 'screw':
      art=`<path d="M44 33h16v42l-8 9-8-9z" fill="${tint}"/><path d="M39 40l27 9m-27 1l27 9m-27 1l27 9" stroke="${purple}" stroke-width="5"/><path d="M31 22l12-10h21l10 10v17H31z" fill="${purple}"/><path d="M40 25h25" stroke="${ink}" stroke-width="5"/>`;break;
    case 'gamepad':
      art=`<path d="M31 32h39c14 0 25 42 8 40L63 59H38L22 72C6 74 16 32 31 32z" fill="${tint}"/><path d="M29 40v18m-9-9h18" stroke="${ink}" stroke-width="6"/>${dot(65,44,4,purple)}${dot(76,53,4,orange)}<path d="M44 51h10" stroke="${cream}"/>`;break;
    case 'ghost':
      art=`<path d="M24 78V44c0-39 53-39 53 0v34l-10-8-8 8-8-8-9 8-8-8z" fill="${blue}"/>${face(51,42)}<path d="M30 34q3-12 12-13" fill="none" stroke="${cream}" stroke-width="4"/><path d="M34 87h34" stroke="${purple}" stroke-dasharray="3 4"/>`;break;
    case 'egg':
      art=`<path d="M50 15C33 15 18 46 23 65c6 23 49 23 55 0 5-19-11-50-28-50z" fill="${cream}"/><path d="M23 54l11-7 11 10 9-9 13 8 11-4" fill="none" stroke="${purple}" stroke-width="3"/>${face(51,32)}${label('404',51,71,10)}`;break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><ellipse cx="50" cy="87" rx="30" ry="4" fill="#0e160e" opacity=".5"/><g fill="none" stroke="${tint}" stroke-width="1.6" stroke-linecap="round" opacity=".7"><path d="M13 19v7m-3-3h6M86 14v5m-2.5-2.5h5"/><circle cx="87" cy="73" r="2"/></g><g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" transform="rotate(${tilt} 50 52)">${art}</g></svg>`;
}
