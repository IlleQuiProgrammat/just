using Microsoft.EntityFrameworkCore.Migrations;

namespace SnSApi.Migrations
{
    public partial class EncryptionFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicKey",
                table: "Schools",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IV",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentPrivateKey",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentPublicKey",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IV",
                table: "ReportMessages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IV",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrivateKey",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicKey",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SchoolPrivateKey",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicKey",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "IV",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "StudentPrivateKey",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "StudentPublicKey",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "IV",
                table: "ReportMessages");

            migrationBuilder.DropColumn(
                name: "IV",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PrivateKey",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PublicKey",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SchoolPrivateKey",
                table: "AspNetUsers");
        }
    }
}
