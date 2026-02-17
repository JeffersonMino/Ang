using Microsoft.AspNetCore.Identity;

namespace ExpenseTracker.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Propiedades personalizadas si las necesitas
        public string? FullName { get; set; }
    }
}