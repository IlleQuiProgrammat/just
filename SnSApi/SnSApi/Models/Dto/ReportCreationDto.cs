using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SnSApi.Models.Dto
{
    public class ReportCreationDto
    {
        public int QuestionId { get; set; }
        public string Title { get; set; }
        public string ResponseContent { get; set; }
    }
}