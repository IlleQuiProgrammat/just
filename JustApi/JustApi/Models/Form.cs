using System.Text.Json.Serialization;

namespace JustApi.Models
{
    public class Form
    {
        public int FormId { get; set; }
        public int SchoolId { get; set; }
        [JsonIgnore]
        public virtual School School { get; set; }
        public string Name { get; set; }
        public string Topic { get; set; }
        public string CodeName { get; set; }
        public string Description { get; set; }
        public string Definition { get; set; }
        public bool Active { get; set; }
        public bool Retired { get; set; }
    }
}