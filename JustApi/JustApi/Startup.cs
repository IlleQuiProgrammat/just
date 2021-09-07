using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using JustApi.Models;

namespace JustApi
{
    public class Startup
    {
        private readonly string[] _roles = new[] {"student", "school_admin", "admin"};
        
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ProjectContext>(
                options => options.UseNpgsql(Configuration["PgSqlConnectionString"]));

            services.AddIdentity<User, Role>()
                .AddEntityFrameworkStores<ProjectContext>();
            
            services.ConfigureIdentity();
            
            services.ConfigureCookie();

            services.ConfigureCors(Configuration);
            
            services.ConfigureAutoMapper();
            
            services.AddControllers();
            
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo {Title = "JustApi", Version = "v1"});
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IServiceProvider serviceProvider)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "JustApi v1"));
            }
            else
            {
                app.UseExceptionHandler("/error");
                if (Configuration["Https"] == "true")
                {
                    app.UseHsts();
                    if (Configuration["HttpsRedirection"] == "true") app.UseHttpsRedirection();
                }
            }

            app.UseRouting();

            app.UseCors("FrontendPolicy");

            app.UseAuthentication();
            
            app.UseAuthorization();

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
            
            var roleManager = serviceProvider.GetService<RoleManager<Role>>();
            var userManager = serviceProvider.GetService<UserManager<User>>();
            var context = serviceProvider.GetService<ProjectContext>();
            
            if (roleManager is null || userManager is null || context is null)
            {
                throw new Exception("UserManager, RoleManager or ProjectContext is null.");
            }
            
            foreach (var role in _roles)
            {
                if (!(roleManager.RoleExistsAsync(role).Result)) roleManager.CreateAsync(new Role(role)).Wait();
            }
            
            if (userManager.GetUsersInRoleAsync("admin").Result.Count == 0)
            {
                Console.WriteLine("Creating admin school.");
                var school = new School
                {
                    Name = "Admin School",
                    EmailDomain = Configuration["AdminSchoolDomain"],
                    Secret = Configuration["AdminSchoolSecret"],
                    CreationDateTime = DateTime.Now,
                    StudentLimit = 1,
                };
                context.Schools.Add(school);
                context.SaveChangesAsync().Wait();
                Console.WriteLine("Created admin school.");
            }
        }
    }
}