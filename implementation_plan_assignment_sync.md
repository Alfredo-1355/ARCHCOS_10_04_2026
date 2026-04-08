# Arquitectura Maestra: Drag & Drop, Semanas vs Días y Motor RCPSP

Seguimos nutriendo el flujo para que sea el PM más poderoso del mercado. A las integraciones algorítmicas le sumamos ahora la manipulación visual total que has pedido: la libertad de romper el molde por categorías.

## ⚠️ User Review Required

El plan se consolida. Por favor, lee la sección del **Drag & Drop** (Punto 4) para confirmar que esta es la mecánica que esperas antes de yo escribir el código definitivo del nuevo Smart Schedule.

---

## 1. El Control Táctico: Switch Semanas / Días
- **Modo Semanas:** Vista Ejecutiva consolidada, ideal para el socio o cliente.
- **Modo Días:** Cuadrícula táctica. Expande las semanas a columnas de días (`D1, D2`) con scroll infinito suave horizontal, ideal para micromanagement directo del arquitecto a cargo. Regenera visualmente todo el algoritmo.

---

## 2. Motor de Eficiencia y Secuencia en Cascada Diaria (RCPSP)
- **Cascada Pura:** El algoritmo evita empalmes destructivos. Tarea B va después de Tarea A en perfecta bajada diagonal temporal.
- **Evasión de Fin de Semana:** El motor brinca matemáticamente Sábados y Domingos (no cuentan como progreso temporal).
- **Auto-Asignación Nivelada:** Rastreará a tu equipo. Si en D4 *Arianna* choca con 3 tareas críticas, el motor empuja la tarea para Alfredo o la pasa al D5. Así garantizamos un tiempo de entrega realista y óptimo. El % de SLA dependerá de lo bien que la computadora logró amontonar las cosas. 

---

## 3. Asignación Semafórica, Doble Clic y Database
- **UI:** Al lado del inicio temporal de una tarea, un botón redondo.
- **Acción:** Al dar "Doble Clic", saldrá la lista de equipo directo desde el servidor. Si fuerzas a alguien sobrecargado, el círculo será 🔴 *Rojo Alerta*. 
- **Persistencia Firebase:** Mueva lo que muevas, el sistema guarda un JSON silencioso en tiempo real (`updateProject`) en la base de datos maestra a tu colección de Firebase. Sin pérdidas.

---

## 4. Drag & Drop Total (Ubicación Libre de Revisiones)

Para cumplir tu nuevo requerimiento ("mover el elemento de revisión a todos lados en medio de los planos"):

**El Reto Actual:** El sistema encajonaba rígidamente todo en "Carpetas" (Architectural, MEP, Revisiones del Cliente). Las revisiones estaban atoradas hasta el final del documento.
**Solución Técnica:**
Diseñaré un motor de *Drag & Drop (HTML5 Nativo)* sobre el ícono de los 6 puntitos (`GripVertical`) a la izquierda del nombre de las filas.

- **Libertad de Flujo:** Podrás hacer *click y arrastrar* una línea naranja de "Revisión Schematic Design" y soltarla exactamente a la mitad de los Planos Arquitectónicos.
- **Interpolación Múltiple:** Podrás tener revisiones esparcidas dentro de MEP, dentro de civil, y ordenar planos subiéndolos o bajándolos de prioridad con solo arrastrar tu mouse, tal como en Trello o Jira.
- El objeto de la tarea simplemente cambiará en su array local y se autoguardará en Firebase en ese nuevo orden exacto.

---

## Open Questions

> [!TIP]
> **Consolidación del Código Final**
> Este set de integraciones es sumamente robusto. Al programarlo, reescribiremos casi por completo la usabilidad y estado de `SmartScheduleView.tsx` y su conexión a la nube.
>
> **¿Crees que estas 4 facetas ya cubren tu visión ideal para el funcionamiento de gestión?** 
> *1. Switch Días/Semana.*
> *2. Auto-asignación con Matriz Algorítmica en cascada.*
> *3. Doble clic para elegir arquitecto.*
> *4. Arrastrar y soltar libre de cualquier fila (Revisiones en todo lado).*
>
> **(Si das luz verde, procedo de inmediato a programarlo en el entorno real).**
