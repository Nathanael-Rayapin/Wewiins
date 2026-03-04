package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class ActivityProgramDto(
    val id: String,

    @field:JsonProperty("activity_id")
    val activityId: String,

    val title: String?,

    
)
