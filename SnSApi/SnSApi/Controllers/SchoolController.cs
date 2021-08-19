using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SnSApi.Models;
using SnSApi.Models.Dto;

namespace SnSApi.Controllers
{
    [ApiController]
    [Route("/schools/")]
    [Authorize]
    public class SchoolController : ControllerBase
    {
        private readonly ProjectContext _context;
        private readonly UserManager<User> _userManager;

        public SchoolController(ProjectContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetSchoolSettings()
        {
            var currentUser = await _userManager.GetUserAsync(HttpContext.User);
            return Ok(
                await _context.Schools.AsNoTracking()
                    .Where(school => school.SchoolId == currentUser.SchoolId)
                    .Select(school => new SchoolSettingsDto
                        {SchoolId = school.SchoolId, Name = school.Name, EmailDomain = school.EmailDomain})
                    .SingleOrDefaultAsync()
            );
        }

        [HttpGet("users")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> GetSchoolUsers()
        {
            var currentUser = await _userManager.GetUserAsync(HttpContext.User);
            return Ok(
                await _context.Users.AsNoTracking()
                    .Where(user => user.SchoolId == currentUser.SchoolId)
                    .Select(user => new ShortUserDto {Id = user.Id, Email = user.Email, Role = user.Role})
                    .ToListAsync()
                );
        }

        [HttpPut("promote/{id}")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> PromoteUser(string id)
        {
            var currentUser = await _userManager.GetUserAsync(HttpContext.User);
            if (currentUser.Id == id) return BadRequest();
            var userToPromote = await _context.Users.FindAsync(id);
            
            if (await _userManager.IsInRoleAsync(userToPromote, "student"))
            {
                Console.WriteLine($"Adding user to admin role {id}");
                await _userManager.RemoveFromRoleAsync(userToPromote, "student");
                await _userManager.AddToRoleAsync(userToPromote, "school_admin");
                userToPromote.Role = DenormalisedRole.SchoolAdmin;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }
        
        [HttpPut("demote/{id}")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> DemoteUser(string id)
        {
            var currentUser = await _userManager.GetUserAsync(HttpContext.User);
            if (currentUser.Id == id) return BadRequest();
            var userToDemote = await _context.Users.FindAsync(id);
            
            if (await _userManager.IsInRoleAsync(userToDemote, "school_admin"))
            {
                Console.WriteLine($"Removing user from admin role {id}");
                await _userManager.RemoveFromRoleAsync(userToDemote, "school_admin");
                await _userManager.AddToRoleAsync(userToDemote, "student");
                userToDemote.Role = DenormalisedRole.Student;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }
    }
}