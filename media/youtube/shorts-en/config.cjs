const sensorDisclosure = 'Emulator demonstration with simulated direction and step readings. The virtual camera uses an AI-generated garden image. The app interface, length calculation, saving and PNG export are real. This is not a recording of physical measurement or sensor accuracy. The camera is a viewfinder; step-based lengths are estimates.';
const roomDisclosure = 'The opening room scene is an AI-generated illustration. App screens and the original PNG are real; directions and lengths were entered manually. The closing side is calculated. Check dimensions separately before buying furniture or materials.';
const v6 = name => `media/www/video-v06/sources/en/${name}`;
const v5 = name => `media/www/video-v05/sources/en/${name}`;
const v4 = name => `media/www/video-v04/sources/en/${name}`;

module.exports = [
  {
    id:'s01', slug:'camera-and-steps', title:'Aim. Walk. Sketch. Phone sensors in action | outlineGo',
    summary:'Aim at the next corner, capture direction, start the step counter, stand still and stop, then save the next point. See how outlineGo turns a direction and an estimated length into a 2D sketch.',
    disclosure:sensorDisclosure, sourceVideos:['V06'], simulated:true,
    music:{file:'media/www/video-v06/audio/Montauk-Point.mp3', title:'Montauk Point', source:'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400013'},
    tags:['outlineGo','phone sensors','camera and step counter','2D sketch','Android app','step measurement','garden sketch'],
    hashtags:['outlineGo','StepCounter','Shorts'],
    segments:[
      {file:v6('02-direction.mp4'),start:0,length:10,duration:14,layout:'phone',title:['Aim at a corner.','Save the direction.'],endStill:v6('02-direction.png')},
      {file:v6('03-steps.mp4'),start:0,length:18,duration:22,layout:'phone',title:['Start. Walk.','Stand still. Stop.'],endStill:v6('03-steps-stopped.png')},
      {file:v6('04-save.mp4'),start:2,length:8,duration:12,layout:'phone',title:['Check the length.','Save the next point.']},
      {file:'media/www/video-v06/output/camera-steps-en-free.png',duration:6,layout:'export',title:['Keep the outline.','Take your sketch along.']}
    ]
  },
  {
    id:'s02', slug:'steps-to-length', title:'8 steps to an estimated length — outlineGo step counter',
    summary:'Start at the corner, walk the side, stand still and press Stop. With a 75 cm step length, 8 counted steps give an estimated 6 m side. Set the step length to suit your own stride.',
    disclosure:sensorDisclosure, sourceVideos:['V06'], simulated:true,
    music:{file:'googlePlay/promo-en/audio/Carefree.mp3',title:'Carefree',source:'https://remote.incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1400037'},
    tags:['outlineGo','step counter','step length','estimate distance','measure with steps','Android app','2D sketch'],
    hashtags:['outlineGo','StepCounter','Shorts'],
    segments:[
      {file:v6('03-steps.mp4'),start:0,length:18,duration:22,layout:'phone',title:['Walk the side.','Watch the count grow.'],endStill:v6('03-steps-stopped.png')},
      {file:v6('03-steps-stopped.png'),duration:8,layout:'phone',title:['8 steps × 75 cm','≈ 6 m estimated length']}
    ]
  },
  {
    id:'s03', slug:'room-sketch', title:'A 5 × 4 m room sketch on your phone | outlineGo',
    summary:'Keep a room outline on your phone: enter a side, correct 4.8 m to 5 m, review the 18 m perimeter and 20 m² area, then export a PNG. Watermarked PNG export is included in Free.',
    disclosure:roomDisclosure, sourceVideos:['V05'], generatedIllustration:true,
    music:{file:'media/www/video-v05/audio/Dream-Culture.mp3',title:'Dream Culture',source:'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046'},
    tags:['outlineGo','room sketch','room plan','5x4 room','edit dimensions','PNG export','Android app'],
    hashtags:['outlineGo','RoomPlan','Shorts'],
    segments:[
      {file:'media/www/video-v05/sources/room-measurement.png',duration:6,layout:'photo',title:['Keep the dimensions.','Sketch your room.']},
      {file:v5('02-first-side.mp4'),start:13.74,length:6,duration:10,layout:'phone',title:['Start with a side.','Enter 5 m.']},
      {file:v5('04-correction.mp4'),start:8.46,length:6,duration:10,layout:'phone',title:['Need a correction?','Change 4.8 m to 5 m.']},
      {file:v5('05-summary-stable.png'),duration:8,layout:'phone',title:['Check your room outline.','18 m perimeter · 20 m²']},
      {file:'media/www/video-v05/output/room-en-free.png',duration:8,layout:'export',title:['Save it as a PNG.','Keep your plan handy.']}
    ]
  },
  {
    id:'s04', slug:'sketch-to-cad', title:'From phone sketch to DXF and CAD | outlineGo Plus',
    summary:'Export a sketch as DXF with outlineGo Plus, open the same file in LibreCAD and check the drawing unit and geometry. This example is a 4 × 3 m rectangle with a 14 m perimeter. LibreCAD is separate software.',
    disclosure:'Actual app export and CAD screens with demonstration data. A temporary test Plus entitlement was used for the source recording; this is not a purchase demonstration. DXF export requires Plus. No private file browser or computer history is shown.',
    sourceVideos:['V04'],
    music:{file:'media/www/video-v04/audio/Life-of-Riley.mp3',title:'Life of Riley',source:'https://remote.incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1400054'},
    tags:['outlineGo','DXF export','LibreCAD','CAD','Android app','phone to CAD','outlineGo Plus'],
    hashtags:['outlineGo','DXF','Shorts'],
    segments:[
      {file:v4('01-export.mp4'),start:0,length:9.86,duration:14,layout:'phone',title:['From phone sketch','to DXF with Plus.']},
      {file:v4('03-overview.mp4'),start:12,length:8,duration:12,layout:'cad',crop:{x:420,y:90,width:1020,height:750},title:['The same outline.','Open it in LibreCAD.']},
      {file:v4('04-units.mp4'),start:0,length:4,duration:8,layout:'units',crop:{x:10,y:10,width:500,height:200},title:['Check the drawing unit.','This file uses metres.']},
      {file:v4('05-distance.mp4'),start:14,length:6,duration:10,layout:'cad',crop:{x:420,y:90,width:1020,height:750},detailCrop:{x:650,y:896,width:420,height:64},title:['Check the geometry.','14 m perimeter.']}
    ]
  }
];
