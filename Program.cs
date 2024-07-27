using budgetbud.Services;

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

app.UseDefaultFiles();
app.UseStaticFiles();

if (use_swagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/hello-world", () => "Hello World!");
app.MapControllers();

app.Run();
