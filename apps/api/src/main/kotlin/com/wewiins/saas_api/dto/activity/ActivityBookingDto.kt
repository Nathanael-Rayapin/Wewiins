package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty
import com.wewiins.saas_api.dto.user.UserDto
import com.wewiins.saas_api.enums.BookingStatus
import java.time.LocalDate
import java.time.OffsetDateTime

data class ActivityBookingDto(
    val id: String,

    val reference: String,

    val users: UserDto,

    val date: LocalDate,

    @field:JsonProperty("start_time")
    val startTime: OffsetDateTime?,

    @field:JsonProperty("end_time")
    val endTime: OffsetDateTime?,

    val participants: Int,

    @field:JsonProperty("activity_offers")
    val activityOffers: ActivityTitleWrapper,

    @field:JsonProperty("total_price")
    val totalPrice: Double,

    val status: BookingStatus,
)

data class ActivityTitleWrapper(
    val activities: ActivityTitle
)

data class ActivityTitle(
    val title: String
)

data class ActivityBookingDateDto(
    val date: String
)