# 🧪 Script de prueba para verificar endpoints de Citas
# Ejecuta este script para probar que todo funciona correctamente

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🧪 PRUEBAS DE API - CITAS STRAPI" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$STRAPI_URL = "http://localhost:1337"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "📍 Servidor: $STRAPI_URL" -ForegroundColor Yellow
Write-Host ""

# 1. Solicitar credenciales
Write-Host "🔐 Paso 1: Login" -ForegroundColor Green
$username = Read-Host "Ingresa tu usuario"
$password = Read-Host "Ingresa tu password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Login
try {
    $loginBody = @{
        identifier = $username
        password = $passwordText
    } | ConvertTo-Json

    Write-Host "   Enviando login..." -ForegroundColor Gray
    $loginResponse = Invoke-RestMethod -Uri "$STRAPI_URL/api/auth/local" -Method POST -Headers $headers -Body $loginBody
    $jwt = $loginResponse.jwt
    Write-Host "   ✅ Login exitoso! JWT obtenido" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Error en login: $_" -ForegroundColor Red
    exit
}

# Agregar JWT a headers
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $jwt"
}

# 2. Listar todas las citas
Write-Host "📋 Paso 2: Listar todas las citas" -ForegroundColor Green
try {
    $citasResponse = Invoke-RestMethod -Uri "$STRAPI_URL/api/citas?populate=*&sort=fecha:desc" -Headers $authHeaders
    $citas = $citasResponse.data
    
    Write-Host "   ✅ Total de citas: $($citas.Count)" -ForegroundColor Green
    
    if ($citas.Count -eq 0) {
        Write-Host "   ⚠️  No hay citas en el sistema" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Sugerencia: Crea una cita desde el admin de Strapi" -ForegroundColor Cyan
        Write-Host "   URL: http://localhost:1337/admin" -ForegroundColor Cyan
        exit
    } else {
        Write-Host ""
        Write-Host "   📊 Citas encontradas:" -ForegroundColor Cyan
        foreach ($cita in $citas) {
            $id = $cita.id
            $estado = $cita.attributes.estado
            $fecha = $cita.attributes.fecha
            $mascota = if ($cita.attributes.mascota.data) { $cita.attributes.mascota.data.attributes.nombre } else { "Sin mascota" }
            Write-Host "      • ID: $id | Estado: $estado | Mascota: $mascota | Fecha: $fecha" -ForegroundColor White
        }
    }
    Write-Host ""
} catch {
    Write-Host "   ❌ Error al listar citas: $_" -ForegroundColor Red
    exit
}

# 3. Probar GET de una cita específica
if ($citas.Count -gt 0) {
    $primeraId = $citas[0].id
    Write-Host "🔍 Paso 3: Obtener cita específica (ID: $primeraId)" -ForegroundColor Green
    try {
        $citaResponse = Invoke-RestMethod -Uri "$STRAPI_URL/api/citas/${primeraId}?populate=*" -Headers $authHeaders
        Write-Host "   ✅ Cita ID $primeraId obtenida correctamente" -ForegroundColor Green
        $estadoActual = $citaResponse.data.attributes.estado
        Write-Host "   📌 Estado actual: $estadoActual" -ForegroundColor Cyan
        Write-Host ""
        
        # 4. Probar verificación de cita inexistente
        $idInexistente = 99999
        Write-Host "🔍 Paso 4: Verificar detección de cita inexistente (ID: $idInexistente)" -ForegroundColor Green
        try {
            $citaInexistente = Invoke-RestMethod -Uri "$STRAPI_URL/api/citas/${idInexistente}?populate=*" -Headers $authHeaders
            Write-Host "   ⚠️  La cita $idInexistente existe (inesperado)" -ForegroundColor Yellow
        } catch {
            Write-Host "   ✅ Correctamente detectado que ID $idInexistente no existe (404)" -ForegroundColor Green
        }
        Write-Host ""
        
        # 5. Probar actualización (opcional)
        $respuesta = Read-Host "¿Quieres probar actualizar el estado de la cita ID $primeraId? (s/n)"
        if ($respuesta -eq "s") {
            Write-Host ""
            Write-Host "🔄 Paso 5: Actualizar estado de cita" -ForegroundColor Green
            $nuevoEstado = Read-Host "Nuevo estado (pendiente/confirmada/cancelada/completada)"
            
            try {
                $updateBody = @{
                    data = @{
                        estado = $nuevoEstado
                    }
                } | ConvertTo-Json
                
                $updateResponse = Invoke-RestMethod -Uri "$STRAPI_URL/api/citas/${primeraId}" -Method PUT -Headers $authHeaders -Body $updateBody
                Write-Host "   ✅ Cita actualizada correctamente" -ForegroundColor Green
                Write-Host "   📌 Nuevo estado: $($updateResponse.data.attributes.estado)" -ForegroundColor Cyan
            } catch {
                Write-Host "   ❌ Error al actualizar: $_" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "   ❌ Error al obtener cita: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Pruebas completadas" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Siguientes pasos:" -ForegroundColor Yellow
Write-Host "   1. Verifica que los IDs en el dashboard coinciden con los mostrados aquí" -ForegroundColor White
Write-Host "   2. Prueba cancelar/confirmar citas desde el dashboard" -ForegroundColor White
Write-Host "   3. Verifica que no hay errores 404" -ForegroundColor White
Write-Host "   4. Elimina una cita desde Strapi admin y verifica que desaparece del dashboard" -ForegroundColor White
Write-Host ""
