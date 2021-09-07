using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustApi.Models;
using JustApi.Models.Dto;

namespace JustApi.Controllers
{
    [ApiController]
    [Route("/forms/")]
    [Authorize]
    public class FormController : ControllerBase
    {
        private readonly ProjectContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;

        public FormController(ProjectContext context, IMapper mapper, UserManager<User> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
        }

        [HttpPost]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> CreateForm(FormCreationDto form)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            _context.Forms.Add(new Form
            {
                Active = form.Active,
                Definition = form.Definition,
                Description = form.Description,
                Name = form.Name,
                SchoolId = user.SchoolId,
                Topic = form.Topic,
                CodeName = form.CodeName,
                Retired = false,
            });
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFormDetails(int id)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var form = await _context.Forms.AsNoTracking()
                .Where(form => form.SchoolId == user.SchoolId && form.FormId == id)
                .SingleOrDefaultAsync();

            if (form is null) return NotFound();
            return Ok(form);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetActiveShortFormDetails()
        {var user = await _userManager.GetUserAsync(HttpContext.User);
            var forms = await _context.Forms.AsNoTracking()
                .Where(form => form.SchoolId == user.SchoolId && form.Active)
                .Select(form => new ShortFormDto
                {
                    Name = form.Name,
                    FormId = form.FormId,
                    Topic = form.Topic,
                })
                .ToListAsync();
            return Ok(forms);
        }
        
        [HttpGet("list/all")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> GetAllShortFormDetails()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var forms = await _context.Forms.AsNoTracking()
                .Where(form => form.SchoolId == user.SchoolId && !form.Retired)
                .Select(form => new ShortFormWithActivityDto
                {
                    Name = form.Name,
                    FormId = form.FormId,
                    Active = form.Active,
                    Topic = form.Topic,
                    CodeName = form.CodeName,
                })
                .ToListAsync();
            return Ok(forms);
        }

        [HttpPut("{id}/active")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> SetFormActivity(int id, [FromBody] bool active)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var form = await _context.Forms
                .Where(form => form.SchoolId == user.SchoolId && form.FormId == id && !form.Retired)
                .SingleOrDefaultAsync();
            
            if (form is null) return NotFound();
            if (form.Retired) return BadRequest();
            
            form.Active = active;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> UpdateForm(int id, [FromBody] FormCreationDto form)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var previousForm = await _context.Forms
                .Where(form => form.SchoolId == user.SchoolId && form.FormId == id && !form.Retired)
                .SingleOrDefaultAsync();
            
            if (previousForm is null) return NotFound();
            if (string.IsNullOrWhiteSpace(form.Name)) return BadRequest("Name cannot be null or whitespace");
            if (string.IsNullOrWhiteSpace(form.CodeName))
                return BadRequest("Code Name cannot be null or whitespace");
            if (string.IsNullOrWhiteSpace(form.Topic))
                return BadRequest("Topic cannot be null or whitespace.");
            if (string.IsNullOrWhiteSpace(form.Description))
                return BadRequest("Description cannot be null or whitespace.");
            if (string.IsNullOrWhiteSpace(form.Definition))
                return BadRequest("Description cannot be null or whitespace.");
            
            previousForm.Retired = true;
            previousForm.Active = false;

            _context.Forms.Add(new Form
            {
                Active = form.Active,
                Definition = form.Definition,
                Description = form.Description,
                Name = form.Name,
                SchoolId = user.SchoolId,
                Topic = form.Topic,
                CodeName = form.CodeName,
                Retired = false,
            });
            
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}