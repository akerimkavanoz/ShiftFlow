using System.Text.Json;
using System.Text.Json.Serialization;

namespace ShiftFlow.API.Extensions;

public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
{
    private readonly string[] _formats = { "HH:mm:ss", "HH:mm", "hh:mm:ss", "hh:mm" };

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value)) return default;

        foreach (var format in _formats)
        {
            if (TimeOnly.TryParseExact(value, format, out var timeOnly))
            {
                return timeOnly;
            }
        }

        throw new JsonException($"'{value}' değeri geçerli bir TimeOnly formatına dönüştürülemedi.");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("HH:mm"));
    }
}