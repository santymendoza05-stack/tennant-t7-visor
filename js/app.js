/* ==========================================================
   Tennant T7 / T12 · Visor de despiece jerárquico
   Nivel 1: Máquina completa (zonas)  ->  Nivel 2: Despiece por subensamble

   Rutas (hash):
     #/                        -> Nivel 1 de la última máquina elegida
     #/<máquina>/              -> Nivel 1 (p. ej. #/t12/)
     #/<máquina>/zona/<id>     -> Nivel 2 (p. ej. #/t12/zona/racleta-trasera)
     #/zona/<id>               -> enlaces antiguos: Nivel 2 de la máquina por defecto (T7)
   ========================================================== */
(() => {
  "use strict";

  // Lista de máquinas: cada una apunta a su machine.json (zonas, plano general, sistemas)
  const MACHINES_URL = "data/machines.json";

  // Copias de respaldo usadas solo si fetch() falla (p. ej. al abrir index.html
  // con doble clic vía file://). Mantener sincronizadas con los JSON de data/.
  const FALLBACK = {
    "data/machines.json": {
      default: "t7",
      machines: [
        { id: "t7", name: "Tennant T7", short: "T7", manual: "9013606", data: "data/machine.json", examples: ["1010560", "motor", "squeegee blade", "sensor level"] },
        { id: "t12", name: "Tennant T12", short: "T12", manual: "9012729", data: "data/t12/machine.json", examples: ["1200384", "motor", "squeegee blade", "battery"] }
      ]
    },
    "data/machine.json": {
      machine: "Tennant T7",
      title: "Fregadora de conductor sentado",
      image: "assets/t7_full.png",
      systems: [
        { id: "lavado", name: "Lavado y Secado", icon: "brush" },
        { id: "traccion", name: "Tracción y Chasis", icon: "wheel" },
        { id: "agua", name: "Agua y Aspiración", icon: "drop" },
        { id: "electrico", name: "Eléctrico y Control", icon: "bolt" }
      ],
      zones: [
        { id: "racleta-trasera", name: "Racleta Trasera", system: "lavado", description: "Rear Squeegee Group, 800 mm", figure: "Fig. 37", status: "available", data: "data/squeegee_parts.json", hotspot: { x: 91.9, y: 69.1 } },
        { id: "cabeza-cepillos", name: "Cabeza de Cepillos", system: "lavado", description: "Disk Scrub Head Drive Motor Group, 800 mm", figure: "Fig. 18", status: "available", data: "data/scrub_head_disk_800.json", hotspot: { x: 61.8, y: 85.9 } },
        { id: "tanques", name: "Tanques de Solución y Recuperación", system: "agua", description: "Recovery & Solution Tank Group", figure: "Fig. 27 / 29 / 30", status: "available", figures: [{ label: "Fig. 27 · Tanque de recuperación", data: "data/recovery_tank.json" }, { label: "Fig. 29 · Solución (disco)", data: "data/solution_tank_disk.json" }, { label: "Fig. 30 · Solución (cilíndrico)", data: "data/solution_tank_cyl.json" }], hotspot: { x: 76.5, y: 20.1 } },
        { id: "rueda-motriz", name: "Rueda Motriz / Tracción", system: "traccion", description: "Front Drive Wheel Group (S/N 10518139-)", figure: "Fig. 11", status: "available", data: "data/front_drive_wheel.json", hotspot: { x: 25.7, y: 92.3 } },
        { id: "panel-instrumentos", name: "Panel de Instrumentos / Consola", system: "electrico", description: "Instrument Panel & Circuit Board Group", figure: "Fig. 10 / 38", status: "available", figures: [{ label: "Fig. 10 · Panel de instrumentos", data: "data/instrument_panel.json" }, { label: "Fig. 38 · Tarjeta controladora", data: "data/circuit_board.json" }], hotspot: { x: 24, y: 38 } },
        { id: "columna-direccion", name: "Columna de Dirección / Volante", system: "traccion", description: "Steering Group", figure: "Fig. 9", status: "available", data: "data/steering_group.json", hotspot: { x: 34.6, y: 30.2 } },
        { id: "asiento-cubierta", name: "Asiento y Cubierta de Baterías", system: "traccion", description: "Seat Group", figure: "Fig. 8", status: "available", data: "data/seat_group.json", hotspot: { x: 55.9, y: 37.6 }, labelSide: "right" },
        { id: "chasis-bastidor", name: "Chasis y Bastidor Principal", system: "traccion", description: "Main Frame Group", figure: "Fig. 4 / 7", status: "available", figures: [{ label: "Fig. 4 · Cabezal de disco", data: "data/main_frame_disk.json" }, { label: "Fig. 7 · Cilíndrico (S/N hasta 10448498)", data: "data/main_frame.json" }], hotspot: { x: 58.8, y: 67.1 } },
        { id: "elevacion-cabezal", name: "Mecanismo de Elevación del Cabezal", system: "lavado", description: "Disk Scrub Head Lift Group", figure: "Fig. 16", status: "available", data: "data/scrub_head_lift.json", hotspot: { x: 46, y: 76 }, labelSide: "left" },
        { id: "motor-aspiracion", name: "Motor de Aspiración y Silenciador", system: "agua", description: "Vacuum Fan Group", figure: "Fig. 28", status: "available", data: "data/vacuum_fan.json", hotspot: { x: 86, y: 33 }, labelSide: "left" },
        { id: "drenaje-tanques", name: "Sistema de Drenaje de Tanques", system: "agua", description: "Tanks Drain Group", figure: "Fig. 31", status: "available", data: "data/tanks_drain.json", hotspot: { x: 86, y: 50 }, labelSide: "left" },
        { id: "baterias", name: "Sistema de Baterías y Alimentación", system: "electrico", description: "Battery Group, 235Ah (S/N 10523206-)", figure: "Fig. 32", status: "available", data: "data/battery_group.json", hotspot: { x: 44, y: 56 }, labelSide: "left" },
        { id: "elevacion-racleta", name: "Mecanismo de Elevación de Racleta", system: "lavado", description: "Rear Squeegee Lift Group", figure: "Fig. 34 / 35", status: "available", figures: [{ label: "Fig. 34 · Cabezal de disco", data: "data/squeegee_lift.json" }, { label: "Fig. 35 · Cabezal cilíndrico", data: "data/squeegee_lift_cyl.json" }], hotspot: { x: 80, y: 77 }, labelSide: "left" }
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
    "data/solution_tank_cyl.json": {
      machine: "Tennant T7",
      group: "Solution Tank Group, Cylindrical Scrub Head",
      figure: "Fig. 30",
      image: "assets/solution_tank_cyl.png",
      categories: ["Tanque", "Fluido", "Soportes", "Eléctrico", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1034271", description: "Tank, Soltn, W/ Label [T7]", category: "Tanque", qty: 1, hotspots: [{ x: 9.1, y: 57.7 }] },
        { item: 1, partNumber: "1036378", description: "Tank, Soltn, Cylrcl, HG, Afmkt, TJ (Japan)", category: "Tanque", qty: 1, note: "Versión Japón", hotspots: [] },
        { item: 2, partNumber: "1012505", description: "Cover, Tank, Soltn [T7]", category: "Tanque", qty: 1, hotspots: [{ x: 14.6, y: 25.8 }] },
        { item: 3, partNumber: "1020317", description: "Catch, Cover [T7]", category: "Tanque", qty: 2, hotspots: [{ x: 22.8, y: 16.4 }, { x: 33.9, y: 21.6 }] },
        { item: 4, partNumber: "1020292", description: "Plate, Cover, Tab [T7]", category: "Tanque", qty: 2, hotspots: [{ x: 35.8, y: 29.4 }, { x: 47.4, y: 33.7 }] },
        { item: 5, partNumber: "1020727", description: "Seal, Afmkt, Bulb, Clsd Cell, Adh, 8ft", category: "Tanque", qty: 1, hotspots: [{ x: 17.1, y: 39 }] },
        { item: 6, partNumber: "1020719", description: "Seal, Afmkt, Bulb, Clsd Cell, Adh, 8ft", category: "Tanque", qty: 1, hotspots: [{ x: 26.1, y: 30.4 }] },
        { item: 7, partNumber: "1021677", description: "Rivet, Blind, .156D x 0.55 x .38D, SS", category: "Tornillería", qty: 10, hotspots: [{ x: 20.6, y: 22.1 }, { x: 39, y: 36 }, { x: 7.4, y: 35.2 }] },
        { item: 8, partNumber: "1014072", description: "Bracket, Mtg, Tank", category: "Soportes", qty: 1, hotspots: [{ x: 62.2, y: 61.1 }] },
        { item: 9, partNumber: "130773", description: "Tie, Cable, Nyl, 11.0L, .14W, 3.0 Max. D", category: "Eléctrico", qty: 1, hotspots: [{ x: 54.9, y: 92.6 }] },
        { item: 10, partNumber: "1017218", description: "Washer, Flat, 0.321b 1.00d .12, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 48.7, y: 60 }, { x: 61.3, y: 58.1 }] },
        { item: 11, partNumber: "1011885", description: "Cap, Tank", category: "Tanque", qty: 1, hotspots: [{ x: 53.8, y: 23.7 }] },
        { item: 12, partNumber: "1011852", description: "Arm, Tank, Retaining", category: "Soportes", qty: 1, hotspots: [{ x: 63.3, y: 23.5 }] },
        { item: 13, partNumber: "222516", description: "Sleeve, P/M, 0.496d 0.318b 0.31L 430SS", category: "Soportes", qty: 5, hotspots: [{ x: 47.7, y: 23.8 }, { x: 39.9, y: 16.9 }, { x: 72.6, y: 19.2 }] },
        { item: 14, partNumber: "1016430", description: "Screw, Btn, M8 x 1.25 x 25, 10.9, Blk", category: "Tornillería", qty: 4, hotspots: [{ x: 43.1, y: 21.9 }, { x: 38.9, y: 10.5 }, { x: 61.7, y: 17.9 }] },
        { item: 15, partNumber: "1016435", description: "Washer, Flat, 0.52b 0.75d .06, Stl, Blk", category: "Tornillería", qty: 3, hotspots: [{ x: 45.4, y: 23.2 }, { x: 59.9, y: 16.1 }] },
        { item: 16, partNumber: "398770", description: "Strainer, Soltn, 80mesh Cyl 1.3d 3.5L", category: "Fluido", qty: 1, hotspots: [{ x: 70.6, y: 26 }] },
        { item: 17, partNumber: "377349", description: "Fitting, Plstc, PF12/PF12, BH", category: "Fluido", qty: 1, hotspots: [{ x: 77.5, y: 52.5 }] },
        { item: 18, partNumber: "73468", description: "Fitting, Plstc, E90, BM10/PM12", category: "Fluido", qty: 1, hotspots: [{ x: 76.8, y: 58.1 }] },
        { item: 19, partNumber: "82829", description: "Clamp, Cable, Stl, 0.63d x 0.75w, 1hole", category: "Eléctrico", qty: 2, hotspots: [{ x: 88.9, y: 46.8 }] },
        { item: 20, partNumber: "67767", description: "Clamp, Cable, Stl, 0.69d x 0.62w, 1h", category: "Eléctrico", qty: 1, hotspots: [{ x: 88.5, y: 41.7 }] },
        { item: 21, partNumber: "1019879", description: "Conduit, Nylon, .50d 3.0L", category: "Eléctrico", qty: 1, hotspots: [{ x: 90.4, y: 39.6 }] },
        { item: 22, partNumber: "15675", description: "Screw, Hex, M8 x 1.25 x 16, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 90, y: 32.2 }, { x: 87.7, y: 44.4 }] },
        { item: 23, partNumber: "385685", description: "Sensor, Level, Liquid, 14VDC 01A .62-11", category: "Eléctrico", qty: 1, hotspots: [{ x: 85.9, y: 27.2 }] },
        { item: 24, partNumber: "1035355", description: "Hose, Afmkt, PVC, Clr, 0.62ID, 02Ft", category: "Fluido", qty: 2, hotspots: [{ x: 35.4, y: 65.6 }] },
        { item: 25, partNumber: "63810", description: "Clamp, Hose, Wormdrive, 0.56-1.06d, .56w", category: "Fluido", qty: 1, hotspots: [{ x: 49.5, y: 94.4 }] },
        { item: 26, partNumber: "49800", description: "Latch, Draw, Soft, Rbr W/ Keeper", category: "Tanque", qty: 2, hotspots: [{ x: 17, y: 41.6 }, { x: 38.5, y: 63.7 }] },
        { item: 27, partNumber: "607006", description: "Screw, Trs, M4 x 0.70 x 12, Phl, Pl", category: "Tornillería", qty: 4, hotspots: [{ x: 7.4, y: 49 }] },
        { item: 28, partNumber: "1035394", description: "Washer, Flat, 0.17b 0.38d .04, SS", category: "Tornillería", qty: 4, hotspots: [{ x: 12.4, y: 35.2 }] },
        { item: 29, partNumber: "01685", description: "Washer, Flat, 0.31 SS", category: "Tornillería", qty: 2, hotspots: [{ x: 40.7, y: 13.6 }, { x: 75.5, y: 19.9 }] },
        { item: 30, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 60.8, y: 55.4 }, { x: 46.8, y: 61.2 }] },
        { item: 31, partNumber: "1015026", description: "Hose, Afmkt, PVC, Brd, 0.62ID, 03ft, Clr", category: "Fluido", qty: 1, hotspots: [{ x: 62.1, y: 87.6 }] },
        { item: 32, partNumber: "41440", description: "Fitting, Plstc, Str, BM10/PM08", category: "Fluido", qty: 4, hotspots: [{ x: 9.9, y: 71.8 }, { x: 17.3, y: 75.7 }, { x: 34.5, y: 75 }, { x: 17.6, y: 64.1 }] },
        { item: 33, partNumber: "54333", description: "Clamp, Hose, Wormdrive, 0.31-0.88D, .31W", category: "Fluido", qty: 4, hotspots: [{ x: 13.7, y: 72.1 }, { x: 17.7, y: 73.5 }, { x: 31, y: 74.3 }, { x: 20.9, y: 65.3 }] },
        { item: 34, partNumber: "08713", description: "Nut, Hex, Lock, M8 x 1.25, NL, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 76.9, y: 21.8 }] },
        { item: 35, partNumber: "1011853", description: "Arm, Tank, Retaining", category: "Soportes", qty: 1, hotspots: [{ x: 41.9, y: 19.2 }] },
        { item: 36, partNumber: "1072628", description: "Screw, Hex, M8 x 1.25 x 25, SS, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 10.1, y: 92.3 }, { x: 21.9, y: 97.6 }] },
        { item: 37, partNumber: "1020341", description: "Screw, Hex, M8 x 1.25 x 20, SS, Sems", category: "Tornillería", qty: 4, hotspots: [{ x: 34.6, y: 16.1 }] }
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
    },
    "data/vacuum_fan.json": {
      machine: "Tennant T7",
      group: "Vacuum Fan Group",
      figure: "Fig. 28",
      image: "assets/vacuum_fan.png",
      categories: ["Motor de aspiración", "Manguera y conexiones", "Montaje y aislamiento", "Sellos y empaques", "Soporte del tanque", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1039763", description: "Fan, Vacuum, 5.7d, 024VDC, 3 Stage [BPP] (See Breakdown)", category: "Motor de aspiración", qty: 1, hotspots: [{ x: 47.3, y: 25.9 }] },
        { item: 1, partNumber: "1021064", description: "Fan, Vacuum, 5.7d, 024VDC, 3 Stage [BPP] (Australia) (See Breakdown)", category: "Motor de aspiración", qty: 1, note: "Versión Australia", hotspots: [] },
        { item: 1, partNumber: "372883", description: "Brush Kit, Motor, Ele", category: "Motor de aspiración", qty: 1, note: "Escobillas (carbones) · Repuesto interno del motor 1039763 / 1021064 (despiece sección 4, Fig. 8 y 9)", hotspots: [] },
        { item: 1, partNumber: "01837", description: "Bearing, Motor, Vacfan", category: "Motor de aspiración", qty: 2, note: "Repuesto interno del motor 1039763 / 1021064 (despiece sección 4, Fig. 8 y 9)", hotspots: [] },
        { item: 1, partNumber: "01856", description: "Spring, Brg, Motor, Vacfan", category: "Motor de aspiración", qty: 1, note: "Repuesto interno del motor 1039763 / 1021064 (despiece sección 4, Fig. 8 y 9)", hotspots: [] },
        { item: 1, partNumber: "372884", description: "Armature", category: "Motor de aspiración", qty: 1, note: "Repuesto interno del motor 1039763 / 1021064 (despiece sección 4, Fig. 8 y 9)", hotspots: [] },
        { item: 1, partNumber: "223264", description: "Seal, Rbr, Clsd, 0.25th, 5.8d 03.3h", category: "Motor de aspiración", qty: 1, note: "Repuesto interno del motor 1039763 / 1021064 (despiece sección 4, Fig. 8 y 9)", hotspots: [] },
        { item: 1, partNumber: "10925", description: "Connector, Fem, 2cav [MP630 Sealed]", category: "Motor de aspiración", qty: 1, note: "Repuesto interno del motor 1039763 / 1021064 (despiece sección 4, Fig. 8 y 9)", hotspots: [] },
        { item: 1, partNumber: "24537", description: "Terminal, Fem, 10/12ga [MP630 P2S]", category: "Motor de aspiración", qty: 2, note: "Repuesto interno del motor 1039763 / 1021064 (despiece sección 4, Fig. 8 y 9)", hotspots: [] },
        { item: 2, partNumber: "1015506", description: "Screw, Pan, M5 x 16, F/ Plstc", category: "Tornillería", qty: 4, hotspots: [{ x: 69, y: 34.3 }] },
        { item: 3, partNumber: "19066", description: "Washer, Flat, #10", category: "Tornillería", qty: 4, hotspots: [{ x: 65.7, y: 32.7 }] },
        { item: 4, partNumber: "1011127", description: "Plate, Mtg, Fan", category: "Montaje y aislamiento", qty: 1, hotspots: [{ x: 7.5, y: 43.7 }] },
        { item: 5, partNumber: "1013611", description: "Seal, Cover, Recvy", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 38.2, y: 58.9 }] },
        { item: 6, partNumber: "1014858", description: "Gasket, Adapter", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 13.9, y: 42 }] },
        { item: 7, partNumber: "1014711", description: "Adaptor, Hose", category: "Manguera y conexiones", qty: 1, hotspots: [{ x: 13.6, y: 38.6 }] },
        { item: 8, partNumber: "1034731", description: "Screw, Hex, M6 x 1.00 x 16, SS, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 14.8, y: 58.3 }] },
        { item: 9, partNumber: "01684", description: "Washer, Flat, 0.25 SS", category: "Tornillería", qty: 9, hotspots: [{ x: 13.7, y: 35.8 }, { x: 23.4, y: 70.8 }, { x: 41, y: 41.4 }] },
        { item: 10, partNumber: "07790", description: "Nut, Hex, Flng, M6 x 1.00", category: "Tornillería", qty: 9, hotspots: [{ x: 13.4, y: 33.4 }, { x: 23.1, y: 73.2 }, { x: 40.5, y: 39.7 }] },
        { item: 11, partNumber: "1011140", description: "Seal, Fan", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 77.2, y: 39 }] },
        { item: 12, partNumber: "1011103", description: "Bracket Wldt, Mtg, Fan", category: "Montaje y aislamiento", qty: 1, hotspots: [{ x: 65.8, y: 49.3 }] },
        { item: 13, partNumber: "1011093", description: "Isolator, Vib, .75d, M6 Stud Both Ends", category: "Montaje y aislamiento", qty: 3, hotspots: [{ x: 25.5, y: 53.8 }] },
        { item: 14, partNumber: "9003365", description: "Insulation Kit, Acstc, Vacfan", category: "Montaje y aislamiento", qty: 1, note: "Kit: incluye ítems 14 y 15", hotspots: [{ x: 68.7, y: 21 }] },
        { item: 14, partNumber: "1028514", description: "Insulation, Acstc, Vacfan", category: "Montaje y aislamiento", qty: 1, note: "Incluido en el kit de aislamiento acústico 9003365", hotspots: [] },
        { item: 15, partNumber: "1028515", description: "Insulation, Acstc, Hsng, Vacfan", category: "Montaje y aislamiento", qty: 1, note: "Incluido en el kit de aislamiento acústico 9003365", hotspots: [{ x: 12.1, y: 12 }] },
        { item: 16, partNumber: "1020341", description: "Screw, Hex, M8 x 1.25 x 20, SS, Sems", category: "Tornillería", qty: 4, hotspots: [{ x: 14.1, y: 62.1 }, { x: 94, y: 5.7 }, { x: 61.7, y: 63.9 }] },
        { item: 17, partNumber: "41169", description: "Nut, Hex, Lock, .25-20, NL, SS", category: "Tornillería", qty: 1, note: "S/N 10261379-10764500", hotspots: [{ x: 83.5, y: 76.7 }] },
        { item: 18, partNumber: "1011159", description: "Hose, Vacuum, 1.5d x 8.3L, Clr, Blk Wire", category: "Manguera y conexiones", qty: 1, hotspots: [{ x: 3.9, y: 11 }] },
        { item: 19, partNumber: "79381", description: "Clamp, Hose, Wormdrive, 1.25-2.00d, .50w", category: "Manguera y conexiones", qty: 2, hotspots: [{ x: 18.2, y: 16.2 }, { x: 14.6, y: 30.5 }] },
        { item: 20, partNumber: "80491", description: "Sleeve, P/M, 0.375d 0.250b 0.16L 430SS", category: "Soporte del tanque", qty: 1, note: "S/N 10000000-10261378", hotspots: [{ x: 91.5, y: 8.9 }] },
        { item: 21, partNumber: "08716", description: "Screw, Hex, M6 x 1.0 x 20, SS", category: "Tornillería", qty: 1, note: "S/N 10000000-10261378", hotspots: [{ x: 89.8, y: 16.7 }] },
        { item: 22, partNumber: "1015803", description: "Bracket, Mtg, Stop", category: "Soporte del tanque", qty: 1, note: "S/N 10000000-10261378", hotspots: [{ x: 78.2, y: 13.1 }] },
        { item: 23, partNumber: "1015808", description: "Plate, Mtg, Tank", category: "Soporte del tanque", qty: 1, note: "S/N 10000000-10261378", hotspots: [{ x: 74.8, y: 17.9 }] },
        { item: 24, partNumber: "01684", description: "Washer, Flat, 0.25, SS", category: "Tornillería", qty: 2, note: "S/N 10000000-10261378", hotspots: [{ x: 74.5, y: 10.9 }, { x: 93.9, y: 10.6 }] },
        { item: 25, partNumber: "08712", description: "Nut, Hex, Lock, M6 x 1.00, SS, NL", category: "Tornillería", qty: 1, note: "S/N 10000000-10261378", hotspots: [{ x: 71.4, y: 9.6 }] },
        { item: 26, partNumber: "1026322", description: "Bracket, Mtg, Stop", category: "Soporte del tanque", qty: 1, note: "S/N 10261379-", hotspots: [{ x: 40, y: 68.3 }] },
        { item: 27, partNumber: "1034731", description: "Screw, Hex, M6 x 1.00 x 16, SS, Sems", category: "Tornillería", qty: 2, note: "S/N 10261379-", hotspots: [{ x: 14.9, y: 69 }, { x: 40.9, y: 51.7 }] },
        { item: 28, partNumber: "01684", description: "Washer, Flat, 0.25, SS", category: "Tornillería", qty: 2, note: "S/N 10261379-", hotspots: [{ x: 19.1, y: 70.9 }, { x: 45.5, y: 74.7 }] },
        { item: 29, partNumber: "80491", description: "Sleeve, P/M, 0.25b 0.38d 0.2L [430SS]", category: "Soporte del tanque", qty: 1, note: "S/N 10261379-", hotspots: [{ x: 42.2, y: 72.7 }] },
        { item: 30, partNumber: "08712", description: "Nut, Hex, Lock, M6 x 1.00, SS, NL", category: "Tornillería", qty: 1, note: "S/N 10261379-", hotspots: [{ x: 48.3, y: 77.2 }] },
        { item: 31, partNumber: "1026270", description: "Bracket, Arm, Prop", category: "Soporte del tanque", qty: 1, note: "S/N 10261379-", hotspots: [{ x: 40, y: 70.8 }] },
        { item: 32, partNumber: "1026986", description: "Screw, Trs, .25-20 x 3.00, Phl, SS", category: "Tornillería", qty: 1, note: "S/N 10261379-10764500", hotspots: [{ x: 69.2, y: 93.3 }] },
        { item: 33, partNumber: "578579", description: "Spacer, 0.25b 0.88d 0.50L", category: "Soporte del tanque", qty: 1, note: "S/N 10261379-", hotspots: [{ x: 17.8, y: 73.7 }] },
        { item: 34, partNumber: "140154", description: "Sleeve, P/M, 0.25b 0.38d 0.3L, Pl", category: "Soporte del tanque", qty: 1, note: "S/N 10261379-", hotspots: [{ x: 35.1, y: 77.8 }] },
        { item: 35, partNumber: "140053", description: "Washer, Flat, 0.28b 0.88d .12, SS", category: "Tornillería", qty: 1, note: "S/N 10261379-", hotspots: [{ x: 38.2, y: 78.5 }] },
        { item: 36, partNumber: "06946", description: "Screw, Hex, M6 x 1.00 x 35, 8.8", category: "Tornillería", qty: 1, note: "S/N 10764501-", hotspots: [{ x: 44.9, y: 80.3 }] }
      ]
    },
    "data/tanks_drain.json": {
      machine: "Tennant T7",
      group: "Tanks Drain Group",
      figure: "Fig. 31",
      image: "assets/tanks_drain.png",
      categories: ["Mangueras", "Tapones y sellos", "Abrazaderas y soportes", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1014274", description: "Hose Assy, Drain, 27.8L (Recovery Tank)", category: "Mangueras", qty: 1, note: "Tanque de recuperación · incluye ítems 2-4", hotspots: [{ x: 81, y: 74.4 }] },
        { item: 2, partNumber: "1008639", description: "Cap, Drain Assembly", category: "Tapones y sellos", qty: 1, note: "Tanque de recuperación · incluido en 1014274 · incluye ítems 3-4", hotspots: [{ x: 95.7, y: 79.5 }] },
        { item: 3, partNumber: "1019563", description: "Strap, Drain Cap", category: "Tapones y sellos", qty: 1, note: "Tanque de recuperación · incluido en 1008639", hotspots: [{ x: 85, y: 75.2 }] },
        { item: 4, partNumber: "1008637", description: "O Ring, 1.48\" ID, 1.76\" OD", category: "Tapones y sellos", qty: 1, note: "Tanque de recuperación · incluido en 1008639", hotspots: [{ x: 93.1, y: 67.1 }] },
        { item: 5, partNumber: "14432", description: "Clamp, Hose, Wormdrive, 1.81-2.75d, .56w", category: "Abrazaderas y soportes", qty: 2, note: "Tanque de recuperación", hotspots: [{ x: 49.7, y: 45.5 }] },
        { item: 6, partNumber: "1014268", description: "Hose Assy, Drain, 27.0L (Solution Tank)", category: "Mangueras", qty: 1, note: "Tanque de solución · incluye ítems 7-9", hotspots: [{ x: 51.1, y: 93.2 }] },
        { item: 7, partNumber: "1008639", description: "Cap, Drain Assembly", category: "Tapones y sellos", qty: 5, note: "Tanque de solución · incluido en 1014268 · incluye ítems 8-9 · cantidad tal como figura en el manual", hotspots: [{ x: 66, y: 98.5 }] },
        { item: 8, partNumber: "1019563", description: "Strap, Drain Cap", category: "Tapones y sellos", qty: 1, note: "Tanque de solución · incluido en 1008639", hotspots: [{ x: 55.1, y: 94 }] },
        { item: 9, partNumber: "1008637", description: "O Ring, 1.48\" ID, 1.76\" OD", category: "Tapones y sellos", qty: 1, note: "Tanque de solución · incluido en 1008639", hotspots: [{ x: 63.2, y: 85.9 }] },
        { item: 10, partNumber: "79381", description: "Clamp, Hose, Wormdrive, 1.25-2.00d, .50w", category: "Abrazaderas y soportes", qty: 1, note: "Tanque de solución", hotspots: [{ x: 14.9, y: 76.9 }] },
        { item: 11, partNumber: "222793", description: "Clip, Hanger, Hose, .38d Hole, SS", category: "Abrazaderas y soportes", qty: 2, hotspots: [{ x: 57.2, y: 22.6 }, { x: 41.6, y: 66.4 }] },
        { item: 12, partNumber: "09740", description: "Screw, Hex, M8 x 1.25 x 20, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 62, y: 26 }, { x: 46.7, y: 67.2 }] }
      ]
    },
    "data/battery_group.json": {
      machine: "Tennant T7",
      group: "Battery Group, 235Ah (S/N 10523206-)",
      figure: "Fig. 32",
      image: "assets/battery_group.png",
      categories: ["Baterías", "Cables y conectores", "Protectores y tapas", "Sujeción", "Soportes y espaciadores", "Tornillería"],
      parts: [
        { item: 1, partNumber: "222280", description: "Battery, 06vdc, 235ah, Wet", category: "Baterías", qty: 4, note: "Batería de 6 V, 235 Ah, de ácido (Wet) · 4 en serie = 24 V", hotspots: [{ x: 20.6, y: 2.1 }, { x: 63.8, y: 43.5 }] },
        { item: 2, partNumber: "1042532", description: "Bracket, Battery [T7, 220ah Agm]", category: "Soportes y espaciadores", qty: 1, note: "S/N 10523206-", hotspots: [{ x: 21.6, y: 60.1 }] },
        { item: 3, partNumber: "1025155", description: "Tray, Battery, 605x370x25", category: "Soportes y espaciadores", qty: 1, note: "Bandeja de baterías", hotspots: [{ x: 13.7, y: 29.4 }] },
        { item: 4, partNumber: "09740", description: "Screw, Hex, M8 X 1.25 X 20, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 74.4, y: 44.9 }] },
        { item: 5, partNumber: "1017218", description: "Washer, Flat, 0.321b 1.00d .12, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 37.7, y: 55.5 }, { x: 74.7, y: 48.4 }] },
        { item: 6, partNumber: "222682", description: "Strap", category: "Sujeción", qty: 1, note: "Correa de sujeción de las baterías", hotspots: [{ x: 14.8, y: 21.5 }] },
        { item: 7, partNumber: "223356", description: "Wire, 04ga 12.0l Blk .34ring /.34ring", category: "Cables y conectores", qty: 3, note: "Puente entre baterías", hotspots: [{ x: 70.9, y: 2.5 }, { x: 56.8, y: 2.5 }, { x: 31.6, y: 1.3 }] },
        { item: 8, partNumber: "611221", description: "Boot, Terminal, Battery, 25.4Mm, Blk", category: "Protectores y tapas", qty: 8, note: "Capuchón aislante de borne", hotspots: [{ x: 83.4, y: 4.1 }] },
        { item: 9, partNumber: "630375", description: "Spacer, Battery, Foam, 1.25 X 3.3 X 13.7", category: "Soportes y espaciadores", qty: 2, note: "Espaciador de espuma · S/N 10523206-", hotspots: [{ x: 9.5, y: 7.2 }, { x: 87.1, y: 41.9 }] },
        { item: 10, partNumber: "87435", description: "Nut, Hex, Flexlock, .31- 18", category: "Tornillería", qty: 8, hotspots: [{ x: 83.5, y: 8.9 }] },
        { item: 11, partNumber: "1010771", description: "Angle, Sppt, Battery", category: "Soportes y espaciadores", qty: 1, note: "Guía metálica de la bandeja", hotspots: [{ x: 49.9, y: 56.5 }] },
        { item: 12, partNumber: "397907", description: "Wire Assy, Cable, 4ga, Red", category: "Cables y conectores", qty: 1, note: "Cable de alimentación con conector", hotspots: [{ x: 16.9, y: 44.2 }] },
        { item: 13, partNumber: "397908", description: "Wire Assy, Cable, 4ga, Red", category: "Cables y conectores", qty: 1, note: "Cable de alimentación con conector Anderson · incluye 1020446 y 1020447", hotspots: [{ x: 30.1, y: 40.2 }] },
        { item: 13, partNumber: "1020446", description: "Connector, Anderson, 1321 Series", category: "Cables y conectores", qty: 1, note: "Componente del cable 397908", hotspots: [] },
        { item: 13, partNumber: "1020447", description: "Terminal, Contact, Anderson, 1319g4, 4ga", category: "Cables y conectores", qty: 1, note: "Componente del cable 397908", hotspots: [] },
        { item: 14, partNumber: "223364", description: "Wire, 04ga 16.0l Blk .34ring /.34ring", category: "Cables y conectores", qty: 1, note: "Cable negativo de alimentación", hotspots: [{ x: 13, y: 38 }] },
        { item: 15, partNumber: "1020105", description: "Sleeve, Afmkt, Nyl, #13, 1ft", category: "Cables y conectores", qty: 1, note: "Funda de los cables de alimentación", hotspots: [{ x: 14, y: 67.7 }] },
        { item: 16, partNumber: "49263", description: "Tie, Cable, Nyl, 11.4l .19w 3.0 Max D", category: "Cables y conectores", qty: 3, hotspots: [{ x: 13.7, y: 62 }] },
        { item: 17, partNumber: "15675", description: "Screw, Hex, M8 X 1.25 X 16, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 38.6, y: 53.3 }] },
        { item: 18, partNumber: "1041030", description: "Cap, Battery", category: "Protectores y tapas", qty: 8, note: "Tapa de batería", hotspots: [{ x: 84.6, y: 18.3 }] }
      ]
    },
    "data/squeegee_lift.json": {
      machine: "Tennant T7",
      group: "Rear Squeegee Lift Group, Disk Scrub Head",
      figure: "Fig. 34",
      image: "assets/squeegee_lift.png",
      categories: ["Actuador", "Rodachinas", "Resortes", "Pasadores y bujes", "Brazo y soportes", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1009268", description: "Actuator, 12VDC, 40mm Strk [750N] (Replaced by Kit 9010845 - Includes Actuator & Housing)", category: "Actuador", qty: 1, note: "S/N 10000000-10627040", hotspots: [{ x: 62.4, y: 46.6 }] },
        { item: 1, partNumber: "9010845", description: "Actuator Kit, Replmt [T7/SSR]", category: "Actuador", qty: 1, note: "S/N 10627041- · incluye actuador y carcasa 1031028", hotspots: [] },
        { item: 2, partNumber: "1012607", description: "Housing, Spring, Sqge Actuator (Replaced By 1031028)", category: "Actuador", qty: 1, note: "S/N 10000000-10280388", hotspots: [{ x: 27.1, y: 44.6 }] },
        { item: 2, partNumber: "1031028", description: "Housing, Sqge, Spring, Actuator", category: "Actuador", qty: 1, note: "S/N 10280389- · incluido en el kit 9010845", hotspots: [] },
        { item: 3, partNumber: "86866", description: "Pin, Hair Cotter, 0.38 D .072 Wir", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 41.1, y: 58.2 }, { x: 45.1, y: 39.6 }] },
        { item: 4, partNumber: "94877", description: "Pin, Clevis, 10d x 50L", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 57.5, y: 32.7 }] },
        { item: 5, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00 .08, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 68, y: 37.4 }] },
        { item: 6, partNumber: "1009356", description: "Pin, Clevis, 10mm x 40L", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 45.9, y: 58.6 }] },
        { item: 7, partNumber: "1016639", description: "Spring, Extn, 0.75OD x 0.11wir, 4.5L", category: "Resortes", qty: 2, hotspots: [{ x: 29.2, y: 32.4 }] },
        { item: 8, partNumber: "96184", description: "Pin, Clevis, 12d x 100L, Pl", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 62, y: 91.8 }] },
        { item: 9, partNumber: "86866", description: "Pin, Cotter, Hair, 0.38d .072 Wir", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 59.6, y: 86.9 }] },
        { item: 10, partNumber: "1031379", description: "Arm Wldt, Sqge, Rear", category: "Brazo y soportes", qty: 1, hotspots: [{ x: 27, y: 96.1 }] },
        { item: 11, partNumber: "1013515", description: "Bushing, Flex, Ure", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 15.3, y: 77.7 }, { x: 49.5, y: 93.1 }] },
        { item: 12, partNumber: "1010401", description: "Pin, Clevis, 16d x 150L", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 51.8, y: 30.9 }] },
        { item: 13, partNumber: "02942", description: "Pin, Hair Cotter, 0.62 D .120 Wir", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 50.9, y: 28.9 }] },
        { item: 14, partNumber: "1073476", description: "Caster, Swivel, 50mmD, M10 x 30, Clr Pl", category: "Rodachinas", qty: 2, hotspots: [{ x: 66.6, y: 82.8 }, { x: 86.9, y: 91.2 }] },
        { item: 15, partNumber: "41619", description: "Washer, Flat, 0.56b 1.38d .11, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 64.8, y: 78.3 }, { x: 86.2, y: 85.8 }] },
        { item: 16, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00 .08, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 49.2, y: 56.3 }, { x: 83.5, y: 58 }] },
        { item: 17, partNumber: "07787", description: "Nut, Hex, Std, M10 x 1.5, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 49.8, y: 54 }, { x: 83.3, y: 55.9 }] },
        { item: 18, partNumber: "32716", description: "Nut, Hex, Jam, M10 x 1.5, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 49.8, y: 51.6 }, { x: 83.1, y: 53.6 }] },
        { item: 19, partNumber: "1018725", description: "Channel, Arm, Lower Sqge", category: "Brazo y soportes", qty: 1, hotspots: [{ x: 49.8, y: 64.6 }] },
        { item: 20, partNumber: "12138", description: "Screw, Hex, M12 x 1.75 x 120, 8.8", category: "Tornillería", qty: 1, hotspots: [{ x: 39.1, y: 69.7 }] },
        { item: 21, partNumber: "09741", description: "Nut, Hex, Lock, M12 x 1.75, NL, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 72.1, y: 74.5 }] },
        { item: 22, partNumber: "1020182", description: "Spring, Cmpr, 20mm D x 44mm L", category: "Resortes", qty: 1, hotspots: [{ x: 52.4, y: 77.5 }] },
        { item: 23, partNumber: "04417", description: "Screw, Hex, M10 x 1.5 x 60, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 70.5, y: 50.7 }] },
        { item: 24, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00 .08, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 70.8, y: 55.3 }] }
      ]
    },
    "data/squeegee_lift_cyl.json": {
      machine: "Tennant T7",
      group: "Rear Squeegee Lift Group, Cylindrical Scrub Head",
      figure: "Fig. 35",
      image: "assets/squeegee_lift_cyl.png",
      categories: ["Actuador", "Rodachinas", "Resortes", "Pasadores y bujes", "Brazo y soportes", "Tornillería"],
      parts: [
        { item: 1, partNumber: "1028997", description: "Support, Frame, Sqge", category: "Brazo y soportes", qty: 1, hotspots: [{ x: 27.6, y: 32.9 }] },
        { item: 2, partNumber: "1028998", description: "Support, Frame, Sqge", category: "Brazo y soportes", qty: 1, hotspots: [{ x: 85.5, y: 41.7 }] },
        { item: 3, partNumber: "09291", description: "Screw, Hex, M10 x 1.5 x 20, SS", category: "Tornillería", qty: 6, hotspots: [{ x: 56.2, y: 3.1 }, { x: 65.7, y: 7.3 }, { x: 37.7, y: 5.7 }] },
        { item: 4, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, SS", category: "Tornillería", qty: 7, hotspots: [{ x: 63.2, y: 63.4 }, { x: 51.8, y: 4.6 }, { x: 60.7, y: 9.4 }, { x: 35.5, y: 7.5 }] },
        { item: 5, partNumber: "1029072", description: "Bracket Wldt, Actuator", category: "Actuador", qty: 1, hotspots: [{ x: 8.6, y: 58.3 }] },
        { item: 6, partNumber: "86866", description: "Pin, Cotter, Hair, 0.38d .072 Wir", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 12.5, y: 42.3 }] },
        { item: 7, partNumber: "1020341", description: "Screw, Hex, M8 x 1.25 x 20, SS, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 18.5, y: 42.5 }] },
        { item: 8, partNumber: "1009268", description: "Actuator, 12VDC, 40mm Strk [750N] (Replaced by Kit 9010845 - Includes Actuator & Housing)", category: "Actuador", qty: 1, note: "S/N 10000000-10627040", hotspots: [{ x: 28.4, y: 41.5 }] },
        { item: 8, partNumber: "9010845", description: "Actuator Kit, Replmt [T7/SSR]", category: "Actuador", qty: 1, note: "S/N 10627041- · incluye actuador y carcasa 1031028", hotspots: [] },
        { item: 9, partNumber: "1031028", description: "Housing, Sqge, Spring, Actuator", category: "Actuador", qty: 1, note: "Incluido en el kit 9010845", hotspots: [{ x: 45, y: 40.9 }] },
        { item: 10, partNumber: "1032539", description: "Arm, Spring, Mtg", category: "Brazo y soportes", qty: 1, hotspots: [{ x: 47.6, y: 25.6 }] },
        { item: 11, partNumber: "1016639", description: "Spring, Extn, 0.75OD 0.11wir 04.5L", category: "Resortes", qty: 2, hotspots: [{ x: 21, y: 66.7 }] },
        { item: 12, partNumber: "1018483", description: "Pin, Clevis, 12mmD x 100mmL", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 50, y: 95.9 }] },
        { item: 13, partNumber: "08182", description: "Pin, Cotter, .125 x 1.00", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 50, y: 90.2 }] },
        { item: 14, partNumber: "1032452", description: "Arm Wldt, Sqge, Rear, Cylrcl", category: "Brazo y soportes", qty: 1, hotspots: [{ x: 19.3, y: 78.5 }] },
        { item: 15, partNumber: "1013515", description: "Bushing, Flex, Ure", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 39.1, y: 98.9 }, { x: 23.4, y: 89.5 }] },
        { item: 16, partNumber: "1073476", description: "Caster, Swivel, 50mmD, M10 x 30, Clr Pl", category: "Rodachinas", qty: 2, hotspots: [{ x: 60.3, y: 85.9 }, { x: 76.5, y: 92.6 }] },
        { item: 17, partNumber: "07787", description: "Nut, Hex, Std, M10 x 1.50, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 74.4, y: 63.5 }, { x: 45, y: 59.7 }] },
        { item: 18, partNumber: "1018725", description: "Channel, Arm, Lower Sqge", category: "Brazo y soportes", qty: 1, hotspots: [{ x: 80.9, y: 72.8 }] },
        { item: 19, partNumber: "12138", description: "Screw, Hex, M12 x 1.75 x 120, 8.8", category: "Tornillería", qty: 1, hotspots: [{ x: 42.4, y: 66.6 }] },
        { item: 20, partNumber: "09741", description: "Nut, Hex, Lock, M12 x 1.75, NL, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 64.7, y: 77.7 }] },
        { item: 21, partNumber: "1020182", description: "Spring, Cmpr, 0.70OD, 01.7L", category: "Resortes", qty: 1, hotspots: [{ x: 49.3, y: 80.4 }] },
        { item: 22, partNumber: "04417", description: "Screw, Hex, M10 x 1.5 x 60, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 63.7, y: 58.9 }] },
        { item: 23, partNumber: "1010401", description: "Pin, Clevis, 16mmD x 150mmL", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 83.8, y: 54.8 }] },
        { item: 24, partNumber: "02942", description: "Pin, Cotter, Hair, 0.62d .120 Wir", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 82.7, y: 48.7 }] },
        { item: 25, partNumber: "41619", description: "Washer, Flat, 0.56b 1.38d .11, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 58.7, y: 81.3 }, { x: 75.3, y: 88.5 }] },
        { item: 26, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 74.8, y: 65.3 }, { x: 44.3, y: 61.5 }] },
        { item: 27, partNumber: "32716", description: "Nut, Hex, Jam, M10 x 1.5, SS", category: "Rodachinas", qty: 2, hotspots: [{ x: 74.4, y: 61.5 }, { x: 45.2, y: 57.8 }] },
        { item: 28, partNumber: "94877", description: "Pin, Clevis, 10mmD x 050mmL", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 7.7, y: 42.7 }] },
        { item: 29, partNumber: "1032733", description: "Pin, Clevis, 10mmD x 070mmL, Pl", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 59.1, y: 40.5 }] },
        { item: 30, partNumber: "1032732", description: "Pin, Clevis, 12mmD x 070mmL, Pl", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 13.7, y: 1.1 }] },
        { item: 31, partNumber: "41619", description: "Washer, Flat, 0.56b 1.38d .11, SS", category: "Tornillería", qty: 1, hotspots: [{ x: 38.5, y: 21.2 }] },
        { item: 32, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 17.8, y: 59 }] },
        { item: 33, partNumber: "08182", description: "Pin, Cotter, .125 x 1.00", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 59.6, y: 38.4 }, { x: 20.2, y: 2.1 }] },
        { item: 34, partNumber: "08713", description: "Nut, Hex, Lock, M8 x 1.25, NL, SS", category: "Tornillería", qty: 2, hotspots: [{ x: 9.3, y: 9 }] }
      ]
    },
    "data/t12/machine.json": {
      machine: "Tennant T12",
      image: "assets/t12/t12_full.png",
      systems: [
        { id: "lavado", name: "Lavado y Secado", icon: "brush" },
        { id: "traccion", name: "Tracción y Chasis", icon: "wheel" },
        { id: "agua", name: "Agua y Aspiración", icon: "drop" },
        { id: "electrico", name: "Eléctrico y Control", icon: "bolt" }
      ],
      zones: [
        { id: "racleta-trasera", name: "Racleta Trasera / Escobillas de Secado", system: "lavado", description: "Rear Squeegee Kit", figure: "Fig. 21", status: "available", data: "data/t12/rear_squeegee.json", hotspot: { x: 94, y: 68 }, labelSide: "left" },
        { id: "cabeza-cepillos", name: "Cabezal de Cepillos", system: "lavado", description: "Scrub Head Group, Disk / Cylindrical", figure: "Fig. 12 / 13 / 14", status: "available", figures: [{ label: "Fig. 12 · Cabezal de disco", data: "data/t12/scrub_head_disk.json" }, { label: "Fig. 13 · Bastidor cilíndrico", data: "data/t12/scrub_head_cyl.json" }, { label: "Fig. 14 · Motor cilíndrico", data: "data/t12/scrub_head_cyl_drive.json" }], hotspot: { x: 50, y: 94 } },
        { id: "escobillas-laterales", name: "Escobillas Laterales del Cabezal", system: "lavado", description: "Scrub Head Side Squeegee Group", figure: "Fig. 15 / 16", status: "available", figures: [{ label: "Fig. 15 · Lado derecho", data: "data/t12/side_squeegee_rh.json" }, { label: "Fig. 16 · Lado izquierdo", data: "data/t12/side_squeegee_lh.json" }], hotspot: { x: 63, y: 87 } },
        { id: "elevacion-cabezal", name: "Mecanismo de Elevación del Cabezal", system: "lavado", description: "Scrub Head Lift Group", figure: "Fig. 11", status: "available", data: "data/t12/scrub_head_lift.json", hotspot: { x: 34, y: 90 }, labelSide: "right" },
        { id: "elevacion-racleta", name: "Mecanismo de Elevación de Racleta", system: "lavado", description: "Rear Squeegee Lift Group", figure: "Fig. 20", status: "available", data: "data/t12/squeegee_lift.json", hotspot: { x: 92, y: 55 }, labelSide: "left" },
        { id: "chasis-ruedas", name: "Chasis y Ruedas", system: "traccion", description: "Main Frame and Wheels Group", figure: "Fig. 3", status: "available", data: "data/t12/main_frame.json", hotspot: { x: 84, y: 77 }, labelSide: "left" },
        { id: "parachoques-puerta", name: "Parachoques y Puerta Lateral", system: "traccion", description: "Front Bumper and Side Door Group", figure: "Fig. 4", status: "available", data: "data/t12/front_bumper.json", hotspot: { x: 12, y: 80 }, labelSide: "right" },
        { id: "asiento", name: "Asiento y Soporte", system: "traccion", description: "Seat Support Group / Seat Group", figure: "Fig. 5 / 6", status: "available", figures: [{ label: "Fig. 5 · Soporte del asiento", data: "data/t12/seat_support.json" }, { label: "Fig. 6 · Asiento estándar", data: "data/t12/seat.json" }], hotspot: { x: 53, y: 33 } },
        { id: "direccion-panel", name: "Dirección y Panel de Instrumentos", system: "traccion", description: "Steering and Instrument Panel Group", figure: "Fig. 8 / 9", status: "available", figures: [{ label: "Fig. 8 · T12", data: "data/t12/steering_panel.json" }, { label: "Fig. 9 · T12XP", data: "data/t12/steering_panel_xp.json" }], hotspot: { x: 36, y: 30 }, labelSide: "right" },
        { id: "cubierta-pedal", name: "Cubierta Frontal y Pedal", system: "traccion", description: "Front Cover and Directional Pedal Group", figure: "Fig. 10", status: "available", data: "data/t12/front_cover.json", hotspot: { x: 44, y: 72 } },
        { id: "tanque-recuperacion", name: "Tanque de Recuperación", system: "agua", description: "Recovery Tank Group", figure: "Fig. 17", status: "available", data: "data/t12/recovery_tank.json", hotspot: { x: 76, y: 8 }, labelSide: "left" },
        { id: "motor-aspiracion", name: "Motor de Aspiración", system: "agua", description: "Vacuum Fan Group", figure: "Fig. 18", status: "available", data: "data/t12/vacuum_fan.json", hotspot: { x: 92, y: 22 }, labelSide: "left" },
        { id: "tanque-solucion", name: "Tanque de Solución", system: "agua", description: "Solution Tank Group", figure: "Fig. 19", status: "available", data: "data/t12/solution_tank.json", hotspot: { x: 73, y: 64 }, labelSide: "left" },
        { id: "tarjeta-control", name: "Tarjeta de Control", system: "electrico", description: "Electrical Circuit Board Group", figure: "Fig. 22", status: "available", data: "data/t12/circuit_board.json", hotspot: { x: 24, y: 37 }, labelSide: "right" },
        { id: "contactor-cables", name: "Contactor y Cableado", system: "electrico", description: "Electrical Contactor and Wires Group", figure: "Fig. 23", status: "available", data: "data/t12/contactor_wires.json", hotspot: { x: 16, y: 53 }, labelSide: "right" },
        { id: "baterias", name: "Sistema de Baterías", system: "electrico", description: "Battery Group, 240Ah", figure: "Fig. 24", status: "available", data: "data/t12/battery_240.json", hotspot: { x: 57, y: 50 } }
      ]
    },
    "data/t12/rear_squeegee.json": {
      machine: "Tennant T12",
      group: "Rear Squeegee Kit",
      figure: "Fig. 21",
      image: "assets/t12/rear_squeegee.png",
      categories: ["Tornillería", "Pasadores y bujes", "Resortes", "Mangueras y sujeción", "Ruedas", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200219", description: "Frame, Sqge, Outer", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 42, y: 40.8 }] },
        { item: 2, partNumber: "1200218", description: "Frame, Sqge, Inner", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 20.9, y: 65.8 }] },
        { item: 3, partNumber: "1200466", description: "Clamp Wldt, Retainer, Sqge", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 47.3, y: 44.9 }] },
        { item: 4, partNumber: "363162", description: "Wheel, 04.0d 0.89w 0.64b", category: "Ruedas", qty: 2, hotspots: [{ x: 17.6, y: 17.9 }, { x: 97.7, y: 41 }] },
        { item: 5, partNumber: "363301", description: "Sleeve, P/M, 0.34b 0.63d 1.2l, Bnz", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 23, y: 11.8 }, { x: 94.4, y: 36.3 }] },
        { item: 6, partNumber: "49694", description: "Screw, Hex, M8 X 1.25 X 50, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 23, y: 6.1 }, { x: 94.6, y: 29.2 }] },
        { item: 7, partNumber: "08713", description: "Nut, Hex, Lock, M8 X 1.25, Nl, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 22.6, y: 34.4 }, { x: 93.6, y: 59 }] },
        { item: 8, partNumber: "1017218", description: "Washer, Flat, 0.32b 1.00d .12, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 23, y: 8.8 }, { x: 22.5, y: 22.2 }, { x: 94.5, y: 32.5 }, { x: 93.2, y: 46.1 }] },
        { item: 9, partNumber: "1052532", description: "Grip, Lock", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 82.8, y: 15 }, { x: 63.6, y: 6.7 }] },
        { item: 10, partNumber: "1055396", description: "Pin, 0.63d, 02.0l [W/Cbore, M8 Screw]", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 80.5, y: 22.8 }, { x: 61.3, y: 14.6 }] },
        { item: 11, partNumber: "07786", description: "Nut, Hex, Std, M8 X 1", category: "Tornillería", qty: 2, hotspots: [{ x: 80.7, y: 19.8 }, { x: 61.5, y: 11.6 }] },
        { item: 12, partNumber: "1057407", description: "Rod, Thrd, 2end, M8x1.25/ M10x1.5 04.7l", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 80.3, y: 27.5 }, { x: 61.1, y: 19.3 }] },
        { item: 13, partNumber: "1055506", description: "Ring, Mtg, Sqge, .38l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 80.2, y: 33.2 }, { x: 60.9, y: 24.9 }] },
        { item: 14, partNumber: "1064770", description: "Spring, Cmpr, 0.98od .13wir 01.3l, Ss", category: "Resortes", qty: 2, hotspots: [{ x: 40.3, y: 70.5 }, { x: 58.4, y: 78.1 }] },
        { item: 15, partNumber: "391345", description: "Nut, T, M10 X 1.50 X 0.62od X 0.5l", category: "Tornillería", qty: 2, hotspots: [{ x: 40, y: 73.4 }, { x: 57.7, y: 81.5 }] },
        { item: 16, partNumber: "1200383", description: "Blade, Sqge, Front, 42.59l [Linard]", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 5.9, y: 58.7 }] },
        { item: 17, partNumber: "1200384", description: "Blade, Sqge, Rear, Linatex", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 25.3, y: 49 }] },
        { item: 18, partNumber: "1054312", description: "Hook Wldt, Latch", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 35.5, y: 43 }] },
        { item: 19, partNumber: "1201825", description: "Blade, Sqge, Front, 43.19L [Gum] (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 11.4, y: 59.3 }] },
        { item: 19, partNumber: "1201823", description: "Blade, Sqge, Front, 43.19l [Urethane] (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [] },
        { item: 19, partNumber: "1212213", description: "Blade, Sqge, Front, Tile, Tile, 42.59L [Linard} (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [] },
        { item: 20, partNumber: "1201826", description: "Blade, Sqge, Rear, Gum (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 30.9, y: 48.8 }] },
        { item: 20, partNumber: "1201824", description: "Blade, Sqge, Rear, Urethane (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [] }
      ]
    },
    "data/t12/scrub_head_disk.json": {
      machine: "Tennant T12",
      group: "Scrub Head and Drive Motor Group, Disk",
      figure: "Fig. 12",
      image: "assets/t12/scrub_head_disk.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Motores y actuadores", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1202430", description: "Head Wldt, Scrbr, Disc", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 29.5, y: 41.3 }] },
        { item: 2, partNumber: "1200168", description: "Motor, Ele, 36vdc 0315rpm", category: "Motores y actuadores", qty: 2, hotspots: [{ x: 29.9, y: 26.6 }, { x: 68.7, y: 37.2 }] },
        { item: 2, partNumber: "9009577", description: "Brush Kit, Motor", category: "Escobillas y hojas", qty: 2, hotspots: [] },
        { item: 3, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 8, hotspots: [{ x: 32.5, y: 64.9 }, { x: 46.7, y: 76.2 }] },
        { item: 4, partNumber: "09011", description: "Screw, Hex, M8 X 1.25 X 30, Ss", category: "Tornillería", qty: 8, hotspots: [{ x: 32.4, y: 67.9 }, { x: 46.6, y: 78.9 }] },
        { item: 5, partNumber: "377364", description: "Hub, Drive, Brush, Disk, 0.75b [6t]", category: "Escobillas y hojas", qty: 2, hotspots: [{ x: 33.8, y: 81.9 }, { x: 47.7, y: 89.6 }] },
        { item: 6, partNumber: "00928", description: "Key, Sq, 0.25 X 0.25, 1.00l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 46.2, y: 39.4 }] },
        { item: 7, partNumber: "09010", description: "Screw, Hex, M8 X 1.25 X 25, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 34.1, y: 90.7 }, { x: 47.7, y: 97.8 }] },
        { item: 8, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 34, y: 87.7 }, { x: 47.7, y: 95.4 }] },
        { item: 9, partNumber: "41186", description: "Washer, Flat, Belleville, .31", category: "Tornillería", qty: 2, hotspots: [{ x: 34.1, y: 85.4 }, { x: 47.6, y: 93.1 }] },
        { item: 10, partNumber: "1201053", description: "Skirt, Rbr, Front, Disc", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 24.4, y: 65.3 }] },
        { item: 11, partNumber: "1201190", description: "Strip, Retainer, Front", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 18.1, y: 78.2 }] },
        { item: 12, partNumber: "1201127", description: "Skirt, Rbr, Rear, Disc", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 93, y: 52.4 }] },
        { item: 13, partNumber: "1201185", description: "Strip, Skirt, Rear, Disc", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 93, y: 47.8 }] },
        { item: 14, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, Ss", category: "Tornillería", qty: 11, hotspots: [{ x: 80.2, y: 40.8 }, { x: 10, y: 75.7 }, { x: 38.4, y: 71.8 }, { x: 60.7, y: 79.4 }] },
        { item: 15, partNumber: "09007", description: "Screw, Hex, M6 X 1.00 X 25, Ss", category: "Tornillería", qty: 9, hotspots: [{ x: 85, y: 38.9 }, { x: 5, y: 76.8 }] },
        { item: 16, partNumber: "08708", description: "Nut, Hex, Lock, M6 X 1.00, Nl", category: "Tornillería", qty: 9, hotspots: [{ x: 25.8, y: 57.6 }, { x: 74.4, y: 60.5 }] },
        { item: 17, partNumber: "1201215", description: "Tube, Distribution, Disc", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 51, y: 5.2 }] },
        { item: 18, partNumber: "1054795", description: "Valve, Water, Solenoid, 36vdc Bm12/Bm12", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 68.7, y: 21.8 }] },
        { item: 19, partNumber: "223198", description: "Screw, Hex, M5 X 0.80 X 10, Fmg", category: "Tornillería", qty: 6, hotspots: [{ x: 68.7, y: 18.5 }, { x: 38.5, y: 74.6 }, { x: 60.9, y: 81.8 }, { x: 17.6, y: 44.2 }, { x: 48.9, y: 61 }] },
        { item: 20, partNumber: "391365", description: "Fitting, Plstc, E90, Bm10/Bm10", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 76.5, y: 34.5 }] },
        { item: 21, partNumber: "1015026", description: "Hose, Afmkt, Pvc, Brd, 0.62id, 03ft, Clr", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 72.4, y: 23.4 }, { x: 95.6, y: 23.1 }] },
        { item: 22, partNumber: "63810", description: "Clamp, Hose, Wormdrive, 0.56-1.06d, .56w", category: "Mangueras y sujeción", qty: 4, hotspots: [{ x: 67.6, y: 32.7 }, { x: 82.1, y: 32.5 }, { x: 87.7, y: 7.2 }] },
        { item: 23, partNumber: "54333", description: "Clamp, Hose, Wormdrive, 0.31-0.88d, .31w", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 45.1, y: 22.2 }] },
        { item: 24, partNumber: "1016354", description: "Clamp, Cable, Ss, 0.50d X 0.50w [Insul]", category: "Mangueras y sujeción", qty: 2, hotspots: [{ x: 38.6, y: 69.2 }, { x: 60.7, y: 77.2 }] },
        { item: 25, partNumber: "630371", description: "Fitting, Plstc, E90, Bm10/Pm08", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 92.2, y: 5.1 }] },
        { item: 26, partNumber: "1205975", description: "Pin, Clevis, 0.37d X 5.00l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 61.7, y: 73 }, { x: 8.2, y: 54.5 }] },
        { item: 27, partNumber: "08236", description: "Pin, Cotter, .156 X 1.25", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 23.7, y: 44.7 }, { x: 48.9, y: 63.7 }] }
      ]
    },
    "data/t12/scrub_head_cyl.json": {
      machine: "Tennant T12",
      group: "Scrub Head Frame Group, Cylindrical",
      figure: "Fig. 13",
      image: "assets/t12/scrub_head_cyl.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200292", description: "Head Wldt, Scb, Cyl", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 90, y: 61.5 }] },
        { item: 2, partNumber: "1200012", description: "Tube, Distribution, T12", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 43.7, y: 84.2 }] },
        { item: 3, partNumber: "63810", description: "Clamp, Hose, Wormdrive, 0.56-1.06d, .56w", category: "Mangueras y sujeción", qty: 3, hotspots: [{ x: 34.5, y: 80.7 }, { x: 64.9, y: 57.5 }, { x: 82, y: 9.2 }] },
        { item: 4, partNumber: "1201447", description: "Bracket, Scrbr, Watertube", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 6.4, y: 87.5 }] },
        { item: 5, partNumber: "223198", description: "Screw, Hex, M5 X 0.80 X 10, Fmg", category: "Tornillería", qty: 6, hotspots: [{ x: 16, y: 90.8 }, { x: 47.6, y: 47.3 }, { x: 68.3, y: 66.5 }, { x: 11.5, y: 47.5 }] },
        { item: 6, partNumber: "1054795", description: "Valve, Water, Solenoid, 36vdc Bm12/Bm12", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 44.2, y: 51.1 }] },
        { item: 7, partNumber: "1204335", description: "Bumper, Rbr, 1.0 Hex", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 38.4, y: 28.1 }, { x: 74, y: 69.4 }] },
        { item: 8, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 35.1, y: 26.7 }, { x: 77.1, y: 71.1 }] },
        { item: 9, partNumber: "07786", description: "Nut, Hex, Std, M8 X 1", category: "Tornillería", qty: 2, hotspots: [{ x: 31.6, y: 25.2 }, { x: 81.4, y: 73.2 }] },
        { item: 10, partNumber: "1205975", description: "Pin, Clevis, 0.37d X 5.00l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 13.1, y: 63.5 }, { x: 53.9, y: 89.2 }] },
        { item: 11, partNumber: "1202301", description: "Bracket, Retainer, Pin", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 68, y: 78.6 }, { x: 9.5, y: 57.2 }] },
        { item: 12, partNumber: "08236", description: "Pin, Cotter, .156 X 1.25", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 9.5, y: 53.7 }, { x: 68.1, y: 75.3 }] },
        { item: 13, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 64.3, y: 63.8 }, { x: 29.3, y: 53 }] },
        { item: 14, partNumber: "08716", description: "Screw, Hex, M6 X 1.00 X 20, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 60.3, y: 61.3 }, { x: 27.9, y: 44.2 }] },
        { item: 15, partNumber: "1015026", description: "Hose, Afmkt, Pvc, Brd, 0.62id, 03ft, Clr", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 68.6, y: 14.6 }] },
        { item: 16, partNumber: "9010927", description: "Debris Tray, Cyl, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 60.2, y: 18.4 }] },
        { item: 17, partNumber: "1201574", description: "Angle, Stl, Perforated .03 1.4 1.4 22l", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 46.5, y: 21.8 }] },
        { item: 18, partNumber: "1201126", description: "Lip, Tray, Debris", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 44.9, y: 26.5 }] },
        { item: 19, partNumber: "32548", description: "Rivet, Blind, .188d X 0.45 X .62d, Alm", category: "Tornillería", qty: 5, hotspots: [{ x: 84.1, y: 57.8 }] },
        { item: 20, partNumber: "630371", description: "Fitting, Plstc, E90, Bm10/Pm08", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 90.9, y: 6.7 }] }
      ]
    },
    "data/t12/scrub_head_cyl_drive.json": {
      machine: "Tennant T12",
      group: "Scrub Head Drive Motor Group, Cylindrical",
      figure: "Fig. 14",
      image: "assets/t12/scrub_head_cyl_drive.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Sellos y empaques", "Motores y actuadores", "Transmisión", "Eléctrico", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200900", description: "Plate, Side, Scrubhead, Lh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 85.3, y: 40 }] },
        { item: 2, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 73.4, y: 68.7 }] },
        { item: 3, partNumber: "08716", description: "Screw, Hex, M6 X 1.00 X 20, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 77.8, y: 70.9 }] },
        { item: 4, partNumber: "1200334", description: "Belt, Drive", category: "Transmisión", qty: 1, hotspots: [{ x: 81.7, y: 72.9 }] },
        { item: 5, partNumber: "1200215", description: "Sheave, 07grv, 2.96pd 0.63b [Pj]", category: "Transmisión", qty: 1, hotspots: [{ x: 87.4, y: 55.3 }] },
        { item: 6, partNumber: "1200281", description: "Shaft, Drive", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 60.8, y: 95.1 }] },
        { item: 7, partNumber: "41360", description: "Bearing, Ball, 0.59b 1.26d 0.35w[2seal]", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 53.4, y: 92 }, { x: 48.3, y: 89.1 }] },
        { item: 8, partNumber: "00961", description: "Key, Sq, 0.19 X 0.19, 0.50l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 57.6, y: 97.6 }] },
        { item: 9, partNumber: "1002077", description: "Tube, 0.59id 0.81od 00.5l", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 50.9, y: 90.1 }] },
        { item: 10, partNumber: "41186", description: "Washer, Flat, Belleville, .31", category: "Tornillería", qty: 1, hotspots: [{ x: 41.8, y: 85.8 }] },
        { item: 11, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 37.9, y: 83.7 }, { x: 82.5, y: 66.7 }, { x: 10.2, y: 21.2 }] },
        { item: 12, partNumber: "00911", description: "Key, Sq, 0.19 X 0.19, 0.75l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 54.2, y: 95.7 }] },
        { item: 13, partNumber: "378805", description: "Plug, Drive, Brush, Mach", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 45.3, y: 87.7 }] },
        { item: 14, partNumber: "1203758", description: "Tool, Installation, Belt", category: "Transmisión", qty: 1, hotspots: [{ x: 89.9, y: 39 }] },
        { item: 14, partNumber: "9010940", description: "Side Panel Assy, Cyl, Rh, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [] },
        { item: 15, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 10.2, y: 33 }] },
        { item: 16, partNumber: "08716", description: "Screw, Hex, M6 X 1.00 X 20, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 6.2, y: 30.5 }] },
        { item: 17, partNumber: "1200334", description: "Belt, Drive", category: "Transmisión", qty: 1, hotspots: [{ x: 18.5, y: 3.8 }] },
        { item: 18, partNumber: "1200215", description: "Sheave, 07grv, 2.96pd 0.63b [Pj]", category: "Transmisión", qty: 1, hotspots: [{ x: 24.3, y: 8.1 }] },
        { item: 19, partNumber: "1200281", description: "Shaft, Drive", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 20, y: 49.8 }] },
        { item: 20, partNumber: "41360", description: "Bearing, Ball, 0.59b 1.26d 0.35w[2seal]", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 27.8, y: 53.4 }, { x: 34.5, y: 57.3 }] },
        { item: 21, partNumber: "00961", description: "Key, Sq, 0.19 X 0.19, 0.50l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 22.9, y: 47.1 }] },
        { item: 22, partNumber: "1002077", description: "Tube, 0.59id 0.81od 00.5l", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 31.8, y: 54.4 }] },
        { item: 23, partNumber: "41186", description: "Washer, Flat, Belleville, .31", category: "Tornillería", qty: 1, hotspots: [{ x: 41.7, y: 60.3 }] },
        { item: 24, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 45.6, y: 62.1 }] },
        { item: 25, partNumber: "00911", description: "Key, Sq, 0.19 X 0.19, 0.75l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 26.8, y: 49.7 }] },
        { item: 26, partNumber: "378805", description: "Plug, Drive, Brush, Mach", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 38.1, y: 58.6 }] },
        { item: 27, partNumber: "1200898", description: "Plate, Side, Scrubhead, Rh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 10.4, y: 24.8 }] },
        { item: 28, partNumber: "1203758", description: "Tool, Installation, Belt", category: "Transmisión", qty: 1, hotspots: [{ x: 93.5, y: 40.5 }] },
        { item: 29, partNumber: "1014328", description: "Key, Sq, 05mm X 05mm, 25mml", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 40.6, y: 4.3 }, { x: 70, y: 18.9 }] },
        { item: 30, partNumber: "1054581", description: "Sheave, 07grv, 1.22pd 0.55b [Pj]", category: "Transmisión", qty: 2, hotspots: [{ x: 36.1, y: 3.1 }, { x: 77.7, y: 29.6 }] },
        { item: 31, partNumber: "222818", description: "Screw, Set, Soc, 08- 32 X 0.25, Nl", category: "Tornillería", qty: 4, hotspots: [{ x: 32.5, y: 2.2 }, { x: 74.2, y: 23.1 }] },
        { item: 32, partNumber: "1200283", description: "Cover, Belt", category: "Transmisión", qty: 2, hotspots: [{ x: 93.2, y: 75.6 }, { x: 10.4, y: 1.8 }] },
        { item: 32, partNumber: "222752", description: "Plug Assy, Idler, Brush", category: "Mangueras y sujeción", qty: 2, note: "S/N 10000000-19999999", hotspots: [] },
        { item: 33, partNumber: "1201341", description: "Gasket, Cover, Belt", category: "Sellos y empaques", qty: 1, note: "S/N 10000000-19999999", hotspots: [{ x: 89, y: 74.4 }, { x: 14.5, y: 3.1 }] },
        { item: 34, partNumber: "1057629", description: "Plug, Idler, Brush [Sgl Brg]", category: "Mangueras y sujeción", qty: 1, note: "S/N 10000000-19999999", hotspots: [{ x: 22.3, y: 75.6 }, { x: 59.3, y: 67.4 }] },
        { item: 35, partNumber: "222184", description: "Pin, Roll, .094d X 0.25l, .094/.097", category: "Pasadores y bujes", qty: 1, note: "S/N 10000000-19999999", hotspots: [{ x: 14.2, y: 71.2 }, { x: 67.8, y: 73.6 }] },
        { item: 36, partNumber: "222177", description: "Shaft, Plug, Idler", category: "Pasadores y bujes", qty: 1, note: "S/N 10000000-19999999", hotspots: [{ x: 18, y: 73.6 }, { x: 61.6, y: 71.6 }] },
        { item: 37, partNumber: "01516", description: "Ring, Retaining, Ext, 0.59d, Basic", category: "Pasadores y bujes", qty: 1, note: "S/N 10000000-19999999", hotspots: [{ x: 26.4, y: 76.6 }, { x: 55.4, y: 65.8 }] },
        { item: 38, partNumber: "390996", description: "Screw, Flt, Soc, M10 X 1.50 X 20,10.9,Nl", category: "Tornillería", qty: 2, hotspots: [{ x: 5.4, y: 61.8 }, { x: 81.7, y: 83 }] },
        { item: 39, partNumber: "1200309", description: "Door, Brush", category: "Escobillas y hojas", qty: 2, hotspots: [{ x: 8.7, y: 67.3 }, { x: 78, y: 76.9 }] },
        { item: 40, partNumber: "1059170", description: "Harness, Wire, Adapter [Deutsch, Dtp]", category: "Eléctrico", qty: 1, hotspots: [{ x: 62.2, y: 6.1 }] },
        { item: 41, partNumber: "1053342", description: "Motor, Ele, 36vdc 1750rpm 1.00hp 22.0a (See Breakdowns)", category: "Motores y actuadores", qty: 2, hotspots: [{ x: 62.9, y: 16.7 }, { x: 45, y: 6.2 }] },
        { item: 42, partNumber: "1034731", description: "Screw, Hex, M6 X 1.00 X 16, Ss, Sems", category: "Tornillería", qty: 12, hotspots: [{ x: 81.1, y: 41.3 }, { x: 97.1, y: 74.8 }, { x: 2.7, y: 13.7 }, { x: 26.1, y: 11.5 }] },
        { item: 42, partNumber: "9010935", description: "Belt, Cyl Head, W/Too;l, Afmkt", category: "Transmisión", qty: 1, hotspots: [] },
        { item: 43, partNumber: "1200334", description: "Belt, Drive", category: "Transmisión", qty: 2, hotspots: [{ x: 22, y: 5.1 }, { x: 85.1, y: 73.9 }] },
        { item: 44, partNumber: "1203758", description: "Tool, Installation, Belt", category: "Transmisión", qty: 1, hotspots: [{ x: 97.2, y: 42.3 }] }
      ]
    },
    "data/t12/side_squeegee_rh.json": {
      machine: "Tennant T12",
      group: "Scrub Head Side Squeegee Group, Right Hand",
      figure: "Fig. 15",
      image: "assets/t12/side_squeegee_rh.png",
      categories: ["Tornillería", "Pasadores y bujes", "Resortes", "Mangueras y sujeción", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1202243", description: "Door, Casting, Squeegee, Rh", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 16.9, y: 57.3 }] },
        { item: 2, partNumber: "1065134", description: "Latch, Cmpr, Yel Grip", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 72.4, y: 20.6 }] },
        { item: 3, partNumber: "363469", description: "Spring, Extn, 0.75od 0.10wir 03.0l", category: "Resortes", qty: 1, hotspots: [{ x: 18.2, y: 46.7 }] },
        { item: 4, partNumber: "10120", description: "Clevis, 0.31d X 0.75l", category: "Tornillería", qty: 1, hotspots: [{ x: 13.4, y: 37.4 }] },
        { item: 5, partNumber: "1202100", description: "Bellcrank, Lift, Sqge [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 32.3, y: 12.9 }] },
        { item: 6, partNumber: "71607", description: "Bushing, Sleeve, 0.63b 0.72d 0.38l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 38.5, y: 20 }, { x: 26.9, y: 38.9 }] },
        { item: 7, partNumber: "64425", description: "Washer, Thrust, 0.61b 1.25d .06, Fgl", category: "Tornillería", qty: 4, hotspots: [{ x: 41.7, y: 21.8 }, { x: 30.3, y: 44.5 }, { x: 24.3, y: 9.4 }, { x: 10.4, y: 26.6 }] },
        { item: 8, partNumber: "1200525", description: "Nut, T, M8 X 1.25", category: "Tornillería", qty: 2, hotspots: [{ x: 20.9, y: 5.6 }, { x: 6.8, y: 23.2 }] },
        { item: 9, partNumber: "79246", description: "Screw, Flt, Soc, M8 X 1.25 X 20, 18-8,Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 45.3, y: 55.5 }, { x: 90, y: 83.1 }] },
        { item: 10, partNumber: "09088", description: "Pin, Clevis, 0.37d X 1.00l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 9.1, y: 2.6 }] },
        { item: 11, partNumber: "44906", description: "Pin, Cotter, Hair, 0.38d .093 Wir", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 12.1, y: 6.9 }] },
        { item: 12, partNumber: "1201455", description: "Block, Sqge, Guide, Rh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 71, y: 88.4 }] },
        { item: 13, partNumber: "1016421", description: "Screw, Flt, M6 X 1.0 X 20, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 45.8, y: 88.1 }] },
        { item: 14, partNumber: "08708", description: "Nut, Hex, Lock, M6 X 1.00, Nl", category: "Tornillería", qty: 2, hotspots: [{ x: 75.6, y: 92.8 }] },
        { item: 15, partNumber: "1201453", description: "Strap Wldt, Sqge", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 79.8, y: 36.5 }] },
        { item: 16, partNumber: "1054312", description: "Hook Wldt, Latch", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 89.5, y: 40.3 }] },
        { item: 17, partNumber: "1200221", description: "Frame, Sqge, Side, Rh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 79.9, y: 84.5 }] },
        { item: 18, partNumber: "1200430", description: "Blade, Sqge, Side, 22.50l, Linatex (Standard)", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 89, y: 55.5 }] },
        { item: 18, partNumber: "1202159", description: "Blade, Sqge, Side, 22.50l, Urethane (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [] },
        { item: 18, partNumber: "1202160", description: "Blade, Sqge, Side, 22.50l, Gum (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [] }
      ]
    },
    "data/t12/side_squeegee_lh.json": {
      machine: "Tennant T12",
      group: "Scrub Head Side Squeegee Group, Left Hand",
      figure: "Fig. 16",
      image: "assets/t12/side_squeegee_lh.png",
      categories: ["Tornillería", "Pasadores y bujes", "Resortes", "Mangueras y sujeción", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1202221", description: "Door, Casting, Squeegee, Lh", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 4.9, y: 37.5 }] },
        { item: 2, partNumber: "1065134", description: "Latch, Cmpr, Yel Grip", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 44.8, y: 2.8 }] },
        { item: 3, partNumber: "363469", description: "Spring, Extn, 0.75od 0.10wir 03.0l", category: "Resortes", qty: 1, hotspots: [{ x: 61.7, y: 88.4 }] },
        { item: 4, partNumber: "10120", description: "Clevis, 0.31d X 0.75l", category: "Tornillería", qty: 1, hotspots: [{ x: 71.3, y: 91.2 }] },
        { item: 5, partNumber: "1200213", description: "Bellcrank, Lift, Sqge [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 80.1, y: 53.2 }] },
        { item: 6, partNumber: "71607", description: "Bushing, Sleeve, 0.63b 0.72d 0.38l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 79, y: 88.8 }, { x: 90.2, y: 66.2 }] },
        { item: 7, partNumber: "64425", description: "Washer, Thrust, 0.61b 1.25d .06, Fgl", category: "Tornillería", qty: 4, hotspots: [{ x: 84.1, y: 92.7 }, { x: 93.6, y: 68.2 }, { x: 74.9, y: 46.8 }] },
        { item: 8, partNumber: "1200525", description: "Nut, T, M8 X 1.25", category: "Tornillería", qty: 2, hotspots: [{ x: 89.2, y: 96.8 }, { x: 96.9, y: 70.7 }] },
        { item: 9, partNumber: "79246", description: "Screw, Flt, Soc, M8 X 1.25 X 20, 18-8,Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 41.5, y: 28.4 }, { x: 18, y: 19.2 }] },
        { item: 10, partNumber: "09088", description: "Pin, Clevis, 0.37d X 1.00l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 94.7, y: 50.5 }] },
        { item: 11, partNumber: "44906", description: "Pin, Cotter, Hair, 0.38d .093 Wir", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 94.7, y: 43.9 }] },
        { item: 12, partNumber: "1200689", description: "Block, Guide, Sqge", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 14.8, y: 56.7 }] },
        { item: 13, partNumber: "1016421", description: "Screw, Flt, M6 X 1.0 X 20, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 16.1, y: 78.2 }] },
        { item: 14, partNumber: "08708", description: "Nut, Hex, Lock, M6 X 1.00, Nl", category: "Tornillería", qty: 2, hotspots: [{ x: 10.3, y: 54.3 }] },
        { item: 15, partNumber: "1201453", description: "Strap Wldt, Sqge", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 73.8, y: 39.1 }] },
        { item: 16, partNumber: "1054312", description: "Hook Wldt, Latch", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 73.7, y: 33.1 }] },
        { item: 17, partNumber: "1200011", description: "Frame, Sqge, Side, Lh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 55.9, y: 33.4 }] },
        { item: 18, partNumber: "1200430", description: "Blade, Sqge, Side, 22.50l, Linatex (Standard)", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 15.7, y: 87.1 }] },
        { item: 18, partNumber: "1202159", description: "Blade, Sqge, Side, 22.50l, Urethane (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [] },
        { item: 18, partNumber: "1202160", description: "Blade, Sqge, Side, 22.50l, Gum (Option)", category: "Escobillas y hojas", qty: 1, hotspots: [] }
      ]
    },
    "data/t12/scrub_head_lift.json": {
      machine: "Tennant T12",
      group: "Scrub Head Lift Group",
      figure: "Fig. 11",
      image: "assets/t12/scrub_head_lift.png",
      categories: ["Tornillería", "Pasadores y bujes", "Resortes", "Mangueras y sujeción", "Motores y actuadores", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200774", description: "Actuator, 36vdc, 3.9strk, 450lb", category: "Motores y actuadores", qty: 1, hotspots: [{ x: 31, y: 33.6 }] },
        { item: 2, partNumber: "29584", description: "Pin, Clevis, 0.37d X 2.00l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 60.3, y: 8.1 }, { x: 48.8, y: 52.5 }] },
        { item: 3, partNumber: "44906", description: "Pin, Cotter, Hair, 0.38d .093 Wir", category: "Pasadores y bujes", qty: 3, hotspots: [{ x: 60.1, y: 11.3 }, { x: 45.3, y: 24.4 }, { x: 44.7, y: 61.9 }] },
        { item: 4, partNumber: "1200735", description: "Arm Wldt, Pivot (Replaced by 9013613)", category: "Estructura y cubiertas", qty: 1, note: "S/N 30000000-30049481", hotspots: [{ x: 11.4, y: 86.4 }] },
        { item: 5, partNumber: "1200440", description: "Pad, Stop, Rbr (Replaced by 9013613)", category: "Escobillas y hojas", qty: 1, note: "S/N 30000000-30049481", hotspots: [{ x: 14.8, y: 86 }] },
        { item: 6, partNumber: "04843", description: "Bushing, Flng, 0.63b 0.72d 0.25l", category: "Pasadores y bujes", qty: 4, note: "S/N 30000000-30049481", hotspots: [{ x: 3.3, y: 89 }, { x: 11.8, y: 59.1 }, { x: 41.6, y: 71.6 }] },
        { item: 7, partNumber: "80409", description: "Sleeve, P/M, 0.34b 0.63d 0.6l, Bnz", category: "Pasadores y bujes", qty: 4, note: "S/N 30000000-30049481", hotspots: [{ x: 9.1, y: 97.8 }] },
        { item: 8, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 6, hotspots: [{ x: 31.2, y: 24.6 }, { x: 39.9, y: 18.8 }, { x: 5.3, y: 56.2 }, { x: 48.1, y: 74.6 }, { x: 82, y: 32.9 }, { x: 60.5, y: 40.2 }] },
        { item: 9, partNumber: "09011", description: "Screw, Hex, M8 X 1.25 X 30, Ss", category: "Tornillería", qty: 6, hotspots: [{ x: 28.6, y: 23.4 }, { x: 36.7, y: 17.4 }, { x: 2.8, y: 54.5 }, { x: 51, y: 75.6 }, { x: 85.2, y: 35 }, { x: 66.6, y: 39.4 }] },
        { item: 10, partNumber: "1054662", description: "Bushing, Flng, 0.50b 0.59d 0.25l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 34.7, y: 26.7 }, { x: 43.3, y: 20.4 }, { x: 8.4, y: 57.9 }, { x: 44.8, y: 73 }] },
        { item: 11, partNumber: "222516", description: "Sleeve, P/M, 0.32b 0.50d 0.3l [430ss]", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 79, y: 31.1 }, { x: 58.6, y: 37.8 }] },
        { item: 12, partNumber: "1200764", description: "Bracket, Pivot, Spring", category: "Resortes", qty: 1, hotspots: [{ x: 80.4, y: 15.2 }] },
        { item: 13, partNumber: "365180", description: "Pin, Clevis, 0.38d X 2.50l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 58, y: 20.1 }] },
        { item: 14, partNumber: "1203336", description: "Spring, Cmpr, .73od 2.5l", category: "Resortes", qty: 2, hotspots: [{ x: 77.9, y: 19 }, { x: 82.8, y: 11.8 }] },
        { item: 15, partNumber: "1204185", description: "Tube, Bumper", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 85.2, y: 9.1 }] },
        { item: 16, partNumber: "1201996", description: "Screw, Hex, M8 X 1.25 X 140, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 49.9, y: 37.7 }] },
        { item: 17, partNumber: "379829", description: "Washer, Flat, 0.34b 1.50d .12, Stl, Pl", category: "Tornillería", qty: 1, hotspots: [{ x: 87.6, y: 6.2 }] },
        { item: 18, partNumber: "08713", description: "Nut, Hex, Lock, M8 X 1.25, Nl, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 88.3, y: 3.6 }] },
        { item: 19, partNumber: "1201033", description: "Link, Head Scb", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 19.1, y: 62.2 }, { x: 37.7, y: 70.4 }, { x: 29.2, y: 91.6 }] },
        { item: 20, partNumber: "367313", description: "Bushing, Flng, 1.00b 1.13d 0.50l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 22.5, y: 47.9 }, { x: 58.8, y: 63.3 }, { x: 47.8, y: 81.3 }, { x: 50.2, y: 94.9 }] },
        { item: 21, partNumber: "1201080", description: "Pivot Wldt", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 14.9, y: 43.2 }, { x: 68.5, y: 64.6 }] },
        { item: 22, partNumber: "09026", description: "Screw, Hex, M8 X 1.25 X 40, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 6.8, y: 40.5 }, { x: 71.7, y: 70.1 }, { x: 23.5, y: 79.6 }, { x: 83.4, y: 95.6 }] },
        { item: 23, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 10.8, y: 42 }, { x: 67.8, y: 68.2 }, { x: 23.8, y: 82.2 }, { x: 59.4, y: 98 }] },
        { item: 24, partNumber: "41141", description: "Washer, Lock, Int- Ext, 0.31", category: "Tornillería", qty: 2, hotspots: [{ x: 18.7, y: 45.3 }, { x: 62.5, y: 65.1 }, { x: 43.1, y: 81.4 }, { x: 55.1, y: 96.3 }] },
        { item: 25, partNumber: "1201354", description: "Pivot, Lift", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 28.3, y: 87.4 }, { x: 71.6, y: 89.7 }] },
        { item: 26, partNumber: "379829", description: "Washer, Flat, 0.34b 1.50d .12, Stl, Pl", category: "Tornillería", qty: 2, hotspots: [{ x: 25.9, y: 84.9 }, { x: 76.1, y: 90.6 }] },
        { item: 27, partNumber: "9013613", description: "Arm Kit, Lift, Scb [T12]", category: "Estructura y cubiertas", qty: 1, note: "S/N 30049482-39999999", hotspots: [{ x: 77.8, y: 24.8 }] },
        { item: 28, partNumber: "1054662", description: "Bushing, Flng, 0.50B 0.59D 0.25L", category: "Pasadores y bujes", qty: 2, note: "S/N 30049482-39999999", hotspots: [{ x: 79.5, y: 27.6 }, { x: 52.3, y: 34.3 }] },
        { item: 29, partNumber: "04843", description: "Bushing, Flng, 0.63B 0.72D 0.25L", category: "Pasadores y bujes", qty: 2, note: "S/N 30049482-39999999", hotspots: [{ x: 47.6, y: 32.7 }] },
        { item: 30, partNumber: "1020168", description: "Molding, Afmkt, Trim , Pvc, .08 .11, 01Ft", category: "Estructura y cubiertas", qty: 1, note: "S/N 30049482-39999999", hotspots: [{ x: 78.4, y: 21.3 }] }
      ]
    },
    "data/t12/squeegee_lift.json": {
      machine: "Tennant T12",
      group: "Rear Squeegee Lift Group",
      figure: "Fig. 20",
      image: "assets/t12/squeegee_lift.png",
      categories: ["Tornillería", "Pasadores y bujes", "Resortes", "Mangueras y sujeción", "Motores y actuadores", "Ruedas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1053815", description: "Bushing, Flex, Ure", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 31.3, y: 60.2 }] },
        { item: 2, partNumber: "1053870", description: "Arm, Lift, Sqge", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 50.2, y: 54.8 }] },
        { item: 3, partNumber: "1053814", description: "Clamp, Pivot, Link", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 27.3, y: 92.4 }] },
        { item: 4, partNumber: "09010", description: "Screw, Hex, M8 X 1.25 X 25, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 37.6, y: 29.4 }] },
        { item: 5, partNumber: "1017218", description: "Washer, Flat, 0.32b 1.00d .12, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 37.3, y: 32.6 }] },
        { item: 6, partNumber: "08713", description: "Nut, Hex, Lock, M8 X 1.25, Nl, Ss", category: "Tornillería", qty: 3, hotspots: [{ x: 32, y: 97.6 }] },
        { item: 7, partNumber: "1201489", description: "Actuator, 36vdc, 02.0strk, 0180lb", category: "Motores y actuadores", qty: 1, hotspots: [{ x: 16.4, y: 54.4 }] },
        { item: 8, partNumber: "94877", description: "Pin, Clevis, 10mmd X", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 3.5, y: 17.5 }] },
        { item: 9, partNumber: "44906", description: "Pin, Cotter, Hair, 0.38d .093 Wir", category: "Pasadores y bujes", qty: 4, hotspots: [{ x: 28.3, y: 28.5 }, { x: 60.6, y: 56.4 }, { x: 46.4, y: 1.7 }, { x: 52.9, y: 24.8 }] },
        { item: 10, partNumber: "1059969", description: "Washer, Thrust, 1.81b 2.93d .06w, Plstc", category: "Tornillería", qty: 2, hotspots: [{ x: 25.1, y: 56.9 }, { x: 44.3, y: 65.7 }] },
        { item: 11, partNumber: "1059316", description: "Link, Tensioner, Spring", category: "Resortes", qty: 1, hotspots: [{ x: 32, y: 12.2 }] },
        { item: 12, partNumber: "1201370", description: "Spring, Extn, 1.26od 0.162wir 03.3l", category: "Resortes", qty: 1, hotspots: [{ x: 26.4, y: 15.1 }] },
        { item: 13, partNumber: "1059498", description: "Pin, Clevis, 0.50d X 2.25l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 23.3, y: 37.8 }] },
        { item: 14, partNumber: "32493", description: "Washer, Flat, 0.50, Std", category: "Tornillería", qty: 1, hotspots: [{ x: 56.6, y: 54.9 }] },
        { item: 15, partNumber: "1059338", description: "Pin, Clevis, 0.37d X 5.25l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 60.7, y: 8.7 }, { x: 23, y: 6.4 }] },
        { item: 16, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, Ss", category: "Tornillería", qty: 5, hotspots: [{ x: 49.7, y: 3.9 }, { x: 49.8, y: 23.2 }, { x: 26.1, y: 25.8 }] },
        { item: 17, partNumber: "1018151", description: "Washer, Flat, 0.44b 0.88d .06, Nyl", category: "Tornillería", qty: 2, hotspots: [{ x: 29.4, y: 38 }] },
        { item: 18, partNumber: "1204957", description: "Coupling, Sqge", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 92.5, y: 23.1 }] },
        { item: 19, partNumber: "1054662", description: "Bushing, Flng, 0.50b 0.59d 0.25l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 78.8, y: 36.4 }] },
        { item: 20, partNumber: "1059990", description: "Sleeve, Flng, 0.32b 1.00/0.50d 0.6l, Ss", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 91.1, y: 42.6 }, { x: 61.5, y: 27.4 }] },
        { item: 21, partNumber: "09011", description: "Screw, Hex, M8 X 1.25 X 30, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 95.1, y: 44.3 }, { x: 57.8, y: 25.5 }] },
        { item: 22, partNumber: "08713", description: "Nut, Hex, Lock, M8 X 1.25, Nl, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 58.1, y: 39.7 }] },
        { item: 23, partNumber: "9010937", description: "Turnbuckle Replmt, Afmkt [T12]", category: "Tornillería", qty: 1, hotspots: [{ x: 66.5, y: 76.3 }] },
        { item: 24, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 56, y: 78.7 }, { x: 94.6, y: 26.8 }] },
        { item: 25, partNumber: "08714", description: "Nut, Hex, Lock, M10 X 1.5, Nl, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 60.2, y: 80.9 }, { x: 97.3, y: 29.5 }] },
        { item: 26, partNumber: "1205850", description: "Caster Assy, Swivel", category: "Ruedas", qty: 2, hotspots: [{ x: 81.6, y: 47.6 }, { x: 64.4, y: 38.4 }] },
        { item: 27, partNumber: "1055516", description: "Knob Assy, Star, 3.21d 5ear M12", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 79.5, y: 12.2 }] },
        { item: 28, partNumber: "578430", description: "Washer, Flat, 0.50d, Pl [Spring-Disc]", category: "Tornillería", qty: 2, hotspots: [{ x: 77.4, y: 15.7 }] }
      ]
    },
    "data/t12/main_frame.json": {
      machine: "Tennant T12",
      group: "Main Frame and Wheels Group",
      figure: "Fig. 3",
      image: "assets/t12/main_frame.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Eléctrico", "Ruedas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200025", description: "Frame Wldt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 21.4, y: 28.9 }] },
        { item: 2, partNumber: "71579", description: "Strap, Static, W/Grommet, .19 1.1w 25.0l", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 69.2, y: 57.9 }] },
        { item: 3, partNumber: "09011", description: "Screw, Hex, M8 X 1.25 X 30, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 58.8, y: 46.3 }] },
        { item: 4, partNumber: "41141", description: "Washer, Lock, Int-Ext, 0.31", category: "Tornillería", qty: 1, hotspots: [{ x: 65.1, y: 45.3 }] },
        { item: 5, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 69, y: 42.9 }] },
        { item: 6, partNumber: "1200298", description: "Stabilizer Wldt [Cassoday]", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 59.5, y: 68.5 }, { x: 15.4, y: 27.1 }] },
        { item: 7, partNumber: "12317", description: "Screw, Hex, M10 X 1.50 X 30, Ss", category: "Tornillería", qty: 6, hotspots: [{ x: 58.1, y: 53.5 }, { x: 6.3, y: 22.8 }] },
        { item: 8, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, Ss", category: "Tornillería", qty: 6, hotspots: [{ x: 54.7, y: 51.1 }, { x: 10.6, y: 24.7 }] },
        { item: 9, partNumber: "1200150", description: "Wheel, Drive, Ac (See Breakdown)", category: "Ruedas", qty: 1, hotspots: [{ x: 11.3, y: 80.3 }] },
        { item: 10, partNumber: "1200203", description: "Steer-Control Assy, Wheel Drive (See Breakdown)", category: "Ruedas", qty: 1, hotspots: [{ x: 10.4, y: 65.6 }] },
        { item: 11, partNumber: "09028", description: "Screw, Hex, M10 X 1.50 X 25, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 38.1, y: 75.5 }] },
        { item: 12, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 37.4, y: 71.2 }] },
        { item: 13, partNumber: "69234", description: "Clamp, Cable, Stl, 1.00d X 0.75w, 1hole", category: "Mangueras y sujeción", qty: 2, hotspots: [{ x: 39.8, y: 78.8 }] },
        { item: 14, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 3, hotspots: [{ x: 54.6, y: 89.6 }, { x: 80.8, y: 52.9 }] },
        { item: 15, partNumber: "1060626", description: "Tire Assy, Solid, 300mm X 100mm, Ure", category: "Ruedas", qty: 2, hotspots: [{ x: 16.2, y: 14.2 }, { x: 86.5, y: 56.7 }] },
        { item: 16, partNumber: "1059019", description: "Ring, Retaining, Ext, 1.375od", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 16.1, y: 10.1 }, { x: 90.5, y: 52.6 }] },
        { item: 17, partNumber: "1057780", description: "Horn, 36vdc, 110dba", category: "Eléctrico", qty: 1, hotspots: [{ x: 77.7, y: 59.2 }] },
        { item: 18, partNumber: "82833", description: "Sleeve, Nyl, 1.22id 35.0l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 57, y: 77.4 }] },
        { item: 19, partNumber: "09570", description: "Clamp, Cable, Stl, 0.9x1.8x0.62w, 1hole", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 49.8, y: 46.5 }] },
        { item: 20, partNumber: "1034731", description: "Screw, Hex, M6 X 1.00 X 16, Ss, Sems", category: "Tornillería", qty: 1, hotspots: [{ x: 49.9, y: 50.2 }] },
        { item: 21, partNumber: "130773", description: "Tie, Cable, Nyl, 11.0l, .14w, 3.0 Max. D", category: "Mangueras y sujeción", qty: 3, hotspots: [{ x: 58, y: 82.9 }] },
        { item: 22, partNumber: "1207171", description: "Rod, Sppt", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 64, y: 86.8 }] },
        { item: 23, partNumber: "33924", description: "Washer, Flat, M10, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 64.2, y: 91.7 }] },
        { item: 24, partNumber: "41358", description: "Screw, Soc, M10X1.50X35, 12.9", category: "Tornillería", qty: 1, hotspots: [{ x: 67.9, y: 94.1 }] },
        { item: 25, partNumber: "9011872", description: "Cap, Hub, Wheel [For 1060626]", category: "Mangueras y sujeción", qty: 2, hotspots: [{ x: 93.7, y: 54.4 }, { x: 10.8, y: 8.3 }] }
      ]
    },
    "data/t12/front_bumper.json": {
      machine: "Tennant T12",
      group: "Front Bumper and Side Door Group",
      figure: "Fig. 4",
      image: "assets/t12/front_bumper.png",
      categories: ["Tornillería", "Pasadores y bujes", "Ruedas", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "9010924", description: "Bumper, Lh, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 35.3, y: 52.6 }] },
        { item: 2, partNumber: "9010925", description: "Bumper, Rh, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 14.1, y: 40.7 }] },
        { item: 3, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 15, hotspots: [{ x: 41.6, y: 14.6 }, { x: 80.3, y: 36.2 }, { x: 58.6, y: 11.5 }, { x: 75.8, y: 29.2 }, { x: 24.9, y: 83.2 }, { x: 44.6, y: 97.1 }, { x: 59.6, y: 95.7 }] },
        { item: 4, partNumber: "1200869", description: "Channel Wldt, Rlr", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 7.2, y: 31.7 }, { x: 59.2, y: 59.1 }] },
        { item: 5, partNumber: "1200870", description: "Plate, Backing, Roller", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 52.1, y: 30.6 }, { x: 39, y: 25.3 }] },
        { item: 6, partNumber: "1054100", description: "Wheel, 04.0d 2.56w 0.41b", category: "Ruedas", qty: 2, hotspots: [{ x: 78.2, y: 56.6 }, { x: 2.3, y: 12.2 }] },
        { item: 7, partNumber: "57598", description: "Pin, Clevis, 0.37d X 3.25l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 70.1, y: 44.5 }, { x: 6.6, y: 10.8 }] },
        { item: 8, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 6, hotspots: [{ x: 70.9, y: 50.6 }, { x: 49.5, y: 29.7 }, { x: 41.9, y: 26.7 }, { x: 6.4, y: 15.2 }] },
        { item: 9, partNumber: "08713", description: "Nut, Hex, Lock, M8 X 1.25, Nl, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 46.8, y: 28.4 }] },
        { item: 10, partNumber: "44906", description: "Pin, Cotter, Hair, 0.38d .093 Wir", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 73.6, y: 47.3 }, { x: 19.9, y: 16.1 }] },
        { item: 11, partNumber: "1202289", description: "Panel, Door, Rh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 29.2, y: 1.7 }] },
        { item: 12, partNumber: "1202392", description: "Panel, Door, Lh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 95, y: 48.9 }] },
        { item: 13, partNumber: "1202349", description: "Hinge, Brush Door, Bent", category: "Escobillas y hojas", qty: 2, hotspots: [{ x: 37.9, y: 12.8 }, { x: 75.8, y: 34.7 }] },
        { item: 14, partNumber: "06941", description: "Screw, Hex, M6 X 1.00 X 10, 8.8", category: "Tornillería", qty: 4, hotspots: [{ x: 50.2, y: 20.6 }, { x: 68.8, y: 31.2 }] },
        { item: 15, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 46.6, y: 18.5 }, { x: 72.4, y: 32.6 }] },
        { item: 16, partNumber: "1202941", description: "Plate, Latch", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 47.8, y: 2.2 }, { x: 96.9, y: 28.4 }] },
        { item: 17, partNumber: "1203025", description: "Screw, Pan, Phl, 08-16 X 0.25, F/Plstc", category: "Tornillería", qty: 8, hotspots: [{ x: 43, y: 11.5 }, { x: 84.2, y: 35.2 }] },
        { item: 18, partNumber: "1200984", description: "Bracket Wldt, Latch, Lh", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 58.7, y: 6.9 }, { x: 87.1, y: 21.8 }] },
        { item: 19, partNumber: "1202779", description: "Magnet, Latch, Brush Door", category: "Escobillas y hojas", qty: 2, hotspots: [{ x: 51.4, y: 3.6 }, { x: 93.6, y: 25.9 }] },
        { item: 20, partNumber: "32520", description: "Nut, Hex, Jam, .25-20", category: "Tornillería", qty: 2, hotspots: [{ x: 55.1, y: 4.7 }, { x: 90.8, y: 23.1 }] },
        { item: 21, partNumber: "1200460", description: "Bracket, Bumper, Right", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 31.7, y: 72.6 }, { x: 60.5, y: 91.5 }] },
        { item: 22, partNumber: "09028", description: "Screw, Hex, M10 X 1.50 X 25, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 24, y: 77.8 }, { x: 48.1, y: 97.6 }] },
        { item: 23, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 27.5, y: 74.8 }, { x: 51.6, y: 97 }] }
      ]
    },
    "data/t12/seat_support.json": {
      machine: "Tennant T12",
      group: "Seat Support Group",
      figure: "Fig. 5",
      image: "assets/t12/seat_support.png",
      categories: ["Tornillería", "Pasadores y bujes", "Etiquetas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "9011057", description: "Plate Wldt, Mtg, W/Label, Aftmkt, Na", category: "Etiquetas", qty: 1, hotspots: [{ x: 66.2, y: 74.7 }] },
        { item: 1, partNumber: "9011058", description: "Plate Wldt, Mtg, W/Label, Aftmkt, JP", category: "Etiquetas", qty: 1, hotspots: [] },
        { item: 2, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 10, hotspots: [{ x: 53.9, y: 68.8 }, { x: 40.7, y: 78.1 }] },
        { item: 3, partNumber: "1200827", description: "Link, Oprtr Station", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 73, y: 60.9 }, { x: 48.3, y: 48.3 }] },
        { item: 4, partNumber: "1200828", description: "Link, Oprtr Station", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 94, y: 63.1 }, { x: 34.4, y: 41.7 }] },
        { item: 5, partNumber: "1201103", description: "Link Wldt, Oprtr Station", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 39.4, y: 27 }] },
        { item: 6, partNumber: "1202957", description: "Grip, Handle, .25d .90l Yel", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 36.5, y: 25.9 }] },
        { item: 7, partNumber: "1202156", description: "Sleeve, Flange", category: "Pasadores y bujes", qty: 9, hotspots: [{ x: 75.8, y: 62.3 }, { x: 87, y: 66.1 }, { x: 92.4, y: 52 }, { x: 83.2, y: 53.9 }, { x: 33.8, y: 38.6 }, { x: 44.1, y: 46.5 }, { x: 56.4, y: 36.9 }, { x: 51.3, y: 32.4 }] },
        { item: 8, partNumber: "19066", description: "Washer, Flat, 0.25b 0.56d .05, Pl, 10", category: "Tornillería", qty: 10, hotspots: [{ x: 70.3, y: 59.4 }, { x: 83.9, y: 65 }, { x: 95.1, y: 53.8 }, { x: 86.5, y: 55.9 }, { x: 32, y: 36.2 }, { x: 39.6, y: 42.8 }, { x: 50.7, y: 49.8 }, { x: 52.8, y: 35.4 }, { x: 47.9, y: 30.5 }] },
        { item: 9, partNumber: "08716", description: "Screw, Hex, M6 X 1.00 X 20, Ss", category: "Tornillería", qty: 9, hotspots: [{ x: 67.6, y: 57.9 }, { x: 81.1, y: 63.6 }, { x: 97.7, y: 55 }, { x: 29.5, y: 34.6 }, { x: 42.1, y: 44.2 }, { x: 53.8, y: 50.9 }, { x: 45, y: 28.4 }] },
        { item: 10, partNumber: "08708", description: "Nut, Hex, Lock, M6 X 1.00, Nl", category: "Tornillería", qty: 1, hotspots: [{ x: 48.2, y: 37.8 }] },
        { item: 11, partNumber: "1200210", description: "Channel Wldt, Seat", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 64.3, y: 55.2 }] },
        { item: 12, partNumber: "20802", description: "Bumper, Rbr, 1.0d 0.38th .25-20", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 88.1, y: 39.5 }, { x: 97, y: 49.4 }] },
        { item: 13, partNumber: "32520", description: "Nut, Hex, Jam, .25-20", category: "Tornillería", qty: 2, hotspots: [{ x: 88.1, y: 36.7 }, { x: 97.3, y: 46 }] },
        { item: 14, partNumber: "381962", description: "Handle, Container", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 55.6, y: 7 }] },
        { item: 15, partNumber: "382726", description: "Screw, Pan, Phl, M6 X 1.00 X 25, 4.8", category: "Tornillería", qty: 2, hotspots: [{ x: 55.5, y: 2.7 }] },
        { item: 16, partNumber: "41178", description: "Washer, Flat, 0.25, Fendr", category: "Tornillería", qty: 2, hotspots: [{ x: 95.9, y: 1.5 }] },
        { item: 17, partNumber: "08712", description: "Nut, Hex, Lock, M6 X 1.00, Nl, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 95.7, y: 4.1 }] },
        { item: 18, partNumber: "9009632", description: "Part Kit, Station, Oprtn, Plstc [2Pc=1Kit]", category: "Estructura y cubiertas", qty: 1, note: "S/N 10000000-19999999", hotspots: [{ x: 30.9, y: 19 }] },
        { item: 19, partNumber: "1200612", description: "Angle, Support", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 15.8, y: 85.7 }] },
        { item: 20, partNumber: "09026", description: "Screw, Hex, M8 X 1.25 X 40, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 63.1, y: 52.4 }] }
      ]
    },
    "data/t12/seat.json": {
      machine: "Tennant T12",
      group: "Seat Group, Standard",
      figure: "Fig. 6",
      image: "assets/t12/seat.png",
      categories: ["Tornillería", "Pasadores y bujes", "Eléctrico", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1201894", description: "Seat, Std [Milsco]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 46.5, y: 19.3 }] },
        { item: 2, partNumber: "1051052", description: "Spacer, Rnd, .38b .88d .38l", category: "Pasadores y bujes", qty: 4, hotspots: [{ x: 3.2, y: 57.8 }, { x: 38.3, y: 46.5 }, { x: 14.8, y: 66.3 }] },
        { item: 3, partNumber: "360370", description: "Track, Slide, Seat Adj, 12.5l, W/Latch", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 12.4, y: 52.9 }] },
        { item: 4, partNumber: "360369", description: "Track, Slide, Seat Adj, 12.5l", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 35.1, y: 66 }] },
        { item: 5, partNumber: "1048955", description: "Switch, Seat, No [Delta 6440-04]", category: "Eléctrico", qty: 1, hotspots: [{ x: 31.3, y: 48.9 }] },
        { item: 6, partNumber: "1035038", description: "Screw, Hex, .31-18 X 1.38, Ss, Nl", category: "Tornillería", qty: 4, hotspots: [{ x: 9.8, y: 81.5 }] },
        { item: 7, partNumber: "01685", description: "Washer, Flat, 0.38b 0.88d .08, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 57.3, y: 81.2 }, { x: 49.3, y: 75 }] },
        { item: 8, partNumber: "41437", description: "Nut, Hex, Lock, .31-18, Nl, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 57.2, y: 86 }, { x: 49.1, y: 79.9 }] }
      ]
    },
    "data/t12/steering_panel.json": {
      machine: "Tennant T12",
      group: "Steering and Instrument Panel Group, T12",
      figure: "Fig. 8",
      image: "assets/t12/steering_panel.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Eléctrico", "Ruedas", "Etiquetas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1202600", description: "Shaft Assy, Steering, Basic", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 51.5, y: 76.5 }] },
        { item: 2, partNumber: "1201253", description: "Bracket, Mtg, Brg", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 66.8, y: 50.8 }] },
        { item: 3, partNumber: "1205753", description: "Bracket Wldt, Sppt, Brg", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 79.1, y: 87.7 }] },
        { item: 4, partNumber: "223065", description: "Bearing, Flng, 2hole, 0.75b [Nyl]", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 65.8, y: 71.1 }, { x: 79.2, y: 90.2 }] },
        { item: 5, partNumber: "16931", description: "Screw, Hex, M8 X 1.25 X 20, 8.8", category: "Tornillería", qty: 5, hotspots: [{ x: 69.6, y: 72 }, { x: 55.3, y: 67.2 }, { x: 72.8, y: 96.5 }, { x: 75.5, y: 73.4 }, { x: 40.8, y: 87 }, { x: 75.6, y: 46.5 }] },
        { item: 6, partNumber: "32491", description: "Washer, Flat, 0.31, Std", category: "Tornillería", qty: 8, hotspots: [{ x: 58.4, y: 53.8 }, { x: 57, y: 64.8 }, { x: 75.8, y: 95.7 }, { x: 75.6, y: 76.5 }, { x: 44.9, y: 85 }, { x: 55.1, y: 91 }] },
        { item: 7, partNumber: "08709", description: "Nut, Hex, Lock, M8 X 1.25, Nl", category: "Tornillería", qty: 6, hotspots: [{ x: 55.6, y: 52.4 }, { x: 79.4, y: 92.9 }, { x: 46.3, y: 56.3 }] },
        { item: 8, partNumber: "1036490", description: "Wheel, Steering, 14.0d, Taper Bore", category: "Ruedas", qty: 1, hotspots: [{ x: 31.3, y: 40.1 }] },
        { item: 9, partNumber: "00912", description: "Key, Sq, 0.19 X 0.19, 1.00l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 54.3, y: 63.1 }] },
        { item: 10, partNumber: "08711", description: "Nut, Hex, Lock, M12 X 1.75, Nl", category: "Tornillería", qty: 1, hotspots: [{ x: 15.5, y: 41.6 }] },
        { item: 11, partNumber: "32493", description: "Washer, Flat, 0.50, Std", category: "Tornillería", qty: 1, hotspots: [{ x: 11.9, y: 39.4 }] },
        { item: 12, partNumber: "1038966", description: "Cap, Wheel, Steering", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 7.6, y: 37.5 }] },
        { item: 13, partNumber: "1057554", description: "Bearing, Flng, 2hole, 0.75b", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 28.8, y: 66.1 }] },
        { item: 14, partNumber: "09570", description: "Clamp, Cable, Stl, 0.9x1.8x0.62w, 1hole", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 46.6, y: 81.4 }] },
        { item: 15, partNumber: "9013277", description: "Panel kit, Cntrl, Replmt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 90, y: 16.5 }] },
        { item: 16, partNumber: "1201180", description: "Panel, Console, Lh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 79.1, y: 9.6 }] },
        { item: 17, partNumber: "1204177", description: "Label, Opertnl, Console, Lh", category: "Etiquetas", qty: 1, hotspots: [{ x: 75.5, y: 7.7 }] },
        { item: 18, partNumber: "361076", description: "Switch, Ignition [Merit Gmbh]", category: "Eléctrico", qty: 1, hotspots: [{ x: 38.5, y: 9.6 }] },
        { item: 18, partNumber: "361144", description: "Key, ignition, Sgl", category: "Pasadores y bujes", qty: 1, hotspots: [] },
        { item: 19, partNumber: "82226", description: "Washer, Flat, 0.91b 1.38d .06, Stl, Pl", category: "Tornillería", qty: 1, hotspots: [{ x: 42.4, y: 12.8 }] },
        { item: 20, partNumber: "1011735", description: "Switch, Safety, Shutoff", category: "Eléctrico", qty: 1, hotspots: [{ x: 52.3, y: 1.4 }] },
        { item: 21, partNumber: "1058679", description: "Switch, Rocker, Dpdt, On / None / On", category: "Eléctrico", qty: 1, hotspots: [{ x: 40.1, y: 4.2 }] },
        { item: 22, partNumber: "140825", description: "Screw, Pan, Phl, 06 X 0.50, Fmg/Ab, Blk", category: "Tornillería", qty: 10, hotspots: [{ x: 48.2, y: 15.4 }, { x: 63.5, y: 22.6 }] },
        { item: 23, partNumber: "398501", description: "Plug, Hole, Rt, Rocker Switch, .87 X 1.7", category: "Mangueras y sujeción", qty: 3, hotspots: [{ x: 58.6, y: 1.6 }] },
        { item: 24, partNumber: "39277", description: "Screw, Hex, M8 X 1.25 X 25, 8.8", category: "Tornillería", qty: 1, hotspots: [{ x: 50.4, y: 93.2 }] },
        { item: 25, partNumber: "36428", description: "Plate, Lintel Backing", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 34.3, y: 68.3 }] }
      ]
    },
    "data/t12/steering_panel_xp.json": {
      machine: "Tennant T12",
      group: "Steering and Instrument Panel Group, T12XP",
      figure: "Fig. 9",
      image: "assets/t12/steering_panel_xp.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Transmisión", "Eléctrico", "Ruedas", "Etiquetas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1208622", description: "Bracket Wldt, Brg", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 73.4, y: 81.8 }] },
        { item: 2, partNumber: "16931", description: "Screw, Hex, M8 X 1.25 X 20, 8.8", category: "Tornillería", qty: 7, hotspots: [{ x: 96.4, y: 94.5 }, { x: 34.2, y: 81 }, { x: 60.7, y: 61 }, { x: 55.4, y: 93.7 }] },
        { item: 3, partNumber: "32490", description: "Washer, Flat, 0.25, Std", category: "Tornillería", qty: 2, hotspots: [{ x: 96.9, y: 91.4 }] },
        { item: 4, partNumber: "9010942", description: "Sprocket Kit, 1.12b, Afmkt [T12]", category: "Transmisión", qty: 1, hotspots: [{ x: 70.2, y: 83 }] },
        { item: 5, partNumber: "00912", description: "Key, Sq, 0.19 X 0.19, 1.00l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 55.6, y: 90.8 }, { x: 42.9, y: 58.9 }] },
        { item: 6, partNumber: "09162", description: "Screw, Set, M6 X 1.00 X 8, Nl", category: "Tornillería", qty: 6, hotspots: [{ x: 64.8, y: 96.6 }, { x: 64.5, y: 81 }, { x: 13, y: 67.3 }, { x: 73, y: 84.7 }, { x: 89.3, y: 95.9 }] },
        { item: 7, partNumber: "1057572", description: "Plate Wldt, Sppt, Brg", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 29.4, y: 48.2 }] },
        { item: 8, partNumber: "32491", description: "Washer, Flat, 0.31, Std", category: "Tornillería", qty: 10, hotspots: [{ x: 30.3, y: 61.6 }, { x: 39, y: 79.5 }, { x: 58.8, y: 74.6 }, { x: 60.9, y: 63.9 }, { x: 41.8, y: 86 }] },
        { item: 9, partNumber: "08709", description: "Nut, Hex, Lock, M8 X 1.25, Nl", category: "Tornillería", qty: 10, hotspots: [{ x: 27.9, y: 64.4 }, { x: 55.7, y: 76.5 }, { x: 79.2, y: 43 }] },
        { item: 10, partNumber: "1057554", description: "Bearing, Flng, 2hole, 0.75b", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 37.8, y: 53.8 }, { x: 12.4, y: 54.7 }] },
        { item: 11, partNumber: "16735", description: "Screw, Hex, M8 X 1.25 X 16, 8.8", category: "Tornillería", qty: 4, hotspots: [{ x: 16.1, y: 58.3 }] },
        { item: 12, partNumber: "07791", description: "Nut, Hex, Flng, M8 X 1.25", category: "Tornillería", qty: 4, hotspots: [{ x: 8.9, y: 52.1 }, { x: 38.7, y: 56.9 }] },
        { item: 13, partNumber: "1202601", description: "Shaft Assy, Steering [T12]", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 44, y: 83.6 }] },
        { item: 14, partNumber: "9010943", description: "Sprocket Kit, 0.75b, Afmkt [T12]", category: "Transmisión", qty: 1, hotspots: [{ x: 21.1, y: 68 }] },
        { item: 15, partNumber: "1208612", description: "Tube, Column, Steering", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 59.7, y: 36.2 }] },
        { item: 16, partNumber: "1057785", description: "Bearing, Journal, 0.75b 0.88d 0.75l", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 52.6, y: 31.8 }, { x: 68.5, y: 40.5 }] },
        { item: 17, partNumber: "1056412", description: "Wheel, Steering, 14.4d", category: "Ruedas", qty: 1, hotspots: [{ x: 47.8, y: 18.1 }] },
        { item: 18, partNumber: "1059073", description: "Nut, Hex, Jam, 1.12-12", category: "Tornillería", qty: 1, hotspots: [{ x: 30.4, y: 20.2 }] },
        { item: 19, partNumber: "04846", description: "Washer, Thrust, 0.79b 1.42d 0.06[Garlok]", category: "Tornillería", qty: 1, hotspots: [{ x: 25.5, y: 18.1 }] },
        { item: 20, partNumber: "1057043", description: "Bearing, Flng, 2hole, 1.25b", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 60.6, y: 81.1 }] },
        { item: 21, partNumber: "1054654", description: "Bearing, Pillowblock, 1.12b", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 82.4, y: 96.4 }] },
        { item: 22, partNumber: "06961", description: "Screw, Hex, M10 X 1.5", category: "Tornillería", qty: 2, hotspots: [{ x: 73, y: 98 }] },
        { item: 23, partNumber: "32485", description: "Washer, Flat, 0.38, Sae", category: "Tornillería", qty: 2, hotspots: [{ x: 76.9, y: 97.1 }] },
        { item: 24, partNumber: "1053977", description: "Chain, Rlr, 35 X 35 Pitches", category: "Transmisión", qty: 1, hotspots: [{ x: 33.1, y: 74 }] },
        { item: 25, partNumber: "14799", description: "Link, Chain, Rlr, 35", category: "Transmisión", qty: 1, hotspots: [{ x: 20.5, y: 72.9 }] },
        { item: 26, partNumber: "223065", description: "Bearing, Flng, 2hole, 0.75b [Nyl]", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 44.3, y: 76 }] },
        { item: 27, partNumber: "1205753", description: "Bracket Wldt, Sppt, Brg", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 51.3, y: 63.2 }] },
        { item: 28, partNumber: "09570", description: "Clamp, Cable, Stl, 0.9x1.8x0.62w, 1hole", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 39.1, y: 66.9 }] },
        { item: 29, partNumber: "9010934", description: "Instr Panel, Pod, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 16.8, y: 8.7 }] },
        { item: 30, partNumber: "1201534", description: "Panel, Console, Lh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 71.5, y: 4.4 }] },
        { item: 31, partNumber: "1204170", description: "Label, Opertnl, Console, Lh", category: "Etiquetas", qty: 1, hotspots: [{ x: 67.9, y: 2.3 }] },
        { item: 32, partNumber: "361076", description: "Switch, Ignition [Merit Gmbh]", category: "Eléctrico", qty: 1, hotspots: [{ x: 39.3, y: 4.5 }] },
        { item: 32, partNumber: "361144", description: "Key, ignition, Sgl", category: "Pasadores y bujes", qty: 1, hotspots: [] },
        { item: 33, partNumber: "82226", description: "Washer, Flat, 0.91b 1.38d .06, Stl, Pl", category: "Tornillería", qty: 1, hotspots: [{ x: 42.2, y: 8.1 }] },
        { item: 34, partNumber: "1011735", description: "Switch, Safety, Shutoff", category: "Eléctrico", qty: 1, hotspots: [{ x: 61.2, y: 1.4 }] },
        { item: 35, partNumber: "1058679", description: "Switch, Rocker, Dpdt, On / None / On", category: "Eléctrico", qty: 1, hotspots: [{ x: 41.9, y: 1.7 }] },
        { item: 36, partNumber: "1201535", description: "Panel, Console, Rh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 83.1, y: 18.7 }] },
        { item: 37, partNumber: "1204176", description: "Label, Opertnl, Console, Rh", category: "Etiquetas", qty: 1, hotspots: [{ x: 83.4, y: 15.6 }] },
        { item: 38, partNumber: "140825", description: "Screw, Pan, Phl, 06 X 0.50, Fmg/Ab, Blk", category: "Tornillería", qty: 10, hotspots: [{ x: 61.5, y: 17.2 }, { x: 46.2, y: 10.7 }] },
        { item: 39, partNumber: "398501", description: "Plug, Hole, Rt, Rocker Switch, .87 X 1.7", category: "Mangueras y sujeción", qty: 3, hotspots: [{ x: 72.5, y: 7.5 }] },
        { item: 40, partNumber: "70651", description: "Ring, Retaining, Ext, 1.12d", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 91.5, y: 86.3 }] },
        { item: 41, partNumber: "39277", description: "Screw, Hex, M8 X 1.25 X 25, 8.8", category: "Tornillería", qty: 1, hotspots: [{ x: 38.7, y: 87.7 }] },
        { item: 42, partNumber: "1208625", description: "Plate Wldt, Brg", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 88, y: 83.8 }] },
        { item: 43, partNumber: "1034731", description: "Screw, Hex, m6 X 1.00 X 16, Sems, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 71.8, y: 87.1 }] }
      ]
    },
    "data/t12/front_cover.json": {
      machine: "Tennant T12",
      group: "Front Cover and Directional Pedal Group",
      figure: "Fig. 10",
      image: "assets/t12/front_cover.png",
      categories: ["Tornillería", "Mangueras y sujeción", "Eléctrico", "Etiquetas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200146", description: "Channel Wldt, Steering, Pntd", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 41.3, y: 15.4 }] },
        { item: 2, partNumber: "1200253", description: "Pedal Assy, Accelerator, Brake (See Breakdowns)", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 33.2, y: 51.9 }] },
        { item: 3, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 5, hotspots: [{ x: 75.8, y: 50.6 }, { x: 8.8, y: 42.6 }, { x: 81.6, y: 41.5 }] },
        { item: 4, partNumber: "9010930", description: "Panel, Access, Front, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 3.1, y: 51 }] },
        { item: 4, partNumber: "9011168", description: "Panel, Access, Front, Afmkt [Jp]", category: "Estructura y cubiertas", qty: 1, hotspots: [] },
        { item: 5, partNumber: "19676", description: "Cable, Glv .09d 013.0l .38eye /.38eye", category: "Eléctrico", qty: 1, hotspots: [{ x: 14.7, y: 35.8 }] },
        { item: 6, partNumber: "398806", description: "Latch", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 3, y: 55.9 }] },
        { item: 7, partNumber: "9010928", description: "Shroud, Front, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 54.6, y: 12.5 }] },
        { item: 8, partNumber: "15675", description: "Screw, Hex, M8 X 1.25 X 16, Ss", category: "Tornillería", qty: 5, hotspots: [{ x: 30.2, y: 31.3 }, { x: 39.4, y: 41.5 }, { x: 39.4, y: 50 }] },
        { item: 9, partNumber: "32491", description: "Washer, Flat, 0.31, Std", category: "Tornillería", qty: 5, hotspots: [{ x: 27, y: 28.7 }, { x: 37.3, y: 38.6 }, { x: 38.6, y: 46.9 }] },
        { item: 10, partNumber: "1202868", description: "Clip, Tie, 0.25d, Plstc", category: "Mangueras y sujeción", qty: 7, hotspots: [{ x: 39.6, y: 26.5 }, { x: 72.6, y: 36.5 }, { x: 57.2, y: 18.1 }] },
        { item: 11, partNumber: "1202308", description: "Controller, 36vdc, 200a [Ac Propel]", category: "Eléctrico", qty: 1, hotspots: [{ x: 89.3, y: 67.6 }] },
        { item: 12, partNumber: "24265", description: "Screw, Pan, Phl, M4 X 0.70 X 16, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 66.9, y: 63.6 }] },
        { item: 13, partNumber: "01683", description: "Washer, Flat, 10, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 71.2, y: 64.2 }] },
        { item: 14, partNumber: "130773", description: "Tie, Cable, Nyl, 11.0l, .14w, 3.0 Max. D", category: "Mangueras y sujeción", qty: 7, hotspots: [{ x: 51.4, y: 18 }, { x: 38.6, y: 33.7 }] },
        { item: 15, partNumber: "1201212", description: "Bracket, Ele, Cb [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 94, y: 33.7 }] },
        { item: 16, partNumber: "1201864", description: "Label, Circuitbreaker", category: "Etiquetas", qty: 1, hotspots: [{ x: 80.3, y: 45.7 }] },
        { item: 17, partNumber: "1052726", description: "Alarm, 9-48vdc, 95 Db(A) [Ec-H20]", category: "Eléctrico", qty: 1, hotspots: [{ x: 96.7, y: 57.8 }] },
        { item: 18, partNumber: "1052120", description: "Inductor, 25Mmid [218 Imp At 25Mhz] (Australia Only)", category: "Eléctrico", qty: 1, hotspots: [{ x: 91.9, y: 58.4 }] },
        { item: 19, partNumber: "1052123", description: "Inductor, 18Mmid [156 Imp At 25Mhz] (Australia Only)", category: "Eléctrico", qty: 1, hotspots: [{ x: 87.1, y: 61.6 }] },
        { item: 20, partNumber: "39283", description: "Screw, Hex, M10x 1.50 x 25, 8.8", category: "Tornillería", qty: "-", hotspots: [{ x: 50, y: 63.8 }, { x: 46.1, y: 44.5 }] },
        { item: 21, partNumber: "32492", description: "Washer, Flat, 0.38, Std", category: "Tornillería", qty: "-", hotspots: [{ x: 56.1, y: 60.9 }, { x: 45.4, y: 49.8 }] }
      ]
    },
    "data/t12/recovery_tank.json": {
      machine: "Tennant T12",
      group: "Recovery Tank Group",
      figure: "Fig. 17",
      image: "assets/t12/recovery_tank.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Sellos y empaques", "Eléctrico", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1037821", description: "Filter, Panl, Dust, 2.3 X 04.5 X 06.4", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 67.3, y: 40.6 }] },
        { item: 2, partNumber: "1026014", description: "Screen, Vacuum", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 57, y: 32.1 }] },
        { item: 3, partNumber: "1201157", description: "Plate, Mtg, Gasket", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 67.5, y: 18.3 }] },
        { item: 4, partNumber: "140825", description: "Screw, Pan, Phl, 06 X 0.50, Fmg/Ab, Blk", category: "Tornillería", qty: 2, hotspots: [{ x: 62.4, y: 29.5 }] },
        { item: 5, partNumber: "1016392", description: "Gasket, Ure, .50, 03.74w 05.31l, Adh", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 67.1, y: 28.2 }] },
        { item: 6, partNumber: "1201340", description: "Tray, Debris", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 20.1, y: 35.7 }] },
        { item: 7, partNumber: "1066720", description: "Sleeve, P/M, 0.32b 0.44d 0.2l [430ss]", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 22.7, y: 38 }] },
        { item: 8, partNumber: "09737", description: "Screw, Pan, Phl, M8 X 1.25 X 20, 4.8", category: "Tornillería", qty: 2, hotspots: [{ x: 23.9, y: 40.4 }] },
        { item: 9, partNumber: "9010920", description: "Recovery Tank, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 20.3, y: 46.1 }] },
        { item: 9, partNumber: "9011173", description: "Recovery Tank, Afmkt, Jp [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [] },
        { item: 10, partNumber: "1200458", description: "Bracket, Mtg, Tank", category: "Estructura y cubiertas", qty: 3, hotspots: [{ x: 18.4, y: 67.7 }, { x: 30, y: 74.1 }] },
        { item: 11, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 18, hotspots: [{ x: 12.7, y: 70.6 }, { x: 22.8, y: 65.2 }, { x: 26.6, y: 76.6 }, { x: 33.1, y: 70.7 }, { x: 42.5, y: 74.7 }] },
        { item: 12, partNumber: "1054823", description: "Angle, Mtg, Tank", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 51.3, y: 88.3 }, { x: 27.3, y: 34.8 }, { x: 20.6, y: 24.9 }] },
        { item: 13, partNumber: "385685", description: "Sensor, Level, Liq, 14vdc 01a .62-11", category: "Eléctrico", qty: 1, hotspots: [{ x: 62.2, y: 62 }] },
        { item: 14, partNumber: "1019285", description: "Bracket, Protector, Float Switch", category: "Eléctrico", qty: 1, hotspots: [{ x: 64.7, y: 58.7 }] },
        { item: 15, partNumber: "1200746", description: "Clip, Hose, Plstc 1.88-2.12", category: "Mangueras y sujeción", qty: 3, hotspots: [{ x: 86.7, y: 42.8 }, { x: 87.1, y: 32.3 }, { x: 72.9, y: 26 }] },
        { item: 16, partNumber: "49697", description: "Screw, Pan, Phl, M4 X 0.70 X 10, Ss", category: "Tornillería", qty: 6, hotspots: [{ x: 91.4, y: 40.7 }, { x: 91, y: 30.6 }, { x: 77.3, y: 23.9 }] },
        { item: 17, partNumber: "9010921", description: "Cover, Recovery Tank, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 66.2, y: 3.6 }] },
        { item: 18, partNumber: "1200519", description: "Bracket, Mtg, Cover", category: "Estructura y cubiertas", qty: 2, hotspots: [{ x: 30.2, y: 31.4 }, { x: 24.6, y: 21.5 }] },
        { item: 19, partNumber: "1057214", description: "Plate, Arm, Prop", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 48.4, y: 17.7 }] },
        { item: 20, partNumber: "360460", description: "Sleeve, P/M, 0.34b 0.63d 0.4l, Ss / Oil", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 35, y: 23.6 }] },
        { item: 21, partNumber: "12333", description: "Screw, Hex, M8 X 1.25 X 25, Ss, Nl", category: "Tornillería", qty: 1, hotspots: [{ x: 44.8, y: 28.2 }] },
        { item: 22, partNumber: "1017218", description: "Washer, Flat, 0.32b 1.00d .12, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 39.4, y: 26.7 }, { x: 43.1, y: 17.7 }] },
        { item: 23, partNumber: "230735", description: "Sleeve, P/M, Flng, 0.33b 0.75/0.50d 0.8l", category: "Pasadores y bujes", qty: 1, hotspots: [{ x: 52, y: 21.2 }] },
        { item: 24, partNumber: "59658", description: "Screw, Hex, M8 X 1.25 X 35, Nl, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 37.9, y: 15.9 }] },
        { item: 25, partNumber: "1200834", description: "Hose Assy, Drain, 2.0 Id X 32.2 L, Blk (Solution Tank)", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 96.8, y: 61.9 }] },
        { item: 26, partNumber: "1201434", description: "Clamp, Hose, Wormdrive, 4.63-5.50, 0.5w", category: "Mangueras y sujeción", qty: 2, hotspots: [{ x: 91, y: 63.6 }, { x: 73.4, y: 37 }] },
        { item: 27, partNumber: "1200737", description: "Hose Assy, Drain, 2.0 Id X 26.2l, Blk (Recovery Tank)", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 78.3, y: 35.5 }] },
        { item: 28, partNumber: "1066063", description: "Plug, Hole, Rnd, 0.25H 0.43L, Brb, Nyl", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 28.3, y: 38.1 }] },
        { item: 29, partNumber: "1066433", description: "Seal, Afmkt, Bulb, Dual, 08ft [F/.30gap]", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 6, y: 59.3 }] }
      ]
    },
    "data/t12/vacuum_fan.json": {
      machine: "Tennant T12",
      group: "Vacuum Fan Group",
      figure: "Fig. 18",
      image: "assets/t12/vacuum_fan.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Sellos y empaques", "Motores y actuadores", "Eléctrico", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200149", description: "Fan, Vac, 6.6 Dia, Ametek", category: "Motores y actuadores", qty: 1, hotspots: [{ x: 36.9, y: 46.8 }] },
        { item: 1, partNumber: "1206774", description: "Brush Kit, Motor, Fan", category: "Escobillas y hojas", qty: 1, hotspots: [] },
        { item: 2, partNumber: "1201267", description: "Assy, Seal, Mtg, Vacfan", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 43.3, y: 43.7 }] },
        { item: 3, partNumber: "49891", description: "Clamp, Hose, Wormdrive, 5.56-6.50d, .56w", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 48.9, y: 41.8 }] },
        { item: 4, partNumber: "08716", description: "Screw, Hex, M6 X 1.00 X 20, Ss", category: "Tornillería", qty: 5, hotspots: [{ x: 24.7, y: 54.7 }] },
        { item: 5, partNumber: "29570", description: "Washer, Flat, 0.28b 1.00d .06, Stl", category: "Tornillería", qty: 5, hotspots: [{ x: 29.1, y: 52.2 }] },
        { item: 6, partNumber: "1203848", description: "Muffler, Vacfan, 11.0 L", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 53.5, y: 78.8 }] },
        { item: 7, partNumber: "130773", description: "Tie, Cable, Nyl, 11.0l, .14w, 3.0 Max. D", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 51.8, y: 67.7 }] },
        { item: 8, partNumber: "1200369", description: "Insulation, Acstc, 0.5, 10.4 X 13.0 C-0", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 17.1, y: 57.3 }] },
        { item: 9, partNumber: "1200649", description: "Cover, Fan, Vacuum", category: "Motores y actuadores", qty: 1, hotspots: [{ x: 9.3, y: 57.3 }] },
        { item: 10, partNumber: "140154", description: "Sleeve, P/M, 0.25b 0.38d 0.3l, Pl", category: "Pasadores y bujes", qty: 2, hotspots: [{ x: 16.3, y: 97.3 }] },
        { item: 11, partNumber: "15678", description: "Screw, Hex, M6 X 1.00 X 16, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 9, y: 93.6 }, { x: 2.6, y: 88.7 }] },
        { item: 12, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 12.6, y: 95.7 }, { x: 5.8, y: 91.4 }] },
        { item: 13, partNumber: "1201875", description: "Hose, Vacuum, 1.75id X 68.6l, 2 Cuff", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 10.4, y: 29.2 }] },
        { item: 14, partNumber: "1067964", description: "Fastener, 25.0 [Hook & Loop]", category: "Tornillería", qty: 1, hotspots: [{ x: 9.5, y: 37.5 }] },
        { item: 15, partNumber: "1052126", description: "Inductor, 12.7Mmid [156 Imp At 25Mz] (Australia On- ly)", category: "Eléctrico", qty: 1, hotspots: [{ x: 34.9, y: 78.3 }] },
        { item: 16, partNumber: "16944", description: "Screw, hex, m4 X 0.70 X 10, Fmg", category: "Tornillería", qty: 1, hotspots: [{ x: 32.5, y: 49.5 }] }
      ]
    },
    "data/t12/solution_tank.json": {
      machine: "Tennant T12",
      group: "Solution Tank Group",
      figure: "Fig. 19",
      image: "assets/t12/solution_tank.png",
      categories: ["Tornillería", "Mangueras y sujeción", "Eléctrico", "Escobillas y hojas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "9010919", description: "Solution Tank, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 5.2, y: 27.1 }] },
        { item: 2, partNumber: "1059317", description: "Fitting Assy, Soltn, Bh", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 78.6, y: 47.4 }] },
        { item: 3, partNumber: "1011885", description: "Cap, Tank", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 11.3, y: 8 }] },
        { item: 4, partNumber: "1201588", description: "Sensor, Level, Liq, 30watt, Spst", category: "Eléctrico", qty: 1, hotspots: [{ x: 52.9, y: 62.7 }] },
        { item: 5, partNumber: "1201077", description: "Bracket, Sppt, Tank, Lh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 93.8, y: 62.5 }] },
        { item: 6, partNumber: "1201079", description: "Bracket, Sppt, Tank, Rh", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 14.1, y: 46.7 }] },
        { item: 7, partNumber: "12317", description: "Screw, Hex, M10 X 1.50 X 30, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 32.2, y: 64 }, { x: 86.6, y: 90.1 }] },
        { item: 8, partNumber: "01686", description: "Washer, Flat, 0.44b 1.00d .08, Ss", category: "Tornillería", qty: 8, hotspots: [{ x: 34.9, y: 66.7 }, { x: 82.2, y: 88.6 }, { x: 83.4, y: 65.6 }, { x: 27.2, y: 55.4 }] },
        { item: 9, partNumber: "08714", description: "Nut, Hex, Lock, M10 X 1.5, Nl, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 79.7, y: 64.7 }, { x: 31.1, y: 57 }] },
        { item: 10, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 12, hotspots: [{ x: 97, y: 76.8 }, { x: 14.4, y: 49.8 }, { x: 56.7, y: 1.4 }, { x: 55.9, y: 89.9 }, { x: 3.4, y: 76.4 }] },
        { item: 11, partNumber: "1205727", description: "Bracket Wldt, Sppt, Seat", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 67.5, y: 9.7 }] },
        { item: 12, partNumber: "630146", description: "Fitting, Plug, Pm06, Nyl", category: "Mangueras y sujeción", qty: 3, hotspots: [{ x: 49.9, y: 56.5 }, { x: 79.9, y: 52.8 }] },
        { item: 13, partNumber: "1027290", description: "Filter, Soltn, 020Mesh, Pm12 3.1D 02.6L", category: "Escobillas y hojas", qty: 1, hotspots: [{ x: 84.9, y: 26 }] }
      ]
    },
    "data/t12/circuit_board.json": {
      machine: "Tennant T12",
      group: "Electrical Circuit Board Group",
      figure: "Fig. 22",
      image: "assets/t12/circuit_board.png",
      categories: ["Tornillería", "Mangueras y sujeción", "Sellos y empaques", "Eléctrico", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200918", description: "Plate Wldt, Mtg, Electronic Component", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 68.5, y: 60.3 }] },
        { item: 2, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 5, hotspots: [{ x: 92, y: 60.2 }, { x: 2.9, y: 46 }, { x: 46.4, y: 85.2 }] },
        { item: 3, partNumber: "1202868", description: "Clip, Tie, 0.25d, Plstc", category: "Mangueras y sujeción", qty: 7, hotspots: [{ x: 55.6, y: 60.3 }] },
        { item: 4, partNumber: "130773", description: "Tie, Cable, Nyl, 11.0l, .14w, 3.0 Max. D", category: "Mangueras y sujeción", qty: 7, hotspots: [{ x: 80.9, y: 70.2 }] },
        { item: 5, partNumber: "1203717", description: "Bracket, Stiffener", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 12.4, y: 8.6 }] },
        { item: 6, partNumber: "1034731", description: "Screw, Hex, M6 X 1.00 X 16, Ss, Sems", category: "Tornillería", qty: 4, hotspots: [{ x: 8.3, y: 5.5 }, { x: 22.1, y: 9.6 }] },
        { item: 7, partNumber: "9010931", description: "Circuit Board Kit, Scrub, Afmkt [T12]", category: "Eléctrico", qty: 1, hotspots: [{ x: 63.5, y: 93 }] },
        { item: 8, partNumber: "9010932", description: "Circuit board Kit, H20_Sba, Afmkt [T12]", category: "Eléctrico", qty: 1, hotspots: [{ x: 69, y: 96.6 }] },
        { item: 9, partNumber: "1016825", description: "Support, Circuitboard", category: "Estructura y cubiertas", qty: 4, hotspots: [{ x: 66.3, y: 95 }] },
        { item: 10, partNumber: "1202869", description: "Support, Circuitboard [0.5\"]", category: "Estructura y cubiertas", qty: 4, hotspots: [{ x: 60.2, y: 90.9 }] },
        { item: 11, partNumber: "3701.6", description: "Screw, Pan, Phl, 06-32 x 0.38, Shmtl, Ss", category: "Tornillería", qty: 8, hotspots: [{ x: 42.6, y: 73.9 }] },
        { item: 12, partNumber: "1202862", description: "Washer, Flat, .21b .39d .04, Brs", category: "Tornillería", qty: 2, hotspots: [{ x: 92.2, y: 81.1 }] },
        { item: 13, partNumber: "07514", description: "Washer, Lock, Int, 10, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 95.1, y: 83.6 }] },
        { item: 14, partNumber: "1202864", description: "Nut, Hex, Std, M5 X 0.80, Brs", category: "Tornillería", qty: 1, hotspots: [{ x: 97.2, y: 85.9 }] },
        { item: 15, partNumber: "1061918", description: "Washer, Flat, 0.25b 0.47d .06, Brs", category: "Tornillería", qty: 2, hotspots: [{ x: 84.1, y: 93.3 }] },
        { item: 16, partNumber: "07515", description: "Washer, Lock, Int, 0.25, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 87.7, y: 94.4 }] },
        { item: 17, partNumber: "1061910", description: "Nut, Hex, Std, M6 X 1.00, Brs", category: "Tornillería", qty: 1, hotspots: [{ x: 91.7, y: 95.6 }] },
        { item: 18, partNumber: "1200792", description: "Cover, Box, Circuitboard", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 56.6, y: 5.6 }] },
        { item: 19, partNumber: "1201210", description: "Gasket, Cover, Circuitboard", category: "Sellos y empaques", qty: 1, hotspots: [{ x: 26.6, y: 2.4 }] },
        { item: 20, partNumber: "06934", description: "Screw, Pan, Phl, M5 X 0.80 X 20, 4.8", category: "Tornillería", qty: 6, hotspots: [{ x: 55.8, y: 13.9 }] },
        { item: 21, partNumber: "140011", description: "Washer, Flat, 0.21b 0.45d .03, Ss", category: "Tornillería", qty: 6, hotspots: [{ x: 55.5, y: 11.3 }] },
        { item: 22, partNumber: "9010922", description: "Side Cover, Std, Afmkt [T12]", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 84.7, y: 33.4 }] },
        { item: 23, partNumber: "1201024", description: "Bracket, Mtg, Panel", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 13.6, y: 37.2 }] },
        { item: 24, partNumber: "222290", description: "Diode, Ele, Plug", category: "Eléctrico", qty: 3, hotspots: [{ x: 92.3, y: 64.6 }] },
        { item: 25, partNumber: "06929", description: "Screw, Pan, Phl, M4 X 0.70 X 25, 4.8", category: "Tornillería", qty: 2, hotspots: [{ x: 91.3, y: 78 }] },
        { item: 26, partNumber: "1202860", description: "Washer, Flat, 0.17b 0.31d .03, Nyl", category: "Tornillería", qty: 3, hotspots: [{ x: 87.7, y: 76.4 }, { x: 76.4, y: 96.7 }] },
        { item: 27, partNumber: "24199", description: "Screw, Hex, M5 X 0.80 X 16, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 50.3, y: 98.1 }] },
        { item: 28, partNumber: "41140", description: "Washer, Lock, Int-Ext, 0.25", category: "Tornillería", qty: 1, hotspots: [{ x: 46.3, y: 96.2 }] },
        { item: 29, partNumber: "24265", description: "Screw, Pan, Phl, M4 X 0.70 X 16, Ss", category: "Tornillería", qty: 1, hotspots: [{ x: 80.5, y: 98 }] }
      ]
    },
    "data/t12/contactor_wires.json": {
      machine: "Tennant T12",
      group: "Electrical Contactor and Wires Group",
      figure: "Fig. 23",
      image: "assets/t12/contactor_wires.png",
      categories: ["Tornillería", "Eléctrico", "Etiquetas", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "1200897", description: "Plate, Electrical", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 85.8, y: 45.5 }] },
        { item: 2, partNumber: "1020341", description: "Screw, Hex, M8 X 1.25 X 20, Ss, Sems", category: "Tornillería", qty: 2, hotspots: [{ x: 69.8, y: 55.8 }] },
        { item: 3, partNumber: "1200913", description: "Label, Circuitbreaker", category: "Etiquetas", qty: 1, hotspots: [{ x: 48.6, y: 30 }] },
        { item: 4, partNumber: "76062", description: "Stand-Off, Wir, 0.25, Insulator, Panel", category: "Tornillería", qty: 3, hotspots: [{ x: 84.3, y: 58.5 }, { x: 68.1, y: 51.3 }] },
        { item: 5, partNumber: "01684", description: "Washer, Flat, 0.27b 0.69d .05, Ss", category: "Tornillería", qty: 3, hotspots: [{ x: 93.1, y: 45.3 }, { x: 90.6, y: 40 }] },
        { item: 6, partNumber: "58670", description: "Screw, Hex, .25-20 X 0.50, Nl", category: "Tornillería", qty: 3, hotspots: [{ x: 97.7, y: 43.8 }, { x: 95.4, y: 37.8 }] },
        { item: 7, partNumber: "41702", description: "Rod, Thrd, Full, .25-20 01.5l", category: "Estructura y cubiertas", qty: 3, hotspots: [{ x: 78.8, y: 59.9 }, { x: 62.8, y: 53 }] },
        { item: 8, partNumber: "32490", description: "Washer, Flat, 0.25, Std", category: "Tornillería", qty: 6, hotspots: [{ x: 58.5, y: 68.8 }, { x: 71.1, y: 62.7 }, { x: 42.5, y: 62 }, { x: 49.6, y: 56.9 }] },
        { item: 9, partNumber: "32982", description: "Washer, Lock, Int, 0.25", category: "Tornillería", qty: 3, hotspots: [{ x: 56, y: 69.6 }, { x: 39.7, y: 62.8 }] },
        { item: 10, partNumber: "01690", description: "Nut, Hex, Std, .25-20", category: "Tornillería", qty: 6, hotspots: [{ x: 52.8, y: 70.5 }, { x: 74.7, y: 61.2 }, { x: 36.6, y: 63.9 }, { x: 57.9, y: 55.3 }] },
        { item: 11, partNumber: "397609", description: "Contactor, 36vdc, No", category: "Eléctrico", qty: 1, hotspots: [{ x: 29.3, y: 52 }] },
        { item: 12, partNumber: "09738", description: "Screw, Hex, M5 X 0.80 X 12, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 96.3, y: 23.1 }] },
        { item: 13, partNumber: "140011", description: "Washer, Flat, 0.21b 0.45d .03, Ss", category: "Tornillería", qty: 4, hotspots: [{ x: 92.1, y: 24.5 }, { x: 14.4, y: 58.4 }] },
        { item: 14, partNumber: "09739", description: "Nut, Hex, Lock, M5 X 0.80, Nl, Ss", category: "Tornillería", qty: 2, hotspots: [{ x: 10.2, y: 59.5 }] },
        { item: 15, partNumber: "87318", description: "Fuse, 080a, 0.88 2.4l, 125volt,Slow-Blow", category: "Eléctrico", qty: 1, hotspots: [{ x: 41.5, y: 46.9 }] },
        { item: 16, partNumber: "1016314", description: "Boot, 90deg .50id 1.00id 2.50l, Red", category: "Estructura y cubiertas", qty: 4, hotspots: [{ x: 27.2, y: 66.2 }, { x: 23, y: 30.2 }] },
        { item: 17, partNumber: "1069894", description: "Cable, 06ga 5.5l Brown .25ring /.312ring", category: "Eléctrico", qty: 1, hotspots: [{ x: 27.4, y: 42.9 }] },
        { item: 18, partNumber: "1069897", description: "Cable, Battery, 4ga, .25ring / .312ring", category: "Eléctrico", qty: 1, hotspots: [{ x: 18.3, y: 95.9 }] },
        { item: 19, partNumber: "33944", description: "Screw, Pan, Phl, M6 X 1.00 X 35, 4.8", category: "Tornillería", qty: 2, hotspots: [{ x: 3.5, y: 84.1 }] },
        { item: 20, partNumber: "1064184", description: "Circuitbreaker, 02.5a, Resetable", category: "Eléctrico", qty: 5, hotspots: [{ x: 41.1, y: 32.3 }, { x: 37.9, y: 44.3 }] },
        { item: 21, partNumber: "383724", description: "Circuitbreaker, 25.0a, Resetable", category: "Eléctrico", qty: 1, hotspots: [{ x: 73.3, y: 22.8 }] },
        { item: 22, partNumber: "1206757", description: "Circuitbreaker, 60.0a, resetable", category: "Eléctrico", qty: 1, hotspots: [{ x: 73.2, y: 27.5 }] },
        { item: 23, partNumber: "600437", description: "Switch, Snap, 15a, Rlr", category: "Eléctrico", qty: 1, hotspots: [{ x: 36.2, y: 20.9 }] },
        { item: 24, partNumber: "601359", description: "Plate, Backing, Switch", category: "Eléctrico", qty: 1, hotspots: [{ x: 35.8, y: 23.7 }] },
        { item: 25, partNumber: "06922", description: "Screw, Pan, Phl, M3 X 0.50 X 20, 4.8", category: "Tornillería", qty: 2, hotspots: [{ x: 35.8, y: 26.1 }] },
        { item: 26, partNumber: "01754", description: "Nut, Hex, Std, M3 X 0", category: "Tornillería", qty: 2, hotspots: [{ x: 57.5, y: 16.9 }] },
        { item: 27, partNumber: "1059169", description: "Cable Assy, 10ga .25ring /.31ring, 050a", category: "Eléctrico", qty: 1, hotspots: [{ x: 92.6, y: 7.9 }] },
        { item: 28, partNumber: "25005", description: "Screw, Pan, Phl, 06-32 X 1.00, G1", category: "Tornillería", qty: 2, hotspots: [{ x: 52.8, y: 15 }] },
        { item: 29, partNumber: "75939", description: "Nut, Hex, Lock, #06-32, Nl", category: "Tornillería", qty: 2, hotspots: [{ x: 88.2, y: 14 }] }
      ]
    },
    "data/t12/battery_240.json": {
      machine: "Tennant T12",
      group: "Battery Group, 240Ah",
      figure: "Fig. 24",
      image: "assets/t12/battery_240.png",
      categories: ["Tornillería", "Pasadores y bujes", "Mangueras y sujeción", "Eléctrico", "Estructura y cubiertas"],
      parts: [
        { item: 1, partNumber: "222280", description: "Battery, Wet, 06vdc 0240ah", category: "Eléctrico", qty: 6, hotspots: [{ x: 97.5, y: 57.1 }, { x: 48.7, y: 42.3 }] },
        { item: 2, partNumber: "1041030", description: "Cap, Battery", category: "Mangueras y sujeción", qty: 12, hotspots: [{ x: 10.9, y: 28.6 }, { x: 7.9, y: 18.3 }, { x: 36.1, y: 21.8 }, { x: 22.8, y: 12.8 }, { x: 48.7, y: 18.1 }, { x: 46.4, y: 10.6 }, { x: 88.7, y: 23.1 }, { x: 91.9, y: 30.8 }, { x: 63.9, y: 24 }, { x: 53.3, y: 29.6 }, { x: 76.5, y: 34.5 }, { x: 64.3, y: 39.6 }] },
        { item: 3, partNumber: "83415", description: "Spacer, Battery, Foam, 2.00 X 2.0 X 11.0", category: "Pasadores y bujes", qty: 4, hotspots: [{ x: 14.1, y: 57.2 }] },
        { item: 4, partNumber: "223355", description: "Cable, 04ga 08.0l Blk .34ring /.34ring", category: "Eléctrico", qty: 4, hotspots: [{ x: 34.6, y: 10.4 }, { x: 22.2, y: 16 }, { x: 75.7, y: 22.1 }, { x: 63.7, y: 26.9 }] },
        { item: 5, partNumber: "223356", description: "Cable, 04ga 12.0l Blk .34ring /.34ring", category: "Eléctrico", qty: 1, hotspots: [{ x: 23.6, y: 22.5 }] },
        { item: 6, partNumber: "87435", description: "Nut, Hex, Flexlock, .31-18", category: "Tornillería", qty: 12, hotspots: [{ x: 10.9, y: 26 }, { x: 7.9, y: 15.2 }, { x: 36, y: 19.4 }, { x: 22.6, y: 10.4 }, { x: 48.7, y: 15.7 }, { x: 46.5, y: 8.3 }, { x: 88.7, y: 20.8 }, { x: 91.9, y: 28.4 }, { x: 63.8, y: 21.7 }, { x: 54.3, y: 26.8 }, { x: 76, y: 31.9 }, { x: 63.8, y: 37 }] },
        { item: 7, partNumber: "1016314", description: "Boot, 90deg .50id 1.00id 2.50l, Red", category: "Estructura y cubiertas", qty: 1, hotspots: [{ x: 51.7, y: 6.4 }] },
        { item: 8, partNumber: "611221", description: "Boot, Terminal, Battery, 25.4mm, Blk", category: "Eléctrico", qty: 11, hotspots: [{ x: 8, y: 12.7 }, { x: 11, y: 23.5 }, { x: 36, y: 17.1 }, { x: 22.6, y: 8.2 }, { x: 48.8, y: 13.2 }, { x: 88.8, y: 18.3 }, { x: 92, y: 25.9 }, { x: 63.8, y: 19.4 }, { x: 55.7, y: 24 }, { x: 75.9, y: 29.5 }, { x: 63.8, y: 34.6 }] },
        { item: 9, partNumber: "1201303", description: "Tray Wldt, Battery", category: "Eléctrico", qty: 1, hotspots: [{ x: 66.9, y: 62.5 }] },
        { item: 10, partNumber: "1006401", description: "Hose, Afmkt, Pvc, Brd, 0.50id, 03ft, Clr", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 66.3, y: 94.6 }] },
        { item: 11, partNumber: "54333", description: "Clamp, Hose, Wormdrive, 0.31-0.88d, .31w", category: "Mangueras y sujeción", qty: 2, hotspots: [{ x: 62.3, y: 88.8 }] },
        { item: 12, partNumber: "223361", description: "Cable Assy, 04ga .34ring /.34ring, 175a", category: "Eléctrico", qty: 1, hotspots: [{ x: 61.4, y: 10.5 }] },
        { item: 13, partNumber: "130773", description: "Tie, Cable, Nyl, 11.0l, .14w, 3.0 Max. D", category: "Mangueras y sujeción", qty: 1, hotspots: [{ x: 39, y: 2.7 }] }
      ]
    }
  };

  const ALL = "Todas";

  const $ = (sel) => document.querySelector(sel);
  const els = {
    // Comunes
    toast: $("#toast"),
    themeToggle: $("#theme-toggle"),
    crumbMachine: $("#crumb-machine"),
    crumbSep: $("#crumb-sep"),
    crumbAssembly: $("#crumb-assembly"),
    machineSwitch: $("#machine-switch"),
    titleMachine: $("#title-machine"),
    // Nivel 1
    machineView: $("#view-machine"),
    heroEyebrow: $("#hero-eyebrow"),
    heroExamples: $("#hero-examples"),
    tbMachine: $("#tb-machine"),
    tbManual: $("#tb-manual"),
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
    backBtn: $("#back-btn"),
    backLabel: $("#back-label"),
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
     Máquinas (T7, T12, ...)
     ========================================================== */
  let machines = [];     // entradas de data/machines.json
  let current = null;    // máquina seleccionada
  let defaultId = "t7";
  const home = (m = current) => `#/${m.id}/`;
  const zoneHref = (zone, n, m = current) => `${home(m)}zona/${zone.id}${n ? `/${n}` : ""}`;

  function savedMachineId() {
    try { return localStorage.getItem("t7-machine"); } catch { return null; }
  }

  function renderMachineSwitch() {
    els.machineSwitch.innerHTML = machines
      .map((m) => `<button type="button" role="radio" class="machine-option" data-machine="${m.id}"
                  aria-checked="${m === current}" tabindex="${m === current ? 0 : -1}"
                  title="${escapeHtml(m.name)} · Manual ${escapeHtml(m.manual || "")}"><span class="machine-option-brand">Tennant </span>${escapeHtml(m.short || m.name)}</button>`)
      .join("");
  }

  // Cambia la máquina activa: plano general, zonas, textos y buscador
  async function setMachine(id) {
    const m = machines.find((x) => x.id === id) || machines.find((x) => x.id === defaultId) || machines[0];
    if (m === current) return;
    await MachineView.load(m.data);
    current = m;
    try { localStorage.setItem("t7-machine", m.id); } catch {}

    const name = m.name, short = m.short || m.name;
    els.titleMachine.textContent = name;
    els.crumbMachine.textContent = `${short} Completa`;
    els.crumbMachine.href = home(m);
    els.backBtn.href = home(m);
    els.backLabel.textContent = `Volver a la ${short} Completa`;
    els.heroEyebrow.textContent = `${name} · Manual de partes ${m.manual || ""}`;
    els.tbMachine.textContent = name;
    els.tbManual.textContent = m.manual || "—";
    els.machineImg.alt = `Fregadora ${name}, vista general`;
    els.heroExamples.innerHTML = (m.examples || []).length
      ? `<span>Prueba:</span>` + m.examples.map((x) => `<button type="button" class="example-chip" data-example="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join("")
      : "";
    renderMachineSwitch();
    GlobalSearch.reset();
  }

  /* ==========================================================
     NIVEL 1 · Máquina completa
     ========================================================== */
  // Íconos de los sistemas en la portada (SVG en línea, heredan el color del texto)
  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const SYSTEM_ICONS = {
    brush: svg('<path d="M4 20h16"/><path d="M6 20v-4h12v4"/><path d="M8 16V9m4 7V6m4 10V9"/>'),
    wheel: svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 4v5.5M12 14.5V20M4 12h5.5M14.5 12H20"/>'),
    drop: svg('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>'),
    bolt: svg('<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>')
  };

  const MachineView = {
    data: null,

    async load(url) {
      this.data = await loadJSON(url);
      if (this.data.image) els.machineImg.src = this.data.image;
      this.render();
    },

    init() {
      const onZone = (e) => {
        const el = e.target.closest("[data-zone]");
        if (el) this.openZone(el.dataset.zone);
      };
      els.zoneHotspots.addEventListener("click", onZone);
      els.zoneList.addEventListener("click", onZone);

      // Mostrar/ocultar todos los nombres sobre el plano (se recuerda por navegador)
      const toggle = document.getElementById("labels-toggle");
      const setLabels = (on) => {
        els.machineDiagram.classList.toggle("show-labels", on);
        toggle.setAttribute("aria-pressed", String(on));
        toggle.textContent = on ? "Ocultar nombres" : "Mostrar nombres";
      };
      let saved = false;
      try { saved = localStorage.getItem("t7-labels") === "1"; } catch {}
      setLabels(saved);
      toggle.addEventListener("click", () => {
        const on = toggle.getAttribute("aria-pressed") !== "true";
        setLabels(on);
        try { localStorage.setItem("t7-labels", on ? "1" : "0"); } catch {}
      });

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

      // Tarjetas agrupadas por sistema; el número coincide con el del punto en el plano
      const card = (z) => {
        const n = zones.indexOf(z) + 1;
        const soon = z.status !== "available";
        const fig = (z.figure || "").replace(/^Fig\.\s*/, "").replace(/\s*\/\s*/g, " · ");
        return `<li>
          <button type="button" class="zone-card ${soon ? "is-soon" : ""}" data-zone="${z.id}"
                  title="${escapeHtml(z.description || z.name)}${soon ? " · Próximamente" : ""}">
            <span class="zone-index" aria-hidden="true">${String(n).padStart(2, "0")}</span>
            <span class="zone-card-text">
              <strong>${escapeHtml(z.name)}</strong>
              <span>${escapeHtml(z.description || "")}</span>
            </span>
            ${fig ? `<span class="fig-badge"><small>Fig.</small>${escapeHtml(fig)}</span>` : ""}
            ${soon ? `<span class="tag tag-soon">Próximamente</span>` : ""}
          </button>
        </li>`;
      };
      const systems = this.data.systems || [{ id: null, name: "Zonas" }];
      const grouped = systems
        .map((s) => ({ s, items: zones.filter((z) => (s.id ? z.system === s.id : true)) }))
        .filter((g) => g.items.length);
      const loose = zones.filter((z) => !systems.some((s) => s.id && s.id === z.system));
      if (this.data.systems && loose.length) grouped.push({ s: { id: "otros", name: "Otros" }, items: loose });

      els.zoneList.innerHTML = grouped
        .map(({ s, items }) => `<section class="system-group" data-system="${escapeHtml(s.id || "")}">
            <h3 class="system-title">
              <span class="system-icon" aria-hidden="true">${SYSTEM_ICONS[s.icon] || SYSTEM_ICONS.gear}</span>
              ${escapeHtml(s.name)}
              <span class="system-count">${items.length}</span>
            </h3>
            <ul class="zone-list">${items.map(card).join("")}</ul>
          </section>`)
        .join("");
    },

    openZone(id) {
      const z = this.zone(id);
      if (!z) return;
      if (z.status !== "available") {
        showToast(`${z.name}: despiece próximamente`);
        return;
      }
      location.hash = zoneHref(z);
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
    document.title = zone ? `${current.name} · ${zone.name}` : `${current.name} · Visor de despiece`;
  }

  // Una zona puede tener una sola figura ("data") o varias ("figures"), p. ej. Tanques: Fig. 27 y Fig. 29
  const figuresOf = (zone) => zone.figures || [{ label: zone.figure, data: zone.data }];

  function renderFigureTabs(zone, index) {
    const figures = figuresOf(zone);
    els.figureTabs.hidden = figures.length < 2;
    els.figureTabs.innerHTML = figures
      .map(
        (f, i) => `<a role="tab" class="figure-tab" href="${zoneHref(zone, i + 1)}"
                     aria-selected="${i === index}">${escapeHtml(f.label || `Figura ${i + 1}`)}</a>`
      )
      .join("");
  }

  /* ==========================================================
     Buscador global (Nivel 1): busca en los repuestos de todas las zonas
     ========================================================== */
  const MAX_RESULTS = 50;

  const GlobalSearch = {
    index: [],     // { zone, figureIndex, figure, part, haystack } de la máquina activa
    ready: null,   // promesa de construcción del índice
    cache: new Map(), // índice ya construido por máquina
    results: [],
    active: -1,

    init() {
      this.bindEvents();
    },

    // Al cambiar de máquina: índice propio de esa máquina (se reutiliza si ya se construyó)
    reset() {
      const id = current.id;
      this.close();
      els.globalSearch.value = "";
      if (!this.cache.has(id)) {
        const index = [];
        this.cache.set(id, { index, ready: this.buildIndex(MachineView.data, index) });
      }
      ({ index: this.index, ready: this.ready } = this.cache.get(id));
    },

    async buildIndex(machineData, index) {
      const jobs = machineData.zones
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
      settled.forEach((r) => (r.status === "fulfilled" ? index.push(...r.value) : console.error(r.reason)));
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
      location.hash = `${zoneHref(r.zone, r.figureIndex + 1)}?${params}`;
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

      // Botones de ejemplo bajo el buscador (cambian con la máquina)
      els.heroExamples.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-example]");
        if (!btn) return;
        els.globalSearch.value = btn.dataset.example;
        els.globalSearch.focus();
        this.update();
      });

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
    // #/<máquina>/zona/<id>  o  #/<máquina>/zona/<id>/<n.º de figura, desde 1>
    // Opcional: ?item=<n>&pn=<part number> selecciona ese repuesto (lo usa el buscador global)
    const [path, query = ""] = location.hash.replace(/^#\/?/, "").split("?");
    const segs = path.split("/").filter(Boolean);
    const params = new URLSearchParams(query);

    let machineId = null;
    if (segs.length && machines.some((m) => m.id === segs[0])) machineId = segs.shift();
    // Sin máquina en la ruta: la portada abre la última elegida; los enlaces antiguos #/zona/... son de la T7
    if (!machineId) machineId = segs.length ? defaultId : savedMachineId() || defaultId;
    try {
      await setMachine(machineId);
    } catch (err) {
      console.error(err);
      showToast("No se pudieron cargar los datos de la máquina");
      return;
    }

    const match = segs[0] === "zona" && segs[1] ? [null, segs[1], segs[2]] : null;
    const zone = match && MachineView.zone(match[1]);

    if (zone && zone.status === "available") {
      const figures = figuresOf(zone);
      const index = Math.min(Math.max(Number(match[2] || 1) - 1, 0), figures.length - 1);
      const changingFigure = !els.assemblyView.hidden && AssemblyView.loadedUrl !== figures[index].data;
      try {
        await AssemblyView.load(zone, figures[index]);
      } catch (err) {
        console.error(err);
        showToast(`No se pudo cargar el despiece de ${zone.name}`);
        location.hash = home();
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
      if (match) history.replaceState(null, "", home()); // zona inexistente o no disponible
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
    const registry = await loadJSON(MACHINES_URL);
    machines = registry.machines;
    defaultId = registry.default || machines[0].id;
    MachineView.init();
    GlobalSearch.init();

    // Selector de máquina en la cabecera: abre la portada de la máquina elegida
    els.machineSwitch.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-machine]");
      if (btn && btn.dataset.machine !== current.id) location.hash = `#/${btn.dataset.machine}/`;
    });
    els.machineSwitch.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const i = machines.indexOf(current) + (e.key === "ArrowRight" ? 1 : -1);
      const next = machines[(i + machines.length) % machines.length];
      location.hash = `#/${next.id}/`;
      setTimeout(() => els.machineSwitch.querySelector(`[data-machine="${next.id}"]`)?.focus(), 150);
    });

    window.addEventListener("hashchange", route);
    await route();
  }

  init();
})();
