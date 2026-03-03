package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.user.ProviderIdDto
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class ProviderRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(ProviderRepository::class.java)

    object ProviderConstants {
        const val PROVIDER_TABLE = "providers"
    }

    suspend fun getProviderIdByStripeAccountId(stripeConnectedAccountId: String): String {
        return supabaseClient
            .from(ProviderConstants.PROVIDER_TABLE)
            .select(columns = Columns.list("id")) {
                filter {
                    eq("stripe_connected_account_id", stripeConnectedAccountId)
                }
            }
            .decodeList<ProviderIdDto>()
            .firstOrNull()
            ?.id
            ?: throw IllegalArgumentException("Provider introuvable pour le compte Stripe : $stripeConnectedAccountId")
    }
}