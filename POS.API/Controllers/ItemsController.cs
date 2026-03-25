using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POS.API.Data;
using POS.API.DTOs;
using POS.API.Models;

namespace POS.API.Controllers;

[ApiController]
[Route("api/items")]
[Authorize]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    private readonly string[] AllowedCategories = { "Makanan", "Minuman", "Lainnya" };
    private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxFileSize = 2 * 1024 * 1024; // 2 MB

    public ItemsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetItems()
    {
        var items = await _db.Items.OrderByDescending(x => x.Id).ToListAsync();
        return Ok(items);
    }

    [HttpGet("stock")]
    public async Task<IActionResult> GetStock()
    {
        var items = await _db.Items
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Price,
                x.Stock,
                x.Category,
                x.ImageUrl
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> CreateItem([FromForm] ItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var validationError = ValidateItem(dto);
        if (validationError != null)
            return validationError;

        string? imageUrl = null;
        if (dto.Image != null)
        {
            var imageValidation = ValidateImage(dto.Image);
            if (imageValidation != null)
                return imageValidation;

            imageUrl = await SaveImage(dto.Image);
        }

        var item = new Item
        {
            Name = dto.Name.Trim(),
            Price = dto.Price,
            Stock = dto.Stock,
            Category = dto.Category.Trim(),
            ImageUrl = imageUrl
        };

        _db.Items.Add(item);
        await _db.SaveChangesAsync();

        return Ok(item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, [FromForm] ItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var item = await _db.Items.FindAsync(id);
        if (item == null)
            return NotFound(new { message = "Item tidak ditemukan" });

        var validationError = ValidateItem(dto);
        if (validationError != null)
            return validationError;

        item.Name = dto.Name.Trim();
        item.Price = dto.Price;
        item.Stock = dto.Stock;
        item.Category = dto.Category.Trim();

        if (dto.Image != null)
        {
            var imageValidation = ValidateImage(dto.Image);
            if (imageValidation != null)
                return imageValidation;

            item.ImageUrl = await SaveImage(dto.Image);
        }

        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null)
            return NotFound(new { message = "Item tidak ditemukan" });

        _db.Items.Remove(item);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Item berhasil dihapus" });
    }

    private IActionResult? ValidateItem(ItemDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Nama barang wajib diisi" });

        if (dto.Price <= 0)
            return BadRequest(new { message = "Harga harus lebih dari 0" });

        if (dto.Stock < 0)
            return BadRequest(new { message = "Stok tidak boleh negatif" });

        if (string.IsNullOrWhiteSpace(dto.Category))
            return BadRequest(new { message = "Kategori wajib diisi" });

        if (!AllowedCategories.Contains(dto.Category.Trim()))
            return BadRequest(new { message = "Kategori hanya boleh: Makanan, Minuman, atau Lainnya" });

        return null;
    }

    private IActionResult? ValidateImage(IFormFile image)
    {
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
            return BadRequest(new { message = "Format gambar harus jpg, jpeg, png, atau webp" });

        if (!image.ContentType.StartsWith("image/"))
            return BadRequest(new { message = "File harus berupa gambar" });

        if (image.Length > MaxFileSize)
            return BadRequest(new { message = "Ukuran gambar maksimal 2 MB" });

        return null;
    }

    private async Task<string> SaveImage(IFormFile image)
    {
        var folder = Path.Combine(_env.WebRootPath, "uploads");
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName).ToLowerInvariant()}";
        var filePath = Path.Combine(folder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await image.CopyToAsync(stream);

        return $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
    }
}