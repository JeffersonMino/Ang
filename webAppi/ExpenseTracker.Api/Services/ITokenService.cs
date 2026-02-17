using ExpenseTracker.Api.Models;

namespace ExpenseTracker.Api.Services
{
    public interface ITokenService
    {
        string CreateToken(ApplicationUser user);
    }
}
