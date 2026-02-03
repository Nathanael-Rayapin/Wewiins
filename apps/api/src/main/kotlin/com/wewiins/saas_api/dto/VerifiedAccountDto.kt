package com.wewiins.saas_api.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class VerifiedAccount(
    @field:JsonProperty("is_verified")
    val isVerified: Boolean,

    @field:JsonProperty("stripe_connected_account_id")
    val stripeConnectedAccountId: String? = null,
)
