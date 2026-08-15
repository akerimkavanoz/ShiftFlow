using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ShiftFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTables_LogDefinition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "LogDefinitions",
                columns: new[] { "Id", "Description", "IsActive" },
                values: new object[,]
                {
                    { 1, "Departman oluşturuldu", true },
                    { 2, "Departman güncellendi", true },
                    { 3, "Departman silindi", true },
                    { 4, "Personel oluşturuldu", true },
                    { 5, "Personel güncellendi", true },
                    { 6, "Personel silindi", true },
                    { 7, "Vardiya oluşturuldu", true },
                    { 8, "Vardiya güncellendi", true },
                    { 9, "Vardiya silindi", true },
                    { 10, "Vardiya ataması gerçekleştirildi", true },
                    { 11, "Vardiya ataması güncelleştirildi", true },
                    { 12, "Vardiya ataması silindi", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 12);
        }
    }
}
