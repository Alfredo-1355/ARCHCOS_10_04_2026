# Plan de Arquitectura Avanzada: Motor de Gestión Estilo Opus/Neodata

Este plan detalla la evolución del Smart Schedule de una herramienta gráfica de Gantt a un **motor paramétrico de gestión de proyectos**, integrando lógicas profesionales de control de obra y tiempos basadas en rendimiento real, desviaciones y recursos.

## ⚠️ User Review Required

Transformar el componente a este nivel requiere cambios en la estructura de datos locales. Revisa y aprueba este enfoque antes de escribir el código interactivo.

---

## Proposed Changes

### 1. 📐 Cálculo Paramétrico por Rendimientos (Duración Dinámica)
**Concepto:** Las tareas no duran "lo que el usuario pinte", sino lo que la matemática dicte según los metros cuadrados (`sqft`).
**Implementación Técnica:**
- Al presionar **"Generar Plan"**, interceptaremos la creación de las barras por defecto (`weeks: boolean[]`).
- Si el proyecto tiene (ej. `5,520 SqFt`), usaremos una constante configurable de **rendimiento base** (ej. `2,500 SqFt / semana arquitecto`).
- Tareas como *Floor Plans* calcularán automáticamente `Math.ceil(5520 / 2500) = 3 semanas` estandarizadas.
- La inserción será automática en cascada sobre el Gantt.

### 2. 👻 El Fantasma de la "Línea Base" (Baseline vs. Real)
**Concepto:** Visualizar el atraso de forma instintiva comparando lo proyectado vs lo real.
**Implementación Técnica:**
- Expandiremos la interfaz `TaskRow` añadiendo `baselineWeeks: boolean[]`.
- Cuando des click en "Generar Plan", se guardará una copia de los `weeks` actuales en `baselineWeeks`.
- En el renderizado de la tabla, detrás de los bloques sólidos de progreso (la "realidad"), se dibujará un borde gris punteado (`border-dashed border-gray-300`) indicando dónde *debería* estar el bloque. Todo desfase será visualmente obvio.

### 3. 📉 Curva "S" de Avance (Progreso Físico vs. Tiempo)
**Concepto:** Gráfica ejecutiva que muestra si la velocidad de ejecución se está aplanando comparada con el calendario.
**Implementación Técnica:**
- En la sección lateral (*Execution Metrics*), generaremos un mini-gráfico `SVG` usando Tailwind.
- **Línea Punteada Azul:** La Línea Base acumulada (cuántas tareas *baseline* deberían cerrarse por semana).
- **Línea Sólida Verde:** El avance real consolidado hasta la semana actual.
- Alertas inmediatas: Si la línea sólida se aplasta y cruza la punteada hacia abajo, el proyecto está en riesgo.

### 4. 🔥 Matriz de Conflictos de Recursos (El Heatmap Personal)
**Concepto:** Evitar cuellos de botella humanos (sobreasignación de tareas a un mismo arquitecto en la misma semana).
**Implementación Técnica:**
- Añadiremos una columna estrecha "Responsable" (que soporte iniciales, ej. "AR", "KL").
- La lógica del *Heatmap* que está arriba (con colores azul/naranja/rojo) se trasladará inteligentemente. Al asignar tareas, si "AR" tiene >3 celdas activas en la columna de la *Semana 4*, un aura o borde rojo parpadeará sobre las iniciales de "AR" pidiendo redistribución (Resource Leveling).

### 5. ⛓️ Alertas de "Holgura Cero" (Zero Float Warning)
**Concepto:** Señalética agresiva para las tareas en las que procrastinar 1 día destruye el calendario final.
**Implementación Técnica:**
- Introduciremos un flag `isZeroFloat: boolean` en la definición de tareas del catálogo. Las tareas como *Life Safety* o las de *Structurals* críticas tendrán este flag por defecto.
- Visualmente tendrán un borde vibrante rojo/naranjo oscuro o un ícono parpadeante de **⚠️ Advertencia** en su etiqueta de nombre para evitar retrasos injustificados, dejando claro que aquí "no hay margen para arte libre".

---

## Plan de Ejecución (Fase 3 Opus)

Debido al volumen de las lógicas, lo ejecutaremos sobre tu código actual de esta forma:
1. **Actualización de Interfaces & Estado:** Añadir `baseline`, `assignee` y `isZeroFloat` a la estructura persistente.
2. **Motor Paramétrico:** Interceptar el `Generar Plan` para poblar el Gantt usando el `sqft` del proyecto padre.
3. **Ghost Baseline (UI):** Modificar el renderizado para la doble capa (transparente proyectada vs sólida real).
4. **Curva S (UI):** Construir la gráfica `SVG` de métricas.
5. **Carga de Trabajo Personal (UI):** Añadir asignaciones y detectar cuello de botella sobrecarga.

## Open Questions

> [!CAUTION]
> **Sobre el Cálculo Paramétrico:**
> Actualmente usas semanas completas (bloques de 7 días). Si el cálculo da 1.2 semanas, lo redondearemos hacia arriba (2 celdas = 2 semanas) para mantener limpia la visualización Gantt matricial que prefieres. **¿El factor base (ej. 2500 SqFt = 1 bloque de 1 semana) estaría bien codificado por defecto para Floor Plans, o prefieres que provea inputs en caso de que quieran alterar la "velocidad del despacho"?**
> 
> Si das tu aprobación con este detalle, comenzaré a escribir y reemplazar el código de `SmartScheduleView.tsx` cubriendo el poderío tipo Neodata/Opus.
