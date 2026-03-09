package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class ActivityVisitDto(
    @field:JsonProperty("visit_date")
    val visitDate: String,

    @field:JsonProperty("visit_count")
    val visitCount: Int,
)
