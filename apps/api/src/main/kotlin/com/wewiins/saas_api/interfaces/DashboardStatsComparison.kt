package com.wewiins.saas_api.interfaces

/**
 * Represents a statistic with its comparison to the previous period
 * @property currentValue Value for the current period
 * @property previousValue Previous period value
 * @property percentageChange Percentage change (positive = increase, negative = decrease)
 * @property trend Trend (UP, DOWN, STABLE)
 */
data class ComparisonStat<T : Number>(
    val currentValue: T,
    val previousValue: T,
    val percentageChange: Double,
    val trend: Trend
) {
    enum class Trend {
        UP,
        DOWN,
        STABLE
    }
}

/**
 * Dashboard statistics with comparison to previous period
 */
data class DashboardStatsComparison(
    val revenue: ComparisonStat<Double>,
    val bookingNumber: ComparisonStat<Int>,
    val visitNumber: ComparisonStat<Int>,
    val averageScore: ComparisonStat<Double>,
    val periodDays: Int,
)
