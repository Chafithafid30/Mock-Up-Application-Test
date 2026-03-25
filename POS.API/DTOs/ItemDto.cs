using System.ComponentModel.DataAnnotations;

namespace POS.API.DTOs;

public class ItemDto
{
    [Required(ErrorMessage = "Nama barang wajib diisi")]
    public string Name { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Harga harus lebih dari 0")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stok tidak boleh negatif")]
    public int Stock { get; set; }

    [Required(ErrorMessage = "Kategori wajib diisi")]
    public string Category { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }
}