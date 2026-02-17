using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace ExpenseTracker.Api.Seed
{
    public class DatabaseSeeder
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;

        public DatabaseSeeder(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
        }

        public async Task SeedAsync()
        {
            await SeedRolesAsync();
            await SeedAdminUserAsync();
            await SeedCategoriesAsync();
        }

        private async Task SeedRolesAsync()
        {
            string[] roles = { "Admin", "User" };

            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                    await _roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        private async Task SeedAdminUserAsync()
        {
            var adminEmail = "admin@admin.com";
            var adminPassword = "Admin123$";

            var existing = await _userManager.FindByEmailAsync(adminEmail);
            if (existing == null)
            {
                var user = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FullName = "Administrador"
                };

                var res = await _userManager.CreateAsync(user, adminPassword);
                if (!res.Succeeded)
                {
                    throw new Exception("No se pudo crear admin: " + string.Join(", ", res.Errors.Select(e => e.Description)));
                }
                await _userManager.AddToRoleAsync(user, "Admin");
            }
        }

        private async Task SeedCategoriesAsync()
        {
            if (!_db.Categories.Any())
            {
                var cats = new List<Category>
                {
                    new Category { Name = "Alimentos", Icon = "restaurant" },
                    new Category { Name = "Transporte", Icon = "bus" },
                    new Category { Name = "Hogar", Icon = "home" },
                    new Category { Name = "Ocio", Icon = "gamepad" },
                    new Category { Name = "Salud", Icon = "medkit" }
                };
                _db.Categories.AddRange(cats);
                await _db.SaveChangesAsync();
            }
        }
    }
}
