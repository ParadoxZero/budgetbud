using budgetbud.Models;
using Xunit;

namespace budgetbud.Tests.Unit;

public class TimeUnitTests
{
    [Theory]
    [InlineData(1, 2026, 2, 2026)]
    [InlineData(6, 2026, 7, 2026)]
    [InlineData(11, 2026, 12, 2026)]
    public void Increment_AdvancesMonth_WhenNotDecember(int month, int year, int expectedMonth, int expectedYear)
    {
        var unit = new TimeUnit { Month = month, Year = year };
        var next = unit.Increment();
        Assert.Equal(expectedMonth, next.Month);
        Assert.Equal(expectedYear, next.Year);
    }

    [Fact]
    public void Increment_WrapsToJanuary_WhenDecember()
    {
        var unit = new TimeUnit { Month = 12, Year = 2026 };
        var next = unit.Increment();
        Assert.Equal(1, next.Month);
    }

    [Fact]
    public void Increment_IncrementsYear_WhenDecember()
    {
        var unit = new TimeUnit { Month = 12, Year = 2026 };
        var next = unit.Increment();
        Assert.Equal(2027, next.Year);
    }

    [Fact]
    public void Increment_DoesNotMutateOriginal()
    {
        var unit = new TimeUnit { Month = 12, Year = 2026 };
        unit.Increment();
        Assert.Equal(12, unit.Month);
        Assert.Equal(2026, unit.Year);
    }
}
