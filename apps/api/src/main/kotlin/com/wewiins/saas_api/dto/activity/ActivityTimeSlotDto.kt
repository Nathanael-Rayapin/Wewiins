package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalTime
import java.time.OffsetDateTime

data class ActivityTimeSlotDto(
    val id: String,

    @field:JsonProperty("activity_offer_id")
    val activityOfferId: String,

    @field:JsonProperty("open_time")
    val openTime: LocalTime?,

    @field:JsonProperty("close_time")
    val closeTime: LocalTime?,

    @field:JsonProperty("break_start")
    val breakStart: LocalTime?,

    @field:JsonProperty("break_end")
    val breakEnd: LocalTime?,

    @field:JsonProperty("slot_duration_min")
    val slotDurationMin: Int?,

    @field:JsonProperty("day_of_week")
    val dayOfWeek: Int?,

    val capacity: Int?,

    @field:JsonProperty("created_at")
    val createdAt: OffsetDateTime,
)
