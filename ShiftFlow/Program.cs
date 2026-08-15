using QuestPDF.Infrastructure;
using ShiftFlow.API.ExceptionHandlers;
using ShiftFlow.API.Extensions;
using ShiftFlow.API.Filters;
using ShiftFlow.Application.Extensions;
using ShiftFlow.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

// QuestPDF Ücretsiz Topluluk Lisansı Aktivasyonu
QuestPDF.Settings.License = LicenseType.Community;

// Katman bazlı servis kayıtları
builder.Services.AddApplicationServices();      // Servisler burada
builder.Services.AddInfrastructureServices(builder.Configuration); // Repolar burada

// Add services to the container.

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
}) 
.AddJsonOptions(options =>
{
    // 1. Yazdığımız akıllı TimeOnly dönüştürücüsünü ekliyoruz
    options.JsonSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());

    // 2. Küçük/Büyük harf duyarlılığını kaldırıyoruz (camelCase <-> PascalCase uyumu için)
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Global Exception Handler ve ProblemDetails servis kaydı
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler(_ => { });

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        // Swagger'ın ana sayfada (/) değil, sadece "/swagger" adresinde açılmasını sağlar
        options.RoutePrefix = "swagger";
    });
}

//app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

// React'in derlendiği 'wwwroot/app' klasörünü statik dosya olarak ekliyoruz
// Böylece /assets/index-xxx.js gibi istekler doğruca wwwroot/app/assets altından okunur.
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "app")),
    RequestPath = ""
});

app.UseRouting();
app.UseCors("AllowAll");
//app.UseAuthorization();

app.MapControllers();

// Eğer gelen istek bir API isteği değilse (yani /api/... ile başlamıyorsa), 
// topu React'e (index.html) atar. SPA yönlendirmesi için bu şarttır.
app.MapFallbackToFile("app/index.html");

app.Run();
//app.Run("http://127.0.0.1:8080");
