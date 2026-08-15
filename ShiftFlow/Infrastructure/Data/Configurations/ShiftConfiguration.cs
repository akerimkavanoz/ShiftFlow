using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Infrastructure.Data.Configurations;

public class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(s => s.Name)
           .HasFilter("IsActive = 1") // Sadece aktif kayıtlar içinde aynı vardiyayı tekrar eklemeyi engellemek için filtre ekleniyor
           .IsUnique();

        builder.Property(s => s.StartTime)
                .HasColumnType("time");

        builder.Property(s => s.EndTime)
            .HasColumnType("time");

        builder.Property(s => s.ColorCode)
            .HasMaxLength(10);
    }
}