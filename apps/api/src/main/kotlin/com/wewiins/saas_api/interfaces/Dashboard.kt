package com.wewiins.saas_api.interfaces

import com.wewiins.saas_api.dto.activity.ActivityBooking


/**
 * @property revenue Total revenue in euros
 * @property isComplete True if all transactions have been retrieved
 */
data class Revenue(
    val revenue: Double,
    val isComplete: Boolean
)

data class Orchestration(
    val revenue: Revenue,
    val bookingNumber: Int,
    val visitNumber: Int,
    val averageScore: Double,
    val bookings: List<ActivityBooking>,
)