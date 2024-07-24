using budgetbud.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddScoped<IIdentityService, FakeIdentityService>();
}
else
{
    builder.Services.AddScoped<IIdentityService, AzureIdentityService>();
}


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
