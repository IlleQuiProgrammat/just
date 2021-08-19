using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SnSApi.Models;

namespace SnSApi
{
    public class ProjectContext : IdentityDbContext<User, Role, string>
    {
    
        public ProjectContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Question> Questions { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportMessage> ReportMessages { get; set; }
        public DbSet<School> Schools { get; set; }
    }
}