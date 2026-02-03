package com.wewiins.saas_api.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.wewiins.saas_api.dto.activity.ActivityOfferDto
import com.wewiins.saas_api.dto.enums.BookingStatus
import java.time.LocalDate
import java.time.OffsetDateTime

data class BookingsRaw(
    val id: String,

    val reference: String,

    val users: UserName,

    val date: LocalDate,

    @field:JsonProperty("start_time")
    val startTime: OffsetDateTime?,

    @field:JsonProperty("end_time")
    val endTime: OffsetDateTime?,

    val participants: Int,

    @field:JsonProperty("activity_offers")
    val activityOffers: ActivityOfferDto,

    @field:JsonProperty("total_price")
    val totalPrice: Double,

    val status: BookingStatus,
)

data class Bookings(
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