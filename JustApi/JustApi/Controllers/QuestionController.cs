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
                SchoolId = user.SchoolId,
                Topic = question.Topic,
                CodeName = question.CodeName,
                Retired = false,
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
                .Where(question => question.SchoolId == user.SchoolId && question.Active)
                .Select(question => new ShortQuestionDto
                {
                    Name = question.Name,
                    QuestionId = question.QuestionId,
                    Topic = question.Topic,
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
                .Where(question => question.SchoolId == user.SchoolId && !question.Retired)
                .Select(question => new ShortQuestionWithActivityDto
                {
                    Name = question.Name,
                    QuestionId = question.QuestionId,
                    Active = question.Active,
                    Topic = question.Topic,
                    CodeName = question.CodeName,
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
                .Where(question => question.SchoolId == user.SchoolId && question.QuestionId == id && !question.Retired)
                .SingleOrDefaultAsync();
            
            if (question is null) return NotFound();
            if (question.Retired) return BadRequest();
            
            question.Active = active;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "school_admin")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionCreationDto question)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var previousQuestion = await _context.Questions
                .Where(question => question.SchoolId == user.SchoolId && question.QuestionId == id && !question.Retired)
                .SingleOrDefaultAsync();
            
            if (previousQuestion is null) return NotFound();
            if (string.IsNullOrWhiteSpace(question.Name)) return BadRequest("Name cannot be null or whitespace");
            if (string.IsNullOrWhiteSpace(question.CodeName))
                return BadRequest("Code Name cannot be null or whitespace");
            if (string.IsNullOrWhiteSpace(question.Topic))
                return BadRequest("Topic cannot be null or whitespace.");
            if (string.IsNullOrWhiteSpace(question.Description))
                return BadRequest("Description cannot be null or whitespace.");
            if (string.IsNullOrWhiteSpace(question.Definition))
                return BadRequest("Description cannot be null or whitespace.");
            
            previousQuestion.Retired = true;
            previousQuestion.Active = false;

            _context.Questions.Add(new Question
            {
                Active = question.Active,
                Definition = question.Definition,
                Description = question.Description,
                Name = question.Name,
                SchoolId = user.SchoolId,
                Topic = question.Topic,
                CodeName = question.CodeName,
                Retired = false,
            });
            
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}