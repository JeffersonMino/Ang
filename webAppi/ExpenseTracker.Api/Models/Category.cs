namespace ExpenseTracker.Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Icon { get; set; }
        public ICollection<Expense>? Expenses { get; set; }
    }
}
