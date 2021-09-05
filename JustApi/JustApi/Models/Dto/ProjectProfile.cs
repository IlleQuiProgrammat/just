using AutoMapper;

namespace JustApi.Models.Dto
{
    public class ProjectProfile : Profile
    {
        public ProjectProfile()
        {
            CreateMap<Report, AnonymisedReport>();
            CreateMap<ReportMessage, AnonymisedReportMessage>();
        }
    }
}