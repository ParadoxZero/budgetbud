using budgetbud.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen();
    builder.Services.AddSingleton<IIdentityService, FakeIdentityService>();
}
else
{
    builder.Services.AddSingleton<IIdentityService, AzureIdentityService>();
}

builder.Services.AddSingleton<DbService>();
builder.Services.AddSingleton<UserDataService>();


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/hello-world", () => "Hello World!");
app.MapControllers();

app.Run();
