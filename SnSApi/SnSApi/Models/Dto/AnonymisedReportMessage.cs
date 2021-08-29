using System;

namespace SnSApi.Models.Dto
{
    public class AnonymisedReportMessage
    {
        public int ReportMessageId { get; set; }
        public int ReportId { get; set; }
        public DateTime SentTime { get; set; }
        public MessageType Type { get; set; }
        public Sender GenericSender { get; set; }
        public string Contents { get; set; }
        public string IV { get; set; }
    }
}