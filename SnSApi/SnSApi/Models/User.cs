using System.Collections.Generic;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace SnSApi.Models
{
    public enum DenormalisedRole
    {
        None,
        Student,
        SchoolAdmin,
        Admin
    }
    
    public class User : IdentityUser
    {
        public int SchoolId { get; set; }
        [JsonIgnore]
        public virtual School School { get; set; }
        [JsonIgnore]
        public virtual List<Report> Reports { get; set; }

        public DenormalisedRole Role { get; set; }
    }
}