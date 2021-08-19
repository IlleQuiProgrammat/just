using Microsoft.AspNetCore.Identity;

namespace SnSApi.Models
{
    public class Role : IdentityRole
    {
        public Role(string name) : base(name)
        {
        }
    }
}