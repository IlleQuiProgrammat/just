namespace JustApi.Models.Dto
{
    public class ShortQuestionWithActivityDto
    {
        public int QuestionId { get; set; }
        public string Name { get; set; }
        public string Topic { get; set; }
        public string CodeName { get; set; }
        public bool Active { get; set; }
    }
}