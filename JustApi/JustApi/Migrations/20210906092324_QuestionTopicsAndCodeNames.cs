using Microsoft.EntityFrameworkCore.Migrations;

namespace JustApi.Migrations
{
    public partial class FormTopicsAndCodeNames : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodeName",
                table: "Forms",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Retired",
                table: "Forms",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Topic",
                table: "Forms",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodeName",
                table: "Forms");

            migrationBuilder.DropColumn(
                name: "Retired",
                table: "Forms");

            migrationBuilder.DropColumn(
                name: "Topic",
                table: "Forms");
        }
    }
}
