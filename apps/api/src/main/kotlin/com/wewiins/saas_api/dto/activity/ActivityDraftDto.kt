package com.wewiins.saas_api.dto.activity

import com.wewiins.saas_api.enums.Categories
import com.wewiins.saas_api.enums.Days
import com.wewiins.saas_api.enums.Moment
import java.time.LocalTime

data class ActivityDraftDto(
    // ── Step 1 ────────────────────────────────────────────────
    val name: String? = null,
    val categories: List<Categories>? = null,
    val description: String? = null,
    val photos: List<String>? = null,

    // ── Step 2 ────────────────────────────────────────────────
    val minCapacity: Int? = null,
    val maxCapacity: Int? = null,
    val slotDuration: Int? = null,
    val minAge: Int? = null,
    val maxAge: Int? = null,
    val maxAgeChild: Int? = null,
    val refundPolicy: Int? = null,
    val automaticValidation: Boolean? = null,
    val childAllowedWithAdult: Boolean? = null,
    val address: String? = null,
    val zipcode: String? = null,
    val city: String? = null,
    val accessInfo: String? = null,
    val scheduledActivities: List<ScheduledActivityDto>? = null,

    // ── Step 3 ────────────────────────────────────────────────
    val goodToKnow: List<GoodToKnowDto>? = null,
    val program: List<ProgramDto>? = null,

    // ── Step 4 ────────────────────────────────────────────────
    val isVariablePricing: Boolean? = null,
    val simplePricing: SimplePricingDto? = null,
    val variablePricing: VariablePricingDto? = null,
)

data class ScheduledActivityDto(
    val id: String? = null,
    val selectedDays: List<Days>? = null,
    val availabilityFrom: LocalTime? = null,
    val availabilityTo: LocalTime? = null,
    val unavailabilityFrom: LocalTime? = null,
    val unavailabilityTo: LocalTime? = null,
)

data class GoodToKnowDto(
    val name: String? = null,
    val description: String? = null,
    val iconName: String? = null,
)

data class ProgramDto(
    val title: String? = null,
    val description: String? = null,
    val image: String? = null,
)

data class SimplePricingDto(
    val singleRate: Double? = null,
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,
)

data class DayPricingDto(
    val day: String? = null,
    val selectedMoment: Moment? = null,
    val singleRate: Double? = null,
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,
)

data class VariablePricingDto(
    val dayPricings: List<DayPricingDto>? = null,
)