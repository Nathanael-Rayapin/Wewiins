package com.wewiins.saas_api.interfaces

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