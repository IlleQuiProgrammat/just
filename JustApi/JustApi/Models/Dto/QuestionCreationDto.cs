﻿namespace JustApi.Models.Dto
{
    public class QuestionCreationDto
    {
        public string Name { get; set; }
        public string Topic { get; set; }
        public string CodeName { get; set; }
        public string Definition { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
    }
}