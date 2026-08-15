using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShiftFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTable_Shifts_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Shifts_Name",
                table: "Shifts",
                column: "Name",
                unique: true,
                filter: "IsActive = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Shifts_Name",
                table: "Shifts");
        }
    }
}
