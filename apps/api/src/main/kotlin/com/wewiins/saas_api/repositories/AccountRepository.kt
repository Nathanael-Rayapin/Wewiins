package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.VerifiedAccountDto
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository


@Repository
class AccountRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(AccountRepository::class.java)

    suspend fun getProviderVerifiedAccount(email: String): VerifiedAccountDto? {
        logger.info("Is provider verified method called for $email")

        val result = supabaseClient
            .from("providers")
            .select(columns = Columns.list("is_verified, stripe_connected_account_id")) {
                filter {
                    eq("email", email)
                }
            }
            .decodeList<VerifiedAccountDto>()

        val account = result.firstOrNull()

        if (account == null) {
            logger.warn("No provider found for email: $email")
            return null
        }

        logger.info("Provider account retrieved - is_verified: ${account.isVerified}")
        return account
    }
}