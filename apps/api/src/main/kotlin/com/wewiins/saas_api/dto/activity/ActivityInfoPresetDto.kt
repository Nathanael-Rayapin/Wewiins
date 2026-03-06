package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class ActivityInfoPresetDto(
    val id: String,

    val title: String,

    val description: String
)

data class ActivityInfoJoinDto(
    @field:JsonProperty("activities_infos_presets")
    val preset: ActivityInfoPresetDto?
)