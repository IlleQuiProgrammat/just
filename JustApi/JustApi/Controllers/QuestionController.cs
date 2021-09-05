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
    [Route("/questions/")]
    [Authorize]
    public class QuestionController : ControllerBase
    {
        private readonly ProjectContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;

        public QuestionController(ProjectContext context, IMapper mapper, UserManager<User> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
        }

        [HttpPost]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> CreateQuestion(QuestionCreationDto question)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            _context.Questions.Add(new Question
            {
                Active = question.Active,
                Definition = question.Definition,
                Description = question.Description,
                Name = question.Name,
                SchoolId = user.SchoolId
            });
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuestionDetails(int id)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var question = await _context.Questions.AsNoTracking()
                .Where(question => question.SchoolId == user.SchoolId && question.QuestionId == id)
                .SingleOrDefaultAsync();

            if (question is null) return NotFound();
            return Ok(question);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetActiveShortQuestionDetails()
        {var user = await _userManager.GetUserAsync(HttpContext.User);
            var questions = await _context.Questions.AsNoTracking()
                .Where(question => question.SchoolId == user.SchoolId)
                .Select(question => new ShortQuestionDto
                {
                    Name = question.Name,
                    QuestionId = question.QuestionId
                })
                .ToListAsync();
            return Ok(questions);
        }
        
        [HttpGet("list/all")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> GetAllShortQuestionDetails()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var questions = await _context.Questions.AsNoTracking()
                .Where(question => question.SchoolId == user.SchoolId)
                .Select(question => new ShortQuestionWithActivityDto
                {
                    Name = question.Name,
                    QuestionId = question.QuestionId,
                    Active = question.Active
                })
                .ToListAsync();
            return Ok(questions);
        }

        [HttpPut("{id}/active")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> SetQuestionActivity(int id, [FromBody] bool active)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var question = await _context.Questions
                .Where(question => question.SchoolId == user.SchoolId && question.QuestionId == id)
                .SingleOrDefaultAsync();
            
            if (question is null) return NotFound();
            
            question.Active = active;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}