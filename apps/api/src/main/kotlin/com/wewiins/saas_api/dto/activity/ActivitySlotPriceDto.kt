package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty
import com.wewiins.saas_api.enums.Moment
import java.time.OffsetDateTime

data class ActivitySlotPriceDto(
    val id: String,

    @field:JsonProperty("activity_time_slot_id")
    val activityTimeSlotId: String,

    @field:JsonProperty("created_at")
    val createAt: OffsetDateTime,

    val moment: Moment?,

    @field:JsonProperty("price_adult")
    val priceAdult: Double?,

    @field:JsonProperty("price_child")
    val priceChild: Double?,

    @field:JsonProperty("price_student")
    val priceStudent: Double?,

    @field:JsonProperty("price_group_2")
    val priceGroup2: Double?,

    @field:JsonProperty("single_rate")
    val singleRate: Double?,

    @field:JsonProperty("is_adult_enabled")
    val isAdultEnabled: Boolean?,

    @field:JsonProperty("is_child_enabled")
    val isChildEnabled: Boolean?,

    @field:JsonProperty("is_student_enabled")
    val isStudentEnabled: Boolean?,

    @field:JsonProperty("is_group2_enabled")
    val isGroup2Enabled: Boolean?,
)
