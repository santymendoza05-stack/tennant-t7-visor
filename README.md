# Visor de despiece · Tennant T7, Tennant T12 e IPC CT110

Visor web interactivo de repuestos para las fregadoras Tennant **T7** (manual de partes 9013606), Tennant **T12** (manual 9012729) e IPC **CT110** (catálogo LPTB02378), basado en los diagramas 2D de cada manual.

**Sitio:** https://santymendoza05-stack.github.io/tennant-t7-visor/

## Navegación

El **selector de la cabecera** (Tennant T7 / Tennant T12 / IPC CT110) cambia el plano general, las zonas, los despieces y el buscador global a los de la máquina elegida. El navegador recuerda la última máquina usada.

1. **Nivel 1 · Máquina completa:** vista general de la máquina con las zonas clave y un **buscador global** que busca en todas las zonas. Al elegir un resultado se abre la zona, se selecciona el repuesto y se ilumina su punto en el diagrama.
2. **Nivel 2 · Despiece:** diagrama con puntos numerados, buscador y tabla de repuestos con "Copiar Ref".

### Tennant T7 · manual 9013606

| Zona | Figura del manual | Datos |
|---|---|---|
| Racleta Trasera | Fig. 37 · Rear Squeegee Group, 800 mm | `data/squeegee_parts.json` |
| Cabeza de Cepillos | Fig. 18 · Disk Scrub Head Drive Motor Group, 800 mm | `data/scrub_head_disk_800.json` |
| Tanques | Fig. 27 · Recovery Tank Group<br>Fig. 29 · Solution Tank Group, Disk<br>Fig. 30 · Solution Tank Group, Cylindrical | `data/recovery_tank.json`<br>`data/solution_tank_disk.json`<br>`data/solution_tank_cyl.json` |
| Rueda Motriz / Tracción | Fig. 11 · Front Drive Wheel Group (S/N 10518139-) | `data/front_drive_wheel.json` |
| Panel de Instrumentos / Consola | Fig. 10 · Instrument Panel Group<br>Fig. 38 · Circuit Board Group | `data/instrument_panel.json`<br>`data/circuit_board.json` |
| Columna de Dirección / Volante | Fig. 9 · Steering Group | `data/steering_group.json` |
| Asiento y Cubierta de Baterías | Fig. 8 · Seat Group | `data/seat_group.json` |
| Chasis y Bastidor Principal | Fig. 4 · Main Frame Group, Disk Scrub Head<br>Fig. 7 · Main Frame Group, Cylindrical (S/N 10000000-10448498) | `data/main_frame_disk.json`<br>`data/main_frame.json` |
| Mecanismo de Elevación del Cabezal | Fig. 16 · Disk Scrub Head Lift Group | `data/scrub_head_lift.json` |
| Motor de Aspiración y Silenciador | Fig. 28 · Vacuum Fan Group | `data/vacuum_fan.json` |
| Sistema de Drenaje de Tanques | Fig. 31 · Tanks Drain Group | `data/tanks_drain.json` |
| Sistema de Baterías y Alimentación | Fig. 32 · Battery Group, 235Ah (S/N 10523206-) | `data/battery_group.json` |
| Mecanismo de Elevación de Racleta | Fig. 34 · Rear Squeegee Lift Group, Disk Scrub Head<br>Fig. 35 · Rear Squeegee Lift Group, Cylindrical Scrub Head | `data/squeegee_lift.json`<br>`data/squeegee_lift_cyl.json` |

### Tennant T12 · manual 9012729 (S/N 30000000-39999999)

Datos en `data/t12/` e imágenes en `assets/t12/`.

| Zona | Figura del manual |
|---|---|
| Racleta Trasera / Escobillas de Secado | Fig. 21 · Rear Squeegee Kit |
| Cabezal de Cepillos | Fig. 12 · Disk<br>Fig. 13 · Cylindrical Frame<br>Fig. 14 · Cylindrical Drive Motor |
| Escobillas Laterales del Cabezal | Fig. 15 · Right Hand<br>Fig. 16 · Left Hand |
| Mecanismo de Elevación del Cabezal | Fig. 11 · Scrub Head Lift Group |
| Mecanismo de Elevación de Racleta | Fig. 20 · Rear Squeegee Lift Group |
| Chasis y Ruedas | Fig. 3 · Main Frame and Wheels Group |
| Parachoques y Puerta Lateral | Fig. 4 · Front Bumper and Side Door Group |
| Asiento y Soporte | Fig. 5 · Seat Support Group<br>Fig. 6 · Seat Group, Standard |
| Dirección y Panel de Instrumentos | Fig. 8 · T12<br>Fig. 9 · T12XP |
| Cubierta Frontal y Pedal | Fig. 10 · Front Cover and Directional Pedal Group |
| Tanque de Recuperación | Fig. 17 · Recovery Tank Group |
| Motor de Aspiración | Fig. 18 · Vacuum Fan Group |
| Tanque de Solución | Fig. 19 · Solution Tank Group |
| Tarjeta de Control | Fig. 22 · Electrical Circuit Board Group |
| Contactor y Cableado | Fig. 23 · Electrical Contactor and Wires Group |
| Sistema de Baterías | Fig. 24 · Battery Group, 240Ah |

### IPC CT110 · catálogo LPTB02378 (CT110 BT85 ECS+CD GR/VE)

Datos en `data/ct110/` e imágenes en `assets/ct110/`. El catálogo no trae una vista general de la máquina, así que el plano general es un tablero con el dibujo de cada sección. Los números de los dibujos (que en este catálogo son imágenes) se ubicaron con OCR y se revisaron a mano.

| Zona | Tabla del catálogo | Repuestos clave |
|---|---|---|
| Racleta | SQUEEGEE | MPVR08041 Blade XL Latex (desde 07/2013) |
| Cabezal de Cepillos | HEAD | |
| Tanques | TANK | MOCC00273 Motor 3 St. 24V (Ametek 116598-13) |
| Instalación Eléctrica | ELECTRI.INSTAL. | MECE00450 Board Traction Curtis CT110 |
| Motor Rueda de Tracción | DRIVE ASSEMBLY<br>TRACTION MOTOR | RTRT00533 Ring Motorwheel |

## Uso local

```
python -m http.server 8000
```

Luego abre http://localhost:8000. También funciona abriendo `index.html` con doble clic, porque `js/app.js` lleva una copia de respaldo de los datos.

## Agregar o editar una zona

1. Crea el JSON de la figura con el mismo formato que los existentes (`data/` para la T7, `data/t12/` para la T12, `data/ct110/` para la CT110) y su imagen en `assets/` (o `assets/t12/`, `assets/ct110/`).
2. Regístrala en el `machine.json` de la máquina (`data/machine.json`, `data/t12/machine.json` o `data/ct110/machine.json`): `"status": "available"` y `"data"`, o `"figures"` si tiene varias.
3. Sincroniza la copia de respaldo:
   ```
   node tools/sync-fallback.js
   ```
4. Haz commit y push a `main`. GitHub Actions publica el sitio automáticamente y falla si olvidaste el paso 3.

Para calibrar la posición de un punto, haz **Alt+clic** sobre el diagrama. Eso copia las coordenadas en formato JSON.

## Agregar otra máquina

Añádela a `data/machines.json` con su `id`, `brand`, `name`, `short`, `manual`, la ruta a su `machine.json` y las búsquedas de ejemplo (`examples`). El selector de la cabecera la muestra automáticamente; su portada queda en `#/<id>/`.

---

Diagramas y referencias © Tennant Company e IPC, tomados de los manuales de partes de la T7, la T12 y la CT110. Este proyecto es una herramienta de consulta y no está afiliado a los fabricantes.
