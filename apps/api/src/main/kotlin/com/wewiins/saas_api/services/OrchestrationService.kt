package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.Orchestration
import com.wewiins.saas_api.dto.VerifiedAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class OrchestrationService(
    private val activityService: ActivityService
) {
    private val logger = LoggerFactory.getLogger(OrchestrationService::class.java)

    fun initializeDashboard(
        verifiedAccount: VerifiedAccount,
        startDate: Long,
        endDate: Long
    ): Orchestration? {
        logger.info("Dashboard initialization started")

        // Step 2 : Retrieve all initial data
        return runBlocking {
            val revenueDeferred = async(Dispatchers.IO) {
                activityService.getRevenueByAccountId(
                    verifiedAccount.stripe_connected_account_id,
                    startDate,
                    endDate
                )
            }

            // We can add other parallel calls here.
            // val statsDeferred = async(Dispatchers.IO) { statsService.getStats(...) }

            // Waiting for all results
            val revenue = revenueDeferred.await()
            // val stats = statsDeferred.await()

            logger.info("📊 Dashboard data fetched successfully")

            Orchestration(
                revenue = revenue,
            )
        }
    }
}