package com.wewiins.saas_api.interfaces

import com.wewiins.saas_api.enums.BookingStatus
import java.time.LocalDate
import java.time.OffsetDateTime

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

data class ActivityBooking(
    val id: String,
    val reference: String,
    val name: String,
    val date: LocalDate,
    val startTime: OffsetDateTime?,
    val endTime: OffsetDateTime?,
    val participants: Int,
    val title: String,
    val totalPrice: Double,
    val status: BookingStatus,
)