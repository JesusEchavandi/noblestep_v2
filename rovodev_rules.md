Este documento define las reglas estrictas que debes seguir para implementar todas las correcciones y mejoras descritas en CORREGIR.txt.



Debes cumplir estas reglas sin excepción.



No puedes saltarte fases.

No puedes ejecutar múltiples fases al mismo tiempo.

No puedes continuar a la siguiente fase sin haber finalizado completamente la actual.

No puedes romper, eliminar ni alterar la funcionalidad existente.

No puedes cambiar contratos públicos de la API sin mantener compatibilidad hacia atrás.

No puedes modificar comportamiento funcional salvo que exista un riesgo crítico de seguridad, en cuyo caso debes reemplazarlo por una versión segura equivalente.

No debes sobreingenierizar ni reestructurar innecesariamente el proyecto.

Cada fase debe cerrarse con un informe técnico claro antes de avanzar.



Si una fase no está completamente terminada, debes continuarla hasta finalizarla antes de iniciar la siguiente.



────────────────────────────────────────



ORDEN ESTRICTO DE FASES



Debes seguir este orden exacto:



FASE 1 – SEGURIDAD CRÍTICA Y SECRETOS

FASE 2 – ESTABILIDAD Y PERFORMANCE

FASE 3 – ENDURECIMIENTO DE SEGURIDAD AVANZADA

FASE 4 – OBSERVABILIDAD Y PRODUCCIÓN

FASE 5 – MEJORAS RECOMENDADAS NO BLOQUEANTES



No puedes alterar el orden.



────────────────────────────────────────



FASE 1 – SEGURIDAD CRÍTICA Y SECRETOS



Objetivo: eliminar riesgos críticos inmediatos sin alterar el comportamiento funcional.



Implementar obligatoriamente:



Mover JWT SecretKey, tokens externos y cadenas de conexión a variables de entorno.



Eliminar valores sensibles reales de appsettings.json.



Implementar lectura segura con Environment.GetEnvironmentVariable con fallback solo en Development.



Rotar lógica interna de secretos sin cambiar estructura de JWT actual.



Configurar contraseña segura para base de datos en producción.



Restringir CORS a lista blanca explícita de dominios reales.



Forzar HTTPS y habilitar HSTS en producción.



Hashear PasswordResetToken antes de guardarlo.



Eliminar datos de prueba de producción mediante script seguro.



Al finalizar esta fase debes entregar:



Cambios realizados



Archivos modificados



Riesgos mitigados



Confirmación explícita de que la funcionalidad no fue afectada



No avanzar a FASE 2 sin cerrar completamente esta fase.



────────────────────────────────────────



FASE 2 – ESTABILIDAD Y PERFORMANCE



Objetivo: evitar caídas bajo carga y consumo excesivo de memoria.



Implementar obligatoriamente:



Paginación obligatoria en Products, Sales, Customers y Orders.



Valores por defecto seguros si no se envían page y pageSize.



Límite máximo de pageSize.



Compresión GZIP/Brotli.



Reemplazar fetch nativo por HttpClient en NotificationService.



Implementar backoff progresivo en notificaciones.



Agregar rate limiting al endpoint de registro.



Debes mantener compatibilidad total con frontend actual.



Al finalizar entregar:



Cambios realizados



Archivos modificados



Riesgos mitigados



Confirmación de integridad funcional



No avanzar a FASE 3 sin cerrar completamente esta fase.



────────────────────────────────────────



FASE 3 – ENDURECIMIENTO DE SEGURIDAD AVANZADA



Objetivo: elevar el sistema a estándar de producción empresarial.



Implementar obligatoriamente:



Refresh Token con rotación segura.



Cabeceras de seguridad: X-Content-Type-Options, X-Frame-Options, CSP.



Configuración SameSite y Secure en cookies si aplica.



Validación explícita de ModelState.



Normalización de Status usando enums o constantes.



Soft delete en entidades críticas sin romper consultas actuales.



No debes romper autenticación existente.



Al finalizar entregar reporte técnico completo.



No avanzar a FASE 4 sin cerrar completamente esta fase.



────────────────────────────────────────



FASE 4 – OBSERVABILIDAD Y PRODUCCIÓN



Objetivo: preparar entorno real de VPS.



Implementar:



Integración de Serilog con persistencia a archivo.



Logs estructurados.



Endpoint de health check protegido.



Auditoría básica (CreatedAt, ModifiedAt, CreatedBy).



Separación total de configuraciones Development y Production.



Configuración lista para VPS con documentación de variables de entorno.



No modificar lógica de negocio.



Entregar informe técnico de cierre.



No avanzar a FASE 5 sin cerrar completamente esta fase.



────────────────────────────────────────



FASE 5 – MEJORAS RECOMENDADAS NO BLOQUEANTES



Implementar de forma controlada:



Reemplazo progresivo de imágenes externas hardcodeadas.



Base estructural para WebSockets o SSE.



Base para unit tests sin refactorización masiva.



Preparación para caché en catálogo público.



No realizar cambios disruptivos.



────────────────────────────────────────



REGLAS DE CONTROL DE FASE



Antes de iniciar una nueva fase debes confirmar explícitamente:



FASE X COMPLETADA

FUNCIONALIDAD VERIFICADA

SIN REGRESIONES DETECTADAS



Si no puedes garantizar lo anterior, debes continuar trabajando en la fase actual.



No está permitido avanzar parcialmente.



────────────────────────────────────────



FIN DE REGLAS OBLIGATORIAS

