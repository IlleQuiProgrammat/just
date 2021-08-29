using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace SnSApi
{
    public static class ConfigureExtensions
    {
        public static void CorsConfiguration(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
            });
        }

        public static void ConfigureIdentity(this IServiceCollection services)
        {
            services.Configure<IdentityOptions>(options =>
            {
                // Password settings.
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 16;
                options.Password.RequiredUniqueChars = 1;

                // TODO: When released
                // options.Stores.ProtectPersonalData = true;
                // options.Tokens
                // options.SignIn.RequireConfirmed*

                // Lockout settings.
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings.
                options.User.AllowedUserNameCharacters =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@";
                options.User.RequireUniqueEmail = true;
            });
        }

        public static void ConfigureCookie(this IServiceCollection services)
        {
            services.ConfigureApplicationCookie(options =>
            {
                // Cookie settings
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.None;
                options.ExpireTimeSpan = TimeSpan.FromDays(1);

                // TODO: Update when possible
                options.LoginPath = "/login-redirect";
                options.AccessDeniedPath = "/403-redirect";
                options.SlidingExpiration = true;
            });
        }

        public static void ConfigureCors(this IServiceCollection services, IConfiguration Configuration)
        {
            services.AddCors(options =>
                options.AddPolicy("FrontendPolicy",
                    builder =>
                    {
                        builder.WithOrigins(Configuration["FrontendUrl"])
                            .AllowCredentials()
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    })
            );
        }

        public static void ConfigureAutoMapper(this IServiceCollection services)
        {
            services.AddAutoMapper(typeof(Startup));
        }
    }
}