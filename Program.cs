using Fajr.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();                 // لخدمة AlAdhan و ReverseGeocode
builder.Services.AddScoped<PrayerTimesService>(); // حقن الخدمة

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Prayer}/{action=Index}/{id?}");

app.Run();
