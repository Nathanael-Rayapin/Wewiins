package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Dashboard
import com.wewiins.saas_api.interfaces.DashboardStatsComparison
import com.wewiins.saas_api.utils.ComparisonCalculator
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
        verifiedAccountDto: VerifiedAccountDto,
        startDate: Long,
        endDate: Long
    ): Dashboard? {
        logger.info("Dashboard initialization started")

        return runBlocking {
            val revenueDeferred = async(Dispatchers.IO) {
                activityService.getRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val bookingNumberDeferred = async(Dispatchers.IO) {
                activityService.getBookingNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val visitNumberDeferred = async(Dispatchers.IO) {
                activityService.getVisitNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val averageScoreDeferred = async(Dispatchers.IO) {
                activityService.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val bookingDeferred = async(Dispatchers.IO) {
                activityService.getBookingsByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                )
            }

            val revenue = revenueDeferred.await()
            val bookingNumber = bookingNumberDeferred.await()
            val visitNumber = visitNumberDeferred.await()
            val averageScore = averageScoreDeferred.await()

            val bookings = bookingDeferred.await()

            logger.info("📊 Dashboard data fetched successfully")

            Dashboard(
                revenue = revenue,
                bookingNumber = bookingNumber,
                visitNumber = visitNumber,
                averageScore = averageScore,
                bookings = bookings,
            )
        }
    }

    fun initializeDashboardStatsComparison(
        verifiedAccountDto: VerifiedAccountDto,
        startDate: Long,
        endDate: Long
    ): DashboardStatsComparison? {
        logger.info("Dashboard stats comparison started for period {} to {}", startDate, endDate)

        // Calculer la période précédente
        val periodDays = ComparisonCalculator.calculateDaysBetween(startDate, endDate)
        val periodDuration = endDate - startDate
        val previousEndDate = startDate - 1 // La veille du début de la période actuelle
        val previousStartDate = previousEndDate - periodDuration

        logger.info("📅 Current period: {} days ({} to {})", periodDays, startDate, endDate)
        logger.info("📅 Previous period: {} days ({} to {})", periodDays, previousStartDate, previousEndDate)

        return runBlocking {
            // Récupérer les stats de la période actuelle en parallèle
            val currentRevenueDeferred = async(Dispatchers.IO) {
                activityService.getRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentBookingNumberDeferred = async(Dispatchers.IO) {
                activityService.getBookingNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentVisitNumberDeferred = async(Dispatchers.IO) {
                activityService.getVisitNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentAverageScoreDeferred = async(Dispatchers.IO) {
                activityService.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            // Récupérer les stats de la période précédente en parallèle
            val previousRevenueDeferred = async(Dispatchers.IO) {
                activityService.getRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousBookingNumberDeferred = async(Dispatchers.IO) {
                activityService.getBookingNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousVisitNumberDeferred = async(Dispatchers.IO) {
                activityService.getVisitNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousAverageScoreDeferred = async(Dispatchers.IO) {
                activityService.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            // Attendre tous les résultats
            val currentRevenue = currentRevenueDeferred.await()
            val currentBookingNumber = currentBookingNumberDeferred.await()
            val currentVisitNumber = currentVisitNumberDeferred.await()
            val currentAverageScore = currentAverageScoreDeferred.await()

            val previousRevenue = previousRevenueDeferred.await()
            val previousBookingNumber = previousBookingNumberDeferred.await()
            val previousVisitNumber = previousVisitNumberDeferred.await()
            val previousAverageScore = previousAverageScoreDeferred.await()

            // Calculer les comparaisons
            val revenueComparison = ComparisonCalculator.calculate(
                currentRevenue.revenue,
                previousRevenue.revenue
            )

            val bookingComparison = ComparisonCalculator.calculate(
                currentBookingNumber,
                previousBookingNumber
            )

            val visitComparison = ComparisonCalculator.calculate(
                currentVisitNumber,
                previousVisitNumber
            )

            val scoreComparison = ComparisonCalculator.calculate(
                currentAverageScore,
                previousAverageScore
            )

            DashboardStatsComparison(
                revenue = revenueComparison,
                bookingNumber = bookingComparison,
                visitNumber = visitComparison,
                averageScore = scoreComparison,
                periodDays = periodDays,
            )
        }
    }
}