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

namespace budgetbud.Services;

public class FakeIdentityService : IIdentityService
{
    private readonly IWebHostEnvironment _environment;

    public FakeIdentityService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public string GetAuthProvider()
    {
        return "fake";
    }

    public string GetUserIdentity()
    {
        if (_environment.IsProduction())
        {
            throw new Exception("FakeIdentityService should not be used in production");
        }
        return "fake_user:123";
    }

}
