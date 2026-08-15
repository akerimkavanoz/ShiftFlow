namespace ShiftFlow.Infrastructure.Data.Configurations;

public class ConnectionStringOptions
{
    public const string Key = "ConnectionStrings";
    public string SqlServer { get; set; } = default!;
}
