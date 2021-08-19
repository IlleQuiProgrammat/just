using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SnSApi.Models
{
    public enum ReportStatus
    {
        Unresolved,
        Spam,
        Resolved
    }
    
    public class Report
    {
        public int ReportId { get; set; }
        public int SchoolId { get; set; }
        [JsonIgnore]
        public virtual School School { get; set; }
        [ForeignKey(nameof(User))]
        public string ReportAuthorId { get; set; }
        [JsonIgnore]
        public virtual User ReportAuthor { get; set; }
        public ReportStatus ReportStatus { get; set; }
        public DateTime OpenedDateTime { get; set; }
        public DateTime? ClosedDateTime { get; set; }
        public int QuestionId { get; set; }
        public string Title { get; set; }
        [JsonIgnore]
        public virtual Question Question { get; set; }
        public string ResponseContent { get; set; }
        [JsonIgnore]
        public virtual List<ReportMessage> Messages { get; set; }

        public bool StudentRead { get; set; }
        public bool SchoolRead { get; set; }
    }
}