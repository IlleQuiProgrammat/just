using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JustApi.Models
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
        public int FormId { get; set; }
        // Encrypted with derived key
        public string Title { get; set; }
        [JsonIgnore]
        public virtual Form Form { get; set; }
        
        // Encrypted with derived key
        public string ResponseContent { get; set; }
        public string IV { get; set; }
        
        [JsonIgnore]
        public virtual List<ReportMessage> Messages { get; set; }

        // Public key thing
        public string StudentPublicKey { get; set; }
        // Encrypted using form of student password
        public string StudentPrivateKey { get; set; }
        
        public bool StudentRead { get; set; }
        public bool SchoolRead { get; set; }
    }
}