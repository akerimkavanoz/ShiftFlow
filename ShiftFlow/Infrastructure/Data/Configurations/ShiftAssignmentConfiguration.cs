using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Infrastructure.Data.Configurations;

public class ShiftAssignmentConfiguration : IEntityTypeConfiguration<ShiftAssignment>
{
    public void Configure(EntityTypeBuilder<ShiftAssignment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.EmployeeId)
            .IsRequired();

        builder.Property(x => x.ShiftId)
            .IsRequired();

        builder.Property(x => x.Date)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasIndex(x => new { x.EmployeeId, x.Date }) // Bir personelin aynı gün için aktif birden fazla atama yapmasını engellemek için benzersiz bir indeks oluşturuyoruz
               .HasFilter("IsActive = 1")
               .IsUnique();

        builder.HasOne(a => a.Employee)
            .WithMany()
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict); // Silme kuralı: Personel silinirse atamalar kalsın ama hata almamak için kısıtla

        builder.HasOne(a => a.Shift)
            .WithMany()
            .HasForeignKey(a => a.ShiftId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}