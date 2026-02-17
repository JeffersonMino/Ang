using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Dtos;
using ExpenseTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ExpenseTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ExpensesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int? month, [FromQuery] int? year)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var q = _db.Expenses.Include(e => e.Category).Where(e => e.UserId == userId);

            if (month.HasValue && year.HasValue)
                q = q.Where(e => e.CreatedAt.Month == month.Value && e.CreatedAt.Year == year.Value);

            var list = await q.OrderByDescending(e => e.CreatedAt).ToListAsync();
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ExpenseCreateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var expense = new Expense
            {
                UserId = userId,
                CategoryId = dto.CategoryId,
                Amount = dto.Amount,
                Description = dto.Description,
                CreatedAt = dto.CreatedAt ?? DateTime.UtcNow
            };

            _db.Expenses.Add(expense);
            await _db.SaveChangesAsync();

            return Ok(expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var expense = await _db.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            if (expense.UserId != userId && !User.IsInRole("Admin")) return Forbid();

            _db.Expenses.Remove(expense);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
