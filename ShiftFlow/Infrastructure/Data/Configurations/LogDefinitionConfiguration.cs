using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Infrastructure.Data.Configurations;

public class LogDefinitionConfiguration : IEntityTypeConfiguration<LogDefinition>
{
    public void Configure(EntityTypeBuilder<LogDefinition> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(l => l.Description)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasData(
            new LogDefinition { Id = 1, Description = "Departman oluşturuldu", IsActive = true },
            new LogDefinition { Id = 2, Description = "Departman güncellendi", IsActive = true },
            new LogDefinition { Id = 3, Description = "Departman silindi", IsActive = true },
            new LogDefinition { Id = 4, Description = "Personel oluşturuldu", IsActive = true },
            new LogDefinition { Id = 5, Description = "Personel güncellendi", IsActive = true },
            new LogDefinition { Id = 6, Description = "Personel silindi", IsActive = true },
            new LogDefinition { Id = 7, Description = "Vardiya oluşturuldu", IsActive = true },
            new LogDefinition { Id = 8, Description = "Vardiya güncellendi", IsActive = true },
            new LogDefinition { Id = 9, Description = "Vardiya silindi", IsActive = true },
            new LogDefinition { Id = 10, Description = "Vardiya ataması gerçekleştirildi", IsActive = true },
            new LogDefinition { Id = 11, Description = "Vardiya ataması güncelleştirildi", IsActive = true },
            new LogDefinition { Id = 12, Description = "Vardiya ataması silindi", IsActive = true },
            new LogDefinition { Id = 13, Description = "Toplu vardiya ataması gerçekleştirildi", IsActive = true }
        );
    }
}