using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SnSApi.Models
{
    public class School
    {
        public int SchoolId { get; set; }
        public string Name { get; set; }
        public string EmailDomain { get; set; }
        public DateTime CreationDateTime { get; set; }
        public int StudentLimit { get; set; }
        [JsonIgnore]
        public virtual List<User> Members { get; set; }
        [JsonIgnore]
        public virtual List<Report> Reports { get; set; }
        [JsonIgnore]
        public virtual List<Question> Questions { get; set; }
    }
}