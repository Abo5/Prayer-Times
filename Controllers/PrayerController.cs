using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Fajr.Models;
using Fajr.Services;

namespace Fajr.Controllers;

[Route("[controller]/[action]")]
public class PrayerController : Controller
{
    private readonly PrayerTimesService _svc;
    private readonly IHttpClientFactory _http;
    private readonly ILogger<PrayerController> _log;

    public PrayerController(
        PrayerTimesService svc,
        IHttpClientFactory http,
        ILogger<PrayerController> log)
    {
        _svc  = svc;
        _http = http;
        _log  = log;
    }

    // GET /
    [HttpGet("/")]
    public IActionResult Index() => View();

    // GET /Prayer/Times?lat=..&lon=..
    [HttpGet]
    public async Task<IActionResult> Times(double lat, double lon)
    {
        var timings = await _svc.GetTimesAsync(lat, lon);

        string city = "Unknown";
        try
        {
            var client = _http.CreateClient();
            var revUrl = $"https://api.bigdatacloud.net/data/reverse-geocode-client" +
                         $"?latitude={lat}&longitude={lon}&localityLanguage=en";

            JsonElement geo = await client.GetFromJsonAsync<JsonElement>(revUrl);

            if (geo.TryGetProperty("city", out var c) && !string.IsNullOrWhiteSpace(c.GetString()))
                city = c.GetString()!;
            else if (geo.TryGetProperty("locality", out var l) && !string.IsNullOrWhiteSpace(l.GetString()))
                city = l.GetString()!;
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Reverse-geocode failed, falling back to 'Unknown'");
        }

        return Json(new PrayerTimesDto { City = city, Timings = timings });
    }
}
