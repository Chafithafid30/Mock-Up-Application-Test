using System.ComponentModel.DataAnnotations;

namespace POS.API.DTOs;

public class TransactionDto
{
    [Range(1, int.MaxValue, ErrorMessage = "ItemId harus lebih dari 0.")]
    public int ItemId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Jumlah item harus lebih dari 0.")]
    public int Quantity { get; set; }
}