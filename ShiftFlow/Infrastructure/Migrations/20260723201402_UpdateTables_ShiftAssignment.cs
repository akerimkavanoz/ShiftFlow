using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShiftFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTables_ShiftAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShiftAssignments_EmployeeId",
                table: "ShiftAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignments_EmployeeId_Date",
                table: "ShiftAssignments",
                columns: new[] { "EmployeeId", "Date" },
                unique: true,
                filter: "IsActive = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShiftAssignments_EmployeeId_Date",
                table: "ShiftAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignments_EmployeeId",
                table: "ShiftAssignments",
                column: "EmployeeId");
        }
    }
}
