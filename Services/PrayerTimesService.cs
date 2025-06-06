using System.Net.Http.Json;
using Microsoft.Extensions.Logging;

namespace Fajr.Services;

public record AlAdhanResponse(Data data);
public record Data(IDictionary<string, string> Timings);

public class PrayerTimesService
{
    private readonly HttpClient _http;
    private readonly ILogger<PrayerTimesService> _log;

    public PrayerTimesService(HttpClient http, ILogger<PrayerTimesService> log)
    {
        _http = http;
        _log  = log;
    }

    public async Task<IDictionary<string, string>> GetTimesAsync(
        double lat, double lon,
        int method = 4,
        string tz  = "Asia/Riyadh")
    {
        var date = DateTime.UtcNow.ToString("dd-MM-yyyy");
        var url  = $"https://api.aladhan.com/v1/timings/{date}" +
                   $"?latitude={lat}&longitude={lon}&method={method}&timezonestring={tz}";

        _log.LogInformation("Calling AlAdhan: {Url}", url);

        var resp = await _http.GetFromJsonAsync<AlAdhanResponse>(url);
        return resp?.data?.Timings ?? new Dictionary<string, string>();
    }
}
