using Microsoft.EntityFrameworkCore.Migrations;

namespace JustApi.Migrations
{
    public partial class AddSchoolSecrets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Secret",
                table: "Schools",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Secret",
                table: "Schools");
        }
    }
}
