namespace JustApi.Models.Dto
{
    public class RegistrationDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public bool TsAndCs { get; set; }
        public string IV { get; set; }
        public string PublicKey { get; set; }
        public string PrivateKey { get; set; }
        public string PotentialSchoolPublicKey { get; set; }
        public string PotentialSchoolPrivateKey { get; set; }
        public string PotentialSchoolPrivateKeyIV { get; set; }
    }
}