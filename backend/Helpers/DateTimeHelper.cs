using System;

namespace NobleStep.Api.Helpers;

public static class DateTimeHelper
{
    // Zona horaria de Perú (UTC-5)
    private static readonly TimeZoneInfo PeruTimeZone = ResolvePeruTimeZone();

    private static TimeZoneInfo ResolvePeruTimeZone()
    {
        var timezoneIds = new[] { "America/Lima", "SA Pacific Standard Time" };

        foreach (var timezoneId in timezoneIds)
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                // Intentar con el siguiente ID.
            }
            catch (InvalidTimeZoneException)
            {
                // Intentar con el siguiente ID.
            }
        }

        throw new TimeZoneNotFoundException("No se pudo resolver la zona horaria de Lima (Perú).");
    }

    /// <summary>
    /// Obtiene la fecha y hora actual en zona horaria de Perú
    /// </summary>
    public static DateTime GetPeruDateTime()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, PeruTimeZone);
    }

    /// <summary>
    /// Convierte una fecha UTC a hora de Perú
    /// </summary>
    public static DateTime ConvertToPeruTime(DateTime utcDateTime)
    {
        if (utcDateTime.Kind == DateTimeKind.Local)
        {
            utcDateTime = utcDateTime.ToUniversalTime();
        }
        else if (utcDateTime.Kind == DateTimeKind.Unspecified)
        {
            utcDateTime = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
        }

        return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, PeruTimeZone);
    }

    /// <summary>
    /// Convierte una fecha de Perú a UTC
    /// </summary>
    public static DateTime ConvertToUtc(DateTime peruDateTime)
    {
        return TimeZoneInfo.ConvertTimeToUtc(peruDateTime, PeruTimeZone);
    }
}
