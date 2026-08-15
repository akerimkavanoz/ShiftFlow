using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;
using System.Globalization;

namespace ShiftFlow.Infrastructure.Reports;

public class MonthlyShiftReport(
    List<EmployeeShiftDto> reportData,
    int year,
    int month,
    string departmentName,
    Dictionary<string, string> shiftDefinitions, // Key: ShiftCode/Name, Value: Time Range
    Dictionary<string, string>? shiftColors = null) : IDocument // Key: ShiftCode/Name, Value: Hex Color (Örn: #3B82F6)
{
    private static readonly CultureInfo TurkishCulture = new("tr-TR");

    // Temel Sütun ve Başlık Renkleri
    private static readonly Color EmployeeHeaderBg = Color.FromHex("#78859C");
    private static readonly Color WeekdayHeaderBg = Color.FromHex("#97A5BD");
    private static readonly Color DarkAccentColor = Color.FromHex("#1A252F");
    private static readonly string DefaultFont = "Arial";

    // Cumartesi / Pazar Başlık Renkleri (Sadece Header Kısmı İçin)
    private static readonly Color SaturdayHeaderColor = Color.FromHex("#5A67D8");
    private static readonly Color SundayHeaderColor = Color.FromHex("#E53E3E");

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;
    public DocumentSettings GetSettings() => DocumentSettings.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4.Landscape());
            page.Margin(1, Unit.Centimetre);
            page.PageColor(Colors.White);
            page.DefaultTextStyle(TextStyle.Default.FontFamily(DefaultFont).FontSize(7.5f));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().Element(ComposeFooter);
        });
    }

    private void ComposeHeader(IContainer container)
    {
        var tempDate = new DateTime(year, month, 1);
        string monthName = tempDate.ToString("MMMM", TurkishCulture);
        monthName = TurkishCulture.TextInfo.ToTitleCase(monthName);

        string logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "logo.png");

        if (!File.Exists(logoPath))
        {
            logoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "assets", "logo.png");
        }

        container.Row(row =>
        {
            row.ConstantItem(150).AlignMiddle().Column(logoColumn =>
            {
                if (File.Exists(logoPath))
                {
                    logoColumn.Item().Height(35).Width(150).Image(logoPath).FitArea();
                }
            });

            row.RelativeItem().AlignMiddle().AlignCenter().Text($"{year} Yılı {monthName} Ayı {departmentName} Departmanı Vardiya Çizelgesi")
                .Style(TextStyle.Default.FontSize(11.5f).Bold().FontColor(DarkAccentColor));

            row.ConstantItem(150).AlignMiddle().AlignRight().Text($"{DateTime.Now:dd.MM.yyyy HH:mm}")
                .Style(TextStyle.Default.FontSize(8).Italic().FontColor(Colors.Grey.Darken1));
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingTop(0.4f, Unit.Centimetre).Column(mainColumn =>
        {
            mainColumn.Item().Element(ComposeShiftTable);
            mainColumn.Item().PaddingTop(0.4f, Unit.Centimetre).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1);
            mainColumn.Item().Element(ComposeShiftLegend);
        });
    }

    private void ComposeShiftTable(IContainer container)
    {
        int daysInMonth = DateTime.DaysInMonth(year, month);

        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(4); // Personel Adı Soyadı Sütunu

                for (int day = 1; day <= daysInMonth; day++)
                {
                    columns.RelativeColumn(1);
                }
            });

            // Tablo Başlık Alanı (Header)
            table.Header(header =>
            {
                header.Cell().RowSpan(2).Background(EmployeeHeaderBg).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignCenter().AlignMiddle()
                    .Text("Personel Adı Soyadı").Style(TextStyle.Default.Bold().FontColor(Colors.White).FontSize(8f));

                // 1. SATIR: Günün Tam İsimleri (Dikey)
                for (int day = 1; day <= daysInMonth; day++)
                {
                    var date = new DateTime(year, month, day);
                    var headerBg = GetHeaderColor(date);

                    string rawDayName = date.ToString("dddd", TurkishCulture);
                    string fullDayName = TurkishCulture.TextInfo.ToTitleCase(rawDayName);

                    header.Cell().Background(headerBg).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Height(55).AlignCenter().AlignMiddle()
                        .RotateLeft()
                        .Text(fullDayName).Style(TextStyle.Default.Bold().FontColor(Colors.White).FontSize(7f));
                }

                // 2. SATIR: Gün Sayıları (1, 2, 3...)
                for (int day = 1; day <= daysInMonth; day++)
                {
                    var date = new DateTime(year, month, day);
                    var headerBg = GetHeaderColor(date);

                    header.Cell().Background(headerBg).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(2).AlignCenter().AlignMiddle()
                        .Text(day.ToString()).Style(TextStyle.Default.Bold().FontColor(Colors.White).FontSize(7f));
                }
            });

            // Tablo Veri Satırları
            foreach (var employee in reportData)
            {
                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignCenter().AlignMiddle()
                    .Text(employee.EmployeeName).Style(TextStyle.Default.Bold().FontSize(7.5f));

                for (int day = 1; day <= daysInMonth; day++)
                {
                    string shiftCode = (employee.Days != null && employee.Days.Count >= day) ? employee.Days[day - 1] : "";

                    // Dinamik Arka Plan ve Yazı Rengi Hesaplama
                    Color cellBg = GetShiftBackgroundColor(shiftCode);
                    Color textColor = GetContrastingTextColor(shiftCode);

                    table.Cell().Background(cellBg).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignCenter().AlignMiddle()
                        .Text(shiftCode)
                        .Style(TextStyle.Default.Bold().FontSize(6.5f).FontColor(textColor));
                }
            }
        });
    }

    private void ComposeShiftLegend(IContainer container)
    {
        container.PaddingTop(0.3f, Unit.Centimetre).Row(row =>
        {
            row.RelativeItem().Column(legendColumn =>
            {
                legendColumn.Item().Text("Vardiya İsimleri ve Çalışma Saatleri")
                    .Style(TextStyle.Default.FontSize(8.5f).Bold().FontColor(EmployeeHeaderBg));

                legendColumn.Item().PaddingTop(0.15f, Unit.Centimetre).Column(listColumn =>
                {
                    foreach (var definition in shiftDefinitions)
                    {
                        var shiftCode = definition.Key;
                        var legendBg = GetShiftBackgroundColor(shiftCode);
                        var legendTextColor = GetContrastingTextColor(shiftCode);

                        listColumn.Item().PaddingBottom(2).Row(r =>
                        {
                            // Renk Kutucuğu
                            r.ConstantItem(12).Height(10).Background(legendBg).Border(0.5f).BorderColor(Colors.Grey.Lighten1);

                            r.RelativeItem().PaddingLeft(6).Text(t =>
                            {
                                t.Span($"{shiftCode}").Style(TextStyle.Default.Bold().FontColor(EmployeeHeaderBg));
                                t.Span($":  {definition.Value}").Style(TextStyle.Default.NormalWeight().FontSize(7.5f));
                            });
                        });
                    }
                });
            });

            row.RelativeItem();
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Text(x =>
        {
            x.Span("Sayfa ");
            x.CurrentPageNumber();
            x.Span(" / ");
            x.TotalPages();
        });
    }

    // Sadece Header İçin Renk Mantığı
    private static Color GetHeaderColor(DateTime date)
    {
        return date.DayOfWeek switch
        {
            DayOfWeek.Saturday => SaturdayHeaderColor,
            DayOfWeek.Sunday => SundayHeaderColor,
            _ => WeekdayHeaderBg
        };
    }

    // Vardiya Koduna Göre Arka Plan Rengi Alır
    private Color GetShiftBackgroundColor(string shiftCode)
    {
        if (string.IsNullOrWhiteSpace(shiftCode))
            return Colors.White;

        if (shiftColors != null && shiftColors.TryGetValue(shiftCode, out var hexColor) && !string.IsNullOrWhiteSpace(hexColor))
        {
            try
            {
                return Color.FromHex(hexColor);
            }
            catch
            {
                // Hex parse edilemezse varsayılan beyaza düşer
            }
        }

        return Colors.White;
    }

    // W3C LUMINANCE ALGORTİMASI (Arka Plan Koyu ise Beyaz Metin, Açık ise Koyu Metin)
    private Color GetContrastingTextColor(string shiftCode)
    {
        if (string.IsNullOrWhiteSpace(shiftCode))
            return DarkAccentColor;

        if (shiftColors != null && shiftColors.TryGetValue(shiftCode, out var hexColor) && !string.IsNullOrWhiteSpace(hexColor))
        {
            try
            {
                string cleanHex = hexColor.Replace("#", "").Trim();
                if (cleanHex.Length == 6)
                {
                    int r = Convert.ToInt32(cleanHex.Substring(0, 2), 16);
                    int g = Convert.ToInt32(cleanHex.Substring(2, 2), 16);
                    int b = Convert.ToInt32(cleanHex.Substring(4, 2), 16);

                    // Parlaklık İndeksi (Luminance Index)
                    double luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                    // Parlaklık 0.5'ten küçükse arka plan KOYU demektir -> BEYAZ YAZI
                    return luminance < 0.55 ? Colors.White : DarkAccentColor;
                }
            }
            catch
            {
                // Parse hatasında varsayılana dön
            }
        }

        return DarkAccentColor;
    }
}