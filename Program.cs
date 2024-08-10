using budgetbud.Services;
using budgetbud.Middlewares;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

bool use_swagger = builder.Configuration.GetValue<bool>("EnableSwagger");
if (use_swagger)
{
    builder.Services.AddSwaggerGen();
}

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSingleton<IIdentityService, FakeIdentityService>();
}
else
{
    builder.Services.AddSingleton<IIdentityService, AzureIdentityService>();
}

builder.Services.AddSingleton<DbService>();
builder.Services.AddSingleton<UserDataService>();

var app = builder.Build();
if (!app.Environment.IsDevelopment())
{
    app.UseMiddleware<RedirectToLoginMiddleware>();
}

app.UseDefaultFiles();
app.UseStaticFiles();

if (use_swagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
