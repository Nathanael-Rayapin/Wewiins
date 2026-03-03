package com.wewiins.saas_api.repositories

import com.stripe.StripeClient
import com.stripe.param.BalanceTransactionListParams
import com.wewiins.saas_api.interfaces.Revenue
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class StripeRepository(
    private val stripeClient: StripeClient,
) {
    private val logger = LoggerFactory.getLogger(StripeRepository::class.java)

    suspend fun getRevenueByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Revenue {
        logger.info(
            "Fetching Revenue for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        val params = BalanceTransactionListParams.builder()
            .setLimit(100L)
            .setType("charge")
            .setCreated(
                BalanceTransactionListParams.Created.builder()
                    .setGte(startDate)
                    .setLte(endDate)
                    .build()
            )
            .build()

        val result = stripeClient
            .v1()
            .balanceTransactions()
            .list(params)

        val revenue = result.data
            .filter { it.status == "available" }
            .sumOf { transaction ->
                transaction.amount.toDouble() / 100.0
            }

        val isComplete = !result.hasMore

        return Revenue(
            revenue = revenue,
            isComplete = isComplete
        )
    }
}