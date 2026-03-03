package com.wewiins.saas_api.interfaces

import com.wewiins.saas_api.enums.BookingStatus
import java.time.LocalDate
import java.time.OffsetDateTime

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
