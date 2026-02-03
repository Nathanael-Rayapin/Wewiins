package com.wewiins.saas_api.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class VisitsCountDto(
    @field:JsonProperty("visit_count")
    val visitCount: Int
)
