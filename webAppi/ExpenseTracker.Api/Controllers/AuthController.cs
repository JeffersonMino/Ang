using ExpenseTracker.Api.Dtos;
using ExpenseTracker.Api.Models;
using ExpenseTracker.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;

        public AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        // ===============================
        // REGISTER
        // POST: /api/auth/register
        // ===============================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Por defecto asignar rol User
            await _userManager.AddToRoleAsync(user, "User");

            return Ok(new { message = "Usuario registrado" });
        }

        // ===============================
        // LOGIN
        // POST: /api/auth/login
        // ===============================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
                return Unauthorized("Email incorrecto");

            var valid = await _userManager.CheckPasswordAsync(user, dto.Password);

            if (!valid)
                return Unauthorized("Contraseña incorrecta");

            var token = _tokenService.CreateToken(user);

            return Ok(new { token });
        }
    }
}
