using System;
using System.Linq;
using System.Security.Cryptography;
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
        [Authorize]
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

        [HttpGet("{secret}")]
        public async Task<IActionResult> GetSchoolSettingsBySecret(string secret)
        {
            if (string.IsNullOrWhiteSpace(secret)) return BadRequest();
            return Ok(
                await _context.Schools.AsNoTracking()
                    .Where(school => school.Secret == secret)
                    .Select(school => new SchoolSettingsDto
                    {
                        SchoolId = school.SchoolId,
                        Name = school.Name,
                        EmailDomain = school.EmailDomain,
                    })
                    .SingleOrDefaultAsync()
            );
        }

        [HttpPost("{secret}")]
        public async Task<IActionResult> RegisterSchoolWithSecret(string secret, [FromBody] SchoolStartDto schoolStart)
        {
            if (string.IsNullOrWhiteSpace(secret)) return BadRequest();
            var school = await _context.Schools
                .Where(school => school.Secret == secret)
                .SingleOrDefaultAsync();
            if (school is null) return NotFound();
            
            if (!schoolStart.TsAndCs)
            {
                return BadRequest(new[] {new {Code = "TsAndCs", Description = "Terms and Conditions not accepted"}});
            }

            var domain = schoolStart.Email.Split('@').Last().ToLower();
            if (domain != school.EmailDomain)
            {
                return BadRequest(new[] {new {Code = "EmailDomain", Description = "Domain must match school domain"}});
            }

            var schoolCount = await _context.Schools.CountAsync();
            
            User potentialUser = new User()
            {
                UserName = schoolStart.Email,
                Email = schoolStart.Email,
                // TODO: Enable email verification
                EmailConfirmed = true,
                SchoolId = school.SchoolId,
                Role = schoolCount == 1 ? DenormalisedRole.Admin : DenormalisedRole.SchoolAdmin,
                PublicKey = schoolStart.PublicKey,
                PrivateKey = schoolStart.PrivateKey,
                SchoolPrivateKey = schoolStart.SchoolPrivateKey,
                IV = schoolStart.IV,
                SchoolPrivateKeyIV = schoolStart.SchoolPrivateKeyIV,
            };
            
            var result = await _userManager.CreateAsync(potentialUser, schoolStart.Password);
            if (result.Succeeded)
            {
                if (schoolCount == 1)
                {
                    await _userManager.AddToRoleAsync(potentialUser, "admin");
                    school.EmailDomain = "@"; // prevents sign ups
                }
                else
                {
                    await _userManager.AddToRoleAsync(potentialUser, "school_admin");
                }
                school.Secret = null;
                school.PublicKey = schoolStart.SchoolPublicKey;
                await _context.SaveChangesAsync();
                return Ok();
            }
            
            return BadRequest(result.Errors);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateSchool(SchoolCreationDto school)
        {
            using var rng = RandomNumberGenerator.Create();
            var secret = new byte[64];
            rng.GetBytes(secret);
            var encodedSecret = Convert.ToBase64String(secret)
                .Replace('+', '_')
                .Replace('/', '-');
            var potentialSchool = new School
            {
                CreationDateTime = DateTime.Now,
                EmailDomain = school.EmailDomain.ToLower(),
                Name = school.Name,
                Secret = encodedSecret,
                StudentLimit = school.StudentLimit,
            };
            _context.Schools.Add(potentialSchool);
            await _context.SaveChangesAsync();
            return Ok(encodedSecret);
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