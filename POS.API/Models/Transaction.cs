namespace POS.API.Models;

public class Transaction
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public Item Item { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal PricePerItem { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime TransactionDate { get; set; }
}
