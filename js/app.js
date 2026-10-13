/* ==========================================================
   Tennant T7 · Visor de despiece jerárquico
   Nivel 1: Máquina completa (zonas)  ->  Nivel 2: Despiece por subensamble

   Rutas (hash):
     #/                  -> Nivel 1
     #/zona/<id-zona>    -> Nivel 2 (p. ej. #/zona/racleta-trasera)
   ========================================================== */
(() => {
  "use strict";

  const MACHINE_URL = "data/machine.json";

  // Copias de respaldo usadas solo si fetch() falla (p. ej. al abrir index.html
  // con doble clic vía file://). Mantener sincronizadas con los JSON de data/.
  const FALLBACK = {
    "data/machine.json": {
      machine: "Tennant T7",
      title: "Fregadora de conductor sentado",
      image: "assets/t7_full.png",
      zones: [
        { id: "racleta-trasera", name: "Racleta Trasera", description: "Rear Squeegee Group, 800 mm", figure: "Fig. 37", status: "available", data: "data/squeegee_parts.json", hotspot: { x: 91.9, y: 69.1 } },
        { id: "cabeza-cepillos", name: "Cabeza de Cepillos", description: "Disk Scrub Head Drive Motor Group, 800 mm", figure: "Fig. 18", status: "available", data: "data/scrub_head_disk_800.json", hotspot: { x: 61.8, y: 85.9 } },
        { id: "tanques", name: "Tanques de Solución y Recuperación", description: "Recovery & Solution Tank Group", figure: "Fig. 27 / 29", status: "available", figures: [{ label: "Fig. 27 · Tanque de recuperación", data: "data/recovery_tank.json" }, { label: "Fig. 29 · Tanque de solución", data: "data/solution_tank_disk.json" }], hotspot: { x: 76.5, y: 20.1 } },
        { id: "rueda-motriz", name: "Rueda Motriz / Tracción", description: "Front Drive Wheel Group (S/N 10518139-)", figure: "Fig. 11", status: "available", data: "data/front_drive_wheel.json", hotspot: { x: 25.7, y: 92.3 } },
        { id: "panel-instrumentos", name: "Panel de Instrumentos / Consola", description: "Instrument Panel & Circuit Board Group", figure: "Fig. 10 / 38", status: "available", figures: [{ label: "Fig. 10 · Panel de instrumentos", data: "data/instrument_panel.json" }, { label: "Fig. 38 · Tarjeta controladora", data: "data/circuit_board.json" }], hotspot: { x: 24, y: 38 } },
        { id: "columna-direccion", name: "Columna de Dirección / Volante", description: "Steering Group", figure: "Fig. 9", status: "available", data: "data/steering_group.json", hotspot: { x: 34.6, y: 30.2 } },
        { id: "asiento-cubierta", name: "Asiento y Cubierta de Baterías", description: "Seat Group", figure: "Fig. 8", status: "available", data: "data/seat_group.json", hotspot: { x: 55.9, y: 37.6 }, labelSide: "right" },
        { id: "chasis-bastidor", name: "Chasis y Bastidor Principal", description: "Main Frame Group", figure: "Fig. 4 / 7", status: "available", figures: [{ label: "Fig. 4 · Cabezal de disco", data: "data/main_frame_disk.json" }, { label: "Fig. 7 · Cilíndrico (S/N hasta 10448498)", data: "data/main_frame.json" }], hotspot: { x: 58.8, y: 67.1 } },
        { id: "elevacion-cabezal", name: "Mecanismo de Elevación del Cabezal", description: "Disk Scrub Head Lift Group", figure: "Fig. 16", status: "available", data: "data/scrub_head_lift.json", hotspot: { x: 46, y: 76 }, labelSide: "left" }
      ]
    },
    "data/squeegee_parts.json": {
      machine: "Tennant T7",
      group: "Rear Squeegee Group - 800 mm",
      figure: "Fig. 37",
      image: "assets/rear_squeegee.png",
      categories: ["Estructura", "Gomas", "Fijación", "Tornillería", "Ruedas"],
      parts: [
        { item: 1, partNumber: "1012964", description: "Frame, Squeegee 800mm", category: "Estructura", qty: 1, hotspots: [{ x: 33.5, y: 43.4 }] },
        { item: 2, partNumber: "1033102", description: "Strap Assy, Squeegee 800mm", category: "Fijación", qty: 1, hotspots: [{ x: 79, y: 98 }] },
        { item: 3, partNumber: "1074204", description: "Knob, Star M8x1.25", category: "Fijación", qty: 4, hotspots: [{ x: 38.6, y: 3.4 }, { x: 71, y: 10.6 }, { x: 34.2, y: 27.4 }, { x: 70.4, y: 38.7 }] },
        { item: 4, partNumber: "390923", description: "Blade, Sqge, Front 41.50L Linatex", category: "Gomas", qty: 1, hotspots: [{ x: 50, y: 82.8 }] },
        { item: 5, partNumber: "390922", description: "Blade, Sqge, Rear 44.00L Linatex", category: "Gomas", qty: 1, hotspots: [{ x: 86.4, y: 93.6 }] },
        { item: 6, partNumber: "1012975", description: "Retainer, Sqge, Front 800mm", category: "Estructura", qty: 1, hotspots: [{ x: 54.8, y: 54.1 }] },
        { item: 7, partNumber: "1012981", description: "Retainer, Sqge, Rear 800mm", category: "Estructura", qty: 1, hotspots: [{ x: 30.9, y: 49 }] },
        { item: 8, partNumber: "09011", description: "Screw, Hex M8x1.25x30 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 12.3, y: 37.8 }, { x: 83.3, y: 68.1 }] },
        { item: 9, partNumber: "140027", description: "Washer, Flat 0.35b 0.75d .06 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 11.9, y: 17.4 }, { x: 83.3, y: 47.6 }] },
        { item: 10, partNumber: "1011221", description: "Bushing, Flange", category: "Tornillería", qty: 2, hotspots: [{ x: 11.9, y: 25.5 }, { x: 83.8, y: 55.4 }] },
        { item: 11, partNumber: "08713", description: "Nut, Hex, Lock M8x1.25 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 11.9, y: 14.7 }, { x: 83.8, y: 44.6 }] },
        { item: 12, partNumber: "140058", description: "Washer, Flat 0.54b 0.88d .06 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 11.4, y: 28 }, { x: 84.4, y: 57.9 }] },
        { item: 13, partNumber: "1010560", description: "Wheel, Bumper 80d x 25w Non-Marking", category: "Ruedas", qty: 2, hotspots: [{ x: 8.3, y: 21.8 }, { x: 86.8, y: 50.8 }] },
        { item: 14, partNumber: "390925", description: "Blade, Sqge, Front 41.50L Protection/Gum", category: "Gomas", qty: 1, hotspots: [{ x: 53.3, y: 84.8 }] },
        { item: 15, partNumber: "390924", description: "Blade, Sqge, Rear 44.00L Protection/Gum", category: "Gomas", qty: 1, hotspots: [{ x: 87.1, y: 96.5 }] },
        { item: 16, partNumber: "390927", description: "Blade, Sqge, Front 41.50L Urethane", category: "Gomas", qty: 1, hotspots: [{ x: 56.4, y: 86.1 }] },
        { item: 17, partNumber: "390926", description: "Blade, Sqge, Rear 44.00L Urethane", category: "Gomas", qty: 1, hotspots: [{ x: 87.1, y: 98.6 }] }
      ]
    },
    "data/scrub_head_disk_800.json": {
      machine: "Tennant T7",
      group: "Disk Scrub Head Drive Motor Group, 800 mm (32 in)",
      figure: "Fig. 18",
      image: "assets/scrub_head_disk_800.png",
      categories: ["Cabezal", "Motores", "Solución", "Ruedas", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1012630", description: "Head, Scb, 800mm", category: "Cabezal", qty: 1, hotspots: [{ x: 39.3, y: 42.6 }] },
        { item: 2, partNumber: "1210864", description: "Motor, Ele, 24vdc 0260rpm", category: "Motores", qty: 2, note: "S/N 10827968-", hotspots: [{ x: 5.3, y: 13.5 }, { x: 43.3, y: 24.7 }, { x: 96, y: 4.9 }] },
        { item: 2, partNumber: "372878", description: "Brush Kit, Motor, Ele", category: "Motores", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [] },
        { item: 2, partNumber: "372879", description: "Hook, Safety", category: "Motores", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [] },
        { item: 2, partNumber: "372880", description: "Cover, Brush, Ele Motor", category: "Motores", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [] },
        { item: 3, partNumber: "1212130", description: "Shaft, Drive, Brush", category: "Motores", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [{ x: 48.2, y: 34.1 }, { x: 74.7, y: 23.3 }] },
        { item: 4, partNumber: "1212132", description: "Cap, Motor", category: "Motores", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [{ x: 58.9, y: 10.1 }, { x: 88.9, y: 1.4 }] },
        { item: 5, partNumber: "363503", description: "Screw, Pan, Phl, M6 x 1.00 x 12, SS", category: "Tornillería", qty: 4, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [{ x: 44.9, y: 12.1 }, { x: 71.8, y: 1.3 }] },
        { item: 6, partNumber: "1212131", description: "Key, Sq, 06mm x 06mm, 60mmL", category: "Motores", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [{ x: 63.9, y: 31.7 }, { x: 90.7, y: 21.4 }] },
        { item: 7, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [{ x: 47.5, y: 17.1 }, { x: 73.8, y: 6.9 }] },
        { item: 8, partNumber: "1017218", description: "Washer, Flat, 0.32b 1.00d .12, SS", category: "Tornillería", qty: 1, note: "Componente del motor 1210864 · S/N 10827968-", hotspots: [{ x: 47, y: 20 }, { x: 73.3, y: 9.8 }] },
        { item: 2, partNumber: "1048884", description: "Motor, Ele, 24 Vdc 0285rpm (Replaced By 1210864)", category: "Motores", qty: 2, note: "S/N 10409228-10827967", hotspots: [] },
        { item: 2, partNumber: "1048888", description: "Vr, Brush Kit, Motor, 1048884", category: "Motores", qty: 1, note: "Componente del motor 1048884 · S/N 10409228-10827967", hotspots: [] },
        { item: 2, partNumber: "1000083", description: "Motor, Ele, 24 Vdc 0285rpm (Replaced By 1048884)", category: "Motores", qty: 2, note: "S/N 10000000-10409227", hotspots: [] },
        { item: 2, partNumber: "372878", description: "Brush Kit, Motor, Ele", category: "Motores", qty: 1, note: "Componente del motor 1000083 · S/N 10000000-10409227", hotspots: [] },
        { item: 2, partNumber: "372879", description: "Hook, Safety", category: "Motores", qty: 1, note: "Componente del motor 1000083 · S/N 10000000-10409227", hotspots: [] },
        { item: 2, partNumber: "372880", description: "Cover, Brush, Ele Motor", category: "Motores", qty: 1, note: "Componente del motor 1000083 · S/N 10000000-10409227", hotspots: [] },
        { item: 3, partNumber: "1008758", description: "Shaft, Drive, Brush", category: "Motores", qty: 2, note: "Componente del motor 1000083 · S/N 10000000-10409227", hotspots: [] },
        { item: 4, partNumber: "1017553", description: "Cap, Motor", category: "Motores", qty: 2, note: "Componente del motor 1000083 · S/N 10000000-10409227", hotspots: [] },
        { item: 5, partNumber: "363503", description: "Screw, Pan, Phl, M6 x 1.00 x 12, SS", category: "Tornillería", qty: 4, note: "Componente del motor 1000083 · S/N 10000000-10409227", hotspots: [] },
        { item: 6, partNumber: "1014303", description: "Key, Sq, 06mm x 06mm, 60mm L", category: "Motores", qty: 2, note: "Componente del motor 1000083 · S/N 10000000-10409227", hotspots: [] },
        { item: 9, partNumber: "1014776", description: "Manifold, Soltn, 800mm", category: "Solución", qty: 1, hotspots: [{ x: 68.2, y: 39.3 }] },
        { item: 10, partNumber: "1016520", description: "Screw, Hex, M4 x 0.7 x 16 Fmg, SS", category: "Tornillería", qty: 3, hotspots: [{ x: 94, y: 32.8 }, { x: 70.9, y: 35.6 }] },
        { item: 11, partNumber: "1214973", description: "Valve, Water, Solenoid, 24vdc, BM10/BM10", category: "Solución", qty: 1, hotspots: [{ x: 94.1, y: 34.9 }] },
        { item: 12, partNumber: "1071636", description: "Hub, Drive, Brush, Disk, 0.75b [6T]", category: "Cabezal", qty: 2, note: "S/N 10624413-", hotspots: [{ x: 43.8, y: 84.6 }, { x: 71.2, y: 74.3 }, { x: 6.1, y: 87.9 }] },
        { item: 12, partNumber: "377367", description: "Hub, Drive, Brush, Disk, 0.75b 6T (Replaced By 1071636)", category: "Cabezal", qty: 2, note: "S/N 10000000-10624412", hotspots: [] },
        { item: 13, partNumber: "00928", description: "Key, Sq, 0.25 x 0.25, 1.00L", category: "Cabezal", qty: 2, hotspots: [{ x: 23.7, y: 21.5 }, { x: 63.9, y: 35.5 }, { x: 91.2, y: 25.3 }] },
        { item: 14, partNumber: "1020341", description: "Screw, Hex, M8 x 1.25 x 20, SS, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 47.4, y: 94.8 }, { x: 74.3, y: 84.5 }] },
        { item: 15, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, SS", category: "Tornillería", qty: 2, note: "Modelo ec-H2O", hotspots: [{ x: 91.6, y: 74.6 }, { x: 65, y: 83.9 }] },
        { item: 16, partNumber: "1017218", description: "Washer, Flat, 0.32b 1.00d .12, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 47.8, y: 92 }, { x: 74.2, y: 81.6 }] },
        { item: 17, partNumber: "1011376", description: "Skirt, Spray, 800mm", category: "Cabezal", qty: 1, hotspots: [{ x: 24.7, y: 50.3 }] },
        { item: 18, partNumber: "1012359", description: "Retainer, Skirt, 800mm", category: "Cabezal", qty: 1, hotspots: [{ x: 17.6, y: 53.6 }] },
        { item: 19, partNumber: "1072816", description: "Screw, Hex, M8 x 1.25 x 30, SS, Sems", category: "Tornillería", qty: 6, hotspots: [{ x: 8.5, y: 76.7 }] },
        { item: 20, partNumber: "08713", description: "Nut, Hex, Lock, M8 x 1.25, NL, SS", category: "Tornillería", qty: 6, hotspots: [{ x: 8.3, y: 50.5 }, { x: 48, y: 61 }] },
        { item: 21, partNumber: "1052393", description: "Bracket, Wheel, Guide", category: "Ruedas", qty: 1, hotspots: [{ x: 13.2, y: 73.6 }] },
        { item: 22, partNumber: "1010560", description: "Wheel, Bumper, 80d x 25w, Non-Marking", category: "Ruedas", qty: 1, hotspots: [{ x: 12.8, y: 56 }] },
        { item: 23, partNumber: "222460", description: "Sleeve, P/, 0.49D 0.318B 0.50L 430SS", category: "Ruedas", qty: 1, hotspots: [{ x: 10.7, y: 59.6 }] },
        { item: 24, partNumber: "140027", description: "Washer, Flat, 0.35b 0.75d .04, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 10.1, y: 53.4 }] },
        { item: 25, partNumber: "1014295", description: "Clip, Grip, Hose, 0.75-1.12, Stl, Blk Vyl", category: "Solución", qty: 1, note: "Modelo ec-H2O", hotspots: [{ x: 28.2, y: 73.5 }] },
        { item: 26, partNumber: "140011", description: "Washer, Flat, 0.21b 0.45d .03, SS", category: "Tornillería", qty: 1, note: "Modelo ec-H2O", hotspots: [{ x: 29.8, y: 70.7 }] },
        { item: 27, partNumber: "607006", description: "Screw, Trs, M4 x 0.70 x 12, Phl, Pl", category: "Tornillería", qty: 1, note: "Modelo ec-H2O", hotspots: [{ x: 30.8, y: 68.4 }] },
        { item: 28, partNumber: "33932", description: "Nut, Hex, Lock, M4 x 0.70, NL, SS", category: "Tornillería", qty: 1, note: "Modelo ec-H2O", hotspots: [{ x: 19, y: 75.6 }] },
        { item: 29, partNumber: "08712", description: "Nut, Hex, Lock, M6 x 1.0, SS, NL", category: "Tornillería", qty: 8, hotspots: [{ x: 90.4, y: 77.7 }, { x: 64, y: 86.8 }] },
        { item: 30, partNumber: "1052298", description: "Bracket, Support, Hose [T7]", category: "Solución", qty: 2, note: "Modelo ec-H2O", hotspots: [{ x: 72.3, y: 71 }, { x: 64.7, y: 79.7 }] },
        { item: 31, partNumber: "1013821", description: "Plate, Sppt", category: "Cabezal", qty: 2, hotspots: [{ x: 45.8, y: 74.6 }, { x: 91.1, y: 67.3 }] }
      ]
    },
    "data/recovery_tank.json": {
      machine: "Tennant T7",
      group: "Recovery Tank Group",
      figure: "Fig. 27",
      image: "assets/recovery_tank.png",
      categories: ["Tanque", "Bisagras", "Vacío y filtro", "Eléctrico", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1018032", description: "Tank, Recvy, W/Label [T7] (Teal)", category: "Tanque", qty: 1, note: "T7 estándar · Teal", hotspots: [{ x: 23.7, y: 39 }] },
        { item: 1, partNumber: "1023942", description: "Tank, Recvy, W/ Label [T7] RM-NLG (Gray)", category: "Tanque", qty: 1, note: "T7 estándar · Gray", hotspots: [] },
        { item: 1, partNumber: "1018034", description: "Tank, Recvy, W/Label [T7 FaST] (Teal)", category: "Tanque", qty: 1, note: "T7 FaST · Teal", hotspots: [] },
        { item: 1, partNumber: "1023944", description: "Tank, Recvy, RM-CPHG, W/ Label [T7 FaST] (Gray)", category: "Tanque", qty: 1, note: "T7 FaST · Gray", hotspots: [] },
        { item: 1, partNumber: "9006186", description: "Tank, Recvy, Afmkt, Teal [T7 ec-H2O]", category: "Tanque", qty: 1, note: "T7 ec-H2O · Teal", hotspots: [] },
        { item: 1, partNumber: "9006187", description: "Tank, Recvy, Afmkt, Gray [T7 ec-H2O]", category: "Tanque", qty: 1, note: "T7 ec-H2O · Gray", hotspots: [] },
        { item: 2, partNumber: "1033973", description: "Cover, Tank, Recvy, Afmkt, HG [T7]", category: "Tanque", qty: 1, hotspots: [{ x: 28.6, y: 5 }] },
        { item: 3, partNumber: "222529", description: "Hinge, Leaf", category: "Bisagras", qty: 2, hotspots: [{ x: 44, y: 25.1 }, { x: 27.5, y: 11.9 }] },
        { item: 4, partNumber: "222463", description: "Screw, Flt, M8 x 1.25 x 20, Blk", category: "Tornillería", qty: 2, hotspots: [{ x: 41.9, y: 24.9 }, { x: 24.1, y: 13.3 }] },
        { item: 5, partNumber: "1012055", description: "Hinge Wldt, Cover", category: "Bisagras", qty: 2, hotspots: [{ x: 56.9, y: 28 }, { x: 36.9, y: 24.1 }] },
        { item: 6, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 8, hotspots: [{ x: 12.7, y: 73.2 }, { x: 30.7, y: 74.2 }, { x: 2.9, y: 53.5 }, { x: 4, y: 89.5 }, { x: 13, y: 93.7 }] },
        { item: 7, partNumber: "1017218", description: "Washer, Flat, 0.321b 1.00d .12, SS", category: "Tornillería", qty: 8, hotspots: [{ x: 16.7, y: 71.6 }, { x: 33.3, y: 73.8 }, { x: 3.5, y: 64.7 }, { x: 4, y: 91.9 }, { x: 13, y: 96 }] },
        { item: 8, partNumber: "1018304", description: "Hinge, 10mm Pin, Crs, Blk [T7]", category: "Bisagras", qty: 2, note: "S/N 10346364-", hotspots: [{ x: 91.8, y: 87.3 }, { x: 74, y: 70.5 }] },
        { item: 9, partNumber: "393135", description: "Screw, Btn, M8 x 1.25 x 20, Blk", category: "Tornillería", qty: 4, note: "S/N 10346364-", hotspots: [{ x: 95.6, y: 80.1 }, { x: 86, y: 76.1 }] },
        { item: 10, partNumber: "1016435", description: "Washer, Flat, 0.52b 0.75d .06, Stl, Blk", category: "Tornillería", qty: 4, hotspots: [{ x: 94.3, y: 81.7 }, { x: 83.9, y: 77.4 }, { x: 24.4, y: 80.1 }] },
        { item: 11, partNumber: "1016430", description: "Screw, Btn, M8 x 1.25 x 25, 10.9, Blk", category: "Tornillería", qty: 4, note: "S/N 10000000-10346363", hotspots: [{ x: 26.6, y: 78.8 }] },
        { item: 12, partNumber: "82829", description: "Clamp, Cable, Stl, 0.63d x 0.75w, 1hole", category: "Eléctrico", qty: 2, hotspots: [{ x: 51.3, y: 74.1 }, { x: 65.3, y: 66.5 }] },
        { item: 13, partNumber: "15675", description: "Screw, Hex, M8 x 1.25 x 16, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 46, y: 66.9 }, { x: 63.3, y: 68.2 }] },
        { item: 14, partNumber: "1016855", description: "Plate Wldt, Seal, Tank", category: "Tanque", qty: 1, hotspots: [{ x: 62.9, y: 91.3 }] },
        { item: 15, partNumber: "1020301", description: "Seal, Afmkt, Bulb, Clsd Cell, Adh, 8ft", category: "Tanque", qty: 1, hotspots: [{ x: 61, y: 94.7 }] },
        { item: 16, partNumber: "1016871", description: "Spacer, Seal, Tank", category: "Tanque", qty: 2, hotspots: [{ x: 37.7, y: 71.3 }, { x: 63.9, y: 75.1 }] },
        { item: 17, partNumber: "397255", description: "Spring, Cmpr, 0.85od .08wir 2.0l", category: "Tanque", qty: 2, hotspots: [{ x: 38.6, y: 69.4 }, { x: 63.4, y: 73.6 }] },
        { item: 18, partNumber: "605385", description: "Washer, Flat, 0.69b 1.50d .05, SS", category: "Tornillería", qty: 4, hotspots: [{ x: 36.3, y: 73.9 }, { x: 37.9, y: 65 }, { x: 64.5, y: 77.3 }, { x: 60.9, y: 69.3 }] },
        { item: 19, partNumber: "1017218", description: "Washer, Flat, 0.321b 1.00d .12, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 37.7, y: 90.5 }, { x: 48, y: 95.2 }] },
        { item: 20, partNumber: "77270", description: "Screw, Hex, M8 x 1.25 x 60, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 38.2, y: 94.1 }, { x: 48.6, y: 98.6 }] },
        { item: 21, partNumber: "1017705", description: "Pad, Rbr", category: "Tanque", qty: 1, hotspots: [{ x: 8.4, y: 43.7 }] },
        { item: 22, partNumber: "1011752", description: "Hinge Wldt, Tank", category: "Bisagras", qty: 1, note: "S/N 10000000-10346363", hotspots: [{ x: 4.7, y: 95.6 }] },
        { item: 23, partNumber: "1011753", description: "Hinge Wldt, Tank", category: "Bisagras", qty: 1, note: "S/N 10000000-10346363", hotspots: [{ x: 11.2, y: 98.4 }] },
        { item: 24, partNumber: "1017670", description: "Angle, Sppt, Tank", category: "Tanque", qty: 1, hotspots: [{ x: 23, y: 72.4 }] },
        { item: 25, partNumber: "1017607", description: "Bracket Wldt, Tank, Sppt", category: "Tanque", qty: 1, hotspots: [{ x: 4.9, y: 69.7 }] },
        { item: 26, partNumber: "1037821", description: "Filter, Panl, Dust, 2.3 x 4.5 x 6.4", category: "Vacío y filtro", qty: 1, hotspots: [{ x: 9.1, y: 31.4 }] },
        { item: 27, partNumber: "1016392", description: "Gasket, Fltr, Tank", category: "Vacío y filtro", qty: 1, hotspots: [{ x: 8.2, y: 27.6 }] },
        { item: 28, partNumber: "1014026", description: "Hose, Vacuum, 1.50id x 057.1l, 2cuff, Blk", category: "Vacío y filtro", qty: 1, hotspots: [{ x: 93.5, y: 23.1 }] },
        { item: 29, partNumber: "1001992", description: "Clip, Hose, Gripper, 1.75id, Blk Ny", category: "Vacío y filtro", qty: 2, hotspots: [{ x: 76.1, y: 39.7 }] },
        { item: 30, partNumber: "607006", description: "Screw, Trs, M4 x 0.70 x 12, Phl, Pl", category: "Tornillería", qty: 4, hotspots: [{ x: 81.3, y: 37 }] },
        { item: 31, partNumber: "385685", description: "Sensor, Level, Liquid, 14vdc 01a .62-11", category: "Eléctrico", qty: 1, hotspots: [{ x: 21, y: 42.7 }] },
        { item: 32, partNumber: "1014079", description: "Clip, Grip, Hose, 1.50id, Dbl, Blk Pyp", category: "Vacío y filtro", qty: 1, hotspots: [{ x: 93.3, y: 64.3 }] },
        { item: 33, partNumber: "1020341", description: "Screw, Hex, M8 x 1.25 x 20, SS, Sems", category: "Tornillería", qty: 8, hotspots: [{ x: 31.3, y: 22.6 }, { x: 76.5, y: 84.8 }, { x: 44.7, y: 28.5 }, { x: 67, y: 80.5 }] },
        { item: 34, partNumber: "1017590", description: "Plate, Hinge", category: "Bisagras", qty: 2, note: "S/N 10000000-10346363", hotspots: [{ x: 6.6, y: 77.7 }, { x: 27.5, y: 93.6 }] },
        { item: 35, partNumber: "1011536", description: "Hinge, Tank", category: "Bisagras", qty: 2, note: "S/N 10000000-10346363", hotspots: [{ x: 9.2, y: 76.2 }, { x: 30.6, y: 92 }] }
      ]
    },
    "data/solution_tank_disk.json": {
      machine: "Tennant T7",
      group: "Solution Tank Group, Disk Scrub Head",
      figure: "Fig. 29",
      image: "assets/solution_tank_disk.png",
      categories: ["Tanque", "Fluido", "Soportes", "Eléctrico", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1015405", description: "Tank, Soltn, W/ Label [T7]", category: "Tanque", qty: 1, hotspots: [{ x: 8.1, y: 58.8 }] },
        { item: 1, partNumber: "1036374", description: "Tank, Soltn, Disk, HG, Afmkt, TJ (Japan)", category: "Tanque", qty: 1, note: "Versión Japón", hotspots: [] },
        { item: 2, partNumber: "1012505", description: "Cover, Tank, Soltn [T7]", category: "Tanque", qty: 1, hotspots: [{ x: 13.8, y: 25.9 }] },
        { item: 3, partNumber: "1020317", description: "Catch, Cover [T7]", category: "Tanque", qty: 2, hotspots: [{ x: 21.6, y: 17.9 }, { x: 33.2, y: 22.5 }] },
        { item: 4, partNumber: "1020292", description: "Plate, Cover, Tab [T7]", category: "Tanque", qty: 2, hotspots: [{ x: 34.8, y: 29.9 }, { x: 47.4, y: 34 }] },
        { item: 5, partNumber: "1020727", description: "Seal, Afmkt, Bulb, Clsd Cell, Adh, 8ft", category: "Tanque", qty: 1, hotspots: [{ x: 16.3, y: 39.5 }] },
        { item: 6, partNumber: "1020719", description: "Seal, Afmkt, Bulb, Clsd Cell, Adh, 8ft", category: "Tanque", qty: 1, hotspots: [{ x: 25.5, y: 30.7 }] },
        { item: 7, partNumber: "1021677", description: "Rivet, Blind, .156D x 0.55 x .38D, SS", category: "Tornillería", qty: 10, hotspots: [{ x: 20, y: 22.1 }, { x: 39, y: 36.5 }, { x: 6.4, y: 35.6 }] },
        { item: 8, partNumber: "1014072", description: "Bracket, Mtg, Tank", category: "Soportes", qty: 3, hotspots: [{ x: 61.7, y: 64.3 }, { x: 40.2, y: 65.9 }] },
        { item: 9, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 6, hotspots: [{ x: 42, y: 71.5 }, { x: 57.3, y: 53 }] },
        { item: 10, partNumber: "1017218", description: "Washer, Flat, 0.321b 1.00d .12, SS", category: "Tornillería", qty: 6, hotspots: [{ x: 61.1, y: 58.3 }, { x: 39.4, y: 70.7 }] },
        { item: 11, partNumber: "1011885", description: "Cap, Tank", category: "Tanque", qty: 1, hotspots: [{ x: 53.6, y: 23.7 }] },
        { item: 12, partNumber: "1011852", description: "Arm, Tank, Retaining", category: "Soportes", qty: 1, hotspots: [{ x: 63.3, y: 23.7 }] },
        { item: 13, partNumber: "222516", description: "Sleeve, P/M, 0.496d 0.318b 0.31l 430SS", category: "Soportes", qty: 5, hotspots: [{ x: 47.6, y: 23.8 }, { x: 39.8, y: 16.8 }, { x: 72.9, y: 19.4 }] },
        { item: 14, partNumber: "1016430", description: "Screw, Btn, M8 x 1.25 x 25, 10.9, Blk", category: "Tornillería", qty: 4, hotspots: [{ x: 42.9, y: 22 }, { x: 38.6, y: 10.4 }, { x: 62.1, y: 17.7 }] },
        { item: 15, partNumber: "1016435", description: "Washer, Flat, 0.52b 0.75d .06, Stl, Blk", category: "Tornillería", qty: 3, hotspots: [{ x: 45.2, y: 23.2 }, { x: 59.8, y: 16 }] },
        { item: 16, partNumber: "398770", description: "Strainer, Soltn, 80mesh Cyl 1.3d 3.5l", category: "Fluido", qty: 1, hotspots: [{ x: 71.8, y: 26.4 }] },
        { item: 17, partNumber: "377349", description: "Fitting, Plstc, PF12/PF12, BH", category: "Fluido", qty: 1, hotspots: [{ x: 78.1, y: 53.5 }] },
        { item: 18, partNumber: "73468", description: "Fitting, Plstc, E90, BM10/PM12", category: "Fluido", qty: 1, hotspots: [{ x: 77.3, y: 59.3 }] },
        { item: 19, partNumber: "82829", description: "Clamp, Cable, Stl, 0.63d x 0.75w, 1hole", category: "Eléctrico", qty: 2, hotspots: [{ x: 89.5, y: 47.7 }] },
        { item: 20, partNumber: "67767", description: "Clamp, Cable, Stl, 0.69d x 0.62w, 1h", category: "Eléctrico", qty: 1, hotspots: [{ x: 88.9, y: 42.3 }] },
        { item: 21, partNumber: "1019879", description: "Conduit, Nylon, .50d 3.0l", category: "Eléctrico", qty: 1, hotspots: [{ x: 91.4, y: 40.2 }] },
        { item: 22, partNumber: "15675", description: "Screw, Hex, M8 x 1.25 x 16, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 90.9, y: 32.5 }, { x: 88.6, y: 45.1 }] },
        { item: 23, partNumber: "385685", description: "Sensor, Level, Liquid, 14vdc 01a .62-11", category: "Eléctrico", qty: 1, hotspots: [{ x: 86.8, y: 27.4 }] },
        { item: 24, partNumber: "1014825", description: "Hose, Mold", category: "Fluido", qty: 1, hotspots: [{ x: 47, y: 98.6 }] },
        { item: 25, partNumber: "54333", description: "Clamp, Hose, Wormdrive, 0.31-0.88d, .31w", category: "Fluido", qty: 2, hotspots: [{ x: 42.2, y: 97.2 }, { x: 77.4, y: 89.2 }] },
        { item: 26, partNumber: "49800", description: "Latch, Draw, Soft, Rbr W/ Keeper", category: "Tanque", qty: 2, hotspots: [{ x: 16.2, y: 41.8 }, { x: 37.8, y: 64.6 }] },
        { item: 27, partNumber: "607006", description: "Screw, Trs, M4 x 0.70 x 12, Phl, Pl", category: "Tornillería", qty: 4, hotspots: [{ x: 6.3, y: 49.8 }] },
        { item: 28, partNumber: "1035394", description: "Washer, Flat, 0.17b 0.38d .04, SS", category: "Tornillería", qty: 4, hotspots: [{ x: 11.9, y: 35.9 }] },
        { item: 29, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 40.6, y: 13.5 }, { x: 75.9, y: 20.1 }] },
        { item: 30, partNumber: "08713", description: "Nut, Hex, Lock, M8 x 1.25, NL, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 77.2, y: 22 }] },
        { item: 31, partNumber: "1011853", description: "Arm, Tank, Retaining", category: "Soportes", qty: 1, hotspots: [{ x: 41.8, y: 19.1 }] },
        { item: 32, partNumber: "1072628", description: "Screw, Hex, M8 x 1.25 x 25, SS, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 10.3, y: 91.3 }, { x: 20.8, y: 96.1 }] },
        { item: 33, partNumber: "1020341", description: "Screw, Hex, M8 x 1.25 x 20, SS, Sems", category: "Tornillería", qty: 4, hotspots: [{ x: 34.8, y: 19.2 }, { x: 24, y: 14.3 }] },
        { item: 34, partNumber: "69234", description: "Clamp, Cable, Stl, 1.00d x 0.75w, 1hole", category: "Eléctrico", qty: 1, hotspots: [{ x: 60.2, y: 56.4 }] }
      ]
    },
    "data/front_drive_wheel.json": {
      machine: "Tennant T7",
      group: "Front Drive Wheel Group (S/N 10518139-)",
      figure: "Fig. 11",
      image: "assets/front_drive_wheel.png",
      categories: ["Tracción", "Eléctrico", "Soportes", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1019724", description: "Steer-Control Assy, Wheel Drive (See Breakdown)", category: "Tracción", qty: 1, hotspots: [{ x: 58.1, y: 39 }] },
        { item: 2, partNumber: "1019224", description: "Strap, Nyl", category: "Soportes", qty: 1, hotspots: [{ x: 85.7, y: 75.8 }] },
        { item: 3, partNumber: "09010", description: "Screw, Hex, M8 x 1.25 x 25, SS (Disk Brush)", category: "Tornillería", qty: 4, hotspots: [{ x: 32.3, y: 40.2 }] },
        { item: 3, partNumber: "09026", description: "Screw, Hex, M8 x 1.25 x 40, SS (Cylindrical Brush)", category: "Tornillería", qty: 4, hotspots: [] },
        { item: 4, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 4, hotspots: [{ x: 31.2, y: 44.3 }] },
        { item: 5, partNumber: "00912", description: "Key, Sq, 0.19 x 0.19, 1.00L", category: "Tracción", qty: 1, hotspots: [{ x: 52, y: 38.6 }] },
        { item: 6, partNumber: "1065808", description: "Harness, Motor, Brake [T7/SSR]", category: "Eléctrico", qty: 1, hotspots: [{ x: 62.4, y: 93.2 }] },
        { item: 7, partNumber: "1028873", description: "Plate, Spacer, Drive (Cylindrical Brush)", category: "Soportes", qty: 2, hotspots: [{ x: 75.3, y: 58.4 }, { x: 29.6, y: 58.4 }] },
        { item: 8, partNumber: "140300", description: "Clamp, Cable, Stl, 0.50D [Insulated]", category: "Eléctrico", qty: 2, hotspots: [{ x: 24.3, y: 84.2 }, { x: 10.5, y: 74.2 }] },
        { item: 9, partNumber: "361339", description: "Screw, Hex, M6 x 1.0 x 16, Fmg", category: "Tornillería", qty: 2, hotspots: [{ x: 25, y: 92.7 }, { x: 11.3, y: 83.1 }] },
        { item: 10, partNumber: "19066", description: "Washer, Flat, #10", category: "Tornillería", qty: 2, hotspots: [{ x: 76.7, y: 92.9 }] },
        { item: 11, partNumber: "130773", description: "Tie, Cable, Nyl, 11.0L, .14W, 3.0 Max. D", category: "Eléctrico", qty: 4, hotspots: [{ x: 94.8, y: 96.8 }] },
        { item: 12, partNumber: "9008999", description: "Gearbox Kit, Wheel, 250mm, W/ Connector (Does NOT Include Motor Brake Harness) (See Breakdown)", category: "Tracción", qty: 1, hotspots: [{ x: 78.2, y: 65.5 }] },
        { item: 13, partNumber: "1047186", description: "Connector, Fem, 3 Recept [MP630]", category: "Eléctrico", qty: 1, hotspots: [{ x: 92.6, y: 79.4 }] },
        { item: 14, partNumber: "130161", description: "Plug, Hole, Rnd, 0.88D, Blk", category: "Soportes", qty: 1, hotspots: [{ x: 15.9, y: 68.6 }] },
        { item: 15, partNumber: "1064972", description: "Bracket, Cord", category: "Soportes", qty: 2, hotspots: [{ x: 8.3, y: 63.8 }, { x: 24, y: 44.1 }] },
        { item: 16, partNumber: "02938", description: "Washer, Lock, Int, 08, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 19, y: 43.3 }, { x: 4.9, y: 60.7 }] },
        { item: 17, partNumber: "33931", description: "Screw, Pan, Phl, M4 x 0.70 x 30, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 5, y: 46.2 }] }
      ]
    },
    "data/instrument_panel.json": {
      machine: "Tennant T7",
      group: "Instrument Panel Group",
      figure: "Fig. 10",
      image: "assets/instrument_panel.png",
      categories: ["Paneles", "Llave e interruptores", "Columna", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1076470", description: "Panel, Instmt, LH, Afmkt [T7]", category: "Paneles", qty: 1, note: "T7 estándar", hotspots: [{ x: 10, y: 20.7 }] },
        { item: 1, partNumber: "1076471", description: "Panel, Instmt, LH, Afmkt [ec-H2O T7]", category: "Paneles", qty: 1, note: "T7 ec-H2O", hotspots: [] },
        { item: 2, partNumber: "1012197", description: "Cover, Panl, Instmt", category: "Paneles", qty: 1, hotspots: [{ x: 14.5, y: 12 }] },
        { item: 3, partNumber: "1011952", description: "Block, Pivot, Cover", category: "Paneles", qty: 2, hotspots: [{ x: 39.4, y: 7.9 }] },
        { item: 4, partNumber: "1052607", description: "Gasket, Panl, Instmt, LH, .13, Foam, Adh", category: "Paneles", qty: 1, hotspots: [{ x: 7.6, y: 25.6 }] },
        { item: 5, partNumber: "1046313", description: "Panel, Instmt, RH", category: "Paneles", qty: 1, note: "S/N 10403819-", hotspots: [{ x: 85.6, y: 15.6 }] },
        { item: 5, partNumber: "9004968", description: "Switch Kit, Key, [T7/SSR/R14/Strv Rdr]", category: "Llave e interruptores", qty: 1, note: "S/N 10000000-10403818", hotspots: [] },
        { item: 6, partNumber: "1014080", description: "Gasket, Panl, Instmt, RH", category: "Paneles", qty: 1, hotspots: [{ x: 83, y: 20.5 }] },
        { item: 7, partNumber: "72969", description: "Rivet, Plstc, .181d x 0.720", category: "Tornillería", qty: 10, hotspots: [{ x: 14.7, y: 16.2 }, { x: 79.2, y: 11.8 }] },
        { item: 8, partNumber: "1011402", description: "Switch, Key", category: "Llave e interruptores", qty: 1, note: "S/N 10403819-", hotspots: [{ x: 87.9, y: 7.2 }] },
        { item: 9, partNumber: "1017696", description: "Key Set, Replmt [F/ Keyswitch 1011402]", category: "Llave e interruptores", qty: 1, note: "Componente del interruptor 1011402 · S/N 10403819-", hotspots: [{ x: 88.7, y: 3.1 }] },
        { item: 8, partNumber: "9004968", description: "Switch Kit, Key, [T7/SSR/R14/Strv Rdr]", category: "Llave e interruptores", qty: 1, note: "S/N 10000000-10403818", hotspots: [] },
        { item: 9, partNumber: "361144", description: "Key, Ignition", category: "Llave e interruptores", qty: 1, note: "Componente del kit 9004968 · S/N 10000000-10403818", hotspots: [] },
        { item: 10, partNumber: "1072040", description: "Switch, Rocker, SPST, Paddle", category: "Llave e interruptores", qty: 1, hotspots: [{ x: 61.4, y: 11 }] },
        { item: 11, partNumber: "1011735", description: "Switch, Safety, Shutoff", category: "Llave e interruptores", qty: 1, hotspots: [{ x: 52.8, y: 2.9 }] },
        { item: 12, partNumber: "1015415", description: "Column, Steering, W/Label [T7] (Teal)", category: "Columna", qty: 1, note: "T7 estándar · Teal", hotspots: [{ x: 9.7, y: 56.4 }] },
        { item: 12, partNumber: "1023928", description: "Column, Steering, W/ Label [T7] RM-NLG (Gray)", category: "Columna", qty: 1, note: "T7 estándar · Gray", hotspots: [] },
        { item: 12, partNumber: "1036372", description: "Column, Steering, Afmkt, TJ (Japan)", category: "Columna", qty: 1, note: "Versión Japón", hotspots: [] },
        { item: 12, partNumber: "9006188", description: "Column, Steering, Teal [T7 ec-H2O]", category: "Columna", qty: 1, note: "T7 ec-H2O · Teal", hotspots: [] },
        { item: 12, partNumber: "9006189", description: "Column, Steering, Gray [T7 ec-H2O]", category: "Columna", qty: 1, note: "T7 ec-H2O · Gray", hotspots: [] },
        { item: 13, partNumber: "1072628", description: "Screw, Hex, M8 x 1.25 x 25, SS, Sems", category: "Tornillería", qty: 4, hotspots: [{ x: 66.6, y: 48.3 }] },
        { item: 14, partNumber: "1041822", description: "Light, LED, .312d, 2 Volt [Tri-Color]", category: "Llave e interruptores", qty: 1, note: "Modelo ec-H2O", hotspots: [{ x: 43.2, y: 4.4 }] },
        { item: 15, partNumber: "1014832", description: "Switch, Horn", category: "Llave e interruptores", qty: 1, hotspots: [{ x: 64.7, y: 1.6 }] }
      ]
    },
    "data/circuit_board.json": {
      machine: "Tennant T7",
      group: "Circuit Board Group",
      figure: "Fig. 38",
      image: "assets/circuit_board.png",
      categories: ["Controlador", "Gabinete", "Tornillería"],
      parts: [
        { item: 1, partNumber: "9012711", description: "Controller Kit, Replmt, CI [T7 Disk]", category: "Controlador", qty: 1, note: "Cabezal de disco · incluye ítems 2-14", hotspots: [{ x: 51.3, y: 51.1 }] },
        { item: 1, partNumber: "9012712", description: "Controller Kit, Replmt, CI [T7 Cyl]", category: "Controlador", qty: 1, note: "Cabezal cilíndrico · incluye ítems 2-14", hotspots: [] },
        { item: 2, partNumber: "06922", description: "Screw, Pan, M3 x 0.5 x 20, 4.8", category: "Tornillería", qty: 4, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 93.8, y: 18.8 }] },
        { item: 3, partNumber: "1019218", description: "Washer, Flat, 0.14b 0.31d, Nyl", category: "Tornillería", qty: 3, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 53, y: 68.7 }] },
        { item: 4, partNumber: "579211", description: "Nut, Hex, Lock, M3 x .5, SS", category: "Tornillería", qty: 3, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 50.9, y: 69.6 }] },
        { item: 5, partNumber: "1016825", description: "Support, Circuitboard", category: "Gabinete", qty: 2, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 66.6, y: 42.4 }, { x: 85.1, y: 51.6 }] },
        { item: 6, partNumber: "3701.6", description: "Screw, Pan, #06-32 x 0.38, Phl SS Shtmtl", category: "Tornillería", qty: 2, note: "Incluido en los kits controladores 9012711 y 9012712 · Part Number tal como figura en el manual; verificar al pedir", hotspots: [{ x: 81.4, y: 2.2 }, { x: 92.1, y: 5.7 }] },
        { item: 7, partNumber: "07785", description: "Nut, Hex, Std, M6 x 1.0, A2, SS", category: "Tornillería", qty: 4, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 58.2, y: 89.1 }, { x: 21, y: 85.9 }, { x: 42.2, y: 76.1 }, { x: 41, y: 97.2 }] },
        { item: 8, partNumber: "1057560", description: "Washer, Flat, M6.4b x 16d x 1 SS", category: "Tornillería", qty: 6, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 53.8, y: 91.2 }, { x: 62.1, y: 87.6 }, { x: 24.5, y: 84.2 }, { x: 34.9, y: 78.7 }, { x: 45.2, y: 74 }, { x: 44.9, y: 95.8 }] },
        { item: 9, partNumber: "32982", description: "Washer, Lock, Int, 0.25", category: "Tornillería", qty: 2, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 28.5, y: 82.5 }, { x: 44.1, y: 83.8 }] },
        { item: 10, partNumber: "55248", description: "Mount, Cable Tie", category: "Gabinete", qty: 1, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 71.4, y: 10.5 }] },
        { item: 11, partNumber: "1017754", description: "Panel, Wldt, Cntrl", category: "Gabinete", qty: 1, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 57.2, y: 14.5 }] },
        { item: 12, partNumber: "1020284", description: "Seal, Afmkt, Rbr, Clsd, Adh, 03ft (C410217)", category: "Gabinete", qty: 1, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 33.3, y: 4.2 }] },
        { item: 13, partNumber: "1016816", description: "Pad, Thermal, Heat Sink", category: "Controlador", qty: 1, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 78.1, y: 20.2 }] },
        { item: 14, partNumber: "1030692", description: "Vr, Fuse, 15A, Replmt", category: "Controlador", qty: 1, note: "Incluido en los kits controladores 9012711 y 9012712", hotspots: [{ x: 72.2, y: 63.4 }] },
        { item: 15, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 1, hotspots: [{ x: 68.8, y: 36.4 }] },
        { item: 16, partNumber: "76426", description: "Washer, Sealing, 0.28b 0.75d SS/Neo", category: "Tornillería", qty: 6, hotspots: [{ x: 9.5, y: 14.8 }] },
        { item: 17, partNumber: "1036368", description: "Cover, Panl, Ele, Afmkt, NA, CE, TJ", category: "Gabinete", qty: 1, hotspots: [{ x: 8, y: 40.5 }] },
        { item: 18, partNumber: "24199", description: "Screw, Hex, M5 x 0.8 x 16, SS", category: "Tornillería", qty: 6, hotspots: [{ x: 5.2, y: 17 }] },
        { item: 19, partNumber: "1016865", description: "Cable, Ribbon", category: "Controlador", qty: 1, hotspots: [{ x: 44.2, y: 54.6 }] },
        { item: 20, partNumber: "41141", description: "Washer, Lock, Int-Ext, 0.31", category: "Tornillería", qty: 1, hotspots: [{ x: 53.6, y: 18.4 }] },
        { item: 21, partNumber: "1019083", description: "Seal, Cut", category: "Gabinete", qty: 1, hotspots: [{ x: 13, y: 58.4 }] },
        { item: 22, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 73.4, y: 37.5 }] }
      ]
    },
    "data/steering_group.json": {
      machine: "Tennant T7",
      group: "Steering Group",
      figure: "Fig. 9",
      image: "assets/steering_group.png",
      categories: ["Volante", "Transmisión", "Columna y soportes", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1072829", description: "Support Wldt, Steering", category: "Columna y soportes", qty: 1, hotspots: [{ x: 5, y: 25.4 }] },
        { item: 2, partNumber: "04417", description: "Screw, Hex, M10 x 1.5 x 60, SS", category: "Tornillería", qty: 4, hotspots: [{ x: 36.6, y: 54.4 }] },
        { item: 3, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00 .08, SS", category: "Tornillería", qty: 4, hotspots: [{ x: 35.9, y: 58.7 }] },
        { item: 4, partNumber: "69234", description: "Clamp, Cable, Stl, 1.00d x 0.62w, 1h", category: "Columna y soportes", qty: 3, hotspots: [{ x: 33.4, y: 28.9 }, { x: 28.3, y: 44.6 }, { x: 25.3, y: 51.3 }] },
        { item: 5, partNumber: "39349", description: "Washer, Flat, 0.31 SAE", category: "Tornillería", qty: 3, hotspots: [{ x: 39.1, y: 28.6 }, { x: 33, y: 43.8 }, { x: 32.1, y: 50.4 }] },
        { item: 6, partNumber: "08709", description: "Nut, Hex, Lock, M8 x 1.25, NL", category: "Tornillería", qty: 3, hotspots: [{ x: 43.6, y: 28 }, { x: 36.6, y: 42.8 }, { x: 37, y: 49 }] },
        { item: 7, partNumber: "1040295", description: "Joint, U, 0.75id", category: "Transmisión", qty: 1, hotspots: [{ x: 43.2, y: 64.3 }] },
        { item: 8, partNumber: "46820", description: "Screw, Set, .31-18 x 0.38, NL", category: "Tornillería", qty: 4, hotspots: [{ x: 53, y: 54.3 }, { x: 50, y: 61.2 }] },
        { item: 9, partNumber: "00912", description: "Key, Sq, 0.19 x 0.19, 1.00L", category: "Transmisión", qty: 1, hotspots: [{ x: 55.8, y: 50.3 }] },
        { item: 10, partNumber: "223065", description: "Bearing, Flng, 2-Hole, 0.75b [Nyl]", category: "Transmisión", qty: 1, hotspots: [{ x: 49.4, y: 7 }] },
        { item: 11, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 51.8, y: 3.5 }] },
        { item: 12, partNumber: "1013164", description: "Shaft, Steering, Wheel", category: "Transmisión", qty: 1, hotspots: [{ x: 46.8, y: 18.6 }] },
        { item: 13, partNumber: "1012002", description: "Wheel, Steering, 300mm", category: "Volante", qty: 1, hotspots: [{ x: 72.2, y: 21.7 }] },
        { item: 14, partNumber: "1019706", description: "Cap, Steering Wheel", category: "Volante", qty: 1, hotspots: [{ x: 95.7, y: 20.3 }] },
        { item: 15, partNumber: "1014328", description: "Key, Sq, 05mm x 05mm, 25L", category: "Transmisión", qty: 1, hotspots: [{ x: 62.4, y: 15.7 }] },
        { item: 16, partNumber: "64154", description: "Washer, Flat, 0.53b 1.12d .11, Stl, Pl", category: "Volante", qty: 1, hotspots: [{ x: 91, y: 27.9 }] },
        { item: 17, partNumber: "08711", description: "Nut, Hex, Lock, M12 x 1.75, NL", category: "Volante", qty: 1, hotspots: [{ x: 91.8, y: 24.2 }] },
        { item: 18, partNumber: "1012437", description: "Bellows, Shaft, Steering", category: "Volante", qty: 1, hotspots: [{ x: 87.3, y: 44.6 }] },
        { item: 19, partNumber: "41142", description: "Washer, Lock, Int-Ext, 0.38", category: "Tornillería", qty: 1, hotspots: [{ x: 56.9, y: 62.9 }] }
      ]
    },
    "data/seat_group.json": {
      machine: "Tennant T7",
      group: "Seat Group",
      figure: "Fig. 8",
      image: "assets/seat_group.png",
      categories: ["Asiento", "Interruptor y arnés", "Portavasos", "Cubierta y tapa", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1015406", description: "Plate, Seat, W/ Label", category: "Cubierta y tapa", qty: 1, hotspots: [{ x: 45.2, y: 51.9 }] },
        { item: 1, partNumber: "1036299", description: "Plate, Seat, Afmkt, TJ (Japan)", category: "Cubierta y tapa", qty: 1, note: "Versión Japón", hotspots: [] },
        { item: 2, partNumber: "1038062", description: "Holder Kit, Cup, Assy [T7]", category: "Portavasos", qty: 1, note: "S/N 10000000-10226853", hotspots: [{ x: 21.8, y: 32.9 }] },
        { item: 3, partNumber: "1038062", description: "Holder Kit, Cup, Assy [T7]", category: "Portavasos", qty: 1, note: "S/N 10226854-10382115", hotspots: [{ x: 21.5, y: 49.5 }] },
        { item: 4, partNumber: "1025867", description: "Holder, Cup, Blk [T7]", category: "Portavasos", qty: 1, note: "S/N 10382116-", hotspots: [{ x: 89.8, y: 33.4 }] },
        { item: 5, partNumber: "1038081", description: "Holder, Cup, Brkt, Blk, [T7]", category: "Portavasos", qty: 1, note: "S/N 10382116-", hotspots: [{ x: 89.4, y: 41.9 }] },
        { item: 6, partNumber: "1016435", description: "Washer, Flat, 0.52b 0.75d .06, Stl, Blk", category: "Tornillería", qty: 4, hotspots: [{ x: 82.6, y: 48.8 }, { x: 70.6, y: 62.1 }] },
        { item: 7, partNumber: "393135", description: "Screw, Btn, M8 x 1.25 x 20, Blk", category: "Tornillería", qty: 2, hotspots: [{ x: 82.8, y: 46.5 }] },
        { item: 8, partNumber: "08709", description: "Nut, Hex, Lock, M8 x 1.25, NL", category: "Tornillería", qty: 2, hotspots: [{ x: 68.8, y: 64.4 }] },
        { item: 9, partNumber: "9005082", description: "Seat Kit, Std, Replmt", category: "Asiento", qty: 1, note: "S/N 10000000-10400496", hotspots: [{ x: 51.9, y: 11.2 }] },
        { item: 9, partNumber: "1048932", description: "Seat, Std [Michigan, Model V-2505] (Replaced By 9005082)", category: "Asiento", qty: 1, note: "S/N 10400497-10611439", hotspots: [] },
        { item: 9, partNumber: "9005082", description: "Seat Kit, Std, Replmt (Kit Includes Screw and Spacer)", category: "Asiento", qty: 1, note: "S/N 10611440-", hotspots: [] },
        { item: 10, partNumber: "223078", description: "Switch, Seat, NO", category: "Interruptor y arnés", qty: 1, note: "S/N 10000000-10400496", hotspots: [{ x: 5, y: 14 }] },
        { item: 11, partNumber: "1017054", description: "Rail, Adj, Slide, Seat, 11.5L, W/ Latch", category: "Asiento", qty: 1, hotspots: [{ x: 83.4, y: 43.9 }] },
        { item: 12, partNumber: "1017053", description: "Rail, Adj, Slide, Seat, 11.5L", category: "Asiento", qty: 1, hotspots: [{ x: 54.7, y: 36.2 }] },
        { item: 13, partNumber: "25537", description: "Screw, Pan, Phl, .31-18 x 0.75, G2", category: "Tornillería", qty: 4, note: "S/N 10000000-10400496", hotspots: [{ x: 24.4, y: 22 }] },
        { item: 14, partNumber: "69461", description: "Washer, Flat, 0.38b 0.88d .12, Stl, Pl", category: "Tornillería", qty: 8, note: "S/N 10000000-10400496", hotspots: [{ x: 22.8, y: 15.2 }] },
        { item: 15, partNumber: "32491", description: "Washer, Flat, 0.31 Std", category: "Tornillería", qty: 4, hotspots: [{ x: 80.5, y: 69.8 }] },
        { item: 16, partNumber: "01760", description: "Nut, Hex, Lock, .31-18, NL, Thin", category: "Tornillería", qty: 4, hotspots: [{ x: 83.2, y: 71.2 }] },
        { item: 17, partNumber: "46236", description: "Clamp, Cable, Stl, 0.25D x 0.56W, 1H", category: "Interruptor y arnés", qty: 1, hotspots: [{ x: 78, y: 68.6 }] },
        { item: 18, partNumber: "1016000", description: "Plate, Stop, Seat", category: "Cubierta y tapa", qty: 1, hotspots: [{ x: 66.8, y: 79.3 }] },
        { item: 19, partNumber: "1017699", description: "Sleeve, P/M, 0.437d 0.318b 0.57L 430SS", category: "Cubierta y tapa", qty: 1, hotspots: [{ x: 56.2, y: 74.1 }] },
        { item: 20, partNumber: "10928", description: "Spring, Tors, 0.49id .05wir 05.0coil", category: "Cubierta y tapa", qty: 1, hotspots: [{ x: 53.5, y: 72 }] },
        { item: 21, partNumber: "1018151", description: "Washer, Flat, 0.44b 0.88d .06, Nyl", category: "Tornillería", qty: 1, hotspots: [{ x: 61, y: 65.1 }] },
        { item: 22, partNumber: "09023", description: "Screw, Hex, M8 x 1.25 x 35, SS, Fl", category: "Tornillería", qty: 1, hotspots: [{ x: 34.4, y: 58.1 }] },
        { item: 23, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 37.8, y: 59.7 }, { x: 63.6, y: 66.1 }] },
        { item: 24, partNumber: "08713", description: "Nut, Hex, Lock, M8 x 1.25, NL, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 66.9, y: 68.7 }] },
        { item: 25, partNumber: "223330", description: "Harness, Switch, Seat", category: "Interruptor y arnés", qty: 1, note: "S/N 10000000-10236151", hotspots: [{ x: 41.3, y: 44 }] },
        { item: 25, partNumber: "391951", description: "Harness, Seat, [T7/SSR]", category: "Interruptor y arnés", qty: 1, note: "S/N 10236152-", hotspots: [] },
        { item: 26, partNumber: "1020170", description: "Molding, Afmkt, Trim, PVC, .08-.11, 2ft", category: "Cubierta y tapa", qty: 1, hotspots: [{ x: 57.6, y: 48.1 }] },
        { item: 27, partNumber: "1033968", description: "Cover, Box, Battery, Afmkt, Teal [T7]", category: "Cubierta y tapa", qty: 1, note: "Teal", hotspots: [{ x: 33.7, y: 66.8 }] },
        { item: 27, partNumber: "1033972", description: "Cover, Box, Battery, Afmkt, HG [Aramark]", category: "Cubierta y tapa", qty: 1, note: "Aramark", hotspots: [] },
        { item: 28, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 2, note: "Modelo FaST", hotspots: [{ x: 34, y: 75.5 }] },
        { item: 29, partNumber: "1017218", description: "Washer, Flat, 0.321b 1.00d .12, SS", category: "Tornillería", qty: 2, note: "Modelo FaST", hotspots: [{ x: 35.1, y: 71.3 }] },
        { item: 30, partNumber: "1035037", description: "Box, Holder, CI [T7 FaST] (Teal)", category: "Cubierta y tapa", qty: 1, note: "Modelo FaST · Teal", hotspots: [{ x: 21.9, y: 96.7 }] },
        { item: 30, partNumber: "1024324", description: "Box, Holder, Trimmed [FaST] (Gray)", category: "Cubierta y tapa", qty: 1, note: "Modelo FaST · Gray", hotspots: [] },
        { item: 31, partNumber: "1016553", description: "Seal, Rbr", category: "Cubierta y tapa", qty: 2, note: "Modelo FaST", hotspots: [{ x: 17.2, y: 93.9 }, { x: 29.3, y: 98 }] },
        { item: 32, partNumber: "1048955", description: "Switch, Seat, NO [Delta 6440-04]", category: "Interruptor y arnés", qty: 1, note: "S/N 10400497-", hotspots: [{ x: 71.7, y: 39.7 }] },
        { item: 33, partNumber: "49177", description: "Screw, Pan, Phl, .31-18 x 1.00, G2", category: "Tornillería", qty: 4, note: "S/N 10400497-10611439", hotspots: [{ x: 75, y: 32.6 }, { x: 87.9, y: 38.6 }] },
        { item: 33, partNumber: "76956", description: "Screw, Hex, .31-18 x 1.25, G5", category: "Tornillería", qty: 4, note: "S/N 10611440-", hotspots: [] },
        { item: 34, partNumber: "1051052", description: "Spacer, Rnd, .38b .88d .38L", category: "Asiento", qty: 4, hotspots: [{ x: 60.7, y: 35.5 }, { x: 83.3, y: 36.8 }] },
        { item: 35, partNumber: "69461", description: "Washer, Flat, 0.38b 0.88d .12, Stl, Pl", category: "Tornillería", qty: 4, hotspots: [{ x: 60.9, y: 31.9 }, { x: 83, y: 33.8 }] },
        { item: 36, partNumber: "1046428", description: "Seal, Afmkt, Rbr, Clsd, Adh, 02ft", category: "Cubierta y tapa", qty: 1, note: "Modelo ec-H2O", hotspots: [{ x: 34.8, y: 63.3 }, { x: 94.1, y: 61 }, { x: 72.8, y: 76.6 }] },
        { item: 37, partNumber: "08713", description: "Nut, Hex, Lock, M8 x 1.25, NL, SS", category: "Tornillería", qty: 2, note: "Modelos estándar y ec-H2O", hotspots: [{ x: 3.6, y: 68 }] },
        { item: 38, partNumber: "1017218", description: "Washer, Flat, 0.32b 1.00d .12, SS", category: "Tornillería", qty: 4, note: "Modelos estándar y ec-H2O", hotspots: [{ x: 7.6, y: 69 }, { x: 17.9, y: 85.2 }] },
        { item: 39, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 2, note: "Modelos estándar y ec-H2O", hotspots: [{ x: 21.8, y: 85.7 }] },
        { item: 40, partNumber: "1051138", description: "Bracket, Cover, Fast Open [T7 ec-H2O]", category: "Cubierta y tapa", qty: 1, note: "Modelos estándar y ec-H2O", hotspots: [{ x: 5.8, y: 90.6 }] }
      ]
    },
    "data/main_frame_disk.json": {
      machine: "Tennant T7",
      group: "Main Frame Group, Disk Scrub Head",
      figure: "Fig. 4",
      image: "assets/main_frame_disk.png",
      categories: ["Chasis", "Ruedas", "Defensas y estabilizadores", "Correa estática", "Tapones y sujeción", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1054028", description: "Frame Wldt, Main, Disk [T7]", category: "Chasis", qty: 1, note: "S/N 10441903-", hotspots: [{ x: 28.2, y: 24.2 }, { x: 6.9, y: 67.4 }] },
        { item: 1, partNumber: "1010160", description: "Frame Wldt [T7] (Replaced By 1054028)", category: "Chasis", qty: 1, note: "S/N 10000000-10441902", hotspots: [] },
        { item: 2, partNumber: "1010556", description: "Stabilizer Wldt (Replaced By 1054028)", category: "Defensas y estabilizadores", qty: 2, note: "S/N 10000000-10441902", hotspots: [{ x: 30.4, y: 91.4 }] },
        { item: 3, partNumber: "1072816", description: "Screw, Hex, M8 x 1.25 x 30, SS, Sems", category: "Tornillería", qty: 3, note: "S/N 10441903-", hotspots: [{ x: 66.6, y: 41.2 }, { x: 21.2, y: 57.2 }, { x: 6.7, y: 50.2 }, { x: 48.3, y: 81 }, { x: 16.5, y: 88.3 }] },
        { item: 3, partNumber: "09010", description: "Screw, Hex, M8 x 1.25 x 25, SS", category: "Tornillería", qty: 9, note: "S/N 10000000-10441902", hotspots: [] },
        { item: 4, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 1, note: "S/N 10441903-", hotspots: [{ x: 45.7, y: 79.7 }, { x: 16.2, y: 85.5 }] },
        { item: 4, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 7, note: "S/N 10000000-10441902", hotspots: [] },
        { item: 5, partNumber: "10632-13", description: "Grommet, Rbr, 1.50id, F/ 1.8h, .19matl", category: "Tapones y sujeción", qty: 5, hotspots: [{ x: 96.3, y: 17.9 }, { x: 62.4, y: 5.2 }, { x: 73.3, y: 29 }] },
        { item: 6, partNumber: "1014318", description: "Strap, Static", category: "Correa estática", qty: 1, hotspots: [{ x: 80.1, y: 40.4 }] },
        { item: 7, partNumber: "1038560", description: "Tire Assy, Solid, 250mm x 80mm, 25mm ID", category: "Ruedas", qty: 2, hotspots: [{ x: 28.5, y: 16.6 }, { x: 71.4, y: 66.6 }] },
        { item: 8, partNumber: "09005", description: "Ring, Retaining, Ext, 1.00D, Basic", category: "Ruedas", qty: 2, hotspots: [{ x: 25.8, y: 7.8 }, { x: 84.3, y: 64.7 }] },
        { item: 9, partNumber: "1016957", description: "Cap, Vyl, 70mm ID x 25mm L", category: "Ruedas", qty: 2, hotspots: [{ x: 20.7, y: 7.4 }, { x: 88.1, y: 68.1 }] },
        { item: 10, partNumber: "1017688", description: "Bracket Wldt, Stand, Jack", category: "Chasis", qty: 2, hotspots: [{ x: 32.8, y: 58.4 }, { x: 3.1, y: 45.4 }] },
        { item: 11, partNumber: "1034731", description: "Screw, Hex, M6 x 1.00 x 16, Sems, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 38.3, y: 18.2 }] },
        { item: 12, partNumber: "140300", description: "Clamp, Cable, Stl, 0.50d [Insulated]", category: "Tapones y sujeción", qty: 1, note: "S/N 10518139-", hotspots: [{ x: 49.5, y: 36.1 }] },
        { item: 12, partNumber: "26395-1", description: "Clamp, Cable, Stl, 0.56D x 0.38W, 1H", category: "Tapones y sujeción", qty: 1, note: "S/N 10000000-10518138", hotspots: [] },
        { item: 13, partNumber: "08716", description: "Screw, Hex, M6 x 1.0 x 20, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 53.1, y: 36.4 }] },
        { item: 14, partNumber: "01684", description: "Washer, Flat, 0.25 SS", category: "Tornillería", qty: 1, hotspots: [{ x: 21.6, y: 49.5 }] },
        { item: 15, partNumber: "08712", description: "Nut, Hex, Lock, M6 x 1.0, SS, NL", category: "Tornillería", qty: 1, hotspots: [{ x: 18, y: 49.9 }] },
        { item: 16, partNumber: "1018505", description: "Horn, 12-48VDC", category: "Chasis", qty: 1, hotspots: [{ x: 57.3, y: 46 }] },
        { item: 17, partNumber: "01684", description: "Washer, Flat, 0.25 SS", category: "Tornillería", qty: 1, hotspots: [{ x: 40.6, y: 20.9 }] }
      ]
    },
    "data/main_frame.json": {
      machine: "Tennant T7",
      group: "Main Frame Group, Cylindrical Scrub Head (S/N 10000000-10448498)",
      figure: "Fig. 7",
      image: "assets/main_frame.png",
      categories: ["Chasis", "Ruedas", "Defensas y estabilizadores", "Rodillos paragolpes", "Correa estática", "Tapones y sujeción", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1023551", description: "Frame, Wldt (Replaced By 1056133 for 700 mm & 800 mm)", category: "Chasis", qty: 1, hotspots: [{ x: 20.5, y: 27.2 }] },
        { item: 2, partNumber: "1025473", description: "Stabilizer Wldt (Replaced By 1054035)", category: "Defensas y estabilizadores", qty: 2, note: "Cabezal cilíndrico 700 mm", hotspots: [{ x: 53.8, y: 52.7 }, { x: 19.7, y: 51 }] },
        { item: 3, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 7, hotspots: [{ x: 38.6, y: 52.8 }, { x: 22.5, y: 46 }, { x: 70.3, y: 24.9 }] },
        { item: 4, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 7, hotspots: [{ x: 39.4, y: 43.5 }, { x: 25.3, y: 47.3 }, { x: 75.6, y: 20.1 }] },
        { item: 5, partNumber: "10632-13", description: "Grommet, Rbr, 1.50id, F/ 1.8h, .19matl", category: "Tapones y sujeción", qty: 1, hotspots: [{ x: 79.8, y: 4.2 }] },
        { item: 6, partNumber: "71579", description: "Strap, Static, .19 1.1w 25.0L W/ Grommet", category: "Correa estática", qty: 1, hotspots: [{ x: 81.6, y: 31.4 }] },
        { item: 7, partNumber: "1038560", description: "Tire Assy, Solid, 250mm x 80mm, 25mm ID", category: "Ruedas", qty: 2, hotspots: [{ x: 31.7, y: 16 }, { x: 73.3, y: 63.8 }] },
        { item: 8, partNumber: "09005", description: "Ring, Retaining, Ext, 1.00D, Basic", category: "Ruedas", qty: 2, hotspots: [{ x: 29.3, y: 7.7 }, { x: 86, y: 62.1 }] },
        { item: 9, partNumber: "1016957", description: "Cap, Vyl, 70mm ID x 25mm L", category: "Ruedas", qty: 2, hotspots: [{ x: 23.6, y: 6.8 }, { x: 89.9, y: 65.4 }] },
        { item: 10, partNumber: "49263", description: "Tie, Cable, Nyl, 11.4L .19w 3.0 Max D", category: "Tapones y sujeción", qty: 4, hotspots: [{ x: 55.8, y: 7 }, { x: 40.5, y: 16.8 }] },
        { item: 11, partNumber: "26395-1", description: "Clamp, Cable, Stl, 0.56D x 0.38W, 1H", category: "Tapones y sujeción", qty: 1, hotspots: [{ x: 60.1, y: 56.8 }] },
        { item: 12, partNumber: "08716", description: "Screw, Hex, M6 x 1.0 x 20, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 64.6, y: 57.5 }] },
        { item: 13, partNumber: "01684", description: "Washer, Flat, 0.25 SS", category: "Tornillería", qty: 1, hotspots: [{ x: 42.9, y: 67.8 }] },
        { item: 14, partNumber: "08712", description: "Nut, Hex, Lock, M6 x 1.0, SS, NL", category: "Tornillería", qty: 1, hotspots: [{ x: 38, y: 67 }] },
        { item: 15, partNumber: "1018505", description: "Horn, 12-48VDC", category: "Chasis", qty: 1, hotspots: [{ x: 54.7, y: 35.8 }] },
        { item: 16, partNumber: "15678", description: "Screw, Hex, M6 x 1.0 x 16, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 72.8, y: 32.7 }] },
        { item: 17, partNumber: "07515", description: "Washer, Lock, Int, .25, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 70.6, y: 31.7 }] },
        { item: 18, partNumber: "01684", description: "Washer, Flat, 0.25 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 59.5, y: 35.6 }] },
        { item: 19, partNumber: "1025354", description: "Plate, Mtg, Horn", category: "Chasis", qty: 1, hotspots: [{ x: 66.6, y: 26.8 }] },
        { item: 20, partNumber: "1032947", description: "Stabilizer Wldt, W/ Rlr (Replaced By 1056133)", category: "Defensas y estabilizadores", qty: 2, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 13, y: 77.7 }, { x: 61.7, y: 76.8 }] },
        { item: 21, partNumber: "1033355", description: "Bracket, Guard, LH", category: "Rodillos paragolpes", qty: 1, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 63.2, y: 81.2 }] },
        { item: 22, partNumber: "1032971", description: "Bracket, Guard, RH", category: "Rodillos paragolpes", qty: 1, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 5, y: 67.2 }] },
        { item: 23, partNumber: "08716", description: "Screw, Hex, M6 x 1.0 x 20, SS", category: "Tornillería", qty: 4, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 15.6, y: 56.1 }, { x: 70.4, y: 79.7 }] },
        { item: 24, partNumber: "01684", description: "Washer, Flat, 0.25, SS", category: "Tornillería", qty: 8, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 18.7, y: 57 }, { x: 21.8, y: 79.8 }, { x: 49.3, y: 92.9 }, { x: 67.1, y: 79.8 }] },
        { item: 25, partNumber: "08712", description: "Nut, Hex, Lock, M6 x 1.00, SS, NL", category: "Tornillería", qty: 4, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 25, y: 81.9 }, { x: 45.2, y: 92.3 }] },
        { item: 26, partNumber: "222178", description: "Roller, PYU, 1.88d 0.53b 3.05L", category: "Rodillos paragolpes", qty: 2, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 2.2, y: 50.3 }, { x: 89.3, y: 89.5 }] },
        { item: 27, partNumber: "51528", description: "Pin, Clevis, 0.50d x 4.00L", category: "Rodillos paragolpes", qty: 2, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 7.6, y: 48.4 }, { x: 81.9, y: 82.6 }] },
        { item: 28, partNumber: "41619", description: "Washer, Flat, 0.56b 1.38d .11, SS", category: "Tornillería", qty: 2, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 5.2, y: 71.8 }, { x: 68.6, y: 94.8 }] },
        { item: 29, partNumber: "08346", description: "Pin, Cotter, .125 x 0.75", category: "Rodillos paragolpes", qty: 2, note: "Cabezal cilíndrico 800 mm", hotspots: [{ x: 5.9, y: 51.1 }, { x: 75.2, y: 78.4 }] }
      ]
    },
    "data/scrub_head_lift.json": {
      machine: "Tennant T7",
      group: "Disk Scrub Head Lift Group",
      figure: "Fig. 16",
      image: "assets/scrub_head_lift.png",
      categories: ["Actuador", "Brazos y soportes", "Pasadores y bujes", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1056622", description: "Actuator, 24VDC, 04.5strk, 0600lb", category: "Actuador", qty: 1, hotspots: [{ x: 52.6, y: 24.7 }] },
        { item: 2, partNumber: "1009356", description: "Pin, Clevis, 10mm x 40L", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 22.4, y: 10.1 }] },
        { item: 3, partNumber: "86866", description: "Pin, Hair Cotter, 0.38 D .072 Wir", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 26, y: 2.7 }, { x: 84.3, y: 58.8 }] },
        { item: 4, partNumber: "1013278", description: "Plate, Arm, Cntr, Lift, Scb Head", category: "Brazos y soportes", qty: 2, hotspots: [{ x: 32.1, y: 37.1 }, { x: 65.1, y: 50.3 }] },
        { item: 5, partNumber: "1010401", description: "Pin, Clevis, 16d x 150L", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 96.5, y: 69.8 }] },
        { item: 6, partNumber: "02942", description: "Pin, Hair Cotter, 0.62 D .120 Wir", category: "Pasadores y bujes", qty: 5, hotspots: [{ x: 92, y: 64.4 }, { x: 40.1, y: 63.3 }, { x: 59.1, y: 84.7 }] },
        { item: 7, partNumber: "1014076", description: "Bracket, Lift", category: "Brazos y soportes", qty: 1, hotspots: [{ x: 64.7, y: 71.7 }] },
        { item: 8, partNumber: "363087", description: "Bushing, Flng, 0.44b 1.25d 0.25L", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 26, y: 36.4 }, { x: 67.9, y: 52.5 }] },
        { item: 9, partNumber: "09770", description: "Screw, Hex, M10 x 1.5 x 25, SS, NL", category: "Tornillería", qty: 2, hotspots: [{ x: 21.8, y: 35.6 }, { x: 70.8, y: 54 }] },
        { item: 10, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00 .08, SS", category: "Tornillería", qty: 6, hotspots: [{ x: 65, y: 69.2 }, { x: 48.8, y: 68.9 }, { x: 41.4, y: 74.5 }, { x: 64.8, y: 74.1 }, { x: 6.3, y: 48.4 }] },
        { item: 11, partNumber: "09028", description: "Screw, Hex, M10 x 1.5 x 25, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 49.2, y: 65.9 }] },
        { item: 12, partNumber: "1015413", description: "Spring, Lift, Head, Scb", category: "Brazos y soportes", qty: 1, hotspots: [{ x: 48, y: 45.9 }] },
        { item: 13, partNumber: "1013281", description: "Sleeve, P/M, 18.5d 10.5b 34L 430 SS", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 26.7, y: 55.8 }] },
        { item: 14, partNumber: "09746", description: "Screw, Hex, M10 x 1.5 x 90, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 69.4, y: 72.4 }] },
        { item: 15, partNumber: "08714", description: "Nut, Hex, Lock, M10 x 1.5, NL, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 2.8, y: 46.8 }] },
        { item: 16, partNumber: "1013356", description: "Pin, Clevis, 12mm D x 90mm L", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 85.4, y: 60.6 }] },
        { item: 17, partNumber: "57048", description: "Washer, Flat, 0.53b 2.13d .11, Stl, Pl", category: "Tornillería", qty: 2, hotspots: [{ x: 18.6, y: 33.1 }, { x: 75.5, y: 55.1 }] },
        { item: 18, partNumber: "222027", description: "Arm, Lift, Head", category: "Brazos y soportes", qty: 2, hotspots: [{ x: 11.9, y: 93 }, { x: 27.9, y: 91.7 }] },
        { item: 19, partNumber: "222210", description: "Pin, Clevis, 0.62 D x 2.12L", category: "Pasadores y bujes", qty: 4, hotspots: [{ x: 28.2, y: 59.4 }, { x: 72.5, y: 97.9 }, { x: 28.3, y: 74.6 }] }
      ]
    }
  };

  const ALL = "Todas";

  const $ = (sel) => document.querySelector(sel);
  const els = {
    // Comunes
    toast: $("#toast"),
    themeToggle: $("#theme-toggle"),
    crumbSep: $("#crumb-sep"),
    crumbAssembly: $("#crumb-assembly"),
    // Nivel 1
    machineView: $("#view-machine"),
    globalSearch: $("#global-search"),
    globalDropdown: $("#global-dropdown"),
    globalSummary: $("#global-summary"),
    globalResults: $("#global-results"),
    machineDiagram: $("#machine-diagram"),
    machineImg: $("#machine-img"),
    zoneHotspots: $("#zone-hotspots"),
    zoneList: $("#zone-list"),
    zoneCount: $("#zone-count"),
    // Nivel 2
    assemblyView: $("#view-assembly"),
    diagram: $("#diagram"),
    img: $("#diagram-img"),
    hotspots: $("#hotspots"),
    search: $("#search"),
    filters: $("#filters"),
    body: $("#parts-body"),
    empty: $("#empty-state"),
    count: $("#result-count"),
    figureTabs: $("#figure-tabs"),
    figureLabel: $("#figure-label"),
    groupLabel: $("#group-label")
  };

  // ---------- Utilidades ----------
  const normalize = (s) =>
    String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Resalta la coincidencia de búsqueda dentro de un texto (sin romper el HTML).
  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const idx = normalize(text).indexOf(normalize(query));
    if (idx === -1) return escapeHtml(text);
    const end = idx + query.length;
    return escapeHtml(text.slice(0, idx)) + "<mark>" + escapeHtml(text.slice(idx, end)) + "</mark>" + escapeHtml(text.slice(end));
  }

  let toastTimer;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Respaldo para contextos sin Clipboard API (file://, http no seguro)
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  const jsonCache = new Map();
  async function loadJSON(url) {
    if (jsonCache.has(url)) return jsonCache.get(url);
    let data;
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (err) {
      if (!FALLBACK[url]) throw err;
      console.warn(`No se pudo cargar ${url} (${err.message}). Usando datos de respaldo embebidos.`);
      data = FALLBACK[url];
    }
    jsonCache.set(url, data);
    return data;
  }

  // Muestra un aviso si la imagen de un diagrama no existe
  function bindImageFallback(img) {
    const placeholder = img.parentElement.querySelector(".diagram-placeholder");
    img.addEventListener("error", () => {
      img.hidden = true;
      placeholder.hidden = false;
    });
    img.addEventListener("load", () => {
      img.hidden = false;
      placeholder.hidden = true;
    });
    if (img.complete && img.getAttribute("src") && img.naturalWidth === 0) {
      img.hidden = true;
      placeholder.hidden = false;
    }
  }

  // Alt + clic sobre un diagrama: copia coordenadas (%) para calibrar hotspots
  function bindCoordinatePicker(container) {
    container.addEventListener("click", (e) => {
      if (!e.altKey) return;
      const r = container.getBoundingClientRect();
      const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
      const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
      const snippet = `{ "x": ${x}, "y": ${y} }`;
      console.log(snippet);
      copyText(snippet);
      showToast(`Coordenadas copiadas: x=${x}%, y=${y}%`);
    });
  }

  /* ==========================================================
     NIVEL 1 · Máquina completa
     ========================================================== */
  const MachineView = {
    data: null,

    async init() {
      this.data = await loadJSON(MACHINE_URL);
      if (this.data.image) els.machineImg.src = this.data.image;
      this.render();

      const onZone = (e) => {
        const el = e.target.closest("[data-zone]");
        if (el) this.openZone(el.dataset.zone);
      };
      els.zoneHotspots.addEventListener("click", onZone);
      els.zoneList.addEventListener("click", onZone);

      // Hover sincronizado entre tarjeta y zona en la imagen
      const syncHover = (e, on) => {
        const el = e.target.closest("[data-zone]");
        if (!el || (!on && el.contains(e.relatedTarget))) return;
        document
          .querySelectorAll(`[data-zone="${el.dataset.zone}"]`)
          .forEach((n) => n.classList.toggle("is-active", on));
      };
      [els.zoneHotspots, els.zoneList].forEach((c) => {
        c.addEventListener("mouseover", (e) => syncHover(e, true));
        c.addEventListener("mouseout", (e) => syncHover(e, false));
      });
    },

    zone(id) {
      return this.data.zones.find((z) => z.id === id);
    },

    render() {
      const zones = this.data.zones;
      const available = zones.filter((z) => z.status === "available").length;
      els.zoneCount.textContent = `${available} / ${zones.length} disponibles`;

      els.zoneHotspots.innerHTML = zones
        .map((z, i) => {
          const soon = z.status !== "available";
          // Evita que la etiqueta se salga del diagrama en los bordes
          // "labelSide" en machine.json fuerza el lado si la etiqueta choca con otra
          const side = z.labelSide ? `label-${z.labelSide}` : z.hotspot.x > 70 ? "label-left" : z.hotspot.x < 30 ? "label-right" : "";
          return `<button type="button" class="zone-hotspot ${side} ${soon ? "is-soon" : ""}" data-zone="${z.id}"
                    style="left:${z.hotspot.x}%;top:${z.hotspot.y}%"
                    aria-label="${escapeHtml(z.name)}${soon ? " (próximamente)" : ""}">
                    <span class="zone-dot" aria-hidden="true">${i + 1}</span>
                    <span class="zone-label">${escapeHtml(z.name)}${soon ? " · Próximamente" : ""}</span>
                  </button>`;
        })
        .join("");

      els.zoneList.innerHTML = zones
        .map((z, i) => {
          const soon = z.status !== "available";
          return `<li>
            <button type="button" class="zone-card ${soon ? "is-soon" : ""}" data-zone="${z.id}">
              <span class="zone-index" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
              <span class="zone-card-text">
                <strong>${escapeHtml(z.name)}</strong>
                <span>${escapeHtml(z.description || "")}${z.figure ? ` · ${escapeHtml(z.figure)}` : ""}</span>
              </span>
              ${soon ? `<span class="tag tag-soon">Próximamente</span>` : `<span class="tag tag-ok">Ver despiece →</span>`}
            </button>
          </li>`;
        })
        .join("");
    },

    openZone(id) {
      const z = this.zone(id);
      if (!z) return;
      if (z.status !== "available") {
        showToast(`${z.name}: despiece próximamente`);
        return;
      }
      location.hash = `#/zona/${z.id}`;
    }
  };

  /* ==========================================================
     NIVEL 2 · Despiece por subensamble
     ========================================================== */
  const AssemblyView = {
    state: { parts: [], categories: [], query: "", category: ALL, activeItem: null },
    loadedUrl: null,

    init() {
      bindImageFallback(els.img);
      bindCoordinatePicker(els.diagram);
      this.bindEvents();

      // En escritorio el diagrama queda fijo al hacer scroll: se limita su ancho para que
      // un plano vertical (p. ej. Fig. 10) quepa completo en la altura visible.
      const fit = () => this.fitDiagram();
      els.img.addEventListener("load", fit);
      window.addEventListener("resize", fit);
    },

    fitDiagram() {
      const { naturalWidth: w, naturalHeight: h } = els.img;
      if (!w || !h || window.innerWidth <= 960) {
        els.diagram.style.maxWidth = "";
        return;
      }
      const available = window.innerHeight - 220; // encabezado + barra + márgenes del panel
      els.diagram.style.maxWidth = `min(760px, ${Math.max(320, Math.round((available * w) / h))}px)`;
    },

    async load(zone, figure) {
      if (this.loadedUrl === figure.data) return; // ya cargado: se conserva búsqueda/selección
      const data = await loadJSON(figure.data);

      this.loadedUrl = figure.data;
      Object.assign(this.state, {
        parts: [...data.parts].sort((a, b) => a.item - b.item),
        categories: data.categories || [...new Set(data.parts.map((p) => p.category))],
        query: "",
        category: ALL,
        activeItem: null
      });
      els.search.value = "";
      els.img.src = data.image;
      els.img.alt = `${data.figure || ""} - ${data.group || zone.name}`;
      els.figureLabel.textContent = data.figure || zone.figure || "";
      els.groupLabel.textContent = data.group || zone.description || zone.name;

      this.renderFilters();
      this.renderHotspots();
      this.renderTable();
    },

    filteredParts() {
      const { parts, query, category } = this.state;
      const q = normalize(query.trim());
      return parts.filter((p) => {
        const matchCat = category === ALL || p.category === category;
        const matchQuery =
          !q ||
          normalize(p.description).includes(q) ||
          normalize(p.partNumber).includes(q) ||
          (p.note && normalize(p.note).includes(q)) ||
          String(p.item) === q;
        return matchCat && matchQuery;
      });
    },

    renderFilters() {
      const all = [ALL, ...this.state.categories];
      els.filters.innerHTML = all
        .map((c) => `<button type="button" class="chip" data-category="${escapeHtml(c)}" aria-pressed="${c === this.state.category}">${escapeHtml(c)}</button>`)
        .join("");
    },

    // Un ítem puede aparecer varias veces en el diagrama (p. ej. las 4 perillas del ítem 3)
    renderHotspots() {
      els.hotspots.innerHTML = this.state.parts
        .flatMap((p) =>
          (p.hotspots || [p.hotspot]).filter(Boolean).map(
            (h) => `<button type="button" class="hotspot" data-item="${p.item}"
                    style="left:${h.x}%;top:${h.y}%"
                    aria-label="Ítem ${p.item}: ${escapeHtml(p.description)}"
                    title="${p.item} · ${escapeHtml(p.description)}">${p.item}</button>`
          )
        )
        .join("");
    },

    renderTable() {
      const rows = this.filteredParts();
      const q = this.state.query.trim();

      els.body.innerHTML = rows
        .map(
          (p) => `<tr data-item="${p.item}" data-pn="${escapeHtml(p.partNumber)}" tabindex="0" class="${p.item === this.state.activeItem ? "is-active" : ""}">
            <td><span class="item-num">${p.item}</span></td>
            <td class="pn">${highlight(p.partNumber, q)}</td>
            <td>${highlight(p.description, q)}<span class="desc-cat">${escapeHtml(p.category)}${p.note ? ` · ${highlight(p.note, q)}` : ""}</span></td>
            <td class="num">${p.qty}</td>
            <td><button type="button" class="copy-btn" data-copy="${escapeHtml(p.partNumber)}">Copiar Ref</button></td>
          </tr>`
        )
        .join("");

      els.empty.hidden = rows.length > 0;
      els.count.textContent = `${rows.length} / ${this.state.parts.length}`;

      // Atenúa en el diagrama los ítems que no están en el resultado filtrado
      const visible = new Set(rows.map((p) => p.item));
      const filtering = rows.length !== this.state.parts.length;
      els.hotspots.querySelectorAll(".hotspot").forEach((h) => {
        h.classList.toggle("is-dimmed", filtering && !visible.has(Number(h.dataset.item)));
      });
    },

    // ---------- Sincronización hotspot <-> fila ----------
    setHotspotHighlight(item, on) {
      els.hotspots.querySelectorAll(`.hotspot[data-item="${item}"]`).forEach((h) =>
        h.classList.toggle("is-active", on || item === this.state.activeItem)
      );
    },

    // partNumber: cuando un ítem tiene varias filas (variantes), indica a cuál desplazarse
    selectItem(item, { scroll = false, partNumber = null } = {}) {
      const s = this.state;
      s.activeItem = s.activeItem === item && !scroll ? null : item;

      els.hotspots.querySelectorAll(".hotspot").forEach((h) =>
        h.classList.toggle("is-active", Number(h.dataset.item) === s.activeItem)
      );

      const findRow = () =>
        (partNumber && els.body.querySelector(`tr[data-item="${item}"][data-pn="${CSS.escape(partNumber)}"]`)) ||
        els.body.querySelector(`tr[data-item="${item}"]`);
      let row = findRow();

      // Si la fila está oculta por un filtro, se limpia para poder mostrarla
      if ((!row || (partNumber && row.dataset.pn !== partNumber)) && scroll) {
        s.query = "";
        s.category = ALL;
        els.search.value = "";
        this.renderFilters();
        this.renderTable();
        row = findRow();
      }

      els.body.querySelectorAll("tr").forEach((tr) => {
        tr.classList.toggle("is-active", Number(tr.dataset.item) === s.activeItem);
        tr.classList.remove("is-target");
      });
      // Fila exacta pedida (p. ej. desde el buscador global) cuando el ítem tiene variantes
      if (row && partNumber && row.dataset.pn === partNumber) row.classList.add("is-target");

      if (row && scroll) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.classList.remove("flash");
        void row.offsetWidth; // reinicia la animación
        row.classList.add("flash");
      }
    },

    bindEvents() {
      // Hotspot -> fila
      els.hotspots.addEventListener("click", (e) => {
        const h = e.target.closest(".hotspot");
        if (!h) return;
        e.stopPropagation();
        this.selectItem(Number(h.dataset.item), { scroll: true });
      });

      // Fila -> hotspot (hover)
      els.body.addEventListener("mouseover", (e) => {
        const tr = e.target.closest("tr[data-item]");
        if (tr) this.setHotspotHighlight(Number(tr.dataset.item), true);
      });
      els.body.addEventListener("mouseout", (e) => {
        const tr = e.target.closest("tr[data-item]");
        if (tr && !tr.contains(e.relatedTarget)) this.setHotspotHighlight(Number(tr.dataset.item), false);
      });

      // Fila -> hotspot (selección por clic o teclado) y botón "Copiar Ref"
      els.body.addEventListener("click", async (e) => {
        const btn = e.target.closest(".copy-btn");
        if (btn) {
          const ref = btn.dataset.copy;
          if (await copyText(ref)) {
            btn.textContent = "¡Copiado!";
            btn.classList.add("copied");
            showToast(`Ref ${ref} copiada al portapapeles`);
            setTimeout(() => {
              btn.textContent = "Copiar Ref";
              btn.classList.remove("copied");
            }, 1500);
          } else {
            showToast("No se pudo copiar la referencia");
          }
          return;
        }
        const tr = e.target.closest("tr[data-item]");
        if (tr) this.selectItem(Number(tr.dataset.item));
      });
      els.body.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const tr = e.target.closest("tr[data-item]");
        if (tr && e.target === tr) {
          e.preventDefault();
          this.selectItem(Number(tr.dataset.item));
        }
      });

      // Buscador en tiempo real
      els.search.addEventListener("input", () => {
        this.state.query = els.search.value;
        this.renderTable();
      });

      // Filtros por categoría
      els.filters.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        this.state.category = chip.dataset.category;
        els.filters.querySelectorAll(".chip").forEach((c) =>
          c.setAttribute("aria-pressed", String(c === chip))
        );
        this.renderTable();
      });

      // Atajos: "/" enfoca el buscador, Esc lo limpia (solo en el Nivel 2)
      document.addEventListener("keydown", (e) => {
        if (els.assemblyView.hidden) return;
        if (e.key === "/" && document.activeElement !== els.search) {
          e.preventDefault();
          els.search.focus();
        } else if (e.key === "Escape" && document.activeElement === els.search) {
          els.search.value = "";
          this.state.query = "";
          this.renderTable();
        }
      });
    }
  };

  /* ==========================================================
     Navegación entre niveles
     ========================================================== */
  function showView(view) {
    const views = [els.machineView, els.assemblyView];
    if (!view.hidden) return;
    views.forEach((v) => {
      v.hidden = v !== view;
      v.classList.remove("view-enter");
    });
    void view.offsetWidth; // reinicia la animación de entrada
    view.classList.add("view-enter");
    window.scrollTo({ top: 0 });
  }

  function setBreadcrumb(zone) {
    els.crumbSep.hidden = !zone;
    els.crumbAssembly.hidden = !zone;
    els.crumbAssembly.textContent = zone ? zone.name : "";
    document.title = zone ? `Tennant T7 · ${zone.name}` : "Tennant T7 · Visor de despiece";
  }

  // Una zona puede tener una sola figura ("data") o varias ("figures"), p. ej. Tanques: Fig. 27 y Fig. 29
  const figuresOf = (zone) => zone.figures || [{ label: zone.figure, data: zone.data }];

  function renderFigureTabs(zone, index) {
    const figures = figuresOf(zone);
    els.figureTabs.hidden = figures.length < 2;
    els.figureTabs.innerHTML = figures
      .map(
        (f, i) => `<a role="tab" class="figure-tab" href="#/zona/${zone.id}/${i + 1}"
                     aria-selected="${i === index}">${escapeHtml(f.label || `Figura ${i + 1}`)}</a>`
      )
      .join("");
  }

  /* ==========================================================
     Buscador global (Nivel 1): busca en los repuestos de todas las zonas
     ========================================================== */
  const MAX_RESULTS = 50;

  const GlobalSearch = {
    index: [],     // { zone, figureIndex, figure, part, haystack }
    ready: null,   // promesa de construcción del índice
    results: [],
    active: -1,

    init() {
      this.ready = this.buildIndex();
      this.bindEvents();
    },

    async buildIndex() {
      const jobs = MachineView.data.zones
        .filter((z) => z.status === "available")
        .flatMap((zone) =>
          figuresOf(zone).map(async (figure, figureIndex) => {
            const data = await loadJSON(figure.data);
            return data.parts.map((part) => ({
              zone,
              figureIndex,
              figure: data.figure || figure.label || "",
              part,
              haystack: normalize([part.partNumber, part.description, part.note || "", zone.name, data.figure || ""].join(" "))
            }));
          })
        );
      const settled = await Promise.allSettled(jobs);
      settled.forEach((r) => (r.status === "fulfilled" ? this.index.push(...r.value) : console.error(r.reason)));
    },

    // Todas las palabras deben aparecer. Orden: Part Number exacto, Part Number que empieza igual, resto.
    search(query) {
      const q = normalize(query.trim());
      const tokens = q.split(/\s+/).filter(Boolean);
      if (!tokens.length) return [];
      // Palabras completas antes que fragmentos: "roller" debe priorizar "Roller" sobre "Controller"
      const wordStart = tokens.map((t) => new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
      const score = (e) => {
        const pn = normalize(e.part.partNumber);
        if (pn === q) return 0;
        if (pn.startsWith(q)) return 1;
        if (pn.includes(q)) return 2;
        if (wordStart.every((re) => re.test(e.haystack))) return 3;
        return 4;
      };
      return this.index
        .filter((e) => tokens.every((t) => e.haystack.includes(t)))
        .map((e) => ({ e, s: score(e) }))
        .sort((a, b) => a.s - b.s)
        .map(({ e }) => e);
    },

    async update() {
      const query = els.globalSearch.value;
      if (!query.trim()) return this.close();
      await this.ready;
      if (els.globalSearch.value !== query) return; // el usuario siguió escribiendo

      this.results = this.search(query);
      this.active = this.results.length ? 0 : -1;
      // Resalta la palabra más larga de la búsqueda
      const mark = query.trim().split(/\s+/).sort((a, b) => b.length - a.length)[0];

      const shown = this.results.slice(0, MAX_RESULTS);
      els.globalSummary.textContent = !this.results.length
        ? `Sin resultados para «${query.trim()}»`
        : this.results.length > MAX_RESULTS
          ? `Mostrando ${MAX_RESULTS} de ${this.results.length} resultados · sigue escribiendo para afinar`
          : `${this.results.length} resultado${this.results.length === 1 ? "" : "s"}`;

      els.globalResults.innerHTML = shown
        .map(({ zone, figure, part }, i) => `<li role="option" id="gr-${i}" class="gr-item" data-index="${i}" aria-selected="${i === this.active}">
            <span class="item-num" title="Ítem ${part.item}">${part.item}</span>
            <span class="gr-main">
              <span class="gr-line"><span class="pn">${highlight(part.partNumber, mark)}</span> <span class="gr-desc">${highlight(part.description, mark)}</span></span>
              ${part.note ? `<span class="gr-note">${highlight(part.note, mark)}</span>` : ""}
            </span>
            <span class="gr-zone">${escapeHtml(zone.name)}<small>${escapeHtml(figure)}</small></span>
          </li>`)
        .join("");

      this.open();
      this.syncActive();
    },

    open() {
      els.globalDropdown.hidden = false;
      els.globalSearch.setAttribute("aria-expanded", "true");
    },

    close() {
      els.globalDropdown.hidden = true;
      els.globalSearch.setAttribute("aria-expanded", "false");
      els.globalSearch.removeAttribute("aria-activedescendant");
    },

    syncActive() {
      els.globalResults.querySelectorAll(".gr-item").forEach((li) => {
        const on = Number(li.dataset.index) === this.active;
        li.setAttribute("aria-selected", String(on));
        if (on) li.scrollIntoView({ block: "nearest" });
      });
      if (this.active >= 0) els.globalSearch.setAttribute("aria-activedescendant", `gr-${this.active}`);
    },

    // Navega a la zona/figura del repuesto; route() selecciona la fila e ilumina el hotspot
    go(i) {
      const r = this.results[i];
      if (!r) return;
      const params = new URLSearchParams({ item: r.part.item, pn: r.part.partNumber });
      this.close();
      els.globalSearch.value = "";
      location.hash = `#/zona/${r.zone.id}/${r.figureIndex + 1}?${params}`;
    },

    bindEvents() {
      els.globalSearch.addEventListener("input", () => this.update());
      els.globalSearch.addEventListener("focus", () => els.globalSearch.value.trim() && this.update());

      els.globalSearch.addEventListener("keydown", (e) => {
        const shown = Math.min(this.results.length, MAX_RESULTS);
        if (e.key === "ArrowDown" && shown) {
          e.preventDefault();
          this.active = (this.active + 1) % shown;
          this.syncActive();
        } else if (e.key === "ArrowUp" && shown) {
          e.preventDefault();
          this.active = (this.active - 1 + shown) % shown;
          this.syncActive();
        } else if (e.key === "Enter" && !els.globalDropdown.hidden && this.active >= 0) {
          e.preventDefault();
          this.go(this.active);
        } else if (e.key === "Escape") {
          if (!els.globalDropdown.hidden) this.close();
          else els.globalSearch.value = "";
        }
      });

      els.globalResults.addEventListener("click", (e) => {
        const li = e.target.closest(".gr-item");
        if (li) this.go(Number(li.dataset.index));
      });
      els.globalResults.addEventListener("mousemove", (e) => {
        const li = e.target.closest(".gr-item");
        if (li && Number(li.dataset.index) !== this.active) {
          this.active = Number(li.dataset.index);
          els.globalResults.querySelectorAll(".gr-item").forEach((x) =>
            x.setAttribute("aria-selected", String(x === li))
          );
        }
      });

      // Botones de ejemplo bajo el buscador
      document.querySelectorAll("[data-example]").forEach((btn) =>
        btn.addEventListener("click", () => {
          els.globalSearch.value = btn.dataset.example;
          els.globalSearch.focus();
          this.update();
        })
      );

      // Cierra al hacer clic fuera
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".global-search, [data-example]")) this.close();
      });

      // "/" enfoca el buscador global en el Nivel 1
      document.addEventListener("keydown", (e) => {
        if (els.machineView.hidden || e.key !== "/" || document.activeElement === els.globalSearch) return;
        e.preventDefault();
        els.globalSearch.focus();
      });
    }
  };

  async function route() {
    // #/zona/<id>  o  #/zona/<id>/<n.º de figura, desde 1>
    // Opcional: ?item=<n>&pn=<part number> selecciona ese repuesto (lo usa el buscador global)
    const match = location.hash.match(/^#\/zona\/([\w-]+)(?:\/(\d+))?/);
    const zone = match && MachineView.zone(match[1]);
    const params = new URLSearchParams(location.hash.split("?")[1] || "");

    if (zone && zone.status === "available") {
      const figures = figuresOf(zone);
      const index = Math.min(Math.max(Number(match[2] || 1) - 1, 0), figures.length - 1);
      const changingFigure = !els.assemblyView.hidden && AssemblyView.loadedUrl !== figures[index].data;
      try {
        await AssemblyView.load(zone, figures[index]);
      } catch (err) {
        console.error(err);
        showToast(`No se pudo cargar el despiece de ${zone.name}`);
        location.hash = "#/";
        return;
      }
      renderFigureTabs(zone, index);
      setBreadcrumb(zone);
      showView(els.assemblyView);
      if (changingFigure) {
        // Cambio de pestaña dentro de la misma zona: repite la animación de entrada
        els.assemblyView.classList.remove("view-enter");
        void els.assemblyView.offsetWidth;
        els.assemblyView.classList.add("view-enter");
      }
      if (params.has("item")) {
        // Espera a que la vista se pinte para que el desplazamiento llegue a la fila
        requestAnimationFrame(() =>
          AssemblyView.selectItem(Number(params.get("item")), { scroll: true, partNumber: params.get("pn") })
        );
      }
    } else {
      if (match) history.replaceState(null, "", "#/"); // zona inexistente o no disponible
      setBreadcrumb(null);
      showView(els.machineView);
    }
  }

  // ---------- Tema claro/oscuro ----------
  function initTheme() {
    const root = document.documentElement;
    let saved = null;
    try { saved = localStorage.getItem("t7-theme"); } catch {}
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = saved || (prefersDark ? "dark" : "light");

    els.themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("t7-theme", next); } catch {}
    });
  }

  // ---------- Inicio ----------
  async function init() {
    initTheme();
    bindImageFallback(els.machineImg);
    bindCoordinatePicker(els.machineDiagram);
    AssemblyView.init();

    // Ambas vistas arrancan ocultas para que la primera tenga animación de entrada
    els.machineView.hidden = true;
    await MachineView.init();
    GlobalSearch.init();
    window.addEventListener("hashchange", route);
    route();
  }

  init();
})();
