using System.Text.Json.Serialization;

namespace SnSApi.Models
{
    public class Question
    {
        public int QuestionId { get; set; }
        public int SchoolId { get; set; }
        [JsonIgnore]
        public virtual School School { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Definition { get; set; }
        public bool Active { get; set; }
    }
}