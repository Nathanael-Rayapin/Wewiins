package com.wewiins.saas_api.dto

import com.wewiins.saas_api.dto.enums.Role
import java.time.OffsetDateTime
import java.util.UUID

data class Account(
    val id: UUID,
    val company_name: String,
    val email: String,
    val phone_number: String,
    val siret_number: String,
    val is_verified: Boolean,
    val role: Role = Role.PROVIDER,
    val stripe_connected_account_id: String,
    val created_at: OffsetDateTime,
)

data class VerifiedAccount(
    val is_verified: Boolean,
    val stripe_connected_account_id: String,
)
