using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustApi.Models;
using JustApi.Models.Dto;

namespace JustApi.Controllers
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
                    {
                        SchoolId = school.SchoolId,
                        Name = school.Name,
                        EmailDomain = school.EmailDomain,
                    })
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
                    .Select(user => new ShortUserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Role = user.Role,
                        PublicKey = user.PublicKey
                    })
                    .ToListAsync()
                );
        }
        
        [HttpPut("demote/{id}")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> DemoteUser(string id)
        {
            var currentUser = await _userManager.GetUserAsync(HttpContext.User);
            if (currentUser.Id == id) return BadRequest();
            var userToDemote = await _context.Users.FindAsync(id);
            if (userToDemote?.SchoolId != currentUser.SchoolId) return BadRequest();
            
            if (await _userManager.IsInRoleAsync(userToDemote, "school_admin"))
            {
                await _userManager.RemoveFromRoleAsync(userToDemote, "school_admin");
                await _userManager.AddToRoleAsync(userToDemote, "student");
                userToDemote.Role = DenormalisedRole.Student;
                userToDemote.SchoolPrivateKey = null;
                userToDemote.SchoolPrivateKeyIV = null;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }
        
        [HttpPut("promote/{id}")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> PromoteUser(string id, [FromBody] PromotionDto promotionDto)
        {
            var currentUser = await _userManager.GetUserAsync(HttpContext.User);
            if (currentUser.Id == id) return BadRequest();
            var userToPromote = await _context.Users.FindAsync(id);
            if (userToPromote?.SchoolId != currentUser.SchoolId) return BadRequest();
            
            if (await _userManager.IsInRoleAsync(userToPromote, "student"))
            {
                await _userManager.RemoveFromRoleAsync(userToPromote, "student");
                await _userManager.AddToRoleAsync(userToPromote, "school_admin");
                userToPromote.Role = DenormalisedRole.SchoolAdmin;
                userToPromote.SchoolPrivateKey = promotionDto.PrivateKey;
                userToPromote.SchoolPrivateKeyIV = promotionDto.PrivateKeyIV;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }
    }
}