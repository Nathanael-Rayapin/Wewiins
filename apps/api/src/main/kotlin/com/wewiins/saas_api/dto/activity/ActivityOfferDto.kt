package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty
import com.wewiins.saas_api.enums.BookingType
import java.time.OffsetDateTime

data class OfferDto(
    val id: String,

    @field:JsonProperty("activity_id")
    val activityId: String,

    @field:JsonProperty("booking_type")
    val bookingType: BookingType?,

    @field:JsonProperty("redemption_validity_days")
    val redemptionValidityDays: Int?,

    @field:JsonProperty("min_age")
    val minAge: Int?,

    @field:JsonProperty("max_age_child")
    val maxAgeChild: Int?,

    @field:JsonProperty("min_capacity")
    val minCapacity: Int?,

    @field:JsonProperty("max_capacity")
    val maxCapacity: Int?,

    @field:JsonProperty("created_at")
    val createdAt: OffsetDateTime,

    @field:JsonProperty("refund_policy")
    val refundPolicy: Int? = 0,

    @field:JsonProperty("max_age")
    val maxAge: Int?,

    @field:JsonProperty("automatic_validation")
    val automaticValidation: Boolean?,

    @field:JsonProperty("child_allowed_with_adult")
    val childAllowedWithAdult: Boolean?,

    @field:JsonProperty("min_age_child")
    val minAgeChild: Int?
)

data class OfferIdDto(
    val id: String,
)
