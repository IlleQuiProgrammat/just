using System;
using System.Text.Json.Serialization;

namespace SnSApi.Models
{
    public enum MessageType
    {
        Text,
        MarkAsSpam,
        MarkAsResolved,
        MarkAsUnresolved
    }
    
    public enum Sender
    {
        Student,
        School
    }
    
    public class ReportMessage
    {
        public int ReportMessageId { get; set; }
        public int ReportId { get; set; }
        [JsonIgnore]
        public virtual Report Report { get; set; }
        public DateTime SentTime { get; set; }
        public MessageType Type { get; set; }
        public string SenderId { get; set; }
        [JsonIgnore]
        public virtual User Sender { get; set; }
        public Sender GenericSender { get; set; }
        public string Contents { get; set; }
    }
}