using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Infrastructure.Data.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(75);

        builder.HasIndex(d => d.Name)
            .HasFilter("IsActive = 1") // Sadece aktif kayıtlar içinde aynı departmanı tekrar eklemeyi engellemek için filtre ekleniyor
            .IsUnique();
    }
}