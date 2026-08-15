using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShiftFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTable_Shift2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<TimeOnly>(
                name: "StartTime",
                table: "Shifts",
                type: "time",
                nullable: true,
                oldClrType: typeof(TimeOnly),
                oldType: "time");

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "EndTime",
                table: "Shifts",
                type: "time",
                nullable: true,
                oldClrType: typeof(TimeOnly),
                oldType: "time");

            migrationBuilder.AddColumn<string>(
                name: "ColorCode",
                table: "Shifts",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.InsertData(
                table: "LogDefinitions",
                columns: new[] { "Id", "Description", "IsActive" },
                values: new object[] { 13, "Toplu vardiya ataması gerçekleştirildi", true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "LogDefinitions",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DropColumn(
                name: "ColorCode",
                table: "Shifts");

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "StartTime",
                table: "Shifts",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0),
                oldClrType: typeof(TimeOnly),
                oldType: "time",
                oldNullable: true);

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "EndTime",
                table: "Shifts",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0),
                oldClrType: typeof(TimeOnly),
                oldType: "time",
                oldNullable: true);
        }
    }
}
