package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.OffsetDateTime

data class ActivityCategoryDto(
    val id: String,

    val name: String,

    @field:JsonProperty("icon_url")
    val iconUrl: String,

    val order: Int?,
)
