package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.ActivityBooking
import com.wewiins.saas_api.interfaces.Dashboard
import com.wewiins.saas_api.interfaces.Revenue
import com.wewiins.saas_api.repositories.ActivityRepository
import com.wewiins.saas_api.repositories.BookingRepository
import com.wewiins.saas_api.repositories.StatisticRepository
import com.wewiins.saas_api.repositories.StripeRepository
import com.wewiins.saas_api.utils.ComparisonCalculator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val activityRepository: ActivityRepository,
    private val stripeRepository: StripeRepository,
    private val statisticRepository: StatisticRepository,
    private val bookingRepository: BookingRepository,
) {
    private val logger = LoggerFactory.getLogger(DashboardService::class.java)

    fun initializeDashboard(
        verifiedAccountDto: VerifiedAccountDto,
        startDate: Long,
        endDate: Long
    ): Dashboard? {
        logger.info("Initialize dashboard for period {} to {}", startDate, endDate)

        // Calculate the previous period
        val filterRangeDays = ComparisonCalculator.calculateDaysBetween(startDate, endDate)
        val periodDuration = endDate - startDate
        val previousEndDate = startDate - 1 // The day before the start of the current period
        val previousStartDate = previousEndDate - periodDuration

        return runBlocking {
            // Retrieve statistics for the current period
            val currentTotalRevenueDeferred = async(Dispatchers.IO) {
                getTotalRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentTotalBookingDeferred = async(Dispatchers.IO) {
                getTotalBookingByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentTotalVisitDeferred = async(Dispatchers.IO) {
                getTotalVisitByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentAverageScoreDeferred = async(Dispatchers.IO) {
                getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            // Retrieve statistics from the previous period
            val previousTotalRevenueDeferred = async(Dispatchers.IO) {
                getTotalRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousTotalBookingDeferred = async(Dispatchers.IO) {
                getTotalBookingByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousTotalVisitDeferred = async(Dispatchers.IO) {
                getTotalVisitByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousAverageScoreDeferred = async(Dispatchers.IO) {
                getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            // Retrieve the first 2 reservations
            val bookingsDeferred = async(Dispatchers.IO) {
                getBookingsByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                )
            }

            // Wait for all results
            val currentTotalRevenue = currentTotalRevenueDeferred.await()
            val currentTotalBooking = currentTotalBookingDeferred.await()
            val currentTotalVisit = currentTotalVisitDeferred.await()
            val currentAverageScore = currentAverageScoreDeferred.await()

            val previousTotalRevenue = previousTotalRevenueDeferred.await()
            val previousTotalBooking = previousTotalBookingDeferred.await()
            val previousTotalVisit = previousTotalVisitDeferred.await()
            val previousAverageScore = previousAverageScoreDeferred.await()

            val bookings = bookingsDeferred.await()

            // Compare statistics
            val revenueComparison = ComparisonCalculator.calculate(
                currentTotalRevenue.revenue,
                previousTotalRevenue.revenue
            )

            val bookingComparison = ComparisonCalculator.calculate(
                currentTotalBooking,
                previousTotalBooking
            )

            val visitComparison = ComparisonCalculator.calculate(
                currentTotalVisit,
                previousTotalVisit
            )

            val scoreComparison = ComparisonCalculator.calculate(
                currentAverageScore,
                previousAverageScore
            )

            Dashboard(
                totalRevenue = revenueComparison,
                totalBooking = bookingComparison,
                totalVisit = visitComparison,
                averageScore = scoreComparison,
                filterRangeDays = filterRangeDays,
                bookings = bookings,
                isRevenueCompletelyLoad = currentTotalRevenue.isComplete
            )
        }
    }

    fun getTotalRevenueByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Revenue {
        logger.info("Get TotalRevenueByPeriod")
        return runBlocking {
            stripeRepository.getRevenueByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getTotalBookingByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Int {
        logger.info("Get TotalBookingByPeriod")
        return runBlocking {
            bookingRepository.getBookingNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getTotalVisitByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Int {
        logger.info("Get TotalVisitByPeriod")
        return runBlocking {
            statisticRepository.getVisitNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getAverageScoreByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Double {
        logger.info("Get AverageScoreByPeriod")
        return runBlocking {
            activityRepository.getAverageScoreByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getBookingsByPeriod(
        connectedAccountId: String,
        startDate: Long,
    ): List<ActivityBooking> {
        logger.info("Get BookingsByPeriod")
        return runBlocking {
            bookingRepository.getBookingsByPeriod(connectedAccountId, startDate)
        }
    }
}