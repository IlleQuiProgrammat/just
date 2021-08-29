using Microsoft.EntityFrameworkCore.Migrations;

namespace SnSApi.Migrations
{
    public partial class AddSchoolInitVec : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SchoolPrivateKeyIV",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SchoolPrivateKeyIV",
                table: "AspNetUsers");
        }
    }
}
