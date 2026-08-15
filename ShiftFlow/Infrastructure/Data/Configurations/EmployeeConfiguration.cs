using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Infrastructure.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(e => e.Name)
        .IsRequired()
        .HasMaxLength(75);

        builder.Property(e => e.Surname)
            .IsRequired()
            .HasMaxLength(75);

        builder.HasOne(e => e.Department)
            .WithMany()
            .IsRequired()
            .HasForeignKey(e => e.DepartmentId);
    }
}