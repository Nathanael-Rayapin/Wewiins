package com.wewiins.saas_api.dto.activity

data class ActivityDraftDto(
    val activityId: String,
    val step1: StepOneLoadDto,
)

data class StepOneLoadDto(
    val name: String,
    val description: String?,
    val categories: List<String>?,
    val photos: List<String>?,
)