using Microsoft.EntityFrameworkCore.Migrations;

namespace JustApi.Migrations
{
    public partial class QuestionTopicsAndCodeNames : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodeName",
                table: "Questions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Retired",
                table: "Questions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Topic",
                table: "Questions",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodeName",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Retired",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Topic",
                table: "Questions");
        }
    }
}
