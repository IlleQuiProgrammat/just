using System;
using System.Collections.Generic;

namespace JustApi.Models.Dto
{
    public class AnonymisedReport
    {
        public int ReportId { get; set; }
        public int SchoolId { get; set; }
        public ReportStatus ReportStatus { get; set; }
        public DateTime OpenedDateTime { get; set; }
        public DateTime? ClosedDateTime { get; set; }
        public int FormId { get; set; }
        public Form Form { get; set; }
        public string Title { get; set; }
        public string ResponseContent { get; set; }
        public string IV { get; set; }
        public string StudentPublicKey { get; set; }
        public string StudentPrivateKey { get; set; }
        public List<AnonymisedReportMessage> Messages { get; set; }
        public bool StudentRead { get; set; }
        public bool SchoolRead { get; set; }
    }
}