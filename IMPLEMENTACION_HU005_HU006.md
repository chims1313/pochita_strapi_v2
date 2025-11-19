# ✅ Implementación HU005 y HU006

## 🎯 Requerimientos Implementados

### **HU005: Alerta cuando el veterinario cancela un horario**
✅ **Comunicación/Notificación cuando se cancela un horario**

### **HU006: Replanificar horas de atención**
✅ **Replanificar la agenda (modificar horarios existentes)**

---

## 📋 Cambios Realizados

### 1. **Backend - Carga de Disponibilidades**
```javascript
// Agregado en el server-side de Astro
const disponiblesResponse = await fetch(
  `${STRAPI_URL}/api/disponibles?populate=*&sort=fecha:desc`, 
  { headers: { Authorization: `Bearer ${jwt}` } }
);
if (disponiblesResponse.ok) {
  const disponiblesData = await disponiblesResponse.json();
  disponibilidades = disponiblesData.data || [];
}
```

### 2. **Frontend - Nueva Tab "Horarios"**
```html
<div class="tabs">
  <button class="tab active" data-tab="citas">Citas</button>
  <button class="tab" data-tab="disponibilidades">Horarios</button>  <!-- NUEVO -->
  <button class="tab" data-tab="fichas">Fichas Médicas</button>
</div>
```

### 3. **Frontend - Sección de Gestión de Horarios**
Nuevo tab que muestra:
- Lista de horarios disponibles
- Fecha, hora inicio, hora fin
- Veterinario asignado
- Cupos disponibles / totales
- Botones: "Editar Horario" y "Cancelar Horario"

### 4. **Función `cancelarHorario()` - HU005**
```javascript
window.cancelarHorario = async (btn) => {
  // 1. Obtiene datos del horario
  // 2. Elimina el horario (DELETE /api/disponibles/:id)
  // 3. Crea notificación para el veterinario
  // 4. Recarga página
}
```

**Funcionalidad:**
- Confirma antes de cancelar
- Elimina el horario de la BD
- **Crea notificación automática** tipo "cancelacion" para el veterinario
- Mensaje: "Tu horario del [fecha] a las [hora] ha sido cancelado por recepción"
- Alerta al usuario del éxito

### 5. **Función `editarHorario()` - HU006**
```javascript
window.editarHorario = async (btn) => {
  // 1. Obtiene horario actual
  // 2. Solicita nueva fecha (prompt)
  // 3. Solicita nueva hora inicio (prompt)
  // 4. Solicita nueva hora fin (prompt)
  // 5. Actualiza horario (PUT /api/disponibles/:id)
  // 6. Recarga página
}
```

**Funcionalidad:**
- Muestra valores actuales como default
- Permite modificar: fecha, hora_inicio, hora_fin
- Actualiza en BD
- Recarga para mostrar cambios

---

## 🔄 Flujo de Uso

### **Cancelar Horario (HU005)**
```
1. Recepcionista → Tab "Horarios"
2. Ve listado de horarios disponibles
3. Clic en "Cancelar Horario"
4. Confirma acción
5. Sistema:
   - Elimina horario de BD
   - Crea notificación para veterinario
   - Muestra mensaje de éxito
6. Página recarga
7. Horario ya no aparece en lista
8. Veterinario recibe notificación
```

### **Editar Horario (HU006)**
```
1. Recepcionista → Tab "Horarios"
2. Ve listado de horarios
3. Clic en "Editar Horario"
4. Sistema muestra prompts con valores actuales:
   - Nueva fecha (YYYY-MM-DD)
   - Nueva hora inicio (HH:MM)
   - Nueva hora fin (HH:MM)
5. Recepcionista ingresa nuevos valores
6. Sistema actualiza horario en BD
7. Página recarga
8. Horario muestra nuevos datos
```

---

## 🗃️ Estructura de Datos

### **Disponibilidad (Horario)**
```json
{
  "id": 1,
  "attributes": {
    "fecha": "2025-11-20",
    "hora_inicio": "09:00",
    "hora_fin": "17:00",
    "cupos_totales": 10,
    "cupos_disponibles": 7,
    "veterinario": {
      "data": {
        "id": 5,
        "attributes": {
          "username": "dr_veterinario"
        }
      }
    }
  }
}
```

### **Notificación Creada**
```json
{
  "data": {
    "mensaje": "Tu horario del 20/11/2025 a las 09:00 ha sido cancelado por recepción.",
    "tipo": "cancelacion",
    "leida": false,
    "users_permissions_user": 5
  }
}
```

---

## 🧪 Cómo Probar

### **Probar HU005 (Cancelar Horario con Notificación)**

1. **Crear horario desde Strapi admin:**
   - Content Manager → Disponible → Add New Entry
   - Fecha: 2025-11-25
   - Hora inicio: 10:00
   - Hora fin: 14:00
   - Cupos totales: 5
   - Cupos disponibles: 5
   - Veterinario: Seleccionar un veterinario
   - Save & Publish

2. **Desde el dashboard:**
   - Login como recepcionista
   - Ir a tab "Horarios"
   - Debe aparecer el horario creado
   - Clic "Cancelar Horario"
   - Confirmar

3. **Verificar:**
   - Horario eliminado de lista
   - En Strapi admin → Notificacion → Ver nueva entrada
   - Tipo: "cancelacion"
   - Usuario: el veterinario del horario
   - Mensaje menciona fecha y hora

### **Probar HU006 (Editar/Replanificar Horario)**

1. **Tener un horario existente** (como arriba)

2. **Desde el dashboard:**
   - Login como recepcionista
   - Ir a tab "Horarios"
   - Clic "Editar Horario"
   - Ingresar:
     - Nueva fecha: 2025-11-26
     - Nueva hora inicio: 11:00
     - Nueva hora fin: 15:00
   - Confirmar

3. **Verificar:**
   - Página recarga
   - Horario muestra nuevos datos
   - En Strapi admin → Disponible → verificar actualización

---

## 📊 Endpoints Utilizados

### **HU005 - Cancelar Horario**
```
GET  /api/disponibles/:id?populate=*  → Obtener detalles
DELETE /api/disponibles/:id            → Eliminar horario
POST /api/notificacions                → Crear notificación
```

### **HU006 - Editar Horario**
```
GET /api/disponibles/:id?populate=*    → Obtener datos actuales
PUT /api/disponibles/:id               → Actualizar horario
```

---

## ⚠️ Consideraciones

### **Permisos en Strapi**
Asegúrate de que el rol "Recepcionista" tenga permisos para:
- `disponible`: find, findOne, update, delete
- `notificacion`: create, find

### **Validación**
- Las fechas deben ser formato YYYY-MM-DD
- Las horas deben ser formato HH:MM (24 horas)
- No se valida que la nueva fecha/hora sea futura (puedes agregar esto)

### **Mejoras Futuras**
- Usar modal en lugar de prompts para editar
- Datepicker para seleccionar fecha
- Timepicker para seleccionar horas
- Validar que nueva fecha >= hoy
- Notificar también al editar (opcional)
- Mostrar notificaciones en el dashboard

---

## ✨ Resumen

**HU005 ✅**: Cancelar horario crea automáticamente notificación para el veterinario
**HU006 ✅**: Editar horario permite replanificar fecha y horas

Ambas funcionalidades están completamente operativas con Astro + Strapi, sin TypeScript. 🎉
