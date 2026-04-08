# Protocolo de Validación y QA: Smart Schedule ↔ Firebase

Como Arquitecto de Software y con pleno conocimiento del stack técnico que manejamos en el proyecto ARCHCOS (**React Front-end + Firebase Cloud Firestore Backend**), avanzamos directo a las pruebas automatizadas y manuales de validación. 

Debido a la naturaleza **NoSQL** de Firebase, las "relaciones" (como Usuario ↔ Tarea) son documentales (por Referencia de ID), por lo cual el protocolo se adapta estrictamente a ese comportamiento mediante inmutabilidad y pruebas de persistencia.

---

## 🏗️ 1. Integridad Relacional y Estructural (Firestore NoSQL)

En una base relacional (ej. PostgreSQL), no te permite borrar un usuario si tiene tareas (Foreign Key). En Firebase, si borramos a un arquitecto, su ID (`user_1`) queda como un "fantasma" en el documento del proyecto. El front-end debe ser blindado contra esto.

### Checklist de QA:
- [ ] **Test de Orfandad (Degradación Elegante):**
  1. Asignar un plano a "Carlos L." (ej. `user_4`).
  2. Forzar borrado del usuario `user_4` directamente en el panel `Gestión de Equipos` (o en consola).
  3. Cargar el Smart Schedule. 
  4. **✓ Pase:** El componente NO hace un crash de pantalla blanca. Muestra un círculo vacío gris o un símbolo de interrogración `(?)` en la celda asignada, asimilando correctamente el ID huérfano.

---

## ☁️ 2. Persistencia, Optimistic UI y Sincronización

Aquí validaremos el "Debounce" (ahorro de latencia evitando escribir por cada pixel que arrastres el cronograma, logrando que guarde al pausar).

### Checklist UI Front-end:
- [ ] **Test de Mutación Rápida:** Asignar a 3 usuarios distintos en <1 segundo. Esperar 2 segundos. Actualizar ventana `[F5]`. **✓ Pase:** Los 3 usuarios siguen ahí, confirmando que Firebase empaquetó ambos cambios.
- [ ] **Prueba de Colisión de Estado (Sobrecarga de Matriz):** Disparar el doble clic, seleccionar alguien que colisione las reglas matemáticas de capacidad (3 tareas activas). **✓ Pase:** Mantiene persistencia del halo rojo tras refescar pantalla, ya que el estado se lee de la estructura de base, no es efímero local.

### Casos Extremos (Edge Cases):
- [ ] **Sincronización Offline:** Activa el "Modo Avión" o deshabilita red local. Mueve una tarea en el Smart Schedule de la Semana 2 a la 5. Reactiva Internet después de 15 segundos.
  **✓ Pase:** Firebase (que cuenta con soporte offline por default si se configura localmente) no tira error de consola pesado, re-sincroniza silenciosamente a la nube y retiene el cambio.

---

## 💻 3. Consultas Directas (Auditoría Técnica)

Para que verifiques que el frontend verdaderamente alteró tu base de datos principal (`archcosbasededatos`), puedes abrir las Herramientas de Desarrollador del navegador `[F12]`, ir a la Consola y pegar estos scripts nativos del SDK Firebase que ya tienes en uso:

### Snapshot de Verificación del Documento de Proyecto
Verifica si el nodo "smartSchedule" se anidó con éxito dentro del ID de tu proyecto.
```javascript
// Obtener la raíz del proyecto para leer las modificaciones (Cambia 'ID_DE_PROYECTO' por un real)
db.collection('projects').doc('ID_DE_PROYECTO').get().then((doc) => {
    if (doc.exists) {
        const ss = doc.data().smartSchedule;
        console.log("✅ Smart Schedule detectado en DB:", ss);
        console.log("Número de disciplinas:", ss.categories.length);
    } else {
        console.error("❌ Documento no existe.");
    }
});
```

### Extracción Profunda: Buscar qué planos tiene X Arquitecto
Puesto que en Firebase NoSQL las tareas viven dentro de "Categorías", no puedes hacer un clásico `SELECT * WHERE assignee = user_1`. Necesitas decodificar el array de estructura:

```javascript
db.collection('projects').doc('ID_DE_PROYECTO').get().then((doc) => {
    const categories = doc.data().smartSchedule?.categories || [];
    let planosArianna = [];
    
    categories.forEach(cat => {
        cat.tasks.forEach(task => {
            // Evaluamos el UUID o nombre referenciado
            if(task.assigneeId === 'ID_USUARIO_ARIANNA') {
                planosArianna.push(task.name);
            }
        });
    });
    console.table("Planos designados a Arianna:", planosArianna);
});
```
