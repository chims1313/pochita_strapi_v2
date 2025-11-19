# 🎯 MEJORES PRÁCTICAS - Astro + Strapi

## Para evitar problemas de sincronización frontend-backend

---

## ✅ 1. Siempre validar antes de operaciones destructivas

### ❌ MAL
```javascript
window.cancelarCita = async (btn) => {
  const citaId = btn.dataset.id;
  // Directamente intenta cancelar sin verificar
  await fetch(`/api/citas/${citaId}`, { 
    method: 'PUT',
    body: JSON.stringify({ data: { estado: 'cancelada' } })
  });
}
```

### ✅ BIEN
```javascript
window.cancelarCita = async (btn) => {
  const citaId = btn.dataset.id;
  
  // 1. Primero verificar que existe
  const existe = await verificarCitaExiste(citaId);
  if (!existe) {
    alert('Esta cita ya no existe');
    window.location.reload();
    return;
  }
  
  // 2. Ahora sí, cancelar
  const response = await fetch(`/api/citas/${citaId}`, { 
    method: 'PUT',
    body: JSON.stringify({ data: { estado: 'cancelada' } })
  });
  
  // 3. Manejar errores específicos
  if (response.status === 404) {
    alert('Cita eliminada por otro usuario');
    window.location.reload();
  }
}
```

---

## ✅ 2. Siempre recargar después de cambios

### ❌ MAL - Manipular DOM manualmente
```javascript
if (response.ok) {
  // Intentar actualizar el DOM manualmente
  const card = btn.closest('.card');
  card.querySelector('.badge').textContent = 'cancelada';
  card.querySelector('.badge').className = 'badge badge-cancelada';
}
```
**Problema:** El DOM puede quedar desincronizado con el backend.

### ✅ BIEN - Recargar página completa
```javascript
if (response.ok) {
  alert('Cita cancelada correctamente.');
  window.location.reload(); // Fuerza nuevo fetch al backend
}
```
**Beneficio:** Garantiza que frontend = backend siempre.

---

## ✅ 3. Manejar errores específicamente

### ❌ MAL
```javascript
try {
  const response = await fetch(...);
  if (!response.ok) {
    alert('Error'); // No dice QUÉ error
  }
} catch (error) {
  console.log(error); // Solo log, no feedback al usuario
}
```

### ✅ BIEN
```javascript
try {
  const response = await fetch(...);
  
  if (response.ok) {
    // Éxito
    return;
  }
  
  // Manejar errores específicos
  const errorData = await response.json();
  
  switch (response.status) {
    case 404:
      alert('Este recurso ya no existe. Recargando...');
      window.location.reload();
      break;
    case 401:
      alert('Sesión expirada. Redirigiendo al login...');
      window.location.href = '/login';
      break;
    case 403:
      alert('No tienes permisos para esta acción');
      break;
    default:
      alert(`Error: ${errorData.error?.message || 'Desconocido'}`);
  }
  
} catch (error) {
  // Error de red
  console.error('Error de conexión:', error);
  alert('Error de conexión. Verifica tu internet.');
}
```

---

## ✅ 4. Pasar datos de Astro a JavaScript correctamente

### ❌ MAL - Variables globales en script inline
```astro
---
const citas = await fetchCitas();
---

<script>
  // Esto NO funciona - citas no está definido aquí
  const misCitas = citas; 
</script>
```

### ✅ BIEN - Usando script tag JSON
```astro
---
const citas = await fetchCitas();
---

<!-- Inyectar datos en JSON -->
<script id="citas-data" type="application/json">
  {JSON.stringify(citas)}
</script>

<script>
  // Leer datos del script tag
  const citasEl = document.getElementById('citas-data');
  const citas = JSON.parse(citasEl.textContent);
  
  console.log('Citas cargadas:', citas.length);
</script>
```

---

## ✅ 5. Usar populate para relaciones

### ❌ MAL
```javascript
// GET sin populate
const response = await fetch('/api/citas');
const citas = response.data;

// cita.mascota = { id: 1 } ← Solo ID, no datos
```

### ✅ BIEN
```javascript
// GET con populate
const response = await fetch('/api/citas?populate=*');
const citas = response.data;

// cita.mascota.data.attributes = { nombre: "Firulais", ... } ← Datos completos
```

---

## ✅ 6. Logs de depuración estratégicos

### ❌ MAL
```javascript
console.log('cargando citas');
// ... mucho código ...
console.log('terminado');
```

### ✅ BIEN
```javascript
// Al inicio: Estado inicial
console.log('Dashboard cargado con:', {
  citas: citas.length,
  citasIds: citas.map(c => c.id),
  timestamp: new Date().toISOString()
});

// Antes de operación: Lo que vas a hacer
console.log('Cancelando cita:', { id: citaId, estadoActual: cita.estado });

// Después de operación: Resultado
console.log('Cita cancelada exitosamente:', response.data);

// En errores: Toda la info relevante
console.error('Error al cancelar cita:', {
  citaId,
  status: response.status,
  error: errorData
});
```

---

## ✅ 7. Estructura de mapeo segura

### ❌ MAL
```astro
{citas.map((cita) => (
  <div>
    <p>{cita.mascota.nombre}</p> <!-- Si mascota es null, crash -->
  </div>
))}
```

### ✅ BIEN
```astro
{citas.map((cita) => (
  <div key={cita.id}> <!-- Siempre key en loops -->
    <p>{cita.mascota?.nombre || 'Sin mascota'}</p> <!-- Optional chaining + fallback -->
    <p>{cita.attributes?.estado || cita.estado || 'pendiente'}</p> <!-- Múltiples fallbacks -->
  </div>
))}
```

---

## ✅ 8. Validación de JWT

### ❌ MAL
```javascript
const jwt = document.cookie.split('jwt=')[1];
// Si no existe jwt, jwt = undefined y fetch falla sin explicación
```

### ✅ BIEN
```javascript
function getJWT() {
  const jwt = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt='))
    ?.split('=')[1];
  
  if (!jwt) {
    alert('Sesión expirada. Por favor inicia sesión nuevamente.');
    window.location.href = '/login';
    return null;
  }
  
  return jwt;
}

// Uso
const jwt = getJWT();
if (!jwt) return; // Detener si no hay JWT
```

---

## ✅ 9. Estados vacíos

### ❌ MAL
```astro
{citas.map(cita => <Card {...cita} />)}
<!-- Si citas.length = 0, no muestra nada (confuso para el usuario) -->
```

### ✅ BIEN
```astro
{citas.length === 0 ? (
  <div class="empty-state">
    <p>No hay citas programadas</p>
    <button>Crear primera cita</button>
  </div>
) : (
  <div class="cards-grid">
    {citas.map(cita => <Card key={cita.id} {...cita} />)}
  </div>
)}
```

---

## ✅ 10. Confirmaciones antes de acciones destructivas

### ❌ MAL
```javascript
btn.addEventListener('click', async () => {
  // Directamente cancela sin confirmar
  await cancelarCita(citaId);
});
```

### ✅ BIEN
```javascript
btn.addEventListener('click', async () => {
  // Pedir confirmación
  const confirmar = confirm('¿Seguro que quieres cancelar esta cita?');
  if (!confirmar) return;
  
  await cancelarCita(citaId);
});
```

---

## 🔍 Checklist Pre-Deploy

Antes de dar por terminada una funcionalidad:

- [ ] ¿Valido que el recurso existe antes de operarlo?
- [ ] ¿Manejo específicamente errores 404, 401, 403?
- [ ] ¿Recargo la página después de cambios?
- [ ] ¿Uso optional chaining (`?.`) y fallbacks (`||`)?
- [ ] ¿Tengo logs útiles para debugging?
- [ ] ¿Muestro estados vacíos claramente?
- [ ] ¿Pido confirmación en acciones destructivas?
- [ ] ¿Verifico JWT antes de cada request?
- [ ] ¿Uso `populate=*` en Strapi queries?
- [ ] ¿Probé eliminar el recurso desde admin y ver cómo reacciona el frontend?

---

## 🎓 Patrones Recomendados

### Patrón: Fetch con manejo completo
```javascript
async function fetchConManejo(url, options = {}) {
  try {
    const jwt = getJWT();
    if (!jwt) return null;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetch:', error);
    alert('Error: ' + error.message);
    return null;
  }
}

// Uso
const data = await fetchConManejo('/api/citas?populate=*');
if (!data) return; // Manejo si falló
```

### Patrón: Operación con validación
```javascript
async function operarConValidacion(id, operacion) {
  // 1. Validar existencia
  const existe = await verificarExiste(id);
  if (!existe) {
    alert('Recurso no encontrado');
    window.location.reload();
    return;
  }
  
  // 2. Confirmar acción
  if (!confirm(`¿Confirmar ${operacion}?`)) return;
  
  // 3. Ejecutar
  const resultado = await ejecutarOperacion(id, operacion);
  
  // 4. Manejar resultado
  if (resultado) {
    alert(`${operacion} exitosa`);
    window.location.reload();
  }
}
```

---

## 📚 Recursos

- **Astro Docs:** https://docs.astro.build/
- **Strapi Docs:** https://docs.strapi.io/
- **REST API Best Practices:** https://restfulapi.net/

---

## 💡 Regla de Oro

> **"El frontend NUNCA debe asumir que algo existe. Siempre debe verificar primero."**

Aplica esto en cada operación destructiva (PUT, DELETE) y tendrás un sistema robusto sin citas fantasma. 🎉
