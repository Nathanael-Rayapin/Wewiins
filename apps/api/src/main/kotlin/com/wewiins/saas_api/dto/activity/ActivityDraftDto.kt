package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty
import com.wewiins.saas_api.enums.Moment

data class ActivityDraftDto(
    val activityId: String,
    val step1: StepOneLoadDto?,
    val step2: StepTwoLoadDto?,
    val step3: StepThreeLoadDto?,
    val step4: StepFourLoadDto?
)

data class StepOneLoadDto(
    val name: String,
    val description: String?,
    val categories: List<String>?,
    val photos: List<String>?,
)

data class StepTwoLoadDto(
    val minCapacity: Int?,
    val maxCapacity: Int?,
    val slotDurationMin: Int?,
    val minAge: Int?,
    val maxAge: Int?,
    val minAgeChild: Int?,
    val maxAgeChild: Int?,
    val refundPolicy: Int?,
    val automaticValidation: Boolean?,
    val childAllowedWithAdult: Boolean?,
    val address: String?,
    val zipcode: String?,
    val city: String?,
    val accessInfo: String?,
    val scheduledActivities: List<ScheduledActivityLoadDto>?,
)

data class ScheduledActivityLoadDto(
    val id: String?,
    val dayOfWeek: List<String>?,
    val openTime: String?,
    val closeTime: String?,
    val breakStart: String?,
    val breakEnd: String?,
)

data class StepThreeLoadDto(
    val goodToKnow: List<GoodToKnowDto>? = null,
    val program: List<ProgramDto>? = null,
)

data class GoodToKnowDto(
    val name: String? = null,
    val description: String? = null,
)

data class ProgramDto(
    val title: String? = null,
    val description: String? = null,
    val image: String? = null,
)

data class StepFourLoadDto(
    @field:JsonProperty("isVariablePricing")
    val isVariablePricing: Boolean? = null,

    val simplePricing: SimplePricingDto? = null,
    val variablePricing: VariablePricingDto? = null,
)

data class SimplePricingDto(
    val singleRate: Double? = null,
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,

    @field:JsonProperty("isAdultEnabled")
    val isAdultEnabled: Boolean? = null,

    @field:JsonProperty("isChildEnabled")
    val isChildEnabled: Boolean? = null,

    @field:JsonProperty("isStudentEnabled")
    val isStudentEnabled: Boolean? = null,

    @field:JsonProperty("isGroup2Enabled")
    val isGroup2Enabled: Boolean? = null,
)

data class VariablePricingDto(
    val dayPricings: List<DayPricingDto>? = null,
)

data class DayPricingDto(
    val day: String? = null,
    val selectedMoment: Moment? = null,
    val singleRate: Double? = null,
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,

    @field:JsonProperty("isAdultEnabled")
    val isAdultEnabled: Boolean? = null,

    @field:JsonProperty("isChildEnabled")
    val isChildEnabled: Boolean? = null,

    @field:JsonProperty("isStudentEnabled")
    val isStudentEnabled: Boolean? = null,

    @field:JsonProperty("isGroup2Enabled")
    val isGroup2Enabled: Boolean? = null,
)