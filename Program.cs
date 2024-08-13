/* 
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2024  Sidhin S Thomas <sidhin.thomas@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * The source is available at: https://github.com/ParadoxZero/budgetbud
 */

using budgetbud.Services;
using budgetbud.Middlewares;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
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
