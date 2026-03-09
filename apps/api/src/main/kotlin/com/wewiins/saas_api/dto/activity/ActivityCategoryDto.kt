package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class ActivityCategoryDto(
    val id: String,

    val name: String,

    @field:JsonProperty("icon_url")
    val iconUrl: String,

    val order: Int?,
)

data class ActivityCategoryJoinDto(
    @field:JsonProperty("activities_categories")
    val activityCategory: ActivityCategoryNameDto?
)

data class ActivityCategoryNameDto(
    @field:JsonProperty("name")
    val name: String?
)
