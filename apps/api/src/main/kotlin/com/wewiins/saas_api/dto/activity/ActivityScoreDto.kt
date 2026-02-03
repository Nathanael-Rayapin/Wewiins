package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class AverageScore(
    @field:JsonProperty("average_score")
    val averageScore: Double?
)
