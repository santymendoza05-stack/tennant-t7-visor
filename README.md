# Visor de despiece · Tennant T7

Visor web interactivo de repuestos para la fregadora Tennant T7, basado en los diagramas 2D del manual de partes (9013606).

**Sitio:** https://santymendoza05-stack.github.io/tennant-t7-visor/

## Navegación

1. **Nivel 1 · T7 completa:** vista general de la máquina con las zonas clave y un **buscador global** que busca en todas las zonas. Al elegir un resultado se abre la zona, se selecciona el repuesto y se ilumina su punto en el diagrama.
2. **Nivel 2 · Despiece:** diagrama con puntos numerados, buscador y tabla de repuestos con "Copiar Ref".

| Zona | Figura del manual | Datos |
|---|---|---|
| Racleta Trasera | Fig. 37 · Rear Squeegee Group, 800 mm | `data/squeegee_parts.json` |
| Cabeza de Cepillos | Fig. 18 · Disk Scrub Head Drive Motor Group, 800 mm | `data/scrub_head_disk_800.json` |
| Tanques | Fig. 27 · Recovery Tank Group<br>Fig. 29 · Solution Tank Group, Disk | `data/recovery_tank.json`<br>`data/solution_tank_disk.json` |
| Rueda Motriz / Tracción | Fig. 11 · Front Drive Wheel Group (S/N 10518139-) | `data/front_drive_wheel.json` |
| Panel de Instrumentos / Consola | Fig. 10 · Instrument Panel Group<br>Fig. 38 · Circuit Board Group | `data/instrument_panel.json`<br>`data/circuit_board.json` |

## Uso local

```
python -m http.server 8000
```

Luego abre http://localhost:8000. También funciona abriendo `index.html` con doble clic, porque `js/app.js` lleva una copia de respaldo de los datos.

## Agregar o editar una zona

1. Crea el JSON de la figura en `data/`, con el mismo formato que los existentes, y su imagen en `assets/`.
2. Regístrala en `data/machine.json`: `"status": "available"` y `"data"`, o `"figures"` si tiene varias.
3. Sincroniza la copia de respaldo:
   ```
   node tools/sync-fallback.js
   ```
4. Haz commit y push a `main`. GitHub Actions publica el sitio automáticamente y falla si olvidaste el paso 3.

Para calibrar la posición de un punto, haz **Alt+clic** sobre el diagrama. Eso copia las coordenadas en formato JSON.

---

Diagramas y referencias © Tennant Company, tomados del manual de partes de la T7. Este proyecto es una herramienta de consulta y no está afiliado a Tennant.
