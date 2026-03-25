using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POS.API.Data;
using POS.API.DTOs;
using POS.API.Models;

namespace POS.API.Controllers;

[ApiController]
[Route("api/pos")]
[Authorize]
public class POSController : ControllerBase
{
    private readonly AppDbContext _db;

    public POSController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("transactions")]
    public async Task<IActionResult> CreateTransaction([FromBody] TransactionDto dto)
    {
        if (dto.ItemId <= 0)
            return BadRequest(new { message = "Item tidak valid." });

        if (dto.Quantity <= 0)
            return BadRequest(new { message = "Jumlah harus lebih dari 0." });

        var item = await _db.Items.FindAsync(dto.ItemId);
        if (item == null)
            return NotFound(new { message = "Item tidak ditemukan." });

        if (item.Stock < dto.Quantity)
            return BadRequest(new { message = $"Stok tidak mencukupi. Stok tersedia: {item.Stock}" });

        var transaction = new Transaction
        {
            ItemId = item.Id,
            Quantity = dto.Quantity,
            PricePerItem = item.Price,
            TotalPrice = item.Price * dto.Quantity,
            TransactionDate = DateTime.Now
        };

        item.Stock -= dto.Quantity;

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            transaction.Id,
            transaction.TransactionDate,
            ItemName = item.Name,
            Category = item.Category,
            transaction.Quantity,
            transaction.PricePerItem,
            transaction.TotalPrice,
            RemainingStock = item.Stock
        });
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions()
    {
        var data = await _db.Transactions
            .Include(t => t.Item)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var data = await _db.Transactions
            .Include(t => t.Item)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new
            {
                t.Id,
                t.TransactionDate,
                ItemName = t.Item != null ? t.Item.Name : "",
                Category = t.Item != null ? t.Item.Category : "",
                t.Quantity,
                t.PricePerItem,
                t.TotalPrice
            })
            .ToListAsync();

        return Ok(new
        {
            totalTransaksi = data.Count,
            totalPendapatan = data.Sum(x => x.TotalPrice),
            data
        });
    }
}