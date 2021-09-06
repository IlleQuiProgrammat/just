using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using JustApi.Models;

namespace JustApi
{
    public class ProjectContext : IdentityDbContext<User, Role, string>
    {
    
        public ProjectContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Form> Forms { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportMessage> ReportMessages { get; set; }
        public DbSet<School> Schools { get; set; }
    }
}