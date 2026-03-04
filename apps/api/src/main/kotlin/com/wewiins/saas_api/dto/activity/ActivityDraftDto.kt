package com.wewiins.saas_api.dto.activity

import com.wewiins.saas_api.interfaces.GoodToKnow
import com.wewiins.saas_api.interfaces.Program

data class ActivityDraftDto(
    val activityId: String,
    val step1: StepOneLoadDto?,
    val step2: StepTwoLoadDto?,
    val step3: StepThreeLoadDto?
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
    val iconName: String? = null,
)

data class ProgramDto(
    val title: String? = null,
    val description: String? = null,
    val image: String? = null,
)