package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.Orchestration
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class OrchestrationService(
    private val accountService: AccountService,
    private val activityService: ActivityService
) {
    private val logger = LoggerFactory.getLogger(OrchestrationService::class.java)

    fun initializeDashboard(
        email: String,
        startDate: Long,
        endDate: Long
    ): Orchestration? {
        logger.info("Dashboard initialization started")

        // Step 1 : Verify Provider
        val verifiedAccount = accountService.getProviderVerifiedAccount(email)

        if (verifiedAccount == null) {
            logger.warn("Provider account not found for email: $email - Stopping orchestration")
            return null
        }

        if (!verifiedAccount.is_verified) {
            logger.warn("Provider not verified for email: $email - Stopping orchestration")
            return null
        }

        logger.info("Provider verified - Proceeding with data fetching")

        // Step 2 : Retrieve all initial data
        return runBlocking {
            val revenueDeferred = async(Dispatchers.IO) {
                activityService.getRevenueByAccountId(
                    verifiedAccount.stripe_connected_account_id,
                    startDate,
                    endDate
                )
            }

            // Tu pourras ajouter d'autres appels parallèles ici
            // val statsDeferred = async(Dispatchers.IO) { statsService.getStats(...) }

            // Attente de tous les résultats
            val revenue = revenueDeferred.await()
            // val stats = statsDeferred.await()

            logger.info("📊 Dashboard data fetched successfully")

            Orchestration(
                revenue = revenue,
            )
        }
    }
}