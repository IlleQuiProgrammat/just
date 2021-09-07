using System.Collections.Generic;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace JustApi.Models
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

        public string PublicKey { get; set; }
        public string PrivateKey { get; set; } // encrypted with password
        public string SchoolPrivateKey { get; set; } // encrypted with derived ecdh key
        public string IV { get; set; }
        public string SchoolPrivateKeyIV { get; set; }
        public DenormalisedRole Role { get; set; }
    }
}