namespace SnSApi.Models.Dto
{
    public class ShortUserDto
    {
        public string Email { get; set; }
        public string Id { get; set; }
        public DenormalisedRole Role { get; set; }
        public string PublicKey { get; set; }
    }
}