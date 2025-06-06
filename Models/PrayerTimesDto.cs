namespace Fajr.Models;

public class PrayerTimesDto
{
    public string City { get; set; } = "";
    public IDictionary<string, string> Timings { get; set; } = new Dictionary<string, string>();
}
