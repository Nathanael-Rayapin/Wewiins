package com.wewiins.saas_api.interfaces

import com.wewiins.saas_api.dto.activity.ActivityBooking

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
 * @property revenue Total revenue in euros
 * @property isComplete True if all transactions have been retrieved
 */
data class Revenue(
    val revenue: Double,
    val isComplete: Boolean
)

data class Dashboard(
    val totalRevenue: ComparisonStat<Double>,
    val totalBooking: ComparisonStat<Int>,
    val totalVisit: ComparisonStat<Int>,
    val averageScore: ComparisonStat<Double>,
    val filterRangeDays: Int,
    val bookings: List<ActivityBooking>,
    val isRevenueCompletelyLoad: Boolean
)