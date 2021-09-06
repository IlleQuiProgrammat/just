using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace JustApi.Models.Dto
{
    public class ReportCreationDto
    {
        public int QuestionId { get; set; }
        public string ResponseContent { get; set; }
        public string StudentPublicKey { get; set; }
        public string StudentPrivateKey { get; set; }
        public string IV { get; set; }
    }
}