namespace ShiftFlow.Application.Extensions;

public class ServiceResult
{
    public List<string>? ErrorMessage { get; set; }
    public bool IsSuccess => ErrorMessage == null || ErrorMessage.Count == 0;
    public bool IsFail => !IsSuccess;
    public System.Net.HttpStatusCode Status { get; set; }
    public static ServiceResult Success(System.Net.HttpStatusCode status = System.Net.HttpStatusCode.OK)
        => new() { Status = status };

    public static ServiceResult Fail(string message, System.Net.HttpStatusCode status = System.Net.HttpStatusCode.BadRequest)
        => new() { ErrorMessage = [message], Status = status };

    public static ServiceResult Fail(List<string> messages, System.Net.HttpStatusCode status = System.Net.HttpStatusCode.BadRequest)
        => new() { ErrorMessage = messages, Status = status };
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; set; }

    public static ServiceResult<T> Success(T data, System.Net.HttpStatusCode status = System.Net.HttpStatusCode.OK)
        => new() { Data = data, Status = status };

    public static new ServiceResult<T> Fail(string message, System.Net.HttpStatusCode status = System.Net.HttpStatusCode.BadRequest)
        => new() { ErrorMessage = [message], Status = status };

    public static new ServiceResult<T> Fail(List<string> messages, System.Net.HttpStatusCode status = System.Net.HttpStatusCode.BadRequest)
        => new() { ErrorMessage = messages, Status = status };
}