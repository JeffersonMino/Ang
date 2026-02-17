namespace ExpenseTracker.Api.Models
{
    public class Expense
    {
        public int Id { get; set; }

        public string UserId { get; set; } = null!;
        public ApplicationUser? User { get; set; }

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
