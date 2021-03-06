using System;
using System.Collections.Generic;
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
    [Route("/reports/")]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly ProjectContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private Random _random;

        public ReportController(ProjectContext context, IMapper mapper, UserManager<User> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
            _random = new Random(Guid.NewGuid().GetHashCode());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReport(int id)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (await _userManager.IsInRoleAsync(user, "student"))
            {
                var report = await _context.Reports
                    .Include(report => report.Messages)
                    .Include(report => report.Form)
                    .Where(report => report.ReportAuthorId == user.Id && report.ReportId == id)
                    .SingleOrDefaultAsync();
                if (report is null)
                {
                    return NotFound();
                }

                report.StudentRead = true;
                await _context.SaveChangesAsync();
                
                return Ok(_mapper.Map<Report, AnonymisedReport>(report));
            }
            
            if (await _userManager.IsInRoleAsync(user, "school_admin"))
            {
                var report = await _context.Reports
                    .Include(report => report.Messages)
                    .Include(report => report.Form)
                    .Where(report => report.SchoolId == user.SchoolId && report.ReportId == id)
                    .SingleOrDefaultAsync();
                if (report is null)
                {
                    return NotFound();
                }

                report.SchoolRead = true;
                await _context.SaveChangesAsync();
                
                return Ok(_mapper.Map<Report, AnonymisedReport>(report));
            }
            
            return NotFound();
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetShortReports()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (await _userManager.IsInRoleAsync(user, "student"))
            {
                return Ok(_mapper.Map<List<Report>, List<AnonymisedReport>>(
                    await _context.Reports.AsNoTracking()
                        .Where(report => report.ReportAuthorId == user.Id)
                        .ToListAsync()
                ));
            }

            if (await _userManager.IsInRoleAsync(user, "school_admin"))
            {
                return Ok(_mapper.Map<List<Report>, List<AnonymisedReport>>(
                    await _context.Reports.AsNoTracking()
                        .Where(report => report.SchoolId == user.SchoolId)
                        .ToListAsync()
                ));
            }

            return NotFound();
        }

        private string GenerateReportTitle(string prefix)
        {
            _random = new Random(Guid.NewGuid().GetHashCode());
            var adjectiveIndex = _random.Next(0, ReadableIDs.Adjectives.Length);
            var animalIndex = _random.Next(0, ReadableIDs.Animals.Length);
            var number = _random.Next(1, 101);
            return $"{prefix}-{ReadableIDs.Adjectives[adjectiveIndex]}-{ReadableIDs.Animals[animalIndex]}-{number}";
        }

        [HttpPost]
        [Authorize(Roles = "student")]
        public async Task<IActionResult> CreateReport(ReportCreationDto report)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var form = await _context.Forms.AsNoTracking()
                .Where(form => form.FormId == report.FormId && form.SchoolId == user.SchoolId)
                .SingleOrDefaultAsync();
            if (form is null || form.SchoolId != user.SchoolId) return BadRequest();
            
            _context.Reports.Add(new Report
            {
                OpenedDateTime = DateTime.Now,
                ClosedDateTime = null,
                FormId = report.FormId,
                ReportAuthorId = user.Id,
                SchoolId = user.SchoolId,
                ReportStatus = ReportStatus.Unresolved,
                Title = GenerateReportTitle(form.CodeName),
                ResponseContent = report.ResponseContent,
                StudentPublicKey = report.StudentPublicKey,
                StudentPrivateKey = report.StudentPrivateKey,
                IV = report.IV,
                SchoolRead = false,
                StudentRead = true,
            });
            
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> SendMessage(int id, [FromBody] MessageCreationDto message)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            
            if (await _userManager.IsInRoleAsync(user, "student"))
            {
                var report = await _context.Reports
                    .Where(report => report.ReportAuthorId == user.Id && report.ReportId == id)
                    .SingleOrDefaultAsync();
                if (report is null)
                {
                    return NotFound();
                }
                
                // not badrequest so the client force-updates
                if (report.ReportStatus != ReportStatus.Unresolved) return Ok(); 
                
                report.SchoolRead = false;
                
                _context.ReportMessages.Add(new ReportMessage
                {
                    GenericSender = Sender.Student,
                    ReportId = id,
                    SenderId = user.Id,
                    SentTime = DateTime.Now,
                    Type = MessageType.Text,
                    Contents = message.Contents,
                    IV = message.IV
                });
                
                await _context.SaveChangesAsync();
                return Ok();
            }
            
            if (await _userManager.IsInRoleAsync(user, "school_admin"))
            {
                var report = await _context.Reports
                    .Where(report => report.SchoolId == user.SchoolId && report.ReportId == id)
                    .SingleOrDefaultAsync();
                if (report is null)
                {
                    return NotFound();
                }
                
                // not badrequest so the client force-updates
                if (report.ReportStatus != ReportStatus.Unresolved) return Ok(); 

                report.StudentRead = false;
                
                _context.ReportMessages.Add(new ReportMessage
                {
                    GenericSender = Sender.School,
                    ReportId = id,
                    SenderId = user.Id,
                    SentTime = DateTime.Now,
                    Type = MessageType.Text,
                    Contents = message.Contents,
                    IV = message.IV
                });

                await _context.SaveChangesAsync();
                return Ok();
            }

            return NotFound();
        }


        private MessageType GetMessageType(string status)
        {
            return status switch
            {
                "spam" => MessageType.MarkAsSpam,
                "resolved" => MessageType.MarkAsResolved,
                _ => MessageType.MarkAsUnresolved
            };
        }
        
        private ReportStatus GetNewReportStatus(string status)
        {
            return status switch
            {
                "spam" => ReportStatus.Spam,
                "resolved" => ReportStatus.Resolved,
                _ => ReportStatus.Spam
            };
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] string status)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            
            if (await _userManager.IsInRoleAsync(user, "student"))
            {
                var report = await _context.Reports
                    .Where(report => report.ReportAuthorId == user.Id && report.ReportId == id)
                    .SingleOrDefaultAsync();
                
                if (report is null)
                {
                    return NotFound();
                }
                
                // not badrequest so the client force-updates
                if (report.ReportStatus != ReportStatus.Unresolved) return Ok(); 
                
                report.ClosedDateTime = DateTime.Now;
                report.ReportStatus = GetNewReportStatus(status);
                _context.ReportMessages.Add(new ReportMessage
                {
                    GenericSender = Sender.Student,
                    ReportId = id,
                    SenderId = user.Id,
                    SentTime = DateTime.Now,
                    Type = GetMessageType(status),
                });
                
                await _context.SaveChangesAsync();
                return Ok();
            }
            
            if (await _userManager.IsInRoleAsync(user, "school_admin"))
            {
                var report = await _context.Reports
                    .Where(report => report.SchoolId == user.SchoolId && report.ReportId == id)
                    .SingleOrDefaultAsync();
                if (report is null)
                {
                    return NotFound();
                }
                
                // not badrequest so the client force-updates
                if (report.ReportStatus != ReportStatus.Unresolved) return Ok(); 
                
                report.ClosedDateTime = DateTime.Now;
                report.ReportStatus = GetNewReportStatus(status);

                _context.ReportMessages.Add(new ReportMessage
                {
                    GenericSender = Sender.School,
                    ReportId = id,
                    SenderId = user.Id,
                    SentTime = DateTime.Now,
                    Type = GetMessageType(status),
                });

                await _context.SaveChangesAsync();
                return Ok();
            }

            return NotFound();
        }
    }
}