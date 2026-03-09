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

    suspend fun getTotalRevenueByPeriod(
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

    suspend fun getTotalChargesByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Double {
        logger.info("Fetching platform account charges for connected account {}", connectedAccountId)

        val params = BalanceTransactionListParams.builder()
            .setLimit(100L)
            .setType("application_fee")
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

        // The amount is negative (it is a debit from the connected account)
        // We take the absolute value to display a positive amount
        return result.data
            .filter { it.status == "available" }
            .sumOf { Math.abs(it.amount.toDouble()) / 100.0 }
    }
}