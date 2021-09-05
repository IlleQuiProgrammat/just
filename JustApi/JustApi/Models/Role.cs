using Microsoft.AspNetCore.Identity;

namespace JustApi.Models
{
    public class Role : IdentityRole
    {
        public Role(string name) : base(name)
        {
        }
    }
}