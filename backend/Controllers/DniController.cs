using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator,Seller")]
public class DniController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public DniController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    /// <summary>
    /// Consulta datos de una persona por DNI — usa api.json.pe (POST)
    /// </summary>
    [HttpGet("{dni}")]
    public async Task<IActionResult> ConsultarDni(string dni)
    {
        if (string.IsNullOrWhiteSpace(dni) || dni.Length != 8 || !dni.All(char.IsDigit))
            return BadRequest(new { message = "DNI inválido. Debe tener exactamente 8 dígitos." });

        var token = _configuration["ApiConsulta:Token"] ?? "";

        try
        {
            // Crear cliente HTTP limpio sin BaseAddress para evitar conflictos
            var http = _httpClientFactory.CreateClient();
            http.DefaultRequestHeaders.Clear();
            http.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            http.DefaultRequestHeaders.Add("Accept", "application/json");

            // api.json.pe usa POST con body JSON
            var body = System.Text.Json.JsonSerializer.Serialize(new { dni });
            var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");
            var response = await http.PostAsync("https://api.json.pe/api/dni", content);

            if (response.IsSuccessStatusCode)
            {
                var raw = await response.Content.ReadAsStringAsync();
                var normalized = NormalizeDniResponse(raw, dni);
                return Content(normalized, "application/json");
            }

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return NotFound(new { message = "DNI no encontrado en RENIEC." });

            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return StatusCode(503, new { message = "Token de API inválido o expirado." });

            var errorBody = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, new { message = "Error consultando DNI.", detail = errorBody });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(503, new { message = "Servicio de consulta DNI no disponible.", detail = ex.Message });
        }
        catch (TaskCanceledException)
        {
            return StatusCode(504, new { message = "Tiempo de espera agotado consultando DNI." });
        }
    }

    private string NormalizeDniResponse(string raw, string dniInput)
    {
        try
        {
            var doc = System.Text.Json.JsonDocument.Parse(raw);
            var root = doc.RootElement;

            // api.json.pe devuelve { success, message, data: { ... } }
            var data = root.TryGetProperty("data", out var d) ? d : root;

            string Get(System.Text.Json.JsonElement el, params string[] keys)
            {
                foreach (var k in keys)
                    if (el.TryGetProperty(k, out var v) && v.ValueKind == System.Text.Json.JsonValueKind.String)
                        return v.GetString() ?? "";
                return "";
            }

            var nombres    = Get(data, "nombres", "nombre", "name");
            var apPat      = Get(data, "apellido_paterno", "apellidoPaterno", "apPaterno");
            var apMat      = Get(data, "apellido_materno", "apellidoMaterno", "apMaterno");
            var fullName   = Get(data, "nombre_completo", "nombreCompleto", "nombre_completo");
            if (string.IsNullOrWhiteSpace(fullName))
                fullName = $"{nombres} {apPat} {apMat}".Trim();
            var dniNum     = Get(data, "numero", "dni", "DNI") is { Length: > 0 } dn ? dn : dniInput;

            return System.Text.Json.JsonSerializer.Serialize(new
            {
                nombres,
                apellidoPaterno = apPat,
                apellidoMaterno = apMat,
                nombreCompleto  = fullName,
                dni             = dniNum
            });
        }
        catch
        {
            return raw;
        }
    }

    /// <summary>
    /// Consulta datos de empresa por RUC usando api-consulta.pe
    /// </summary>
    [HttpGet("ruc/{ruc}")]
    public async Task<IActionResult> ConsultarRuc(string ruc)
    {
        if (string.IsNullOrWhiteSpace(ruc) || ruc.Length != 11 || !ruc.All(char.IsDigit))
            return BadRequest(new { message = "RUC inválido. Debe tener exactamente 11 dígitos." });

        try
        {
            var token = _configuration["ApiConsulta:Token"] ?? "";
            var http = _httpClientFactory.CreateClient();
            http.DefaultRequestHeaders.Clear();
            http.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            http.DefaultRequestHeaders.Add("Accept", "application/json");

            var response = await http.PostAsync("https://api.json.pe/api/ruc",
                new StringContent(System.Text.Json.JsonSerializer.Serialize(new { ruc }),
                System.Text.Encoding.UTF8, "application/json"));

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return Content(content, "application/json");
            }

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return NotFound(new { message = "RUC no encontrado en SUNAT." });

            return StatusCode((int)response.StatusCode, new { message = "Error consultando RUC." });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(503, new { message = "Servicio de consulta RUC no disponible.", detail = ex.Message });
        }
    }
}
