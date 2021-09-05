using Microsoft.EntityFrameworkCore.Migrations;

namespace JustApi.Migrations
{
    public partial class AddReadStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SchoolRead",
                table: "Reports",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentRead",
                table: "Reports",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SchoolRead",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "StudentRead",
                table: "Reports");
        }
    }
}
