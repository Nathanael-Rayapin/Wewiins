package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class ActivityInfoDto(
    val id: String,

    @field:JsonProperty("activity_id")
    val activityId: String,

    @field:JsonProperty("activity_info_preset_id")
    val activityInfoPresetId: String
)
