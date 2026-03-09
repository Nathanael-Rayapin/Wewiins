package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class ActivityScoreDto(
    @field:JsonProperty("average_score")
    val averageScore: Double?
)

data class ActivityScoreDistributionDto(
    val star: Int,
    val count: Int
)