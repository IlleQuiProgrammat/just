using System.Linq;
using System.Threading.Tasks;
using SnSApi.Models;
using SnSApi.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SnSApi.Controllers
{
    [ApiController]
    [Route("/auth/")]
    public class AuthenticationController : ControllerBase
    {
        private readonly ProjectContext _context;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        
        public AuthenticationController(ProjectContext context, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Get()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var school = await _context.Schools.FindAsync(user.SchoolId);
            return Ok(new KeysDto
            {
                PrivateKey = user.PrivateKey,
                PrivateKeyIV = user.IV,
                PublicKey = user.PublicKey,
                SchoolPublicKey = school.PublicKey,
                SchoolPrivateKey = user.SchoolPrivateKey,
                SchoolPrivateKeyIV = user.SchoolPrivateKeyIV
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginForm)
        {
            var result = await _signInManager.PasswordSignInAsync(
                loginForm.UserName,
                loginForm.Password,
                true,
                false
            );
            
            if (result.Succeeded)
            {
                return Ok();
            }
            
            if (result.RequiresTwoFactor)
            {
                return Problem("2FA");
            }
            
            return Unauthorized();
        }
        
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationDto registrationForm)
        {
            if (!registrationForm.TsAndCs)
            {
                return BadRequest(new[] {new {Code = "TsAndCs", Description = "Terms and Conditions not accepted"}});
            }

            var domain = registrationForm.Email.Split('@').Last();
            var school = await _context.Schools.Where(school => school.EmailDomain == domain).SingleOrDefaultAsync();
            if (school is null)
            {
                return BadRequest(new[]
                {
                    new
                    {
                        Code = "School",
                        Description = "Your email's domain currently doesn't have a registered school. Contact your school."
                    }
                });
            }

            var userCnt = await _context.Users.CountAsync(x => x.SchoolId == school.SchoolId);
            
            User potentialUser = new User()
            {
                UserName = registrationForm.Email,
                Email = registrationForm.Email,
                // TODO: Enable email verification
                EmailConfirmed = true,
                SchoolId = school.SchoolId,
                Role = DenormalisedRole.Student,
                PublicKey = registrationForm.PublicKey,
                PrivateKey = registrationForm.PrivateKey,
                SchoolPrivateKey = "",
                IV = registrationForm.IV,
                SchoolPrivateKeyIV = "",
            };

            if (userCnt == 0)
            {
                potentialUser.SchoolPrivateKey = registrationForm.PotentialSchoolPrivateKey;
                potentialUser.SchoolPrivateKeyIV = registrationForm.PotentialSchoolPrivateKeyIV;
                potentialUser.Role = DenormalisedRole.SchoolAdmin;
            }
            
            var result = await _userManager.CreateAsync(potentialUser, registrationForm.Password);
            if (result.Succeeded)
            {
                if (userCnt == 0)
                {
                    school.PublicKey = registrationForm.PotentialSchoolPublicKey;
                    await _context.SaveChangesAsync();
                    await _userManager.AddToRoleAsync(potentialUser, "school_admin");
                }
                else
                {
                    await _userManager.AddToRoleAsync(potentialUser, "student");
                }
                return Ok();
            }
            
            return BadRequest(result.Errors);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok();
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetLoginStatus()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user is null) return Ok("none");
            if (await _userManager.IsInRoleAsync(user, "admin")) return Ok("admin");
            if (await _userManager.IsInRoleAsync(user, "school_admin")) return Ok("school_admin");
            if (await _userManager.IsInRoleAsync(user, "student")) return Ok("student");
            return Ok("none");
        }
    }
}